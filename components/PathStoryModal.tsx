'use client';
import {useEffect,useRef} from 'react';
import {type StoryId} from '@/lib/paths/stories';
import UpcomingStory from './UpcomingStory';
import type {StoryOrigin} from './StoryFilmPlayer';
import store from './IslandStore.module.css';

const STORY_META:Record<StoryId,{id:StoryId;title:string;theme:string}>={
 reset:{id:'reset',title:'Mental Toughness',theme:'Finding your next useful action'},loss:{id:'loss',title:'After the Final Whistle',theme:'Handling a loss'},empathy:{id:'empathy',title:'Emotional Intelligence',theme:'Noticing feelings and responding with care'},
 futsl:{id:'futsl',title:'Love Futsl',theme:'Smaller court. Bigger game.'},regulate:{id:'regulate',title:'Regulating emotions',theme:'When the game feels unfair.'},grit:{id:'grit',title:'Grit',theme:'Roots before fruit'}};
type Props={storyId:StoryId;onClose:()=>void;onFinish:()=>void;embedded?:boolean;origin?:StoryOrigin};
/** Every path story is a riso print (lib/paths/riso/stories/<id>.ts) played by StoryFilmPlayer through UpcomingStory.
 * Embedded inside the paths dialog it renders in place; standalone it opens its own <dialog>. */
export default function PathStoryModal({storyId,onClose,onFinish,embedded=false,origin}:Props){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(embedded)return;const node=dialog.current;node?.showModal();return()=>node?.close();},[embedded]);
 const content=<UpcomingStory key={storyId} story={STORY_META[storyId]} origin={origin} onClose={completed=>completed?onFinish():onClose()}/>;
 return embedded?content:<dialog ref={dialog} className={store.dialog} aria-label={STORY_META[storyId].title} onCancel={event=>{event.preventDefault();onClose();}}>{content}</dialog>;
}
