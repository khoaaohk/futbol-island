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
/** Nov 8 2026: 'cupfinal' and 'legend' are Breakaway Run's elite tiers (lib/arcade/runnerModes.ts), each with its own board so they
 * never mix into (or reset) the original 'runner' board. Ids stay [a-z]{2,8} (the session token pattern in leaderboardServer.ts) and
 * need supabase/migrations/20261108_runner_tier_boards.sql on the island store. */
/** Nov 8 2026: 'livepro' and 'livelgnd' are Island Strikers' Pro and Legend leagues (lib/arcade/strikerTiers.ts), each with its own
 * board beside 'live' (never mixed, never reset). They need supabase/migrations/20261108_strikers_league_boards.sql. */
/** Nov 8 2026: 'tenpro' and 'tenlgnd' are Futbol Tennis' Pro Tour and Legend Tour (lib/games/soccerTennis.ts TENNIS_TOURS), each with its
 * own board beside 'tennis' (never mixed, never reset). They need supabase/migrations/20261108_tennis_tier_boards.sql. */
/** Nov 8 2026: 'pinderby' and 'pinfinal' are Futbol Pinball's elite tiers (lib/games/soccerPinballTiers.ts: Derby Night, World
 * Final), each with its own board beside 'pinball' (never mixed, never reset). They need supabase/migrations/20261109_pinball_tier_boards.sql. */
/** Nov 8 2026: 'puzpro' and 'puzlgnd' are Pass Puzzles' Pro Cup and Legend Cup (lib/passPuzzle/tiers.ts), each with its own board
 * beside 'puzzle' (never mixed, never reset). Their score is the child's cup points total (best per puzzle), a running total like
 * the star board. They need supabase/migrations/20261110_puzzle_tier_boards.sql (dated to run after every other board file). */
/** Nov 10 2026: 'runwarm', 'runnight', 'runstorm' are Breakaway's finite routes (Warm-up, Night Derby, Storm Final), ranked by score on
 * their own boards so the endless classic run ('runner') no longer buries them; 'rundaily' is the Daily Run (the same seeded course for
 * everyone that day; the first finished run of the day posts). The old 'runner' rows stay where they are. They need
 * supabase/migrations/20261112_runner_route_boards.sql (dated to run after every other board file). */
/** Nov 10 2026: 'kitrush' is Kit Rush (lib/arcade/kitrush/core.ts), the swipe cabinet that took Island Strikers' place in the arcade;
 * 'kitdaily' is its Daily Rush (one seed per local play day; the first finished run of the day posts). The 'live' boards and rows
 * stay as they are. They need docs/arcade-aaa/kitrush-supabase.sql (the owner pastes it; it must run after every other board file). */
export const BOARD_GAMES=['runner','pinball','tennis','live','puzzle','kick','cupfinal','legend','livepro','livelgnd','tenpro','tenlgnd','pinderby','pinfinal','puzpro','puzlgnd','runwarm','runnight','runstorm','rundaily','kitrush','kitdaily','snake','snakedaily','airhockey'] as const;/* Nov 11 2026: 'airhockey' = Air Futbol's solo run against the machine (lib/arcade/airhockey/core.ts); needs docs/arcade-aaa/airhockey-supabase.sql */// Nov 10 2026: 'snake' = Squad Snake (lib/arcade/snake/core.ts), 'snakedaily' = its Daily Squad; they need docs/arcade-aaa/endless-supabase.sql
export type BoardGame=typeof BOARD_GAMES[number];
/** Nov 8 2026: the Hall of High Scores' tab DISPLAY order: each elite tier board sits right after its parent game's board
 * (BOARD_GAMES keeps the data order and ids unchanged). */
export const BOARD_TIER_TABS:Partial<Record<BoardGame,readonly BoardGame[]>>={runner:['runwarm','runnight','runstorm','cupfinal','legend','rundaily'],pinball:['pinderby','pinfinal'],tennis:['tenpro','tenlgnd'],live:['livepro','livelgnd'],puzzle:['puzpro','puzlgnd'],kitrush:['kitdaily'],snake:['snakedaily']};
const TIER_TAB_SET=new Set<BoardGame>(Object.values(BOARD_TIER_TABS).flat() as BoardGame[]);
export const BOARD_TAB_ORDER:readonly BoardGame[]=BOARD_GAMES.filter(g=>!TIER_TAB_SET.has(g)).flatMap(g=>[g,...(BOARD_TIER_TABS[g]??[])]);
/** Nov 10 2026 (owner: "the high scores should only have the scores for each machine"): the Hall lists one chip per machine that
 * stands in the arcade room today, in room order. A machine's mode boards (BOARD_TIER_TABS) are not listed (Nov 11: "keep it simple"); a results card that opens the Hall on one shows that single board with its name.
 * Boards of things that are not a machine in the room (Island Strikers, retired Nov 10; Summit Kick on the island) are not listed;
 * their rows stay in the data and a card that opens the Hall on one of them shows that single board. */
