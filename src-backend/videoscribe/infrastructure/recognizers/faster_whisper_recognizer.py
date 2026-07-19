import subprocess
import numpy as np
from typing import Iterator, Tuple
from faster_whisper import WhisperModel
from videoscribe.domain.models import TranscriptionSegment, TranscriptionInfo
from videoscribe.domain.interfaces import SpeechRecognizer

class FasterWhisperRecognizer(SpeechRecognizer):
    def __init__(self):
        self._model = None
        
    def load_model(self, model_size: str, device: str, compute_type: str) -> None:
        self._model = WhisperModel(model_size, device=device, compute_type=compute_type)
        
    def transcribe(self, audio_path: str, language: str = "auto", reporter = None) -> Tuple[Iterator[TranscriptionSegment], TranscriptionInfo]:
        if not self._model:
            raise RuntimeError("Model not loaded. Call load_model first.")
            
        transcribe_kwargs = {
            "beam_size": 5,
            "vad_filter": False,
            "word_timestamps": True,
            "condition_on_previous_text": False
        }
        
        if language != "auto":
            transcribe_kwargs["language"] = language
            
        # Bypass PyAV and iGPU video decoding by extracting audio natively using FFmpeg
        cmd = [
            "ffmpeg", "-i", audio_path, "-vn",
            "-f", "s16le", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", "-"
        ]
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        out, _ = process.communicate()
        
        if process.returncode != 0 and len(out) == 0:
            raise RuntimeError("Failed to extract audio stream from video.")
            
        # Prevent frombuffer crash if odd bytes
        if len(out) % 2 != 0:
            out = out[:-1]
            
        audio_array = np.frombuffer(out, dtype=np.int16).astype(np.float32) / 32768.0

        segments, info = self._model.transcribe(audio_array, **transcribe_kwargs)
        
        domain_info = TranscriptionInfo(
            language=info.language,
            language_probability=info.language_probability,
            duration=info.duration
        )
        
        def segment_generator() -> Iterator[TranscriptionSegment]:
            for segment in segments:
                start_time = float(segment.words[0].start) if segment.words else float(segment.start)
                end_time = float(segment.words[-1].end) if segment.words else float(segment.end)
                yield TranscriptionSegment(
                    start=start_time,
                    end=end_time,
                    text=str(segment.text).strip()
                )
                
        return segment_generator(), domain_info
