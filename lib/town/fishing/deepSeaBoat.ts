import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {registerLandableDeck,type LandableDeck} from '../landableDecks';
import {BOAT_DECK_Y,BOAT_HULL,DEEP_SEA_BOATS,SEA_Y,type BoatLook,type DeepSeaBoat} from './deepSeaBoatData';
import {WATER_UNIFORMS} from '../../graphics/waterSurface';
import {boatSettled,createBoatRide,stepBoatMotion,type BoatMotion} from './boatMotion';
import {vehiclesOn} from '../../graphics/vehicleSwitch';
import {SWELL_AMP,setBoatRing,swellPose,type SwellPose} from '../../graphics/boatSwell';

/**
 * The Deep Sea Boat's 3D build (docs/fishing.md "Deep Sea Boat"): a small low-poly fishing boat in the island palette —
 * white hull with a red boot stripe and teal gunwale, a wooden open aft deck, a wheelhouse with a clay-red roof, rod
 * holders with rods, a cooler, a life ring and a football flag on the mast.
 *
 * Heat (AGENTS.md): the whole boat is ONE merged, vertex-coloured mesh (one draw; it receives the player's shadow but
 * casts none, so it adds no shadow-map draw). Nothing exists until the player comes within BUILD_RANGE; it is disposed
 * again beyond DROP_RANGE. Since Oct 26 2026 each boat has its own look (BOAT_LOOKS in
 * ./deepSeaBoatData.ts: size, paint, roof, sun top, mast, clutter, bow number): one cached merged geometry per look and ONE
 * shared material for all, so a second boat in range still costs one more draw (and its own small geometry). The gentle bob is one group transform, written only while the player is within BOB_RANGE,
 * the boat is inside the camera frustum and reduced motion is off; otherwise update() is a distance check. No timers,
 * no animation loop of its own (the island loop calls update()).
 *
 * Oct 15 2026 (user: "add in animation for the boat, it needs a little more movement with the water when fishing"): the bob is
 * now ./boatMotion.ts: heave, pitch and roll on the island's water clock (the swell's 5.6 s rhythm), a little bigger while the
 * player fishes on it, rocked by a cast and leaned by a running fish; the deck floor follows the heave at the fishing stand, so the
 * player (and the rod and line in their hand) ride the deck. The waterline foam collar is pinned to the sea surface in the
 * vertex shader with a small lap (no new draw), so the hull rises and falls through it. Still one group matrix write per frame,
 * only near and on screen (or while fishing on it); reduced motion keeps a very small heave only.
 */
const BUILD_RANGE=260,DROP_RANGE=340,BOB_RANGE=150;
/** The rocking boat's absolute limits with the far swell added (boatMotion.ts BOAT_LIMITS is the 5.6 s bob's own). */
export const ROCK_LIMITS={heave:.16,tilt:.07};
type Part={geometry:T.BufferGeometry;color:string;foam?:boolean};
function paint({geometry,color,foam}:Part){
 const g=geometry.index?geometry.toNonIndexed():geometry.clone();geometry.dispose();
 g.deleteAttribute('uv');const c=new T.Color(color),n=g.getAttribute('position').count,col=new Float32Array(n*3);
 for(let i=0;i<n;i++){col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('foam',new T.BufferAttribute(new Float32Array(n).fill(foam?1:0),1));return g;
}
const place=(g:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));
const box=(x0:number,x1:number,y0:number,y1:number,z0:number,z1:number)=>new T.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
/** Top-view hull outline (bow at +x), extruded from y0 to y1. */
function hullBand(b:number,x0:number,x1:number,y0:number,y1:number){
 const s=new T.Shape();s.moveTo(x0,-b);s.lineTo(2.2,-b);s.lineTo(4.3,-b*.62);s.lineTo(x1,0);s.lineTo(4.3,b*.62);s.lineTo(2.2,b);s.lineTo(x0,b);s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,y0,0);return g;
}

// ---- ROUNDED hull (Nov 26 2026, owner shot 152; `?vehicles=0` = the hull above). Same footprint (x0..x1, ±halfBeam), same deck
// height, same parts list shape: only the lines change. The plan outline has a curved bow ending in a rounded point and a tapered
// stern with rounded quarters; the underwater body is lofted through rings that pull in toward a slight V (rounded chines); the
// sheer (deck edge and bow bulwark) rises toward the bow; the wheelhouse has rounded corners and a cambered roof.
/** Half-beam at boat-local x on the rounded outline (b = the max half-beam): tapered stern (0.82 b) with rounded quarters, a
 *  straight run, then a bow curve to a rounded point at x1. */
