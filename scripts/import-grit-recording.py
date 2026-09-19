"""Offline import of a supplied recording and locally verified word timestamps.
Retimes original artwork to speech without changing narrator speed or wording.
"""
import json,re,sys,subprocess,shutil
from pathlib import Path
source,transcript=map(Path,sys.argv[1:3])
base=Path('public/stories/films/grit'); work=Path('/tmp/fi2-grit-storyteller')
script=json.loads(Path('lib/paths/gritScript.json').read_text())
segments=json.loads(transcript.read_text())
def tokens(text):
 return re.findall(r'[a-z0-9]+',text.lower().replace('’',"'").replace("'",''))
words=[]
for segment in segments:
 for word in segment['words']:
  words.extend(dict(word,token=t) for t in tokens(word['word']))
expected=[t for cue in script['cues'] for t in tokens(cue['text'])]
assert expected==[w['token'] for w in words], 'Recording must match approved script'
timing=[]; report=[]; index=0
for cue in script['cues']:
 count=len(tokens(cue['text'])); start=words[index]['start']
 timing.append({'story':cue['start'],'media':start if index else 0})
 report.append({'text':cue['text'],'start':start,'end':words[index+count-1]['end']})
 index+=count
probe=lambda p:float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)]))
closing=max(probe(source),words[-1]['end']+.4); duration=closing+4.370431
timing.extend([{'story':72,'media':closing},{'story':76.370431,'media':duration}])
assert all(b['media']>a['media'] and b['story']>a['story'] for a,b in zip(timing,timing[1:]))
expression=str(duration)
for a,b in reversed(list(zip(timing,timing[1:]))):
 expression=f"if(lt(T,{b['story']}),{a['media']}+(T-{a['story']})*{(b['media']-a['media'])/(b['story']-a['story'])},{expression})"
ff=lambda args:subprocess.run(['ffmpeg','-v','error','-y',*map(str,args)],check=True)
for name in ['portrait','square','landscape']:
 original=work/f'original-{name}.mp4'
 assert original.exists() and abs(probe(original)-76.37)<.2,'Original unretimed artwork required'
 ff(['-i',original,'-i',source,'-map','0:v:0','-map','1:a:0','-vf',f"setpts='({expression})/TB',fps=24",'-af',f'apad,atrim=duration={duration}','-c:v','libx264','-threads','2','-crf','22','-preset','fast','-pix_fmt','yuv420p','-maxrate','2500k','-bufsize','5000k','-c:a','aac','-b:a','128k','-t',duration,'-movflags','+faststart',base/f'{name}.recording.mp4'])
 print('Retimed',name,flush=True)
shutil.copyfile(source,base/'narration.mp3')
for name in ['portrait','square','landscape']:(base/f'{name}.recording.mp4').replace(base/f'{name}.mp4')
Path('lib/paths/gritNarrationTiming.json').write_text(json.dumps(timing,indent=2)+'\n')
(base/'recording-alignment.json').write_text(json.dumps(report,indent=2)+'\n')
print('Installed supplied Adam recording:',duration,'seconds')
