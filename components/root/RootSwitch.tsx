'use client';
import {useEffect,useLayoutEffect,useState,type ReactNode} from 'react';
import {flushSync} from 'react-dom';
import {continueLoaderFrom} from '@/components/islandLoadingBoot';
import {loadGame,loadedGame} from './gameLoader';
import {useRootView} from './useRootView';

/**
 * `/` = the title screen, then the game in place, at the same URL (Oct 9 2026; lib/rootView.ts has the rule).
 *  - Prerendered with BOTH screens (`landing` = components/landing/Landing, `loader` = IslandLoadingStatic); the pre-paint flag
 *    <html data-root-view> shows one (globals.css). After hydration only the active one stays mounted.
 *  - Game: the game's code is its own chunk (gameLoader.ts). Until it is here the static loader shows; then Town's loader
 *    replaces it in one synchronous commit and continues its animations (continueLoaderFrom), so a reload looks as before.
 *  - Play (WaterPill → enterGame): the water fill already loaded the game and the title screen ends on a plain tan sheet with
 *    <html data-island-handoff="tan">, so the same commit drops the title screen and mounts Town, whose loader starts as that tan
 *    sheet: last title frame == first game frame, no navigation.
 */
export default function RootSwitch({landing,loader}:{landing:ReactNode;loader:ReactNode}){
 const view=useRootView();
 const [Game,setGame]=useState(()=>null as ReturnType<typeof loadedGame>);
 const [failed,setFailed]=useState(false);
 const Loaded=Game??(view==='game'?loadedGame():null);
 useLayoutEffect(()=>{if(!view)return;const html=document.documentElement;const was=html.dataset.rootView;html.dataset.rootView=view;
  if(view==='game'&&was==='landing')window.scrollTo(0,0);setThemeColor(view==='game'?GAME_TINT:TITLE_TINT);},[view]);
 useEffect(()=>{
  if(view!=='game'||Loaded)return;let live=true;
  void loadGame().then(G=>{if(!live)return;if(!G){setFailed(true);return;}
   continueLoaderFrom(placeholderStart());flushSync(()=>setGame(()=>G));});
  return()=>{live=false;};
 },[view,Loaded]);
 return <>
  {view!=='game'&&<div data-root-landing="">{landing}</div>}
  {view!=='landing'&&<div data-root-game="">{Loaded?<Loaded/>:failed?<LoadFailed/>:loader}</div>}
 </>;
}

/** The browser's tint around its own UI (iPhone Safari also tints the strip behind the on-screen keyboard from the page): the title
 *  screen's sea blue there, the game's dark green (the page background, globals.css) in the game, so typing a save code in the
 *  game no longer shows a blue band behind the keyboard (user, Oct 9 2026). */
const TITLE_TINT='#2b53e5',GAME_TINT='#244d40';
function setThemeColor(c:string){
 let m=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
 if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}
 m.content=c;document.documentElement.style.backgroundColor=c===GAME_TINT?'':c;
}

/** When the static placeholder's animations started (document timeline), so Town's loader picks up from there. */
function placeholderStart():number|null{
 const el=document.querySelector('[data-root-loader]');if(!el)return null;
 let start:number|null=null;
 for(const a of el.getAnimations({subtree:true})){const t=a.startTime;if(typeof t==='number'&&(start===null||t<start))start=t;}
 return start;
}

function LoadFailed(){
 return <div className="town-app"><div className="town-loading" role="alert"><h2>The island couldn’t load.</h2><p>Check your connection, then try again.</p>
  <button className="pixel-button" onClick={()=>window.location.reload()}>TRY AGAIN</button></div></div>;
}
