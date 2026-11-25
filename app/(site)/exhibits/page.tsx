import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {exhibitAnchor,exhibitsHubRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {exhibitPath,GALLERIES,SITE_EXHIBITS} from '@/lib/site/exhibits';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import {FactTable,type FactRow} from '@/components/site/FactTable';
import {booksForExhibit} from '@/lib/site/crossLinks';
import styles from '../site.module.css';
import {libraryCrumbs} from '@/lib/site/libraryPath';

/** The History Museum's cases as reading pages. /museum stays the game's walk-in hall. */
export const dynamic='force-static';
const DESC=`The Futbol Island History Museum: ${SITE_EXHIBITS.length} exhibits on the Laws of the Game, World Cup history, balls and kits, legends, football’s firsts, tactics and the science of the game.`;
// the search-result description is kept under 155 characters; the page lead stays the full sentence
const META=`The Futbol Island History Museum: ${SITE_EXHIBITS.length} exhibits on the Laws, World Cup history, balls, kits, legends, tactics and science.`;
/* Nov 20 2026 (SEO phase 2): was "History Museum exhibits" / h1 "History Museum", which did not name the sport */
export const metadata=pageMeta('Football History for Kids: Museum Exhibits',META,'/exhibits');
const CRUMBS=libraryCrumbs({name:'Museum',path:'/exhibits'});/* Nov 20 2026: through the Library */

/** SEO batch F (Nov 25 2026, owner: hubs get a clear "what's here" table): one row per gallery (its own blurb and how many cases,
 *  linked to its list below), then the pages the cases lead to. Every count is from the museum data. */
function whatsHere():FactRow[]{
 const books=new Set(SITE_EXHIBITS.flatMap(e=>booksForExhibit(e.id).map(b=>b.path))).size;
 return [
  ...GALLERIES.filter(g=>SITE_EXHIBITS.some(e=>e.gallery===g.id)).map(g=>{const list=SITE_EXHIBITS.filter(e=>e.gallery===g.id);
   return {label:g.title,value:<><a href={`#g-${g.id}`}>{list.length} {list.length===1?'exhibit':'exhibits'}</a>: {g.blurb.replace(/\.$/,'')}</>};}),
  {label:'Today’s rules',value:<>Each exhibit links the rule, term or position page about the same thing, like the <a href="/learn/soccer-rules/offside">offside rule</a> or the <a href="/learn/soccer-rules/penalty-kick">penalty kick</a></>},
  {label:'True stories',value:<><a href="/books">{books} pop-up books</a> about real players link an exhibit</>},
  {label:'On the island',value:<><a href="/museum">Walk into the museum in the game</a>, free in the browser</>},
 ];
}
export default function ExhibitsIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} History Museum`,numberOfItems:SITE_EXHIBITS.length,
   itemListElement:SITE_EXHIBITS.map((e,i)=>({'@type':'ListItem',position:i+1,name:`${e.title} (${e.year})`,url:abs(exhibitPath(e.id))}))}}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={exhibitsHubRail()} current="#top"/>
  <header className={styles.intro} id="top">
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>Football history museum for kids</h1>
   {/* SEO batch F (Nov 25 2026): the answer first (what football history the museum covers), then the museum line */}
   <p className={styles.lead}>Football history for kids, one short exhibit at a time: how the Laws of the Game began in 1863, the first World Cup in 1930, how the ball and the kit changed, and how offside and formations grew into today’s game. {DESC}</p>
   <a className={styles.cta} href="/museum">Walk into the museum on the island</a>
  </header>
  <FactTable id="whats-here" title="What’s in the museum" label="What is in the football history museum" head={['Gallery','What you find']} rows={whatsHere()}/>
  {GALLERIES.map(g=>{const list=SITE_EXHIBITS.filter(e=>e.gallery===g.id);if(!list.length)return null;return <section key={g.id} className={styles.section} aria-labelledby={`g-${g.id}`}>
   <h2 className={`${styles.h2} ${tgt.target}`} id={`g-${g.id}`}>{g.title}</h2>
   <p className={styles.caption}>{g.blurb}</p>
   <ul className={styles.list}>{list.map(e=><li key={e.id} id={exhibitAnchor(e.id)} className={tgt.target}><a href={exhibitPath(e.id)}><span className={styles.itemTitle}>{e.h1}</span><span className={styles.itemMeta}>{e.year}</span></a></li>)}</ul>
  </section>;})}
 </>;
}
