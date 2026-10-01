import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createBuildingGlow} from './buildingGlow';
import {machineStock,VENDING_MACHINES,VENDING_SIZE,type VendingMachine,type VendingMachineId} from '../town/vendingCatalog';
import {drawVendingProduct,vendingBallPicture} from './vendingProductArt';
import {FACE_SIZE,VENDING_BAY,VENDING_FACE_LAYOUT} from './vendingFaceLayout';
import {drawDrink,drawDrinkTile} from './drinkArt';
import {DRINK_MACHINE_IDS,drinksAt,type Drink,type DrinkMachineId} from '../town/drinkMachines';

/**
 * Twelve Japanese-style vending machines (lib/town/vendingCatalog.ts, docs/vending-machines.md; eight until Sep 29 2026).
 *
 * Cost: one merged mesh (one draw call, one shadow draw) per machine, frustum-culled; all share ONE material with one
 * 1024×1024 canvas atlas (colour map only since Sep 30 2026; printed texels are shown unlit by a shader patch, so the lit sign, glass, LED and tray need no light). The front
 * panels are placed from VENDING_FACE_LAYOUT, the same rects the in-use HTML face uses, so far and close-up are one machine. Cabinet colours are vertex colours. One hover glow (buildingGlow 'vending') is shared and moved to whichever machine is
 * targeted. Per frame, idle: eight distance checks and (desktop hover only) eight ray/box tests; glow, prompt and camera work
 * run only while a machine is targeted, fading, or the camera is zooming. In use, the camera frames the face straight on and
 * the HTML machine face (components/VendingMachine.tsx) is pinned onto VENDING_FACE. While zoomed, one temporary high-res face
 * texture covers the machine and its side-by-side neighbour (buildHiRes); it is disposed when the zoom-out ends.
 */
/** Glass tiles: machines 0–7 in two rows above the LED/coin/tray panels (y 8–432), machines 8–11 (Sep 29 2026) in a third row
 * below them (y 660–872), so twelve machines still share the one 1024² atlas and material. */
const ATLAS_W=1024,ATLAS_H=1024;
/** Drawn a little larger than life so the machine reads from the island camera (a 2.1 m cabinet would look child-height). */
export const VENDING_SCALE=1.3;
/** The interactive machine face (machine-local metres before VENDING_SCALE): including the top category panel, just proud of the
 * front. While a machine is in use, components/VendingFace.tsx pins its HTML face exactly onto this rectangle. Its panels are laid
 * out by VENDING_FACE_LAYOUT (lib/graphics/vendingFaceLayout.ts), the same rects the HTML face uses. */
export const VENDING_FACE={x0:-FACE_SIZE.w/2,x1:FACE_SIZE.w/2,y0:.16,y1:.16+FACE_SIZE.h,z:VENDING_SIZE.d/2+VENDING_BAY.proud} as const;
/** How far the machine's frame (glass and tray bezels, side trims, sill) stands in front of the cabinet front: exactly the face
 * plane, so no part of the cabinet stands in front of the face (machine-local metres, before VENDING_SCALE). */
