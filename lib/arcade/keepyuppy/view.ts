/**
 * Keepy-Uppy Beat drawing (Nov 21 2026, docs/arcade-aaa/keepyuppy-direction.md): canvas 2D in the arcade's comic print style (the
 * kit's hex values, ink outlines, Ben-Day dots, hard shadows; no gradients, blur or glow).
 * One upright page, three bands:
 *   the VENUE and the BEAN (top): the player's own island bean juggling. The ball flies the REAL parabola between two touches (gravity
 *   9.8 m/s2), so a longer gap is a higher ball: the height of the pop is the rhythm. Boots, shorts and headband wear the pad colours.
 *   the TRACK (middle): each coming touch is a ball falling down its lane into that lane's landing ring; the next ball's ring closes in.
 *   the PADS (bottom): four thumb pads: left foot, thigh, head, right foot.
 * Heat: `bg` holds everything static (venue, lanes, rings, pads) and is painted once per size / venue / foot; `fg` is the only canvas
 * redrawn, and only while the shell's loop runs. A frame is a clear, at most ~10 cue balls, one bean (a dozen paths) and one ball.
 * No timers, no particles, no images.
 */
import {GRADE_WORD,clean,type Keepy,type KuEvent,type Note,type Grade,type Foot} from './core';

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8',WHITE='#fffaf0';
/** Pad colours: left foot, thigh, head, right foot. The bean's boots, shorts and headband wear the same colours. */
export const LANE_COLOR=[TEAL,SUN,VIOLET,RED] as const;
const TAU=Math.PI*2,G=9.8,BALL=.115;
type Ctx=CanvasRenderingContext2D;
/** One backdrop per track: the park, the schoolyard, the beach, the street cage, a rooftop pitch, the stadium on cup final night. */
export const VENUES=[
 {sky:'#ffb45e',dots:'#ff8f4e',far:'#b9603f',g1:'#62b85f',g2:'#56aa55',lane:'#4a9a4c'},
 {sky:'#8fd4ee',dots:'#6fbfe0',far:'#c96a4a',g1:'#9a9cb0',g2:'#8d8fa3',lane:'#7b7d92'},
 {sky:'#7fd8e8',dots:'#5cc6dc',far:'#2f9fc4',g1:'#f2d08a',g2:'#e8c078',lane:'#d9ae66'},
 {sky:'#2f2747',dots:'#453a66',far:'#231a2e',g1:'#6d6488',g2:'#625a7c',lane:'#574f74'},
 {sky:'#ff9a6c',dots:'#f07a52',far:'#5b3f6e',g1:'#3f9a6a',g2:'#378c5f',lane:'#2f7f55'},
 {sky:'#2a2050',dots:'#40336e',far:'#3a3154',g1:'#41a05e',g2:'#389152',lane:'#2f7f47'},
] as const;
export type BeanLook={body:string;skin:string;hair:string};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v,smooth=(k:number)=>k*k*(3-2*k),mix=(a:number,b:number,k:number)=>a+(b-a)*k;

function dots(c:Ctx,x:number,y:number,w:number,h:number,color:string,step=8,r=1.5){c.fillStyle=color;c.beginPath();for(let j=0,yy=y+step/2;yy<y+h;yy+=step,j++)for(let xx=x+(j%2?step:step/2);xx<x+w;xx+=step){c.moveTo(xx+r,yy);c.arc(xx,yy,r,0,TAU);}c.fill();}
function rr(c:Ctx,x:number,y:number,w:number,h:number,r:number){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.arc(x+w-r,y+r,r,-Math.PI/2,0);c.lineTo(x+w,y+h-r);c.arc(x+w-r,y+h-r,r,0,Math.PI/2);c.lineTo(x+r,y+h);c.arc(x+r,y+h-r,r,Math.PI/2,Math.PI);c.lineTo(x,y+r);c.arc(x+r,y+r,r,Math.PI,Math.PI*1.5);c.closePath();}
/** A paper tag with an ink edge and a hard shadow (canvas twin of the kit's caption box). */
function tag(c:Ctx,text:string,x:number,y:number,o:{fill?:string;color?:string;size?:number}={}){
 const size=o.size??14;c.font=`italic 900 ${size}px "Arial Black",Impact,sans-serif`;const w=Math.ceil(c.measureText(text).width)+14,h=size+10,x0=x-w/2;
 c.fillStyle=INK;c.fillRect(x0+3,y+3,w,h);c.fillStyle=o.fill??PAPER;c.fillRect(x0,y,w,h);c.lineWidth=2.5;c.strokeStyle=INK;c.strokeRect(x0,y,w,h);c.fillStyle=o.color??INK;c.textBaseline='middle';c.textAlign='center';c.fillText(text,x,y+h/2+1);}
