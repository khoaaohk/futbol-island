import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import RelatedLinks from '@/components/site/RelatedLinks';
import {fishArtPath,fishById,fishCredit,FISH_ART_SIZE,fishPath,fishPlaces,fishWhen,rarityWord,SITE_FISH} from '@/lib/site/fish';
import {fishRelated} from '@/lib/site/related';
import {breadcrumbLd,creativeWorkLd,firstSentence,ogPath,pageMeta} from '@/lib/site/seo';
import styles from '../../site.module.css';

/** One Fishbook species. Art: the game's own drawing (components/FishArt.tsx), since Nov 10 2026 as a real picture built at build
 *  time (art.png/route.tsx: one indexable <img> with alt text and fixed width/height, no script), plus the page's share picture
 *  (og.png/route.tsx) and data-driven links (lib/site/related.ts). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_FISH.map(f=>({id:f.id}));
export function generateMetadata({params}:{params:{id:string}}){
 const f=fishById(params.id);if(!f)return {};
 return pageMeta(`${f.name} (Fishbook)`,firstSentence(f.club.fact),fishPath(f.id),
  {image:{url:ogPath(fishPath(f.id)),alt:`Drawing of a ${f.name.toLowerCase()}, the Fishbook animal for ${f.club.name}`}});
}
export default function FishPage({params}:{params:{id:string}}){
 const f=fishById(params.id);if(!f)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Fish',path:'/fish'},{name:f.name,path:fishPath(f.id)}];
 const places=fishPlaces(f),when=fishWhen(f);
 return <>
  <JsonLd data={creativeWorkLd({name:`${f.name} and ${f.club.name}`,path:fishPath(f.id),description:f.club.fact,image:ogPath(fishPath(f.id)),
   about:[{'@type':'Thing',name:f.name},{'@type':'SportsOrganization',name:f.club.name,sport:'Football',location:f.club.country}]})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <p className={styles.eyebrow}>{rarityWord(f)}{f.deepSea?' · Deep sea':''}</p>
   <h1 className={styles.title}>{f.name}</h1>
  </header>
  <div className={styles.art}><img src={fishArtPath(f.id)} width={FISH_ART_SIZE.width} height={FISH_ART_SIZE.height} decoding="async"
   alt={`Drawing of a ${f.name.toLowerCase()}, the Fishbook animal for ${f.club.name} (${f.club.country})`}/></div>
  <section className={styles.card} aria-labelledby="fact">
   <span className={styles.label} id="fact">{f.club.link==='Fun fish fact'?'Fun fish fact + real football fact':`Real football fact · ${f.club.link}`}</span>
   <h2 className={styles.h2}>{f.club.name}{f.club.nickname?` · “${f.club.nickname}”`:''} <span className={styles.count}>({f.club.country})</span></h2>
   <p>{f.club.fact}</p>
   <p className={styles.caption}>Source: {fishCredit(f)}</p>
  </section>
  {f.story&&<section className={styles.card} aria-labelledby="tale" data-fish-story>
   <span className={styles.label} id="tale">Fish tale</span>
   <p>{f.story}</p>
  </section>}
  <section className={styles.card} aria-labelledby="story">
   <span className={styles.label} id="story">Island story</span>
   {places.length>0?<><p>On Futbol Island the {f.name.toLowerCase()} can be caught at:</p><ul>{places.map(p=><li key={p.name}><b>{p.name}</b>: {p.story}</li>)}</ul></>:<p>A rare visitor to the island’s waters.</p>}
   {when&&<p>{when}.</p>}
   <p className={styles.caption}>Size on the island: {f.size[0]}–{f.size[1]} cm.</p>
  </section>
  <RelatedLinks related={fishRelated(f)} heading="More from the Fishbook" readHeading="Keep reading"/>
  <p className={styles.end}><a className={styles.cta} href="/play">Go fishing on the island</a></p>
 </>;
}
