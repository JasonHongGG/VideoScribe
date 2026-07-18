import asyncio
import threading
import uvicorn
import argparse
from fastapi import FastAPI, Request
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from videoscribe.infrastructure.recognizers.faster_whisper_recognizer import FasterWhisperRecognizer
from videoscribe.infrastructure.reporters.sse_reporter import SseReporter
from videoscribe.application.pipeline import TranscriptionPipeline

app = FastAPI(title="VideoScribe STT Backend")

class TranscribeRequest(BaseModel):
    video_path: str
    model: str = "medium"
    device: str = "auto"
    compute_type: str = "default"
    language: str = "auto"

@app.post("/api/v1/stt/transcribe")
async def transcribe(req: TranscribeRequest, request: Request):
    queue = asyncio.Queue()
    loop = asyncio.get_running_loop()
    
    def run_stt():
        recognizer = FasterWhisperRecognizer()
        reporter = SseReporter(loop=loop, queue=queue)
        pipeline = TranscriptionPipeline(recognizer, reporter)
        
        try:
            pipeline.run(
                audio_path=req.video_path,
                model_size=req.model,
                device=req.device,
                compute_type=req.compute_type,
                language=req.language
            )
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)
            
    thread = threading.Thread(target=run_stt)
    thread.start()

    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
                
            item = await queue.get()
            if item is None:
                break
            
            yield item
            
    return EventSourceResponse(event_generator())


def main():
    parser = argparse.ArgumentParser(description="VideoScribe STT Backend Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    args = parser.parse_args()

    uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="info")

if __name__ == "__main__":
    main()
