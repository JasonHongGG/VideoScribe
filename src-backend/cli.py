import argparse
from videoscribe.infrastructure.recognizers.faster_whisper_recognizer import FasterWhisperRecognizer
from videoscribe.infrastructure.reporters.json_stdout_reporter import JsonStdoutReporter
from videoscribe.application.pipeline import TranscriptionPipeline

def main():
    parser = argparse.ArgumentParser(description="VideoScribe STT Backend")
    parser.add_argument("video_path", help="Path to the video file")
    parser.add_argument("--model", default="medium", help="Model size to use")
    parser.add_argument("--device", default="auto", help="Device to use (cpu or cuda)")
    parser.add_argument("--compute_type", default="default", help="Compute type")
    parser.add_argument("--language", default="auto", help="Language code")
    args = parser.parse_args()

    # Dependency Injection
    recognizer = FasterWhisperRecognizer()
    reporter = JsonStdoutReporter()
    pipeline = TranscriptionPipeline(recognizer, reporter)
    
    pipeline.run(
        audio_path=args.video_path,
        model_size=args.model,
        device=args.device,
        compute_type=args.compute_type,
        language=args.language
    )

if __name__ == "__main__":
    main()
