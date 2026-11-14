/**
 * Kit Shop gear on the island (Oct 26 2026, owner decision: boots, balls and kits bought in the Kit Shop show on the island
 * player and the ball). This replaces the Oct 12 "Don't show on player" rule: the shop's "wearing" pick (lib/shop/shopPurchases.ts)
 * is now what the island dresses the player in.
 *
 * The ONLY island-side reader of fi2-shop-owned-v1 (tests/shop-room.cjs keeps every other reader inside lib/shop). Pure apart
 * from the injected storage, so tests/island-gear-*.cjs runs it in Node:
 *  - readIslandGear(): the worn jersey / boots / ball, each re-validated (a bad save can never break the island);
 *  - gearOutfit(): a bean Outfit with the jersey's colours + number and the boots' colour on top of the base kit;
 *  - bakeBallPixels(): the bought ball as a small equirect RGBA image (panel colours, pattern, filled panels, seams) for the
 *    island ball's one CanvasTexture (lib/graphics/shopBallSkin.ts). The kid's drawing is layered on by that module.
 *
 * Learning purpose (AGENTS.md): the kit you designed (shirt number = position, boot studs = surface, ball panels = construction)
 * is the one you play keep-ups, dribble and pass with, so the shop's football facts follow you onto the pitch.
 */
import {SHOP_GEAR_EVENT,SHOP_OWNED_KEY,designHash,loadOwned,type ShopOwned} from './shopPurchases';
import {validateJersey,type JerseyDesign} from './jersey';
import {validateBoots,bootClubBits,type BootDesign} from './boots';
import {validateBall,type BallDesign} from './ball';
import {panelAt} from './ballPanels';
import type {Outfit} from '../graphics/beanLook';

type KV=Pick<Storage,'getItem'>;
export type IslandGear={jersey:JerseyDesign|null;boots:BootDesign|null;ball:BallDesign|null;
 /** Changes whenever any worn item changes (the purchase ids joined), so callers compare one string. */
 key:string};
export const NO_GEAR:IslandGear=Object.freeze({jersey:null,boots:null,ball:null,key:''}) as IslandGear;
/** Same-tab change signal: writeOwned dispatches it (storage events only reach OTHER tabs). */
export {SHOP_GEAR_EVENT,designHash};
/** True for the storage key that holds the worn gear (Town's 'storage' listener). */
export const isGearStorageKey=(key:string|null)=>key===null||key===SHOP_OWNED_KEY;

export function gearFromOwned(owned:ShopOwned):IslandGear{
 const worn=(kind:'jersey'|'boots'|'ball')=>{const id=owned.wearing[kind];return id?owned.items.find(i=>i.id===id&&i.kind===kind)??null:null;};
 const j=worn('jersey'),b=worn('boots'),l=worn('ball');
 if(!j&&!b&&!l)return NO_GEAR;
 return {jersey:j?validateJersey(j.design).design:null,boots:b?validateBoots(b.design):null,ball:l?validateBall(l.design):null,key:[j?.id??'',b?.id??'',l?.id??''].join('|')};
}
export function readIslandGear(store?:KV|null):IslandGear{try{return gearFromOwned(loadOwned(store as Pick<Storage,'getItem'|'setItem'>|null|undefined));}catch{return NO_GEAR;}}

/** The colour the island boot shows: the boot's side panels ("Middle"), the biggest painted area of a real boot. */
export const bootColour=(b:BootDesign)=>b.colors.mid;
/**
 * The base outfit with the worn jersey and boots on top. Shirt = jersey main colour, collar/trim band = second colour, shorts =
 * the jersey's trim colour, socks = main colour with a trim-coloured top, shirt number = the jersey's number (none = no number).
 * Returns the base outfit itself when nothing is worn (no allocation on the common path).
 */
