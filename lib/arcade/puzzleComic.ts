import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {PITCH,GROUND_Y,PUZZLE_SUN,pitchRandom} from './looks/puzzle';
import {inkedPart,partAt,tint} from './comic/ink';

/**
 * Pass Puzzles comic kit (docs/arcade-aaa/puzzle-direction.md): every painted canvas and every merged, flat-colour geometry of
 * "The Tactics Pitch". Built once per visit (the two atlases) or once per level (the pitch-side world), never per frame. Colours are
 * flat vertex colours: the shared comic shading (lib/arcade/comic) turns light into print bands, so nothing here bakes light or
 * grain into a texture. The scene (lib/arcade/passPuzzleScene.ts) owns the meshes; stage.dispose() frees what is in the scene.
 */

// ── textures ──
/** Cells of the ink marks atlas (4 x 2 cells of 128 px). Brush marks are drawn white with a dark ink edge baked in: the material
 * colour tints the white core (clear / tight / blocked ...) and leaves the edge reading as ink. */
export const MARK={ring:0,hatch:1,cross:2,smudge:3,dashRing:4,ticks:5,streak:6,blob:7} as const;
export type MarkCell=typeof MARK[keyof typeof MARK];
const CELL=128,COLS=4,ROWS=2,INK=PITCH.ink;
export function marksAtlas(){
 const c=document.createElement('canvas');c.width=CELL*COLS;c.height=CELL*ROWS;const g=c.getContext('2d')!,rnd=pitchRandom(211);
 const at=(cell:number)=>({x:(cell%COLS)*CELL+CELL/2,y:Math.floor(cell/COLS)*CELL+CELL/2});
 g.lineCap='round';g.lineJoin='round';
 /** One brush stroke: a fat ink pass under a white core. */
 const brush=(ink:number,core:number,path:()=>void)=>{g.strokeStyle=INK;g.lineWidth=ink;path();g.stroke();g.strokeStyle='#fff';g.lineWidth=core;path();g.stroke();};
 /** Dry brush: bristle gaps scratched out of a cell along `angle`. */
 const dry=(cell:number,count:number,angle:()=>number,len=26)=>{const o=at(cell);g.save();g.beginPath();g.rect(o.x-64,o.y-64,128,128);g.clip();g.globalCompositeOperation='destination-out';g.lineWidth=1.3;for(let i=0;i<count;i++){const x=o.x+(rnd()-.5)*120,y=o.y+(rnd()-.5)*120,a=angle(),l=len*(.4+rnd());g.globalAlpha=.55+rnd()*.45;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}g.restore();g.globalAlpha=1;};
 {const o=at(MARK.ring);brush(15,8,()=>{g.beginPath();g.arc(o.x,o.y,49,0,Math.PI*2);});dry(MARK.ring,26,()=>rnd()*Math.PI,14);}
 {const o=at(MARK.hatch);g.save();g.beginPath();g.arc(o.x,o.y,55,0,Math.PI*2);g.clip();g.strokeStyle='#fff';for(let d=-120;d<=120;d+=13){g.lineWidth=4.2+rnd()*2.2;g.beginPath();g.moveTo(o.x+d-60,o.y+60);g.lineTo(o.x+d+60,o.y-60);g.stroke();}g.restore();g.strokeStyle='#fff';g.lineWidth=4.5;g.beginPath();g.arc(o.x,o.y,55,0,Math.PI*2);g.stroke();}
 {const o=at(MARK.cross);for(const s of [1,-1])brush(22,12,()=>{g.beginPath();g.moveTo(o.x-38,o.y-38*s);g.quadraticCurveTo(o.x+4*s,o.y-3,o.x+38,o.y+38*s);});dry(MARK.cross,22,()=>Math.PI/4+(rnd()<.5?0:Math.PI/2),18);}
 // An ink splat: a body, lobes thrown outward and loose droplets.
 {const o=at(MARK.smudge);g.fillStyle='#fff';g.beginPath();for(let i=0;i<=28;i++){const a=i/28*Math.PI*2,r=25+((i*7)%5)*3.2+(i%4===0?14+rnd()*10:0);if(i)g.lineTo(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r);else g.moveTo(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r);}g.closePath();g.fill();
  for(let i=0;i<13;i++){const a=rnd()*Math.PI*2,r=44+rnd()*14;g.beginPath();g.arc(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r,1.6+rnd()*3.6,0,Math.PI*2);g.fill();}}
 {const o=at(MARK.dashRing);g.setLineDash([17,13]);brush(13,6.5,()=>{g.beginPath();g.arc(o.x,o.y,51,.2,.2+Math.PI*2);});g.setLineDash([]);}
 // Impact ticks: ten wedges flying out from the centre, ink round each.
 {const o=at(MARK.ticks);for(const pass of [0,1])for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.2,r0=27+(i%2)*6,r1=57-(i%3)*4,w=(pass?4.6:8.4),ca=Math.cos(a),sa=Math.sin(a);g.fillStyle=pass?'#fff':INK;const e=pass?0:2.5;g.beginPath();g.moveTo(o.x+ca*(r0-e),o.y+sa*(r0-e));g.lineTo(o.x+ca*(r1+e)-sa*w,o.y+sa*(r1+e)+ca*w);g.lineTo(o.x+ca*(r1+e)+sa*w,o.y+sa*(r1+e)-ca*w);g.closePath();g.fill();}}
 // A length of brush stroke (it runs down the cell): ink edges, a white core, bristle gaps along it and a dry, split start and end.
 {const o=at(MARK.streak);g.fillStyle=INK;g.fillRect(o.x-50,o.y-64,100,128);g.fillStyle='#fff';g.fillRect(o.x-33,o.y-64,66,128);
  g.globalCompositeOperation='destination-out';for(let i=0;i<34;i++){const edge=rnd()<.7,x=o.x+(edge?(rnd()<.5?-1:1)*(40+rnd()*10):(rnd()-.5)*60),w=edge?1.2+rnd()*2.4:.8+rnd()*1.2;g.globalAlpha=edge?1:.5;g.fillRect(x,o.y-64,w,128);}
  for(const s of [-1,1])for(let i=0;i<26;i++){g.globalAlpha=1;const x=o.x-50+rnd()*100,l=4+rnd()*16;g.fillRect(x,s<0?o.y-52:o.y+52-l,1.5+rnd()*3,l);}g.globalCompositeOperation='source-over';g.globalAlpha=1;}
 // The drop shadow under a player: a flat disc that breaks into Ben-Day dots at its edge.
 {const o=at(MARK.blob);g.fillStyle='#fff';g.beginPath();g.arc(o.x,o.y,40,0,Math.PI*2);g.fill();for(let ring=0;ring<3;ring++){const r=45+ring*6.5,n=26+ring*5;for(let i=0;i<n;i++){const a=(i+ring*.5)/n*Math.PI*2;g.beginPath();g.arc(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r,3.4-ring*.95,0,Math.PI*2);g.fill();}}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
const cellRect=(cell:number,inset=0)=>{const cx=cell%COLS,cy=Math.floor(cell/COLS);return{u0:(cx*CELL+inset)/(CELL*COLS),u1:((cx+1)*CELL-inset)/(CELL*COLS),v0:1-((cy+1)*CELL-inset)/(CELL*ROWS),v1:1-(cy*CELL+inset)/(CELL*ROWS)};};
/** A flat mark lying on the pitch: 2 x 2 units centred on the origin (scale = radius), mapped to one atlas cell. */
export function markGeometry(cell:MarkCell){const r=cellRect(cell),g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute([-1,0,1, 1,0,1, 1,0,-1, -1,0,-1],3));g.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3));
 g.setAttribute('uv',new T.Float32BufferAttribute([r.u0,r.v0, r.u1,r.v0, r.u1,r.v1, r.u0,r.v1],2));g.setIndex([0,1,2,0,2,3]);return g;}
