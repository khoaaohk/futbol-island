/**
 * Pointer gestures for the toy viewer (round 3B, Nov 9 2026). Pure (no DOM): components/GashaponToyViewer.tsx feeds it pointer
 * events (down / move on the canvas; up / cancel from WINDOW-level listeners, so a finger lifted outside the canvas, a lost pointer
 * capture, a blur or a hidden tab still lets go) and it drives the viewer. tests/gashapon-viewer.cjs runs it with synthetic events.
 *
 *  one finger    on a grabbable part (piece / key / capsule): that grab; elsewhere: turn the table (throw inertia), a fast flick
 *                that started on the toy spins it (spin-top kinds); press-and-hold on the toy (260 ms, not moved): squeeze, and
 *                finger motion during the squeeze rubs (jiggle) instead of turning; a quick still tap: poke.
 *  working part  (lid / lever / slider / crank / wheels) a drag (> 6 px) works it; a quick still tap works it in one go (opens /
 *                shuts the lid); a STILL press held 300 ms lets the part go untouched and squeezes the toy instead (Nov 9: Dorayaki
 *                Doug's lid covers nearly all of him, so a lid-only grab meant he could never be squeezed). A puzzle piece held still
 *                300 ms does the same (Taiyaki Tai is nearly all pieces).
 *  two fingers   pinch zoom; a second finger always ends a squeeze or a grab first.
 *  let go        ANY way (up, cancel, leave, blur, `cancelAll`): the squeeze ends and the toy springs back; grabs drop.
 */
import type {ToyViewer,ToyTouch} from './toyViewer';
import type {GrabKind} from './toyInteract';

export type GestureTarget=Pick<ToyViewer,'hit'|'grab'|'drag'|'release'|'zoom'|'holdStart'|'holdEnd'|'tap'|'pointerDown'|'pointerMove'|'pointerUp'|'pointerCancel'|'rub'|'flick'|'releaseAll'>;
export type GestureHooks={now?:()=>number;setTimer?:(f:()=>void,ms:number)=>unknown;clearTimer?:(t:unknown)=>void;
 onHold?:()=>void;onTap?:(t:ToyTouch)=>void;onGrab?:(k:Exclude<GrabKind,null>)=>void;onSpin?:()=>void;onMove?:()=>void;onRelease?:()=>void};
export const HOLD_MS=260,MOVE_PX=9,TAP_MS=380,MECH_HOLD_MS=300,MECH_MOVE_PX=6;

