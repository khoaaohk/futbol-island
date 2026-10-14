/**
 * Jersey studio painter (Oct 12 2026): draws a JerseyDesign into 2D canvases. No three.js, no DOM at import time.
 *
 *  - paintAtlas(): the 3D shirt's ONE design texture (a CanvasTexture in components/shop/jerseyScene.ts). The atlas holds four
 *    UV regions (front, back, left sleeve, right sleeve) laid out at one scale (ATLAS.k, texture-fraction per metre), so a
 *    pattern drawn in metres lines up across the side seams. lib/shop/jerseyShape.ts maps the mesh UVs to the same regions.
 *  - drawFlatShirt(): the flat shirt thumbnails on the pattern tiles, presets, save slots and the buy card.
 *  - drawCrest(): the original crest (shape, colours, initials, icon), shared by the atlas, the thumbnails and the UI preview.
 *  - v2 (draw your own): the atlas is three layers, base (pattern) → the child's ART (lib/shop/paint/artOps.ts, JERSEY_SURFACE
 *    below) → prints (crest, sponsor, name, numbers, tags), so prints stay crisp on top of any drawing. paintAtlasBase /
 *    paintAtlasPrints let the 3D scene cache the base and prints and re-composite only the dirty rect while a child paints.
 * Patterns are painted in WORLD metres (x = the wearer's left is +x, y up from the hem), so halves, quarters and the sash keep
 * their sides when you spin the shirt; text is painted upright in pixels.
 */
import {type JerseyDesign,type JerseyCrest,type PatternId,type FontId,SPONSORS,hexToRgb,luminance} from './jersey';
import {type ArtSurface,type Art,type Ctx2D,renderArt,makeCanvas} from './paint/artOps';

type Ctx=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
interface Rect{x:number;y:number;w:number;h:number}
/** Atlas layout in texture fractions. k = fraction of the texture per metre of cloth. */
const K=1/1.66;
export const ATLAS={
 k:K,
 torsoHalfW:.36,torsoH:.84,sleeveLen:.66,sleeveCirc:.76,
 front:{x:.015,y:.01,w:.72*K,h:.84*K} as Rect,
 back:{x:.53,y:.01,w:.72*K,h:.84*K} as Rect,
 /** wearer's left sleeve (world +x) */
 sleeveL:{x:.015,y:.53,w:.66*K,h:.76*K} as Rect,
 sleeveR:{x:.53,y:.53,w:.66*K,h:.76*K} as Rect,
};
/** Torso panel UV: x = arc metres from the panel centre (front: +x = world +x; back: +x = world −x), y = metres up the cloth. */
export function torsoUv(face:'front'|'back',x:number,y:number):[number,number]{
 const r=face==='front'?ATLAS.front:ATLAS.back;
 return[r.x+(x+ATLAS.torsoHalfW)*K,1-(r.y+(ATLAS.torsoH-y)*K)];
}
/** Sleeve UV: a = metres back from the sleeve end, c = metres around from the underarm seam. */
export function sleeveUv(side:1|-1,a:number,c:number):[number,number]{
 const r=side===1?ATLAS.sleeveL:ATLAS.sleeveR;
 return[r.x+a*K,1-(r.y+c*K)];
}

