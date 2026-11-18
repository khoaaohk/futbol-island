/**
 * Trophy Drop drawing (Nov 17 2026, comic-print house style: ink outlines, flat colour, violet shadow band, Ben-Day dots). Two
 * canvases: `bg` is the club trophy room and the empty cabinet frame, painted ONCE per resize; `fg` is the moving layer (items, the
 * held item and its drop guide, the walls and floor as they close in, bursts, score pops, the top line). Every item is a round badge
 * pre-rendered once per resize (one sprite per tier), so a frame is a handful of drawImage calls. render() returns true while
 * something is still animating, so the shell can stop its loop on a settled cabinet (heat).
 */
import {TD,TIERS,BEACH,BEACH_R,type TrophyDrop,type TrophyEvent,type Body} from './core';

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const WOOD='#b5683a',WOOD_D='#8a4a2a',GLASS='#d8f1ee',WALL='#ffcf7a';
type Ctx=CanvasRenderingContext2D;

/** Where the cabinet sits on a stage of w x h css px. top = room the HUD takes; bottom = the thumb strip under the cabinet. */
export function trophyLayout(w:number,h:number,top:number){
 const bottom=Math.max(64,Math.min(120,h*.13)),side=Math.max(12,Math.min(26,w*.04)),availW=w-side*2,availH=Math.max(120,h-top-bottom-18);
 const k=Math.max(1,Math.min(availW/TD.w,availH/TD.h)),cw=TD.w*k,ch=TD.h*k,ox=Math.round((w-cw)/2),oy=Math.round(top+Math.max(0,(availH-ch)*.45));
 return {w,h,k,ox,oy,cw,ch,top,bottom,thumbY:oy+ch+18};
}
export type TrophyLayout=ReturnType<typeof trophyLayout>;