const FRAME=VENDING_BAY.proud;
/** The side trims' inner edge: the glass/tray bezel's outer edge (bezel bars are .025 wide, centred on the glass edge). */
const FRAME_INNER=-(-FACE_SIZE.w/2+VENDING_FACE_LAYOUT.glass.x*FACE_SIZE.w)+.0125;
/** Screen margin around the face in the close-up (fraction of the viewport per side). */
const FACE_MARGIN_X=.03,FACE_MARGIN_Y=.04;
const L=VENDING_FACE_LAYOUT;
/** Atlas rectangles (px). Face panels keep the aspect of their layout rect so nothing is stretched. */
const R={
 // Machines 12–13 (Sep 29 2026: the Coral Cay Konbini) use the free block right of the LED/coin/tray panels (x 512–1024, y 440–651).
 // The two drink machines (Sep 29 2026, lib/town/drinkMachines.ts) use the free strip under the third glass row (y 872–1024):
 // 256×152 each, no atlas growth. Their close-up is the HTML face, so the lower vertical resolution only shows from afar.
 drinkGlass:(k:number)=>[k*256,872,256,152],
 white:[2,2,6,6],glass:(i:number)=>i>=12?[512+(i-12)*256,440,256,211.5]:[i%4*256,i<8?8+Math.floor(i/4)*212:660+Math.floor((i-8)/4)*212,256,211.5],led:[0,440,368,101],coin:[376,440,112,101],tray:[0,550,356,100],sticker:[364,550,148,89],
};
type Ctx=CanvasRenderingContext2D;
function roundRect(c:Ctx,x:number,y:number,w:number,h:number,r:number){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
/**
 * Product pictures (ball-<style>.png, pack.png), one Image per URL for this set of machines, shared by the atlas and the
 * high-res close-up face. `draw` paints with the canvas transform in force at the call, now if the picture has loaded or once it
 * does (then `changed` runs so the texture re-uploads). Nothing runs per frame.
 */
function createPictures(){
 const images=new Map<string,HTMLImageElement>(),waiting=new Map<HTMLImageElement,(()=>void)[]>();let disposed=false;
 return {
  draw(c:Ctx,src:string,paintIt:(img:HTMLImageElement)=>void,changed:()=>void){
   if(typeof Image==='undefined')return;let img=images.get(src);
   if(!img){const next=new Image();img=next;images.set(src,next);waiting.set(next,[]);next.onload=()=>{const list=waiting.get(next)??[];waiting.delete(next);if(!disposed)for(const fn of list)fn();};next.src=src;}
   if(!waiting.has(img)&&img.complete&&img.naturalWidth){paintIt(img);return;}
   const m=c.getTransform?.(),loaded=img;waiting.get(img)?.push(()=>{c.save();if(m)c.setTransform(m);paintIt(loaded);c.restore();changed();});
  },
  dispose(){disposed=true;for(const img of images.values())img.onload=null;waiting.clear();},
 };
}
type Pictures=ReturnType<typeof createPictures>;
/** The 512×423 glass art is stretched onto the taller glass panel; widen round things by this ratio to keep them round. */
const GLASS_ROUND=(FACE_SIZE.h*L.glass.h/423)/(FACE_SIZE.w*L.glass.w/512);
/** One shop machine's glass (page one of its stock) in the 512×423 logical space; the caller scales it into place. */
/** `ballWiden` widens the balls for a known angled view (the close-up), so they read round there. */
function paintShopGlass(c:Ctx,machine:VendingMachine,pics:Pictures,changed:()=>void,ballWiden=1){
 const PAGE_ONE=machineStock(machine.id).flatMap(row=>row.items).slice(0,6).map(item=>({...item,kind:item.kind==='gear'?item.storeItem!.category:item.kind,special:item.row==='special'}));const [X,Y,W,H]=[0,0,512,423],G=L.glass,px=(r:{x:number;y:number;w:number;h:number})=>[X+(r.x-G.x)/G.w*W,Y+(r.y-G.y)/G.h*H,r.w/G.w*W,r.h/G.h*H];
 c.save();c.textAlign='center';c.textBaseline='middle';
 c.fillStyle='#23272e';c.fillRect(X,Y,W,H);const b=8,g=c.createLinearGradient(0,Y,0,Y+H);g.addColorStop(0,'#81a6a5');g.addColorStop(1,'#8aafab');c.fillStyle=g;c.fillRect(X+b,Y+b,W-2*b,H-2*b);
 for(const r of [L.prev,L.next]){const [x,y,w,h]=px(r);c.fillStyle='#23272e';roundRect(c,x,y,w,h,8);c.fill();c.fillStyle='#fff1d3';c.beginPath();const cx=x+w/2,cy=y+h/2,d=r===L.prev?-1:1;c.moveTo(cx+d*9,cy);c.lineTo(cx-d*7,cy-10);c.lineTo(cx-d*7,cy+10);c.fill();}
 {const [x,y,w,h]=px(L.label),gg=c.createLinearGradient(x,0,x+w,0);gg.addColorStop(0,'#ffb800');gg.addColorStop(.5,'#ffe27a');gg.addColorStop(1,'#ffb800');c.fillStyle=gg;roundRect(c,x,y,w,h,8);c.fill();
  const hd=pageOne(machine).header;if(!hd.special){c.fillStyle='#2e333b';roundRect(c,x,y,w,h,8);c.fill();}c.fillStyle=hd.special?'#5a2a00':'#fff1d3';c.font='900 21px system-ui,sans-serif';c.fillText(`${hd.label}  1/${hd.pages}`,x+w/2,y+h/2+1,w-12);}
 for(let row=0;row<2;row++){
  const r=L.slots[row*L.cols],[x,y,w,h]=px({x:r.x,y:r.y+r.h*.53,w:.91,h:r.h*.46});
  // A flat printed rail (Sep 30 2026: no painted bevels or side returns; the real cabinet gives the machine its depth).
  c.fillStyle='#466574';c.fillRect(x,y,w,h);c.fillStyle='#b8cbcc';c.fillRect(x,y,w,3);
 }
 L.slots.forEach((r,i)=>{const [x,y,w,h]=px(r),item=PAGE_ONE[i];if(!item)return;
  const pushY=y+h*L.slotPush.y,pushH=h*L.slotPush.h,nameY=y+h*.59,winH=h*.53-6,shelfY=y+h*.53;
  const cx=x+w/2,size=Math.min((w-10)/1.7,winH/1.86),ballSrc=item.kind==='ball'?vendingBallPicture(item.id):null;
  // Contact shadow anchors the miniature to the continuous shelf below it (a ball picture carries its own).
  if(!ballSrc){const shadow=c.createRadialGradient(cx,y+winH-1,1,cx,y+winH-1,w*.36);shadow.addColorStop(0,'#1d354b55');shadow.addColorStop(1,'#1d354b00');c.save();c.translate(0,(y+winH)*.8);c.scale(1,.2);c.fillStyle=shadow;c.fillRect(x,y-80,w,160);c.restore();}
  // Balls: the baked picture of that ball (ball-<style>.png: the real in-game ball, the same on every machine), resting ON the
  // shelf line (just above it: the shelf's metal lip stands proud of the glass and would hide the bottom). Its framing (scripts/capture-vending-products.cjs): width = diameter + 4, the contact shadow below.
  // A ball without one (none today) draws its miniature instead, so there is never a 404.
  if(ballSrc){const d=size*1.56,base=shelfY-h*.025;pics.draw(c,ballSrc,img=>{const k=d/(img.width-4),dw=img.width*k*GLASS_ROUND*ballWiden,dh=img.height*k;c.drawImage(img,cx-dw/2,base-d-2*k,dw,dh);},changed);}
  else if(item.kind==='pack'){const ps=winH*.4;c.save();c.translate(cx,0);c.scale(GLASS_ROUND,1);drawVendingProduct(c,item.id,item.kind,0,shelfY-ps-2,ps,false);c.restore();}
  else drawVendingProduct(c,item.id,item.kind,cx,y+4+winH-size*.86,size,false);
  c.fillStyle='#fff1d3';c.font='800 19px system-ui,sans-serif';const words=item.label.split(' '),lines:string[]=[''];for(const word of words){const i=lines.length-1,trial=lines[i]?lines[i]+' '+word:word;if((c.measureText(trial)?.width??trial.length*10)>w-8&&lines[i])lines.push(word);else lines[i]=trial;}lines.slice(0,2).forEach((label,j)=>c.fillText(label,cx,nameY+12+j*21,w-8));
  c.fillStyle='#1c1f25';roundRect(c,x+6,pushY,w-12,pushH,pushH/2);c.fill();c.fillStyle='#56606b';c.beginPath();c.arc(x+6+pushH*.7,pushY+pushH/2,pushH*.18,0,Math.PI*2);c.fill();
  c.fillStyle='#f2b62c';c.beginPath();c.arc(cx-12,pushY+pushH/2,pushH*.24,0,Math.PI*2);c.fill();c.fillStyle='#7cf29a';c.font='800 19px ui-monospace,Menlo,monospace';c.fillText(String(item.price),cx+10,pushY+pushH/2+1);});
 c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.moveTo(X+W*.28,Y);c.lineTo(X+W*.4,Y);c.lineTo(X+W*.22,Y+H);c.lineTo(X+W*.1,Y+H);c.fill();c.restore();
}
/** Any machine's glass, in the 512×423 logical space. */
function paintGlass(c:Ctx,machine:VendingMachine,pics:Pictures,changed:()=>void,ballWiden=1){
 if(machine.drinks){c.save();drawDrinkTile(c,drinksAt(machine.id as DrinkMachineId),L,'DRINKS');c.restore();}else paintShopGlass(c,machine,pics,changed,ballWiden);
}
/**
 * Shared hardware (user, Sep 30 2026: "the coins on the left are cut off, the PUSH on the right is different"): the LED, coin
 * panel and pickup tray are ONE design on every machine type, drawn in the panel's true proportions (w × h px) and matching the
 * in-use HTML face (components/VendingFace.module.css .led / .coinSlot / .tray). The coin digits sit below the glass bezel's
 * lower lip, which overhangs the top of the LED/coin strip, so nothing is clipped.
 */
function paintLed(c:Ctx,w:number,h:number,msg:string,sub:string){
 c.save();c.fillStyle='#0a0f0b';roundRect(c,0,0,w,h,h*.06);c.fill();c.fillStyle='#152018';c.fillRect(h*.05,h*.05,w-h*.1,h*.9);
 c.fillStyle='#00000014';for(let y=h*.06;y<h*.94;y+=Math.max(2,h*.03))c.fillRect(h*.05,y,w-h*.1,Math.max(1,h*.01));
 c.textAlign='left';c.textBaseline='middle';c.shadowColor='#7cf29a88';c.shadowBlur=h*.06;c.fillStyle='#7cf29a';c.font=`800 ${h*.25}px ui-monospace,Menlo,monospace`;c.fillText(msg,h*.18,h*.45,w-h*.3);
 c.shadowBlur=0;c.fillStyle='#b6f5c6';c.font=`600 ${h*.17}px system-ui,sans-serif`;c.fillText(sub,h*.18,h*.74,w-h*.3);c.restore();
}
function paintCoin(c:Ctx,w:number,h:number,coins:number|null){
 c.save();c.textAlign='center';c.textBaseline='middle';const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'#b9bfc8');g.addColorStop(.35,'#e1e4e9');g.addColorStop(1,'#c3c8d0');c.fillStyle=g;roundRect(c,0,0,w,h,h*.05);c.fill();
 c.strokeStyle='#6e828d';c.lineWidth=Math.max(1,h*.02);c.strokeRect(h*.01,h*.01,w-h*.02,h*.98);
 const text=coins===null?'- - -':String(Math.max(0,Math.round(coins))).padStart(3,'0');c.font=`900 ${h*.17}px ui-monospace,Menlo,monospace`;
 const tw=Math.min(w*.86,(c.measureText(text)?.width??text.length*h*.1)+h*.16),ty=h*.19,th=h*.24;c.fillStyle='#152018';roundRect(c,(w-tw)/2,ty,tw,th,h*.04);c.fill();c.fillStyle='#7cf29a';c.fillText(text,w/2,ty+th/2+h*.01,tw-h*.08);
 const mw=h*.14,my=h*.49,mh=h*.3;c.fillStyle='#50565f';roundRect(c,w/2-mw/2-h*.035,my-h*.035,mw+h*.07,mh+h*.07,mw);c.fill();c.fillStyle='#1b1d21';roundRect(c,w/2-mw/2,my,mw,mh,mw/2);c.fill();
 c.fillStyle='#2b3440';c.font=`900 ${h*.12}px system-ui,sans-serif`;c.fillText('COINS',w/2,h*.9);c.restore();
}
function paintTray(c:Ctx,w:number,h:number){
 c.save();const e=h*.055,g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#090e14');g.addColorStop(.58,'#090e14');g.addColorStop(.59,'#202b34');g.addColorStop(1,'#11191f');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.strokeStyle='#2b2f36';c.lineWidth=e*2;c.strokeRect(0,0,w,h);c.fillStyle='#89959c';c.fillRect(e,h-e*2,w-e*2,e);
 const flap=c.createLinearGradient(0,e,0,e+h*.25);flap.addColorStop(0,'#56616c');flap.addColorStop(1,'#303b46');c.fillStyle='#0007';c.fillRect(e,e+h*.25,w-e*2,h*.04);c.fillStyle=flap;c.fillRect(e,e,w-e*2,h*.25);c.fillStyle='#85919b';c.fillRect(e,e+h*.25-h*.022,w-e*2,h*.022);
 c.textAlign='right';c.textBaseline='alphabetic';c.font=`900 ${h*.14}px ui-monospace,Menlo,monospace`;(c as Ctx&{letterSpacing?:string}).letterSpacing=`${h*.011}px`;c.fillStyle='#000';c.fillText('PUSH',w-h*.14,h*.74+1);c.fillStyle='#9aa3ad';c.fillText('PUSH',w-h*.14,h*.74);c.restore();
}
/** A panel's true proportions (width ÷ height) on the machine. */
const aspect=(r:{w:number;h:number})=>r.w*FACE_SIZE.w/(r.h*FACE_SIZE.h);
/** Paint `fn(w,h)` in true proportions into an atlas rect (non-uniformly scaled, as the atlas texel is stretched back onto the panel). */
function intoRect(c:Ctx,[x,y,w,h]:number[],ratio:number,fn:(w:number,h:number)=>void){c.save();c.translate(x,y);c.scale(w/(100*ratio),h/100);fn(100*ratio,100);c.restore();}
const GREETING={shop:['いらっしゃいませ!','Pick an item'],drinks:['いらっしゃいませ!','Pick a drink']} as const;
/** Original machine-front art (docs/vending-visuals-HANDOFF.md). Mirrors components/VendingFace.module.css. */
function drawAtlas(machines:VendingMachine[],coins:()=>number|null){
 const canvas=document.createElement('canvas');canvas.width=ATLAS_W;canvas.height=ATLAS_H;const c=canvas.getContext('2d')!;
 c.fillStyle='#1a1d24';c.fillRect(0,0,ATLAS_W,ATLAS_H);c.fillStyle='#ffffff';c.fillRect(0,0,10,10);
 c.textAlign='center';c.textBaseline='middle';
 const pics=createPictures();let map:T.CanvasTexture|null=null;const changed=()=>{if(map)map.needsUpdate=true;};
 // Glass: dark frame, light shelves, shelf header (prev · row label · next) and six product slots with lit push buttons.
 machines.forEach((machine,index)=>{const t=machine.drinks?R.drinkGlass(DRINK_MACHINE_IDS.indexOf(machine.id as DrinkMachineId)):R.glass(index);c.save();c.translate(t[0],t[1]);c.scale(t[2]/512,t[3]/423);paintGlass(c,machine,pics,changed);c.restore();});
 // LED display (the greeting the close-up opens with), coin panel (the player's coins) and pickup tray: shared by every machine.
 intoRect(c,R.led,aspect(L.led),(w,h)=>paintLed(c,w,h,...GREETING.shop));
 let shown=coins();intoRect(c,R.coin,aspect(L.coin),(w,h)=>paintCoin(c,w,h,shown));
 intoRect(c,R.tray,aspect(L.tray),(w,h)=>paintTray(c,w,h));
 // Sticker.
 {const [x,y,w,h]=R.sticker;c.fillStyle='#fffdf6';roundRect(c,x+2,y+2,w-4,h-4,8);c.fill();c.fillStyle='#3a3f47';c.font='800 15px system-ui,sans-serif';c.fillText('Island Shop',x+w/2,y+h*.36);c.fillText('No real money',x+w/2,y+h*.66);}
 map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;map.name='vending-atlas';
 return {map,pics,
  /** Repaint the shared coin display when the balance changed (one atlas re-upload; called on zoom in/out only). */
  refreshCoins(){const next=coins();if(next===shown)return;shown=next;intoRect(c,R.coin,aspect(L.coin),(w,h)=>paintCoin(c,w,h,shown));changed();},
  get coins(){return shown;},
  dispose(){pics.dispose();map!.dispose();}};
}
/**
 * Close-up with REAL depth (user, Sep 30 2026: "the perspective of the shelves and books doesn't match that of the machines"; and
 * earlier "blurry when zooming in"). While the camera zooms onto a machine, that machine and the one standing beside it (the
 * Konbini + drink pairs) get, for the length of the zoom only:
 * - the cabinet's front face and the flat printed glass are cut away (their vertices collapsed, restored afterwards);
 * - a real recessed bay behind the glass in the shared machine material (lit like the cabinet): back wall, side walls, a header
 *   block and two shelf slabs whose tops the products stand on (VENDING_BAY: shared with the CSS-3D HTML face);
 * - one high-res canvas (about the on-screen face size × min(devicePixelRatio, 2), longest side ≤ 2048), painted ONCE: the header,
 *   the two price rails (names, pills, COLD/HOT tags), LED, coin panel, tray, and the page-one products as cut-out sprites standing
 *   on the slabs VENDING_BAY.product behind the glass (balls and drinks turned to face the close-up camera, books and packs on thin
 *   real boxes);
 * - a faint glass pane with a sheen in front.
 * Four draw calls per machine while zoomed (bay, printed panels, products, glass pane), none at rest. The focused machine's
 * products are hidden when the camera arrives: the in-use HTML face (same depths, CSS 3D) then shows the live stock. Everything is
 * disposed when the zoom-out ends, except the painted canvas, which stays in a small face cache (at most 3 machine faces, see `faceFor`)
 * so a repeat zoom paints nothing; at most one close-up is alive; nothing is redrawn per frame.
 */
