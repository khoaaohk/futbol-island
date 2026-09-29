'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {DoneButton} from './DoneButton';
import {useVending} from '@/lib/town/vendingWallet';
import {islandMarket} from '@/lib/town/jobs/islandWallet';
import {goodById} from '@/lib/town/market/goods';
import {BASKET_LIMIT} from '@/lib/town/market/market';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {DAILY_PLAY_COINS,localPlayDay} from '@/lib/town/dailyPlay';
import {TRAINING_HALF_COINS,trainingMeterView} from '@/lib/town/dailyMeter';
import shell from './ModalShell.module.css';
import market from './MarketStand.module.css';
import styles from './IslandBalanceDrawer.module.css';
import slide from './DrawerSlide.module.css';
import {DRAWER_SLIDE_OUT_MS,showDrawer} from './drawerSlide';
const readBasket=()=>JSON.stringify(islandMarket.read().basket);
function BalanceIcon({kind}:{kind:'coins'|'fish'|'fruit'}){
 return <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
 {kind==='coins'?<><circle cx="32" cy="34" r="24" fill="#c28a29"/><circle cx="32" cy="29" r="23" fill="#f4c74e" stroke="#ad7c27" strokeWidth="3"/><circle cx="32" cy="29" r="16" fill="none" stroke="#fff0ac" strokeWidth="3"/><path d="m32 17 3.5 7.5 8 1-6 5.8 1.5 8-7-4-7 4 1.5-8-6-5.8 8-1Z" fill="#fff0ac"/></>:kind==='fish'?<><path d="M15 32 4 20v24l11-12c12-21 32-19 46 0-14 19-34 21-46 0Z" fill="#66a9b5" stroke="#285a58" strokeWidth="3"/><path d="m31 18 8-8 6 13M32 45l8 9 5-12" fill="#a8d4d4" stroke="#285a58" strokeWidth="2"/><circle cx="48" cy="29" r="3" fill="#244d40"/><path d="M25 23q-5 9 0 18" fill="none" stroke="#d0ebe0" strokeWidth="3"/></>:<><path d="M32 22C8 8 1 35 15 52c7 9 12 0 17 3 7 4 13 0 18-8 13-23-2-35-18-25Z" fill="#efa865" stroke="#38604b" strokeWidth="3"/><path d="M32 23V9m0 8c0-13 12-15 19-11-3 11-9 15-19 11Z" fill="#80a56b" stroke="#38604b" strokeWidth="3"/><path d="M16 28q-4 6-1 12" fill="none" stroke="#ffe2a7" strokeWidth="4" strokeLinecap="round"/></>}
 </svg>;
}
export default function IslandBalanceDrawer({onClose}:{onClose:()=>void}){
 const wallet=useVending(),coins=useArcadeWallet(),basket=JSON.parse(useSyncExternalStore(islandMarket.subscribe,readBasket,()=> '{}')) as Record<string,number>;
 const rows=Object.entries(basket).flatMap(([id,count])=>{const good=goodById(id);return good&&count>0?[{id,count,good}]:[];});
 const fish=rows.filter(r=>r.good.kind==='fish'),fruit=rows.filter(r=>r.good.kind==='produce'),count=(list:typeof rows)=>list.reduce((n,r)=>n+r.count,0);
 const dialog=useRef<HTMLDialogElement>(null),done=useRef<HTMLButtonElement>(null),timer=useRef<ReturnType<typeof setTimeout>>(),closing=useRef(false);
 const [leaving,setLeaving]=useState(false);
 useEffect(()=>{closing.current=false;setLeaving(false);if(dialog.current)showDrawer(dialog.current,done.current);
  // Same drawer and slide as the NPC conversation (DrawerSlide.module.css + showDrawer): no focus scroll, fresh enter on every open.
  return()=>{if(timer.current)clearTimeout(timer.current);requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>('[data-job-wallet]')?.focus({preventScroll:true}));};},[]);
 const close=()=>{if(closing.current)return;closing.current=true;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setLeaving(true);timer.current=setTimeout(onClose,DRAWER_SLIDE_OUT_MS);};
 // Training meter (lib/town/dailyMeter.ts): read on open from the wallet snapshot; no countdown, no timers.
 const training=trainingMeterView(coins.training.day===localPlayDay(Date.now())?coins.training.earned:0);
 const items=(list:typeof rows)=><ul className={styles.items}>{list.map(r=><li key={r.id}><span>{r.good.name}</span><b>×{r.count}</b></li>)}</ul>;
 return <dialog ref={dialog} className={`${styles.dialog} ${slide.drawer} ${leaving?`${styles.leaving} ${slide.leaving}`:`${styles.entering} ${slide.entering}`}`} data-island-balances aria-labelledby="island-balances-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
 <section className={`${shell.shell} ${shell.drawer} ${styles.panel} ${slide.panel}`}>
 <header className={`${shell.header} ${styles.header}`}><div><h2 id="island-balances-title">Your island pocket</h2></div><DoneButton ref={done} onDone={close}/></header>
 <div className={`${shell.body} ${styles.body}`}>
 <section className={`${styles.card} ${styles.coins}`} aria-labelledby="pocket-coins"><div className={styles.cardTop}><BalanceIcon kind="coins"/><div><h3 id="pocket-coins">Coins</h3><strong data-pocket-coins>{wallet.balance.toLocaleString()}</strong><span>ready to spend</span></div></div><p>Your island spending money. Use coins for arcade games and vending-machine items, including card packs and books.</p><div className={styles.note}><b>Earn more</b><p>Lessons, hidden balls, stories and finished paths pay coins the first time you complete each one. Play arcade games, help with island jobs, or sell your catch and harvest. Come back and actively play for a daily {DAILY_PLAY_COINS}-coin bonus.</p></div><div className={styles.note} data-training-meter={training.tier}><b>Training meter</b><div className={market.meter} role="meter" aria-label="Coins from jobs, arcade games and market sales today" aria-valuemin={0} aria-valuemax={TRAINING_HALF_COINS} aria-valuenow={Math.min(training.paid,TRAINING_HALF_COINS)}><div style={{transform:`scaleX(${training.fill})`}}/></div><p>{training.line}</p></div></section>
 <section className={`${styles.card} ${styles.fish}`} aria-labelledby="pocket-fish"><div className={styles.cardTop}><BalanceIcon kind="fish"/><div><h3 id="pocket-fish">Fish</h3><strong data-pocket-fish>{count(fish)}</strong><span>in your basket</span></div></div><p>Catch fish around the island. Take them to Rosa’s farmers-market stand to trade them for coins.</p>{fish.length?items(fish):<p className={styles.empty}>Your next catch will appear here.</p>}<div className={styles.note}>Your Fishbook remembers the fish you discover, even after you sell them.</div></section>
 <section className={`${styles.card} ${styles.fruit}`} aria-labelledby="pocket-fruit"><div className={styles.cardTop}><BalanceIcon kind="fruit"/><div><h3 id="pocket-fruit">Fruit &amp; vegetables</h3><strong data-pocket-fruit>{count(fruit)}</strong><span>in your basket</span></div></div><p>Pick fruit and harvest ripe produce in the Community Garden. Bring your harvest to Rosa to earn coins.</p>{fruit.length?items(fruit):<p className={styles.empty}>A little exploring can fill your basket.</p>}</section>
 <p className={styles.capacity}>Basket space <b>{count(rows)} / {BASKET_LIMIT}</b><span>Fish and produce share this space. Sell some to make room for more.</span></p>
 </div></section></dialog>;
}
