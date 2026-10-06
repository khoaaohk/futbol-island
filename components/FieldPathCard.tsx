'use client';
/**
 * The HUD pitch card (Town's focus slot near a pitch). Clear path (Oct 4 2026, user): it starts or continues this pitch's Paths
 * lesson, the same lesson Paths' landing card and onboarding point at, and says so ("Start lesson 1"). Before, "Learn 7v7 Plays"
 * opened the live Plays viewer with no prompt. A pitch whose path is finished keeps the free Plays viewer ("Watch 7v7 plays").
 * Town's HUD loop still owns `hidden`/`disabled`/`tabIndex` (set on the DOM); React only renders the label.
 */
import {useEffect,useState} from 'react';
import {Icon} from './Icon';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {continueAction,pitchCardTarget} from '@/lib/paths/pathContinue';
import {launchPathLesson,readLastOpened} from '@/lib/paths/pathLaunch';
import type {Venue} from '@/lib/town/venues';
export default function FieldPathCard({venue,onPlays,onLaunch}:{venue:Pick<Venue,'id'|'name'>;onPlays:()=>void;onLaunch?:()=>void}){
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),steps=new Set(evidence.steps);
 // The last-opened lesson lives in localStorage: read it only after mount so the server and first client render agree.
 const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
 const target=pitchCardTarget(venue.id,steps,answers,mounted?readLastOpened():{}),say=target?continueAction(target):null;
 const format=venue.id==='futsal'?'Futsal':venue.id;
 return <button data-tour="plays" data-field={venue.id} data-field-lesson={target?.lesson.id} className="meet-coach field-learn-card" data-hud-slot="focus" hidden
  aria-label={say?`${venue.name}, ${format} path: ${say.action}, ${say.name}`:`${venue.name}: watch ${format} plays`}
  onClick={()=>{if(target)launchPathLesson(venue.id,target.lesson,steps,answers);else onPlays();onLaunch?.();}}>
  <span>{venue.name.toUpperCase()} · {say?`${format.toUpperCase()} PATH`:'FREE PLAY'}</span>
  <strong>{say?say.action:<>Watch <span className="field-format">{format}</span> plays</>}</strong>
  <span className="field-go" aria-hidden="true">Go <Icon name="arrow"/></span>
 </button>;
}
