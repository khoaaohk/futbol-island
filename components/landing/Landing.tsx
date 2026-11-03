import TitleScene from './TitleScene';
import TitleArt from './TitleArt';
import TitleActions from './TitleActions';
import {LegalLinks} from './GrownUps';
import LandingBack from './LandingBack';
import styles from './Title.module.css';

/**
 * The Futbol Island title screen (at /play since Nov 3 2026, `/` from Oct 9; /start was removed): one screen, like a game's title. The title, one line, the layered island and
 * the save-code actions. A save code is required to play (TitleActions); a saving outage never locks a kid out.
 * A server component: static HTML and CSS. Client code: TitleScene (parallax + calm), TitleActions (save flow), PlayButton.
 * No WebGL, canvas, video or audio.
 */
const WORDS=['Futbol','Island'];

export default function Landing(){
 let n=0;
 return <div className={styles.page}>
  <TitleScene className={styles.screen}>
   <div className={styles.scene} aria-hidden="true"><TitleArt/></div>
   {/* Nov 3 2026 (owner): a Back pill at the top-left (the spot the logo has on the home page) that returns to the feature tour at `/`; "For grown-ups" sits top-right
       (GrownUps.tsx). A plain crawlable link, no JS. */}
   <LandingBack/>
   <header className={styles.copy} data-x="copy">
    <p className={styles.eyebrow} data-enter="eyebrow">PLAY · LEARN · GROW</p>
    <h1 className={styles.title} aria-label="Futbol Island">
     {WORDS.map(w=><span key={w} className={styles.word} aria-hidden="true">{[...w].map((ch,i)=><span key={i} className={styles.letter} style={{'--i':n++} as React.CSSProperties}>{ch}</span>)}</span>)}
    </h1>
    {/* Nov 3 2026 (owner, SEO): /play is indexable, so its static HTML says in words what the page is. Visually hidden: the
        title screen's look is unchanged. */}
    <p className={styles.srOnly}>Futbol Island is a free football learning game for kids aged 7 to 12. Start a new island, continue with your save code, or join friends. No ads, no chat, no accounts.</p>
    {/* The island loader's track (IslandLoading): hidden until Play starts the hand-off into the game (handoffMotion.ts). */}
    <span className={`island-loading-track ${styles.track}`} data-landing-track aria-hidden="true"><span/></span>
   </header>
   <TitleActions/>
   <nav className={styles.grownRow} aria-label="For grown-ups">
    <LegalLinks/>
   </nav>
  </TitleScene>
 </div>;
}
