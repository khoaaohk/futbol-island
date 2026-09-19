import type {StoryId as AnyStoryId} from './stories';
type StoryId=Exclude<AnyStoryId,'futsl'>;
import {STORY_ACTIONS,sampleRoute} from './storyChoreography';

/** Original drawing implementation informed by the hand-drawn-canvas-animation
 * visual approach: seeded marks, offset contours, paper, and a drawn 12 fps cadence.
 * No upstream code, textures, fonts, player, or runtime dependencies are copied. */
const INK='#343e39',PAPER='#f5eddb',GREEN='#d4dfb9',LINE='#fbf5df';
type ActorName='LUNA'|'KAI'|'JAYDEN'|'MAYA'|'ZOE'|'COACH';
const CAST:Record<StoryId,readonly [ActorName,ActorName]>={reset:['LUNA','KAI'],regulate:['JAYDEN','COACH'],grit:['KAI','COACH'],empathy:['MAYA','ZOE'],loss:['LUNA','JAYDEN']};
const APPEARANCE:Record<ActorName,{skin:string;hair:string;shirt:string;shorts:string;style:number}>={
 LUNA:{skin:'#dca581',hair:'#674633',shirt:'#cf796c',shorts:'#526d66',style:0},
 KAI:{skin:'#b77f58',hair:'#353734',shirt:'#c6984f',shorts:'#5d6861',style:1},
 JAYDEN:{skin:'#a36f50',hair:'#39382f',shirt:'#7c9aa0',shorts:'#4a6262',style:2},
 MAYA:{skin:'#c58e6b',hair:'#514034',shirt:'#7a9580',shorts:'#56665e',style:3},
 ZOE:{skin:'#e5b899',hair:'#bc9457',shirt:'#b68c9c',shorts:'#66737b',style:4},
 COACH:{skin:'#c18c6c',hair:'#676253',shirt:'#5f8178',shorts:'#626854',style:5}
};
function random(seed:number){let state=seed>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
type Point=readonly [number,number];

export function createHandDrawnStoryGame(canvas:HTMLCanvasElement,id:StoryId){
 const context=canvas.getContext('2d');if(!context)return {act(_page:number){},dispose(){}};
 const c=context,bg=document.createElement('canvas'),b=bg.getContext('2d')!;
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 let reduced=media.matches,disposed=false,visible=true,raf=0,timer:ReturnType<typeof setTimeout>|undefined;
 let width=640,height=640,cssWidth=320,cssHeight=320,scale=1,page=0,elapsed=0,previous=0,draws=0;
 let action=STORY_ACTIONS[id][0];
 const cast=CAST[id];
 // Geometry is evaluated in CSS-independent logical units. Marks keep their seed.
 function stroke(ctx:CanvasRenderingContext2D,points:readonly Point[],color=INK,weight=2,seed=1,close=false){
  const r=random(seed);ctx.beginPath();points.forEach(([x,y],i)=>{const px=x+(r()-.5)*1.5,py=y+(r()-.5)*1.5;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});if(close)ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
 }
 function shape(ctx:CanvasRenderingContext2D,points:readonly Point[],fill:string,seed=1,line=INK){
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();stroke(ctx,points,line,1.8,seed,true);
 }
 function oval(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string,seed=1,line=INK){
  ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
  const points:Point[]=Array.from({length:24},(_,i)=>[x+Math.cos(i*Math.PI/12)*rx,y+Math.sin(i*Math.PI/12)*ry]);stroke(ctx,points,line,1.6,seed,true);
 }
 function hatch(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,seed:number,count=9){
  const r=random(seed);ctx.beginPath();for(let i=0;i<count;i++){const px=x+r()*w,py=y+r()*h;ctx.moveTo(px,py);ctx.lineTo(px+3+r()*5,py-2-r()*3);}ctx.strokeStyle=color;ctx.globalAlpha=.24;ctx.lineWidth=.8;ctx.stroke();ctx.globalAlpha=1;
 }
 const groundY=(y:number)=>height*.55+(y-165)/125*height*.36;
 const project=(p:Point):Point=>[p[0]*2,groundY(p[1])];
 function background(){
  bg.width=canvas.width;bg.height=canvas.height;b.setTransform(scale,0,0,scale,0,0);b.fillStyle=PAPER;b.fillRect(0,0,width,height);
  const r=random(918);b.fillStyle='#917d5c';b.globalAlpha=.075;for(let i=0;i<1400;i++)b.fillRect(r()*width,r()*height,.7+r()*.8,.7);b.globalAlpha=1;
  const horizon=height*.46;
  // A broad quiet sky keeps the dialogue distinct from the actors below it.
  shape(b,[[0,horizon+22],[80,horizon+4],[132,horizon+16],[238,horizon-8],[350,horizon+8],[483,horizon-6],[640,horizon+15],[640,height],[0,height]],GREEN,31,'#a8b68b');
  shape(b,[[0,horizon+4],[63,horizon-22],[140,horizon-7],[210,horizon+11],[0,horizon+32]],'#b8c6a0',32,'#a4b592');
  shape(b,[[470,horizon+12],[535,horizon-18],[604,horizon-7],[640,horizon+7],[640,horizon+34]],'#b8c6a0',33,'#a4b592');
  const top=groundY(168),bottom=groundY(295);
  stroke(b,[[85,top],[555,top],[614,bottom],[26,bottom],[85,top]],LINE,3,41);
  stroke(b,[[49,groundY(257)],[594,groundY(257)]],LINE,3,42);
  stroke(b,[[220,top],[208,groundY(210)],[432,groundY(210)],[420,top]],LINE,2.5,43);
  b.strokeStyle=LINE;b.lineWidth=2.5;b.beginPath();b.ellipse(320,groundY(257),58,height*.025,0,0,Math.PI*2);b.stroke();
  // Goal net: a handful of cached strokes, no repeated lattice generation.
  const gy=groundY(168);shape(b,[[261,gy],[268,gy-58],[372,gy-58],[382,gy]],'#e4e5ca',51,'#879987');
  for(let x=280;x<370;x+=16)stroke(b,[[x,gy-55],[x+3,gy]],'#a5b39b',1,52+x);
  for(let y=gy-45;y<gy;y+=13)stroke(b,[[269,y],[376,y]],'#a5b39b',1,Math.round(y));
  stroke(b,[[261,gy],[265,gy-61],[375,gy-61],[382,gy]],LINE,5,53);
  for(const x of [32,610]){stroke(b,[[x,horizon+25],[x-4,horizon-31]],'#998265',5,x);for(const end of [[-28,-41],[-15,-53],[18,-49],[29,-33]] as const)stroke(b,[[x-4,horizon-30],[x+end[0]*.65,horizon+end[1]],[x+end[0],horizon+end[1]+13]],'#879d7a',5,x+end[0]);}
  const bench=(x:number)=>{const y=groundY(270);shape(b,[[x-43,y-17],[x+39,y-17],[x+43,y-8],[x-46,y-8]],'#ba9b70',66);stroke(b,[[x-34,y-8],[x-34,y+13]],INK,3,67);stroke(b,[[x+32,y-8],[x+32,y+13]],INK,3,68);};
  if(id==='empathy')bench(476);else if(id==='loss'||id==='grit')bench(126);
  if(id==='grit')for(const [x,y] of [[180,221],[343,219],[420,263]]){const cy=groundY(y);shape(b,[[x-9,cy],[x,cy-23],[x+9,cy]],'#c28b58',x);stroke(b,[[x-12,cy+2],[x+12,cy+2]],'#956d43',3,x+1);}
  if(id==='loss'){const y=horizon-12;shape(b,[[448,y-50],[546,y-50],[546,y],[448,y]],'#566d60',74);b.fillStyle=PAPER;b.font='600 25px Georgia,serif';b.textAlign='center';b.fillText('1 – 2',497,y-15);stroke(b,[[465,y],[465,y+24]],'#8d7a59',4,75);stroke(b,[[530,y],[530,y+24]],'#8d7a59',4,76);}
  hatch(b,25,horizon+40,590,height-horizon-65,'#596f48',713,100);
 }
 function actor(name:ActorName,x:number,y:number,facing:number,moving:boolean,hero:boolean,t:number){
  const a=APPEARANCE[name],phase=elapsed*7.5,walk=moving&&!reduced?Math.sin(phase):0;
  const pose=hero?action.pose:undefined,settle=Math.sin(t*Math.PI),sitting=(pose==='sit'&&t>.65)||(id==='empathy'&&!hero&&page<8);
  const nod=pose==='nod'?Math.sin(t*Math.PI*4)*.045:0,bow=pose==='bow'?.15*(.35+.65*settle):0;
  const kick=hero&&!!action.ball&&t<.22?Math.sin(t/.22*Math.PI):0;
  const gesture=hero&&(action.cue==='listen'||action.cue==='team')?Math.sin(t*Math.PI)*.65:0;
  const breath=pose==='breathe'&&!reduced?Math.sin(t*Math.PI*2)*.035:0;
  const actorScale=Math.min(1.12,Math.max(.83,height/650));
  c.save();c.translate(x,y);c.scale(actorScale,actorScale);c.fillStyle='#526f48';c.globalAlpha=.12;c.beginPath();c.ellipse(0,3,28,7,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
  c.scale(facing,1);c.translate(0,sitting?7:Math.abs(walk)*-2);if(pose==='celebrate')c.translate(0,-Math.max(0,Math.sin(t*Math.PI*4))*7);
  const limb=(sx:number,sy:number,mx:number,my:number,ex:number,ey:number,color:string,w:number,seed:number)=>{stroke(c,[[sx,sy],[mx,my],[ex,ey]],INK,w+2.5,seed);stroke(c,[[sx,sy],[mx,my],[ex,ey]],color,w,seed+1);};
  // Legs have knees, socks and boots; contact remains at the feet.
  const leg=(side:number)=>{const step=walk*side*10+(side===1?kick*21:0),kneeX=side*10+step*.5+(sitting?13:0),footX=side*11+step+(sitting?16:0),footY=sitting?-5:-2-Math.max(0,walk*side)*4-kick*(side===1?10:0);limb(side*9,-40,kneeX,-22,footX,footY,a.skin,9,110+side);stroke(c,[[kneeX,-20],[footX,footY-3]],PAPER,8,120+side);oval(c,footX+3,footY,9,4,a.shorts,130+side);};leg(-1);leg(1);
  c.save();c.translate(0,-43);c.rotate(bow+nod);c.scale(1+breath,1+breath);
  const arm=(side:number)=>{const raised=pose==='celebrate'?.9:side===1?gesture:0,ax=side*23,ay=-28,mx=side*(28+raised*13),my=-8-raised*30-walk*side*3,ex=side*(24+raised*22),ey=4-raised*46+walk*side*5;limb(ax,ay,mx,my,ex,ey,a.skin,8,150+side);oval(c,ex,ey,4.5,5,a.skin,160+side);};arm(-1);
  shape(c,[[-19,-42],[17,-42],[26,-27],[19,-20],[18,5],[-20,5],[-21,-22],[-28,-27]],a.shirt,170);
  shape(c,[[-20,4],[18,4],[19,17],[2,17],[0,11],[-3,17],[-20,17]],a.shorts,171);
  stroke(c,[[-10,-39],[0,-33],[9,-39]],PAPER,3,172);hatch(c,-14,-28,29,29,'#31453b',173,8);
  // A tiny sewn football crest makes the kit read without canvas labels.
  oval(c,9,-24,4,5,PAPER,174,a.shirt);arm(1);
  c.save();c.translate(0,-57);c.rotate(bow*.55+nod);
  if(a.style===0||a.style===3||a.style===4)shape(c,[[-19,-15],[-25,12],[-18,31],[-9,15],[17,24],[24,11],[18,-15]],a.hair,181);
  oval(c,0,-3,19,23,a.skin,182);oval(c,18,0,4,6,a.skin,183);
  if(a.style===2){shape(c,[[-20,-5],[-23,-21],[-15,-29],[-7,-26],[1,-31],[8,-26],[17,-27],[21,-17],[17,-8],[9,-15],[-4,-15],[-15,-7]],a.hair,184);}
  else shape(c,[[-19,-1],[-21,-19],[-12,-27],[5,-28],[19,-20],[21,-7],[11,-14],[-3,-15],[-13,-5]],a.hair,185);
  if(a.style===0){oval(c,-22,-13,8,10,a.hair,186);stroke(c,[[-21,-20],[-19,-8]],a.shirt,4,187);}
  if(a.style===1){oval(c,-13,-26,10,8,a.hair,188);stroke(c,[[-15,-31],[-5,-28]],a.shirt,2,189);}
  if(a.style===3){stroke(c,[[-20,7],[-23,19],[-17,29]],a.hair,7,190);stroke(c,[[20,8],[24,19],[20,29]],a.hair,7,191);}
  if(a.style===4){shape(c,[[11,-18],[29,-12],[25,17],[18,13]],a.hair,192);stroke(c,[[16,-13],[23,-10]],a.shirt,3,193);}
  if(a.style===5){shape(c,[[-23,-19],[-15,-30],[9,-29],[18,-19],[29,-16],[28,-12],[-22,-14]],a.shorts,194);stroke(c,[[-11,14],[1,19],[12,12]],a.hair,4,195);}
  const sad=(hero&&(pose==='bow'||page===1))||(id==='empathy'&&!hero&&page<8);
  stroke(c,[[-10,-5],[-6,-5]],INK,2,201);stroke(c,[[6,-5],[10,-5]],INK,2,202);
  stroke(c,[[-11,-11],[-5,-12+(sad?3:0)]],a.hair,1.4,203);stroke(c,[[5,-12+(sad?3:0)],[11,-11]],a.hair,1.4,204);
  stroke(c,[[1,-2],[3,4],[0,5]],'#a16f52',1.1,205);stroke(c,[[-4,11],[1,sad?9:13],[6,11]],INK,1.2,206);
  c.restore();c.restore();c.restore();
 }
 function draw(){
  if(disposed||document.hidden||!visible)return;
  const t=Math.min(1,elapsed/action.seconds),hero=project(sampleRoute(action.hero,t)),friend=project(sampleRoute(action.friend,t));
  const hx=hero[0],hy=hero[1],fx=friend[0],fy=friend[1];
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(bg,0,0);c.setTransform(scale,0,0,scale,0,0);
  if(action.cue==='space'||action.cue==='team'){c.save();c.setLineDash([5,9]);stroke(c,[[hx+27,hy+7],[(hx+fx)/2,(hy+fy)/2+12],[fx-27,fy+7]],'#9b9670',1.6,224);c.restore();}
  if(action.cue==='breath'||action.cue==='reset'){const radius=35+Math.sin(t*Math.PI)*17;c.save();c.globalAlpha=.65;stroke(c,Array.from({length:30},(_,i)=>[hx+Math.cos(i*Math.PI/15)*radius,hy+4+Math.sin(i*Math.PI/15)*radius*.22] as Point),'#759c98',2,225,true);c.restore();}
  const next=Math.min(1,t+.02),hp=project(sampleRoute(action.hero,next)),fp=project(sampleRoute(action.friend,next));
  const actors=[{name:cast[0],x:hx,y:hy,nx:hp[0],ny:hp[1],hero:true},{name:cast[1],x:fx,y:fy,nx:fp[0],ny:fp[1],hero:false}].sort((a,d)=>a.y-d.y);
  for(const p of actors){const moving=Math.hypot(p.nx-p.x,p.ny-p.y)>.5;const facing=moving&&Math.abs(p.nx-p.x)>.3?(p.nx>p.x?1:-1):(p.hero?fx>hx?1:-1:hx>fx?1:-1);actor(p.name,p.x,p.y,facing,moving,p.hero,t);canvas.dataset[p.hero?'heroFacing':'friendFacing']=String(facing);canvas.dataset[p.hero?'heroFrame':'friendFrame']=String(moving?Math.floor(elapsed*12)%4:0);}
  const ball=action.ball?project(sampleRoute(action.ball,t)):[hx+23,hy+4];
  c.save();c.translate(ball[0],ball[1]);c.fillStyle='#526f48';c.globalAlpha=.15;c.beginPath();c.ellipse(0,7,11,4,0,0,Math.PI*2);c.fill();c.globalAlpha=1;c.rotate(action.ball?t*5:0);oval(c,0,-3,10,10,PAPER,240);shape(c,[[-3,-7],[3,-7],[5,-2],[0,1],[-5,-2]],INK,241);stroke(c,[[-9,-7],[-3,-7],[0,-13]],INK,1.2,242);stroke(c,[[5,-2],[10,0]],INK,1.2,243);stroke(c,[[0,1],[-2,7]],INK,1.2,244);c.restore();
  if(action.cue==='anger'){for(let i=0;i<3;i++)stroke(c,[[hx-17+i*16,hy-151],[hx-21+i*16,hy-162]],'#b67157',2,250+i);}
  if(action.cue==='listen'){for(let i=0;i<2;i++)stroke(c,[[hx+39+i*9,hy-112],[hx+42+i*9,hy-104],[hx+39+i*9,hy-96]],'#78948a',1.8,260+i);}
  if(action.cue==='miss'&&t>.6){stroke(c,[[ball[0]-15,ball[1]-24],[ball[0]-8,ball[1]-32]],'#b77762',2,271);}
  if(action.cue==='rest'){shape(c,[[hx+31,hy-25],[hx+43,hy-25],[hx+44,hy-2],[hx+30,hy-2]],'#8eaeb0',280);stroke(c,[[hx+33,hy-29],[hx+40,hy-29]],INK,3,281);}
  const host=canvas.parentElement?.parentElement;
  if(host){const talkWidth=Math.min(290,cssWidth-32),actorScale=Math.min(1.12,Math.max(.83,height/650)),headY=Math.min(hy,fy)-137*actorScale;const top=Math.max(96,Math.min(185,headY/height*cssHeight-18));host.dataset.bubbleSide='above';host.style.setProperty('--talk-left',((cssWidth-talkWidth)/2)+'px');host.style.setProperty('--talk-top',top+'px');host.style.setProperty('--talk-width',talkWidth+'px');host.style.setProperty('--talk-tail',Math.max(20,Math.min(talkWidth-25,hx/width*cssWidth-(cssWidth-talkWidth)/2))+'px');}
  canvas.dataset.draws=String(++draws);canvas.dataset.action=action.name;canvas.dataset.progress=t.toFixed(3);canvas.dataset.playerX=(hx/2).toFixed(1);canvas.dataset.friendX=(fx/2).toFixed(1);canvas.dataset.ballX=(ball[0]/2).toFixed(1);canvas.dataset.style='hand-drawn';
 }
 function cancel(){if(raf)cancelAnimationFrame(raf);if(timer!==undefined)clearTimeout(timer);raf=0;timer=undefined;previous=0;}
 function tick(now:number){raf=0;if(disposed||document.hidden||!visible)return;const dt=previous?Math.min(.15,(now-previous)/1000):0;previous=now;elapsed=Math.min(action.seconds,elapsed+dt);draw();if(elapsed<action.seconds&&!reduced)timer=setTimeout(()=>{timer=undefined;raf=requestAnimationFrame(tick);},1000/12);else previous=0;}
 function wake(){if(disposed||document.hidden||!visible||raf||timer!==undefined)return;if(reduced)elapsed=action.seconds;raf=requestAnimationFrame(tick);}
 function resize(){if(disposed)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;cssWidth=rect.width;cssHeight=rect.height;height=640*cssHeight/cssWidth;const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(cssWidth*dpr);canvas.height=Math.round(cssHeight*dpr);scale=canvas.width/640;background();wake();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const intersection=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible)wake();else cancel();}):null;intersection?.observe(canvas);
 const visibility=()=>{if(document.hidden)cancel();else wake();};
 const motion=()=>{reduced=media.matches;cancel();if(reduced)elapsed=action.seconds;wake();};
 document.addEventListener('visibilitychange',visibility);media.addEventListener('change',motion);resize();
 return {act(nextPage:number){cancel();page=Math.max(0,Math.min(STORY_ACTIONS[id].length-1,nextPage));action=STORY_ACTIONS[id][page];elapsed=reduced?action.seconds:0;wake();},dispose(){disposed=true;cancel();observer.disconnect();intersection?.disconnect();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',motion);bg.width=0;bg.height=0;}};
}
