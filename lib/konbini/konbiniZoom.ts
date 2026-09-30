import type {ShelfId} from './konbiniContent';
/**
 * In-world shelf zoom (user, Sep 29 2026: "when looking at each section, it should zoom in and show what it looks like, not a
 * preview. Like how the vending machines work"). Pure: which sections/bays exist, the zoom state machine and the eased camera
 * blend. konbiniScene.ts owns the camera; tests/konbini.cjs checks this module.
 *
 * A section is a real shelf (fridge wall, rice case, an aisle's front, the hot counter, the register, the gear rack, the
 * magazine table). Long shelves split into bays so a phone in portrait still sees products ≥ 44 px wide.
 */
export type ZoomSection={poi:ShelfId;label:string;
 /** Fixture frame: world x/z of its centre and the yaw its front faces. */
 x:number;z:number;yaw:number;len:number;height:number;
 /** Face centre height, how far the face is in front of the fixture centre, and the camera elevation (radians). */
 cy:number;fz:number;elev:number;
 /** Fixture index (slots are recorded per fixture) and the section's centre along the fixture. */
 fi:number;lx:number};
export type ZoomTarget=ZoomSection&{bay:number;bays:number;width:number;cx:number};
/** Bay width: narrow on portrait phones (products ≥ 44 px), wider on landscape/desktop. */
export const bayWidth=(aspect:number)=>aspect<1?1.9:aspect<1.4?2.8:3.6;
export function zoomTargets(sections:readonly ZoomSection[],aspect:number):ZoomTarget[]{
 const w=bayWidth(aspect),out:ZoomTarget[]=[];
 for(const s of sections){const bays=Math.max(1,Math.ceil(s.len/w-.08)),width=s.len/bays;
  for(let b=0;b<bays;b++)out.push({...s,bay:b,bays,width,cx:s.lx-s.len/2+(b+.5)*width,label:bays>1?`${s.label} ${b+1}/${bays}`:s.label});}
 return out;
}
/** The bay of a section nearest a point (the player), in the fixture's local x. */
export function nearestTarget(targets:readonly ZoomTarget[],poi:ShelfId,px:number,pz:number):number{
 let best=-1,bd=Infinity;targets.forEach((t,i)=>{if(t.poi!==poi)return;const c=Math.cos(t.yaw),s=Math.sin(t.yaw),wx=t.x+t.cx*c+t.fz*s,wz=t.z-t.cx*s+t.fz*c,d=Math.hypot(wx-px,wz-pz);if(d<bd){bd=d;best=i;}});return best;
}
export type ZoomState={mode:'walk'}|{mode:'zoom';index:number};
export type ZoomEvent={type:'look';index:number}|{type:'step';dir:1|-1}|{type:'back'}|{type:'buy'}|{type:'revealDone'};
/** walk → (look) zoom(i) → (step ±1, clamped to the ends) zoom(j) → (back) walk. Buying and the reveal keep the zoom. */
export function stepZoom(state:ZoomState,event:ZoomEvent,count:number):ZoomState{
 switch(event.type){
  case 'look':return event.index>=0&&event.index<count?{mode:'zoom',index:event.index}:state;
  case 'step':return state.mode==='zoom'?{mode:'zoom',index:Math.max(0,Math.min(count-1,state.index+event.dir))}:state;
  case 'back':return {mode:'walk'};
  case 'buy':case 'revealDone':return state;
 }
}
/** Eased blend (vending zoom feel): ~1 s in, a little quicker out. */
export const ZOOM_IN_SECONDS=1,ZOOM_OUT_SECONDS=.8;
export const easeZoom=(t:number)=>t<=0?0:t>=1?1:t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
