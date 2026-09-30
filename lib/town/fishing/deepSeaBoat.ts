import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {registerLandableDeck} from '../landableDecks';
import {BOAT_DECK,BOAT_DECK_Y,BOAT_HULL,BOAT_MOORING,BOAT_YAW} from './deepSeaBoatData';

/**
 * The Deep Sea Boat's 3D build (docs/fishing.md "Deep Sea Boat"): a small low-poly fishing boat in the island palette —
 * white hull with a red boot stripe and teal gunwale, a wooden open aft deck, a wheelhouse with a clay-red roof, rod
 * holders with rods, a cooler, a life ring and a football flag on the mast.
 *
 * Heat (AGENTS.md): the whole boat is ONE merged, vertex-coloured mesh (one draw; it receives the player's shadow but
 * casts none, so it adds no shadow-map draw). Nothing exists until the player comes within BUILD_RANGE; it is disposed
 * again beyond DROP_RANGE. The gentle bob is one group transform, written only while the player is within BOB_RANGE,
 * the boat is inside the camera frustum and reduced motion is off; otherwise update() is a distance check. No timers,
 * no animation loop of its own (the island loop calls update()).
 */
const BUILD_RANGE=260,DROP_RANGE=340,BOB_RANGE=150;
type Part={geometry:T.BufferGeometry;color:string};
function paint({geometry,color}:Part){
 const g=geometry.index?geometry.toNonIndexed():geometry.clone();geometry.dispose();
 g.deleteAttribute('uv');const c=new T.Color(color),n=g.getAttribute('position').count,col=new Float32Array(n*3);
 for(let i=0;i<n;i++){col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new T.BufferAttribute(col,3));return g;
}
const place=(g:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));
const box=(x0:number,x1:number,y0:number,y1:number,z0:number,z1:number)=>new T.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
/** Top-view hull outline (bow at +x), extruded from y0 to y1. */
function hullBand(b:number,x0:number,x1:number,y0:number,y1:number){
 const s=new T.Shape();s.moveTo(x0,-b);s.lineTo(2.2,-b);s.lineTo(4.3,-b*.62);s.lineTo(x1,0);s.lineTo(4.3,b*.62);s.lineTo(2.2,b);s.lineTo(x0,b);s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,y0,0);return g;
}
/** A thin wall from (ax,az) to (bx,bz). */
function wall(ax:number,az:number,bx:number,bz:number,y0:number,y1:number,t:number){
 const l=Math.hypot(bx-ax,bz-az);return place(new T.BoxGeometry(l,y1-y0,t),(ax+bx)/2,(y0+y1)/2,(az+bz)/2,0,-Math.atan2(bz-az,bx-ax),0);
}

