"""Re-voice island lesson lines (public/voice/kokoro_<voice>/<hash>.m4a) with local Kokoro + the shared lexicon.

The lesson clips were first baked by the V1 kokoro-onnx worker (espeak phonemes), which mispronounces loanwords such
as fixo, ala and goleiro. This re-renders selected lines with the same Kokoro-82M model and coach voice, but through
misaki + scripts/plays/pronunciations.json, at the original pace and encoding (speed 1.0, mono AAC 32 kb/s, 24 kHz).
File names stay the FNV-1a hash of the cleaned line, so lesson data and runtime lookups are untouched; only the
clip durations in public/lessons/*.json (and generated-voice.json when listed) are refreshed.

Usage:  <python with kokoro installed> scripts/plays/kokoro-lessons.py [--voices af_bella,af_heart,af_sarah,am_michael]
                                                                     [--dry-run] [hash ...]
With no hashes it re-voices every line containing a lexicon word (or "futsal", which espeak read as "FUT-sul").
Runs fully offline after the first model download; no paid service.
"""
import glob, json, re, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
import espeakng_loader
if Path('/opt/homebrew/share/espeak-ng-data').exists():
    espeakng_loader.get_data_path = lambda: '/opt/homebrew/share/espeak-ng-data'
    espeakng_loader.get_library_path = lambda: '/opt/homebrew/lib/libespeak-ng.dylib'
sys.path.insert(0, str(Path(__file__).resolve().parent))
from kokoro_lexicon import LEXICON_FILE, apply_lexicon

ROOT = Path(__file__).resolve().parents[2]
SPEED, RATE, BITRATE = 1.0, 24000, '32000'
# RMS level of each coach's V1 bakes (measured with ffmpeg volumedetect), so re-voiced lines sit level with the rest
TARGET_DBFS = {'af_bella': -21.2, 'af_heart': -22.4, 'af_sarah': -21.0, 'am_michael': -24.0}
args = sys.argv[1:]
voices = ['af_bella', 'af_heart', 'af_sarah', 'am_michael']
if '--voices' in args:
    i = args.index('--voices'); voices = args[i + 1].split(','); del args[i:i + 2]
dry = '--dry-run' in args
wanted = [a for a in args if not a.startswith('--')]

# ---- the V1 cleaning + hashing contract (lib/voice.ts cleanNarration, lib/voiceFiles.ts voiceFileHash) ----
POS = {'GK': 'goalkeeper', 'CB': 'center back', 'LCB': 'left center back', 'RCB': 'right center back', 'LB': 'left back', 'RB': 'right back',
       'LWB': 'left wing back', 'RWB': 'right wing back', 'CDM': 'defensive midfielder', 'CM': 'center midfielder', 'LCM': 'left central midfielder',
       'RCM': 'right central midfielder', 'CAM': 'attacking midfielder', 'LM': 'left midfielder', 'RM': 'right midfielder', 'LW': 'left winger',
       'RW': 'right winger', 'ST': 'striker', 'CF': 'center forward', 'FB': 'fullback', 'FIXO': 'fixo', 'ALA': 'ahlah', 'PIVOT': 'pivot', 'GOLEIRO': 'goleiro'}
