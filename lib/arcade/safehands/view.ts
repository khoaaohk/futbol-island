/**
 * Safe Hands drawing (Nov 21 2026, docs/arcade-aaa/safehands-direction.md): canvas 2D in the arcade's comic print style (the kit's hex
 * values, ink outlines, Ben-Day dots, hard shadows; no gradients, blur or glow).
 * One comic page, two panels:
 *   the PITCH (whole canvas): what the keeper's side sees, from behind and above the goal. The net and frame are nearest, then the
 *   keeper (the player's own island bean, seen from the back, in gloves), the angle cone from the ball to the posts, the striker far away.
 *   the CLOSE-UP (inset panel at the top): the striker seen from the keeper's eyes, big enough to read the tells on a phone: the
 *   approach, the glance, the hips, the planted foot, the lean and the wind-up.
 * Heat: `bg` holds everything static (pitch, lines, far band) and is painted once per size or venue; `fg` is the only canvas redrawn,
 * and only while the shell's loop runs (playing). The net and the close-up's backdrop are cached canvases. No timers, no particles.
 */
import {SH,STRIKERS,TIERS,idealFor,type SafeHands,type ShEvent,type Striker} from './core';

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8',WHITE='#fffaf0';
const TAU=Math.PI*2,CAM_BACK=8.5,CAM_Y=6;
type Ctx=CanvasRenderingContext2D;
/** Venues by round: a park at sunset, the academy pitch, a floodlit stadium, the cup final at night in the rain. */
export const VENUES=[
 {name:'The park, at sunset',sky:'#ffb45e',dots:'#ff8f4e',band:'#b9603f',g1:'#62b85f',g2:'#56aa55',back:'#4a9a4c',line:PAPER},
 {name:'The academy pitch',sky:'#8fd4ee',dots:'#6fbfe0',band:'#e8e2d4',g1:'#4fb85c',g2:'#45a852',back:'#3f9a4a',line:WHITE},
 {name:'The stadium, under the lights',sky:'#6d6488',dots:'#574f74',band:'#3a3154',g1:'#41a05e',g2:'#389152',back:'#2f7f47',line:WHITE},
 {name:'The cup final, in the rain',sky:'#2f2747',dots:'#453a66',band:'#231a2e',g1:'#33875a',g2:'#2b794f',back:'#246a44',line:'#e9f5ff'},
] as const;
export type KeeperLook={body:string;skin:string;hair:string;glove:string};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v,ease=(k:number)=>1-(1-k)*(1-k);

function dots(c:Ctx,x:number,y:number,w:number,h:number,color:string,step=8,r=1.5){c.fillStyle=color;c.beginPath();for(let j=0,yy=y+step/2;yy<y+h;yy+=step,j++)for(let xx=x+(j%2?step:step/2);xx<x+w;xx+=step){c.moveTo(xx+r,yy);c.arc(xx,yy,r,0,TAU);}c.fill();}
function rr(c:Ctx,x:number,y:number,w:number,h:number,r:number){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.arc(x+w-r,y+r,r,-Math.PI/2,0);c.lineTo(x+w,y+h-r);c.arc(x+w-r,y+h-r,r,0,Math.PI/2);c.lineTo(x+r,y+h);c.arc(x+r,y+h-r,r,Math.PI/2,Math.PI);c.lineTo(x,y+r);c.arc(x+r,y+r,r,Math.PI,Math.PI*1.5);c.closePath();}
/** A paper tag with an ink edge and a hard shadow (canvas twin of the kit's caption box). */
function tag(c:Ctx,text:string,x:number,y:number,o:{fill?:string;color?:string;size?:number;align?:'left'|'center'|'right'}={}){
 const size=o.size??12;c.font=`italic 900 ${size}px "Arial Black",Impact,sans-serif`;const w=Math.ceil(c.measureText(text).width)+12,h=size+9,x0=o.align==='center'?x-w/2:o.align==='right'?x-w:x;
 c.fillStyle=INK;c.fillRect(x0+3,y+3,w,h);c.fillStyle=o.fill??PAPER;c.fillRect(x0,y,w,h);c.lineWidth=2.5;c.strokeStyle=INK;c.strokeRect(x0,y,w,h);c.fillStyle=o.color??INK;c.textBaseline='middle';c.textAlign='left';c.fillText(text,x0+6,y+h/2+1);return w;}
function ballArt(c:Ctx,x:number,y:number,r:number,spin=0){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=WHITE;c.fill();c.lineWidth=Math.max(1.5,r*.22);c.strokeStyle=INK;c.stroke();
 if(r>4){c.fillStyle=INK;c.beginPath();for(let i=0;i<5;i++){const a=spin+i*TAU/5,px=x+Math.cos(a)*r*.36,py=y+Math.sin(a)*r*.36;if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.closePath();c.fill();
  c.lineWidth=Math.max(1,r*.12);c.beginPath();for(let i=0;i<5;i++){const a=spin+i*TAU/5;c.moveTo(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4);c.lineTo(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92);}c.stroke();}}
function star(c:Ctx,x:number,y:number,r:number,n=10,rot=0){c.beginPath();for(let i=0;i<n*2;i++){const rad=i%2?r*.55:r,a=rot+Math.PI*i/n;if(i)c.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);else c.moveTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}c.closePath();}

