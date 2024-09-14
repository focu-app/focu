// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;
use tauri::{Manager, SystemTray, SystemTrayEvent};
use tauri_plugin_positioner::{Position, WindowExt};
use tokio::time::interval;

fn main() {
    let system_tray = SystemTray::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);

            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    if let Some(window) = app.get_window("tray_dropdown") {
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                        } else {
                            window.move_window(Position::TrayCenter).unwrap();
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    } else {
                        eprintln!("Tray dropdown window not found");
                    }
                }
                _ => {}
            }
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
