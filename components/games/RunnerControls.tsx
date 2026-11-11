'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {useFloatingStick} from '@/lib/arcade/useFloatingStick';
import {runnerSteer,runnerSteerState} from '@/lib/arcade/runnerSteer';
import {runnerSwipeAction,runnerSwipeMove,runnerSwipeStart,type RunnerSwipe,type RunnerSwipeState} from '@/lib/arcade/runnerSwipe';
import styles from './RunnerControls.module.css';

type Press={onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>void;onClick:(e:{detail:number})=>void};
type Hold=Press&{onPointerUp:(e:PointerEvent<HTMLButtonElement>)=>void;onPointerCancel:(e:PointerEvent<HTMLButtonElement>)=>void;onLostPointerCapture:(e:PointerEvent<HTMLButtonElement>)=>void};
type RunnerPadHud={coach?:string;skillLabel?:string;skillReady?:boolean;flash?:string;flashId?:number;runnerLives?:number;runnerMaxLives?:number;runnerBalls?:number;runnerMult?:number;runnerMeters?:number;runnerToGo?:boolean;runnerNear?:number;runnerStage?:number};
/* Nov 10 2026 comic HUD: drawn icons (no emoji glyphs) and the page-margin strip. The strip is icons and numerals only, read from the
 * HUD's typed runner fields (pass 2: hearts, balls, multiplier, metres; no more parsing of the status line): no caption words, so the
 * goal / tackle flash stays the one in-play word. The page itself answers the state: a coloured frame with a denser dot screen per
 * multiplier tier, a cracked panel and ink splat on a lost heart, a streak on a near miss, and the strike's inset close-up panel. */
const ICON={jump:'M12 3 4 12h5v9h6v-9h5z',slide:'M12 21 20 12h-5V3H9v9H4z',heart:'M12 21 3.5 12.2C1 9.5 2.6 5 6.6 5c2 0 3.6 1 5.4 3 1.8-2 3.4-3 5.4-3 4 0 5.6 4.5 3.1 7.2z'};
const Glyph=({d}:{d:string})=><svg viewBox="0 0 24 24" aria-hidden="true"><path d={d}/></svg>;
const Ball=()=><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.2 16.3 10.3 14.7 15.4H9.3L7.7 10.3z"/></svg>;
/* The strike's inset panel: the boot meeting the ball, drawn as a comic close-up (the 3D view stays the wide panel behind it). */
const StrikeInset=()=><svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 <rect width="160" height="120" fill="#19b5a5"/>
 <g stroke="#231a2e" strokeWidth="4" strokeLinecap="round"><path d="M-4 30 34 40M-4 52 22 56M-4 76 16 76M-4 100 10 96"/></g>
 <path d="M104 4 112 30 136 14 128 40 158 44 134 60 156 82 128 80 132 110 110 90 96 118 88 90 62 104 72 78 50 66 76 54 64 26 90 38z" fill="#fff3d6" stroke="#231a2e" strokeWidth="4" strokeLinejoin="round"/>
 <path d="M104 18 110 36 126 26 121 44 142 48 125 60 138 76 120 75 122 94 108 82 98 100 93 82 76 90 82 74 68 66 85 57 78 38 94 46z" fill="#ffc83a"/>
 <g stroke="#231a2e" strokeLinejoin="round"><ellipse cx="108" cy="58" rx="19" ry="22" fill="#fffaf0" strokeWidth="4"/>
  <path d="M110 47 119 55 115 67 104 67 101 55z" fill="#231a2e" strokeWidth="2"/><path d="M92 46 99 42 101 55 94 60zM121 39 126 49 119 55 110 47 112 38zM104 67 115 67 118 77 108 80 99 76z" fill="none" strokeWidth="2.5"/></g>
 <g stroke="#231a2e" strokeWidth="4" strokeLinejoin="round"><path d="M2 122 18 86 44 92 40 122z" fill="#fff3d6"/><path d="M11 102 41 108" fill="none"/>
  <path d="M18 86 26 62Q30 50 44 52L62 56Q76 58 88 54 96 60 92 72 86 82 70 84L46 86 44 92z" fill="#f0452e"/>
  <path d="M40 60 46 70M50 60 55 71M61 62 64 72" fill="none" stroke="#fff3d6" strokeWidth="3.5" strokeLinecap="round"/><path d="M50 86 51 93M62 85 63 92M74 84 76 90" fill="none" strokeLinecap="round"/></g>
