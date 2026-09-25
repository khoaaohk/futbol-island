"""Explicit offline ElevenLabs narration, cached by exact request. Never runs in app/build.

python3 scripts/build-eleven-narration.py --plan
python3 scripts/build-eleven-narration.py --generate [--only futsl]
python3 scripts/build-eleven-narration.py --install
Generation stages audio; installation requires the complete selected set. No automatic
paid retries. API credentials stay in environment/.env.local, outside public assets.
"""
import argparse, base64, hashlib, json, os, re, subprocess, urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/futbol-eleven-narration-v1')
VOICES = ['uIZsnBL0YK1S5j69bAih', 'NFG5qt843uXKj4pFvR7C', 'nzFihrBIvB34imQBuxub', 'Nhs7eitvQWFTQBsf0yiT', 'uKGPYP2uuyRQv8SeFre0']
# Stable assignments, including the explicitly requested futsal introduction.
ASSIGN = {'regulate':0, 'grit':1, 'futsl':2, 'chalk-line':3, 'woven-court':4,
 'kite-turned':0, 'room-to-invent':2, 'place-picture':4, 'loud-track':1,
 'signal-water':0, 'empathy':3, 'house-player':4, 'different-tides':2,
 'harbour-night':1, 'unfinished-map':3, 'pick-a-purpose':4, 'quiet-lantern':0,
 'boat-weather':2, 'more-shirt':3, 'windshield':1, 'reset':0, 'loss':4}

def digest(text): return hashlib.sha256(text.encode()).hexdigest()

def credential():
    key = os.environ.get('ELEVENLABS_API_KEY')
    env = ROOT / '.env.local'
    if not key and env.exists():
        key = next((s.split('=',1)[1].strip().strip('\"\'') for s in env.read_text().splitlines() if s.startswith('ELEVENLABS_API_KEY=')), '')
    if not key: raise RuntimeError('Set ELEVENLABS_API_KEY in .env.local; never put credentials in public files.')
    return key

def request_body(text):
    return {'text':text,'model_id':'eleven_multilingual_v2','voice_settings':{
        'stability':.6,'similarity_boost':.75,'style':.1,'use_speaker_boost':True,'speed':.9}}

def jobs_for(film):
    if film['audio']['mode'] == 'track': return [('track', '\n\n'.join(b['narration'] for b in film['beats']))]
    return [(f'{i+1:02}', b['narration']) for i,b in enumerate(film['beats'])]

def cache_paths(film, part, text):
    fingerprint = digest(VOICES[ASSIGN[film['id']]] + json.dumps(request_body(text),sort_keys=True))
    folder = CACHE / film['id'] / (part+'-'+fingerprint[:16]); folder.mkdir(parents=True,exist_ok=True)
    return folder, fingerprint

