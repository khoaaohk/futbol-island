/**
 * Futbol shop: the Jersey studio's design schema (Oct 12 2026).
 *
 * Pure data, no DOM or three.js: the studio (components/shop/JerseyStudio.tsx), its painter (lib/shop/jerseyPaint.ts), the
 * shop (save/buy wiring) and tests/shop-jersey.cjs all read it. Everything here is ORIGINAL: no real team names, crests,
 * sponsors, kit makers or kit replicas. Sponsors are made-up island businesses named after football words, so each one
 * teaches a bit of football language (the project principle in AGENTS.md).
 *
 * Saved under JERSEY_KEY ('fi2-shop-jersey-v1') as a JerseySave: the in-progress design (auto-saved) plus 3 named slots.
 * The shop agent adds the key to SYNC_KEYS (lib/saves); this module never touches the save system itself.
 *
 * Oct 12 2026 (v2, "draw your own design"): a design may carry `art`, the child's own drawing as compact vector ops
 * (lib/shop/paint/artOps.ts). It is optional, so every older save and every bought design still validates unchanged (same JSON,
 * same purchase id). Size budget: one drawing ≤ ART_MAX_CHARS (12 KB) of JSON; the save holds at most 4 (current + 3 slots),
 * so the jersey key stays under ~50 KB, far inside the sync caps (lib/saves/snapshot.ts: 256 KB per key, 512 KB / 192 KB gzip
 * per snapshot). Drawings are user-generated images stored only in the child's own save (no public sharing); typed text still
 * goes only through the name filter below.
 */
import {type Art,validateArt,artStats} from './paint/artOps';

export const JERSEY_KEY='fi2-shop-jersey-v1';
export const JERSEY_SLOTS=3;
export const NAME_MAX=12;

export type SleeveStyle='short'|'long';
export type CollarStyle='crew'|'vneck'|'polo'|'wrap';
export type PatternId='solid'|'stripes'|'hoops'|'pinstripes'|'sash'|'halves'|'quarters'|'chevron'|'checkers'|'fade'|'waves';
export type FontId='classic'|'brush'|'college'|'rounded';
export type CrestShape='shield'|'roundel'|'diamond';
export type CrestIcon='none'|'star'|'ball'|'wave'|'palm';
export type SponsorId='none'|'tikitaka'|'nutmeg'|'rabona'|'panenka'|'topbins';

export interface JerseyCrest{shape:CrestShape;initials:string;icon:CrestIcon;fill:string;ring:string;ink:string}
export interface JerseyDesign{
 v:1;
 sleeves:SleeveStyle;collar:CollarStyle;cuffs:boolean;
 pattern:PatternId;primary:string;secondary:string;accent:string;
 name:string;number:number|null;font:FontId;outline:boolean;frontNumber:boolean;textColor:string;
 crest:JerseyCrest;sponsor:SponsorId;
 /** The child's own drawing (optional; absent = none). Layered above the pattern and below the crest, name and numbers. */
 art?:Art;
}
export interface JerseySlot{name:string;design:JerseyDesign;savedAt:number}
export interface JerseySave{v:1;current:JerseyDesign;slots:(JerseySlot|null)[];updatedAt:number}

