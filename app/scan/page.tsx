import CoachLiveDock from '@/components/coach/LiveDock';
import ScanApp from '@/components/scan/ScanApp';
/** /scan: one static page; everything happens in the client component (settings and scores stay on the device). */
export const dynamic='force-static';
/* the coach app's mini live bar when a game is on the clock (components/coach/LiveDock.tsx; only when opened from the coach app) */
export default function ScanPage(){return <><ScanApp/><CoachLiveDock/></>;}
