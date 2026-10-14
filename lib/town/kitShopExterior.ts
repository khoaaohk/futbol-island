import * as T from 'three';
import {KIT_SHOP,KIT_SHOP_FRONT,SHOP_CANOPY,SHOP_DOOR,SHOP_FIN,SHOP_ROOF_SIGN} from '../shop/shopDoors';
import type {Obstacle} from './simulation';

/**
 * The Kit Shop's exterior on the island (Oct 12 2026; users: "turn the community hall building into a futbol shop … make that more
 * noticeable", "combine community hall and club grounds building", "make the shop more modern looking", "add a path to get to the
 * building", "the building should have a sign on top"). A modern sports flagship in the island's low-poly language: one crisp white
 * volume across both old lots (37 × 13 m, 8 m, flat roof with a slim overhanging slab and a dark reveal), a floor-to-ceiling
 * shopfront of two deep display windows either side of a central glass double door under a cantilevered canopy, one accent fin in
 * the shop's orange, a slim navy rooftop sign (KIT SHOP) on steel legs, a giant ball on the roof, a giant boot on a plinth, and a
 * light paved forecourt from the street's sidewalk to the door with tidy planters.
 *
 * Gameplay kept: the merged footprint covers both old buildings exactly (x 151.5–188.5, z −183.5…−170.5), so the Club Grounds
 * "high spacing target" (x 159, y 7.1 on the south face, ball spot 159 / −167.2) stays on a plain stretch of facade with a clear
 * paved approach, and the east roof edge over the Community Hall grass hatch (191, −177) is unchanged (the fin stands in front of
 * the facade, not on that edge). Roof height 8.23 (the old Club Grounds roof): rooftop travel lands on one big roof.
 *
 * Performance: every solid piece is a plain palette colour, so world.ts's batching pass folds it into the shared vertex-colour paint
 * of its 50 m chunk (x 150–200, z −200…−150: no new draw call). Display glass uses the shared window colour (night glow batch). All
 * lettering is ONE 1024×256 canvas on two planes sharing one material (one draw, replacing the two old house signs). No lights, no
 * per-frame work, no animation.
 */
export type KitShopExteriorKit={
 box:(w:number,h:number,d:number,color:string,x:number,y:number,z:number)=>T.Mesh;
 put:(g:T.BufferGeometry,color:string,x:number,y:number,z:number,parent?:T.Group)=>T.Mesh;
 town:T.Group;
 obstacles:Obstacle[];
 rails:(Obstacle&{floor:number;top:number})[];
 buildings:{x:number;z:number;w:number;d:number;height:number;name:string}[];
 surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[];
 textures:T.Texture[];
 materials:T.Material[];
 /** Night-lit signs (world.ts raises their emissive at dusk and night). */
 nightSigns:T.MeshStandardMaterial[];
};

/** Flagship palette: crisp white, graphite frames, the shop's orange accent and navy signage. */
export const KIT_SHOP_COLORS={
 wall:'#f4f2ed',roof:'#fbfaf6',plinth:'#30353a',frame:'#22272b',steel:'#c9ccce',glass:'#3e5f73',
 accent:'#ef5a2f',navy:'#1f2a44',gold:'#f2c230',paving:'#e6e2d8',joint:'#d4cfc4',planter:'#d9d4c9',green:'#739568',
 display:'#efe9dc',white:'#fbfbf8',ink:'#1d1d1b',
} as const;

/** Display jerseys: original island designs only (no real clubs). [base, trim, pattern]. */
const JERSEYS:[string,string,'stripes'|'hoops'|'sash'|'halves'|'plain'|'chevron'][]=[
 ['#ef5a2f','#fbfbf8','stripes'],['#2a5bd7','#f2c230','hoops'],['#fbfbf8','#1f8a5b','sash'],
 ['#1f2a44','#ef5a2f','halves'],['#f2c230','#1f2a44','plain'],['#1f8a5b','#fbfbf8','chevron'],
];
/** Display boots: [upper, sole, accent]. */
const BOOTS:[string,string,string][]=[
 ['#ef5a2f','#1f2a44','#fbfbf8'],['#fbfbf8','#2a5bd7','#ef5a2f'],['#1f2a44','#f2c230','#f2c230'],['#35c46a','#22272b','#fbfbf8'],
 ['#2a5bd7','#fbfbf8','#f2c230'],['#f2c230','#22272b','#ef5a2f'],['#22272b','#ef5a2f','#ef5a2f'],['#e4322b','#fbfbf8','#22272b'],
];

