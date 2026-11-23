// The coach app (/coach, Nov 16 2026; docs/coach-app/HANDOFF.md): its pure engine and its saved data, with no browser.
//  1. Team storage: cleaning (numbers required and unique, names optional and cleaned, squad cap), versioning, bad JSON.
//  2. The opening plan: property test over formats, squad sizes and keeper modes: the field is full in every block, totals
//     equal game length x players on the field, the spread is at most one block; the coach's starters start.
//  3. Re-plan on injury, late arrival, leaving early and a skipped change: totals still fill every place, the spread among
//     players who were there all game stays within a block, nobody hurt or gone is planned again.
//  4. The clock from timestamps: start, pause, resume, a "reload" (JSON round trip) and stoppage time.
//  5. A scripted 2-period game: kick-off, every planned change confirmed, an injury and a late arrival, half-time, full time;
//     simulated live games with a keeper per half (7v7 11 players, injury + late arrival: within one change interval) and a
//     property sweep over formats x squad sizes x keeper modes x injuries/arrivals; late players planned before the game.
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
 /* the calculator's own plan (no swap cap); the capped default is checked just below */
 const s={...E.settingsFor(pre),keeper,maxSwaps:0},order=ids(pre.onField+extra),plan=E.buildPlan(order,s);
 checkPlan(plan,order,s,`${pre.id}+${extra} ${keeper}`);
 /* UX audit C14: at most 3 players come on at one stoppage (the default); same totals, starters start, spread within two blocks */
 {const sc={...s,maxSwaps:E.MAX_SWAPS},pc=E.buildPlan(order,sc),F=Math.min(sc.onField,order.length);
  for(const b of pc.blocks)ok(b.on.length===F&&new Set(b.on).size===F&&(sc.keeper==='none'||b.on.includes(b.gk)),`${pre.id}+${extra} capped: full field`);
  ok(Object.values(E.planSeconds(pc.blocks)).reduce((a,x)=>a+x,0)===sc.periods*sc.periodMin*60*F,`${pre.id}+${extra} capped: totals`);
  if(!sc.rolling)ok(pc.blocks.every((b,k)=>!k||!b.start||b.on.filter(p=>!pc.blocks[k-1].on.includes(p)).length<=3),`${pre.id}+${extra} ${keeper}: at most 3 swaps at a stoppage`);
  ok(order.slice(0,F).every(p=>pc.blocks[0].on.includes(p))&&(sc.keeper==='none'||pc.blocks[0].gk===order[0]),`${pre.id}+${extra} capped: the coach's starters start`);
  const mb=Math.max(...pc.blocks.map(b=>b.end-b.start)),fr=E.fairness(E.planSeconds(pc.blocks),order,new Set(sc.keeper==='fixed'?[order[0]]:[]));
  ok(fr.spread<=2*mb+120,`${pre.id}+${extra} ${keeper} capped: spread ${fr.spread}`);}
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
 ok(S.toShared(T,s,g.blocks,played,true,false).players.every((p,i)=>p.name===(i===2?'C.':i===3?'Z.Z.':'')),'names as initials unless the coach includes them (UX audit C2)');
 for(const bad of ['','!!!','eyJ4IjoxfQ',S.encodeShare(sh).slice(0,20)])ok(S.decodeShare(bad)===null,'garbage link: '+bad);
}
/* ---- 5b. simulated live games with a keeper per half: the planner's look-ahead keeps everyone there all game within one change
   interval (the fairness meter's limit); property sweep over formats, squad sizes and keeper modes with injuries and arrivals ---- */
