/**
 * Football shop · Ball studio data (Oct 12 2026). The design a kid builds in components/shop/BallStudio.tsx: the panel
 * construction, the panel-group colours, a pattern layer, the finish, up to MAX_DECALS stickers/flags/quotes/name/number, the
 * ball size (3/4/5) and the futsal variant. Pure data + validation (no DOM, no three.js), so tests/shop-ball.cjs runs it in Node.
 *
 * Storage: one localStorage key, BALL_KEY, holding {v:2,current,slots,art,bought}: the in-progress design (auto-saved), 3 named
 * slots (each with a small thumbnail), and the ART POOL: the kid's drawings (Draw step, lib/shop/ballPaint.ts) as small WebP/PNG
 * data URLs keyed by their hash. Designs only carry the drawing's id (design.art.id), so the shop's bought-items key
 * (fi2-shop-owned-v1, up to 36 designs) never holds pixels. v1 stores (no drawings, no thumbnails) load as-is (migrated).
 * The shop syncs BALL_KEY with the save code (lib/saves SYNC_KEYS). Size budget (lib/saves/snapshot.ts: 256 KB per key,
 * 128 KB gzip per save): a drawing ≤ DRAW_MAX_CHARS (16 000 chars ≈ 12 KB), the whole pool ≤ ART_POOL_MAX (64 000 chars),
 * a slot thumbnail ≤ THUMB_MAX (6 000 chars); so BALL_KEY stays under ≈ 90 000 chars in the worst case.
 *
 * Every ball is an ORIGINAL design: panel layouts are generic geometry (truncated icosahedron etc.), patterns are abstract
 * shapes, stickers are our own drawings and the flags are simplified self-drawn flags (lib/shop/ballArt.ts). No maker marks,
 * no tournament names.
 */
import {BALL_PRICES} from '../economy';
export const BALL_KEY='fi2-shop-ball-v1';
export const MAX_DECALS=8;
export const SLOT_COUNT=3;
export const NAME_MAX=12;
/** Drawing budget (characters of a data URL; base64 ≈ 4/3 of the image bytes). */
export const DRAW_MAX_CHARS=16000,ART_POOL_MAX=64000,THUMB_MAX=6000,BOUGHT_KEEP=4;
export const DRAW_URL=/^data:image\/(?:webp|png);base64,[A-Za-z0-9+/]+={0,2}$/;
const THUMB_URL=/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/;
/** True when a stored drawing is acceptable: an inline WebP/PNG data URL under the cap (no links, no other formats). */
export const isDrawUrl=(v:unknown):v is string=>typeof v==='string'&&v.length<=DRAW_MAX_CHARS&&DRAW_URL.test(v);
/** FNV-1a (two passes) of a string as base36: the id a drawing is stored under. */
export function artHash(s:string):string{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}
 let h2=0x01000193^s.length;for(let i=s.length-1;i>=0;i-=7){h2^=s.charCodeAt(i);h2=Math.imul(h2,0x811c9dc5);}return (h>>>0).toString(36)+(h2>>>0).toString(36).slice(0,4);}
const ART_ID=/^[a-z0-9]{1,13}$/;

export type BallLayout='classic32'|'panel26'|'panel14'|'propeller6'|'panel8'|'leather18';
export type BallFinish='gloss'|'matte'|'dimple'|'leather'|'holo'|'metal';
export type PatternKind='none'|'stripes'|'swoosh'|'stars'|'splatter'|'gradient'|'confetti'|'waves'|'flames';
export type PatternTarget='all'|'a'|'b'|'c';
export type DecalKind='sticker'|'flag'|'quote'|'name'|'number';
export type BallSize=3|4|5;
export type Vec3=[number,number,number];
/** A decal on the ball: `dir` is the unit direction of its centre in ball space, `rot` its turn (radians) about that
 *  direction from the local north, `size` its half-height in radians (≈ sphere radii). `ref` is the sticker id, the flag
 *  code, the quote id, the filtered name, or the number as text. `color` tints text decals. */
export type BallDecal={id:string;kind:DecalKind;ref:string;color:string;dir:Vec3;rot:number;size:number};
/** What the kid drew (Draw step): `id` names a drawing in the store's art pool ('' = none); `fills` are per-panel colours
 *  ('' = not filled), indexed by the shader's panel id for this layout (lib/shop/ballPanels.ts), [] when nothing is filled. */
