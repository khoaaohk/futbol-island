/**
 * Air Futbol picture (Nov 11 2026, docs/arcade-aaa/airhockey-direction.md): comic print on a 2D canvas, the house style (ink
 * outlines, flat colour, Ben-Day dots, golden hour). Two canvases: `bg` is the beach, the boardwalk table, the mini pitch, the
 * printed score numerals and the rail labels, painted only when the size or the score changes; `fg` is the moving layer (puck,
 * strikers, speed lines, impact stars, word bursts), drawn between physics steps. No loop, no timers, no 3D engine: the shell calls
 * render. Nothing allocates per frame (stars and the trail are pooled). Circles do not care which way the table lies, so a phone
 * held sideways just maps the same table through a quarter turn (airLayout().side).
 */
import {AH,GOAL_BANK,GOAL_QUICK,GOAL_COUNTER,GOAL_OWN,GOAL_HOT,type AirFutbol,type AirEvent} from './core';
export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const {W,H,PR,SR,GOAL0,GOAL1}=AH,RAIL=4,END=7,FW=W+2*RAIL,FH=H+2*END,TAU=Math.PI*2;
type Ctx=CanvasRenderingContext2D;
const LETTER='"Arial Black",Impact,sans-serif';
/** AAA pass (Nov 18 2026). The evening moves on as the run does: one sky per group of levels (golden hour, sunset, dusk, night).
 *  [sand, sand dots, sky, sky dots, sun or moon, sea, sea dots] */
const SKIES=[['#ffcf7a','#f0a45a','#ffb45e','#ff9a4e',SUN,TEAL,'#7fdacb'],['#f6b877','#e58c58','#ff8f6b','#f0685a','#ffd35a','#1a9aa0','#6fcfc4'],
 ['#c9a08f','#a97f86','#8f78b8','#7460a3',ORANGE,'#2d6f8f','#5fa3b5'],['#6d6488','#574f74','#2f2747','#453a66',PAPER,'#243a5e','#3e5c85']] as const;
/** The opponents as island beans, one look each (the order of RAMP): [kit, skin, top], top = 0 bare, 1 cap, 2 tuft, 3 headband, 4 bun, 5 captain's hat, 6 lamp. */
const LOOKS:readonly (readonly [string,string,number])[]=[['#ffc83a','#f2b98a',1],['#19b5a5','#c98a5e',2],['#ff8a3c','#8a5a3c',4],['#f0452e','#e0a070',3],['#8f78b8','#f2c9a0',4],['#231a2e','#b87a52',0],
 ['#19b5a5','#f2b98a',3],['#ffc83a','#6e4630',4],['#f0452e','#c98a5e',2],['#8f78b8','#8a5a3c',1],['#fff3d6','#e0a070',5],['#f0452e','#fff3d6',6]];
const ease=(k:number)=>1-(1-k)*(1-k)*(1-k);

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

