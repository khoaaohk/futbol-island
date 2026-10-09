'use client';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Icon} from './Icon';
import {PlayerBackdrop,lookFor} from './PlayerArt';
import PlayerThumb from './PlayerThumb';
import PlayerCard from './PlayerCard';
import profiles from '@/lib/town/playerProfiles.json';
import CharacterPreview from './CharacterPreview';
import {DEFAULT_CUSTOMIZATION} from '@/lib/town/customization';
import {positionInfo,POSITION_PLAYERS,POSITION_SOURCES,type PositionSelection} from '@/lib/town/playerPositions';
import styles from './PositionGuide.module.css';
import navStyles from './DoneButton.module.css';
import viewerStyles from './CardCollection.module.css';
import revealStyles from './CardOffer.module.css';
import {showCardInBinder} from '@/lib/town/cardRewardStore';
import {cardFoil} from '@/lib/town/cardFoil';
export default function PositionGuide({selection,onClose}:{selection:PositionSelection|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [detail,setDetail]=useState<string|null>(null);const scroll=useRef<HTMLDivElement>(null),profileTrigger=useRef<HTMLButtonElement|null>(null),listScroll=useRef(0),back=useRef<HTMLButtonElement>(null);
 const showProfile=(name:string,button:HTMLButtonElement)=>{profileTrigger.current=button;listScroll.current=scroll.current?.scrollTop??0;setDetail(name);requestAnimationFrame(()=>{if(scroll.current)scroll.current.scrollTop=0;back.current?.focus({preventScroll:true});});};
 const showPosition=()=>{setDetail(null);requestAnimationFrame(()=>{if(scroll.current)scroll.current.scrollTop=listScroll.current;/* the list re-mounts on return, so find the row again */const name=profileTrigger.current?.dataset.player,row=name?[...scroll.current?.querySelectorAll<HTMLButtonElement>('button[data-player]')??[]].find(b=>b.dataset.player===name):null;(row??profileTrigger.current)?.focus({preventScroll:true});});};
 const [tab,setTab]=useState<'current'|'allTime'>('current');
 // Player view (user, Sep 25 2026): it mirrors the card reveal (CardOffer), with the reveal's own classes: top bar Back (left),
 // PlayerCard's Play (centre, when the player has a film) and Flip (right); the player's name above the card in the reveal's title
 // style; "See it in my binder" under it. Back is the way out (to the list, then Done closes the guide); Escape steps back the
 // same way. The top-bar Flip presses PlayerCard's own Flip (hidden here, as in the binder viewer), so the turn keeps its sparks,
 // and mirrors the card's state after any click inside the card (Play turns a flipped card to its front).
 const cardHost=useRef<HTMLDivElement>(null),sheet=useRef<HTMLElement>(null),view=useRef<HTMLDivElement>(null),[flipped,setFlipped]=useState(false);
 const ownFlip=()=>cardHost.current?.querySelector<HTMLButtonElement>('button[aria-pressed]');
 const syncFlip=()=>requestAnimationFrame(()=>{const own=ownFlip();if(own)setFlipped(own.getAttribute('aria-pressed')==='true');});
 const flipCard=()=>{const own=ownFlip();if(!own)return;own.click();syncFlip();};
 // The reveal's room under the card (--sheet-h): the measured height of the note holding See it in my binder.
 useLayoutEffect(()=>{const note=sheet.current,root=view.current;if(!detail||!note||!root)return;
  const set=()=>root.style.setProperty('--sheet-h',`${note.offsetHeight}px`);set();if(typeof ResizeObserver==='undefined')return;
  const observer=new ResizeObserver(set);observer.observe(note);return()=>observer.disconnect();},[detail]);
 // See it in my binder: Paths → Collect cards at this player's pocket. Only opens it; a card not collected yet shows greyed there.
 const openBinder=(name:string)=>{onClose();showCardInBinder(name);};
 useEffect(()=>setFlipped(false),[detail]);
 const profile=detail?(profiles as Record<string,{blurb:string;strengths:string[]}>)[detail]:undefined;
 const info=selection?positionInfo(selection):undefined;
 useEffect(()=>{const el=dialog.current;if(!el)return;if(selection&&info){setTab('current');setDetail(null);if(!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}}else if(el.open){el.close();restore.current?.focus({preventScroll:true});}},[selection]);
 return <dialog ref={dialog} className={styles.dialog} data-card-view={detail?'':undefined} aria-labelledby="position-guide-title" onCancel={e=>{e.preventDefault();if(detail)showPosition();else onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
 {selection&&info&&<section className={`${styles.panel} ${shell.shell} ${shell.white}`}>{detail&&<div className={styles.pageBackdrop} aria-hidden="true"><PlayerBackdrop name={detail}/></div>}{!detail&&<header className={shell.header}><div className={styles.heading}><h2 id="position-guide-title">{info.name}</h2></div><DoneButton ref={close} onDone={onClose}/></header>}
 <div className={`${styles.scroll} ${shell.body}`} ref={scroll}>{!detail&&<p className={shell.context}>Position guide · {selection.label} in {selection.format==='futsal'?'futsal':selection.format==='beach'?'beach soccer':selection.format} · {selection.team==='gold'?'Gold team':'Blue team'}</p>}
 {detail?<div ref={view} className={`${viewerStyles.viewer} ${revealStyles.reveal}`}>
  <div className={viewerStyles.viewerBar}>
   <BackButton ref={back} className={viewerStyles.viewerBack} onBack={showPosition}/>
   <button type="button" className={`${viewerStyles.viewerFlip} ${navStyles.button}`} data-navigation="done" aria-pressed={flipped} onClick={flipCard}><span className={navStyles.label}>Flip</span></button>
  </div>
  <div ref={cardHost} className={`${viewerStyles.cardHost} ${revealStyles.host}`} onClickCapture={syncFlip}>
   <h2 id="position-guide-title" className={revealStyles.added}>{detail}</h2>
   <PlayerCard compact onFlipChange={setFlipped} holo={cardFoil(detail)} name={detail} role={info.name} era={tab} team={selection.team} format={selection.format} firstName={detail.split(' ')[0]} strengths={profile?.strengths??info.keySkills} sources={POSITION_SOURCES.filter((_,i)=>selection.format==='futsal'?i>0:i===0)} blurb={profile?.blurb??`Explore ${detail} through the ${info.name.toLowerCase()} role. Use the checklist below while watching their movement and decisions.`}/>
  </div>
  <section ref={sheet} className={revealStyles.below}><button type="button" className={revealStyles.primary} onClick={()=>openBinder(detail)}>See it in my binder</button></section>
 </div>:<>
 <div className={styles.role}><div className={styles.figure}><CharacterPreview open={!!selection} value={{...DEFAULT_CUSTOMIZATION,clothing:selection.team==='gold'?'classic':'coast'}}/><strong>{selection.label}</strong></div><div className={styles.responsibilities}>{info.note&&<p className={styles.note}>{info.note}</p>}<section><h3>In attack</h3><p>{info.attack}</p></section><section><h3>In defence</h3><p>{info.defense}</p></section><h3>Key skills</h3><div className={styles.skills}>{info.keySkills.map(skill=><span key={skill}>{skill}</span>)}</div></div></div>
 <section className={styles.players}><h3>Players to learn from</h3><div className={styles.tabs} role="group" aria-label="Player examples"><button type="button" aria-pressed={tab==='current'} onClick={()=>setTab('current')}>Current stars</button><button type="button" aria-pressed={tab==='allTime'} onClick={()=>setTab('allTime')}>All-time greats</button></div><ul className={styles.playerList}>{POSITION_PLAYERS[info.role][tab].slice(0,20).map(name=>{const country=lookFor(name).country;return <li key={name}><button type="button" data-player={name} aria-label={`View ${name} player card`} onClick={e=>showProfile(name,e.currentTarget)}><PlayerThumb name={name} team={selection.team} size={60}/><span className={styles.playerText}><span className={styles.playerName}>{name}</span>{country&&<span className={styles.country}>{country}</span>}<small>View player card</small></span><Icon name="arrow" size={18}/></button></li>;})}</ul><p className={styles.caption}>Curated examples to study, not a ranked league table. Some players also play other roles.{tab==='current'?' Updated September 2026.':''}</p></section>
 </>}
 {!detail&&<details className={styles.sources}><summary>Player reference sources</summary>{POSITION_SOURCES.filter((_,i)=>selection.format==='futsal'?i>0:i===0).map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <Icon name="external" size={14}/></a>)}</details>}
 </div></section>}
 </dialog>;
}
