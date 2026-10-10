'use client';
import type {ComponentType} from 'react';
import {bootMark} from '@/lib/boot/perfMarks';

/**
 * The game's code (Game.tsx → Town and its whole module graph), loaded once per page and shared by:
 *  - the title screen's water fill (components/landing/waterLaunch.ts waitForGame): the water rises while this downloads;
 *  - RootSwitch, which renders it the moment `/` switches to the game (already loaded after a Play, so the swap is synchronous).
 * A failed download clears the promise so the next call retries.
 */
type Game=ComponentType;
let promise:Promise<Game|null>|null=null,loaded:Game|null=null;
export function loadGame():Promise<Game|null>{
 if(!promise)bootMark('game-chunk:start');
 promise??=import('./Game').then(m=>{bootMark('game-chunk:done');return loaded=m.default;},()=>{promise=null;return null;});
 return promise;
}
export const loadedGame=()=>loaded;