export const SLEEVES:{id:SleeveStyle;label:string}[]=[{id:'short',label:'Short'},{id:'long',label:'Long'}];
export const COLLARS:{id:CollarStyle;label:string;tip:string}[]=[
 {id:'crew',label:'Crew',tip:'A round rib collar. Light and simple.'},
 {id:'vneck',label:'V-neck',tip:'A V-shaped rib at the front.'},
 {id:'polo',label:'Polo',tip:'A fold-down collar with a buttoned placket, like early football shirts.'},
 {id:'wrap',label:'Wrap',tip:'An envelope collar: one side crosses over the other.'},
];
export const PATTERNS:{id:PatternId;label:string;tip:string}[]=[
 {id:'solid',label:'Solid',tip:'One main colour. Clean and classic.'},
 {id:'stripes',label:'Stripes',tip:'Bold vertical stripes.'},
 {id:'hoops',label:'Hoops',tip:'Hoops are stripes that go across the shirt.'},
 {id:'pinstripes',label:'Pinstripes',tip:'Very thin lines, like a smart suit.'},
 {id:'sash',label:'Sash',tip:'A diagonal band from shoulder to hip.'},
 {id:'halves',label:'Halves',tip:'Each half of the shirt is a different colour.'},
 {id:'quarters',label:'Quarters',tip:'Four blocks, like a flag.'},
 {id:'chevron',label:'Chevron',tip:'A big V across the chest.'},
 {id:'checkers',label:'Checkers',tip:'A board of squares.'},
 {id:'fade',label:'Fade',tip:'Dots that melt from one colour into another.'},
 {id:'waves',label:'Waves',tip:'Island waves rolling across the shirt.'},
];
export const FONTS:{id:FontId;label:string}[]=[{id:'classic',label:'Classic'},{id:'brush',label:'Island'},{id:'college',label:'College'},{id:'rounded',label:'Bubble'}];
export const CREST_SHAPES:{id:CrestShape;label:string}[]=[{id:'shield',label:'Shield'},{id:'roundel',label:'Roundel'},{id:'diamond',label:'Diamond'}];
export const CREST_ICONS:{id:CrestIcon;label:string}[]=[{id:'star',label:'Star'},{id:'ball',label:'Ball'},{id:'wave',label:'Wave'},{id:'palm',label:'Palm'},{id:'none',label:'None'}];
/** Made-up island businesses. Each name is a football word, explained in `tip`. */
export const SPONSORS:{id:SponsorId;label:string;line:string;tip:string}[]=[
 {id:'none',label:'No sponsor',line:'',tip:'Lots of youth teams play with a clean shirt front.'},
 {id:'tikitaka',label:'Tiki-Taka Tacos',line:'TIKI-TAKA',tip:'Tiki-taka is a style of play with lots of short, quick passes.'},
 {id:'nutmeg',label:'Nutmeg Bakery',line:'NUTMEG',tip:'A nutmeg is when you play the ball through a defender’s legs.'},
 {id:'rabona',label:'Rabona Radio',line:'RABONA',tip:'A rabona is a kick where your kicking leg wraps behind your standing leg.'},
 {id:'panenka',label:'Panenka Pops',line:'PANENKA',tip:'A Panenka is a soft, chipped penalty down the middle.'},
 {id:'topbins',label:'Top Bins Juice',line:'TOP BINS',tip:'“Top bins” means a shot into the top corner of the goal.'},
];

/** Curated kid-friendly palette (big swatches). Custom colours are allowed too (any #rrggbb). */
export const PALETTE:{hex:string;label:string}[]=[
 {hex:'#f7f3ea',label:'Island white'},{hex:'#f1e2bf',label:'Cream'},{hex:'#ffd23f',label:'Sunshine'},{hex:'#ff9f1c',label:'Mango'},
 {hex:'#ff6b5b',label:'Coral'},{hex:'#d7263d',label:'Cherry'},{hex:'#ff8fb8',label:'Flamingo'},{hex:'#7b4bb7',label:'Grape'},
 {hex:'#2ec4d6',label:'Lagoon'},{hex:'#6cb4ee',label:'Sky'},{hex:'#2554c7',label:'Royal'},{hex:'#1b2a4a',label:'Navy'},
 {hex:'#2e9e5b',label:'Palm'},{hex:'#a3d93a',label:'Lime'},{hex:'#9fe3c8',label:'Mint'},{hex:'#1f5c3f',label:'Forest'},
 {hex:'#d9b77e',label:'Sand'},{hex:'#7a4b2a',label:'Coconut'},{hex:'#3a4148',label:'Charcoal'},{hex:'#15171a',label:'Night'},
];

/** Shirt numbers: what each classic number usually means on the pitch (shown under the number picker). */
export function numberTip(n:number|null):string{
 if(n==null)return 'No number: a training shirt.';
 const tips:Record<number,string>={1:'Number 1 is usually the goalkeeper.',2:'Number 2 is often a right-back.',3:'Number 3 is often a left-back.',
  4:'Number 4 is often a centre-back or a holding midfielder.',5:'Number 5 is often a centre-back.',6:'Number 6 is often a defensive midfielder.',
  7:'Number 7 is often a winger: fast down the side.',8:'Number 8 is often a box-to-box midfielder.',9:'Number 9 is the classic striker.',
  10:'Number 10 is the playmaker who creates chances.',11:'Number 11 is often a winger on the left.'};
 return tips[n]??(n===0?'Zero! Some leagues do not allow it, but on the island it is fine.':`Number ${n}: you make it famous!`);
}