const HIRES_MAX=2048;
const ROW_SHORT:Record<string,string>={special:'Specials',books:'Books',packs:'Packs',ball:'Balls',scooter:'Scooters',bike:'Bikes',moped:'Mopeds',jetpack:'Flight',costume:'Animals'};
type ShelfItem={id:string;label:string;price:number;kind:string;drink?:Drink};
/** Page one of a machine as the in-use face shows it: its six items and the header (rows on the page, page count). */
function pageOne(machine:VendingMachine):{items:ShelfItem[];header:{label:string;special:boolean;pages:number}}{
 if(machine.drinks){const d=drinksAt(machine.id as DrinkMachineId);return {items:d.slice(0,6).map(x=>({id:x.id,label:x.label,price:x.price,kind:'drink',drink:x})),header:{label:'のみもの DRINKS',special:false,pages:1}};}
 const all=machineStock(machine.id).flatMap(r=>r.items.map(i=>({i,row:r.row}))),first=all.slice(0,6),rows=[...new Set(first.map(x=>x.row))];
 return {items:first.map(({i})=>({id:i.id,label:i.label,price:i.price,kind:i.kind==='gear'?i.storeItem!.category:i.kind})),header:{label:rows.map(r=>ROW_SHORT[r]??r).join(' · ').toUpperCase(),special:rows.includes('special'),pages:Math.ceil(all.length/6)}};
}
type Rect={x:number;y:number;w:number;h:number};
const shelfLine=(r:Rect)=>r.y+r.h*VENDING_BAY.shelf;
/** Header strip: ◀ · row label · ▶ (drinks: one blue のみもの banner), flat. */
function paintHeader(c:Ctx,at:(r:Rect)=>number[],machine:VendingMachine,header:{label:string;special:boolean;pages:number}){
 const [gx,gy,gw]=at(L.glass),[,ly,,lh]=at(L.label);c.save();c.fillStyle='#23272e';c.fillRect(gx,gy,gw,ly+lh-gy+2);c.textAlign='center';c.textBaseline='middle';
 if(machine.drinks){const [x,y]=at(L.prev),[x2,,w2]=at(L.next),bw=x2+w2-x,g=c.createLinearGradient(x,0,x+bw,0);g.addColorStop(0,'#1d5fb8');g.addColorStop(.5,'#3f8ee6');g.addColorStop(1,'#1d5fb8');c.fillStyle=g;roundRect(c,x,y,bw,lh,lh*.16);c.fill();
  c.fillStyle='#ffffff';c.font=`900 ${lh*.42}px system-ui,sans-serif`;c.fillText(header.label,x+bw/2,y+lh/2,bw*.9);c.restore();return;}
 for(const r of [L.prev,L.next]){const [x,y,w,h]=at(r);c.fillStyle='#2e333b';roundRect(c,x,y,w,h,h*.14);c.fill();c.fillStyle='#fff1d3';c.beginPath();const cx=x+w/2,cy=y+h/2,d=r===L.prev?-1:1,a=h*.2;c.moveTo(cx+d*a,cy);c.lineTo(cx-d*a*.8,cy-a);c.lineTo(cx-d*a*.8,cy+a);c.fill();}
 const [x,y,w,h]=at(L.label);if(header.special){const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#ffb800');g.addColorStop(.5,'#ffe27a');g.addColorStop(1,'#ffb800');c.fillStyle=g;}else c.fillStyle='#2e333b';roundRect(c,x,y,w,h,h*.14);c.fill();
 c.fillStyle=header.special?'#5a2a00':'#fff1d3';c.font=`900 ${h*.34}px system-ui,sans-serif`;c.fillText(`${header.label}  1/${header.pages}`,x+w/2,y+h/2+1,w*.92);c.restore();
}
/** A price rail (the flat front of a shelf slab): name, COLD/HOT tag for drinks, and the lit-button pill with the price. */
function paintRail(c:Ctx,at:(r:Rect)=>number[],row:number,items:ShelfItem[]){
 const r0=L.slots[row*L.cols],[,top]=at({...r0,y:shelfLine(r0)}),[,sy,,sh]=at(r0),bottom=sy+sh,[gx,,gw]=at(L.glass);
 c.save();c.fillStyle='#466574';c.fillRect(gx,top,gw,bottom-top);c.fillStyle='#b8cbcc';c.fillRect(gx,top,gw,Math.max(1,sh*.012));c.textAlign='center';c.textBaseline='middle';
 for(let col=0;col<L.cols;col++){const i=row*L.cols+col,item=items[i];if(!item)continue;const [x,y,w,h]=at(L.slots[i]),cx=x+w/2,fs=h*.075;
  c.fillStyle='#fff1d3';c.font=`800 ${fs}px system-ui,sans-serif`;const words=item.label.split(' '),lines:string[]=[''];for(const word of words){const k=lines.length-1,trial=lines[k]?lines[k]+' '+word:word;if((c.measureText(trial)?.width??trial.length*fs*.55)>w*.92&&lines[k])lines.push(word);else lines[k]=trial;}
  const nameTop=y+h*(VENDING_BAY.shelf+.08)+(lines.length<2?fs*.56:0);lines.slice(0,2).forEach((t,j)=>c.fillText(t,cx,nameTop+j*fs*1.12,w*.92));
  if(item.drink){const hot=item.drink.temp==='hot',ty=y+h*.76,th=h*.075;c.fillStyle=hot?'#d8342c':'#2a74d1';roundRect(c,x+w*.14,ty-th/2,w*.72,th,th*.3);c.fill();c.fillStyle='#fff';c.font=`900 ${th*.62}px system-ui,sans-serif`;c.fillText(hot?'あったか～い HOT':'つめた～い COLD',cx,ty+1,w*.68);}
  const py=y+h*L.slotPush.y,ph=h*L.slotPush.h;c.fillStyle='#1c1f25';roundRect(c,x+w*.06,py,w*.88,ph,ph/2);c.fill();c.fillStyle='#56606b';c.beginPath();c.arc(x+w*.06+ph*.7,py+ph/2,ph*.18,0,Math.PI*2);c.fill();
  c.fillStyle='#f2b62c';c.beginPath();c.arc(cx-ph*.45,py+ph/2,ph*.24,0,Math.PI*2);c.fill();c.fillStyle='#7cf29a';c.font=`800 ${ph*.6}px ui-monospace,Menlo,monospace`;c.fillText(String(item.price),cx+ph*.35,py+ph/2+1);}
 c.restore();
}
/** Product art cell: the slot above its shelf line (transparent background; the product stands on the cell's bottom edge). */
const productCell=(i:number):Rect=>{const r=L.slots[i],top=i<L.cols?L.label.y+L.label.h+.006:r.y;return {x:r.x,y:top,w:r.w,h:shelfLine(r)-top};};
/** How big each kind stands in its cell (fractions of the cell height), and its thin real box behind the art, if any. */
const PRODUCT_FIT:Record<string,{h:number;w:number;box?:{depth:number;color:string}}>={
 ball:{h:.62,w:.62},drink:{h:.86,w:.5},display:{h:.8,w:.56,box:{depth:.04,color:'#efe3c6'}},pack:{h:.8,w:.5,box:{depth:.012,color:'#2b4f60'}},
};
const fitOf=(kind:string)=>PRODUCT_FIT[kind]??{h:.72,w:.8};
function paintProduct(c:Ctx,cell:number[],item:ShelfItem,pics:Pictures,changed:()=>void){
 const [x,y,w,h]=cell,f=fitOf(item.kind),ph=h*f.h,pw=Math.min(w*.9,ph*f.w/f.h*(item.kind==='ball'?1:1)),cx=x+w/2,base=y+h;
 if(item.kind==='ball'){const src=vendingBallPicture(item.id);if(src){pics.draw(c,src,img=>{const k=Math.min(pw,ph)/(img.width-4),dw=img.width*k,dh=img.height*k;c.drawImage(img,cx-dw/2,base-dh+dh*.06,dw,dh);},changed);return;}}
 if(item.drink){drawDrink(c,item.drink.art,cx,base-h*.02,ph,undefined,'front');return;}
 // Books and packs: the flat front art (drawVendingProduct centres them on s; a book is 1.7 s tall, a pack 2 s).
 const s=item.kind==='display'?ph/1.7:ph/2,cy=item.kind==='display'?base-s*.72:base-s;drawVendingProduct(c,item.id,item.kind,cx,cy,s,false);
}
/** A face-plane quad in machine-local metres from a face rect, UV-mapped to a canvas rect. */
function faceQuad(r:Rect,z:number,uv:number[],W:number,H:number){
 const F=VENDING_FACE,g=new T.PlaneGeometry(r.w*FACE_SIZE.w,r.h*FACE_SIZE.h).translate(F.x0+(r.x+r.w/2)*FACE_SIZE.w,F.y1-(r.y+r.h/2)*FACE_SIZE.h,z);
 const [ux,uy,uw,uh]=uv,a=g.getAttribute('uv') as T.BufferAttribute;for(let i=0;i<a.count;i++)a.setXY(i,(ux+a.getX(i)*uw)/W,1-(uy+(1-a.getY(i))*uh)/H);const n=g.toNonIndexed();g.dispose();return n;
}
function merge(parts:T.BufferGeometry[]){const m=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());m.computeBoundingSphere();return m;}
/** The recessed bay behind the glass, in the shared machine material (lit like the cabinet): a cabinet-coloured frame around the
 * hole (replacing the cut cabinet front), back wall, side walls, the header block and two shelf slabs, plus `extra` boxes. */
