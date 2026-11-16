/**
 * Scan Trainer (/scan, Nov 16 2026; docs/scan-trainer/HANDOFF.md): the pure engine. A phone propped on a cone shows one big cue
 * (a colour, a number, an arrow, or "pass it": a teammate's number and where they are); the player looks over the shoulder,
 * calls it out, and plays. Everything here is pure: no clock, no randomness of its own (the caller passes `rand` and `now`),
 * no browser. tests/scan-trainer.cjs checks it.
 */
export type Mode='colours'|'numbers'|'arrows'|'mix'|'pass';
export const MODES:readonly Mode[]=['colours','numbers','arrows','mix','pass'];
export type Dir='up'|'upRight'|'right'|'downRight'|'down'|'downLeft'|'left'|'upLeft';
/** Clockwise from up; the angle the arrow is drawn at. */
export const DIRS:readonly Dir[]=['up','upRight','right','downRight','down','downLeft','left','upLeft'];
export const DIR_ANGLE:Record<Dir,number>={up:0,upRight:45,right:90,downRight:135,down:180,downLeft:225,left:270,upLeft:315};
/** Cone and bib colours a coach is likely to own. `ink` is the text colour that reads on the colour (contrast checked in the test). */
export type ColourId='red'|'orange'|'yellow'|'green'|'blue'|'purple'|'pink'|'white'|'black';
export const COLOURS:Readonly<Record<ColourId,{hex:string;ink:string}>>={
 red:{hex:'#d7262e',ink:'#ffffff'},orange:{hex:'#f07a12',ink:'#14221d'},yellow:{hex:'#ffd21f',ink:'#14221d'},green:{hex:'#1f9a4a',ink:'#ffffff'},
 blue:{hex:'#1f5fd1',ink:'#ffffff'},purple:{hex:'#7a3db8',ink:'#ffffff'},pink:{hex:'#f27cb4',ink:'#14221d'},white:{hex:'#ffffff',ink:'#14221d'},black:{hex:'#111111',ink:'#ffffff'}};
export const COLOUR_IDS=Object.keys(COLOURS) as ColourId[];
export type Range='1-9'|'1-20'|'0-99';
export const RANGES:Readonly<Record<Range,[number,number]>>={'1-9':[1,9],'1-20':[1,20],'0-99':[0,99]};
export type SessionLen=60|90|180|0;/* 0 = endless */
export const SESSIONS:readonly SessionLen[]=[60,90,180,0];
export type Sound='off'|'tick'|'pop'|'bell';
export const SOUNDS:readonly Sound[]=['off','tick','pop','bell'];
export type AgeId='u8'|'u10'|'u12'|'u14'|'adult';
export const AGES:readonly AgeId[]=['u8','u10','u12','u14','adult'];
export type Settings={mode:Mode;interval:number;colours:ColourId[];range:Range;dirs:Dir[];teammates:number;bg:boolean;names:boolean;session:SessionLen;sound:Sound;score:boolean;age:AgeId|null};
export const MIN_INTERVAL=1,MAX_INTERVAL=6,MIN_TEAMMATES=2,MAX_TEAMMATES=8;
export const DEFAULTS:Settings={mode:'colours',interval:3,colours:['red','blue','yellow','green'],range:'1-9',dirs:['up','right','down','left'],teammates:4,bg:true,names:true,session:90,sound:'tick',score:false,age:'u10'};
/**
 * Age presets: speed and cue type. Younger players get slower changes and the simplest cue (a colour), older ones get faster
 * changes and cues that need a decision (a number to add, an arrow to turn to, a pass). The coach's colours are never changed.
 */
