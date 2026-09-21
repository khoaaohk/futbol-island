"""Offline, replaceable Kokoro narration. Model/runtime stay outside the app.

Usage: python scripts/build-path-narration.py MODEL_DIR JOBS_JSON [--sample]
Export jobs first with scripts/export-path-narration.cjs.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

model_dir, jobs_file = sys.argv[1:3]
sample_only = '--sample' in sys.argv
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
options.add_session_config_entry('session.intra_op.allow_spinning', '0')
session = ort.InferenceSession(str(Path(model_dir) / 'kokoro-v1.0.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
engine = Kokoro.from_session(session, str(Path(model_dir) / 'voices-v1.0.bin'))
# Warm neural voice, not an impersonation or a clone of user-provided audio.
voice = engine.get_voice_style('af_heart')
films = json.loads(Path(jobs_file).read_text())
only = next((arg.split('=', 1)[1].split(',') for arg in sys.argv if arg.startswith('--only=')), None)
if only:
    films = [film for film in films if film['id'] in only]
for film in films:
    durations = []
    hashes = []
    for i, beat in enumerate(film['beats']):
        text = beat['narration']
        samples, rate = engine.create(text, voice=voice, speed=.86, lang='en-us')
        if len(samples) == 0 or not np.isfinite(samples).all():
            raise RuntimeError('Invalid narration: ' + film['id'])
        # A short breath after each thought keeps cuts from sounding abrupt.
        samples = np.concatenate([samples, np.zeros(round(rate * .18), dtype=samples.dtype)])
        target = Path('/tmp/futbol-neural-sample.m4a') if sample_only else Path('public') / beat['audio'].split('?')[0].lstrip('/')
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='futbol-voice-') as tmp:
            wav = Path(tmp) / 'voice.wav'
            sf.write(wav, samples, rate)
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','loudnorm=I=-18:TP=-2:LRA=9','-c:a','aac','-b:a','96k',str(target)],check=True)
        seconds = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(target)],text=True))
        durations.append(round(seconds, 3))
        hashes.append(hashlib.sha256(text.encode()).hexdigest())
        print(f"{film['id']} {i+1}/6 {seconds:.2f}s", flush=True)
        if sample_only:
            sys.exit(0)
    meta = {'voice':'Kokoro af_heart','engine':'kokoro-onnx','speed':.86,'clipDurations':durations,'scriptSha256':hashes,'temporary':True,'license':'Apache-2.0 model; MIT runtime'}
    (target.parent / 'timing.json').write_text(json.dumps(meta, indent=2)+'\n')