export const HALL_MACHINES:readonly BoardGame[]=['kitrush','runner','snake','tennis','pinball','puzzle','airhockey'];
export const hallMachineOf=(g:BoardGame):BoardGame|null=>HALL_MACHINES.includes(g)?g:HALL_MACHINES.find(m=>BOARD_TIER_TABS[m]?.includes(g))??null;
export const isBoardGame=(g:unknown):g is BoardGame=>typeof g==='string'&&(BOARD_GAMES as readonly string[]).includes(g);

/**
 * Per-game rules. `max`: the sanity ceiling (far above any real run). A score must also fit `base + perSecond × seconds played`
 * since the session started, and the session must have lasted `minSeconds` (a real play, not a scripted post).
 * Pass Puzzles' score is the child's total stars, which grows across visits, so it has no per-second rule.
 * Nov 10 2026 (abuse audit: "anyone gets a /start token, waits, posts the ceiling"): rates re-read from each game's scoring and
 * set to about 1.5x the best sustained pace (session time includes menus, countdowns and goal pauses):
 *  pinball 3000 + 1200/s (soccerPinball.ts: goal 500-650 + rebound/wall-pass/PERFECT-streak bonuses, ~500-800/s great; 1500 end
 *   bonus in the base), pinderby ×1.12 speed ×2 = 6000 + 2700/s, pinfinal ×1.22 ×3 = 9000 + 4400/s; live 300 + 25/s (goal 100,
 *   pass 10, win 200: a superb 180 s match ~3200, ~16/s).
 *  Runner family, Strikers leagues, Summit Kick (a real 5/5 can land in ~7 s: tests/summit-kick.cjs) and the tennis tours (a best touch, 288 Pro / 432 Legend, can land about once a second:
 *  tests/tennis-polish-nov8.cjs) were already at ~1.5x their best pace and are unchanged. Not play-tested.
 */
