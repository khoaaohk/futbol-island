/**
 * Save codes (docs/accounts-design.md §3, §5.1; Oct 9 2026): three words from WORDS plus a number 100–999, e.g.
 * `striker · volley · corner · 427`. The server makes every code (crypto.randomInt); kids never choose one. Pure and
 * isomorphic: the API routes, the restore boxes and tests/game-saves.cjs share it.
 *
 * Normal form (the only thing ever hashed): `striker-volley-corner-427`. Typing is forgiving: any case, spaces, dots or
 * hyphens; a word may be typed as its first 4 letters (they are unique), and a small typo snaps to the one nearest word.
 */
import {PICTURES,WORDS} from './words';

/** Word-list version stored with each save (game_saves.code_version). The list only ever grows. */
export const CODE_VERSION=1;
export const NUMBER_MIN=100,NUMBER_MAX=999;
export const WORD_COUNT=3;
/** 3 distinct words in order × 900 numbers. */
export const CODE_SPACE=WORDS.length*(WORDS.length-1)*(WORDS.length-2)*(NUMBER_MAX-NUMBER_MIN+1);
export const CODE_BITS=Math.log2(CODE_SPACE);

export type SaveCode={words:[string,string,string];number:number};
const INDEX=new Map(WORDS.map((w,i)=>[w,i]));
export const isWord=(w:string)=>INDEX.has(w);
export const pictureFor=(w:string):string|null=>PICTURES[w]??null;

/**
 * Adjacent pairs that read badly together (either order). Single words are already clean; this stops a random draw from
 * pairing a colour with a primate, and similar. A generated code with a blocked pair is drawn again.
 */
const SKIN=['black','white','brown','yellow','red'];
const PRIMATES=['monkey','gorilla','lemur'];
export const PAIR_BLOCK:ReadonlySet<string>=new Set([
 ...SKIN.flatMap(c=>PRIMATES.map(a=>`${c} ${a}`)),
 'dog pig','pig dog','fat cow','cow pig','pig cow','dumb bunny','silly goose','poop deck','hot dog',
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

/** The one list word this input means, or null. Exact, then a unique prefix of 4+ letters, then the one nearest word. */
export function matchWord(input:string):string|null{
 const w=cleanWord(input);if(w.length<3)return null;
 if(INDEX.has(w))return w;
 if(w.length>=4){const hits=WORDS.filter(x=>x.startsWith(w));if(hits.length===1)return hits[0];}
 const limit=w.length>=6?2:1;let best:string|null=null,bestD=limit+1,tie=false;
 for(const x of WORDS){const d=distance(w,x,limit);if(d<bestD){best=x;bestD=d;tie=false;}else if(d===bestD)tie=true;}
 return best&&!tie&&bestD<=limit?best:null;
}

/** Autocomplete tiles for a word box: words starting with what was typed (after 3 letters), else near misses. */
export function suggestWords(input:string,limit=6):string[]{
 const w=cleanWord(input);if(w.length<3)return [];
 const starts=WORDS.filter(x=>x.startsWith(w));
 if(starts.length)return starts.slice(0,limit);
 const m=matchWord(w);return m?[m]:[];
}

export function parseNumber(input:string|number):number|null{
 const s=String(input).replace(/\D/g,'');if(!/^\d{3}$/.test(s))return null;
 const n=Number(s);return n>=NUMBER_MIN&&n<=NUMBER_MAX?n:null;
}

/** Parses typed text ("Striker volley-corner 427") or the four boxes. Null when any part is missing or unknown. */
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
/** The strict normal form, as stored on the device and sent to the server. */
export const NORMAL_CODE=/^[a-z]{3,9}-[a-z]{3,9}-[a-z]{3,9}-[1-9]\d{2}$/;
export const isNormalCode=(s:unknown):s is string=>typeof s==='string'&&NORMAL_CODE.test(s)&&s.split('-').slice(0,3).every(w=>INDEX.has(w));
export const codeFromNormal=(s:string):SaveCode|null=>isNormalCode(s)?parseCode(s):null;
