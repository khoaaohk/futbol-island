/**
 * Save codes (docs/accounts-design.md §3, §5.1; Oct 9 2026): three words from WORDS plus a number 1000–9999, e.g.
 * `striker · volley · corner · 4271`. The server makes every code (crypto.randomInt); kids never choose one. Pure and
 * isomorphic: the API routes, the restore boxes and tests/game-saves.cjs share it.
 *
 * Normal form (the only thing ever hashed): `striker-volley-corner-4271`. Typing is forgiving: any case, spaces, dots or
 * hyphens; a word may be typed as its first 4 letters (they are unique), and a small typo snaps to the one nearest word.
 *
 * Old codes (made before the easy list, Oct 10 2026) use words from LEGACY_WORDS and a 3-digit number 100–999. They still
 * parse and restore, but new codes never use them, and when typing could mean either, the new word wins.
 */
import {NUMBER_PICTURE,PICTURES,WORDS} from './words';
import {LEGACY_PICTURES,LEGACY_WORDS} from './legacyWords';
export {NUMBER_PICTURE};

/** Word-list version stored with each save (game_saves.code_version). Not bumped for the Oct 10 2026 easy list (user's call). */
export const CODE_VERSION=1;
export const NUMBER_MIN=1000,NUMBER_MAX=9999;
/** Old codes' numbers (restore only). Never overlaps a new number: 3 digits vs 4. */
export const LEGACY_NUMBER_MIN=100,LEGACY_NUMBER_MAX=999;
export const WORD_COUNT=3;
/** 3 distinct words in order × 9,000 numbers. */
export const CODE_SPACE=WORDS.length*(WORDS.length-1)*(WORDS.length-2)*(NUMBER_MAX-NUMBER_MIN+1);
export const CODE_BITS=Math.log2(CODE_SPACE);

export type SaveCode={words:[string,string,string];number:number};
const INDEX=new Map(WORDS.map((w,i)=>[w,i]));
/** Old words only (never in WORDS), for restoring old codes. */
const LEGACY=LEGACY_WORDS.filter(w=>!INDEX.has(w)),LEGACY_INDEX=new Set(LEGACY);
export const isWord=(w:string)=>INDEX.has(w);
export const isLegacyWord=(w:string)=>LEGACY_INDEX.has(w);
/** The word's picture (every word has one, old words too; null only for an unknown word). Never part of the secret. */
export const pictureFor=(w:string):string|null=>PICTURES[w]??(LEGACY_INDEX.has(w)?LEGACY_PICTURES[w]??null:null);
/** "🤝 buddy · ⚽ striker · 🥅 goal · 🔢 4271": the code with its pictures, for places that show a code as plain text. */
export const pictureLine=(c:SaveCode)=>`${c.words.map(w=>`${pictureFor(w)??''} ${w}`.trim()).join(' · ')} · ${NUMBER_PICTURE} ${c.number}`;

/**
 * Adjacent pairs that read badly together (either order). Single words are already clean; this stops a random draw from
 * pairing a colour with a primate, and similar. A generated code with a blocked pair is drawn again.
 */
const SKIN=['black','white','brown','yellow','red'];
const PRIMATES=['monkey','gorilla','lemur'];
export const PAIR_BLOCK:ReadonlySet<string>=new Set([
 ...SKIN.flatMap(c=>[...PRIMATES,'face'].map(a=>`${c} ${a}`)),
 'dog pig','pig dog','fat cow','cow pig','pig cow','dumb bunny','silly goose','poop deck','hot dog',
 'pig face','monkey face','big pig','lazy pig','hot baby','hot mouth',
]);
export function blockedPair(words:readonly string[]):boolean{
 for(let i=0;i+1<words.length;i++)if(PAIR_BLOCK.has(`${words[i]} ${words[i+1]}`)||PAIR_BLOCK.has(`${words[i+1]} ${words[i]}`))return true;
 return false;
}

/** `randomInt(max)` returns an integer in [0, max): crypto.randomInt on the server, a seeded stub in tests. */
export function generateCode(randomInt:(max:number)=>number):SaveCode{
 for(;;){
  const picked:string[]=[];
  while(picked.length<WORD_COUNT){const w=WORDS[randomInt(WORDS.length)];if(!picked.includes(w))picked.push(w);}
  if(blockedPair(picked))continue;
  return {words:picked as [string,string,string],number:NUMBER_MIN+randomInt(NUMBER_MAX-NUMBER_MIN+1)};
 }
}

