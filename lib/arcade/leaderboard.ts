/**
 * Arcade leaderboards (Oct 12 2026; docs/arcade-leaderboards.md). Pure and isomorphic: the game UI, the API route
 * (lib/arcade/leaderboardServer.ts), the stores and tests/arcade-leaderboard.cjs share these rules.
 *
 * Kids are the players, so an entry is only:
 *  - three letters A–Z picked on arcade letter wheels (never typed text, never a name field), minus a blocklist;
 *  - an optional picture from a fixed list (an id like "lion", never free text or an emoji string);
 *  - the score and the day it was played.
 * No account, no device id, no IP, no save code (or its pictures: they would leak part of the secret code).
 */
export const BOARD_GAMES=['runner','pinball','tennis','live','puzzle','kick'] as const;
export type BoardGame=typeof BOARD_GAMES[number];
export const isBoardGame=(g:unknown):g is BoardGame=>typeof g==='string'&&(BOARD_GAMES as readonly string[]).includes(g);

/**
 * Per-game rules. `max`: the sanity ceiling (far above any real run). A score must also fit `base + perSecond × seconds played`
 * since the session started, and the session must have lasted `minSeconds` (a real play, not a scripted post).
 * Pass Puzzles' score is the child's total stars, which grows across visits, so it has no per-second rule.
 */
export const BOARD_RULES:Record<BoardGame,{name:string;unit:string;max:number;base:number;perSecond:number;minSeconds:number;learn:string}>={
 runner:{name:'Breakaway Run',unit:'points',max:300_000,base:3_000,perSecond:1_500,minSeconds:12,learn:'Read the open lane, then finish.'},
 pinball:{name:'Futbol Pinball',unit:'points',max:400_000,base:5_000,perSecond:2_500,minSeconds:20,learn:'Time your strike as the ball arrives.'},
 tennis:{name:'Futbol Tennis',unit:'touch rally',max:500,base:10,perSecond:2,minSeconds:15,learn:'A clean first touch keeps the rally alive.'},
 live:{name:'Island Strikers',unit:'match points',max:20_000,base:400,perSecond:40,minSeconds:30,learn:'Passes and goals both score. Win as a team.'},
 puzzle:{name:'Pass Puzzles',unit:'stars',max:300,base:300,perSecond:0,minSeconds:8,learn:'Every star is a pass you learned to see.'},
 // Summit Kick (Summit Isle, Oct 12 2026; lib/town/summitKick.ts): at most 780 a round (5 hoops, accuracy, speed), so 1000 is the ceiling.
 kick:{name:'Summit Kick',unit:'points',max:1_000,base:400,perSecond:60,minSeconds:6,learn:'Pick a corner: keepers stand in the middle.'},
};
/** Rows shown per board. */
export const BOARD_SIZE=10;
/** A session token is good for this long (a long Strikers cup or a slow puzzle visit still fits). */
export const SESSION_MAX_MS=3*60*60_000;

/** Island Strikers match points: passing is scored, not just goals (the habit the game teaches). */
export const STRIKER_POINTS={goal:100,pass:10,win:200} as const;
export function strikerBoardPoints({goals,passes,won}:{goals:number;passes:number;won:boolean}){
 const n=(v:number)=>Number.isFinite(v)?Math.max(0,Math.floor(v)):0;
 return n(goals)*STRIKER_POINTS.goal+n(passes)*STRIKER_POINTS.pass+(won?STRIKER_POINTS.win:0);
}

/**
 * Three-letter combinations no board shows (checked on the device and again on the server). Profanity, sexual words, slurs
 * and hate abbreviations, plus "kill yourself" style abbreviations. A 3-letter board can't carry context, so identity words
 * that are used as playground insults are blocked too. Letters only (the wheels have no digits), so no leetspeak variants.
 */
