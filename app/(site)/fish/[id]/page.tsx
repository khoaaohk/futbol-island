import {notFound} from 'next/navigation';
import FishArt from '@/components/FishArt';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {fishById,fishCredit,fishPath,fishPlaces,fishWhen,rarityWord,SITE_FISH} from '@/lib/site/fish';
import {breadcrumbLd,creativeWorkLd,firstSentence,pageMeta} from '@/lib/site/seo';
import styles from '../../site.module.css';

/** One Fishbook species. Art: the game's own inline SVG drawing (components/FishArt.tsx, static paths, no images to load). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_FISH.map(f=>({id:f.id}));
export function generateMetadata({params}:{params:{id:string}}){
 const f=fishById(params.id);if(!f)return {};
 return pageMeta(`${f.name} (Fishbook)`,firstSentence(f.club.fact),fishPath(f.id));
}
export default function FishPage({params}:{params:{id:string}}){
 const f=fishById(params.id);if(!f)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Fish',path:'/fish'},{name:f.name,path:fishPath(f.id)}];
 const places=fishPlaces(f),when=fishWhen(f);
 return <>
  <JsonLd data={creativeWorkLd({name:`${f.name} and ${f.club.name}`,path:fishPath(f.id),description:f.club.fact,
   about:[{'@type':'Thing',name:f.name},{'@type':'SportsOrganization',name:f.club.name,sport:'Football',location:f.club.country}]})}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <p className={styles.eyebrow}>{rarityWord(f)}{f.deepSea?' · Deep sea':''}</p>
   <h1 className={styles.title}>{f.name}</h1>
  </header>
  <div className={styles.art} aria-hidden="true"><FishArt fish={f} size={180}/></div>
  <section className={styles.card} aria-labelledby="fact">
   <span className={styles.label} id="fact">Real football fact · {f.club.link}</span>
   <h2 className={styles.h2}>{f.club.name}{f.club.nickname?` · “${f.club.nickname}”`:''} <span className={styles.count}>({f.club.country})</span></h2>
   <p>{f.club.fact}</p>
   <p className={styles.caption}>Source: {fishCredit(f)}</p>
  </section>
  <section className={styles.card} aria-labelledby="story">
   <span className={styles.label} id="story">Island story</span>
   {places.length>0?<><p>On Futbol Island the {f.name.toLowerCase()} can be caught at:</p><ul>{places.map(p=><li key={p.name}><b>{p.name}</b>: {p.story}</li>)}</ul></>:<p>A rare visitor to the island’s waters.</p>}
   {when&&<p>{when}.</p>}
   <p className={styles.caption}>Size on the island: {f.size[0]}–{f.size[1]} cm.</p>
  </section>
  <p className={styles.end}><a className={styles.cta} href="/">Go fishing on the island</a></p>
 </>;
}
