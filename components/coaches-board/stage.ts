import {GLIDE,STEP,VelocityTracker,clampTo,projectRest,rubber,separate,snapGrid,snapSlots,stepBody,type Body} from '@/lib/coaches/board/physics';
import {arrowCurve,positionsAt,toM,type M,type Move} from '@/lib/coaches/board/play';
import {chipBounds,type PitchSpec,type Rect} from '@/lib/coaches/board/pitch';
import {arrowPaths,trimQuad,type P} from '@/lib/coaches/board/render';
import {toModel,toScreen,type View} from '@/lib/coaches/board/view';
import type {Arrow,Play} from '@/lib/coaches/board/types';

/**
 * The tactics board's only animation loop (heat: docs/performance-guide.md, Oct 9 2026). React renders the board's
 * structure; this stage owns every chip's transform and the path of every arrow attached to a chip, and runs
 * requestAnimationFrame only while a finger is dragging, a chip is gliding or settling, or a play is running. At rest it
 * schedules nothing (tests/coaches-board.cjs and the headless rAF count check it).
 *
 * Positions are kept in pitch metres, so a resize or rotation just repaints. Chips are DOM buttons moved with
 * translate3d (compositor-only while they move; `data-moving` adds will-change only then), arrows are SVG paths.
 */
const FAST={omega:40,zeta:1};
export type Scene={play:Play;step:number;spec:PitchSpec;view:View;r:number;ballR:number;snap:'off'|'grid'|'shape';slots:M[]};
type ArrowEls={body:SVGPathElement;under:SVGPathElement;head:SVGPathElement;hit:SVGPathElement};
export type StageHooks={onStep?:(i:number)=>void;onPlayEnd?:(t:number)=>void;onFrame?:(t:number)=>void};