function roundHalfBeam(b:number,x0:number,x1:number,x:number){
 const q=.9,bowFrom=1.6;
 if(x<x0+q){const u=(x0+q-x)/q;return b*(.82+.18*Math.sqrt(Math.max(0,1-u*u)));}
 if(x<=bowFrom)return b;
 const u=Math.min(1,(x-bowFrom)/(x1-bowFrom));return b*Math.pow(Math.max(0,1-Math.pow(u,2.2)),.55);
}
/** The outline's x stations (denser at the bow and the stern quarters). */
function roundStations(x0:number,x1:number){const xs:number[]=[];for(let i=0;i<=3;i++)xs.push(x0+.9*i/3);xs.push(-2,0);for(let i=0;i<=8;i++){const u=i/8;xs.push(1.6+(x1-1.6)*(1-Math.pow(1-u,1.6)));}return xs;}
/** A closed outline ring at height y, half-beam scaled by k (bow +x, both sides). */
function roundRing(b:number,x0:number,x1:number,k:number,y:number){
 const xs=roundStations(x0,x1),ring:[number,number,number][]=[];
 for(const x of xs)ring.push([x,y,-roundHalfBeam(b,x0,x1,x)*k]);
 for(let i=xs.length-2;i>=0;i--)ring.push([xs[i],y,roundHalfBeam(b,x0,x1,xs[i])*k]);
 return ring;// open at the transom (first and last points are the stern corners), closed by the caller
}
/** A lofted band through rings [y, beam factor]: the sides only (and the transom), flat-shaded later by computeVertexNormals on the
 *  merged, non-indexed geometry. */
function roundLoft(b:number,x0:number,x1:number,rings:readonly (readonly [number,number])[]){
 const pos:number[]=[],R=rings.map(([y,k])=>roundRing(b,x0,x1,k,y)),n=R[0].length;
 // (lower i, lower j, upper j, upper i) winds inward on this ring order: pushed reversed, every face points out of the hull
 const quad=(a:number[],c:number[],d:number[],e:number[])=>pos.push(...a,...d,...c,...a,...e,...d);
 for(let r=0;r+1<R.length;r++)for(let i=0;i<n;i++){const j=(i+1)%n;quad(R[r][i],R[r][j],R[r+1][j],R[r+1][i]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 return g;
}
/** A flat band (extruded outline) on the rounded outline, half-beam b, from y0 to y1, with its top cap. */
function roundBand(b:number,x0:number,x1:number,y0:number,y1:number){
 const s=new T.Shape(),ring=roundRing(b,x0,x1,1,0);ring.forEach(([x,,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,y0,0);return g;
}
/** A rounded rectangle (plan x0..x1, z0..z1, corner radius r) extruded from y0 to y1. */
function roundRect(x0:number,x1:number,z0:number,z1:number,r:number,y0:number,y1:number){
 const s=new T.Shape();s.moveTo(x0+r,-z1);s.lineTo(x1-r,-z1);s.absarc(x1-r,-z1+r,r,-Math.PI/2,0,false);s.lineTo(x1,-z0-r);s.absarc(x1-r,-z0-r,r,0,Math.PI/2,false);
 s.lineTo(x0+r,-z0);s.absarc(x0+r,-z0-r,r,Math.PI/2,Math.PI,false);s.lineTo(x0,-z1+r);s.absarc(x0+r,-z1+r,r,Math.PI,Math.PI*1.5,false);
 const g=new T.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:3});g.rotateX(-Math.PI/2);g.translate(0,y0,0);return g;
}
/** The sheer: hull pieces forward of the wheelhouse rise toward the bow (up to SHEER m at the stem, full at deck height and above). */
const SHEER=.3;
function sheer(g:T.BufferGeometry,x1:number,deckY:number){const p=g.getAttribute('position') as T.BufferAttribute;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);if(x<=3)continue;const u=Math.min(1,(x-3)/(x1-3)),w=Math.min(1,Math.max(0,(y+.1)/(deckY+.1)));p.setY(i,y+SHEER*Math.pow(u,1.6)*w);}
 return g;}
