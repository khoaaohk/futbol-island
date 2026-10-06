import type * as T from 'three';

/**
 * Kick reactions for world props (user request, Oct 3 2026): a lamp post sways and its light pool flickers, a bench jolts,
 * a tree or bush rustles, a sign swings, a fence ripples. One data-driven table (PROP_REACTIONS) and one
 * updater; no per-prop code. Wired from the walking ball's `blocked` callback in components/Town.tsx, next to the tree
 * debris, umbrella and vending reactions.
 *
 * Almost every prop lives inside a merged 50 m "island-chunk" mesh (lib/town/world.ts), so it has no transform of its own.
 * world.ts records each tagged prop's vertex ranges inside those merged position buffers. A hit copies just that range
 * aside, rewrites it every frame while the reaction runs (≤0.9 s) and uploads only that range (addUpdateRange), then copies
 * the originals back bit for bit. Normals are left alone: the angles are a few degrees. Shadows come from the separate
 * static shadow batches and stay still.
 *
 * Heat: idle = one counter check per frame. No allocation per hit or per frame (slot buffers are made once, on the first
 * hit, sized to the largest registered prop). At most MAX_ACTIVE props animate at once; a further hit still plays its sound.
 * Reduced motion: no vertex motion and no flicker; the sound still plays.
 */

export type PropReactionKind='lamp'|'pole'|'signal'|'flag'|'sign'|'bench'|'table'|'tree'|'palm'|'bush'|'planter'|'fence'|'net'|'goal'|'post'|'bike'|'crate'|'bollard'|'lifebuoy';
/** Soft one-shot sounds already in lib/audio/islandSound.ts ('fi2-job-cue'). */
export type PropReactionCue='clank'|'thunk'|'rustle'|'spring'|'tap'|'thud';

export type PropReactionStyle={
 /** Rigid tilt about the base, radians at full strength (a pole sways, a sign swings, a bench rocks). */
 tilt:number;
 /** Height-weighted (h²) sideways shake at the top, metres (a canopy rustles while the trunk stays put). */
 shake:number;
 /** Position-varying leaf shimmer, metres (needs `shake`-like foliage). */
 rustle:number;
 /** Rigid slide along the ball's path, metres (a bench jolts). */
 jolt:number;
 /** Rigid vertical bob, metres (unused by current rows; buoys and boats have no ball collider). */
 bob:number;
 /** Oscillation frequency, Hz. */
 freq:number;
 /** Exponential damping, 1/s. */
 damping:number;
 /** Total length, s; motion fades to exactly zero by then and the originals are restored. */
 duration:number;
 /** Ripple radius, metres: only vertices near the hit move (a long fence). 0 = the whole prop. */
 radius:number;
 /** Per-prop cooldown, s (repeat hits never stack). */
 cooldown:number;
 /** Horizontal ball speed needed, m/s (a gentle roll into a bench does nothing). */
 minSpeed:number;
 cue:PropReactionCue;
 /** Brief stutter of the prop's night light pool, if it has one. */
 flicker?:boolean;
 /** Pinned at the base: displacement grows with height (a net billows, its pegs and post feet stay put). */
 anchor?:boolean;
};

