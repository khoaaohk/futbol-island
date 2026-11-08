/**
 * Pass Puzzles cup tiers (Nov 8 2026): Pro Cup and Legend Cup, two hard tiers above Expert, each with its OWN high-score board
 * ('puzpro', 'puzlgnd' in lib/arcade/leaderboard.ts) so the classic star board ('puzzle') is never mixed or reset.
 *
 * Rules a child can say back:
 *  - Pro Cup: every puzzle is on the clock and a defender is always moving (a hunter, a runner sprinting back, a sweeper keeper).
 *  - Legend Cup: the clock is tighter, only 2 tries, and up to two hunters chase every pass.
 * A cup puzzle scores CUP POINTS = stars × 100 × the skill multiplier (first try, no extra passes, a through ball, one-touch
 * play, time to spare). The cup board shows the sum of the child's best cup points per puzzle (a running total, one row per
 * letters, like the star board). Coins are unchanged: the same first-solve + new-star payout as every puzzle (lib/economy.ts).
 *
 * The 12 puzzles are new layouts: each one is an earlier idea played on the other wing, with an extra moving defender and the
 * counter clock added (so the move has to be quicker and earlier). Every route is proven by tests/puzzle-polish-nov8.cjs through
 * readStroke (solves, earns the bonus, beats the clock, survives a sloppy finger, works with heading off; the naive pass fails).
 * Pure data + pure functions: no DOM, no three.js, no allocation in a frame loop.
 */
import type {Scenario,Kick,KickKind,Vec2,Format} from './types';
import type {Pack,PackSolution,Step} from './packs';

export type PuzzleTierId='pro'|'legend';
export type PuzzleTierBoard='puzpro'|'puzlgnd';
export type PuzzleTier={id:PuzzleTierId;board:PuzzleTierBoard;pack:string;title:string;
  /** one short rule line for the tile and the brief */
  rule:string;
  /** stars (classic packs) needed to open the cup: skill unlocks content, never coins */
  gate:number;attempts:number;
  /** the tier's look (existing arcade colours only), read by CSS as data-tier and by the scene's trail tint */
  look:'gold'|'violet'};

export const PUZZLE_TIERS:Record<PuzzleTierId,PuzzleTier>={
  pro:{id:'pro',board:'puzpro',pack:'pro-cup',title:'Pro Cup',rule:'On the clock. A defender is always moving.',gate:72,attempts:3,look:'gold'},
  legend:{id:'legend',board:'puzlgnd',pack:'legend-cup',title:'Legend Cup',rule:'Tighter clock, 2 tries, hunters everywhere.',gate:96,attempts:2,look:'violet'},
};
export const PUZZLE_TIER_IDS:PuzzleTierId[]=['pro','legend'];
export const TIER_PACKS:Pack[]=[
  {id:'pro-cup',order:7,title:'Pro Cup',blurb:'Every puzzle is on the clock, and a defender is always moving.',gate:PUZZLE_TIERS.pro.gate},
  {id:'legend-cup',order:7.5,title:'Legend Cup',blurb:'A tighter clock, only 2 tries, and hunters chase every pass.',gate:PUZZLE_TIERS.legend.gate},
];
export const tierOfPack=(pack:string):PuzzleTier|undefined=>PUZZLE_TIER_IDS.map(id=>PUZZLE_TIERS[id]).find(t=>t.pack===pack);
export const isTierPuzzle=(id:string)=>id.startsWith('pc-')||id.startsWith('lc-');

/* ───────────── skill multiplier (cup points) ───────────── */
export type SkillInput={stars:number;firstTry:boolean;passes:number;minPasses:number;throughBall:boolean;oneTouch:number;
  /** seconds of the counter clock left at the goal, and the clock itself (undefined = no clock) */
  clockLeft?:number;clock?:number};
