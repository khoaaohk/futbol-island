import * as T from 'three';
import {DIVE_ROOM_R,DIVE_SLOTS,DIVE_SPOTS,diveBlobR,type DiveSpot} from '../town/water/diveSpots';
import {UW_SURFACE} from '../town/fishing/underwater';
import {DIVE_SHOAL,WATER_UNIFORMS,clearWinNoise} from './waterSurface';
import {createOceanBlend} from './swimClear';

/**
 * The dive shoal's seabed preview (Oct 20 2026, user: "these dive spots need to look more like the shore where it's see through",
 * then "blend in more on the edges ... it needs to feel like a shallow coral area").
 *
 * The dive room itself is a sealed scene built only on Dive (diveRoom.ts), so from the surface there was nothing under the patch: the
 * ocean drew an opaque tinted blob. Now, for the DIVE_SLOTS (2) nearest zones within DIVE_PREVIEW.view m of the player, ONE merged
 * mesh per zone sits under the water: a blob-shaped sand shelf (shoaling up toward the heart, dappled sand and darker coral / rock
 * blotches in its vertex colours), scattered low-poly coral heads and rocks (denser toward the heart, thinning at the edge) and, for a
 * wreck zone, a sunken hull outline. The ocean's blended program (the shared createOceanBlend, as the shore window and the swim disc)
 * turns see-through over it (waterSurface.ts uDiveClear, DIVE_SHOAL.alpha at the heart, back to opaque through the soft edge).
 *
 * Cost: no textures, no extra pass; MeshBasicMaterial with baked shade + depth tint (one shared material, vertex colours); per zone
 * <= DIVE_PREVIEW.maxTris triangles (tests/dive-preview.cjs), at most 2 draws. Geometry is built once per zone on first need (<= 7
 * zones, kept). Off (meshes hidden, the blend released, uDiveClear 0 = the opaque lighter shoal) at heat tiers 3-4 / Battery saver
 * (Town passes the effective tier, a phone's tier 2 counts as 3) and while diving. Per frame: two distance tests and two uniform writes.
 */
export const DIVE_PREVIEW={view:[170,120,80] as const,fade:.6,rings:8,segs:48,reach:1.3,depth:[1.25,3.4] as const,maxTris:2600} as const;

const hash=(i:number,k:number)=>{const s=Math.sin(i*127.1+k*311.7)*43758.5453;return s-Math.floor(s);};
const WATER=new T.Color('#1aa3ae'),DEEP=new T.Color('#1f6f7e');// sRGB hex (linear in the vertex colours)// DEEP ~ the open sea's teal, so a rim seen through the swim disc reads as deep water
/** The seabed's depth below the surface at blob fraction t (0 heart .. 1 the dive outline .. DIVE_PREVIEW.reach). */
// Past the dive outline the shelf drops below the shore window's seabed floor (clearWindow.ts CLEAR_BED.floor 4.2 m), so near a
// beach that bed covers the preview's rim instead of the rim cutting a dark edge across it.
export const previewDepth=(t:number)=>{const u=Math.min(1,Math.max(0,(t-.15)/(1.05-.15))),o=Math.min(1,Math.max(0,(t-1)/(DIVE_PREVIEW.reach-1)));
 return DIVE_PREVIEW.depth[0]+(DIVE_PREVIEW.depth[1]-DIVE_PREVIEW.depth[0])*u*u*(3-2*u)+1.6*o;};

/** Build one zone's merged preview (island coordinates, y = world). Non-indexed: position + color. */
/** `bedAt` (optional): the shore window's seabed depth there (clearWindow.ts clearBedDepthAt; Infinity far out). Near a beach that bed
 *  can be shallower than the shelf: the shelf rides just over it (never hidden under the shore's sand) and keeps its sand at the rim. */
