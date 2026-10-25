use serde::Serialize;
use std::io::ErrorKind;
use std::io::Write;
use std::process::{Command, Output, Stdio};

const FM_PROGRAM: &str = "fm";
/// プロンプトに応答させるサブコマンド(`fm respond <prompt>`)
const FM_SUBCOMMAND: &str = "respond";
/// ライセンス未同意時に `fm` が stderr に出す文言の一部(大文字小文字は無視して比較)
const LICENSE_MARKER: &str = "have not agreed";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum FmErrorKind {
    /// `fm` のライセンスに未同意(`sudo fm license` が必要)
    LicenseNotAgreed,
    /// `fm` コマンドが見つからない
    NotFound,
    Other,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct FmError {
    pub kind: FmErrorKind,
    pub message: String,
}

impl FmError {
    fn new(kind: FmErrorKind, message: String) -> Self {
        Self { kind, message }
    }
}

fn fm_task_args(instructions: &str) -> Vec<&str> {
    vec![FM_SUBCOMMAND, "--instructions", instructions]
}

/// `instructions`(処理内容の指示)に従って `text` を処理し、結果(標準出力)を返す。
/// 本文は標準入力で渡すため、長文や `-` で始まる文字列でも安全。
pub fn execute_task(instructions: &str, text: &str) -> Result<String, FmError> {
    run_command(FM_PROGRAM, &fm_task_args(instructions), Some(text))
}

/// ANSIエスケープシーケンス(色指定など)を取り除く
fn strip_ansi(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut chars = text.chars().peekable();
    while let Some(c) = chars.next() {
        if c != '\u{1b}' {
            out.push(c);
            continue;
        }
        if chars.peek() != Some(&'[') {
            continue;
        }
        chars.next();
        // CSI は 0x40..=0x7E の終端文字まで
        for t in chars.by_ref() {
            if ('@'..='~').contains(&t) {
                break;
            }
        }
    }
    out
}

/// `program` を `prompt` のみを引数として実行する(テスト専用のヘルパー)。
#[cfg(test)]
fn run_program(program: &str, prompt: &str) -> Result<String, FmError> {
    run_program_with_args(program, &[prompt])
}

fn run_program_with_args(program: &str, args: &[&str]) -> Result<String, FmError> {
    run_command(program, args, None)
}

/// `program` を実行する。`stdin` があれば標準入力へ渡す。
fn run_command(program: &str, args: &[&str], stdin: Option<&str>) -> Result<String, FmError> {
    let mut child = Command::new(program)
        .args(args)
        .stdin(if stdin.is_some() { Stdio::piped() } else { Stdio::null() })
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| spawn_error(program, &e))?;

    // 巨大な入力でもパイプが詰まらないよう、別スレッドで書き込む。
    // 相手が先に終了した場合の書き込みエラー(EPIPE)は無視する。
    let writer = stdin.zip(child.stdin.take()).map(|(text, mut pipe)| {
        let bytes = text.as_bytes().to_vec();
        std::thread::spawn(move || {
            let _ = pipe.write_all(&bytes);
        })
    });

    let output = child
        .wait_with_output()
        .map_err(|e| spawn_error(program, &e))?;
    if let Some(handle) = writer {
        let _ = handle.join();
    }

    if !output.status.success() {
        return Err(failure_error(program, &output));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim_end().to_owned())
}

fn spawn_error(program: &str, err: &std::io::Error) -> FmError {
    if err.kind() == ErrorKind::NotFound {
        return FmError::new(
            FmErrorKind::NotFound,
            format!("`{program}` コマンドが見つかりません。インストールとPATHを確認してください"),
        );
    }
    FmError::new(FmErrorKind::Other, format!("`{program}` の起動に失敗しました: {err}"))
}

