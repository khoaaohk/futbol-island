/**
 * Line Up! drawing (Nov 17 2026): two 2D canvases in the comic-print house style. `bg` is static (paper page, stand, the pitch with
 * mown bands and chalk lines, the empty squares, the tray shelf) and repaints only on resize. `fg` holds the players, the ghost,
 * the dragged piece and the effects; it is drawn on demand (the shell asks for frames only while a finger drags or an effect runs).
 * Every bean tile is pre-rendered once per kit and size (sprite cache), effects are pooled. No three.js.
 */
import {LU,SHAPES,KIT,KIT_DARK,type LineUp,type LineEvent} from './core';

const INK='#231a2e',PAPER='#fff3d6',SKIN='#ffd9a8',SUN='#ffc83a',RED='#f0452e',GRASS_A='#3f9a5c',GRASS_B='#4aa868',CHALK='#eaf6e2';
export type LineupLayout={w:number;h:number;cell:number;bx:number;by:number;bw:number;trayY:number;trayH:number;slotW:number;
 /** the tray slots' centres */slots:{cx:number;cy:number}[]};
/** What the shell is dragging: slot, the piece's top-left in CSS px, the snapped cell (or null off the pitch) and whether it fits. */
export type LineupDrag={slot:number;x:number;y:number;cell:{x:number;y:number}|null;ok:boolean;rows:number[];cols:number[]};
type Pop={i:number;kit:number;t0:number;delay:number};
type Spark={on:boolean;x:number;y:number;vx:number;vy:number;t0:number;life:number;color:string;r:number;spin:number};
type Fly={slot:number;x0:number;y0:number;t0:number};

