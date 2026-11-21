'use client';
import {useEffect,useState} from 'react';
import {NavigationButton} from '@/components/DoneButton';
/**
 * The rail's Back button (owner, Nov 20 2026: "the back btns need to animate like our game back btns"): the game's own
 * NavigationButton, as a real link. A plain click folds the word into the arrow and then goes to the level above; with JS off,
 * or on a Cmd/Ctrl/middle click, it is an ordinary link. When the page comes back from the back/forward cache the button is
 * remounted, so it is never left folded or faded.
 */
export default function RailBack({href,name,es=false}:{href:string;name:string;es?:boolean}){
 const [k,setK]=useState(0);
 useEffect(()=>{const f=(e:PageTransitionEvent)=>{if(e.persisted)setK(x=>x+1);};window.addEventListener('pageshow',f);return()=>window.removeEventListener('pageshow',f);},[]);
 return <NavigationButton key={k} back href={href} label={es?'Volver':'Back'} title={`${es?'Volver a':'Back to'} ${name}`} onNavigate={()=>{window.location.assign(href);}}/>;
}
