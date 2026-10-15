import * as T from 'three';
import {MUSEUM_BUILDING,MUSEUM_DOOR,MUSEUM_WING} from '../museum/museumDoors';
import type {Obstacle} from './simulation';

/**
 * The History Museum's exterior on the island (Oct 10 2026, user: "more modern to match the interior"; brief:
 * docs/museum-modern-style.md). A modern art museum in the island's low-poly language: a clean gallery-white volume with a thin
 * floating roof slab and a dark plinth, a deep-set glass entrance under a cantilevered canopy, one bold accent plane in the gallery
 * blue (with a white disc: the ball, abstracted), a long ribbon window, minimal sans lettering and a stone plaza with low planters.
 * The west wing (four history galleries inside since Oct 14 2026) speaks the same language.
 *
 * Kept exactly: both footprints (MUSEUM_BUILDING 30×9×5 at 168,181; MUSEUM_WING), the roof height (5.23: the museum-roof coin
 * lands there), the door anchor (MUSEUM_DOOR 160.2 / 185.7), the building names (lamps, map footprints) and their obstacles.
 *
 * Performance: every solid piece is a plain palette colour, so world.ts's batching pass folds it into the shared vertex-colour
 * paint of its 50 m chunk (no new draw call). Glass uses the window colours (one shared night-glow batch). All the lettering is one
 * 1024×256 canvas drawn once, on two planes that share one material in the same chunk (one draw, replacing the old four signs).
 * No lights, no per-frame work, no animation.
 */
export type MuseumExteriorKit={
 box:(w:number,h:number,d:number,color:string,x:number,y:number,z:number)=>T.Mesh;
 put:(g:T.BufferGeometry,color:string,x:number,y:number,z:number)=>T.Mesh;
 town:T.Group;
 obstacles:Obstacle[];
 rails:(Obstacle&{floor:number;top:number})[];
 buildings:{x:number;z:number;w:number;d:number;height:number;name:string}[];
 surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[];
 textures:T.Texture[];
 materials:T.Material[];
};

/** Gallery palette (docs/museum-modern-style.md), tuned for the island's sunlight. */
export const MUSEUM_EXTERIOR_COLORS={
 wall:'#f2efe8',roof:'#faf8f3',plinth:'#3b3f42',frame:'#2b2f33',steel:'#c9ccce',
 glass:'#3e5f73',accent:'#2a5bd7',disc:'#f6f4ef',paving:'#e3dfd6',joint:'#d2cdc2',planter:'#cfc9be',green:'#739568',
} as const;
/** The accent plane and the canopy, for the hover outline (lib/graphics/buildingGlow.ts) and the tap bounds. */
export const MUSEUM_ACCENT={x:178.6,w:5.6,h:7.2,d:.4} as const;
export const MUSEUM_CANOPY={x0:155.5,x1:166,depth:3,y:4.25,t:.25} as const;

