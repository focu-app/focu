// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::fs::Permissions;
use std::os::unix::fs::PermissionsExt;
use std::path::PathBuf;
use std::process::Command;

use tauri::{CustomMenuItem, Manager, RunEvent, SystemTrayMenu, TitleBarStyle, WindowUrl};
use tauri::{SystemTray, SystemTrayEvent, Window, WindowBuilder, WindowEvent};
use tauri_plugin_positioner::{Position, WindowExt};

use cocoa::appkit::{NSApp, NSImage};
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};

pub fn start_watchdog(parent_pid: u32, ollama_pid: u32) -> Result<(), std::io::Error> {
    println!(
        "Starting watchdog with parent pid: {} and ollama pid: {}",
        parent_pid, ollama_pid
    );
    let watchdog_script = format!(
        r#"
        #!/bin/sh
        parent_pid={}
        ollama_pid={}
        while true; do
            if ! ps -p $parent_pid > /dev/null; then
                kill $ollama_pid
                exit 0
            fi
            sleep 5
        done
    "#,
        parent_pid, ollama_pid
    );

    Command::new("sh").arg("-c").arg(watchdog_script).spawn()?;

    Ok(())
}

fn create_tray_window(app: &tauri::AppHandle) -> Result<Window, tauri::Error> {
    let window = WindowBuilder::new(app, "tray", tauri::WindowUrl::App("/tray".into()))
        .inner_size(300.0, 250.0)
        .decorations(true)
        .resizable(false)
        .closable(false)
        .minimizable(false)
        .focused(true)
        .always_on_top(true)
        .hidden_title(true)
        .title_bar_style(TitleBarStyle::Overlay)
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
fn start_ollama() -> Result<u32, String> {
    let ollama_path = tauri::utils::platform::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or_else(|| "Failed to get parent directory".to_string())?
        .join("ollama-darwin-0.3.14");

    // Set executable permissions (rwxr-xr-x)
    std::fs::set_permissions(&ollama_path, Permissions::from_mode(0o755))
        .map_err(|e| e.to_string())?;

    match Command::new(&ollama_path).arg("serve").spawn() {
        Ok(child) => Ok(child.id()),
        Err(e) => Err(format!("Failed to start Ollama: {}", e)),
    }
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

fn get_app_config_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path_resolver()
        .app_config_dir()
        .expect("Failed to get config directory")
}

fn get_onboarding_file_path(app: &tauri::AppHandle) -> PathBuf {
    println!(
        "get_app_config_dir: {}",
        get_app_config_dir(app).to_string_lossy()
    );
    get_app_config_dir(app).join("onboarding_completed")
}

fn is_onboarding_completed(app: &tauri::AppHandle) -> bool {
    get_onboarding_file_path(app).exists()
}

fn mark_onboarding_completed(app: &tauri::AppHandle) -> Result<(), String> {
    let config_dir = get_app_config_dir(app);
    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    fs::write(get_onboarding_file_path(app), "").map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn complete_onboarding(app_handle: tauri::AppHandle) -> Result<(), String> {
    mark_onboarding_completed(&app_handle)?;

    // Close onboarding window and show main window
    if let Some(onboarding_window) = app_handle.get_window("onboarding") {
        onboarding_window.close().map_err(|e| e.to_string())?;
    }

    if let Some(main_window) = app_handle.get_window("main") {
        main_window.show().map_err(|e| e.to_string())?;
        set_dock_icon_visibility(app_handle, true);
    }

    Ok(())
}

fn main() {
    // Create the tray menu
    let open_main = CustomMenuItem::new("show_main".to_string(), "Open");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(open_main).add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    let pid = std::process::id();
    if let Err(e) = start_watchdog(pid, pid) {
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

            // Check if onboarding is needed
            if !is_onboarding_completed(&app.handle()) {
                // hide the main window
                if let Some(main_window) = app.get_window("main") {
                    main_window.hide().unwrap();
                }

                WindowBuilder::new(
                    &app.handle(),
                    "onboarding",
                    WindowUrl::App("/onboarding".into()),
                )
                .title("Welcome")
                .inner_size(800.0, 600.0)
                .center()
                .build()?;
            } else {
                if let Some(main_window) = app.get_window("main") {
                    main_window.show().unwrap();
                    set_dock_icon_visibility(app.app_handle(), true);
                }
            }

            // Start Ollama
            match start_ollama() {
                Ok(ollama_pid) => {
                    println!("Ollama started with PID: {}", ollama_pid);
                    if let Err(e) = start_watchdog(pid, ollama_pid) {
                        eprintln!("Failed to start watchdog: {}", e);
                    }
                }
                Err(error) => eprintln!("Failed to start Ollama: {}", error),
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_tray_title,
            set_dock_icon_visibility,
            start_ollama,
            complete_onboarding
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
                println!("main window close requested");
                let app_handle = app_handle.clone();
                let window = app_handle.get_window(&label).unwrap();

                api.prevent_close();
                window.hide().unwrap();
                set_dock_icon_visibility(app_handle, false);
            }
        }
        _ => {}
    })
}
