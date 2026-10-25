# 文章仕立屋

macOS の `fm` コマンド(Apple Foundation Models CLI、ローカルLLM)を使って、入力した文章を **整形・要約・リライト・機密情報の確認・翻訳/校正** するデスクトップアプリです。処理はすべて自分のMacの中で完結し、文章が外部に送信されることはありません。

チャットではなく、「文章を貼り付けて、処理を選んで、結果をコピーする」単発処理に向けた作りです。

## 目次

- [使い方](#使い方)
- [動作環境](#動作環境)
- [インストール](#インストール)
- [開発環境の構築](#開発環境の構築)
- [ビルド](#ビルド)
- [テスト](#テスト)
- [プロジェクト構成](#プロジェクト構成)
- [仕組み](#仕組み)
- [開発方針](#開発方針-tdd)
- [トラブルシューティング](#トラブルシューティング)

## 使い方

1. 上のタブで処理の種類を選びます。
2. その下のボタンで、具体的な処理内容を選びます。
3. 左の「入力」に文章を入力または貼り付けます。
4. 「実行」ボタンを押します(**⌘+Enter** でも実行できます)。
5. 右の「結果」に出力されます。右上のコピーアイコンで、結果をクリップボードにコピーできます。

| タブ | 処理内容 |
|---|---|
| 構造変換・整形 | Markdownのリストに整理 / ログ・コードの整形 / Markdownの表に変換 |
| 要約・リライト | 要約 / 箇条書きで要約 / ビジネスメール調 / カジュアルに / やさしい表現に |
| 機密情報の確認 | 機密・個人情報を検出 / 機密・個人情報をマスキング |
| 翻訳・校正 | 日本語 → 英語 / 英語 → 日本語 / 校正 |

その他の操作:

- **クリア**: 入力欄と結果欄を空にします。
- **Markdownで表示**: 結果をMarkdownとして整形表示します(初期状態は、そのままの文字列で表示します)。コピーされるのは、常に元の文字列です。
- 日本語入力の変換確定のEnterでは実行されません。

## 動作環境

- Apple Silicon の macOS(`fm` コマンドが使える環境)
- `fm` のライセンスに同意済みであること

### `fm` ライセンスへの同意(初回のみ)

初めて使うときは、ターミナルで次のコマンドを実行して、内容を確認のうえ同意してください(管理者パスワードが必要です)。

```bash
sudo fm license
```

未同意のまま実行すると、アプリが同じ案内のダイアログを表示します。アプリが自動で同意することはありません。

## インストール

[Releases](https://github.com/Toshiaki0315/BunshoTailor/releases) から `.dmg` をダウンロードし、開いて「文章仕立屋」を「アプリケーション」フォルダにドラッグします。

このアプリは **アドホック署名**(Apple の開発者証明書なし)です。初回は Gatekeeper の警告が出るので、次のどちらかで開いてください。

- Finder で右クリックして「開く」を選ぶ
- 隔離属性を外す

  ```bash
  xattr -dr com.apple.quarantine /Applications/文章仕立屋.app
  ```

## 開発環境の構築

### 必要なもの

| ツール | 備考 |
|---|---|
| macOS | `fm` コマンドを使うため |
| Xcode Command Line Tools | `xcode-select --install` |
| Node.js | 20 以上(CIは 20 を使用) |
| Rust | [rustup](https://rustup.rs/) で導入(stable) |
| `make` | Command Line Tools に含まれます |

### 手順

```bash
git clone https://github.com/Toshiaki0315/BunshoTailor.git
cd BunshoTailor
npm install
```

依存パッケージは `npm install`(または、後述の `make` コマンドの初回実行)で導入されます。Rust の依存は、初回のビルド時に自動で取得されます。

### 開発モードで起動

```bash
make dev
```

Vite の開発サーバ(`http://localhost:1420`)とアプリが起動します。フロントエンドの変更は、すぐに画面へ反映されます。

## ビルド

| コマンド | 内容 | 出力先 |
|---|---|---|
| `make dev` | 開発モードで起動 | なし |
| `make app` | `文章仕立屋.app` をビルド | `src-tauri/target/release/bundle/macos/` |
| `make dmg` | 配布用の `.dmg` をビルド | `src-tauri/target/release/bundle/dmg/` |

- 署名は **アドホック署名** です(`src-tauri/tauri.conf.json` の `bundle.macOS.signingIdentity` が `"-"`)。
- `make app` / `make dmg` は、実行ファイルにビルドしたMacのホームディレクトリのパスが埋め込まれないよう、`--remap-path-prefix` を付けてビルドします。
- 初回のビルドは Rust の依存をコンパイルするため、数分かかります。
- `make dmg` を実行すると、同じ場所の `.app` は片付けられます。両方が必要なときは、`make dmg` のあとに `make app` を実行してください。

### 署名の確認

```bash
codesign -dv --verbose=2 "src-tauri/target/release/bundle/macos/文章仕立屋.app"
codesign --verify --deep --strict "src-tauri/target/release/bundle/macos/文章仕立屋.app"
```

`Signature=adhoc` と表示され、2つ目のコマンドがエラーなく終われば成功です。

### リリースの手順

1. `package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.json` の `version` を揃えて更新します。
2. `make dmg` で `.dmg` を作ります。
3. GitHub の Releases で、タグ(例: `v0.1.0`)を付けて `.dmg` を添付します。

### アイコンの作り直し

アイコンは `scripts/make_icon.py`(Python と Pillow が必要)で生成します。

```bash
python3 scripts/make_icon.py assets/icon.png
npx tauri icon assets/icon.png
rm -rf src-tauri/icons/android src-tauri/icons/ios
```

## テスト

```bash
npm run test:run                  # フロントエンド (Vitest)
npx tsc --noEmit                  # 型チェック
cd src-tauri && cargo test        # バックエンド (cargo test)
```

CI(GitHub Actions)は、`main` への push とプルリクエストで、フロントエンドとバックエンドのテストを macOS 上で実行します。

`fm` を実際に呼ぶテストは、`fm` の有無やライセンス状態に左右されないよう、成功・失敗のどちらでも通る作りにしてあります。実際の処理結果は、`make dev` で確認してください。

## プロジェクト構成

```
.
├── src/                    フロントエンド (React + TypeScript)
│   ├── App.tsx             画面本体
│   ├── tasks.ts            処理の種類と、fm への指示文(ここを直すと処理内容を変えられます)
│   ├── fmError.ts          バックエンドのエラー種別の解釈
│   ├── shortcut.ts         ⌘+Enter の判定(IME変換中は除く)
│   ├── clipboard.ts        クリップボードへのコピー
│   ├── CopyButton.tsx      コピーアイコン
│   ├── runState.ts         実行状態(結果・エラー・実行中)の遷移
│   ├── MarkdownView.tsx    Markdown表示(生HTML・画像・リンクは描画しない)
│   ├── csp.test.ts         CSP設定のテスト
│   └── *.test.ts(x)        テスト
├── src-tauri/              バックエンド (Rust + Tauri v2)
│   ├── src/main.rs         コマンド登録
│   ├── src/fm_client.rs    fm コマンドの呼び出しとエラー処理
│   ├── src/menu.rs         日本語のメニューバー
│   ├── tauri.conf.json     アプリ名・バンドルID・署名・CSPの設定
│   └── icons/              アプリアイコン
├── assets/icon.png         アイコンの元画像
├── scripts/make_icon.py    アイコン生成スクリプト
├── Makefile                dev / app / dmg
└── .github/workflows/      CI
```

## 仕組み

1. 画面で選んだ処理内容に対応する **指示文** (`src/tasks.ts`)と、入力した文章を、Tauri のコマンド `run_fm_task` でバックエンドへ渡します。
2. バックエンドは、次のように `fm` を呼び出します。文章は **標準入力** で渡すため、長文や `-` で始まる文章でも安全で、シェルも介しません。

   ```bash
   fm respond --instructions "<指示文>"   # 文章は標準入力
   ```

3. 標準出力を結果として画面に返します。

### エラー処理

バックエンドは、エラーを種別付きで画面に返します。

| 種別 | 状況 | 画面の動作 |
|---|---|---|
| `license_not_agreed` | `fm` のライセンスに未同意 | `sudo fm license` を案内するダイアログを表示 |
| `not_found` | `fm` が見つからない | エラーメッセージを表示 |
| `timeout` | 120秒以内に処理が終わらない | `fm` を強制終了し、中断した旨を表示 |
| `other` | 非0終了など | 終了コードと標準エラー出力(色指定の制御文字は除去)を表示 |

実行を始めた時点で前回の結果は消えるため、失敗したときに古い結果が残って、誤ってコピーされることはありません。

制限時間は `src-tauri/src/fm_client.rs` の `FM_TIMEOUT` で変更できます。

### 外部への通信の遮断

文章を外部に送らないという約束を守るため、画面側でも外部への通信を防いでいます。

- **CSP(Content Security Policy)**: `src-tauri/tauri.conf.json` の `app.security.csp` で、読み込みと通信をアプリ自身に限定しています。許可しているのは、バックエンドとの通信(`ipc:` と `http://ipc.localhost`)だけです。開発モード用の `devCsp` では、Vite の画面自動更新のために `ws://localhost:1420` も許可しています。
- **Markdown表示**: 結果に含まれる画像は読み込まず、「[画像: 代替テキスト]」と表示します。リンクは押せない文字として「リンク文字 (URL)」の形で表示するので、アプリの画面が外部サイトに切り替わることはありません。生のHTMLも描画しません。

CSP の設定値は `src/csp.test.ts` で、外部ホストを許可していないことをテストしています。CSP を変更するときは、このテストも通ることを確認してください。

### 注意点

- `fm respond` は1回ごとに独立した呼び出しです。会話の文脈は引き継がれません。
- 「ライセンス未同意」の判定は、`fm` の標準エラー出力の文言(`have not agreed`)に依存しています。`fm` 側で文言が変わると、検知できなくなる可能性があります。
- 指示文を変えたい場合は、`src/tasks.ts` を編集してください(出力ルールは `OUTPUT_RULE` に共通化しています)。

## 開発方針 (TDD)

本プロジェクトはテスト駆動開発(TDD)を採用しています。テストを先に書き、そのあとに実装します。ネストは浅く(早期リターン)保ち、Rust ではむやみにクローンしない方針です。

Claude や Cursor などの AI エージェントに開発を依頼する際は、`.claude/rules.md`(または `.agent/rules.md`)を読み込ませてください。

### 技術スタック

- フロントエンド: TypeScript, React, Vite
- バックエンド: Rust, Tauri v2
- テスト: Vitest (フロントエンド), cargo test (バックエンド)

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| 「ライセンスに未同意」のダイアログが出る | ターミナルで `sudo fm license` を実行して同意し、もう一度実行します |
| 「`fm` コマンドが見つかりません」 | `which fm` で場所を確認します。通常は `/usr/bin/fm` です。macOS のバージョンが `fm` に対応しているか確認してください |
| 開いたときに「開発元を確認できません」と出る | アドホック署名のためです。[インストール](#インストール)の手順で開いてください |
| `make dev` で「port 1420 is already in use」 | 別の開発サーバが動いています。そのプロセスを終了してください |
| ログに `TSM AdjustCapsLockLEDForKeyTransitionHandling` などが出る | macOS の日本語入力まわりの既知のログで、動作には影響しません |
| 「120秒以内に終わらなかったため中断しました」 | 入力が長すぎる可能性があります。文章を分けて実行してください |
| 初回の `make app` / `make dmg` が遅い | Rust の依存をコンパイルしているためです。2回目以降は速くなります |
