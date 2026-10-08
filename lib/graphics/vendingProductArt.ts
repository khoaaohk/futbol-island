import {vendingItem} from '../town/vendingCatalog';
import {BALL_COLORS} from '../town/customization';
import {mediaUrl} from '../media/mediaUrl';
import ballAtlas from './vendingBallAtlas.json';
/** Balls with a baked picture: the real in-game ball (skin + patches) rendered by the shop snapshot renderer and trimmed
 * (scripts/capture-vending-products.cjs writes public/vending/products/ball-<style>.png; re-run it after changing a ball skin, then
 * scripts/pack-vending-atlas.py). Since Oct 7 2026 the pictures ship as ONE lossless WebP atlas (lib/graphics/vendingBallAtlas.json:
 * the file and each ball's [x, y, w, h]), so island boot makes one request instead of one per ball. Keyed by ball, so every
 * machine selling a ball shows the same picture. A ball missing here falls back to drawVendingProduct (no 404). */
type BallAtlas={src:string;w:number;h:number;rects:Record<string,[number,number,number,number]>};
const ATLAS=ballAtlas as unknown as BallAtlas;
export const BAKED_BALL_PICTURES:readonly string[]=Object.keys(ATLAS.rects);
/** One ball's picture: the atlas URL and its cell. Draw it with drawImage(img, x, y, w, h, dx, dy, dw, dh); the cell has a 2 px
 *  edge-repeating gutter, so filtering at its edges matches drawing the old single PNG. */
export type BallSprite={src:string;x:number;y:number;w:number;h:number};
export function vendingBallPicture(id:string):BallSprite|null{
 const style=id.startsWith('ball:')?id.slice(5):'',r=Object.prototype.hasOwnProperty.call(ATLAS.rects,style)?ATLAS.rects[style]:null;
 return r?{src:mediaUrl(ATLAS.src),x:r[0],y:r[1],w:r[2],h:r[3]}:null;
}
/** The atlas image, loaded once per page (shared with lib/graphics/vendingMachines.ts' picture cache by URL through the HTTP cache). */
let atlasImage:Promise<HTMLImageElement>|null=null;
const loadAtlas=()=>atlasImage??=new Promise<HTMLImageElement>((ok,fail)=>{const img=new Image();img.decoding='async';img.onload=()=>ok(img);img.onerror=()=>{atlasImage=null;fail(new Error('vending ball atlas failed'));};img.src=mediaUrl(ATLAS.src);});
const cropped=new Map<string,string>(),cropping=new Map<string,Promise<string|null>>();
/** An <img>-ready URL for a ball's picture (BallPicture: the vending face, its tray, the backpack): the atlas cell copied 1:1 into
 *  a PNG blob, so the element has the same natural size and pixels as the old ball-<style>.png. Sync when already made. */
