// Content validation for the Paths lessons, plays and quizzes (public/lessons/<format>.json), Oct 4 2026 (A5 learning pass).
// Structural: every question belongs to a real lesson step, its answer index is valid, every option has its own "why", the
// correct "why" is the main explanation, and pitch-tap options line up with their spots/players/routes. Sync: authored visual
// questions match the catalog, Paths and the quiz manifest count the same questions. Voice: every recorded clip is the recording
// of the line it is attached to (a changed line must drop or re-point its clip, never keep stale audio). Football: format rules
// (no offside in futsal, kick-ins not throw-ins, no heading coaching in 7v7) and kid copy (no internal "checked" notes).
const assert=require('assert'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const FORMATS=['7v7','9v9','11v11','futsal'];
// Voice file names are the FNV-1a hash of the cleaned line (scripts/quiz/merge-visual-questions.py, scripts/plays/kokoro-lessons.py).
const POS={GK:'goalkeeper',CB:'center back',LCB:'left center back',RCB:'right center back',LB:'left back',RB:'right back',LWB:'left wing back',RWB:'right wing back',CDM:'defensive midfielder',CM:'center midfielder',LCM:'left central midfielder',RCM:'right central midfielder',CAM:'attacking midfielder',LM:'left midfielder',RM:'right midfielder',LW:'left winger',RW:'right winger',ST:'striker',CF:'center forward',FB:'fullback',FIXO:'fixo',ALA:'ahlah',PIVOT:'pivot',GOLEIRO:'goleiro'};
const clean=t=>{t=t.replace(/\b(GOLEIRO|PIVOT|FIXO|ALA|LWB|RWB|LCB|RCB|LCM|RCM|CDM|CAM|GK|CB|LB|RB|CM|LM|RM|LW|RW|ST|CF|FB)\b/g,m=>POS[m]);
 t=t.replace(/(\d)\s*v\s*(\d)/gi,'$1 v $2').replace(/[→⇒➜➡]/g,' to ').replace(/[←⬅]/g,' from ').replace(/[—–]/g,', ').replace(/·/g,', ').replace(/&/g,' and ').replace(/[*_`#~|]/g,'');
 t=t.replace(/[\u{1F000}-\u{1FAFF}☀-➿⬀-⯿️‍←-⇿]/gu,' ');return t.replace(/\s+/g,' ').trim();};
const fnv=s=>{let h=0xcbf29ce484222325n;for(const b of Buffer.from(s,'utf8')){h^=BigInt(b);h=(h*0x100000001b3n)&0xffffffffffffffffn;}return h.toString(16).padStart(16,'0');};
const words=s=>s.trim().split(/\s+/).length;
const failures=[];const check=(ok,msg)=>{if(!ok)failures.push(msg);};
const paths=JSON.parse(fs.readFileSync('lib/paths/formatPaths.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('lib/town/quizManifest.json','utf8'));
let lessons=0,questions=0,clips=0;
// Lines rewritten for correctness but not voiced yet: their slots point at the new line's file with duration 0 (shown as text).
const pending=new Set(JSON.parse(fs.readFileSync('scripts/quiz/revoice-pending.json','utf8')).hashes);const pendingSeen=new Set();
function voiceMatches(text,slots,where){for(const [tag,clip] of Object.entries(slots??{})){clips++;const m=/\/voice\/(kokoro_\w+)\/([0-9a-f]{16})\.m4a$/.exec(clip.src??'');
 check(m&&m[1]===tag,`${where}: bad voice src ${clip.src}`);if(!m)continue;check(m[2]===fnv(clean(text)),`${where}: ${tag} clip is not the recording of "${text.slice(0,60)}" (re-voice it or drop the slot)`);if(clip.duration>0)check(fs.existsSync(`public${clip.src}`),`${where}: ${tag} clip file missing ${clip.src}`);
 else{check(pending.has(m[2]),`${where}: ${tag} clip has no duration and is not in scripts/quiz/revoice-pending.json`);pendingSeen.add(m[2]);check(!fs.existsSync(`public${clip.src}`),`${where}: ${m[2]} is voiced now; set its duration (kokoro-lessons.py) and drop it from revoice-pending.json`);}}}
// Ball flight: a step's ballPathType is ground/through or one of the lofted kinds the lesson runtime arcs (formatLessons LOFTED_PATHS).
const lofted=Object.keys(Function('return '+/LOFTED_PATHS:[^=]*=(\{[^}]*\})/.exec(fs.readFileSync('lib/town/formatLessons.ts','utf8'))[1])());
assert(lofted.includes('air')&&lofted.includes('cross')&&lofted.includes('chip'),'lofted ball kinds');
assert(/loftPeak\(teaching\.lesson\.steps\[visualStep\]\?\.ballPathType/.test(fs.readFileSync('lib/town/fieldRuntime.ts','utf8')),'lesson passes arc by ballPathType');
// A wrong answer can go back to the lesson moment it came from (quiz and warm-up).
{const fl=fs.readFileSync('components/FieldLearning.tsx','utf8'),qr=fs.readFileSync('components/QuizReplay.tsx','utf8'),lr=fs.readFileSync('components/LearningReview.tsx','utf8');
 assert(/onRewatch=\{watchThatPart\}/.test(fl)&&/Back to the question/.test(fl)&&/s\.answer!==q\.correct&&onRewatch/.test(qr)&&/Watch that part/.test(qr),'quiz: Watch that part on a wrong answer');
 assert(/openPathLesson\(item\.key,q\.step\)/.test(lr),'warm-up: a missed question opens its lesson moment');}
for(const fmt of FORMATS){
 const catalog=JSON.parse(fs.readFileSync(`public/lessons/${fmt}.json`,'utf8'));const byId=new Map(catalog.map(l=>[l.id,l]));
 const pathLessons=paths.filter(p=>p.format===fmt).flatMap(p=>[...p.chapters.flatMap(c=>c.lessons),...p.depth]);
 // Paths and the manifest must count the same lessons and questions as the catalog.
 for(const pl of pathLessons){const l=byId.get(pl.id);check(l,`${fmt}: Paths lists unknown lesson ${pl.id}`);if(!l)continue;check(pl.questions===l.questions.length,`${fmt}/${pl.id}: Paths says ${pl.questions} questions, catalog has ${l.questions.length}`);check(pl.steps===l.steps.length,`${fmt}/${pl.id}: Paths says ${pl.steps} steps, catalog has ${l.steps.length}`);}
 for(const l of catalog)check((manifest[fmt]??{})[l.id]===l.questions.length,`${fmt}/${l.id}: quizManifest count ${(manifest[fmt]??{})[l.id]} != ${l.questions.length}`);
 for(const l of catalog){lessons++;const where=`${fmt}/${l.id}`;const roster=new Set([...l.offense,...l.defense].map(p=>p.id));
  check(l.steps.length>0,`${where}: no steps`);check(l.questions.length>=5,`${where}: quiz has ${l.questions.length} questions (cards need 5)`);
  // Kid copy: internal research notes must not show on the play list.
  for(const t of [l.name,l.concept,l.desc,l.catalog?.what])check(!/checked (january|february|march|april|may|june|july|august|september|october|november|december)|rule example|\bexample:/i.test(t??''),`${where}: internal note in kid copy "${t}"`);
  l.steps.forEach((s,i)=>{const text=s.say??s.desc;check(!s.ballPathType||['ground','through',...lofted].includes(s.ballPathType),`${where} S${i}: unknown ballPathType ${s.ballPathType}`);check(typeof s.desc==='string'&&s.desc.trim(),`${where} S${i}: no line`);voiceMatches(text,s.voice,`${where} S${i}`);
   for(const m of s.moves??[])check(roster.has(m.id),`${where} S${i}: move for unknown actor ${m.id}`);
});
  const base=l.questions.filter(q=>!q.visual).length;const authoredFile=`scripts/quiz/authored/${fmt}/${l.id}.json`;
  const authored=fs.existsSync(authoredFile)?JSON.parse(fs.readFileSync(authoredFile,'utf8')).questions:[];
  check(authored.length===l.questions.length-base,`${where}: ${authored.length} authored visual questions, catalog has ${l.questions.length-base}`);
  l.questions.forEach((q,i)=>{questions++;const w=`${where} Q${i}`;const n=q.options?.length??0;
   check(Number.isInteger(q.step)&&q.step>=0&&q.step<l.steps.length,`${w}: step ${q.step} is not a lesson step`);
   check(q.outcomeStep==null||Number.isInteger(q.outcomeStep)&&q.outcomeStep>q.step&&q.outcomeStep<l.steps.length,`${w}: outcomeStep ${q.outcomeStep} invalid`);
   check(n>=2&&n<=5,`${w}: ${n} options`);check(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<n,`${w}: correct ${q.correct} out of range`);
   if(q.visual?.kind==='order')check(q.correct===0,`${w}: order questions list options in the right order (correct 0)`);
   if(q.visual?.kind==='trueFalse')check(JSON.stringify(q.options)==='["True","False"]',`${w}: trueFalse options must be True/False`);
   check(typeof q.q==='string'&&q.q.trim().length>0,`${w}: no question text`);
   check(Array.isArray(q.choiceExplanations)&&q.choiceExplanations.length===n,`${w}: every option needs its own why`);
   (q.choiceExplanations??[]).forEach((t,j)=>{check(typeof t==='string'&&words(t)>=4,`${w} why ${j}: too short to explain anything`);check(words(t)<=34,`${w} why ${j}: over 34 words`);
    if(j!==q.correct)check(t!==q.choiceExplanations[q.correct],`${w} why ${j}: a wrong option repeats the right answer's why`);
    if(j!==q.correct)check(!/^(wrong|no)\b/i.test(t),`${w} why ${j}: start with the football reason, not "Wrong/No"`);});
   // Picture questions show the correct option's why as the main feedback (docs/quiz-design.md); the original pitch-tap questions
   // keep a fuller main explanation beside their short per-spot whys (QUIZ-OUTCOME-REVIEW.md), so only the visual ones must match.
   if(q.visual)check(q.explain===q.choiceExplanations?.[q.correct],`${w}: explain must equal the correct option's why`);else check(typeof q.explain==='string'&&words(q.explain)>=6,`${w}: main explanation too short to say why`);
   check(words(q.q)<=34,`${w}: question over 34 words`);
   // Pitch-tap questions: one marked option per choice, exactly one correct, and it is the answer index.
   if(q.interact){const list=q.interact.candidates??q.interact.cells??q.interact.zones??q.interact.spots??q.interact.paths??[];
    check(list.length===n,`${w}: ${list.length} pitch options for ${n} answers`);check(list.filter(o=>o.correct).length===1&&list[q.correct]?.correct===true,`${w}: the pitch's correct option is not answer ${q.correct}`);
    list.forEach((o,j)=>{if(o.why)check(o.why===q.choiceExplanations[j],`${w}: pitch why ${j} differs from choiceExplanations`);if(o.id&&q.interact.candidates)check(roster.has(o.id),`${w}: candidate ${o.id} not in lesson`);});}
   if(q.visual){const fr=q.visual.frame??q.visual.pictures?.[0]??q.visual.frames?.[0];const frames=[q.visual.frame,...(q.visual.pictures??[]),...(q.visual.frames??[])].filter(Boolean);
    for(const f of frames){check(Number.isInteger(f.step)&&f.step<l.steps.length,`${w}: picture step ${f.step} invalid`);for(const id of [...(f.focus??[]),...(f.hide??[]),...Object.keys(f.place??{})])check(roster.has(id),`${w}: picture names unknown actor ${id}`);}
    check(fr||q.visual.kind==='order',`${w}: visual question without a picture`);
    const a=authored[i-base];check(a&&a.q===q.q&&a.correct===q.correct&&JSON.stringify(a.options)===JSON.stringify(q.options)&&JSON.stringify(a.choiceExplanations)===JSON.stringify(q.choiceExplanations)&&JSON.stringify(a.visual)===JSON.stringify(q.visual),`${w}: catalog and ${authoredFile} disagree (edit both or re-merge)`);}
   voiceMatches(q.q,q.voice,`${w} question`);voiceMatches(q.explain,q.explainVoice,`${w} explain`);(q.choiceExplanations??[]).forEach((t,j)=>voiceMatches(t,q.choiceVoices?.[j],`${w} why ${j}`));
   const text=[q.q,...(q.options??[]),...(q.choiceExplanations??[])].join(' ');
   // Format rules (IFAB Futsal Laws: no offside, kick-ins, goal clearance throws; US Soccer: no heading at U10 and younger).
   if(fmt==='futsal'){check(!/\boffside\b/i.test(text)||/no offside/i.test(text),`${w}: futsal has no offside`);check(!/\bthrow-?ins?\b/i.test(text)||/not a throw-?in/i.test(text),`${w}: futsal restarts from the touchline are kick-ins`);}
   if(fmt==='7v7')check(!/\bhead(er|ers|ing)?\b(?! (up|start|toward|towards|for|to|back|down|across|forward|into|away|over|off|inside|outside|wide|out))/i.test(text),`${w}: no heading coaching in 7v7 (US Soccer heading guideline)`);
  });
  for(const s of l.steps){const t=s.say??s.desc;if(fmt==='futsal'){check(!/\boffside\b/i.test(t)||/no offside/i.test(t),`${where}: futsal step mentions offside: "${t}"`);check(!/\bthrow-?ins?\b/i.test(t)||/not a throw-?in/i.test(t),`${where}: futsal step says throw-in: "${t}"`);}}
 }
}
for(const h of pending)check(pendingSeen.has(h),`revoice-pending.json lists ${h}, which no lesson line uses any more`);
if(failures.length){console.error(failures.slice(0,80).join('\n'));console.error(`learning-content: ${failures.length} problems`);process.exit(1);}
console.log(`learning-content: ${lessons} lessons, ${questions} questions, ${clips} voice clips checked (${pending.size} lines waiting for voicing)`);
