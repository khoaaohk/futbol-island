/**
 * Safe Hands device save (Nov 21 2026): best score, medal, the career ladder, the glove shelf, the striker scouting cards, today's
 * Daily Shootout, and the results card's lines. Pure rules with the storage passed in (tests/safehands-core.cjs); the browser wrappers
 * at the bottom read localStorage. One key: fi2-safehands-v1. No day streaks and no timers: nothing is lost by staying away.
 */
import {SH,TIERS,STRIKERS,SH_FEATS,SH_FEAT_IDS,MEDAL_NAMES,medalFor,type FeatId,type GoalWhy,type ShStats} from './core';

export const SAFEHANDS_KEY='fi2-safehands-v1';
/** A habit shows on a striker's card once it has been seen this many times. */
export const SCOUT_NEED=2;
export type ScoutCard={faced:number;saved:number;seen:[number,number,number,number]};
/** best: career best score. rounds: most rounds cleared in one run (0-4; 4 = the cup is won). cups: cup wins. gloves: feats earned.
 *  scout: one card per striker id. daily: today's shoot-out (counted = the board run is used). tip: next fact. */
export type SafehandsSave={v:1;best:number;medal:number;plays:number;rounds:number;cups:number;tip:number;gloves:FeatId[];scout:Record<string,ScoutCard>;
 daily:{day:string;saves:number;best:number;counted:boolean;runs:number};dailyBest:number;seenKinds:string[]};
export const emptySafehandsSave=():SafehandsSave=>({v:1,best:0,medal:0,plays:0,rounds:0,cups:0,tip:0,gloves:[],scout:{},daily:{day:'',saves:0,best:0,counted:false,runs:0},dailyBest:0,seenKinds:[]});
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
const KINDS=['pen','one','far','free','cross','reb'];
export function sanitizeSafehandsSave(raw:unknown):SafehandsSave{
 const out=emptySafehandsSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<SafehandsSave>;
 out.best=int(r.best,SH.scoreMax);out.medal=int(r.medal,SH.medals.length);out.plays=int(r.plays,1e9);out.rounds=int(r.rounds,TIERS.length);out.cups=int(r.cups,1e6);out.tip=int(r.tip,1e9);out.dailyBest=int(r.dailyBest,SH.dailyShots);
 if(Array.isArray(r.gloves))out.gloves=SH_FEAT_IDS.filter(id=>(r.gloves as unknown[]).includes(id));
 if(Array.isArray(r.seenKinds))out.seenKinds=KINDS.filter(k=>(r.seenKinds as unknown[]).includes(k));
 if(r.scout&&typeof r.scout==='object')for(const st of STRIKERS){const c=(r.scout as Record<string,Partial<ScoutCard>>)[st.id];if(!c||typeof c!=='object')continue;const seen=Array.isArray(c.seen)?c.seen:[];
  out.scout[st.id]={faced:int(c.faced,1e6),saved:int(c.saved,1e6),seen:[int(seen[0],99),int(seen[1],99),int(seen[2],99),int(seen[3],99)]};}
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),saves:int(r.daily.saves,SH.dailyShots),best:int(r.daily.best,SH.scoreMax),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 return out;
}
/** How many of a striker's habits the card shows, and whether one line is known. */
export const habitKnown=(c:ScoutCard|undefined,i:number)=>!!c&&c.seen[i]>=SCOUT_NEED;
export const cardsStarted=(s:SafehandsSave)=>STRIKERS.filter(st=>(s.scout[st.id]?.faced??0)>0).length;

export type ScoutNote={striker:string;bits:number;saved:boolean};
export type SafehandsRun={score:number;daily:boolean;day:string;rounds:number;won:boolean;stats:ShStats;feats:readonly FeatId[];scout:readonly ScoutNote[];dailySaves:number;kinds:readonly string[]};
export type SafehandsSettled={save:SafehandsSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;newRound:boolean;newGloves:FeatId[];
 /** habits that reached a card on this run: [striker index, habit index] */newHabits:[number,number][];
 /** Daily only: this run is the day's board run (the first finished one). */dailyFirst:boolean;dailySaves:number;dailyBest:number;tip:SafehandsTip};
export function settleSafehands(s:SafehandsSave,run:SafehandsRun):SafehandsSettled{
 const score=int(run.score,SH.scoreMax),next:SafehandsSave={...s,gloves:[...s.gloves],scout:{...s.scout},daily:{...s.daily},seenKinds:[...s.seenKinds]};
 next.plays=s.plays+1;const tip=SAFEHANDS_TIPS[s.tip%SAFEHANDS_TIPS.length];next.tip=s.tip+1;
 const newGloves=SH_FEAT_IDS.filter(id=>run.feats.includes(id)&&!s.gloves.includes(id));next.gloves=SH_FEAT_IDS.filter(id=>s.gloves.includes(id)||newGloves.includes(id));
 for(const k of run.kinds)if(KINDS.includes(k)&&!next.seenKinds.includes(k))next.seenKinds.push(k);
 const newHabits:[number,number][]=[];
 for(const n of run.scout){const i=STRIKERS.findIndex(st=>st.id===n.striker);if(i<0)continue;const old=next.scout[n.striker]??{faced:0,saved:0,seen:[0,0,0,0]},c:ScoutCard={faced:old.faced+1,saved:old.saved+(n.saved?1:0),seen:[...old.seen] as ScoutCard['seen']};
  for(let h=0;h<4;h++)if(n.bits&(1<<h)&&STRIKERS[i].habits[h]){const was=c.seen[h];c.seen[h]=Math.min(99,was+1);if(was<SCOUT_NEED&&c.seen[h]>=SCOUT_NEED)newHabits.push([i,h]);}
  next.scout[n.striker]=c;}
 let newBest=false,previousBest=s.best,dailyFirst=false,medal=0,newMedal=false,newRound=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,saves:0,best:0,counted:false,runs:0};
  previousBest=next.daily.saves;dailyFirst=!next.daily.counted;newBest=run.dailySaves>next.daily.saves||(dailyFirst&&run.dailySaves>0);
  next.daily={day:run.day,saves:Math.max(next.daily.saves,run.dailySaves),best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};next.dailyBest=Math.max(s.dailyBest,run.dailySaves);
 }else{medal=medalFor(score);newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);
  newRound=run.rounds>s.rounds;next.rounds=Math.max(s.rounds,int(run.rounds,TIERS.length));if(run.won)next.cups=s.cups+1;}
 return {save:next,newBest,previousBest,medal,newMedal,newRound,newGloves,newHabits,dailyFirst,dailySaves:run.dailySaves,dailyBest:next.daily.day===run.day?next.daily.saves:0,tip};
}

