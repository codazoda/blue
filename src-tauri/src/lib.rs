// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn current_directory() -> Option<String> {
    if let Some(set) = WORKING_DIR.get() {
        return set.to_str().map(|s| s.to_string());
    }
    if let Some(pwd) = std::env::var_os("PWD") {
        let pb = PathBuf::from(pwd);
        if pb.is_dir() {
            return pb.to_str().map(|s| s.to_string());
        }
    }
    std::env::current_dir().ok().and_then(|path| {
        // In dev the CWD is often src-tauri; prefer the project root if so.
        let adjusted = match path.file_name().and_then(|name| name.to_str()) {
            Some("src-tauri") => path.parent().map(|p| p.to_path_buf()).unwrap_or(path),
            _ => path,
        };
        adjusted.to_str().map(|s| s.to_string())
    })
}

use tauri::menu::{
    AboutMetadata, Menu, MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder,
};
use tauri::Emitter;
use std::ffi::{OsStr, OsString};
use std::path::PathBuf;
use std::sync::OnceLock;

static WORKING_DIR: OnceLock<PathBuf> = OnceLock::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    apply_working_directory_override();

    tauri::Builder::default()
        .setup(|app| {
            apply_working_directory_override();
            let handle = app.handle();
            let menu = build_menu(&handle)?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "new" => {
                let _ = app.emit("menu-new", ());
            }
            "close" => {
                let _ = app.emit("menu-close", ());
            }
            "open" => {
                let _ = app.emit("menu-open", ());
            }
            "save" => {
                let _ = app.emit("menu-save", ());
            }
            "save-as" => {
                let _ = app.emit("menu-save-as", ());
            }
            _ => {}
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, current_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn build_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let pkg_info = app.package_info();
    let config = app.config();
    let about_metadata = AboutMetadata {
        name: Some(pkg_info.name.clone()),
        version: Some(pkg_info.version.to_string()),
        copyright: config.bundle.copyright.clone(),
        authors: config.bundle.publisher.clone().map(|p| vec![p]),
        ..Default::default()
    };

    // Custom items we want under File
    let new_item = MenuItemBuilder::new("New")
        .id("new")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let close_item = MenuItemBuilder::new("Close")
        .id("close")
        .accelerator("CmdOrCtrl+W")
        .build(app)?;
    let open_item = MenuItemBuilder::new("Open...")
        .id("open")
        .accelerator("CmdOrCtrl+O")
        .build(app)?;
    let save_item = MenuItemBuilder::new("Save")
        .id("save")
        .accelerator("CmdOrCtrl+S")
        .build(app)?;
    let save_as_item = MenuItemBuilder::new("Save As...")
        .id("save-as")
        .accelerator("CmdOrCtrl+Shift+S")
        .build(app)?;

    let close_window = PredefinedMenuItem::close_window(app, None)?;
    #[cfg(not(target_os = "macos"))]
    let quit = PredefinedMenuItem::quit(app, None)?;

    #[allow(unused_mut)]
    let mut file_menu = SubmenuBuilder::new(app, "File")
        .item(&new_item)
        .item(&close_item)
        .item(&open_item)
        .item(&save_item)
        .item(&save_as_item)
        .item(&close_window);
    #[cfg(not(target_os = "macos"))]
    {
        file_menu = file_menu.item(&quit);
    }
    let file_menu = file_menu.build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .item(&PredefinedMenuItem::undo(app, None)?)
        .item(&PredefinedMenuItem::redo(app, None)?)
        .item(&PredefinedMenuItem::separator(app)?)
        .item(&PredefinedMenuItem::cut(app, None)?)
        .item(&PredefinedMenuItem::copy(app, None)?)
        .item(&PredefinedMenuItem::paste(app, None)?)
        .item(&PredefinedMenuItem::select_all(app, None)?)
        .build()?;

    #[cfg(target_os = "macos")]
    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&PredefinedMenuItem::fullscreen(app, None)?)
        .build()?;

    let mut window_menu = SubmenuBuilder::new(app, "Window")
        .item(&PredefinedMenuItem::minimize(app, None)?)
        .item(&PredefinedMenuItem::maximize(app, None)?);
    #[cfg(target_os = "macos")]
    {
        window_menu = window_menu.item(&PredefinedMenuItem::separator(app)?);
    }
    let window_menu = window_menu
        .item(&PredefinedMenuItem::close_window(app, None)?)
        .build()?;

    let help_menu = {
        #[cfg(not(target_os = "macos"))]
        {
            SubmenuBuilder::new(app, "Help")
                .item(&PredefinedMenuItem::about(app, None, Some(about_metadata.clone()))?)
                .build()?
        }
        #[cfg(target_os = "macos")]
        {
            SubmenuBuilder::new(app, "Help").build()?
        }
    };

    let mut menu = MenuBuilder::new(app);

    #[cfg(target_os = "macos")]
    {
        let app_menu = SubmenuBuilder::new(app, pkg_info.name.clone())
            .item(&PredefinedMenuItem::about(app, None, Some(about_metadata))?)
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::services(app, None)?)
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::hide(app, None)?)
            .item(&PredefinedMenuItem::hide_others(app, None)?)
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::quit(app, None)?)
            .build()?;

        menu = menu
            .item(&app_menu)
            .item(&file_menu)
            .item(&edit_menu)
            .item(&view_menu)
            .item(&window_menu)
            .item(&help_menu);
    }

    #[cfg(not(target_os = "macos"))]
    {
        menu = menu
            .item(&file_menu)
            .item(&edit_menu)
            .item(&window_menu)
            .item(&help_menu);
    }

    menu.build()
}

