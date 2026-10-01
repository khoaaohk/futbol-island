// Oct 1 2026 UI requests: the welcome-back card is a note (no buttons, hides on its own after a few seconds or on a tap), the
// "My football" mastery screen is gone from every surface (the daily Warm-up stays, retitled), and only the closest
// townsperson's name tag shows (held with the HUD arbiter's 1.5 m hysteresis, hidden off screen and in the vending close-up).
// usage: node tests/oct1-ui.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:7,esModuleInterop:true}}).outputText,f);

// ---- 1. Welcome back: a note with no buttons, auto-dismiss, tap-dismiss ------------------------------------------------------
{const card=read('components/WelcomeBack.tsx'),css=read('components/WelcomeBack.module.css'),town=read('components/Town.tsx');
 const W=require('../lib/town/welcomeBack.ts');
 assert(W.WELCOME_BACK_SHOW_MS>=5000&&W.WELCOME_BACK_SHOW_MS<=7000,'about 6 s on screen');
 // No buttons inside the card: the whole card is the one tap target that hides it.
 assert.equal((card.match(/<button\b/g)||[]).length,1,'one button: the card itself');
 assert.match(card,/<button type="button" className=\{`\$\{toast\.toast\} \$\{styles\.card\}`\} role="status" data-hud-slot="guide" data-welcome-back onClick=\{\(\)=>setOpen\(false\)\}>/,'a tap on the card hides it');
 for(const gone of [/data-welcome-go/,/data-welcome-warmup/,/data-welcome-myfootball/,/>Go</,/>Later</,/Warm-up</,/openLearningReview/,/FORMAT_PATH_LAUNCH/,/styles\.actions/])assert.doesNotMatch(card,gone,`no ${gone} on the card`);
 assert.doesNotMatch(css,/\.actions|\.go\b|\.later\b/,'no button styles left');
 // Auto-dismiss: one timeout that runs only while the card is on screen (not blocked, stack not covered); fresh dwell on return.
 assert.match(card,/const onScreen=open&&!blocked&&!held;/);
 assert.match(card,/useEffect\(\(\)=>\{if\(!onScreen\)return;const t=setTimeout\(\(\)=>setOpen\(false\),welcomeDwellMs\(\)\);return\(\)=>clearTimeout\(t\);\},\[onScreen\]\);/,'one timer, cleared when covered');assert.match(card,/NODE_ENV!=='production'[^\n]*__fi2WelcomeMs[^\n]*return WELCOME_BACK_SHOW_MS/,'production always dwells WELCOME_BACK_SHOW_MS; only dev tests may hold the card');
 assert.doesNotMatch(card,/setInterval|requestAnimationFrame/,'no loop');
 assert.match(town,/<WelcomeBack blocked=\{toastBlocked\|\|jobRunning\|\|jobCardShown\} held=\{stackCovered\}\/>/,'Town pauses the dwell while the HUD stack is covered');
 // Balanced copy: the daily-play line wraps into two equal lines.
 assert.match(css,/\.card span\{text-wrap:balance\}/);assert.match(css,/\.card \.note\{[^}]*max-width:30ch;margin-inline:auto\}/,'the note has a sensible measure');
 // Landscape docking kept (the hud-stack test pins the exact rule).
 assert.match(css,/@media \(orientation:landscape\) and \(max-height:500px\)\{[\s\S]*\.card\[data-welcome-back\]\{position:absolute;top:0;/);
 // Behaviour of the dwell logic, simulated with fake timers: shows, pauses while covered, restarts, hides; a tap hides at once.
 {let now=0;const timers=new Map();let id=0;const setT=(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id;},clearT=i=>timers.delete(i);
  const run=t=>{now=t;for(const [i,x] of [...timers])if(x.at<=now){timers.delete(i);x.fn();}};
  let open=true,t=null;const sync=(onScreen)=>{if(t!==null){clearT(t);t=null;}if(onScreen&&open)t=setT(()=>{open=false;},W.WELCOME_BACK_SHOW_MS);};
  sync(true);run(4000);assert(open,'still open at 4 s');sync(false);run(20000);assert(open,'covered: the dwell waits');
  sync(true);run(20000+W.WELCOME_BACK_SHOW_MS-1);assert(open,'a fresh dwell after it is uncovered');run(20000+W.WELCOME_BACK_SHOW_MS);assert(!open,'hides on its own');}
 console.log('WELCOME_CARD_PASS no buttons, ~6 s auto-dismiss (paused while covered), tap to dismiss, balanced two-line note');}

// ---- 2. No "My football" anywhere the player can reach ----------------------------------------------------------------------
{const files=[];const walk=d=>{for(const e of fs.readdirSync(path.join(ROOT,d),{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx?|css|json|mjs|js)$/.test(e.name))files.push(p);}};
 for(const d of ['components','app','lib'])walk(d);
 assert(files.length>200,'read the source tree');
 // The feature's name (capital M). Ordinary speech like Imani's "my football desk" is not the screen.
 const hits=files.filter(f=>/My football/.test(read(f)));
 assert.deepEqual(hits,[],'"My football" appears nowhere in components/, app/ or lib/');
 const src=files.map(read).join('\n');
 for(const gone of [/openLearningReview\('mastery'\)/,/LearningReviewView/,/data-backpack-mastery/,/data-mastery=/,/STAGE_LABEL\b/,/dueLabel\(/])assert.doesNotMatch(src,gone,`${gone} is gone`);
 // The Warm-up stays: its drawer is titled "Warm-up", has no tabs, and Paths' Review card opens it when lessons are due.
 const drawer=read('components/LearningReview.tsx'),entry=read('components/PathReviewEntry.tsx'),host=read('components/LearningHost.tsx');
 assert.match(drawer,/<h2 id="learning-review-title">Warm-up<\/h2>/);assert.doesNotMatch(drawer,/aria-pressed|function Mastery|LearningJourneys/,'one view, no tabs');
 assert.match(entry,/\{due>0&&<div className=\{styles\.buttons\}><button type="button" className=\{styles\.primary\} data-path-warmup onClick=\{\(\)=>openLearningReview\(\)\}>Warm up<\/button><\/div>\}/,'Paths: Warm up when lessons are due');
 assert.equal((entry.match(/<button\b/g)||[]).length,1,'Paths Review card: one button');
 assert.match(host,/window\.addEventListener\(LEARNING_REVIEW_OPEN,show\)/,'the host still opens the warm-up');
 // Evidence hooks other features use still work: ticks feed For grown-ups' stages, so creditConceptTick stays live.
 assert.match(read('lib/grownups/progress.ts'),/stageOf\(lessonEvidence/);assert.match(read('lib/learning/reviewStore.ts'),/export function creditConceptTick\(/);
 for(const f of ['components/IslandJobs.tsx','components/FishingHost.tsx','components/BallHuntLesson.tsx'])assert.match(read(f),/creditConceptTick/,`${f} still credits ticks`);
 // Old saves keep working: the review key is unchanged and is never cleared.
 assert.match(read('lib/learning/reviewStore.ts'),/export const REVIEW_KEY='fi2-lesson-review-v1';/);assert.doesNotMatch(src,/removeItem\(REVIEW_KEY\)|removeItem\('fi2-lesson-review-v1'\)/);
 console.log(`NO_MY_FOOTBALL_PASS ${files.length} files clean; Warm-up kept (Paths → Warm up), evidence hooks live`);}

// ---- 3. One name tag: the closest townsperson, with hysteresis -------------------------------------------------------------
{const {pickTagFocus,NPC_TAG_MARGIN}=require('../lib/graphics/npcTagFocus.ts');
 assert.equal(NPC_TAG_MARGIN,1.5,'same margin as the HUD arbiter');
 const ok=()=>true,mk=(id,distance,extra={})=>({id,distance,...extra}),R=12;
 const a=mk('a',5),b=mk('b',8),c=mk('c',3);
 assert.equal(pickTagFocus(null,[a,b],ok,R),a,'the closest gets the tag');
 assert.equal(pickTagFocus(null,[mk('x',12),mk('y',30)],ok,R),null,'nobody inside the show range: no tag');
 assert.equal(pickTagFocus(null,[],ok,R),null);
 // Hysteresis: two townsfolk side by side never flicker.
 let focus=pickTagFocus(null,[a,b],ok,R);b.distance=4;assert.equal(pickTagFocus(focus,[a,b],ok,R),a,'1 m closer is not enough');
 b.distance=3.6;assert.equal(pickTagFocus(focus,[a,b],ok,R),a,'1.4 m closer is not enough');
 b.distance=3.5;assert.equal(pickTagFocus(focus,[a,b],ok,R),b,'1.5 m closer takes the tag');
 // Walk between them: the choice switches once, cleanly.
 {const p=mk('p',0),q=mk('q',0);let f=null,switches=0,last=null;for(let x=0;x<=10;x+=.05){p.distance=Math.abs(x-2)+.5;q.distance=Math.abs(x-8)+.5;f=pickTagFocus(f,[p,q],ok,R);if(f!==last){switches++;last=f;}}
  assert.equal(switches,2,'one switch (plus the first pick) on a walk from p to q');
  let f2=null,flips=0,prev=null;for(let i=0;i<200;i++){p.distance=4+Math.sin(i)*.4;q.distance=4+Math.cos(i)*.4;f2=pickTagFocus(f2,[p,q],ok,R);if(prev&&f2!==prev)flips++;prev=f2;}
  assert.equal(flips,0,'jitter between two equally near townsfolk never flips the tag');}
 // Leaving range or becoming ineligible drops the hold at once.
 a.distance=13;b.distance=20;assert.equal(pickTagFocus(a,[a,b],ok,R),null,'out of range: no tag');
 a.distance=2;b.distance=3;assert.equal(pickTagFocus(a,[a,b],x=>x!==a,R),b,'a knocked-over townsperson hands the tag on');
 c.distance=20;assert.equal(pickTagFocus(c,[a,b,c],ok,R),a,'a held focus that walked out of range hands the tag on');
 // Wiring in islandNpcs: labels start hidden, flip only on change, one shown at a time, hidden off screen / flying / vending.
 const src=read('lib/graphics/islandNpcs.ts');
 assert.match(src,/const label=new T\.Sprite\(material\);label\.visible=false;/,'labels start hidden');
 assert.equal((src.match(/label\.visible=/g)||[]).length,3,'label visibility is written only at creation and on change');
 assert.match(src,/if\(show!==shownTag\)\{if\(shownTag\)shownTag\.label\.visible=false;shownTag=show;if\(show\)show\.label\.visible=true;\}/);
 assert.match(src,/tagFocus=pickTagFocus\(tagFocus,entries,tagEligible,desktop\?14:12\);/,'the existing show range');
 assert.match(src,/if\(show&&\(hideTags\|\|truckWitnesses\.has\(show\.id\)\|\|!show\.rig\.root\.visible\)\)show=null;/,'vending close-up / flight rule kept');
 assert.match(src,/if\(show&&camera\)\{viewSphere\.center\.set\([^)]*\);viewSphere\.radius=2;if\(!viewFrustum\.intersectsSphere\(viewSphere\)\)show=null;\}/,'never for an off-screen townsperson');
 assert.match(src,/const nearest=\(player:Position,maxDistance=6\)=>\{if\(tagFocus&&/,'Talk names the tagged townsperson');
 // No per-frame allocation in the selection: a plain loop, no array helpers or closures created in update.
 const pick=read('lib/graphics/npcTagFocus.ts');assert.doesNotMatch(pick,/\.(filter|map|sort|reduce)\(|\[\.\.\./,'allocation-free selection');
 assert.doesNotMatch(src.slice(src.indexOf('const update='),src.indexOf('const visibleInScene')),/pickTagFocus\([^)]*=>/,'no closure per frame');
 console.log('NPC_TAG_PASS nearest only, 1.5 m hysteresis (no flicker), range/eligibility, off screen + vending hidden, change-only writes');}
console.log('OCT1_UI_PASS');
