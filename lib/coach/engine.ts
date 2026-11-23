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
/** maxSwaps (UX audit C14): the most players changed at one stoppage (0 = no limit; rolling subs have none) */
export type Settings={format:FormatId;onField:number;periods:number;periodMin:number;subEvery:number;keeper:KeeperMode;rolling:boolean;formation:string;maxSwaps:number};
export const MAX_SWAPS=3;
export const settingsFor=(p:Preset,formation=''):Settings=>({format:p.id,onField:p.onField,periods:p.periods,periodMin:p.periodMin,subEvery:p.subEvery,keeper:p.keeper?'rotate':'none',rolling:p.rolling,formation,maxSwaps:MAX_SWAPS});
const int=(v:unknown,lo:number,hi:number,d:number)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):d;};
export function cleanSettings(s:Partial<Settings>|null|undefined):Settings{
 const p=presetOf(s?.format),o=s??{};
 const periodMin=int(o.periodMin,1,60,p.periodMin);
 const keeper:KeeperMode=!p.keeper?'none':o.keeper==='fixed'||o.keeper==='rotate'?o.keeper:'rotate';
 return {format:p.id,onField:int(o.onField,2,11,p.onField),periods:int(o.periods,1,4,p.periods),periodMin,subEvery:int(o.subEvery,1,periodMin,Math.min(p.subEvery,periodMin)),
  keeper,rolling:typeof o.rolling==='boolean'?o.rolling:p.rolling,formation:typeof o.formation==='string'?o.formation.slice(0,40).replace(/[^a-z0-9-]/g,''):'',maxSwaps:int(o.maxSwaps,0,11,MAX_SWAPS)};
}
/* ---------------------------------------------------------------- the plan ---------------------------------------------- */
/** One stretch of a period with the same players on. Times are seconds from the start of that period. */
export type PBlock={period:number;start:number;end:number;on:string[];gk:string|null};
export type Plan={blocks:PBlock[];periods:number;periodSec:number;onField:number};
/** The opening plan. `order`: available player ids, the starting goalkeeper first, then the other starters, then the bench. */
export function buildPlan(order:readonly string[],s:Settings,keepers:readonly string[]=[]):Plan{
 const P=order.length,F=Math.min(s.onField,P),periodSec=s.periodMin*60;
 if(!P)return {blocks:[],periods:s.periods,periodSec,onField:F};
 const r=planRotation({players:P,onField:F,periods:s.periods,periodMin:s.periodMin,subEvery:s.subEvery,keeperRotates:s.keeper!=='fixed'});
 const raw=r.blocks.map(b=>({period:b.period,start:b.start*60,end:b.end*60,on:b.on.map(i=>order[i]),gk:s.keeper==='none'?null:order[b.keeper]}));
 const blocks=relabelStarters(raw,order.slice(0,F));
 /* UX audit B2: with a rotating keeper, only players marked "Can keep goal" go in goal (the coach's own starting keeper keeps
    the first period); C14: at a stoppage no more than maxSwaps players change. When the calculator's plan breaks either, the
    plan is made by the levelling planner from kick-off instead (the coach's starters start, the same totals) */
 const K=s.keeper==='rotate'?keepers.filter(p=>order.includes(p)):[];
 const badGk=K.length>0&&blocks.some(b=>b.gk!=null&&!K.includes(b.gk)&&!(b.period===0&&b.gk===order[0]));
 const cap=!s.rolling&&s.maxSwaps>0?s.maxSwaps:0;
 const badSw=cap>0&&blocks.some((b,k)=>k>0&&b.start>0&&b.on.filter(p=>!blocks[k-1].on.includes(p)).length>cap);
 if(badGk||badSw)return {blocks:replan({settings:s,period:0,sec:0,periodSec,available:order,on:order.slice(0,F),gk:s.keeper==='none'?null:order[0],played:{},kept:{},keepers:K,holdOn:true,keepGk:true}),periods:s.periods,periodSec,onField:F};
 return {blocks,periods:s.periods,periodSec,onField:F};
}
/** The one keeper of a whole plan (a fixed keeper, or the only player marked "Can keep goal"): left out of the fairness spread. */
export const soleKeeper=(blocks:readonly PBlock[]):string|null=>{const k=blocks[0]?.gk??null;return k&&blocks.every(b=>b.gk===k)?k:null;};
/** The plan with players coming late: the players here at kick-off play the opening plan, and each late player with an expected
 *  minute joins then, exactly as the live game re-plans when the coach taps "Arrived" (so the plan shown before the game is the
 *  one the live game will follow). `late`: player id -> expected minute of the game, counted from kick-off across periods (null
 *  = not known: that player is left out until they come). `order` as in buildPlan, late players anywhere in it. */
