import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {fishHubRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {CollectionLinks} from '@/components/site/CollectionHub';
import {FISH_COLLECTIONS} from '@/lib/site/collections';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {fishPath,rarityWord,SITE_FISH} from '@/lib/site/fish';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import {SITE_BOOKS} from '@/lib/site/books';
import styles from '../site.module.css';
import {libraryCrumbs} from '@/lib/site/libraryPath';

export const dynamic='force-static';
const DESC=`The Futbol Island Fishbook: ${SITE_FISH.length} sea animals, each linked to a real football club, team or story from the sea. With a fun fact and how to catch each one.`;
export const metadata=pageMeta(`Fishbook: ${SITE_FISH.length} Sea Animals and Their Football Clubs`,DESC,'/fish',{whole:true})/* Nov 20 2026: was "Fishbook" */;
const CRUMBS=libraryCrumbs({name:'Fish',path:'/fish'});/* Nov 20 2026: through the Library */
const ORDER=['common','uncommon','rare','legendary'] as const;

export default function FishIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} Fishbook`,numberOfItems:SITE_FISH.length,
   itemListElement:SITE_FISH.map((f,i)=>({'@type':'ListItem',position:i+1,name:f.name,url:abs(fishPath(f.id))}))}}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={fishHubRail(ORDER.flatMap(r=>{const x=SITE_FISH.find(f=>f.rarity===r);return x?[[`r-${r}`,rarityWord(x)] as const]:[];}))} current="#top"/>
  <header className={styles.intro} id="top">
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>Fishbook: sea animals and their football clubs</h1>{/* SEO batch F (Nov 25 2026): the H1 says what the page is, like its title */}
   <p className={styles.lead}>{DESC} Fishing on the island also teaches a goalkeeper’s patience: wait for the real bite, like a keeper waits for the real shot.</p>
   <p className={styles.caption}>Where each animal lives on the island is a made-up island story. The club facts are real.</p>
   <a className={styles.cta} href="/play">Go fishing on the island</a>
  </header>
  <CollectionLinks list={FISH_COLLECTIONS} title="Browse the Fishbook by group and spot"/>
  <p className={styles.caption}>The Fishbook sits on the island’s bookshelf next to <a href="/books">{SITE_BOOKS.length} pop-up story books about real football players</a>{/* SEO batch F (Nov 25 2026): was a fixed 36 */}.</p>
  {ORDER.map(r=>{const list=SITE_FISH.filter(f=>f.rarity===r);if(!list.length)return null;return <section key={r} className={styles.section} aria-labelledby={`r-${r}`}>
   <h2 className={`${styles.h2} ${tgt.target}`} id={`r-${r}`}>{rarityWord(list[0])} <span className={styles.count}>({list.length})</span></h2>
   <ul className={styles.list}>{list.map(f=><li key={f.id}><a href={fishPath(f.id)}><span className={styles.itemTitle}>{f.name}</span><span className={styles.itemMeta}>{f.club.name}{f.club.nickname?` · “${f.club.nickname}”`:''}</span></a></li>)}</ul>
  </section>;})}
 </>;
}
