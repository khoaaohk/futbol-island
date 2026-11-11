import * as T from 'three';
import {PINBALL_INK as INK} from '../arcade/looks/pinball';
import {createComicUniforms,comicDotCell,comicMaterial,type ComicUniforms} from '../arcade/comic/shading';
import {inkedPart,partAt,bakeParts} from '../arcade/comic/ink';
import {comicCoastTexture} from '../arcade/comic/backdrop';
import {CREST_LANES,CREST_POSTS,CREST_TOP,CREST_BOT,WALL_X,WALL_Y,FLAGS,FLAG_LETTERS,DUGOUT,SLINGS,CONES} from './soccerPinballTable';
import {pinballChaseLampSpots} from './soccerPinballHype';

/* Futbol Pinball: the beach board (docs/arcade-aaa/pinball-direction.md, comic house style). The file kept its name from the
 * machine passes; what it builds now is a pinball pitch-board on the Breakaway coast, printed like a comic page. Built ONCE:
 *  - the playfield: one canvas texture (flat turf in two mown bands, halftone shade, paper lines over an ink copy, lettering,
 *    the unlit inserts as flat discs in an ink ring), drawn by ONE plane, plus the apron strip lifted onto a sloped plate;
 *  - the board and everything standing on or round it (red-and-white kerbs, advertising boards behind the goal, a sun-yellow
 *    front kerb, posts, slingshots, the dugout and, off phones, palms and parasols), every part with its
 *    ink outline baked in as an inverted hull (lib/arcade/comic/ink.ts): ONE shadow-casting draw;
 *  - the world: sand, a boardwalk under the board, the surf line (one receiving draw) and the kit's painted golden-hour coast
 *    on one unlit quad (lib/arcade/comic/backdrop.ts);
 *  - the comic football (1 draw), the plunger, the figure mounts;
 *  - the print lamps: one instanced mesh and ONE shader shared by every lamp on the table (printLampMaterial): a lit insert
 *    is saturated flat colour with a Ben-Day ring, an unlit one draws nothing. No texture, no additive haze.
 * No env map, no tone mapping, no emissive. No per-frame work lives here except setInsert(), which writes one colour. */

/** Table units (the rules' 360 x 620 space) covered by the playfield print. */
export const FIELD={x0:10,x1:378,y0:20,y1:632} as const;
/** Under-playfield insert lamps the game drives (table units): centre circle, runs toward the goal, the box, the flipper gap. */
export const PINBALL_INSERTS:readonly (readonly [number,number])[]=[
 ...Array.from({length:10},(_,i)=>[171+Math.cos(i*Math.PI/5+.31)*54,310+Math.sin(i*Math.PI/5+.31)*54] as const),
 [84,185],[84,215],[84,245],[258,185],[258,215],[258,245],
 [120,345],[120,375],[120,405],[240,345],[240,375],[240,405],[140,505],[220,505],
 [128,108],[154,108],[180,108],[206,108],[232,108],
];
/** Every insert is a printed disc (w cream, a amber = left foot, b blue = right foot, r red = the box, g green). The print paints
 * its UNLIT colour (a muted flat tone in an ink ring) so it reads when off; the lamp over it is the saturated colour. */
export type PinballTint='w'|'a'|'b'|'r'|'g';
export const PINBALL_INSERT_TINTS:readonly PinballTint[]=[...'wwwwwwwwwwaaabbbaaabbbabrrrrr'] as PinballTint[];
export const PINBALL_PLASTIC:Record<PinballTint,string>={w:'#d9cda8',a:'#cf9440',b:'#3d6f9f',r:'#b9483e',g:'#3f9a5a'};
/** Lit colour of each tint as linear RGB x heat (the lamp shader reads the hue from the ratio and the heat from the peak). */
export const PINBALL_LAMP:Record<PinballTint,readonly [number,number,number]>={w:[1.2,1.02,.62],a:[1.2,.6,.06],b:[.16,.5,1.2],r:[1.2,.15,.07],g:[.14,1.2,.34]};
/** How far a lamp's Ben-Day ring reaches past its insert (lamp radius / insert radius). */
export const PINBALL_BLOOM=1.9;

const LETTER='Impact,"Arial Narrow Bold","Arial Black",Arial,sans-serif';

/** The print lamp: ONE unlit shader for every lamp on the table (inserts, state lamps, bumper skirts, rail studs, ball save).
 * The instance (or material) colour carries hue x heat. Heat is cut into four printed steps: a dotted disc, a solid disc, a solid
 * disc with a Ben-Day ring, then a hot disc with the full ring. Black draws nothing (discard), so an unlit lamp shows the print
 * under it. The dots are the comic screen (same cell and angle as the shading), so lamps and shadows are one print. No texture,
 * no blending: a light show is a rhythm of flat colour and dots. `core` = insert radius / lamp radius. `hole` (same unit) leaves the
 * middle of the insert unprinted, so a lamp over a lettered insert (G-O-A-L, the stars, 2x..5x, BALL SAVE) lights as a thick ring
 * and the letter under it stays readable. */