function ballArt(c:Ctx,x:number,y:number,r:number,spin=0){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=WHITE;c.fill();c.lineWidth=Math.max(1.5,r*.2);c.strokeStyle=INK;c.stroke();
 if(r>4){c.fillStyle=INK;c.beginPath();for(let i=0;i<5;i++){const a=spin+i*TAU/5,px=x+Math.cos(a)*r*.36,py=y+Math.sin(a)*r*.36;if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.closePath();c.fill();
  c.lineWidth=Math.max(1,r*.12);c.beginPath();for(let i=0;i<5;i++){const a=spin+i*TAU/5;c.moveTo(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4);c.lineTo(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92);}c.stroke();}}
function star(c:Ctx,x:number,y:number,r:number,n=10,rot=0,inner=.6){c.beginPath();for(let i=0;i<n*2;i++){const rad=i%2?r*inner:r,a=rot+Math.PI*i/n;if(i)c.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);else c.moveTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}c.closePath();}
/** The pad pictures (also the cue balls' badges): a boot, a thigh, a head. `s` = half size in px. */
function icon(c:Ctx,lane:number,x:number,y:number,s:number,color:string){
 c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.fillStyle=color;c.lineWidth=Math.max(2,s*.16);
 if(lane===0||lane===3){const d=lane===0?-1:1;c.beginPath();c.moveTo(x-d*s*.5,y-s*.8);c.lineTo(x-d*s*.5,y+s*.55);c.lineTo(x+d*s*.75,y+s*.55);c.quadraticCurveTo(x+d*s*.95,y+s*.05,x+d*s*.2,y-s*.05);c.lineTo(x+d*s*.1,y-s*.8);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(x-d*s*.5,y+s*.55);c.lineTo(x+d*s*.75,y+s*.55);c.lineWidth=Math.max(3,s*.3);c.stroke();}
 else if(lane===1){c.lineWidth=s*.62+4;c.beginPath();c.moveTo(x-s*.7,y-s*.35);c.lineTo(x+s*.45,y-s*.2);c.lineTo(x+s*.3,y+s*.75);c.stroke();c.strokeStyle=color;c.lineWidth=s*.62;c.stroke();
  c.strokeStyle=PAPER;c.lineWidth=s*.62;c.beginPath();c.moveTo(x+s*.38,y+s*.25);c.lineTo(x+s*.3,y+s*.75);c.stroke();}
 else{c.beginPath();c.arc(x,y+s*.05,s*.78,0,TAU);c.fillStyle=PAPER;c.fill();c.stroke();c.fillStyle=color;c.fillRect(x-s*.76,y-s*.5,s*1.52,s*.34);c.strokeRect(x-s*.76,y-s*.5,s*1.52,s*.34);
  c.fillStyle=INK;c.beginPath();c.arc(x-s*.28,y+s*.22,s*.11,0,TAU);c.arc(x+s*.28,y+s*.22,s*.11,0,TAU);c.fill();}
}

