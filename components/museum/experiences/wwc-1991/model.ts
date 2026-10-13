import {BANS,DARK_FROM,DARK_TO,FINAL_1991,AKERS_PLAY} from './data';
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** Exponential follow that snaps to rest, so the loop can stop. */
const follow=(cur:number,target:number,dt:number,tau=.12,eps=1e-3)=>{const n=cur+(target-cur)*(1-Math.exp(-dt/tau));return Math.abs(target-n)<eps?target:n;};

/**
 * wwc-1991 · the game model (Oct 10 2026; Oct 12 2026: the pixel drawing is gone, the machines are drawn with the anatomy kit in
 * the Paper theme by Gates.tsx and Final.tsx). Pure: tests/museum-exp-wwc-1991.cjs plays it in Node. Two machines:
 *
 *  1. THE GATES (the dark years). A stadium wall with three locked turnstiles, England, Brazil and West Germany, and the big
 *     FIFA gate. Drag the year lever along its rail from 1920 to 1991: each ban locks its gate in the year it began and unlocks
 *     it in the year it ended (BANS in data.ts), and the waiting player walks through to the pitch. At 1991 the FIFA gate opens:
 *     the first Women's World Cup, in China.
 *  2. THE WINNER (the 1991 final, minute 78, 1–1). Draw Michelle Akers's run with your finger: cut out Norway's back pass to
 *     the keeper, win it, go round the keeper, finish. Let go and the run plays. Five chances, each back pass faster.
 *     Real goal (FINAL_1991.goals[2]): "She chased a Norway back pass, won it, went round the goalkeeper and scored."
 *     The spots are drawn for teaching and squeezed onto one screen (the real ones are in AKERS_PLAY, data.ts).
 *
 * Scoring (one chance): a goal is 100; winning the pass early adds up to 50 (PRESS: how much of the pass was still to go);
 * going round the keeper before the finish adds 50. Five chances: 1,000 at most.
 * World: Norway's goal line is x = 0 (net behind, toward −x), the mouth spans y POST_A → POST_B. Metres, seconds.
 */
// ── The final ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const GOAL_W=7.32,POST_A=1.34,POST_B=POST_A+GOAL_W,MID=(POST_A+POST_B)/2;
export const AKERS_RUN=6,AKERS_DRIBBLE=4.6,KEEPER_WALK=2.2,KEEPER_RUSH=3.4,KEEPER_REACT=.3,DEF_RUN=3.6,SHOT_SPEED=15;
/** The keeper dives at the ball when Akers brings it within DIVE_AT m: a lunge of DIVE_T s to where the ball WAS, then he is
 *  down for DOWN_T s. A sharp cut sideways as he goes down takes the ball round him (the real goal). */
export const DIVE_AT=2,DIVE_T=.32,DOWN_T=1.3,DIVE_REACH=1.5;
export const WIN_R=.6,SAVE_R=.75,TACKLE_R=.45,BLOCK_R=.45,KEEPER_BLOCK=.85,PASS_DELAY=.35;
export const ROUND=5,GOAL_PTS=100,PRESS_PTS=50,ROUND_PTS=50;
export type V={x:number;y:number};
export type Chance={def:V;to:V;speed:number;akers:V;keeper:V};
/** Five back passes, each a little faster. Chance 1 is the real one (squeezed: see AKERS_PLAY). */
export const CHANCES:readonly Chance[]=[
 {def:{x:9,y:3.4},to:{x:1.7,y:5.3},speed:5,akers:{x:10.6,y:8},keeper:{x:.9,y:MID}},
 {def:{x:8.4,y:8.6},to:{x:1.6,y:4.6},speed:5.6,akers:{x:11,y:4.2},keeper:{x:.9,y:MID}},
 {def:{x:7.6,y:1.6},to:{x:1.8,y:6.2},speed:6.1,akers:{x:9.2,y:6.8},keeper:{x:1.1,y:4.6}},
 {def:{x:9.4,y:7.4},to:{x:1.5,y:4},speed:6.6,akers:{x:9.8,y:2.4},keeper:{x:.9,y:5.6}},
 {def:{x:8,y:4.6},to:{x:1.9,y:5.8},speed:7.1,akers:{x:6.8,y:8.4},keeper:{x:1.2,y:4.4}},
];
/** The real spots from data.ts (pitch metres: USA attack x → 105), mapped onto this screen's frame for the record. */
export const REAL_PASS={from:{x:105-AKERS_PLAY.defender[0],y:AKERS_PLAY.defender[1]-34+MID},to:{x:105-AKERS_PLAY.passTo[0],y:AKERS_PLAY.passTo[1]-34+MID}};
export const BOUNDS={x0:-1.2,x1:14,y0:-1.5,y1:12.5};