export function createToyGestures(target:()=>GestureTarget|null,h:GestureHooks={}){
 const now=h.now??(()=>performance.now()),setT=h.setTimer??((f,ms)=>setTimeout(f,ms)),clearT=h.clearTimer??(t=>clearTimeout(t as ReturnType<typeof setTimeout>));
 type G={id:number;x0:number;y0:number;x:number;y:number;t0:number;t:number;vx:number;vy:number;moved:boolean;onToy:boolean;holding:boolean;grab:GrabKind;mechGo:boolean};
 let g:G|null=null,pinch:number|null=null,timer:unknown=null;const pts=new Map<number,{x:number;y:number}>();
 const stopTimer=()=>{if(timer!==null){clearT(timer);timer=null;}};
 /** End a squeeze / grab without a tap (a second finger, a cancel). */
 function endHere(d:G,v:GestureTarget){stopTimer();if(d.grab){v.pointerUp();}if(d.holding){d.holding=false;v.holdEnd();h.onRelease?.();}}
 return {
  down(id:number,x:number,y:number){const v=target();if(!v)return;pts.set(id,{x,y});
   if(pts.size===2){if(g){endHere(g,v);v.release(0,0);g=null;}const [a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);return;}
   if(pts.size>2||g)return;
   const t=now(),grab=v.pointerDown(x,y),d:G={id,x0:x,y0:y,x,y,t0:t,t,vx:0,vy:0,moved:false,onToy:grab?true:v.hit(x,y),holding:false,grab,mechGo:false};g=d;
   if(grab)h.onGrab?.(grab);else v.grab();
   // Hold: squeeze (or wind, on a wind-up key / body). Not on a piece or a capsule: those drag.
   if(d.onToy&&(grab===null||grab==='key'))timer=setT(()=>{timer=null;if(g===d&&!d.moved){d.holding=true;v.holdStart();h.onHold?.();}},HOLD_MS);
   // A working part held still: let it go untouched (it never moved: moves wait for MECH_MOVE_PX) and squeeze the toy instead.
   else if(grab==='mech')timer=setT(()=>{timer=null;const w=target();if(g!==d||d.mechGo||d.grab!=='mech'||!w)return;w.pointerCancel();d.grab=null;d.holding=true;w.holdStart();h.onHold?.();},MECH_HOLD_MS);
   // A puzzle piece held still (QA Nov 9 2026): the same, so a toy that is all pieces (Taiyaki Tai's two halves, Pixel Keeper) can
   // still be squeezed by a press-and-hold; a drag that starts within 300 ms pulls the piece as before.
   else if(grab==='piece')timer=setT(()=>{timer=null;const w=target();if(g!==d||d.moved||d.grab!=='piece'||!w)return;w.pointerCancel();d.grab=null;d.holding=true;w.holdStart();h.onHold?.();},MECH_HOLD_MS);},
  move(id:number,x:number,y:number){const p=pts.get(id);if(!p)return;p.x=x;p.y=y;const v=target();if(!v)return;
   if(pinch!==null&&pts.size>=2){const [a,b]=[...pts.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)v.zoom(dist/pinch);pinch=dist;return;}
   const d=g;if(!d||d.id!==id)return;const dx=x-d.x,dy=y-d.y,t=now(),dt=Math.max(8,t-d.t)/1000;
   if(!d.moved&&Math.hypot(x-d.x0,y-d.y0)>MOVE_PX){d.moved=true;if(!d.holding)stopTimer();}
   d.x=x;d.y=y;d.t=t;
   if(d.grab==='mech'&&!d.mechGo){if(Math.hypot(x-d.x0,y-d.y0)<=MECH_MOVE_PX)return;d.mechGo=true;stopTimer();}// a still press never nudges the lid
   if(d.grab){if(d.moved||d.grab!=='key')v.pointerMove(x,y);h.onMove?.();return;}
   if(d.holding){v.rub(dx,dy);return;}
   if(d.moved){d.vx=d.vx*.5+dx/dt*.5;d.vy=d.vy*.5+dy/dt*.5;v.drag(dx,dy);h.onMove?.();}},
  /** Pointer up (cancelled = pointercancel / lost capture / leave: never a tap). */
  up(id:number,x:number,y:number,cancelled=false){pts.delete(id);if(pinch!==null){if(pts.size<2)pinch=null;return;}
   const d=g,v=target();if(!d||d.id!==id){return;}g=null;if(!v)return;
   const quick=!d.moved&&now()-d.t0<TAP_MS&&!cancelled;
   if(d.grab){endHere(d,v);if(quick){const t=v.tap(x,y);if(t)h.onTap?.(t);}return;}
   if(d.holding){endHere(d,v);v.release(0,0);return;}stopTimer();
   if(quick){v.release(0,0);const t=v.tap(x,y);if(t)h.onTap?.(t);return;}
   const still=now()-d.t>90,vx=still?0:d.vx,vy=still?0:d.vy;
   if(d.onToy&&!cancelled&&v.flick(vx)){v.release(0,0);h.onSpin?.();return;}
   v.release(vx,vy);},
  /** Let go of everything: blur, hidden tab, unmount. */
  cancelAll(){stopTimer();const v=target();pts.clear();pinch=null;const d=g;g=null;if(v){if(d){endHere(d,v);}v.releaseAll();}},
  active:()=>({pointers:pts.size,holding:!!g?.holding,grab:g?.grab??null,pinch:pinch!==null}),
 };
}
export type ToyGestures=ReturnType<typeof createToyGestures>;
