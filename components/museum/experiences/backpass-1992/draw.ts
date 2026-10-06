import {PITCH,DUR,SPEED,pressure,type Actor,type Pt,type World} from './sim';
/**
 * Canvas 2D painter for one mini-match, seen through a broadcast camera behind our goal (Oct 5 2026 polish). Called only when
 * the world changed: the experience's loop sleeps otherwise, so nothing here animates on its own.
 *
 * The camera: a tilted view of our half. Depth shrinks toward the halfway line (`sc`) and the tilt adapts to the canvas shape
 * (flatter on wide phone panels, steeper on tall ones), so the same half always fills the feed. Players are small upright
 * figures lit from the top left, sorted back to front, with a broadcast name tag. Before 1992 is painted like a worn VHS
 * recording (warm, faded, tracking noise while it plays); after 1992 like a crisp modern live feed.
 */
type Kit={shirt:string;shirt2:string;shorts:string;socks:string;num:string;tag:string;tagInk:string};
type Palette={grass:string;stripe:string;line:string;haze:string;shadow:string;ring:string;good:string;bad:string;us:Kit;keeper:Kit;them:Kit;ball:string;patch:string};
const PAL:Record<World['era'],Palette>={
 old:{grass:'#5c6c34',stripe:'#68793b',line:'rgba(241,232,204,.82)',haze:'#2b2317',shadow:'rgba(28,18,4,.38)',ring:'#f1c46b',good:'#a8d86e',bad:'#ff7a5c',
  us:{shirt:'#efe6cf',shirt2:'#c9bc9c',shorts:'#26344f',socks:'#efe6cf',num:'#26344f',tag:'#efe6cf',tagInk:'#2b2317'},
  keeper:{shirt:'#e0a53e',shirt2:'#a8741f',shorts:'#2b2317',socks:'#e0a53e',num:'#2b2317',tag:'#e0a53e',tagInk:'#2b2317'},
  them:{shirt:'#a83c2b',shirt2:'#7a2617',shorts:'#efe6cf',socks:'#a83c2b',num:'#fbe9d4',tag:'#a83c2b',tagInk:'#fbe9d4'},ball:'#f5ecd8',patch:'#3a2b17'},
 new:{grass:'#1b7a45',stripe:'#21884e',line:'rgba(255,255,255,.92)',haze:'#06140d',shadow:'rgba(0,26,10,.34)',ring:'#ffe14d',good:'#5be08f',bad:'#ff4d5e',
  us:{shirt:'#2f6bff',shirt2:'#1a45c4',shorts:'#f4f6ff',socks:'#2f6bff',num:'#fff',tag:'#2f6bff',tagInk:'#fff'},
  keeper:{shirt:'#ffd400',shirt2:'#d9a400',shorts:'#151515',socks:'#ffd400',num:'#151515',tag:'#ffd400',tagInk:'#151515'},
  them:{shirt:'#ff4d5e',shirt2:'#c92637',shorts:'#151515',socks:'#ff4d5e',num:'#fff',tag:'#ff4d5e',tagInk:'#fff'},ball:'#ffffff',patch:'#151515'},
};
const NUM:Record<Actor,string>={K:'1',D:'4',W:'7',M:'8',S:'9',A:'6'};
const SKIN:Record<Actor,string>={K:'#e8b98f',D:'#8d5a3b',W:'#f0c7a0',M:'#5e3a26',S:'#c98e63',A:'#f2cfae'};
const HAIR:Record<Actor,string>={K:'#3b2a1c',D:'#141010',W:'#a5662e',M:'#141010',S:'#26180f',A:'#d7b26a'};
const OURS=(a:Actor)=>a==='K'||a==='D'||a==='W'||a==='M';
const FONT='ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',MONO='ui-monospace,Menlo,Consolas,monospace';
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

