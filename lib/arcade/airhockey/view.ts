/**
 * Air Futbol picture (Nov 11 2026, docs/arcade-aaa/airhockey-direction.md): comic print on a 2D canvas, the house style (ink
 * outlines, flat colour, Ben-Day dots, golden hour). Two canvases: `bg` is the beach, the boardwalk table, the mini pitch, the
 * printed score numerals and the rail labels, painted only when the size or the score changes; `fg` is the moving layer (puck,
 * strikers, speed lines, impact stars, word bursts), drawn between physics steps. No loop, no timers, no 3D engine: the shell calls
 * render. Nothing allocates per frame (stars and the trail are pooled). Circles do not care which way the table lies, so a phone
 * held sideways just maps the same table through a quarter turn (airLayout().side).
 */
import {AH,GOAL_BANK,GOAL_QUICK,GOAL_COUNTER,GOAL_OWN,type AirFutbol,type AirEvent} from './core';
export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const {W,H,PR,SR,GOAL0,GOAL1}=AH,RAIL=4,END=7,FW=W+2*RAIL,FH=H+2*END,TAU=Math.PI*2;
type Ctx=CanvasRenderingContext2D;
const LETTER='"Arial Black",Impact,sans-serif';

/** Where the table sits (CSS px). Upright: bottom-aligned under the top bar (your half by your thumb). `side`: a phone held
 *  sideways, the table lies on its side with your end at the right. scale = px per table unit; free = spare px above the table. */
export function airLayout(w:number,h:number,top:number,bottom=8){
 const side=w>h*1.2&&h<560,aw=Math.max(40,w-12),ah=Math.max(40,h-top-bottom),scale=side?Math.min(aw/FH,ah/FW):Math.min(aw/FW,ah/FH);
 const fw=(side?FH:FW)*scale,fh=(side?FW:FH)*scale,cx=w/2,cy=side?top+ah/2:h-bottom-fh/2;
 return {side,scale,cx,cy,fw,fh,x0:cx-fw/2,y0:cy-fh/2,free:Math.max(0,cy-fh/2-top)};
}
export type AirLayout=ReturnType<typeof airLayout>;
/** Table units -> CSS px and back (pure; the shell uses toTable for fingers). */
export const toScreenX=(L:AirLayout,x:number,y:number)=>L.side?L.cx+(y-H/2)*L.scale:L.cx+(x-W/2)*L.scale;
export const toScreenY=(L:AirLayout,x:number,y:number)=>L.side?L.cy-(x-W/2)*L.scale:L.cy+(y-H/2)*L.scale;
export const toTableX=(L:AirLayout,px:number,py:number)=>L.side?W/2-(py-L.cy)/L.scale:(px-L.cx)/L.scale+W/2;
export const toTableY=(L:AirLayout,px:number,py:number)=>L.side?(px-L.cx)/L.scale+H/2:(py-L.cy)/L.scale+H/2;

