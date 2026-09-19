'use client';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import shell from './ModalShell.module.css';
import CostumeCollection from './CostumeCollection';
import {Icon} from './Icon';
import {useEffect,useRef,useState} from 'react';
import {recordQuestEvent} from '@/lib/town/questProgress';
import type {CharacterCustomization} from '@/lib/town/customization';
import type {TravelMode} from '@/lib/town/travelModes';
import {STORE_CATEGORIES,STORE_ITEMS,equipStoreItem,type StoreCategory} from '@/lib/town/store';
import {StorePreview,useStorePreviews} from './StorePreviews';
import styles from './IslandStore.module.css';
export type IslandStoreProps={open:boolean;onOpenChange:(open:boolean)=>void;value:CharacterCustomization;onChange:(value:CharacterCustomization)=>void;onEquipRide:(mode:TravelMode)=>void;itemRequest?:{id:string;nonce:number}|null};
export default function IslandStore({open,onOpenChange,value,onChange,onEquipRide,itemRequest}:IslandStoreProps){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [category,setCategory]=useState<StoreCategory|'costume'>('ball'),[notice,setNotice]=useState('');
 const [activeStory,setActiveStory]=useState<string|null>(null);
 useEffect(()=>{if(!itemRequest)return;const [cat,id]=itemRequest.id.split(':');setCategory(cat as StoreCategory|'costume');setActiveStory(cat==='costume'&&id!=='matchday-fox'?id:null);setNotice('');requestAnimationFrame(()=>dialog.current?.querySelector(`[data-store-item="${itemRequest.id}"]`)?.scrollIntoView({block:'center'}));},[itemRequest]);
 const storyOpen=category==='costume'&&activeStory!==null;
 const previews=useStorePreviews(open&&category!=='costume');
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){recordExploreActivity('store');restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setNotice('');el.showModal();close.current?.focus({preventScroll:true});}else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 const equip=(id:string)=>{const result=equipStoreItem(value,id);if(!result)return;onChange(result.value);onEquipRide(result.mode);recordQuestEvent({type:'equip'});const item=STORE_ITEMS.find(item=>item.id===id)!;setNotice(`${item.option.label} equipped. Close the store to try it on the island.`);};
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="island-store-title" onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
 <section className={`${styles.panel} ${shell.shell} `}><header className={`${styles.header} ${shell.header}`}>{storyOpen&&<BackButton className={styles.close} onBack={()=>setActiveStory(null)}/>}<div><h2 id="island-store-title">{storyOpen?'Football history':'The Store'}</h2></div><DoneButton ref={close} className={styles.close} onDone={()=>onOpenChange(false)}/></header><div className={shell.body} data-modal-scroll>
 {!storyOpen&&<><div className={styles.welcome}><strong>{category==='costume'?'Island animals. Football stories.':'New gear. More ways to explore.'}</strong><p>{category==='costume'?'Collect all 55 balls to unlock all costumes. Explore their stories while you search.':'Pick your style and take it outside.'}</p>{category==='costume'&&<span>55 BALLS · ALL COSTUMES</span>}</div>
 <div className={styles.tabs} role="group" aria-label="Store categories">{[...STORE_CATEGORIES,{id:'costume' as const,label:'Island animals'}].map(tab=><button type="button" key={tab.id} aria-pressed={category===tab.id} onClick={()=>{setCategory(tab.id);setNotice('');}}>{tab.label}</button>)}</div></>}
 {category==='costume'?<CostumeCollection active={activeStory} onStoryChange={setActiveStory} open={open} value={value} onChange={onChange} onNotice={setNotice}/>:<div className={styles.grid}>{STORE_ITEMS.filter(item=>item.category===category).map(item=>{const selected=value[item.category]===item.option.id;return <article className={`${styles.card} ${selected?styles.equipped:''}`} key={item.id} data-store-item={item.id}><div className={styles.image}><StorePreview item={item} src={previews[item.id]}/></div><div className={styles.details}><h3>{item.option.label}</h3><p>{item.description}</p><button type="button" aria-label={`${selected?'Use':'Equip'} ${item.option.label} ${item.category==='jetpack'?'':item.category}`.trim()} onClick={()=>equip(item.id)}>{selected?'Equipped · use it':'Equip'}<span aria-hidden="true"><Icon name={selected?'check':'arrow'}/></span></button></div></article>;})}</div>}
 {(!storyOpen||notice)&&<footer className={styles.footer}><p role="status" aria-live="polite">{notice||'Your equipped gear saves automatically on this device.'}</p></footer>}
 </div></section></dialog>;
}
