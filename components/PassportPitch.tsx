'use client';
import {useEffect,useId,useState} from 'react';
import type {ClubJourney} from '@/lib/town/passport';
import styles from './IslandPassport.module.css';
type Pt=[number,number];
const lerp=(a:Pt,b:Pt,t:number):Pt=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const plans:Record<string,{a:Pt[];b:Pt[];d:Pt[];ball:Pt[];targets:Pt[]}>={
 barcelona:{a:[[110,200],[110,200],[180,100],[180,100]],b:[[300,190],[300,190],[300,190],[300,190]],d:[[190,170],[190,194],[190,194],[190,194]],ball:[[121,200],[288,190],[288,190],[190,108]],targets:[[110,200],[275,215],[180,100]]},
 arsenal:{a:[[230,180],[195,150],[195,150],[195,150]],b:[[270,230],[290,190],[325,110],[335,75]],d:[[208,110],[180,126],[185,125],[195,110]],ball:[[242,177],[207,147],[207,147],[330,85]],targets:[[325,110],[208,110],[230,215]]},
 bayern:{a:[[335,135],[335,135],[335,135],[335,135]],b:[[210,120],[165,145],[238,60],[238,60]],d:[[190,94],[156,118],[178,102],[185,88]],ball:[[325,135],[325,135],[325,135],[242,70]],targets:[[210,120],[238,60],[305,148]]}
};
export default function PassportPitch({journey,onAnswer,answer}:{journey:ClubJourney;onAnswer:(n:number)=>void;answer:number|null}){
 const [playing,setPlaying]=useState(false),[time,setTime]=useState(0);const marker=useId().replace(/:/g,''),plan=plans[journey.id];const correct=answer===journey.challenge.answer;
 useEffect(()=>{if(!playing)return;let last=performance.now(),frame:number;const tick=(now:number)=>{const dt=(now-last)/2600;last=now;setTime(t=>Math.min(3,t+dt));frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing]);
 useEffect(()=>{if(time>=3)setPlaying(false);},[time]);
 const beat=Math.min(2,Math.floor(time)),t=time>=3?1:time-beat,s=t*t*(3-2*t);const pos=(points:Pt[])=>lerp(points[beat],points[beat+1],s);
 const run=(points:Pt[]):Pt=>{const from=points[beat],to=points[beat+1];if(from[0]===to[0]&&from[1]===to[1])return from;return [(1-s)*(1-s)*from[0]+2*(1-s)*s*((from[0]+to[0])/2+(journey.id==='arsenal'?25:0))+s*s*to[0],(1-s)*(1-s)*from[1]+2*(1-s)*s*from[1]+s*s*to[1]];};
 const a=run(plan.a),b=run(plan.b),d=pos(plan.d),ball=pos(plan.ball);
 const actor=(p:Pt,label:string,defender=false)=><g transform={`translate(${p.join(' ')})`}><circle r="14" fill={defender?'#54849c':'#f7cb69'} stroke="#fff9e5" strokeWidth="2"/><text textAnchor="middle" y="5" fill={defender?'white':'#243f36'} fontSize="13" fontWeight="800">{label}</text></g>;
 return <div className={styles.pitchLesson}>
 <p>{journey.challenge.prompt}</p>
 <svg className={styles.pitch} viewBox="0 0 440 280" role="group" aria-label={`${journey.skill} interactive pitch. Gold A and B attack upward; blue D defends. Choose a numbered space.`}>
 <defs><marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#fff2b9"/></marker></defs>
 <rect width="440" height="280" rx="14" fill="#436c54"/>{[0,2,4,6].map(n=><rect key={n} x={20+n*57} y="18" width="57" height="244" fill="#ffffff06"/>)}
 <g fill="none" stroke="#e4ecd580" strokeWidth="1.5"><rect x="20" y="18" width="400" height="244"/><path d="M145 18v65h150V18M190 18v23h60V18M200 18V8h40v10"/><path d="M20 252h400"/></g>
 <text x="34" y="43" fill="#e8efd9" fontSize="11">ATTACK ↑</text>
 {(correct||playing||time>0)&&<><path d={`M${a.join(' ')} L${b.join(' ')}`} fill="none" stroke="#d7f2c1" strokeWidth="2" strokeDasharray="5 6"/>{[plan.a,plan.b].filter(points=>points[beat][0]!==points[beat+1][0]||points[beat][1]!==points[beat+1][1]).map((points,i)=><path key={i} d={`M${points[beat].join(' ')} Q${(points[beat][0]+points[beat+1][0])/2+(journey.id==='arsenal'?25:0)} ${points[beat][1]} ${points[beat+1].join(' ')}`} fill="none" stroke="#fff2b9" strokeWidth="3" strokeDasharray="7 5" markerEnd={`url(#${marker})`}/>)}<path d={`M${plan.ball[beat].join(' ')} L${plan.ball[beat+1].join(' ')}`} stroke="#fff2b9" strokeWidth="2" markerEnd={`url(#${marker})`}/></>}
 {plan.targets.map((p,i)=><g key={i} role="button" tabIndex={0} aria-label={journey.challenge.choices[i]} aria-disabled={correct} onClick={()=>{if(!correct)onAnswer(i);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!correct)onAnswer(i);}}} className={styles.target}>
 <rect x={p[0]-24} y={p[1]-24} width="48" height="48" rx="10" fill={correct&&i===answer?'#d2e99aaa':'#f5edc226'} stroke={correct&&i===answer?'#e0f3b5':'#f5edc2'} strokeWidth="2" strokeDasharray={correct&&i===answer?undefined:'4 3'}/><text x={p[0]-17} y={p[1]-10} fill="white" fontSize="12" fontWeight="800">{i+1}</text></g>)}
 <g pointerEvents="none">{actor(a,'A')}{actor(b,'B')}{actor(d,'D',true)}<circle cx={ball[0]} cy={ball[1]} r="5" fill="white" stroke="#253e34" strokeWidth="1.5"/></g>
 </svg>
 <small>Gold = teammates · Blue = defender · Dashed = movement / support · Solid = pass</small>
 {correct&&<><div className={styles.beats} role="group" aria-label="Replay sequence">{journey.challenge.beats.map((label,i)=><button key={label} type="button" aria-pressed={beat===i} onClick={()=>{setPlaying(false);setTime(i+.99);}}>{i+1}. {label}</button>)}</div><button type="button" className={styles.secondary} onClick={()=>{if(playing)setPlaying(false);else{if(time>=3)setTime(0);setPlaying(true);}}}>{playing?'Pause animation':time>=3?'Replay the move':'Play the move'}</button><p className={styles.beatCaption} aria-live="polite">{journey.challenge.beats[beat]}</p></>}
 <p className={styles.note}>An original training illustration, not footage or a recreation of a real match.</p>
 </div>;
}
