/**
 * "Today in the arcade" (Nov 10 2026, part 2 of the arcade audit). Pure rules, no storage, no React: the browser side is
 * arcadeToday.ts. One daily challenge per cabinet, picked from the local play day (lib/town/dailyPlay.ts localPlayDay), so every
 * child sees the same five challenges that day and nothing needs a server.
 *
 *  - Each challenge is checked against what a finished game leaves behind (the result adapters in lib/arcade/results/ carry
 *    `today` facts; Strikers and Pass Puzzles build theirs where they finish).
 *  - A challenge done pays LEARN_COINS.arcade once per challenge per day (lib/economy.ts) through the wallet's creditOnce,
 *    id `learn:arcade:<day>:<cabinet>`, so replaying or reloading never pays it twice. Never metered. Playing still costs what
 *    it costs; the card adds no sink.
 *  - Weekly pennant (soft): challenges done on 3 different days of one week (Monday start, local) light the pennant. No
 *    streak counter, nothing lost by skipping a day.
 * Football first (AGENTS.md): every challenge carries the one football idea it practises.
 */
export type TodayCabinet='runner'|'puzzle'|'pinball'|'tennis'|'live';
export const TODAY_CABINETS:readonly TodayCabinet[]=['runner','puzzle','live','tennis','pinball'];

/** What a finished game tells the card (one shape per cabinet). */
export type TodayFacts=
 |{kind:'runner';mode:string;day?:string}
 |{kind:'puzzle';id:string}
 |{kind:'pinball';hot:number;moves:number;goals:number}
 |{kind:'tennis';court:number;won:boolean;rally:number;perfect:number;clean:number;tour:number}
 |{kind:'live';passes:number;openPasses:number;firstTimeGoals:number;cleanWin:boolean;setPieceGoals:number};

export type TodayChallenge={cabinet:TodayCabinet;id:string;line:string;point:string;met:(f:TodayFacts,day:string)=>boolean};
type Rule=Omit<TodayChallenge,'cabinet'>;

/** Tennis court names used in the copy (tests/arcade-today.cjs checks them against TENNIS_COURTS). */
export const TODAY_TENNIS_COURTS=['First Touch','Beach Day'] as const;

const POOLS:Record<TodayCabinet,readonly Rule[]>={
 runner:[{id:'daily-run',line:'Finish today’s Daily Run.',point:'Run into space: look up and pick the gap.',
  met:(f,day)=>f.kind==='runner'&&f.mode==='daily'&&f.day===day}],
 puzzle:[{id:'daily-puzzle',line:'Solve today’s puzzle.',point:'See the space first, then draw the pass.',
  met:(f,day)=>f.kind==='puzzle'&&f.id===`daily-${day}`}],
 pinball:[
  {id:'hot-3',line:'Roll through 3 hot zones in one game.',point:'Find the space: attack the gap, not the defender.',met:f=>f.kind==='pinball'&&f.hot>=3},
  {id:'moves-2',line:'Score 2 goals from a passing move.',point:'Pass before you shoot: the keeper has to move.',met:f=>f.kind==='pinball'&&f.moves>=2},
  {id:'goals-4',line:'Score 4 goals in one game.',point:'Be brave in the box: shoot when you see the goal.',met:f=>f.kind==='pinball'&&f.goals>=4},
  {id:'hot-move',line:'Hit 2 hot zones and score a passing move.',point:'Move the ball into space, then finish.',met:f=>f.kind==='pinball'&&f.hot>=2&&f.moves>=1},
 ],
 tennis:[
  {id:'rally-8-first',line:`Keep an 8-touch rally on ${TODAY_TENNIS_COURTS[0]}.`,point:'Let it bounce, plant your feet, then kick.',met:f=>f.kind==='tennis'&&!f.tour&&f.court===1&&f.rally>=8},
  {id:'perfect-5',line:'Land 5 Perfect touches in one match.',point:'A soft first touch buys you time on the ball.',met:f=>f.kind==='tennis'&&f.perfect>=5},
  {id:'rally-12',line:'Keep a 12-touch rally.',point:'Be patient: keep the ball alive and wait for the gap.',met:f=>f.kind==='tennis'&&f.rally>=12},
  {id:'win-beach',line:`Win a match on ${TODAY_TENNIS_COURTS[1]}.`,point:'On sand the bounce is low: move early, bend your knees.',met:f=>f.kind==='tennis'&&!f.tour&&f.court===2&&f.won},
  {id:'clean-10',line:'Make 10 clean returns in one match.',point:'Clean contact sends the ball where you aim.',met:f=>f.kind==='tennis'&&f.clean>=10},
 ],
 live:[
  {id:'passes-8',line:'Complete 8 passes in one match.',point:'Pass and move: the ball runs faster than any player.',met:f=>f.kind==='live'&&f.passes>=8},
  {id:'first-time',line:'Score a first-time goal.',point:'Shoot first time: the keeper has no time to set.',met:f=>f.kind==='live'&&f.firstTimeGoals>=1},
  {id:'open-6',line:'Play 6 passes into open lanes.',point:'Scan first: pass where no defender can reach.',met:f=>f.kind==='live'&&f.openPasses>=6},
  {id:'clean-win',line:'Win without letting a goal in.',point:'Defend as a team: everyone helps when we lose the ball.',met:f=>f.kind==='live'&&f.cleanWin},
  {id:'set-piece',line:'Score from a set piece.',point:'A set piece is a planned chance: pick your spot.',met:f=>f.kind==='live'&&f.setPieceGoals>=1},
 ],
};

