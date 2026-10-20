import * as T from 'three';
import {DIVE_ROOM_R,DIVE_SLOTS,DIVE_SPOTS,diveBlobR,diveRipple,type DiveSpot} from '../town/water/diveSpots';
import {UW_SURFACE,clearReefKit} from '../town/fishing/underwater';
import {DIVE_SHOAL,WATER_UNIFORMS,clearWinNoise,diveShoreD} from './waterSurface';
import {createOceanBlend} from './swimClear';

/**
 * The dive shoal's seabed preview (Oct 20 2026, user: "these dive spots need to look more like the shore where it's see through",
 * "blend in more on the edges", "the items in the water need to be more blurred so there's depth", "it needs to match what the shore
 * looks like", "shallow places in the middle of dark ocean").
 *
 * A shoal is drawn as the shore's own shallows rising out of the dark sea. The ocean shader reads a shore distance that eases from
 * the open sea's to DIVE_SHOAL.heart toward the heart (waterSurface.ts diveShoreD). Under it, for the DIVE_SLOTS (2) nearest zones in
 * range, this module lays ONE merged mesh per zone:
 *  - a blob-shaped sand shelf at the shore bed's depth for that shore distance. The sandy heart is about 1.6 m down. It sinks toward
 *    the edge, and past the outline it drops below the shore bed's 4.2 m floor. Its colours are the shore bed's own sand, teal and deep
 *    palette, with faint sand ripples;
 *  - the shore's seabed props, muted: sea-grass tufts (the shore's reef-kit tuft), fans and low coral heads in dull browns, olive and
 *    mauve, and dark rocks, clustered in patches toward the heart;
 *  - the wreck's dark hull, on wreck zones only.
 * Its material is the shore seabed's (clearWindow.ts underMaterial 'shoal'): moving caustic light lines, depth absorption and
 * desaturation, soft silhouettes, the surface pattern over it and the refraction shimmer. So the props read as down on the seabed.
 *
 * Cost: no new textures (it uses the shore window's noise texture) and no extra pass. Per zone it stays under DIVE_PREVIEW.maxTris
 * triangles (tests/dive-see-through.cjs), with at most 2 draws in all. Geometry is built once per zone on first need (≤ 7 zones,
 * kept). Off means meshes hidden, the blend released and uDiveClear 0 (the opaque shoal colour only). It is off at heat tiers 3-4
 * and Battery saver (Town passes the effective tier; a phone's tier 2 counts as 3) and while diving. Per frame: two distance tests
 * and two uniform writes.
 */
export const DIVE_PREVIEW={view:[170,120,80] as const,fade:.6,rings:8,segs:40,reach:1.3,floor:3,far:40,maxTris:2600} as const;

const hash=(i:number,k:number)=>{const s=Math.sin(i*127.1+k*311.7)*43758.5453;return s-Math.floor(s);};
const sm=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/** The shoal weight at blob fraction t, as the ocean shader draws it (without the edge noise). */
export const shoalK=(t:number)=>{const a=1-sm(DIVE_SHOAL.inner,DIVE_SHOAL.fade,t);return a*a*(3-2*a);};
/** The shore distance the shoal looks like at blob fraction t (the open sea taken as DIVE_PREVIEW.far m). */
export const shoalD=(t:number)=>diveShoreD(DIVE_PREVIEW.far,shoalK(t));
/** The seabed's depth below the surface at blob fraction t. It follows the shore bed's curve (clearWindow.ts) for that shore distance,
 *  on a shallower floor. Past the outline it drops below the shore window's bed floor (4.2 m), so a beach's bed covers the rim. */
export const previewDepth=(t:number)=>.05+DIVE_PREVIEW.floor*(1-Math.exp(-shoalD(t)/3.4))+1.6*sm(1,DIVE_PREVIEW.reach,t);
/** Dull reef colours, multiplied by the kit's neutral paint: browns and rust, olive, muted mauve. Dark rocks. The grass greens. */
const MUTED=['#6f5640','#7b5a43','#66683f','#6e5f68','#5b6248'].map(c=>new T.Color(c)),ROCK=['#3f4746','#4a514c','#3a3f3d'].map(c=>new T.Color(c));
const GRASS=['#3f6b45','#4d7a48','#5b7d3e'].map(c=>new T.Color(c));
/** The stranded wreck's under-water hull in the preview: `hull` false skips it (for when the above-water wreck piece draws its own hull);
 *  `under` = how far under the surface its top stays (m). */
