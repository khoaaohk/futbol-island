/**
 * Hall of Fame · the Legends Arena (Oct 10 2026, user: rebuild every exhibit as "an entertaining, immersive mini-game the child
 * has to ACT in … not just read"; docs/museum-pixel-iso.md). Pure rules: tests/museum-exp-hall-of-fame.cjs plays every game in
 * Node, and the stage, the readout and the result all come from these same numbers.
 *
 * One pitch, six positions, six skill games: each is the position's job turned into one action that has to be timed or aimed.
 *   save       Goalkeeper   tap where the shot will cross; the keeper dives at 5.2 m/s. Go before the strike and the striker
 *                           sees you and picks the other corner.
 *   overlap    Right-back   hold to sprint up the line past your winger, let go to cross: past the defender, before the byline.
 *   intercept  Centre-back  tap a spot to step in front of the striker; go once the passer winds up, not before (they'd see you).
 *   through    Midfielder   drag back and let go to pass through the gap as your team-mate starts the run; late and it closes.
 *   beat       Winger       fake inside, then burst outside while the defender is leaning; one fake works, two don't.
 *   finish     Striker      drag back and let go to shoot into the corner away from the keeper, before he sets and the
 *                           defender gets back. Harder shots beat the keeper but fly over above about 80% power.
 * Three tries per legend; each try is graded perfect / great / good (points) or early / late / miss (none, with the reason).
 *
 * World: metres; the goal line is x = 0 with the goal centred on y = 0 (the kit's 2:1 projection: x to the lower right, y to
 * the lower left). The midfield and wing games are laid out in a screen-aligned frame (u down the screen, v across it).
 * Reduced motion: time only moves when the player presses Wait (STEP s a press); the deciding action then resolves at once.
 */
export type GameId='save'|'overlap'|'intercept'|'through'|'beat'|'finish';
export type Grade='perfect'|'great'|'good'|'early'|'late'|'miss';
export type Phase='ready'|'live'|'done';
export type V={x:number;y:number};
export const TRIES=3,STEP=.25,SETTLE=1.1;
export const POINTS:Record<Grade,number>={perfect:100,great:70,good:40,early:0,late:0,miss:0};
export const GAME_OF:Record<string,GameId>={Goalkeeper:'save','Right-back':'overlap','Centre-back':'intercept',Midfielder:'through',Winger:'beat',Striker:'finish'};
export const good=(g:Grade)=>POINTS[g]>0;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const dist=(a:V,b:V)=>Math.hypot(a.x-b.x,a.y-b.y);
const R2=Math.SQRT1_2;
/** The screen-aligned frame: u runs down the screen (toward the viewer), v across it to the right. */
export const uv=(u:number,v:number):V=>({x:(u+v)*R2,y:(u-v)*R2});
export const toUV=(p:V)=>({u:(p.x+p.y)*R2,v:(p.x-p.y)*R2});
/** A tiny seeded generator (mulberry32): every try is replayable and testable. */
export function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

export type Pose='stand'|'run'|'kick'|'ready'|'dive'|'cheer'|'point';
export type Actor={id:string;team:'me'|'mate'|'opp'|'keeper';x:number;y:number;z:number;pose:Pose;facing:'front'|'back';flip:boolean};
export type Res={grade:Grade;points:number;why:string};

// ── Game data ────────────────────────────────────────────────────────────────────────────────────────────────────────────
type Save={kind:'save';strikeAt:number;ty:number;tz:number;dive:{y:number;at:number}|null;early:boolean;ky:number};
type Overlap={kind:'overlap';x:number;v:number;holding:boolean;passAt:number|null;got:boolean;crossX:number|null;dx:number};
type Intercept={kind:'intercept';passAt:number;target:'a'|'b';goal:V|null;movedAt:number|null;cb:V;early:boolean;cut:number|null};
type Through={kind:'through';runAt:number;passAt:number|null;dir:V;len:number;mate:V;d1:V;d2:V;stopAt:number|null;got:boolean};
type Beat={kind:'beat';fakes:number[];burstAt:number|null;lean:number;me:V};
type Finish={kind:'finish';shot:{ty:number;power:number;h:number;at:number;reach:number;ky:number}|null;def:V;keeper:V};
export type Data=Save|Overlap|Intercept|Through|Beat|Finish;
export type Att={game:GameId;seed:number;t:number;phase:Phase;tDone:number;res:Res|null;ball:{x:number;y:number;z:number};g:Data;
 /** The aim marker the player is setting (tap games) or the pull of a slingshot drag (pass and shot games). */
 aim:V|null;pull:V|null};