export type AirHud={top:string;bottom:string;goals:readonly [number,number];lives:number};
export type AirView=ReturnType<typeof createAirView>;
export function createAirView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced?:boolean}={}){
 const b=bg.getContext('2d')!,f=fg.getContext('2d')!;let Wp=1,Hp=1,dpr=1,L=airLayout(390,700,62),top=62;
 let hud:AirHud={top:'',bottom:'',goals:[0,0],lives:-1},spin=0;
 const stars=Array.from({length:16},()=>({x:0,y:0,t:1,dur:.3,size:1,color:PAPER,rot:0}));
 const word={text:'',sub:'',t:9,dur:1,x:0,y:0,color:SUN,fill:RED,size:1};
 const flash={t:9,end:0};

 function dots(c:Ctx,x:number,y:number,w:number,h:number,step:number,r:number,color:string){c.fillStyle=color;c.beginPath();let row=0;for(let yy=y+step/2;yy<y+h;yy+=step,row++)for(let xx=x+(row%2?step:step/2);xx<x+w;xx+=step){c.moveTo(xx+r,yy);c.arc(xx,yy,r,0,TAU);}c.fill();}
 /** Table space on a context: after this, draw in table units (0..W, 0..H), whichever way the table lies. */
 function table(c:Ctx){const s=L.scale*dpr;if(L.side)c.setTransform(0,-s,s,0,(L.cx-H/2*L.scale)*dpr,(L.cy+W/2*L.scale)*dpr);else c.setTransform(s,0,0,s,(L.cx-W/2*L.scale)*dpr,(L.cy-H/2*L.scale)*dpr);}
 /** A rail label, turned to face its reader: 0 = read from the bottom end, PI = from the top end; sideways solo reads level. */
 function label(c:Ctx,text:string,x:number,y:number,size:number,turn:number,color:string,align:CanvasTextAlign='center'){c.save();c.translate(x,y);c.rotate(turn);c.font=`italic 900 ${size}px ${LETTER}`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(text,0,0);c.restore();}
 function paint(){
  const c=b,u=L.scale;c.setTransform(dpr,0,0,dpr,0,0);const w=Wp/dpr,h=Hp/dpr;
  // the beach at golden hour: sand with a printed dot screen; with room above the table, a strip of sky, sun and sea
  c.fillStyle='#ffcf7a';c.fillRect(0,0,w,h);dots(c,0,0,w,h,9,1.5,'#f0a45a');
  if(!L.side&&L.free>46){const y0=top-8,hh=L.free-6;c.fillStyle='#ffb45e';c.fillRect(0,0,w,y0+hh*.45);dots(c,0,y0,w,hh*.4,8,2.2,'#ff9a4e');
   c.fillStyle=SUN;c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.arc(w*.78,y0+hh*.45,Math.min(34,hh*.36),Math.PI,TAU);c.fill();c.stroke();
   c.fillStyle=TEAL;c.fillRect(0,y0+hh*.45,w,hh*.33);dots(c,0,y0+hh*.47,w,hh*.3,10,1.8,'#7fdacb');c.fillStyle=PAPER;c.fillRect(0,y0+hh*.78,w,3);c.fillStyle=INK;c.fillRect(0,y0+hh*.45-1.5,w,3);}
  table(c);
  // boardwalk deck under the table, hard violet shadow, then the frame
  c.fillStyle='#8f78b855';c.fillRect(-RAIL+3,-END+3.5,FW,FH);
  c.fillStyle=ORANGE;c.strokeStyle=INK;c.lineWidth=3/u;c.fillRect(-RAIL,-END,FW,FH);c.strokeRect(-RAIL,-END,FW,FH);
  c.fillStyle='#e9742a';for(let y=-END+6;y<H+END-2;y+=12){c.fillRect(-RAIL+.6,y,RAIL-1.2,.7);c.fillRect(W+.6,y,RAIL-1.2,.7);}// plank seams on the side rails
  // goals: an ink pocket with a net, rimmed in the side's colour
  for(let e=0;e<2;e++){const y=e?H:-END+1.2,col=e?TEAL:RED;c.fillStyle=col;c.fillRect(GOAL0-2.2,e?H:-END,GOAL1-GOAL0+4.4,END);c.strokeRect(GOAL0-2.2,e?H:-END,GOAL1-GOAL0+4.4,END);
   c.fillStyle=INK;c.fillRect(GOAL0,y,GOAL1-GOAL0,END-1.2);c.strokeStyle='#fff3d655';c.lineWidth=.35;c.beginPath();for(let x=GOAL0+3;x<GOAL1;x+=3.2){c.moveTo(x,y);c.lineTo(x,y+END-1.2);}for(let k=1;k<3;k++){c.moveTo(GOAL0,y+k*(END-1.2)/3);c.lineTo(GOAL1,y+k*(END-1.2)/3);}c.stroke();c.strokeStyle=INK;c.lineWidth=3/u;}
  // the pitch: mown bands, a printed dot grid, paper lines
  c.save();c.beginPath();c.rect(0,0,W,H);c.clip();for(let k=0;k<8;k++){c.fillStyle=k%2?'#4aa868':'#3f9a5c';c.fillRect(0,k*H/8,W,H/8+.2);}dots(c,0,0,W,H,5,.42,'#2f7d4a66');
  // the printed score: one big numeral in each half, facing its player
  const upT=L.side?Math.PI/2:0;label(c,String(hud.goals[1]),W/2,H*.27,46,upT,'#231a2e2b');label(c,String(hud.goals[0]),W/2,H*.73,46,upT,'#231a2e2b');
  c.strokeStyle=PAPER;c.lineWidth=1.1;c.beginPath();c.rect(3,3,W-6,H-6);c.moveTo(3,H/2);c.lineTo(W-3,H/2);c.moveTo(W/2+15,H/2);c.arc(W/2,H/2,15,0,TAU);
  for(let e=0;e<2;e++){const y=e?H-3:3,d=e?-1:1;c.moveTo(GOAL0-9,y);c.lineTo(GOAL0-9,y+d*24);c.lineTo(GOAL1+9,y+d*24);c.lineTo(GOAL1+9,y);c.moveTo(GOAL0+4,y);c.lineTo(GOAL0+4,y+d*9);c.lineTo(GOAL1-4,y+d*9);c.lineTo(GOAL1-4,y);
   c.moveTo(W/2+11,y+d*24);c.arc(W/2,y+d*24,11,e?0:0,Math.PI,!!e);}
  for(const [x,y,a] of [[3,3,0],[W-3,3,Math.PI/2],[W-3,H-3,Math.PI],[3,H-3,-Math.PI/2]] as const){c.moveTo(x+Math.cos(a)*5,y+Math.sin(a)*5);c.arc(x,y,5,a,a+Math.PI/2);}
  c.stroke();c.fillStyle=PAPER;c.beginPath();c.arc(W/2,H/2,1.6,0,TAU);c.fill();c.restore();
  c.strokeStyle=INK;c.lineWidth=3/u;c.strokeRect(0,0,W,H);
  // goal-mouth sills are open: paint over the pitch edge there
  for(let e=0;e<2;e++){c.fillStyle=INK;c.fillRect(GOAL0,e?H-.2:-1.4,GOAL1-GOAL0,1.6);}
  // corner bolts
  c.fillStyle=INK;for(const x of [-RAIL/2,W+RAIL/2])for(const y of [-END/2,H+END/2]){c.beginPath();c.arc(x,y,1,0,TAU);c.fill();}
  // rail labels: who is at each end, and the lives as small discs by your goal
  // the names sit IN the end rails beside the goals; sideways they read along the rail (turned with the table) so they never spill onto
  // the pitch (Nov 11 2026: turned upright they overhung the rail at 844x390)
  if(hud.top)label(c,hud.top,(GOAL0-2.2)/2-RAIL/2+1,-END/2,4.4,0,INK);
  if(hud.bottom)label(c,hud.bottom,(GOAL0-2.2)/2-RAIL/2+1,H+END/2,4.4,0,INK);
  if(hud.lives>=0)for(let i=0;i<AH.LIVES;i++){const x=GOAL1+8+i*6.4,y=H+END/2;c.fillStyle=i<hud.lives?TEAL:'#e9742a';c.strokeStyle=INK;c.lineWidth=2.2/u;c.beginPath();c.arc(x,y,2.3,0,TAU);c.fill();c.stroke();}
 }
 function resize(cssW:number,cssH:number,ratio:number,topRoom:number,bottom=8){
  dpr=ratio;top=topRoom;Wp=Math.max(1,Math.round(cssW*dpr));Hp=Math.max(1,Math.round(cssH*dpr));for(const cv of [bg,fg]){if(cv.width!==Wp)cv.width=Wp;if(cv.height!==Hp)cv.height=Hp;}
  L=airLayout(cssW,cssH,topRoom,bottom);paint();
 }
 /** The rail labels and the printed score. Repaints the static layer only when something changed. */
 function setHud(n:AirHud){if(n.top===hud.top&&n.bottom===hud.bottom&&n.goals[0]===hud.goals[0]&&n.goals[1]===hud.goals[1]&&n.lives===hud.lives)return;hud={...n,goals:[n.goals[0],n.goals[1]]};paint();}
 function star(x:number,y:number,size:number,color:string){if(opts.reduced)return;let best=stars[0];for(const s of stars){if(s.t>=s.dur){best=s;break;}if(s.t/s.dur>best.t/best.dur)best=s;}best.x=x;best.y=y;best.t=0;best.dur=.26+size*.05;best.size=size;best.color=color;best.rot=(x*7+y*3)%1.2;}
 function say(text:string,sub:string,x:number,y:number,dur:number,color:string,fill:string,size:number){word.text=text;word.sub=sub;word.t=0;word.dur=dur;word.x=x;word.y=y;word.color=color;word.fill=fill;word.size=size;}
 function onEvent(e:AirEvent){
  if(e.type==='hit')star(e.x,e.y,Math.min(3,.9+e.b/130),e.a===0?'#bff3ea':'#ffd0c2');
  else if(e.type==='wall'||e.type==='post')star(e.x,e.y,Math.min(1.8,.5+e.b/220),PAPER);
  else if(e.type==='save'){if(e.a===0)say('SAVE!','',W/2,H-34,.6,TEAL,PAPER,.62);}
  else if(e.type==='goal'){const own=(e.b&GOAL_OWN)!==0,mine=e.a===0,sub=own?(mine?'':'Own goal'):e.b&GOAL_BANK?`BANK SHOT +${AH.pts.bank}`:e.b&GOAL_COUNTER?`COUNTER +${AH.pts.counter}`:e.b&GOAL_QUICK?`QUICK +${AH.pts.quick}`:'';
   say('GOAL!',sub,W/2,H/2,AH.GOAL_BEAT,mine?SUN:PAPER,mine?RED:VIOLET,mine?1:.74);flash.t=0;flash.end=e.a===0?0:1;
   for(let i=0;i<6;i++)star(GOAL0+(GOAL1-GOAL0)*(i+.5)/6,e.a===0?4+(i%2)*7:H-4-(i%2)*7,1.6+(i%3)*.5,i%2?SUN:PAPER);}
  else if(e.type==='win')say('YOU WIN!',`+${e.b}`,W/2,H/2,1.6,SUN,RED,.82);
  else if(e.type==='lose')say(e.a>0?'BEATEN!':'FULL TIME',e.a>0?`${e.a} ${e.a===1?'life':'lives'} left`:'',W/2,H/2,1.6,PAPER,VIOLET,.74);
 }
 function reset(){for(const s of stars)s.t=s.dur;word.t=9;flash.t=9;}
 function clear(){f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,Wp,Hp);}
 function disc(x:number,y:number,r:number,fill:string,line:number){f.beginPath();f.arc(x,y,r,0,TAU);f.fillStyle=fill;f.fill();if(line){f.lineWidth=line;f.strokeStyle=INK;f.stroke();}}
 function striker(x:number,y:number,color:string,light:string){const r=SR*L.scale,o=Math.max(2,r*.13);
  f.globalAlpha=.3;disc(x+o,y+o*1.3,r,INK,0);f.globalAlpha=1;disc(x,y,r,color,3);f.beginPath();f.arc(x,y,r*.68,0,TAU);f.lineWidth=2;f.strokeStyle='#231a2e66';f.stroke();
  disc(x,y,r*.44,light,2.5);f.beginPath();f.arc(x,y,r*.84,Math.PI*1.08,Math.PI*1.42);f.lineWidth=Math.max(2,r*.1);f.strokeStyle='#fff3d6cc';f.lineCap='round';f.stroke();f.lineCap='butt';}
 function burstPath(x:number,y:number,rx:number,ry:number,rot:number){f.beginPath();const n=14;for(let i=0;i<n*2;i++){const r=i%2?.76:1,a=Math.PI*i/n+.1+rot;const px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;if(i)f.lineTo(px,py);else f.moveTo(px,py);}f.closePath();}
 function render(g:AirFutbol,dt:number){
  const s=g.state,a=Math.max(0,Math.min(1,g.alpha)),u=L.scale;clear();f.setTransform(dpr,0,0,dpr,0,0);
  const tx=s.ppx+(s.px-s.ppx)*a,ty=s.ppy+(s.py-s.ppy)*a,px=toScreenX(L,tx,ty),py=toScreenY(L,tx,ty),sp=Math.hypot(s.pvx,s.pvy);
  // the goal that was scored in flashes its net (two blinks)
  if(flash.t<.7){flash.t+=dt;if(!opts.reduced&&Math.floor(flash.t*8)%2===0){const y=flash.end?H+END/2:-END/2,gx=toScreenX(L,W/2,y),gy=toScreenY(L,W/2,y),gw=(GOAL1-GOAL0)*u,gh=(END-1.6)*u;f.fillStyle=SUN;if(L.side)f.fillRect(gx-gh/2,gy-gw/2,gh,gw);else f.fillRect(gx-gw/2,gy-gh/2,gw,gh);}}
  // serve mark: a dashed ring round the waiting puck
  if(s.phase==='wait'){f.setLineDash([6,5]);f.lineWidth=2.5;f.strokeStyle=PAPER;f.beginPath();f.arc(px,py,(PR+4)*u,0,TAU);f.stroke();f.setLineDash([]);}
  // speed lines and ghost discs behind a fast puck
  if(!s.inGoal&&sp>95&&!opts.reduced){const dx=-s.pvx/sp,dy=-s.pvy/sp,sdx=toScreenX(L,dx,dy)-toScreenX(L,0,0),sdy=toScreenY(L,dx,dy)-toScreenY(L,0,0),n=Math.hypot(sdx,sdy)||1,ux=sdx/n,uy=sdy/n,len=Math.min(46,sp*.12)*u/3.4,r=PR*u;
   f.globalAlpha=.22;disc(px+ux*r*.9,py+uy*r*.9,r*.92,PAPER,0);f.globalAlpha=.12;disc(px+ux*r*1.9,py+uy*r*1.9,r*.8,PAPER,0);f.globalAlpha=1;
   f.strokeStyle=INK;f.lineWidth=2;f.lineCap='round';f.beginPath();for(let k=-1;k<=1;k++){const ox=-uy*k*r*.62,oy=ux*k*r*.62,l=len*(k?.62:1);f.moveTo(px+ox+ux*r*1.25,py+oy+uy*r*1.25);f.lineTo(px+ox+ux*(r*1.25+l),py+oy+uy*(r*1.25+l));}f.stroke();f.lineCap='butt';}
  // puck: a flat football disc
  if(!s.inGoal||flash.t<.25){const r=PR*u;spin+=sp*dt*.02;f.globalAlpha=.3;disc(px+2,py+3,r,INK,0);f.globalAlpha=1;disc(px,py,r,PAPER,2.5);
   f.fillStyle=INK;f.beginPath();for(let i=0;i<5;i++){const an=spin+i*TAU/5;const qx=px+Math.cos(an)*r*.4,qy=py+Math.sin(an)*r*.4;if(i)f.lineTo(qx,qy);else f.moveTo(qx,qy);}f.closePath();f.fill();
   f.lineWidth=1.6;f.strokeStyle=INK;f.beginPath();for(let i=0;i<5;i++){const an=spin+i*TAU/5;f.moveTo(px+Math.cos(an)*r*.4,py+Math.sin(an)*r*.4);f.lineTo(px+Math.cos(an)*r*.9,py+Math.sin(an)*r*.9);}f.stroke();}
  // strikers: chunky inked discs in team colours
  for(let i=1;i>=0;i--){const x=s.psx[i]+(s.sx[i]-s.psx[i])*a,y=s.psy[i]+(s.sy[i]-s.psy[i])*a;striker(toScreenX(L,x,y),toScreenY(L,x,y),i?RED:TEAL,i?'#ff9c8a':'#7fe0d2');}
  // impact stars
  for(const st of stars){if(st.t>=st.dur)continue;st.t+=dt;const k=Math.min(1,st.t/st.dur),x=toScreenX(L,st.x,st.y),y=toScreenY(L,st.x,st.y),r=(3+st.size*4.2)*u/3.2*(.5+k*.9);
   f.globalAlpha=k<.6?1:1-(k-.6)/.4;f.beginPath();for(let i=0;i<8;i++){const an=st.rot+i*TAU/8,rr=i%2?r*.42:r;if(i)f.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr);else f.moveTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr);}f.closePath();f.fillStyle=st.color;f.fill();f.lineWidth=2;f.strokeStyle=INK;f.stroke();f.globalAlpha=1;}
  // the word burst (GOAL!, SAVE!, YOU WIN!)
  if(word.t<word.dur){word.t+=dt;const k=word.t/word.dur,pop=opts.reduced?1:k<.12?.5+k/.12*.62:k<.2?1.12-(k-.12)/.08*.12:1,x=toScreenX(L,word.x,word.y),y=toScreenY(L,word.x,word.y),base=Math.min(L.fw,L.side?L.fh*1.6:L.fw)*.3*word.size*pop;
   const turn=opts.reduced?0:-.06;
   f.save();f.translate(x,y);f.rotate(turn);f.globalAlpha=k>.86&&!opts.reduced?1-(k-.86)/.14:1;
   burstPath(5,6,base*1.5,base*.86,0);f.fillStyle=INK;f.fill();burstPath(0,0,base*1.5,base*.86,0);f.fillStyle=word.color;f.fill();f.lineWidth=3.5;f.strokeStyle=INK;f.stroke();
   const fs=base*(word.text.length>6?.42:.62);f.font=`italic 900 ${fs}px ${LETTER}`;f.textAlign='center';f.textBaseline='middle';f.lineJoin='round';f.lineWidth=Math.max(5,fs*.2);f.strokeStyle=INK;f.strokeText(word.text,0,word.sub?-fs*.2:0);f.fillStyle=word.fill;f.fillText(word.text,0,word.sub?-fs*.2:0);
   if(word.sub){const ss=Math.max(11,fs*.34);f.font=`900 ${ss}px ${LETTER}`;f.fillStyle=INK;f.fillText(word.sub,0,fs*.48);}
   f.restore();f.globalAlpha=1;}
 }
 /** True while a star, a word or a flash still has frames to play (the shell keeps drawing until they end). */
 const busy=()=>word.t<word.dur||flash.t<.7||stars.some(s=>s.t<s.dur);
 return {resize,render,onEvent,setHud,reset,clear,busy,get layout(){return L;},get pixels(){return Wp*Hp;}};
}
