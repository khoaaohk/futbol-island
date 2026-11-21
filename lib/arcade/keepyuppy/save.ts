/**
 * Keepy-Uppy Beat device save (Nov 21 2026): the strong foot, the tap-timing offset, stars / best / weak-foot best per track, the
 * Trick Book, today's Track of the Day, feats, and the results card's lines. Pure rules with the storage passed in
 * (tests/keepyuppy-core.cjs); the browser wrappers at the bottom read localStorage. One key: fi2-keepyuppy-v1.
 * Kid-safe: no day streaks, no timers, nothing is lost by staying away.
 */
import {KU,TRICKS,TRICK_IDS,KU_FEAT_IDS,MEDAL_NAMES,medalFor,type FeatId,type TrickId,type Foot,type Grade} from './core';
import {TRACKS} from './charts';

export const KEEPYUPPY_KEY='fi2-keepyuppy-v1';
/** stars 0-3, best score, best accuracy 0-100, best weak-foot score 0-100 (-1 = never finished) */
export type TrackSave={stars:number;best:number;acc:number;weak:number;plays:number};
export type KeepySave={v:1;strong:Foot|'';/** tap-timing offset in ms from "tap when the ball lands" (0 until done) */offset:number;calibrated:boolean;best:number;medal:number;plays:number;tip:number;
 tracks:Record<string,TrackSave>;/** clean landings per trick */tricks:Partial<Record<TrickId,number>>;/** lessons taken */seen:TrickId[];feats:FeatId[];
 daily:{day:string;stars:number;score:number;acc:number;runs:number;counted:boolean}};
export const emptyKeepySave=():KeepySave=>({v:1,strong:'',offset:0,calibrated:false,best:0,medal:0,plays:0,tip:0,tracks:{},tricks:{},seen:[],feats:[],daily:{day:'',stars:0,score:0,acc:0,runs:0,counted:false}});
const int=(v:unknown,max:number,min=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):0;
const DAY=/^\d{4}-\d{2}-\d{2}$/,day=(v:unknown)=>typeof v==='string'&&DAY.test(v)?v:'';
export function sanitizeKeepySave(raw:unknown):KeepySave{
 const out=emptyKeepySave();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<KeepySave>;
 out.strong=r.strong==='L'||r.strong==='R'?r.strong:'';out.offset=typeof r.offset==='number'&&Number.isFinite(r.offset)?Math.max(-200,Math.min(200,Math.round(r.offset))):0;out.calibrated=r.calibrated===true;
 out.best=int(r.best,KU.scoreMax);out.medal=int(r.medal,KU.medals.length);out.plays=int(r.plays,1e9);out.tip=int(r.tip,1e9);
 if(r.tracks&&typeof r.tracks==='object')for(const t of TRACKS){const c=(r.tracks as Record<string,Partial<TrackSave>>)[t.id];if(!c||typeof c!=='object')continue;
  out.tracks[t.id]={stars:int(c.stars,3),best:int(c.best,KU.scoreMax),acc:int(c.acc,100),weak:typeof c.weak==='number'&&c.weak>=0?int(c.weak,100):-1,plays:int(c.plays,1e6)};}
 if(r.tricks&&typeof r.tricks==='object')for(const id of TRICK_IDS){const n=int((r.tricks as Record<string,unknown>)[id],999);if(n>0)out.tricks[id]=n;}
 if(Array.isArray(r.seen))out.seen=TRICK_IDS.filter(id=>(r.seen as unknown[]).includes(id));
 if(Array.isArray(r.feats))out.feats=KU_FEAT_IDS.filter(id=>(r.feats as unknown[]).includes(id));
 if(r.daily&&typeof r.daily==='object')out.daily={day:day(r.daily.day),stars:int(r.daily.stars,3),score:int(r.daily.score,KU.scoreMax),acc:int(r.daily.acc,100),runs:int(r.daily.runs,1e6),counted:r.daily.counted===true};
 return out;
}
export const totalStars=(s:KeepySave)=>TRACKS.reduce((n,t)=>n+(s.tracks[t.id]?.stars??0),0);
/** Stars open the next track: track i needs KU.unlock[i] stars in total. */
export const trackOpen=(s:KeepySave,i:number)=>totalStars(s)>=KU.unlock[i];
export const cardFull=(s:KeepySave,id:TrickId)=>(s.tricks[id]??0)>=KU.trickNeed;
export const cardsFull=(s:KeepySave)=>TRICK_IDS.filter(id=>cardFull(s,id)).length;