const JERSEY_OUTLINE:[number,number][]=[[-.22,.85],[-.5,.8],[-.8,.55],[-.63,.3],[-.47,.43],[-.46,-.85],[.46,-.85],[.47,.43],[.63,.3],[.8,.55],[.5,.8],[.22,.85],[0,.66]];
const BOOT_OUTLINE:[number,number][]=[[-.5,0],[.47,0],[.53,.07],[.42,.19],[.06,.29],[-.17,.47],[-.44,.5],[-.53,.3]];
const shapeOf=(pts:[number,number][])=>{const s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;};

export function buildKitShopExterior(k:KitShopExteriorKit){
 const C=KIT_SHOP_COLORS,{x,z,w,d,h}=KIT_SHOP,F=KIT_SHOP_FRONT,GROUND=5.2,RECESS=1.4;
 const west=x-w/2,east=x+w/2;
 // ---- Shell: dark plinth, a recessed glazed ground floor under a solid upper volume, floating roof slab (top at h + .23).
 k.box(w+.2,.35,d+.2,C.plinth,x,.175,z);
 k.box(w,h-GROUND,d,C.wall,x,GROUND+(h-GROUND)/2,z);
 k.box(w,GROUND,d-RECESS,C.wall,x,GROUND/2,z-RECESS/2);
 k.box(w+.8,.28,d+.8,C.roof,x,h+.09,z);
 k.box(w+.04,.14,d+.04,C.frame,x,h-.1,z);   // dark reveal under the slab: the roof reads as floating
 k.obstacles.push({x,z,w,d});
 k.buildings.push({x,z,w,d,height:h+.23,name:KIT_SHOP.name});
 // Shopfront piers: the two ends and the entrance bay come forward to the glass line; the display windows sit between them.
 const bay=6.8,pier=1,niches=[{x0:west+pier,x1:x-bay/2},{x0:x+bay/2,x1:east-pier}];
 for(const [px,pw] of [[west+pier/2,pier],[x,bay],[east-pier/2,pier]] as const)k.box(pw,GROUND,RECESS,C.wall,px,GROUND/2,F-RECESS/2);
 // Slim canopy line along the whole shopfront (the upper volume's lip) and the deep entrance canopy with its orange LED edge.
 k.box(w+.3,.14,.7,C.roof,x,GROUND+.05,F+.35);
 const cw=SHOP_CANOPY.x1-SHOP_CANOPY.x0,ccx=(SHOP_CANOPY.x0+SHOP_CANOPY.x1)/2;
 k.box(cw,SHOP_CANOPY.t,SHOP_CANOPY.depth,C.roof,ccx,SHOP_CANOPY.y,F+SHOP_CANOPY.depth/2);
 k.box(cw,.07,.07,C.frame,ccx,SHOP_CANOPY.y-SHOP_CANOPY.t/2-.02,F+SHOP_CANOPY.depth-.04);
 k.box(cw-.4,.05,.09,C.accent,ccx,SHOP_CANOPY.y-SHOP_CANOPY.t/2-.04,F+SHOP_CANOPY.depth-.2);

 // ---- Central double door: graphite portal, glass leaves and sidelights (the shared window glass: warm glow at night).
 const door=SHOP_DOOR.x;
 k.box(4.6,.3,.3,C.frame,door,3.55,F+.12);
 for(const s of [-1,1])k.box(.22,3.7,.3,C.frame,door+s*2.2,1.85,F+.12);
 k.box(4.2,3.35,.06,C.glass,door,1.95,F+.04);
 for(const dx of [-.85,0,.85])k.box(dx?.05:.07,3.35,.1,C.frame,door+dx,1.95,F+.08);
 for(const dx of [-.22,.22])k.box(.05,1,.06,C.steel,door+dx,1.6,F+.14);   // pull bars
 k.box(5,.25,1.4,C.plinth,door,-.1,F+.7);                                   // dark threshold mat (joins the paint batch)
 // Fin-free side panels of the entrance bay: two slim orange LED uprights frame the door like a stadium tunnel.
 for(const s of [-1,1])k.box(.1,3.6,.08,C.accent,door+s*2.75,1.9,F+.05);

 // ---- Display windows: deep niches with a glowing back wall (shared window glass), a pale display floor and thin graphite
 // frames on the glass line. West: jerseys on a rail over three balls. East: boots on two floating shelves and a ball plinth.
 for(const n of niches){
  const nw=n.x1-n.x0,cx=(n.x0+n.x1)/2,back=F-RECESS;
  k.box(nw,GROUND-.4,.06,C.glass,cx,.35+(GROUND-.4)/2,back+.04);
  k.box(nw,.42,RECESS-.05,C.display,cx,.56,F-RECESS/2);
  k.box(nw,.1,.1,C.frame,cx,GROUND-.08,F-.05);k.box(nw,.12,.12,C.frame,cx,.8,F-.06);
  for(let i=0;i<=4;i++)k.box(.07,GROUND-.95,.08,C.frame,n.x0+i*nw/4,.82+(GROUND-.95)/2,F-.04);
  k.box(nw-.2,.05,.08,C.accent,cx,GROUND-.2,back+.12);   // LED strip along the top of the back wall
 }
 const [wn,en]=niches,wcx=(wn.x0+wn.x1)/2,ecx=(en.x0+en.x1)/2,dz=F-RECESS*.55;
 k.box(wn.x1-wn.x0-.6,.06,.06,C.steel,wcx,4.25,dz);   // hanging rail
 JERSEYS.forEach((j,i)=>jersey(k,wn.x0+.95+i*(wn.x1-wn.x0-1.9)/(JERSEYS.length-1),3.3,dz,.82,j));
 [[C.white,C.ink],[C.accent,C.navy],[C.gold,C.navy]].forEach(([base,patch],i)=>{const bx=wcx+(i-1)*4.2;k.box(.8,.55,.8,C.white,bx,1.05,dz);ball(k,bx,1.33+.4,dz,.4,base,patch);});
 for(const [shelf,y] of [[0,1.95],[1,3.35]] as const){k.box(11,.08,.75,C.white,ecx-1.2,y,dz-.05);
  for(let i=0;i<4;i++){const b=BOOTS[shelf*4+i];boot(k,ecx-1.2-4.1+i*2.73,y+.05,dz,.9,-.55,b);}}
 k.box(.9,.5,.9,C.white,ecx+5.6,1.02,dz);ball(k,ecx+5.6,1.27+.45,dz,.45,C.white,C.accent);

 // ---- Accent fin at the east corner, rising past the roof (a rail so rooftop walkers can't pass through it).
 k.box(SHOP_FIN.w,SHOP_FIN.h,SHOP_FIN.d,C.accent,SHOP_FIN.x,SHOP_FIN.h/2,F+SHOP_FIN.d/2);
 k.box(SHOP_FIN.w+.02,.5,SHOP_FIN.d+.02,C.white,SHOP_FIN.x,SHOP_FIN.h-1.4,F+SHOP_FIN.d/2);
 k.obstacles.push({x:SHOP_FIN.x,z:F+SHOP_FIN.d/2,w:SHOP_FIN.w,d:SHOP_FIN.d});
 k.rails.push({x:SHOP_FIN.x,z:F+SHOP_FIN.d/2,w:SHOP_FIN.w,d:SHOP_FIN.d,floor:0,top:SHOP_FIN.h});
 // East face: one tall glass slot over the grass (seen from the follow camera), the old hall's side windows' place.
 k.box(.08,3.6,7,C.glass,east+.04,2.6,z-1.5);k.box(.12,.1,7.2,C.frame,east+.06,.78,z-1.5);

 // ---- Rooftop sign: a slim navy board on four steel legs at the front of the roof (lettering below), with its own roof rail.
 const S=SHOP_ROOF_SIGN,roofTop=h+.23;
 for(const lx of [-S.w*.4,-S.w*.13,S.w*.13,S.w*.4])k.box(.16,S.y0-roofTop+.1,.16,C.steel,S.x+lx,roofTop+(S.y0-roofTop)/2,S.z);
 k.box(S.w+.3,S.h+.3,S.d,C.navy,S.x,S.y0+S.h/2,S.z);
 k.box(S.w+.3,.12,S.d+.04,C.accent,S.x,S.y0-.06,S.z);
 k.rails.push({x:S.x,z:S.z,w:S.w+.3,d:.6,floor:roofTop,top:S.y0+S.h+.15});
 // The giant ball on the roof's west end (a roof obstacle by itself: its bounds stand on the roof).
 k.box(2.2,.3,2.2,C.plinth,x-12.6,roofTop+.15,z+1.5);
 ball(k,x-12.6,roofTop+.3+1.45,z+1.5,1.45,C.white,C.ink,2);

 // ---- Lettering: one canvas, two planes (roof board: KIT SHOP / JERSEYS · BOOTS · BALLS; entrance bay: DESIGN YOUR OWN KIT).
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext('2d')!;const sans='"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';
 const spaced=(px:number)=>{(ctx as unknown as {letterSpacing?:string}).letterSpacing=`${px}px`;};
 const boardRows=Math.round(1024*S.h/S.w);   // the board's aspect: rows 0…boardRows
 ctx.fillStyle=C.navy;ctx.fillRect(0,0,1024,boardRows);
 // Ball mark: a white disc with a navy pentagon, left of the wordmark.
 const bx=92,by=boardRows/2,br=boardRows*.36;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=C.navy;ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;ctx.lineTo(bx+Math.cos(a)*br*.42,by+Math.sin(a)*br*.42);}ctx.closePath();ctx.fill();
 ctx.strokeStyle=C.navy;ctx.lineWidth=4;for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(bx+Math.cos(a)*br*.42,by+Math.sin(a)*br*.42);ctx.lineTo(bx+Math.cos(a)*br,by+Math.sin(a)*br);ctx.stroke();}
 ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle='#ffffff';
 spaced(8);ctx.font=`800 ${Math.round(boardRows*.56)}px ${sans}`;ctx.fillText('KIT SHOP',178,boardRows*.66);
 ctx.fillStyle=C.accent;ctx.fillRect(180,boardRows*.76,300,6);
 spaced(5);ctx.font=`700 ${Math.round(boardRows*.17)}px ${sans}`;ctx.fillStyle='#ffd7c9';ctx.textAlign='right';ctx.fillText('JERSEYS · BOOTS · BALLS',1000,boardRows*.9);
 ctx.textAlign='center';ctx.fillStyle=C.navy;spaced(6);ctx.font=`800 52px ${sans}`;ctx.fillText('DESIGN YOUR OWN KIT',512,boardRows+66);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;k.textures.push(texture);
 const ink=new T.MeshStandardMaterial({map:texture,alphaTest:.5,emissiveMap:texture,emissive:'#ffffff',emissiveIntensity:0,roughness:.9});k.materials.push(ink);k.nightSigns.push(ink);
 const letters=(v0:number,v1:number,pw:number,px:number,py:number,pz:number)=>{
  const ph=pw*(v1-v0)*canvas.height/canvas.width,g=new T.PlaneGeometry(pw,ph),uv=g.getAttribute('uv');
  for(let i=0;i<uv.count;i++)uv.setY(i,1-(uv.getY(i)>.5?v0:v1));   // canvas rows v0..v1 (0 = top), flipY texture
  const mesh=new T.Mesh(g,ink);mesh.position.set(px,py,pz);mesh.castShadow=false;mesh.receiveShadow=true;k.town.add(mesh);return mesh;
 };
 letters(0,boardRows/256,S.w,S.x,S.y0+S.h/2,S.z+S.d/2+.02);
 letters((boardRows+20)/256,(boardRows+86)/256,8.6,door,GROUND+1.05,F+.02);

 // ---- Forecourt: light paving from the glass line to the street's sidewalk (z −165), joints, tidy planters, the giant boot.
 const pz0=F,pz1=-165,pcz=(pz0+pz1)/2,pd=pz0-pz1;
 k.surfaceAreas.push({kind:'path',x,z:pcz,w:w+.4,d:Math.abs(pd)});
 // .25 m thick (top 2 cm under the old ground line) so it joins the shared paint batch rather than a flat-tile batch of its own.
 k.box(w+.4,.25,Math.abs(pd),C.paving,x,-.145,pcz);
 for(let i=1;i<12;i++)k.box(.07,.25,Math.abs(pd),C.joint,west+i*w/12,-.14,pcz);
 k.box(w+.4,.25,.07,C.joint,x,-.14,pcz);
 // Planters keep x 156–162 (the Club Grounds target's approach) and the door's 9 m clear.
 for(const px of [153.6,164,176.2]){
  k.box(3,.5,.9,C.planter,px,.25,-166.1);k.box(2.8,.12,.7,C.green,px,.52,-166.1);
  for(const dxx of [-.8,.15,.9])k.put(new T.IcosahedronGeometry(.34,0),C.green,px+dxx,.74,-166.1);
  k.obstacles.push({x:px,z:-166.1,w:3,d:.9});
 }
 k.box(3.6,.6,1.7,C.plinth,182,.3,-167.3);k.box(3.7,.06,1.8,C.accent,182,.62,-167.3);
 boot(k,182,.65,-167.3,3,-.18,[C.accent,C.navy,C.white],true);
 k.obstacles.push({x:182,z:-167.3,w:3.6,d:1.7});
}

