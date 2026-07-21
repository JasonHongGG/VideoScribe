from dataclasses import dataclass, field
from typing import Optional

@dataclass
class CuePolicy:
    """Policy for splitting words into transcription cues/segments."""
    max_word_gap_seconds: float = 0.5
    punctuation_chars: tuple[str, ...] = ('.', '?', '!', '。', '？', '！', '、', ',', '，')

@dataclass
class TranscriptionOptions:
    """Configuration options for the STT engine and workflow."""
    model_size: str
    device: str
    compute_type: str
    language: str = "auto"
    vad_filter: bool = False
    use_batch: bool = True
    batch_size: int = 16
    initial_prompt: Optional[str] = None
    cue_policy: CuePolicy = field(default_factory=CuePolicy)
