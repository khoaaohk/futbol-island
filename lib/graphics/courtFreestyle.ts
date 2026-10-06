import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {PlayerRig,PlayerMotion} from './player';
import {CLASSIC_GROUND,FREESTYLE_TRICKS,TRICK_R,TRICK_REST,createTrickCtx,createTrickFrame,sampleIdle,sampleTrick,trickById,type TrickDef} from './freestyleTricks';
import {PAIR_FALLBACK,buildPairRoutines,buildSoloRoutine,type Routine,type RoutineSeg} from './freestyleRoutine';
/**
 * The island's freestylers (lib/town/courtFreestylers.ts, Coral Cay's Lua and Tavi, the East Pier's Ollie): a seeded routine of
 * named tricks (freestyleTricks.ts) chained by idle beats (freestyleRoutine.ts). The court's two pairs (Teo–Kei, Zuri–Iza) also
 * pass one ball between them; `linkFreestylePair` joins them.
 * Heat: driven by the existing visible-NPC update only (no extra frame loop): islandNpcs calls `prepare` just before posing the rig,
 * which it already skips off screen and slows to 10 Hz beyond 32 m. The routine is a pure function of the shared freestyle clock,
 * so skipped frames cost nothing and partners stay in step. One ball mesh per freestyler, as before; no allocation per frame.
 */
const TAGS=new Map<TrickDef,string>(FREESTYLE_TRICKS.map(t=>[t,t.label.toUpperCase()]));
export function createCourtFreestyle(rig:PlayerRig,variant:number,id=`freestyle-${variant}`){
 const paint=(g:T.BufferGeometry,color:string)=>{const c=new T.Color(color),n=g.getAttribute('position').count,colors=new Float32Array(n*3);for(let i=0;i<n;i++)colors.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new T.BufferAttribute(colors,3));return g;};
 const parts=[paint(new T.SphereGeometry(.19,12,8),'#fff1d3')];
 for(const p of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){
  const normal=new T.Vector3(...p),patch=paint(new T.CircleGeometry(.061,5),'#294f43');
  patch.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),normal));patch.translate(p[0]*.188,p[1]*.188,p[2]*.188);parts.push(patch);
 }
 const geometry=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.85});
 const ball=new T.Mesh(geometry,material);ball.name='freestyle-ball';ball.castShadow=true;rig.root.add(ball);
 // Rig measurements for the trick maths (root frame, before the root's scale).
 const legs=rig.profile?.legs??1,scale=Math.abs(rig.root.scale.y)||1,pelvisRest=.88+(legs-1)*.83;
 const ctx=createTrickCtx({legs,pelvisRest,headTop:rig.headTop!==undefined?rig.headTop/scale:pelvisRest+1.01,ground:(rig.root.userData.beanBody as {ground?:number[]}|undefined)?.ground??CLASSIC_GROUND});
 let routine:Routine=buildSoloRoutine(id,variant);
 const frame=createTrickFrame(),motion:PlayerMotion={},fallback=trickById(PAIR_FALLBACK)!;
 let cursor=0,latched:RoutineSeg|null=null,pairOn=false,tag:string|null=null,current:TrickDef|null=null,facing:number|undefined,active=false,ownClock=(variant*2.3)%10;
 let partner:{readonly active:boolean}|null=null,partnerYaw=0,lx:number=TRICK_REST.x,ly:number=TRICK_REST.y,lz:number=TRICK_REST.z;
 const find=(t:number)=>{const s=routine.segs;if(t<s[cursor].start)cursor=0;while(cursor<s.length-1&&t>=s[cursor].start+s[cursor].dur)cursor++;return s[cursor];};
 const rest=()=>{motion.trick=undefined;motion.juggle=undefined;tag=null;current=null;facing=undefined;ball.position.set(TRICK_REST.x,TRICK_REST.y,TRICK_REST.z);lx=TRICK_REST.x;ly=TRICK_REST.y;lz=TRICK_REST.z;};
 rest();
 return {ball,motion,ctx,id,variant,
  /** Name tag text for the trick being played (upper case, cached), or null between tricks. */
  get tag(){return tag;},
  /** The trick being played (its label and football purpose), or null. */
  get trick(){return current;},
  /** Heading toward the partner during a pair trick, else undefined (the NPC keeps its own facing). */
  get facing(){return facing;},
  get active(){return active;},
  get routine(){return routine;},
  setRoutine(r:Routine){routine=r;cursor=0;latched=null;},
  setPartner(p:{readonly active:boolean}|null,yaw:number){partner=p;partnerYaw=yaw;},
  /** `clock`: the shared freestyle clock (seconds, paused with the island); without it the freestyler keeps its own. */
  prepare(dt:number,on:boolean,reduced:boolean,clock?:number){
   if(clock===undefined){if(on&&!reduced)ownClock+=dt;clock=ownClock;}
   active=on&&!reduced;
   if(!active){rest();return;}
   const t=((clock+routine.offset)%routine.cycle+routine.cycle)%routine.cycle,seg=find(t),τ=t-seg.start;
   facing=undefined;
   if(seg.kind==='idle'){sampleIdle(τ,seg.dur,seg.side,seg.to,ctx,frame,seg.seed);current=null;}
   else if(seg.kind==='trick'){sampleTrick(seg.trick!,τ,seg.side,ctx,frame);current=seg.trick;}
   else{
    // A pair window: decided once when it starts, so a partner walking off mid-rally does not make the ball jump.
    if(latched!==seg){latched=seg;pairOn=!!partner?.active;}
    if(pairOn){sampleTrick(seg.trick!,τ,seg.side,ctx,frame,seg.role);facing=partnerYaw;current=seg.trick;}
    else{sampleTrick(fallback,τ*fallback.seconds/seg.dur,seg.side,ctx,frame);current=fallback;}
   }
   tag=current?TAGS.get(current)??null:null;
   // `juggle` marks the rig busy with the ball (feet free, no step locks or reactions): the trick pose then sets every joint, and the
   // gait skips its stance work (measured ~25 % cheaper per freestyler than leaving the gait's foot locks running underneath).
   motion.trick=frame.pose;motion.juggle=0;motion.juggleTouch='foot';motion.kickSide=seg.side;
   const b=frame.ball;ball.position.set(b.x,b.y,b.z);
   // Roll with the ground (or spin in the air); a stalled ball stays still.
   const dx=b.x-lx,dz=b.z-lz;ball.rotation.x+=dz/TRICK_R;ball.rotation.z-=dx/TRICK_R;if(frame.air)ball.rotation.x+=dt*(4+variant%3);
   lx=b.x;ly=b.y;lz=b.z;void ly;
  },dispose(){ball.removeFromParent();geometry.dispose();material.dispose();}};
}
export type CourtFreestyle=ReturnType<typeof createCourtFreestyle>;
/** Joins two freestylers standing at `pa` and `pb` (world x/z) into a pair: shared timeline, facing each other for pair tricks. */
export function linkFreestylePair(a:CourtFreestyle,b:CourtFreestyle,pa:{x:number;z:number},pb:{x:number;z:number}){
 const [ra,rb]=buildPairRoutines(a.id,b.id,a.variant,b.variant),d=Math.hypot(pb.x-pa.x,pb.z-pa.z);
 a.setRoutine(ra);b.setRoutine(rb);
 a.ctx.partnerD=b.ctx.partnerD=d;a.ctx.partner=b.ctx;b.ctx.partner=a.ctx;
 a.setPartner(b,Math.atan2(pb.x-pa.x,pb.z-pa.z));b.setPartner(a,Math.atan2(pa.x-pb.x,pa.z-pb.z));
}
