// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::Permissions;
use std::os::unix::fs::PermissionsExt;
use std::process::Command;

use tauri::{AppHandle, CustomMenuItem, Manager, RunEvent, SystemTrayMenu};
use tauri::{SystemTray, SystemTrayEvent, Window, WindowBuilder, WindowEvent};
use tauri_plugin_positioner::{Position, WindowExt};

use cocoa::appkit::{NSApp, NSImage};
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};

use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};

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
        .inner_size(300.0, 250.0)
        .decorations(false)
        .resizable(false)
        .closable(false)
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

fn start_ollama() -> Result<std::process::Child, std::io::Error> {
    let ollama_path = tauri::utils::platform::current_exe()?
        .parent()
        .unwrap()
        .join("ollama-darwin-0.3.11");

    // Set executable permissions (rwxr-xr-x)
    std::fs::set_permissions(&ollama_path, Permissions::from_mode(0o755))?;

    Command::new(&ollama_path).arg("serve").spawn()
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

struct TimerState {
    is_active: bool,
    remaining: u64,
}

impl TimerState {
    fn new() -> Self {
        Self {
            is_active: false,
            remaining: 0,
        }
    }
}

type SharedTimerState = Arc<Mutex<TimerState>>;

fn start_timer(app_handle: AppHandle, state: SharedTimerState) {
    let state_clone = Arc::clone(&state);
    thread::spawn(move || {
        println!("Timer thread started");
        loop {
            {
                let mut state = state_clone.lock().unwrap();
                println!(
                    "Timer state: active={}, remaining={}",
                    state.is_active, state.remaining
                );
                if !state.is_active {
                    println!("Timer paused");
                    return;
                }
                if state.remaining == 0 {
                    println!("Timer completed");
                    state.is_active = false;
                    app_handle.emit_all("timer-completed", ()).unwrap();
                    return;
                }
                state.remaining -= 1;
                app_handle.emit_all("timer-tick", state.remaining).unwrap();
            }
            thread::sleep(Duration::from_secs(1));
        }
    });
}

#[tauri::command]
fn start_timer_command(
    app_handle: AppHandle,
    state: tauri::State<SharedTimerState>,
    duration: u64,
) {
    println!("start_timer_command called with duration: {}", duration);
    let mut state_guard = state.lock().unwrap();
    state_guard.is_active = false; // Set to false initially
    state_guard.remaining = duration;
    drop(state_guard);
    // Don't start the timer thread here, just update the state
    app_handle.emit_all("timer-tick", duration).unwrap();
}

#[tauri::command]
fn pause_timer_command(state: tauri::State<SharedTimerState>) -> u64 {
    println!("pause_timer_command called");
    let mut state = state.lock().unwrap();
    state.is_active = false;
    println!("Timer paused with remaining time: {}", state.remaining);
    state.remaining
}

#[tauri::command]
fn resume_timer_command(app_handle: AppHandle, state: tauri::State<SharedTimerState>) {
    let mut state_guard = state.lock().unwrap();
    if !state_guard.is_active {
        state_guard.is_active = true;
        let remaining = state_guard.remaining;
        drop(state_guard);
        start_timer(app_handle, state.inner().clone());
    }
}

fn main() {
    let timer_state = Arc::new(Mutex::new(TimerState::new()));

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
        .manage(timer_state)
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
            set_dock_icon_visibility,
            start_timer_command,
            pause_timer_command,
            resume_timer_command
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
