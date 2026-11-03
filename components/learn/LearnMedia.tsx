import {learnAsset} from '@/lib/site/learnMedia';
import type {LearnGroupId} from '@/lib/site/learnFeatures';
import s from './learn.module.css';

/**
 * One picture slot on /learn (Nov 2 2026): the still (public/learn/<key>.webp) and, when public/learn/video/<key>.* exists, a
 * looping muted clip on top. No still = nothing at all (owner, Nov 2: no drawn placeholder art; the slot's text stands alone).
 * Server component: LearnEnhance (client) decides when a clip may play (>= 50 % visible, at most 2 at once, never on reduced
 * motion / Save-Data / slow network / battery saver unless tapped). `preload="none"`: nothing downloads before it plays.
 * No `poster` on the video (QA Nov 2): a poster downloads at once even with preload none, which pulled every still (~1.7 MB) on
 * first load. The lazy <img> underneath is the poster; the clip fades in over it only once it plays.
 */
export default function LearnMedia({imageKey,label,eager,className}:{imageKey:string;group?:LearnGroupId;label:string;eager?:boolean;className?:string}){
 const a=learnAsset(imageKey);
 if(!a.image)return null;
 const alt=a.alt??label;
 // Most shots are upright phone screens: crop around the middle (the HUD sits at the top), or the shot's own focus.
 const focus={objectPosition:a.focus??(a.image.height>a.image.width?'50% 50%':'50% 20%')};
 return <div className={[s.media,className].filter(Boolean).join(' ')} data-media="still">
  <img className={s.still} src={a.image.src} width={a.image.width} height={a.image.height} alt={alt} loading={eager?'eager':'lazy'} fetchPriority={eager?'high':undefined} decoding="async" style={focus}/>
  {a.clip&&<>
   <video className={s.clip} data-lv="" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture style={focus}>
    {a.clip.webm&&<source src={a.clip.webm} type="video/webm"/>}
    {a.clip.mp4&&<source src={a.clip.mp4} type="video/mp4"/>}
   </video>
   <button type="button" className={s.clipBtn} data-lv-btn="" aria-label={`Play the clip: ${label}`} data-label={label}>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className={s.icoPlay} d="M8 5.5v13l11-6.5z"/><path className={s.icoPause} d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
   </button>
  </>}
 </div>;
}