export type Outcome='goal'|'saved'|'keeper'|'tackled'|'wide'|'blocked'|'short';
export type Play={
 chance:Chance;run:V[];t:number;done:boolean;outcome:Outcome|null;
 akers:V;keeper:V;def:V;ball:V&{z:number};
 /** run index Akers has reached (fractional along `run`) */s:number;
 won:number|null;press:number;roundK:boolean;shot:{from:V;dir:V;t:number}|null;keeperHas:boolean;
 trail:V[];akersTrail:V[];kDive:number;frame:number;doneAt:number;
 /** the keeper: walking out, rushing, diving (at kAim), down on the grass */kState:'walk'|'rush'|'dive'|'down';kT:number;kAim:V;
};
const d2=(a:V,b:V)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x:number,y:number)=>{const l=Math.hypot(x,y)||1;return {x:x/l,y:y/l};};
const passLen=(c:Chance)=>d2(c.def,c.to);
/** Where the loose back pass is t seconds after GO (it starts after PASS_DELAY and stops at its target). */
export function passAt(c:Chance,t:number):V&{u:number}{
 const L=passLen(c),u=clamp((t-PASS_DELAY)*c.speed/L,0,1);return {x:lerp(c.def.x,c.to.x,u),y:lerp(c.def.y,c.to.y,u),u};}

/** Resample a finger path (world points) into even steps, starting at Akers, clamped to the pitch, 40 m at most. */
export function cleanRun(start:V,pts:readonly V[],step=.25,max=40):V[]{
 const out:V[]=[{...start}];let len=0;
 for(const p0 of pts){const p={x:clamp(p0.x,BOUNDS.x0,BOUNDS.x1),y:clamp(p0.y,BOUNDS.y0,BOUNDS.y1)};let last=out[out.length-1],d=d2(last,p);
  while(d>=step&&len<max){const k=step/d;last={x:last.x+(p.x-last.x)*k,y:last.y+(p.y-last.y)*k};out.push(last);len+=step;d=d2(last,p);}}
 return out;}

export function newPlay(chance:Chance,run:V[]):Play{
 return {chance,run:run.length?run:[chance.akers],t:0,done:false,outcome:null,akers:{...chance.akers},keeper:{...chance.keeper},def:{...chance.def},
  ball:{...chance.def,z:0},s:0,won:null,press:0,roundK:false,shot:null,keeperHas:false,trail:[],akersTrail:[{...chance.akers}],kDive:0,frame:0,doneAt:0,kState:'walk',kT:0,kAim:{...chance.keeper}};}

const along=(run:V[],s:number):V=>{const i=Math.min(run.length-1,Math.floor(s)),j=Math.min(run.length-1,i+1),f=s-i;return {x:lerp(run[i].x,run[j].x,f),y:lerp(run[i].y,run[j].y,f)};};
const segLen=(run:V[],i:number)=>i+1<run.length?d2(run[i],run[i+1]):0;
/** Closest distance from p to the segment a→b. */
function segDist(p:V,a:V,b:V){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,u=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,0,1);return Math.hypot(a.x+dx*u-p.x,a.y+dy*u-p.y);}
const moveTo=(p:V,t:V,speed:number,dt:number)=>{const d=d2(p,t);if(d<1e-6)return;const k=Math.min(1,speed*dt/d);p.x+=(t.x-p.x)*k;p.y+=(t.y-p.y)*k;};
const inMouth=(y:number)=>y>POST_A+.12&&y<POST_B-.12;
function finish(p:Play,o:Outcome){if(p.done)return;p.done=true;p.outcome=o;p.doneAt=p.t;}

