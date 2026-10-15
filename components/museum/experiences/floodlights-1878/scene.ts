import * as k from '../anatomy/iso-kit';
import {APART_TOWER,CABLE_OUT,H,LIFT,PARTS,PL,PLAYERS,PW,REACH,TOWER_AT,lightAt,onWhenApart,power,probeDial,shadowsAt,volts,type PartId} from './model';

/**
 * floodlights-1878 · THE NIGHT RIG, drawn with the anatomy kit in the Paper theme (Oct 14 2026 redo). Pure: no DOM, so the test
 * renders it in Node. One SVG string per frame for a camera and a rig state (the stadiums exhibit's pattern: the page writes it
 * straight into the card, no React per frame).
 *
 * The object: a model football ground on a heavy bench, at night. A turf pitch with its markings on a stepped base, a terrace
 * bank along the far side, four timber lattice towers at the corners (footing, mast with cross braces and a ladder, a railed
 * platform, an arc lamp in a housing with a reflector dish that swivels), a knurled knob with a 15° dial at each tower's foot,
 * and table-football players with one shadow per lamp. Over the pitch a gantry rides two rails: its carriage carries a light
 * meter (the lux probe) on a rod down to the grass. On the bench in front: the dynamo (bedplate, two wound field coils, a yoke,
 * a flywheel with a crank handle), a motor lever, a voltmeter with a needle, a junction box and the cables to every tower.
 *
 * Painter's order: fixed bands (bench, ground, pitch, the light map, shadows, beams) then everything that stands up, sorted by
 * true depth (kit depthOf); long parts (rails, the gantry beam) are cut into short pieces so each piece sorts on its own.
 */
export type View={yaw:number[];omega:number;wheel:number;motor:boolean;gx:number;gy:number;apart:number;lightHref?:string;lite?:boolean;focus?:PartId|null;
 /** the task the page wants to point at: a soft accent ring on that control */cue?:'crank'|'knob'|'probe'|null};
export type Anchors={crank:k.Flat;crankR:number;handle:k.Flat;lever:k.Flat;knobs:k.Flat[];probe:k.Flat;pitch:k.Flat[];parts:Partial<Record<PartId,k.Flat>>;scale:number};

// ── The world (model units, z up; the ground's top is z = 0, the bench top z = −8) ──────────────────────────────────────
export const BENCH:k.Plan={x:-116,y:-90,w:232,d:222,r:10};
export const GROUND:k.Plan={x:-104,y:-78,w:208,d:156,r:6};
export const TURF_Z=2,BENCH_Z=-8;
export const RAIL_Y=70,BEAM_Z=27,PROBE_Z=TURF_Z+3;
export const GX_RANGE:[number,number]=[-PL/2+4,PL/2-4],GY_RANGE:[number,number]=[-PW/2+4,PW/2-4];
export const WHEEL={x:-34,y:116,z:9,r:14};
export const LEVER={x:-4,y:110,z:-4,len:20};
export const METER={x:14,y:96,w:42,d:16,h:32};
export const JBOX={x:76,y:92,w:22,d:16,h:12};
export const KNOB_R=4.2;

/** World points the camera is fitted to (`apart` raises the top, so the view widens as the tower comes apart). */
export type Layout='wide'|'tall';
/** The tall (phone) layout: the ground on its own bench, the station on a second bench in front of it, turned a quarter turn. */
export const STADIUM_BENCH:k.Plan={x:-116,y:-90,w:232,d:180,r:10},STATION_BENCH:k.Plan={x:-106,y:84,w:214,d:50,r:8};
export const STATION_AT:[number,number]=[38,0];
/** The station's own camera: in the tall layout it is the same camera turned 90° and moved, so the station stands, turned, in front. */
export function stationProj(P:k.Projection,layout:Layout):k.Projection{
 if(layout==='wide')return P;return {...P,azimuth:(P.azimuth??45)+90,origin:k.iso([STATION_AT[0],STATION_AT[1],0],P)};
}
/** A station-local point in world coordinates (tall: turned −90° and moved). */
export const stationToWorld=(x:number,y:number,layout:Layout):[number,number]=>layout==='wide'?[x,y]:[y+STATION_AT[0],-x+STATION_AT[1]];
export function fitPoints(apart:number,layout:Layout='wide'):k.Point3[]{
 const pts:k.Point3[]=[];const plans=layout==='wide'?[BENCH]:[STADIUM_BENCH];
 for(const B of plans)pts.push([B.x,B.y,-24],[B.x+B.w,B.y,-24],[B.x,B.y+B.d,-24],[B.x+B.w,B.y+B.d,-24]);
 if(layout==='tall'){const B=STATION_BENCH;for(const [x,y] of [[B.x,B.y],[B.x+B.w,B.y],[B.x,B.y+B.d],[B.x+B.w,B.y+B.d]]){const [wx,wy]=stationToWorld(x,y,layout);pts.push([wx,wy,-24],[wx,wy,30]);}}
 for(const [x,y] of TOWER_AT)pts.push([x,y,H+8]);
 const [ax,ay]=TOWER_AT[APART_TOWER];pts.push([ax,ay,H+8+LIFT.reflector*apart]);
 return pts;
}
export const AZ={wide:50,tall:22},EL={wide:30,tall:52};
/** What the camera frames when the tower is apart: the tower, its parts lifted, and a little of the pitch round it. */
export function towerFitPoints():k.Point3[]{const [x,y]=TOWER_AT[APART_TOWER];
 return [[x-26,y-26,-6],[x+26,y-26,-6],[x-26,y+26,-6],[x+26,y+26,-6],[x,y,H+8+LIFT.lamp+16],[x+CABLE_OUT+4,y,0]];}