export type BallArt={id:string;fills:string[]};
export type BallDesign={
 v:1;
 layout:BallLayout;
 colors:{a:string;b:string;c:string};
 pattern:{kind:PatternKind;c1:string;c2:string;on:PatternTarget;seed:number};
 finish:BallFinish;
 decals:BallDecal[];
 size:BallSize;
 futsal:boolean;
 art:BallArt;
};

/** Panel constructions. `groups` are the colour groups the Colours step offers (A, B, C). */
export const LAYOUTS:readonly {id:BallLayout;label:string;panels:number;groups:readonly string[];fact:string}[]=[
 {id:'classic32',label:'Classic',panels:32,groups:['Pentagons','Hexagons'],fact:'12 pentagons + 20 hexagons. Dark pentagons made the ball easy to follow on black-and-white TV.'},
 {id:'panel26',label:'Star 26',panels:26,groups:['Big squares','Side squares','Triangles'],fact:'18 squares and 8 triangles. More panels means more seams, which help the ball grip the air.'},
 {id:'panel14',label:'Smooth 14',panels:14,groups:['Squares','Hexagons'],fact:'Fewer panels make a rounder, smoother ball with fewer seams to bump against your foot.'},
 {id:'propeller6',label:'Propeller 6',panels:6,groups:['Panel pair 1','Panel pair 2','Panel pair 3'],fact:'6 identical propeller panels lock together like a puzzle, so the ball is the same all the way round.'},
 {id:'panel8',label:'Wave 8',panels:8,groups:['Panels A','Panels B'],fact:'8 heat-bonded panels with wavy seams. Bonded seams keep water out on rainy match days.'},
 {id:'leather18',label:'Retro leather',panels:18,groups:['Outer strips','Middle strips','Laces'],fact:'Old balls had 18 leather strips and laces over the air valve. In the rain they got heavy!'},
];
export const FINISHES:readonly {id:BallFinish;label:string;fact:string}[]=[
 {id:'gloss',label:'Glossy',fact:'A shiny coat sheds water and looks great under stadium lights.'},
 {id:'matte',label:'Matte',fact:'A soft matte skin gives a little more grip when you strike it.'},
 {id:'dimple',label:'Dimples',fact:'Tiny dimples help the air flow round the ball so it flies steadier, a bit like a golf ball.'},
 {id:'leather',label:'Leather',fact:'Real leather soaks up water. Modern balls use synthetic skins that stay light.'},
 {id:'holo',label:'Holo',fact:'A rainbow foil on the first panel group that shifts colour as the ball turns.'},
 {id:'metal',label:'Metallic',fact:'Shiny metal accents on your pattern (or the second panels when there is no pattern).'},
];
export const PATTERNS:readonly {id:PatternKind;label:string}[]=[
 {id:'none',label:'None'},{id:'stripes',label:'Stripes'},{id:'swoosh',label:'Swirls'},{id:'stars',label:'Stars'},{id:'splatter',label:'Splatter'},
 {id:'gradient',label:'Fade'},{id:'confetti',label:'Confetti'},{id:'waves',label:'Waves'},{id:'flames',label:'Flames'},
];
export const SIZES:readonly {id:BallSize;label:string;note:string}[]=[
 {id:3,label:'Size 3',note:'Under 8s. Light and small for little feet.'},
 {id:4,label:'Size 4',note:'Ages 8 to 12. Most island kids play with this one.'},
 {id:5,label:'Size 5',note:'Ages 12+ and grown-ups. The full match ball.'},
];
export const FUTSAL_NOTE='Futsal balls are heavier with a low bounce, so they stay on the floor of hard indoor courts.';

/** The curated kid palette (sRGB hex). The custom picker allows any colour on top. */
export const PALETTE:readonly {hex:string;name:string}[]=[
 {hex:'#f7f4ec',name:'Chalk white'},{hex:'#1d1f24',name:'Night black'},{hex:'#e8423f',name:'Rocket red'},{hex:'#ff8a2a',name:'Mango'},
 {hex:'#ffd23f',name:'Sunshine'},{hex:'#b6e34a',name:'Lime'},{hex:'#2fb36d',name:'Pitch green'},{hex:'#1fb5b0',name:'Lagoon'},
 {hex:'#3aa7ff',name:'Sky'},{hex:'#2d4fd6',name:'Ocean blue'},{hex:'#1c2a5e',name:'Navy'},{hex:'#8a5cf6',name:'Grape'},
 {hex:'#ff6fb5',name:'Bubblegum'},{hex:'#c9a066',name:'Sand'},{hex:'#8b5a2b',name:'Leather'},{hex:'#9aa3ad',name:'Silver'},
];

