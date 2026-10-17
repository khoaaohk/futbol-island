'use client';
import Donate from '../landing/Donate';
import styles from '../landing/Title.module.css';
import {GROWN_UPS as G,WSV_LINKS} from '@/lib/site/aboutCopy';

/**
 * "For grown-ups" content, shared by the title screen's sheet (components/landing/GrownUps.tsx) and the game's Settings → About panel
 * (components/IslandSettings.tsx), so both always say the same thing (user, Oct 9 2026). data-track ids count only while the title screen shows.
 * Privacy: the title screen opens its Privacy sheet (onOpenPrivacy); the game links to /privacy in a new tab.
 * The words live in lib/site/aboutCopy.ts (Oct 16 2026), shared with the static /about page.
 */
export default function AboutGrownUps({onOpenPrivacy,donateReturn}:{onOpenPrivacy?:()=>void;donateReturn:'start'|'about'}){
 const [wsv,ig]=WSV_LINKS;
 return <div className={styles.grownInner}>
  <h3>{G.whyTitle}</h3>
  <p>{G.why}</p>
  <h3>{G.learnsTitle}</h3>
  <p>{G.learns}</p>
  <h3>{G.privacyTitle}</h3>
  <p>{G.privacy} {onOpenPrivacy
   ?<button type="button" className={styles.inlineLink} data-track="sg:privacy" onClick={onOpenPrivacy}>{G.privacyLink}</button>
   :<a href="/privacy" target="_blank" rel="noopener noreferrer">{G.privacyLink}</a>}.</p>
  <p className={styles.grownFree}>{G.free}</p>
  <p>{G.freeWhy}</p>
  <h3>{G.partnerTitle}</h3>
  <p>{G.partnerLead}<b>{G.partnerName}</b>{G.partnerRest}</p>
  <p className={styles.partnerLinks}><a href={wsv.href} data-track="sg:wsv" target="_blank" rel="noopener noreferrer">{wsv.label}</a><a href={ig.href} data-track="sg:instagram" target="_blank" rel="noopener noreferrer">{ig.label}</a></p>
  <h3>{G.nonprofitsTitle}</h3>
  <Donate returnTo={donateReturn}/>
 </div>;
}
