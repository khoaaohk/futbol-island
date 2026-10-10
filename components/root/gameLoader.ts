'use client';
import type {ComponentType} from 'react';
import {bootMark} from '@/lib/boot/perfMarks';

/**
 * The game's code (Game.tsx → Town and its whole module graph), loaded once per page and shared by:
 *  - the title screen's preload (islandPreload.ts): a clear intent to play (Start, Play) imports it and warms the island;
 *  - the title screen's water fill (components/landing/waterLaunch.ts): the water rises while this (and the warm-up) finishes;
 *  - RootSwitch, which renders it the moment `/` switches to the game (already loaded after a Play, so the swap is synchronous).
 * A failed download clears the promise so the next call retries.
 */
type Game=ComponentType;
export type GameModule=typeof import('./Game');
let promise:Promise<GameModule|null>|null=null,loaded:GameModule|null=null;
export function loadGameModule():Promise<GameModule|null>{
 if(!promise)bootMark('game-chunk:start');
 promise??=import('./Game').then(m=>{bootMark('game-chunk:done');return loaded=m;},()=>{promise=null;return null;});
 return promise;
}
export function loadGame():Promise<Game|null>{return loadGameModule().then(m=>m?.default??null);}
export const loadedGame=():Game|null=>loaded?.default??null;
