'use client';
import React,{useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {FINAL_1991,TAKE_IT,WINNER_COLOR} from './data';
import {Again,FirstStar,Pause,Play} from './icons';
import styles from './wwc.module.css';

/** The 1991 final as a goal map: the 80-minute clock runs at 6 match-minutes a second and pauses for each goal while the ball
 *  draws its path. One rAF loop, only while playing; it stops at full time, on pause, when the tab hides and on unmount. */
const RATE=6,GOAL=1.8,G=FINAL_1991.goals,LEN=FINAL_1991.length;
const starts=(()=>{let acc=0,prev=0;return G.map(g=>{const s=acc+(g.min-prev)/RATE;acc=s+GOAL;prev=g.min;return s;});})();
const TOTAL=starts[starts.length-1]+GOAL+(LEN-G[G.length-1].min)/RATE;
export function replayAt(sec:number){
 for(let i=0;i<G.length;i++){const s=starts[i],prevMin=i?G[i-1].min:0,prevEnd=i?starts[i-1]+GOAL:0;
  if(sec<s)return {minute:prevMin+(sec-prevEnd)*RATE,done:i,active:null as null|{i:number;f:number}};
  if(sec<s+GOAL)return {minute:G[i].min,done:i,active:{i,f:(sec-s)/GOAL}};}
 const last=starts[G.length-1]+GOAL;return {minute:Math.min(LEN,G[G.length-1].min+(sec-last)*RATE),done:G.length,active:null};
}
export type Replay=ReturnType<typeof useReplay>;
export function useReplay(reduced:MutableRefObject<boolean>){
 const [sec,setSec]=useState(0),[playing,setPlaying]=useState(false);
 const secRef=useRef(0);secRef.current=sec;
 const cue=useRef(-1);
 useEffect(()=>{if(!playing)return;let raf=0,last=performance.now();
  const tick=(now:number)=>{const dt=Math.min(.1,(now-last)/1000);last=now;const next=Math.min(TOTAL,secRef.current+dt);secRef.current=next;
   // One-shot cues as the replay crosses a goal or full time (the replay was started by a tap, so audio is allowed).
   const st=replayAt(next);if(st.active&&cue.current<st.active.i){cue.current=st.active.i;museumSfx.net();}
   setSec(next);if(next>=TOTAL){setPlaying(false);museumSfx.whistle();return;}raf=requestAnimationFrame(tick);};
  raf=requestAnimationFrame(tick);
  const vis=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',vis);
  return()=>{cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',vis);};},[playing]);
 const seek=useCallback((s:number)=>{const v=Math.max(0,Math.min(TOTAL,s));secRef.current=v;setSec(v);cue.current=replayAt(v).active?.i??replayAt(v).done-1;},[]);
 const start=useCallback(()=>{if(reduced.current){seek(TOTAL);setPlaying(false);return;}if(secRef.current>=TOTAL||secRef.current===0){seek(0);cue.current=-1;museumSfx.whistle();}setPlaying(true);},[reduced,seek]);
 const pause=useCallback(()=>setPlaying(false),[]);
 const goTo=useCallback((i:number)=>{if(reduced.current){seek(TOTAL);return;}seek(starts[i]-.01);cue.current=i-1;setPlaying(true);},[reduced,seek]);
 return {sec,playing,start,pause,goTo,state:replayAt(sec),total:TOTAL};
}

const colorOf=(t:'USA'|'Norway')=>WINNER_COLOR[t];
function along(path:[number,number][],f:number):[number,number]{
 const segs=path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1])),L=segs.reduce((a,b)=>a+b,0);let d=f*L;
 for(let i=0;i<segs.length;i++){if(d<=segs[i]){const t=segs[i]?d/segs[i]:0;return [path[i][0]+(path[i+1][0]-path[i][0])*t,path[i][1]+(path[i+1][1]-path[i][1])*t];}d-=segs[i];}
 return path[path.length-1];
}

/** The ball runs along its path in the first part of each goal's pause, then the net bursts and "GOAL" shows. */
const TRAVEL=.55;
export function FinalPitch({r}:{r:Replay}){
 const {state}=r,act=state.active,travel=act?Math.min(1,act.f/TRAVEL):0,ball=act&&travel<1?along(G[act.i].path,travel):null,over=r.sec>=r.total;
 const pts=(p:[number,number][])=>p.map(q=>q.join(',')).join(' ');
 const usa=G.filter((g,i)=>g.team==='USA'&&i<state.done).length,nor=G.filter((g,i)=>g.team==='Norway'&&i<state.done).length;
 return <div className={styles.pitchWrap} data-over={over||undefined}>
  <svg className={styles.pitch} viewBox="-8 -9 121 92" role="img" aria-label={`Goal map of the 1991 final, USA against Norway. Minute ${Math.floor(state.minute)}.`}>
   <defs>
    <radialGradient id="wwcFlood" cx=".5" cy=".5" r=".65"><stop offset="0" stopColor="#7f93ff" stopOpacity=".16"/><stop offset="1" stopColor="#7f93ff" stopOpacity=".03"/></radialGradient>
    <pattern id="wwcNet" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M0 0H1M0 0V1" stroke="#dfe5ff" strokeOpacity=".35" strokeWidth=".12"/></pattern>
   </defs>
   {/* The pitch, drawn as a floodlit constellation: soft mown stripes, faint lines, a star at every corner and spot. */}
   <rect x={0} y={0} width={105} height={68} fill="url(#wwcFlood)"/>
   {Array.from({length:7},(_,k)=><rect key={k} x={k*15} y={0} width={7.5} height={68} fill="#ffffff" opacity={.018}/>)}
   <rect className={styles.pl} x={0} y={0} width={105} height={68}/>
   <line className={styles.pl} x1={52.5} y1={0} x2={52.5} y2={68}/><circle className={styles.pl} cx={52.5} cy={34} r={9.15}/>
   <rect className={styles.pl} x={0} y={13.84} width={16.5} height={40.32}/><rect className={styles.pl} x={88.5} y={13.84} width={16.5} height={40.32}/>
   <rect className={styles.pl} x={0} y={24.84} width={5.5} height={18.32}/><rect className={styles.pl} x={99.5} y={24.84} width={5.5} height={18.32}/>
   <rect className={styles.goalMouth} x={-2.4} y={30.34} width={2.4} height={7.32} fill="url(#wwcNet)"/><rect className={styles.goalMouth} x={105} y={30.34} width={2.4} height={7.32} fill="url(#wwcNet)"/>
   {[[0,0],[105,0],[0,68],[105,68],[52.5,34],[11,34],[94,34],[52.5,0],[52.5,68]].map(([x,y])=><circle key={x+'-'+y} className={styles.pdot} cx={x} cy={y} r={.7}/>)}
   <text className={styles.side} x={0} y={-3.5} fill={colorOf('Norway')}>← NORWAY ATTACK</text>
   <text className={styles.side} x={105} y={-3.5} textAnchor="end" fill={colorOf('USA')}>USA ATTACK →</text>
   {G.map((g,i)=>{const shown=i<state.done||act?.i===i;if(!shown)return null;const f=act?.i===i?travel:1,end=g.path[g.path.length-1],c=colorOf(g.team),landed=f>=1,live=act?.i===i&&landed;
    const lx=Math.min(96,Math.max(9,g.path[0][0])),ly=g.path[0][1]+(g.path[0][1]<34?-3.2:5.6);
    return <g key={i}>
     <polyline className={styles.trailGlow} points={pts(g.path)} pathLength={1} stroke={c} strokeDasharray="1 1" strokeDashoffset={1-f}/>
     <polyline className={styles.trail} points={pts(g.path)} pathLength={1} stroke={c} strokeDasharray="1 1" strokeDashoffset={1-f}/>
     {g.path.slice(0,-1).map(([x,y],k)=><circle key={k} cx={x} cy={y} r={.95} fill={c} opacity={f>k/(g.path.length-1)?1:.15}/>)}
     {landed&&<><circle className={styles.burst} cx={end[0]} cy={end[1]} r={3} stroke={c}/>
      <circle cx={end[0]} cy={end[1]} r={1.4} fill={c}/>
      <text className={styles.gl} x={lx} y={ly} textAnchor="middle">{g.min}′ {g.who.split(' ').pop()}</text></>}
     {live&&<text className={styles.goalWord} x={g.team==='USA'?90:15} y={g.team==='USA'?60:60} textAnchor="middle" fill={c}>GOAL!</text>}
    </g>;})}
   {ball&&<><circle cx={ball[0]} cy={ball[1]} r={2.6} fill="#fff" opacity={.18}/><circle className={styles.ball} cx={ball[0]} cy={ball[1]} r={1.25}/></>}
   {!over&&<text className={styles.side} x={52.5} y={77.5} textAnchor="middle">{FINAL_1991.place.toUpperCase()} · {FINAL_1991.date.toUpperCase()}</text>}
  </svg>
  {over&&<div className={styles.ft} role="status">
   <FirstStar className={`${styles.ftStar} ${styles.ignite}`}/>
   <span className={styles.ftKick}>Full time · {FINAL_1991.date}</span>
   <span className={styles.ftScore}><span style={{color:colorOf('USA')}}>USA</span> {usa}–{nor} <span style={{color:colorOf('Norway')}}>Norway</span></span>
   <span className={styles.ftLine}>The first Women’s World Cup champions</span>
  </div>}
 </div>;
}

export function FinalPanel({r,onSky}:{r:Replay;onSky:()=>void}){
 const {state}=r,scored=(t:'USA'|'Norway')=>G.filter((g,i)=>g.team===t&&(i<state.done||(state.active?.i===i&&state.active.f>=TRAVEL))).length;
 const m=Math.floor(state.minute),over=r.sec>=r.total,u=scored('USA'),n=scored('Norway');
 return <div>
  <div className={styles.board} aria-live="polite">
   <span className={styles.sb}><span className={styles.team} style={{color:colorOf('USA')}}>USA</span><b key={'u'+u} className={styles.num}>{u}</b><small>–</small><b key={'n'+n} className={styles.num}>{n}</b><span className={styles.team} style={{color:colorOf('Norway')}}>Norway</span></span>
   <span className={styles.clock} data-over={over||undefined}>{over?'Full time':m===0&&!r.playing?'Kick-off':`${m}′ of ${LEN}`}</span>
  </div>
  <div className={styles.bar} aria-hidden="true"><i style={{transform:`scaleX(${state.minute/LEN})`}}/>
   {G.map((g,i)=><b key={i} data-done={i<state.done||undefined} style={{left:`${g.min/LEN*100}%`,'--c':colorOf(g.team)} as React.CSSProperties}/>)}
   <em style={{left:'50%'}}>HT</em></div>
  <div className={styles.row}>
   <button type="button" className={`${styles.btn} ${over?'':styles.gold}`} data-museum-own-cue onClick={()=>r.playing?r.pause():r.start()}>{r.playing?<><Pause/>Pause</>:over?<><Again/>Replay</>:r.sec>0?<><Play/>Play</>:<><Play/>Kick off</>}</button>
   <span className={styles.grow}/>
   {over&&<button type="button" className={`${styles.btn} ${styles.gold} ${styles.pop}`} onClick={onSky}>Back to the stars</button>}
  </div>
  <ol className={styles.goals} aria-label="Goals">
   {G.map((g,i)=><li key={i}><button type="button" data-done={i<state.done||undefined} data-live={state.active?.i===i||undefined} data-museum-own-cue onClick={()=>r.goTo(i)} style={{'--c':colorOf(g.team)} as React.CSSProperties}>
    <em>{g.min}′</em><span><b>{g.who}</b> ({g.team}). {g.how}</span></button></li>)}
  </ol>
  <p className={styles.take} data-on={over||undefined}><b>Take it to your game</b>{TAKE_IT} Akers’s winner came from chasing a back pass: keep pressing, and a defender’s mistake can become your goal.</p>
  <p className={styles.note}>In 1991 every match lasted {LEN} minutes: two halves of 40. {FINAL_1991.crowd} fans watched at the {FINAL_1991.place}.</p>
  <p className={styles.illus}>Minutes and scorers are real. The spots on the map are drawn to show how each goal happened.</p>
 </div>;
}