/** Curated quotes: short, kind, about how we play. Kids pick; they never type a quote. */
export const QUOTES:readonly {id:string;text:string}[]=[
 {id:'team-first',text:'Team first'},{id:'dream-big',text:'Dream big'},{id:'play-fair',text:'Play fair'},{id:'never-give-up',text:'Never give up'},
 {id:'pass-and-move',text:'Pass & move'},{id:'have-fun',text:'Have fun'},{id:'be-brave',text:'Be brave'},{id:'work-hard',text:'Work hard'},
 {id:'kind-and-strong',text:'Kind & strong'},{id:'one-team',text:'One team'},
];
export const STICKER_IDS=['star','flame','bolt','crown','heart','paw','palm','planet','rocket','rainbow','smile','ball'] as const;
export type StickerId=typeof STICKER_IDS[number];
/** Simplified self-drawn flags (drawn in lib/shop/ballArt.ts). Code = ISO 3166 alpha-2 (gb-eng/gb-sct for home nations). */
export const FLAGS:readonly {code:string;name:string}[]=[
 {code:'ar',name:'Argentina'},{code:'au',name:'Australia'},{code:'be',name:'Belgium'},{code:'br',name:'Brazil'},{code:'ca',name:'Canada'},
 {code:'cm',name:'Cameroon'},{code:'ch',name:'Switzerland'},{code:'cl',name:'Chile'},{code:'co',name:'Colombia'},{code:'de',name:'Germany'},
 {code:'dk',name:'Denmark'},{code:'es',name:'Spain'},{code:'fr',name:'France'},{code:'gb',name:'United Kingdom'},{code:'gb-eng',name:'England'},
 {code:'gb-sct',name:'Scotland'},{code:'gh',name:'Ghana'},{code:'gr',name:'Greece'},{code:'hr',name:'Croatia'},{code:'ie',name:'Ireland'},
 {code:'it',name:'Italy'},{code:'jm',name:'Jamaica'},{code:'jp',name:'Japan'},{code:'kr',name:'South Korea'},{code:'ma',name:'Morocco'},
 {code:'mx',name:'Mexico'},{code:'ng',name:'Nigeria'},{code:'nl',name:'Netherlands'},{code:'no',name:'Norway'},{code:'nz',name:'New Zealand'},
 {code:'pl',name:'Poland'},{code:'pt',name:'Portugal'},{code:'se',name:'Sweden'},{code:'sn',name:'Senegal'},{code:'ua',name:'Ukraine'},
 {code:'us',name:'United States'},{code:'uy',name:'Uruguay'},{code:'vn',name:'Vietnam'},{code:'ph',name:'Philippines'},{code:'in',name:'India'},
];

export const DEFAULT_BALL:BallDesign=Object.freeze({
 v:1,layout:'classic32',colors:{a:'#1d1f24',b:'#f7f4ec',c:'#ffd23f'},
 pattern:{kind:'none',c1:'#e8423f',c2:'#ffd23f',on:'all',seed:7},finish:'gloss',decals:[],size:4,futsal:false,art:{id:'',fills:[]},
}) as BallDesign;

const LAYOUT_IDS=LAYOUTS.map(l=>l.id),FINISH_IDS=FINISHES.map(f=>f.id),PATTERN_IDS=PATTERNS.map(p=>p.id);
const DECAL_KINDS:readonly DecalKind[]=['sticker','flag','quote','name','number'];
export const layoutInfo=(id:BallLayout)=>LAYOUTS.find(l=>l.id===id)??LAYOUTS[0];

// ---- Text safety --------------------------------------------------------------------------------------------------------
/** Words a kid's name decal may not contain (checked on a squashed, de-leeted form, so "b-u-m" and "8um" are caught too). */
const BLOCK=['ass','arse','bum','butt','poo','poop','pee','wee','fart','crap','damn','hell','shit','fuck','fck','fuk','piss','dick','cock','penis','vagina','boob','tit','titty',
 'bitch','bastard','slut','whore','sex','sexy','porn','nude','naked','kill','die','dead','hate','stupid','idiot','dumb','loser','ugly','fat','moron','retard','nazi','hitler',
 'cunt','twat','wank','wanker','bollock','prick','jerk','suck','sucks','nigger','nigga','fag','faggot','paki','chink','spic','kike','drug','weed','beer','vodka'];
