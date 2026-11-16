// The coach app (/coach, Nov 16 2026; docs/coach-app/HANDOFF.md): its pure engine and its saved data, with no browser.
//  1. Team storage: cleaning (numbers required and unique, names optional and cleaned, squad cap), versioning, bad JSON.
//  2. The opening plan: property test over formats, squad sizes and keeper modes: the field is full in every block, totals
//     equal game length x players on the field, the spread is at most one block; the coach's starters start.
//  3. Re-plan on injury, late arrival, leaving early and a skipped change: totals still fill every place, the spread among
//     players who were there all game stays within a block, nobody hurt or gone is planned again.
//  4. The clock from timestamps: start, pause, resume, a "reload" (JSON round trip) and stoppage time.
//  5. A scripted 2-period game: kick-off, every planned change confirmed, an injury and a late arrival, half-time, full time.
//  6. The share link round trip and garbage in; the CSV format (BOM, CRLF, quoting, formula defusing).
//  7. The app shell: noindex, its own manifest and a service worker scoped to /coach only (never /play or the site).
// usage: node tests/coach-app.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache={};
function load(rel){
 if(cache[rel])return cache[rel];
 const src=ts.transpileModule(read(rel),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={};cache[rel]=mod;
 const req=r=>{if(r.startsWith('.')){const base=path.posix.join(path.posix.dirname(rel),r);return load(fs.existsSync(path.join(root,base+'.ts'))?base+'.ts':base+'.tsx');}return require(r);};
 new Function('exports','require',src)(mod,req);return mod;
}
const E=load('lib/coach/engine.ts'),S=load('lib/coach/store.ts');
for(const f of ['lib/coach/engine.ts','lib/coach/store.ts'])
 assert(!/Math\.random|Date\.now|new Date|fetch\(|window\.|document\./.test(read(f).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),`${f} is pure`);
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
/* ---- 1. storage ---- */
{
 const st=S.cleanStore({v:1,team:{name:'  Tigers <b> ',players:[{id:'a',num:7,name:'Ana\u0000 '},{id:'a',num:8,name:'dup id'},{num:7,name:'dup num'},{num:'x'},{num:120},{num:3,gk:true}]},
  here:['a','zzz'],spots:['a','nope'],settings:{format:'9v9',periodMin:999},lang:'es'});
 ok(st.team.name==='Tigers b','team name cleaned: '+st.team.name);
 ok(st.team.players.length===3,'bad and duplicate numbers dropped');
 ok(st.team.players[0].name==='Ana'&&st.team.players[1].id!=='a','names cleaned, duplicate ids replaced');
 ok(st.team.players[2].gk===true&&st.team.players[0].gk===false,'GK mark kept');
 ok(st.here.length===1&&st.spots[1]==='','unknown ids dropped');
 ok(st.settings.format==='9v9'&&st.settings.periodMin===60,'settings clamped');
 ok(st.lang==='es','lang kept');
 ok(S.cleanStore({v:2,team:{players:[{num:1}]}}).team.players.length===0,'a newer version is ignored, not half-read');
 ok(S.cleanStore(null).v===1&&S.cleanStore('x').team.players.length===0,'garbage gives an empty store');
 const mem={};const storage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v;}};
 ok(S.loadStore(storage).team.players.length===0,'empty storage');
 S.saveStore(storage,st);ok(JSON.stringify(S.loadStore(storage))===JSON.stringify(st),'save/load round trip');
 mem[S.STORE_KEY]='{not json';ok(S.loadStore(storage).team.players.length===0,'broken JSON is survived');
 ok(S.loadStore({getItem(){throw new Error('denied');}}).v===1,'storage that throws is survived');
 const many=Array.from({length:50},(_,i)=>({num:i}));ok(S.cleanPlayers(many).length===S.MAX_SQUAD,'squad cap');
}
/* ---- 2. opening plan ---- */
const ids=n=>Array.from({length:n},(_,i)=>'p'+i);
function checkPlan(plan,order,s,where){
 const F=Math.min(s.onField,order.length);
 for(const b of plan.blocks){ok(b.on.length===F&&new Set(b.on).size===F,`${where}: full field`);if(s.keeper!=='none')ok(b.on.includes(b.gk),`${where}: keeper on`);}
 const sec=E.planSeconds(plan.blocks),tot=Object.values(sec).reduce((a,b)=>a+b,0);
 ok(tot===s.periods*s.periodMin*60*F,`${where}: totals = game x field (${tot})`);
 const skip=new Set(s.keeper==='fixed'?[order[0]]:[]),fr=E.fairness(sec,order,skip),maxBlock=Math.max(...plan.blocks.map(b=>b.end-b.start));
 ok(fr.spread<=maxBlock*(s.keeper==="rotate"?2:1)+120,`${where}: spread ${fr.spread} <= block`);
 return fr;
}
for(const pre of E.PRESETS)for(const extra of [0,1,2,3,5])for(const keeper of pre.keeper?['fixed','rotate']:['none']){
 const s={...E.settingsFor(pre),keeper},order=ids(pre.onField+extra),plan=E.buildPlan(order,s);
 checkPlan(plan,order,s,`${pre.id}+${extra} ${keeper}`);
 ok(new Set(plan.blocks[0].on).size===s.onField&&order.slice(0,s.onField).every(p=>plan.blocks[0].on.includes(p)),`${pre.id}+${extra}: the coach's starters start`);
 if(keeper!=='none')ok(plan.blocks[0].gk===order[0],'the coach keeper starts in goal');
}
/* ---- 3. re-plan ---- */
{
 const s={...E.settingsFor(E.presetOf('7v7')),keeper:'fixed'},order=ids(10);
 const rest=E.replan({settings:s,period:0,sec:600,periodSec:1500,available:order.filter(p=>p!=='p3'),on:['p0','p1','p2','p4','p5','p6','p7'],gk:'p0',played:Object.fromEntries(order.map(p=>[p,['p8','p9','p3'].includes(p)?0:600]))});
 ok(rest.every(b=>!b.on.includes('p3')),'the hurt player is not planned');
 ok(rest.every(b=>b.on.length===7&&b.on.includes('p0')),'full field, fixed keeper stays');
 const fut=E.planSeconds(rest),tot=Object.values(fut).reduce((a,b)=>a+b,0);ok(tot===(3000-600)*7,'re-plan fills every place');
 const final=Object.fromEntries(order.map(p=>[p,(['p8','p9','p3'].includes(p)?0:600)+(fut[p]??0)]));
 const fr=E.fairness(final,order.filter(p=>p!=='p3'&&p!=='p0'));ok(fr.spread<=300,`after injury spread ${fr.spread}`);
 /* a property sweep: random-ish states, deterministic */
 let seed=7;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
 for(let t=0;t<300;t++){
  const pre=E.PRESETS[t%E.PRESETS.length],P=pre.onField+1+Math.floor(rnd()*6),s={...E.settingsFor(pre),keeper:pre.keeper?(t%2?'fixed':'rotate'):'none'};
  const order=ids(P),periodSec=s.periodMin*60,period=Math.floor(rnd()*s.periods),sec=Math.floor(rnd()*periodSec);
  const avail=order.filter(()=>rnd()>0.15);if(avail.length<2)continue;
  const elapsed=period*periodSec+sec,played={};for(const p of order)played[p]=Math.floor(rnd()*elapsed);
  const on=avail.slice(0,Math.min(s.onField,avail.length));
  const rest=E.replan({settings:s,period,sec,periodSec,available:avail,on,gk:s.keeper==='none'?null:on[0],played});
  const F=Math.min(s.onField,avail.length),left=(s.periods*periodSec)-elapsed;
  ok(rest.every(b=>b.on.length===F&&b.on.every(p=>avail.includes(p))),`sweep ${t}: full field of available players`);
  const fut=E.planSeconds(rest);ok(Object.values(fut).reduce((a,b)=>a+b,0)===left*F,`sweep ${t}: totals`);
  /* levelling: blocks are whole, so each player can land up to a block either side of the level: the spread among players
     who get time is at most two blocks (the scripted games below hold a tighter bound) */
  const fixed=s.keeper==='fixed'?on[0]:null,pool=avail.filter(p=>p!==fixed),maxBlock=Math.max(...rest.map(b=>b.end-b.start),0);
  const fin=pool.map(p=>played[p]+(fut[p]??0)),lift=pool.filter(p=>(fut[p]??0)>0).map(p=>played[p]+fut[p]);
  if(lift.length&&s.keeper!=='rotate'){const lo=Math.min(...fin),hi=Math.max(...lift);if(process.env.COACH_DBG&&hi-lo>maxBlock+1){console.log(s,period,sec,avail.join(' '),on.join(' '));rest.forEach(b=>console.log(b.period,b.start,b.end,b.on.join(' ')));console.log(pool.map(p=>[p,played[p],fut[p]??0,played[p]+(fut[p]??0)].join(':')).join(' '));}ok(hi-lo<=2*maxBlock+1||pool.filter(p=>played[p]+(fut[p]??0)===lo).every(p=>(fut[p]??0)>=left-1),`sweep ${t}: level within a block (${hi-lo} > ${maxBlock})`);}
 }
}
/* ---- 4. clock ---- */
{
 let c=E.newClock();const t0=1_700_000_000_000;
 c=E.startPeriod(c,t0);ok(E.clockSec(c,t0+65_000)===65,'running');
 c=E.pauseClock(c,t0+65_000);ok(E.clockSec(c,t0+500_000)===65,'paused clock stands still');
 c=JSON.parse(JSON.stringify(c));/* reload */ok(E.clockSec(c,t0+900_000)===65,'survives a reload while paused');
 c=E.resumeClock(c,t0+900_000);c=JSON.parse(JSON.stringify(c));ok(E.clockSec(c,t0+960_500)===125,'survives a reload while running (from timestamps)');
 ok(E.clockSec(c,t0-1)>=0,'a clock never goes negative when the phone clock jumps back');
 c=E.addStoppage(c,60);ok(c.added===60,'stoppage');
 const e=E.endPeriod(c,t0+1_000_000,2);ok(e.status==='break'&&e.period===1&&e.since==null,'half-time');
 ok(E.endPeriod({...c,period:1},t0,2).status==='done','full time');ok(E.fmtClock(125)==='2:05','format');
}
/* ---- 5. scripted 2-period game: 7v7, 10 players, injury + late arrival ---- */
{
 const s={...E.settingsFor(E.presetOf('7v7')),keeper:'fixed'},team=ids(10),late='p9',order=team.filter(p=>p!==late);
 const status=Object.fromEntries(team.map(p=>[p,p===late?'late':'ok']));
 const plan=E.buildPlan(order,s),spots=Object.fromEntries(plan.blocks[0].on.map((p,i)=>[p,i]));
 let g=E.newGame(plan,s,spots,status,0),now=1_000_000,log=[];
 const tick=sec=>{now+=sec*1000;};
 const confirmDue=()=>{for(let n=0;n<20;n++){const nc=E.nextChange(g);if(!nc||(nc.due!=null&&nc.due>E.nowSec(g,now)))return;g=E.applyChange(g,now,nc.change,nc.index);log.push(`${E.nowSec(g,now)} out ${nc.change.out} in ${nc.change.in}`);}};
 g=E.kickOff(g,now);
 for(let t=0;t<1500;t+=30){tick(30);
  if(E.nowSec(g,now)===480){const victim=g.on.find(p=>p!==g.gk);g=E.setStatus(g,now,victim,'hurt');log.push('hurt '+victim);ok(!g.on.includes(victim)&&g.on.length===7,'injured player off, replaced at once');}
  if(E.nowSec(g,now)===720){g=E.setStatus(g,now,late,'ok');log.push('late arrives');}
  confirmDue();}
 g=E.endCurrentPeriod(g,now);ok(g.clock.status==='break','half-time reached');
 confirmDue();tick(300);g=E.kickOff(g,now);
 for(let t=0;t<1500;t+=30){tick(30);confirmDue();}
 g=E.endCurrentPeriod(g,now);ok(g.clock.status==='done','full time');
 const {played}=E.playedSeconds(g,0),tot=Object.values(played).reduce((a,b)=>a+b,0);
 ok(tot===3000*7,`every place filled for the whole game (${tot})`);
 const hurt=Object.keys(g.status).find(p=>g.status[p]==='hurt');
 const fr=E.fairness(played,team.filter(p=>p!==g.gk&&p!==hurt&&p!==late));
 ok(fr.spread<=360,`fair after an injury and a late arrival: ${fr.min/60}-${fr.max/60} min`);
 ok((played[late]??0)>0,'the late player plays');ok(g.subs>4,'changes were made');
 if(process.env.COACH_SIM)console.log(log.join('\n'),'\n',Object.fromEntries(team.map(p=>[p,Math.round((played[p]??0)/60)])));
 /* undo stack */
 let stack=[];for(let k=0;k<40;k++)stack=E.pushUndo(stack,g);ok(stack.length===E.MAX_UNDO,'undo stack is capped');
 /* CSV from this game */
 const T={name:'Tigers',players:team.map((id,i)=>({id,num:i+1,name:i===2?'=cmd()':i===3?'Zoë, "Z"':'',gk:false}))};
 const csv=S.minutesCsv(T,g);
 ok(csv.startsWith('﻿Number,Name,Period 1,Period 2,Minutes in goal,Minutes,Share of game\r\n'),'CSV header + BOM');
 ok(csv.includes(",\"'=cmd()\",")||csv.includes(",'=cmd(),"),'formula defused');ok(csv.includes('"Zoë, ""Z"""'),'quotes escaped');
 ok(csv.trim().split('\r\n').length===11&&csv.endsWith('\r\n'),'one row per player, CRLF');
 const sumMin=csv.trim().split('\r\n').slice(1).reduce((a,r)=>a+Number(r.match(/,([\d.]+),[\d]+%$/)[1]),0);ok(Math.abs(sumMin-350)<0.6,'CSV minutes add up: '+sumMin);
 /* share link round trip */
 const sh=S.toShared(T,s,g.blocks,played,true,true),code=S.encodeShare(sh),back=S.decodeShare(code);
 ok(/^[A-Za-z0-9_-]+$/.test(code),'link code is URL safe');
 ok(back&&back.players.length===10&&back.blocks.length===g.blocks.length&&back.done&&back.seconds[0]===Math.round(played.p0),'share round trip');
 ok(JSON.stringify(back.blocks[1].on)===JSON.stringify(sh.blocks[1].on),'share blocks round trip');
 ok(S.toShared(T,s,g.blocks,played,true,false).players.every(p=>p.name===''),'names left out when asked');
 for(const bad of ['','!!!','eyJ4IjoxfQ',S.encodeShare(sh).slice(0,20)])ok(S.decodeShare(bad)===null,'garbage link: '+bad);
}
/* ---- 6. presets match the sourced age chart ---- */
{
 const sizes=read('lib/site/sizes.ts');
 for(const [f,txt] of [['7v7','2 halves of 25 min'],['9v9','2 halves of 30 min'],['11v11','2 halves of 35 min'],['4v4','4 quarters of 10 min']]){
  const p=E.presetOf(f);ok(sizes.includes(txt)&&`${p.periods===2?'2 halves':'4 quarters'} of ${p.periodMin} min`===txt,`${f} preset matches the chart`);}
 ok(E.presetOf('4v4').keeper===false&&E.presetOf('futsal').rolling===true,'4v4 has no keeper; futsal subs on the fly');
}
/* ---- 7. app shell ---- */
{
 const layout=read('app/coach/layout.tsx'),sw=read('public/coach-sw.js'),reg=read('components/coach/CoachApp.tsx'),man=read('app/coach/manifest.webmanifest/route.ts'),cfg=read('next.config.mjs');
 ok(/robots:\s*\{\s*index:\s*false/.test(layout),'app route is noindex (meta)');
 ok(/source: '\/coach'[^\n]*X-Robots-Tag/.test(cfg)&&/source: '\/coach\/:path\*'[^\n]*X-Robots-Tag/.test(cfg),'app route is noindex (header)');
 ok(/manifest:\s*'\/coach\/manifest\.webmanifest'/.test(layout),'its own manifest');
 ok(/start_url:\s*'\/coach'/.test(man)&&/scope:\s*'\/coach'/.test(man)&&/id:\s*'\/coach'/.test(man),'manifest start_url, scope and id are /coach');
 ok(/register\('\/coach-sw\.js',\s*\{\s*scope:\s*'\/coach'\s*\}\)/.test(reg),'the SW is registered with scope /coach');
 ok(!/register\(/.test(read('components/site/HtmlShell.tsx'))&&!fs.readdirSync(path.join(root,'app/play')).some(f=>/sw|service/i.test(f)),'nothing else registers a service worker');
 ok(/function inScope/.test(sw)&&/\/coach\//.test(sw),'the SW checks its own scope');
 /* run the SW's inScope in a sandbox */
 const m=/function inScope\(([^)]*)\)\{([\s\S]*?)\n\}/.exec(sw);const inScope=new Function(m[1],m[2]);
 for(const [u,want] of [['/coach',true],['/coach/manifest.webmanifest',true],['/coach?lang=es',true],['/play',false],['/',false],['/coaches',false],['/tools/soccer-lineup-builder',false],['/es/coach',false],['/_next/static/x.js',false]])
  ok(inScope(u.split('?')[0])===want,`SW scope ${u} -> ${want}`);
 ok(/caches\.open/.test(sw)&&/skipWaiting/.test(sw)&&!/\/play/.test(sw.replace(/\/\/.*$/gm,'')),'SW caches, updates, never names /play');
}
/* ---- 8. Spanish words and the front doors ---- */
{
 const W=load('lib/coach/words.ts').WORDS,G=load('lib/i18n/es-glossary.ts');
 ok(JSON.stringify(Object.keys(W.en).sort())===JSON.stringify(Object.keys(W.es).sort()),'English and Spanish have the same keys');
 const esText=JSON.stringify(W.es)+Object.values(W.es).filter(v=>typeof v==='function').map(f=>[f(1,2),f(0,2),f(1,4)].join(' ')).join(' ');
 for(const re of G.ES_BANNED)ok(!re.test(esText),'Spanish avoids '+re);
 const page=read('app/(site)/tools/[slug]/page.tsx'),es=read('components/es/pages/ToolsEs.tsx');
 ok(/Substitution calculator: a worked example/.test(page)&&/Playing time calculator in Excel or Google Sheets/.test(page)&&/Equal playing time during the game/.test(page),'front door: worked example, Excel, equal playing time');
 ok((page.match(/app=\{\{href:COACH_APP_PATH/g)||[]).length===2&&/href="\/coach\?lang=es"/.test(es),'front doors link to the app (English and Spanish)');
}
console.log(`coach-app: ${checks} checks passed`);