export type SkillPart={key:'first-try'|'clean'|'through'|'one-touch'|'quick';label:string;add:number};
/** Each skill adds to ×1. Kid words, one per chip. */
export const SKILL_ADDS={firstTry:.5,clean:.25,through:.25,oneTouch:.25,oneTouchMax:2,quick:.25,quickShare:.25} as const;
export const SKILL_MAX=1+SKILL_ADDS.firstTry+SKILL_ADDS.clean+SKILL_ADDS.through+SKILL_ADDS.oneTouch*SKILL_ADDS.oneTouchMax+SKILL_ADDS.quick;// 2.75
export const POINTS_PER_STAR=100;
/** The most one cup puzzle can ever score (3 stars at the full multiplier). */
export const TIER_PUZZLE_MAX=Math.round(3*POINTS_PER_STAR*SKILL_MAX);
export function skillMultiplier(i:SkillInput):{mult:number;parts:SkillPart[]}{
  const parts:SkillPart[]=[];
  if(i.firstTry)parts.push({key:'first-try',label:'First try',add:SKILL_ADDS.firstTry});
  if(i.passes===i.minPasses&&i.minPasses>0)parts.push({key:'clean',label:'No extra passes',add:SKILL_ADDS.clean});
  if(i.throughBall)parts.push({key:'through',label:'Through ball',add:SKILL_ADDS.through});
  const touches=Math.max(0,Math.min(SKILL_ADDS.oneTouchMax,Math.floor(i.oneTouch||0)));
  if(touches>0)parts.push({key:'one-touch',label:touches>1?`One-touch ×${touches}`:'One-touch',add:SKILL_ADDS.oneTouch*touches});
  if(i.clock&&i.clockLeft!==undefined&&i.clockLeft>=i.clock*SKILL_ADDS.quickShare)parts.push({key:'quick',label:'Time to spare',add:SKILL_ADDS.quick});
  const mult=Math.min(SKILL_MAX,1+parts.reduce((n,p)=>n+p.add,0));
  return {mult:Math.round(mult*100)/100,parts};
}
/** Cup points for one solve: stars × 100 × multiplier (0 for a fail). */
export function cupPoints(i:SkillInput){if(!(i.stars>0))return 0;const s=Math.min(3,Math.floor(i.stars));return Math.min(TIER_PUZZLE_MAX,Math.round(s*POINTS_PER_STAR*skillMultiplier(i).mult));}
/** A cup board score: the sum of the child's best points on that cup's puzzles (each clamped to the puzzle maximum). */
export function tierBoardScore(best:Record<string,number>,tier:PuzzleTierId){
  return TIER_SCENARIOS.filter(s=>s.pack===PUZZLE_TIERS[tier].pack).reduce((n,s)=>{const v=best[s.id];return n+(Number.isFinite(v)&&v>0?Math.min(TIER_PUZZLE_MAX,Math.floor(v)):0);},0);
}
/** The highest score a cup board can hold (every puzzle at the full multiplier). */
export const tierBoardMax=(tier:PuzzleTierId)=>TIER_SCENARIOS.filter(s=>s.pack===PUZZLE_TIERS[tier].pack).length*TIER_PUZZLE_MAX;

/* ───────────── the puzzles ───────────── */
const K=(kind:KickKind,x:number,z:number,o:Partial<Kick>={}):Kick=>({kind,target:{x,z},curl:0,loft:0,power:.5,...o});
const C=(attacker:number,x:number,z:number):Step=>({call:{attacker,to:{x,z}}});
type Data={id:string;pack:string;src:string;pitch:Scenario['pitch'];carrier:number;attackers:Scenario['attackers'];defenders:Scenario['defenders'];
  keeper?:Scenario['keeper'];minPasses:number;clock:number;bonus:NonNullable<Scenario['bonus']>;solution:Step[];naive:Step[]};