/** Short words that are fine inside longer names ("Cassie", "Hellen", "Matt") and only block as a whole word. */
const WHOLE_ONLY=new Set(['ass','arse','bum','poo','pee','wee','hell','tit','die','dead','fat','sex','kill','hate','dumb','jerk','suck','weed','beer','drug','dick','cock','crap','fag','paki','chink','spic','kike','nazi','fuk','fck','butt']);
const LEET:Record<string,string>={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s','!':'i'};
const squash=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[0-9@$!]/g,c=>LEET[c]??c).replace(/[^a-z\s]/g,'');
/** Keep only letters, spaces and hyphens; collapse runs of spaces; at most NAME_MAX characters. */
export function filterNameInput(raw:string):string{
 return String(raw??'').normalize('NFC').replace(/[^\p{L}\s-]/gu,'').replace(/\s+/g,' ').replace(/-{2,}/g,'-').replace(/^[\s-]+/,'').slice(0,NAME_MAX);
}
/** True when a (filtered) name is allowed on a ball: non-empty, only letters/spaces/hyphens, ≤ 12, no blocked word. */
export function isNameAllowed(name:string):boolean{
 const n=String(name??'').trim();if(!n||n.length>NAME_MAX||!/^[\p{L}][\p{L} -]*$/u.test(n))return false;
 return !hasBlockedWord(n);
}
/** True when text contains a blocked word (whole word for short ones, anywhere for the rest; leetspeak and spacing undone). */
export function hasBlockedWord(text:string):boolean{
 const words=squash(String(text??'')).split(/[\s-]+/).filter(Boolean),joined=words.join('');
 for(const b of BLOCK){if(words.includes(b))return true;if(!WHOLE_ONLY.has(b)&&joined.includes(b))return true;}
 return false;
}
export const SLOT_NAME_MAX=16;
/** A save-slot label: letters, digits, spaces and hyphens, ≤ 16. */
export function filterSlotName(raw:string):string{return String(raw??'').normalize('NFC').replace(/[^\p{L}\p{N}\s-]/gu,'').replace(/\s+/g,' ').replace(/^[\s-]+/,'').slice(0,SLOT_NAME_MAX);}
/** The shirt number on a ball: an integer 0–99, or null. */
export function cleanNumber(raw:unknown):number|null{
 const s=String(raw??'').trim();if(!/^\d{1,2}$/.test(s))return null;const n=Number(s);return n>=0&&n<=99?n:null;
}

