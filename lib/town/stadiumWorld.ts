// West Stadium, phase 2 (Nov 12 2026, docs/stadium/PLAN.md): the stands, pitch, gate, roofs, big screen and floodlight masts,
// built once inside buildTownSteps from the pure layout in stadiumSeats.ts. Replaces phase 1's placeholder bowl.
// Heat: every piece is a plain box / cylinder painted with the shared vertex-colour paint, so the batching pass merges it into the
// island's 50 m chunks (one draw call per chunk and paint, frustum-culled per chunk, all behind world.ts's west region gate). No
// texture, light, material or per-frame work of its own; the sponsor art (2 draws, one atlas) loads later, near the stadium.
// The seats are long strips per row and block (team colours), never a mesh per seat; the stand pieces set skipRoofObstacle so the
// canopy pass skips them (they are walk surfaces already). The two roofs are meshes of their own (they fade while they would hide
// the player: +2 draws, two box tests a frame near the stadium); their slabs join the canopy list directly (landable from the sky).
import * as T from 'three';
import type {Obstacle} from './simulation';
import {tintGroundMesh,applyGroundTint} from '../graphics/groundTint';
import {patchStadiumNight,STADIUM_NIGHT_GAIN} from './stadiumNight';
import {goalGeometry} from './fields';
import {GOAL_DEPTH} from './goalCollisions';
import {STADIUM_VENUE,STADIUM_PITCH_Y} from './venues';
import {STADIUM,STADIUM_GATE} from './westParkLayout';
import {STADIUM_NAME,DRIP_FC_ART,PITCH_DROP,drawGateSign} from '../stadium/dripfc';
import {segmentHitsBox} from './walkControl';
import {SCREEN_FRAME} from './stadiumFeed';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {STANDS,ROWS,ROW_DEPTH,CONCOURSE_HEIGHT,SEAT_DEPTH,SEAT_TOP,TREAD,TREAD_RISE,RAIL_TOP,standGeometry,standBack,standLocal,standRect,standSpans,standWorld,boardColliders,stadiumSponsorLayout,MASTS,SCREEN,ROOF,GATE_ARCH_X,rowHeight,seatCount,spanSeats,SEAT_PITCH,ROOF_OVERHANG,FRAME_PROUD,roofBox,type Rail,type Surface,type StandDef} from './stadiumSeats';

export type StadiumTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>T.Mesh;
 obstacles:Obstacle[];walkSurfaces:Surface[];rails:Rail[];surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[];
 /** Optional (phase 3): adds the goal nets (one LineSegments) to the town; its material joins `materials` for disposal. */
 add?:(o:T.Object3D)=>void;materials?:T.Material[];
};
export type StadiumStats={surfaces:number;rails:number;boxes:number;seatsStrips:number;seats:number};

/** The gate's facade sign (Nov 13 2026): "DRIP FC Stadium" on one line (the club's wordmark, then Stadium), standing on the arch
 *  (top 10.6 m) facing the plaza. 13 × 2.2 m: about 0.9 m letters, readable from the plaza on a phone. */
export const GATE_SIGN_H=2.2;
/** Redraw the sign's own canvas (no new texture or draw) with the wordmark once the small picture has loaded; until then, or if it
 *  fails, the lettered fallback. Browser only: a test tool's sign without a canvas map is left as it is. */
