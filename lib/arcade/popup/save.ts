/**
 * Pop-up target game device save, Daily Arena claim, day streak and the results card's lines (working id `popup`, Nov 21 2026).
 * Pure rules with the storage passed in (tests/popup-core.cjs); the browser wrappers at the bottom read localStorage.
 * One key: fi2-popup-v1. One best for every arena and the Daily Arena (there is one all-time board, no daily board).
 */
import {PU,MEDAL_NAMES,medalFor,type PopStats} from './core';

export const POPUP_KEY='fi2-popup-v1';
/** best: best round anywhere. arenas: best per arena id. daily: today's Daily Arena. streak: days in a row with a Daily Arena. */
export type PopupSave={v:1;best:number;medal:number;plays:number;combo:number;arenas:Record<string,number>;daily:{day:string;best:number;counted:boolean;runs:number};streak:{day:string;n:number;best:number}};
export const emptyPopupSave=():PopupSave=>({v:1,best:0,medal:0,plays:0,combo:0,arenas:{},daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}});
export const POPUP_SCORE_MAX=200_000;
const int=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizePopupSave(raw:unknown):PopupSave{
 const out=emptyPopupSave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<PopupSave>;
 out.best=int(r.best,POPUP_SCORE_MAX);out.medal=int(r.medal,PU.medals.length);out.plays=int(r.plays,1e9);out.combo=int(r.combo,1e4);
 if(r.arenas&&typeof r.arenas==='object')for(const [k,v] of Object.entries(r.arenas).slice(0,24))if(/^[a-z]{2,16}$/.test(k))out.arenas[k]=int(v,POPUP_SCORE_MAX);
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),best:int(r.daily.best,POPUP_SCORE_MAX),counted:r.daily.counted===true,runs:int(r.daily.runs,1e6)};
 if(r.streak&&typeof r.streak==='object')out.streak={day:day(r.streak.day),n:int(r.streak.n,9999),best:int(r.streak.best,9999)};
 return out;
}
export function dayBefore(d:string){const [y,m,dd]=d.split('-').map(Number),t=new Date(y,m-1,dd,12);t.setDate(t.getDate()-1);
 return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;}
export const liveStreak=(s:PopupSave,today:string)=>s.streak.day===today||s.streak.day===dayBefore(today)?s.streak.n:0;

export type PopupRun={score:number;daily:boolean;day:string;arena:string;stats:PopStats};
export type PopupSettled={save:PopupSave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;arenaBest:boolean;
 /** Daily only: the first finished Daily Arena of the day. */dailyFirst:boolean;dailyBest:number;streak:number;streakUp:boolean;tip:PopupTip};
export function settlePopup(s:PopupSave,run:PopupRun):PopupSettled{
 const score=int(run.score,POPUP_SCORE_MAX),next:PopupSave={...s,arenas:{...s.arenas},daily:{...s.daily},streak:{...s.streak}};
 const medal=medalFor(score),newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);next.plays=s.plays+1;next.combo=Math.max(s.combo,int(run.stats.bestCombo,1e4));
 const newBest=score>s.best&&score>0,previousBest=s.best;next.best=Math.max(s.best,score);
 const arenaBest=score>(s.arenas[run.arena]??0);next.arenas[run.arena]=Math.max(s.arenas[run.arena]??0,score);
 let dailyFirst=false,streakUp=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,best:0,counted:false,runs:0};
  dailyFirst=!next.daily.counted;next.daily={day:run.day,best:Math.max(next.daily.best,score),counted:true,runs:next.daily.runs+1};
  if(next.streak.day!==run.day){const n=next.streak.day===dayBefore(run.day)?next.streak.n+1:1;next.streak={day:run.day,n,best:Math.max(next.streak.best,n)};streakUp=true;}
 }
 return {save:next,newBest,previousBest,medal,newMedal,arenaBest,dailyFirst,dailyBest:next.daily.day===run.day?next.daily.best:0,streak:liveStreak(next,run.day),streakUp,tip:tipFor(run.stats)};
}

/** One football idea per results card, chosen from what happened in the round (AGENTS.md: every feature teaches). Short sentences. */
export type PopupTip={id:string;title:string;line:string};
export const POPUP_TIPS:readonly PopupTip[]=[
 {id:'friend',title:'Look before you strike',line:'You hit the coach or the referee. Great players look up first, so they know who is there before the ball leaves their foot.'},
 {id:'accuracy',title:'Pick one target',line:'Many flicks hit nothing. Choose one target, look at it, then strike. A calm pass that arrives beats three that do not.'},
 {id:'scan',title:'Look up and scan',line:'Many targets hid before you saw them. Keep your head up and move your eyes across the whole pitch, near and far.'},
 {id:'closest',title:'Closest open target first',line:'When two targets are open, the near one is the quick, safe choice. Hit it, then look for the next. That builds your combo.'},
 {id:'far',title:'The long pass',line:'Far targets are worth more. Flick faster to send the ball further, the way a player strikes harder for a long pass.'},
 {id:'snap',title:'Quick eyes',line:'You hit targets the moment they showed. Seeing early gives you time. The best midfielders look twice before the ball comes.'},
 {id:'streak',title:'Every ball counts',line:'A long streak means no wasted balls. Keeping the ball is a skill: good teams do not give it away.'},
 {id:'multi',title:'Two with one move',line:'You knocked down two at once. Seeing more than one option is what vision means in football.'},
];
const tip=(id:string)=>POPUP_TIPS.find(t=>t.id===id)??POPUP_TIPS[0];
export function tipFor(st:PopStats):PopupTip{
 const acc=st.flicks?st.hits/st.flicks:0,seen=st.knocks+st.escaped;
 if(st.friends>0)return tip('friend');
 if(st.flicks>=8&&acc<.5)return tip('accuracy');
 if(seen>=10&&st.escaped>st.knocks)return tip('scan');
 if(st.multis>0&&st.bestMulti>=2&&st.bestCombo>=5)return tip('multi');
 if(st.bestCombo<4)return tip('closest');
 if(st.knocks>=10&&st.far<st.knocks*.15)return tip('far');
 if(st.snaps>=6)return tip('snap');
 if(st.bestStreak>=PU.fireAt)return tip('streak');
 return tip('closest');
}
/** The results card's "one more go" line: the nearest thing the child almost had. */
export function nearMissLine(o:{score:number;best:number;newBest:boolean;stats:PopStats}):string{
 const m=medalFor(o.score),next=m<PU.medals.length?PU.medals[m]:0,gap=next-o.score;
 if(o.newBest&&o.best>0)return `New best by ${o.score-o.best}. Can you do it again?`;
 if(!o.newBest&&o.best>o.score&&o.best-o.score<=Math.max(400,o.best*.2))return `${o.best-o.score} points from your best`;
 if(next&&gap<=Math.max(400,next*.25))return `${gap} points from ${MEDAL_NAMES[m]}`;
 if(o.stats.friends>0)return 'Leave the coach and the referee alone for the Fair Play bonus.';
 if(o.stats.bestCombo<4)return 'Knock targets down one after another to build the combo.';
 if(next)return `${gap} points from ${MEDAL_NAMES[m]}`;
 return 'You hold the Gold medal. Beat your best!';
}

/* ---- browser side ---- */
export function readPopupSave():PopupSave{try{return sanitizePopupSave(JSON.parse(localStorage.getItem(POPUP_KEY)??'null'));}catch{return emptyPopupSave();}}
export function writePopupSave(s:PopupSave){try{localStorage.setItem(POPUP_KEY,JSON.stringify(s));}catch{/* storage optional */}}