export function printLampMaterial(ink:ComicUniforms,core=1/PINBALL_BLOOM,hole=0){
 const m=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide}),c=core.toFixed(3),h=hole.toFixed(3);
 m.onBeforeCompile=shader=>{shader.uniforms.uInkBand=ink.uInkBand;
  shader.vertexShader='varying vec2 vLampUv;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLampUv=uv;');
  shader.fragmentShader='uniform vec4 uInkBand;varying vec2 vLampUv;\n'+shader.fragmentShader.replace('#include <color_fragment>',/* glsl */`#include <color_fragment>
{float lh=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)),heat=floor(clamp(lh/1.15,0.,1.)*4.+.5)*.25,lr=length(vLampUv*2.-1.);
 vec2 lp=mat2(.7071,-.7071,.7071,.7071)*gl_FragCoord.xy/uInkBand.z;float ld=length(fract(lp)-.5)*1.4142,inCore=step(lr,${c})*step(${h},lr),ring=clamp((1.-lr)/(1.-${c}),0.,1.);
 if(mix(step(ld,ring*heat*1.1)*step(.6,heat)*step(${c},lr),step(ld,heat*2.3),inCore)<.5)discard;
 diffuseColor=vec4(mix(diffuseColor.rgb/max(lh,1e-4),vec3(1.,.97,.86),inCore*step(.99,heat)*.28),1.);}`);};
 m.customProgramCacheKey=()=>'pinball-print-lamp-'+c+'-'+h;return m;
}

