/**
 * Line Up! drawing (Nov 17 2026): two 2D canvases in the comic-print house style. `bg` is static (paper page, stand, the pitch with
 * mown bands and chalk lines, the empty squares, the tray shelf) and repaints only on resize. `fg` holds the balls, the ghost,
 * the dragged piece and the effects; it is drawn on demand (the shell asks for frames only while a finger drags or an effect runs).
 * Every ball type (and the referee tile) is pre-rendered once at the cell size (seven sprites; everything else scales them); piece slabs
 * are plain rects; effects are pooled. No three.js.
 * AAA pass (Nov 18 2026): a venue that changes with the level (VENUES), a stand of bean fans, floodlights, advert boards, the bench bay,
 * a magnetic snap, a lift that eases out of the bay, a kicked-ball clear that ripples from the piece, points that fly to the counter,
 * a glint on a ball just set down, paper bits from the stand, and an end that shows the gaps no shape fits.
 */
import {LU,SHAPES,KIT,KIT_DARK,type LineUp,type LineEvent,type TeamLine} from './core';

const INK='#231a2e',PAPER='#fff3d6',SKIN='#ffd9a8',SUN='#ffc83a',RED='#f0452e',CHALK='#eaf6e2';
/** How far (in cells) a piece may sit from a square where it fits and still be pulled onto it. */
const MAGNET=.62;
/** The run's chapters: the venue changes every third level. sky / sky2 (halftone) / orb (sun or moon) / page + dot / stand / grass bands. */
export const VENUES=[
 {name:'Morning',sky:'#9adcf0',sky2:'#c4ecf6',orb:'#ffe07a',page:'#ffcf7a',dot:'#f6b55c',stand:'#e9825c',ga:'#3f9a5c',gb:'#4aa868',night:false},
 {name:'Afternoon',sky:'#63bdea',sky2:'#8fd3f2',orb:'#fff3d6',page:'#ffc566',dot:'#f2a64a',stand:'#d96f52',ga:'#3a9458',gb:'#46a465',night:false},
 {name:'Sunset',sky:'#ff9e6b',sky2:'#ffc27a',orb:'#f0452e',page:'#f7a36c',dot:'#e98556',stand:'#b8506a',ga:'#3d8f5a',gb:'#489d63',night:false},
 {name:'Night',sky:'#2a2152',sky2:'#3b3170',orb:'#fff3d6',page:'#4a4382',dot:'#5a5298',stand:'#3b2f5e',ga:'#2f8058',gb:'#389066',night:true},
] as const;
export const venueFor=(level:number)=>Math.min(VENUES.length-1,Math.floor((Math.max(1,level)-1)/3));
export type LineupLayout={w:number;h:number;cell:number;bx:number;by:number;bw:number;trayY:number;trayH:number;slotW:number;
 /** the tray slots' centres */slots:{cx:number;cy:number}[]};
/** What the shell is dragging: slot, the piece's top-left in CSS px, the snapped cell (or null off the pitch) and whether it fits. */
export type LineupDrag={slot:number;x:number;y:number;cell:{x:number;y:number}|null;ok:boolean;rows:number[];cols:number[];team:TeamLine[];
 /** over the bench bay */bench:boolean;/** grabbed at (ms) from this place and cell size: the lift eases from there */t0:number;fx:number;fy:number;fs:number};
type Pop={i:number;kit:number;t0:number;delay:number;vx:number;vy:number;rot:number;team:boolean};
type Bit={on:boolean;x:number;y:number;vx:number;vy:number;t0:number;kit:number;ph:number};
type Spark={on:boolean;x:number;y:number;vx:number;vy:number;t0:number;life:number;color:string;r:number;spin:number};
type Fly={x0:number;y0:number;s0:number;t0:number};
type Slab={x:number;y:number;kit:number;r:boolean;d:boolean;rd:boolean};

