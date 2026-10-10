import {FIELDS,rng,type Mode,type Player,type Sim} from './sim';
/**
 * Canvas 2D painting for "Count the touches", cut as a cordel woodcut (Oct 9 2026 restyle; the Oct 5 lit-arena look is gone).
 * Everything is drawn in metres through one DOMMatrix (pan, scale and, on a portrait screen, a quarter turn so the long side of
 * the field runs up the phone). Field markings follow the futsal Laws (Law 1) and the IFAB Laws (Law 1) closely enough for a
 * museum model; the sizes shown are the ones the sim plays on.
 *
 * The woodcut grammar: the run-off is the black block with a border of cut teeth; the playing surface is paper (cream for the
 * court, green paper for the pitch) with faint grain left by the wood; lines are printed black. Team-mates are solid black
 * beans, opponents are cut-out white beans with a black outline, you are printed in the second colour (red). Touches leave red
 * cut stars. The grain and teeth are painted ONCE into cached canvases; frames only blit them and draw the figures.
 */
export type View={m:DOMMatrix;s:number;rot:boolean};
const TAU=Math.PI*2;
export const INK='#17120e',RED='#c3301c',CREAM='#f6ecd2',GREEN='#a9d08e';
/** Fit a world rectangle (centred on the field's centre) into a screen box. */
export function fitView(mode:Mode,box:{x:number;y:number;w:number;h:number},extent?:{l:number;w:number}):View{
 const f=FIELDS[mode],l=(extent?.l??f.L)+3,w=(extent?.w??f.W)+3,rot=box.h>box.w*1.05;
 const s=rot?Math.min(box.w/w,box.h/l):Math.min(box.w/l,box.h/w);
 const m=new DOMMatrix().translate(box.x+box.w/2,box.y+box.h/2).rotate(rot?-90:0).scale(s).translate(-f.L/2,-f.W/2);
 return {m,s,rot};
}

// ── Cached grain (painted once per page, then scaled) ───────────────────────────────────────────────────────────────────
let courtTex:HTMLCanvasElement|null=null,pitchTex:HTMLCanvasElement|null=null;
const K=12;// texture pixels per metre
/** Paper printed from a planed block: the base colour plus long, faint, wavy grain streaks and a few dry-ink specks. */
function grain(mode:Mode){const f=FIELDS[mode],c=document.createElement('canvas');c.width=Math.round(f.L*K);c.height=Math.round(f.W*K);
 const g=c.getContext('2d')!,r=rng(mode==='court'?1930:1989);g.fillStyle=mode==='court'?CREAM:GREEN;g.fillRect(0,0,c.width,c.height);
 g.strokeStyle='rgba(23,18,14,.09)';g.lineCap='round';
 for(let y=2;y<c.height;y+=3+r()*5){g.lineWidth=.6+r()*1.1;g.beginPath();let x=-10;g.moveTo(x,y);
  while(x<c.width+10){const nx=x+30+r()*60;g.quadraticCurveTo(x+(nx-x)/2,y+(r()-.5)*4,nx,y+(r()-.5)*2);x=nx;}g.stroke();}
 g.fillStyle='rgba(23,18,14,.18)';for(let i=0;i<c.width*c.height/900;i++){g.beginPath();g.arc(r()*c.width,r()*c.height,.4+r()*.8,0,TAU);g.fill();}
 return c;}
const tex=(m:Mode)=>m==='court'?(courtTex??=grain('court')):(pitchTex??=grain('pitch'));

