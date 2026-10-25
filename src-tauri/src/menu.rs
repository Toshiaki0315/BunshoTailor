use tauri::menu::{Menu, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Runtime};

/// メニューバーの表示名(日本語)
pub mod labels {
    pub const APP_NAME: &str = "文章仕立屋";
    pub const ABOUT: &str = "文章仕立屋について";
    pub const HIDE: &str = "文章仕立屋を隠す";
    pub const HIDE_OTHERS: &str = "ほかを隠す";
    pub const SHOW_ALL: &str = "すべてを表示";
    pub const QUIT: &str = "文章仕立屋を終了";
    pub const EDIT: &str = "編集";
    pub const UNDO: &str = "取り消す";
    pub const REDO: &str = "やり直す";
    pub const CUT: &str = "カット";
    pub const COPY: &str = "コピー";
    pub const PASTE: &str = "ペースト";
    pub const SELECT_ALL: &str = "すべてを選択";
    pub const WINDOW: &str = "ウインドウ";
    pub const MINIMIZE: &str = "しまう";
    pub const ZOOM: &str = "拡大/縮小";
    pub const CLOSE_WINDOW: &str = "ウインドウを閉じる";
}

/// 日本語表記のアプリケーションメニューを組み立てる。
pub fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    use labels::*;

    let app_menu = Submenu::with_items(
        app,
        APP_NAME,
        true,
        &[
            &PredefinedMenuItem::about(app, Some(ABOUT), None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::hide(app, Some(HIDE))?,
            &PredefinedMenuItem::hide_others(app, Some(HIDE_OTHERS))?,
            &PredefinedMenuItem::show_all(app, Some(SHOW_ALL))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, Some(QUIT))?,
        ],
    )?;

    let edit_menu = Submenu::with_items(
        app,
        EDIT,
        true,
        &[
            &PredefinedMenuItem::undo(app, Some(UNDO))?,
            &PredefinedMenuItem::redo(app, Some(REDO))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, Some(CUT))?,
            &PredefinedMenuItem::copy(app, Some(COPY))?,
            &PredefinedMenuItem::paste(app, Some(PASTE))?,
            &PredefinedMenuItem::select_all(app, Some(SELECT_ALL))?,
        ],
    )?;

    let window_menu = Submenu::with_items(
        app,
        WINDOW,
        true,
        &[
            &PredefinedMenuItem::minimize(app, Some(MINIMIZE))?,
            &PredefinedMenuItem::maximize(app, Some(ZOOM))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::close_window(app, Some(CLOSE_WINDOW))?,
        ],
    )?;

    Menu::with_items(app, &[&app_menu, &edit_menu, &window_menu])
}

#[cfg(test)]
mod tests {
    use super::labels::*;

    #[test]
    fn menu_labels_are_japanese() {
        let japanese = [
            ABOUT, HIDE, HIDE_OTHERS, SHOW_ALL, QUIT, EDIT, UNDO, REDO, CUT, COPY, PASTE,
            SELECT_ALL, WINDOW, MINIMIZE, ZOOM, CLOSE_WINDOW,
        ];
        for label in japanese {
            assert!(
                label.chars().any(|c| !c.is_ascii() || label == APP_NAME),
                "ASCIIのみのラベル: {label}"
            );
        }
    }
}