export const DEFAULT_JERSEY:JerseyDesign={
 v:1,sleeves:'short',collar:'crew',cuffs:true,
 pattern:'hoops',primary:'#2ec4d6',secondary:'#f7f3ea',accent:'#1b2a4a',
 name:'',number:10,font:'classic',outline:true,frontNumber:true,textColor:'#1b2a4a',
 crest:{shape:'shield',initials:'FI',icon:'palm',fill:'#1b2a4a',ring:'#ffd23f',ink:'#f7f3ea'},sponsor:'none',
};

export const PRESETS:{id:string;label:string;design:JerseyDesign}[]=[
 {id:'lagoon',label:'Lagoon hoops',design:DEFAULT_JERSEY},
 {id:'sunset',label:'Sunset sash',design:{...DEFAULT_JERSEY,pattern:'sash',primary:'#7b4bb7',secondary:'#ff9f1c',accent:'#ffd23f',collar:'vneck',number:7,textColor:'#ffd23f',font:'college',crest:{shape:'roundel',initials:'SS',icon:'star',fill:'#ff9f1c',ring:'#ffd23f',ink:'#7b4bb7'},sponsor:'panenka'}},
 {id:'palm',label:'Palm stripes',design:{...DEFAULT_JERSEY,pattern:'stripes',primary:'#a3d93a',secondary:'#1f5c3f',accent:'#f1e2bf',collar:'polo',sleeves:'long',number:8,textColor:'#f1e2bf',font:'classic',crest:{shape:'shield',initials:'PI',icon:'palm',fill:'#1f5c3f',ring:'#f1e2bf',ink:'#a3d93a'},sponsor:'nutmeg'}},
 {id:'coral',label:'Coral halves',design:{...DEFAULT_JERSEY,pattern:'halves',primary:'#ff6b5b',secondary:'#1b2a4a',accent:'#f7f3ea',collar:'vneck',number:9,textColor:'#f7f3ea',font:'rounded',crest:{shape:'diamond',initials:'C',icon:'ball',fill:'#f7f3ea',ring:'#1b2a4a',ink:'#ff6b5b'},sponsor:'topbins'}},
 {id:'midnight',label:'Midnight waves',design:{...DEFAULT_JERSEY,pattern:'waves',primary:'#1b2a4a',secondary:'#2ec4d6',accent:'#ffd23f',collar:'wrap',sleeves:'long',number:11,textColor:'#ffd23f',font:'brush',crest:{shape:'roundel',initials:'MW',icon:'wave',fill:'#2ec4d6',ring:'#ffd23f',ink:'#1b2a4a'},sponsor:'rabona'}},
 {id:'mango',label:'Mango checkers',design:{...DEFAULT_JERSEY,pattern:'checkers',primary:'#ff9f1c',secondary:'#6cb4ee',accent:'#1b2a4a',collar:'crew',number:4,textColor:'#1b2a4a',font:'classic',crest:{shape:'shield',initials:'MC',icon:'star',fill:'#6cb4ee',ring:'#1b2a4a',ink:'#f7f3ea'},sponsor:'tikitaka'}},
 {id:'golden',label:'Golden fade',design:{...DEFAULT_JERSEY,pattern:'fade',primary:'#ffd23f',secondary:'#ff6b5b',accent:'#7a4b2a',collar:'polo',number:1,textColor:'#7a4b2a',font:'college',crest:{shape:'diamond',initials:'GF',icon:'palm',fill:'#7a4b2a',ring:'#ffd23f',ink:'#ffd23f'},sponsor:'none'}},
 // v2: six more starters (all original island looks)
 {id:'reef',label:'Reef chevron',design:{...DEFAULT_JERSEY,pattern:'chevron',primary:'#f7f3ea',secondary:'#2ec4d6',accent:'#ff6b5b',collar:'vneck',number:6,textColor:'#1b2a4a',font:'rounded',crest:{shape:'roundel',initials:'RC',icon:'wave',fill:'#2ec4d6',ring:'#ff6b5b',ink:'#f7f3ea'},sponsor:'tikitaka'}},
 {id:'volcano',label:'Volcano quarters',design:{...DEFAULT_JERSEY,pattern:'quarters',primary:'#d7263d',secondary:'#15171a',accent:'#ff9f1c',collar:'crew',number:5,textColor:'#ff9f1c',font:'classic',crest:{shape:'shield',initials:'VQ',icon:'star',fill:'#15171a',ring:'#ff9f1c',ink:'#d7263d'},sponsor:'rabona'}},
 {id:'flamingo',label:'Flamingo pins',design:{...DEFAULT_JERSEY,pattern:'pinstripes',primary:'#ff8fb8',secondary:'#f7f3ea',accent:'#7b4bb7',collar:'polo',number:7,textColor:'#7b4bb7',font:'brush',crest:{shape:'diamond',initials:'FP',icon:'palm',fill:'#7b4bb7',ring:'#f7f3ea',ink:'#ff8fb8'},sponsor:'panenka'}},
 {id:'keeper',label:'Keeper lime',design:{...DEFAULT_JERSEY,pattern:'solid',primary:'#a3d93a',secondary:'#15171a',accent:'#15171a',collar:'crew',sleeves:'long',number:1,textColor:'#15171a',font:'classic',crest:{shape:'shield',initials:'GK',icon:'ball',fill:'#15171a',ring:'#a3d93a',ink:'#a3d93a'},sponsor:'none'}},
 {id:'navy',label:'Classic navy',design:{...DEFAULT_JERSEY,pattern:'hoops',primary:'#1b2a4a',secondary:'#f7f3ea',accent:'#d7263d',collar:'polo',number:2,textColor:'#f7f3ea',font:'college',crest:{shape:'shield',initials:'CN',icon:'star',fill:'#f7f3ea',ring:'#d7263d',ink:'#1b2a4a'},sponsor:'nutmeg'}},
 {id:'mint',label:'Mint waves',design:{...DEFAULT_JERSEY,pattern:'waves',primary:'#9fe3c8',secondary:'#2554c7',accent:'#f7f3ea',collar:'vneck',number:3,textColor:'#2554c7',font:'rounded',crest:{shape:'roundel',initials:'MW',icon:'wave',fill:'#2554c7',ring:'#f7f3ea',ink:'#9fe3c8'},sponsor:'topbins'}},
];

