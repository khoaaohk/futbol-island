import type {CSSProperties} from 'react';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import VideoThumbs from '@/components/site/videos/VideoThumbs';
import KeepReading from '@/components/site/KeepReading';
import {watchAbout,watchLinks} from '@/lib/site/videoPages';
import {allWatchVideos,isPortrait,moreVideos,VIDEOS_PATH,videoCrumbs,videoDateLabel,watchMetaDescription,watchVideoBySlug,watchVideoLd} from '@/lib/site/videos';
import {breadcrumbLd,pageMeta} from '@/lib/site/seo';
import site from '../../site.module.css';
import css from '../videos.module.css';

/**
 * /videos/<slug> (lib/site/videos.ts, Nov 18 2026): one clip's watch page. The video is the page's main content: a native
 * player at the top (controls, playsInline, preload="metadata", its poster, its real width and height, never autoplay), then its
 * title, what it shows, its length and date, the way into the game and more clips. The only VideoObject for this clip.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>allWatchVideos().map(v=>({slug:v.slug}));
export function generateMetadata({params}:{params:{slug:string}}):Metadata{
 const v=watchVideoBySlug(params.slug);if(!v)return {};
 const m=pageMeta(v.title,watchMetaDescription(v),v.path,{type:'website'});
 const og=m.openGraph as Record<string,unknown>;
 const image={url:v.poster,alt:v.title,...(v.pw&&v.ph?{width:v.pw,height:v.ph}:{})};
 return {...m,
  openGraph:{...og,type:'video.other',images:[image],videos:[{url:v.contentUrl,secureUrl:v.contentUrl,type:'video/mp4',width:v.w,height:v.h}]},
  twitter:{card:'summary_large_image',title:m.twitter?.title as string,description:m.twitter?.description as string,images:[v.poster]}};
}
export default function WatchPage({params}:{params:{slug:string}}){
 const v=watchVideoBySlug(params.slug);if(!v)notFound();
 const crumbs=videoCrumbs(v),tall=isPortrait(v),more=moreVideos(v),total=allWatchVideos().length;
 const size={'--w':v.w,'--h':v.h} as CSSProperties;
 const about=watchAbout(v),links=watchLinks(v);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={watchVideoLd(v)}/>
  <article className={`${css.watch} ${tall?css.tall:css.wide}`} data-watch={v.slug}>
   <div className={css.screen}>
    <video className={css.player} style={size} controls playsInline preload="metadata" poster={v.posterSrc} width={v.w} height={v.h} aria-describedby="clip-words">
     {v.webmSrc&&<source src={v.webmSrc} type="video/webm"/>}
     <source src={v.mp4Src} type="video/mp4"/>
    </video>
   </div>
   <div className={css.words} id="clip-words">
    <Breadcrumbs crumbs={crumbs}/>
    <h1 className={css.h1}>{v.title}</h1>
    <p className={css.facts}><span>{v.seconds} seconds</span><span>No sound</span><span>Added <time dateTime={v.uploadDate}>{videoDateLabel(v)}</time></span></p>
    {v.text.map(x=><p key={x}>{x}</p>)}
    <p className={css.actions}><a className={site.cta} href={v.play.href}>{v.play.label}</a><a href={v.origin.href}>{v.origin.label}</a></p>
   </div>
  </article>
  {/* Nov 20 2026 (SEO phase 2): the record of the game or lesson the clip shows, and links to its pages (lib/site/videoPages.ts) */}
  <section className={site.section} aria-labelledby="about">
   <h2 className={site.h2} id="about">{about.title}</h2>
   {about.lines.map(l=><p key={l.text}>{l.label&&<b>{l.label}: </b>}{l.text}</p>)}
  </section>
  <KeepReading id="go" title="Where to go from this clip" groups={[{id:'clip-links',links}]}/>
  <section className={site.section} aria-labelledby="more">
   <h2 className={site.h2} id="more">More videos</h2>
   <VideoThumbs videos={more}/>
   <p><a href={VIDEOS_PATH}>All {total} Futbol Island videos</a></p>
  </section>
 </>;
}