export type FieldOpts={ghostCourt?:boolean;ghostLabel?:boolean;/** pitch only: the cream court printed over its box (the zoom-out) */courtArt?:number};
export function drawField(g:CanvasRenderingContext2D,mode:Mode,v:View,opts:FieldOpts={}){
 const f=FIELDS[mode],px=1/v.s;g.save();g.imageSmoothingEnabled=true;
 // The black block around the field, with cut teeth on its inner edge.
 const pad=mode==='court'?2.2:3;g.fillStyle=INK;g.fillRect(-pad,-pad,f.L+pad*2,f.W+pad*2);
 teeth(g,-pad*.55,-pad*.55,f.L+pad*1.1,f.W+pad*1.1,Math.max(.5,9*px));
 g.drawImage(tex(mode),0,0,f.L,f.W);
 g.strokeStyle=INK;g.fillStyle=INK;g.lineWidth=Math.max(mode==='court'?.1:.2,2.4*px);g.lineJoin='round';
 if(mode==='court')courtLines(g,px);
 else{
  g.strokeRect(0,0,f.L,f.W);g.beginPath();g.moveTo(f.L/2,0);g.lineTo(f.L/2,f.W);g.stroke();g.beginPath();g.arc(f.L/2,f.W/2,9.15,0,TAU);g.stroke();
  dot(g,f.L/2,f.W/2,Math.max(.3,2.4*px));
  for(const end of [0,1]){const x=end?f.L:0,d=end?-1:1;
   g.strokeRect(Math.min(x,x+d*16.5),f.W/2-20.16,16.5,40.32);g.strokeRect(Math.min(x,x+d*5.5),f.W/2-9.16,5.5,18.32);
   g.beginPath();const a=Math.acos(5.5/9.15);g.arc(x+d*11,f.W/2,9.15,end?Math.PI-a:-a,end?Math.PI+a:a);g.stroke();dot(g,x+d*11,f.W/2,Math.max(.3,2.4*px));
   goal(g,x,f.W/2,f.goalW,2,d,px);}
  if(opts.courtArt&&opts.courtArt>0){const c=FIELDS.court;g.save();g.globalAlpha=opts.courtArt;g.translate(f.L/2-c.L/2,f.W/2-c.W/2);g.drawImage(tex('court'),0,0,c.L,c.W);g.strokeStyle=INK;g.lineWidth=Math.max(.1,2.4*px);courtLines(g,px);g.restore();}
  if(opts.ghostCourt){// The futsal court at the same scale, centred, printed in red: how much smaller the space is.
   const c=FIELDS.court,x0=f.L/2-c.L/2,y0=f.W/2-c.W/2;g.save();g.fillStyle='rgba(195,48,28,.12)';g.fillRect(x0,y0,c.L,c.W);
   g.setLineDash([Math.max(.8,9*px),Math.max(.5,5*px)]);g.strokeStyle=RED;g.lineWidth=Math.max(.3,3.4*px);g.strokeRect(x0,y0,c.L,c.W);g.restore();
   if(opts.ghostLabel)ghostLabel(g,v,x0,y0,c.L,c.W);}
 }
 g.restore();
}
function courtLines(g:CanvasRenderingContext2D,px:number){const f=FIELDS.court;
 g.strokeRect(0,0,f.L,f.W);g.beginPath();g.moveTo(f.L/2,0);g.lineTo(f.L/2,f.W);g.stroke();g.beginPath();g.arc(f.L/2,f.W/2,3,0,TAU);g.stroke();dot(g,f.L/2,f.W/2,Math.max(.12,2.4*px));
 for(const end of [0,1]){const x=end?f.L:0,d=end?-1:1;
  g.save();g.translate(x,f.W/2);g.scale(d,1);penaltyArea(g);g.stroke();g.restore();
  for(const pm of [6,10])dot(g,x+d*pm,f.W/2,Math.max(.12,2.4*px));
  goal(g,x,f.W/2,f.goalW,1,d,px);}
}
const dot=(g:CanvasRenderingContext2D,x:number,y:number,r:number)=>{g.beginPath();g.arc(x,y,r,0,TAU);g.fill();};
/** Futsal penalty area (Law 1): two 6 m quarter circles round the posts, joined by a 3.16 m line. */
function penaltyArea(g:CanvasRenderingContext2D){g.beginPath();g.moveTo(0,-7.5);g.arc(0,-1.5,6,-Math.PI/2,0);g.lineTo(6,1.5);g.arc(0,1.5,6,0,Math.PI/2);g.closePath();}
/** The goal: a cut-out frame in the black block, its net printed as crossed lines. */
function goal(g:CanvasRenderingContext2D,x:number,y:number,w:number,depth:number,d:number,px:number){
 g.save();const x0=Math.min(x,x-d*depth);g.fillStyle=CREAM;g.fillRect(x0,y-w/2,depth,w);
 const step=Math.max(.25,5*px);g.strokeStyle=INK;g.lineWidth=Math.max(.03,1*px);g.beginPath();
 for(let yy=y-w/2+step;yy<y+w/2;yy+=step){g.moveTo(x0,yy);g.lineTo(x0+depth,yy);}for(let xx=x0+step;xx<x0+depth;xx+=step){g.moveTo(xx,y-w/2);g.lineTo(xx,y+w/2);}g.stroke();
 g.lineWidth=Math.max(.12,3*px);g.strokeRect(x0,y-w/2,depth,w);g.restore();}
