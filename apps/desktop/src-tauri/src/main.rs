// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;
use tauri::{Manager, SystemTray, SystemTrayEvent, WindowBuilder, WindowEvent};
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
                    println!("left click");

                    if let Some(tray) = app.get_window("tray") {
                        if tray.is_visible().is_ok_and(|is_visible| is_visible) {
                            let _ = tray.hide();
                        } else {
                            let _ = tray.set_focus();
                        }
                    } else {
                        let window: Result<tauri::Window, tauri::Error> =
                            WindowBuilder::new(app, "tray", tauri::WindowUrl::App("/tray".into()))
                                .inner_size(200 as f64, 200 as f64)
                                .decorations(false)
                                .focused(true)
                                .always_on_top(true)
                                .build();

                        if let Ok(window) = window {
                            let window_clone = window.clone();
                            window.move_window(Position::TrayCenter).unwrap();
                            window.show().unwrap();
                            window.set_focus().unwrap();

                            window.on_window_event(move |event| {
                                if let WindowEvent::Focused(focused) = event {
                                    if !focused {
                                        let _ = window_clone.hide();
                                    }
                                }
                            });
                        }
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
