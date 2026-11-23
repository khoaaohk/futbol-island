import CoachApp from '@/components/coach/CoachApp';
import {SHAPES} from '@/lib/site/tools/shapes';
import {coachPlansVersion} from '@/lib/coach/plansData';
/** /coach: one static page; everything happens in the client component (the team is on the device, never on a server). The
 *  practice plans load on demand from /coach/plans-data (lib/coach/plansData.ts); the version busts the app's cache-first SW. */
export const dynamic='force-static';
export default function CoachPage(){return <CoachApp shapes={SHAPES} plansVersion={coachPlansVersion()}/>;}
