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

// ---- Shirt ---------------------------------------------------------------------------------------------------------------
/** Where the club crest sits on a shirt: on the chest (in the crest's place) or on the left sleeve; `word` prints the wordmark
 *  across the front (in the sponsor's place). */
export type JerseyClubSpot='chest'|'sleeve';
export type JerseyClub={crest:JerseyClubSpot|null;word:boolean};
export const JERSEY_CLUB_SPOTS:readonly {id:JerseyClubSpot;label:string}[]=[{id:'chest',label:'Chest'},{id:'sleeve',label:'Sleeve'}];
/** A clean club block, or null when it carries nothing (so a shirt without it keeps its old JSON and purchase id). */
export function cleanJerseyClub(v:unknown):JerseyClub|null{
 if(!v||typeof v!=='object')return null;const o=v as Record<string,unknown>;
 const crest=o.crest==='chest'||o.crest==='sleeve'?o.crest:null,word=o.word===true;
 return crest||word?{crest,word}:null;
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
