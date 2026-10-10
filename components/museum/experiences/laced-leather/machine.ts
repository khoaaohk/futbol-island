import {HEAD_BALLS,LEATHER,SIZES,type HeadBall,type SizeId} from './facts';
import {clearBallCache,leatherSprite,modernSprite} from './ballRender';
/**
 * The Weather Machine renderer (Canvas 2D), drawn as a page from a 1950s–60s science picture-book (variation, Oct 9 2026: a cached page with
 * flat shapes and a print speckle; five inks, two-tone shading, outlines printed a hair off-register). Three scenes share one canvas:
 *  - 'scale': a water tank, a pipe with a valve wheel and a rain cloud; a spring dial scale holds a laced leather ball in a string net. Rain soaks it:
 *    it darkens, turns glossy, beads with water, drips into the tray, and the needle swings from the lab's dry weight (410 g)
 *    to its soaked weight (595 g). The moment it is full, a "+185 g" tag pops beside the dial.
 *  - 'balance': a brass beam balance, leather ball (dry or soaked) on the left, a modern size 5 / 4 / 3 on the right, drawn
 *    to scale, with museum labels under the pans.
 *  - 'header' (experiment 4): a ball on a string swings from a brass peg into a wooden head form on a coiled spring. Pendulum
 *    physics, a 70 ms hit-stop on contact, a velocity-aware head jolt (heavier ball, bigger jolt), squash, a lace print that
 *    fades, and spray off the soaked ball. Dragging follows a stiff spring and rubber-bands past the peg and into the head.
 * Both balls are per-pixel shaded sprites (ballRender.ts) cached by size and wetness, so a frame is a few drawImage calls.
 * Rain falls in three depth layers (far drops pass behind the ball, near ones splash on it); with reduced motion the rain is
 * a still curtain and every spring snaps.
 * Heat: the rAF loop runs only while something moves (springs, rain, drips, fades) and sleeps when settled; it stops when the
 * tab is hidden and on dispose. Pixel ratio ≤ 1.5 on coarse pointers (≤ 2 otherwise). Bounded particle pool.
 */
export type MachineInput={scene:'scale'|'balance'|'header';hung:boolean;raining:boolean;leftWet:boolean;right:SizeId;hint:string;headBall:HeadBall};
export type Machine={set:(s:Partial<MachineInput>)=>void;dry:()=>void;hit:(x:number,y:number)=>'ball'|'left'|'right'|null;
 /** Experiment 4: grab the hanging ball (true if the pointer is on it), pull it along its arc, let go. */
 grab:(x:number,y:number)=>boolean;pull:(x:number,y:number)=>void;letGo:()=>void;
 /** Experiment 4 for keyboards and the button: pull back to the peg and let go, as one choreographed swing. */
 autoSwing:()=>void;dispose:()=>void};
export type HeaderEvent={kind:'latch'|'short'|'hit';ball?:HeadBall};
type P={x:number;y:number;vx:number;vy:number;life:number;kind:0|1|2|3;z:number};// 0 rain, 1 splash, 2 drip, 3 ripple

const SOAK_SECONDS=6;// held rain → full soak (stands for the lab's 90 minutes underwater)
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const clamp=(v:number,a=0,b=1)=>v<a?a:v>b?b:v;
const SANS='ui-rounded,"SF Pro Rounded","Nunito","Varela Round","Arial Rounded MT Bold",ui-sans-serif,system-ui,sans-serif',SERIF=SANS;
/** The picture-book palette (Oct 9 2026 variation): five inks and warm paper. */
const C={paper:'#f7efdc',ink:'#1f2a44',tomato:'#e4572e',mustard:'#f2b134',teal:'#17a398',sky:'#6cc4e8',leaf:'#7bb661',cream:'#fff8e8'} as const;

