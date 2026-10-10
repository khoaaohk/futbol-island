'use client';
import Donate from '../landing/Donate';
import styles from '../landing/Title.module.css';

/**
 * "For grown-ups" content, shared by the title screen's sheet (components/landing/GrownUps.tsx) and the game's Settings → About panel
 * (components/IslandSettings.tsx), so both always say the same thing (user, Oct 9 2026). data-track ids count only while the title screen shows.
 * Privacy: the title screen opens its Privacy sheet (onOpenPrivacy); the game links to /privacy in a new tab.
 */
export default function AboutGrownUps({onOpenPrivacy,donateReturn}:{onOpenPrivacy?:()=>void;donateReturn:'start'|'about'}){
 return <div className={styles.grownInner}>
  <h3>Why we built Futbol Island</h3>
  <p>Many young players learn best by seeing it. Yet a lot of the basics, like where to stand, when to pass and how a team keeps its shape, rarely get taught at club or recreational practice, where time goes to drills and games. Futbol Island closes that gap: every idea is shown on the pitch, explained and checked with a quick quiz.</p>
  <h3>What your child learns</h3>
  <p>Positions, team shape and decisions in 7v7, 9v9, 11v11 and futsal, through short lessons and quizzes, plus the history and culture of the game in the museum.</p>
  <h3>Privacy</h3>
  <p>No ads, no chat, no personal data. A save code (three words and a number) instead of an account. {onOpenPrivacy
   ?<button type="button" className={styles.inlineLink} data-track="sg:privacy" onClick={onOpenPrivacy}>Read the privacy policy</button>
   :<a href="/privacy" target="_blank" rel="noopener noreferrer">Read the privacy policy</a>}.</p>
  <p className={styles.grownFree}>Free, always.</p>
  <p>Learning the game shouldn’t cost money. Club soccer already prices too many kids out.</p>
  <h3>In partnership with</h3>
  <p>Futbol Island is built in partnership with <b>White Sports Ventures</b>, founded by former U.S. Men’s National Team player Jeremiah White III. White Sports Ventures works to make soccer clearer and fairer for families, clubs and players, so that access never depends on insider knowledge.</p>
  <p className={styles.partnerLinks}><a href="https://www.whitesportsventures.com/about" data-track="sg:wsv" target="_blank" rel="noopener noreferrer">whitesportsventures.com</a><a href="https://www.instagram.com/jeremiahwhiteiii/" data-track="sg:instagram" target="_blank" rel="noopener noreferrer">@jeremiahwhiteiii on Instagram</a></p>
  <h3>Local non-profits</h3>
  <Donate returnTo={donateReturn}/>
 </div>;
}
