/**
 * Hold the Line device save (Nov 21 2026): best match score, medal, the season (stars per match in each league), the trap book,
 * the clean-sheet run, today's Match of the Day, and the results card's lines. Pure rules with the storage passed in
 * (tests/holdtheline-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-holdtheline-v1.
 * No day streaks and no timers: nothing is lost by staying away.
 */
import {HL,TEAMS,LEAGUES,HL_FEATS,HL_FEAT_IDS,MEDAL_NAMES,medalFor,type FeatId,type GoalWhy,type HlStats} from './core';

export const HOLDTHELINE_KEY='fi2-holdtheline-v1';
/** best: best match score. season[league][match]: stars won (0 = not won yet, 1-3). book: feats earned. cleanRun: matches in a row
 *  without a goal against (cleanBest = the most ever). daily: today's Match of the Day (counted = the day's first finished one). */
export type HoldthelineSave={v:1;best:number;medal:number;plays:number;tip:number;book:FeatId[];season:number[][];
 daily:{day:string;stars:number;best:number;counted:boolean;runs:number};dailyBest:number;cleanRun:number;cleanBest:number;/** the guided first step was played */intro:boolean;seen:string[]};
const blankSeason=()=>LEAGUES.map(()=>TEAMS.map(()=>0));
export const emptyHoldthelineSave=():HoldthelineSave=>({v:1,best:0,medal:0,plays:0,tip:0,book:[],season:blankSeason(),daily:{day:'',stars:0,best:0,counted:false,runs:0},dailyBest:0,cleanRun:0,cleanBest:0,intro:false,seen:[]});
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
const KINDS=['thru','decoy','deep','long','wide','switch','heavy','bend','double'];
export function sanitizeHoldthelineSave(raw:unknown):HoldthelineSave{
 const out=emptyHoldthelineSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<HoldthelineSave>;
 out.best=int(r.best,HL.scoreMax);out.medal=int(r.medal,HL.medals.length);out.plays=int(r.plays,1e9);out.tip=int(r.tip,1e9);out.dailyBest=int(r.dailyBest,3);out.cleanBest=int(r.cleanBest,1e6);out.cleanRun=Math.min(out.cleanBest,int(r.cleanRun,1e6));out.intro=r.intro===true;
 if(Array.isArray(r.book))out.book=HL_FEAT_IDS.filter(id=>(r.book as unknown[]).includes(id));
 if(Array.isArray(r.seen))out.seen=KINDS.filter(k=>(r.seen as unknown[]).includes(k));
 if(Array.isArray(r.season))out.season=LEAGUES.map((_,l)=>{const row=(r.season as unknown[])[l];return TEAMS.map((_t,i)=>Array.isArray(row)?int(row[i],3):0);});
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),stars:int(r.daily.stars,3),best:int(r.daily.best,HL.scoreMax),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 return out;
}
/** Matches won in a league, the next match to play (the first not won; the last one when all are), and whether a league is open. */
export const matchesWon=(s:HoldthelineSave,league:number)=>(s.season[league]??[]).filter(v=>v>0).length;
export const nextMatch=(s:HoldthelineSave,league:number)=>{const i=(s.season[league]??[]).findIndex(v=>v<=0);return i<0?TEAMS.length-1:i;};
export const leagueOpen=(s:HoldthelineSave,league:number)=>league<=0||matchesWon(s,league-1)>=TEAMS.length;
/** A match can be played when every match before it is won. */
export const matchOpen=(s:HoldthelineSave,league:number,match:number)=>leagueOpen(s,league)&&match>=0&&match<=nextMatch(s,league);
export const seasonStars=(s:HoldthelineSave,league:number)=>(s.season[league]??[]).reduce((a,b)=>a+b,0);

export type HoldthelineRun={score:number;daily:boolean;day:string;league:number;match:number;won:boolean;stars:number;goals:number;stats:HlStats;feats:readonly FeatId[];kinds:readonly string[]};
export type HoldthelineSettled={save:HoldthelineSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;/** the match's stars went up */newStars:boolean;/** this win opened the next match */opened:number;
 /** this win finished the Coast League: the Island Premier is open */promoted:boolean;newFeats:FeatId[];dailyFirst:boolean;dailyStars:number;cleanRun:number;newCleanBest:boolean;tip:HoldthelineTip};
export function settleHoldtheline(s:HoldthelineSave,run:HoldthelineRun):HoldthelineSettled{
 const score=int(run.score,HL.scoreMax),stars=int(run.stars,3),next:HoldthelineSave={...s,book:[...s.book],season:s.season.map(r=>[...r]),daily:{...s.daily},seen:[...s.seen]};
 next.plays=s.plays+1;const tip=HOLDTHELINE_TIPS[s.tip%HOLDTHELINE_TIPS.length];next.tip=s.tip+1;
 for(const k of run.kinds)if(KINDS.includes(k)&&!next.seen.includes(k))next.seen.push(k);
 // the clean-sheet run: a finished match with no goal against adds one; a goal against starts it again (a personal best, not a day streak)
 next.cleanRun=run.goals===0&&run.won?s.cleanRun+1:0;const newCleanBest=next.cleanRun>s.cleanBest;next.cleanBest=Math.max(s.cleanBest,next.cleanRun);
 let newBest=false,previousBest=s.best,dailyFirst=false,medal=0,newMedal=false,newStars=false,opened=-1,promoted=false;const feats=[...run.feats];
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,stars:0,best:0,counted:false,runs:0};
  previousBest=next.daily.best;dailyFirst=!next.daily.counted;newBest=stars>next.daily.stars;
  next.daily={day:run.day,stars:Math.max(next.daily.stars,stars),best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};next.dailyBest=Math.max(s.dailyBest,stars);
 }else{medal=medalFor(score);newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);
  const l=int(run.league,LEAGUES.length-1),m=int(run.match,TEAMS.length-1),was=next.season[l][m];
  if(run.won&&matchOpen(s,l,m)){newStars=stars>was;next.season[l][m]=Math.max(was,stars);if(was<=0){if(m+1<TEAMS.length)opened=m+1;
   if(l===0&&matchesWon(next,0)>=TEAMS.length&&matchesWon(s,0)<TEAMS.length){promoted=true;feats.push('promo');}}}}
 const newFeats=HL_FEAT_IDS.filter(id=>feats.includes(id)&&!s.book.includes(id));next.book=HL_FEAT_IDS.filter(id=>s.book.includes(id)||newFeats.includes(id));
 return {save:next,newBest,previousBest,medal,newMedal,newStars,opened,promoted,newFeats,dailyFirst,dailyStars:next.daily.day===run.day?next.daily.stars:0,cleanRun:next.cleanRun,newCleanBest,tip};
}

