'use client';
/**
 * The HUD stack's toast lane (docs/ui/HUD_STACK.md): one transient note on screen at a time across IslandJobs (coins, garden
 * picks, daily play), CostumeMilestoneToast and RideUnlockToast. A note claims the lane while it shows and releases it when it
 * hides; the others wait (their timers do not run while they wait). Event-driven, no timers or polling of its own.
 */
import {useSyncExternalStore} from 'react';
let owner:string|null=null;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
export const toastLane={
 get owner(){return owner;},
 /** Take the lane (true) or learn it is busy (false). Re-claiming your own lane is a no-op. */
 request(id:string){if(owner!==null&&owner!==id)return false;if(owner!==id){owner=id;emit();}return true;},
 release(id:string){if(owner===id){owner=null;emit();}},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
};
/** True while another note holds the lane. */
export function useToastLaneBusy(id:string){return useSyncExternalStore(toastLane.subscribe,()=>owner!==null&&owner!==id,()=>false);}