// ── Save (goalkeeper) ────────────────────────────────────────────────────────────────────────────────────────────────────
export const SAVE={spot:{x:11,y:0},flight:1.05,speed:5.2,react:.08,reach:1.05,early:.12,half:3.66};
// ── Overlap (right-back): byline x = 0, touchline y = 30, the run along the lane y = LANE ──────────────────────────────────
export const OVER={lane:28.6,start:18.5,mate:{x:11.5,y:29.4},def:{x:8.5,y:28.1},top:7,acc:14,brake:10,zone:[2,7.2] as const,sweet:[3,6] as const,block:8.5,out:.3};
// ── Intercept (centre-back) ──────────────────────────────────────────────────────────────────────────────────────────────
export const INT={passer:uv(2,-2),a:uv(19,3),b:uv(16,-6.5),cb:uv(11,5),ball:8,speed:5.6,windup:.35,touch:.85};
// ── Through ball (midfielder) ────────────────────────────────────────────────────────────────────────────────────────────
export const THR={me:uv(4,0),d1:uv(12,-3.2),d2:uv(12,3.2),mate0:uv(10.5,7),mate1:uv(20,1.5),run:6.5,ball:11,close:1.6,closeAfter:.9,minGap:1.4,touch:1.5,block:.9};
// ── Beat (winger) ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const BEAT={me:uv(6,2),def:uv(10.5,2),out:uv(16,5),wait:4};
// ── Finish (striker) ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const FIN={me:{x:13,y:-2.5},ball:{x:12.3,y:-2.2},k0:{x:2.6,y:-1.6},k1:{x:1.2,y:-.2},set:1.4,def0:{x:19.5,y:1.5},defSpeed:3.4,tackle:.9,bar:2.44,half:3.66};

export function newAttempt(game:GameId,seed:number):Att{
 const r=rng(seed),base={game,seed,t:0,phase:'ready' as Phase,tDone:0,res:null,aim:null,pull:null};
 switch(game){
  case 'save':{const side=r()<.5?-1:1;return {...base,ball:{...SAVE.spot,z:0},g:{kind:'save',strikeAt:1+r()*.8,ty:side*(1.3+r()*2),tz:.3+r()*1.4,dive:null,early:false,ky:0}};}
  case 'overlap':return {...base,ball:{x:OVER.mate.x-.6,y:OVER.mate.y,z:0},g:{kind:'overlap',x:OVER.start,v:0,holding:false,passAt:null,got:false,crossX:null,dx:0}};
  case 'intercept':{const b=uv(2.6,-1.2);return {...base,ball:{...b,z:0},g:{kind:'intercept',passAt:1.2+r()*.8,target:'a',goal:null,movedAt:null,cb:{...INT.cb},early:false,cut:null}};}
  case 'through':{const b=uv(4.7,.3);return {...base,ball:{...b,z:0},g:{kind:'through',runAt:.9+r()*.8,passAt:null,dir:{x:0,y:0},len:0,mate:{...THR.mate0},d1:{...THR.d1},d2:{...THR.d2},stopAt:null,got:false}};}
  case 'beat':{const b=uv(6.7,2);return {...base,ball:{...b,z:0},g:{kind:'beat',fakes:[],burstAt:null,lean:0,me:{...BEAT.me}}};}
  case 'finish':return {...base,ball:{...FIN.ball,z:0},g:{kind:'finish',shot:null,def:{...FIN.def0},keeper:{...FIN.k0}}};
 }
}

