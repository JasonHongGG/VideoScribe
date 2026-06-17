import sys
import argparse
import json
from faster_whisper import WhisperModel

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def main():
    parser = argparse.ArgumentParser(description="VideoScribe STT Backend")
    parser.add_argument("video_path", help="Path to the video file")
    parser.add_argument("--model", default="medium", help="Model size to use (e.g. tiny, base, small, medium, large-v3)")
    parser.add_argument("--device", default="auto", help="Device to use (cpu or cuda)")
    parser.add_argument("--compute_type", default="default", help="Compute type (e.g. default, float16, int8_float16)")
    parser.add_argument("--language", default="auto", help="Language code (e.g. en, ja, zh) or auto")
    args = parser.parse_args()

    eprint(f"Initializing faster-whisper model: {args.model} on {args.device} with {args.compute_type}")
    
    # Emit progress event indicating model is loading
    print(json.dumps({"type": "progress", "status": "loading_model", "progress": 0}), flush=True)
    
    try:
        model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    except Exception as e:
        print(json.dumps({"type": "error", "message": f"Failed to load model: {str(e)}"}), flush=True)
        sys.exit(1)

    eprint(f"Starting transcription for {args.video_path}...")
    # Emit progress event indicating transcription is starting
    print(json.dumps({"type": "progress", "status": "transcribing", "progress": 0}), flush=True)
    
    transcribe_kwargs = {}
    if args.language != "auto":
        transcribe_kwargs["language"] = args.language

    try:
        segments, info = model.transcribe(args.video_path, beam_size=5, word_timestamps=False, **transcribe_kwargs)
        
        eprint(f"Detected language: {info.language} with probability {info.language_probability:.2f}")
        eprint(f"Total duration: {info.duration}s")
        
        for segment in segments:
            # Output each segment immediately as a JSON line
            payload = {
                "type": "result",
                "start": float(segment.start),
                "end": float(segment.end),
                "text": str(segment.text).strip()
            }
            print(json.dumps(payload), flush=True)
            
            # Optionally emit progress based on how far we are
            if info.duration > 0:
                progress_pct = min(100, int((segment.end / info.duration) * 100))
                print(json.dumps({"type": "progress", "status": "transcribing", "progress": progress_pct}), flush=True)
                
    except Exception as e:
        print(json.dumps({"type": "error", "message": f"Transcription failed: {str(e)}"}), flush=True)
        sys.exit(1)

    print(json.dumps({"type": "progress", "status": "completed", "progress": 100}), flush=True)
    eprint("Transcription complete.")

if __name__ == "__main__":
    main()