def generate(film, part, text):
    folder, fingerprint = cache_paths(film,part,text)
    if (folder/'result.json').exists() and (folder/'audio.mp3').exists():
        print('Cached',film['id'],part,flush=True); return
    voice = VOICES[ASSIGN[film['id']]]
    req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'/with-timestamps?output_format=mp3_44100_128',
        data=json.dumps(request_body(text)).encode(),headers={'xi-api-key':credential(),'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=180) as response:
            result=json.load(response)
            charged=response.headers.get('character-cost')
    except urllib.error.HTTPError as err:
        detail=json.loads(err.read()).get('detail',{})
        raise RuntimeError(f'ElevenLabs HTTP {err.code}: {detail.get("status",detail.get("code"))}: {detail.get("message")}') from None
    audio=base64.b64decode(result.pop('audio_base64'),validate=True)
    alignment=result.get('alignment')
    if not audio or not alignment: raise RuntimeError('Generation missing audio or character timing; no install.')
    if ''.join(alignment['characters']) != text: raise RuntimeError('Alignment does not match unchanged requested script.')
    (folder/'audio.mp3').write_bytes(audio)
    result.update(fingerprint=fingerprint,voiceId=voice,model='eleven_multilingual_v2',scriptSha256=digest(text),characters=len(text),reportedCharacterCost=charged)
    (folder/'result.json').write_text(json.dumps(result))
    print('Generated',film['id'],part,len(text),'characters',flush=True)

def norm_index(text):
    chars=[]; offsets=[]
    for i,c in enumerate(text.lower()):
        if c.isalnum(): chars.append(c);offsets.append(i)
    return ''.join(chars),offsets

def phrase_time(text, alignment, phrase, after=0):
    clean,offsets=norm_index(text); target=norm_index(phrase)[0]
    at=clean.find(target,after)
    if at<0: return None,after
    return float(alignment['character_start_times_seconds'][offsets[at]]),at+len(target)

def monotone(knots, old_end, new_end):
    # Endpoint and caption/cue anchors preserve authored art while speech plays at
    # natural speed. Inconsistent legacy cue guesses cannot reverse the clock.
    result=[[0.,0.]]
    for old,new in sorted(knots):
        if old>result[-1][0]+.015 and new>result[-1][1]+.015 and old<old_end and new<new_end:
            result.append([round(old,4),round(new,4)])
    result.append([round(old_end,4),round(new_end,4)])
    return result

# Offline, pitch-preserving tempo correction. Keep each story's voice consistent
# across its chapters, and leave already brisk recordings at their existing pace.
def story_tempo(film):
    duration=0.
    words=0
    for part,text in jobs_for(film):
        folder,_=cache_paths(film,part,text)
        result=json.loads((folder/'result.json').read_text())
        duration+=float(result['alignment']['character_end_times_seconds'][-1])
        words+=len(re.findall(r"\b[\w’-]+\b",text))
    wpm=60*words/max(duration,.001)
    return round(max(1.,min(1.2,145/wpm)),3)

def install(films):
    manifest={}; provenance={}
    # Validate complete cached work before writing any runtime assets.
    for film in films:
        for part,text in jobs_for(film):
            folder,_=cache_paths(film,part,text)
            if not (folder/'result.json').exists() or not (folder/'audio.mp3').exists():
                raise RuntimeError(f'Missing generated {film["id"]}/{part}; existing stories remain active.')
    for film in films:
        clips=[]; evidence=[]; tempo=story_tempo(film)
        for part,text in jobs_for(film):
            folder,fingerprint=cache_paths(film,part,text); result=json.loads((folder/'result.json').read_text())
            if result['fingerprint']!=fingerprint: raise RuntimeError('Stale cache')
            asset_fingerprint=digest(fingerprint+f'|pace-v2|{tempo}|loudnorm=-18,-2,9')
            relative=f'/stories/eleven/{film["id"]}/{part}-{asset_fingerprint[:12]}.m4a'
            target=ROOT/'public'/relative.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
            if not target.exists():
                subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(folder/'audio.mp3'),'-af',f'atempo={tempo},loudnorm=I=-18:TP=-2:LRA=9','-c:a','aac','-b:a','96k',str(target)],check=True)
            duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(target)]))
            alignment={**result['alignment'],**{key:[t/tempo for t in result['alignment'][key]] for key in ['character_start_times_seconds','character_end_times_seconds']}};knots=[]
            if part=='track':
                for beat in film['beats']:
                    onset,_=phrase_time(text,alignment,beat['narration'])
                    if onset is None: raise RuntimeError('Caption alignment missing')
                    knots.append((beat['start'],onset))
                time_map=monotone(knots,film['audio']['duration'],duration)
                manifest[film['id']]={'mode':'track','src':relative,'duration':duration,'map':time_map}
            else:
                beat=film['beats'][int(part)-1];after=0
                for cue in beat['cues']:
                    onset,after=phrase_time(text,alignment,cue['words'],after)
                    if onset is not None:knots.append((cue['at'],onset))
                seconds=duration+.65
                # Preserve the final painted passage as a .65-second transition
                # after speech, rather than stretching it with narration pace.
                knots=[(o,n) for o,n in knots if o<beat['seconds']-.65 and n<duration]
                knots.append((beat['seconds']-.65,seconds-.65))
                clips.append({'audio':relative,'seconds':seconds,'map':monotone(knots,beat['seconds'],seconds)})
            evidence.append({k:result[k] for k in ['voiceId','model','scriptSha256','characters','reportedCharacterCost']})
            evidence[-1].update(part=part,audio=relative,duration=duration,tempo=tempo,processing='pace-v2')
        if clips:manifest[film['id']]={'mode':'chapters','clips':clips}
        provenance[film['id']]={'title':film['title'],'clips':evidence}
    dest=ROOT/'lib/paths/riso/data/narrationOverrides.json'
    current=json.loads(dest.read_text()) if dest.exists() else {};current.update(manifest)
    dest.write_text(json.dumps(current,indent=2)+'\n')
    report=ROOT/'docs/story-production/elevenlabs-narration-2026-09-22.json'
    prior=json.loads(report.read_text()) if report.exists() else {};prior.update(provenance)
    report.write_text(json.dumps(prior,indent=2)+'\n')
    print('Installed',len(films),'stories. Original audio retained for reversible rollback.')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--plan',action='store_true');parser.add_argument('--generate',action='store_true');parser.add_argument('--install',action='store_true');parser.add_argument('--only')
    args=parser.parse_args();os.chdir(ROOT)
    subprocess.run(['node','scripts/export-eleven-narration.cjs'],check=True)
    films=json.loads(Path('/tmp/futbol-eleven-jobs.json').read_text())
    if args.only:
        wanted=set(args.only.split(','));films=[f for f in films if f['id'] in wanted]
        if {f['id'] for f in films}!=wanted:raise RuntimeError('Unknown story selection')
    print(json.dumps({'stories':len(films),'requests':sum(len(jobs_for(f)) for f in films),'inputCharacters':sum(len(t) for f in films for _,t in jobs_for(f)),'assignments':{f['id']:VOICES[ASSIGN[f['id']]] for f in films}},indent=2),flush=True)
    if args.generate:
        for film in films:
            for part,text in jobs_for(film):generate(film,part,text)
    if args.install:install(films)

if __name__=='__main__':main()