/** The keeper's reach while he sets (striker game): 0.9 m off balance → 2.1 m set; a harder shot gives him less time. */
export const keeperReach=(t:number,power:number)=>(.9+1.2*clamp(t/FIN.set,0,1))*(1-.45*power);
/** Shot height at the goal line from power (as the kit demo): past ~0.8 it clears the bar. */
export const shotHeight=(power:number)=>.25+power*2.7;
/** Defender lean after a fake (winger game): rises from 0.15 s, peaks 0.5–0.7 s, gone by 1.3 s. A second fake works half as well. */
export function leanAt(fakes:readonly number[],t:number){let best=0;
 fakes.forEach((f,i)=>{const s=t-f,amp=i===0?1:.5;let l=0;if(s>.15&&s<=.5)l=(s-.15)/.35;else if(s>.5&&s<=.7)l=1;else if(s>.7&&s<1.3)l=1-(s-.7)/.6;best=Math.max(best,l*amp);});
 return best;}
/** Slingshot: pulling back by `pull` (world metres) aims the other way. Power 0…1 from the pull's length. */
export function sling(pull:V){const len=Math.hypot(pull.x,pull.y);if(len<.3)return null;return {dir:{x:-pull.x/len,y:-pull.y/len},power:clamp((len-.3)/3.6,0,1)};}
/** Where a shot from the ball crosses the goal line (y), or null when it isn't going toward the goal. */
export function crossing(from:V,dir:V){if(dir.x>-.05)return null;const t=-from.x/dir.x;return from.y+dir.y*t;}
/** Through ball: how far it rolls (m). */
export const passLength=(power:number)=>7+power*15;

const finish=(a:Att,grade:Grade,why:string)=>{if(a.res)return;a.res={grade,points:POINTS[grade],why};a.phase='done';a.tDone=a.t;};
const gradeBy=(v:number,p:number,g:number,gd:number):Grade|null=>v<=p?'perfect':v<=g?'great':v<=gd?'good':null;

/** Start a try (the first press or tap). */
export function start(a:Att){if(a.phase==='ready')a.phase='live';}

/** The player acts. Returns true when the action decides the try (the caller then lets the motion play out). */
export type Act={kind:'tap';p:V}|{kind:'press'}|{kind:'release'}|{kind:'fling';pull:V}|{kind:'fake'}|{kind:'burst'};
export function act(a:Att,x:Act):boolean{
 if(a.phase==='done')return false;
 const g=a.g,t=a.t;
 // From the ready line, the first tap or drag only kicks the try off; a press (run) or a fake is already the move.
 if(a.phase==='ready'){start(a);if(x.kind!=='press'&&x.kind!=='fake')return false;}
 switch(g.kind){
  case 'save':{if(x.kind!=='tap'||g.dive)return false;const y=clamp(x.p.y,-4,4);g.dive={y,at:t};a.aim={x:0,y};
   if(t<g.strikeAt-SAVE.early){g.early=true;if(Math.abs(y)>.4)g.ty=-Math.sign(y)*Math.abs(g.ty);}return true;}
  case 'overlap':{if(x.kind==='press'){g.holding=true;return false;}
   if(x.kind==='release'&&g.holding){g.holding=false;
    if(!g.got){finish(a,'early','You stopped before the pass was on. Keep running past your winger!');return true;}
    g.crossX=g.x;a.ball={x:g.x-.4,y:OVER.lane,z:0};
    if(g.x>OVER.block)finish(a,'early','Too early: the defender was still in the way and blocked the cross.');
    else{const gr=gradeBy(Math.abs(g.x-(OVER.sweet[0]+OVER.sweet[1])/2),1.5,2.6,4.2)??'good';finish(a,gr,gr==='perfect'?'Overlap and cross, right on time!':'Cross is in! Get a little closer to the byline for a perfect one.');}
    return true;}return false;}
  case 'intercept':{if(x.kind!=='tap')return false;const u=toUV(x.p),p=uv(clamp(u.u,1,21),clamp(u.v,-8,7));g.goal=p;a.aim=p;
   if(g.movedAt==null){g.movedAt=t;if(t<g.passAt-INT.windup){g.early=true;const da=dist(p,INT.a),db=dist(p,INT.b);g.target=da<db?'b':'a';}return true;}return false;}
  case 'through':{if(x.kind!=='fling'||g.passAt!=null)return false;const s=sling(x.pull);if(!s)return false;
   g.passAt=t;g.dir=s.dir;g.len=passLength(s.power);a.pull=null;return true;}
  case 'beat':{if(g.burstAt!=null)return false;
   if(x.kind==='fake'){g.fakes.push(t);return false;}
   if(x.kind==='burst'){g.burstAt=t;const L=leanAt(g.fakes,t),gr=gradeBy(1-L,.15,.4,.65);
    if(gr)finish(a,gr,gr==='perfect'?'Beaten! You went just as the defender leaned the wrong way.':'Past him! Burst a moment closer to the lean for a perfect one.');
    else if(!g.fakes.length)finish(a,'early','Tackled! Sell a fake first, then go the other way.');
    else{const last=g.fakes[g.fakes.length-1];finish(a,t-last<.4?'early':'late',t-last<.4?'Too early: the defender hadn’t bitten on the fake yet.':g.fakes.length>1?'Late: he didn’t bite twice. One good fake, then go!':'Too late: the defender got his balance back.');}
    return true;}return false;}
  case 'finish':{if(x.kind!=='fling'||g.shot)return false;const s=sling(x.pull);if(!s)return false;const ty=crossing(FIN.ball,s.dir);if(ty==null)return false;
   const h=shotHeight(s.power),reach=keeperReach(t,s.power),ky=g.keeper.y;g.shot={ty,power:s.power,h,at:t,reach,ky};a.pull=null;return true;}
 }
 return false;
}