/** One fixed step of the play (dt seconds). Returns true while something still moves. */
export function stepPlay(p:Play,dt:number):boolean{
 if(p.done&&p.t>p.doneAt+AFTER)return false;
 const H=1/120,n=Math.max(1,Math.ceil(dt/H));for(let i=0;i<n;i++)sub(p,dt/n);
 return !(p.done&&p.t>p.doneAt+AFTER);
}
/** The last beat after the whistle (s): long enough to see the net bulge or the keeper hold it. */
export const AFTER=.9;
function sub(p:Play,h:number){
 const c=p.chance;p.t+=h;p.frame=Math.floor(p.t*8);
 if(p.done){// after the whistle: the ball settles (in the net, or in the keeper's hands)
  if(p.shot&&p.outcome==='goal'&&p.ball.x>-1.6){p.ball.x+=p.shot.dir.x*h*6;p.ball.y+=p.shot.dir.y*h*6;}
  return;}
 // 1. Akers follows her drawn run (faster without the ball).
 const sp=p.won!=null?AKERS_DRIBBLE:AKERS_RUN;let left=sp*h;
 while(left>0&&p.s<p.run.length-1){const i=Math.floor(p.s),L=segLen(p.run,i);if(L<1e-6){p.s=i+1;continue;}const rem=(i+1-p.s)*L;
  if(left>=rem){p.s=i+1;left-=rem;}else{p.s+=left/L;left=0;}}
 const a=along(p.run,p.s);p.akers.x=a.x;p.akers.y=a.y;
 const at=p.akersTrail[p.akersTrail.length-1];if(d2(at,a)>.3)p.akersTrail.push({...a});
 // 2. The ball: the loose back pass, at Akers's feet, or the shot.
 if(p.shot){const s=p.shot;const prev={x:p.ball.x,y:p.ball.y};p.ball.x+=s.dir.x*SHOT_SPEED*h;p.ball.y+=s.dir.y*SHOT_SPEED*h;p.ball.z=.15;
  if(p.kState!=='down'&&d2(p.keeper,p.ball)<KEEPER_BLOCK){p.kDive=1;finish(p,'saved');return;}
  if(segDist(p.def,prev,p.ball)<BLOCK_R){finish(p,'blocked');return;}
  if(p.ball.x<=0){p.ball.x=Math.max(p.ball.x,-.05);if(inMouth(p.ball.y)){p.ball.x=-.1;finish(p,'goal');}else finish(p,'wide');return;}
  if(p.ball.x>BOUNDS.x1||p.ball.y<BOUNDS.y0-2||p.ball.y>BOUNDS.y1+2){finish(p,'wide');return;}
  pushTrail(p);
 }else if(p.won!=null){const dir=p.s<p.run.length-1?norm(p.run[Math.min(p.run.length-1,Math.floor(p.s)+1)].x-a.x,p.run[Math.min(p.run.length-1,Math.floor(p.s)+1)].y-a.y):{x:-1,y:0};
  p.ball.x=a.x+dir.x*.35;p.ball.y=a.y+dir.y*.35;p.ball.z=0;pushTrail(p);
  // Walked it in: past the line between the posts.
  if(p.ball.x<=0){if(inMouth(p.ball.y)){p.ball.x=-.1;p.shot={from:{...a},dir,t:p.t};finish(p,'goal');}else finish(p,'wide');return;}
  if(a.x<p.keeper.x-.3&&d2(a,p.keeper)>.9)p.roundK=true;
  // Run over: shoot along the last step of the run.
  if(p.s>=p.run.length-1){const n2=p.run.length,last=p.run[n2-1],prev=p.run[Math.max(0,n2-4)];let dir2=norm(last.x-prev.x,last.y-prev.y);
   if(Math.hypot(last.x-prev.x,last.y-prev.y)<.05)dir2=norm(-p.ball.x,MID-p.ball.y);
   if(dir2.x>-.05){finish(p,'short');return;}// pointing away from goal: she never shot
   p.shot={from:{x:p.ball.x,y:p.ball.y},dir:dir2,t:p.t};}
 }else if(!p.keeperHas){const b=passAt(c,p.t);p.ball.x=b.x;p.ball.y=b.y;p.ball.z=0;
  if(b.u>0&&d2(a,b)<WIN_R){p.won=p.t;p.press=1-b.u;}
  else if(d2(p.keeper,b)<SAVE_R&&b.u>0){p.keeperHas=true;finish(p,'keeper');return;}
  if(p.s>=p.run.length-1&&b.u>=1&&p.won==null){p.keeperHas=true;finish(p,'keeper');return;}
 }
 // 3. The keeper walks out to collect the pass; once Akers has it he rushes her, dives at the ball, and is down a moment.
 if(p.won==null)moveTo(p.keeper,c.to,KEEPER_WALK,h);
 else if(p.kState==='walk'){if(p.t-p.won>KEEPER_REACT)p.kState='rush';}
 else if(p.kState==='rush'){moveTo(p.keeper,p.shot?{x:Math.max(.4,p.keeper.x),y:p.ball.y}:p.ball,KEEPER_RUSH,h);
  if(!p.shot&&d2(p.keeper,p.ball)<DIVE_AT){p.kState='dive';p.kT=0;const dx=p.ball.x-p.keeper.x,dy=p.ball.y-p.keeper.y,l=Math.hypot(dx,dy)||1,r=Math.min(DIVE_REACH,l);p.kAim={x:p.keeper.x+dx/l*r,y:p.keeper.y+dy/l*r};}}
 else if(p.kState==='dive'){p.kT+=h;p.kDive=1;moveTo(p.keeper,p.kAim,DIVE_REACH/DIVE_T,h);if(p.kT>=DIVE_T){p.kState='down';p.kT=0;}}
 else if(p.kState==='down'){p.kT+=h;if(p.kT>=DOWN_T){p.kState='rush';p.kDive=0;}}
 if(p.won!=null&&!p.shot&&(p.kState==='rush'||p.kState==='dive')&&d2(p.keeper,p.ball)<SAVE_R){p.kDive=p.kState==='dive'?1:0;finish(p,'saved');return;}
 if(p.won!=null&&p.kState==='down'&&!p.roundK&&d2(p.keeper,p.ball)>1.2)p.roundK=true;
 // 4. Norway's defender plays the pass, then races back to cover the goal (and tackles if she catches Akers).
 if(p.t>PASS_DELAY){const target={x:.5,y:clamp(p.won==null?MID:p.ball.y,POST_A+1,POST_B-1)};moveTo(p.def,target,DEF_RUN,h);
  if(p.won!=null&&!p.shot&&d2(p.def,p.ball)<TACKLE_R){finish(p,'tackled');return;}}
}
function pushTrail(p:Play){const l=p.trail[p.trail.length-1];if(!l||d2(l,p.ball)>.3)p.trail.push({x:p.ball.x,y:p.ball.y});}

