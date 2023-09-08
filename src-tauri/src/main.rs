// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::path::home_dir;

#[tauri::command]
fn get_user_dir() -> Result<String, String> {
  match home_dir() {
    Some(path) => Ok(path.to_str().unwrap().to_string()),
    None => Err("Could not get user directory".to_string()),
  }
}

#[tauri::command]
fn run_command(command: String) -> Result<String, String> {
  let output = std::process::Command::new("sh")
    .arg("-c")
    .arg(command)
    .output()
    .map_err(|e| e.to_string())?;

  let output_str = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
  Ok(output_str)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_user_dir, run_command])
    // other Tauri settings
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