function simGame(fmt,N,keeper,hurtAt,lateAt,cap=Number(process.env.COACH_CAP??E.MAX_SWAPS)){
 const s={...E.settingsFor(E.presetOf(fmt)),keeper,maxSwaps:cap},team=ids(N),late=lateAt!=null?team[N-1]:null,order=team.filter(p=>p!==late);
 const status=Object.fromEntries(team.map(p=>[p,p===late?'late':'ok'])),plan=E.buildPlan(order,s),ps=s.periodMin*60;
 let g=E.newGame(plan,s,Object.fromEntries(plan.blocks[0].on.map((p,i)=>[p,i])),status,0),now=1_000_000;const log=[];let maxIn=0;
 const due=()=>{for(let n=0;n<20;n++){const nc=E.nextChange(g);if(!nc||(nc.due!=null&&nc.due>E.nowSec(g,now)))return;if(nc.due!=null)maxIn=Math.max(maxIn,nc.change.in.length);g=E.applyChange(g,now,nc.change,nc.index);log.push(`${g.clock.period}:${E.nowSec(g,now)} off ${nc.change.out} on ${nc.change.in}${nc.change.gkTo!==nc.change.gkFrom?' gk '+nc.change.gkTo:''}`);}};
 for(let per=0;per<s.periods;per++){due();g=E.kickOff(g,now);
  for(let t=0;t<ps;t+=30){now+=30_000;const abs=per*ps+E.nowSec(g,now);
   if(hurtAt!=null&&abs===hurtAt){const v=g.on.find(p=>p!==g.gk);g=E.setStatus(g,now,v,'hurt');log.push('hurt '+v);}
   if(late&&abs===lateAt){g=E.setStatus(g,now,late,'ok');log.push('arrived '+late);}
   due();}
  g=E.endCurrentPeriod(g,now);now+=300_000;}
 const {played}=E.playedSeconds(g,0),hurt=Object.keys(g.status).find(p=>g.status[p]==='hurt'),fixed=keeper==='fixed'?plan.blocks[0].gk:null;
 const whole=team.filter(p=>p!==hurt&&p!==late&&p!==fixed&&!(g.joined??[]).includes(p));
 return {g,s,played,late,maxIn,fr:E.fairness(played,whole),log,total:Object.values(played).reduce((a,b)=>a+b,0)};
}
{
 /* the owner's case: 7v7 2x25, 11 players, a keeper each half, an injury at 8:00 and a late arrival at 12:00 */
 const r=simGame('7v7',11,'rotate',480,720);
 ok(r.total===3000*7,'7v7 rotate: every place filled');ok(r.g.joined?.includes(r.late),'the late player is recorded as joined');
 ok(r.fr.spread<=r.s.subEvery*60,`7v7 rotate, injury + late arrival: everyone there all game within one change interval (${r.fr.min/60}-${r.fr.max/60} min)`);
 if(process.env.COACH_SIM)console.log(r.log.join('\n'),'\n',Object.fromEntries(Object.entries(r.played).map(([p,v])=>[p,v/60])));
 let n=0,worst=0;
 for(const pre of E.PRESETS)for(const extra of [1,2,3,4,5,6])for(const keeper of pre.keeper?['fixed','rotate']:['none']){
  const half=pre.periodMin*60;
  for(const [h,l] of [[null,null],[480,null],[null,720],[480,720],[900,300],[half+120,half-60]]){
   for(const cap of [0,E.MAX_SWAPS]){
   const x=simGame(pre.id,pre.onField+extra,keeper,h,l,cap),lim=x.s.subEvery*60;n++;worst=Math.max(worst,x.fr.spread/lim);
   ok(x.total===x.s.periods*half*Math.min(pre.onField,pre.onField+extra-(h!=null?1:0))||h!=null||l!=null,`sim ${pre.id}: places filled`);
   /* with nothing happening: one interval; an injury or arrival mid-block can cost up to half a block more (blocks are whole) */
   /* the calculator's promise without a swap cap; with the default cap of 3 at a stoppage (C14) the plan may need up to two */
   ok(x.fr.spread<=(cap?lim*2+90:h==null&&l==null?lim:lim*1.5),`sim ${pre.id} ${pre.onField+extra} ${keeper} cap ${cap} hurt ${h} late ${l}: spread ${x.fr.spread/60} min`);
   if(cap&&!x.s.rolling)ok(!x.maxIn||x.maxIn<=cap,`sim ${pre.id} cap: at most ${cap} on at a stoppage (${x.maxIn})`);
  }}}
 ok(n>=780,'sim sweep ran');if(process.env.COACH_SIM)console.log(`sim sweep ${n} games, worst ${worst.toFixed(2)} intervals`);
}
/* changes confirmed late (waiting for a stoppage): confirmChange re-levels, so a 40 s wait at every change stays within about one
   change interval for the owner's 7v7 with a late arrival at any time */
