'use client';
import {CharacterToggle} from './CharacterToggle';
import {DoneButton} from './DoneButton';
import {COIN_QUEST,costumeUnlockBalls} from '@/lib/town/coinQuest';
import {useCoinProgress} from '@/lib/town/coinProgress';
import shell from './ModalShell.module.css';
import {useEffect,useRef,useState} from 'react';
import type {TravelMode} from '@/lib/town/travelModes';
import {CUSTOMIZATION_OPTIONS,FACE_STYLES,LOOK_PRESETS,MAIN_PLAYER_NUMBER,SHIRT_NUMBER_ROLES,applyCustomization,applyFace,applyLook,matchingLook,isCustomizationUnlocked,graduateLockNote,type CharacterCustomization,type CustomizationKey} from '@/lib/town/customization';
import {positionInfo} from '@/lib/town/playerPositions';
import {isRideCategory,rideLockedLabel,rideProgressLine,useRideUnlocks} from '@/lib/town/rideUnlocks';
import styles from './CharacterCustomizer.module.css';
import CharacterPreview from './CharacterPreview';
import {Icon} from './Icon';
import {IslandSelect,type IslandSelectOption} from './IslandSelect';
import {PREVIEW_MOVES,moveCaption,stepMoveIndex} from '@/lib/graphics/previewMoves';
import {StorePreview,useStorePreviews} from './StorePreviews';
import {STORE_ITEMS,type StoreCategory} from '@/lib/town/store';
import {isVendingOwned} from '@/lib/town/vendingWallet';
import dynamic from 'next/dynamic';
import Backpack from './Backpack';
import {ensureStarterKit} from '@/lib/town/backpackStore';
import {showCardInBinder} from '@/lib/town/cardRewardStore';
import type {PlayerBookId} from '@/lib/books/catalog';
const PlayerPopUpBook=dynamic(()=>import('./PlayerPopUpBook'),{ssr:false});
type Props={open:boolean;onOpenChange:(open:boolean)=>void;value:CharacterCustomization;onChange:(value:CharacterCustomization)=>void;completedQuizCount:number;totalQuizCount:number;onEquipRide?:(mode:TravelMode)=>void};
const labels:Record<CustomizationKey,string>={costume:'Island costume',character:'Your character',face:'Face',body:'Body',clothing:'Kit',ball:'Dribbling ball',scooter:'Scooters',bike:'Bikes',moped:'Mopeds',jetpack:'Flight',bodyColor:'Body colour',skinTone:'Skin',eyes:'Eyes',mouth:'Mouth',hair:'Hair',hairColor:'Hair colour',build:'Build',headwear:'Headwear',headwearColor:'Headwear colour'};
/** Rarely used fine-tuning, tucked behind More, in two-column order (Build | Headwear, Headwear colour | Body colour, Eyes | Mouth). */
const MORE_KEYS:CustomizationKey[]=['build','headwear','headwearColor','bodyColor','eyes','mouth'];
/** Colour keys whose dropdown shows the chosen colour as a dot. */
const DOT_KEYS=new Set<CustomizationKey>(['bodyColor','hairColor','headwearColor','clothing']);
/** Prev/next arrows under the preview: the character performs each move in place (lib/graphics/previewMoves.ts). */
function MoveArrows({index,onChange}:{index:number;onChange:(index:number)=>void}){
 const go=(dir:number)=>onChange(stepMoveIndex(index,dir));
 return <div className={styles.moveNav} role="group" aria-label="Character moves" data-move-nav onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(e.key==='ArrowLeft'?-1:1);}}}>
  <button type="button" className={`${styles.chip} ${styles.moveArrow}`} aria-label="Previous move" data-tip="Previous move" onClick={()=>go(-1)}><Icon name="back" size={20}/></button>
  <p className={styles.moveName} aria-live="polite" data-move-name={PREVIEW_MOVES[index].id}>{moveCaption(index)}</p>
  <button type="button" className={`${styles.chip} ${styles.moveArrow}`} aria-label="Next move" data-tip="Next move" onClick={()=>go(1)}><Icon name="arrow" size={20}/></button>
 </div>;
}
/** The learning hook: classic shirt numbers and the role each one traditionally plays. */
function NumberLesson(){
 const [picked,setPicked]=useState(MAIN_PLAYER_NUMBER);
 const role=SHIRT_NUMBER_ROLES.find(item=>item.number===picked)!;
 const info=positionInfo({format:'11v11',label:role.position});
 return <div className={styles.numberLesson}>
  <p className={styles.lessonLead}>In the classic 1–11 numbering, 10 is the playmaker: the creative passer who links midfield to attack. Tap a number to see its traditional role.</p>
  <div className={styles.numberRow} role="group" aria-label="Classic shirt numbers">{SHIRT_NUMBER_ROLES.map(item=><button key={item.number} type="button" className={styles.numberChip} aria-pressed={picked===item.number} aria-label={`Number ${item.number}: ${item.title}`} data-tip={item.title} onClick={()=>setPicked(item.number)}>{item.number}</button>)}</div>
  <div className={styles.lessonCard} aria-live="polite"><strong>{role.number} · {role.title}</strong>{info&&<><p>{info.attack}</p><div className={styles.lessonSkills}>{info.keySkills.map(skill=><span key={skill}>{skill}</span>)}</div></>}</div>
 </div>;
}
export default function CharacterCustomizer({open,onOpenChange,value,onChange,completedQuizCount,totalQuizCount,onEquipRide}:Props){
 useCoinProgress();
 const rides=useRideUnlocks();
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 // Character only (user, Sep 26 2026): balls and rides are chosen at the vending machines (docs/vending-machines.md), not here.
 const [tab]=useState<'character'|'rides'>('character');
 const [extra,setExtra]=useState<'why'|'more'|null>(null);
 const [previewCategory,setPreviewCategory]=useState<StoreCategory>('ball');
 // The preview's move; the Skills showcase (0) plays each time Make it yours opens.
 const [moveIndex,setMoveIndex]=useState(0);
 useEffect(()=>{if(open){setMoveIndex(0);setView('look');}},[open]);
 // Look | Backpack (user, Sep 28 2026). The backpack is a view of what the player owns (lib/town/backpack.ts); the starter kit is
 // granted once per save when the island first loads (this component mounts with the island).
 const [view,setView]=useState<'look'|'backpack'>('look');
 const [book,setBook]=useState<PlayerBookId|null>(null);
 useEffect(()=>{ensureStarterKit();},[]);
 const previews=useStorePreviews(open&&tab==='rides');
 const previewItem=STORE_ITEMS.find(item=>item.category===previewCategory&&item.option.id===value[previewCategory])!;
 useEffect(()=>{const el=dialog.current;if(!el)return;let timer:ReturnType<typeof setTimeout>|undefined;
 if(open){if(!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();el.scrollLeft=0;close.current?.focus({preventScroll:true});}
  // Always open at the top (user, Sep 30 2026): reset every scrolled pane, after the Look view has re-rendered.
  const top=()=>{el.scrollTop=0;el.querySelectorAll<HTMLElement>('*').forEach(n=>{if(n.scrollTop)n.scrollTop=0;});};top();requestAnimationFrame(top);}
 else if(el.open){const finish=()=>{el.close();restore.current?.focus({preventScroll:true});};if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);}
 return()=>{if(timer)clearTimeout(timer);};},[open]);
 const choose=(key:CustomizationKey,id:string)=>{if(['ball','scooter','bike','moped','jetpack'].includes(key))setPreviewCategory(key as StoreCategory);onChange(applyCustomization(value,key,id));if(['scooter','bike','moped','jetpack'].includes(key))onEquipRide?.(key as TravelMode);if(key==='ball')onEquipRide?.('walk');};
 const selectField=(key:CustomizationKey)=>{const item=STORE_ITEMS.find(item=>item.category===key&&item.option.id===value[key]);return <label key={key} className={styles.selection}><span className={styles.selectionHeading}>{labels[key]}{item&&<span className={styles.equipmentThumb} aria-hidden="true"><StorePreview item={item} src={previews[item.id]}/></span>}</span><select aria-label={labels[key]} value={value[key]} onFocus={()=>{if(item)setPreviewCategory(item.category);}} onChange={event=>choose(key,event.target.value)}>{CUSTOMIZATION_OPTIONS[key].map(option=>{const ride=isRideCategory(key),unlocked=ride?rides.isUnlocked(key,option.id):isCustomizationUnlocked(option,completedQuizCount,totalQuizCount);return <option key={option.id} value={option.id} disabled={!unlocked}>{option.label}{unlocked?'':ride?` · ${rideLockedLabel(key,option.id)}`:` · Unlocks at ${costumeUnlockBalls(option.id)} matchday soccer balls`}</option>;})}</select></label>;};
 /** One compact IslandSelect with a visible label; the placeholder shows when no option matches (a hand-tuned look or face). */
 const dropdown=({id,label,current,options,onPick,disabled,wide}:{id:string;label:string;current:string;options:IslandSelectOption[];onPick:(id:string)=>void;disabled?:boolean;wide?:boolean})=>
  <IslandSelect key={id} label={label} value={current} options={options} onChange={onPick} disabled={disabled} placeholder="Your own mix" className={`${styles.field}${wide?` ${styles.wide}`:''}`} labelClassName={styles.fieldLabel} dataAttrs={{'data-field':id}}/>;
 /** A customization key as a dropdown; colour keys show dots, costumes keep their lock rule and unlock label. */
 const keyDropdown=(key:CustomizationKey,opts:{label?:string;disabled?:boolean;wide?:boolean}={})=>
  dropdown({id:key,label:opts.label??labels[key],current:value[key],disabled:opts.disabled,wide:opts.wide,onPick:id=>choose(key,id),
   options:CUSTOMIZATION_OPTIONS[key].map(option=>{const earned=isCustomizationUnlocked(option,completedQuizCount,totalQuizCount),owned=key!=='costume'||isVendingOwned(`costume:${option.id}`),unlocked=earned&&owned;return {value:option.id,label:option.label,dot:DOT_KEYS.has(key)?option.color:undefined,disabled:!unlocked,note:unlocked?undefined:earned?'At the island vending machines':graduateLockNote(option)??`Unlocks at ${costumeUnlockBalls(option.id)} matchday soccer balls`};})});
 const preset=value.character==='female'?'female':'male';
 const costumed=value.costume!=='none';
 const matchedLook=matchingLook(value)?.id;
 return <dialog ref={dialog} className={`${styles.dialog} ${open?styles.entering:styles.leaving}`} aria-labelledby="character-customizer-title" aria-modal="true" onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();onOpenChange(false);}}} onKeyUp={e=>e.stopPropagation()}>
 {/* Warm the wardrobe background before the first open, so the fade-in never swaps from the fallback colour to the pattern. */}
 <link rel="preload" as="image" href="/stories/paths/costume-coast.svg"/><link rel="preload" as="image" href="/stories/films/assets/entry-grain.png"/>
 <section className={`${styles.panel} ${shell.shell} ${shell.drawer}`}><header className={`${styles.header} ${shell.header}`}><div><h2 id="character-customizer-title">Make it yours</h2></div><DoneButton ref={close} className={styles.close} onDone={()=>onOpenChange(false)}/></header><div className={`${shell.body} ${styles.body}`}>
  <div className={styles.toggleLayout} data-view-toggle><CharacterToggle value={view} onChange={setView} label="Make it yours" options={[{value:'look',label:'Look'},{value:'backpack',label:'Backpack'}]}/></div>
  {view==='backpack'?<Backpack active={open&&view==='backpack'} value={value} onEquip={(key,id)=>choose(key,id)} onWear={costume=>onChange({...value,costume})} onOpenBook={id=>setBook(id as PlayerBookId)} onShowCard={name=>{onOpenChange(false);showCardInBinder(name);}}/>:
  <div className={styles.layout} data-tab={tab}><div className={styles.previewColumn}>{tab==='character'?<CharacterPreview open={open} value={value} move={moveIndex}/>:<div className={styles.equipmentPreview} data-equipment-preview={previewItem.id}><StorePreview item={previewItem} src={previews[previewItem.id]}/></div>}
 <div className={styles.summary}><div><strong>{tab==='character'?`${preset==='female'?'Female':'Male'} · No. ${MAIN_PLAYER_NUMBER}`:previewItem.option.label}</strong><small>{tab==='character'?<><span className={styles.dragHint}>Drag the preview to turn. Your choices save automatically.</span>{costumed&&<span data-costume-note> Your island costume is on; choose No costume under More options to take it off.</span>}</>:`${labels[previewCategory]} · Select below to equip and save.`}</small></div></div>
 {tab==='character'&&<MoveArrows index={moveIndex} onChange={setMoveIndex}/>}
 </div>{tab==='character'
  ?<div className={styles.builder} data-builder>
   {/* Two-column builder (user, Sep 26 2026): dropdowns for text choices, swatches only for skin; the panel matches the preview card's height. */}
   <div className={styles.fieldGrid}>
    <div className={`${styles.field} ${styles.toggleField}`}><span className={styles.fieldLabel}>Pick a look</span><CharacterToggle value={preset} onChange={character=>choose('character',character)} label="Main character" options={[{value:'male',label:'Male'},{value:'female',label:'Female'}]}/></div>
    {dropdown({id:'look',label:'Look',current:matchedLook??'',onPick:id=>onChange(applyLook(value,id)),options:LOOK_PRESETS.filter(look=>look.character===preset).map(look=>({value:look.id,label:look.label,dot:CUSTOMIZATION_OPTIONS.bodyColor.find(option=>option.id===look.fields.bodyColor)?.color}))})}
    <div className={`${styles.field} ${styles.wide}`}><span className={styles.fieldLabel}>Skin<span> · {CUSTOMIZATION_OPTIONS.skinTone.find(option=>option.id===value.skinTone)?.label}</span></span>
     <div className={styles.swatchRow} role="group" aria-label={labels.skinTone}>{CUSTOMIZATION_OPTIONS.skinTone.map(option=><button key={option.id} type="button" className={styles.colorSwatch} style={{background:option.color}} aria-pressed={value.skinTone===option.id} aria-label={`${labels.skinTone}: ${option.label}`} data-tip={option.label} title={option.label} onClick={()=>choose('skinTone',option.id)}/>)}</div></div>
    {keyDropdown('hair',{label:'Hair style'})}
    {keyDropdown('hairColor',{disabled:value.hair==='none'})}
    {dropdown({id:'face',label:'Face',current:FACE_STYLES.find(face=>value.eyes===face.eyes&&value.mouth===face.mouth)?.id??'',onPick:id=>onChange(applyFace(value,id)),options:FACE_STYLES.map(face=>({value:face.id,label:face.label}))})}
    {keyDropdown('clothing',{label:`Kit · No. ${MAIN_PLAYER_NUMBER}`})}
    {/* Why No. 10 and More sit side by side (user, Sep 26 2026); the open panel shows below the pair. */}
    <button type="button" className={`${styles.chip} ${styles.disclosureButton}`} aria-expanded={extra==='why'} aria-controls="customizer-why" onClick={()=>setExtra(v=>v==='why'?null:'why')}>Why No. {MAIN_PLAYER_NUMBER}?</button>
    <button type="button" className={`${styles.chip} ${styles.disclosureButton}`} aria-expanded={extra==='more'} aria-controls="customizer-more" data-more aria-label="More options: body colour, build, hats, costume" onClick={()=>setExtra(v=>v==='more'?null:'more')}>More options</button>
   </div>
   {extra==='why'&&<div id="customizer-why" className={styles.disclosurePanel}><NumberLesson/></div>}
   {extra==='more'&&<div id="customizer-more" className={`${styles.more} ${styles.fieldGrid}`}>{MORE_KEYS.map(key=>keyDropdown(key,{disabled:key==='headwearColor'&&value.headwear==='none'}))}{keyDropdown('costume',{wide:true})}</div>}
  </div>
  :<div className={styles.selectors}>{(['ball','scooter','bike','moped','jetpack'] as CustomizationKey[]).map(selectField)}<p className={styles.note} data-ride-progress="">{rideProgressLine(rides.finished,rides.total)}. Each path you finish unlocks the next ride in every category.</p></div>}</div>

 }</div></section>{book&&<PlayerPopUpBook bookId={book} onClose={()=>setBook(null)}/>}</dialog>;
}