export const PRESETS:Readonly<Record<AgeId,Pick<Settings,'mode'|'interval'|'range'|'dirs'|'session'>>>={
 u8:{mode:'colours',interval:3.5,range:'1-9',dirs:['left','right'],session:60},
 u10:{mode:'colours',interval:3,range:'1-9',dirs:['up','right','down','left'],session:90},
 u12:{mode:'mix',interval:2.5,range:'1-9',dirs:['up','right','down','left'],session:90},
 u14:{mode:'pass',interval:2,range:'1-20',dirs:['up','right','down','left'],session:180},
 adult:{mode:'mix',interval:1.5,range:'0-99',dirs:[...DIRS],session:180},
};
export const applyPreset=(s:Settings,age:AgeId):Settings=>({...s,...PRESETS[age],dirs:[...PRESETS[age].dirs],age});
const isObj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const pick=<T extends string>(v:unknown,all:readonly T[],d:T):T=>typeof v==='string'&&(all as readonly string[]).includes(v)?v as T:d;
/** Unique allowed values in canonical order, or the default when fewer than two are left (one choice is not a cue). */
function subset<T extends string>(v:unknown,all:readonly T[],d:readonly T[]):T[]{
 const set=new Set(Array.isArray(v)?v.filter((x):x is T=>typeof x==='string'&&(all as readonly string[]).includes(x)):[]);
 const out=all.filter(x=>set.has(x));return out.length>=2?out:[...d];
}
/** Half-second steps between 1 and 6 s. */
export const cleanInterval=(v:unknown)=>{const n=typeof v==='number'&&Number.isFinite(v)?v:DEFAULTS.interval;return Math.min(MAX_INTERVAL,Math.max(MIN_INTERVAL,Math.round(n*2)/2));};
export function cleanSettings(raw:unknown):Settings{
 const r=isObj(raw)?raw:{};const d=DEFAULTS;
 const tm=typeof r.teammates==='number'&&Number.isFinite(r.teammates)?Math.round(r.teammates):d.teammates;
 return {mode:pick(r.mode,MODES,d.mode),interval:cleanInterval(r.interval),colours:subset(r.colours,COLOUR_IDS,d.colours),range:pick(r.range,Object.keys(RANGES) as Range[],d.range),
  dirs:subset(r.dirs,DIRS,d.dirs),teammates:Math.min(MAX_TEAMMATES,Math.max(MIN_TEAMMATES,tm)),bg:typeof r.bg==='boolean'?r.bg:d.bg,names:typeof r.names==='boolean'?r.names:d.names,
  session:(SESSIONS as readonly unknown[]).includes(r.session)?r.session as SessionLen:d.session,sound:pick(r.sound,SOUNDS,d.sound),score:typeof r.score==='boolean'?r.score:d.score,
  age:r.age===null?null:pick(r.age,AGES,d.age as AgeId)};
}
/* ---- cues ---- */
export type Cue={kind:'colour';colour:ColourId}|{kind:'number';n:number}|{kind:'arrow';dir:Dir}|{kind:'pass';n:number;dir:Dir};
export const cueKey=(c:Cue)=>c.kind==='colour'?`c:${c.colour}`:c.kind==='number'?`n:${c.n}`:c.kind==='arrow'?`a:${c.dir}`:`p:${c.n}:${c.dir}`;
const any=<T,>(xs:readonly T[],rand:()=>number)=>xs[Math.min(xs.length-1,Math.floor(rand()*xs.length))];
function oneCue(s:Settings,rand:()=>number):Cue{
 const kind=s.mode==='mix'?any(['colour','number','arrow'] as const,rand):s.mode==='colours'?'colour':s.mode==='numbers'?'number':s.mode==='arrows'?'arrow':'pass';
 if(kind==='colour')return {kind,colour:any(s.colours,rand)};
 if(kind==='arrow')return {kind,dir:any(s.dirs,rand)};
 if(kind==='pass')return {kind,n:1+Math.floor(rand()*s.teammates)%s.teammates,dir:any(s.dirs,rand)};
 const [lo,hi]=RANGES[s.range];return {kind,n:lo+Math.min(hi-lo,Math.floor(rand()*(hi-lo+1)))};
}
/**
 * The next cue: never the same as the one on screen (a repeat looks like the screen froze, and the player learns nothing).
 * Every pool has at least two cues (cleanSettings), so a few draws always find a new one; after 24 unlucky draws the next
 * cue in a fixed order is taken, so a broken `rand` (always 0) still changes the cue.
 */
