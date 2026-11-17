import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import RelatedLinks from '@/components/site/RelatedLinks';
import {exhibitById,exhibitPath,SITE_EXHIBITS} from '@/lib/site/exhibits';
import {exhibitRelated} from '@/lib/site/related';
import {breadcrumbLd,creativeWorkLd,firstSentence,ogPath,pageMeta} from '@/lib/site/seo';
import {ExhibitStamp,ExhibitTileGroup,Hero,isDated,StoryTimeline} from '@/components/site/cards/CardParts';
import styles from '../../site.module.css';

/** One museum case as plain text: era, facts, the experience's story text and the sources (titles only, no outside links).
 *  Nov 17 2026 (visual pass, AUDIT.md #8): the share picture as the hero <img>, a year / gallery stamp, the story as a vertical
 *  timeline when at least two, and half, of its steps are dated (its own words only), and related cases as year tiles. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_EXHIBITS.map(e=>({id:e.id}));
export function generateMetadata({params}:{params:{id:string}}){
 const e=exhibitById(params.id);if(!e)return {};
 return pageMeta(`${e.title} (${e.year})`,firstSentence(e.facts[0]??e.galleryBlurb),exhibitPath(e.id),
  {image:{url:ogPath(exhibitPath(e.id)),alt:`${e.title} (${e.year}), a case in the Futbol Island history museum`}});
}
export default function ExhibitPage({params}:{params:{id:string}}){
 const e=exhibitById(params.id);if(!e)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Museum',path:'/exhibits'},{name:e.title,path:exhibitPath(e.id)}];
 const dated=e.story.filter(l=>isDated(l.head)).length,timeline=dated>=2&&dated*2>=e.story.length;
 return <>
  <JsonLd data={creativeWorkLd({name:e.title,path:exhibitPath(e.id),description:e.facts.join(' '),image:ogPath(exhibitPath(e.id)),
   about:{'@type':'Thing',name:`${e.title} (${e.year})`,description:e.galleryTitle}})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <p className={styles.eyebrow}>{e.galleryTitle} · {e.year}</p>
   <h1 className={styles.title}>{e.title}</h1>
  </header>
  <Hero src={ogPath(exhibitPath(e.id))} alt={`${e.title} (${e.year}), a case in the Futbol Island history museum: ${e.galleryTitle}`}/>
  <ExhibitStamp year={e.year} gallery={e.galleryTitle}/>
  <section className={styles.card} aria-labelledby="facts"><span className={styles.label}>Real football fact</span><h2 className={styles.h2} id="facts">The facts</h2>
   <ul>{e.facts.map(f=><li key={f}>{f}</li>)}</ul>
  </section>
  {e.story.length>0&&<section className={styles.section} aria-labelledby="story"><h2 className={styles.h2} id="story">The story</h2>
   {timeline?<StoryTimeline lines={e.story}/>:<ul>{e.story.map((s,i)=><li key={i}>{s.head&&<b>{s.head}: </b>}{s.text}</li>)}</ul>}
  </section>}
  <section className={styles.card} aria-labelledby="game"><h2 className={styles.h2} id="game">Take it to your game</h2><p>{e.forYourGame}</p></section>
  {e.sources.length>0&&<section className={styles.section} aria-labelledby="sources"><h2 className={styles.h3} id="sources">Sources</h2>
   <ul className={styles.caption}>{e.sources.map(s=><li key={s.url}>{s.title}</li>)}</ul>
  </section>}
  <RelatedLinks related={exhibitRelated(e)} heading="More from the museum" readHeading="Learn it on the pitch" renderGroup={g=><ExhibitTileGroup g={g}/>}/>
  <p className={styles.end}><a className={styles.cta} href="/museum">See it in the museum on the island</a></p>
 </>;
}
