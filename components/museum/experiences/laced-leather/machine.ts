import {LEATHER,SIZES,type SizeId} from './facts';
import {clearBallCache,leatherSprite,modernSprite} from './ballRender';
/**
 * The Weather Machine renderer (Canvas 2D). Two scenes share one canvas:
 *  - 'scale': a lightbox with a sprinkler pipe; a spring dial scale holds a laced leather ball in a string net. Rain soaks it:
 *    it darkens, turns glossy, beads with water, drips into the tray, and the needle swings from the lab's dry weight (410 g)
 *    to its soaked weight (595 g). The moment it is full, a "+185 g" tag pops beside the dial.
 *  - 'balance': a brass beam balance, leather ball (dry or soaked) on the left, a modern size 5 / 4 / 3 on the right, drawn
 *    to scale, with museum labels under the pans.
 * Both balls are per-pixel shaded sprites (ballRender.ts) cached by size and wetness, so a frame is a few drawImage calls.
 * Rain falls in three depth layers (far drops pass behind the ball, near ones splash on it); with reduced motion the rain is
 * a still curtain and every spring snaps.
 * Heat: the rAF loop runs only while something moves (springs, rain, drips, fades) and sleeps when settled; it stops when the
 * tab is hidden and on dispose. Pixel ratio ≤ 1.5 on coarse pointers (≤ 2 otherwise). Bounded particle pool.
 */
export type MachineInput={scene:'scale'|'balance';hung:boolean;raining:boolean;leftWet:boolean;right:SizeId;hint:string};
export type Machine={set:(s:Partial<MachineInput>)=>void;dry:()=>void;hit:(x:number,y:number)=>'ball'|'left'|'right'|null;dispose:()=>void};
type P={x:number;y:number;vx:number;vy:number;life:number;kind:0|1|2|3;z:number};// 0 rain, 1 splash, 2 drip, 3 ripple

const SOAK_SECONDS=6;// held rain → full soak (stands for the lab's 90 minutes underwater)
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const clamp=(v:number,a=0,b=1)=>v<a?a:v>b?b:v;
const SANS='ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',SERIF='Georgia,"Times New Roman",Times,serif';

