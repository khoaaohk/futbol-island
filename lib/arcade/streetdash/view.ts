/**
 * Street Dash drawing (Nov 17 2026, docs/arcade-aaa/streetdash-direction.md): ONE 2D canvas, side-on, in the comic-print house style.
 * Portrait: parallax backdrops above, the play band across the middle (the street at 62% of the height), the thumb zone below it.
 * Two rules keep it readable: scenery is muted, thin-lined and pushed back; everything that can hurt (or score) is saturated with a
 * thick ink line. The camera leads the bean (bean at 30% from the left) and zooms out a little as the speed climbs.
 * Heat: the backdrop strips are painted once per resize (two per backdrop) and blitted; ground, hazards, bean and effects are a few
 * dozen paths a frame; particles and score pops are fixed pools; nothing is allocated per frame. Reduced motion: no shake, less parallax,
 * no speed lines, no pulsing.
 */
import {SD,HZ,type StreetDash,type DashEvent,type DashState,type Haz,type Seg} from './core';

/** the player is drawn this much bigger than its hitbox: easier to read on a phone, and a hit never looks unfair */
const BEAN_SCALE=1.3;
const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',RED='#f0452e',TEAL='#19b5a5',TEAL_D='#0f7f86',ORANGE='#ff8a3c',VIOLET='#8f78b8',VIOLET_D='#62508f',SKIN='#ffd9a8';
type Theme={sky:readonly [string,string,string];sun:string;sunRing:string;void:string;top:string;topEdge:string;body:string;bodyLine:string;far:string;far2:string;mid:readonly string[];midLine:string;dot:string};
/** street (morning), rooftops (sunset), beach (noon). Scenery colours sit closer to the sky than the hazards ever do. */
const THEMES:readonly Theme[]=[
 {sky:['#8fd0e6','#b8e3ec','#e2f3ec'],sun:'#fff1b0',sunRing:'#ffe08a',void:'#2f2540',top:'#e9d5ad',topEdge:'#c7ae84',body:'#5a5170',bodyLine:'#4b4360',far:'#a9d4c4',far2:'#c6e2d6',mid:['#f2c7a2','#e9b29a','#bfd9c4','#f3dfa8','#d7c3e0'],midLine:'#8a7f96',dot:'#7fb9c9'},
 {sky:['#e9825c','#f6a968','#ffcf7a'],sun:'#fff1b0',sunRing:'#ffc24a',void:'#3a2236',top:'#c95b45',topEdge:'#a3413a',body:'#7c4252',bodyLine:'#69374a',far:'#c9788a',far2:'#dd9a8e',mid:['#a8607a','#b56f7e','#9a5872'],midLine:'#7a4a68',dot:'#f08f6a'},
 {sky:['#7cc8ea','#a6dcef','#d8f1f2'],sun:'#fffbe0',sunRing:'#fff1b0',void:'#2b7fa0',top:'#e8c48a',topEdge:'#c9a064',body:'#e3bf7c',bodyLine:'#d2aa66',far:'#3aa7c4',far2:'#7bb38f',mid:['#3f8a5c','#f2c7a2','#e9b29a','#f6f0dc'],midLine:'#5f8f7a',dot:'#9ad6e8'},
];
export type StreetdashLayout={w:number;h:number;k:number;gy:number;
 /** the volley prompt in the thumb zone and the target in the play band (CSS px); r=0 when off */
 prompt:{x:number;y:number;r:number};target:{x:number;y:number;r:number}};
type Part={on:boolean;x:number;y:number;vx:number;vy:number;t0:number;life:number;kind:number;color:string;r:number};
type Pop={on:boolean;x:number;y:number;t0:number;n:number};

