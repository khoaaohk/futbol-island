'use client';
/**
 * Island jobs HUD (docs/island-jobs.md): job-sign offers, the running job's goal, the payday card, the coin balance,
 * Community Garden picking notes (produce is sold at the fishing agent's MarketStand, components/MarketStand.tsx). The 3D side lives in lib/town/jobs/jobScene.ts.
 * No timers while idle; the only timeouts are short-lived toasts.
 */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {useVending} from '@/lib/town/vendingWallet';
import {getJobRuntime,subscribeJobRuntime,emptyJobView,type JobView} from '@/lib/town/jobs/jobScene';
import {jobById} from '@/lib/town/jobs/jobCatalog';
import {islandJobWallet,islandMarket} from '@/lib/town/jobs/islandWallet';
import {readJobLedger,FIRST_JOB_BONUS,type JobId} from '@/lib/town/jobs/jobEconomy';
import {goodById} from '@/lib/town/market/goods';
import {basketCount,BASKET_LIMIT} from '@/lib/town/market/market';
import type {JobPayResult} from '@/lib/town/jobs/jobWallet';
import {DAILY_PLAY_COINS} from '@/lib/town/dailyPlay';
import {LEARN_COINS_EARNED,learnToastTitle,type LearnCoinsEarned} from '@/lib/town/learnCoins';
import FishArt from './FishArt';
import {FruitArt} from './PocketArt';
import {FISH} from '@/lib/town/fishing/fishCatalog';
import styles from './IslandJobs.module.css';
/** Same fish + fruit art as the onboarding "Earn coins" step. */
const POCKET_FISH=FISH.find(f=>f.id==='sardine')??FISH[0];

const subscribeView=(fn:()=>void)=>{let off=getJobRuntime()?.subscribe(fn);const unreg=subscribeJobRuntime(()=>{off?.();off=getJobRuntime()?.subscribe(fn);fn();});return()=>{off?.();unreg();};};
const readView=()=>getJobRuntime()?.getView()??emptyJobView();
const useJobView=():JobView=>useSyncExternalStore(subscribeView,readView,emptyJobView);
// Primitive snapshots stay stable while idle and still update when fish replace produce.
function useBasket(kind:'fish'|'produce'){return useSyncExternalStore(islandMarket.subscribe,()=>Object.entries(islandMarket.read().basket).reduce((n,[id,count])=>n+(goodById(id)?.kind===kind?count:0),0),()=>0);}
const time=(s:number)=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
const seenGoods=new Set<string>();

