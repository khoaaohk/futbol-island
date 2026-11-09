import type {Metadata} from 'next';
import {pageMeta} from '@/lib/site/seo';
import PrivacySheetPage from '@/components/privacy/PrivacySheetPage';

/**
 * /privacy: the online notice for Futbol Island, the one privacy page. It looks like the play page's Privacy sheet (same modal shell,
 * Back and brush title); the text lives in components/privacy/PrivacyPolicy.tsx (the COPPA notice, retention policy: 12 months for
 * unused saves, and the security program). Back returns to where the reader came from.
 */
// pageMeta (Nov 3 2026 bug hunt): its own og:url / og:title / twitter tags; it inherited the home page's og:url before.
// Nov 8 2026 (SEO): a title for parents searching for a safe game; "COPPA principles" only here, where the policy says it (section 2).
export const metadata:Metadata=pageMeta('Privacy for Parents: Safe Football Game for Kids','Plain words for parents on what Futbol Island keeps, why and for how long. No ads, no accounts, no open chat. Built with COPPA principles.','/privacy',{type:'website',whole:true});

import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function PrivacyPage(){
 preloadIslandBrush();
 return <PrivacySheetPage/>;
}