export function gearOutfit(base:Outfit,gear:IslandGear):Outfit{
 if(!gear.jersey&&!gear.boots)return base;
 const j=gear.jersey,out:Outfit={...base};
 if(j){out.kind='kit';out.shirt=j.primary;out.shirt2=j.secondary;out.shorts=j.accent;out.socks=j.primary;out.socks2=j.accent;out.number=j.number;
  if(j.club?.crest)out.club=j.club.crest==='chest'?1:2;}// Drip FC club crest (lib/shop/dripKit.ts)
 if(gear.boots){out.boots=bootColour(gear.boots);const bc=bootClubBits(gear.boots);if(bc)out.bootClub=bc;}
 return out;
}
/** Team colours (lessons, rooftop knockout) keep your own boots: footballers wear their own boots with the team kit. */
export function teamOutfitWithBoots(team:Outfit,gear:IslandGear):Outfit{if(!gear.boots)return team;const bc=bootClubBits(gear.boots);return bc?{...team,boots:bootColour(gear.boots),bootClub:bc}:{...team,boots:bootColour(gear.boots)};}

// ---- The bought ball as an equirect image ---------------------------------------------------------------------------------
/** Texture size: 256×128 (128 KB RGBA) is plenty for a 0.19 m ball on a phone, baked once per design. */
export const BALL_SKIN_W=256,BALL_SKIN_H=128;
const hexRgb=(h:string):[number,number,number]=>{const n=parseInt(h.slice(1),16)||0;return [(n>>16)&255,(n>>8)&255,n&255];};
/** Unit direction of texel (i,j): the same chart as three's SphereGeometry UVs and the studio painter (ballPaint texelDir). */
function dirOf(i:number,j:number,W:number,H:number,out:[number,number,number]){const ph=(i+.5)/W*Math.PI*2,th=(j+.5)/H*Math.PI,s=Math.sin(th);out[0]=-Math.cos(ph)*s;out[1]=Math.cos(th);out[2]=Math.sin(ph)*s;return out;}
/**
 * Bake the ball (without the drawing) into RGBA pixels, row 0 = the north pole. `mask` is the pattern mask
 * (lib/shop/ballArt.ts drawPatternMask: red = colour 1, green = colour 2) at the same size, or null for no pattern.
 * Seams are a darker line wherever the panel id changes, like the studio's grooves.
 */
export function bakeBallPixels(d:BallDesign,mask:ArrayLike<number>|null,W=BALL_SKIN_W,H=BALL_SKIN_H):Uint8ClampedArray{
 const ids=new Int16Array(W*H),grp=new Uint8Array(W*H),p:[number,number,number]=[0,0,0];
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const hit=panelAt(d.layout,dirOf(i,j,W,H,p));ids[j*W+i]=hit.id;grp[j*W+i]=hit.grp;}
 const base=[hexRgb(d.colors.a),hexRgb(d.colors.b),hexRgb(d.colors.c)],c1=hexRgb(d.pattern.c1),c2=hexRgb(d.pattern.c2);
 const on=d.pattern.on,usePat=d.pattern.kind!=='none'&&!!mask,patOn=[on==='all'||on==='a',on==='all'||on==='b',on==='all'||on==='c'];
 const fills=d.art.fills.map(f=>f?hexRgb(f):null);
 const out=new Uint8ClampedArray(W*H*4),col=[0,0,0];
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=j*W+i,g=grp[k],b=base[g]??base[0];col[0]=b[0];col[1]=b[1];col[2]=b[2];
  if(usePat&&patOn[g]){const r1=mask![k*4]/255,r2=mask![k*4+1]/255;for(let c=0;c<3;c++){col[c]+=(c1[c]-col[c])*r1;col[c]+=(c2[c]-col[c])*r2;}}
  const f=fills[ids[k]];if(f){col[0]=f[0];col[1]=f[1];col[2]=f[2];}
  const id=ids[k],seam=ids[j*W+(i+1)%W]!==id||(j+1<H&&ids[k+W]!==id);
  const s=seam?.55:1;out[k*4]=col[0]*s;out[k*4+1]=col[1]*s;out[k*4+2]=col[2]*s;out[k*4+3]=255;}
 return out;
}
/** How shiny the island ball is for each studio finish (MeshStandardMaterial roughness). */
export const FINISH_ROUGHNESS:Record<BallDesign['finish'],number>={gloss:.35,matte:.82,dimple:.6,leather:.75,holo:.3,metal:.32};

