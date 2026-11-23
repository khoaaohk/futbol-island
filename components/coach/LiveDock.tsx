'use client';
import {useEffect,useRef,useState} from 'react';
import {clockSec,fmtClock,nextChange,pauseClock,resumeClock,type Game} from '@/lib/coach/engine';
import {activeOf,liveTeam,loadTeams,saveTeams,updateTeam,type Teams} from '@/lib/coach/teams';
import {WORDS,type Words} from '@/lib/coach/words';
import {openedFromCoach} from '@/components/motion/motion';
import s from './LiveDock.module.css';
/**
 * The mini live bar (owner, Nov 22 2026: "I'm not allowed to leave this and check on other apps while that's going"). While a
 * game is on the clock it sits at the bottom of every coach screen (the dashboard, every tool, and /board and /scan when opened
 * from the coach app): a live dot, "1st half · 12:40 · Next change 3:50", a small Pause/Resume; tap to return to Match day.
 * When a change is due it pulses gently and beeps once (the coach's sound setting) and vibrates.
 * Runtime cost: one 1 s timer, only while a game is on the clock and the bar is shown; no timer otherwise.
 */
let ctx:AudioContext|null=null;
const audio=()=>{try{ctx??=new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();void ctx.resume();}catch{/* no audio */}return ctx;};
/** Two short beeps, the live screen's sound. */
export function beepTwice(){const a=audio();if(!a)return;try{for(const t of [0,0.35]){const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;g.gain.setValueAtTime(0.0001,a.currentTime+t);
 g.gain.exponentialRampToValueAtTime(0.5,a.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+t+0.25);o.connect(g).connect(a.destination);o.start(a.currentTime+t);o.stop(a.currentTime+t+0.3);}}catch{/* no audio */}}
/** What the bar says, from the game and the time. */
export function liveLine(w:Words,g:Game,now:number){
 const st=g.clock.status,inPlay=st==='live'||st==='paused',sec=inPlay?clockSec(g.clock,now):0,s=g.settings;
 const nc=nextChange(g),due=nc&&nc.due!=null&&inPlay?nc.due-sec:null;
 const period=st==='break'?w.breakName(s.periods):w.periodName(Math.min(g.clock.period,s.periods-1),s.periods);
 return {st,inPlay,period,clock:inPlay?fmtClock(sec):'',due,change:due==null?'':due<=0?w.changeNow:w.changeIn(fmtClock(due)),key:due!=null&&due<=0&&st==='live'?`c${nc!.index}:${g.delay}`:''};
}
export function LiveBar({w,game,team,now,sound,onOpen,onToggle}:{w:Words;game:Game;team:string;now:number;sound:boolean;onOpen:()=>void;onToggle:()=>void}){
 const l=liveLine(w,game,now),alerted=useRef('');
 useEffect(()=>{if(!l.key||alerted.current===l.key)return;alerted.current=l.key;try{if((navigator as Navigator&{userActivation?:{hasBeenActive:boolean}}).userActivation?.hasBeenActive!==false)navigator.vibrate?.([200,100,200]);}catch{/* none */}if(sound)beepTwice();},[l.key,sound]);
 /* unlock audio on the first touch anywhere, so the change beep can play on this page; until then (after a refresh or a round trip to
    /board) the bar says so (UX audit B7: the phone blocks sound and vibration until the first tap) */
 const [needTap,setNeedTap]=useState(false);
 useEffect(()=>{try{if((navigator as Navigator&{userActivation?:{hasBeenActive:boolean}}).userActivation?.hasBeenActive===false)setNeedTap(true);}catch{/* none */}
  const u=()=>{audio();setNeedTap(false);};window.addEventListener('pointerdown',u,{once:true});return ()=>window.removeEventListener('pointerdown',u);},[]);
 return <div className={s.dock} data-due={l.key?'':undefined} data-live-bar="" role="region" aria-label={w.gameOn}>
  <button type="button" className={s.main} onClick={onOpen} aria-label={`${w.openMatch}: ${team} · ${l.period}${l.clock?' · '+l.clock:''}${l.change?' · '+l.change:''}`}>
   <span className={s.dot} data-paused={l.st!=='live'?'':undefined} aria-hidden="true"/>
   <span className={s.text}><b>{l.period}{l.clock&&<> · <span className={s.num}>{l.clock}</span></>}</b><small data-sound-back={needTap&&sound?'':undefined}>{needTap&&sound?w.soundBack:l.change||team}</small></span>
   <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
  {l.inPlay&&<button type="button" className={s.toggle} data-paused={l.st==='paused'?'':undefined} onClick={onToggle}>{l.st==='paused'?w.resume:w.pause}</button>}
 </div>;
}
/** Pause or resume a game's clock. */
export const toggleClock=(g:Game,now:number):Game=>({...g,clock:g.clock.status==='paused'?resumeClock(g.clock,now):pauseClock(g.clock,now)});
/**
 * The bar on /board and /scan (opened from the coach app): reads the teams from this phone's storage, writes Pause/Resume back,
 * and returns to /coach (which opens the live game). Adds bottom room to the page while shown (body.fi-dock-on).
 */
export default function CoachLiveDock(){
 const [teams,setTeams]=useState<Teams|null>(null),[now,setNow]=useState(()=>Date.now());
 const read=()=>{try{const t=loadTeams(window.localStorage);setTeams(liveTeam(t)?t:null);}catch{setTeams(null);}};
 useEffect(()=>{if(!openedFromCoach())return;read();
  const v=()=>{if(document.visibilityState==='visible')read();};document.addEventListener('visibilitychange',v);window.addEventListener('storage',read);
  return ()=>{document.removeEventListener('visibilitychange',v);window.removeEventListener('storage',read);};},[]);
 const rec=teams?liveTeam(teams):null;
 useEffect(()=>{if(!rec)return;const t=setInterval(()=>setNow(Date.now()),1000);document.body.classList.add('fi-dock-on',s.bodyOn);
  return ()=>{clearInterval(t);document.body.classList.remove('fi-dock-on',s.bodyOn);};},[!!rec]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!teams||!rec||!rec.game)return null;
 const lang=activeOf(teams).lang??'en',w=WORDS[lang];
 return <LiveBar w={w} game={rec.game} team={rec.team.name||w.appName} now={now} sound={rec.sound}
  onOpen={()=>{window.location.assign(lang==='es'?'/coach?lang=es':'/coach');}}
  onToggle={()=>{const t=updateTeam(teams,rec.id,x=>x.game?{...x,game:toggleClock(x.game,Date.now())}:x);try{saveTeams(window.localStorage,t);}catch{/* blocked */}setTeams(t);setNow(Date.now());}}/>;
}