/** One goalkeeping idea per results card (AGENTS.md: every feature teaches). Short sentences, plain words. */
export type SafehandsTip={title:string;line:string};
export const SAFEHANDS_TIPS:readonly SafehandsTip[]=[
 {title:'Set position',line:'A keeper stands on the line between the ball and the middle of the goal. From there both posts are the same distance away.'},
 {title:'Narrow the angle',line:'Step toward the ball and the goal looks smaller to the striker. Keepers come a few steps off the line for long shots.'},
 {title:'Read the planted foot',line:'The foot a striker plants next to the ball points where the shot will go. Watch it, not the eyes.'},
 {title:'Stay big',line:'In a one on one, stay on your feet as long as you can. Arms wide, chest up. Make the striker beat you.'},
 {title:'Catch or parry?',line:'Catch a soft shot and the danger is over. Push a hard shot wide, away from the middle of the goal.'},
 {title:'Be set',line:'Stop moving just before the kick. A keeper with both feet on the ground can dive either way.'},
 {title:'Command your area',line:'On a cross, shout "Keeper’s!" and catch the ball at the highest point you can reach. In a crowd, punch it far.'},
 {title:'The wall',line:'The wall guards the near post so the keeper can guard the far side. Too many players in the wall and the keeper cannot see.'},
 {title:'Penalties',line:'At a penalty the keeper must have a foot on the goal line until the ball is kicked.'},
 {title:'Rebounds',line:'After a save, get up fast. Many goals come from the second shot.'},
];

/** One coaching cue for the end of the run, from the last goal let in. */
export const WHY_LINE:Record<GoalWhy,string>={
 froze:'You stayed on your feet. When the foot is planted, go!',
 wrongway:'You went the wrong way. The planted foot points where the shot goes. Watch it.',
 height:'Right side, wrong height. Leaning back means a high shot. Leaning over the ball means a low one.',
 late:'Right way, a bit late. Move as soon as the foot is planted.',
 position:'You were too far from the ball’s path. Stand between the ball and the middle of the goal first.',
 wrongmove:'That move could not reach the ball. Dive to the side the planted foot points to.',
 chipped:'You came out too far and the ball was chipped over you. Two or three steps is enough for a long shot.',
 rounded:'Only dive at her feet when the ball runs away from her. If she keeps it close, stay big.',
 stranded:'That cross was too far out to reach. Stay on your line when it lands outside your small box.',
 early:'She waited for you to move. Stay still until her foot is planted.',
};
export function coachLine(stats:ShStats,daily:boolean):string{
 if(stats.goals===0)return daily?'Five out of five. A perfect shoot-out!':'A clean sheet. Not one goal let in!';
 return stats.lastWhy?WHY_LINE[stats.lastWhy]:'Set your position first. Then read the striker.';
}
/** The results card's "what to beat next" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;daily:boolean;dailySaves:number;rounds:number;won:boolean;gloves:number}):string{
 if(o.daily)return o.dailySaves>=SH.dailyShots?'All five saved. New takers tomorrow!':`${o.dailySaves} out of ${SH.dailyShots}. Tomorrow: five new takers. Can you save ${Math.min(SH.dailyShots,o.dailySaves+1)}?`;
 if(o.won)return o.newBest&&o.best>0?`Cup winner, and a new best by ${o.score-o.best}!`:'You won the cup! Now win it without letting a goal in.';
 const next=SH.medals.findIndex(m=>o.score<m),gap=next>=0?SH.medals[next]-o.score:0;
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best}. Next round: ${TIERS[Math.min(TIERS.length-1,o.rounds)].name}.`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(400,o.best*.2))return `${o.best-o.score} points from your best`;
 if(next>=0&&gap<=Math.max(400,SH.medals[next]*.25))return `${gap} points from ${MEDAL_NAMES[next]}`;
 if(o.rounds<TIERS.length)return `Next to beat: ${TIERS[o.rounds].name}.`;
 return `${SH_FEATS.length-o.gloves} glove pairs still to win.`;
}

/* ---- browser side ---- */
export function readSafehandsSave():SafehandsSave{try{return sanitizeSafehandsSave(JSON.parse(localStorage.getItem(SAFEHANDS_KEY)??'null'));}catch{return emptySafehandsSave();}}
export function writeSafehandsSave(s:SafehandsSave){try{localStorage.setItem(SAFEHANDS_KEY,JSON.stringify(s));}catch{/* storage optional */}}
