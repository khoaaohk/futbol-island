'use client';
import {useEffect,useState} from 'react';

/**
 * The game's last-resort error screen (QA audit Oct 25 2026, docs/QA_AUDIT_OCT25.md #13). There was no error boundary anywhere:
 * on a flaky phone connection a lazy piece of the HUD (Settings, the pocket, a machine…) failed to download, React had nowhere to
 * put the error and the whole island went blank. Next.js mounts this file around every page below the root layout. It keeps the
 * kid's save (saves live in local storage / the save server, nothing here touches them) and offers one big button: "Try again".
 * A failed download is cached as failed by the lazy component, so a chunk error reloads the page (the title's Play button, then
 * the island from the save); any other error first tries re-rendering in place. While the phone is offline it waits.
 * No timers or polling: one `online` listener.
 */
const CHUNK=/ChunkLoadError|Loading (CSS )?chunk|dynamically imported module|Importing a module script failed/i;
/** A failed download (webpack / CSS chunk / ES module) rather than a bug in the game's own code. */
const isChunkError=(e:unknown)=>!!e&&CHUNK.test(`${(e as Error).name??''} ${(e as Error).message??''}`);

export default function GameError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 const [offline,setOffline]=useState(false);
 useEffect(()=>{console.error('island error screen',error);},[error]);
 useEffect(()=>{
  const sync=()=>setOffline(typeof navigator!=='undefined'&&navigator.onLine===false);sync();
  window.addEventListener('online',sync);window.addEventListener('offline',sync);
  return()=>{window.removeEventListener('online',sync);window.removeEventListener('offline',sync);};
 },[]);
 return <div className="town-app"><div className="town-loading" role="alert" data-game-error="">
  <h2>{offline?'No internet right now':'Oops! The island tripped over the ball.'}</h2>
  <p>{offline?'Connect to Wi-Fi or data, then tap Try again. Your island is saved.':'Tap Try again to jump back in. Your island is saved.'}</p>
  <button type="button" className="pixel-button" disabled={offline} onClick={()=>{if(isChunkError(error))window.location.reload();else reset();}}>TRY AGAIN</button>
 </div></div>;
}
