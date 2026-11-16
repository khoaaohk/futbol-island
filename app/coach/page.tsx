import CoachApp from '@/components/coach/CoachApp';
import {SHAPES} from '@/lib/site/tools/shapes';
/** /coach: one static page; everything happens in the client component (the team is on the device, never on a server). */
export const dynamic='force-static';
export default function CoachPage(){return <CoachApp shapes={SHAPES}/>;}