export type StreetdashView=ReturnType<typeof createStreetdashView>;
export function createStreetdashView(canvas:HTMLCanvasElement,opts:{reduced:boolean}){
 const g=canvas.getContext('2d',{alpha:false})!;const reduced=opts.reduced;
 const L:StreetdashLayout={w:1,h:1,k:30,gy:400,prompt:{x:0,y:0,r:0},target:{x:0,y:0,r:0}};
 let dpr=1,tw=1,farH=1,midH=1,camX=0,camY=0,zoom=1,shakeT0=-1e9,shakeAmp=0,flashT0=-1e9;
 const strips:{far:HTMLCanvasElement;mid:HTMLCanvasElement}[]=[];
 const parts:Part[]=Array.from({length:96},()=>({on:false,x:0,y:0,vx:0,vy:0,t0:0,life:0,kind:0,color:INK,r:1}));let partI=0;
 const pops:Pop[]=Array.from({length:10},()=>({on:false,x:0,y:0,t0:0,n:0}));let popI=0;
 const now=()=>performance.now()/1000;
 let seedN=1;const prand=()=>{seedN=(seedN*16807)%2147483647;return seedN/2147483647;};

 /* ---- backdrops: two tiling strips per theme, painted once ---- */
 function paintFar(i:number,c:CanvasRenderingContext2D,W:number,H:number){const T=THEMES[i];seedN=11+i*7;c.clearRect(0,0,W,H);
  if(i===0){// street: two bands of hills and a far town with a lighthouse
   c.fillStyle=T.far2;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=W/12)c.lineTo(x,H*.45+Math.sin(x/W*Math.PI*4)*H*.08);c.lineTo(W,H);c.fill();
   c.fillStyle=T.far;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=W/16)c.lineTo(x,H*.65+Math.sin(x/W*Math.PI*6+1)*H*.06);c.lineTo(W,H);c.fill();
   c.fillStyle='#9cc6b8';for(let x=10;x<W-30;x+=26+prand()*30){const bw=14+prand()*20,bh=H*(.1+prand()*.12);c.fillRect(x,H-bh,bw,bh);c.beginPath();c.moveTo(x-2,H-bh);c.lineTo(x+bw/2,H-bh-bw*.45);c.lineTo(x+bw+2,H-bh);c.fill();}
   const lx=W*.62;c.fillStyle=PAPER;c.fillRect(lx,H*.28,10,H*.4);c.fillStyle='#e88a7a';c.fillRect(lx,H*.36,10,6);c.fillRect(lx,H*.5,10,6);c.fillStyle='#9cc6b8';c.fillRect(lx-3,H*.25,16,6);
  }else if(i===1){// rooftops: a far skyline in two depths, a few lit windows
   for(const [col,base,hi] of [[T.far2,.5,.45],[T.far,.75,.4]] as const){c.fillStyle=col;let x=0;while(x<W){const bw=18+prand()*36,bh=H*(1-base+prand()*hi);c.fillRect(x,H-bh,bw+1,bh);if(prand()<.3)c.fillRect(x+bw*.4,H-bh-12,3,12);x+=bw;}}
   c.fillStyle='#ffcf7a';for(let n=0;n<40;n++){const x=prand()*W,y=H*(.55+prand()*.4);c.fillRect(x,y,3,4);}
  }else{// beach: the sea to the horizon, a headland, a sail
   c.fillStyle=T.far;c.fillRect(0,H*.55,W,H*.45);c.fillStyle='#62bcd4';for(let n=0;n<26;n++){const x=prand()*W,y=H*(.6+prand()*.38);c.fillRect(x,y,8+prand()*14,2);}
   c.fillStyle=T.far2;c.beginPath();c.moveTo(W*.05,H*.56);c.quadraticCurveTo(W*.18,H*.2,W*.34,H*.56);c.fill();c.fillStyle='#93c4a2';c.beginPath();c.moveTo(W*.24,H*.56);c.quadraticCurveTo(W*.3,H*.36,W*.42,H*.56);c.fill();
   const sx=W*.7;c.fillStyle=PAPER;c.beginPath();c.moveTo(sx,H*.52);c.lineTo(sx,H*.3);c.lineTo(sx+16,H*.52);c.fill();c.fillStyle='#e88a7a';c.fillRect(sx-8,H*.52,26,4);
  }
 }
 function paintMid(i:number,c:CanvasRenderingContext2D,W:number,H:number,k:number){const T=THEMES[i];seedN=101+i*13;c.clearRect(0,0,W,H);c.lineWidth=1.5;c.strokeStyle=T.midLine;
  if(i===0){// street: house fronts with windows, awnings and doors
   let x=0;while(x<W-4){const bw=Math.min(W-x,k*(2.2+prand()*2.2)),bh=H*(.42+prand()*.58),col=T.mid[Math.floor(prand()*T.mid.length)];
    c.fillStyle=col;c.fillRect(x,H-bh,bw,bh);c.strokeRect(x+.75,H-bh+.75,bw-1.5,bh);
    c.fillStyle='#8fb3c9';const ww=k*.42,wh=k*.55;for(let r=0;r<6;r++)for(let q=0;q<3;q++){const wx=x+bw*(.18+q*.3)-ww/2,wy=H-bh+k*.4+r*k*.9;if(wy+wh>H-k*1.2||wx+ww>x+bw-3)continue;c.fillRect(wx,wy,ww,wh);c.strokeRect(wx,wy,ww,wh);}
    if(prand()<.6){const ay=H-k*1.35;c.fillStyle=prand()<.5?'#f2a29a':'#9fd0c4';c.beginPath();c.moveTo(x+4,ay);c.lineTo(x+bw-4,ay);c.lineTo(x+bw-8,ay+k*.35);c.lineTo(x+8,ay+k*.35);c.fill();c.stroke();}
    c.fillStyle='#8a7f96';c.fillRect(x+bw*.6,H-k*1,k*.45,k);x+=bw;}
  }else if(i===1){// rooftops: chimneys, a water tower, aerials and a washing line in silhouette
   for(let n=0;n<7;n++){const x=prand()*W,bw=k*(.5+prand()*.5),bh=k*(.8+prand()*1.4);c.fillStyle=T.mid[n%T.mid.length];c.fillRect(x,H-bh,bw,bh);c.fillRect(x-3,H-bh,bw+6,5);}
   const tx=W*.4,ty=H-k*3.3;c.fillStyle=T.mid[2];c.fillRect(tx,ty,k*1.3,k*1.2);c.beginPath();c.moveTo(tx-4,ty);c.lineTo(tx+k*.65,ty-k*.5);c.lineTo(tx+k*1.3+4,ty);c.fill();
   c.strokeStyle=T.mid[2];c.lineWidth=3;for(const lx of [tx+5,tx+k*1.3-5]){c.beginPath();c.moveTo(lx,ty+k*1.2);c.lineTo(lx,H);c.stroke();}
   c.lineWidth=2;for(let n=0;n<4;n++){const ax=prand()*W;c.beginPath();c.moveTo(ax,H);c.lineTo(ax,H-k*2.4);c.moveTo(ax-k*.3,H-k*2.1);c.lineTo(ax+k*.3,H-k*2.1);c.stroke();}
   c.strokeStyle=T.midLine;c.lineWidth=1.2;const wx=W*.7;c.beginPath();c.moveTo(wx,H-k*1.6);c.quadraticCurveTo(wx+k*1.4,H-k*1.3,wx+k*2.8,H-k*1.6);c.stroke();
   for(let n=0;n<4;n++){c.fillStyle=['#e6b4a8','#d9c9e0','#f3dfa8'][n%3];c.fillRect(wx+k*(.3+n*.6),H-k*1.48+Math.sin(n)*2,k*.32,k*.42);}
  }else{// beach: palms, striped huts, a lifeguard tower
   for(let n=0;n<4;n++){const x=W*(.08+n*.25)+prand()*20,base=H,top=H-k*(2.6+prand()*1.2),lean=k*(.3+prand()*.4);
    c.strokeStyle='#b88a5a';c.lineWidth=k*.18;c.beginPath();c.moveTo(x,base);c.quadraticCurveTo(x+lean*.2,(base+top)/2,x+lean,top);c.stroke();
    c.fillStyle=T.mid[0];for(let f=0;f<5;f++){const a=-Math.PI*(.1+f*.2);c.beginPath();c.moveTo(x+lean,top);c.quadraticCurveTo(x+lean+Math.cos(a)*k*.9,top+Math.sin(a)*k*.6-k*.2,x+lean+Math.cos(a)*k*1.3,top+Math.sin(a)*k*.2+k*.5);c.quadraticCurveTo(x+lean+Math.cos(a)*k*.6,top+k*.1,x+lean,top);c.fill();}}
   c.lineWidth=1.5;c.strokeStyle=T.midLine;for(let n=0;n<3;n++){const x=W*(.2+n*.3),bw=k*1.1,bh=k*1.3;for(let s=0;s<4;s++){c.fillStyle=s%2?T.mid[3]:['#e88a7a','#7cc0d8','#f3c66a'][n];c.fillRect(x+s*bw/4,H-bh,bw/4,bh);}
    c.fillStyle=T.mid[1];c.beginPath();c.moveTo(x-4,H-bh);c.lineTo(x+bw/2,H-bh-k*.45);c.lineTo(x+bw+4,H-bh);c.fill();c.stroke();}
  }
 }
 function build(){strips.length=0;for(let i=0;i<3;i++){const far=document.createElement('canvas'),mid=document.createElement('canvas');
  far.width=Math.round(tw*dpr);far.height=Math.round(farH*dpr);mid.width=Math.round(tw*dpr);mid.height=Math.round(midH*dpr);
  const fc=far.getContext('2d')!,mc=mid.getContext('2d')!;fc.scale(dpr,dpr);mc.scale(dpr,dpr);paintFar(i,fc,tw,farH);paintMid(i,mc,tw,midH,L.k);strips.push({far,mid});}}

 /* ---- characters ---- */
 function capsule(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){const r=w/2;c.beginPath();c.moveTo(x,y+r);c.arc(x+r,y+r,r,Math.PI,0);c.lineTo(x+w,y+h-r);c.arc(x+r,y+h-r,r,0,Math.PI);c.closePath();}
 /** A side-on bean in metres (u px per metre), feet at (0,0), facing +x. pose 0 run, 1 air, 2 slide, 3 lying tackle, 4 keeper. */
 function bean(c:CanvasRenderingContext2D,u:number,pose:number,ph:number,kit:string,kitD:string,num:string){
  const lw=Math.max(2,u*.075);c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;
  // legs: thick ink, a boot at the end
  let f1x=0,f1y=0,f2x=0,f2y=0;
  if(pose===0){f1x=Math.sin(ph)*.24;f1y=Math.max(0,Math.cos(ph))*.14;f2x=-Math.sin(ph)*.24;f2y=Math.max(0,-Math.cos(ph))*.14;}
  else if(pose===1){f1x=.16;f1y=.2;f2x=-.12;f2y=.3;}else if(pose===2||pose===3){f1x=.5;f1y=.06;f2x=.12;f2y=.04;}else{f1x=.14;f2x=-.14;}
  const hipY=pose===2||pose===3?.22:.42;
  for(const [fx,fy,back] of [[f2x,f2y,1],[f1x,f1y,0]] as const){c.lineWidth=u*.13;c.strokeStyle=back?'#3b2f4c':INK;c.beginPath();c.moveTo(0,-hipY*u);c.lineTo(fx*u*.55,-(fy+hipY*.45)*u);c.lineTo(fx*u,-(fy+.05)*u);c.stroke();
   c.fillStyle=back?'#3b2f4c':SUN;c.beginPath();c.ellipse((fx+.05)*u,-(fy+.04)*u,.1*u,.055*u,0,0,6.283);c.fill();c.lineWidth=lw*.7;c.strokeStyle=INK;c.stroke();}
  // body: one bean capsule, face area on top, the shirt below
  c.save();const by=pose===2||pose===3?.16:.36,bh=.84,bw=.52;
  if(pose===2)c.rotate(-.55);else if(pose===3)c.rotate(-1.25);else if(pose===0)c.rotate(.12);
  // back arm
  c.fillStyle=kitD;c.beginPath();c.ellipse(-.08*u+Math.sin(ph)*.14*u,-(by+.24)*u,.07*u,.1*u,Math.sin(ph)*.5,0,6.283);c.fill();c.lineWidth=lw*.8;c.stroke();
  capsule(c,-bw/2*u,-(by+bh)*u,bw*u,bh*u);c.fillStyle=kit;c.fill();c.save();capsule(c,-bw/2*u,-(by+bh)*u,bw*u,bh*u);c.clip();
  c.fillStyle=kitD;c.fillRect(-bw/2*u,-(by+bh)*u,bw*.32*u,bh*u);// shade on the back
  c.fillStyle=SKIN;c.beginPath();c.ellipse(.05*u,-(by+bh-.2)*u,.34*u,.25*u,0,0,6.283);c.fill();
  c.fillStyle='rgba(98,80,143,.25)';c.fillRect(-bw/2*u,-(by+bh)*u,bw*.22*u,bh*.6*u);
  c.fillStyle=INK;c.beginPath();c.ellipse(-.08*u,-(by+bh-.02)*u,.32*u,.11*u,-.2,0,6.283);c.fill();// hair
  c.restore();capsule(c,-bw/2*u,-(by+bh)*u,bw*u,bh*u);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.moveTo(-bw/2*u+2,-(by+bh*.55)*u);c.quadraticCurveTo(0,-(by+bh*.5)*u,bw/2*u-2,-(by+bh*.55)*u);c.lineWidth=lw*.6;c.stroke();// collar line
  c.fillStyle=INK;c.beginPath();c.ellipse(.15*u,-(by+bh-.22)*u,.035*u,.06*u,0,0,6.283);c.fill();// the eye looks ahead
  if(pose===3){c.lineWidth=lw*.7;c.beginPath();c.moveTo(.08*u,-(by+bh-.3)*u);c.lineTo(.2*u,-(by+bh-.27)*u);c.stroke();}
  if(num){c.fillStyle=PAPER;c.font=`italic 900 ${(.24*u).toFixed(1)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(num,-.02*u,-(by+bh*.28)*u);}
  // front arm
  const ay=pose===4?-(by+bh+.05):-(by+.24);c.fillStyle=pose===4?PAPER:kit;c.beginPath();c.ellipse((.06-Math.sin(ph)*.14)*u,ay*u,.08*u,.11*u,-Math.sin(ph)*.5,0,6.283);c.fill();c.lineWidth=lw*.8;c.stroke();
  c.restore();
 }
 function ball(c:CanvasRenderingContext2D,x:number,y:number,r:number,spin:number){
  c.beginPath();c.arc(x,y,r,0,6.283);c.fillStyle=PAPER;c.fill();c.save();c.clip();c.fillStyle='rgba(98,80,143,.3)';c.fillRect(x+r*.2,y-r,r,r*2);c.restore();
  c.fillStyle=INK;c.beginPath();for(let i=0;i<5;i++){const a=spin+i*1.2566;const px=x+Math.cos(a)*r*.42,py=y+Math.sin(a)*r*.42;if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.closePath();c.fill();
  c.beginPath();c.arc(x,y,r,0,6.283);c.lineWidth=Math.max(1.6,r*.28);c.strokeStyle=INK;c.stroke();
 }
 function dog(c:CanvasRenderingContext2D,u:number,t:number,carrying:boolean){// facing -x (it runs at the bean)
  const lw=Math.max(2,u*.07),leg=Math.sin(t*16)*.12;c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;
  c.lineWidth=u*.09;for(const [lx,o] of [[-.28,leg],[-.12,-leg],[.18,-leg],[.32,leg]] as const){c.beginPath();c.moveTo(lx*u,-.3*u);c.lineTo((lx+o)*u,-.02*u);c.stroke();}
  c.beginPath();c.ellipse(.03*u,-.38*u,.38*u,.17*u,0,0,6.283);c.fillStyle='#fff6e6';c.fill();c.lineWidth=lw;c.stroke();
  c.save();c.clip();c.fillStyle='#c98a4a';c.beginPath();c.ellipse(.15*u,-.44*u,.14*u,.1*u,0,0,6.283);c.fill();c.restore();
  c.beginPath();c.moveTo(.38*u,-.45*u);c.quadraticCurveTo(.56*u,-(.68+Math.sin(t*20)*.08)*u,.52*u,-.78*u);c.lineWidth=u*.06;c.stroke();// tail
  c.beginPath();c.ellipse(-.38*u,-.55*u,.17*u,.14*u,0,0,6.283);c.fillStyle='#fff6e6';c.fill();c.lineWidth=lw;c.stroke();
  c.beginPath();c.ellipse(-.52*u,-.5*u,.09*u,.07*u,0,0,6.283);c.fill();c.stroke();c.fillStyle=INK;c.beginPath();c.arc(-.6*u,-.52*u,.03*u,0,6.283);c.fill();
  c.fillStyle='#c98a4a';c.beginPath();c.ellipse(-.3*u,-.62*u,.07*u,.13*u,.5,0,6.283);c.fill();c.stroke();
  c.fillStyle=INK;c.beginPath();c.arc(-.42*u,-.58*u,.028*u,0,6.283);c.fill();
  if(carrying)ball(c,-.62*u,-.4*u,.13*u,t*3);
 }

 /* ---- effects ---- */
 function spawn(kind:number,x:number,y:number,vx:number,vy:number,life:number,color:string,r:number){const p=parts[partI];partI=(partI+1)%parts.length;p.on=true;p.kind=kind;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.t0=now();p.life=life;p.color=color;p.r=r;}
 const burstOf=(kind:number,x:number,y:number,n:number,sp:number,colors:readonly string[],r:number,life=.6,up=2)=>{for(let i=0;i<n;i++){const a=prand()*6.283,s=sp*(.4+prand()*.6);spawn(kind,x,y,Math.cos(a)*s,Math.sin(a)*s*.7+up,life*(.7+prand()*.5),colors[i%colors.length],r*(.6+prand()*.6));}};
 const pop=(x:number,y:number,n:number)=>{const p=pops[popI];popI=(popI+1)%pops.length;p.on=true;p.x=x;p.y=y;p.n=n;p.t0=now();};
 const shake=(a:number)=>{if(reduced)return;shakeT0=now();shakeAmp=a;};

 let lastState:DashState|null=null;
 return {
  layout:L,
  resize(w:number,h:number,ratio:number){dpr=ratio;L.w=w;L.h=h;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
   L.k=Math.max(20,Math.min(56,w/11));L.gy=Math.round(h*.63);tw=Math.ceil(w*1.6);farH=Math.round(L.gy*.4);midH=Math.round(Math.min(L.gy*.62,L.k*7.5));
   L.prompt.r=0;build();},
  reset(){for(const p of parts)p.on=false;for(const p of pops)p.on=false;camY=0;zoom=1;shakeT0=-1e9;flashT0=-1e9;},
  onEvent(e:DashEvent){
   switch(e.type){
    case 'jump':burstOf(0,e.x-.1,e.y+.05,4,1.2,['#fff6e6'],.12,.35,.4);break;
    case 'land':if(e.a>.35)burstOf(0,e.x,e.y+.05,6,1.6,['#fff6e6'],.13,.4,.5);break;
    case 'slide':burstOf(0,e.x+.2,e.y+.05,5,1.4,['#fff6e6'],.12,.4,.6);break;
    case 'volley':burstOf(1,e.x+.1,e.y,5,3,[SUN,PAPER],.08,.25,0);break;
    case 'crate':burstOf(2,e.x,e.y-.4,14,5,['#c98a4a','#8a5a2e',PAPER],.12,.9,3.5);shake(5);pop(e.x,e.y+.3,e.points);break;
    case 'gate':burstOf(1,e.x,e.y-.2,10,4,[ORANGE,PAPER,SUN],.09,.6,2);pop(e.x,e.y+.3,e.points);break;
    case 'goal':burstOf(3,e.x,e.y,22,5,[SUN,RED,TEAL,PAPER],.1,1.2,4);shake(6);pop(e.x,e.y+.6,e.points);flashT0=now();break;
    case 'star':burstOf(1,e.x,e.y,5,2.5,[SUN,PAPER],.07,.35,0);break;
    case 'near':pop(e.x,e.y,e.points);break;
    case 'hit':case 'oops':burstOf(4,e.x,e.y,9,4,[SUN,PAPER,RED],.11,.55,1.5);shake(e.type==='hit'?11:4);break;
    case 'fall':burstOf(5,e.x,0,12,3,lastState&&lastState.theme===2?['#9ad6e8',PAPER]:['#5a5170','#fff6e6'],.12,.7,3);break;
   }
  },
  render(game:StreetDash,frameT:number){
   const s=game.state,b=s.bean,c=g,W=L.w,H=L.h,t=frameT;lastState=s;
   // camera: zooms out a little with speed; the bean sits 30% from the left; follows the ground height, not the jump
   const zTarget=1+.18*Math.min(1,Math.max(0,(s.speed-SD.v0)/(SD.vCap-SD.v0)));zoom+=(zTarget-zoom)*.04;const k=L.k/zoom;
   const wantY=b.ground?b.y:Math.min(camY,b.y);camY+=(wantY-camY)*(b.ground?.08:.04);
   camX=b.x-.3*W/k;let ox=0,oy=0;const st=t-shakeT0;
   if(st<.3){const a=shakeAmp*(1-st/.3);ox=Math.sin(st*90)*a;oy=Math.cos(st*70)*a*.6;}
   const X=(x:number)=>(x-camX)*k+ox,Y=(y:number)=>L.gy-(y-camY)*k+oy;
   c.setTransform(dpr,0,0,dpr,0,0);
   // backdrop: the current theme, cross-faded in over the first 40 m
   const into=(s.dist%SD.themeM),fade=s.dist>SD.themeM&&into<24?into/24:1,prev=(s.theme+2)%3;
   const drawSky=(i:number,alpha:number)=>{const T=THEMES[i],gy=Y(0);c.globalAlpha=alpha;
    c.fillStyle=T.sky[0];c.fillRect(0,0,W,gy*.45);c.fillStyle=T.sky[1];c.fillRect(0,gy*.45,W,gy*.3);c.fillStyle=T.sky[2];c.fillRect(0,gy*.75,W,gy*.25+1);
    const sx=W*(i===1?.3:.74),sy=gy*(i===1?.62:.22),r=Math.min(W,H)*.09;c.fillStyle=T.sunRing;c.beginPath();c.arc(sx,sy,r*1.35,0,6.283);c.fill();c.fillStyle=T.sun;c.beginPath();c.arc(sx,sy,r,0,6.283);c.fill();
    // a halftone turn under the sky: rows of dots that grow toward the horizon
    c.fillStyle=T.dot;for(let row=0;row<7;row++){const yy=4+row*10,rr=2.6-row*.32;for(let x=(row%2)*6;x<W;x+=12){c.beginPath();c.arc(x,yy,rr,0,6.283);c.fill();}}// the print's dot screen, densest at the top
    {const cf=((camX*k*.05*(reduced?.35:1))%(W*1.5)+W*1.5)%(W*1.5);c.fillStyle=i===1?'#ffd9a8':'#fffaf0';
     for(let n=0;n<4;n++){const cx=((n*W*.47+W*.2-cf)%(W*1.5)+W*1.5)%(W*1.5)-W*.25,cy=gy*(.2+((n*37)%5)*.06),cw=W*(.16+(n%3)*.05);
      c.beginPath();c.ellipse(cx,cy,cw,cw*.22,0,0,6.283);c.ellipse(cx-cw*.35,cy-cw*.12,cw*.36,cw*.26,0,0,6.283);c.ellipse(cx+cw*.25,cy-cw*.16,cw*.42,cw*.3,0,0,6.283);c.fill();}}
    const par=reduced?.35:1,fo=((camX*k*.12*par)%tw+tw)%tw,mo=((camX*k*.4*par)%tw+tw)%tw,S=strips[i];
    if(S){const fy=gy-farH-L.k*1.2,my=gy-midH;c.drawImage(S.far,-fo,fy,tw,farH);c.drawImage(S.far,tw-fo,fy,tw,farH);c.drawImage(S.mid,-mo,my,tw,midH);c.drawImage(S.mid,tw-mo,my,tw,midH);}
    c.globalAlpha=1;};
   if(fade<1)drawSky(prev,1);drawSky(s.theme,fade);
   // speed lines across the sky band
   if(!reduced&&s.speed>7.4){c.strokeStyle='rgba(255,243,214,.75)';c.lineWidth=2;const n=6,a=Math.min(1,(s.speed-7.4)/2.5);c.globalAlpha=a;
    for(let i=0;i<n;i++){const yy=L.gy*(.2+i*.11),len=W*.12,xx=W-((t*W*1.6+i*W*.37)%(W*1.4));c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+len,yy);c.stroke();}c.globalAlpha=1;}
   // below the street: the gaps' dark (or the sea on the beach)
   const T=THEMES[s.theme],y0=Y(0);c.fillStyle=T.void;c.fillRect(0,y0,W,H-y0);
   if(s.theme===2){c.strokeStyle='#5fb3cf';c.lineWidth=2;for(let r=0;r<4;r++){const yy=y0+20+r*26;c.beginPath();for(let x=-20;x<W+20;x+=20){const xx=x-((camX*k)%20);c.moveTo(xx,yy);c.quadraticCurveTo(xx+5,yy-4,xx+10,yy);}c.stroke();}}
   // wind
   for(const w of s.winds){if(!w.on)continue;const a=X(w.x0),z=X(w.x1);if(z<0||a>W)continue;c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2.2;
    for(let i=0;i<7;i++){const yy=Y(.6+i*.38),xx=a+(((i*97+(reduced?0:t*k*9))%(z-a+60))+(z-a+60))%(z-a+60)-30;c.beginPath();c.moveTo(z-(xx-a),yy);c.lineTo(z-(xx-a)+k*.9,yy);c.arc(z-(xx-a)+k*.9,yy-k*.12,k*.12,Math.PI/2,-Math.PI/2,true);c.stroke();}}
   // the goals stand behind the street
   for(const z of s.haz)if(z.on&&z.kind===HZ.goal)drawGoal(z,X,Y,k,t,s.t);
   // the ground
   for(const sg of s.segs)if(sg.on)drawSeg(sg,X,Y,k,game.topOf(sg));
   // stars
   for(const st2 of s.stars){if(!st2.on||st2.got)continue;const x=X(st2.x),y=Y(st2.y);if(x<-20||x>W+20)continue;const r=k*.2,sq=reduced?1:.75+.25*Math.abs(Math.cos(t*3+st2.x));
    c.save();c.translate(x,y);c.scale(sq,1);c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fillStyle=SUN;c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();c.restore();}
   // hazards
   for(const z of s.haz){if(!z.on||z.kind===HZ.goal)continue;const x=X(z.x);if(x>W+k*4||x+z.w*k<-k*2)continue;drawHaz(z,X,Y,k,t,s.t);}
   // the volley aim: a ring on the target and the prompt in the thumb zone
   L.target.r=0;L.prompt.r=0;
   if(s.aim>=0&&!s.over){const z=s.haz[s.aim],tx=X(z.x+z.w/2),ty=Y(z.y+z.h*.55),p=reduced?1:1+.08*Math.sin(t*10);
    L.target.x=tx;L.target.y=ty;L.target.r=Math.max(44,k*1.2);
    c.lineWidth=4;c.strokeStyle=INK;c.beginPath();c.arc(tx,ty,k*.72*p,0,6.283);c.stroke();c.lineWidth=3;c.strokeStyle=SUN;c.setLineDash([7,5]);c.beginPath();c.arc(tx,ty,k*.72*p,0,6.283);c.stroke();c.setLineDash([]);
    const px=W*.76,py=Y(0)+(H-Y(0))*.48,pr=Math.max(34,Math.min(52,W*.11))*p;L.prompt.x=px;L.prompt.y=py;L.prompt.r=pr;
    c.fillStyle=INK;c.beginPath();c.arc(px+5,py+5,pr,0,6.283);c.fill();c.fillStyle=SUN;c.beginPath();c.arc(px,py,pr,0,6.283);c.fill();c.lineWidth=4;c.strokeStyle=INK;c.stroke();
    ball(c,px,py-pr*.18,pr*.38,t*2);c.fillStyle=INK;c.font=`italic 900 ${Math.round(pr*.34)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('SHOOT',px,py+pr*.5);
    // a dotted line from the ball to the ring
    c.strokeStyle='rgba(35,26,46,.55)';c.lineWidth=2;c.setLineDash([3,6]);c.beginPath();c.moveTo(X(b.x+.35),Y(b.y+.2));c.lineTo(tx,ty);c.stroke();c.setLineDash([]);}
   // the bean (and its ball)
   const bx=X(b.x),byy=Y(b.y),blink=s.invuln>0&&Math.floor(s.invuln*12)%2===0;
   c.fillStyle='rgba(35,26,46,.25)';{let gy2=b.y;if(!b.ground){gy2=-9;for(const sg of s.segs)if(sg.on&&b.x>=sg.x0&&b.x<=sg.x1){const tp=game.topOf(sg);if(tp<=b.y+.01&&tp>gy2)gy2=tp;}}
    if(gy2>-9){const sc2=Math.max(.3,1-(b.y-gy2)*.3);c.beginPath();c.ellipse(bx,Y(gy2),k*.34*sc2,k*.08*sc2,0,0,6.283);c.fill();}}
   const pose=b.slide>0?2:b.ground?0:1,ph=b.run*2.6;
   if(!blink){c.save();c.translate(bx,byy+(pose===0?-Math.abs(Math.sin(ph))*k*.05:0));bean(c,k*BEAN_SCALE,pose,ph,TEAL,TEAL_D,'');c.restore();}
   {const B=s.ball;let fx:number,fy:number,r=k*.15,spin=b.run*3;
    const feetX=b.x+(pose===2?.75:.42),feetY=b.y+(b.ground?.15+Math.abs(Math.sin(ph))*.18:.12);
    if(B.mode===0){fx=feetX;fy=feetY;}
    else if(B.mode===1){const f=Math.min(1,B.t/B.dur);fx=B.fx+(B.tx-B.fx)*f;fy=B.fy+(B.ty-B.fy)*f+Math.sin(f*Math.PI)*.4;spin=t*20;}
    else if(B.mode===2){const f=Math.min(1,B.t/B.dur);fx=B.fx+(feetX-B.fx)*f;fy=B.fy+(feetY-B.fy)*f+Math.sin(f*Math.PI)*1.1;spin=-t*12;}
    else{const f=Math.min(1,B.t/B.dur);fx=b.x-1.6*(1-f)+.34*f;fy=b.y+.15+Math.abs(Math.sin(f*Math.PI*2.5))*(1-f)*1.4;spin=-t*14;}
    if(B.mode!==3||!blink||B.t>.15)ball(c,X(fx),Y(fy),r,spin);}
   // effects
   const tn=now();
   for(const p of parts){if(!p.on)continue;const a=(tn-p.t0)/p.life;if(a>=1){p.on=false;continue;}const tt=tn-p.t0,x=X(p.x+p.vx*tt),y=Y(p.y+p.vy*tt-(p.kind===0?1:6)*tt*tt);
    c.globalAlpha=1-a;c.fillStyle=p.color;if(p.kind===0){c.beginPath();c.arc(x,y,p.r*k*(1+a*1.5),0,6.283);c.fill();c.lineWidth=1.5;c.strokeStyle='rgba(35,26,46,.35)';c.stroke();}
    else if(p.kind===2){c.save();c.translate(x,y);c.rotate(tt*8+p.r*20);c.fillRect(-p.r*k,-p.r*k*.35,p.r*k*2,p.r*k*.7);c.lineWidth=1.5;c.strokeStyle=INK;c.strokeRect(-p.r*k,-p.r*k*.35,p.r*k*2,p.r*k*.7);c.restore();}
    else{c.beginPath();c.arc(x,y,p.r*k,0,6.283);c.fill();if(p.kind!==5){c.lineWidth=1.5;c.strokeStyle=INK;c.stroke();}}}
   c.globalAlpha=1;c.textAlign='center';c.textBaseline='middle';
   for(const p of pops){if(!p.on)continue;const a=(tn-p.t0)/1;if(a>=1){p.on=false;continue;}const x=X(p.x),y=Y(p.y)-a*k*1.4;c.globalAlpha=a>.7?(1-a)/.3:1;
    c.font=`italic 900 ${Math.round(k*.62)}px "Arial Black",Impact,sans-serif`;c.lineWidth=6;c.strokeStyle=INK;c.strokeText('+'+p.n,x,y);c.fillStyle=SUN;c.fillText('+'+p.n,x,y);}
   c.globalAlpha=1;
   // the next hazard, just off the right edge: an ink tab with a bang, so nothing arrives unannounced
   for(const z of s.haz){if(!z.on||z.kind===HZ.goal||z.spent||z.done)continue;const x=X(z.x);if(x<=W||x>W+k*5)continue;const y=Y(z.y+Math.min(z.h,1.2)*.5),f=1-(x-W)/(k*5);
    c.globalAlpha=.35+.65*f;c.fillStyle=z.kind===HZ.crate||z.kind===HZ.gate?SUN:RED;c.beginPath();c.moveTo(W,y-14);c.lineTo(W-18,y);c.lineTo(W,y+14);c.closePath();c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
    c.fillStyle=INK;c.font='900 13px "Arial Black",Impact,sans-serif';c.fillText('!',W-6,y+1);}
   c.globalAlpha=1;
   if(s.t<14&&!s.over){c.globalAlpha=Math.min(1,(14-s.t)/2)*.85;c.fillStyle=PAPER;c.font=`800 ${Math.round(Math.min(17,W*.042))}px system-ui,sans-serif`;c.textAlign='center';c.fillText('Tap: jump · Hold: higher · Swipe down: slide',W/2,H-Math.max(40,(H-L.gy)*.22));c.globalAlpha=1;}
   if(t-flashT0<.12&&!reduced){c.fillStyle='rgba(255,243,214,.45)';c.fillRect(0,0,W,H);}
  },
  dispose(){strips.length=0;},
 };

 function drawSeg(sg:Seg,X:(x:number)=>number,Y:(y:number)=>number,k:number,top:number){
  const c=g,x0=X(sg.x0),x1=X(sg.x1);if(x1<-4||x0>L.w+4)return;const T=THEMES[sg.theme],y=Y(top),lw=3;
  if(sg.amp){// a moving plank: hazard stripes on its edge so it reads as "ride me"
   const th=k*.32;c.fillStyle=INK;c.fillRect(x0+4,y+4,x1-x0,th);c.fillStyle='#c98a4a';c.fillRect(x0,y,x1-x0,th);c.fillStyle=SUN;for(let x=x0+6;x<x1-8;x+=k*.6){c.beginPath();c.moveTo(x,y+th);c.lineTo(x+k*.25,y);c.lineTo(x+k*.42,y);c.lineTo(x+k*.17,y+th);c.fill();}
   c.lineWidth=lw;c.strokeStyle=INK;c.strokeRect(x0,y,x1-x0,th);
   c.strokeStyle='rgba(35,26,46,.5)';c.lineWidth=2;for(const ax of [x0+k*.3,x1-k*.3]){c.beginPath();c.moveTo(ax,y);c.lineTo(ax,0);c.stroke();}return;}
  const th=k*.3,bottom=L.h+20;
  c.fillStyle=T.body;c.fillRect(x0,y,x1-x0,bottom-y);
  // the body: kerb blocks (street), a brick wall with windows (roofs), packed sand (beach)
  c.fillStyle=T.bodyLine;
  if(sg.theme===1){const step=k*1.6,start=x0-((sg.x0*k)%step);for(let x=start;x<x1;x+=step){if(x+k*.6<x0||x>x1)continue;for(let r=0;r<3;r++){const wy=y+th+k*(.7+r*1.4);if(wy>L.h)break;c.fillStyle=r===0&&Math.floor(x/step)%3===0?'#ffcf7a':'#5e3142';c.fillRect(Math.max(x0,x+k*.4),wy,Math.min(k*.55,x1-x-k*.4),k*.7);}}}
  else if(sg.theme===0){c.fillStyle='#b9a787';c.fillRect(x0,y+th,x1-x0,k*.32);c.fillStyle=T.bodyLine;c.fillRect(x0,y+th+k*.32,x1-x0,3);
   const ly=y+th+k*2.1,step=k*1.8,start=x0-((sg.x0*k)%step);c.fillStyle='#e9d5ad';for(let x=start;x<x1;x+=step){const a=Math.max(x0,x),b2=Math.min(x1,x+k*.9);if(b2>a)c.fillRect(a,ly,b2-a,5);}
   c.fillStyle=T.bodyLine;for(let yy=y+th+k*3;yy<L.h;yy+=9)for(let x=x0+((yy/9)%2)*5;x<x1;x+=10){c.beginPath();c.arc(x,yy,1.6,0,6.283);c.fill();}}
  else{for(let i=0;i<Math.min(60,(x1-x0)/8);i++){const px=x0+((i*53.7+sg.id*13)%(x1-x0)),py=y+th+((i*37.3)%(Math.max(1,L.h-y-th)));c.fillRect(px,py,3,3);}}
  c.fillStyle=T.top;c.fillRect(x0,y,x1-x0,th);c.fillStyle=T.topEdge;
  if(sg.theme===0){const step=k*1.2,start=x0-((sg.x0*k)%step);for(let x=start;x<x1;x+=step)if(x>x0)c.fillRect(x,y+2,2,th-2);c.fillRect(x0,y+th-4,x1-x0,4);}
  else if(sg.theme===1){const step=k*.5,start=x0-((sg.x0*k)%step);c.beginPath();for(let x=start;x<x1;x+=step){if(x+step<x0)continue;c.moveTo(x+step,y+th*.6);c.arc(x+step/2,y+th*.6,step/2,0,Math.PI);}c.fill();}
  else{const step=k*.7,start=x0-((sg.x0*k)%step);for(let x=start;x<x1;x+=step)if(x>x0)c.fillRect(x,y+3,2,th-3);}
  c.lineWidth=lw;c.strokeStyle=INK;c.beginPath();c.moveTo(x0,bottom);c.lineTo(x0,y);c.lineTo(x1,y);c.lineTo(x1,bottom);c.stroke();
 }
 function drawHaz(z:Haz,X:(x:number)=>number,Y:(y:number)=>number,k:number,t:number,simT:number){
  const c=g,x=X(z.x),y=Y(z.y),w=z.w*k,h=z.h*k,lw=Math.max(3,k*.1);c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=lw;
  switch(z.kind){
   case HZ.wall:{c.fillStyle=INK;c.fillRect(x+4,y-h+4,w,h);c.fillStyle='#e0603a';c.fillRect(x,y-h,w,h);c.fillStyle='#b8432c';c.fillRect(x-2,y-h,w+4,h*.2);
    c.fillStyle='rgba(255,243,214,.7)';for(let r=1;r<3;r++)c.fillRect(x,y-h+h*.2+r*(h*.8/3),w,2);c.fillRect(x+w*.5,y-h*.55,2,h*.25);
    c.strokeRect(x-2,y-h,w+4,h*.2);c.strokeRect(x,y-h,w,h);break;}
   case HZ.tackle:{const live=z.live&&z.moved<z.run&&!z.spent;c.save();c.translate(x+w*.5,y);c.scale(-1,1);bean(c,k,3,t*10,VIOLET,VIOLET_D,'4');c.restore();
    if(live&&!reduced)for(let i=0;i<3;i++){c.fillStyle='rgba(255,246,230,.85)';c.beginPath();c.arc(x+w*.9+i*k*.3,y-k*.12,k*(.12+i*.04),0,6.283);c.fill();}break;}
   case HZ.banner:{const top=Y(z.y+1.25);c.strokeStyle=INK;c.lineWidth=2;for(const rx of [x+w*.1,x+w*.9]){c.beginPath();c.moveTo(rx,top);c.lineTo(rx,top-k*2.2);c.stroke();}c.beginPath();c.moveTo(x-k*1.5,top-k*2.3);c.quadraticCurveTo(x+w/2,top-k*1.9,x+w+k*1.5,top-k*2.3);c.stroke();
    c.fillStyle=INK;c.fillRect(x+4,top+4,w,y-top);c.fillStyle=SUN;c.fillRect(x,top,w,y-top);c.fillStyle=RED;c.fillRect(x,top+(y-top)*.3,w,(y-top)*.28);
    c.fillStyle=PAPER;c.font=`italic 900 ${Math.round((y-top)*.22)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('CUP',x+w/2,top+(y-top)*.45);
    c.lineWidth=lw;c.strokeStyle=INK;c.strokeRect(x,top,w,y-top);
    c.fillStyle=SUN;c.beginPath();for(let fx=x;fx<x+w-1;fx+=k*.3){c.moveTo(fx,y);c.lineTo(fx+k*.15,y+k*.16);c.lineTo(fx+k*.3,y);}c.fill();c.lineWidth=2;c.stroke();break;}
   case HZ.crate:{if(z.done&&simT>=z.doneAt)break;
    c.fillStyle=INK;c.fillRect(x+4,y-h+4,w,h);c.fillStyle='#d49a5a';c.fillRect(x,y-h,w,h);c.fillStyle='#a8703a';c.fillRect(x,y-h,w,h*.14);c.fillRect(x,y-h*.14,w,h*.14);
    c.strokeStyle='#8a5a2e';c.lineWidth=lw*.9;c.beginPath();c.moveTo(x+w*.12,y-h*.86);c.lineTo(x+w*.88,y-h*.14);c.moveTo(x+w*.88,y-h*.86);c.lineTo(x+w*.12,y-h*.14);c.stroke();
    c.strokeStyle=INK;c.lineWidth=lw;c.strokeRect(x,y-h,w,h);break;}
   case HZ.puddle:{c.fillStyle='#4a9fe0';c.beginPath();c.ellipse(x+w/2,y+k*.06,w/2+k*.08,k*.16,0,0,6.283);c.fill();c.lineWidth=2.5;c.stroke();
    c.fillStyle='#bfe6fa';c.beginPath();c.ellipse(x+w*.35,y+k*.03,w*.16,k*.04,0,0,6.283);c.fill();
    if(!reduced){const r=(t*1.6+z.x)%1;c.strokeStyle=`rgba(255,255,255,${(1-r).toFixed(2)})`;c.lineWidth=1.5;c.beginPath();c.ellipse(x+w*.6,y+k*.06,w*.12*(1+r*2),k*.04*(1+r*2),0,0,6.283);c.stroke();}break;}
   case HZ.dog:{c.save();c.translate(x+w*.5,y);if(z.spent)c.scale(-1,1);dog(c,k,t,z.spent);c.restore();break;}
   case HZ.gate:{const open=z.done?Math.min(1,Math.max(0,(simT-z.doneAt)/.3)):0;
    // two cones with a striped pole between them that swings flat when the volley hits
    const cone=(cx:number,s:number)=>{c.fillStyle=ORANGE;c.beginPath();c.moveTo(cx-k*.28*s,y);c.lineTo(cx,y-k*.62*s);c.lineTo(cx+k*.28*s,y);c.closePath();c.fill();c.lineWidth=lw*.8;c.stroke();c.fillStyle=PAPER;c.fillRect(cx-k*.12*s,y-k*.36*s,k*.24*s,k*.09*s);};
    c.save();c.translate(x+w*.5,y-k*.5);c.rotate(-open*1.45);c.fillStyle=INK;c.fillRect(-k*.1+3,-h+k*.5+3,k*.2,h-k*.5);
    for(let i=0;i<5;i++){c.fillStyle=i%2?PAPER:RED;c.fillRect(-k*.1,-h+k*.5+i*(h-k*.5)/5,k*.2,(h-k*.5)/5+1);}c.lineWidth=lw*.8;c.strokeStyle=INK;c.strokeRect(-k*.1,-h+k*.5,k*.2,h-k*.5);
    c.fillStyle=SUN;c.beginPath();c.moveTo(k*.1,-h+k*.5);c.lineTo(k*.55,-h+k*.62);c.lineTo(k*.1,-h+k*.78);c.fill();c.stroke();c.restore();
    cone(x+w*.5,1.05);break;}
  }
 }
 function drawGoal(z:Haz,X:(x:number)=>number,Y:(y:number)=>number,k:number,t:number,simT:number){
  const c=g,x=X(z.x),w=z.w*k,base=Y(0)-k*.05,h=z.h*k;if(x>L.w+k*3||x+w<-k*2)return;const lw=Math.max(2.5,k*.08),scored=z.done&&simT>=z.doneAt;
  // a painted wall behind, then the goal frame with its net
  c.fillStyle='rgba(35,26,46,.12)';c.fillRect(x-k*.3,base-h-k*.3,w+k*.6,h+k*.3);
  c.strokeStyle='rgba(35,26,46,.35)';c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(x+w*i/6,base-h);c.lineTo(x+w*i/6+(scored?k*.15:0),base);c.stroke();}for(let i=1;i<4;i++){c.beginPath();c.moveTo(x,base-h*i/4);c.quadraticCurveTo(x+w/2,base-h*i/4+(scored?k*.25:0),x+w,base-h*i/4);c.stroke();}
  // the keeper: a plywood cut-out on a spring that slides along the line (it dives when beaten)
  const kx=scored?x+w*.85:x+w*(.5+.32*Math.sin((reduced?0:t*2.2)+z.x)),tilt=scored?1.3:0;
  c.save();c.translate(kx,base);c.rotate(tilt);c.lineWidth=k*.14;c.strokeStyle=PAPER;c.save();c.scale(.85,.85);bean(c,k,4,0,'#f3c66a','#d98a1c','1');c.restore();c.restore();
  c.fillStyle='#fffaf0';c.strokeStyle=INK;c.lineWidth=lw;c.fillRect(x,base-h,k*.12,h);c.strokeRect(x,base-h,k*.12,h);c.fillRect(x+w-k*.12,base-h,k*.12,h);c.strokeRect(x+w-k*.12,base-h,k*.12,h);c.fillRect(x,base-h,w,k*.12);c.strokeRect(x,base-h,w,k*.12);
 }
}
