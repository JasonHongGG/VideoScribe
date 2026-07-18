from dataclasses import dataclass
from typing import Optional

@dataclass
class TranscriptionSegment:
    start: float
    end: float
    text: str

@dataclass
class TranscriptionInfo:
    language: str
    language_probability: float
    duration: float
