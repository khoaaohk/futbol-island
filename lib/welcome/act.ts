/**
 * What a tap on the Welcome back suggestion does (Nov 14 2026, docs/welcome-suggestions.md), through the game's EXISTING events:
 * fishing → fishingReach's Go fishing (travel to the named fish's spot, else the nearest); Paths → the endgame "open Paths on a format" event (Paths opens
 * on its Continue card, the next lesson); one lesson → the Paths launch event; the arcade / the Kit Shop → WELCOME_GO, which Town
 * turns into its own Enter door (the same departure save and fade), with `?game=<cabinet>&today=1` for today's challenge.
 */
import type {WelcomeAction} from './hooks';
import {requestGoFishing} from '../town/fishing/fishingReach';
import {countGoFishing} from '../analytics/fishingEvents';
import {ENDGAME_OPEN} from '../endgame/graduationStore';
import {FORMAT_PATH_LAUNCH} from '../paths/formatPaths';
import {PATHS_IN_ORDER,pathLaunchDetail} from '../paths/pathContinue';

export const WELCOME_GO='fi2-welcome-go';
export type WelcomeGo={to:'arcade'|'shop';query?:string};
/** The arcade page's query for a cabinet (and today's challenge). Pure. */
export const arcadeQuery=(game:string,today:boolean)=>`?game=${encodeURIComponent(game)}${today?'&today=1':''}`;
const send=(name:string,detail:unknown)=>{try{window.dispatchEvent(new CustomEvent(name,{detail}));}catch{/* no window */}};

export function actWelcome(a:WelcomeAction,steps:ReadonlySet<string>,answers:ReadonlySet<string>){
 switch(a.to){
  case 'fish':countGoFishing('welcome');requestGoFishing(a.spots);return;
  case 'paths':send(ENDGAME_OPEN,{target:'paths',format:a.format});return;
  case 'lesson':{const p=PATHS_IN_ORDER.find(x=>x.format===a.format),l=p&&[...p.chapters.flatMap(c=>c.lessons),...p.depth].find(x=>x.id===a.lessonId);
   if(p&&l)send(FORMAT_PATH_LAUNCH,pathLaunchDetail(p.format,l,steps,answers));else send(ENDGAME_OPEN,{target:'paths',format:a.format});return;}
  case 'arcade':send(WELCOME_GO,{to:'arcade',query:arcadeQuery(a.game,a.today)} satisfies WelcomeGo);return;
  case 'shop':send(WELCOME_GO,{to:'shop'} satisfies WelcomeGo);return;
 }
}