function boatParts():Part[]{
 const D=BOAT_DECK_Y,B=BOAT_HULL.halfBeam,rail=D+.46,parts:Part[]=[];
 const add=(geometry:T.BufferGeometry,color:string)=>parts.push({geometry,color});
 // Hull: foam collar at the waterline, red boot stripe, white topsides, teal gunwale, wooden deck with plank seams.
 add(hullBand(B+.12,BOAT_HULL.x0-.12,BOAT_HULL.x1+.14,-.43,-.405),'#e8f7f2');
 add(hullBand(B*.78,BOAT_HULL.x0+.25,BOAT_HULL.x1-.5,-.8,-.28),'#b8483a');
 add(hullBand(B,BOAT_HULL.x0,BOAT_HULL.x1,-.28,.56),'#f3ecdb');
 add(hullBand(B+.02,BOAT_HULL.x0-.02,BOAT_HULL.x1+.03,.56,D-.04),'#2f6f73');
 add(hullBand(B-.14,BOAT_HULL.x0+.12,BOAT_HULL.x1-.2,D-.04,D),'#c9a172');
 for(let x=BOAT_HULL.x0+.5;x<.5;x+=.55)add(box(x-.012,x+.012,D,D+.004,-B+.18,B-.18),'#9c7650');
 // Bulwarks round the open aft deck (white, teal cap) and low rails round the bow.
 for(const s of [-1,1]){add(box(BOAT_HULL.x0,.6,D,rail,s*B-.06,s*B+.06).translate(0,0,-s*.03),'#f3ecdb');add(box(BOAT_HULL.x0-.02,.62,rail,rail+.05,s*B-.09,s*B+.09).translate(0,0,-s*.03),'#2f6f73');
  add(wall(3.4,s*B*.99,4.3,s*B*.62,D,D+.34,.07),'#f3ecdb');add(wall(4.3,s*B*.62,BOAT_HULL.x1-.1,0,D,D+.34,.07),'#f3ecdb');
  add(wall(3.4,s*B*.99,4.3,s*B*.62,D+.34,D+.38,.11),'#2f6f73');add(wall(4.3,s*B*.62,BOAT_HULL.x1-.1,0,D+.34,D+.38,.11),'#2f6f73');}
 add(box(BOAT_HULL.x0,BOAT_HULL.x0+.12,D,rail-.1,-B,B),'#f3ecdb');add(box(BOAT_HULL.x0-.03,BOAT_HULL.x0+.15,rail-.1,rail-.05,-B-.03,B+.03),'#2f6f73');
 // Wheelhouse: walls, windows all round, a door facing the deck, clay-red roof.
 add(box(.6,3.4,D,2.75,-1.35,1.35),'#f6f1e3');add(box(.58,3.42,D,1.05,-1.37,1.37),'#477c6a');
 add(box(3.4,3.44,1.85,2.45,-1.05,1.05),'#27445a');for(const s of [-1,1])add(box(1.15,3.05,1.85,2.45,s*1.35-.02,s*1.35+.02),'#27445a');
 add(box(.56,.6,D,2.2,-.42,.42),'#8a5a3c');add(box(.55,.61,1.95,2.15,-.25,.25),'#27445a');
 add(box(.4,3.7,2.75,2.9,-1.55,1.55),'#bd7657');add(box(.45,3.65,2.9,2.96,-1.45,1.45),'#a9654a');
 // Searchlight and horn on the roof, mast with a football flag.
 add(place(new T.CylinderGeometry(.13,.16,.2,8),3.1,3.05,.8,0,0,Math.PI/2),'#e6c477');add(box(2.85,3.0,2.96,3.08,.72,.88),'#6d6f73');
 add(place(new T.CylinderGeometry(.045,.055,1.7,6),1.4,3.8,0),'#6e5540');add(place(new T.CylinderGeometry(.025,.025,.9,5),1.4,4.1,0,Math.PI/2,0,0),'#6e5540');
 add(wall(1.43,0,2.0,.12,4.05,4.6,.03),'#3f7a78');add(wall(2.0,.12,2.5,-.02,4.05,4.6,.03),'#3f7a78');
 add(place(new T.CylinderGeometry(.16,.16,.04,10),1.95,4.32,.12,Math.PI/2,-.2,0),'#fff6e6');add(place(new T.CylinderGeometry(.06,.06,.05,5),1.95,4.32,.13,Math.PI/2,-.2,0),'#1d3a32');
 // Life ring on the wheelhouse's aft wall (red and white quarters).
 for(let k=0;k<4;k++)add(new T.TorusGeometry(.3,.07,6,6,Math.PI/2).rotateZ(k*Math.PI/2).rotateY(Math.PI/2).translate(.5,1.6,.9),k%2?'#fff3df':'#e0513f');
 // Cooler in the port corner of the deck (lid, handle).
 add(box(-5.1,-4.3,D,D+.48,-1.72,-1.22),'#4f8fc0');add(box(-5.12,-4.28,D+.48,D+.56,-1.74,-1.2),'#fff6e6');add(box(-4.8,-4.6,D+.56,D+.6,-1.5,-1.44),'#294f43');
 // Tackle box by the wheelhouse door.
 add(box(-.35,.2,D,D+.28,-1.6,-1.25),'#d6a15d');add(box(-.37,.22,D+.28,D+.32,-1.62,-1.23),'#8a5a3c');
 // Rod holders on the starboard rail and the transom, each with a rod, a reel and a line tip.
 for(const [x,z,lean] of [[-4.2,B-.03,.45],[-2.9,B-.03,.45],[-1.6,B-.03,.45],[BOAT_HULL.x0+.05,-.9,-.45],[BOAT_HULL.x0+.05,.9,-.45]] as const){
  const side=Math.abs(z)>1?0:1;
  add(place(new T.CylinderGeometry(.055,.045,.32,6),x,rail-.06,z),'#bdc9c5');
  const rx=side?0:lean,rz=side?-lean:0;// lean out over the water (starboard rods toward +z, transom rods toward -x)
  const rod=new T.CylinderGeometry(.012,.028,2.4,5).translate(0,1.2,0);place(rod,x,rail-.2,z,rx,0,rz);add(rod,'#213d49');
  add(place(new T.CylinderGeometry(.06,.06,.06,8),x,rail+.2,z,Math.PI/2,0,0).translate(side?-.08:0,0,side?0:-.08),'#d6c99d');
 }
 // Fenders hanging on the port side.
 for(const x of [-3.6,-1.2])add(place(new T.CylinderGeometry(.13,.13,.45,8),x,.1,-B-.1),'#e0513f');
 return parts;
}

