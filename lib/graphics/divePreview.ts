import * as T from 'three';
import {DIVE_ROOM_R,DIVE_SLOTS,DIVE_SPOTS,diveBlobR,diveCrestMask,diveDepthAt,diveRipple,type DiveSpot} from '../town/water/diveSpots';
import {diveLayout,diveLayoutCover,type DiveLayout} from '../town/water/diveLayout';
import {clearReefKit} from '../town/fishing/underwater';
import {DIVE_SHOAL,WATER_UNIFORMS,clearWinNoise,diveShoreD} from './waterSurface';
import {createOceanBlend} from './swimClear';
import {creatureModel} from './diveRoom';
import {DIVE_TELL_TINT,PITCH_TURF,SHOAL_DECAL,SHOAL_DEEP_LIN,SHOAL_GRASS,SHOAL_KELP_TOP,SHOAL_LANE_LIN,SHOAL_MUTED,SHOAL_PITCH,SHOAL_RAY,SHOAL_ROCK,SHOAL_TEAL_LIN,UNDER_SURFACE_Y,WATER_Y} from './waterTokens';

/**
 * The dive shoal's seabed preview (Oct 20 2026, user: "these dive spots need to look more like the shore where it's see through",
 * "blend in more on the edges", "the items in the water need to be more blurred so there's depth", "it needs to match what the shore
 * looks like", "shallow places in the middle of dark ocean"; later that day: "the dive spots don't look like the area from above").
 *
 * A shoal is drawn as the shore's own shallows rising out of the dark sea. The ocean shader reads a shore distance that eases from
 * the open sea's to DIVE_SHOAL.heart toward the heart (waterSurface.ts diveShoreD). Under it, for the DIVE_SLOTS (2) nearest zones in
 * range, this module lays ONE merged mesh per zone, built from the zone's SHARED LAYOUT (lib/town/water/diveLayout.ts: the same one the
 * reef room is built from, room metres × layout.scale onto the island):
 *  - a blob-shaped sand shelf whose depth follows the room's reef (the crest shallow, the slope deeper) and, past the outline, the shore
 *    bed's curve below its 4.2 m floor. Its vertex colours paint the layout: pale sand on the crest and along the sand lanes you swim
 *    through, darker patches where the coral clusters are (bigger cluster = bigger, darker patch, tinted toward its own coral hue),
 *    dark green sea grass, dark kelp;
 *  - low muted coral heads on each cluster, dark rocks on the layout's boulders, grass tufts in its patches;
 *  - the zone's signature seen from above: Paul's pale pitch lines and goal frame, the Kelp Forest's dark kelp tops just under the
 *    surface, the ball crates, the arch's under-water ring (its crown out of the water is diveWreckTop.ts), the wreck's dark hull.
 * Its material is the shore seabed's (clearWindow.ts underMaterial 'shoal'): moving caustic light lines, depth absorption and
 * desaturation, soft silhouettes, the surface pattern over it and the refraction shimmer. So the props read as down on the seabed.
 *
 * Surface tells that move (one more small mesh per slot, one shared Lambert material, moved in the vertex shader on the water clock
 * like the buoys, no CPU per frame): Ball Crate Reef's footballs bobbing, Turtle Pool's turtle coming up to breathe every ~20 s, Ray
 * Meadow's ray gliding a slow loop over the shoal. Static ones (the mast, the arch crown) are diveWreckTop.ts.
 *
 * The far shoals: every OTHER zone within DIVE_DECAL.far m gets a flat shoal decal (ONE merged mesh for all zones, the blob outline
 * with the layout's patches and lanes painted in, its alpha faded per zone by one uniform array; no texture, no pass). So from the
 * jetpack a third zone is a muted turquoise shoal, not a bare flag. The decal is cheap enough for every heat tier.
 *
 * Cost: no new textures (it uses the shore window's noise texture) and no extra pass. Per zone the preview + tells stay under
 * DIVE_PREVIEW.maxTris triangles (tests/dive-see-through.cjs), with at most 4 draws (2 previews + 2 tells) plus the decal draw.
 * Geometry is built once per zone on first need (≤ 7 zones, kept). Off means meshes hidden, the blend released and uDiveClear 0 (the
 * opaque muted shoal only: waterTokens.ts SHOAL_OPAQUE_D). It is off at heat tiers 3-4 and Battery saver (Town passes the effective
 * tier; a phone's tier 2 counts as 3) and while diving. Per frame: two distance tests and two uniform writes, plus 7 for the decal.
 */
