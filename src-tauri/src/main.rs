// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod fm_client;
mod menu;

#[tauri::command]
async fn run_fm_task(instructions: String, text: String) -> Result<String, fm_client::FmError> {
    fm_client::execute_task(&instructions, &text)
}

fn main() {
    tauri::Builder::default()
        .menu(|app| menu::build(app))
        .invoke_handler(tauri::generate_handler![run_fm_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
