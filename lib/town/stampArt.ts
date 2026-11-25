import {BOOT_PROFILES} from '../shop/bootProfiles';
import {STAMPS,stampById,type StampId} from './islandStamps';

/**
 * The eight Island stamp book stamps as SVG strings. ORIGINAL line art in the style of Japanese eki stamps; nothing is traced
 * from the owner's reference photo, only its style is taken.
 *
 * v2 (owner, Nov 24 2026: "more intricate with more details … more artistic in design"): each stamp is a layered line-art scene
 * (sky lines, clouds, birds, sun rays at the back; hills, buildings, the Island Line train in the middle; surf, reef or pavement
 * in front) shaded in ONE ink with hatching, cross-hatching and stipple (SVG patterns), inside an ornamental triple ring (a
 * motif band of rope, wave crests, beads or stars), the place name on the top arc, "ISLAND LINE · No.n" (stations) or
 * "FUTBOL ISLAND" (counters) on the bottom arc, a football and a train / star at 9 and 3 o'clock, and a little date plate at
 * the foot of the scene (the stamping date when the book passes one, an empty date box otherwise). Each scene works its
 * football in: riding the North wave, the West Beach sun, a buoy off the South boardwalk, the ball on the Summit goal, the
 * ball floating at Coral Cay's waterline, the Konbini's nobori banner and doorstep, the museum's laced leather ball, the Kit
 * Shop's ball on its stand.
 *
 * Occlusion in one ink: a scene is a stack of layers drawn back to front; a layer may name an occluder (its silhouette), which
 * masks everything drawn before it, so the paper shows round the front shapes as in a real carved stamp (nested masks, each
 * occluder path written once and <use>d by both the art and the mask).
 *
 * Ink look, all in the SVG (no images): a speckle mask (fine noise punches small holes in the ink), uneven pressure (a broad
 * noise field lightens one side), a soft warp so lines wobble like rubber, and a faint offset "bleed" (a <use> of the same art,
 * not a second copy). The book adds the per-stamp tilt (±4°) and offset fixed at stamping (lib/town/islandStamps.ts StampMark).
 *
 * Heat: strings only (each ≤ ~20 KB); the filter rasterises once when the book page paints (the book is the only place they
 * render). Deterministic: a seeded random per stamp, so the same stamp always draws the same.
 */
const n1=(v:number)=>Math.round(v*10)/10;
let seed=1;
const rnd=()=>{seed=seed*16807%2147483647;return (seed-1)/2147483646;};
/** Shapes registered for the current stamp (ids `§pN`, made unique per instance at the end). */
let shapes:string[]=[];
const P=(d:string,w=1.6)=>`<path d="${d}" stroke-width="${w}"/>`;
const F=(d:string)=>`<path d="${d}" fill="currentColor" stroke="none"/>`;
/** Hatch fills: d diagonal, b back-diagonal, h horizontal lines, x cross-hatch, s stipple. */
type Hatch='d'|'b'|'h'|'x'|'s';
const HF=(d:string,k:Hatch)=>`<path d="${d}" fill="url(#§${k})" stroke="none"/>`;
/** A shape kept once: returns its id; draw it with `use(id,…)`, occlude with `occ(id)`. */
const shape=(d:string)=>{shapes.push(d);return `§p${shapes.length-1}`;};
const use=(id:string,attrs='')=>`<use href="#${id}"${attrs?' '+attrs:''}/>`;
const line=(id:string,w=1.6)=>use(id,`stroke-width="${w}"`);
const hatch=(id:string,k:Hatch)=>use(id,`fill="url(#§${k})" stroke="none"`);
const circ=(x:number,y:number,r:number,w=1.4)=>`<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" stroke-width="${w}"/>`;
const dot=(x:number,y:number,r:number)=>`<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="currentColor" stroke="none"/>`;
const txt=(x:number,y:number,s:number,t:string,extra='')=>`<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" stroke="none" fill="currentColor"${extra}>${t}</text>`;
/** Lettering knocked out of a filled shape (an occluder: it inherits the mask's black). */
const txtO=(x:number,y:number,s:number,t:string,extra='')=>`<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle"${extra}>${t}</text>`;