export type DeepSeaBoatUpdate={x:number;z:number;camera:T.Camera;elapsed:number;reduced:boolean};
export function createDeepSeaBoat(scene:T.Scene){
 let group:T.Group|null=null,geometry:T.BufferGeometry|null=null,material:T.Material|null=null,unregister:(()=>void)|null=null,bobbing=false;
 const deck={...BOAT_DECK};
 const frustum=new T.Frustum(),pv=new T.Matrix4(),sphere=new T.Sphere(new T.Vector3(BOAT_MOORING.x,1.5,BOAT_MOORING.z),6.5);
 function build(){
  const parts=boatParts().map(paint);geometry=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();
  material=new T.MeshStandardMaterial({vertexColors:true,roughness:.8});
  const mesh=new T.Mesh(geometry,material);mesh.name='deep-sea-boat-hull';mesh.receiveShadow=true;mesh.castShadow=false;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
  group=new T.Group();group.name='deep-sea-boat';group.position.set(BOAT_MOORING.x,0,BOAT_MOORING.z);group.rotation.y=BOAT_YAW;group.matrixAutoUpdate=false;group.add(mesh);group.updateMatrix();scene.add(group);
  deck.height=BOAT_DECK_Y;unregister=registerLandableDeck(deck);
 }
 function drop(){unregister?.();unregister=null;group?.removeFromParent();geometry?.dispose();material?.dispose();group=null;geometry=null;material=null;bobbing=false;}
 return {
  /** The live deck (null while the boat is not built). */
  get deck(){return unregister?deck:null;},
  get built(){return !!group;},
  update(c:DeepSeaBoatUpdate){
   const d=Math.hypot(c.x-BOAT_MOORING.x,c.z-BOAT_MOORING.z);
   if(!group){if(d<BUILD_RANGE)build();else return;}
   if(d>DROP_RANGE){drop();return;}
   let bob=!c.reduced&&d<BOB_RANGE;
   if(bob){c.camera.updateMatrixWorld();pv.multiplyMatrices(c.camera.projectionMatrix,c.camera.matrixWorldInverse);frustum.setFromProjectionMatrix(pv);bob=frustum.intersectsSphere(sphere);}
   const g=group!;
   if(bob){const t=c.elapsed,y=Math.sin(t*1.1)*.035;g.position.y=y;g.rotation.set(Math.sin(t*.9+1)*.006,BOAT_YAW,Math.sin(t*.75)*.013,'YXZ');g.updateMatrix();deck.height=BOAT_DECK_Y+y;}
   else if(bobbing){g.position.y=0;g.rotation.set(0,BOAT_YAW,0,'YXZ');g.updateMatrix();deck.height=BOAT_DECK_Y;}
   bobbing=bob;
  },
  dispose:drop,
 };
}