/** One defending idea per results card (AGENTS.md: every feature teaches). Short sentences, plain words (lib/site/rules.ts, terms.ts). */
export type HoldthelineTip={title:string;line:string};
export const HOLDTHELINE_TIPS:readonly HoldthelineTip[]=[
 {title:'The offside line',line:'The offside line is your second-last defender. The keeper is usually the last one, so the line is your last outfield defender.'},
 {title:'When it is judged',line:'Offside is judged at the moment the ball is played. Where the runner is when the ball arrives does not matter.'},
 {title:'Level is onside',line:'A runner who is level with the second-last defender is onside. He must be past the line to be offside.'},
 {title:'Your own half',line:'A player cannot be offside in his own half. A line pushed up past halfway cannot catch anyone.'},
 {title:'Step up together',line:'An offside trap only works if the whole line steps up at the same time. One defender left behind keeps everyone onside.'},
 {title:'Stay compact',line:'Compact means close together. Small gaps between defenders leave no room for a pass through the middle.'},
 {title:'Slide to the ball side',line:'When the ball goes to one side, the whole line slides that way. The far side is the safest place to leave space.'},
 {title:'High line, low block',line:'A high line squeezes the other team but leaves space behind. A low block leaves no space behind but lets them shoot.'},
 {title:'When to press',line:'Press when the ball runs away from a player’s feet, or when he waits too long. One player goes, a teammate covers.'},
 {title:'What a press costs',line:'The defender who presses leaves a gap. If he does not win the ball, the next pass goes into that gap.'},
];

/** One coaching cue for the end of the match, from the last goal let in. */
export const WHY_LINE:Record<GoalWhy,string>={
 held:'The runner was onside when the ball was played. When the passer’s leg goes back, step up together, far enough to leave him offside.',
 late:'You stepped after the ball was played. Offside is judged when the ball is kicked: step during the wind-up.',
 ownhalf:'Your line was past halfway. A runner in his own half cannot be offside. Do not push up that far.',
 long:'A long ball went over your line. When the passer is far back in his own half, drag down early.',
 deep:'You sat too deep and gave them room to shoot. Hold your line higher, or press the shooter.',
 gap:'The press left a gap and they passed into it. Only press a heavy touch or a passer who waits.',
 wide:'The winger was free. When the ball goes wide, drag across so your line is on the ball side.',
 bend:'She bent her run and stayed level. Level is onside! Press the passer who waits, or drop off.',
};
export function coachLine(stats:HlStats,won:boolean):string{
 if(stats.goals===0)return won?'A clean sheet. Nothing got past your line!':'Read the passer first. Then choose: step, drop, slide or press.';
 return stats.lastWhy?WHY_LINE[stats.lastWhy]:'Read the passer first. Then choose: step, drop, slide or press.';
}
/** The results card's "what to beat next" line: the nearest thing the child almost had. */
export function nearMissLine(o:{daily:boolean;won:boolean;stars:number;goals:number;limit:number;league:number;match:number;promoted:boolean;opened:number;cleanRun:number;book:number}):string{
 if(o.daily)return o.stars>=3?'Three stars. A new pattern tomorrow!':o.stars>0?`${o.stars} ${o.stars===1?'star':'stars'} today. Play it again for ${o.stars+1}, or come back tomorrow for a new pattern.`:'The same twelve attacks every time today. You know what is coming now. Try again!';
 if(o.promoted)return `Promoted! The ${LEAGUES[1].name} is open: the same teams, with less time to read them.`;
 if(!o.won)return `They scored ${o.goals}. Keep it to ${o.limit} or fewer to win. Try again!`;
 if(o.stars<3)return `${o.goals} ${o.goals===1?'goal':'goals'} against. A clean sheet is three stars.`;
 if(o.cleanRun>=2)return `${o.cleanRun} clean sheets in a row!`;
 if(o.opened>=0)return `Clean sheet! Next: ${TEAMS[o.opened].name}.`;
 return `${HL_FEATS.length-o.book} pages of the trap book still to fill.`;
}
export {MEDAL_NAMES};

/* ---- browser side ---- */
export function readHoldthelineSave():HoldthelineSave{try{return sanitizeHoldthelineSave(JSON.parse(localStorage.getItem(HOLDTHELINE_KEY)??'null'));}catch{return emptyHoldthelineSave();}}
export function writeHoldthelineSave(s:HoldthelineSave){try{localStorage.setItem(HOLDTHELINE_KEY,JSON.stringify(s));}catch{/* storage optional */}}
