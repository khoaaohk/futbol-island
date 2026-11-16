import {blockLengths,planRotation} from '../site/tools/rotation';
/**
 * The coach app's game engine (/coach, Nov 16 2026; docs/coach-app/HANDOFF.md). Pure functions only: no clock, no storage, no
 * network, no randomness (tests/coach-app.cjs checks that). The UI passes `now` (epoch ms) in, so the same game state gives the
 * same answer after a phone lock, a background tab or a reload.
 *
 *  - Presets: the US Youth game formats (lib/site/sizes.ts age chart: 4v4 4 x 10, 7v7 2 x 25, 9v9 2 x 30, 11v11 from 2 x 35)
 *    plus 5v5 and futsal (FIFA Futsal Laws: 2 x 20, flying substitutions).
 *  - The opening plan is the playing-time calculator's scheduler (lib/site/tools/rotation.ts planRotation), turned from player
 *    indexes into player ids and seconds. Positions follow the players: whoever comes on takes the spot of whoever went off.
 *  - Re-plan (injury, late arrival, leaving early, a skipped change): the rest of the game is cut into blocks again and each
 *    available player gets a target total so the final minutes are as level as the minutes already played allow
 *    (water filling), then every block takes the players with the most time still owed.
 *  - The clock is a sum of closed running spans plus the open one (`since`), so it is right after any pause, lock or reload.
 */
export type FormatId='4v4'|'5v5'|'7v7'|'9v9'|'11v11'|'futsal';
export type KeeperMode='fixed'|'rotate'|'none';
export type Preset={id:FormatId;ages:string;onField:number;keeper:boolean;periods:number;periodMin:number;subEvery:number;rolling:boolean};
export const PRESETS:readonly Preset[]=[
 {id:'4v4',ages:'U6–U8',onField:4,keeper:false,periods:4,periodMin:10,subEvery:5,rolling:false},
 {id:'5v5',ages:'U6–U8',onField:5,keeper:true,periods:4,periodMin:10,subEvery:5,rolling:false},
 {id:'7v7',ages:'U9–U10',onField:7,keeper:true,periods:2,periodMin:25,subEvery:5,rolling:false},
 {id:'9v9',ages:'U11–U12',onField:9,keeper:true,periods:2,periodMin:30,subEvery:10,rolling:false},
 {id:'11v11',ages:'U13+',onField:11,keeper:true,periods:2,periodMin:35,subEvery:10,rolling:false},
 {id:'futsal',ages:'',onField:5,keeper:true,periods:2,periodMin:20,subEvery:4,rolling:true},
];
export const presetOf=(id:unknown)=>PRESETS.find(p=>p.id===id)??PRESETS[2];
export type Settings={format:FormatId;onField:number;periods:number;periodMin:number;subEvery:number;keeper:KeeperMode;rolling:boolean;formation:string};
export const settingsFor=(p:Preset,formation=''):Settings=>({format:p.id,onField:p.onField,periods:p.periods,periodMin:p.periodMin,subEvery:p.subEvery,keeper:p.keeper?'rotate':'none',rolling:p.rolling,formation});
const int=(v:unknown,lo:number,hi:number,d:number)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):d;};
export function cleanSettings(s:Partial<Settings>|null|undefined):Settings{
 const p=presetOf(s?.format),o=s??{};
 const periodMin=int(o.periodMin,1,60,p.periodMin);
 const keeper:KeeperMode=!p.keeper?'none':o.keeper==='fixed'||o.keeper==='rotate'?o.keeper:'rotate';
 return {format:p.id,onField:int(o.onField,2,11,p.onField),periods:int(o.periods,1,4,p.periods),periodMin,subEvery:int(o.subEvery,1,periodMin,Math.min(p.subEvery,periodMin)),
  keeper,rolling:typeof o.rolling==='boolean'?o.rolling:p.rolling,formation:typeof o.formation==='string'?o.formation.slice(0,40).replace(/[^a-z0-9-]/g,''):''};
}
/* ---------------------------------------------------------------- the plan ---------------------------------------------- */
/** One stretch of a period with the same players on. Times are seconds from the start of that period. */
export type PBlock={period:number;start:number;end:number;on:string[];gk:string|null};
export type Plan={blocks:PBlock[];periods:number;periodSec:number;onField:number};
/** The opening plan. `order`: available player ids, the starting goalkeeper first, then the other starters, then the bench. */
export function buildPlan(order:readonly string[],s:Settings):Plan{
 const P=order.length,F=Math.min(s.onField,P),periodSec=s.periodMin*60;
 if(!P)return {blocks:[],periods:s.periods,periodSec,onField:F};
 const r=planRotation({players:P,onField:F,periods:s.periods,periodMin:s.periodMin,subEvery:s.subEvery,keeperRotates:s.keeper!=='fixed'});
 const blocks=r.blocks.map(b=>({period:b.period,start:b.start*60,end:b.end*60,on:b.on.map(i=>order[i]),gk:s.keeper==='none'?null:order[b.keeper]}));
 return {blocks:relabelStarters(blocks,order.slice(0,F)),periods:s.periods,periodSec,onField:F};
}
/** The scheduler picks its own starters; the coach's chosen starters (the lineup) swap identities with them for the whole game,
 *  which keeps every fairness promise (it is a renaming of players with the same role). */
