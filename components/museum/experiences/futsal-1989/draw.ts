import {FIELDS,rng,type Mode,type Player,type Sim} from './sim';
/**
 * Canvas 2D painting for "Count the touches". Everything is drawn in metres through one DOMMatrix (pan, scale and, on a
 * portrait screen, a quarter turn so the long side of the field runs up the phone). Field markings follow the futsal Laws
 * (Law 1) and the IFAB Laws (Law 1) closely enough for a museum model; the sizes shown are the ones the sim plays on.
 *
 * Polish pass (Oct 5 2026): one light, from the top-left of the screen, for every shadow and highlight; the maple boards and
 * the mown grass are textures painted once (cached canvases, never per frame); players are little top-down figures (shadow,
 * running boots, lit shoulders, head) that turn to face where they run; the ball rolls, casts a shadow and leaves a short
 * trail when kicked; every touch leaves a glowing gold mark and a ring burst.
 */
export type View={m:DOMMatrix;s:number;rot:boolean};
const TAU=Math.PI*2;
/** Fit a world rectangle (centred on the field's centre) into a screen box. */
export function fitView(mode:Mode,box:{x:number;y:number;w:number;h:number},extent?:{l:number;w:number}):View{
 const f=FIELDS[mode],l=(extent?.l??f.L)+3,w=(extent?.w??f.W)+3,rot=box.h>box.w*1.05;
 const s=rot?Math.min(box.w/w,box.h/l):Math.min(box.w/l,box.h/w);
 const m=new DOMMatrix().translate(box.x+box.w/2,box.y+box.h/2).rotate(rot?-90:0).scale(s).translate(-f.L/2,-f.W/2);
 return {m,s,rot};
}
/** A screen-space offset (px) as a world vector, through the view's quarter turn. Light comes from the screen's top-left. */
function screenVec(v:View,sx:number,sy:number){const k=1/v.s;return v.rot?{x:-sy*k,y:sx*k}:{x:sx*k,y:sy*k};}

// ── Cached textures (painted once per page, then scaled) ─────────────────────────────────────────────────────────────────
let woodTex:HTMLCanvasElement|null=null,grassTex:HTMLCanvasElement|null=null;
const WOOD_K=32,GRASS_K=8;// texture pixels per metre
/** Maple boards: staggered planks, each a slightly different tone, with grain and seams. */
function wood(){if(woodTex)return woodTex;const f=FIELDS.court,c=document.createElement('canvas');c.width=f.L*WOOD_K;c.height=f.W*WOOD_K;
 const g=c.getContext('2d')!,r=rng(1930),rowH=.5*WOOD_K;
 for(let y=0;y<c.height;y+=rowH){let x=-r()*4*WOOD_K;
  while(x<c.width){const len=(3.2+r()*5)*WOOD_K,h=29+r()*4,sat=52+r()*8,l=54+r()*6;
   g.fillStyle=`hsl(${h.toFixed(1)},${sat.toFixed(1)}%,${l.toFixed(1)}%)`;g.fillRect(x,y,len,rowH);
   for(let k=0;k<4;k++){g.strokeStyle=`rgba(110,58,18,${(.05+r()*.09).toFixed(3)})`;g.lineWidth=.5+r()*.9;const gy=y+1+r()*(rowH-2);
    g.beginPath();g.moveTo(x,gy);g.bezierCurveTo(x+len*.3,gy+(r()-.5)*3,x+len*.7,gy+(r()-.5)*3,x+len,gy+(r()-.5)*2);g.stroke();}
   if(r()<.18){g.fillStyle='rgba(120,62,20,.1)';g.beginPath();g.ellipse(x+len*(.2+r()*.6),y+rowH/2,3+r()*4,1.5+r(),0,0,TAU);g.fill();}
   g.fillStyle='rgba(70,35,10,.3)';g.fillRect(x+len-1,y,1,rowH);x+=len;}
  g.fillStyle='rgba(70,35,10,.22)';g.fillRect(0,y,c.width,1);}
 // Lacquer: a long soft sheen across the boards.
 const sh=g.createLinearGradient(0,0,c.width,c.height);sh.addColorStop(0,'rgba(255,240,215,.16)');sh.addColorStop(.45,'rgba(255,240,215,0)');sh.addColorStop(1,'rgba(60,25,5,.12)');
 g.fillStyle=sh;g.fillRect(0,0,c.width,c.height);
 return woodTex=c;}
