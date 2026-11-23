import CoachLiveDock from '@/components/coach/LiveDock';
import BoardApp from '@/components/coaches-board/BoardApp';
/** /board: one static page; the board is a client component (plays stay on the device). */
export const dynamic='force-static';
/* the coach app's mini live bar when a game is on the clock (components/coach/LiveDock.tsx; only when opened from the coach app) */
export default function BoardPage(){return <><BoardApp/><CoachLiveDock/></>;}