/**
 * Curated kit palettes (main, second, trim): colours that always look good together. Used by "Kit palettes" (one tap sets all
 * three) and by Randomise, so a shuffle never lands on a muddy mix.
 */
export const KIT_PALETTES:{id:string;label:string;colors:[string,string,string]}[]=[
 {id:'lagoon',label:'Lagoon',colors:['#2ec4d6','#f7f3ea','#1b2a4a']},
 {id:'sunset',label:'Sunset',colors:['#7b4bb7','#ff9f1c','#ffd23f']},
 {id:'jungle',label:'Jungle',colors:['#1f5c3f','#a3d93a','#f1e2bf']},
 {id:'coral',label:'Coral',colors:['#ff6b5b','#1b2a4a','#f7f3ea']},
 {id:'royal',label:'Royal',colors:['#2554c7','#f7f3ea','#ffd23f']},
 {id:'cherry',label:'Cherry',colors:['#d7263d','#f7f3ea','#15171a']},
 {id:'mango',label:'Mango',colors:['#ff9f1c','#15171a','#f7f3ea']},
 {id:'night',label:'Night',colors:['#15171a','#2ec4d6','#ffd23f']},
 {id:'flamingo',label:'Flamingo',colors:['#ff8fb8','#1b2a4a','#f7f3ea']},
 {id:'sand',label:'Sand',colors:['#d9b77e','#7a4b2a','#f7f3ea']},
 {id:'mint',label:'Mint',colors:['#9fe3c8','#2554c7','#f7f3ea']},
 {id:'sky',label:'Sky',colors:['#6cb4ee','#f7f3ea','#1b2a4a']},
 {id:'sunshine',label:'Sunshine',colors:['#ffd23f','#2e9e5b','#15171a']},
 {id:'grape',label:'Grape',colors:['#7b4bb7','#9fe3c8','#f7f3ea']},
];

