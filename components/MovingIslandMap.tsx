'use client';
import {useSyncExternalStore,type ComponentProps} from 'react';
import type {PositionStore} from '@/lib/town/positionStore';
import IslandOverview from './IslandOverview';
import IslandTravelMap from './IslandTravelMap';
const unsubscribed=()=>()=>{};
export function MovingIslandOverview({store,...props}:Omit<ComponentProps<typeof IslandOverview>,'position'>&{store:PositionStore}){const position=useSyncExternalStore(props.active===false?unsubscribed:store.subscribe,store.getSnapshot,store.getSnapshot);return <IslandOverview {...props} position={position}/>;}
export function MovingIslandTravelMap({store,...props}:Omit<ComponentProps<typeof IslandTravelMap>,'position'>&{store:PositionStore}){const position=useSyncExternalStore(props.open?store.subscribe:unsubscribed,store.getSnapshot,store.getSnapshot);return <IslandTravelMap {...props} position={position}/>;}