export default function IslandJobs({blocked,onRequestWalk,onOpenBalances}:{blocked:boolean;onRequestWalk:()=>void;onOpenBalances:()=>void}){
 const view=useJobView(),wallet=useVending(),fish=useBasket('fish'),fruit=useBasket('produce');
 const [intro,setIntro]=useState<JobId|null>(null),[payday,setPayday]=useState<{id:JobId;seconds:number;pay:JobPayResult|null;best?:number}|null>(null);
 const [toast,setToast]=useState<{title:string;detail:string}|null>(null);
 const startButton=useRef<HTMLButtonElement>(null),paidNonce=useRef(0);
 // One-time welcome coins (idempotent: ledger flag + fixed wallet run id).
 useEffect(()=>{let live=true;void islandJobWallet.grantStarter().then(n=>{if(live&&n>0)setToast({title:`Welcome! +${n} coins`,detail:'Spend them in the arcade, or earn more at the island job signs.'});});return()=>{live=false;};},[]);
 // The toast's short timer starts once the HUD is visible again, so a coin toast earned inside a lesson is still seen after it.
 useEffect(()=>{if(!toast||blocked)return;const t=setTimeout(()=>setToast(null),5200);return()=>clearTimeout(t);},[toast,blocked]);
 useEffect(()=>{const earned=(event:Event)=>{const amount=(event as CustomEvent<{amount:number}>).detail?.amount;if(amount===DAILY_PLAY_COINS)setToast({title:`+${DAILY_PLAY_COINS} daily play coins`,detail:`You explored and played today. Come back tomorrow for another ${DAILY_PLAY_COINS}.`});};window.addEventListener('fi2-daily-play-earned',earned);return()=>window.removeEventListener('fi2-daily-play-earned',earned);},[]);
 // Learning coins (lib/town/learnCoins.ts): "+12 coins · You passed ‘…’". Learning always pays in full.
 useEffect(()=>{const earned=(event:Event)=>{const d=(event as CustomEvent<LearnCoinsEarned>).detail;if(d&&d.amount>0)setToast({title:learnToastTitle(d.amount,d.reason),detail:'Learning always pays in full. Spend coins at any vending machine.'});};window.addEventListener(LEARN_COINS_EARNED,earned);return()=>window.removeEventListener(LEARN_COINS_EARNED,earned);},[]);
 // Payday: pay once per finished shift.
 useEffect(()=>{const done=view.done;if(!done||done.nonce===paidNonce.current)return;paidNonce.current=done.nonce;const def=jobById(done.id);if(!def)return;
  const best=readJobLedger().best[def.id];setPayday({id:def.id,seconds:done.seconds,pay:null,best});
  void islandJobWallet.payJob(def.id,def.title,done.seconds).then(pay=>{setPayday(p=>p&&p.id===def.id?{...p,pay}:p);try{document.dispatchEvent(new CustomEvent('fi2-story-cue',{detail:'finish'}));}catch{}});},[view.done]);
 // Garden pick notes: the first pick of each produce this session teaches its lesson.
 useEffect(()=>{const pick=view.pick;if(!pick)return;const g=goodById(pick.good);if(!g)return;const first=!seenGoods.has(g.id);seenGoods.add(g.id);
  setToast({title:`+1 ${g.name} · basket ${basketCount(islandMarket.read())}/${BASKET_LIMIT}`,detail:first?g.lesson:'Sell produce to Rosa at the farmers market stand (Citrus & Fruit).'});},[view.pick]);
 // G opens the nearby job (J is Juggle), Escape closes cards.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('input,textarea,select,[contenteditable=true]'))return;
  if(e.key==='Escape')setIntro(null);
  if((e.key==='g'||e.key==='G')&&!blocked&&view.near&&!intro){e.preventDefault();setIntro(view.near as JobId);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[blocked,view.near,intro]);
 useEffect(()=>{if(intro)startButton.current?.focus();},[intro]);
 // Assistant-referee replays use a fixed camera: hide the minimap and ride buttons so every player stays visible.
 const jobCamera=!!view.active&&view.active.id==='offside-flag'&&view.active.phase!=='work';
 useEffect(()=>{const app=document.querySelector('.town-app');if(!app)return;app.toggleAttribute('data-job-camera',jobCamera);return()=>app.removeAttribute('data-job-camera');},[jobCamera]);
 if(blocked)return null;
 const runtime=getJobRuntime(),active=view.active?jobById(view.active.id):null,offer=view.near?jobById(view.near):null,introJob=intro?jobById(intro):null;
 const start=(id:JobId)=>{onRequestWalk();runtime?.start(id);setIntro(null);setPayday(null);};
 const preview=introJob?islandJobWallet.preview(introJob.id):null;
 const phaseText=()=>{if(!active||!view.active)return '';const a=view.active;if(a.hint)return a.hint;
  if(a.phase==='deliver')return `Bag full! Take it to the ${active.deliver?.label} by the sign.`;
  if(active.kind==='rebound')return a.phase==='shots'?`Now Shoot passes into the painted target square (${a.value}/${a.total}).`:'Stand in the box, face the wall and press Juggle.';
  if(active.kind==='carry')return a.carrying?`Bring the ball back to the ${active.deliver?.label}.`:'Run to the loose ball — follow the arrow.';
  return active.howTo;};
 return <>
  <button type="button" className={styles.wallet} onClick={onOpenBalances} aria-label={`Your island pocket: ${wallet.balance} coins, ${fish} fish, ${fruit} fruit and vegetables`} aria-haspopup="dialog" data-job-wallet><span className={styles.coin} aria-hidden="true"/><b>{wallet.balance}</b><small>coins</small><em className={styles.basketCount} aria-label={`${fish} fish in basket`} title="Fish in basket"><FishArt fish={POCKET_FISH} size={24}/><span>{fish}</span></em><em className={styles.basketCount} aria-label={`${fruit} fruit and vegetables in basket`} title="Fruit and vegetables in basket"><FruitArt size={19}/><span>{fruit}</span></em></button>
  {offer&&!active&&!introJob&&!payday&&<button type="button" className={styles.offer} data-job-offer={offer.id} aria-keyshortcuts="G" title="Open job (G)" onClick={()=>setIntro(offer.id)}><small>Island job · {offer.role}</small>{offer.title}<span aria-hidden="true">Go</span></button>}
  {introJob&&preview&&<section className={styles.card} role="dialog" aria-modal="false" aria-labelledby="job-intro-title" data-job-intro={introJob.id}>
   <p className={styles.eyebrow}>{introJob.role} · {introJob.place}</p>
   <h2 id="job-intro-title">{introJob.title}</h2>
   <p>{introJob.intro}</p>
   <p className={styles.pay}><span className={styles.coin} aria-hidden="true"/>Pays {preview.coins} coins{preview.bonus?` (includes a +${FIRST_JOB_BONUS} first-time bonus)`:''}{preview.tier==='half'?' · half pay for today\'s extra shifts':preview.tier==='tip'?' · a thank-you tip today — full pay again tomorrow':''}</p>
   <div className={styles.actions}><button type="button" ref={startButton} className={styles.primary} onClick={()=>start(introJob.id)}>Start job</button><button type="button" className={styles.secondary} onClick={()=>setIntro(null)}>Not now</button></div>
  </section>}
  {active&&view.active&&<section className={styles.hud} aria-live="polite" data-job-active={active.id} data-job-phase={view.active.phase}>
   <div><small>{active.role}</small><b>{active.title}</b></div>
   <strong>{view.active.phase==='deliver'?'Empty the bag':active.kind==='rebound'&&view.active.phase==='shots'?'Target passes':active.unit} <em key={view.active.value} className={view.active.value>0?styles.tick:undefined} data-job-count={view.active.value}>{view.active.phase==='deliver'?`${view.active.total}/${view.active.total}`:`${view.active.value}/${view.active.total}`}</em></strong>
   <p data-job-hint>{phaseText()}</p>
   {view.active.gauge&&(()=>{const g=view.active.gauge,max=1.4,pct=(v:number)=>`${Math.min(100,v/max*100)}%`;return <div className={styles.gauge} role="meter" aria-label="Ball pressure in atmospheres" aria-valuemin={0} aria-valuemax={max} aria-valuenow={g.value} data-job-gauge={g.value}>
    <span className={styles.zone} style={{left:pct(g.min),width:`calc(${pct(g.max)} - ${pct(g.min)})`}}/><i style={{left:pct(g.value)}}/><small>{g.value.toFixed(2)} atm · green zone {g.min}–{g.max}</small></div>;})()}
   {view.active.actions.length>0&&<div className={styles.taskActions}>{view.active.actions.map(a=><button key={a.id} type="button" data-job-action={a.id} className={a.primary?styles.primary:styles.secondary} onClick={()=>runtime?.act(a.id)}>{a.label}</button>)}</div>}
   <button type="button" className={styles.stop} onClick={()=>runtime?.quit()}>Stop job</button>
  </section>}
  {payday&&(()=>{const def=jobById(payday.id)!,pay=payday.pay,newBest=!payday.best||payday.seconds<payday.best;return <section className={styles.card} role="dialog" aria-modal="false" aria-labelledby="job-done-title" data-job-done={def.id}>
   <p className={styles.eyebrow}>Job done · {def.role}</p>
   <h2 id="job-done-title">{def.title}</h2>
   <div className={styles.payout} aria-live="polite">{[0,1,2,3,4].map(i=><span key={i} className={styles.burst} style={{'--i':i} as React.CSSProperties} aria-hidden="true"/>)}<b>+{pay?pay.credited||pay.coins:'…'}</b><small>coins{pay?` · balance ${pay.balance}`:''}</small></div>
   <p className={styles.lesson}><b>Football lesson</b>{def.lesson}</p>
   {pay&&<p className={styles.note}>{pay.bonus?`Includes a +${pay.bonus} first-time bonus. `:''}{pay.message}{pay.credited&&pay.credited<pay.coins?' Your Training meter is full for today, so extra jobs pay less. Lessons and hidden balls still pay in full.':''}</p>}
   <p className={styles.note}>Your time {time(payday.seconds)}{newBest?' · personal best!':` · best ${time(payday.best!)}`}</p>
   <div className={styles.actions}><button type="button" className={styles.primary} autoFocus onClick={()=>{setPayday(null);runtime?.dismissDone();}}>Nice!</button><button type="button" className={styles.secondary} onClick={()=>start(def.id)}>Work again</button></div>
  </section>;})()}
  {(view.garden||toast)&&!introJob&&!payday&&<button type="button" className={styles.toast} role="status" onClick={()=>setToast(null)}>{toast?<><b>{toast.title}</b><span>{toast.detail}</span></>:<span>{view.garden}</span>}</button>}
 </>;
}