/** Points for a finished play. */
export function pointsOf(p:Play){
 if(p.outcome!=='goal')return {total:0,press:0,round:0,goal:0};
 const press=Math.round(PRESS_PTS*clamp(p.press,0,1)),round=p.roundK?ROUND_PTS:0;return {goal:GOAL_PTS,press,round,total:GOAL_PTS+press+round};}

/** Run a whole play in one go (tests, reduced motion). */
export function simulate(chance:Chance,run:V[]):Play{const p=newPlay(chance,run);for(let i=0;i<2400&&stepPlay(p,1/60);i++){/* to the end */}return p;}

/**
 * "Show me" (and the test's proof that every chance can be scored): meet the pass at the earliest point Akers can reach, then
 * swing round the keeper on the side he is not, and walk it into the far half of the goal.
 */
export function demoRun(c:Chance):V[]{
 let meet:V=c.to;for(let t=PASS_DELAY;t<6;t+=.02){const b=passAt(c,t);if(d2(c.akers,b)/AKERS_RUN<=t-.06){meet={x:b.x+.1,y:b.y};break;}}
 // Cut away from the keeper: across his line, then into the far half of the goal.
 const side=meet.y<=c.to.y?-1:1,cut={x:Math.max(1.4,meet.x-1.2),y:clamp(meet.y+side*2.6,POST_A-.6,POST_B+.6)};
 const fin={x:-.5,y:clamp(cut.y-side*1.4,POST_A+1,POST_B-1)};
 const pts:V[]=[];const seg=(a:V,b:V,n:number)=>{for(let i=1;i<=n;i++)pts.push({x:lerp(a.x,b.x,i/n),y:lerp(a.y,b.y,i/n)});};
 seg(c.akers,meet,8);seg(meet,cut,6);seg(cut,fin,6);return cleanRun(c.akers,pts);}