</svg>;
/* A lost heart cracks the panel: jagged ink breaks from where the runner was hit, a blot and flying drops. */
const Crack=()=><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
 <path d="M50 72 45 58 49 47 41 30 44 14 39 0M50 72 60 61 58 50 69 37 67 20 74 0M50 72 36 74 27 66 12 71 0 62M50 72 66 78 76 72 90 80 100 74M49 47 38 50 30 42M58 50 70 52 80 44 92 48M50 72 46 86 52 100"/>
 <g><path d="M50 66 51.6 70.5 55 69.6 53 72.6 55.6 76 52 75.2 50 80 48 75.2 44.4 76 47 72.6 45 69.6 48.4 70.5z"/><ellipse cx="30" cy="53" rx="1.2" ry="2.2"/><ellipse cx="71" cy="61" rx=".9" ry="1.7"/><ellipse cx="24" cy="81" rx=".7" ry="1.4"/><ellipse cx="78" cy="87" rx="1" ry="2"/><ellipse cx="61" cy="91" rx=".6" ry="1.1"/><ellipse cx="35" cy="88" rx=".5" ry="1"/></g>
</svg>;

/**
 * Breakaway Run touch pad (owner, Oct 27 2026: "the joystick instead to match with the other games").
 * Left thumb: Island Strikers' floating stick (lib/arcade/useFloatingStick): press anywhere on the left of the track, push
 * sideways to change lane (lib/arcade/runnerSteer: one lane per push, hold to keep stepping). Right thumb: a Strikers-style
 * cluster of round buttons around the big Shoot in the corner (Jump above, Slide to its left, Skill on the diagonal).
 * Everything fires on touch-down (handlers from ArcadeGame3D). While playing, the only text is a short flash after a goal or
 * a tackle (runnerHud flash). Mouse windows hide the pad and use the keyboard.
 * Swipes (Nov 10 2026, lib/arcade/runnerSwipe): flick left / right on the track to change lane, up to jump, down to slide. The
 * swipe layer covers the track right of the stick zone, under the button cluster (a touch that starts on a button is that
 * button's, never a swipe); in the stick zone only up / down flicks count (the stick already owns sideways). Both layers are
 * touch-action:none, so a swipe never scrolls or zooms the page.
 */
