/**
 * Island Strikers league tiers (Nov 8 2026, owner: "add harder levels since there is a scoreboard"). Pure and isomorphic except the
 * two small localStorage helpers at the end. Two leagues sit above the six rounds, each with its OWN island and device boards
 * (lib/arcade/leaderboard.ts BOARD_GAMES 'livepro' and 'livelgnd'), so a Round 1 score never shares a board with a Legend one
 * and the existing 'live' board keeps its rules and rows untouched.
 *
 *  - Pro League: opens once Round 4 is won. A 2-minute match against the Round 6 Blue one notch faster and sharper
 *    (strikerMatch STRIKER_TIER_BOOST[1]). Points ×2.
 *  - Legend League: opens once a Pro League match is won. Small goals, Blue at its fastest and the quickest keeper
 *    (STRIKER_TIER_BOOST[2]). Points ×3.
 *
 * League scoring (richer than the rounds' match points, which stay as they were): every goal is worth 100, plus a bonus for each
 * skill in it (first-time, clean strike, chip, curler, set piece, Team Strike), times a COMBO from the passes in the move
 * (2 passes ×1.5, 4 ×2, 6+ ×2.5), plus a scoring-streak bonus for goals in a row. Conceding only ends the streak; no points are
 * ever taken away. Passes score 10 and a win 200, as in the rounds. The tier multiplier applies to the whole total.
 * Same coins as any Strikers match (free entry like every arcade play, the usual payout): the economy is untouched.
 */
import type {BoardGame} from './leaderboard';

export type StrikerTierId='pro'|'legend';
export type StrikerTier={id:StrikerTierId;tier:1|2;board:BoardGame;name:string;short:string;seconds:number;mult:number;
 mods:{small?:boolean};rules:readonly string[];unlock:string};
export const STRIKER_TIERS:Record<StrikerTierId,StrikerTier>={
 pro:{id:'pro',tier:1,board:'livepro',name:'Pro League',short:'PRO',seconds:120,mult:2,mods:{},
  rules:['Faster Blue','Sharper keeper','Points ×2'],unlock:'Win Round 4 to open'},
 legend:{id:'legend',tier:2,board:'livelgnd',name:'Legend League',short:'LEGEND',seconds:120,mult:3,mods:{small:true},
  rules:['Small goals','Fastest Blue','Points ×3'],unlock:'Win a Pro League match to open'},
};
export const STRIKER_TIER_IDS:readonly StrikerTierId[]=['pro','legend'];
/** Pro opens when the arcade record has Round 5 unlocked (Round 4 won). */
export const STRIKER_PRO_UNLOCK_ROUND=5;

/** Goal value pieces (league matches only). */
export const STRIKER_GOAL_BASE=100,STRIKER_PASS_POINTS=10,STRIKER_WIN_POINTS=200,STRIKER_STREAK_BONUS=50,STRIKER_STREAK_CAP=3;
export const STRIKER_SKILL_BONUS={firstTime:50,clean:50,chip:50,curled:50,setPiece:25,teamStrike:100} as const;
const SKILL_LABEL:Record<keyof typeof STRIKER_SKILL_BONUS,string>={firstTime:'First-time',clean:'Clean strike',chip:'Chip',curled:'Curler',setPiece:'Set piece',teamStrike:'Team Strike'};
/** Pass combo for a goal's move: 0-1 passes ×1, 2-3 ×1.5, 4-5 ×2, 6+ ×2.5. Shown live on the HUD while the move builds. */
export function strikerCombo(chain:number){const c=Number.isFinite(chain)?Math.max(0,Math.floor(chain)):0;return 1+Math.min(3,Math.floor(c/2))*.5;}
export type StrikerGoalStoryLite={chain:number;firstTime:boolean;teamStrike:boolean;chip:boolean;curled:boolean;setPiece:boolean;clean:boolean};
/**
 * One Gold goal's league points (before the tier multiplier). `streak` = Gold goals in a row INCLUDING this one (1 for the first).
 * Returns the points, the combo and up to three short tags for the pop (biggest first). Allocation: one small object per goal.
 */
export function strikerGoalPoints(g:StrikerGoalStoryLite,streak:number):{points:number;combo:number;tags:string[]}{
 let bonus=0;const tags:string[]=[];
 for(const k of ['teamStrike','firstTime','clean','chip','curled','setPiece'] as const)if(g[k]){bonus+=STRIKER_SKILL_BONUS[k];tags.push(SKILL_LABEL[k]);}
 const combo=strikerCombo(g.chain),run=Math.max(0,Math.min(STRIKER_STREAK_CAP,Math.floor(streak)-1));
 if(combo>1)tags.unshift(`Combo ×${combo}`);if(run>0)tags.push(`Streak ${run+1}`);
 return {points:Math.round((STRIKER_GOAL_BASE+bonus)*combo)+run*STRIKER_STREAK_BONUS,combo,tags:tags.slice(0,3)};
}
/** The league board score: (goal points + passes × 10 + win 200) × the tier multiplier. Whole, never negative. */
export function strikerTierScore(o:{goalPoints:number;passes:number;won:boolean;tier:StrikerTierId}){
 const n=(v:number)=>Number.isFinite(v)?Math.max(0,Math.floor(v)):0;
 return (n(o.goalPoints)+n(o.passes)*STRIKER_PASS_POINTS+(o.won?STRIKER_WIN_POINTS:0))*STRIKER_TIERS[o.tier].mult;
}
/** Which leagues are open: Pro after Round 4 is won (or once any Pro match was won), Legend after a Pro win. */
export function strikerTiersOpen(unlockedRound:number,progress:StrikerTierProgress){
 const pro=unlockedRound>=STRIKER_PRO_UNLOCK_ROUND||progress.pro.wins>0||progress.pro.best>0;
 return {pro,legend:pro&&progress.pro.wins>0};
}

export type StrikerTierProgress=Record<StrikerTierId,{best:number;wins:number}>;
const KEY='fi2-strikers-tiers-v1';
const clean=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(1e6,Math.floor(n))):0;};
export function readStrikerTiers():StrikerTierProgress{
 try{const v=JSON.parse(localStorage.getItem(KEY)??'{}')??{};return {pro:{best:clean(v.pro?.best),wins:clean(v.pro?.wins)},legend:{best:clean(v.legend?.best),wins:clean(v.legend?.wins)}};}
 catch{return {pro:{best:0,wins:0},legend:{best:0,wins:0}};}
}
/** Records a finished league match; returns the new progress and whether the score is a personal best. */
export function saveStrikerTier(tier:StrikerTierId,score:number,won:boolean):{progress:StrikerTierProgress;best:boolean}{
 const p=readStrikerTiers(),before=p[tier].best,best=score>before&&score>0;
 p[tier]={best:Math.max(before,clean(score)),wins:p[tier].wins+(won?1:0)};
 try{localStorage.setItem(KEY,JSON.stringify(p));}catch{}return {progress:p,best};
}
