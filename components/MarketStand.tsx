'use client';
/**
 * THE farmers-market sell stand: Fish · Produce · Cards in one dialog (docs/fishing.md, docs/sell-shop.md).
 * Fish + Produce: shared registry lib/town/market/goods.ts and the shared rules/soft cap in lib/town/market/market.ts
 * (island jobs agent). Cards: components/MarketCardsSection.tsx (sell-shop agent), rendered as the third section.
 * Coins go into the shared wallet through the island bridge (lib/town/jobs/islandWallet.ts).
 * Heat: no timers or loops; the coin burst is a one-shot CSS animation (hidden for reduced motion).
 */
import {useEffect,useRef,useState,useSyncExternalStore,type CSSProperties} from 'react';
import {DoneButton} from './DoneButton';
import FishArt from './FishArt';
import MarketCardsSection from './MarketCardsSection';
import shell from './ModalShell.module.css';
import styles from './MarketStand.module.css';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {islandJobWallet,islandMarket} from '@/lib/town/jobs/islandWallet';
import {goodById,type GoodKind} from '@/lib/town/market/goods';
import {BASKET_LIMIT,MARKET_FULL_PRICE_COINS,basketCount,type SaleResult} from '@/lib/town/market/market';
import {MARKET_STORAGE_KEY,allowanceUsed,basketLines,sellOneGood} from '@/lib/town/market/marketStand';
import {FISH_SPOTS,MARKET_STAND,fishById} from '@/lib/town/fishing/fishCatalog';

type Tab='fish'|'produce'|'cards';
const TABS:{id:Tab;label:string}[]=[{id:'fish',label:'Fish'},{id:'produce',label:'Produce'},{id:'cards',label:'Cards'}];
const useMarket=()=>useSyncExternalStore(islandMarket.subscribe,islandMarket.read,islandMarket.read);
const sellPorts={read:()=>JSON.parse(localStorage.getItem(MARKET_STORAGE_KEY)??'null'),write:(v:unknown)=>localStorage.setItem(MARKET_STORAGE_KEY,JSON.stringify(v)),credit:(id:string,amount:number,reason:string)=>islandJobWallet.credit(id,amount,reason),refresh:()=>islandMarket.refresh()};

