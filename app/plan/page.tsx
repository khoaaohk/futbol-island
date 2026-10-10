import type {Metadata} from 'next';
import PlanLink from '@/components/idp/PlanLink';
/**
 * /plan (Oct 9 2026, docs/idp/DESIGN.md §4): where IDP QR codes land. Everything it shows comes from the link's #fragment,
 * which the browser never sends to the server: a coach's goal ("Add to my plan", saved on this device) or a week's plan for
 * a grown-up's phone (read-only). Static and prerendered; no personal data is received, stored or logged by this route.
 */
export const metadata:Metadata={title:'Football plan · Futbol Island',description:'A coach’s goal or this week’s football plan, opened from a QR code.',robots:{index:false,follow:false}};
export default function PlanPage(){return <PlanLink/>;}