export type KeepyRun={track:number;daily:boolean;day:string;score:number;stars:number;/** 0-100 */acc:number;/** 0-100, -1 none */weak:number;out:boolean;
 tricks:Partial<Record<TrickId,number>>;feats:readonly FeatId[];lessons:readonly TrickId[]};
export type KeepySettled={save:KeepySave;newBest:boolean;previousBest:number;medal:number;newMedal:boolean;/** stars before this run on this track */starsBefore:number;starsGained:number;
 /** a track this run opened (-1 none) */opened:number;weakBefore:number;weakUp:boolean;/** trick cards filled by this run */newCards:TrickId[];newFeats:FeatId[];dailyFirst:boolean;tip:KeepyTip};
export function settleKeepy(s:KeepySave,run:KeepyRun):KeepySettled{
 const score=int(run.score,KU.scoreMax),tr=TRACKS[int(run.track,TRACKS.length-1)],next:KeepySave={...s,tracks:{...s.tracks},tricks:{...s.tricks},seen:[...s.seen],feats:[...s.feats],daily:{...s.daily}};
 next.plays=s.plays+1;const tip=KEEPY_TIPS[s.tip%KEEPY_TIPS.length];next.tip=s.tip+1;
 const newCards:TrickId[]=[];for(const id of TRICK_IDS){const add=int(run.tricks[id],99);if(!add)continue;const was=s.tricks[id]??0;next.tricks[id]=Math.min(999,was+add);if(was<KU.trickNeed&&was+add>=KU.trickNeed)newCards.push(id);}
 next.seen=TRICK_IDS.filter(id=>s.seen.includes(id)||run.lessons.includes(id));
 const old=s.tracks[tr.id]??{stars:0,best:0,acc:0,weak:-1,plays:0},openBefore=TRACKS.map((_,i)=>trackOpen(s,i));
 let newBest=false,previousBest=old.best,dailyFirst=false,medal=0,newMedal=false,starsGained=0,weakUp=false;
 if(run.daily){
  if(next.daily.day!==run.day)next.daily={day:run.day,stars:0,score:0,acc:0,runs:0,counted:false};
  previousBest=next.daily.score;dailyFirst=!next.daily.counted;newBest=score>next.daily.score&&score>0;
  next.daily={day:run.day,stars:Math.max(next.daily.stars,int(run.stars,3)),score:Math.max(next.daily.score,score),acc:Math.max(next.daily.acc,int(run.acc,100)),runs:next.daily.runs+1,counted:true};
 }else{
  medal=medalFor(score);newMedal=medal>s.medal;next.medal=Math.max(s.medal,medal);newBest=score>old.best&&score>0;next.best=Math.max(s.best,score);
  const stars=int(run.stars,3),weak=run.out?-1:int(run.weak,100,-1);starsGained=Math.max(0,stars-old.stars);weakUp=weak>=0&&old.weak>=0&&weak>old.weak;
  next.tracks[tr.id]={stars:Math.max(old.stars,stars),best:Math.max(old.best,score),acc:Math.max(old.acc,int(run.acc,100)),weak:Math.max(old.weak,weak),plays:old.plays+1};}
 const opened=TRACKS.findIndex((_,i)=>!openBefore[i]&&trackOpen(next,i)),total=totalStars(next);
 const earned=new Set<FeatId>([...run.feats]);if(total>=9)earned.add('stars9');if(total>=TRACKS.length*3)earned.add('stars18');if(TRICK_IDS.every(id=>cardFull(next,id)))earned.add('book');
 const newFeats=KU_FEAT_IDS.filter(id=>earned.has(id)&&!s.feats.includes(id));next.feats=KU_FEAT_IDS.filter(id=>s.feats.includes(id)||earned.has(id));
 return {save:next,newBest,previousBest,medal,newMedal,starsBefore:old.stars,starsGained,opened,weakBefore:old.weak,weakUp,newCards,newFeats,dailyFirst,tip};
}

