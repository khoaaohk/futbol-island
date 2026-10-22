/**
 * The water HUD (P0, Oct 15 2026; docs/swimming-research.md §2.3 "HUD in the water", §6 feedback rounds): while the player is in
 * the sea the island's three action slots become, left to right, the ride switcher (Swim, and Jetpack when there is fuel),
 * Sprint (hold: the fast crawl) and Dive (tap: swim under; tap again, Surface: back up; Oct 19 2026, it replaced Float). Kicking, juggling, walking and the
 * land rides are gone with them (rides stop at the waterline; decision 11). Flying over splashable water the travel button
 * reads "Drop in" (decision 4). Same mechanism as the zipline's ZIP_BUTTONS (lib/town/zipline.ts): JobButton rows the existing
 * JobActionButton renders, a tiny external store written only on changes, and the runtime installs the real `press`.
 *
 * Pure: no three.js, no DOM (tests/water-swim.cjs).
 */
import type {JobButton} from '../jobs/jobMoves';
import type {EntryStyle} from '../../graphics/swimPose';

export type WaterActionId='swimfast'|'dive'|'swimride'|'letgo'|'surface';
/**
 * The ride switcher in the water (user, Oct 15 2026: "don't allow walking, biking, scooter or moped. change icon to swimming and
 * jetpack only"): the ride slot shows the swim icon (the current ride); a tap switches to the only other choice, the jetpack,
 * which takes off straight out of the water: offered only while fuel allows it, otherwise the slot is a swim icon that answers a
 * tap with a hint (aria-disabled, like a job's dead button), never a walk / scooter / bike / moped.
 */
export const RIDE_SWIM:JobButton={slot:'ride',key:'R',id:'swimride',label:'Swimming. Change ride: fly up with the jetpack',icon:'swim',enabled:true};
export const RIDE_SWIM_NO_FUEL:JobButton={slot:'ride',key:'R',id:'swimride',label:'Swimming. The jetpack needs fuel: swim to a beach',icon:'swim',enabled:false};
/** The hint a tap of the fuel-less switcher shows (the job note lane). */
export const SWIM_RIDE_NOTE='The jetpack needs fuel. Swim to a beach, then pick a ride on land.';
/** Space / 1 = Sprint (hold), Q / J / 2 = Dive / Surface (tap; the key Float used), R / E / 3 = the ride switcher (fly up). */
export const SPRINT:JobButton={slot:'shoot',key:'Space',id:'swimfast',label:'Hold to swim faster (front crawl)',icon:'swimfast',hold:true,enabled:true};
export const DIVE_BUTTON:JobButton={slot:'juggle',key:'Q',id:'dive',label:'Dive: a quick dip under the water',icon:'dive',enabled:true};
export const SURFACE_BUTTON:JobButton={slot:'juggle',key:'Q',id:'dive',label:'Swim back up',icon:'surface',enabled:true};
export const DIVE_SHALLOW:JobButton={slot:'juggle',key:'Q',id:'dive',label:'Dive: swim out to deeper water first',icon:'dive',enabled:false};
/** The hint a tap of the greyed Dive shows (the job note lane). */
export const DIVE_SHALLOW_NOTE='Too shallow to dive here. Swim out a little deeper.';
export const WATER_BUTTONS:readonly JobButton[]=[SPRINT,DIVE_BUTTON,RIDE_SWIM_NO_FUEL] as const;
export const WATER_BUTTONS_FLY:readonly JobButton[]=[SPRINT,DIVE_BUTTON,RIDE_SWIM] as const;
/** Swimming in the shallows (Dive greyed) and under water (Surface; Sprint still works), with and without jetpack fuel. */
export const SHALLOW_BUTTONS:readonly JobButton[]=[SPRINT,DIVE_SHALLOW,RIDE_SWIM_NO_FUEL] as const;
export const SHALLOW_BUTTONS_FLY:readonly JobButton[]=[SPRINT,DIVE_SHALLOW,RIDE_SWIM] as const;
export const DIVING_BUTTONS:readonly JobButton[]=[SPRINT,SURFACE_BUTTON,RIDE_SWIM_NO_FUEL] as const;
export const DIVING_BUTTONS_FLY:readonly JobButton[]=[SPRINT,SURFACE_BUTTON,RIDE_SWIM] as const;
/** Wading (ankle to waist deep): Sprint and Dive wait for deeper water; the switcher is the swim icon (the stick walks you out). */
export const WADE_BUTTONS:readonly JobButton[]=[
 {slot:'shoot',key:'Space',id:'swimfast',label:'Swim faster: wade in deeper first',icon:'swimfast',hold:true,enabled:false},
 {slot:'juggle',key:'Q',id:'dive',label:'Dive: wade in deeper first',icon:'dive',enabled:false},
 RIDE_SWIM_NO_FUEL,
] as const;
export const WADE_BUTTONS_FLY:readonly JobButton[]=[WADE_BUTTONS[0],WADE_BUTTONS[1],RIDE_SWIM] as const;
/** Riding a manta or the whale shark (water P1b, lib/town/water/animalRides.ts): the one action is Let go (Space / E / 1 / 3),
 *  icon-only like the other water buttons; the ride slot keeps the swim icon (the ride you go back to), answering a tap with a hint. */