export const DIVE_PREVIEW={view:[170,120,80] as const,fade:.6,rings:10,segs:44,reach:1.3,floor:3,far:40,maxTris:2600} as const;
/** The far shoal decal: rings × segs per zone, fully shown within `near` m and gone by `far` m; its fade time (s). */
export const DIVE_DECAL={rings:6,segs:32,reach:1.25,near:190,far:260,fade:.8,lift:.05} as const;

const hash=(i:number,k:number)=>{const s=Math.sin(i*127.1+k*311.7)*43758.5453;return s-Math.floor(s);};
const sm=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/** The shoal weight at blob fraction t, as the ocean shader draws it (without the edge noise). */
export const shoalK=(t:number)=>{const a=1-sm(DIVE_SHOAL.inner,DIVE_SHOAL.fade,t);return a*a*(3-2*a);};
/** The shore distance the shoal looks like at blob fraction t (the open sea taken as DIVE_PREVIEW.far m). */
export const shoalD=(t:number)=>diveShoreD(DIVE_PREVIEW.far,shoalK(t));
/** The seabed's depth below the surface at blob fraction t. It follows the shore bed's curve (clearWindow.ts) for that shore distance,
 *  on a shallower floor. Past the outline it drops below the shore window's bed floor (4.2 m), so a beach's bed covers the rim. */
export const previewDepth=(t:number)=>.05+DIVE_PREVIEW.floor*(1-Math.exp(-shoalD(t)/3.4))+1.6*sm(1,DIVE_PREVIEW.reach,t);
const cols=(a:readonly string[])=>a.map(c=>new T.Color(c));
const MUTED=cols(SHOAL_MUTED),ROCK=cols(SHOAL_ROCK),GRASS=cols(SHOAL_GRASS);
/** The stranded wreck's under-water hull in the preview: `hull` false skips it (for when the above-water wreck piece draws its own hull);
 *  `under` = how far under the surface its top stays (m). */
export const DIVE_PREVIEW_WRECK={hull:true,under:.15};
/** A cluster's muted preview colour: a dull reef brown / olive / mauve moved DIVE_TELL_TINT toward the cluster's own coral hue. */
export const previewCoralColor=(spot:DiveSpot,hue:number,out=new T.Color())=>out.copy(MUTED[hue%MUTED.length]).lerp(new T.Color(spot.theme.coral[hue%spot.theme.coral.length]),DIVE_TELL_TINT).multiplyScalar(.85);

/** Room point -> how deep the preview's seabed is (m): the room's reef, lifted into the shore bed's range, eased into previewDepth(t)
 *  toward the outline. */
const shelfDepth=(spot:DiveSpot,rx:number,rz:number,t:number)=>{const d=diveDepthAt(rx,rz,spot.floor);return .3+d*.55+(previewDepth(t)-.3-d*.55)*sm(.7,1.05,t);};

/** Build one zone's merged preview (island coordinates, y = world). Non-indexed: position, color, normal.
 *  `bedAt` (optional) is the shore window's seabed depth there (clearWindow.ts clearBedDepthAt; Infinity far out). Near a beach that
 *  bed can be shallower than the shelf: the shelf rides just over it inside the outline and tucks under it past the outline. */