/** The printed playfield. `scale` = canvas px per table unit. Flat colour only: no gradient, grain, wear or baked light. */
export function paintPinballPlayfield(scale:number){
 const c=document.createElement('canvas');c.width=Math.round((FIELD.x1-FIELD.x0)*scale);c.height=Math.round((FIELD.y1-FIELD.y0)*scale);
 const g=c.getContext('2d')!;g.setTransform(scale,0,0,scale,-FIELD.x0*scale,-FIELD.y0*scale);
 const K=INK.ink,P=INK.paper;
 // 1. The deck round the pitch: flat sand with a dot screen of its shade tone growing toward the kerbs.
 g.fillStyle=INK.deck;g.fillRect(FIELD.x0,FIELD.y0,368,612);
 g.fillStyle=INK.deckShade;for(let y=FIELD.y0+2;y<604;y+=4.4)for(let x=FIELD.x0+2+(Math.round(y/4.4)%2)*2.2;x<FIELD.x1;x+=4.4){const edge=Math.min(x-FIELD.x0,FIELD.x1-x,y-FIELD.y0),r=Math.max(0,1-edge/15)*1.9;if(r>.25){g.beginPath();g.arc(x,y,r,0,7);g.fill();}}
 // 2. The pitch inside an ink line: two mown bands, then the halftone shade (dots of the darker green growing toward the touchlines
 // and the flipper end), the way a comic page turns a tone.
 g.fillStyle=K;g.fillRect(24.6,49.6,312.8,550.8);g.save();g.beginPath();g.rect(27,52,308,546);g.clip();
 for(let y=52,k=0;y<600;y+=42,k++){g.fillStyle=k%2?INK.turf:INK.turfMown;g.fillRect(27,y,308,42);}
 g.fillStyle=INK.turfShade;for(let y=54;y<598;y+=3.6)for(let x=28+(Math.round(y/3.6)%2)*1.8;x<335;x+=3.6){const edge=Math.min(x-27,335-x,y-52,598-y),r=Math.max(0,1-edge/40)*1.3+Math.max(0,(y-486)/250);if(r>.2){g.beginPath();g.arc(x,y,Math.min(1.5,r),0,7);g.fill();}}
 g.restore();
 // 3. Pitch markings: paper lines over an ink copy offset down-right (the page's block shadow).
 const lines=()=>{g.beginPath();g.rect(33,58,296,534);g.stroke();g.beginPath();g.moveTo(33,310);g.lineTo(329,310);g.stroke();g.beginPath();g.arc(171,310,54,0,7);g.stroke();
  g.strokeRect(74,58,212,112);g.strokeRect(124,58,112,44);g.beginPath();g.arc(180,128,58,Math.PI*.26,Math.PI*.74);g.stroke();
  g.strokeRect(92,516,176,76);g.beginPath();g.arc(180,548,50,Math.PI*1.22,Math.PI*1.78);g.stroke();
  for(const [x,y,a] of[[33,58,0],[329,58,.5],[329,592,1],[33,592,1.5]] as const){g.beginPath();g.arc(x,y,9,Math.PI*a,Math.PI*(a+.5));g.stroke();}};
 g.lineJoin='miter';g.lineWidth=2.6;g.save();g.translate(1.1,1.1);g.strokeStyle=K;lines();g.restore();g.strokeStyle=P;lines();
 // Centre emblem: a printed football.
 g.fillStyle=K;g.beginPath();g.arc(172.2,311.2,16.2,0,7);g.fill();g.fillStyle=P;g.beginPath();g.arc(171,310,15,0,7);g.fill();g.fillStyle=K;g.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*.4;g.lineTo(171+Math.cos(a)*6,310+Math.sin(a)*6);}g.closePath();g.fill();
 for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*.4;g.beginPath();g.moveTo(171+Math.cos(a)*6,310+Math.sin(a)*6);g.lineTo(171+Math.cos(a)*15,310+Math.sin(a)*15);g.strokeStyle=K;g.lineWidth=1.5;g.stroke();g.beginPath();g.arc(171+Math.cos(a)*15,310+Math.sin(a)*15,4.2,0,7);g.fill();}
 g.strokeStyle=K;g.lineWidth=1.8;g.beginPath();g.arc(171,310,15,0,7);g.stroke();
 // 4. Lettering: heavy italic capitals, ink outline, a hard offset block shadow (the kit's lettering, drawn on the pitch).
 const word=(text:string,x:number,y:number,size:number,fill:string,lw:number,maxW:number,rot=0,block=0,italic=true)=>{g.save();g.translate(x,y);g.rotate(rot);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';let s=size;g.font=`${italic?'italic ':''}900 ${s}px ${LETTER}`;const w=g.measureText(text).width;if(w>maxW){s*=maxW/w;g.font=`${italic?'italic ':''}900 ${s}px ${LETTER}`;}
  if(block>0){g.lineWidth=lw;g.strokeStyle=K;g.fillStyle=K;g.strokeText(text,block,block);g.fillText(text,block,block);}if(lw>0){g.lineWidth=lw;g.strokeStyle=K;g.strokeText(text,0,0);}g.fillStyle=fill;g.fillText(text,0,0);g.restore();};
 word('FUTBOL',171,210,42,INK.sun,5,132,-.035,2.6);
 {g.save();g.translate(171,241);g.rotate(-.035);g.fillStyle=K;g.fillRect(-36,-6.4,76,15.6);g.fillStyle=P;g.fillRect(-38.4,-8.8,76,15.6);g.strokeStyle=K;g.lineWidth=1.5;g.strokeRect(-38.4,-8.8,76,15.6);g.restore();word('PINBALL',170.6,240,11,K,0,66,-.035,0,false);}
 // Wing arrows toward goal: sun-yellow, ink outline, block shadow.
 for(const x of[84,258])for(const y of[185,215,245]){const arrow=(dx:number,dy:number)=>{g.beginPath();g.moveTo(x+dx,y-13+dy);g.lineTo(x+12+dx,y+3+dy);g.lineTo(x+6+dx,y+3+dy);g.lineTo(x+6+dx,y+11+dy);g.lineTo(x-6+dx,y+11+dy);g.lineTo(x-6+dx,y+3+dy);g.lineTo(x-12+dx,y+3+dy);g.closePath();};g.fillStyle=K;arrow(1.6,1.6);g.fill();g.fillStyle=INK.sun;g.strokeStyle=K;g.lineWidth=1.6;g.lineJoin='miter';arrow(0,0);g.fill();g.stroke();}
 // 5. The plunger lane: a paper strip in an ink frame with the launch ladder's seven unlit rungs.
 g.fillStyle=K;g.fillRect(337,100,34,512);g.fillStyle='#ffe6ad';g.fillRect(340.4,103.4,27.2,505.2);
 for(let i=0;i<7;i++){g.fillStyle=K;g.fillRect(346,560-i*15-6,16,12);g.fillStyle='#e0b877';g.fillRect(347.4,560-i*15-4.6,13.2,9.2);}
 word('KICK OFF',354,330,13,K,0,150,-Math.PI/2,0);
 // Sling aprons: a sun-yellow printed frame under each slingshot (the 3D posts and band stand on it).
 for(const k of SLINGS){const cx=(k.ax+k.bx+k.cx)/3,cy=(k.ay+k.by+k.cy)/3,tri=(d:number)=>{g.beginPath();for(const [x,y] of[[k.ax,k.ay],[k.bx,k.by],[k.cx,k.cy]] as const)g.lineTo(cx+(x-cx)*1.42+d,cy+(y-cy)*1.3+d);g.closePath();};g.fillStyle=K;tri(1.6);g.fill();g.fillStyle=INK.sun;g.strokeStyle=K;g.lineWidth=1.7;tri(0);g.fill();g.stroke();}
 // Pop-bumper rings and the dugout mouth.
 for(const p of CONES){g.fillStyle=K;g.beginPath();g.arc(p.x,p.y,18.6,0,7);g.fill();g.fillStyle=P;g.beginPath();g.arc(p.x,p.y,17,0,7);g.fill();g.fillStyle=INK.red;g.beginPath();g.arc(p.x,p.y,13.5,0,7);g.fill();}
 g.fillStyle=K;g.beginPath();g.arc(DUGOUT.x,DUGOUT.y,15,0,7);g.fill();
 // 6. Inserts, unlit: a flat muted disc in an ink ring with one cut highlight. The lamp over each prints the saturated colour.
 const insert=(x:number,y:number,r:number,tint:PinballTint)=>{g.fillStyle=K;g.beginPath();g.arc(x,y,r+1.3,0,7);g.fill();g.fillStyle=PINBALL_PLASTIC[tint];g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle='rgba(255,243,214,.6)';g.lineWidth=.8;g.beginPath();g.arc(x,y,r*.66,Math.PI*1.08,Math.PI*1.42);g.stroke();};
 PINBALL_INSERTS.forEach(([x,y],i)=>insert(x,y,5.2,PINBALL_INSERT_TINTS[i]));
 CREST_LANES.forEach(x=>insert(x,76,7,'a'));[153,171,189,207].forEach(x=>insert(x,452,6,'a'));WALL_X.forEach(x=>insert(x,150,6,'r'));FLAGS.forEach(f=>insert(f.x<180?44:315,f.y,8,'w'));
 [156,180,204].forEach(x=>insert(x,425,8,'w'));insert(DUGOUT.x-22,DUGOUT.y+20,7,'w');insert(36,232,6,'b');[148,180,212].forEach(x=>insert(x,396,6.5,'w'));
 // Star rollovers: a printed star round each button.
 for(const x of[162,180,198]){const star=(r0:number,r1:number,d:number)=>{g.beginPath();for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2,r=j%2?r0:r1;g.lineTo(x+Math.cos(a)*r+d,478+Math.sin(a)*r+d);}g.closePath();g.fill();};g.fillStyle=K;star(4.4,9,.8);g.fillStyle=INK.sun;star(3.2,7,0);g.fillStyle=K;g.beginPath();g.arc(x,478,2.6,0,7);g.fill();}
 // The keeper's line (he slides along it) and the slots of the free-kick wall.
 g.strokeStyle=K;g.lineCap='round';g.lineWidth=4.4;g.beginPath();g.moveTo(108,83);g.lineTo(252,83);g.stroke();g.lineCap='butt';
 for(const x of WALL_X){g.fillStyle=K;g.fillRect(x-11,WALL_Y-3.6,22,7.2);}
 // Legends: small paper capitals with an ink edge.
 {g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  const label=(text:string,x:number,y:number,size:number,color:string=P,stroke:string=K)=>{g.font=`900 ${size}px ${LETTER}`;if(stroke!=='none'){g.lineWidth=size*.32;g.strokeStyle=stroke;g.strokeText(text,x,y);}g.fillStyle=color;g.fillText(text,x,y);};
  CREST_LANES.forEach(x=>label('★',x,76,9,K,'none'));['2×','3×','4×','5×'].forEach((t,i)=>label(t,153+i*18,452.4,8.6,K,'none'));
  FLAGS.forEach((f,i)=>label(FLAG_LETTERS[i],f.x<180?44:315,f.y+.5,10,K,'none'));// Nov 10 2026 touch-up: legends a phone cannot read are gone (STAR LANES, BUILD UP, MODES, BONUS, DRIBBLE); the ones that matter are
   // printed at 9.5 to 11 units (about 9 px on a 390 px phone): the mode names beside and under their inserts, the multipliers, THE WALL, DUGOUT.
   g.textAlign='right';label('WALL',144,425.5,11);g.textAlign='left';label('BLOCK',216,425.5,11);g.textAlign='center';label('1-2',180,439.6,9.5);
  g.textAlign='right';label('DUGOUT',DUGOUT.x-15,DUGOUT.y+2.5,10);g.textAlign='center';label('THE WALL',180,166,10);}
 // Ball-save caption box between the flippers (unlit: the lamp over it prints it green, gold or red).
 g.fillStyle=K;g.fillRect(142.6,577.6,78,21);g.fillStyle='#2f7d55';g.fillRect(141,576,78,21);g.strokeStyle=K;g.lineWidth=1.6;g.strokeRect(141,576,78,21);g.fillStyle=P;g.font=`italic 900 9.5px ${LETTER}`;g.textAlign='center';g.textBaseline='middle';g.fillText('BALL SAVE',180,587);
 // 7. The apron (this strip is lifted onto the sloped plate in 3D): a paper margin with two picture panels. Left: the two flipper
 // keys and a switch arrow (alternate feet). Right: three balls and a goal. No small type.
 g.fillStyle=P;g.fillRect(FIELD.x0,604,330,30);g.fillStyle=K;g.fillRect(FIELD.x0,604,330,1.6);
 for(const x of[40,212]){g.fillStyle=K;g.fillRect(x+1.6,609.1,98,20);g.fillStyle='#ffe6ad';g.fillRect(x,607.5,98,20);g.strokeStyle=K;g.lineWidth=1.4;g.strokeRect(x,607.5,98,20);}
 {const disc=(x:number,y:number,r:number,fill:string)=>{g.fillStyle=K;g.beginPath();g.arc(x,y,r+1.2,0,7);g.fill();g.fillStyle=fill;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
  disc(62,617.5,5.2,INK.sun);disc(116,617.5,5.2,'#4aa3e8');g.strokeStyle=K;g.lineWidth=1.8;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(74,617.5);g.lineTo(104,617.5);g.moveTo(79,613.8);g.lineTo(74,617.5);g.lineTo(79,621.2);g.moveTo(99,613.8);g.lineTo(104,617.5);g.lineTo(99,621.2);g.stroke();
  for(let i=0;i<3;i++)disc(228+i*13,617.5,4,P);g.strokeStyle=K;g.lineWidth=1.6;g.beginPath();g.moveTo(272,624);g.lineTo(272,611.5);g.lineTo(300,611.5);g.lineTo(300,624);g.stroke();g.lineWidth=.6;g.beginPath();for(let k=1;k<5;k++){g.moveTo(272+k*5.6,611.5);g.lineTo(272+k*5.6,624);}for(let k=1;k<3;k++){g.moveTo(272,611.5+k*4.2);g.lineTo(300,611.5+k*4.2);}g.stroke();g.lineCap='butt';g.lineJoin='miter';}
 word('FUTBOL',175,618,12,INK.sun,2.6,44,0,1);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}

