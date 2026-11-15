/**
 * Drip FC club kit in the Kit Shop (Nov 13 2026, owner). Drip FC (a real club, the stadium's naming sponsor, lib/stadium/dripfc.ts)
 * agreed to its art being used as OPTIONAL kit:
 *  - stickers the player places themselves: on a ball (Ball Studio stickers, kind 'club'), on boots (Boot Studio stickers, kind 'club',
 *    side / heel / toe / tongue) and the club crest on a shirt (chest or sleeve, plus the wordmark across the front);
 *  - plain Drip FC presets in each studio (home shirt, boots, ball), priced like every other design of that kind (lib/economy.ts).
 * Honest and kid-safe: every Drip FC item and sticker is labelled CLUB_LABEL with the small SPONSOR_TAG, there are no links, nothing
 * random, and everything is bought only with island coins (lib/site/safety.ts SPONSOR_KIT_LINE tells grown-ups).
 *
 * Pure (no DOM, no three.js): data, validation helpers and the Kit wire packing (lib/multiplayer/kit.ts), so tests/dripfc-kit.cjs
 * runs it in Node. The pictures are drawn by lib/shop/clubArt.ts.
 *
 * Colours (Nov 15 2026, owner; docs/dripfc-colors.md): each placed piece may be recoloured (art + backing) from CLUB_PALETTE so it
 * stands out on the player's kit. New pieces ALWAYS start in club colours; the studios (components/shop/ClubColors.tsx) show a
 * gentle hint when a pair is hard to read on the item under it and a "Best contrast" button, but change nothing on their own.
 * Stored as one integer per piece (`cc`; the shirt's `cc` / `wc`), never as the default; free once owned (purchase ids ignore
 * it). Friends still see club colours: the relay checks every Cap.KitClub slot, so colours need a relay change first (the doc).
 */
import {DRIP_FC_ART,PITCH_DROP} from '../stadium/dripfc';

export const CLUB_NAME='Drip FC';
/** The label on every Drip FC item and sticker tray. */
export const CLUB_LABEL='Drip FC club kit';
/** The small tag beside it (the stadium boards' "Sponsor" tag, lib/stadium/sponsors/atlas.ts). */
export const SPONSOR_TAG='Sponsor';
/** Club colours matched to their art (a white drop and wordmark keyed out of a blue icon): royal blue, deep navy, white. */
export const CLUB_COLORS={blue:'#1d5fd1',navy:'#0d2350',white:'#f7f3ea'} as const;

export const CLUB_ART_IDS=['crest','wordmark','drop'] as const;
export type ClubArt=typeof CLUB_ART_IDS[number];
/** The three club stickers: the crest on a blue roundel, the wordmark on a blue tab, and the white drop as a die-cut blue drop. */
export const CLUB_STICKERS:readonly {id:ClubArt;label:string;src:string;aspect:number}[]=[
 {id:'crest',label:'Drip FC crest',src:DRIP_FC_ART.crest,aspect:1},
 {id:'wordmark',label:'Drip FC wordmark',src:DRIP_FC_ART.wordmarkLight,aspect:3.4},
 {id:'drop',label:'Drip FC drop',src:PITCH_DROP,aspect:217/273},
];
export const isClubArt=(v:unknown):v is ClubArt=>(CLUB_ART_IDS as readonly unknown[]).includes(v);
/** At most this many Drip FC stickers on one ball (all of them travel to friends: lib/multiplayer/kit.ts). */
export const MAX_CLUB_BALL=3;

// ---- Club art colours (Nov 15 2026, owner) ------------------------------------------------------------------------------
/**
 * Players may recolour the Drip FC art they place so it stands out on their kit: two colours per piece, the ART (the drop /
 * crest / wordmark, club white by default) and its BACKING (the roundel / tab / drop body, club blue by default), from this
 * curated palette only (no free picker). Indexes are STORED (one small integer per piece, below), so never reorder or remove
 * an entry; add new ones at the end (≤ 15). The hexes are the club's own three plus kid colours from the Boot Studio palette
 * (lib/shop/boots.ts PALETTE).
 */