/** A football: the ring, a filled centre pentagon, five seams and the five dark patches round the rim. */
function ball(cx:number,cy:number,r:number,w=1.8){
 const pt=(a:number,k:number)=>`${n1(cx+Math.cos(a)*r*k)} ${n1(cy+Math.sin(a)*r*k)}`,A=(i:number)=>-Math.PI/2+i*Math.PI*2/5;
 let seams='',caps='';
 for(let i=0;i<5;i++){const a=A(i),b=a+Math.PI/5;seams+=`M${pt(a,.4)}L${pt(a,.68)}`;
  caps+=`M${pt(b-.36,.98)}A${n1(r*.98)} ${n1(r*.98)} 0 0 1 ${pt(b+.36,.98)}L${pt(b+.2,.72)}L${pt(b-.2,.72)}Z`;}
 return circ(cx,cy,r,w)+F(`M${[0,1,2,3,4].map(i=>pt(A(i),.4)).join('L')}Z`+caps)+P(seams,w*.6);
}
/** Seeded ripple dashes across y0…y1 (sea and lake surfaces): short wavelets, broken like an engraver's line. */
function sea(y0:number,y1:number,step=3.4,w=.85,x0=34,x1=166){
 let d='';for(let y=y0;y<=y1+.01;y+=step){let x=x0-rnd()*8;while(x<x1){const n=1+Math.floor(rnd()*4);d+=`M${n1(x)} ${n1(y)}`;d+='q2.5 -1.1 5 0'+'t5 0'.repeat(n-1);x+=n*5+2.5+rnd()*7;}step*=1.05;}
 return P(d,w);
}
/** Sky lines: horizontal strokes from the top of the circle down to y1, closer near the top, breaking up lower down. */
function sky(y1:number,w=.8){
 let d='',gap=2.3;for(let y=36;y<y1;y+=gap,gap*=1.13){let x=30;const open=(y-36)/(y1-36);while(x<170){const l=6+rnd()*(40-open*30);if(rnd()>open*.55)d+=`M${n1(x)} ${n1(y)}h${n1(l)}`;x+=l+1.5+rnd()*(3+open*14);}}
 return P(d,w);
}
/** Sun rays round (cx,cy) from r0 to r1 (alternating long and short). */
function rays(cx:number,cy:number,r0:number,r1:number,n=16,w=1.1,ph=0){
 let d='';for(let i=0;i<n;i++){const a=ph+i*Math.PI*2/n,e=i%2?r0+(r1-r0)*.62:r1;d+=`M${n1(cx+Math.cos(a)*r0)} ${n1(cy+Math.sin(a)*r0)}L${n1(cx+Math.cos(a)*e)} ${n1(cy+Math.sin(a)*e)}`;}
 return P(d,w);
}
/** A cumulus cloud (flat base), as a shape id. */
function cloud(x:number,y:number,s:number){
 const k=(v:number)=>n1(v*s);
 return shape(`M${n1(x-12*s)} ${n1(y)}a${k(4)} ${k(4)} 0 0 1 ${k(4.5)} ${k(-4.2)}a${k(6)} ${k(6)} 0 0 1 ${k(10.5)} ${k(-2.6)}a${k(4.6)} ${k(4.6)} 0 0 1 ${k(7.5)} ${k(3.6)}a${k(3)} ${k(3)} 0 0 1 ${k(1.5)} ${k(3.2)}Z`);
}
const cloudArt=(id:string,x:number,y:number,s:number)=>line(id,1.2)+P(`M${n1(x-6*s)} ${n1(y-2.2*s)}q${n1(2*s)} ${n1(-2.4*s)} ${n1(4.6*s)} -.4M${n1(x+3*s)} ${n1(y-4*s)}q${n1(2.2*s)} ${n1(-1.6*s)} ${n1(4*s)} .6`,.8)+P(`M${n1(x-10*s)} ${n1(y+1.6)}h${n1(9*s)}M${n1(x+2*s)} ${n1(y+1.6)}h${n1(7*s)}`,.7);
const bird=(x:number,y:number,s=1)=>`M${n1(x-3*s)} ${n1(y)}q${n1(1.6*s)} ${n1(-2*s)} ${n1(3*s)} 0q${n1(1.4*s)} ${n1(-2*s)} ${n1(3*s)} 0`;
/** A palm: tapered trunk with ring ticks, and fronds as curves with leaflet ticks. */
function palm(x:number,y:number,h:number,lean:number,s=1){
 const tx=x+lean,ty=y-h,cx=x+lean*.15,cy=y-h*.5;let trunk=`M${n1(x-2.2*s)} ${y}Q${n1(cx-1.4*s)} ${n1(cy)} ${n1(tx-1*s)} ${n1(ty)}L${n1(tx+1*s)} ${n1(ty)}Q${n1(cx+1.4*s)} ${n1(cy)} ${n1(x+2.2*s)} ${y}Z`;
 let ticks='';for(let t=.08;t<.95;t+=.085){const u=1-t,px=u*u*x+2*u*t*cx+t*t*tx,py=u*u*y+2*u*t*cy+t*t*ty,hw=(2.2-1.2*t)*s;ticks+=`M${n1(px-hw)} ${n1(py+.6)}q${n1(hw)} ${-.9} ${n1(hw*2)} 0`;}
 let fr='',lf='';
 for(const [ang,len,droop] of [[-2.9,16,6],[-2.3,14,3],[-1.75,10,-1],[-1.1,13,2],[-.45,15,6],[.1,13,7],[2.6,12,7]] as const){
  const L=len*s,ex=tx+Math.cos(ang)*L,ey=ty+Math.sin(ang)*L+droop*s,qx=tx+Math.cos(ang)*L*.55,qy=ty+Math.sin(ang)*L*.55-3*s;fr+=`M${n1(tx)} ${n1(ty)}Q${n1(qx)} ${n1(qy)} ${n1(ex)} ${n1(ey)}`;
  for(let t=.25;t<.95;t+=.17){const u=1-t,px=u*u*tx+2*u*t*qx+t*t*ex,py=u*u*ty+2*u*t*qy+t*t*ey,dx=2*u*(qx-tx)+2*t*(ex-qx),dy=2*u*(qy-ty)+2*t*(ey-qy),l=Math.hypot(dx,dy)||1,k=(1-t*.6)*3.4*s;
   lf+=`M${n1(px)} ${n1(py)}l${n1((-dy/l+dx/l*.5)*k)} ${n1((dx/l+dy/l*.5)*k)}M${n1(px)} ${n1(py)}l${n1((dy/l+dx/l*.5)*k*.8)} ${n1((-dx/l+dy/l*.5)*k*.8)}`;}}
 const id=shape(trunk);
 return {id,art:hatch(id,'b')+line(id,1.1)+P(ticks,.7)+P(fr,1.3)+P(lf,.7)+dot(tx-1.3*s,ty+1.4*s,1.3*s)+dot(tx+1.2*s,ty+1.9*s,1.2*s)};
}
/** The Island Line train in side view, `len` long, its roof at y (nose to the left when dir < 0). */
function train(x:number,y:number,len:number,dir:1|-1=1){
 const hgt=len*.26,X=(u:number)=>n1(dir>0?x+u:x+len-u);
 const body=shape(`M${X(0)} ${n1(y+hgt)}L${X(0)} ${n1(y+3)}Q${X(0)} ${n1(y)} ${X(3)} ${n1(y)}L${X(len-6)} ${n1(y)}Q${X(len)} ${n1(y)} ${X(len)} ${n1(y+hgt*.55)}L${X(len)} ${n1(y+hgt)}Z`);
 let win='';for(let u=4;u<len-9;u+=5.2)win+=`M${X(u)} ${n1(y+2.2)}h${dir*3.4}v${n1(hgt*.3)}h${-dir*3.4}Z`;
 win+=`M${X(len-6.5)} ${n1(y+2)}L${X(len-2.2)} ${n1(y+2.6)}L${X(len-.9)} ${n1(y+hgt*.48)}L${X(len-6.5)} ${n1(y+hgt*.48)}Z`;
 const band=`M${X(.6)} ${n1(y+hgt*.62)}H${X(len-.4)}V${n1(y+hgt*.78)}H${X(.6)}Z`;
 let wheels='';for(const u of [5,10,len-11,len-6])wheels+=circ(+X(u),y+hgt+1.3,1.6,.9);
 const panto=`M${X(len*.45)} ${n1(y)}l${dir*-3} -3.2l${dir*6} -1.8l${dir*-3} 5M${X(len*.45-4)} ${n1(y-5)}h${dir*8}`;
 return {id:body,art:line(body,1.3)+F(win)+hatch(shape(band),'x')+P(`M${X(.6)} ${n1(y+hgt*.62)}H${X(len-.4)}M${X(.6)} ${n1(y+hgt*.78)}H${X(len-.4)}`,.6)+P(panto,.8)+wheels+P(`M${X(2)} ${n1(y+hgt+1.4)}H${X(len-2)}`,.9)};
}
/** Rails with sleepers along y from x0 to x1. */
const rails=(y:number,x0:number,x1:number)=>P(`M${x0} ${y}H${x1}M${x0} ${y+1.6}H${x1}`,.8)+P(Array.from({length:Math.ceil((x1-x0)/3.2)},(_,i)=>`M${n1(x0+i*3.2)} ${y+1.6}v1.6`).join(''),1.1);
/** A pine: three hatched tiers. */
function pine(x:number,y:number,h:number){
 const w=h*.42;let d='';for(let k=0;k<3;k++){const t=y-h*(.22+k*.26),b=t+h*.42,hw=w*(1-k*.24);d+=`M${n1(x)} ${n1(t-h*.12)}L${n1(x+hw)} ${n1(b)}L${n1(x-hw)} ${n1(b)}Z`;}
 const id=shape(d);return {id,art:hatch(id,'d')+line(id,1)+P(`M${x} ${y}v${n1(-h*.16)}`,1.6)};
}
/** The Kit Shop boot's side silhouette from its fitted profile (lib/shop/bootProfiles.ts, model `speed`), sole down, toe right. */
function boot(x:number,base:number,len:number,flip=false){
 const Pr=BOOT_PROFILES.speed!,top=[...Pr.rim.filter(([s])=>s<.4),...Pr.hsec.filter(([s])=>s>=.4)];
 const X=(s:number)=>n1(flip?x+len-s*len:x+s*len),Y=(h:number)=>n1(base-h*len/2.7);
 let d=`M${X(0)} ${base}`;for(const [s,h] of top)d+=`L${X(s)} ${Y(h)}`;d+=`Q${X(1.02)} ${Y(.1)} ${X(.98)} ${base}Z`;
 const id=shape(d),studs=[.08,.2,.56,.72,.88].map(s=>`M${X(s)} ${base}v2`).join('');
 return hatch(id,'b')+line(id,1.6)+P(studs,1.8)+P(`M${X(.22)} ${Y(.62)}L${X(.6)} ${Y(.5)}M${X(.05)} ${n1(base-1.6)}H${X(.95)}`,1)+P(`M${X(.3)} ${Y(.58)}l1.2 -2M${X(.38)} ${Y(.56)}l1.2 -2M${X(.46)} ${Y(.54)}l1.2 -2`,.8);
}
/** A football shirt (number knocked out of the hatch), centre x, collar at y. */
function shirt(x:number,y:number,s:number,num:string,k:Hatch){
 const S=(v:number)=>n1(v*s);
 const id=shape(`M${n1(x-8*s)} ${n1(y+3*s)}L${n1(x-3*s)} ${n1(y)}Q${n1(x)} ${n1(y+2.6*s)} ${n1(x+3*s)} ${n1(y)}L${n1(x+8*s)} ${n1(y+3*s)}L${n1(x+10.5*s)} ${n1(y+8*s)}L${n1(x+6.8*s)} ${n1(y+9.6*s)}L${n1(x+6.8*s)} ${n1(y+19*s)}L${n1(x-6.8*s)} ${n1(y+19*s)}L${n1(x-6.8*s)} ${n1(y+9.6*s)}L${n1(x-10.5*s)} ${n1(y+8*s)}Z`);
 return {id,art:hatch(id,k)+line(id,1.3)+P(`M${n1(x-6.8*s)} ${n1(y+9.6*s)}l${S(-.6)} ${S(-3.4)}M${n1(x+6.8*s)} ${n1(y+9.6*s)}l${S(.6)} ${S(-3.4)}`,.8),
  num:txtO(x,n1(y+15.5*s),n1(9*s),num,' font-weight="900"')};
}

