/**
 * Trophy Drop drawing (Nov 17 2026, comic-print house style: ink outlines, flat colour, violet shadow band, Ben-Day dots). Two
 * canvases: `bg` is the club trophy room and the empty cabinet frame, painted ONCE per resize; `fg` is the moving layer (items, the
 * held item and its drop guide, the walls and floor as they close in, bursts, score pops, the top line). Every item is a round badge
 * pre-rendered once per resize (one sprite per tier), so a frame is a handful of drawImage calls. render() returns true while
 * something is still animating, so the shell can stop its loop on a settled cabinet (heat).
 * AAA pass (Nov 18 2026): every item has a face (eyes, mouth, cheeks) and the blink is two small lids drawn live over the sprite (no
 * second sprite set: sprite memory is unchanged); items roll / rock with the core's angle, stretch while they fall, squash when they
 * land and overshoot when a merge makes them; pooled sparks and dust; score pops fly up to the counter; the room has four LIGHTING
 * STAGES that follow the biggest item made (day, sunset at the medal, evening spotlights at the cup, gala night at the golden
 * trophy) and the plinth carries nine brass PLAQUES that fill as each item is first made: `bg` is repainted only on those changes.
 * The big word panels moved OFF the play area into the strip under the cabinet (they used to cover the pile and the drop guide).
 */
import {TD,TIERS,BEACH,BEACH_R,type TrophyDrop,type TrophyEvent,type Body} from './core';

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const WOOD='#b5683a',WOOD_D='#8a4a2a',BRASS='#e0a93a';
type Ctx=CanvasRenderingContext2D;
/** The four lighting stages of the room (flat colours only). */
const STAGES=[
 {wall:'#ffcf7a',dot:'#f6b766',back:'#fbe6c0',backDot:'#f3cf9a',floor:'#d98c4f',board:'#b8703c',lamp:false,spots:0},
 {wall:'#ffb46a',dot:'#f2994d',back:'#fde3b4',backDot:'#f2c88c',floor:'#cf7f45',board:'#ad6535',lamp:true,spots:0},
 {wall:'#8f78b8',dot:'#7c65a8',back:'#f6e7d6',backDot:'#e6ccc0',floor:'#a8623c',board:'#8a4a2a',lamp:true,spots:2},
 {wall:'#43346a',dot:'#5a4a86',back:'#fff0c4',backDot:'#f6d488',floor:'#8a4a2a',board:'#6f3a20',lamp:true,spots:3},
] as const;
/** Which lighting stage the biggest item made so far calls for: 0 day, 1 sunset (medal), 2 evening (cup), 3 gala night (golden trophy). */
export const trophyStage=(best:number)=>best>=8?3:best>=7?2:best>=5?1:0;

/** Where the cabinet sits on a stage of w x h css px. top = room the HUD takes; bottom = the thumb strip under the cabinet. */
export function trophyLayout(w:number,h:number,top:number){
 const bottom=Math.max(84,Math.min(124,h*.14)),side=Math.max(12,Math.min(26,w*.04)),availW=w-side*2,availH=Math.max(120,h-top-bottom-18);
 const k=Math.max(1,Math.min(availW/TD.w,availH/TD.h)),cw=TD.w*k,ch=TD.h*k,ox=Math.round((w-cw)/2),oy=Math.round(top+Math.max(0,(availH-ch)*.45));
 const fr=Math.max(5,k*2.2),pl=Math.max(22,Math.min(30,k*8)),floorY=oy+ch+pl+4,stripY=floorY+Math.max(24,(h-floorY)*.5);
 return {w,h,k,ox,oy,cw,ch,top,bottom,fr,pl,floorY,stripY,thumbY:oy+ch+18};
}
export type TrophyLayout=ReturnType<typeof trophyLayout>;

/* ---- the item badges (pre-rendered) ---- */
function disc(c:Ctx,r:number,fill:string){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fillStyle=fill;c.fill();}
/** The violet shadow band: Ben-Day dots in the lower-right crescent of a disc. */
function shade(c:Ctx,r:number,step:number,color=VIOLET,alpha=.55){
 c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();c.beginPath();c.rect(-r,-r,r*2,r*2);c.arc(-r*.28,-r*.3,r*1.02,0,Math.PI*2,true);c.clip('evenodd');
 c.globalAlpha=alpha;c.fillStyle=color;const d=step*.32;for(let y=-r;y<=r;y+=step)for(let x=-r+((Math.round((y+r)/step)%2)*step/2);x<=r;x+=step){c.beginPath();c.arc(x,y,d,0,Math.PI*2);c.fill();}c.restore();
}
function shine(c:Ctx,r:number){c.save();c.fillStyle='#ffffff';c.globalAlpha=.85;c.beginPath();c.ellipse(-r*.42,-r*.45,r*.2,r*.11,-.7,0,Math.PI*2);c.fill();c.restore();}
function ring(c:Ctx,r:number,lw:number){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();}
/** Where each tier's face sits (x, y, size in radii), its mouth (0 smile, 1 open grin) and the colour behind its eyes (the blink
 *  paints two lids of that colour). Index = tier; the last row is the beach ball. */
