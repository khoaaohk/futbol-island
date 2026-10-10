/**
 * "How it's made" (telstar-1970, Oct 9 2026 motion pass): the visitor stitches the Telstar together on the TV screen, panel by
 * panel. 32 panels on a truncated icosahedron: 12 black pentagons (5 sides) and 20 white hexagons (6 sides).
 *
 *  - Ball: Canvas 2D, an orthographic view of the panels on a sphere (edges subdivided so the outlines curve; points behind the
 *    limb are pinned to it). Panels are flat-shaded from one light at the upper left; empty gaps show the grey rubber bladder
 *    with a dashed stitch line.
 *  - Spin: drag the ball to turn it (a trackball); let go and it keeps turning with the flick's velocity and slows on friction.
 *    Arrow keys turn it too.
 *  - Panels: drag a piece from the tray onto a gap. Right shape: the piece springs into the gap (it follows the finger on a
 *    spring, flies to the gap's centre and shrinks to fit), then the panel pops in with an overshoot. Wrong shape: the gap
 *    flashes and the piece springs back to the tray. Tap a piece (or press it with the keyboard) and it flies to the best gap
 *    of its shape, turning the ball first if none faces you; tap a gap and the right piece flies into it.
 *  - Finish: "Stitch the rest" fills the remaining gaps in a quick stagger while the ball turns; the last panel spins the ball up.
 *
 * Heat: one rAF loop shared by the ball and the flying piece; it runs only while something moves (a flick, a pop, a flight, the
 * stagger, a turn-to-gap) and stops when settled or when the tab is hidden. DPR ≤ 1.5 on touch, ≤ 2 otherwise; the canvas
 * is TV-sized. Reduced motion: no momentum, pops and flights snap, the stagger lands at once.
 */
export type PanelKind='pent'|'hex';
type V3=[number,number,number];
export type Panel={kind:PanelKind;c:V3;pts:V3[];placed:boolean;pop:number;popV:number;flash:number};

const PHI=(1+Math.sqrt(5))/2;
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};

/** The 32 panels: unit-sphere centres and curved outlines (each edge split in 4). Pentagons first. */
export function buildPanels():Panel[]{
 const V:V3[]=[];for(const a of [-1,1])for(const b of [-1,1]){V.push([0,a,b*PHI],[a,b*PHI,0],[b*PHI,0,a]);}
 const near=(i:number)=>V.map((_,j)=>j).filter(j=>j!==i&&Math.abs(Math.hypot(...sub(V[i],V[j]))-2)<1e-6);
 const ring=(centre:V3,pts:V3[])=>{const n=norm(centre),u=norm(cross(n,Math.abs(n[0])<.9?[1,0,0]:[0,1,0])),v=cross(n,u);
  return pts.slice().sort((p,q)=>Math.atan2(dot(sub(p,centre),v),dot(sub(p,centre),u))-Math.atan2(dot(sub(q,centre),v),dot(sub(q,centre),u)));};
 const curve=(pts:V3[])=>{const out:V3[]=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];for(let k=0;k<4;k++)out.push(norm(add(a,mul(sub(b,a),k/4))));}return out;};
 const third=(a:V3,b:V3)=>add(a,mul(sub(b,a),1/3));
 const panels:Panel[]=[];
 V.forEach((a,i)=>{const pts=ring(a,near(i).map(j=>third(a,V[j])));panels.push({kind:'pent',c:norm(a),pts:curve(pts),placed:false,pop:1,popV:0,flash:0});});
 for(let i=0;i<12;i++)for(const j of near(i))if(j>i)for(const k of near(j))if(k>j&&near(i).includes(k)){
  const a=V[i],b=V[j],c=V[k],centre=mul(add(add(a,b),c),1/3);
  const pts=ring(centre,[third(a,b),third(a,c),third(b,a),third(b,c),third(c,a),third(c,b)]);
  panels.push({kind:'hex',c:norm(centre),pts:curve(pts),placed:false,pop:1,popV:0,flash:0});}
 return panels;
}

// A rotation kept as a 3×3 matrix (rows), re-orthonormalised now and then.
type M3=[V3,V3,V3];
const rotAxis=(axis:V3,ang:number):M3=>{const [x,y,z]=norm(axis),c=Math.cos(ang),s=Math.sin(ang),t=1-c;
 return [[t*x*x+c,t*x*y-s*z,t*x*z+s*y],[t*x*y+s*z,t*y*y+c,t*y*z-s*x],[t*x*z-s*y,t*y*z+s*x,t*z*z+c]];};
