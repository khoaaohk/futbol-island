/**
 * The Island stamp book (owner, Nov 23 2026: "collect station stamps … a unique round ink stamp like they collect in Japan").
 * Eight eki-style stamps: the five Island Line stations (hover a station house → "Collect stamp"), plus three people who keep a
 * stamp behind the counter: the Konbini cashier, Ada at the History Museum's front desk and Femi at the Kit Shop till ("Can I
 * get a stamp?" in their conversation). NOT the Konbini's loyalty "Stamp card" (components/KonbiniStampCard.tsx): that one is
 * per-magazine and stays separate; ours is always called the "Island stamp book".
 *
 * Pure model (no DOM, no React): the browser wiring is components/StampBookHost.tsx, the art lib/town/stampArt.ts, the book
 * components/StampBook.tsx, tests tests/island-stamps.cjs. Saved under ISLAND_STAMPS_KEY, synced with a save code
 * (lib/saves/snapshot.ts SYNC_KEYS), ≤ ~600 bytes.
 *
 * Learning (AGENTS.md): every stamp carries one football fact tied to its scene, shown in the stamping moment and on its page.
 */
export const ISLAND_STAMPS_KEY='fi2-island-stamps-v1';
/** window event: open the book. detail {page?:StampId; stamp?:StampId} — `stamp` collects it first (the stamping moment). */
export const OPEN_STAMP_BOOK='fi2-open-stamp-book';
/** Learning-coin ids (lib/town/learnCoins.ts kind `book`): one per stamp, once ever, and the full book. */
export const stampRewardId=(id:string)=>`stamp-${id}`;
export const STAMP_BOOK_REWARD_ID='stamp-book';
export const STAMP_BOOK_BONUS=25;

export type StampId='north'|'west'|'south'|'summit'|'cay'|'konbini'|'museum'|'shop';
export type StampDef={id:StampId;
 /** Where it is collected: a station house, or a person's counter. */
 where:'station'|'counter';
 /** The name in the ring (short) and the place line written under it ("Location"). */
 name:string;place:string;
 /** The one ink colour. */
 ink:string;
 /** The football fact (kid-friendly, true) and its source (also in the code comment beside it). */
 fact:string;source:string;
 /** How to get it, shown on its empty page. */
 how:string};

export const STAMPS:readonly StampDef[]=[
 // "Squad number (association football)" (Wikipedia): first worn in England in 1928; the Football League made 1–11 numbers compulsory from 1939.
 {id:'north',where:'station',name:'North',place:'North Station · North Beach',ink:'#8a3f7a',
  fact:'Old football shirts had no numbers. Numbers 1 to 11 came in so fans could tell players apart by position: 1 for the goalkeeper, 9 for the centre-forward.',
  source:'"Squad number (association football)" (Wikipedia): first worn in England in 1928, compulsory in the Football League from 1939',how:'Hover or tap the North station house on the beach, then Collect stamp.'},
 // IFAB Laws of the Game 2025/26, Law 7 (The Duration of the Match): two equal halves of 45 minutes, half-time ≤ 15 minutes, time added for lost time.
 {id:'west',where:'station',name:'West Beach',place:'West Beach Station · Drip FC Stadium',ink:'#2f8a57',
  fact:'A match lasts 90 minutes: two halves of 45, with a half-time break of up to 15 minutes. The referee adds stoppage time for time lost to injuries and substitutions.',
  source:'IFAB Laws of the Game, Law 7 (The Duration of the Match)',how:'Hover or tap the West Beach station house, then Collect stamp.'},
 // Scottish FA / FIFA history; Wikipedia "1872 Scotland v England football match": 30 Nov 1872, Hamilton Crescent, Partick (Glasgow), 0–0.
 {id:'south',where:'station',name:'South',place:'South Station · History Museum',ink:'#c2452d',
  fact:'The first international football match was Scotland against England, played near Glasgow on 30 November 1872. It finished 0–0.',
  source:'Scottish FA history; "1872 Scotland v England football match" (Wikipedia)',how:'Hover or tap the South station house on the boardwalk, then Collect stamp.'},
 // FIFA World Cup qualifying at Estadio Hernando Siles, La Paz (≈ 3,600 m). Thinner air: less drag, so the ball flies farther and players tire sooner (Britannica "La Paz"; FIFA altitude studies).
 {id:'summit',where:'station',name:'Summit Isle',place:'Summit Isle Station · Summit 5s',ink:'#3a4f9a',
  fact:'Bolivia plays home games in La Paz, about 3,600 metres above the sea. Up there the air is thin, so the ball flies farther and players get tired sooner.',
  source:'Estadio Hernando Siles, La Paz (Britannica "La Paz"; FIFA altitude research)',how:'Hover or tap the Summit Isle station house by the tunnel, then Collect stamp.'},
 // FIFA Beach Soccer Laws of the Game: Law 3 (five players including a goalkeeper), Law 7 (three periods of 12 minutes).
 {id:'cay',where:'station',name:'Coral Cay',place:'Coral Cay Station · Hostel and Farm',ink:'#1f8a8a',
  fact:'Beach soccer is played five a side on sand: four outfield players and a goalkeeper, in three periods of 12 minutes. Bicycle kicks are everywhere!',
  source:'FIFA Beach Soccer Laws of the Game, Laws 3 and 7',how:'Hover or tap the Coral Cay station house, then Collect stamp.'},
 // UEFA expert group statement on nutrition in elite football (Collins et al., Br J Sports Med 2021): carbohydrate and fluids at half-time help second-half performance.
 {id:'konbini',where:'counter',name:'Konbini',place:'Island Konbini · the cashier',ink:'#d06a1e',
  fact:'Players refuel at half-time: water and a quick snack with carbohydrate (like a banana or a rice ball) give tired muscles energy for the second half.',
  source:'UEFA expert group statement on nutrition in elite football (Br J Sports Med, 2021)',how:'Go into a Konbini, talk to the cashier and ask: Can I get a stamp?'},
 // FIFA "The history of the football"; "Ball (association football)" (Wikipedia): H. J. Lindon's inflatable rubber bladder, 1862.
 {id:'museum',where:'counter',name:'History Museum',place:'History Museum · Ada at the front desk',ink:'#7a5a2e',
  fact:'Early footballs were a pig’s bladder inside stitched leather. In the 1860s rubber bladders took over, so balls became rounder and bounced the same way every time.',
  source:'"Ball (association football)" (Wikipedia): H. J. Lindon’s rubber bladder, 1862; FIFA ball history',how:'Go into the History Museum, talk to Ada at the front desk and ask: Can I get a stamp?'},
 // IFAB Law 4 (The Players' Equipment: nothing dangerous; referees check studs); stud types per The FA's boots guidance and "Football boot" (Wikipedia).
 {id:'shop',where:'counter',name:'Kit Shop',place:'Kit Shop · Femi at the till',ink:'#2d6fa8',
  fact:'Boots wear different studs for different ground: short moulded studs for firm, dry pitches, and fewer, longer studs to grip soft, muddy ones. The referee checks they are safe.',
  source:'IFAB Laws of the Game, Law 4 (The Players’ Equipment); "Football boot" (Wikipedia)',how:'Go into the Kit Shop, talk to Femi at the till and ask: Can I get a stamp?'},
];
export const STAMP_IDS:readonly StampId[]=STAMPS.map(s=>s.id);
export const STATION_STAMP_IDS:readonly StampId[]=STAMPS.filter(s=>s.where==='station').map(s=>s.id);
export const stampById=(id:string):StampDef|undefined=>STAMPS.find(s=>s.id===id);
export const isStampId=(id:unknown):id is StampId=>typeof id==='string'&&STAMP_IDS.includes(id as StampId);