// ---- colour helpers ---------------------------------------------------------------------------------------------------------
export function shade(hex:string,amt:number):string{
 const [r,g,b]=hexToRgb(hex),f=(v:number)=>Math.round(amt<0?v*(1+amt):v+(255-v)*amt);
 return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const rgba=(hex:string,a:number)=>{const [r,g,b]=hexToRgb(hex);return `rgba(${r},${g},${b},${a})`;};

// ---- patterns (world metres, y up) ------------------------------------------------------------------------------------------
const X0=-.6,X1=.6,Y0=-.1,Y1=1;
function fill(ctx:Ctx,c:string){ctx.fillStyle=c;ctx.fillRect(X0,Y0,X1-X0,Y1-Y0);}
/** Torso pattern in world coordinates (the caller mirrors the back panel). */
function torsoPattern(ctx:Ctx,d:JerseyDesign,pattern:PatternId){
 const P=d.primary,S=d.secondary,A=d.accent;
 switch(pattern){
  case 'solid':{fill(ctx,P);
   // tone-on-tone jacquard: faint diagonal bands, the detail premium plain shirts have
   ctx.save();ctx.fillStyle=luminance(P)>.4?'rgba(0,0,0,.045)':'rgba(255,255,255,.05)';
   ctx.rotate(-.5);for(let x=-1.2;x<1.2;x+=.05)ctx.fillRect(x,-1.2,.022,2.4);ctx.restore();
   ctx.fillStyle=A;ctx.fillRect(X0,.03,X1-X0,.006);break;}
  case 'stripes':{fill(ctx,P);ctx.fillStyle=S;for(let i=-6;i<=6;i++)ctx.fillRect(i*.13-.0325,Y0,.065,Y1-Y0);break;}
  case 'hoops':{fill(ctx,P);ctx.fillStyle=S;for(let y=.02;y<Y1;y+=.12)ctx.fillRect(X0,y,X1-X0,.06);break;}
  case 'pinstripes':{fill(ctx,P);ctx.fillStyle=S;for(let i=-20;i<=20;i++)ctx.fillRect(i*.034-.0022,Y0,.0044,Y1-Y0);
   ctx.fillStyle=A;for(let i=-5;i<=5;i++)ctx.fillRect(i*.136-.0022,Y0,.0044,Y1-Y0);break;}
  case 'sash':{fill(ctx,P);ctx.save();ctx.translate(.01,.36);ctx.rotate(-Math.atan2(.72,.62));
   ctx.fillStyle=A;ctx.fillRect(-1,-.078,2,.156);ctx.fillStyle=S;ctx.fillRect(-1,-.066,2,.132);ctx.restore();break;}
  case 'halves':{fill(ctx,P);ctx.fillStyle=S;ctx.fillRect(0,Y0,X1,Y1-Y0);break;}
  case 'quarters':{fill(ctx,P);ctx.fillStyle=S;ctx.fillRect(0,.42,X1,Y1-.42);ctx.fillRect(X0,Y0,-X0,.42-Y0);break;}
  case 'chevron':{fill(ctx,P);
   const v=(top:number,th:number,c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-.7,top+.34);ctx.lineTo(0,top);ctx.lineTo(.7,top+.34);ctx.lineTo(.7,top+.34-th);ctx.lineTo(0,top-th);ctx.lineTo(-.7,top+.34-th);ctx.closePath();ctx.fill();};
   v(.5,.085,S);v(.395,.016,A);break;}
  case 'checkers':{const s=.09;for(let i=-8;i<8;i++)for(let j=-2;j<12;j++){ctx.fillStyle=(i+j)&1?S:P;ctx.fillRect(i*s-s/2,j*s,s+.001,s+.001);}break;}
  case 'fade':{fill(ctx,P);ctx.fillStyle=S;ctx.fillRect(X0,Y0,X1-X0,.05-Y0);const g=.017;
   for(let row=0,y=.04;y<.66;y+=g*.866,row++){const r=.0118*Math.pow(Math.max(0,Math.min(1,(.62-y)/.56)),.9);if(r<.0012)continue;
    for(let x=X0+(row&1?g/2:0);x<X1;x+=g){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}}break;}
  case 'waves':{fill(ctx,P);
   const band=(y:number,amp:number,th:number,c:string,ph:number)=>{ctx.fillStyle=c;ctx.beginPath();
    for(let x=X0;x<=X1;x+=.01)ctx.lineTo(x,y+amp*Math.sin(x*11+ph));for(let x=X1;x>=X0;x-=.01)ctx.lineTo(x,y-th+amp*Math.sin(x*11+ph+.5));ctx.closePath();ctx.fill();};
   band(.24,.035,.08,S,0);band(.31,.03,.022,A,.4);band(.47,.03,.045,S,1.1);break;}
 }
}
/** Sleeve fill: a=metres from the cuff end (x), c=metres round from the underarm (y). side 1 = wearer's left. */
function sleevePattern(ctx:Ctx,d:JerseyDesign,side:1|-1){
 const P=d.primary,S=d.secondary,A=d.accent,W=ATLAS.sleeveLen+.05,H=ATLAS.sleeveCirc+.05;
 const fillS=(c:string)=>{ctx.fillStyle=c;ctx.fillRect(-.05,-.05,W+.05,H+.05);};
 switch(d.pattern){
  case 'hoops':fillS(P);ctx.fillStyle=S;for(let a=.03;a<W;a+=.12)ctx.fillRect(a,-.05,.06,H+.05);break;
  case 'pinstripes':fillS(P);ctx.fillStyle=S;for(let c=0;c<H;c+=.034)ctx.fillRect(-.05,c-.0022,W+.05,.0044);break;
  case 'halves':case 'quarters':fillS(side===1?P:S);break;
  case 'checkers':{const s=.09;for(let i=0;i<9;i++)for(let j=0;j<10;j++){ctx.fillStyle=(i+j)&1?S:P;ctx.fillRect(i*s-.02,j*s-.02,s+.001,s+.001);}break;}
  case 'fade':{fillS(P);ctx.fillStyle=S;const g=.017;for(let row=0,a=0;a<.4;a+=g*.866,row++){const r=.0118*Math.pow(Math.max(0,1-a/.32),.9);if(r<.0012)continue;for(let c=(row&1?g/2:0);c<H;c+=g){ctx.beginPath();ctx.arc(a,c,r,0,Math.PI*2);ctx.fill();}}break;}
  case 'waves':fillS(P);ctx.fillStyle=S;ctx.beginPath();for(let c=-.05;c<=H;c+=.01)ctx.lineTo(.05+.012*Math.sin(c*20),c);for(let c=H;c>=-.05;c-=.01)ctx.lineTo(.09+.012*Math.sin(c*20+.6),c);ctx.closePath();ctx.fill();break;
  case 'stripes':fillS(S);break;
  case 'solid':fillS(P);ctx.fillStyle=A;ctx.fillRect(.05,-.05,.006,H+.05);break;
  default:fillS(P);
 }
}

