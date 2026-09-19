"""Explicit offline generation only; never called by the app or build.
Reads the user-selected voice IDs and a private local API credential.
Caches successful results to avoid spending credits on identical retries.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import sys
import urllib.request
import urllib.error

story = sys.argv[1]
if story not in ('grit', 'regulate'):
    raise SystemExit('Choose grit or regulate')
config = json.loads(Path('lib/paths/storyVoiceChoices.json').read_text())
key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    key = next((line.split('=', 1)[1].strip().strip('\"\'') for line in Path('.env.local').read_text().splitlines() if line.startswith('ELEVENLABS_API_KEY=')), '')
if not key:
    raise SystemExit('Configure ELEVENLABS_API_KEY locally')
text = json.loads(Path('lib/paths/gritScript.json').read_text())['script'] if story == 'grit' else '\n\n'.join(json.loads(Path('public/stories/films/regulate/script.json').read_text()).values())
body = {'text': text, 'model_id': config['model'], 'voice_settings': {'stability': .6, 'similarity_boost': .75, 'style': .1, 'use_speaker_boost': True, 'speed': config['speed']}}
voice_id = config[story]['voiceId']
fingerprint = hashlib.sha256((voice_id + json.dumps(body)).encode()).hexdigest()
out = Path('/tmp/fi2-eleven-narration'); out.mkdir(exist_ok=True)
meta = out / (story + '-metadata.json')
if meta.exists() and json.loads(meta.read_text()).get('fingerprint') == fingerprint and (out / (story + '.mp3')).exists():
    print('Using cached', story, 'narration'); sys.exit(0)
request = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/' + voice_id + '/with-timestamps?output_format=mp3_44100_128', data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(request, timeout=120) as response:
        result = json.load(response)
except urllib.error.HTTPError as error:
    detail = json.loads(error.read()).get('detail', {})
    print('ElevenLabs rejected generation:', error.code, detail.get('code'), detail.get('message'))
    sys.exit(1)
(out / (story + '.mp3')).write_bytes(base64.b64decode(result.pop('audio_base64')))
(out / (story + '-alignment.json')).write_text(json.dumps(result))
(out / (story + '-script.txt')).write_text(text)
meta.write_text(json.dumps({'fingerprint': fingerprint, 'voice': config[story], 'model': config['model'], 'speed': config['speed']}, indent=2))
print('Generated', story, 'with', config[story]['name'], 'and character timing.')
