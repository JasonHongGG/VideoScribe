from typing import List, Any
from videoscribe.domain.models import TranscriptionSegment, Word
from videoscribe.domain.transcription_options import CuePolicy

class SegmentRefiner:
    """
    Refines a native transcription segment by splitting it into smaller cues 
    if there are long gaps or punctuations inside the segment.
    It strictly respects the original segment boundaries and NEVER merges multiple STT segments.
    """
    
    def __init__(self, cue_policy: CuePolicy):
        self._cue_policy = cue_policy

    def process(self, segment: Any) -> List[TranscriptionSegment]:
        """
        Process a single raw STT segment and return one or more refined TranscriptionSegments.
        """
        if not segment.words:
            # If there are no word timestamps, we cannot split it. Return as is.
            return [TranscriptionSegment(
                start=segment.start,
                end=segment.end,
                text=segment.text.strip(),
                words=[]
            )]

        refined_segments = []
        current_words: List[Word] = []

        def flush_sub_segment():
            if not current_words:
                return
            
            start_time = current_words[0].start
            end_time = current_words[-1].end
            text = "".join([w.text for w in current_words]).strip()
            
            if text:
                refined_segments.append(TranscriptionSegment(
                    start=start_time,
                    end=end_time,
                    text=text,
                    words=list(current_words)
                ))
            current_words.clear()

        for w in segment.words:
            # Check gap with the previous word in the current sub-segment
            if current_words:
                previous_word_end = current_words[-1].end
                gap = w.start - previous_word_end
                if gap >= self._cue_policy.max_word_gap_seconds:
                    flush_sub_segment()
            
            # Add the current word
            current_words.append(Word(text=w.word, start=w.start, end=w.end, probability=w.probability))
            
            # Check punctuation to split immediately after this word
            text = w.word.strip()
            if text.endswith(self._cue_policy.punctuation_chars):
                flush_sub_segment()

        # Flush any remaining words at the end of the STT segment
        flush_sub_segment()

        return refined_segments
