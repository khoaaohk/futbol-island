import {FactTable} from './FactTable';
import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {collectionRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {COLLECTIONS_UPDATED,collectionBySlug,type Collection} from '@/lib/site/collections';
import {breadcrumbLd,collectionLd,pageMeta,PLAY_PATH} from '@/lib/site/seo';
import {SITE_PUBLISHED} from '@/lib/site/updated';
import {booksForCollection,collectionTopicLinks} from '@/lib/site/crossLinks';
import styles from '@/app/(site)/site.module.css';
import {CardThumbGrid} from '@/components/site/cards/GameCard';
import {libraryCrumbs} from '@/lib/site/libraryPath';
const CARD_PAGE=/^\/cards\/\d+$/;
/**
 * A collection hub (lib/site/collections.ts, Nov 15 2026): breadcrumb, h1, short intro, one list per group, the guide pages that
 * explain the topic, and the sibling hubs. Server-rendered plain links, the same list classes as /cards and /fish.
 */
const PARENT={cards:{name:'Cards',path:'/cards',cta:'Collect cards on the island'},fish:{name:'Fish',path:'/fish',cta:'Go fishing on the island'}} as const;
export const collectionCrumbs=(c:Collection)=>libraryCrumbs({name:PARENT[c.parent].name,path:PARENT[c.parent].path},{name:c.crumb,path:c.path});/* Nov 20 2026: through the Library */
export function hubMeta(parent:'cards'|'fish',slug:string){const c=collectionBySlug(parent,slug)!;return pageMeta(c.title,c.description,c.path,{whole:true,type:'website'});}
/** The list of hubs on /cards and /fish ("Browse by …"). */
export function CollectionLinks({list,title}:{list:readonly Collection[];title:string}){
 return <section className={styles.section} aria-labelledby="collections"><h2 className={`${styles.h2} ${tgt.target}`} id="collections">{title}</h2>
  <ul className={styles.list}>{list.map(c=><li key={c.path}><a href={c.path}><span className={styles.itemTitle}>{c.h1}</span><span className={styles.itemMeta}>{c.blurb}</span></a></li>)}</ul>
 </section>;
}
export default function CollectionHub({parent,slug,siblings}:{parent:'cards'|'fish';slug:string;siblings:readonly Collection[]}){
 const c=collectionBySlug(parent,slug)!,crumbs=collectionCrumbs(c),items=c.groups.flatMap(g=>g.links);
 /* Nov 20 2026 (SEO foundation): a card group page also links the pop-up books about its players and the terms and rules its
    position is about (lib/site/crossLinks.ts); a Fishbook group gets none. */
 const cross=[...booksForCollection(c),...collectionTopicLinks(c)].filter(l=>!c.learn.some(x=>x.path===l.path));
 const bks=booksForCollection(c);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:c.h1,path:c.path,description:c.description,published:SITE_PUBLISHED,modified:COLLECTIONS_UPDATED,items:items.map(l=>({name:l.name,path:l.path}))})}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={collectionRail(parent,c.groups.map((g,i)=>[g.id??`g-${i}`,g.title] as const))} current="#top"/>
  <header className={styles.intro} id="top">
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{c.h1}</h1>
   <p className={styles.lead}>{c.intro}</p>
   {c.more&&<p>{c.more}</p>}
   <a className={styles.cta} href={PLAY_PATH}>{PARENT[parent].cta}</a>
  </header>
  {/* SEO batch F (Nov 25 2026, owner: hubs get a clear "what's here" table): each group with its count, then the books and guides */}
  <FactTable id="whats-here" title="What’s here" label={`What is in ${c.h1.toLowerCase()}`} head={[parent==='cards'?'Cards':'Fishbook','What you find']}
   rows={[...c.groups.map((g,i)=>({label:g.title,value:<><a href={`#${g.id??`g-${i}`}`}>{g.links.length} {parent==='cards'?(g.links.length===1?'card':'cards'):(g.links.length===1?'animal':'animals')}</a>{g.line?<>: {g.line.replace(/\.$/,'')}</>:null}</>})),
    ...(bks.length?[{label:'Pop-up books',value:<>{bks.slice(0,4).map((b,i)=><span key={b.path}>{i?', ':''}<a href={b.path}>{b.name}</a></span>)}{bks.length>4?<>, and <a href="#learn-more">{bks.length-4} more</a></>:null}</>}]:[]),
    ...c.learn.slice(0,1).map(l=>({label:'Learn',value:<><a href={l.path}>{l.name}</a>: {l.line.replace(/\.$/,'')}</>}))]}/>
  {c.groups.map((g,i)=>{const id=g.id??`g-${i}`;return <section key={id} className={styles.section} aria-labelledby={id}>
   <h2 className={`${styles.h2} ${tgt.target}`} id={id}>{g.title} <span className={styles.count}>({g.links.length})</span></h2>
   {g.line&&<p>{g.line}</p>}
   {/* Nov 20 2026 (owner: "the players card still doesn't have the actual card from the game"): a card group lists the game's
       own cards at thumbnail size (GameCard.tsx; off-screen rows skip rendering, so their portraits load as they scroll near) */}
   {parent==='cards'&&g.links.every(l=>CARD_PAGE.test(l.path))?<CardThumbGrid links={g.links} eager={i===0?8:0}/>
   :<ul className={styles.list}>{g.links.map(l=><li key={l.path}><a href={l.path}><span className={styles.itemTitle}>{l.name}</span>{l.meta&&<span className={styles.itemMeta}>{l.meta}</span>}</a></li>)}</ul>}
  </section>;})}
  <section className={styles.section} aria-labelledby="learn-more"><h2 className={`${styles.h2} ${tgt.target}`} id="learn-more">Keep reading</h2>
   <ul className={styles.list}>{[...c.learn,...cross,...siblings.filter(s=>s.path!==c.path&&!c.learn.some(l=>l.path===s.path)&&!cross.some(l=>l.path===s.path)).map(s=>({path:s.path,name:s.h1,line:s.blurb})),
    {path:PARENT[parent].path,name:parent==='cards'?'Every player card':'The whole Fishbook',line:parent==='cards'?'All the cards, by position':'Every sea animal, by rarity'}]
    .map(l=><li key={l.path}><a href={l.path}><span className={styles.itemTitle}>{l.name}</span><span className={styles.itemMeta}>{l.line}</span></a></li>)}</ul>
  </section>
 </>;
}