export class Stage{
 scene:Scene|null=null;
 private bodies=new Map<string,Body&{on:boolean}>();
 private chips=new Map<string,HTMLElement>();
 private arrows=new Map<string,ArrowEls>();
 private arrowLayer:SVGGElement|null=null;
 private raf=0;private last=0;
 /** Counts frames (exposed for the headless rest check as window.__coachBoard.frames). */
 frames=0;
 private drag:{ids:string[];grab:Map<string,M>;ptr:M;tracker:VelocityTracker;moved:boolean}|null=null;
 private play:{t:number;speed:number;loop:boolean;cache:Record<number,Record<string,Move>>;step:number}|null=null;
 /** Reduced motion: no flick momentum and very short glides (positions still change, nothing drifts). */
 private reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(private hooks:StageHooks={}){}
 setHooks(h:StageHooks){this.hooks=h;}
 private refs=new Map<string,(el:never)=>void>();
 /** Stable ref callbacks (one per chip / arrow part), so React does not detach and re-attach them on every render. */
 chipRef(id:string){let f=this.refs.get('c'+id);if(!f){f=((el:HTMLElement|null)=>{if(el){this.chips.set(id,el);this.paintChip(id);}else this.chips.delete(id);}) as (el:never)=>void;this.refs.set('c'+id,f);}return f as (el:HTMLElement|null)=>void;}
 arrowRef(id:string,part:keyof ArrowEls){const key=`a${part}:${id}`;let f=this.refs.get(key);
  if(!f){f=((el:SVGPathElement|null)=>{const a=this.arrows.get(id)??{} as ArrowEls;if(el){a[part]=el;this.arrows.set(id,a);if(a.body&&a.head&&a.under&&a.hit)this.paintArrow(id);}else{delete a[part];if(!a.body&&!a.head&&!a.under&&!a.hit){this.arrows.delete(id);for(const k of ['body','under','head','hit'])this.refs.delete(`a${k}:${id}`);}}}) as (el:never)=>void;this.refs.set(key,f);}
  return f as (el:SVGPathElement|null)=>void;}
 setArrowLayer(el:SVGGElement|null){this.arrowLayer=el;}
 get busy(){return !!this.raf;}
 get playing(){return !!this.play;}
 get playTime(){return this.play?.t??null;}
 /** Chip bounds on screen: inside the pitch's chip margin and the zoomed view. */
 bounds():Rect{const s=this.scene!,b=chipBounds(s.spec),v=s.view.rect,m=(s.r+1)/s.view.s;
  return {x0:Math.max(b.x0,v.x0+m),y0:Math.max(b.y0,v.y0+m),x1:Math.min(b.x1,v.x1-m),y1:Math.min(b.y1,v.y1-m)};}
 /** After every React commit: new positions glide in (a step change, undo, a format change); `instant` jumps. */
 sync(scene:Scene,instant=false){
  const prev=this.scene;this.scene=scene;
  const pos=scene.play.steps[scene.step]?.pos??{};
  const rescale=!prev||prev.view.s!==scene.view.s||prev.view.orient!==scene.view.orient||prev.view.rect!==scene.view.rect;
  for(const id of [...this.bodies.keys()])if(!(id in pos)){this.bodies.delete(id);}
  if(!this.play)for(const c of scene.play.chips){const at=pos[c.id];if(!at)continue;const [x,y]=toM(scene.spec,at);let b=this.bodies.get(c.id);
   if(!b){b={x,y,vx:0,vy:0,tx:x,ty:y,spring:STEP,on:false};this.bodies.set(c.id,b);continue;}
   if(this.drag?.ids.includes(c.id))continue;
   if(instant){Object.assign(b,{x,y,tx:x,ty:y,vx:0,vy:0,on:false});continue;}
   if(Math.abs(b.tx-x)>1e-6||Math.abs(b.ty-y)>1e-6){b.tx=x;b.ty=y;if(!b.on){b.spring=this.reduced?FAST:STEP;b.on=true;}}
   else if(!b.on&&(Math.abs(b.x-x)>1e-6||Math.abs(b.y-y)>1e-6)){b.spring=this.reduced?FAST:STEP;b.on=true;}}
  if(rescale)for(const b of this.bodies.values())if(!b.on){b.x=b.tx;b.y=b.ty;}
  this.paintAll();this.kick();
 }
 /** Re-applies the current scene (after playback stops on the step React already shows). */
 resync(step?:number){if(this.scene)this.sync(step===undefined?this.scene:{...this.scene,step});}
 /** Current displayed position (metres) of a chip. */
 at(id:string):M|null{const b=this.bodies.get(id);return b?[b.x,b.y]:null;}
 positions():Record<string,M>{const o:Record<string,M>={};for(const [k,b] of this.bodies)o[k]=[b.x,b.y];return o;}
 // ── painting ──
 private paintChip(id:string){
  const el=this.chips.get(id),b=this.bodies.get(id),s=this.scene;if(!el||!b||!s)return;
  const ball=s.play.chips.find(c=>c.id===id)?.team==='ball',r=ball?s.ballR:s.r,[x,y]=toScreen(s.view,[b.x,b.y]);
  el.style.transform=`translate3d(${(x-r).toFixed(2)}px,${(y-r).toFixed(2)}px,0)`;
  const out=x<-r||y<-r||x>s.view.w+r||y>s.view.h+r;el.style.visibility=out?'hidden':'';
 }
 /** Every arrow's path from the displayed chip positions (or, during playback, the step's own positions). */
 paintArrow(id:string){
  const s=this.scene,els=this.arrows.get(id);if(!s||!els?.body||!els.head)return;
  const step=s.play.steps[this.play?this.play.step:s.step],a=step?.arrows.find(x=>x.id===id);if(!a)return;
  const d=this.arrowD(a,this.play?null:this.positions());
  els.body.setAttribute('d',d?.body??'');els.under.setAttribute('d',d?.body??'');els.head.setAttribute('d',d?.head??'');els.hit.setAttribute('d',d?.hit??'');
 }
 /** Arrow geometry in screen px for any positions (null = the step's stored positions). Used by the PNG export too. */
 arrowD(a:Arrow,live:Record<string,M>|null,scene=this.scene){
  const s=scene;if(!s)return null;const step=s.play.steps[this.play?this.play.step:s.step];if(!step)return null;
  const cv=arrowCurve(a,step.pos,s.spec);if(!cv)return null;
  let {p0,p2}=cv;if(live){if('c' in a.a&&live[a.a.c])p0=live[a.a.c];if('c' in a.b&&live[a.b.c])p2=live[a.b.c];}
  return arrowScreen(a,p0,p2,s);
 }
 private paintAll(){for(const id of this.chips.keys())this.paintChip(id);for(const id of this.arrows.keys())this.paintArrow(id);}
 private paintMoving(ids:Iterable<string>){
  const set=new Set(ids);for(const id of set)this.paintChip(id);
  const step=this.scene?.play.steps[this.play?this.play.step:this.scene.step];if(!step)return;
  for(const a of step.arrows)if(('c' in a.a&&set.has(a.a.c))||('c' in a.b&&set.has(a.b.c)))this.paintArrow(a.id);
 }
 // ── loop ──
 private kick(){if(!this.raf&&(this.drag||this.play||[...this.bodies.values()].some(b=>b.on))){this.last=performance.now();this.raf=requestAnimationFrame(this.frame);}}
 private frame=(now:number)=>{
  this.raf=0;this.frames++;const dt=Math.min(.05,Math.max(0,(now-this.last)/1000));this.last=now;const moved:string[]=[];
  if(this.drag){const b=this.bounds(),lim=(this.scene!.r*1.6)/this.scene!.view.s;
   for(const id of this.drag.ids){const body=this.bodies.get(id),g=this.drag.grab.get(id);if(!body||!g)continue;
    const x=rubber(this.drag.ptr[0]+g[0],b.x0,b.x1,lim),y=rubber(this.drag.ptr[1]+g[1],b.y0,b.y1,lim);
    if(x!==body.x||y!==body.y){body.x=x;body.y=y;moved.push(id);}}}
  if(this.play)this.advancePlay(dt,moved);
  for(const [id,b] of this.bodies){if(!b.on)continue;if(stepBody(b,dt))b.on=false;moved.push(id);}
  if(moved.length)this.paintMoving(moved);
  if(this.play)this.hooks.onFrame?.(this.play.t);
  for(const [id,el] of this.chips){const m=!!(this.drag?.ids.includes(id)||this.bodies.get(id)?.on||(this.play&&moved.includes(id)));if(m!==(el.dataset.moving==='1'))el.dataset.moving=m?'1':'';}
  // A React commit during this frame (a step change) may already have asked for the next one: never run two loops.
  if(!this.raf&&(this.drag||this.play||[...this.bodies.values()].some(b=>b.on)))this.raf=requestAnimationFrame(this.frame);
 };
 // ── dragging ──
 dragStart(ids:string[],ptr:M,t:number){
  this.stopPlay();const grab=new Map<string,M>();
  for(const id of ids){const b=this.bodies.get(id);if(!b)continue;b.on=false;b.vx=b.vy=0;grab.set(id,[b.x-ptr[0],b.y-ptr[1]]);}
  const tracker=new VelocityTracker();tracker.add(t,ptr[0],ptr[1]);
  this.drag={ids:[...grab.keys()],grab,ptr,tracker,moved:false};this.kick();
 }
 dragMove(ptr:M,t:number){if(!this.drag)return;this.drag.ptr=ptr;this.drag.moved=true;this.drag.tracker.add(t,ptr[0],ptr[1]);this.kick();}
 get dragging(){return this.drag?.ids??null;}
 /**
  * Lets go: each chip glides on with the finger's momentum and settles on a resting point (clamped inside the pitch,
  * snapped when snapping is on, nudged clear of other chips). Returns those resting points (metres) for the play.
  */
 dragEnd(t:number,cancel=false):Record<string,M>|null{
  const d=this.drag,s=this.scene;this.drag=null;if(!d||!s)return null;if(!d.moved&&!cancel){for(const id of d.ids){const b=this.bodies.get(id);if(b){b.tx=b.x;b.ty=b.y;}}return null;}
  const [vx,vy]=cancel||this.reduced?[0,0]:d.tracker.velocity(t),bounds=this.bounds(),out:Record<string,M>={};
  const moving=new Set(d.ids),others=[...this.bodies.entries()].filter(([id])=>!moving.has(id));
  const isBall=(id:string)=>s.play.chips.find(c=>c.id===id)?.team==='ball';
  for(const id of d.ids){const b=this.bodies.get(id)!;
   let target:M=[projectRest(b.x,vx,GLIDE),projectRest(b.y,vy,GLIDE)];
   target=clampTo(bounds,target[0],target[1]);
   if(!isBall(id)&&s.snap==='grid')target=clampTo(bounds,...snapGrid(target,s.spec.width/12));
   if(!isBall(id)&&s.snap==='shape'&&s.slots.length)target=snapSlots(target,s.slots,s.spec.width/6);
   const r=(isBall(id)?s.ballR:s.r)/s.view.s;
   target=separate(target,others.map(([oid,o])=>{const ob=isBall(oid);const ro=(ob?s.ballR:s.r)/s.view.s;
    return {x:o.tx,y:o.ty,min:isBall(id)||ob?Math.max(r,ro)*1.1:(r+ro)*.86};}),bounds);
   b.tx=target[0];b.ty=target[1];b.vx=vx;b.vy=vy;b.spring=this.reduced?FAST:GLIDE;b.on=true;out[id]=target;
  }
  this.kick();return out;
 }
 // ── keyboard and programmatic moves ──
 /** Moves a chip's resting point (keyboard arrows): clamped, then it glides there. Returns the target. */
 nudge(id:string,dx:number,dy:number):M|null{const b=this.bodies.get(id);if(!b||!this.scene)return null;
  const t=clampTo(this.bounds(),b.tx+dx,b.ty+dy);b.tx=t[0];b.ty=t[1];b.spring=STEP;b.on=true;this.kick();return t;}
 /** Drops a chip at a screen point with a little settle (from the tray). */
 dropIn(id:string,from:M){const b=this.bodies.get(id);if(!b)return;b.x=from[0];b.y=from[1];b.spring=GLIDE;b.on=true;this.kick();}
 // ── playback ──
 playFrom(t:number,speed:number,loop:boolean){
  if(!this.scene)return;this.drag=null;this.play={t,speed,loop,cache:{},step:Math.floor(t)};
  for(const b of this.bodies.values())b.on=false;this.kick();
 }
 setPlayOptions(speed:number,loop:boolean){if(this.play){this.play.speed=speed;this.play.loop=loop;}}
 /** Seconds per step at 1×. */
 static STEP_SECONDS=1.7;
 static END_HOLD=.45;
 private advancePlay(dt:number,moved:string[]){
  const p=this.play!,s=this.scene!,n=s.play.steps.length;
  p.t+=dt*p.speed/Stage.STEP_SECONDS;
  // Looping holds the last step for a moment, then starts again from step 1.
  if(p.loop&&n>1&&p.t>=n-1+Stage.END_HOLD)p.t=0;
  this.placeAt(Math.min(p.t,n-1),moved,true);
  if(!p.loop&&p.t>=n-1){this.stopPlay();this.hooks.onPlayEnd?.(n-1);}
 }
 /** Puts every chip where it is at time t (also used for scrubbing). */
 private placeAt(t:number,moved:string[],hold:boolean){
  const s=this.scene!,cache=this.play?.cache??{},pos=positionsAt(s.play,t,hold,cache);
  for(const [id,m] of Object.entries(pos)){const b=this.bodies.get(id);if(!b)continue;if(b.x!==m[0]||b.y!==m[1]){b.x=b.tx=m[0];b.y=b.ty=m[1];b.vx=b.vy=0;b.on=false;moved.push(id);}}
  const i=Math.min(s.play.steps.length-1,Math.floor(t+1e-9));
  if(this.play&&i!==this.play.step){this.play.step=i;this.hooks.onStep?.(i);}
  if(this.arrowLayer){const u=t-Math.floor(t);const k=hold?(u<.3?1:u>.8?0:1-(u-.3)/.5):(u<.5?1-u*2:0);this.arrowLayer.style.opacity=t>=s.play.steps.length-1?'1':k.toFixed(3);}
 }
 /** Scrubbing: shows time t without running the loop. */
 seek(t:number){
  if(!this.scene)return;if(!this.play)this.play={t,speed:1,loop:false,cache:{},step:Math.floor(t)};this.play.t=t;
  if(this.raf){cancelAnimationFrame(this.raf);this.raf=0;}
  const moved:string[]=[];this.placeAt(t,moved,false);this.paintMoving(moved);for(const id of this.arrows.keys())this.paintArrow(id);
  this.scrubbing=true;
 }
 private scrubbing=false;
 /** Stops playback or scrubbing. The chips glide to the step React shows next (sync). */
 stopPlay(){
  if(!this.play)return;this.play=null;this.scrubbing=false;
  if(this.arrowLayer)this.arrowLayer.style.opacity='';
 }
 destroy(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.drag=null;this.play=null;}
 /** Screen point → metres for the current view. */
 toModel(p:P):M{return toModel(this.scene!.view,p);}
}
/** Marker arrow paths (screen px) for start/end in metres, trimmed to the edge of the chips they are attached to. */
export function arrowScreen(a:Arrow,p0m:M,p2m:M,s:Scene){
 const sp=(m:M)=>toScreen(s.view,m) as P,p0=sp(p0m),p2=sp(p2m),dx=p2[0]-p0[0],dy=p2[1]-p0[1];
 // Both views are rotations of the pitch (no mirror), so the bend keeps its side on screen.
 const c:P=[(p0[0]+p2[0])/2-dy*a.bend,(p0[1]+p2[1])/2+dx*a.bend];
 const isBall=(id:string)=>s.play.chips.find(c=>c.id===id)?.team==='ball';
 const ra='c' in a.a?(isBall(a.a.c)?s.ballR:s.r)+3:0,rb='c' in a.b?(isBall(a.b.c)?s.ballR:s.r)+4:0;
 const q=trimQuad(p0,c,p2,ra,rb);if(!q)return null;
 const w=Math.max(2.4,Math.min(4,s.r*.24)),paths=arrowPaths(a.kind,q[0],q[1],q[2],a.id,w);
 return {...paths,hit:`M${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)}Q${q[1][0].toFixed(1)} ${q[1][1].toFixed(1)} ${q[2][0].toFixed(1)} ${q[2][1].toFixed(1)}`,w,q};
}
