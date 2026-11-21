/**
 * Hold the Line drawing (Nov 21 2026, docs/arcade-aaa/holdtheline-direction.md): canvas 2D in the arcade's comic print style (the
 * kit's hex values, ink outlines, Ben-Day dots, hard shadows; no gradients, blur or glow).
 * One comic page: the pitch from above and behind YOUR goal (the goal and its net nearest, the halfway line far away, a slight
 * tilt so far things are a little smaller). Your back line is a row of island beans seen from behind, tied together by a rope;
 * the other team faces you. The assistant referee runs the right touchline level with your second-last defender, flag in hand.
 * The offside line is drawn across the whole pitch (as the site's diagrams do): a dashed helper while it is on, and a solid band
 * at the moment the ball is played so the child SEES why the flag went up (or stayed down).
 * Heat: `bg` holds everything static (surround, grass, lines, goal) and is painted once per size or venue; `fg` is the only canvas
 * redrawn, and only while the shell's loop runs (playing). No timers, no particles.
 */
import {HL,type HoldTheLine,type HlEvent} from './core';

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8',WHITE='#fffaf0';
const TAU=Math.PI*2,TILT=.005;
type Ctx=CanvasRenderingContext2D;
/** Venues by league, and the Match of the Day's: a beach ground in the sun, a stadium under the lights, the cup ground at dusk. */
export const VENUES=[
 {name:'Coconut Beach ground',out:'#f1d9a0',dots:'#e2bf7c',g1:'#62b85f',g2:'#56aa55',line:WHITE,far:'#8fd4ee',farDots:'#6fbfe0'},
 {name:'Lighthouse Stadium, under the lights',out:'#3a3154',dots:'#2f2747',g1:'#41a05e',g2:'#389152',line:WHITE,far:'#231a2e',farDots:'#453a66'},
 {name:'Harbour Ground, Match of the Day',out:'#ff8a3c',dots:'#f0452e',g1:'#4fb85c',g2:'#45a852',line:WHITE,far:'#ffc83a',farDots:'#ff8a3c'},
] as const;
export type LineLook={body:string;skin:string;hair:string};
/** what the shell asks the view to show on top of the play */
export type ViewAid={/** 2 the dashed offside line is always on, 1 only at the decision, 0 only when the flag goes up */aid:number;/** the world is held on the decision */frozen:boolean;reduced:boolean};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
/** two kit colours a child could mix up (the other team then wears its away colours) */
const rgb=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)||0),near=(a:string,b:string)=>{const x=rgb(a),y=rgb(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])<125;};

function dots(c:Ctx,x:number,y:number,w:number,h:number,color:string,step=8,r=1.5){c.fillStyle=color;c.beginPath();for(let j=0,yy=y+step/2;yy<y+h;yy+=step,j++)for(let xx=x+(j%2?step:step/2);xx<x+w;xx+=step){c.moveTo(xx+r,yy);c.arc(xx,yy,r,0,TAU);}c.fill();}
/** A paper tag with an ink edge and a hard shadow (canvas twin of the kit's caption box). */
function tag(c:Ctx,text:string,x:number,y:number,o:{fill?:string;color?:string;size?:number;align?:'left'|'center'|'right'}={}){
 const size=o.size??12;c.font=`italic 900 ${size}px "Arial Black",Impact,sans-serif`;const w=Math.ceil(c.measureText(text).width)+12,h=size+9,x0=o.align==='center'?x-w/2:o.align==='right'?x-w:x;
 c.fillStyle=INK;c.fillRect(x0+3,y+3,w,h);c.fillStyle=o.fill??PAPER;c.fillRect(x0,y,w,h);c.lineWidth=2.5;c.strokeStyle=INK;c.setLineDash([]);c.strokeRect(x0,y,w,h);c.fillStyle=o.color??INK;c.textBaseline='middle';c.textAlign='left';c.fillText(text,x0+6,y+h/2+1);return w;}
