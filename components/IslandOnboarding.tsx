'use client';
import {BackButton} from './BackButton';
import {NavigationButton} from './DoneButton';
import {COIN_QUEST} from '@/lib/town/coinQuest';
import shell from './ModalShell.module.css';
import {selectCharacter} from '@/lib/town/customization';
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import type {OnboardingNpcTarget} from '@/lib/graphics/onboardingNpc';
import type {CharacterCustomization} from '@/lib/town/customization';
import {finishIslandOnboarding} from '@/lib/town/onboarding';
import CharacterPreview from './CharacterPreview';
import {Icon} from './Icon';
import styles from './IslandOnboarding.module.css';
type Props={npcTarget:MutableRefObject<OnboardingNpcTarget|null>;onNpcStepChange:(active:boolean)=>void;open:boolean;onClose:()=>void;value:CharacterCustomization;onChange:(value:CharacterCustomization)=>void};
const steps=[
 {eyebrow:'YOUR JOURNEY STARTS HERE',title:'Welcome to Futbol Island',copy:'Choose your character, then get to know your first island. Learn the game at your own pace.'},
 {eyebrow:'FOUR WAYS TO LEARN',title:'Find your path',copy:'Open Paths for futsal, 7v7, 9v9 or 11v11. Each format has 12 core lessons, with extra practice when you want to go deeper.',icon:'bolt',note:'Learn through plays, quizzes and teammate stories. Your progress saves as you go.'},
 {eyebrow:'LEARN BY PLAYING',title:'Learn and Quiz',copy:'Visit a field and choose Learn Plays. Follow the ball, arrows and player movements to see each idea in action.',icon:'ball',note:'Pause, replay and try again. Understanding the play matters more than getting it right first time.'},
 {eyebrow:'FOOTBALL IS A TEAM GAME',title:'Characters',copy:'Island characters share football stories, club culture and tips for being a better teammate.',icon:'people',note:'Tap a character, or walk closer and use Talk.'},
 {eyebrow:'MAKE YOURSELF AT HOME',title:'Explore the island',copy:'Move with the joystick or arrow keys. Use the ride button to walk, ride or fly, and open Explore to find places to visit.',icon:'arrow',note:'On foot, tap Kick to pass. Hold it for a higher shot.'},
 {eyebrow:'YOUR FIRST ISLAND',title:'Ready to begin?',copy:`Ball Hunt has clues for ${COIN_QUEST.length} hidden matchday balls. Find them to pick up football tips and unlock costumes.`,icon:'target',note:'Start with a path or explore freely. The academy is a future island; the ferry is not open yet.'},
];
export default function IslandOnboarding({open,onClose,value,onChange,npcTarget,onNpcStepChange}:Props){
 const dialog=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null),restore=useRef<HTMLElement|null>(null);
 const [step,setStep]=useState(0),[highlights,setHighlights]=useState<{left:number;top:number;width:number;height:number}[]>([]);
 const [npc,setNpc]=useState<OnboardingNpcTarget|null>(null);
 const npcCallback=useRef(onNpcStepChange);npcCallback.current=onNpcStepChange;
 useEffect(()=>{npcCallback.current(open&&step===3);if(!open||step!==3){setNpc(null);return;}const timer=setInterval(()=>setNpc(npcTarget.current?{...npcTarget.current}:null),100);return()=>{clearInterval(timer);npcCallback.current(false);};},[open,step,npcTarget]);
 const dismiss=()=>{finishIslandOnboarding('dismissed');onClose();};
 const next=()=>{if(step===steps.length-1){finishIslandOnboarding('completed');onClose();}else setStep(n=>n+1);};
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open){setStep(0);restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;if(!el.open)el.showModal();heading.current?.focus({preventScroll:true});}else if(el.open){el.close();if(restore.current?.isConnected)restore.current.focus({preventScroll:true});}},[open]);
 useEffect(()=>{if(open)heading.current?.focus({preventScroll:true});},[open,step]);
 useEffect(()=>{if(!open||step===0){setHighlights([]);return;}const selector=step===1||step===5?'[data-tour="quests"]':step===2?'[data-tour="plays"]':step===3?'[data-tour="npcs"]':step===4?'[data-tour="controls"], .joystick':'.minimap-toggle';
 const update=()=>{setHighlights(Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(el=>!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden').map(el=>el.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight).map(r=>({left:Math.max(4,r.left-5),top:Math.max(4,r.top-5),width:Math.min(innerWidth-8,r.width+10),height:r.height+10})));};
 update();window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);const timer=setInterval(update,350);return()=>{window.removeEventListener('resize',update);window.visualViewport?.removeEventListener('resize',update);clearInterval(timer);};},[open,step]);
 const current=steps[step];
 // Place the card in the largest clear vertical area between highlighted controls.
 const viewportHeight=typeof window==='undefined'?800:window.visualViewport?.height??window.innerHeight;
 const ranges=highlights.map(r=>({start:Math.max(12,r.top-12),end:Math.min(viewportHeight-12,r.top+r.height+12)})).sort((a,b)=>a.start-b.start);
 let cursor=12;const gaps:{start:number;end:number}[]=[];
 for(const range of ranges){if(range.start>cursor)gaps.push({start:cursor,end:range.start});cursor=Math.max(cursor,range.end);}
 if(cursor<viewportHeight-12)gaps.push({start:cursor,end:viewportHeight-12});
 const gap=gaps.sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0];
 const placed=step!==0&&step!==3&&gap&&gap.end-gap.start>=220;
 const frameHeight=placed?Math.min(350,gap.end-gap.start):undefined;
 const viewportWidth=typeof window==='undefined'?1100:window.innerWidth;
 const cardWidth=Math.min(440,viewportWidth-24),cardHeight=step===0?Math.min(660,viewportHeight-24):step===3&&viewportWidth<=600?Math.min(380,viewportHeight-24):step===3?Math.min(380,viewportHeight-24):frameHeight??Math.min(350,viewportHeight-24);
 const cardLeft=step===3&&viewportWidth>600?viewportWidth-12-cardWidth-Math.max(0,(viewportWidth-1100)/2):(viewportWidth-cardWidth)/2;
 const cardTop=step===3&&viewportWidth<=600?viewportHeight-cardHeight-12:placed?gap.start+(gap.end-gap.start-cardHeight)/2:(viewportHeight-cardHeight)/2;
 const placement={'--tour-width':`${cardWidth}px`,'--tour-height':`${cardHeight}px`,position:'fixed' as const,left:cardLeft,top:cardTop,width:cardWidth,height:cardHeight,maxHeight:viewportHeight-24,margin:0};
 const spotlightWidth=npc?Math.min(Math.max(220,npc.width+24),window.innerWidth-24):0;
 const spotlightLeft=npc?Math.max(12,Math.min(window.innerWidth-spotlightWidth-12,npc.left+npc.width/2-spotlightWidth/2)):0;
 return <dialog ref={dialog} className={`${styles.dialog} ${step===3?styles.npcStep:''}`} aria-labelledby="island-welcome-title" aria-describedby="island-welcome-copy" onCancel={e=>{e.preventDefault();dismiss();}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();dismiss();}}} onKeyUp={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()}>
 {step===3&&npc&&<div className={styles.npcSpotlight} data-npc-highlight={npc.name} style={{left:spotlightLeft,top:npc.top,width:spotlightWidth,height:npc.height}}><span>{npc.name} · Island character</span></div>}
 {highlights.map((rect,i)=><div key={i} className={styles.highlight} style={rect} aria-hidden="true"/>)}
 <section className={`${styles.card} ${shell.shell} ${step===0?styles.welcome:styles.tour}`} style={placement}>
 <header className={`${styles.header} ${shell.header}`}>{step>0&&<BackButton key={step} onBack={()=>setStep(n=>n-1)}/>}<h2 ref={heading} tabIndex={-1} id="island-welcome-title">{current.title}</h2></header><div className={`${shell.body} ${styles.body}`}>
 <div key={step} className={styles.content}><p className={styles.eyebrow}>{current.eyebrow}</p><p id="island-welcome-copy" className={styles.copy}>{current.copy}</p>
 {step===0&&<><div className={styles.preview}><CharacterPreview open={open&&step===0} value={value}/></div><div className={styles.choices} data-character={value.character} role="group" aria-label="Choose your starter character">{(['male','female'] as const).map(character=><button key={character} type="button" aria-pressed={value.character===character} onClick={()=>onChange(selectCharacter(value,character))}>{character==='male'?'Male':'Female'}</button>)}</div><p className={styles.saved}>Your character saves automatically. Change your look anytime.</p></>}
 {current.note&&<div className={styles.note}><Icon name={current.icon} size={28}/><span>{current.note}</span></div>}
 </div></div>
 <footer className={styles.footer}><NavigationButton label="Skip" onNavigate={dismiss}/><div className={styles.progress} role="status" aria-label={`Welcome step ${step+1} of ${steps.length}`}><span className={styles.stepLabel}>{step+1} / {steps.length}</span></div><NavigationButton key={step} label="Next" onNavigate={next}/></footer>
 </section>
 </dialog>;
}