export function buildDivePreview(spot:DiveSpot,bedAt?:(x:number,z:number)=>number){
 const depthAt=(x:number,z:number,t:number)=>{const b=bedAt?bedAt(x,z):Infinity,pd=previewDepth(t);if(!Number.isFinite(b))return pd;
  // Over a shallower shore bed: just above it inside the outline, tucked under it past the outline (the shore's sand covers the rim).
  const o=Math.min(1,Math.max(0,(t-.95)/.2));return Math.min(pd,b-.15)*(1-o)+(b+.4)*o;};
 const bedFar=(x:number,z:number)=>{const b=bedAt?bedAt(x,z):Infinity;return Number.isFinite(b)?Math.min(1,Math.max(0,(b-3.4)/.8)):1;};
 const P:number[]=[],C:number[]=[],col=new T.Color(),tmp=new T.Color(),sea=WATER;
 const sandA=new T.Color(spot.theme.sand[0]),sandB=new T.Color(spot.theme.sand[1]),rockA=new T.Color(spot.theme.rock[0]),rockB=new T.Color(spot.theme.rock[1]);
 const tint=(c:T.Color,depth:number,shade:number,base=.18)=>{const w=Math.min(1,depth/DIVE_PREVIEW.depth[1]);tmp.copy(c).multiplyScalar(shade);const f=base>.25?1:.45;tmp.r*=1-f*(.6+.15*w);tmp.g*=1-.1*f;tmp.b=Math.max(tmp.b,tmp.g*(.95*f));tmp.lerp(sea,base+.25*w);return tmp;};// water absorbs red first: the sand reads turquoise, as at the shore
 const push=(x:number,y:number,z:number,c:T.Color)=>{P.push(x,y,z);C.push(c.r,c.g,c.b);};
 // 1. The sand shelf: a polar grid bent to the blob, out to `reach` x the outline (the ocean is opaque again before its rim).
 const {rings,segs,reach}=DIVE_PREVIEW,V:{x:number;y:number;z:number;c:T.Color}[][]=[];
 for(let r=0;r<=rings;r++){const row:typeof V[number]=[];const t=r/rings*reach;
  for(let s=0;s<(r?segs:1);s++){const a=s/segs*Math.PI*2,R=diveBlobR(spot,a)*t,x=spot.x+Math.cos(a)*R,z=spot.z+Math.sin(a)*R,dp=depthAt(x,z,t);
   // Dappled sand (two noises) and darker coral / rock blotches, more of them toward the heart.
   const n=clearWinNoise(x,z,.21,.47,spot.blob),m=clearWinNoise(x,z,.33,.17,spot.blob*3+5);
   col.copy(sandA).lerp(sandB,n);const blot=Math.max(0,(m-.58)/.42)*(1.15-Math.min(1,t));
   if(blot>0)col.lerp(rockA.clone().lerp(new T.Color(spot.theme.coral[Math.floor(hash(r*61+s,spot.blob)*spot.theme.coral.length)]),.35),Math.min(.8,blot*2.2));
   // The shelf's rim sinks into the deep-water colour, so where the swim disc / shore window clears past it there is no edge.
   const rim=Math.min(1,Math.max(0,(t-.8)/(reach-.8)));row.push({x,y:UW_SURFACE-dp,z,c:tint(col,dp,.9+.1*n,.28).clone().lerp(DEEP,rim*rim*(3-2*rim)*bedFar(x,z))});}
  V.push(row);}
 const vtx=(v:{x:number;y:number;z:number;c:T.Color})=>push(v.x,v.y,v.z,v.c);
 for(let r=1;r<=rings;r++)for(let s=0;s<segs;s++){const s1=(s+1)%segs,a=V[r][s],b=V[r][s1];
  if(r===1){vtx(V[0][0]);vtx(b);vtx(a);continue;}const c=V[r-1][s],d=V[r-1][s1];vtx(c);vtx(d);vtx(a);vtx(d);vtx(b);vtx(a);}
 // 2. Coral heads and rocks: seeded, denser toward the heart (t = u^1.15 over the outline), thinning out by the edge.
 const shapes={mound:new T.IcosahedronGeometry(1,0),branch:new T.ConeGeometry(.45,1,5,1),rock:new T.DodecahedronGeometry(1,0)};
 const M=new T.Matrix4(),Q=new T.Quaternion(),S=new T.Vector3(),PO=new T.Vector3(),N=new T.Vector3(),E=new T.Euler();
 const addShape=(g:T.BufferGeometry,m:T.Matrix4,c:T.Color,depth:number)=>{const pos=g.getAttribute('position'),idx=g.getIndex(),cnt=idx?idx.count:pos.count,A=new T.Vector3(),B=new T.Vector3(),D=new T.Vector3();
  for(let i=0;i<cnt;i+=3){const ia=idx?idx.getX(i):i,ib=idx?idx.getX(i+1):i+1,ic=idx?idx.getX(i+2):i+2;
   A.fromBufferAttribute(pos,ia).applyMatrix4(m);B.fromBufferAttribute(pos,ib).applyMatrix4(m);D.fromBufferAttribute(pos,ic).applyMatrix4(m);
   N.subVectors(B,A).cross(PO.subVectors(D,A)).normalize();const k=tint(c,depth,.6+.45*Math.max(0,N.y)+.08*N.x).clone();
   push(A.x,A.y,A.z,k);push(B.x,B.y,B.z,k);push(D.x,D.y,D.z,k);}};
 const heads=Math.round(spot.radius*2.8),coral=spot.theme.coral,fan=spot.theme.fan,an=spot.theme.anemone;
 for(let i=0;i<heads;i++){const a=hash(i,spot.blob+1)*Math.PI*2,t=Math.pow(hash(i,spot.blob+2),1.15)*1.02,R=diveBlobR(spot,a)*t*.96,x=spot.x+Math.cos(a)*R,z=spot.z+Math.sin(a)*R;
  const dp=depthAt(x,z,t),y=UW_SURFACE-dp,h=hash(i,spot.blob+3),sz=Math.min((.55+.7*hash(i,spot.blob+4))*(1.1-.45*t)*(spot.radius>15?1.15:1),(dp-.5)/1.2);if(sz<.2)continue;// never up through the surface
  if(h<.42){col.set(coral[Math.floor(hash(i,7)*coral.length)]);S.set(sz*1.1,sz*.55,sz);E.set(0,hash(i,8)*6.28,0);M.compose(PO.set(x,y,z),Q.setFromEuler(E),S);addShape(shapes.mound,M,col,dp-sz*.5);}
  else if(h<.72){col.set(fan[Math.floor(hash(i,9)*fan.length)]);for(let b=0;b<3;b++){const ba=hash(i*3+b,10)*6.28,bo=sz*.45;E.set((hash(i*3+b,11)-.5)*.7,0,(hash(i*3+b,12)-.5)*.7);S.set(sz*.8,sz*1.3,sz*.8);
   M.compose(PO.set(x+Math.cos(ba)*bo,y+sz*.5,z+Math.sin(ba)*bo),Q.setFromEuler(E),S);addShape(shapes.branch,M,col,dp-sz);}}
  else if(h<.86){col.set(an[Math.floor(hash(i,13)*an.length)]);S.set(sz*.6,sz*.35,sz*.6);M.compose(PO.set(x,y,z),Q.identity(),S);addShape(shapes.mound,M,col,dp-.3);}
  else{col.copy(rockA).lerp(rockB,hash(i,14));S.set(sz*1.4,sz*.7,sz*1.2);E.set(0,hash(i,15)*6.28,0);M.compose(PO.set(x,y,z),Q.setFromEuler(E),S);addShape(shapes.rock,M,col,dp-.4);}}
 // 3. A wreck zone: the sunken hull's outline where the room puts it (room metres scaled to the blob), tilted, a broken mast across it.
 const w=spot.theme.wreck;
 if(w){const sc=spot.radius/DIVE_ROOM_R,wx=spot.x+w.x*sc,wz=spot.z+w.z*sc,L=Math.max(7,spot.radius*.55),t=Math.hypot(w.x,w.z)/DIVE_ROOM_R,dp=Math.min(Math.max(previewDepth(t),2.2),depthAt(wx,wz,0)+1),y=UW_SURFACE-dp;
  const wood=new T.Color('#6e4b2c'),deck=new T.Color('#4a3320'),box=new T.BoxGeometry(1,1,1);Q.setFromEuler(E.set(.06,w.yaw,.12));
  M.compose(PO.set(wx,y+.35,wz),Q,S.set(L*.32,1.1,L));addShape(box,M,wood,dp-1);
  M.compose(PO.set(wx,y+.95,wz),Q,S.set(L*.24,.12,L*.8));addShape(box,M,deck,dp-1);
  const prow=new T.ConeGeometry(.5,1,4,1);prow.rotateX(Math.PI/2);M.compose(PO.set(wx+Math.sin(w.yaw)*L*.6,y+.35,wz+Math.cos(w.yaw)*L*.6),Q,S.set(L*.45,1.1,L*.25));addShape(prow,M,wood,dp-1);
  const mast=new T.CylinderGeometry(.18,.22,1,5,1);mast.rotateZ(Math.PI/2);Q.setFromEuler(E.set(0,w.yaw+.9,.08));M.compose(PO.set(wx,y+1.1,wz),Q,S.set(L*.8,1,1));addShape(mast,M,deck,dp-1.2);
  box.dispose();prow.dispose();mast.dispose();}
 for(const g of Object.values(shapes))g.dispose();
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));geo.computeBoundingSphere();
 return geo;
}