// ---- Drip FC club stickers on the island ball (Nov 13 2026, lib/shop/dripKit.ts) -------------------------------------------
/** Half-size of a decal as the studio draws it (lib/shop/ballStage.ts decalHalf): wide art shrinks so it never wraps too far. */
const decalHalf=(size:number,aspect:number)=>{const h=Math.min(size,.95/Math.max(aspect,.2));return {w:h*aspect,h};};
/**
 * Stamp one decal picture (RGBA, `img.w`×`img.h`, row 0 = its top) into the equirect skin pixels `out`, with the studio shader's
 * exact chart (ballShader.ts: the atan angles round the decal centre, its "up" turned by `rot` from the local north), alpha-blended.
 * Pure; runs once per bake (only for club stickers, the art friends see too), never per frame.
 */
export function stampDecalPixels(out:Uint8ClampedArray,W:number,H:number,decal:{dir:[number,number,number];rot:number;size:number},img:{data:ArrayLike<number>;w:number;h:number}){
 const [dx,dy,dz]=decal.dir,l=Math.hypot(dx,dy,dz)||1,d=[dx/l,dy/l,dz/l];
 const n=Math.abs(d[1])>.97?[0,0,1]:[0,1,0],nd=n[0]*d[0]+n[1]*d[1]+n[2]*d[2];
 let t=[n[0]-d[0]*nd,n[1]-d[1]*nd,n[2]-d[2]*nd];const tl=Math.hypot(t[0],t[1],t[2])||1;t=t.map(v=>v/tl);
 const c=Math.cos(decal.rot),s=Math.sin(decal.rot),dxt=[d[1]*t[2]-d[2]*t[1],d[2]*t[0]-d[0]*t[2],d[0]*t[1]-d[1]*t[0]];
 const up=[t[0]*c+dxt[0]*s,t[1]*c+dxt[1]*s,t[2]*c+dxt[2]*s];
 let r=[up[1]*d[2]-up[2]*d[1],up[2]*d[0]-up[0]*d[2],up[0]*d[1]-up[1]*d[0]];const rl=Math.hypot(r[0],r[1],r[2])||1;r=r.map(v=>v/rl);
 const u=[d[1]*r[2]-d[2]*r[1],d[2]*r[0]-d[0]*r[2],d[0]*r[1]-d[1]*r[0]];
 const hs=decalHalf(decal.size,img.w/Math.max(1,img.h)),p:[number,number,number]=[0,0,0];
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){
  dirOf(i,j,W,H,p);const cd=p[0]*d[0]+p[1]*d[1]+p[2]*d[2];if(cd<.15)continue;
  const qx=Math.atan2(p[0]*r[0]+p[1]*r[1]+p[2]*r[2],cd)/hs.w*.5+.5,qy=Math.atan2(p[0]*u[0]+p[1]*u[1]+p[2]*u[2],cd)/hs.h*.5+.5;
  if(qx<0||qx>=1||qy<0||qy>=1)continue;
  const sx=Math.min(img.w-1,Math.floor(qx*img.w)),sy=Math.min(img.h-1,Math.floor((1-qy)*img.h)),si=(sy*img.w+sx)*4,a=img.data[si+3]/255;if(a<=0)continue;
  const k=(j*W+i)*4;for(let ch=0;ch<3;ch++)out[k+ch]=out[k+ch]+(img.data[si+ch]-out[k+ch])*a;
 }
}
