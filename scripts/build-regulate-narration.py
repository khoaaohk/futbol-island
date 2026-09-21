"""Offline warm storyteller assembly. Preserve each supplied sentence verbatim."""
import json, wave, os
from pathlib import Path
source=Path('/tmp/fi2-regulate-voice')
target=Path('public/stories/films/regulate')
jobs=json.loads((target/'script.json').read_text())
titles=['TWO GAMES','ON THE FIELD','IN YOUR MIND','A MISTAKE IS A MOMENT','CONTROL THE BALL','CONTROL THE MOMENT','FEEL IT','NOTICE IT','MAKE SPACE','A BREATH','A CHOICE','FRUSTRATION → FOCUS','FEAR → COURAGE','BLAME → ENCOURAGEMENT','THE GOAL','THE WORDS THAT HELP','GET BACK UP','EMOTION BELONGS','PLAY THROUGH IT']
timeline=[]; data=[]; clock=0
for i,(key,text) in enumerate(jobs.items()):
 with wave.open(str(source/(key+'.wav'))) as f:
  rate=f.getframerate(); frames=f.readframes(f.getnframes()); duration=f.getnframes()/rate
 timeline.append({'start':round(clock,3),'text':text,'title':titles[i]})
 data.append(frames)
 gap=1.2 if i in [8,9,10] else .7 if i in [0,3,5,7,13,16,17] else .4
 data.append(bytes(round(gap*rate)*2)); clock+=duration+gap
clock+=2; data.append(bytes(rate*4))
with wave.open(str(target/'narration.wav'),'wb') as out:
 out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate);out.writeframes(b''.join(data))
(target/'timeline.json').write_text(json.dumps({'duration':clock,'cues':timeline},indent=2))
print(clock)