// If the user launches with an explicit path (e.g., `blue /path/to/dir` or
// `open -a "Blue" --args /path/to/dir`), respect that by setting the process
// working directory before the app starts.
fn apply_working_directory_override() {
    // 1) Explicit env override
    if let Some(env_path) = std::env::var_os("BLUE_CWD") {
        if set_and_record_cwd(&env_path) {
            return;
        }
    }

    // 2) First usable CLI arg (skip executable; ignore macOS -psn_*)
    if let Some(arg_path) = std::env::args_os().skip(1).find_map(normalize_arg_path) {
        if set_and_record_cwd(arg_path.as_os_str()) {
            return;
        }
    }

    // 3) PWD if provided
    if let Some(pwd_path) = std::env::var_os("PWD") {
        if set_and_record_cwd(&pwd_path) {
            return;
        }
    }

    // 4) Fallback to current dir
    if WORKING_DIR.get().is_none() {
        if let Ok(cwd) = std::env::current_dir() {
            let _ = WORKING_DIR.set(cwd);
        }
    }
}

fn set_and_record_cwd(path: &OsStr) -> bool {
    if let Some(dir) = resolve_dir(path) {
        let _ = std::env::set_current_dir(&dir);
        let _ = WORKING_DIR.set(dir);
        return true;
    }
    false
}

fn normalize_arg_path(arg: OsString) -> Option<OsString> {
    // Skip macOS process serial number args like -psn_0_12345
    if let Some(s) = arg.to_str() {
        if s.starts_with("-psn_") {
            return None;
        }
        if let Some(stripped) = s.strip_prefix("file://") {
            return Some(OsString::from(stripped));
        }
    }
    Some(arg)
}

fn resolve_dir(path: &OsStr) -> Option<PathBuf> {
    let pb = PathBuf::from(path);
    if pb.is_absolute() {
        return pb.is_dir().then_some(pb);
    }
    // Prefer PWD as the base for relative paths (useful for `open -a ... ./`)
    if let Some(pwd) = std::env::var_os("PWD") {
        let base = PathBuf::from(pwd);
        let joined = base.join(&pb);
        if joined.is_dir() {
            return Some(joined);
        }
    }
    // Fallback to current process dir
    if let Ok(cwd) = std::env::current_dir() {
        let joined = cwd.join(&pb);
        if joined.is_dir() {
            return Some(joined);
        }
    }
    None
}
