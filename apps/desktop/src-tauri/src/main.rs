// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Manager, RunEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{SystemTray, SystemTrayEvent, Window, WindowBuilder, WindowEvent};
use tauri_plugin_positioner::{Position, WindowExt};

fn create_tray_window(app: &tauri::AppHandle) -> Result<Window, tauri::Error> {
    let window = WindowBuilder::new(app, "tray", tauri::WindowUrl::App("/tray".into()))
        .inner_size(300.0, 200.0)
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

#[tauri::command]
fn set_tray_title(app_handle: tauri::AppHandle, title: String) {
    if let Err(e) = app_handle.tray_handle().set_title(&title) {
        eprintln!("Failed to set tray title: {}", e);
    }
}

fn main() {
    // Create the tray menu
    let open_main = CustomMenuItem::new("show_main".to_string(), "Open");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(open_main).add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    #[allow(unused_mut)]
    let mut app = tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);

            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    println!("left click");

                    if let Some(tray) = app.get_window("tray") {
                        if !tray.is_visible().unwrap_or(false) {
                            let _ = tray.move_window(Position::TrayCenter);
                            let _ = tray.show();
                            let _ = tray.set_focus();
                        }
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "show_main" => {
                        if let Some(main_window) = app.get_window("main") {
                            let _ = main_window.show();
                            let _ = main_window.set_focus();
                        }
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                },
                _ => {}
            }
        })
        .setup(move |app| {
            // Create the tray window on startup
            create_tray_window(&app.handle())?;
            // app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_tray_title])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, e| match e {
        RunEvent::WindowEvent {
            label,
            event: WindowEvent::CloseRequested { api, .. },
            ..
        } => {
            if label == "main" {
                let app_handle = app_handle.clone();
                let window = app_handle.get_window(&label).unwrap();

                api.prevent_close();
                window.hide().unwrap();
            }
        }

        // Keep the event loop running even if all windows are closed
        // This allow us to catch system tray events when there is no window
        RunEvent::ExitRequested { api, .. } => {
            println!("exit requested");
            api.prevent_exit();
        }
        _ => {}
    })
}