export const RIDE_LET_GO:JobButton={slot:'shoot',key:'Space',id:'letgo',label:'Let go',icon:'letgo',enabled:true};
export const RIDE_HOLDING:JobButton={slot:'ride',key:'R',id:'swimride',label:'Hanging on: let go to swim',icon:'swim',enabled:false};
export const RIDING_BUTTONS:readonly JobButton[]=[RIDE_LET_GO,RIDE_HOLDING] as const;
export const RIDING_NOTE='Hanging on! Tap Let go to swim again.';
/** Diving (water P2, lib/town/water/diveSession.ts): the one action is Surface (Space / 1, and Escape), icon-only; the ride slot keeps
 *  the swim icon (the ride you go back to), answering a tap with a hint. E uses the find in reach (its floating prompt). */
/* The reef room's Surface button was removed Oct 22 2026 (user): holding ▲ at the top surfaces (diveSession.ts DIVE_TOP_SURFACE_S). */
/** Oct 20 2026 (user: "R and the switcher must still take off with the jetpack inside the dive zone"): the ride slot is the same
 *  swim → jetpack switcher as at the surface; with fuel it surfaces at once and flies up, without fuel it answers with the hint. */
/** Calm HUD (Oct 21 2026, user: "bottom right will be the fly btn"): in a room the switcher shows the jetpack (what it does), not the swim. */
export const REEF_FLY:JobButton={...RIDE_SWIM,label:'Fly up with the jetpack',icon:'jetpack'};
export const REEF_FLY_NO_FUEL:JobButton={...RIDE_SWIM_NO_FUEL,label:'Fly: the jetpack needs fuel (swim to a beach)',icon:'jetpack'};
export const REEF_BUTTONS:readonly JobButton[]=[REEF_FLY_NO_FUEL] as const;
export const REEF_BUTTONS_FLY:readonly JobButton[]=[REEF_FLY] as const;
export const REEF_NOTE='Diving! Tap Surface to swim back up.';
export function waterKeyAction(code:string,key:string):WaterActionId|null{
 if(code==='Space'||code==='Digit1'||code==='Numpad1')return 'swimfast';
 const k=key.toLowerCase();if(k==='q'||k==='j'||code==='Digit2'||code==='Numpad2')return 'dive';if(k==='e'||k==='r'||code==='Digit3'||code==='Numpad3')return 'swimride';return null;
}
/** The travel button's label while flying over splashable water (decision 4). */
export const DROP_IN_LABEL='Drop in';
export const DROP_IN_TITLE='Drop in: splash down into the sea here · R';

/**
 * The splash-down's sound (user, Oct 15 2026: "update to splash animation and sound"): a cue per entry style through the island
 * sound's existing event channels (lib/audio/islandSound.ts 'fi2-path-cue' / 'fi2-job-cue', the fishing cues' mechanism in
 * lib/town/fishing/fishingStore.ts), no new audio context, voices or files. Each is [event, detail, delay ms]: the body's thud,
 * the plop, then the spray falling back (longer for a bigger splash). Reduced motion: the same sound (sound is not motion).
 */
export const SPLASH_CUES:Record<EntryStyle,readonly (readonly [string,string,number])[]>={
 // Oct 15 2026 (user: "make the crash landing into water sound more like water"): the synthesized splash in lib/audio/islandSound.ts
 // (jobCue 'splash-soft' / 'splash' / 'splash-big'), a second softer splash as the spray falls back on the bigger entries.
 feet:[['fi2-job-cue','splash-soft',0]],
 belly:[['fi2-job-cue','splash',0],['fi2-job-cue','splash-soft',140]],
 clean:[['fi2-job-cue','splash-big',0],['fi2-job-cue','splash-soft',180]],
};
/** Surfacing after the dip: one small plip for the drips. */
export const SURFACE_CUES:readonly (readonly [string,string,number])[]=[['fi2-path-cue','path-pop',0]];