/** The broadcast camera for a canvas of cw×ch CSS pixels: projects pitch metres to screen pixels. Shared with hit-testing. */
export function camera(cw:number,ch:number){
 // Frame from just inside the halfway line (y 7) to behind the goal; the space above is left for the far players' heads and tags.
 const H=PITCH.h,pad=Math.max(8,Math.min(cw,ch)*.035),Y0=7,Y1=H+3.4,FIG=4.4;
 const yb=(a:number,y:number)=>a*y+(1-a)*y*y/(2*H);
 let k=.7,a=.8,s=Math.min(cw,ch)/60,boost=1,room=40;
 for(let i=0;i<4;i++){a=.6+.3*(k-.5)/.4;boost=Math.max(1,28/(s*FIG));room=s*(a+(1-a)*14/H)*FIG*boost+30;
  const span=yb(a,Y1)-yb(a,Y0),sw=(cw-pad*2)/VIEW_W,avail=ch-pad*1.4-room;
  k=clamp(avail/(sw*span),.5,.9);s=Math.min(sw,avail/(k*span));}
 const span=yb(a,Y1)-yb(a,Y0),top=room+(ch-pad*1.4-room-span*s*k)/2-s*k*yb(a,Y0);
 const sc=(y:number)=>a+(1-a)*y/H;
 return {s,k,a,sc,boost,
  P:(x:number,y:number):[number,number]=>[cw/2+(x-VIEW_X)*s*sc(y),top+s*k*yb(a,y)],
  m:(y:number)=>s*sc(y),
  h:(y:number)=>s*sc(y)*FIG*boost};
}
type Cam=ReturnType<typeof camera>;
/** The camera centres on the play (x 8…48.5, the keeper at 34) rather than the goal, and lets the near touchlines crop like a TV frame. */
const VIEW_X=31,VIEW_W=56;

/** Per-world painter memory: last positions (for running legs), stride phases, ball spin and its trail. */
type Mem={prev:Partial<Record<Actor,Pt>>;stride:Record<Actor,number>;spin:number;ball:Pt|null;trail:Pt[]};
const MEM=new WeakMap<World,Mem>();
const mem=(w:World)=>{let m=MEM.get(w);if(!m){m={prev:{},stride:{K:0,D:0,W:0,M:0,S:0,A:0},spin:0,ball:null,trail:[]};MEM.set(w,m);}return m;};

/** One speckled grass tile per era, made once and reused as a pattern. */
const GRAIN=new Map<string,HTMLCanvasElement>();
function grain(era:World['era']){
 let c=GRAIN.get(era);if(c)return c;c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');if(!g)return c;
 let seed=era==='old'?7:13;const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
 for(let i=0;i<900;i++){const l=rnd()>.5;g.fillStyle=l?`rgba(255,255,230,${.03+rnd()*.05})`:`rgba(0,20,0,${.04+rnd()*.07})`;g.fillRect(rnd()*96,rnd()*96,1+rnd()*1.6,1+rnd()*2.4);}
 GRAIN.set(era,c);return c;
}

const rr=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));};
/** Stroke a pitch-space polyline, subdividing so the camera's gentle curve is followed. */
function path(ctx:CanvasRenderingContext2D,c:Cam,pts:Pt[],close=false){
 ctx.beginPath();
 for(let i=0;i<pts.length;i++){const p=pts[i];if(i===0){ctx.moveTo(...c.P(p.x,p.y));continue;}const q=pts[i-1];
  for(let j=1;j<=8;j++){const t=j/8;ctx.lineTo(...c.P(q.x+(p.x-q.x)*t,q.y+(p.y-q.y)*t));}}
 if(close){const p=pts[0],q=pts[pts.length-1];for(let j=1;j<=8;j++){const t=j/8;ctx.lineTo(...c.P(q.x+(p.x-q.x)*t,q.y+(p.y-q.y)*t));}}
}
/** A circle (or arc) lying on the grass. */
function ground(ctx:CanvasRenderingContext2D,c:Cam,cx:number,cy:number,r:number,a0=0,a1=Math.PI*2){
 ctx.beginPath();const n=Math.max(12,Math.round(40*(a1-a0)/(Math.PI*2)));
 for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,[x,y]=c.P(cx+Math.cos(t)*r,cy+Math.sin(t)*r);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
}