/** A brush shaft: 1 wide (x) and 1 long (z from 0 to 1), flat on the pitch; scale x = width, z = length. */
export function shaftGeometry(){const r=cellRect(MARK.streak,14),g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute([-.5,0,1, .5,0,1, .5,0,0, -.5,0,0],3));g.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3));
 g.setAttribute('uv',new T.Float32BufferAttribute([r.u0,r.v1, r.u1,r.v1, r.u1,r.v0, r.u0,r.v0],2));g.setIndex([0,1,2,0,2,3]);return g;}
/** An arrow head: a flat triangle pointing +z (base 1 wide at z = 0, tip at z = 1), filled from the core of the stroke. */
export function headGeometry(){const r=cellRect(MARK.streak,40),g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute([-.5,0,0, 0,0,1, .5,0,0],3));g.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
 g.setAttribute('uv',new T.Float32BufferAttribute([r.u0,r.v0, (r.u0+r.u1)/2,r.v1, r.u1,r.v0],2));g.setIndex([0,1,2]);return g;}
/** The drawn pass: a ribbon of `points` samples (2 vertices each) whose positions the scene rewrites while aiming. */
export function ribbonGeometry(points:number){const r=cellRect(MARK.streak,14),g=new T.BufferGeometry(),pos=new Float32Array(points*6),uv=new Float32Array(points*4),nor=new Float32Array(points*6),index:number[]=[];
 for(let i=0;i<points;i++){const v=r.v0+(r.v1-r.v0)*i/(points-1);uv.set([r.u0,v,r.u1,v],i*4);nor.set([0,1,0,0,1,0],i*6);if(i<points-1){const a=i*2;index.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const p=new T.BufferAttribute(pos,3);p.setUsage(T.DynamicDrawUsage);g.setAttribute('position',p);g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(index);g.setDrawRange(0,0);return g;}

/** Number badges: a tilted comic caption disc with an ink ring and a hard offset shadow, one 64 px cell per team and number (1-20). 8 x 8 cells. */
export const FLAG_TEAMS=['attack','defend','keeper'] as const;export type FlagTeam=typeof FLAG_TEAMS[number];
export function flagAtlas(){
 const S=64,c=document.createElement('canvas');c.width=c.height=S*8;const g=c.getContext('2d')!;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
 const fill={attack:PITCH.attack,defend:PITCH.defend,keeper:PITCH.keeper},num={attack:PITCH.ink,defend:PITCH.card,keeper:PITCH.card};
 FLAG_TEAMS.forEach((team,t)=>{for(let n=1;n<=20;n++){if(team==='keeper'&&n>1)break;const i=t*20+n-1,x=(i%8)*S+S/2,y=Math.floor(i/8)*S;
  g.fillStyle=PITCH.ink;g.beginPath();g.moveTo(x-7,y+44);g.lineTo(x+1,y+62);g.lineTo(x+9,y+44);g.closePath();g.fill();// the tail that points at the player
  g.beginPath();g.arc(x+3,y+28,22.5,0,Math.PI*2);g.fill();// hard offset shadow
  g.beginPath();g.arc(x,y+25,22.5,0,Math.PI*2);g.fill();g.fillStyle=fill[team];g.beginPath();g.arc(x,y+25,18.5,0,Math.PI*2);g.fill();
  g.fillStyle=num[team];g.font=`italic 800 ${n>9?24:29}px "Avenir Next Condensed","Roboto Condensed","Arial Narrow","Arial Rounded MT Bold",system-ui,Arial,sans-serif`;g.fillText(String(n),x-.5,y+26.5);}});
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
export function flagUV(team:FlagTeam,n:number){const i=FLAG_TEAMS.indexOf(team)*20+Math.max(1,Math.min(20,n))-1,x=i%8,y=Math.floor(i/8),e=.5/512;return{u0:x/8+e,u1:(x+1)/8-e,v0:1-(y+1)/8+e,v1:1-y/8-e};}
/** One mesh for every number badge (4 vertices each): the scene writes camera-facing corners per frame it renders. */
export function flagBatchGeometry(count:number){const g=new T.BufferGeometry(),p=new T.BufferAttribute(new Float32Array(count*12),3);p.setUsage(T.DynamicDrawUsage);const index:number[]=[];
 for(let i=0;i<count;i++){const a=i*4;index.push(a,a+1,a+2,a,a+2,a+3);}g.setAttribute('position',p);g.setAttribute('uv',new T.BufferAttribute(new Float32Array(count*8),2));g.setIndex(index);g.setDrawRange(0,0);return g;}

// ── flat-colour geometry ──
/** Every part ends up non-indexed with position, normal and colour only, so parts from any source merge into one mesh. */
const flat=<G extends T.BufferGeometry>(src:G)=>{const g=src.index?src.toNonIndexed():src;if(g!==src)src.dispose();g.deleteAttribute('uv');return g as T.BufferGeometry;};
/** A part in its own local frame: painted, turned (x, then z, then y) and moved. */
const mk=(src:T.BufferGeometry,color:string|null,x=0,y=0,z=0,rx=0,rz=0,ry=0)=>{const g=flat(src);if(color)tint(g,color);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);if(ry)g.rotateY(ry);g.translate(x,y,z);return g;};
/** A turned (lathe) shape with a colour per profile point: [radius, height, colour]. Repeat a point to get a hard colour edge. */
function turned(profile:[number,number,string][],segments:number){
 const g=new T.LatheGeometry(profile.map(p=>new T.Vector2(p[0],p[1])),segments),n=profile.length,a=new Float32Array(g.attributes.position.count*3),cols=profile.map(p=>new T.Color(p[2]));
 for(let i=0;i<=segments;i++)for(let j=0;j<n;j++){const c=cols[j],k=(i*n+j)*3;a[k]=c.r;a[k+1]=c.g;a[k+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));return flat(g);}
const merge=(parts:T.BufferGeometry[])=>{const m=mergeGeometries(parts.map(flat))!;for(const p of parts)p.dispose();return m;};

/** The ball: a fine icosphere whose twelve pentagon panels (the corners of the icosahedron, cut a third of the way down each
 * edge, exactly as on a real 32-panel ball) are inked; the rest is paper white. */
export function ballGeometry(radius:number){
 const g=new T.IcosahedronGeometry(radius,4),p=g.getAttribute('position'),n=p.count,col=new Float32Array(n*3),nor=new Float32Array(n*3);
 const corners:T.Vector3[]=[];{const base=new T.IcosahedronGeometry(1,0),bp=base.getAttribute('position');for(let i=0;i<bp.count;i++){const v=new T.Vector3().fromBufferAttribute(bp,i).normalize();if(!corners.some(c=>c.distanceTo(v)<.01))corners.push(v);}base.dispose();}
 const ink=new T.Color('#2b2036'),cream=new T.Color('#fffaf0'),c=new T.Vector3(),m=new T.Matrix3(),w=new T.Vector3();
 for(let t=0;t<n;t+=3){c.set(0,0,0);for(let k=0;k<3;k++){c.x+=p.getX(t+k);c.y+=p.getY(t+k);c.z+=p.getZ(t+k);}c.normalize();
  // Barycentric weights of this triangle's centre on its icosahedron face (the three nearest corners).
  const near=[...corners].sort((a,b)=>b.dot(c)-a.dot(c)).slice(0,3);m.set(near[0].x,near[1].x,near[2].x,near[0].y,near[1].y,near[2].y,near[0].z,near[1].z,near[2].z).invert();w.copy(c).applyMatrix3(m);const sum=w.x+w.y+w.z,top=w.x/sum;
  const tone=top>2/3?ink:cream;
  for(let k=0;k<3;k++){const i=(t+k)*3;col[i]=tone.r;col[i+1]=tone.g;col[i+2]=tone.b;c.fromBufferAttribute(p,t+k).normalize();nor[i]=c.x;nor[i+1]=c.y;nor[i+2]=c.z;}}
 g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.deleteAttribute('uv');return g;
}
/** Shared material for every flat-colour part: vertex colour, matte (the comic bands decide the tone; the scene chains the shading on). */
export const flatMaterial=()=>new T.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0});