type Layer={art:string;occ?:string;pad?:number};
/** Back-to-front layers: each occluder masks everything drawn before it. */
function stack(layers:Layer[]){
 let body='',defs='',k=0;
 for(const L of layers){
  if(L.occ&&body){const id=`§m${k++}`;defs+=`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="${L.pad??2.6}">${L.occ}</g></mask>`;body=`<g mask="url(#${id})">${body}</g>`;}
  body+=L.art;}
 return {defs,body};
}
const occ=(...ids:string[])=>ids.map(id=>use(id)).join('');

const SCENES:Record<StampId,()=>Layer[]>={
 // North: the lighthouse on its rocks with its beams, the Kit Shop on the beach under a palm, and the ball riding a big wave.
 north:()=>{
  const c1=cloud(132,62,1.05),c2=cloud(50,70,.75);
  const rock=shape('M30 114L30 97Q38 92 46 94L52 89Q60 86 70 88L80 92Q88 95 92 104L96 114Z');
  const tower=shape('M60.5 92L63.6 57H72.4L75.5 92ZM59 54H77V57.4H59ZM63.4 45.6H72.6V54H63.4ZM62.4 45.6Q68 37.6 73.6 45.6Z');
  const bands=shape('M62.5 70H73.5L74.3 79H61.7ZM61.3 84H74.7L75.3 92H60.7ZM63.3 60.6H72.7L73.1 65.2H62.9Z');
  const shop=shape('M102 109V86H134V109ZM100 82H136V86H100Z');let aw='M101 92H133V96.5';for(let x=133;x>101.1;x-=4)aw+='q-2 2.8 -4 0';const awn=shape(aw+'Z');
  const pl=palm(97,112,40,-5,1);
  const wave=shape('M170 170V112.5Q158.5 96.4 140.1 96.4Q119.4 97.6 110.2 111.3Q105.6 120.6 111.3 127.5Q118.2 133.2 125.2 127.5Q128.6 122.8 124 119.4Q120.6 117.1 117.7 120Q118.2 112.5 127.5 110.2Q138.9 109.1 147 119.4Q153.9 130.9 149.3 142.4Q130.9 135.5 101 137.8Q66.5 140.1 43.5 133.2Q25.1 128.6 9 135.5V170Z');
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  let curls='';for(const [x,y,r] of [[147,98.6,2.2],[139,95.6,2.2],[131,95.4,2.1],[123.6,98,2],[117.2,102,1.9],[112.2,107.4,1.8]])curls+=`M${x-r} ${y+r}a${r} ${r} 0 1 1 ${r*1.6} ${-r*.4}`;
  return [
   {art:sky(64)+P('M67.8 50L34 37M67.8 50L34 59M67.8 50L90 41M67.8 50L90 56',.7)+P(bird(102,46)+bird(112,40,.8)+bird(92,38,.7),1)},
   {art:cloudArt(c1,132,62,1.05)+cloudArt(c2,50,70,.75),occ:occ(c1,c2)},
   {art:P('M30 98H170',1.2)+sea(101,108,3)},
   {art:hatch(rock,'d')+line(rock,1.5)+P('M46 94L50 102L47 109M70 88L66 97L71 104M82 93L80 101',.9),occ:occ(rock)},
   {art:hatch(bands,'x')+line(tower,1.5)+P('M60 54V50.4M63 54V50.4M66 54V50.4M70 54V50.4M73 54V50.4M76 54V50.4M58.6 50.4H77.4M66.3 45.6V54M69.7 45.6V54',.7)
    +dot(68,38.6,1.6)+P('M65.4 92V86.4Q68 83 70.6 86.4V92',1)+F('M66.6 74h2.8v3.4h-2.8z'),occ:occ(tower)},
   {art:hatch(shop,'s')+line(shop,1.5)+hatch(awn,'x')+line(awn,1)+txt(118,85.4,4.6,'KIT SHOP',' font-weight="900" letter-spacing=".6"')
    +P('M122 109V100H130V109M105 100H117V106H105ZM111 100V106',1)+F('M106.4 101.6l1.4 -.8h1.4l1.4 .8l.6 1.4l-1 .4v2h-2.8v-2l-1 -.4zM112.4 101.6l1.4 -.8h1.4l1.4 .8l.6 1.4l-1 .4v2h-2.8v-2l-1 -.4z')+dot(128.4,104.6,.6),occ:occ(shop,awn)},
   {art:pl.art,occ:occ(pl.id),pad:1.6},
   {art:P('M30 112H170',1.2)+HF('M30 112H170V118H30Z','s')+sea(121,134,3.2)},
   {art:hatch(wave,'h')+line(wave,1.6)+P(curls,1.1)+P('M158 112Q148 98 132 101M154 124Q148 110 136 109M150 136Q146 124 136 122M60 148Q90 152 118 148',.9),occ:occ(wave)},
   {art:ball(145,84.6,9)+P('M132 85q-3 -1 -5 -4M133 90q-4 0 -7 -2',.9),occ:circ(145,84.6,9)},
   {art:sea(150,166,3.4,.8)},
   {art:'',occ:occ(plate),pad:1},
  ];},
 // West Beach: Drip FC Stadium under a football sun: the roof truss, floodlight masts, flags, a full crowd, and the beach in front.
 west:()=>{
  const c1=cloud(48,62,.8),c2=cloud(156,58,.9);
  const roof=shape('M38 104Q100 72 162 104L158 108Q100 80 42 108Z');
  let truss='';for(let i=0;i<=20;i++){const t=i/20,x=40+120*t,yT=106-26*4*t*(1-t)-2,yB=yT+4.2;truss+=i%2?`L${n1(x)} ${n1(yB)}`:`L${n1(x)} ${n1(yT)}`;}
  const stand=shape('M42 108Q100 80 158 108V118H42Z'),wall=shape('M40 112H160V122H40Z');
  let arches='';for(let x=46;x<156;x+=8.6)arches+=`M${n1(x)} 122V${x>66&&x<130?120.6:117.4}a2.4 2.4 0 0 1 4.8 0V122`;
  const mast=(x:number)=>P(`M${x-2} 120L${x-1} 70M${x+2} 120L${x+1} 70`,1)+P(Array.from({length:9},(_,i)=>`M${x-2+i*.11} ${120-i*5.6}L${x+2-i*.11} ${114.4-i*5.6}`).join(''),.6)+P(`M${x-6} 63h12v7h-12z`,1.1)+F(`M${x-4.6} 64.4h2.2v1.8h-2.2zM${x-1.1} 64.4h2.2v1.8h-2.2zM${x+2.4} 64.4h2.2v1.8h-2.2zM${x-4.6} 67.2h2.2v1.8h-2.2zM${x-1.1} 67.2h2.2v1.8h-2.2zM${x+2.4} 67.2h2.2v1.8h-2.2z`);
  const flags=[70,100,130].map(x=>{const y=106-26*4*((x-40)/120)*(1-(x-40)/120)-2;return `M${x} ${n1(y)}v-9l6 2.2l-6 2.2`;}).join('');
  const pl=palm(56,152,38,8,1),umb=shape('M118 132Q134 118 150 132Q146 129.4 142 132Q138 129.4 134 132Q130 129.4 126 132Q122 129.4 118 132Z');
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  return [
   {art:sky(58)+rays(100,58,14,22,20,1.1)+P(bird(70,46)+bird(132,44,.8)+bird(124,50,.7),1)},
   {art:cloudArt(c1,48,62,.8)+cloudArt(c2,156,58,.9),occ:occ(c1,c2)},
   {art:ball(100,58,11.5),occ:circ(100,58,12)},
   {art:hatch(stand,'s')+P('M44 112Q100 88 156 112M46 115.6Q100 94 154 115.6',.8)+mast(46)+mast(154)+P(flags,.9)},
   {art:hatch(roof,'d')+line(roof,1.4)+P(`M40 106${truss}`,.7),occ:occ(roof)},
   {art:line(wall,1.4)+P(arches,1)+F('M70 112.6H130V118.4H70Z'),occ:occ(wall)},
   {art:'',occ:txtO(100,117.3,5.2,'DRIP FC',' font-weight="900" letter-spacing="1.2"'),pad:.2},
   {art:P('M30 124H170',1.4)+HF('M30 124H170V160H30Z','s')+sea(127,140,3,.85)+P('M30 141Q60 137 90 142T170 140',1)},
   {art:hatch(umb,'x')+line(umb,1.2)+P('M134 120V146M134 146l-3 0M128 146h12',1.2)+ball(152,142,4.4,1.2),occ:occ(umb)},
   {art:pl.art,occ:occ(pl.id),pad:1.6},
   {art:'',occ:occ(plate),pad:1},
  ];},
 // South: the South Bridge truss with the train crossing behind, the History Museum's columns (a football in its pediment),
 // the boardwalk on its piles, and the ball bobbing like a buoy.
 south:()=>{
  const c1=cloud(60,56,.8);
  let tr='M30 82H96M30 94H96';for(let x=30;x<=96;x+=7.4)tr+=`M${n1(x)} 82V94`;for(let x=30;x<96;x+=7.4)tr+=x<63?`M${n1(x)} 82L${n1(x+7.4)} 94`:`M${n1(x)} 94L${n1(x+7.4)} 82`;
  const tn=train(36,71,44,-1);
  let piers='';for(const x of [40,70])piers+=`M${x-2} 94V112M${x+2} 94V112`;
  const ped=shape('M92 64L126 50L160 64Z'),ent=shape('M92 64H160V71H92Z'),cols=shape('M96 72H104V100H96ZM107.5 72H115.5V100H107.5ZM119 72H127V100H119ZM130.5 72H138.5V100H130.5ZM142 72H150V100H142ZM153.5 72H161.5V100H153.5Z');
  let flutes='';for(const x of [96,107.5,119,130.5,142,153.5])flutes+=`M${x+2.7} 73.6V98.4M${x+5.3} 73.6V98.4`;
  const steps=shape('M90 100H164V103H90ZM87 103H167V106H87Z');
  const deck=shape('M30 106H170V111H30Z');let planks='';for(let x=32;x<170;x+=4.2)planks+=`M${n1(x)} 106V111`;
  let posts='';for(let x=36;x<170;x+=16)posts+=`M${x-1.2} 111V128M${x+1.2} 111V128`;
  let rail='';for(let x=36;x<170;x+=16)rail+=`M${x} 106V98`;
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  return [
   {art:sky(62)+rays(150,70,9,18,14,1,.2)+circ(150,70,6.4,1.2)+P(bird(110,42)+bird(122,38,.8)+bird(84,44,.7),1)},
   {art:cloudArt(c1,60,56,.8),occ:occ(c1)},
   {art:P('M30 112H170',1)+P(tr,.8)+P(piers,1.1)+line(tn.id,1.2)+tn.art},
   {art:hatch(ped,'b')+line(ped,1.4)+ball(126,58.6,4.2,1)+line(ent,1.4)+txt(126,69.8,5,'MUSEUM',' font-weight="900" letter-spacing=".8"')
    +hatch(cols,'d')+line(cols,1.2)+P(flutes,.6)+line(steps,1.1)+P('M108 50.6V47M126 44V40.4l4 1.6l-4 1.6',.9),occ:occ(ped,ent,cols,steps)},
   {art:line(deck,1.3)+P(planks,.6)+P(rail+'M30 99Q38 102 36 99Q44 102 52 99Q60 102 68 99Q76 102 84 99Q92 102 100 99Q108 102 116 99Q124 102 132 99Q140 102 148 99Q156 102 164 99',.9)+P(posts,1),occ:occ(deck)},
   {art:sea(114,164,3.1,.85)},
   {art:ball(70,132,8.6)+P('M54 140q16 6 32 0M58 144.6q12 4 24 0M62 149q8 2.6 16 0',1),occ:circ(70,132,9)},
   {art:P('M126 128q4 -3 8 0q4 -3 8 0M144 134q3 -2.4 6 0',.9)},
   {art:'',occ:occ(plate),pad:1},
  ];},
 // Summit Isle: the mountain with a goal on its peak, a football sun, a range behind, pines, the stone portal and the train out of it.
 summit:()=>{
  const c1=cloud(66,68,.9),c2=cloud(150,82,.7);
  const range=shape('M30 104L48 82L58 90L72 74L82 86V110H30ZM120 110L128 84L140 94L152 78L170 98V110Z');
  const mtn=shape('M40 118L72 86L84 92L100 52L118 80L128 74L160 112Z');
  const shade=shape('M100 52L118 80L128 74L160 112H104L106 92L98 80L104 70Z'),snow='M93.4 66.6L96.6 70.4L99.6 64.8L103.4 70.6L107 66.4';
  const goal='M93.4 51.8V44.4H106.6V51.8';
  const portal=shape('M66 128V112A16 16 0 0 1 98 112V128Z'),mouth=shape('M71.4 128V112.6A10.6 10.6 0 0 1 92.6 112.6V128Z');
  let vous='';for(let k=0;k<=8;k++){const a=Math.PI+Math.PI*k/8,c=Math.cos(a),s=Math.sin(a);vous+=`M${n1(82+c*10.6)} ${n1(112+s*10.6)}L${n1(82+c*16)} ${n1(112+s*16)}`;}
  const tn=train(28,112,40,-1);
  const p1=pine(140,128,26),p2=pine(152,130,20),p3=pine(128,131,16);
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  let grass='';for(let i=0;i<14;i++){const x=34+i*9.6+rnd()*3,y=140+rnd()*6;grass+=`M${n1(x)} ${n1(y)}l-1.4 -3.4M${n1(x)} ${n1(y)}l.4 -4M${n1(x)} ${n1(y)}l2 -3`;}
  return [
   {art:sky(70)+rays(142,52,12,19,16,1.1,.15)+P(bird(60,46)+bird(70,42,.8),1)},
   {art:ball(142,52,9.4)+P('M150 46q4 -2 6 1',.8),occ:circ(142,52,9.8)},
   {art:hatch(range,'h')+line(range,1),occ:occ(range)},
   {art:cloudArt(c2,150,82,.7),occ:occ(c2)},
   {art:hatch(shade,'d')+line(mtn,1.6)+P(snow,1)+P('M84 92L88 100M72 86L74 96M128 74L126 84M118 80L114 90M60 98l4 4M110 86l4 6',.8)+P(goal,1.2)+P('M95 45v6.8M97.6 45v6.8M100.2 45v6.8M102.8 45v6.8M105.4 45v6.8M93.4 47h13.2M93.4 49.6h13.2',.5)+ball(108.4,50,2.6,.8),occ:occ(mtn)},
   {art:cloudArt(c1,66,68,.9),occ:occ(c1)},
   {art:p1.art+p2.art+p3.art,occ:occ(p1.id,p2.id,p3.id),pad:1.6},
   {art:hatch(portal,'s')+line(portal,1.4)+P(vous,1)+hatch(mouth,'x')+line(mouth,1.2)+P('M62 128h40',1.4),occ:occ(portal)},
   {art:line(tn.id,1.3)+tn.art+P('M24 118q-4 -2 -8 0M24 122q-5 -1 -9 1',.8),occ:occ(tn.id)},
   {art:rails(130,30,170)+P('M30 136Q70 132 110 137T170 134',1)+P(grass,.8)+P('M120 146q2 -4 4 0M124 146a1.6 1.6 0 1 1 .1 0M46 148a1.4 1.4 0 1 1 .1 0',.8)},
   {art:'',occ:occ(plate),pad:1},
  ];},
 // Coral Cay: palms on the islet, the train on the causeway arches, the ball floating at the waterline, and the reef below.
 cay:()=>{
  const c1=cloud(140,56,.9);
  const islet=shape('M30 101Q52 86 92 101Z'),p1=palm(52,98,32,-6,.9),p2=palm(70,99,26,8,.85);
  const cause=shape('M92 88H170V101H92Z');let arch='';for(let x=96;x<170;x+=14)arch+=`M${x} 101V96a6 6 0 0 1 12 0V101`;
  const tn=train(104,76,48,1);
  const fish=(x:number,y:number,s:number,dir:number)=>{const id=shape(`M${n1(x)} ${n1(y)}q${n1(dir*5*s)} ${n1(-4.6*s)} ${n1(dir*10*s)} 0q${n1(-dir*5*s)} ${n1(4.6*s)} ${n1(-dir*10*s)} 0Zm${n1(dir*10*s)} 0l${n1(dir*3.4*s)} ${n1(-2.6*s)}v${n1(5.2*s)}z`);return hatch(id,'x')+line(id,1)+dot(x+dir*2.6*s,y-.6*s,.7);};
  const brain=shape('M130 143Q132 125 146 123Q160 125 162 143Z');
  let coral='M40 143V127M40 135l-5 -7M40 131l6 -8M68 143V134M68 137l-4 -5M68 136l5 -6';
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  const shell=shape('M71 122a9 5.6 0 1 0 18 0a9 5.6 0 1 0 -18 0Z'),fan=shape('M58 143L49 127Q58 117 67 127Z');
  return [
   {art:sky(66)+rays(48,50,8,15,14,1)+circ(48,50,5.4,1.2)+P(bird(96,46)+bird(106,52,.8),1)},
   {art:cloudArt(c1,140,56,.9),occ:occ(c1)},
   {art:P('M30 88H170',.9)+sea(91,96,2.6,.7)},
   {art:hatch(islet,'s')+line(islet,1.3)+p2.art+p1.art,occ:occ(islet,p1.id,p2.id),pad:1.4},
   {art:line(tn.id,1.2)+tn.art+P('M100 88V84M168 88V84M100 84H168',.7),occ:occ(tn.id)},
   {art:hatch(cause,'d')+line(cause,1.3)+P(arch,1.1)+P('M92 92H170',.7),occ:occ(cause)},
   {art:P('M30 102.6Q50 100 70 102.6T110 102.6T150 102.6T190 102.6',1.4)+sea(110,130,7,.6)+P('M30 143Q60 139 100 143T170 142',1.2)+HF('M30 144Q60 140 100 144T170 143V170H30Z','s')},
   {art:fish(122,126,1,1)+fish(152,111,.8,-1)+fish(48,112,.7,1)+circ(96,114,1.4,.8)+circ(98.6,109.4,1,.8)+circ(96.6,105.6,.8,.7)},
   {art:hatch(shell,'x')+line(shell,1.3)+circ(91.4,120.4,2.4,1.1)+P('M74 118l-5 -4.4l4 -.4M74 126l-5 4.4l4 .4M84 117.4l3 -5l1.4 3M84 126.6l3 5l1.4 -3M71 122l-3 .6',1.1)+P('M76 122h8M80 117v10',.7),occ:occ(shell)+circ(91.4,120.4,2.4),pad:1.6},
   {art:hatch(brain,'h')+line(brain,1.3)+P('M136 139q6 -8 12 -6q6 2 12 6M139 132q6 -5 14 0',.8)+P(coral,1.6)+hatch(fan,'x')+line(fan,1.1)+P('M58 143L53 126M58 143V121M58 143L63 126',.8)+P('M110 140l2 -4.6l2 4.6l-4.6 -2.8h5.2z',1)+P('M170 143q-4 -8 1 -14M76 143q-3 -6 2 -10',1.1),occ:occ(brain,fan),pad:1.6},
   {art:ball(112,101,8.2)+P('M98 103.4q4 2 8 0M118 103.4q4 2 8 0',1),occ:circ(112,101,8.6)},
   {art:'',occ:occ(plate),pad:1},
  ];},
 // Konbini: the shop front with its sign (reversed lettering), awning, shelves and sliding doors, a football nobori banner,
 // a cat on the step and the ball on the pavement.
 konbini:()=>{
  const c1=cloud(150,50,.8);
  const kp=palm(150,70,30,-4,.9),bld=shape('M44 124V60H156V124Z'),sign=shape('M40 54H160V66H40Z');
  let aw='M46 76H154V82';for(let x=154;x>46;x-=9)aw+='q-4.5 4.6 -9 0';const awn=shape(aw+'Z');
  const win=shape('M50 88H106V120H50Z'),door=shape('M112 88H150V124H112Z');
  let goods='M50 98H106M50 109H106';for(let i=0;i<5;i++)goods+=`M${53+i*7} 97l3.2 -5.4l3.2 5.4zM${53+i*7} 95.4h6.4`;
  for(let i=0;i<7;i++)goods+=`M${54+i*7.2} 108v-5.6q0 -1.4 1.2 -1.6v-1.2h1.4v1.2q1.2 .2 1.2 1.6v5.6z`;
  const ban=shape('M34 76H42V118H34Z');
  const cat=shape('M154 132q-1 -7 3 -9l-.6 -4l2.4 2.4q1.6 -.6 3.2 0l2.4 -2.4l-.6 4q4 2 3 9z');
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  let tiles='M30 128H170';for(let x=24;x<180;x+=12)tiles+=`M${100+(x-100)*.7} 128L${x} 170`;tiles+='M30 138H170';
  return [
   {art:sky(56)+rays(62,46,7,13,12,1)+circ(62,46,4.6,1.1)+P(bird(84,44)+bird(94,40,.8),1)},
   {art:cloudArt(c1,150,50,.8),occ:occ(c1)},
   {art:kp.art,occ:occ(kp.id),pad:1.4},
   {art:hatch(bld,'s')+line(bld,1.5)+use(sign,'fill="currentColor" stroke="none"')+P('M44 69H156M44 71.6H156',1.2)},
   {art:'',occ:txtO(100,63.4,9,'KONBINI',' font-weight="900" letter-spacing="2"'),pad:.4},
   {art:hatch(awn,'d')+line(awn,1.1)+P('M108 82V86M104.6 86h6.8',.8)},
   {art:F('M105 87h6v1h-6zM105 94.4h6v1h-6z')+P('M105.2 88.4q-1.4 3 0 6M110.8 88.4q1.4 3 0 6M108 88v7.4',.9)},
   {art:line(win,1.4)+P(goods,.8)+F('M58 114h10v-3.6h-10zM74 114h10v-3.6h-10zM90 114h10v-3.6h-10z')+P('M78 88V120',.7)},
   {art:hatch(door,'h')+line(door,1.4)+P('M131 88V124M127 104v6M135 104v6',1.2),occ:occ(door)},
   {art:F('M118 94h26v8h-26z'),pad:.4},
   {art:'',occ:txtO(131,100.6,5.4,'OPEN',' font-weight="900" letter-spacing=".6"'),pad:.3},
   {art:line(ban,1.2)+P('M33 72V128',1.6)+P('M33 76h10',1.2)+ball(38,90,3.4,1)+txt(38,103,5,'G',' font-weight="900"')+txt(38,110,5,'O',' font-weight="900"')+txt(38,117,5,'L',' font-weight="900"'),occ:occ(ban),pad:1.2},
   {art:P(tiles,.8)},
   {art:hatch(cat,'h')+line(cat,1.1)+P('M166 131q5 0 4 -6',1.1),occ:occ(cat),pad:1.2},
   {art:ball(96,134,7.4)+P('M84 132h-6M84 136h-8M85 128h-4',1),occ:circ(96,134,7.8)},
   {art:'',occ:occ(plate),pad:1},
  ];},
 // History Museum: an old laced leather ball on its cushion and a trophy, before the gallery's great arched window and columns.
 museum:()=>{
  const win=shape('M68 128V78A32 32 0 0 1 132 78V128Z');
  let glaze='M100 46V128M68 92H132M68 108H132';for(const x of [84,116])glaze+=`M${x} 50V128`;
  const colL=shape('M34 52H48V136H34Z'),colR=shape('M152 52H166V136H152Z');
  let flutes='';for(const x of [37.5,41,44.5,155.5,159,162.5])flutes+=`M${x} 56V132`;
  const floor=shape('M30 136H170V170H30Z');let tiles='';for(let x=-40;x<240;x+=14)tiles+=`M${100+(x-100)*.55} 136L${x} 170`;tiles+='M30 144H170M30 154H170';
  const cush=shape('M58 136Q60 126 84 126Q108 126 110 136Z');
  const leather=circ(84,110,20,2.2);
  const panels='M65 104Q84 96 103 104M65 116Q84 124 103 116M77 90.6Q71.6 110 77 129.4M91 90.6Q96.4 110 91 129.4';
  const lace='M84 93.4V106M80.4 95.6h7.2M80.4 98.8h7.2M80.4 102h7.2M80.4 105.2h7.2';
  const cup=shape('M118 78H146Q146 102 132 108Q118 102 118 78Z');
  const cupShade=shape('M132 78H146Q146 102 132 108Z');
  const base=shape('M124 116H140V121H124ZM120 121H144V128H120Z');
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  const drL=shape('M56 44Q70 50 68 74Q64 60 56 58Z'),drR=shape('M144 44Q130 50 132 74Q136 60 144 58Z');
  const lamp='M100 36V40M94 44h12M95 44l2 4h6l2 -4';
  return [
   {art:hatch(win,'h')+line(win,1.6)+P('M64 128V78A36 36 0 0 1 136 78V128',1)+P(glaze,.9)+P('M94 40l6 -4l6 4',1)},
   {art:hatch(colL,'h')+hatch(colR,'h')+line(colL,1.3)+line(colR,1.3)+P(flutes,.6)+P('M32 52H50M150 52H168M32 48H50M150 48H168',1.6)},
   {art:hatch(drL,'b')+hatch(drR,'b')+line(drL,1.1)+line(drR,1.1)+P('M54 44H146',1.6)+P(lamp,1)+P('M60 50q4 4 4 12M140 50q-4 4 -4 12',.7),occ:occ(drL,drR),pad:1.2},
   {art:hatch(floor,'s')+P(tiles,.7)+P('M30 136H170',1.6)},
   {art:P('M54 137V118M146 137V118M50 137h8M142 137h8',1.6)+dot(54,116.6,2)+dot(146,116.6,2)+P('M54 120Q66 132 80 128M146 120Q134 132 120 128',1.2)},
   {art:hatch(cush,'x')+line(cush,1.3)+P('M60 132q24 -4 48 0',.8),occ:occ(cush)},
   {art:leather+P(panels,1.6)+P(lace,1.3)+P('M70 102q2 -6 8 -9M72 120q4 4 8 5',.8),occ:circ(84,110,21)},
   {art:hatch(cupShade,'d')+line(cup,1.6)+P('M118 82Q108 82 110 92Q112 100 120 100M146 82Q156 82 154 92Q152 100 144 100',1.6)+P('M132 108V116',2.6)
    +use(base,'fill="url(#§x)" stroke="none"')+line(base,1.2)+ball(132,90,5,1)+P('M122 84H142',.8)+P('M150 70v6M147 73h6M114 66v4M112 68h4M156 104v4M154 106h4',.8),occ:occ(cup,base)},
   {art:'',occ:occ(plate),pad:1},
  ];},
 // Kit Shop: the ribbon sign, three kits on the rail (numbers knocked out), the wall of boots and the ball on its stand.
 shop:()=>{
  let slats='';for(let x=32;x<170;x+=5)slats+=`M${x} 36V140`;
  const rib=shape('M58 42H142L136 48L142 54H58L64 48Z');
  const s1=shirt(72,58,1,'7','d'),s2=shirt(100,56,1.08,'9','x'),s3=shirt(128,58,1,'10','b');
  const shelf='M38 96H162M38 122H162';
  const stand=shape('M92 140L96 130H104L108 140Z');
  const box1=shape('M136 124V110H160V124Z');
  const plate=shape('M74 143H126L129 148.6L126 154.2H74L71 148.6Z');
  return [
   {art:P(slats,.6)+P('M30 140H170',1.4)+HF('M30 140H170V170H30Z','s')},
   {art:line(rib,1.4)+txt(100,50.6,6.6,'KIT SHOP',' font-weight="900" letter-spacing="1.4"'),occ:occ(rib)},
   {art:P('M44 56H156M50 56V52M150 56V52',1.6)+P('M72 58v-3q0 -2.4 2.4 -2.4M100 56v-3q0 -2.4 2.4 -2.4M128 58v-3q0 -2.4 2.4 -2.4',.9)},
   {art:s1.art+s3.art,occ:occ(s1.id,s3.id),pad:1.6},
   {art:'',occ:s1.num+s3.num,pad:.3},
   {art:s2.art,occ:occ(s2.id),pad:1.6},
   {art:'',occ:s2.num,pad:.3},
   {art:P(shelf,1.8)+P('M42 96v4M158 96v4M42 122v4M158 122v4',1.2)},
   {art:hatch(shape('M76 121L80.6 106L85.4 121Z'),'h')+P('M74 121H87.4M76 121L80.6 106L85.4 121',1.2)+P('M78.4 113.4h4.4',1.6)},
   {art:boot(44,95,36)+boot(120,95,36,true)+boot(42,121,30)},
   {art:hatch(box1,'d')+line(box1,1.2)+P('M136 114H160',.8)+txt(148,121.6,4,'BOOTS',' font-weight="900"'),occ:occ(box1)},
   {art:hatch(stand,'h')+line(stand,1.2)+ball(100,121,9)+P('M112 112q4 -3 3 -8M88 112q-4 -3 -3 -8',.9),occ:occ(stand)+circ(100,121,9.4)},
   {art:'',occ:occ(plate),pad:1},
  ];},
};