/** One stamp in the book: when (ms), and its hand-stamped tilt (degrees, ±4) and ink offset (px, ±2), fixed at stamping. */
export type StampMark={at:number;tilt:number;dx:number;dy:number};
export type StampSave={version:1;stamps:Partial<Record<StampId,StampMark>>;reward:boolean};
export const emptyStamps=():StampSave=>({version:1,stamps:{},reward:false});
const num=(v:unknown,lo:number,hi:number,d:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):d;
export function sanitizeStamps(raw:unknown):StampSave{
 if(!raw||typeof raw!=='object')return emptyStamps();const v=raw as Partial<StampSave>;if(v.version!==1)return emptyStamps();
 const out=emptyStamps();const s=v.stamps&&typeof v.stamps==='object'?v.stamps as Record<string,unknown>:{};
 for(const id of STAMP_IDS){const m=s[id] as Partial<StampMark>|undefined;if(!m||typeof m!=='object'||typeof m.at!=='number'||!(m.at>0))continue;
  out.stamps[id]={at:Math.round(m.at),tilt:+num(m.tilt,-4,4,0).toFixed(1),dx:+num(m.dx,-2,2,0).toFixed(1),dy:+num(m.dy,-2,2,0).toFixed(1)};}
 out.reward=v.reward===true;return out;
}
export type Port={get():string|null;set(v:string):void};
const local:Port={get:()=>localStorage.getItem(ISLAND_STAMPS_KEY),set:v=>localStorage.setItem(ISLAND_STAMPS_KEY,v)};
export function readStamps(port:Port=local):StampSave{try{return sanitizeStamps(JSON.parse(port.get()??'null'));}catch{return emptyStamps();}}
export function writeStamps(s:StampSave,port:Port=local){try{port.set(JSON.stringify(s));}catch{/* private mode: the book still opens this visit */}}
export const stampCount=(s:StampSave)=>STAMP_IDS.filter(id=>s.stamps[id]).length;
export const lineComplete=(s:StampSave)=>STATION_STAMP_IDS.every(id=>s.stamps[id]);
export const bookComplete=(s:StampSave)=>STAMP_IDS.every(id=>s.stamps[id]);
export type StampRecord={save:StampSave;first:boolean;completed:boolean};
/**
 * Stamp `id` into the book. A second visit keeps the first date (a real eki stamp book would get a second print; ours keeps one
 * per page). `rand` is injectable for tests. `completed` is true only on the stamp that fills the book.
 */
export function collectStamp(id:StampId,now=Date.now(),port:Port=local,rand:()=>number=Math.random):StampRecord{
 const s=readStamps(port);if(s.stamps[id])return {save:s,first:false,completed:false};
 const r=(k:number)=>+((rand()*2-1)*k).toFixed(1);
 s.stamps[id]={at:Math.round(now),tilt:r(4),dx:r(2),dy:r(2)};writeStamps(s,port);
 return {save:s,first:true,completed:bookComplete(s)};
}
export function markStampReward(port:Port=local){const s=readStamps(port);if(!s.reward){s.reward=true;writeStamps(s,port);}return s;}
/** The date line under a stamp, written like the photo's hand ("23 Nov 2026"), in the player's own calendar day. */
export function stampDate(at:number):string{const d=new Date(at);return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getFullYear()}`;}

/** The book's pages: the cover page, one per stamp (the order above), and the back page. */
export const STAMP_PAGES:readonly ('cover'|StampId|'back')[]=['cover',...STAMP_IDS,'back'];
export const stampPage=(id:StampId)=>STAMP_PAGES.indexOf(id);
