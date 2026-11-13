/**
 * DRIP FC Stadium (Nov 13 2026, owner): the west stadium is named after Drip FC (a real club), its built-in naming sponsor.
 * Their wordmark and crest live in public/stadium/dripfc (small WebP copies, never hotlinked). Like every stadium sponsor they are
 * pictures only (lib/site/safety.ts SPONSOR_BOARDS_LINE): no links, no tracking, no call to action, and they carry the small
 * "Sponsor" tag. An admin-uploaded sponsor still replaces any slot (lib/stadium/sponsors/slots.ts pickSlots).
 *
 * Pure: no three.js, no DOM at import time (the sign helper takes a context and an already decoded picture).
 */
export const STADIUM_NAME='DRIP FC Stadium';
/** Upper-case form for screen headers and bars. */
export const STADIUM_NAME_CAPS='DRIP FC STADIUM';

/** The club's art, same origin. Wordmark: 800 × 197, with the water drop under the i; crest: the white "DFC" drop, 179 × 226. */
export const DRIP_FC_ART={
 wordmarkLight:'/stadium/dripfc/wordmark-light.webp',
 wordmarkDark:'/stadium/dripfc/wordmark-dark.webp',
 crest:'/stadium/dripfc/crest-light.webp',
 /** Footy Access (owner, Nov 13 2026: on the roof fascia until the adidas deal is final): their white shield + name banner, 960 × 222. */
 footyBanner:'/stadium/footyaccess/banner.webp',
} as const;
/** The white drop + DFC monogram keyed out of the club's blue icon (217 × 273, alpha mask): painted on the pitch centre. */
export const PITCH_DROP='/stadium/dripfc/pitch-drop.webp';
export const WORDMARK_ASPECT=800/197,CREST_ASPECT=179/226,FOOTY_BANNER_ASPECT=960/222;
export type DripArtKey=keyof typeof DRIP_FC_ART;

type SignCtx=Pick<CanvasRenderingContext2D,'fillStyle'|'fillRect'|'drawImage'|'font'|'textAlign'|'textBaseline'|'fillText'|'measureText'>;
/** The wordmark's letters fill the top WORDMARK_CAP of the picture (the drop hangs below the baseline). */
export const WORDMARK_CAP=262/394;
const SIGN_FONT='italic 900 {}px system-ui,-apple-system,"Segoe UI",sans-serif';
/**
 * The gate's facade sign (stadiumWorld.ts), one line that reads as one name: the white Drip FC wordmark, then "Stadium" in heavy
 * italic letters on the same baseline and cap height, centred on the dark board. Without the picture (still loading, or it
 * failed) "DRIP FC" is lettered in its place, so the sign always reads "DRIP FC Stadium".
 */
export function drawGateSign(c:SignCtx,w:number,h:number,wordmark:(CanvasImageSource&{width:number;height:number})|null,bg='#244d49',ink='#ffffff'){
 c.fillStyle=bg;c.fillRect(0,0,w,h);
 c.textAlign='left';c.textBaseline='alphabetic';c.fillStyle=ink;
 // Sizes for a cap height `cap`; then shrink everything to fit 90% of the width.
 const lay=(cap:number)=>{const fs=cap/.72;c.font=SIGN_FONT.replace('{}',String(fs));const tw=c.measureText('Stadium').width;
  let lead:number;if(wordmark)lead=cap/WORDMARK_CAP*WORDMARK_ASPECT;else{lead=c.measureText('DRIP FC').width;}
  return {fs,tw,lead,gap:cap*.45,total:lead+cap*.45+tw};};
 let cap=h*.5,L=lay(cap);if(L.total>w*.9){cap*=w*.9/L.total;L=lay(cap);}
 const x0=(w-L.total)/2,base=h*.5+cap/2;
 if(wordmark){const mh=cap/WORDMARK_CAP;c.drawImage(wordmark,x0,base-cap,L.lead,mh);}
 else c.fillText('DRIP FC',x0,base);
 c.fillText('Stadium',x0+L.lead+L.gap,base);
}