// ---- Text safety --------------------------------------------------------------------------------------------------------
// Names: letters, spaces and hyphens only (A–Z), at most 12 characters, filtered through a small blocklist. The lists are
// stored REVERSED so the source never spells rude words or real clubs and kit makers (tests/shop-jersey.cjs greps for them).
const rev=(s:string)=>s.split('').reverse().join('');
/** Rude words: blocked anywhere inside the squashed name (spaces/hyphens removed). */
const BLOCK_ANYWHERE=["kcuf","tihs","hctib","tnuc","ssip","reggin","aggin","toggaf","erohw","tuls","sinep","anigav","nrop","drater","knaw","tawt","kcollob","dratsab","odlid","tsipar","reltih","boob"].map(rev);
/** Short or mean words: blocked only as a whole word (so names like CASSIE, HANCOCK or DIEGO pass). */
const BLOCK_WORD=["ssa","esra","ttub","oop","poop","eep","kcid","kcoc","gaf","xes","nmad","lleh","parc","llik","eid","bmud","ekyd","tit","stit","eoh","kkk","muc","ftw","kcf","kuf","yxes","diputs","toidi","resol","izan"].map(rev);
/** Real clubs and kit makers: the studio asks for an island name instead (no replicas). Long ones anywhere, short ones as words. */
const BLOCK_REAL=["lanesra","aeslehc","looprevil","anolecrab","acrab","dirdam","sutnevuj","nreyab","dtunam","yticnam","mahnettot","ekin","sadida","orbmu","lemmuh","norcam","aerre","ecnalabwen","setarime","dahite"].map(rev);
const BLOCK_REAL_WORD=["gsp","srups","amup","appak","amoj"].map(rev);