/** One display jersey facing +z: an extruded shirt, its pattern in the trim colour, a collar and a small crest. */
function jersey(k:KitShopExteriorKit,x:number,y:number,z:number,s:number,[base,trim,pattern]:[string,string,string]){
 const g=new T.ExtrudeGeometry(shapeOf(JERSEY_OUTLINE),{depth:.07,bevelEnabled:false});g.translate(0,0,-.035);g.scale(s,s,1);
 k.put(g,base,x,y,z);
 const f=z+.045,p=(bw:number,bh:number,ox:number,oy:number,rz=0,c=trim)=>{const m=k.box(bw*s,bh*s,.02,c,x+ox*s,y+oy*s,f);m.rotation.z=rz;return m;};
 if(pattern==='stripes')for(const ox of [-.3,0,.3])p(.13,1.45,ox,-.1);
 else if(pattern==='hoops')for(const oy of [-.6,-.2,.2])p(.9,.16,0,oy);
 else if(pattern==='sash')p(.22,1.55,0,-.08,.62);
 else if(pattern==='halves')p(.45,1.62,.23,-.06);
 else if(pattern==='chevron'){p(.5,.14,-.2,.12,-.5);p(.5,.14,.2,.12,.5);}
 else p(.92,.1,0,-.75);
 for(const sx of [-1,1])p(.24,.07,sx*.7,.42,sx*-.98);   // sleeve cuffs
 p(.46,.07,0,.83);                                      // collar band
 p(.13,.15,-.22,.42,0,'#fbfbf8');                       // crest (left chest)
 k.box(.04*s,.32*s,.04,'#c9ccce',x,y+1.02*s,z);         // hanger hook to the rail
}