/** The ornament band between the text and the scene: a different motif per stamp. */
type Band='rope'|'crest'|'beads'|'stars';
const BANDS:Record<StampId,Band>={north:'crest',west:'beads',south:'rope',summit:'stars',cay:'crest',konbini:'beads',museum:'rope',shop:'stars'};
/** n round dots on a circle of radius r (zero-length dashes with round caps: a few bytes for a whole ring). */
const dotRing=(r:number,n:number,size:number,phase=0)=>{const g=2*Math.PI*r/n;return `<circle cx="100" cy="100" r="${r}" stroke-width="${size}" stroke-dasharray="0 ${n1(g)}" stroke-dashoffset="${n1(-g*phase)}"/>`;};
function band(kind:Band){
 const R0=66.4,R1=71.6,at=(a:number,r:number)=>`${n1(100+Math.cos(a)*r)} ${n1(100+Math.sin(a)*r)}`;
 let d='',fills='';
 if(kind==='rope'){for(let i=0;i<72;i++){const a=i*Math.PI/36;d+=`M${at(a,R0+.4)}L${at(a+.08,R1-.4)}`;}return circ(100,100,R1,1)+P(d,.9);}
 if(kind==='crest'){for(let i=0;i<40;i++){const a=i*Math.PI/20,b=a+Math.PI/20;d+=`M${at(a,R0+.6)}Q${at(a+Math.PI/60,R1+.4)} ${at(b,R0+.6)}`;}return circ(100,100,R1+.6,.8)+P(d,1)+dotRing(R0+1.6,40,1.4,.5);}
 if(kind==='beads')return circ(100,100,R1,.9)+dotRing((R0+R1)/2,54,1.5)+dotRing((R0+R1)/2,18,2.5);
 for(let i=0;i<24;i++){const a=i*Math.PI/12,c=at(a,(R0+R1)/2).split(' ').map(Number),r=2;fills+=`M${n1(c[0])} ${n1(c[1]-r)}L${n1(c[0]+r*.32)} ${n1(c[1]-r*.32)}L${n1(c[0]+r)} ${n1(c[1])}L${n1(c[0]+r*.32)} ${n1(c[1]+r*.32)}L${n1(c[0])} ${n1(c[1]+r)}L${n1(c[0]-r*.32)} ${n1(c[1]+r*.32)}L${n1(c[0]-r)} ${n1(c[1])}L${n1(c[0]-r*.32)} ${n1(c[1]-r*.32)}Z`;
}
 return circ(100,100,R1,.9)+F(fills)+dotRing((R0+R1)/2,24,1.2,.5);
}
/** The station stamps' train glyph (3 o'clock on the ring) and the counter stamps' star. */
const trainGlyph=(x:number,y:number)=>P(`M${x-8} ${y+3}V${y-3}Q${x-8} ${y-5} ${x-6} ${y-5}H${x+5}Q${x+8} ${y-5} ${x+8} ${y-1}V${y+3}Z`,1.4)+F(`M${x-5.5} ${y-3.4}h3v2.6h-3zM${x-1} ${y-3.4}h3v2.6h-3zM${x-7} ${y}h14v1h-14z`)+dot(x-4.5,y+4.6,1.5)+dot(x+4.5,y+4.6,1.5);
const star=(x:number,y:number,r=6)=>F(`M${[0,1,2,3,4,5,6,7,8,9].map(i=>{const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.45:r;return `${n1(x+Math.cos(a)*k)} ${n1(y+Math.sin(a)*k)}`;}).join('L')}Z`);
const diamond=(a:number)=>{const x=100+Math.cos(a)*81.6,y=100+Math.sin(a)*81.6;return `M${n1(x)} ${n1(y-2.2)}l1.6 2.2l-1.6 2.2l-1.6 -2.2z`;};