for(const arr of [300,605,720,900,1205]){
 const s={...E.settingsFor(E.presetOf('7v7')),keeper:'rotate'},team=ids(11),order=team.slice(0,10),L='p10',ps=1500,K=['p0','p1'];
 const plan=E.buildPlan(order,s,K);let g=E.newGame(plan,s,Object.fromEntries(plan.blocks[0].on.map((p,i)=>[p,i])),{...Object.fromEntries(order.map(p=>[p,'ok'])),[L]:'late'},0),now=0;
 const due=()=>{const nc=E.nextChange(g);if(!nc||(nc.due!=null&&nc.due+40>E.nowSec(g,now)))return;g=E.confirmChange(g,now,nc.change,nc.index,K);};
 for(let per=0;per<2;per++){due();g=E.kickOff(g,now);for(let t=0;t<ps;t+=5){now+=5000;if(per*ps+E.nowSec(g,now)===arr)g=E.setStatus(g,now,L,'ok',K);due();}g=E.endCurrentPeriod(g,now,K);}
 const {played}=E.playedSeconds(g,0),fr=E.fairness(played,order),tot=Object.values(played).reduce((a,b)=>a+b,0);
 ok(tot===3000*7,'lagged changes: every place filled');ok(fr.spread<=1.25*300,`lagged changes, arrival at ${arr}s: spread ${fr.spread/60} min`);
 /* UX audit B2: p0 and p1 are the players marked "Can keep goal": one each half, nobody unmarked goes in */
 ok(g.blocks.every(b=>K.includes(b.gk))&&new Set(g.blocks.map(b=>b.gk)).size===2,'lagged changes: only the marked keepers in goal, one each half');
}
/* ---- 5c. late players before the game: the plan brings them in at the expected minute, as the live game will ---- */
{
 const s={...E.settingsFor(E.presetOf('7v7')),keeper:'rotate'},team=ids(11),order=team.filter(p=>p!=='p10'&&p!=='p9');
 const pl=E.planWithLate([...order,'p9','p10'],s,{p9:10,p10:null});
 ok(pl.blocks.every(b=>b.on.length===7&&!b.on.includes('p10')),'late, minute not known: not planned, full field');
 ok(pl.blocks.filter(b=>b.period*1500+b.start<600).every(b=>!b.on.includes('p9')),'late at minute 10: not on before it');
 ok(pl.blocks.some(b=>b.on.includes('p9')),'late at minute 10: plays after it');
 const sec=E.planSeconds(pl.blocks);ok(Object.values(sec).reduce((a,b)=>a+b,0)===3000*7,'late plan fills every place');
 const fr=E.fairness(sec,order);ok(fr.spread<=300,`late plan: everyone there all game within one interval (${fr.spread})`);
 ok(JSON.stringify(E.planWithLate(order,s,{}))===JSON.stringify(E.buildPlan(order,s)),'no late players: the opening plan');
 /* the live game started from the players here, then "Arrived" at minute 10, follows the same plan */
 const start=E.buildPlan(order,s);let g=E.newGame(start,s,Object.fromEntries(start.blocks[0].on.map((p,i)=>[p,i])),{...Object.fromEntries(order.map(p=>[p,'ok'])),p9:'late',p10:'late'},0),now=0;
 g=E.kickOff(g,now);for(let t=0;t<600;t+=30){now+=30_000;for(let k=0;k<5;k++){const nc=E.nextChange(g);if(!nc||(nc.due!=null&&nc.due>E.nowSec(g,now)))break;g=E.applyChange(g,now,nc.change,nc.index);}}
 g=E.setStatus(g,now,'p9','ok');
 ok(JSON.stringify(g.blocks.filter(b=>b.period*1500+b.start>=600).map(b=>[b.period,b.start,[...b.on].sort()]))===JSON.stringify(pl.blocks.filter(b=>b.period*1500+b.start>=600).map(b=>[b.period,b.start,[...b.on].sort()])),'the live re-plan on arrival matches the plan shown before the game');
 /* the store keeps late minutes for players who are coming only */
 const st=S.cleanStore({v:1,team:{players:[{id:'a',num:1},{id:'b',num:2},{id:'c',num:3}]},here:['a','b'],late:{a:12,b:null,c:5,zz:3}});
 ok(JSON.stringify(st.late)==='{"a":12,"b":null}','late: only players coming, minute or null');
 ok(JSON.stringify(S.cleanStore({v:1,team:{players:[{id:'a',num:1}]},here:['a'],late:{a:'x'}}).late)==='{}','late: garbage dropped');
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
 ok(/manifest:\s*'\/coach\/manifest\.webmanifest'/.test(layout)&&/link\[rel=manifest\][\s\S]*l\.href='\/coach\/manifest\.webmanifest'/.test(layout),'its own manifest (metadata + the swap over the site file manifest)');
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
 ok((page.match(/app=\{\{href:COACH_APP_PATH/g)||[]).length===2&&/href=\{`\/coach\?lang=es#tool=\$\{app\}/.test(es),'front doors link to the app (English and Spanish), each to its own tool (Nov 22 2026)');
 ok(/COACH_APP_PATH\+'#tool=lineup'/.test(page)&&/'#tool=subs':'#tool=minutes'/.test(page),'lineup pages open the lineup builder; the calculator Playing time; the rotations Substitution rotation');
}
/* ---- 9. Several teams (Nov 22 2026; lib/coach/teams.ts): migration from fi-coach-v1, switching, deleting ---- */
{
 const T=load('lib/coach/teams.ts');
 ok(!/Math\.random|Date\.now|new Date|window\.|document\./.test(read('lib/coach/teams.ts').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'teams.ts is pure');
 const mem=(o={})=>{const m={...o};return {m,getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v);}};};
 const one={v:1,team:{name:'Blue Sharks',players:[{id:'a',num:1,name:'Ava',gk:true},{id:'b',num:2,name:'Ben'}]},settings:{format:'7v7'},here:['a','b'],spots:[],game:null,lang:'es',sound:false,last:null};
 // empty storage: one empty team
 let t=T.loadTeams(mem());ok(t.teams.length===1&&t.teams[0].team.players.length===0&&t.activeId===t.teams[0].id,'empty storage: one empty team');
 // one team in fi-coach-v1 migrates as the first team, then both keys are written
 const st=mem({'fi-coach-v1':JSON.stringify(one)});t=T.loadTeams(st);
 ok(t.teams.length===1&&t.teams[0].team.name==='Blue Sharks'&&t.teams[0].team.players.length===2&&t.teams[0].lang==='es'&&t.teams[0].sound===false,'fi-coach-v1 migrates as the first team');
 ok(T.saveTeams(st,t)&&JSON.parse(st.m['fi-coach-teams-v1']).teams.length===1&&JSON.parse(st.m['fi-coach-v1']).team.name==='Blue Sharks'&&!('id' in JSON.parse(st.m['fi-coach-v1'])),'save writes the teams and the active team to fi-coach-v1');
 // two teams: add (copy players), switch, data separate, fi-coach-v1 follows the active team
 t=T.addTeam(t,{name:'Red Foxes',from:t.teams[0].id},7);
 ok(t.teams.length===2&&t.activeId===t.teams[1].id&&t.teams[1].team.players.length===2&&t.teams[1].game===null,'add a team copying players: made active, no games copied');
 t=T.updateActive(t,s=>({...s,team:{...s.team,players:s.team.players.slice(0,1)}}));
 ok(t.teams[0].team.players.length===2&&t.teams[1].team.players.length===1,'editing one team leaves the other alone');
 t=T.updateActive(t,s=>({...s,lang:'en'}));ok(t.teams.every(x=>x.lang==='en'),'the language is the coach\'s: every team follows');
 T.saveTeams(st,t);ok(JSON.parse(st.m['fi-coach-v1']).team.name==='Red Foxes','fi-coach-v1 holds the active team');
 const back=T.loadTeams(st);ok(back.teams.length===2&&back.activeId===t.activeId&&back.teams[1].team.players.length===1,'two teams round-trip');
 t=T.switchTeam(t,t.teams[0].id);ok(T.activeOf(t).team.name==='Blue Sharks','switch team');
 ok(T.switchTeam(t,'tnope')===t,'switching to an unknown team does nothing');
 // corrupted JSON in the teams key: migrate from fi-coach-v1 again; garbage teams are cleaned
 ok(T.loadTeams(mem({'fi-coach-teams-v1':'{bad json','fi-coach-v1':JSON.stringify(one)})).teams[0].team.name==='Blue Sharks','corrupted teams JSON: migrate from fi-coach-v1');
 ok(T.loadTeams(mem({'fi-coach-teams-v1':JSON.stringify({v:1,activeId:'x',teams:[]})})).teams.length===1,'no teams: one empty team');
 const g=T.cleanTeams({v:1,activeId:'tz',teams:[null,{id:'tA',v:1,team:{name:'X',players:[]}},{id:'tA',v:1,team:{name:'Y',players:[]}},'x']});
 ok(g&&g.teams.length===2&&new Set(g.teams.map(x=>x.id)).size===2&&g.activeId===g.teams[0].id,'bad ids, duplicates and an unknown active id are fixed');
 ok(T.cleanTeams({v:2,teams:[{}]})===null&&T.cleanTeams('x')===null,'unknown version or shape: not a teams record');
 // deleting: the active team (next one becomes active), another team, the last team (one empty team)
 const three=T.addTeam(T.addTeam(T.loadTeams(mem({'fi-coach-v1':JSON.stringify(one)})),{name:'B'},2),{name:'C'},3);
 let d=T.deleteTeam(three,three.activeId);ok(d.teams.length===2&&d.activeId===d.teams[0].id&&!d.teams.some(x=>x.team.name==='C'),'delete the active team: the first other team becomes active');
 d=T.deleteTeam(d,d.teams[1].id);ok(d.teams.length===1&&T.activeOf(d).team.name==='Blue Sharks','delete another team: the active one stays');
 d=T.deleteTeam(d,d.activeId,5);ok(d.teams.length===1&&d.teams[0].team.players.length===0&&d.teams[0].lang==='es','delete the last team: one empty team, the language kept');
 // a live game belongs to its team
 const live={...one,game:null};const L=T.cleanTeams({v:1,activeId:'t1',teams:[{...live,id:'t1'},{...live,id:'t2',team:{name:'Other',players:[]}}]});
 ok(T.liveTeam(L)===null,'no live game');
 const fakeLive={...T.activeOf(L),game:{clock:{status:'live'}}};const L2={...L,teams:[fakeLive,L.teams[1]],activeId:'t2'};
 ok(T.liveTeam(L2).id==='t1'&&T.activeOf(L2).game===null,'the live game stays with its team when another team is shown');
 ok(T.initials('Blue Sharks',1)==='BS'&&T.initials('tigers',2)==='TI'&&T.initials('',3)==='T3','team badge initials');
}
/* ---- 10. Screens in the URL (round 4A, Nov 22 2026; lib/coach/route.ts): history routing, deep links, the practice age ---- */
{
 const R=load('lib/coach/route.ts');
 ok(!/window\.|document\.|localStorage/.test(read('lib/coach/route.ts').replace(/\/\*[\s\S]*?\*\//g,'')),'route.ts is pure');
 const P=h=>R.parseHash(h);
 ok(P('').screen==='gameday'&&P('#tool=home').screen==='gameday','no hash / old #tool=home -> Game Day');
 ok(P('#tool=training').screen==='training'&&P('#tab=training').screen==='training','Training tab');
 ok(P('#tool=match').live===true&&P('#tool=match').screen==='subs','#tool=match opens the live game over the rotation');
 for(const t of ['team','lineup','minutes','subs','summary','plans'])ok(P('#tool='+t).screen===t,'tool '+t);
 ok(P('#tool=nope').screen==='gameday'&&P('#tool=<script>').screen==='gameday','unknown tools fall back to Game Day');
 ok(P('#tool=subs&format=9v9').format==='9v9'&&P('#tool=subs&format=99v99').format===undefined,'format kept, garbage dropped (C6)');
 const pl=P('#tool=plans&plan=u8-passing-practice-plan&age=u8&run=1');
 ok(pl.plan==='u8-passing-practice-plan'&&pl.age==='U8'&&pl.run===true,'plan, age and the session in the hash');
 ok(P('#tool=plans&plan=../../x').plan===undefined&&P('#tool=lineup&plan=x').plan===undefined,'plan slugs are checked and only on the plans screen');
 for(const h of ['#tool=gameday','#tool=training','#tool=subs&format=9v9','#tool=plans&plan=u6-first-practice&age=U6&run=1','#tool=match'])
  ok(R.hashFor(P(h))===h,'round trip '+h);
 const st=r=>R.landingStack(r).map(R.hashFor).join(' ');
 ok(st({screen:'gameday'})==='#tool=gameday','a tab page: one entry');
 ok(st({screen:'subs'})==='#tool=gameday #tool=subs','a deep-linked tool gets its tab page underneath (Back returns to it, B1)');
 ok(st({screen:'plans'})==='#tool=training #tool=plans','plans belong to Training');
 ok(st({screen:'plans',plan:'u6-first-practice'})==='#tool=training #tool=plans #tool=plans&plan=u6-first-practice','a plan link: Training, the list, the plan');
 ok(st({screen:'subs',live:true})==='#tool=gameday #tool=match','a live game opens over Game Day');
 ok(R.homeOf('plans')==='training'&&R.homeOf('lineup')==='gameday'&&R.homeOf('summary')==='gameday','each tool returns to its own tab');
 ok(R.sameRoute(P('#tool=subs&format=9v9'),P('#tool=subs'))&&!R.sameRoute(P('#tool=subs'),P('#tool=lineup')),'same route ignores the format hint');
 /* the practice age: an age in the team name wins, else the format */
 for(const [f,n,want] of [['4v4','','U6'],['5v5','','U8'],['7v7','','U10'],['futsal','','U10'],['9v9','','U12'],['11v11','','U12'],['7v7','Tigers U8','U8'],['9v9','u9 Blue','U10'],['5v5','U5 Minis','U6'],['7v7','Lions U-11','U12'],['7v7','Under the sea','U10']])
  ok(R.ageFor(f,n)===want,`ageFor(${f}, "${n}") = ${want}`);
 /* the app wires it: history entries, popstate, the plans data on demand; the tab pages and the language sheet */
 const app=read('components/coach/CoachApp.tsx');
 ok(/history\.pushState\(/.test(app)&&/addEventListener\('popstate'/.test(app)&&/addEventListener\('hashchange'/.test(app),'pushState + popstate + hashchange');
 ok(/translate="no"/.test(app),'translate="no" on the app root (C10)');
 ok(/setToast\(null\);\/\* a toast belongs/.test(app),'the undo toast stays on its screen (C15)');
 ok(/<LangSheet /.test(app)&&/data-nav=\{k\}/.test(app),'bottom nav + language sheet');
 ok(/plans-data\/\$\{lang\}\?v=/.test(read('components/coach/PlansTool.tsx')),'practice plans are fetched on demand, versioned for the cache-first SW');
 ok(/#tool=plans&plan=\$\{p\.slug\}/.test(read('app/(site)/learn/soccer-practice-plans/[slug]/page.tsx'))&&/lang=es#tool=plans&plan=\$\{p\.slug\}/.test(read('components/es/pages/DrillsEs.tsx')),'plan pages open the plan in the coach app (EN + ES)');
 ok(/&format=\$\{p\.format\}/.test(read('app/(site)/tools/[slug]/page.tsx')),'tool pages keep their format in the app link');
}
/* ---- 11. Round 4C (Nov 22 2026): the game-day logic from the UX audit ---- */
{
 const T=load('lib/coach/teams.ts');
 const mem=(o={})=>{const m={...o};return {m,getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v);}};};
 const ps=1500,mkGame=(s,order,keepers=[])=>{const plan=E.buildPlan(order,s,keepers);return E.newGame(plan,s,Object.fromEntries(plan.blocks[0].on.map((p,i)=>[p,i])),Object.fromEntries(order.map(p=>[p,'ok'])),0);};
 /* B2: only players marked "Can keep goal" go in goal: opening plan, half-time and every re-plan */
 for(const fmt of ['5v5','7v7','9v9','11v11'])for(const extra of [1,3,5]){
  const pre=E.presetOf(fmt),s=E.settingsFor(pre),order=ids(pre.onField+extra),K=['p0',order[order.length-1]];
  const plan=E.buildPlan(order,s,K);ok(plan.blocks.every(b=>K.includes(b.gk)),`B2 ${fmt}+${extra}: only marked keepers in goal in the plan`);
  ok(plan.blocks[0].gk==='p0'&&new Set(plan.blocks.map(b=>b.gk)).size===2,`B2 ${fmt}+${extra}: one marked keeper each half`);
  let g=mkGame(s,order,K),now=0;g=E.kickOff(g,now);now+=480_000;
  g=E.setStatus(g,now,g.on.find(p=>p!==g.gk),'hurt',K);now+=600_000;g=E.endCurrentPeriod(g,now,K);
  ok(g.blocks.every(b=>K.includes(b.gk)),`B2 ${fmt}+${extra}: after an injury and half-time, still only marked keepers`);
 }
 {/* one marked keeper keeps goal all game; the coach's own starting keeper keeps the first period; none marked = everyone rotates */
  const s=E.settingsFor(E.presetOf('7v7')),order=ids(11);
  const one=E.buildPlan(order,s,['p0']);ok(one.blocks.every(b=>b.gk==='p0')&&E.soleKeeper(one.blocks)==='p0','B2: the one marked keeper keeps goal all game');
  const other=E.buildPlan(order,s,['p5']);ok(other.blocks.filter(b=>b.period===0).every(b=>b.gk==='p0')&&other.blocks.filter(b=>b.period===1).every(b=>b.gk==='p5'),'B2: the coach\'s starting keeper, then the marked one');
  ok(E.soleKeeper(E.buildPlan(order,s,[]).blocks)===null,'B2: nobody marked: the keeper rotates (the app warns)');
  /* a re-plan at half-time never keeps an unmarked keeper on */
  const r=E.replan({settings:s,period:1,sec:0,periodSec:ps,available:order,on:order.slice(0,7),gk:'p3',played:{},kept:{p3:1500},keepers:['p0','p1']});
  ok(r.every(b=>b.gk==='p0'||b.gk==='p1'),'B2: half-time re-plan hands goal to a marked keeper');
 }
 /* B3: a change missed for 20 minutes: a gentle second alert at 2 min overdue, "Replan from now", re-levelled at half-time */
 {
  const s={...E.settingsFor(E.presetOf('7v7')),keeper:'fixed'},order=ids(11);let g=mkGame(s,order),now=0;g=E.kickOff(g,now);
  const nc=E.nextChange(g),at=nc.due;now=at*1000;ok(E.alertKey(g,now)===`c${nc.index}:0`,'B3: alert when the change is due');
  now=(at+60)*1000;ok(E.alertKey(g,now)===`c${nc.index}:0`,'B3: no second alert before 2 min');
  now=(at+E.OVERDUE_SEC)*1000;ok(E.alertKey(g,now)===`c${nc.index}:0:late`,'B3: one gentle re-alert at 2 min overdue');
  now=(at+900)*1000;/* 15 min missed */
  const before=E.playedSeconds(g,E.nowSec(g,now)).played;
  g=E.replanNow(g,now);const n2=E.nextChange(g);
  ok(n2&&n2.due===E.nowSec(g,now),'B3: Replan from now: a fresh change due now');
  ok(n2.change.in.every(p=>(before[p]??0)===0||(before[p]??0)<Math.max(...Object.values(before))),'B3: the replan brings on players owed time');
  g=E.confirmChange(g,now,n2.change,n2.index);
  /* a whole first half with every change missed: half-time re-levels the second half from the minutes really played */
  let h=mkGame(s,order);h=E.kickOff(h,0);const end=ps*1000;
  const old={...h,clock:E.endPeriod(h.clock,end,2),stints:h.stints.map(x=>x.to==null?{...x,to:ps}:x),next:h.blocks.findIndex(b=>b.period===1),delay:0};
  const half=E.endCurrentPeriod(h,end);ok(E.driftSec(old,0)>=30&&half.blocks!==h.blocks,'B3: drift found at half-time, plan re-levelled');
  const finish=x=>{let y=x,t=end+300_000;const run=()=>{for(let j=0;j<8;j++){const c=E.nextChange(y);if(!c||(c.due!=null&&c.due>E.nowSec(y,t)))break;y=E.applyChange(y,t,c.change,c.index);}};
   run();y=E.kickOff(y,t);for(let k=0;k<60;k++){t+=25_000;run();}return E.endCurrentPeriod(y,t);};
  const sp=x=>E.fairness(E.playedSeconds(x,0).played,order.slice(1)).spread;
  const a=sp(finish(old)),b=sp(finish(half));
  ok(b<a&&b<=600,`B3: half-time re-levels missed changes (${a/60} -> ${b/60} min)`);
 }
 /* B4: the tap guard */
 ok(E.tapOk(0,1500)&&!E.tapOk(1000,2000)&&E.TAP_GUARD_MS===1500,'B4: a second tap within 1.5 s is ignored');
 {/* B4: one Done = one round even when tapped twice (the UI guard), and Done early changes only that change */
  const s=E.settingsFor(E.presetOf('7v7')),order=ids(11);let g=mkGame(s,order),now=0;g=E.kickOff(g,now);now=60_000;
  const nc=E.nextChange(g);ok(nc.due-E.nowSec(g,now)>0,'B4: the change is not due yet (the app asks "Change early?")');
  const g1=E.confirmChange(g,now,nc.change,nc.index);ok(g1.subs===1&&E.nextChange(g1).index>nc.index,'B4: early Done makes one change');
 }
 /* C4: Skip keeps the players on until the next planned change, never an instant "Change now" */
 for(const fmt of ['7v7','9v9','5v5']){
  const s=E.settingsFor(E.presetOf(fmt)),order=ids(E.presetOf(fmt).onField+3);let g=mkGame(s,order),now=0;g=E.kickOff(g,now);
  const nc=E.nextChange(g),nextPlanned=g.blocks[nc.index+1];now=nc.due*1000;
  const k=E.skipChange(g,now),n2=E.nextChange(k);
  ok(JSON.stringify([...k.on].sort())===JSON.stringify([...g.on].sort()),`C4 ${fmt}: Skip keeps the players on`);
  ok(!n2||n2.due==null||n2.due>E.nowSec(k,now)+30,`C4 ${fmt}: after Skip the next change is not due at once (${n2&&n2.due})`);
  if(nextPlanned&&nextPlanned.period===0&&n2&&n2.due!=null)ok(n2.due===nextPlanned.start,`C4 ${fmt}: next change at its planned time ${nextPlanned.start}`);
  ok(Object.values(E.planSeconds(k.blocks)).reduce((a,x)=>a+x,0)===s.periods*s.periodMin*60*s.onField,`C4 ${fmt}: totals still fill every place`);
 }
 /* C14: the cap is a setting (default 3, 0 = no limit), cleaned */
 ok(E.cleanSettings({format:'9v9'}).maxSwaps===3&&E.cleanSettings({format:'9v9',maxSwaps:0}).maxSwaps===0&&E.cleanSettings({format:'9v9',maxSwaps:99}).maxSwaps===11,'C14: max swaps setting');
 {const s={...E.settingsFor(E.presetOf('11v11')),maxSwaps:2},order=ids(18),p=E.buildPlan(order,s);
  ok(p.blocks.every((b,k)=>!k||!b.start||b.on.filter(x=>!p.blocks[k-1].on.includes(x)).length<=2),'C14: a cap of 2 holds in the plan');}
 /* C17: game details and the score, kept through a reload */
 {const s=E.settingsFor(E.presetOf('7v7')),order=ids(9),plan=E.buildPlan(order,s);
  let g=E.newGame(plan,s,{},Object.fromEntries(order.map(p=>[p,'ok'])),0,{opp:'Tigers',date:'2026-11-29',time:'10:30',home:'away'});
  g=E.addGoal(g,'p3');g=E.addGoal(g);g=E.theirGoal(g,1);g=E.setScorer(g,1,'p4');g=E.addGoal(g,'p5');g=E.removeGoal(g);
  ok(JSON.stringify(E.scoreOf(g))==='{"us":2,"them":1}'&&g.score.goals.join()==='p3,p4','C17: score with scorers');
  const st=S.cleanStore({v:1,team:{players:order.map((id,i)=>({id,num:i+1}))},here:order,game:JSON.parse(JSON.stringify(g)),match:{opp:'  Tigers ',date:'2026-11-29',time:'10:30',home:'away'}});
  ok(st.game.info.opp==='Tigers'&&st.game.score.goals.join()==='p3,p4'&&st.game.score.them===1,'C17: details + score survive a reload');
  ok(st.match.opp==='Tigers'&&st.match.home==='away'&&S.cleanMatch({date:'tomorrow',time:'9',home:'x'}).date===''&&S.cleanMatch({time:'9'}).time===''&&S.cleanMatch(null).home==='','C17: next game cleaned');
  ok(S.hasMatch(st.match)&&!S.hasMatch(S.cleanMatch({})),'C17: has details');
  /* C2: the parents' link carries the date, opponent and score; names as initials by default */
  const T2={name:'Sharks',players:order.map((id,i)=>({id,num:i+1,name:i===0?'Ana Lopez':'',gk:false}))};
  const sh=S.toShared(T2,s,plan.blocks,E.planSeconds(plan.blocks),true,false,{opp:'Tigers',date:'2026-11-29',us:2,them:1}),back=S.decodeShare(S.encodeShare(sh));
  ok(back.info.opp==='Tigers'&&back.info.date==='2026-11-29'&&back.info.us===2&&back.info.them===1&&back.players[0].name==='A.L.','C2: details, score and initials in the link');
  ok(S.decodeShare(S.encodeShare({...sh,info:undefined})).info===undefined,'C2: a plan link without a game has no details');
 }
 /* B5: two tabs: the revision counter, newer wins */
 {const st=mem(),t=T.loadTeams(st),r1=T.saveTeamsRev(st,t);ok(r1===1&&T.storedRev(st)===1,'B5: first save is revision 1');
  const other={...t,teams:t.teams.map(x=>({...x,team:{...x.team,name:'Renamed'}}))};const r2=T.saveTeamsRev(st,{...other,rev:0});
  ok(r2===2,'B5: a save goes above the stored revision even from a stale tab');
  ok(T.newerTeams(st.m['fi-coach-teams-v1'],1).teams[0].team.name==='Renamed'&&T.newerTeams(st.m['fi-coach-teams-v1'],2)===null&&T.newerTeams('{bad',0)===null,'B5: the other tab takes only a newer record');
  ok(T.loadTeams(st).rev===2,'B5: the revision is read back');}
 /* UI wiring that has no browser here (the Playwright walkthrough covers the behaviour) */
 const app=read('components/coach/CoachApp.tsx');
 ok(!/window\.confirm\(w\.(changeEarly|earlyQ)/.test(app)&&/data-early-sheet/.test(app)&&/tapOk\(/.test(app),'B4: an in-app "Change early?" sheet and the tap guard');
 ok(/addEventListener\('storage'/.test(app)&&/newerTeams\(/.test(app),'B5: the app listens for the other tab');
 ok(/data-attend=/.test(app)&&!/one tap cycles Coming/.test(app),'C5: three visible attendance choices');
 ok(/data-replan-now/.test(app)&&/alertKey\(/.test(app),'B3: Replan from now + the gentle re-alert');
 ok(/data-score=/.test(app)&&/data-game-details/.test(app),'C17: score on Match day, game details sheet');
 for(const l of ['en','es']){const w=load('lib/coach/words.ts').WORDS[l];ok(!/uneven|desigual/i.test(w.fairCheck)&&w.sharedTitle&&w.changeEarly&&w.replanNow,'neutral words, '+l);}
}
/* ---- 12. round 4D: lineup moves (lib/coach/lineup.ts) and the stranded-disc regression ---- */
{
 const L=load('lib/coach/lineup.ts');
 const b=['h','i'],sp=['a','b','c','d',''];
 let m=L.moveSpots(sp,b,{k:'b',id:'h'},{k:'s',i:1});ok(m&&m.spots[1]==='h'&&m.kind==='in'&&m.on==='h'&&m.off==='b'&&m.to===1,'bench onto a spot: replaces, the spot player goes to the bench');
 m=L.moveSpots(sp,b,{k:'s',i:1},{k:'b',id:'h'});ok(m&&m.spots[1]==='h'&&m.off==='b','spot onto a bench chip: the same swap');
 m=L.moveSpots(sp,b,{k:'s',i:0},{k:'s',i:2});ok(m&&m.spots[0]==='c'&&m.spots[2]==='a'&&m.kind==='swap','spot onto spot: swap');
 m=L.moveSpots(sp,b,{k:'s',i:0},{k:'s',i:4});ok(m&&m.spots[4]==='a'&&m.spots[0]===''&&m.kind==='place','a player onto an empty spot moves there');
 m=L.moveSpots(sp,b,{k:'b',id:'i'},{k:'s',i:4});ok(m&&m.spots[4]==='i'&&m.kind==='place'&&m.off==='','bench onto an empty spot: placed');
 ok(L.moveSpots(sp,b,{k:'b',id:'h'},{k:'b',id:'i'})===null&&L.moveSpots(sp,b,{k:'s',i:2},{k:'s',i:2})===null&&L.moveSpots(sp,b,{k:'s',i:4},{k:'s',i:1})===null,'no-ops: bench onto bench, onto itself, from an empty spot');
 ok(L.moveSpots(sp,b,{k:'b',id:'zz'},{k:'s',i:1})===null&&L.moveSpots(sp,b,{k:'s',i:9},{k:'s',i:1})===null&&L.moveSpots(sp,['a'],{k:'b',id:'a'},{k:'s',i:2})===null,'no-ops: unknown player, a spot out of range, a "bench" player already on the pitch');
 ok(L.parseRef('s:3').i===3&&L.parseRef('b:p1').id==='p1'&&L.parseRef('s:x')===null&&L.parseRef('')===null&&L.refKey({k:'b',id:'q'})==='b:q','refs round trip, garbage is null');
 /* property: 3000 random moves (drag, tap or keyboard all call moveSpots) never put a player in two places */
 let seed=7;const rnd=n=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed%n;};
 const all=['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11'];let spots=all.slice(0,7);
 for(let k=0;k<3000;k++){const bench=all.filter(x=>!spots.includes(x));const ref=()=>rnd(3)?{k:'s',i:rnd(spots.length)}:{k:'b',id:bench[rnd(bench.length)]||'p1'};
  const r=L.moveSpots(spots,bench,ref(),ref());if(r)spots=r.spots;const bn=all.filter(x=>!spots.includes(x));
  if(!L.onePlace(spots,bn)||spots.filter(Boolean).length+bn.length!==all.length){ok(false,'one place after move '+k);}}
 ok(true,'3000 random moves: every player in exactly one place');ok(!L.onePlace(['a','a'],[])&&!L.onePlace(['a'],['a']),'onePlace catches a player twice');
 /* the drag controller ends on every release path and draws on a <body> layer (the owner's stranded "8") */
 const app=read('components/coach/CoachApp.tsx');
 ok(/addEventListener\('pointercancel'/.test(app)&&/addEventListener\('blur'/.test(app)&&/visibilitychange/.test(app)&&/addEventListener\('pagehide'/.test(app),'drag ends on cancel, blur, hidden page, pagehide');
 ok(/addEventListener\('pointerup'/.test(app)&&/document\.body\.appendChild\(el\)/.test(app)&&/el\.remove\(\)/.test(app),'release is heard on the window; the ghost layer lives on <body> and is removed on unmount');
 ok(/setSel\(null\);setLifted\(L\.key\)/.test(app),'lifting a player clears the tap selection');
 ok(!/\.ghost\{position:fixed;z-index:50/.test(read('components/coach/coach.module.css'))&&/prefers-reduced-motion:reduce\)\{\n \.discHit/.test(read('components/coach/coach.module.css')),'old ghost gone; reduced motion = fades');
 for(const l of ['en','es']){const w=load('lib/coach/words.ts').WORDS[l];ok(w.lineupSwap('a','b')&&w.lineupIn('a','b')&&w.lineupPlace('a','LD'),'lineup toasts, '+l);}
 ok(!/sharedNote\}/.test(app),'parents\' link: no "shared with you" line');
}
console.log(`coach-app: ${checks} checks passed`);
