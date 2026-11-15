/**
 * Welcome-back HOOKS (Nov 14 2026, docs/welcome-suggestions.md): a small provider registry. Each interest registers providers;
 * a provider reads plain facts (WelcomeFacts, gathered once from the local save by facts.ts) and returns hooks, each one line
 * for the Welcome back note plus what a tap does. Pure (tests): no storage, no React, no catalogues.
 *
 * Priority tiers (higher wins): almost done (4) > about to be lost (3) > new since last visit (2) > right time (1) > evergreen (0).
 * Copy rules: short, plain, kid-friendly; one line; it says what the tap does ("Tap to go fishing").
 */
import type {Interest} from './tally';

export const TIER={almost:4,losing:3,fresh:2,time:1,evergreen:0} as const;
export type Tier=typeof TIER[keyof typeof TIER];

import {WELCOME_KINDS,type WelcomeKind} from './kinds';
export {WELCOME_KINDS,type WelcomeKind};

/** What a tap does, through the game's existing events and navigation (components/WelcomeBack.tsx actWelcome). */
export type WelcomeAction=
 |{to:'fish';
  /** Shore spot ids of the fish the line names (fish of the day, the visitor, a sunset fish): travel there, not the nearest. */
  spots?:readonly string[]}
 |{to:'paths';format:string}
 |{to:'lesson';format:string;lessonId:string}
 |{to:'arcade';game:string;today:boolean;/** Nov 15 2026: an elite tier to open on (runner cup / legend, pinball derby / final). */mode?:string}
 |{to:'shop'};
export type WelcomeHook={kind:WelcomeKind;interest:Interest;tier:Tier;line:string;action:WelcomeAction};

/** Plain facts read from this device's save (facts.ts). Every field is optional: a provider without its facts returns nothing. */
export type LessonFact={format:string;lessonId:string;name:string;minutes:number};
export type WelcomeFacts={
 weekend?:boolean;
 fishing?:{species:number;nearSet:{title:string;left:number}|null;
  // From lib/town/fishing/comeback.ts (facts.ts fishingFacts): `spots` / `spot` are shore spot ids a tap travels to.
  fishOfDay?:{name:string;spots?:readonly string[]}|null;visitorLeaving?:{name:string;days:number;spot?:string}|null;sunsetSpot?:{name:string;spot?:string}|null};
 lessons?:{next:LessonFact|null;pathTitle:string;leftInPath:number;streak:number;lessonToday:boolean;
  /** The passing lesson behind Pass Puzzles, in the player's path (cross nudge for arcade fans). */
  passing:LessonFact|null};
 arcade?:{fav:{game:string;name:string}|null;challenge:{game:string;name:string;line:string;done:boolean}|null;weekDays:number;pennantLit:boolean;
  /** Nov 14 2026: the most recent cabinet whose last run fell just short of its best (lib/arcade/lastScore.ts nearBest). */
  near?:{game:string;name:string;score:number;best:number;/** Nov 15 2026: a daily run or elite tier ("Daily Run"), its tap. */label?:string;mode?:string;today?:boolean}|null};
 kit?:{news:{line:string}|null;visited:boolean};
};

export type HookProvider=(f:WelcomeFacts)=>WelcomeHook[];
const providers=new Map<Interest,HookProvider[]>();
/** Register a provider for an interest (several per interest are fine; their hooks are merged). */
export function registerHooks(interest:Interest,p:HookProvider){providers.set(interest,[...(providers.get(interest)??[]),p]);}
/** Every hook an interest offers for these facts, best tier first. */
export function hooksFor(interest:Interest,f:WelcomeFacts):WelcomeHook[]{
 return (providers.get(interest)??[]).flatMap(p=>{try{return p(f);}catch{return [];}}).sort((a,b)=>b.tier-a.tier);
}

const mins=(n:number)=>`${Math.max(1,Math.round(n))} min`;
const plural=(n:number,w:string)=>`${n} ${w}${n===1?'':'s'}`;
const SMALL=new Set(['and','or','of','on','the','a','in']);
/** A Fishbook set title as it reads in a sentence: "Every shark" → "Every Shark", "The shared ten" → "Shared Ten". */
export function setName(title:string):string{
 const w=title.trim().replace(/^the\s+/i,'').split(/\s+/).filter(Boolean);
 return w.map((x,i)=>i>0&&SMALL.has(x.toLowerCase())?x.toLowerCase():x.charAt(0).toUpperCase()+x.slice(1)).join(' ').replace(/\s+set$/i,'');
}
const spotAct=(ids:readonly (string|undefined)[]|undefined):WelcomeAction=>{const spots=(ids??[]).filter((x):x is string=>!!x);return spots.length?{to:'fish',spots}:{to:'fish'};};

// ---- Fishing (Fishbook sets + the comeback.ts picks, gathered by facts.ts) ----
registerHooks('fishing',f=>{
 const x=f.fishing;if(!x)return [];const out:WelcomeHook[]=[];
 if(x.nearSet&&x.nearSet.left>0&&x.nearSet.left<=3)out.push({kind:'fish_set',interest:'fishing',tier:TIER.almost,action:{to:'fish'},
  line:`${x.nearSet.left} more fish to finish your ${setName(x.nearSet.title)} set!`});
 if(x.visitorLeaving)out.push({kind:'fish_visitor',interest:'fishing',tier:TIER.losing,action:spotAct([x.visitorLeaving.spot]),
  line:`The ${x.visitorLeaving.name} leaves in ${plural(x.visitorLeaving.days,'day')}. Tap to go fishing`});
 if(x.fishOfDay)out.push({kind:'fish_day',interest:'fishing',tier:TIER.fresh,action:spotAct(x.fishOfDay.spots),line:`Fish of the day: ${x.fishOfDay.name}! Tap to go fishing`});
 if(x.sunsetSpot)out.push({kind:'fish_sunset',interest:'fishing',tier:TIER.time,action:spotAct([x.sunsetSpot.spot]),line:`Sunset fish bite at ${x.sunsetSpot.name}. Tap to go fishing`});
 out.push({kind:'fish_go',interest:'fishing',tier:TIER.evergreen,action:{to:'fish'},line:'Fish are biting today. Tap here to go fishing!'});
 return out;
});