export function mergeColored(parts:readonly (readonly [T.BufferGeometry,string])[]){
 const flat=parts.map(([geo,color])=>[geo.index?geo.toNonIndexed():geo,new T.Color(color)] as const),count=flat.reduce((n,[p])=>n+p.attributes.position.count,0);
 const pos=new Float32Array(count*3),nor=new Float32Array(count*3),col=new Float32Array(count*3);let o=0;
 for(const [p,c] of flat){pos.set(p.attributes.position.array,o*3);nor.set(p.attributes.normal.array,o*3);for(let v=0;v<p.attributes.position.count;v++)c.toArray(col,(o+v)*3);o+=p.attributes.position.count;p.dispose();}
 for(const [p] of parts)p.dispose();
 const merged=new T.BufferGeometry();merged.setAttribute('position',new T.BufferAttribute(pos,3));merged.setAttribute('normal',new T.BufferAttribute(nor,3));merged.setAttribute('color',new T.BufferAttribute(col,3));return merged;
}
const boxAt=(x:number,y:number,z:number,w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d).translate(x,y,z);
const rnd=(seed:number)=>{let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>{s=s*16807%2147483647;return(s-1)/2147483646;};};
/** Ground level of the beach round the board (the playfield is y 0). */
export const BEACH_Y=-.4;
/** Where the sand meets the surf (world z): just beyond the hoardings behind the goal, so the sea and the painted coast sit in the top of every frame. */
const SURF=-13.6;

