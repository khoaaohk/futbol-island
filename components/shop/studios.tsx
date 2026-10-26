'use client';
import dynamic from 'next/dynamic';
import type {ComponentType} from 'react';
import styles from './ShopRoom.module.css';

/**
 * The Kit Shop's three studios, each its own chunk loaded only when its station is opened (next/dynamic, no SSR). Each studio
 * renders its own small on-demand three.js scene and disposes it on close; the shop room pauses its scene underneath.
 * Contract (shared with the studio agents): `{onClose():void; onBuy?(design):void; owned?(design):boolean}`.
 * `owned` (Oct 26 2026, owner: owned boots said "Buy for 265"): true when this exact design is already in My kit, so the studio
 * shows Owned / Equip instead of a price (equipping goes through onBuy, which charges nothing for an owned design).
 */
export type StudioProps={onClose():void;onBuy?(design:unknown):void;owned?(design:unknown):boolean};
function Opening(){return <p role="status" className={styles.studioLoading}>Opening the studio…</p>;}
export const JerseyStudio=dynamic(()=>import('./JerseyStudio'),{ssr:false,loading:Opening}) as ComponentType<StudioProps>;
export const BootStudio=dynamic(()=>import('./BootStudio'),{ssr:false,loading:Opening}) as ComponentType<StudioProps>;
export const BallStudio=dynamic(()=>import('./BallStudio'),{ssr:false,loading:Opening}) as ComponentType<StudioProps>;
