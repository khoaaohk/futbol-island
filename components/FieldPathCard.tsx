'use client';
/**
 * The HUD pitch card (Town's focus slot near a pitch). Clear path (Oct 4 2026, user): it starts or continues this pitch's Paths
 * lesson, the same lesson Paths' landing card and onboarding point at, and says so ("Start lesson 1"). Before, "Learn 7v7 Plays"
 * opened the live Plays viewer with no prompt. A pitch whose path is finished keeps the free Plays viewer ("Watch 7v7 plays").
 * Town's HUD loop still owns `hidden`/`disabled`/`tabIndex` (set on the DOM); React only renders the label.
 * Live-joinable pitches (owner, Nov 4 2026; docs/join-live-game-design.md): the bar holds two buttons, the gold Learn pill
 * (the lesson; hidden when the path has none) and an outlined Play (the side + position picker, lib/town/liveJoinRuntime.ts),
 * so the root is a group, not one big button. Other pitches keep the one-button card with Go.
 */
import {useEffect,useState} from 'react';
import {Icon} from './Icon';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {continueAction,pitchCardTarget} from '@/lib/paths/pathContinue';
import {launchPathLesson,readLastOpened} from '@/lib/paths/pathLaunch';
import type {LiveFormat} from '@/lib/town/venues';
import {joinableFormat} from '@/lib/town/liveJoin';
export default function FieldPathCard({venue,onPlays,onLaunch,onPlay}:{venue:{id:LiveFormat;name:string};onPlays:()=>void;onLaunch?:()=>void;onPlay?:()=>void}){
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),steps=new Set(evidence.steps);
 // The last-opened lesson lives in localStorage: read it only after mount so the server and first client render agree.
 const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
 // The Sharks Beach court (Nov 4 2026) has no lesson path (no beach entry in the quest manifest): its bar is Play only.
 const path=venue.id==='beach'||venue.id==='stadium'?null:venue.id;// the stadium (Nov 12 2026): big matches only, no lessons
 const target=path?pitchCardTarget(path,steps,answers,mounted?readLastOpened():{}):null,say=target?continueAction(target):null;
 const format=venue.id==='futsal'?'Futsal':venue.id==='beach'?'Beach soccer':venue.id==='stadium'?'Big':venue.id;
 const launch=()=>{if(target&&path)launchPathLesson(path,target.lesson,steps,answers,'pitch');else onPlays();onLaunch?.();};
 if(onPlay&&joinableFormat(venue.id))return <div data-tour="plays" data-field={venue.id} data-field-lesson={target?.lesson.id} className="meet-coach field-learn-card" data-hud-slot="focus" data-live-bar="" role="group" hidden
  aria-label={say?`${venue.name}, ${format}: ${say.action}, ${say.name}, or play the match`:`${venue.name}: play the match`}>
  <span>{venue.name.toUpperCase()} · {say?`${format.toUpperCase()} PATH`:`${format.toUpperCase()} MATCH`}</span>
  <strong>{say?say.action:'Join the match'}</strong>
  {say&&<button type="button" className="field-go" data-field-learn="" onClick={launch} title={`Learn: ${say.name}`}>Learn</button>}
  <button type="button" className="field-play" data-join-play="" onClick={onPlay} title="Play · Enter">Play</button>
 </div>;
 return <button data-tour="plays" data-field={venue.id} data-field-lesson={target?.lesson.id} className="meet-coach field-learn-card" data-hud-slot="focus" hidden
  aria-label={say?`${venue.name}, ${format} path: ${say.action}, ${say.name}`:`${venue.name}: watch ${format} plays`}
  onClick={launch}>
  <span>{venue.name.toUpperCase()} · {say?`${format.toUpperCase()} PATH`:'FREE PLAY'}</span>
  <strong>{say?say.action:<>Watch <span className="field-format">{format}</span> plays</>}</strong>
  <span className="field-go" aria-hidden="true">Go <Icon name="arrow"/></span>
 </button>;
}
