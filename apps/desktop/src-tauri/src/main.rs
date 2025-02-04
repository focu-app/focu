// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::fs::Permissions;
use std::os::unix::fs::PermissionsExt;
use std::path::PathBuf;
use std::process::Command;

use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconEvent};
use tauri::{Manager, RunEvent, WindowEvent};
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

#[tauri::command]
fn kill_ollama() -> Result<(), String> {
    println!("kill_ollama");
    // kill anything running on port 11434
    let kill_script = format!("kill $(lsof -t -i:11434)");
    Command::new("sh")
        .arg("-c")
        .arg(kill_script)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn start_ollama() -> Result<u32, String> {
    println!("start_ollama");
    if let Err(e) = kill_ollama() {
        eprintln!("Failed to kill existing Ollama process: {}", e);
    }

    let ollama_path = tauri::utils::platform::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or_else(|| "Failed to get parent directory".to_string())?
        .join("ollama-darwin-0.5.4");

    // Set executable permissions (rwxr-xr-x)
    std::fs::set_permissions(&ollama_path, Permissions::from_mode(0o755))
        .map_err(|e| e.to_string())?;

    // Start Ollama with OLLAMA_FLASH_ATTENTION=1 and OLLAMA_KV_CACHE_TYPE=q8_0
    // See https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-set-the-quantization-type-for-the-kv-cache
    let child = Command::new(&ollama_path)
        .arg("serve")
        // .env("OLLAMA_FLASH_ATTENTION", "1")
        // .env("OLLAMA_KV_CACHE_TYPE", "q8_0")
        .spawn()
        .map_err(|e| format!("Failed to start Ollama: {}", e))?;

    // Get the process IDs
    let ollama_pid = child.id();
    let parent_pid = std::process::id();

    // Start the watchdog
    start_watchdog(parent_pid, ollama_pid)
        .map_err(|e| format!("Failed to start watchdog: {}", e))?;

    Ok(ollama_pid)
}

#[tauri::command]
fn set_tray_title(app_handle: tauri::AppHandle, title: String) {
    if let Err(e) = app_handle
        .tray_by_id("main_tray")
        .unwrap()
        .set_title(Some(&title))
    {
        eprintln!("Failed to set tray title: {}", e);
    }
}

fn change_icon(app_handle: tauri::AppHandle) -> bool {
    unsafe {
        let icon_path = app_handle
            .path()
            .resource_dir()
            .expect("Failed to resolve resource directory")
            .join("icons/icon.icns");

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
            let success = change_icon(app_handle);
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
    app.path()
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

    if let Some(onboarding_window) = app_handle.get_webview_window("onboarding") {
        onboarding_window.close().map_err(|e| e.to_string())?;
    }

    if let Some(main_window) = app_handle.get_webview_window("main") {
        main_window.show().map_err(|e| e.to_string())?;
        set_dock_icon_visibility(app_handle, true);
    }

    Ok(())
}

fn main() {
    #[allow(unused_mut)]
    let mut app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .setup(move |app| {
            if !is_onboarding_completed(&app.handle()) {
                // hide the main window
                if let Some(main_window) = app.get_webview_window("main") {
                    main_window.hide().unwrap();
                }

                let onboarding_window = app.get_webview_window("onboarding").unwrap();
                onboarding_window.show().unwrap();
                onboarding_window.set_focus().unwrap();
            } else {
                if let Some(main_window) = app.get_webview_window("main") {
                    main_window.show().unwrap();
                    set_dock_icon_visibility(app.handle().clone(), true);
                }
            }

            let tray_window = app.get_webview_window("main_tray").unwrap();
            let tray_window_clone = tray_window.clone();
            tray_window.on_window_event(move |event| {
                if let WindowEvent::Focused(focused) = event {
                    if !focused {
                        let _ = tray_window_clone.hide();
                    }
                }
            });

            // Start Ollama
            match start_ollama() {
                Ok(ollama_pid) => {
                    println!("Ollama started with PID: {}", ollama_pid);
                }
                Err(error) => eprintln!("Failed to start Ollama: {}", error),
            }

            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let show_main = MenuItemBuilder::with_id("show_main", "Show Main").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show_main, &quit]).build()?;
            let tray = app.handle().tray_by_id("main_tray").unwrap();

            tray.set_menu(Some(menu))?;

            tray.on_tray_icon_event(|tray, event| {
                tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        println!("left click pressed and released");
                        let app_handle = tray.app_handle();
                        if let Some(tray_window) = app_handle.get_webview_window("main_tray") {
                            if !tray_window.is_visible().unwrap_or(false) {
                                let _ = tray_window.move_window(Position::TrayCenter);
                                let _ = tray_window.show();
                                let _ = tray_window.set_focus();
                            } else {
                                let _ = tray_window.hide();
                            }
                        }
                    }
                    _ => {}
                }
            });

            tray.on_menu_event(move |app, event| match event.id().as_ref() {
                "show_main" => {
                    if let Some(main_window) = app.get_webview_window("main") {
                        main_window.show().unwrap();
                        set_dock_icon_visibility(app.app_handle().clone(), true);
                    }
                }
                "quit" => std::process::exit(0),
                _ => (),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_tray_title,
            set_dock_icon_visibility,
            kill_ollama,
            start_ollama,
            complete_onboarding
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_, e| {
        if let RunEvent::WindowEvent {
            label,
            event: WindowEvent::CloseRequested { .. },
            ..
        } = e
        {
            if label == "main" {
                println!("main window close requested");
                std::process::exit(0);
            }
        }
    });
}
