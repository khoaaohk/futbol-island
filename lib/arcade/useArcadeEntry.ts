'use client';
import {useEffect,useRef,useState} from 'react';
import {beginArcadeRun,payArcadePlay,type ArcadeCoinGame} from './arcadeWallet';
/** One payment per deliberate new play (puzzles are free); pause/resume never calls this hook. */
export function useArcadeEntry(game:Exclude<ArcadeCoinGame,'island'>){
 const locked=useRef(false),alive=useRef(true);const [pending,setPending]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const enter=async()=>{if(locked.current)return null;locked.current=true;setPending(true);setMessage('');
  // Pass Puzzles are lessons: free to play (economy pass, 28 Sep 2026). Every other machine costs ARCADE_PLAY_COST.
  const id=beginArcadeRun(game),result=game==='puzzle'?{ok:true as const}:await payArcadePlay(game,id);locked.current=false;if(!alive.current)return null;setPending(false);
  if(!result.ok){setMessage(result.reason);return null;}return id;
 };
 return {enter,pending,message};
}