function dressGateSign(mesh:T.Mesh){
 const m=mesh.material as T.MeshStandardMaterial,tex=m?.map,canvas=tex?.image as HTMLCanvasElement|undefined;
 const ctx=canvas&&typeof canvas.getContext==='function'?canvas.getContext('2d'):null;if(!tex||!ctx)return;
 const paint=(img:HTMLImageElement|null)=>{drawGateSign(ctx,canvas!.width,canvas!.height,img);tex.needsUpdate=true;};
 paint(null);
 if(typeof Image==='undefined')return;
 const img=new Image();img.decoding='async';img.onload=()=>paint(img);img.src=DRIP_FC_ART.wordmarkLight;
}
/** Drip FC's drop (Nov 13 2026, owner): white paint, semi-transparent, flat in the centre circle (r 8.66 m), ~70% of its diameter,
 *  its top to the north so it reads upright from overhead and its width runs along the halfway line. One quad, one lit
 *  (Lambert) material so at night it darkens with the turf like paint instead of glowing; depthWrite off + polygon offset above the
 *  line paint, so no z-fighting. Self-contained (its own mesh / material here), hidden until the 6 KB picture has loaded. */
export const PITCH_LOGO={url:PITCH_DROP,height:12.1,aspect:217/273,opacity:.4} as const;
function pitchLogo(y:number,materials?:T.Material[]){
 const g=new T.PlaneGeometry(PITCH_LOGO.height*PITCH_LOGO.aspect,PITCH_LOGO.height);g.rotateX(-Math.PI/2);
 const m=new T.MeshLambertMaterial({color:'#ffffff',transparent:true,opacity:PITCH_LOGO.opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 materials?.push(m);
 const mesh=new T.Mesh(g,m);mesh.name='stadium-pitch-logo';mesh.position.set(STADIUM.x,y,STADIUM.z);mesh.visible=false;
 mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.skipRoofObstacle=true;mesh.userData.ownDraw=true;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
 if(typeof Image==='undefined')return mesh;// tests: no picture, the mesh stays hidden
 const img=new Image();img.decoding='async';
 img.onload=()=>{const tex=new T.Texture(img);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;tex.needsUpdate=true;m.map=tex;m.needsUpdate=true;mesh.visible=true;m.addEventListener('dispose',()=>tex.dispose());};
 img.src=PITCH_LOGO.url;
 return mesh;
}
/** The big screen's two posts (world): radius, and each post's foot (x, z) and top (the frame's underside). */
export const SCREEN_POST={r:.22,inset:1.5} as const;
export function screenPosts(){const z=STADIUM.z+SCREEN.z,top=SCREEN.y-SCREEN_FRAME.h/2;
 return [-1,1].map(sx=>({x:STADIUM.x+sx*(SCREEN.w/2-SCREEN_POST.inset),z,top}));}
/** Height above a row of the low seat-back strip's top; the per-seat tops rise from there to 1.13 m. */
const BACK_SPLIT=.92;
const CONCRETE=['#d8cfbd','#cec4af'],TREAD_C='#c2b59c',CONCOURSE_C='#e3d9c3',RAIL_C='#315b50',STEEL='#e9e4d6';

export function buildStadium(t:StadiumTools):{stats:StadiumStats;roofFade:RoofFade;roofCanopies:{x:number;z:number;w:number;d:number;height:number;overhead:true}[]}{
 const {put,cylinder,sign,obstacles,walkSurfaces,rails,surfaceAreas}=t,S=STADIUM;let boxes=0,strips=0,surfaces=0;const rails0=rails.length;
 // stadiumPaint: the batching pass (world.ts) gives the piece's paint the stadium night fill (stadiumNight.ts) and keys it to the
 // stadium's own batch; textured or tinted pieces keep their material.
 const skip=(m:T.Mesh)=>{m.userData.skipRoofObstacle=true;m.userData.stadiumPaint=true;boxes++;return m;};
 const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>skip(t.box(w,h,d,c,x,y,z));
 const rectBox=(r:{x:number;z:number;w:number;d:number},y0:number,y1:number,c:string)=>box(r.w,y1-y0,r.d,c,r.x,(y0+y1)/2,r.z);

 for(const s of STANDS){
  const g=standGeometry(s);
  for(const surf of g.surfaces){walkSurfaces.push(surf);obstacles.push(surf);surfaces++;}
  rails.push(...g.rails);
  // Rows (solid to the ground), aisle treads, concourse, back stairs.
  for(const surf of g.surfaces){
   const row=Math.round(surf.height/.5-1),colour=surf.height===CONCOURSE_HEIGHT?CONCOURSE_C:surf.stepAccess?TREAD_C:CONCRETE[row%2];
   rectBox(surf,0,surf.height,colour);
  }
  seats(s);
  railings(s,g.rails);
  facade(s);
 }

 function seats(s:StandDef){
  const {seats:spans}=standSpans(s);
  for(let i=0;i<ROWS;i++){const d0=s.inner+i*ROW_DEPTH,h=rowHeight(i);
   spans.forEach(([a0,a1],k)=>{
    // Blocks: the team's two colours alternate by block, with the back rows of the middle blocks in the second colour (a stripe).
    const c=s.team[(k+(i>=ROWS-3?1:0))%2],dark=new T.Color(c).multiplyScalar(.78).getStyle();
    rectBox(standRect(s,d0+SEAT_DEPTH-.25,d0+SEAT_DEPTH+.25,a0+.05,a1-.05),h,h+SEAT_TOP,c);
    // The seat back: a continuous low strip plus one notched-out top per seat (phase 3: the strips read as long benches).
    rectBox(standRect(s,d0+SEAT_DEPTH+.2,d0+SEAT_DEPTH+.3,a0+.05,a1-.05),h+SEAT_TOP,h+BACK_SPLIT,dark);
    skip(seatBackTops(s,d0+SEAT_DEPTH+.2-.004,a0,a1,h+BACK_SPLIT,h+1.13,dark));
    strips+=3;
   });
  }
 }
 /** One quad per seat (pitch-facing, 2 triangles) on top of the low back strip, SEAT_PITCH apart with a 0.12 m gap: the notches
  *  that make a strip read as single seats. One geometry per row and block, painted and merged into the chunk batch like the
  *  strips (no draw call); about 10k triangles for the 5,030 seats. Seen from behind, only the low strip shows. */
 function seatBackTops(s:StandDef,d:number,a0:number,a1:number,y0:number,y1:number,c:string){
  const {n,start}=spanSeats(a0,a1),mid=standWorld(s,d,(a0+a1)/2),ym=(y0+y1)/2,hw=(SEAT_PITCH-.12)/2;
  const toPitch=standWorld(s,d-1,0),at=standWorld(s,d,0),nx=toPitch.x-at.x,nz=toPitch.z-at.z;
  const pos=new Float32Array(n*12),nor=new Float32Array(n*12),uv=new Float32Array(n*8),idx:number[]=[];
  for(let k=0;k<n;k++){const sa=start+k*SEAT_PITCH,l=standWorld(s,d,sa-hw),r=standWorld(s,d,sa+hw),o=k*4;
   pos.set([l.x-mid.x,y0-ym,l.z-mid.z,r.x-mid.x,y0-ym,r.z-mid.z,r.x-mid.x,y1-ym,r.z-mid.z,l.x-mid.x,y1-ym,l.z-mid.z],k*12);
   for(let j=0;j<4;j++)nor.set([nx,0,nz],k*12+j*3);uv.set([0,0,1,0,1,1,0,1],k*8);
   // Wind the quad counter-clockwise as seen from the pitch (its face normal along the pitch-ward normal).
   const ex=r.x-l.x,ez=r.z-l.z,front=(-ez)*nx+ex*nz>0;// (r-l)×(top-l) ∝ (-ez,0,ex)
   if(front)idx.push(o,o+1,o+2,o,o+2,o+3);else idx.push(o,o+2,o+1,o,o+3,o+2);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));
  g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);
  return put(g,c,mid.x,ym,mid.z);
 }
 function railings(s:StandDef,list:readonly Rail[]){
  const back=standBack(s),rowsEnd=s.inner+ROWS*ROW_DEPTH;
  // The floor a rail guards at stand-local depth d: a row, the concourse or a back-stair tread.
  const floorAt=(d:number)=>d<rowsEnd?rowHeight(Math.max(0,Math.floor((d-s.inner)/ROW_DEPTH))):d<back?CONCOURSE_HEIGHT:CONCOURSE_HEIGHT-TREAD_RISE*(Math.floor((d-back)/TREAD)+1);
  for(const r of list){
   const alongX=r.w>=r.d,long=Math.max(r.w,r.d);
   // The concourse's back rail is level; an end or stair-side rail steps with the floor it guards (pieces of ~1.3 m).
   const n=r.floor>1?1:Math.max(1,Math.round(long/1.3));
   for(let k=0;k<n;k++){const f=(k+.5)/n-.5,x=alongX?r.x+f*r.w:r.x,z=alongX?r.z:r.z+f*r.d,pw=alongX?r.w/n:r.w,pd=alongX?r.d:r.d/n;
    const h=r.floor>1?CONCOURSE_HEIGHT:floorAt(standLocal(s,x,z).d);
    box(pw,.07,pd,RAIL_C,x,h+RAIL_TOP,z);box(.07,RAIL_TOP,.07,RAIL_C,x,h+RAIL_TOP/2,z);}
   if(r.floor>1)for(let k=0;k<=Math.round(long/3);k++){const f=k/Math.max(1,Math.round(long/3))-.5;box(.07,RAIL_TOP,.07,RAIL_C,alongX?r.x+f*r.w:r.x,CONCOURSE_HEIGHT+RAIL_TOP/2,alongX?r.z:r.z+f*r.d);}
  }
 }
 function facade(s:StandDef){
  // A team-colour band along the stand's back wall (the face the park and the plaza see).
  const back=standBack(s);for(const [a0,a1] of standSpans(s).pieces)rectBox(standRect(s,back,back+.06,a0,a1),3.6,4.3,s.team[0]);
 }

 // --- Roofs over the long stands, on posts behind the concourse ------------------------------------------------------------------
 // Nov 12 2026 (QA: under the roof the follow camera saw only the roof and a floating Sit prompt): each roof (slab + its two fascia
 // frames) is ONE mesh of its own, not merged into the chunk batch, so it can fade (createRoofFade): 2 draw calls when in view.
 // Still landable: the slab's top is handed to the canopy list as a plain surface (roofCanopies), as the canopy pass measured it.
 const roofs:T.Mesh[]=[],roofCanopies:{x:number;z:number;w:number;d:number;height:number;overhead:true}[]=[];
 for(const s of STANDS.filter(q=>q.roof)){
  const a0=s.from-ROOF_OVERHANG,a1=s.to+ROOF_OVERHANG,slab=standRect(s,ROOF.front,ROOF.back,a0,a1),c=new T.Vector3(slab.x,ROOF.y,slab.z),parts:T.BufferGeometry[]=[];
  const piece=(r:{x:number;z:number;w:number;d:number},y0:number,y1:number,colour:string)=>{const g=new T.BoxGeometry(r.w,y1-y0,r.d).toNonIndexed();
   g.translate(r.x-c.x,(y0+y1)/2-c.y,r.z-c.z);const col=new T.Color(colour),nrm=g.getAttribute('normal'),out=new Float32Array(nrm.count*3);
   // The chunk batch's baked light (world.ts): undersides 0.62, tops 1.03, sides darker toward their foot.
   for(let v=0;v<nrm.count;v++){const ny=nrm.getY(v),f=ny<-.5?.62:ny>.7?1.03:.8;out[v*3]=col.r*f;out[v*3+1]=col.g*f;out[v*3+2]=col.b*f;}
   g.setAttribute('color',new T.BufferAttribute(out,3));g.deleteAttribute('uv');parts.push(g);};
  piece(slab,ROOF.y-ROOF.thick/2,ROOF.y+ROOF.thick/2,STEEL);
  // The frames stand FRAME_PROUD proud of the slab's faces and ends (Nov 13 2026 owner bug: they shared the slab's back / front and
  // end planes, so dark frame and tan slab z-fought in a flickering strip along the roof edge from afar).
  const P=FRAME_PROUD;
  piece(standRect(s,ROOF.back-.12,ROOF.back+P,a0-P,a1+P),ROOF.y-ROOF.frameBelow,ROOF.y+ROOF.frameAbove,'#244d49');// the fascia frame (sponsor slot)
  piece(standRect(s,ROOF.front-P,ROOF.front+.12,a0-P,a1+P),ROOF.y-.5,ROOF.y+.3,'#244d49');
  const merged=mergeGeometries(parts)!;for(const g of parts)g.dispose();
  const roofMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.85,transparent:true,opacity:1});t.materials?.push(roofMaterial);// one each: they fade apart
  const roof=new T.Mesh(merged,roofMaterial);roof.name='stadium-roof-'+s.id;roof.position.copy(c);roof.castShadow=roof.receiveShadow=true;
  roof.userData.skipRoofObstacle=true;roof.userData.ownDraw=true;// world.ts: never merged into a chunk batch, never measured as a canopy
  t.add?.(roof);roofs.push(roof);boxes+=3;
  roofCanopies.push({...slab,height:ROOF.y+ROOF.thick/2,overhead:true});
  for(const a of [-50,-38,-12,12,38,50]){const p=standWorld(s,standBack(s)+.35,a);
   skip(cylinder(.28,ROOF.y,STEEL,p.x,ROOF.y/2,p.z));obstacles.push({x:p.x,z:p.z,w:.6,d:.6});}
 }

 // --- Pitch: apron, runoff, mown stripes, white markings (0.12 m lines), goals ----------------------------------------------------
 const W=S.pitchW,L=S.pitchL;
 surfaceAreas.push({kind:'pitch',x:S.x,z:S.z,w:W+8,d:L+8});
 tintGroundMesh(box(80,.02,115,'#c9b892',S.x,-.065,S.z),'path').castShadow=false;// the pitch-level ring round the boards
 tintGroundMesh(box(20,.02,STADIUM_GATE.halfWidth*2,'#c9b892',S.x+50,-.065,S.z),'path').castShadow=false;// the gate's walk in
 // The turf keeps the island grass tint (its mottle) on a material of its own with the night fill (stadiumNight.ts): one batch.
 {const turf=box(W+8,.05,L+8,'#6e9678',S.x,-.07,S.z);turf.material=patchStadiumNight(applyGroundTint(new T.MeshStandardMaterial({color:'#6e9678',roughness:.85}),'grass'),STADIUM_NIGHT_GAIN.turf);t.materials?.push(turf.material);}
 for(let i=0;i<10;i+=2)box(W,.008,L/10,'#78a083',S.x,-.04,S.z-L/2+(i+.5)*L/10).castShadow=false;
 const white='#f4f1e6',ln=.12,ly=-.034,netPts:number[]=[];
 const lineBox=(w:number,d:number,x:number,z:number)=>{box(w,.008,d,white,x,ly,z).castShadow=false;};
 for(const sx of [-1,1])lineBox(ln,L,S.x+sx*W/2,S.z);
 for(const sz of [-1,1])lineBox(W,ln,S.x,S.z+sz*L/2);
 lineBox(W,ln,S.x,S.z);
 {const g=new T.RingGeometry(8.6,8.72,48);g.rotateX(-Math.PI/2);skip(put(g,white,S.x,ly+.004,S.z)).castShadow=false;}
 if(t.add)t.add(pitchLogo(ly+.006,t.materials));// Drip FC's drop painted in the centre circle (own mesh, 1 draw)
 for(const sz of [-1,1]){
  const goalZ=S.z+sz*L/2,box16=15.4,width16=38;
  lineBox(width16,ln,S.x,goalZ-sz*box16);for(const sx of [-1,1])lineBox(ln,box16,S.x+sx*width16/2,goalZ-sz*box16/2);
  lineBox(17,ln,S.x,goalZ-sz*5.2);for(const sx of [-1,1])lineBox(ln,5.2,S.x+sx*8.5,goalZ-sz*2.6);
  // The real goals (phase 3): the island pitches' frame and net (fields.ts goalGeometry), full size (7.32 × 2.44 m). The frame
  // is painted into the chunk batch (no draw call of its own); both nets share one LineSegments (1 draw, frustum-culled).
  const {frame,net}=goalGeometry(STADIUM_VENUE,sz,STADIUM_PITCH_Y);frame.translate(0,0,-sz*L/2);skip(put(frame,'#fff6df',S.x,0,goalZ));
  const np=net.getAttribute('position');for(let i=0;i<np.count;i++)netPts.push(np.getX(i)+S.x,np.getY(i),np.getZ(i)+S.z);net.dispose();
  // Walk colliders like the island goals' (goalCollisions.ts GOAL_BARRIERS): the two side nets and the back net; the mouth stays open.
  const gw=STADIUM_VENUE.goalWidth/2,back=goalZ+sz*GOAL_DEPTH;
  for(const hand of [-1,1])obstacles.push({x:S.x+hand*gw,z:(goalZ+back)/2,w:.13,d:GOAL_DEPTH+.13});
  obstacles.push({x:S.x,z:back,w:STADIUM_VENUE.goalWidth+.13,d:.07});
 }
 if(t.add){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(netPts,3));
  const m=new T.LineBasicMaterial({color:'#c6d4cc',transparent:true,opacity:.68});t.materials?.push(m);
  const nets=new T.LineSegments(g,m);nets.name='stadium-goal-nets';t.add(nets);}

 // --- Pitchside boards: dark backs (the sponsor art lands on their faces later) and their colliders (the gaps stay open) ---------
 const layout=stadiumSponsorLayout();
 for(const b of layout.boards){const side=Math.abs(Math.sin(b.yaw))>.5,fx=Math.sin(b.yaw),fz=Math.cos(b.yaw);
  box(side?.12:b.w,b.h,side?b.w:.12,'#20343a',S.x+b.x-fx*.07,b.h/2,S.z+b.z-fz*.07);}
 obstacles.push(...boardColliders(layout));

 // --- The big screen behind the south stand --------------------------------------------------------------------------------------
 // Nov 13 2026 (owner: the two posts crossed the back face): the posts stop at the frame's underside and stand inside its 0.5 m
 // depth (radius SCREEN_POST.r < half the depth), so they meet it from below and never pass in front of either face. The back
 // face's picture (card / live feed) is stadiumFeed.ts.
 {const z=S.z+SCREEN.z;box(SCREEN_FRAME.w,SCREEN_FRAME.h,SCREEN_FRAME.depth,'#1d2b33',S.x,SCREEN.y,z);box(SCREEN.w,SCREEN.h,.02,'#2b3f48',S.x,SCREEN.y,z-.26);
  for(const sx of [-1,1]){const p=screenPosts()[sx<0?0:1];skip(cylinder(SCREEN_POST.r,p.top,STEEL,p.x,p.top/2,p.z));obstacles.push({x:p.x,z:p.z,w:.6,d:.6});}}

 // --- Main gate: arch over the east stand's gap, turnstiles either side of an open middle ------------------------------------------
 {const G=STADIUM_GATE,gx=GATE_ARCH_X;
  for(const sz of [-1,1]){box(1.6,11,1.6,'#e2c766',gx,5.5,G.z+sz*(G.halfWidth+.4));obstacles.push({x:gx,z:G.z+sz*(G.halfWidth+.4),w:1.6,d:1.6});
   for(const off of [3.4,5.4]){box(.5,1,.5,'#9aa7a6',gx-1.2,.5,G.z+sz*off);obstacles.push({x:gx-1.2,z:G.z+sz*off,w:.5,d:.5});}}
  t.box(1.4,2.4,G.halfWidth*2+3.2,'#e2c766',gx,9.4,G.z);boxes++;// not skipped: its top is a landable canopy (roof-landing audit)
  dressGateSign(skip(sign(STADIUM_NAME,G.halfWidth*2-1,GATE_SIGN_H,gx+.72,10.7+GATE_SIGN_H/2,G.z,'#244d49','#fff0cf',Math.PI/2)));
 }

 // --- Floodlight masts at the open corners: the heads are paint; their lit lenses, glow and the shared real lights at night are ----
 // fieldLighting.ts's (the stadium joins the island pitches' night blend and spot pool, stadiumNight.ts).
 for(const m of MASTS){skip(cylinder(.45,30,'#d9d6cc',m.x,15,m.z));obstacles.push({x:m.x,z:m.z,w:1,d:1});
  const head=box(6,3.4,.5,'#f7f3e3',m.x,30.5,m.z);head.rotation.y=Math.atan2(-m.sx,-m.sz);head.rotation.x=0;
  const frame=box(6.4,3.8,.3,'#53605f',m.x-m.sx*.2,30.5,m.z-m.sz*.2);frame.rotation.y=head.rotation.y;}

 return {stats:{surfaces,rails:rails.length-rails0,boxes,seatsStrips:strips,seats:seatCount()},roofFade:createRoofFade(roofs),roofCanopies};
}

