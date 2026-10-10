'use client';
import {useSyncExternalStore} from 'react';
import {rootViewSnapshot,subscribeRootView,type RootView} from '@/lib/rootView';

/** 'landing' | 'game' (lib/rootView.ts), or null while hydrating the prerendered `/` (both screens are in its HTML then). */
export function useRootView():RootView|null{return useSyncExternalStore(subscribeRootView,rootViewSnapshot,()=>null);}
