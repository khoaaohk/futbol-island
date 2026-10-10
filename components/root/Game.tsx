'use client';
import Town from '@/components/Town';
import DevUnlock from '@/components/DevUnlock';
import SaveSync from '@/components/saves/LazySaveSync';

/** The game at `/` (what app/page.tsx rendered before the title screen moved there): its own chunk, loaded on demand by
 *  gameLoader.ts, so a title-screen visitor's first load carries none of it. /?from= (app/island-return) renders Town directly. */
export default function Game(){return <><Town/><DevUnlock/><SaveSync/></>;}