/** Advance the try by dt seconds (motion, the script, and the result when it is decided). */
export function step(a:Att,dt:number){
 if(a.phase==='ready')return;
 a.t+=dt;const t=a.t,g=a.g;
 switch(g.kind){
  case 'save':{const f=(t-g.strikeAt)/SAVE.flight;
   if(g.dive&&t>g.dive.at+SAVE.react){const d=g.dive.y-g.ky,mv=SAVE.speed*dt;g.ky+=Math.abs(d)<=mv?d:Math.sign(d)*mv;}
   if(f>=0){const u=Math.min(1,f);a.ball={x:lerp(SAVE.spot.x,0,u),y:lerp(0,g.ty,u),z:lerp(0,g.tz,u)+Math.sin(u*Math.PI)*.6};}
   if(f>=1&&!a.res){const err=Math.abs(g.ky-g.ty),gr=gradeBy(err,.35,.7,SAVE.reach);
    if(gr)finish(a,gr,gr==='perfect'?'Saved, right on the ball!':'Saved! Push off a little sooner to get right behind it.');
    else if(g.early)finish(a,'early','Too early! You went before the shot, so the striker picked the other corner.');
    else if(!g.dive)finish(a,'late','Goal! Tap where the ball is going as soon as it is struck.');
    else if(Math.sign(g.dive.y)!==Math.sign(g.ty)&&Math.abs(g.dive.y)>.4)finish(a,'miss','Wrong way! Watch the ball off the striker’s boot.');
    else finish(a,'late','Just too late: dive the moment the ball is struck.');}
   if(a.res&&f>1){const e=Math.min(1,(f-1)*2.2),saved=good(a.res.grade);a.ball=saved?{x:e*2.4,y:g.ty+Math.sign(g.ty||1)*e*1.6,z:g.tz*(1-e)}:{x:-1.6*e,y:g.ty,z:g.tz*(1-e)};}
   return;}
  case 'overlap':{
   if(!a.res){g.v=g.holding?Math.min(OVER.top,g.v+OVER.acc*dt):Math.max(0,g.v-OVER.brake*dt);g.x-=g.v*dt;
    if(g.passAt==null&&g.x<OVER.mate.x+1.2){g.passAt=t;}
    if(g.passAt!=null&&!g.got){const tx=g.x-.5,ty=OVER.lane,d=Math.hypot(tx-a.ball.x,ty-a.ball.y),mv=11*dt;
     if(d<=Math.max(mv,.5)){g.got=true;}else{a.ball={x:a.ball.x+(tx-a.ball.x)/d*mv,y:a.ball.y+(ty-a.ball.y)/d*mv,z:0};}}
    if(g.got)a.ball={x:g.x-.55,y:OVER.lane,z:0};
    if(g.x<=OVER.out&&g.got)finish(a,'late','Too late: the ball ran out over the byline. Cross before the end of the pitch!');
    if(g.x<=OVER.out&&!g.got)finish(a,'late','Too late: you ran out of pitch.');
   }else{const c=g.crossX;g.v=Math.max(0,g.v-OVER.brake*dt);g.x-=g.v*dt;
    if(c!=null){const e=Math.min(1,(t-a.tDone)/.9);const blocked=a.res.grade==='early';
     a.ball=blocked?{x:c-.4+e*1.6,y:OVER.lane+e*2,z:Math.sin(e*Math.PI)*.4}:{x:lerp(c-.4,c-2.5,e),y:lerp(OVER.lane,OVER.lane-14,e),z:Math.sin(e*Math.PI)*3.2};}}
   return;}
  case 'intercept':{const T=g.passAt,to=g.target==='a'?INT.a:INT.b,from=INT.passer;
   if(g.goal&&!g.cut){const d=dist(g.cb,g.goal),mv=INT.speed*dt;if(d>1e-3){const k=Math.min(1,mv/d);g.cb={x:g.cb.x+(g.goal.x-g.cb.x)*k,y:g.cb.y+(g.goal.y-g.cb.y)*k};}}
   if(g.cut!=null){const e=Math.min(1,(t-a.tDone)/.5);a.ball={x:g.cb.x+.6*e,y:g.cb.y+.6*e,z:0};return;}
   if(t>=T&&!a.res){const L=dist(from,to),s=Math.min(L,(t-T)*INT.ball),k=s/L,b0=uv(2.6,-1.2);
    a.ball={x:lerp(b0.x,to.x,k),y:lerp(b0.y,to.y,k),z:0};
    if(g.movedAt!=null&&dist(g.cb,a.ball)<INT.touch){g.cut=k;const gr=k<.55?'perfect':k<.8?'great':'good';
     finish(a,gr,gr==='perfect'?'Intercepted! You read the pass before it was played.':'Cut out! Step in a moment sooner to win it further from goal.');}
    else if(k>=1)finish(a,g.early?'early':g.movedAt==null?'late':'late',g.early?'Too early: the passer saw you coming and passed to the other striker.':g.movedAt==null?'Their striker has it. Tap the passing line as soon as the passer winds up!':'Too late: their striker got there first.');}
   else if(t<T)a.ball={...uv(2.6,-1.2),z:0};
   return;}
  case 'through':{
   // the mate's run, the defenders closing the gap once the moment has gone
   if(t>g.runAt&&!g.got){const L=dist(THR.mate0,THR.mate1),s=Math.min(L,(t-g.runAt)*THR.run);g.mate={x:lerp(THR.mate0.x,THR.mate1.x,s/L),y:lerp(THR.mate0.y,THR.mate1.y,s/L)};
    if(g.passAt!=null&&dist(g.mate,a.ball)<3){const d=dist(g.mate,a.ball),mv=THR.run*dt*.6;if(d>.01){g.mate.x+=(a.ball.x-g.mate.x)/d*Math.min(mv,d);g.mate.y+=(a.ball.y-g.mate.y)/d*Math.min(mv,d);}}}
   if(t>g.runAt+THR.closeAfter){const c1=toUV(g.d1),c2=toUV(g.d2),gap=c2.v-c1.v;if(gap>THR.minGap){const mv=THR.close*dt;g.d1=uv(c1.u,c1.v+mv);g.d2=uv(c2.u,c2.v-mv);}}
   if(g.passAt!=null&&!a.res){const s=Math.min(g.len,(t-g.passAt)*THR.ball),b0=THR.me;const bx=uv(4.7,.3);void b0;
    a.ball={x:bx.x+g.dir.x*s,y:bx.y+g.dir.y*s,z:0};if(s>=g.len&&g.stopAt==null)g.stopAt=t;
    const late=g.passAt>g.runAt+THR.closeAfter;
    if(dist(a.ball,g.d1)<THR.block||dist(a.ball,g.d2)<THR.block)finish(a,late?'late':g.passAt<g.runAt?'early':'miss',late?'Too late: the gap closed and a defender cut it out.':g.passAt<g.runAt?'Too early, and into a defender. Wait for the run!':'Into a defender! Aim for the middle of the gap.');
    else if(dist(a.ball,g.mate)<THR.touch&&toUV(a.ball).u>toUV(g.d1).u){g.got=true;const dt0=g.passAt-g.runAt,gr=dt0<0?'good':dt0<=.5?'perfect':dt0<=.9?'great':'good';
     finish(a,gr,gr==='perfect'?'Through! One pass took two defenders out of the game.':dt0<0?'Through, just! Next time wait until your team-mate starts running.':'Through! Play it a moment sooner, as the run starts.');}
    else if(g.stopAt!=null&&t>g.stopAt+.9)finish(a,g.passAt<g.runAt?'early':late?'late':'miss',g.passAt<g.runAt?'Too early: your team-mate wasn’t running yet.':late?'Too late: the gap had closed.':'Not quite into the run: aim where your team-mate is going, not where they are.');}
   if(a.res&&g.got){const e=Math.min(1,(t-a.tDone)/.6);a.ball={x:g.mate.x+.4*e,y:g.mate.y+.4*e,z:0};}
   if(g.passAt==null&&!a.res&&t>g.runAt+3)finish(a,'late','Too late: the run is over and the gap has closed.');
   return;}
  case 'beat':{const L=leanAt(g.fakes,t),lastFake=g.fakes[g.fakes.length-1];g.lean=L;
   if(g.burstAt==null){const shimmy=lastFake!=null&&t-lastFake<.45?Math.sin((t-lastFake)/.45*Math.PI)*.8:0;const c=toUV(BEAT.me);g.me=uv(c.u,c.v-shimmy);a.ball={...uv(c.u+.7,c.v-shimmy),z:0};
    if(!a.res&&t>(lastFake??0)+BEAT.wait)finish(a,'late','Too slow: the defender stepped in and took the ball.');}
   else{const e=Math.min(1,(t-g.burstAt)/.9),ok=a.res&&good(a.res.grade),c=toUV(BEAT.me),o=toUV(BEAT.out);
    g.me=ok?uv(lerp(c.u,o.u,e),lerp(c.v,o.v,e)):uv(c.u+e*1.4,c.v+e*.8);a.ball=ok?{...uv(lerp(c.u+.7,o.u+.8,e),lerp(c.v,o.v,e)),z:0}:{...uv(lerp(c.u+1,10.5,e),lerp(c.v,2.4,e)),z:0};}
   return;}
  case 'finish':{const k=clamp(t/FIN.set,0,1);
   if(!g.shot){g.keeper={x:lerp(FIN.k0.x,FIN.k1.x,k),y:lerp(FIN.k0.y,FIN.k1.y,k)};
    const d=dist(g.def,FIN.me),mv=FIN.defSpeed*dt;if(d>FIN.tackle){g.def={x:g.def.x+(FIN.me.x-g.def.x)/d*mv,y:g.def.y+(FIN.me.y-g.def.y)/d*mv};}
    else if(!a.res){finish(a,'late','Tackled! Shoot before the defender gets back.');}
    if(a.res){const e=Math.min(1,(t-a.tDone)/.5);a.ball={x:FIN.ball.x+e*2,y:FIN.ball.y+e*1.5,z:0};}
    return;}
   const s=g.shot,T=lerp(1.1,.55,s.power),u=clamp((t-s.at)/T,0,1);
   a.ball={x:lerp(FIN.ball.x,0,u),y:lerp(FIN.ball.y,s.ty,u),z:lerp(0,s.h,u)+Math.sin(u*Math.PI)*(.5+s.power*.4)};
   const dv=clamp((u-.35)/.6,0,1);g.keeper={x:FIN.k1.x*(1-k)+g.keeper.x*k,y:s.ky+clamp(s.ty-s.ky,-s.reach,s.reach)*dv};
   if(u>=1&&!a.res){const wide=Math.abs(s.ty)>FIN.half-.11,over=s.h>FIN.bar-.11,saved=!wide&&!over&&Math.abs(s.ty-s.ky)<=s.reach&&s.h<2.1;
    if(wide)finish(a,'miss','Wide! Aim inside the posts.');else if(over)finish(a,'miss','Over the bar! A little softer: past 80% power it flies.');
    else if(saved)finish(a,'miss','Saved! Aim for the corner the keeper can’t reach.');
    else{const m=Math.abs(s.ty-s.ky)-s.reach,gr=m>=1?'perfect':m>=.4?'great':'good';finish(a,gr,gr==='perfect'?'Goal! Right in the corner, out of reach.':'Goal! Even further from the keeper for a perfect one.');}}
   if(a.res&&u>=1){const e=clamp((t-s.at-T)/.4,0,1),scored=good(a.res.grade);
    a.ball=scored?{x:-1.7*e,y:s.ty,z:s.h*(1-e)}:a.res.why.startsWith('Saved')?{x:1.8*e,y:s.ty+Math.sign(s.ty-s.ky||1)*e,z:s.h*(1-e)}:{x:-2.6*e,y:s.ty,z:s.h+(a.res.why.startsWith('Over')?.8*e:-s.h*e)};}
   return;}
 }
}
/** True while the try still needs frames (the clock is running, or the result's motion is still playing out). */
export const moving=(a:Att)=>a.phase==='live'||(a.phase==='done'&&a.t<a.tDone+SETTLE);
/** Run a try to its end in fixed steps (reduced motion after the deciding action; tests). */
export function settle(a:Att,max=12){const n=Math.ceil(max*30);for(let i=0;i<n&&moving(a);i++)step(a,1/30);return a;}

