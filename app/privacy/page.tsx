import type {Metadata} from 'next';
import {pageMeta} from '@/lib/site/seo';
import PrivacyPolicy from '@/components/privacy/PrivacyPolicy';
import styles from './privacy.module.css';

/**
 * /privacy: the online notice for Futbol Island. The text lives in components/privacy/PrivacyPolicy.tsx (shared with the title screen's
 * Privacy sheet), which documents the COPPA notice, retention policy (12 months for unused saves) and security program.
 */
// pageMeta (Nov 3 2026 bug hunt): its own og:url / og:title / twitter tags; it inherited the home page's og:url before.
export const metadata:Metadata=pageMeta('Privacy','What Futbol Island keeps, why, and for how long. No accounts, no ads, no chat.','/privacy',{type:'website'});

import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function PrivacyPage(){
 preloadIslandBrush();
 return <main className={styles.page}><div className={styles.wrap}>
  <a className={styles.back} href="/play">Back to the island</a>
  <h1>Privacy policy</h1>
  <PrivacyPolicy/>
 </div></main>;
}