export const DIVE_PREVIEW_WRECK={hull:true,under:.15};

/** Build one zone's merged preview (island coordinates, y = world). Non-indexed: position, color, normal.
 *  `bedAt` (optional) is the shore window's seabed depth there (clearWindow.ts clearBedDepthAt; Infinity far out). Near a beach that
 *  bed can be shallower than the shelf: the shelf rides just over it inside the outline and tucks under it past the outline. */
export function buildDivePreview(spot:DiveSpot,bedAt?:(x:number,z:number)=>number){
 const depthAt=(x:number,z:number,t:number)=>{const b=bedAt?bedAt(x,z):Infinity,pd=previewDepth(t);if(!Number.isFinite(b))return pd;
  const o=Math.min(1,Math.max(0,(t-.95)/.2));return Math.min(pd,b-.15)*(1-o)+(b+.4)*o;};
 const P:number[]=[],C:number[]=[],col=new T.Color(),TEAL=new T.Color().setRGB(.2,.5,.52),DEEP=new T.Color().setRGB(.08,.36,.42);
 const push=(x:number,y:number,z:number,c:T.Color)=>{P.push(x,y,z);C.push(c.r,c.g,c.b);};
 // 1. The sand shelf: a polar grid bent to the blob, out to `reach` × the outline. Its colour is the shore bed's (clearWindow.ts
 //    underMaterial 'bed'): pale patchy sand, teal past ~1.5 m of shore distance, the deep teal by ~9-24 m (linear values).
 const {rings,segs,reach}=DIVE_PREVIEW,V:{x:number;y:number;z:number;c:T.Color}[][]=[];
 for(let r=0;r<=rings;r++){const row:typeof V[number]=[];const t=r/rings*reach,sd=shoalD(t);
  for(let s=0;s<(r?segs:1);s++){const a=s/segs*Math.PI*2,R=diveBlobR(spot,a)*t,x=spot.x+Math.cos(a)*R,z=spot.z+Math.sin(a)*R,dp=depthAt(x,z,t);
   const n=sm(.3,.75,clearWinNoise(x,z,.21,.47,spot.blob)*.6+clearWinNoise(x,z,.09,.33,spot.blob+3)*.5)*.85+.15*diveRipple(x*.6,z*.6);
   col.setRGB(.72+.14*n,.68+.14*n,.52+.14*n).lerp(TEAL,sm(1.5,9,sd)*.75).lerp(DEEP,sm(9,24,sd));
   row.push({x,y:UW_SURFACE-dp,z,c:col.clone()});}
  V.push(row);}
 const vtx=(v:{x:number;y:number;z:number;c:T.Color})=>push(v.x,v.y,v.z,v.c);
 for(let r=1;r<=rings;r++)for(let s=0;s<segs;s++){const s1=(s+1)%segs,a=V[r][s],b=V[r][s1];
  if(r===1){vtx(V[0][0]);vtx(b);vtx(a);continue;}const c=V[r-1][s],d=V[r-1][s1];vtx(c);vtx(d);vtx(a);vtx(d);vtx(b);vtx(a);}
 // 2. Props in patches toward the heart: each patch has grass tufts, a fan or a low coral head, and a rock.
 const kit=clearReefKit(),ico=new T.IcosahedronGeometry(1,0),rock=new T.DodecahedronGeometry(1,0);
 const M=new T.Matrix4(),Q=new T.Quaternion(),S=new T.Vector3(),PO=new T.Vector3(),E=new T.Euler(),A=new T.Vector3(),paint=new T.Color(),k=new T.Color();
 const addShape=(g:T.BufferGeometry,m:T.Matrix4,c:T.Color)=>{const pos=g.getAttribute('position'),pc=g.getAttribute('color'),idx=g.getIndex(),cnt=idx?idx.count:pos.count;
  for(let i=0;i<cnt;i++){const v=idx?idx.getX(i):i;A.fromBufferAttribute(pos,v).applyMatrix4(m);k.copy(c);if(pc)k.multiply(paint.fromBufferAttribute(pc as T.BufferAttribute,v));push(A.x,A.y,A.z,k);}};
 const fracAt=(x:number,z:number)=>Math.hypot(x-spot.x,z-spot.z)/Math.max(1,diveBlobR(spot,Math.atan2(z-spot.z,x-spot.x)));
 const clusters=Math.max(3,Math.round(spot.radius*.32)),tufts=3,seed=spot.blob*7;
 for(let c=0;c<clusters;c++){const a=hash(c,seed+1)*Math.PI*2,tc=Math.pow(hash(c,seed+2),1.4)*.8,Rc=diveBlobR(spot,a)*tc,cx=spot.x+Math.cos(a)*Rc,cz=spot.z+Math.sin(a)*Rc;
  for(let m=0;m<tufts+2;m++){const j=c*13+m,h=hash(j,seed+3),ba=hash(j,seed+4)*6.283,bd=.6+hash(j,seed+5)*2.6,x=cx+Math.cos(ba)*bd,z=cz+Math.sin(ba)*bd,t=fracAt(x,z);
   if(t>1)continue;const dp=depthAt(x,z,t),y=UW_SURFACE-dp,room=dp-.45;if(room<.3)continue;Q.setFromEuler(E.set(0,hash(j,seed+6)*6.283,0));
   if(m<tufts-1){const sc=Math.min(1.3+h*1.2,room/.6);M.compose(PO.set(x,y,z),Q,S.set(sc,sc,sc));addShape(kit.grass,M,GRASS[Math.floor(h*GRASS.length)]);}
   else if(m===tufts-1){const sc=Math.min(.5+.5*h,room/.7);M.compose(PO.set(x,y-sc*.2,z),Q,S.set(sc*1.4,sc*.8,sc*1.2));addShape(ico,M,MUTED[Math.floor(hash(j,seed+9)*MUTED.length)]);}
   else if(m===tufts&&h<.55){const sc=Math.min(1.1+h,room/.62);M.compose(PO.set(x,y,z),Q,S.set(sc,sc,sc));addShape(kit.fan,M,MUTED[Math.floor(hash(c,seed+7)*MUTED.length)]);}
   else if(m===tufts){const sc=Math.min(.45+.4*h,room/.7);M.compose(PO.set(x,y-sc*.15,z),Q,S.set(sc*1.3,sc*.7,sc*1.3));addShape(ico,M,MUTED[Math.floor(hash(c,seed+8)*MUTED.length)]);}
   else{const sc=Math.min(.35+.45*h,room/.6);M.compose(PO.set(x,y-sc*.3,z),Q,S.set(sc*1.3,sc*.6,sc));addShape(rock,M,ROCK[Math.floor(h*ROCK.length)]);}}}
 // A few lone tufts and pebbles on the open sand between the patches.
 for(let i=0;i<Math.round(spot.radius*.4);i++){const a=hash(i,seed+20)*6.283,t=.2+hash(i,seed+21)*.75,R=diveBlobR(spot,a)*t,x=spot.x+Math.cos(a)*R,z=spot.z+Math.sin(a)*R,h=hash(i,seed+22);
  const dp=depthAt(x,z,t),y=UW_SURFACE-dp;if(dp<.8)continue;Q.setFromEuler(E.set(0,h*6.283,0));
  if(h<.6){const sc=Math.min(1+h,(dp-.45)/.6);M.compose(PO.set(x,y,z),Q,S.set(sc,sc,sc));addShape(kit.grass,M,GRASS[i%GRASS.length]);}
  else{const sc=.25+.3*h;M.compose(PO.set(x,y-sc*.3,z),Q,S.set(sc*1.2,sc*.6,sc));addShape(rock,M,ROCK[i%ROCK.length]);}}
 // 3. A wreck zone: the boat stranded on the reef crest (Oct 20 2026, user: the wrecks are boats stranded on the reef, part of the
 //    hull out of the water). The preview draws only its under-water hull: on the crest's seabed where the room puts it (room metres
 //    scaled to the blob), heeled over, its top just under the surface. The part above the water is a separate piece; once that piece
 //    draws the under-water hull too, set DIVE_PREVIEW_WRECK.hull = false so the preview skips it (no double draw).
 const w=spot.theme.wreck;
 if(w&&DIVE_PREVIEW_WRECK.hull){const sc=spot.radius/DIVE_ROOM_R,wx=spot.x+w.x*sc,wz=spot.z+w.z*sc,L=Math.max(7,spot.radius*.55),t=Math.min(.9,Math.hypot(w.x,w.z)/DIVE_ROOM_R),sb=depthAt(wx,wz,t),hh=Math.max(.6,sb-DIVE_PREVIEW_WRECK.under-L*(.16*.24+.6*.1)),yc=UW_SURFACE-sb+hh/2;
  const wood=new T.Color('#3a2a1c'),deck=new T.Color('#2a1f15'),box=new T.BoxGeometry(1,1,1);Q.setFromEuler(E.set(.1,w.yaw,.24));
  M.compose(PO.set(wx,yc,wz),Q,S.set(L*.32,hh,L));addShape(box,M,wood);
  M.compose(PO.set(wx,yc+hh/2-.06,wz),Q,S.set(L*.24,.1,L*.8));addShape(box,M,deck);
  const prow=new T.ConeGeometry(.5,1,4,1);prow.rotateX(Math.PI/2);M.compose(PO.set(wx+Math.sin(w.yaw)*L*.6,yc,wz+Math.cos(w.yaw)*L*.6),Q,S.set(L*.45,hh,L*.25));addShape(prow,M,wood);
  const mast=new T.CylinderGeometry(.18,.22,1,5,1);mast.rotateZ(Math.PI/2);Q.setFromEuler(E.set(0,w.yaw+.9,.08));M.compose(PO.set(wx+L*.3,UW_SURFACE-sb+.25,wz-L*.2),Q,S.set(L*.8,1,1));addShape(mast,M,deck);
  box.dispose();prow.dispose();mast.dispose();}
 for(const g of Object.values(kit))g.dispose();ico.dispose();rock.dispose();
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));geo.computeVertexNormals();geo.computeBoundingSphere();
 return geo;
}

