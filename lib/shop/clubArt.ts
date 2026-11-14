/**
 * Drip FC club art for the Kit Shop (Nov 13 2026, lib/shop/dripKit.ts). The club's three small same-origin WebP masks (white on
 * transparent: crest, wordmark, drop) are fetched once, on demand (the first Drip FC sticker or shirt, never at page load), and
 * cached for the page's life. Until they arrive (or if one fails) every drawer falls back to a lettered "DFC" mark, so a sticker
 * never vanishes; callers redraw once when clubArtReady() resolves. Canvas 2D only, no three.js; DOM is touched only when called.
 */
import {CLUB_COLORS,CLUB_STICKERS,type ClubArt} from './dripKit';

type Img=HTMLImageElement;
const imgs=new Map<ClubArt,Img>();let ready:Promise<void>|null=null;
/** Load the three masks (once). Resolves when all have loaded or failed; never rejects. */
export function clubArtReady():Promise<void>{
 if(ready)return ready;
 if(typeof Image==='undefined')return ready=Promise.resolve();
 ready=Promise.all(CLUB_STICKERS.map(s=>new Promise<void>(ok=>{const i=new Image();i.decoding='async';
  i.onload=()=>{imgs.set(s.id,i);ok();};i.onerror=()=>ok();i.src=s.src;}))).then(()=>undefined);
 return ready;
}
export const clubArtLoaded=(id:ClubArt)=>imgs.has(id);
/** The loaded mask (white on transparent), or null. */
export const clubImage=(id:ClubArt):HTMLImageElement|null=>imgs.get(id)??null;

type G=CanvasRenderingContext2D;
/** Any 2D context (the jersey atlas may be an OffscreenCanvas). */
export type ClubCtx=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
const canvas=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;};
/** The mask `id` tinted `ink`, fitted (aspect kept) in a w×h box centred on (x,y). Fallback: "DFC" lettered in `ink`. */
export function drawClubMark(g:ClubCtx,id:ClubArt,x:number,y:number,w:number,h:number,ink:string){
 const im=typeof document==='undefined'?undefined:imgs.get(id);
 if(!im){g.save();g.fillStyle=ink;g.textAlign='center';g.textBaseline='middle';const fs=Math.min(h*.6,w/(id==='wordmark'?4.6:2.2));
  g.font=`italic 900 ${fs}px system-ui,-apple-system,"Segoe UI",sans-serif`;g.fillText(id==='wordmark'?'DRIP FC':'DFC',x,y);g.restore();return;}
 const a=im.naturalWidth/Math.max(1,im.naturalHeight);let dw=w,dh=w/a;if(dh>h){dh=h;dw=h*a;}
 const t=canvas(dw,dh),tg=t.getContext('2d')!;tg.drawImage(im,0,0,t.width,t.height);tg.globalCompositeOperation='source-in';tg.fillStyle=ink;tg.fillRect(0,0,t.width,t.height);
 g.drawImage(t,x-dw/2,y-dh/2,dw,dh);t.width=t.height=1;
}
const dropPath=(g:G,x:number,y:number,w:number,h:number)=>{g.beginPath();g.moveTo(x+w/2,y);g.bezierCurveTo(x+w*.62,y+h*.2,x+w,y+h*.42,x+w,y+h*.66);
 g.arc(x+w/2,y+h*.66,w/2,0,Math.PI,false);g.bezierCurveTo(x,y+h*.42,x+w*.38,y+h*.2,x+w/2,y);g.closePath();};
/**
 * A die-cut club sticker about `px` tall: crest = white crest on a blue roundel with a white rim; wordmark = white wordmark on a
 * blue tab; drop = a blue drop (the white monogram inside) with a white edge. Returns the canvas and its aspect (w/h).
 */
export function clubSticker(id:ClubArt,px:number):{canvas:HTMLCanvasElement;aspect:number}{
 const b=Math.max(2,px*.05);
 if(id==='wordmark'){const h=px*.5,w=h*3.4,c=canvas(w+b*2,h+b*2),g=c.getContext('2d')!;
  g.fillStyle='#ffffff';g.beginPath();g.roundRect(0,0,c.width,c.height,(h+b*2)*.3);g.fill();
  g.fillStyle=CLUB_COLORS.blue;g.beginPath();g.roundRect(b,b,w,h,h*.26);g.fill();
  drawClubMark(g,'wordmark',c.width/2,c.height/2+h*.04,w*.84,h*.78,'#ffffff');return {canvas:c,aspect:c.width/c.height};}
 if(id==='drop'){const h=px*.9,w=h*.78,c=canvas(w+b*2,h+b*2),g=c.getContext('2d')!;
  dropPath(g,0,0,c.width,c.height);g.fillStyle='#ffffff';g.fill();dropPath(g,b,b*1.6,w,h-b*.6);g.fillStyle=CLUB_COLORS.blue;g.fill();
  drawClubMark(g,'drop',c.width/2,b*1.6+h*.56,w*.7,h*.62,'#ffffff');return {canvas:c,aspect:c.width/c.height};}
 const r=px*.45,c=canvas(r*2+b*2,r*2+b*2),g=c.getContext('2d')!,m=c.width/2;
 g.fillStyle='#ffffff';g.beginPath();g.arc(m,m,r+b,0,Math.PI*2);g.fill();
 g.fillStyle=CLUB_COLORS.blue;g.beginPath();g.arc(m,m,r,0,Math.PI*2);g.fill();
 g.strokeStyle=CLUB_COLORS.navy;g.lineWidth=r*.07;g.beginPath();g.arc(m,m,r*.9,0,Math.PI*2);g.stroke();
 drawClubMark(g,'crest',m,m+r*.02,r*1.25,r*1.4,'#ffffff');return {canvas:c,aspect:1};
}
