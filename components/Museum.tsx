'use client';
import {useState,type CSSProperties} from 'react';
import {useCoinProgress} from '@/lib/town/coinProgress';
import {useBackpack} from '@/lib/town/backpackStore';
import {GRAD_TITLES,graduatedFormats} from '@/lib/endgame/graduationModel';
import {openEndgame,useGraduations} from '@/lib/endgame/graduationStore';
import {certificateIds} from '@/lib/endgame/certificate';
import {EXHIBITS,GALLERIES,UNLOCK_WORDS,exhibitState,galleryOf,type Exhibit,type MuseumCounts} from '@/lib/endgame/museum';
import EndgameDialog from './EndgameDialog';
import styles from './Endgame.module.css';

/**
 * The History Museum (Lane 2, Sep 30 2026): a small walk-in hall of exhibit cases, opened by what the player collects
 * (hidden balls → the Laws, player cards → World Cup history, pop-up books → balls and kits, graduations → Hall of Fame).
 * Tapping a case zooms into it (like the vending machine's close-up view): facts, one "take it to your game" line, sources.
 * Heat: DOM/SVG only (0 WebGL draw calls), static art, nothing animates; the island sleeps behind the dialog and the hall's
 * code and content load only when the dialog first opens content (children render only while open).
 */
export default function Museum({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
 const [zoom,setZoom]=useState<string|null>(null);
 const close=()=>{setZoom(null);onOpenChange(false);};
 const exhibit=EXHIBITS.find(e=>e.id===zoom)??null;
 return <EndgameDialog open={open} label="museum" title={exhibit?exhibit.title:'History Museum'} onClose={close} onBack={exhibit?()=>setZoom(null):undefined}>
  <Hall zoom={exhibit} onZoom={setZoom}/>
 </EndgameDialog>;
}

function useMuseumCounts():MuseumCounts{
 const coins=useCoinProgress(),{groups}=useBackpack(),record=useGraduations();
 const size=(kind:string)=>groups.find(g=>g.kind===kind)?.items.length??0;
 return {balls:coins.collected.length,cards:size('card'),books:size('book'),graduations:graduatedFormats(record).length};
}

function Hall({zoom,onZoom}:{zoom:Exhibit|null;onZoom:(id:string|null)=>void}){
 const counts=useMuseumCounts();
 if(zoom)return <ExhibitView exhibit={zoom} counts={counts}/>;
 const openCount=EXHIBITS.filter(e=>exhibitState(e,counts).open).length;
 return <div data-museum>
  <div className={styles.card}>
   <span className={styles.badge}>{openCount} of {EXHIBITS.length} cases open</span>
   <h3>The story of football</h3>
   <p>Every case opens with something you collect on the island. Tap an open case to look closer.</p>
   <div className={styles.counts}>{(['balls','cards','books','graduations'] as const).map(k=><span key={k}>{counts[k]} {counts[k]===1?UNLOCK_WORDS[k].one:UNLOCK_WORDS[k].many}</span>)}</div>
  </div>
  {GALLERIES.map(g=>{const cases=EXHIBITS.filter(e=>e.gallery===g.id);return <section key={g.id} className={styles.hall} aria-labelledby={`gallery-${g.id}`} data-gallery={g.id}>
   <div className={styles.hallHead}><div><span className={styles.eyebrow}>Opened by {UNLOCK_WORDS[g.unlock].many}</span><h3 id={`gallery-${g.id}`}>{g.title}</h3><p>{g.blurb}</p></div></div>
   <ul className={styles.grid} role="list">{cases.map(e=>{const s=exhibitState(e,counts);return <li key={e.id}>
    <button type="button" className={styles.case} data-open={s.open} data-exhibit={e.id} aria-label={`${e.year}: ${e.title}. ${s.open?'Open, tap to look closer.':s.lockText}`} onClick={()=>{if(s.open)onZoom(e.id);}} aria-disabled={!s.open}>
     <span className={styles.caseArt} style={{'--g':g.art} as CSSProperties} aria-hidden="true"><ExhibitArt object={e.object}/></span>
     <span className={styles.caseBody}><span className={`${styles.badge} ${s.open?'':styles.badgeMuted}`}>{e.year}</span><strong>{e.title}</strong><small>{s.open?e.facts[0]:`${s.lockText} ${s.how}`}</small></span>
    </button></li>;})}</ul>
  </section>;})}
 </div>;
}

function ExhibitView({exhibit,counts}:{exhibit:Exhibit;counts:MuseumCounts}){
 const record=useGraduations(),g=galleryOf(exhibit.gallery),s=exhibitState(exhibit,counts);
 if(!s.open)return <div className={styles.card}><p>{s.lockText} {s.how}</p></div>;
 const certs=exhibit.id==='hall-of-fame'?certificateIds(record):[];
 return <div className={styles.exhibit} data-exhibit-view={exhibit.id}>
  <div className={styles.caseArt} style={{'--g':g.art,height:180,borderRadius:'28px 46px 0 0'} as CSSProperties} aria-hidden="true"><ExhibitArt object={exhibit.object}/></div>
  <div className={styles.card} style={{borderRadius:'0 0 26px 26px'}}>
   <span className={styles.eyebrow}>{g.title} · {exhibit.year}</span>
   <h3>{exhibit.title}</h3>
   <ul>{exhibit.facts.map(f=><li key={f}>{f}</li>)}</ul>
   {certs.length>0&&<div className={styles.shelf} aria-label="Your certificates">{certs.map(id=><button key={id} type="button" className={styles.shelfItem} onClick={()=>openEndgame({target:'certificate',id})}>{id==='diploma'?'Island Diploma':`${GRAD_TITLES[id.slice(5) as keyof typeof GRAD_TITLES]} Graduate`}</button>)}</div>}
   <p className={styles.forGame}>Take it to your game: {exhibit.forYourGame}</p>
   {exhibit.sources.length>0&&<p className={styles.sources}>Sources: {exhibit.sources.map((src,i)=><span key={src.url}>{i>0?' · ':''}<a href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a></span>)}</p>}
  </div>
 </div>;
}

/** One static SVG per exhibit object (drawn in the venue's cream-on-colour riso style). */
export function ExhibitArt({object}:{object:Exhibit['object']}){
 const c='#fff1d3',ink='#22366b';
 const body=(()=>{switch(object){
  case 'book':return <><path d="M14 22h30l6 6 6-6h30v52H56l-6 6-6-6H14z" fill={c} stroke={ink} strokeWidth="3"/><path d="M50 28v52M22 34h18M22 44h18M60 34h18M60 44h18" stroke={ink} strokeWidth="3"/></>;
  case 'whistle':return <><circle cx="42" cy="56" r="20" fill={c} stroke={ink} strokeWidth="3"/><path d="M50 40h34v14H58" fill={c} stroke={ink} strokeWidth="3"/><circle cx="42" cy="56" r="6" fill={ink}/><path d="M84 40l6-10" stroke={ink} strokeWidth="3"/></>;
  case 'cards':return <><rect x="22" y="22" width="30" height="44" rx="4" fill="#f8d651" stroke={ink} strokeWidth="3" transform="rotate(-10 37 44)"/><rect x="48" y="26" width="30" height="44" rx="4" fill="#e0453d" stroke={ink} strokeWidth="3" transform="rotate(8 63 48)"/></>;
  case 'glove':return <><path d="M30 80V44c0-4 6-4 6 0v-10c0-4 6-4 6 0v-4c0-4 6-4 6 0v4c0-4 6-4 6 0v14l6-6c3-3 8 1 5 5L60 70v10z" fill={c} stroke={ink} strokeWidth="3" strokeLinejoin="round"/><circle cx="72" cy="30" r="10" fill={c} stroke={ink} strokeWidth="3"/></>;
  case 'screen':return <><rect x="14" y="24" width="72" height="46" rx="5" fill={c} stroke={ink} strokeWidth="3"/><path d="M40 80h20M50 70v10" stroke={ink} strokeWidth="3"/><path d="M28 56l12-12 10 8 16-16" fill="none" stroke="#e0453d" strokeWidth="3"/><text x="50" y="40" fontSize="11" fontWeight="900" textAnchor="middle" fill={ink}>VAR</text></>;
  case 'trophy':return <><path d="M34 18h32v18a16 16 0 0 1-32 0z" fill="#f8d651" stroke={ink} strokeWidth="3"/><path d="M34 24H24a9 9 0 0 0 11 13M66 24h10a9 9 0 0 1-11 13" fill="none" stroke={ink} strokeWidth="3"/><path d="M45 52h10v14H45zM36 66h28v10H36z" fill="#f8d651" stroke={ink} strokeWidth="3"/></>;
  case 'globe':return <><circle cx="50" cy="48" r="28" fill={c} stroke={ink} strokeWidth="3"/><path d="M22 48h56M50 20c-12 16-12 40 0 56M50 20c12 16 12 40 0 56" fill="none" stroke={ink} strokeWidth="2.5"/></>;
  case 'court':return <><rect x="14" y="26" width="72" height="44" rx="3" fill="#8fc3dc" stroke={c} strokeWidth="3"/><path d="M50 26v44" stroke={c} strokeWidth="2.5"/><circle cx="50" cy="48" r="8" fill="none" stroke={c} strokeWidth="2.5"/><path d="M14 38q12 10 0 20M86 38q-12 10 0 20" fill="none" stroke={c} strokeWidth="2.5"/><circle cx="36" cy="54" r="4" fill="#f8d651" stroke={ink} strokeWidth="1.5"/></>;
  case 'leather':return <><circle cx="50" cy="48" r="28" fill="#8a5a33" stroke={ink} strokeWidth="3"/><path d="M34 30q16 18 0 36M66 30q-16 18 0 36M42 38h16M42 46h16M42 54h16" fill="none" stroke={c} strokeWidth="2.5"/></>;
  case 'telstar':return <><circle cx="50" cy="48" r="28" fill={c} stroke={ink} strokeWidth="3"/><path d="m50 38 9 7-3 11H44l-3-11z" fill={ink}/><path d="m30 32 7 3-1 8-7 2-3-6zM70 32l-7 3 1 8 7 2 3-6zM40 70l3-6h14l3 6-10 5z" fill={ink}/></>;
  case 'shirt':return <><path d="M30 24l12-6h16l12 6 12 12-10 10-6-6v38H34V40l-6 6-10-10z" fill={c} stroke={ink} strokeWidth="3" strokeLinejoin="round"/><text x="50" y="66" fontSize="24" fontWeight="900" textAnchor="middle" fill={ink}>10</text></>;
  default:return <><rect x="20" y="18" width="60" height="62" rx="4" fill="#f8d651" stroke={ink} strokeWidth="3"/><rect x="28" y="26" width="44" height="46" fill={c} stroke={ink} strokeWidth="2"/><path d="m50 36 4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1z" fill={ink}/></>;
 }})();
 return <svg viewBox="0 0 100 96">{body}</svg>;
}