/** What the bean wears on top (the island beans' heads): 0 bare, 1 cap, 2 tuft, 3 headband, 4 bun, 5 captain's band. */
function topper(c:Ctx,top:number,w:number,h:number,kit:string){const r=w/2,ty=-h;c.lineWidth=2.5;c.strokeStyle=INK;c.beginPath();
 if(top===1){c.fillStyle=kit;c.arc(0,ty+r*.62,r*.98,Math.PI*1.04,TAU*.99);c.lineTo(r*1.4,ty+r*.66);c.lineTo(-r*.9,ty+r*.66);c.closePath();c.fill();c.stroke();}
 else if(top===2){c.fillStyle=INK;c.moveTo(-r*.5,ty+r*.28);c.lineTo(-r*.3,ty-r*.4);c.lineTo(-r*.05,ty+r*.05);c.lineTo(r*.15,ty-r*.5);c.lineTo(r*.3,ty+r*.08);c.lineTo(r*.6,ty-r*.2);c.lineTo(r*.55,ty+r*.34);c.closePath();c.fill();}
 else if(top===3||top===5){c.fillStyle=top===5?SUN:RED;c.fillRect(-r*.9,ty+r*.2,w*.9,r*.24);c.strokeRect(-r*.9,ty+r*.2,w*.9,r*.24);}
 else if(top===4){c.fillStyle=INK;c.arc(0,ty-r*.1,r*.36,0,TAU);c.fill();c.beginPath();c.arc(0,ty+r*.66,r*.96,Math.PI*1.08,Math.PI*1.92);c.lineWidth=r*.3;c.stroke();}}