export function buildMuseumExterior(k:MuseumExteriorKit){
 const C=MUSEUM_EXTERIOR_COLORS,{x,z,w,d,h}=MUSEUM_BUILDING,front=z+d/2;
 // ---- Shared shell: plinth, white volume, floating roof slab (top at h + .23, the old roof height).
 const shell=(cx:number,cz:number,sw:number,sd:number)=>{
  k.box(sw+.2,.35,sd+.2,C.plinth,cx,.175,cz);
  k.box(sw,h,sd,C.wall,cx,h/2,cz);
  k.box(sw+.6,.28,sd+.6,C.roof,cx,h+.09,cz);
  k.box(sw+.04,.14,sd+.04,C.frame,cx,h-.1,cz);   // dark reveal under the slab: the roof reads as floating
 };
 shell(x,z,w,d);
 k.obstacles.push({x,z,w,d});
 k.buildings.push({x,z,w,d,height:h+.23,name:'HISTORY MUSEUM'});

 // ---- Deep-set glass entrance at the door anchor: a dark portal frame standing 0.6 m proud, glass set back inside it.
 const door=MUSEUM_DOOR.x,pw=5.2,ph=4,pd=.6;
 k.box(pw,.4,pd,C.frame,door,ph-.2,front+pd/2);
 for(const side of [-1,1]){k.box(.4,ph,pd,C.frame,door+side*(pw/2-.2),ph/2,front+pd/2);k.obstacles.push({x:door+side*(pw/2-.2),z:front+pd/2,w:.4,d:pd});}
 k.box(pw-.8,3.6,.08,C.glass,door,1.8,front+.06);
 for(const dx of [-1.1,1.1])k.box(.06,3.6,.1,C.frame,door+dx,1.8,front+.1);   // mullions either side of the doors
 k.box(2.14,.06,.1,C.frame,door,2.4,front+.1);                                // door head
 for(const dx of [-.22,.22])k.box(.05,.9,.06,C.steel,door+dx,1.15,front+.16);  // pull bars
 // Dark threshold mat: a thin slab flush on the plaza paving (paving top is y −.02; see the plaza build below), not plunged
 // through it — the old .25 m-thick box sank .205 m into the paving/joint boxes, the box-in-box overlap behind the reported
 // z-fighting at the door base. Same visible top (y .025) and footprint; bottom now sits exactly on the paving, no gap or overlap.
 k.box(pw,.045,1.4,C.plinth,door,.0025,front+.7);
 // ---- Cantilevered canopy (no posts): a thin white slab with a dark soffit edge.
 const cw=MUSEUM_CANOPY.x1-MUSEUM_CANOPY.x0,cx=(MUSEUM_CANOPY.x0+MUSEUM_CANOPY.x1)/2;
 k.box(cw,MUSEUM_CANOPY.t,MUSEUM_CANOPY.depth,C.roof,cx,MUSEUM_CANOPY.y,front+MUSEUM_CANOPY.depth/2);
 k.box(cw,.07,.07,C.frame,cx,MUSEUM_CANOPY.y-MUSEUM_CANOPY.t/2-.02,front+MUSEUM_CANOPY.depth-.04);

 // ---- One bold accent plane in the gallery blue, rising past the roof, with the ball as a white disc.
 const A=MUSEUM_ACCENT;
 k.box(A.w,A.h,A.d,C.accent,A.x,A.h/2,front+A.d/2);
 const disc=k.put(new T.CylinderGeometry(1.25,1.25,.06,28),C.disc,A.x,A.h-1.9,front+A.d+.03);disc.rotation.x=Math.PI/2;
 k.obstacles.push({x:A.x,z:front+A.d/2,w:A.w,d:A.d});
 k.rails.push({x:A.x,z:front+A.d/2,w:A.w,d:A.d,floor:0,top:A.h});

 // ---- Ribbon windows: one long low strip on the front, one on the east end (seen from the follow camera).
 k.box(9.6,1.5,.08,C.glass,170.9,1.75,front+.04);
 k.box(9.8,.08,.2,C.frame,170.9,.98,front+.08);
 k.box(.08,1.3,6,C.glass,x+w/2+.04,2.6,z);

 // ---- The west wing: the same shell, a tall glass slot on its south end and a ribbon on its east face over the plaza.
 const W=MUSEUM_WING;
 shell(W.x,W.z,W.w,W.d);
 k.obstacles.push({x:W.x,z:W.z,w:W.w,d:W.d});
 k.buildings.push({x:W.x,z:W.z,w:W.w,d:W.d,height:W.h+.23,name:'HISTORY MUSEUM WEST WING'});
 k.box(2.2,4.1,.08,C.glass,W.x+3.2,2.4,W.z+W.d/2+.04);
 k.box(.08,1.5,9,C.glass,W.x+W.w/2+.04,1.75,192.5);
 k.box(.2,.08,9.2,C.frame,W.x+W.w/2+.08,.98,192.5);

 // ---- Lettering: one canvas, two planes (front: HISTORY MUSEUM / THE STORY OF FOOTBALL; wing east face: YOUR COLLECTION).
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext('2d')!;const sans='"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';
 const spaced=(px:number)=>{(ctx as unknown as {letterSpacing?:string}).letterSpacing=`${px}px`;};
 ctx.fillStyle='#1d1d1b';ctx.textBaseline='alphabetic';ctx.textAlign='left';
 spaced(4);ctx.font=`700 92px ${sans}`;ctx.fillText('HISTORY MUSEUM',8,98);
 spaced(6);ctx.font=`500 34px ${sans}`;ctx.fillStyle='#4b4a46';ctx.fillText('THE STORY OF FOOTBALL',12,146);
 spaced(5);ctx.fillStyle='#1d1d1b';ctx.font=`700 62px ${sans}`;ctx.fillText('YOUR COLLECTION',8,236);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;k.textures.push(texture);
 const ink=new T.MeshStandardMaterial({map:texture,alphaTest:.5,roughness:.9});k.materials.push(ink);
 const letters=(v0:number,v1:number,pw:number,px:number,py:number,pz:number,rotation=0)=>{
  const ph=pw*(v1-v0)*canvas.height/canvas.width,g=new T.PlaneGeometry(pw,ph),uv=g.getAttribute('uv');
  for(let i=0;i<uv.count;i++)uv.setY(i,1-(uv.getY(i)>.5?v0:v1));   // canvas rows v0..v1 (0 = top), flipY texture
  const mesh=new T.Mesh(g,ink);mesh.position.set(px,py,pz);mesh.rotation.y=rotation;mesh.castShadow=false;mesh.receiveShadow=true;k.town.add(mesh);return mesh;
 };
 letters(0,160/256,9.2,171.1,3.75,front+.03);
 letters(176/256,1,6.4,W.x+W.w/2+.03,3.4,192.5,Math.PI/2);

 // ---- Plaza: one stone field across the museum front (raised a hair over the old forecourt), joints, low planters.
 const px0=153.5,px1=182.5,pz0=front+.1,pz1=203.5,pcx=(px0+px1)/2,pcz=(pz0+pz1)/2;
 k.surfaceAreas.push({kind:'path',x:pcx,z:pcz,w:px1-px0,d:pz1-pz0});
 // .25 m thick (top 2 cm under the old ground line) so it joins the shared paint batch rather than a flat-tile batch of its own.
 k.box(px1-px0,.25,pz1-pz0,C.paving,pcx,-.145,pcz);
 for(let i=1;i<6;i++)k.box(.08,.25,pz1-pz0,C.joint,px0+i*(px1-px0)/6,-.14,pcz);
 for(const jz of [192,198])k.box(px1-px0,.25,.08,C.joint,pcx,-.14,jz);
 for(const [bx,bz] of [[156,191.2],[157,199.6],[180.2,195],[179.2,200.6]]){
  k.box(3.2,.5,1,C.planter,bx,.25,bz);k.box(3,.12,.8,C.green,bx,.52,bz);
  for(const dx of [-.8,.7])k.put(new T.IcosahedronGeometry(.36,0),C.green,bx+dx,.72,bz);
  k.obstacles.push({x:bx,z:bz,w:3.2,d:1});
 }
}