export type KeepyView=ReturnType<typeof createKeepyView>;
export function createKeepyView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean;keys:boolean}){
 const b=bg.getContext('2d',{alpha:false})!,f=fg.getContext('2d')!;
 let W=390,H=844,dpr=1,top=104,venue=0,painted='',strong:Foot='R',look:BeanLook={body:'#19b5a5',skin:'#f2b98a',hair:INK};
 /** layout (css px): pads, the landing rings' line, the track above it, the ground the bean stands on, px per metre */
 let padTop=700,padH=140,hitY=672,trackTop=470,groundY=452,S=120,cx=195,laneW=97.5;
 // what the last events left on screen
 let word={t:-9,text:'',grade:'' as Grade|'',lane:0},flash=[-9,-9,-9,-9],flashGood=[true,true,true,true],sad=-9,cheer=-9,vi=0,lastGame:Keepy|null=null;
 let launch=new Float64Array(0);

 function resize(cssW:number,cssH:number,ratio:number,topClear:number){
  W=Math.max(1,cssW);H=Math.max(1,cssH);dpr=Math.min(2,Math.max(1,ratio));top=topClear;
  padH=Math.round(clamp(H*.165,96,150));padTop=H-padH;hitY=padTop-30;const trackH=Math.round(clamp(H*.25,130,230));trackTop=hitY-trackH;groundY=trackTop-18;
  S=clamp((groundY-top-8)/2.85,40,170);cx=W/2;laneW=W/4;
  for(const cv of [bg,fg]){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=`${W}px`;cv.style.height=`${H}px`;}painted='';}

 /* ---- the static layer: venue, lanes, rings, pads ---- */
 function scenery(c:Ctx,V:typeof VENUES[number],hor:number){
  const u=S/100;c.lineJoin='round';
  if(venue===0){// the park: trees and a small goal
   for(const [x,r] of [[.08,34],[.2,26],[.86,38],[.72,24]] as const){c.fillStyle=INK;c.fillRect(W*x-3*u,hor-r*u*1.2,6*u,r*u*1.2);c.beginPath();c.arc(W*x,hor-r*u*1.5,r*u,0,TAU);c.fillStyle='#3f8f4a';c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();}
   c.strokeStyle=WHITE;c.lineWidth=4*u;c.strokeRect(W*.36,hor-34*u,W*.28,34*u);c.strokeStyle=INK;c.lineWidth=1.5;c.strokeRect(W*.36-2*u,hor-36*u,W*.28+4*u,36*u);
   c.beginPath();c.arc(W*.86,hor-150*u,22*u,0,TAU);c.fillStyle=SUN;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();}
  else if(venue===1){// the schoolyard: the school, its windows and a fence
   c.fillStyle=V.far;c.fillRect(W*.06,hor-110*u,W*.88,110*u);c.lineWidth=3;c.strokeStyle=INK;c.strokeRect(W*.06,hor-110*u,W*.88,110*u);
   c.fillStyle=PAPER;for(let i=0;i<6;i++)for(let j=0;j<2;j++){const x=W*.11+i*W*.137,y=hor-96*u+j*44*u;c.fillRect(x,y,W*.09,28*u);c.strokeRect(x,y,W*.09,28*u);}
   c.fillStyle=TEAL;c.fillRect(W*.44,hor-46*u,W*.12,46*u);c.strokeRect(W*.44,hor-46*u,W*.12,46*u);
   c.beginPath();for(let x=0;x<W;x+=14*u){c.moveTo(x,hor);c.lineTo(x,hor-18*u);}c.moveTo(0,hor-18*u);c.lineTo(W,hor-18*u);c.lineWidth=2;c.stroke();}
  else if(venue===2){// the beach: sea, sun, a palm
   c.fillStyle=V.far;c.fillRect(0,hor-46*u,W,46*u);c.strokeStyle=WHITE;c.lineWidth=3;c.beginPath();for(let j=0;j<3;j++)for(let x=(j%2)*30*u;x<W;x+=70*u){c.moveTo(x,hor-36*u+j*13*u);c.lineTo(x+34*u,hor-36*u+j*13*u);}c.stroke();
   c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.moveTo(0,hor-46*u);c.lineTo(W,hor-46*u);c.stroke();c.beginPath();c.arc(W*.2,hor-150*u,26*u,0,TAU);c.fillStyle=SUN;c.fill();c.stroke();
   c.lineWidth=9*u;c.strokeStyle=INK;c.beginPath();c.moveTo(W*.88,hor);c.quadraticCurveTo(W*.84,hor-80*u,W*.9,hor-140*u);c.stroke();c.lineWidth=5*u;c.strokeStyle='#a8703f';c.stroke();
   c.fillStyle='#3f9a4a';c.strokeStyle=INK;c.lineWidth=2.5;for(const a of [-2.7,-2.1,-1.2,-.5,.1]){c.beginPath();c.moveTo(W*.9,hor-140*u);c.quadraticCurveTo(W*.9+Math.cos(a)*40*u,hor-140*u+Math.sin(a)*40*u-14*u,W*.9+Math.cos(a)*64*u,hor-140*u+Math.sin(a)*52*u+8*u);c.quadraticCurveTo(W*.9+Math.cos(a)*36*u,hor-140*u+Math.sin(a)*30*u+6*u,W*.9,hor-140*u);c.fill();c.stroke();}}
  else if(venue===3){// the street cage at night: lamps with hard light cones, a chain fence
   c.fillStyle='#3d335c';for(const x of [.16,.84]){c.beginPath();c.moveTo(W*x,hor-150*u);c.lineTo(W*x-70*u,hor);c.lineTo(W*x+70*u,hor);c.closePath();c.fill();}
   c.strokeStyle=INK;c.lineWidth=5*u;for(const x of [.16,.84]){c.beginPath();c.moveTo(W*x,hor);c.lineTo(W*x,hor-150*u);c.stroke();c.fillStyle=SUN;c.fillRect(W*x-14*u,hor-158*u,28*u,10*u);c.lineWidth=2.5;c.strokeRect(W*x-14*u,hor-158*u,28*u,10*u);c.lineWidth=5*u;}
   c.strokeStyle='#8f78b8';c.lineWidth=1.5;c.beginPath();for(let x=-80*u;x<W;x+=16*u){c.moveTo(x,hor);c.lineTo(x+70*u,hor-70*u);c.moveTo(x+70*u,hor);c.lineTo(x,hor-70*u);}c.stroke();c.strokeStyle=INK;c.lineWidth=4;c.beginPath();c.moveTo(0,hor-70*u);c.lineTo(W,hor-70*u);c.stroke();}
  else if(venue===4){// the rooftop: a skyline, a water tank
   const hs=[70,120,90,150,60,110,135,80];c.lineWidth=3;c.strokeStyle=INK;hs.forEach((h,i)=>{const x=i*W/8;c.fillStyle=i%2?V.far:'#6e4d80';c.fillRect(x,hor-h*u,W/8+1,h*u);c.strokeRect(x,hor-h*u,W/8+1,h*u);c.fillStyle=SUN;for(let y=hor-h*u+10*u;y<hor-14*u;y+=20*u)for(let k=0;k<2;k++)if((i+k+Math.round(y))%3)c.fillRect(x+8*u+k*18*u,y,8*u,9*u);});
   c.beginPath();c.arc(W*.5,hor-170*u,30*u,0,TAU);c.fillStyle=SUN;c.fill();c.stroke();c.fillStyle=WHITE;c.fillRect(0,hor-8*u,W,8*u);c.strokeRect(-4,hor-8*u,W+8,8*u);}
  else{// cup final night: the stands, floodlights, bunting
   c.fillStyle=V.far;c.fillRect(0,hor-120*u,W,120*u);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(-4,hor-120*u,W+8,120*u);
   for(let j=0;j<6;j++)dots(c,0,hor-112*u+j*17*u,W,12*u,[SUN,RED,TEAL,PAPER,ORANGE,VIOLET][j],11*u,3.2*u);
   c.fillStyle=WHITE;for(const x of [.1,.9]){star(c,W*x,hor-170*u,22*u,8,0,.45);c.fill();c.stroke();}
   c.beginPath();c.moveTo(0,hor-196*u);c.quadraticCurveTo(W/2,hor-160*u,W,hor-196*u);c.lineWidth=2;c.stroke();for(let i=0;i<9;i++){const k=(i+.5)/9,x=W*k,y=hor-196*u+36*u*(1-(2*k-1)*(2*k-1));c.beginPath();c.moveTo(x-8*u,y);c.lineTo(x+8*u,y);c.lineTo(x,y+16*u);c.closePath();c.fillStyle=[RED,SUN,TEAL][i%3];c.fill();c.stroke();}}
 }
 function paint(){
  const key=`${venue}|${strong}|${W}|${H}|${dpr}`;if(painted===key)return;painted=key;const c=b,V=VENUES[venue],hor=groundY-Math.round(S*.34);
  c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle=V.sky;c.fillRect(0,0,W,H);dots(c,0,0,W,hor,V.dots,10,1.8);scenery(c,V,hor);
  c.fillStyle=V.g1;c.fillRect(0,hor,W,H-hor);c.fillStyle=V.g2;for(let i=0;i<4;i+=2)c.fillRect(0,hor+(groundY+10-hor)*i/3,W,(groundY+10-hor)/3);c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.moveTo(0,hor);c.lineTo(W,hor);c.stroke();
  // the track: four lanes down to the landing rings
  c.fillStyle=V.lane;c.fillRect(0,trackTop,W,H-trackTop);dots(c,0,trackTop,W,hitY-trackTop+30,V.g2,9,1.6);
  for(let l=0;l<4;l++){c.globalAlpha=.4;c.fillStyle=LANE_COLOR[l];c.fillRect(l*laneW,trackTop,laneW,padTop-trackTop);c.globalAlpha=1;}
  c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.moveTo(0,trackTop);c.lineTo(W,trackTop);c.stroke();c.lineWidth=2;c.setLineDash([7,7]);c.beginPath();for(let l=1;l<4;l++){c.moveTo(l*laneW,trackTop);c.lineTo(l*laneW,padTop);}c.stroke();c.setLineDash([]);
  for(let l=0;l<4;l++){const x=(l+.5)*laneW;c.beginPath();c.arc(x,hitY,20,0,TAU);c.fillStyle=PAPER;c.fill();c.lineWidth=5;c.strokeStyle=INK;c.stroke();c.beginPath();c.arc(x,hitY,14,0,TAU);c.lineWidth=5;c.strokeStyle=LANE_COLOR[l];c.stroke();}
  // the pads
  c.fillStyle=INK;c.fillRect(0,padTop,W,padH);const KEYS=['D','F','J','K'],NAMES=['LEFT','THIGH','HEAD','RIGHT'],weakLane=strong==='R'?0:3;
  for(let l=0;l<4;l++){const x=l*laneW+5,w=laneW-10,y=padTop+7,h=padH-16;rr(c,x+3,y+4,w,h,12);c.fillStyle='#0008';c.fill();rr(c,x,y,w,h,12);c.fillStyle=LANE_COLOR[l];c.fill();c.lineWidth=3;c.strokeStyle=PAPER;c.stroke();
   const is=Math.min(24,h*.24);icon(c,l,x+w/2,y+h*.46,is,l===2?VIOLET:PAPER);
   c.font=`800 ${Math.min(14,Math.round(w*.16))}px system-ui,-apple-system,"Segoe UI",sans-serif`;c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=INK;c.fillText(NAMES[l],x+w/2,y+h-11);
   if(l===weakLane){c.font='italic 900 10px "Arial Black",Impact,sans-serif';const tw=c.measureText('WEAK FOOT').width+8;c.fillStyle=INK;c.fillRect(x+w/2-tw/2,y+5,tw,15);c.fillStyle=PAPER;c.textBaseline='middle';c.fillText('WEAK FOOT',x+w/2,y+13);}
   if(opts.keys){c.fillStyle=PAPER;c.fillRect(x+6,y+h-27,20,20);c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(x+6,y+h-27,20,20);c.fillStyle=INK;c.font='800 13px system-ui,sans-serif';c.textBaseline='middle';c.fillText(KEYS[l],x+16,y+h-16);}}
 }

 /* ---- the ball ---- */
 const footX=(lane:number)=>lane===0?-.25:.25;
 /** where the ball meets the body for a note (metres; x right, y up from the ground) */
 function contact(n:Note,out:{x:number;y:number}){if(n.lane===1){out.x=(n.i%2?-1:1)*.21;out.y=.66;}else if(n.lane===2){out.x=0;out.y=n.kind==='hold'?1.2:1.4;}else{out.x=footX(n.lane);out.y=.3;}return out;}
 const A={x:0,y:0},B={x:0,y:0},ball={x:0,y:BALL,held:false,down:false};
 function arc(t0:number,t1:number,t:number){const T=t1-t0;if(T<=1e-4||t>=t1){ball.x=B.x;ball.y=B.y;return;}const k=clamp((t-t0)/T,0,1),tau=k*T;ball.x=mix(A.x,B.x,k);ball.y=mix(A.y,B.y,k)+.5*G*tau*(T-tau);}
 /** The ball's place at song time t: the real parabola from the last touch to the next one; a dropped ball falls and is flicked up again. */
 function ballAt(g:Keepy,t:number){
  const N=g.chart.notes,beat=60/g.chart.bpm;if(vi>=N.length||(vi>0&&N[vi-1].t>t))vi=0;while(vi<N.length&&N[vi].t<=t)vi++;
  const prev=vi>0?N[vi-1]:undefined,next=vi<N.length?N[vi]:undefined;ball.held=false;ball.down=false;
  if(!prev){if(!next){ball.x=.25;ball.y=BALL;return;}A.x=footX(strong==='R'?3:0);A.y=BALL;contact(next,B);const t0=next.t-Math.min(beat,.8);if(t<t0){ball.x=A.x;ball.y=A.y;}else arc(t0,next.t,t);return;}
  const up=prev.st===1||(prev.st===2&&prev.grade!=='drop');
  if(up){contact(prev,A);const t0=prev.kind==='hold'?(prev.st===1?Infinity:(launch[prev.i]||prev.tEnd)):prev.t;
   if(t<t0){ball.x=A.x;ball.y=A.y;ball.held=true;return;}
   if(next){contact(next,B);arc(t0,Math.max(next.t,t0+.12),t);}else{B.x=.3;B.y=.78;arc(t0,t0+.7,t);}return;}
  // not played (yet): it falls to the ground, bounces once, and is flicked up for the next touch
  contact(prev,A);const tau=t-prev.t,fall=A.y-.5*G*tau*tau,gx=A.x*1.5+(A.x>=0?.12:-.12);ball.down=prev.st===2;
  const t0=next?Math.max(prev.t+.2,next.t-Math.min(.55,(next.t-prev.t)*.6)):Infinity;
  if(t>=t0&&next){A.x=gx;A.y=BALL;contact(next,B);arc(t0,next.t,t);return;}
  if(fall>BALL){ball.x=mix(A.x,gx,clamp(tau*2.4,0,1));ball.y=fall;return;}
  const tg=Math.sqrt(Math.max(0,(A.y-BALL)*2/G)),tb=tau-tg;ball.x=gx;ball.y=BALL+Math.abs(Math.sin(tb*8))*.2*Math.exp(-tb*4);
 }

 /* ---- the bean ---- */
 const px=(x:number)=>cx+x*S,py=(y:number)=>groundY-(y>2.3?2.3+(y-2.3)*.4:y)*S;
 /** w: how much each limb is in its touch pose (0-1): left foot, right foot, left thigh, right thigh, head */
 const w=[0,0,0,0,0],fx=[0,0],fy=[0,0],kx=[0,0],ky=[0,0];
 function bean(c:Ctx,g:Keepy|null,t:number){
  for(let i=0;i<5;i++)w[i]=0;let stall=0,orbit=-1,orbitK=0,crossSide=-1,crossK=0,heelSide=-1,heelK=0;
  if(g){const N=g.chart.notes,prev=vi>0?N[vi-1]:undefined,next=vi<N.length?N[vi]:undefined;
   const add=(n:Note,k:number)=>{if(k<=0)return;const e=smooth(clamp(k,0,1));if(n.lane===1){const i=n.i%2?2:3;if(e>w[i])w[i]=e;}else if(n.lane===2){if(e>w[4])w[4]=e;}else{const i=n.lane===0?0:1;if(e>w[i])w[i]=e;}};
   if(next)add(next,1-(next.t-t)/.17);
   if(prev){add(prev,1-(t-prev.t)/.24);
    if(prev.kind==='hold'&&(prev.st===1||(prev.st===2&&t<(launch[prev.i]||prev.tEnd)+.12)))stall=prev.st===1?1:clamp(1-(t-(launch[prev.i]||prev.tEnd))/.12,0,1);
    if(prev.kind==='swipe'&&prev.grade!=='drop'&&prev.st!==0){const k=(t-prev.t)/.42,side=prev.lane===0?0:1;if(k>=0&&k<1){if(prev.trick==='atw'){orbit=side;orbitK=k;}else if(prev.trick==='cross'){crossSide=side;crossK=k;}else{heelSide=side;heelK=k;}}}}
   if(next&&next.kind==='hold'){const k=smooth(clamp(1-(next.t-t)/.2,0,1));if(k>stall)stall=k;}}
  const sadK=clamp(1-(t-sad)/.7,0,1),hop=w[4]*.07*(1-stall)+(opts.reduced?0:clamp(1-(t-cheer)/.3,0,1)*.05),lean=stall*.2,bob=g&&!opts.reduced?Math.max(0,Math.sin(t*TAU*g.chart.bpm/60))*.012:0;
  const sway=clamp(ball.x,-.3,.3)*.1*(1-stall),bodyB=.42+hop,bodyT=1.2+hop-lean-bob,bw=.27;
  // shadow
  c.fillStyle='#0003';c.beginPath();c.ellipse(px(0),py(0)+4,S*.42,S*.07,0,0,TAU);c.fill();
  // legs (skin), shorts on the thigh (the thigh pad's colour), boots in the foot pads' colours
  for(let s=0;s<2;s++){const d=s?1:-1,k=w[s],th=w[2+s];let KX=d*.15,KY=.25,FX=d*.17,FY=.06;
   KX=mix(KX,d*.2,k);KY=mix(KY,.36,k);FX=mix(FX,d*.27,k);FY=mix(FY,.17,k);
   KX=mix(KX,d*.34,th);KY=mix(KY,.52,th);FX=mix(FX,d*.3,th);FY=mix(FY,.23,th);
   if(orbit===s){const a=-Math.PI/2+orbitK*TAU*d;FX=ball.x+Math.cos(a)*.2;FY=Math.max(.06,ball.y+Math.sin(a)*.2);KX=d*.24;KY=.36;}
   if(crossSide===s){const e=Math.sin(crossK*Math.PI);FX=mix(FX,-d*.12,e);FY=mix(FY,.42,e);KX=mix(KX,d*.02,e);KY=mix(KY,.4,e);}
   if(heelSide===s){const e=Math.sin(Math.min(1,heelK*1.6)*Math.PI);FX=mix(FX,d*.2,e);FY=mix(FY,.44,e);KX=mix(KX,d*.26,e);KY=mix(KY,.24,e);}
   fx[s]=FX;fy[s]=FY;kx[s]=KX;ky[s]=KY;}
  c.lineCap='round';c.lineJoin='round';
  for(let s=0;s<2;s++){const d=s?1:-1,hx=px(d*.12+sway),hy=py(bodyB+.04);
   c.beginPath();c.moveTo(hx,hy);c.lineTo(px(kx[s]),py(ky[s]));c.lineTo(px(fx[s]),py(fy[s]));c.strokeStyle=INK;c.lineWidth=S*.13+5;c.stroke();c.strokeStyle=look.skin;c.lineWidth=S*.13;c.stroke();
   c.beginPath();c.moveTo(hx,hy);c.lineTo(mix(hx,px(kx[s]),.72),mix(hy,py(ky[s]),.72));c.strokeStyle=SUN;c.lineWidth=S*.15;c.stroke();
   const bx=px(fx[s]+d*.03),by=py(fy[s]);c.beginPath();c.ellipse(bx,by,S*.115,S*.07,-d*(w[s]*.5),0,TAU);c.fillStyle=s?RED:TEAL;c.fill();c.strokeStyle=INK;c.lineWidth=2.5;c.stroke();}
  // arms out for balance
  for(let s=0;s<2;s++){const d=s?1:-1,lift=stall*.18+w[4]*.1+w[1-s]*.1+w[3-s]*.06-sadK*.12;c.beginPath();c.moveTo(px(d*(bw-.03)+sway),py(bodyT-.42));c.lineTo(px(d*(bw+.2)+sway),py(bodyT-.5+lift));c.strokeStyle=INK;c.lineWidth=S*.09+5;c.stroke();c.strokeStyle=look.body;c.lineWidth=S*.09;c.stroke();}
  // body: a bean. Kit below, face above, hair on top, the headband in the head pad's colour
  const x0=px(-bw+sway),x1=px(bw+sway),yT=py(bodyT),yB=py(bodyB),r=(x1-x0)/2,mid=yT+(yB-yT)*.5;
  const body=()=>{c.beginPath();c.moveTo(x0,yB-r*.7);c.lineTo(x0,yT+r);c.arc(x0+r,yT+r,r,Math.PI,0);c.lineTo(x1,yB-r*.7);c.quadraticCurveTo(x1,yB,x0+r,yB);c.quadraticCurveTo(x0,yB,x0,yB-r*.7);c.closePath();};
  body();c.fillStyle=look.body;c.fill();
  c.save();c.clip();c.fillStyle=look.skin;c.fillRect(x0,yT,x1-x0,mid-yT);c.fillStyle=look.hair;c.beginPath();c.fillRect(x0,yT,x1-x0,r*.5);c.fillStyle=VIOLET;c.fillRect(x0,yT+r*.5,x1-x0,r*.24);
  c.strokeStyle=INK;c.lineWidth=2.5;c.beginPath();c.moveTo(x0,mid);c.lineTo(x1,mid);c.moveTo(x0,yT+r*.5);c.lineTo(x1,yT+r*.5);c.moveTo(x0,yT+r*.74);c.lineTo(x1,yT+r*.74);c.stroke();c.restore();
  body();c.strokeStyle=INK;c.lineWidth=3.5;c.stroke();
  // eyes on the ball (the head follows it), and a mouth
  const ey=yT+r*1.22,bxp=px(ball.x),byp=py(ball.y);
  for(const d of [-1,1]){const ex=x0+r+d*r*.42,dx=bxp-ex,dy=byp-ey,L=Math.hypot(dx,dy)||1,o=r*.1;c.beginPath();c.ellipse(ex,ey,r*.2,r*.24,0,0,TAU);c.fillStyle=WHITE;c.fill();c.lineWidth=2;c.stroke();c.beginPath();c.arc(ex+dx/L*o,ey+dy/L*o*1.2,r*.11,0,TAU);c.fillStyle=INK;c.fill();}
  c.lineWidth=2.5;c.beginPath();if(sadK>0)c.arc(x0+r,ey+r*.62,r*.2,Math.PI*1.15,Math.PI*1.85);else c.arc(x0+r,ey+r*.3,r*.26,Math.PI*.2,Math.PI*.8);c.stroke();
 }

 /* ---- one frame of the moving layer ---- */
 function render(g:Keepy|null,t:number,pressed=0){
  paint();const c=f;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  if(g!==lastGame){lastGame=g;vi=0;word.t=-9;sad=-9;cheer=-9;flash=[-9,-9,-9,-9];launch=new Float64Array(g?g.chart.notes.length:0);}
  if(!g){ball.x=.25;ball.y=BALL;ball.held=false;bean(c,null,0);ballArt(c,px(ball.x),py(ball.y),BALL*S,0);return;}
  const N=g.chart.notes,s=g.state,beat=60/(t>g.chart.speedAt*60/g.chart.bpm?g.chart.bpm2:g.chart.bpm),look2=Math.min(1.7,beat*2.2),trackH=hitY-trackTop;
  // pads held down, and the flash of a touch in its ring
  for(let l=0;l<4;l++){if(pressed&(1<<l)){c.fillStyle='#231a2e55';rr(c,l*laneW+5,padTop+7,laneW-10,padH-16,12);c.fill();}
   const k=(t-flash[l])/.22;if(k>=0&&k<1){c.beginPath();c.arc((l+.5)*laneW,hitY,20+k*16,0,TAU);c.lineWidth=7*(1-k);c.strokeStyle=flashGood[l]?PAPER:INK;c.stroke();}}
  // the beat: every ring breathes once a beat (the metronome you can see), and the next ball's ring closes in on it
  const ph=((t/beat)%1+1)%1,pulse=opts.reduced?0:Math.max(0,1-ph*3.2);
  if(pulse>0){c.lineWidth=3;c.strokeStyle=PAPER;c.globalAlpha=pulse*.9;c.beginPath();for(let l=0;l<4;l++){c.moveTo((l+.5)*laneW+24+pulse*4,hitY);c.arc((l+.5)*laneW,hitY,24+pulse*4,0,TAU);}c.stroke();c.globalAlpha=1;}
  // the cue balls: nearest last so it is on top
  let nextN:Note|undefined;for(let i=s.base;i<N.length;i++){if(N[i].st===0){nextN=N[i];break;}}
  let last=s.base;while(last<N.length&&N[last].t-t<look2)last++;
  for(let i=last-1;i>=s.base;i--){const n=N[i];if(n.st===2)continue;const x=(n.lane+.5)*laneW,y=hitY-(n.t-t)/look2*trackH,col=LANE_COLOR[n.lane];
   if(n.kind==='hold'){const y1=Math.max(trackTop,hitY-(n.tEnd-t)/look2*trackH),y0=n.st===1?hitY:Math.min(hitY+10,y);if(y0>y1){rr(c,x-13,y1,26,y0-y1,10);c.fillStyle=n.st===1?PAPER:col;c.fill();c.lineWidth=3.5;c.strokeStyle=INK;c.stroke();if(n.st===1){const k=clamp((t-n.t)/(n.tEnd-n.t),0,1);c.fillStyle=col;c.fillRect(x-9,hitY-(hitY-y1)*k,18,(hitY-y1)*k-4);}}
    if(n.st===1)continue;}
   if(y<trackTop-4)continue;
   if(n.trick&&n.kind==='tap'&&i+1<N.length&&N[i+1].group===n.group){const m=N[i+1],y2=Math.max(trackTop,hitY-(m.t-t)/look2*trackH);c.beginPath();c.moveTo(x,y);c.lineTo((m.lane+.5)*laneW,y2);c.lineWidth=9;c.strokeStyle=INK;c.stroke();c.lineWidth=4;c.strokeStyle=SUN;c.stroke();}
   if(n.kind==='swipe'){star(c,x,y,28,8,t*1.5,.72);c.fillStyle=SUN;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();}
   c.beginPath();c.arc(x,y,19,0,TAU);c.fillStyle=col;c.fill();c.lineWidth=3.5;c.strokeStyle=INK;c.stroke();
   if(n.kind==='swipe'){c.lineWidth=4;c.lineCap='round';c.beginPath();if(n.dir==='up'){c.moveTo(x,y+8);c.lineTo(x,y-8);c.moveTo(x-6,y-2);c.lineTo(x,y-9);c.lineTo(x+6,y-2);}else if(n.dir==='side'){c.moveTo(x-8,y);c.lineTo(x+8,y);c.moveTo(x+2,y-6);c.lineTo(x+9,y);c.lineTo(x+2,y+6);c.moveTo(x-2,y-6);c.lineTo(x-9,y);c.lineTo(x-2,y+6);}else{c.arc(x,y,8,-.4,Math.PI*1.45);c.moveTo(x+9,y-8);c.lineTo(x+7.4,y-3);c.lineTo(x+2.5,y-5);}c.stroke();}
   else ballArt(c,x,y,13,n.i);}
  if(nextN){const k=clamp((nextN.t-t)/beat,0,1),x=(nextN.lane+.5)*laneW;c.beginPath();c.arc(x,hitY,22+k*26,0,TAU);c.lineWidth=5;c.strokeStyle=INK;c.stroke();c.lineWidth=2.5;c.strokeStyle=LANE_COLOR[nextN.lane];c.stroke();}
  // the run's progress along the top of the track
  {const k=clamp((t-g.chart.start)/(g.chart.end-g.chart.start),0,1);c.fillStyle=INK;c.fillRect(0,trackTop-5,W,5);c.fillStyle=SUN;c.fillRect(0,trackTop-4,W*k,3);}
  // the bean and the ball
  ballAt(g,t);
  const shake=!opts.reduced&&t-sad<.25?Math.sin((t-sad)*60)*3*(1-(t-sad)/.25):0;c.save();c.translate(shake,0);
  {const k=clamp(1-ball.y/2.6,.25,1);c.fillStyle='#0004';c.beginPath();c.ellipse(px(ball.x),py(0)+4,S*.13*k,S*.035*k,0,0,TAU);c.fill();}
  const behind=ball.held;if(behind)ballArt(c,px(ball.x),py(ball.y),BALL*S,0);
  bean(c,g,t);
  // the landing marker on the body: where the ball comes down next, in the pad's colour
  if(nextN&&!ball.held){contact(nextN,B);const k=clamp((nextN.t-t)/beat,0,1);c.beginPath();c.arc(px(B.x),py(B.y-BALL*.6),S*(.08+k*.14),0,TAU);c.lineWidth=5;c.strokeStyle=INK;c.stroke();c.lineWidth=3;c.strokeStyle=LANE_COLOR[nextN.lane];c.stroke();}
  if(!behind)ballArt(c,px(ball.x),py(ball.y),BALL*S,opts.reduced?0:t*5);
  c.restore();
  // the count-in
  if(t<0){const bt=-t/beat,n=Math.ceil(bt),k=1-(n-bt);if(n>=1&&n<=4){const size=Math.round(S*.5*(1+(opts.reduced?0:(1-k)*.25)));c.font=`italic 900 ${size}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';const y=py(1.95);c.lineWidth=9;c.strokeStyle=INK;c.lineJoin='round';c.strokeText(String(n),cx,y);c.fillStyle=SUN;c.fillText(String(n),cx,y);}}
  // the grade of the last touch, in kid words
  {const k=(t-word.t)/.6;if(k>=0&&k<1&&word.text){const pop=opts.reduced?1:k<.15?.6+k/.15*.5:k<.3?1.1-(k-.15)/.15*.1:1,x=clamp(cx+S*.78,70,W-70),y=py(1.02)-k*14;c.save();c.translate(x,y);c.scale(pop,pop);c.rotate(-.07);if(k>.75)c.globalAlpha=(1-k)*4;
    if(word.grade==='sweet'){star(c,0,0,S*.36,9,.3,.7);c.fillStyle=INK;c.translate(3,3);c.fill();c.translate(-3,-3);star(c,0,0,S*.36,9,.3,.7);c.fillStyle=SUN;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();c.font=`italic 900 ${Math.round(S*.15)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=INK;c.fillText(word.text,0,1);}
    else tag(c,word.text,0,-12,{fill:word.grade==='good'?TEAL:word.grade==='drop'?RED:PAPER,color:word.grade==='drop'?PAPER:INK,size:Math.round(clamp(S*.13,13,18))});c.restore();}}
  // touches in a row
  if(s.combo>=3&&s.mode==='track'){const x=clamp(cx-S*.82,54,W),y=py(1.1);c.font=`italic 900 ${Math.round(S*.34)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=8;c.strokeStyle=INK;c.strokeText(String(s.combo),x,y);c.fillStyle=PAPER;c.fillText(String(s.combo),x,y);tag(c,'in a row',x,y+S*.2,{size:11,fill:SUN});}
 }
 /** A rules event at draw time t: what the next frames show. */
 function onEvent(e:KuEvent,g:Keepy,t:number){
  if(e.type==='hit'){word={t,text:GRADE_WORD[e.grade as Grade],grade:e.grade,lane:e.lane};flash[e.lane]=t;flashGood[e.lane]=clean(e.grade);const n=g.chart.notes[e.i];if(n&&n.kind==='hold'&&e.i<launch.length)launch[e.i]=Math.min(t,n.tEnd);if(e.grade==='sweet')cheer=t;}
  else if(e.type==='drop'){word={t,text:GRADE_WORD.drop,grade:'drop',lane:e.lane};sad=t;}
  else if(e.type==='press'){flash[e.lane]=t;flashGood[e.lane]=true;}
 }
 return {resize,render,onEvent,
  setLook(l:Partial<BeanLook>){look={...look,...l};},
  setScene(v:number,foot:Foot){venue=clamp(Math.floor(v),0,VENUES.length-1);strong=foot;},
  /** which pad a point of the stage is on (the whole column counts, so a thumb can rest anywhere under the bean) */
  laneAt(x:number){return clamp(Math.floor(x/laneW),0,3);},
  get layout(){return {W,H,padTop,padH,hitY,trackTop,groundY,S,laneW};},
  get ball(){return ball;},
  get pixels(){return fg.width*fg.height;},
  clear(){f.setTransform(dpr,0,0,dpr,0,0);f.clearRect(0,0,W,H);},
  dispose(){bg.width=bg.height=fg.width=fg.height=1;},
 };
}
