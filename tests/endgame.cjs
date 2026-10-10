// Endgame (Lane 2, Sep 30 2026; docs/endgame-2026-09-30.md): graduation per format, certificates, the Matchday Ferry finale,
// the History Museum and the Trophy shelf. Drives the REAL stores (quest/quiz progress, graduation record) over an in-memory
// localStorage; a fresh module graph per load() is a page reload (module state gone, storage kept). usage: node tests/endgame.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const storage=new Map();
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const events=[];
const window={addEventListener(){},removeEventListener(){},dispatchEvent:e=>{events.push(e.type);return true;},location:{search:''}};
class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
const STUBS={react:{useMemo:f=>f(),useSyncExternalStore:(_s,get)=>get(),useState:v=>[v,()=>{}],useEffect(){},useRef:v=>({current:v})},'lib/town/learningProgress.ts':{isLearningPreview:()=>false}};
function loader(){
 const cache=new Map();
 function load(file){
  const rel=path.relative(root,file);if(STUBS[rel])return STUBS[rel];if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInNewContext(out,{exports:mod.exports,module:mod,Math,JSON,Set,Map,WeakMap,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,parseFloat,parseInt,encodeURIComponent,decodeURIComponent,console,
   localStorage,window,CustomEvent,location:window.location,navigator:undefined,document:undefined,setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'}},
   require:id=>{if(STUBS[id])return STUBS[id];if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
    for(const f of [base,base+'.ts',base+'.tsx',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);throw new Error('Cannot resolve '+id+' from '+file);}});
  return mod.exports;
 }
 return rel=>load(path.join(root,rel));
}
let at=loader();
const reload=()=>{at=loader();};
const reset=()=>{storage.clear();events.length=0;reload();};
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const M=()=>at('lib/endgame/graduationModel.ts'),S=()=>at('lib/endgame/graduationStore.ts'),Y=()=>at('lib/endgame/graduationSync.ts');
const {FORMAT_PATHS}=at('lib/paths/formatPaths.ts');
const finishPath=(format,skipLast=false)=>{const quiz=at('lib/town/quizProgress.ts'),quest=at('lib/town/questProgress.ts');const p=FORMAT_PATHS.find(x=>x.format===format);const lessons=p.chapters.flatMap(c=>c.lessons);
 lessons.forEach((l,li)=>{for(let i=0;i<l.steps;i++)quest.recordQuestStep(format,l.id,i);for(let i=0;i<l.questions;i++)if(!(skipLast&&li===lessons.length-1&&i===l.questions-1))quiz.recordCorrectQuizAnswer(format,l.id,i);});};

// ---- 1. Pure model ------------------------------------------------------------------------------------------------------
{
 const m=M();let r=m.emptyGraduations();
 same(m.GRADUATION_FORMATS,['futsal','7v7','9v9','11v11'],'four formats in path order');
 let x=m.mergeFinished(r,['7v7','nonsense'],1000);same(x.added,['7v7'],'only real formats graduate');r=x.record;
 assert.equal(m.mergeFinished(r,['7v7'],2000).record,r,'second merge is a no-op (same object: no write)');
 assert.equal(m.mergeFinished(r,[],3000).record.formats['7v7'].at,1000,'never removed, date kept');
 same(m.unseenGraduations(r),['7v7'],'ceremony pending');
 r=m.markGraduationsSeen(r,['7v7']);same(m.unseenGraduations(r),[],'seen once → never again');
 assert.equal(m.markGraduationsSeen(r,['7v7']),r,'marking twice is a no-op');
 assert.equal(m.ferryUnlocked(r),false,'1/4: ferry locked');
 assert.equal(m.recordFinale(r,{firstTry:5,total:10},4000),r,'finale cannot be recorded while the ferry is locked');
 r=m.mergeFinished(r,['futsal','9v9'],5000).record;assert.equal(m.ferryUnlocked(r),false,'3/4 still locked');
 r=m.mergeFinished(r,['11v11'],6000).record;assert.equal(m.ferryUnlocked(r),true,'4/4 opens the ferry');
 same(m.unseenGraduations(r),['futsal','9v9','11v11'],'unseen oldest first, path order on ties');
 r=m.recordFinale(r,{firstTry:6,total:10},7000);same(r.finale,{at:7000,firstTry:6,total:10,runs:1,seen:false},'finale saved');
 r=m.recordFinale(r,{firstTry:4,total:10},8000);same([r.finale.at,r.finale.firstTry,r.finale.runs],[7000,6,2],'a worse ride keeps the best score and first date');
 r=m.recordFinale(r,{firstTry:9,total:10},9000);assert.equal(r.finale.firstTry,9,'a better ride improves the diploma');
 assert.equal(m.recordFinale(r,{firstTry:99,total:10},1).finale.firstTry<=10,true,'first-try clamped to total');
 // Sanitising / migration safety: junk, partial, future-version data never throws and keeps what it understands.
 same(m.sanitizeGraduations(null),m.emptyGraduations());same(m.sanitizeGraduations('x'),m.emptyGraduations());
 same(m.sanitizeGraduations({version:7,formats:{'7v7':{at:5,seen:true},bogus:{at:1},'9v9':{at:'nope'}},finale:{at:0}}),{version:1,formats:{'7v7':{at:5,seen:true}},finale:null},'future version: keeps valid entries');
 same(m.sanitizeGraduations({formats:{'7v7':{at:5}}}),{version:1,formats:{'7v7':{at:5,seen:false}},finale:null},'version-less save accepted, seen defaults false');
 assert.equal(m.CAP_REWARDS.length,5);assert.ok(m.CAP_REWARDS.every(c=>/^#[0-9a-f]{6}$/i.test(c.color)&&/^#[0-9a-f]{6}$/i.test(c.color2)&&c.why.length>10));
 same(m.NEXT_FORMAT['7v7'][0],'9v9','7v7 → 9v9');same(m.NEXT_FORMAT['9v9'][0],'11v11','9v9 → 11v11');
 console.log('PASS graduation model: once per format, never removed, seen once, ferry at 4/4, finale best score, sanitising');
}

// ---- 2. Real stores: graduation triggers once per format, persists, retroactive ----------------------------------------
{
 reset();
 assert.equal(Y().syncGraduations().length,0,'fresh save: nothing graduates');
 finishPath('7v7',true);assert.equal(Y().syncGraduations().length,0,'11 of 12 lessons: not yet');
 finishPath('7v7');same(Y().syncGraduations(undefined,1234),['7v7'],'12/12 → 7v7 graduates');
 same(Y().syncGraduations(),[],'a second sync does not trigger again');
 assert.ok(events.includes(S().GRADUATIONS_CHANGED),'change event for the HUD/backpack/ferry lock');
 reload();const rec=S().readGraduations();same(Object.keys(rec.formats),['7v7'],'certificate persists across a reload');assert.equal(rec.formats['7v7'].at,1234);
 same(M().unseenGraduations(rec),['7v7'],'ceremony still pending after reload (it shows once)');
 S().updateGraduations(r=>M().markGraduationsSeen(r,['7v7']));reload();same(M().unseenGraduations(S().readGraduations()),[],'seen persists');
 // A regression in quiz storage (e.g. a question added later) can never take a certificate away.
 storage.delete(at('lib/town/quizProgress.ts').QUIZ_STORAGE_KEY);reload();Y().syncGraduations();assert.ok(S().readGraduations().formats['7v7'],'graduation survives lost quiz keys');
 // Retroactive: an existing save that finished paths before this update (no graduation key) graduates on its first load.
 reset();finishPath('futsal');finishPath('9v9');assert.equal(storage.get(S().GRADUATION_KEY),undefined,'old save: no graduation key yet');
 reload();same(Y().syncGraduations().sort(),['9v9','futsal'],'retroactive graduations on load');
 same(M().unseenGraduations(S().readGraduations()).sort(),['9v9','futsal'],'old saves still get their ceremony once');
 // The dev unlock (?unlock=all&paths=1) finishes every path: all four graduate and the ferry opens.
 reset();for(const p of FORMAT_PATHS)finishPath(p.format);Y().syncGraduations();assert.equal(M().ferryUnlocked(S().readGraduations()),true,'4/4 → ferry open');
 // Corrupt storage never throws.
 storage.set(S().GRADUATION_KEY,'{not json');reload();same(S().readGraduations(),M().emptyGraduations(),'corrupt key → empty record');Y().syncGraduations();assert.equal(Object.keys(S().readGraduations().formats).length,4,'…and re-derives from progress');
 console.log('PASS stores: triggers once per format, persists, survives lost quiz keys, retroactive on load, corrupt-safe');
}

// ---- 3. Rewards: graduate cap colours gated by graduation --------------------------------------------------------------
{
 reset();const C=at('lib/town/customization.ts');const caps=C.CUSTOMIZATION_OPTIONS.headwearColor.filter(o=>o.graduate);
 same(caps.map(o=>o.id),['grad-futsal','grad-7v7','grad-9v9','grad-11v11','grad-champion'],'five cap colourways');
 assert.ok(caps.every(o=>!C.isCustomizationUnlocked(o,0,0)),'all locked on a fresh save');
 const saved={...C.DEFAULT_CUSTOMIZATION,headwear:'cap',headwearColor:'grad-7v7'};
 assert.notEqual(C.sanitizeCustomization(saved).headwearColor,'grad-7v7','a locked cap colour cannot be worn');
 assert.match(C.graduateLockNote(caps[1]),/Graduate the 7v7 path/);assert.match(C.graduateLockNote(caps[4]),/Matchday Ferry/);
 assert.equal(C.graduateLockNote(C.CUSTOMIZATION_OPTIONS.headwearColor[0]),null);
 finishPath('7v7');Y().syncGraduations();reload();const C2=at('lib/town/customization.ts');
 assert.equal(C2.sanitizeCustomization(saved).headwearColor,'grad-7v7','worn after graduating');
 assert.equal(C2.isCustomizationUnlocked(C2.CUSTOMIZATION_OPTIONS.headwearColor.find(o=>o.id==='grad-9v9'),0,0),false,'other formats stay locked');
 console.log('PASS rewards: graduate cap colours locked until that path graduates, champion gold after the final');
}

// ---- 4. Finale: exam picks, draw-the-pass judging -----------------------------------------------------------------------
{
 const F=at('lib/endgame/finale.ts');
 const sources=FORMAT_PATHS.map(p=>({format:p.format,lessons:JSON.parse(fs.readFileSync(path.join(root,'public/lessons',p.format+'.json'),'utf8')),starter:p.chapters.flatMap(c=>c.lessons).map(l=>l.id)}));
 const a=F.pickExam(sources,42),b=F.pickExam(sources,42);same(a,b,'same seed, same exam');
 assert.equal(a.length,8,'2 questions × 4 formats');
 for(const f of ['futsal','7v7','9v9','11v11']){const qs=a.filter(p=>p.format===f);assert.equal(qs.length,2,f);assert.notEqual(qs[0].lessonId,qs[1].lessonId,`${f}: two different lessons`);
  const src=sources.find(s=>s.format===f);for(const q of qs){assert.ok(src.starter.includes(q.lessonId),'review comes from the starter lessons');const question=src.lessons.find(l=>l.id===q.lessonId).questions[q.index];assert.ok(question.visual&&F.EXAM_KINDS.has(question.visual.kind),'a picture question VisualQuestion renders');}}
 same(a.map(p=>p.format),['futsal','futsal','7v7','7v7','9v9','9v9','11v11','11v11'],'path order');
 const seeds=new Set();for(let s=1;s<30;s++)seeds.add(JSON.stringify(F.pickExam(sources,s)));assert.ok(seeds.size>5,'rides differ');
 for(const p of F.DRAW_PASS_PROBLEMS){const right=p.mates.map((_,i)=>F.drawPassJudge(p,i).ok);assert.equal(right.filter(Boolean).length,1,`${p.id}: exactly one right pass`);assert.equal(p.why.length,p.mates.length,`${p.id}: a why per team-mate`);
  const best=F.bestTarget(p);assert.ok(!F.laneBlocked(p.carrier,p.mates[best],p.defenders),'the right pass has an open lane');
  assert.equal(F.targetAt(p,{x:p.mates[best].x+1,y:p.mates[best].y}),best,'a line released near a team-mate picks them');assert.equal(F.targetAt(p,{x:-50,y:-50}),-1,'a line into nowhere picks nobody');
  assert.equal(F.drawPassJudge(p,-1).ok,false);}
 console.log('PASS finale: 2 review questions per format from starter lessons (deterministic per seed), draw-the-pass has one open-lane answer');
}

// ---- 5. Museum: exhibits unlock by collection ---------------------------------------------------------------------------
{
 const X=at('lib/endgame/museum.ts');const zero={balls:0,cards:0,books:0,graduations:0};
 assert.equal(new Set(X.EXHIBITS.map(e=>e.id)).size,X.EXHIBITS.length,'unique ids');
 same(X.GALLERIES.map(g=>g.unlock),['balls','cards','books','graduations'],'one gallery per collection');
 // Every exhibit is free to see (user, Oct 9 2026): a fresh save opens every case.
 same(X.openExhibits(zero).map(e=>e.id),X.EXHIBITS.map(e=>e.id),'fresh save: every case is open');
 assert.ok(X.EXHIBITS.every(e=>e.need===0),'no exhibit needs a collection');
 for(const e of X.EXHIBITS){const g=X.galleryOf(e.gallery);assert.ok(g,e.id);assert.ok(e.facts.length>=2&&e.forYourGame.length>10,e.id);if(e.gallery!=='hall')assert.ok(e.sources.length>=1&&e.sources.every(s=>/^https:\/\//.test(s.url)&&s.title),`${e.id}: sourced`);
  const need={...zero,[g.unlock]:e.need};assert.equal(X.exhibitState(e,need).open,true,`${e.id} opens at ${e.need}`);
  if(e.need>0){const s=X.exhibitState(e,{...zero,[g.unlock]:e.need-1});assert.equal(s.open,false);assert.match(s.lockText,/Collect 1 more/);assert.ok(s.how.length>20,'says how to unlock');}}
  assert.equal(X.openExhibits({balls:100,cards:450,books:40,graduations:4}).length,X.EXHIBITS.length,'a complete save opens every case');
 console.log('PASS museum: every case free, every case sourced, opens by its collection with how-to-unlock copy');
}

// ---- 6. Certificates and the Trophy shelf -------------------------------------------------------------------------------
{
 reset();const m=M(),Cert=at('lib/endgame/certificate.ts'),names=f=>Y().starterLessons(f).map(l=>l.name);
 let r=m.mergeFinished(m.emptyGraduations(),['9v9'],Date.UTC(2026,8,30)).record;
 const spec=Cert.certificateSpec('grad:9v9',r,names);assert.equal(spec.title,'9v9 Graduate');same(spec.lines,names('9v9'),'the 12 ideas learned');assert.equal(spec.lines.length,12);
 assert.equal(Cert.certificateSpec('grad:7v7',r,names),null,'no certificate before graduating');assert.equal(Cert.certificateSpec('diploma',r,names),null,'no diploma before the final');
 const text=JSON.stringify(spec);assert.ok(!/name|age|email|@/i.test(text.replace(/"lines":\[[^\]]*\]/,'')),'no personal data fields');
 same(Cert.certificateIds(r),['grad:9v9']);assert.ok(Cert.isCertificateId('diploma')&&Cert.isCertificateId('grad:futsal')&&!Cert.isCertificateId('grad:5v5'));
 for(const f of ['futsal','7v7','11v11'])r=m.mergeFinished(r,[f],1).record;r=m.recordFinale(r,{firstTry:7,total:10},Date.UTC(2026,9,1));
 const d=Cert.certificateSpec('diploma',r,names);assert.equal(d.title,'Matchday Champion');assert.match(d.lines.at(-1),/7 of 10/);
 const T=at('lib/endgame/backpackTrophies.ts'),B=at('lib/town/backpack.ts');
 same(T.trophiesFrom(r).map(t=>t.id),['grad:futsal','grad:7v7','grad:9v9','grad:11v11','diploma'],'shelf: four certificates + diploma');
 const cat=B.backpackCategory('trophy');assert.ok(cat,'Trophy shelf registered');assert.equal(B.backpackCategories().at(-1).kind,'trophy','after the other collections');
 same(cat.collect({owned:[],history:[],cards:[],packs:[],starter:null,trophies:T.trophiesFrom(r)}).map(i=>i.id),['trophy:grad:futsal','trophy:grad:7v7','trophy:grad:9v9','trophy:grad:11v11','trophy:diploma']);
 same(cat.collect({owned:[],history:[],cards:[],packs:[],starter:null}),[],'old sources shape: empty shelf');
 console.log('PASS certificates: 12 ideas per path, diploma after the final, no personal data; Trophy shelf lists them');
}
// QA11: the finale scores against the questions actually asked (fewer picks, skipped rounds, "Skip to the passes"), not a fixed 10.
{
 const f=fs.readFileSync(path.join(root,'components/MatchdayFinale.tsx'),'utf8');
 assert.match(f,/const finish=\(\)=>\{const total=tried\.current\.size;setAsked\(total\);updateGraduations\(r=>recordFinale\(r,\{firstTry:firstTry\.current\.size,total\}/,'recordFinale gets the asked count');
 assert.match(f,/You answered \{score\} of \{total\} right first time/,'the trophy line uses the asked count');
 assert(!/total:TOTAL/.test(f)&&!/of \{TOTAL\}/.test(f),'no fixed total in the score');
 console.log('PASS finale score counts the questions actually asked');
}
// Oct 3 2026 play-through: the intro promised "one last test before the big match" (there is no match: a live-match finale was
// rejected for heat) and "every answer counts", while the trophy counts first tries and is always reached.
{const f=fs.readFileSync(path.join(root,'components/MatchdayFinale.tsx'),'utf8');
 assert(!/big match/.test(f),'the intro does not promise a match');assert(!/Every answer counts/.test(f),'the intro does not misstate the scoring');
 assert(/you try again\. Keep going and you lift the trophy!/.test(f),'retry until right, then the trophy');
 console.log('PASS finale intro copy matches what happens');}
console.log('Endgame: all checks passed.');