/* ---- the item badges (pre-rendered) ---- */
function disc(c:Ctx,r:number,fill:string,lw:number){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fillStyle=fill;c.fill();}
/** The violet shadow band: Ben-Day dots in the lower-right crescent of a disc. */
function shade(c:Ctx,r:number,step:number,color=VIOLET,alpha=.55){
 c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();c.beginPath();c.rect(-r,-r,r*2,r*2);c.arc(-r*.28,-r*.3,r*1.02,0,Math.PI*2,true);c.clip('evenodd');
 c.globalAlpha=alpha;c.fillStyle=color;const d=step*.32;for(let y=-r;y<=r;y+=step)for(let x=-r+((Math.round((y+r)/step)%2)*step/2);x<=r;x+=step){c.beginPath();c.arc(x,y,d,0,Math.PI*2);c.fill();}c.restore();
}
function shine(c:Ctx,r:number){c.save();c.fillStyle='#ffffff';c.globalAlpha=.85;c.beginPath();c.ellipse(-r*.42,-r*.45,r*.2,r*.11,-.7,0,Math.PI*2);c.fill();c.restore();}
function ring(c:Ctx,r:number,lw:number){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();}
/** A football: patches on a coloured ball. */
function ball(c:Ctx,r:number,body:string,patch:string,lw:number){
 disc(c,r,body,lw);c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();
 const pent=(x:number,y:number,s:number,rot:number)=>{c.beginPath();for(let i=0;i<5;i++){const a=rot+i*Math.PI*2/5-Math.PI/2;c.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);}c.closePath();c.fillStyle=patch;c.fill();c.lineWidth=lw*.5;c.strokeStyle=INK;c.stroke();};
 pent(0,0,r*.34,0);for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;c.beginPath();c.moveTo(Math.cos(a)*r*.34,Math.sin(a)*r*.34);c.lineTo(Math.cos(a)*r*.68,Math.sin(a)*r*.68);c.lineWidth=lw*.5;c.strokeStyle=INK;c.stroke();pent(Math.cos(a)*r*.98,Math.sin(a)*r*.98,r*.3,a+Math.PI/2);}
 c.restore();shade(c,r,Math.max(2.4,r*.17));shine(c,r);ring(c,r,lw);
}
function path(c:Ctx,pts:number[],r:number,fill:string,lw:number,close=true){c.beginPath();for(let i=0;i<pts.length;i+=2)c.lineTo(pts[i]*r,pts[i+1]*r);if(close)c.closePath();c.fillStyle=fill;c.fill();c.lineJoin='round';c.lineWidth=lw;c.strokeStyle=INK;c.stroke();}
/** Badge: a coloured disc with the object drawn on it. */
function badge(c:Ctx,r:number,t:number,lw:number){
 const T=TIERS[t];disc(c,r,T.color,lw);
 c.save();c.beginPath();c.arc(0,0,r*.98,0,Math.PI*2);c.clip();c.globalAlpha=.25;c.fillStyle=PAPER;for(let i=0;i<8;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,r,i*Math.PI/4,i*Math.PI/4+Math.PI/8);c.fill();}c.restore();
 const l=lw*.85;
 if(t===3){// boot: side view, studs, laces
  path(c,[-.62,-.12,-.5,-.5,-.12,-.52,-.04,-.2,.34,-.06,.66,.1,.66,.32,-.62,.32],r,PAPER,l);path(c,[-.62,.32,.66,.32,.6,.42,-.6,.42],r,INK,l*.6);
  for(const x of [-.5,-.2,.2,.5]){c.fillStyle=INK;c.fillRect((x-.05)*r,.42*r,.1*r,.12*r);}
  c.lineWidth=l*.7;c.strokeStyle=RED;for(let i=0;i<3;i++){c.beginPath();c.moveTo((-.18+i*.12)*r,(-.36+i*.08)*r);c.lineTo((-.02+i*.12)*r,(-.26+i*.08)*r);c.stroke();}
  c.fillStyle=RED;c.beginPath();c.moveTo(-.3*r,.05*r);c.lineTo(.2*r,.0);c.lineTo(.4*r,.18*r);c.lineTo(-.2*r,.2*r);c.closePath();c.fill();
 }else if(t===4){// keeper glove: palm and four fingers, thumb, wrist strap
  path(c,[-.34,.6,-.36,.05,-.6,-.16,-.56,-.28,-.3,-.14,-.3,-.56,-.16,-.6,-.12,-.18,-.06,-.68,.08,-.68,.1,-.18,.18,-.62,.32,-.58,.3,-.12,.4,-.48,.52,-.42,.42,.1,.34,.6],r,PAPER,l);
  path(c,[-.38,.36,.38,.36,.36,.62,-.36,.62],r,INK,l*.6);c.fillStyle=SUN;c.fillRect(-.26*r,.43*r,.52*r,.1*r);
 }else if(t===5){// medal on a ribbon
  path(c,[-.36,-.7,-.12,-.7,.06,-.1,-.14,-.02],r,RED,l);path(c,[.36,-.7,.12,-.7,-.06,-.1,.14,-.02],r,SUN,l);
  c.beginPath();c.arc(0,.22,.42*r,0,Math.PI*2);c.fillStyle='#ffd24a';c.fill();c.lineWidth=l;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.arc(0,.22*r,.28*r,0,Math.PI*2);c.lineWidth=l*.6;c.stroke();star(c,0,.22*r,.17*r,.08*r,INK);
 }else if(t===6){// club shield crest with a ball
  path(c,[0,-.66,.56,-.46,.52,.12,0,.66,-.52,.12,-.56,-.46],r,PAPER,l);path(c,[0,-.66,0,.66,-.52,.12,-.56,-.46],r,RED,l*.6);
  c.save();c.translate(0,-.02*r);ball(c,.24*r,PAPER,INK,l*.7);c.restore();
 }else if(t===7){// silver cup with two handles
  c.lineWidth=l;c.strokeStyle=INK;c.beginPath();c.arc(-.46*r,-.2*r,.2*r,Math.PI*.5,Math.PI*1.5);c.stroke();c.beginPath();c.arc(.46*r,-.2*r,.2*r,-Math.PI*.5,Math.PI*.5);c.stroke();
  path(c,[-.46,-.56,.46,-.56,.36,-.02,.12,.18,.1,.36,.3,.44,.3,.6,-.3,.6,-.3,.44,-.1,.36,-.12,.18,-.36,-.02],r,'#eef1f7',l);
  c.fillStyle=VIOLET;c.globalAlpha=.5;c.fillRect(.14*r,-.5*r,.18*r,.42*r);c.globalAlpha=1;
 }else if(t===8){// golden trophy: big cup on a plinth, a star on it
  c.lineWidth=l*1.1;c.strokeStyle=INK;c.beginPath();c.arc(-.48*r,-.24*r,.22*r,Math.PI*.45,Math.PI*1.55);c.stroke();c.beginPath();c.arc(.48*r,-.24*r,.22*r,-Math.PI*.55,Math.PI*.55);c.stroke();
  path(c,[-.5,-.62,.5,-.62,.4,-.04,.12,.16,.1,.3,.26,.36,.26,.46,-.26,.46,-.26,.36,-.1,.3,-.12,.16,-.4,-.04],r,'#ffe27a',l);
  path(c,[-.4,.46,.4,.46,.4,.68,-.4,.68],r,WOOD,l);c.fillStyle=PAPER;c.fillRect(-.22*r,.53*r,.44*r,.08*r);star(c,0,-.3*r,.2*r,.09*r,RED);
 }
 shade(c,r,Math.max(2.4,r*.13),VIOLET,.5);shine(c,r);ring(c,r,lw);
}
function star(c:Ctx,x:number,y:number,ro:number,ri:number,fill:string){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?ri:ro;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=fill;c.fill();}
function beach(c:Ctx,r:number,lw:number,dent:number){
 const cols=[PAPER,RED,PAPER,SUN,PAPER,TEAL];for(let i=0;i<6;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,r,i*Math.PI/3-.3,(i+1)*Math.PI/3-.3);c.closePath();c.fillStyle=cols[i];c.fill();}
 c.beginPath();c.arc(0,0,r*.2,0,Math.PI*2);c.fillStyle=PAPER;c.fill();c.lineWidth=lw*.6;c.strokeStyle=INK;c.stroke();
 if(dent>0){c.lineWidth=lw*.7;c.beginPath();c.moveTo(r*.2,-r*.7);c.lineTo(r*.38,-r*.4);c.lineTo(r*.26,-r*.18);c.lineTo(r*.5,0);c.stroke();}
 shade(c,r,Math.max(2.4,r*.17));shine(c,r);ring(c,r,lw);
}

