import json
from videoscribe.domain.models import TranscriptionSegment
from videoscribe.domain.interfaces import ProgressReporter

class JsonStdoutReporter(ProgressReporter):
    def report_progress(self, status: str, progress: int) -> None:
        print(json.dumps({
            "type": "progress",
            "status": status,
            "progress": progress
        }), flush=True)
        
    def report_result(self, segment: TranscriptionSegment) -> None:
        print(json.dumps({
            "type": "result",
            "start": segment.start,
            "end": segment.end,
            "text": segment.text
        }), flush=True)
        
    def report_error(self, message: str) -> None:
        print(json.dumps({
            "type": "error",
            "message": message
        }), flush=True)
        
    def report_language(self, language: str) -> None:
        print(json.dumps({
            "type": "language",
            "language": language
        }), flush=True)
