"""Original book narration using the existing Coach Bella play-film pipeline.
Requires the existing Kokoro venv/model; never falls back to another voice.
"""
import json, re, sys, tempfile, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
import torch
import espeakng_loader
if Path('/opt/homebrew/share/espeak-ng-data').exists():
    espeakng_loader.get_data_path = lambda: '/opt/homebrew/share/espeak-ng-data'
    espeakng_loader.get_library_path = lambda: '/opt/homebrew/lib/libespeak-ng.dylib'
from kokoro import KPipeline
# This is an offline build, not client-side inference. Bound CPU parallelism.
torch.set_num_threads(2)
pipeline = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
sys.path.insert(0, str(Path(__file__).resolve().parent / 'plays'))
from kokoro_lexicon import apply_lexicon
apply_lexicon(pipeline)
book = sys.argv[2] if len(sys.argv) > 2 else 'messi'
root = Path(__file__).resolve().parents[1] / 'public/voice/books' / book
root.mkdir(parents=True, exist_ok=True)
manifest = {'voice':'kokoro_af_bella','engine':'Kokoro-82M','speed':1.0,'pages':{}}
for page in json.loads(Path(sys.argv[1]).read_text()):
    clips, cues, offset = [], [], 0.0
    for text in page['sentences']:
        spoken = text.replace('1–0','one to nil').replace('3–3','three all').replace('4–2','four to two')
        words = ['nil','one','two','three','four','five','six','seven','eight','nine']
        spoken = re.sub(r'(\d)–(\d)', lambda m: words[int(m.group(1))]+' '+('all' if m.group(1)==m.group(2) else words[int(m.group(2))]), spoken)
        spoken = spoken.replace('Ballon d’Or','Ballon d\'Or')
        parts = []
        for result in pipeline(spoken, voice='af_bella', speed=1.0):
            parts.append(result.audio.numpy() if hasattr(result.audio,'numpy') else np.asarray(result.audio))
        if not parts: raise RuntimeError('Empty Coach Bella speech: '+page['id'])
        clip = np.concatenate(parts + [np.zeros(2400, dtype=np.float32)])
        if not np.isfinite(clip).all(): raise RuntimeError('Invalid speech samples')
        seconds = len(clip)/24000
        cues.append({'text':text,'start':round(offset,3),'duration':round(seconds,3)})
        clips.append(clip)
        offset += seconds
    target = root / (page['id']+'.m4a')
    with tempfile.TemporaryDirectory(prefix='bella-book-') as temp:
        wav = Path(temp)/'page.wav'
        sf.write(wav,np.concatenate(clips),24000)
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','loudnorm=I=-18:TP=-2:LRA=11','-ac','1','-ar','24000','-c:a','aac','-b:a','64k',str(target)],check=True)
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(target)],text=True))
    manifest['pages'][page['id']]={'src':f"/voice/books/{book}/{page['id']}.m4a?v=coach-bella-1",'duration':round(duration,3),'scriptSha256':page['scriptSha256'],'cues':cues}
    print(f"{page['id']}: Coach Bella {duration:.2f}s",flush=True)
(root/'narration.json').write_text(json.dumps(manifest,indent=2)+'\n')