export function planWithLate(order:readonly string[],s:Settings,late:Readonly<Record<string,number|null>>,keepers:readonly string[]=[]):Plan{
 const periodSec=s.periodMin*60,game=s.periods*periodSec,isLate=(p:string)=>p in late&&!(late[p]===0);
 const start=order.filter(p=>!isLate(p));let plan=buildPlan(start,s,keepers);
 const arr=order.filter(p=>isLate(p)&&late[p]!=null&&late[p]!*60<game).map(p=>({p,t:Math.round(late[p]!*60)})).sort((a,b)=>a.t-b.t);
 const avail=[...start];
 for(const {p,t} of arr){
  avail.push(p);
  if(!plan.blocks.length){plan=buildPlan(avail,s,keepers);continue;}
  const period=Math.min(s.periods-1,Math.floor(t/periodSec)),sec=t-period*periodSec;
  const past=plan.blocks.filter(b=>b.period<period||(b.period===period&&b.start<sec)).map(b=>b.period===period&&b.end>sec?{...b,end:sec}:b);
  /* who is on at that moment: a change due then is made first (as on the live screen, where it is confirmed at its time) */
  const cur=plan.blocks.find(b=>b.period===period&&b.start<=sec&&sec<b.end)??past[past.length-1]??plan.blocks[0],played:Record<string,number>={},kept:Record<string,number>={};
  for(const b of past)for(const q of b.on){played[q]=(played[q]??0)+b.end-b.start;if(q===b.gk)kept[q]=(kept[q]??0)+b.end-b.start;}
  const rest=replan({settings:s,period,sec,periodSec,available:avail,on:cur.on,gk:cur.gk,played,kept,keepers});
  plan={...plan,blocks:[...past,...rest],onField:Math.min(s.onField,avail.length)};
 }
 return plan;
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
 /** hold the players on now for the first block (a skipped change keeps them to the next planned change: UX audit C4) */
 holdOn?:boolean;holdTo?:number;
 /** the keeper on now keeps this whole period even at its start (the opening plan: the coach's own keeper) */
 keepGk?:boolean;
 /** the block running now is planned afresh too ("Replan from now"), not kept as it is */
 swapNow?:boolean;
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
 const s=i.settings,avail=[...i.available];
 const hT=i.holdOn&&i.holdTo!=null&&i.holdTo>i.sec?Math.min(i.holdTo,i.periodSec):null;
 const segs=hT!=null?[{period:i.period,start:i.sec,end:hT},...remainingBlocks(i.period,hT,s,i.periodSec)]:remainingBlocks(i.period,i.sec,s,i.periodSec);
 if(!segs.length||!avail.length)return [];
 const F=Math.min(s.onField,avail.length),keeperOn=s.keeper!=='none';
 const availSet=new Set(avail),kept={...(i.kept??{})};
 /* the keeper of every block: fixed = the current one for the rest of the game; rotate = the current one to the end of this
    period, then whoever has kept least (the coach's keepers first), one per period */
 const gkOf:(string|null)[]=segs.map(()=>null);
 if(keeperOn){
  const prefs=(i.keepers??[]).filter(p=>availSet.has(p)),prefSet=new Set(prefs);
  const rank=(p:string)=>prefSet.size&&!prefSet.has(p)?1:0;
  /* UX audit B2: a keeper who is not marked stays only mid-period (no sudden swap) or when the coach picked them to start */
  const curOk=!!i.gk&&availSet.has(i.gk)&&(!prefSet.size||prefSet.has(i.gk)||i.sec>0||!!i.keepGk);
  const cur=curOk?i.gk:[...avail].sort((a,b)=>rank(a)-rank(b)||(kept[a]??0)-(kept[b]??0)||avail.indexOf(a)-avail.indexOf(b))[0]??null;
  if(s.keeper==='fixed')segs.forEach((_,k)=>{gkOf[k]=cur;});
  else{/* later periods, one keeper each, chosen with a look ahead at the time each player is still owed: someone who has not
     kept yet; then whoever is owed at least the period in goal and whose field time left over fits whole changes best (a
     whole period in goal is a big block, and the rest of their time comes in blocks of about the change interval); then the
     most owed */
   const rota=prefs.length>=1?prefs:avail,F0=Math.min(s.onField,avail.length),blk=Math.max(60,s.subEvery*60);
   const all=segs.reduce((a,g)=>a+(g.end-g.start),0),L0=waterLevel(avail.map(p=>i.played[p]??0),all,all*F0);
   const owed:Record<string,number>={};for(const p of avail)owed[p]=L0-(i.played[p]??0);
   const fit=(p:string,len:number)=>{const r=owed[p]-len;if(r<-blk/2)return 1e6-r;const m=((r%blk)+blk)%blk;return Math.min(m,blk-m);};
   /* at the start of a period (half-time) a keeper who has kept already hands over, so the rotation goes on after a re-plan */
   const fresh=i.sec===0&&!i.keepGk&&!!cur&&(kept[cur]??0)>0;
   let p=fresh?-2:-1,who=cur;
   segs.forEach((g,k)=>{if(g.period!==p){if(p!==-1){const c=rota.filter(x=>x!==who),plen=segs.filter(x=>x.period===g.period).reduce((a,x)=>a+x.end-x.start,0);
     const sc=new Map(c.map(x=>[x,((kept[x]??0)>0?1e9:0)+fit(x,plen)-owed[x]*0.3]));
     who=[...c].sort((a,b)=>sc.get(a)!-sc.get(b)!||rota.indexOf(a)-rota.indexOf(b))[0]??who;}p=g.period;}
    gkOf[k]=who;if(who){kept[who]=(kept[who]??0)+(g.end-g.start);owed[who]-=g.end-g.start;}});}
 }
 const total=segs.reduce((a,g)=>a+(g.end-g.start),0);
 /* a fixed keeper plays every block and is left out of the levelling, like the calculator */
 const fixedGk=s.keeper==='fixed'?gkOf[0]:null;
 const pool=avail.filter(p=>p!==fixedGk),places=fixedGk?F-1:F;
 const played=pool.map(p=>i.played[p]??0),L=waterLevel(played,total,total*places);
 const need:Record<string,number>={};pool.forEach((p,k)=>{need[p]=Math.max(0,Math.min(total,L-played[k]));});
 /* a rotating keeper's blocks in goal are set already: they come out of that player's time owed first, so the other
    blocks go to everyone else */
 const ahead:Record<string,number>={};
 if(!fixedGk)segs.forEach((g,k)=>{const p=gkOf[k];if(p&&need[p]!=null){need[p]-=g.end-g.start;ahead[p]=(ahead[p]??0)+g.end-g.start;}});
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
  const keepNow=k===0&&g.start===i.sec&&i.sec>0&&!i.swapNow;
  /* among the players who must play now, the least slack first (field time owed beyond the field time this player has left after
     this block: a keeper-to-be has less, their blocks in goal are taken), so a keeper-to-be is not benched until it is too late */
  const key=(p:string)=>{const n=need[p]??-1e9,a=ahead[p]??0,over=n-(after-a);const stay=prev.has(p)?len*0.4:0;return over>(a>0?len/2:0.5)?1e7+over*10+stay:(keepNow&&prev.has(p)&&n>=len/2?5e6:0)+n+stay;};
  const score=new Map(cands.map(p=>[p,key(p)]));
  cands.sort((a,b)=>score.get(b)!-score.get(a)!||avail.indexOf(a)-avail.indexOf(b));
  if(k===0&&i.holdOn)for(const p of i.on)if(availSet.has(p)&&chosen.length<F&&!chosen.includes(p))chosen.push(p);
  /* C14: at a stoppage, at most maxSwaps players come on at once (whoever is owed least stays on instead) */
  const cap=!s.rolling&&s.maxSwaps>0&&g.start>0?s.maxSwaps:1e9;let ins=chosen.filter(p=>!prev.has(p)).length;
  for(const p of cands){if(chosen.length>=F)break;if(chosen.includes(p))continue;if(!prev.has(p)){if(ins>=cap)continue;ins++;}chosen.push(p);}
  for(const p of cands){if(chosen.length>=F)break;if(!chosen.includes(p))chosen.push(p);}
  for(const p of chosen)if(need[p]!=null){if(p===gk&&!fixedGk)ahead[p]-=len;else need[p]-=len;}
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
 joined?:string[];/* players who came late (marked late, then arrived): left out of the fairness spread, like the calculator */
 info?:MatchInfo;/* the game's details (UX audit C17), copied from the team's next game at the start */
 score?:Score;
};
/** The game's details: opponent, date (YYYY-MM-DD), kick-off (HH:MM), home or away ('' = not set). */
export type MatchInfo={opp:string;date:string;time:string;home:''|'home'|'away'};
export const emptyMatch=():MatchInfo=>({opp:'',date:'',time:'',home:''});
/** The score: our goals, each with its scorer's id ('' = not recorded), and theirs. */
export type Score={goals:string[];them:number};
export const scoreOf=(g:Pick<Game,'score'>)=>({us:g.score?.goals.length??0,them:g.score?.them??0});
export const addGoal=(g:Game,scorer=''):Game=>({...g,score:{goals:[...(g.score?.goals??[]),scorer].slice(0,99),them:g.score?.them??0}});
export const setScorer=(g:Game,i:number,scorer:string):Game=>g.score&&i>=0&&i<g.score.goals.length?{...g,score:{...g.score,goals:g.score.goals.map((x,k)=>k===i?scorer:x)}}:g;
export const removeGoal=(g:Game):Game=>({...g,score:{goals:(g.score?.goals??[]).slice(0,-1),them:g.score?.them??0}});
export const theirGoal=(g:Game,d:1|-1):Game=>({...g,score:{goals:g.score?.goals??[],them:Math.max(0,Math.min(99,(g.score?.them??0)+d))}});
export function newGame(plan:Plan,s:Settings,spots:Record<string,number>,status:Record<string,Status>,now:number,info?:MatchInfo):Game{
 const b=plan.blocks[0];
 return {v:1,started:now,settings:s,clock:newClock(),blocks:plan.blocks,next:1,delay:0,on:b?[...b.on]:[],gk:b?.gk??null,spots:{...spots},stints:[],status:{...status},subs:0,
  ...(info?{info:{...info}}:{}),score:{goals:[],them:0}};
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
export function endCurrentPeriod(g:Game,now:number,keepers:readonly string[]=[]):Game{
 const sec=nowSec(g,now),stints=closeStints(g.stints,new Set(g.on),sec),clock=endPeriod(g.clock,now,g.settings.periods);
 /* the next change is the first block of the new period (made during the break) */
 let next=g.next;while(next<g.blocks.length&&g.blocks[next].period<clock.period)next++;
 if(clock.status==='done')next=g.blocks.length;
 const x={...g,clock,stints,next,delay:0};
 /* UX audit B3: at half-time, when the minutes played are off the plan by half a minute or more (a missed or late change, stoppage
    time, an early whistle), the rest of the game is re-levelled from what was really played */
 if(clock.status==='break'&&driftSec(x,g.clock.period)>=30)return withReplan(x,now,keepers);
 return x;
}
/** The largest gap, in seconds, between the minutes played and the minutes planned up to the end of `period`. */
export function driftSec(g:Game,period:number):number{
 const plan=planSeconds(g.blocks.filter(b=>b.period<=period)),{played}=playedSeconds({...g,clock:{...g.clock,period:period+1}},0);
 let worst=0;for(const p of new Set([...Object.keys(plan),...Object.keys(played)]))worst=Math.max(worst,Math.abs((plan[p]??0)-(played[p]??0)));
 return worst;
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
/** The coach pressed Done. A change made half a minute or more away from its planned time (waiting for a stoppage) re-levels
 *  the rest of the game, so the minutes lost or gained do not pile up on the same players. */
export function confirmChange(g:Game,now:number,c:Change,index:number,keepers:readonly string[]=[]):Game{
 const x=applyChange(g,now,c,index),b=g.blocks[index],inPlay=g.clock.status==='live'||g.clock.status==='paused';
 if(!inPlay||!b||b.period!==g.clock.period||Math.abs(nowSec(g,now)-b.start)<30)return x;
 return withReplan(x,now,keepers);
}
export const delayChange=(g:Game,sec=60):Game=>({...g,delay:g.delay+sec});
/** Mark a player and re-plan the rest of the game. A player on the field who is hurt or leaves comes off now and the most-owed
 *  bench player takes the spot at once (shown with an Undo). */
export function setStatus(g:Game,now:number,p:string,st:Status,keepers:readonly string[]=[]):Game{
 const status={...g.status,[p]:st};
 const joined=g.status[p]==='late'&&st==='ok'&&!(g.joined??[]).includes(p)?[...(g.joined??[]),p]:g.joined;
 let x:Game={...g,status,...(joined?{joined}:{})};
 if(st!=='ok'&&g.on.includes(p)){
  const sec=g.clock.status==='live'||g.clock.status==='paused'?nowSec(g,now):0;
  const rest=replanFrom({...x,on:g.on},now,keepers,sec);
  const repl=rest[0]?.on.find(q=>!g.on.includes(q))??null;
  const c:Change={out:[p],in:repl?[repl]:[],gkFrom:g.gk,gkTo:g.gk===p?rest[0]?.gk??null:g.gk};
  x=applyChange(x,now,c,x.next-1);x={...x,subs:g.subs};
 }
 return withReplan(x,now,keepers);
}
/** Skip the next change and re-plan, so the minutes still come out level. The players on now stay on until the next planned
 *  change (UX audit C4: never an instant new "Change now"); then the re-levelled changes follow. */
export function skipChange(g:Game,now:number,keepers:readonly string[]=[]):Game{
 const n=nextChange(g);if(!n)return g;
 const inPlay=g.clock.status==='live'||g.clock.status==='paused',sec=inPlay?nowSec(g,now):0,ps=periodSecOf(g),nb=g.blocks[n.index+1];
 const to=nb&&nb.period===g.clock.period?nb.start:ps,holdTo=to>sec+30?to:Math.min(ps,sec+g.settings.subEvery*60);
 return withReplan({...g,next:n.index+1,delay:0},now,keepers,{holdTo});
}
/** "Replan from now" (UX audit B3): a change missed for a while is replaced by a fresh one from the minutes really played. */
export const replanNow=(g:Game,now:number,keepers:readonly string[]=[]):Game=>withReplan({...g,delay:0},now,keepers,{swapNow:true});
/** The live screen's alerts (UX audit B3): once when a change is due, once more (gently) when it is OVERDUE_SEC late, once when
 *  the period's time is up. '' = nothing to alert. */
export const OVERDUE_SEC=120;
export function alertKey(g:Game,now:number):string{
 const st=g.clock.status;if(st!=='live')return '';
 const sec=nowSec(g,now),nc=nextChange(g),d=nc&&nc.due!=null?nc.due-sec:null;
 if(sec>=g.settings.periodMin*60+g.clock.added)return `u${g.clock.period}:${g.clock.added}`;
 if(d==null||d>0)return '';
 return d<=-OVERDUE_SEC?`c${nc!.index}:${g.delay}:late`:`c${nc!.index}:${g.delay}`;
}
/** UX audit B4: one tap on Done makes one change; a second tap within this time is ignored. */
export const TAP_GUARD_MS=1500;
export const tapOk=(last:number,now:number)=>now-last>=TAP_GUARD_MS;
type ReOpt={holdTo?:number;swapNow?:boolean};
function replanFrom(g:Game,now:number,keepers:readonly string[],secIn?:number,o:ReOpt={}):PBlock[]{
 const s=g.settings,live=g.clock.status==='live'||g.clock.status==='paused';
 const sec=secIn??(live?nowSec(g,now):0);
 const {played,kept}=playedSeconds(g,sec);
 const available=Object.keys(g.status).filter(p=>(g.status[p]??'ok')==='ok');
 const period=g.clock.status==='done'?s.periods:g.clock.period;
 return replan({settings:s,period,sec,periodSec:periodSecOf(g),available,on:g.on.filter(p=>available.includes(p)),gk:g.gk,played,kept,keepers,...(o.holdTo!=null?{holdOn:true,holdTo:o.holdTo}:{}),...(o.swapNow?{swapNow:true}:{})});
}
export function withReplan(g:Game,now:number,keepers:readonly string[]=[],o:ReOpt={}):Game{
 const sec=g.clock.status==='live'||g.clock.status==='paused'?nowSec(g,now):0;
 const rest=replanFrom(g,now,keepers,sec,o);
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
