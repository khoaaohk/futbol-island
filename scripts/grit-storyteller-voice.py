"""Offline warm British female storyteller blend; no Bella samples or model fine-tuning."""
import json
import os
import sys
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro

model_dir, jobs_path, output = sys.argv[1:]
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
options.add_session_config_entry('session.intra_op.allow_spinning', '0')
session = ort.InferenceSession(os.path.join(model_dir, 'kokoro-v1.0.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
engine = Kokoro.from_session(session, os.path.join(model_dir, 'voices-v1.0.bin'))
# Emma supplies a warm British voice; Isabella adds a reflective storytelling tone.
voice = .7 * engine.get_voice_style('bf_emma') + .3 * engine.get_voice_style('bf_isabella')
with open(jobs_path) as handle:
    jobs = json.load(handle)
for key, text in jobs.items():
    samples, rate = engine.create(text, voice=voice, speed=.9, lang='en-gb')
    if not len(samples):
        raise RuntimeError('Empty voice segment ' + key)
    sf.write(os.path.join(output, key + '.wav'), samples, rate)
    print(f'OK {key} {len(samples)/rate:.3f}', flush=True)