export function buildDivePreview(spot:DiveSpot,bedAt?:(x:number,z:number)=>number){
 const L=diveLayout(spot),sc=L.scale,toRoom=(x:number,z:number)=>[(x-spot.x)/sc,(z-spot.z)/sc] as const;
 const fracAt=(x:number,z:number)=>Math.hypot(x-spot.x,z-spot.z)/Math.max(1,diveBlobR(spot,Math.atan2(z-spot.z,x-spot.x)));
 const depthAt=(x:number,z:number,t=fracAt(x,z))=>{const [rx,rz]=toRoom(x,z),b=bedAt?bedAt(x,z):Infinity,pd=shelfDepth(spot,rx,rz,t);if(!Number.isFinite(b))return pd;
  const o=Math.min(1,Math.max(0,(t-.95)/.2));return Math.min(pd,b-.15)*(1-o)+(b+.4)*o;};
 const P:number[]=[],C:number[]=[],col=new T.Color(),TEAL=new T.Color().setRGB(...SHOAL_TEAL_LIN),DEEP=new T.Color().setRGB(...SHOAL_DEEP_LIN),LANE=new T.Color().setRGB(...SHOAL_LANE_LIN);
 const KELP=new T.Color(SHOAL_KELP_TOP),TURF=new T.Color(PITCH_TURF),hues=spot.theme.coral.map((_,i)=>previewCoralColor(spot,i));
 const push=(x:number,y:number,z:number,c:T.Color)=>{P.push(x,y,z);C.push(c.r,c.g,c.b);};
 // 1. The sand shelf: a polar grid bent to the blob, out to `reach` × the outline, painted with the layout.
 const {rings,segs,reach}=DIVE_PREVIEW,V:{x:number;y:number;z:number;c:T.Color}[][]=[];
 for(let r=0;r<=rings;r++){const row:typeof V[number]=[];const t=r/rings*reach,sd=shoalD(t);
  for(let s=0;s<(r?segs:1);s++){const a=s/segs*Math.PI*2,R=diveBlobR(spot,a)*t,x=spot.x+Math.cos(a)*R,z=spot.z+Math.sin(a)*R,dp=depthAt(x,z,t),[rx,rz]=toRoom(x,z);
   const n=sm(.3,.75,clearWinNoise(x,z,.21,.47,spot.blob)*.6+clearWinNoise(x,z,.09,.33,spot.blob+3)*.5)*.85+.15*diveRipple(x*.6,z*.6),m=diveCrestMask(rx,rz,spot.floor),cv=diveLayoutCover(L,rx,rz),inside=1-sm(.95,1.1,t);
   col.setRGB(.72+.14*n,.68+.14*n,.52+.14*n).lerp(TEAL,sm(1.5,9,sd)*.75*(1-.4*m)).lerp(DEEP,sm(9,24,sd));
   col.lerp(LANE,cv.lane*.4*inside);if(cv.hue>=0)col.lerp(hues[cv.hue],cv.coral*.6*inside);col.lerp(GRASS[0],cv.grass*.5*inside).lerp(KELP,cv.kelp*.45*inside).lerp(TURF,cv.turf*.55*inside);
   row.push({x,y:UNDER_SURFACE_Y-dp,z,c:col.clone()});}
  V.push(row);}
 const vtx=(v:{x:number;y:number;z:number;c:T.Color})=>push(v.x,v.y,v.z,v.c);
 for(let r=1;r<=rings;r++)for(let s=0;s<segs;s++){const s1=(s+1)%segs,a=V[r][s],b=V[r][s1];
  if(r===1){vtx(V[0][0]);vtx(b);vtx(a);continue;}const c=V[r-1][s],d=V[r-1][s1];vtx(c);vtx(d);vtx(a);vtx(d);vtx(b);vtx(a);}
 // 2. The layout's props, low and muted.
 const kit=clearReefKit(),ico=new T.IcosahedronGeometry(1,0),box=new T.BoxGeometry(1,1,1);
 const M=new T.Matrix4(),Q=new T.Quaternion(),S=new T.Vector3(),PO=new T.Vector3(),E=new T.Euler(),A=new T.Vector3(),paint=new T.Color(),k=new T.Color();
 const addShape=(g:T.BufferGeometry,m:T.Matrix4,c:T.Color)=>{const pos=g.getAttribute('position'),pc=g.getAttribute('color'),idx=g.getIndex(),cnt=idx?idx.count:pos.count;
  for(let i=0;i<cnt;i++){const v=idx?idx.getX(i):i;A.fromBufferAttribute(pos,v).applyMatrix4(m);k.copy(c);if(pc)k.multiply(paint.fromBufferAttribute(pc as T.BufferAttribute,v));push(A.x,A.y,A.z,k);}};
 const I=(x:number,z:number)=>[spot.x+x*sc,spot.z+z*sc] as const,seed=spot.blob*7;
 // Coral clusters: 2-3 low heads each (bigger clusters get more and wider ones), never reaching the surface.
 L.clusters.forEach((c,ci)=>{const n=c.r>2.8?3:2;for(let j=0;j<n;j++){const a=hash(ci*7+j,seed+1)*6.283,d=(j?.35+.4*hash(ci*7+j,seed+2):0)*c.r,[x,z]=I(c.x+Math.cos(a)*d,c.z+Math.sin(a)*d);
  const dp=depthAt(x,z),room=dp-.45;if(room<.3)continue;const w=Math.min(c.r*sc*(j?.45:.6),1.8),h=Math.min(c.h*sc*.9,room);
  Q.setFromEuler(E.set(0,hash(ci,seed+3)*6.283,0));M.compose(PO.set(x,UNDER_SURFACE_Y-dp-h*.15,z),Q,S.set(w,h,w*.85));addShape(ico,M,hues[c.hue]);}});
 L.rocks.forEach((r,i)=>{const [x,z]=I(r.x,r.z),dp=depthAt(x,z),s=Math.min(r.s*sc*.9,(dp-.45)/.8);if(s<.1)return;Q.setFromEuler(E.set(0,hash(i,seed+4)*6.283,0));
  M.compose(PO.set(x,UNDER_SURFACE_Y-dp-s*.2,z),Q,S.set(s*1.3,s*.7,s));addShape(ico,M,ROCK[i%ROCK.length]);});
 L.grass.forEach((g,i)=>{const n=g.r>3?2:1;for(let j=0;j<n;j++){const a=hash(i*5+j,seed+5)*6.283,[x,z]=I(g.x+Math.cos(a)*g.r*.4*j,g.z+Math.sin(a)*g.r*.4*j),dp=depthAt(x,z),sc2=Math.min(1+g.r*.25,(dp-.45)/.6);
  if(sc2<.3)continue;Q.setFromEuler(E.set(0,a,0));M.compose(PO.set(x,UNDER_SURFACE_Y-dp,z),Q,S.set(sc2,sc2,sc2));addShape(kit.grass,M,GRASS[i%GRASS.length]);}});
 // The signature from above.
 if(L.tell.kind==='kelp')L.kelp.forEach((s,i)=>{if(s.h<3)return;const [x,z]=I(s.x,s.z);Q.setFromEuler(E.set(0,hash(i,seed+6)*6.283,0));// dark kelp tops just under the surface
  M.compose(PO.set(x,UNDER_SURFACE_Y-.3,z),Q,S.set(1.5,.12,1.1));addShape(ico,M,KELP);
  const [x2,z2]=I(s.x+.9,s.z-.7);M.compose(PO.set(x2,UNDER_SURFACE_Y-.4,z2),Q,S.set(1,.1,.8));addShape(ico,M,KELP);});
 if(L.pitch){const pt=L.pitch,pale=new T.Color(SHOAL_PITCH),line=(x0:number,z0:number,x1:number,z1:number,w:number)=>{const [a,b]=I(x0,z0),[c,d]=I(x1,z1),mx=(a+c)/2,mz=(b+d)/2,dp=Math.min(depthAt(a,b),depthAt(c,d),depthAt(mx,mz));
   Q.setFromEuler(E.set(0,Math.atan2(c-a,d-b),0));M.compose(PO.set(mx,UNDER_SURFACE_Y-dp+.04,mz),Q,S.set(w,.04,Math.hypot(c-a,d-b)+w));addShape(box,M,pale);};
  for(const [p0,p1] of pt.lines)line(p0.x,p0.z,p1.x,p1.z,.32);// halfway, goal line, touchlines, the box
  for(let i=0;i<14;i++){const a0=i/14*Math.PI*2,a1=(i+1)/14*Math.PI*2;line(pt.cx+Math.cos(a0)*pt.circle,pt.cz+Math.sin(a0)*pt.circle,pt.cx+Math.cos(a1)*pt.circle,pt.cz+Math.sin(a1)*pt.circle,.3);}
  const g=pt.goal,c=Math.cos(g.yaw),s=Math.sin(g.yaw),[gx,gz]=I(g.x,g.z),gdp=depthAt(gx,gz),gh=Math.min(g.h*sc,gdp-.35);// the goal frame, its bar just under the surface
  Q.setFromEuler(E.set(0,g.yaw,0));for(const px of [-1,1]){M.compose(PO.set(gx+c*px*g.w*sc/2,UNDER_SURFACE_Y-gdp+gh/2,gz-s*px*g.w*sc/2),Q,S.set(.1,gh,.1));addShape(box,M,pale);}
  M.compose(PO.set(gx,UNDER_SURFACE_Y-gdp+gh,gz),Q,S.set(g.w*sc,.1,.1));addShape(box,M,pale);}
 if(L.crates.length){const wood=new T.Color('#4a3524');L.crates.forEach((c,i)=>{const [x,z]=I(c.x,c.z),dp=depthAt(x,z);Q.setFromEuler(E.set(0,c.yaw,0));
  M.compose(PO.set(x,UNDER_SURFACE_Y-dp+.15,z),Q,S.set(1.1*sc*1.4,.4,.8*sc*1.4));addShape(box,M,i%3?wood:MUTED[1]);});}
 for(const a of L.arches){const rock=ROCK[0];for(let i=0;i<=6;i++){const t=i/6*Math.PI,[x,z]=I(a.x,a.z+Math.cos(t)*a.R),dp=depthAt(x,z),y=UNDER_SURFACE_Y-dp+Math.sin(t)*Math.max(0,dp-.5);
  Q.setFromEuler(E.set(0,i,0));M.compose(PO.set(x,Math.min(y,UNDER_SURFACE_Y-.72),z),Q,S.set(.7,.55,.8));addShape(ico,M,rock);}}
 // 3. A wreck zone: the boat stranded on the reef crest (its layout pose, room metres scaled to the blob), the under-water hull only;
 //    the part above the water is diveWreckTop.ts. Once that piece draws the under-water hull too, set DIVE_PREVIEW_WRECK.hull = false.
 const w=spot.theme.wreck;
 if(w&&L.wreck&&DIVE_PREVIEW_WRECK.hull){const [wx,wz]=I(L.wreck.x,L.wreck.z),len=Math.max(7,spot.radius*.55),t=Math.min(.9,Math.hypot(L.wreck.x,L.wreck.z)/DIVE_ROOM_R),sb=depthAt(wx,wz,t),hh=Math.max(.6,sb-DIVE_PREVIEW_WRECK.under-len*(.16*.24+.6*.1)),yc=UNDER_SURFACE_Y-sb+hh/2;
  const wood=new T.Color('#3a2a1c'),deck=new T.Color('#2a1f15');Q.setFromEuler(E.set(.1,w.yaw,.24));
  M.compose(PO.set(wx,yc,wz),Q,S.set(len*.32,hh,len));addShape(box,M,wood);
  M.compose(PO.set(wx,yc+hh/2-.06,wz),Q,S.set(len*.24,.1,len*.8));addShape(box,M,deck);
  const prow=new T.ConeGeometry(.5,1,4,1);prow.rotateX(Math.PI/2);M.compose(PO.set(wx+Math.sin(w.yaw)*len*.6,yc,wz+Math.cos(w.yaw)*len*.6),Q,S.set(len*.45,hh,len*.25));addShape(prow,M,wood);
  const mast=new T.CylinderGeometry(.18,.22,1,5,1);mast.rotateZ(Math.PI/2);Q.setFromEuler(E.set(0,w.yaw+.9,.08));M.compose(PO.set(wx+len*.3,UNDER_SURFACE_Y-sb+.25,wz-len*.2),Q,S.set(len*.8,1,1));addShape(mast,M,deck);
  prow.dispose();mast.dispose();}
 for(const g of Object.values(kit))g.dispose();ico.dispose();box.dispose();
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));geo.computeVertexNormals();geo.computeBoundingSphere();
 return geo;
}

