"""Merge authored visual quiz questions into a lesson catalog (docs/quiz-design.md, "Authoring guide").

    python3 scripts/quiz/merge-visual-questions.py <format> [--check]

Reads scripts/quiz/authored/<format>/<lessonId>.json  ({"lesson": id, "questions": [FieldQuestion with "visual", no voice]}),
replaces that lesson's previously merged visual questions (idempotent) by appending the authored ones AFTER the lesson's
original pitch questions (so saved progress keys format:lesson:index stay valid), and:
  - wires voice slots for q / explain / every choiceExplanation for the four Kokoro coaches (file = FNV-1a of the cleaned line,
    the same contract as scripts/plays/kokoro-lessons.py; duration is kept if the clip already exists, else 0 until voiced),
  - defaults feedback.highlight to the frame's focus actors (the 3D pitch lights them after the answer),
  - rewrites lib/town/quizManifest.json counts for the format,
  - prints the line hashes that still need voicing:  <kokoro python> scripts/plays/kokoro-lessons.py <hash ...>
Structure is validated by tests/visual-quiz.cjs (run it after merging).
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TAGS = ['kokoro_af_bella', 'kokoro_af_heart', 'kokoro_am_michael', 'kokoro_af_sarah']
# ---- keep in sync with scripts/plays/kokoro-lessons.py (lib/voice.ts cleanNarration, lib/voiceFiles.ts voiceFileHash) ----
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

def duration(path):
    if not path.exists(): return 0
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(path)], capture_output=True, text=True)
    try: return round(float(out.stdout), 6)
    except ValueError: return 0

def voice(text, need):
    h = fnv(clean(text)); slots = {}
    for tag in TAGS:
        f = ROOT / f'public/voice/{tag}/{h}.m4a'; d = duration(f)
        if not d: need.add(h)
        slots[tag] = {'src': f'/voice/{tag}/{h}.m4a', 'duration': d}
    return slots

def main():
    fmt = sys.argv[1]; check = '--check' in sys.argv
    cat_path = ROOT / f'public/lessons/{fmt}.json'; lessons = json.loads(cat_path.read_text())
    by_id = {l['id']: l for l in lessons}; need = set(); merged = 0; added = 0
    for f in sorted((ROOT / f'scripts/quiz/authored/{fmt}').glob('*.json')):
        a = json.loads(f.read_text()); L = by_id.get(a['lesson'])
        if not L: sys.exit(f'{f.name}: unknown lesson {a["lesson"]}')
        base = [q for q in L['questions'] if 'visual' not in q]
        new = []
        for q in a['questions']:
            q = dict(q); v = q['visual']
            fr = v.get('frame') or (v.get('pictures') or v.get('frames') or [{}])[0]
            q.setdefault('step', fr.get('step', 0)); q.setdefault('outcomeStep', None); q.setdefault('animate', False)
            if 'feedback' not in q and fr.get('focus'): q['feedback'] = {'highlight': [{'ids': fr['focus'], 'color': [0.92, 0.76, 0.42]}]}
            q['voice'] = voice(q['q'], need); q['explainVoice'] = voice(q['explain'], need)
            q['choiceVoices'] = [voice(t, need) for t in q['choiceExplanations']]
            new.append(q)
        L['questions'] = base + new; merged += 1; added += len(new)
    manifest_path = ROOT / 'lib/town/quizManifest.json'; manifest = json.loads(manifest_path.read_text())
    manifest[fmt] = {l['id']: len(l['questions']) for l in lessons}
    short = [l['id'] for l in lessons if l['questions'] and len(l['questions']) < 5]
    print(f'{fmt}: {merged} lessons merged, {added} visual questions; lessons under 5 questions: {len(short)} {short[:8]}')
    if check: return
    cat_path.write_text(json.dumps(lessons, ensure_ascii=False, separators=(',', ':')))
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    # Paths (lib/paths/formatPaths.json) store each lesson's question count for progress and quiz launches.
    paths_path = ROOT / 'lib/paths/formatPaths.json'; paths = json.loads(paths_path.read_text()); counts = manifest[fmt]
    for p in paths:
        if p['format'] != fmt: continue
        for l in [x for c in p['chapters'] for x in c['lessons']] + p['depth']:
            if l['id'] in counts: l['questions'] = counts[l['id']]
    paths_path.write_text(json.dumps(paths, indent=2, ensure_ascii=False) + '\n')
    print(f'{len(need)} lines need voicing' + (':\n' + ' '.join(sorted(need)) if need else ''))

main()
