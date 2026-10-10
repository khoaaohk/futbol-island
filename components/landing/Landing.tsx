import TitleScene from './TitleScene';
import TitleArt from './TitleArt';
import TitleActions from './TitleActions';
import {LegalLinks} from './GrownUps';
import styles from './Title.module.css';

/**
 * The Futbol Island title screen (at `/` since Oct 9 2026; /start was removed): one screen, like a game's title. The title, one line, the layered island and
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
   <header className={styles.copy} data-x="copy">
    <p className={styles.eyebrow} data-enter="eyebrow">PLAY · LEARN · GROW</p>
    <h1 className={styles.title} aria-label="Futbol Island">
     {WORDS.map(w=><span key={w} className={styles.word} aria-hidden="true">{[...w].map((ch,i)=><span key={i} className={styles.letter} style={{'--i':n++} as React.CSSProperties}>{ch}</span>)}</span>)}
    </h1>
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
