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
    {/* Nov 8 2026 (SEO): the eyebrow is a div, so the page's first paragraph is the plain line below; the h1 reads "Play Futbol
        Island" in text (a visually hidden "Play " and word space, position:absolute, so the wordmark's look is unchanged). */}
    <div className={styles.eyebrow} data-enter="eyebrow">PLAY · LEARN · GROW</div>
    <h1 className={styles.title} aria-label="Play Futbol Island">
     <span className={styles.srOnly}>Play </span>
     {WORDS.map((w,wi)=><span key={w} className={styles.word} aria-hidden="true">{wi?<span className={styles.srOnly}> </span>:null}{[...w].map((ch,i)=><span key={i} className={styles.letter} style={{'--i':n++} as React.CSSProperties}>{ch}</span>)}</span>)}
    </h1>
    {/* Nov 3 2026 (owner, SEO): /play is indexable, so its static HTML says in words what the page is. Visually hidden: the
        title screen's look is unchanged. */}
    <p className={styles.srOnly}>Start your island or continue with your save code. Futbol Island is a free football learning game for kids aged 7 to 12: short lessons and quizzes on 7v7, 9v9, 11v11 and futsal, and play with friends using preset emotes. No pop-up or tracking ads, no accounts, no open chat.</p>
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
