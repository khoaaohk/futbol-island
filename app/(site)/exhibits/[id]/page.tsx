import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {exhibitById,exhibitPath,SITE_EXHIBITS} from '@/lib/site/exhibits';
import {breadcrumbLd,creativeWorkLd,firstSentence,pageMeta} from '@/lib/site/seo';
import styles from '../../site.module.css';

/** One museum case as plain text: era, facts, the experience's story text and the sources (titles only, no outside links). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_EXHIBITS.map(e=>({id:e.id}));
export function generateMetadata({params}:{params:{id:string}}){
 const e=exhibitById(params.id);if(!e)return {};
 return pageMeta(`${e.title} (${e.year})`,firstSentence(e.facts[0]??e.galleryBlurb),exhibitPath(e.id));
}
export default function ExhibitPage({params}:{params:{id:string}}){
 const e=exhibitById(params.id);if(!e)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Museum',path:'/exhibits'},{name:e.title,path:exhibitPath(e.id)}];
 return <>
  <JsonLd data={creativeWorkLd({name:e.title,path:exhibitPath(e.id),description:e.facts.join(' '),
   about:{'@type':'Thing',name:`${e.title} (${e.year})`,description:e.galleryTitle}})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <Breadcrumbs crumbs={crumbs}/>
  <p className={styles.tag}>{e.galleryTitle} · {e.year}</p>
  <h1>{e.title}</h1>
  <section className={styles.card} aria-labelledby="facts"><h2 id="facts">The facts</h2>
   <ul>{e.facts.map(f=><li key={f}>{f}</li>)}</ul>
  </section>
  {e.story.length>0&&<section aria-labelledby="story"><h2 id="story">The story</h2>
   <ul>{e.story.map((s,i)=><li key={i}>{s.head&&<b>{s.head}: </b>}{s.text}</li>)}</ul>
  </section>}
  <section className={styles.card} aria-labelledby="game"><h2 id="game">Take it to your game</h2><p>{e.forYourGame}</p></section>
  {e.sources.length>0&&<section aria-labelledby="sources"><h2 id="sources">Sources</h2>
   <ul className={styles.muted}>{e.sources.map(s=><li key={s.url}>{s.title}</li>)}</ul>
  </section>}
  <p><a className={styles.play} href="/museum">See it in the museum on the island</a></p>
  <p><a href="/exhibits">All exhibits</a></p>
 </>;
}