/** A row of cut triangle teeth just inside a rectangle (paper-coloured, as if gouged out of the black). */
function teeth(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,size:number){
 g.save();g.fillStyle=CREAM;g.globalAlpha=.9;const nx=Math.max(4,Math.round(w/size)),ny=Math.max(3,Math.round(h/size)),sx=w/nx,sy=h/ny,t=size*.55;g.beginPath();
 for(let i=0;i<nx;i++){const a=x+i*sx;g.moveTo(a,y);g.lineTo(a+sx,y);g.lineTo(a+sx/2,y-t);g.closePath();g.moveTo(a,y+h);g.lineTo(a+sx,y+h);g.lineTo(a+sx/2,y+h+t);g.closePath();}
 for(let i=0;i<ny;i++){const b=y+i*sy;g.moveTo(x,b);g.lineTo(x,b+sy);g.lineTo(x-t,b+sy/2);g.closePath();g.moveTo(x+w,b);g.lineTo(x+w,b+sy);g.lineTo(x+w+t,b+sy/2);g.closePath();}
 g.fill();g.restore();}
/** "Futsal court · same scale", in screen space just outside the red box's top-left corner. */
function ghostLabel(g:CanvasRenderingContext2D,v:View,x0:number,y0:number,L:number,W:number){
 const T=g.getTransform(),dpr=Math.hypot(T.a,T.b)/v.s,pts=[[x0,y0],[x0+L,y0],[x0,y0+W],[x0+L,y0+W]].map(([x,y])=>T.transformPoint(new DOMPoint(x,y)));
 const left=Math.min(...pts.map(p=>p.x)),top=Math.min(...pts.map(p=>p.y));g.save();g.setTransform(dpr,0,0,dpr,0,0);
 const fs=13,text='FUTSAL COURT · SAME SCALE';g.font=`${fs}px ${SLAB}`;const tw=g.measureText(text).width;
 const x=left/dpr,y=top/dpr-8;g.fillStyle=RED;g.fillRect(x,y-fs-6,tw+14,fs+10);g.fillStyle=CREAM;g.textBaseline='alphabetic';g.fillText(text,x+7,y-1);g.restore();}
export const SLAB='"Futsal Cordel Slab","Alfa Slab One","Rockwell Extra Bold",Rockwell,"Courier New",serif';
/** Kept for the old call site: the woodcut print needs no floodlight, the paper does the work. */
export function drawLight(_g:CanvasRenderingContext2D,_w:number,_h:number){}

// ── Players, ball and marks ─────────────────────────────────────────────────────────────────────────────────────────────
type Look={body:string;line:string;head:string;cut?:string};
const LOOK:Record<string,Look>={you:{body:RED,line:INK,head:INK,cut:CREAM},home:{body:INK,line:INK,head:INK,cut:CREAM},homeGk:{body:INK,line:INK,head:INK,cut:CREAM},
 away:{body:'#fffaf0',line:INK,head:INK},awayGk:{body:'#fffaf0',line:INK,head:INK}};
export const COLORS={you:RED,home:INK,homeGk:INK,away:'#fffaf0',awayGk:'#fffaf0',dot:RED};
type Pose={a:number;ph:number;x:number;y:number};
const poses=new WeakMap<Player,Pose>();
const wrap=(a:number)=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
/** Turn each player toward where they run (or, standing, toward the ball) and advance their stride by distance run. */
function pose(p:Player,bx:number,by:number):Pose{let o=poses.get(p);if(!o){o={a:p.team?Math.PI:0,ph:0,x:p.x,y:p.y};poses.set(p,o);}
 const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy);
 if(d>.004){o.a+=wrap(Math.atan2(dy,dx)-o.a)*Math.min(1,.3+d);o.ph+=d*2.6;}
 else if(Math.hypot(bx-p.x,by-p.y)>.3)o.a+=wrap(Math.atan2(by-p.y,bx-p.x)-o.a)*.12;
 if(d>3){o.ph=0;}o.x=p.x;o.y=p.y;return o;}
