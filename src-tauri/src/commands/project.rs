use tauri::State;
use crate::infrastructure::state::AppState;
use crate::domain::project::ProjectState;

#[tauri::command]
#[specta::specta]
pub fn get_app_state(state: State<'_, AppState>) -> Result<ProjectState, String> {
    let project = state.project.lock().map_err(|e| e.to_string())?;
    Ok(project.clone())
}