export type SafehandsView=ReturnType<typeof createSafehandsView>;
export function createSafehandsView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean}){
 const b=bg.getContext('2d',{alpha:false})!,f=fg.getContext('2d')!;
 const net=document.createElement('canvas'),nctx=net.getContext('2d')!,pan=document.createElement('canvas'),pctx=pan.getContext('2d')!;
 let W=390,H=844,dpr=1,top=104,F=360,horY=380,venue=-1,painted=-1,look:KeeperLook={body:'#19b5a5',skin:'#f2b98a',hair:INK,glove:SUN};
 /** the close-up panel (css px) */const P={x:10,y:104,w:370,h:250};
 let flash={t:-9,x:0,y:0,good:true},shakeT=-9,lastNow=0;

 /** world metres -> css px; s = px per metre there */
 function project(x:number,y:number,z:number){const dz=Math.max(.6,z+CAM_BACK);return {x:W/2+F*x/dz,y:horY+F*(CAM_Y-y)/dz,s:F/dz};}
 function resize(cssW:number,cssH:number,ratio:number,topClear:number){
  W=Math.max(1,cssW);H=Math.max(1,cssH);dpr=Math.min(2,Math.max(1,ratio));top=topClear;
  P.x=10;P.w=W-20;P.y=top;P.h=Math.round(clamp(H*.29,150,300));
  horY=P.y+P.h+24;F=Math.min(W*.92,Math.max(120,(H-horY-128))*CAM_BACK/CAM_Y);
  for(const cv of [bg,fg,net]){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}for(const cv of [bg,fg]){cv.style.width=`${W}px`;cv.style.height=`${H}px`;}
  pan.width=Math.round(P.w*dpr);pan.height=Math.round(P.h*dpr);painted=-1;}
 function setLook(l:Partial<KeeperLook>){look={...look,...l};}

 /* ---- static layers ---- */
 function line(c:Ctx,pts:[number,number][],w=2.5,color=PAPER){c.beginPath();pts.forEach(([x,z],i)=>{const p=project(x,0,z);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);});c.lineWidth=w;c.strokeStyle=color;c.stroke();}
 function paintStatic(v:number){painted=v;const V=VENUES[v];
  b.setTransform(dpr,0,0,dpr,0,0);b.fillStyle=V.sky;b.fillRect(0,0,W,horY);dots(b,0,0,W,horY,V.dots);
  b.fillStyle=V.band;b.fillRect(0,horY-13,W,13);b.fillStyle=INK;b.fillRect(0,horY-1.5,W,3);
  // mown stripes, far to near
  for(let i=11;i>=0;i--){const y0=i===11?horY:project(0,0,(i+1)*5.5).y,y1=project(0,0,i*5.5).y;b.fillStyle=i%2?V.g1:V.g2;b.fillRect(0,y0,W,y1-y0+1);}
  const gl=project(0,0,0).y;b.fillStyle=V.back;b.fillRect(0,gl,W,H-gl);dots(b,0,gl,W,H-gl,'#231a2e30',9,1.7);
  // the lines: goal line, penalty area, six-yard area, the spot, the D
  b.lineJoin='round';line(b,[[-40,0],[40,0]],3.5,V.line);line(b,[[-20.16,0],[-20.16,16.5],[20.16,16.5],[20.16,0]],2.5,V.line);line(b,[[-9.16,0],[-9.16,5.5],[9.16,5.5],[9.16,0]],2.5,V.line);
  {const d:[number,number][]=[];for(let a=-.93;a<=.93;a+=.11)d.push([Math.sin(a)*9.15,11+Math.cos(a)*9.15]);line(b,d.filter(p=>p[1]>=16.5),2.5,V.line);const sp=project(0,0,11);b.fillStyle=V.line;b.beginPath();b.ellipse(sp.x,sp.y,4,2,0,0,TAU);b.fill();}
  if(v===3){b.strokeStyle='#e9f5ff55';b.lineWidth=1.5;b.beginPath();for(let i=0;i<70;i++){const x=(i*97)%W,y=horY+((i*53)%Math.max(1,gl-horY));b.moveTo(x,y);b.lineTo(x-4,y+11);}b.stroke();}
  // the goal (nearest thing to the camera): net first, frame on top. Cached; drawn over the keeper every frame.
  nctx.setTransform(dpr,0,0,dpr,0,0);nctx.clearRect(0,0,W,H);const G=SH.goalHalf,Hg=SH.goalH,D=-2.2,Hb=1.9;
  const seg=(c:Ctx,a:[number,number,number],d:[number,number,number])=>{const p=project(...a),q=project(...d);c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);};
  nctx.strokeStyle='#fff3d680';nctx.lineWidth=1.2;nctx.beginPath();
  for(let x=-G;x<=G+.01;x+=.61){seg(nctx,[x,Hg,0],[x,Hb,D]);seg(nctx,[x,Hb,D],[x,0,D]);}
  for(let y=.38;y<Hb;y+=.38){seg(nctx,[-G,y,D],[G,y,D]);seg(nctx,[-G,y*Hg/Hb,0],[-G,y,D]);seg(nctx,[G,y*Hg/Hb,0],[G,y,D]);}
  for(let k=.25;k<1;k+=.25){seg(nctx,[-G,Hg+(Hb-Hg)*k,D*k],[G,Hg+(Hb-Hg)*k,D*k]);}
  nctx.stroke();
  for(const [w,col] of [[9,INK],[5,WHITE]] as const){nctx.strokeStyle=col;nctx.lineWidth=w;nctx.lineCap='round';nctx.lineJoin='round';nctx.beginPath();seg(nctx,[-G,0,0],[-G,Hg,0]);const p=project(G,Hg,0),q=project(G,0,0);nctx.lineTo(p.x,p.y);nctx.lineTo(q.x,q.y);nctx.stroke();}
  nctx.strokeStyle=INK;nctx.lineWidth=2.5;nctx.beginPath();seg(nctx,[-G,Hg,0],[-G,Hb,D]);seg(nctx,[-G,Hb,D],[-G,0,D]);seg(nctx,[G,Hg,0],[G,Hb,D]);seg(nctx,[G,Hb,D],[G,0,D]);seg(nctx,[-G,Hb,D],[G,Hb,D]);seg(nctx,[-G,0,D],[G,0,D]);nctx.stroke();
  // the close-up's backdrop: the venue behind the striker
  const c=pctx,w=P.w,h=P.h,gy=h*.74;c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle=V.sky;c.fillRect(0,0,w,h);dots(c,0,0,w,gy,V.dots,9,1.8);
  if(v===0){c.fillStyle='#ffd35a';c.beginPath();c.arc(w*.78,gy-6,h*.2,Math.PI,TAU);c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();c.fillStyle='#3f8f55';for(let i=0;i<7;i++){c.beginPath();c.arc(w*(i/6)+((i*37)%19-9),gy-h*.07,h*(.1+((i*13)%5)*.012),Math.PI,TAU);c.fill();c.stroke();}c.fillStyle=V.band;c.fillRect(0,gy-h*.07,w,h*.07);c.strokeRect(-4,gy-h*.07,w+8,h*.07);}
  else if(v===1){c.lineWidth=3;c.strokeStyle=INK;c.fillStyle=V.band;c.fillRect(w*.08,gy-h*.3,w*.5,h*.3);c.strokeRect(w*.08,gy-h*.3,w*.5,h*.3);c.fillStyle=TEAL;for(let i=0;i<5;i++)c.fillRect(w*(.12+i*.09),gy-h*.22,w*.05,h*.1);c.fillStyle=RED;c.fillRect(w*.1,gy-h*.34,w*.46,h*.05);c.strokeRect(w*.1,gy-h*.34,w*.46,h*.05);c.fillStyle=WHITE;c.fillRect(0,gy-h*.05,w,h*.05);c.strokeRect(-4,gy-h*.05,w+8,h*.05);c.fillStyle=ORANGE;for(const x of [.7,.82,.93]){c.beginPath();c.moveTo(w*x,gy);c.lineTo(w*x+7,gy-16);c.lineTo(w*x+14,gy);c.closePath();c.fill();c.stroke();}}
  else{c.lineWidth=3;c.strokeStyle=INK;c.fillStyle=V.band;c.fillRect(0,gy-h*.42,w,h*.42);c.strokeRect(-4,gy-h*.42,w+8,h*.42);const cols=[PAPER,SUN,RED,TEAL,ORANGE,VIOLET];for(let j=0;j<4;j++)for(let i=0;i<Math.ceil(w/11);i++){c.fillStyle=cols[(i*7+j*3+(i*i)%5)%6];c.beginPath();c.arc(i*11+(j%2?5:0)+4,gy-h*.38+j*h*.085,3.2,0,TAU);c.fill();}
   c.fillStyle=WHITE;c.fillRect(0,gy-h*.06,w,h*.06);c.strokeRect(-4,gy-h*.06,w+8,h*.06);for(const x of [.08,.92]){c.fillStyle=INK;c.fillRect(w*x-3,h*.08,6,gy-h*.5);c.fillStyle=v===3?'#e9f5ff':SUN;c.fillRect(w*x-17,h*.03,34,15);c.strokeRect(w*x-17,h*.03,34,15);}
   if(v===3){c.strokeStyle='#e9f5ff66';c.lineWidth=1.5;c.beginPath();for(let i=0;i<60;i++){const x=(i*89)%w,y=(i*47)%h;c.moveTo(x,y);c.lineTo(x-5,y+13);}c.stroke();}}
  c.fillStyle=V.g1;c.fillRect(0,gy,w,h-gy);c.fillStyle=V.g2;c.fillRect(0,gy+(h-gy)*.5,w,(h-gy)*.5);c.fillStyle=INK;c.fillRect(0,gy-1.5,w,3);c.fillStyle=V.line;c.fillRect(0,gy+(h-gy)*.34,w,3);
 }

 /* ---- beans ---- */
 /** A small far bean on the pitch, feet at (x,0,z). */
 function mini(x:number,z:number,kit:string,skin:string,o:{jump?:number;back?:boolean;lean?:number}={}){const p=project(x,0,z),h=Math.max(16,p.s*1.9),w=h*.62,r=w/2,y=p.y-(o.jump??0)*p.s;
  f.fillStyle='#231a2e40';f.beginPath();f.ellipse(p.x,p.y,w*.6,w*.2,0,0,TAU);f.fill();
  f.save();f.translate(p.x,y);f.rotate(o.lean??0);f.beginPath();f.moveTo(-r,0);f.lineTo(-r,-h+r);f.arc(0,-h+r,r,Math.PI,TAU);f.lineTo(r,0);f.closePath();f.fillStyle=o.back?kit:skin;f.fill();f.fillStyle=kit;f.fillRect(-r,-h*.45,w,h*.45);if(o.back){f.fillStyle=skin;f.fillRect(-r*.7,-h+r*.2,w*.7,h*.2);}
  f.lineWidth=Math.max(1.5,h*.09);f.strokeStyle=INK;f.stroke();f.restore();return p;}
 /** The keeper: the player's bean from behind. pose: 0 ready, 1 dive, 2 up, 3 big, 4 hold, 5 beaten, 6 at feet. */
 function keeper(g:SafeHands,now:number){const s=g.state,sh=s.shot,a=s.act,p=project(s.kx,0,s.kd),m=p.s,h=1.62*m,w=h*.64,r=w/2;
  let dx=0,dy=0,rot=0,pose=0,sq=1;const moving=Math.abs(s.wantX-s.kx)>.03||Math.abs(s.wantD-s.kd)>.03,res=s.res;
  if(a&&(s.phase==='run'||s.phase==='fly'||s.phase==='res')){const t=s.t-a.t,k=clamp((t-SH.push)/(SH.reachMax/SH.reachV),0,1),e=ease(k);
   if(a.a==='up'){pose=2;dy=-Math.sin(Math.min(1,t/.3)*Math.PI/2)*.75*m;}
   else if(a.a==='down'){pose=6;sq=.5;}
   else{const dir=a.a[0]==='L'?-1:1,hi=a.a.length===2;pose=1;dx=dir*e*SH.reachMax*.82*m;rot=dir*e*(hi?1.05:1.42);dy=hi?-e*1.05*m*(1-k*.35):-e*.12*m-Math.sin(k*Math.PI)*.2*m;}}
  else if(res&&s.phase==='res'){pose=res.kind==='goal'?5:res.kind==='held'||res.kind==='claim'?4:res.kind==='block'?3:res.kind==='smother'?6:res.kind==='punch'?2:0;if(pose===6)sq=.5;if(pose===2)dy=-.5*m;}
  else if(sh?.kind==='one'&&s.kd>=3&&(s.phase==='run'||s.phase==='fly'))pose=3;
  else if(s.phase==='cross'&&s.decision&&s.decision!=='stay'){pose=2;dy=-Math.sin(clamp(s.pt/sh!.crossSecs,0,1)*Math.PI)*.4*m;}
  const bob=opts.reduced?0:moving?Math.abs(Math.sin(now*14))*h*.05:s.phase==='run'?Math.sin(now*9)*h*.012:0;
  f.fillStyle='#231a2e45';f.beginPath();f.ellipse(p.x+dx,p.y,w*(.62+Math.abs(rot)*.3),w*.2,0,0,TAU);f.fill();
  f.save();f.translate(p.x+dx,p.y+dy-bob);if(rot){f.translate(0,-h*.5);f.rotate(rot);f.translate(0,h*.5);}f.scale(1,sq);
  f.lineCap='round';f.lineJoin='round';
  // legs
  const leg=pose===3?w*.55:w*.24;f.strokeStyle=INK;f.lineWidth=h*.15;f.beginPath();for(const sd of [-1,1]){f.moveTo(sd*w*.22,-h*.16);f.lineTo(sd*leg,pose===1?h*.1:0);}f.stroke();
  // arms and gloves (behind the body for a back view only when low)
  const hands:[number,number][]=pose===1?[[-w*.2,-h*1.32],[w*.2,-h*1.32]]:pose===2?[[-w*.34,-h*1.36],[w*.34,-h*1.36]]:pose===3?[[-w*1.12,-h*.86],[w*1.12,-h*.86]]:pose===4?[[-w*.2,-h*.58],[w*.2,-h*.58]]:pose===5?[[-w*.62,-h*.14],[w*.62,-h*.14]]:pose===6?[[-w*.7,-h*.9],[w*.7,-h*.9]]:[[-w*.84,-h*(s.phase==='run'?.3:.4)],[w*.84,-h*(s.phase==='run'?.3:.4)]];
  f.lineWidth=h*.16;f.strokeStyle=INK;f.beginPath();hands.forEach(([hx,hy],i)=>{f.moveTo((i?1:-1)*w*.4,-h*.6);f.lineTo(hx,hy);});f.stroke();
  f.lineWidth=h*.09;f.strokeStyle=look.body;f.beginPath();hands.forEach(([hx,hy],i)=>{f.moveTo((i?1:-1)*w*.4,-h*.6);f.lineTo(hx,hy);});f.stroke();
  // body: jersey below, the back of the head above, hair on top
  f.beginPath();f.moveTo(-r,0);f.lineTo(-r,-h+r);f.arc(0,-h+r,r,Math.PI,TAU);f.lineTo(r,0);f.closePath();f.fillStyle=look.skin;f.fill();
  f.save();f.clip();f.fillStyle=look.body;f.fillRect(-r,-h*.56,w,h*.56);f.fillStyle='#231a2e2e';for(let i=0;i<3;i++)f.fillRect(-r,-h*.5+i*h*.16,w,h*.05);f.fillStyle=look.hair;f.beginPath();f.arc(0,-h+r,r,Math.PI,TAU);f.rect(-r,-h+r,w,h*.1);f.fill();f.fillStyle=INK;f.fillRect(-r,-h*.56-1.5,w,3);f.restore();
  f.lineWidth=Math.max(2.5,h*.045);f.strokeStyle=INK;f.stroke();
  f.fillStyle=PAPER;f.font=`italic 900 ${Math.round(h*.3)}px "Arial Black",Impact,sans-serif`;f.textAlign='center';f.textBaseline='middle';f.fillText('1',0,-h*.27);
  for(const [hx,hy] of hands){f.beginPath();f.arc(hx,hy,h*.135,0,TAU);f.fillStyle=look.glove;f.fill();f.lineWidth=Math.max(2,h*.04);f.strokeStyle=INK;f.stroke();}
  f.restore();return {x:p.x+dx,y:p.y+dy,h,hands:hands.map(([hx,hy])=>({x:p.x+dx+hx,y:p.y+dy+hy}))};}

 /** The striker in the close-up, seen from the keeper's eyes. k: 0 far back, 1 at the ball. */
 function striker(st:Striker,o:{x:number;feet:number;h:number;step:number;glance:number;hips:number;plant:{side:number;high:boolean;power:number}|null;kick:number;paused:boolean;head:boolean;side:number;ballX:number;ballY:number}){
  const c=f,h=o.h,w=h*.66,r=w/2,pl=o.plant,lean=pl?(pl.high?1:-1):0,sy=1+lean*.07,stepA=Math.sin(o.step),hop=pl||o.paused?0:Math.abs(stepA)*h*.05;
  c.save();c.translate(o.x,o.feet);
  c.fillStyle='#231a2e40';c.beginPath();c.ellipse(0,0,w*.7,w*.16,0,0,TAU);c.fill();
  c.lineCap='round';c.lineJoin='round';
  // legs and boots. Planted: the standing foot lands beside the ball and POINTS where the shot will go; the other leg winds up.
  const hipY=-h*.3-hop,boot=(bx:number,by:number,ang:number,len:number,cap=false)=>{c.save();c.translate(bx,by);c.rotate(ang);c.beginPath();c.ellipse(0,len*.2,len*.36,len*.66,0,0,TAU);c.fillStyle=INK;c.fill();c.lineWidth=2.5;c.strokeStyle=PAPER;c.stroke();
   if(cap){c.beginPath();c.ellipse(0,len*.56,len*.24,len*.2,0,0,TAU);c.fillStyle=SUN;c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();}c.restore();};
  const bl=h*.25;let lf:[number,number,number],rf:[number,number,number];
  if(o.head){lf=[-w*.3,-h*.02,0];rf=[w*.3,-h*.02,0];}
  else if(pl){const kx=o.kick>0?o.ballX-o.x:w*.62+pl.power*w*.3,ky=o.kick>0?-bl*.4:-h*.2-pl.power*h*.22;lf=[o.ballX-o.x-bl*1.25,bl*.1,-pl.side*.85];rf=[kx,ky,o.kick>0?-pl.side*.4:.5];}
  else{lf=[-w*.26+stepA*w*.1,-Math.max(0,stepA)*h*.1,0];rf=[w*.26-stepA*w*.1,-Math.max(0,-stepA)*h*.1,0];}
  c.strokeStyle=INK;c.lineWidth=h*.12;c.beginPath();c.moveTo(-w*.22,hipY);c.lineTo(lf[0],lf[1]-bl*.3);c.moveTo(w*.22,hipY);c.lineTo(rf[0],rf[1]-bl*.3);c.stroke();
  c.strokeStyle=st.skin;c.lineWidth=h*.06;c.beginPath();c.moveTo(-w*.22,hipY);c.lineTo(lf[0],lf[1]-bl*.3);c.moveTo(w*.22,hipY);c.lineTo(rf[0],rf[1]-bl*.3);c.stroke();
  boot(rf[0],rf[1]-bl*.5,rf[2],bl);boot(lf[0],lf[1]-bl*.5,lf[2],pl&&!o.head?bl*1.25:bl,!!pl&&!o.head);
  if(pl&&o.kick<=0&&pl.power>.6){c.strokeStyle=INK;c.lineWidth=2.5;c.beginPath();for(let i=0;i<3;i++){c.moveTo(rf[0]+bl*(.7+i*.35),rf[1]-bl*.9+i*4);c.lineTo(rf[0]+bl*(1.2+i*.35),rf[1]-bl*.2+i*4);}c.stroke();}
  // body: the hips and shoulders open toward the shot (a shear), the lean stretches (back = high) or squashes (over the ball = low)
  c.translate(0,-hop);c.transform(1,0,-o.hips*.2,sy,0,0);const top=-h,yb=-h*.3,rc=r*.6;
  const ay=-h*.55,armOut=lean>0?w*1.02:lean<0?w*.6:w*.8,armY=lean>0?-h*.62:lean<0?-h*.3:-h*.36-stepA*h*.05;
  c.strokeStyle=INK;c.lineWidth=h*.115;c.beginPath();c.moveTo(-w*.42,ay);c.lineTo(-armOut,armY);c.moveTo(w*.42,ay);c.lineTo(armOut,lean?armY:-h*.36+stepA*h*.05);c.stroke();
  c.strokeStyle=st.skin;c.lineWidth=h*.06;c.beginPath();c.moveTo(-w*.42,ay);c.lineTo(-armOut,armY);c.moveTo(w*.42,ay);c.lineTo(armOut,lean?armY:-h*.36+stepA*h*.05);c.stroke();
  c.beginPath();c.moveTo(-r,yb-rc);c.lineTo(-r,top+r);c.arc(0,top+r,r,Math.PI,TAU);c.lineTo(r,yb-rc);c.arc(r-rc,yb-rc,rc,0,Math.PI/2);c.lineTo(-r+rc,yb);c.arc(-r+rc,yb-rc,rc,Math.PI/2,Math.PI);c.closePath();c.fillStyle=st.skin;c.fill();
  c.save();c.clip();c.fillStyle=st.kit;c.fillRect(-r,-h*.6,w,h*.4);c.fillStyle='#231a2e30';for(let i=0;i<4;i++)c.fillRect(-r+i*w/4,-h*.6,w/8,h*.4);c.fillStyle=INK;c.fillRect(-r,-h*.6-1.5,w,3);c.restore();
  c.lineWidth=Math.max(3,h*.03);c.strokeStyle=INK;c.stroke();
  c.fillStyle=st.kit===PAPER||st.kit==='#ffd24a'||st.kit===SUN?INK:PAPER;c.font=`italic 900 ${Math.round(h*.2)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(String(st.num),o.hips*w*.1,-h*.44);
  // face: the eyes glance; chest up shows a chin line, head down shows the brow
  const ey=-h*.77-lean*h*.035,gx=(o.head?o.side:o.glance)*w*.075;c.fillStyle=WHITE;c.lineWidth=2.2;for(const sd of [-1,1]){c.beginPath();c.ellipse(sd*w*.2,ey,w*.13,lean<0?w*.09:w*.16,0,0,TAU);c.fill();c.stroke();}
  c.fillStyle=INK;for(const sd of [-1,1]){c.beginPath();c.arc(sd*w*.2+gx,ey+(lean<0?w*.03:0),w*.062,0,TAU);c.fill();}
  c.lineWidth=2.6;c.beginPath();if(lean<0){c.moveTo(-w*.34,ey-w*.14);c.lineTo(-w*.08,ey-w*.07);c.moveTo(w*.34,ey-w*.14);c.lineTo(w*.08,ey-w*.07);}c.moveTo(-w*.1,-h*.665);c.lineTo(w*.1,-h*.665);c.stroke();
  topper(c,st.top,w,h,st.kit);
  c.restore();}

 /* ---- one frame ---- */
 function render(g:SafeHands,now:number){
  const s=g.state,sh=s.shot,T=TIERS[s.tier],v=T.venue;lastNow=now;
  if(v!==venue||painted!==v){venue=v;paintStatic(v);}
  f.setTransform(dpr,0,0,dpr,0,0);f.clearRect(0,0,W,H);f.lineCap='butt';
  const live=!!sh&&s.phase!=='tip'&&s.phase!=='over',ball=g.ball(),tl=g.tells(),st=sh?STRIKERS[sh.striker]:STRIKERS[0];
  if(live&&sh){
   const zS=g.strikerZ(),inRun=s.phase==='run'||s.phase==='fly',total=sh.runSecs+sh.stutter,runK=s.phase==='run'?clamp(s.pt/total,0,1):s.phase==='set'||s.phase==='wall'?0:1;
   // the angle cone: from the ball to both posts (a free kick: to the side the wall leaves open). The bar is the gate at your depth.
   if((T.aid>0||sh.kind==='free'||s.daily===false&&s.stats.shots<=2)&&(s.phase==='set'||s.phase==='wall'||(s.phase==='run'&&T.aid>1))&&sh.kind!=='cross'&&sh.kind!=='reb'){
    const bz=sh.kind==='one'?zS:sh.bz,p0=project(sh.bx,0,bz);let xl:number=-SH.goalHalf,xr:number=SH.goalHalf;if(sh.kind==='free'&&s.phase!=='wall'){const e=sh.near*(SH.goalHalf-sh.wallN*.8);if(sh.near>0)xr=e;else xl=e;}
    if(sh.kind==='free'&&s.phase!=='wall'){const w0=project(sh.near>0?xr:xl,0,0),w1=project(sh.near*SH.goalHalf,0,0);f.beginPath();f.moveTo(p0.x,p0.y);f.lineTo(w0.x,w0.y);f.lineTo(w1.x,w1.y);f.closePath();f.fillStyle='#231a2e55';f.fill();}
    const a=project(xl,0,0),c2=project(xr,0,0);f.beginPath();f.moveTo(p0.x,p0.y);f.lineTo(a.x,a.y);f.lineTo(c2.x,c2.y);f.closePath();f.fillStyle='#ffc83a59';f.fill();f.setLineDash([7,6]);f.lineWidth=2.5;f.strokeStyle=INK;f.stroke();f.setLineDash([]);
    const fr=1-s.kd/Math.max(1,bz),gx0=sh.bx+(xl-sh.bx)*fr,gx1=sh.bx+(xr-sh.bx)*fr,q0=project(gx0,0,s.kd),q1=project(gx1,0,s.kd);f.lineWidth=6;f.strokeStyle=INK;f.beginPath();f.moveTo(q0.x,q0.y);f.lineTo(q1.x,q1.y);f.stroke();f.lineWidth=3;f.strokeStyle=SUN;f.stroke();
    if(T.aid>1&&s.phase!=='run'){const id=idealFor(sh,s.kd,zS),q=project(id.x,0,s.kd),ok=Math.abs(id.x-s.kx)<=.6;f.lineWidth=3;f.strokeStyle=INK;f.fillStyle=ok?TEAL:PAPER;f.beginPath();f.ellipse(q.x,q.y,q.s*.5,q.s*.2,0,0,TAU);f.fill();f.stroke();}}
   // far beans, back to front: the wall, the striker, a defender in the way, the crowd under a cross
   if(sh.kind==='free'&&s.phase!=='wall'){const t=9.15/sh.bz,cx=sh.bx+(sh.near*(SH.goalHalf-sh.wallN*.4)-sh.bx)*t,cz=sh.bz*(1-t);for(let i=0;i<sh.wallN;i++)mini(cx+(i-(sh.wallN-1)/2)*.62,cz,look.body,look.skin,{back:true,jump:s.phase==='fly'&&sh.over?Math.sin(clamp((s.t-s.strikeT)/.5,0,1)*Math.PI)*.5:0});}
   if(sh.kind==='cross'||sh.kind==='head'){const cx=sh.kind==='head'?sh.bx:sh.cx,cz=sh.kind==='head'?sh.bz:sh.cz,jump=s.phase==='cross'?Math.max(0,Math.sin((s.pt/sh.crossSecs-.72)*Math.PI/.28))*.6:inRun?.5:0;
    if(s.phase==='cross'){const q=project(cx,0,cz),k=s.pt/sh.crossSecs;f.lineWidth=3;f.strokeStyle=INK;f.fillStyle=sh.closeIn?'#f0452e88':'#fff3d688';f.beginPath();f.ellipse(q.x,q.y,q.s*(1.5-k*.7),q.s*(.6-k*.28),0,0,TAU);f.fill();f.stroke();mini(sh.bx,sh.bz,st.kit,st.skin);}
    const n=sh.crowd?3:1;for(let i=0;i<n;i++)mini(cx+(i-(n-1)/2)*.9,cz+.3*(i%2),i===0?st.kit:RED,st.skin,{jump:i===0?jump:jump*.6});if(sh.crowd||!sh.closeIn)for(const dxx of [-1.5,1.6])mini(cx+dxx,cz-.6,look.body,look.skin,{back:true,jump:jump*.5});}
   else{const back=sh.kind==='one'?0:(1-runK)*(sh.long?5:3.2);mini(sh.bx-sh.approach*back*.35,zS+back+(sh.kind==='one'?.3:.2),st.kit,st.skin);}
   if(sh.defl){const q=sh.bz*(1-sh.defl.at);mini(sh.bx+(sh.tx-sh.bx)*sh.defl.at+.35,q,look.body,look.skin,{back:true});}
   // ball beyond the keeper, the keeper, then the ball when it is on the keeper's side
   const res=s.res,ko=()=>keeper(g,now);let bp=project(ball.x,ball.y,ball.z),gone=false,K:ReturnType<typeof keeper>|null=null;const beyond=ball.z>s.kd+.05;
   if(res&&s.phase==='res'){const k=clamp(s.pt/.5,0,1);K=ko();
    if(res.kind==='goal'){if(s.strikeT>0){const q=project(res.x+(res.x-s.kx)*.2*k,Math.max(.11,res.y*(1-k*.6)),-1.6*k+s.kd*(1-k));bp=q;}else bp=project(sh.bx+(0-sh.bx)*k,.11,Math.max(-1.2,(sh.bz-.5)*(1-k*1.2)));}
    else if(res.kind==='held'||res.kind==='claim'||res.kind==='smother'){bp={x:(K.hands[0].x+K.hands[1].x)/2,y:(K.hands[0].y+K.hands[1].y)/2+(res.kind==='smother'?K.h*.3:0),s:project(0,0,s.kd).s};}
    else if(res.kind==='spill'){const q=project(res.x+(res.x<s.kx?-1:1)*.4*k,Math.max(.11,res.y*(1-k)),s.kd+2.5*k);bp=q;}
    else{const dir=res.x<s.kx?-1:1,up=res.kind==='tip'||res.kind==='punch';const q=project(res.x+dir*(up?1:5.5)*k,up?res.y+2.4*k:Math.max(.11,res.y+1.2*Math.sin(k*Math.PI)),s.kd+(res.kind==='punch'?14*k:up?-1.5*k:1.2*k));bp=q;gone=k>=1&&up;}}
   const drawBall=()=>{if(gone)return;const r=Math.max(3.2,bp.s*.2),sp=project(ball.x,0,ball.z);if(!res){f.fillStyle='#231a2e45';f.beginPath();f.ellipse(sp.x,sp.y,r*1.1,r*.42,0,0,TAU);f.fill();}
    if(s.phase==='fly'&&!opts.reduced){const u=clamp((s.t-s.strikeT)/sh.flight-.07,0,1),q=g.state.shot?projectPath(sh,u):bp;f.strokeStyle=PAPER;f.lineWidth=r*.9;f.lineCap='round';f.beginPath();f.moveTo(q.x,q.y);f.lineTo(bp.x,bp.y);f.stroke();f.lineCap='butt';}
    ballArt(f,bp.x,bp.y,r,now*9);};
   if(beyond&&!res)drawBall();if(!K)K=ko();if(!beyond||res)drawBall();
  }else keeper(g,now);
  // a hit: one star at the ball for a few frames
  {const k=(now-flash.t)/.28;if(k>=0&&k<1){f.save();f.globalAlpha=1-k*k;star(f,flash.x,flash.y,26+k*34,11,.3);f.fillStyle=flash.good?SUN:PAPER;f.fill();f.lineWidth=3;f.strokeStyle=INK;f.stroke();f.restore();}}
  f.drawImage(net,0,0,W,H);
  if(live&&sh)closeUp(g,now,tl);
 }
 function projectPath(sh:NonNullable<SafeHands['state']['shot']>,u:number){const z=sh.bz*(1-u),x=sh.bx+(sh.tx-sh.bx)*u;return project(x,.11+(sh.ty-.11)*Math.min(1,u/.3),z);}

 function closeUp(g:SafeHands,now:number,tl:ReturnType<SafeHands['tells']>){
  const s=g.state,sh=s.shot!,st=STRIKERS[sh.striker],T=TIERS[s.tier],x0=P.x,y0=P.y,w=P.w,h=P.h,gy=y0+h*.74,cx=x0+w/2;
  f.fillStyle=INK;f.fillRect(x0+5,y0+5,w,h);f.save();f.beginPath();f.rect(x0,y0,w,h);f.clip();f.drawImage(pan,x0,y0,w,h);
  const total=sh.runSecs+sh.stutter,fly=s.phase==='fly'||(s.phase==='res'&&s.strikeT>0),head=sh.kind==='head';
  let k=0;// how close she is: 0 far back, 1 at the ball
  if(s.phase==='run'){const pauseAt=sh.runSecs*.45,t=sh.stutter>0?(s.pt<pauseAt?s.pt:s.pt<pauseAt+sh.stutter?pauseAt:s.pt-sh.stutter):s.pt;k=clamp(t/Math.max(.1,sh.runSecs-sh.plant),0,1);}
  else if(fly||s.phase==='res')k=1;else if(sh.kind==='one')k=clamp(s.pt/sh.setSecs,0,1)*.0;
  const one=sh.kind==='one'&&s.phase==='set',far=one?1-clamp(s.pt/sh.setSecs,0,1):0,scale=one?.5+.3*(1-far):head||sh.kind==='reb'?.92:sh.kind==='one'?.8+.2*ease(k):.62+.38*ease(k);
  const bh=h*.62*scale,feet=gy+h*.1-(1-scale)*h*.34,sx=cx-(sh.kind==='one'?0:sh.approach*(1-k)*w*.2)+(one?Math.sin(now*5)*w*.02:0);
  // the ball: on its spot; at her feet in a dribble; gone once struck (it leaves the frame toward its corner)
  let bx=cx+bh*.06,by=gy+h*.185,br=h*.068,show=true;
  if(one){const l=g.looseBall(),ahead=l?Math.sin(Math.PI*l.k):0;bx=sx+bh*.2;by=feet+h*.02+ahead*h*.16;br=h*.045*(1+(1-far)*.5)*(1+ahead*.5);}
  else if(head){bx=sx;by=feet-bh*1.12;br=h*.06;}
  if(fly){const u=clamp((s.t-s.strikeT)/Math.min(.28,sh.flight),0,1);bx+=sh.side*w*.42*u;by+=(sh.high?-h*.5:h*.12)*u;br*=1+u*1.6;show=u<1;}
  if(s.phase==='res'&&s.strikeT===0&&sh.kind==='cross')show=false;
  if(s.phase==='cross'){// the cross: the box under the ball
   const n=sh.crowd?3:1,jump=Math.max(0,Math.sin((s.pt/sh.crossSecs-.7)*Math.PI/.3));for(let i=0;i<n;i++)striker(i?{...st,kit:RED,num:5+i,top:i}:st,{x:cx+(i-(n-1)/2)*w*.2,feet:gy+h*.13-(i===0?jump*h*.1:0),h:h*.46,step:0,glance:0,hips:0,plant:null,kick:0,paused:true,head:true,side:0,ballX:0,ballY:0});
   const kk=s.pt/sh.crossSecs;ballArt(f,cx-Math.sign(sh.bx)*w*.5*(1-kk),y0+h*.1+h*.12*kk*kk,h*.05*(1+kk*.4),now*8);
   f.restore();f.lineWidth=4;f.strokeStyle=INK;f.strokeRect(x0,y0,w,h);
   tag(f,sh.closeIn?'LANDS IN YOUR SMALL BOX':'LANDS FAR OUT',x0+8,y0+8,{fill:sh.closeIn?SUN:PAPER,size:12});tag(f,sh.crowd?'A CROWD':'NO CROWD',x0+w-8,y0+h-30,{fill:sh.crowd?RED:TEAL,color:sh.crowd?PAPER:INK,align:'right',size:12});return;}
  if(show&&!fly)ballArt(f,bx,by,br,one?now*7:0);
  striker(st,{x:sx,feet,h:bh,step:tl.paused||fly||tl.plant?0:now*(one?11:13),glance:tl.glance,hips:tl.hips??0,plant:head?null:tl.plant,kick:fly?1:0,paused:tl.paused,head,side:tl.plant?tl.plant.side:0,ballX:bx,ballY:by});
  if(show&&fly)ballArt(f,bx,by,br,now*14);
  // an oversized wall: backs of your own players hide her feet
  if(tl.hidden){for(let i=0;i<4;i++){const xx=x0+w*(.2+i*.2);f.save();f.translate(xx,y0+h+6);const bw=w*.19,bhh=h*.56;f.beginPath();f.moveTo(-bw/2,0);f.lineTo(-bw/2,-bhh+bw/2);f.arc(0,-bhh+bw/2,bw/2,Math.PI,TAU);f.lineTo(bw/2,0);f.closePath();f.fillStyle=look.body;f.fill();f.lineWidth=3;f.strokeStyle=INK;f.stroke();f.fillStyle=look.hair;f.beginPath();f.arc(0,-bhh+bw/2,bw/2-2,Math.PI,TAU);f.fill();f.restore();}}
  if(tl.paused&&!opts.reduced){f.fillStyle=INK;for(let i=0;i<3;i++){f.beginPath();f.arc(sx+bh*.5+i*11,feet-bh*1.02,3.2,0,TAU);f.fill();}}
  f.restore();f.lineWidth=4;f.strokeStyle=INK;f.strokeRect(x0,y0,w,h);
  // captions: who, what; in Sunday league the tells are labelled so the child learns what to look at
  tag(f,`${st.num} ${st.name.toUpperCase()}`,x0+8,y0+8,{fill:PAPER,size:12});
  if(tl.plant&&T.aid>1&&!s.daily&&(s.phase==='run'||fly)){const pl=tl.plant,word=pl.side<0?'◀ LEFT':pl.side>0?'RIGHT ▶':'MIDDLE';
   tag(f,head?`HEAD: ${word}`:`FOOT: ${word}`,pl.side<0?x0+8:pl.side>0?x0+w-8:cx,y0+h-30,{fill:SUN,size:13,align:pl.side<0?'left':pl.side>0?'right':'center'});
   tag(f,pl.high?'CHEST UP: HIGH':'HEAD DOWN: LOW',x0+w-8,y0+8,{fill:pl.high?RED:TEAL,color:pl.high?PAPER:INK,size:12,align:'right'});}
  else if(tl.hidden)tag(f,'THE WALL IS IN YOUR WAY',x0+w-8,y0+8,{fill:RED,color:PAPER,size:12,align:'right'});
 }

 function onEvent(e:ShEvent,g:SafeHands){const s=g.state;if(e.type==='save'||e.type==='goal'||e.type==='spill'){const r=s.res;if(!r)return;const p=project(r.x,r.y,s.kd);flash={t:lastNow,x:p.x,y:p.y,good:e.type!=='goal'};if(e.type==='goal')shakeT=lastNow;}}
 function clear(){f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fg.width,fg.height);}
 return {resize,render,onEvent,setLook,project,clear,get panel(){return P;},get pixels(){return fg.width*fg.height;},get shake(){return shakeT;},
  /** css px per metre along the goal line and per metre of depth near the keeper (the shell's drag gains) */get gain(){return {x:F/CAM_BACK,d:Math.max(8,(project(0,0,0).y-project(0,0,9).y)/9)};},
  dispose(){for(const cv of [net,pan]){cv.width=1;cv.height=1;}}};
}