function pitch(ctx:CanvasRenderingContext2D,c:Cam,P:Palette,era:World['era'],cw:number,ch:number){
 const H=PITCH.h;
 ctx.fillStyle=P.grass;ctx.fillRect(0,0,cw,ch);
 // mowing stripes across the pitch, continued into the far half and behind the goal
 ctx.fillStyle=P.stripe;const band=H/8;
 for(let i=-8;i<10;i+=2){const y0=i*band,y1=y0+band;const a=c.P(-80,y0),b=c.P(148,y0),d=c.P(148,y1),e=c.P(-80,y1);
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...d);ctx.lineTo(...e);ctx.fill();}
 const pat=ctx.createPattern(grain(era),'repeat');if(pat){ctx.fillStyle=pat;ctx.fillRect(0,0,cw,ch);}
 // markings: touchlines, goal line, halfway line + centre circle, penalty area, goal area, spot, arc
 ctx.strokeStyle=P.line;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.lineWidth=Math.max(1.1,c.m(H)*.16);
 path(ctx,c,[{x:0,y:-30},{x:0,y:H},{x:68,y:H},{x:68,y:-30}]);ctx.stroke();
 ctx.lineWidth=Math.max(1,c.m(0)*.16);path(ctx,c,[{x:-30,y:0},{x:98,y:0}]);ctx.stroke();ground(ctx,c,34,0,9.15,0,Math.PI);ctx.stroke();
 ground(ctx,c,34,0,9.15,Math.PI,Math.PI*2);ctx.stroke();
 ctx.lineWidth=Math.max(1.1,c.m(H-10)*.16);
 path(ctx,c,[{x:34-20.16,y:H},{x:34-20.16,y:H-16.5},{x:34+20.16,y:H-16.5},{x:34+20.16,y:H}]);ctx.stroke();
 path(ctx,c,[{x:34-9.16,y:H},{x:34-9.16,y:H-5.5},{x:34+9.16,y:H-5.5},{x:34+9.16,y:H}]);ctx.stroke();
 const a=Math.acos(5.5/9.15);ground(ctx,c,34,H-11,9.15,-Math.PI/2-a,-Math.PI/2+a);ctx.stroke();
 ctx.fillStyle=P.line;ground(ctx,c,34,H-11,.32);ctx.fill();ground(ctx,c,34,0,.32);ctx.fill();
 // the goal: net on the grass behind the line, posts and an (only slightly raised) crossbar
 const gl=c.P(34-3.66,H),gr=c.P(34+3.66,H),bl=c.P(34-3.9,H+2.2),br=c.P(34+3.9,H+2.2),lift=c.m(H)*1.1*c.k;
 ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.moveTo(...gl);ctx.lineTo(...gr);ctx.lineTo(...br);ctx.lineTo(...bl);ctx.fill();
 ctx.save();ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=.8;
 for(let i=1;i<10;i++){const t=i/10;ctx.beginPath();ctx.moveTo(gl[0]+(gr[0]-gl[0])*t,gl[1]);ctx.lineTo(bl[0]+(br[0]-bl[0])*t,bl[1]);ctx.stroke();}
 for(let i=1;i<4;i++){const t=i/4,y=gl[1]+(bl[1]-gl[1])*t;ctx.beginPath();ctx.moveTo(gl[0]+(bl[0]-gl[0])*t,y);ctx.lineTo(gr[0]+(br[0]-gr[0])*t,y);ctx.stroke();}
 ctx.restore();
 ctx.strokeStyle=era==='old'?'#f4ecd6':'#fff';ctx.lineWidth=Math.max(2,c.m(H)*.24);
 ctx.beginPath();ctx.moveTo(gl[0],gl[1]);ctx.lineTo(gl[0],gl[1]-lift);ctx.lineTo(gr[0],gr[1]-lift);ctx.lineTo(gr[0],gr[1]);ctx.stroke();
}

