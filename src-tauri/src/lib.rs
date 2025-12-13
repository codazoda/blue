// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn current_directory() -> Option<String> {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            let menu = build_menu(&handle)?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "new" => {
                let _ = app.emit("menu-new", ());
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