// ---- Validation -----------------------------------------------------------------------------------------------------------
const HEX=/^#[0-9a-f]{6}$/i;
const hex=(v:unknown,fb:string)=>typeof v==='string'&&HEX.test(v)?v.toLowerCase():fb;
const num=(v:unknown,fb:number,lo:number,hi:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):fb;
const pick=<T extends string>(v:unknown,ok:readonly T[],fb:T):T=>ok.includes(v as T)?v as T:fb;
export const DECAL_SIZE={min:.1,max:.55};
function cleanDir(v:unknown):Vec3|null{
 if(!Array.isArray(v)||v.length!==3||!v.every(x=>typeof x==='number'&&Number.isFinite(x)))return null;
 const l=Math.hypot(v[0],v[1],v[2]);if(l<1e-6)return null;return [v[0]/l,v[1]/l,v[2]/l];
}
/** A clean decal, or null when it can't be shown (unknown sticker/flag/quote, blocked name, bad number). */
export function validateDecal(input:unknown,i=0):BallDecal|null{
 if(!input||typeof input!=='object')return null;const d=input as Record<string,unknown>;
 const kind=pick(d.kind,DECAL_KINDS,'sticker'),dir=cleanDir(d.dir);if(!dir||d.kind!==kind)return null;
 let ref=typeof d.ref==='string'?d.ref:'';
 if(kind==='sticker'&&!(STICKER_IDS as readonly string[]).includes(ref))return null;
 if(kind==='flag'&&!FLAGS.some(f=>f.code===ref))return null;
 if(kind==='quote'&&!QUOTES.some(q=>q.id===ref))return null;
 if(kind==='name'){ref=filterNameInput(ref).trim();if(!isNameAllowed(ref))return null;}
 if(kind==='number'){const n=cleanNumber(ref);if(n===null)return null;ref=String(n);}
 const id=typeof d.id==='string'&&/^[\w-]{1,24}$/.test(d.id)?d.id:`d${i}`;
 return {id,kind,ref,color:hex(d.color,'#ffffff'),dir,rot:num(d.rot,0,-Math.PI*4,Math.PI*4),size:num(d.size,.24,DECAL_SIZE.min,DECAL_SIZE.max)};
}
/** Clean any stored or incoming value into a valid design (unknown fields dropped, bad values defaulted, ≤ MAX_DECALS). */
export function validateBall(input:unknown):BallDesign{
 const D=DEFAULT_BALL;if(!input||typeof input!=='object')return cloneBall(D);
 const o=input as Record<string,unknown>,c=(o.colors&&typeof o.colors==='object'?o.colors:{}) as Record<string,unknown>,p=(o.pattern&&typeof o.pattern==='object'?o.pattern:{}) as Record<string,unknown>;
 const decals:BallDecal[]=[];const seen=new Set<string>();
 if(Array.isArray(o.decals))for(const [i,x] of o.decals.entries()){if(decals.length>=MAX_DECALS)break;const d=validateDecal(x,i);if(!d)continue;if(seen.has(d.id))d.id=`d${i}x`;seen.add(d.id);decals.push(d);}
 const size=([3,4,5] as const).includes(o.size as BallSize)?o.size as BallSize:D.size;
 const layout=pick(o.layout,LAYOUT_IDS,D.layout);
 return {v:1,layout,colors:{a:hex(c.a,D.colors.a),b:hex(c.b,D.colors.b),c:hex(c.c,D.colors.c)},
  pattern:{kind:pick(p.kind,PATTERN_IDS,'none'),c1:hex(p.c1,D.pattern.c1),c2:hex(p.c2,D.pattern.c2),on:pick(p.on,['all','a','b','c'] as const,'all'),seed:Math.round(num(p.seed,7,0,9999))},
  finish:pick(o.finish,FINISH_IDS,D.finish),decals,size,futsal:o.futsal===true,art:cleanArt(o.art,layout)};
}
/** A clean art record: a well-formed id, and fills as hex colours sized to the layout's panel count ([] when none is set). */
export function cleanArt(v:unknown,layout:BallLayout):BallArt{
 const a=(v&&typeof v==='object'?v:{}) as Record<string,unknown>,id=typeof a.id==='string'&&ART_ID.test(a.id)?a.id:'';
 const n=layoutInfo(layout).panels,raw=Array.isArray(a.fills)?a.fills:[];
 const fills=Array.from({length:n},(_,i)=>typeof raw[i]==='string'&&HEX.test(raw[i] as string)?(raw[i] as string).toLowerCase():'');
 return {id,fills:fills.some(Boolean)?fills:[]};
}
/** True when the ball carries a drawing or a filled panel (the Draw step's small price extra). */
export const hasArt=(d:BallDesign)=>!!d.art?.id||!!d.art?.fills.some(Boolean);
export function cloneBall(d:BallDesign):BallDesign{return {...d,colors:{...d.colors},pattern:{...d.pattern},decals:d.decals.map(x=>({...x,dir:[...x.dir] as Vec3})),art:{id:d.art?.id??'',fills:[...(d.art?.fills??[])]}};}

// ---- Price ----------------------------------------------------------------------------------------------------------------
// Oct 12 2026 (user: "make them pricier"): about 2.5× the first prices, a ball is something to save up for over a few days.
// Oct 14 2026 (docs/economy.md): base 150 → 160 (the user's floor is 150), extras unchanged; the table lives in lib/economy.ts.
export const PRICE:{base:number;layout:Record<BallLayout,number>;finish:Record<BallFinish,number>;pattern:number;decal:number;size:Record<BallSize,number>;futsal:number;drawing:number}=BALL_PRICES;
/** The ball's price in island coins (whole coins; PRICE.base for a plain classic size-3 ball, base + 270 at most with a drawing). */
export function ballPrice(design:BallDesign):number{
 const d=validateBall(design);
 return PRICE.base+PRICE.layout[d.layout]+PRICE.finish[d.finish]+(d.pattern.kind==='none'?0:PRICE.pattern)+PRICE.decal*d.decals.length+PRICE.size[d.size]+(d.futsal?PRICE.futsal:0)+(hasArt(d)?PRICE.drawing:0);
}
export function priceLines(design:BallDesign):{label:string;coins:number}[]{
 const d=validateBall(design),L=layoutInfo(d.layout),out=[{label:'Ball',coins:PRICE.base}];
 if(PRICE.layout[d.layout])out.push({label:`${L.label} panels`,coins:PRICE.layout[d.layout]});
 if(PRICE.finish[d.finish])out.push({label:`${FINISHES.find(f=>f.id===d.finish)!.label} finish`,coins:PRICE.finish[d.finish]});
 if(d.pattern.kind!=='none')out.push({label:'Pattern',coins:PRICE.pattern});
 if(d.decals.length)out.push({label:`${d.decals.length} sticker${d.decals.length>1?'s':''}`,coins:PRICE.decal*d.decals.length});
 if(PRICE.size[d.size])out.push({label:`Size ${d.size}`,coins:PRICE.size[d.size]});
 if(d.futsal)out.push({label:'Futsal',coins:PRICE.futsal});
 if(hasArt(d))out.push({label:'Your drawing',coins:PRICE.drawing});
 return out;
}

