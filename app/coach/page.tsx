import CoachApp from '@/components/coach/CoachApp';
import {SHAPES} from '@/lib/site/tools/shapes';
import {LESSONS} from '@/lib/site/lessons';
import {esLesson} from '@/lib/i18n/es/lessons';
import type {ShareLesson} from '@/lib/share/teamShare';
/** /coach: one static page; everything happens in the client component (the team is on the device, never on a server). */
export const dynamic='force-static';
/** Lesson titles for "Share the game with your team" (this week's lesson, per format, in both languages): titles only. */
const SHARE_LESSONS:ShareLesson[]=LESSONS.map(l=>[l.format,l.id,l.title,esLesson(l.id)?.title??l.title]);
export default function CoachPage(){return <CoachApp shapes={SHAPES} lessons={SHARE_LESSONS}/>;}