/** A thin wall from (ax,az) to (bx,bz). */
function wall(ax:number,az:number,bx:number,bz:number,y0:number,y1:number,t:number){
 const l=Math.hypot(bx-ax,bz-az);return place(new T.BoxGeometry(l,y1-y0,t),(ax+bx)/2,(y0+y1)/2,(az+bz)/2,0,-Math.atan2(bz-az,bx-ax),0);
}

/** A thin rod from point a to point b. */
function rodBetween(ax:number,ay:number,az:number,bx:number,by:number,bz:number,r:number){
 const d=new T.Vector3(bx-ax,by-ay,bz-az),l=d.length(),g=new T.CylinderGeometry(r,r,l,5);
 g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));return g.translate((ax+bx)/2,(ay+by)/2,(az+bz)/2);
}
/** Seven-segment digits (a b c d e f g) for the bow number board. */
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','4':'bcfg','5':'acdfg','6':'acdefg','7':'abc','8':'abcdefg','9':'abcdfg'};

/** The parts of one boat in the family's BASE coordinates (bow +x, starboard +z, full size); boatGeometry() scales the merge. */
export function boatParts(look:BoatLook):Part[]{
 const D=BOAT_DECK_Y,B=BOAT_HULL.halfBeam,X0=BOAT_HULL.x0,X1=BOAT_HULL.x1,rail=D+.46,parts:Part[]=[];
 const add=(geometry:T.BufferGeometry,color:string)=>parts.push({geometry,color});
 const R=vehiclesOn(),hullPart=(g:T.BufferGeometry,color:string)=>add(R?sheer(g,X1,D):g,color);
 if(R){
  // ROUNDED hull: a slim foam collar hugging the hull at the waterline, the boot lofted from a slight V up to the rounded chine,
  // the topsides, the sheer stripe and gunwale trim on the rounded outline, the deck inside it.
  parts.push({geometry:roundBand(B*.9+.1,X0+.12,X1+.02,-.43,-.405),color:'#e8f7f2',foam:true});
  hullPart(roundLoft(B,X0+.14,X1-.3,[[-.8,.55],[-.62,.74],[-.45,.86]]),look.boot);
  hullPart(roundLoft(B,X0+.04,X1-.12,[[-.45,.86],[-.28,.93]]),look.boot);
  hullPart(roundLoft(B,X0,X1,[[-.28,.94],[-.12,1],[.56,1]]),look.hull);
  hullPart(roundBand(B+.015,X0-.01,X1+.015,.3,.4),look.stripe);
  hullPart(roundBand(B+.02,X0-.02,X1+.03,.56,D-.04),look.trim);
  hullPart(roundBand(B-.14,X0+.12,X1-.2,D-.04,D),look.deck);
 }else{
 // Hull: foam collar at the waterline, boot stripe, topsides with a sheer stripe, gunwale trim, wooden deck with plank seams.
 parts.push({geometry:hullBand(B+.12,X0-.12,X1+.14,-.43,-.405),color:'#e8f7f2',foam:true});
 add(hullBand(B*.78,X0+.25,X1-.5,-.8,-.28),look.boot);
 add(hullBand(B,X0,X1,-.28,.56),look.hull);
 add(hullBand(B+.015,X0-.01,X1+.015,.3,.4),look.stripe);
 add(hullBand(B+.02,X0-.02,X1+.03,.56,D-.04),look.trim);
 add(hullBand(B-.14,X0+.12,X1-.2,D-.04,D),look.deck);
 }
 for(let x=X0+.5;x<.5;x+=.55)add(box(x-.012,x+.012,D,D+.004,-B+.18,B-.18),look.seam);
 // Bulwarks round the open aft deck (hull colour, trim cap) and low rails round the bow.
 for(const s of [-1,1]){
  if(R){// ROUNDED: the bulwarks follow the outline: round the stern quarters, straight along the deck, curved to the stem (the sheer lifts it)
   add(box(X0+.9,.6,D,rail,s*B-.06,s*B+.06).translate(0,0,-s*.03),look.hull);add(box(X0+.9,.62,rail,rail+.05,s*B-.09,s*B+.09).translate(0,0,-s*.03),look.trim);
   const xs=[X0+.2,X0+.55,X0+.92,.6,1.6,2.6,3.4,4.1,4.7,5.2,X1-.1],zAt=(x:number)=>s*(roundHalfBeam(B,X0,X1,x)-.09);
   for(let i=0;i+1<xs.length;i++){const a=xs[i],c=xs[i+1];if(a>=X0+.92&&c<=.6)continue;hullPart(wall(a,zAt(a),c,zAt(c),D,D+.34,.07),look.hull);hullPart(wall(a,zAt(a),c,zAt(c),D+.34,D+.38,.11),look.trim);}
   continue;}
  add(box(X0,.6,D,rail,s*B-.06,s*B+.06).translate(0,0,-s*.03),look.hull);add(box(X0-.02,.62,rail,rail+.05,s*B-.09,s*B+.09).translate(0,0,-s*.03),look.trim);
  add(wall(3.4,s*B*.99,4.3,s*B*.62,D,D+.34,.07),look.hull);add(wall(4.3,s*B*.62,X1-.1,0,D,D+.34,.07),look.hull);
  add(wall(3.4,s*B*.99,4.3,s*B*.62,D+.34,D+.38,.11),look.trim);add(wall(4.3,s*B*.62,X1-.1,0,D+.34,D+.38,.11),look.trim);}
 const tw=roundHalfBeam(B,X0,X1,X0+.2)-.09;
 if(R)add(box(X0+.14,X0+.26,D,rail-.1,-tw,tw),look.hull);else add(box(X0,X0+.12,D,rail-.1,-B,B),look.hull);
 if(R)add(box(X0+.11,X0+.29,rail-.1,rail-.05,-tw-.03,tw+.03),look.trim);else add(box(X0-.03,X0+.15,rail-.1,rail-.05,-B-.03,B+.03),look.trim);
 // The bow number board on both sides (cream plate, painted seven-segment digits that read the right way from each side).
 for(const s of [-1,1]){const zb=s*(B+.005);add(box(1.12,1.78,-.15,.22,zb-.012,zb+.012),'#fff6e6');
  const n=look.number,w=.16,h=.3,t=.04,gap=.08,total=n.length*w+(n.length-1)*gap,u0=1.45-total/2,zd=s*(B+.024);
  [...n].forEach((ch,i)=>{const segs=DIGITS[ch]??'',du=i*(w+gap);
   const seg=(ua:number,ub:number,va:number,vb:number)=>{const xa=s>0?u0+du+ua:1.45+total/2-du-ub,xb=s>0?u0+du+ub:1.45+total/2-du-ua;add(box(xa,xb,-.12+va,-.12+vb,zd-.008,zd+.008),'#213d49');};
   for(const c of segs){if(c==='a')seg(0,w,h-t,h);else if(c==='b')seg(w-t,w,h/2,h);else if(c==='c')seg(w-t,w,0,h/2);else if(c==='d')seg(0,w,0,t);
    else if(c==='e')seg(0,t,0,h/2);else if(c==='f')seg(0,t,h/2,h);else seg(0,w,h/2-t/2,h/2+t/2);}});}
 // Wheelhouse: walls, windows all round, a door facing the deck, the roof.
 if(R){// ROUNDED wheelhouse: rounded corners, the front windows on the flat of the face, a cambered roof with a rounded edge
  add(roundRect(.6,3.4,-1.35,1.35,.38,D,2.75),look.cabin);add(roundRect(.58,3.42,-1.37,1.37,.39,D,1.05),look.cabinBand);
  add(box(3.4,3.44,1.85,2.45,-.94,.94),'#27445a');for(const s of [-1,1])add(box(1.15,3.0,1.85,2.45,s*1.35-.02,s*1.35+.02),'#27445a');
  const camber=(g:T.BufferGeometry,y0:number,a:number,half:number)=>{const p=g.getAttribute('position') as T.BufferAttribute;for(let i=0;i<p.count;i++){const z=p.getZ(i)/half;if(p.getY(i)>y0)p.setY(i,p.getY(i)+a*(1-z*z));}return g;};
  add(camber(roundRect(.4,3.7,-1.55,1.55,.55,2.75,2.9),2.8,.12,1.55),look.roof);add(camber(roundRect(.5,3.6,-1.42,1.42,.48,2.9,2.96),2.8,.12,1.42),look.roofEdge);
 }else{
 add(box(.6,3.4,D,2.75,-1.35,1.35),look.cabin);add(box(.58,3.42,D,1.05,-1.37,1.37),look.cabinBand);
 add(box(3.4,3.44,1.85,2.45,-1.05,1.05),'#27445a');for(const s of [-1,1])add(box(1.15,3.05,1.85,2.45,s*1.35-.02,s*1.35+.02),'#27445a');
 add(box(.4,3.7,2.75,2.9,-1.55,1.55),look.roof);add(box(.45,3.65,2.9,2.96,-1.45,1.45),look.roofEdge);}
 add(box(.56,.6,D,2.2,-.42,.42),'#8a5a3c');add(box(.55,.61,1.95,2.15,-.25,.25),'#27445a');
 // Searchlight and horn on the roof.
 add(place(new T.CylinderGeometry(.13,.16,.2,8),3.1,3.05,.8,0,0,Math.PI/2),'#e6c477');add(box(2.85,3.0,2.96,3.08,.72,.88),'#6d6f73');
 if(look.mast==='flag-outriggers'){
  // Mast with a football flag, and two outrigger poles angled out over the water.
  add(place(new T.CylinderGeometry(.045,.055,1.7,6),1.4,3.8,0),'#6e5540');add(place(new T.CylinderGeometry(.025,.025,.9,5),1.4,4.1,0,Math.PI/2,0,0),'#6e5540');
  add(wall(1.43,0,2.0,.12,4.05,4.6,.03),look.flag);add(wall(2.0,.12,2.5,-.02,4.05,4.6,.03),look.flag);
  add(place(new T.CylinderGeometry(.16,.16,.04,10),1.95,4.32,.12,Math.PI/2,-.2,0),look.flagMark);add(place(new T.CylinderGeometry(.06,.06,.05,5),1.95,4.32,.13,Math.PI/2,-.2,0),'#1d3a32');
  for(const s of [-1,1]){add(rodBetween(2.1,2.96,s*1.2,.9,4.9,s*2.75,.03),'#bdc9c5');add(place(new T.SphereGeometry(.06,5,3),.9,4.9,s*2.75),look.trim);}
 }else{
  // Striped sun top on four posts over the roof, a short mast and a long pennant.
  const [c0,c1]=look.canopy??[look.trim,look.hull];
  for(const x of [.75,3.25])for(const z of [-1.25,1.25])add(place(new T.CylinderGeometry(.03,.03,.56,5),x,3.24,z),'#d9d4c4');
  for(let k=0;k<6;k++){const z0=-1.4+k*(2.8/6);add(box(.55,3.45,3.52,3.57,z0,z0+2.8/6),k%2?c1:c0);}
  for(const s of [-1,1])for(let k=0;k<6;k++){const x0=.55+k*(2.9/6);add(box(x0,x0+2.9/6,3.42,3.52,s*1.4-.01,s*1.4+.01),k%2?c1:c0);}
  add(place(new T.CylinderGeometry(.035,.045,1.0,6),2.9,4.07,0),'#6e5540');
  const tri=new T.Shape();tri.moveTo(0,0);tri.lineTo(0,.26);tri.lineTo(-.95,.13);tri.closePath();
  add(new T.ExtrudeGeometry(tri,{depth:.025,bevelEnabled:false,curveSegments:1}).translate(2.88,4.3,-.012),look.flag);
  const tip=new T.Shape();tip.moveTo(-.55,.065);tip.lineTo(-.55,.195);tip.lineTo(-.95,.13);tip.closePath();
  add(new T.ExtrudeGeometry(tip,{depth:.03,bevelEnabled:false,curveSegments:1}).translate(2.88,4.3,-.015),look.flagMark);
 }
 // Life ring on the wheelhouse's aft wall (quarters in the look's two colours).
 for(let k=0;k<4;k++)add(new T.TorusGeometry(.3,.07,6,6,Math.PI/2).rotateZ(k*Math.PI/2).rotateY(Math.PI/2).translate(.5,1.6,.9),look.ring[k%2]);
 if(look.clutter==='cooler'){
  // Cooler in the port corner of the deck (lid, handle), tackle box by the wheelhouse door, a coil of rope.
  add(box(-5.1,-4.3,D,D+.48,-1.72,-1.22),'#4f8fc0');add(box(-5.12,-4.28,D+.48,D+.56,-1.74,-1.2),'#fff6e6');add(box(-4.8,-4.6,D+.56,D+.6,-1.5,-1.44),'#294f43');
  add(box(-.35,.2,D,D+.28,-1.6,-1.25),'#d6a15d');add(box(-.37,.22,D+.28,D+.32,-1.62,-1.23),'#8a5a3c');
  add(new T.TorusGeometry(.2,.055,4,9).rotateX(Math.PI/2).translate(-1.4,D+.055,-1.42),'#d8c193');
 }else{
  // Stacked fish boxes in the port corner, a third beside them, a net pile with floats in the starboard corner, a rope coil.
  add(box(-5.1,-4.4,D,D+.3,-1.75,-1.2),'#ef8a3a');add(box(-5.05,-4.45,D+.3,D+.58,-1.72,-1.24),'#3f8f8a');add(box(-4.3,-3.65,D,D+.28,-1.75,-1.25),'#ef8a3a');
  add(new T.IcosahedronGeometry(.4,0).scale(1,.32,.8).translate(-4.6,D+.1,1.15),'#4f7f5a');
  for(const [x,z] of [[-4.85,1.0],[-4.4,1.35],[-4.5,.9]])add(place(new T.SphereGeometry(.07,5,3),x,D+.2,z),'#ef8a3a');
  add(new T.TorusGeometry(.2,.055,4,9).rotateX(Math.PI/2).translate(-3.2,D+.055,-1.45),'#d8c193');
 }
 // Rod holders on the starboard rail and the transom, each with a rod, a reel and a line tip.
 const sideXs=[[-4.2],[-4.2,-1.6],[-4.2,-2.9,-1.6]][Math.max(0,Math.min(2,look.rods.side-1))],transomZs=look.rods.transom>=2?[-.9,.9]:look.rods.transom===1?[.9]:[];
 const holders=[...sideXs.map(x=>[x,B-.03,.45]),...transomZs.map(z=>[X0+.05,z,-.45])];
 for(const [x,z,lean] of holders){
  const onSide=Math.abs(z)>1?0:1;
  add(place(new T.CylinderGeometry(.055,.045,.32,6),x,rail-.06,z),'#bdc9c5');
  const rx=onSide?0:lean,rz=onSide?-lean:0;// lean out over the water (starboard rods toward +z, transom rods toward -x)
  const rod=new T.CylinderGeometry(.012,.028,2.4,5).translate(0,1.2,0);place(rod,x,rail-.2,z,rx,0,rz);add(rod,'#213d49');
  add(place(new T.CylinderGeometry(.06,.06,.06,8),x,rail+.2,z,Math.PI/2,0,0).translate(onSide?-.08:0,0,onSide?0:-.08),'#d6c99d');
 }
 // Fenders hanging on the port side.
 for(const x of [-3.6,-1.2])add(place(new T.CylinderGeometry(.13,.13,.45,8),x,.1,-B-.1),look.fender);
 // ROUNDED: fenders along both sides (rounded ends), the starboard pair aft of the rods' lines.
 if(R){for(const x of [-4.4,1.0])add(place(new T.CapsuleGeometry(.13,.3,1,6),x,.1,-B-.1),look.fender);for(const x of [-.4,1.2])add(place(new T.CapsuleGeometry(.13,.3,1,6),x,.1,B+.1),look.fender);}
 return parts;
}
/** One boat's merged, vertex-coloured geometry: the base parts merged, then scaled to its size (length x, beam z, freeboard
 *  about the sea surface so the waterline and the foam collar stay put). */
