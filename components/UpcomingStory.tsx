'use client';
import {useEffect,useState,useRef,useCallback} from 'react';
import {loadRisoStory} from '@/lib/paths/riso/registry';
import type {RisoStory} from '@/lib/paths/riso/story';
import StoryFilmPlayer,{type StoryOrigin} from './StoryFilmPlayer';
import {DoneButton} from './DoneButton';
import styles from './StoryFilmPlayer.module.css';
type Story={id:string;title:string;theme:string};
/** Loads the riso print for a story id (lib/paths/riso/stories/<id>.ts, dynamic import) and plays it; shows a paper loading card meanwhile. */
export default function UpcomingStory({story,onClose,origin}:{story:Story;onClose:(completed:boolean)=>void;origin?:StoryOrigin}){
 const completed=useRef(false),markComplete=useCallback(()=>{completed.current=true;},[]);
 const dismiss=()=>onClose(completed.current);
 const loadingRoot=useRef<HTMLDivElement>(null);
 const[loaded,setLoaded]=useState<RisoStory|null>(null),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let cancelled=false;completed.current=false;setFailed(false);setLoaded(null);
  loadRisoStory(story.id).then(value=>{if(!cancelled)setLoaded(value);}).catch(()=>{if(!cancelled)setFailed(true);});
  return()=>{cancelled=true;};},[story.id,retry]);
 useEffect(()=>{const node=loadingRoot.current;if(!node)return;const previous=document.activeElement as HTMLElement|null;const others=Array.from(node.parentElement?.children??[]).filter(child=>child!==node) as HTMLElement[],inert=others.map(child=>child.inert);others.forEach(child=>child.inert=true);node.querySelector<HTMLButtonElement>('button')?.focus();return()=>{others.forEach((child,i)=>child.inert=inert[i]);previous?.focus?.({preventScroll:true});};},[loaded]);
 if(loaded&&loaded.id===story.id)return <StoryFilmPlayer key={loaded.id} story={loaded} origin={origin} onClose={dismiss} onComplete={markComplete}/>;
 return <div ref={loadingRoot} className={styles.film} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();dismiss();}if(e.key==='Tab'){const items=e.currentTarget.querySelectorAll<HTMLButtonElement>('button'),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}} data-story-view role="dialog" aria-modal="true" aria-label={story.title}><div className={styles.status}><div><h2>{story.title}</h2><p role="status">{failed?'The story couldn’t load. Try again.':'Getting your story ready…'}</p>{failed&&<button className={styles.control} onClick={()=>setRetry(n=>n+1)}>Try again</button>}<DoneButton onDone={dismiss}/></div></div></div>;
}