const S=(o:Partial<PropReactionStyle>&Pick<PropReactionStyle,'freq'|'duration'|'cue'>):PropReactionStyle=>({tilt:0,shake:0,rustle:0,jolt:0,bob:0,damping:4,radius:0,cooldown:1.2,minSpeed:4,...o});
/** One row per prop type. Amplitudes are at full strength (a hard shot); a soft touch scales them down to ~40%. */
export const PROP_REACTIONS:Record<PropReactionKind,PropReactionStyle>={
 lamp:    S({tilt:.14,freq:2.4,damping:3.4,duration:.85,cue:'clank',flicker:true}),
 pole:    S({tilt:.11,freq:2.8,damping:3.8,duration:.75,cue:'clank'}),
 signal:  S({tilt:.055,freq:1.9,damping:3.4,duration:.85,cue:'clank'}),
 flag:    S({tilt:.27,freq:2.2,damping:3,duration:.9,cue:'spring',minSpeed:2}),
 sign:    S({tilt:.14,freq:2.6,damping:3.4,duration:.8,cue:'spring'}),
 bench:   S({tilt:.12,jolt:.18,freq:5.5,damping:6.5,duration:.55,cue:'thunk'}),
 table:   S({tilt:.1,jolt:.12,freq:6,damping:6.5,duration:.55,cue:'thunk'}),
 tree:    S({shake:1.25,rustle:.2,freq:3.4,damping:3.6,duration:.9,cue:'rustle',minSpeed:1.2}),
 palm:    S({shake:1.05,rustle:.18,freq:2.2,damping:3,duration:.95,cue:'rustle',minSpeed:1.2}),
 bush:    S({shake:.32,rustle:.12,freq:5,damping:5.5,duration:.6,cue:'rustle',minSpeed:1.2}),
 planter: S({shake:.26,rustle:.1,freq:5,damping:5.5,duration:.6,cue:'rustle',minSpeed:1.2}),
 fence:   S({tilt:.26,freq:5,damping:5,duration:.65,radius:2.4,cue:'tap'}),
 net:     S({anchor:true,jolt:.4,freq:4,damping:5,duration:.7,radius:1.4,cue:'tap',minSpeed:2}),
 goal:    S({anchor:true,jolt:.42,freq:4.5,damping:5,duration:.7,radius:1.3,cue:'clank',minSpeed:2,cooldown:.6}),
 post:    S({tilt:.08,jolt:.055,freq:6,damping:6.5,duration:.5,cue:'tap'}),
 bike:    S({tilt:.18,jolt:.06,freq:6.5,damping:6,duration:.55,cue:'tap'}),
 crate:   S({tilt:.09,jolt:.11,freq:6,damping:6.5,duration:.5,cue:'thud'}),
 // East Pier kerb props (colliders added Oct 3 2026): iron bollards shiver, lifebuoy stands sway with the ring swinging.
 bollard: S({tilt:.06,jolt:.05,freq:9,damping:8,duration:.4,cue:'clank'}),
 lifebuoy:S({tilt:.12,shake:.12,freq:2.6,damping:3.4,duration:.8,cue:'tap'}),
};

/** Builders wrap a prop's meshes in this so world.ts can find them after batching (identity when absent). */
export type PropTagger=<R>(kind:PropReactionKind,build:()=>R)=>R;
export const untaggedProp:PropTagger=(_kind,build)=>build();

/** A run of vertices of one prop inside a (merged) position buffer, in that buffer's coordinate space. */
export type PropPart={attribute:T.BufferAttribute;start:number;count:number;
 /** Motion scale for this part (a goal's net billows, its frame barely shivers). Default 1. */
 gain?:number};
export type PropSpec={
 kind:PropReactionKind;parts:PropPart[];
 /** Bounds in the hit space (world), used to find which prop a ball touched. */
 min:{x:number;y:number;z:number};max:{x:number;y:number;z:number};
 /** Base of the prop in its buffer space (default: bottom centre of the bounds). */
 pivot?:{x:number;y:number;z:number};
 /** Hit point → buffer space offset, for buffers that are not in world space (default 0). */
 offset?:{x:number;y:number;z:number};
 /** The prop's light pool instance, for `flicker`. Only its x/z scale is touched. */
 light?:{mesh:T.InstancedMesh;index:number};
};

/** Animated props at once; more hits still make their sound. */
export const MAX_ACTIVE=4;
/** Larger props (no current prop comes close) still sound but never animate. */
export const MAX_PROP_VERTICES=8000;
const MAX_PARTS=16,PAD=.35,CELL=8;