export function createWeatherMachine(canvas:HTMLCanvasElement,opts:{reduced:boolean;coarse:boolean;onSoak:(s:number)=>void;onHeader?:(e:HeaderEvent)=>void}):Machine{
 const ctx=canvas.getContext('2d')!;
 const input:MachineInput={scene:'scale',hung:false,raining:false,leftWet:false,right:'5',hint:'',headBall:'wet'};
 let w=1,h=1,dpr=1,raf=0,last=0,disposed=false;
 let soak=0,reported=-1,dripT=0,spawn=0;
 const parts:P[]=[];
 // Springs: [value, velocity]
 const needle=[0,0],beam=[0,0],hang=[0,0],swing=[0,0],badge=[0,0];
 let sceneMix=0,headMix=0,leftWet=0,rightR=1,rainMix=0,hintMix=0,shownHint='';

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
 // (Oct 9 2026) the tray sits a hint-pill higher than the box floor, so the canvas hint never covers the ball on phones.
 const scaleLayout=()=>{const b=box(),cx=b.x+b.w/2,m=Math.min(b.w,b.h);const dialR=Math.max(30,Math.min(m*.16,b.h*.135)),pipeY=b.y+Math.max(28,b.h*.085);// the cloud sits on this line
  const dialY=pipeY+dialR+Math.max(12,b.h*.055);const ballR=Math.max(26,Math.min(b.w*.22,b.h*.165));const hookY=dialY+dialR+10;
  const ballY=hookY+ballR+Math.max(14,b.h*.07);const trayY=b.y+b.h-Math.max(12,b.h*.05)-Math.min(46,b.h*.085);const standY=trayY-ballR-Math.max(8,ballR*.22);
  return {b,cx,dialR,dialY,pipeY,ballR,hookY,ballY,trayY,standY};};
 const balanceLayout=()=>{const b=box(),cx=b.x+b.w/2,R5=Math.max(22,Math.min(b.w*.13,b.h*.15));const bl=Math.max(b.w*.2,Math.min(b.w/2-R5*1.5-14,b.h*.95));
  const pivotY=b.y+b.h*.25,hangLen=b.h*.33;return {b,cx,R5,bl,pivotY,hangLen,floorY:b.y+b.h-Math.max(12,b.h*.04)};};

 // ---- Experiment 4: the heading rig. A ball on a string (a pendulum) swings into a wooden head on a spring. ----
 // Every swing starts at the same peg, so each ball arrives at the same speed: only its weight changes the push.
 const hd={th:0,om:0,held:false,latched:false,swinging:false,auto:0,autoT:0,target:0,hitStop:0,print:0,ring:0,first:true,ball:'wet' as HeadBall};
 const head=[0,0],squash=[0,0];
 const headerLayout=()=>{const b=box(),floorY=b.y+b.h-Math.max(14,b.h*.07),R=Math.max(26,Math.min(b.h*.15,b.w*.12)),Rb=R*.8;
  const x0=b.x+b.w*.3,neckY=floorY-R*1.05,hx=x0,hy=neckY-R*1.25;// head centre, rotating about the neck base (x0,neckY)
  const fx=hx+R*.92,fy=hy-R*.3;// the forehead, where the ball lands
  const bx0=fx+Rb,by0=fy,px=bx0,py=b.y+Math.max(66,b.h*.15),L=by0-py;// the beam sits below the hint pill
  const peg=Math.min(.95,Math.asin(clamp((b.x+b.w-Rb-14-px)/L,.2,1)));
  return {b,floorY,R,Rb,x0,neckY,hx,hy,fx,fy,px,py,L,peg};};
 const hBallPos=(H:ReturnType<typeof headerLayout>,th:number)=>({x:H.px+Math.sin(th)*H.L,y:H.py+Math.cos(th)*H.L});
 function headerStep(dt:number){const H=headerLayout(),G=H.L*12;
  if(hd.hitStop>0){hd.hitStop=Math.max(0,hd.hitStop-dt);return;}// a beat of stillness on contact, so the hit reads
  if(hd.auto===1){hd.target=H.peg;spring2(hd,H.peg,70,13,dt);if(Math.abs(hd.th-H.peg)<.02){hd.th=H.peg;hd.om=0;hd.auto=2;hd.autoT=.28;latch();}}
  else if(hd.auto===2){hd.autoT-=dt;if(hd.autoT<=0){hd.auto=0;release();}}
  else if(hd.held){spring2(hd,hd.target,520,46,dt);}
  else if(hd.swinging){const n=4,h=dt/n;for(let i=0;i<n;i++){hd.om+=-(G/H.L)*Math.sin(hd.th)*h;if(!hd.first)hd.om*=Math.exp(-h*1.6);hd.th+=hd.om*h;
    if(hd.th<=0&&hd.om<0){impact(H,-hd.om);hd.th=0;break;}}
   if(!hd.first&&Math.abs(hd.th)<.004&&Math.abs(hd.om)<.05){hd.th=0;hd.om=0;hd.swinging=false;}}
  else spring2(hd,0,90,9,dt);
  spring(head,0,70,3.2,dt);spring(squash,0,420,16,dt);
  if(hd.print>0&&!opts.reduced)hd.print=Math.max(0,hd.print-dt/3.4);
  if(hd.ring>0)hd.ring=Math.max(0,hd.ring-dt*3.2);}
 /** θ follows its target on a stiff spring while held (velocity-aware: a fast pull carries on a little, never a fixed tween). */
 function spring2(o:{th:number;om:number},t:number,k:number,c:number,dt:number){if(opts.reduced){o.th=t;o.om=0;return;}o.om+=(k*(t-o.th)-c*o.om)*dt;o.th+=o.om*dt;if(Math.abs(t-o.th)<5e-4&&Math.abs(o.om)<5e-3){o.th=t;o.om=0;}}
 function impact(H:ReturnType<typeof headerLayout>,w:number){const spec=HEAD_BALLS[hd.ball],v=w*H.L,m=spec.g/LEATHER.wet;
  if(hd.first){hd.first=false;opts.onHeader?.({kind:'hit',ball:hd.ball});hd.hitStop=opts.reduced?0:.07;hd.ring=1;
   if(hd.ball!=='modern')hd.print=1;
   // water flies off the soaked ball at the moment of contact
   if(hd.ball==='wet'&&!opts.reduced)for(let i=0;i<22&&parts.length<260;i++){const a=Math.PI*(.55+Math.random()*.9);parts.push({x:H.fx+2,y:H.fy+(Math.random()-.5)*H.Rb*.8,vx:Math.cos(a)*-(70+Math.random()*170),vy:Math.sin(a)*-(60+Math.random()*120)-40,life:1,kind:1,z:1});}}
  const k=Math.min(1,v/(H.L*1.6));
  head[1]-=m*7.2*k;squash[0]=Math.min(1,squash[0]+m*k*1.1);squash[1]=0;
  hd.om=w*spec.e;// the rebound: a soggy ball bounces back less
 }
 function latch(){if(hd.latched)return;hd.latched=true;opts.onHeader?.({kind:'latch'});}
 function release(){const H=headerLayout();hd.held=false;
  if(hd.latched){hd.latched=false;hd.th=H.peg;hd.om=0;hd.first=true;hd.ball=input.headBall;
   if(opts.reduced){// reduced motion: no swing; show the result at once (the head mark, the push bar)
    hd.swinging=false;hd.th=0;hd.first=false;opts.onHeader?.({kind:'hit',ball:hd.ball});hd.print=hd.ball!=='modern'?1:0;}
   else hd.swinging=true;}
  else{opts.onHeader?.({kind:'short'});}
  wake();}

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
  if(input.scene!=='scale'&&sceneMix>.99){swing[0]=swing[1]=0;}else spring(swing,0,9,2.2,dt);
  spring(beam,beamTarget(),26,5,dt);
  spring(badge,soak>=1&&input.hung?1:0,140,11,dt);
  if(input.scene==='header'||headMix>0)headerStep(dt);
  sceneMix=toward(sceneMix,input.scene!=='scale'?1:0,5,dt);headMix=toward(headMix,input.scene==='header'?1:0,5,dt);
  leftWet=toward(leftWet,input.leftWet?1:0,4,dt);
  rightR=toward(rightR,SIZES[input.right].cm/SIZES['5'].cm,8,dt);
  rainMix=toward(rainMix,input.raining&&input.scene==='scale'?1:0,7,dt);
  // hint: fade the old one out before the new one fades in
  if(input.hint!==shownHint){hintMix=toward(hintMix,0,9,dt);if(hintMix===0)shownHint=input.hint;}else hintMix=toward(hintMix,shownHint?1:0,4,dt);
  // particles (motion only; reduced motion shows a still curtain instead)
  const bp=ballPos(L);
  if(input.scene==='scale'&&sceneMix<.5&&!opts.reduced){
   if(input.raining){spawn+=dt*(opts.coarse?100:160);while(spawn>=1&&parts.length<260){spawn--;const z=Math.random();parts.push({x:L.b.x+L.b.w*.3+Math.random()*(L.b.w*.66),y:L.pipeY+Math.max(16,Math.min(L.b.h*.06,30))*.7,vx:28+z*22,vy:380+z*320+Math.random()*60,life:1,kind:0,z});}}
   if(dripT>0&&soak>.15&&input.hung&&Math.random()<dt*(2+soak*6)){parts.push({x:bp.x+(Math.random()-.5)*L.ballR*.4,y:bp.y+L.ballR*.97,vx:0,vy:30,life:1,kind:2,z:1});}
  }
  const waterY=L.trayY-7;
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];
   if(input.scene!=='scale'&&p.kind!==1){parts.splice(i,1);continue;}
   if(p.kind===1){p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*2.6;}
   else if(p.kind===3){p.life-=dt*1.6;}
   else if(p.kind===2){p.vy+=900*dt;p.y+=p.vy*dt;if(p.y>=waterY){p.life=0;if(parts.length<260)parts.push({x:p.x,y:waterY+1,vx:0,vy:0,life:1,kind:3,z:1});}}
   else{p.x+=p.vx*dt;p.y+=p.vy*dt;const dx=p.x-bp.x,dy=p.y-bp.y;
    if(p.z>=.45&&input.hung&&dx*dx+dy*dy<L.ballR*L.ballR&&dy<0){p.life=0;if(Math.random()<.6&&parts.length<260)parts.push({x:p.x,y:p.y,vx:dx/L.ballR*90+(Math.random()-.5)*70,vy:-90-Math.random()*90,life:1,kind:1,z:1});}
    else if(p.y>=waterY){p.life=0;if(Math.abs(p.x-L.cx)<L.b.w*.3&&Math.random()<.18&&parts.length<260)parts.push({x:p.x,y:waterY+1,vx:0,vy:0,life:.7,kind:3,z:p.z});}}
   if(p.life<=0)parts.splice(i,1);}
  return !settled(needle,angleOf(gramsTarget()))||!settled(hang,input.hung?1:0)||!settled(swing,0)||!settled(beam,beamTarget())||!settled(badge,soak>=1&&input.hung?1:0)
   ||parts.length>0||input.raining||dripT>0||rainMix!==(input.raining&&input.scene==='scale'?1:0)||hintMix!==(shownHint?1:0)||input.hint!==shownHint
   ||sceneMix!==(input.scene!=='scale'?1:0)||headMix!==(input.scene==='header'?1:0)
   ||(headMix>0&&(hd.held||hd.swinging||hd.auto>0||hd.hitStop>0||hd.th!==0||hd.om!==0||!settled(head,0)||!settled(squash,0)||(hd.print>0&&!opts.reduced)||hd.ring>0))||leftWet!==(input.leftWet?1:0)||rightR!==SIZES[input.right].cm/SIZES['5'].cm;
 }

 // ---- drawing helpers ----
 const rr=(x:number,y:number,ww:number,hh:number,r:number)=>{ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,ww,hh,r);else ctx.rect(x,y,ww,hh);};
 function text(t:string,x:number,y:number,size:number,color:string,weight=700,align:CanvasTextAlign='center',font=SANS){ctx.font=`${weight} ${size}px ${font}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(t,x,y);}
 /** A soft round shadow (radial gradient, no blur filters: cheap and Safari-safe). */
 /** A flat, hard-edged shadow shape (screen-print style; no gradients or blur). */
 function shadow(x:number,y:number,rx:number,ry:number,a:number){if(a<=0)return;ctx.beginPath();ctx.ellipse(x,y,rx*.92,ry*.92,0,0,Math.PI*2);ctx.fillStyle=`rgba(31,42,68,${Math.min(.22,a*.55)})`;ctx.fill();}
 function metal(x0:number,y0:number,x1:number,y1:number,stops:[number,string][]){const g=ctx.createLinearGradient(x0,y0,x1,y1);for(const [o,c] of stops)g.addColorStop(o,c);return g;}
 // Two-tone inks: a lit half and a shadow half with a hard edge, the way a two-colour print shades a shape.
 const two=(c:string,dark:string):[number,string][]=>[[0,c],[.55,c],[.55,dark],[1,dark]];
 const STEEL=two(C.teal,'#0f7f76');
 const WOOD=two(C.tomato,'#c4431f');
 const BRASS=two(C.mustard,'#d9952a');

 // The page: warm off-white paper with big flat shapes behind the machine (a sky-blue sun disc, a leaf-green floor band, a few
 // dots), and a screen-print speckle laid inside it, all rendered once per size into an offscreen canvas (one drawImage a frame).
 let plate:HTMLCanvasElement|null=null,plateKey='';
 function plateImage(b:{x:number;y:number;w:number;h:number}){const key=`${Math.round(b.w)}x${Math.round(b.h)}@${dpr}`;if(plate&&plateKey===key)return plate;
  const c=plate??document.createElement('canvas');c.width=Math.max(1,Math.round(b.w*dpr));c.height=Math.max(1,Math.round(b.h*dpr));const g=c.getContext('2d')!;g.setTransform(dpr,0,0,dpr,0,0);
  const W=b.w,Hh=b.h,m=Math.min(W,Hh);g.fillStyle=C.paper;g.fillRect(0,0,W,Hh);
  g.fillStyle='#bfe5f4';g.beginPath();g.arc(W*.84,Hh*.34,m*.3,0,Math.PI*2);g.fill();
  g.fillStyle='#fbdc95';g.beginPath();g.arc(W*.13,Hh*.66,m*.2,0,Math.PI*2);g.fill();
  // a leaf-green hill on the floor line
  g.fillStyle='#a9d48f';g.beginPath();g.ellipse(W*.78,Hh*.9,W*.34,Hh*.12,0,Math.PI,0);g.fill();
  g.fillStyle='rgba(228,87,46,.55)';for(let i=0;i<5;i++){g.beginPath();g.arc(W*(.62+i*.06),Hh*.1+i%2*8,3,0,Math.PI*2);g.fill();}
  const fy=Hh*.88;g.fillStyle=C.leaf;g.fillRect(0,fy,W,Hh-fy);g.fillStyle=C.ink;g.fillRect(0,fy,W,2.5);
  // screen-print speckle: a small authored tile, laid once
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const t=document.createElement('canvas');t.width=t.height=96;const tg=t.getContext('2d')!,img=tg.createImageData(96,96);for(let i=0;i<img.data.length;i+=4){const v=rnd(),dark=v<.5;img.data[i]=dark?31:255;img.data[i+1]=dark?42:250;img.data[i+2]=dark?68:236;img.data[i+3]=Math.abs(v-.5)>.46?34:0;}tg.putImageData(img,0,0);
  g.fillStyle=g.createPattern(t,'repeat')!;g.fillRect(0,0,W,Hh);
  plate=c;plateKey=key;return c;}
 function lightbox(){const b=box();
  ctx.fillStyle=C.ink;rr(b.x+5,b.y+5,b.w,b.h,14);ctx.fill();// the page's printed shadow, offset like a misregistered plate
  ctx.save();rr(b.x,b.y,b.w,b.h,14);ctx.clip();ctx.drawImage(plateImage(b),b.x,b.y,b.w,b.h);ctx.restore();
  ctx.save();rr(b.x+1,b.y+1,b.w-2,b.h-2,14);ctx.strokeStyle=C.ink;ctx.lineWidth=2.5;ctx.stroke();ctx.restore();
  return b;}
 /** A puffy flat cloud: overlapping big and small circles on a flat base, the ink outline printed a hair off-register, then
  *  the fill and a flat grey-blue underside. */
 function cloud(x0:number,x1:number,y:number,r:number,tone:string){const n=Math.max(3,Math.round((x1-x0)/(r*1.5))),step=(x1-x0)/n;
  const path=(dx:number,dy:number)=>{ctx.beginPath();for(let i=0;i<=n;i++){const cx=x0+i*step,big=i%2===1,rr2=r*(big?1.35:.95);ctx.moveTo(cx+rr2+dx,y+dy-(big?r*.3:0));ctx.arc(cx+dx,y+dy-(big?r*.3:0),rr2,0,Math.PI*2);}
   ctx.moveTo(x0+dx,y+dy);ctx.roundRect?ctx.roundRect(x0+dx-r*.4,y+dy-r*.2,x1-x0+r*.8,r*1.1,r*.55):ctx.rect(x0+dx-r*.4,y+dy-r*.2,x1-x0+r*.8,r*1.1);};
  path(3,3);ctx.fillStyle=C.ink;ctx.fill();path(0,0);ctx.fillStyle=tone;ctx.fill();
  ctx.save();path(0,0);ctx.clip();ctx.fillStyle=tone==='#ffffff'?'#d7ebf5':'#a9c6d8';ctx.fillRect(x0-r,y+r*.35,x1-x0+r*2,r);ctx.restore();}

 function rain(L:ReturnType<typeof scaleLayout>,near:boolean){
  if(opts.reduced){if(!near||rainMix<=0)return;// a still curtain of rain
   ctx.save();ctx.globalAlpha*=rainMix;ctx.strokeStyle='rgba(23,120,190,.6)';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();
   for(let i=0;i<70;i++){const x=L.b.x+8+((i*97)%101)/101*(L.b.w-16),y=L.pipeY+12+((i*53)%89)/89*(L.trayY-L.pipeY-40);ctx.moveTo(x,y);ctx.lineTo(x+2,y+16);}ctx.stroke();ctx.restore();return;}
  // three depth layers: thin pale far drops, brighter near ones; each streak is a faint tail and a bright head
  const layers=near?[[.45,.75],[.75,1.01]]:[[0,.45]];
  ctx.save();ctx.lineCap='round';
  for(const [z0,z1] of layers){const zm=(z0+z1)/2,len=12+zm*22,wid=1.4+zm*2;
   ctx.strokeStyle=`rgba(108,196,232,${.45+zm*.4})`;ctx.lineWidth=wid;ctx.beginPath();
   for(const p of parts)if(p.kind===0&&p.z>=z0&&p.z<z1){const k=len/p.vy;ctx.moveTo(p.x-p.vx*k,p.y-len);ctx.lineTo(p.x,p.y);}ctx.stroke();
   ctx.strokeStyle=`rgba(31,96,170,${.5+zm*.45})`;ctx.lineWidth=wid*1.25;ctx.beginPath();
   for(const p of parts)if(p.kind===0&&p.z>=z0&&p.z<z1){const k=len*.3/p.vy;ctx.moveTo(p.x-p.vx*k,p.y-len*.3);ctx.lineTo(p.x,p.y);}ctx.stroke();}
  if(near){ctx.fillStyle=C.sky;for(const p of parts){if(p.kind===1){ctx.globalAlpha=clamp(p.life);ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,Math.PI*2);ctx.fill();}
    else if(p.kind===2){ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(p.x,p.y-4.5);ctx.quadraticCurveTo(p.x+2.6,p.y+.5,p.x,p.y+2.4);ctx.quadraticCurveTo(p.x-2.6,p.y+.5,p.x,p.y-4.5);ctx.fill();}}
   ctx.globalAlpha=1;ctx.lineWidth=1;for(const p of parts)if(p.kind===3){const t=1-p.life,rx=3+t*16;ctx.strokeStyle=`rgba(23,120,190,${p.life*.7})`;ctx.beginPath();ctx.ellipse(p.x,p.y,rx,rx*.28,0,0,Math.PI*2);ctx.stroke();}}
  ctx.restore();}

 function dial(L:ReturnType<typeof scaleLayout>){const {cx,dialY:y,dialR:R}=L;
  // ring + rod up to the pipe
  ctx.strokeStyle=metal(cx-3,0,cx+3,0,STEEL);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,L.pipeY+6);ctx.lineTo(cx,y-R-10);ctx.stroke();
  ctx.lineWidth=2.5;ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(cx,y-R-6,5,0,Math.PI*2);ctx.stroke();
  shadow(cx+R*.18,y+R*.22,R*1.35,R*1.2,.16);
  // bezel: a brass ring lit from the upper left
  ctx.beginPath();ctx.arc(cx+3,y+3,R+R*.13,0,Math.PI*2);ctx.fillStyle=C.ink;ctx.fill();ctx.beginPath();ctx.arc(cx,y,R+R*.13,0,Math.PI*2);ctx.fillStyle=metal(cx-R,y-R,cx+R,y+R,WOOD);ctx.fill();
  ctx.beginPath();ctx.arc(cx,y,R+R*.04,0,Math.PI*2);ctx.fillStyle=C.ink;ctx.fill();
  // face
  ctx.beginPath();ctx.arc(cx,y,R,0,Math.PI*2);ctx.fillStyle=C.cream;ctx.fill();
  const band=(g0:number,g1:number,color:string,wid:number)=>{ctx.strokeStyle=color;ctx.lineWidth=wid;ctx.beginPath();ctx.arc(cx,y,R*.84,angleOf(g0)-Math.PI/2,angleOf(g1)-Math.PI/2);ctx.stroke();};
  const bw=Math.max(3,R*.1);band(410,450,C.leaf,bw);// today's size 5 range
  if(input.hung)band(LEATHER.dry-3,LEATHER.dry+3,C.mustard,bw*1.3);if(soak>=1)band(LEATHER.wet-3,LEATHER.wet+3,C.sky,bw*1.3);
  // ticks: 10 g, 50 g, 100 g
  ctx.strokeStyle=C.ink;ctx.lineCap='butt';const fine=R>70?10:50;
  for(let g=0;g<=700;g+=fine){const a=angleOf(g)-Math.PI/2,big=g%100===0,mid=g%50===0,r1=R*(big?.72:mid?.8:.86),r2=R*.92;ctx.lineWidth=big?Math.max(1.4,R*.022):mid?1:.6;
   ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,y+Math.sin(a)*r1);ctx.lineTo(cx+Math.cos(a)*r2,y+Math.sin(a)*r2);ctx.stroke();
   if(big&&(R>58||g%200===0))text(String(g),cx+Math.cos(a)*R*.56,y+Math.sin(a)*R*.56,Math.max(9,R*.13),C.ink,700,'center',SERIF);}
  // live reading in a little window, and the maker's line
  const live=Math.round(needleGrams()/5)*5;
  // live reading in a little window in the empty bottom sector, and the unit above the hub on big dials
  const ww=R*.5,wh=Math.max(13,R*.22),wy=y+R*.5;rr(cx-ww/2,wy,ww,wh,Math.max(2,R*.05));ctx.fillStyle=C.ink;ctx.fill();
  text(input.hung?`${live} g`:'0 g',cx,wy+wh/2+.5,Math.max(9,Math.min(wh*.66,R*.15)),C.cream,800,'center',SERIF);
  if(R>=64)text('GRAMS',cx,y-R*.26,Math.max(7,R*.085),C.teal,800);
  // needle: tapered, with a cast shadow
  const na=needle[0]-Math.PI/2,ca=Math.cos(na),sa=Math.sin(na),tip=R*.86,tail=R*.18,wd=Math.max(1.6,R*.04);
  const needlePath=(ox:number,oy:number)=>{ctx.beginPath();ctx.moveTo(cx+ox+ca*tip,y+oy+sa*tip);ctx.lineTo(cx+ox-sa*wd,y+oy+ca*wd);ctx.lineTo(cx+ox-ca*tail,y+oy-sa*tail);ctx.lineTo(cx+ox+sa*wd,y+oy-ca*wd);ctx.closePath();};
  needlePath(R*.025,R*.035);ctx.fillStyle=C.ink;ctx.fill();needlePath(0,0);ctx.fillStyle=C.tomato;ctx.fill();
  ctx.beginPath();ctx.arc(cx,y,R*.085,0,Math.PI*2);ctx.fillStyle=metal(cx-R*.08,y-R*.08,cx+R*.08,y+R*.08,BRASS);ctx.fill();
  // a flat highlight on the glass: one paper-white crescent
  ctx.save();ctx.beginPath();ctx.arc(cx,y,R,0,Math.PI*2);ctx.clip();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(cx-R*.25,y-R*.25,R*.9,Math.PI*1.05,Math.PI*1.55);ctx.arc(cx-R*.12,y-R*.12,R*.9,Math.PI*1.55,Math.PI*1.05,true);ctx.fill();ctx.restore();
  // the "+185 g" tag when it's full
  const s=badge[0];if(s>.01){const bx=cx+R*1.22,by=y-R*.62,fs=Math.max(12,Math.min(20,R*.22));ctx.save();ctx.translate(bx,by);ctx.scale(s,s);ctx.font=`800 ${fs}px ${SANS}`;
   const tw=ctx.measureText(`+${LEATHER.wet-LEATHER.dry} g`).width+fs*1.2,th=fs*1.9;let ox=0;const right=L.b.x+L.b.w-8;if(bx+tw>right)ox=right-(bx+tw);
   rr(ox+2,-th/2+2,tw,th,th/2);ctx.fillStyle=C.ink;ctx.fill();rr(ox,-th/2,tw,th,th/2);ctx.fillStyle=C.teal;ctx.fill();text(`+${LEATHER.wet-LEATHER.dry} g`,ox+tw/2,1,fs,'#ffffff',800);ctx.restore();}
 }

 function net(x:number,y:number,r:number,hookX:number,hookY:number,a:number){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle=C.ink;ctx.lineWidth=Math.max(1.4,r*.026);ctx.lineCap='round';
  // a string net: four cords from the hook to a top ring, then strings that hug the ball down to a knot underneath
  const top=y-r*.72,ring=r*.66,ks=[-.75,-.25,.25,.75];
  ctx.beginPath();for(const k of ks){ctx.moveTo(hookX,hookY);ctx.lineTo(x+k*ring,top+Math.abs(k)*r*.04);}ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,top,ring,r*.12,0,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();for(const k of ks){const sx=x+k*ring,ex=x+k*r*.08;ctx.moveTo(sx,top+r*.06);ctx.bezierCurveTo(x+k*r*1.32,y-r*.1,x+k*r*.95,y+r*.82,ex,y+r*.995);}ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,y+r*.12,r*.995,r*.2,0,.08,Math.PI-.08);ctx.stroke();
  ctx.beginPath();ctx.arc(x,y+r*.99,Math.max(1.5,r*.04),0,Math.PI*2);ctx.fillStyle=C.ink;ctx.fill();
  ctx.restore();}

 function hint(b:{x:number;y:number;w:number;h:number}){if(hintMix<=0||!shownHint)return;const fs=Math.max(13,Math.min(16,b.w/26));ctx.save();ctx.globalAlpha*=hintMix;ctx.font=`700 ${fs}px ${SANS}`;
  const tw=Math.min(b.w-24,ctx.measureText(shownHint).width+fs*2.2),th=fs*2.4,x=b.x+b.w/2-tw/2,y=input.scene!=='scale'?b.y+12-(1-hintMix)*6:b.y+b.h-th-8+(1-hintMix)*6;
  rr(x,y,tw,th,th/2);ctx.fillStyle=C.ink;ctx.fill();text(shownHint,x+tw/2,y+th/2+.5,fs,C.cream,800);ctx.restore();}

 function drawScale(alpha:number){if(alpha<=0)return;const L=scaleLayout(),{b,cx}=L;ctx.save();ctx.globalAlpha=alpha;
  const bp=ballPos(L),tw=Math.min(b.w*.7,L.ballR*4.2),tx=cx-tw/2,ty=L.trayY;
  // the tray catches the drips: a teal tub with a sky-blue puddle that rises as the ball soaks
  shadow(cx,ty+3,tw*.56,6,.3);
  ctx.fillStyle='#0f7f76';rr(tx,ty-10,tw,10,4);ctx.fill();
  if(soak>0){const lvl=Math.min(7,1+soak*6);ctx.fillStyle=C.sky;ctx.fillRect(tx+3,ty-lvl-2,tw-6,lvl);}
  const gap=(L.trayY-10)-(bp.y+L.ballR);shadow(bp.x,L.trayY-9,L.ballR*(.8+clamp(gap/200)*.5),L.ballR*.12,.5*(1-clamp(gap/260))+.08);
  rain(L,false);
  // the water tank (top left): its level drains as it rains, so you see where the water goes
  const tkW=Math.max(30,Math.min(b.w*.11,64)),tkH=Math.max(54,Math.min(b.h*.32,170)),tkX=b.x+Math.max(12,b.w*.04),tkY=L.pipeY-12;
  ctx.fillStyle=C.ink;rr(tkX+3,tkY+3,tkW,tkH,8);ctx.fill();ctx.fillStyle=C.cream;rr(tkX,tkY,tkW,tkH,8);ctx.fill();
  const lvl=(tkH-10)*(1-soak*.75);ctx.fillStyle=C.sky;rr(tkX+4,tkY+tkH-5-lvl,tkW-8,lvl,5);ctx.fill();
  ctx.fillStyle='rgba(31,96,170,.35)';ctx.fillRect(tkX+4,tkY+tkH-5-lvl,tkW-8,3);
  ctx.strokeStyle=C.ink;ctx.lineWidth=2;rr(tkX,tkY,tkW,tkH,8);ctx.stroke();
  for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(tkX+tkW-10,tkY+tkH*i/4);ctx.lineTo(tkX+tkW-3,tkY+tkH*i/4);ctx.stroke();}
  text('H₂O',tkX+tkW/2,tkY+tkH*.2,Math.max(10,tkW*.24),C.ink,800);
  // the pipe from the tank to the cloud, with a mustard valve wheel that spins while it rains
  const pY=L.pipeY+2;ctx.fillStyle=C.ink;rr(tkX+tkW-2,pY-5+2,b.x+b.w*.3-(tkX+tkW)+6,12,5);ctx.fill();ctx.fillStyle=metal(0,pY-5,0,pY+5,STEEL);rr(tkX+tkW-4,pY-5,b.x+b.w*.3-(tkX+tkW)+6,10,5);ctx.fill();
  const vx=tkX+tkW+Math.max(14,b.w*.04),vr=Math.max(7,b.w*.014);ctx.save();ctx.translate(vx,pY);ctx.rotate(soak*Math.PI*6);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.fillStyle=C.mustard;ctx.beginPath();ctx.arc(0,0,vr,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();for(let k=0;k<3;k++){const a2=k*Math.PI/3;ctx.moveTo(Math.cos(a2)*vr,Math.sin(a2)*vr);ctx.lineTo(-Math.cos(a2)*vr,-Math.sin(a2)*vr);}ctx.stroke();ctx.restore();
  // the rain cloud across the top: grey-blue while it rains, white when dry
  const cr=Math.max(16,Math.min(b.h*.055,30));cloud(b.x+b.w*.3,b.x+b.w-Math.max(14,b.w*.04),L.pipeY,cr,rainMix>.05?'#cfe3ee':'#ffffff');
  dial(L);
  // hook under the dial
  const hy=L.hookY+needleGrams()/700*Math.min(10,L.dialR*.2);ctx.strokeStyle=metal(cx-3,0,cx+3,0,STEEL);ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,L.dialY+L.dialR*1.13);ctx.lineTo(cx,hy);ctx.stroke();
  ctx.lineWidth=2.5;ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(cx,hy+5,5,-Math.PI/2,Math.PI*.95);ctx.stroke();
  // turned wooden stand (when the ball rests on it)
  const st=1-hang[0];if(st>0){ctx.save();ctx.globalAlpha*=st;const sw=L.ballR*.62,top=L.standY+L.ballR*.9,bot=L.trayY-10;
   ctx.fillStyle=metal(cx-sw,0,cx+sw,0,BRASS);ctx.beginPath();ctx.moveTo(cx-sw*.62,top);ctx.lineTo(cx+sw*.62,top);ctx.lineTo(cx+sw*.3,bot-6);ctx.lineTo(cx+sw,bot);ctx.lineTo(cx-sw,bot);ctx.lineTo(cx-sw*.3,bot-6);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.drawImage(leatherSprite(L.ballR,dpr,soak),bp.x-L.ballR,bp.y-L.ballR,L.ballR*2,L.ballR*2);
  net(bp.x,bp.y,L.ballR,cx,hy+9,clamp(hang[0]*1.4-.2));
  rain(L,true);
  // tray front lip
  ctx.fillStyle=C.teal;rr(tx-3,ty-5,tw+6,7,3.5);ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore();}

 function label(x:number,y:number,title:string,sub:string,fs0:number,heavy:boolean,x0min:number,x0max:number){
  // fit the card inside its own half of the lightbox (shrink the type before anything collides)
  const room=x0max-x0min;let fs=fs0;const widths=()=>{ctx.font=`800 ${fs}px ${SANS}`;const a=ctx.measureText(title).width;ctx.font=`600 ${fs*.8}px ${SANS}`;return Math.max(a,ctx.measureText(sub).width)+fs*1.4;};
  while(fs>9&&widths()>room)fs-=.5;
  const ww=Math.min(room,widths()),hh=fs*3.3,x0=Math.max(x0min,Math.min(x0max-ww,x-ww/2));
  rr(x0+3,y+3,ww,hh,10);ctx.fillStyle=C.ink;ctx.fill();rr(x0,y,ww,hh,10);ctx.fillStyle=C.cream;ctx.fill();
  rr(x0+.5,y+.5,ww-1,hh-1,10);ctx.strokeStyle=heavy?C.tomato:C.ink;ctx.lineWidth=heavy?2.5:1.5;ctx.stroke();
  text(title,x0+ww/2,y+hh*.36,fs,C.ink,800);text(sub,x0+ww/2,y+hh*.7,fs*.8,'#0f7f76',700);
  if(heavy){const cw=fs*5.6,ch=fs*1.4,cxp=x0+ww/2-cw/2,cyp=y-ch*.55;rr(cxp,cyp,cw,ch,ch/2);ctx.fillStyle=C.tomato;ctx.fill();text('▼ HEAVIER',cxp+cw/2,cyp+ch/2+.5,fs*.62,'#ffffff',800);}}

 function drawBalance(alpha:number){if(alpha<=0)return;const B=balanceLayout(),{b,cx}=B;ctx.save();ctx.globalAlpha=alpha;
  const a=beam[0],cos=Math.cos(a),sin=Math.sin(a);
  // plinth + post
  const pw=Math.max(B.bl*.36,40),py=B.floorY-14;shadow(cx,B.floorY,pw*1.1,8,.25);
  ctx.fillStyle=metal(cx-pw,0,cx+pw,0,WOOD);rr(cx-pw,py,pw*2,14,4);ctx.fill();
  ctx.fillStyle=metal(cx-pw*.7,0,cx+pw*.7,0,STEEL);rr(cx-pw*.7,py-8,pw*1.4,9,3);ctx.fill();
  ctx.fillStyle=metal(cx-5,0,cx+5,0,BRASS);ctx.fillRect(cx-4.5,B.pivotY,9,py-8-B.pivotY);
  // index arc above the pivot (fixed) and the beam's pointer
  const ir=Math.max(26,B.bl*.24);ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;
  for(let i=-6;i<=6;i++){const t=-Math.PI/2+i*.045,r1=ir*(i%3===0?.86:.92);ctx.beginPath();ctx.moveTo(cx+Math.cos(t)*r1,B.pivotY+Math.sin(t)*r1);ctx.lineTo(cx+Math.cos(t)*ir,B.pivotY+Math.sin(t)*ir);ctx.stroke();}
  ctx.beginPath();ctx.arc(cx,B.pivotY,ir,-Math.PI/2-.3,-Math.PI/2+.3);ctx.stroke();
  const pa=-Math.PI/2+a;ctx.strokeStyle=C.tomato;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,B.pivotY);ctx.lineTo(cx+Math.cos(pa)*ir*.98,B.pivotY+Math.sin(pa)*ir*.98);ctx.stroke();
  // beam: a brass bar
  const lx=cx-cos*B.bl,ly=B.pivotY-sin*B.bl,rx=cx+cos*B.bl,ry=B.pivotY+sin*B.bl,bh=Math.max(6,B.bl*.035);
  ctx.save();ctx.translate(cx,B.pivotY);ctx.rotate(a);ctx.fillStyle=metal(0,-bh/2,0,bh/2,BRASS);rr(-B.bl-4,-bh/2,B.bl*2+8,bh,bh/2);ctx.fill();ctx.restore();
  ctx.beginPath();ctx.arc(cx,B.pivotY,bh*1.1,0,Math.PI*2);ctx.fillStyle=C.ink;ctx.fill();ctx.beginPath();ctx.arc(cx-bh*.3,B.pivotY-bh*.3,bh*.35,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.45)';ctx.fill();
  // pans: chains, ball, then the dish in front of it
  const s=SIZES[input.right],rrB=B.R5*rightR,dishW=B.R5*1.5;
  const pan=(px:number,pyy:number,draw:(bx:number,by:number)=>void)=>{const py2=pyy+B.hangLen;
   ctx.strokeStyle=C.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(px,pyy);ctx.lineTo(px-dishW,py2);ctx.moveTo(px,pyy);ctx.lineTo(px+dishW,py2);ctx.stroke();
   ctx.beginPath();ctx.arc(px,pyy,3,0,Math.PI*2);ctx.fillStyle=C.ink;ctx.fill();
   draw(px,py2);
   ctx.beginPath();ctx.moveTo(px-dishW,py2);ctx.bezierCurveTo(px-dishW*.8,py2+dishW*.3,px+dishW*.8,py2+dishW*.3,px+dishW,py2);ctx.closePath();ctx.fillStyle=metal(px-dishW,0,px+dishW,0,BRASS);ctx.fill();
   ctx.beginPath();ctx.ellipse(px,py2,dishW,Math.max(2.5,dishW*.06),0,0,Math.PI*2);ctx.fillStyle='#ffd67a';ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;ctx.stroke();return py2;};
  const ly2=pan(lx,ly,(px,py2)=>{const r=B.R5;shadow(px,py2,r*.9,r*.12,.3);ctx.drawImage(leatherSprite(r,dpr,leftWet),px-r,py2-r*1.9,r*2,r*2);});
  const ry2=pan(rx,ry,(px,py2)=>{shadow(px,py2,rrB*.9,rrB*.12,.3);ctx.drawImage(modernSprite(B.R5,dpr,s.accent),px-rrB,py2-rrB*1.9,rrB*2,rrB*2);});
  // museum labels under the pans
  const fs=Math.max(11,Math.min(16,B.R5*.32,b.w/30)),base=Math.max(ly2,ry2)+B.R5*.42+fs*.4;
  const L=input.leftWet?LEATHER.wet:LEATHER.dry,R=(s.minG+s.maxG)/2;
  const gap=8;label(lx,base,leftWet>.5?`Soaked leather · ${LEATHER.wet} g`:`Dry leather · ${LEATHER.dry} g`,leftWet>.5?'lab test, 90 min in water':'lab test, dry',fs,L>R+5,b.x+gap,cx-gap/2);
  label(rx,base,`${s.name} · ${s.weight}`,`${s.around} around`,fs,R>L+5,cx+gap/2,b.x+b.w-gap);
  ctx.restore();}

 /** A wooden head form on a coiled spring (a hat-maker's block, not a person), side on, facing the ball. Unit path, scaled by R. */
 function headPath(R:number){ctx.beginPath();ctx.moveTo(-.5*R,1.05*R);
  ctx.bezierCurveTo(-.95*R,.62*R,-1.06*R,-.18*R,-.76*R,-.74*R);ctx.bezierCurveTo(-.44*R,-1.2*R,.46*R,-1.24*R,.8*R,-.68*R);
  ctx.bezierCurveTo(.95*R,-.44*R,.93*R,-.2*R,.9*R,-.02*R);ctx.bezierCurveTo(.98*R,.14*R,1.06*R,.26*R,1.04*R,.32*R);ctx.bezierCurveTo(1.0*R,.38*R,.95*R,.4*R,.92*R,.42*R);
  ctx.bezierCurveTo(.96*R,.56*R,.9*R,.72*R,.74*R,.86*R);ctx.bezierCurveTo(.6*R,.96*R,.42*R,.96*R,.34*R,1.02*R);ctx.lineTo(.3*R,1.3*R);ctx.lineTo(-.46*R,1.3*R);ctx.closePath();}
 function drawHeader(alpha:number){if(alpha<=0)return;const H=headerLayout(),{b}=H;ctx.save();ctx.globalAlpha=alpha;
  const bp=hBallPos(H,hd.th),spec=HEAD_BALLS[hd.swinging||hd.hitStop>0?hd.ball:input.headBall];
  // the floor line of the studio and the base block
  shadow(H.x0,H.floorY,H.R*1.1,H.R*.14,.32);
  ctx.fillStyle=metal(H.x0-H.R*.8,0,H.x0+H.R*.8,0,WOOD);rr(H.x0-H.R*.8,H.floorY-H.R*.22,H.R*1.6,H.R*.24,4);ctx.fill();
  // the gallows: a post behind the swing and a beam to the pivot
  const postX=b.x+Math.max(18,b.w*.07);// the post stands behind the head, so the swing side stays clear for the peg and label
  ctx.fillStyle=metal(postX-5,0,postX+5,0,WOOD);ctx.fillRect(postX-5,H.py-8,10,H.floorY-H.py+8);
  ctx.fillStyle=metal(0,H.py-12,0,H.py,WOOD);rr(postX-5,H.py-12,H.px-postX+21,11,3);ctx.fill();
  shadow(postX,H.floorY,22,5,.25);
  // the swing's path, dotted like an engraver's guide, with the brass peg at its end
  ctx.save();ctx.setLineDash([2,7]);ctx.lineCap='round';ctx.strokeStyle='rgba(31,42,68,.55)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(H.px,H.py,H.L,Math.PI/2-H.peg,Math.PI/2-.05,false);ctx.stroke();ctx.restore();
  const pg=hBallPos(H,H.peg),pin=hBallPos(H,H.peg+H.Rb*1.12/H.L),pr=Math.max(4,H.Rb*.12);
  ctx.beginPath();ctx.arc(pin.x,pin.y,pr,0,Math.PI*2);ctx.fillStyle=metal(pin.x-pr,pin.y-pr,pin.x+pr,pin.y+pr,BRASS);ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;ctx.stroke();
  if(hd.latched){ctx.beginPath();ctx.arc(pin.x,pin.y,pr*2.1,0,Math.PI*2);ctx.strokeStyle=C.tomato;ctx.lineWidth=2;ctx.stroke();}
  const idle=!hd.held&&!hd.swinging&&hd.auto===0&&hd.th===0;
  if(idle){// "pull" affordance: a ghost of the ball waiting at the peg, and an arrow along the arc
   ctx.save();ctx.globalAlpha*=.22;ctx.beginPath();ctx.arc(pg.x,pg.y,H.Rb,0,Math.PI*2);ctx.setLineDash([5,5]);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();ctx.restore();
   const a0=Math.PI/2-.18,a1=Math.PI/2-H.peg*.78;ctx.save();ctx.strokeStyle=C.tomato;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();ctx.arc(H.px,H.py,H.L+H.Rb*1.35,a0,a1,true);ctx.stroke();
   const ax=H.px+Math.cos(a1)*(H.L+H.Rb*1.35),ay=H.py+Math.sin(a1)*(H.L+H.Rb*1.35),ta=a1-Math.PI/2;ctx.beginPath();ctx.moveTo(ax+Math.cos(ta)*9,ay+Math.sin(ta)*9);ctx.lineTo(ax+Math.cos(ta+2.4)*9,ay+Math.sin(ta+2.4)*9);ctx.lineTo(ax+Math.cos(ta-2.4)*9,ay+Math.sin(ta-2.4)*9);ctx.closePath();ctx.fillStyle=C.tomato;ctx.fill();
   {const fs=Math.max(11,H.R*.16),room=b.x+b.w-8-(ax+12);text('PULL',room>fs*3.2?ax+12:ax-8,ay-(room>fs*3.2?10:20),fs,C.tomato,800,room>fs*3.2?'left':'right',SERIF);}ctx.restore();}
  // the coiled spring neck and the head, rotating about the neck base
  const tilt=head[0],coilH=H.floorY-H.R*.22-H.neckY;
  ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=Math.max(2.5,H.R*.08);ctx.lineCap='round';ctx.beginPath();
  const turns=6;for(let i=0;i<=turns*8;i++){const t=i/(turns*8),y=H.floorY-H.R*.22-t*coilH,lean=Math.sin(tilt)*t*coilH*.6,x=H.x0+lean+Math.sin(t*turns*Math.PI*2)*H.R*.2;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(H.x0+Math.sin(tilt)*coilH*.6,H.neckY);ctx.rotate(tilt);ctx.translate(0,-(H.neckY-H.hy));
  shadow(H.R*.25,H.R*.2,H.R*1.3,H.R*1.2,.12);
  ctx.save();ctx.translate(3,3);headPath(H.R);ctx.fillStyle=C.ink;ctx.fill();ctx.restore();// the outline, printed off-register
  headPath(H.R);ctx.fillStyle=C.teal;ctx.fill();
  ctx.save();headPath(H.R);ctx.clip();ctx.fillStyle='#4fc2b6';ctx.beginPath();ctx.ellipse(-H.R*.25,-H.R*.45,H.R*.55,H.R*.38,-.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#0f7f76';ctx.beginPath();ctx.ellipse(H.R*.1,H.R*.9,H.R*1.1,H.R*.42,0,0,Math.PI*2);ctx.fill();ctx.restore();// flat light and shadow shapes
  headPath(H.R);ctx.lineWidth=Math.max(1.6,H.R*.03);ctx.strokeStyle=C.ink;ctx.stroke();
  // a mustard ear disc and a dotted "test target" on the temple: a science-book head form, not a person
  ctx.beginPath();ctx.arc(-H.R*.1,H.R*.1,H.R*.16,0,Math.PI*2);ctx.fillStyle=C.mustard;ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(H.R*.22,-H.R*.55,H.R*.13,0,Math.PI*2);ctx.fillStyle=C.cream;ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(H.R*.22,-H.R*.68);ctx.lineTo(H.R*.22,-H.R*.42);ctx.moveTo(H.R*.09,-H.R*.55);ctx.lineTo(H.R*.35,-H.R*.55);ctx.stroke();
  // the lace print on the forehead (hand-tinted madder), fading out
  if(hd.print>0){const fx=H.R*.9,fy=-H.R*.3;ctx.save();ctx.globalAlpha*=Math.min(1,hd.print*1.4)*.85;ctx.strokeStyle=C.tomato;ctx.lineWidth=Math.max(2,H.R*.05);ctx.lineCap='round';
   for(let i=0;i<5;i++){const y=fy-H.R*.3+i*H.R*.14;ctx.beginPath();ctx.moveTo(fx-H.R*.12,y);ctx.lineTo(fx-H.R*.02,y+H.R*.12);ctx.moveTo(fx-H.R*.02,y);ctx.lineTo(fx-H.R*.12,y+H.R*.12);ctx.stroke();}ctx.restore();}
  ctx.restore();
  // string and ball (the ball turns with the string; the laces face the head)
  const dirX=Math.sin(hd.th),dirY=Math.cos(hd.th);
  ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(H.px,H.py);ctx.lineTo(bp.x-dirX*H.Rb*.92,bp.y-dirY*H.Rb*.92);ctx.stroke();
  ctx.beginPath();ctx.arc(H.px,H.py,3.5,0,Math.PI*2);ctx.fillStyle=C.ink;ctx.fill();
  shadow(bp.x,H.floorY,H.Rb*.8,H.Rb*.12,.22*(1-clamp((H.floorY-bp.y)/(H.L*1.2))));
  const sq=clamp(squash[0],-.4,1);ctx.save();ctx.translate(bp.x,bp.y);ctx.scale(1-sq*.2,1+sq*.12);ctx.rotate(-hd.th);
  if(spec===HEAD_BALLS.modern)ctx.drawImage(modernSprite(H.Rb,dpr,SIZES['5'].accent),-H.Rb,-H.Rb,H.Rb*2,H.Rb*2);
  else{ctx.rotate(-Math.PI/2);ctx.drawImage(leatherSprite(H.Rb,dpr,spec===HEAD_BALLS.wet?1:0),-H.Rb,-H.Rb,H.Rb*2,H.Rb*2);}
  ctx.restore();
  // contact: engraved impact lines that spring out and fade
  if(hd.ring>0){const k=1-hd.ring;ctx.save();ctx.globalAlpha*=hd.ring;ctx.strokeStyle=C.tomato;ctx.lineWidth=3;ctx.lineCap='round';
   for(const a of [-1.25,-.8,.8,1.25]){const r0=H.Rb*(1.05+k*.35),r1=r0+H.Rb*(.22+k*.2),cx0=H.fx+H.Rb*.15;ctx.beginPath();ctx.moveTo(cx0+Math.cos(a)*r0*.55,H.fy+Math.sin(a)*r0);ctx.lineTo(cx0+Math.cos(a)*r1*.55,H.fy+Math.sin(a)*r1);ctx.stroke();}
   ctx.restore();}
  // water spray
  ctx.fillStyle=C.sky;for(const p of parts)if(p.kind===1){ctx.globalAlpha=alpha*clamp(p.life);ctx.beginPath();ctx.arc(p.x,p.y,2.6,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=alpha;
  // the ball's museum label, top right
  const fs=Math.max(11,Math.min(15,b.w/34));label(Math.min(b.x+b.w-90,H.px+H.L*.6),b.y+b.h-fs*3.3-10,`${spec.label} · ${spec===HEAD_BALLS.modern?'about ':''}${spec.g} g`,'every swing starts at the peg',fs,spec===HEAD_BALLS.wet,b.x+b.w*.5,b.x+b.w-8);
  ctx.restore();}

 function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const b=lightbox();ctx.save();rr(b.x,b.y,b.w,b.h,6);ctx.clip();drawScale((1-sceneMix)*(1-headMix));drawBalance(sceneMix*(1-headMix));drawHeader(headMix);hint(b);ctx.restore();}
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
  grab(x,y){if(input.scene!=='header'||hd.swinging||hd.auto)return false;const H=headerLayout(),p=hBallPos(H,hd.th);if(Math.hypot(x-p.x,y-p.y)>H.Rb*1.5)return false;hd.held=true;hd.target=hd.th;wake();return true;},
  pull(x,y){if(!hd.held)return;const H=headerLayout();let raw=Math.atan2(x-H.px,y-H.py);
   if(raw<0)raw*=.18;// pushing into the head: rubber-band
   if(!hd.latched&&raw>=H.peg*.8)latch();else if(hd.latched&&raw<H.peg*.55){hd.latched=false;}
   hd.target=hd.latched?H.peg+Math.max(0,raw-H.peg)*.22:Math.min(raw,H.peg*.8+(raw-H.peg*.8)*.3);wake();},
  letGo(){if(!hd.held)return;release();},
  autoSwing(){if(input.scene!=='header'||hd.swinging||hd.auto||hd.held)return;if(opts.reduced){hd.latched=true;release();return;}hd.auto=1;wake();},
  dispose(){disposed=true;cancelAnimationFrame(raf);raf=0;ro.disconnect();document.removeEventListener('visibilitychange',vis);parts.length=0;clearBallCache();plate=null;canvas.width=canvas.height=0;},
 };
}