export function boatGeometry(look:BoatLook){
 const parts=boatParts(look).map(paint),geometry=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());
 const {length,beam,freeboard}=look.scale;
 geometry.applyMatrix4(new T.Matrix4().makeTranslation(0,SEA_Y,0).multiply(new T.Matrix4().makeScale(length,freeboard,beam)).multiply(new T.Matrix4().makeTranslation(0,-SEA_Y,0)));
 geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}

export type DeepSeaBoatUpdate={x:number;z:number;camera:T.Camera;elapsed:number;reduced:boolean;dt?:number};
/** The hull material: the foam collar (attribute `foam`) is pinned to the sea surface in world space with a small lap, so the
 *  boat heaves and rolls through it and the waterline always shows (vertex shader only; no extra draw, no CPU work). */
const WATERLINE_Y=-.428;
/** Also the Matchday Ferry's rounded body (world.ts, ferryModel.ts): same program (cache key), so no new shader. */
export function foamMaterial(){
 const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.8});
 m.onBeforeCompile=sh=>{sh.uniforms.uWaterTime=WATER_UNIFORMS.uWaterTime;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float foam;uniform float uWaterTime;')
   .replace('#include <project_vertex>',`vec4 mvPosition=vec4(transformed,1.);
if(foam>.5){vec4 fw=modelMatrix*mvPosition;float lap=sin(uWaterTime*2.3+fw.x*1.6+fw.z*1.1)*.012+sin(uWaterTime*3.7+fw.z*2.3)*.006;
 fw.y=${WATERLINE_Y.toFixed(3)}+(position.y+.43)+lap;mvPosition=viewMatrix*fw;}else mvPosition=modelViewMatrix*mvPosition;
gl_Position=projectionMatrix*mvPosition;`);};
 m.customProgramCacheKey=()=>'deep-sea-boat-foam-v1';return m;}
