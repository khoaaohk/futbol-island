"""Voice the History Museum's storytelling exhibits (public/voice/museum/<hash>.m4a) with local Kokoro, the coach voice.

Same pipeline as scripts/plays/kokoro-lessons.py: Kokoro-82M through misaki + the shared lexicon
(scripts/plays/pronunciations.json), speed 1.0, edge silence trimmed, levelled to the coach's RMS, mono AAC 32 kb/s 24 kHz.
Lines come from public/voice/museum/lines.json (node scripts/museum/export-story-lines.cjs); file names are the FNV-1a hash
of the line (lib/museum/museumStories.ts storyLineHash). Writes public/voice/museum/manifest.json ({hash: seconds}).
Usage: <python with kokoro> scripts/museum/kokoro-museum.py [--voice af_bella] [--force]
Runs offline after the first model download; no paid service.
"""
import json, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
import espeakng_loader
if Path('/opt/homebrew/share/espeak-ng-data').exists():
    espeakng_loader.get_data_path = lambda: '/opt/homebrew/share/espeak-ng-data'
    espeakng_loader.get_library_path = lambda: '/opt/homebrew/lib/libespeak-ng.dylib'
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/plays'))
from kokoro_lexicon import apply_lexicon

SPEED, RATE, BITRATE = 1.0, 24000, '32000'
TARGET_DBFS = {'af_bella': -21.2, 'af_heart': -22.4, 'af_sarah': -21.0, 'am_michael': -24.0}
args = sys.argv[1:]
voice = args[args.index('--voice') + 1] if '--voice' in args else 'af_bella'
force = '--force' in args
out = ROOT / 'public/voice/museum'
lines = json.loads((out / 'lines.json').read_text())
manifest_path = out / 'manifest.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
todo = [h for h in lines if force or h not in manifest or not (out / f'{h}.m4a').exists()]
print(f'{len(todo)} of {len(lines)} lines to voice ({voice})', flush=True)
if todo:
    from kokoro import KPipeline
    pipeline = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
    apply_lexicon(pipeline)
for n, h in enumerate(todo, 1):
    text = lines[h].replace('IFAB', 'I-FAB').replace('4–2', '4 2')
    parts = [r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio) for r in pipeline(text, voice=voice, speed=SPEED)]
    wave = np.concatenate(parts) if parts else np.zeros(RATE // 2, dtype=np.float32)
    loud = np.flatnonzero(np.abs(wave) > 0.01)
    if loud.size: wave = wave[max(0, loud[0] - int(RATE * .03)):loud[-1] + int(RATE * .08)]
    rms = float(np.sqrt(np.mean(wave ** 2))) or 1.0
    wave = np.clip(wave * (10 ** (TARGET_DBFS.get(voice, -21.5) / 20) / rms), -.99, .99).astype(np.float32)
    dest = out / f'{h}.m4a'
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        sf.write(tmp.name, wave, RATE)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp.name, '-ac', '1', '-ar', str(RATE), '-c:a', 'aac', '-b:a', BITRATE, '-f', 'mp4', str(dest)], check=True)
    seconds = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(dest)], capture_output=True, text=True, check=True).stdout)
    manifest[h] = round(seconds, 3)
    print(f'{n}/{len(todo)} {h} {seconds:.2f}s  {lines[h][:60]}', flush=True)
manifest = {h: manifest[h] for h in lines if h in manifest}
manifest_path.write_text(json.dumps(manifest, indent=1, sort_keys=True) + '\n')
print(f'manifest: {len(manifest)} clips, {sum(manifest.values()):.1f}s', flush=True)
