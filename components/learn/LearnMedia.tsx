import {learnAsset,learnUrl} from '@/lib/site/learnMedia';
import type {LearnGroupId} from '@/lib/site/learnFeatures';
import s from './learn.module.css';

/**
 * One picture slot on /learn (Nov 2 2026; Nov 3 restyle). The still (public/learn/<key>.webp) is the poster: it is in the HTML,
 * shows at once, and the looping muted clip (public/learn/video/<key>.*) crossfades in over it only once its first frame plays
 * (`data-playing` from LearnEnhance). No still = nothing at all (owner, Nov 2: no drawn placeholder art; the text stands alone).
 * Server component: LearnEnhance (client) decides when a clip loads and plays (the visible and the next chapter only, >= 25 %
 * visible, at most 2 at once, never by itself on reduced motion / Save-Data / slow network / battery saver).
 * - preload: the hero clip gets "auto"; every other clip "none", and LearnEnhance raises it to "auto" once it is within ~1.5
 *   screens of the viewport, so it is buffered before it scrolls in. Not "metadata" (measured Nov 3 on a Fast-3G-ish link):
 *   Chrome's metadata fetch takes the whole of these small clips (50-230 KB each), so six of them starved the hero clip and it
 *   had not shown a frame after 8 s. Every mp4 has its moov atom at the front (faststart), so a clip starts from its first bytes.
 * - No `poster` attribute: a poster downloads at once for every clip; the lazy <img> underneath is the poster instead.
 * - The still carries srcset + sizes so higher-resolution captures can be added later without touching the layout (the box is an
 *   aspect-ratio box and both layers are object-fit: cover).
 * - A clip with a 1280px `<key>_m.mp4` (lib/site/learnMedia.ts `clip.mp4m`) lists it first behind media="(max-width: 1280px)", so a
 *   phone never fetches the 1920px file (the Fuel up chapter, Nov 3 2026).
 * - <source> order: H.264 mp4 first, VP9 webm as the fallback (Nov 3). H.264 is hardware-decoded on every phone (VP9 is not on
 *   many, which costs heat), the two files are within ~25 % of each other in size (the mp4 is smaller for 4 of the 6 page
 *   clips), and in a throttled Chrome test the hero webm hit a decode error mid-load while the same mp4 played.
 */
export default function LearnMedia({imageKey,label,eager,className,sizes}:{imageKey:string;group?:LearnGroupId;label:string;eager?:boolean;className?:string;sizes?:string}){
 const a=learnAsset(imageKey);
 if(!a.image)return null;
 const alt=a.alt??label;
 // Most shots are upright phone screens: crop around the middle (the HUD sits at the top), or the shot's own focus.
 const focus={objectPosition:a.focus??(a.image.height>a.image.width?'50% 50%':'50% 20%')};
 const img=<img className={s.still} src={learnUrl(a.image.src)} srcSet={`${learnUrl(a.image.src)} ${a.image.width}w`} sizes={sizes??'(min-width: 900px) 440px, 80vw'}
   width={a.image.width} height={a.image.height} alt={alt} loading={eager?'eager':'lazy'} fetchPriority={eager?'high':undefined} decoding="async" style={focus}/>;
 // 4:5 shots (Nov 3): a phone (<= 640px wide) takes only the 720px still and clip, a wider screen only the 1080px ones.
 const m=a.image.m;
 return <div className={[s.media,className].filter(Boolean).join(' ')} data-media="still">
  {m?<picture><source media="(max-width: 640px)" srcSet={learnUrl(m.src)} width={m.width} height={m.height}/>{img}</picture>:img}
  {a.clip&&<>
   <video className={s.clip} data-lv="" muted loop playsInline preload={eager?'auto':'none'} aria-hidden="true" tabIndex={-1} disablePictureInPicture style={focus}>
    {a.clip.mp4m&&<source media={a.image.m?'(max-width: 640px)':'(max-width: 1280px)'} src={learnUrl(a.clip.mp4m)} type="video/mp4"/>}
    {a.clip.mp4&&<source src={learnUrl(a.clip.mp4)} type="video/mp4"/>}
    {a.clip.webm&&<source src={learnUrl(a.clip.webm)} type="video/webm"/>}
   </video>
   <button type="button" className={s.clipBtn} data-lv-btn="" aria-label={`Play the clip: ${label}`} data-label={label}>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className={s.icoPlay} d="M8 5.5v13l11-6.5z"/><path className={s.icoPause} d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
   </button>
  </>}
 </div>;
}