/** Island Strikers' facts at full time (the match state's own counters, lib/arcade/strikerMatch.ts). */
export function strikerTodayFacts(s:{userPassesDone:number;safePasses:number;firstTimeGoals:number;setPieceGoals:number;score:number[]},winner:number):TodayFacts{
 return {kind:'live',passes:s.userPassesDone,openPasses:s.safePasses,firstTimeGoals:s.firstTimeGoals,cleanWin:winner===0&&s.score[1]===0,setPieceGoals:s.setPieceGoals};
}
/** FNV-1a of the day and cabinet: the same pick for everyone on that day. */
function hash(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h;}
export function todayChallenge(day:string,cabinet:TodayCabinet):TodayChallenge{
 const pool=POOLS[cabinet],rule=pool[hash(`fi-arcade-today:${day}:${cabinet}`)%pool.length];return {cabinet,...rule};
}
export const todayChallenges=(day:string)=>TODAY_CABINETS.map(c=>todayChallenge(day,c));
/** The cabinet a game's facts belong to and whether they meet today's challenge. */
export function todayMet(day:string,f:TodayFacts):TodayCabinet|null{const c=f.kind as TodayCabinet;return todayChallenge(day,c).met(f,day)?c:null;}
/** The row's Play button (Nov 10 2026). While the Daily Run is still locked the Breakaway row reads "Play Breakaway" and opens the
 *  cabinet normally (no today launch), so the child can go earn the star; otherwise "Play" / "Play again" opens today's mode. */
export function todayPlayButton(cabinet:TodayCabinet,o:{done:boolean;runnerOpen:boolean}):{label:string;today:boolean}{
 if(cabinet==='runner'&&!o.runnerOpen)return {label:'Play Breakaway',today:false};
 return {label:o.done?'Play again':'Play',today:true};
}

/* ---- the device save (one key, fi2-arcade-today-v1) ---- */
export const ARCADE_TODAY_KEY='fi2-arcade-today-v1';
/** done: cabinets finished per local day (the last 14 days kept); pennants: the Monday of each week whose pennant lit;
 *  trophies: when each arcade trophy was first seen (ms). */
