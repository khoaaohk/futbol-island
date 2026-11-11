'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import type {ArcadeHUD} from '@/lib/arcade/arcadeGameTypes';
import {ComicBurst,ComicPanel,comicLettering} from './comic';
import {createScorePanel,endScoreCall,stepScorePanel,type ScoreCall,type ScoreView} from '@/lib/games/soccerPinballScorePanel';

/** Futbol Pinball's score HUD (Nov 10 2026, comic restyle; logic in lib/games/soccerPinballScorePanel.ts, look in
 * components/games/skins/pinball.module.css). The score itself is the shared top-bar pill (drawn by the kit's `.chrome`). This adds:
 * a small status tab tucked under the pill, inside the top bar row (match minute, balls left as inked discs, division: it keeps the
 * `data-pinball-dmd` hook the framing checks read), and `data-pinball-call`, a comic burst over the upper table that exists only
 * while a call plays (GOAL! as a starburst with the points under it, the others as tilted caption boxes, each with a few stepped
 * frames of drawn motion). Decorative for screen readers. Heat: one setTimeout per call (its life) and finite CSS steps() runs only
 * while a call shows; at rest no timer, no rAF, no animation. */
const s=(p:Record<string,string|number>)=>p as CSSProperties;
/** The drawn motion for a call: 6-12 stepped frames, drawn in ink on a 40 x 40 box (pinball.module.css animates the parts). */
function CallArt({kind}:{kind:ScoreCall['kind']}){
 const ball=<g data-pb-ball><circle cx="0" cy="0" r="5.5"/><path d="M-2.4-1.6 0-3.4 2.4-1.6 1.5 1.3-1.5 1.3Z"/></g>;
 const star=(r:number)=>{const p:string[]=[];for(let i=0;i<20;i++){const a=Math.PI*i/10-Math.PI/2,q=i%2?r*.55:r;p.push(`${(Math.cos(a)*q).toFixed(1)},${(Math.sin(a)*q).toFixed(1)}`);}return p.join(' ');};
 return <svg data-pb-art={kind} viewBox="0 0 40 40" aria-hidden="true">
  {kind==='goal'?<><g data-pb-net><path d="M20 8h17v24H20M20 14h17M20 20h17M20 26h17M25.5 8v24M31 8v24"/></g><g transform="translate(9 22)">{ball}</g></>
  :kind==='save'?<><path data-pb-post d="M30 5v30"/><g transform="translate(22 20)">{ball}</g></>
  :kind==='lost'?<><path data-pb-drain d="M4 34h32"/><g transform="translate(0 -4)"><polygon data-pb-splat points="20,26 23,30 29,28 26,32 32,35 24,35 20,39 16,35 8,35 14,32 11,28 17,30"/></g><g transform="translate(20 25)">{ball}</g></>
  :kind==='kick'||kind==='combo'?<><g data-pb-lines><path d="M4 14h12M2 20h14M4 26h12"/></g><g transform="translate(26 20)">{ball}</g></>
  :<><g transform="translate(20 20)"><polygon data-pb-star points={star(16)}/></g>{kind==='best'&&<><g transform="translate(6 7)"><polygon data-pb-spark points={star(5)}/></g><g transform="translate(35 33)"><polygon data-pb-spark points={star(4)}/></g></>}</>}
 </svg>;
}

export function PinballScorePanel({hud,phase,best=0}:{hud:ArcadeHUD;phase:'ready'|'playing'|'paused'|'over';best?:number}){
 const state=useRef(createScorePanel()),[call,setCall]=useState<ScoreCall|null>(null);
 const division=(hud.detail?.split(' · ')[1]??'').split(' ').slice(0,2).join(' ').slice(0,6).trim();
 // Endless play (Nov 10 2026): the level (match number) is the last part of the detail line, `LV n`; extra balls show as more discs.
 const level=/ · (LV \d+)$/.exec(hud.detail??'')?.[1]??'';
 const view:ScoreView={phase,score:Number(hud.score)||0,clock:hud.pinballClock??'',balls:hud.pinballBalls??3,division,late:!!hud.pinballLate,waiting:phase!=='playing'&&phase!=='paused'&&phase!=='over'||!!hud.ready,message:hud.message??'',streak:hud.pinballStreak??'',pattern:hud.pinballPatternOn?hud.pinballPattern??'':'',best};
 useEffect(()=>{state.current=stepScorePanel(state.current,view,performance.now()/1000);setCall(state.current.call);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[phase,view.score,view.clock,view.balls,division,view.late,view.waiting,view.message,view.streak,view.pattern,best]);
 // The only timer: it ends the call that is showing, then the burst is gone.
 useEffect(()=>{if(!call)return;const t=setTimeout(()=>{state.current=endScoreCall(state.current,call.id);setCall(state.current.call);},call.life*1000);return()=>clearTimeout(t);},[call]);
 const tone=call?({lost:'red',save:'teal',over:'ink',best:'dots',mode:'sun'} as const)[call.kind as 'lost']??'paper':'paper';
 return <>
  <div data-pinball-dmd data-pb-phase={phase} aria-hidden="true"><em data-late={view.late||undefined}>{view.clock||"0'"}</em><span data-pb-balls>{Array.from({length:Math.max(3,Math.min(5,view.balls))},(_,i)=><b key={i} data-on={i<view.balls||undefined}/>)}</span>{division&&<span data-pb-div>{division}</span>}{level&&<span data-pb-level>{level}</span>}</div>
  {call&&<div key={call.id} data-pinball-call={call.kind} aria-hidden="true">{call.kind==='goal'
   ?<><CallArt kind="goal"/><span data-pb-words><ComicBurst word={call.title} size={call.title.length>6?22:34} color="var(--cm-red)" fill="var(--cm-sun)" tilt={-4}/>{call.sub&&<ComicPanel tone="sun" tilt={2} data-pb-sub>{call.sub}</ComicPanel>}</span></>
   :<ComicPanel tone={tone} tilt={call.kind==='over'?1.5:-2} data-pb-box><CallArt kind={call.kind}/><span data-pb-words><strong className={comicLettering} style={s({'--len':Math.max(4,call.title.length)})}>{call.title}</strong>{call.sub&&<small>{call.sub}</small>}</span></ComicPanel>}</div>}
 </>;
}