export type AirHud={top:string;bottom:string;goals:readonly [number,number];lives:number;level?:number};
export type AirView=ReturnType<typeof createAirView>;
export function createAirView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced?:boolean}={}){
 const b=bg.getContext('2d')!,f=fg.getContext('2d')!;let Wp=1,Hp=1,dpr=1,L=airLayout(390,700,62),top=62;
 let hud:AirHud={top:'',bottom:'',goals:[0,0],lives:-1},spin=0;
 const stars=Array.from({length:16},()=>({x:0,y:0,t:1,dur:.3,size:1,color:PAPER,rot:0}));
 const word={text:'',sub:'',t:9,dur:1,x:0,y:0,color:SUN,fill:RED,size:1};
 const flash={t:9,end:0};
 // AAA pass: all pooled, nothing allocates while a match runs
 const trail=Array.from({length:10},()=>({x:0,y:0,on:false}));let trailAt=0;
 const sparks=Array.from({length:28},()=>({x:0,y:0,vx:0,vy:0,t:1,dur:.3,color:PAPER}));let sparkAt=0;
 const pops=Array.from({length:3},()=>({text:'',x:0,y:0,t:9,dur:1}));let popAt=0;
 const shake={t:9,dur:.2,amp:0,on:false},squash={t:9,ax:0},pop=[9,9],mood={kind:0,t:9},blink={t:9};
 let clock=0,heat=0,cssW=390,beanX=W/2,lookX=0,lookY=0;

 function dots(c:Ctx,x:number,y:number,w:number,h:number,step:number,r:number,color:string){c.fillStyle=color;c.beginPath();let row=0;for(let yy=y+step/2;yy<y+h;yy+=step,row++)for(let xx=x+(row%2?step:step/2);xx<x+w;xx+=step){c.moveTo(xx+r,yy);c.arc(xx,yy,r,0,TAU);}c.fill();}
 /** Table space on a context: after this, draw in table units (0..W, 0..H), whichever way the table lies. */
 function table(c:Ctx){const s=L.scale*dpr;if(L.side)c.setTransform(0,-s,s,0,(L.cx-H/2*L.scale)*dpr,(L.cy+W/2*L.scale)*dpr);else c.setTransform(s,0,0,s,(L.cx-W/2*L.scale)*dpr,(L.cy-H/2*L.scale)*dpr);}
 /** A rail label, turned to face its reader: 0 = read from the bottom end, PI = from the top end; sideways solo reads level. */
 function label(c:Ctx,text:string,x:number,y:number,size:number,turn:number,color:string,align:CanvasTextAlign='center'){c.save();c.translate(x,y);c.rotate(turn);c.font=`italic 900 ${size}px ${LETTER}`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(text,0,0);c.restore();}
 function paint(){
  const c=b,u=L.scale;c.setTransform(dpr,0,0,dpr,0,0);const w=Wp/dpr,h=Hp/dpr;
  // the beach at golden hour: sand with a printed dot screen; with room above the table, a strip of sky, sun and sea
  const sk=SKIES[Math.max(0,Math.min(SKIES.length-1,Math.floor(((hud.level??1)-1)/3)))],night=sk===SKIES[3];c.fillStyle=sk[0];c.fillRect(0,0,w,h);dots(c,0,0,w,h,9,1.5,sk[1]);
  if(!L.side&&L.free>46){const y0=top-8,hh=L.free-6;c.fillStyle=sk[2];c.fillRect(0,0,w,y0+hh*.45);dots(c,0,y0,w,hh*.4,8,2.2,sk[3]);if(night){c.fillStyle=PAPER;for(let i=0;i<14;i++){const sx=(i*97+31)%w,sy=y0-6+(i*53%Math.max(1,hh*.36));c.fillRect(sx,sy,i%3?2:3,i%3?2:3);}}
   c.fillStyle=sk[4];c.strokeStyle=INK;c.lineWidth=3;c.beginPath();if(night)c.arc(w*.8,y0+hh*.2,Math.min(17,hh*.16),0,TAU);else c.arc(w*.78,y0+hh*.45,Math.min(34,hh*.36)*(sk===SKIES[2]?.62:1),Math.PI,TAU);c.fill();c.stroke();
   c.fillStyle=sk[5];c.fillRect(0,y0+hh*.45,w,hh*.33);dots(c,0,y0+hh*.47,w,hh*.3,10,1.8,sk[6]);c.fillStyle=PAPER;c.fillRect(0,y0+hh*.78,w,3);c.fillStyle=INK;c.fillRect(0,y0+hh*.45-1.5,w,3);}
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
  // Nov 18 2026: a long name ("L11 CAPTAIN CORAL") ran over the goal: the level now sits on the far side of the goal and the name is fitted to its rail
  if(hud.top){const cut=/^L\d+ /.test(hud.top)?hud.top.indexOf(' '):-1,name=cut<0?hud.top:hud.top.slice(cut+1),room=GOAL0-2.2+RAIL-4;c.font=`italic 900 4.4px ${LETTER}`;const wide=c.measureText(name).width;
   label(c,name,(GOAL0-2.2)/2-RAIL/2+1,-END/2,Math.max(2.4,Math.min(4.4,4.4*room/Math.max(1,wide))),0,INK);if(cut>0)label(c,hud.top.slice(0,cut),(GOAL1+2.2+W+RAIL)/2-1,-END/2,4.4,0,INK);}
  if(hud.bottom)label(c,hud.bottom,(GOAL0-2.2)/2-RAIL/2+1,H+END/2,4.4,0,INK);
  if(hud.lives>=0)for(let i=0;i<AH.LIVES;i++){const x=GOAL1+8+i*6.4,y=H+END/2;c.fillStyle=i<hud.lives?TEAL:'#e9742a';c.strokeStyle=INK;c.lineWidth=2.2/u;c.beginPath();c.arc(x,y,2.3,0,TAU);c.fill();c.stroke();}
 }
 function resize(cssW0:number,cssH:number,ratio:number,topRoom:number,bottom=8){
  dpr=ratio;top=topRoom;cssW=cssW0;Wp=Math.max(1,Math.round(cssW*dpr));Hp=Math.max(1,Math.round(cssH*dpr));for(const cv of [bg,fg]){if(cv.width!==Wp)cv.width=Wp;if(cv.height!==Hp)cv.height=Hp;}
  L=airLayout(cssW0,cssH,topRoom,bottom);paint();
 }
 /** The rail labels and the printed score. Repaints the static layer only when something changed. */
 function setHud(n:AirHud){if(n.top===hud.top&&n.bottom===hud.bottom&&n.goals[0]===hud.goals[0]&&n.goals[1]===hud.goals[1]&&n.lives===hud.lives&&n.level===hud.level)return;hud={...n,goals:[n.goals[0],n.goals[1]]};paint();}
 function star(x:number,y:number,size:number,color:string){if(opts.reduced)return;let best=stars[0];for(const s of stars){if(s.t>=s.dur){best=s;break;}if(s.t/s.dur>best.t/best.dur)best=s;}best.x=x;best.y=y;best.t=0;best.dur=.26+size*.05;best.size=size;best.color=color;best.rot=(x*7+y*3)%1.2;}
 function say(text:string,sub:string,x:number,y:number,dur:number,color:string,fill:string,size:number){word.text=text;word.sub=sub;word.t=0;word.dur=dur;word.x=x;word.y=y;word.color=color;word.fill=fill;word.size=size;}
 function spark(x:number,y:number,nx:number,ny:number,n:number,v:number,color:string){if(opts.reduced)return;for(let i=0;i<n;i++){const s=sparks[sparkAt=(sparkAt+1)%sparks.length],a=((i*2.4+x*.37+y*.61)%2-1)*1.25,ca=Math.cos(a),sa=Math.sin(a),k=v*(.45+((i*7+3)%5)*.14);s.x=x;s.y=y;s.vx=(nx*ca-ny*sa)*k;s.vy=(nx*sa+ny*ca)*k;s.t=0;s.dur=.2+(i%3)*.07;s.color=color;}}
 function quake(amp:number,dur:number){if(opts.reduced||(shake.t<shake.dur&&shake.amp>amp))return;shake.t=0;shake.dur=dur;shake.amp=amp;}
 function feel(kind:number){mood.kind=kind;mood.t=0;}
 function onEvent(e:AirEvent){
  if(e.type==='hit'){star(e.x,e.y,Math.min(3,.9+e.b/130),e.a===0?'#bff3ea':'#ffd0c2');pop[e.a]=0;if(e.b>150)spark(e.x,e.y,0,e.a===0?-1:1,4,60+e.b*.2,e.a===0?'#bff3ea':'#ffd0c2');}
  else if(e.type==='smash'){if(word.t>=word.dur)say('SMASH!','',W/2,H*.56,.45,ORANGE,PAPER,.42);quake(5,.2);spark(e.x,e.y,0,-1,9,150,SUN);feel(3);}
  else if(e.type==='wall'){star(e.x,e.y,Math.min(1.8,.5+e.b/220),PAPER);squash.t=0;squash.ax=e.a<2?0:1;if(e.b>90)spark(e.x,e.y,e.a===0?1:e.a===1?-1:0,e.a===2?1:e.a===3?-1:0,e.b>200?6:3,50+e.b*.25,heat>.6?ORANGE:SUN);
   // a shot that goes just past a post: the rail lights blink and the table says so
   if(e.a>=2&&e.b>120&&(Math.abs(e.x-GOAL0)<10||Math.abs(e.x-GOAL1)<10)){blink.t=0;if(word.t>=word.dur)say(e.a===2?'CLOSE!':'PHEW!','',W/2,e.a===2?H*.2:H*.62,.5,PAPER,e.a===2?RED:TEAL,.42);if(e.a===3)feel(3);}}
  else if(e.type==='post'){star(e.x,e.y,Math.min(1.8,.5+e.b/220),PAPER);spark(e.x,e.y,0,e.a===0?1:-1,6,90,PAPER);blink.t=0;if(e.b>70&&word.t>=word.dur)say('OFF THE POST!','',W/2,e.a===0?H*.2:H*.62,.6,PAPER,VIOLET,.5);}
  else if(e.type==='heat'){blink.t=0;if(e.a===1)say('HEATING UP!','',W/2,H/2,.6,SUN,RED,.46);else if(e.a===3){say('ON FIRE!','',W/2,H/2,.7,ORANGE,PAPER,.52);quake(3,.25);}}
  else if(e.type==='save'){if(e.a===0)say('SAVE!','',W/2,H*.6,.5,TEAL,PAPER,.46);}
  else if(e.type==='goal'){const own=(e.b&GOAL_OWN)!==0,mine=e.a===0,sub=own?(mine?'':'Own goal'):e.b&GOAL_BANK?`BANK SHOT +${AH.pts.bank}`:e.b&GOAL_COUNTER?`COUNTER +${AH.pts.counter}`:e.b&GOAL_QUICK?`QUICK +${AH.pts.quick}`:e.b&GOAL_HOT?'HOT RALLY!':'';
   say('GOAL!',sub,W/2,H/2,AH.GOAL_BEAT,mine?SUN:PAPER,mine?RED:VIOLET,mine?1:.74);flash.t=0;flash.end=e.a===0?0:1;quake(mine?6:4,.3);feel(mine?2:1);
   if(mine){const pts=AH.pts.goal+(own?0:(e.b&GOAL_BANK?AH.pts.bank:0)+(e.b&GOAL_QUICK?AH.pts.quick:0)+(e.b&GOAL_COUNTER?AH.pts.counter:0)),p=pops[popAt=(popAt+1)%pops.length];p.text=`+${pts}`;p.x=W/2;p.y=10;p.t=0;p.dur=.95;}
   spark(W/2,e.a===0?2:H-2,0,e.a===0?1:-1,12,170,mine?SUN:PAPER);
   for(let i=0;i<6;i++)star(GOAL0+(GOAL1-GOAL0)*(i+.5)/6,e.a===0?4+(i%2)*7:H-4-(i%2)*7,1.6+(i%3)*.5,i%2?SUN:PAPER);}
  else if(e.type==='win'){say('YOU WIN!',`+${e.b}`,W/2,H/2,1.6,SUN,RED,.82);feel(2);const p=pops[popAt=(popAt+1)%pops.length];p.text=`+${e.b}`;p.x=W/2;p.y=H/2-22;p.t=0;p.dur=1.3;}
  else if(e.type==='lose'){say(e.a>0?'BEATEN!':'FULL TIME',e.a>0?`${e.a} ${e.a===1?'life':'lives'} left`:'',W/2,H/2,1.6,PAPER,VIOLET,.74);feel(1);}
  else if(e.type==='life'){blink.t=0;const p=pops[popAt=(popAt+1)%pops.length];p.text='+1 LIFE';p.x=W*.8;p.y=H-8;p.t=0;p.dur=1.1;}
  else if(e.type==='next'){feel(0);for(const p of trail)p.on=false;}
 }
 function reset(){for(const s of stars)s.t=s.dur;for(const s of sparks)s.t=s.dur;for(const p of pops)p.t=9;for(const p of trail)p.on=false;word.t=9;flash.t=9;shake.t=9;squash.t=9;blink.t=9;pop[0]=pop[1]=9;mood.kind=0;mood.t=9;heat=0;still();}
 function still(){if(shake.on){shake.on=false;bg.style.transform='';fg.style.transform='';}}
 function wipe(){f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,Wp,Hp);}
 function clear(){wipe();still();}
 function disc(x:number,y:number,r:number,fill:string,line:number){f.beginPath();f.arc(x,y,r,0,TAU);f.fillStyle=fill;f.fill();if(line){f.lineWidth=line;f.strokeStyle=INK;f.stroke();}}
 function striker(x:number,y:number,color:string,light:string,grow:number,face:boolean){const r=SR*L.scale*grow,o=Math.max(2,r*.13);
  f.globalAlpha=.3;disc(x+o,y+o*1.3,r,INK,0);f.globalAlpha=1;disc(x,y,r,color,3);f.beginPath();f.arc(x,y,r*.68,0,TAU);f.lineWidth=2;f.strokeStyle='#231a2e66';f.stroke();
  disc(x,y,r*.44,light,2.5);f.beginPath();f.arc(x,y,r*.84,Math.PI*1.08,Math.PI*1.42);f.lineWidth=Math.max(2,r*.1);f.strokeStyle='#fff3d6cc';f.lineCap='round';f.stroke();f.lineCap='butt';
  if(face){// the opponent's striker has their face: the eyes follow the puck, the mouth says how the match is going
   const e=r*.13,ex=lookX*e*.7,ey=lookY*e*.7,m=mood.t<1.4?mood.kind:0;f.fillStyle=PAPER;f.strokeStyle=INK;f.lineWidth=1.6;for(const k of [-1,1]){f.beginPath();f.arc(x+k*r*.17,y-r*.07,e*1.15,0,TAU);f.fill();f.stroke();}
   f.fillStyle=INK;for(const k of [-1,1]){f.beginPath();f.arc(x+k*r*.17+ex,y-r*.07+ey,e*.55,0,TAU);f.fill();}
   f.beginPath();if(m===1)f.arc(x,y+r*.13,r*.15,0,Math.PI);else if(m===2)f.arc(x,y+r*.3,r*.13,Math.PI,TAU);else if(m===3)f.arc(x,y+r*.2,r*.07,0,TAU);else{f.moveTo(x-r*.12,y+r*.2);f.lineTo(x+r*.12,y+r*.2);}f.lineWidth=2;f.lineCap='round';f.stroke();f.lineCap='butt';}}
 /** An island bean behind the far end (tall phones only, where the sky strip has room): it leans with its striker, watches the puck,
  *  jumps when it scores and sinks when you do. Drawn above the table edge only. */
 function bean(level:number,cx:number,edge:number,h:number){
  const look=LOOKS[(Math.max(1,level)-1)%LOOKS.length],m=mood.t<1.4?mood.kind:0,k=Math.min(1,mood.t/1.4),w=h*.68,hop=opts.reduced?0:m===1?-Math.abs(Math.sin(k*Math.PI*3))*h*.16:m===2?h*.07*ease(Math.min(1,k*3)):Math.sin(clock*2.2)*h*.012,sq=m===2?.94:1;
  f.save();f.beginPath();f.rect(0,0,cssW,edge);f.clip();f.translate(cx,edge+h*.2+hop);f.scale(1,sq);
  // arms first (behind the body): up for a goal, on the head when beaten
  f.lineCap='round';f.strokeStyle=INK;f.lineWidth=h*.13;const up=m===1?-h*.62:m===2?-h*.5:-h*.3,out=m===2?w*.3:w*.72;for(const s of [-1,1]){f.beginPath();f.moveTo(s*w*.4,-h*.42);f.lineTo(s*out,up-h*.4);f.stroke();}
  f.strokeStyle=look[1];f.lineWidth=h*.075;for(const s of [-1,1]){f.beginPath();f.moveTo(s*w*.4,-h*.42);f.lineTo(s*out,up-h*.4);f.stroke();}f.lineCap='butt';
  // the bean: one rounded body, skin above, kit below
  const r=w/2;f.beginPath();f.moveTo(-r,0);f.lineTo(-r,-h+r);f.arc(0,-h+r,r,Math.PI,TAU);f.lineTo(r,0);f.closePath();f.fillStyle=look[1];f.fill();
  f.save();f.clip();f.fillStyle=look[0];f.fillRect(-r,-h*.4,w,h*.4);f.fillStyle='#231a2e2e';for(let i=0;i<4;i++)f.fillRect(-r+i*w/4,-h*.4,w/8,h*.4);f.fillStyle=INK;f.fillRect(-r,-h*.4-1.5,w,3);f.restore();
  f.lineWidth=3;f.strokeStyle=INK;f.stroke();
  // face
  const ey=-h*.66,ex=lookX*w*.05,ed=lookY*h*.02+h*.012;f.fillStyle=PAPER;f.lineWidth=2;for(const s of [-1,1]){f.beginPath();f.ellipse(s*w*.2,ey,w*.13,m===2?w*.07:w*.16,0,0,TAU);f.fill();f.stroke();}
  f.fillStyle=INK;for(const s of [-1,1]){f.beginPath();f.arc(s*w*.2+ex,ey+ed,w*.06,0,TAU);f.fill();}
  f.beginPath();if(m===1){f.arc(0,-h*.53,w*.17,0,Math.PI);f.closePath();f.fillStyle=RED;f.fill();}else if(m===2)f.arc(0,-h*.47,w*.13,Math.PI*1.15,Math.PI*1.85);else if(m===3)f.arc(0,-h*.5,w*.07,0,TAU);else f.arc(0,-h*.55,w*.14,Math.PI*.15,Math.PI*.85);f.lineWidth=2.5;f.lineCap='round';f.stroke();f.lineCap='butt';
  // what they wear on top
  const tp=look[2],ty=-h;f.fillStyle=look[0];f.lineWidth=2.5;f.beginPath();
  if(tp===1){f.arc(0,ty+r*.62,r*.98,Math.PI*1.04,TAU*.99);f.lineTo(r*1.5,ty+r*.66);f.lineTo(-r*.9,ty+r*.66);f.closePath();f.fill();f.stroke();}
  else if(tp===2){f.fillStyle=INK;f.moveTo(-r*.5,ty+r*.28);f.lineTo(-r*.3,ty-r*.4);f.lineTo(-r*.05,ty+r*.05);f.lineTo(r*.15,ty-r*.5);f.lineTo(r*.3,ty+r*.08);f.lineTo(r*.6,ty-r*.2);f.lineTo(r*.55,ty+r*.34);f.closePath();f.fill();}
  else if(tp===3){f.save();f.beginPath();f.moveTo(-r,0);f.lineTo(-r,-h+r);f.arc(0,-h+r,r,Math.PI,TAU);f.lineTo(r,0);f.clip();f.fillStyle=look[0]===look[1]?RED:look[0];f.fillRect(-r,ty+r*.5,w,r*.3);f.fillStyle=INK;f.fillRect(-r,ty+r*.5-1,w,2);f.fillRect(-r,ty+r*.8-1,w,2);f.restore();}
  else if(tp===4){f.fillStyle=INK;f.arc(0,ty-r*.12,r*.36,0,TAU);f.fill();f.beginPath();f.arc(0,ty+r*.66,r*.96,Math.PI*1.08,Math.PI*1.92);f.lineWidth=r*.3;f.stroke();}
  else if(tp===5){f.fillStyle=PAPER;f.rect(-r*.8,ty-r*.2,r*1.6,r*.56);f.fill();f.stroke();f.fillStyle=INK;f.fillRect(-r*1.02,ty+r*.34,r*2.04,r*.2);f.fillStyle=SUN;f.beginPath();f.arc(0,ty+r*.08,r*.16,0,TAU);f.fill();f.stroke();}
  else if(tp===6){f.fillStyle=SUN;f.rect(-r*.42,ty-r*.5,r*.84,r*.62);f.fill();f.stroke();f.fillStyle=RED;f.beginPath();f.moveTo(-r*.62,ty-r*.5);f.lineTo(0,ty-r*1.05);f.lineTo(r*.62,ty-r*.5);f.closePath();f.fill();f.stroke();}
  f.restore();}
 function burstPath(x:number,y:number,rx:number,ry:number,rot:number){f.beginPath();const n=14;for(let i=0;i<n*2;i++){const r=i%2?.76:1,a=Math.PI*i/n+.1+rot;const px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;if(i)f.lineTo(px,py);else f.moveTo(px,py);}f.closePath();}
 function render(g:AirFutbol,dt:number){
  const s=g.state,a=Math.max(0,Math.min(1,g.alpha)),u=L.scale;wipe();f.setTransform(dpr,0,0,dpr,0,0);clock+=dt;heat+=(s.heat-heat)*Math.min(1,dt*6);mood.t+=dt;blink.t+=dt;pop[0]+=dt;pop[1]+=dt;squash.t+=dt;
  const tx=s.ppx+(s.px-s.ppx)*a,ty=s.ppy+(s.py-s.ppy)*a,px=toScreenX(L,tx,ty),py=toScreenY(L,tx,ty),sp=Math.hypot(s.pvx,s.pvy);
  // the table moves on a big hit (the canvases shift together; composited, no repaint)
  if(shake.t<shake.dur){shake.t+=dt;const k=1-Math.min(1,shake.t/shake.dur),m=shake.amp*k*k;shake.on=true;const tr=`translate3d(${(Math.sin(clock*71)*m).toFixed(1)}px,${(Math.cos(clock*57)*m).toFixed(1)}px,0)`;bg.style.transform=tr;fg.style.transform=tr;}else still();
  // rail lights: they fill from the halfway line as the rally warms, chase round after a goal, blink on a near miss
  {const n=9,goalK=flash.t<1.1?Math.floor(flash.t*14):-1,near=blink.t<.3&&Math.floor(blink.t*20)%2===0,lit=heat*(n+1)/2,r=1.3*u,hotC=heat>.66?(Math.floor(clock*8)%2?PAPER:SUN):heat>.33?SUN:PAPER;
   for(let pass=0;pass<2;pass++){f.beginPath();for(let side=0;side<2;side++)for(let i=0;i<n;i++){const d=Math.abs(i-(n-1)/2),on=opts.reduced?d<lit:goalK>=0?(i+goalK+side)%3===0:near||d<lit||(heat>.66&&(i+Math.floor(clock*10))%2===0);if(on!==(pass===1))continue;const y=H*(i+.5)/n,x=side?W+RAIL/2:-RAIL/2,X=toScreenX(L,x,y),Y=toScreenY(L,x,y);f.moveTo(X+r,Y);f.arc(X,Y,r,0,TAU);}
    f.fillStyle=pass?(goalK>=0?(flash.end?PAPER:SUN):near?PAPER:hotC):'#7a3a1c';f.fill();f.lineWidth=1.6;f.strokeStyle=INK;f.stroke();}}
  // the goal that was scored in flashes its net (two blinks)
  if(flash.t<1.1)flash.t+=dt;if(flash.t<.7){if(!opts.reduced&&Math.floor(flash.t*8)%2===0){const y=flash.end?H+END/2:-END/2,gx=toScreenX(L,W/2,y),gy=toScreenY(L,W/2,y),gw=(GOAL1-GOAL0)*u,gh=(END-1.6)*u;f.fillStyle=SUN;if(L.side)f.fillRect(gx-gh/2,gy-gw/2,gh,gw);else f.fillRect(gx-gw/2,gy-gh/2,gw,gh);}}
  // serve mark: a dashed ring round the waiting puck
  if(s.phase==='wait'){f.setLineDash([6,5]);f.lineWidth=2.5;f.strokeStyle=PAPER;f.beginPath();f.arc(px,py,(PR+4)*u,0,TAU);f.stroke();f.setLineDash([]);}
  // the trail: where the puck has just been, longer with speed, warmer with the rally
  if(!opts.reduced){if(s.phase==='play'&&!s.inGoal&&sp>70&&dt>0){const p=trail[trailAt=(trailAt+1)%trail.length];p.x=tx;p.y=ty;p.on=true;}else if(dt>0){trail[trailAt=(trailAt+1)%trail.length].on=false;}
   const n=trail.length,show=Math.min(n,3+Math.floor(sp/45)),r=PR*u;f.fillStyle=heat>.66?'#ffb03a':heat>.33?SUN:PAPER;for(let i=1;i<show;i++){const p=trail[(trailAt-i+n*2)%n];if(!p.on)break;f.globalAlpha=(heat>.33?.6:.36)*(1-i/show);disc(toScreenX(L,p.x,p.y),toScreenY(L,p.x,p.y),r*(1-i/(show*1.4)),f.fillStyle as string,0);}f.globalAlpha=1;}
  // speed lines behind a fast puck
  if(!s.inGoal&&sp>95&&!opts.reduced){const dx=-s.pvx/sp,dy=-s.pvy/sp,sdx=toScreenX(L,dx,dy)-toScreenX(L,0,0),sdy=toScreenY(L,dx,dy)-toScreenY(L,0,0),n=Math.hypot(sdx,sdy)||1,ux=sdx/n,uy=sdy/n,len=Math.min(46,sp*.12)*u/3.4,r=PR*u;
   f.strokeStyle=INK;f.lineWidth=2;f.lineCap='round';f.beginPath();for(let k=-1;k<=1;k++){const ox=-uy*k*r*.62,oy=ux*k*r*.62,l=len*(k?.62:1);f.moveTo(px+ox+ux*r*1.25,py+oy+uy*r*1.25);f.lineTo(px+ox+ux*(r*1.25+l),py+oy+uy*(r*1.25+l));}f.stroke();f.lineCap='butt';}
  // puck: a flat football disc
  if(!s.inGoal||flash.t<.25){const r=PR*u;spin+=sp*dt*.02;f.globalAlpha=.3;disc(px+2,py+3,r,INK,0);f.globalAlpha=1;
   // it stretches along its path with speed and flattens for a moment on a board
   const st=opts.reduced?0:Math.min(.22,sp/1500),sq=opts.reduced||squash.t>.1?0:.24*(1-squash.t/.1),sdx=sp>1?toScreenX(L,s.pvx,s.pvy)-toScreenX(L,0,0):1,sdy=sp>1?toScreenY(L,s.pvx,s.pvy)-toScreenY(L,0,0):0,ang=sq?(squash.ax===(L.side?1:0)?0:Math.PI/2):Math.atan2(sdy,sdx);
   f.save();f.translate(px,py);f.rotate(ang);f.scale(sq?1-sq:1+st,sq?1+sq*.6:1-st*.5);f.rotate(-ang);f.translate(-px,-py);disc(px,py,r,heat>.66?'#ffe1b0':PAPER,2.5);
   f.fillStyle=INK;f.beginPath();for(let i=0;i<5;i++){const an=spin+i*TAU/5;const qx=px+Math.cos(an)*r*.4,qy=py+Math.sin(an)*r*.4;if(i)f.lineTo(qx,qy);else f.moveTo(qx,qy);}f.closePath();f.fill();
   f.lineWidth=1.6;f.strokeStyle=INK;f.beginPath();for(let i=0;i<5;i++){const an=spin+i*TAU/5;f.moveTo(px+Math.cos(an)*r*.4,py+Math.sin(an)*r*.4);f.lineTo(px+Math.cos(an)*r*.9,py+Math.sin(an)*r*.9);}f.stroke();f.restore();}
  // strikers: chunky inked discs in team colours
  for(let i=1;i>=0;i--){const x=s.psx[i]+(s.sx[i]-s.psx[i])*a,y=s.psy[i]+(s.sy[i]-s.psy[i])*a;if(i){const dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy)||1,ldx=toScreenX(L,dx/d,dy/d)-toScreenX(L,0,0),ldy=toScreenY(L,dx/d,dy/d)-toScreenY(L,0,0),ln=Math.hypot(ldx,ldy)||1;lookX=ldx/ln;lookY=ldy/ln;beanX+=(x-beanX)*Math.min(1,dt*5);}
   striker(toScreenX(L,x,y),toScreenY(L,x,y),i?RED:TEAL,i?'#ff9c8a':'#7fe0d2',opts.reduced||pop[i]>.14?1:1+.13*(1-pop[i]/.14),i===1);}
  if(!L.side&&L.free>46)bean(s.level,toScreenX(L,W/2+(beanX-W/2)*.55,0),L.y0+1.5,Math.min(118,L.free*.74));
  // sparks off the boards, the posts and big hits
  f.lineCap='round';f.lineWidth=2.4;for(const k of sparks){if(k.t>=k.dur)continue;k.t+=dt;k.x+=k.vx*dt;k.y+=k.vy*dt;k.vx*=1-3*dt;k.vy*=1-3*dt;const q=1-Math.min(1,k.t/k.dur),X=toScreenX(L,k.x,k.y),Y=toScreenY(L,k.x,k.y),X2=toScreenX(L,k.x-k.vx*.035,k.y-k.vy*.035),Y2=toScreenY(L,k.x-k.vx*.035,k.y-k.vy*.035);f.globalAlpha=q;f.strokeStyle=INK;f.lineWidth=4;f.beginPath();f.moveTo(X,Y);f.lineTo(X2,Y2);f.stroke();f.strokeStyle=k.color;f.lineWidth=2;f.stroke();}f.globalAlpha=1;f.lineCap='butt';
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
  // points fly from the goal up to the score counter
  for(const p of pops){if(p.t>=p.dur)continue;p.t+=dt;const k=Math.min(1,p.t/p.dur),fly=opts.reduced?0:k<.3?0:(k-.3)/.7,e=fly*fly,x0=toScreenX(L,p.x,p.y),y0=toScreenY(L,p.x,p.y),x=x0+(cssW/2-x0)*e,y=y0+(top*.45-y0)*e,size=Math.max(15,L.fw*.075)*(k<.12?.6+k/.12*.55:1.15-e*.45);
   f.globalAlpha=k>.9?(1-k)/.1:1;f.font=`italic 900 ${size}px ${LETTER}`;f.textAlign='center';f.textBaseline='middle';f.lineJoin='round';f.lineWidth=Math.max(4,size*.22);f.strokeStyle=INK;f.strokeText(p.text,x,y);f.fillStyle=SUN;f.fillText(p.text,x,y);f.globalAlpha=1;}
 }
 /** True while a star, a word or a flash still has frames to play (the shell keeps drawing until they end). */
 const busy=()=>word.t<word.dur||flash.t<1.1||shake.t<shake.dur||mood.t<1.4||blink.t<.3||stars.some(s=>s.t<s.dur)||sparks.some(s=>s.t<s.dur)||pops.some(p=>p.t<p.dur);
 return {resize,render,onEvent,setHud,reset,clear,busy,get layout(){return L;},get pixels(){return Wp*Hp;}};
}
