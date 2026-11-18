import {isPortrait,type WatchVideo} from '@/lib/site/videos';
import css from '@/app/(site)/videos/videos.module.css';
/** A row of watch-page links: each clip's poster (a plain lazy <img> with its real size), its title and its length. No player
 *  here: one video per page (AGENTS.md, no simultaneous players). Server-rendered, no script. */
export default function VideoThumbs({videos}:{videos:readonly WatchVideo[]}){
 if(!videos.length)return null;
 const tall=isPortrait(videos[0]);
 return <ul className={`${css.thumbs} ${tall?css.thumbsTall:css.thumbsWide}`}>{videos.map(v=><li key={v.slug}>
  <a href={v.path} className={css.thumb}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={v.posterSrc} alt="" width={v.pw??v.w} height={v.ph??v.h} loading="lazy" decoding="async"/>
   <span className={css.thumbTitle}>{v.title}</span>
   <span className={css.thumbSecs}>{v.seconds} seconds</span>
  </a>
 </li>)}</ul>;
}