/** One juggling idea per results card (AGENTS.md: every feature teaches). Short sentences, plain words. */
export type KeepyTip={title:string;line:string};
export const KEEPY_TIPS:readonly KeepyTip[]=[
 {title:'Soft first touch',line:'Let your foot give a little as the ball lands, like catching an egg. A soft touch keeps the ball close.'},
 {title:'Eyes on the ball',line:'Watch the ball all the way onto your foot. Jugglers look at the ball, not at their feet.'},
 {title:'Both feet',line:'Ten touches with your weaker foot every day and it stops being weak. The best players use both.'},
 {title:'Height is time',line:'A higher touch gives you longer before the next one. Use it before a trick. Keep it low when you want to go fast.'},
 {title:'Laces, not toes',line:'Juggle with the flat top of your foot, toes pointing forward. A toe poke sends the ball away.'},
 {title:'Thigh',line:'Lift your thigh until it is flat, like a table. Meet the ball in the middle of your thigh, not on the knee.'},
 {title:'Header',line:'Use your forehead and keep your eyes open. Push up with your legs.'},
 {title:'Find the rhythm',line:'Juggling has a beat: touch, touch, touch. Count it out loud and your feet will follow.'},
 {title:'Neck Stall',line:'Bend forward, look up and let the ball rest between your shoulders. Arms out for balance.'},
 {title:'Around the World',line:'Flick the ball up softly, swing your foot all the way round it and touch it again before it lands.'},
 {title:'Start small',line:'Drop, one touch, catch. Then two. Counting your record is how every juggler starts.'},
];
/** One coaching cue for the end of the run, from what went wrong most. */
export function coachLine(c:Record<Grade,number>,out:boolean):string{
 const scruffy=c.early+c.late+c.slip+c.wrong;
 if(c.drop===0&&scruffy===0)return 'Every touch clean. That is real control!';
 if(c.drop+scruffy<=2&&!out)return 'Almost every touch clean. Soft touches, eyes on the ball. Go for all Sweet next time.';
 if(c.wrong>=Math.max(2,c.early,c.late))return 'Look at the ring before you tap: its colour and picture tell you which pad to use.';
 if(c.early>c.late&&c.early>=c.drop)return 'You were a little early. Wait until the ball sits in the ring, then tap.';
 if(c.late>c.early&&c.late>=c.drop)return 'You were a little late. Listen for the drum and tap with it.';
 if(c.slip>=2)return 'For a trick, keep your thumb down: swipe, or hold until the bar is full.';
 if(out)return 'Three drops and the ball is gone. Slow down, watch one ring at a time.';
 return c.drop>0?'Watch the ball all the way into the ring. Eight clean touches win a ball back.':'Soft touches, good rhythm. Now go for more Sweet ones.';
}
/** The results card's "what to beat next" line: the nearest thing the child almost had. */
export function nearMissLine(o:{daily:boolean;out:boolean;stars:number;acc:number;track:number;opened:number;starsTotal:number;weak:number;weakBefore:number;newBest:boolean;score:number;best:number;medalBefore:number}):string{
 if(o.daily)return o.stars>=3?'Three stars on the Track of the Day. A new one comes tomorrow!':`${o.stars} ${o.stars===1?'star':'stars'} today. Play again for more, or come back tomorrow for a new twist.`;
 if(o.opened>=0)return `New track open: ${TRACKS[o.opened].name}!`;
 if(o.out)return o.acc<15?'Tap the pad when the ball lands in its ring. Finish the track for your first star.':'So close. Keep the ball up to the end of the track for your first star.';
 if(o.stars<3){const need=Math.ceil(KU.stars[o.stars]*100)-o.acc;return `${Math.max(1,need)} more ${need===1?'point':'points'} of accuracy for ${o.stars+1} ${o.stars===0?'star':'stars'}.`;}
 if(o.weak>=0&&o.weak<90)return `Three stars! Now your weak foot: ${o.weak} out of 100. Can you reach 90?`;
 const next=KU.medals.findIndex(m=>o.score<m);if(next>=0&&next>=o.medalBefore&&KU.medals[next]-o.score<=KU.medals[next]*.3)return `${KU.medals[next]-o.score} points from ${MEDAL_NAMES[next]}.`;
 const lock=TRACKS.findIndex((_,i)=>o.starsTotal<KU.unlock[i]);if(lock>=0)return `${KU.unlock[lock]-o.starsTotal} more ${KU.unlock[lock]-o.starsTotal===1?'star':'stars'} to open ${TRACKS[lock].name}.`;
 return o.newBest&&o.best>0?`New best by ${o.score-o.best}!`:o.track<TRACKS.length-1?`Three stars! Next: ${TRACKS[o.track+1].name}.`:'Three stars on the hardest track. Can you do it with every touch Sweet?';
}
export const trickName=(id:TrickId)=>TRICKS.find(t=>t.id===id)!.name;

/* ---- browser side ---- */
export function readKeepySave():KeepySave{try{return sanitizeKeepySave(JSON.parse(localStorage.getItem(KEEPYUPPY_KEY)??'null'));}catch{return emptyKeepySave();}}
export function writeKeepySave(s:KeepySave){try{localStorage.setItem(KEEPYUPPY_KEY,JSON.stringify(s));}catch{/* storage optional */}}
