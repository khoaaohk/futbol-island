'use client';
import {useEffect,useState} from 'react';
import {timelineOrder} from '@/lib/endgame/museum';
import Experience from '@/components/museum/experiences/timeline/Experience';
/**
 * The timeline wall is not one exhibit, so the shared Lab helper (which looks its id up in EXHIBITS) can't mount it. This does the
 * same with the first case on the timeline as `exhibit` (?start=<exhibit id> starts elsewhere). Visit/enter/close only log here.
 */
export default function TimelineLab(){
 const [start,setStart]=useState<string|null|undefined>(undefined);
 useEffect(()=>{setStart(new URLSearchParams(window.location.search).get('start'));},[]);
 if(start===undefined)return null;
 const order=timelineOrder(),exhibit=order.find(e=>e.id===start)??order[0];
 return <Experience exhibit={exhibit} earned={[]} openCertificate={id=>console.info('certificate',id)} onClose={()=>console.info('close')}
  onVisit={id=>{console.info('visit',id);(window as unknown as {__tlVisit?:string}).__tlVisit=id;}}
  onEnter={id=>{console.info('enter',id);(window as unknown as {__tlEnter?:string}).__tlEnter=id;}} onComplete={()=>console.info('complete')}/>;
}
