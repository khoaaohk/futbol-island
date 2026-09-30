import * as T from 'three';

/**
 * Kicking a vending machine (user request, Sep 29 2026; simplified the same day at the user's request): a firm shot that hits a
 * machine's body makes it shake and vibrate, with a thunk (Town.tsx plays the vending "thunk" cue plus the usual ball bounce).
 * No flare, flicker, display text or tips. Wired from the walking ball's `blocked` callback in components/Town.tsx.
 *
 * Heat: nothing runs while idle (`update` returns after one flag check). A kick writes the one machine mesh's transform only
 * while it shakes (≤0.8 s), then restores it exactly. Nothing is allocated per kick.
 */

/** Timings (s) and thresholds. The shot leaves the foot at 38–60 m/s; a dribble/juggle never reaches a machine at speed. */
export const VENDING_KICK={
 /** Horizontal ball speed (m/s) needed to set a machine off: any real shot or firm strike, never a gentle walk-up touch. */
 minSpeed:9,
 /** Per-machine cooldown so repeat kicks can't spam it. */
 cooldown:3.5,
 shake:.8,vibrate:.22,
} as const;
/** All per-frame work is idle again after this long. */
export const VENDING_KICK_TOTAL=VENDING_KICK.shake;

type KickEntry={machine:{x:number;y:number;z:number;yaw:number};mesh:T.Mesh};
type Options={scene?:T.Scene;entries:readonly KickEntry[];material?:T.Material;
 /** Scaled cabinet size (m). */
 size:{w:number;d:number;h:number};
 host?:HTMLElement|null};

export function createVendingKick(o:Options){
 const {entries,size}=o;
 // Per-machine state, preallocated. age<0 = still.
 const shake=entries.map(()=>({age:-1,strength:0,readyAt:-Infinity}));
 let clock=0,shaking=0,kicks=0;

 const restore=(i:number)=>{const e=entries[i],m=e.machine;e.mesh.position.set(m.x,m.y,m.z);e.mesh.rotation.set(0,m.yaw,0);e.mesh.updateMatrix();};

 /** Which machine (index) a ball at (x,y,z) is touching, or -1. Only called on real collisions. */
 function hitAt(x:number,y:number,z:number,pad=.3){
  for(let i=0;i<entries.length;i++){const m=entries[i].machine,dx=x-m.x,dz=z-m.z;if(dx*dx+dz*dz>9)continue;
   const c=Math.cos(m.yaw),s=Math.sin(m.yaw),lx=dx*c-dz*s,lz=dx*s+dz*c;
   if(y<m.y-.3||y>m.y+size.h+.35)continue;
   if(Math.abs(lx)<=size.w/2+pad&&Math.abs(lz)<=size.d/2+pad)return i;
   // A turned machine's collision obstacle is the axis-aligned box around its rotated footprint, so the ball stops on that
   // box before it reaches the tighter rotated one: accept hits on the same box (Sep 30 2026: the causeway machine at −27°).
   const ex=Math.abs(c)*size.w/2+Math.abs(s)*size.d/2,ez=Math.abs(s)*size.w/2+Math.abs(c)*size.d/2;
   if(Math.abs(dx)<=ex+pad&&Math.abs(dz)<=ez+pad)return i;}
  return -1;
 }
 /** A ball hit machine `index` at horizontal speed `speed`. Returns true when the shake starts (the caller plays the sounds). */
 function kick(index:number,speed:number){
  if(index<0||index>=entries.length||!(speed>=VENDING_KICK.minSpeed))return false;
  const st=shake[index];if(clock<st.readyAt)return false;
  st.readyAt=clock+VENDING_KICK.cooldown;if(st.age<0)shaking++;st.age=0;st.strength=Math.min(1,.55+speed/90);
  kicks++;return true;
 }
 const stats={activeUpdates:0,idleUpdates:0,transformWrites:0};
 return {
  hitAt,kick,stats,
  get active(){return shaking>0;},
  get kicks(){return kicks;},
  /** Per frame. dt=0 (paused/menus) freezes the effect. Idle: one check, no work. Extra args are accepted for the old call site. */
  update(dt:number,_camera?:T.Camera,reduced=false,..._rest:unknown[]){
   clock+=dt;// the cooldown clock (it only advances on awake, unpaused frames)
   if(shaking===0){stats.idleUpdates++;return;}
   stats.activeUpdates++;
   for(let i=0;i<shake.length;i++){const st=shake[i];if(st.age<0)continue;st.age+=dt;const t=st.age,e=entries[i],m=e.machine;
    if(t>=VENDING_KICK.shake){st.age=-1;shaking--;restore(i);stats.transformWrites++;continue;}
    if(reduced)continue;
    // Decaying rock about the feet (a heavy cabinet tips a few degrees and settles) plus a fast, fading buzz at the start.
    const decay=(1-t/VENDING_KICK.shake)**2*st.strength,rock=Math.sin(t*Math.PI*2*6.5)*.07*decay,nod=Math.sin(t*Math.PI*2*4.3+1)*.03*decay;
    const v=t<VENDING_KICK.vibrate?(1-t/VENDING_KICK.vibrate)*.04*st.strength:0;
    const c=Math.cos(m.yaw),s=Math.sin(m.yaw),jx=Math.sin(t*97)*v,jz=Math.cos(t*113)*v;
    e.mesh.position.set(m.x+jx*c+jz*s,m.y+Math.abs(Math.sin(t*71))*v*.5,m.z-jx*s+jz*c);e.mesh.rotation.set(nod,m.yaw,rock,'YXZ');e.mesh.updateMatrix();stats.transformWrites++;
   }
  },
  dispose(){for(let i=0;i<entries.length;i++)if(shake[i].age>=0)restore(i);},
 };
}
export type VendingKick=ReturnType<typeof createVendingKick>;