export const BOARD_RULES:Record<BoardGame,{name:string;unit:string;max:number;base:number;perSecond:number;minSeconds:number;learn:string}>={
 // Breakaway Run endless play (Nov 10 2026, lib/arcade/runnerEndless.ts): a run on any route now ends only when the hearts run out (a goal
 // line clears a round and the run carries on), so the seven Breakaway boards' ceilings rose to 5,000,000 (were 120k-400k, sized to one
 // route length). A perfect-reading bot scores at most ~460 points a second, so 5M is about the three-hour session limit at that rate;
 // child-like bots end between 30k and 530k. The rates (3000 + 1500/s, 1800/s on the two elite boards) are UNCHANGED and stay the real
 // guard. Same board ids, same rows: nothing renamed or reset. Scores over 400000 need docs/arcade-aaa/endless-supabase.sql (the table's
 // score check, 9,000,000 there); until it runs they stay on the device.
 runner:{name:'Breakaway Run',unit:'points',max:5_000_000,base:3_000,perSecond:1_500,minSeconds:12,learn:'Read the open lane, then finish.'},
 // Nov 10 2026, endless pinball (lib/games/soccerPinballEndless.ts): a run now ends only on the last ball, so the ceilings of the
 // three pinball boards rose (400000 -> 3M / 6M / 9M: classic, x2 Derby Night, x3 World Final; a strong bot's 28-minute classic run
 // made 770000). The RATE is the guard and is unchanged: the ceiling needs 34-42 minutes of real session time at the full rate.
 // Scores over 400000 need docs/arcade-aaa/endless-supabase.sql (the table's score check); until then they stay on the device.
 pinball:{name:'Futbol Pinball',unit:'points',max:3_000_000,base:3_000,perSecond:1_200,minSeconds:20,learn:'Time your strike as the ball arrives.'},
 // Futbol Tennis endless play (Nov 10 2026, lib/arcade/tennisEndless.ts): a court run now ends only when its three balls are lost, and it
 // scores like the tours (every touch × combo, a won-point and a match-won bonus), so the board counts run POINTS, not the best rally.
 // Same board id, same rows, nothing reset: an old row is a rally of N touches, which under the new scoring is worth at least 3 points
 // a touch, so no old row is overstated. Best touch 10 × 4 (golden) × 4 (combo) × 1.1 (top court) × 2 (ramp) = 352, about once a second;
 // the real pace is far lower (a point and a walk between touches), so 400/s is the guard. Scores over 400000 need
 // docs/arcade-aaa/endless-supabase.sql (the table's score check); until then they stay on the device.
 tennis:{name:'Futbol Tennis',unit:'points',max:2_000_000,base:1_000,perSecond:400,minSeconds:15,learn:'A clean first touch keeps the rally alive.'},
 live:{name:'Island Strikers',unit:'match points',max:20_000,base:300,perSecond:25,minSeconds:30,learn:'Passes and goals both score. Win as a team.'},
 // Nov 10 2026 (owner: one board per game, existing scores stay): the Endless Run posts here too, in the same unit. A run pays at
 // most 4 stars a puzzle (lib/passPuzzle/endless.ts ENDLESS_MAX_STARS) and a puzzle cannot be loaded, struck and finished in under
 // about 2.5 s, so 1.6 stars/s is the best pace: rate 2. The base stays 300, so a star total (at most 3 x the catalog, a running
 // total that needs no play time) posts exactly as before. Ceiling 300 -> 3000 (750 perfect puzzles), far inside the table's 400000.
 puzzle:{name:'Pass Puzzles',unit:'stars',max:3_000,base:300,perSecond:2,minSeconds:8,learn:'Every star is a pass you learned to see.'},
 // Summit Kick (Summit Isle, Oct 12 2026; lib/town/summitKick.ts): at most 780 a round (5 hoops, accuracy, speed), so 1000 is the ceiling.
 kick:{name:'Summit Kick',unit:'points',max:1_000,base:400,perSecond:60,minSeconds:6,learn:'Pick a corner: keepers stand in the middle.'},
 // Breakaway elite tiers (Nov 8 2026): faster, denser routes that start at stage 5/6, so a slightly higher rate; the ceiling stays
 // inside the table's 400000 check.
 cupfinal:{name:'Cup Final Run',unit:'points',max:5_000_000,base:3_000,perSecond:1_800,minSeconds:12,learn:'Scan early: every defender moves.'},
 legend:{name:'Legend Run',unit:'points',max:5_000_000,base:3_000,perSecond:1_800,minSeconds:12,learn:'Two hearts. Pick the open lane every time.'},
 // Strikers leagues (Nov 8 2026, strikerTiers.ts): 2-minute matches, league points × 2 / × 3. A dream Legend match (10 goals with
 // every skill, a full combo and a streak, 60 passes, a win) is about 37000, so the ceilings sit above it and the rates above the
 // best real pace (goal pauses and replays make a 120 s match last 150 s or more); the table's own check is 1..400000.
 livepro:{name:'Strikers Pro League',unit:'league points',max:40_000,base:1_000,perSecond:170,minSeconds:30,learn:'Faster Blue. Pass in a combo, then finish.'},
 livelgnd:{name:'Strikers Legend League',unit:'league points',max:60_000,base:1_500,perSecond:250,minSeconds:30,learn:'Small goals. Combos and skill shots win it.'},
 // Tennis tours (Nov 8 2026, soccerTennis.ts TENNIS_TOURS): a touch scores at most 10 × 4 (golden) × 4 (combo) × 1.8 (ramp) × scale (1 Pro,
 // 1.5 Legend) and you touch at most about once a second, plus a won-point bonus, so the rates sit above the best real pace; endless
 // tours stop when the balls run out, and the ceilings sit far above a very long run (the table's own check is 1..400000).
 // Endless play (Nov 10 2026): a tour wins a ball back every 5 won points and the match ramp doubles a touch by match 10 (best touch 576
 // Pro / 864 Legend), so the rates doubled and the ceilings rose to 3,000,000 / 4,500,000 (both under the pending 9,000,000 table check).
 tenpro:{name:'Tennis Pro Tour',unit:'tour points',max:3_000_000,base:2_500,perSecond:600,minSeconds:20,learn:'Perfect touches score triple. Keep the combo.'},
 tenlgnd:{name:'Tennis Legend Tour',unit:'tour points',max:4_500_000,base:3_500,perSecond:900,minSeconds:20,learn:'Two balls. Read the landing ring, plant, strike.'},
 // Pinball elite tiers (Nov 8 2026, soccerPinballTiers.ts): the table runs ×1.12 / ×1.22 faster and every point is ×2 / ×3, so the
 // classic rate (2500/s, already far above a real run) scales by speed × multiplier; the ceilings are 6M and 9M since endless play (Nov 10 2026, above).
 pinderby:{name:'Pinball Derby Night',unit:'points',max:6_000_000,base:6_000,perSecond:2_700,minSeconds:20,learn:'Faster ball, shorter flippers: read the drop early.'},
 pinfinal:{name:'Pinball World Final',unit:'points',max:9_000_000,base:9_000,perSecond:4_400,minSeconds:20,learn:'Two balls, no ball save. Every block counts.'},
 // Pass Puzzles cups (Nov 8 2026, lib/passPuzzle/tiers.ts): cup points = stars × 100 × skill (at most ×2.75), summed over the cup's 6
 // puzzles, so at most 4950. Like the star board it is a running total (no per-second rule); the ceiling sits just above the max.
 puzpro:{name:'Pass Puzzles Pro Cup',unit:'cup points',max:5_000,base:5_000,perSecond:0,minSeconds:8,learn:'Beat the clock. First-try passes score more.'},
 puzlgnd:{name:'Pass Puzzles Legend Cup',unit:'cup points',max:5_000,base:5_000,perSecond:0,minSeconds:8,learn:'Two tries, hunters everywhere. Pass early.'},
 // Breakaway finite routes and the Daily Run (Nov 10 2026). Same rate as the 'runner' board they used to post to (3000 + 1500/s, not
 // loosened), and a ceiling from the route length: a goal is at most (500 x 3 streak + 300 precision) x3 multiplier = 5400, x2 in a
 // danger lane, one every 180 m (about 60 points a metre at the very best), plus lines, dodges and pickups (about 25 a metre) and the
 // boss keeper's double goal; so length x 100 + 25000, rounded up. Not play-tested: real runs sit far below.
 // (Endless play, same day: those per-route ceilings became 5,000,000; see the note above 'runner'.)
 runwarm:{name:'Warm-up Run',unit:'points',max:5_000_000,base:3_000,perSecond:1_500,minSeconds:12,learn:'Move into the open lane early.'},
 runnight:{name:'Night Derby Run',unit:'points',max:5_000_000,base:3_000,perSecond:1_500,minSeconds:12,learn:'Watch a defender drift, then take the gap.'},
 runstorm:{name:'Storm Final Run',unit:'points',max:5_000_000,base:3_000,perSecond:1_500,minSeconds:12,learn:'Jump the tackle, then slide the line.'},
 rundaily:{name:'Daily Run',unit:'points',max:5_000_000,base:3_000,perSecond:1_500,minSeconds:12,learn:'Same course for everyone today. Your first run counts.'},
 // Kit Rush (Nov 10 2026): a swipe scores 10+20+..+60 for six kits plus a 60 call bonus, doubled by the armband for 8 s; waves never
 // come faster than one per 0.68 s, so 300/s is far above any real run (bots: 20-45/s) and still shuts out typed-in scores.
 kitrush:{name:'Kit Rush',unit:'points',max:60_000,base:400,perSecond:300,minSeconds:8,learn:'Know your team at a glance. Scan, then swipe.'},
 kitdaily:{name:'Daily Rush',unit:'points',max:60_000,base:400,perSecond:300,minSeconds:8,learn:'Same kit bag for everyone today. Your first run counts.'},
 // Squad Snake (Nov 10 2026, endless): points are x level, capped at x12. At the cap a squad is 11 x 120 + 4800 (coach's call) = 6120 points and
 // cannot take under ~7 s (pick-ups stand 3+ cells away at .15 s a cell, plus the 1.5 s beat), and every earlier level pays far less, so
 // 700/s over the whole session is above any real run (bots: 15-60/s) and still shuts out typed-in scores. 3M is ~2 hours at the top rate.
 snake:{name:'Squad Snake',unit:'points',max:3_000_000,base:800,perSecond:700,minSeconds:8,learn:'Call your eleven. Build the shape.'},
 airhockey:{name:'Air Futbol',unit:'points',max:2_000_000,base:500,perSecond:220,minSeconds:10,learn:'Play the angles. Guard your goal.'},// solo run only: 2,525 points is the most one first-to-5 match can pay (tests/airhockey-core.cjs), and a match takes well over 12 s
 snakedaily:{name:'Daily Squad',unit:'points',max:3_000_000,base:800,perSecond:700,minSeconds:8,learn:'Same squad list for everyone today. Your first run counts.'},
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
/** Nov 8 2026: boards whose score is a running total (the Pass Puzzles cups), so the same letters keep one row, like 'puzzle'. */
export const RUNNING_TOTAL_BOARDS:ReadonlySet<string>=new Set(['puzpro','puzlgnd']);
/** Adds a score to the device board for `game`; returns the new boards and the entry's rank (null when it didn't make the top 10). */
export function addLocalScore(b:LocalBoards,game:BoardGame,e:{initials:string;icon:string;score:number;now:number}):{boards:LocalBoards;rank:number|null;entry:LocalEntry}{
 const seq=b.seq+1,entry:LocalEntry={initials:e.initials,icon:e.icon,score:e.score,day:dayOf(e.now),week:weekOf(e.now),seq};
 // Pass Puzzles' score is a running total of stars, so the same letters keep one row (their best), not one row per new star.
 const kept=(b.boards[game]??[]).filter(r=>!((game==='puzzle'||RUNNING_TOTAL_BOARDS.has(game))&&r.initials===e.initials&&r.score<=e.score));
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