function bayGeometry(m:VendingMachine,extra:T.BufferGeometry[]){
 const F=VENDING_FACE,front=VENDING_SIZE.d/2,D=VENDING_BAY.depth,{w,h}=VENDING_SIZE,X=(u:number)=>F.x0+u*FACE_SIZE.w,Y=(v:number)=>F.y1-v*FACE_SIZE.h,G=L.glass;
 const x0=X(G.x),x1=X(G.x+G.w),yTop=Y(G.y),yBot=Y(G.y+G.h),cx=(x0+x1)/2,bw=x1-x0,cabBottom=.08,cabTop=h-.08,parts:T.BufferGeometry[]=[...extra];
 const lit=(g:T.BufferGeometry,color:string)=>{const u=atlasUV(g,R.white),n=u.toNonIndexed();u.dispose();parts.push(paint(n,color));};
 lit(new T.PlaneGeometry(x0+w/2,cabTop-cabBottom).translate((x0-w/2)/2,(cabTop+cabBottom)/2,front),m.color);
 lit(new T.PlaneGeometry(w/2-x1,cabTop-cabBottom).translate((x1+w/2)/2,(cabTop+cabBottom)/2,front),m.color);
 lit(new T.PlaneGeometry(bw,cabTop-yTop).translate(cx,(cabTop+yTop)/2,front),m.color);
 lit(new T.PlaneGeometry(bw,yBot-cabBottom).translate(cx,(yBot+cabBottom)/2,front),m.color);
 const drinks=Boolean(m.drinks),wall=drinks?'#cfe6f4':'#8aafab';
 lit(new T.PlaneGeometry(bw,yTop-yBot).translate(cx,(yTop+yBot)/2,front-D),wall);
 lit(new T.PlaneGeometry(D,yTop-yBot).rotateY(Math.PI/2).translate(x0,(yTop+yBot)/2,front-D/2),drinks?'#b7d3e6':'#6f9696');
 lit(new T.PlaneGeometry(D,yTop-yBot).rotateY(-Math.PI/2).translate(x1,(yTop+yBot)/2,front-D/2),drinks?'#e0eef7':'#a4c3bb');
 // Header block and shelf slabs reach forward to just behind the printed rails on the face plane (no gap under the rails).
 const zb=front-D+.002,zf=F.z-.004,block=(top:number,bottom:number,color:string)=>lit(new T.BoxGeometry(bw,top-bottom,zf-zb).translate(cx,(top+bottom)/2,(zb+zf)/2),color);
 block(yTop,Y(productCell(0).y),'#23272e');
 block(Y(shelfLine(L.slots[0])),Y(L.slots[L.cols].y),drinks?'#9fbfd3':'#a9c3c1');
 block(Y(shelfLine(L.slots[L.cols])),yBot,drinks?'#9fbfd3':'#a9c3c1');
 return merge(parts);
}
/** Remap a geometry's UVs into an atlas rectangle (or a single texel for plain painted parts). */
function atlasUV(geometry:T.BufferGeometry,[x,y,w,h]:number[]){const uv=geometry.getAttribute('uv') as T.BufferAttribute;for(let i=0;i<uv.count;i++)uv.setXY(i,(x+uv.getX(i)*w)/ATLAS_W,1-(y+(1-uv.getY(i))*h)/ATLAS_H);uv.needsUpdate=true;return geometry;}
function paint(geometry:T.BufferGeometry,color:string){const c=new T.Color(color),n=geometry.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)c.toArray(a,i*3);geometry.setAttribute('color',new T.BufferAttribute(a,3));return geometry;}
function buildMachineGeometry(m:VendingMachine,index:number){
 const {w,d,h}=VENDING_SIZE,front=d/2,parts:T.BufferGeometry[]=[],dark=new T.Color(m.color).multiplyScalar(.62).getStyle();
 const box=(bw:number,bh:number,bd:number,x:number,y:number,z:number,color:string)=>parts.push(paint(atlasUV(new T.BoxGeometry(bw,bh,bd).translate(x,y,z),R.white),color));
 const panel=(pw:number,ph:number,x:number,y:number,rect:number[],z=front+.006)=>parts.push(paint(atlasUV(new T.PlaneGeometry(pw,ph).translate(x,y,z),rect),'#ffffff'));
 /** A face panel placed by its VENDING_FACE_LAYOUT rect (fractions of the face, y from the top). */
 const facePanel=(r:{x:number;y:number;w:number;h:number},rect:number[],z?:number)=>{const F=VENDING_FACE;panel(r.w*FACE_SIZE.w,r.h*FACE_SIZE.h,F.x0+(r.x+r.w/2)*FACE_SIZE.w,F.y1-(r.y+r.h/2)*FACE_SIZE.h,rect,z);};
 box(w,h-.16,d,0,.08+(h-.16)/2,0,m.color);                     // cabinet
 box(w+.04,.07,d+.04,0,h-.045,0,dark);                         // top cap
 // Side trim, slim metal face rails and two stable rubber feet. The trims stand OUTSIDE the face (from the glass bezel's outer
 // edge outward) and their fronts are flush with the face plane (VENDING_FACE.z = FRAME): nothing of the cabinet stands in front of
 // the face or overlaps it, so the in-use HTML face (always drawn over the canvas) registers with the frame from any angle
 // (user, Sep 30 2026: "the glass is on top on the left, but the right side is on the inside").
 const trimIn=FRAME_INNER,trimW=.05;
 box(trimW,h-.34,FRAME+.005,-(trimIn+trimW/2),h/2,front+(FRAME-.005)/2,m.light);
 box(trimW,h-.34,FRAME+.005,trimIn+trimW/2,h/2,front+(FRAME-.005)/2,m.light);
 box(.24,.07,d*.72,-w*.3,.02,0,'#182b2e');box(.24,.07,d*.72,w*.3,.02,0,'#182b2e');
 for(let i=0;i<2;i++)box(.26,.022,.009,w*.28,.26+i*.10,-d/2-.006,dark);
 box(w-.02,.08,d-.02,0,.04,0,'#2c3036');                       // plinth
 box(w+.012,.06,d+.012,0,.12,0,m.light);                       // accent band (under the face)
 // Stepped metal bezel around the printed glass, its front flush with the face plane (FRAME); all details stay in
 // this same merged mesh/material, including the recessed service-panel surrounds.
 const surround=(r:{x:number;y:number;w:number;h:number},depth:number)=>{
  const pw=r.w*FACE_SIZE.w,ph=r.h*FACE_SIZE.h,cx=VENDING_FACE.x0+(r.x+r.w/2)*FACE_SIZE.w,cy=VENDING_FACE.y1-(r.y+r.h/2)*FACE_SIZE.h;
  box(pw+.018,.025,depth,cx,cy+ph/2,front+depth/2,'#c5d1cd');
  box(pw+.018,.032,depth,cx,cy-ph/2,front+depth/2,'#52636b');
  box(.025,ph,depth,cx-pw/2,cy,front+depth/2,'#9bafb1');
  box(.025,ph,depth,cx+pw/2,cy,front+depth/2,'#36434f');
 };
 surround(L.glass,FRAME);surround(L.tray,FRAME);
 // Raised lower sill catches the light below the dark pickup recess.
 box(L.tray.w*FACE_SIZE.w,.028,FRAME,0,VENDING_FACE.y1-(L.tray.y+L.tray.h)*FACE_SIZE.h,front+FRAME/2,'#a7b7b9');
 // Shelf lips project slightly forward of the backing: the close view and
 // distant machine share the same pair of real, continuous metal shelves.
 for(let row=0;row<2;row++){const r=L.slots[row*L.cols];
  box(.91*FACE_SIZE.w,.022,FRAME-.012,0,VENDING_FACE.y1-(r.y+r.h*.55)*FACE_SIZE.h,front+.012+(FRAME-.012)/2,'#b8cbcc');
 }
 const glassPart=parts.length;
 facePanel(L.glass,m.drinks?R.drinkGlass(DRINK_MACHINE_IDS.indexOf(m.id as DrinkMachineId)):R.glass(index),front+.01);                         // glass: header + six product slots
 facePanel(L.led,R.led);facePanel(L.coin,R.coin);facePanel(L.tray,R.tray);
 const flat=parts.map(g=>g.toNonIndexed()),start=(i:number)=>flat.slice(0,i).reduce((n,g)=>n+g.getAttribute('position').count,0);
 const merged=mergeGeometries(flat)!;parts.forEach(g=>g.dispose());flat.forEach(g=>g.dispose());merged.computeBoundingSphere();merged.computeBoundingBox();
 // The close-up cuts these away (collapses them) to open the real bay: the cabinet box's front face (+z, vertices 24–29 of the
 // first part) and the printed glass panel.
 merged.userData.cut=[[24,6],[start(glassPart),6]];return merged;
}

export type VendingUpdate={now:number;dt:number;reduced:boolean;hoverRay:T.Raycaster|null;canEnter:boolean;flying:boolean;flightHeight:number;
 location:{x:number;z:number};groundY:number;camera:T.Camera;width:number;height:number;hidePrompt:boolean;
 prompt:HTMLButtonElement|null;placeUI:(el:HTMLElement,x:number,y:number)=>void;setUIHidden:(el:HTMLElement,hidden:boolean)=>void;onHoverStart:()=>void};
