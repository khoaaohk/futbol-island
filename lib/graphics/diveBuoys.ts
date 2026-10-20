import * as T from 'three';
import {WATER_UNIFORMS} from './waterSurface';
import {WATER_LEVEL} from '../town/water/waterDepth';
import type {DiveSpot} from '../town/water/diveSpots';

/**
 * The diving spots' surface marker (water P2, Oct 16 2026; user: "have some type of marker on the top of the water"): an orange float
 * with a short mast and the red-and-white "diver down" flag (red with a white diagonal stripe), at every spot's centre.
 *
 * Heat (AGENTS.md, docs/performance-guide.md "Diving spots (P2)"): ONE InstancedMesh for every buoy (one draw when any is in
 * view, none when frustum-culled), ~150 triangles each, vertex colours, no texture, no shadow cast or received. The bob and the
 * flag's ripple are a vertex-shader term on the island's own water clock (WATER_UNIFORMS.uWaterTime), so there is no per-frame CPU
 * work at all and it only moves while the island renders a frame and the water clock runs (it holds still with reduced motion,
 * static ambience and the governor's slow state, like the sea). The host hides it past BUOY_HIDE_M (a HUD-tick distance compare).
 */
export const BUOY_HIDE_M=220;
/** Sizes (m): the float's radius and height, the mast and the flag (kid-readable from the beach, ~30 m away). */
export const BUOY={floatR:.62,floatH:.7,mast:2.1,flagW:1.25,flagH:.85} as const;

type C=[number,number,number];
const col=(h:string):C=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
/** Merged, non-indexed, vertex-coloured buoy geometry; `aFlag` 0..1 = how far along the flag (its ripple), 0 elsewhere. */
export function buoyGeometry(){
 const pos:number[]=[],cl:number[]=[],flag:number[]=[];
 const tri=(a:number[],b:number[],c:number[],k:C,f=[0,0,0])=>{pos.push(...a,...b,...c);for(let i=0;i<3;i++){cl.push(...k);flag.push(f[i]);}};
 const ring=(r0:number,y0:number,r1:number,y1:number,k:C,n=10)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;
  const p=[Math.cos(a)*r0,y0,Math.sin(a)*r0],q=[Math.cos(b)*r0,y0,Math.sin(b)*r0],r=[Math.cos(b)*r1,y1,Math.sin(b)*r1],s=[Math.cos(a)*r1,y1,Math.sin(a)*r1];
  tri(p,r,q,k);tri(p,s,r,k);}};
 const orange=col('#ff8a1f'),white=col('#fbf7ea'),dark=col('#3a3f44'),red=col('#e0322b');
 // The float: a fat orange drum with a white band, a rounded top, sitting a third under the water line.
 const y0=-.25;ring(BUOY.floatR*.75,y0,BUOY.floatR,y0+.18,orange);ring(BUOY.floatR,y0+.18,BUOY.floatR,y0+.36,white);ring(BUOY.floatR,y0+.36,BUOY.floatR,y0+.52,orange);
 ring(BUOY.floatR,y0+.52,BUOY.floatR*.45,y0+BUOY.floatH,orange);ring(BUOY.floatR*.45,y0+BUOY.floatH,0,y0+BUOY.floatH+.02,orange);
 // The mast and a small white cap.
 ring(.05,y0+BUOY.floatH,.05,y0+BUOY.floatH+BUOY.mast,dark,6);ring(.09,y0+BUOY.floatH+BUOY.mast,0,y0+BUOY.floatH+BUOY.mast+.12,white,6);
 // The flag (both faces): red, with the white diagonal stripe from the top of the mast side to the bottom of the fly.
 const fy1=y0+BUOY.floatH+BUOY.mast-.02,fy0=fy1-BUOY.flagH,NX=6,NY=4,stripe=.17;
 for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){
  const u0=i/NX,u1=(i+1)/NX,v0=j/NY,v1=(j+1)/NY,cu=(u0+u1)/2,cv=(v0+v1)/2,onStripe=Math.abs((1-cv)-cu)<stripe;
  const k=onStripe?white:red,P=(u:number,v:number)=>[.05+u*BUOY.flagW,fy0+v*BUOY.flagH,0];
  tri(P(u0,v0),P(u1,v0),P(u1,v1),k,[u0,u1,u1]);tri(P(u0,v0),P(u1,v1),P(u0,v1),k,[u0,u1,u0]);
  tri(P(u0,v0),P(u1,v1),P(u1,v0),k,[u0,u1,u1]);tri(P(u0,v0),P(u0,v1),P(u1,v1),k,[u0,u0,u1]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,3));
 g.setAttribute('aFlag',new T.Float32BufferAttribute(flag,1));g.computeVertexNormals();g.computeBoundingSphere();return g;
}

export function createDiveBuoys(spots:readonly DiveSpot[]){
 const geometry=buoyGeometry(),material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});material.name='dive-buoys';
 const phase=new T.InstancedBufferAttribute(new Float32Array(spots.map((_,i)=>i*2.17)),1);geometry.setAttribute('aBuoyPhase',phase);
 material.onBeforeCompile=sh=>{sh.uniforms.uWaterTime=WATER_UNIFORMS.uWaterTime;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWaterTime;attribute float aFlag,aBuoyPhase;')
   .replace('#include <begin_vertex>',/* glsl */`#include <begin_vertex>
    float bt=uWaterTime+aBuoyPhase;
    // The flag ripples along its fly (more toward the free end), the whole buoy bobs and rocks with the swell.
    transformed.z+=sin(bt*4.2-aFlag*5.)*.09*aFlag;
    float rockX=sin(bt*1.3)*.07,rockZ=cos(bt*1.1)*.06,yy=transformed.y;
    transformed.y+=sin(bt*1.7)*.07;transformed.x+=yy*rockZ;transformed.z+=yy*rockX;`);};
 material.customProgramCacheKey=()=>'dive-buoy-v1';
 const mesh=new T.InstancedMesh(geometry,material,Math.max(1,spots.length));mesh.name='dive-buoys';mesh.castShadow=mesh.receiveShadow=false;mesh.raycast=()=>{};
 const m=new T.Matrix4();spots.forEach((s,i)=>mesh.setMatrixAt(i,m.makeTranslation(s.x,WATER_LEVEL,s.z)));mesh.count=spots.length;mesh.instanceMatrix.needsUpdate=true;
 mesh.computeBoundingSphere();mesh.matrixAutoUpdate=false;mesh.updateMatrix();
 return {root:mesh,triangles:geometry.getAttribute('position').count/3,
  /** Hide past BUOY_HIDE_M (call on the HUD tick with the player's position; a few compares). */
  near(x:number,z:number){let v=false;for(const s of spots)if(Math.hypot(s.x-x,s.z-z)<BUOY_HIDE_M){v=true;break;}if(mesh.visible!==v)mesh.visible=v;},
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();mesh.dispose();}};
}
export type DiveBuoys=ReturnType<typeof createDiveBuoys>;