export type WaterView={
 /** In the sea (wading or swimming): the cluster shows the water actions. */
 inWater:boolean;
 /** Past waist depth: Sprint and Dive are live. */
 swimming:boolean;
 /** Under the water (or on the way): the Dive slot reads Surface. */
 diving:boolean;
 /** Deep enough to dive (waterState canDive); false greys the Dive button. */
 diveOk:boolean;
 /** Flying over water where a drop would splash down: the travel button reads "Drop in". */
 dropIn:boolean;
 /** The jetpack may start (fuel): the ride switcher offers it. */
 flyOk:boolean;
 /** Bumped each time the once-per-device swim lesson should show (components/SwimLessonToast.tsx). */
 lesson:number;
 /** Bumped when sharks start circling: the once-per-device shark lesson (lib/town/water/sharks.ts SHARK_LESSON). */
 sharkLesson:number;
 /** Hanging on to a manta or the whale shark: the cluster is Let go (water P1b). */
 riding:boolean;
 /** Bumped on a first ride: the once-per-device ride lesson (animalRides.ts RIDE_LESSON). */
 rideLesson:number;
 /** Bumped the first time each ray kind is spotted in a visit (seaLifeAreas.ts RAY_LESSONS): the ray lesson toast and its kind. */
 rayLesson:number;rayKind:string|null;
 /** Inside a dive zone's reef room (water P2): the cluster is Surface + the jetpack switcher. */
 reef:boolean;
 /** Bumped on a dive: the once-per-device breath lesson (diveSession.ts DIVE_LESSON). */
 reefLesson:number;
};
const IDLE_VIEW:WaterView={inWater:false,swimming:false,diving:false,diveOk:false,dropIn:false,flyOk:false,lesson:0,sharkLesson:0,riding:false,rideLesson:0,rayLesson:0,rayKind:null,reef:false,reefLesson:0};
let view=IDLE_VIEW;const listeners=new Set<()=>void>();
/**
 * One store and one action hook per page (Oct 19 2026, user: "the swim controls/actions are not showing" while swimming): a dev
 * hot reload of this module made a second store; the island loop (its closure kept the old one) wrote there while the HUD read the
 * new one, so the land cluster showed in the sea and the water buttons pressed a no-op. Both live on globalThis now, so a reloaded
 * module hands back the same objects (production loads the module once: no change there).
 */
const shared=globalThis as {__fiWaterStore?:typeof store;__fiWaterActions?:{press:(id:WaterActionId,phase:'tap'|'down'|'up')=>void}};
const store={
 get:()=>view,server:()=>IDLE_VIEW,
 set(patch:Partial<WaterView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE_VIEW)return;view=IDLE_VIEW;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
};
export const waterStore=shared.__fiWaterStore??=store;
/** The three actions; the island runtime installs the real one while the island is up. */
export const waterActions=shared.__fiWaterActions??={press:(_id:WaterActionId,_phase:'tap'|'down'|'up')=>{}};
/** Which cluster the HUD shows for a view (null = the land cluster). In the water the ride slot is Swim, or Swim → Jetpack with fuel. */
export function waterButtonsFor(v:Pick<WaterView,'inWater'|'swimming'|'flyOk'>&{riding?:boolean;diving?:boolean;diveOk?:boolean;reef?:boolean}):readonly JobButton[]|null{
 if(!v.inWater)return null;
 if(v.reef)return v.flyOk?REEF_BUTTONS_FLY:REEF_BUTTONS;
 if(v.riding)return RIDING_BUTTONS;
 if(!v.swimming)return v.flyOk?WADE_BUTTONS_FLY:WADE_BUTTONS;
 if(v.diving)return v.flyOk?DIVING_BUTTONS_FLY:DIVING_BUTTONS;
 if(v.diveOk===false)return v.flyOk?SHALLOW_BUTTONS_FLY:SHALLOW_BUTTONS;
 return v.flyOk?WATER_BUTTONS_FLY:WATER_BUTTONS;
}
/**
 * The swim lesson (AGENTS.md: every feature teaches football; docs/swimming-research.md §3). A coaching metaphor, labelled as
 * one; shown once per device the first time the player swims (components/SwimLessonToast.tsx, key SWIM_LESSON_KEY).
 */
export const SWIM_LESSON={title:'Pace yourself',text:'Swim smooth and steady: a calm rhythm lasts, like a team keeping its shape all match.',kind:'Coaching idea'} as const;
export const SWIM_LESSON_KEY='fi2-swim-lesson-v1';