// ---- Presets & randomise --------------------------------------------------------------------------------------------------
const mk=(p:Partial<BallDesign>&{layout:BallLayout}):BallDesign=>validateBall({...cloneBall(DEFAULT_BALL),...p});
const pat=(kind:PatternKind,c1:string,c2:string,seed:number,on:PatternTarget='all')=>({kind,c1,c2,on,seed});
export const PRESETS:readonly {id:string;label:string;design:BallDesign}[]=[
 {id:'classic',label:'Classic black & white',design:mk({layout:'classic32',colors:{a:'#1d1f24',b:'#f7f4ec',c:'#ffd23f'},finish:'gloss'})},
 {id:'night',label:'Night glow',design:mk({layout:'panel8',colors:{a:'#1c2a5e',b:'#8a5cf6',c:'#b6e34a'},pattern:pat('stars','#ffd23f','#3aa7ff',21),finish:'holo'})},
 {id:'sunset',label:'Island sunset',design:mk({layout:'propeller6',colors:{a:'#ff8a2a',b:'#ff6fb5',c:'#ffd23f'},pattern:pat('gradient','#e8423f','#8a5cf6',3),finish:'gloss'})},
 {id:'retro',label:'Retro leather',design:mk({layout:'leather18',colors:{a:'#8b5a2b',b:'#9a6532',c:'#ead7b0'},finish:'leather'})},
 {id:'ocean',label:'Ocean wave',design:mk({layout:'panel14',colors:{a:'#f7f4ec',b:'#1fb5b0',c:'#2d4fd6'},pattern:pat('waves','#2d4fd6','#3aa7ff',5,'a'),finish:'dimple'})},
 {id:'fire',label:'Fire striker',design:mk({layout:'panel26',colors:{a:'#1d1f24',b:'#e8423f',c:'#ffd23f'},pattern:pat('flames','#ff8a2a','#ffd23f',11),finish:'matte'})},
 // Oct 12 2026 (ball studio v2): six more starting points, so a great ball is one tap away.
 {id:'lagoon',label:'Lagoon splash',design:mk({layout:'classic32',colors:{a:'#1fb5b0',b:'#f7f4ec',c:'#ffd23f'},pattern:pat('splatter','#3aa7ff','#ff6fb5',8,'b'),finish:'gloss'})},
 {id:'party',label:'Confetti party',design:mk({layout:'panel14',colors:{a:'#8a5cf6',b:'#f7f4ec',c:'#ffd23f'},pattern:pat('confetti','#ff6fb5','#1fb5b0',14,'b'),finish:'matte'})},
 {id:'lime',label:'Lime zoom',design:mk({layout:'propeller6',colors:{a:'#b6e34a',b:'#1d1f24',c:'#f7f4ec'},pattern:pat('swoosh','#1d1f24','#f7f4ec',4,'a'),finish:'dimple'})},
 {id:'gold',label:'Golden trophy',design:mk({layout:'panel26',colors:{a:'#f7f4ec',b:'#c9a066',c:'#1d1f24'},pattern:pat('stripes','#ffd23f','#1c2a5e',2),finish:'metal'})},
 {id:'sky',label:'Sky stripes',design:mk({layout:'panel8',colors:{a:'#3aa7ff',b:'#f7f4ec',c:'#2d4fd6'},pattern:pat('stripes','#f7f4ec','#ffd23f',9),finish:'gloss'})},
 {id:'mint',label:'Mint chip',design:mk({layout:'panel14',colors:{a:'#1fb5b0',b:'#f7f4ec',c:'#8b5a2b'},pattern:pat('confetti','#8b5a2b','#1d1f24',21,'b'),finish:'matte'})},
 {id:'storm',label:'Thunder storm',design:mk({layout:'panel26',colors:{a:'#1c2a5e',b:'#9aa3ad',c:'#ffd23f'},pattern:pat('swoosh','#ffd23f','#f7f4ec',17),finish:'metal'})},
 {id:'berry',label:'Berry swirl',design:mk({layout:'panel8',colors:{a:'#8a5cf6',b:'#ff6fb5',c:'#f7f4ec'},pattern:pat('swoosh','#f7f4ec','#1c2a5e',6),finish:'holo'})},
 {id:'candy',label:'Candy pop',design:mk({layout:'classic32',colors:{a:'#ff6fb5',b:'#fff6e2',c:'#8a5cf6'},pattern:pat('stars','#8a5cf6','#ffd23f',33,'b'),finish:'holo'})},
];
/** Curated colour families for Randomise: [panel A, panel B, panel C, pattern 1, pattern 2]. Each set is hand-picked to look
 *  good together (a strong colour, a light one, an accent, and two pattern inks with contrast on the light panels). */
