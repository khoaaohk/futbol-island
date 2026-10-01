'use client';
/**
 * Island jobs HUD (docs/island-jobs.md): job-sign offers, the running job's goal, the payday card, the coin balance,
 * Community Garden picking notes (produce is sold at the fishing agent's MarketStand, components/MarketStand.tsx). The 3D side lives in lib/town/jobs/jobScene.ts.
 * No timers while idle; the only timeouts are short-lived toasts.
 */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {pushToast,toastDuration,type HudToast} from '@/lib/ui/hudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';
import HudSlot from './HudStack';
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
import {creditConceptTick} from '@/lib/learning/reviewStore';
import {conceptForJob} from '@/lib/learning/conceptMap';
import FishArt from './FishArt';
import FuelCount from './FuelCount';
import {useFuel} from '@/lib/town/fuelStore';
import {FruitArt} from './PocketArt';
import {FISH} from '@/lib/town/fishing/fishCatalog';
import {OPEN_MARKET_STAND} from './FishingHost';
import styles from './IslandJobs.module.css';
/** Same fish + fruit art as the onboarding "Earn coins" step. */
const POCKET_FISH=FISH.find(f=>f.id==='sardine')??FISH[0];

const subscribeView=(fn:()=>void)=>{let off=getJobRuntime()?.subscribe(fn);const unreg=subscribeJobRuntime(()=>{off?.();off=getJobRuntime()?.subscribe(fn);fn();});return()=>{off?.();unreg();};};
const readView=()=>getJobRuntime()?.getView()??emptyJobView();
const useJobView=():JobView=>useSyncExternalStore(subscribeView,readView,emptyJobView);
// Primitive snapshots stay stable while idle and still update when fish replace produce.
function useBasket(kind:'fish'|'produce'){return useSyncExternalStore(islandMarket.subscribe,()=>Object.entries(islandMarket.read().basket).reduce((n,[id,count])=>n+(goodById(id)?.kind===kind?count:0),0),()=>0);}
/** Hold actions (rake, paint, pull; Sep 30 2026): press sends `id`, release sends `id:up`, by pointer or by holding Enter/Space.
 *  Keys stop here so a held Space never also kicks the ball. Tap actions keep a plain click. */
function jobActionProps(a:{id:string;hold?:boolean},act:(id:string)=>void){
 if(!a.hold)return {onClick:()=>act(a.id)};
 const key=(e:React.KeyboardEvent)=>e.key===' '||e.key==='Enter';
 return {'data-job-hold':'',style:{touchAction:'none',userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none'} as React.CSSProperties,
  onPointerDown:(e:React.PointerEvent<HTMLButtonElement>)=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}act(a.id);},
  onPointerUp:()=>act(a.id+':up'),onPointerCancel:()=>act(a.id+':up'),onContextMenu:(e:React.MouseEvent)=>e.preventDefault(),
  onKeyDown:(e:React.KeyboardEvent)=>{if(!key(e))return;e.preventDefault();e.stopPropagation();if(!e.repeat)act(a.id);},
  onKeyUp:(e:React.KeyboardEvent)=>{if(!key(e))return;e.preventDefault();e.stopPropagation();act(a.id+':up');}};
}
/** Job panel auto-hide (Oct 1 2026): full panel dwell (longer for a long hint, up to 9 s) and the fade to the chip. */
const PANEL_DWELL_MS=3500,PANEL_FADE_MS=300;
const time=(s:number)=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
const seenGoods=new Set<string>();
/** Bug A2: another job can't start while one runs. Merged, so pressing G again never stacks notes. */
const BUSY_NOTE:HudToast={title:'Finish or stop your current job first',detail:'One island job at a time: finish this one, or tap Stop job, then come back to this sign.',merge:'job-busy',retitle:()=>'Finish or stop your current job first'};

/** `holdToasts`: the HUD is covered (a dialog, the fishing session): notes wait, their timer paused. `offerAllowed`: the HUD stack
 *  arbiter (lib/ui/hudStack.ts) gave the focus slot to the job sign (a nearer Talk / Enter wins it otherwise). */
