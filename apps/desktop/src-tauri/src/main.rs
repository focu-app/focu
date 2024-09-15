// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

use tauri::{CustomMenuItem, Manager, RunEvent, SystemTrayMenu};
use tauri::{SystemTray, SystemTrayEvent, Window, WindowBuilder, WindowEvent};
use tauri_plugin_positioner::{Position, WindowExt};

use cocoa::appkit::{NSApp, NSImage};
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};

pub fn start_watchdog(parent_pid: u32) -> Result<(), std::io::Error> {
    println!("Starting watchdog with parent pid: {}", parent_pid);
    let watchdog_script = format!(
        r#"
        #!/bin/sh
        parent_pid={}
        while true; do
            if ! ps -p $parent_pid > /dev/null; then
                pkill ollama
                exit 0
            fi
            sleep 5
        done
    "#,
        parent_pid
    );

    Command::new("sh").arg("-c").arg(watchdog_script).spawn()?;

    Ok(())
}

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

fn create_settings_window(app: &tauri::AppHandle) -> Result<Window, tauri::Error> {
    let window = WindowBuilder::new(app, "settings", tauri::WindowUrl::App("/settings".into()))
        .inner_size(600.0, 600.0)
        .title("Settings")
        .maximizable(false)
        .minimizable(false)
        .decorations(true)
        .focused(true)
        .always_on_top(true)
        .visible(false)
        .center()
        .build()?;

    Ok(window)
}

fn start_ollama() -> Result<std::process::Child, std::io::Error> {
    Command::new(
        tauri::utils::platform::current_exe()?
            .parent()
            .unwrap()
            .join("ollama-darwin"),
    )
    .arg("serve")
    .spawn()
}

#[tauri::command]
fn set_tray_title(app_handle: tauri::AppHandle, title: String) {
    if let Err(e) = app_handle.tray_handle().set_title(&title) {
        eprintln!("Failed to set tray title: {}", e);
    }
}

fn change_icon(app_handle: &tauri::AppHandle) -> bool {
    unsafe {
        let icon_path = app_handle
            .path_resolver()
            .resolve_resource("icons/icon.icns")
            .expect("Failed to resolve icon path");

        println!("icon_path: {}", icon_path.to_string_lossy());

        let ns_string = NSString::alloc(nil).init_str(&icon_path.to_string_lossy());
        let icon: id = NSImage::alloc(nil).initWithContentsOfFile_(ns_string);

        if icon == nil {
            println!("Failed to load icon image");
            return false;
        }

        let app: id = NSApp();
        let _: () = msg_send![app, setApplicationIconImage: icon];

        let dock_tile: id = msg_send![app, dockTile];
        let _: () = msg_send![dock_tile, setShowsApplicationBadge: true];
        let _: () = msg_send![dock_tile, display];

        true
    }
}

#[tauri::command]
fn set_dock_icon_visibility(app_handle: tauri::AppHandle, visible: bool) {
    unsafe {
        let app = NSApp();
        if visible {
            let success = change_icon(&app_handle);
            if !success {
                println!("Failed to change icon");
            }
            let _: () = msg_send![app, setActivationPolicy: 0]; // NSApplicationActivationPolicyRegular
            let _: () = msg_send![app, activateIgnoringOtherApps: true];
        } else {
            let _: () = msg_send![app, setActivationPolicy: 1]; // NSApplicationActivationPolicyAccessory
        }

        // Force update of the dock
        let dock_tile: id = msg_send![app, dockTile];
        let _: () = msg_send![dock_tile, display];
    }
}

fn main() {
    // Create the tray menu
    let open_main = CustomMenuItem::new("show_main".to_string(), "Open");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(open_main).add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    let pid = std::process::id();
    if let Err(e) = start_watchdog(pid) {
        eprintln!("Failed to start watchdog: {}", e);
    }

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
                        } else {
                            let _ = tray.hide();
                        }
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "show_main" => {
                        if let Some(main_window) = app.get_window("main") {
                            let _ = main_window.show();
                            let _ = main_window.set_focus();
                            set_dock_icon_visibility(app.app_handle(), true);
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
            create_tray_window(&app.handle())?;
            create_settings_window(&app.handle())?;

            // Start Ollama
            match start_ollama() {
                Ok(child) => {
                    println!("Ollama started with PID: {}", child.id());
                    // You might want to store the child process somewhere to manage it later
                }
                Err(e) => eprintln!("Failed to start Ollama: {}", e),
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_tray_title,
            set_dock_icon_visibility
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    // app.set_activation_policy(tauri::ActivationPolicy::Accessory);
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
                set_dock_icon_visibility(app_handle, false);
            }
            if label == "settings" {
                let app_handle = app_handle.clone();
                let window = app_handle.get_window(&label).unwrap();

                api.prevent_close();
                window.hide().unwrap();
            }
        }
        _ => {}
    })
}