export function ballPictureUrlNow(id:string):string|null{return cropped.get(id)??null;}
export function ballPictureUrl(id:string):Promise<string|null>{
 const hit=cropped.get(id);if(hit)return Promise.resolve(hit);
 const sprite=vendingBallPicture(id);if(!sprite||typeof document==='undefined')return Promise.resolve(null);
 let job=cropping.get(id);
 if(!job){job=loadAtlas().then(img=>new Promise<string|null>(done=>{const c=document.createElement('canvas');c.width=sprite.w;c.height=sprite.h;
   c.getContext('2d')!.drawImage(img,sprite.x,sprite.y,sprite.w,sprite.h,0,0,sprite.w,sprite.h);
   c.toBlob(blob=>{if(!blob){done(null);return;}const url=URL.createObjectURL(blob);cropped.set(id,url);done(url);},'image/png');}),()=>null);
  cropping.set(id,job);void job.then(url=>{if(!url)cropping.delete(id);});}
 return job;
}
/** Original product miniatures, shared by the world atlas and the interactive face. */
export function drawVendingProduct(c:CanvasRenderingContext2D,id:string,kind:string,x:number,y:number,s:number,shadow=true){
 c.save();c.translate(x,y);
 if(shadow){c.fillStyle='#173a3924';c.beginPath();c.ellipse(0,s*.95,s*.8,s*.14,0,0,Math.PI*2);c.fill();}
 if(kind==='display'){
  const d=vendingItem(id)?.display;if(!d){c.restore();return;}
  if(d.shape!=='book'){c.fillStyle='#233b48';c.fillRect(-s*.6,s*.72,s*1.2,s*.14);}
  if(d.shape==='book'){
   // A hardback standing on the shelf, drawn FLAT front-on (Sep 30 2026: no painted page block; real depth comes from the 3D
   // shelf bay and the CSS-3D face): cloth spine band on the left, framed title, a star badge.
   const L=-s*.62,R=s*.56,T=-s*.98,B=s*.72;
   c.fillStyle=d.color;c.fillRect(L,T,R-L,B-T);c.fillStyle='#0000002e';c.fillRect(L,T,s*.13,B-T);c.fillStyle='#ffffff26';c.fillRect(L+s*.13,T,s*.03,B-T);
   c.strokeStyle='#fff4d5aa';c.lineWidth=Math.max(1,s*.025);c.strokeRect(L+s*.22,T+s*.1,R-L-s*.32,B-T-s*.2);
   const cx=(L+s*.16+R)/2;c.fillStyle='#fff4d5';c.textAlign='center';c.font=`900 ${s*.27}px sans-serif`;c.fillText(d.title.toUpperCase(),cx,-s*.42,R-L-s*.36);c.font=`700 ${s*.12}px sans-serif`;c.fillText('POP-UP STORY',cx,-s*.2,R-L-s*.4);
   c.fillStyle='#fff4d5';c.beginPath();c.arc(cx,s*.24,s*.2,0,Math.PI*2);c.fill();c.fillStyle=d.color;c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.lineTo(cx+Math.cos(a)*s*.08,s*.24+Math.sin(a)*s*.08);}c.closePath();c.fill();
  }else if(d.shape==='frame'){
   c.fillStyle='#9a7844';c.fillRect(-s*.82,-s,s*1.64,s*1.8);c.fillStyle='#fff0cc';c.fillRect(-s*.72,-s*.9,s*1.44,s*1.6);c.fillStyle=d.color;c.fillRect(-s*.6,-s*.78,s*1.2,s*1.12);c.fillStyle='#fff2cb';c.font=`900 ${s*.65}px sans-serif`;c.textAlign='center';c.fillText('10',0,s*.02);c.fillStyle='#28434a';c.font=`800 ${s*.22}px sans-serif`;c.fillText(d.title,0,s*.59,s*1.25);
  }else if(d.shape==='lamp'){
   c.fillStyle='#d6ba75';c.fillRect(-s*.07,-s*.2,s*.14,s*.95);c.fillStyle=d.color;c.beginPath();c.moveTo(-s*.5,-s);c.lineTo(s*.5,-s);c.lineTo(s*.8,s*.02);c.lineTo(-s*.8,s*.02);c.fill();c.fillStyle='#ffe6a1';c.fillRect(-s*.8,0,s*1.6,s*.1);
  }else{
   const gold=c.createLinearGradient(-s*.6,0,s*.6,0);gold.addColorStop(0,'#aa7632');gold.addColorStop(.45,'#ffe2a1');gold.addColorStop(1,'#d3a244');c.fillStyle=gold;c.fillRect(-s*.12,s*.55,s*.24,s*.2);c.beginPath();c.moveTo(-s*.58,-s);c.lineTo(s*.58,-s);c.quadraticCurveTo(s*.5,0,s*.12,s*.12);c.lineTo(s*.12,s*.6);c.lineTo(-s*.12,s*.6);c.lineTo(-s*.12,s*.12);c.quadraticCurveTo(-s*.5,0,-s*.58,-s);c.fill();c.strokeStyle='#dab471';c.lineWidth=s*.1;c.beginPath();c.arc(0,-s*.62,s*.79,0,Math.PI);c.stroke();
  }
 }else if(kind==='ball'){
  const base=BALL_COLORS[id.slice(5) as keyof typeof BALL_COLORS]??'#f7edcc';
  const g=c.createRadialGradient(-s*.35,-s*.4,s*.05,0,0,s);g.addColorStop(0,'#fffaf0');g.addColorStop(.35,base);g.addColorStop(1,'#597f86');c.fillStyle=g;c.beginPath();c.arc(0,0,s,0,Math.PI*2);c.fill();
  c.save();c.clip();c.strokeStyle='#183f47';c.lineWidth=Math.max(1,s*.035);c.fillStyle='#264955';
  const panel=(px:number,py:number,r:number)=>{c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.lineTo(px+Math.cos(a)*r,py+Math.sin(a)*r);}c.closePath();c.fill();c.stroke();};
  panel(-s*.1,-s*.04,s*.34);for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;panel(Math.cos(a)*s*.91,Math.sin(a)*s*.91,s*.24);c.beginPath();c.moveTo(Math.cos(a)*s*.3-s*.1,Math.sin(a)*s*.3);c.lineTo(Math.cos(a)*s*.77,Math.sin(a)*s*.77);c.stroke();}c.restore();
  c.strokeStyle='#fff9e8aa';c.lineWidth=s*.055;c.beginPath();c.arc(-s*.04,-s*.04,s*.87,3.5,4.8);c.stroke();
 }else{
  const five=id==='pack:5',special=!/^pack:[35]$/.test(id),base=special?'#335e76':five?'#715088':'#2e7867';
  c.rotate(-.07);const g=c.createLinearGradient(-s,0,s,0);g.addColorStop(0,base);g.addColorStop(.5,special?'#568dae':five?'#ab77ac':'#59a792');g.addColorStop(1,base);c.fillStyle=g;c.fillRect(-s*.7,-s,s*1.4,s*2);
  c.fillStyle='#ffe7a5';c.fillRect(-s*.7,-s,s*1.4,s*.12);c.fillRect(-s*.7,s*.86,s*1.4,s*.14);
  c.strokeStyle='#fff4d477';c.lineWidth=s*.025;for(let i=0;i<8;i++){const px=-s*.62+i*s*.175;c.beginPath();c.moveTo(px,-s);c.lineTo(px,-s*.9);c.moveTo(px,s*.9);c.lineTo(px,s);c.stroke();}
  c.fillStyle='#fff1c9';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=s*(i%2?.25:.49);c.lineTo(Math.cos(a)*r,Math.sin(a)*r-s*.13);}c.closePath();c.fill();
  c.fillStyle='#fff5d8';c.font=`900 ${Math.round(s*.3)}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(five?'5 CARDS':'3 CARDS',0,s*.58);
 }
 c.restore();
}
