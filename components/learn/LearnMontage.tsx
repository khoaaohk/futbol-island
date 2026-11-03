import {LEARN_MONTAGE} from '@/lib/site/learnFeatures';
import {learnMontage,learnUrl} from '@/lib/site/learnMedia';
import MontageEnhance from './MontageEnhance';
import s from './learn.module.css';

/**
 * The full-bleed montage right after the /learn hero (Nov 3 2026, owner: after apple.com/apple-vision-pro's overview film). One
 * edge-to-edge 16:9 clip (no gutters, no rounded corners, no text on it), a round pause / play button top-right with a thin ring
 * that fills over the clip's length, and a short headline + one line under it in the page style. Server component: the poster
 * and the words are in the HTML (JS off: the poster alone, no button). MontageEnhance plays it.
 * One file per viewer: the three sizes are <source media> alternatives (<= 640px: 854px file, <= 1280px: 1280px, else 1920px), so
 * the browser picks and fetches exactly one; the poster uses the same ladder through srcset. preload="none" in the HTML; the
 * enhancer raises it to "auto" once the montage is near (not in calm mode). Save-Data / 2g / 3g: only the 854px file is kept.
 * Missing 1920px entry or poster = no section.
 */
export default function LearnMontage(){
 const m=learnMontage();
 if(!m)return null;
 const big=m.sizes[m.sizes.length-1],by=(k:string)=>m.sizes.find(x=>x.key===k);
 const sm=by('montage_s'),md=by('montage_m');
 const dur=m.duration??28;
 return <section className={s.montage} id="film" aria-labelledby="montage-h" data-montage="">
  <div className={s.montageMedia} data-media="still" style={{'--dur':`${dur}s`} as React.CSSProperties}>
   <img className={s.still} src={learnUrl(big.image.src)} srcSet={m.sizes.map(x=>`${learnUrl(x.image.src)} ${x.image.width}w`).join(', ')} sizes="100vw"
    width={big.image.width} height={big.image.height} alt={m.alt??LEARN_MONTAGE.title} loading="lazy" decoding="async"/>
   {big.mp4&&<>
    <video className={s.clip} data-mv="" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture>
     {sm?.mp4&&<source media="(max-width: 640px)" src={learnUrl(sm.mp4)} type="video/mp4" data-size="s"/>}
     {md?.mp4&&<source media="(max-width: 1280px)" src={learnUrl(md.mp4)} type="video/mp4" data-size="m"/>}
     <source src={learnUrl(big.mp4)} type="video/mp4" data-size="l"/>
    </video>
    <button type="button" className={s.mPlay} data-mv-btn="" aria-label="Play the island film">
     <svg viewBox="0 0 44 44" aria-hidden="true" focusable="false">
      <circle className={s.mTrack} cx="22" cy="22" r="20.5"/>
      <circle className={s.mRing} cx="22" cy="22" r="20.5" pathLength={100} data-ring=""/>
      <path className={s.icoPlay} d="M17.5 14.5v15l12-7.5z"/>
      <path className={s.icoPause} d="M16 14.5h4v15h-4zM24 14.5h4v15h-4z"/>
     </svg>
    </button>
   </>}
  </div>
  <div className={s.montageHead} data-reveal="">
   <h2 className={s.h2} id="montage-h">{LEARN_MONTAGE.title}</h2>
   <p className={s.sub}>{LEARN_MONTAGE.line}</p>
  </div>
  <MontageEnhance/>
 </section>;
}
