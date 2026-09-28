/**
 * Riso-printed paper plates for the pop-up book (original artwork, drawn in code).
 *
 * Every plate is painted like a two-drum risograph job on cream stock:
 *  - a colour drum (flat inks + halftone screens),
 *  - a navy key drum (linework), printed slightly out of register and multiplied over the colour,
 *  - ink grain, pinholes and density drift,
 *  - a die-cut paper rim with a darker cut edge, so each piece reads as a thin paper cutout.
 * Plates are painted once per reader and uploaded as flat textures; nothing here animates.
 */
export const INK={
 paper:'#f4ecd8',stock:'#efe4ca',edge:'#cdbd98',navy:'#22366b',blue:'#0078bf',sky:'#8fcbe6',sky2:'#bfe2ef',yellow:'#ffd23f',
 pink:'#ff5fa2',green:'#3f9567',grass:'#8fc467',leaf:'#5daa6a',orange:'#f28a3a',red:'#e4574a',white:'#fffaf0',grey:'#bdb8aa',
 stone:'#d9cfb8',wood:'#b9774f',sand:'#ecd29a',night:'#1d2c57',gold:'#f3b733',brown:'#7a4d35',teal:'#2d9c9a',
};
export type Kit={
 w:number;h:number;
 fill:(d:string,color:string,alpha?:number)=>void;
 key:(d:string,width?:number,color?:string)=>void;
 keyFill:(d:string,color?:string)=>void;
 dots:(d:string,color:string,step?:number,amount?:number|((x:number,y:number)=>number))=>void;
 hatch:(d:string,color:string,step?:number,angle?:number,width?:number)=>void;
 circle:(x:number,y:number,r:number,color:string,onKey?:boolean)=>void;
 text:(str:string,x:number,y:number,size:number,color:string,o?:{align?:CanvasTextAlign;weight?:number|string;font?:string;onKey?:boolean;rotate?:number;max?:number})=>void;
 at:(x:number,y:number,scale:number,paint:()=>void,flipX?:boolean)=>void;
};
/** roll: a round piece (ball) that spins about its own centre, not about its base hinge. */
export type PlateSpec={key:string;w:number;h:number;paint:(k:Kit)=>void;rim?:number;tab?:boolean;grain?:number;px?:number;roll?:boolean};
/** A painted plate. The canvas covers the art plus `pad` on every side (world units). */
export type Plate={key:string;canvas:HTMLCanvasElement;w:number;h:number;pad:number};