export const PALETTES:readonly {name:string;cols:readonly [string,string,string,string,string]}[]=[
 {name:'Classic',cols:['#1d1f24','#f7f4ec','#ffd23f','#e8423f','#ffd23f']},
 {name:'Ocean',cols:['#2d4fd6','#f7f4ec','#1fb5b0','#3aa7ff','#1c2a5e']},
 {name:'Sunset',cols:['#ff8a2a','#fff6e2','#e8423f','#ff6fb5','#8a5cf6']},
 {name:'Jungle',cols:['#2fb36d','#f7f4ec','#b6e34a','#1d1f24','#ffd23f']},
 {name:'Galaxy',cols:['#1c2a5e','#8a5cf6','#ffd23f','#ff6fb5','#3aa7ff']},
 {name:'Candy',cols:['#ff6fb5','#fff6e2','#8a5cf6','#3aa7ff','#ffd23f']},
 {name:'Lava',cols:['#1d1f24','#e8423f','#ff8a2a','#ffd23f','#ff8a2a']},
 {name:'Lagoon',cols:['#1fb5b0','#f7f4ec','#2d4fd6','#ffd23f','#ff6fb5']},
 {name:'Lime',cols:['#b6e34a','#1d1f24','#f7f4ec','#1d1f24','#2fb36d']},
 {name:'Royal',cols:['#1c2a5e','#f7f4ec','#c9a066','#ffd23f','#e8423f']},
 {name:'Berry',cols:['#8a5cf6','#f7f4ec','#ff6fb5','#1c2a5e','#ffd23f']},
 {name:'Sand',cols:['#c9a066','#f7f4ec','#1fb5b0','#8b5a2b','#2d4fd6']},
];
/** A fresh random design from one curated palette (keeps the kid's decals, drawing, size and futsal). `rand` is injectable. */
export function randomBall(keep:BallDesign,rand:()=>number=Math.random):BallDesign{
 const r=<T,>(a:readonly T[])=>a[Math.floor(rand()*a.length)%a.length];
 const P=r(PALETTES).cols,swap=rand()<.4;// sometimes the light colour takes the big panels
 const a=swap?P[1]:P[0],b=swap?P[0]:P[1],c=P[2];
 const layout=r(LAYOUT_IDS),kind=rand()<.3?'none':r(PATTERN_IDS.filter(k=>k!=='none'));
 // Pattern inks go on the panels they contrast with: the light group when there is one.
 const on:PatternTarget=rand()<.5?'all':(swap?'a':'b');
 const art=layout===keep.layout?keep.art:{id:keep.art?.id??'',fills:[]};
 return validateBall({...keep,layout,colors:{a,b,c},pattern:{kind,c1:P[3],c2:P[4],on,seed:Math.floor(rand()*9999)},art,
  finish:layout==='leather18'?'leather':r(FINISH_IDS.filter(f=>f!=='leather'))});
}

// ---- Storage --------------------------------------------------------------------------------------------------------------
export type BallSlot={name:string;design:BallDesign;savedAt:number;thumb?:string};
/** v2 (Oct 12 2026): + `art` (drawing id → data URL) and `bought` (drawing ids of bought balls, newest last). */
export type BallStore={v:2;current:BallDesign;slots:(BallSlot|null)[];art:Record<string,string>;bought:string[]};
type KV={getItem(k:string):string|null;setItem(k:string,v:string):void};
const ls=():KV|null=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export function cleanSlotName(raw:unknown,i:number):string{const n=filterSlotName(String(raw??'')).trim();return n&&/\p{L}/u.test(n)&&!hasBlockedWord(n.replace(/\d/g,' '))?n:`My ball ${i+1}`;}
const cleanThumb=(v:unknown)=>typeof v==='string'&&v.length<=THUMB_MAX&&THUMB_URL.test(v)?v:undefined;
/**
 * Keep only drawings something still uses, most important first (the current design, the slots, then bought balls, newest
 * first), each checked (a WebP/PNG data URL whose hash is its id), within ART_POOL_MAX. A design whose drawing didn't make it
 * loses the id, so the price and the picture always agree.
 */
