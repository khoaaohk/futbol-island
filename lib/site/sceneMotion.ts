import {PITCH} from './pitch';
import type {Scene} from './scenes';
/**
 * Animated scene diagrams (Nov 15 2026, owner item 6: "animated diagrams" for 2v1, give-and-go, through ball, cutback, offside,
 * overlap and pressing). Pure: turns a scene's own runs (dashed arrows) and passes (solid arrows) into CSS keyframes, so the
 * players and the ball move along the arrows the still picture already draws. No new data, no library, no script per frame:
 * the browser runs a CSS transform loop on a few SVG dots. The still picture (the scene as drawn) is what prefers-reduced-motion,
 * print and the PNG show; the keyframes are offsets FROM that picture.
 *
 * Timeline, in beats of BEAT seconds: a run that starts on the ball is a dribble and goes first (the ball moves with it); then the
 * passes, one beat each, in order. Every other run starts at 0 and ends when the pass that lands where the run ends arrives (the
 * give-and-go runner meets the return pass), or at the end of the move. Then a hold, then everyone walks back to the start.
 */
export const BEAT=1.1,HOLD=1.4,RESET=.6;
/** The scenes that animate (terms by slug, rules by slug). Only these pages get the moving version. */
export const ANIMATED_TERMS=['two-v-one','give-and-go','through-ball','cutback','overlap','pressing'] as const;
export const ANIMATED_RULES=['offside'] as const;
type Key={t:number;x:number;y:number};
type Track={sel:string;keys:Key[]};
const near=(a:readonly [number,number],b:readonly [number,number],d:number)=>Math.hypot(a[0]-b[0],a[1]-b[1])<=d;
export type SceneMotion={duration:number;tracks:Track[];css:string};
/** The CSS for one animated scene inside the element with id `root` (null when the scene has nothing to move). */
export function sceneMotion(scene:Scene,root:string):SceneMotion|null{
 if(!scene.runs.length&&!scene.passes.length)return null;
 const p=PITCH[scene.format],W=p.px,H=Math.round(p.l*(W/p.w));
 const px=(dx:number,dy:number)=>({x:+(dx/100*W).toFixed(1),y:+(-dy/100*H).toFixed(1)});
 const ball=scene.ball;
 const used=new Set<number>();
 const owner=(from:readonly [number,number])=>{let best=-1,d=9;scene.spots.forEach((s,i)=>{if(used.has(i))return;const e=Math.hypot(s.x-from[0],s.y-from[1]);if(e<=d){d=e;best=i;}});if(best>=0)used.add(best);return best;};
 const dribble=ball?scene.runs.find(r=>near(r.from,ball,4)):undefined;
 const offset=dribble?1:0,moveEnd=Math.max(1,offset+scene.passes.length);
 const tracks:Track[]=[];
 const playerTrack=(i:number,from:readonly [number,number],to:readonly [number,number],t0:number,t1:number)=>{
  const s=scene.spots[i],a=px(from[0]-s.x,from[1]-s.y),b=px(to[0]-s.x,to[1]-s.y);
  tracks.push({sel:`[data-i="${i}"]`,keys:[{t:0,...a},{t:t0,...a},{t:t1,...b},{t:moveEnd,...b}]});
 };
 if(dribble){const i=owner(dribble.from);if(i>=0)playerTrack(i,dribble.from,dribble.to,0,1);}
 for(const r of scene.runs){if(r===dribble)continue;const i=owner(r.from);if(i<0)continue;
  const k=scene.passes.findIndex(q=>near(q.to,r.to,8));playerTrack(i,r.from,r.to,0,k>=0?offset+k+1:moveEnd);}
 if(ball){
  const at=(q:readonly [number,number])=>px(q[0]-ball[0],q[1]-ball[1]);
  const keys:Key[]=[{t:0,x:0,y:0}];
  if(dribble){const end=at([dribble.to[0]+ball[0]-dribble.from[0],dribble.to[1]+ball[1]-dribble.from[1]]);keys.push({t:1,...end});}
  scene.passes.forEach((q,k)=>{keys.push({t:offset+k,...at(q.from)},{t:offset+k+1,...at(q.to)});});
  keys.push({...keys[keys.length-1],t:moveEnd});
  tracks.push({sel:'[data-ball]',keys});
 }
 const duration=+(moveEnd*BEAT+HOLD+RESET).toFixed(2),pct=(sec:number)=>+(sec/duration*100).toFixed(2);
 const css=tracks.map((tr,n)=>{
  const name=`${root}-m${n}`,frames=[...tr.keys.map(k=>({p:pct(k.t*BEAT),x:k.x,y:k.y})),{p:pct(moveEnd*BEAT+HOLD),x:tr.keys[tr.keys.length-1].x,y:tr.keys[tr.keys.length-1].y},{p:100,x:tr.keys[0].x,y:tr.keys[0].y}];
  const seen=new Set<number>(),body=frames.filter(f=>!seen.has(f.p)&&seen.add(f.p)).map(f=>`${f.p}%{transform:translate(${f.x}px,${f.y}px)}`).join('');
  return `@keyframes ${name}{${body}}#${root} ${tr.sel}{animation:${name} ${duration}s ease-in-out infinite}`;
 }).join('');
 return {duration,tracks,css};
}
