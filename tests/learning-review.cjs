// Lane 3 learning loop (docs/learning/spaced-review.md, docs/learning/apply-in-play.md): spaced review scheduling, mastery
// stages, due reviews and the daily coin cap, book checks crediting the right lesson, live-match "Spot it" gating/throttling,
// and the concept map's coverage of the Paths lessons, ball hunt, magazines and jobs.
const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),path=require('path');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:7,esModuleInterop:true,resolveJsonModule:true}}).outputText,f);
const R=require('../lib/learning/review.ts'),C=require('../lib/learning/conceptMap.ts'),{BOOK_CHECKS}=require('../lib/learning/bookChecks.ts');
const {createReviewStore,bookLesson}=require('../lib/learning/reviewStoreCore.ts'),S=require('../lib/learning/spotIt.ts');
const manifest=require('../lib/town/quizManifest.json'),paths=require('../lib/paths/formatPaths.json');
const VALID=new Set(Object.entries(manifest).flatMap(([f,ls])=>Object.keys(ls).map(id=>`${f}:${id}`)));
const DAY=R.DAY,T0=new Date(2026,8,30,9).getTime(),at=(n,t=T0)=>R.localDayStart(t,n); // at(n) = local midnight n days after T0's day

// 1. Scheduling: enroll → due tomorrow; right → 3 days; wrong → one box down, back tomorrow, asked first; early answers never skip.
{let s=R.emptyReview();s=R.enrollPassed(s,['7v7:s_onetwo','futsal:f_pared'],T0);
 assert.equal(s.lessons['7v7:s_onetwo'].due,at(1),'due from the start of tomorrow');assert.deepEqual(R.dueKeys(s,at(1)-1),[],'nothing due before tomorrow starts');
 assert.equal(R.enrollPassed(s,['7v7:s_onetwo'],T0+5*DAY),s,'enrolling again is a no-op');
 const early=R.answerReview(s,'7v7:s_onetwo',true,T0+1000);assert.equal(early.lessons['7v7:s_onetwo'].box,0,'answering before due never moves a box');
 s=R.answerReview(s,'7v7:s_onetwo',true,T0+DAY);let r=s.lessons['7v7:s_onetwo'];assert.equal(r.box,1);assert.equal(r.due,at(4));assert.equal(r.right,1);
 s=R.answerReview(s,'futsal:f_pared',false,T0+DAY);r=s.lessons['futsal:f_pared'];assert.equal(r.box,0);assert.equal(r.due,at(2));assert.equal(r.missed,true);
 s=R.answerReview(s,'7v7:s_onetwo',true,T0+4*DAY);assert.equal(s.lessons['7v7:s_onetwo'].box,2);assert.equal(s.lessons['7v7:s_onetwo'].due,at(11),'1 → 3 → 7 days');
 // Many due: at most one warm-up (3), missed first, then the longest overdue.
 let m=R.enrollPassed(R.emptyReview(),['9v9:learn9_wall','9v9:learn9_switch','11v11:e_switch','11v11:e_thirdman'],T0);
 m=R.answerReview(m,'11v11:e_thirdman',false,T0+DAY);const due=R.dueKeys(m,T0+3*DAY);assert.equal(due.length,R.REVIEW_SESSION_SIZE);assert.equal(due[0],'11v11:e_thirdman','a missed lesson comes back first');
 assert.equal(R.dueCount(m,T0+3*DAY),4);
 const bad=R.sanitizeReview({lessons:{'7v7:nope':{enrolled:1,box:9,due:1},'7v7:s_onetwo':{enrolled:1,box:99,due:'x',right:-3}},paid:{day:'2026-09-30',count:2}},k=>VALID.has(k));
 assert.deepEqual(Object.keys(bad.lessons),['7v7:s_onetwo']);assert.equal(bad.lessons['7v7:s_onetwo'].box,R.REVIEW_INTERVALS_DAYS.length-1);assert.equal(bad.lessons['7v7:s_onetwo'].right,0);
 // QA11 day-based scheduling: passed after school at 17:30 → due when tomorrow starts, so 16:45 tomorrow has it waiting.
 {const pm=new Date(2026,8,30,17,30).getTime(),next=new Date(2026,9,1,16,45).getTime();let d=R.enrollPassed(R.emptyReview(),['7v7:s_onetwo'],pm);
  assert.deepEqual(R.dueKeys(d,next),['7v7:s_onetwo'],'a 17:30 pass is due at 16:45 the next day');assert.deepEqual(R.dueKeys(d,new Date(2026,8,30,23,59).getTime()),[],'not due the same evening');
  assert.equal(R.localDaysBetween(pm+60000,d.lessons['7v7:s_onetwo'].due),1,'next review tomorrow');
  d=R.answerReview(d,'7v7:s_onetwo',true,new Date(2026,9,1,23,50).getTime());assert.equal(R.localDaysBetween(new Date(2026,9,1,23,55).getTime(),d.lessons['7v7:s_onetwo'].due),3,'counted in days, not 24 h blocks');
  d=R.answerReview(d,'7v7:s_onetwo',false,new Date(2026,9,4,7).getTime());assert.equal(d.lessons['7v7:s_onetwo'].due,new Date(2026,9,5).getTime(),'a missed review is back when tomorrow starts');}
 // Month ends and both DST changes (US: Mar 8 / Nov 1 2026, EU: Mar 29 / Oct 25 2026) land on local midnight of the right date, in any TZ.
 for(const [y,m,dd] of [[2026,2,7],[2026,2,8],[2026,2,28],[2026,2,29],[2026,9,24],[2026,9,25],[2026,9,31],[2026,10,1],[2026,11,31]]){
  const t=new Date(y,m,dd,22,30).getTime();for(const n of [1,3,7]){const due=new Date(R.localDayStart(t,n)),want=new Date(y,m,dd+n);
   assert.deepEqual([due.getFullYear(),due.getMonth(),due.getDate(),due.getHours(),due.getMinutes()],[want.getFullYear(),want.getMonth(),want.getDate(),0,0],`${y}-${m+1}-${dd} +${n}d → local midnight`);
   assert.equal(R.localDaysBetween(t,due.getTime()),n,`${y}-${m+1}-${dd}: ${n} local days`);}}
 console.log('REVIEW_SCHEDULE_PASS 1→3→7 day boxes (due from local midnight, DST-safe), missed first, early answers never skip, 3 per warm-up, sanitized saves');}