export function createWeatherMachine(canvas:HTMLCanvasElement,opts:{reduced:boolean;coarse:boolean;onSoak:(s:number)=>void}):Machine{
 const ctx=canvas.getContext('2d')!;
 const input:MachineInput={scene:'scale',hung:false,raining:false,leftWet:false,right:'5',hint:''};
 let w=1,h=1,dpr=1,raf=0,last=0,disposed=false;
 let soak=0,reported=-1,dripT=0,spawn=0;
 const parts:P[]=[];
 // Springs: [value, velocity]
 const needle=[0,0],beam=[0,0],hang=[0,0],swing=[0,0],badge=[0,0];
 let sceneMix=0,leftWet=0,rightR=1,rainMix=0,hintMix=0,shownHint='';

 const resize=()=>{const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(window.devicePixelRatio||1,opts.coarse?1.5:2);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);wake(true);};
 const ro=new ResizeObserver(resize);ro.observe(canvas);

 // ---- layout ----
 // The shared Back sits fixed in the top-left corner (76×44 at 24,20; at 16,16 on phones/touch). The lightbox keeps clear
 // of it: below it on tall stages, beside it (a left rail) on short landscape ones, where height is the scarce thing.
 const box=()=>{const phone=opts.coarse||innerWidth<=600,pad=Math.max(12,Math.min(w,h)*.04),backR=phone?92:100,backB=phone?60:64;
  const r=canvas.getBoundingClientRect(),offX=r.left,offY=r.top;// the Back is placed in the viewport, the canvas may not start at 0,0
  if(h<520&&w>h*1.05&&innerWidth>innerHeight){const x=Math.max(pad,backR+12-offX);return {x,y:pad,w:w-x-pad,h:h-pad*2};}
  const y=Math.max(pad,backB+12-offY);return {x:pad,y,w:w-pad*2,h:h-y-pad};};
 const scaleLayout=()=>{const b=box(),cx=b.x+b.w/2,m=Math.min(b.w,b.h);const dialR=Math.max(30,Math.min(m*.16,b.h*.135)),pipeY=b.y+Math.max(14,b.h*.06);
  const dialY=pipeY+dialR+Math.max(12,b.h*.055);const ballR=Math.max(26,Math.min(b.w*.22,b.h*.165));const hookY=dialY+dialR+10;
  const ballY=hookY+ballR+Math.max(14,b.h*.07);const trayY=b.y+b.h-Math.max(12,b.h*.05);const standY=trayY-ballR-Math.max(8,ballR*.22);
  return {b,cx,dialR,dialY,pipeY,ballR,hookY,ballY,trayY,standY};};
 const balanceLayout=()=>{const b=box(),cx=b.x+b.w/2,R5=Math.max(22,Math.min(b.w*.13,b.h*.15));const bl=Math.max(b.w*.2,Math.min(b.w/2-R5*1.5-14,b.h*.95));
  const pivotY=b.y+b.h*.25,hangLen=b.h*.33;return {b,cx,R5,bl,pivotY,hangLen,floorY:b.y+b.h-Math.max(12,b.h*.04)};};

 // ---- targets ----
 const gramsTarget=()=>input.hung?LEATHER.dry+(LEATHER.wet-LEATHER.dry)*soak:0;
 const angleOf=(g:number)=>(-135+g/700*270)*Math.PI/180;
 const beamTarget=()=>{const L=input.leftWet?LEATHER.wet:LEATHER.dry,s=SIZES[input.right],R=(s.minG+s.maxG)/2;return -Math.max(-1,Math.min(1,(L-R)/300))*.22;};// heavier side sinks

 function spring(s:number[],t:number,k:number,c:number,dt:number){if(opts.reduced){s[0]=t;s[1]=0;return;}s[1]+=(k*(t-s[0])-c*s[1])*dt;s[0]+=s[1]*dt;if(Math.abs(t-s[0])<4e-4&&Math.abs(s[1])<4e-3){s[0]=t;s[1]=0;}}
 const settled=(s:number[],t:number)=>s[0]===t&&s[1]===0;
 const toward=(v:number,t:number,r:number,dt:number)=>opts.reduced?t:Math.abs(t-v)<1e-3?t:v+(t-v)*Math.min(1,dt*r);

 const ballPos=(L:ReturnType<typeof scaleLayout>)=>{const len=L.ballY-L.hookY;const stretch=needleGrams()/700*Math.min(10,L.dialR*.2);
  const y=lerp(L.standY,L.ballY+stretch,hang[0]);return {x:L.cx+Math.sin(swing[0])*len*hang[0],y:y-(1-Math.cos(swing[0]))*len};};
 const needleGrams=()=>Math.max(0,(needle[0]*180/Math.PI+135)/270*700);

 function step(dt:number){
  const L=scaleLayout();
  const wasFull=soak>=1;
  if(input.raining&&input.hung&&input.scene==='scale'){soak=Math.min(1,soak+dt/SOAK_SECONDS);dripT=3.5;}
  else dripT=Math.max(0,dripT-dt);
  if(!wasFull&&soak>=1&&!opts.reduced){// the satisfying moment: the full ball shrugs off a ring of spray
   const bp0=ballPos(L);for(let i=0;i<28&&parts.length<260;i++){const a=i/28*Math.PI*2;parts.push({x:bp0.x+Math.cos(a)*L.ballR,y:bp0.y+Math.sin(a)*L.ballR,vx:Math.cos(a)*(120+Math.random()*80),vy:Math.sin(a)*(120+Math.random()*80)-140,life:1,kind:1,z:1});}
   swing[1]+=.35;}
  if(Math.abs(soak-reported)>=.02||(soak===1&&reported!==1)||(soak===0&&reported!==0)){reported=soak;opts.onSoak(soak);}
  spring(needle,angleOf(gramsTarget()),55,7,dt);
  spring(hang,input.hung?1:0,40,11,dt);
  if(input.scene==='balance'&&sceneMix>.99){swing[0]=swing[1]=0;}else spring(swing,0,9,2.2,dt);
  spring(beam,beamTarget(),26,5,dt);
  spring(badge,soak>=1&&input.hung?1:0,140,11,dt);
  sceneMix=toward(sceneMix,input.scene==='balance'?1:0,5,dt);
  leftWet=toward(leftWet,input.leftWet?1:0,4,dt);
  rightR=toward(rightR,SIZES[input.right].cm/SIZES['5'].cm,8,dt);
  rainMix=toward(rainMix,input.raining&&input.scene==='scale'?1:0,7,dt);
  // hint: fade the old one out before the new one fades in
  if(input.hint!==shownHint){hintMix=toward(hintMix,0,9,dt);if(hintMix===0)shownHint=input.hint;}else hintMix=toward(hintMix,shownHint?1:0,4,dt);
  // particles (motion only; reduced motion shows a still curtain instead)
  const bp=ballPos(L);
  if(input.scene==='scale'&&sceneMix<.5&&!opts.reduced){
   if(input.raining){spawn+=dt*(opts.coarse?80:120);while(spawn>=1&&parts.length<260){spawn--;const z=Math.random();parts.push({x:L.b.x+6+Math.random()*(L.b.w-12),y:L.pipeY+8,vx:28+z*22,vy:380+z*320+Math.random()*60,life:1,kind:0,z});}}
   if(dripT>0&&soak>.15&&input.hung&&Math.random()<dt*(2+soak*6)){parts.push({x:bp.x+(Math.random()-.5)*L.ballR*.4,y:bp.y+L.ballR*.97,vx:0,vy:30,life:1,kind:2,z:1});}
  }
  const waterY=L.trayY-7;
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];
   if(p.kind===1){p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*2.6;}
   else if(p.kind===3){p.life-=dt*1.6;}
   else if(p.kind===2){p.vy+=900*dt;p.y+=p.vy*dt;if(p.y>=waterY){p.life=0;if(parts.length<260)parts.push({x:p.x,y:waterY+1,vx:0,vy:0,life:1,kind:3,z:1});}}
   else{p.x+=p.vx*dt;p.y+=p.vy*dt;const dx=p.x-bp.x,dy=p.y-bp.y;
    if(p.z>=.45&&input.hung&&dx*dx+dy*dy<L.ballR*L.ballR&&dy<0){p.life=0;if(Math.random()<.6&&parts.length<260)parts.push({x:p.x,y:p.y,vx:dx/L.ballR*90+(Math.random()-.5)*70,vy:-90-Math.random()*90,life:1,kind:1,z:1});}
    else if(p.y>=waterY){p.life=0;if(Math.abs(p.x-L.cx)<L.b.w*.3&&Math.random()<.18&&parts.length<260)parts.push({x:p.x,y:waterY+1,vx:0,vy:0,life:.7,kind:3,z:p.z});}}
   if(p.life<=0)parts.splice(i,1);}
  return !settled(needle,angleOf(gramsTarget()))||!settled(hang,input.hung?1:0)||!settled(swing,0)||!settled(beam,beamTarget())||!settled(badge,soak>=1&&input.hung?1:0)
   ||parts.length>0||input.raining||dripT>0||rainMix!==(input.raining&&input.scene==='scale'?1:0)||hintMix!==(shownHint?1:0)||input.hint!==shownHint
   ||sceneMix!==(input.scene==='balance'?1:0)||leftWet!==(input.leftWet?1:0)||rightR!==SIZES[input.right].cm/SIZES['5'].cm;
 }

 // ---- drawing helpers ----
 const rr=(x:number,y:number,ww:number,hh:number,r:number)=>{ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,ww,hh,r);else ctx.rect(x,y,ww,hh);};
 function text(t:string,x:number,y:number,size:number,color:string,weight=700,align:CanvasTextAlign='center',font=SANS){ctx.font=`${weight} ${size}px ${font}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(t,x,y);}
 /** A soft round shadow (radial gradient, no blur filters: cheap and Safari-safe). */
 function shadow(x:number,y:number,rx:number,ry:number,a:number){if(a<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);const g=ctx.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(28,40,56,${a})`);g.addColorStop(1,'rgba(28,40,56,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();}
 function metal(x0:number,y0:number,x1:number,y1:number,stops:[number,string][]){const g=ctx.createLinearGradient(x0,y0,x1,y1);for(const [o,c] of stops)g.addColorStop(o,c);return g;}
 const STEEL:[number,string][]=[[0,'#5d636c'],[.35,'#c9ced5'],[.55,'#8d949e'],[1,'#3d424a']];
 const BRASS:[number,string][]=[[0,'#7a5a22'],[.3,'#e8c77a'],[.55,'#b48a3c'],[1,'#5c4217']];

 function lightbox(){const b=box();
  ctx.save();ctx.shadowColor='rgba(170,210,255,.28)';ctx.shadowBlur=36;ctx.fillStyle='#eef3f6';rr(b.x,b.y,b.w,b.h,16);ctx.fill();ctx.restore();
  ctx.save();rr(b.x,b.y,b.w,b.h,16);ctx.clip();
  const g=ctx.createRadialGradient(b.x+b.w*.42,b.y+b.h*.38,10,b.x+b.w/2,b.y+b.h*.45,Math.max(b.w,b.h)*.75);g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#eaeff3');g.addColorStop(1,'#cdd6de');ctx.fillStyle=g;ctx.fillRect(b.x,b.y,b.w,b.h);
  // measuring grid, every fifth line a little stronger (it's a lab)
  const step=Math.max(14,Math.min(b.w,b.h)/20);ctx.lineWidth=1;
  for(const strong of [false,true]){ctx.strokeStyle=strong?'rgba(60,90,120,.11)':'rgba(60,90,120,.05)';ctx.beginPath();
   for(let i=1;b.x+i*step<b.x+b.w;i++)if((i%5===0)===strong){const x=Math.round(b.x+i*step)+.5;ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.h);}
   for(let i=1;b.y+i*step<b.y+b.h;i++)if((i%5===0)===strong){const y=Math.round(b.y+i*step)+.5;ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.w,y);}ctx.stroke();}
  // a bench along the bottom
  const fy=b.y+b.h*.9;const fg=ctx.createLinearGradient(0,fy,0,b.y+b.h);fg.addColorStop(0,'rgba(150,165,180,.0)');fg.addColorStop(.25,'rgba(150,165,180,.22)');fg.addColorStop(1,'rgba(120,135,150,.38)');ctx.fillStyle=fg;ctx.fillRect(b.x,fy,b.w,b.y+b.h-fy);
  ctx.restore();
  // inner edge: a thin glass bevel
  ctx.save();rr(b.x+.5,b.y+.5,b.w-1,b.h-1,16);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.stroke();ctx.restore();
  return b;}

 function rain(L:ReturnType<typeof scaleLayout>,near:boolean){
  if(opts.reduced){if(!near||rainMix<=0)return;// a still curtain of rain
   ctx.save();ctx.globalAlpha*=rainMix;ctx.strokeStyle='rgba(70,130,200,.32)';ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();
   for(let i=0;i<70;i++){const x=L.b.x+8+((i*97)%101)/101*(L.b.w-16),y=L.pipeY+12+((i*53)%89)/89*(L.trayY-L.pipeY-40);ctx.moveTo(x,y);ctx.lineTo(x+2,y+16);}ctx.stroke();ctx.restore();return;}
  // three depth layers: thin pale far drops, brighter near ones; each streak is a faint tail and a bright head
  const layers=near?[[.45,.75],[.75,1.01]]:[[0,.45]];
  ctx.save();ctx.lineCap='round';
  for(const [z0,z1] of layers){const zm=(z0+z1)/2,len=12+zm*26,wid=.7+zm*1.5;
   ctx.strokeStyle=`rgba(88,140,205,${.12+zm*.22})`;ctx.lineWidth=wid;ctx.beginPath();
   for(const p of parts)if(p.kind===0&&p.z>=z0&&p.z<z1){const k=len/p.vy;ctx.moveTo(p.x-p.vx*k,p.y-len);ctx.lineTo(p.x,p.y);}ctx.stroke();
   ctx.strokeStyle=`rgba(62,118,190,${.3+zm*.45})`;ctx.lineWidth=wid*1.25;ctx.beginPath();
   for(const p of parts)if(p.kind===0&&p.z>=z0&&p.z<z1){const k=len*.3/p.vy;ctx.moveTo(p.x-p.vx*k,p.y-len*.3);ctx.lineTo(p.x,p.y);}ctx.stroke();}
  if(near){ctx.fillStyle='rgba(70,130,200,.75)';for(const p of parts){if(p.kind===1){ctx.globalAlpha=clamp(p.life);ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.fill();}
    else if(p.kind===2){ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(p.x,p.y-4.5);ctx.quadraticCurveTo(p.x+2.6,p.y+.5,p.x,p.y+2.4);ctx.quadraticCurveTo(p.x-2.6,p.y+.5,p.x,p.y-4.5);ctx.fill();}}
   ctx.globalAlpha=1;ctx.lineWidth=1;for(const p of parts)if(p.kind===3){const t=1-p.life,rx=3+t*16;ctx.strokeStyle=`rgba(60,110,175,${p.life*.55})`;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,rx*.28,0,0,Math.PI*2);ctx.stroke();}}
  ctx.restore();}

 function dial(L:ReturnType<typeof scaleLayout>){const {cx,dialY:y,dialR:R}=L;
  // ring + rod up to the pipe
  ctx.strokeStyle=metal(cx-3,0,cx+3,0,STEEL);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,L.pipeY+6);ctx.lineTo(cx,y-R-10);ctx.stroke();
  ctx.lineWidth=2.5;ctx.strokeStyle='#5d636c';ctx.beginPath();ctx.arc(cx,y-R-6,5,0,Math.PI*2);ctx.stroke();
  shadow(cx+R*.18,y+R*.22,R*1.35,R*1.2,.16);
  // bezel: a brass ring lit from the upper left
  ctx.beginPath();ctx.arc(cx,y,R+R*.13,0,Math.PI*2);ctx.fillStyle=metal(cx-R,y-R,cx+R,y+R,BRASS);ctx.fill();
  ctx.beginPath();ctx.arc(cx,y,R+R*.04,0,Math.PI*2);ctx.fillStyle=metal(cx+R,y+R,cx-R,y-R,BRASS);ctx.fill();
  // face
  ctx.beginPath();ctx.arc(cx,y,R,0,Math.PI*2);const fg=ctx.createRadialGradient(cx-R*.2,y-R*.25,R*.1,cx,y,R);fg.addColorStop(0,'#fffdf7');fg.addColorStop(.8,'#f6efdf');fg.addColorStop(1,'#e2d6bd');ctx.fillStyle=fg;ctx.fill();
  const band=(g0:number,g1:number,color:string,wid:number)=>{ctx.strokeStyle=color;ctx.lineWidth=wid;ctx.beginPath();ctx.arc(cx,y,R*.84,angleOf(g0)-Math.PI/2,angleOf(g1)-Math.PI/2);ctx.stroke();};
  const bw=Math.max(3,R*.1);band(410,450,'rgba(46,150,96,.75)',bw);// today's size 5 range
  if(input.hung)band(LEATHER.dry-3,LEATHER.dry+3,'#c78a2c',bw*1.3);if(soak>=1)band(LEATHER.wet-3,LEATHER.wet+3,'#2f6fd0',bw*1.3);
  // ticks: 10 g, 50 g, 100 g
  ctx.strokeStyle='#2b2f36';ctx.lineCap='butt';const fine=R>70?10:50;
  for(let g=0;g<=700;g+=fine){const a=angleOf(g)-Math.PI/2,big=g%100===0,mid=g%50===0,r1=R*(big?.72:mid?.8:.86),r2=R*.92;ctx.lineWidth=big?Math.max(1.4,R*.022):mid?1:.6;
   ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,y+Math.sin(a)*r1);ctx.lineTo(cx+Math.cos(a)*r2,y+Math.sin(a)*r2);ctx.stroke();
   if(big&&(R>58||g%200===0))text(String(g),cx+Math.cos(a)*R*.56,y+Math.sin(a)*R*.56,Math.max(9,R*.13),'#2b2f36',700,'center',SERIF);}
  // live reading in a little window, and the maker's line
  const live=Math.round(needleGrams()/5)*5;
  // live reading in a little window in the empty bottom sector, and the unit above the hub on big dials
  const ww=R*.5,wh=Math.max(13,R*.22),wy=y+R*.5;rr(cx-ww/2,wy,ww,wh,Math.max(2,R*.05));ctx.fillStyle='#1f2228';ctx.fill();
  text(input.hung?`${live} g`:'0 g',cx,wy+wh/2+.5,Math.max(9,Math.min(wh*.66,R*.15)),'#f3e7c9',700,'center',SERIF);
  if(R>=64)text('GRAMS',cx,y-R*.26,Math.max(7,R*.085),'#8a7f6b',800);
  // needle: tapered, with a cast shadow
  const na=needle[0]-Math.PI/2,ca=Math.cos(na),sa=Math.sin(na),tip=R*.86,tail=R*.18,wd=Math.max(1.6,R*.04);
  const needlePath=(ox:number,oy:number)=>{ctx.beginPath();ctx.moveTo(cx+ox+ca*tip,y+oy+sa*tip);ctx.lineTo(cx+ox-sa*wd,y+oy+ca*wd);ctx.lineTo(cx+ox-ca*tail,y+oy-sa*tail);ctx.lineTo(cx+ox+sa*wd,y+oy-ca*wd);ctx.closePath();};
  needlePath(R*.025,R*.035);ctx.fillStyle='rgba(30,20,10,.22)';ctx.fill();needlePath(0,0);ctx.fillStyle='#c4312b';ctx.fill();
  ctx.beginPath();ctx.arc(cx,y,R*.085,0,Math.PI*2);ctx.fillStyle=metal(cx-R*.08,y-R*.08,cx+R*.08,y+R*.08,BRASS);ctx.fill();
  // glass: one soft sheen from the light side
  ctx.save();ctx.beginPath();ctx.arc(cx,y,R,0,Math.PI*2);ctx.clip();const sg=ctx.createLinearGradient(cx-R,y-R,cx+R*.2,y+R*.2);sg.addColorStop(0,'rgba(255,255,255,.5)');sg.addColorStop(.45,'rgba(255,255,255,.08)');sg.addColorStop(.46,'rgba(255,255,255,0)');ctx.fillStyle=sg;ctx.fillRect(cx-R,y-R,R*2,R*2);ctx.restore();
  // the "+185 g" tag when it's full
  const s=badge[0];if(s>.01){const bx=cx+R*1.22,by=y-R*.62,fs=Math.max(12,Math.min(20,R*.22));ctx.save();ctx.translate(bx,by);ctx.scale(s,s);ctx.font=`800 ${fs}px ${SANS}`;
   const tw=ctx.measureText(`+${LEATHER.wet-LEATHER.dry} g`).width+fs*1.2,th=fs*1.9;let ox=0;const right=L.b.x+L.b.w-8;if(bx+tw>right)ox=right-(bx+tw);
   rr(ox,-th/2,tw,th,th/2);ctx.fillStyle='#2f6fd0';ctx.fill();text(`+${LEATHER.wet-LEATHER.dry} g`,ox+tw/2,1,fs,'#ffffff',800);ctx.restore();}
 }

 function net(x:number,y:number,r:number,hookX:number,hookY:number,a:number){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle='rgba(70,52,30,.8)';ctx.lineWidth=Math.max(1,r*.02);ctx.lineCap='round';
  // a string net: four cords from the hook to a top ring, then strings that hug the ball down to a knot underneath
  const top=y-r*.72,ring=r*.66,ks=[-.75,-.25,.25,.75];
  ctx.beginPath();for(const k of ks){ctx.moveTo(hookX,hookY);ctx.lineTo(x+k*ring,top+Math.abs(k)*r*.04);}ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,top,ring,r*.12,0,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();for(const k of ks){const sx=x+k*ring,ex=x+k*r*.08;ctx.moveTo(sx,top+r*.06);ctx.bezierCurveTo(x+k*r*1.32,y-r*.1,x+k*r*.95,y+r*.82,ex,y+r*.995);}ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,y+r*.12,r*.995,r*.2,0,.08,Math.PI-.08);ctx.stroke();
  ctx.beginPath();ctx.arc(x,y+r*.99,Math.max(1.5,r*.04),0,Math.PI*2);ctx.fillStyle='rgba(70,52,30,.9)';ctx.fill();
  ctx.restore();}

 function hint(b:{x:number;y:number;w:number;h:number}){if(hintMix<=0||!shownHint)return;const fs=Math.max(13,Math.min(16,b.w/26));ctx.save();ctx.globalAlpha*=hintMix;ctx.font=`700 ${fs}px ${SANS}`;
  const tw=Math.min(b.w-24,ctx.measureText(shownHint).width+fs*2.2),th=fs*2.4,x=b.x+b.w/2-tw/2,y=input.scene==='balance'?b.y+12-(1-hintMix)*6:b.y+b.h-th-12+(1-hintMix)*6;
  rr(x,y,tw,th,th/2);ctx.fillStyle='rgba(28,26,23,.86)';ctx.fill();text(shownHint,x+tw/2,y+th/2+.5,fs,'#f3ede1',700);ctx.restore();}

 function drawScale(alpha:number){if(alpha<=0)return;const L=scaleLayout(),{b,cx}=L;ctx.save();ctx.globalAlpha=alpha;
  const bp=ballPos(L),tw=Math.min(b.w*.7,L.ballR*4.2),tx=cx-tw/2,ty=L.trayY;
  // tray (back lip + water)
  shadow(cx,ty+3,tw*.56,7,.22);
  ctx.fillStyle='#9aa5b0';rr(tx,ty-10,tw,10,4);ctx.fill();
  if(soak>0){const lvl=Math.min(7,1+soak*6);const wg=ctx.createLinearGradient(0,ty-lvl-2,0,ty);wg.addColorStop(0,'rgba(140,190,235,.9)');wg.addColorStop(1,'rgba(60,120,190,.75)');ctx.fillStyle=wg;ctx.fillRect(tx+3,ty-lvl-2,tw-6,lvl);}
  // the ball's shadows: on the wall behind (light from the upper left) and on whatever is under it
  shadow(bp.x+L.ballR*.42,bp.y+L.ballR*.3,L.ballR*1.25,L.ballR*1.1,.12);
  const gap=(L.trayY-10)-(bp.y+L.ballR);shadow(bp.x+L.ballR*.12,L.trayY-8,L.ballR*(.8+clamp(gap/200)*.5),L.ballR*.12,.3*(1-clamp(gap/260))*(1-hang[0]*.4)+.06);
  rain(L,false);
  // sprinkler pipe with nozzles; a mist cone under each while it rains
  const pg=metal(0,L.pipeY-6,0,L.pipeY+6,STEEL);ctx.fillStyle=pg;rr(b.x+6,L.pipeY-6,b.w-12,12,6);ctx.fill();
  const noz=Math.max(22,b.w/14);for(let x=b.x+noz*.8;x<b.x+b.w-noz*.5;x+=noz){ctx.fillStyle='#4b5058';rr(x-3,L.pipeY+4,6,5,1.5);ctx.fill();
   if(rainMix>0){const mg=ctx.createLinearGradient(0,L.pipeY+8,0,L.pipeY+34);mg.addColorStop(0,`rgba(150,195,240,${.45*rainMix})`);mg.addColorStop(1,'rgba(150,195,240,0)');ctx.fillStyle=mg;ctx.beginPath();ctx.moveTo(x-2,L.pipeY+8);ctx.lineTo(x+2,L.pipeY+8);ctx.lineTo(x+9,L.pipeY+34);ctx.lineTo(x-9,L.pipeY+34);ctx.fill();}}
  // pipe end caps
  ctx.fillStyle='#3d424a';rr(b.x+4,L.pipeY-8,7,16,2);ctx.fill();rr(b.x+b.w-11,L.pipeY-8,7,16,2);ctx.fill();
  dial(L);
  // hook under the dial
  const hy=L.hookY+needleGrams()/700*Math.min(10,L.dialR*.2);ctx.strokeStyle=metal(cx-3,0,cx+3,0,STEEL);ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,L.dialY+L.dialR*1.13);ctx.lineTo(cx,hy);ctx.stroke();
  ctx.lineWidth=2.5;ctx.strokeStyle='#4b5058';ctx.beginPath();ctx.arc(cx,hy+5,5,-Math.PI/2,Math.PI*.95);ctx.stroke();
  // turned wooden stand (when the ball rests on it)
  const st=1-hang[0];if(st>0){ctx.save();ctx.globalAlpha*=st;const sw=L.ballR*.62,top=L.standY+L.ballR*.9,bot=L.trayY-10;
   ctx.fillStyle=metal(cx-sw,0,cx+sw,0,[[0,'#6b4a2a'],[.35,'#b98b5b'],[1,'#4d331b']]);ctx.beginPath();ctx.moveTo(cx-sw*.62,top);ctx.lineTo(cx+sw*.62,top);ctx.lineTo(cx+sw*.3,bot-6);ctx.lineTo(cx+sw,bot);ctx.lineTo(cx-sw,bot);ctx.lineTo(cx-sw*.3,bot-6);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.drawImage(leatherSprite(L.ballR,dpr,soak),bp.x-L.ballR,bp.y-L.ballR,L.ballR*2,L.ballR*2);
  net(bp.x,bp.y,L.ballR,cx,hy+9,clamp(hang[0]*1.4-.2));
  rain(L,true);
  // tray front lip
  ctx.fillStyle=metal(0,ty-5,0,ty+2,[[0,'#d4dbe2'],[1,'#7d8893']]);rr(tx-3,ty-5,tw+6,7,3.5);ctx.fill();
  ctx.restore();}

 function label(x:number,y:number,title:string,sub:string,fs0:number,heavy:boolean,x0min:number,x0max:number){
  // fit the card inside its own half of the lightbox (shrink the type before anything collides)
  const room=x0max-x0min;let fs=fs0;const widths=()=>{ctx.font=`800 ${fs}px ${SANS}`;const a=ctx.measureText(title).width;ctx.font=`600 ${fs*.8}px ${SANS}`;return Math.max(a,ctx.measureText(sub).width)+fs*1.4;};
  while(fs>9&&widths()>room)fs-=.5;
  const ww=Math.min(room,widths()),hh=fs*3.3,x0=Math.max(x0min,Math.min(x0max-ww,x-ww/2));
  ctx.save();ctx.shadowColor='rgba(30,40,55,.14)';ctx.shadowBlur=10;ctx.shadowOffsetY=2;rr(x0,y,ww,hh,10);ctx.fillStyle='#fffdf8';ctx.fill();ctx.restore();
  rr(x0+.5,y+.5,ww-1,hh-1,10);ctx.strokeStyle=heavy?'#9a5a26':'rgba(60,70,85,.18)';ctx.lineWidth=heavy?1.5:1;ctx.stroke();
  text(title,x0+ww/2,y+hh*.36,fs,'#1c1f26',800);text(sub,x0+ww/2,y+hh*.7,fs*.8,'#5d636e',600);
  if(heavy){const cw=fs*5.6,ch=fs*1.4,cxp=x0+ww/2-cw/2,cyp=y-ch*.55;rr(cxp,cyp,cw,ch,ch/2);ctx.fillStyle='#9a5a26';ctx.fill();text('▼ HEAVIER',cxp+cw/2,cyp+ch/2+.5,fs*.62,'#fff7ea',800);}}

 function drawBalance(alpha:number){if(alpha<=0)return;const B=balanceLayout(),{b,cx}=B;ctx.save();ctx.globalAlpha=alpha;
  const a=beam[0],cos=Math.cos(a),sin=Math.sin(a);
  // plinth + post
  const pw=Math.max(B.bl*.36,40),py=B.floorY-14;shadow(cx,B.floorY,pw*1.1,8,.25);
  ctx.fillStyle=metal(cx-pw,0,cx+pw,0,[[0,'#4d331b'],[.3,'#a77a4c'],[.6,'#7b5532'],[1,'#3d2814']]);rr(cx-pw,py,pw*2,14,4);ctx.fill();
  ctx.fillStyle=metal(cx-pw*.7,0,cx+pw*.7,0,[[0,'#5c3e22'],[.35,'#c39462'],[1,'#4a3019']]);rr(cx-pw*.7,py-8,pw*1.4,9,3);ctx.fill();
  ctx.fillStyle=metal(cx-5,0,cx+5,0,BRASS);ctx.fillRect(cx-4.5,B.pivotY,9,py-8-B.pivotY);
  // index arc above the pivot (fixed) and the beam's pointer
  const ir=Math.max(26,B.bl*.24);ctx.strokeStyle='rgba(43,47,54,.55)';ctx.lineWidth=1;
  for(let i=-6;i<=6;i++){const t=-Math.PI/2+i*.045,r1=ir*(i%3===0?.86:.92);ctx.beginPath();ctx.moveTo(cx+Math.cos(t)*r1,B.pivotY+Math.sin(t)*r1);ctx.lineTo(cx+Math.cos(t)*ir,B.pivotY+Math.sin(t)*ir);ctx.stroke();}
  ctx.beginPath();ctx.arc(cx,B.pivotY,ir,-Math.PI/2-.3,-Math.PI/2+.3);ctx.stroke();
  const pa=-Math.PI/2+a;ctx.strokeStyle='#c4312b';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,B.pivotY);ctx.lineTo(cx+Math.cos(pa)*ir*.98,B.pivotY+Math.sin(pa)*ir*.98);ctx.stroke();
  // beam: a brass bar
  const lx=cx-cos*B.bl,ly=B.pivotY-sin*B.bl,rx=cx+cos*B.bl,ry=B.pivotY+sin*B.bl,bh=Math.max(6,B.bl*.035);
  ctx.save();ctx.translate(cx,B.pivotY);ctx.rotate(a);ctx.fillStyle=metal(0,-bh/2,0,bh/2,BRASS);rr(-B.bl-4,-bh/2,B.bl*2+8,bh,bh/2);ctx.fill();ctx.restore();
  ctx.beginPath();ctx.arc(cx,B.pivotY,bh*1.1,0,Math.PI*2);ctx.fillStyle='#2b2f36';ctx.fill();ctx.beginPath();ctx.arc(cx-bh*.3,B.pivotY-bh*.3,bh*.35,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.45)';ctx.fill();
  // pans: chains, ball, then the dish in front of it
  const s=SIZES[input.right],rrB=B.R5*rightR,dishW=B.R5*1.5;
  const pan=(px:number,pyy:number,draw:(bx:number,by:number)=>void)=>{const py2=pyy+B.hangLen;
   ctx.strokeStyle='rgba(75,80,88,.9)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(px,pyy);ctx.lineTo(px-dishW,py2);ctx.moveTo(px,pyy);ctx.lineTo(px+dishW,py2);ctx.stroke();
   ctx.beginPath();ctx.arc(px,pyy,3,0,Math.PI*2);ctx.fillStyle='#4b5058';ctx.fill();
   draw(px,py2);
   ctx.beginPath();ctx.moveTo(px-dishW,py2);ctx.bezierCurveTo(px-dishW*.8,py2+dishW*.3,px+dishW*.8,py2+dishW*.3,px+dishW,py2);ctx.closePath();ctx.fillStyle=metal(px-dishW,0,px+dishW,0,BRASS);ctx.fill();
   ctx.beginPath();ctx.ellipse(px,py2,dishW,Math.max(2.5,dishW*.06),0,0,Math.PI*2);ctx.fillStyle='#e9cf8d';ctx.fill();return py2;};
  const ly2=pan(lx,ly,(px,py2)=>{const r=B.R5;shadow(px,py2,r*.9,r*.12,.3);ctx.drawImage(leatherSprite(r,dpr,leftWet),px-r,py2-r*1.9,r*2,r*2);});
  const ry2=pan(rx,ry,(px,py2)=>{shadow(px,py2,rrB*.9,rrB*.12,.3);ctx.drawImage(modernSprite(B.R5,dpr,s.accent),px-rrB,py2-rrB*1.9,rrB*2,rrB*2);});
  // museum labels under the pans
  const fs=Math.max(11,Math.min(16,B.R5*.32,b.w/30)),base=Math.max(ly2,ry2)+B.R5*.42+fs*.4;
  const L=input.leftWet?LEATHER.wet:LEATHER.dry,R=(s.minG+s.maxG)/2;
  const gap=8;label(lx,base,leftWet>.5?`Soaked leather · ${LEATHER.wet} g`:`Dry leather · ${LEATHER.dry} g`,leftWet>.5?'1966 ball, 90 min in water':'1966 ball, dry',fs,L>R+5,b.x+gap,cx-gap/2);
  label(rx,base,`${s.name} · ${s.weight}`,`${s.around} around`,fs,R>L+5,cx+gap/2,b.x+b.w-gap);
  ctx.restore();}

 function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const b=lightbox();ctx.save();rr(b.x,b.y,b.w,b.h,16);ctx.clip();drawScale(1-sceneMix);drawBalance(sceneMix);hint(b);ctx.restore();}
 function frame(t:number){raf=0;if(disposed)return;const dt=Math.min(.05,last?(t-last)/1000:1/60);last=t;const moving=step(dt);draw();if(moving&&!document.hidden)raf=requestAnimationFrame(frame);else last=0;}
 function wake(redraw=false){if(disposed)return;if(!raf&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}else if(redraw&&document.hidden)draw();}
 const vis=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();};
 document.addEventListener('visibilitychange',vis);
 resize();
 return {
  set(s){const wasHung=input.hung;Object.assign(input,s);if(!input.hung)input.raining=false;if(!wasHung&&input.hung&&!opts.reduced)swing[1]=.9;wake();},
  dry(){soak=0;dripT=0;parts.length=0;wake();},
  hit(x,y){if(input.scene==='scale'){const L=scaleLayout(),p=ballPos(L);return Math.hypot(x-p.x,y-p.y)<L.ballR*1.25?'ball':null;}
   const B=balanceLayout();if(y<B.pivotY-B.R5)return null;return x<B.cx-B.bl*.35?'left':x>B.cx+B.bl*.35?'right':null;},
  dispose(){disposed=true;cancelAnimationFrame(raf);raf=0;ro.disconnect();document.removeEventListener('visibilitychange',vis);parts.length=0;clearBallCache();canvas.width=canvas.height=0;},
 };
}
