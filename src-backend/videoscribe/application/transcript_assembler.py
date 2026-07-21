from typing import List, Iterator, Any
from videoscribe.domain.models import TranscriptionSegment, Word
from videoscribe.domain.transcription_options import CuePolicy
from videoscribe.domain.interfaces import ProgressReporter

class TranscriptAssembler:
    """Assembles raw words from STT output into naturally chunked segments."""
    
    def __init__(self, cue_policy: CuePolicy, reporter: ProgressReporter):
        self._cue_policy = cue_policy
        self._reporter = reporter
        self._current_words: List[Word] = []

    def process_segment(self, segment: Any) -> None:
        """Process a raw segment from the recognizer, yielding assembled segments."""
        if not segment.words:
            # If the recognizer returned no words, just forward the segment
            domain_segment = TranscriptionSegment(
                start=segment.start,
                end=segment.end,
                text=segment.text.strip(),
                words=[]
            )
            self._reporter.report_result(domain_segment)
            return

        for w in segment.words:
            self._process_word(w)

    def _process_word(self, w: Any) -> None:
        """Process an individual word and determine if a split is needed."""
        # Split by Word Gap (pause in speech)
        if self._current_words:
            previous_word_end = self._current_words[-1].end
            gap = w.start - previous_word_end
            
            # If pause is long enough, flush current words as a sentence
            if gap >= self._cue_policy.max_word_gap_seconds:
                self.flush()
                
        self._current_words.append(Word(text=w.word, start=w.start, end=w.end, probability=w.probability))
        
        # Split by common sentence-ending punctuation
        text = w.word.strip()
        is_punctuation = text.endswith(self._cue_policy.punctuation_chars)
        
        if is_punctuation:
            self.flush()

    def flush(self) -> None:
        """Flush the currently accumulated words into a complete segment and report it."""
        if not self._current_words:
            return
            
        start_time = self._current_words[0].start
        end_time = self._current_words[-1].end
        
        # Join words directly (Faster-whisper preserves leading spaces for languages like English)
        text = "".join([w.text for w in self._current_words]).strip()
        
        if not text:
            self._current_words = []
            return
            
        domain_segment = TranscriptionSegment(
            start=start_time,
            end=end_time,
            text=text,
            words=list(self._current_words)
        )
        self._reporter.report_result(domain_segment)
        self._current_words = []