POS_RE = re.compile(r'\b(GOLEIRO|PIVOT|FIXO|ALA|LWB|RWB|LCB|RCB|LCM|RCM|CDM|CAM|GK|CB|LB|RB|CM|LM|RM|LW|RW|ST|CF|FB)\b')
def clean(t):
    t = POS_RE.sub(lambda m: POS[m.group(0)], t)
    t = re.sub(r'(\d)\s*v\s*(\d)', r'\1 v \2', t, flags=re.I)
    t = re.sub('[→⇒➜➡]', ' to ', t); t = re.sub('[←⬅]', ' from ', t); t = re.sub('[—–]', ', ', t)
    t = t.replace('·', ', ').replace('&', ' and '); t = re.sub(r'[*_`#~|]', '', t)
    t = re.sub('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️‍←-⇿]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()
def fnv(s):
    h = 0xcbf29ce484222325
    for b in s.encode(): h = ((h ^ b) * 0x100000001b3) & 0xffffffffffffffff
    return f'{h:016x}'
# V1 genvoice.mjs speakText: emphasis caps are read as words, position abbreviations stay letter-read
SPELLED = {'GK', 'LB', 'RB', 'CB', 'LCB', 'RCB', 'CM', 'LCM', 'RCM', 'DM', 'CDM', 'AM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF', 'LWB', 'RWB', 'LDM', 'RDM', 'LF', 'RF'}
speak = lambda l: re.sub(r'\b[A-Z]{2,}\b', lambda m: m.group(0) if m.group(0) in SPELLED else m.group(0)[0] + m.group(0)[1:].lower(), l)

# ---- every voiced lesson line: hash -> text, and every place its duration is stored ----
lessons = {f: json.loads(Path(f).read_text()) for f in sorted(glob.glob(str(ROOT / 'public/lessons/*.json'))) if Path(f).name[0].isdigit() or 'futsal' in f}
lines, slots = {}, []  # slots: (voice dict) to refresh
def visit(text, voice):
    if not text or not isinstance(voice, dict): return
    c = clean(text); h = fnv(c)
    for tag, v in voice.items():
        if isinstance(v, dict) and v.get('src', '').endswith(f'/{h}.m4a'):
            lines[h] = c; slots.append((h, tag, v))
for L in (x for data in lessons.values() for x in data):
    for s in L.get('steps', []): visit(s.get('say') or s.get('desc'), s.get('voice'))
    for q in L.get('questions', []):
        visit(q.get('q'), q.get('voice')); visit(q.get('explain'), q.get('explainVoice'))
        it = q.get('interact') or {}
        opts = it.get('candidates') or it.get('cells') or it.get('zones') or it.get('spots') or it.get('paths') or []
        for o, v in zip(opts, q.get('choiceVoices') or []): visit(o.get('why') or q.get('explain'), v)
        if not opts:  # visual questions (docs/quiz-design.md): one "why" line per option
            for t, v in zip(q.get('choiceExplanations') or [], q.get('choiceVoices') or []): visit(t, v)

if not wanted:
    lex = json.loads(LEXICON_FILE.read_text())['words']
    def uses_lexicon(line):
        for tok in re.findall(r"[\w'’-]+", speak(line)):
            b = re.sub(r"['’]s?$", '', tok)
            if b.lower() == 'futsal' or any(c in lex for c in (b, b.lower(), b[:-1].lower() if b.lower().endswith('s') else '')):
                return True
        return False
    wanted = sorted(h for h, c in lines.items() if uses_lexicon(c))
missing = [h for h in wanted if h not in lines]
if missing: sys.exit(f'unknown lesson line hashes: {missing}')
print(f'{len(wanted)} lines x {len(voices)} voices' + (' (dry run)' if dry else ''), flush=True)
if dry:
    for h in wanted: print(h, speak(lines[h]))
    sys.exit()

from kokoro import KPipeline
pipeline = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
apply_lexicon(pipeline)
durations = {}
for voice in voices:
    tag = 'kokoro_' + voice
    for n, h in enumerate(wanted, 1):
        parts = [r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio) for r in pipeline(speak(lines[h]), voice=voice, speed=SPEED)]
        wave = np.concatenate(parts) if parts else np.zeros(RATE // 2, dtype=np.float32)
        # match the V1 bakes: kokoro-onnx trims edge silence, and each coach has its own level
        loud = np.flatnonzero(np.abs(wave) > 0.01)
        if loud.size: wave = wave[max(0, loud[0] - int(RATE * .03)):loud[-1] + int(RATE * .08)]
        rms = float(np.sqrt(np.mean(wave ** 2))) or 1.0
        wave = np.clip(wave * (10 ** (TARGET_DBFS.get(voice, -21.5) / 20) / rms), -.99, .99).astype(np.float32)
        dest = ROOT / f'public/voice/{tag}/{h}.m4a'
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp, tempfile.NamedTemporaryFile(suffix='.m4a', dir=dest.parent, delete=False) as part:
            sf.write(tmp.name, wave, RATE)
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp.name, '-ac', '1', '-ar', str(RATE), '-c:a', 'aac', '-b:a', BITRATE, '-f', 'mp4', part.name], check=True)
            Path(part.name).replace(dest)
        seconds = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(dest)], capture_output=True, text=True, check=True).stdout)
        durations[(h, tag)] = round(seconds, 6)
        print(f'{tag} {n}/{len(wanted)} {h} {seconds:.2f}s', flush=True)

for h, tag, v in slots:
    if (h, tag) in durations: v['duration'] = durations[(h, tag)]
for f, data in lessons.items():
    Path(f).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))  # the files are compact JSON
gen = ROOT / 'public/lessons/generated-voice.json'
if gen.exists():
    g = json.loads(gen.read_text())
    for (h, tag), d in durations.items():
        if h in g.get(tag, {}): g[tag][h]['duration'] = d
    gen.write_text(json.dumps(g, indent=2))
print('updated durations in', len(lessons), 'lesson files')
