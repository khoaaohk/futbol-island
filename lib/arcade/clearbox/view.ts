/**
 * Clear the Box drawing (Nov 17 2026): two 2D canvases in the comic-print house style. `bg` is static (paper page and the mown pitch)
 * and repaints only on resize. `fg` holds the box (chalk lines, the goal, the D), the beans, runners, bumps and dust; the shell repaints
 * it only when something moves or the state changed. Beans are seen from above: a kit-coloured body with shoulders and hands, a head
 * with hair at the back and eyes at the front, and a chalk arrow on the grass in front of them, so the facing reads at a glance.
 * Every bean is pre-rendered once per kit and size (sprite cache) and rotated when drawn; dust and sparks are pooled. No three.js.
 */
import {DX,DY,KIT,KIT_DARK,type Box,type BoxEvent,type ClearBox} from './core';

const INK='#231a2e',PAPER='#fff3d6',SKIN='#ffd9a8',HAIR='#5a3a2a',SUN='#ffc83a',RED='#f0452e',GRASS_A='#3f9a5c',GRASS_B='#4aa868',CHALK='#f4fbef',DEF='#2d3a5c',DEF_DARK='#1b2440';
export type ClearboxLayout={w:number;h:number;cell:number;bx:number;by:number;bw:number;bh:number;cols:number;rows:number};
type Puff={on:boolean;x:number;y:number;vx:number;vy:number;t0:number;life:number;r:number;color:string;star:boolean};
type Runner={x:number;y:number;dir:number;kit:number;turner:boolean;t0:number;dist:number};
type Bump={k:number;dir:number;t0:number;cell:number};

