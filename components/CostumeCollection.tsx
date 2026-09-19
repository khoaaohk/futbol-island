'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {getIslandCostume} from '@/lib/town/islandCostumes';
import {CLUB_COSTUMES,getCostume,type ClubCostume} from '@/lib/town/costumes';
import type {CharacterCustomization} from '@/lib/town/customization';
import {usePassport,recordPassportAnswer} from '@/lib/town/passportProgress';
import {recordQuestEvent} from '@/lib/town/questProgress';
import {useCostumePreviews} from './CostumePreviews';
import {COIN_QUEST,COIN_REWARD_ID,coinRewardEarned,allCostumesEarned} from '@/lib/town/coinQuest';
import {readCoinProgress,useCoinProgress} from '@/lib/town/coinProgress';
import styles from './CostumeCollection.module.css';

type Props={active:string|null;onStoryChange:(id:string|null)=>void;open:boolean;value:CharacterCustomization;onChange:(value:CharacterCustomization)=>void;onNotice:(notice:string)=>void;};
const storyLabel=(item:ClubCostume)=>item.storyType==='club-fiction'?'Mascot make-believe':item.storyType==='historic-symbol'?'Historic club symbol':'Club history';
export default function CostumeCollection({active,onStoryChange,open,value,onChange,onNotice}:Props){
 const progress=useCoinProgress(),unlocked=allCostumesEarned(progress);
 const canEquip=(id:string)=>id==='none'||(id===COIN_REWARD_ID?coinRewardEarned(progress):unlocked);
 const [answer,setAnswer]=useState<number|null>(null);const learned=usePassport().stories;
 const scroll=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),lastCard=useRef<string|null>(null),listPosition=useRef(0);
 const scrollContainer=()=>scroll.current?.closest<HTMLElement>('[data-modal-scroll]')??scroll.current;
 const previews=useCostumePreviews(open,value),item=active?getCostume(active):undefined;
 useEffect(()=>{
  if(item){setAnswer(null);scrollContainer()?.scrollTo(0,0);heading.current?.focus({preventScroll:true});}
  else if(lastCard.current){scrollContainer()?.scrollTo(0,listPosition.current);scroll.current?.querySelector<HTMLButtonElement>(`[data-story="${lastCard.current}"]`)?.focus({preventScroll:true});}
 },[item]);
 const equip=(costume:string)=>{const current=readCoinProgress();if(costume!=='none'&&!(costume===COIN_REWARD_ID?coinRewardEarned(current):allCostumesEarned(current)))return;onChange({...value,costume});recordQuestEvent({type:'equip'});onNotice(costume==='none'?'Costume removed. Your original character is ready.':`${getIslandCostume(costume).name} equipped. Your character and ride stay yours.`);};
 const choose=(index:number)=>{
  if(!item)return;setAnswer(index);
  recordPassportAnswer('story',item.id,index);
 };
 const show=(id:string)=>{listPosition.current=scrollContainer()?.scrollTop??0;lastCard.current=id;setAnswer(null);onStoryChange(id);onNotice('');};
 const picture=(c:{id:string},large=false)=><div className={`${styles.picture} ${large?styles.hero:''}`} style={{'--club-color':`#${getIslandCostume(c.id).kitColor.toString(16).padStart(6,'0')}`} as CSSProperties}>
  {previews[c.id]?<img src={previews[c.id]} alt={`Your character wearing the ${getIslandCostume(c.id).name} island ${getIslandCostume(c.id).animalLabel.toLowerCase()} costume`} width={320} height={280}/>:<span className={styles.placeholder}>{getIslandCostume(c.id).animalLabel} costume</span>}
 </div>;
 return <div className={styles.collection}>
  <div className={styles.toolbar}><span>{learned.length} / {CLUB_COSTUMES.length} club stories learned</span><button type="button" disabled={!value.costume||value.costume==='none'} onClick={()=>equip('none')}>Remove costume</button></div>
  <div className={styles.scroll} ref={scroll}>
   <p className={styles.identityNote}>Island costumes are Futbol Island characters, not official club mascots or merchandise. Club names identify the subjects of our history lessons.</p>
   {item?<article className={styles.story} data-costume-story={item.id}>
    <div className={styles.storyTop}>{picture(item,true)}<div className={styles.intro}><span className={styles.eyebrow}>Futbol Island character</span><h3 ref={heading} tabIndex={-1}>{getIslandCostume(item.id).name}</h3><p>{getIslandCostume(item.id).animalLabel} costume</p><button type="button" className={styles.primary} disabled={!canEquip(item.id)} onClick={()=>equip(item.id)}>{value.costume===item.id?'Equipped':canEquip(item.id)?'Equip':`Find all ${COIN_QUEST.length} balls`}</button></div></div>
    <div className={styles.history}><span className={styles.eyebrow}>Our fictional island story</span><h4>{getIslandCostume(item.id).name}’s football habit</h4><p>{getIslandCostume(item.id).story}</p><p className={styles.identityNote}>This island costume is separate from the club mascot described below.</p></div>
    <div className={styles.history}><span className={styles.eyebrow}>{storyLabel(item)}</span><h4>{item.club}: {item.name}</h4><p className={styles.identityNote}>Football history · {item.country}. This lesson describes the club’s mascot or symbol; the costume above is our island character.</p>{item.story.split('\n\n').map((paragraph,index)=><p key={index}>{paragraph}</p>)}<a href={item.source} target="_blank" rel="noreferrer">Source & further reading ↗</a></div>
    <fieldset className={styles.quiz}><legend>Know your club</legend><p>{item.question}</p><div className={styles.choices}>{item.choices.map((choice,index)=><button type="button" key={choice} aria-pressed={answer===index} disabled={answer===item.answer} data-correct={answer!==null&&index===item.answer&&answer===item.answer} onClick={()=>choose(index)}>{choice}</button>)}</div><div className={styles.feedback} role="status" aria-live="polite">{answer===null?'Read the story, then give it a try.':answer===item.answer?`That's right! ${item.explanation}`:'Not quite. Take another look at the story and try again.'}</div></fieldset>
   </article>:<div className={styles.grid}>{CLUB_COSTUMES.map(c=><article className={styles.card} key={c.id} data-costume={c.id} data-equipped={value.costume===c.id}>{picture(c)}<div className={styles.cardBody}><span className={styles.eyebrow}>Futbol Island character</span><h3>{getIslandCostume(c.id).name}</h3><p>{getIslandCostume(c.id).animalLabel} costume</p><p className={styles.lessonLink}>Football history: {c.club}<br/>{learned.includes(c.id)?'Lesson completed ✓':'Explore the real mascot’s story'}</p><button type="button" className={styles.secondary} data-story={c.id} onClick={()=>show(c.id)}>Explore football history</button><button type="button" className={styles.primary} aria-label={`Equip ${getIslandCostume(c.id).name} island costume`} disabled={!canEquip(c.id)} onClick={()=>equip(c.id)}>{value.costume===c.id?'Equipped ✓':canEquip(c.id)?'Equip':`Find all ${COIN_QUEST.length} balls`}</button></div></article>)}<article className={styles.card} data-costume={COIN_REWARD_ID} data-equipped={value.costume===COIN_REWARD_ID}>{picture({id:COIN_REWARD_ID})}<div className={styles.cardBody}><span className={styles.eyebrow}>Futbol Island character</span><h3>Matchday Fox</h3><p>Fox costume</p><p className={styles.lessonLink}>Check both shoulders, spot a teammate, and find a clear passing lane.</p><button type="button" className={styles.primary} disabled={!canEquip(COIN_REWARD_ID)} onClick={()=>equip(COIN_REWARD_ID)}>{value.costume===COIN_REWARD_ID?'Equipped ✓':canEquip(COIN_REWARD_ID)?'Equip':`Find all ${COIN_QUEST.length} balls`}</button></div></article></div>}
  </div>
 </div>;
}
