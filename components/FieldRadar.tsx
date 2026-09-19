'use client';
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import {quizOutcomeStep,lessonPositions,type FieldSession} from '@/lib/town/formatLessons';
import type {LiveMatchView} from '@/lib/town/fieldRuntime';
import {IslandMapFrame} from './IslandMapFrame';
export default function FieldRadar({session,readMatch,open:controlledOpen,onOpenChange}:{open?:boolean;onOpenChange?:(open:boolean)=>void;session:MutableRefObject<FieldSession|null>;readMatch?:()=>LiveMatchView|null}){
 const [localOpen,setLocalOpen]=useState(false),[mounted,setMounted]=useState(false);
 const open=controlledOpen??localOpen,setOpen=(next:boolean)=>{setLocalOpen(next);onOpenChange?.(next);};
 useEffect(()=>{if(open){setMounted(true);return;}const timer=setTimeout(()=>setMounted(false),240);return()=>clearTimeout(timer);},[open]);
 const markers=useRef<SVGGElement>(null),ball=useRef<SVGCircleElement>(null),reader=useRef(readMatch);reader.current=readMatch;
 useEffect(()=>{
  if(!mounted)return;let frame=0,last=0;const nodes=new Map<string,SVGCircleElement>();
  const update=(now:number)=>{frame=requestAnimationFrame(update);if(document.hidden||now-last<1000/30)return;last=now;
   const s=session.current;let players:{id:string;x:number;y:number;home:boolean}[]=[],ballPoint:{x:number;y:number}|undefined;
   if(s){const q=s.quiz?s.lesson.questions[s.question]:undefined,outcome=quizOutcomeStep(s),poses=lessonPositions(s.lesson,outcome??s.step,outcome!==undefined&&outcome!==null?s.outcomeProgress??0:s.progress);players=[...s.lesson.offense.map(p=>({...p,home:true})),...s.lesson.defense.map(p=>({...p,home:false}))].map(p=>({...p,...poses.positions.get(p.id)!}));ballPoint=poses.ball;}
   else{const view=reader.current?.();players=view?.players??[];ballPoint=view?.ball;}
   const active=new Set<string>();for(const p of players){active.add(p.id);let node=nodes.get(p.id);if(!node){node=document.createElementNS('http://www.w3.org/2000/svg','circle');node.setAttribute('r','1.8');nodes.set(p.id,node);markers.current?.appendChild(node);}node.setAttribute('fill',p.home?'#efbb54':'#609de3');node.setAttribute('cx',String(29+p.x/270*42));node.setAttribute('cy',String(8+p.y/400*84));}
   for(const [id,node] of nodes){if(!active.has(id)){node.remove();nodes.delete(id);}}
   if(ball.current){ball.current.style.display=ballPoint?'':'none';if(ballPoint){ball.current.setAttribute('cx',String(29+ballPoint.x/270*42));ball.current.setAttribute('cy',String(8+ballPoint.y/400*84));}}
  };frame=requestAnimationFrame(update);return()=>{cancelAnimationFrame(frame);nodes.forEach(node=>node.remove());};
 },[session,mounted]);
 return <div style={{marginLeft:'auto',position:'relative'}}><button aria-label={open?"Hide pitch radar":"Show pitch radar"} aria-expanded={open} onClick={()=>setOpen(!open)}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{open?<path d="M5 12h14"/>:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m12 12 6-6"/><circle cx="8" cy="16" r="1" fill="currentColor"/></>}</svg></button>{mounted&&<IslandMapFrame open={open}><svg viewBox="22 0 56 100" role="img" aria-label="Player and ball positions"><rect x="29" y="8" width="42" height="84" fill="none" stroke="#f4edcd88" strokeWidth=".7"/><path d="M29 50h42M38 8v13h24V8M38 92V79h24v13" fill="none" stroke="#f4edcd88" strokeWidth=".6"/><circle cx="50" cy="50" r="8" fill="none" stroke="#f4edcd88" strokeWidth=".6"/><g ref={markers}/><circle ref={ball} r="2.1" fill="#fff8dd" stroke="#294f43" strokeWidth=".6"/></svg></IslandMapFrame>}</div>;
}