export const formatCode=(c:SaveCode)=>`${c.words.join('-')}-${c.number}`;
export const displayCode=(c:SaveCode)=>`${c.words.join(' · ')} · ${c.number}`;
export const cleanWord=(s:string)=>s.toLowerCase().replace(/[^a-z]/g,'');

/** Edit distance (insert, delete, change), giving up early once every path is over `limit`. */
function distance(a:string,b:string,limit:number):number{
 if(Math.abs(a.length-b.length)>limit)return limit+1;
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const row=[i];let best=i;
  for(let j=1;j<=b.length;j++){const v=Math.min(prev[j]+1,row[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));row.push(v);if(v<best)best=v;}
  if(best>limit)return limit+1;
  prev=row;
 }
 return prev[b.length];
}

/** The one word in `list` nearest to `w` (within `limit` edits), 'tie' when two are equally near, or null. */
function nearest(w:string,list:readonly string[],limit:number):string|'tie'|null{
 let best:string|null=null,bestD=limit+1,tie=false;
 for(const x of list){const d=distance(w,x,limit);if(d<bestD){best=x;bestD=d;tie=false;}else if(d===bestD)tie=true;}
 return best&&bestD<=limit?(tie?'tie':best):null;
}

/**
 * The one word this input means, or null. Exact, then a unique prefix of 4+ letters, then the one nearest word. At every step
 * the current list goes first and an old word (LEGACY_WORDS) is only a fallback: an exact old word still matches, but a prefix
 * or typo that fits a new word means the new word.
 */
export function matchWord(input:string):string|null{
 const w=cleanWord(input);if(w.length<3)return null;
 if(INDEX.has(w))return w;
 if(LEGACY_INDEX.has(w))return w;
 if(w.length>=4){
  const hits=WORDS.filter(x=>x.startsWith(w));if(hits.length===1)return hits[0];
  if(!hits.length){const old=LEGACY.filter(x=>x.startsWith(w));if(old.length===1)return old[0];}
 }
 const limit=w.length>=6?2:1;
 const n=nearest(w,WORDS,limit);if(n)return n==='tie'?null:n;
 const o=nearest(w,LEGACY,limit);return o&&o!=='tie'?o:null;
}

/** Autocomplete tiles for a word box: words starting with what was typed (after 3 letters; new words first, then old ones), else near misses. */
export function suggestWords(input:string,limit=6):string[]{
 const w=cleanWord(input);if(w.length<3)return [];
 const starts=[...WORDS.filter(x=>x.startsWith(w)),...LEGACY.filter(x=>x.startsWith(w))];
 if(starts.length)return starts.slice(0,limit);
 const m=matchWord(w);return m?[m]:[];
}

/** 4 digits 1000–9999 (new codes) or 3 digits 100–999 (old codes, restore only). */
export function parseNumber(input:string|number):number|null{
 const s=String(input).replace(/\D/g,'');if(!/^\d{3,4}$/.test(s))return null;
 const n=Number(s);return s.length===4?(n>=NUMBER_MIN&&n<=NUMBER_MAX?n:null):(n>=LEGACY_NUMBER_MIN&&n<=LEGACY_NUMBER_MAX?n:null);
}

/** Parses typed text ("Striker volley-corner 4271") or the four boxes. Null when any part is missing or unknown. */
export function parseCode(input:string|{words:readonly string[];number:string|number}):SaveCode|null{
 let words:string[],num:string|number;
 if(typeof input==='string'){
  const parts=input.trim().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if(parts.length!==WORD_COUNT+1)return null;
  words=parts.slice(0,WORD_COUNT);num=parts[WORD_COUNT];
 }else{if(!input||!Array.isArray(input.words)||input.words.length!==WORD_COUNT)return null;words=[...input.words];num=input.number;}
 const matched=words.map(w=>typeof w==='string'?matchWord(w):null);
 if(matched.some(m=>!m))return null;
 const n=parseNumber(num);if(n===null)return null;
 return {words:matched as [string,string,string],number:n};
}
export const normaliseCode=(input:Parameters<typeof parseCode>[0]):string|null=>{const c=parseCode(input);return c?formatCode(c):null;};
/** The strict normal form, as stored on the device and sent to the server (an old code's 3-digit number included). */
export const NORMAL_CODE=/^[a-z]{3,9}-[a-z]{3,9}-[a-z]{3,9}-[1-9]\d{2,3}$/;
export const isNormalCode=(s:unknown):s is string=>typeof s==='string'&&NORMAL_CODE.test(s)&&s.split('-').slice(0,3).every(w=>INDEX.has(w)||LEGACY_INDEX.has(w));
export const codeFromNormal=(s:string):SaveCode|null=>isNormalCode(s)?parseCode(s):null;