export default function IslandJobs({blocked,holdToasts=false,offerAllowed=true,onCardChange,onRequestWalk,onOpenBalances}:{blocked:boolean;holdToasts?:boolean;offerAllowed?:boolean;/** a job card (Start job / Job done) is open: it holds the stack's task slot */onCardChange?:(open:boolean)=>void;onRequestWalk:()=>void;onOpenBalances:()=>void}){
 const view=useJobView(),wallet=useVending(),fish=useBasket('fish'),fruit=useBasket('produce');
 const fuel=useFuel(); // fuel counter in the coins bar (docs/economy/FUEL_2026-09-30.md)
 const [intro,setIntro]=useState<JobId|null>(null),[payday,setPayday]=useState<{id:JobId;seconds:number;pay:JobPayResult|null;best?:number}|null>(null);
 // Notes (docs/ui/HUD_STACK.md): one on screen, a short queue behind it, rapid garden picks of one crop merged ("+3 Strawberry").
 // They sit in the stack's toast slot, below the task and the focus action, so a note never covers a button.
 const [toasts,setToastQueue]=useState<HudToast[]>([]),toast=toasts[0]??null;
 // Landscape phones clamp the job hint to two lines (IslandJobs.module.css, bug A1); a tap opens it. Closed again for each job.
 const [hintOpen,setHintOpen]=useState(false);useEffect(()=>setHintOpen(false),[view.active?.id]);
 // Oct 1 2026 (user): the running-job panel shows for a few seconds, then fades to a small chip ("Ball kid · 1/5" + Stop). Any
 // progress, phase or hint change shows it again briefly. It stays open while a meter or the panel's own buttons are in use, while
 // an offside replay is explained, and while a sorting clue is in the hands. Tap the chip to open it. Reduced motion: no fade.
 const [panel,setPanel]=useState<'full'|'fading'|'chip'>('full'),[peek,setPeek]=useState(0);
 const act0=view.active,holdOpen=!!act0&&(!!act0.gauge||act0.actions.length>0&&!act0.buttons||act0.phase==='explain'||act0.carrying&&jobById(act0.id)?.kind==='sort');
 const panelKey=act0?`${act0.id}|${act0.value}|${act0.phase}|${act0.carrying}|${act0.hint}`:'';
 useEffect(()=>{if(!panelKey)return;setPanel('full');if(holdOpen)return;
  const reduced=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const dwell=Math.min(9000,Math.max(PANEL_DWELL_MS,(act0?.hint.length??0)*45));let t2:ReturnType<typeof setTimeout>|undefined;
  const t=setTimeout(()=>{if(reduced){setPanel('chip');return;}setPanel('fading');t2=setTimeout(()=>setPanel('chip'),PANEL_FADE_MS);},dwell);
  return()=>{clearTimeout(t);if(t2)clearTimeout(t2);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[panelKey,holdOpen,peek]);
 const setToast=(next:HudToast|null)=>setToastQueue(q=>next?pushToast(q,next):q.slice(1));
 const busyNote=()=>setToast(BUSY_NOTE);
 // Notes also wait (timer paused) while a job card is open: the card holds the child's attention and the stack's top.
 const laneBusy=useToastLaneBusy('jobs'),toastHeld=blocked||holdToasts||laneBusy||!!intro||!!payday;
 // The shared toast lane: while one of ours shows, the costume / ride unlock notes wait (and the other way round).
 useEffect(()=>{if(toast&&!toastHeld)toastLane.request('jobs');else toastLane.release('jobs');},[toast,toastHeld]);
 useEffect(()=>()=>toastLane.release('jobs'),[]);
 const startButton=useRef<HTMLButtonElement>(null),paidNonce=useRef(0);
 // One-time welcome coins (idempotent: ledger flag + fixed wallet run id).
 useEffect(()=>{let live=true;void islandJobWallet.grantStarter().then(n=>{if(live&&n>0)setToast({title:`Welcome! +${n} coins`,detail:'Spend them in the arcade, or earn more at the island job signs.'});});return()=>{live=false;};},[]);
 // The toast's short timer starts once the HUD is visible again, so a coin toast earned inside a lesson is still seen after it.
 useEffect(()=>{if(!toast||toastHeld)return;const t=setTimeout(()=>setToast(null),toastDuration(toasts.length-1));return()=>clearTimeout(t);},[toast,toastHeld,toasts.length]);
 useEffect(()=>{const earned=(event:Event)=>{const amount=(event as CustomEvent<{amount:number}>).detail?.amount;if(amount===DAILY_PLAY_COINS)setToast({title:`+${DAILY_PLAY_COINS} daily play coins`,detail:`You explored and played today. Come back tomorrow for another ${DAILY_PLAY_COINS}.`});};window.addEventListener('fi2-daily-play-earned',earned);return()=>window.removeEventListener('fi2-daily-play-earned',earned);},[]);
 // Learning coins (lib/town/learnCoins.ts): "+12 coins · You passed ‘…’". Learning always pays in full.
 useEffect(()=>{const earned=(event:Event)=>{const d=(event as CustomEvent<LearnCoinsEarned>).detail;if(d&&d.amount>0)setToast({title:learnToastTitle(d.amount,d.reason),detail:'Learning pays in full · spend at any vending machine'});};window.addEventListener(LEARN_COINS_EARNED,earned);return()=>window.removeEventListener(LEARN_COINS_EARNED,earned);},[]);
 // Payday: pay once per finished shift.
 useEffect(()=>{const done=view.done;if(!done||done.nonce===paidNonce.current)return;paidNonce.current=done.nonce;const def=jobById(done.id);if(!def)return;
  const best=readJobLedger(Date.now(),true).best[def.id];// fresh: another tab may have finished a shift
  setPayday({id:def.id,seconds:done.seconds,pay:null,best});
  creditConceptTick(conceptForJob(def.id),`job:${def.id}`); // Lane 3: a job whose lesson maps to a Paths lesson ticks it (evidence only)
  void islandJobWallet.payJob(def.id,def.title,done.seconds,done.bag).then(pay=>{setPayday(p=>p&&p.id===def.id?{...p,pay}:p);try{document.dispatchEvent(new CustomEvent('fi2-story-cue',{detail:'finish'}));}catch{}});},[view.done]);
 // Garden pick notes: the first pick of each produce this session teaches its lesson.
 useEffect(()=>{const pick=view.pick;if(!pick)return;const g=goodById(pick.good);if(!g)return;const first=!seenGoods.has(g.id);seenGoods.add(g.id);
  const basket=basketCount(islandMarket.read()),retitle=(n:number)=>`+${n} ${g.name} · basket ${basket}/${BASKET_LIMIT}`;
  setToast({title:retitle(1),retitle,merge:`pick:${g.id}`,detail:first?g.lesson:'Sell produce to Rosa at the farmers market stand (Citrus & Fruit).'});},[view.pick]);
 // G opens the nearby job (J is Juggle), Escape closes cards. One job at a time (bug A2): G at another sign while a job runs
 // explains instead of opening (and swapping) it.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('input,textarea,select,[contenteditable=true]'))return;
  if(e.key==='Escape')setIntro(null);
  if((e.key==='g'||e.key==='G')&&!blocked&&!intro){if(view.active){if(view.other){e.preventDefault();busyNote();}return;}
   if(view.near){e.preventDefault();setIntro(view.near as JobId);}}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[blocked,view.near,view.other,view.active,intro]);
 useEffect(()=>{if(intro)startButton.current?.focus();},[intro]);
 useEffect(()=>{onCardChange?.(!!intro||!!payday);},[intro,payday,onCardChange]);
 // Assistant-referee replays use a fixed camera: hide the minimap and ride buttons so every player stays visible.
 const jobCamera=!!view.active&&view.active.id==='offside-flag'&&view.active.phase!=='work';
 useEffect(()=>{const app=document.querySelector('.town-app');if(!app)return;app.toggleAttribute('data-job-camera',jobCamera);return()=>app.removeAttribute('data-job-camera');},[jobCamera]);
 if(blocked)return null;
 const runtime=getJobRuntime(),active=view.active?jobById(view.active.id):null,offer=view.near?jobById(view.near):null,introJob=intro?jobById(intro):null;
 const start=(id:JobId)=>{if(view.active&&runtime?.run){busyNote();setIntro(null);return;}onRequestWalk();if(runtime&&!runtime.start(id)){busyNote();setIntro(null);return;}setIntro(null);setPayday(null);};
 const preview=introJob?islandJobWallet.preview(introJob.id):null;
 const phaseText=()=>{if(!active||!view.active)return '';const a=view.active;if(a.hint)return a.hint;
  if(a.phase==='deliver')return active.kind==='garden'?`Basket full! Tip it into the ${active.deliver?.label} by the gate.`:`Bag full! Take it to the ${active.deliver?.label} by the sign.`;
  if(active.kind==='rebound')return a.phase==='shots'?`Shoot from the glowing circle into the painted target square (${a.value}/${a.total}).`:'Face the wall and press Juggle.';
  if(active.kind==='carry')return a.carrying?`Carry the ball to the ${active.deliver?.label} (follow the arrow).`:'Run to the loose ball (follow the arrow).';
  return active.howTo;};
 return <>
  <button type="button" className={styles.wallet} onClick={onOpenBalances} aria-label={`Your island pocket: ${wallet.balance} coins, ${fish} fish, ${fruit} fruit and vegetables, fuel ${fuel.fuel} of 100${fuel.level==='low'||fuel.level==='empty'?` (${fuel.level})`:''}`} aria-haspopup="dialog" data-job-wallet><span className={styles.coin} aria-hidden="true"/><b>{wallet.balance}</b><small>coins</small><em className={styles.basketCount} aria-label={`${fish} fish in basket`} title="Fish in basket"><FishArt fish={POCKET_FISH} size={24}/><span>{fish}</span></em><em className={styles.basketCount} aria-label={`${fruit} fruit and vegetables in basket`} title="Fruit and vegetables in basket"><FruitArt size={19}/><span>{fruit}</span></em><FuelCount className={styles.basketCount}/></button>
  {view.stand&&offerAllowed&&!offer&&!active&&!introJob&&!payday&&<HudSlot><button type="button" className={styles.offer} data-hud-slot="focus" data-farm-stand-sell onClick={()=>window.dispatchEvent(new CustomEvent(OPEN_MARKET_STAND,{detail:{tab:'produce',place:'farm'}}))}><small>Coral Cay Farm Stand</small>Sell fruit &amp; veg<span aria-hidden="true">Sell</span></button></HudSlot>}
  {offer&&offerAllowed&&!active&&!introJob&&!payday&&<HudSlot><button type="button" className={styles.offer} data-hud-slot="focus" data-job-offer={offer.id} aria-keyshortcuts="G" title="Open job (G)" onClick={()=>setIntro(offer.id)}><small>Island job · {offer.role}</small>{offer.title}<span aria-hidden="true">Go</span></button></HudSlot>}
  {/* Job cards (the offer's Start job / Not now, and the payday card) hang in the stack's task slot, right under the coins bar:
      the child is choosing to act here, so they rank with the job panel, above Talk prompts and hints (docs/ui/HUD_STACK.md). */}
  {introJob&&preview&&<HudSlot><section className={styles.card} role="dialog" aria-modal="false" aria-labelledby="job-intro-title" data-hud-slot="task" data-job-intro={introJob.id}>
   <p className={styles.eyebrow}>{introJob.role} · {introJob.place}</p>
   <h2 id="job-intro-title">{introJob.title}</h2>
   <p>{introJob.intro}</p>
   <p className={styles.pay}><span className={styles.coin} aria-hidden="true"/>Pays {preview.coins} coins{preview.bonus?` (includes a +${FIRST_JOB_BONUS} first-time bonus)`:''}{preview.tier==='half'?' · half pay for today\'s extra shifts':preview.tier==='tip'?' · a thank-you tip today — full pay again tomorrow':''}</p>
   <div className={styles.actions}><button type="button" ref={startButton} className={styles.primary} onClick={()=>start(introJob.id)}>Start job</button><button type="button" className={styles.secondary} onClick={()=>setIntro(null)}>Not now</button></div>
  </section></HudSlot>}
  {active&&view.active&&(()=>{const a=view.active,count=a.phase==='deliver'?`${a.total}/${a.total}`:`${a.value}/${a.total}`,
    unit=a.phase==='deliver'?(active.kind==='garden'?'Drop in the crate':'Empty the bag'):active.kind==='rebound'&&a.phase==='shots'?'Target passes':active.unit,chip=panel==='chip';
   return <HudSlot><section className={styles.hud} data-hud-slot="task" data-job-active={active.id} data-job-phase={a.phase} data-job-panel={panel} data-compact={chip||undefined} aria-label={`${active.title}: ${unit} ${a.value} of ${a.total}`}>
   {/* Progress and the next step are announced even while the panel is a chip. */}
   <span className={styles.srOnly} aria-live="polite">{`${unit} ${count}. ${phaseText()}`}</span>
   {chip?<>
    <button type="button" className={styles.chipMain} aria-expanded={false} aria-label={`Show the job: ${active.title}, ${unit} ${a.value} of ${a.total}`} onClick={()=>setPeek(n=>n+1)}><b>{active.title}</b><em data-job-count={a.value}>{count}</em></button>
    <button type="button" className={styles.chipStop} aria-label="Stop job" title="Stop job" onClick={()=>runtime?.quit()}><span aria-hidden="true">×</span></button>
   </>:<>
    <div className={styles.head} title={`${active.role} · ${unit}`}><b>{active.title}</b><em key={a.value} className={a.value>0?styles.tick:undefined} data-job-count={a.value} aria-hidden="true">{count}</em></div>
    <p data-job-hint data-open={hintOpen||undefined} onClick={()=>setHintOpen(o=>!o)}>{phaseText()}</p>
    {a.gauge&&(()=>{const g=a.gauge,max=1.4,pct=(v:number)=>`${Math.min(100,v/max*100)}%`;return <div className={styles.gauge} role="meter" aria-label={g.label??"Ball pressure in atmospheres"} aria-valuemin={0} aria-valuemax={max} aria-valuenow={g.value} data-job-gauge={g.value}>
     <span className={styles.zone} style={{left:pct(g.min),width:`calc(${pct(g.max)} - ${pct(g.min)})`}}/><i style={{left:pct(g.value)}}/><small>{g.label??`${g.value.toFixed(2)} atm · green zone ${g.min}–${g.max}`}</small></div>;})()}
    {/* A job with its own action cluster (jobMoves.ts jobButtons) acts from the Kick / Juggle / Ride buttons instead (Town.tsx):
        no duplicate controls in the panel. Wall rebounds keeps the ball buttons and has no panel actions. */}
    {a.actions.length>0&&!a.buttons&&<div className={styles.taskActions}>{a.actions.map(x=><button key={x.id} type="button" data-job-action={x.id} className={x.primary?styles.primary:styles.secondary} {...jobActionProps(x,id=>runtime?.act(id))}>{x.label}</button>)}</div>}
    <button type="button" className={styles.stop} onClick={()=>runtime?.quit()}>Stop job</button>
   </>}
  </section></HudSlot>;})()}
  {payday&&(()=>{const def=jobById(payday.id)!,pay=payday.pay,newBest=!payday.best||payday.seconds<payday.best;return <HudSlot><section className={styles.card} role="dialog" aria-modal="false" aria-labelledby="job-done-title" data-hud-slot="task" data-job-done={def.id}>
   <p className={styles.eyebrow}>Job done · {def.role}</p>
   <h2 id="job-done-title">{def.title}</h2>
   <div className={styles.payout} aria-live="polite">{[0,1,2,3,4].map(i=><span key={i} className={styles.burst} style={{'--i':i} as React.CSSProperties} aria-hidden="true"/>)}<b data-job-paid={pay?pay.credited:undefined}>+{pay?pay.credited:'…'}</b><small>coins{pay?` · balance ${pay.balance}`:''}</small></div>
   <p className={styles.lesson}><b>Football lesson</b>{def.lesson}</p>
   {pay&&pay.goods.length>0&&<p className={styles.note} data-job-share>{def.kind==='garden'?'Gardener':'Farmer'}&apos;s share, now in your basket: {pay.goods.map(g=>`${g.count} ${(g.count>1?goodById(g.id)?.plural:goodById(g.id)?.name)??g.id}`).join(', ')}. {def.kind==='garden'?'Sell them at Rosa\u2019s market, or eat them for fuel.':'Sell them at the farm stand or at Rosa\u2019s market.'}{pay.goods.reduce((n,g)=>n+g.count,0)<pay.offered.reduce((n,g)=>n+g.count,0)?` Your basket was full, so the ${def.kind==='garden'?'garden':'farmer'} kept the rest.`:''}</p>}
   {pay&&<p className={styles.note}>{pay.bonus?`Includes a +${pay.bonus} first-time bonus. `:''}{pay.message}{pay.credited<pay.coins?' Your Training meter is full for today, so extra jobs pay less. Lessons and hidden balls still pay in full.':''}</p>}
   <p className={styles.note}>Your time {time(payday.seconds)}{newBest?' · personal best!':` · best ${time(payday.best!)}`}</p>
   <div className={styles.actions}><button type="button" className={styles.primary} autoFocus onClick={()=>{setPayday(null);runtime?.dismissDone();}}>Nice!</button><button type="button" className={styles.secondary} onClick={()=>start(def.id)}>Work again</button></div>
  </section></HudSlot>;})()}
  {/* The garden line rests in the toast slot; a note replaces it while it shows. */}
  {(view.garden||toast&&!toastHeld)&&!introJob&&!payday&&<HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" data-island-toast role="status" aria-live="polite" onClick={()=>setToast(null)}>{toast&&!toastHeld?<><b>{toast.title}</b><span>{toast.detail}</span></>:<span>{view.garden}</span>}</button></HudSlot>}
 </>;
}
