// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager, SystemTray, SystemTrayEvent, CustomMenuItem, SystemTrayMenu, WindowUrl,
};
use std::time::Duration;
use tokio::time::interval;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                if id.as_str() == "quit" {
                    std::process::exit(0);
                }
            }
            SystemTrayEvent::LeftClick { .. } => {
                if let Some(window) = app.get_window("tray_dropdown") {
                    if window.is_visible().unwrap_or(false) {
                        window.hide().unwrap();
                    } else {
                        // Position the window near the tray icon
                        window.set_position(tauri::PhysicalPosition::new(100, 100)).unwrap(); // Adjust as needed
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                } else {
                    eprintln!("Tray dropdown window not found");
                }
            }
            _ => {}
        })
        .setup(move |app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let mut ticker = interval(Duration::from_secs(60)); // Every minute
                loop {
                    ticker.tick().await;
                    println!("check-in");
                    if let Err(e) = app_handle.emit_all("check-in", "Time to check in!") {
                        eprintln!("Failed to emit check-in event: {}", e);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
