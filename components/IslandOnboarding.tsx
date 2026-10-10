'use client';
import {CharacterToggle} from './CharacterToggle';
import {BackButton} from './BackButton';
import {NavigationButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {selectCharacter} from '@/lib/town/customization';
import {useEffect,useLayoutEffect,useRef,useState,type MutableRefObject} from 'react';
import type {OnboardingNpcTarget} from '@/lib/graphics/onboardingNpc';
import type {CharacterCustomization} from '@/lib/town/customization';
import {finishIslandOnboarding} from '@/lib/town/onboarding';
import {countWalkthroughExplore,countWalkthroughSkip,countWalkthroughStep} from '@/lib/analytics/learnEvents';
import {FISH} from '@/lib/town/fishing/fishCatalog';
import {goodById} from '@/lib/town/market/goods';
import CharacterPreview from './CharacterPreview';
import FishArt from './FishArt';
import VendingProductArt from './VendingProductArt';
import {CostumeHoodArt,FruitArt,HuntBallArt,JobsArt,TipBookArt} from './PocketArt';
import {StorePreview,useStorePreviews} from './StorePreviews';
import {STORE_ITEMS} from '@/lib/town/store';
import {Icon} from './Icon';
import MiniCard from './MiniCard';
import {cardNumber} from '@/lib/town/cardCollection';
import jobs from './IslandJobs.module.css';
import styles from './IslandOnboarding.module.css';
import dynamicImport from 'next/dynamic';
import {clearPendingRestoreCode,codeRequired,getLocalCode,pendingRestoreCode,savingStatus} from '@/lib/saves/client';
import {CREATE_TITLES,type CreatePhase} from './saves/SaveCodeCreate';
import {RESTORE_TITLES,type RestorePhase} from './saves/SaveCodeRestore';
import saveStyles from './saves/SaveCode.module.css';
// Save codes (Oct 10 2026, docs/accounts-design.md §3.1): loaded only when the save step or "I have a save code" opens.
const SaveCodeCreate=dynamicImport(()=>import('./saves/SaveCodeCreate'),{ssr:false});
const SaveCodeRestore=dynamicImport(()=>import('./saves/SaveCodeRestore'),{ssr:false});
/**
 * First-run welcome (Sep 28 2026; reordered Sep 30 2026, G-32): pick a character, then Paths (the main thing to do: watch plays
 * and take quizzes), then the Ball hunt (every hidden ball teaches a tip), and only then coins: gather to earn, and spend on things
 * that teach football. Learning comes before money. The old NPC-talk step and its camera spotlight were removed; Town still
 * passes `npcTarget` / `onNpcStepChange` (shared file, kept unchanged), so they stay optional and are never activated here.
 * Completion still writes `fi2-welcome-v1` (lib/town/onboarding.ts), so existing players do not see this again.
 * Save codes (Oct 10 2026, docs/accounts-design.md §3.1): when saving is set up (one status GET as the welcome opens), the
 * welcome has a quiet "I have a save code" link, and "Next" after picking a player shows the "Save your island" step.
 * A code is REQUIRED before playing (user decision, Oct 9 2026): no "Not now", no Next and no Skip until this device has a
 * code; Skip (and Escape) on the welcome lead to the code step instead of past it. If saving is down when the code is made,
 * "Saving is taking a break — you can still play today" lets the kid play, and the island asks again on a later visit
 * (components/saves/SaveSync.tsx).
 * (then "Your secret code") before Paths. Both are sub-screens of the welcome, not entries in `steps` (the learning analytics
 * ids stay the same). Without saving set up nothing changes.
 */
type Props={npcTarget?:MutableRefObject<OnboardingNpcTarget|null>;onNpcStepChange?:(active:boolean)=>void;open:boolean;onClose:()=>void;value:CharacterCustomization;onChange:(value:CharacterCustomization)=>void};
type Step={id:'welcome'|'paths'|'balls'|'earn'|'learn';eyebrow:string;title:string;copy:string;note?:string;
 /** HUD controls to ring while this step is shown (the card moves into the largest clear gap). */tour?:string};
const steps:Step[]=[
 {id:'welcome',eyebrow:'PICK YOUR PLAYER',title:'Welcome to Futbol Island',copy:'Learn real football plays, one path at a time. Choose your character to begin.'},
 {id:'paths',eyebrow:'START HERE',title:'Follow your Path',copy:'Your first lesson is waiting in Paths. Watch a play through a player\'s eyes, then try a quick quiz.',note:'Paths start with 7v7 and grow into 9v9 and 11v11 as you learn.',tour:'[data-tour="quests"]'},
 {id:'balls',eyebrow:'THE BALL HUNT',title:'Find hidden balls',copy:'100 balls are hidden around the island. Each one you find teaches you a football tip.',note:'Every 10 balls unlock new costumes, each with its club’s story. See your count in Paths → Ball hunt.'},
 {id:'earn',eyebrow:'YOUR ISLAND POCKET',title:'Earn coins',copy:'Walk or ride around the island to catch fish, pick fruit and help with island jobs.',note:'Sell your catch to Rosa at the market stand. Your coins show at the top of the screen.',tour:'[data-job-wallet]'},
 {id:'learn',eyebrow:'VENDING MACHINES',title:'Spend and learn',copy:'Spend coins on cards, pop-up books and gear. Everything goes in your Backpack: tap your character to open it.',note:'Cards teach positions and books tell true stories of great players. Start with the Futbol Island book in your Backpack!'},
];
const PATH_STOPS=[{label:'Watch',ink:'#f4d57a',edge:'#c9a032'},{label:'Quiz',ink:'#8ec6a1',edge:'#3f8f66'},{label:'Rewards',ink:'#f0b1cc',edge:'#d56d9c'}] as const;
const GEAR_BALL='ball:sunset',gearBall=STORE_ITEMS.find(i=>i.id===GEAR_BALL);
const LEARN_STEP=steps.findIndex(s=>s.id==='learn');
const sardine=FISH.find(f=>f.id==='sardine')??FISH[0],orange=goodById('orange');
export default function IslandOnboarding({open,onClose,value,onChange}:Props){
 const dialog=useRef<HTMLDialogElement>(null),card=useRef<HTMLElement>(null),heading=useRef<HTMLHeadingElement>(null),restore=useRef<HTMLElement|null>(null);
 const [measured,setMeasured]=useState(0);
 const [step,setStep]=useState(0),[highlights,setHighlights]=useState<{left:number;top:number;width:number;height:number}[]>([]);
 const current=steps[step],last=step===steps.length-1;
 // Save sub-screens of the welcome: 'offer' (Save your island → Your secret code) or 'restore' (I have a save code).
 const [save,setSave]=useState<null|'offer'|'restore'>(null),[saving,setSaving]=useState(false),[saveTitle,setSaveTitle]=useState(''),[saveStage,setSaveStage]=useState('');
 const [restoreCode,setRestoreCode]=useState<string|undefined>(undefined),[fallback,setFallback]=useState(false);
 // A code is needed before the island (unless saving is down: `fallback`, or not set up: `saving` false).
 const mustSave=()=>saving&&!fallback&&codeRequired();
 const offered=useRef(false);
 useEffect(()=>{if(!open)return;let live=true;savingStatus().then(s=>{if(!live)return;setSaving(s.saving);const code=pendingRestoreCode();if(s.saving&&code){clearPendingRestoreCode();setRestoreCode(code);setSave('restore');}});return()=>{live=false;};},[open]);
 const [restoreReady,setRestoreReady]=useState({ready:false,busy:false});
 const createPhase=useRef((p:CreatePhase)=>{setSaveTitle(CREATE_TITLES[p]);setSaveStage(p);}).current,restorePhase=useRef((p:RestorePhase)=>{setSaveTitle(p==='enter'||p==='loading'?'My save code':RESTORE_TITLES[p]);setSaveStage(p);}).current;
 // While a restore is loading or showing "Welcome back!", the only way on is Play (no Skip, no Back that would drop the island).
 const saveLocked=save==='restore'&&(saveStage==='loading'||saveStage==='welcome');
 // Until the code exists there is no way past the save step but making one, typing one, or Back to the welcome.
 const noCodeYet=!!save&&saveStage!=='code'&&mustSave();
 const leaveSave=(toNext:boolean)=>{setSave(null);setSaveTitle('');setSaveStage('');if(toNext)setStep(1);};
 const tall=step===0&&!save;
 // Same shelf snapshot the vending machine and Backpack show, rendered once when the Spend step opens (one short-lived renderer).
 const gear=useStorePreviews(open&&step===LEARN_STEP,GEAR_BALL);
 // Learning analytics (Oct 9 2026): the step a Skip happens on, Explore at the end, and each step shown (map increments only).
 const dismiss=()=>{
  // Required code (Oct 9 2026): Skip (or Escape) before there is a code goes to the code step, not past it.
  if(mustSave()&&!getLocalCode()){if(!save)setSave('offer');return;}
  countWalkthroughSkip(steps[step].id);finishIslandOnboarding('dismissed');onClose();};
 // Oct 6 2026 (user): the last button is Explore and just drops the player into the island (no lesson launch).
 const next=()=>{
  if(save){if(!noCodeYet)leaveSave(save==='offer');return;}
  // After picking a player: the save code step (required while this device has none; never when it already has one).
  if(step===0&&mustSave()){offered.current=true;setSave('offer');return;}
  if(last){countWalkthroughExplore();finishIslandOnboarding('completed');onClose();}else setStep(n=>n+1);};
 useEffect(()=>{if(open)countWalkthroughStep(steps[step].id);},[open,step]);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open){setStep(0);setSave(null);offered.current=false;restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;if(!el.open)el.showModal();heading.current?.focus({preventScroll:true});}else if(el.open){el.close();if(restore.current?.isConnected)restore.current.focus({preventScroll:true});}},[open]);
 useEffect(()=>{if(open)heading.current?.focus({preventScroll:true});},[open,step,save]);
 // Heat pass 4 (audit F10): measured on the step, after it settles and on resize — no layout poll (the island is paused behind the tour).
 useEffect(()=>{const selector=open?steps[step].tour:undefined;if(!selector){setHighlights([]);return;}
  const update=()=>{const next=Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(el=>!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden').map(el=>el.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight).map(r=>({left:Math.max(4,r.left-5),top:Math.max(4,r.top-5),width:Math.min(innerWidth-8,r.width+10),height:r.height+10}));setHighlights(old=>JSON.stringify(old)===JSON.stringify(next)?old:next);};
  update();window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);const timers=[setTimeout(update,300),setTimeout(update,900)];return()=>{window.removeEventListener('resize',update);window.visualViewport?.removeEventListener('resize',update);timers.forEach(clearTimeout);};},[open,step]);
 // Place the card in the largest clear vertical area between highlighted controls; otherwise centre it.
 const viewportHeight=typeof window==='undefined'?800:window.visualViewport?.height??window.innerHeight;
 const viewportWidth=typeof window==='undefined'?1100:window.innerWidth;
 const ranges=highlights.map(r=>({start:Math.max(12,r.top-12),end:Math.min(viewportHeight-12,r.top+r.height+12)})).sort((a,b)=>a.start-b.start);
 let cursor=12;const gaps:{start:number;end:number}[]=[];
 for(const range of ranges){if(range.start>cursor)gaps.push({start:cursor,end:range.start});cursor=Math.max(cursor,range.end);}
 if(cursor<viewportHeight-12)gaps.push({start:cursor,end:viewportHeight-12});
 const gap=gaps.sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0];
 // The welcome keeps its tall preview card; tour steps size to their content (measured below), clamped to the viewport.
 const cardHeight=tall?Math.min(660,viewportHeight-24):Math.min(measured||360,viewportHeight-24);
 const placed=!tall&&highlights.length>0&&gap&&gap.end-gap.start>=cardHeight;
 // Side gutter = --phone-gutter (18px, app/globals.css; docs/ui/UI_SPEC.md).
 const cardWidth=Math.min(440,viewportWidth-36);
 const cardTop=placed?gap.start+(gap.end-gap.start-cardHeight)/2:(viewportHeight-cardHeight)/2;
 const placement={'--tour-width':`${cardWidth}px`,'--tour-height':tall?`${cardHeight}px`:'auto',position:'fixed' as const,left:(viewportWidth-cardWidth)/2,top:cardTop,width:cardWidth,height:tall?cardHeight:'auto',maxHeight:viewportHeight-24,margin:0};
 // One read after each render; converges in one extra render because the height never depends on the card's top.
 useLayoutEffect(()=>{const h=card.current?.getBoundingClientRect().height??0;if(!tall&&h>0&&Math.abs(h-measured)>1)setMeasured(h);});
 return <dialog ref={dialog} className={styles.dialog} data-onboarding-step={save?`save-${save}`:current.id} aria-labelledby="island-welcome-title" aria-describedby="island-welcome-copy" onCancel={e=>{e.preventDefault();dismiss();}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();dismiss();}}} onKeyUp={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()}>
 {highlights.map((rect,i)=><div key={i} className={styles.highlight} style={rect} aria-hidden="true"/>)}
 <section ref={card} className={`${styles.card} ${shell.shell} ${tall?styles.welcome:styles.tour}`} style={placement}>
 <header className={`${styles.header} ${shell.header}`}><h2 ref={heading} tabIndex={-1} id="island-welcome-title">{save?saveTitle||(save==='offer'?'Save your island':'Type your save code'):current.title}</h2>{saveLocked||noCodeYet?<span aria-hidden="true"/>:<NavigationButton className={styles.skip} label="Skip" onNavigate={dismiss}/>}</header><div className={`${shell.body} ${styles.body}`}>
 {save?<div key={`save-${save}`} className={styles.content} data-onboarding-save={save}>{save==='offer'?<SaveCodeCreate headless required={mustSave()} onHaveCode={()=>{setRestoreCode(undefined);setSave('restore');}} onPhase={createPhase} onDone={code=>{if(!code)setFallback(true);leaveSave(true);}}/>
 :<SaveCodeRestore headless submitOutside={setRestoreReady} required={mustSave()} initialCode={restoreCode} onPhase={restorePhase} onCancel={()=>mustSave()?setSave('offer'):leaveSave(false)} onDone={restored=>{if(!restored){if(mustSave())setFallback(true);leaveSave(mustSave());}}}/>}</div>:
 <div key={step} className={styles.content}><p className={styles.eyebrow}>{current.eyebrow}</p><p id="island-welcome-copy" className={styles.copy}>{current.copy}</p>
 {current.id==='welcome'&&<><div className={styles.preview}><CharacterPreview open={open&&step===0} value={value}/></div><div className={styles.choicesLayout}><CharacterToggle value={value.character} onChange={character=>onChange(selectCharacter(value,character))} label="Choose your starter character" options={[{value:'male',label:'Male'},{value:'female',label:'Female'}]}/></div><p className={styles.saved}>Your character saves automatically. Change your look anytime.</p>{saving&&<button type="button" className={saveStyles.quiet} data-have-save-code onClick={()=>{setRestoreCode(undefined);setSave('restore');}}>I have a save code</button>}</>}
 {current.id==='paths'&&<div className={styles.showcase} aria-hidden="true">{PATH_STOPS.map((stop,i)=><span key={stop.label} className={styles.pathStop}>{i>0&&<span className={styles.pathLink}/>}<span className={styles.item}><span className={styles.stop} style={{background:stop.ink,boxShadow:`0 4px 0 ${stop.edge}`}}><StopGlyph i={i}/></span><small>{stop.label}</small></span></span>)}</div>}
 {current.id==='balls'&&<div className={styles.showcase} aria-hidden="true">
  <span className={styles.item}><span className={styles.art}><HuntBallArt size={52}/></span><small>Find</small></span>
  <span className={styles.arrow}><Icon name="arrow" size={24}/></span>
  <span className={styles.item}><span className={styles.art}><TipBookArt size={54}/></span><small>Learn a tip</small></span>
  <span className={styles.arrow}><Icon name="arrow" size={24}/></span>
  <span className={styles.item}><span className={styles.art}><CostumeHoodArt size={52}/></span><small>Costumes</small></span>
 </div>}
 {current.id==='earn'&&<div className={styles.showcase} aria-hidden="true">
  <span className={styles.item}><span className={styles.art}><FishArt fish={sardine} size={64}/></span><small>Fish</small></span>
  <span className={styles.item}><span className={styles.art}><FruitArt size={48} color={orange?.color}/></span><small>Fruit</small></span>
  <span className={styles.item}><span className={styles.art}><JobsArt size={52}/></span><small>Jobs</small></span>
  <span className={styles.arrow}><Icon name="arrow" size={24}/></span>
  <span className={styles.item}><span className={styles.art}><span className={`${jobs.coin} ${styles.coin}`}/></span><small>Coins</small></span>
 </div>}
 {current.id==='learn'&&<div className={styles.showcase} aria-hidden="true">
  <span className={styles.item}><span className={styles.art}><MiniCard name="Marta" number={cardNumber('Marta')} era="allTime" got thumb className={styles.card3d}/></span><small>Cards</small></span>
  <span className={styles.item}><span className={styles.art}><VendingProductArt id="display:plaza:book" kind="display"/></span><small>Books</small></span>
  <span className={styles.item}><span className={styles.art}><VendingProductArt id="pack:3" kind="pack"/></span><small>Packs</small></span>
  <span className={styles.item}><span className={`${styles.art} ${styles.ballArt}`}>{gearBall?<StorePreview item={gearBall} src={gear[GEAR_BALL]}/>:<VendingProductArt id={GEAR_BALL} kind="ball"/>}</span><small>Gear</small></span>
 </div>}
 {current.note&&<div className={styles.note}><Icon name={current.id==='learn'?'book':current.id==='paths'?'flag':current.id==='balls'?'star':'target'} size={28}/><span>{current.note}</span></div>}
 </div>}</div>
 <footer className={styles.footer}>{saveLocked?<span aria-hidden="true"/>:save?<BackButton key={`back-${save}`} onBack={()=>leaveSave(false)}/>:step>0?<BackButton key={step} onBack={()=>setStep(n=>n-1)}/>:<BackButton key="back-first" disabled onBack={()=>{}}/>}<div className={styles.progress} role="status" aria-label={`Welcome step ${step+1} of ${steps.length}`}>{steps.map((s,i)=><span key={s.id} className={i===step?styles.current:undefined} aria-hidden="true"/>)}</div>{save==='restore'&&(saveStage==='enter'||saveStage==='loading')?<button type="submit" form="save-restore-form" className={saveStyles.primary} data-load-island disabled={!restoreReady.ready||restoreReady.busy}>Load my island</button>
  :save==='restore'||noCodeYet?<span aria-hidden="true"/>:<NavigationButton key={`next-${step}-${save??''}`} label={last?'Explore':'Next'} onNavigate={next}/>}</footer>
 </section>
 </dialog>;
}
/** Path-stop glyphs, drawn like the stops on the Paths map (QuestLearningPath StopIcon): play, tick, star. */
function StopGlyph({i}:{i:number}){return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#244d40" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{i===0?<path d="m9 5 10 7-10 7z" fill="#244d40"/>:i===1?<path d="m5 12 4 4L19 6"/>:<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" fill="#fff4dc"/>}</svg>;}