const mm=(a:M3,b:M3):M3=>[0,1,2].map(i=>[0,1,2].map(j=>a[i][0]*b[0][j]+a[i][1]*b[1][j]+a[i][2]*b[2][j])) as M3;
const mv=(m:M3,v:V3):V3=>[dot(m[0],v),dot(m[1],v),dot(m[2],v)];
const ortho=(m:M3):M3=>{const x=norm(m[0]),y=norm(sub(m[1],mul(x,dot(x,m[1])))),z=cross(x,y);return [x,y,z];};

export type BenchCounts={pent:number;hex:number;total:number};
export type Bench={
 /** Pointer on the ball: returns true if it hit the ball (the bench then owns the gesture). */
 down(x:number,y:number):boolean;move(x:number,y:number):void;up():void;
 /** Keyboard turn. */
 nudge(dx:number,dy:number):void;
 /** A piece from the tray: start dragging it from (x,y) in screen-local px. */
 pieceDown(kind:PanelKind,x:number,y:number,fromX:number,fromY:number):void;pieceMove(x:number,y:number):void;pieceUp():void;
 /** Tap / keyboard: send a piece of this kind to the best gap. */
 place(kind:PanelKind,fromX:number,fromY:number):void;
 finish():void;reset():void;counts():BenchCounts;dispose():void;
};