function relabelStarters(blocks:PBlock[],starters:readonly string[]):PBlock[]{
 if(!blocks.length)return blocks;
 const first=blocks[0],t1=new Map<string,string>();
 /* the keeper keeps its own identity: starters[0] is the coach's keeper */
 if(first.gk&&starters[0]&&first.gk!==starters[0]){t1.set(first.gk,starters[0]);t1.set(starters[0],first.gk);}
 const r1=(p:string)=>t1.get(p)??p,want=new Set(starters),mapped=new Set(first.on.map(r1));
 const extra=[...mapped].filter(p=>!want.has(p)),missing=starters.filter(p=>!mapped.has(p)),t2=new Map<string,string>();
 extra.forEach((p,i)=>{const q=missing[i];if(q){t2.set(p,q);t2.set(q,p);}});
 const f=(p:string)=>{const a=r1(p);return t2.get(a)??a;};
 return blocks.map(b=>({...b,on:b.on.map(f),gk:b.gk==null?null:f(b.gk)}));
}
/** A change between two blocks: who goes off, who comes on, paired so the incoming player takes the outgoing player's spot. */
export type Change={out:string[];in:string[];gkFrom:string|null;gkTo:string|null};
export function changeBetween(prevOn:readonly string[],prevGk:string|null,b:PBlock):Change{
 const was=new Set(prevOn),now=new Set(b.on);
 return {out:prevOn.filter(p=>!now.has(p)),in:b.on.filter(p=>!was.has(p)),gkFrom:prevGk,gkTo:b.gk};
}
export const isChange=(c:Change)=>c.out.length>0||c.in.length>0||c.gkFrom!==c.gkTo;
/** Spots (index into the formation's spots; 0 is the goalkeeper's when there is one) after a change. */
export function nextSpots(prev:Readonly<Record<string,number>>,c:Change,on:readonly string[],nSpots:number,keeper:boolean):Record<string,number>{
 const spot:Record<string,number>={},taken=new Set<number>();
 if(keeper&&c.gkTo&&on.includes(c.gkTo)){spot[c.gkTo]=0;taken.add(0);}
 for(const p of on)if(spot[p]==null&&prev[p]!=null&&!taken.has(prev[p])&&!(keeper&&prev[p]===0)){spot[p]=prev[p];taken.add(prev[p]);}
 /* free spots: the ones the outgoing players left first (so the incoming player takes that place), then the rest */
 const free=[...c.out.map(p=>prev[p]).filter((x):x is number=>x!=null),...Array.from({length:nSpots},(_,i)=>i)];
 for(const p of on)if(spot[p]==null){const x=free.find(x=>!taken.has(x)&&!(keeper&&x===0));const s=x??nSpots+taken.size;spot[p]=s;taken.add(s);}
 return spot;
}
/** Planned seconds per player for a list of blocks. */
export function planSeconds(blocks:readonly PBlock[]):Record<string,number>{
 const m:Record<string,number>={};for(const b of blocks)for(const p of b.on)m[p]=(m[p]??0)+(b.end-b.start);return m;
}
/** Everyone's total and the spread among the players who rotate (a fixed keeper and anyone missing are left out). */
export function fairness(seconds:Readonly<Record<string,number>>,ids:readonly string[],skip:ReadonlySet<string>=new Set()){
 const vals=ids.filter(p=>!skip.has(p)).map(p=>seconds[p]??0);
 if(!vals.length)return {min:0,max:0,spread:0};
 const min=Math.min(...vals),max=Math.max(...vals);return {min,max,spread:max-min};
}
/* --------------------------------------------------------------- re-plan ----------------------------------------------- */
export type ReplanInput={
 settings:Settings;
 /** where the game is now: the current period and the second inside it */
 period:number;sec:number;periodSec:number;
 /** who can play from now on (not hurt, not gone, here) */
 available:readonly string[];
 /** who is on the field now (only those still available count) and the keeper */
 on:readonly string[];gk:string|null;
 /** seconds each player has played so far, and seconds in goal (rotation of the keeper) */
 played:Readonly<Record<string,number>>;kept?:Readonly<Record<string,number>>;
 /** the player to prefer in goal when a new keeper is needed (the Team screen's GK mark) */
 keepers?:readonly string[];
};
/** Seconds left in the game from (period, sec), cut into blocks: the rest of this period into equal pieces of about the change
 *  interval, then each later period like the opening plan. */
