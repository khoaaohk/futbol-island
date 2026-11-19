/**
 * Squad Snake renderer (Nov 10 2026, docs/arcade-aaa/snake-direction.md): 2D canvas, comic print (ink outline, flat colour, one
 * violet shadow band, Ben-Day dots). Two canvases: `bg` is the pitch between the stand and the coast at golden hour, painted ONCE
 * per resize and never again; `fg` holds only what moves and is the only thing redrawn. Every bean, tag and item is pre-rendered
 * into one atlas per resize. Pools for stars, popups and the crack: render() allocates nothing. No loop lives here: the component
 * calls render() from its own rAF while a round is on (menus, pause, results and a hidden tab draw nothing).
 */
import {SN,RAMP,POS,POS_COLOR,POS_DARK,POS_LABEL,CAUSE_WORD,DX,DY,shapeOfCode,type SnakeEvent,type SnakeState,type SquadSnake} from './core';
/** Level-up note (Nov 17 2026): what the new level brings, read from RAMP (one string a level, made once). */
const LEVEL_NOTES=RAMP.map((r,i)=>{const p=i?RAMP[i-1]:r;return i===RAMP.length-1?'Top speed!':r.cones>0&&!p.cones?'Training cones on the pitch':r.slide>0&&!p.slide?'Watch for the sliding tackle':r.press>p.press?(p.press?'One more pressing defender':'A pressing defender joins'):r.refs>p.refs?(p.refs?'One more referee':'A referee walks on'):r.cones>p.cones?'One more cone':'The captain runs faster';});
/** AAA pass (Nov 18 2026): the venue changes with the level (one static repaint a level): golden hour, dusk, night under the lights, morning.
 *  mow = the groundsman's pattern: 0 bands across, 1 bands along, 2 checks, 3 wide bands. */
const THEMES=[
 {sky:['#2f5fa8','#f08a5a','#ffcf7a'],disc:['#ff8a3c','#ffb03a','#ffc83a','#ffe9a8'],cloud:'#ffe2b8',stand:'#6b5a9a',crowd:'#ffb27a',ga:'#3f9a5c',gb:'#4aa868',apron:'#2f7d4a',sand:'#ffcf7a',sandDot:'#f0a45a',sea:'#19b5a5',deep:'#0f7f86',mow:0,night:false,sunX:.74},
 {sky:['#3b2f7a','#b0528f','#ff9a76'],disc:['#f0452e','#ff6a3c','#ff8a3c','#ffc83a'],cloud:'#f4b8c8',stand:'#57488a',crowd:'#ff9a9a',ga:'#3a8f63',gb:'#44a070',apron:'#2a7050',sand:'#f2b888',sandDot:'#d98a6a',sea:'#2a9aa8',deep:'#1c6a86',mow:1,night:false,sunX:.3},
 {sky:['#141a3c','#1f2a5c','#31407c'],disc:['#31407c','#5a6aa8','#c9d4f2','#fff3d6'],cloud:'#3c4a86',stand:'#3a3066',crowd:'#ffc83a',ga:'#2f8a66',gb:'#39987a',apron:'#226650',sand:'#b89a7a',sandDot:'#8f7260',sea:'#1f6f90',deep:'#17466e',mow:2,night:true,sunX:.72},
 {sky:['#4aa3d8','#8fd0ea','#d8f1e6'],disc:['#ffd98a','#ffe9a8','#fff3d6','#ffffff'],cloud:'#ffffff',stand:'#7a68b0',crowd:'#ffd0a0',ga:'#45a45a',gb:'#55b668',apron:'#33864a',sand:'#ffdc94',sandDot:'#f0b46a',sea:'#22c0b0',deep:'#12909a',mow:3,night:false,sunX:.5},
] as const;
export const SNAKE_THEMES=THEMES.length;
const LINE_WORD=['','ONE','TWO','THREE','FOUR','FIVE'] as const;
const levelNote=(level:number)=>LEVEL_NOTES[Math.max(1,Math.min(RAMP.length,level))-1];

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const SKIN='#ffd9a8';
type Ctx=CanvasRenderingContext2D;
const C=SN.cols,R=SN.rows;
const star=(c:Ctx,x:number,y:number,ro:number,ri:number,n:number,rot:number,sx=1)=>{c.beginPath();for(let i=0;i<n*2;i++){const r=i%2?ri:ro,a=rot+Math.PI*i/n;if(i)c.lineTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r);else c.moveTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r);}c.closePath();};
const capsule=(c:Ctx,x:number,y:number,w:number,h:number)=>{const r=w/2;c.beginPath();c.arc(x+r,y+r,r,Math.PI,0);c.lineTo(x+w,y+h-r);c.arc(x+r,y+h-r,r,0,Math.PI);c.closePath();};

/** Where the pitch sits on the page (CSS px). `top` is the room the bar and the team sheet need; `pad` keeps room for the d-pad
 *  (true = the old 176 px, or the px the shell measured from the docked pad to the visible bottom). */
export function snakeLayout(w:number,h:number,top:number,pad:boolean|number){
 const side=8,bottom=typeof pad==='number'?pad:pad?176:26,/* a number: the shell measured the docked d-pad's real room (Nov 11 2026) */cell=Math.max(12,Math.floor(Math.min((w-side*2)/C,(h-top-bottom)/R)*2)/2);
 const pw=cell*C,ph=cell*R,x0=Math.round((w-pw)/2),y0=Math.round(top);
 return {cell,x0,y0,pw,ph,free:h-y0-ph};
}