/** Pitch edges (world units): the verge ends here and the kerb starts. The pitch is a coach's part-pitch: `crop` pulls the near end
 * (and, for a turned camera, the near side) in to the play, so the kerb and the beach show under the players instead of empty
 * grass. The far end always keeps the goal. */
export type BoardCrop={x0?:number;x1?:number;z0?:number};
export function boardBounds(hw:number,L:number,crop?:BoardCrop){const half=L/2;return{x0:Math.max(-hw-3,crop?.x0??-1e9),x1:Math.min(hw+3,crop?.x1??1e9),z0:Math.max(-half-4,crop?.z0??-1e9),z1:half+6,frame:1.5,top:.24};}
/** How the coach looks at this pitch: centre of the play, ground direction of view (unit), and the view depths (along that
 * direction from the centre) where the play starts and ends. */
export type BoardView={cx:number;cz:number;dx:number;dz:number;near:number;far:number;crop?:BoardCrop};
/** World-space direction TOWARD the sun for a view: low, far and to the left, so shadows rake toward the coach's right hand. */
export function sunDirection(view:BoardView,out=new T.Vector3()){const a=Math.atan2(view.dx,view.dz)+PUZZLE_SUN.azimuth,ce=Math.cos(PUZZLE_SUN.elevation);return out.set(Math.sin(a)*ce,Math.sin(PUZZLE_SUN.elevation),Math.cos(a)*ce);}
/** Everything round the pitch, as TWO flat-colour geometries with their ink outlines baked in as inverted hulls: `ground` (beach,
 * surf, sea, kerb) only receives shadows and `props` (boards, palms, parasols, boat, cones) only casts them, because a hull that
 * both casts and receives would shadow the part inside it. In all:
 * the beach it sits on, the surf line and the banded sea beyond the far end with a glitter path toward the sun, the red-and-white
 * kerb, advertising boards behind the goal, palms, parasols, a sail boat, and the coach's cones and ball bag on the near side.
 * The coast is laid out in the VIEW frame, so the sea is always at the top of the screen whichever way the camera is turned.
 * Returns the depth (along the view) of the shore so the scene can stand the painted horizon behind it. */
