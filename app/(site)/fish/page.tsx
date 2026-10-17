import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {fishPath,rarityWord,SITE_FISH} from '@/lib/site/fish';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import styles from '../site.module.css';

export const dynamic='force-static';
const DESC=`The Futbol Island Fishbook: ${SITE_FISH.length} sea animals, each linked to a real football club, team or story from the sea.`;
export const metadata=pageMeta('Fishbook',DESC,'/fish');
const CRUMBS=[{name:'Home',path:'/'},{name:'Fish',path:'/fish'}];
const ORDER=['common','uncommon','rare','legendary'] as const;

export default function FishIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} Fishbook`,numberOfItems:SITE_FISH.length,
   itemListElement:SITE_FISH.map((f,i)=>({'@type':'ListItem',position:i+1,name:f.name,url:abs(fishPath(f.id))}))}}/>
  <Breadcrumbs crumbs={CRUMBS}/>
  <h1>Fishbook</h1>
  <p className={styles.lead}>{DESC} Fishing on the island also teaches a goalkeeper’s patience: wait for the real bite, like a keeper waits for the real shot.</p>
  <p className={styles.muted}>Where each animal lives on the island is a made-up island story. The club facts are real.</p>
  {ORDER.map(r=>{const list=SITE_FISH.filter(f=>f.rarity===r);if(!list.length)return null;return <section key={r} aria-labelledby={`r-${r}`}>
   <h2 id={`r-${r}`}>{rarityWord(list[0])} ({list.length})</h2>
   <ul className={styles.list}>{list.map(f=><li key={f.id}><a href={fishPath(f.id)}><b>{f.name}</b><span>{f.club.name}{f.club.nickname?` · “${f.club.nickname}”`:''}</span></a></li>)}</ul>
  </section>;})}
 </>;
}