export function nextCue(s:Settings,prev:Cue|null,rand:()=>number):Cue{
 const pk=prev?cueKey(prev):'';
 for(let i=0;i<24;i++){const c=oneCue(s,rand);if(cueKey(c)!==pk)return c;}
 if(prev?.kind==='colour'){const i=s.colours.indexOf(prev.colour);return {kind:'colour',colour:s.colours[(i+1)%s.colours.length]};}
 if(prev?.kind==='arrow'){const i=s.dirs.indexOf(prev.dir);return {kind:'arrow',dir:s.dirs[(i+1)%s.dirs.length]};}
 if(prev?.kind==='pass')return {kind:'pass',n:prev.n%s.teammates+1,dir:prev.dir};
 if(prev?.kind==='number'){const [lo,hi]=RANGES[s.range];return {kind:'number',n:prev.n>=hi?lo:prev.n+1};}
 return oneCue(s,()=>0);
}
/** A small seeded generator (mulberry32) so a run can be replayed in a test; the app seeds it from the time. */
export function seeded(seed:number):()=>number{let a=seed>>>0;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
/* ---- the session clock (timestamps only, so a paused or backgrounded phone never drifts) ---- */
export const COUNTDOWN_MS=3000;
export type Run={startedAt:number;pausedAt:number|null;pausedMs:number};
export const startRun=(now:number):Run=>({startedAt:now,pausedAt:null,pausedMs:0});
export const pauseRun=(r:Run,now:number):Run=>r.pausedAt!=null?r:{...r,pausedAt:now};
export const resumeRun=(r:Run,now:number):Run=>r.pausedAt==null?r:{...r,pausedAt:null,pausedMs:r.pausedMs+Math.max(0,now-r.pausedAt)};
/** Milliseconds of cues shown so far (negative during the 3-2-1), paused time left out. */
export const runMs=(r:Run,now:number)=>(r.pausedAt??now)-r.startedAt-r.pausedMs-COUNTDOWN_MS;
export type Phase={phase:'count';n:number}|{phase:'run';ms:number;cue:number;left:number|null}|{phase:'done';ms:number;cues:number};
/** Where a run is: the countdown number, the index of the cue on screen and the seconds left, or done (session over). */
export function phaseAt(r:Run,s:Settings,now:number):Phase{
 const ms=runMs(r,now);
 if(ms<0)return {phase:'count',n:Math.min(3,Math.ceil(-ms/1000))};
 const len=s.session*1000,step=s.interval*1000;
 if(len&&ms>=len)return {phase:'done',ms:len,cues:cuesIn(len,step)};
 return {phase:'run',ms,cue:Math.floor(ms/step),left:len?Math.ceil((len-ms)/1000):null};
}
/** Cues shown in `ms` of running: one at the start and one at every change that fell inside the time. */
export const cuesIn=(ms:number,step:number)=>ms<=0?0:Math.floor((ms-1)/step)+1;
export const fmtTime=(sec:number)=>{const s=Math.max(0,Math.round(sec));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
/* ---- the coach's score ---- */
export type Score={hit:number;miss:number};
export type Result={hit:number;total:number;cues:number;sec:number;interval:number;at:string};
export const tally=(s:Score,ok:boolean):Score=>ok?{...s,hit:s.hit+1}:{...s,miss:s.miss+1};
/** Better = a higher share right; on a tie, more cues answered; on a tie, faster changes. */
export function better(a:Result,b:Result|undefined):boolean{
 if(!b||!b.total)return a.total>0;if(!a.total)return false;
 const ra=a.hit/a.total,rb=b.hit/b.total;if(Math.abs(ra-rb)>1e-9)return ra>rb;
 if(a.total!==b.total)return a.total>b.total;return a.interval<b.interval;
}
