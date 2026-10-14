"""Island Tutorial narration: offline Kokoro, the path films' narrator (af_heart, speed .86), same encode as build-path-narration.py.

Usage: ~/.venvs/futbol-kokoro/bin/python scripts/build-tutorial-narration.py ~/.venvs/futbol-kokoro/onnx-models [--only=id,id]
Reads lib/tutorial/islandTutorial.json (each scene's `say`, else its caption `narration`), writes
public/stories/island-tutorial/<id>.m4a and lib/tutorial/islandTutorialTiming.json (seconds + sha256 of the voiced line).
Unchanged lines are skipped, so re-running after an edit only re-voices the edited scenes.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE, SPEED = 'af_heart', .86
model_dir = Path(sys.argv[1])
only = next((arg.split('=', 1)[1].split(',') for arg in sys.argv if arg.startswith('--only=')), None)
script = json.loads(Path('lib/tutorial/islandTutorial.json').read_text())
timing_path = Path('lib/tutorial/islandTutorialTiming.json')
timing = json.loads(timing_path.read_text()) if timing_path.exists() else {}
scenes = timing.get('scenes', {})
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
options.add_session_config_entry('session.intra_op.allow_spinning', '0')
session = ort.InferenceSession(str(model_dir / 'kokoro-v1.0.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
engine = Kokoro.from_session(session, str(model_dir / 'voices-v1.0.bin'))
# Warm neural voice, not an impersonation or a clone of user-provided audio.
voice = engine.get_voice_style(VOICE)
out_dir = Path('public/stories/island-tutorial')
out_dir.mkdir(parents=True, exist_ok=True)
for scene in script['scenes']:
    text = scene.get('say') or scene['narration']
    sha = hashlib.sha256(text.encode()).hexdigest()
    target = out_dir / f"{scene['id']}.m4a"
    if (only and scene['id'] not in only) or (scenes.get(scene['id'], {}).get('sha256') == sha and target.exists()):
        continue
    samples, rate = engine.create(text, voice=voice, speed=SPEED, lang='en-us')
    if len(samples) == 0 or not np.isfinite(samples).all():
        raise RuntimeError('Invalid narration: ' + scene['id'])
    # A short breath after each thought keeps cuts from sounding abrupt.
    samples = np.concatenate([samples, np.zeros(round(rate * .18), dtype=samples.dtype)])
    with tempfile.TemporaryDirectory(prefix='futbol-tutorial-') as tmp:
        wav = Path(tmp) / 'voice.wav'
        sf.write(wav, samples, rate)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav), '-af', 'loudnorm=I=-18:TP=-2:LRA=9', '-ac', '1', '-c:a', 'aac', '-b:a', '64k', str(target)], check=True)
    seconds = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(target)], text=True))
    scenes[scene['id']] = {'src': f"/stories/island-tutorial/{scene['id']}.m4a", 'duration': round(seconds, 3), 'sha256': sha}
    print(f"{scene['id']} {seconds:.2f}s", flush=True)
ids = [scene['id'] for scene in script['scenes']]
meta = {'voice': f'Kokoro {VOICE}', 'engine': 'kokoro-onnx', 'speed': SPEED, 'license': 'Apache-2.0 model; MIT runtime',
        'scenes': {i: scenes[i] for i in ids if i in scenes}}
timing_path.write_text(json.dumps(meta, indent=1) + '\n')
print(f"total {sum(s['duration'] for s in meta['scenes'].values()):.1f}s of narration")
