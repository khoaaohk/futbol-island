/**
 * The zipline's static props (Oct 14 2026; rules and positions: ./zipline.ts). Built inside buildTown like the Summit Isle
 * activity props, so every piece joins the same 50 m static batches: no animation, no per-frame work, no new draw call except
 * the two canvas signs (each sign is its own small textured mesh, like every other island sign).
 *
 *  - Summit Isle: the timber launch platform on the old telescope stand's spot, its step, rails (a gap where you launch), the
 *    gantry holding the cable and a "ZIPLINE TO CORAL CAY" sign facing the follow camera.
 *  - The cable: a thin tube along the sagging span, cut into ~28 m pieces placed at their own centres so each lands in its own
 *    spatial batch (one long mesh would give one batch a 230 m bounding sphere and stop it ever being culled).
 *  - Coral Cay Hostel roof: the landing deck (one step up from the roof), its rails, the anchor mast with a buffer spring, a
 *    "ZIPLINE FROM SUMMIT ISLE" sign, and the outside stair down the east wall with its handrail.
 * Walkable pieces are registered as walk surfaces (stepAccess, like the school's and the arena's stairs) and, where they stand
 * on the ground, as colliders; rails and the masts are roof-prop barriers (floor/top), so the deck and the stair hold you.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {summitGround} from './summitIsle';
import {ZIP_TOWER,ZIP_PLATFORM,ZIP_LAUNCH,ZIP_DIR,ZIP_DECK,ZIP_STAIR,HOSTEL_ROOF,ZIP_ANCHOR_TOWER,ZIP_ANCHOR_ROOF,ZIP_T0,ZIP_T1,ZIP_SPAN,cableAt} from './zipline';

type Mesh=T.Mesh;
type Surface=Obstacle&{height:number};
export type ZiplineRail=Obstacle&{floor:number;top:number;noLanding?:boolean};
export type ZiplineTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>Mesh;
 line:(a:T.Vector3,b:T.Vector3,r:number,c:string)=>Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>Mesh;
 obstacles:Obstacle[];walkSurfaces:Surface[];rails:ZiplineRail[];
};
const TIMBER='#9d805b',DARK='#7a5c3e',DECK='#b48a5e',STEEL='#4c5652',CABLE='#2f3735',ORANGE='#ef7d3c',CREAM='#eddfbb',GREEN='#294f43';
/** The camera looks along (-16, -23, -33): a sign turned this much about y faces it. */
const FACE=Math.atan2(16,33);
/** The cable's radius and how many pieces / segments it is cut into. */
export const CABLE_RADIUS=.06,CABLE_PIECES=8,CABLE_SEGMENTS_PER_PIECE=6;

/** The cable as a few tube pieces: piece i covers fractions [a, b] of the anchor-to-anchor span. Geometry in local space round
 *  the piece's centre (so the batch key is the centre's 50 m cell). */
export function cablePieces(){
 const out:{center:T.Vector3;geometry:T.TubeGeometry}[]=[];
 for(let i=0;i<CABLE_PIECES;i++){const a=ZIP_T0+(ZIP_T1-ZIP_T0)*i/CABLE_PIECES,b=ZIP_T0+(ZIP_T1-ZIP_T0)*(i+1)/CABLE_PIECES,m=cableAt((a+b)/2),center=new T.Vector3(m.x,m.y,m.z);
  const pts=Array.from({length:CABLE_SEGMENTS_PER_PIECE+1},(_,k)=>{const p=cableAt(a+(b-a)*k/CABLE_SEGMENTS_PER_PIECE);return new T.Vector3(p.x-center.x,p.y-center.y,p.z-center.z);});
  out.push({center,geometry:new T.TubeGeometry(new T.CatmullRomCurve3(pts),CABLE_SEGMENTS_PER_PIECE,CABLE_RADIUS,4,false)});}
 return out;
}

