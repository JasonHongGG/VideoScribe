pub mod tokenizer;
pub mod dictionary;

use crate::domain::language::{Language, LanguagePlugin, LookupResult};
use tokenizer::JapaneseTokenizer;
use dictionary::JMDictService;
use std::path::PathBuf;

pub struct JapanesePlugin {
    tokenizer: JapaneseTokenizer,
    dict_service: JMDictService,
}

impl JapanesePlugin {
    pub fn new(db_path: PathBuf) -> Result<Self, String> {
        let tokenizer = JapaneseTokenizer::new()?;
        let dict_service = JMDictService::new(db_path);

        Ok(Self { tokenizer, dict_service })
    }
}

impl LanguagePlugin for JapanesePlugin {
    fn get_language(&self) -> Language {
        Language::Japanese
    }

    fn lookup_word(&self, text: &str) -> Result<LookupResult, String> {
        let token_info = self.tokenizer.tokenize(text)?;
        
        let target_word = if token_info.base_form == "*" {
            token_info.token_text.clone()
        } else {
            token_info.base_form.clone()
        };

        let entries = self.dict_service.query_word(&target_word)?;

        Ok(LookupResult {
            original_text: text.to_string(),
            token: token_info.token_text,
            base_form: token_info.base_form,
            reading: token_info.reading,
            entries,
        })
    }
}