export const BLOCKED_INITIALS:ReadonlySet<string>=new Set([
 // rude and sexual words
 'ASS','AZZ','ARS','ANL','ANU','BCH','BJS','CLT','CNT','COC','COK','CUM','CUN','DCK','DIC','DIK','DIX','FCK','FKU','FUC','FUK','FUQ','FUX',
 'HOE','HOR','JIZ','JZZ','KNT','KUM','MOF','NIP','PNS','PRN','SEX','SHT','SLT','STD','SXY','TIT','TTS','TWT','VAG','WTF','XXX',
 // slurs and hate (identity words too: a 3-letter board can't carry context, and on a kids' board they are mostly used to tease)
 'FAG','GAY','HOM','JAP','JEW','KKK','NAZ','NGA','NGR','NIG','PAK','SPK','SPZ','WOP',
 // bullying, self-harm and violence
 'FAT','HAG','KIL','KMS','KYS','UGL',
 // drugs
 'LSD','THC','XTC',
]);
const LETTERS=/^[A-Z]{3}$/;
/** The three letters, upper-cased, if they are A–Z and not blocked. */
export function cleanInitials(v:unknown):string|null{
 if(typeof v!=='string')return null;const s=v.toUpperCase();
 return LETTERS.test(s)&&!BLOCKED_INITIALS.has(s)?s:null;
}
export const initialsBlocked=(v:string)=>BLOCKED_INITIALS.has(v.toUpperCase());

/** The fixed picture list (ids travel and are stored; the emoji is only drawn on the device). '' = no picture. */
export const BOARD_ICONS=[
 {id:'ball',emoji:'⚽',label:'Football'},{id:'lion',emoji:'🦁',label:'Lion'},{id:'tiger',emoji:'🐯',label:'Tiger'},
 {id:'fox',emoji:'🦊',label:'Fox'},{id:'panda',emoji:'🐼',label:'Panda'},{id:'frog',emoji:'🐸',label:'Frog'},
 {id:'octopus',emoji:'🐙',label:'Octopus'},{id:'shark',emoji:'🦈',label:'Shark'},{id:'dolphin',emoji:'🐬',label:'Dolphin'},
 {id:'eagle',emoji:'🦅',label:'Eagle'},{id:'turtle',emoji:'🐢',label:'Turtle'},{id:'star',emoji:'⭐',label:'Star'},
] as const;
export type BoardIcon=typeof BOARD_ICONS[number]['id']|'';
export const cleanIcon=(v:unknown):BoardIcon|null=>v===''||v===undefined||v===null?'':typeof v==='string'&&BOARD_ICONS.some(i=>i.id===v)?v as BoardIcon:null;
export const iconEmoji=(id:string)=>BOARD_ICONS.find(i=>i.id===id)?.emoji??'';

/** A whole, positive score inside the game's sanity ceiling. */
export function scoreInBounds(game:BoardGame,score:unknown):score is number{
 return typeof score==='number'&&Number.isInteger(score)&&score>=1&&score<=BOARD_RULES[game].max;
}
/** Plausible for a session that has run `elapsedMs`: long enough, and no faster than the game can score. */
export function scorePlausible(game:BoardGame,score:number,elapsedMs:number):'ok'|'short'|'fast'{
 const r=BOARD_RULES[game];
 if(!(elapsedMs>=r.minSeconds*1000))return 'short';
 return score<=r.base+r.perSecond*elapsedMs/1000?'ok':'fast';
}

/** The UTC Monday (YYYY-MM-DD) of the week `d` is in: "This week" runs Monday to Sunday, UTC. */
export function weekOf(d:Date|number):string{
 const t=new Date(typeof d==='number'?d:d.getTime()),day=(t.getUTCDay()+6)%7;
 return new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate()-day)).toISOString().slice(0,10);
}
export const dayOf=(d:Date|number)=>new Date(typeof d==='number'?d:d.getTime()).toISOString().slice(0,10);

/** One board row as the API and the device show it. `id` is the server row id (island boards only). */
export type BoardRow={id?:number;initials:string;icon:string;score:number;day:string};
/**
 * Board order: higher score first; on a tie the earlier entry stays above (it got there first, as in arcades). `seq` is the
 * insertion order (server row id, or the device's own counter).
 */
export function compareRows(a:{score:number;seq:number},b:{score:number;seq:number}){return b.score-a.score||a.seq-b.seq;}
/** The rank (1-based) a new score would take on `rows` (already in board order); a tie goes below the existing equal scores. */
export function rankFor(rows:readonly {score:number}[],score:number){let n=1;for(const r of rows)if(r.score>=score)n++;return n;}
/** True when `score` would make the top BOARD_SIZE of `rows` (it must beat the last row once the board is full). */
export const qualifies=(rows:readonly {score:number}[],score:number)=>score>0&&rankFor(rows,score)<=BOARD_SIZE;