/** Mown grass: 16 stripes, fine blade noise, worn patches in the goalmouths and the centre. */
function grass(){if(grassTex)return grassTex;const f=FIELDS.pitch,c=document.createElement('canvas');c.width=f.L*GRASS_K;c.height=f.W*GRASS_K;
 const g=c.getContext('2d')!,r=rng(1989),n=16,sw=c.width/n;
 for(let i=0;i<n;i++){g.fillStyle=i%2?'#2c7a3b':'#358a46';g.fillRect(Math.floor(i*sw),0,Math.ceil(sw)+1,c.height);}
 for(const [x,y,rad] of [[.5,.5,.14],[.05,.5,.1],[.95,.5,.1]] as const){const gr=g.createRadialGradient(x*c.width,y*c.height,0,x*c.width,y*c.height,rad*c.width);
  gr.addColorStop(0,'rgba(150,130,70,.22)');gr.addColorStop(1,'rgba(150,130,70,0)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);}
 const img=g.getImageData(0,0,c.width,c.height),d=img.data;
 for(let i=0;i<d.length;i+=4){const k=(r()-.5)*22,b=r()<.04?14:0;d[i]+=k*.6+b;d[i+1]+=k+b;d[i+2]+=k*.5;}
 g.putImageData(img,0,0);return grassTex=c;}

const LINE='rgba(255,255,255,.94)';
export type FieldOpts={ghostCourt?:boolean;ghostLabel?:boolean;/** pitch only: the maple court painted over its gold box (the zoom-out) */courtArt?:number};
export function drawField(g:CanvasRenderingContext2D,mode:Mode,v:View,opts:FieldOpts={}){
 const f=FIELDS[mode],px=1/v.s;g.save();g.imageSmoothingEnabled=true;
 if(mode==='court')drawCourt(g,px,true);
 else{
  // Dark run-off grass, then the textured pitch.
  g.fillStyle='#174a24';g.fillRect(-3,-3,f.L+6,f.W+6);g.drawImage(grass(),0,0,f.L,f.W);
  g.strokeStyle=LINE;g.lineWidth=Math.max(.12,1.4*px);g.strokeRect(0,0,f.L,f.W);
  g.beginPath();g.moveTo(f.L/2,0);g.lineTo(f.L/2,f.W);g.stroke();g.beginPath();g.arc(f.L/2,f.W/2,9.15,0,TAU);g.stroke();
  g.fillStyle=LINE;g.beginPath();g.arc(f.L/2,f.W/2,Math.max(.25,2*px),0,TAU);g.fill();
  for(const end of [0,1]){const x=end?f.L:0,d=end?-1:1;
   g.strokeRect(Math.min(x,x+d*16.5),f.W/2-20.16,16.5,40.32);g.strokeRect(Math.min(x,x+d*5.5),f.W/2-9.16,5.5,18.32);
   g.beginPath();const a=Math.acos(5.5/9.15);g.arc(x+d*11,f.W/2,9.15,end?Math.PI-a:-a,end?Math.PI+a:a);g.stroke();
   g.beginPath();g.arc(x+d*11,f.W/2,Math.max(.25,2*px),0,TAU);g.fill();
   for(const y of [0,f.W]){const a0=end?(y?Math.PI:Math.PI/2):(y?-Math.PI/2:0);g.beginPath();g.arc(x,y,1,a0,a0+Math.PI/2);g.stroke();flag(g,x,y,d,px);}
   goal(g,x,f.W/2,f.goalW,2,d,px);}
  if(opts.courtArt&&opts.courtArt>0){const c=FIELDS.court;g.save();g.globalAlpha=opts.courtArt;g.translate(f.L/2-c.L/2,f.W/2-c.W/2);drawCourt(g,px,false);g.restore();}
  if(opts.ghostCourt){// The futsal court at the same scale, centred: how much smaller the space is.
   const c=FIELDS.court,x0=f.L/2-c.L/2,y0=f.W/2-c.W/2;g.fillStyle='rgba(255,201,40,.14)';g.fillRect(x0,y0,c.L,c.W);
   g.setLineDash([Math.max(.6,7*px),Math.max(.45,5*px)]);g.strokeStyle='#ffc928';g.lineWidth=Math.max(.2,2.2*px);g.strokeRect(x0,y0,c.L,c.W);g.setLineDash([]);
   if(opts.ghostLabel)ghostLabel(g,v,x0,y0,c.L,c.W);}
 }
 g.restore();
}
/** The futsal court: a blue arena run-off, maple boards, painted penalty areas, lines, marks and goals. */
function drawCourt(g:CanvasRenderingContext2D,px:number,runOff:boolean){const f=FIELDS.court;
 if(runOff){g.fillStyle='#1b3557';g.fillRect(-2.2,-2.2,f.L+4.4,f.W+4.4);g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=Math.max(.05,px);g.strokeRect(-2.2,-2.2,f.L+4.4,f.W+4.4);}
 g.drawImage(wood(),0,0,f.L,f.W);
 // Painted areas (many arenas tint the penalty areas and the centre circle).
 g.fillStyle='rgba(30,70,140,.86)';
 for(const end of [0,1]){const x=end?f.L:0,d=end?-1:1;g.save();g.translate(x,f.W/2);g.scale(d,1);penaltyArea(g);g.fill();g.restore();}
 g.beginPath();g.arc(f.L/2,f.W/2,3,0,TAU);g.fillStyle='rgba(30,70,140,.86)';g.fill();
 g.strokeStyle=LINE;g.lineWidth=Math.max(.08,1.5*px);g.strokeRect(0,0,f.L,f.W);
 g.beginPath();g.moveTo(f.L/2,0);g.lineTo(f.L/2,f.W);g.stroke();g.beginPath();g.arc(f.L/2,f.W/2,3,0,TAU);g.stroke();
 g.fillStyle=LINE;g.beginPath();g.arc(f.L/2,f.W/2,Math.max(.1,2*px),0,TAU);g.fill();
 for(const end of [0,1]){const x=end?f.L:0,d=end?-1:1;
  g.save();g.translate(x,f.W/2);g.scale(d,1);penaltyArea(g);g.stroke();g.restore();
  for(const pm of [6,10]){g.beginPath();g.arc(x+d*pm,f.W/2,Math.max(.1,2*px),0,TAU);g.fill();}
  for(const y of [0,f.W]){g.beginPath();g.arc(x,y,.25,0,TAU);g.stroke();}
  goal(g,x,f.W/2,f.goalW,1,d,px);}
}
/** Futsal penalty area (Law 1): two 6 m quarter circles round the posts, joined by a 3.16 m line. */
function penaltyArea(g:CanvasRenderingContext2D){g.beginPath();g.moveTo(0,-7.5);g.arc(0,-1.5,6,-Math.PI/2,0);g.lineTo(6,1.5);g.arc(0,1.5,6,0,Math.PI/2);g.closePath();}
function goal(g:CanvasRenderingContext2D,x:number,y:number,w:number,depth:number,d:number,px:number){
 g.save();const x0=Math.min(x,x-d*depth);g.fillStyle='rgba(10,14,20,.35)';g.fillRect(x0,y-w/2,depth,w);
 // The net: a fine mesh.
 const step=Math.max(.22,4*px);g.strokeStyle='rgba(255,255,255,.32)';g.lineWidth=Math.max(.02,.7*px);g.beginPath();
 for(let yy=y-w/2+step;yy<y+w/2;yy+=step){g.moveTo(x0,yy);g.lineTo(x0+depth,yy);}for(let xx=x0+step;xx<x0+depth;xx+=step){g.moveTo(xx,y-w/2);g.lineTo(xx,y+w/2);}g.stroke();
 g.strokeStyle='#fff';g.lineWidth=Math.max(.1,2.2*px);g.beginPath();g.moveTo(x,y-w/2);g.lineTo(x-d*depth,y-w/2);g.lineTo(x-d*depth,y+w/2);g.lineTo(x,y+w/2);g.stroke();
 g.fillStyle='#fff';for(const py of [y-w/2,y+w/2]){g.beginPath();g.arc(x,py,Math.max(.1,2.6*px),0,TAU);g.fill();}g.restore();}
function flag(g:CanvasRenderingContext2D,x:number,y:number,d:number,px:number){const s=Math.max(.6,7*px),dy=y?-1:1;g.save();g.fillStyle='#ffd23f';g.beginPath();g.moveTo(x,y);g.lineTo(x+d*s,y+dy*s*.35);g.lineTo(x,y+dy*s*.7);g.closePath();g.fill();g.restore();}
/** "Futsal court · same scale", in screen space just outside the gold box's top-left corner. */
function ghostLabel(g:CanvasRenderingContext2D,v:View,x0:number,y0:number,L:number,W:number){
 const T=g.getTransform(),dpr=Math.hypot(T.a,T.b)/v.s,pts=[[x0,y0],[x0+L,y0],[x0,y0+W],[x0+L,y0+W]].map(([x,y])=>T.transformPoint(new DOMPoint(x,y)));
 const left=Math.min(...pts.map(p=>p.x)),top=Math.min(...pts.map(p=>p.y));g.save();g.setTransform(dpr,0,0,dpr,0,0);
 const fs=12,text='FUTSAL COURT · SAME SCALE';g.font=`800 ${fs}px system-ui,-apple-system,"Segoe UI",sans-serif`;const tw=g.measureText(text).width;
 const x=left/dpr,y=top/dpr-8;g.fillStyle='rgba(18,13,6,.82)';roundRect(g,x,y-fs-6,tw+14,fs+10,6);g.fill();g.fillStyle='#ffc928';g.textBaseline='alphabetic';g.fillText(text,x+7,y-1);g.restore();}
function roundRect(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
/** Arena light in screen space: a warm floodlight pool from the top-left and a soft vignette. */
export function drawLight(g:CanvasRenderingContext2D,w:number,h:number){
 const l=g.createRadialGradient(w*.32,h*.22,0,w*.32,h*.22,Math.max(w,h)*.75);l.addColorStop(0,'rgba(255,236,200,.10)');l.addColorStop(1,'rgba(255,236,200,0)');g.fillStyle=l;g.fillRect(0,0,w,h);
 const v=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.hypot(w,h)*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=v;g.fillRect(0,0,w,h);}

// ── Players, ball and marks ─────────────────────────────────────────────────────────────────────────────────────────────
type Kit={main:string;light:string;dark:string};
const KITS:Record<string,Kit>={you:{main:'#ffc928',light:'#fff1b0',dark:'#b98100'},home:{main:'#2f6bff',light:'#8eb0ff',dark:'#1a3c9e'},homeGk:{main:'#20c3b0',light:'#8af0e2',dark:'#0f7b6f'},
 away:{main:'#ef4b3c',light:'#ff9d90',dark:'#9d2216'},awayGk:{main:'#9b5cf0',light:'#d2b4ff',dark:'#5a2aa6'}};
export const COLORS={you:KITS.you.main,home:KITS.home.main,homeGk:KITS.homeGk.main,away:KITS.away.main,awayGk:KITS.awayGk.main,dot:'rgba(255,201,40,.85)'};
const SKIN=['#c68b5e','#8d5a3b','#e3b48f','#5e3a24','#d9a07a','#a86f4a'];
const HAIR=['#2a1a10','#3b2412','#121010','#6b4423','#1d1410','#8a5a2b'];
type Pose={a:number;ph:number;x:number;y:number};
const poses=new WeakMap<Player,Pose>();
const wrap=(a:number)=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
/** Turn each player toward where they run (or, standing, toward the ball) and advance their stride by distance run. */
function pose(p:Player,bx:number,by:number):Pose{let o=poses.get(p);if(!o){o={a:p.team?Math.PI:0,ph:0,x:p.x,y:p.y};poses.set(p,o);}
 const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy);
 if(d>.004){o.a+=wrap(Math.atan2(dy,dx)-o.a)*Math.min(1,.3+d);o.ph+=d*2.6;}
 else if(Math.hypot(bx-p.x,by-p.y)>.3)o.a+=wrap(Math.atan2(by-p.y,bx-p.x)-o.a)*.12;
 if(d>3){o.ph=0;}o.x=p.x;o.y=p.y;return o;}
export type PlayerOpts={/** sim time, for the gold ring pulse; omit for a still frame */t?:number;passHint?:boolean};
export function drawPlayers(g:CanvasRenderingContext2D,s:Sim,v:View,o:PlayerOpts={}){
 const R=Math.max(.5,7.5/v.s),px=1/v.s,sh=screenVec(v,1.6,2.4),lt=screenVec(v,-1,-1),b=s.ball;
 const you=s.players[s.youIdx];
 // Your floor ring (and a slow pulse while the round runs).
 g.save();g.strokeStyle='rgba(255,201,40,.75)';g.lineWidth=2*px;g.beginPath();g.arc(you.x,you.y,R*1.9,0,TAU);g.stroke();
 if(o.t!=null){const k=(o.t%1.4)/1.4;g.globalAlpha=(1-k)*.6;g.beginPath();g.arc(you.x,you.y,R*(1.9+k*1.6),0,TAU);g.stroke();}g.restore();
 // When you have the ball, your team-mates glow: tap one to pass.
 if(o.passHint&&b.owner===s.youIdx){const k=o.t!=null?.55+.35*Math.sin(o.t*7):.8;g.save();g.strokeStyle=`rgba(120,160,255,${k.toFixed(3)})`;g.lineWidth=2.2*px;g.setLineDash([3*px,2.5*px]);
  for(const p of s.players)if(p.team===0&&!p.you){g.beginPath();g.arc(p.x,p.y,R*1.8,0,TAU);g.stroke();}g.restore();}
 s.players.forEach((p,i)=>{if(!p.you)figure(g,p,i,R,px,sh,lt,p.team?(p.gk?KITS.awayGk:KITS.away):(p.gk?KITS.homeGk:KITS.home),b);});
 drawBall(g,s,v,sh);
 figure(g,you,s.youIdx,R*1.12,px,sh,lt,KITS.you,b);
 // A small chevron in front of you shows which way you face.
 const yo=poses.get(you);if(yo){g.save();g.translate(you.x,you.y);g.rotate(yo.a);g.fillStyle='#ffc928';g.beginPath();g.moveTo(R*2.55,0);g.lineTo(R*2.05,-R*.42);g.lineTo(R*2.18,0);g.lineTo(R*2.05,R*.42);g.closePath();g.fill();g.restore();}
}
function figure(g:CanvasRenderingContext2D,p:Player,i:number,R:number,px:number,sh:{x:number;y:number},lt:{x:number;y:number},kit:Kit,b:{x:number;y:number}){
 const o=pose(p,b.x,b.y),moving=Math.hypot(p.vx,p.vy)>.3;g.save();g.translate(p.x,p.y);
 g.fillStyle='rgba(10,5,0,.34)';g.beginPath();g.ellipse(sh.x*R*1.1,sh.y*R*1.1,R*1.02,R*1.02,0,0,TAU);g.fill();
 g.rotate(o.a);const ca=Math.cos(-o.a),sa=Math.sin(-o.a),lx=lt.x*ca-lt.y*sa,ly=lt.x*sa+lt.y*ca,ll=Math.hypot(lx,ly)||1;
 // Boots swing with the stride.
 const sw=moving?Math.sin(o.ph)*R*.62:0;g.fillStyle='#16110c';
 g.beginPath();g.ellipse(sw,-R*.4,R*.34,R*.21,0,0,TAU);g.fill();g.beginPath();g.ellipse(-sw,R*.4,R*.34,R*.21,0,0,TAU);g.fill();
 // Arms swing against the boots.
 const as=moving?-Math.sin(o.ph)*R*.4:0;g.fillStyle=SKIN[i%SKIN.length];
 g.beginPath();g.arc(as,-R*.98,R*.22,0,TAU);g.fill();g.beginPath();g.arc(-as,R*.98,R*.22,0,TAU);g.fill();
 // Shoulders, lit from the light side.
 const gr=g.createRadialGradient(lx/ll*R*.55,ly/ll*R*.55,R*.05,0,0,R*1.15);gr.addColorStop(0,kit.light);gr.addColorStop(.45,kit.main);gr.addColorStop(1,kit.dark);
 g.fillStyle=gr;g.beginPath();g.ellipse(0,0,R*.6,R,0,0,TAU);g.fill();g.lineWidth=1.1*px;g.strokeStyle='rgba(0,0,0,.5)';g.stroke();
 // Head.
 g.fillStyle=HAIR[i%HAIR.length];g.beginPath();g.arc(R*.06,0,R*.45,0,TAU);g.fill();
 g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.arc(R*.06+lx/ll*R*.17,ly/ll*R*.17,R*.18,0,TAU);g.fill();
 g.restore();}
type BallState={x:number;y:number;rot:number;trail:{x:number;y:number}[]};
const balls=new WeakMap<Sim,BallState>();
function drawBall(g:CanvasRenderingContext2D,s:Sim,v:View,sh:{x:number;y:number}){
 const b=s.ball,br=Math.max(.3,5/v.s),px=1/v.s;let st=balls.get(s);if(!st){st={x:b.x,y:b.y,rot:0,trail:[]};balls.set(s,st);}
 const d=Math.hypot(b.x-st.x,b.y-st.y);if(d<4)st.rot+=d/br*.5;st.x=b.x;st.y=b.y;
 const fast=b.owner<0&&Math.hypot(b.vx,b.vy)>3;if(fast){st.trail.push({x:b.x,y:b.y});if(st.trail.length>9)st.trail.shift();}else if(st.trail.length)st.trail.shift();
 if(st.trail.length>1){g.save();g.lineCap='round';for(let k=1;k<st.trail.length;k++){const a=k/st.trail.length;g.strokeStyle=`rgba(255,250,235,${(a*.45).toFixed(3)})`;g.lineWidth=br*1.6*a;
  g.beginPath();g.moveTo(st.trail[k-1].x,st.trail[k-1].y);g.lineTo(st.trail[k].x,st.trail[k].y);g.stroke();}g.restore();}
 g.save();g.translate(b.x,b.y);g.fillStyle='rgba(10,5,0,.38)';g.beginPath();g.ellipse(sh.x*br,sh.y*br,br,br,0,0,TAU);g.fill();
 const gr=g.createRadialGradient(-br*.35,-br*.35,br*.1,0,0,br);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#c9ccd2');
 g.fillStyle=gr;g.beginPath();g.arc(0,0,br,0,TAU);g.fill();
 g.save();g.beginPath();g.arc(0,0,br,0,TAU);g.clip();g.rotate(st.rot);g.fillStyle='#1b1d22';const ox=Math.sin(st.rot*1.7)*br*.25;
 pent(g,ox,0,br*.36);for(let k=0;k<5;k++){const a=k/5*TAU;pent(g,ox+Math.cos(a)*br*.95,Math.sin(a)*br*.95,br*.3);}g.restore();
 g.lineWidth=1*px;g.strokeStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(0,0,br,0,TAU);g.stroke();g.restore();}
function pent(g:CanvasRenderingContext2D,x:number,y:number,r:number){g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k/5*TAU;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();g.fill();}
/** Touch marks: one glowing gold mark where each of your touches happened. */
export function drawDots(g:CanvasRenderingContext2D,dots:readonly {x:number;y:number}[],v:View){
 const r=Math.max(.4,3.4/v.s);g.save();g.fillStyle='rgba(255,201,40,.2)';for(const d of dots){g.beginPath();g.arc(d.x,d.y,r*2,0,TAU);g.fill();}
 g.fillStyle=COLORS.dot;for(const d of dots){g.beginPath();g.arc(d.x,d.y,r,0,TAU);g.fill();}
 g.fillStyle='rgba(255,250,220,.9)';for(const d of dots){g.beginPath();g.arc(d.x,d.y,r*.4,0,TAU);g.fill();}g.restore();}
/** A ring that bursts out of each new touch (age 0..1). */
export function drawBurst(g:CanvasRenderingContext2D,x:number,y:number,age:number,v:View){const e=1-Math.pow(1-age,3),px=1/v.s;
 g.save();g.globalAlpha=1-age;g.strokeStyle='#ffd65a';g.lineWidth=(3-2*age)*px;g.beginPath();g.arc(x,y,(6+e*26)*px,0,TAU);g.stroke();g.restore();}
/** Where you are running to: a small gold ring and a dotted run line. */
export function drawTarget(g:CanvasRenderingContext2D,from:{x:number;y:number},to:{x:number;y:number},v:View,alpha:number){const px=1/v.s;
 g.save();g.globalAlpha=alpha;g.strokeStyle='rgba(255,201,40,.9)';g.lineWidth=1.6*px;g.setLineDash([2*px,4*px]);g.beginPath();g.moveTo(from.x,from.y);g.lineTo(to.x,to.y);g.stroke();g.setLineDash([]);
 g.lineWidth=2*px;g.beginPath();g.arc(to.x,to.y,7*px,0,TAU);g.stroke();g.fillStyle='#ffc928';g.beginPath();g.arc(to.x,to.y,2*px,0,TAU);g.fill();g.restore();}
/** Your name tag, in screen space under your figure. */
export function drawYouTag(g:CanvasRenderingContext2D,s:Sim,v:View){const y=s.players[s.youIdx],p=v.m.transformPoint(new DOMPoint(y.x,y.y)),R=Math.max(.5,7.5/v.s)*1.12*v.s;
 g.save();g.font='800 11px system-ui,-apple-system,"Segoe UI",sans-serif';const tw=g.measureText('YOU').width,w=tw+12,h=17,x=p.x-w/2,yy=p.y+R*1.9+6;
 g.fillStyle='rgba(20,14,6,.88)';roundRect(g,x,yy,w,h,8.5);g.fill();g.fillStyle='#ffc928';g.textAlign='center';g.textBaseline='middle';g.fillText('YOU',p.x,yy+h/2+.5);g.restore();}