// ── Small string painters ──────────────────────────────────────────────────────────────────────────────────────────────
const f1=(v:number)=>(Math.round(v*10)/10).toString();
const S=(paths:k.SolidPaths,o:k.SolidStyle={})=>k.solidSvg(paths,o);
const L=(d:string,tone:k.LineTone='lo',free=false)=>k.lineSvg(d,{tone,free});
const hexRgb=(h:string)=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
export const mix=(a:string,b:string,t:number)=>{const A=hexRgb(a),B=hexRgb(b);return '#'+A.map((v,i)=>Math.round(Math.max(0,Math.min(255,v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('');};
/** A solid in a real colour (turf, timber, brass, the lamp light): side tones darker by facing, the top a touch lighter. */
function tint(paths:k.SolidPaths,color:string,edge:k.LineTone='hi',inner=''){
 let o=`<g class="iso-solid"><path d="${paths.fill}" fill="${mix(color,'#000000',.12)}"/>`;
 paths.shades.forEach((d,i)=>{if(d)o+=`<path d="${d}" fill="${mix(color,'#000000',[.3,.22,.14,.07][i])}"/>`;});
 o+=`<path d="${paths.top}" fill="${mix(color,'#ffffff',.06)}"/>`;
 if(paths.crease)o+=`<path class="iso-line" data-tone="faint" style="stroke:${mix(color,'#ffffff',.3)}" d="${paths.crease}"/>`;
 return o+inner+`<path class="iso-line iso-edge" data-tone="${edge}" d="${paths.outline}"/></g>`;
}
const TIMBER='#c9b48f',BRASS='#cfae62',IRON='#7d7f84',TURF='#6f9a62',CABLE='#2d2d2f',LAMP='#ffd24a';
/** A rotated box's floor ring (centre, size, yaw in radians). */
const boxRing=(cx:number,cy:number,w:number,d:number,a:number):k.Plane[]=>{const c=Math.cos(a),s=Math.sin(a);
 return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[cx+u*c-v*s,cy+u*s+v*c] as k.Plane);};
/** A shaded ball (orthographic sphere = circle). */
function ball(c:k.Flat,r:number,look:'paper'|'dark'|'brass'='paper'){
 const f=look==='dark'?'#5a5a5c':look==='brass'?BRASS:'#f7f7f3',s0=look==='dark'?'#38383a':look==='brass'?mix(BRASS,'#000000',.3):'#d3d3ce',hi=look==='dark'?'#7a7a7c':'#ffffff';
 return `<g><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}" fill="${s0}"/><circle cx="${f1(c[0]-r*.14)}" cy="${f1(c[1]-r*.14)}" r="${f1(r*.84)}" fill="${f}"/>`+
  `<circle cx="${f1(c[0]-r*.34)}" cy="${f1(c[1]-r*.36)}" r="${f1(r*.34)}" fill="${hi}" opacity=".8"/><circle class="iso-line" data-tone="hi" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}" fill="none"/></g>`;
}
/** A circle standing in a vertical plane (normal n, horizontal unit) as projected points. */
function vCircle(c:k.Point3,n:[number,number],r:number,P:k.Projection,steps=28):k.Flat[]{
 const px=-n[1],py=n[0];return Array.from({length:steps},(_,i)=>{const t=i/steps*Math.PI*2;return k.iso([c[0]+px*r*Math.cos(t),c[1]+py*r*Math.cos(t),c[2]+r*Math.sin(t)],P);});
}
const poly=(pts:k.Flat[])=>k.pathOf(pts,true);
/** A round cable (dark core, lighter sheen) along screen points. */
const cable=(pts:k.Flat[],w=2.2)=>{const d=k.pathOf(pts);return `<path d="${d}" fill="none" stroke="${CABLE}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#6b6b6e" stroke-width="${f1(w*.32)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-.3 -.4)"/>`;};
const dot=(c:k.Flat,r=.9,o=.6)=>`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r}" fill="var(--anatomy-dot)" opacity="${o}"/>`;
const screw=(x:number,y:number,z:number,P:k.Projection,r=1.4)=>L(k.ring(x,y,r,z,P,14),'lo')+dot(k.iso([x,y,z],P),.8,.55);

type Item={k:number;svg:string};

// ── Static bands ───────────────────────────────────────────────────────────────────────────────────────────────────────
function bench(P:k.Projection,B:k.Plan){
 const z0=BENCH_Z-10;let o=`<path class="iso-halo" d="${k.slabOf(B,z0-8,18,P).fill}"/>`;
 const feet=k.corners(B,18).sort((a,b)=>k.depthOf([a[0],a[1],0],P)-k.depthOf([b[0],b[1],0],P));
 for(const [x,y] of feet)o+=S(k.cylinder(x,y,8,z0-8,2,P,28,.4),{tone:'lo'})+S(k.cylinder(x,y,6,z0-6,6,P,28),{tone:'mid'});
 o+=S(k.slabOf(B,z0,10,P,8,1.6),{tone:'mid',inner:L(k.sideSeam(B,z0+4,P,8),'faint')});
 o+=L(k.planOutline(k.insetPlan(B,5),BENCH_Z,P,8),'lo');
 for(const [x,y] of k.corners(B,10))o+=screw(x,y,BENCH_Z,P,2);
 return o;
}
/** The label plate on the station, engraved. */
function labelPlate(P:k.Projection){
 let o='';
 const lp={x:34,y:116.5,w:58,d:12,r:1.5};
 o+=S(k.slabOf(lp,BENCH_Z,.8,P,4),{tone:'mid'})+L(k.planOutline(k.insetPlan(lp,1.5),BENCH_Z+.8,P,4),'faint');
 o+=k.faceTextSvg(k.topMatrix([lp.x+5,lp.y+5.4],BENCH_Z+.8,P),'BRAMALL LANE',{size:4.2,tone:'hi'});
 o+=k.faceTextSvg(k.topMatrix([lp.x+5,lp.y+10.4],BENCH_Z+.8,P),'14 OCT 1878 · MODEL',{size:2.8,tone:'mid'});
 o+=dot(k.iso([lp.x+2.4,lp.y+lp.d/2,BENCH_Z+.8],P))+dot(k.iso([lp.x+lp.w-2.4,lp.y+lp.d/2,BENCH_Z+.8],P));
 return o;
}
function ground(P:k.Projection){
 const G=GROUND;let o=S(k.slabOf(G,BENCH_Z,-BENCH_Z,P,6,1.2),{tone:'mid',inner:L(k.sideSeam(G,BENCH_Z+3,P,6),'faint')});
 o+=L(k.planOutline(k.insetPlan(G,4),0,P,6),'faint');
 // the rails the gantry rides on, with end stops (drawn flat: they sit low)
 return o;
}
/** The terrace bank along the far long side and the far end: stepped, with crush barriers. */
function terraces(P:k.Projection):Item[]{
 const out:Item[]=[];
 for(let r=0;r<4;r++){const p={x:-70+r*0,y:-76+r*0,w:140,d:12-r*3,r:1};
  out.push({k:k.depthOf([0,-76,0],P)-50+r,svg:S(k.slabOf({x:-70,y:-77,w:140,d:12-r*2.6,r:1},0,2+r*2.4,P,3),{tone:r%2?'mid':'hi',crease:'faint'})});void p;}
 const bars:string[]=[];for(let x=-60;x<=60;x+=20)bars.push(k.segment([x-6,-71.5,7.6],[x+6,-71.5,7.6],P)+k.segment([x-6,-71.5,5],[x-6,-71.5,7.6],P)+k.segment([x+6,-71.5,5],[x+6,-71.5,7.6],P));
 out.push({k:k.depthOf([0,-72,0],P)-44,svg:L(bars.join(''),'mid')});
 return out;
}
function pitch(P:k.Projection,night:number){
 const T={x:-PL/2-5,y:-PW/2-5,w:PL+10,d:PW+10,r:1};
 let o=tint(k.slabOf(T,0,TURF_Z,P,3),mix(TURF,'#1b2030',night*.55),'hi');
 // mown stripes
 const st:string[]=[];for(let i=1;i<10;i++){const x=-PL/2+i*PL/10;st.push(k.lineOnTop([x,-PW/2],[x,PW/2],TURF_Z,P));}
 o+=`<path d="${st.join('')}" fill="none" stroke="${mix(TURF,'#ffffff',.18)}" stroke-width=".5" opacity="${(1-night*.8).toFixed(2)}"/>`;
 return o;
}
function markings(P:k.Projection){
 const z=TURF_Z,l=PL/2,w=PW/2,s=1.4,ln:string[]=[];
 ln.push(k.planOutline({x:-l,y:-w,w:PL,d:PW,r:0},z,P,1),k.lineOnTop([0,-w],[0,w],z,P),k.ring(0,0,9.15*s,z,P,40));
 for(const sx of [-1,1]){const gx=sx*l,bx=gx-sx*16.5*s,sx6=gx-sx*5.5*s;
  ln.push(k.onTop([[gx,-20.16*s],[bx,-20.16*s],[bx,20.16*s],[gx,20.16*s]],z,P),k.onTop([[gx,-9.16*s],[sx6,-9.16*s],[sx6,9.16*s],[gx,9.16*s]],z,P));}
 return `<path class="pitch-lines" d="${ln.join('')}" fill="none" stroke="#f4f3ec" stroke-width=".9" opacity=".85"/>`+
  [[-l+11*s,0],[l-11*s,0],[0,0]].map(([x,y])=>`<circle cx="${f1(k.iso([x,y,z],P)[0])}" cy="${f1(k.iso([x,y,z],P)[1])}" r="1" fill="#f4f3ec" opacity=".85"/>`).join('');
}
/** The goals: two posts and a bar, a net back (white hairlines; they read on the dark turf). */
function goals(P:k.Projection):Item[]{
 const out:Item[]=[],gw=7.32*1.4/2,gh=2.44*1.4*2.2,dm=5;
 for(const sx of [-1,1]){const gx=sx*PL/2,bx=gx+sx*dm,net:string[]=[];
  for(let i=0;i<=4;i++){const y=-gw+i*gw/2;net.push(k.segment([bx,y,TURF_Z],[bx,y,TURF_Z+gh*.8],P),k.segment([bx,y,TURF_Z+gh*.8],[gx,y,TURF_Z+gh],P));}
  for(const y of [-gw,gw])net.push(k.segment([gx,y,TURF_Z+gh],[bx,y,TURF_Z+gh*.8],P),k.segment([bx,y,TURF_Z],[bx,y,TURF_Z+gh*.8],P));
  out.push({k:k.depthOf([bx,0,0],P),svg:`<path d="${net.join('')}" fill="none" stroke="#e9e8e0" stroke-width=".5" opacity=".8"/>`});
  const frame=k.segment([gx,-gw,TURF_Z],[gx,-gw,TURF_Z+gh],P)+k.segment([gx,gw,TURF_Z],[gx,gw,TURF_Z+gh],P)+k.segment([gx,-gw,TURF_Z+gh],[gx,gw,TURF_Z+gh],P);
  out.push({k:k.depthOf([gx,0,0],P)+.5,svg:`<path d="${frame}" fill="none" stroke="#1d1d1b" stroke-width="2.2" stroke-linecap="round"/><path d="${frame}" fill="none" stroke="#fbfbf8" stroke-width="1.3" stroke-linecap="round"/>`});}
 return out;
}

// ── The towers ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function tower(i:number,yawDeg:number,p:number,apart:number,P:k.Projection,focus:PartId|null|undefined,cue:boolean):{items:Item[];anchors:Partial<Record<PartId,k.Flat>>;head:k.Flat}{
 const [tx,ty]=TOWER_AT[i],items:Item[]=[],anchors:Partial<Record<PartId,k.Flat>>={},me=i===APART_TOWER,e=me?apart:0;
 const lift=(id:PartId)=>LIFT[id]*e,kd=(z:number)=>k.depthOf([tx,ty,z],P);
 const dim=(id:PartId)=>me&&focus&&focus!==id&&e>.3?' opacity=".35"':'';
 // footing: a concrete block with four anchor bolts
 const fp={x:tx-8,y:ty-8,w:16,d:16,r:1.2};
 items.push({k:kd(0)-6,svg:`<g${dim('footing')}>${S(k.slabOf(fp,0,3,P,3,.6),{tone:'mid',inner:L(k.sideSeam(fp,1.4,P,3),'faint')})}${[[-6,-6],[6,-6],[-6,6],[6,6]].map(([u,v])=>screw(tx+u,ty+v,3,P,1)).join('')}</g>`});
 if(me)anchors.footing=k.iso([tx+7,ty+7,1.5],P);
 // mast: four corner posts, cross braces on every face, a ladder on the face toward the pitch
 const m0=3+lift('mast'),m1=46+lift('mast'),hw=4.2,posts:[number,number][]=[[-hw,-hw],[hw,-hw],[hw,hw],[-hw,hw]];
 const vx=Math.cos((P.azimuth??45)*Math.PI/180),vy=Math.sin((P.azimuth??45)*Math.PI/180);
 const order=[...posts].sort((a,b)=>(a[0]*vx+a[1]*vy)-(b[0]*vx+b[1]*vy));
 const brace:string[]=[];const levels=6;
 const faces:[[number,number],[number,number]][]=[[posts[0],posts[1]],[posts[1],posts[2]],[posts[2],posts[3]],[posts[3],posts[0]]];
 for(const [a,b] of faces){const nx=(a[0]+b[0])/2,ny=(a[1]+b[1])/2,front=nx*vx+ny*vy>0;
  for(let l=0;l<levels;l++){const z0=m0+(m1-m0)*l/levels,z1=m0+(m1-m0)*(l+1)/levels;
   brace.push(k.segment([tx+a[0],ty+a[1],z0],[tx+b[0],ty+b[1],z1],P),k.segment([tx+b[0],ty+b[1],z0],[tx+a[0],ty+a[1],z1],P),k.segment([tx+a[0],ty+a[1],z1],[tx+b[0],ty+b[1],z1],P));}
  void front;}
 const postSvg=(pp:[number,number][])=>pp.map(([u,v])=>tint(k.slabOf({x:tx+u-.9,y:ty+v-.9,w:1.8,d:1.8,r:.2},m0,m1-m0,P,1),TIMBER,'hi')).join('');
 // ladder up the pitch-facing side
 const lx=tx+(tx<0?hw+1.2:-hw-1.2),ladder:string[]=[];
 for(const dy of [-1.4,1.4])ladder.push(k.segment([lx,ty+dy,m0],[lx,ty+dy,m1],P));
 for(let z=m0+2;z<m1;z+=2.4)ladder.push(k.segment([lx,ty-1.4,z],[lx,ty+1.4,z],P));
 items.push({k:kd(20)-3,svg:`<g${dim('mast')}>${postSvg(order.slice(0,2))}<path d="${brace.join('')}" fill="none" stroke="${mix(TIMBER,'#000000',.45)}" stroke-width=".7"/>${postSvg(order.slice(2))}${L(ladder.join(''),'mid')}</g>`});
 if(me)anchors.mast=k.iso([tx+hw,ty+hw,(m0+m1)/2],P);
 // platform: a deck with a railing
 const pz=46+lift('platform'),pp={x:tx-9,y:ty-9,w:18,d:18,r:.6},rail:string[]=[];
 const pc=k.corners(pp,.6);for(const [x,y] of pc)rail.push(k.segment([x,y,pz+1.2],[x,y,pz+4.4],P));
 rail.push(k.onTop([[pp.x+.6,pp.y+.6],[pp.x+pp.w-.6,pp.y+.6],[pp.x+pp.w-.6,pp.y+pp.d-.6],[pp.x+.6,pp.y+pp.d-.6]],pz+4.4,P,true));
 items.push({k:kd(pz)-2,svg:`<g${dim('platform')}>${tint(k.slabOf(pp,pz,1.2,P,2,.3),TIMBER,'hi',L(k.sideSeam(pp,pz+.6,P,2),'faint'))}${L(rail.join(''),'mid')}</g>`});
 if(me)anchors.platform=k.iso([pp.x+pp.w,pp.y+pp.d,pz+2],P);
 // the arc lamp: a housing that swivels (yaw), a chimney, the carbon rods (seen when the lid is off), a reflector dish
 const az=(P.azimuth??45),ya=me&&e>0?yawDeg+((((az-yawDeg)%360)+540)%360-180)*Math.min(1,e*1.4):yawDeg,a=ya*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),lz=pz+1.2+lift('lamp')-lift('platform');
 const hz=lz,hh=8,ring=boxRing(tx,ty,9.6,8.4,a);
 const glow=Math.min(1,p)*(me?onWhenApart(apart)[i]:1);
 // the swivel: a 15° dial on the deck and a knurled ring the housing turns on, its index line in the accent
 const dial=k.radialTicks(tx,ty,7.4,24,3,hz,[.9,1.7],P,0);
 let swivel=L(dial.minor,'lo')+L(dial.major,'mid')+S(k.cylinder(tx,ty,5.4,hz,1.6,P,32,.3),{tone:'hi',inner:L(k.knurl(tx,ty,5.4,hz+.1,hz+1.5,40,P,.1),'faint')});
 swivel+=`<path d="${k.lineOnTop([tx+dx*2,ty+dy*2],[tx+dx*7.6,ty+dy*7.6],hz+.05,P)}" stroke="var(--acc)" stroke-width="2" fill="none" stroke-linecap="round"/>`;
 if(cue)swivel+=`<path d="${k.ring(tx,ty,9.6,hz,P,40)}" fill="none" stroke="var(--acc)" stroke-width="1.6"/>`;
 // the housing: a body, and a lid with its chimney. Apart, the lid lifts off and shows the two carbon rods and the gap between
 // them where the arc jumps.
 const lidUp=me?e*13:0,bz=hz+1.6,lidZ=bz+hh-1.4+lidUp;
 let lamp=swivel+tint(k.extrude(ring,bz,hh-1.4,P,{bevel:.3}),'#e7e5de','hi',L(k.ringSeam(ring,bz+hh-3,P),'faint'));
 if(me&&e>.15){const rx=tx-dx*.6,ry=ty-dy*.6,gap=bz+hh-1.4+lidUp*.5;
  lamp+=S(k.cylinder(rx,ry,.7,bz+hh-1.4,gap-.9-(bz+hh-1.4),P,12),{tone:'hi'});
  const [ax,ay]=k.iso([rx,ry,gap],P);lamp+=`<circle cx="${f1(ax)}" cy="${f1(ay)}" r="${f1(2.2+glow*2)}" fill="none" stroke="var(--acc)" stroke-width="1.4"/>`+dot([ax,ay],1.1,.9);
  lamp+=S(k.cylinder(rx,ry,.7,gap+.9,lidZ-gap-.9,P,12),{tone:'hi'});
  anchors.lamp=[ax,ay];}
 else if(me)anchors.lamp=k.iso([tx,ty,bz+hh/2],P);
 lamp+=tint(k.extrude(boxRing(tx,ty,10.4,9.2,a),lidZ,1.4,P,{bevel:.3}),'#d9d7cf','hi');
 lamp+=S(k.cylinder(tx-dx*1.2,ty-dy*1.2,1.1,lidZ+1.4,2.4,P,16),{tone:'mid'})+S(k.cylinder(tx-dx*1.2,ty-dy*1.2,1.7,lidZ+3.8,.7,P,16),{tone:'mid'});
 // reflector dish: a disc facing along the aim, tipped down toward the grass
 const rc:k.Point3=[tx+dx*(5.2+(me?e*12:0)),ty+dy*(5.2+(me?e*12:0)),hz+1.6+hh/2];
 const towardV=dx*vx+dy*vy,disc=vCircle(rc,[dx,dy],5.8,P,28),inner=vCircle([rc[0]+dx*.3,rc[1]+dy*.3,rc[2]],[dx,dy],3.6,P,24);
 const lit=towardV>-.1,face=lit?mix('#f4f2ea',LAMP,glow):'#cfcdc6';
 const dish=`<g${dim('reflector')}><path d="${poly(disc)}" fill="${face}" class="iso-line" data-tone="hi" style="fill:${face}"/>${lit?`<path d="${poly(inner)}" fill="${glow>.05?mix('#ffffff',LAMP,.25):'#e9e8e1'}" class="iso-line" data-tone="mid" style="fill:${glow>.05?mix('#ffffff',LAMP,.25):'#e9e8e1'}"/>`:''}</g>`;
 const lampG=`<g${dim('lamp')}>${lamp}</g>`;
 items.push({k:kd(hz)+(lit?0:-1),svg:lit?lampG+dish:dish+lampG});
 if(me){anchors.reflector=k.iso(rc,P);}
 // the lamp's glow (a soft halo; only while there is power)
 if(glow>.03){const [gx,gy]=k.iso(rc,P),r=(6+glow*16)*k.cameraOf(P).k/1.26;
  items.push({k:kd(hz)+.5,svg:`<circle cx="${f1(gx)}" cy="${f1(gy)}" r="${f1(r)}" fill="url(#fl-glow)" opacity="${(Math.min(1,glow)*.95).toFixed(2)}" pointer-events="none"/>`});}
 // the cable up the mast (the apart tower's slides out sideways)
 const co=me?CABLE_OUT*e:0,cx0=tx+(tx<0?-hw-.8:hw+.8)+co,cy0=ty+(ty<0?-hw-.8:hw+.8);
 const cpts=[k.iso([cx0,cy0,0],P),k.iso([cx0,cy0,m0],P),k.iso([cx0,cy0,hz+1],P)];
 items.push({k:kd(10)+3,svg:`<g${dim('cable')}>${cable(cpts,me&&e>.1?2.6:1.6)}${dot(cpts[2],1.2,.9)}${me&&e>.1?dot(cpts[0],1.2,.9):''}</g>`});
 if(me)anchors.cable=k.iso([cx0,cy0,(m0+hz)/2],P);
 return {items,anchors,head:k.iso([tx,ty,hz+1.6+hh/2],P)};
}
// ── Players and their shadows ──────────────────────────────────────────────────────────────────────────────────────────
function player(x:number,y:number,team:0|1,P:k.Projection):Item{
 const cls=team?'dark':undefined,z=TURF_Z;
 let o=`<path class="iso-halo" style="opacity:.3;filter:blur(2px);transform:none" d="${k.cylinder(x,y,2.4,z,.1,P,16).fill}"/>`;
 o+=S(k.cylinder(x,y,2.3,z,.8,P,20,.2),{tone:'hi',className:cls})+S(k.cylinder(x,y,1.3,z+.8,4.8,P,18),{tone:'hi',className:cls});
 o+=S(k.cylinder(x,y,1.7,z+5.2,1,P,18,.2),{tone:'hi',className:cls});
 const c=k.iso([x,y,z+7.6],P);o+=ball(c,1.5*k.cameraOf(P).k,team?'dark':'paper');
 return {k:k.depthOf([x,y,4],P),svg:o};
}
function shadows(r:{yaw:number[];on:number[]},p:number,P:k.Projection){
 let o='';
 for(const [x,y] of PLAYERS)for(const s of shadowsAt(r,p,x,y)){
  const nx=-s.dy,ny=s.dx,L1=Math.min(s.len,40),pts:k.Flat[]=[[x+nx*1.1,y+ny*1.1],[x+s.dx*L1+nx*.5,y+s.dy*L1+ny*.5],[x+s.dx*L1-nx*.5,y+s.dy*L1-ny*.5],[x-nx*1.1,y-ny*1.1]].map(([u,v])=>k.iso([u,v,TURF_Z+.05],P));
  o+=`<path d="${poly(pts)}" fill="#05070c" opacity="${(s.dark*.62).toFixed(2)}"/>`;}
 return o;
}
/** The beams: a faint cone from each lamp to the pool it throws on the grass. */
function beams(yaw:number[],p:number,P:k.Projection,on:number[]){
 if(p<.03)return '';let o='';
 for(let i=0;i<4;i++){if(on[i]<.03)continue;const [tx,ty]=TOWER_AT[i],a=yaw[i]*Math.PI/180,cx=tx+Math.cos(a)*REACH,cy=ty+Math.sin(a)*REACH,r=REACH*.42;
  const pts:k.Flat[]=[k.iso([tx,ty,H],P)];for(let j=0;j<24;j++){const t=j/24*Math.PI*2;pts.push(k.iso([cx+Math.cos(t)*r,cy+Math.sin(t)*r*.8,TURF_Z],P));}
  const hull=hullOf(pts);o+=`<path d="${poly(hull)}" fill="${LAMP}" opacity="${(Math.min(1,p)*on[i]*.13).toFixed(3)}"/>`;}
 return o;
}
function hullOf(points:k.Flat[]):k.Flat[]{const s=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(s.length<3)return s;const cr=(o:k.Flat,a:k.Flat,b:k.Flat)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:k.Flat[]=[];for(const p of s){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
 const up:k.Flat[]=[];for(let i=s.length-1;i>=0;i--){const p=s[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
 return [...lo.slice(0,-1),...up.slice(0,-1)];}

// ── The gantry and its light meter ─────────────────────────────────────────────────────────────────────────────────────
function gantry(gx:number,gy:number,reading:number,P:k.Projection,cue:boolean):Item[]{
 const out:Item[]=[];
 // rails along both long sides, cut into pieces so each sorts on its own
 for(const ry of [-RAIL_Y,RAIL_Y])for(let x=-96;x<96;x+=24){const pl={x,y:ry-1.6,w:24,d:3.2,r:0};
  out.push({k:k.depthOf([x+12,ry,0],P)-8,svg:S(k.slabOf(pl,0,1.8,P,1),{tone:'mid',crease:'faint'})+screw(x+12,ry,1.8,P,.7)});}
 for(const ry of [-RAIL_Y,RAIL_Y])for(const x of [-98,98])out.push({k:k.depthOf([x,ry,0],P)-7,svg:S(k.slabOf({x:x-2,y:ry-2.6,w:4,d:5.2,r:.4},0,4,P,2),{tone:'mid'})});
 // the two legs riding the rails
 for(const ry of [-RAIL_Y,RAIL_Y]){const cp={x:gx-5,y:ry-3.4,w:10,d:6.8,r:.8};
  out.push({k:k.depthOf([gx,ry,10],P),svg:S(k.slabOf(cp,1.8,4,P,3,.4),{tone:'mid'})+screw(gx-3,ry,5.8,P,.6)+screw(gx+3,ry,5.8,P,.6)+
   S(k.slabOf({x:gx-1.6,y:ry-1.6,w:3.2,d:3.2,r:.3},5.8,BEAM_Z-5.8,P,2),{tone:'hi'})});}
 // the beam across, in pieces
 for(let y=-RAIL_Y-2;y<RAIL_Y+2;y+=14.8){const pl={x:gx-2.2,y,w:4.4,d:Math.min(14.8,RAIL_Y+2-y),r:0};
  out.push({k:k.depthOf([gx,y+pl.d/2,BEAM_Z],P)+2,svg:S(k.slabOf(pl,BEAM_Z,3,P,1),{tone:'hi',crease:'faint'})});}
 // the carriage, the meter on top and the probe rod down to the grass
 const cp={x:gx-5,y:gy-5,w:10,d:10,r:1.2},top=BEAM_Z+5.6;
 let o=S(k.cylinder(gx,gy,.8,PROBE_Z+1.2,BEAM_Z-2-PROBE_Z-1.2,P,12),{tone:'hi'});
 o+=S(k.cylinder(gx,gy,2.2,PROBE_Z,1.2,P,20,.2),{tone:'hi',lit:true});
 o+=S(k.slabOf(cp,BEAM_Z-2,7.6,P,4,.5),{tone:'hi',inner:L(k.sideSeam(cp,BEAM_Z+1.5,P,4),'faint')})+[[-3.4,-3.4],[3.4,3.4]].map(([u,v])=>screw(gx+u,gy+v,top,P,.5)).join('');
 // the meter: a face-up dial, ticks, a mark at "enough to play", the needle
 const R=4.2,t=k.radialTicks(gx,gy,R,20,5,top+.1,[.7,1.3],P,-Math.PI*.75,Math.PI*1.5);
 o+=S(k.cylinder(gx,gy,R+.6,top,.5,P,32,.2),{tone:'hi',lit:true})+L(t.minor,'lo')+L(t.major,'mid');
 const mark=-Math.PI*.75+Math.PI*1.5/3;o+=`<path d="${k.lineOnTop([gx+Math.sin(mark)*(R-1.6),gy-Math.cos(mark)*(R-1.6)],[gx+Math.sin(mark)*R,gy-Math.cos(mark)*R],top+.6,P)}" stroke="var(--acc)" stroke-width="1.8" fill="none"/>`;
 const na=-Math.PI*.75+Math.PI*1.5*probeDial(reading);
 o+=`<path data-probe-needle d="${k.lineOnTop([gx-Math.sin(na)*1,gy+Math.cos(na)*1],[gx+Math.sin(na)*(R-.8),gy-Math.cos(na)*(R-.8)],top+.7,P)}" stroke="var(--anatomy-lit)" stroke-width="1.3" fill="none" stroke-linecap="round"/>`+dot(k.iso([gx,gy,top+.7],P),.9,.9);
 if(cue)o+=`<path d="${k.ring(gx,gy,8,TURF_Z+.2,P,40)}" fill="none" stroke="var(--acc)" stroke-width="1.6"/>`;
 out.push({k:k.depthOf([gx,gy,BEAM_Z],P)+3,svg:o});
 return out;
}

// ── The bench machines: dynamo, motor lever, voltmeter, junction box, cables ───────────────────────────────────────────
function dynamo(wheel:number,omega:number,motor:boolean,P:k.Projection,cue:boolean):Item[]{
 const out:Item[]=[],z=BENCH_Z,W=WHEEL,bp={x:-96,y:96,w:72,d:30,r:2};
 out.push({k:k.depthOf([-60,104,z],P)-30,svg:S(k.slabOf(bp,z,4,P,4,.6),{tone:'mid',inner:L(k.sideSeam(bp,z+2,P,4),'faint')})+k.corners(bp,4).map(([x,y])=>screw(x,y,z+4,P,1)).join('')});
 // two wound field coils with caps, and the yoke across their tops
 for(const cx of [-82,-62]){const cy=104,c0=z+4,h=22;let w='';for(let zz=c0+3;zz<c0+h-2.5;zz+=1.1)w+=k.sideArc(cx,cy,6.2,zz,P,18);
  out.push({k:k.depthOf([cx,cy,c0],P)-20,svg:S(k.cylinder(cx,cy,7.4,c0,2,P,32,.4),{tone:'mid'})+tint(k.cylinder(cx,cy,6.2,c0+2,h-4,P,32),'#b0773f','hi',`<path d="${w}" fill="none" stroke="#7d4d22" stroke-width=".55"/>`)+S(k.cylinder(cx,cy,7.4,c0+h-2,2,P,32,.4),{tone:'mid'})});}
 const yk={x:-90,y:99,w:36,d:10,r:1.5};
 out.push({k:k.depthOf([-72,104,z+26],P)-18,svg:S(k.slabOf(yk,z+26,4,P,3,.5),{tone:'hi',inner:L(k.sideSeam(yk,z+28,P,3),'faint')})+screw(-82,104,z+30,P,1)+screw(-62,104,z+30,P,1)});
 // the axle housing (armature) between the coils and the wheel's bearing pedestal
 const ah={x:-72,y:100,w:34,d:8,r:3};
 out.push({k:k.depthOf([-55,104,z+10],P)-16,svg:S(k.slabOf(ah,z+12,7,P,6,.4),{tone:'hi',inner:L(k.sideSeam(ah,z+15.5,P,6),'faint')})});
 const ped={x:W.x-4,y:W.y-10,w:8,d:7,r:1};
 out.push({k:k.depthOf([W.x,W.y-6,z],P)-6,svg:S(k.slabOf(ped,z+4,W.z-z-4,P,3,.4),{tone:'mid'})+S(k.cylinder(W.x,W.y-6.5,3,W.z-2,4,P,24,.3),{tone:'mid'})});
 // brushes (two little blocks on the axle) and the two terminals with their cables
 for(const bx of [-44,-49])out.push({k:k.depthOf([bx,100,z+10],P)-14,svg:S(k.slabOf({x:bx-1.4,y:97,w:2.8,d:3,r:.3},z+19,3.6,P,1),{tone:'mid'})});
 for(const tx of [-50,-42]){out.push({k:k.depthOf([tx,122,z+4],P)-4,svg:S(k.cylinder(tx,122,1.8,z+4,2.6,P,16,.2),{tone:'mid'})+S(k.cylinder(tx,122,1,z+6.6,1.6,P,12),{tone:'hi'})});}
 // the flywheel: a rim, a hub and six spokes; spinning fast, the spokes blur into a disc
 const n:[number,number]=[0,1],rim=vCircle([W.x,W.y,W.z],n,W.r,P,48),rimIn=vCircle([W.x,W.y,W.z],n,W.r-2.4,P,48),hub=vCircle([W.x,W.y+.6,W.z],n,2.6,P,20);
 const rimBack=vCircle([W.x,W.y-2.4,W.z],n,W.r,P,48);
 let wsv=`<path d="${poly(hullOf([...rim,...rimBack]))}" fill="${IRON}" class="iso-line" data-tone="hi" style="fill:${mix(IRON,'#000000',.15)}"/>`;
 wsv+=`<path d="${poly(rim)}" style="fill:${IRON}" class="iso-line" data-tone="hi"/><path d="${poly(rimIn)}" style="fill:#dddcd5" class="iso-line" data-tone="mid"/>`;
 const fast=omega>Math.PI*1.4;
 if(fast)wsv+=`<path d="${poly(rimIn)}" fill="${IRON}" opacity=".38"/><path d="${poly(vCircle([W.x,W.y,W.z],n,(W.r-2.4)*.62,P,40))}" fill="none" stroke="${mix(IRON,'#ffffff',.35)}" stroke-width=".8"/>`;
 else{const sp:string[]=[];for(let s=0;s<6;s++){const t=wheel+s*Math.PI/3;sp.push(k.pathOf([k.iso([W.x+Math.cos(t)*2.4,W.y,W.z+Math.sin(t)*2.4],P),k.iso([W.x+Math.cos(t)*(W.r-2.4),W.y,W.z+Math.sin(t)*(W.r-2.4)],P)]));}
  wsv+=`<path d="${sp.join('')}" stroke="${mix(IRON,'#000000',.2)}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;}
 wsv+=`<path d="${poly(hub)}" style="fill:#efeee8" class="iso-line" data-tone="hi"/>`+dot(k.iso([W.x,W.y+.7,W.z],P),1,.8);
 // the crank handle: an arm from the hub, a pin and a turned wooden grip toward the viewer
 const hr=W.r-4,hx=W.x+Math.cos(wheel)*hr,hz=W.z+Math.sin(wheel)*hr,arm=k.pathOf([k.iso([W.x,W.y+1.2,W.z],P),k.iso([hx,W.y+1.2,hz],P)]);
 wsv+=`<path d="${arm}" stroke="#2d2d2f" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="${arm}" stroke="#8a8a8e" stroke-width="1.4" stroke-linecap="round" fill="none"/>`;
 const g0=k.iso([hx,W.y+1.2,hz],P),g1=k.iso([hx,W.y+7,hz],P),kk=k.cameraOf(P).k/1.26;
 wsv+=`<path d="M${f1(g0[0])} ${f1(g0[1])}L${f1(g1[0])} ${f1(g1[1])}" stroke="#4a3a24" stroke-width="${f1(3.6*kk+1.4)}" stroke-linecap="round"/><path d="M${f1(g0[0])} ${f1(g0[1])}L${f1(g1[0])} ${f1(g1[1])}" stroke="${TIMBER}" stroke-width="${f1(3.6*kk)}" stroke-linecap="round"/>`;
 wsv+=ball(g1,1.9*kk,'paper');
 if(cue)wsv+=`<path d="${poly(vCircle([W.x,W.y+1,W.z],n,W.r+3,P,48))}" fill="none" stroke="var(--acc)" stroke-width="1.8"/>`;
 out.push({k:k.depthOf([W.x,W.y,W.z],P)+2,svg:wsv});
 // the motor and its lever (a box with a pulley, a lever on a notched quadrant: back = off, forward = on)
 const mb={x:LEVER.x-14,y:LEVER.y-12,w:10,d:12,r:1.5};
 out.push({k:k.depthOf([LEVER.x-9,LEVER.y-6,z],P)-2,svg:S(k.slabOf(mb,z,9,P,4,.5),{tone:'mid',inner:L(k.sideSeam(mb,z+3,P,4)+k.sideSeam(mb,z+5,P,4)+k.sideSeam(mb,z+7,P,4),'faint')})+
  S(k.cylinder(LEVER.x-9,LEVER.y-6,2.6,z+9,2.2,P,20,.3),{tone:'hi'})});
 const qp={x:LEVER.x-2.5,y:LEVER.y-8,w:5,d:16,r:1};
 let lv=S(k.slabOf(qp,z,4,P,3,.4),{tone:'mid'});
 const ang=motor?.55:-.55,ex=LEVER.x,ey=LEVER.y+Math.sin(ang)*LEVER.len,ez=LEVER.z+Math.cos(ang)*LEVER.len;
 const l0=k.iso([LEVER.x,LEVER.y,LEVER.z],P),l1=k.iso([ex,ey,ez],P);
 lv+=`<path d="M${f1(l0[0])} ${f1(l0[1])}L${f1(l1[0])} ${f1(l1[1])}" stroke="#2d2d2f" stroke-width="${f1(2.2*kk+1.2)}" stroke-linecap="round"/><path d="M${f1(l0[0])} ${f1(l0[1])}L${f1(l1[0])} ${f1(l1[1])}" stroke="#a7a7ab" stroke-width="${f1(2.2*kk)}" stroke-linecap="round"/>`;
 lv+=ball(l1,2.8*kk,motor?'brass':'dark')+ball(l0,1.6*kk,'paper');
 for(const s of [-1,1]){const nz=LEVER.z+Math.cos(.55)*7,ny=LEVER.y+s*Math.sin(.55)*7;lv+=dot(k.iso([LEVER.x+2.6,ny,nz-1],P),.9,.7);}
 out.push({k:k.depthOf([LEVER.x,LEVER.y,z+10],P)+1,svg:lv});
 // belt from the motor pulley to the flywheel's hub (only on when the motor drives it)
 if(motor){const b0=k.iso([LEVER.x-9,LEVER.y-6,z+10.2],P),b1=k.iso([W.x,W.y-1,W.z+2.4],P),b2=k.iso([W.x,W.y-1,W.z-2.4],P);
  out.push({k:k.depthOf([W.x,W.y-3,W.z],P)+1.5,svg:`<path d="M${f1(b0[0])} ${f1(b0[1])}L${f1(b1[0])} ${f1(b1[1])}M${f1(b0[0])} ${f1(b0[1]+2)}L${f1(b2[0])} ${f1(b2[1])}" stroke="#3a3a3c" stroke-width="1.3" fill="none"/>`});}
 return out;
}
function voltmeter(v:number,P:k.Projection):Item{
 const M=METER,z=BENCH_Z,box={x:M.x,y:M.y,w:M.w,d:M.d,r:2};
 let o=S(k.slabOf({x:M.x-2,y:M.y-2,w:M.w+4,d:M.d+4,r:2.5},z,2,P,4,.4),{tone:'mid'});
 o+=S(k.slabOf(box,z+2,M.h,P,4,.8),{tone:'hi',inner:L(k.sideSeam(box,z+6,P,4),'faint')});
 // the face on the front (+y) side: a cream dial, ticks from 0 to 100 V, the needle
 const fy=M.y+M.d+.05,fm=k.sideMatrix([M.x,fy],z+2+M.h,P,'left'),cx=M.w/2,cy=M.h*.78,R=M.w*.4;
 let face=`<rect x="3" y="3" width="${M.w-6}" height="${M.h-6}" rx="2" fill="#fbfaf3" stroke="var(--anatomy-mid)" stroke-width=".5" vector-effect="non-scaling-stroke"/>`;
 for(let i=0;i<=20;i++){const t=-Math.PI*.8+i/20*Math.PI*.6*1,ang=-Math.PI/2-Math.PI*.33+i/20*Math.PI*.66,big=i%5===0;void t;
  face+=`<line x1="${f1(cx+Math.cos(ang)*(R-(big?3.2:1.8)))}" y1="${f1(cy+Math.sin(ang)*(R-(big?3.2:1.8)))}" x2="${f1(cx+Math.cos(ang)*R)}" y2="${f1(cy+Math.sin(ang)*R)}" stroke="${i>=18?'var(--acc)':'#3a3a3c'}" stroke-width="${big?.9:.5}" vector-effect="non-scaling-stroke"/>`;
  if(i%10===0)face+=`<text x="${f1(cx+Math.cos(ang)*(R-6))}" y="${f1(cy+Math.sin(ang)*(R-6)+1.1)}" font-size="2.9" text-anchor="middle" fill="#3a3a3c" font-family="ui-monospace,Menlo,monospace">${i*5}</text>`;}
 const na=-Math.PI/2-Math.PI*.33+Math.min(1.08,v/100)*Math.PI*.66;
 face+=`<text x="${f1(cx)}" y="${f1(cy+R*.32)}" font-size="3.1" text-anchor="middle" fill="#6f6f72" font-family="ui-monospace,Menlo,monospace" letter-spacing=".3">VOLTS</text>`;
 face+=`<line data-volt-needle x1="${f1(cx-Math.cos(na)*2)}" y1="${f1(cy-Math.sin(na)*2)}" x2="${f1(cx+Math.cos(na)*(R-1))}" y2="${f1(cy+Math.sin(na)*(R-1))}" stroke="#111" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="1.4" fill="#2d2d2f"/>`;
  o+=`<g transform="${fm}">${face}</g>`;
 for(const sx of [M.x+3,M.x+M.w-3])o+=screw(sx,M.y+M.d/2,z+2+M.h,P,.9);
 return {k:k.depthOf([M.x+M.w/2,M.y+M.d/2,z],P),svg:o};
}
function wiring(v:number,P:k.Projection,layout:Layout):Item[]{
 const z=BENCH_Z,J=JBOX,out:Item[]=[],jb={x:J.x,y:J.y,w:J.w,d:J.d,r:1.5};
 out.push({k:k.depthOf([J.x+J.w/2,J.y+J.d/2,z],P),svg:S(k.slabOf(jb,z,J.h,P,3,.5),{tone:'hi',inner:L(k.sideSeam(jb,z+J.h-3,P,3),'faint')})+k.corners(jb,2.6).map(([x,y])=>screw(x,y,z+J.h,P,.7)).join('')+
  `<path d="${k.ring(J.x+J.w/2,J.y+J.d/2,2.4,z+J.h+.05,P,20)}" fill="${v>5?LAMP:'#d3d3ce'}" class="iso-line" data-tone="mid" style="fill:${v>5?mix('#f4f2ea',LAMP,Math.min(1,v/100)):'#d3d3ce'}"/>`});
 // dynamo terminals to the junction box, along the bench's front
 const run=[k.iso([-46,122,z+7],P),k.iso([-46,127,z],P),k.iso([8,127,z],P),k.iso([8,94,z],P),k.iso([J.x,94,z],P),k.iso([J.x,94,z+3],P)];
 out.push({k:k.depthOf([8,110,z],P)-20,svg:cable(run,2.2)});
 // junction box up the ground's side and round the pitch to every tower foot
 if(layout==='tall')return out;
 const up=[k.iso([J.x+J.w/2,J.y,z+J.h-3],P),k.iso([J.x+J.w/2,GROUND.y+GROUND.d,z+J.h-3],P),k.iso([J.x+J.w/2,GROUND.y+GROUND.d,1.5],P)];
 out.push({k:k.depthOf([J.x+J.w/2,GROUND.y+GROUND.d,z],P)+1,svg:cable(up,2)});
 // where it goes into the ground: a gland box (the cables to the towers run under the ground)
 const gl={x:J.x+J.w/2-4,y:GROUND.y+GROUND.d-6,w:8,d:6,r:1};
 out.push({k:k.depthOf([J.x+J.w/2,GROUND.y+GROUND.d,0],P)+2,svg:S(k.slabOf(gl,0,3,P,3,.3),{tone:'hi'})+screw(J.x+J.w/2,GROUND.y+GROUND.d-3,3,P,.8)});
 return out;
}

// ── The whole drawing ──────────────────────────────────────────────────────────────────────────────────────────────────
export function render(P:k.Projection,V:View,layout:Layout='wide'):{svg:string;anchors:Anchors}{
 const Ps=stationProj(P,layout);
 const v=volts(V.omega),p=power(v),night=1-Math.min(1,p);
 let o=`<defs><radialGradient id="fl-glow"><stop offset="0" stop-color="#fffbe6" stop-opacity="1"/><stop offset=".25" stop-color="${LAMP}" stop-opacity=".75"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient></defs>`;
 o+=bench(P,layout==='wide'?BENCH:STADIUM_BENCH)+(layout==='wide'?labelPlate(P):'')+ground(P);
 const back:Item[]=[...terraces(P)];
 o+=back.sort((a,b)=>a.k-b.k).map(i=>i.svg).join('');
 o+=pitch(P,night);
 // the light map: one small image lying on the turf (the page renders it from the same model grid)
 if(V.lightHref)o+=`<image href="${V.lightHref}" x="0" y="0" width="${f1(PL)}" height="${f1(PW)}" preserveAspectRatio="none" transform="${k.topMatrix([-PL/2,-PW/2],TURF_Z,P)}" style="image-rendering:auto" pointer-events="none"/>`;
 o+=markings(P);
 const on=onWhenApart(V.apart);
 o+=shadows({yaw:V.yaw,on},p,P);
 o+=beams(V.yaw.map((y,i)=>y),p,P,on);
 const items:Item[]=[...goals(P),...PLAYERS.map(([x,y,t])=>player(x,y,t,P)),...gantry(V.gx,V.gy,lightAt({yaw:V.yaw,on:onWhenApart(V.apart)},p,V.gx,V.gy),P,V.cue==='probe'),
];
 const station:Item[]=[...dynamo(V.wheel,V.omega,V.motor,Ps,V.cue==='crank'),voltmeter(v,Ps),...wiring(v,Ps,layout)];
 if(layout==='wide')items.push(...station);
 let parts:Partial<Record<PartId,k.Flat>>={};
 const heads:k.Flat[]=[];
 for(let i=0;i<4;i++){const t=tower(i,V.yaw[i],p,V.apart,P,V.focus,V.cue==='knob');heads.push(t.head);items.push(...t.items);if(i===APART_TOWER)parts=t.anchors;}
 o+=items.sort((a,b)=>a.k-b.k).map(i=>i.svg).join('');
 if(layout==='tall')o+=bench(Ps,STATION_BENCH)+labelPlate(Ps)+station.sort((a,b)=>a.k-b.k).map(i=>i.svg).join('');
 const W=WHEEL,kk=k.cameraOf(P).k/1.26,hr=W.r-4;
 const anchors:Anchors={crank:k.iso([W.x,W.y,W.z],Ps),crankR:W.r*kk,handle:k.iso([W.x+Math.cos(V.wheel)*hr,W.y+7,W.z+Math.sin(V.wheel)*hr],Ps),
  lever:k.iso([LEVER.x,LEVER.y+4,LEVER.z+LEVER.len*.85],Ps),knobs:heads,
  probe:k.iso([V.gx,V.gy,BEAM_Z+4],P),pitch:[[-PL/2,-PW/2],[PL/2,-PW/2],[PL/2,PW/2],[-PL/2,PW/2]].map(([x,y])=>k.iso([x,y,TURF_Z],P)),parts:V.apart>.3?parts:{},scale:kk};
 return {svg:o,anchors};
}
export {PARTS};