export type PlayerOpts={/** sim time, for your ring pulse; omit for a still frame */t?:number;passHint?:boolean};
export function drawPlayers(g:CanvasRenderingContext2D,s:Sim,v:View,o:PlayerOpts={}){
 const R=Math.max(.5,7.5/v.s),px=1/v.s,b=s.ball,you=s.players[s.youIdx];
 // Your ring: a red cut circle (and a slow pulse while the round runs).
 g.save();g.strokeStyle=RED;g.lineWidth=2.6*px;g.setLineDash([5*px,3*px]);g.beginPath();g.arc(you.x,you.y,R*1.9,0,TAU);g.stroke();g.setLineDash([]);
 if(o.t!=null){const k=(o.t%1.4)/1.4;g.globalAlpha=(1-k)*.7;g.beginPath();g.arc(you.x,you.y,R*(1.9+k*1.6),0,TAU);g.stroke();}g.restore();
 // When you have the ball, your team-mates get a black cut ring: tap one to pass.
 if(o.passHint&&b.owner===s.youIdx){const k=o.t!=null?.6+.4*Math.sin(o.t*7):.9;g.save();g.globalAlpha=k;g.strokeStyle=INK;g.lineWidth=2.6*px;g.setLineDash([3*px,2.5*px]);
  for(const p of s.players)if(p.team===0&&!p.you){g.beginPath();g.arc(p.x,p.y,R*1.8,0,TAU);g.stroke();}g.restore();}
 s.players.forEach(p=>{if(!p.you)figure(g,p,R,px,LOOK[p.team?(p.gk?'awayGk':'away'):(p.gk?'homeGk':'home')],b,p.gk);});
 drawBall(g,s,v);
 figure(g,you,R*1.12,px,LOOK.you,b,false);
 const yo=poses.get(you);if(yo){g.save();g.translate(you.x,you.y);g.rotate(yo.a);g.fillStyle=RED;g.beginPath();g.moveTo(R*2.6,0);g.lineTo(R*2.05,-R*.45);g.lineTo(R*2.2,0);g.lineTo(R*2.05,R*.45);g.closePath();g.fill();g.restore();}
}
/** A bean seen from above, cut in wood: an oval body, a round head, boots that swing with the stride. Keepers wear gloves. */
function figure(g:CanvasRenderingContext2D,p:Player,R:number,px:number,k:Look,b:{x:number;y:number},gk:boolean){
 const o=pose(p,b.x,b.y),moving=Math.hypot(p.vx,p.vy)>.3;g.save();g.translate(p.x,p.y);g.rotate(o.a);
 const sw=moving?Math.sin(o.ph)*R*.62:0;g.fillStyle=INK;
 g.beginPath();g.ellipse(sw,-R*.42,R*.36,R*.22,0,0,TAU);g.fill();g.beginPath();g.ellipse(-sw,R*.42,R*.36,R*.22,0,0,TAU);g.fill();
 if(gk){g.beginPath();g.arc(R*.25,-R*1.02,R*.27,0,TAU);g.arc(R*.25,R*1.02,R*.27,0,TAU);g.fill();}
 g.fillStyle=k.body;g.beginPath();g.ellipse(0,0,R*.62,R,0,0,TAU);g.fill();g.lineWidth=Math.max(1.6*px,R*.16);g.strokeStyle=k.line;g.stroke();
 // A cut highlight: two short gouges across the shoulders (paper showing through the black).
 if(k.cut){g.strokeStyle=k.cut;g.lineWidth=Math.max(1*px,R*.1);g.lineCap='round';g.beginPath();g.moveTo(-R*.3,-R*.62);g.lineTo(-R*.05,-R*.7);g.moveTo(-R*.3,R*.62);g.lineTo(-R*.05,R*.7);g.stroke();}
 g.fillStyle=k.head;g.beginPath();g.arc(R*.06,0,R*.44,0,TAU);g.fill();
 g.restore();}
