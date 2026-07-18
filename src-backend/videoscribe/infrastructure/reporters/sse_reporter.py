import json
import asyncio
from videoscribe.domain.models import TranscriptionSegment
from videoscribe.domain.interfaces import ProgressReporter

class SseReporter(ProgressReporter):
    def __init__(self, loop: asyncio.AbstractEventLoop, queue: asyncio.Queue):
        self.loop = loop
        self.queue = queue
        
    def _put_event(self, event_type: str, data: dict):
        asyncio.run_coroutine_threadsafe(
            self.queue.put({"event": event_type, "data": json.dumps(data)}),
            self.loop
        )

    def report_progress(self, status: str, progress: int) -> None:
        self._put_event("progress", {"status": status, "progress": progress})
        
    def report_result(self, segment: TranscriptionSegment) -> None:
        self._put_event("result", {
            "start": segment.start,
            "end": segment.end,
            "text": segment.text
        })
        
    def report_error(self, message: str) -> None:
        self._put_event("error", {"message": message})
        
    def report_language(self, language: str) -> None:
        self._put_event("language", {"language": language})
