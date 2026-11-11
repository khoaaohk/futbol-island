/**
 * Air Futbol device save, today's two-player tally and the results card's lines (Nov 11 2026). Pure rules with the storage passed in
 * (tests/airhockey-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-airhockey-v1.
 */
import {AH,opponentFor,type AirStats} from './core';

export const AIR_KEY='fi2-airhockey-v1';
/** best: solo run best score. level: highest opponent level reached. beaten: opponents beaten, all runs. plays: finished solo runs.
 *  tip: which coaching line shows next. duo: today's head-to-head on this device (day = local play day; a new day starts at 0-0). */
export type AirSave={v:1;best:number;level:number;beaten:number;plays:number;tip:number;duo:{day:string;p1:number;p2:number}};
export const emptyAirSave=():AirSave=>({v:1,best:0,level:0,beaten:0,plays:0,tip:0,duo:{day:'',p1:0,p2:0}});
export const AIR_SCORE_MAX=2_000_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeAirSave(raw:unknown):AirSave{
 const out=emptyAirSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<AirSave>;
 out.best=int(r.best,AIR_SCORE_MAX);out.level=int(r.level,9999);out.beaten=int(r.beaten,1e9);out.plays=int(r.plays,1e9);out.tip=int(r.tip,1e9);
 if(r.duo&&typeof r.duo==='object')out.duo={day:day(r.duo.day),p1:int(r.duo.p1,9999),p2:int(r.duo.p2,9999)};
 return out;
}

/** One coaching cue tied to what happened in the run (AGENTS.md: every feature teaches). Short enough for a 7-year-old. */
export type AirCoachKey='near'|'far'|'caught'|'bank'|'own'|'bankGood'|'counterGood'|'clean'|'start';
export const AIR_COACH:Readonly<Record<AirCoachKey,readonly string[]>>={
 near:['Most of their goals went in at your near post: stay between the puck and the goal.','They scored on the side the puck was on. A keeper covers the near post first.','When the puck goes wide, slide the same way. Never leave the near post open.'],
 far:['They found the far corner. Stand a little off your line so the goal looks smaller to the shooter.','Their shots went across you. Stay on the line from the puck to the middle of your goal.'],
 caught:['You were caught up the pitch. After you shoot, drop straight back in front of your goal.','They scored while you were still attacking. Shoot, then recover: defenders do it every time.','Too far forward when they shot. A good team gets back into shape the moment the ball is lost.'],
 bank:['They scored off the boards. The angle in is the angle out: watch where the rebound will go.','A rebound beat you. Follow the puck off the side, like tracking a wall pass.'],
 own:['Careful near your own goal: play the puck out to the side, never across your goal mouth.','That one went in off you. Clear it wide, the way defenders clear to the touchline.'],
 bankGood:['Great board shots! A pass off the side beats a keeper who is watching the straight line.','You used the angles like a wall pass. Keep mixing straight shots and board shots.'],
 counterGood:['Save, then strike: that fast break is a counter-attack. The best time to score is right after you win it.','You scored straight after a save. Teams call that a counter: attack before they get back.'],
 clean:['A clean sheet! You stayed between the puck and the goal the whole match: the goalkeeper’s rule.','Nothing got past you. Good keepers move their feet first and dive last.'],
 start:['Stay between the puck and your goal, then hit it off the side boards to beat the keeper.','Shoot for the corners of the goal. If the keeper covers one side, play it off the boards to the other.'],
};
/** Which cue fits the run: the commonest way the goals went in; with a tidy defence, what the child did well. */
export function coachKey(st:AirStats):AirCoachKey{
 const conc:[AirCoachKey,number][]=[['near',st.concNear],['caught',st.concCaught],['bank',st.concBank],['far',st.concFar],['own',st.own]];let top=conc[0];for(const c of conc)if(c[1]>top[1])top=c;
 if(top[1]>=2||(top[1]>=1&&st.goalsAgainst>=st.goalsFor))return top[0];
 if(st.bank>=2)return 'bankGood';if(st.counters>=1)return 'counterGood';if(st.clean>=1)return 'clean';if(top[1]>=1)return top[0];return 'start';
}
export function coachLine(st:AirStats,turn:number):string{const pool=AIR_COACH[coachKey(st)];return pool[Math.abs(Math.floor(turn))%pool.length];}

/** level = the opponent on the table when the run ended; goals = that last match's score [you, them]. */
export type AirRun={score:number;level:number;goals:readonly [number,number];stats:AirStats};
export type AirSettled={save:AirSave;newBest:boolean;previousBest:number;coach:string;coachKey:AirCoachKey};
/** Applies a finished solo run to the save. Called once per run end. */
export function settleAir(s:AirSave,run:AirRun):AirSettled{
 const score=int(run.score,AIR_SCORE_MAX),next:AirSave={...s,duo:{...s.duo}};
 next.plays=s.plays+1;next.beaten=Math.min(1e9,s.beaten+int(run.stats.wins,9999));next.level=Math.max(s.level,int(run.level,9999));next.tip=s.tip+1;
 const newBest=score>s.best&&score>0;next.best=Math.max(s.best,score);
 return {save:next,newBest,previousBest:s.best,coach:coachLine(run.stats,s.tip),coachKey:coachKey(run.stats)};
}
/** A finished two-player match: today's tally only (never a board, never coins). */
export function settleDuo(s:AirSave,today:string,winner:number):AirSave{
 const d=s.duo.day===today?{...s.duo}:{day:today,p1:0,p2:0};if(winner===0)d.p1=Math.min(9999,d.p1+1);else if(winner===1)d.p2=Math.min(9999,d.p2+1);return {...s,duo:d};
}
export const duoToday=(s:AirSave,today:string)=>s.duo.day===today?s.duo:{day:today,p1:0,p2:0};
/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearLine(o:{score:number;best:number;newBest:boolean;level:number;goals:readonly [number,number]}):string{
 const name=opponentFor(o.level).name,left=AH.SOLO_TO-o.goals[0];
 if(left>0&&left<=2)return `${left} ${left===1?'goal':'goals'} from beating ${name}`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(300,o.best*.25))return `${o.best-o.score} points from your best`;
 if(o.newBest)return `New best! Now beat ${name}`;
 return `Beat ${name} to reach level ${o.level+1}`;
}

/* ---- browser side ---- */
export function readAirSave():AirSave{try{return sanitizeAirSave(JSON.parse(localStorage.getItem(AIR_KEY)??'null'));}catch{return emptyAirSave();}}
export function writeAirSave(s:AirSave){try{localStorage.setItem(AIR_KEY,JSON.stringify(s));}catch{/* storage optional */}}