/** The moving surface tells of one zone (island coordinates; `aTell` = mode 1 bob / 2 surfacing / 3 orbit, phase, orbit centre x, z),
 *  or an empty geometry for a zone without one. Shown and hidden with the zone's preview. */
export function buildDiveTells(spot:DiveSpot){
 const L=diveLayout(spot),sc=L.scale,P:number[]=[],C:number[]=[],N:number[]=[],A:number[]=[];
 const add=(g:T.BufferGeometry,m:T.Matrix4,color:(i:number,l:T.Vector3)=>T.Color,tell:[number,number,number,number])=>{const src=g.index?g.toNonIndexed():g;src.computeVertexNormals();
  const pos=src.getAttribute('position'),nor=src.getAttribute('normal'),pc=src.getAttribute('color'),v=new T.Vector3(),n=new T.Vector3(),nm=new T.Matrix3().getNormalMatrix(m),c=new T.Color();
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);const l=v.clone();v.applyMatrix4(m);n.fromBufferAttribute(nor,i).applyMatrix3(nm).normalize();P.push(v.x,v.y,v.z);N.push(n.x,n.y,n.z);
   c.copy(color(i,l));if(pc)c.multiply(new T.Color().fromBufferAttribute(pc as T.BufferAttribute,i));C.push(c.r,c.g,c.b);A.push(...tell);}
  if(src!==g)src.dispose();g.dispose();};
 const I=(x:number,z:number)=>[spot.x+x*sc,spot.z+z*sc] as const,M=new T.Matrix4(),Q=new T.Quaternion(),white=new T.Color('#f4f1e6'),dark=new T.Color('#2a2f36');
 if(L.tell.kind==='balls')L.tell.pts.forEach((p,i)=>{const [x,z]=I(p.x,p.z);// footballs afloat, bobbing like the buoys
  M.compose(new T.Vector3(x,WATER_Y+.06,z),Q.setFromEuler(new T.Euler(i,i*2,0)),new T.Vector3(L.tell.r,L.tell.r,L.tell.r));
  add(new T.IcosahedronGeometry(1,1),M,(_,l)=>{const k=Math.abs(l.x)+Math.abs(l.y)*1.3+Math.abs(l.z)*.7;return Math.sin(k*6)>.55?dark:white;},[1,i*2.17,0,0]);});
 if(L.tell.kind==='turtle'){const p=L.tell.pts[0],[x,z]=I(p.x,p.z),b=L.bowl!,[bx,bz]=I(b.x,b.z),yaw=Math.atan2(z-bz,x-bx)+Math.PI/2,t=creatureModel('turtle');// a turtle coming up to breathe
  M.compose(new T.Vector3(x,WATER_Y-.08,z),Q.setFromEuler(new T.Euler(0,-yaw,0)),new T.Vector3(1.3,1.3,1.3));add(t.geometry,M,()=>new T.Color(1,1,1),[2,(spot.blob%7)*3,0,0]);}
 if(L.tell.kind==='ray'){const p=L.tell.pts[0],[cx,cz]=I(p.x,p.z),R=L.tell.r*sc,g=new T.BufferGeometry();// a ray silhouette gliding a loop over the shoal
  const s=1.1,wing=[0,0,1.1*s, 1.2*s,0,-.1*s, 0,0,-.5*s, 0,0,1.1*s, 0,0,-.5*s, -1.2*s,0,-.1*s, 0,0,-.5*s, .08*s,0,-.5*s, 0,0,-1.6*s];
  g.setAttribute('position',new T.Float32BufferAttribute(wing,3));M.makeTranslation(cx+R,UNDER_SURFACE_Y-.4,cz);add(g,M,()=>new T.Color(SHOAL_RAY),[3,0,cx,cz]);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('normal',new T.Float32BufferAttribute(N,3));
 geo.setAttribute('color',new T.Float32BufferAttribute(C,3));geo.setAttribute('aTell',new T.Float32BufferAttribute(A,4));
 geo.boundingSphere=new T.Sphere(new T.Vector3(spot.x,WATER_Y,spot.z),spot.radius*1.5);return geo;
}
function tellMaterial(){
 const m=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});m.name='dive-tells';
 m.onBeforeCompile=sh=>{sh.uniforms.uWaterTime=WATER_UNIFORMS.uWaterTime;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWaterTime;attribute vec4 aTell;')
   .replace('#include <begin_vertex>',/* glsl */`#include <begin_vertex>
    float tt=uWaterTime+aTell.y;
    if(aTell.x>2.5){float a=tt*.12,c=cos(a),s=sin(a);vec2 d=transformed.xz-aTell.zw;transformed.xz=aTell.zw+vec2(c*d.x-s*d.y,s*d.x+c*d.y);transformed.y+=sin(tt*.7)*.06;}
    else if(aTell.x>1.5){float ph=mod(tt,20.),up=smoothstep(0.,2.5,ph)*(1.-smoothstep(6.,8.5,ph));transformed.y+=mix(-1.2,0.,up)+sin(tt*1.7)*.03;}
    else if(aTell.x>.5){transformed.y+=sin(tt*1.7)*.07;}`);};
 m.customProgramCacheKey=()=>'dive-tells-v1';return m;
}