// ── The gates (the dark years) ───────────────────────────────────────────────────────────────────────────────────────────
export const YEAR0=DARK_FROM,YEAR1=DARK_TO;
export type GateId='ENG'|'BRA'|'GER'|'FIFA';
export const GATES:{id:GateId;x:number;w:number;ban:number|null}[]=[
 {id:'ENG',x:.6,w:2,ban:0},{id:'BRA',x:3.8,w:2,ban:1},{id:'GER',x:7,w:2,ban:2},{id:'FIFA',x:10.4,w:2.6,ban:null},
];
/** Is this gate locked in this year? A ban locks from its first year up to (not including) the year it ended. The FIFA gate
 *  (a Women's World Cup) stays shut until 1991. */
export function locked(id:GateId,year:number){const g=GATES.find(x=>x.id===id)!;if(g.ban==null)return year<1991;const b=BANS[g.ban];return year>=b.from&&year<b.to;}
export type GateState={year:number;open:Record<GateId,number>;walk:Record<GateId,number>;reached:boolean};
export const newGates=():GateState=>({year:YEAR0,open:{ENG:1,BRA:1,GER:1,FIFA:0},walk:{ENG:1,BRA:1,GER:1,FIFA:0},reached:false});
/** Ease the turnstiles and the walking players toward the year's state. Returns true while anything still moves. */
export function stepGates(g:GateState,dt:number){let moving=false;
 for(const x of GATES){const want=locked(x.id,g.year)?0:1;
  const o=follow(g.open[x.id],want,dt,.12,.01);if(o!==g.open[x.id]){g.open[x.id]=o;moving=true;}
  const wantW=want&&g.open[x.id]>.8?1:want?g.walk[x.id]:0;const w=follow(g.walk[x.id],wantW,dt,.3,.01);if(w!==g.walk[x.id]){g.walk[x.id]=w;moving=true;}}
 if(g.year>=1991)g.reached=true;return moving;}
export function settleGates(g:GateState){for(let i=0;i<600&&stepGates(g,1/30);i++){/* to rest */}return g;}
/** The rail: the lever's knob runs from x RAIL0 (1920) to RAIL1 (1991) along y = RAIL_Y. */
export const RAIL0=.6,RAIL1=12.6,RAIL_Y=4.6,RAIL_Z=.42;
export const yearAtX=(x:number)=>Math.round(clamp(YEAR0+(x-RAIL0)/(RAIL1-RAIL0)*(YEAR1-YEAR0),YEAR0,YEAR1));
export const xAtYear=(y:number)=>RAIL0+(clamp(y,YEAR0,YEAR1)-YEAR0)/(YEAR1-YEAR0)*(RAIL1-RAIL0);
/** What happened to the gates in this year, for the dock (the latest event at or before it). */
export function gateNews(year:number):{id:GateId|null;text:string;kind:'good'|'bad'|'info'}{
 if(year>=1991)return {id:'FIFA',text:'1991: FIFA’s first Women’s World Cup. The big gate opens: next stop, China.',kind:'good'};
 const ev:{y:number;i:number;on:boolean}[]=[];BANS.forEach((b,i)=>{ev.push({y:b.from,i,on:true},{y:b.to,i,on:false});});
 const last=ev.filter(e=>e.y<=year).sort((a,b)=>a.y-b.y).at(-1);
 if(!last)return {id:null,text:BANS[0].before??'1920: women’s teams play to big crowds.',kind:'info'};
 const b=BANS[last.i],id=GATES.find(g=>g.ban===last.i)!.id;
 return last.on?{id,text:`${b.country}, ${b.from}: ${b.banned} ${b.who}`,kind:'bad'}:{id,text:`${b.country}, ${b.to}: ${b.after}`,kind:'good'};}

export {FINAL_1991};
