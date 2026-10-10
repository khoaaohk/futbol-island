'use client';
/**
 * Getting from the title screen into the game quickly (Oct 9 2026). Both are at `/`: the title screen switches to the game in
 * place (components/root/RootSwitch.tsx), so there is no route to prefetch.
 *  - warmGame(): the kept nav-button Play (PlayButton.tsx, unused by the title screen) starts loading the game's code on the first
 *    hover / focus / touch. Skipped on Save-Data; runs at most once. The water pill loads it when pressed (waterLaunch.ts), and
 *    nothing loads it on idle: a visitor who never presses Play never downloads the game.
 */
import {loadGame} from '../root/gameLoader';
let warmed=false;
export function warmGame(){
 if(warmed)return;warmed=true;
 const connection=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
 if(connection?.saveData)return;
 void loadGame();
}
/** requestIdleCallback with a timeout, or a short timer where it is missing (Safari). Returns a cancel function. */
export function onIdle(run:()=>void,timeout=2500):()=>void{
 const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
 if(w.requestIdleCallback){const id=w.requestIdleCallback(run,{timeout});return()=>w.cancelIdleCallback?.(id);}
 const id=setTimeout(run,1200);return()=>clearTimeout(id);
}
