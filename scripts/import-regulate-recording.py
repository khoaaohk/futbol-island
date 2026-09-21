"""Import an unchanged user narration after a strict spoken-word comparison.
Usage: python3 scripts/import-regulate-recording.py recording.mp3 alignment.json
The alignment is local Whisper word timestamps, not a generated replacement voice.
"""
import json,re,sys,subprocess,shutil
from pathlib import Path
recording,alignment=sys.argv[1:]
base=Path('public/stories/films/regulate')
words=json.loads(Path(alignment).read_text())
jobs=json.loads((base/'script.json').read_text())
norm=lambda s:re.sub('[^a-z0-9]','',s.lower())
actual=''.join(norm(w['word']) for w in words)
expected=''.join(norm(s) for s in jobs.values())
if actual!=expected: raise SystemExit('Recording transcript does not match the approved script; do not install.')
starts=[];offset=0
for w in words:
 starts.append((offset,w));offset+=len(norm(w['word']))
old=json.loads((base/'timeline.json').read_text());cues=[];offset=0
for previous,text in zip(old['cues'],jobs.values()):
 matches=[w for pos,w in starts if pos==offset]
 if len(matches)!=1: raise SystemExit('Ambiguous caption boundary')
 cues.append({'start':matches[0]['start'],'text':text,'title':previous['title']});offset+=len(norm(text))
if not all(b['start']>a['start'] for a,b in zip(cues,cues[1:])):raise SystemExit('Caption starts are not increasing')
duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',recording]))
def first(name):return next(w for w in words if norm(w['word'])==name)
actions={key:first(key)['start'] for key in ['plays','passes','tackles','goals','saves']};actions['playsEnd']=first('plays')['end']
data={'duration':duration,'cues':cues,'emotions':{'anger':first('anger')['start']},'actions':actions,'voice':'User-supplied ElevenLabs Samantha recording, 2026-09-18 03:40:41'}
(base/'timeline.json').write_text(json.dumps(data,indent=2))
shutil.copyfile(recording,base/'narration.mp3')
shutil.copyfile(alignment,base/'narration-word-timing.json')
print(json.dumps({'duration':duration,'actions':actions,'anger':data['emotions']['anger'],'captions':len(cues),'script_match':True},indent=2))