/** One boot (side profile extruded to its width) with a sole plate, studs, a side flash and laces. `yaw` turns it on its shelf. */
function boot(k:KitShopExteriorKit,x:number,y:number,z:number,s:number,yaw:number,[upper,sole,accent]:[string,string,string],big=false){
 const group=new T.Group();group.position.set(x,y,z);group.rotation.y=yaw;group.scale.setScalar(s);k.town.add(group);
 const g=new T.ExtrudeGeometry(shapeOf(BOOT_OUTLINE),{depth:.3,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:1,curveSegments:4});g.translate(0,.06,-.15);
 k.put(g,upper,0,0,0,group);
 k.put(new T.BoxGeometry(1.04,.07,.36),sole,0,.035,0,group);
 for(const sx of [-.38,-.22,.14,.3])k.put(new T.BoxGeometry(.06,.06,.06),sole,sx,-.02,big?-.11:0,group);
 if(big)for(const sx of [-.38,-.22,.14,.3])k.put(new T.BoxGeometry(.06,.06,.06),sole,sx,-.02,.11,group);
 const flash=k.put(new T.BoxGeometry(.5,.06,.38),accent,.02,.2,0,group);flash.rotation.z=.32;
 for(const lx of [-.06,.06,.18])k.put(new T.BoxGeometry(.04,.025,.2),'#fbfbf8',lx,.36-lx*.55,0,group);
}

/** A football: a white (or coloured) low-poly sphere with twelve pentagon patches on the icosahedron's vertices. */
function ball(k:KitShopExteriorKit,x:number,y:number,z:number,r:number,base:string,patch:string,detail=1){
 k.put(new T.IcosahedronGeometry(r,detail),base,x,y,z);
 const ico=new T.IcosahedronGeometry(1,0),pos=ico.getAttribute('position'),seen:T.Vector3[]=[],up=new T.Vector3(0,1,0);
 for(let i=0;i<pos.count;i++){const v=new T.Vector3().fromBufferAttribute(pos,i).normalize();if(seen.some(s=>s.distanceTo(v)<.01))continue;seen.push(v);
  const m=k.put(new T.CylinderGeometry(r*.33,r*.33,r*.1,5),patch,x+v.x*r*.96,y+v.y*r*.96,z+v.z*r*.96);m.quaternion.setFromUnitVectors(up,v);}
 ico.dispose();
}