void ({} as Vec2);
const DATA:Data[]=[
 {id:'pc-scan-and-strike',pack:'pro-cup',src:'ss-look-up',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:5},{x:7,z:12},{x:0,z:15},{x:-8.5,z:16}],
  defenders:[{x:5.2,z:10.6,mark:1},{x:0,z:10},{x:3,z:18.5},{x:12,z:4,recover:true}],keeper:{x:0,z:24},minPasses:1,clock:3,bonus:{kind:'first-time',label:'Shoot first time'},
  solution:[K('pass-feet',-8.5,16,{receiver:3}),K('shot',2.75,25)],
  naive:[K('pass-feet',0,15,{receiver:2})]},
 {id:'pc-hunted-one-two',pack:'pro-cup',src:'tm-give-and-go',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:11,run:{delay:0.05,afterPass:true,path:[{x:-2,z:14},{x:-2,z:19}]}},{x:6,z:14.5}],
  defenders:[{x:-0.5,z:14,press:true},{x:5,z:19.5},{x:5,z:7,hunt:true}],keeper:{x:0,z:24},minPasses:2,clock:4.3,bonus:{kind:'scorer',scorer:0,label:'The passer scores'},
  solution:[K('pass-feet',6,14.5,{receiver:1,power:0.23}),K('pass-space',-2,17.5,{receiver:0,power:0.26}),K('shot',-2.7,25,{power:0.31})],
  naive:[K('shot',-0.5,25,{power:0.52})]},
 {id:'pc-trap-on-the-run',pack:'pro-cup',src:'tr-beat-the-trap',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:4},{x:-3,z:14,run:{delay:0,path:[{x:-3,z:22}]}},{x:3,z:8,run:{delay:0,path:[{x:1,z:22}]}}],
  defenders:[{x:5,z:14.5,trap:3},{x:-6,z:14.5,trap:3},{x:-12,z:4,recover:true}],keeper:{x:0,z:24},minPasses:1,clock:3.5,bonus:{kind:'scorer',scorer:2,label:'The deep runner scores'},
  solution:[K('pass-space',3,19,{receiver:2}),K('shot',2.75,25)],
  naive:[K('pass-space',-3,19,{receiver:1})]},
 {id:'pc-split-the-line',pack:'pro-cup',src:'bp-through-the-gap',pitch:{halfWidth:25,length:60,goalWidth:7.32},carrier:0,
  attackers:[{x:0,z:2},{x:0,z:15},{x:-8.5,z:16,run:{delay:0.9,path:[{x:-7,z:20}]}}],
  defenders:[{x:5,z:9},{x:-5,z:9},{x:1.5,z:20},{x:-5,z:-2,hunt:true}],keeper:{x:0,z:29},minPasses:2,clock:4.8,bonus:{kind:'scorer',scorer:2,label:'The runner scores'},
  solution:[K('pass-feet',0,15,{receiver:1,power:0.42}),K('pass-space',-3.5,19.5,{receiver:2,power:0.26}),K('shot',3.4,30,{power:0.48})],
  naive:[K('pass-space',-3.5,19.5,{receiver:2,power:0.58})]},
 {id:'pc-beat-the-sweeper',pack:'pro-cup',src:'tm-third-friend',pitch:{halfWidth:25,length:60,goalWidth:7.32},carrier:0,
  attackers:[{x:4,z:4},{x:3,z:12},{x:-8.5,z:15.5,run:{delay:1.2,path:[{x:-6,z:20.5}]}}],
  defenders:[{x:5,z:16},{x:-3,z:10}],keeper:{x:0,z:29,sweeper:true},minPasses:2,clock:4.8,bonus:{kind:'scorer',scorer:2,label:'The runner scores'},
  solution:[K('pass-feet',3,12,{receiver:1,power:0.26}),K('pass-space',-2,18.5,{receiver:2,power:0.32}),K('shot',3.4,30,{power:0.49})],
  naive:[K('pass-feet',-8.5,15.5,{receiver:2,power:0.56})]},
 {id:'pc-press-escape',pack:'pro-cup',src:'ex-chain-under-press',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:0,run:{delay:0.2,afterPass:true,path:[{x:2,z:7}]}},{x:9,z:2},{x:-8,z:-2},{x:-3,z:13}],
  defenders:[{x:-2.5,z:2,hunt:true},{x:1.5,z:8.5},{x:-8,z:15},{x:6,z:12,recover:true},{x:5,z:-4,hunt:true}],keeper:{x:0,z:24},minPasses:3,clock:6,bonus:{kind:'scorer',scorer:3,label:'The striker scores'},
  solution:[K('pass-feet',9,2,{receiver:1}),K('pass-feet',-8,-2,{receiver:2}),K('pass-feet',-3,13,{receiver:3}),K('shot',-2.75,25)],
  naive:[K('pass-feet',-3,13,{receiver:3})]},
 {id:'lc-hunter-on-your-heels',pack:'legend-cup',src:'fp-run-onto-it',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:4},{x:-6,z:12,run:{delay:0,path:[{x:-1,z:16.5}]}}],
  defenders:[{x:-4.5,z:10},{x:9,z:16},{x:5,z:0,hunt:true}],keeper:{x:0,z:24},minPasses:1,clock:3.2,bonus:{kind:'first-time',label:'Shoot first time'},
  solution:[K('pass-space',0,15,{receiver:1,power:0.36}),K('shot',2.75,25,{power:0.41})],
  naive:[K('pass-feet',-6,12,{receiver:1,power:0.32})]},
 {id:'lc-double-trouble',pack:'legend-cup',src:'ex-trap-and-hunter',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:4},{x:-3,z:14,run:{delay:0,path:[{x:-3,z:22}]}},{x:3,z:8,run:{delay:0,path:[{x:1,z:22}]}}],
  defenders:[{x:5,z:14.5,trap:3},{x:-6,z:14.5,trap:3},{x:-3,z:7,hunt:true},{x:-12,z:4,recover:true}],keeper:{x:0,z:24},minPasses:1,clock:3.1,bonus:{kind:'scorer',scorer:2,label:'The deep runner scores'},
  solution:[K('pass-space',3,19,{receiver:2}),K('shot',2.75,25)],
  naive:[K('pass-space',-3,19,{receiver:1})]},
 {id:'lc-send-the-third',pack:'legend-cup',src:'ss-third-runner',pitch:{halfWidth:25,length:60,goalWidth:7.32},carrier:0,
  attackers:[{x:4,z:4},{x:3,z:12},{x:-12,z:8}],
  defenders:[{x:5,z:16},{x:-3,z:10},{x:-1,z:0,hunt:true}],keeper:{x:0,z:29},minPasses:2,clock:4.3,bonus:{kind:'scorer',scorer:2,label:'The third friend scores'},
  solution:[C(2,-7,15.5),K('pass-feet',3,12,{receiver:1}),K('pass-space',-4,20,{receiver:2}),K('shot',3.4,30)],
  naive:[K('pass-feet',3,12,{receiver:1}),K('pass-space',-4,20,{receiver:2}),K('shot',3.4,30)]},
 {id:'lc-clockwork-one-two',pack:'legend-cup',src:'ex-one-two-clock',pitch:{halfWidth:25,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:11,run:{delay:0.05,afterPass:true,path:[{x:-2,z:14},{x:-2,z:19}]}},{x:6,z:14.5},{x:-9,z:19.5}],
  defenders:[{x:-0.5,z:14,press:true},{x:0,z:22},{x:9,z:9,recover:true},{x:5,z:7,hunt:true}],keeper:{x:0,z:24},minPasses:3,clock:4.9,bonus:{kind:'scorer',scorer:2,label:'The free friend scores'},
  solution:[K('pass-feet',6,14.5,{receiver:1,power:0.226}),K('pass-space',-2,17.5,{receiver:0,power:0.257}),K('pass-feet',-9,19.5,{receiver:2,power:0.265}),K('shot',-2.75,25,{power:0.273})],
  naive:[K('pass-feet',6,14.5,{receiver:1}),K('pass-space',-2,17.5,{receiver:0}),K('shot',2.75,25)]},
 {id:'lc-two-hunters',pack:'legend-cup',src:'ex-set-and-switch',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:3},{x:1.8,z:15},{x:2.5,z:6.5},{x:-13,z:11,run:{delay:1.5,path:[{x:-9,z:17.5}]}}],
  defenders:[{x:1.8,z:16.4,mark:1},{x:-4.8,z:6.9},{x:5,z:18},{x:9,z:13},{x:-6,z:1,hunt:true},{x:-5,z:-1,hunt:true}],keeper:{x:0,z:24},minPasses:3,clock:5.3,bonus:{kind:'scorer',scorer:3,label:'The far runner scores'},
  solution:[K('pass-feet',1.8,15,{receiver:1}),K('pass-feet',2.5,6.5,{receiver:2}),K('pass-space',-4.8,19.7,{receiver:3}),K('shot',2.75,25)],
  naive:[K('pass-space',-4.8,19.7,{receiver:3}),K('shot',2.75,25)]},
 {id:'lc-five-touch-move',pack:'legend-cup',src:'ex-four-pass-move',pitch:{halfWidth:20,length:50,goalWidth:6},carrier:0,
  attackers:[{x:0,z:5},{x:4,z:16},{x:-4,z:10,run:{delay:0.3,path:[{x:-4,z:13.5}]}},{x:9,z:11}],
  defenders:[{x:-2.3,z:9.8},{x:4,z:17.5,mark:1},{x:6,z:7},{x:-12,z:4,recover:true}],keeper:{x:0,z:24},minPasses:4,clock:5.5,bonus:{kind:'first-time',label:'Shoot first time'},
  solution:[K('pass-feet',4,16,{receiver:1,power:0.38}),K('pass-feet',-4,13,{receiver:2,power:0.24}),K('pass-feet',9,11,{receiver:3}),K('pass-feet',-4,13,{receiver:2}),K('shot',2.6,25)],
  naive:[K('pass-feet',4,16,{receiver:1}),K('pass-feet',-4,13,{receiver:2}),K('shot',2.6,25)]},
];

