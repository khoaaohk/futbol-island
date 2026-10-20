import * as T from 'three';
import {Merge,addDiveWreck} from './diveRoom';
import {DIVE_SPOTS,DIVE_SURFACE_Y,diveWreckIslandScale,type DiveSpot} from '../town/water/diveSpots';
import {WATER_LEVEL} from '../town/water/waterDepth';

/**
 * The stranded wrecks seen from the island (Oct 20 2026; user: "the boat can stick out of the water because it got stranded"). The
 * three wreck zones (Captain's Cup galleon, Kelp Forest trawler, Ball Crate cargo ship) lie wedged on their reef crest, bow up and
 * listing; this is the part that stands out of the water: a landmark that tells kids "dive here" from a distance.
 *
 * It is the SAME wreck the dive room builds (diveRoom.ts addDiveWreck, same pose and seed), cut to the triangles that reach above
 * the waterline, placed where the surface preview (divePreview.ts) draws the hull's underwater silhouette (room metres × the zone's
 * blob scale), so the room, the preview and this top agree. Barnacles and weed tint a band at the waterline, the sun bleaches the
 * dry wood a little. No new animals, nothing scary.
 *
 * Heat (AGENTS.md): ONE merged non-indexed mesh per wreck, built only while that zone is within WRECK_TOP.showM (at most
 * WRECK_TOP.keep at once; disposed past showM + 60 m), vertex colours, one shared Lambert material, no texture, no shadow cast
 * or received, no animation (it is stranded: it does not bob), nothing per frame. The host calls `update` on its HUD tick (a few
 * distance compares). Hidden at heat tier 3+ (static ambience; Battery saver is tier 4). It has no collision, so it never blocks the
 * buoy, the Dive prompt, a jetpack Drop in or the swim; it sits at least WRECK_TOP.buoyGap m from the buoy (tests/water-dive.cjs).
 */
export const WRECK_TOP={showM:260,keep:2,waterline:.35,band:.45,buoyGap:6} as const;

const weed=new T.Color('#4f6b3a'),barn=new T.Color('#d9d2c4'),c=new T.Color();
/** The above-water piece's geometry in island coordinates, or null for a zone without a wreck. */
export function wreckTopGeometry(spot:DiveSpot){
 if(!spot.theme.wreck)return null;
 const S=new Merge();addDiveWreck(S,spot,true,null);
 const sc=diveWreckIslandScale(spot),cut=DIVE_SURFACE_Y-WRECK_TOP.waterline,P=S.pos,N=S.nor,C=S.col,pos:number[]=[],nor:number[]=[],col:number[]=[];
 for(let i=0;i<P.length;i+=9){if(Math.max(P[i+1],P[i+4],P[i+7])<cut)continue;
  for(let k=0;k<3;k++){const j=i+k*3,y=P[j+1]-DIVE_SURFACE_Y;
   pos.push(spot.x+P[j]*sc,WATER_LEVEL+y*sc,spot.z+P[j+2]*sc);nor.push(N[j],N[j+1],N[j+2]);
   c.setRGB(C[j],C[j+1],C[j+2]);
   if(Math.abs(y)<WRECK_TOP.band){const h=Math.sin(P[j]*7.1+P[j+2]*5.3)*.5+.5;c.lerp(h>.55?barn:weed,.55*(1-Math.abs(y)/WRECK_TOP.band));}// the waterline band
   else if(y>0)c.multiplyScalar(1.1).lerp(barn,.12);// sun-bleached dry wood
   col.push(c.r,c.g,c.b);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeBoundingBox();g.computeBoundingSphere();return g;
}

export function createDiveWreckTops(scene:T.Object3D,spots:readonly DiveSpot[]=DIVE_SPOTS){
 const wrecks=spots.filter(s=>s.theme.wreck);
 const material=new T.MeshLambertMaterial({vertexColors:true});material.name='dive-wreck-top';
 const built=new Map<string,T.Mesh>();let shown=true;
 const drop=(id:string)=>{const m=built.get(id);if(!m)return;m.removeFromParent();m.geometry.dispose();built.delete(id);};
 return {built,
  /** The HUD tick: build the near wrecks' tops (nearest first, at most WRECK_TOP.keep), drop far ones; hidden at heat tier 3+. */
  update(x:number,z:number,tier:number){
   const show=tier<3;if(show!==shown){shown=show;for(const m of built.values())m.visible=show;}
   const near=wrecks.map(s=>({s,d:Math.hypot(s.x-x,s.z-z)})).filter(o=>o.d<WRECK_TOP.showM).sort((a,b)=>a.d-b.d).slice(0,WRECK_TOP.keep);
   for(const id of [...built.keys()]){const s=wrecks.find(w=>w.id===id)!;if(Math.hypot(s.x-x,s.z-z)>WRECK_TOP.showM+60||(built.size>WRECK_TOP.keep&&!near.some(o=>o.s.id===id)))drop(id);}
   if(!show)return;
   for(const {s} of near)if(!built.has(s.id)&&built.size<WRECK_TOP.keep){const g=wreckTopGeometry(s);if(!g)continue;
    const m=new T.Mesh(g,material);m.name='dive-wreck-top-'+s.id;m.castShadow=m.receiveShadow=false;m.matrixAutoUpdate=false;m.raycast=()=>{};scene.add(m);built.set(s.id,m);}
  },
  triangles(){let t=0;for(const m of built.values())t+=m.geometry.getAttribute('position').count/3;return t;},
  dispose(){for(const id of [...built.keys()])drop(id);material.dispose();},
 };
}
export type DiveWreckTops=ReturnType<typeof createDiveWreckTops>;