type Pop={on:boolean;x:number;y:number;t:number;life:number;text:string;color:string;size:number;kind:number};
type Burst={on:boolean;x:number;y:number;r:number;t:number;life:number;color:string};

export type TrophyView=ReturnType<typeof createTrophyView>;
export function createTrophyView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced?:boolean}={}){
 const b=bg.getContext('2d')!,f=fg.getContext('2d')!;let L=trophyLayout(1,1,0),dpr=1,sprites:HTMLCanvasElement[]=[],beachSprites:HTMLCanvasElement[]=[];
 const pops:Pop[]=Array.from({length:16},()=>({on:false,x:0,y:0,t:0,life:1,text:'',color:SUN,size:16,kind:0}));
 const bursts:Burst[]=Array.from({length:12},()=>({on:false,x:0,y:0,r:10,t:0,life:.4,color:SUN}));
 let shake=0,flash=0,word:{text:string;sub:string;t:number;life:number;color:string}|null=null,clock=0,guideX=-1;
 const reduced=!!opts.reduced;
 function sprite(r:number,draw:(c:Ctx,R:number,lw:number)=>void){const R=r*L.k,pad=Math.ceil(3*dpr+2),size=Math.ceil(R*2*dpr)+pad*2,cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d')!;
  c.setTransform(dpr,0,0,dpr,size/2,size/2);draw(c,R,Math.max(1.6,Math.min(3.2,R*.12)));return cv;}
 function build(){
  sprites=TIERS.map((T,t)=>sprite(T.r,(c,R,lw)=>{if(t===0)ball(c,R,PAPER,INK,lw);else if(t===1)ball(c,R,SUN,INK,lw);else if(t===2)ball(c,R,ORANGE,PAPER,lw);else badge(c,R,t,lw);}));
  beachSprites=[0,1].map(d=>sprite(BEACH_R,(c,R,lw)=>beach(c,R,lw,d)));
 }
 const X=(x:number)=>L.ox+x*L.k,Y=(y:number)=>L.oy+y*L.k;
 function paintScene(){
  const W=L.w,H=L.h,u=Math.max(1,Math.min(W,H)/400);b.setTransform(dpr,0,0,dpr,0,0);
  // the club room wall: warm paper, a dot screen, a picture rail and a row of pennants
  b.fillStyle=WALL;b.fillRect(0,0,W,H);b.fillStyle='#f6b766';for(let y=0;y<H;y+=9*u)for(let x=(Math.round(y/(9*u))%2)*4.5*u;x<W;x+=9*u){b.beginPath();b.arc(x,y,1.6*u,0,Math.PI*2);b.fill();}
  const rail=Math.max(L.top-6,8);b.fillStyle=WOOD;b.fillRect(0,rail,W,6*u);b.fillStyle=INK;b.fillRect(0,rail+6*u,W,2*u);
  const pc=[RED,TEAL,SUN,VIOLET,ORANGE];for(let i=0,x=6*u;x<W;i++,x+=34*u){b.beginPath();b.moveTo(x,rail+8*u);b.lineTo(x+26*u,rail+8*u);b.lineTo(x+13*u,rail+30*u);b.closePath();b.fillStyle=pc[i%5];b.fill();b.lineWidth=2*u;b.strokeStyle=INK;b.stroke();}
  // the floor: boards under the cabinet, the thumb strip below
  const floorY=L.oy+L.ch+10;b.fillStyle='#d98c4f';b.fillRect(0,floorY,W,H-floorY);b.fillStyle=INK;b.fillRect(0,floorY,W,3*u);
  b.strokeStyle='#b8703c';b.lineWidth=2*u;for(let x=-H;x<W;x+=46*u){b.beginPath();b.moveTo(x,H);b.lineTo(x+(H-floorY)*.5,floorY+3*u);b.stroke();}
  // the cabinet: a hard ink shadow, a wooden frame, a dotted back panel, the glass
  const x0=L.ox,y0=L.oy,cw=L.cw,ch=L.ch,fr=Math.max(5,L.k*2.2);
  b.fillStyle=INK;b.fillRect(x0-fr+7*u,y0-fr+7*u,cw+fr*2,ch+fr*2+8);
  b.fillStyle=WOOD;b.fillRect(x0-fr,y0-fr,cw+fr*2,ch+fr*2+8);b.lineWidth=3*u;b.strokeStyle=INK;b.strokeRect(x0-fr,y0-fr,cw+fr*2,ch+fr*2+8);
  b.fillStyle='#fbe6c0';b.fillRect(x0,y0,cw,ch);b.fillStyle='#f3cf9a';for(let y=y0;y<y0+ch;y+=8*u)for(let x=x0+(Math.round((y-y0)/(8*u))%2)*4*u;x<x0+cw;x+=8*u){b.beginPath();b.arc(x,y,1.5*u,0,Math.PI*2);b.fill();}
  // shelf brackets on the back panel (decor only), and the glare stripes of the glass front
  b.globalAlpha=.55;b.fillStyle='#ffffff';const gs=(sx:number,wd:number)=>{b.beginPath();b.moveTo(x0+cw*sx,y0+ch);b.lineTo(x0+cw*(sx+wd),y0+ch);b.lineTo(x0+cw*(sx+wd+.18),y0);b.lineTo(x0+cw*(sx+.18),y0);b.closePath();b.fill();};gs(.06,.05);gs(.15,.02);gs(.7,.04);b.globalAlpha=1;
  b.lineWidth=3*u;b.strokeStyle=INK;b.strokeRect(x0,y0,cw,ch);
  // the brass name plate on the plinth
  const pw=Math.min(cw*.5,150),py=y0+ch+fr*.2;b.fillStyle=SUN;b.fillRect(L.w/2-pw/2,py,pw,Math.max(10,fr+4));b.lineWidth=2*u;b.strokeRect(L.w/2-pw/2,py,pw,Math.max(10,fr+4));
  b.fillStyle=INK;b.font=`italic 900 ${Math.max(8,Math.min(13,fr+1))}px "Arial Black",Impact,sans-serif`;b.textAlign='center';b.textBaseline='middle';b.fillText('TROPHY CABINET',L.w/2,py+Math.max(10,fr+4)/2+.5);
  // the thumb strip: a printed slide-to-aim arrow under the cabinet
  const ty=Math.min(H-24*u,L.thumbY+Math.max(14,(H-L.thumbY)*.35));if(H-L.thumbY>40){b.strokeStyle=INK;b.lineWidth=3*u;b.setLineDash([7*u,6*u]);b.beginPath();b.moveTo(W*.24,ty);b.lineTo(W*.76,ty);b.stroke();b.setLineDash([]);
   for(const [x,d] of [[W*.24,-1],[W*.76,1]] as const){b.beginPath();b.moveTo(x+d*10*u,ty);b.lineTo(x,ty-7*u);b.lineTo(x,ty+7*u);b.closePath();b.fillStyle=INK;b.fill();}
   b.fillStyle=PAPER;b.font=`800 ${Math.round(12*u)}px system-ui,Arial,sans-serif`;b.textAlign='center';b.textBaseline='middle';const tw=b.measureText('Slide to aim, let go to drop').width+16*u;b.fillStyle=INK;b.fillRect(W/2-tw/2,ty-11*u,tw,22*u);b.fillStyle=PAPER;b.fillText('Slide to aim, let go to drop',W/2,ty+.5);}
 }
 function resize(cssW:number,cssH:number,ratio:number,top:number){
  dpr=ratio;L=trophyLayout(cssW,cssH,top);for(const c of [bg,fg]){c.width=Math.max(1,Math.round(cssW*dpr));c.height=Math.max(1,Math.round(cssH*dpr));}
  build();paintScene();
 }
 const toWorld=(cssX:number)=>(cssX-L.ox)/L.k;
 function pop(x:number,y:number,text:string,color:string,size:number,kind=0){const p=pops.find(q=>!q.on)??pops[0];Object.assign(p,{on:true,x,y,t:0,life:kind?1.1:.85,text,color,size,kind});}
 function burstAt(x:number,y:number,r:number,color:string){const q=bursts.find(z=>!z.on)??bursts[0];Object.assign(q,{on:true,x,y,r,t:0,life:reduced?.2:.42,color});}
 const WORDS=['','','','BOOT!','GLOVE!','MEDAL!','SHIELD!','CUP!','TROPHY!'];
 function onEvent(e:TrophyEvent){
  if(e.type==='merge'){const r=TIERS[e.a].r;burstAt(e.x,e.y,r*1.7,TIERS[e.a].color);pop(e.x,e.y-r-3,`+${e.b}`,PAPER,13+Math.min(9,e.a*1.4));
   if(e.c>=2)pop(e.x,e.y-r-12,`CHAIN x${Math.min(TD.chainCap,e.c)}!`,SUN,16,1);if(e.a>=3&&!reduced)shake=Math.max(shake,.08+e.a*.012);
   if(e.a>=5)word={text:WORDS[e.a],sub:TIERS[e.a].name,t:0,life:1,color:TIERS[e.a].color};}
  else if(e.type==='double'){burstAt(e.x,e.y,50,SUN);pop(e.x,e.y-20,`+${e.b}`,SUN,26,1);word={text:'GOLDEN DOUBLE!',sub:'Two trophies',t:0,life:1.4,color:SUN};flash=.5;if(!reduced)shake=.3;}
  else if(e.type==='pop'){burstAt(e.x,e.y,16,PAPER);pop(e.x,e.y-12,'PSSHH!',TEAL,14,1);}
  else if(e.type==='hit'){pop(e.x,e.y-10,'BOING!',RED,12,1);}
  else if(e.type==='level'){word={text:`LEVEL ${e.a}`,sub:'The cabinet gets smaller!',t:0,life:1.3,color:TEAL};}
  else if(e.type==='over'){word={text:'FULL CABINET!',sub:'',t:0,life:9,color:RED};if(!reduced)shake=.25;}
 }
 /** Where a drop at x would first touch: the top of the highest item under it, or the floor. */
 function guideEnd(g:TrophyDrop,x:number,r:number){const s=g.state;let y=s.floor-r;for(const q of s.bodies){const dx=Math.abs(q.x-x),rr=q.r+r;if(dx>=rr)continue;const yy=q.y-Math.sqrt(rr*rr-dx*dx);if(yy<y)y=yy;}return Math.max(TD.dropY,y);}
 function drawBody(q:Body,ox:number,oy:number){
  const cv=q.t===BEACH?beachSprites[q.hits>0?1:0]:sprites[q.t];if(!cv)return;const scale=q.r/q.tr,size=cv.width/dpr*scale,sx=X(q.x)+ox,sy=Y(q.y)+oy;
  if(q.sq>0&&!reduced){const a=q.sq*.28,R=q.r*L.k;f.setTransform(dpr*(1+a),0,0,dpr*(1-a),(sx)*dpr,(sy+R*a)*dpr);f.drawImage(cv,-size/2,-size/2,size,size);f.setTransform(dpr,0,0,dpr,0,0);}
  else f.drawImage(cv,sx-size/2,sy-size/2,size,size);
 }
 function plain(){f.setTransform(dpr,0,0,dpr,0,0);f.globalAlpha=1;}
 function lettering(text:string,x:number,y:number,px:number,fill:string,tilt=-.04){
  f.save();f.translate(x,y);f.rotate(tilt);f.font=`italic 900 ${px}px "Arial Black",Impact,sans-serif`;f.textAlign='center';f.textBaseline='middle';f.lineJoin='round';
  f.lineWidth=Math.max(3,px*.22);f.strokeStyle=INK;f.fillStyle=INK;f.fillText(text,px*.08,px*.1);f.strokeText(text,0,0);f.fillStyle=fill;f.fillText(text,0,0);f.restore();
 }
 /** Draws one frame. Returns true while an effect is still running. */
 function render(g:TrophyDrop,dt:number,holding:boolean){
  const s=g.state;clock+=dt;plain();f.clearRect(0,0,L.w,L.h);let busy=false;
  let ox=0,oy=0;if(shake>0){shake=Math.max(0,shake-dt);const m=shake*18;ox=Math.sin(clock*71)*m;oy=Math.cos(clock*53)*m*.6;busy=true;}
  // the walls and floor as they close in after a level up: wooden panels inside the frame
  const k=L.k;if(s.left>0||s.right<TD.w||s.floor<TD.h){f.fillStyle=WOOD;f.strokeStyle=INK;f.lineWidth=2.5;
   if(s.left>0){f.fillRect(L.ox,L.oy,s.left*k,L.ch);f.strokeRect(L.ox,L.oy,s.left*k,L.ch);}
   if(s.right<TD.w){f.fillRect(X(s.right),L.oy,(TD.w-s.right)*k,L.ch);f.strokeRect(X(s.right),L.oy,(TD.w-s.right)*k,L.ch);}
   if(s.floor<TD.h){f.fillStyle=WOOD_D;f.fillRect(L.ox,Y(s.floor),L.cw,(TD.h-s.floor)*k);f.fillStyle=WOOD;f.fillRect(L.ox,Y(s.floor),L.cw,Math.min(6,(TD.h-s.floor)*k));f.strokeRect(L.ox,Y(s.floor),L.cw,(TD.h-s.floor)*k);}}
  // the top line: dashed ink; it turns red and counts down while items are over it
  const ly=Y(TD.line),warn=s.danger>0,blink=warn&&!reduced?(Math.sin(clock*18)>0):warn;
  f.lineWidth=warn?4:3;f.strokeStyle=warn?(blink?RED:INK):s.near?ORANGE:INK;f.setLineDash([10,7]);f.beginPath();f.moveTo(X(s.left)+2,ly);f.lineTo(X(s.right)-2,ly);f.stroke();f.setLineDash([]);
  {f.font='900 10px "Arial Black",Impact,sans-serif';const tw=f.measureText('TOP LINE').width+10,tx=X(s.left)+6;f.fillStyle=warn?RED:INK;f.fillRect(tx,ly-8,tw,16);f.fillStyle=PAPER;f.textAlign='left';f.textBaseline='middle';f.fillText('TOP LINE',tx+5,ly+.5);}
  if(warn){busy=true;f.globalAlpha=.16;f.fillStyle=RED;f.fillRect(X(s.left),L.oy,(s.right-s.left)*k,ly-L.oy);f.globalAlpha=1;
   const left=Math.max(0,TD.overHold-s.danger);lettering(left>0?`TOO HIGH! ${left.toFixed(1)}`:'TOO HIGH!',L.w/2,ly+16,Math.max(13,k*5),RED,-.02);}
  // the held item and its drop guide
  if(!s.over){const t=s.cur,r=g.radiusOf(t),x=s.aim,ready=s.cool<=0;
   if(ready){const ye=guideEnd(g,x,r);f.strokeStyle=INK;f.globalAlpha=holding?.85:.45;f.lineWidth=2.5;f.setLineDash([4,6]);f.beginPath();f.moveTo(X(x),Y(TD.dropY)+r*k);f.lineTo(X(x),Y(ye)+r*k);f.stroke();f.setLineDash([]);
    f.beginPath();f.ellipse(X(x),Y(ye)+r*k,Math.max(3,r*k*.5),3,0,0,Math.PI*2);f.fill();f.globalAlpha=1;guideX=x;}
   const cv=t===BEACH?beachSprites[0]:sprites[t];if(cv){const size=cv.width/dpr,bob=ready?0:(s.cool/TD.cool)*-10;f.globalAlpha=ready?1:.55;f.drawImage(cv,X(x)-size/2,Y(TD.dropY)+bob-size/2,size,size);f.globalAlpha=1;}
   if(!ready)busy=true;
   // the next item: a paper tag pinned on the top right of the frame, clear of the glass where the held item hangs
   const nx=L.ox+L.cw-30,ny=Math.max(L.top-8,L.oy-30),ncv=s.next===BEACH?beachSprites[0]:sprites[s.next];f.fillStyle=PAPER;f.strokeStyle=INK;f.lineWidth=2.5;f.fillRect(nx-24,ny-16,50,46);f.strokeRect(nx-24,ny-16,50,46);
   f.fillStyle=INK;f.font='900 9px "Arial Black",Impact,sans-serif';f.textAlign='center';f.textBaseline='middle';f.fillText('NEXT',nx+1,ny-8);
   if(ncv){const sz=Math.min(30,ncv.width/dpr);f.drawImage(ncv,nx+1-sz/2,ny+12-sz/2,sz,sz);}}
  for(const q of s.bodies){drawBody(q,ox,oy);if(q.sq>0||q.r<q.tr)busy=true;}
  // bursts: a comic star behind a ring of ink rays
  for(const z of bursts){if(!z.on)continue;z.t+=dt;if(z.t>=z.life){z.on=false;continue;}busy=true;const p=z.t/z.life,R=z.r*k*(.6+p*.7),cx=X(z.x)+ox,cy=Y(z.y)+oy;
   f.globalAlpha=1-p*p;f.beginPath();for(let i=0;i<20;i++){const a=i*Math.PI/10+p,rr=i%2?R*.62:R;f.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}f.closePath();f.fillStyle=z.color;f.fill();f.lineWidth=3;f.strokeStyle=INK;f.stroke();
   f.lineWidth=3;for(let i=0;i<8;i++){const a=i*Math.PI/4+.2;f.beginPath();f.moveTo(cx+Math.cos(a)*R*1.05,cy+Math.sin(a)*R*1.05);f.lineTo(cx+Math.cos(a)*R*1.35,cy+Math.sin(a)*R*1.35);f.stroke();}f.globalAlpha=1;}
  for(const p of pops){if(!p.on)continue;p.t+=dt;if(p.t>=p.life){p.on=false;continue;}busy=true;const q=p.t/p.life,rise=(reduced?0:24)*Math.min(1,q*1.6),sc=q<.15?.6+q/.15*.5:1.1-Math.min(.1,(q-.15));
   f.globalAlpha=q>.7?1-(q-.7)/.3:1;lettering(p.text,X(p.x),Y(p.y)-rise,p.size*sc,p.color,p.kind?-.06:.03);f.globalAlpha=1;}
  if(flash>0){flash=Math.max(0,flash-dt);f.globalAlpha=flash*.6;f.fillStyle=PAPER;f.fillRect(0,0,L.w,L.h);f.globalAlpha=1;busy=true;}
  if(word){word.t+=dt;if(word.t>=word.life)word=null;else{busy=true;const q=word.t/word.life,sc=q<.12?.5+q/.12*.6:1.1-Math.min(.1,q),cy=L.oy+L.ch*.42,px=Math.min(L.cw*.13,44)*sc;
   f.globalAlpha=q>.8?1-(q-.8)/.2:1;f.save();f.font=`italic 900 ${px}px "Arial Black",Impact,sans-serif`;const tw=Math.min(L.cw*.96,f.measureText(word.text).width+px*1.1),th=px*1.6;f.restore();
   f.save();f.translate(L.w/2,cy);f.rotate(-.05);f.fillStyle=INK;f.fillRect(-tw/2+6,-th/2+6,tw,th);f.fillStyle=word.color;f.fillRect(-tw/2,-th/2,tw,th);f.lineWidth=3.5;f.strokeStyle=INK;f.strokeRect(-tw/2,-th/2,tw,th);f.restore();
   lettering(word.text,L.w/2,cy,Math.min(px,(L.cw*.9)/Math.max(4,word.text.length)*1.5),PAPER,-.05);
   if(word.sub){f.save();f.translate(L.w/2+8,cy+th*.62);f.rotate(.03);f.font=`800 ${Math.max(12,px*.36)}px system-ui,Arial,sans-serif`;const sw=f.measureText(word.sub).width+16;f.fillStyle=INK;f.fillRect(-sw/2,-11,sw,22);f.fillStyle=PAPER;f.textAlign='center';f.textBaseline='middle';f.fillText(word.sub,0,1);f.restore();}
   f.globalAlpha=1;}}
  plain();return busy;
 }
 function reset(){for(const p of pops)p.on=false;for(const z of bursts)z.on=false;word=null;shake=0;flash=0;guideX=-1;}
 function clear(){plain();f.clearRect(0,0,L.w,L.h);}
 return {resize,render,onEvent,reset,clear,toWorld,get layout(){return L;},get guideX(){return guideX;}};
}