export function remainingBlocks(period:number,sec:number,s:Settings,periodSec:number):{period:number;start:number;end:number}[]{
 const out:{period:number;start:number;end:number}[]=[],step=s.subEvery*60;
 const left=periodSec-sec;
 if(left>0){const n=Math.max(1,Math.round(left/step)),base=Math.floor(left/n);let t=sec;for(let i=0;i<n;i++){const len=i===n-1?periodSec-t:base;out.push({period,start:t,end:t+len});t+=len;}}
 for(let p=period+1;p<s.periods;p++){let t=0;for(const m of blockLengths(s.periodMin,s.subEvery)){out.push({period:p,start:t,end:t+m*60});t+=m*60;}}
 return out;
}
/** The level L each player's final total should reach: sum over players of clamp(L - played, 0, cap) = field seconds left. */
function waterLevel(played:number[],cap:number,total:number):number{
 let lo=0,hi=Math.max(0,...played)+cap+1;
 for(let i=0;i<60;i++){const mid=(lo+hi)/2,sum=played.reduce((a,x)=>a+Math.max(0,Math.min(cap,mid-x)),0);if(sum<total)lo=mid;else hi=mid;}
 return hi;
}
export function replan(i:ReplanInput):PBlock[]{
 const s=i.settings,avail=[...i.available],segs=remainingBlocks(i.period,i.sec,s,i.periodSec);
 if(!segs.length||!avail.length)return [];
 const F=Math.min(s.onField,avail.length),keeperOn=s.keeper!=='none';
 const availSet=new Set(avail),kept={...(i.kept??{})};
 /* the keeper of every block: fixed = the current one for the rest of the game; rotate = the current one to the end of this
    period, then whoever has kept least (the coach's keepers first), one per period */
 const gkOf:(string|null)[]=segs.map(()=>null);
 if(keeperOn){
  const prefs=(i.keepers??[]).filter(p=>availSet.has(p)),prefSet=new Set(prefs);
  const rank=(p:string)=>prefSet.size&&!prefSet.has(p)?1:0;
  const cur=i.gk&&availSet.has(i.gk)?i.gk:[...avail].sort((a,b)=>rank(a)-rank(b)||(kept[a]??0)-(kept[b]??0)||avail.indexOf(a)-avail.indexOf(b))[0]??null;
  if(s.keeper==='fixed')segs.forEach((_,k)=>{gkOf[k]=cur;});
  else{const rota=prefs.length>=2?prefs:avail;let p=-1,who=cur;
   segs.forEach((g,k)=>{if(g.period!==p){if(p!==-1){const c=rota.filter(x=>x!==who);who=[...c].sort((a,b)=>(kept[a]??0)-(kept[b]??0)||rota.indexOf(a)-rota.indexOf(b))[0]??who;}p=g.period;}
    gkOf[k]=who;if(who)kept[who]=(kept[who]??0)+(g.end-g.start);});}
 }
 const total=segs.reduce((a,g)=>a+(g.end-g.start),0);
 /* a fixed keeper plays every block and is left out of the levelling, like the calculator */
 const fixedGk=s.keeper==='fixed'?gkOf[0]:null;
 const pool=avail.filter(p=>p!==fixedGk),places=fixedGk?F-1:F;
 const played=pool.map(p=>i.played[p]??0),L=waterLevel(played,total,total*places);
 const need:Record<string,number>={};pool.forEach((p,k)=>{need[p]=Math.max(0,Math.min(total,L-played[k]));});
 const out:PBlock[]=[];let prev=new Set(i.on.filter(p=>availSet.has(p)));
 let left=total;
 segs.forEach((g,k)=>{
  const len=g.end-g.start,gk=gkOf[k],chosen:string[]=[];
  if(gk&&availSet.has(gk))chosen.push(gk);
  const after=left-len;
  const cands=avail.filter(p=>!chosen.includes(p));
  /* one score per player (a comparator that mixes rules is not transitive and sorts badly): the time still owed, a small
     bonus for staying on (fewer changes), and first of all anyone who must play now or end up short */
  /* mid-period, the block running now keeps whoever is still on and only fills the empty places (one change for the coach,
     not a reshuffle); later blocks are free */
  const keepNow=k===0&&g.start===i.sec&&i.sec>0;
  const key=(p:string)=>{const n=need[p]??-1e9,must=n>after+0.5;return (must?1e7:keepNow&&prev.has(p)&&n>=len/2?5e6:0)+n+(prev.has(p)?len*0.4:0);};
  const score=new Map(cands.map(p=>[p,key(p)]));
  cands.sort((a,b)=>score.get(b)!-score.get(a)!||avail.indexOf(a)-avail.indexOf(b));
  for(const p of cands){if(chosen.length>=F)break;chosen.push(p);}
  for(const p of chosen)if(need[p]!=null)need[p]-=len;
  left=after;prev=new Set(chosen);
  out.push({period:g.period,start:g.start,end:g.end,on:chosen,gk:keeperOn?gk:null});
 });
 return out;
}
/* ---------------------------------------------------------------- the clock --------------------------------------------- */
export type ClockStatus='pre'|'live'|'paused'|'break'|'done';
/** acc: ms run so far in this period, since: epoch ms when the current run started (null when stopped), added: stoppage seconds */
export type Clock={period:number;acc:number;since:number|null;added:number;status:ClockStatus};
export const newClock=():Clock=>({period:0,acc:0,since:null,added:0,status:'pre'});
export const clockMs=(c:Clock,now:number)=>Math.max(0,c.acc+(c.since!=null?Math.max(0,now-c.since):0));
export const clockSec=(c:Clock,now:number)=>Math.floor(clockMs(c,now)/1000);
export const startPeriod=(c:Clock,now:number):Clock=>({...c,acc:0,since:now,added:0,status:'live'});
export const pauseClock=(c:Clock,now:number):Clock=>c.since==null?c:{...c,acc:clockMs(c,now),since:null,status:'paused'};
export const resumeClock=(c:Clock,now:number):Clock=>c.since!=null?c:{...c,since:now,status:'live'};
export const addStoppage=(c:Clock,sec=60):Clock=>({...c,added:Math.min(30*60,c.added+sec)});
/** End the period: the clock stops at what it showed; the next period waits for its kick-off (or the game is over). */
export const endPeriod=(c:Clock,now:number,periods:number):Clock=>{const ms=clockMs(c,now);return c.period+1>=periods?{...c,acc:ms,since:null,status:'done'}:{period:c.period+1,acc:0,since:null,added:0,status:'break'};};
export const fmtClock=(sec:number)=>{const s=Math.max(0,Math.floor(sec));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
/* -------------------------------------------------------------- the live game ------------------------------------------- */
export type Stint={p:string;period:number;from:number;to:number|null;gk?:boolean};
export type Status='ok'|'hurt'|'left'|'late';
export type Game={
 v:1;started:number;settings:Settings;clock:Clock;
 blocks:PBlock[];/* the plan for the whole game: past blocks as played, future blocks as planned */
 next:number;/* index of the block whose start is the next change to make (blocks before it are done or skipped) */
 delay:number;/* seconds the next change has been put back */
 on:string[];gk:string|null;spots:Record<string,number>;
 stints:Stint[];status:Record<string,Status>;
 subs:number;/* changes confirmed */
};
export function newGame(plan:Plan,s:Settings,spots:Record<string,number>,status:Record<string,Status>,now:number):Game{
 const b=plan.blocks[0];
 return {v:1,started:now,settings:s,clock:newClock(),blocks:plan.blocks,next:1,delay:0,on:b?[...b.on]:[],gk:b?.gk??null,spots:{...spots},stints:[],status:{...status},subs:0};
}
export const periodSecOf=(g:Game)=>g.settings.periodMin*60;
export const nowSec=(g:Game,now:number)=>clockSec(g.clock,now);
/** Seconds played (and kept in goal) per player, open stints counted to `sec`. */
export function playedSeconds(g:Game,sec:number):{played:Record<string,number>;kept:Record<string,number>}{
 const played:Record<string,number>={},kept:Record<string,number>={};
 for(const st of g.stints){const to=st.to??(st.period===g.clock.period?sec:st.from);const d=Math.max(0,to-st.from);played[st.p]=(played[st.p]??0)+d;if(st.gk)kept[st.p]=(kept[st.p]??0)+d;}
 return {played,kept};
}
const openStints=(g:Game,ps:readonly string[],sec:number,gk:string|null):Stint[]=>ps.map(p=>({p,period:g.clock.period,from:sec,to:null,gk:p===gk}));
const closeStints=(st:Stint[],ps:ReadonlySet<string>,sec:number)=>st.map(x=>x.to==null&&ps.has(x.p)?{...x,to:Math.max(x.from,sec)}:x);
/** Kick off the current period (first half, or after the break). */
export function kickOff(g:Game,now:number):Game{
 const clock=startPeriod(g.clock,now);
 return {...g,clock,stints:[...g.stints,...openStints({...g,clock},g.on,0,g.gk)]};
}
export function endCurrentPeriod(g:Game,now:number):Game{
 const sec=nowSec(g,now),stints=closeStints(g.stints,new Set(g.on),sec),clock=endPeriod(g.clock,now,g.settings.periods);
 /* the next change is the first block of the new period (made during the break) */
 let next=g.next;while(next<g.blocks.length&&g.blocks[next].period<clock.period)next++;
 if(clock.status==='done')next=g.blocks.length;
 return {...g,clock,stints,next,delay:0};
}
/** The next planned change: the block it leads to, the change, and when it is due (seconds into the period; null = at kick-off). */
export function nextChange(g:Game):{index:number;block:PBlock;change:Change;due:number|null}|null{
 if(g.clock.status==='done')return null;
 for(let k=g.next;k<g.blocks.length;k++){const b=g.blocks[k];if(b.period!==g.clock.period)return null;
  const c=changeBetween(g.on,g.gk,{...b,on:b.on.filter(p=>(g.status[p]??'ok')==='ok')});
  if(isChange(c))return {index:k,block:b,change:c,due:b.start===0?null:b.start+(k===g.next?g.delay:0)};}
 return null;
}
const nSpotsOf=(g:Game)=>g.settings.onField;
/** Make a change now (the coach pressed Done). */
export function applyChange(g:Game,now:number,c:Change,index:number):Game{
 const sec=g.clock.status==='live'||g.clock.status==='paused'?nowSec(g,now):0,inPlay=g.clock.status==='live'||g.clock.status==='paused';
 const outSet=new Set(c.out);let on=g.on.filter(p=>!outSet.has(p));for(const p of c.in)if(!on.includes(p))on.push(p);
 const gk=c.gkTo&&on.includes(c.gkTo)?c.gkTo:g.settings.keeper==='none'?null:g.gk&&on.includes(g.gk)?g.gk:null;
 let stints=g.stints;
 if(inPlay){const ch=new Set([...c.out,...(gk!==g.gk?[g.gk,gk].filter(Boolean) as string[]:[])]);stints=closeStints(stints,ch,sec);
  const reopen=[...c.in,...(gk!==g.gk?[g.gk,gk].filter((p):p is string=>!!p&&on.includes(p)&&!c.in.includes(p)):[])];stints=[...stints,...openStints(g,reopen,sec,gk)];}
 const spots=nextSpots(g.spots,{...c,gkTo:gk},on,nSpotsOf(g),g.settings.keeper!=='none');
 return {...g,on,gk,spots,stints,next:index+1,delay:0,subs:g.subs+1};
}
export const delayChange=(g:Game,sec=60):Game=>({...g,delay:g.delay+sec});
/** Mark a player and re-plan the rest of the game. A player on the field who is hurt or leaves comes off now and the most-owed
 *  bench player takes the spot at once (shown with an Undo). */
export function setStatus(g:Game,now:number,p:string,st:Status,keepers:readonly string[]=[]):Game{
 const status={...g.status,[p]:st};let x:Game={...g,status};
 if(st!=='ok'&&g.on.includes(p)){
  const sec=g.clock.status==='live'||g.clock.status==='paused'?nowSec(g,now):0;
  const rest=replanFrom({...x,on:g.on},now,keepers,sec);
  const repl=rest[0]?.on.find(q=>!g.on.includes(q))??null;
  const c:Change={out:[p],in:repl?[repl]:[],gkFrom:g.gk,gkTo:g.gk===p?rest[0]?.gk??null:g.gk};
  x=applyChange(x,now,c,x.next-1);x={...x,subs:g.subs};
 }
 return withReplan(x,now,keepers);
}
/** Skip the next change and re-plan, so the minutes still come out level. */
export function skipChange(g:Game,now:number,keepers:readonly string[]=[]):Game{
 const n=nextChange(g);if(!n)return g;
 return withReplan({...g,next:n.index+1,delay:0},now,keepers);
}
function replanFrom(g:Game,now:number,keepers:readonly string[],secIn?:number):PBlock[]{
 const s=g.settings,live=g.clock.status==='live'||g.clock.status==='paused';
 const sec=secIn??(live?nowSec(g,now):0);
 const {played,kept}=playedSeconds(g,sec);
 const available=Object.keys(g.status).filter(p=>(g.status[p]??'ok')==='ok');
 const period=g.clock.status==='done'?s.periods:g.clock.period;
 return replan({settings:s,period,sec,periodSec:periodSecOf(g),available,on:g.on.filter(p=>available.includes(p)),gk:g.gk,played,kept,keepers});
}
export function withReplan(g:Game,now:number,keepers:readonly string[]=[]):Game{
 const sec=g.clock.status==='live'||g.clock.status==='paused'?nowSec(g,now):0;
 const rest=replanFrom(g,now,keepers,sec);
 /* past blocks stay as the record; the block running now is cut at `sec` */
 const past=g.blocks.filter(b=>b.period<g.clock.period||(b.period===g.clock.period&&b.start<sec)).map(b=>b.period===g.clock.period&&b.end>sec?{...b,end:sec}:b);
 /* the first re-planned block starts now with the players on now (it is the current block); later ones are the changes */
 const blocks=[...past,...rest];
 return {...g,blocks,next:past.length,delay:0};
}
/** A step back: the UI keeps the last states (each action pushes one). */
export const MAX_UNDO=30;
export const pushUndo=(stack:readonly Game[],g:Game)=>[...stack.slice(-(MAX_UNDO-1)),g];
/** Minutes per player for the summary: actual stints, plus the plan for whatever is still to come. */
export function summarySeconds(g:Game,now:number):Record<string,number>{
 const st=g.clock.status,inPlay=st==='live'||st==='paused',sec=inPlay?nowSec(g,now):0,{played}=playedSeconds(g,sec);
 if(st==='done')return played;
 for(const b of g.blocks){if(b.period<g.clock.period)continue;
  const from=b.period===g.clock.period&&inPlay?Math.max(b.start,sec):b.start,d=b.end-from;if(d<=0)continue;
  for(const p of b.on)if((g.status[p]??'ok')==='ok')played[p]=(played[p]??0)+d;}
 return played;
}
