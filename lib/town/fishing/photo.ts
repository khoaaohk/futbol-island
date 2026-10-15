'use client';
/**
 * C6 (docs/fishing-research.md): photo mode while fishing or after a catch. One tap copies the island's last rendered frame into a
 * framed 4:3 snapshot (a paper border and a caption: the fish, the spot, the day) and keeps it ON THIS DEVICE ONLY, like the easel
 * paintings: `fi2-fish-photos-v1` is a DEVICE key (lib/saves/snapshot.ts), never synced, never uploaded, never shared. Capped:
 * the newest PHOTO_MAX photos within PHOTO_BUDGET bytes; older ones drop off.
 *
 * Heat: nothing runs until the button is pressed; then one drawImage + one JPEG encode, on demand.
 */
export const PHOTO_KEY='fi2-fish-photos-v1';
export const PHOTO_MAX=6,PHOTO_BUDGET=300*1024;
export const PHOTO_W=480,PHOTO_H=360,PHOTO_BORDER=14,PHOTO_CAPTION=34;
export type FishPhoto={id:string;at:number;caption:string;img:string};
export function sanitizePhotos(v:unknown):FishPhoto[]{
 if(!Array.isArray(v))return [];
 const out:FishPhoto[]=[];
 for(const p of v){if(!p||typeof p!=='object')continue;const x=p as Partial<FishPhoto>;
  if(typeof x.id!=='string'||typeof x.img!=='string'||!/^data:image\/(jpeg|webp|png);base64,/.test(x.img)||typeof x.at!=='number')continue;
  out.push({id:x.id.slice(0,40),at:x.at,caption:typeof x.caption==='string'?x.caption.slice(0,80):'',img:x.img});}
 return trimPhotos(out);
}
/** Newest first, at most PHOTO_MAX, and within PHOTO_BUDGET (the JSON size). */
export function trimPhotos(list:FishPhoto[]):FishPhoto[]{
 const sorted=[...list].sort((a,b)=>b.at-a.at).slice(0,PHOTO_MAX),out:FishPhoto[]=[];let bytes=2;
 for(const p of sorted){const n=JSON.stringify(p).length+1;if(bytes+n>PHOTO_BUDGET)break;bytes+=n;out.push(p);}
 return out;
}
const listeners=new Set<()=>void>();let cache:FishPhoto[]|null=null;
export function readPhotos():FishPhoto[]{if(cache)return cache;try{cache=sanitizePhotos(JSON.parse(localStorage.getItem(PHOTO_KEY)??'[]'));}catch{cache=[];}return cache;}
function writePhotos(list:FishPhoto[]){const next=trimPhotos(list);cache=next;try{localStorage.setItem(PHOTO_KEY,JSON.stringify(next));}catch{/* full: keep in memory */}listeners.forEach(f=>f());return next;}
export function subscribePhotos(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
export function deletePhoto(id:string){writePhotos(readPhotos().filter(p=>p.id!==id));}
/** Draw the framed photo from a source canvas (pure canvas work, testable with a fake 2D context). */
export function framePhoto(src:CanvasImageSource&{width:number;height:number},caption:string,doc:Document=document):HTMLCanvasElement{
 const c=doc.createElement('canvas');c.width=PHOTO_W;c.height=PHOTO_H;const g=c.getContext('2d')!;
 g.fillStyle='#fbf6ea';g.fillRect(0,0,PHOTO_W,PHOTO_H);
 const iw=PHOTO_W-PHOTO_BORDER*2,ih=PHOTO_H-PHOTO_BORDER*2-PHOTO_CAPTION,want=iw/ih;
 let sw=src.width,sh=src.height;if(sw/sh>want)sw=sh*want;else sh=sw/want;
 const sx=(src.width-sw)/2,sy=(src.height-sh)/2;
 try{g.drawImage(src,sx,sy,sw,sh,PHOTO_BORDER,PHOTO_BORDER,iw,ih);}catch{/* tainted or lost context */}
 g.strokeStyle='rgba(60,50,30,.25)';g.lineWidth=1;g.strokeRect(PHOTO_BORDER+.5,PHOTO_BORDER+.5,iw-1,ih-1);
 g.fillStyle='#3b3226';g.font='600 17px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
 g.fillText(caption.slice(0,60),PHOTO_W/2,PHOTO_H-PHOTO_BORDER-PHOTO_CAPTION/2+2);
 return c;
}
/** True if the picture area looks empty (the drawing buffer was already cleared: one flat colour). */
function blank(c:HTMLCanvasElement){try{const g=c.getContext('2d')!;const d=g.getImageData(PHOTO_BORDER+4,PHOTO_BORDER+4,PHOTO_W-2*PHOTO_BORDER-8,60).data;let lo=999,hi=0;for(let i=0;i<d.length;i+=48){const l=d[i]+d[i+1]+d[i+2];if(l<lo)lo=l;if(l>hi)hi=l;}return hi-lo<12;}catch{return false;}}
/**
 * Take a photo of the island view: waits for the next animation frame (the island renders first in its own frame callback, so the
 * WebGL drawing buffer still holds that frame; no preserveDrawingBuffer needed), tries a few frames if it was already cleared.
 */
export function takeFishingPhoto(caption:string,now=Date.now()):Promise<FishPhoto|null>{
 const gl=document.querySelector<HTMLCanvasElement>('.town-app canvas');if(!gl)return Promise.resolve(null);
 return new Promise(resolve=>{let tries=0;
  const shot=()=>{const framed=framePhoto(gl,caption);if(blank(framed)&&tries++<8){requestAnimationFrame(shot);return;}
   let img='';try{img=framed.toDataURL('image/jpeg',.72);}catch{img='';}
   if(!img.startsWith('data:image/')){resolve(null);return;}
   const photo:FishPhoto={id:`p${now.toString(36)}`,at:now,caption,img};writePhotos([photo,...readPhotos()]);resolve(photo);};
  requestAnimationFrame(shot);});
}
