import * as T from 'three';
import {BALL_SKIN_H,BALL_SKIN_W,FINISH_ROUGHNESS,bakeBallPixels,designHash,stampDecalPixels} from '../shop/islandGear';
import {drawPatternMask} from '../shop/ballArt';
import {artUrl,loadBallStore,type BallDesign} from '../shop/ball';
import {decodeFiDrawSync,isFiDraw} from '../shop/drawCodec';
const scratch=():HTMLCanvasElement=>{const c=document.createElement('canvas');c.width=BALL_SKIN_W;c.height=BALL_SKIN_H;return c;};
/** The design without the drawing (panels, pattern, filled panels, seams) on one new canvas + CanvasTexture. */
function bakeBase(d:BallDesign,key:string){
 let mask:Uint8ClampedArray|null=null;
 if(d.pattern.kind!=='none'){const m=scratch();drawPatternMask(m,d.pattern.kind,d.pattern.seed);mask=m.getContext('2d')!.getImageData(0,0,BALL_SKIN_W,BALL_SKIN_H).data;m.width=m.height=1;}
 const canvas=scratch(),g=canvas.getContext('2d')!;
 g.putImageData(new ImageData(bakeBallPixels(d,mask),BALL_SKIN_W,BALL_SKIN_H),0,0);
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;map.name='shop-ball-'+key;
 return {map,g};
}
/**
 * Drip FC club stickers (Nov 13 2026, lib/shop/dripKit.ts) stamped into the same skin once their pictures have loaded: the only
 * decals that leave the studio (friends get them too, lib/multiplayer/kit.ts). One putImageData + one upload per bake, never per frame.
 */
function layClub(d:BallDesign,g:CanvasRenderingContext2D,map:T.CanvasTexture,alive:()=>boolean){
 const club=d.decals.filter(x=>x.kind==='club');if(!club.length)return;
 import('../shop/clubArt').then(({clubArtReady,clubSticker})=>clubArtReady().then(()=>{
  if(!alive())return;const sk=g.getImageData(0,0,BALL_SKIN_W,BALL_SKIN_H);
  for(const x of club){const c=clubSticker(x.ref as 'crest',72).canvas,cg=c.getContext('2d')!;
   stampDecalPixels(sk.data,BALL_SKIN_W,BALL_SKIN_H,x,{data:cg.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height});c.width=c.height=1;}
  g.putImageData(sk,0,0);map.needsUpdate=true;
 })).catch(()=>{/* offline chunk: the ball stays without them */});
}
/**
 * A friend's Kit Shop ball (relay v1.7, lib/multiplayer/kit.ts kitBall: panels, colours, pattern, finish; never their drawing). One
 * material + texture per design, baked once; lib/graphics/remoteAvatars.ts keeps at most two and disposes the evicted one (map too).
 */
export function friendBallMaterial(d:BallDesign,key:string):T.MeshStandardMaterial{
 const {map,g}=bakeBase(d,'friend-'+key);
 const m=new T.MeshStandardMaterial({map,color:'#ffffff',roughness:FINISH_ROUGHNESS[d.finish]??.7});m.name='friend-shop-ball';
 let gone=false;m.addEventListener('dispose',()=>{gone=true;});layClub(d,g,map,()=>!gone);return m;
}
/**
 * The Kit Shop ball on the island's walking ball (Oct 26 2026, lib/shop/islandGear.ts). One small equirect CanvasTexture per
 * design, baked once when the worn ball changes (never per frame), kept in a 2-entry cache so switching back is free, and
 * disposed with the renderer. The kid's drawing (Ball Studio Draw step) is layered on top; a WebP/PNG drawing decodes
 * asynchronously and refreshes the texture once. Decals (stickers/flags/text) stay in the studio, except Drip FC club stickers
 * (layClub, Nov 13 2026), which friends see too.
 */
export function createShopBallSkin(material:T.MeshStandardMaterial){
 const cache=new Map<string,T.CanvasTexture>();let current='',disposed=false;
 function bake(d:BallDesign,key:string){
  const {map,g}=bakeBase(d,key);
  const url=d.art.id?artUrl(d.art.id,loadBallStore()):'';
  if(url){
   const lay=(src:CanvasImageSource)=>{if(disposed||!cache.has(key))return;g.drawImage(src,0,0,BALL_SKIN_W,BALL_SKIN_H);map.needsUpdate=true;};
   if(isFiDraw(url)){const px=decodeFiDrawSync(url);if(px){const tmp=document.createElement('canvas');tmp.width=px.w;tmp.height=px.h;tmp.getContext('2d')!.putImageData(new ImageData(px.px,px.w,px.h),0,0);cache.set(key,map);lay(tmp);tmp.width=tmp.height=1;}}
   else{const img=new Image();img.onload=()=>lay(img);img.src=url;}
  }
  layClub(d,g,map,()=>!disposed&&cache.has(key));
  return map;
 }
 return{
  /** Wear a shop ball (true), or take it off (null → false: the caller restores its own skin). */
  setDesign(d:BallDesign|null):boolean{
   if(!d){current='';return false;}
   const key=designHash(d);if(key===current)return true;
   let map=cache.get(key);if(!map){map=bake(d,key);cache.set(key,map);}
   current=key;material.map=map;
   for(const [old,tex] of cache){if(cache.size<=2)break;if(old!==key){cache.delete(old);tex.dispose();}}material.color.set('#ffffff');material.emissive.set('#000000');material.emissiveIntensity=0;material.roughness=FINISH_ROUGHNESS[d.finish]??.7;material.needsUpdate=true;
   return true;
  },
  dispose(){disposed=true;for(const tex of cache.values())tex.dispose();cache.clear();current='';},
 };
}