/** One cached merged geometry per look (built on first use, released when no boat of that look holds it) and ONE material for
 *  every look (vertex colours carry the paint), so a boat costs one draw and boats of the same look share their memory. */
const geometries=new Map<string,{geometry:T.BufferGeometry;users:number}>();
let material:{material:T.Material;users:number}|null=null;
function takeShared(look:BoatLook){
 let g=geometries.get(look.key);if(!g){g={geometry:boatGeometry(look),users:0};geometries.set(look.key,g);}g.users++;
 if(!material)material={material:foamMaterial(),users:0};material.users++;
 return {geometry:g.geometry,material:material.material};
}
function releaseShared(look:BoatLook){
 const g=geometries.get(look.key);if(g&&--g.users<=0){g.geometry.dispose();geometries.delete(look.key);}
 if(material&&--material.users<=0){material.material.dispose();material=null;}
}
/** Live cached boat geometries (tests). */
export const boatGeometryCount=()=>geometries.size;
export function createDeepSeaBoat(scene:T.Scene,boat:DeepSeaBoat=DEEP_SEA_BOATS[0]){
 const M=boat.mooring,YAW=boat.yaw,look=boat.look,deckY=boat.deckY;
 let group:T.Group|null=null,unregister:(()=>void)|null=null,bobbing=false;
 // The ride (./boatMotion.ts): fishing on this boat, a cast kick this frame, the fight's lean; the last pose (for the camera).
 const ride=createBoatRide(),seed=(M.x*.013)%1;let riding=false,kick=false,lean=0;const motion:BoatMotion={heave:0,pitch:0,roll:0,yaw:0};
 /** The stand's local offset (the deck floor height follows the heave and the tilt there). */
 const standLX=boat.standLocal.x,standLZ=boat.standLocal.z;
 const deck:LandableDeck={...boat.deck,floating:true};// deep water: no shelf beside it (landableDecks.ts `floating`, boatHull.ts)
 // ROUNDED / ROCKING (Nov 26 2026, `?vehicles=0` = before): the boat also rides the far sea's long swell (boatSwell.ts swellPose, its
 // own phase from its mooring), so it visibly rocks in place; the WHOLE deck follows the pose (heightAt: heave + the pitch and roll at
 // that point), so the angler, the captain and anyone who jetpacks aboard stand on the moving floor instead of the stand's height only.
 // Its water ring (foam + lapping ripples) is a slot in the ocean shader while the boat is built.
 const rock=vehiclesOn(),slot=1+Math.max(0,DEEP_SEA_BOATS.indexOf(boat)),sw:SwellPose={heave:0,pitch:0,roll:0},YC=Math.cos(YAW),YS=Math.sin(YAW);
 const amp={heave:SWELL_AMP.sea.heave*look.swell,pitch:SWELL_AMP.sea.pitch*look.swell,roll:SWELL_AMP.sea.roll*look.swell};
 if(rock)deck.heightAt=(x,z)=>{const dx=x-M.x,dz=z-M.z,lx=dx*YC-dz*YS,lz=dx*YS+dz*YC;return deckY+motion.heave+lx*motion.pitch-lz*motion.roll;};
 const ringC=boat.toWorld((boat.hull.x0+boat.hull.x1)/2,0);
 const frustum=new T.Frustum(),pv=new T.Matrix4(),sphere=new T.Sphere(new T.Vector3(M.x,1.5,M.z),6.5*look.scale.length);
 function build(){
  const {geometry,material}=takeShared(look);
  const mesh=new T.Mesh(geometry,material);mesh.name='deep-sea-boat-hull';mesh.receiveShadow=true;mesh.castShadow=false;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
  group=new T.Group();group.name=boat.spotId;group.position.set(M.x,0,M.z);group.rotation.y=YAW;group.matrixAutoUpdate=false;group.add(mesh);group.updateMatrix();scene.add(group);
  deck.height=deckY;unregister=registerLandableDeck(deck);
  if(rock)setBoatRing(slot,ringC.x,ringC.z,YAW,(boat.hull.x1-boat.hull.x0)/2,boat.hull.halfBeam*.92,1);
 }
 function drop(){if(rock)setBoatRing(slot,0,0,0,1,1,0);unregister?.();unregister=null;if(group){group.removeFromParent();releaseShared(look);}group=null;bobbing=false;}
 return {
  boat,
  /** The live deck (null while the boat is not built). */
  get deck(){return unregister?deck:null;},
  get built(){return !!group;},
  update(c:DeepSeaBoatUpdate){
   const d=Math.hypot(c.x-M.x,c.z-M.z);
   if(!group){if(d<BUILD_RANGE)build();else return;}
   if(d>DROP_RANGE){drop();return;}
   // Moves while the player fishes on it, or while it is near and on screen; otherwise one distance check (and settled: no work).
   let bob=riding||d<BOB_RANGE;
   if(bob&&!riding){c.camera.updateMatrixWorld();pv.multiplyMatrices(c.camera.projectionMatrix,c.camera.matrixWorldInverse);frustum.setFromProjectionMatrix(pv);bob=frustum.intersectsSphere(sphere);}
   const g=group!;
   if(bob||!boatSettled(ride)&&bobbing){const m=stepBoatMotion(ride,c.dt??1/60,WATER_UNIFORMS.uWaterTime.value,seed,{fishing:riding,reduced:c.reduced,lean,kick,swell:look.swell});kick=false;Object.assign(motion,m);
    if(rock&&!c.reduced){swellPose(M.x,M.z,WATER_UNIFORMS.uWaterTime.value,YAW,amp,sw);
     motion.heave=Math.max(-ROCK_LIMITS.heave,Math.min(ROCK_LIMITS.heave,m.heave+sw.heave));motion.pitch=Math.max(-ROCK_LIMITS.tilt,Math.min(ROCK_LIMITS.tilt,m.pitch+sw.pitch));
     motion.roll=Math.max(-ROCK_LIMITS.tilt,Math.min(ROCK_LIMITS.tilt,m.roll+sw.roll));}
    g.position.y=motion.heave;g.rotation.set(motion.roll,YAW+motion.yaw,motion.pitch,'YXZ');g.updateMatrix();
    // The floor under the fishing stand (local x = bow, z = starboard): heave, plus the pitch and roll at that point.
    deck.height=deckY+motion.heave+standLX*motion.pitch-standLZ*motion.roll;bob=true;}
   else if(bobbing){g.position.y=0;g.rotation.set(0,YAW,0,'YXZ');g.updateMatrix();deck.height=deckY;motion.heave=motion.pitch=motion.roll=motion.yaw=0;}
   bobbing=bob;
  },
  /** Fishing on this boat (the bigger swell; the camera rides along). */
  ride(on:boolean){riding=on;if(!on)lean=0;},
  /** A cast from this boat rocks it once. */
  kick(){kick=true;},
  /** A running fish pulls the boat toward its side (-1..1; 0 = none). */
  lean(side:number){lean=side;},
  /** The current pose (heave m, angles rad), for the fishing camera. */
  get motion():Readonly<BoatMotion>{return motion;},
  dispose:drop,
 };
}
