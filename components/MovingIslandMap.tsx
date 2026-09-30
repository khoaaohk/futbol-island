'use client';
import {useSyncExternalStore,type ComponentProps} from 'react';
import type {PositionStore} from '@/lib/town/positionStore';
import IslandOverview from './IslandOverview';
import IslandTravelMap from './IslandTravelMap';
import {onLand} from '@/lib/town/landmass';
const unsubscribed=()=>()=>{};
// Heat pass 4: the local minimap layer moves on island frames (store.subscribeFrame), so React re-renders it only when it crosses the
// shoreline (the zoom radius changes), not on every 150 ms position publish (the iPhone timeline showed ~5 scheduler messages/s while flying).
const shoreKey=(store:PositionStore)=>{const p=store.getSnapshot();return onLand(p.x,p.z)?'island':'sea';};
export function MovingIslandOverview({store,...props}:Omit<ComponentProps<typeof IslandOverview>,'position'>&{store:PositionStore}){const key=()=>shoreKey(store);useSyncExternalStore(props.active===false?unsubscribed:store.subscribe,key,key);const position=store.getSnapshot();return <IslandOverview {...props} position={position} frames={props.active===false?undefined:store.subscribeFrame}/>;}
export function MovingIslandTravelMap({store,...props}:Omit<ComponentProps<typeof IslandTravelMap>,'position'>&{store:PositionStore}){const position=useSyncExternalStore(props.open?store.subscribe:unsubscribed,store.getSnapshot,store.getSnapshot);return <IslandTravelMap {...props} position={position}/>;}
