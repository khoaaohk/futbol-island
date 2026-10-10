import type {Metadata} from 'next';
import PrivacyPolicy from '@/components/privacy/PrivacyPolicy';
import styles from './privacy.module.css';

/**
 * /privacy: the online notice for Futbol Island. The text lives in components/privacy/PrivacyPolicy.tsx (shared with the title screen's
 * Privacy sheet), which documents the COPPA notice, retention policy (12 months for unused saves) and security program.
 */
export const metadata:Metadata={title:'Privacy · Futbol Island',description:'What Futbol Island keeps, why, and for how long. No accounts, no ads, no chat.',alternates:{canonical:'/privacy'}};

export default function PrivacyPage(){
 return <main className={styles.page}><div className={styles.wrap}>
  <a className={styles.back} href="/">Back to the island</a>
  <h1>Privacy policy</h1>
  <PrivacyPolicy/>
 </div></main>;
}