function packArt(current:BallDesign,slots:(BallSlot|null)[],bought:string[],pool:Record<string,string>):{art:Record<string,string>;bought:string[]}{
 const art:Record<string,string>={};let total=0;
 const keep=(id:string)=>{if(!id)return false;if(art[id])return true;const u=pool[id];if(!isDrawUrl(u)||artHash(u)!==id||total+u.length>ART_POOL_MAX)return false;art[id]=u;total+=u.length;return true;};
 if(!keep(current.art.id))current.art.id='';
 for(const s of slots)if(s&&!keep(s.design.art.id))s.design.art.id='';
 const b=[...bought].reverse().filter(id=>ART_ID.test(id)).filter((id,i,a)=>a.indexOf(id)===i).slice(0,BOUGHT_KEEP).filter(keep).reverse();
 return {art,bought:b};
}
export function parseBallStore(raw:string|null):BallStore{
 let o:Record<string,unknown>|null=null;try{o=raw?JSON.parse(raw):null;}catch{o=null;}
 const pool=(o?.art&&typeof o.art==='object'&&!Array.isArray(o.art)?o.art:{}) as Record<string,string>;
 const slots:(BallSlot|null)[]=Array.from({length:SLOT_COUNT},(_,i)=>{const s=Array.isArray(o?.slots)?(o!.slots as unknown[])[i] as Record<string,unknown>|null:null;
  if(!s||typeof s!=='object'||!s.design)return null;const thumb=cleanThumb(s.thumb);
  return {name:cleanSlotName(s.name,i),design:validateBall(s.design),savedAt:num(s.savedAt,0,0,8.64e15),...(thumb?{thumb}:{})};});
 const current=validateBall(o?.current??DEFAULT_BALL);
 const packed=packArt(current,slots,Array.isArray(o?.bought)?(o!.bought as unknown[]).filter((x):x is string=>typeof x==='string'):[],pool);
 return {v:2,current,slots,...packed};
}
export function loadBallStore(store:KV|null=ls()):BallStore{try{return parseBallStore(store?.getItem(BALL_KEY)??null);}catch{return parseBallStore(null);}}
function write(s:BallStore,store:KV|null,mem?:Record<string,string>){
 const packed=packArt(s.current,s.slots,s.bought,{...s.art,...(mem??{})});
 try{store?.setItem(BALL_KEY,JSON.stringify({...s,v:2,...packed}));return true;}catch{return false;}}
/** The data URL of a drawing id (from the store's pool or the studio's unsaved memory), or ''. */
export function artUrl(id:string,store:BallStore|null,mem?:Record<string,string>):string{if(!id)return '';const u=mem?.[id]??store?.art[id]??'';return isDrawUrl(u)&&artHash(u)===id?u:'';}
/** Auto-save the in-progress design (keeps the slots). `mem` holds drawings not yet in the pool (id → data URL). */
export function saveBallCurrent(design:BallDesign,store:KV|null=ls(),mem?:Record<string,string>):boolean{const s=loadBallStore(store);return write({...s,current:validateBall(design)},store,mem);}
/** Save into named slot i (0–2), with an optional thumbnail (a small image data URL). */
export function saveBallSlot(i:number,name:string,design:BallDesign,now=Date.now(),store:KV|null=ls(),mem?:Record<string,string>,thumb?:string):boolean{
 if(!(i>=0&&i<SLOT_COUNT))return false;const s=loadBallStore(store);const slots=[...s.slots];const t=cleanThumb(thumb);
 slots[i]={name:cleanSlotName(name,i),design:validateBall(design),savedAt:now,...(t?{thumb:t}:{})};
 return write({...s,current:validateBall(design),slots},store,mem);
}
export function clearBallSlot(i:number,store:KV|null=ls()):boolean{const s=loadBallStore(store);if(!(i>=0&&i<SLOT_COUNT))return false;const slots=[...s.slots];slots[i]=null;return write({...s,slots},store);}
/** A ball was bought: keep its drawing in the pool (the newest BOUGHT_KEEP bought drawings are kept while they fit). */
export function markBallBought(design:BallDesign,store:KV|null=ls(),mem?:Record<string,string>):boolean{
 const d=validateBall(design),s=loadBallStore(store);const bought=d.art.id?[...s.bought.filter(x=>x!==d.art.id),d.art.id]:s.bought;
 return write({...s,current:d,bought},store,mem);
}
