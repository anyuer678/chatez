// ChatEZ 桌面端入口
// 使用 Tauri 2.x 把 React + Vite 构建产物打包为 Windows 桌面应用

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
