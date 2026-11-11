/**
 * Kit Rush renderer (Nov 10 2026, docs/arcade-aaa/kitrush-direction.md): 2D canvas, comic print (ink outline, flat colour, one
 * violet shadow band, Ben-Day dots). Two canvases: `bg` is the training ground at golden hour, painted ONCE per resize and never
 * again; `fg` holds only what moves and is the only thing redrawn. Every kit sprite is pre-rendered into one atlas per resize.
 * Pools for halves, bursts, dots, popups and trail points: render() allocates nothing. No loop lives here: the component calls
 * render() from its own rAF while a round is on (menus, pause, results and a hidden tab draw nothing).
 */
import {KR,KIND,KIT_KINDS,TEAMS,callFor,type KitEvent,type KitRushState} from './core';

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const SPR=1.42;// sprite half-size in item radii
type Ctx=CanvasRenderingContext2D;
const star=(c:Ctx,x:number,y:number,ro:number,ri:number,n:number,rot:number,sx=1)=>{c.beginPath();for(let i=0;i<n*2;i++){const r=i%2?ri:ro,a=rot+Math.PI*i/n;if(i)c.lineTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r);else c.moveTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r);}c.closePath();};

/* ---- kit silhouettes in unit space (1 = the item radius) ---- */
const PATHS:((c:Ctx)=>void)[]=[
 c=>{c.beginPath();c.arc(0,0,.96,0,Math.PI*2);},
 c=>{c.beginPath();c.moveTo(-.64,-1);c.lineTo(-.3,-1);c.quadraticCurveTo(0,-.4,.3,-1);c.lineTo(.64,-1);c.quadraticCurveTo(.5,-.3,.92,-.05);c.lineTo(.82,1);c.lineTo(-.82,1);c.lineTo(-.92,-.05);c.quadraticCurveTo(-.5,-.3,-.64,-1);c.closePath();},
 c=>{c.beginPath();c.moveTo(-1.08,-.62);c.lineTo(-.48,-.66);c.quadraticCurveTo(-.32,-.12,.25,-.08);c.quadraticCurveTo(.98,-.02,1.12,.38);c.lineTo(1.12,.56);c.lineTo(-1.08,.56);c.closePath();},
 c=>{c.beginPath();c.moveTo(-.42,-.96);c.quadraticCurveTo(0,-.6,.42,-.96);c.lineTo(1.16,-.56);c.lineTo(.9,-.02);c.lineTo(.62,-.22);c.lineTo(.62,1);c.lineTo(-.62,1);c.lineTo(-.62,-.22);c.lineTo(-.9,-.02);c.lineTo(-1.16,-.56);c.closePath();},
 c=>{c.beginPath();c.moveTo(-.26,-1);c.lineTo(.26,-1);c.lineTo(.74,.6);c.lineTo(1.06,.6);c.lineTo(1.06,.96);c.lineTo(-1.06,.96);c.lineTo(-1.06,.6);c.lineTo(-.74,.6);c.closePath();},
 c=>{c.beginPath();c.moveTo(-.5,-.3);c.quadraticCurveTo(-.5,-.58,-.28,-.66);c.lineTo(-.28,-.86);c.lineTo(.28,-.86);c.lineTo(.28,-.66);c.quadraticCurveTo(.5,-.58,.5,-.3);c.lineTo(.5,1);c.lineTo(-.5,1);c.closePath();},
];
function details(c:Ctx,kind:number){
 c.strokeStyle=INK;c.fillStyle=INK;c.lineWidth=.1;c.lineCap='round';
 if(kind===KIND.ball){star(c,0,0,.34,.27,5,-Math.PI/2);c.fill();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.beginPath();c.moveTo(Math.cos(a)*.34,Math.sin(a)*.34);c.lineTo(Math.cos(a)*.9,Math.sin(a)*.9);c.stroke();}}
 else if(kind===KIND.bib){c.beginPath();c.moveTo(-.8,.74);c.lineTo(.8,.74);c.stroke();c.fillStyle=PAPER;c.beginPath();c.arc(0,.12,.3,0,Math.PI*2);c.fill();c.stroke();}
 else if(kind===KIND.boot){c.fillStyle=INK;for(const x of[-.85,-.35,.2,.75])c.fillRect(x,.56,.2,.26);c.strokeStyle=PAPER;c.lineWidth=.11;for(const x of[-.12,.14,.4]){c.beginPath();c.moveTo(x-.1,-.28+x*.12);c.lineTo(x+.08,.06+x*.1);c.stroke();}c.strokeStyle=INK;c.lineWidth=.09;c.beginPath();c.moveTo(-1.05,.34);c.lineTo(1.1,.34);c.stroke();}
 else if(kind===KIND.shirt){c.beginPath();c.moveTo(-.42,-.96);c.quadraticCurveTo(0,-.36,.42,-.96);c.stroke();c.beginPath();c.moveTo(-.62,-.22);c.lineTo(-.62,.2);c.moveTo(.62,-.22);c.lineTo(.62,.2);c.stroke();}
 else if(kind===KIND.cone){c.fillStyle=PAPER;c.beginPath();c.moveTo(-.43,-.42);c.lineTo(.43,-.42);c.lineTo(.56,0);c.lineTo(-.56,0);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-.74,.6);c.lineTo(.74,.6);c.stroke();}
 else if(kind===KIND.bottle){c.fillStyle=PAPER;c.fillRect(-.15,-1.14,.3,.3);c.strokeRect(-.15,-1.14,.3,.3);c.beginPath();c.moveTo(-.5,-.3);c.lineTo(.5,-.3);c.moveTo(-.5,.5);c.lineTo(.5,.5);c.stroke();c.fillStyle=PAPER;c.fillRect(-.45,-.05,.9,.34);c.strokeRect(-.45,-.05,.9,.34);}
}
function paintKit(c:Ctx,kind:number,team:number){
 const t=TEAMS[team],path=PATHS[kind];c.lineJoin='round';
 path(c);c.fillStyle=t.color;c.fill();c.save();path(c);c.clip();c.fillStyle=t.dark;
 if(t.pattern==='hoops')for(let y=-1.1;y<1.2;y+=.52)c.fillRect(-1.4,y,2.8,.24);
 else if(t.pattern==='stripes')for(let x=-1.02;x<1.2;x+=.5)c.fillRect(x,-1.4,.22,2.8);
 else if(t.pattern==='sash'){c.rotate(-.7);c.fillRect(-2,-.21,4,.42);c.rotate(.7);}
 c.fillStyle='rgba(72,48,120,.26)';c.beginPath();c.rect(-1.5,-1.5,3,3);c.arc(-.5,-.56,1.42,0,Math.PI*2,true);c.fill('evenodd');
 c.fillStyle='rgba(255,243,214,.6)';c.beginPath();c.ellipse(-.36,-.5,.2,.1,-.6,0,Math.PI*2);c.fill();
 c.restore();path(c);c.lineWidth=.17;c.strokeStyle=INK;c.stroke();details(c,kind);
}
function paintSpecial(c:Ctx,kind:number){
 c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;
 if(kind===KIND.whistle){
  star(c,0,0,1.34,.98,11,.2);c.fillStyle=RED;c.fill();c.lineWidth=.15;c.stroke();
  c.fillStyle=PAPER;c.beginPath();c.rect(-.1,-.5,1,.42);c.fill();c.stroke();c.beginPath();c.arc(-.22,.08,.56,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle='rgba(72,48,120,.36)';c.beginPath();c.arc(-.22,.08,.5,.3,2.4);c.fill();
  c.fillStyle=INK;c.beginPath();c.arc(-.22,.08,.17,0,Math.PI*2);c.fill();c.lineWidth=.1;c.beginPath();c.arc(-.74,-.44,.17,0,Math.PI*2);c.stroke();
 }else if(kind===KIND.golden){
  star(c,0,0,1.36,1,9,0);c.fillStyle=ORANGE;c.fill();c.lineWidth=.13;c.stroke();
  c.beginPath();c.arc(0,0,.9,0,Math.PI*2);c.fillStyle=SUN;c.fill();c.fillStyle='rgba(255,243,214,.85)';c.beginPath();c.ellipse(-.34,-.44,.26,.12,-.6,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(0,0,.9,0,Math.PI*2);c.lineWidth=.17;c.stroke();c.fillStyle='#b9621a';star(c,0,0,.32,.26,5,-Math.PI/2);c.fill();c.strokeStyle='#b9621a';c.lineWidth=.1;
  for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.beginPath();c.moveTo(Math.cos(a)*.32,Math.sin(a)*.32);c.lineTo(Math.cos(a)*.84,Math.sin(a)*.84);c.stroke();}
 }else if(kind===KIND.stopwatch){
  c.fillStyle=TEAL;c.fillRect(-.16,-1.22,.32,.34);c.lineWidth=.13;c.strokeRect(-.16,-1.22,.32,.34);
  c.beginPath();c.arc(0,.14,.98,0,Math.PI*2);c.fillStyle=TEAL;c.fill();c.lineWidth=.17;c.stroke();c.beginPath();c.arc(0,.14,.68,0,Math.PI*2);c.fillStyle=PAPER;c.fill();c.lineWidth=.11;c.stroke();
  c.lineWidth=.14;c.beginPath();c.moveTo(0,.14);c.lineTo(0,-.38);c.moveTo(0,.14);c.lineTo(.34,.3);c.stroke();
 }else{
  c.beginPath();c.moveTo(-1.1,-.46);c.quadraticCurveTo(0,-.72,1.1,-.46);c.lineTo(1.1,.5);c.quadraticCurveTo(0,.24,-1.1,.5);c.closePath();c.fillStyle=RED;c.fill();
  c.fillStyle=PAPER;c.beginPath();c.arc(0,-.06,.47,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(-1.1,-.46);c.quadraticCurveTo(0,-.72,1.1,-.46);c.lineTo(1.1,.5);c.quadraticCurveTo(0,.24,-1.1,.5);c.closePath();c.lineWidth=.17;c.stroke();
  c.lineWidth=.16;c.beginPath();c.arc(.02,-.06,.24,.8,Math.PI*2-.8);c.stroke();
 }
}

/* ---- the static scene: training ground at golden hour, from the touchline ---- */
function paintScene(c:Ctx,W:number,H:number){
 const hz=H*.5,u=W/100;c.lineJoin='round';
 c.fillStyle='#2f5fa8';c.fillRect(0,0,W,hz*.42);c.fillStyle='#5a78b4';c.fillRect(0,hz*.42,W,hz*.14);c.fillStyle='#f08a5a';c.fillRect(0,hz*.56,W,hz*.2);c.fillStyle='#ffa866';c.fillRect(0,hz*.76,W,hz*.12);c.fillStyle='#ffcf7a';c.fillRect(0,hz*.88,W,hz*.13);
 // Ben-Day dots where the sky turns
 c.fillStyle='#f08a5a';for(let row=0;row<5;row++)for(let x=(row%2)*u*1.5;x<W;x+=u*3){c.beginPath();c.arc(x,hz*.56-u*1.2-row*u*2.4,Math.max(.4,u*(.95-row*.17)),0,Math.PI*2);c.fill();}
 c.fillStyle='#ffcf7a';for(let row=0;row<4;row++)for(let x=(row%2)*u*1.5;x<W;x+=u*3){c.beginPath();c.arc(x,hz*.88-u*1.1-row*u*2.2,Math.max(.4,u*(.9-row*.2)),0,Math.PI*2);c.fill();}
 // the sun: stacked discs
 const sx=W*.7,sy=hz*.8;for(const [r,col] of [[30,'#ff8a3c'],[24,'#ffc24a'],[18,'#fff1b0']] as const){c.fillStyle=col;c.beginPath();c.arc(sx,sy,r*u,0,Math.PI*2);c.fill();}
 // cut clouds
 const cloud=(x:number,y:number,s:number,col:string)=>{c.fillStyle=col;c.beginPath();c.moveTo(x-9*s,y);c.quadraticCurveTo(x-9*s,y-3*s,x-4*s,y-3*s);c.quadraticCurveTo(x-2*s,y-7*s,x+3*s,y-4.4*s);c.quadraticCurveTo(x+9*s,y-5*s,x+10*s,y);c.closePath();c.fill();c.lineWidth=u*.5;c.strokeStyle=INK;c.stroke();};
 cloud(W*.22,hz*.3,u*1.5,PAPER);cloud(W*.82,hz*.2,u*1.1,'#ffe6c2');cloud(W*.5,hz*.52,u*.9,'#ffd9a8');
 // far stand and floodlights (violet silhouette with an ink edge)
 c.fillStyle='#6a5a9c';c.beginPath();c.moveTo(0,hz);c.lineTo(0,hz*.84);c.lineTo(W*.3,hz*.78);c.lineTo(W*.34,hz*.86);c.lineTo(W*.62,hz*.86);c.lineTo(W*.66,hz*.8);c.lineTo(W,hz*.86);c.lineTo(W,hz);c.closePath();c.fill();c.lineWidth=u*.55;c.strokeStyle=INK;c.stroke();
 c.fillStyle='#8f78b8';for(let x=u*2;x<W;x+=u*3.2){c.beginPath();c.arc(x,hz*.93+((x*13)%7)*u*.12,u*.75,0,Math.PI*2);c.fill();}
 for(const mx of [W*.1,W*.9]){c.strokeStyle=INK;c.lineWidth=u*.9;c.beginPath();c.moveTo(mx,hz);c.lineTo(mx,hz*.4);c.stroke();c.fillStyle=PAPER;c.fillRect(mx-u*3.4,hz*.34,u*6.8,u*3.4);c.lineWidth=u*.55;c.strokeRect(mx-u*3.4,hz*.34,u*6.8,u*3.4);c.fillStyle=SUN;for(let i=0;i<3;i++){c.beginPath();c.arc(mx-u*2.1+i*u*2.1,hz*.34+u*1.7,u*.7,0,Math.PI*2);c.fill();}}
 // the pitch: mown bands, flat
 const bands=7;for(let i=0;i<bands;i++){const y0=hz+(H-hz)*Math.pow(i/bands,1.5),y1=hz+(H-hz)*Math.pow((i+1)/bands,1.5);c.fillStyle=i%2?'#3f9a5c':'#56ad62';c.fillRect(0,y0,W,y1-y0+1);}
 c.strokeStyle=INK;c.lineWidth=u*.6;c.beginPath();c.moveTo(0,hz);c.lineTo(W,hz);c.stroke();
 // goal frame on the far touchline, with a net hatch
 const gx=W*.5,gw=u*34,gh=u*13,gy=hz+u*4;c.strokeStyle='rgba(255,243,214,.55)';c.lineWidth=u*.22;for(let i=1;i<12;i++){const x=gx-gw/2+gw*i/12;c.beginPath();c.moveTo(x,gy-gh);c.lineTo(x,gy);c.stroke();}for(let j=1;j<5;j++){c.beginPath();c.moveTo(gx-gw/2,gy-gh*j/5);c.lineTo(gx+gw/2,gy-gh*j/5);c.stroke();}
 c.strokeStyle=INK;c.lineWidth=u*1.7;c.beginPath();c.moveTo(gx-gw/2,gy);c.lineTo(gx-gw/2,gy-gh);c.lineTo(gx+gw/2,gy-gh);c.lineTo(gx+gw/2,gy);c.stroke();c.strokeStyle=PAPER;c.lineWidth=u*.8;c.stroke();
 // pitch markings in paper: the box and the long violet evening shadows
 c.strokeStyle=PAPER;c.lineWidth=u*.7;c.beginPath();c.moveTo(W*.14,gy+u*1);c.lineTo(W*.86,gy+u*1);c.moveTo(W*.2,gy+u*1);c.lineTo(W*.08,hz+(H-hz)*.42);c.lineTo(W*.92,hz+(H-hz)*.42);c.lineTo(W*.8,gy+u*1);c.stroke();
 c.beginPath();c.ellipse(W*.5,hz+(H-hz)*.42,u*16,u*5,0,0,Math.PI);c.stroke();
 // evening shadows: flat violet shapes raking down-left from the sun (masts, posts, mannequins), dots where the mown bands turn
 const P=(f:number)=>hz+(H-hz)*f,shadow='rgba(72,48,120,.3)';
 c.fillStyle='rgba(35,26,46,.16)';for(let i=1;i<bands;i++){const y=hz+(H-hz)*Math.pow(i/bands,1.5);for(let x=(i%2)*u*1.6;x<W;x+=u*3.2){c.beginPath();c.arc(x,y+u*1,u*.55,0,Math.PI*2);c.fill();}}
 c.fillStyle=shadow;c.beginPath();c.moveTo(gx-gw/2-u*.8,gy);c.lineTo(gx+gw/2+u*.8,gy);c.lineTo(gx+gw/2-u*20,gy+u*9);c.lineTo(gx-gw/2-u*20,gy+u*9);c.closePath();c.fill();
 // free-kick mannequins on the right of the box, each with its shadow
 for(let i=0;i<3;i++){const mx=W*.66+i*u*7.5,my=P(.5),mh=u*13;c.fillStyle=shadow;c.beginPath();c.moveTo(mx-u*2.4,my);c.lineTo(mx+u*2.4,my);c.lineTo(mx-u*15,my+u*7);c.lineTo(mx-u*19,my+u*7);c.closePath();c.fill();
  c.fillStyle=i===1?'#e9dcc2':'#6a5a9c';/* scenery never wears a kit colour */c.beginPath();c.moveTo(mx-u*2.6,my);c.lineTo(mx-u*2.6,my-mh*.62);c.quadraticCurveTo(mx-u*2.6,my-mh*.8,mx-u*1.2,my-mh*.8);c.arc(mx,my-mh*.86,u*1.7,Math.PI*.8,Math.PI*.2);c.quadraticCurveTo(mx+u*2.6,my-mh*.8,mx+u*2.6,my-mh*.62);c.lineTo(mx+u*2.6,my);c.closePath();c.fill();c.lineWidth=u*.6;c.strokeStyle=INK;c.stroke();
  c.fillStyle='rgba(72,48,120,.4)';c.fillRect(mx-u*2.3,my-mh*.6,u*1.7,mh*.6);}
 // a slalom of cones on the left
 for(let i=0;i<5;i++){const k=i/4,cx=W*(.12+.2*k),cy=P(.56+.3*k),sz=u*(2.2+2.2*k);c.fillStyle=shadow;c.beginPath();c.moveTo(cx-sz,cy);c.lineTo(cx+sz,cy);c.lineTo(cx-sz*3.6,cy+sz*1.1);c.lineTo(cx-sz*4.6,cy+sz*1.1);c.closePath();c.fill();
  c.fillStyle='#e9dcc2';c.beginPath();c.moveTo(cx-sz*.3,cy-sz*2.3);c.lineTo(cx+sz*.3,cy-sz*2.3);c.lineTo(cx+sz,cy);c.lineTo(cx-sz,cy);c.closePath();c.fill();c.lineWidth=Math.max(1,sz*.24);c.strokeStyle=INK;c.stroke();
  c.fillStyle='#6a5a9c';c.fillRect(cx-sz*.55,cy-sz*1.35,sz*1.1,sz*.45);}
 // a corner flag and two stray balls
 c.strokeStyle=INK;c.lineWidth=u*.7;c.beginPath();c.moveTo(W*.9,P(.74));c.lineTo(W*.9,P(.74)-u*17);c.stroke();c.fillStyle=PAPER;c.beginPath();c.moveTo(W*.9,P(.74)-u*17);c.lineTo(W*.9-u*8,P(.74)-u*14);c.lineTo(W*.9,P(.74)-u*11);c.closePath();c.fill();c.lineWidth=u*.55;c.stroke();
 for(const [bx,byy,br] of [[W*.8,P(.82),u*3.2],[W*.6,P(.66),u*2.3]] as const){c.fillStyle=shadow;c.beginPath();c.ellipse(bx-br*1.5,byy+br*.8,br*2,br*.5,0,0,Math.PI*2);c.fill();c.fillStyle=PAPER;c.beginPath();c.arc(bx,byy,br,0,Math.PI*2);c.fill();c.lineWidth=br*.2;c.strokeStyle=INK;c.stroke();c.fillStyle=INK;star(c,bx,byy,br*.4,br*.32,5,-1.2);c.fill();}
 // the open kit bag at the bottom edge: everything flies out of it
 const by=H-u*10,bw=u*60;c.fillStyle=INK;c.beginPath();c.ellipse(W*.5+u*1.2,H-u*1,bw*.56,u*4,0,0,Math.PI*2);c.fill();
 c.fillStyle='#4a3d66';c.beginPath();c.moveTo(W*.5-bw/2,H+u);c.lineTo(W*.5-bw/2+u*3,by);c.quadraticCurveTo(W*.5,by-u*5,W*.5+bw/2-u*3,by);c.lineTo(W*.5+bw/2,H+u);c.closePath();c.fill();c.lineWidth=u*.9;c.strokeStyle=INK;c.stroke();
 c.fillStyle=INK;c.beginPath();c.ellipse(W*.5,by+u*.6,bw*.36,u*2.6,0,0,Math.PI*2);c.fill();c.strokeStyle=PAPER;c.lineWidth=u*.45;c.setLineDash([u*1.2,u*1.2]);c.beginPath();c.ellipse(W*.5,by+u*.6,bw*.39,u*3.3,0,Math.PI,Math.PI*2);c.stroke();c.setLineDash([]);
 c.fillStyle=PAPER;c.fillRect(W*.5-u*7,by+u*4.2,u*14,u*2.6);c.lineWidth=u*.5;c.strokeStyle=INK;c.strokeRect(W*.5-u*7,by+u*4.2,u*14,u*2.6);
}

type Half={on:boolean;spr:number;x:number;y:number;vx:number;vy:number;rot:number;vr:number;cut:number;side:number;life:number};
type Burst={on:boolean;x:number;y:number;life:number;max:number;color:string;size:number;rot:number};
type Dot={on:boolean;x:number;y:number;vx:number;vy:number;life:number;color:string;r:number};
type Pop={on:boolean;x:number;y:number;life:number;text:string;big:boolean};
type Trail={x:Float32Array;y:Float32Array;t:Float32Array;head:number;n:number};
const TRAIL=18,TRAIL_MS=150;

export type KitRushView=ReturnType<typeof createKitRushView>;
export function createKitRushView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean}){
 const bctx=bg.getContext('2d',{alpha:false})!,ctx=fg.getContext('2d')!;
 let W=0,H=0,dpr=1,u=1,S=0,cols=8;const atlas=document.createElement('canvas'),actx=atlas.getContext('2d')!;
 const halves:Half[]=Array.from({length:28},()=>({on:false,spr:0,x:0,y:0,vx:0,vy:0,rot:0,vr:0,cut:0,side:1,life:0}));
 const bursts:Burst[]=Array.from({length:14},()=>({on:false,x:0,y:0,life:0,max:.2,color:SUN,size:1,rot:0}));
 const dots:Dot[]=Array.from({length:56},()=>({on:false,x:0,y:0,vx:0,vy:0,life:0,color:INK,r:1}));
 const pops:Pop[]=Array.from({length:12},()=>({on:false,x:0,y:0,life:0,text:'',big:false}));
 const trails:Trail[]=[0,1,2,3].map(()=>({x:new Float32Array(TRAIL),y:new Float32Array(TRAIL),t:new Float32Array(TRAIL),head:0,n:0}));
 const call={life:0,max:1,text:'',color:RED,x:50,y:60,tilt:0,w:1,size:1},kit={life:0,max:1,team:0,title:''};
 const pointText=new Map<number,string>();let shake=0,flash=0,jit=7,fontPop='',fontPopBig='',fontCall='',fontCap='';
 const rnd=()=>{jit=(jit*1103515245+12345)&0x7fffffff;return jit/0x7fffffff;};
 const sprite=(kind:number,team:number)=>kind<KIT_KINDS?kind*4+Math.max(0,team):24+(kind-KIT_KINDS);
 function resize(cssW:number,cssH:number,ratio:number){
  dpr=ratio;W=Math.max(1,Math.round(cssW*dpr));H=Math.max(1,Math.round(cssH*dpr));u=W/KR.fieldW;
  for(const cv of [bg,fg]){cv.width=W;cv.height=H;}
  paintScene(bctx,W,H);
  S=Math.ceil(KR.r*u*SPR*2)+2;cols=8;atlas.width=S*cols;atlas.height=S*4;actx.clearRect(0,0,atlas.width,atlas.height);
  for(let i=0;i<28;i++){actx.setTransform(1,0,0,1,0,0);actx.translate((i%cols)*S+S/2,Math.floor(i/cols)*S+S/2);actx.scale(KR.r*u,KR.r*u);if(i<24)paintKit(actx,Math.floor(i/4),i%4);else paintSpecial(actx,KIT_KINDS+i-24);}
  actx.setTransform(1,0,0,1,0,0);
  const px=(n:number)=>Math.round(n*u);
  fontPop=`400 ${px(7)}px IslandBrush,"Arial Black",sans-serif`;fontPopBig=`400 ${px(10)}px IslandBrush,"Arial Black",sans-serif`;
  fontCall=`italic 900 ${px(11)}px "Arial Black","Avenir Next Condensed",Impact,sans-serif`;fontCap=`800 ${px(4.2)}px system-ui,-apple-system,"Segoe UI",sans-serif`;
  ctx.clearRect(0,0,W,H);
 }
 function spawnBurst(x:number,y:number,color:string,size:number,max=.2){for(const b of bursts)if(!b.on){b.on=true;b.x=x;b.y=y;b.life=max;b.max=max;b.color=color;b.size=size;b.rot=rnd()*6.28;return;}}
 function spawnDots(x:number,y:number,color:string,n:number,speed:number){let k=n;for(const d of dots){if(k<=0)return;if(d.on)continue;const a=rnd()*6.28,v=speed*(.4+rnd()*.8);d.on=true;d.x=x;d.y=y;d.vx=Math.cos(a)*v;d.vy=Math.sin(a)*v-speed*.3;d.life=.35+rnd()*.25;d.color=color;d.r=.6+rnd()*.9;k--;}}
 function spawnPop(x:number,y:number,points:number,big:boolean){let t=pointText.get(points);if(!t){t='+'+points;pointText.set(points,t);}for(const p of pops)if(!p.on){p.on=true;p.x=Math.max(8,Math.min(92,x));p.y=y;p.life=.7;p.text=t;p.big=big;return;}}
 function say(text:string,color:string,x:number,y:number,dur=.85,size=1){call.size=size;call.text=text;call.color=color;call.life=dur;call.max=dur;call.x=Math.max(30,Math.min(70,x));call.y=y;call.tilt=(rnd()-.5)*.16;ctx.font=fontCall;call.w=Math.max(1,ctx.measureText(text).width);}
 /** Reacts to one rules event (the component drains the game's events into this, the sound and the HUD). */
 function onEvent(e:KitEvent,s:KitRushState){
  if(e.type==='slice'){const spr=sprite(e.c,e.d===-2?-1:e.d),col=e.c>=KIT_KINDS?SUN:TEAMS[Math.max(0,e.d)].color;let n=0;
   for(const hf of halves){if(hf.on)continue;const side=n?-1:1,nx=-Math.sin(e.ang)*side,ny=Math.cos(e.ang)*side;hf.on=true;hf.spr=spr;hf.x=e.x;hf.y=e.y;hf.vx=nx*22+Math.cos(e.ang)*14;hf.vy=ny*22+Math.sin(e.ang)*14-16;hf.rot=0;hf.vr=side*(3+rnd()*3);hf.cut=e.ang;hf.side=side;hf.life=.75;if(++n>=2)break;}
   spawnBurst(e.x,e.y,e.b>=3?SUN:PAPER,1+Math.min(e.b,6)*.14);spawnDots(e.x,e.y,col,opts.reduced?2:5,38);spawnPop(e.x,e.y-6,e.a,e.b>=3);if(e.b>=4&&!opts.reduced)shake=Math.max(shake,.1);}
  else if(e.type==='puff'){spawnBurst(e.x,e.y,PAPER,.7,.16);if(!opts.reduced)spawnDots(e.x,e.y,INK,2,24);}
  else if(e.type==='foul'){spawnBurst(e.x,e.y,RED,2.4,.34);spawnDots(e.x,e.y,RED,opts.reduced?3:10,60);say(e.a?'WHISTLE!':'WRONG KIT!',RED,50,s.h*.4,.9);if(!opts.reduced){shake=.28;flash=.14;}}
  else if(e.type==='call'){say(callFor(e.a),e.a>=5?ORANGE:e.a>=3?RED:TEAL,e.x,Math.max(s.h*.22,e.y-14),.5+Math.min(e.a,6)*.08,e.a<=2?.62:e.a===3?.8:1);if(e.b>0)spawnPop(e.x,e.y-16,e.b,true);}
  else if(e.type==='switch'){kit.team=e.a;kit.title='SWITCH!';kit.life=KR.beat;kit.max=KR.beat;}
  else if(e.type==='ready'){kit.team=e.a;kit.title='YOUR KIT';kit.life=KR.readyBeat;kit.max=KR.readyBeat;}
  else if(e.type==='sub')say('SUPER SUB!',TEAL,50,s.h*.24,.9,.72);
  else if(e.type==='special'){say(e.a===KIND.golden?'GOLDEN BALL!':e.a===KIND.stopwatch?'SLOW-MO!':'CAPTAIN x2!',e.a===KIND.stopwatch?TEAL:ORANGE,50,s.h*.24,.9,.72);spawnBurst(e.x,e.y,SUN,2.2,.3);}
  else if(e.type==='miss'){spawnDots(e.x,s.h-3,INK,2,16);}
 }
 function trailStart(p:number){trails[p&3].n=0;}
 function trailPoint(p:number,x:number,y:number,now:number){const t=trails[p&3];t.head=(t.head+1)%TRAIL;t.x[t.head]=x;t.y[t.head]=y;t.t[t.head]=now;if(t.n<TRAIL)t.n++;}
 function drawSprite(i:number,x:number,y:number,rot:number,scale=1){const c=Math.cos(rot)*scale,sn=Math.sin(rot)*scale;ctx.setTransform(c,sn,-sn,c,x*u,y*u);ctx.drawImage(atlas,(i%cols)*S,Math.floor(i/cols)*S,S,S,-S/2,-S/2,S,S);}
 function lettering(text:string,x:number,y:number,font:string,fill:string,stroke:number){ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.fillStyle=INK;ctx.fillText(text,x+stroke*.9,y+stroke*.9);ctx.lineWidth=stroke;ctx.strokeStyle=INK;ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);}
 /** Draws one frame of the round. `dt` is real seconds since the last frame, `now` is performance.now(). */
 function render(s:KitRushState,dt:number,now:number){
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  let ox=0,oy=0;if(shake>0){shake-=dt;ox=(rnd()-.5)*u*2.2*Math.min(1,shake*5);oy=(rnd()-.5)*u*2.2*Math.min(1,shake*5);}
  const slow=s.slow>0?KR.slowScale:1;
  // effect frames: flat bands at the page edge (no gradient, no alpha fade)
  if(s.slow>0||s.armband>0||s.frenzy>0){const col=s.frenzy>0?SUN:s.slow>0?TEAL:ORANGE,left=s.frenzy>0?s.frenzy/KR.frenzy:s.slow>0?s.slow/KR.slow:s.armband/KR.armband,bw=u*1.6;
   ctx.fillStyle=col;ctx.fillRect(0,0,bw,H);ctx.fillRect(W-bw,0,bw,H);ctx.fillStyle=INK;ctx.fillRect(u*8,H-u*5.4,W-u*16,u*3);ctx.fillStyle=col;ctx.fillRect(u*8.6,H-u*4.8,(W-u*17.2)*Math.max(0,left),u*1.8);}
  // kit in the air
  const items=s.items;for(let i=0;i<items.length;i++){const it=items[i];if(!it.active)continue;drawSprite(sprite(it.kind,it.team),it.x+ox/u,it.y+oy/u,it.rot);}
  // halves fly apart
  for(const hf of halves){if(!hf.on)continue;hf.life-=dt;if(hf.life<=0||hf.y>s.h+12){hf.on=false;continue;}hf.vy+=150*dt*slow;hf.x+=hf.vx*dt*slow;hf.y+=hf.vy*dt*slow;hf.rot+=hf.vr*dt*slow;
   const a=hf.cut+hf.rot,c=Math.cos(a),sn=Math.sin(a);ctx.setTransform(c,sn,-sn,c,hf.x*u,hf.y*u);ctx.save();ctx.beginPath();ctx.rect(-S,hf.side>0?0:-S,S*2,S);ctx.clip();ctx.rotate(-hf.cut);ctx.drawImage(atlas,(hf.spr%cols)*S,Math.floor(hf.spr/cols)*S,S,S,-S/2,-S/2,S,S);ctx.restore();}
  ctx.setTransform(1,0,0,1,ox,oy);
  // star bursts: pop to full size, then gone (print, not a fade)
  for(const b of bursts){if(!b.on)continue;b.life-=dt;if(b.life<=0){b.on=false;continue;}const k=1-b.life/b.max,r=KR.r*u*b.size*(.7+k*1.1);star(ctx,b.x*u,b.y*u,r*1.5,r*.8,9,b.rot);ctx.fillStyle=b.color;ctx.fill();ctx.lineWidth=u*.7;ctx.strokeStyle=INK;ctx.stroke();}
  for(const d of dots){if(!d.on)continue;d.life-=dt;if(d.life<=0){d.on=false;continue;}d.vy+=120*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(d.x*u,d.y*u,d.r*u,0,6.283);ctx.fill();}
  // the slash: tapered ink with a paper core, straight from the pointer samples
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const t of trails){if(t.n<2)continue;for(let pass=0;pass<2;pass++){ctx.strokeStyle=pass?PAPER:INK;let px=0,py=0,has=false;
    for(let k=t.n-1;k>=0;k--){const i=(t.head-k+TRAIL*2)%TRAIL,age=now-t.t[i];if(age>TRAIL_MS){has=false;continue;}const x=t.x[i]*u,y=t.y[i]*u;
     if(has){const w=(1-age/TRAIL_MS)*(pass?1.5:3.6)*u;if(w>.3){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}}px=x;py=y;has=true;}}}
  // numerals
  for(const p of pops){if(!p.on)continue;p.life-=dt;if(p.life<=0){p.on=false;continue;}p.y-=dt*(opts.reduced?4:14);lettering(p.text,p.x*u,p.y*u,p.big?fontPopBig:fontPop,p.big?SUN:PAPER,u*(p.big?1.5:1.1));}
  if(flash>0){flash-=dt;ctx.fillStyle=PAPER;ctx.fillRect(-ox,-oy,W,u*2.4);ctx.fillRect(-ox,H-u*2.4-oy,W,u*2.4);}
  // the call: a tilted starburst word panel
  if(call.life>0){call.life-=dt;const k=Math.min(1,(call.max-call.life)/.09),sc=opts.reduced?1:.6+.4*k+(k>=1?0:.12),x=call.x*u,y=call.y*u;const fit=Math.min(1,W*.8/call.w)*call.size,tw=call.w*fit;
   ctx.setTransform(sc,call.tilt*sc,-call.tilt*sc,sc,x+ox,y+oy);ctx.save();ctx.scale(1,.46);star(ctx,u*1.2,u*2.6,tw*.72,tw*.56,13,.12);ctx.fillStyle=INK;ctx.fill();star(ctx,0,0,tw*.72,tw*.56,13,.12);ctx.fillStyle=call.color;ctx.fill();ctx.lineWidth=u*1.3;ctx.strokeStyle=INK;ctx.stroke();ctx.restore();
   ctx.scale(fit,fit);lettering(call.text,0,0,fontCall,call.color===RED?SUN:PAPER,u*1.7/Math.max(.62,fit));ctx.setTransform(1,0,0,1,ox,oy);}
  // the kit card: your kit at kick-off and at every switch (the game holds its breath for the beat)
  if(kit.life>0){kit.life-=dt;const k=Math.min(1,(kit.max-kit.life)/.1),sc=opts.reduced?1:.7+.3*k,t=TEAMS[kit.team],cx=W/2,cy=s.h*u*.42,bw=u*62,bh=u*50;
   ctx.setTransform(sc,-.035*sc,.035*sc,sc,cx,cy);ctx.fillStyle=INK;ctx.fillRect(-bw/2+u*1.6,-bh/2+u*1.6,bw,bh);ctx.fillStyle=PAPER;ctx.fillRect(-bw/2,-bh/2,bw,bh);ctx.fillStyle=t.color;ctx.fillRect(-bw/2,-bh/2,bw,u*11);
   ctx.lineWidth=u*.9;ctx.strokeStyle=INK;ctx.strokeRect(-bw/2,-bh/2,bw,bh);ctx.beginPath();ctx.moveTo(-bw/2,-bh/2+u*11);ctx.lineTo(bw/2,-bh/2+u*11);ctx.stroke();
   ctx.font=fontCap;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=INK;ctx.fillText(kit.title==='SWITCH!'?'SWITCH! NEW KIT':'YOUR KIT',0,-bh/2+u*5.8);
   ctx.save();ctx.translate(0,-u*1);ctx.scale(KR.r*u*1.55,KR.r*u*1.55);paintKit(ctx,KIND.shirt,kit.team);ctx.restore();
   lettering(t.name.toUpperCase(),0,bh/2-u*8.5,fontCall,t.color,u*1.6);ctx.setTransform(1,0,0,1,0,0);}
 }
 function reset(){for(const a of [halves,bursts,dots,pops])for(const o of a)o.on=false;for(const t of trails)t.n=0;call.life=0;kit.life=0;shake=0;flash=0;}
 function clear(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);}
 /** One still frame for the start card's kit legend etc. is not needed: menus sit on the static scene. */
 return {resize,render,onEvent,trailStart,trailPoint,reset,clear,get unit(){return u/dpr;},get pixels(){return W*H;}};
}
