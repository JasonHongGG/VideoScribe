from typing import Iterator, Optional
import numpy as np
from videoscribe.domain.interfaces import VADAnalyzer
from videoscribe.domain.models import AudioWindow, VADResult
from videoscribe.domain.transcription_options import TranscriptionOptions
import logging

try:
    from faster_whisper.vad import get_speech_timestamps, VadOptions
    from faster_whisper.audio import decode_audio
    HAS_FASTER_WHISPER = True
except ImportError:
    HAS_FASTER_WHISPER = False

logger = logging.getLogger(__name__)

class SileroVADAnalyzer(VADAnalyzer):
    """
    A custom VAD analyzer implementation using Silero VAD (bundled with faster-whisper).
    Processes the audio and returns explicit speech segments.
    """
    
    def analyze(self, audio_path: str, options: TranscriptionOptions) -> Optional[VADResult]:
        if not HAS_FASTER_WHISPER:
            logger.error("faster_whisper is not installed. SileroVADAnalyzer cannot run.")
            return None
            
        logger.info(f"SileroVADAnalyzer: Running Silero VAD on {audio_path}")
        
        # Decode audio to 16kHz mono which Silero VAD requires
        # faster-whisper's decode_audio defaults to 16000Hz sampling rate
        audio = decode_audio(audio_path, sampling_rate=16000)
        
        # We can expose VadOptions through TranscriptionOptions if needed,
        # but for now we use the default recommended parameters.
        vad_parameters = VadOptions(
            max_speech_duration_s=options.batch_size if options.use_batch else 30.0,
            min_silence_duration_ms=160,
        )
        
        speech_chunks = get_speech_timestamps(audio, vad_parameters)
        
        def window_generator():
            try:
                for i, segment in enumerate(speech_chunks):
                    # For silero standard 16000Hz format, timestamps are returned directly in dict
                    start_sec = segment['start'] / 16000.0
                    end_sec = segment['end'] / 16000.0
                    
                    yield AudioWindow(
                        audio=np.array([]), # We don't slice the actual audio here, just timestamps
                        start_time=start_sec,
                        end_time=end_sec,
                        is_last=(i == len(speech_chunks) - 1)
                    )
            except Exception as e:
                logger.error(f"Error during VAD iteration: {e}")
                
        return VADResult(windows=list(window_generator()))
