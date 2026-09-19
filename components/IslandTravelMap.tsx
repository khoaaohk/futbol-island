'use client';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {useEffect,useRef} from 'react';
import {Icon} from './Icon';
import IslandOverview,{type MapDestination,type MapFootprint} from './IslandOverview';
import {VENUES} from '@/lib/town/venues';
import styles from './IslandTravelMap.module.css';
type Props={position:{x:number;z:number};open:boolean;onOpenChange:(open:boolean)=>void;onSelect:(destination:MapDestination)=>void;roads:MapFootprint[];buildings:MapFootprint[]};
export default function IslandTravelMap({position,open,onOpenChange,onSelect,roads,buildings}:Props){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;let timer:ReturnType<typeof setTimeout>|undefined;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus({preventScroll:true});}else if(!open&&el.open){const finish=()=>{el.close();restore.current?.focus({preventScroll:true});};if(matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);}return()=>clearTimeout(timer);},[open]);
 const choices=[{id:'store',title:'Store',copy:'Balls, rides & gear',className:'store-destination'},{id:'square',title:'Arcade',copy:'Games in Island Square',className:'square-destination'},{id:'coaches',title:'Coaches Centre',copy:'Player development · Coming soon',className:'coaches-destination'},...VENUES.map(v=>({id:v.id,title:v.name,copy:v.id+' · Learn & play',className:'format-destination'}))] as const;
 return <dialog ref={dialog} className={`${styles.dialog} ${open?styles.entering:styles.leaving}`} aria-labelledby="town-dialog-title" onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
 <section className={`${styles.panel} ${shell.shell} ${shell.white}`}><header className={shell.header}><div><h2 id="town-dialog-title">Pick your patch</h2></div><DoneButton ref={close} onDone={()=>onOpenChange(false)}/></header><div className={shell.body}><p className={shell.context}>Choose a place on the map or below to travel there.</p>
 <div className={styles.layout}><div className={styles.map}><IslandOverview markerPosition={position} roads={roads} buildings={buildings} onSelect={onSelect}/></div><nav className={styles.destinations} aria-label="Island destinations">{choices.map(choice=><button key={choice.id} type="button" className={choice.className} onClick={()=>onSelect(choice.id)}><span><strong>{choice.title}</strong><small>{choice.copy}</small></span><Icon name="arrow" size={18}/></button>)}</nav></div></div></section>
 </dialog>;
}