// 2. Stages: new → introduced → practicing → applied → remembered; ticks are evidence only.
{const none={watched:0,correct:0,complete:false},passed={watched:9,correct:5,complete:true};
 assert.equal(R.stageOf(none),'new');assert.equal(R.stageOf({...none,watched:2}),'introduced');
 let s=R.tick(R.emptyReview(),'7v7:s_onetwo','magazine:x');assert.equal(R.stageOf(none,s.lessons['7v7:s_onetwo']),'introduced','an island tick introduces');
 assert.equal(R.tick(s,'7v7:s_onetwo','magazine:x'),s,'one tick per source, ever');
 s=R.enrollPassed(s,['7v7:s_onetwo'],T0);assert.equal(s.lessons['7v7:s_onetwo'].ticks,1,'enrolling keeps evidence');assert.equal(R.stageOf(passed,s.lessons['7v7:s_onetwo']),'practicing');
 const t2=R.tick(s,'7v7:s_onetwo','job:y');assert.equal(t2.lessons['7v7:s_onetwo'].due,s.lessons['7v7:s_onetwo'].due,'ticks never move the schedule');
 s=R.answerReview(s,'7v7:s_onetwo',true,T0+DAY);assert.equal(R.stageOf(passed,s.lessons['7v7:s_onetwo']),'applied');
 s=R.answerReview(s,'7v7:s_onetwo',true,T0+4*DAY);assert.equal(R.stageOf(passed,s.lessons['7v7:s_onetwo']),'remembered');
 let b=R.enrollPassed(R.emptyReview(),['futsal:f_pivot'],T0);b=R.applyElsewhere(b,'futsal:f_pivot',T0+60000,'book:falcao');
 assert.equal(b.lessons['futsal:f_pivot'].box,0,'a book answer before due records Applied without skipping spacing');assert.equal(R.stageOf(passed,b.lessons['futsal:f_pivot']),'applied');
 b=R.applyElsewhere(b,'futsal:f_pivot',T0+DAY,'book:falcao');assert.equal(b.lessons['futsal:f_pivot'].box,1,'a book answer on a due lesson counts as its review');
 assert.equal(R.localDaysBetween(T0+DAY,b.lessons['futsal:f_pivot'].due),3,'next review in 3 days');
 // QA11: re-reading a book never duplicates its source; the card persists its first answer per book so reopening can't retake it.
 {let e=R.applyElsewhere(R.emptyReview(),'futsal:f_pivot',T0,'book:falcao');e=R.applyElsewhere(e,'futsal:f_pivot',T0+1,'book:falcao');assert.deepEqual(e.lessons['futsal:f_pivot'].sources,['book:falcao'],'sources are de-duplicated');
  const card=fs.readFileSync(path.join(__dirname,'../components/BookGameCheck.tsx'),'utf8');
  assert.match(card,/const first=tries===0&&!wasAnswered\(bookId\);if\(first\)markAnswered\(bookId\);/,'the first try is the first answer ever for that book, persisted');
  assert.match(card,/const wasAnswered=\(bookId:string\)=>readList\(ANSWERED_KEY\)\.includes\(bookId\)\|\|readDone\(\)\.includes\(bookId\)/,'books already done count as answered');}
 console.log('STAGE_PASS introduced/practicing/applied/remembered from evidence; ticks never change the schedule');}