export function createDivePreview(scene:T.Scene,bedAt?:(x:number,z:number)=>number,spots:readonly DiveSpot[]=DIVE_SPOTS){
 const blend=createOceanBlend(scene),mat=new T.MeshBasicMaterial({vertexColors:true,fog:false});mat.name='dive-preview';// no fog: the island's haze would wash it milky under the water
 const cache=new Map<string,T.BufferGeometry>(),meshes:T.Mesh[]=[],k:number[]=[],cur:(DiveSpot|null)[]=[];
 for(let i=0;i<DIVE_SLOTS;i++){const m=new T.Mesh(new T.BufferGeometry(),mat);m.name='dive-preview-'+i;m.visible=false;m.castShadow=m.receiveShadow=false;m.matrixAutoUpdate=false;m.raycast=()=>{};scene.add(m);meshes.push(m);k.push(0);cur.push(null);}
 const empty=meshes[0].geometry;
 const geoOf=(s:DiveSpot)=>{let g=cache.get(s.id);if(!g){g=buildDivePreview(s,bedAt);cache.set(s.id,g);}return g;};
 const U=WATER_UNIFORMS.uDiveSpots.value,CL=WATER_UNIFORMS.uDiveClear.value;
 let tris=0;
 return {
  /** Once per rendered frame: the player's (x, z), the effective heat tier (Battery saver = 4) and whether the island is live (not diving). */
  update(dt:number,x:number,z:number,tier:number,live=true){
   const view=tier<3?DIVE_PREVIEW.view[Math.max(0,tier)]:0;let any=false;tris=0;
   for(let i=0;i<DIVE_SLOTS;i++){const u=U[i];let spot:DiveSpot|null=null;
    if(u.w>0)for(const s of spots)if(s.x===u.x&&s.z===u.y){spot=s;break;}
    if(spot!==cur[i]){cur[i]=spot;k[i]=0;meshes[i].geometry=spot?geoOf(spot):empty;}
    const want=live&&spot&&view>0&&Math.hypot(spot.x-x,spot.z-z)<view?1:0;
    k[i]=want>k[i]?Math.min(1,k[i]+dt/DIVE_PREVIEW.fade):Math.max(0,k[i]-dt/DIVE_PREVIEW.fade);
    const kk=k[i]*k[i]*(3-2*k[i]);CL[i]=kk;meshes[i].visible=kk>0;
    if(kk>0){any=true;tris+=(meshes[i].geometry.getAttribute('position')?.count??0)/3;}}
   if(any)blend.hold();else blend.release();
  },
  get stats(){return {draws:meshes.filter(m=>m.visible).length,triangles:tris,built:cache.size,clear:[...CL]};},
  meshes,
  dispose(){blend.release();for(let i=0;i<DIVE_SLOTS;i++){CL[i]=0;meshes[i].removeFromParent();}for(const g of cache.values())g.dispose();cache.clear();empty.dispose();mat.dispose();},
 };
}
export type DivePreview=ReturnType<typeof createDivePreview>;
