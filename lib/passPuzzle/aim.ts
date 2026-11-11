/**
 * Aim anywhere in the goal (Nov 11 2026, owner: "allow to shoot anywhere on the goal ... top bins and in the corners").
 * Pure maths, no engine imports (sim.ts and the arcade both read it). A shot may carry `kick.place`: the spot on the goal
 * face the player pointed at (x across the line, y metres above the grass; it may be off the frame). The engine then:
 *  1. scatters the strike around that spot (deterministic for the puzzle state and aim): farther out, under pressure and
 *     higher all cost accuracy, so a top corner needs a clean chance and a low side-foot from close in is reliable;
 *  2. makes the keeper's save spatial: a high ball is reached less far and more slowly than a low one.
 * A shot WITHOUT `place` (a plain stroke to the goal) is untouched: same launch, same keeper, same result as before.
 * The football lesson: pick your spot away from the keeper; low into the corner is the safe finish; top bins is for when
 * you have time.
 */
import type {Kick,PuzzleState,Vec2} from './types';
import type {Geo} from './physics';

const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;

/** Below this height a pointed-at spot is simply the plain low shot (no `place`). */
export const AIM_LOW_Y=0.35;
/** How far off the frame the player may point (metres over the bar / wide of a post): those are honest misses. */
export const AIM_OVER=1.2, AIM_WIDE=1.2;
/** Pressure: 0 with the nearest defender 3.5 m or more from the shooter, 1 at 1 m or closer. */
export const PRESS_FAR=3.5, PRESS_NEAR=1.0;
/** Scatter radius (m at the goal) = (LOW + (1 − LOW) × height share) × (DIST × metres out + PRESS × pressure), capped. */
export const SCATTER_LOW=0.15, SCATTER_DIST=0.016, SCATTER_PRESS=0.45, SCATTER_MAX=1.5;
/** Keeper against a placed shot: from 0.9 m up to 2.0 m the reach shrinks by up to 50% and the dive across slows by up to 55%. */
export const KEEPER_HIGH_FROM=0.9, KEEPER_HIGH_SPAN=1.1, KEEPER_HIGH_REACH=0.5, KEEPER_HIGH_SPEED=0.55;

export type Place={x:number;y:number;
  /** Preview only (never recorded): the strike with no scatter, so the aim line shows the intent, not the dice. */
  ideal?:boolean};
/** What the engine resolved at the strike (kept on the flight for the keeper and the coaching line). */
export type PlacedShot={x:number;y:number;aimX:number;aimY:number;sigma:number;pressure:number;dist:number};

/** 0 = along the grass, 1 = just under the bar (the same scale as Kick.shotHeight). */
export function heightShare(geo:Geo,y:number):number{return clamp((y-0.3)/(geo.barH-0.55),0,1.25);}
/** The height (m) a 0..1 share stands for (0.3 m … bar − 0.25 m). */
export function heightOf(geo:Geo,share:number):number{return 0.3+clamp(share,0,1.25)*(geo.barH-0.55);}

