import * as T from 'three';
import {CLUB_NO_BACKING,CLUB_PALETTE,CLUB_STICKERS} from '../shop/dripKit';

/**
 * Drip FC club marks on the beans (Nov 13 2026, lib/shop/dripKit.ts): ONE shared 128×64 coverage texture (red channel) that every
 * bean body and limb material samples, so a club crest on a shirt or a club drop on a boot costs no extra draw call, no extra
 * texture per player and nothing per frame. Left cell = the club crest (shirt chest / sleeve), right cell = the club drop (boot
 * side / heel). Rows run bottom-up (v = 0 is the bottom), like a DataTexture.
 *
 * Until the club's pictures are needed it holds a drawn drop (pure maths, no DOM, so Node tests can build beans); the first outfit
 * that wears club kit calls wantClubMarks(), which loads the club's two masks once (lib/shop/clubArt.ts, browser only) and
 * re-uploads this one texture once.
 */
export const CLUB_MARK_W=128,CLUB_MARK_H=64;
/**
 * Drip FC colours on the beans (Nov 16 2026, docs/dripfc-colors.md): a mark's palette code (dripKit.ts clubCode) travels in a spare
 * .w texel channel as code+1 (0 = the club's own ink, as before). The shaders turn it back into the art colour and, unless the backing
 * is CLUB_NO_BACKING, a backing disc behind the art, from this fixed copy of CLUB_PALETTE (linear, like every bean colour): only
 * palette colours can ever reach a bean.
 */
const _pc=new T.Color();
export const CLUB_PALETTE_GLSL=`const vec3 BEAN_CLUB_PAL[${CLUB_PALETTE.length}]=vec3[${CLUB_PALETTE.length}](${CLUB_PALETTE.map(p=>{_pc.set(p.hex);return `vec3(${_pc.r.toFixed(5)},${_pc.g.toFixed(5)},${_pc.b.toFixed(5)})`;}).join(',')});
// A mark in the club's colours: c = code+1 (0 = keep col), cov = the art's coverage, disc = the backing patch's coverage.
vec3 beanClubInk(vec3 col,vec3 ink,float c,float cov,float disc){
 if(c<.5)return mix(col,ink,cov);
 float code=c-1.,art=mod(code,16.),bg=floor(code/16.+.001);
 if(bg<${CLUB_PALETTE.length}.)col=mix(col,BEAN_CLUB_PAL[int(bg+.5)],disc);
 return art<${CLUB_PALETTE.length}.?mix(col,BEAN_CLUB_PAL[int(art+.5)],cov):col;
}`;
/** code -> the .w value the bean shaders read (0 = club ink). */
export const clubCodeTexel=(code:number|undefined)=>typeof code==='number'&&Number.isInteger(code)&&code>=0&&code<=255&&(code&15)<CLUB_PALETTE.length&&((code>>4)<CLUB_PALETTE.length||(code>>4)===CLUB_NO_BACKING)?code+1:0;
let tex:T.DataTexture|null=null,asked=false;
function drawnDrop(data:Uint8Array){
 for(let j=0;j<CLUB_MARK_H;j++)for(let i=0;i<CLUB_MARK_W;i++){
  const cx=(i%64+.5)/32-1,cy=(j+.5)/32-1;// -1..1 in the cell, y up
  const r=Math.hypot(cx,cy+.28)-.52,tip=Math.max(Math.abs(cx)*1.25+cy*.62-.5,-cy-.3);// round bottom + pointed top
  const d=Math.min(r,Math.max(tip,cy-.9)),cov=Math.max(0,Math.min(1,.5-d*24));
  data[(j*CLUB_MARK_W+i)*4]=Math.round(cov*255);data[(j*CLUB_MARK_W+i)*4+3]=255;
 }
}
/** The shared mark texture (made once). */
export function clubMarkTexture():T.DataTexture{
 if(tex)return tex;
 const data=new Uint8Array(CLUB_MARK_W*CLUB_MARK_H*4);drawnDrop(data);
 tex=new T.DataTexture(data,CLUB_MARK_W,CLUB_MARK_H,T.RGBAFormat);
 tex.colorSpace=T.NoColorSpace;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.name='bean-club-marks';tex.needsUpdate=true;
 return tex;
}
/** Swap the drawn drops for the club's own crest and drop (once, the first time a bean wears club kit). */
export function wantClubMarks(){
 if(asked||typeof document==='undefined')return;asked=true;
 void import('../shop/clubArt').then(({clubArtReady,clubImage})=>clubArtReady().then(()=>{
  const t=clubMarkTexture(),c=document.createElement('canvas');c.width=CLUB_MARK_W;c.height=CLUB_MARK_H;const g=c.getContext('2d');if(!g)return;
  let any=false;
  CLUB_STICKERS.forEach(s=>{if(s.id==='wordmark')return;const cell=s.id==='crest'?0:1;const im=clubImage(s.id);
   if(!im||!im.naturalWidth)return;any=true;const a=im.naturalWidth/im.naturalHeight,h=58,w=h*a;g.drawImage(im,cell*64+32-w/2,3,w,h);});
  if(!any)return;
  const px=g.getImageData(0,0,CLUB_MARK_W,CLUB_MARK_H).data,data=t.image.data as Uint8Array;
  for(let j=0;j<CLUB_MARK_H;j++)for(let i=0;i<CLUB_MARK_W;i++){const src=((CLUB_MARK_H-1-j)*CLUB_MARK_W+i)*4,dst=(j*CLUB_MARK_W+i)*4;data[dst]=px[src+3];}
  t.needsUpdate=true;c.width=c.height=1;
 })).catch(()=>{/* offline: the drawn drops stay */});
}
