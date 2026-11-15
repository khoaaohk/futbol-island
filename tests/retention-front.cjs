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
 assert.match(css,/\[data-enter=actions\]>\*\{animation:settle \.6s calc\(\.7s \+ var\(--b,0\) \* \.18s\)/,'the buttons land at .7 s');
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
console.log('retention-front ok');
