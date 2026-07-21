from typing import Optional

class PromptRegistry:
    """Registry for language-specific initial prompts for STT models."""
    
    _PROMPTS = {
        "ja": "これは日本語の音声認識結果です。句読点（、。）が含まれています。",
        "zh": "這是一段繁體中文的語音辨識結果，包含逗號，句號，與問號等標點符號。",
        "en": "This is a transcription in English. It includes punctuation marks like commas, periods, and question marks."
    }

    @classmethod
    def get_prompt(cls, language: str) -> Optional[str]:
        """Get the initial prompt for the specified language, if available."""
        return cls._PROMPTS.get(language)