export function buildZiplineProps(t:ZiplineTools){
 const {box,cylinder,put,line,sign,obstacles,walkSurfaces,rails}=t;
 const skip=(m:Mesh)=>{m.userData.skipRoofObstacle=true;return m;};
 const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
 // ---------------------------------------------------------------- the launch platform on Summit Isle
 const P=ZIP_TOWER,h=ZIP_PLATFORM.size/2,deck=P.deck;
 // Deck boards on four corner posts that reach down to the slope (the downhill corner stands ~1.7 m tall).
 skip(box(ZIP_PLATFORM.size,.16,ZIP_PLATFORM.size,DECK,P.x,deck-.08,P.z));
 for(const [a,b] of [[-1,-1],[-1,1],[1,-1],[1,1]] as const){const px=P.x+a*(h-.12),pz=P.z+b*(h-.12),g=summitGround(px,pz)-.15,len=deck-.16-g;if(len>.05)skip(box(.2,len,.2,TIMBER,px,g+len/2,pz));}
 // Cross braces under the deck on the two downhill sides (north and west).
 {const gN=Math.min(summitGround(P.x-h,P.z-h),summitGround(P.x+h,P.z-h)),gW=Math.min(summitGround(P.x-h,P.z+h),summitGround(P.x-h,P.z-h));
  if(deck-gN>.9)skip(line(V(P.x-h+.12,gN+.1,P.z-h+.1),V(P.x+h-.12,deck-.25,P.z-h+.1),.05,DARK));
  if(deck-gW>.9)skip(line(V(P.x-h+.1,gW+.1,P.z+h-.12),V(P.x-h+.1,deck-.25,P.z-h+.12),.05,DARK));}
 walkSurfaces.push({...P.box,height:deck,stepAccess:true});obstacles.push({...P.box});
 for(const s of P.steps){const low=Math.min(summitGround(s.x-s.w/2,s.z-s.d/2),summitGround(s.x+s.w/2,s.z+s.d/2),summitGround(s.x,s.z))-.12;
  skip(box(s.w,s.height-low,s.d,DECK,s.x,(s.height+low)/2,s.z));walkSurfaces.push({x:s.x,z:s.z,w:s.w,d:s.d,height:s.height,stepAccess:true});obstacles.push({x:s.x,z:s.z,w:s.w,d:s.d});}
 // Rails: the west and south sides whole, the north side with a 1.4 m gap where you launch (the east side is the step).
 const railTop=deck+1.05,gapX=ZIP_LAUNCH.x;
 const rail=(x0:number,z0:number,x1:number,z1:number)=>{
  for(const y of [deck+.55,railTop])skip(line(V(x0,y,z0),V(x1,y,z1),.035,TIMBER));
  const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/.9));for(let i=0;i<=n;i++){const k=i/n;skip(box(.09,1.05,.09,DARK,x0+(x1-x0)*k,deck+.525,z0+(z1-z0)*k));}
  rails.push({x:(x0+x1)/2,z:(z0+z1)/2,w:Math.max(.12,Math.abs(x1-x0)+.12),d:Math.max(.12,Math.abs(z1-z0)+.12),floor:deck-.3,top:railTop+.1});};
 rail(P.x-h+.05,P.z-h+.05,P.x-h+.05,P.z+h-.05);// west
 rail(P.x-h+.05,P.z+h-.05,P.x+h-.05,P.z+h-.05);// south
 rail(P.x-h+.05,P.z-h+.05,gapX-.7,P.z-h+.05);rail(gapX+.7,P.z-h+.05,P.x+h-.05,P.z-h+.05);// north, either side of the launch gap
 // The gantry: two posts either side of the cable and a beam across, the cable's anchor plate in the middle of the beam.
 {const A=ZIP_ANCHOR_TOWER,sx=-ZIP_DIR.z,sz=ZIP_DIR.x,beam=A.y+.18;
  for(const side of [-1,1]){const px=A.x+sx*side*1.25,pz=A.z+sz*side*1.25,g=Math.min(deck,summitGround(px,pz)),len=beam+.35-g;skip(box(.22,len,.22,TIMBER,px,g+len/2,pz));
   rails.push({x:px,z:pz,w:.34,d:.34,floor:deck-.3,top:beam+.3});
   // A diagonal brace from each post down to the deck behind it.
   skip(line(V(px,beam-.4,pz),V(px-ZIP_DIR.x*1.1,deck+.1,pz-ZIP_DIR.z*1.1),.045,DARK));}
  const b=skip(box(2.8,.22,.24,TIMBER,A.x,beam,A.z));b.rotation.y=ZIP_DIR.yaw+Math.PI/2;
  skip(box(.34,.34,.34,STEEL,A.x,A.y,A.z));
  // A sunset-orange pulley wheel parked on the cable at the launch, and a striped launch line on the deck.
  {const c=cableAt(0),w=skip(put(new T.TorusGeometry(.14,.045,6,12),ORANGE,c.x,c.y-.05,c.z));w.rotation.y=ZIP_DIR.yaw+Math.PI/2;}
  const stripe=skip(box(1.2,.02,.16,CREAM,ZIP_LAUNCH.x,deck+.01,ZIP_LAUNCH.z+.35));stripe.castShadow=false;}
 // The sign, on two short posts at the south-east corner, facing the camera.
 {const sx=P.x+h-.25,sz=P.z+h+.55,g=summitGround(sx,sz);for(const dx of [-.62,.62])skip(box(.08,1.75,.08,DARK,sx+dx*Math.cos(FACE),g+.875,sz-dx*Math.sin(FACE)));
  skip(sign('ZIPLINE TO CORAL CAY',1.6,.42,sx,g+1.5,sz,GREEN,'#ffd27a',FACE));obstacles.push({x:sx,z:sz,w:1.2,d:.3});}

 // ---------------------------------------------------------------- the cable
 for(const p of cablePieces()){const m=skip(put(p.geometry,CABLE,p.center.x,p.center.y,p.center.z));m.castShadow=true;}

 // ---------------------------------------------------------------- the landing on the Coral Cay Hostel's roof
 const D=ZIP_DECK,dy=D.height;
 skip(box(D.w,dy-HOSTEL_ROOF+.02,D.d,DECK,D.x,(dy+HOSTEL_ROOF)/2-.01,D.z));
 for(let i=1;i<6;i++){const s=skip(box(.04,.01,D.d-.1,DARK,D.x-D.w/2+i*D.w/6,dy+.005,D.z));s.castShadow=false;}
 walkSurfaces.push({x:D.x,z:D.z,w:D.w,d:D.d,height:dy,stepAccess:true});
 // Deck rails on the west and north sides (the cable comes in from the south; the stair is east).
 const deckRail=(x0:number,z0:number,x1:number,z1:number)=>{const top=dy+.95;
  for(const y of [dy+.5,top])skip(line(V(x0,y,z0),V(x1,y,z1),.03,CREAM));
  const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/.9));for(let i=0;i<=n;i++){const k=i/n;skip(box(.07,.95,.07,GREEN,x0+(x1-x0)*k,dy+.475,z0+(z1-z0)*k));}
  rails.push({x:(x0+x1)/2,z:(z0+z1)/2,w:Math.max(.12,Math.abs(x1-x0)+.12),d:Math.max(.12,Math.abs(z1-z0)+.12),floor:HOSTEL_ROOF-.1,top:top+.1});};
 deckRail(D.x-D.w/2+.05,D.z-D.d/2+.05,D.x-D.w/2+.05,D.z+D.d/2-1.2);// west (open at its south end: step down to the roof)
 deckRail(D.x-D.w/2+.05,D.z-D.d/2+.05,D.x+D.w/2-.05,D.z-D.d/2+.05);// north
 // The anchor mast: a steel post on the deck with an orange buffer spring on the cable just before it, and a little flag on top.
 {const A=ZIP_ANCHOR_ROOF,top=A.y+.6;skip(cylinder(.13,top-dy,STEEL,A.x,dy+(top-dy)/2,A.z));skip(box(.4,.4,.4,STEEL,A.x,A.y,A.z));
  rails.push({x:A.x,z:A.z,w:.45,d:.45,floor:HOSTEL_ROOF-.1,top});
  // Two back-stays from the mast top to the deck's north corners.
  for(const side of [-1,1])skip(line(V(A.x,top-.1,A.z),V(D.x+side*(D.w/2-.25),dy+.05,D.z-D.d/2+.25),.025,CABLE));
  {const s=cableAt(1+.6/ZIP_SPAN),sp=skip(put(new T.CylinderGeometry(.16,.16,.5,10),ORANGE,s.x,s.y,s.z));sp.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(ZIP_DIR.x,0,ZIP_DIR.z));}
  const flag=skip(box(.04,.42,.7,ORANGE,A.x,top+.05,A.z+.35));flag.castShadow=false;}
 // The landing sign at the deck's south-west corner (clear of the rider, the landing spot and the mast), facing the camera.
 {const sx=D.x-D.w/2+.45,sz=D.z+D.d/2-.4;for(const dx of [-.55,.55])skip(box(.07,1.35,.07,GREEN,sx+dx*Math.cos(FACE),dy+.675,sz-dx*Math.sin(FACE)));
  skip(sign('ZIPLINE FROM SUMMIT ISLE',1.5,.36,sx,dy+1.15,sz,GREEN,'#ffd27a',FACE));rails.push({x:sx,z:sz,w:1.1,d:.25,floor:HOSTEL_ROOF-.1,top:dy+1.4});}

 // ---------------------------------------------------------------- the outside stair down the east wall
 const S=ZIP_STAIR,Lg=S.landing;
 skip(box(Lg.w,.18,Lg.d,DECK,Lg.x,Lg.height-.09,Lg.z));
 for(const z of [Lg.z-Lg.d/2+.1,Lg.z+Lg.d/2-.1])skip(box(.14,Lg.height-.18,.14,TIMBER,S.x1-.1,(Lg.height-.18)/2,z));
 walkSurfaces.push({x:Lg.x,z:Lg.z,w:Lg.w,d:Lg.d,height:Lg.height,stepAccess:true});obstacles.push({x:Lg.x+.3,z:Lg.z,w:Lg.w-.6,d:Lg.d});
 for(const s of S.treads){skip(box(s.w,.12,s.d+.02,DECK,s.x,s.height-.06,s.z));
  walkSurfaces.push({x:s.x,z:s.z,w:s.w,d:s.d,height:s.height,stepAccess:true});obstacles.push({x:s.x,z:s.z,w:s.w,d:s.d});}
 // Two stringers under the treads (wall side and rail side), and the posts and handrail on the outer side.
 {const a=S.treads[0],b=S.treads[S.treads.length-1];
  for(const x of [S.wall+.12,S.x1-.08])skip(line(V(x,a.height-.1,a.z-a.d/2),V(x,0,b.z+b.d/2+.2),.08,TIMBER));
  const posts=[Lg.z-Lg.d/2+.05,...S.treads.filter((_,i)=>i%4===0).map(s=>s.z),b.z];
  for(const z of posts){const s=S.treads.find(t=>Math.abs(t.z-z)<.2),y=s?s.height:Lg.height;skip(box(.07,1,.07,GREEN,S.rail,y+.5,z));}
  skip(line(V(S.rail,Lg.height+1,Lg.z-Lg.d/2+.05),V(S.rail,Lg.height+1,a.z),.035,CREAM));
  skip(line(V(S.rail,a.height+1,a.z),V(S.rail,b.height+1,b.z),.035,CREAM));
  // The top landing's north edge rail.
  skip(line(V(S.x0+.6,Lg.height+1,S.north+.05),V(S.rail,Lg.height+1,S.north+.05),.035,CREAM));
  for(const x of [S.x0+.7,S.rail])skip(box(.07,1,.07,GREEN,x,Lg.height+.5,S.north+.05));
  // Barriers: the outer side all the way down, the landing's north and east edges.
  rails.push({x:S.rail,z:(S.north+b.z+b.d/2)/2,w:.12,d:b.z+b.d/2-S.north,floor:-1,top:HOSTEL_ROOF+1.2},
   {x:(S.x0+.6+S.rail)/2,z:S.north,w:S.rail-S.x0-.6,d:.12,floor:HOSTEL_ROOF-.3,top:HOSTEL_ROOF+1.2});}
 return {tower:{x:P.x,z:P.z},deck:{x:D.x,z:D.z}};
}