/** Keep only letters, spaces and hyphens; collapse spaces; at most NAME_MAX characters. Case is kept (printed in capitals). */
export function cleanName(raw:string):string{
 return String(raw??'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z \-]/g,'').replace(/\s+/g,' ').replace(/-{2,}/g,'-').replace(/^[\s-]+/,'').slice(0,NAME_MAX);
}
/** null when the name is fine to print; otherwise a short, kind message for the child. */
export function nameProblem(raw:string):string|null{
 const name=String(raw??'');
 if(name.length>NAME_MAX)return `Up to ${NAME_MAX} letters.`;
 if(/[^A-Za-z \-]/.test(name))return 'Letters, spaces and hyphens only.';
 const squashed=name.toLowerCase().replace(/[\s-]/g,'');
 if(!squashed)return null;
 const words=name.toLowerCase().split(/[\s-]+/).filter(Boolean);
 if(BLOCK_ANYWHERE.some(w=>squashed.includes(w))||words.some(w=>BLOCK_WORD.includes(w)))return 'Let’s pick a different name.';
 if(BLOCK_REAL.some(w=>squashed.includes(w))||words.some(w=>BLOCK_REAL_WORD.includes(w)))return 'Make up your own island name!';
 return null;
}
/** Crest initials: 1–3 capital letters, checked against the same lists. */
export function cleanInitials(raw:string):string{return String(raw??'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);}
export function initialsOk(s:string):boolean{const c=cleanInitials(s);return c.length>=1&&c===s&&nameProblem(c)==null&&!BLOCK_WORD.includes(c.toLowerCase());}
export function cleanNumber(raw:unknown):number|null{
 if(raw===null||raw===''||raw===undefined)return null;
 const n=typeof raw==='number'?raw:Number(String(raw).replace(/[^0-9]/g,''));
 if(!Number.isFinite(n))return null;return Math.max(0,Math.min(99,Math.round(n)));
}

// ---- Colour helpers -----------------------------------------------------------------------------------------------------
export const isHex=(s:unknown):s is string=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);
export function hexToRgb(h:string):[number,number,number]{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}
export function luminance(h:string):number{const c=hexToRgb(h).map(v=>{const s=v/255;return s<=.03928?s/12.92:((s+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
export function contrast(a:string,b:string):number{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
/** The palette colour that reads best on `bg` (for auto text colour). */
export function bestInk(bg:string,options:string[]=[DEFAULT_JERSEY.secondary,'#15171a','#f7f3ea']):string{return options.slice().sort((a,b)=>contrast(b,bg)-contrast(a,bg))[0];}

// ---- Validation -----------------------------------------------------------------------------------------------------------
const oneOf=<T extends string>(v:unknown,list:{id:T}[],fallback:T):T=>list.some(x=>x.id===v)?v as T:fallback;
export interface JerseyValidation{ok:boolean;design:JerseyDesign;errors:string[]}
/**
 * Checks any value (e.g. parsed localStorage, or a design handed to onBuy) against the schema. `design` is always a safe,
 * complete JerseyDesign: every bad field falls back to DEFAULT_JERSEY's value and is listed in `errors`.
 */
export function validateJersey(input:unknown):JerseyValidation{
 const d=(input&&typeof input==='object'?input:{}) as Record<string,unknown>,errors:string[]=[];
 const pick=<T>(key:string,ok:boolean,value:T,fallback:T):T=>{if(!ok){errors.push(key);return fallback;}return value;};
 const D=DEFAULT_JERSEY;
 const c=(d.crest&&typeof d.crest==='object'?d.crest:{}) as Record<string,unknown>;
 const name=typeof d.name==='string'?d.name:'';
 const nameOk=typeof d.name==='string'&&cleanName(name)===name&&nameProblem(name)==null;
 const num=d.number;
 const numOk=num===null||(typeof num==='number'&&Number.isInteger(num)&&num>=0&&num<=99);
 const initials=typeof c.initials==='string'?c.initials:'';
 const design:JerseyDesign={
  v:1,
  sleeves:pick('sleeves',SLEEVES.some(x=>x.id===d.sleeves),oneOf(d.sleeves,SLEEVES,D.sleeves),D.sleeves),
  collar:pick('collar',COLLARS.some(x=>x.id===d.collar),oneOf(d.collar,COLLARS,D.collar),D.collar),
  cuffs:pick('cuffs',typeof d.cuffs==='boolean',d.cuffs as boolean,D.cuffs),
  pattern:pick('pattern',PATTERNS.some(x=>x.id===d.pattern),oneOf(d.pattern,PATTERNS,D.pattern),D.pattern),
  primary:pick('primary',isHex(d.primary),String(d.primary).toLowerCase(),D.primary),
  secondary:pick('secondary',isHex(d.secondary),String(d.secondary).toLowerCase(),D.secondary),
  accent:pick('accent',isHex(d.accent),String(d.accent).toLowerCase(),D.accent),
  name:pick('name',nameOk,name,''),
  number:pick('number',numOk,num as number|null,D.number),
  font:pick('font',FONTS.some(x=>x.id===d.font),oneOf(d.font,FONTS,D.font),D.font),
  outline:pick('outline',typeof d.outline==='boolean',d.outline as boolean,D.outline),
  frontNumber:pick('frontNumber',typeof d.frontNumber==='boolean',d.frontNumber as boolean,D.frontNumber),
  textColor:pick('textColor',isHex(d.textColor),String(d.textColor).toLowerCase(),D.textColor),
  crest:{
   shape:pick('crest.shape',CREST_SHAPES.some(x=>x.id===c.shape),oneOf(c.shape,CREST_SHAPES,D.crest.shape),D.crest.shape),
   initials:pick('crest.initials',initials===''||initialsOk(initials),initials,D.crest.initials),
   icon:pick('crest.icon',CREST_ICONS.some(x=>x.id===c.icon),oneOf(c.icon,CREST_ICONS,D.crest.icon),D.crest.icon),
   fill:pick('crest.fill',isHex(c.fill),String(c.fill).toLowerCase(),D.crest.fill),
   ring:pick('crest.ring',isHex(c.ring),String(c.ring).toLowerCase(),D.crest.ring),
   ink:pick('crest.ink',isHex(c.ink),String(c.ink).toLowerCase(),D.crest.ink),
  },
  sponsor:pick('sponsor',SPONSORS.some(x=>x.id===d.sponsor),oneOf(d.sponsor,SPONSORS,D.sponsor),D.sponsor),
 };
 // the drawing: optional; a bad or oversized one is dropped whole (never half-drawn) and reported as 'art'
 const art=validateArt(d.art);
 if(!art.ok)errors.push('art');
 if(art.art)design.art=art.art;
 if(d.v!==1)errors.push('v');
 return{ok:errors.length===0,design,errors};
}
export const sameJersey=(a:JerseyDesign,b:JerseyDesign)=>JSON.stringify(a)===JSON.stringify(b);

// ---- History (undo / redo) -----------------------------------------------------------------------------------------------------
/** The studio's undo stack. Every edit is one step; edits with the same `key` within 0.9 s merge (typing, colour dragging). Each
 *  drawn stroke, stamp or fill arrives as its own 'set' (no key), so undo / redo work per stroke. 60 steps are kept. */
export interface JerseyHist{design:JerseyDesign;past:JerseyDesign[];future:JerseyDesign[];key:string;at:number}
export type JerseyHistAct={type:'set';design:JerseyDesign;key?:string;now?:number}|{type:'undo'}|{type:'redo'};
export const JERSEY_UNDO_MAX=60;
export function jerseyHistory(s:JerseyHist,a:JerseyHistAct):JerseyHist{
 if(a.type==='undo'){if(!s.past.length)return s;return{design:s.past[s.past.length-1],past:s.past.slice(0,-1),future:[s.design,...s.future],key:'',at:0};}
 if(a.type==='redo'){if(!s.future.length)return s;return{design:s.future[0],past:[...s.past,s.design],future:s.future.slice(1),key:'',at:0};}
 if(a.design===s.design||sameJersey(a.design,s.design))return s;
 const now=a.now??Date.now(),merge=!!a.key&&a.key===s.key&&now-s.at<900;
 return{design:a.design,past:merge?s.past:[...s.past,s.design].slice(-JERSEY_UNDO_MAX),future:[],key:a.key??'',at:now};
}

// ---- Price -------------------------------------------------------------------------------------------------------------------
/** Base price plus a few clear extras (shown as a receipt in the studio). The shop owns these numbers: the studio and its
 *  tests read them from here (jerseyPrice / jerseyPriceParts / JERSEY_PRICES) and never hard-code a price. */
// Oct 12 2026 (user: "make them pricier"): about 2.5× the first prices, a jersey is something to save up for over several days.
// v2: a small extra for a hand-drawn design (the studio and the till read it from here).
// Oct 14 2026 (docs/economy.md): base 300 → 330 (the user's floor is 300); the numbers live in lib/economy.ts JERSEY_PRICES.
export {JERSEY_PRICES} from '../economy';
import {JERSEY_PRICES} from '../economy';
export const JERSEY_BASE_PRICE=JERSEY_PRICES.base;
export function jerseyPriceParts(d:JerseyDesign):{label:string;coins:number}[]{
 const P=JERSEY_PRICES,parts=[{label:'Custom jersey',coins:P.base}];
 if(d.sleeves==='long')parts.push({label:'Long sleeves',coins:P.longSleeves});
 if(d.collar==='polo'||d.collar==='wrap')parts.push({label:d.collar==='polo'?'Polo collar':'Wrap collar',coins:P.collar});
 if(d.name.trim()||d.number!=null)parts.push({label:'Name & number print',coins:P.print});
 if(hasArt(d))parts.push({label:'Your own drawing',coins:P.drawing});
 return parts;
}
export const hasArt=(d:Pick<JerseyDesign,'art'>)=>!!d.art&&artStats(d.art).ops>0;
export function jerseyPrice(d:JerseyDesign):number{return jerseyPriceParts(validateJersey(d).design).reduce((a,p)=>a+p.coins,0);}

// ---- Randomise -------------------------------------------------------------------------------------------------------------
/** Applies a curated palette (main, second, trim) with matching print and crest colours. */
export function applyPalette(d:JerseyDesign,colors:readonly[string,string,string]):JerseyDesign{
 const [primary,secondary,accent]=colors;
 const textColor=bestInk(primary,[accent,secondary,'#f7f3ea','#15171a']);
 return{...d,primary,secondary,accent,textColor,crest:{...d.crest,fill:secondary,ring:accent,ink:bestInk(secondary,[primary,accent,'#f7f3ea','#15171a'])}};
}
/**
 * A fresh, good-looking random design: colours come from KIT_PALETTES (always harmonious), sometimes with main and second
 * swapped. Keeps the child's name, number, crest initials and drawing.
 */
export function randomJersey(keep:Pick<JerseyDesign,'name'|'number'>&Partial<Pick<JerseyDesign,'art'|'crest'>>,rand:()=>number=Math.random):JerseyDesign{
 const any=<T>(a:readonly T[])=>a[Math.floor(rand()*a.length)%a.length];
 const pal=any(KIT_PALETTES).colors,swap=rand()<.35&&contrast(pal[1],pal[2])>=1.5;
 const colors:[string,string,string]=swap?[pal[1],pal[0],pal[2]]:[pal[0],pal[1],pal[2]];
 const base:JerseyDesign={v:1,sleeves:rand()<.7?'short':'long',collar:any(COLLARS).id,cuffs:rand()<.75,pattern:any(PATTERNS).id,primary:colors[0],secondary:colors[1],accent:colors[2],
  name:keep.name,number:keep.number,font:any(FONTS).id,outline:rand()<.6,frontNumber:rand()<.7,textColor:colors[2],
  crest:{shape:any(CREST_SHAPES).id,initials:keep.crest?.initials??DEFAULT_JERSEY.crest.initials,icon:any(CREST_ICONS.filter(i=>i.id!=='none')).id,fill:colors[1],ring:colors[2],ink:colors[0]},
  sponsor:any(SPONSORS).id};
 const d=applyPalette(base,colors);
 if(keep.art)d.art=keep.art;
 return d;
}

// ---- Storage -----------------------------------------------------------------------------------------------------------------
type StorageLike={getItem(k:string):string|null;setItem(k:string,v:string):void};
const store=():StorageLike|null=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export function emptySave(current:JerseyDesign=DEFAULT_JERSEY):JerseySave{return{v:1,current,slots:Array.from({length:JERSEY_SLOTS},()=>null),updatedAt:0};}
/**
 * Migrates any stored shape to a JerseySave: the v1 save (with or without drawings), a bare design stored on its own (very
 * early builds), slots as an object map, too many or too few slots. Pure; validation happens in loadJerseySave.
 */
export function migrateJerseySave(o:unknown):Record<string,unknown>{
 if(!o||typeof o!=='object'||Array.isArray(o))return{};
 const r=o as Record<string,unknown>;
 // a bare design (no current/slots): treat it as the design in progress
 if(!('current' in r)&&!('slots' in r)&&('pattern' in r||'primary' in r))return{v:1,current:r,slots:[],updatedAt:0};
 let slots=r.slots;
 if(slots&&typeof slots==='object'&&!Array.isArray(slots))slots=Object.keys(slots).sort().map(k=>(slots as Record<string,unknown>)[k]);
 return{...r,slots:Array.isArray(slots)?slots.slice(0,JERSEY_SLOTS):[]};
}
/** Reads, migrates and validates the save (bad slots are dropped, a bad design or drawing is repaired). Never throws. */
export function loadJerseySave(s:StorageLike|null=store()):JerseySave{
 try{
  const raw=s?.getItem(JERSEY_KEY);if(!raw)return emptySave();
  const o=migrateJerseySave(JSON.parse(raw));
  const slotsIn=Array.isArray(o.slots)?o.slots:[];
  const slots=Array.from({length:JERSEY_SLOTS},(_,i)=>{const sl=slotsIn[i] as Record<string,unknown>|null;if(!sl||typeof sl!=='object')return null;
   const name=typeof sl.name==='string'?cleanName(sl.name)||`Design ${i+1}`:`Design ${i+1}`;
   return{name,design:validateJersey(sl.design).design,savedAt:typeof sl.savedAt==='number'?sl.savedAt:0};});
  return{v:1,current:validateJersey(o.current).design,slots,updatedAt:typeof o.updatedAt==='number'?o.updatedAt:0};
 }catch{return emptySave();}
}
export function writeJerseySave(save:JerseySave,s:StorageLike|null=store()):boolean{
 try{s?.setItem(JERSEY_KEY,JSON.stringify({...save,updatedAt:Date.now()}));return!!s;}catch{return false;}
}