/** "This device" board entry. `seq` orders ties (the device's own counter). */
export type LocalEntry={initials:string;icon:string;score:number;day:string;week:string;seq:number};
/** An island row this device posted: its id (to highlight it) and the claim secret (to replace it with a better score). */
export type PostedEntry={id:number;claim:string;initials:string;score:number};
export type LocalBoards={version:1;seq:number;me?:{initials:string;icon:string};boards:Partial<Record<BoardGame,LocalEntry[]>>;mine:Partial<Record<BoardGame,PostedEntry[]>>};
export const LOCAL_BOARDS_KEY='fi2-arcade-boards-v1';
export const emptyLocalBoards=():LocalBoards=>({version:1,seq:0,boards:{},mine:{}});
const DAY=/^\d{4}-\d{2}-\d{2}$/;
/** Reads and repairs the device's boards (any junk is dropped, each board re-sorted and cut to BOARD_SIZE). */
export function sanitizeLocalBoards(v:unknown):LocalBoards{
 const out=emptyLocalBoards();if(!v||typeof v!=='object')return out;const o=v as Partial<LocalBoards>;
 out.seq=Number.isInteger(o.seq)&&(o.seq as number)>=0?o.seq as number:0;
 const me=o.me&&typeof o.me==='object'?o.me:null;const mi=cleanInitials(me?.initials),mc=cleanIcon(me?.icon);if(mi&&mc!==null)out.me={initials:mi,icon:mc};
 for(const g of BOARD_GAMES){
  const list=o.boards?.[g];
  if(Array.isArray(list)){const rows:LocalEntry[]=[];
   for(const e of list){if(!e||typeof e!=='object')continue;const i=cleanInitials(e.initials),c=cleanIcon(e.icon);
    if(!i||c===null||!scoreInBounds(g,e.score)||typeof e.day!=='string'||!DAY.test(e.day))continue;
    const seq=Number.isInteger(e.seq)&&e.seq>=0?e.seq:0;out.seq=Math.max(out.seq,seq);
    rows.push({initials:i,icon:c,score:e.score,day:e.day,week:weekOf(Date.parse(e.day+'T12:00:00Z')),seq});}
   out.boards[g]=rows.sort(compareRows).slice(0,BOARD_SIZE);}
  const posted=o.mine?.[g];
  if(Array.isArray(posted))out.mine[g]=posted.filter(p=>p&&Number.isInteger(p.id)&&p.id>0&&typeof p.claim==='string'&&/^[0-9a-f]{32}$/.test(p.claim)&&!!cleanInitials(p.initials)&&scoreInBounds(g,p.score))
   .map(p=>({id:p.id,claim:p.claim,initials:p.initials,score:p.score})).slice(-BOARD_SIZE);
 }
 return out;
}
/** Adds a score to the device board for `game`; returns the new boards and the entry's rank (null when it didn't make the top 10). */
export function addLocalScore(b:LocalBoards,game:BoardGame,e:{initials:string;icon:string;score:number;now:number}):{boards:LocalBoards;rank:number|null;entry:LocalEntry}{
 const seq=b.seq+1,entry:LocalEntry={initials:e.initials,icon:e.icon,score:e.score,day:dayOf(e.now),week:weekOf(e.now),seq};
 // Pass Puzzles' score is a running total of stars, so the same letters keep one row (their best), not one row per new star.
 const kept=(b.boards[game]??[]).filter(r=>!(game==='puzzle'&&r.initials===e.initials&&r.score<=e.score));
 const rows=[...kept,entry].sort(compareRows),rank=rows.indexOf(entry)+1;
 return {boards:{...b,seq,boards:{...b.boards,[game]:rows.slice(0,BOARD_SIZE)}},rank:rank<=BOARD_SIZE?rank:null,entry};
}
/** The device's own earlier island entry this one can replace: same game and letters, lower score (the best such one). */
export function replaceable(b:LocalBoards,game:BoardGame,initials:string,score:number):PostedEntry|null{
 return (b.mine[game]??[]).filter(p=>p.initials===initials&&p.score<=score).sort((x,y)=>y.score-x.score)[0]??null;
}
/** Records an island post (and forgets the one it replaced). Keeps the last BOARD_SIZE per game. */
export function addPosted(b:LocalBoards,game:BoardGame,p:PostedEntry,replacedId?:number):LocalBoards{
 const list=[...(b.mine[game]??[]).filter(x=>x.id!==replacedId&&x.id!==p.id),p].slice(-BOARD_SIZE);
 return {...b,mine:{...b.mine,[game]:list}};
}
/** The device's own island rows for `game` (ids it posted), to highlight them on the island board. */
export const ownServerIds=(b:LocalBoards,game:BoardGame)=>new Set((b.mine[game]??[]).map(p=>p.id));
