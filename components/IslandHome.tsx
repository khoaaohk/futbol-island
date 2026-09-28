'use client';
import {useEffect,useState} from 'react';
import {useVending,isVendingOwned} from '@/lib/town/vendingWallet';
import {VENDING_SPECIALS,vendingItem} from '@/lib/town/vendingCatalog';
import {HOME_KEY,emptyHome,itemSurface,placeHome,sanitizeHome,type HomeState,type HomeSurface} from '@/lib/town/homeDecor';
import VendingProductArt from './VendingProductArt';
import styles from './IslandHome.module.css';
const surfaces:HomeSurface[]=['wall','shelf','floor'];
export default function IslandHome({onShop}:{onShop:()=>void}){
 const wallet=useVending(),items=VENDING_SPECIALS.filter(i=>i.kind==='display'&&wallet.owned.includes(i.id));
 const [home,setHome]=useState<HomeState>(emptyHome),[selected,setSelected]=useState<string|null>(null),[message,setMessage]=useState('Choose a collectible, then tap a highlighted spot.');
 const read=()=>{try{return sanitizeHome(JSON.parse(localStorage.getItem(HOME_KEY)??'null'),new Set(VENDING_SPECIALS.filter(i=>isVendingOwned(i.id)).map(i=>i.id)));}catch{return emptyHome;}};
 useEffect(()=>{setHome(read());const sync=(e:StorageEvent)=>{if(e.key===HOME_KEY||e.key===null)setHome(read());};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 async function change(make:(fresh:HomeState)=>HomeState|null){
  const work=()=>{const next=make(read());if(!next)return;try{localStorage.setItem(HOME_KEY,JSON.stringify(next));setHome(next);document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail:'equip'}));}catch{setMessage('Your room could not be saved. Please try again.');}};
  try{if(navigator.locks)await navigator.locks.request(HOME_KEY,work);else work();}catch{setMessage('Your room could not be saved. Please try again.');}
 }
 const place=(surface:HomeSurface,slot:number)=>{if(!selected)return;void change(fresh=>{const result=placeHome(fresh,new Set(items.map(i=>i.id)),selected,surface,slot);if(!result.ok){setMessage(result.reason);return null;}setMessage(`${vendingItem(selected)?.label} placed. Saved to your home.`);return result.state;});};
 const placed=home.placements.find(p=>p.id===selected),current=selected?vendingItem(selected):null;
 return <section className={styles.home} data-island-home>
  <p className={styles.intro}>A room for your football stories. Collect special pieces around the island and make it yours.</p>
  <div className={styles.room} aria-label="Your football room">
   <div className={styles.window} aria-hidden="true"><i/><span>FUTBOL<br/>ISLAND</span></div>
   {surfaces.map(surface=><div key={surface} className={styles[surface]} role="group" aria-label={`${surface} placement spots`}>
    {Array.from({length:6},(_,slot)=>{const p=home.placements.find(p=>p.surface===surface&&p.slot===slot),item=p?vendingItem(p.id):null,allowed=!!selected&&itemSurface(selected)===surface;
     return <button key={slot} type="button" className={styles.spot} data-home-spot={`${surface}-${slot}`} data-available={allowed&&!p||undefined} data-selected={p?.id===selected||undefined} aria-label={item?`${item.label}, ${surface} spot ${slot+1}`:`${surface} spot ${slot+1}${allowed?', place selected item here':''}`} onClick={()=>{if(p&&p.id!==selected){setSelected(p.id);setMessage('Choose another highlighted spot to move this piece.');}else place(surface,slot);}}>
      {item?<span className={styles.object} style={{transform:p?.turned?'scaleX(-1)':undefined}}><VendingProductArt id={item.id} kind="display"/></span>:allowed?<span aria-hidden="true">＋</span>:null}
     </button>;})}
   </div>)}
   <div className={styles.rug} aria-hidden="true"><span>PLAY · LEARN · GROW</span></div>
  </div>
  <p className={styles.message} role="status">{message}</p>
  {current&&<div className={styles.selected}><strong>{current.label}</strong><p>{current.blurb}</p>{placed&&<div className={styles.tools}><button type="button" onClick={()=>void change(f=>({...f,placements:f.placements.map(p=>p.id===selected?{...p,turned:!p.turned}:p)}))}>Turn around</button><button type="button" onClick={()=>void change(f=>{setMessage('Returned to your collection.');return {...f,placements:f.placements.filter(p=>p.id!==selected)};})}>Put away</button></div>}</div>}
  <h3>Your collection <small>{items.length} pieces</small></h3>
  {items.length?<div className={styles.collection}>{items.map(item=><button key={item.id} type="button" aria-pressed={selected===item.id} onClick={()=>{setSelected(item.id);setMessage(`Choose a ${itemSurface(item.id)} spot for ${item.label}.`);}}><VendingProductArt id={item.id} kind="display"/><strong>{item.label}</strong><small>{home.placements.some(p=>p.id===item.id)?'In your room':`Place on ${itemSurface(item.id)}`}</small></button>)}</div>:<p>Your collection is waiting to begin. Each vending machine has its own books, prints, lamps and trophies.</p>}
  <button type="button" className={styles.shop} onClick={onShop}>Find collectibles</button>
 </section>;
}