/** Everyone on the pitch for a try (the scene draws these). `me` is the legend. */
export function actors(a:Att):Actor[]{
 const g=a.g,t=a.t,A=(id:string,team:Actor['team'],p:V,pose:Pose,facing:Actor['facing']='front',flip=false,z=0):Actor=>({id,team,x:p.x,y:p.y,z,pose,facing,flip});
 const runF=(on:boolean)=>on?'run':'stand';
 switch(g.kind){
  case 'save':{const runUp=a.phase!=='ready'&&t<g.strikeAt,u=clamp(t/g.strikeAt,0,1),sx=lerp(13.6,11.5,u),sy=lerp(-1.6,-.5,u);
   const diving=!!g.dive&&t>g.dive.at+SAVE.react&&Math.abs(g.dive.y)>.7,saved=a.res&&good(a.res.grade);
   return [A('keeper','me',{x:.7,y:g.ky},diving?'dive':saved&&t>a.tDone+.4?'cheer':'ready','front',(g.dive?.y??0)<0,diving?.25:0),
    A('striker','opp',{x:sx,y:sy},runUp?'run':t<g.strikeAt+.3&&a.phase!=='ready'?'kick':'stand','back',true)];}
  case 'overlap':{const def=a.res&&a.res.grade==='early'?{x:OVER.def.x-.2,y:OVER.lane+.4}:g.passAt!=null?{x:lerp(OVER.def.x,8,clamp((t-g.passAt)/1.2,0,1)),y:lerp(OVER.def.y,OVER.lane-.3,clamp((t-g.passAt)/1.2,0,1))}:OVER.def;
   return [A('rb','me',{x:g.x,y:OVER.lane},a.res&&g.crossX!=null&&t<a.tDone+.3?'kick':g.v>.5?'run':a.res&&good(a.res.grade)&&t>a.tDone+.6?'cheer':'stand','back',false),
    A('winger','mate',OVER.mate,g.passAt!=null&&t<g.passAt+.3?'kick':'stand','back',true),A('defender','opp',def,g.passAt!=null&&!a.res?'run':'ready','front',false)];}
  case 'intercept':{const T=g.passAt,wind=a.phase!=='ready'&&t>=T-INT.windup&&t<T+.25,moving_=g.goal!=null&&dist(g.cb,g.goal)>.05&&!g.cut;
   const cutOk=a.res&&good(a.res.grade);
   return [A('cb','me',g.cb,cutOk&&t>a.tDone+.3?'cheer':moving_?'run':'ready','back',false),A('passer','opp',INT.passer,wind?'kick':'stand','front',false),
    A('s1','opp',INT.a,g.target==='a'&&a.res&&!cutOk?'cheer':'stand','back',true),A('s2','opp',INT.b,g.target==='b'&&a.res&&!cutOk?'cheer':'stand','back',false)];}
  case 'through':{const passing=g.passAt!=null&&t<g.passAt+.3,ok=a.res&&good(a.res.grade);
   return [A('mid','me',THR.me,passing?'kick':ok&&t>a.tDone+.3?'point':'stand','front',false),A('mate','mate',g.mate,t>g.runAt&&!a.res?'run':ok?'cheer':'stand','front',true),
    A('d1','opp',g.d1,'ready','back',false),A('d2','opp',g.d2,'ready','back',true)];}
  case 'beat':{const lean=g.lean,c=toUV(BEAT.def),ok=a.res&&good(a.res.grade),tackle=a.res&&!good(a.res.grade);
   const dp=tackle?uv(c.u-.6,c.v):uv(c.u,c.v-lean*1.1);
   return [A('wing','me',g.me,g.burstAt!=null?(ok?'run':'stand'):g.fakes.length&&t-g.fakes[g.fakes.length-1]<.45?'kick':'stand','front',g.burstAt==null&&g.fakes.length>0&&t-g.fakes[g.fakes.length-1]<.45),
    A('defender','opp',dp,tackle?'kick':lean>.5?'dive':'ready','back',true,0)];}
  case 'finish':{const shooting=!!g.shot&&t<g.shot.at+.3,ok=a.res&&good(a.res.grade),diving=!!g.shot&&t>g.shot.at+.2&&Math.abs(g.keeper.y-g.shot.ky)>.6;
   return [A('striker','me',FIN.me,shooting?'kick':ok&&t>a.tDone+.2?'cheer':'stand','back',true),A('keeper','keeper',g.keeper,diving?'dive':'ready','front',(g.shot?.ty??0)<(g.shot?.ky??0)),
    A('defender','opp',g.def,a.res?.why.startsWith('Tackled')?'kick':a.phase==='live'?'run':'stand','back',true)];}
 }
}
/** Where each game happens on the pitch: its local frame's origin in stadium metres (the save, overlap and finish are laid out in
 *  stadium metres already; the midfield games sit in the other half, the 1-v-1 out on the wing). */
