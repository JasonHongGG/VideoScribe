use tauri::State;
use crate::domain::language::{LookupResult, FuriganaToken, DictionaryLookup, FuriganaProvider};
use crate::infrastructure::state::AppState;

#[tauri::command]
#[specta::specta]
pub fn lookup_word(text: String, state: State<'_, AppState>) -> Result<LookupResult, String> {
    let provider = state.plugin_manager
        .get_service::<dyn DictionaryLookup>("japanese")
        .ok_or_else(|| "Dictionary lookup provider for Japanese not found".to_string())?;

    provider.lookup_word(&text)
}

#[tauri::command]
#[specta::specta]
pub fn get_furigana(text: String, state: State<'_, AppState>) -> Result<Vec<FuriganaToken>, String> {
    let provider = state.plugin_manager
        .get_service::<dyn FuriganaProvider>("japanese")
        .ok_or_else(|| "Furigana provider for Japanese not found".to_string())?;

    provider.get_furigana(&text)
}