export type ClearboxView=ReturnType<typeof createClearboxView>;
export function createClearboxView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean}){
 const bc=bg.getContext('2d')!,g=fg.getContext('2d')!;
 const L:ClearboxLayout={w:1,h:1,cell:40,bx:0,by:0,bw:200,bh:200,cols:5,rows:5};
 let dpr=1,topClear=60,bottomClear=90,box:Box|null=null;const sprites=new Map<string,HTMLCanvasElement>();
 const dust:Puff[]=Array.from({length:48},()=>({on:false,x:0,y:0,vx:0,vy:0,t0:0,life:0,r:4,color:PAPER,star:false}));
 const runners:Runner[]=[],bumps:Bump[]=[],turnT0=new Map<number,number>();
 let slideT0=-1e9,cheerT0=-1e9,overT0=-1,shakeT0=-1e9,laneFlash:{cells:number[];t0:number}|null=null;
 const now=()=>performance.now();

 /** One bean seen from above, facing UP, in an s x s tile. kit -1 = a defender (dark kit, arms spread, no arrow). */
 function bean(c:CanvasRenderingContext2D,s:number,kit:number,turner:boolean){
  const def=kit<0,body=def?DEF:KIT[kit],dark=def?DEF_DARK:KIT_DARK[kit],lw=Math.max(1.5,s*.055),cx=s*.5,cy=s*.56;
  if(turner){c.save();c.strokeStyle=SUN;c.lineWidth=lw*1.3;c.setLineDash([s*.1,s*.07]);c.beginPath();c.arc(cx,s*.5,s*.42,0,6.283);c.stroke();c.restore();}// a turner stands in a sun ring
  // hard comic shadow on the grass
  c.fillStyle='rgba(20,40,20,.32)';c.beginPath();c.ellipse(cx+s*.05,cy+s*.07,s*.33,s*.21,0,0,6.283);c.fill();
  if(!def){// the chalk arrow on the grass, in front of the bean
   c.beginPath();c.moveTo(cx,s*.02);c.lineTo(cx+s*.15,s*.2);c.lineTo(cx+s*.06,s*.2);c.lineTo(cx+s*.06,s*.26);c.lineTo(cx-s*.06,s*.26);c.lineTo(cx-s*.06,s*.2);c.lineTo(cx-s*.15,s*.2);c.closePath();
   c.fillStyle=CHALK;c.fill();c.lineWidth=lw*.75;c.strokeStyle=INK;c.lineJoin='round';c.stroke();}
  if(def){c.save();c.strokeStyle=RED;c.lineWidth=lw*1.1;c.setLineDash([s*.08,s*.05]);c.strokeRect(s*.08,s*.08,s*.84,s*.84);c.setLineDash([]);c.globalAlpha=.55;c.beginPath();c.moveTo(s*.16,s*.16);c.lineTo(s*.84,s*.84);c.moveTo(s*.84,s*.16);c.lineTo(s*.16,s*.84);c.stroke();c.restore();}
  // hands (spread wide for a defender: arms out to block)
  const hx=def?s*.43:s*.31,hy=def?cy-s*.02:cy-s*.08;for(const sx of [-1,1]){
   if(def){c.lineWidth=s*.09;c.strokeStyle=INK;c.lineCap='round';c.beginPath();c.moveTo(cx+sx*s*.22,cy);c.lineTo(cx+sx*hx,hy);c.stroke();c.lineWidth=s*.05;c.strokeStyle=body;c.stroke();}
   c.beginPath();c.arc(cx+sx*hx,hy,s*.065,0,6.283);c.fillStyle=SKIN;c.fill();c.lineWidth=lw*.8;c.strokeStyle=INK;c.stroke();}
  // shoulders: the shirt, with the shade side in the dark kit and a dot screen
  c.save();c.beginPath();c.ellipse(cx,cy,s*.29,s*.17,0,0,6.283);c.fillStyle=body;c.fill();c.clip();
  c.fillStyle=dark;c.fillRect(cx,cy-s*.2,s*.4,s*.4);c.fillStyle=body;const step=Math.max(2.6,s*.08);
  for(let y=cy-s*.18;y<cy+s*.2;y+=step)for(let x=cx+s*.02;x<cx+s*.32;x+=step){const d=(x-cx)/(s*.3);c.beginPath();c.arc(x+((y/step)%2)*step*.5,y,Math.max(.4,step*.38*(1-d)),0,6.283);c.fill();}
  c.restore();c.beginPath();c.ellipse(cx,cy,s*.29,s*.17,0,0,6.283);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  // head: hair at the back, face and eyes at the front (the top of the tile)
  const hr=s*.15,hcx=cx,hcy=cy-s*.06;c.beginPath();c.arc(hcx,hcy,hr,0,6.283);c.fillStyle=SKIN;c.fill();
  c.save();c.beginPath();c.arc(hcx,hcy,hr,0,6.283);c.clip();c.fillStyle=def?'#1d1420':HAIR;c.beginPath();c.ellipse(hcx,hcy+hr*.35,hr*1.05,hr*.95,0,0,6.283);c.fill();c.restore();
  c.beginPath();c.arc(hcx,hcy,hr,0,6.283);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  c.fillStyle=INK;for(const sx of [-1,1]){c.beginPath();c.arc(hcx+sx*hr*.42,hcy-hr*.48,Math.max(1,s*.024),0,6.283);c.fill();}
  if(turner){// a sun badge with a turning arrow on the shoulder (drawn over the head's edge)
   const bx=cx+s*.2,by=cy+s*.06,r=s*.1;c.beginPath();c.arc(bx,by,r,0,6.283);c.fillStyle=SUN;c.fill();c.lineWidth=lw*.7;c.strokeStyle=INK;c.stroke();
   c.beginPath();c.arc(bx,by,r*.55,-2.6,1.4);c.lineWidth=Math.max(1.2,lw*.6);c.stroke();const ax=bx+Math.cos(1.4)*r*.55,ay=by+Math.sin(1.4)*r*.55;
   c.beginPath();c.moveTo(ax-r*.45,ay-r*.05);c.lineTo(ax,ay);c.lineTo(ax-r*.05,ay-r*.45);c.stroke();}
  if(def){c.lineWidth=Math.max(1,lw*.6);c.beginPath();c.moveTo(hcx-hr*.6,hcy-hr*.78);c.lineTo(hcx-hr*.15,hcy-hr*.62);c.moveTo(hcx+hr*.6,hcy-hr*.78);c.lineTo(hcx+hr*.15,hcy-hr*.62);c.stroke();}// a stern brow
 }
 function sprite(kit:number,turner:boolean,s:number){const key=`${kit}:${turner?1:0}:${Math.round(s*dpr)}`;let sp=sprites.get(key);if(sp)return sp;
  sp=document.createElement('canvas');sp.width=sp.height=Math.ceil(s*dpr);const c=sp.getContext('2d')!;c.scale(dpr,dpr);bean(c,s,kit,turner);sprites.set(key,sp);if(sprites.size>60)sprites.delete(sprites.keys().next().value!);return sp;}
 /** Draws a bean centred at x,y, turned to angle (0 = up), scaled. */
 function blit(kit:number,turner:boolean,x:number,y:number,angle:number,scale=1,alpha=1){const s=L.cell,sp=sprite(kit,turner,s);g.save();g.globalAlpha=alpha;g.translate(x,y);if(angle)g.rotate(angle);if(scale!==1)g.scale(scale,scale);g.drawImage(sp,-s/2,-s/2,s,s);g.restore();}

 function paintScene(){
  const c=bc,W=L.w,H=L.h;c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle='#ffcf7a';c.fillRect(0,0,W,H);
  // the pitch: mown bands with a soft dot screen; the top is the stand's shadow line
  const band=Math.max(30,Math.round(L.cell*1.4));for(let y=0,k=0;y<H;y+=band,k++){c.fillStyle=k%2?GRASS_A:GRASS_B;c.fillRect(0,y,W,band);}
  c.fillStyle='rgba(0,0,0,.06)';for(let y=0;y<H;y+=8)for(let x=((y/8)%2)*4;x<W;x+=8){c.beginPath();c.arc(x,y,1.2,0,6.283);c.fill();}
 }
 function layoutFor(b:Box){
  const room=L.h-topClear-bottomClear,cellW=(L.w-32)/(b.w+.7),cellH=(room-10)/(b.h+.7+1.5),cell=Math.max(26,Math.floor(Math.min(cellW,cellH,76)));
  const bw=cell*b.w,bh=cell*b.h,by=Math.round(topClear+cell*1.0+Math.max(4,(room-bh-cell*1.9)*.45));
  Object.assign(L,{cell,bw,bh,bx:Math.round((L.w-bw)/2),by,cols:b.w,rows:b.h});
 }
 const centre=(i:number)=>({x:L.bx+(i%L.cols+.5)*L.cell,y:L.by+(Math.floor(i/L.cols)+.5)*L.cell});
 function puff(x:number,y:number,n:number,t:number,dir:number,star=false,color=PAPER){if(opts.reduced)n=Math.min(n,3);let made=0;for(const p of dust){if(made>=n)break;if(p.on)continue;made++;
  const a=Math.random()*6.283,v=(star?160:40)+Math.random()*(star?220:70);Object.assign(p,{on:true,x,y,vx:Math.cos(a)*v-DX[dir]*60,vy:Math.sin(a)*v-DY[dir]*60,t0:t,life:star?.5+Math.random()*.3:.35+Math.random()*.25,r:L.cell*(star?.1+Math.random()*.08:.06+Math.random()*.06),color,star});}}
 const starPath=(x:number,y:number,r:number,rot:number,pts=8)=>{g.beginPath();for(let i=0;i<pts*2;i++){const a=rot+i*Math.PI/pts,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();};

 function drawBox(ox:number,lineColor:string){
  const {bx,by,bw,bh,cell}=L,pad=cell*.18,x0=bx-pad+ox,y0=by-pad,w=bw+pad*2,h=bh+pad*2;
  // the goal on the goal line (top edge): net, posts, and a white bar
  const gw=Math.min(w*.62,cell*5),gx=x0+(w-gw)/2,gd=cell*.55;g.fillStyle='rgba(255,255,255,.18)';g.fillRect(gx,y0-gd,gw,gd);
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;g.beginPath();for(let x=gx;x<=gx+gw;x+=cell*.18){g.moveTo(x,y0-gd);g.lineTo(x,y0);}for(let y=y0-gd;y<y0;y+=cell*.18){g.moveTo(gx,y);g.lineTo(gx+gw,y);}g.stroke();
  g.lineWidth=Math.max(3,cell*.08);g.strokeStyle=INK;g.strokeRect(gx,y0-gd,gw,gd);g.lineWidth=Math.max(2,cell*.05);g.strokeStyle=PAPER;g.strokeRect(gx,y0-gd,gw,gd);
  // chalk: the area, the D below it, a dot on each cell
  g.strokeStyle=lineColor;g.lineWidth=Math.max(2.5,cell*.07);g.strokeRect(x0,y0,w,h);
  g.beginPath();g.arc(x0+w/2,y0+h-cell*.4,cell*1.4,.62,Math.PI-.62);g.stroke();
  g.fillStyle='rgba(244,251,239,.42)';for(let r=0;r<L.rows;r++)for(let q=0;q<L.cols;q++){g.beginPath();g.arc(bx+ox+(q+.5)*cell,by+(r+.5)*cell,Math.max(1.5,cell*.04),0,6.283);g.fill();}
 }

 /** A new box: lay it out and slide it in from the right (after a short beat for the celebration). */
 function setBox(b:Box,slide:boolean){box=b;layoutFor(b);turnT0.clear();bumps.length=0;laneFlash=null;slideT0=slide&&!opts.reduced?now()+140:-1e9;}

 return {
  get layout(){return L;},
  resize(w:number,h:number,ratio:number,top:number,bottom:number){dpr=ratio;L.w=w;L.h=h;topClear=top;bottomClear=bottom;sprites.clear();
   for(const c of [bg,fg]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}if(box)layoutFor(box);paintScene();},
  setBox,
  /** Box cell under a CSS point (or null). */
  cellAt(x:number,y:number){if(now()<slideT0+300)return null;const cx=Math.floor((x-L.bx)/L.cell),cy=Math.floor((y-L.by)/L.cell);return cx>=0&&cy>=0&&cx<L.cols&&cy<L.rows?{x:cx,y:cy}:null;},
  onEvent(e:BoxEvent,game:ClearBox){const t=now();
   if(e.type==='run'){const p=centre(e.cell),b=game.state.box.beans[e.bean],w=e.dir%2?L.w:L.h;
    runners.push({x:p.x,y:p.y,dir:e.dir,kit:e.kit,turner:!!b?.turner,t0:t,dist:w});puff(p.x-DX[e.dir]*L.cell*.3,p.y-DY[e.dir]*L.cell*.3,7,t,e.dir);}
   else if(e.type==='foul'){bumps.push({k:e.bean,dir:e.dir,t0:t,cell:e.cell});const b=game.state.box.beans[e.bean];
    if(b){const lane:number[]=[];let X=b.x+DX[b.dir],Y=b.y+DY[b.dir];while(X>=0&&Y>=0&&X<L.cols&&Y<L.rows){const i=Y*L.cols+X;lane.push(i);if(i===e.cell)break;X+=DX[b.dir];Y+=DY[b.dir];}laneFlash={cells:lane,t0:t};}
    const q=centre(e.cell);puff(q.x-DX[e.dir]*L.cell*.45,q.y-DY[e.dir]*L.cell*.45,6,t+60,e.dir,true,SUN);if(!opts.reduced)shakeT0=t;}
   else if(e.type==='turn')turnT0.set(e.bean,t);
   else if(e.type==='box'){cheerT0=t;const cx=L.bx+L.bw/2,cy=L.by+L.bh/2;for(let k=0;k<4;k++)puff(cx+(k-1.5)*L.cell,cy,5,t,0,true,k%2?SUN:PAPER);}
   else if(e.type==='level'||e.type==='reset'){if(e.type==='level')setBox(game.state.box,true);}
   else if(e.type==='over')overT0=t;
  },
  reset(b:Box){runners.length=0;bumps.length=0;turnT0.clear();for(const p of dust)p.on=false;overT0=-1;cheerT0=-1e9;shakeT0=-1e9;laneFlash=null;setBox(b,false);},
  /** Draws a frame. Returns true while something still moves (the shell keeps repainting). */
  render(game:ClearBox,cursor:{x:number;y:number}|null){
   const s=game.state,t=now(),c=L.cell,b=s.box;let busy=false;
   g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,L.w,L.h);
   let sx=0,sy=0;const sh=(t-shakeT0)/1000;if(sh<.22){busy=true;const k=(1-sh/.22)*4;sx=Math.sin(t*.1)*k;sy=Math.cos(t*.13)*k*.5;}
   g.save();g.translate(sx,sy);
   const su=(t-slideT0)/300;let ox=0;if(su<1){busy=true;ox=su<0?L.w:(1-su)*(1-su)*(1-su)*L.w;}
   const cheer=(t-cheerT0)/420;if(cheer<1)busy=true;drawBox(ox,cheer<1&&Math.floor(cheer*6)%2===0?SUN:CHALK);
   // the blocked lane of a foul: red dashes up to the bump
   if(laneFlash){const u=(t-laneFlash.t0)/700;if(u>=1)laneFlash=null;else{busy=true;g.globalAlpha=1-u;g.strokeStyle=RED;g.lineWidth=Math.max(3,c*.09);g.setLineDash([c*.18,c*.12]);
    const first=laneFlash.cells[0],last=laneFlash.cells[laneFlash.cells.length-1];if(first!==undefined&&last!==undefined){const a=centre(first),z=centre(last);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(z.x,z.y);g.stroke();}g.setLineDash([]);g.globalAlpha=1;}}
   // defenders, then beans (a bump lunges toward the blocker and springs back; a turner swings a quarter)
   for(const d of b.defs){const p=centre(d);let sc=1;for(const q of bumps)if(q.cell===d){const u=(t-q.t0)/260;if(u<1&&u>.3)sc=1+.12*Math.sin((u-.3)/.7*Math.PI);}blit(-1,false,p.x+ox,p.y,0,sc);}
   for(let k=0;k<b.beans.length;k++){const o=b.beans[k];if(o.out)continue;const p=centre(o.y*L.cols+o.x);let x=p.x+ox,y=p.y,ang=o.dir*Math.PI/2,sc=1;
    const tt=turnT0.get(k);if(tt!==undefined){const u=(t-tt)/170;if(u<1){busy=true;ang-=(1-u)*(1-u)*Math.PI/2;}else turnT0.delete(k);}
    for(let j=bumps.length-1;j>=0;j--){const q=bumps[j];if(q.k!==k)continue;const u=(t-q.t0)/420;if(u>=1){bumps.splice(j,1);continue;}busy=true;
     const out=u<.3?Math.sin(u/.3*Math.PI/2)*.42:.42*(1-(u-.3)/.7)*(1-(u-.3)/.7);x+=DX[q.dir]*c*out;y+=DY[q.dir]*c*out;sc=u<.35?1+.1*u/.35:1;}
    for(const q of bumps)if(q.cell===o.y*L.cols+o.x){const u=(t-q.t0)/260;if(u<1&&u>.3)sc=1+.12*Math.sin((u-.3)/.7*Math.PI);}
    blit(o.kit,o.turner,x,y,ang,sc);}
   // keyboard cursor
   if(cursor){const x=L.bx+cursor.x*c+ox,y=L.by+cursor.y*c;g.lineWidth=3;g.strokeStyle=INK;g.setLineDash([6,4]);g.strokeRect(x+2,y+2,c-4,c-4);g.setLineDash([]);
    const k=game.beanAt(cursor.x,cursor.y);if(k>=0){const o=b.beans[k];g.strokeStyle=game.canRun(k)?PAPER:RED;g.globalAlpha=.75;g.lineWidth=2;g.setLineDash([4,5]);g.beginPath();g.moveTo(x+c/2,y+c/2);
     let X=o.x,Y=o.y;while(X>=0&&Y>=0&&X<L.cols&&Y<L.rows){X+=DX[o.dir];Y+=DY[o.dir];}g.lineTo(L.bx+(X+.5)*c+ox,L.by+(Y+.5)*c);g.stroke();g.setLineDash([]);g.globalAlpha=1;}}
   // runners: a quick start, then a sprint off the page, dust kicked up behind
   for(let j=runners.length-1;j>=0;j--){const r=runners[j],u=(t-r.t0)/1000;const d=u<.06?0:(u-.06)*(u-.06)*2600+(u-.06)*380;if(d>r.dist+c*2){runners.splice(j,1);continue;}busy=true;
    const x=r.x+DX[r.dir]*d,y=r.y+DY[r.dir]*d,hop=1+.06*Math.abs(Math.sin(u*40));blit(r.kit,r.turner,x,y,r.dir*Math.PI/2,u<.06?1.12-u:hop);
    if(Math.random()<.5&&!opts.reduced)puff(x-DX[r.dir]*c*.35,y-DY[r.dir]*c*.35,1,t,r.dir);}
   g.restore();
   // dust and stars (pooled)
   for(const p of dust){if(!p.on)continue;const u=(t-p.t0)/1000;if(u<0){busy=true;continue;}if(u>=p.life){p.on=false;continue;}busy=true;const k=1-u/p.life,x=p.x+p.vx*u,y=p.y+p.vy*u;
    if(p.star){starPath(x,y,p.r*(.6+k*.6),u*5);g.fillStyle=p.color;g.fill();g.lineWidth=1.6;g.strokeStyle=INK;g.stroke();}
    else{g.globalAlpha=k;g.beginPath();g.arc(x,y,p.r*(1+(1-k)*.6),0,6.283);g.fillStyle=p.color;g.fill();g.lineWidth=1.2;g.strokeStyle=INK;g.stroke();g.globalAlpha=1;}}
   if(overT0>0&&t-overT0<900)busy=true;
   return busy;
  },
  clear(){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,fg.width,fg.height);},
  dispose(){sprites.clear();},
 };
}
