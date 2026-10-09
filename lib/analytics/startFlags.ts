/**
 * Start flags (Oct 9 2026): read ONCE when a session starts (components/VisitTracker.tsx passes this to the tracker), from
 * saves the game already keeps on this device, and reduced to four small buckets (countIds.ts StartFlags). Nothing is written,
 * nothing finer leaves the tab: not which lessons, not how many exactly, not when.
 *
 *   p  lessons completed (THE path rule: every quiz question answered right on this device) 0 / 1–3 / 4–11 / 12+
 *   g  graduations: none / one format / two or three / all four / all four + the Matchday Ferry final
 *   s  settings bits: 1 sound muted, 2 music off, 4 lesson voice off, 8 controls flipped
 *   v  coach voice (index into the fixed COACH_VOICE_IDS list)
 *
 * Deliberately NOT read: the last-visit day (lib/town/welcomeBack.ts) or anything else that would tell a returning visitor
 * apart. That needs grown-ups wording and an opt-out first (docs/analytics-roadmap.md #6).
 * The keys are the game's own (tests/admin-analytics-learning.cjs checks they still match the code that writes them).
 */
import {COACH_VOICE_IDS,LEARN_FORMATS,gradBand,lessonInfo,progressBand,type StartFlags} from './countIds';
import {LESSON_TABLE} from './learningIds.generated';

export const FLAG_KEYS={quiz:'futbol-island-quiz-progress-v1',graduations:'fi2-graduations-v1',soundMuted:'fi2-sound-muted',music:'fi2-music-enabled',
 voice:'fi2-voice-enabled',controls:'fi2-controls-flipped',coach:'fi2-coach-voice'} as const;

export function readStartFlags(storage:Pick<Storage,'getItem'>|null):StartFlags|null{
 if(!storage)return null;
 const get=(k:string)=>{try{return storage.getItem(k);}catch{return null;}};
 const out:StartFlags={};
 try{
  const raw=JSON.parse(get(FLAG_KEYS.quiz)||'[]'),answered=new Set(Array.isArray(raw)?raw.filter((x:unknown)=>typeof x==='string'):[]);
  let complete=0;
  for(const [format,id] of LESSON_TABLE){const n=lessonInfo(id)?.options.length||0;if(n&&Array.from({length:n},(_,i)=>answered.has(`${format}:${id}:${i}`)).every(Boolean))complete++;}
  out.p=progressBand(complete);
 }catch{out.p=0;}
 try{
  const g=JSON.parse(get(FLAG_KEYS.graduations)||'null'),formats=g&&typeof g.formats==='object'&&g.formats?LEARN_FORMATS.filter(f=>g.formats[f]).length:0;
  out.g=gradBand(formats,!!(g&&g.finale));
 }catch{out.g=0;}
 out.s=(get(FLAG_KEYS.soundMuted)==='true'?1:0)|(get(FLAG_KEYS.music)==='false'?2:0)|(get(FLAG_KEYS.voice)==='false'?4:0)|(get(FLAG_KEYS.controls)==='true'?8:0);
 out.v=Math.max(0,COACH_VOICE_IDS.findIndex(([id])=>id===get(FLAG_KEYS.coach)));
 return out;
}
