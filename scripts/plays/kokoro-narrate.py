"""Narrate an iconic-play film with the game's default coach voice (local Kokoro, voice af_bella, speed 1.0).

Usage:  <python with kokoro installed> scripts/plays/kokoro-narrate.py <film-id>
Reads   public/plays/narration/<film-id>/script.json   {"chapters":[{"label":..., "text":...}]}
Writes  public/plays/narration/<film-id>/<n>.m4a        one clip per chapter (mono AAC, loudness -18 LUFS)
        public/plays/narration/<film-id>/timing.json    {"chapters":[{"label","text","src","seconds","words":[{"w","at"}]}]}
Runs fully offline after the first model download; no paid service. Word onsets become the film's cues.
"""
import json, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
# The espeakng-loader wheel ships without its data; point it at Homebrew's espeak-ng (brew install espeak-ng).
import espeakng_loader
if Path('/opt/homebrew/share/espeak-ng-data').exists():
    espeakng_loader.get_data_path = lambda: '/opt/homebrew/share/espeak-ng-data'
    espeakng_loader.get_library_path = lambda: '/opt/homebrew/lib/libespeak-ng.dylib'
from kokoro import KPipeline

VOICE, SPEED, RATE = 'af_bella', 1.0, 24000
film = sys.argv[1]
root = Path(__file__).resolve().parents[2] / 'public' / 'plays' / 'narration' / film
script = json.loads((root / 'script.json').read_text())
pipeline = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
# Name and term pronunciations (scripts/plays/pronunciations.json, installed by kokoro_lexicon.py): misaki's gold
# lexicon gets the phonemes, so script.json, captions and the timing.json word tokens keep the real spelling.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from kokoro_lexicon import apply_lexicon
apply_lexicon(pipeline)
out = []
for n, chapter in enumerate(script['chapters'], 1):
    audio, words, offset = [], [], 0.0
    for result in pipeline(chapter['text'], voice=VOICE, speed=SPEED):
        clip = result.audio.numpy() if hasattr(result.audio, 'numpy') else np.asarray(result.audio)
        for token in (result.tokens or []):
            if getattr(token, 'start_ts', None) is not None and token.text.strip() and any(ch.isalnum() for ch in token.text):
                words.append({'w': token.text, 'at': round(offset + float(token.start_ts), 3)})
        audio.append(clip)
        offset += len(clip) / RATE
    wave = np.concatenate(audio) if audio else np.zeros(RATE // 2, dtype=np.float32)
    # a short breath of silence at the end so chapters don't clip
    wave = np.concatenate([wave, np.zeros(int(RATE * .35), dtype=np.float32)])
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        sf.write(tmp.name, wave, RATE)
        dest = root / f'{n}.m4a'
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp.name, '-af', 'loudnorm=I=-18:TP=-2:LRA=11',
                        '-ac', '1', '-ar', '24000', '-c:a', 'aac', '-aac_coder', 'fast', '-b:a', '40k', str(dest)], check=True)  # Oct 7 2026: 40 kbps (docs/performance-guide.md)
    seconds = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(dest)],
                                   capture_output=True, text=True, check=True).stdout)
    out.append({'label': chapter['label'], 'text': chapter['text'], 'src': f'/plays/narration/{film}/{n}.m4a', 'seconds': round(seconds, 3), 'words': words})
    print(f'{film} chapter {n}: {seconds:.2f}s, {len(words)} words')
(root / 'timing.json').write_text(json.dumps({'voice': 'kokoro_' + VOICE, 'speed': SPEED, 'chapters': out}, indent=1))
