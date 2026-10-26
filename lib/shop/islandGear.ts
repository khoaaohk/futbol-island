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
import {validateBoots,type BootDesign} from './boots';
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
 if(j){out.kind='kit';out.shirt=j.primary;out.shirt2=j.secondary;out.shorts=j.accent;out.socks=j.primary;out.socks2=j.accent;out.number=j.number;}
 if(gear.boots)out.boots=bootColour(gear.boots);
 return out;
}
/** Team colours (lessons, rooftop knockout) keep your own boots: footballers wear their own boots with the team kit. */
export function teamOutfitWithBoots(team:Outfit,gear:IslandGear):Outfit{return gear.boots?{...team,boots:bootColour(gear.boots)}:team;}

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