export type LineupView=ReturnType<typeof createLineupView>;
export function createLineupView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean}){
 const N=LU.size,bx2=bg.getContext('2d')!,g=fg.getContext('2d')!;
 const L:LineupLayout={w:1,h:1,cell:32,bx:0,by:0,bw:256,trayY:0,trayH:100,slotW:80,slots:[{cx:0,cy:0},{cx:0,cy:0},{cx:0,cy:0},{cx:0,cy:0}]};
 let dpr=1,venue=0;const sprites=new Map<number,HTMLCanvasElement>();
 const shine=new Map<number,number>(),flies=new Map<number,Fly>(),flyers:{x0:number;y0:number;x1:number;y1:number;t0:number}[]=[],confetti:Bit[]=Array.from({length:32},()=>({on:false,x:0,y:0,vx:0,vy:0,t0:0,kit:0,ph:0}));let idleT0=-1e9,flashT0=-1e9,gapT0=-1e9;const gaps:number[]=[];
 const pops:Pop[]=[],squash=new Map<number,number>(),sparks:Spark[]=Array.from({length:64},()=>({on:false,x:0,y:0,vx:0,vy:0,t0:0,life:0,color:SUN,r:4,spin:0}));
 const refIn=new Map<number,number>(),flashes:{rows:number[];cols:number[];t0:number;team:TeamLine[]}[]=[];const group=new Int32Array(N*N);let gid=0,shakeT0=-1e9,shakeAmp=0,overT0=-1,dealT0=-1e9;
 const now=()=>performance.now();

 /** The referee blocker: a square tile with a bean in black and a yellow card. Not a ball, so it reads as "not yours" at a glance. */
 function refTile(c:CanvasRenderingContext2D,s:number){
  const lw=Math.max(1.4,s*.07),r=s*.2,p=s*.06;
  const rr=(x0:number,y0:number,w:number,h:number,rad:number)=>{c.beginPath();c.moveTo(x0+rad,y0);c.arcTo(x0+w,y0,x0+w,y0+h,rad);c.arcTo(x0+w,y0+h,x0,y0+h,rad);c.arcTo(x0,y0+h,x0,y0,rad);c.arcTo(x0,y0,x0+w,y0,rad);c.closePath();};
  rr(p,p,s-2*p,s-2*p,r);c.fillStyle=INK;c.fill();
  c.save();rr(p,p,s-2*p,s-2*p,r);c.clip();c.fillStyle='#000';c.beginPath();c.moveTo(s,s*.42);c.lineTo(s,s);c.lineTo(s*.3,s);c.closePath();c.fill();
  c.fillStyle='#3b3048';const step=Math.max(3,s*.13);for(let yy=s*.5;yy<s;yy+=step)for(let xx=s*.45;xx<s;xx+=step){const d=(xx+yy-s*.9)/s;if(d>0){c.beginPath();c.arc(xx+(yy/step%2)*step*.5,yy,Math.min(step*.36,d*step*.6),0,6.283);c.fill();}}c.restore();
  rr(p,p,s-2*p,s-2*p,r);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.moveTo(s*.36,s*.62);c.lineTo(s*.5,s*.74);c.lineTo(s*.64,s*.62);c.lineWidth=lw*.8;c.strokeStyle=SUN;c.stroke();
  c.beginPath();c.arc(s*.5,s*.4,s*.2,0,6.283);c.fillStyle=SKIN;c.fill();c.lineWidth=lw*.9;c.strokeStyle=INK;c.stroke();
  c.fillStyle=INK;c.beginPath();c.arc(s*.43,s*.39,Math.max(1,s*.032),0,6.283);c.arc(s*.57,s*.39,Math.max(1,s*.032),0,6.283);c.fill();
  c.beginPath();c.arc(s*.5,s*.44,s*.07,.2,Math.PI-.2);c.lineWidth=Math.max(1,lw*.55);c.stroke();
  c.save();c.translate(s*.8,s*.24);c.rotate(.25);c.fillStyle=SUN;c.fillRect(-s*.08,-s*.12,s*.16,s*.22);c.lineWidth=lw*.7;c.strokeRect(-s*.08,-s*.12,s*.16,s*.22);c.restore();
 }
 /**
  * One football on a transparent cell (Nov 18 2026, owner: "instead of blocks, can we have those be different types of soccer balls?").
  * Six original ball types, one per kit, each told apart by its PATTERN as well as its colour (colour-blind friendly):
  * 0 red star ball, 1 teal street ball (bold band), 2 gold trophy ball (equator band, sparkle), 3 orange laced leather ball,
  * 4 sky beach ball (curved wedges), 5 violet classic panel ball. Ink outline, flat colour, a halftone shade, a highlight.
  * Drawn once per kit and size into the sprite cache; never per frame.
  */
 function ball(c:CanvasRenderingContext2D,s:number,kit:number){
  const cx=s/2,cy=s/2,R=s*.43,lw=Math.max(1.4,s*.065),col=KIT[kit],dark=KIT_DARK[kit],W='#fffaf0';
  const circle=()=>{c.beginPath();c.arc(cx,cy,R,0,6.283);};
  const poly=(x:number,y:number,r:number,n:number,rot:number,inner=0)=>{c.beginPath();const m=inner?n*2:n;for(let i=0;i<m;i++){const a=rot+i*6.283/m,q=inner&&i%2?inner:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();};
  c.save();circle();c.clip();
  c.lineJoin='round';c.lineCap='round';
  if(kit===0){// star ball: red with one big paper star and a ring of small paper dots
   c.fillStyle=col;c.fillRect(0,0,s,s);
   poly(cx,cy,R*.66,5,-Math.PI/2,R*.28);c.fillStyle=W;c.fill();c.lineWidth=lw*.75;c.strokeStyle=INK;c.stroke();
   c.fillStyle=W;for(let i=0;i<5;i++){const a=Math.PI/2+i*6.283/5;c.beginPath();c.arc(cx+Math.cos(a)*R*.8,cy+Math.sin(a)*R*.8,R*.08,0,6.283);c.fill();}
  }else if(kit===1){// street ball: teal with one bold paper band and an ink stripe down its middle
   c.fillStyle=col;c.fillRect(0,0,s,s);
   c.save();c.translate(cx,cy);c.rotate(-.6);
   c.fillStyle=W;c.beginPath();c.ellipse(0,0,R*1.3,R*.3,0,0,6.283);c.fill();c.lineWidth=lw*.75;c.strokeStyle=INK;c.stroke();
   c.fillStyle=INK;c.beginPath();c.ellipse(0,0,R*1.3,R*.08,0,0,6.283);c.fill();
   c.restore();
  }else if(kit===2){// trophy ball: gold, a darker gold band at the equator with paper studs, a sparkle
   c.fillStyle=col;c.fillRect(0,0,s,s);
   c.fillStyle=dark;c.beginPath();c.ellipse(cx,cy+R*.05,R*1.1,R*.34,0,0,6.283);c.fill();
   c.fillStyle=col;c.beginPath();c.ellipse(cx,cy-R*.1,R*1.1,R*.26,0,0,6.283);c.fill();
   c.lineWidth=lw*.6;c.strokeStyle=INK;c.beginPath();c.ellipse(cx,cy+R*.05,R*1.1,R*.34,0,0,Math.PI);c.stroke();
   c.fillStyle=W;for(let i=-2;i<=2;i++){c.beginPath();c.arc(cx+i*R*.38,cy+R*.24-Math.abs(i)*R*.04,R*.07,0,6.283);c.fill();}
  }else if(kit===3){// retro leather ball: orange-brown panels with curved seams and a paper lace slot
   c.fillStyle=col;c.fillRect(0,0,s,s);
   c.strokeStyle=dark;c.lineWidth=lw*.8;
   for(const k of [-1,1]){c.beginPath();c.ellipse(cx+k*R*.95,cy,R*.62,R*1.2,0,0,6.283);c.stroke();}
   c.beginPath();c.moveTo(cx-R*.35,cy-R*.95);c.quadraticCurveTo(cx,cy-R*.75,cx+R*.35,cy-R*.95);c.moveTo(cx-R*.35,cy+R*.95);c.quadraticCurveTo(cx,cy+R*.75,cx+R*.35,cy+R*.95);c.stroke();
   c.fillStyle=W;c.beginPath();c.roundRect?.(cx-R*.13,cy-R*.46,R*.26,R*.92,R*.13);if(!c.roundRect)c.rect(cx-R*.13,cy-R*.46,R*.26,R*.92);c.fill();c.lineWidth=lw*.55;c.strokeStyle=INK;c.stroke();
   c.lineWidth=Math.max(1,lw*.5);c.beginPath();for(let i=0;i<4;i++){const y=cy-R*.33+i*R*.22;c.moveTo(cx-R*.22,y);c.lineTo(cx+R*.22,y+R*.1);c.moveTo(cx+R*.22,y);c.lineTo(cx-R*.22,y+R*.1);}c.stroke();
  }else if(kit===4){// beach ball: curved wedges from a top pole, sky and paper, a sun wedge
   c.fillStyle=W;c.fillRect(0,0,s,s);
   const px=cx-R*.15,py=cy-R*.62;const fills=[col,W,SUN,W,col,W];
   for(let i=0;i<6;i++){const a0=-.15+i*Math.PI/6*1.9,a1=a0+Math.PI/6*1.9;if(fills[i]===W)continue;
    const far=R*2.6,x0=px+Math.cos(a0+.4)*far,y0=py+Math.sin(a0+.4)*far,x1=px+Math.cos(a1+.4)*far,y1=py+Math.sin(a1+.4)*far;
    c.beginPath();c.moveTo(px,py);c.quadraticCurveTo(px+Math.cos(a0)*R,py+Math.sin(a0)*R,x0,y0);c.lineTo(x1,y1);c.quadraticCurveTo(px+Math.cos(a1)*R,py+Math.sin(a1)*R,px,py);c.closePath();
    c.fillStyle=fills[i];c.fill();c.lineWidth=lw*.55;c.strokeStyle=INK;c.stroke();}
   c.fillStyle=W;c.beginPath();c.arc(px,py,R*.15,0,6.283);c.fill();c.lineWidth=lw*.6;c.strokeStyle=INK;c.stroke();
  }else{// classic panel ball: paper with a violet centre pentagon, five edge pentagons and the seams between them
   c.fillStyle=W;c.fillRect(0,0,s,s);
   const rot=-Math.PI/2,pr=R*.3;c.lineWidth=lw*.55;c.strokeStyle=INK;
   c.beginPath();for(let i=0;i<5;i++){const a=rot+i*6.283/5;c.moveTo(cx+Math.cos(a)*pr,cy+Math.sin(a)*pr);c.lineTo(cx+Math.cos(a)*R*.66,cy+Math.sin(a)*R*.66);}c.stroke();
   for(let i=0;i<5;i++){const a=rot+Math.PI/5+i*6.283/5;poly(cx+Math.cos(a)*R*.9,cy+Math.sin(a)*R*.9,R*.3,5,a+Math.PI);c.fillStyle=col;c.fill();c.stroke();}
   poly(cx,cy,pr,5,rot);c.fillStyle=col;c.fill();c.stroke();
  }
  // shade: an ink-tinted crescent lower right with a halftone dot screen (the pattern still shows through)
  c.beginPath();c.arc(cx,cy,R*1.02,0,6.283);c.arc(cx-R*.3,cy-R*.34,R*1.08,0,6.283,true);c.fillStyle='rgba(35,26,46,.2)';c.fill('evenodd');
  c.fillStyle='rgba(35,26,46,.3)';const step=Math.max(2.6,s*.1);
  for(let yy=cy-R;yy<cy+R;yy+=step)for(let xx=cx-R;xx<cx+R;xx+=step){const x=xx+((Math.round((yy-cy)/step)&1)?step*.5:0),d=Math.hypot(x-cx+R*.3,yy-cy+R*.34)/R-.98;
   if(d>0&&Math.hypot(x-cx,yy-cy)<R){c.beginPath();c.arc(x,yy,Math.min(step*.34,d*step*1.6),0,6.283);c.fill();}}
  c.restore();
  circle();c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  // highlight
  c.fillStyle='#ffffff';c.globalAlpha=.9;c.beginPath();c.ellipse(cx-R*.42,cy-R*.46,R*.2,R*.11,-.75,0,6.283);c.fill();c.beginPath();c.arc(cx-R*.12,cy-R*.66,R*.05,0,6.283);c.fill();c.globalAlpha=1;
  if(kit===2){// the trophy ball's sparkle
   poly(cx+R*.62,cy-R*.62,R*.32,4,0,R*.09);c.fillStyle=W;c.fill();c.lineWidth=Math.max(1,lw*.5);c.strokeStyle=INK;c.stroke();}
 }
 /** One sprite per ball type (and one referee) at the pitch cell size. AAA pass (Nov 18 2026): the tray, the lift and the fly-back
  *  all scale that one image, so no sprite is ever made in the middle of a drag (before, every fly-back frame drew new ones). */
 function sprite(kit:number){let sp=sprites.get(kit);if(sp)return sp;const s=L.cell;
  sp=document.createElement('canvas');sp.width=sp.height=Math.ceil(s*dpr);const c=sp.getContext('2d')!;c.scale(dpr,dpr);if(kit<0)refTile(c,s);else ball(c,s,kit);sprites.set(kit,sp);return sp;}
 const blit=(kit:number,x:number,y:number,s:number,scale=1,alpha=1)=>{const sp=sprite(kit);g.globalAlpha=alpha;if(scale===1)g.drawImage(sp,x,y,s,s);else{const d=s*scale;g.drawImage(sp,x+(s-d)/2,y+(s-d)/2,d,d);}g.globalAlpha=1;};
 const spun=(kit:number,cx:number,cy:number,s:number,rot:number,alpha:number)=>{g.save();g.translate(cx,cy);g.rotate(rot);g.globalAlpha=alpha;g.drawImage(sprite(kit),-s/2,-s/2,s,s);g.restore();g.globalAlpha=1;};

 /** The static scene: sky, the stand of bean fans, floodlights, advert boards, the pitch, the tray shelf with the bench, a touchline strip.
  *  Painted on resize and when the venue changes (every third level: morning, afternoon, sunset, night). Never per frame. */
 function paintScene(){
  const c=bx2,W=L.w,H=L.h,V=VENUES[venue],{bx,by,bw,cell}=L,pad=Math.round(cell*.28);c.setTransform(dpr,0,0,dpr,0,0);
  const dots=(x0:number,y0:number,w:number,h:number,step:number,r:number,col:string)=>{c.fillStyle=col;for(let y=y0,k=0;y<y0+h;y+=step,k++)for(let x=x0+(k%2)*step*.5;x<x0+w;x+=step){c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}};
  c.fillStyle=V.page;c.fillRect(0,0,W,H);dots(0,0,W,H,9,1.5,V.dot);
  const board=Math.max(10,Math.round(cell*.46)),boardY=by-pad-board-5,standH=Math.max(0,Math.min(boardY,Math.max(34,cell*1.9))),standY=boardY-standH;
  // sky: flat colour, a halftone fade low down, the sun or the moon, clouds or stars
  if(standY>0){c.fillStyle=V.sky;c.fillRect(0,0,W,standY+4);dots(0,standY*.45,W,standY*.55+4,8,1.8,V.sky2);
   // the sun, the moon and the clouds need a tall sky: on a phone the score bar covers it, and a lone disc there reads as a button
   const tall=standY>=130,ox=W*.74,oy=standY*.5,or=Math.min(30,standY*.2);if(tall){c.beginPath();c.arc(ox,oy,or,0,6.283);c.fillStyle=V.orb;c.fill();c.lineWidth=2.5;c.strokeStyle=INK;c.stroke();if(V.night){c.beginPath();c.arc(ox+or*.4,oy-or*.25,or*.8,0,6.283);c.fillStyle=V.sky;c.fill();}}
   if(V.night){c.fillStyle=PAPER;for(let i=0;i<16;i++){c.beginPath();c.arc((i*97+31)%W,(i*53+11)%Math.max(1,standY),i%3?1.2:2,0,6.283);c.fill();}}
   else if(tall)for(const [cx,cy,k] of [[W*.2,standY*.34,1],[W*.5,standY*.7,.75]] as const){c.beginPath();c.arc(cx-16*k,cy,10*k,Math.PI*.5,Math.PI*1.5);c.arc(cx-4*k,cy-7*k,12*k,Math.PI,0);c.arc(cx+12*k,cy,10*k,Math.PI*1.5,Math.PI*.5);c.closePath();c.fillStyle=PAPER;c.fill();c.lineWidth=2;c.stroke();}}
  // the stand: rows of bean fans in the six ball colours, the back rows in shade
  if(standH>0){c.fillStyle=V.stand;c.fillRect(0,standY,W,standH);const r=Math.max(6,Math.min(9,cell*.2)),rows=Math.max(1,Math.floor(standH/(r*2)));
   for(let row=0;row<rows;row++){const y=standY+r*1.2+row*((standH-r*1.4)/rows);
    for(let i=-1;i*r*2.5<W+r;i++){const x=i*r*2.5+(row%2)*r*1.25,kit=(i*7+row*5+((i*i)%3))%6,k=kit<0?kit+6:kit;
     c.beginPath();c.arc(x,y,r,Math.PI,0);c.lineTo(x+r,y+r*1.7);c.lineTo(x-r,y+r*1.7);c.closePath();c.fillStyle=KIT[k];c.fill();c.lineWidth=1.6;c.strokeStyle=INK;c.stroke();
     c.fillStyle=INK;c.beginPath();c.arc(x-r*.34,y-r*.1,1.3,0,6.283);c.arc(x+r*.34,y-r*.1,1.3,0,6.283);c.fill();}
    if(row<rows-1){c.fillStyle=V.night?'rgba(20,14,40,.34)':'rgba(35,26,46,.16)';c.fillRect(0,standY,W,(y+r*.4)-standY);}}
   c.fillStyle=INK;c.fillRect(0,standY-2,W,3);}
  // floodlights on both corners of the stand (lit at night)
  for(const fx of [bx-pad+8,bx+bw+pad-8]){const ly=Math.max(4,standY-30);c.fillStyle=INK;c.fillRect(fx-2.5,ly,5,boardY-ly);c.fillRect(fx-15,ly-2,30,16);c.fillStyle=V.night?SUN:PAPER;for(let k=0;k<6;k++){c.beginPath();c.arc(fx-9+(k%3)*9,ly+3+Math.floor(k/3)*7,2.6,0,6.283);c.fill();}
   if(V.night){c.fillStyle='rgba(255,243,214,.09)';c.beginPath();c.moveTo(fx,ly+6);c.lineTo(fx<W/2?bx+bw*.75:bx+bw*.25,by+bw);c.lineTo(fx<W/2?bx-pad:bx+bw+pad,by+bw);c.closePath();c.fill();}}
  // advert boards along the touchline
  {const words=['LINE UP!','FILL THE LINE','KEEP YOUR SHAPE','LINE UP!'],fills=[PAPER,SUN,'#19b5a5',RED],w4=(bw+pad*2)/4;c.font=`italic 900 ${Math.round(board*.6)}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';
   for(let k=0;k<4;k++){const x=bx-pad+k*w4;c.fillStyle=fills[k];c.fillRect(x,boardY,w4,board);c.lineWidth=2.5;c.strokeStyle=INK;c.strokeRect(x,boardY,w4,board);c.fillStyle=k===3?PAPER:INK;c.fillText(words[k],x+w4/2,boardY+board/2+1,w4-8);}}
  // pitch board: ink frame, hard shadow, mown bands, chalk
  c.fillStyle=INK;c.fillRect(bx-pad+6,by-pad+6,bw+pad*2,bw+pad*2);c.fillStyle=V.gb;c.fillRect(bx-pad,by-pad,bw+pad*2,bw+pad*2);
  for(let r=0;r<N;r++){c.fillStyle=r%2?V.ga:V.gb;c.fillRect(bx,by+r*cell,bw,cell);}
  c.strokeStyle=CHALK;c.globalAlpha=.55;c.lineWidth=2;c.strokeRect(bx-pad*.5,by-pad*.5,bw+pad,bw+pad);c.beginPath();c.moveTo(bx-pad*.5,by+bw/2);c.lineTo(bx+bw+pad*.5,by+bw/2);c.stroke();
  c.beginPath();c.arc(bx+bw/2,by+bw/2,cell*1.2,0,6.283);c.stroke();c.strokeRect(bx+bw*.3,by-pad*.5,bw*.4,cell*1.1);c.strokeRect(bx+bw*.3,by+bw+pad*.5-cell*1.1,bw*.4,cell*1.1);c.globalAlpha=1;
  // empty squares: a darker inset each, so the grid reads without thin lines
  c.fillStyle='#00000026';for(let r=0;r<N;r++)for(let q=0;q<N;q++){const x=bx+q*cell+cell*.1,y=by+r*cell+cell*.1,s=cell*.8;c.beginPath();c.roundRect?.(x,y,s,s,cell*.16);if(!c.roundRect)c.rect(x,y,s,s);c.fill();}
  c.lineWidth=4;c.strokeStyle=INK;c.strokeRect(bx-pad,by-pad,bw+pad*2,bw+pad*2);
  // tray shelf: an inked paper strip with three bays, then the bench (a teal dugout bay with its name)
  const ty=L.trayY,th=L.trayH,tx=bx-pad,tw=bw+pad*2,bxn=tx+L.slotW*3;c.fillStyle=INK;c.fillRect(tx+6,ty+6,tw,th);c.fillStyle=PAPER;c.fillRect(tx,ty,tw,th);
  dots(tx+4,ty+4,tw-6,th-6,8,1.2,'#f3dfb0');c.fillStyle='#bfe9df';c.fillRect(bxn,ty,tx+tw-bxn,th);dots(bxn+4,ty+4,tx+tw-bxn-6,th-6,8,1.3,'#9fd9cc');
  c.lineWidth=4;c.strokeStyle=INK;c.strokeRect(tx,ty,tw,th);c.lineWidth=3;for(let k=1;k<3;k++){const x=tx+L.slotW*k;c.beginPath();c.moveTo(x,ty+10);c.lineTo(x,ty+th-10);c.stroke();}
  c.lineWidth=4;c.beginPath();c.moveTo(bxn,ty);c.lineTo(bxn,ty+th);c.stroke();
  {const fs=Math.max(10,Math.round(cell*.26)),lw=fs*4.1,lx=bxn+(tx+tw-bxn)/2;c.fillStyle=INK;c.fillRect(lx-lw/2,ty,lw,fs+7);c.fillStyle=PAPER;c.font=`800 ${fs}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('BENCH',lx,ty+fs*.5+3.5);}
  // the touchline under the tray, when the screen is tall enough: grass, a chalk line, training cones
  const gy=ty+th+Math.round(cell*.62);if(H-gy>cell*.9){c.fillStyle=V.ga;c.fillRect(0,gy,W,H-gy);for(let x=0,k=0;x<W;x+=cell,k++)if(k%2){c.fillStyle=V.gb;c.fillRect(x,gy,cell,H-gy);}
   c.fillStyle=INK;c.fillRect(0,gy-3,W,3);c.fillStyle=CHALK;c.globalAlpha=.7;c.fillRect(0,gy+Math.round(cell*.3),W,3);c.globalAlpha=1;
   for(const fxk of [.14,.3,.72,.88]){const x=W*fxk,y=gy+Math.min(H-gy-6,cell*1.25),s=cell*.3;c.beginPath();c.moveTo(x,y-s*1.5);c.lineTo(x+s*.8,y);c.lineTo(x-s*.8,y);c.closePath();c.fillStyle='#ff8a3c';c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();c.fillStyle=PAPER;c.fillRect(x-s*.36,y-s*.72,s*.72,s*.22);}}
 }

 const trayScale=(shape:number)=>{const d=SHAPES[shape];return Math.min(.7,(L.slotW*.88)/(d.w*L.cell),(L.trayH*.7)/(d.h*L.cell));};
 /** A tray piece's top-left in CSS px and its cell size there (slot 3 is the bench). */
 function trayRect(slot:number,shape:number){const d=SHAPES[shape],s=L.cell*trayScale(shape),c=L.slots[slot];return {x:c.cx-d.w*s/2,y:c.cy-d.h*s/2,s};}
 /**
  * The backing that makes a piece read as ONE shape: each ball sits on a rounded slab in its kit's dark colour, and slabs of
  * neighbouring cells of the same piece are bridged into one inked blob (two passes: ink grown by the outline width, then the
  * fill). Rects only, a few dozen per frame at most; the ball patterns themselves come from the sprite cache.
  */
 const slabBuf:Slab[]=Array.from({length:N*N},()=>({x:0,y:0,kit:0,r:false,d:false,rd:false}));
 const rrect=(x:number,y:number,w:number,h:number,r:number)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);g.fill();};
 function slabs(n:number,s:number,alpha=1){
  const p=s*.045,rad=s*.24,e=Math.max(1.5,s*.06);g.globalAlpha=alpha;
  for(let pass=0;pass<2;pass++){const o=pass?0:e;
   for(let k=0;k<n;k++){const q=slabBuf[k];g.fillStyle=pass?KIT_DARK[q.kit]:INK;
    rrect(q.x+p-o,q.y+p-o,s-2*p+2*o,s-2*p+2*o,rad+o);
    if(q.r)g.fillRect(q.x+s-p-rad,q.y+p-o,2*p+2*rad,s-2*p+2*o);
    if(q.d)g.fillRect(q.x+p-o,q.y+s-p-rad,s-2*p+2*o,2*p+2*rad);
    if(q.rd)g.fillRect(q.x+s-p-rad,q.y+s-p-rad,2*p+2*rad,2*p+2*rad);}}
  g.globalAlpha=1;
 }
 const setSlab=(k:number,x:number,y:number,kit:number,r:boolean,d:boolean,rd:boolean)=>{const q=slabBuf[k];q.x=x;q.y=y;q.kit=kit;q.r=r;q.d=d;q.rd=rd;};
 function drawPiece(shape:number,kit:number,x:number,y:number,s:number,alpha=1,lift=false,ballScale=1,ballAlpha=alpha){
  const d=SHAPES[shape],has=(cx:number,cy:number)=>d.cells.some(([a,b])=>a===cx&&b===cy);
  if(lift){g.fillStyle=INK;g.globalAlpha=.35;for(const [cx,cy] of d.cells)rrect(x+cx*s+s*.14,y+cy*s+s*.2,s*.88,s*.88,s*.24);g.globalAlpha=1;}
  d.cells.forEach(([cx,cy],k)=>setSlab(k,x+cx*s,y+cy*s,kit,has(cx+1,cy),has(cx,cy+1),has(cx+1,cy)&&has(cx,cy+1)&&has(cx+1,cy+1)));
  slabs(d.cells.length,s,alpha);
  for(const [cx,cy] of d.cells)blit(kit,x+cx*s,y+cy*s,s,ballScale,ballAlpha);
 }
 function spawnSparks(x:number,y:number,n:number,color:string,t:number){if(opts.reduced)n=Math.min(n,4);let made=0;for(const p of sparks){if(made>=n)break;if(p.on)continue;made++;
  const a=Math.random()*6.283,v=(opts.reduced?40:120)+Math.random()*260;Object.assign(p,{on:true,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,t0:t,life:.45+Math.random()*.35,color,r:L.cell*(.12+Math.random()*.12),spin:Math.random()*6});}}
 const star=(x:number,y:number,r:number,rot:number)=>{g.beginPath();for(let i=0;i<8;i++){const a=rot+i*Math.PI/4,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();};
 const back=(u:number)=>{const k=u-1;return 1+2.2*k*k*k+1.2*k*k;};// ease out with a small overshoot
 const tag=(text:string,x:number,y:number,fill:string,ink=INK)=>{g.font=`900 ${Math.max(11,Math.round(L.cell*.3))}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';const w=g.measureText(text).width+12,h=Math.max(16,L.cell*.44);
  x=Math.max(w/2+4,Math.min(L.w-w/2-4,x));g.fillStyle=INK;g.fillRect(x-w/2+2,y-h/2+2,w,h);g.fillStyle=fill;g.fillRect(x-w/2,y-h/2,w,h);g.lineWidth=2;g.strokeStyle=INK;g.strokeRect(x-w/2,y-h/2,w,h);g.fillStyle=ink;g.fillText(text,x,y+1);};

 return {
  get layout(){return L;},get venue(){return venue;},get spriteCount(){return sprites.size;},
  trayRect,trayScale,
  resize(w:number,h:number,ratio:number,topClear:number){
   dpr=ratio;L.w=w;L.h=h;sprites.clear();for(const c of [bg,fg]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
   // the pitch takes the width (a 16 px gutter) unless the height is short; the tray sits under it; both centred in what is left
   const room=h-topClear-16,cellW=(w-40)/(N+.6),cellH=room/(N+.6+3.8+.8),cell=Math.max(18,Math.floor(Math.min(cellW,cellH,64)));
   const bw=cell*N,pad=Math.round(cell*.28),trayH=Math.round(cell*3.5),gap=Math.round(cell*.75),total=bw+pad*2+gap+trayH;
   const by=Math.round(topClear+Math.max(8,(room-total)*.42)+pad);
   Object.assign(L,{cell,bw,bx:Math.round((w-bw)/2),by,trayY:by+bw+pad+gap,trayH,slotW:(bw+pad*2)/4});
   L.slots=[0,1,2,3].map(k=>({cx:L.bx-pad+L.slotW*(k+.5),cy:L.trayY+trayH/2+(k===3?Math.round(cell*.16):0)}));
   paintScene();
  },
  /** The venue follows the level (a new one every third level). Repaints the static scene only when it changes. */
  setLevel(level:number){const v=venueFor(level);if(v===venue)return false;venue=v;paintScene();flashT0=now();return true;},
  /** Board cell under a CSS point (or null). */
  cellAt(x:number,y:number){const cx=Math.floor((x-L.bx)/L.cell),cy=Math.floor((y-L.by)/L.cell);return cx>=0&&cy>=0&&cx<N&&cy<N?{x:cx,y:cy}:null;},
  /** Tray slot under a CSS point (generous: the whole bay; 3 is the bench), or -1. */
  slotAt(x:number,y:number){if(y<L.trayY-L.cell*.6||y>L.trayY+L.trayH+L.cell*.6)return -1;const k=Math.floor((x-(L.bx-Math.round(L.cell*.28)))/L.slotW);return k>=0&&k<4?k:-1;},
  /** Is this CSS point (the finger, not the lifted piece) inside the bench bay? Half a cell below the shelf's top edge, because a
   *  finger placing a piece on the bottom row of the pitch rests right on that edge. */
  overBench(x:number,y:number){const x0=L.bx-Math.round(L.cell*.28)+L.slotW*3;return x>=x0-L.cell*.1&&x<=x0+L.slotW+L.cell*.6&&y>=L.trayY+L.cell*.5&&y<=L.trayY+L.trayH+L.cell*.8;},
  /** Where a dragged piece would snap: forgiving at the edges (clamped while its middle is over the pitch). */
  snap(shape:number,x:number,y:number){const d=SHAPES[shape],c=L.cell,mx=x+d.w*c/2,my=y+d.h*c/2;if(mx<L.bx-c*.5||my<L.by-c*.5||mx>L.bx+L.bw+c*.5||my>L.by+L.bw+c*.5)return null;
   return {x:Math.max(0,Math.min(N-d.w,Math.round((x-L.bx)/c))),y:Math.max(0,Math.min(N-d.h,Math.round((y-L.by)/c)))};},
  /** Magnetic snap (AAA pass): the nearest square. When the piece does not fit there, a neighbouring square where it does fit
   *  wins if the piece is within MAGNET of a cell from it, so a drop a few pixels off still lands. The ghost shows the square used. */
  magnet(game:LineUp,shape:number,x:number,y:number){const cell=this.snap(shape,x,y);if(!cell||game.fits(shape,cell.x,cell.y))return cell;const c=L.cell,fx=(x-L.bx)/c,fy=(y-L.by)/c;let best=cell,bd=MAGNET;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=cell.x+dx,Y=cell.y+dy;if(!game.fits(shape,X,Y))continue;const dd=Math.hypot(X-fx,Y-fy);if(dd<bd){bd=dd;best={x:X,y:Y};}}
   return best;},
  onEvent(e:LineEvent){const t=now();
   if(e.type==='place'){gid++;for(const i of e.cells){squash.set(i,t);shine.set(i,t+150);group[i]=gid;}idleT0=-1e9;}
   else if(e.type==='clear'){const src=e.from.length?e.from:e.cells,teamOf=new Map<number,number>();
    for(const tl of e.team)for(let k=0;k<N;k++)teamOf.set(tl.col?k*N+tl.line:tl.line*N+k,tl.kit);
    e.cells.forEach((i,j)=>{const x=i%N,y=Math.floor(i/N);let d=99;for(const f of src)d=Math.min(d,Math.hypot(x-f%N,y-Math.floor(f/N)));const h=((i*2654435761)>>>0)/4294967296;
     pops.push({i,kit:Math.max(0,e.kits[j]??e.kit),t0:t,delay:opts.reduced?0:d*34,vx:(x<N/2?-1:1)*(40+h*150)*(h>.8?-1:1),vy:-(300+h*190),rot:(h-.5)*14,team:teamOf.has(i)});squash.delete(i);shine.delete(i);});
    for(const r of e.rows)for(let q=1;q<N;q+=3)spawnSparks(L.bx+(q+.5)*L.cell,L.by+(r+.5)*L.cell,2,q%2?SUN:PAPER,t);
    for(const q of e.cols)for(let r=1;r<N;r+=3)spawnSparks(L.bx+(q+.5)*L.cell,L.by+(r+.5)*L.cell,2,r%2?SUN:PAPER,t);
    flashes.push({rows:e.rows,cols:e.cols,t0:t,team:e.team});
    if(e.a>=2&&!opts.reduced){shakeT0=t;shakeAmp=Math.min(9,3+e.a*2);}
    if((e.a>=2||e.team.length)&&!opts.reduced){let n=0;for(const p of confetti){if(n>=(e.a>=3?28:16))break;if(p.on)continue;n++;p.on=true;p.x=Math.random()*L.w;p.y=L.by-L.cell*(1.2+Math.random()*1.4);p.vx=(Math.random()-.5)*60;p.vy=40+Math.random()*90;p.t0=t+Math.random()*180;p.kit=e.team.length?e.team[0].kit:Math.floor(Math.random()*6);p.ph=Math.random()*6;}}}
   else if(e.type==='refOn')for(const i of e.cells)refIn.set(i,t);
   else if(e.type==='deal')dealT0=t;
   else if(e.type==='over')overT0=t;
  },
  /** A failed drop, or a piece on its way to the bench or back: the piece flies to its bay from where it was (x, y, cell size). */
  flyBack(slot:number,x:number,y:number,s=L.cell){flies.set(slot,{x0:x,y0:y,s0:s,t0:now()});},
  /** Points fly from the pitch up to the counter (three stars, one after the other). */
  flyPoints(x:number,y:number,tx:number,ty:number,n:number){if(opts.reduced)return;const t=now();for(let k=0;k<Math.min(5,n);k++)flyers.push({x0:x+(k-1)*L.cell*.5,y0:y,x1:tx,y1:ty,t0:t+120+k*70});},
  /** Near miss: after a placement that cleared nothing, the one empty square of every line that is one ball short pulses once. */
  markGaps(game:LineUp){const s=game.state;gaps.length=0;for(let k=0;k<N;k++){let er=-1,nr=0,ec=-1,nc=0;for(let j=0;j<N;j++){const a=k*N+j,b=j*N+k;if(s.grid[a])nr++;else er=s.ref[a]?-2:er===-1?a:er;if(s.grid[b])nc++;else ec=s.ref[b]?-2:ec===-1?b:ec;}
    if(nr===N-1&&er>=0&&!gaps.includes(er))gaps.push(er);if(nc===N-1&&ec>=0&&!gaps.includes(ec))gaps.push(ec);}
   if(gaps.length)gapT0=now();return gaps.length;},
  /** One short wobble of the tray pieces (the shell asks for it once after a few idle seconds; nothing repeats). */
  nudge(){if(!opts.reduced)idleT0=now();},
  reset(){group.fill(0);pops.length=0;squash.clear();shine.clear();refIn.clear();flashes.length=0;flies.clear();flyers.length=0;gaps.length=0;overT0=-1;shakeT0=-1e9;idleT0=-1e9;flashT0=-1e9;for(const p of sparks)p.on=false;for(const p of confetti)p.on=false;if(venue!==0){venue=0;paintScene();}},
  /** Draws a frame. Returns true while something still moves (the shell keeps asking for frames). */
  render(game:LineUp,drag:LineupDrag|null,cursor:{slot:number;x:number;y:number}|null){
   const s=game.state,t=now(),c=L.cell;let busy=false;
   g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,L.w,L.h);
   let ox=0,oy=0;const sh=(t-shakeT0)/1000;if(sh<.3){busy=true;const k=(1-sh/.3)*shakeAmp;ox=Math.sin(t*.09)*k;oy=Math.cos(t*.11)*k*.6;}
   g.save();g.translate(ox,oy);
   // lines that the held piece would finish glow BEFORE the drop: sun yellow, or the ball's own colour for a team line
   const hint=drag&&drag.ok&&!drag.bench?drag:null;
   if(hint&&(hint.rows.length||hint.cols.length)){busy=true;const a=.42+.14*Math.sin(t*.012),tk=(line:number,col:boolean)=>hint.team.find(q=>q.line===line&&q.col===col);
    for(const r of hint.rows){const q=tk(r,false);g.fillStyle=q?KIT[q.kit]:SUN;g.globalAlpha=q?a+.2:a;g.fillRect(L.bx,L.by+r*c,L.bw,c);}
    for(const q0 of hint.cols){const q=tk(q0,true);g.fillStyle=q?KIT[q.kit]:SUN;g.globalAlpha=q?a+.2:a;g.fillRect(L.bx+q0*c,L.by,c,L.bw);}g.globalAlpha=1;}
   // balls on the pitch
   const lit=new Set<number>();if(hint){for(const r of hint.rows)for(let q=0;q<N;q++)lit.add(r*N+q);for(const q of hint.cols)for(let r=0;r<N;r++)lit.add(r*N+q);}
   // slabs under the balls: cells of the same piece are bridged (the piece a cell came from, or the same kit for a pitch with no history)
   const filled=(i:number)=>s.grid[i]!==0&&s.ref[i]===0,same=(i:number,j:number)=>filled(j)&&(group[i]&&group[j]?group[i]===group[j]:s.grid[i]===s.grid[j]);
   let ns=0;for(let i=0;i<N*N;i++){if(!filled(i))continue;const q=i%N,rgt=q<N-1&&same(i,i+1),dn=i+N<N*N&&same(i,i+N);
    setSlab(ns++,L.bx+q*c,L.by+Math.floor(i/N)*c,s.grid[i]-1,rgt,dn,rgt&&dn&&same(i,i+N+1)&&same(i+1,i+N+1));}
   slabs(ns,c);
   for(let i=0;i<N*N;i++){const x=L.bx+(i%N)*c,y=L.by+Math.floor(i/N)*c;
    if(s.ref[i]>0){const t0=refIn.get(i),a=t0===undefined?1:Math.min(1,(t-t0)/260);if(a<1)busy=true;const drop=(1-a)*(1-a);blit(-1,x,y-drop*c*1.4,c,1+.25*drop);
     g.fillStyle=s.ref[i]===1?SUN:PAPER;g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.arc(x+c*.82,y+c*.8,c*.17,0,6.283);g.fill();g.stroke();g.fillStyle=INK;g.font=`900 ${Math.round(c*.24)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(String(s.ref[i]),x+c*.82,y+c*.81);continue;}
    const v=s.grid[i];if(!v)continue;let sc=1;const t0=squash.get(i);if(t0!==undefined){const k=(t-t0)/180;if(k<1){busy=true;sc=1+.22*(1-k)*Math.cos(k*7);}else squash.delete(i);}
    if(lit.has(i))sc*=1.06+.04*Math.sin(t*.02+i);blit(v-1,x,y,c,sc);
    // a glint runs over a ball that was just set down (one pass, then it rests)
    const h0=shine.get(i);if(h0!==undefined){const k=(t-h0)/260;if(k>=1)shine.delete(i);else{busy=true;if(k>0&&!opts.reduced){g.globalAlpha=Math.sin(k*Math.PI)*.95;g.fillStyle='#fff';star(x+c*(.26+.5*k),y+c*(.24+.5*k),c*.2,k*2);g.fill();g.globalAlpha=1;}}}}
   // near miss: the last gap of a line that is one ball short (a sun ring that closes in on the square, once)
   {const u=(t-gapT0)/900;if(u<1&&gaps.length){busy=true;g.strokeStyle=SUN;g.lineWidth=3;for(const i of gaps){if(s.grid[i]||s.ref[i])continue;const x=L.bx+(i%N)*c,y=L.by+Math.floor(i/N)*c,k=opts.reduced?0:(1-Math.min(1,u*1.6))*c*.3;g.globalAlpha=Math.sin(Math.min(1,u)*Math.PI);g.beginPath();if(g.roundRect)g.roundRect(x+5-k,y+5-k,c-10+2*k,c-10+2*k,c*.2);else g.rect(x+5-k,y+5-k,c-10+2*k,c-10+2*k);g.stroke();}g.globalAlpha=1;}}
   // clear: the line flashes, then every ball is kicked off the pitch, rippling out from the piece that finished it; its slab breaks
   for(let k=flashes.length-1;k>=0;k--){const f=flashes[k],u=(t-f.t0)/240;if(u>=1){flashes.splice(k,1);continue;}busy=true;g.globalAlpha=(1-u)*.85;
    for(const r of f.rows){const q=f.team.find(z=>!z.col&&z.line===r);g.fillStyle=q?KIT[q.kit]:PAPER;g.fillRect(L.bx-c*.2,L.by+r*c+c*(.5-.5*(1-u)),L.bw+c*.4,c*(1-u));}
    for(const q0 of f.cols){const q=f.team.find(z=>z.col&&z.line===q0);g.fillStyle=q?KIT[q.kit]:PAPER;g.fillRect(L.bx+q0*c+c*(.5-.5*(1-u)),L.by-c*.2,c*(1-u),L.bw+c*.4);}g.globalAlpha=1;}
   for(let k=pops.length-1;k>=0;k--){const p=pops[k],el=t-p.t0-p.delay,u=el/460;if(u>=1){pops.splice(k,1);continue;}busy=true;const x=L.bx+(p.i%N)*c,y=L.by+Math.floor(p.i/N)*c;
    if(el<0){// waiting for the ripple: it sits on its slab and winds up just before the kick
     const w=Math.max(0,1+el/70);setSlab(0,x,y,p.kit,false,false,false);slabs(1,c);blit(p.kit,x,y,c,1+.16*w);continue;}
    if(opts.reduced){blit(p.kit,x,y,c,1,1-u);continue;}
    // the slab cracks and shrinks away
    if(u<.5){const v=u/.5;g.globalAlpha=1-v;g.fillStyle=KIT_DARK[p.kit];rrect(x+c*(.08+.3*v),y+c*(.08+.3*v),c*(.84-.6*v),c*(.84-.6*v),c*.2);g.strokeStyle=p.team?SUN:KIT[p.kit];g.lineWidth=Math.max(1,c*.11*(1-v));g.beginPath();g.arc(x+c/2,y+c/2,c*(.42+.5*v),0,6.283);g.stroke();g.globalAlpha=1;}
    const sec=el/1000;spun(p.kit,x+c/2+p.vx*sec,y+c/2+p.vy*sec+1500*sec*sec,c*(1+.5*Math.sin(Math.min(1,u*1.4)*Math.PI)),p.rot*sec,u>.7?(1-u)/.3:1);}
   // the end: the pitch dims from the bottom and the gaps that are left show in red, so it is clear no shape fits them
   if(s.over&&overT0>0){const u=Math.min(1,(t-overT0)/520);if(u<1)busy=true;g.fillStyle=INK;g.globalAlpha=.34;g.fillRect(L.bx,L.by+L.bw*(1-u),L.bw,L.bw*u);g.globalAlpha=.55+.35*Math.sin(t*.012);g.strokeStyle=RED;g.lineWidth=3;g.setLineDash([5,4]);
    for(let i=0;i<N*N;i++)if(!s.grid[i]&&!s.ref[i])g.strokeRect(L.bx+(i%N)*c+4,L.by+Math.floor(i/N)*c+4,c-8,c-8);g.setLineDash([]);g.globalAlpha=1;}
   // ghost: where the piece lands (or a red outline when it does not fit)
   const held=drag?game.pieceAt(drag.slot):null;
   if(drag&&drag.cell&&held&&!drag.bench){const d=SHAPES[held.shape];
    if(drag.ok){drawPiece(held.shape,held.kit,L.bx+drag.cell.x*c,L.by+drag.cell.y*c,c,.42,false,.86,.55);g.strokeStyle=PAPER;g.lineWidth=2.5;g.globalAlpha=.8+.2*Math.sin(t*.014);for(const [cx,cy] of d.cells){g.beginPath();if(g.roundRect)g.roundRect(L.bx+(drag.cell.x+cx)*c+3,L.by+(drag.cell.y+cy)*c+3,c-6,c-6,c*.22);else g.rect(L.bx+(drag.cell.x+cx)*c+3,L.by+(drag.cell.y+cy)*c+3,c-6,c-6);g.stroke();}g.globalAlpha=1;}
    else for(const [cx,cy] of d.cells){const x=L.bx+(drag.cell.x+cx)*c,y=L.by+(drag.cell.y+cy)*c;
     {const i=(drag.cell.y+cy)*N+drag.cell.x+cx,blocked=s.grid[i]!==0||s.ref[i]!==0;g.lineWidth=3;g.strokeStyle=RED;g.setLineDash([5,4]);g.strokeRect(x+3,y+3,c-6,c-6);g.setLineDash([]);
      if(blocked){g.beginPath();g.moveTo(x+c*.3,y+c*.3);g.lineTo(x+c*.7,y+c*.7);g.moveTo(x+c*.7,y+c*.3);g.lineTo(x+c*.3,y+c*.7);g.lineWidth=4;g.stroke();}}}}
   if(cursor&&!drag){const p=game.pieceAt(cursor.slot);if(p){const d=SHAPES[p.shape],ok=game.fits(p.shape,cursor.x,cursor.y);
    if(ok)drawPiece(p.shape,p.kit,L.bx+cursor.x*c,L.by+cursor.y*c,c,.4,false,.86,.5);
    else for(const [cx,cy] of d.cells){const x=L.bx+(cursor.x+cx)*c,y=L.by+(cursor.y+cy)*c;{g.lineWidth=3;g.strokeStyle=RED;g.setLineDash([5,4]);g.strokeRect(x+3,y+3,c-6,c-6);g.setLineDash([]);}}}}
   // a team line about to clear says so at its end
   if(hint)for(const q of hint.team)tag('TEAM LINE!',q.col?L.bx+(q.line+.5)*c:L.bx+L.bw-c*.9,q.col?L.by-c*.05:L.by+(q.line+.5)*c-c*.62,KIT[q.kit],q.kit===2||q.kit===3?INK:PAPER);
   g.restore();
   // the bench bay: lit when a dragged piece is over it, or when it is the way out of a stuck tray
   {const x0=L.bx-Math.round(c*.28)+L.slotW*3,on=!!(drag&&drag.bench),help=s.rescue&&!drag;if(on||help){busy=true;g.globalAlpha=on?.55:.3+.25*Math.sin(t*.008);g.fillStyle=SUN;g.fillRect(x0+2,L.trayY+2,L.slotW-4,L.trayH-4);g.globalAlpha=1;}
    if(!s.bench&&!(drag&&drag.bench)){g.strokeStyle=INK;g.globalAlpha=.4;g.lineWidth=2.5;g.setLineDash([6,5]);const w=Math.min(L.slotW*.56,c*1.5);g.strokeRect(L.slots[3].cx-w/2,L.slots[3].cy-w/2,w,w);g.setLineDash([]);g.globalAlpha=1;}}
   // tray and bench: pieces in their bays; ones that fit nowhere are faded with "No room"; a fresh tray pops in one bay after the other
   const idle=(t-idleT0)/1000;if(idle<.7)busy=true;
   for(let k=0;k<4;k++){const p=game.pieceAt(k);if(!p||(drag&&drag.slot===k))continue;const d=SHAPES[p.shape];let {x,y,s:ps}=trayRect(k,p.shape),pop=1,rot=0;
    const fl=flies.get(k);if(fl){const u=Math.min(1,(t-fl.t0)/190),e=1-(1-u)*(1-u)*(1-u);if(u<1){busy=true;const s1=ps;ps=fl.s0+(s1-fl.s0)*e;x=fl.x0+(x-fl.x0)*e;y=fl.y0+(y-fl.y0)*e-Math.sin(u*Math.PI)*c*.35;}else flies.delete(k);}
    else if(k<3){const du=(t-dealT0-k*70)/260;if(du<1){busy=true;pop=du<=0?0:opts.reduced?1:back(du);}}
    if(idle<.7&&!fl)rot=Math.sin(idle*22+k)*.09*(1-idle/.7);
    const fits=game.fitsAnywhere(p.shape);let dx=0;if(!fits&&overT0>0&&s.over){const u=(t-overT0)/600;if(u<1){busy=true;dx=Math.sin(u*40)*5*(1-u);}}
    if(pop<=0)continue;
    if(pop!==1||rot){g.save();const mx=x+d.w*ps/2,my=y+d.h*ps/2;g.translate(mx,my);g.rotate(rot);g.scale(pop,pop);drawPiece(p.shape,p.kit,-d.w*ps/2,-d.h*ps/2,ps,fits?1:.38);g.restore();}
    else drawPiece(p.shape,p.kit,x+dx,y,ps,fits?1:.38);
    if(cursor&&cursor.slot===k&&!drag){g.lineWidth=3;g.strokeStyle=INK;g.setLineDash([6,4]);g.strokeRect(x-6,y-6,d.w*ps+12,d.h*ps+12);g.setLineDash([]);}
    if(!fits&&!fl){const cx=L.slots[k].cx,cy=L.trayY+L.trayH-13;if(s.over)tag('No room',cx,cy,RED,PAPER);else{g.fillStyle=INK;g.font=`800 ${Math.max(11,Math.round(c*.28))}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('No room',cx,cy);}}}
   // the dragged piece: it grows out of its bay and rises above the finger (a short ease, never a jump), with a hard comic shadow
   if(drag&&held){const u=Math.min(1,(t-drag.t0)/110),e=1-(1-u)*(1-u),sz=drag.fs+(c-drag.fs)*e;drawPiece(held.shape,held.kit,drag.fx+(drag.x-drag.fx)*e,drag.fy+(drag.y-drag.fy)*e,sz,1,true);busy=true;}
   // points flying to the counter
   for(let k=flyers.length-1;k>=0;k--){const f=flyers[k],u=(t-f.t0)/520;if(u>=1){flyers.splice(k,1);continue;}busy=true;if(u<0)continue;const e=u*u*(3-2*u),x=f.x0+(f.x1-f.x0)*e+Math.sin(u*Math.PI)*c*.9*(k%2?1:-1),y=f.y0+(f.y1-f.y0)*e*e;
    star(x,y,c*(.2+.12*Math.sin(u*Math.PI)),u*9);g.fillStyle=SUN;g.fill();g.lineWidth=2;g.strokeStyle=INK;g.stroke();}
   // paper bits from the stand after a combo or a team line
   for(const p of confetti){if(!p.on)continue;const u=(t-p.t0)/1000;if(u<0){busy=true;continue;}if(u>1.5){p.on=false;continue;}busy=true;const x=p.x+p.vx*u+Math.sin(p.ph+u*7)*8,y=p.y+p.vy*u+90*u*u;
    g.save();g.translate(x,y);g.rotate(p.ph+u*8);g.globalAlpha=u>1.1?(1.5-u)/.4:1;g.fillStyle=KIT[p.kit];g.fillRect(-4,-2.5,8,5);g.lineWidth=1.2;g.strokeStyle=INK;g.strokeRect(-4,-2.5,8,5);g.restore();}
   // sparks
   for(const p of sparks){if(!p.on)continue;const u=(t-p.t0)/1000;if(u>=p.life){p.on=false;continue;}busy=true;const k=1-u/p.life,x=p.x+p.vx*u,y=p.y+p.vy*u+260*u*u;
    star(x+ox,y+oy,p.r*(.5+k*.6),p.spin+u*6);g.fillStyle=p.color;g.fill();g.lineWidth=1.6;g.strokeStyle=INK;g.stroke();}
   // a new venue: one paper flash over the page as the scene behind changes
   {const u=(t-flashT0)/420;if(u<1){busy=true;g.fillStyle=PAPER;g.globalAlpha=(1-u)*.7;g.fillRect(0,0,L.w,L.h);g.globalAlpha=1;}}
   return busy;
  },
  clear(){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,fg.width,fg.height);},
  dispose(){sprites.clear();},
 };
}