export function RunnerControls({hud,steer,pressAction,act,shoot}:{hud:RunnerPadHud;steer:(d:number)=>void;pressAction:(id:number)=>Press;act?:(id:number)=>void;shoot:Hold}){
 const steerState=useRef(runnerSteerState()),lastX=useRef(0),repeat=useRef(0);
 const step=(x:number)=>{lastX.current=x;const d=runnerSteer(steerState.current,x,performance.now()/1000);if(d)steer(d);};
 const stick=useFloatingStick((x)=>{step(x);clearInterval(repeat.current);if(x)repeat.current=window.setInterval(()=>step(lastX.current),80);},()=>true,true);
 useEffect(()=>()=>{clearInterval(repeat.current);},[]);
 const swipe=useRef<RunnerSwipeState>(null);
 const fire=(w:RunnerSwipe|'',lanes:boolean)=>{if(!w)return;const a=runnerSwipeAction(w);if('lane' in a){if(lanes)steer(a.lane);}else act?.(a.action);};
 const swipeDown=(e:PointerEvent<HTMLElement>)=>{if(!e.isPrimary||(e.target as HTMLElement).closest?.('button'))return;swipe.current=runnerSwipeStart(e.pointerId,e.clientX,e.clientY,e.timeStamp/1000);};
 const swipeMove=(e:PointerEvent<HTMLElement>,lanes:boolean)=>fire(runnerSwipeMove(swipe.current,e.pointerId,e.clientX,e.clientY,e.timeStamp/1000),lanes);
 const swipeEnd=(e:PointerEvent<HTMLElement>,lanes:boolean)=>{swipeMove(e,lanes);if(swipe.current?.id===e.pointerId)swipe.current=null;};
 const layer={onPointerDown:(e:PointerEvent<HTMLDivElement>)=>{e.preventDefault();swipeDown(e);try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* capture optional */}},onPointerMove:(e:PointerEvent<HTMLDivElement>)=>swipeMove(e,true),onPointerUp:(e:PointerEvent<HTMLDivElement>)=>swipeEnd(e,true),onPointerCancel:()=>{swipe.current=null;}};
 // The stick zone keeps the stick's handlers; up / down flicks there jump and slide too.
 const zone={...stick.zone,onPointerDown:(e:PointerEvent<HTMLDivElement>)=>{swipeDown(e);stick.zone.onPointerDown(e);},onPointerMove:(e:PointerEvent<HTMLDivElement>)=>{swipeMove(e,false);stick.zone.onPointerMove(e);},onPointerUp:(e:PointerEvent<HTMLDivElement>)=>{swipeEnd(e,false);stick.zone.onPointerUp(e);}};
 const max=hud.runnerMaxLives??0,lives=hud.runnerLives??0,balls=hud.runnerBalls??0,mult=hud.runnerMult??1;
 const coachStick=hud.coach==='left'||hud.coach==='right',goal=hud.flash==='GOAL!',hit=hud.flash==='Tackled!';
 // Beats start from what the pad first saw (a resume must not replay them); any touch skips the strike's staged panels (the word stays).
 const near0=useRef(hud.runnerNear??0),tier0=useRef(mult),[skipped,setSkipped]=useState(-1),beat=goal&&skipped!==hud.flashId;
 return <div className={styles.pad} data-runner-pad data-mult={mult>1?mult:undefined} onPointerDownCapture={()=>{if(goal&&skipped!==hud.flashId)setSkipped(hud.flashId??-1);}}>
  {mult>1&&<i key={`tier-${mult}`} className={styles.page} data-runner-tier={mult} data-up={mult!==tier0.current||undefined} aria-hidden="true"/>}
  <div className={styles.zone} aria-hidden="true" data-runner-stick-zone {...zone}/>
  <div className={styles.swipe} aria-hidden="true" data-runner-swipe-zone {...layer}/>
  <div className={`touch-controls ${styles.movement}`}><div ref={stick.joy} className="joystick" data-floating="true" data-runner-stick data-coach={coachStick||undefined} role="group" aria-label="Change lane: press anywhere on the left and push left or right"><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span/></div></div>
  <div className={styles.cluster} role="group" aria-label="Actions">
   <button className={`${styles.btn} ${styles.skill}`} data-runner-skill data-ready={hud.skillReady||undefined} data-coach={hud.coach==='skill'||undefined} aria-label={`Skill move: ${hud.skillLabel??'Skill'}`} {...pressAction(6)}><span>{hud.skillLabel??'Skill'}</span></button>
   <button className={`${styles.btn} ${styles.jump}`} data-runner-jump data-coach={hud.coach==='jump'||undefined} {...pressAction(1)}><b aria-hidden="true"><Glyph d={ICON.jump}/></b><span>Jump</span></button>
   <button className={`${styles.btn} ${styles.slide}`} data-runner-slide {...pressAction(2)}><b aria-hidden="true"><Glyph d={ICON.slide}/></b><span>Slide</span></button>
   <button className={`${styles.btn} ${styles.shoot}`} data-runner-shoot data-coach={hud.coach==='shoot'||undefined} {...shoot}><i className={styles.gauge} aria-hidden="true"/><b aria-hidden="true"><Ball/></b><span>Shoot</span></button>
  </div>
  {max>0&&<div className={styles.margin} data-runner-margin aria-hidden="true">
   <p className={styles.lives}>{Array.from({length:max},(_,i)=><i key={i} data-on={i<lives||undefined} data-lost={hit&&i===lives||undefined}><Glyph d={ICON.heart}/></i>)}<span className={styles.balls}>{[0,1,2,3,4].map(i=><u key={i} data-on={i<balls||undefined}/>)}</span></p>
   <p className={styles.run}>{hud.runnerStage!==undefined&&<i key={`round-${hud.runnerStage}`} data-runner-round={hud.runnerStage} data-up={hud.runnerStage>1||undefined}>Round {hud.runnerStage}</i>}{hud.runnerMeters!==undefined&&<b data-left={hud.runnerToGo||undefined}>{hud.runnerMeters}<small>m</small></b>}{mult>1&&<em key={mult}>×{mult}</em>}</p>
  </div>}
  {hud.runnerNear!==undefined&&hud.runnerNear!==near0.current&&<i key={`near-${hud.runnerNear}`} className={styles.whoosh} data-runner-whoosh aria-hidden="true"/>}
  {hit&&<i key={`crack-${hud.flashId}`} className={styles.crack} data-runner-crack aria-hidden="true"><Crack/></i>}
  {beat&&<i key={`panel-${hud.flashId}`} className={styles.panel} data-runner-panel aria-hidden="true"/>}
  {beat&&<i key={`inset-${hud.flashId}`} className={styles.inset} data-runner-inset aria-hidden="true"><StrikeInset/></i>}
  {hud.flash&&<p key={hud.flashId} className={styles.flash} data-runner-flash data-kind={goal?'goal':'hit'} role="status" aria-live="polite"><span>{hud.flash}</span></p>}
 </div>;
}