export function pitchSideGeometry(hw:number,L:number,view:BoardView){
 const b=boardBounds(hw,L,view.crop),ground:T.BufferGeometry[]=[],out:T.BufferGeometry[]=[],rnd=pitchRandom(Math.round(hw*7+L)),G=GROUND_Y,F=b.frame,rx=-view.dz,rz=view.dx,heading=Math.atan2(view.dx,view.dz);
 const XL=b.x1+F,XR=b.x0-F,ZF=b.z1+F,ZN=b.z0-F,depth=(x:number,z:number)=>(x-view.cx)*view.dx+(z-view.cz)*view.dz,side=(x:number,z:number)=>(x-view.cx)*rx+(z-view.cz)*rz;
 const corners:[number,number][]=[[XL,ZF],[XR,ZF],[XL,ZN],[XR,ZN]],shore=Math.max(...corners.map(c=>depth(c[0],c[1])))+3.6,nearEdge=Math.min(...corners.map(c=>depth(c[0],c[1])));
 /** View frame to world: s to the right of the view centre, d along the view. */
 const vx=(s:number,d:number)=>view.cx+rx*s+view.dx*d,vz=(s:number,d:number)=>view.cz+rz*s+view.dz*d;
 /** Faces that look at the coach are backlit by the low sun and would print in the violet shadow band: the boards and the far kerb
  * take an upward normal instead, so they print in the light band like the posters they are (shading only; shadows still fall on them). */
 const sunlit=(list:T.BufferGeometry[],from:number)=>{for(let i=from;i<list.length;i++){const n=list[i].getAttribute('normal') as T.BufferAttribute|undefined;if(n)for(let k=0;k<n.count;k++)n.setXYZ(k,0,1,0);}};
 /** A ground strip across the view between two depths (y just under the lines). */
 const strip=(d0:number,d1:number,color:string,y=G,s0=-260,s1=260)=>{const g=new T.BufferGeometry(),p=[[s0,d0],[s1,d0],[s1,d1],[s0,d1]].map(([s,d])=>[vx(s,d),y,vz(s,d)]);
  // +x is screen left: wind the quad so it faces up for any heading.
  g.setAttribute('position',new T.Float32BufferAttribute([...p[0],...p[2],...p[1],...p[0],...p[3],...p[2]],3));g.computeVertexNormals();if((g.getAttribute('normal') as T.BufferAttribute).getY(0)<0){const a=g.getAttribute('position') as T.BufferAttribute,arr=a.array as Float32Array;for(let t=0;t<2;t++)for(let k=0;k<3;k++){const i=(t*3+1)*3+k,j=(t*3+2)*3+k,v=arr[i];arr[i]=arr[j];arr[j]=v;}g.computeVertexNormals();}
  ground.push(tint(g,color));};
 // Beach, wet sand, the surf line (foam with an ink edge), then the sea in two flat bands.
 strip(-220,shore,PITCH.sand);strip(shore,shore+2.4,PITCH.sandShade);strip(shore+2.4,shore+3.1,PITCH.ink,G+.004);strip(shore+2.5,shore+4.4,PITCH.foam,G+.008);
 strip(shore+4.4,shore+17,PITCH.seaNear);strip(shore+17,shore+150,PITCH.seaFar);
 for(let i=0;i<9;i++){const d=shore+7+i*3.1+rnd()*2,s=(rnd()-.5)*150,w=5+rnd()*9;strip(d,d+.34,PITCH.foam,G+.006,s,s+w);}
 // Glitter path: short dashes on the water along the line from the play toward the sun.
 {const ta=Math.tan(PUZZLE_SUN.azimuth);for(let i=0;i<22;i++){const d=shore+6+i*4.4+rnd()*2,spread=3+i*1.1,s=-ta*(d+18)*.42+(rnd()-.5)*2*spread,w=1.6+rnd()*4.4;strip(d,d+.4+i*.02,PITCH.glitter,G+.007,s-w/2,s+w/2);}}
 // Kerb: a paper-white strip with its ink hull, red blocks along it (Breakaway's roadside kerb, laid round the pitch).
 {const h=b.top-G,zc=(b.z0+b.z1)/2,len=b.z1-b.z0,wid=b.x1-b.x0,bx=(b.x0+b.x1)/2,rails:[number,number,number,number][]=[[b.x1+F/2,zc,F,len+F*2],[b.x0-F/2,zc,F,len+F*2],[bx,b.z1+F/2,wid,F],[bx,b.z0-F/2,wid,F]];
  for(const [x,z,w,d] of rails){const from=ground.length,farRail=view.dz>=0?z>b.z1:z<b.z0;inkedPart(ground,new T.BoxGeometry(w,h,d),PITCH.card,partAt(x,G+h/2,z),.16);const long=Math.max(w,d),n=Math.max(2,Math.round(long/3.4)),step=long/n;
   for(let i=0;i<n;i+=2){const o=-long/2+step*(i+.5);ground.push(mk(new T.BoxGeometry(w>d?step:w+.02,h,w>d?d+.02:step),PITCH.red,w>d?x+o:x,G+h/2+.012,w>d?z:z+o));}if(farRail)sunlit(ground,from);}}
 // Advertising boards behind the goal line: flat colour panels, each with one cut-paper shape, on ink feet. The panels are in the
 // receiving mesh (they would otherwise throw a long shadow over the far kerb and print it dull); only their feet cast.
 {const cols=[PITCH.teal,PITCH.card,PITCH.sun,PITCH.blue,PITCH.card,PITCH.orange],z=ZF+1.5,W=6.4,n=Math.max(2,Math.floor((XL-XR)/W)),x0=(XL+XR)/2-n*W/2;
  for(let i=0;i<n;i++){const from=ground.length,x=x0+W*(i+.5),c=cols[(i+Math.round(hw))%cols.length];inkedPart(ground,new T.BoxGeometry(W-.5,1.7,.3),c,partAt(x,G+1.15,z),.12);
   ground.push(mk(i%2?new T.BoxGeometry(W-2.2,.34,.04):new T.CylinderGeometry(.5,.5,.04,10),c===PITCH.card?PITCH.red:PITCH.card,x,G+1.15,z-.18,i%2?0:Math.PI/2));
   sunlit(ground,from);for(const s of [-1,1])out.push(mk(new T.BoxGeometry(.18,.34,.9),PITCH.ink,x+s*(W/2-.9),G+.17,z+.25));}}
 /** A prop standing at a view-frame spot (list of parts built round the origin). */
 const stand=(parts:T.BufferGeometry[],s:number,d:number,yaw=0,scale=1)=>{const m=new T.Matrix4().makeRotationY(heading+yaw).scale(new T.Vector3(scale,scale,scale)).setPosition(vx(s,d),G,vz(s,d));for(const g of parts){g.applyMatrix4(m);out.push(g);}};
 const palm=(k:number)=>{const p:T.BufferGeometry[]=[];let x=0,y=0;const lean=[.08,.17,.27];
  for(let i=0;i<3;i++){const h=2.6,l=lean[i]*(k%2?1:-1);inkedPart(p,new T.CylinderGeometry(.24-i*.03,.31-i*.03,h+.1,6,1,true),i%2?PITCH.trunkLight:PITCH.trunk,partAt(x+Math.sin(l)*h/2,y+Math.cos(l)*h/2,0,0,-l),.09,true);x+=Math.sin(l)*h;y+=Math.cos(l)*h;}
  for(let f=0;f<7;f++){const a=f/7*Math.PI*2+k,blade=(w:number,len:number,color:string,drop:number)=>{const g=new T.BufferGeometry(),pts=[0,0,-w, len*.55,-drop*.3,-w*1.25, len,-drop,0, len*.55,-drop*.3,w*1.25, 0,0,w];
    const tri=(i:number,j:number,l:number)=>[pts[i*3],pts[i*3+1],pts[i*3+2],pts[j*3],pts[j*3+1],pts[j*3+2],pts[l*3],pts[l*3+1],pts[l*3+2]];
    g.setAttribute('position',new T.Float32BufferAttribute([...tri(0,1,4),...tri(1,3,4),...tri(1,2,3),...tri(0,4,1),...tri(1,4,3),...tri(1,3,2)],3));g.computeVertexNormals();tint(g,color);g.rotateY(a);g.translate(x,y,0);return g;};
   p.push(blade(.62,4.3,PITCH.ink,1.9+(f%3)*.5));const top=blade(.5,4.05,f%2?PITCH.palmLight:PITCH.palm,1.8+(f%3)*.5);top.translate(0,.05,0);p.push(top);}
  return p;};
 const parasol=()=>{const p:T.BufferGeometry[]=[];p.push(mk(new T.CylinderGeometry(.07,.07,3.4,5,1,true),PITCH.card,0,1.7,0));inkedPart(p,new T.ConeGeometry(2.3,.9,8,1,true),tri=>tri%2?'#ffffff':PITCH.red,partAt(0,3.6,0,0,.12),.1,true);p.push(mk(new T.BoxGeometry(2.8,.06,1.3),PITCH.teal,1.9,.04,.8,0,0,.3));return p;};
 const boat=()=>{const p:T.BufferGeometry[]=[],hull=new T.CylinderGeometry(.6,.34,.5,4,1);hull.rotateY(Math.PI/4);hull.scale(2.5,1,.85);inkedPart(p,hull,'#ffffff',partAt(0,.22,0),.07,true);p.push(mk(new T.BoxGeometry(.08,2.9,.08),PITCH.ink,.1,1.75,0));
  const sail=(q:number[],hex:string)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([...q,q[0],q[1],q[2],q[6],q[7],q[8],q[3],q[4],q[5]],3));g.computeVertexNormals();p.push(tint(g,hex));};sail([.18,.6,0,.18,3.1,0,1.9,.6,0],'#fff3d6');sail([0,.7,0,0,2.7,0,-1.2,.7,0],PITCH.red);return p;};
 // The far side: palms behind the boards, parasols on the sand, a boat out on the water.
 const span=Math.max(18,...corners.map(c=>Math.abs(side(c[0],c[1]))))+6;
 for(const [k,s,d] of [[0,-span*.62,shore-1.5],[1,span*.5,shore-1.7],[2,-span-1.5,shore-11],[3,span+2,shore-16]] as const)stand(palm(k),s+(rnd()-.5)*3,d,rnd()*6,1+rnd()*.25);
 stand(parasol(),-span-6,shore-5,.4);stand(parasol(),span+6,shore-7,2.1);stand(boat(),span*.3,shore+15,.5,2.2);stand(boat(),-span*.7,shore+34,-.4,2.4);
 // The coach's side, laid out as the camera sees it: a row of training cones, a ball bag and two spare balls.
 {const cone=(c:string)=>{const p:T.BufferGeometry[]=[];inkedPart(p,new T.ConeGeometry(.62,1.3,8,1),c,partAt(0,.65,0),.09,true);p.push(mk(new T.CylinderGeometry(.5,.56,.14,8,1,true),PITCH.card,0,.34,0),mk(new T.BoxGeometry(1.5,.08,1.5),PITCH.ink,0,.04,0));return p;};
  const d=nearEdge-3.2;for(let i=0;i<4;i++)stand(cone(i%2?PITCH.orange:PITCH.sun),-12.5+i*2.3,d-(i%2)*.9,i);
  const bag:T.BufferGeometry[]=[];{const s=new T.SphereGeometry(1.5,10,7);s.scale(1.25,.78,1);inkedPart(bag,s,PITCH.teal,partAt(0,1.05,0),.11,true);}bag.push(mk(new T.TorusGeometry(.5,.1,5,10),PITCH.card,0,2.2,0,Math.PI/2));stand(bag,10.5,d-2.4,.4);
  for(const [s,dd] of [[7.6,d-.6],[13.2,d-4.4]] as const){const ball=ballGeometry(.62);ball.translate(0,.62,0);const hull:T.BufferGeometry[]=[];inkedPart(hull,new T.IcosahedronGeometry(.62,1),PITCH.ink,partAt(0,.62,0),.09,true);hull.pop()!.dispose();stand([hull[0],flat(ball)],s,dd,s);}}
 return{ground:merge(ground),props:merge(out),shore};
}