export default function MarketStand({open,onOpenChange,initialTab}:{open:boolean;onOpenChange:(open:boolean)=>void;initialTab?:Tab}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [tab,setTab]=useState<Tab>('fish'),wallet=useArcadeWallet(),market=useMarket();
 const [note,setNote]=useState<{id:number;coins:number;text:string;lesson?:string}|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;islandMarket.refresh();
  const s=islandMarket.read();setTab(initialTab??(basketLines(s,'fish').length||!basketLines(s,'produce').length?'fish':'produce'));setNote(null);el.showModal();close.current?.focus();}
  else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open,initialTab]);
 const done=(r:SaleResult)=>{setBusy(false);if(!r.ok){setNote({id:Date.now(),coins:0,text:r.reason});return;}const first=goodById(r.lines[0]?.id??'');
  setNote({id:Date.now(),coins:r.credited||r.coins,text:`${r.lines.map(l=>`${l.count} ${l.name}`).join(', ')} sold. ${r.message}`,lesson:first?.lesson});};
 const sellAll=(kind:GoodKind)=>{if(busy)return;setBusy(true);void islandMarket.sell(kind).then(done,()=>setBusy(false));};
 const sellOne=(id:string)=>{if(busy)return;setBusy(true);void sellOneGood(id,sellPorts).then(done,()=>setBusy(false));};
 const used=allowanceUsed(market),count=basketCount(market);
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="market-stand-title" data-market-stand onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell}`}>
   <header className={shell.header}><div><h2 id="market-stand-title">{MARKET_STAND.seller}&apos;s Market Stand</h2></div><DoneButton ref={close} onDone={()=>onOpenChange(false)}/></header>
   <div className={shell.body}>
    <div className={styles.top}>
     <p className={styles.rosa}><b>{MARKET_STAND.seller}:</b> “I buy fresh fish, garden produce and — if you ever want to swap — cards. Fixed prices, no haggling!”</p>
     <div className={styles.wallet} data-market-balance><span className={styles.coin} aria-hidden="true"/><b>{wallet.balance}</b><small>coins</small></div>
    </div>
    <div className={styles.allowance} aria-label={`Full-price sales today: ${Math.min(market.soldToday,MARKET_FULL_PRICE_COINS)} of ${MARKET_FULL_PRICE_COINS} coins`}>
     <div className={styles.meter}><div style={{transform:`scaleX(${used})`}}/></div>
     <p>{used<1?`Full prices today until you have sold ${MARKET_FULL_PRICE_COINS} coins of goods (${market.soldToday} so far). After that, half price until tomorrow.`:'Great trading today! Everything sells for half price until tomorrow.'} Basket {count}/{BASKET_LIMIT}.</p>
    </div>
    <div className={styles.tabs} role="tablist" aria-label="What to sell">{TABS.map(t=>{const n=t.id==='cards'?null:basketLines(market,t.id).reduce((a,l)=>a+l.count,0);return <button key={t.id} type="button" role="tab" id={`market-tab-${t.id}`} aria-selected={tab===t.id} aria-controls={`market-panel-${t.id}`} onClick={()=>{setTab(t.id);setNote(null);}}>{t.label}{n?<span>{n}</span>:null}</button>;})}</div>
    {note&&<p key={note.id} className={styles.note} role="status" data-market-note>
     {note.coins>0&&<span className={styles.burst} aria-hidden="true">{[0,1,2,3,4].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</span>}
     {note.coins>0&&<b>+{note.coins} coins</b>} {note.text}{note.lesson&&<small><em>Football lesson</em>{note.lesson}</small>}
    </p>}
    <div role="tabpanel" id={`market-panel-${tab}`} aria-labelledby={`market-tab-${tab}`}>
     {tab==='cards'?null:<Goods kind={tab} lines={basketLines(market,tab)} busy={busy} onOne={sellOne} onAll={()=>sellAll(tab)}/>}
     <MarketCardsSection active={tab==='cards'} onSold={(coins,name)=>setNote({id:Date.now(),coins,text:`${name} traded in.`})}/>
    </div>
   </div>
  </section>
 </dialog>;
}

function Goods({kind,lines,busy,onOne,onAll}:{kind:'fish'|'produce';lines:ReturnType<typeof basketLines>;busy:boolean;onOne:(id:string)=>void;onAll:()=>void}){
 if(!lines.length)return <div className={styles.empty}>{kind==='fish'?<><b>No fish in your basket yet.</b><p>Look for the little fishing posts with a red float: {FISH_SPOTS.map(s=>s.name).join(', ')}.</p></>:<><b>No produce in your basket yet.</b><p>Pick ripe fruit and vegetables at the Community Garden, just north of the market.</p></>}</div>;
 const total=islandMarket.quote(kind).coins;
 return <section className={styles.goods} aria-label={kind==='fish'?'Sell fish':'Sell produce'}>
  <ul>{lines.map(({good,count,each})=>{const fish=kind==='fish'?fishById(good.id):undefined;return <li key={good.id} data-good={good.id}>
   <span className={styles.art}>{fish?<FishArt fish={fish} size={64}/>:<i style={{background:good.color}}/>}</span>
   <span className={styles.name}><b>{count>1?good.plural:good.name} × {count}</b><small>{each} coin{each===1?'':'s'} each{fish?` · ${fish.club.name}`:''}</small></span>
   <button type="button" className={styles.one} disabled={busy} onClick={()=>onOne(good.id)} aria-label={`Sell one ${good.name} for ${each} coins`}>Sell 1</button>
  </li>;})}</ul>
  <button type="button" className={styles.all} disabled={busy} onClick={onAll} data-market-sell-all={kind}>Sell all {kind} · {total} coins</button>
 </section>;
}