export const ORIGIN:Record<GameId,V>={save:{x:0,y:0},overlap:{x:0,y:0},finish:{x:0,y:0},intercept:{x:62,y:-8},through:{x:62,y:-8},beat:{x:60,y:22}};
/** Where the camera looks for each game (a point in the game's own frame at the stage's centre). */
export const FOCUS:Record<GameId,{x:number;y:number;nudge:number}>={
 save:{x:5.2,y:0,nudge:10},overlap:{x:8,y:26,nudge:6},intercept:{...uv(10.5,-.5),nudge:10},through:{...uv(12,1.6),nudge:8},beat:{...uv(10.5,2.6),nudge:8},finish:{x:6,y:-1,nudge:10},
};

/** Score for a legend's round (three tries): 0–300, and stars 0–3. */
export const roundScore=(rs:readonly Res[])=>rs.reduce((s,r)=>s+r.points,0);
export const stars=(score:number)=>score>=250?3:score>=170?2:score>=90?1:0;
export const title=(total:number)=>total>=1500?'Hall of famer':total>=1050?'International':total>=600?'First team':'Academy';
export const BEST_KEY='fi2-museum-hof-arena-v1';
export type Bests=Record<string,number>;
/** The saved best score per legend (this browser only); junk is dropped. */
export function sanitizeBests(v:unknown,ids:readonly string[]):Bests{const out:Bests={};if(!v||typeof v!=='object')return out;
 for(const id of ids){const n=(v as Record<string,unknown>)[id];if(typeof n==='number'&&Number.isFinite(n))out[id]=clamp(Math.round(n),0,TRIES*100);}return out;}