// 3. Store: due reviews for the warm-up, the 3-a-day coin cap with unique wallet ids, book checks → right lesson.
(async()=>{
 let saved=null,now=T0,passed=['7v7:s_onetwo','9v9:learn9_wall','futsal:f_pared','11v11:e_switch'];const paid=[];const wallet=new Set();
 const ports={load:()=>saved,save:s=>{saved=JSON.parse(JSON.stringify(s));},now:()=>now,day:t=>new Date(t).toISOString().slice(0,10),passed:()=>passed,
  pay:async(kind,id,reason)=>{const full=`learn:${kind}:${id}`;if(wallet.has(full))return 0;wallet.add(full);const amount={review:2,book:5}[kind];paid.push({full,amount,reason});return amount;},
  validKey:k=>VALID.has(k),lessonName:k=>k,notify:()=>{}};
 const store=createReviewStore(ports);
 assert.equal(store.getDueReviews().count,0,'nothing due on the day a lesson is passed');
 now=T0+DAY+1;let due=store.getDueReviews();assert.equal(due.count,4);assert.equal(due.items.length,3);assert(due.items.every(i=>i.name&&i.format&&i.lessonId));
 assert.equal(due.items.find(i=>i.key==='7v7:s_onetwo')?.concept??'Wall pass','Wall pass','7v7 uses the simplest words');
 let coins=0;for(const k of passed)coins+=await store.answer(k,true);
 assert.equal(coins,3*2,'only 3 right answers a day pay');assert.equal(new Set(paid.map(p=>p.full)).size,paid.length);
 assert.equal(store.getDueReviews().count,0,'answered lessons leave the list');
 now+=3*DAY+1;for(const k of passed)coins+=await store.answer(k,true);assert.equal(coins,12,'the cap resets on a new day');
 // Book checks credit the concept's lesson in the book's format and pay once per book.
 const r1=await store.bookCheck('cafu',false,true);assert.equal(r1.coins,0);
 const r2=await store.bookCheck('cafu',true,false);assert.equal(r2.lesson,'7v7:next7_outsideback');assert.equal(r2.coins,5);
 const r3=await store.bookCheck('cafu',true,true);assert.equal(r3.coins,0,'a book pays once ever');assert.equal(store.read().lessons['7v7:next7_outsideback'].applied,1,'first-try right counts as applied');
 assert.equal((await store.bookCheck('not-a-book',true,true)).lesson,null);
 // Ticks from magazines / jobs / fish / match reach every lesson of the concept.
 assert.deepEqual(store.creditTick('offside','magazine:offside').sort(),['11v11:gap11_runoncue','7v7:next7_offsideboundary']);
 assert.equal(store.read().lessons['7v7:next7_offsideboundary'].ticks,1);
 // A reload merges from storage.
 assert.equal(createReviewStore(ports).read().lessons['7v7:s_onetwo'].box,2);
 console.log('REVIEW_STORE_PASS due reviews for the warm-up, 3 paid answers/day, book checks → lesson, ticks, reload');
 finish();
})().catch(e=>{console.error(e);process.exit(1);});

