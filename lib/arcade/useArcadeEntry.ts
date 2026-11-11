'use client';
import {useEffect,useRef,useState} from 'react';
import {beginArcadeRun,payArcadePlay,type ArcadeCoinGame} from './arcadeWallet';
/** One fresh run per deliberate new play. Every arcade game is free (11 Nov 2026): payArcadePlay spends nothing while ARCADE_PLAY_COST is 0; pause/resume never calls this hook. */
export function useArcadeEntry(game:Exclude<ArcadeCoinGame,'island'>){
 const locked=useRef(false),alive=useRef(true);const [pending,setPending]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const enter=async()=>{if(locked.current)return null;locked.current=true;setPending(true);setMessage('');
  // Every machine is free to play (Pass Puzzles since 28 Sep 2026, the rest since 11 Nov 2026; ARCADE_PLAY_COST=0).
  const id=beginArcadeRun(game),result=game==='puzzle'?{ok:true as const}:await payArcadePlay(game,id);locked.current=false;if(!alive.current)return null;setPending(false);
  if(!result.ok){setMessage(result.reason);return null;}return id;
 };
 return {enter,pending,message};
}
