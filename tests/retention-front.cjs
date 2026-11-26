// Retention front (Nov 14 2026): Start in the static HTML (pre-paint code flag), the true Start base (st:new), the Home Screen note,
// and the arcade's last score + Welcome back "almost your best". Source checks plus the pure modules run for real.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const load=(f,req=()=>({}))=>{const m={exports:{}};new Function('exports','module','require',ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,req);return m.exports;};
const mem=(init={})=>{const d={...init};return {getItem:k=>k in d?d[k]:null,setItem:(k,v)=>{d[k]=String(v);},removeItem:k=>{delete d[k];},d};};

// 1. Title screen: both button sets in the static HTML ('boot'), picked before paint by the code flag.
{
 const TC=load('lib/boot/titleCode.ts');
 const snap=read('lib/saves/snapshot.ts');assert.match(snap,new RegExp(`SAVE_CODE_KEY='${TC.LOCAL_CODE_KEY}'`),'the boot reads the save-code key');
 assert.match(read('lib/saves/client.ts'),/return c&&LOCAL_CODE_RE\.test\(c\)\?c:null;/,'getLocalCode uses the same rule');
 const run=(stored)=>{const attrs={};const html={setAttribute:(k,v)=>{attrs[k]=v;}};
  new Function('localStorage','document',TC.TITLE_CODE_BOOT)({getItem:()=>stored},{documentElement:html});return 'data-title-code' in attrs;};
 assert.equal(run('lucky-otter-goal-482'),true,'a stored code → returning Play at first paint');
 assert.equal(run(null),false);assert.equal(run('nonsense'),false,'not a code → Start');
 assert.doesNotThrow(()=>new Function('localStorage','document',TC.TITLE_CODE_BOOT)({getItem:()=>{throw new Error('blocked');}},{}),'blocked storage: Start, no error');
 const a=read('components/landing/TitleActions.tsx'),css=read('components/landing/Title.module.css'),land=read('components/landing/Landing.tsx');
 assert.match(land,/<script dangerouslySetInnerHTML=\{\{__html:TITLE_CODE_BOOT\}\}\/>\s*<TitleActions\/>/,'the flag is set before the buttons parse');
 assert.match(a,/\{\(state==='new'\|\|state==='boot'\)&&<div className=\{styles\.choices\} data-enter="actions" data-boot-card="new">/);
 assert.match(a,/\{\(state==='returning'\|\|state==='boot'\)&&<div ref=\{landing\}[^>]*data-boot-card="returning">/);
 assert(!/disabled=\{!saves/.test(a),'Start is not disabled while the save module loads');
 assert.match(a,/const m=saves\?\?await loadSaves\(\)\.catch\(\(\)=>null\);/,'an early tap waits for the module');
 assert.match(css,/\.actions\[data-title-state=boot\] \[data-boot-card=returning\],:global\(html\[data-title-code\]\) \.actions\[data-title-state=boot\] \[data-boot-card=new\]\{display:none\}/);
 assert.doesNotMatch(css,/\[data-enter=actions\]>\*\{animation/,'the buttons have no entrance (Nov 25 2026: was .7 s, Nov 14: 1.02 s)');
}
// 2. Counters: st:new (the real base of Pressed Start) and the Home Screen steps are allowlisted and shown in the admin funnel.
{
 const ids=load('lib/analytics/startIds.ts');for(const id of ['st:new','st:home_tip','st:home_add','st:home_open'])assert(ids.isStartId(id),id);
 assert.match(read('lib/analytics/startEvents.ts'),/else if\(s==='new'\)trackStart\('st:new'\);/);
 const rep=read('lib/analytics/startReport.ts');assert.match(rep,/side:\[step\('st:new',/);assert.match(rep,/\{id:'home',title:'Home Screen \(phones\)',steps:\[step\('st:home_tip',/);
 assert.match(read('app/admin/StartSection.tsx'),/data-start-rate/);
 assert.match(read('components/VisitTracker.tsx'),/isStandalone\(\)\)count\('st:home_open'\)/);
 const since=read('lib/analytics/countSince.generated.ts');for(const id of ['st:new','st:home_tip','ws:s_arcade_near'])assert(since.includes(`"${id}"`),'countSince has '+id);
}
// 3. The Home Screen note: phones with a code, once, never in the installed app; the right words per browser.
{
 const H=load('lib/pwa/homeScreen.ts'),ok={coarse:true,standalone:false,hasCode:true,shownBefore:false};
 assert.equal(H.shouldOfferHomeTip(ok),true);
 for(const k of ['coarse','hasCode'])assert.equal(H.shouldOfferHomeTip({...ok,[k]:false}),false,k);
 for(const k of ['standalone','shownBefore'])assert.equal(H.shouldOfferHomeTip({...ok,[k]:true}),false,k);
 assert.equal(H.homeTipPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',false,false),'ios');
 assert.equal(H.homeTipPlatform('Mozilla/5.0 (Macintosh)',true,false),'ios','iPad desktop mode');
 assert.equal(H.homeTipPlatform('Mozilla/5.0 (Linux; Android 14)',false,true),'prompt');
 assert.equal(H.homeTipPlatform('Mozilla/5.0 (Linux; Android 14) Firefox',false,false),'menu');
 for(const p of ['prompt','ios','menu'])assert(H.homeTipText(p).length<=80&&/Home Screen/.test(H.homeTipText(p)),p);
 assert(H.HOME_TIP_AFTER_MS>=60_000,'never in the first minute');
 const c=read('components/HomeScreenTip.tsx');
 assert.match(c,/toastLane\.request\('home'\)/,'one note at a time (the toast lane)');
 assert(!/setInterval|requestAnimationFrame|Notification|PushManager|fetch\(|email/i.test(c.replace(/\/\*\*[\s\S]*?\*\//,'')),'no loops, no push, no network, no email');
 assert.match(read('components/Town.tsx'),/<HomeScreenTip blocked=\{toastBlocked\}\/>/);
 const S=load('lib/saves/snapshot.ts',n=>n.endsWith('welcome/tally')?{WELCOME_TALLY_KEY:'fi2-welcome-tally-v1',cleanTallyRaw:v=>v}:n.endsWith('welcome/learn')?{WELCOME_LEARN_KEY:'fi2-welcome-learn-v1',WELCOME_ARM_KEY:'fi2-welcome-arm-v1'}:n.endsWith('arcade/lastScore')?load('lib/arcade/lastScore.ts'):{});
 assert(S.DEVICE_KEYS.includes(H.HOME_TIP_KEY)&&!S.isSyncKey(H.HOME_TIP_KEY),'the note flag is per device');
 // 4. Last score: a synced key, sanitised in the snapshot.
 assert(S.isSyncKey('fi2-arcade-last-v1'),'last scores follow the save code');
 const dirty=JSON.stringify({puzzle:{s:300.7,b:338,at:5},runner:{s:-4,b:'x',at:1},hacker:{s:1,b:2,at:3},pinball:{s:500,b:10,at:9}});
 assert.deepEqual(JSON.parse(S.cleanKeys({'fi2-arcade-last-v1':dirty})['fi2-arcade-last-v1']),{puzzle:{s:300,b:338,at:5},pinball:{s:500,b:500,at:9}},'only known games, whole numbers, best ≥ last');
 assert.equal(S.cleanKeys({'fi2-arcade-last-v1':'not json'})['fi2-arcade-last-v1'],undefined);
}
// 5. Last score writes and the "almost your best" pick.
{
 const L=load('lib/arcade/lastScore.ts'),st=mem(),NOW=Date.UTC(2026,10,14,12);
 L.noteLastScore('puzzle',300,338,NOW-3600e3,st);L.noteLastScore('tennis',9,12,NOW,st);L.noteLastScore('kitrush',40,400,NOW-7200e3,st);
 assert.deepEqual(Object.keys(L.readLastScores(st)).sort(),['kitrush','puzzle'],'tennis (a rally) is not a score to beat');
 assert.deepEqual(L.nearBest(L.readLastScores(st),NOW),{game:'puzzle',score:300,best:338,gap:38},'the most recent cabinet, 38 off');
 L.noteLastScore('kitrush',100,400,NOW,st);assert.equal(L.nearBest(L.readLastScores(st),NOW),null,'the latest run was far off: no hook (not 1 point "almost")');
 L.noteLastScore('kitrush',400,400,NOW+1,st);assert.equal(L.nearBest(L.readLastScores(st),NOW+1),null,'a new best: nothing to beat yet');
 L.noteLastScore('snake',90,100,NOW-15*864e5,st);
 const old={snake:{s:90,b:100,at:NOW-15*864e5}};assert.equal(L.nearBest(old,NOW),null,'older than 14 days');
 const rec=read('lib/arcade/arcadeRecords.ts');assert.match(rec,/noteLastScore\(game,Number\.isFinite\(best\)\?best:0,next\.best\);/,'every arcade record write is a last score');
 assert.match(read('components/games/PassPuzzleGame.tsx'),/noteLastScore\('puzzle',run\.score,Math\.max\(best,run\.score\)\);/,'Pass Puzzles Endless Run');
 const doc=read('docs/accounts-design.md');assert(doc.indexOf('`fi2-arcade-last-v1`')<doc.indexOf('**B. Device preferences'),'doc table A');
 assert(doc.indexOf('`fi2-home-tip-v1`')>doc.indexOf('**B. Device preferences'),'doc table B');
}
// 6. The Welcome back hook.
{
 const kinds=load('lib/welcome/kinds.ts');assert(kinds.WELCOME_KINDS.includes('arcade_near'));
 const H=load('lib/welcome/hooks.ts',n=>n.endsWith('/kinds')?kinds:{});
 const base={fav:null,challenge:{game:'puzzle',name:'Pass Puzzles',line:'Solve it.',done:false},weekDays:0,pennantLit:false};
 const hs=H.hooksFor('arcade',{arcade:{...base,near:{game:'puzzle',name:'Pass Puzzles',score:300,best:338}}});
 assert.equal(hs[0].kind,'arcade_near','top tier: almost');assert.equal(hs[0].line,'Your last Pass Puzzles score was 300, 38 off your best! Tap to beat it');
 assert.deepEqual(hs[0].action,{to:'arcade',game:'puzzle',today:false});
 assert.equal(H.hooksFor('arcade',{arcade:{...base,near:{game:'runner',name:'Breakaway Run',score:1200,best:1250}}})[0].line,'Your last Breakaway Run score was 1,200, 50 off your best! Tap to beat it');
 assert(!H.hooksFor('arcade',{arcade:{...base,near:null}}).some(h=>h.kind==='arcade_near'));
 assert.match(read('lib/welcome/facts.ts'),/near:nearFact\(storage,now\)/);
 assert.match(read('app/admin/WelcomeSuggestCard.tsx'),/arcade_near:'Arcade: almost your best'/);
}
// 7. Nov 15 2026: daily runs and elite tiers, each against its own best, named by the hook and opening that mode.
{
 const L=load('lib/arcade/lastScore.ts'),st=mem(),now=new Date(2026,10,15,15).getTime();
 for(const k of ['runner_daily','runner_cup','runner_legend','pinball_derby','pinball_final','kitrush_daily','snake_daily'])assert(L.LAST_SCORE_GAMES.includes(k)&&L.LAST_SCORE_MODES[k],k);
 L.noteLastScore('runner',900,5000,now-5e6,st);L.noteLastScore('runner_daily',300,338,now-1e5,st);
 assert.deepEqual(L.readLastScores(st).runner_daily,{s:300,b:338,at:now-1e5},'its own best, not the classic record');
 assert.deepEqual(L.nearBest(L.readLastScores(st),now),{game:'runner_daily',score:300,best:338,gap:38});
 const tomorrow=new Date(2026,10,16,9).getTime();assert.equal(L.nearBest(L.readLastScores(st),tomorrow),null,'a daily run counts only on its own play day (a new course tomorrow)');
 L.noteLastScore('pinball_final',4000,4200,now,st);assert.equal(L.nearBest(L.readLastScores(st),now+1).game,'pinball_final','the most recent');
 assert.equal(L.nearBest(L.readLastScores(st),now+8*864e5).game,'pinball_final','an elite tier keeps the 14 days');
 L.noteLastScore('pinball_derby',100,1000,now+2,st);assert.equal(L.nearBest(L.readLastScores(st),now+3),null,'more than 30% off: nothing');
 const S=load('lib/saves/snapshot.ts',n=>n.endsWith('welcome/tally')?{WELCOME_TALLY_KEY:'fi2-welcome-tally-v1',cleanTallyRaw:v=>v}:n.endsWith('welcome/learn')?{WELCOME_LEARN_KEY:'fi2-welcome-learn-v1',WELCOME_ARM_KEY:'fi2-welcome-arm-v1'}:n.endsWith('arcade/lastScore')?L:{});
 assert.deepEqual(JSON.parse(S.cleanKeys({'fi2-arcade-last-v1':JSON.stringify({runner_cup:{s:5,b:9,at:1},runner_night:{s:1,b:2,at:3}})})['fi2-arcade-last-v1']),{runner_cup:{s:5,b:9,at:1}},'the snapshot keeps the mode entries, drops unknown ones');
 const kinds=load('lib/welcome/kinds.ts'),H=load('lib/welcome/hooks.ts',n=>n.endsWith('/kinds')?kinds:{});
 const base={fav:null,challenge:null,weekDays:0,pennantLit:false};
 const d=H.hooksFor('arcade',{arcade:{...base,near:{game:'runner',name:'Breakaway Run',score:300,best:338,label:'Daily Run',today:true}}})[0];
 assert.equal(d.line,'Your last Daily Run was 300, 38 off your best! Tap to beat it');assert.deepEqual(d.action,{to:'arcade',game:'runner',today:true});
 const e=H.hooksFor('arcade',{arcade:{...base,near:{game:'pinball',name:'Futbol Pinball',score:4000,best:4200,label:'World Final game',mode:'final'}}})[0];
 assert.equal(e.line,'Your last World Final game was 4,000, 200 off your best! Tap to beat it');assert.deepEqual(e.action,{to:'arcade',game:'pinball',today:false,mode:'final'});
 const A=read('lib/welcome/act.ts');assert.match(A,/arcadeQuery\(a\.game,a\.today,a\.mode\)/);
 const q=load('lib/welcome/act.ts',()=>new Proxy({},{get:()=>()=>{}})).arcadeQuery;assert.equal(q('pinball',false,'final'),'?game=pinball&mode=final');assert.equal(q('runner',true),'?game=runner&today=1');
 assert.match(read('lib/welcome/facts.ts'),/LAST_SCORE_MODES\[n\.game\]/,'facts map a mode entry to its cabinet');
 const T=load('lib/arcade/arcadeToday.ts',()=>new Proxy({},{get:()=>()=>({})}));
 T.requestModeLaunch('runner','cup');assert.equal(T.takeModeLaunch('pinball'),null);assert.equal(T.takeModeLaunch('runner'),'cup');assert.equal(T.takeModeLaunch('runner'),null,'one shot');
 T.requestModeLaunch('runner','night');assert.equal(T.takeModeLaunch('runner'),null,'only the elite tiers');
 assert.match(read('components/ArcadeRoom.tsx'),/requestModeLaunch\(id!,mode\)/);assert.match(read('components/games/RunnerMenu.tsx'),/takeModeLaunch\('runner'\)/);assert.match(read('components/games/PinballCard.tsx'),/takeModeLaunch\('pinball'\)/);
 const set=read('lib/arcade/results/settle.ts');
 assert.match(set,/noteLastScore\('pinball_'\+r\.pinballTier\.id,r\.pinballTier\.score,saved\.progress\[r\.pinballTier\.id\]\.best\)/);assert.match(set,/noteLastScore\('runner_'\+r\.runnerTierBest\.mode,/);assert.match(set,/noteLastScore\('runner_daily',/);
 assert.match(read('components/games/KitRushGame.tsx'),/else noteLastScore\('kitrush_daily',score,settled\.dailyBest\)/);assert.match(read('components/games/SquadSnakeGame.tsx'),/else noteLastScore\('snake_daily',score,settled\.dailyBest\)/);
 assert.match(read('docs/accounts-design.md'),/`runner_daily`, `runner_cup`/);assert.match(read('docs/welcome-suggestions.md'),/Your last Daily Run was 300/);
}
// 8. Nov 15 2026: the returning card warms the island and counts how it ends (totals only).
{
 const R=load('lib/analytics/returningCard.ts',()=>({trackStart:()=>{}}));
 assert.equal(R.retBand(4999),'st:ret_t5');assert.equal(R.retBand(5000),'st:ret_t15');assert.equal(R.retBand(59999),'st:ret_t60');assert.equal(R.retBand(3e5),'st:ret_tmore');
 const mk=()=>{const l={};return {l,w:{addEventListener:(t,f)=>{l[t]=f;},removeEventListener:t=>{delete l[t];}}};};
 let t=0,got=[];const a=mk(),d={visibilityState:'visible'};R.watchReturningCard(a.w,d,()=>t,id=>got.push(id));
 t=8000;a.l.visibilitychange();assert.deepEqual(got,[],'a visible change is not a leave');
 d.visibilityState='hidden';a.l.visibilitychange();assert.deepEqual(got,['st:ret_left','st:ret_t15'],'left after 8 s');assert(!a.l.pagehide,'once per card');
 got=[];const b=mk(),c=R.watchReturningCard(b.w,d,()=>0,id=>got.push(id));c.end();assert(!b.l.visibilitychange,'a tap ends it without a count');
 const I=read('lib/analytics/startIds.ts');for(const id of ['ret_friends','ret_left','ret_t5','ret_t15','ret_t60','ret_tmore'])assert(I.includes(`'${id}'`),id);
 const rep=read('lib/analytics/startReport.ts');for(const id of ['st:ret_friends','st:ret_left','st:ret_tmore'])assert(rep.includes(`step('${id}'`),'admin returning funnel: '+id);
 const since=read('lib/analytics/countSince.generated.ts');assert(since.includes('"st:ret_left"'),'countSince regenerated');
 const ta=read('components/landing/TitleActions.tsx');
 assert.match(ta,/if\(state!=='returning'\)return;return whenIdle\(\(\)=>warmIsland\('returning'\),1500\);/,'the card warms the island on idle');
 assert.match(ta,/if\(state==='returning'\)\{trackStart\('st:ret_friends'\)/);assert.match(ta,/onClickCapture=\{endCard\}/);
 const pre=read('components/root/islandPreload.ts');assert.match(pre,/if\(\(intent==='create'\|\|intent==='returning'\)&&!prefetchAllowed\(\)\)return;/,'Save-Data / 2G respected');
}
// 4. Title-screen audit fixes (Nov 25 2026): what it is in plain view, Start's subtitle, Join friends' slot from the first paint,
//    no entrance delay on the buttons, the grown-up lock known before paint, and the exits counted.
{
 const TC=load('lib/boot/titleCode.ts'),ta=read('components/landing/TitleActions.tsx'),css=read('components/landing/Title.module.css'),
  jf=read('components/landing/JoinFriends.tsx'),jcss=read('components/landing/JoinFriends.module.css'),land=read('components/landing/Landing.tsx');
 assert.match(read('lib/multiplayerAllowed.ts'),new RegExp(`ALLOWED_KEY = '${TC.MP_LOCK_KEY}'`),'the boot reads the grown-up lock key');
 const flags=(store)=>{const attrs={};new Function('localStorage','document',TC.TITLE_CODE_BOOT)({getItem:k=>store[k]??null},{documentElement:{setAttribute:(k)=>{attrs[k]=1;}}});return attrs;};
 assert.equal('data-title-nomp' in flags({[TC.MP_LOCK_KEY]:'off'}),true,'lock Off → no Join friends slot from the first frame');
 assert.equal('data-title-nomp' in flags({[TC.MP_LOCK_KEY]:'friends'}),false);assert.equal('data-title-nomp' in flags({}),false);
 assert.match(jcss,/:global\(html\[data-title-nomp\]\) \.stack\{display:none\}/);
 assert.match(ta,/<p className=\{styles\.tagline\} data-title-tagline aria-hidden="true">Free football game for kids · no sign-up<\/p>/,'the visible line, not announced twice');
 assert.match(land,/className=\{styles\.srOnly\}>Start your island[^<]*free football learning game for kids/,'the screen-reader copy stays');
 assert.match(ta,/<span>Start<\/span><small>Make your island<\/small>/,'a friendlier Start subtitle');assert.doesNotMatch(ta,/Get my save code<\/small>/);
 assert.match(ta,/\(state==='new'\|\|state==='returning'\|\|state==='boot'\)&&<JoinFriends onOpen=\{openJoin\} ready=/,'Join friends is in the static HTML (boot), so Start never moves');
 assert.match(jf,/useState\(true\)/,'rendered on the server, not after an effect');assert.match(jf,/aria-disabled=\{!ready\|\|undefined\}/);
 assert.doesNotMatch(jf,/data-enter="actions-late"/);
 assert.doesNotMatch(css,/\[data-enter=actions\][^{]*\{animation/,'no entrance delay on the title buttons: Start is tappable at first paint');
 assert.doesNotMatch(css,/\[data-enter=actions-late\]/);
 assert.match(read('components/landing/LandingBack.tsx'),/data-track="st:back"/);assert.match(land,/href="\/learn\/lessons" data-track="st:guides"/);
}
console.log('retention-front ok');
