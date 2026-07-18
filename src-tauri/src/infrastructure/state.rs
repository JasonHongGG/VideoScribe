use crate::infrastructure::providers::{ProviderFactory, AIProvider};
use crate::infrastructure::config::AppConfig;
use crate::infrastructure::plugins::PluginManager;
use crate::domain::agent::AgentType;
use crate::domain::project::ProjectState;
use std::sync::{Arc, Mutex};

pub struct AppState {
    pub config: AppConfig,
    pub translator_provider: Arc<dyn AIProvider>,
    pub project: Arc<Mutex<ProjectState>>,
    pub plugin_manager: Arc<PluginManager>,
}

impl AppState {
    pub fn new(plugin_manager: PluginManager) -> Result<Self, String> {
        let config = AppConfig::load();
        
        let provider = ProviderFactory::create_provider(&AgentType::TranslatorAgent, &config)
            .map_err(|e| e.to_string())?;
            
        Ok(Self {
            config,
            translator_provider: Arc::from(provider),
            project: Arc::new(Mutex::new(ProjectState::default())),
            plugin_manager: Arc::new(plugin_manager),
        })
    }
}