const FACES:readonly (readonly [number,number,number,number,string])[]=[
 [0,.02,.78,0,PAPER],[0,.02,.78,0,SUN],[0,.02,.78,1,ORANGE],[.04,.02,.4,0,PAPER],[.02,.2,.46,0,PAPER],[0,.2,.5,1,'#ffd24a'],[0,.08,.56,0,PAPER],[0,-.3,.5,0,'#eef1f7'],[0,-.34,.54,1,'#ffe27a'],[0,0,.5,1,PAPER],
];
const faceOf=(t:number)=>FACES[t===BEACH?9:t];
/** Two ink eyes with a paper glint, a mouth and two cheeks. */
function face(c:Ctx,r:number,t:number){
 const [fx,fy,fs,mood]=faceOf(t),x=fx*r,y=fy*r,s=fs*r,ex=s*.42,er=Math.max(1,s*.15);
 c.save();c.globalAlpha=.45;c.fillStyle=RED;for(const d of [-1,1]){c.beginPath();c.arc(x+d*s*.74,y+s*.24,er*1.15,0,Math.PI*2);c.fill();}c.globalAlpha=1;
 for(const d of [-1,1]){c.beginPath();c.ellipse(x+d*ex,y,er,er*1.25,0,0,Math.PI*2);c.fillStyle=INK;c.fill();c.beginPath();c.arc(x+d*ex-er*.3,y-er*.45,er*.4,0,Math.PI*2);c.fillStyle='#ffffff';c.fill();}
 c.lineWidth=Math.max(1.1,s*.09);c.lineCap='round';c.lineJoin='round';c.strokeStyle=INK;c.beginPath();
 if(mood===1){c.arc(x,y+s*.2,s*.26,.08*Math.PI,.92*Math.PI);c.closePath();c.fillStyle=RED;c.fill();c.stroke();}
 else{c.arc(x,y+s*.1,s*.3,.2*Math.PI,.8*Math.PI);c.stroke();}
 c.restore();
}
/** A football: a ring of patches around a clear face. */
function ball(c:Ctx,r:number,t:number,body:string,patch:string,lw:number,withFace=true){
 disc(c,r,body);c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();
 const pent=(x:number,y:number,s:number,rot:number)=>{c.beginPath();for(let i=0;i<5;i++){const a=rot+i*Math.PI*2/5-Math.PI/2;c.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);}c.closePath();c.fillStyle=patch;c.fill();c.lineWidth=lw*.5;c.strokeStyle=INK;c.stroke();};
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2+Math.PI/5;c.beginPath();c.moveTo(Math.cos(a)*r*.62,Math.sin(a)*r*.62);c.lineTo(Math.cos(a)*r*.78,Math.sin(a)*r*.78);c.lineWidth=lw*.5;c.strokeStyle=INK;c.stroke();pent(Math.cos(a)*r*1.02,Math.sin(a)*r*1.02,r*.3,a+Math.PI/2);}
 if(!withFace)pent(0,0,r*.34,0);
 c.restore();shade(c,r,Math.max(2.4,r*.17));if(withFace)face(c,r,t);shine(c,r);ring(c,r,lw);
}
function path(c:Ctx,pts:number[],r:number,fill:string,lw:number,close=true){c.beginPath();for(let i=0;i<pts.length;i+=2)c.lineTo(pts[i]*r,pts[i+1]*r);if(close)c.closePath();c.fillStyle=fill;c.fill();c.lineJoin='round';c.lineWidth=lw;c.strokeStyle=INK;c.stroke();}
function star(c:Ctx,x:number,y:number,ro:number,ri:number,fill:string){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?ri:ro;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=fill;c.fill();}
/** Badge: a coloured disc with sun rays and the object drawn on it; the object carries the face. */
function badge(c:Ctx,r:number,t:number,lw:number){
 const T=TIERS[t];disc(c,r,T.color);
 c.save();c.beginPath();c.arc(0,0,r*.98,0,Math.PI*2);c.clip();c.globalAlpha=.25;c.fillStyle=PAPER;for(let i=0;i<8;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,r,i*Math.PI/4,i*Math.PI/4+Math.PI/8);c.fill();}c.restore();
 const l=lw*.85;
 if(t===3){// boot: side view, a red toe cap, studs, laces
  path(c,[-.62,-.14,-.5,-.54,-.14,-.56,-.06,-.26,.3,-.2,.62,-.02,.68,.3,-.62,.3],r,PAPER,l);path(c,[.36,-.17,.62,-.02,.68,.3,.4,.3],r,RED,l*.7);
  path(c,[-.64,.3,.7,.3,.64,.42,-.62,.42],r,INK,l*.6);for(const x of [-.5,-.2,.2,.5]){c.fillStyle=INK;c.fillRect((x-.05)*r,.42*r,.1*r,.12*r);}
  c.lineWidth=l*.7;c.strokeStyle=RED;for(let i=0;i<3;i++){c.beginPath();c.moveTo((-.44+i*.11)*r,(-.44+i*.02)*r);c.lineTo((-.3+i*.11)*r,(-.36+i*.02)*r);c.stroke();}
 }else if(t===4){// keeper glove: palm and four fingers, thumb, wrist strap
  path(c,[-.34,.6,-.36,.05,-.6,-.16,-.56,-.28,-.3,-.14,-.3,-.56,-.16,-.6,-.12,-.18,-.06,-.68,.08,-.68,.1,-.18,.18,-.62,.32,-.58,.3,-.12,.4,-.48,.52,-.42,.42,.1,.34,.6],r,PAPER,l);
  path(c,[-.38,.44,.38,.44,.36,.66,-.36,.66],r,INK,l*.6);c.fillStyle=SUN;c.fillRect(-.26*r,.5*r,.52*r,.09*r);
 }else if(t===5){// medal on a ribbon (Nov 18 2026: the gold disc sat at y 0.22 px, not 0.22 radii: it was drawn off its ring)
  path(c,[-.36,-.7,-.12,-.7,.06,-.16,-.14,-.08],r,RED,l);path(c,[.36,-.7,.12,-.7,-.06,-.16,.14,-.08],r,SUN,l);
  c.beginPath();c.arc(0,.2*r,.46*r,0,Math.PI*2);c.fillStyle='#ffd24a';c.fill();c.lineWidth=l;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.arc(0,.2*r,.38*r,0,Math.PI*2);c.lineWidth=l*.45;c.stroke();
 }else if(t===6){// club shield crest: a red band with a star over a paper field
  path(c,[0,-.68,.56,-.48,.52,.14,0,.68,-.52,.14,-.56,-.48],r,PAPER,l);path(c,[0,-.68,.56,-.48,.55,-.24,-.55,-.24,-.56,-.48],r,RED,l*.7);star(c,0,-.42*r,.13*r,.06*r,SUN);
 }else if(t===7){// silver cup with two handles
  c.lineWidth=l;c.strokeStyle=INK;c.beginPath();c.arc(-.46*r,-.2*r,.2*r,Math.PI*.5,Math.PI*1.5);c.stroke();c.beginPath();c.arc(.46*r,-.2*r,.2*r,-Math.PI*.5,Math.PI*.5);c.stroke();
  path(c,[-.46,-.56,.46,-.56,.36,-.02,.12,.18,.1,.36,.3,.44,.3,.6,-.3,.6,-.3,.44,-.1,.36,-.12,.18,-.36,-.02],r,'#eef1f7',l);
  c.fillStyle=VIOLET;c.globalAlpha=.5;c.fillRect(.33*r,-.5*r,.07*r,.36*r);c.globalAlpha=1;
 }else if(t===8){// golden trophy: big cup on a plinth, a star on the plate
  c.lineWidth=l*1.1;c.strokeStyle=INK;c.beginPath();c.arc(-.48*r,-.24*r,.22*r,Math.PI*.45,Math.PI*1.55);c.stroke();c.beginPath();c.arc(.48*r,-.24*r,.22*r,-Math.PI*.55,Math.PI*.55);c.stroke();
  path(c,[-.5,-.62,.5,-.62,.4,-.04,.12,.16,.1,.3,.26,.36,.26,.46,-.26,.46,-.26,.36,-.1,.3,-.12,.16,-.4,-.04],r,'#ffe27a',l);
  path(c,[-.4,.46,.4,.46,.4,.7,-.4,.7],r,WOOD,l);star(c,0,.58*r,.1*r,.045*r,SUN);
 }
 face(c,r,t);shade(c,r,Math.max(2.4,r*.13),VIOLET,.5);shine(c,r);ring(c,r,lw);
}
function beach(c:Ctx,r:number,lw:number,dent:number){
 const cols=[PAPER,RED,PAPER,SUN,PAPER,TEAL];for(let i=0;i<6;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,r,i*Math.PI/3-.3,(i+1)*Math.PI/3-.3);c.closePath();c.fillStyle=cols[i];c.fill();}
 c.beginPath();c.arc(0,0,r*.46,0,Math.PI*2);c.fillStyle=PAPER;c.fill();c.lineWidth=lw*.6;c.strokeStyle=INK;c.stroke();
 if(dent>0){c.lineWidth=lw*.7;c.beginPath();c.moveTo(r*.3,-r*.86);c.lineTo(r*.5,-r*.62);c.lineTo(r*.42,-r*.46);c.lineTo(r*.68,-r*.3);c.stroke();}
 shade(c,r,Math.max(2.4,r*.17));face(c,r,BEACH);shine(c,r);ring(c,r,lw);
}

