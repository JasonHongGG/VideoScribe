import sys
from videoscribe.domain.interfaces import SpeechRecognizer, ProgressReporter

class TranscriptionPipeline:
    def __init__(self, recognizer: SpeechRecognizer, reporter: ProgressReporter):
        self._recognizer = recognizer
        self._reporter = reporter

    def run(self, audio_path: str, model_size: str, device: str, compute_type: str, language: str) -> None:
        try:
            self._reporter.report_progress("loading_model", 0)
            self._recognizer.load_model(model_size, device, compute_type)
            
            self._reporter.report_progress("transcribing", 0)
            segments_iter, info = self._recognizer.transcribe(audio_path, language)
            
            self._reporter.report_language(info.language)
            
            print(f"Detected language: {info.language} with probability {info.language_probability:.2f}", file=sys.stderr)
            print(f"Total duration: {info.duration}s", file=sys.stderr)
            
            for segment in segments_iter:
                self._reporter.report_result(segment)
                
                if info.duration > 0:
                    progress_pct = min(100, int((segment.end / info.duration) * 100))
                    self._reporter.report_progress("transcribing", progress_pct)
                    
            self._reporter.report_progress("completed", 100)
            
        except Exception as e:
            self._reporter.report_error(f"Transcription failed: {str(e)}")
            sys.exit(1)