export function createPinballCabinet(scene:T.Scene,scenery:T.Object3D,px:(x:number)=>number,pz:(y:number)=>number,mobile:boolean,renderer:{getPixelRatio():number}){
 // Comic house style: ONE uniform set for the whole game. Every lit material gets the print bands and the halftone turn; the ball,
 // figures, flippers, rails and wire forms also the sun rim and the ink edge. No pass, no light, no render target, no texture.
 const ink=createComicUniforms();comicDotCell(ink,renderer);scene.userData.pinballInk=ink;
 const flat=comicMaterial(new T.MeshLambertMaterial({vertexColors:true}),{uniforms:ink});scene.userData.pinballFlat=flat;
 const wire=comicMaterial(new T.MeshLambertMaterial({color:INK.rail}),{uniforms:ink,rim:true,inkWidth:1.2});scene.userData.pinballWire=wire;
 const lamp=printLampMaterial(ink);scene.userData.pinballLamp=lamp;
 const x0=px(FIELD.x0),x1=px(FIELD.x1),z0=pz(FIELD.y0),z1=pz(FIELD.y1),cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
 // Playfield: one plane, the page itself. It receives every shadow and casts none.
 const print=paintPinballPlayfield(mobile?1.75:2.5);
 const fieldMat=comicMaterial(new T.MeshLambertMaterial({map:print}),{uniforms:ink});
 const field=new T.Mesh(new T.PlaneGeometry(w,d),fieldMat);field.name='pinball-playfield';field.rotation.x=-Math.PI/2;field.position.set(cx,0,cz);field.receiveShadow=true;scene.add(field);
 // The apron: the printed strip below the flippers lifted onto a sloped plate (same material and texture: no extra upload).
 {const ax1=px(340),az0=pz(604),u1=(340-FIELD.x0)/(FIELD.x1-FIELD.x0),v0=1-(604-FIELD.y0)/(FIELD.y1-FIELD.y0),geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.BufferAttribute(new Float32Array([x0,.03,az0,ax1,.03,az0,ax1,.62,z1,x0,.62,z1]),3));geo.setAttribute('uv',new T.BufferAttribute(new Float32Array([0,v0,u1,v0,u1,0,0,0]),2));geo.setIndex([0,3,2,0,2,1]);geo.computeVertexNormals();
  const apron=new T.Mesh(geo,fieldMat);apron.name='pinball-apron';apron.receiveShadow=true;scene.add(apron);}
 // The board: kerbs, hoardings, front kerb and plinth, each part with its ink hull baked in. One vertex-coloured draw that casts
 // shadows and receives none (a hull would shadow the part inside it: lib/arcade/comic/README.md, traps).
 const board:T.BufferGeometry[]=[],LINE=.05;
 // Kerbs: 10 to 14 flat blocks a side (no hull each) round one hidden core box whose hull is the kerb's outline (triangles saved).
 {const n=mobile?10:14,len=(d+1.3)/n;for(const X of[x0-.36,x1+.36]){for(let i=0;i<n;i++)inkedPart(board,new T.BoxGeometry(.62,.62,len),i%2?INK.kerbWhite:INK.kerbRed,partAt(X,.27,z0-.65+len*(i+.5)),0);inkedPart(board,new T.BoxGeometry(.6,.6,d+1.28),INK.kerbWhite,partAt(X,.27,cz),LINE+.01);}}
 {const panels=[INK.teal,INK.paper,INK.orange,INK.blue,INK.paper,INK.sun],pw=(w+1.34)/panels.length;panels.forEach((c,i)=>inkedPart(board,new T.BoxGeometry(pw,1.16,.5),c,partAt(x0-.67+pw*(i+.5),.54,z0-.36),0));inkedPart(board,new T.BoxGeometry(w+1.32,1.14,.48),INK.paper,partAt(cx,.54,z0-.36),LINE+.01);}
 inkedPart(board,new T.BoxGeometry(w+1.9,.66,.74),INK.sun,partAt(cx,.25,z1+.5),LINE);
 inkedPart(board,new T.BoxGeometry(w+2.3,.5,d+2.6),INK.wood,partAt(cx,-.31,cz+.1),LINE);
 // Wire forms: two lane guides at the star lanes and the two inlane guides, bent from one rod each (thin: the shader ink edge).
 const wireOf=(pts:readonly (readonly [number,number,number])[],r:number)=>new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(([x,h,y])=>new T.Vector3(px(x),h,pz(y))),false,'catmullrom',.04),pts.length*4,r,4,false);
 const trimParts:T.BufferGeometry[]=[];
 for(const x of CREST_POSTS)trimParts.push(wireOf([[x,0,CREST_TOP],[x,.3,CREST_TOP+3],[x,.3,CREST_BOT-3],[x,0,CREST_BOT]],.06));
 for(const side of[-1,1]){const x=180+side*60;trimParts.push(wireOf([[x,0,473],[x,.2,471],[x+side*22,.2,442],[x+side*9,.2,448],[x+side*9,0,450]],.04));}
 const trim=new T.Mesh(mergeColored(trimParts.map(p=>[p,'#ffffff'] as const)),wire);trim.name='pinball-wire-forms';scene.add(trim);
 // Hardware: every small standing part in ONE hulled, shadow-casting draw: posts with rubber rings, the slingshots (posts, band,
 // printed cap, kicker), the star-rollover buttons, the keeper's rail stops.
 const hw=board;
 for(const x of[104,256])inkedPart(hw,new T.BoxGeometry(.1,.12,.3),INK.paper,partAt(px(x),.06,pz(83)),.025);
 const post=(x:number,y:number,color:string)=>{const X=px(x),Z=pz(y);inkedPart(hw,new T.CylinderGeometry(.08,.1,.46,6),color,partAt(X,.23,Z),.035,true);inkedPart(hw,new T.CylinderGeometry(.15,.15,.1,6),INK.paper,partAt(X,.2,Z),0,true);};
 for(const k of SLINGS){const CX=px((k.ax+k.bx+k.cx)/3),CZ=pz((k.ay+k.by+k.cy)/3),corners=[[k.ax,k.ay],[k.bx,k.by],[k.cx,k.cy]] as const;
  for(const [x,y] of corners)post(x,y,INK.post);
  for(const [a,b] of[[0,1],[1,2]] as const){const X1=px(corners[a][0]),Z1=pz(corners[a][1]),X2=px(corners[b][0]),Z2=pz(corners[b][1]),len=Math.hypot(X2-X1,Z2-Z1),mx=(X1+X2)/2,mz=(Z1+Z2)/2;let nx=-(Z2-Z1)/len,nz=(X2-X1)/len;if(nx*(mx-CX)+nz*(mz-CZ)<0){nx=-nx;nz=-nz;}
   inkedPart(hw,new T.BoxGeometry(len,.1,.06),INK.rubber,partAt(mx+nx*.118,.2,mz+nz*.118,-Math.atan2(Z2-Z1,X2-X1)),.025);}
  const plate=(grow:number,y:number,depth:number,color:string,line:number)=>{const sh=new T.Shape();corners.forEach(([x,yy],i)=>{const X=(px(x)-CX)*grow,Z=(pz(yy)-CZ)*grow;if(i)sh.lineTo(X,-Z);else sh.moveTo(X,-Z);});sh.closePath();inkedPart(hw,new T.ExtrudeGeometry(sh,{depth,bevelEnabled:false}).rotateX(-Math.PI/2).translate(0,-depth/2,0),color,partAt(CX,y,CZ),line);};
  plate(1.14,.485,.05,INK.sun,.04);plate(.8,.52,.02,INK.red,0);}
 for(const [x,y] of[[341,150],[341,402],[341,455]] as const)post(x,y,INK.post);
 for(const x of[162,180,198])inkedPart(hw,new T.CylinderGeometry(.07,.085,.05,8),INK.paper,partAt(px(x),.025,pz(478)),.02,true);
 // The dugout: an ink mouth in the print with a little red shelter roof on two paper pillars.
 inkedPart(hw,new T.BoxGeometry(.95,.07,.36),INK.red,partAt(px(DUGOUT.x+4),.42,pz(DUGOUT.y-13)),.03);for(const dx of[-10,18])inkedPart(hw,new T.BoxGeometry(.06,.42,.06),INK.paper,partAt(px(DUGOUT.x+dx),.21,pz(DUGOUT.y-13)),.02);
 // The plunger: red tip, paper rod, an ink knob in front of the kerb, and a spring that really compresses as you pull. 2 draws.
 const pl:T.BufferGeometry[]=[];inkedPart(pl,new T.CylinderGeometry(.13,.13,.2,8).rotateX(Math.PI/2),INK.red,partAt(0,0,-.19),.03);inkedPart(pl,new T.CylinderGeometry(.05,.05,2.5,6).rotateX(Math.PI/2),INK.paper,partAt(0,0,1.15),.025);inkedPart(pl,new T.SphereGeometry(.19,8,6),INK.orange,partAt(0,0,2.45),.035);
 const plunger=new T.Mesh(bakeParts(pl),flat);plunger.name='pinball-plunger';scene.add(plunger);
 const coil:T.Vector3[]=[];for(let i=0;i<=70;i++){const a=i/10*Math.PI*2;coil.push(new T.Vector3(Math.cos(a)*.085,Math.sin(a)*.085,i/70));}
 const spring=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(coil),56,.022,3,false),wire);spring.name='pinball-plunger-spring';scene.add(spring);
 const wallZ=pz(599)-.03;function setPlunger(z:number){plunger.position.set(px(354),.24,z);const back=z-.05;spring.position.set(px(354),.24,back);spring.scale.z=Math.max(.06,wallZ-back);}setPlunger(pz(585));
 // Figure mounts: each keeper and defender stands on a paper disc with a turf-green cap (one instanced, hulled draw).
 const mountParts:T.BufferGeometry[]=[];inkedPart(mountParts,new T.CylinderGeometry(.44,.48,.08,8),INK.paper,partAt(0,.04,0),.045,true);inkedPart(mountParts,new T.CylinderGeometry(.28,.32,.06,8),INK.turfShade,partAt(0,.11,0),0,true);
 const mounts=new T.InstancedMesh(bakeParts(mountParts),flat,5);mounts.name='pinball-figure-mounts';mounts.frustumCulled=false;mounts.count=0;scene.add(mounts);
 // The world round the board. Ground (receives shadows, casts none): sand with printed ripples, a boardwalk under the board, the
 // surf line and the sea. Flat vertex colour, no texture.
 {const quad=(xa:number,za:number,xb:number,zb:number,y:number)=>new T.PlaneGeometry(xb-xa,zb-za).rotateX(-Math.PI/2).translate((xa+xb)/2,y,(za+zb)/2),r=rnd(1110),g:[T.BufferGeometry,string][]=[];
  g.push([quad(-90,SURF,90,46,BEACH_Y),INK.sand],[quad(-90,SURF-1,90,SURF,BEACH_Y+.004),INK.foam],[quad(-90,SURF-1.5,90,SURF-1.34,BEACH_Y+.006),INK.foam],[quad(-90,-60,90,SURF-1,BEACH_Y),INK.seaNear]);
  for(let i=0;i<46;i++){const x=-34+r()*68,z=SURF+1.5+r()*36,l=.8+r()*2.2;if(Math.abs(x-cx)<w/2+2.2&&z>z0-3&&z<z1+3)continue;g.push([quad(x,z,x+l,z+.14,BEACH_Y+.006),INK.sandShade]);}
  // The boardwalk: planks across, an ink joint between each.
  const bx0=x0-2.6,bx1=x1+2.6,bz0=z0-2,bz1=z1+3.4;g.push([quad(bx0-.12,bz0-.12,bx1+.12,bz1+.12,BEACH_Y+.008),INK.ink],[quad(bx0,bz0,bx1,bz1,BEACH_Y+.012),'#d9a066']);
  for(let z=bz0+1.5;z<bz1-.2;z+=1.5)g.push([quad(bx0,z,bx1,z+.07,BEACH_Y+.016),INK.ink]);
  // The 26 rail studs the chase lamps print on ride in this mesh (they need no shadow and no hull: a few pixels each).
  {const spots=pinballChaseLampSpots();for(let i=0;i<spots.length;i+=2)g.push([new T.CylinderGeometry(.085,.1,.11,6).translate(px(spots[i]),.345,pz(spots[i+1])),INK.paper]);}
  const ground=new T.Mesh(mergeColored(g),flat);ground.name='pinball-beach';ground.receiveShadow=true;scenery.add(ground);}
 // Props (cast shadows, hulled): palms, parasols and towels on the sand, off phones only (an upright phone is all table).
 {const p=board,r=rnd(77);
  const palm=(x:number,z:number,h:number,lean:number)=>{inkedPart(p,new T.CylinderGeometry(.16,.26,h,6),INK.trunk,new T.Matrix4().makeRotationZ(lean).setPosition(x-Math.sin(lean)*h/2,BEACH_Y+h/2,z),.06,true);const tx=x-Math.sin(lean)*h,ty=BEACH_Y+h;
   for(let i=0;i<6;i++){const a=i/6*Math.PI*2+r(),len=2.3+r()*.7,m=new T.Matrix4().makeRotationFromEuler(new T.Euler(0,a,-.5-r()*.25,'YXZ'));m.setPosition(tx+Math.cos(a)*len*.42,ty-len*.16,z-Math.sin(a)*len*.42);const leaf=new T.BoxGeometry(len,.09,.74),lp=leaf.attributes.position;for(let v=0;v<lp.count;v++)if(lp.getX(v)>0)lp.setZ(v,lp.getZ(v)*.16);inkedPart(p,leaf,i%2?INK.palm:INK.palmLight,m,.06);}};
  const parasol=(x:number,z:number,c:string)=>{inkedPart(p,new T.CylinderGeometry(.05,.05,2.2,5),INK.paper,partAt(x,BEACH_Y+1.1,z),.035,true);inkedPart(p,new T.ConeGeometry(1.5,.6,8),c,partAt(x,BEACH_Y+2.3,z),.06,true);inkedPart(p,new T.BoxGeometry(1.1,.05,2.2),c===INK.red?INK.teal:INK.orange,partAt(x+1.6,BEACH_Y+.03,z+.4,.3),.04);};
  if(!mobile){palm(-10.5,-7.5,6,.14);palm(-13.5,2.5,5.2,-.08);palm(12.4,-9.5,6.2,-.12);palm(14.6,3.5,5.4,.1);palm(-17,-11.5,6.6,.05);palm(19,-12,6.8,-.06);parasol(-14.5,6.5,INK.red);parasol(16,8,INK.sun);parasol(-18.5,-4,INK.sun);parasol(20.5,-5.5,INK.red);}
}
 // ONE draw for every static standing thing (kerbs, hoardings, posts, slings, dugout, palms, parasols): hulled, casting, never receiving.
 const body=new T.Mesh(bakeParts(board),flat);body.name='pinball-board';body.castShadow=true;scene.add(body);
 // The painted golden-hour coast (kit backdrop: sky bands, the sun cut as discs, headlands, a banded sea) on ONE unlit quad. The
 // camera looks down on the board, so the real horizon is far out of frame: the painting is a backcloth leaned back from the surf
 // line (50 degrees off the sand), which puts its sea, headlands and the low sun in the top of the frame on desktop and tall phones.
 {const coast=comicCoastTexture({width:mobile?512:1024,height:mobile?128:256,sunX:.3,horizon:.9,seed:11}),H=15,tilt=50*Math.PI/180,sky=new T.Mesh(new T.PlaneGeometry(H*4,H).translate(0,H/2,0),new T.MeshBasicMaterial({map:coast,toneMapped:false,fog:false}));sky.name='pinball-coast-backdrop';sky.rotation.x=tilt-Math.PI/2;sky.position.set(cx,BEACH_Y,SURF-1.02);scenery.add(sky);}
 // Print lamps over the inserts: one instanced draw, one colour write per lamp.
 const inserts=new T.InstancedMesh(new T.CircleGeometry(5.2/30*PINBALL_BLOOM,mobile?8:16),lamp,PINBALL_INSERTS.length);inserts.name='pinball-insert-lamps';inserts.frustumCulled=false;inserts.renderOrder=2;
 const dummy=new T.Object3D(),off=new T.Color(0,0,0);dummy.rotation.x=-Math.PI/2;
 PINBALL_INSERTS.forEach(([x,y],i)=>{dummy.position.set(px(x),.012,pz(y));dummy.updateMatrix();inserts.setMatrixAt(i,dummy.matrix);inserts.setColorAt(i,off);});inserts.instanceColor!.setUsage(T.DynamicDrawUsage);scene.add(inserts);
 // The ball: a comic football (paper leather, ink panels) with the sun rim and the ink edge. 1 draw.
 const panels=(()=>{const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d')!;g.fillStyle='#fffaf0';g.fillRect(0,0,128,64);g.fillStyle=INK.ink;
  for(let row=0;row<4;row++)for(let i=0;i<(row===0||row===3?3:6);i++){const y=8+row*16,x=(i+(row%2)*.5)*(128/(row===0||row===3?3:6))+8,r=row===0||row===3?9:6.5,sx=row===0||row===3?2.2:1.15;g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*.4+(row%2?Math.PI:0);g.lineTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r);}g.closePath();g.fill();if(x+r*sx>128){g.save();g.translate(-128,0);g.fill();g.restore();}}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;return t;})();
 const ballMat=comicMaterial(new T.MeshLambertMaterial({color:'#ffffff',map:panels}),{uniforms:ink,rim:true,inkWidth:1.3});
 const ball=new T.Group();ball.name='pinball-ball';const rolling=new T.Group();rolling.name='pinball-rolling';const leather=new T.Mesh(new T.SphereGeometry(7/30,mobile?14:28,mobile?9:18),ballMat);leather.castShadow=true;rolling.add(leather);ball.add(rolling);scene.add(ball);
 const lampTint=new T.Color();
 return{ink,flat,wire,lamp,field,fieldMat,inserts,ball,rolling,mounts,setPlunger,z0,cx,
  /** Light insert `i` to `heat` 0..1 in its own colour (`boost` pushes it to the hot step for a flash). Writes one instance colour. */
  setInsert(i:number,heat:number,boost=0){const t=PINBALL_LAMP[PINBALL_INSERT_TINTS[i]],h=heat<=0?0:Math.min(1,heat*(1+boost*.6));inserts.setColorAt(i,lampTint.setRGB(t[0]*h,t[1]*h,t[2]*h));},
  flush(){inserts.instanceColor!.needsUpdate=true;}};
}

/** One step of a print lamp's level toward `target`: ~45 ms to print, ~190 ms to clear (the shader cuts the level into four
 * printed steps, so the ease reads as dots growing and shrinking, never as a fade). */
export const lampStep=(heat:number,target:number,dt:number)=>heat+(target-heat)*(1-Math.exp(-dt*(target>heat?22:5.2)));