const same=(a:string,b:string,c:string):Record<Format,string>=>({'7v7':a,'9v9':b,'11v11':c});
type Copy={title:string;concept:string;brief:Record<Format,string>;hint:Record<Format,string>;lesson:string};
/** Kid words first (7v7), more football words as the format grows. Hints teach the idea; they never name the exact pass. */
const COPY:Record<string,Copy>={
  'pc-scan-and-strike':{title:'Scan and Strike',concept:'scan-on-the-clock',
    brief:same('The clock is on and a defender sprints back. Look left before you pass!','Two friends are marked. Look up, find the free one on the far side, and finish fast.','Two options are screened and a defender recovers. Scan the far side and finish before he arrives.'),
    hint:same('The friend in the middle is blocked. Who has nobody near them?','Check both sides before you pass. The free friend is away from the ball.','The near options are covered. The free player is on the weak side.'),
    lesson:'Look up before you pass. The free friend is often on the far side.'},
  'pc-hunted-one-two':{title:'One-Two Under Fire',concept:'one-two-vs-hunter',
    brief:same('A hunter chases the ball. Pass, run, get it back, and score!','A defender hunts every pass and the clock is on. Play the one-two and finish yourself.','A hunter presses each receiver on the clock. Give and go, then finish the move yourself.'),
    hint:same('After you pass, you run. Your friend can pass it back.','The return pass goes into your run, not to where you stood.','Release early and attack the space: the wall pass beats the press.'),
    lesson:'Pass and move. A quick one-two beats a chasing defender.'},
  'pc-trap-on-the-run':{title:'Trap on the Run',concept:'trap-on-the-clock',
    brief:same('The defenders step up together. A runner from the back is your answer!','The line steps up to catch your striker, and a defender sprints back. Find the deep runner.','An offside trap with a recovering defender. Release the runner arriving from deep, early.'),
    hint:same('Someone starts behind the line. They are never offside when you pass.','Watch who is running from deep. Pass before the line and the sprinter close.','The deep runner is onside at the pass. Timing beats the trap.'),
    lesson:'A runner from deep beats a trap. Pass before the defence recovers.'},
  'pc-split-the-line':{title:'Split the Line',concept:'through-ball-window',
    brief:same('Pass up to the middle friend. Then send the runner through the gap!','Two passes: up to the striker, then a through ball before the hunter arrives.','Play into the striker, then slide the runner through the gap before the press closes it.'),
    hint:same('The runner is not free yet. Find the friend who can see them.','The gap opens for a moment. The striker has the best view of it.','Go through the middle first; the through ball comes from the second pass.'),
    lesson:'A through ball goes into space, where the runner will be.'},
  'pc-beat-the-sweeper':{title:'Beat the Sweeper',concept:'third-man-vs-sweeper',
    brief:same('This keeper runs out fast. Pass, pass, then shoot before they reach it!','A sweeper keeper rushes out. Use the third friend and finish quickly.','The keeper sweeps behind the line. A quick third-man move gets the runner in first.'),
    hint:same('The far friend is not free yet. A pass in the middle helps.','The middle friend turns it on to the runner. Do not wait.','Bounce it through the middle; the runner must arrive before the keeper.'),
    lesson:'Against a keeper who rushes out, the move must be quick and early.'},
  'pc-press-escape':{title:'Escape the Press',concept:'two-hunters',
    brief:same('Two hunters chase you. Pass to the sides first, then find the striker!','Two hunters press and the clock is on. Go wide, switch it, then play the striker in.','Two hunters press every receiver. Circulate wide to wide, then break the line.'),
    hint:same('Going forward first gets blocked. Try the sides first.','Each pass pulls a hunter. Two side passes free the forward pass.','Play away from the press twice, then the vertical pass is open.'),
    lesson:'Pass away from the press. Then the forward pass opens up.'},
  'lc-hunter-on-your-heels':{title:'Hunter on Your Heels',concept:'early-through-ball',
    brief:same('A hunter is right behind you. Pass into the runner’s path, now!','Only two tries. The hunter closes fast, so play the runner in early.','Two tries, a hunter closing. An early ball into the run beats the press.'),
    hint:same('Do not pass to their feet. Pass to where they are running.','Aim ahead of the runner. Their run carries them onto it.','Lead the runner: pass to the space, not the player.'),
    lesson:'Pass early into a run. Waiting lets the hunter close you down.'},
  'lc-double-trouble':{title:'Double Trouble',concept:'trap-hunter-recover',
    brief:same('A trap, a hunter and a sprinter. Pass fast to the friend from behind!','Trap, hunter and a recovering defender at once. Release the deep runner quickly.','An offside trap, a hunter and a recovering defender. Find the deep runner on the first pass.'),
    hint:same('Your striker will be offside. Look for the friend running from the back.','Only the deep runner is onside when the line steps up.','The runner from deep starts behind the line. Release before the press arrives.'),
    lesson:'Against a trap and a press, the runner from deep is the answer.'},
  'lc-send-the-third':{title:'Send the Third Runner',concept:'called-third-run',
    brief:same('Drag the far friend into a run first. Then pass, pass, score!','Call the far runner’s run, then use the middle friend to find them.','Send the far-side run, then play the third-man combination before the hunter arrives.'),
    hint:same('Start your drag on the far friend. Send them toward the goal.','Movement first: send the run, then the middle friend can find it.','The third run must start before the first pass, or it arrives too late.'),
    lesson:'A run you call before the pass makes the third-man move work.'},
  'lc-clockwork-one-two':{title:'Clockwork One-Two',concept:'one-two-plus-one',
    brief:same('Pass, get it back, then pass to the free friend. Two tries only!','One-two, then one more pass, with a hunter and a sprinter chasing.','A one-two, then square it to the spare player. Two tries against the press and a recovery run.'),
    hint:same('After the one-two, someone is free on the other side.','The defenders follow the one-two. The far friend is left free.','Give and go, then find the spare man: two defenders cannot cover three of you.'),
    lesson:'A one-two pulls defenders in. The next pass finds the free friend.'},
  'lc-two-hunters':{title:'Two Hunters',concept:'set-switch-two-hunters',
    brief:same('Up, back, then far! Two hunters chase every pass.','Bounce it off the striker, then find the far runner. Two hunters press.','Up, back and through against two hunters. The set-back changes the angle.'),
    hint:same('The striker passes it back. Then look at the far friend.','The friend who gets it back can see the runner. Be quick.','The set-back receiver plays the far runner in before both hunters close.'),
    lesson:'Up, back and through still works if every pass is quick.'},
  'lc-five-touch-move':{title:'The Big Move',concept:'four-pass-recover',
    brief:same('Make four passes, then shoot first time. A defender sprints back!','Four passes before the finish, with a recovering defender closing.','A four-pass move against a recovering defender. Keep it moving, then finish first time.'),
    hint:same('Keep passing to whoever is free. Then shoot without stopping.','Use the striker as a wall, then keep it moving to the free friend.','Quick and simple: the last pass goes to the player nobody is marking.'),
    lesson:'A long move needs quick, simple passes to the free friend.'},
};

