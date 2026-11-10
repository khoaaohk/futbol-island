'use client';
/**
 * Load-time pass (Nov 10 2026, docs/performance-guide.md "Rare activities load on demand"): FishingHost and what only it needs
 * (the catch card, tutorial, lure button, Fishbook and market stand wrappers) are a separate chunk. This shell mounts it when the
 * player first comes near a fishing spot (the same 100 m prefetch as the fishing visuals), when a session starts, or when the market
 * stand is asked for (that request is replayed once the host is mounted). Fail soft: if the chunk cannot load, a running session is
 * stopped (fishing is simply unavailable this time) and the next approach / cast / stand request retries.
 */
import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {fishingSession} from '@/lib/town/fishing/fishingStore';
import {FISHING_NEAR_EVENT,OPEN_MARKET_STAND,fishingNearSeen} from '@/lib/town/fishing/fishingSignals';
import {useLazyPart} from '@/lib/ui/useLazyPart';

export const loadFishingHost=()=>import('./FishingHost');
type Props={paused?:boolean;onOpenChange:(open:boolean)=>void;onDialogChange?:(open:boolean)=>void};
const activeNow=()=>fishingSession.getView().active;

export default function FishingHostLazy(props:Props){
 const active=useSyncExternalStore(fishingSession.subscribe,activeNow,()=>false);
 const [want,setWant]=useState(fishingNearSeen);
 const pending=useRef<CustomEvent|null>(null);
 const Host=useLazyPart(loadFishingHost,want||active,useCallback(()=>{pending.current=null;if(activeNow())fishingSession.stop();setWant(false);},[]));
 // Until the host is mounted, listen for the first approach and for a market-stand request (kept, then replayed).
 useEffect(()=>{if(Host)return;
  const near=()=>setWant(true),stand=(e:Event)=>{pending.current=new CustomEvent(OPEN_MARKET_STAND,{detail:(e as CustomEvent).detail});setWant(true);};
  window.addEventListener(FISHING_NEAR_EVENT,near);window.addEventListener(OPEN_MARKET_STAND,stand);
  return()=>{window.removeEventListener(FISHING_NEAR_EVENT,near);window.removeEventListener(OPEN_MARKET_STAND,stand);};},[Host]);
 // The host's own listener is registered in its effect, which runs before this parent effect in the same commit.
 useEffect(()=>{if(Host&&pending.current){const e=pending.current;pending.current=null;window.dispatchEvent(e);}},[Host]);
 return Host?<Host {...props}/>:null;
}