/** ONE merged decal for every zone (island coordinates, just over the water line): the blob outline with the layout's coral patches,
 *  lanes and grass painted in, alpha fading to 0 at the edge; `aZone` picks the zone's fade (uDecalK). */
export function buildShoalDecals(spots:readonly DiveSpot[]){
 const P:number[]=[],C:number[]=[],Z:number[]=[],heart=new T.Color(SHOAL_DECAL.heart),patch=new T.Color(SHOAL_DECAL.patch),lane=new T.Color(SHOAL_DECAL.lane),grass=new T.Color(SHOAL_DECAL.grass),c=new T.Color();
 spots.forEach((spot,zi)=>{const L:DiveLayout=diveLayout(spot),V:[number,number,number,number,number,number,number][][]=[];
  for(let r=0;r<=DIVE_DECAL.rings;r++){const row:typeof V[number]=[],t=r/DIVE_DECAL.rings*DIVE_DECAL.reach;
   for(let s=0;s<(r?DIVE_DECAL.segs:1);s++){const a=s/DIVE_DECAL.segs*Math.PI*2,R=diveBlobR(spot,a)*t,x=spot.x+Math.cos(a)*R,z=spot.z+Math.sin(a)*R,cv=diveLayoutCover(L,(x-spot.x)/L.scale,(z-spot.z)/L.scale);
    c.copy(heart).lerp(lane,cv.lane*.5).lerp(patch,Math.max(cv.coral*.7,cv.kelp*.6)).lerp(grass,cv.grass*.5);
    row.push([x,WATER_Y+DIVE_DECAL.lift,z,c.r,c.g,c.b,SHOAL_DECAL.alpha*(1-sm(.5,DIVE_DECAL.reach,t))]);}
   V.push(row);}
  const v=(p:typeof V[number][number])=>{P.push(p[0],p[1],p[2]);C.push(p[3],p[4],p[5],p[6]);Z.push(zi);};
  for(let r=1;r<=DIVE_DECAL.rings;r++)for(let s=0;s<DIVE_DECAL.segs;s++){const s1=(s+1)%DIVE_DECAL.segs,a=V[r][s],b=V[r][s1];
   if(r===1){v(V[0][0]);v(b);v(a);continue;}const cc=V[r-1][s],d=V[r-1][s1];v(cc);v(d);v(a);v(d);v(b);v(a);}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,4));g.setAttribute('aZone',new T.Float32BufferAttribute(Z,1));
 g.computeBoundingSphere();return g;
}