export type LineupView=ReturnType<typeof createLineupView>;
export function createLineupView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean}){
 const N=LU.size,bx2=bg.getContext('2d')!,g=fg.getContext('2d')!;
 const L:LineupLayout={w:1,h:1,cell:32,bx:0,by:0,bw:256,trayY:0,trayH:100,slotW:80,slots:[{cx:0,cy:0},{cx:0,cy:0},{cx:0,cy:0}]};
 let dpr=1;const sprites=new Map<string,HTMLCanvasElement>();
 const pops:Pop[]=[],squash=new Map<number,number>(),sparks:Spark[]=Array.from({length:64},()=>({on:false,x:0,y:0,vx:0,vy:0,t0:0,life:0,color:SUN,r:4,spin:0}));
 const refIn=new Map<number,number>(),flashes:{rows:number[];cols:number[];t0:number}[]=[];let fly:Fly|null=null,shakeT0=-1e9,shakeAmp=0,overT0=-1,dealT0=-1e9;
 const now=()=>performance.now();

 /** One bean player on a tile: the shirt is the tile (kit colour), a head with two eyes, a collar, comic dots in the shade. kit -1 = referee. */
 function tile(c:CanvasRenderingContext2D,x:number,y:number,s:number,kit:number,alpha=1){
  const ref=kit<0,body=ref?INK:KIT[kit],dark=ref?'#000':KIT_DARK[kit],lw=Math.max(1.4,s*.07),r=s*.2,p=s*.06;
  c.save();c.globalAlpha=alpha;c.translate(x,y);
  const rr=(x0:number,y0:number,w:number,h:number,rad:number)=>{c.beginPath();c.moveTo(x0+rad,y0);c.arcTo(x0+w,y0,x0+w,y0+h,rad);c.arcTo(x0+w,y0+h,x0,y0+h,rad);c.arcTo(x0,y0+h,x0,y0,rad);c.arcTo(x0,y0,x0+w,y0,rad);c.closePath();};
  rr(p,p,s-2*p,s-2*p,r);c.fillStyle=body;c.fill();
  // shade: the lower right in the dark kit with a halftone dot screen
  c.save();rr(p,p,s-2*p,s-2*p,r);c.clip();c.fillStyle=dark;c.beginPath();c.moveTo(s,s*.42);c.lineTo(s,s);c.lineTo(s*.3,s);c.closePath();c.fill();
  c.fillStyle=ref?'#3b3048':body;const step=Math.max(3,s*.13);for(let yy=s*.5;yy<s;yy+=step)for(let xx=s*.45;xx<s;xx+=step){const d=(xx+yy-s*.9)/s;if(d>0){c.beginPath();c.arc(xx+(yy/step%2)*step*.5,yy,Math.min(step*.36,d*step*.6),0,6.283);c.fill();}}c.restore();
  rr(p,p,s-2*p,s-2*p,r);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  // collar
  c.beginPath();c.moveTo(s*.36,s*.62);c.lineTo(s*.5,s*.74);c.lineTo(s*.64,s*.62);c.lineWidth=lw*.8;c.strokeStyle=ref?SUN:PAPER;c.stroke();
  // head
  c.beginPath();c.arc(s*.5,s*.4,s*.2,0,6.283);c.fillStyle=SKIN;c.fill();c.lineWidth=lw*.9;c.strokeStyle=INK;c.stroke();
  c.fillStyle=INK;c.beginPath();c.arc(s*.43,s*.39,Math.max(1,s*.032),0,6.283);c.arc(s*.57,s*.39,Math.max(1,s*.032),0,6.283);c.fill();
  c.beginPath();c.arc(s*.5,s*.44,s*.07,.2,Math.PI-.2);c.lineWidth=Math.max(1,lw*.55);c.stroke();
  if(ref){// yellow card held up
   c.save();c.translate(s*.8,s*.24);c.rotate(.25);c.fillStyle=SUN;c.fillRect(-s*.08,-s*.12,s*.16,s*.22);c.lineWidth=lw*.7;c.strokeRect(-s*.08,-s*.12,s*.16,s*.22);c.restore();}
  c.restore();
 }
 function sprite(kit:number,s:number){const key=`${kit}:${Math.round(s*dpr)}`;let sp=sprites.get(key);if(sp)return sp;
  sp=document.createElement('canvas');sp.width=sp.height=Math.ceil(s*dpr);const c=sp.getContext('2d')!;c.scale(dpr,dpr);tile(c,0,0,s,kit);sprites.set(key,sp);if(sprites.size>80)sprites.delete(sprites.keys().next().value!);return sp;}
 const blit=(kit:number,x:number,y:number,s:number,scale=1,alpha=1)=>{const sp=sprite(kit,s);g.globalAlpha=alpha;if(scale===1)g.drawImage(sp,x,y,s,s);else{const d=s*scale;g.drawImage(sp,x+(s-d)/2,y+(s-d)/2,d,d);}g.globalAlpha=1;};

 function paintScene(){
  const c=bx2,W=L.w,H=L.h;c.setTransform(dpr,0,0,dpr,0,0);
  // paper page with a Ben-Day dot screen, a stand band behind the pitch
  c.fillStyle='#ffcf7a';c.fillRect(0,0,W,H);c.fillStyle='#f6b55c';for(let y=0;y<H;y+=9)for(let x=(y/9%2)*4.5;x<W;x+=9){c.beginPath();c.arc(x,y,1.5,0,6.283);c.fill();}
  const top=L.by-L.cell*.9;c.fillStyle='#e9825c';c.fillRect(0,0,W,Math.max(0,top));
  c.fillStyle='#7a4a78';for(let i=0;i<W;i+=14){const hh=8+((i*37)%11);c.beginPath();c.arc(i+7,top,hh*.55,Math.PI,0);c.fill();}// the crowd's heads along the stand
  c.fillStyle=INK;c.fillRect(0,top,W,3);
  // pitch board: ink frame, hard shadow, mown bands, chalk
  const {bx,by,bw,cell}=L,pad=Math.round(cell*.28);
  c.fillStyle=INK;c.fillRect(bx-pad+6,by-pad+6,bw+pad*2,bw+pad*2);c.fillStyle=GRASS_B;c.fillRect(bx-pad,by-pad,bw+pad*2,bw+pad*2);
  for(let r=0;r<N;r++){c.fillStyle=r%2?GRASS_A:GRASS_B;c.fillRect(bx,by+r*cell,bw,cell);}
  c.strokeStyle=CHALK;c.globalAlpha=.55;c.lineWidth=2;c.strokeRect(bx-pad*.5,by-pad*.5,bw+pad,bw+pad);c.beginPath();c.moveTo(bx-pad*.5,by+bw/2);c.lineTo(bx+bw+pad*.5,by+bw/2);c.stroke();
  c.beginPath();c.arc(bx+bw/2,by+bw/2,cell*1.2,0,6.283);c.stroke();c.strokeRect(bx+bw*.3,by-pad*.5,bw*.4,cell*1.1);c.strokeRect(bx+bw*.3,by+bw+pad*.5-cell*1.1,bw*.4,cell*1.1);c.globalAlpha=1;
  // empty squares: a darker inset each, so the grid reads without thin lines
  c.fillStyle='#00000026';for(let r=0;r<N;r++)for(let q=0;q<N;q++){const x=bx+q*cell+cell*.1,y=by+r*cell+cell*.1,s=cell*.8;c.beginPath();c.roundRect?.(x,y,s,s,cell*.16);if(!c.roundRect)c.rect(x,y,s,s);c.fill();}
  c.lineWidth=4;c.strokeStyle=INK;c.strokeRect(bx-pad,by-pad,bw+pad*2,bw+pad*2);
  // tray shelf: an inked paper strip with three bays
  const ty=L.trayY,th=L.trayH,tx=bx-pad,tw=bw+pad*2;c.fillStyle=INK;c.fillRect(tx+6,ty+6,tw,th);c.fillStyle=PAPER;c.fillRect(tx,ty,tw,th);
  c.fillStyle='#f3dfb0';for(let y=ty+4;y<ty+th;y+=8)for(let x=tx+(((y-ty)/8)%2)*4+4;x<tx+tw;x+=8){c.beginPath();c.arc(x,y,1.2,0,6.283);c.fill();}
  c.lineWidth=4;c.strokeRect(tx,ty,tw,th);c.lineWidth=3;for(let k=1;k<3;k++){const x=tx+tw*k/3;c.beginPath();c.moveTo(x,ty+10);c.lineTo(x,ty+th-10);c.stroke();}
 }

 const trayScale=(shape:number)=>{const d=SHAPES[shape];return Math.min(.62,(L.slotW*.8)/(d.w*L.cell),(L.trayH*.78)/(d.h*L.cell));};
 /** A tray piece's top-left in CSS px and its cell size there. */
 function trayRect(slot:number,shape:number){const d=SHAPES[shape],s=L.cell*trayScale(shape),c=L.slots[slot];return {x:c.cx-d.w*s/2,y:c.cy-d.h*s/2,s};}
 function drawPiece(shape:number,kit:number,x:number,y:number,s:number,alpha=1,lift=false){
  const d=SHAPES[shape];if(lift){g.fillStyle=INK;g.globalAlpha=.35;for(const [cx,cy] of d.cells){g.beginPath();g.roundRect?.(x+cx*s+s*.14,y+cy*s+s*.2,s*.88,s*.88,s*.2);g.fill();}g.globalAlpha=1;}
  for(const [cx,cy] of d.cells)blit(kit,x+cx*s,y+cy*s,s,1,alpha);
 }
 function spawnSparks(x:number,y:number,n:number,color:string,t:number){if(opts.reduced)n=Math.min(n,4);let made=0;for(const p of sparks){if(made>=n)break;if(p.on)continue;made++;
  const a=Math.random()*6.283,v=(opts.reduced?40:120)+Math.random()*260;Object.assign(p,{on:true,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,t0:t,life:.45+Math.random()*.35,color,r:L.cell*(.12+Math.random()*.12),spin:Math.random()*6});}}
 const star=(x:number,y:number,r:number,rot:number)=>{g.beginPath();for(let i=0;i<8;i++){const a=rot+i*Math.PI/4,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();};

 return {
  get layout(){return L;},
  trayRect,trayScale,
  resize(w:number,h:number,ratio:number,topClear:number){
   dpr=ratio;L.w=w;L.h=h;sprites.clear();for(const c of [bg,fg]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
   // the pitch takes the width (a 16 px gutter) unless the height is short; the tray sits under it; both centred in what is left
   const room=h-topClear-16,cellW=(w-40)/(N+.6),cellH=room/(N+.6+3.6+.8),cell=Math.max(18,Math.floor(Math.min(cellW,cellH,64)));
   const bw=cell*N,pad=Math.round(cell*.28),trayH=Math.round(cell*3.1),gap=Math.round(cell*.75),total=bw+pad*2+gap+trayH;
   const by=Math.round(topClear+Math.max(8,(room-total)*.42)+pad);
   Object.assign(L,{cell,bw,bx:Math.round((w-bw)/2),by,trayY:by+bw+pad+gap,trayH,slotW:(bw+pad*2)/3});
   L.slots=[0,1,2].map(k=>({cx:L.bx-pad+L.slotW*(k+.5),cy:L.trayY+trayH/2}));
   paintScene();
  },
  /** Board cell under a CSS point (or null). */
  cellAt(x:number,y:number){const cx=Math.floor((x-L.bx)/L.cell),cy=Math.floor((y-L.by)/L.cell);return cx>=0&&cy>=0&&cx<N&&cy<N?{x:cx,y:cy}:null;},
  /** Tray slot under a CSS point (generous: the whole bay), or -1. */
  slotAt(x:number,y:number){if(y<L.trayY-L.cell*.6||y>L.trayY+L.trayH+L.cell*.6)return -1;const k=Math.floor((x-(L.bx-Math.round(L.cell*.28)))/L.slotW);return k>=0&&k<3?k:-1;},
  /** Where a dragged piece would snap: forgiving at the edges (clamped while its middle is over the pitch). */
  snap(shape:number,x:number,y:number){const d=SHAPES[shape],c=L.cell,mx=x+d.w*c/2,my=y+d.h*c/2;if(mx<L.bx-c*.5||my<L.by-c*.5||mx>L.bx+L.bw+c*.5||my>L.by+L.bw+c*.5)return null;
   return {x:Math.max(0,Math.min(N-d.w,Math.round((x-L.bx)/c))),y:Math.max(0,Math.min(N-d.h,Math.round((y-L.by)/c)))};},
  onEvent(e:LineEvent){const t=now();
   if(e.type==='place'){for(const i of e.cells)squash.set(i,t);}
   else if(e.type==='clear'){const cx=e.cells.reduce((a,i)=>a+i%N,0)/e.cells.length,cy=e.cells.reduce((a,i)=>a+Math.floor(i/N),0)/e.cells.length;
    e.cells.forEach((i,j)=>{const x=i%N,y=Math.floor(i/N),d=Math.hypot(x-cx,y-cy);pops.push({i,kit:Math.max(0,e.kits[j]??e.kit),t0:t,delay:opts.reduced?0:d*22});});
    flashes.push({rows:e.rows,cols:e.cols,t0:t});
    for(const r of e.rows)for(let q=0;q<N;q+=2)spawnSparks(L.bx+(q+.5)*L.cell,L.by+(r+.5)*L.cell,2,q%4?SUN:PAPER,t);
    for(const q of e.cols)for(let r=0;r<N;r+=2)spawnSparks(L.bx+(q+.5)*L.cell,L.by+(r+.5)*L.cell,2,r%4?SUN:PAPER,t);
    if(e.a>=2&&!opts.reduced){shakeT0=t;shakeAmp=Math.min(9,3+e.a*2);}}
   else if(e.type==='refOn')for(const i of e.cells)refIn.set(i,t);
   else if(e.type==='deal')dealT0=t;
   else if(e.type==='over')overT0=t;
  },
  /** A failed drop: the piece flies back from where it was let go. */
  flyBack(slot:number,x:number,y:number){fly={slot,x0:x,y0:y,t0:now()};},
  reset(){pops.length=0;squash.clear();refIn.clear();flashes.length=0;fly=null;overT0=-1;shakeT0=-1e9;for(const p of sparks)p.on=false;},
  /** Draws a frame. Returns true while something still moves (the shell keeps asking for frames). */
  render(game:LineUp,drag:LineupDrag|null,cursor:{slot:number;x:number;y:number}|null){
   const s=game.state,t=now(),c=L.cell;let busy=false;
   g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,L.w,L.h);
   let ox=0,oy=0;const sh=(t-shakeT0)/1000;if(sh<.3){busy=true;const k=(1-sh/.3)*shakeAmp;ox=Math.sin(t*.09)*k;oy=Math.cos(t*.11)*k*.6;}
   g.save();g.translate(ox,oy);
   // ghost line highlight first (under the players)
   const hint=drag&&drag.ok?drag:null;
   if(hint&&(hint.rows.length||hint.cols.length)){g.fillStyle=SUN;g.globalAlpha=.42+.12*Math.sin(t*.012);busy=true;
    for(const r of hint.rows)g.fillRect(L.bx,L.by+r*c,L.bw,c);for(const q of hint.cols)g.fillRect(L.bx+q*c,L.by,c,L.bw);g.globalAlpha=1;}
   // players on the pitch
   const lit=new Set<number>();if(hint){for(const r of hint.rows)for(let q=0;q<N;q++)lit.add(r*N+q);for(const q of hint.cols)for(let r=0;r<N;r++)lit.add(r*N+q);}
   for(let i=0;i<N*N;i++){const x=L.bx+(i%N)*c,y=L.by+Math.floor(i/N)*c;
    if(s.ref[i]>0){const t0=refIn.get(i),a=t0===undefined?1:Math.min(1,(t-t0)/260);if(a<1)busy=true;const drop=(1-a)*(1-a);blit(-1,x,y-drop*c*1.4,c,1+.25*drop);
     g.fillStyle=PAPER;g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.arc(x+c*.82,y+c*.8,c*.17,0,6.283);g.fill();g.stroke();g.fillStyle=INK;g.font=`900 ${Math.round(c*.24)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(String(s.ref[i]),x+c*.82,y+c*.81);continue;}
    const v=s.grid[i];if(!v)continue;let sc=1;const t0=squash.get(i);if(t0!==undefined){const k=(t-t0)/160;if(k<1){busy=true;sc=1+.2*(1-k)*Math.cos(k*3);}else squash.delete(i);}
    if(lit.has(i))sc*=1.06+.04*Math.sin(t*.02+i);blit(v-1,x,y,c,sc);}
   // clear pops: tiles swell and fade, staggered from the piece outwards
   for(let k=pops.length-1;k>=0;k--){const p=pops[k],u=(t-p.t0-p.delay)/300;if(u>=1){pops.splice(k,1);continue;}busy=true;const x=L.bx+(p.i%N)*c,y=L.by+Math.floor(p.i/N)*c;
    if(u<0){blit(p.kit,x,y,c);continue;}blit(p.kit,x,y,c,1+.45*u,1-u);}
   for(let k=flashes.length-1;k>=0;k--){const f=flashes[k],u=(t-f.t0)/220;if(u>=1){flashes.splice(k,1);continue;}busy=true;g.fillStyle=PAPER;g.globalAlpha=(1-u)*.85;
    for(const r of f.rows)g.fillRect(L.bx-c*.2,L.by+r*c+c*(.5-.5*(1-u)),L.bw+c*.4,c*(1-u));for(const q of f.cols)g.fillRect(L.bx+q*c+c*(.5-.5*(1-u)),L.by-c*.2,c*(1-u),L.bw+c*.4);g.globalAlpha=1;}
   // ghost: where the piece lands (or a red outline when it does not fit)
   if(drag&&drag.cell){const p=s.tray[drag.slot];if(p){const d=SHAPES[p.shape];
    for(const [cx,cy] of d.cells){const x=L.bx+(drag.cell.x+cx)*c,y=L.by+(drag.cell.y+cy)*c;
     if(drag.ok)blit(p.kit,x,y,c,1,.42);else{const i=(drag.cell.y+cy)*N+drag.cell.x+cx,blocked=s.grid[i]!==0||s.ref[i]!==0;g.lineWidth=3;g.strokeStyle=RED;g.setLineDash([5,4]);g.strokeRect(x+3,y+3,c-6,c-6);g.setLineDash([]);
      if(blocked){g.beginPath();g.moveTo(x+c*.3,y+c*.3);g.lineTo(x+c*.7,y+c*.7);g.moveTo(x+c*.7,y+c*.3);g.lineTo(x+c*.3,y+c*.7);g.lineWidth=4;g.stroke();}}}}}
   if(cursor&&!drag){const p=s.tray[cursor.slot];if(p){const d=SHAPES[p.shape],ok=game.fits(p.shape,cursor.x,cursor.y);
    for(const [cx,cy] of d.cells){const x=L.bx+(cursor.x+cx)*c,y=L.by+(cursor.y+cy)*c;if(ok)blit(p.kit,x,y,c,1,.55);else{g.lineWidth=3;g.strokeStyle=RED;g.setLineDash([5,4]);g.strokeRect(x+3,y+3,c-6,c-6);g.setLineDash([]);}}}}
   g.restore();
   // tray: pieces in their bays; ones that fit nowhere are faded with a "no room" bar; a fresh tray slides up
   const dealU=Math.min(1,(t-dealT0)/240);if(dealU<1)busy=true;
   for(let k=0;k<3;k++){const p=s.tray[k];if(!p||(drag&&drag.slot===k))continue;let {x,y,s:ps}=trayRect(k,p.shape);
    if(fly&&fly.slot===k){const u=Math.min(1,(t-fly.t0)/170),e=1-(1-u)*(1-u),sc=1+(c/ps-1)*(1-e);if(u<1){busy=true;x=fly.x0+(x-fly.x0)*e;y=fly.y0+(y-fly.y0)*e;ps*=sc;}else fly=null;}
    if(dealU<1)y+=(1-dealU)*(1-dealU)*L.trayH*.5;
    const fits=game.fitsAnywhere(p.shape);let dx=0;if(!fits&&overT0>0){const u=(t-overT0)/600;if(u<1){busy=true;dx=Math.sin(u*40)*5*(1-u);}}
    drawPiece(p.shape,p.kit,x+dx,y,ps,fits?1:.38);
    if(cursor&&cursor.slot===k&&!drag){const d=SHAPES[p.shape];g.lineWidth=3;g.strokeStyle=INK;g.setLineDash([6,4]);g.strokeRect(x-6,y-6,d.w*ps+12,d.h*ps+12);g.setLineDash([]);}
    if(!fits&&!s.over){const cx=L.slots[k].cx,cy=L.trayY+L.trayH-14;g.fillStyle=INK;g.font=`800 ${Math.max(11,Math.round(c*.3))}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('No room',cx,cy);}}
   // the dragged piece, full size, lifted above the finger, with a hard comic shadow
   if(drag){const p=s.tray[drag.slot];if(p)drawPiece(p.shape,p.kit,drag.x,drag.y,c,1,true);busy=true;}
   // sparks
   for(const p of sparks){if(!p.on)continue;const u=(t-p.t0)/1000;if(u>=p.life){p.on=false;continue;}busy=true;const k=1-u/p.life,x=p.x+p.vx*u,y=p.y+p.vy*u+260*u*u;
    star(x+ox,y+oy,p.r*(.5+k*.6),p.spin+u*6);g.fillStyle=p.color;g.fill();g.lineWidth=1.6;g.strokeStyle=INK;g.stroke();}
   return busy;
  },
  clear(){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,fg.width,fg.height);},
  dispose(){sprites.clear();},
 };
}