/** `material` is the shore seabed's look (Town passes clearWin.shoalMaterial(), owned by the window). Without one (tests) it uses a plain unlit one. */
export function createDivePreview(scene:T.Scene,bedAt?:(x:number,z:number)=>number,material?:T.Material,spots:readonly DiveSpot[]=DIVE_SPOTS){
 const blend=createOceanBlend(scene),own=!material,mat=material??new T.MeshBasicMaterial({vertexColors:true,fog:false});if(own)mat.name='dive-preview';
 const cache=new Map<string,T.BufferGeometry>(),meshes:T.Mesh[]=[],k:number[]=[],cur:(DiveSpot|null)[]=[];
 for(let i=0;i<DIVE_SLOTS;i++){const m=new T.Mesh(new T.BufferGeometry(),mat);m.name='dive-preview-'+i;m.visible=false;m.castShadow=m.receiveShadow=false;m.matrixAutoUpdate=false;m.raycast=()=>{};scene.add(m);meshes.push(m);k.push(0);cur.push(null);}
 const empty=meshes[0].geometry;
 const geoOf=(s:DiveSpot)=>{let g=cache.get(s.id);if(!g){g=buildDivePreview(s,bedAt);cache.set(s.id,g);}return g;};
 const U=WATER_UNIFORMS.uDiveSpots.value,CL=WATER_UNIFORMS.uDiveClear.value;
 let tris=0;
 return {
  /** Once per rendered frame, with the player's (x, z), the effective heat tier (Battery saver = 4) and whether the island is live (not diving). */
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
  dispose(){blend.release();for(let i=0;i<DIVE_SLOTS;i++){CL[i]=0;meshes[i].removeFromParent();}for(const g of cache.values())g.dispose();cache.clear();empty.dispose();if(own)mat.dispose();},
 };
}
export type DivePreview=ReturnType<typeof createDivePreview>;