function ballArt(c:Ctx,x:number,y:number,r:number,spin=0){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=WHITE;c.fill();c.lineWidth=Math.max(1.5,r*.24);c.strokeStyle=INK;c.stroke();
 c.fillStyle=INK;c.beginPath();for(let i=0;i<5;i++){const a=spin+i*TAU/5,px=x+Math.cos(a)*r*.4,py=y+Math.sin(a)*r*.4;if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.closePath();c.fill();}
function star(c:Ctx,x:number,y:number,r:number,n=9,rot=0){c.beginPath();for(let i=0;i<n*2;i++){const rad=i%2?r*.55:r,a=rot+Math.PI*i/n;if(i)c.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);else c.moveTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}c.closePath();}

export type HoldthelineView=ReturnType<typeof createHoldthelineView>;
export function createHoldthelineView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean}){
 const b=bg.getContext('2d',{alpha:false})!,f=fg.getContext('2d')!;
 let W=390,H=844,dpr=1,S=13,ys=1,baseY=770,venue=-1,painted=-1,look:LineLook={body:'#19b5a5',skin:'#f2b98a',hair:INK};
 let fx={t:-9,x:0,y:0,good:true},netT=-9,lastNow=0;

 /** pitch metres -> css px; s = px per metre there */
 function project(x:number,y:number){const k=1/(1+TILT*Math.max(-4,y));return {x:W/2+x*S*k,y:baseY-S*ys*Math.log(1+TILT*Math.max(-4,y))/TILT,s:S*k};}
 function resize(cssW:number,cssH:number,ratio:number,topClear:number){
  W=Math.max(1,cssW);H=Math.max(1,cssH);dpr=Math.min(2,Math.max(1,ratio));S=W/(2*(HL.hw+1.1));
  const pad=clamp(H*.085,54,84),D=Math.log(1+TILT*HL.top)/TILT;baseY=H-pad;ys=clamp((baseY-(topClear-36))/(S*D),.8,1.45);
  for(const cv of [bg,fg]){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=`${W}px`;cv.style.height=`${H}px`;}painted=-1;}
 function setLook(l:Partial<LineLook>){look={...look,...l};}

 /* ---- static layer ---- */
 function path(c:Ctx,pts:[number,number][],close=false){c.beginPath();pts.forEach(([x,y],i)=>{const p=project(x,y);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);});if(close)c.closePath();}
 function paintStatic(v:number){painted=v;const V=VENUES[v],hw=HL.hw;
  b.setTransform(dpr,0,0,dpr,0,0);b.fillStyle=V.out;b.fillRect(0,0,W,H);dots(b,0,0,W,H,V.dots,9,1.7);
  const farY=project(0,HL.top).y;b.fillStyle=V.far;b.fillRect(0,0,W,farY);dots(b,0,0,W,farY,V.farDots);b.fillStyle=INK;b.fillRect(0,farY-3,W,3);
  // mown stripes, far to near
  for(let y=HL.top-4,i=0;y>=0;y-=4,i++){path(b,[[-hw,y],[hw,y],[hw,Math.min(HL.top,y+4)],[-hw,Math.min(HL.top,y+4)]],true);b.fillStyle=i%2?V.g1:V.g2;b.fill();}
  path(b,[[-hw,0],[-hw,HL.top],[hw,HL.top],[hw,0]],true);b.lineWidth=5;b.strokeStyle=INK;b.lineJoin='round';b.stroke();b.lineWidth=2.5;b.strokeStyle=V.line;b.stroke();
  const ln=(pts:[number,number][],w=2.5)=>{path(b,pts);b.lineWidth=w;b.strokeStyle=V.line;b.stroke();};
  ln([[-hw,HL.half],[hw,HL.half]],3.5);{const arc:[number,number][]=[];for(let a=0;a<=TAU+.01;a+=.2)arc.push([Math.cos(a)*6,HL.half+Math.sin(a)*6]);ln(arc);}
  ln([[-9.5,0],[-9.5,10],[9.5,10],[9.5,0]]);ln([[-5,0],[-5,3.6],[5,3.6],[5,0]]);{const arc:[number,number][]=[];for(let a=-.95;a<=.96;a+=.19)arc.push([Math.sin(a)*5,7+Math.cos(a)*5]);ln(arc.filter(p=>p[1]>=10));}
  {const sp=project(0,7);b.fillStyle=V.line;b.beginPath();b.arc(sp.x,sp.y,2.6,0,TAU);b.fill();}
  // your goal, nearest the camera: the net behind the line, then the frame
  {const g=HL.goalHalf,a=project(-g,0),c2=project(g,0),d=project(g+.5,-2.6),e=project(-g-.5,-2.6);b.beginPath();b.moveTo(a.x,a.y);b.lineTo(c2.x,c2.y);b.lineTo(d.x,d.y);b.lineTo(e.x,e.y);b.closePath();b.fillStyle='#231a2e55';b.fill();
   b.save();b.clip();b.strokeStyle=WHITE;b.lineWidth=1.2;b.beginPath();for(let x=e.x-40;x<d.x+40;x+=8){b.moveTo(x,a.y);b.lineTo(x+18,d.y);b.moveTo(x+18,a.y);b.lineTo(x,d.y);}b.stroke();b.restore();
   b.lineWidth=7;b.strokeStyle=INK;b.lineCap='round';b.beginPath();b.moveTo(e.x,e.y);b.lineTo(a.x,a.y);b.lineTo(c2.x,c2.y);b.lineTo(d.x,d.y);b.stroke();b.lineWidth=3.5;b.strokeStyle=WHITE;b.stroke();b.lineCap='butt';}
  // a mark on the halfway line: a runner behind it cannot be offside
  {const p=project(-hw,HL.half);tag(b,'HALFWAY',p.x+4,p.y-22,{size:9,fill:V.g2,color:WHITE});}
 }

 /* ---- beans ---- */
 /** A bean on the pitch. back = seen from behind (your team). Returns its head's top in css px. */
 function bean(c:Ctx,x:number,y:number,o:{body:string;skin:string;hair?:string;back?:boolean;ring?:string;num?:string;band?:boolean;lean?:number;trim?:string;big?:number}){
  const p=project(x,y),s=p.s*1.3*(o.big??1),w=1.5*s,h=2.2*s,r=w/2,lean=(o.lean??0)*s*.5;
  c.fillStyle='#231a2e45';c.beginPath();c.ellipse(p.x+2,p.y+1,w*.62,w*.26,0,0,TAU);c.fill();
  if(o.ring){c.lineWidth=3;c.strokeStyle=INK;c.fillStyle=o.ring;c.beginPath();c.ellipse(p.x,p.y,w*.82,w*.36,0,0,TAU);c.fill();c.stroke();}
  c.save();c.translate(p.x,p.y);c.transform(1,0,lean/h,1,0,0);
  // body: a capsule
  c.beginPath();c.moveTo(-r,-h+r);c.arc(0,-h+r,r,Math.PI,0);c.lineTo(r,-r*.5);c.arc(0,-r*.5,r,0,Math.PI);c.closePath();c.fillStyle=o.body;c.fill();c.lineWidth=2.6;c.strokeStyle=INK;c.stroke();
  if(o.trim){c.fillStyle=o.trim;c.fillRect(-r+1.5,-h*.42,w-3,h*.1);}
  // head
  if(o.back){c.beginPath();c.arc(0,-h+r,r-1.3,0,TAU);c.fillStyle=o.hair??INK;c.fill();c.beginPath();c.arc(0,-h+r,r-1.3,Math.PI*.2,Math.PI*.8);c.closePath();c.fillStyle=o.skin;c.fill();
   if(o.num){c.fillStyle=PAPER;c.beginPath();c.arc(0,-h*.34,r*.7,0,TAU);c.fill();c.lineWidth=1.6;c.stroke();c.fillStyle=INK;c.font=`900 ${Math.round(r*1.05)}px "Arial Black",Impact,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(o.num,0,-h*.33);}}
  else{c.beginPath();c.arc(0,-h+r,r-1.3,0,TAU);c.fillStyle=o.skin;c.fill();c.beginPath();c.arc(0,-h+r,r-1.3,Math.PI*1.12,Math.PI*1.88);c.closePath();c.fillStyle=INK;c.fill();
   c.fillStyle=INK;c.beginPath();c.arc(-r*.36,-h+r*1.08,Math.max(1.3,r*.15),0,TAU);c.arc(r*.36,-h+r*1.08,Math.max(1.3,r*.15),0,TAU);c.fill();
   if(o.band){c.fillStyle=SUN;c.fillRect(-r-1,-h*.56,r*.7,h*.13);c.lineWidth=1.5;c.strokeRect(-r-1,-h*.56,r*.7,h*.13);}}
  c.restore();return {x:p.x+lean,y:p.y-h,s,w,h,fx:p.x,fy:p.y};}

 function onEvent(e:HlEvent,g:HoldTheLine){const s=g.state,p=project(s.ball.x,s.ball.y);
  if(e.type==='goal')netT=lastNow;else if(e.type==='stop'&&(e.word==='tackle'||e.word==='block'||e.word==='swept'||e.word==='slide'))fx={t:lastNow,x:p.x,y:p.y,good:true};}

 function render(g:HoldTheLine,now:number,aid:ViewAid){
  lastNow=now;const s=g.state,v=s.daily?2:s.league;if(v!==venue||painted!==v){venue=v;paintStatic(v);}
  const c=f,L=g.look(),n=g.backs,hw=HL.hw;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);c.lineJoin='round';
  const across=(y:number,col:string,w:number,dash:number[])=>{const a=project(-hw-.6,y),e=project(hw+.6,y);c.setLineDash(dash);c.lineWidth=w+3;c.strokeStyle=INK;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();c.lineWidth=w;c.strokeStyle=col;c.stroke();c.setLineDash([]);return {a,e};};
  // the offside line: the second-last defender, drawn across the whole pitch
  const snap=s.snap&&(s.phase==='res'||aid.frozen)?s.snap:null,live=g.secondLast();
  if(snap){
   if(snap.offside){const a=project(-hw,snap.line),e=project(hw,snap.line),a2=project(-hw,Math.max(0,snap.ry-1.2)),e2=project(hw,Math.max(0,snap.ry-1.2));c.fillStyle='#f0452e3d';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.lineTo(e2.x,e2.y);c.lineTo(a2.x,a2.y);c.closePath();c.fill();}
   const {a}=across(snap.line,snap.offside?RED:TEAL,5,[]);tag(c,'OFFSIDE LINE',a.x+8,a.y+8,{size:11,fill:snap.offside?RED:TEAL,color:snap.offside?PAPER:INK});
  }else if(aid.aid>=2&&s.phase==='play'){const {a}=across(live,TEAL,2.5,[9,7]);tag(c,'OFFSIDE LINE',a.x+8,a.y+7,{size:9,fill:TEAL});}
  // the rope that ties the back line together (a gap shows where a presser left)
  {const y=s.lineY,chest=(i:number)=>{const p=project(s.defs[i].x,s.defs[i].y);return {x:p.x,y:p.y-p.s*1.5};},out=s.press?s.press.i:-1;
   for(let i=0;i<n-1;i++){const a=chest(i),e=chest(i+1),gap=i===out||i+1===out;c.setLineDash(gap?[4,6]:[]);c.lineWidth=gap?3:7;c.strokeStyle=gap?RED:INK;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.x,e.y);c.stroke();if(!gap){c.lineWidth=3.5;c.strokeStyle=PAPER;c.stroke();}}c.setLineDash([]);
   if(out>=0&&s.press&&Math.abs(s.defs[out].y-y)>1.5){const p=project((out-(n-1)/2)*(n===4?5.5:6.5)+s.lineX,y);c.setLineDash([5,5]);c.lineWidth=2.5;c.strokeStyle=RED;c.beginPath();c.ellipse(p.x,p.y-2,p.s*1.2,p.s*.5,0,0,TAU);c.stroke();c.setLineDash([]);if(aid.aid>=1)tag(c,'GAP',p.x,p.y-30,{size:10,fill:RED,color:PAPER,align:'center'});}}
  // everyone, far to near
  type Item={y:number;draw:()=>void};const items:Item[]=[],T=s.tell,away=near(look.body,g.team.kit),team={kit:away?g.team.trim:g.team.kit,trim:away?g.team.kit:g.team.trim},key=g.plans[Math.min(s.wave,g.plans.length-1)].beats;const lastBeat=key[key.length-1];
  for(let i=0;i<7;i++){const a=s.atk[i];if(a.y>HL.top+1)continue;items.push({y:a.y,draw:()=>{
   const holder=s.phase==='play'&&s.holder===i&&(s.stage==='hold'||s.stage==='tell'),wind=holder&&T?clamp(s.bt/T.W,0,1):0,runner=i===5,moving=runner&&(s.phase==='res'&&s.res?.who===5||s.stage==='tell'||s.stage==='air');
   const p=project(a.x,a.y),sc=p.s*1.3;
   if(wind>0){// the tell: the leg goes back (a boot behind the passer) and a ring fills round him
    c.lineWidth=9;c.strokeStyle=INK;c.beginPath();c.ellipse(p.x,p.y-2,sc*1.8,sc*.8,0,0,TAU);c.stroke();c.lineWidth=5;c.strokeStyle=PAPER;c.stroke();c.strokeStyle=wind>.7?RED:SUN;c.beginPath();c.ellipse(p.x,p.y-2,sc*1.8,sc*.8,0,-Math.PI/2,-Math.PI/2+TAU*wind);c.stroke();
    c.lineWidth=sc*.5+3;c.lineCap='round';c.strokeStyle=INK;c.beginPath();c.moveTo(p.x+sc*.3,p.y-sc*.5);c.lineTo(p.x+sc*(.5+.5*wind),p.y-sc*(.9+1.1*wind));c.stroke();c.lineWidth=sc*.5;c.strokeStyle=team.trim;c.stroke();c.lineCap='butt';}
   const head=bean(c,a.x,a.y,{body:team.kit,trim:team.trim,skin:i%2?'#c98a5e':'#f2b98a',band:runner&&lastBeat.k==='bend',lean:moving?-.9:wind>0?.5:0});
   if(moving&&!aid.reduced){c.lineWidth=2.5;c.strokeStyle=INK;c.beginPath();for(let k=-1;k<=1;k++){c.moveTo(head.fx+k*head.w*.5,head.y-4);c.lineTo(head.fx+k*head.w*.5,head.y-4-head.s*1.3);}c.stroke();}
   if(holder&&aid.aid>=1){if(T&&T.kind!=='feet')tag(c,T.kind==='long'?'LONG BALL!':T.kind==='shot'?'SHOT!':'WIND-UP!',head.x,head.y-24,{size:10,fill:SUN,align:'center'});else if(L.heavy)tag(c,'HEAVY TOUCH!',head.x,head.y-24,{size:10,fill:SUN,align:'center'});else if(L.waiting)tag(c,'WAITING…',head.x,head.y-24,{size:10,align:'center'});}
   else if(holder&&L.waiting)tag(c,'…',head.x,head.y-24,{size:13,align:'center'});// a passer who waits always shows it (the press is on)
   if(snap&&runner){tag(c,snap.offside?'OFFSIDE':snap.reason==='level'?'LEVEL = ONSIDE':snap.reason==='ownhalf'?'OWN HALF = ONSIDE':'ONSIDE',head.x,head.y-24,{size:11,fill:snap.offside?RED:TEAL,color:snap.offside?PAPER:INK,align:'center'});}
  }});}
  for(let i=0;i<n;i++){const d=s.defs[i],out=s.press&&s.press.i===i;items.push({y:d.y,draw:()=>{bean(c,d.x,d.y,{body:look.body,skin:look.skin,hair:look.hair,back:true,ring:out?SUN:PAPER,num:String(i+1),lean:out&&s.press!.st==='go'?.8:0});}});}
  items.push({y:s.keeper.y,draw:()=>{bean(c,s.keeper.x,s.keeper.y,{body:SUN,skin:look.skin,hair:look.hair,back:true,ring:PAPER,trim:INK});}});
  // the assistant referee: on the touchline, level with the second-last defender, flag in hand
  {const up=s.t-s.flag<1.6&&s.flag>0,ay=snap&&up?snap.line:live;items.push({y:ay,draw:()=>{const h=bean(c,hw+1.25,ay,{body:INK,skin:'#f2b98a',trim:SUN,big:.95}),fxp=h.fx-h.w*.2,top=up?h.y-h.s*2.4:h.y+h.s*.4;
   c.lineWidth=3;c.strokeStyle=INK;c.beginPath();c.moveTo(fxp,h.y+h.s*.9);c.lineTo(up?fxp:fxp-h.s*1.6,top);c.stroke();const fx0=up?fxp:fxp-h.s*1.6,fw=h.s*1.5,fh=h.s*1.1;c.fillStyle=SUN;c.fillRect(fx0-fw,top,fw,fh);c.fillStyle=RED;c.fillRect(fx0-fw,top,fw/2,fh/2);c.fillRect(fx0-fw/2,top+fh/2,fw/2,fh/2);c.lineWidth=2;c.strokeRect(fx0-fw,top,fw,fh);}});}
  items.sort((a,e)=>e.y-a.y);for(const it of items)it.draw();
  // the ball (a pass in the air rises off its shadow)
  {const p=project(s.ball.x,s.ball.y),lift=s.ball.h*p.s*.9,r=Math.max(4.5,p.s*.48)*(1+s.ball.h*.06);c.fillStyle='#231a2e55';c.beginPath();c.ellipse(p.x+1,p.y+1,r*.9,r*.45,0,0,TAU);c.fill();ballArt(c,p.x,p.y-r*.8-lift,r,now*6);
   if(L.heavy&&!aid.reduced){c.lineWidth=2.5;c.strokeStyle=RED;c.beginPath();c.arc(p.x,p.y-r*.8,r+4+((now*3)%1)*5,0,TAU);c.stroke();}}
  // one-shot marks: a star where the ball was won, a shake of the net for a goal
  if(now-fx.t<.4){const k=(now-fx.t)/.4;star(c,fx.x,fx.y-8,10+k*16,9,k);c.fillStyle=SUN;c.fill();c.lineWidth=2.5;c.strokeStyle=INK;c.stroke();}
  if(now-netT<.6){const a=project(-HL.goalHalf,0),e=project(HL.goalHalf,0),k=1-(now-netT)/.6;c.lineWidth=4;c.strokeStyle=RED;c.beginPath();c.moveTo(a.x,a.y+6+k*6);c.quadraticCurveTo((a.x+e.x)/2,a.y+16+k*14,e.x,e.y+6+k*6);c.stroke();}
 }
 /** which defender is under this point (css px), or -1 */
 function defAt(g:HoldTheLine,px:number,py:number){let best=-1,bd=1e9;g.state.defs.forEach((d,i)=>{const p=project(d.x,d.y),s=p.s*1.3,dx=px-p.x,dy=py-(p.y-s*1.1),r=Math.max(26,s*1.7),dist=Math.hypot(dx,dy);if(dist<r&&dist<bd){bd=dist;best=i;}});return best;}
 function clear(){f.setTransform(dpr,0,0,dpr,0,0);f.clearRect(0,0,W,H);}
 void opts;
 return {resize,render,onEvent,setLook,project,defAt,clear,get pixels(){return fg.width*fg.height;},
  /** css px per metre across the pitch and up it, at the line (the shell's drag gains) */gain(lineY:number){const p=project(0,lineY);return {x:p.s,y:p.s*ys};},
  dispose(){for(const cv of [bg,fg]){cv.width=1;cv.height=1;}}};
}
