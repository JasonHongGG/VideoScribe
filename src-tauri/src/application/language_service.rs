use crate::domain::language::{Language, LookupResult};
use crate::infrastructure::plugins::PluginManager;
use std::sync::Arc;

pub struct LanguageService;

impl LanguageService {
    pub fn lookup_word(
        plugin_manager: Arc<PluginManager>,
        language: Language,
        text: &str
    ) -> Result<LookupResult, String> {
        if let Some(plugin) = plugin_manager.get_plugin(&language) {
            plugin.lookup_word(text)
        } else {
            Err(format!("No language plugin found for {}", language))
        }
    }
}