// ---- Lessons / Paths ----
registerHooks('lessons',f=>{
 const x=f.lessons;if(!x||!x.next)return [];const n=x.next,out:WelcomeHook[]=[],act={to:'paths' as const,format:n.format};
 if(x.leftInPath===1)out.push({kind:'lesson_grad',interest:'lessons',tier:TIER.almost,action:act,line:`1 lesson to graduate ${x.pathTitle}! Next up: ${n.name}`});
 if(x.streak>=2&&!x.lessonToday)out.push({kind:'lesson_streak',interest:'lessons',tier:TIER.losing,action:act,line:`Next up: ${n.name} (${mins(n.minutes)}). Keep your ${x.streak}-day streak!`});
 if(f.weekend&&x.leftInPath>=2)out.push({kind:'lesson_weekend',interest:'lessons',tier:TIER.time,action:act,line:`Weekend! Try two lessons today. Next up: ${n.name}`});
 out.push({kind:'lesson_next',interest:'lessons',tier:TIER.evergreen,action:act,line:`Next up: ${n.name} (${mins(n.minutes)}). Tap to start`});
 return out;
});

// ---- Arcade ----
registerHooks('arcade',f=>{
 const x=f.arcade;if(!x)return [];const out:WelcomeHook[]=[],c=x.challenge;
 if(c&&!c.done&&!x.pennantLit&&x.weekDays===2)out.push({kind:'arcade_pennant',interest:'arcade',tier:TIER.almost,action:{to:'arcade',game:c.game,today:true},
  line:'1 more day for this week’s arcade pennant! Tap for today’s challenge'});
 // Nov 14 2026 (retention): "almost your best". The last run fell just short (within 30%, lastScore.ts): a concrete number to beat.
 // Nov 15 2026: daily runs and elite tiers against their own best ("Your last Daily Run was 300, …"), the tap opens that mode.
 const n=x.near;if(n&&n.best>n.score&&n.score>0)out.push({kind:'arcade_near',interest:'arcade',tier:TIER.almost,action:{to:'arcade',game:n.game,today:!!n.today,...(n.mode?{mode:n.mode}:{})},
  line:`Your last ${n.label??`${n.name} score`} was ${n.score.toLocaleString('en-US')}, ${(n.best-n.score).toLocaleString('en-US')} off your best! Tap to beat it`});
 if(c&&!c.done)out.push({kind:'arcade_daily',interest:'arcade',tier:TIER.fresh,action:{to:'arcade',game:c.game,today:true},line:`New today in ${c.name}: ${c.line.replace(/\.$/,'')}. Tap to play`});
 if(x.fav)out.push({kind:'arcade_go',interest:'arcade',tier:TIER.evergreen,action:{to:'arcade',game:x.fav.game,today:false},line:`${x.fav.name} is waiting in the arcade. Tap to play`});
 return out;
});

// ---- Kit Shop ----
registerHooks('kit',f=>{
 const x=f.kit;if(!x)return [];const out:WelcomeHook[]=[];
 if(x.news)out.push({kind:'kit_news',interest:'kit',tier:TIER.fresh,action:{to:'shop'},line:x.news.line});
 out.push({kind:'kit_design',interest:'kit',tier:TIER.evergreen,action:{to:'shop'},line:x.visited?'Make your next kit in the Kit Shop. Tap to go':'Design your own kit in the Kit Shop. Tap to go'});
 return out;
});
// Roaming has no hooks of its own: an explorer gets the cross nudge (fishing) and the rotation.

/** The cross-interest nudge for a fan of `top`: linked to what they love (about 1 in 5 visits, picker.ts). */
export function crossHook(top:Interest,f:WelcomeFacts):WelcomeHook|null{
 const L=f.lessons,A=f.arcade;
 switch(top){
  case 'fishing':return L?.next?{kind:'cross_fish_lesson',interest:'lessons',tier:TIER.evergreen,action:{to:'paths',format:L.next.format},
   line:`Every fish has a football fact. Learn more: ${L.next.name} (${mins(L.next.minutes)})`}:null;
  case 'arcade':return L?.passing?{kind:'cross_arcade_lesson',interest:'lessons',tier:TIER.evergreen,action:{to:'lesson',format:L.passing.format,lessonId:L.passing.lessonId},
   line:`Pass Puzzles fan? Try the passing lesson: ${L.passing.name}`}:null;
  case 'lessons':return A?{kind:'cross_lesson_arcade',interest:'arcade',tier:TIER.evergreen,action:{to:'arcade',game:'puzzle',today:true},
   line:'Try your passing in today’s Pass Puzzle. Tap to play'}:null;
  case 'roam':return {kind:'cross_roam_fish',interest:'fishing',tier:TIER.evergreen,action:{to:'fish'},line:'Exploring? Fish bite all round the island. Tap to go fishing'};
  case 'kit':return A?{kind:'cross_kit_arcade',interest:'arcade',tier:TIER.evergreen,action:{to:'arcade',game:'kitrush',today:false},
   line:'Show off your kit in Kit Rush. Tap to play'}:null;
 }
}