const LIGHT=norm([-.5,.62,.6]);
export function createBench(canvas:HTMLCanvasElement,ghost:HTMLElement,opts:{reduced:boolean;coarse:boolean;tray:(k:PanelKind)=>{x:number;y:number};onChange:(c:BenchCounts,ev:{kind:'place'|'wrong'|'done'|'turn';panel?:PanelKind;need?:PanelKind})=>void}):Bench{
 const ctx=canvas.getContext('2d')!,reduced=opts.reduced;
 const panels=buildPanels();
 let R:M3=ortho(mm(rotAxis([1,0,0],.35),rotAxis([0,1,0],-.5)));
 let w=1,h=1,dpr=1,raf=0,last=0,disposed=false;
 let wx=0,wy=0;// angular velocity about the screen y (from horizontal drags) and x axes, rad/s
 let drag:{x:number;y:number;t:number;moved:number;vx:number;vy:number}|null=null;
 let turnTo:{c:V3;then?:()=>void}|null=null;
 let stagger:{queue:number[];t:number}|null=null,spinUp=0;
 // the flying piece: a spring-followed DOM element
 type Fly={kind:PanelKind;x:number;y:number;vx:number;vy:number;s:number;sv:number;tx:number;ty:number;ts:number;mode:'drag'|'home'|'to';target?:number;homeX:number;homeY:number;held:boolean};
 let fly:Fly|null=null;
 const geo=()=>{const r=Math.min(w*.4,h*.42);return {cx:Math.min(w*.42,w-r-86),cy:h*.52,r};};

 const resize=()=>{const b=canvas.getBoundingClientRect();w=Math.max(1,b.width);h=Math.max(1,b.height);dpr=Math.min(window.devicePixelRatio||1,opts.coarse?1.5:2);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);wake();};
 const ro=new ResizeObserver(resize);ro.observe(canvas);

 const counts=():BenchCounts=>{let p=0,x=0;for(const q of panels)if(q.placed){if(q.kind==='pent')p++;else x++;}return {pent:p,hex:x,total:p+x};};
 const view=(i:number)=>mv(R,panels[i].c);
 const project=(v:V3)=>{const g=geo();let x=v[0],y=v[1];if(v[2]<0){const l=Math.hypot(x,y)||1;x/=l;y/=l;}return {x:g.cx+x*g.r,y:g.cy-y*g.r};};

 /** Front-most gap/panel under a point (screen-local px). */
 function pick(x:number,y:number){let best=-1,bz=-2;
  for(let i=0;i<panels.length;i++){const c=view(i);if(c[2]<.12||c[2]<=bz)continue;
   const pts=panels[i].pts.map(p=>project(mv(R,p)));let inside=false;for(let a=0,b=pts.length-1;a<pts.length;b=a++){const pa=pts[a],pb=pts[b];if((pa.y>y)!==(pb.y>y)&&x<(pb.x-pa.x)*(y-pa.y)/(pb.y-pa.y)+pa.x)inside=!inside;}
   if(inside){best=i;bz=c[2];}}
  return best;}
 function onBall(x:number,y:number){const g=geo();return Math.hypot(x-g.cx,y-g.cy)<=g.r*1.04;}
 /** The empty gap of this kind that faces the viewer most. */
 function bestGap(kind:PanelKind){let best=-1,bz=-2;for(let i=0;i<panels.length;i++){const p=panels[i];if(p.placed||p.kind!==kind)continue;const z=view(i)[2];if(z>bz){bz=z;best=i;}}return {i:best,z:bz};}
 function nearestGap(kind:PanelKind,x:number,y:number){let best=-1,bd=Infinity;for(let i=0;i<panels.length;i++){const p=panels[i];if(p.placed||p.kind!==kind)continue;const c=view(i);if(c[2]<.15)continue;
  const q=project(c),d=Math.hypot(q.x-x,q.y-y);if(d<bd&&d<gapSize(i)*1.5){bd=d;best=i;}}return best;}
 function gapSize(i:number){const g=geo(),c=view(i);return g.r*(panels[i].kind==='pent'?.36:.42)*Math.max(.35,c[2]);}

 function commit(i:number){const p=panels[i];if(p.placed)return;p.placed=true;p.pop=reduced?1:0;p.popV=0;const c=counts();
  opts.onChange(c,{kind:c.total===32?'done':'place',panel:p.kind});if(c.total===32&&!reduced){spinUp=1;wy+=9;}wake();}

 function launch(kind:PanelKind,i:number,fromX:number,fromY:number){
  if(reduced){commit(i);return;}
  const t=project(view(i));fly={kind,x:fromX,y:fromY,vx:0,vy:0,s:1,sv:0,tx:t.x,ty:t.y,ts:gapSize(i)/30,mode:'to',target:i,homeX:fromX,homeY:fromY,held:false};showGhost();wake();}
 function sendTo(kind:PanelKind,fromX:number,fromY:number){const b=bestGap(kind);if(b.i<0)return;
  if(b.z>.55){launch(kind,b.i,fromX,fromY);return;}
  // nothing of that shape faces us: turn the ball to the gap first, then send the piece
  turnTo={c:panels[b.i].c,then:()=>launch(kind,b.i,fromX,fromY)};opts.onChange(counts(),{kind:'turn'});if(reduced){R=ortho(mm(rotAxis(cross(view(b.i),[0,.15,1]),Math.acos(Math.max(-1,Math.min(1,dot(view(b.i),norm([0,.15,1])))))),R));turnTo=null;launch(kind,b.i,fromX,fromY);}wake();}

 function showGhost(){if(!fly){ghost.style.opacity='0';return;}ghost.dataset.kind=fly.kind;ghost.style.opacity='1';placeGhost();}
 function placeGhost(){if(!fly)return;ghost.style.transform=`translate(${fly.x-30}px,${fly.y-30}px) scale(${fly.s}) rotate(${Math.max(-25,Math.min(25,fly.vx*.02))}deg)`;}

 // ---- loop ----
 function step(dt:number){let moving=false;
  if(!drag&&(wx||wy)){const sp=Math.hypot(wx,wy);if(sp>1e-3){R=ortho(mm(rotAxis([wx/sp,wy/sp,0],sp*dt),R));}
   const f=Math.exp(-dt*(spinUp?1.1:2.6));wx*=f;wy*=f;if(Math.hypot(wx,wy)<.03){wx=wy=0;spinUp=0;}else moving=true;}
  if(turnTo){const c=norm(mv(R,turnTo.c)),f=norm([0,.15,1] as V3),ax=cross(c,f),s=Math.hypot(...ax),ang=Math.atan2(s,dot(c,f));
   if(ang<.02){const t=turnTo;turnTo=null;t.then?.();}else{R=ortho(mm(rotAxis(s>1e-6?ax:[0,1,0],ang*Math.min(1,dt*7)),R));moving=true;}}
  for(const p of panels){if(p.pop<1||p.popV){p.popV+=(260*(1-p.pop)-15*p.popV)*dt;p.pop+=p.popV*dt;if(Math.abs(1-p.pop)<.002&&Math.abs(p.popV)<.02){p.pop=1;p.popV=0;}else moving=true;}
   if(p.flash>0){p.flash=Math.max(0,p.flash-dt*2.2);moving=true;}}
  if(stagger){stagger.t-=dt;while(stagger.t<=0&&stagger.queue.length){commit(stagger.queue.shift()!);stagger.t+=.055;}if(!stagger.queue.length)stagger=null;moving=true;}
  if(fly){const f=fly;if(f.mode==='to'&&f.target!=null){const t=project(view(f.target));f.tx=t.x;f.ty=t.y;f.ts=gapSize(f.target)/30;}
   const k=f.mode==='drag'?900:f.mode==='to'?320:260,c=f.mode==='drag'?2*Math.sqrt(900)*.85:2*Math.sqrt(k)*.75;
   f.vx+=(k*(f.tx-f.x)-c*f.vx)*dt;f.vy+=(k*(f.ty-f.y)-c*f.vy)*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.sv+=(300*(f.ts-f.s)-28*f.sv)*dt;f.s+=f.sv*dt;placeGhost();
   const near=Math.hypot(f.tx-f.x,f.ty-f.y)<2.5&&Math.hypot(f.vx,f.vy)<60;
   if(f.mode==='to'&&near){const i=f.target!;fly=null;showGhost();commit(i);}
   else if(f.mode==='home'&&near){fly=null;showGhost();}
   else moving=true;}
  return moving||!!drag;}

 function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const g=geo();
  // studio backdrop: a soft spotlight on a dark cyclorama
  const bg=ctx.createRadialGradient(g.cx,g.cy,g.r*.4,g.cx,g.cy,Math.max(w,h)*.8);bg.addColorStop(0,'#5d6266');bg.addColorStop(1,'#1d2022');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(g.cx,g.cy+g.r*1.02);ctx.scale(1,.16);const sh=ctx.createRadialGradient(0,0,0,0,0,g.r*.9);sh.addColorStop(0,'rgba(0,0,0,.55)');sh.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sh;ctx.beginPath();ctx.arc(0,0,g.r*.9,0,Math.PI*2);ctx.fill();ctx.restore();
  // the bare bladder
  ctx.beginPath();ctx.arc(g.cx,g.cy,g.r,0,Math.PI*2);ctx.fillStyle='#4a4641';ctx.fill();
  const order=panels.map((_,i)=>i).map(i=>({i,z:view(i)[2]})).filter(o=>o.z>-.3).sort((a,b)=>a.z-b.z);
  ctx.lineJoin='round';
  for(const {i,z} of order){const p=panels[i],n=view(i);const pts=p.pts.map(q=>project(mv(R,q)));const c=project(n);
   const lit=Math.max(0,dot(n,LIGHT)),shade=.5+.5*lit;
   ctx.save();
   if(p.placed&&p.pop!==1){const s=1+(1-p.pop)*.45;ctx.translate(c.x,c.y);ctx.scale(s,s);ctx.translate(-c.x,-c.y);ctx.globalAlpha=Math.max(0,Math.min(1,p.pop*1.6));}
   ctx.beginPath();pts.forEach((q,k)=>k?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();
   if(p.placed){const v=p.kind==='pent'?8+30*shade:165+90*shade;ctx.fillStyle=`rgb(${v|0},${v|0},${(v+(p.kind==='pent'?2:0))|0})`;ctx.fill();
    ctx.strokeStyle=p.kind==='pent'?'rgba(0,0,0,.9)':'rgba(40,40,40,.55)';ctx.lineWidth=Math.max(1,g.r*.012);ctx.stroke();
    // the stitches: short dashes just inside the seam
    if(z>.2&&g.r>60){ctx.setLineDash([g.r*.018,g.r*.02]);ctx.strokeStyle=p.kind==='pent'?'rgba(200,200,200,.35)':'rgba(30,30,30,.4)';ctx.lineWidth=Math.max(.8,g.r*.006);ctx.save();ctx.translate(c.x,c.y);ctx.scale(.9,.9);ctx.translate(-c.x,-c.y);ctx.stroke();ctx.restore();ctx.setLineDash([]);}}
   else{const v=58+44*shade;ctx.fillStyle=`rgb(${v|0},${(v*.95)|0},${(v*.88)|0})`;ctx.fill();// the bare rubber bladder
    ctx.setLineDash([3,4]);ctx.strokeStyle=fly&&fly.mode!=='home'&&fly.kind===p.kind&&z>.12?'rgba(255,214,120,.95)':'rgba(205,200,190,.55)';ctx.lineWidth=fly&&fly.kind===p.kind&&z>.12?2:1.2;ctx.stroke();ctx.setLineDash([]);
    if(p.flash>0){ctx.fillStyle=`rgba(255,80,60,${p.flash*.55})`;ctx.fill();}}
   ctx.restore();}
  // studio light: a highlight at the upper left and a darker rim
  const hl=ctx.createRadialGradient(g.cx-g.r*.38,g.cy-g.r*.42,0,g.cx-g.r*.38,g.cy-g.r*.42,g.r*.9);hl.addColorStop(0,'rgba(255,255,255,.28)');hl.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=hl;ctx.beginPath();ctx.arc(g.cx,g.cy,g.r,0,Math.PI*2);ctx.fill();
  const rim=ctx.createRadialGradient(g.cx,g.cy,g.r*.75,g.cx,g.cy,g.r);rim.addColorStop(0,'rgba(0,0,0,0)');rim.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=rim;ctx.fill();}

 function frame(t:number){raf=0;if(disposed)return;const dt=Math.min(.05,last?(t-last)/1000:1/60);last=t;const moving=step(dt);draw();if(moving&&!document.hidden)raf=requestAnimationFrame(frame);else last=0;}
 function wake(){if(disposed)return;if(!raf&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}}
 const vis=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();};
 document.addEventListener('visibilitychange',vis);
 resize();

 const trackK=()=>2.4/Math.max(60,geo().r*2);
 return {
  down(x,y){if(!onBall(x,y))return false;wx=wy=0;turnTo=null;drag={x,y,t:performance.now(),moved:0,vx:0,vy:0};wake();return true;},
  move(x,y){const d=drag;if(!d)return;const dx=x-d.x,dy=y-d.y,now=performance.now(),dt=Math.max(8,now-d.t)/1000,k=trackK();
   d.moved+=Math.hypot(dx,dy);d.vx=d.vx*.4+dx/dt*.6;d.vy=d.vy*.4+dy/dt*.6;d.x=x;d.y=y;d.t=now;
   if(dx)R=ortho(mm(rotAxis([0,1,0],dx*k),R));if(dy)R=ortho(mm(rotAxis([1,0,0],dy*k),R));wake();},
  up(){const d=drag;if(!d)return;drag=null;
   if(d.moved<8){// a tap: send the right piece into the gap under the finger
    const i=pick(d.x,d.y);if(i>=0&&!panels[i].placed){const t=opts.tray(panels[i].kind);launch(panels[i].kind,i,t.x,t.y);}}
   else if(!reduced&&performance.now()-d.t<90){const k=trackK();wy=d.vx*k;wx=d.vy*k;const sp=Math.hypot(wx,wy);if(sp>14){wx*=14/sp;wy*=14/sp;}}
   wake();},
  nudge(dx,dy){turnTo=null;if(reduced){R=ortho(mm(rotAxis([0,1,0],dx*.35),R));R=ortho(mm(rotAxis([1,0,0],dy*.35),R));}else{wy+=dx*2.2;wx+=dy*2.2;}wake();},
  pieceDown(kind,x,y,fromX,fromY){fly={kind,x:fromX,y:fromY,vx:0,vy:0,s:1,sv:0,tx:x,ty:y,ts:1.05,mode:'drag',homeX:fromX,homeY:fromY,held:true};showGhost();wake();},
  pieceMove(x,y){if(!fly||fly.mode!=='drag')return;fly.tx=x;fly.ty=y;if(reduced){fly.x=x;fly.y=y;placeGhost();}wake();},
  pieceUp(){const f=fly;if(!f||f.mode!=='drag')return;
   const under=onBall(f.tx,f.ty)?pick(f.tx,f.ty):-1,snap=onBall(f.tx,f.ty)?nearestGap(f.kind,f.tx,f.ty):-1;
   // forgiving for small fingers: the right-shaped gap under the piece, or the nearest right-shaped gap close by
   const i=under>=0&&!panels[under].placed&&panels[under].kind===f.kind?under:snap>=0?snap:under;
   if(i>=0&&!panels[i].placed&&panels[i].kind===f.kind){f.mode='to';f.target=i;if(reduced){fly=null;showGhost();commit(i);}}
   else{if(i>=0&&!panels[i].placed){panels[i].flash=1;opts.onChange(counts(),{kind:'wrong',panel:f.kind,need:panels[i].kind});}
    f.mode='home';f.tx=f.homeX;f.ty=f.homeY;f.ts=1;if(reduced){fly=null;showGhost();}}
   wake();},
  place(kind,fromX,fromY){if(fly||stagger)return;sendTo(kind,fromX,fromY);},
  finish(){if(stagger)return;const left=panels.map((p,i)=>({p,i})).filter(o=>!o.p.placed).map(o=>o.i);
   if(reduced){for(const i of left)commit(i);return;}
   // front-facing gaps first, so the visitor sees them land; the ball turns while the rest go in
   left.sort((a,b)=>view(b)[2]-view(a)[2]);stagger={queue:left,t:0};wy+=3.2;wake();},
  reset(){for(const p of panels){p.placed=false;p.pop=1;p.popV=0;p.flash=0;}stagger=null;fly=null;showGhost();wake();},
  counts,
  dispose(){disposed=true;cancelAnimationFrame(raf);raf=0;ro.disconnect();document.removeEventListener('visibilitychange',vis);canvas.width=canvas.height=0;},
 };
}