function finish(){
// 4. Book checks: every book has one, answers in range, and it resolves to a real lesson that teaches its concept in its format.
{const catalog=fs.readFileSync(path.join(__dirname,'../lib/books/catalog.ts'),'utf8');const ids=[...catalog.matchAll(/^ ([a-z]+): \{ itemId/gm)].map(m=>m[1]);
 assert(ids.length>=37,'read the book catalog');
 for(const id of ids){const c=BOOK_CHECKS[id];assert(c,`book ${id} has a Take it to your game check`);assert(c.answer>=0&&c.answer<c.options.length);assert.equal(new Set(c.options).size,3);
  const key=bookLesson(id);assert(key&&VALID.has(key),`${id} → ${key} is a real lesson`);assert(key.startsWith(c.format+':'),`${id} credits its own format's lesson`);assert(C.conceptsForLesson(key).includes(c.concept),`${id}'s lesson teaches ${c.concept}`);}
 const answers=Object.values(BOOK_CHECKS).map(c=>c.answer);assert([0,1,2].every(a=>answers.filter(x=>x===a).length>=8),'right answers are spread over A, B and C');
 console.log(`BOOK_CHECK_PASS ${ids.length} books → lessons in their format that teach their concept`);}

// 5. Spot it: off screen / not near = nothing; throttled globally and per concept; only learned concepts; session cap.
{let t=1e6;const shown=[];let learned=new Set(['one-two','switch-play','offside']);
 S.resetSpotIt();assert.equal(S.reportMatchConcept('9v9','one-two',true,t),null,'nothing connected: no-op');
 const off=S.connectSpotIt((c,f)=>learned.has(c)?`${f}:x`:null,o=>shown.push(o));
 assert.equal(S.reportMatchConcept('9v9','one-two',false,t),null,'off screen or far away: none');assert.equal(shown.length,0);
 assert.equal(S.reportMatchConcept('9v9','overlap',true,t),null,'not learned: none');
 const o=S.reportMatchConcept('9v9','one-two',true,t);assert(o&&o.title==='One-two'&&o.lesson==='9v9:x','9v9 words');
 assert.equal(S.reportMatchConcept('9v9','switch-play',true,t+S.SPOT_IT_GAP_MS-1),null,'global gap');
 assert(S.reportMatchConcept('11v11','switch-play',true,t+=S.SPOT_IT_GAP_MS));assert.equal(shown.at(-1).title,'Switch of play','11v11 words');
 assert.equal(S.reportMatchConcept('9v9','one-two',true,t+=S.SPOT_IT_GAP_MS),null,'same concept waits its own gap');
 for(let i=0;i<10;i++){learned.add('c'+i);}const gate=S.createSpotItGate({gap:0,conceptGap:0,max:2});let n=0;for(let i=0;i<5;i++)if(gate.offer('7v7','one-two',{watching:true,now:i,learned:()=>'7v7:s_onetwo'}))n++;assert.equal(n,2,'session cap');
 off();assert.equal(S.reportMatchConcept('9v9','offside',true,t+1e9),null,'disconnected: no-op');
 // The feed lines and counters matchEffects passes map to concepts; the render side only reports when `watching`.
 assert.equal(S.matchFeedConcept('One-two!'),'one-two');assert.equal(S.matchFeedConcept('Overlap on the wing'),'overlap');assert.equal(S.matchFeedConcept('Through ball!'),'through-ball');assert.equal(S.matchFeedConcept('Shot!'),null);
 assert.equal(S.matchStatConcept('switches'),'switch-play');assert.equal(S.matchStatConcept('offsideCalls'),'offside');
 const fx=fs.readFileSync(path.join(__dirname,'../lib/town/matchEffects.ts'),'utf8'),rt=fs.readFileSync(path.join(__dirname,'../lib/town/fieldRuntime.ts'),'utf8');
 assert.equal((fx.match(/reportMatchConcept\(/g)||[]).length,3);assert(!/requestAnimationFrame|setInterval|setTimeout/.test(fs.readFileSync(path.join(__dirname,'../lib/learning/spotIt.ts'),'utf8')),'no timers in the gate');
 for(const call of fx.match(/if\(watching\)[^;]*reportMatchConcept|if\(watching\)\{[^}]*\}/g)||[])assert(call.includes('reportMatchConcept'));
 assert(/if\(watching\)\{const id=venue\.id;/.test(fx)&&/if\(watching\)reportMatchConcept/.test(fx),'every report sits behind watching');
 assert(/visible&&!teaching&&active&&\(viewingFormat===v\.id\|\|camDistance<sphere\.radius\+35\)\)/.test(rt),'watching = on screen, not teaching, near');
 console.log('SPOT_IT_PASS off-screen none, learned only, 90 s global + 10 min per concept, session cap, format-scaled words');}

// 6. Concept map coverage.
{const core=paths.flatMap(p=>p.chapters.flatMap(c=>c.lessons).map(l=>`${p.format}:${l.id}`));
 for(const k of core)assert(C.conceptsForLesson(k).length,`core stop ${k} maps to a concept`);
 for(const c of C.CONCEPTS){for(const k of C.conceptLessons(c.id))assert(VALID.has(k),`${c.id}: ${k} exists`);
  const w=c.words;assert(w.simple.title&&w.mid.title&&w.complex.title&&w.simple.line&&w.complex.line);assert(new Set([w.simple.line,w.mid.line,w.complex.line]).size===3,`${c.id} words scale by level`);}
 assert.equal(C.levelFor('7v7'),'simple');assert.equal(C.levelFor('futsal'),'simple');assert.equal(C.levelFor('9v9'),'mid');assert.equal(C.levelFor('11v11'),'complex');
 const ball=fs.readFileSync(path.join(__dirname,'../lib/town/ballHuntLessons.ts'),'utf8'),kinds=new Set([...ball.matchAll(/:[a-z0-9]+\('([a-z0-9-]+)'/g)].map(m=>m[1]));
 const mapped=C.CONCEPTS.flatMap(c=>c.ballKinds??[]);for(const k of mapped)assert(kinds.has(k),`ball kind ${k} exists`);
 assert.equal(new Set(mapped).size,mapped.length,'each ball kind maps to one concept');
 const linked=[...kinds].filter(k=>C.conceptForBallKind(k));assert(linked.length>=kinds.size*.6,`${linked.length}/${kinds.size} ball ideas link to a lesson`);
 for(const lvl of [1,2,3])for(const k of linked)assert(C.ballLessonLink(k,lvl),`${k} links at level ${lvl}`);
 const mags=fs.readFileSync(path.join(__dirname,'../lib/konbini/konbiniContent.ts'),'utf8'),jobs=fs.readFileSync(path.join(__dirname,'../lib/town/jobs/jobCatalog.ts'),'utf8'),fish=fs.readFileSync(path.join(__dirname,'../lib/town/fishing/fishCatalog.ts'),'utf8');
 for(const c of C.CONCEPTS){for(const m of c.magazines??[])assert(mags.includes(`{id:'${m}'`),`magazine ${m}`);for(const j of c.jobs??[])assert(jobs.includes(`id:'${j}'`),`job ${j}`);for(const f of c.fish??[])assert(new RegExp(`\\b${f}:\\{title`).test(fish),`keeper beat ${f}`);}
 const combos=fs.readFileSync(path.join(__dirname,'../lib/town/match/combos.ts'),'utf8'),said=[...combos.matchAll(/(?:say|announce)\('([^']+)'/g),...combos.matchAll(/msg:'([^']+)'/g),...combos.matchAll(/\?'([^']+)':'([^']+)'/g)].flatMap(m=>m.slice(1)).filter(Boolean);
 for(const c of C.CONCEPTS.filter(c=>c.feed))assert(said.some(t=>c.feed.test(t)),`${c.id}'s feed pattern matches a real combos line`);
 // QA11 C-7: Spot it only offers lessons from the game being watched (the 11-a-side ladder or futsal), nearest format first.
 assert.deepEqual(C.conceptLessons('far-post','11v11',true),[],'an 11v11 box-run callout never opens the futsal lesson');
 assert.ok(C.conceptLessons('switch-play','7v7',true).every(k=>!k.startsWith('futsal:')),'a 7v7 switch offers grass lessons only');
 assert.equal(C.conceptLessons('switch-play','7v7',true)[0],'9v9:learn9_switch','nearest format first (9v9 before 11v11)');
 assert.ok(C.conceptLessons('pivot','futsal',true).length>0&&C.conceptLessons('one-two','futsal',true).every(k=>k.startsWith('futsal:')),'futsal stays futsal');
 assert.equal(C.conceptForFeed('Pull-back'),null,'the drag-back skill line is not a cut-back');assert.equal(C.conceptForFeed('Cut-back!'),'cutback');
 console.log(`CONCEPT_MAP_PASS ${C.CONCEPTS.length} concepts cover all ${core.length} starter stops; ${linked.length}/${kinds.size} ball ideas, magazines, jobs, keeper beats and match lines checked`);}
}