// ---- type ------------------------------------------------------------------------------------------------------------------
/** Canvas font for each FontId, with a horizontal squeeze (kit numbers are condensed). */
export const FONT_FACES:Record<FontId,{css:string;weight:string;squeeze:number}>={
 classic:{css:'"Arial Black","Arial Bold","Helvetica Neue",Arial,Helvetica,sans-serif',weight:'900',squeeze:.8},
 brush:{css:'IslandBrush,"Arial Black",Arial,sans-serif',weight:'400',squeeze:1},
 college:{css:'Rockwell,"Roboto Slab",Georgia,"Times New Roman",serif',weight:'700',squeeze:.88},
 rounded:{css:'ui-rounded,"Arial Rounded MT Bold","Nunito","Trebuchet MS",sans-serif',weight:'800',squeeze:.92},
};
/** Draws upright text centred on (cx,cy) in pixels with cap height `cap` px, squeezed to fit maxW. */
function printText(ctx:Ctx,text:string,cx:number,cy:number,cap:number,font:FontId,fillC:string,outline:string|null,maxW:number,tracking=0){
 if(!text)return;
 const f=FONT_FACES[font],px=cap/.72;
 ctx.save();ctx.font=`${f.weight} ${px}px ${f.css}`;ctx.textBaseline='alphabetic';ctx.textAlign='left';
 const chars=[...text],widths=chars.map(ch=>ctx.measureText(ch).width),track=tracking*px;
 const natural=widths.reduce((a,w)=>a+w,0)+track*(chars.length-1);
 const sx=Math.min(f.squeeze,maxW/Math.max(1,natural));
 ctx.translate(cx,cy+cap/2);ctx.scale(sx,1);
 let x=-natural/2;
 const lw=Math.max(1,px*.11);
 for(let pass=outline?0:1;pass<2;pass++){
  x=-natural/2;
  chars.forEach((ch,i)=>{
   if(pass===0&&outline){ctx.lineJoin='round';ctx.miterLimit=2;ctx.lineWidth=lw;ctx.strokeStyle=outline;ctx.strokeText(ch,x,0);}
   else{ctx.fillStyle=fillC;ctx.fillText(ch,x,0);}
   x+=widths[i]+track;
  });
 }
 ctx.restore();
}