/** `coins`: the player's coin balance for the coin displays (read on build and on each zoom in/out, never per frame). */
export function createVendingMachines(scene:T.Scene,opts:{coins?:()=>number|null;viewport?:()=>{width:number;height:number;dpr:number}}={}){
 const atlas=drawAtlas(VENDING_MACHINES,opts.coins??(()=>null));
 // No emissive map (Sep 30 2026): the printed face texels are shown unlit by the shader patch below and the cabinet texel has no
 // glow, so the old full-size glow copy of the atlas (4 MB + mipmaps) changed nothing on screen.
 const material=new T.MeshStandardMaterial({map:atlas.map,emissive:'#000000',vertexColors:true,roughness:.5,metalness:.08});
 material.name='vending-machine';
 // Printed/lit face panels keep their authored colours as the HTML controls fade in.
 // Only the plain cabinet texel receives scene lighting; no extra mesh or render pass.
 material.toneMapped=false;
 material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`#include <opaque_fragment>
 #ifdef USE_MAP
 if(vMapUv.y < .99 || vMapUv.x > .01) gl_FragColor.rgb = diffuseColor.rgb;
 #endif`);};
 material.customProgramCacheKey=()=>'vending-printed-face-v1';
 const root=new T.Group();root.name='vending-machines';scene.add(root);
 const S=VENDING_SCALE,w=VENDING_SIZE.w*S,d=VENDING_SIZE.d*S,h=VENDING_SIZE.h*S;
 const entries=VENDING_MACHINES.map((m,i)=>{
  const geometry=buildMachineGeometry(m,i),mesh=new T.Mesh(geometry,material);mesh.name=`vending-${m.id}`;mesh.castShadow=true;mesh.receiveShadow=true;
  mesh.position.set(m.x,m.y,m.z);mesh.rotation.y=m.yaw;mesh.scale.setScalar(S);mesh.updateMatrix();mesh.matrixAutoUpdate=false;root.add(mesh);mesh.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(mesh);const fx=Math.sin(m.yaw),fz=Math.cos(m.yaw);
  return {machine:m,mesh,geometry,box,front:{x:m.x+fx*1.5,z:m.z+fz*1.5},dir:new T.Vector3(fx,0,fz)};
 });
 /** Collision footprints (axis-aligned, covering the rotated cabinet). */
 const obstacles=entries.map(({machine:m})=>{const c=Math.abs(Math.cos(m.yaw)),s=Math.abs(Math.sin(m.yaw));return {x:m.x,z:m.z,w:+(c*w+s*d).toFixed(2),d:+(s*w+c*d).toFixed(2)};});
 const glowRoot=new T.Group();glowRoot.name='vending-selection';scene.add(glowRoot);const glow=createBuildingGlow(glowRoot,w,d,h,'vending');
 let target:VendingMachineId|null=null,glowUntil=0,hovered:VendingMachineId|null=null;const hit=new T.Vector3(),projected=new T.Vector3();
 const pick=(ray:T.Raycaster)=>{let best:VendingMachineId|null=null,bestD=Infinity;for(const e of entries)if(ray.ray.intersectBox(e.box,hit)){const dd=hit.distanceToSquared(ray.ray.origin);if(dd<bestD){bestD=dd;best=e.machine.id;}}return best;};
 // Camera zoom toward the glass front.
 let zoom:{id:VendingMachineId;t:number;dir:1|-1;onArrive?:()=>void;onDone?:()=>void;
  /** Camera lift (machine-local metres) that sees over a large occluder; undefined until the zoom's one-off occluder pass ran. */
  lift?:number}|null=null;
 const zoomPos=new T.Vector3(),zoomLook=new T.Vector3(),followLook=new T.Vector3(),mixLook=new T.Vector3(),viewDir=new T.Vector3(-16,-23,-33).normalize();
 const ease=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 let lastCamera:T.PerspectiveCamera|null=null,faceListener:((corners:{x:number;y:number}[])=>void)|null=null;
 const faceCorner=new T.Vector3(),faceSide=new T.Vector3();
 type Entry=(typeof entries)[number];
 // ---- Close-up with real depth (see pageOne/paintRail above): built on focus, dropped when the zoom-out ends. ----
 type CloseUpPart={entry:Entry;meshes:T.Mesh[];products:T.Mesh;targets:{index:number;id:string;u:number;v:number;depth:number}[]};
 let closeUp:{id:VendingMachineId;parts:CloseUpPart[];canvas:HTMLCanvasElement;texture:T.CanvasTexture;printed:T.MeshBasicMaterial;glass:T.MeshBasicMaterial;glassMap:T.CanvasTexture;state:{alive:boolean};face:Face;refresh:()=>void}|null=null;
 let closeUpStats={ms:0,width:0,height:0,bytes:0,drawCalls:0,cached:false,cachedMachines:0};
 /**
  * Close-up face cache (heat audit Sep 30 2026, #7: painting the close-up text took ~200 ms inside the tap at phone 4×). The painted
  * close-up canvas (header, price rails, LED greeting, coin panel, tray and page-one products of the machine and its neighbour) is
  * kept after the zoom-out, keyed by the machines in the order shown + face size + coin balance + page one (header, items, prices),
  * and a repeat zoom just wraps it in a new texture: no painting at all. Any change of stock, page, coins or viewport size is a new key
  * and is painted fresh, by the same painters in the same order onto a canvas of the same size, so the pixels are exactly those the
  * old per-zoom paint produced (per-machine layers composited into place were tried and rejected: gradient dithering and edge
  * coverage follow the device pixel, so pixels moved). Memory: at most FACES_MAX_MACHINES machine faces (a Konbini + drink pair counts 2), least
  * recently used out first, ≈ 3.1 MB per machine at 390×844@3 and ≈ 6 MB at 1280×800@2; a dropped canvas is shrunk to 1×1 at once.
  * A product picture that loads after its face was painted lands in the cached canvas and re-uploads the live texture.
  */
 type Face={key:string;canvas:HTMLCanvasElement;machines:number;alive:boolean;listeners:Set<()=>void>};
 const FACES_MAX_MACHINES=3,faces:Face[]=[];
 const dropFace=(f:Face)=>{f.alive=false;f.listeners.clear();f.canvas.width=f.canvas.height=1;};
 const cachedMachines=()=>faces.reduce((n,f)=>n+f.machines,0);
 const pageKey=(m:VendingMachine)=>{const {items,header}=pageOne(m);return JSON.stringify([header,items.map(i=>[i.id,i.label,i.price,i.kind,i.drink?.temp])]);};
 function faceFor(group:Entry[],fw:number,fh:number):{face:Face;reused:boolean}|null{
  const W=group.length*fw,H=fh,key=`${group.map(g=>g.machine.id).join('+')}|${fw}x${fh}|${atlas.coins}|${group.map(g=>pageKey(g.machine)).join('|')}`,at0=faces.findIndex(f=>f.key===key);
  if(at0>=0){const f=faces[at0];faces.splice(at0,1);faces.push(f);return {face:f,reused:true};}
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');if(!c)return null;
  const face:Face={key,canvas,machines:group.length,alive:true,listeners:new Set()},changed=()=>{if(face.alive)face.listeners.forEach(fn=>fn());};
  group.forEach((g,gi)=>{
   const ox=gi*fw,at=(r:Rect)=>[ox+r.x*fw,r.y*fh,r.w*fw,r.h*fh],{items,header}=pageOne(g.machine);
   paintHeader(c,at,g.machine,header);paintRail(c,at,0,items);paintRail(c,at,1,items);
   const panel=(r:Rect,fn:(w:number,h:number)=>void)=>{const [x,y,w,h]=at(r);c.save();c.translate(x,y);fn(w,h);c.restore();};
   const [msg,sub]=g.machine.drinks?GREETING.drinks:GREETING.shop;panel(L.led,(w,h)=>paintLed(c,w,h,msg,sub));panel(L.coin,(w,h)=>paintCoin(c,w,h,atlas.coins));panel(L.tray,(w,h)=>paintTray(c,w,h));
   items.forEach((item,i)=>paintProduct(c,at(productCell(i)),item,atlas.pics,changed));});
  let n=cachedMachines()+group.length;while(faces.length&&n>FACES_MAX_MACHINES){const f=faces.shift()!;n-=f.machines;dropFace(f);}
  faces.push(face);return {face,reused:false};}
 /** Cut the flat front (cabinet front face + printed glass) of one machine away, or put it back. */
 const cutFront=(e:Entry,cut:boolean)=>{const pos=e.geometry.getAttribute('position') as T.BufferAttribute,arr=pos.array as Float32Array,ud=e.geometry.userData as {cut:[number,number][];saved?:Float32Array[]};
  ud.saved??=ud.cut.map(([s,n])=>arr.slice(s*3,(s+n)*3));
  ud.cut.forEach(([s,n],k)=>{if(cut)for(let i=1;i<n;i++)for(let j=0;j<3;j++)arr[(s+i)*3+j]=arr[s*3+j];else arr.set(ud.saved![k],s*3);});pos.needsUpdate=true;};
 function dropCloseUp(){if(!closeUp)return;const u=closeUp;closeUp=null;u.state.alive=false;u.face.listeners.delete(u.refresh);
  for(const p of u.parts){for(const m of p.meshes){m.removeFromParent();m.geometry.dispose();}cutFront(p.entry,false);}
  u.printed.dispose();u.glass.dispose();u.glassMap.dispose();u.texture.dispose();}// the canvas stays in the face cache
 function buildCloseUp(id:VendingMachineId){
  const view=opts.viewport?.()??(typeof window!=='undefined'?{width:window.innerWidth,height:window.innerHeight,dpr:window.devicePixelRatio||1}:null);
  if(!view||typeof document==='undefined')return;
  const e=entries.find(x=>x.machine.id===id);if(!e)return;
  // The machine and the one standing beside it (same facing, within a cabinet width or two): both fill the close-up.
  const group=[e,...entries.filter(o=>o!==e&&Math.hypot(o.machine.x-e.machine.x,o.machine.z-e.machine.z)<3.2&&Math.abs(o.machine.yaw-e.machine.yaw)<.2&&Math.abs(o.machine.y-e.machine.y)<.5)].slice(0,2);
  const dpr=Math.min(2,view.dpr||1);let fh=Math.min(view.height*.92,view.width*.94*FACE_SIZE.h/FACE_SIZE.w)*dpr,fw=fh*FACE_SIZE.w/FACE_SIZE.h;
  const k=Math.min(1,HIRES_MAX/Math.max(group.length*fw,fh));fw=Math.floor(fw*k);fh=Math.floor(fh*k);const W=group.length*fw,H=fh;if(W<16||H<16)return;
  const t0=typeof performance!=='undefined'?performance.now():0;
  const got=faceFor(group,fw,fh);if(!got)return;const canvas=got.face.canvas;
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;texture.name='vending-closeup';
  const state={alive:true},refresh=()=>{if(state.alive)texture.needsUpdate=true;};got.face.listeners.add(refresh);
  const printed=new T.MeshBasicMaterial({map:texture,toneMapped:false,alphaTest:.5});printed.name='vending-closeup';
  const glassCanvas=document.createElement('canvas');glassCanvas.width=glassCanvas.height=64;{const g=glassCanvas.getContext('2d');if(g){g.fillStyle='rgba(225,250,255,.05)';g.fillRect(0,0,64,64);g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(18,0);g.lineTo(26,0);g.lineTo(12,64);g.lineTo(4,64);g.fill();g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(29,0);g.lineTo(31,0);g.lineTo(17,64);g.lineTo(15,64);g.fill();}}
  const glassMap=new T.CanvasTexture(glassCanvas);glassMap.colorSpace=T.SRGBColorSpace;const glass=new T.MeshBasicMaterial({map:glassMap,transparent:true,depthWrite:false,toneMapped:false});glass.name='vending-closeup-glass';
  // The close-up camera, so round products (balls, bottles) can turn to face it.
  const cam=new T.PerspectiveCamera(40,view.width/view.height,1,500),camPos=new T.Vector3(),camLook=new T.Vector3();faceView(e,cam,camPos,camLook,view.height);
  const front=VENDING_SIZE.d/2,P=VENDING_BAY.product;
  const parts:CloseUpPart[]=group.map((g,gi)=>{
   const ox=gi*fw,at=(r:Rect)=>[ox+r.x*fw,r.y*fh,r.w*fw,r.h*fh],{items}=pageOne(g.machine);
   // Printed panels at the front: header, the two rails (the slab fronts), LED, coin, tray.
   const G=L.glass,headerRect={x:G.x,y:G.y,w:G.w,h:productCell(0).y-G.y},rail=(row:number):Rect=>{const r=L.slots[row*L.cols],top=shelfLine(r),bottom=row===0?L.slots[L.cols].y:G.y+G.h;return {x:G.x,y:top,w:G.w,h:bottom-top};};
   const fz=VENDING_FACE.z-.003,flat=[faceQuad(headerRect,fz,at(headerRect),W,H),faceQuad(rail(0),fz,at(rail(0)),W,H),faceQuad(rail(1),fz,at(rail(1)),W,H),...[L.led,L.coin,L.tray].map(r=>faceQuad(r,fz,at(r),W,H))];
   // Products: cut-out sprites standing on the slabs, P behind the glass; boxes behind books and packs.
   const local=g.mesh.worldToLocal(camPos.clone()),boxes:T.BufferGeometry[]=[],sprites:T.BufferGeometry[]=[],targets:CloseUpPart['targets']=[];
   items.forEach((item,i)=>{const r=productCell(i),F=VENDING_FACE,cw=r.w*FACE_SIZE.w,ch=r.h*FACE_SIZE.h,z=front-P,cy=F.y1-(r.y+r.h/2)*FACE_SIZE.h,[ux,uy,uw,uh]=at(r),
     // The close-up is a three-quarter view, so a product set P behind the glass would drift sideways off its price rail: stand it where
     // the camera's line through the slot centre (on the rail plane) meets the product plane, so it reads centred over its price.
     sx=F.x0+(r.x+r.w/2)*FACE_SIZE.w,cx=Math.abs(local.z-F.z)>.01?local.x+(sx-local.x)*(local.z-z)/(local.z-F.z):sx;
    const q=new T.PlaneGeometry(cw,ch),a=q.getAttribute('uv') as T.BufferAttribute;for(let j=0;j<a.count;j++)a.setXY(j,(ux+a.getX(j)*uw)/W,1-(uy+(1-a.getY(j))*uh)/H);
    if(item.kind==='ball'||item.kind==='drink')q.rotateY(Math.atan2(local.x-cx,local.z-z));q.translate(cx,cy,z);sprites.push(paint(q.toNonIndexed(),'#ffffff'));q.dispose();
    const fit=fitOf(item.kind);if(fit.box){const ph=ch*fit.h*.97,pw=ph*(item.kind==='display'?.694:.7)*.97,b=new T.BoxGeometry(pw,ph,fit.box.depth).translate(cx-(item.kind==='display'?ph/1.7*.03:0),cy-ch/2+ph/2+.002,z-fit.box.depth/2-.001);
     const u=atlasUV(b,R.white),n=u.toNonIndexed();u.dispose();boxes.push(paint(n,fit.box.color));}
    targets.push({index:i,id:item.id,u:r.x+r.w/2,v:shelfLine(L.slots[i]),depth:P});});
   // Products = the sprites (printed, cut-out) + the thin real boxes behind books and packs (lit), one mesh with two groups so
   // they hide together when the in-use face takes over.
   const productGeometry=sprites.length?(boxes.length?(()=>{const a=merge(sprites),b=merge(boxes),m=mergeGeometries([a,b],true)!;a.dispose();b.dispose();return m;})():merge(sprites)):new T.BufferGeometry();
   const bay=bayGeometry(g.machine,[]),printedMesh=new T.Mesh(merge(flat),printed),productMesh=new T.Mesh(productGeometry,boxes.length?[printed,material]:printed),bayMesh=new T.Mesh(bay,material);
   const pane=new T.Mesh(faceQuad(G,VENDING_FACE.z-.0015,[0,0,64,64],64,64),glass);pane.renderOrder=2;
   const meshes=[bayMesh,printedMesh,productMesh,pane];meshes.forEach(m=>{m.name='vending-closeup';g.mesh.add(m);m.updateMatrixWorld(true);m.matrixAutoUpdate=false;});
   bayMesh.receiveShadow=true;cutFront(g,true);
   return {entry:g,meshes,products:productMesh,targets};
  });
  closeUp={id,parts,canvas,texture,printed,glass,glassMap,state,face:got.face,refresh};
  closeUpStats={ms:+((typeof performance!=='undefined'?performance.now():0)-t0).toFixed(1),width:W,height:H,bytes:W*H*4,drawCalls:parts.length*4,cached:got.reused,cachedMachines:cachedMachines()};
 }
 /** A level three-quarter camera fits the face and a sliver of the cabinet side. */
 const faceView=(e:Entry,camera:T.PerspectiveCamera,position:T.Vector3,look:T.Vector3,viewportHeight=typeof window==='undefined'?800:window.innerHeight,lift=0)=>{
  const F=VENDING_FACE,tanV=Math.tan(T.MathUtils.degToRad(camera.fov)/2),aspect=camera.aspect||1;
  // Category navigation now occupies the former sign area; fit the same complete
  // face on every viewport, including short landscape phones.
  const top=F.y1,fw=(F.x1-F.x0)*S,fh=(top-F.y0)*S;
  // A shallow three-quarter view reveals the cabinet's right side. Reserve room
  // for its depth and the nearer front edge instead of clipping the controls.
  const angle=viewportHeight<500?-.14:-.40,cs=Math.cos(angle),sn=Math.sin(angle),sideDepth=Math.abs(sn);
  const side=faceSide.set(e.dir.z,0,-e.dir.x);
  const angledDist=Math.max(fh/2/(1-2*FACE_MARGIN_Y)/tanV,(fw*cs+VENDING_SIZE.d*S*sideDepth)/2/(1-2*FACE_MARGIN_X)/(tanV*aspect))+fw*sideDepth/2;
  look.set(e.machine.x,e.machine.y+(F.y0+top)/2*S,e.machine.z).addScaledVector(e.dir,F.z*S).addScaledVector(side,-.15*S);
  position.copy(look).addScaledVector(e.dir,angledDist*cs).addScaledVector(side,angledDist*sn);position.y+=lift*S;
 };
 const faceNDC=(e:Entry,camera:T.Camera)=>{camera.updateMatrixWorld();const F=VENDING_FACE;
  return [[F.x0,F.y1],[F.x1,F.y1],[F.x1,F.y0],[F.x0,F.y0]].map(([x,y])=>{faceCorner.set(x,y,F.z).applyMatrix4(e.mesh.matrixWorld).project(camera);return {x:faceCorner.x,y:faceCorner.y};});
 };
 /**
  * What stands between the close-up camera and the machine face (user, Sep 30 2026: a wall/ledge hid the lower cabinet while the
  * HTML tray was drawn over it). Rays from the final close-up camera to a grid over the face (corners and edges included) and the plinth;
  * every visible mesh hit short of the face, other than the machines themselves, is returned. One-off (zoom start), no per-frame work.
  */
 const occluderBox=new T.Box3(),occluderSphere=new T.Sphere(),occluderRay=new T.Ray(),occluderPos=new T.Vector3(),occluderLook=new T.Vector3(),occluderPoint=new T.Vector3(),occluderDir=new T.Vector3();
 const triA=new T.Vector3(),triB=new T.Vector3(),triC=new T.Vector3(),triHit=new T.Vector3(),triBox=new T.Box3();
 /** Every visible, opaque mesh triangle (world space) inside the wedge between the close-up camera (lifted up to `maxLift`) and the
  *  face: gathered once per pass, so the ray tests below stay small (no per-mesh BVH needed). Machines, sprites, lines and points
  *  never count. */
 /** Scratch for the occluder pass, shared and reused by every pass so a zoom leaves no garbage (heat audit Sep 30 2026, #5: the old
  *  per-mesh `number[]` triangle lists and per-call cameras cost ~30 ms and fed a long GC at phone 4×): the candidate meshes (visible,
  *  opaque, touching the wedge box), then their triangles inside the box in ONE growable Float64Array (world space, the same precision
  *  as before), with each mesh's [start,end) range and the bounds of its triangles (a ray that misses those bounds skips the mesh). */
 const occluderCam=new T.PerspectiveCamera(),candidates:T.Mesh[]=[];
 const wedge={count:0,length:0,tris:new Float64Array(9*2048),meshes:[] as T.Mesh[],start:[] as number[],end:[] as number[],boxes:[] as T.Box3[]};
 const poseCam=(camera:T.PerspectiveCamera)=>{occluderCam.fov=camera.fov;occluderCam.aspect=camera.aspect;return occluderCam;};
 /** The wedge box: the close-up camera (level and lifted by `maxLift`) and the machine front down to the ground. */
 const fitWedge=(e:Entry,camera:T.PerspectiveCamera,viewportHeight?:number,maxLift=0)=>{
  const cam=poseCam(camera),F=VENDING_FACE;occluderBox.makeEmpty();
  faceView(e,cam,occluderPos,occluderLook,viewportHeight,0);occluderBox.expandByPoint(occluderPos);faceView(e,cam,occluderPos,occluderLook,viewportHeight,maxLift);occluderBox.expandByPoint(occluderPos);
  occluderBox.expandByPoint(occluderPoint.set(F.x0,0,F.z).applyMatrix4(e.mesh.matrixWorld));occluderBox.expandByPoint(occluderPoint.set(F.x1,0,F.z).applyMatrix4(e.mesh.matrixWorld));
  occluderBox.expandByPoint(occluderPoint.set(F.x0,F.y1,F.z).applyMatrix4(e.mesh.matrixWorld));occluderBox.expandByPoint(occluderPoint.set(F.x1,F.y1,F.z).applyMatrix4(e.mesh.matrixWorld));};
 /** Every visible, opaque mesh whose bounds touch the wedge box (scene walk order). Machines, glows, instanced/skinned meshes and
  *  `ignore`d (passable) things never count. Allocation-free. */
 let ignoreNow:(o:T.Object3D)=>boolean=()=>false;
 const walkCandidates=(o:T.Object3D)=>{if(!o.visible||o===root||o===glowRoot)return;const m=o as T.Mesh,pos=m.isMesh?m.geometry?.getAttribute('position'):null;
  if(pos&&!(m as unknown as T.InstancedMesh).isInstancedMesh&&!(m as unknown as T.SkinnedMesh).isSkinnedMesh){const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();
   occluderSphere.copy(g.boundingSphere!).applyMatrix4(m.matrixWorld);if(occluderBox.intersectsSphere(occluderSphere)&&!ignoreNow(o))candidates.push(m);}
  const kids=o.children;for(let i=0;i<kids.length;i++)walkCandidates(kids[i]);};
 const gatherCandidates=(ignore:(o:T.Object3D)=>boolean)=>{candidates.length=0;ignoreNow=ignore;const kids=scene.children;for(let i=0;i<kids.length;i++)walkCandidates(kids[i]);};
 /** The candidates' triangles inside the wedge box, into the shared scratch (see `wedge`). */
 const extractWedge=()=>{wedge.count=0;wedge.length=0;
  for(const m of candidates){const g=m.geometry,pos=g.getAttribute('position') as T.BufferAttribute,idx=g.index,n=(idx?idx.count:pos.count)/3|0,s=wedge.length,box=wedge.boxes[wedge.count]??=new T.Box3();box.makeEmpty();
   for(let t=0;t<n;t++){const a=idx?idx.getX(t*3):t*3,b=idx?idx.getX(t*3+1):t*3+1,c=idx?idx.getX(t*3+2):t*3+2;
    triA.fromBufferAttribute(pos,a).applyMatrix4(m.matrixWorld);triB.fromBufferAttribute(pos,b).applyMatrix4(m.matrixWorld);triC.fromBufferAttribute(pos,c).applyMatrix4(m.matrixWorld);
    if(!triBox.makeEmpty().expandByPoint(triA).expandByPoint(triB).expandByPoint(triC).intersectsBox(occluderBox))continue;
    if(wedge.length+9>wedge.tris.length){const grown=new Float64Array(wedge.tris.length*2);grown.set(wedge.tris);wedge.tris=grown;}
    const k=wedge.length;triA.toArray(wedge.tris,k);triB.toArray(wedge.tris,k+3);triC.toArray(wedge.tris,k+6);wedge.length+=9;box.union(triBox);}
   if(wedge.length>s){const w=wedge.count++;wedge.meshes[w]=m;wedge.start[w]=s;wedge.end[w]=wedge.length;box.expandByScalar(1e-4);}}
  wedge.meshes.length=wedge.count;};// drop stale references to meshes from an earlier, larger pass
 const wedgeTriangles=(e:Entry,camera:T.PerspectiveCamera,viewportHeight?:number,maxLift=0,ignore:(o:T.Object3D)=>boolean=passable)=>{fitWedge(e,camera,viewportHeight,maxLift);gatherCandidates(ignore);extractWedge();};
 /** The meshes (from the last wedgeTriangles) hit by rays from the close-up camera (lifted by `lift`) to a 5×6 grid: the face (corners and edges included) and the plinth below it, short of the machine. */
 const found=new Set<T.Mesh>();
 const blockersOf=(e:Entry,camera:T.PerspectiveCamera,viewportHeight?:number,lift=0,skip?:Set<T.Object3D>)=>{
  const F=VENDING_FACE,tris=wedge.tris;found.clear();faceView(e,poseCam(camera),occluderPos,occluderLook,viewportHeight,lift);
  // Rows: the plinth (cabinet front, just above the ground: the whole machine front, not only the face), then the face bottom to top.
  for(let i=0;i<=4;i++)for(let j=-1;j<=4;j++){
   occluderPoint.set(F.x0+i/4*FACE_SIZE.w,j<0?.14:F.y0+j/4*FACE_SIZE.h,j<0?VENDING_SIZE.d/2:F.z).applyMatrix4(e.mesh.matrixWorld);occluderDir.subVectors(occluderPoint,occluderPos);
   const far=occluderDir.length()-.05;occluderRay.set(occluderPos,occluderDir.normalize());
   for(let w=0;w<wedge.count;w++){const mesh=wedge.meshes[w];if(found.has(mesh)||skip?.has(mesh))continue;
    // Bounds first: a ray that misses the mesh's wedge triangles' bounds, or meets them only beyond the face, hits none of them.
    if(!occluderRay.intersectBox(wedge.boxes[w],triHit)||triHit.distanceTo(occluderPos)>=far)continue;
    for(let k=wedge.start[w];k<wedge.end[w];k+=9){triA.fromArray(tris,k);triB.fromArray(tris,k+3);triC.fromArray(tris,k+6);
     if(occluderRay.intersectTriangle(triA,triB,triC,false,triHit)&&triHit.distanceTo(occluderPos)<far){found.add(mesh);break;}}}}
  return [...found];};
 const occludersOf=(e:Entry,camera:T.PerspectiveCamera,viewportHeight?:number,lift=0)=>{wedgeTriangles(e,camera,viewportHeight,lift);return blockersOf(e,camera,viewportHeight,lift);};
 /** See-through or transient things (effects, glows, the player and their ride, hidden while zoomed anyway) never block the face.
  *  (Sep 30 2026: the player's root is `main-character`, which the old name test missed, so the player's own limbs were "hidden as an
  *  occluder" on every zoom and, moving between zooms, would defeat the occluder cache.) */
 const passable=(o:T.Object3D)=>{const m=(o as T.Mesh).material as T.Material|T.Material[];if((Array.isArray(m)?m:[m]).every(x=>x&&(x.transparent||!x.visible||x.colorWrite===false)))return true;
  for(let p:T.Object3D|null=o;p&&p!==scene;p=p.parent)if(/^(player|character|main-character|ride|ball|vehicle)/.test(p.name))return true;return false;};
 /**
  * Occluder pass cache (heat audit Sep 30 2026, #5): the close-up camera pose depends only on the machine, the camera fov, the
  * viewport aspect and the short-landscape switch, so a pass's result (props hidden, camera lift) is kept per machine + fov + aspect
  * bucket (0.01) + landscape flag, at most OCCLUDER_CACHE_MAX keys. It is reused only while the candidate meshes near the wedge are
  * exactly the same: same meshes in the same order, same geometry and position version, same world matrix; anything added, removed,
  * moved, shown, hidden or made see-through recomputes. A hit costs one scene walk (bounding spheres only), no triangles, no rays.
  */
 type OccluderPass={key:string;meshes:T.Mesh[];sig:Float64Array;hidden:T.Object3D[];lift:number};
 const OCCLUDER_CACHE_MAX=8,occluderCache:OccluderPass[]=[],SIG=18;
 const occluderKey=(e:Entry,camera:T.PerspectiveCamera,viewportHeight?:number)=>`${e.machine.id}|${camera.fov}|${Math.round((camera.aspect||1)*100)}|${(viewportHeight??(typeof window==='undefined'?800:window.innerHeight))<500?1:0}`;
 const signCandidates=(out:Float64Array)=>{candidates.forEach((m,i)=>{const o=i*SIG;out.set(m.matrixWorld.elements,o);out[o+16]=m.geometry.id;out[o+17]=(m.geometry.getAttribute('position') as T.BufferAttribute).version;});return out;};
 const sameCandidates=(p:OccluderPass)=>{if(p.meshes.length!==candidates.length)return false;const s=p.sig;
  for(let i=0;i<candidates.length;i++){const m=candidates[i],o=i*SIG,el=m.matrixWorld.elements;if(m!==p.meshes[i]||s[o+16]!==m.geometry.id||s[o+17]!==(m.geometry.getAttribute('position') as T.BufferAttribute).version)return false;
   for(let k=0;k<16;k++)if(s[o+k]!==el[k])return false;}
  return true;};
 /** A mesh small enough to simply hide while the close-up is up (a bench, a planter, a sign); larger ones are merged world chunks. */
 const compact=(o:T.Object3D)=>{const m=o as T.Mesh;if((m as unknown as T.InstancedMesh).isInstancedMesh||(m as unknown as T.SkinnedMesh).isSkinnedMesh)return false;
  const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();return (g.boundingSphere?.radius??Infinity)*m.matrixWorld.getMaxScaleOnAxis()<3;};
 let hiddenOccluders:T.Object3D[]=[];
 function restoreOccluders(){for(const o of hiddenOccluders)o.visible=true;hiddenOccluders=[];}
 /**
  * One-off occluder pass at zoom start (Sep 30 2026: "nothing sits between the camera and the face"): small meshes in the way are
  * hidden until release; if a merged world chunk is in the way (a bench baked into the Island Square chunk), the close-up camera
  * rises in 0.1 m steps (up to 1.2 m, same look point) until it sees over it. Restored on release. No per-frame work.
  */
 let clearMs=0,clearCached=false;
 function clearView(e:Entry,camera:T.PerspectiveCamera){if(!zoom)return;const t0=typeof performance!=='undefined'?performance.now():0;restoreOccluders();
  const MAX_LIFT=1.2,key=occluderKey(e,camera);fitWedge(e,camera,undefined,MAX_LIFT);gatherCandidates(passable);
  const at=occluderCache.findIndex(p=>p.key===key),cached=at>=0&&sameCandidates(occluderCache[at]);clearCached=cached;
  if(cached){const pass=occluderCache[at];occluderCache.splice(at,1);occluderCache.push(pass);
   for(const o of pass.hidden){o.visible=false;hiddenOccluders.push(o);}zoom.lift=pass.lift;}
  else{extractWedge();const hide=new Set<T.Object3D>();
   for(const o of blockersOf(e,camera))if(compact(o)){o.visible=false;hiddenOccluders.push(o);hide.add(o);}
   let lift=0;for(let best=Infinity,l=0;l<=MAX_LIFT+1e-4;l+=.1){const n=blockersOf(e,camera,undefined,l,hide).length;if(n<best){best=n;lift=l;}if(n===0)break;}
   zoom.lift=+lift.toFixed(2);
   // Remember the pass (the candidates were gathered before anything was hidden, as they will be on the next zoom).
   if(at>=0)occluderCache.splice(at,1);if(occluderCache.length>=OCCLUDER_CACHE_MAX)occluderCache.shift();
   occluderCache.push({key,meshes:candidates.slice(),sig:signCandidates(new Float64Array(candidates.length*SIG)),hidden:[...hide],lift:zoom.lift});}
  clearMs=+((typeof performance!=='undefined'?performance.now():0)-t0).toFixed(1);}
 let targetDistance=Infinity;
 return {
  root,obstacles,entries,pick:(ray:T.Raycaster)=>pick(ray),
  /** Shared machine material and scaled cabinet size, for the kick reaction (lib/graphics/vendingKick.ts). */
  material,size:{w,d,h},
  get target(){return target;},
  get hovered(){return hovered;},
  /** The close-up would look through the player: hide them (and their ride) once the zoom is under way. */
  get hidesPlayer(){return zoom!==null&&zoom.t>.5;},
  get zooming(){return zoom!==null&&zoom.t<1&&zoom.dir===1||zoom!==null&&zoom.dir===-1;},
  get focused(){return zoom?.id??null;},
  /** Metres to the targeted machine at the last update (-1 = hovered, explicit intent): the HUD stack arbiter's distance. */
  get targetDistance(){return targetDistance;},
  /** Hover glow, nearby detection and the "Go" prompt. Returns the targeted machine. */
  update(o:VendingUpdate):VendingMachineId|null{
   const over=o.hoverRay&&o.canEnter?pick(o.hoverRay):null;if(over&&over!==hovered)o.onHoverStart();hovered=over;
   let near:VendingMachineId|null=null,nearD=Infinity;
   if(o.canEnter&&!over)for(const e of entries){const m=e.machine;
    const dist=o.flying?Math.hypot(m.x-o.location.x,m.z-o.location.z):Math.hypot(e.front.x-o.location.x,e.front.z-o.location.z);
    const ok=o.flying?dist<12&&o.flightHeight<m.y+40:dist<3.2&&Math.abs(o.groundY-m.y)<1.2;
    if(ok&&dist<nearD){nearD=dist;near=m.id;}}
   const next=zoom?zoom.id:(over??near);targetDistance=zoom||over?-1:nearD;
   if(next&&next!==target){const e=entries.find(x=>x.machine.id===next)!;glowRoot.position.copy(e.mesh.position);glowRoot.rotation.y=e.machine.yaw;glowRoot.updateMatrixWorld(true);}
   target=next;if(target)glowUntil=o.now+1200;
   if(target||o.now<glowUntil)glow.update(Boolean(target)&&!zoom,o.dt,o.reduced);
   if(o.prompt){let hidden=!target||!!zoom||o.hidePrompt;if(!hidden){const e=entries.find(x=>x.machine.id===target)!;projected.set(e.machine.x,e.machine.y+h+.55,e.machine.z).project(o.camera);hidden=projected.z< -1||projected.z>1;
     if(!hidden)o.placeUI(o.prompt,T.MathUtils.clamp((projected.x+1)*o.width/2,60,o.width-60),T.MathUtils.clamp((1-projected.y)*o.height/2,70,o.height-120));}
    if(!hidden&&o.prompt.dataset.vending!==target)o.prompt.dataset.vending=target!;o.setUIHidden(o.prompt,hidden);}
   return target;
  },
  /** Start the zoom in; `onArrive` runs once the camera reaches the glass (immediately with reduced motion). */
  focus(id:VendingMachineId,onArrive:()=>void){zoom={id,t:zoom?.id===id?zoom.t:0,dir:1,onArrive};atlas.refreshCoins();if(closeUp?.id!==id){dropCloseUp();buildCloseUp(id);}else closeUp.parts.forEach(p=>{p.products.visible=true;});},
  /** Zoom back out to the follow camera. */
  release(onDone?:()=>void){atlas.refreshCoins();restoreOccluders();closeUp?.parts.forEach(p=>{p.products.visible=true;});if(!zoom){dropCloseUp();onDone?.();return;}zoom.dir=-1;zoom.onArrive=undefined;zoom.onDone=onDone;},
  cancel(){zoom=null;restoreOccluders();dropCloseUp();},
  /** Checks: the meshes between the close-up camera for machine `id` (this camera's fov/aspect) and its face, by name path. */
  occluders(id:VendingMachineId,camera:T.PerspectiveCamera,viewportHeight?:number,lift=0){const e=entries.find(x=>x.machine.id===id);if(!e)return [];return occludersOf(e,camera,viewportHeight,lift).map(o=>{const n:string[]=[];for(let p:T.Object3D|null=o;p&&p!==scene;p=p.parent)n.push(p.name||p.type);return n.join('<');});},
  /** The live high-res close-up face (null when none), and the cost of the last one built (ms to paint, texture size and bytes). */
  get hiRes(){return closeUp?{id:closeUp.id,machines:closeUp.parts.map(p=>p.entry.machine.id),...closeUpStats}:null;},
  get lastHiRes(){return closeUpStats;},
  /** Where the close-up's products stand (face fractions u, shelf line v, depth in metres) per machine; empty when not zoomed. */
  closeUpTargets(id:VendingMachineId){return closeUp?.parts.find(p=>p.entry.machine.id===id)?.targets??[];},
  /** Per slot (reading order), how far (face-width fractions) the in-use HTML face must slide a product sideways so, standing
   *  VENDING_BAY.product behind the glass, it reads centred over its price in the angled close-up; [] when not zoomed. */
  productShift(id:VendingMachineId):number[]{const e=entries.find(x=>x.machine.id===id);if(!e||!lastCamera)return [];const F=VENDING_FACE,cam=e.mesh.worldToLocal(lastCamera.getWorldPosition(new T.Vector3())),zP=VENDING_SIZE.d/2-VENDING_BAY.product;
   if(Math.abs(cam.z-F.z)<.01)return [];return L.slots.map(r=>{const sx=F.x0+(r.x+r.w/2)*FACE_SIZE.w;return (cam.x+(sx-cam.x)*(cam.z-zP)/(cam.z-F.z)-sx)/FACE_SIZE.w;});},
  /** Whether a machine shows the real-depth close-up right now (else its flat printed front). */
  hasCloseUp(id:VendingMachineId){return Boolean(closeUp?.parts.some(p=>p.entry.machine.id===id));},
  /** Checks and screenshots: show (or hide) the close-up products again after the camera arrived. */
  showCloseUpProducts(visible:boolean){closeUp?.parts.forEach(p=>{p.products.visible=visible;});},
  /** Call right after the follow camera is placed; blends toward the machine front. Returns true while it owns the camera. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(!zoom)return false;const e=entries.find(x=>x.machine.id===zoom!.id)!;
   zoom.t=reduced?(zoom.dir>0?1:0):T.MathUtils.clamp(zoom.t+zoom.dir*Math.min(dt,.05)/(zoom.dir>0?1:.8),0,1);
   const k=ease(zoom.t);
   if(zoom.dir>0&&zoom.lift===undefined)clearView(e,camera);
   faceView(e,camera,zoomPos,zoomLook,undefined,zoom.lift??0);
   followLook.copy(camera.position).addScaledVector(viewDir,40);
   camera.position.lerp(zoomPos,k);if(e.machine.id==='market')camera.position.y+=Math.sin(Math.PI*k)*7;mixLook.lerpVectors(followLook,zoomLook,k);camera.lookAt(mixLook);lastCamera=camera;
   // Arrived: the in-use HTML face (same depths, CSS 3D) takes over the focused machine's live stock; hide its close-up products.
   if(zoom.dir>0&&zoom.t>=1&&zoom.onArrive){const fn=zoom.onArrive;zoom.onArrive=undefined;closeUp?.parts.forEach(p=>{if(p.entry.machine.id===zoom!.id)p.products.visible=false;});fn();}
   // Arrived: tell the machine-face layer where the face sits on screen (only on awake frames; the paused island sleeps).
   if(zoom&&zoom.dir>0&&zoom.t>=1&&faceListener)faceListener(faceNDC(e,camera));
   if(zoom.dir<0&&zoom.t<=0){const fn=zoom.onDone;zoom=null;dropCloseUp();fn?.();}
   return true;
  },
  /** Straight-on camera target that fits the machine face (VENDING_FACE) on this screen; used by the zoom and tests. */
  faceView(id:VendingMachineId,camera:T.PerspectiveCamera,position:T.Vector3,look:T.Vector3,viewportHeight?:number){const e=entries.find(x=>x.machine.id===id);if(e)faceView(e,camera,position,look,viewportHeight);},
  /** The machine face's four corners (top-left, top-right, bottom-right, bottom-left) in normalized device coordinates, from
   * the last zoom camera, or null when not zoomed. */
  /** Checks: the live close-up's camera lift, the meshes hidden for it, and what (if anything) still stands between the camera and
   *  the face (should be none); null when not zoomed. Recomputed on call, never per frame. */
  closeUpView(){if(!zoom||!lastCamera)return null;const e=entries.find(x=>x.machine.id===zoom!.id)!;const name=(o:T.Object3D)=>o.name||o.type;
   return {lift:zoom.lift??0,ms:clearMs,cached:clearCached,hidden:hiddenOccluders.map(name),blockers:occludersOf(e,lastCamera,undefined,zoom.lift??0).map(name)};},
  faceNow():{x:number;y:number}[]|null{if(!zoom||!lastCamera)return null;const e=entries.find(x=>x.machine.id===zoom!.id)!;return faceNDC(e,lastCamera);},
  /**
   * The face's full CSS 3D placement (Sep 30 2026): a matrix3d mapping face pixels (x right, y down, z toward the viewer, `w`×`h`
   * px for the whole face) through the last zoom camera onto the page (`rect`: the canvas's client rect), so HTML children moved in
   * z (translateZ) land where the real 3D bay puts them. Null when not zoomed.
   */
  faceCssMatrix(w:number,h:number,rect:{left:number;top:number;width:number;height:number}):string|null{
   if(!zoom||!lastCamera||w<=0||h<=0)return null;const e=entries.find(x=>x.machine.id===zoom!.id)!,F=VENDING_FACE,k=FACE_SIZE.w/w;
   lastCamera.updateMatrixWorld();e.mesh.updateMatrixWorld();
   const A=new T.Matrix4().set(k,0,0,F.x0,0,-FACE_SIZE.h/h,0,F.y1,0,0,k,F.z,0,0,0,1);
   const S=new T.Matrix4().set(rect.width/2,0,0,rect.left+rect.width/2,0,-rect.height/2,0,rect.top+rect.height/2,0,0,-1,0,0,0,0,1);
   const M=S.multiply(lastCamera.projectionMatrix).multiply(lastCamera.matrixWorldInverse).multiply(e.mesh.matrixWorld).multiply(A);
   return `matrix3d(${M.elements.map(v=>+v.toPrecision(9)).join(',')})`;
  },
  /** Called with the face corners on every awake frame while zoomed in; returns an unsubscribe. */
  watchFace(fn:(corners:{x:number;y:number}[])=>void){faceListener=fn;return()=>{if(faceListener===fn)faceListener=null;};},
  dispose(){dropCloseUp();faces.splice(0).forEach(dropFace);closeUpStats.cachedMachines=0;occluderCache.length=0;candidates.length=0;wedge.meshes.length=wedge.count=0;glow.dispose();glowRoot.removeFromParent();root.removeFromParent();entries.forEach(e=>e.geometry.dispose());material.dispose();atlas.dispose();},
 };
}
export type VendingMachines=ReturnType<typeof createVendingMachines>;