type BallState={x:number;y:number;rot:number;trail:{x:number;y:number}[]};
const balls=new WeakMap<Sim,BallState>();
function drawBall(g:CanvasRenderingContext2D,s:Sim,v:View){
 const b=s.ball,br=Math.max(.3,5.4/v.s),px=1/v.s;let st=balls.get(s);if(!st){st={x:b.x,y:b.y,rot:0,trail:[]};balls.set(s,st);}
 const d=Math.hypot(b.x-st.x,b.y-st.y);if(d<4)st.rot+=d/br*.5;st.x=b.x;st.y=b.y;
 const fast=b.owner<0&&Math.hypot(b.vx,b.vy)>3;if(fast){st.trail.push({x:b.x,y:b.y});if(st.trail.length>7)st.trail.shift();}else if(st.trail.length)st.trail.shift();
 // Speed lines: short black gouges behind a kicked ball.
 if(st.trail.length>1){g.save();g.lineCap='round';g.strokeStyle=INK;for(let k=1;k<st.trail.length;k++){const a=k/st.trail.length;g.globalAlpha=a*.8;g.lineWidth=br*.45*a;
  g.beginPath();g.moveTo(st.trail[k-1].x,st.trail[k-1].y);g.lineTo(st.trail[k].x,st.trail[k].y);g.stroke();}g.restore();}
 g.save();g.translate(b.x,b.y);g.fillStyle='#fffaf0';g.beginPath();g.arc(0,0,br,0,TAU);g.fill();
 g.save();g.beginPath();g.arc(0,0,br,0,TAU);g.clip();g.rotate(st.rot);g.fillStyle=INK;pent(g,0,0,br*.42);
 g.strokeStyle=INK;g.lineWidth=br*.14;for(let k=0;k<5;k++){const a=-Math.PI/2+k/5*TAU;g.beginPath();g.moveTo(Math.cos(a)*br*.4,Math.sin(a)*br*.4);g.lineTo(Math.cos(a)*br,Math.sin(a)*br);g.stroke();}g.restore();
 g.lineWidth=Math.max(1.4*px,br*.2);g.strokeStyle=INK;g.beginPath();g.arc(0,0,br,0,TAU);g.stroke();g.restore();}
function pent(g:CanvasRenderingContext2D,x:number,y:number,r:number){g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k/5*TAU;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();g.fill();}
/** Touch marks: a small red cut star where each of your touches happened. */
export function drawDots(g:CanvasRenderingContext2D,dots:readonly {x:number;y:number}[],v:View){
 const r=Math.max(.45,4.4/v.s);g.save();g.fillStyle=RED;
 for(const d of dots){g.beginPath();g.moveTo(d.x,d.y-r);g.lineTo(d.x+r*.3,d.y-r*.3);g.lineTo(d.x+r,d.y);g.lineTo(d.x+r*.3,d.y+r*.3);g.lineTo(d.x,d.y+r);g.lineTo(d.x-r*.3,d.y+r*.3);g.lineTo(d.x-r,d.y);g.lineTo(d.x-r*.3,d.y-r*.3);g.closePath();g.fill();}
 g.restore();}
/** Cut rays that burst out of each new touch (age 0..1). */
export function drawBurst(g:CanvasRenderingContext2D,x:number,y:number,age:number,v:View){const e=1-Math.pow(1-age,3),px=1/v.s;
 g.save();g.globalAlpha=1-age;g.strokeStyle=RED;g.lineWidth=(3.4-2*age)*px;g.lineCap='round';g.beginPath();
 for(let k=0;k<8;k++){const a=k/8*TAU,r0=(8+e*14)*px,r1=(14+e*22)*px;g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);g.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);}g.stroke();g.restore();}
/** Where you are running to: a red ring and a dotted run line. */
export function drawTarget(g:CanvasRenderingContext2D,from:{x:number;y:number},to:{x:number;y:number},v:View,alpha:number){const px=1/v.s;
 g.save();g.globalAlpha=alpha;g.strokeStyle=RED;g.lineWidth=2*px;g.setLineDash([2*px,4*px]);g.beginPath();g.moveTo(from.x,from.y);g.lineTo(to.x,to.y);g.stroke();g.setLineDash([]);
 g.lineWidth=2.4*px;g.beginPath();g.arc(to.x,to.y,7*px,0,TAU);g.stroke();g.fillStyle=RED;g.beginPath();g.arc(to.x,to.y,2.2*px,0,TAU);g.fill();g.restore();}
/** Your name tag, in screen space under your figure: a red block with cut letters. */
export function drawYouTag(g:CanvasRenderingContext2D,s:Sim,v:View){const y=s.players[s.youIdx],p=v.m.transformPoint(new DOMPoint(y.x,y.y)),R=Math.max(.5,7.5/v.s)*1.12*v.s;
 g.save();g.font=`12px ${SLAB}`;const tw=g.measureText('YOU').width,w=tw+12,h=18,x=p.x-w/2,yy=p.y+R*1.9+6;
 g.fillStyle=RED;g.fillRect(x,yy,w,h);g.fillStyle=CREAM;g.textAlign='center';g.textBaseline='middle';g.fillText('YOU',p.x,yy+h/2+1);g.restore();}
