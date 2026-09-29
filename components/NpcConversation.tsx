'use client';
import {DoneButton} from './DoneButton';
import dynamic from 'next/dynamic';
import shell from './ModalShell.module.css';
import {Icon} from './Icon';
import {useEffect,useRef,useState} from 'react';
import type {NpcDefinition} from '@/lib/town/npcDialogues';
import styles from './NpcConversation.module.css';
import slide from './DrawerSlide.module.css';
import {DRAWER_SLIDE_OUT_MS,showDrawer} from './drawerSlide';
import {launchLearning,readLearning} from '@/lib/town/learningProgress';
import NpcNews from './NpcNews';
import {earnForNpc} from '@/lib/town/cardRewardTriggers';
import {npcCardsToday} from '@/lib/town/cardRewardStore';
import cardStyles from './CardOffer.module.css';
import NpcMatchStory from './NpcMatchStory';
const NpcRanking=dynamic(()=>import('./NpcRanking'),{ssr:false});
const CourtFreestyleClips=dynamic(()=>import('./CourtFreestyleClips'),{ssr:false});
const NpcClips=dynamic(()=>import('./NpcClips'),{ssr:false});
type Exchange={id:string;question:string;answer?:string;news?:'scores'|'transfers'};
type Props={npc:NpcDefinition|null;open:boolean;onOpenChange:(open:boolean)=>void};
export default function NpcConversation({npc,open,onOpenChange}:Props){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [exchanges,setExchanges]=useState<Exchange[]>([]),[thinkingId,setThinkingId]=useState<string|null>(null);
 const latest=useRef<HTMLDivElement>(null),suggestions=useRef<HTMLDivElement>(null),body=useRef<HTMLDivElement>(null);
 useEffect(()=>{setThinkingId(null);if(open){setExchanges([]);body.current?.scrollTo({top:0});}},[open,npc?.id]);
 useEffect(()=>{if(!open||!thinkingId)return;const timer=setTimeout(()=>setThinkingId(null),800);return()=>clearTimeout(timer);},[open,npc?.id,thinkingId]);
 useEffect(()=>{if(exchanges.length){if(!thinkingId)suggestions.current?.focus({preventScroll:true});const scroller=body.current,message=latest.current;if(scroller&&message)scroller.scrollTo({top:scroller.scrollTop+message.getBoundingClientRect().top-scroller.getBoundingClientRect().top-16,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}},[exchanges.length,thinkingId]);
 useEffect(()=>{const el=dialog.current;if(!el)return;let timer:ReturnType<typeof setTimeout>|undefined;
  if(open&&npc){if(!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;showDrawer(el,close.current);}}
  else if(el.open){const finish=()=>{el.close();restore.current?.focus({preventScroll:true});};if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,DRAWER_SLIDE_OUT_MS);}
  return()=>{if(timer)clearTimeout(timer);};},[open,npc]);
 const [showRanking,setShowRanking]=useState(false),[showClips,setShowClips]=useState(false);
 useEffect(()=>{setShowRanking(false);setShowClips(false);},[npc?.id,open]);
 const asked=new Set(exchanges.map(exchange=>exchange.id));
 // Card rewards: a chat is "finished" once a topic and its follow-up were asked; closing it then offers a card pick (at most one
 // per islander per day and NPC_PICKS_PER_DAY a day, docs/card-rewards.md). Tracked in a ref so it survives the close.
 const learned=useRef<{npc:NpcDefinition;topics:string}|null>(null);
 if(open&&npc&&exchanges.some(exchange=>exchange.id.endsWith(':follow-up')))learned.current={npc,topics:exchanges.map(exchange=>`${exchange.question} ${exchange.answer??''}`).join(' ')};
 useEffect(()=>{if(open)return;const done=learned.current;learned.current=null;if(done)earnForNpc(done.npc,done.topics);},[open]);
 const cardsToday=open&&npc?npcCardsToday(npc.id):'off';
 const send=(exchange:Exchange)=>{if(thinkingId||asked.has(exchange.id))return;if((exchange.answer?.length??0)>150&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)setThinkingId(exchange.id);setExchanges(current=>[...current,exchange]);};
 return <dialog ref={dialog} className={`${styles.dialog} ${slide.drawer} ${open?`${styles.entering} ${slide.entering}`:`${styles.leaving} ${slide.leaving}`}`} aria-labelledby="npc-conversation-title" aria-modal="true" onCancel={event=>{event.preventDefault();onOpenChange(false);}} onClick={event=>{if(event.target===event.currentTarget)onOpenChange(false);}} onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();onOpenChange(false);}}} onKeyUp={event=>event.stopPropagation()}>
  <section className={`${styles.panel} ${slide.panel} ${shell.shell} ${shell.drawer}`}>
   <header className={`${styles.header} ${shell.header}`}><div><h2 id="npc-conversation-title">{npc?.name??'Let’s talk futbol.'}</h2></div><DoneButton ref={close} className={styles.close} onDone={()=>onOpenChange(false)}/></header>
   <div ref={body} className={`${shell.body} ${styles.body}`}>
    <p className={shell.context}>{npc?.role}</p>
    <div className={styles.transcript} role="log" aria-label={`Conversation with ${npc?.name??'an island neighbour'}`} aria-live="polite" aria-relevant="additions">
     <div className={styles.message}><span className={styles.speaker}>{npc?.name}</span><p>{npc?.greeting}</p></div>
     {open&&npc?.matchStory&&<NpcMatchStory key={npc.id} id={npc.id} name={npc.name} league={npc.newsLeague} slot={npc.newsSlot} focus={npc.newsFocus}/>}
     {open&&npc?.freestyle!==undefined&&<CourtFreestyleClips key={npc.id} variant={npc.freestyle}/>}
     {open&&showRanking&&npc?.ranking&&<NpcRanking/>}
     {open&&showClips&&(npc?.newsLeague||npc?.videoTopic)&&<NpcClips league={npc.newsLeague} topic={npc.videoTopic} prompt={npc.videoPrompt} eager/>}
     {exchanges.map((exchange,index)=><div key={exchange.id} ref={index===exchanges.length-1?latest:undefined} className={styles.exchange}>
      <div className={`${styles.message} ${styles.userMessage}`}><span className={styles.speaker}>You</span><p>{exchange.question}</p></div>
      <div key={thinkingId===exchange.id?'thinking':'answer'} className={`${styles.message} ${exchange.news?styles.newsMessage:''}`}><span className={styles.speaker}>{npc?.name}</span>{thinkingId===exchange.id?<div className={styles.thinking} role="status" aria-label={`${npc?.name} is thinking`}><span className={styles.typingDots} aria-hidden="true"><i/><i/><i/></span><span>Thinking…</span></div>:<>{exchange.answer&&<p>{exchange.answer}</p>}{exchange.news&&open&&<NpcNews kind={exchange.news} league={npc?.newsLeague}/>}</>}</div>
     </div>)}
    </div>
    {!thinkingId&&<div key={`${npc?.id}:${exchanges.length}`} ref={suggestions} className={styles.suggestions} role="group" aria-label="Choose your next reply" tabIndex={-1}>
     {cardsToday==='day-cap'&&<p className={cardStyles.npcNote}>You’ve met lots of players today. Chat cards take a rest until tomorrow, and every tip still counts.</p>}
     <p className={styles.replyLabel}>Your reply</p>
     {npc?.ranking&&!showRanking&&<button type="button" onClick={()=>setShowRanking(true)}>Let’s rank players and teams <Icon name="arrow"/></button>}
     {(npc?.newsLeague||npc?.videoTopic)&&!showClips&&<button type="button" onClick={()=>setShowClips(true)}>{npc.videoTopic?'Watch a clip':`Show me a clip from ${npc.role.split(' · ').at(-1)}`} <Icon name="arrow"/></button>}
     {npc?.news&&!asked.has('news')&&<button type="button" onClick={()=>send({id:'news',question:npc.newsQuestion??(npc.news==='scores'?'What are the latest scores?':'Any transfer news?'),answer:npc.newsIntro,news:npc.news})}>{npc.newsQuestion??(npc.news==='scores'?'What are the latest scores?':'Any transfer news?')}<Icon name="arrow"/></button>}
     {npc?.topics.filter(item=>asked.has(item.id)&&!asked.has(`${item.id}:follow-up`)).map(item=><button type="button" key={`${item.id}:follow-up`} onClick={()=>send({id:`${item.id}:follow-up`,question:item.followUp.question,answer:item.followUp.answer})}>{item.followUp.question}<Icon name="arrow"/></button>)}
     {npc?.topics.filter(item=>!asked.has(item.id)).map(item=><button type="button" key={item.id} onClick={()=>send({id:item.id,question:item.question,answer:item.answer})}>{item.question}<Icon name="arrow"/></button>)}

     <button type="button" onClick={()=>{onOpenChange(false);launchLearning(readLearning().active??'support',`npc:${npc?.id??'island'}`);}}>{npc?.ranking?'Learn the game behind the rankings':`Practise with ${npc?.name??'a teammate'}`} <Icon name="arrow"/></button>
     <button type="button" className={styles.goodbye} onClick={()=>onOpenChange(false)}>Thanks, see you around.</button>
    </div>}
   </div>
  </section>
 </dialog>;
}
