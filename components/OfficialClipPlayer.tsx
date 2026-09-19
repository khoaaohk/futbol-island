'use client';
import {holdVideoPlayback} from '@/lib/videoPlayback';
import {useEffect,useRef} from 'react';
type Player={destroy:()=>void};
type YouTube={Player:new(element:HTMLElement,options:Record<string,unknown>)=>Player};
let ready:Promise<YouTube>|undefined;
function loadApi(){
 const win=window as unknown as {YT?:YouTube;onYouTubeIframeAPIReady?:()=>void};
 if(win.YT?.Player)return Promise.resolve(win.YT);
 if(!ready)ready=new Promise<YouTube>((resolve,reject)=>{
  const previous=win.onYouTubeIframeAPIReady;
  const timer=setTimeout(()=>{ready=undefined;reject(Error('Video player unavailable'));},12000);
  win.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);previous?.();resolve(win.YT!);};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
  script.onerror=()=>{clearTimeout(timer);ready=undefined;script.remove();reject(Error('Video player unavailable'));};document.head.appendChild(script);
 });
 return ready;
}
export default function OfficialClipPlayer({id,title,onUnavailable}:{id:string;title:string;onUnavailable:()=>void}){
 const host=useRef<HTMLDivElement>(null),failure=useRef(onUnavailable);failure.current=onUnavailable;
 useEffect(()=>{let active=true,player:Player|undefined;let failed=false;let release:(()=>void)|undefined=holdVideoPlayback();
  const fail=()=>{if(active&&!failed){failed=true;release?.();release=undefined;failure.current();}};
  loadApi().then(YT=>{if(!active||!host.current)return;const slot=document.createElement('div');host.current.replaceChildren(slot);
   player=new YT.Player(slot,{host:'https://www.youtube-nocookie.com',videoId:id,width:'100%',height:'100%',playerVars:{autoplay:1,playsinline:1,rel:0,origin:window.location.origin},events:{onError:fail,onStateChange:(event:{data:number})=>{if(!active)return;if(event.data===1||event.data===3){release??=holdVideoPlayback();}else if(event.data===0||event.data===2){release?.();release=undefined;}},onReady:()=>{const frame=host.current?.querySelector('iframe');if(frame){frame.title=title;frame.referrerPolicy='strict-origin-when-cross-origin';}}}});
  }).catch(fail);
  return()=>{active=false;player?.destroy();release?.();};
 },[id,title]);
 return <div ref={host} style={{width:'100%',aspectRatio:'16 / 9'}}/>;
}
