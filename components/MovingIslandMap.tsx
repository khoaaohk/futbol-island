'use client';
import {memo,useCallback,useRef,useSyncExternalStore,type ComponentProps} from 'react';
import type {PositionStore} from '@/lib/town/positionStore';
import IslandOverview from './IslandOverview';
import IslandTravelMap from './IslandTravelMap';
import {onLand} from '@/lib/town/landmass';
const unsubscribed=()=>()=>{};
// Heat pass 4: the local minimap layer moves on island frames (store.subscribeFrame), so React re-renders it only when it crosses the
// shoreline (the zoom radius changes), not on every 150 ms position publish (the iPhone timeline showed ~5 scheduler messages/s while flying).
const shoreKey=(store:PositionStore)=>{const p=store.getSnapshot();return onLand(p.x,p.z)?'island':'sea';};
export function MovingIslandOverview({store,...props}:Omit<ComponentProps<typeof IslandOverview>,'position'>&{store:PositionStore}){const key=()=>shoreKey(store);useSyncExternalStore(props.active===false?unsubscribed:store.subscribe,key,key);const position=store.getSnapshot();return <IslandOverview {...props} position={position} frames={props.active===false?undefined:store.subscribeFrame}/>;}
// Heat (overnight audit F3, Sep 30 2026): Town re-renders on its HUD tick (2–3/s while walking). The closed map used to read a fresh
// snapshot on each of those renders, and Town's inline onSelect was new each time, so the closed map re-rendered its whole SVG
// terrain (IslandOverview's memo saw a new markerPosition/onSelect). Closed, it keeps the position it last showed and a stable
// onSelect, so it renders only when it opens, closes (the leave animation still gets open=false) or moves while open.
const TravelMap=memo(IslandTravelMap);
export function MovingIslandTravelMap({store,onSelect,...props}:Omit<ComponentProps<typeof IslandTravelMap>,'position'>&{store:PositionStore}){
 const live=useSyncExternalStore(props.open?store.subscribe:unsubscribed,store.getSnapshot,store.getSnapshot);
 const shown=useRef(live);if(props.open)shown.current=live;
 const latestSelect=useRef(onSelect);latestSelect.current=onSelect;
 const select=useCallback<typeof onSelect>(destination=>latestSelect.current(destination),[]);
 return <TravelMap {...props} onSelect={select} position={shown.current}/>;
}