/** Goal: paper-white posts and bars (one merged mesh; the comic shader inks its edge) and the net's line segments. The mouth is on z = `z`, the net behind it (+z). */
export function goalGeometry(width:number,height:number,z:number,depth=1.7){
 const w=width/2,back=height*.7,parts:T.BufferGeometry[]=[],up=new T.Vector3(0,1,0),a=new T.Vector3(),b=new T.Vector3(),q=new T.Quaternion(),m=new T.Matrix4();
 const stick=(x1:number,y1:number,z1:number,x2:number,y2:number,z2:number,r:number,color:string=PITCH.foam)=>{a.set(x1,y1,z1);b.set(x2,y2,z2);const len=a.distanceTo(b),g=tint(flat(new T.CylinderGeometry(r,r,len,8)),color);q.setFromUnitVectors(up,b.clone().sub(a).normalize());m.compose(a.add(b).multiplyScalar(.5),q,new T.Vector3(1,1,1));g.applyMatrix4(m);parts.push(g);};
 for(const s of [-1,1]){stick(s*w,0,z,s*w,height,z,.17);stick(s*w,height,z,s*w,back,z+depth,.08);stick(s*w,back,z+depth,s*w,0,z+depth,.08);stick(s*w,.07,z,s*w,.07,z+depth,.08);}
 stick(-w-.17,height,z,w+.17,height,z,.17);stick(-w,back,z+depth,w,back,z+depth,.08);stick(-w,.07,z+depth,w,.07,z+depth,.08);
 const net:number[]=[],step=.34,cols=Math.max(2,Math.round(width/step)),rows=Math.max(2,Math.round(back/step));
 for(let i=0;i<=cols;i++){const x=-w+width*i/cols;net.push(x,0,z+depth,x,back,z+depth,x,back,z+depth,x,height,z);}
 for(let j=1;j<rows;j++){const y=back*j/rows;net.push(-w,y,z+depth,w,y,z+depth);for(const s of [-1,1])net.push(s*w,y,z,s*w,y,z+depth);}
 for(let k=1;k<4;k++){const t=k/4,y=height+(back-height)*t,zz=z+depth*t;net.push(-w,y,zz,w,y,zz);}
 for(const s of [-1,1])for(let k=1;k<5;k++){const zz=z+depth*k/5,top=height+(back-height)*k/5;net.push(s*w,0,zz,s*w,top,zz);}
 const lines=new T.BufferGeometry();lines.setAttribute('position',new T.Float32BufferAttribute(net,3));
 return{frame:merge(parts),net:lines};
}