// ---- crest ------------------------------------------------------------------------------------------------------------------
function crestPath(ctx:Ctx,shape:JerseyCrest['shape'],s:number){
 ctx.beginPath();
 if(shape==='roundel'){ctx.arc(0,0,s*.5,0,Math.PI*2);return;}
 if(shape==='diamond'){const r=s*.52,c=s*.06;ctx.moveTo(0,-r);ctx.quadraticCurveTo(c,-r+c,r,0);ctx.quadraticCurveTo(r-c,c,0,r);ctx.quadraticCurveTo(-c,r-c,-r,0);ctx.quadraticCurveTo(-r+c,-c,0,-r);ctx.closePath();return;}
 const w=s*.44,t=-s*.5;
 ctx.moveTo(-w,t+s*.06);ctx.quadraticCurveTo(-w*.5,t+s*.1,0,t);ctx.quadraticCurveTo(w*.5,t+s*.1,w,t+s*.06);
 ctx.lineTo(w,t+s*.46);ctx.quadraticCurveTo(w*.92,t+s*.82,0,t+s);ctx.quadraticCurveTo(-w*.92,t+s*.82,-w,t+s*.46);ctx.closePath();
}
function crestIcon(ctx:Ctx,icon:JerseyCrest['icon'],r:number,ink:string,bg:string){
 ctx.save();ctx.fillStyle=ink;ctx.strokeStyle=ink;ctx.lineCap='round';ctx.lineJoin='round';
 if(icon==='star'){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i&1?r*.42:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
 else if(icon==='ball'){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.fillStyle=bg;
  const pent=(cx:number,cy:number,pr:number,rot:number)=>{ctx.beginPath();for(let i=0;i<5;i++){const a=rot+i*Math.PI*2/5;ctx.lineTo(cx+Math.cos(a)*pr,cy+Math.sin(a)*pr);}ctx.closePath();ctx.fill();};
  pent(0,0,r*.36,-Math.PI/2);for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5+Math.PI/5;pent(Math.cos(a)*r*.86,Math.sin(a)*r*.86,r*.26,a+Math.PI/2);}
  ctx.lineWidth=r*.12;ctx.strokeStyle=ink;ctx.beginPath();ctx.arc(0,0,r*.97,0,Math.PI*2);ctx.stroke();}
 else if(icon==='wave'){ctx.lineWidth=r*.26;for(const dy of[-.32,.32]){ctx.beginPath();for(let x=-1;x<=1.001;x+=.1)ctx.lineTo(x*r,dy*r+Math.sin(x*Math.PI*1.5)*r*.24);ctx.stroke();}}
 else if(icon==='palm'){ctx.lineWidth=r*.2;ctx.beginPath();ctx.moveTo(r*.15,r);ctx.quadraticCurveTo(r*.3,r*.1,-r*.02,-r*.35);ctx.stroke();
  for(const [a,l] of[[-2.7,1],[-2.1,.9],[-1.2,.85],[-.5,1],[.2,.85]] as const){ctx.beginPath();ctx.moveTo(0,-r*.38);
   const ex=Math.cos(a)*r*l,ey=-r*.38+Math.sin(a)*r*l*.75+r*.25;ctx.quadraticCurveTo(Math.cos(a)*r*l*.5,-r*.38+Math.sin(a)*r*.55-r*.12,ex,ey);ctx.lineWidth=r*.17;ctx.stroke();}
  ctx.beginPath();ctx.arc(r*.08,-r*.22,r*.11,0,Math.PI*2);ctx.arc(-r*.12,-r*.2,r*.1,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
/** The original crest centred on (cx,cy), `size` px tall. Embroidery look: a ring, an inner stitch line and a soft edge. */
export function drawCrest(ctx:Ctx,c:JerseyCrest,cx:number,cy:number,size:number){
 const s=size,hasI=c.initials.length>0,hasIcon=c.icon!=='none',shield=c.shape==='shield';
 ctx.save();ctx.translate(cx,cy);
 crestPath(ctx,c.shape,s);ctx.fillStyle=c.ring;ctx.fill();
 ctx.lineWidth=Math.max(1,s*.025);ctx.strokeStyle=shade(c.ring,-.35);ctx.stroke();
 ctx.save();ctx.scale(.8,.8);crestPath(ctx,c.shape,s);ctx.restore();ctx.fillStyle=c.fill;ctx.fill();
 ctx.save();ctx.scale(.72,.72);crestPath(ctx,c.shape,s);ctx.restore();
 ctx.setLineDash([Math.max(1,s*.03),Math.max(1,s*.022)]);ctx.lineWidth=Math.max(.6,s*.012);ctx.strokeStyle=rgba(c.ink,.55);ctx.stroke();ctx.setLineDash([]);
 if(c.shape==='roundel'){ctx.fillStyle=c.ink;for(const a of[Math.PI*.82,Math.PI*.18]){ctx.beginPath();ctx.arc(Math.cos(a)*s*.45,Math.sin(a)*s*.45,s*.028,0,Math.PI*2);ctx.fill();}}
 if(hasIcon){ctx.save();ctx.translate(0,hasI?(shield?-s*.1:-s*.09):(shield?-s*.03:0));crestIcon(ctx,c.icon,hasI?s*.14:s*.22,c.ink,c.fill);ctx.restore();}
 if(hasI){const n=c.initials.length,cap=hasIcon?s*(n>2?.12:.15):s*(n>2?.2:.27);
  printText(ctx,c.initials,0,hasIcon?(shield?s*.16:s*.15):(shield?-s*.03:0),cap,'classic',c.ink,null,s*(c.shape==='diamond'?.4:.54),.06);}
 ctx.restore();
}

// ---- sponsor wordmark ---------------------------------------------------------------------------------------------------------
function paintSponsor(ctx:Ctx,d:JerseyDesign,cx:number,cy:number,w:number,outline:string|null){
 const sp=SPONSORS.find(s=>s.id===d.sponsor);if(!sp||sp.id==='none')return;
 const sub=sp.label.replace(/^[^ ]+ ?(Tacos|Bakery|Radio|Pops|Juice)$/,'$1').split(' ').pop()!.toUpperCase();
 const ink=d.textColor;
 ctx.save();ctx.translate(cx,cy);ctx.transform(1,0,-.16,1,0,0);
 printText(ctx,sp.line,0,-w*.035,w*.13,'classic',ink,outline,w,.04);
 ctx.fillStyle=ink;ctx.fillRect(-w*.42,w*.06,w*.84,Math.max(1,w*.012));
 printText(ctx,sub,0,w*.122,w*.05,'rounded',ink,null,w*.6,.3);
 ctx.restore();
}

// ---- panels ---------------------------------------------------------------------------------------------------------------
type Face='front'|'back';
/** Paints one torso face into `r` (pixels): pattern in world metres, then the prints upright. kpx = pixels per metre. */
function paintTorso(ctx:Ctx,d:JerseyDesign,face:Face,r:Rect,kpx:number,opts:{prints:boolean;tag:boolean;pattern?:boolean}){
 const cx=r.x+r.w/2,base=r.y+r.h;// panel x=0 / y=0 (hem) in px
 ctx.save();ctx.beginPath();ctx.rect(r.x-4,r.y-4,r.w+8,r.h+8);ctx.clip();
 if(opts.pattern!==false){ctx.save();ctx.setTransform(face==='back'?-kpx:kpx,0,0,-kpx,cx,base);torsoPattern(ctx,d,d.pattern);ctx.restore();}
 const at=(x:number,y:number):[number,number]=>[cx+x*kpx,base-y*kpx];
 const outline=d.outline?d.accent===d.textColor?shade(d.textColor,-.5):d.accent:null;
 if(opts.prints){
  if(face==='front'){
   const [qx,qy]=at(.1,.535);drawCrest(ctx,d.crest,qx,qy,.092*kpx);
   if(d.frontNumber&&d.number!=null){const [nx,ny]=at(-.1,.53);printText(ctx,String(d.number),nx,ny,.07*kpx,d.font,d.textColor,outline,.12*kpx);}
   const [sx,sy]=at(0,.4);paintSponsor(ctx,d,sx,sy,.3*kpx,outline);
  }else{
   if(d.name.trim()){const [x,y]=at(0,.6);printText(ctx,d.name.trim().toUpperCase(),x,y,.042*kpx,d.font,d.textColor,outline,.34*kpx,.08);}
   if(d.number!=null){const [x,y]=at(0,.4);printText(ctx,String(d.number),x,y,.22*kpx,d.font,d.textColor,outline,.34*kpx,.02);}
  }
 }
 if(opts.tag){
  if(face==='front'){// a small woven size tag at the hem, like real shirts
   const [x,y]=at(-.22,.055),w=.036*kpx,h=.022*kpx;ctx.fillStyle=d.accent;ctx.fillRect(x-w/2,y-h/2,w,h);
   printText(ctx,'FI',x,y,h*.5,'classic',luminance(d.accent)>.45?'#15171a':'#f7f3ea',null,w*.8,.1);
  }else{// back-neck sign-off
   const [x,y]=at(0,.675);printText(ctx,'FUTBOL ISLAND',x,y,.011*kpx,'rounded',shade(d.primary,luminance(d.primary)>.45?-.45:.6),null,.2*kpx,.35);
  }
 }
 ctx.restore();
}

const pxRect=(r:Rect,size:number):Rect=>({x:r.x*size,y:r.y*size,w:r.w*size,h:r.h*size});
/** Layer 1: the background colour and the patterns of all four panels (no prints). */
export function paintAtlasBase(ctx:Ctx,d:JerseyDesign,size:number){
 const kpx=K*size;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=d.primary;ctx.fillRect(0,0,size,size);
 paintTorso(ctx,d,'front',pxRect(ATLAS.front,size),kpx,{prints:false,tag:false});
 paintTorso(ctx,d,'back',pxRect(ATLAS.back,size),kpx,{prints:false,tag:false});
 for(const side of[1,-1] as const){const r=pxRect(side===1?ATLAS.sleeveL:ATLAS.sleeveR,size);
  ctx.save();ctx.beginPath();ctx.rect(r.x-4,r.y-4,r.w+8,r.h+8);ctx.clip();ctx.setTransform(kpx,0,0,kpx,r.x,r.y);sleevePattern(ctx,d,side);ctx.restore();}
 ctx.restore();
}
/** Layer 3: crest, sponsor, name, numbers and the woven tags, on a TRANSPARENT canvas (the caller clears it). */
export function paintAtlasPrints(ctx:Ctx,d:JerseyDesign,size:number){
 const kpx=K*size;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);
 paintTorso(ctx,d,'front',pxRect(ATLAS.front,size),kpx,{prints:true,tag:true,pattern:false});
 paintTorso(ctx,d,'back',pxRect(ATLAS.back,size),kpx,{prints:true,tag:true,pattern:false});
 ctx.restore();
}
/** Paints the whole atlas for a square canvas of side `size`: base, then the art layer (if given, same size), then prints. */
export function paintAtlas(ctx:Ctx,d:JerseyDesign,size:number,artLayer?:CanvasImageSource|null){
 paintAtlasBase(ctx,d,size);
 if(artLayer){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(artLayer,0,0,size,size);ctx.restore();}
 paintAtlasPrints(ctx,d,size);
}

// ---- the drawing surface (v2) ---------------------------------------------------------------------------------------------------
/** Paint regions of the jersey atlas, in this order. */
export const ART_REGIONS=['front','back','sleeveL','sleeveR'] as const;
export type ArtRegion=typeof ART_REGIONS[number];
const REG:Rect[]=[ATLAS.front,ATLAS.back,ATLAS.sleeveL,ATLAS.sleeveR];
const inR=(r:Rect,u:number,v:number)=>u>=r.x&&u<r.x+r.w&&v>=r.y&&v<r.y+r.h;
/**
 * The jersey as an ArtSurface. Mirror = the wearer's left/right symmetry: on the front and back about the panel's centre line,
 * and the left sleeve ↔ the right sleeve at the same place (the sleeve UVs are built mirror-symmetric in jerseyShape.ts).
 * Sizes are cloth lengths × ATLAS.k: brush 1.2 / 2.5 / 5 cm, stamps 4 / 7 / 11 cm radius, stripe bands 3 / 6 / 10 cm.
 */
export const JERSEY_SURFACE:ArtSurface={
 regionAt(u,v){for(let i=0;i<4;i++)if(inR(REG[i],u,v))return i;return-1;},
 rect:i=>REG[i],
 mirror(u,v,i){
  if(i<2){const r=REG[i];return[2*(r.x+r.w/2)-u,v,i];}
  const a=REG[i],b=REG[i===2?3:2];return[u-a.x+b.x,v-a.y+b.y,i===2?3:2];
 },
 brush:[.012*K,.025*K,.05*K],stamp:[.04*K,.07*K,.11*K],band:[.03*K,.06*K,.1*K],
 bandAxis:i=>i<2?'h':'v',
};
/** Which region a "paint on" lock allows. */
export function regionAllowed(lock:'all'|'front'|'back'|'sleeves',region:number){
 return region>=0&&(lock==='all'||(lock==='front'&&region===0)||(lock==='back'&&region===1)||(lock==='sleeves'&&region>=2));
}
/** The unit rect a flat (template) view shows for a lock. */
export function regionView(lock:'all'|'front'|'back'|'sleeves'):Rect{
 const pick=lock==='front'?[0]:lock==='back'?[1]:lock==='sleeves'?[2,3]:[0,1,2,3];
 const x0=Math.min(...pick.map(i=>REG[i].x)),y0=Math.min(...pick.map(i=>REG[i].y)),x1=Math.max(...pick.map(i=>REG[i].x+REG[i].w)),y1=Math.max(...pick.map(i=>REG[i].y+REG[i].h));
 return{x:x0-.008,y:y0-.008,w:x1-x0+.016,h:y1-y0+.016};
}

/** A small cached art layer (512²) for thumbnails: the flat shirts on slots, Done and the buy card show the drawing too. */
const THUMB_ART=512;
const thumbArt=new Map<string,HTMLCanvasElement|OffscreenCanvas>();
export function artThumbLayer(art:Art):HTMLCanvasElement|OffscreenCanvas|null{
 try{
  const key=JSON.stringify(art.ops);let c=thumbArt.get(key);
  if(c){thumbArt.delete(key);thumbArt.set(key,c);return c;}
  c=makeCanvas(THUMB_ART,THUMB_ART);const x=c.getContext('2d') as Ctx2D|null;if(!x)return null;
  renderArt(x,c,THUMB_ART,JERSEY_SURFACE,art);
  thumbArt.set(key,c);if(thumbArt.size>8)thumbArt.delete(thumbArt.keys().next().value!);
  return c;
 }catch{return null;}
}

// ---- flat shirt (thumbnails) -------------------------------------------------------------------------------------------------
/** Shirt outline in metres (x right = wearer's left on the front view, y up). */
function shirtPath(ctx:Ctx,d:Pick<JerseyDesign,'sleeves'|'collar'>,part:'all'|'body'|'sleeveL'|'sleeveR'){
 const long=d.sleeves==='long';
 const sleeve=(s:1|-1)=>{ctx.moveTo(s*.236,.66);
  if(long){ctx.lineTo(s*.46,.2);ctx.lineTo(s*.5,.05);ctx.lineTo(s*.39,.03);ctx.lineTo(s*.355,.18);ctx.lineTo(s*.25,.42);}
  else{ctx.lineTo(s*.45,.46);ctx.lineTo(s*.36,.37);ctx.lineTo(s*.25,.46);}
  ctx.closePath();};
 ctx.beginPath();
 if(part==='sleeveL'||part==='all')sleeve(1);
 if(part==='sleeveR'||part==='all')sleeve(-1);
 if(part==='body'||part==='all'){
  ctx.moveTo(-.25,0);ctx.quadraticCurveTo(0,-.012,.25,0);ctx.lineTo(.255,.5);ctx.lineTo(.27,.64);ctx.quadraticCurveTo(.2,.69,.1,.72);
  ctx.lineTo(-.1,.72);ctx.quadraticCurveTo(-.2,.69,-.27,.64);ctx.lineTo(-.255,.5);ctx.closePath();
 }
}
function neckline(ctx:Ctx,collar:JerseyDesign['collar'],back:boolean){
 ctx.beginPath();
 if(back){ctx.moveTo(-.1,.72);ctx.quadraticCurveTo(0,.69,.1,.72);return;}
 if(collar==='vneck'||collar==='wrap'){const b=collar==='vneck'?.56:.6;ctx.moveTo(-.1,.72);ctx.lineTo(0,b);ctx.lineTo(.1,.72);return;}
 ctx.moveTo(-.1,.72);ctx.quadraticCurveTo(0,.6,.1,.72);
}
/**
 * A flat front (or back) view of the shirt for tiles and cards. `pattern` overrides the design's pattern (pattern tiles).
 * The canvas is cleared; the shirt is fitted with a small margin.
 */
export function drawFlatShirt(ctx:Ctx,d:JerseyDesign,w:number,h:number,opts:{back?:boolean;prints?:boolean;pattern?:PatternId;art?:boolean}={}){
 const dd={...d,pattern:opts.pattern??d.pattern},back=!!opts.back;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
 const span=dd.sleeves==='long'?1.08:.98,kpx=Math.min(w/span,h/.82)*.98,cx=w/2,base=h/2+.37*kpx;
 const T=(sx=1)=>ctx.setTransform(sx*kpx,0,0,-kpx,cx,base);
 // soft drop shadow
 T();shirtPath(ctx,dd,'all');ctx.save();ctx.shadowColor='rgba(23,53,43,.28)';ctx.shadowBlur=kpx*.035;ctx.shadowOffsetY=kpx*.018;ctx.fillStyle=dd.primary;ctx.fill();ctx.restore();
 // body pattern
 ctx.save();T();shirtPath(ctx,dd,'body');ctx.clip();T(back?-1:1);torsoPattern(ctx,dd,dd.pattern);ctx.restore();
 // sleeves
 for(const s of[1,-1] as const){
  ctx.save();T();shirtPath(ctx,dd,s===1?'sleeveL':'sleeveR');ctx.clip();
  const side=(back?-s:s) as 1|-1;
  if(['hoops','checkers','fade','waves','pinstripes'].includes(dd.pattern)){T(back?-1:1);torsoPattern(ctx,dd,dd.pattern);}
  else{ctx.fillStyle=dd.pattern==='stripes'?dd.secondary:(dd.pattern==='halves'||dd.pattern==='quarters')?(side===1?dd.primary:dd.secondary):dd.primary;ctx.fillRect(-1,-1,2,2);}
  if(dd.cuffs){ctx.strokeStyle=dd.accent;ctx.lineWidth=.03;ctx.beginPath();
   if(dd.sleeves==='long'){ctx.moveTo(s*.5,.05);ctx.lineTo(s*.39,.03);}else{ctx.moveTo(s*.45,.46);ctx.lineTo(s*.36,.37);}ctx.stroke();}
  ctx.restore();
 }
 // the child's drawing (front/back panels), between the pattern and the prints
 const art=(opts.art??opts.prints)&&dd.art&&dd.art.ops.length?artThumbLayer(dd.art):null;
 if(art){
  const r=back?ATLAS.back:ATLAS.front;
  ctx.save();T();shirtPath(ctx,dd,'body');ctx.clip();ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(art as CanvasImageSource,r.x*THUMB_ART,r.y*THUMB_ART,r.w*THUMB_ART,r.h*THUMB_ART,cx-.36*kpx,base-.84*kpx,.72*kpx,.84*kpx);
  ctx.restore();
 }
 // prints
 if(opts.prints){
  ctx.save();T();shirtPath(ctx,dd,'body');ctx.clip();ctx.setTransform(1,0,0,1,0,0);
  paintTorso(ctx,dd,back?'back':'front',{x:cx-.36*kpx,y:base-.84*kpx,w:.72*kpx,h:.84*kpx},kpx,{prints:true,tag:false,pattern:false});
  ctx.restore();
 }
 // shading: a soft fold light down the middle, darker sides and underarms
 ctx.save();T();shirtPath(ctx,dd,'all');ctx.clip();ctx.setTransform(1,0,0,1,0,0);
 const g=ctx.createLinearGradient(cx-.5*kpx,0,cx+.5*kpx,0);g.addColorStop(0,'rgba(10,30,25,.22)');g.addColorStop(.3,'rgba(10,30,25,0)');g.addColorStop(.5,'rgba(255,255,255,.08)');g.addColorStop(.7,'rgba(10,30,25,0)');g.addColorStop(1,'rgba(10,30,25,.22)');
 ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 const v=ctx.createLinearGradient(0,base-.72*kpx,0,base);v.addColorStop(0,'rgba(255,255,255,.06)');v.addColorStop(1,'rgba(10,30,25,.12)');ctx.fillStyle=v;ctx.fillRect(0,0,w,h);
 ctx.restore();
 // collar
 T();
 if(!back&&dd.collar==='polo'){ctx.fillStyle=dd.accent;ctx.fillRect(-.018,.56,.036,.15);ctx.fillStyle='#f7f3ea';for(const y of[.6,.645]){ctx.beginPath();ctx.arc(0,y,.008,0,Math.PI*2);ctx.fill();}}
 neckline(ctx,dd.collar,back);ctx.strokeStyle=dd.accent;ctx.lineWidth=dd.collar==='polo'?.032:.026;ctx.lineJoin='round';ctx.stroke();
 if(dd.collar==='polo'){ctx.fillStyle=dd.accent;ctx.beginPath();
  if(back){ctx.moveTo(-.12,.725);ctx.quadraticCurveTo(0,.7,.12,.725);ctx.lineTo(.13,.69);ctx.quadraticCurveTo(0,.655,-.13,.69);}
  else{for(const s of[1,-1]){ctx.moveTo(s*.1,.73);ctx.lineTo(s*.012,.665);ctx.lineTo(s*.07,.6);ctx.lineTo(s*.15,.69);ctx.closePath();}}
  ctx.fill();ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=.004;ctx.stroke();}
 if(dd.collar==='wrap'&&!back){ctx.beginPath();ctx.moveTo(.1,.72);ctx.lineTo(-.022,.585);ctx.strokeStyle=shade(dd.accent,-.1);ctx.lineWidth=.026;ctx.stroke();}
 // outline
 shirtPath(ctx,dd,'all');ctx.strokeStyle='rgba(23,53,43,.55)';ctx.lineWidth=Math.max(.006,1.2/kpx);ctx.lineJoin='round';ctx.stroke();
 ctx.restore();
}
