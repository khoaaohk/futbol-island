/**
 * The Summit Isle painting easel's static prop (Oct 14 2026): a wooden A-frame easel with a blank canvas board, a stool and a small
 * paint table (palette with paint blobs, paint pots, a jar of brushes and a jar of water). Built inside buildTown like the other summit
 * props (lib/town/world.ts), so every piece joins the island's 50 m static batches: no extra draw call, no animation, no per-frame
 * work. The only live piece is the player's latest painting on the board, a single small textured quad added by the runtime
 * (lib/graphics/paintEasel.ts) only once a painting has been saved.
 * Placement and poses come from lib/town/paintEasel.ts (easelSpot, EASEL_LAYOUT, canvasPose), the same functions the runtime uses.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {easelSpot,easelPoint,canvasPose,EASEL_LAYOUT,type EaselSpot} from './paintEasel';
import {summitGround} from './summitIsle';

type Mesh=T.Mesh;
export type PaintEaselTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>Mesh;
 obstacles:Obstacle[];
};
const WOOD='#a8794e',WOOD_DARK='#7d5636',BOARD='#f6efdc',PALETTE_WOOD='#d2a873',GLASS='#bfe4ea',UP=new T.Vector3(0,1,0);

export function buildPaintEasel(t:PaintEaselTools,s:EaselSpot=easelSpot()){
 const {box,cylinder,put,obstacles}=t;
 const at=(f:number,r:number)=>easelPoint(s,f,r);
 const ground=(p:{x:number;z:number})=>summitGround(p.x,p.z);
 const g0=s.ground;
 /** A square wooden beam from a to b (world points). */
 const beam=(a:T.Vector3,b:T.Vector3,th:number,c:string)=>{const d=b.clone().sub(a),m=box(th,d.length(),th,c,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);m.quaternion.setFromUnitVectors(UP,d.normalize());return m;};
 const v=(f:number,r:number,y:number)=>{const p=at(f,r);return new T.Vector3(p.x,y,p.z);};
 const foot=(f:number,r:number)=>{const p=at(f,r);return new T.Vector3(p.x,ground(p)-.08,p.z);};

 // ---- The easel: two front legs under the board, a back leg out toward the view, a tray, the board and its top clamp.
 const top=g0+2.02;
 // The legs stand on the view side of the board (the painted face looks back at the painter, clear of them).
 for(const side of [-1,1])beam(foot(.1,side*.46),v(.36,side*.13,top),.05,WOOD);
 beam(foot(1.0,0),v(.4,0,top-.06),.045,WOOD_DARK);
 beam(v(.2,-.38,g0+.62),v(.2,.38,g0+.62),.035,WOOD_DARK);// cross brace
 const C=canvasPose(s);
 const n=new T.Vector3(C.nx,C.ny,C.nz),r=new T.Vector3(s.rx,0,s.rz),u=new T.Vector3().crossVectors(n,r).normalize();
 const q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(r,u,n));
 const centre=new T.Vector3(C.x,C.y,C.z);
 const plate=(w:number,h:number,d:number,c:string,du:number,dn:number)=>{const p=centre.clone().addScaledVector(u,du).addScaledVector(n,dn);const m=box(w,h,d,c,p.x,p.y,p.z);m.quaternion.copy(q);return m;};
 plate(C.w+.06,C.h+.06,.03,WOOD_DARK,0,-.03);// the stretcher frame behind the canvas
 plate(C.w,C.h,.035,BOARD,0,0);// the blank canvas (the latest painting is laid over it by the runtime)
 plate(C.w+.16,.05,.11,WOOD,-C.h/2-.035,.03);// the tray the canvas rests on
 plate(.16,.06,.07,WOOD,C.h/2+.04,.0);// the top clamp
 plate(.06,.5,.05,WOOD,C.h/2+.2,-.25);// the mast from the clamp back to the legs' top

 // ---- The stool beside the painter.
 {const p=at(EASEL_LAYOUT.stool.f,EASEL_LAYOUT.stool.r),g=ground(p);
  cylinder(.21,.06,WOOD,p.x,g+.56,p.z).castShadow=true;
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2+s.yaw;beam(new T.Vector3(p.x+Math.sin(a)*.2,g-.06,p.z+Math.cos(a)*.2),new T.Vector3(p.x+Math.sin(a)*.1,g+.54,p.z+Math.cos(a)*.1),.035,WOOD_DARK);}
  obstacles.push({x:p.x,z:p.z,w:.42,d:.42});}

 // ---- The paint table: a small top on four legs, the palette with paint, three pots, a jar of brushes and a jar of water.
 {const p=at(EASEL_LAYOUT.table.f,EASEL_LAYOUT.table.r),g=ground(p),h=g+.72;
  const tq=new T.Quaternion().setFromAxisAngle(UP,s.yaw);
  const topM=box(.48,.045,.72,WOOD,p.x,h,p.z);topM.quaternion.copy(tq);
  const local=(a:number,b:number)=>({x:p.x+s.fx*a+s.rx*b,z:p.z+s.fz*a+s.rz*b});// a: forward, b: right
  for(const [a,b] of [[-.19,-.31],[-.19,.31],[.19,-.31],[.19,.31]]){const l=local(a,b);beam(new T.Vector3(l.x,ground(l)-.06,l.z),new T.Vector3(l.x,h-.02,l.z),.045,WOOD_DARK);}
  const on=(a:number,b:number,y:number)=>{const l=local(a,b);return {x:l.x,y:h+.022+y,z:l.z};};
  // Palette (a flat oval board) with blobs of the view's colours.
  {const o=on(-.04,-.14,.008),pal=put(new T.CylinderGeometry(.17,.17,.016,14),PALETTE_WOOD,o.x,o.y,o.z);pal.scale.set(1,1,.72);pal.quaternion.copy(tq);pal.castShadow=false;
   const blobs=['#3fbfb4','#8fcbe8','#79b85a','#f58a4b','#ffd45e','#ef8fb0','#fbf8f0'];
   blobs.forEach((c,i)=>{const a=i/blobs.length*Math.PI*1.7-.6,b2=on(-.04+Math.cos(a)*.085,-.14+Math.sin(a)*.12,.022);const m=put(new T.SphereGeometry(.026,7,5),c,b2.x,b2.y,b2.z);m.scale.y=.45;m.castShadow=false;});}
  // Paint pots.
  [['#2b6f9e',.12,.05],['#f58a4b',.12,.14],['#79b85a',.02,.12]].forEach(([c,a,b])=>{const o=on(a as number,b as number,.04);const m=cylinder(.042,.075,c as string,o.x,o.y,o.z);m.castShadow=false;const lid=on(a as number,b as number,.08);cylinder(.03,.01,'#fbf8f0',lid.x,lid.y,lid.z).castShadow=false;});
  // A jar of brushes (wooden handles, coloured tips) and a jar of water.
  {const o=on(-.13,.22,.065);cylinder(.05,.13,GLASS,o.x,o.y,o.z).castShadow=false;
   [['#f58a4b',-.022,.01],['#3fbfb4',.018,-.012],['#24343a',.004,.022]].forEach(([c,da,db],i)=>{const tilt=(i-1)*.18;
    const b0=on(-.13+(da as number),.22+(db as number),.04),b1=on(-.13+(da as number)+Math.sin(tilt)*.05,.22+(db as number)+Math.cos(tilt)*.02,.3);
    beam(new T.Vector3(b0.x,b0.y,b0.z),new T.Vector3(b1.x,b1.y,b1.z),.016,WOOD_DARK).castShadow=false;
    const tip=put(new T.ConeGeometry(.014,.05,6),c as string,b1.x,b1.y+.02,b1.z);tip.castShadow=false;});}
  {const o=on(.12,-.2,.05);cylinder(.055,.1,'#cfeef3',o.x,o.y,o.z).castShadow=false;const w=on(.12,-.2,.085);cylinder(.048,.012,'#7fb6c9',w.x,w.y,w.z).castShadow=false;}
  obstacles.push({x:p.x,z:p.z,w:.7,d:.7});}

 obstacles.push({x:s.x+s.fx*.5,z:s.z+s.fz*.5,w:1.2,d:1.0});// the easel's three feet
 return {x:s.x,z:s.z,yaw:s.yaw};
}