/** 0..1 from the nearest defender to the shooter. */
export function shotPressure(defenders:{p:Vec2}[],from:Vec2):number{
  let near=1e9;for(const d of defenders){const q=Math.hypot(d.p.x-from.x,d.p.z-from.z);if(q<near)near=q;}
  return clamp((PRESS_FAR-near)/(PRESS_FAR-PRESS_NEAR),0,1);
}
/** Scatter radius in metres: monotone in distance, pressure and height. */
export function scatterSigma(dist:number,pressure:number,share:number):number{
  const h=clamp(share,0,1.25),p=clamp(pressure,0,1);
  return Math.min(SCATTER_MAX,(SCATTER_LOW+(1-SCATTER_LOW)*h)*(SCATTER_DIST*Math.max(0,dist)+SCATTER_PRESS*p));
}
/** A point in the unit disc from integers (no Math.random: the same state and aim always give the same strike). */
export function scatterUnit(...seed:number[]):{dx:number;dy:number}{
  let h=2166136261>>>0;
  for(const n of seed){let v=Math.round(n)|0;for(let i=0;i<4;i++){h^=v&255;h=Math.imul(h,16777619)>>>0;v>>=8;}}
  const next=()=>{h=(h+0x6D2B79F5)>>>0;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  const r=Math.sqrt(next()),a=next()*Math.PI*2;
  return {dx:r*Math.cos(a),dy:r*Math.sin(a)};
}
/** Clamp a pointed-at spot to what the player may aim at (the frame plus the honest-miss margin). */
export function clampPlace(geo:Geo,p:{x:number;y:number}):Place{
  return {x:clamp(p.x,-(geo.halfGoal+AIM_WIDE),geo.halfGoal+AIM_WIDE),y:clamp(p.y,AIM_LOW_Y,geo.barH+AIM_OVER)};
}
/** Where the strike really goes: the spot plus the scatter for this chance. */
export function resolvePlace(geo:Geo,s:PuzzleState,kick:Kick,kicker:number):PlacedShot|null{
  const pl=kick.place;if(kick.kind!=='shot'||!pl||!Number.isFinite(pl.x+pl.y))return null;
  const aim=clampPlace(geo,pl),b=s.ball.p,from=s.attackers[kicker]?.p??b;
  const dist=Math.hypot(aim.x-b.x,geo.goalZ-b.z),pressure=shotPressure(s.defenders,from);
  const sigma=scatterSigma(dist,pressure,heightShare(geo,aim.y));
  if(pl.ideal)return {x:aim.x,y:aim.y,aimX:aim.x,aimY:aim.y,sigma,pressure,dist};
  const u=scatterUnit(s.tick,b.x*100,b.z*100,aim.x*100,aim.y*100,kicker);
  return {x:aim.x+u.dx*sigma,y:Math.max(0.2,aim.y+u.dy*sigma),aimX:aim.x,aimY:aim.y,sigma,pressure,dist};
}

/** 0 below 0.9 m … 1 at 2.0 m and above: how "high" a ball is for a keeper. */
export function keeperHigh(y:number):number{return clamp((y-KEEPER_HIGH_FROM)/KEEPER_HIGH_SPAN,0,1);}
export function keeperReachScale(y:number):number{return 1-KEEPER_HIGH_REACH*keeperHigh(y);}
export function keeperSpeedScale(y:number):number{return 1-KEEPER_HIGH_SPEED*keeperHigh(y);}

/* ── the coaching line ── */
export type FinishKind='top-corner'|'low-corner'|'high'|'placed'|'at-keeper'|'keeper-across'|'post'|'bar'|'over'|'wide';
export type FinishStory={kind:FinishKind;line:string;
  /** True when the finish is the taught habit: a corner, away from the keeper. */
  corner:boolean};
/** Which part of the goal face a point is in. */
export function goalZone(geo:Geo,x:number,y:number):{side:-1|0|1;level:'low'|'mid'|'high';corner:boolean}{
  const side=Math.abs(x)>geo.halfGoal*0.45?(x>0?1:-1):0,level=y<1?'low':y>geo.barH*0.62?'high':'mid';
  return {side,level,corner:side!==0&&level!=='mid'};
}
/**
 * One short line that names what happened to a shot. `end` is how it finished, `at` where the ball was then,
 * `keeperX` where the keeper stood at the strike, `shot` the resolved placement (absent for a plain low shot).
 */
export function finishStory(geo:Geo,end:'goal'|'save'|'post'|'bar'|'out',at:{x:number;y:number},keeperX:number|null,shot?:PlacedShot|null,young=false):FinishStory{
  const stretched=!!shot&&(shot.pressure>=0.4||shot.dist>=22),z=goalZone(geo,at.x,at.y);
  const away=keeperX==null||Math.abs(keeperX)<0.3||Math.sign(at.x)!==Math.sign(keeperX)||Math.abs(at.x-keeperX)>geo.halfGoal*0.8;
  if(end==='goal'){
    if(z.corner&&z.level==='high')return {kind:'top-corner',corner:away,line:young?'Top bins! No keeper can reach up there.':'Top bins: no keeper reaches that corner.'};
    if(z.corner)return {kind:'low-corner',corner:away,line:young?'Low in the corner: the keeper could not get down in time.':'Low into the corner: the keeper could not get down in time.'};
    if(z.level==='high')return {kind:'high',corner:false,line:young?'Over the keeper’s hands and in!':'High over the keeper’s hands: a brave finish.'};
    return {kind:'placed',corner:false,line:keeperX==null?(young?'An open goal: nice and calm.':'An open goal, finished calmly.'):(young?'You shot away from the keeper.':'Placed away from the keeper.')};
  }
  if(end==='save'){
    if(keeperX!=null&&Math.abs((shot?shot.x:at.x)-keeperX)<1.6)return {kind:'at-keeper',corner:false,line:young?'Too close to the keeper. Pick a corner.':'Too close to the keeper: pick a corner away from them.'};
    return {kind:'keeper-across',corner:false,line:young?'The keeper got across. Shoot from closer, or go higher.':'The keeper got across: shoot from closer in, or lift it to the top corner.'};
  }
  if(end==='post')return {kind:'post',corner:false,line:young?'Off the post! Aim a little inside it.':'Off the post: aim a ball’s width inside it.'};
  if(end==='bar')return {kind:'bar',corner:false,line:young?'Off the bar! Aim a little lower.':'Off the bar: aim a touch under it.'};
  if(at.y>=geo.barH-0.2&&Math.abs(at.x)<=geo.halfGoal+0.4)return {kind:'over',corner:false,line:stretched?(young?'Over the bar: you were stretching. Go low when you are rushed.':'Over the bar: you were stretching. Far out or under pressure, keep it low.'):(young?'Over the bar. Aim under it.':'Over the bar: aim under it.')};
  return {kind:'wide',corner:false,line:stretched?(young?'Wide: that was a hard one. Get closer, then pick your corner.':'Wide: a rushed strike drifts. Get closer or make space, then pick the corner.'):(young?'Wide of the post. Aim inside it.':'Wide of the post: aim inside it.')};
}
/** The coaching line for an attempt that ended with a shot, read from its events (null when the last kick was not a shot). */
export function finishFromEvents(geo:Geo,events:{type:string;at:{x:number;y:number};kind?:string;keeper?:boolean;part?:'post'|'bar'}[],keeperX:number|null,shot?:PlacedShot|null,young=false):FinishStory|null{
  let k=-1;for(let i=events.length-1;i>=0;i--)if(events[i].type==='kick'){k=i;break;}
  if(k<0||events[k].kind!=='shot')return null;
  let wood:'post'|'bar'|null=null;
  for(let i=k+1;i<events.length;i++){const e=events[i];
    if(e.type==='woodwork')wood=e.part??'post';
    else if(e.type==='goal')return finishStory(geo,'goal',e.at,keeperX,shot,young);
    else if(e.type==='save'||e.type==='parry')return finishStory(geo,'save',e.at,keeperX,shot,young);
    else if(e.type==='out')return finishStory(geo,wood??'out',e.at,keeperX,shot,young);
    else if(e.type==='intercept'||e.type==='deflect'||e.type==='offside')return null;}
  return wood?finishStory(geo,wood,events[events.length-1].at,keeperX,shot,young):null;
}
/** The word on the aim panel for a pointed-at spot. */
export function aimWord(geo:Geo,x:number,y:number):string{
  if(y>geo.barH-0.12)return 'OVER';if(Math.abs(x)>geo.halfGoal-0.12)return 'WIDE';
  const z=goalZone(geo,x,y);return z.corner&&z.level==='high'?'TOP BINS':z.corner?'LOW CORNER':z.level==='high'?'HIGH':z.side?'':'';
}
