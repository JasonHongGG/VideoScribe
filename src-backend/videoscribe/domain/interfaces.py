from typing import Protocol, Iterator, Tuple
from .models import TranscriptionSegment, TranscriptionInfo

class SpeechRecognizer(Protocol):
    def load_model(self, model_size: str, device: str, compute_type: str) -> None:
        """Load the STT model."""
        ...
        
    def transcribe(self, audio_path: str, language: str = "auto") -> Tuple[Iterator[TranscriptionSegment], TranscriptionInfo]:
        """Transcribe the given audio file."""
        ...

class ProgressReporter(Protocol):
    def report_progress(self, status: str, progress: int) -> None:
        """Report operation progress (0-100)."""
        ...
        
    def report_result(self, segment: TranscriptionSegment) -> None:
        """Report a newly transcribed segment."""
        ...
        
    def report_error(self, message: str) -> None:
        """Report an error."""
        ...
        
    def report_language(self, language: str) -> None:
        """Report the detected language."""
        ...
