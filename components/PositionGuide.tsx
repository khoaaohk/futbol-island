'use client';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import dynamic from 'next/dynamic';
const PlayerClips=dynamic(()=>import('./NpcClips'),{ssr:false});
import shell from './ModalShell.module.css';
import {useEffect,useRef,useState} from 'react';
import {Icon} from './Icon';
import PlayerPortrait from './PlayerPortrait';
import profiles from '@/lib/town/playerProfiles.json';
import CharacterPreview from './CharacterPreview';
import {DEFAULT_CUSTOMIZATION} from '@/lib/town/customization';
import {positionInfo,POSITION_PLAYERS,POSITION_SOURCES,type PositionSelection} from '@/lib/town/playerPositions';
import styles from './PositionGuide.module.css';
export default function PositionGuide({selection,onClose}:{selection:PositionSelection|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [detail,setDetail]=useState<string|null>(null);const scroll=useRef<HTMLDivElement>(null),profileTrigger=useRef<HTMLButtonElement|null>(null),listScroll=useRef(0),back=useRef<HTMLButtonElement>(null);
 const showProfile=(name:string,button:HTMLButtonElement)=>{profileTrigger.current=button;listScroll.current=scroll.current?.scrollTop??0;setDetail(name);requestAnimationFrame(()=>{if(scroll.current)scroll.current.scrollTop=0;back.current?.focus({preventScroll:true});});};
 const showPosition=()=>{setDetail(null);requestAnimationFrame(()=>{if(scroll.current)scroll.current.scrollTop=listScroll.current;profileTrigger.current?.focus({preventScroll:true});});};
 const [tab,setTab]=useState<'current'|'allTime'>('current');
 const profile=detail?(profiles as Record<string,{blurb:string;strengths:string[]}>)[detail]:undefined;
 const info=selection?positionInfo(selection):undefined;
 useEffect(()=>{const el=dialog.current;if(!el)return;if(selection&&info){setTab('current');setDetail(null);if(!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}}else if(el.open){el.close();restore.current?.focus({preventScroll:true});}},[selection]);
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="position-guide-title" onCancel={e=>{e.preventDefault();if(detail)showPosition();else onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
 {selection&&info&&<section className={`${styles.panel} ${shell.shell} ${shell.white}`}><header className={shell.header}><div className={styles.heading}>{detail&&<BackButton ref={back} className={styles.headerBack} onBack={showPosition}/>}<h2 id="position-guide-title">{detail??info.name}</h2></div><DoneButton ref={close} onDone={onClose}/></header>
 <div className={`${styles.scroll} ${shell.body}`} ref={scroll}>{!detail&&<p className={shell.context}>{selection.format.toUpperCase()} · {selection.team==='gold'?'Gold team':'Blue team'} · {selection.label} · Position guide</p>}
 {detail?<div className={styles.profile}><div className={styles.profileIntro}><PlayerPortrait name={detail} size={112}/><div><span className={styles.badge}>{tab==='current'?'Current star':'All-time great'} · {info.name}</span><p>{profile?.blurb??`Explore ${detail} through the ${info.name.toLowerCase()} role. Use the checklist below while watching their movement and decisions.`}</p></div></div><section><h3>{profile?'Strengths to study':'What to watch'}</h3><ul>{(profile?.strengths??info.keySkills).map(skill=><li key={skill}>{skill}</li>)}</ul></section><section><h3>Top plays &amp; highlights</h3><PlayerClips key={detail} player={detail} prompt={`Watch ${detail} before the ball arrives. Which positioning or technique could you practise?`}/></section><section className={styles.study}><h3>Watch one sequence</h3><p>Follow {detail.split(' ')[0]} before they receive the ball, during the play and immediately afterward. Notice their positioning, first touch and next movement.</p><h3>Try it in your own game</h3><p>Pick one of these skills to practise slowly, then use it in a small game with a teammate.</p></section></div>:<>
 <div className={styles.role}><div className={styles.figure}><CharacterPreview open={!!selection} value={{...DEFAULT_CUSTOMIZATION,clothing:selection.team==='gold'?'classic':'coast'}}/><strong>{selection.label}</strong></div><div className={styles.responsibilities}>{info.note&&<p className={styles.note}>{info.note}</p>}<section><h3>In attack</h3><p>{info.attack}</p></section><section><h3>In defence</h3><p>{info.defense}</p></section><h3>Key skills</h3><div className={styles.skills}>{info.keySkills.map(skill=><span key={skill}>{skill}</span>)}</div></div></div>
 <section className={styles.players}><h3>Players to learn from</h3><div className={styles.tabs} role="group" aria-label="Player examples"><button type="button" aria-pressed={tab==='current'} onClick={()=>setTab('current')}>Current stars</button><button type="button" aria-pressed={tab==='allTime'} onClick={()=>setTab('allTime')}>All-time greats</button></div><ul>{POSITION_PLAYERS[info.role][tab].map(name=><li key={name}><button type="button" aria-label={`View ${name} profile`} onClick={e=>showProfile(name,e.currentTarget)}><PlayerPortrait name={name} size={40}/><span>{name}<small>View player profile</small></span><Icon name="arrow" size={18}/></button></li>)}</ul><p className={styles.caption}>Curated examples to study, not a ranked league table. Some players also play other roles.{tab==='current'?' Updated September 2026.':''}</p></section>
 </>}
 <details className={styles.sources}><summary>Player reference sources</summary>{POSITION_SOURCES.filter((_,i)=>selection.format==='futsal'?i>0:i===0).map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <Icon name="external" size={14}/></a>)}</details>
 </div></section>}
 </dialog>;
}