/**
 * The standalone SVG for one stamp. `uid` keeps the ids unique when several stamps share a page; `date` (e.g. "24.11.26") is
 * written in the date plate (the book passes the stamping date; without it the plate is an empty date box).
 */
export function stampSvg(id:StampId,uid:string=id,date?:string):string{
 const def=stampById(id)!,index=STAMPS.indexOf(def),station=def.where==='station',u=`st-${uid}`;
 seed=index*977+13;shapes=[];
 const {defs:masks,body}=stack(SCENES[id]());
 const top=def.name.toUpperCase(),bottom=station?`ISLAND LINE · No.${index+1}`:'FUTBOL ISLAND';
 const fs=top.length>12?12.6:top.length>9?14:15.5;
 const ring=circ(100,100,95,4.2)+circ(100,100,90.8,1.1)+band(BANDS[id])+circ(100,100,66.2,2.4)
  +`<text font-size="${fs}" font-weight="900" letter-spacing="1.6" stroke="none" fill="currentColor"><textPath href="#${u}-t" startOffset="50%" text-anchor="middle">${top}</textPath></text>`
  +`<text font-size="9.6" font-weight="900" letter-spacing="1.3" stroke="none" fill="currentColor"><textPath href="#${u}-b" startOffset="50%" text-anchor="middle">${bottom}</textPath></text>`
  +(station?trainGlyph(181,99):star(181,100))+ball(19,100,6.4,1.4)+F([-.36,.36,Math.PI-.36,Math.PI+.36].map(diamond).join(''));
 const plate=P('M74 143H126L129 148.6L126 154.2H74L71 148.6Z',1.3)+P('M76.4 145.2H123.6L125.6 148.6L123.6 152H76.4L74.4 148.6Z',.6)
  +(date?txt(100,151,6.2,date,' font-weight="900" letter-spacing=".8"'):P('M84 151h6M97 151h6M110 151h6',.8)+F('M93 150.4h1.2v1.2h-1.2zM106 150.4h1.2v1.2h-1.2z'));
 const pats=`<pattern id="§d" width="2.7" height="2.7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V2.7" stroke="currentColor" stroke-width=".75"/></pattern>`
  +`<pattern id="§b" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><path d="M0 0V3" stroke="currentColor" stroke-width=".7"/></pattern>`
  +`<pattern id="§h" width="4" height="2.5" patternUnits="userSpaceOnUse"><path d="M0 1.2H4" stroke="currentColor" stroke-width=".65"/></pattern>`
  +`<pattern id="§x" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V2.6M0 0H2.6" stroke="currentColor" stroke-width=".7"/></pattern>`
  +`<pattern id="§s" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><circle cx=".8" cy=".8" r=".5" fill="currentColor"/><circle cx="2.4" cy="2.4" r=".42" fill="currentColor"/></pattern>`;
 const art=`<g id="§a">${ring}<g clip-path="url(#§c)">${body}</g>${plate}</g>`;
 const out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${def.name} stamp" style="color:${def.ink}" font-family="IslandBrush,'Arial Black',Impact,sans-serif">`
  +`<defs><path id="${u}-t" d="M22 100A78 78 0 0 1 178 100"/><path id="${u}-b" d="M16.4 100A83.6 83.6 0 0 0 183.6 100"/><clipPath id="§c"><circle cx="100" cy="100" r="65"/></clipPath>${pats}`
  +shapes.map((d,i)=>`<path id="§p${i}" d="${d}"/>`).join('')+masks
  +`<filter id="${u}-f" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">`
  +`<feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="${index*7+3}" result="n"/>`
  +`<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4.2 0 0 0 3.55" result="speck"/>`
  +`<feTurbulence type="fractalNoise" baseFrequency=".013" numOctaves="1" seed="${index*5+11}" result="p"/>`
  +`<feColorMatrix in="p" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.1 0 0 0 .46" result="press"/>`
  +`<feComposite in="speck" in2="press" operator="arithmetic" k1="1" result="mask"/>`
  +`<feComposite in="SourceGraphic" in2="mask" operator="in" result="ink"/>`
  +`<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${index+2}" result="w"/>`
  +`<feDisplacementMap in="ink" in2="w" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter>${art}</defs>`
  +`<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" filter="url(#${u}-f)">`
  +`<use href="#§a" opacity=".1" transform="translate(1.5 1)"/><use href="#§a"/></g></svg>`;
 return out.replace(/§/g,`${u}-`).replace(/([^\d.])0\.(\d)/g,'$1.$2');
}
