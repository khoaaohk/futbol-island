'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {DoneButton} from './DoneButton';
import {useVending} from '@/lib/town/vendingWallet';
import {islandMarket} from '@/lib/town/jobs/islandWallet';
import {emptyMarket} from '@/lib/town/market/market';
import {pocketView,type PocketGroup} from '@/lib/town/market/pocket';
import {fishById} from '@/lib/town/fishing/fishCatalog';
import FishArt from './FishArt';
import ProduceArt from './ProduceArt';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {DAILY_PLAY_COINS,DAILY_PLAY_SECONDS,localPlayDay} from '@/lib/town/dailyPlay';
import {TRAINING_HALF_COINS,trainingMeterView} from '@/lib/town/dailyMeter';
import shell from './ModalShell.module.css';
import market from './MarketStand.module.css';
import styles from './IslandBalanceDrawer.module.css';
import slide from './DrawerSlide.module.css';
import {DRAWER_SLIDE_OUT_MS,showDrawer} from './drawerSlide';
import {useFuel,eatFuel,fuelStore} from '@/lib/town/fuelStore';
import {FUEL_COPY,FUEL_MAX,FUEL_RATE,FUEL_LABEL,produceFuel,worthEating,type FuelMode} from '@/lib/town/fuel';
import {FuelIcon} from './FuelCount';
const SERVER_MARKET=emptyMarket();
function BalanceIcon({kind}:{kind:'coins'|'fish'|'fruit'}){
 return <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
 {kind==='coins'?<><circle cx="32" cy="34" r="24" fill="#c28a29"/><circle cx="32" cy="29" r="23" fill="#f4c74e" stroke="#ad7c27" strokeWidth="3"/><circle cx="32" cy="29" r="16" fill="none" stroke="#fff0ac" strokeWidth="3"/><path d="m32 17 3.5 7.5 8 1-6 5.8 1.5 8-7-4-7 4 1.5-8-6-5.8 8-1Z" fill="#fff0ac"/></>:kind==='fish'?<><path d="M15 32 4 20v24l11-12c12-21 32-19 46 0-14 19-34 21-46 0Z" fill="#66a9b5" stroke="#285a58" strokeWidth="3"/><path d="m31 18 8-8 6 13M32 45l8 9 5-12" fill="#a8d4d4" stroke="#285a58" strokeWidth="2"/><circle cx="48" cy="29" r="3" fill="#244d40"/><path d="M25 23q-5 9 0 18" fill="none" stroke="#d0ebe0" strokeWidth="3"/></>:<><path d="M32 22C8 8 1 35 15 52c7 9 12 0 17 3 7 4 13 0 18-8 13-23-2-35-18-25Z" fill="#efa865" stroke="#38604b" strokeWidth="3"/><path d="M32 23V9m0 8c0-13 12-15 19-11-3 11-9 15-19 11Z" fill="#80a56b" stroke="#38604b" strokeWidth="3"/><path d="M16 28q-4 6-1 12" fill="none" stroke="#ffe2a7" strokeWidth="4" strokeLinecap="round"/></>}
 </svg>;
}
export default function IslandBalanceDrawer({onClose}:{onClose:()=>void}){
 const wallet=useVending(),coins=useArcadeWallet(),basket=useSyncExternalStore(islandMarket.subscribe,islandMarket.read,()=>SERVER_MARKET);
 // The basket view (lib/town/market/pocket.ts): every good from the registry, grouped Fish / Fruit / Veggies, counts = the HUD's.
 const pocket=pocketView(basket),produce=pocket.fruit.count+pocket.veg.count;
 const dialog=useRef<HTMLDialogElement>(null),done=useRef<HTMLButtonElement>(null),timer=useRef<ReturnType<typeof setTimeout>>(),closing=useRef(false);
 const [leaving,setLeaving]=useState(false);
 // Fuel (docs/economy/FUEL_2026-09-30.md): eat fruit or veg from the basket. Free garden picks (
 // map) are the zero-coin ways to refuel.
 const fuel=useFuel(),[ate,setAte]=useState('');
 const edible=[...pocket.fruit.rows,...pocket.veg.rows].map(r=>({...r,fuel:produceFuel(r.id,'produce',r.category==='fish'?undefined:r.category)})).filter(r=>r.fuel>0);
 // The real (unrounded) tank decides, not the bar's whole number (bug A4: at 99.6 the bar said 99 and an orange went for +0).
 const eat=(r:typeof edible[number])=>{if(!worthEating(fuelStore.read().fuel,r.fuel)){setAte('Your tank is full. Save it for later, or sell it at the stand.');return;}
  if(!islandMarket.take(r.id,1))return;const got=eatFuel(r.fuel);setAte(`Yum, ${r.good.name.toLowerCase()}! +${got} fuel. ${r.good.lesson}`);};
 const levelText=fuel.level==='empty'?'Empty: walking still works':fuel.level==='low'?'Running low':fuel.level==='full'?'Full tank':'Good to go';
 const order:FuelMode[]=['jetpack','moped','bike','scooter','sprint','walk'];
 useEffect(()=>{closing.current=false;setLeaving(false);islandMarket.refresh();if(dialog.current)showDrawer(dialog.current,done.current);
  // Same drawer and slide as the NPC conversation (DrawerSlide.module.css + showDrawer): no focus scroll, fresh enter on every open.
  return()=>{if(timer.current)clearTimeout(timer.current);requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>('[data-job-wallet]')?.focus({preventScroll:true}));};},[]);
 const close=()=>{if(closing.current)return;closing.current=true;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setLeaving(true);timer.current=setTimeout(onClose,DRAWER_SLIDE_OUT_MS);};
 // Training meter (lib/town/dailyMeter.ts): read on open from the wallet snapshot; no countdown, no timers.
 const training=trainingMeterView(coins.training.day===localPlayDay(Date.now())?coins.training.earned:0);
 const items=(g:PocketGroup)=><ul className={styles.items} data-pocket-group={g.category}>{g.rows.map(r=>{const fish=r.category==='fish'?fishById(r.id):undefined;return <li key={r.id} data-pocket-item={r.id} data-count={r.count}>
  <span className={styles.itemArt} aria-hidden="true">{fish?<FishArt fish={fish} size={52}/>:<ProduceArt good={r.good} size={38}/>}</span>
  <span className={styles.itemName}><b>{r.name}</b><small>{r.each} coin{r.each===1?'':'s'} each</small></span>
  <b className={styles.itemCount} aria-label={`${r.count} in your basket`}>×{r.count}</b>
  <span className={styles.itemValue} aria-label={`worth ${r.value} coins`}>{r.value}<small>coins</small></span>
 </li>;})}</ul>;
 const worth=(value:number,where:string)=><p className={styles.worth}>{value>0&&<>Worth <b>{value} coins</b> today. </>}{where}</p>;
 const sub=(g:PocketGroup)=>g.rows.length?<div className={styles.sub}><h4>{g.label}<span>{g.count}</span></h4>{items(g)}</div>:null;
 return <dialog ref={dialog} className={`${styles.dialog} ${slide.drawer} ${leaving?`${styles.leaving} ${slide.leaving}`:`${styles.entering} ${slide.entering}`}`} data-island-balances aria-labelledby="island-balances-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
 <section className={`${shell.shell} ${shell.drawer} ${styles.panel} ${slide.panel}`}>
 <header className={`${shell.header} ${styles.header}`}><div><h2 id="island-balances-title">Your island pocket</h2></div><DoneButton ref={done} onDone={close}/></header>
 <div className={`${shell.body} ${styles.body}`}>
 <section className={`${styles.card} ${styles.coins}`} aria-labelledby="pocket-coins"><div className={styles.cardTop}><BalanceIcon kind="coins"/><div><h3 id="pocket-coins">Coins</h3><strong data-pocket-coins>{wallet.balance.toLocaleString()}</strong><span>ready to spend</span></div></div><p>Your island spending money. Use coins for arcade games and vending-machine items, including card packs and books.</p><div className={styles.note}><b>Earn more</b><p>Lessons, hidden balls, stories and finished paths pay coins the first time you complete each one. Play arcade games, help with island jobs, or sell your catch and harvest. Each day, walk, ride or fly around the island for {DAILY_PLAY_SECONDS} seconds for a daily {DAILY_PLAY_COINS}-coin bonus.</p></div><div className={styles.note} data-training-meter={training.tier}><b>Training meter</b><div className={market.meter} role="meter" aria-label="Coins from jobs, arcade games and market sales today" aria-valuemin={0} aria-valuemax={TRAINING_HALF_COINS} aria-valuenow={Math.min(training.paid,TRAINING_HALF_COINS)}><div style={{transform:`scaleX(${training.fill})`}}/></div><p>{training.line}</p></div></section>
