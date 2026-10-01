// Game-audit quick wins (Sep 30 2026, lane 1): production gating of test flags and lab pages, the one first path and Continue,
// the quiz resume reward and feedback text, the daily bonus on rides, the welcome-back day check, the Explore items and their
// save evidence, the quiz framing reserve, and the lesson goals. Loads the REAL modules (TypeScript transpiled into a vm).
// usage: node tests/new-player-flow.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
function memoryStorage(){const m=new Map();return {m,getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()};}
function world({nodeEnv='development',hostname='localhost',search='',local=memoryStorage()}={}){
 const location={hostname,search,href:`http://${hostname}:8092/${search}`,pathname:'/',hash:''};
 const events=[];const window={location,dispatchEvent:e=>{events.push(e);return true;},addEventListener(){},removeEventListener(){}};
 class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
 const cache=new Map();
 const globals={Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,localStorage:local,window,CustomEvent,URL,URLSearchParams,location,
  queueMicrotask,setTimeout,clearTimeout,process:{env:{NODE_ENV:nodeEnv}}};
 function load(file){
  if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInNewContext(out,{...globals,exports:mod.exports,module:mod,require:id=>{
   if(id==='next/navigation')return {notFound:()=>{throw Object.assign(new Error('NEXT_NOT_FOUND'),{notFound:true});}};
   if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
  return mod.exports;
 }
 return {local,events,load:rel=>load(path.join(root,rel))};
}
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

// ---- 1. Production gating (G-16) --------------------------------------------------------------------------------------------
{
 const V=world().load('lib/town/vendingPreview.ts');
 const env=(nodeEnv,hostname)=>({nodeEnv,hostname});
 assert.equal(V.isVendingPreview('?preview=all',env('development','localhost')),true,'dev + localhost keeps the preview');
 assert.equal(V.isVendingPreview('?preview=all',env('development','127.0.0.1')),true);
 assert.equal(V.isVendingPreview('?preview=all',env('production','localhost')),false,'a production build ignores ?preview=all');
 assert.equal(V.isVendingPreview('?preview=all',env('production','futbolisland.app')),false,'the live site ignores ?preview=all');
 assert.equal(V.isVendingPreview('?preview=all',env('development','192.168.1.20')),false,'a LAN IP (a phone on the dev server) ignores it');
 assert.equal(V.isVendingPreview('',env('development','localhost')),false);
 assert.equal(V.testCoinsRequested('?preview=all&testCoins=50000',env('development','localhost')),true,'the 50,000 grant still works in dev');
 assert.equal(V.testCoinsRequested('?preview=all&testCoins=50000',env('production','futbolisland.app')),false,'no 50,000 coins on production');
 assert.equal(V.testCoinsRequested('?testCoins=50000',env('development','localhost')),false,'testCoins needs the preview flag');
 // Default env comes from process.env + window.location.
 assert.equal(world({nodeEnv:'production',hostname:'futbolisland.app',search:'?preview=all&testCoins=50000'}).load('lib/town/vendingPreview.ts').testCoinsRequested(),false);
 assert.equal(world({nodeEnv:'development',hostname:'localhost',search:'?preview=all&testCoins=50000'}).load('lib/town/vendingPreview.ts').testCoinsRequested(),true);
 const town=read('components/Town.tsx');
 assert(/testCoinsRequested\(\)\)void grantTestingCoins\(\)/.test(town),'Town grants test coins only through the gate');
 assert(!/get\('testCoins'\)/.test(town),'no ungated testCoins read left in Town');
 // Lab pages 404 in production builds.
 const labsProd=world({nodeEnv:'production'}).load('lib/dev/labRoutes.ts'),labsDev=world({nodeEnv:'development'}).load('lib/dev/labRoutes.ts');
 assert.throws(()=>labsProd.guardLabRoute(),/NEXT_NOT_FOUND/,'production: notFound()');
 assert.doesNotThrow(()=>labsDev.guardLabRoute(),'dev keeps the labs');
 for(const route of labsProd.LAB_ROUTES){const page=read(`app${route}/page.tsx`);assert(/export default function \w+\(\)\{guardLabRoute\(\);/.test(page),route+' calls guardLabRoute first');}
 const appRoutes=fs.readdirSync(path.join(root,'app')).filter(d=>/-lab$/.test(d));
 same([...appRoutes].sort(),labsProd.LAB_ROUTES.map(r=>r.slice(1)).sort(),'every *-lab route is listed and guarded');
 // Donations sit behind the shared grown-up check.
 const settings=read('components/IslandSettings.tsx'),donations=read('components/DonationLinks.tsx'),coffee=read('app/coffee/page.tsx');
 assert(!/coffee\/checkout/.test(settings),'About has no direct checkout links');
 assert(/<DonationLinks\/>/.test(settings)&&/<ParentGate /.test(donations),'About shows donations only after the ParentGate');
 assert(/<CoffeeGate>[\s\S]*TIERS\.map[\s\S]*<\/CoffeeGate>/.test(coffee),'/coffee tiers are inside the gate');
}

// ---- 1b. Every link that leaves the site asks a grown-up first (lib/externalLinks.ts, components/ExternalLinkGate.tsx) ----------
{
 const X=world().load('lib/externalLinks.ts'),o='https://futbolisland.app';
 for(const href of ['https://www.scottbuckley.com.au/library/wildflowers/','https://creativecommons.org/licenses/by/4.0/','https://www.instagram.com/fc_yap/','/coffee/checkout?amount=500&return=about','mailto:hi@example.com','http://futbolisland.app.evil.com/'])assert.equal(X.leavesSite(href,o),true,href+' leaves the site');
 for(const href of ['/','/?panel=about','/konbini?door=cay','/coffee','#top','javascript:void(0)','https://futbolisland.app/arcade'])assert.equal(X.leavesSite(href,o),false,href+' stays in the game');
 assert(/<ExternalLinkGate\/>/.test(read('app/layout.tsx')),'the gate is mounted once for every page');
 // Analytics is production-only: in dev its third-party debug script sends nothing and 403'd in a WebKit e2e run (Sep 30 2026).
 assert(/const ANALYTICS = process\.env\.NODE_ENV === 'production';/.test(read('app/layout.tsx'))&&/\{ANALYTICS && <Analytics\/>\}/.test(read('app/layout.tsx')),'Vercel Analytics renders in production only');
 const gate=read('components/ExternalLinkGate.tsx');assert(/addEventListener\('click',click,true\)/.test(gate)&&/parentGatePassed\(\)/.test(gate)&&/<ParentGate /.test(gate),'capture-phase check, shared ParentGate, remembered pass');
 assert(!/setInterval|requestAnimationFrame/.test(gate),'event-driven, no loop');
}

// ---- 2. One first path and Continue (G-02, G-12) ----------------------------------------------------------------------------
{
 const W=world(),C=W.load('lib/paths/pathContinue.ts'),F=W.load('lib/paths/formatPaths.ts');
 assert.equal(C.DEFAULT_PATH_FORMAT,'7v7');assert.equal(C.PATH_ORDER[0],'7v7');assert.equal(C.PATH_ORDER.at(-1),'futsal','futsal stays available, last');
 same(C.PATHS_IN_ORDER.map(p=>p.format),['7v7','9v9','11v11','futsal']);
 assert.equal(C.savedPathFormat(memoryStorage()),'7v7','new players open Paths on 7v7');
 const saved=memoryStorage();saved.setItem(C.PATH_FORMAT_KEY,'futsal');assert.equal(C.savedPathFormat(saved),'futsal','a chosen tab is kept');
 saved.setItem(C.PATH_FORMAT_KEY,'bogus');assert.equal(C.savedPathFormat(saved),'7v7');
 const seven=F.FORMAT_PATHS.find(p=>p.format==='7v7'),core=seven.chapters.flatMap(c=>c.lessons);
 assert(seven.openingStory,'7v7 has an opening story (the case that used to steal Continue)');
 const pass=(set,format,l)=>{for(let i=0;i<l.questions;i++)set.add(`${format}:${l.id}:${i}`);};
 let t=C.pathContinue(seven,new Set(),new Set());
 assert.equal(t.kind,'lesson');assert.equal(t.lesson.id,core[0].id,'a new player starts at lesson 1, not the optional story');assert.equal(t.label,'Start here');
 const answers=new Set();pass(answers,'7v7',core[0]);
 t=C.pathContinue(seven,new Set(),answers,core[0].id);assert.equal(t.lesson.id,core[1].id,'after lesson 1: Up next is lesson 2');assert.equal(t.label,'Up next');
 answers.add(`7v7:${core[1].id}:0`);
 t=C.pathContinue(seven,new Set(),answers,core[1].id);assert.equal(t.lesson.id,core[1].id);assert.equal(t.label,'Continue where you left off','a lesson in progress resumes');
 t=C.pathContinue(seven,new Set(),answers,seven.depth[0].id);assert.equal(t.lesson.id,core[1].id,'an optional Go-deeper lesson never becomes Continue');
 const all=new Set();for(const l of core)pass(all,'7v7',l);
 t=C.pathContinue(seven,new Set(),all,core.at(-1).id);assert.equal(t.kind,'complete');assert.equal(t.next,'9v9','a finished 7v7 path points at 9v9');
 const everything=new Set();for(const p of F.FORMAT_PATHS)for(const l of p.chapters.flatMap(c=>c.lessons))pass(everything,p.format,l);
 assert.equal(C.pathContinue(seven,new Set(),everything).next,null,'nothing left: no next path');
 const s2=memoryStorage();const next=C.suggestedNextStep(s2,new Set(),all);assert.equal(next.kind,'lesson');assert.equal(next.format,'9v9','welcome back suggests the next path after a finished one');
 // QA11 legacy save (tests/fixtures/legacy-futsal-save.json): futsal progress, no saved tab → Paths and welcome back stay on futsal.
 {const fx=require('./fixtures/legacy-futsal-save.json'),old=memoryStorage();for(const [k,v] of Object.entries(fx.storage))old.setItem(k,v);const st=new Set(fx.steps),an=new Set(fx.answers);
  assert.equal(C.inferredPathFormat(old,st,an),'futsal');assert.equal(C.savedPathFormat(old,st,an),'futsal','an old futsal save opens Paths on futsal, not 7v7');
  const back=C.suggestedNextStep(old,st,an);assert.equal(back.kind,'lesson');assert.equal(back.format,'futsal');assert.equal(back.lesson.id,'bld_f_passtofeet');assert.equal(back.label,'Continue where you left off','welcome back resumes the futsal lesson');
  const noLast=memoryStorage();assert.equal(C.savedPathFormat(noLast,st,an),'futsal','progress alone (no last-opened) is enough');
  assert.equal(C.savedPathFormat(noLast,new Set(['9v9:learn9_wall:0']),new Set()),'9v9','the path that has progress, whichever it is');
  noLast.setItem(C.PATH_FORMAT_KEY,'7v7');assert.equal(C.savedPathFormat(noLast,st,an),'7v7','a chosen tab still wins over progress');
  assert.equal(C.savedPathFormat(memoryStorage(),new Set(),new Set()),'7v7','no progress: 7v7');
  // QA11 C-5: pathContinue's saved/progress rule, not "futsal first": a save that passed 7v7 lessons (and one futsal lesson,
  // no saved tab, no last-opened) gets 7v7; the path with more progress wins; ties go to 7v7; a last-opened path is recent activity.
  {const pq=new Set();for(const k of ['7v7:prn_7_spread','9v9:learn9_wall','11v11:e_switch','7v7:s_onetwo','9v9:learn9_switch','futsal:f_pared']){const [f,id]=k.split(':'),p=F.FORMAT_PATHS.find(x=>x.format===f),l=[...p.chapters.flatMap(c=>c.lessons),...p.depth].find(x=>x.id===id);pass(pq,f,l);}
   assert.equal(C.savedPathFormat(memoryStorage(),new Set(),pq),'7v7','the QA11 save (7v7 + 9v9 + 11v11 + one futsal pass) opens on 7v7');
   const back2=C.suggestedNextStep(memoryStorage(),new Set(),pq);assert.equal(back2.format,'7v7','welcome back suggests 7v7, not futsal lesson 1');
   const tie=new Set();pass(tie,'futsal',F.FORMAT_PATHS.find(x=>x.format==='futsal').chapters[0].lessons[0]);pass(tie,'7v7',core[0]);
   assert.equal(C.inferredPathFormat(memoryStorage(),new Set(),tie),'7v7','ties go to 7v7');
   const opened=memoryStorage();opened.setItem(C.PATH_LAST_OPENED_KEY,JSON.stringify({'9v9':'learn9_wall'}));assert.equal(C.inferredPathFormat(opened,new Set(),tie),'9v9','the path with recent activity (a last-opened lesson) wins');}
  // QA11 B-3 / C-8: ONE "complete" rule (lessonEvidence). A lesson passed out of order (IDP homework, ball-hunt Watch it) counts
  // on Paths too: complete and not Locked, counted in the progress, while Continue still starts at the first unfinished stop.
  {const fourth=core[3],a=new Set();pass(a,'7v7',fourth);
   assert.equal(F.lessonEvidence('7v7',fourth,new Set(),a).complete,true);assert.equal(F.pathLessonLocked(seven,fourth,new Set(),a),false,'shown complete, not Locked');
   assert.equal(core.filter(l=>F.lessonEvidence('7v7',l,new Set(),a).complete).length,1,'Paths counts it (1 / 12)');
   const t4=C.pathContinue(seven,new Set(),a);assert.equal(t4.lesson.id,core[0].id,'Up next is still lesson 1');
   const paths=read('components/QuestLearningPath.tsx'),gu=read('lib/grownups/progress.ts'),idp=read('lib/coaches/idp.ts'),tiers=read('lib/town/cardTiers.ts');
   for(const [name,src] of [['Paths',paths],['Grown-ups',gu],['IDP homework',idp],['graduation / Ferry (pathProgressFrom)',tiers]])assert(/lessonEvidence\(/.test(src),`${name} uses lessonEvidence`);}
  const qlp=read('components/QuestLearningPath.tsx');assert(/if\(localStorage\.getItem\(PATH_FORMAT_KEY\)\)return;const f=inferredPathFormat\(localStorage,steps,answers\);if\(!f\)return;localStorage\.setItem\(PATH_FORMAT_KEY,f\);setFormat\(f\);/.test(qlp),'Paths migrates a missing tab once from progress');}
 const onboarding=read('components/IslandOnboarding.tsx'),paths=read('components/QuestLearningPath.tsx');
 assert(/Paths start with 7v7/.test(onboarding),'onboarding names 7v7 first');
 assert(/useState<string>\(DEFAULT_PATH_FORMAT\)/.test(paths)&&!/useState\('futsal'\)/.test(paths),'Paths opens on the default path');
 assert(/pathContinue\(path,steps,answers,lastOpened\[path\.format\]\)/.test(paths),'Paths uses the one Continue rule');
 // Onboarding teaches learning (Paths, then the Ball hunt) before money.
 const order=[...onboarding.matchAll(/\{id:'(\w+)',eyebrow:/g)].map(m=>m[1]);
 same(order,['welcome','paths','balls','earn','learn'],'onboarding: player → Paths → Ball hunt → coins');
}

// ---- 3. Quiz: full feedback, no doubled praise, resume keeps the first-try run (G-04, G-05, G-21) ---------------------------
{
 const W=world(),Q=W.load('lib/town/quizFeedback.ts'),R=W.load('lib/town/quizRunStore.ts'),P=W.load('lib/town/quizProgress.ts');
 assert.equal(Q.quizFeedbackText("Right, it's false."),"It's false.",'no "Correct. Right, it\'s false."');
 assert.equal(Q.quizFeedbackText('Yes. Two at the back, three in the middle and one ahead, plus the keeper.'),'Two at the back, three in the middle and one ahead, plus the keeper.');
 assert.equal(Q.quizFeedbackText('The pivot remains ahead, but the lane is covered. The deeper fixo offers a clear supporting route.'),'The pivot remains ahead, but the lane is covered. The deeper fixo offers a clear supporting route.','the full "why", not the first sentence');
 assert.equal(Q.quizFeedbackText('Correct positioning wins the ball.'),'Correct positioning wins the ball.','a real first word is kept');
 const learning=read('components/FieldLearning.tsx');
 assert(!/\.split\(\/\(\?<=\[\.!\?\]\)\\s\/\)\[0\]/.test(learning),'no first-sentence cut in FieldLearning');
 assert(/quizFeedbackText\(/.test(learning),'FieldLearning uses quizFeedbackText');
 // QA11: every lesson launch (Paths, book check, Spot it, IDP homework, the ball hunt) goes through ONE close-overlays path that
 // shuts Make it yours and the coin drawer too, so the lesson is never behind a modal with the island asleep.
 {const town=read('components/Town.tsx'),close=town.match(/const closeForLesson=\(\)=>\{([^}]*)\};/);
  assert(close,'Town has one shared lesson-launch close');for(const set of ['setSettingsOpen','setStoreOpen','setConversationOpen','setCustomizerOpen','setBalancesOpen','setMap'])assert(close[1].includes(set+'(false)'),`a lesson launch calls ${set}(false)`);
  for(const ev of ['FORMAT_PATH_LAUNCH','LEARNING_LAUNCH']){const h=town.match(new RegExp(`useEffect\\(\\(\\)=>\\{const launch=[^\\n]*window\\.addEventListener\\(${ev},launch\\)`));assert(h&&/closeForLesson\(\)/.test(h[0]),`${ev} closes blocking overlays`);}
  // The welcome-back card and costume/ride toasts wait for the calm moment (GraduationHost's rule) and the ceremony itself.
  const calm=town.match(/const calmBlocked=([^;]*);/)[1];for(const f of ['!!fieldCatalog','!!lesson','!!konbiniDoor','customizerOpen','cardOfferOpen'])assert(calm.includes(f),`calm moment waits for ${f}`);
  assert(/const toastBlocked=calmBlocked\|\|graduationOpen\|\|settingsOpen;/.test(town));assert(/<GraduationHost blocked=\{calmBlocked\}/.test(town));
  for(const c of ['CostumeMilestoneToast','RideUnlockToast','WelcomeBack'])assert(new RegExp(`<${c} blocked=\\{toastBlocked[}|]`).test(town),`${c} waits for the ceremony, a lesson or another modal`);}
 // QA11: both launch paths show the "You'll learn" card over a PAUSED lesson, so "Let's go" (which plays a paused lesson) starts it.
 const sel=learning.match(/const select=\(lesson:FieldLesson\)=>\{[^\n]*/)[0];
 assert(/setIntro\(lesson\.id\)/.test(sel)&&/setPlaying\(false\)/.test(sel)&&/playing:false/.test(sel)&&!/playing:true|setPlaying\(true\)/.test(sel),'a lesson picked from the list starts paused behind the opener');
 assert(/if\(!isQuiz\)setIntro\(lesson\.id\);\s*setChosen\(lesson\);[^\n]*setPlaying\(false\);/.test(learning),'the Paths launch starts paused behind the opener');
 assert(/data-lesson-opener-go onClick=\{\(\)=>\{setIntro\(null\);const s=session\.current;if\(s&&!s\.playing\)togglePlayback\(\);\}\}/.test(learning),"Let's go plays the paused lesson");
 // A 5-question quiz: two right first time, a reload, three more right first time → the card answers survive.
 const store=memoryStorage(),N=5;
 let run=R.loadQuizRun('futsal','learnf_roles31',store);assert.equal(run.tried.size,0);
 for(const i of [0,1]){P.recordRunAnswer(run,i,true);R.saveQuizRun('futsal',run,store,1000+i);}
 run=R.loadQuizRun('futsal','learnf_roles31',store);// the reload
 assert.equal(run.firstTry.size,2,'first-try answers from before the pause are restored');
 for(const i of [2,3,4]){P.recordRunAnswer(run,i,true);R.saveQuizRun('futsal',run,store,2000+i);}
 assert.equal(P.quizRunCardAnswers('learnf_roles31',N,run).size,N,'a clean run over a pause still earns the card');
 // A wrong first answer before the pause still counts as not-first-try after it.
 const store2=memoryStorage();let r2=R.loadQuizRun('7v7','learn7_roles',store2);P.recordRunAnswer(r2,0,false);P.recordRunAnswer(r2,0,true);R.saveQuizRun('7v7',r2,store2);
 r2=R.loadQuizRun('7v7','learn7_roles',store2);for(const i of [1,2,3,4])P.recordRunAnswer(r2,i,true);
 assert.equal(P.quizRunCardAnswers('learn7_roles',N,r2).size,0,'the rule stays first-try: a retry before the pause is remembered');
 assert.equal(r2.firstTry.size,4);
 R.clearQuizRun('futsal','learnf_roles31',store);assert.equal(R.loadQuizRun('futsal','learnf_roles31',store).tried.size,0,'finishing (or a fresh start) clears the run');
 R.saveQuizRun('7v7',r2,store2);assert.equal(JSON.parse(store2.getItem(R.QUIZ_RUNS_KEY))['7v7:learn7_roles'].tried.length,5);
 store2.setItem(R.QUIZ_RUNS_KEY,'{"x:y":{"tried":[1,"a",-2,99],"firstTry":[1,3],"correct":[]}}');const bad=R.loadQuizRun('x','y',store2);
 same([...bad.tried],[1]);same([...bad.firstTry],[1],'first-try needs a tried answer; junk is dropped');
 const many=memoryStorage();for(let i=0;i<40;i++)R.saveQuizRun('9v9',Object.assign(P.newQuizRun('lesson'+i),{tried:new Set([0])}),many,i);
 assert.equal(Object.keys(JSON.parse(many.getItem(R.QUIZ_RUNS_KEY))).length,R.MAX_SAVED_RUNS,'the saved runs stay small');
 assert(/Perfect!/.test(R.quizDoneLine(5,5,true)));assert(/Replay it any time/.test(R.quizDoneLine(5,3,true)));assert(!/card/.test(R.quizDoneLine(5,3,false)));
 assert(/loadQuizRun\(lesson\.fmt,lesson\.id\)/.test(learning),'a resumed Paths quiz loads its saved run');
 assert(/clearQuizRun\(chosen\.fmt,chosen\.id\);\}/.test(learning),'the finished quiz clears its saved run after paying');
 // Quiz framing reserves the real card height (G-06).
 const L=W.load('lib/town/learningView.ts');
 const doc=top=>({querySelector:()=>({getBoundingClientRect:()=>({top,height:844-top})})});
 assert.equal(L.quizCardInset(844,doc(640)),204+L.QUIZ_CARD_GAP,'the camera keeps answers (and their rings) above a 204 px card');
 assert.equal(L.quizCardInset(844,{querySelector:()=>null}),0);
 assert(L.QUIZ_TOP_INSET<=100);
}

// ---- 4. Daily bonus counts any steered ride (G-11) --------------------------------------------------------------------------
{
 const D=world().load('lib/town/dailyPlay.ts');
 const base={active:true,menuOpen:false,inLesson:false,onTruck:false,steering:true,moved:true};
 assert.equal(D.dailyPlayCounts(base),true,'steered movement counts on any ride, the jetpack included');
 for(const [k,v] of [['active',false],['menuOpen',true],['inLesson',true],['onTruck',true],['steering',false],['moved',false]])assert.equal(D.dailyPlayCounts({...base,[k]:v}),false,k+' blocks the bonus');
 const town=read('components/Town.tsx');
 assert(/dailyPlay\.step\(dt,dailyPlayCounts\(/.test(town),'Town uses the shared rule');
 assert(!/rideRef\.current==='walk'&&streetTraffic\.rider\.index<0&&Math\.hypot\(driveX,driveZ\)>\.1&&dailyMoved/.test(town),'the walk-only rule is gone');
 assert(/walk, ride or fly/i.test(read('components/IslandBalanceDrawer.tsx')),'the pocket copy says rides count');
 // Fast travel lands on foot (G-13).
 assert.equal((town.match(/if\(rideRef\.current!=='walk'\)\{pendingRide\.current=null;cancelLanding\.current=false;rideRef\.current='walk';setRideMode\('walk'\);\}/g)||[]).length,2,'both fast-travel arrivals land on foot');
}

// ---- 5. Welcome back (G-10) -------------------------------------------------------------------------------------------------
{
 const B=world().load('lib/town/welcomeBack.ts'),s=memoryStorage();
 const day=(d,h=10)=>new Date(2026,8,d,h).getTime();
 assert.equal(B.checkWelcomeBack(s,day(29)),false,'a first-ever visit is onboarding, not welcome back');
 assert.equal(B.checkWelcomeBack(s,day(29,18)),false,'same day: nothing');
 assert.equal(B.checkWelcomeBack(s,day(30)),true,'a new day: welcome back');
 // Bug audit B14: a due card that stayed blocked all session is not "seen"; showing it records the day.
 assert.equal(B.checkWelcomeBack(s,day(30,12)),true,'blocked all morning: still due after a reload');
 B.markWelcomeBackSeen(s,day(30,13));
 assert.equal(B.checkWelcomeBack(s,day(30,20)),false,'only once that day, after it showed');
 assert.equal(B.checkWelcomeBack(s,new Date(2026,9,9,9).getTime()),true,'after a long break: the same friendly card, no streak talk');
 assert.equal(B.checkWelcomeBack(null,day(30)),false);
 // Bug audit B14: pre-Deploy-11 saves have no last-visit day; existing progress means a returning player.
 for(const [k,v] of [['quest',JSON.stringify({visits:['plaza'],steps:[],equipment:false})],['quest',JSON.stringify({visits:[],steps:['7v7:a'],equipment:false})],['quiz',JSON.stringify(['q1'])]]){
  const old=memoryStorage();old.setItem(B.WELCOME_PROGRESS_KEYS[k],v);
  assert.equal(B.checkWelcomeBack(old,day(30)),true,k+' progress without a last-visit day: welcome back');
  assert.equal(old.getItem(B.LAST_VISIT_KEY),null,'not recorded until shown');}
 {const empty=memoryStorage();empty.setItem(B.WELCOME_PROGRESS_KEYS.quiz,'[]');assert.equal(B.checkWelcomeBack(empty,day(30)),false,'empty progress is still a first visit');assert.equal(empty.getItem(B.LAST_VISIT_KEY),'2026-09-30');}
 assert(read('lib/town/questProgress.ts').includes(`QUEST_STORAGE_KEY='${B.WELCOME_PROGRESS_KEYS.quest}'`),'quest key matches');
 assert(read('lib/town/quizProgress.ts').includes(`QUIZ_STORAGE_KEY='${B.WELCOME_PROGRESS_KEYS.quiz}'`),'quiz key matches');
 assert(/markWelcomeBackSeen\(storage\);setOpen\(true\)/.test(read('components/WelcomeBack.tsx')),'the day is recorded when the card shows');
 const card=read('components/WelcomeBack.tsx');
 assert(!/\bstreak|\bmissed\b|\blose\b|don.t break/i.test(card),'no streak pressure or guilt copy');
 assert(/suggestedNextStep\(/.test(card),'one suggested step from the Continue rule');
}

// ---- 6. Explore checklist: six new items (G-13) -----------------------------------------------------------------------------
{
 const W=world(),E=W.load('lib/town/exploreChecklist.ts'),A=W.load('lib/town/exploreActivity.ts'),T=W.load('lib/town/cardRewardTriggers.ts');
 const ids=E.EXPLORE_ITEMS.map(i=>i.id);
 for(const id of ['catch-fish','island-job','sell-rosa','visit-cay','walk-jetty','enter-konbini'])assert(ids.includes(id),id+' is on the checklist');
 assert.equal(ids.length,22);
 for(const item of E.EXPLORE_ITEMS.slice(-6))assert(item.detail.length<=110&&/[.!]$/.test(item.detail),item.id+' copy is short and complete');
 const paid=new Set(T.CARD_EXPLORE_ITEMS.map(i=>i.id));
 for(const id of ['catch-fish','island-job','sell-rosa'])assert(paid.has(id),id+' pays like the other effort items (5 coins + a pick)');
 for(const id of ['visit-cay','walk-jetty','enter-konbini'])assert(!paid.has(id),id+' is a visit: ticks off, pays nothing (same rule as visiting a field)');
 // Existing saves count, from the stores' own keys.
 const keys={fish:'lib/town/fishing/fishingCore.ts:FISHBOOK_STORAGE_KEY',job:'lib/town/jobs/jobEconomy.ts:JOBS_STORAGE_KEY',sold:'lib/town/market/market.ts:MARKET_STORAGE_KEY',jetty:'lib/town/eastPierChallenge.ts:PIER_CHALLENGE_KEY',konbini:'lib/konbini/foodStore.ts:KONBINI_COLLECTION_KEY'};
 for(const [k,ref] of Object.entries(keys)){const [file,name]=ref.split(':');const m=read(file).match(new RegExp(`export const ${name}='([^']+)'`));assert(m,ref);assert.equal(A.SAVE_EVIDENCE_KEYS[k],m[1],k+' evidence key matches '+ref);}
 const saves={'fi2-fishbook-v1':'{"version":1,"species":{},"total":2}','fi2-island-jobs-v1':'{"lifetime":{"leaf-rake":1}}','fi2-market-v1':'{"sales":1}','fi2-east-pier-challenge-v1':'{"spot":0,"hits":3}','fi2-konbini-collection-v1':'{"version":1,"items":{"onigiri":5},"rewards":[]}'};
 same(A.evidenceFromSaves(k=>saves[k]??null),{fish:true,job:true,sold:true,jetty:true,konbini:true});
 same(A.evidenceFromSaves(()=>null),{},'a fresh save shows nothing done');
 same(A.evidenceFromSaves(k=>k==='fi2-island-jobs-v1'?'{"lifetime":{}}':k==='fi2-fishbook-v1'?'{"total":0}':null),{},'empty ledgers are not evidence');
 // The signals: fishing, jobs and the market fire them; a Konbini visit and the zone check record directly.
 assert(/signalExplore\('fish'\)/.test(read('lib/town/fishing/fishingStore.ts')));
 assert(/signalExplore\('job'\)/.test(read('lib/town/jobs/jobEconomy.ts')));
 assert(/signalExplore\('sold'\)/.test(read('lib/town/jobs/islandWallet.ts')));
 assert(/recordExploreActivity\('konbini'\)/.test(read('components/KonbiniRoom.tsx')));
 // Zone check: at most twice a second, then off for good.
 const Z=W.load('lib/town/exploreZones.ts'),C=W.load('lib/town/coralCay.ts'),P=W.load('lib/town/eastPier.ts');
 const got=[];const z=Z.createExploreZones({cay:false,jetty:false},k=>got.push(k));
 z.step(.6,C.CAY_CENTER.x,C.CAY_CENTER.z,true);same(got,['cay'],'flying over Coral Cay counts as a visit');
 const pier=P.JETTY_PATH[Math.floor(P.JETTY_PATH.length/2)];assert(P.onEastPier(pier.x,pier.z));
 z.step(.6,pier.x,pier.z,true);same(got,['cay'],'flying over the jetty is not walking it');
 z.step(.1,pier.x,pier.z,false);same(got,['cay'],'throttled: no check before 0.5 s');
 z.step(.5,pier.x,pier.z,false);same(got,['cay','jetty']);assert.equal(z.finished,true);
 z.step(5,pier.x,pier.z,false);assert.equal(got.length,2,'records once');
 assert.equal(Z.createExploreZones({cay:true,jetty:true},()=>{}).finished,true,'an already-done save never checks');
}

// ---- 7. Lesson opener goals (G-18) and the opening-soon label (G-01 part) ----------------------------------------------------
{
 const W=world(),G=W.load('lib/paths/lessonGoals.ts'),F=W.load('lib/paths/formatPaths.ts');
 const seven=F.FORMAT_PATHS.find(p=>p.format==='7v7').chapters.flatMap(c=>c.lessons);
 for(const l of seven){const g=G.lessonGoal('7v7',{id:l.id});assert(g&&g.goal.length<=110,l.id+' has a short kid goal');}
 assert(G.lessonGoal('7v7',{id:'learn7_roles'}).words.length>=3,'the first lesson explains its words');
 assert.equal(G.lessonGoal('futsal',{id:'x',concept:'Read the defender.'}).goal,'Read the defender.','other lessons fall back to their concept line');
 assert.equal(G.lessonGoal('futsal',{id:'x'}),null);
 // Lane 2 is turning these destinations on; until each is real it shows OPENING_SOON_LABEL, never a dead-end "Coming soon".
 for(const f of ['components/Museum.tsx','components/FerryPreview.tsx'])assert(!/>Coming soon</.test(read(f)),f+' has no "Coming soon" dead end');
 assert(!/>Coming soon<\/span><h3>Coaches Board/.test(read('components/CoachesCentre.tsx')),'the Coaches Board card uses the neutral label');
 assert(!/'COMING SOON'/.test(read('lib/town/world.ts')),'no COMING SOON sign in the world');
}
console.log('PASS new-player flow: prod-gated preview/testCoins/labs, gated donations, one first path (7v7) + Continue, full quiz feedback, resumed first-try runs, daily bonus on rides, fast travel on foot, welcome back once a day, six Explore items + save evidence, lesson goals, opening-soon labels');