export const poly=(pts:number[][],close=true)=>pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join(' ')+(close?' Z':'');
export const rect=(x:number,y:number,w:number,h:number)=>poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
export const ell=(x:number,y:number,rx:number,ry:number)=>`M${x-rx} ${y} A${rx} ${ry} 0 1 0 ${x+rx} ${y} A${rx} ${ry} 0 1 0 ${x-rx} ${y} Z`;
/** A wobbly hand-cut outline through the given points (quadratic midpoints). */
export const blob=(pts:number[][])=>{let d='';for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];d+=i?`Q${a[0]} ${a[1]} ${m[0]} ${m[1]} `:`M${m[0]} ${m[1]} `;}const a=pts[0],b=pts[1];return d+`Q${a[0]} ${a[1]} ${(a[0]+b[0])/2} ${(a[1]+b[1])/2} Z`;};
/** Bounding box of an SVG path string (M/L/Q/A/Z subset used by the painters). */
export function bbox(d:string):[number,number,number,number]{const t=d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g)??[];let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity,cmd='M',nums:number[]=[];const add=(x:number,y:number)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};const flush=()=>{if(cmd==='A'){for(let i=0;i+6<nums.length;i+=7){const rx=nums[i],ry=nums[i+1],x=nums[i+5],y=nums[i+6];add(x-rx,y-ry);add(x+rx,y+ry);}}else for(let i=0;i+1<nums.length;i+=2)add(nums[i],nums[i+1]);nums=[];};for(const v of t){if(/[A-Za-z]/.test(v)){flush();cmd=v.toUpperCase();}else nums.push(parseFloat(v));}flush();return x0===Infinity?[0,0,1,1]:[x0,y0,x1,y1];}
const hash=(x:number,y:number,s=0)=>{let n=Math.imul(x+s*131+37,374761393)^Math.imul(y+19,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
const make=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;};
const hex=(c:string)=>{const v=parseInt(c.slice(1),16);return [v>>16&255,v>>8&255,v&255];};

function kit(color:CanvasRenderingContext2D,key:CanvasRenderingContext2D,w:number,h:number,s:number,pad:number):Kit{
 for(const c of [color,key])c.setTransform(s,0,0,s,pad*s,pad*s);
 const stack:DOMMatrix[]=[];
 const apply=(m:DOMMatrix)=>{for(const c of [color,key]){c.setTransform(m);}};
 const current=()=>color.getTransform();
 const K:Kit={w,h,
  fill(d,c,a=1){color.globalAlpha=a;color.fillStyle=c;color.fill(new Path2D(d));color.globalAlpha=1;},
  key(d,width=.016,c=INK.navy){key.strokeStyle=c;key.lineWidth=width;key.lineJoin='round';key.lineCap='round';key.stroke(new Path2D(d));},
  keyFill(d,c=INK.navy){key.fillStyle=c;key.fill(new Path2D(d));},
  dots(d,c,step=.05,amount=.45){
   const p=new Path2D(d),[x0,y0,x1,y1]=bbox(d);color.save();color.clip(p);color.fillStyle=c;
   const cx=(x0+x1)/2,cy=(y0+y1)/2,R=Math.hypot(x1-x0,y1-y0)/2+step;
   for(let gy=-R;gy<R;gy+=step)for(let gx=-R;gx<R;gx+=step){
    const x=cx+(gx-gy)*.7071,y=cy+(gx+gy)*.7071;if(x<x0-step||x>x1+step||y<y0-step||y>y1+step)continue;
    const a=typeof amount==='function'?amount(x,y):amount;if(a<=.02)continue;
    const r=step*.5*Math.sqrt(Math.min(1,a))*(0.9+hash(Math.round(gx/step),Math.round(gy/step),7)*.25);
    color.beginPath();color.arc(x,y,r,0,Math.PI*2);color.fill();
   }
   color.restore();
  },
  hatch(d,c,step=.04,angle=-.6,width=.012){const p=new Path2D(d),[x0,y0,x1,y1]=bbox(d);color.save();color.clip(p);color.strokeStyle=c;color.lineWidth=width;const cx=(x0+x1)/2,cy=(y0+y1)/2,L=Math.hypot(x1-x0,y1-y0)/2+step;const ca=Math.cos(angle),sa=Math.sin(angle);for(let t=-L;t<L;t+=step){color.beginPath();color.moveTo(cx+ca*-L-sa*t,cy+sa*-L+ca*t);color.lineTo(cx+ca*L-sa*t,cy+sa*L+ca*t);color.stroke();}color.restore();},
  circle(x,y,r,c,onKey=false){const t=onKey?key:color;t.fillStyle=c;t.beginPath();t.arc(x,y,r,0,Math.PI*2);t.fill();},
  text(str,x,y,size,c,o={}){const t=o.onKey?key:color;t.save();t.translate(x,y);if(o.rotate)t.rotate(o.rotate);t.fillStyle=c;t.textAlign=o.align??'center';t.textBaseline='alphabetic';const font=(z:number)=>`${o.weight??900} ${z}px ${o.font??'"Arial Black","Helvetica Neue",Arial,sans-serif'}`;t.font=font(size);if(o.max){const m=t.measureText(str).width;if(m>o.max)t.font=font(size*o.max/m);}t.fillText(str,0,0);t.restore();},
  at(x,y,scale,paint,flipX=false){stack.push(current());const m=current().translate(x,y).scale(flipX?-scale:scale,scale);apply(m);paint();apply(stack.pop()!);},
 };
 return K;
}
/** Paint a die-cut riso plate. */
export function paintPlate(spec:PlateSpec):Plate{
 const s=spec.px??150,rim=spec.rim??.035,pad=rim+.03;
 const W=(spec.w+pad*2)*s,H=(spec.h+pad*2)*s;
 const colorC=make(W,H),keyC=make(W,H);
 const cc=colorC.getContext('2d')!,kc=keyC.getContext('2d')!;
 spec.paint(kit(cc,kc,spec.w,spec.h,s,pad));
 const out=make(W,H),o=out.getContext('2d')!;
 // Silhouette = union of both drums.
 const sil=make(W,H),sc=sil.getContext('2d')!;sc.drawImage(colorC,0,0);sc.drawImage(keyC,0,0);sc.globalCompositeOperation='source-in';
 const tint=(color:string)=>{const t=make(W,H),tc=t.getContext('2d')!;tc.drawImage(sil,0,0);tc.globalCompositeOperation='source-in';tc.fillStyle=color;tc.fillRect(0,0,W,H);return t;};
 sc.fillStyle='#000';sc.fillRect(0,0,W,H);
 if(rim>0){
  const edge=tint(INK.edge),stock=tint(INK.paper),R=rim*s;
  for(const [r,img] of [[R+1.3,edge],[R,stock]] as const){for(let i=0;i<16;i++){const a=i/16*Math.PI*2;o.drawImage(img,Math.cos(a)*r,Math.sin(a)*r);}o.drawImage(img,0,0);}
  // The base of a standing piece is the glued hinge: no rim below the baseline.
  const baseline=(pad+spec.h)*s;o.clearRect(0,baseline+1,W,H-baseline);
 }
 o.drawImage(colorC,0,0);
 // Key drum out of register, multiplied like overprinted ink.
 o.globalCompositeOperation='multiply';o.drawImage(keyC,Math.round(s*.009),-Math.round(s*.006));o.globalCompositeOperation='source-over';
 // Ink grain, density drift and pinholes (inside the silhouette only).
 const img=o.getImageData(0,0,out.width,out.height),d=img.data,[pr,pg,pb]=hex(INK.paper),g=spec.grain??1;
 for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++){const i=(y*out.width+x)*4;if(d[i+3]<8)continue;
  const n=hash(x,y),drift=Math.sin(x*.021+y*.013)*.5+Math.sin(y*.047-x*.011)*.5;
  const f=1+((n-.5)*.09+drift*.025)*g;
  if(n>.9965&&g>0){d[i]=pr;d[i+1]=pg;d[i+2]=pb;continue;}
  d[i]=Math.min(255,d[i]*f);d[i+1]=Math.min(255,d[i+1]*f);d[i+2]=Math.min(255,d[i+2]*f);}
 o.putImageData(img,0,0);
 colorC.width=keyC.width=sil.width=1;
 return {key:spec.key,canvas:out,w:spec.w,h:spec.h,pad};
}
/** An unrimmed print on stock (page spreads, cover): paper + ink with the same riso finish. */
export function paintSheet(w:number,h:number,px:number,paint:(k:Kit)=>void,background=INK.paper):HTMLCanvasElement{
 const W=w*px,H=h*px,colorC=make(W,H),keyC=make(W,H),cc=colorC.getContext('2d')!,kc=keyC.getContext('2d')!;
 cc.fillStyle=background;cc.fillRect(0,0,W,H);
 paint(kit(cc,kc,w,h,px,0));
 const o=colorC.getContext('2d')!;o.globalCompositeOperation='multiply';o.drawImage(keyC,Math.round(px*.008),-Math.round(px*.005));o.globalCompositeOperation='source-over';
 const img=o.getImageData(0,0,colorC.width,colorC.height),d=img.data;
 for(let y=0;y<colorC.height;y++)for(let x=0;x<colorC.width;x++){const i=(y*colorC.width+x)*4,n=hash(x,y,3),fiber=hash(x>>2,y,5)>.985?-.05:0;const f=1+(n-.5)*.06+fiber+Math.sin(x*.017+y*.009)*.012;d[i]=Math.min(255,d[i]*f);d[i+1]=Math.min(255,d[i+1]*f);d[i+2]=Math.min(255,d[i+2]*f);}
 o.putImageData(img,0,0);keyC.width=1;return colorC;
}

