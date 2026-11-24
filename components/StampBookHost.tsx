'use client';
/**
 * The Island stamp book's host (Nov 23 2026): listens for OPEN_STAMP_BOOK (lib/town/islandStamps.ts) from the station houses'
 * Collect stamp button (Town), the Konbini cashier, Ada at the History Museum desk, Femi at the Kit Shop till and the backpack.
 * `stamp` collects that stamp first (once: a second visit just opens its page, "Stamped ✓"), pays its learning coins and counts
 * it; then the book (components/StampBook.tsx, loaded on first use) opens on that page and plays the stamping moment for a new one.
 * Nothing runs until the event: no timers, no rendering while closed.
 */
import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import {retryImport} from '@/lib/retryImport';
import {OPEN_STAMP_BOOK,collectStamp,isStampId,stampPage,type StampId} from '@/lib/town/islandStamps';
import {claimStamp} from '@/lib/town/islandStampsReward';
import {countStampBookOpen,countStampCollected} from '@/lib/analytics/stampEvents';

const StampBook=dynamic(()=>retryImport(()=>import('./StampBook')),{ssr:false});
export const STAMPS_CHANGED='fi2-island-stamps-changed';

export default function StampBookHost(){
 const [open,setOpen]=useState<{page:number;fresh:StampId|null;key:number}|null>(null);
 useEffect(()=>{
  const on=(e:Event)=>{const d=((e as CustomEvent).detail??{}) as {stamp?:unknown;page?:unknown};let page=0,fresh:StampId|null=null;
   if(isStampId(d.stamp)){const r=collectStamp(d.stamp);page=stampPage(d.stamp);
    if(r.first){fresh=d.stamp;countStampCollected(d.stamp,r.completed);window.dispatchEvent(new Event(STAMPS_CHANGED));}
    void claimStamp(d.stamp);/* creditOnce: pays only the first time, retries a missed payment */}
   else if(isStampId(d.page))page=stampPage(d.page);
   countStampBookOpen();setOpen({page,fresh,key:performance.now()});};
  window.addEventListener(OPEN_STAMP_BOOK,on);return()=>window.removeEventListener(OPEN_STAMP_BOOK,on);
 },[]);
 return open?<StampBook key={open.key} initialPage={open.page} fresh={open.fresh} onClose={()=>setOpen(null)}/>:null;
}
