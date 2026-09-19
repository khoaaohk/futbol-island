import {useEffect,useRef} from 'react';
import type {StoryId} from '@/lib/paths/stories';
import {createHandDrawnStoryGame} from '@/lib/paths/handDrawnStoryGame';
import styles from './PathStoryModal.module.css';
export default function PathStoryScene({id,page,playing}:{id:Exclude<StoryId,'futsl'>;page:number;playing:number}){
 const canvas=useRef<HTMLCanvasElement>(null),game=useRef<ReturnType<typeof createHandDrawnStoryGame>|null>(null);
 useEffect(()=>{if(!canvas.current)return;const instance=createHandDrawnStoryGame(canvas.current,id);game.current=instance;return()=>{instance.dispose();game.current=null;};},[id]);
 useEffect(()=>{game.current?.act(page);},[page,playing]);
 return <div className={styles.illustratedScene} data-scene={id}><canvas ref={canvas} className={styles.storyCanvas} role="img" aria-label="Hand-drawn animated futbol story scene"/></div>;
}
