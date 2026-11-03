import {LEARN_CAROUSEL,learnBoldParts,learnPlain} from '@/lib/site/learnFeatures';
import {learnUrl,learnWideAsset} from '@/lib/site/learnMedia';
import ReelEnhance from './ReelEnhance';
import s from './learn.module.css';

/**
 * "See it in action" (Nov 3 2026, owner: after apple.com/apple-vision-pro's highlights row). A horizontal row of large rounded
 * 16:9 clip cards, each with a one-sentence caption, the next card peeking in from the right. Server component: every caption
 * and poster is in the HTML (works with JS off: native swipe / trackpad scroll, posters, captions; the arrows and play buttons
 * stay hidden until ReelEnhance runs). Cards come from LEARN_CAROUSEL; a card without its manifest entry + poster is skipped,
 * and with no cards at all the section is not rendered.
 * Layout: CSS scroll-snap-x (mandatory), snap + left padding aligned to the page content gutter, the row bleeds to the right edge,
 * and a trailing spacer lets the last card reach the snap position. Clips are muted, looped, inline, preload="none" (no
 * `poster` attribute: the <img> underneath is the poster, so a clip crossfades in only once it really plays).
 */
export default function LearnReel(){
 const cards=LEARN_CAROUSEL.map(c=>({c,a:learnWideAsset(c.key)})).filter((x):x is {c:typeof x.c;a:NonNullable<typeof x.a>}=>!!x.a).slice(0,9);
 if(!cards.length)return null;
 const n=cards.length;
 return <section className={s.reel} id="in-action" aria-labelledby="reel-h" data-reel="">
  <div className={s.reelHead} data-reveal="">
   <h2 className={s.h2} id="reel-h">See it in action</h2>
   <p className={s.sub}>Short clips straight from the island, each with a football idea inside.</p>
  </div>
  <div className={s.reelRow} role="region" aria-roledescription="carousel" aria-label="See it in action: clips from the game" tabIndex={0} data-reel-row="">
   {cards.map(({c,a},i)=><div key={c.key} className={s.card} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${n}: ${c.title}`} data-reel-card="" data-active={i===0?'':undefined}>
    <div className={s.cardMedia} data-media="still">
     <img className={s.still} src={learnUrl(a.image!.src)} width={a.image!.width} height={a.image!.height} alt={a.alt??learnPlain(c.caption)}
      loading={i<2?'eager':'lazy'} decoding="async"/>
     {a.clip&&<>
      <video className={s.clip} data-rv="" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture>
       {a.clip.mp4m&&<source media="(max-width: 1280px)" src={learnUrl(a.clip.mp4m)} type="video/mp4"/>}
       {a.clip.mp4&&<source src={learnUrl(a.clip.mp4)} type="video/mp4"/>}
       {a.clip.webm&&<source src={learnUrl(a.clip.webm)} type="video/webm"/>}
      </video>
      <button type="button" className={s.reelPlay} data-rv-btn="" aria-label={`Play the clip: ${c.title}`} data-label={c.title}>
       <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className={s.icoPlay} d="M8 5.5v13l11-6.5z"/><path className={s.icoPause} d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
      </button>
     </>}
    </div>
    <p className={s.cap}>{learnBoldParts(c.caption).map((p,j)=>p.bold?<strong key={j}>{p.text}</strong>:<span key={j}>{p.text}</span>)}</p>
   </div>)}
  </div>
  <div className={s.reelCtl}>
   <button type="button" className={s.reelArrow} data-reel-prev="" aria-label="Previous clip" disabled>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.5 6 8.5 12l6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
   </button>
   <button type="button" className={s.reelArrow} data-reel-next="" aria-label="Next clip" disabled={n<2}>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
   </button>
  </div>
  <ReelEnhance/>
 </section>;
}