export const TIER_SCENARIOS:Scenario[]=DATA.map(d=>{const c=COPY[d.id],tier=tierOfPack(d.pack)!;return {id:d.id,pack:d.pack,title:c.title,concept:c.concept,brief:c.brief,hint:c.hint,
  pitch:d.pitch,carrier:d.carrier,attackers:d.attackers,defenders:d.defenders,keeper:d.keeper,attempts:tier.attempts,
  require:{minPasses:d.minPasses,finish:'goal',offside:true,clock:d.clock},bonus:d.bonus,lesson:c.lesson};});
export const TIER_SOLUTIONS:Record<string,PackSolution>=Object.fromEntries(DATA.map(d=>[d.id,{solution:d.solution,naive:d.naive}]));
/** Where each cup puzzle's idea came from (for tests: a new layout, never a copy). */
export const TIER_SOURCES:Record<string,string>=Object.fromEntries(DATA.map(d=>[d.id,d.src]));
/** The board a puzzle's score goes to: its cup's board, or the classic star board. */
export const boardForPuzzle=(id:string,pack?:string):'puzzle'|PuzzleTierBoard=>{const t=pack?tierOfPack(pack):TIER_SCENARIOS.find(s=>s.id===id)&&tierOfPack(TIER_SCENARIOS.find(s=>s.id===id)!.pack);return t?t.board:'puzzle';};
