import {PITCHES,formationSlots,FORMATIONS,mirror,type PitchSpec} from './pitch';
import {ARROW_KINDS,FORMATS,INKS,MAX_ARROWS,MAX_CHIPS,MAX_INK,MAX_INK_POINTS,MAX_LABEL,MAX_NAME,MAX_NOTE,MAX_STEPS,PLAY_VERSION,ZOOM_VIEWS,
 type Arrow,type Chip,type End,type Format,type Ink,type Play,type Step,type Team,type Vec} from './types';

/**
 * Pure play operations for the tactics board (every edit returns a new play, so undo/redo is a list of plays). Sequence
 * maths lives here too: `addStep` turns the current step's arrows into the next step's positions, and `positionsAt` gives
 * every chip's position at any time between steps for playback and scrubbing.
 */
export const uid=(prefix='')=>prefix+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
const r3=(n:number)=>Math.round(n*1000)/1000;
export const vec=(u:number,v:number):Vec=>[r3(u),r3(v)];
const touch=(p:Play,patch:Partial<Play>):Play=>({...p,...patch,updated:Date.now()});
const mapStep=(p:Play,i:number,f:(s:Step)=>Step):Play=>touch(p,{steps:p.steps.map((s,k)=>k===i?f(s):s)});

export function newPlay(format:Format='7v7',name='My play'):Play{
 const now=Date.now();return {v:PLAY_VERSION,id:uid('p'),name,format,chips:[],steps:[{pos:{},arrows:[],ink:[]}],view:'full',created:now,updated:now};
}
export const playersOf=(p:Play,team:Team)=>p.chips.filter(c=>c.team===team);
/** The next free shirt number for a team (keepers wear 1 when it is free). */
export function nextLabel(p:Play,team:Team,gk=false):string{
 if(team==='ball')return '';
 const used=new Set(playersOf(p,team).map(c=>c.label));
 if(gk&&!used.has('1'))return '1';
 for(let n=gk?1:2;n<100;n++)if(!used.has(String(n)))return String(n);
 return '';
}
/** A sensible free spot for a new chip: the next empty slot of the format's first shape (mirrored for the away side). */
export function freeSpot(p:Play,team:Team,step=0):Vec{
 const spec=PITCHES[p.format],pos=p.steps[step]?.pos??{},taken=Object.values(pos);
 const clear=(at:Vec)=>taken.every(t=>Math.hypot((t[0]-at[0])*spec.length,(t[1]-at[1])*spec.width)>Math.max(3,spec.width*.07));
 if(team==='ball'){for(const at of [[.5,.5],[.5,.56],[.46,.5]] as Vec[])if(clear(at))return at;return [.5,.44];}
 const f=FORMATIONS.find(x=>x.format===p.format)!;
 for(const s of formationSlots(f)){const at=team==='away'?mirror(s.at):s.at;if(clear(at))return at;}
 for(let k=0;k<60;k++){const a=k*2.4,r=.04+k*.006,at=vec((team==='away'?.7:.3)+Math.cos(a)*r,.5+Math.sin(a)*r*1.4);if(clear(at))return at;}
 return team==='away'?[.7,.5]:[.3,.5];
}
export function addChip(p:Play,team:Team,at?:Vec,opts:{gk?:boolean;label?:string;step?:number}={}):{play:Play;id:string|null}{
 if(p.chips.length>=MAX_CHIPS)return {play:p,id:null};
 const id=uid(team[0]),gk=team!=='ball'&&!!opts.gk;
 const chip:Chip={id,team,label:team==='ball'?'':(opts.label??nextLabel(p,team,gk)).slice(0,MAX_LABEL),...(gk?{gk:true}:{})};
 const spot=at??freeSpot(p,team,opts.step??0);
 return {play:touch(p,{chips:[...p.chips,chip],steps:p.steps.map(s=>({...s,pos:{...s.pos,[id]:vec(spot[0],spot[1])}}))}),id};
}
/** Removes chips from every step, with any arrow attached to them. */
export function removeChips(p:Play,ids:string[]):Play{
 const gone=new Set(ids),attached=(e:End)=>'c' in e&&gone.has(e.c);
 return touch(p,{chips:p.chips.filter(c=>!gone.has(c.id)),steps:p.steps.map(s=>({...s,pos:Object.fromEntries(Object.entries(s.pos).filter(([k])=>!gone.has(k))),arrows:s.arrows.filter(a=>!attached(a.a)&&!attached(a.b))}))});
}
export function updateChip(p:Play,id:string,patch:Partial<Pick<Chip,'label'|'team'|'gk'>>):Play{
 return touch(p,{chips:p.chips.map(c=>{if(c.id!==id||c.team==='ball')return c;const n:Chip={...c,...patch};
  n.label=String(n.label??'').replace(/[^\p{L}\p{N}]/gu,'').slice(0,MAX_LABEL);if(!n.gk)delete n.gk;return n;})});
}
export function moveChips(p:Play,step:number,moves:Record<string,Vec>):Play{
 return mapStep(p,step,s=>{const pos={...s.pos};for(const [id,at] of Object.entries(moves))if(id in pos)pos[id]=vec(at[0],at[1]);return {...s,pos};});
}
export const addArrow=(p:Play,step:number,a:Arrow)=>p.steps[step].arrows.length>=MAX_ARROWS?p:mapStep(p,step,s=>({...s,arrows:[...s.arrows,a]}));
export const updateArrow=(p:Play,step:number,id:string,patch:Partial<Arrow>)=>mapStep(p,step,s=>({...s,arrows:s.arrows.map(a=>a.id===id?{...a,...patch}:a)}));
export const addInk=(p:Play,step:number,ink:Ink)=>p.steps[step].ink.length>=MAX_INK?p:mapStep(p,step,s=>({...s,ink:[...s.ink,{...ink,pts:ink.pts.slice(0,MAX_INK_POINTS)}]}));
/** Removes arrows and marker ink by id from one step. */
export function removeMarks(p:Play,step:number,ids:string[]):Play{
 const gone=new Set(ids);return mapStep(p,step,s=>({...s,arrows:s.arrows.filter(a=>!gone.has(a.id)),ink:s.ink.filter(i=>!gone.has(i.id))}));
}
export const clearMarks=(p:Play,step:number)=>mapStep(p,step,s=>({...s,arrows:[],ink:[]}));
export const setFormat=(p:Play,format:Format)=>p.format===format?p:touch(p,{format});