export const CLUB_PALETTE:readonly {hex:string;name:string}[]=[
 {hex:CLUB_COLORS.blue,name:'Club blue'},{hex:CLUB_COLORS.navy,name:'Club navy'},{hex:CLUB_COLORS.white,name:'Club white'},
 {hex:'#18191d',name:'Black'},{hex:'#d7262e',name:'Red'},{hex:'#ff8a1f',name:'Orange'},{hex:'#ffe14a',name:'Lemon'},
 {hex:'#b8f03c',name:'Volt'},{hex:'#2fa65a',name:'Green'},{hex:'#53b8f2',name:'Sky'},{hex:'#7d4bd8',name:'Purple'},{hex:'#ff7cc8',name:'Pink'},
];
/** Backing index meaning "no backing" (shirt prints only: the art printed straight on the shirt). */
export const CLUB_NO_BACKING=15;
/**
 * One piece's colours as ONE integer: art index | backing index << 4 (0..255). A sticker without a code (`cc` absent) is in
 * club colours, so every older save, preset and purchase id stays byte for byte the same; recolouring is free (purchase ids
 * ignore it: stripClubColors, lib/shop/shopPurchases.ts).
 */
export const clubCode=(art:number,bg:number)=>(art&15)|(bg&15)<<4;
/** White art on club blue: the club colours (a sticker stores no code for it). */
export const CLUB_DEFAULT_CODE=clubCode(2,0);
/** A stored code, cleaned: undefined for anything unusable or for the club colours themselves (stickers), so the default is never
 *  written. `backingOptional` (shirt prints) also allows CLUB_NO_BACKING and keeps an explicit club pair. */