/** How see-through a roof gets while it would hide the player, and how fast it fades (opacity per second, out / back in). */
export const ROOF_FADE={min:.18,out:5,in:2.2} as const;
export type RoofFade=ReturnType<typeof createRoofFade>;
/** The roofs fade while the walking player is under one (and the camera above it) or the camera-to-player line crosses one (hips or
 *  head): two slab tests per frame near the stadium, nothing far away. Faded, the roof stops writing depth so the stand behind it
 *  draws; back to opacity 1 it is an ordinary (sorted) surface again. Reduced motion snaps. */
export function createRoofFade(roofs:readonly T.Mesh[]){
 const list=STANDS.filter(q=>q.roof).map((s,i)=>({box:roofBox(s),mesh:roofs[i],opacity:1,hiding:false}));
 const covers=(b:ReturnType<typeof roofBox>,px:number,py:number,pz:number,cx:number,cy:number,cz:number)=>
  cy>b.top&&py<b.floor&&Math.abs(px-b.x)<b.w/2&&Math.abs(pz-b.z)<b.d/2// under it, seen from above
  ||segmentHitsBox(px,py+.7,pz,cx,cy,cz,b)||segmentHitsBox(px,py+1.55,pz,cx,cy,cz,b);
 return {
  roofs,
  /** Each roof's opacity now (west, east) and whether it hides the player. */
  get opacity(){return list.map(r=>r.opacity);},get hiding(){return list.map(r=>r.hiding);},
  /** Each frame after the camera moves: the player's feet (world) and the camera. */
  update(dt:number,px:number,py:number,pz:number,cx:number,cy:number,cz:number,reduced=false){
   const near=Math.abs(px-STADIUM.x)<STADIUM.bowlW/2+20&&Math.abs(pz-STADIUM.z)<STADIUM.bowlL/2+20;
   for(const r of list){r.hiding=near&&covers(r.box,px,py,pz,cx,cy,cz);
    const to=r.hiding?ROOF_FADE.min:1;if(r.opacity===to||!r.mesh)continue;
    r.opacity=reduced?to:to<r.opacity?Math.max(to,r.opacity-ROOF_FADE.out*dt):Math.min(to,r.opacity+ROOF_FADE.in*dt);
    const m=r.mesh.material as T.MeshStandardMaterial;m.opacity=r.opacity;m.depthWrite=r.opacity>.99;}
  },
 };
}