/**
 * Loads a team shape. `side` 'home' or 'away' replaces that team's players (in every step) with the shape; 'both' sets up
 * both teams, the away side mirrored. The ball goes on the centre spot when there is none.
 */
export function loadFormation(p:Play,formationId:string,side:'home'|'away'|'both'):Play{
 const f=FORMATIONS.find(x=>x.id===formationId);if(!f)return p;
 let next=touch(p,{format:f.format});
 const teams:('home'|'away')[]=side==='both'?['home','away']:[side];
 next=removeChips(next,next.chips.filter(c=>teams.includes(c.team as 'home'|'away')).map(c=>c.id));
 for(const team of teams)for(const s of formationSlots(f)){const at=team==='away'?mirror(s.at):s.at;
  // Away numbers follow the same shape, so 9 marks 9's opponent across the halfway line (mirrored).
  next=addChip(next,team,team==='away'?vec(Math.min(at[0],.965),at[1]):at,{gk:s.gk,label:s.label}).play;}
 if(!next.chips.some(c=>c.team==='ball'))next=addChip(next,'ball',[.5,.5]).play;
 return next;
}

// ─── Geometry ───────────────────────────────────────────────────────────────────────────────────────────────────────────
export type M=[number,number];// metres
export const toM=(spec:PitchSpec,v:Vec):M=>[v[0]*spec.length,v[1]*spec.width];
export const toV=(spec:PitchSpec,m:M):Vec=>vec(m[0]/spec.length,m[1]/spec.width);
export function endPoint(e:End,pos:Record<string,Vec>):Vec|null{return 'c' in e?pos[e.c]??null:e.p;}
/** Quadratic Bézier control point for a chord p0→p2 bent sideways by `bend` × length. */
export function control(p0:M,p2:M,bend:number):M{
 const dx=p2[0]-p0[0],dy=p2[1]-p0[1];return [(p0[0]+p2[0])/2-dy*bend,(p0[1]+p2[1])/2+dx*bend];
}
export const quad=(p0:M,c:M,p2:M,t:number):M=>{const a=(1-t)*(1-t),b=2*(1-t)*t,d=t*t;return [a*p0[0]+b*c[0]+d*p2[0],a*p0[1]+b*c[1]+d*p2[1]];};
/** Resolves an arrow to metres: start, control, end (null when an attached chip is gone). */
export function arrowCurve(a:Arrow,pos:Record<string,Vec>,spec:PitchSpec):{p0:M;c:M;p2:M}|null{
 const s=endPoint(a.a,pos),e=endPoint(a.b,pos);if(!s||!e)return null;
 const p0=toM(spec,s),p2=toM(spec,e);return {p0,c:control(p0,p2,a.bend),p2};
}
/** Fits a smooth curve to a hand-drawn stroke: the bend that puts the curve's middle on the stroke's middle (by length). */
export function fitBend(points:M[]):number{
 if(points.length<3)return 0;
 const p0=points[0],p2=points[points.length-1],len=Math.hypot(p2[0]-p0[0],p2[1]-p0[1]);if(len<1e-6)return 0;
 const acc=[0];for(let i=1;i<points.length;i++)acc.push(acc[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
 const half=acc[acc.length-1]/2;let i=1;while(i<acc.length-1&&acc[i]<half)i++;
 const t=(half-acc[i-1])/Math.max(1e-9,acc[i]-acc[i-1]),mid:M=[points[i-1][0]+(points[i][0]-points[i-1][0])*t,points[i-1][1]+(points[i][1]-points[i-1][1])*t];
 // B(0.5) = (p0 + 2c + p2)/4 → c = 2·mid − (p0+p2)/2; the bend is c's sideways offset from the chord's middle.
 const cx=2*mid[0]-(p0[0]+p2[0])/2,cy=2*mid[1]-(p0[1]+p2[1])/2,nx=-(p2[1]-p0[1])/len,ny=(p2[0]-p0[0])/len;
 const bend=((cx-(p0[0]+p2[0])/2)*nx+(cy-(p0[1]+p2[1])/2)*ny)/len;
 return Math.max(-.8,Math.min(.8,Math.round(bend*100)/100));
}

// ─── Sequences ──────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The ball nearest a chip within `reach` metres (the ball at a player's feet). */
function ballAtFeet(p:Play,step:Step,chipId:string,spec:PitchSpec,reach:number):string|null{
 const at=step.pos[chipId];if(!at)return null;let best:string|null=null,bd=reach;
 for(const c of p.chips)if(c.team==='ball'&&step.pos[c.id]){const d=Math.hypot((step.pos[c.id][0]-at[0])*spec.length,(step.pos[c.id][1]-at[1])*spec.width);if(d<bd){bd=d;best=c.id;}}
 return best;
}
const feet=(spec:PitchSpec)=>Math.max(1.6,spec.width*.05);
/**
 * The movement plan from step i to step i+1: for each chip that moves, the curve it follows (the coach's run, dribble or
 * pass arrow when one matches, otherwise a straight line).
 */
export type Move={from:M;to:M;bend:number;kind:'run'|'dribble'|'pass'|'shift'};
export function movesBetween(p:Play,i:number):Record<string,Move>{
 const spec=PITCHES[p.format],a=p.steps[i],b=p.steps[i+1],out:Record<string,Move>={};if(!a||!b)return out;
 const close=(x:M,y:M,r:number)=>Math.hypot(x[0]-y[0],x[1]-y[1])<r;
 for(const c of p.chips){const s=a.pos[c.id],e=b.pos[c.id];if(!s||!e)continue;const from=toM(spec,s),to=toM(spec,e);
  if(close(from,to,.05))continue;
  let mv:Move={from,to,bend:0,kind:'shift'};
  if(c.team==='ball'){
   // The ball follows a pass from it (or from the player it is with) or a dribble by the player it is with.
   for(const ar of a.arrows){const st=endPoint(ar.a,a.pos);if(!st)continue;const sm=toM(spec,st);
    const fromBall='c' in ar.a&&ar.a.c===c.id,fromCarrier='c' in ar.a&&ar.a.c!==c.id&&ballAtFeet(p,a,ar.a.c,spec,feet(spec)*1.6)===c.id;
    if(ar.kind==='pass'&&(fromBall||fromCarrier||close(sm,from,feet(spec)))){mv={from,to,bend:ar.bend,kind:'pass'};break;}
    if(ar.kind==='dribble'&&fromCarrier){mv={from,to,bend:ar.bend,kind:'dribble'};break;}}
  }else{
   const own=a.arrows.find(ar=>(ar.kind==='run'||ar.kind==='dribble')&&'c' in ar.a&&ar.a.c===c.id);
   if(own)mv={from,to,bend:own.bend,kind:own.kind as 'run'|'dribble'};
  }
  out[c.id]=mv;}
 return out;
}
/**
 * "+ Add step": a copy of step `i` placed after it, with the arrows carried out. Runs and dribbles move their player to the
 * arrow's end; a pass (or a dribble) moves the ball; a pass to a player who is running arrives where that player arrives.
 * The new step starts with no arrows (the coach draws what happens next) and keeps the marker notes and zones.
 */
export function addStep(p:Play,i:number):{play:Play;index:number}{
 if(p.steps.length>=MAX_STEPS)return {play:p,index:i};
 const spec=PITCHES[p.format],cur=p.steps[i],pos={...cur.pos};
 for(const ar of cur.arrows){if(ar.kind==='pass'||!('c' in ar.a))continue;const end=endPoint(ar.b,cur.pos);if(!end)continue;
  const ball=ar.kind==='dribble'?ballAtFeet(p,cur,ar.a.c,spec,feet(spec)*1.6):null;
  pos[ar.a.c]=vec(end[0],end[1]);
  if(ball){const off=cur.pos[ball][0]-cur.pos[ar.a.c][0],offV=cur.pos[ball][1]-cur.pos[ar.a.c][1];pos[ball]=vec(end[0]+off,end[1]+offV);}}
 for(const ar of cur.arrows){if(ar.kind!=='pass')continue;const st=endPoint(ar.a,cur.pos);if(!st)continue;
  let ball:string|null=null;
  if('c' in ar.a){const ch=p.chips.find(c=>c.id===(ar.a as {c:string}).c);ball=ch?.team==='ball'?ch.id:ballAtFeet(p,cur,ar.a.c,spec,feet(spec)*1.6);}
  else for(const c of p.chips)if(c.team==='ball'&&cur.pos[c.id]&&Math.hypot((cur.pos[c.id][0]-st[0])*spec.length,(cur.pos[c.id][1]-st[1])*spec.width)<feet(spec)){ball=c.id;break;}
  if(!ball)continue;
  let end:Vec|null;
  if('c' in ar.b){const r=pos[ar.b.c];// arrives at the receiver's new spot, at their feet on the side it came from
   if(r){const dx=(st[0]-r[0])*spec.length,dy=(st[1]-r[1])*spec.width,d=Math.hypot(dx,dy)||1,k=Math.min(feet(spec)*.9,d/2);end=vec(r[0]+dx/d*k/spec.length,r[1]+dy/d*k/spec.width);}else end=null;}
  else end=ar.b.p;
  if(end)pos[ball]=end;}
 const step:Step={pos,arrows:[],ink:cur.ink.map(k=>({...k,id:uid('k')}))};
 const steps=[...p.steps.slice(0,i+1),step,...p.steps.slice(i+1)];
 return {play:touch(p,{steps}),index:i+1};
}
export function removeStep(p:Play,i:number):Play{if(p.steps.length<=1||!p.steps[i])return p;return touch(p,{steps:p.steps.filter((_,k)=>k!==i)});}
export function moveStep(p:Play,from:number,to:number):Play{
 if(from===to||!p.steps[from]||to<0||to>=p.steps.length)return p;const steps=[...p.steps];const [s]=steps.splice(from,1);steps.splice(to,0,s);return touch(p,{steps});
}
/** Smooth start and stop for players; passes leave quickly and slow into the receiver's feet. */
export const easeInOut=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const easeOut=(t:number)=>1-Math.pow(1-t,2.4);
/** A short pause on every step during playback, so the shape is readable: the fraction of each step spent still. */
export const HOLD=.22;
export const holdT=(u:number)=>u<=HOLD?0:(u-HOLD)/(1-HOLD);
/**
 * Every chip's position (metres) at play time t (0 = step 1, 1 = step 2 …; fractions are between steps), following each
 * move's curve. `hold` adds the readable pause at each step (playback); scrubbing uses the raw time.
 */
export function positionsAt(p:Play,t:number,hold=false,cache?:Record<number,Record<string,Move>>):Record<string,M>{
 const spec=PITCHES[p.format],n=p.steps.length,tt=Math.max(0,Math.min(n-1,t)),i=Math.min(n-1,Math.floor(tt)),u=tt-i;
 const out:Record<string,M>={};const step=p.steps[i];
 for(const c of p.chips)if(step.pos[c.id])out[c.id]=toM(spec,step.pos[c.id]);
 if(u<=0||i>=n-1)return out;
 const moves=cache?.[i]??movesBetween(p,i);if(cache)cache[i]=moves;
 const k=hold?holdT(u):u;
 for(const [id,mv] of Object.entries(moves)){const e=mv.kind==='pass'?easeOut(k):easeInOut(k);
  out[id]=mv.bend?quad(mv.from,control(mv.from,mv.to,mv.bend),mv.to,e):[mv.from[0]+(mv.to[0]-mv.from[0])*e,mv.from[1]+(mv.to[1]-mv.from[1])*e];}
 return out;
}

// ─── Schema ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const num=(x:unknown,lo=-.2,hi=1.2)=>typeof x==='number'&&Number.isFinite(x)?Math.max(lo,Math.min(hi,x)):null;
const asVec=(x:unknown):Vec|null=>{if(!Array.isArray(x)||x.length!==2)return null;const u=num(x[0]),v=num(x[1]);return u===null||v===null?null:vec(u,v);};
const asId=(x:unknown)=>typeof x==='string'&&/^[a-z0-9]{1,24}$/i.test(x)?x:null;
const text=(x:unknown,max:number)=>typeof x==='string'?x.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):'';
function asEnd(x:unknown,ids:Set<string>):End|null{
 if(!x||typeof x!=='object')return null;const o=x as {c?:unknown;p?:unknown};
 if(o.c!==undefined){const c=asId(o.c);return c&&ids.has(c)?{c}:null;}const p=asVec(o.p);return p?{p}:null;
}
/** Older play shapes upgrade here before validation (v0: the unreleased prototype kept `frames` for steps). */
export function migratePlay(raw:unknown):unknown{
 if(!raw||typeof raw!=='object')return raw;const o=raw as Record<string,unknown>;
 if(o.v===undefined&&Array.isArray(o.frames))return {...o,v:1,steps:o.frames,frames:undefined};
 return raw;
}
/** Validates and cleans a play from storage or a share link. Unknown versions and broken plays give null. */
export function sanitizePlay(input:unknown):Play|null{
 const raw=migratePlay(input);if(!raw||typeof raw!=='object')return null;const o=raw as Record<string,unknown>;
 if(o.v!==PLAY_VERSION)return null;
 const format=FORMATS.includes(o.format as Format)?o.format as Format:null;if(!format)return null;
 const chips:Chip[]=[],ids=new Set<string>();
 for(const c of Array.isArray(o.chips)?o.chips.slice(0,MAX_CHIPS):[]){if(!c||typeof c!=='object')continue;const x=c as Record<string,unknown>,id=asId(x.id);
  if(!id||ids.has(id)||!['home','away','ball'].includes(x.team as string))continue;
  const team=x.team as Team,chip:Chip={id,team,label:team==='ball'?'':text(x.label,40).replace(/[^\p{L}\p{N}]/gu,'').slice(0,MAX_LABEL)};if(x.gk===true&&team!=='ball')chip.gk=true;chips.push(chip);ids.add(id);}
 const steps:Step[]=[];
 for(const s of Array.isArray(o.steps)?o.steps.slice(0,MAX_STEPS):[]){if(!s||typeof s!=='object')continue;const x=s as Record<string,unknown>;
  const pos:Record<string,Vec>={},rp=(x.pos&&typeof x.pos==='object'?x.pos:{}) as Record<string,unknown>;
  for(const c of chips){const v=asVec(rp[c.id]);if(v)pos[c.id]=v;}
  const arrows:Arrow[]=[];
  for(const a of Array.isArray(x.arrows)?x.arrows.slice(0,MAX_ARROWS):[]){if(!a||typeof a!=='object')continue;const y=a as Record<string,unknown>,id=asId(y.id),A=asEnd(y.a,ids),B=asEnd(y.b,ids);
   if(!id||!A||!B||!ARROW_KINDS.includes(y.kind as Arrow['kind']))continue;
   arrows.push({id,kind:y.kind as Arrow['kind'],a:A,b:B,bend:num(y.bend,-.8,.8)??0,ink:Math.max(0,Math.min(INKS.length-1,Math.round(num(y.ink,0,9)??0)))});}
  const ink:Ink[]=[];
  for(const k of Array.isArray(x.ink)?x.ink.slice(0,MAX_INK):[]){if(!k||typeof k!=='object')continue;const y=k as Record<string,unknown>,id=asId(y.id);
   const pts=(Array.isArray(y.pts)?y.pts.slice(0,MAX_INK_POINTS):[]).map(asVec).filter((v):v is Vec=>!!v);
   if(!id||pts.length<2||(y.kind!=='line'&&y.kind!=='zone'))continue;
   ink.push({id,kind:y.kind,pts,ink:Math.max(0,Math.min(INKS.length-1,Math.round(num(y.ink,0,9)??0)))});}
  steps.push({pos,arrows,ink});}
 if(!steps.length)steps.push({pos:{},arrows:[],ink:[]});
 // Every chip is in every step: a missing position takes the previous step's (or the first known one).
 for(const c of chips){const first=steps.find(s=>s.pos[c.id])?.pos[c.id]??[.5,.5] as Vec;let last=first;for(const s of steps){if(!s.pos[c.id])s.pos[c.id]=last;last=s.pos[c.id];}}
 const now=Date.now();
 const play:Play={v:PLAY_VERSION,id:asId(o.id)??uid('p'),name:text(o.name,MAX_NAME)||'My play',format,chips,steps,
  created:num(o.created,0,9e15)??now,updated:num(o.updated,0,9e15)??now};
 const note=text(o.note,MAX_NOTE);if(note)play.note=note;
 if(ZOOM_VIEWS.includes(o.view as never))play.view=o.view as Play['view'];
 return play;
}