export function cleanClubCode(v:unknown,backingOptional=false):number|undefined{
 if(typeof v!=='number'||!Number.isInteger(v)||v<0||v>255)return undefined;
 const art=v&15,bg=v>>4;if(art>=CLUB_PALETTE.length)return undefined;
 if(!(bg<CLUB_PALETTE.length||(backingOptional&&bg===CLUB_NO_BACKING)))return undefined;
 if(!backingOptional&&v===CLUB_DEFAULT_CODE)return undefined;
 return v;
}
/** The art and backing hex of a code (undefined = club colours). backing null = printed straight on (shirts). */
export function clubColorsOf(code:number|undefined):{art:string;bg:string|null}{
 const c=cleanClubCode(code,true)??CLUB_DEFAULT_CODE,bg=c>>4;
 return {art:CLUB_PALETTE[c&15].hex,bg:bg===CLUB_NO_BACKING?null:CLUB_PALETTE[bg].hex};
}
const lin=(h:string)=>{const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255].map(v=>{const s=v/255;return s<=.03928?s/12.92:((s+.055)/1.055)**2.4;});};
/** WCAG relative luminance of a #rrggbb colour. */
export const clubLuminance=(h:string)=>{const c=lin(/^#[0-9a-f]{6}$/i.test(h)?h:'#000000');return .2126*c[0]+.7152*c[1]+.0722*c[2];};
/** WCAG contrast ratio (1..21). */
export function clubContrast(a:string,b:string):number{const x=clubLuminance(a),y=clubLuminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
/** Readable when the art is ≥ 3:1 on its backing (WCAG non-text contrast) and the backing ≥ 2:1 on the item under it (the white
 *  die-cut rim helps a little); printed straight on, the art needs ≥ 3:1 on the item. */
export const CLUB_READ_PAIR=3,CLUB_READ_ITEM=2;
export type ClubReadability={ok:boolean;pair:number;item:number;problem:'pair'|'item'|null};
/** How readable a piece is: `under` = the item colours the art sits on (boot zone, ball panels, shirt). */
export function clubReadability(code:number|undefined,under:readonly string[]):ClubReadability{const {art,bg}=clubColorsOf(code);return clubReadabilityHex(art,bg,under);}
/** The same for explicit colours (a shirt's club print: its automatic ink, no backing). */
export function clubReadabilityHex(art:string,bg:string|null,under:readonly string[]):ClubReadability{
 const u=under.length?under:['#808080'];
 if(!bg){const item=Math.min(...u.map(h=>clubContrast(art,h)));return {ok:item>=CLUB_READ_PAIR,pair:item,item,problem:item>=CLUB_READ_PAIR?null:'item'};}
 const pair=clubContrast(art,bg),item=Math.min(...u.map(h=>clubContrast(bg,h)));
 const problem=pair<CLUB_READ_PAIR?'pair':item<CLUB_READ_ITEM?'item':null;
 return {ok:!problem,pair,item,problem};
}
/**
 * "Best contrast": the most readable code on `under`. Keeps the club pair when it already reads; else scores every art × backing
 * pair by its weakest ratio (art on backing / 3, backing on item / 2), preferring the club's own colours on a tie. With
 * `printed` (a shirt print without backing) only the art colour is chosen. Pure and deterministic.
 */
export function bestClubCode(under:readonly string[],printed=false):number{
 const club=(i:number)=>i<3?0:1;
 if(printed){let best=2,score=-1;for(let a=0;a<CLUB_PALETTE.length;a++){const s=clubReadability(clubCode(a,CLUB_NO_BACKING),under).item-club(a)*.01;if(s>score){score=s;best=a;}}return clubCode(best,CLUB_NO_BACKING);}
 if(clubReadability(CLUB_DEFAULT_CODE,under).ok)return CLUB_DEFAULT_CODE;
 let best=CLUB_DEFAULT_CODE,score=-1;
 for(let b=0;b<CLUB_PALETTE.length;b++)for(let a=0;a<CLUB_PALETTE.length;a++){if(a===b)continue;
  const r=clubReadability(clubCode(a,b),under),s=Math.min(r.pair/CLUB_READ_PAIR,r.item/CLUB_READ_ITEM,1.6)-(club(a)+club(b))*.004;
  if(s>score){score=s;best=clubCode(a,b);}}
 return best;
}
/** A shaded backing for the crest's inner ring (club navy on club blue, as before). */
export function clubRing(bg:string):string{
 if(bg.toLowerCase()===CLUB_COLORS.blue)return CLUB_COLORS.navy;
 const n=parseInt(bg.slice(1),16),k=clubLuminance(bg)>.5?.72:.6,ch=(s:number)=>Math.round(((n>>s)&255)*k);
 return '#'+((ch(16)<<16)|(ch(8)<<8)|ch(0)).toString(16).padStart(6,'0');
}
/** The design without any club colour codes (ball / boot decals' `cc`, the shirt club block's `cc` / `wc`): what a purchase id
 *  hashes, so a recolour never asks for coins again. Pure; returns the input itself when it carries no codes. */
export function stripClubColors<T>(design:T):T{
 if(!design||typeof design!=='object')return design;
 const o=design as Record<string,unknown>;let out:Record<string,unknown>|null=null;
 if(Array.isArray(o.decals)&&o.decals.some(d=>d&&typeof d==='object'&&'cc' in d)){out={...o,decals:o.decals.map(d=>{if(!d||typeof d!=='object'||!('cc' in d))return d;const {cc:_c,...rest}=d as Record<string,unknown>;void _c;return rest;})};}
 const cl=o.club as Record<string,unknown>|undefined;
 if(cl&&typeof cl==='object'&&('cc' in cl||'wc' in cl)){const {cc:_a,wc:_b,...rest}=cl;void _a;void _b;out={...(out??o),club:rest};}
 return (out??design) as T;
}
/** What the colour hint says (kid-friendly, no numbers). */
export function clubHint(r:ClubReadability,itemWord:string):string{
 return r.problem==='pair'?'These two colours are close, so the badge is hard to read.':`This may be hard to see on your ${itemWord}.`;
}

// ---- Shirt ---------------------------------------------------------------------------------------------------------------
/** Where the club crest sits on a shirt: on the chest (in the crest's place) or on the left sleeve; `word` prints the wordmark
 *  across the front (in the sponsor's place). */
export type JerseyClubSpot='chest'|'sleeve';
export type JerseyClub={crest:JerseyClubSpot|null;word:boolean;
 /** Nov 15 2026: the crest's / wordmark's colours (clubCode; backing CLUB_NO_BACKING = printed straight on). Absent = the club's
  *  print (white or navy ink picked by the shirt colour, no backing), as before. */
 cc?:number;wc?:number};
export const JERSEY_CLUB_SPOTS:readonly {id:JerseyClubSpot;label:string}[]=[{id:'chest',label:'Chest'},{id:'sleeve',label:'Sleeve'}];
/** A clean club block, or null when it carries nothing (so a shirt without it keeps its old JSON and purchase id). */
export function cleanJerseyClub(v:unknown):JerseyClub|null{
 if(!v||typeof v!=='object')return null;const o=v as Record<string,unknown>;
 const crest=o.crest==='chest'||o.crest==='sleeve'?o.crest:null,word=o.word===true;if(!crest&&!word)return null;
 const out:JerseyClub={crest,word},cc=crest?cleanClubCode(o.cc,true):undefined,wc=word?cleanClubCode(o.wc,true):undefined;
 if(cc!==undefined)out.cc=cc;if(wc!==undefined)out.wc=wc;return out;
}

// ---- Wire (relay Cap.KitClub, lib/multiplayer/kit.ts) ----------------------------------------------------------------------
/** Shirt byte: 0 none, 1 chest crest, 2 sleeve crest, +4 the wordmark. */
export function jerseyClubCode(c:JerseyClub|null|undefined):number{if(!c)return 0;return (c.crest==='chest'?1:c.crest==='sleeve'?2:0)+(c.word?4:0);}
export function jerseyClubFrom(code:number):JerseyClub|null{const s=code&3,crest=s===1?'chest':s===2?'sleeve':null,word=(code&4)!==0;return crest||word?{crest,word}:null;}
/** Boot bits: 1 = a club sticker on a side / toe / tongue, 2 = on the heel. */
export const BOOT_CLUB_SIDE=1,BOOT_CLUB_HEEL=2;

type V3=[number,number,number];
const TAU=Math.PI*2;
const SIZE_MIN=.1,SIZE_MAX=.55;
/**
 * One ball club sticker as ONE integer 0..0xFFFFFF (a colour's range on the wire): art (2 bits), longitude (7), latitude (6),
 * turn (5), size (4). About 2.8° of position, 11° of turn and 0.03 of size: plenty for a 19 cm ball seen across the island.
 */
export function packBallClub(ref:ClubArt,dir:V3,rot:number,size:number):number{
 const art=CLUB_ART_IDS.indexOf(ref);if(art<0)return -1;
 const l=Math.hypot(dir[0],dir[1],dir[2])||1,x=dir[0]/l,y=dir[1]/l,z=dir[2]/l;
 const th=Math.acos(Math.max(-1,Math.min(1,y))),ph=((Math.atan2(z,x)%TAU)+TAU)%TAU;
 const lon=Math.round(ph/TAU*128)%128,lat=Math.max(0,Math.min(63,Math.round(th/Math.PI*63)));
 const r=Math.round(((rot%TAU)+TAU)%TAU/TAU*32)%32;
 const s=Math.max(0,Math.min(15,Math.round((Math.max(SIZE_MIN,Math.min(SIZE_MAX,size))-SIZE_MIN)/(SIZE_MAX-SIZE_MIN)*15)));
 return art|lon<<2|lat<<9|r<<15|s<<20;
}
export function unpackBallClub(n:number):{ref:ClubArt;dir:V3;rot:number;size:number}|null{
 if(!Number.isInteger(n)||n<0||n>0xffffff)return null;
 const ref=CLUB_ART_IDS[n&3];if(!ref)return null;
 const ph=((n>>2)&127)/128*TAU,th=((n>>9)&63)/63*Math.PI,r=((n>>15)&31)/32*TAU,s=(n>>20)&15;
 const st=Math.sin(th);
 return {ref,dir:[st*Math.cos(ph),Math.cos(th),st*Math.sin(ph)],rot:r>Math.PI?r-TAU:r,size:SIZE_MIN+s/15*(SIZE_MAX-SIZE_MIN)};
}
