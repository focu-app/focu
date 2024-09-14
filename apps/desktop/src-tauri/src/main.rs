// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;
use tauri::Window;
use tauri::{Manager, SystemTray, SystemTrayEvent, WindowBuilder, WindowEvent};
use tauri_plugin_positioner::{Position, WindowExt};
use tokio::time::interval;

fn create_tray_window(app: &tauri::AppHandle) -> Result<Window, tauri::Error> {
    let window = WindowBuilder::new(app, "tray", tauri::WindowUrl::App("/tray".into()))
        .inner_size(200.0, 200.0)
        .decorations(false)
        .focused(true)
        .always_on_top(true)
        .visible(false) // Start hidden
        .build()?;

    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::Focused(focused) = event {
            if !focused {
                let _ = window_clone.hide();
            }
        }
    });

    Ok(window)
}

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
                        if tray.is_visible().unwrap_or(false) {
                            let _ = tray.hide();
                        } else {
                            let _ = tray.move_window(Position::TrayCenter);
                            let _ = tray.show();
                            let _ = tray.set_focus();
                        }
                    }
                }
                _ => {}
            }
        })
        .setup(move |app| {
            let app_handle = app.handle().clone();

            // Create the tray window on startup
            create_tray_window(&app_handle)?;

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