export function createPropReactions(specs:readonly PropSpec[]){
 const props=specs.map(s=>{
  const verts=s.parts.reduce((n,p)=>n+p.count,0),off=s.offset??{x:0,y:0,z:0};
  const pivot=s.pivot??{x:(s.min.x+s.max.x)/2-off.x,y:s.min.y-off.y,z:(s.min.z+s.max.z)/2-off.z};
  return {...s,style:PROP_REACTIONS[s.kind],off,pivot,height:Math.max(.3,s.max.y-s.min.y),verts,animatable:verts>0&&verts<=MAX_PROP_VERTICES&&s.parts.length<=MAX_PARTS,readyAt:-Infinity,slot:-1};
 });
 // Coarse grid over the props' bounds; only read on an actual ball collision.
 const grid=new Map<number,number[]>(),key=(cx:number,cz:number)=>(cx+2048)*4096+(cz+2048);
 props.forEach((p,i)=>{for(let cx=Math.floor((p.min.x-PAD)/CELL);cx<=Math.floor((p.max.x+PAD)/CELL);cx++)for(let cz=Math.floor((p.min.z-PAD)/CELL);cz<=Math.floor((p.max.z+PAD)/CELL);cz++){const k=key(cx,cz);const list=grid.get(k);if(list)list.push(i);else grid.set(k,[i]);}});
 const capacity=props.reduce((n,p)=>p.animatable?Math.max(n,p.verts):n,0);
 type Slot={prop:number;age:number;strength:number;ux:number;uz:number;hx:number;hz:number;orig:Float32Array|null;lo:Int32Array;hi:Int32Array;light0:number;light2:number};
 const slots:Slot[]=Array.from({length:MAX_ACTIVE},()=>({prop:-1,age:0,strength:0,ux:0,uz:1,hx:0,hz:0,orig:null,lo:new Int32Array(MAX_PARTS),hi:new Int32Array(MAX_PARTS),light0:1,light2:1}));
 let clock=0,active=0;
 const stats={hits:0,started:0,reducedHits:0,dropped:0,idleUpdates:0,activeUpdates:0,vertexWrites:0,uploads:0};

 /** Which prop (index) a ball at (x,y,z) is touching, or -1: inside its padded bounds, nearest base wins. */
 function find(x:number,y:number,z:number){
  const list=grid.get(key(Math.floor(x/CELL),Math.floor(z/CELL)));if(!list)return -1;
  let best=-1,bestD=Infinity;
  for(const i of list){const p=props[i];
   if(x<p.min.x-PAD||x>p.max.x+PAD||z<p.min.z-PAD||z>p.max.z+PAD||y<p.min.y-.3||y>p.max.y+.3)continue;
   const d=(x-p.pivot.x-p.off.x)**2+(z-p.pivot.z-p.off.z)**2;if(d<bestD){bestD=d;best=i;}}
  return best;
 }
 function restore(s:Slot){
  const p=props[s.prop];let o=0;
  for(let k=0;k<p.parts.length;k++){const part=p.parts[k],a=part.attribute;
   (a.array as Float32Array).set(s.orig!.subarray(o,o+part.count*3),part.start*3);
   upload(part,0,part.count);o+=part.count*3;}
  if(p.light&&p.style.flicker){const m=p.light.mesh.instanceMatrix.array,b=p.light.index*16;m[b]=s.light0;m[b+10]=s.light2;p.light.mesh.instanceMatrix.addUpdateRange(b,16);p.light.mesh.instanceMatrix.needsUpdate=true;}
  p.slot=-1;s.prop=-1;active--;
 }
 function upload(part:PropPart,lo:number,hi:number){
  if(hi<=lo)return;const a=part.attribute;
  if(typeof a.addUpdateRange==='function')a.addUpdateRange((part.start+lo)*3,(hi-lo)*3);
  a.needsUpdate=true;stats.uploads++;
 }

 /**
  * A ball moving at (vx,vz) hit something at (x,y,z). Returns the sound cue to play, or null (no prop there, too soft, or
  * cooling down). Starts the reaction unless `reduced`.
  */
 function hit(x:number,y:number,z:number,vx:number,vz:number,reduced=false):PropReactionCue|null{
  const i=find(x,y,z);if(i<0)return null;
  const p=props[i],style=p.style,speed=Math.hypot(vx,vz);
  if(!(speed>=style.minSpeed)||clock<p.readyAt)return null;
  p.readyAt=clock+style.cooldown;stats.hits++;
  if(reduced){stats.reducedHits++;return style.cue;}
  if(!p.animatable){stats.dropped++;return style.cue;}
  let s=p.slot>=0?slots[p.slot]:undefined;
  if(!s){const free=slots.findIndex(s=>s.prop<0);if(free<0){stats.dropped++;return style.cue;}
   s=slots[free];s.orig??=new Float32Array(capacity*3);s.prop=i;p.slot=free;active++;
   let o=0;for(const part of p.parts){s.orig.set((part.attribute.array as Float32Array).subarray(part.start*3,(part.start+part.count)*3),o);o+=part.count*3;}
   if(p.light&&style.flicker){const m=p.light.mesh.instanceMatrix.array,b=p.light.index*16;s.light0=m[b];s.light2=m[b+10];}
  }
  const l=speed||1;s.ux=vx/l;s.uz=vz/l;s.age=0;s.strength=Math.min(1,Math.max(.4,speed/28));
  s.hx=x-p.off.x;s.hz=z-p.off.z;
  // Only the vertices a ripple can reach are rewritten and uploaded.
  let o=0;for(let k=0;k<p.parts.length;k++){const part=p.parts[k];let lo=0,hi=part.count;
   if(style.radius>0){const r2=(style.radius*1.6)**2;lo=part.count;hi=0;
    for(let v=0;v<part.count;v++){const j=o+v*3,dx=s.orig![j]-s.hx,dz=s.orig![j+2]-s.hz;if(dx*dx+dz*dz<r2){if(v<lo)lo=v;hi=v+1;}}}
   s.lo[k]=lo;s.hi[k]=hi;o+=part.count*3;}
  stats.started++;return style.cue;
 }

 function update(dt:number,reduced=false){
  clock+=dt;
  if(active===0){stats.idleUpdates++;return;}
  stats.activeUpdates++;
  for(const s of slots){if(s.prop<0)continue;const p=props[s.prop],st=p.style;
   s.age+=dt;
   if(s.age>=st.duration||reduced){restore(s);continue;}
   if(dt<=0)continue;
   const t=s.age,phase=t*st.freq*Math.PI*2,fadeStart=st.duration*.65;
   const fade=t<fadeStart?1:1-(t-fadeStart)/(st.duration-fadeStart);
   const env=s.strength*Math.exp(-st.damping*t)*fade*fade,osc=Math.sin(phase);
   const theta=st.tilt*env*osc,shakeA=st.shake*env,sA=osc,sB=.45*Math.sin(phase*1.63+1.1),rustleA=st.rustle*env,rs=Math.sin(phase*2.3),rc=Math.cos(phase*2.3);
   const jolt=st.jolt*env*osc,bob=st.bob*env*Math.sin(phase+.6),ux=s.ux,uz=s.uz,px=p.pivot.x,py=p.pivot.y,pz=p.pivot.z,invH=1/p.height;
   const invR2=st.radius>0?1/(st.radius*st.radius):0,orig=s.orig!,anchor=!!st.anchor,exp=Math.exp;
   let o=0;
   for(let k=0;k<p.parts.length;k++){const part=p.parts[k],arr=part.attribute.array as Float32Array,lo=s.lo[k],hi=s.hi[k];
    const gain=part.gain??1;
    for(let v=lo,out=(part.start+lo)*3;v<hi;v++,out+=3){const j=o+v*3,ox=orig[j],oy=orig[j+1],oz=orig[j+2];
     const rx=ox-px,ry=oy-py,rz=oz-pz;let h=ry*invH;h=h<0?0:h>1.25?1.25:h;
     let w=gain;if(invR2){const dx=ox-s.hx,dz=oz-s.hz;w*=exp(-(dx*dx+dz*dz)*invR2);}
     if(anchor)w*=h<.6?h/.6:1;
     // Rigid small-angle tilt about the base, toward the ball's travel.
     const th=theta*w,c=1-th*th*.5,along=rx*ux+rz*uz,moved=along*c+ry*th-along;
     let x=ox+moved*ux,y=py+ry*c-along*th,z=oz+moved*uz;
     if(shakeA){const sh=shakeA*h*h*w;x+=sh*(ux*sA-uz*sB);z+=sh*(uz*sA+ux*sB);}
     // Leaf shimmer: a position-keyed triangle wave mixed by one sin/cos pair per frame (no trig per vertex; duplicated
     // corners of non-indexed geometry get the same offset, so faces never tear).
     if(rustleA){let q=ox*.93+oz*1.17+oy*.41;q-=q|0;if(q<0)q+=1;const tri=q<.5?4*q-1:3-4*q,r=rustleA*h*w*(rs*tri+rc*(tri<0?1+tri*2:1-tri*2));x+=r*.6;y+=r*.35;z-=r*.5;}
     x+=jolt*w*ux;z+=jolt*w*uz;y+=bob*w;
     arr[out]=x;arr[out+1]=y;arr[out+2]=z;
    }
    stats.vertexWrites+=hi-lo;upload(part,lo,hi);o+=part.count*3;
   }
   if(p.light&&st.flicker){// a short stutter in the first .35 s, never brighter than normal
    const m=p.light.mesh.instanceMatrix.array,b=p.light.index*16,f=t<.35?1-.45*(1-t/.35)*(Math.sin(t*61)>.2?1:.25):1;
    m[b]=s.light0*f;m[b+10]=s.light2*f;p.light.mesh.instanceMatrix.addUpdateRange(b,16);p.light.mesh.instanceMatrix.needsUpdate=true;}
  }
 }
 return {
  hit,find,update,stats,
  get count(){return props.length;},
  get active(){return active>0;},
  /** Prop types registered, for the debug panel and tests. */
  kinds(){const n:Partial<Record<PropReactionKind,number>>={};for(const p of props)n[p.kind]=(n[p.kind]??0)+1;return n;},
  dispose(){for(const s of slots)if(s.prop>=0)restore(s);},
 };
}
export type PropReactions=ReturnType<typeof createPropReactions>;
