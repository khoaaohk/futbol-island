'use client';
import {DoneButton} from './DoneButton';
import {COIN_QUEST} from '@/lib/town/coinQuest';
import {useCoinProgress} from '@/lib/town/coinProgress';
import shell from './ModalShell.module.css';
import {Icon} from './Icon';
import {useEffect,useRef,useState} from 'react';
import type {TravelMode} from '@/lib/town/travelModes';
import {CUSTOMIZATION_OPTIONS,isCustomizationUnlocked,selectCharacter,type CharacterCustomization,type CustomizationKey} from '@/lib/town/customization';
import styles from './CharacterCustomizer.module.css';
import CharacterPreview from './CharacterPreview';
import {StorePreview,useStorePreviews} from './StorePreviews';
import {STORE_ITEMS,type StoreCategory} from '@/lib/town/store';
type Props={open:boolean;onOpenChange:(open:boolean)=>void;value:CharacterCustomization;onChange:(value:CharacterCustomization)=>void;completedQuizCount:number;totalQuizCount:number;onEquipRide?:(mode:TravelMode)=>void};
const labels:Record<CustomizationKey,string>={costume:'Island costume',character:'Your character',face:'Face',body:'Body',clothing:'Clothing',ball:'Dribbling ball',scooter:'Scooters',bike:'Bikes',moped:'Mopeds',jetpack:'Flight'};
export default function CharacterCustomizer({open,onOpenChange,value,onChange,completedQuizCount,totalQuizCount,onEquipRide}:Props){
 useCoinProgress();
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [tab,setTab]=useState<'character'|'rides'>('character');
 const [previewCategory,setPreviewCategory]=useState<StoreCategory>('ball');
 const previews=useStorePreviews(open&&tab==='rides');
 const previewItem=STORE_ITEMS.find(item=>item.category===previewCategory&&item.option.id===value[previewCategory])!;
 useEffect(()=>{const el=dialog.current;if(!el)return;let timer:ReturnType<typeof setTimeout>|undefined;
 if(open){if(!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();el.scrollLeft=0;close.current?.focus({preventScroll:true});}}
 else if(el.open){const finish=()=>{el.close();restore.current?.focus({preventScroll:true});};if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);}
 return()=>{if(timer)clearTimeout(timer);};},[open]);
 const choose=(key:CustomizationKey,id:string)=>{if(['ball','scooter','bike','moped','jetpack'].includes(key))setPreviewCategory(key as StoreCategory);onChange(key==='character'?selectCharacter(value,id as CharacterCustomization['character']):{...value,[key]:id});if(['scooter','bike','moped','jetpack'].includes(key))onEquipRide?.(key as TravelMode);if(key==='ball')onEquipRide?.('walk');};
 const keys:CustomizationKey[]=tab==='character'?['character','face','body','clothing','costume']:['ball','scooter','bike','moped','jetpack'];
 return <dialog ref={dialog} className={`${styles.dialog} ${open?styles.entering:styles.leaving}`} aria-labelledby="character-customizer-title" aria-modal="true" onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();onOpenChange(false);}}} onKeyUp={e=>e.stopPropagation()}>
 <section className={`${styles.panel} ${shell.shell} ${shell.drawer}`}><header className={`${styles.header} ${shell.header}`}><div><h2 id="character-customizer-title">Make it yours</h2></div><DoneButton ref={close} className={styles.close} onDone={()=>onOpenChange(false)}/></header><div className={shell.body}>
 <div className={styles.tabs} role="group" aria-label="Customize"><button type="button" aria-pressed={tab==='character'} onClick={()=>setTab('character')}>Character</button><button type="button" aria-pressed={tab==='rides'} onClick={()=>setTab('rides')}>Balls & rides</button></div>
 {tab==='character'?<CharacterPreview open={open} value={value}/>:<div className={styles.equipmentPreview} data-equipment-preview={previewItem.id}><StorePreview item={previewItem} src={previews[previewItem.id]}/></div>}
 <div className={styles.summary}><div><strong>{tab==='character'?CUSTOMIZATION_OPTIONS.character.find(v=>v.id===value.character)?.label:previewItem.option.label}</strong><small>{tab==='character'?'Your choices save automatically.':`${labels[previewCategory]} · Select below to equip and save.`}</small></div></div>
 
 <div className={styles.selectors}>{keys.map(key=>{const item=STORE_ITEMS.find(item=>item.category===key&&item.option.id===value[key]);return <label key={key} className={styles.selection}><span className={styles.selectionHeading}>{labels[key]}{item&&<span className={styles.equipmentThumb} aria-hidden="true"><StorePreview item={item} src={previews[item.id]}/></span>}</span><select aria-label={labels[key]} value={value[key]} onFocus={()=>{if(item)setPreviewCategory(item.category);}} onChange={event=>choose(key,event.target.value)}>{CUSTOMIZATION_OPTIONS[key].map(option=>{const unlocked=isCustomizationUnlocked(option,completedQuizCount,totalQuizCount);return <option key={option.id} value={option.id} disabled={!unlocked}>{option.label}{unlocked?'':` · Find all ${COIN_QUEST.length} matchday soccer balls`}</option>;})}</select></label>;})}</div>

 </div></section></dialog>;
}