/* ───────────────────────── Characters (drawn in a 320×512 frame) ───────────────────────── */
export type Shirt='arg'|'ger'|'keeper'|'coach'|'casual'|'bib'|'navy'|'fan';
export type Hair='messi'|'curly'|'short'|'long'|'bun'|'bald'|'cap';
export type PersonOpts={shirt:Shirt;skin?:string;hair?:Hair;hairColor?:string;number?:string;face?:'smile'|'sad'|'open'|'shy'|'grin';/** Paint only the head (neck, head, hair, face): used for face-swap overlay plates. */headOnly?:boolean;legs?:'stand'|'kick'|'run'|'wide';adult?:boolean;beard?:boolean};
export const SKIN=['#f1b88f','#d99a6c','#b27650','#7f5138'];
const SHIRTS:Record<Shirt,{base:string;stripe?:string;shorts:string;sock:string;trim:string}>={
 arg:{base:'#fbf5e6',stripe:'#6fb6e2',shorts:INK.navy,sock:'#fbf5e6',trim:INK.blue},
 ger:{base:'#fbf5e6',shorts:'#2b2b33',sock:'#fbf5e6',trim:'#2b2b33'},
 keeper:{base:'#52a86a',stripe:'#e9e24a',shorts:'#2b3b33',sock:'#52a86a',trim:'#e9e24a'},
 coach:{base:INK.pink,shorts:INK.navy,sock:INK.navy,trim:INK.navy},
 casual:{base:INK.orange,shorts:'#3a5f9a',sock:'#f4ecd8',trim:INK.red},
 bib:{base:INK.yellow,shorts:INK.navy,sock:INK.navy,trim:INK.navy},
 navy:{base:INK.navy,stripe:'#3d5da0',shorts:INK.navy,sock:INK.navy,trim:INK.yellow},
 fan:{base:'#6fb6e2',stripe:'#fbf5e6',shorts:'#3a5f9a',sock:'#f4ecd8',trim:INK.navy},
};
export const PERSON_ASPECT=320/512;
/** Brad (split-pin) joint positions in the 320×512 person frame. */
export const JOINTS={shoulderL:[112,186],shoulderR:[190,186],hipR:[176,320]};
function personBody(k:Kit,o:PersonOpts){
 const sh=SHIRTS[o.shirt],skin=o.skin??SKIN[0],hairC=o.hairColor??'#3b2e3f',adult=!!o.adult,legs=o.legs??'stand';
 k.at(0,0,k.h/512,()=>{
  if(!o.headOnly){
  const long=o.shirt==='coach'||o.shirt==='casual'&&adult;
  // Legs (the kicking leg is a separate brad-jointed plate).
  const legL=legs==='run'?'M120 316 L154 322 L128 392 L96 448 L72 438 L100 386 Z':legs==='wide'?'M116 318 L152 324 L128 400 L104 452 L78 446 L100 396 Z':'M118 318 L154 324 L140 408 L128 456 L98 452 L110 402 Z';
  const legR=legs==='run'?'M164 320 L196 316 L216 380 L246 426 L224 444 L188 392 Z':legs==='wide'?'M166 320 L200 318 L214 396 L232 446 L206 452 L186 400 Z':'M166 320 L200 318 L192 404 L206 452 L178 458 L166 404 Z';
  const legColor=long?sh.shorts:skin;
  k.fill(legL,legColor);k.key(legL,1.6);
  if(legs!=='kick'){k.fill(legR,legColor);k.key(legR,1.6);}
  // Socks + boots.
  const sockL=legs==='run'?'M84 420 L108 430 L96 450 L72 440 Z':'M100 420 L134 424 L128 456 L98 452 Z';
  if(!long){k.fill(sockL,sh.sock);k.key(sockL,1.4);k.dots(sockL,sh.trim,7,.35);}
  const bootL=legs==='run'?'M70 436 L98 448 Q96 468 72 470 Q52 466 50 452 Z':'M96 450 L130 454 L134 474 Q108 482 76 476 Q78 460 96 450 Z';
  k.keyFill(bootL,long?'#3a2d2a':INK.navy);
  if(legs!=='kick'){
   const sockR=legs==='run'?'M222 424 L244 412 L256 432 L232 444 Z':'M176 424 L204 420 L208 452 L180 456 Z';
   if(!long){k.fill(sockR,sh.sock);k.key(sockR,1.4);k.dots(sockR,sh.trim,7,.35);}
   k.keyFill(legs==='run'?'M232 440 L256 428 Q276 440 272 460 L248 464 Z':'M180 452 L206 448 Q224 456 236 468 L234 478 L182 478 Z',long?'#3a2d2a':INK.navy);
  }
  // Shorts.
  const shorts='M104 298 Q153 314 202 300 L206 340 L166 346 L154 324 L144 346 L102 338 Z';
  if(!long){k.fill(shorts,sh.shorts);k.key(shorts,1.6);k.key('M110 306 L108 330 M196 308 L198 332',2.4,'#fbf5e6');}
  // Torso / shirt.
  const torso=adult?'M108 168 Q152 150 196 168 L206 212 L204 306 Q154 322 102 306 L100 214 Z':'M114 172 Q146 156 184 170 L196 208 L200 304 Q156 320 106 304 L108 220 Z';
  k.fill(torso,sh.base);
  if(sh.stripe){for(const x of adult?[118,150,182]:[120,148,176]){k.fill(`M${x} 160 L${x+14} 160 L${x+15} 318 L${x+1} 318 Z`,sh.stripe);}}
  if(o.shirt==='ger')k.fill('M104 232 L204 232 L204 246 L104 246 Z','#2b2b33');
  if(o.shirt==='coach'){k.dots(torso,'#c9407e',7,.28);k.key('M150 176 L150 300',1.6);k.fill('M142 186 Q152 214 162 186','#fbf5e6');}
  k.key(torso,2);
  }
  // Neck, head, ears.
  const neck='M136 142 L136 170 Q150 184 166 170 L166 142 Z';k.fill(neck,skin);
  k.key(adult?'M124 170 Q150 192 178 170':'M126 172 Q149 192 172 172',2.4,sh.trim);
  const head='M112 76 Q114 42 150 40 Q186 42 188 76 L187 116 Q182 150 152 156 Q122 150 114 122 L106 104 Q102 92 112 88 Z';
  k.fill(head,skin);k.fill('M186 92 Q200 86 199 102 Q197 118 186 118 Z',skin);k.fill('M114 92 Q100 86 101 102 Q103 118 114 118 Z',skin);
  k.key(head,1.8);
  // Hair.
  const hair=o.hair??'short';
  if(hair==='messi')k.keyFill('M110 92 Q96 56 122 38 Q150 22 176 38 Q192 40 192 66 L186 88 L174 62 Q156 84 126 78 L118 100 Z',hairC);
  else if(hair==='curly'){for(const [x,y,r] of [[118,62,16],[134,46,17],[153,40,17],[172,46,16],[186,62,14],[112,82,12],[190,82,12]])k.circle(x,y,r,hairC,true);}
  else if(hair==='long'){k.keyFill('M108 100 Q96 44 150 36 Q204 44 192 100 L196 168 L178 170 L184 88 Q150 70 118 88 L122 170 L104 168 Z',hairC);}
  else if(hair==='bun'){k.keyFill('M110 90 Q104 46 150 40 Q196 46 190 90 L182 70 Q150 58 118 70 Z',hairC);k.circle(150,30,17,hairC,true);}
  else if(hair==='cap'){k.fill('M108 76 Q112 34 150 34 Q190 34 192 76 Z',INK.pink);k.fill('M150 70 L226 74 L222 84 L150 82 Z',INK.pink);k.key('M108 76 Q112 34 150 34 Q190 34 192 76 Z',1.8);}
  else if(hair==='short')k.keyFill('M112 84 Q108 44 150 40 Q192 44 188 84 L180 64 Q150 54 120 64 Z',hairC);
  if(o.beard)k.keyFill('M118 116 Q124 156 152 158 Q180 156 186 116 Q176 134 152 136 Q128 134 118 116 Z',hairC);
  // Face.
  const face=o.face??'smile';
  k.circle(136,104,3.8,INK.navy,true);k.circle(166,104,3.8,INK.navy,true);
  if(face==='sad'){k.key('M128 97 L142 91 M160 91 L174 97',2.2);k.key('M138 136 Q152 126 166 136',2.4);}
  else if(face==='shy'){k.key('M130 96 L142 96 M160 96 L172 96',2.2);k.key('M144 134 Q152 138 160 134',2.2);}
  else if(face==='open'){k.key('M130 94 L142 92 M160 92 L172 94',2.2);k.keyFill(ell(152,134,8,9));}
  else if(face==='grin'){k.key('M130 94 L142 92 M160 92 L172 94',2.2);k.fill('M136 126 Q152 146 168 126 Z','#fbf5e6');k.key('M136 126 Q152 146 168 126 Z',2);}
  else{k.key('M130 94 L142 92 M160 92 L172 94',2.2);k.key('M138 128 Q152 142 166 128',2.4);}
  k.key('M151 106 L147 119 L154 121',1.6);
  k.dots(ell(128,120,8,5),INK.pink,4.5,.8);k.dots(ell(176,120,8,5),INK.pink,4.5,.8);
  if(!o.headOnly){
  // Shirt number and crest.
  if(o.number){k.text(o.number,152,272,40,o.shirt==='keeper'?INK.navy:o.shirt==='arg'?INK.navy:INK.white,{font:'Georgia,serif',onKey:false});}
  if(o.shirt==='arg'){k.fill('M120 196 L132 196 L132 210 L126 215 L120 210 Z',INK.gold);k.circle(178,203,4,INK.yellow);}
  }
 });
}
/** A sleeve-and-hand arm on a brad: pivot at (0,0) of its local frame. */
function armPlate(k:Kit,o:{shirt:Shirt;skin?:string;hold?:'suitcase'|'ball'|'glove'|'none';adult?:boolean}){
 const sh=SHIRTS[o.shirt],skin=o.skin??SKIN[0];
 k.at(k.w/2,.012,(k.h-.012)/(o.hold==='suitcase'?205:170),()=>{
  const long=o.shirt==='coach'||o.shirt==='keeper'||o.shirt==='casual'&&o.adult;
  const sleeve=long?'M-17 4 Q0 -6 17 4 L15 118 L-15 118 Z':'M-18 4 Q0 -8 18 4 L17 62 L-17 62 Z';
  const arm='M-12 50 L12 50 L11 130 L-11 130 Z';
  k.fill(arm,o.hold==='glove'?'#e9e24a':skin);k.key(arm,1.5);
  k.fill(sleeve,sh.base);if(sh.stripe&&!long)k.fill('M-4 0 L6 0 L7 62 L-3 62 Z',sh.stripe);if(sh.stripe&&long)k.fill('M-15 70 L15 70 L15 82 L-15 82 Z',sh.stripe);
  k.key(sleeve,1.8);
  const hand='M-13 124 Q-15 146 -2 152 Q14 152 14 136 L12 122 Z';k.fill(hand,o.hold==='glove'?'#e9e24a':skin);k.key(hand,1.5);
  if(o.hold==='glove')k.dots(hand,INK.green,5,.5);
  if(o.hold==='suitcase'){const s='M-26 146 L28 146 L30 196 L-28 196 Z';k.fill(s,INK.red);k.key(s,2);k.key('M-8 146 L-8 138 Q2 132 10 138 L10 146',3);k.key('M-20 150 L-21 192 M22 150 L23 192',3,INK.yellow);k.fill(rect(-10,160,22,12),INK.paper);}
  if(o.hold==='ball'){k.fill(ell(0,164,18,18),INK.white);k.key(ell(0,164,18,18),1.8);k.keyFill('M-5 158 L5 158 L8 167 L0 173 L-8 167 Z');}
  // Gold split-pin head.
  k.circle(0,6,5.5,INK.gold);k.key(ell(0,6,5.5,5.5),1);
 });
}
function legPlate(k:Kit,o:{shirt:Shirt;skin?:string}){
 const sh=SHIRTS[o.shirt],skin=o.skin??SKIN[0];
 k.at(k.w/2,.012,(k.h-.012)/170,()=>{
  const leg='M-17 0 L17 0 L14 116 L-12 116 Z';k.fill(leg,skin);k.key(leg,1.6);
  const shorts='M-22 -4 L22 -4 L20 26 L-20 26 Z';k.fill(shorts,sh.shorts);k.key(shorts,1.6);
  const sock='M-13 100 L14 100 L14 136 L-13 136 Z';k.fill(sock,sh.sock);k.dots(sock,sh.trim,7,.35);k.key(sock,1.4);
  k.keyFill('M-14 132 L16 132 Q40 138 46 152 L44 162 L-16 162 Z',INK.navy);
  k.circle(0,6,5.5,INK.gold);k.key(ell(0,6,5.5,5.5),1);
 });
}
/** Arm/leg plates rotate about this point: (w/2, ARM_PIVOT_Y) from the art's top-left. */
export const ARM_PIVOT_Y=.012;
export const personSpec=(key:string,h:number,o:PersonOpts):PlateSpec=>({key,w:h*PERSON_ASPECT,h,paint:k=>personBody(k,o)});
export const armSpec=(key:string,personH:number,o:{shirt:Shirt;skin?:string;hold?:'suitcase'|'ball'|'glove'|'none';adult?:boolean}):PlateSpec=>({key,w:personH*(o.hold==='suitcase'?64:42)/512,h:personH*(o.hold==='suitcase'?205:170)/512,rim:.02,paint:k=>armPlate(k,o)});
export const legSpec=(key:string,personH:number,o:{shirt:Shirt;skin?:string}):PlateSpec=>({key,w:personH*96/512,h:personH*170/512,rim:.02,paint:k=>legPlate(k,o)});