/* ---- sprites in unit space (1 = one cell, origin = the cell's centre) ---- */
const FOOT=.36;
/** kind: 0 captain, 1-4 team-mates, 5 pressing defender, 6 referee. */
function paintBean(c:Ctx,kind:number,num:number,cs:number){
 const shirt=kind<=4?POS_COLOR[kind]:kind===5?VIOLET:'#3a3048',dark=kind<=4?POS_DARK[kind]:kind===5?'#6b5a9a':INK;
 c.lineJoin='round';c.lineCap='round';
 c.fillStyle='rgba(35,26,46,.3)';c.beginPath();c.ellipse(.03,FOOT+.03,.3,.085,0,0,Math.PI*2);c.fill();
 c.fillStyle=INK;c.beginPath();c.ellipse(-.13,FOOT,.095,.06,0,0,Math.PI*2);c.ellipse(.13,FOOT,.095,.06,0,0,Math.PI*2);c.fill();
 // arms
 c.lineWidth=.05;c.strokeStyle=INK;c.fillStyle=kind===1?PAPER:shirt;for(const x of [-.3,.3]){c.beginPath();c.arc(x,.06,.078,0,Math.PI*2);c.fill();c.stroke();}
 if(kind===0){c.fillStyle=RED;c.fillRect(-.37,.0,.14,.07);}
 // body: face above, shirt below
 capsule(c,-.27,-.42,.54,.76);c.fillStyle=shirt;c.fill();c.save();capsule(c,-.27,-.42,.54,.76);c.clip();
 if(kind===5){c.fillStyle=dark;c.fillRect(-.4,.04,.8,.07);c.fillRect(-.4,.2,.8,.07);}
 c.fillStyle='rgba(72,48,120,.26)';c.fillRect(.1,-.5,.3,1);
 c.fillStyle=SKIN;c.beginPath();c.ellipse(0,-.3,.34,.24,0,0,Math.PI*2);c.fill();c.fillStyle='rgba(72,48,120,.2)';c.fillRect(.1,-.6,.3,.55);
 c.fillStyle=kind===6?INK:dark;c.beginPath();c.ellipse(0,-.47,.3,.1,0,0,Math.PI*2);c.fill();// hair / cap
 c.restore();
 capsule(c,-.27,-.42,.54,.76);c.lineWidth=.058;c.strokeStyle=INK;c.stroke();
 c.beginPath();c.moveTo(-.25,-.07);c.quadraticCurveTo(0,-.02,.25,-.07);c.lineWidth=.035;c.stroke();
 if(kind===5){c.lineWidth=.04;c.beginPath();c.moveTo(-.15,-.3);c.lineTo(-.04,-.25);c.moveTo(.15,-.3);c.lineTo(.04,-.25);c.stroke();}
 if(kind===6){c.fillStyle=SUN;c.lineWidth=.04;c.beginPath();c.rect(.24,-.34,.15,.2);c.fill();c.stroke();}
 const label=kind===0?'C':kind<=4?String(num):'';
 if(label){c.save();c.scale(1/cs,1/cs);c.fillStyle=INK;c.font=`italic 900 ${(.25*cs).toFixed(1)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(label,-.01*cs,.15*cs);c.restore();}
}
function paintBall(c:Ctx){
 c.fillStyle='rgba(35,26,46,.3)';c.beginPath();c.ellipse(.03,.27,.24,.07,0,0,Math.PI*2);c.fill();
 c.beginPath();c.arc(0,0,.25,0,Math.PI*2);c.fillStyle=PAPER;c.fill();c.save();c.clip();c.fillStyle='rgba(72,48,120,.26)';c.fillRect(.07,-.3,.3,.6);c.restore();
 c.strokeStyle=INK;c.fillStyle=INK;c.lineWidth=.035;c.lineCap='round';star(c,0,0,.1,.08,5,-Math.PI/2);c.fill();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.beginPath();c.moveTo(Math.cos(a)*.1,Math.sin(a)*.1);c.lineTo(Math.cos(a)*.24,Math.sin(a)*.24);c.stroke();}
 c.beginPath();c.arc(0,0,.25,0,Math.PI*2);c.lineWidth=.055;c.stroke();
}
function paintBoot(c:Ctx){
 star(c,0,0,.46,.36,10,.2);c.fillStyle=PAPER;c.fill();c.lineWidth=.035;c.strokeStyle=INK;c.lineJoin='round';c.stroke();
 c.save();c.scale(.3,.3);c.rotate(-.18);c.beginPath();c.moveTo(-1.08,-.62);c.lineTo(-.48,-.66);c.quadraticCurveTo(-.32,-.12,.25,-.08);c.quadraticCurveTo(.98,-.02,1.12,.38);c.lineTo(1.12,.56);c.lineTo(-1.08,.56);c.closePath();
 c.fillStyle=SUN;c.fill();c.lineWidth=.2;c.stroke();c.fillStyle=INK;for(const x of[-.85,-.35,.2,.75])c.fillRect(x,.56,.2,.24);c.restore();
}
function paintTag(c:Ctx,pos:number,cs:number){
 c.fillStyle=INK;c.fillRect(-.33,-.11,.72,.3);c.fillStyle=POS_COLOR[pos];c.fillRect(-.36,-.15,.72,.3);c.lineWidth=.045;c.strokeStyle=INK;c.lineJoin='miter';c.strokeRect(-.36,-.15,.72,.3);
 c.save();c.scale(1/cs,1/cs);c.fillStyle=INK;c.font=`900 ${(.2*cs).toFixed(1)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(POS_LABEL[pos],0,.012*cs);c.restore();
}
/** The training cone lives in a keeper slot no shirt uses (the keeper is always number 1), so the atlas did not grow. */
function paintCone(c:Ctx){
 c.lineJoin='round';c.fillStyle='rgba(35,26,46,.3)';c.beginPath();c.ellipse(.03,.33,.32,.08,0,0,Math.PI*2);c.fill();
 c.fillStyle=ORANGE;c.strokeStyle=INK;c.lineWidth=.055;c.beginPath();c.rect(-.3,.2,.6,.11);c.fill();c.stroke();
 const cone=()=>{c.beginPath();c.moveTo(-.2,.2);c.lineTo(-.06,-.32);c.lineTo(.06,-.32);c.lineTo(.2,.2);c.closePath();};
 cone();c.fill();c.save();c.clip();c.fillStyle=PAPER;c.fillRect(-.3,-.1,.6,.12);c.fillStyle='rgba(72,48,120,.26)';c.fillRect(.03,-.4,.3,.7);c.restore();cone();c.stroke();
}
const IDX_CONE=2,IDX_PRESS=45,IDX_REF=46,IDX_BALL=47,IDX_BOOT=48,IDX_TAG=48,ATLAS_COLS=9,ATLAS_N=53;
const beanIndex=(pos:number,num:number)=>pos===0?0:1+(pos-1)*11+Math.max(0,Math.min(10,num-1));

/* ---- the static page ---- */
function dots(c:Ctx,x:number,y:number,w:number,h:number,step:number,r:number,color:string,fadeDown=0){
 c.fillStyle=color;let row=0;for(let yy=y+step/2;yy<y+h;yy+=step,row++){const k=fadeDown?Math.max(.15,1-(fadeDown>0?(yy-y)/h:1-(yy-y)/h)):1;for(let xx=x+(row%2?step:step/2);xx<x+w;xx+=step){c.beginPath();c.arc(xx,yy,r*k,0,Math.PI*2);c.fill();}}
}
function paintScene(c:Ctx,W:number,H:number,L:{cell:number;x0:number;y0:number;pw:number;ph:number},dpr:number,pad:boolean,theme=0){
 const T=THEMES[theme%THEMES.length],u=dpr,cs=L.cell*u,px=L.x0*u,py=L.y0*u,pw=L.pw*u,ph=L.ph*u,bottom=py+ph;
 c.setTransform(1,0,0,1,0,0);c.lineJoin='round';
 // sky at golden hour, in flat bands with a dot turn between them
 const skyH=py;c.fillStyle=T.sky[0];c.fillRect(0,0,W,skyH*.42);c.fillStyle=T.sky[1];c.fillRect(0,skyH*.42,W,skyH*.3);c.fillStyle=T.sky[2];c.fillRect(0,skyH*.72,W,skyH*.3);
 dots(c,0,skyH*.28,W,skyH*.14,7*u,2.4*u,T.sky[1],-1);dots(c,0,skyH*.6,W,skyH*.12,7*u,2.4*u,T.sky[2],-1);
 if(T.night){c.fillStyle=PAPER;for(let i=0;i<26;i++){const a=i*2.399,x=(.5+.5*Math.cos(a*1.7))*W,y=(.5+.5*Math.sin(a*3.1))*skyH*.5;c.beginPath();c.arc(x,y,(i%3?1:1.7)*u,0,Math.PI*2);c.fill();}}
 // the sun: stacked discs
 const sx=W*T.sunX,sy=skyH*.78;if(T.night){for(const [r,i] of [[.2,1],[.15,2],[.12,3]] as const){c.fillStyle=T.disc[i];c.beginPath();c.arc(sx,skyH*.3,skyH*r,0,Math.PI*2);c.fill();}c.fillStyle=T.disc[2];c.beginPath();c.arc(sx-skyH*.04,skyH*.27,skyH*.025,0,Math.PI*2);c.arc(sx+skyH*.03,skyH*.33,skyH*.018,0,Math.PI*2);c.fill();}
 else [.62,.5,.38,.26].forEach((r,i)=>{c.fillStyle=T.disc[i];c.beginPath();c.arc(sx,sy,skyH*r,Math.PI,0);c.fill();});
 // cut clouds
 const cloud=(x:number,y:number,k:number)=>{c.beginPath();c.moveTo(x-30*k,y);c.quadraticCurveTo(x-28*k,y-14*k,x-12*k,y-12*k);c.quadraticCurveTo(x-4*k,y-26*k,x+10*k,y-14*k);c.quadraticCurveTo(x+28*k,y-16*k,x+30*k,y);c.closePath();c.fillStyle=T.cloud;c.fill();c.lineWidth=2.2*u;c.strokeStyle=INK;c.stroke();};
 cloud(W*.3,skyH*.34,u*1.1);cloud(W*.9,skyH*.5,u*.8);
 // the stand: a violet block of crowd dots with an ink roof, floodlights at both ends
 const standH=Math.min(46*u,skyH*.36),standY=py-standH-6*u;
 c.fillStyle=T.stand;c.beginPath();c.moveTo(0,standY+10*u);c.lineTo(W*.16,standY);c.lineTo(W*.84,standY);c.lineTo(W,standY+10*u);c.lineTo(W,py);c.lineTo(0,py);c.closePath();c.fill();c.lineWidth=3*u;c.strokeStyle=INK;c.stroke();
 dots(c,4*u,standY+9*u,W-8*u,standH-10*u,7*u,2.1*u,T.crowd);dots(c,7.5*u,standY+12.5*u,W-8*u,standH-14*u,14*u,2.1*u,PAPER);
 for(const mx of [W*.07,W*.93]){c.fillStyle=INK;c.fillRect(mx-1.5*u,standY-30*u,3*u,34*u);c.fillStyle=PAPER;c.fillRect(mx-11*u,standY-40*u,22*u,11*u);c.lineWidth=2.2*u;c.strokeRect(mx-11*u,standY-40*u,22*u,11*u);c.fillStyle=T.night?'#ffffff':SUN;for(let i=0;i<3;i++){c.beginPath();c.arc(mx-6*u+i*6*u,standY-34.5*u,2*u,0,Math.PI*2);c.fill();}
  if(T.night){c.fillStyle='rgba(255,243,214,.2)';c.beginPath();c.arc(mx,standY-34.5*u,20*u,0,Math.PI*2);c.fill();}}
 // below the pitch: sand, then the sea (tall phones); this is where the thumb swipes
 const sandY=bottom;c.fillStyle=T.sand;c.fillRect(0,sandY,W,H-sandY);dots(c,0,sandY+8*u,W,Math.min(60*u,H-sandY),8*u,1.7*u,T.sandDot,1);
 const freeH=H-bottom;
 if(freeH>96*u){const seaY=bottom+Math.min(freeH*.5,110*u);c.fillStyle=T.sea;c.fillRect(0,seaY,W,H-seaY);c.fillStyle=T.deep;c.fillRect(0,seaY+(H-seaY)*.55,W,H);
  dots(c,0,seaY+(H-seaY)*.42,W,(H-seaY)*.16,8*u,2.4*u,T.deep,-1);
  c.strokeStyle=PAPER;c.lineWidth=2.4*u;c.lineCap='round';c.beginPath();for(let x=-10*u;x<W+20*u;x+=34*u){c.moveTo(x,seaY+2*u);c.quadraticCurveTo(x+8.5*u,seaY-5*u,x+17*u,seaY+2*u);c.quadraticCurveTo(x+25.5*u,seaY+9*u,x+34*u,seaY+2*u);}c.stroke();
  c.strokeStyle=INK;c.lineWidth=2*u;c.beginPath();for(let x=-10*u;x<W+20*u;x+=34*u){c.moveTo(x,seaY-1.5*u);c.quadraticCurveTo(x+8.5*u,seaY-8.5*u,x+17*u,seaY-1.5*u);c.quadraticCurveTo(x+25.5*u,seaY+5.5*u,x+34*u,seaY-1.5*u);}c.stroke();
  const wave=(x:number,y:number,w:number)=>{c.strokeStyle=PAPER;c.lineWidth=2.2*u;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+w*.25,y-4*u,x+w*.5,y);c.quadraticCurveTo(x+w*.75,y+4*u,x+w,y);c.stroke();};
  wave(W*.12,seaY+(H-seaY)*.3,26*u);wave(W*.62,seaY+(H-seaY)*.22,30*u);wave(W*.4,seaY+(H-seaY)*.72,28*u);wave(W*.8,seaY+(H-seaY)*.66,22*u);
  // a small boat
  const bx=W*.2,by=seaY+(H-seaY)*.52;c.fillStyle=RED;c.strokeStyle=INK;c.lineWidth=2.4*u;c.beginPath();c.moveTo(bx-18*u,by);c.lineTo(bx+18*u,by);c.lineTo(bx+12*u,by+9*u);c.lineTo(bx-12*u,by+9*u);c.closePath();c.fill();c.stroke();
  c.fillStyle=PAPER;c.beginPath();c.moveTo(bx,by-2*u);c.lineTo(bx,by-26*u);c.lineTo(bx+14*u,by-2*u);c.closePath();c.fill();c.stroke();
  // corner flag and a few training cones on the sand
  const cone=(x:number,y:number,k:number)=>{c.fillStyle=ORANGE;c.strokeStyle=INK;c.lineWidth=2*u;c.beginPath();c.moveTo(x-7*k,y);c.lineTo(x-2*k,y-13*k);c.lineTo(x+2*k,y-13*k);c.lineTo(x+7*k,y);c.closePath();c.fill();c.stroke();c.fillStyle=PAPER;c.fillRect(x-4*k,y-8*k,8*k,3*k);};
  cone(W*.82,bottom+34*u,u);cone(W*.9,bottom+46*u,u*1.15);cone(W*.74,bottom+26*u,u*.85);
  // the thumb's place: a swipe compass printed on the sand (not drawn when the d-pad sits here)
  if(!pad){const hx=W/2,hy=bottom+Math.min(freeH*.5,110*u)*.5,r=22*u;c.globalAlpha=.55;c.fillStyle=PAPER;c.strokeStyle=INK;c.lineWidth=2.4*u;c.beginPath();c.arc(hx,hy,r*.42,0,Math.PI*2);c.fill();c.stroke();
   c.fillStyle=INK;for(let d=0;d<4;d++){const a=d*Math.PI/2,co=Math.cos(a),si=Math.sin(a);c.beginPath();c.moveTo(hx+co*r*1.45,hy+si*r*1.45);c.lineTo(hx+co*r*.8-si*r*.42,hy+si*r*.8+co*r*.42);c.lineTo(hx+co*r*.8+si*r*.42,hy+si*r*.8-co*r*.42);c.closePath();c.fill();}c.globalAlpha=1;}
 }
 // beside the pitch (only seen when the pitch is narrower than the page, e.g. with the d-pad on a short phone): training grass
 if(px>10*u){c.fillStyle='#35895a';c.fillRect(0,py,W,ph+1);dots(c,0,py,W,ph,9*u,1.6*u,'#2f7d4a');}
 // the pitch: apron, mown bands, a printed grid of small dots, paper lines, ink edge with a hard shadow
 c.fillStyle='rgba(35,26,46,.55)';c.fillRect(px-5*u,py-5*u+6*u,pw+16*u,ph+10*u);
 c.fillStyle=T.apron;c.fillRect(px-6*u,py-6*u,pw+12*u,ph+12*u);
 c.fillStyle=T.ga;c.fillRect(px,py,pw,ph);c.fillStyle=T.gb;
 if(T.mow===1){for(let k=1;k<C;k+=2)c.fillRect(px+k*cs,py,cs,ph);}else if(T.mow===2){for(let r=0;r<R;r++)for(let k=(r>>1)%2?0:2;k<C;k+=4)c.fillRect(px+k*cs,py+r*cs,Math.min(2,C-k)*cs,cs);}
 else for(let r=0;r<R;r++)if(T.mow===3?(r>>1)%2:r%2)c.fillRect(px,py+r*cs,pw,cs);
 if(T.night){c.fillStyle='rgba(255,243,214,.07)';for(const lx of [W*.07,W*.93]){c.beginPath();c.moveTo(lx,py-40*u);c.lineTo(px+pw*(lx<W/2?.72:.28),py+ph*.7);c.lineTo(px+pw*(lx<W/2?0:1),py+ph*.9);c.closePath();c.fill();}}
 c.fillStyle='rgba(35,26,46,.13)';for(let r=0;r<R;r+=2){const yy=py+r*cs+cs;for(let x=px+3*u;x<px+pw;x+=6*u){c.beginPath();c.arc(x,yy-2.2*u,1.05*u,0,Math.PI*2);c.fill();}}
 c.fillStyle='rgba(255,243,214,.3)';for(let r=1;r<R;r++)for(let k=1;k<C;k++){c.beginPath();c.arc(px+k*cs,py+r*cs,1.4*u,0,Math.PI*2);c.fill();}
 c.strokeStyle=PAPER;c.lineWidth=2.4*u;c.lineJoin='miter';c.strokeRect(px+1.2*u,py+1.2*u,pw-2.4*u,ph-2.4*u);
 const mx=px+pw/2,my=py+ph/2;c.beginPath();c.moveTo(px,my);c.lineTo(px+pw,my);c.stroke();c.beginPath();c.arc(mx,my,cs*1.6,0,Math.PI*2);c.stroke();c.fillStyle=PAPER;c.beginPath();c.arc(mx,my,3*u,0,Math.PI*2);c.fill();
 for(const end of [0,1]){const y=end?py+ph:py,sgn=end?-1:1;c.strokeRect(mx-cs*3,Math.min(y,y+sgn*cs*2.5),cs*6,cs*2.5);c.strokeRect(mx-cs*1.5,Math.min(y,y+sgn*cs),cs*3,cs);
  c.beginPath();c.arc(mx,y+sgn*cs*2.5,cs*.9,end?Math.PI:0,end?0:Math.PI);c.stroke();
  // the goal, out past the goal line
  c.fillStyle=PAPER;c.strokeStyle=INK;c.lineWidth=2.2*u;const gy=end?y+1.5*u:y-9*u;c.fillRect(mx-cs*1.2,gy,cs*2.4,7.5*u);c.strokeRect(mx-cs*1.2,gy,cs*2.4,7.5*u);c.lineWidth=1*u;c.beginPath();for(let k=1;k<8;k++){c.moveTo(mx-cs*1.2+k*cs*.3,gy);c.lineTo(mx-cs*1.2+k*cs*.3,gy+7.5*u);}c.stroke();c.strokeStyle=PAPER;c.lineWidth=2.4*u;}
 for(const [cx,cy,a] of [[px,py,0],[px+pw,py,Math.PI/2],[px+pw,py+ph,Math.PI],[px,py+ph,-Math.PI/2]] as const){c.beginPath();c.arc(cx,cy,cs*.4,a,a+Math.PI/2);c.stroke();}
 c.strokeStyle=INK;c.lineWidth=3.5*u;c.strokeRect(px-6*u,py-6*u,pw+12*u,ph+12*u);
}

const MAX_STARS=72,MAX_POPS=10,MAX_GHOSTS=3,CRACK_N=7,CRACK_SEG=6;
export type SnakeView=ReturnType<typeof createSnakeView>;
export function createSnakeView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced?:boolean}={}){
 const b=bg.getContext('2d',{alpha:false})!,f=fg.getContext('2d')!,atlas=document.createElement('canvas'),a=atlas.getContext('2d')!;
 const reduced=!!opts.reduced;
 let W=1,H=1,dpr=1,cs=10,ox=0,oy=0,S=8,time=0,L=snakeLayout(390,844,112,false),theme=0,padOn=false,lastTick=-1,lastMoved=-1;
 // pools
 const stars=Array.from({length:MAX_STARS},()=>({on:false,x:0,y:0,vx:0,vy:0,t:0,life:.5,r:4,color:SUN,/** 0 star, 1 confetti, 2 dust */kind:0}));
 const pops=Array.from({length:MAX_POPS},()=>({on:false,x:0,y:0,t:0,text:'',color:PAPER,big:false,/** flies up to the score counter */fly:false}));
 /** A bean sent back by the referee, or a cone knocked flying: one tumbling sprite. */
 const ghosts=Array.from({length:MAX_GHOSTS},()=>({on:false,x:0,y:0,vx:0,vy:0,t:0,idx:0}));
 const hop=new Float32Array(SN.maxLine).fill(-9);
 const word={on:false,t:0,dur:1,text:'',sub:'',note:'',fill:SUN,burst:RED,x:0,y:0,size:1};
 const pulse=new Float32Array(SN.maxLine).fill(-9),crack=new Float32Array(CRACK_N*CRACK_SEG*2);
 const fx={crackT:-1,crackX:0,crackY:0,shake:0,flash:0,skid:0,save:0,dashGlow:0};
 let lcg=99;const rnd=()=>{lcg=(lcg*1664525+1013904223)>>>0;return lcg/4294967296;};
 const cx=(cell:number)=>ox+(cell+.5)*cs,cy=(cell:number)=>oy+(cell+.5)*cs;
 function burst(x:number,y:number,n:number,color:string,speed=1){
  if(reduced)n=Math.min(n,3);for(let i=0,k=0;i<stars.length&&k<n;i++){const p=stars[i];if(p.on)continue;const an=rnd()*Math.PI*2,v=(1.4+rnd()*2.4)*cs*speed;p.on=true;p.x=x;p.y=y;p.vx=Math.cos(an)*v;p.vy=Math.sin(an)*v-cs;p.t=0;p.life=.32+rnd()*.25;p.r=cs*(.1+rnd()*.1);p.color=color;p.kind=0;k++;}
 }
 const CONFETTI=[SUN,RED,TEAL,PAPER,ORANGE] as const;
 function confetti(n:number){if(reduced)return;for(let i=0,k=0;i<stars.length&&k<n;i++){const p=stars[i];if(p.on)continue;p.on=true;p.kind=1;p.x=ox+rnd()*cs*C;p.y=oy-cs*(.5+rnd()*2.5);p.vx=(rnd()-.5)*cs*1.2;p.vy=cs*(3.5+rnd()*3);p.t=0;p.life=1.1+rnd()*.5;p.r=cs*(.1+rnd()*.07);p.color=CONFETTI[k%CONFETTI.length];k++;}}
 function dust(x:number,y:number,n:number){if(reduced)return;for(let i=0,k=0;i<stars.length&&k<n;i++){const p=stars[i];if(p.on)continue;p.on=true;p.kind=2;p.x=x+(rnd()-.5)*cs*.3;p.y=y+cs*.3;p.vx=(rnd()-.5)*cs*.8;p.vy=-cs*(.2+rnd()*.5);p.t=0;p.life=.3+rnd()*.2;p.r=cs*(.09+rnd()*.07);p.color=PAPER;k++;}}
 function fling(idx:number,x:number,y:number,vx:number){for(const g of ghosts){if(g.on)continue;g.on=true;g.x=x;g.y=y;g.vx=vx;g.vy=-cs*7;g.t=0;g.idx=idx;return;}}
 /** Banners sit at the end of the pitch the captain is NOT in, so a word never hides the next few cells. */
 const bannerY=(s:SnakeState)=>s.ys[0]>=R/2?oy+cs*1.6:oy+cs*(R-2.7);
 function pop(x:number,y:number,text:string,color:string,big=false,fly=false){for(const p of pops){if(p.on)continue;p.on=true;p.x=x;p.y=y;p.t=0;p.text=text;p.color=color;p.big=big;p.fly=fly&&!reduced;return;}}
 function say(text:string,sub:string,note:string,fill:string,burstColor:string,dur:number,x:number,y:number,size:number){word.on=true;word.t=0;word.dur=dur;word.text=text;word.sub=sub;word.note=note;word.fill=fill;word.burst=burstColor;word.x=x;word.y=y;word.size=size;}

 function resize(cssW:number,cssH:number,ratio:number,top:number,pad:boolean|number){
  dpr=ratio;W=Math.max(1,Math.round(cssW*dpr));H=Math.max(1,Math.round(cssH*dpr));L=snakeLayout(cssW,cssH,top,pad);cs=L.cell*dpr;ox=L.x0*dpr;oy=L.y0*dpr;
  for(const cv of [bg,fg]){cv.width=W;cv.height=H;}
  padOn=pad!==false;paintScene(b,W,H,L,dpr,padOn,theme);
  S=Math.ceil(cs*1.5)+2;atlas.width=S*ATLAS_COLS;atlas.height=S*Math.ceil(ATLAS_N/ATLAS_COLS);a.setTransform(1,0,0,1,0,0);a.clearRect(0,0,atlas.width,atlas.height);
  for(let i=0;i<ATLAS_N;i++){a.setTransform(cs,0,0,cs,(i%ATLAS_COLS)*S+S/2,Math.floor(i/ATLAS_COLS)*S+S/2);
   if(i===IDX_CONE)paintCone(a);else if(i===0)paintBean(a,0,0,cs);else if(i<45)paintBean(a,1+Math.floor((i-1)/11),1+(i-1)%11,cs);else if(i===IDX_PRESS)paintBean(a,5,0,cs);else if(i===IDX_REF)paintBean(a,6,0,cs);else if(i===IDX_BALL)paintBall(a);else if(i===IDX_BOOT)paintBoot(a);else paintTag(a,i-IDX_TAG,cs);}
  a.setTransform(1,0,0,1,0,0);
 }
 /** One atlas sprite, feet-anchored so a squash stays on the grass. look: direction the eyes point (-1 = no eyes). */
 function sprite(i:number,x:number,y:number,rot:number,sx:number,sy:number,look:number){
  const foot=FOOT*cs,co=Math.cos(rot),si=Math.sin(rot);f.setTransform(co*sx,si*sx,-si*sy,co*sy,x,y+foot);
  f.drawImage(atlas,(i%ATLAS_COLS)*S,Math.floor(i/ATLAS_COLS)*S,S,S,-S/2,-S/2-foot,S,S);
  if(look>=0){const lx=DX[look]*.045*cs,ly=DY[look]*.035*cs,ey=-.27*cs-foot+ly,r=.036*cs;f.fillStyle=INK;f.beginPath();f.arc(-.09*cs+lx,ey,r,0,Math.PI*2);f.arc(.09*cs+lx,ey,r,0,Math.PI*2);f.fill();}
 }
 const plain=()=>f.setTransform(1,0,0,1,0,0);
 function lettering(text:string,x:number,y:number,px:number,fill:string,tilt:number){
  f.setTransform(1,0,0,1,x,y);f.rotate(tilt);f.font=`italic 900 ${px}px "Arial Black",Impact,sans-serif`;f.textAlign='center';f.textBaseline='middle';f.lineJoin='round';
  f.fillStyle=INK;f.fillText(text,px*.07,px*.09);f.lineWidth=px*.22;f.strokeStyle=INK;f.strokeText(text,0,0);f.fillStyle=fill;f.fillText(text,0,0);
 }
 function caption(text:string,x:number,y:number,px:number,back:string,tilt:number){
  f.setTransform(1,0,0,1,x,y);f.rotate(tilt);f.font=`900 ${px}px "Arial Black",Impact,sans-serif`;f.textAlign='center';f.textBaseline='middle';const w=f.measureText(text).width+px*.9,h=px*1.5;
  f.fillStyle=INK;f.fillRect(-w/2+px*.16,-h/2+px*.16,w,h);f.fillStyle=back;f.fillRect(-w/2,-h/2,w,h);f.lineWidth=Math.max(2,px*.11);f.strokeStyle=INK;f.lineJoin='miter';f.strokeRect(-w/2,-h/2,w,h);f.fillStyle=INK;f.fillText(text,0,px*.05);
 }

 /** The venue for a level (the one static repaint a level; nothing happens when it is already up). */
 function setTheme(i:number){i=((i%THEMES.length)+THEMES.length)%THEMES.length;if(i===theme)return;theme=i;paintScene(b,W,H,L,dpr,padOn,theme);}
 function onEvent(e:SnakeEvent,s:SnakeState){
  const x=cx(e.x),y=cy(e.y);
  switch(e.type){
   case 'pick':for(let i=0;i<s.len;i++)pulse[i]=time+i*.045;burst(x,y,7,POS_COLOR[e.a]);burst(x,y,3,PAPER,.7);pop(x,y-cs*.7,'+'+e.c,PAPER);
    // a finished line is named as the next one opens, and its players jump: BACK FOUR!, MIDFIELD THREE!
    if((e.a===POS.mid&&s.m===1)||(e.a===POS.fwd&&s.f===1)){const was=e.a-1,n=was===POS.def?s.d:s.m;pop(x,y-cs*1.5,(was===POS.def?'BACK ':'MIDFIELD ')+LINE_WORD[n]+'!',POS_COLOR[was],true);for(let i=1;i<s.len;i++)if(s.pos[i]===was)hop[i]=time+i*.05;}
    break;
   case 'chain':burst(x,y,Math.min(10,3+e.a),SUN,1.1);pop(x,y-cs*(s.joined===1?1.5:2.1),'QUICK x'+e.a,SUN,true,true);break;
   case 'cone':burst(x,y,7,ORANGE,1.1);fling(IDX_CONE,x,y,(DX[s.dir]||(rnd()<.5?1:-1))*cs*5);break;
   case 'slideGo':dust(x,y,5);break;
   case 'slideOut':dust(x,y,4);pop(cx(s.xs[0]),cy(s.ys[0])-cs*.8,'DODGED!',PAPER);break;
   case 'near':pop(x,y-cs*.8,'CLOSE!',PAPER);break;
   case 'squad':for(let i=0;i<s.len;i++){pulse[i]=time+i*.05;burst(cx(s.xs[i]),cy(s.ys[i]),2,POS_COLOR[s.pos[i]]);}fx.flash=reduced?0:.12;
    confetti(34);for(let i=0;i<s.len;i++)hop[i]=time+.3+i*.06;
    say('FULL SQUAD!',shapeOfCode(e.a),(e.c?'COACH’S CALL x2  ':'')+'+'+e.b,SUN,RED,SN.beat,ox+cs*C/2,oy+cs*R*.4,1);break;
   case 'level':for(let i=1;i<SN.maxLine;i++)burst(cx(s.xs[i]),cy(s.ys[i]),2,PAPER,.8);setTheme(e.a-1);say('LEVEL '+e.a,'',levelNote(e.a),PAPER,TEAL,1.25,ox+cs*C/2,bannerY(s),.62);break;
   case 'ball':burst(x,y,8,PAPER);say('THROUGH PASS!','','',PAPER,TEAL,.8,ox+cs*C/2,bannerY(s),.58);fx.dashGlow=1;break;
   case 'dashEnd':fx.dashGlow=0;break;
   case 'boot':burst(x,y,12,SUN,1.2);pop(x,y-cs*.7,'+'+e.a,SUN,true,true);break;
   case 'bootIn':burst(x,y,4,SUN,.6);break;
   case 'ballIn':burst(x,y,3,PAPER,.6);break;
   case 'bootGone':burst(x,y,3,INK,.5);break;
   case 'skid':fx.skid=.22;burst(x+DX[s.dir]*cs*.4,y+DY[s.dir]*cs*.4,5,PAPER,.6);pop(x,y-cs*.8,'TURN!',RED,true);break;
   case 'save':fx.save=.5;burst(x,y,10,TEAL);say('LAST-DITCH!','','',PAPER,TEAL,.85,ox+cs*C/2,bannerY(s),.6);break;
   case 'card':burst(x,y,8,SUN);say(e.a?'SENT BACK!':'FOUL!','','',PAPER,ORANGE,.85,ox+cs*C/2,bannerY(s),.6);
    // the team-mate sent back tumbles off (his cell is still in the arrays just past the line's end) and the rest flinch
    if(e.a){const i=s.len;fling(beanIndex(s.pos[i],i),cx(s.xs[i]),cy(s.ys[i]),(s.xs[i]<C/2?-1:1)*cs*4);for(let k=0;k<s.len;k++)pulse[k]=time+k*.03;}break;
   case 'knock':burst(x,y,9,VIOLET);pop(x,y-cs*.7,'+'+e.a,PAPER,true,true);if(!reduced)fx.shake=.12;break;
   case 'crash':{for(let i=1;i<s.len;i++)hop[i]=time+i*.04;fx.crackT=0;fx.crackX=x;fx.crackY=y;fx.shake=reduced?0:.3;fx.flash=reduced?0:.1;fx.dashGlow=0;
    for(let k=0;k<CRACK_N;k++){let an=k/CRACK_N*Math.PI*2+rnd()*.5,px=x,py=y;for(let j=0;j<CRACK_SEG;j++){an+=(rnd()-.5)*1.1;const len=cs*(.9+rnd()*1.5);px+=Math.cos(an)*len;py+=Math.sin(an)*len;crack[(k*CRACK_SEG+j)*2]=px;crack[(k*CRACK_SEG+j)*2+1]=py;}}
    burst(x,y,14,PAPER,1.3);say(CAUSE_WORD[e.a]||'OUT!','','',PAPER,RED,1.4,ox+cs*C/2,oy+cs*R*.42,.9);break;}
  }
 }

 function render(g:SquadSnake,dt:number){
  const s=g.state,fr=g.frac;time+=dt;plain();f.clearRect(0,0,W,H);
  let shx=0,shy=0;if(fx.shake>0){fx.shake-=dt;const k=Math.max(0,fx.shake)/.3*cs*.16;shx=(rnd()-.5)*k;shy=(rnd()-.5)*k;}
  const bx=ox+shx,by=oy+shy,X=(c:number)=>bx+(c+.5)*cs,Y=(c:number)=>by+(c+.5)*cs,run=!s.over&&!s.hold&&s.ready<=0&&s.beat<=0&&!s.stall;
  // pressers' lanes: a dashed ink line, so the patrol is readable before it arrives
  f.lineWidth=Math.max(2,cs*.07);f.strokeStyle='rgba(35,26,46,.4)';f.setLineDash([cs*.22,cs*.2]);f.lineCap='butt';
  for(const o of s.foes){if(!o.on||o.kind!==0)continue;f.beginPath();if(o.dx){f.moveTo(X(o.lo)-cs*.4,Y(o.y)+cs*.36);f.lineTo(X(o.hi)+cs*.4,Y(o.y)+cs*.36);}else{f.moveTo(X(o.x),Y(o.lo)-cs*.2);f.lineTo(X(o.x),Y(o.hi)+cs*.42);}f.stroke();}
  f.setLineDash([]);
  // corner flags: a little wind on the pitch
  f.lineJoin='round';for(let k=0;k<4;k++){const fx0=bx+(k%2?cs*C:0),fy0=by+(k>1?cs*R:0),dir=k%2?-1:1,wv=reduced?0:Math.sin(time*5+k*1.7)*cs*.05;
   f.lineWidth=cs*.06;f.strokeStyle=INK;f.beginPath();f.moveTo(fx0,fy0);f.lineTo(fx0,fy0-cs*.62);f.stroke();f.beginPath();f.moveTo(fx0,fy0-cs*.62);f.lineTo(fx0+dir*cs*.34,fy0-cs*.5+wv);f.lineTo(fx0,fy0-cs*.38);f.closePath();f.fillStyle=k%3?SUN:RED;f.fill();f.lineWidth=cs*.045;f.stroke();}
  // the sliding tackle: his whole lane flashes (with arrows the way he will come) well before he does
  const sl=s.slide;if(sl.phase){const blink=reduced||sl.phase===2?1:.55+.45*Math.sin(time*14),la=sl.horiz?Y(sl.at):X(sl.at);
   f.fillStyle=sl.phase===1?`rgba(240,69,46,${(.2+.2*blink).toFixed(2)})`:'rgba(240,69,46,.16)';if(sl.horiz)f.fillRect(bx,la-cs*.5,cs*C,cs);else f.fillRect(la-cs*.5,by,cs,cs*R);
   if(sl.phase===1){const n=sl.horiz?C:R;f.fillStyle=PAPER;f.strokeStyle=INK;f.lineWidth=cs*.05;for(let k=1;k<n;k+=2){const along=(sl.horiz?bx:by)+(k+.5)*cs+(reduced?0:sl.dir*((time*1.6)%1-.5)*cs*.5),ax=sl.horiz?along:la,ay=sl.horiz?la:along,dx=sl.horiz?sl.dir:0,dy=sl.horiz?0:sl.dir;
     f.beginPath();f.moveTo(ax+dx*cs*.22,ay+dy*cs*.22);f.lineTo(ax-dx*cs*.14-dy*cs*.2,ay-dy*cs*.14+dx*cs*.2);f.lineTo(ax-dx*cs*.14+dy*cs*.2,ay-dy*cs*.14-dx*cs*.2);f.closePath();f.fill();f.stroke();}
    const e=sl.dir>0?0:(sl.horiz?C:R)-1,ex=sl.horiz?X(e):la,ey=sl.horiz?la:Y(e),k=1+.12*blink;star(f,ex,ey,cs*.46*k,cs*.33*k,9,time*2);f.fillStyle=RED;f.fill();f.lineWidth=cs*.06;f.strokeStyle=INK;f.stroke();lettering('!',ex,ey,cs*.5,PAPER,0);plain();}}
  // training cones
  for(const c of s.cones)if(c.on)sprite(IDX_CONE,X(c.x),Y(c.y),0,1,1,-1);plain();
  // golden boot with its timer ring
  if(s.boot.on){const x=X(s.boot.x),y=Y(s.boot.y),k=Math.max(0,s.boot.t/s.boot.max),bob=reduced?0:Math.sin(time*5)*cs*.04;
   f.lineWidth=cs*.1;f.strokeStyle=INK;f.beginPath();f.arc(x,y,cs*.47,0,Math.PI*2);f.stroke();f.lineWidth=cs*.065;f.strokeStyle=k<.3?RED:SUN;f.beginPath();f.arc(x,y,cs*.47,-Math.PI/2,-Math.PI/2+Math.PI*2*k);f.stroke();
   sprite(IDX_BOOT,x,y-FOOT*cs*.0+bob,0,.86,.86,-1);plain();}
  if(s.ball.on){const bob=reduced?0:Math.abs(Math.sin(time*4.2))*cs*.09;sprite(IDX_BALL,X(s.ball.x),Y(s.ball.y)-bob,reduced?0:time*1.4,1,1,-1);plain();}
  // team-mates waiting to be called: a ring in the position colour, the bean, its label tag
  for(let i=0;i<2;i++){const p=s.picks[i];if(!p.on)continue;const x=X(p.x),y=Y(p.y),k=reduced?.5:.5+.5*Math.sin(time*4+i*2);
   f.lineWidth=cs*.085;f.strokeStyle=INK;f.beginPath();f.ellipse(x,y+cs*.36,cs*(.36+k*.06),cs*(.15+k*.03),0,0,Math.PI*2);f.stroke();f.lineWidth=cs*.05;f.strokeStyle=POS_COLOR[p.pos];f.stroke();
   // quick call: the time left to keep the chain, as a ring round each waiting team-mate
   if(s.chainLeft>0&&s.beat<=0){const u=Math.max(0,(s.chainLeft-fr)/SN.chainTicks);f.lineCap='round';f.lineWidth=cs*.13;f.strokeStyle=INK;f.beginPath();f.arc(x,y-cs*.04,cs*.56,-Math.PI/2,-Math.PI/2+Math.PI*2*u);f.stroke();f.lineWidth=cs*.07;f.strokeStyle=u<.25?RED:SUN;f.stroke();f.lineCap='butt';}
   sprite(beanIndex(p.pos,s.joined+1),x,y-(reduced?0:k*cs*.05),0,1,1,2);sprite(IDX_TAG+p.pos,x,y-cs*.72,0,1,1,-1);plain();}
  // opponents
  for(const o of s.foes){if(!o.on)continue;const x=X(o.px+(o.x-o.px)*fr),y=Y(o.py+(o.y-o.py)*fr),bob=reduced?0:Math.abs(Math.sin(time*7+o.lo))*cs*.05;
   sprite(o.kind?IDX_REF:IDX_PRESS,x,y-bob,o.dx*.1,1,1,o.kind?2:o.dx>0?1:o.dx<0?3:o.dy<0?0:2);}
  // the slider himself: a pressing defender laid right over into the slide, kicking up dust every cell
  let slx=-99,sly=-99;if(sl.phase===2){const p=sl.ppos+(sl.pos-sl.ppos)*fr;slx=sl.horiz?X(p):X(sl.at);sly=sl.horiz?Y(sl.at):Y(p);if(s.ticks!==lastTick)dust(slx,sly,2);
   f.lineCap='round';f.lineWidth=cs*.08;f.strokeStyle=PAPER;for(let k=-1;k<=1;k++){const bx2=slx-(sl.horiz?sl.dir:0)*cs*.55+(sl.horiz?0:k*cs*.2),by2=sly-(sl.horiz?0:sl.dir)*cs*.55+(sl.horiz?k*cs*.2:0),len=cs*(k?.4:.7);f.beginPath();f.moveTo(bx2,by2);f.lineTo(bx2-(sl.horiz?sl.dir:0)*len,by2-(sl.horiz?0:sl.dir)*len);f.stroke();}
   sprite(IDX_PRESS,slx,sly+cs*.1,sl.horiz?sl.dir*1.15:0,sl.horiz?1:1.12,sl.horiz?1:.74,sl.horiz?(sl.dir>0?1:3):(sl.dir>0?2:0));}
  plain();
  // the captain is never lost in the crowd: a sun ring at his feet and an arrow for the way he runs (paper once a turn is lined up)
  if(!s.over){const hx=X(s.pxs[0]+(s.xs[0]-s.pxs[0])*fr),hy=Y(s.pys[0]+(s.ys[0]-s.pys[0])*fr),queued=s.qn>0,d=queued?s.q0:s.dir,k=reduced?0:.5+.5*Math.sin(time*6);
   f.lineWidth=cs*.1;f.strokeStyle=INK;f.beginPath();f.ellipse(hx,hy+cs*.37,cs*(.4+k*.03),cs*(.17+k*.012),0,0,Math.PI*2);f.stroke();f.lineWidth=cs*.055;f.strokeStyle=SUN;f.stroke();
   const ax=hx+DX[d]*cs*.66,ay=hy+cs*.1+DY[d]*cs*.66;f.beginPath();f.moveTo(ax+DX[d]*cs*.17,ay+DY[d]*cs*.17);f.lineTo(ax-DX[d]*cs*.06-DY[d]*cs*.15,ay-DY[d]*cs*.06+DX[d]*cs*.15);f.lineTo(ax-DX[d]*cs*.06+DY[d]*cs*.15,ay-DY[d]*cs*.06-DX[d]*cs*.15);f.closePath();f.fillStyle=queued?PAPER:SUN;f.fill();f.lineWidth=cs*.045;f.lineJoin='round';f.strokeStyle=INK;f.stroke();
   // back from a pause: a ring closes on the captain while the line waits
   if(s.ready>0&&!s.hold&&s.ticks>0){const u=Math.min(1,s.ready/SN.resumeGrace);f.lineWidth=cs*.09;f.strokeStyle=PAPER;f.beginPath();f.arc(hx,hy,cs*(.6+u*1.3),0,Math.PI*2);f.stroke();}
   if(s.moved!==lastMoved){if(lastMoved>=0&&run)dust(X(s.pxs[0]),Y(s.pys[0]),3);lastMoved=s.moved;}}
  // the line, tail first so the captain is on top
  const dashing=s.dash>0,freq=dashing?16:11,celebrate=s.beat>0;
  for(let i=s.len-1;i>=0;i--){
   // team-mates step (a small ease inside every cell) where the captain glides, so the line reads as people, not a train
   const mx=s.xs[i]-s.pxs[i],my=s.ys[i]-s.pys[i],g=i>0&&!reduced?fr-.075*Math.sin(fr*Math.PI*2):fr,x=X(s.pxs[i]+mx*g),y=Y(s.pys[i]+my*g);
   let bob=0,rot=0,sx=1,sy=1;
   if(!reduced){if(celebrate)bob=Math.max(0,Math.sin(time*9-i*.7))*cs*.22;else if(run&&(mx||my))bob=Math.abs(Math.sin(time*freq-i*.9))*cs*.07;
    rot=run?mx*.13:0;if(i===0&&fx.skid>0)rot=Math.sin(time*60)*.12;
    const u=(time-pulse[i])/.26;if(u>0&&u<1){const k=Math.sin(Math.PI*u)*(1-u)*.5;sx=1+k;sy=1-k*.7;}
    const h=(time-hop[i])/.34;if(h>0&&h<1){bob+=Math.sin(Math.PI*h)*cs*.42;sy*=1+.12*Math.sin(Math.PI*h);}
    if(i>0&&slx>-90){const d=Math.hypot(x-slx,y-sly)/cs;if(d<1.1)bob+=(1-d/1.1)*cs*.5;}}// the line hops over the slider
   if(i===0&&dashing){plain();f.lineCap='round';f.lineWidth=cs*.09;f.strokeStyle=PAPER;for(let k=-1;k<=1;k++){const px=-DY[s.dir]*k*cs*.22,py=DX[s.dir]*k*cs*.22;f.beginPath();f.moveTo(x-DX[s.dir]*cs*.5+px,y-DY[s.dir]*cs*.5+py);f.lineTo(x-DX[s.dir]*cs*(1.1+(k?0:.4))+px,y-DY[s.dir]*cs*(1.1+(k?0:.4))+py);f.stroke();}}
   const look=i===0?s.dir:mx>0?1:mx<0?3:my<0?0:2;
   sprite(i===0?0:beanIndex(s.pos[i],i),x,y-bob,rot,sx,sy,look);
  }
  plain();
  if(fx.skid>0)fx.skid-=dt;if(fx.save>0){fx.save-=dt;const k=1-Math.max(0,fx.save)/.5;f.lineWidth=cs*.1*(1-k);f.strokeStyle=TEAL;f.beginPath();f.arc(X(s.xs[0]),Y(s.ys[0]),cs*(.5+k*1.2),0,Math.PI*2);f.stroke();}
  lastTick=s.ticks;
  // a team-mate sent back, or a cone knocked flying
  for(const g of ghosts){if(!g.on)continue;g.t+=dt;if(g.t>=.75){g.on=false;continue;}g.x+=g.vx*dt;g.y+=g.vy*dt;g.vy+=cs*22*dt;f.globalAlpha=g.t>.5?1-(g.t-.5)/.25:1;sprite(g.idx,g.x+shx,g.y+shy,reduced?0:g.t*11*Math.sign(g.vx||1),1,1,-1);f.globalAlpha=1;plain();}
  // a gull crosses now and then, its shadow on the grass
  if(!reduced){const gu=((time+5)%17)/6;if(gu<1){const gx=bx-cs*2+cs*(C+4)*gu,gy=by+cs*(4+2*Math.sin(gu*3.1)),fl=Math.sin(time*9)*cs*.16;
    f.fillStyle='rgba(35,26,46,.14)';f.beginPath();f.ellipse(gx+cs*.5,gy+cs*2.1,cs*.42,cs*.12,0,0,Math.PI*2);f.fill();f.lineCap='round';f.lineJoin='round';
    for(let pass=0;pass<2;pass++){f.lineWidth=pass?cs*.07:cs*.17;f.strokeStyle=pass?PAPER:INK;f.beginPath();f.moveTo(gx-cs*.42,gy-fl);f.quadraticCurveTo(gx-cs*.2,gy-cs*.16-fl*.3,gx,gy);f.quadraticCurveTo(gx+cs*.2,gy-cs*.16-fl*.3,gx+cs*.42,gy-fl);f.stroke();}}}
  // stars, confetti, dust
  for(const p of stars){if(!p.on)continue;p.t+=dt;if(p.t>=p.life){p.on=false;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(p.kind===1){const k=p.life-p.t,co=Math.cos(p.t*8+p.r),si=Math.sin(p.t*8+p.r);p.x+=Math.sin(p.t*6+p.r*40)*cs*.9*dt;f.globalAlpha=Math.min(1,k*4);f.setTransform(co,si,-si*Math.cos(p.t*11),co*Math.cos(p.t*11),p.x+shx,p.y+shy);f.fillStyle=p.color;f.fillRect(-p.r,-p.r*.6,p.r*2,p.r*1.2);f.lineWidth=Math.max(1,cs*.03);f.strokeStyle=INK;f.strokeRect(-p.r,-p.r*.6,p.r*2,p.r*1.2);plain();f.globalAlpha=1;continue;}
   if(p.kind===2){const k=1-p.t/p.life;f.globalAlpha=k*.75;f.fillStyle=PAPER;f.beginPath();f.arc(p.x+shx,p.y+shy,p.r*(1.9-k),0,Math.PI*2);f.fill();f.globalAlpha=1;continue;}
   p.vy+=cs*9*dt;const k=1-p.t/p.life;star(f,p.x+shx,p.y+shy,p.r*(.6+k*.6),p.r*.28,4,p.t*6);f.fillStyle=p.color;f.fill();f.lineWidth=Math.max(1,cs*.035);f.strokeStyle=INK;f.stroke();}
  // the crack: jagged ink lines out from the crash, a paper core
  if(fx.crackT>=0){fx.crackT+=dt;const k=Math.min(1,fx.crackT/(reduced?.01:.22)),segs=Math.ceil(k*CRACK_SEG);f.lineJoin='miter';f.lineCap='round';
   for(let pass=0;pass<2;pass++){f.lineWidth=pass?cs*.05:cs*.16;f.strokeStyle=pass?PAPER:INK;f.beginPath();for(let c=0;c<CRACK_N;c++){f.moveTo(fx.crackX+shx,fx.crackY+shy);for(let j=0;j<segs;j++)f.lineTo(crack[(c*CRACK_SEG+j)*2]+shx,crack[(c*CRACK_SEG+j)*2+1]+shy);}f.stroke();}}
  // points
  for(const p of pops){if(!p.on)continue;p.t+=dt;const life=p.fly?.95:.7;if(p.t>=life){p.on=false;continue;}const k=p.t/life,inn=reduced?1:Math.min(1,p.t/.1),px0=cs*(p.big?.5:.4)*(.6+.4*inn+(inn>=1?.18*Math.max(0,1-(p.t-.1)/.12):0));
   const half=px0*(.5+p.text.length*.34);let x=Math.max(ox+half,Math.min(ox+cs*C-half,p.x+shx)),y=p.y-Math.min(1,k*1.6)*cs*.9+shy,px=px0;
   if(p.fly&&k>.5){const u=(k-.5)/.5,e=u*u*u;x+=(W/2-x)*e;y+=(40*dpr-y)*e;px=px0*(1-.4*e);f.globalAlpha=1-e*.5;}else f.globalAlpha=!p.fly&&k>.7?1-(k-.7)/.3:1;// big scores fly up to the counter
   lettering(p.text,x,y,px,p.color,-.06);f.globalAlpha=1;}
  // the word panel
  if(word.on){word.t+=dt;if(word.t>=word.dur)word.on=false;else{const t=word.t,inn=reduced?1:Math.min(1,t/.16),sc=reduced?1:inn<1?.4+inn*.75:1+.15*Math.max(0,1-(t-.16)/.12),out=Math.min(1,(word.dur-t)/.14),px=cs*1.18*word.size*sc;
    f.globalAlpha=out;f.font=`italic 900 ${px}px "Arial Black",Impact,sans-serif`;plain();const tw=f.measureText(word.text).width,fit=Math.min(1,(cs*C*.98)/(tw*1.34)),p2=px*fit,rw=tw*fit*.67,rh=p2*1.25;
    f.setTransform(1,0,0,1,word.x+shx,word.y+shy);f.rotate(-.07);f.lineJoin='miter';star(f,p2*.1,p2*.12,rh,rh*.72,11,.3,rw/rh);f.fillStyle=INK;f.fill();star(f,0,0,rh,rh*.72,11,.3,rw/rh);f.fillStyle=word.burst;f.fill();f.lineWidth=Math.max(2,p2*.09);f.strokeStyle=INK;f.stroke();
    lettering(word.text,word.x+shx,word.y+shy,p2,word.fill,-.07);
    if(word.sub){f.font=`400 ${cs*2.3*sc}px IslandBrush,"Arial Black",sans-serif`;f.setTransform(1,0,0,1,word.x+shx,word.y+cs*2.75+shy);f.rotate(.03);f.textAlign='center';f.textBaseline='middle';const sw=f.measureText(word.sub).width+cs*1.1,sh=cs*2.5;
     f.fillStyle=INK;f.fillRect(-sw/2+cs*.2,-sh/2+cs*.2,sw,sh);f.fillStyle=PAPER;f.fillRect(-sw/2,-sh/2,sw,sh);f.lineWidth=cs*.12;f.strokeStyle=INK;f.strokeRect(-sw/2,-sh/2,sw,sh);f.fillStyle=INK;f.fillText(word.sub,0,cs*.08);}
    if(word.note)caption(word.note,word.x+shx,word.y+cs*(word.sub?4.75:1.45)+shy,cs*.5,word.note.startsWith('+')?SUN:'#c9f1ea',-.03);
    f.globalAlpha=1;plain();}}
  if(fx.flash>0){fx.flash-=dt;plain();f.globalAlpha=Math.max(0,fx.flash)*4;f.fillStyle=PAPER;f.fillRect(0,0,W,H);f.globalAlpha=1;}
 }
 function reset(){setTheme(0);for(const g of ghosts)g.on=false;hop.fill(-9);lastTick=-1;lastMoved=-1;for(const p of stars)p.on=false;for(const p of pops)p.on=false;word.on=false;pulse.fill(-9);fx.crackT=-1;fx.shake=0;fx.flash=0;fx.skid=0;fx.save=0;fx.dashGlow=0;time=0;}
 function clear(){plain();f.clearRect(0,0,W,H);}
 return {resize,render,onEvent,reset,clear,get layout(){return L;},get pixels(){return W*H;},get atlasPixels(){return atlas.width*atlas.height;},get theme(){return theme;}};
}