<section className={`${styles.card} ${styles.fuelCard}`} aria-labelledby="pocket-fuel" data-pocket-fuel-section data-fuel-level={fuel.level}><div className={styles.cardTop}><span className={styles.fuelIcon}><FuelIcon size={56} empty={fuel.level==='empty'}/></span><div><h3 id="pocket-fuel">Fuel</h3><strong data-pocket-fuel>{fuel.fuel}<small> / {FUEL_MAX}</small></strong><span>{levelText}</span></div></div>
 <div className={market.meter} role="meter" aria-label="Fuel" aria-valuemin={0} aria-valuemax={FUEL_MAX} aria-valuenow={fuel.fuel} aria-valuetext={`${fuel.fuel} of ${FUEL_MAX}, ${levelText}`} data-fuel-meter><div className={styles.fuelFill} style={{transform:`scaleX(${fuel.fuel/FUEL_MAX})`}}/></div>
 <p>{FUEL_COPY.what}</p>
 <div className={styles.note}><b>What uses fuel</b><ul className={styles.fuelCosts}>{order.map(m=><li key={m} data-fuel-cost={m}><span>{FUEL_LABEL[m]}</span><span className={styles.fuelDots} aria-label={m==='walk'?'almost none':`about ${Math.max(1,Math.round(FUEL_RATE[m]*60))} per minute`}>{m==='walk'?'○ always works':'●'.repeat(Math.max(1,Math.round(FUEL_RATE[m]/FUEL_RATE.jetpack*5)))/* relative to flying (5 dots), so any rate change keeps the order readable */}</span></li>)}</ul><p>{FUEL_COPY.cost}</p></div>
 <div className={styles.note}><b>Refuel</b><p>{FUEL_COPY.where}</p>{edible.length>0?<ul className={styles.items} data-fuel-eat-list>{edible.map(r=><li key={r.id} data-fuel-eat={r.id}><span className={styles.itemArt} aria-hidden="true"><ProduceArt good={r.good} size={34}/></span><span className={styles.itemName}><b>{r.name}</b><small>+{r.fuel} fuel each · ×{r.count}</small></span><button type="button" className={market.one} onClick={()=>eat(r)} aria-label={`Eat one ${r.good.name}, plus ${r.fuel} fuel`}>Eat</button></li>)}</ul>:<p className={styles.empty}>Pick fruit in the Community Garden: it&apos;s free, and you can eat it here.</p>}{ate&&<p role="status" aria-live="polite" data-fuel-ate>{ate}</p>}</div>
 </section>
  <section className={`${styles.card} ${styles.fish}`} aria-labelledby="pocket-fish"><div className={styles.cardTop}><BalanceIcon kind="fish"/><div><h3 id="pocket-fish">Fish</h3><strong data-pocket-fish>{pocket.fish.count}</strong><span>in your basket</span></div></div><p>Catch fish from the shore spots, the East Jetty and the Deep Sea Boat.</p>{pocket.fish.rows.length?items(pocket.fish):<p className={styles.empty}>Your next catch will appear here.</p>}{worth(pocket.fish.value,'Sell fish at Rosa’s market stand, at the farmers market.')}<div className={styles.note}>Your Fishbook remembers the fish you discover, even after you sell them.</div></section>
 <section className={`${styles.card} ${styles.fruit}`} aria-labelledby="pocket-fruit"><div className={styles.cardTop}><BalanceIcon kind="fruit"/><div><h3 id="pocket-fruit">Fruit &amp; veggies</h3><strong data-pocket-fruit>{produce}</strong><span>in your basket</span></div></div><p>Pick ripe produce in the Community Garden, or bring home a share of the Coral Cay Harvest day.</p>{produce?<>{sub(pocket.fruit)}{sub(pocket.veg)}</>:<p className={styles.empty}>A little exploring can fill your basket.</p>}{worth(pocket.fruit.value+pocket.veg.value,'Sell fruit and veggies at Rosa’s market stand or the Coral Cay farm stand.')}</section>
 <p className={styles.capacity}>Basket space <b data-pocket-space>{pocket.total} / {pocket.limit}</b><span>{pocket.full?'Your basket is full! Sell some to make room for more.':'Fish and produce share this space. Sell some to make room for more.'} Snacks, cards and gear live in your Backpack.</span></p>
 </div></section></dialog>;
}
