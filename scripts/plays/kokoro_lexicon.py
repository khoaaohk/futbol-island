"""Shared pronunciation lexicon for every local Kokoro (misaki) voicing: card films and island lessons.

scripts/plays/pronunciations.json maps a word, exactly as written in the narration, to the misaki phonemes
Kokoro should say (names, clubs, futsal and tactics loanwords). The entries go into misaki's gold lexicon
instead of into the text, so display text, captions, voice-file hashes and timing tokens keep the real spelling.
"""
import json
from pathlib import Path

LEXICON_FILE = Path(__file__).resolve().parent / 'pronunciations.json'


def apply_lexicon(pipeline):
    """Install pronunciations.json into a KPipeline(lang_code='a') and return the number of words."""
    words = json.loads(LEXICON_FILE.read_text())['words']
    lexicon = pipeline.g2p.lexicon
    for word, entry in words.items():
        # lower-case keys are loanwords (fixo, ala, goleiro...): also cover them at the start of a sentence.
        # Possessives ("Mbappé's") are added explicitly because misaki lower-cases "Ailing's"-type words.
        forms = {word, word[:1].upper() + word[1:]} if word.islower() else {word}
        for form in forms:
            lexicon.golds[form] = entry['ps']
            lexicon.golds.setdefault(form + "'s", lexicon._s(entry['ps']))
    return len(words)
