import {LEARN_SLIDES} from '@/lib/site/learnFeatures';
import {learnSlideAsset} from '@/lib/site/learnMedia';
import SlidesEnhance from './SlidesEnhance';
import s from './learn.module.css';

/**
 * "Even more to explore" (Nov 3 2026, owner: after visionOS's "Explore what's new", on a LIGHT section). A big headline top-left,
 * then a row of large rounded 16:9 slides with the active one centred and its neighbours peeking on both sides (dimmed + slightly
 * smaller, with JS), each with a short white caption near the top on a soft dark scrim; under the row a light pill of dots (the
 * active dot stretches into a bar that fills over the slide's time) and a round pause / play button. Server component: every
 * caption and poster is in the HTML; JS off = a plain swipeable row of posters + captions (the controls stay hidden).
 * Layout: CSS scroll-snap-x (mandatory, centre aligned) with a spacer either side, so native swipe works and the first and last
 * slides can centre. Slides come from LEARN_SLIDES (6 at most); a slide without its manifest entry + poster is skipped, and with
 * none the section is not rendered. Clips: muted, looped, inline, preload="none"; a 1280px file through <source media> for
 * viewports <= 1280px; SlidesEnhance plays only the active slide's clip.
 */
export default function LearnSlides(){
 const slides=LEARN_SLIDES.map(x=>({x,a:learnSlideAsset(x.key)})).filter((y):y is {x:typeof y.x;a:NonNullable<typeof y.a>}=>!!y.a).slice(0,6);
 if(!slides.length)return null;
 const n=slides.length;
 return <section className={s.slides} id="more" aria-labelledby="slides-h" data-slides="">
  <div className={s.slidesHead} data-reveal="">
   <h2 className={s.h2} id="slides-h">Even more to explore</h2>
  </div>
  <div className={s.slideRow} role="region" aria-roledescription="carousel" aria-label="Even more to explore" tabIndex={0} data-slide-row="">
   {slides.map(({x,a},i)=><div key={x.key} className={s.slide} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${n}: ${x.title}`}
    data-slide="" data-active={i===0?'':undefined}>
    <div className={s.slideMedia} data-media="still">
     <img className={s.still} src={a.image!.src} width={a.image!.width} height={a.image!.height} alt={a.alt??x.caption} loading="lazy" decoding="async"/>
     {a.clip&&<>
      <video className={s.clip} data-sv="" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture>
       {a.clip.mp4m&&<source media="(max-width: 1280px)" src={a.clip.mp4m} type="video/mp4"/>}
       {a.clip.mp4&&<source src={a.clip.mp4} type="video/mp4"/>}
       {a.clip.webm&&<source src={a.clip.webm} type="video/webm"/>}
      </video>
      <button type="button" className={s.slidePlay} data-sv-btn="" aria-label={`Play the clip: ${x.title}`} data-label={x.title}>
       <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className={s.icoPlay} d="M8 5.5v13l11-6.5z"/><path className={s.icoPause} d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
      </button>
     </>}
     <p className={s.slideCap}>{x.caption}</p>
    </div>
   </div>)}
  </div>
  <div className={s.slideCtl}>
   <div className={s.dots} role="group" aria-label="Choose a slide">
    {slides.map(({x},i)=><button key={x.key} type="button" className={s.dot} data-dot="" aria-label={`Slide ${i+1}: ${x.title}`} aria-current={i===0?'true':undefined}>
     <span className={s.dotBar}><span className={s.dotFill} data-fill=""/></span>
    </button>)}
   </div>
   <button type="button" className={s.slidesToggle} data-slides-toggle="" aria-label="Pause the slideshow">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className={s.icoPlay} d="M8 5.5v13l11-6.5z"/><path className={s.icoPause} d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
   </button>
  </div>
  <SlidesEnhance/>
 </section>;
}