/** `material` is the shore seabed's look (Town passes clearWin.shoalMaterial(), owned by the window). Without one (tests) it uses a plain unlit one. */
export function createDivePreview(scene:T.Scene,bedAt?:(x:number,z:number)=>number,material?:T.Material,spots:readonly DiveSpot[]=DIVE_SPOTS){
 const blend=createOceanBlend(scene),own=!material,mat=material??new T.MeshBasicMaterial({vertexColors:true,fog:false});if(own)mat.name='dive-preview';
 const cache=new Map<string,{geo:T.BufferGeometry;tells:T.BufferGeometry}>(),meshes:T.Mesh[]=[],tellMeshes:T.Mesh[]=[],k:number[]=[],cur:(DiveSpot|null)[]=[],tMat=tellMaterial();
 const quiet=(m:T.Mesh)=>{m.visible=false;m.castShadow=m.receiveShadow=false;m.matrixAutoUpdate=false;m.raycast=()=>{};scene.add(m);return m;};
 for(let i=0;i<DIVE_SLOTS;i++){const m=quiet(new T.Mesh(new T.BufferGeometry(),mat));m.name='dive-preview-'+i;meshes.push(m);k.push(0);cur.push(null);
  const t=quiet(new T.Mesh(new T.BufferGeometry(),tMat));t.name='dive-tells-'+i;tellMeshes.push(t);}
 const empty=meshes[0].geometry,emptyT=tellMeshes[0].geometry;
 const geoOf=(s:DiveSpot)=>{let g=cache.get(s.id);if(!g){g={geo:buildDivePreview(s,bedAt),tells:buildDiveTells(s)};cache.set(s.id,g);}return g;};
 // The far shoal decals: one draw for every zone, each zone's alpha eased by uDecalK.
 const decalK=spots.map(()=>0),uDecalK={value:decalK};
 const dMat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});dMat.name='dive-shoal-decal';
 dMat.onBeforeCompile=sh=>{sh.uniforms.uDecalK=uDecalK;sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>\nuniform float uDecalK[${Math.max(1,spots.length)}];attribute float aZone;`)
  .replace('#include <color_vertex>','#include <color_vertex>\nvColor.a*=uDecalK[int(aZone+.5)];');};
 dMat.customProgramCacheKey=()=>'dive-shoal-decal-v1';
 const decal=new T.Mesh(buildShoalDecals(spots),dMat);decal.name='dive-shoal-decals';decal.renderOrder=1;decal.castShadow=decal.receiveShadow=false;decal.matrixAutoUpdate=false;decal.raycast=()=>{};decal.visible=false;scene.add(decal);
 const U=WATER_UNIFORMS.uDiveSpots.value,CL=WATER_UNIFORMS.uDiveClear.value;
 let tris=0,decals=0;
 return {
  /** Once per rendered frame, with the player's (x, z), the effective heat tier (Battery saver = 4) and whether the island is live (not diving). */
  update(dt:number,x:number,z:number,tier:number,live=true){
   const view=tier<3?DIVE_PREVIEW.view[Math.max(0,tier)]:0;let any=false;tris=0;
   for(let i=0;i<DIVE_SLOTS;i++){const u=U[i];let spot:DiveSpot|null=null;
    if(u.w>0)for(const s of spots)if(s.x===u.x&&s.z===u.y){spot=s;break;}
    if(spot!==cur[i]){cur[i]=spot;k[i]=0;const g=spot?geoOf(spot):null;meshes[i].geometry=g?g.geo:empty;tellMeshes[i].geometry=g?g.tells:emptyT;}
    const want=live&&spot&&view>0&&Math.hypot(spot.x-x,spot.z-z)<view?1:0;
    k[i]=want>k[i]?Math.min(1,k[i]+dt/DIVE_PREVIEW.fade):want<k[i]?Math.max(0,k[i]-dt/DIVE_PREVIEW.fade):k[i];// (a full shoal holds: it no longer dips a step every other frame)
    const kk=k[i]*k[i]*(3-2*k[i]);CL[i]=kk;meshes[i].visible=kk>0;tellMeshes[i].visible=kk>.5&&(tellMeshes[i].geometry.getAttribute('position')?.count??0)>0;
    if(kk>0){any=true;tris+=(meshes[i].geometry.getAttribute('position')?.count??0)/3+(tellMeshes[i].visible?tellMeshes[i].geometry.getAttribute('position').count/3:0);}}
   if(any)blend.hold();else blend.release();
   // The decals: every zone NOT in a slot, by distance (any heat tier: one cheap draw), off while diving.
   decals=0;const step=dt/DIVE_DECAL.fade;
   spots.forEach((s,j)=>{let slotted=false;for(let i=0;i<DIVE_SLOTS;i++)if(U[i].w>0&&U[i].x===s.x&&U[i].y===s.z)slotted=true;
    const want=live&&!slotted?1-sm(DIVE_DECAL.near,DIVE_DECAL.far,Math.hypot(s.x-x,s.z-z)):0;
    decalK[j]=want>decalK[j]?Math.min(want,decalK[j]+step):Math.max(want,decalK[j]-step);if(decalK[j]>0)decals++;});
   decal.visible=decals>0;
  },
  get stats(){return {draws:meshes.filter(m=>m.visible).length,tells:tellMeshes.filter(m=>m.visible).length,decals,triangles:tris,built:cache.size,clear:[...CL]};},
  meshes,tellMeshes,decal,
  dispose(){blend.release();for(let i=0;i<DIVE_SLOTS;i++){CL[i]=0;meshes[i].removeFromParent();tellMeshes[i].removeFromParent();}for(const g of cache.values()){g.geo.dispose();g.tells.dispose();}cache.clear();
   empty.dispose();emptyT.dispose();if(own)mat.dispose();tMat.dispose();decal.removeFromParent();decal.geometry.dispose();dMat.dispose();},
 };
}
export type DivePreview=ReturnType<typeof createDivePreview>;
