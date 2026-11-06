import * as T from 'three';
/**
 * Live-match moment rings (owner Nov 5 2026: "make this feel more premium"; docs/join-live-game-design.md "Kick effects"): the
 * foot-contact flare of a kick, the "got it" ring on the receiver, the tackle impact / poke-away bursts and the landing mark of a
 * lofted ball, all as soft glowing rings lying flat on the grass.
 * Heat: ONE InstancedMesh (one draw call while any ring lives, none at rest), one shared geometry + material, a fixed pool of
 * RING_CAP slots written in place (no allocation per frame or per spawn). Additive with soft vertex-colour bands, so a ring fades
 * by darkening its instance colour (no per-ring material or opacity).
 */
export const RING_CAP=12;
export type RingKind='flare'|'got'|'impact'|'poke'|'dust';
/** life s; radius from r0 to r1 m (eased out); peak brightness. 'got' contracts onto the receiver's feet. */
export const RING_STYLE:Record<RingKind,{life:number;r0:number;r1:number;peak:number}>={
 flare:{life:.3,r0:.22,r1:1.15,peak:.95},
 got:{life:.42,r0:1.05,r1:.5,peak:.62},
 impact:{life:.5,r0:.35,r1:2.1,peak:1},
 poke:{life:.34,r0:.25,r1:1.3,peak:.85},
 dust:{life:.55,r0:.5,r1:2.4,peak:.28},
};
type Slot={live:boolean;age:number;life:number;x:number;y:number;z:number;r0:number;r1:number;peak:number;r:number;g:number;b:number};
export function createFxRings(){
 // A flat ring with three circles (inner .55, band .82, outer 1): black → colour → black, so the band glows and both edges are soft.
 const SEG=40,radii=[.55,.82,1],shade=[0,1,0],pos=new Float32Array(SEG*3*3),col=new Float32Array(SEG*3*3),idx:number[]=[];
 for(let k=0;k<3;k++)for(let i=0;i<SEG;i++){const a=i/SEG*Math.PI*2,o=(k*SEG+i)*3;pos[o]=Math.cos(a)*radii[k];pos[o+1]=Math.sin(a)*radii[k];pos[o+2]=0;col[o]=col[o+1]=col[o+2]=shade[k];}
 for(let k=0;k<2;k++)for(let i=0;i<SEG;i++){const a=k*SEG+i,b=k*SEG+(i+1)%SEG,c=a+SEG,d=b+SEG;idx.push(a,b,c,b,d,c);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(pos,3));geometry.setAttribute('color',new T.BufferAttribute(col,3));geometry.setIndex(idx);
 const material=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,toneMapped:false});
 const mesh=new T.InstancedMesh(geometry,material,RING_CAP);mesh.name='match-fx-rings';mesh.frustumCulled=false;mesh.renderOrder=2;mesh.count=0;mesh.visible=false;
 mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.setColorAt(0,new T.Color(0,0,0));mesh.instanceColor!.setUsage(T.DynamicDrawUsage);
 const slots:Slot[]=Array.from({length:RING_CAP},()=>({live:false,age:0,life:1,x:0,y:0,z:0,r0:0,r1:1,peak:1,r:1,g:1,b:1}));
 /** The landing mark of a lofted ball (its own slot state, drawn with the pool): position, colour, 0..1 strength. */
 const land={on:false,x:0,y:0,z:0,w:0,r:1,g:1,b:1,clock:0};
 const stats={spawned:0,live:0,maxLive:0,dropped:0};
 let cursor=0;
 /** Start a ring at (x,y,z) (the match root's space) in `color`, `scale` × its style's size. Reuses the oldest slot when full. */
 function spawn(kind:RingKind,x:number,y:number,z:number,color:T.Color,scale=1){
  const st=RING_STYLE[kind];let s=slots[cursor];
  for(let i=0;i<RING_CAP;i++){const c=slots[(cursor+i)%RING_CAP];if(!c.live){s=c;cursor=(cursor+i+1)%RING_CAP;break;}if(i===RING_CAP-1){stats.dropped++;cursor=(cursor+1)%RING_CAP;}}
  s.live=true;s.age=0;s.life=st.life;s.x=x;s.y=y;s.z=z;s.r0=st.r0*scale;s.r1=st.r1*scale;s.peak=st.peak;s.r=color.r;s.g=color.g;s.b=color.b;stats.spawned++;
 }
 /** The landing mark (call every frame while a lofted ball flies; on = false fades it out). */
 function landing(on:boolean,x:number,y:number,z:number,color:T.Color|null){land.on=on;if(on){land.x=x;land.y=y;land.z=z;if(color){land.r=color.r;land.g=color.g;land.b=color.b;}}}
 const m=mesh.instanceMatrix.array as Float32Array;
 const put=(n:number,x:number,y:number,z:number,s:number,r:number,g:number,b:number)=>{const o=n*16;
  // Flat on the grass: the ring's XY plane turned onto XZ (x → x, y → -z), uniform scale s.
  m[o]=s;m[o+1]=0;m[o+2]=0;m[o+3]=0;m[o+4]=0;m[o+5]=0;m[o+6]=-s;m[o+7]=0;m[o+8]=0;m[o+9]=1;m[o+10]=0;m[o+11]=0;m[o+12]=x;m[o+13]=y;m[o+14]=z;m[o+15]=1;
  mesh.instanceColor!.setXYZ(n,r,g,b);};
 /** Advance and write the live rings (compacted to the front of the instance buffer). `enabled` false hides and clears all;
  *  `still` (reduced motion): the landing mark holds its size (no pulse). */
 function update(dt:number,enabled:boolean,still=false){
  if(!enabled){if(mesh.visible||stats.live){for(const s of slots)s.live=false;land.on=false;land.w=0;stats.live=0;mesh.count=0;mesh.visible=false;}return;}
  let n=0;
  for(const s of slots){if(!s.live)continue;s.age+=dt;const t=s.age/s.life;if(t>=1){s.live=false;continue;}
   const e=1-(1-t)*(1-t)*(1-t),rad=s.r0+(s.r1-s.r0)*e,a=s.peak*(t<.12?t/.12:1-(t-.12)/.88);
   put(n++,s.x,s.y,s.z,rad,s.r*a,s.g*a,s.b*a);}
  land.w=Math.max(0,Math.min(1,land.w+(land.on?dt/.18:-dt/.2)));land.clock+=dt;
  if(land.w>0){const wave=still?0:Math.sin(land.clock*9),pulse=.85+.15*wave,a=.55*land.w;put(n++,land.x,land.y,land.z,(.62+.08*wave)*(still?1:1.4-.4*land.w),land.r*a*pulse,land.g*a*pulse,land.b*a*pulse);}
  stats.live=n;stats.maxLive=Math.max(stats.maxLive,n);mesh.count=n;mesh.visible=n>0;
  if(n){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor!.needsUpdate=true;}
 }
 return {mesh,spawn,landing,update,stats,get landingWeight(){return land.w;},dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();mesh.dispose();}};
}