/** Paints one item (tier 0-8) on a small canvas of `px` css px: the cards' tier ladder shows the real items, not plain discs. */
export function paintTrophyBadge(cv:HTMLCanvasElement,t:number,px:number,ratio:number){
 const c=cv.getContext('2d');if(!c)return;const size=Math.round(px*ratio);cv.width=cv.height=size;c.setTransform(ratio,0,0,ratio,size/2,size/2);const R=px/2-1.5,lw=Math.max(1.4,Math.min(2.6,R*.13));
 if(t===0)ball(c,R,t,PAPER,INK,lw);else if(t===1)ball(c,R,t,SUN,INK,lw);else if(t===2)ball(c,R,t,ORANGE,PAPER,lw);else badge(c,R,t,lw);
}

type Pop={on:boolean;x:number;y:number;t:number;life:number;text:string;color:string;size:number;kind:number};
type Burst={on:boolean;x:number;y:number;r:number;t:number;life:number;color:string};
type Spark={on:boolean;x:number;y:number;vx:number;vy:number;t:number;life:number;color:string;size:number};

export type TrophyView=ReturnType<typeof createTrophyView>;
export function createTrophyView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced?:boolean}={}){
 const b=bg.getContext('2d')!,f=fg.getContext('2d')!;let L=trophyLayout(1,1,0),dpr=1,sprites:HTMLCanvasElement[]=[],beachSprites:HTMLCanvasElement[]=[];
 const pops:Pop[]=Array.from({length:16},()=>({on:false,x:0,y:0,t:0,life:1,text:'',color:SUN,size:16,kind:0}));
 const bursts:Burst[]=Array.from({length:12},()=>({on:false,x:0,y:0,r:10,t:0,life:.4,color:SUN}));
 const sparks:Spark[]=Array.from({length:48},()=>({on:false,x:0,y:0,vx:0,vy:0,t:0,life:.5,color:SUN,size:3}));
 let shake=0,flash=0,word:{text:string;sub:string;t:number;life:number;color:string;mid:boolean}|null=null,clock=0,guideX=-1,swing=0,lastAim=-1;
 let stage=0,made=0,meterPulse=0,meterMiss=0,blinkT=0,blinkA=-1,blinkB=-1,spriteBytes=0;
 const reduced=!!opts.reduced;
 function sprite(r:number,draw:(c:Ctx,R:number,lw:number)=>void){const R=r*L.k,pad=Math.ceil(3*dpr+2),size=Math.ceil(R*2*dpr)+pad*2,cv=document.createElement('canvas');cv.width=cv.height=size;spriteBytes+=size*size*4;const c=cv.getContext('2d')!;
  c.setTransform(dpr,0,0,dpr,size/2,size/2);draw(c,R,Math.max(1.6,Math.min(3.2,R*.12)));return cv;}
 function build(){
  spriteBytes=0;
  sprites=TIERS.map((T,t)=>sprite(T.r,(c,R,lw)=>{if(t===0)ball(c,R,t,PAPER,INK,lw);else if(t===1)ball(c,R,t,SUN,INK,lw);else if(t===2)ball(c,R,t,ORANGE,PAPER,lw);else badge(c,R,t,lw);}));
  beachSprites=[0,1].map(d=>sprite(BEACH_R,(c,R,lw)=>beach(c,R,lw,d)));
 }
 const X=(x:number)=>L.ox+x*L.k,Y=(y:number)=>L.oy+y*L.k;
 /** The room and the empty cabinet. Painted on a resize, and again only when the lighting stage or the plaques change. */
 function paintScene(){
  const W=L.w,H=L.h,u=Math.max(1,Math.min(W,H)/400),S=STAGES[stage];b.setTransform(dpr,0,0,dpr,0,0);
  // the club room wall: flat colour, a dot screen, gala stars at night, a picture rail and a row of pennants
  b.fillStyle=S.wall;b.fillRect(0,0,W,H);b.fillStyle=S.dot;for(let y=0;y<H;y+=9*u)for(let x=(Math.round(y/(9*u))%2)*4.5*u;x<W;x+=9*u){b.beginPath();b.arc(x,y,1.6*u,0,Math.PI*2);b.fill();}
  if(stage===3)for(let i=0;i<16;i++){const sx=((i*73)%97)/97*W,sy=((i*41)%89)/89*Math.max(60,L.oy);star(b,sx,sy,(4+i%3*2)*u,(1.8+i%3)*u,i%4?SUN:PAPER);}
  const rail=Math.max(L.top-6,8);b.fillStyle=WOOD;b.fillRect(0,rail,W,6*u);b.fillStyle=INK;b.fillRect(0,rail+6*u,W,2*u);
  const pc=stage===3?[SUN,PAPER,SUN,RED,SUN]:[RED,TEAL,SUN,VIOLET,ORANGE];for(let i=0,x=6*u;x<W;i++,x+=34*u){b.beginPath();b.moveTo(x,rail+8*u);b.lineTo(x+26*u,rail+8*u);b.lineTo(x+13*u,rail+30*u);b.closePath();b.fillStyle=pc[i%5];b.fill();b.lineWidth=2*u;b.strokeStyle=INK;b.stroke();}
  // the floor: a skirting board, floor boards and a red rug under the cabinet
  const floorY=L.floorY;b.fillStyle=S.floor;b.fillRect(0,floorY,W,H-floorY);b.fillStyle=WOOD_D;b.fillRect(0,floorY-7*u,W,7*u);b.fillStyle=INK;b.fillRect(0,floorY,W,3*u);b.fillRect(0,floorY-8*u,W,2*u);
  b.strokeStyle=S.board;b.lineWidth=2*u;for(let x=-H;x<W;x+=46*u){b.beginPath();b.moveTo(x,H);b.lineTo(x+(H-floorY)*.5,floorY+3*u);b.stroke();}
  if(H-floorY>44){const rx=Math.max(4,L.ox-14),rw=W-rx*2,ry=floorY+7*u,rh=Math.min(H-ry-6,Math.max(18*u,(H-floorY)*.2));b.fillStyle=INK;b.fillRect(rx+4,ry+4,rw,rh);b.fillStyle=stage>=2?'#b83a52':RED;b.fillRect(rx,ry,rw,rh);b.lineWidth=2.5*u;b.strokeStyle=INK;b.strokeRect(rx,ry,rw,rh);
   b.strokeStyle=SUN;b.lineWidth=2*u;b.setLineDash([8*u,6*u]);b.beginPath();b.moveTo(rx+8*u,ry+rh/2);b.lineTo(rx+rw-8*u,ry+rh/2);b.stroke();b.setLineDash([]);}
  // the cabinet: a hard ink shadow, a crown, a wooden frame with grain, a dotted back panel with two shelf rails, the glass
  const x0=L.ox,y0=L.oy,cw=L.cw,ch=L.ch,fr=L.fr,pl=L.pl;
  b.fillStyle=INK;b.fillRect(x0-fr+7*u,y0-fr+7*u,cw+fr*2,ch+fr+pl);
  b.fillStyle=WOOD;b.fillRect(x0-fr,y0-fr,cw+fr*2,ch+fr+pl);b.strokeStyle=WOOD_D;b.lineWidth=1.5*u;for(const gx of [x0-fr*.62,x0-fr*.3,x0+cw+fr*.3,x0+cw+fr*.62]){b.beginPath();b.moveTo(gx,y0);b.lineTo(gx,y0+ch);b.stroke();}
  b.lineWidth=3*u;b.strokeStyle=INK;b.strokeRect(x0-fr,y0-fr,cw+fr*2,ch+fr+pl);
  b.fillStyle=WOOD_D;b.fillRect(x0-fr-4*u,y0-fr-5*u,cw+fr*2+8*u,7*u);b.strokeRect(x0-fr-4*u,y0-fr-5*u,cw+fr*2+8*u,7*u);
  b.fillStyle=S.back;b.fillRect(x0,y0,cw,ch);b.fillStyle=S.backDot;for(let y=y0;y<y0+ch;y+=8*u)for(let x=x0+(Math.round((y-y0)/(8*u))%2)*4*u;x<x0+cw;x+=8*u){b.beginPath();b.arc(x,y,1.5*u,0,Math.PI*2);b.fill();}
  b.fillStyle=S.backDot;for(const sy of [.46,.74]){b.fillRect(x0,y0+ch*sy,cw,3*u);for(const sx of [.08,.92]){b.beginPath();b.moveTo(x0+cw*sx-5*u,y0+ch*sy+3*u);b.lineTo(x0+cw*sx+5*u,y0+ch*sy+3*u);b.lineTo(x0+cw*sx,y0+ch*sy+11*u);b.closePath();b.fill();}}
  b.save();b.beginPath();b.rect(x0,y0,cw,ch);b.clip();
  // evening and gala: flat spotlight cones from the top of the cabinet
  if(S.spots){b.globalAlpha=stage===3?.3:.22;b.fillStyle=stage===3?'#ffffff':PAPER;for(let i=0;i<S.spots;i++){const cx=x0+cw*(S.spots===2?[.26,.74][i]:[.18,.5,.82][i]),sp=cw*.2;b.beginPath();b.moveTo(cx-4*u,y0);b.lineTo(cx+4*u,y0);b.lineTo(cx+sp,y0+ch);b.lineTo(cx-sp,y0+ch);b.closePath();b.fill();}b.globalAlpha=1;}
  // the glare stripes of the glass front
  b.globalAlpha=.5;b.fillStyle='#ffffff';const gs=(sx:number,wd:number)=>{b.beginPath();b.moveTo(x0+cw*sx,y0+ch);b.lineTo(x0+cw*(sx+wd),y0+ch);b.lineTo(x0+cw*(sx+wd+.18),y0);b.lineTo(x0+cw*(sx+.18),y0);b.closePath();b.fill();};gs(.06,.05);gs(.15,.02);gs(.7,.04);b.globalAlpha=1;b.restore();
  b.lineWidth=3*u;b.strokeStyle=INK;b.strokeRect(x0,y0,cw,ch);
  for(const [cx,cy,dx,dy] of [[x0,y0,1,1],[x0+cw,y0,-1,1]] as const){b.beginPath();b.moveTo(cx,cy);b.lineTo(cx+dx*13*u,cy);b.lineTo(cx,cy+dy*13*u);b.closePath();b.fillStyle=BRASS;b.fill();b.lineWidth=2*u;b.stroke();}
  // the plinth: nine brass plaques, one per item; a plaque is engraved (the item itself, small) once that item was made this run
  const py=y0+ch;b.fillStyle=WOOD_D;b.fillRect(x0-fr,py,cw+fr*2,pl);b.lineWidth=3*u;b.strokeStyle=INK;b.strokeRect(x0-fr,py,cw+fr*2,pl);
  const slot=cw/9,pr=Math.min(pl/2-3.5,slot/2-3);for(let t=0;t<TIERS.length;t++){const cx=x0+slot*(t+.5),cy=py+pl/2,on=t<=made,cv=sprites[t];
   b.fillStyle=on?(t===made&&made>0?SUN:BRASS):'#9c6a34';b.fillRect(cx-slot/2+2,py+3,slot-4,pl-6);b.lineWidth=1.5*u;b.strokeStyle=INK;b.strokeRect(cx-slot/2+2,py+3,slot-4,pl-6);
   if(on&&cv)b.drawImage(cv,cx-pr,cy-pr,pr*2,pr*2);else{b.beginPath();b.arc(cx,cy,pr*.62,0,Math.PI*2);b.fillStyle=WOOD_D;b.fill();b.lineWidth=1.5*u;b.stroke();}}
 }
 function resize(cssW:number,cssH:number,ratio:number,top:number){
  dpr=ratio;L=trophyLayout(cssW,cssH,top);for(const c of [bg,fg]){c.width=Math.max(1,Math.round(cssW*dpr));c.height=Math.max(1,Math.round(cssH*dpr));}
  build();paintScene();
 }
 const toWorld=(cssX:number)=>(cssX-L.ox)/L.k;
 function pop(x:number,y:number,text:string,color:string,size:number,kind=0){const p=(kind===2?pops.find(q=>q.on&&q.kind===2):undefined)??pops.find(q=>!q.on)??pops[0];// kind 2 = the chain counter: ONE pop that jumps to the newest link
  Object.assign(p,{on:true,x,y,t:0,life:kind?1.1:.95,text,color,size,kind});}
 function burstAt(x:number,y:number,r:number,color:string){const q=bursts.find(z=>!z.on)??bursts[0];Object.assign(q,{on:true,x,y,r,t:0,life:reduced?.2:.42,color});}
 /** n sparks from (x, y) in world units; speed in world units / s; up = how much of the fan points up (dust stays low). */
 function sparkAt(x:number,y:number,n:number,color:string,speed:number,size:number,up=1){if(reduced)return;for(let i=0;i<n;i++){const q=sparks.find(z=>!z.on);if(!q)return;const a=up<1?(i%2?Math.PI:0)+(Math.random()-.5)*.7*(i%2?-1:1):Math.random()*Math.PI*2,v=speed*(.55+Math.random()*.6);
  Object.assign(q,{on:true,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(up<1?speed*.25:speed*.3),t:0,life:.38+Math.random()*.3,color,size:size*(.7+Math.random()*.6)});}}
 const WORDS=['','','','BOOT!','GLOVE!','MEDAL!','SHIELD!','CUP!','TROPHY!'];
 function say(text:string,sub:string,life:number,color:string,mid=false){word={text,sub,t:0,life,color,mid};}
 function onEvent(e:TrophyEvent){
  if(e.type==='merge'){const r=TIERS[e.a].r,ch=Math.min(TD.chainCap,e.c);burstAt(e.x,e.y,r*(1.25+.16*ch),TIERS[e.a].color);sparkAt(e.x,e.y,5+e.a+ch*2,ch>=2?SUN:TIERS[e.a].color,60+e.a*8+ch*14,2.6+e.a*.3);pop(e.x,e.y-r-3,`+${e.b}`,PAPER,13+Math.min(9,e.a*1.4));
   if(e.c>=2){pop(e.x,e.y-r-13,`CHAIN x${ch}!`,SUN,14+ch*2.5,2);if(!reduced)flash=Math.max(flash,.08*ch);}
   if(e.a>=3&&!reduced)shake=Math.max(shake,.08+e.a*.012+(e.c>=2?.03*ch:0));
   if(e.a>=5)say(WORDS[e.a],e.a===5?'The lights come on!':e.a===7?'Spotlights!':e.a===8?'Gala night!':TIERS[e.a].name,1,TIERS[e.a].color);}
  else if(e.type==='double'){burstAt(e.x,e.y,50,SUN);sparkAt(e.x,e.y,24,SUN,150,4);pop(e.x,e.y-20,`+${e.b}`,SUN,26);say('GOLDEN DOUBLE!','The cabinet opens up!',1.6,SUN);flash=.5;if(!reduced)shake=.3;}
  else if(e.type==='pop'){burstAt(e.x,e.y,16,PAPER);sparkAt(e.x,e.y,6,TEAL,70,2.6);pop(e.x,e.y-12,'PSSHH!',TEAL,14,1);}
  else if(e.type==='hit'){pop(e.x,e.y-10,'BOING!',RED,12,1);}
  else if(e.type==='land'){if(e.b>90)sparkAt(e.x,e.y-.5,e.b>180?4:2,PAPER,26+e.b*.12,2.2,.2);}
  else if(e.type==='level'){say(`LEVEL ${e.a}`,'The cabinet gets smaller!',1.3,TEAL);}
  else if(e.type==='streak'){meterPulse=.35;}
  else if(e.type==='miss'){if(e.a>=2)meterMiss=.5;}
  else if(e.type==='earn'){say('SHAKE READY!','Tap Shake to jolt the pile',1.5,TEAL);meterPulse=.6;}
  else if(e.type==='shake'){say('SHAKE!','',.7,ORANGE);if(!reduced)shake=.38;for(let i=0;i<6;i++)sparkAt(TD.w*(.1+i*.16),g0floor,2,PAPER,60,2.6,.2);}
  else if(e.type==='safe'){if(e.a>=10)pop(TD.w/2,TD.line+10,'PHEW!',TEAL,18,1);}
  else if(e.type==='over'){say('FULL CABINET!','',9,RED,true);if(!reduced)shake=.25;}
 }
 let g0floor:number=TD.h;
 /** Where a drop at x would first touch: the top of the highest item under it, or the floor. */
 function guideEnd(g:TrophyDrop,x:number,r:number){const s=g.state;let y=s.floor-r;for(const q of s.bodies){if(!q.landed)continue;/* Nov 18 2026: an item still falling is not a landing spot (the guide used to stop in mid air) */const dx=Math.abs(q.x-x),rr=q.r+r;if(dx>=rr)continue;const yy=q.y-Math.sqrt(rr*rr-dx*dx);if(yy<y)y=yy;}return Math.max(TD.dropY,y);}
 function drawBody(q:Body,ox:number,oy:number,time:number){
  const cv=q.t===BEACH?beachSprites[q.hits>0?1:0]:sprites[q.t];if(!cv)return false;const R=q.r*L.k,sx=X(q.x)+ox;let scale=q.r/q.tr,sy=Y(q.y)+oy,a=0,anim=false;
  if(!reduced){
   if(q.sq>0){a=q.sq*.3;sy+=R*a;anim=true;}else if(!q.landed&&q.vy>60)a=-Math.min(.1,q.vy/260*.1);// squash on landing, a little stretch while it falls
   if(q.fromMerge){const t=(time-q.born)/.34;if(t<1){scale*=1+.2*Math.sin(t*Math.PI)*(1-t*.5);anim=true;}}// a new item pops past its size and settles
  }
  const size=cv.width/dpr*scale,blink=blinkT>0&&(q.id===blinkA||q.id===blinkB);
  if(a===0&&q.a===0&&!blink){f.drawImage(cv,sx-size/2,sy-size/2,size,size);return anim;}
  const co=Math.cos(q.a),si=Math.sin(q.a);f.setTransform(dpr*(1+a)*co,dpr*(1-a)*si,-dpr*(1+a)*si,dpr*(1-a)*co,sx*dpr,sy*dpr);f.drawImage(cv,-size/2,-size/2,size,size);
  if(blink){const [fx,fy,fs,,col]=faceOf(q.t),s=fs*R,er=Math.max(1,s*.15);for(const d of [-1,1]){const ex=fx*R+d*s*.42,ey=fy*R;f.beginPath();f.ellipse(ex,ey,er*1.25,er*1.5,0,0,Math.PI*2);f.fillStyle=col;f.fill();f.beginPath();f.moveTo(ex-er,ey+er*.2);f.lineTo(ex+er,ey+er*.2);f.lineWidth=Math.max(1.1,s*.09);f.lineCap='round';f.strokeStyle=INK;f.stroke();}}
  f.setTransform(dpr,0,0,dpr,0,0);return anim;
 }
 function plain(){f.setTransform(dpr,0,0,dpr,0,0);f.globalAlpha=1;}
 function lettering(text:string,x:number,y:number,px:number,fill:string,tilt=-.04){
  f.save();f.translate(x,y);f.rotate(tilt);f.font=`italic 900 ${px}px "Arial Black",Impact,sans-serif`;f.textAlign='center';f.textBaseline='middle';f.lineJoin='round';
  f.lineWidth=Math.max(3,px*.22);f.strokeStyle=INK;f.fillStyle=INK;f.fillText(text,px*.08,px*.1);f.strokeText(text,0,0);f.fillStyle=fill;f.fillText(text,0,0);f.restore();
 }
 function tag(text:string,x:number,y:number,fill:string,ink=PAPER,px=10){f.font=`900 ${px}px "Arial Black",Impact,sans-serif`;const tw=f.measureText(text).width+10;f.fillStyle=fill;f.fillRect(x,y-8,tw,16);f.fillStyle=ink;f.textAlign='left';f.textBaseline='middle';f.fillText(text,x+5,y+.5);return tw;}
 /** Draws one frame. Returns true while an effect is still running. */
 function render(g:TrophyDrop,dt:number,holding:boolean){
  const s=g.state;clock+=dt;g0floor=s.floor;
  // the room follows the biggest item made: repaint the static layer only when the lighting stage or a plaque changes
  {const st=trophyStage(s.stats.bestTier);if(st!==stage||s.stats.bestTier!==made){stage=st;made=s.stats.bestTier;paintScene();}}
  plain();f.clearRect(0,0,L.w,L.h);let busy=false;
  let ox=0,oy=0;if(shake>0){shake=Math.max(0,shake-dt);const m=shake*18;ox=Math.sin(clock*71)*m;oy=Math.cos(clock*53)*m*.6;busy=true;}
  // the walls and floor as they close in after a level up: wooden panels inside the frame
  const k=L.k;if(s.left>0||s.right<TD.w||s.floor<TD.h){f.fillStyle=WOOD;f.strokeStyle=INK;f.lineWidth=2.5;
   if(s.left>0){f.fillRect(L.ox,L.oy,s.left*k,L.ch);f.strokeRect(L.ox,L.oy,s.left*k,L.ch);}
   if(s.right<TD.w){f.fillRect(X(s.right),L.oy,(TD.w-s.right)*k,L.ch);f.strokeRect(X(s.right),L.oy,(TD.w-s.right)*k,L.ch);}
   if(s.floor<TD.h){f.fillStyle=WOOD_D;f.fillRect(L.ox,Y(s.floor),L.cw,(TD.h-s.floor)*k);f.fillStyle=WOOD;f.fillRect(L.ox,Y(s.floor),L.cw,Math.min(6,(TD.h-s.floor)*k));f.strokeRect(L.ox,Y(s.floor),L.cw,(TD.h-s.floor)*k);}}
  if(s.left!==s.goalLeft||s.right!==s.goalRight||s.floor!==s.goalFloor)busy=true;
  let soon=0,soonX=0,soonY=0;
  // the warning before a level up: where the walls and the floor will be, dashed, for the last few drops of the level
  if(!s.over&&g.dropsToLevel<=TD.warnPreview){const nw=g.nextWalls,n=g.dropsToLevel;if(nw.left>s.goalLeft||nw.floor<s.goalFloor){f.strokeStyle=RED;f.lineWidth=2.5;f.setLineDash([6,6]);f.beginPath();
   if(nw.left>s.goalLeft){f.moveTo(X(nw.left),L.oy);f.lineTo(X(nw.left),Y(nw.floor));f.moveTo(X(nw.right),L.oy);f.lineTo(X(nw.right),Y(nw.floor));}
   if(nw.floor<s.goalFloor){f.moveTo(X(nw.left),Y(nw.floor));f.lineTo(X(nw.right),Y(nw.floor));}f.stroke();f.setLineDash([]);
   soon=n;soonX=X(nw.right);soonY=Y(nw.floor);}}
  // the top line: dashed ink; over it, the line turns red, a red bar fills along it and the tag counts down (nothing covers the pile)
  const ly=Y(TD.line),warn=s.danger>0,blink=warn&&!reduced?(Math.sin(clock*(10+s.danger*8))>0):warn,x1=X(s.left)+2,x2=X(s.right)-2;
  if(warn){busy=true;f.globalAlpha=.1+.1*Math.min(1,s.danger/TD.overHold);f.fillStyle=RED;f.fillRect(X(s.left),L.oy,(s.right-s.left)*k,ly-L.oy);f.globalAlpha=1;
   f.fillStyle=INK;f.fillRect(x1,ly-5,x2-x1,10);f.fillStyle=RED;f.fillRect(x1+2,ly-3,(x2-x1-4)*Math.min(1,s.danger/TD.overHold),6);}
  f.lineWidth=warn?4:3;f.strokeStyle=warn?(blink?RED:INK):s.near?ORANGE:INK;f.setLineDash([10,7]);f.beginPath();f.moveTo(x1,ly);f.lineTo(x2,ly);if(!warn)f.stroke();f.setLineDash([]);
  {const left=Math.max(0,TD.overHold-s.danger);tag(warn?`TOO HIGH! ${left.toFixed(1)}`:s.shakeGrace>0?'SHAKE! CLOCK HELD':s.near?'TOP LINE: CLOSE':'TOP LINE',X(s.left)+6,ly,warn?RED:s.shakeGrace>0?TEAL:s.near?ORANGE:INK,s.near&&!warn&&s.shakeGrace<=0?INK:PAPER,warn?12:10);}
  if(s.shakeGrace>0)busy=true;
  // an empty cabinet says how to play (the first drop only)
  if(s.drops===0&&!s.over){lettering('SLIDE TO AIM',L.w/2,L.oy+L.ch*.56,Math.min(26,L.cw*.085),PAPER,-.03);lettering('LET GO TO DROP',L.w/2,L.oy+L.ch*.56+Math.min(34,L.cw*.11),Math.min(26,L.cw*.085),SUN,-.03);}
  // the next two items: a paper tag pinned on the top right of the frame (drawn BEFORE the held item, so an item aimed at the far right hangs in front of it; on a narrow phone it sits under the level strip)
  if(!s.over){const nx=L.ox+L.cw-52,ny=Math.max(L.w<384?L.top+6:L.top-8,L.oy-30),ncv=s.next===BEACH?beachSprites[0]:sprites[s.next],tcv=s.next2===BEACH?beachSprites[0]:sprites[s.next2];f.fillStyle=INK;f.fillRect(nx-45,ny-12,98,62);f.fillStyle=PAPER;f.strokeStyle=INK;f.lineWidth=2.5;f.fillRect(nx-48,ny-16,98,62);f.strokeRect(nx-48,ny-16,98,62);
   f.fillStyle=INK;f.font='900 10px "Arial Black",Impact,sans-serif';f.textAlign='center';f.textBaseline='middle';f.fillText('NEXT',nx-18,ny-7);f.globalAlpha=.6;f.font='900 8px "Arial Black",Impact,sans-serif';f.fillText('THEN',nx+31,ny-7);f.globalAlpha=1;
   f.beginPath();f.moveTo(nx+13,ny-12);f.lineTo(nx+13,ny+42);f.lineWidth=1.5;f.setLineDash([3,3]);f.stroke();f.setLineDash([]);
   if(ncv){const sz=Math.min(42,ncv.width/dpr*.6);f.drawImage(ncv,nx-18-sz/2,ny+21-sz/2,sz,sz);}if(tcv){const sz=Math.min(26,tcv.width/dpr*.4);f.drawImage(tcv,nx+31-sz/2,ny+21-sz/2,sz,sz);}}
  // the held item on its clamp, and its drop guide
  if(!s.over){const t=s.cur,r=g.radiusOf(t),x=s.aim,ready=s.cool<=0;
   if(lastAim<0)lastAim=x;if(!reduced){swing+=((lastAim-x)*.045-swing)*Math.min(1,dt*12);if(swing>.35)swing=.35;else if(swing<-.35)swing=-.35;if(Math.abs(swing)>.004)busy=true;else swing=0;}lastAim=x;
   if(ready){const ye=guideEnd(g,x,r);f.strokeStyle=INK;f.globalAlpha=holding?.85:.45;f.lineWidth=2.5;f.setLineDash([4,6]);f.beginPath();f.moveTo(X(x),Y(TD.dropY)+r*k);f.lineTo(X(x),Y(ye)-r*k);f.stroke();
    f.beginPath();f.arc(X(x),Y(ye),r*k,0,Math.PI*2);f.stroke();f.setLineDash([]);f.globalAlpha=1;guideX=x;}
   const cv=t===BEACH?beachSprites[0]:sprites[t];if(cv){const p=ready?1:1-s.cool/TD.cool,e=1-(1-p)*(1-p),size=cv.width/dpr*(.55+.45*e),hy=Y(TD.dropY)-(1-e)*r*k*1.6;
    f.strokeStyle=INK;f.lineWidth=3;f.beginPath();f.moveTo(X(x)-swing*18,L.oy);f.lineTo(X(x),hy-size*.5+2);f.stroke();f.fillStyle=BRASS;f.fillRect(X(x)-swing*18-7,L.oy,14,6);f.lineWidth=2;f.strokeRect(X(x)-swing*18-7,L.oy,14,6);
    f.globalAlpha=ready?1:.7;if(swing!==0){const co=Math.cos(swing),si=Math.sin(swing);f.setTransform(dpr*co,dpr*si,-dpr*si,dpr*co,X(x)*dpr,hy*dpr);f.drawImage(cv,-size/2,-size/2,size,size);f.setTransform(dpr,0,0,dpr,0,0);}else f.drawImage(cv,X(x)-size/2,hy-size/2,size,size);f.globalAlpha=1;}
   if(!ready||s.queued)busy=true;}
  // bursts: a comic star behind a ring of ink rays, drawn BEHIND the items so the new item pops out of it
  for(const z of bursts){if(!z.on)continue;z.t+=dt;if(z.t>=z.life){z.on=false;continue;}busy=true;const p=z.t/z.life,e=1-(1-p)*(1-p),R=z.r*k*(.5+e*.8),cx=X(z.x)+ox,cy=Y(z.y)+oy;
   f.globalAlpha=1-p*p;f.beginPath();for(let i=0;i<20;i++){const a=i*Math.PI/10+p,rr=i%2?R*.62:R;f.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}f.closePath();f.fillStyle=z.color;f.fill();f.lineWidth=3;f.strokeStyle=INK;f.stroke();
   f.lineWidth=3;for(let i=0;i<8;i++){const a=i*Math.PI/4+.2;f.beginPath();f.moveTo(cx+Math.cos(a)*R*1.05,cy+Math.sin(a)*R*1.05);f.lineTo(cx+Math.cos(a)*R*1.35,cy+Math.sin(a)*R*1.35);f.stroke();}f.globalAlpha=1;}
  // the items; a falling one trails three speed lines
  for(const q of s.bodies){if(!reduced&&!q.landed&&q.vy>120){const sx=X(q.x)+ox,sy=Y(q.y)+oy,R=q.r*k;f.strokeStyle=INK;f.globalAlpha=.4;f.lineWidth=2;f.beginPath();for(const d of [-.6,0,.6]){f.moveTo(sx+d*R,sy-R*(1.15-Math.abs(d)*.3));f.lineTo(sx+d*R,sy-R*(1.15-Math.abs(d)*.3)-q.vy*.05*k*.3);}f.stroke();f.globalAlpha=1;}
   if(drawBody(q,ox,oy,s.time)||q.r<q.tr)busy=true;}
  // twins of the held item (Nov 17 2026): a dashed sun ring says "drop it here to merge"; drawn only with a frame that runs anyway
  if(!s.over&&s.cool<=0&&s.cur!==BEACH){f.setLineDash([6,5]);for(const q of s.bodies)if(q.t===s.cur){const cx=X(q.x)+ox,cy=Y(q.y)+oy,rr=q.r*k+4;
   f.lineWidth=5;f.strokeStyle=INK;f.beginPath();f.arc(cx,cy,rr,0,Math.PI*2);f.stroke();f.lineWidth=2.5;f.strokeStyle=SUN;f.stroke();}f.setLineDash([]);}
  if(soon>0)tag(soon===1?'SMALLER NEXT DROP':`SMALLER IN ${soon} DROPS`,soonX-(soon===1?122:128),soonY-11,RED);// over the items: a warning must not hide behind the pile
  // the items that are over the top line wear a red ring: the player sees which ones to bring down
  if(warn){f.lineWidth=4;f.strokeStyle=RED;for(const q of s.bodies)if(q.landed&&q.age>=TD.grace&&q.y-q.r<TD.line){f.beginPath();f.arc(X(q.x)+ox,Y(q.y)+oy,q.r*k+3,0,Math.PI*2);f.stroke();}}
  // sparks and dust (pooled): small inked squares that fly out and fall
  for(const z of sparks){if(!z.on)continue;z.t+=dt;if(z.t>=z.life){z.on=false;continue;}busy=true;z.vy+=260*dt;z.x+=z.vx*dt;z.y+=z.vy*dt;const p=z.t/z.life,sz=z.size*(1-p*.6),cx=X(z.x)+ox,cy=Y(z.y)+oy;
   f.fillStyle=INK;f.fillRect(cx-sz-1.2,cy-sz-1.2,sz*2+2.4,sz*2+2.4);f.fillStyle=z.color;f.fillRect(cx-sz,cy-sz,sz*2,sz*2);}
  // score pops: they punch in at the merge, then the points fly up to the counter in the top bar
  for(const p of pops){if(!p.on)continue;p.t+=dt;if(p.t>=p.life){p.on=false;continue;}busy=true;const q=p.t/p.life,sc=q<.15?.6+q/.15*.5:1.1-Math.min(.1,(q-.15));let px=X(p.x),py=Y(p.y)-(reduced?0:18)*Math.min(1,q*2.4),size=p.size*sc;
   if(p.kind===0&&!reduced&&q>.42){const m=(q-.42)/.58,e=m*m;px+=(L.w/2-px)*e;py+=(Math.max(18,L.top-74)-py)*e;size*=1-e*.35;f.globalAlpha=1;}else f.globalAlpha=q>.7?1-(q-.7)/.3:1;
   lettering(p.text,px,py,size,p.color,p.kind?-.06:.03);f.globalAlpha=1;}
  if(flash>0){flash=Math.max(0,flash-dt);f.globalAlpha=Math.min(.5,flash)*.6;f.fillStyle=PAPER;f.fillRect(0,0,L.w,L.h);f.globalAlpha=1;busy=true;}
  // the touch streak meter in the strip under the cabinet: five pips fill toward a shake
  if(!s.over&&L.h-L.floorY>40&&!(word&&!word.mid)){const mx=Math.max(12,L.ox-4),my=L.stripY,left=TD.shakeMax-s.shakesEarned,have=s.shakes>0;if(meterPulse>0){meterPulse=Math.max(0,meterPulse-dt);busy=true;}if(meterMiss>0){meterMiss=Math.max(0,meterMiss-dt);busy=true;}
   const jx=meterMiss>0&&!reduced?Math.sin(clock*60)*meterMiss*8:0,pr=7+(reduced?0:meterPulse*6);
   tag(have?'SHAKE READY':left<=0?'NO SHAKES LEFT':s.streak>=2?`TOUCH STREAK x${s.streak}`:'TOUCH STREAK',mx+jx,my-15,have?TEAL:meterMiss>0?RED:INK);
   if(!have&&left>0){for(let i=0;i<TD.streakNeed;i++){const cx=mx+9+i*21+jx,on=i<s.charge;f.beginPath();f.arc(cx,my+8,on&&i===s.charge-1?pr:7,0,Math.PI*2);f.fillStyle=on?SUN:PAPER;f.fill();f.lineWidth=2.5;f.strokeStyle=INK;f.stroke();}
    tag(`${TD.streakNeed} IN A ROW = 1 SHAKE`,mx+jx,my+30,PAPER,INK,9);}}
  // the word panel: under the cabinet (it used to sit on the pile); only the end of the run uses the middle of the glass
  if(word){word.t+=dt;if(word.t>=word.life)word=null;else{busy=true;const q=word.t/word.life,sc=q<.12?.5+q/.12*.6:1.1-Math.min(.1,q),mid=word.mid||L.h-L.floorY<=40,cy=mid?L.oy+L.ch*.42:L.stripY,cx=mid?L.w/2:Math.min(L.w/2,(L.w-104)/2+6),maxW=mid?L.cw*.96:L.w-116,px=Math.min(mid?L.cw*.13:L.cw*.085,mid?44:30)*sc;
   f.globalAlpha=q>.8?1-(q-.8)/.2:1;f.font=`italic 900 ${px}px "Arial Black",Impact,sans-serif`;const tw=Math.min(maxW,f.measureText(word.text).width+px*1.1),th=px*1.6;
   f.save();f.translate(cx,cy-(word.sub&&!mid?8:0));f.rotate(mid?-.05:-.02);f.fillStyle=INK;f.fillRect(-tw/2+5,-th/2+5,tw,th);f.fillStyle=word.color;f.fillRect(-tw/2,-th/2,tw,th);f.lineWidth=3.5;f.strokeStyle=INK;f.strokeRect(-tw/2,-th/2,tw,th);f.restore();
   lettering(word.text,cx,cy-(word.sub&&!mid?8:0),Math.min(px,(maxW*.94)/Math.max(4,word.text.length)*1.5),PAPER,mid?-.05:-.02);
   if(word.sub){f.save();f.translate(cx+4,cy+(mid?th*.62:th*.5+6));f.rotate(.02);f.font=`800 ${Math.max(11,Math.min(13,px*.42))}px system-ui,Arial,sans-serif`;const sw=f.measureText(word.sub).width+14;f.fillStyle=INK;f.fillRect(-sw/2,-10,sw,20);f.fillStyle=PAPER;f.textAlign='center';f.textBaseline='middle';f.fillText(word.sub,0,1);f.restore();}
   f.globalAlpha=1;}}
  if(blinkT>0){blinkT=Math.max(0,blinkT-dt);busy=true;}
  plain();return busy;
 }
 /** Idle life: one or two resting items close their eyes for a moment. The shell calls it now and then on a settled cabinet and runs
  *  the few frames the blink needs; there is no steady cost. */
 function blink(g:TrophyDrop){const B=g.state.bodies;if(reduced||!B.length)return false;blinkA=B[Math.floor(Math.random()*B.length)].id;blinkB=B.length>3?B[Math.floor(Math.random()*B.length)].id:-1;blinkT=.15;return true;}
 function reset(){for(const p of pops)p.on=false;for(const z of bursts)z.on=false;for(const z of sparks)z.on=false;word=null;shake=0;flash=0;guideX=-1;swing=0;lastAim=-1;meterPulse=0;meterMiss=0;blinkT=0;if(stage!==0||made!==0){stage=0;made=0;paintScene();}}
 function clear(){plain();f.clearRect(0,0,L.w,L.h);}
 return {resize,render,onEvent,reset,clear,toWorld,blink,get layout(){return L;},get guideX(){return guideX;},/** bytes held by the pre-rendered item sprites (the heat probe reads it) */get spriteBytes(){return spriteBytes;},get stage(){return stage;}};
}