fn failure_error(program: &str, output: &Output) -> FmError {
    let stderr = strip_ansi(&String::from_utf8_lossy(&output.stderr));
    let stderr = stderr.trim();
    if stderr.to_lowercase().contains(LICENSE_MARKER) {
        return FmError::new(
            FmErrorKind::LicenseNotAgreed,
            format!("`{program}` のライセンスに未同意です"),
        );
    }
    let code = output
        .status
        .code()
        .map_or_else(|| "シグナルにより終了".to_owned(), |c| format!("終了コード {c}"));
    let message = if stderr.is_empty() {
        format!("`{program}` がエラー終了しました ({code})")
    } else {
        format!("`{program}` がエラー終了しました ({code}): {stderr}")
    };
    FmError::new(FmErrorKind::Other, message)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn returns_stdout_on_success() {
        // `echo` は引数をそのまま標準出力へ出す
        let result = run_program("echo", "こんにちは");
        assert_eq!(result, Ok("こんにちは".to_owned()));
    }

    #[test]
    fn trims_trailing_newline_only() {
        let result = run_program("echo", "  a b  ");
        assert_eq!(result, Ok("  a b".to_owned()));
    }

    #[test]
    fn passes_prompt_as_single_argument() {
        // シェルを介さないため、メタ文字は展開されない
        let result = run_program("echo", "$HOME; ls | cat");
        assert_eq!(result, Ok("$HOME; ls | cat".to_owned()));
    }

    #[test]
    fn missing_command_returns_not_found_error() {
        let err = run_program("no-such-command-xyz", "hi").unwrap_err();
        assert_eq!(err.kind, FmErrorKind::NotFound);
        assert!(err.message.contains("見つかりません"), "unexpected: {}", err.message);
        assert!(err.message.contains("no-such-command-xyz"));
    }

    #[test]
    fn non_zero_exit_returns_error_with_code() {
        let err = run_program("false", "hi").unwrap_err();
        assert_eq!(err.kind, FmErrorKind::Other);
        assert!(err.message.contains("エラー終了"), "unexpected: {}", err.message);
        assert!(err.message.contains("終了コード 1"), "unexpected: {}", err.message);
    }

    #[test]
    fn non_zero_exit_includes_stderr() {
        // `ls` に存在しないパスを渡すと stderr にメッセージを出して非0終了する
        let err = run_program("ls", "/bunsho/no/such/path").unwrap_err();
        assert!(err.message.contains("No such file"), "unexpected: {}", err.message);
    }

    #[test]
    fn spawn_error_other_kind_is_reported() {
        let io_err = std::io::Error::new(ErrorKind::PermissionDenied, "denied");
        let err = spawn_error("fm", &io_err);
        assert_eq!(err.kind, FmErrorKind::Other);
        assert!(err.message.contains("起動に失敗"));
        assert!(err.message.contains("denied"));
    }

    #[test]
    fn license_message_on_stderr_is_detected() {
        // 実際の `fm` と同様に stderr へ出力して非0終了する偽コマンド
        let script = "echo 'YOU HAVE NOT AGREED TO THE TERMS' >&2; exit 69";
        let err = run_program_with_args("sh", &["-c", script]).unwrap_err();
        assert_eq!(err.kind, FmErrorKind::LicenseNotAgreed);
    }

    #[test]
    fn license_error_serializes_as_snake_case_kind() {
        let err = FmError::new(FmErrorKind::LicenseNotAgreed, "m".to_owned());
        let json = serde_json::to_string(&err).unwrap();
        assert_eq!(json, r#"{"kind":"license_not_agreed","message":"m"}"#);
    }

    #[test]
    fn stdin_is_passed_to_the_command() {
        let result = run_command("cat", &[], Some("複数行\n- 先頭がハイフン"));
        assert_eq!(result, Ok("複数行\n- 先頭がハイフン".to_owned()));
    }

    #[test]
    fn large_stdin_does_not_deadlock() {
        let input = "あ".repeat(500_000);
        let result = run_command("cat", &[], Some(&input));
        assert_eq!(result, Ok(input));
    }

    #[test]
    fn stdin_with_missing_command_returns_not_found() {
        let err = run_command("no-such-command-xyz", &[], Some("x")).unwrap_err();
        assert_eq!(err.kind, FmErrorKind::NotFound);
    }

    #[test]
    fn command_that_ignores_stdin_still_succeeds() {
        // stdinを読まずに終了してもパイプ切断(EPIPE)で失敗しない
        let input = "x".repeat(1_000_000);
        let result = run_command("echo", &["ok"], Some(&input));
        assert_eq!(result, Ok("ok".to_owned()));
    }

    #[test]
    fn execute_task_builds_fm_arguments() {
        assert_eq!(
            fm_task_args("指示"),
            vec!["respond", "--instructions", "指示"]
        );
    }

    #[test]
    fn strip_ansi_removes_color_codes() {
        let colored = "\u{1b}[38;2;255;107;128mError: x\u{1b}[0m";
        assert_eq!(strip_ansi(colored), "Error: x");
    }

    #[test]
    fn strip_ansi_keeps_plain_text() {
        assert_eq!(strip_ansi("こんにちは\nabc"), "こんにちは\nabc");
    }

    #[test]
    fn stderr_in_error_message_has_no_escape_codes() {
        let script = "printf '\\033[31mbad\\033[0m' >&2; exit 1";
        let err = run_program_with_args("sh", &["-c", script]).unwrap_err();
        assert!(!err.message.contains('\u{1b}'), "unexpected: {}", err.message);
        assert!(err.message.contains("bad"));
    }

    #[test]
    fn execute_task_uses_fm_without_panicking() {
        // 実環境の `fm` の有無・ライセンス状態に依存せず、Ok/Err いずれかを返すこと
        let _ = execute_task("そのまま返す", "ping");
    }
}
