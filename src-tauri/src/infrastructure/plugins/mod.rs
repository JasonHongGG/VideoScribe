pub mod japanese;

use crate::domain::language::{Language, LanguagePlugin};
use std::collections::HashMap;
use std::sync::Arc;

pub struct PluginManager {
    plugins: HashMap<Language, Arc<dyn LanguagePlugin>>,
}

impl PluginManager {
    pub fn new() -> Self {
        Self {
            plugins: HashMap::new(),
        }
    }

    pub fn register_plugin(&mut self, plugin: Arc<dyn LanguagePlugin>) {
        self.plugins.insert(plugin.get_language(), plugin);
    }

    pub fn get_plugin(&self, lang: &Language) -> Option<Arc<dyn LanguagePlugin>> {
        self.plugins.get(lang).cloned()
    }
}