/** One upright footballer, feet at (x,y), lit from the top left. `away` = we see their back (and the shirt number). */
function figure(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,kit:Kit,P:Palette,a:Actor,away:boolean,stride:number,moving:boolean,keeper:boolean){
 const sw=moving?Math.sin(stride):0,leg=h*.11;
 // contact shadow, cast down and to the right
 ctx.fillStyle=P.shadow;ctx.beginPath();ctx.ellipse(x+h*.1,y+h*.01,h*.27,h*.075,0,0,Math.PI*2);ctx.fill();
 // legs: skin, socks, boots
 for(const sd of [-1,1]){const lx=x+sd*h*.075,ly=y+(sd*sw)*h*.035,top=y-h*.44;
  ctx.fillStyle=SKIN[a];rr(ctx,lx-leg/2,top,leg,h*.2,leg/2);ctx.fill();
  ctx.fillStyle=kit.socks;rr(ctx,lx-leg/2,top+h*.18,leg,ly-top-h*.2,leg/2.4);ctx.fill();
  ctx.fillStyle='#161412';ctx.beginPath();ctx.ellipse(lx+sd*h*.012,ly-h*.02,leg*.62,h*.032,0,0,Math.PI*2);ctx.fill();}
 // shorts
 ctx.fillStyle=kit.shorts;rr(ctx,x-h*.16,y-h*.53,h*.32,h*.15,h*.04);ctx.fill();
 // arms swing against the legs
 ctx.lineCap='round';ctx.lineWidth=h*.085;
 for(const sd of [-1,1]){const sx=x+sd*h*.17,sy=y-h*.76,ex=sx+sd*h*.05,ey=y-h*.5-(sd*-sw)*h*.03;
  ctx.strokeStyle=kit.shirt2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(ex-sx)*.45,sy+(ey-sy)*.45);ctx.stroke();
  ctx.strokeStyle=SKIN[a];ctx.beginPath();ctx.moveTo(sx+(ex-sx)*.45,sy+(ey-sy)*.45);ctx.lineTo(ex,ey);ctx.stroke();
  ctx.fillStyle=keeper?(P===PAL.old?'#f2e3b5':'#ffffff'):SKIN[a];ctx.beginPath();ctx.arc(ex,ey+h*.02,keeper?h*.06:h*.04,0,Math.PI*2);ctx.fill();}
 // shirt with a soft top-left light
 const g=ctx.createLinearGradient(x-h*.2,y-h*.82,x+h*.2,y-h*.48);g.addColorStop(0,kit.shirt);g.addColorStop(1,kit.shirt2);
 ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-h*.19,y-h*.79);ctx.quadraticCurveTo(x,y-h*.85,x+h*.19,y-h*.79);
 ctx.lineTo(x+h*.155,y-h*.5);ctx.quadraticCurveTo(x,y-h*.47,x-h*.155,y-h*.5);ctx.closePath();ctx.fill();
 if(away&&h>=34){ctx.fillStyle=kit.num;ctx.font=`800 ${Math.round(h*.2)}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(NUM[a],x,y-h*.645);}
 // head and hair
 const hy=y-h*.92,hr=h*.1;
 ctx.fillStyle=SKIN[a];ctx.beginPath();ctx.arc(x,hy,hr,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=HAIR[a];ctx.beginPath();
 if(away)ctx.arc(x,hy-hr*.05,hr*1.02,Math.PI*.92,Math.PI*2.08);else ctx.arc(x,hy-hr*.18,hr*1.0,Math.PI*1.08,Math.PI*1.92);
 ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.arc(x-hr*.35,hy-hr*.35,hr*.32,0,Math.PI*2);ctx.fill();
}

/** A broadcast name tag above a player's head. */
function tag(ctx:CanvasRenderingContext2D,x:number,y:number,kit:Kit,label:string,size:number,glow:number,ring:string){
 ctx.font=`800 ${size}px ${FONT}`;const tw=ctx.measureText(label).width,w=Math.max(size*1.7,tw+size*.9),hgt=size*1.45;
 ctx.save();
 if(glow>0){ctx.globalAlpha=glow;ctx.strokeStyle=ring;ctx.lineWidth=2.5;rr(ctx,x-w/2-4,y-hgt-4,w+8,hgt+8,hgt);ctx.stroke();ctx.globalAlpha=1;}
 ctx.fillStyle='rgba(0,0,0,.28)';rr(ctx,x-w/2+1,y-hgt+1.5,w,hgt,hgt/2);ctx.fill();
 ctx.fillStyle=kit.tag;rr(ctx,x-w/2,y-hgt,w,hgt,hgt/2);ctx.fill();
 ctx.fillStyle=kit.tagInk;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y-hgt/2+.5);
 ctx.restore();
}

function ball(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,lift:number,spin:number,P:Palette){
 ctx.fillStyle=P.shadow;ctx.beginPath();ctx.ellipse(x+r*.35,y+r*.25,r*1.05*(1-Math.min(.4,lift/(r*12))),r*.42,0,0,Math.PI*2);ctx.fill();
 const by=y-r-lift,g=ctx.createRadialGradient(x-r*.4,by-r*.4,r*.1,x,by,r*1.1);g.addColorStop(0,'#fff');g.addColorStop(.6,P.ball);g.addColorStop(1,'#b9b2a2');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,by,r,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(x,by,r,0,Math.PI*2);ctx.clip();ctx.fillStyle=P.patch;
 for(let i=0;i<3;i++){const t=spin+i*2.1;ctx.beginPath();ctx.arc(x+Math.cos(t)*r*.62,by+Math.sin(t)*r*.42,r*.3,0,Math.PI*2);ctx.fill();}
 ctx.beginPath();ctx.arc(x+Math.cos(spin*.7)*r*.12,by,r*.26,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x,by,r,0,Math.PI*2);ctx.stroke();
}

/** A dashed pass lane on the grass with a chevron at the end. */
function lane(ctx:CanvasRenderingContext2D,c:Cam,from:Pt,to:Pt,col:string,dash:number){
 const dx=to.x-from.x,dy=to.y-from.y,L=Math.hypot(dx,dy)||1,end={x:to.x-dx/L*1.6,y:to.y-dy/L*1.6};
 ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.lineDashOffset=-dash;path(ctx,c,[from,end]);ctx.stroke();ctx.setLineDash([]);
 const [ex,ey]=c.P(end.x,end.y),[px,py]=c.P(end.x-dx/L*1.2,end.y-dy/L*1.2),ang=Math.atan2(ey-py,ex-px);
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(ex+Math.cos(ang)*6,ey+Math.sin(ang)*6);ctx.lineTo(ex+Math.cos(ang+2.5)*7,ey+Math.sin(ang+2.5)*7);ctx.lineTo(ex+Math.cos(ang-2.5)*7,ey+Math.sin(ang-2.5)*7);ctx.fill();ctx.restore();
}

export function drawWorld(ctx:CanvasRenderingContext2D,w:World,cw:number,ch:number,dpr:number,now:number,reduced:boolean){
 const P=PAL[w.era],c=camera(cw,ch),M=mem(w),old=w.era==="old",busy=w.phase!=="idle";
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cw,ch);
 pitch(ctx,c,P,w.era,cw,ch);
 const K=w.pos.K,tagSize=clamp(Math.round(c.s*1.5),11,14);

 // ── ground graphics (under the players) ──
 if(w.phase==='idle'){// the play we're about to run: 4 knocks it back to 1
  ctx.save();ctx.globalAlpha=.55;lane(ctx,c,w.ball,{x:K.x-.6,y:K.y-1.2},P.line,0);ctx.restore();}
 if(w.phase==='hold'){// old law: the keeper holds it and nobody may challenge
  ctx.save();ctx.fillStyle=old?'rgba(241,196,107,.16)':'rgba(255,77,94,.16)';ground(ctx,c,K.x,K.y,7);ctx.fill();
  ctx.strokeStyle=P.ring;ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.lineDashOffset=reduced?0:-now/40;ground(ctx,c,K.x,K.y,7);ctx.stroke();ctx.restore();}
 const pr=pressure(w);
 if(w.phase==='feet'){// new law: the striker closes in; two lanes to choose from
  ctx.save();ctx.fillStyle=`rgba(255,77,94,${.1+.22*(1-pr)})`;ground(ctx,c,K.x,K.y,4.6);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=3;ground(ctx,c,K.x,K.y,4.6);ctx.stroke();
  ctx.strokeStyle=pr>.4?P.ring:P.bad;ctx.lineWidth=4;ctx.lineCap='round';ground(ctx,c,K.x,K.y,4.6,-Math.PI/2,-Math.PI/2+Math.PI*2*pr);ctx.stroke();ctx.restore();
  const d=reduced?0:now/45;lane(ctx,c,w.ball,w.pos.W,'rgba(255,255,255,.75)',d);lane(ctx,c,w.ball,w.pos.M,'rgba(255,255,255,.75)',d);}
 if(w.phase==='foul'){ctx.save();ctx.strokeStyle=P.bad;ctx.lineWidth=3;ctx.setLineDash([4,5]);ground(ctx,c,K.x,K.y,5.5);ctx.stroke();ctx.restore();}
 // a ripple where a pass lands (good) or the ball is lost (bad)
 const burst=(p:Pt,col:string,t:number)=>{if(t>=1)return;ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle=col;ctx.lineWidth=3;ground(ctx,c,p.x,p.y,1.4+(reduced?2:t*5));ctx.stroke();ctx.restore();};
 if(w.phase==='reset'&&w.target&&w.target!==w.marked)burst(w.pos[w.target],P.good,w.t/.9);
 if(w.phase==='stolen')burst(w.pos[w.thief],P.bad,w.t/.9);

 // ── the ball's trail ──
 const moving=M.ball&&Math.hypot(w.ball.x-M.ball.x,w.ball.y-M.ball.y)>.02;
 if(moving&&!w.held){M.trail.push({x:w.ball.x,y:w.ball.y});if(M.trail.length>14)M.trail.shift();M.spin+=Math.hypot(w.ball.x-M.ball!.x,w.ball.y-M.ball!.y)*.9;}
 else if(M.trail.length)M.trail.shift();
 if(!busy)M.trail.length=0;
 if(M.trail.length>1&&!reduced){ctx.save();ctx.lineCap='round';
  for(let i=1;i<M.trail.length;i++){const a=c.P(M.trail[i-1].x,M.trail[i-1].y),b=c.P(M.trail[i].x,M.trail[i].y);ctx.globalAlpha=i/M.trail.length*.5;ctx.strokeStyle='#fff';ctx.lineWidth=1+i/M.trail.length*2.5;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
  ctx.restore();}
 M.ball={x:w.ball.x,y:w.ball.y};

 // ── players and ball, painted back to front ──
 type Item={y:number;draw:()=>void};const items:Item[]=[];
 const kitOf=(a:Actor)=>a==='K'?P.keeper:OURS(a)?P.us:P.them;
 for(const a of ['W','M','D','A','S','K'] as Actor[]){
  const p=w.pos[a],prev=M.prev[a],v=prev?Math.hypot(p.x-prev.x,p.y-prev.y):0,run=v>.015&&!reduced;
  if(run)M.stride[a]+=v*1.6;M.prev[a]={x:p.x,y:p.y};
  items.push({y:p.y,draw:()=>{const [x,y]=c.P(p.x,p.y);figure(ctx,x,y,c.h(p.y),kitOf(a),P,a,OURS(a),M.stride[a],run,a==='K');}});
 }
 const br=Math.max(3.4,c.m(w.ball.y)*.4*c.boost);
 if(w.held){// the ball in the keeper's gloves; under the old law he bounces it, as keepers did while the clock ran
  items.push({y:K.y+.01,draw:()=>{const [x,y]=c.P(K.x,K.y),h=c.h(K.y),chest=h*.6;
   const up=old&&w.phase==='hold'&&!reduced?Math.abs(Math.sin(now/300)):1;ball(ctx,x+h*.02,y+h*.04,br,chest*up,M.spin,P);}});
 }else items.push({y:w.ball.y+.2,draw:()=>{const [x,y]=c.P(w.ball.x,w.ball.y);ball(ctx,x,y,br,0,M.spin,P);}});
 items.sort((p,q)=>p.y-q.y).forEach(i=>i.draw());

 // ── tags on top ──
 const pulse=reduced?1:.55+.45*Math.sin(now/180);
 for(const a of ['W','M','D','A','S','K'] as Actor[]){
  const p=w.pos[a],[x,y]=c.P(p.x,p.y),h=c.h(p.y),choose=w.phase==='feet'&&(a==='W'||a==='M');
  tag(ctx,x,y-h-5,kitOf(a),NUM[a],tagSize,choose?pulse:0,P.ring);
 }
 // the hold clock above the keeper (old law): this is the stolen time
 if(w.phase==='hold'){const [x,y]=c.P(K.x,K.y),h=c.h(K.y),held=Math.min(DUR.hold,w.t)*SPEED,label=`HELD ${Math.floor(held)}s`;
  ctx.font=`800 ${tagSize}px ${MONO}`;const tw=ctx.measureText(label).width+16,ty=y-h-5-tagSize*1.45-6,bh=tagSize*1.6;
  ctx.fillStyle='rgba(20,14,4,.82)';rr(ctx,x-tw/2,ty-bh,tw,bh,5);ctx.fill();ctx.strokeStyle=P.ring;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=P.ring;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,ty-bh/2+.5);}

 // ── the feed itself: haze over the far half, vignette, and the VHS look for the old tape ──
 const [,farY]=c.P(0,4),hz=ctx.createLinearGradient(0,0,0,Math.max(10,farY));hz.addColorStop(0,P.haze+'cc');hz.addColorStop(1,P.haze+'00');
 ctx.fillStyle=hz;ctx.fillRect(0,0,cw,Math.max(10,farY));
 const vg=ctx.createRadialGradient(cw/2,ch*.55,Math.min(cw,ch)*.35,cw/2,ch*.55,Math.max(cw,ch)*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,old?'rgba(30,16,2,.5)':'rgba(0,10,4,.42)');
 ctx.fillStyle=vg;ctx.fillRect(0,0,cw,ch);
 const osd=Math.max(11,Math.min(14,Math.round(cw/48)));
 if(old){
  ctx.save();ctx.fillStyle='rgba(255,236,200,.06)';ctx.fillRect(0,0,cw,ch);
  if(busy&&!reduced){const by=((now/9)%(ch+60))-30;ctx.fillStyle='rgba(255,250,235,.12)';ctx.fillRect(0,by,cw,3);ctx.fillStyle='rgba(255,250,235,.06)';ctx.fillRect(0,by+5,cw,9);}
  ctx.font=`700 ${osd}px ${MONO}`;ctx.textBaseline='top';ctx.textAlign='left';
  const t1='PLAY ►',t2='JUN 1990';
  for(const [col,dx] of [['rgba(255,60,60,.55)',-1.2],['rgba(60,220,255,.5)',1.2],['#f5f0dc',0]] as [string,number][]){ctx.fillStyle=col;ctx.fillText(t1,12+dx,10);if(ch>=170)ctx.fillText(t2,12+dx,ch-osd-10);}
  ctx.restore();
 }else{
  ctx.save();ctx.font=`800 ${osd-1}px ${FONT}`;const lw=ctx.measureText('LIVE').width+osd*1.9;
  ctx.fillStyle='rgba(0,0,0,.55)';rr(ctx,10,10,lw,osd*1.7,4);ctx.fill();ctx.fillStyle='#ff4d5e';ctx.beginPath();ctx.arc(10+osd*.75,10+osd*.85,osd*.28,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText('LIVE',10+osd*1.3,10+osd*.87);ctx.restore();
 }
}

/** Hit-test a tap (CSS px inside the canvas) against our players' bodies. */
export function hitActor(w:World,cw:number,ch:number,px:number,py:number):Actor|null{
 const c=camera(cw,ch);let best:Actor|null=null,bd=Infinity;
 for(const a of ['K','D','W','M'] as Actor[]){const p=w.pos[a],[x,y]=c.P(p.x,p.y),h=c.h(p.y),r=Math.max(24,h*.75);
  const d=Math.hypot(x-px,y-h*.5-py);if(d<r&&d<bd){bd=d;best=a;}}
 return best;
}
