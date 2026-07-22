use tauri::State;
use std::sync::Arc;
use crate::application::stt_job_controller::SttJobController;
use crate::domain::stt_job::SttJobSnapshot;
use crate::domain::project::STTResult;
use crate::infrastructure::state::AppState;

#[tauri::command]
#[specta::specta]
pub fn start_stt_job(
    video_path: String,
    model_size: String,
    language: String,
    vad_engine: String,
    mss_engine: String,
    mss_model: String,
    use_batch: bool,
    batch_size: u32,
    state: State<'_, Arc<SttJobController>>,
) -> Result<String, String> {
    let manager = state.inner();
    manager.start_job(video_path, model_size, language, vad_engine, mss_engine, mss_model, use_batch, batch_size)
}

#[tauri::command]
#[specta::specta]
pub fn cancel_stt_job(
    job_id: String,
    manager: State<'_, Arc<SttJobController>>
) -> Result<(), String> {
    manager.cancel_job(job_id)
}

#[tauri::command]
#[specta::specta]
pub fn get_stt_job_state(
    manager: State<'_, Arc<SttJobController>>
) -> Result<Option<SttJobSnapshot>, String> {
    Ok(manager.get_current_state())
}

#[tauri::command]
#[specta::specta]
pub fn import_stt_results(results: Vec<STTResult>, state: State<'_, AppState>) -> Result<(), String> {
    if let Ok(mut project) = state.project.lock() {
        project.import_results(results);
    }
    Ok(())
}