export type ArcadeTodaySave={v:1;done:Record<string,TodayCabinet[]>;pennants:string[];trophies:Record<string,number>};
export const emptyToday=():ArcadeTodaySave=>({v:1,done:{},pennants:[],trophies:{}});
const DAY=/^\d{4}-\d{2}-\d{2}$/;
export function sanitizeToday(raw:unknown):ArcadeTodaySave{
 const out=emptyToday();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<ArcadeTodaySave>;
 if(r.done&&typeof r.done==='object')for(const [day,list] of Object.entries(r.done))if(DAY.test(day)&&Array.isArray(list))out.done[day]=[...new Set(list.filter((c):c is TodayCabinet=>(TODAY_CABINETS as readonly string[]).includes(c as string)))];
 if(Array.isArray(r.pennants))out.pennants=[...new Set(r.pennants.filter(w=>typeof w==='string'&&DAY.test(w)))].slice(-520);
 if(r.trophies&&typeof r.trophies==='object')for(const [id,at] of Object.entries(r.trophies))if(id.startsWith('arcade:')&&typeof at==='number'&&Number.isFinite(at)&&at>=0)out.trophies[id]=at;
 return out;
}
/** The Monday (local calendar) of a YYYY-MM-DD day. */
export function weekOf(day:string){const [y,m,d]=day.split('-').map(Number),t=new Date(y,m-1,d);t.setDate(t.getDate()-(t.getDay()+6)%7);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
/** Days of `day`'s week with at least one challenge done. */
export const weekDays=(s:ArcadeTodaySave,day:string)=>{const w=weekOf(day);return Object.keys(s.done).filter(d=>s.done[d].length>0&&weekOf(d)===w).length;};
export const PENNANT_DAYS=3;
/** Marks a challenge done (idempotent) and lights the week's pennant on its third different day. Returns the new save and
 *  whether anything changed. Old days beyond 14 are dropped; pennants are kept. */
export function markTodayDone(s:ArcadeTodaySave,day:string,cabinet:TodayCabinet):{save:ArcadeTodaySave;fresh:boolean;pennant:boolean}{
 if(s.done[day]?.includes(cabinet))return {save:s,fresh:false,pennant:false};
 const done:Record<string,TodayCabinet[]>={...s.done,[day]:[...(s.done[day]??[]),cabinet]};
 for(const d of Object.keys(done).sort().slice(0,-14))delete done[d];
 const next:ArcadeTodaySave={...s,done},w=weekOf(day),lit=!s.pennants.includes(w)&&weekDays(next,day)>=PENNANT_DAYS;
 if(lit)next.pennants=[...s.pennants,w];
 return {save:next,fresh:true,pennant:lit};
}
export const pennantLit=(s:ArcadeTodaySave,day:string)=>s.pennants.includes(weekOf(day));

/* ---- arcade trophies (Backpack → Trophy shelf, lib/endgame/backpackTrophies.ts) ---- */
/** The records each mastery bar reads (all existing saves, plus the pennant count above). */
export type ArcadeTrophyFacts={runnerStars:number[];pinballFinalGoals:number;tennisLegendCup:boolean;strikerLegendWins:number;expertSolved:number;expertTotal:number;pennants:number};
export type ArcadeTrophyDef={id:string;label:string;skill:string;bar:string;met:(f:ArcadeTrophyFacts)=>boolean};
export const ARCADE_TROPHIES:readonly ArcadeTrophyDef[]=[
 {id:'arcade:breakaway',label:'Breakaway Master',skill:'Dribbling into space',bar:'3 ★ on all six Breakaway routes',met:f=>f.runnerStars.length>=6&&f.runnerStars.every(n=>n>=3)},
 {id:'arcade:pinball',label:'World Final Finisher',skill:'Finishing under pressure',bar:'Score 3 goals in the World Final',met:f=>f.pinballFinalGoals>=3},
 {id:'arcade:tennis',label:'Legend Cup Champion',skill:'First touch and control',bar:'Win the Legend Cup in Futbol Tennis',met:f=>f.tennisLegendCup},
 {id:'arcade:strikers',label:'Legend League Winner',skill:'Passing and moving as a team',bar:'Win a Legend league match in Island Strikers',met:f=>f.strikerLegendWins>=1},
 {id:'arcade:puzzles',label:'Expert Playmaker',skill:'Seeing the pass before it opens',bar:'Solve every expert Pass Puzzle',met:f=>f.expertTotal>0&&f.expertSolved>=f.expertTotal},
 {id:'arcade:pennant',label:'Arcade Pennant ×4',skill:'Practising a little, often',bar:'Light the weekly pennant 4 times',met:f=>f.pennants>=4},
];
/** Trophy-shelf sources for the bars met (detail = the football skill it stands for, as the project requires). */
export function arcadeTrophiesFrom(f:ArcadeTrophyFacts,at:Record<string,number>={}){
 return ARCADE_TROPHIES.filter(t=>t.met(f)).map(t=>({id:t.id,label:t.label,detail:t.skill,at:at[t.id]??0}));
}
