import JsonLd from '@/components/seo/JsonLd';
import rt from './railTarget.module.css';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import GuideVideo from '@/components/site/GuideVideo';
import {guideVideo} from '@/lib/site/guideVideos';
import {HUBS,SAFE_GUIDE,type Hub} from '@/lib/site/hubs';
import {GUIDE_HUBS} from '@/lib/site/guides';
import {TOOL_HUBS} from '@/lib/site/tools/registry';
import {LESSONS_INDEX,lessonPath,type SiteLesson} from '@/lib/site/lessons';
import {SAFE_TRUST_LINE} from '@/lib/site/safety';
import {breadcrumbLd,collectionLd,faqLd,PLAY_PATH} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import FaqEnhance from '@/components/learn/FaqEnhance';
import KeepReading from './KeepReading';
import {Band,CardGrid,groupIcon,Hero,lessonIcon,type HubCard} from './HubParts';
import styles from '@/app/(site)/site.module.css';
import RailNav from './shell/RailNav';
import {hubRail,sec} from '@/lib/site/railNavMore';
import type {RailItem} from '@/lib/site/railNav';
/**
 * One topic hub (lib/site/hubs.ts): answer-first lead, the lesson groups as linked lists, short Q&A (mirrored exactly in the
 * FAQPage JSON-LD), related hubs and one gold Play link. Server-rendered, no client code, the reading pages' one stylesheet.
 */
export const hubCrumbs=(h:{crumb:string;path:string})=>[{name:'Home',path:'/'},{name:'Lessons',path:LESSONS_INDEX},{name:h.crumb,path:h.path}];

/** The questions (visual pass, Nov 17 2026): one list of plain rows like the home page's FAQ, each a native <details> whose
 *  <summary> holds the question as an h3; the answer text is in the HTML whether open or closed, so the FAQPage JSON-LD (faq only)
 *  still matches what the page shows. The first one starts open. `more`: extra questions shown in the same list but not in the
 *  JSON-LD (the cards page's side questions, merged so a page has one FAQ). `children`: a caption under the list.
 *  components/learn/FaqEnhance.tsx animates open / close; without JS the plain <details> works. */
export function QA({id,title,faq,more=[],children}:{id:string;title:string;faq:readonly {q:string;a:string}[];more?:readonly {q:string;a:string}[];children?:React.ReactNode}){
 const seen=new Set<string>(),items=[...faq,...more].filter(f=>!seen.has(f.q)&&!!seen.add(f.q));
 return <section className={styles.section} aria-labelledby={id}><h2 className={`${styles.h2} ${rt.target}`} id={id}>{title}</h2>
  <div className={styles.faqList} data-faq={id}>{items.map((f,i)=><details key={f.q} className={styles.faqItem} open={i===0||undefined} data-x={i===0?'':undefined}>
   <summary className={styles.faqSum}><h3 className={styles.faqQ}>{f.q}</h3><span className={styles.plus} aria-hidden="true"/></summary>
   <div className={styles.faqBody}><div className={styles.faqIn}><p>{f.a}</p></div></div></details>)}</div>
  {children}
  <FaqEnhance selector={`[data-faq="${id}"]`}/>
 </section>;
}

/** "More to learn" (batch 3, Nov 17 2026): the other hubs, guide clusters, coach tools, games and the parents' guide as one
 *  "Keep reading" grid (components/site/KeepReading.tsx), each card's icon and word taken from its path; every link kept. */
export function MoreToLearn({except}:{except?:string}){
 const links=[...HUBS.filter(h=>h.path!==except).map(h=>({path:h.path,name:h.h1,line:h.blurb})),...GUIDE_HUBS.map(g=>({path:g.path,name:g.name[0].toUpperCase()+g.name.slice(1),line:g.blurb})),/* guide clusters (lib/site/guides.ts) */...TOOL_HUBS.map(t=>({path:t.path,name:t.name[0].toUpperCase()+t.name.slice(1),line:t.blurb})),/* coach tools (lib/site/tools/registry.ts) */{path:LESSONS_INDEX,name:'All football lessons'},{path:'/games',name:'Free soccer games for kids'},/* the arcade games' search pages (lib/site/games.ts) */{path:SAFE_GUIDE.path,name:'For parents: a safe football game'}].filter(l=>l.path!==except);
 return <KeepReading id="more" title="More to learn" groups={[{id:'more-topics',links}]}/>;
}

/** A hub's lesson as a chapter card: the concept icon from its category, the format, the concept (or, on the quiz hub, the
 *  first question) as the line. */
export const lessonCard=(l:SiteLesson,quiz?:boolean):HubCard=>({path:quiz?`${lessonPath(l.id)}#quiz`:lessonPath(l.id),name:l.title,icon:lessonIcon(l.category),
 meta:quiz?`${l.formatLabel} · ${l.questions.length} questions`:`${l.formatLabel} lesson`,line:quiz?l.questions[0]?.q:l.concept});

/** `extra`: rail entries for the page's own sections passed as children (they come before the lesson groups). */
export default function LessonHub({hub,children,extra=[]}:{hub:Hub;children?:React.ReactNode;extra?:readonly RailItem[]}){
 const crumbs=hubCrumbs(hub),items=hub.groups.flatMap(g=>g.lessons);
 /* the side nav (owner, Nov 20 2026: "all internal pages need to have side navs"): Back to the Library, Overview, then what is on
    this hub in page order: its own sections, each lesson group, the questions and More to learn */
 const rail=hubRail(`${hub.crumb} on this page`,[{items:[...(guideVideo(hub.path)?[sec(`clip-${guideVideo(hub.path)!.key}`,'See it in the game')]:[]),...extra,...hub.groups.map((g,i)=>sec(`g-${i}`,g.title)),sec('faq','Questions'),sec('more','More to learn')]}]);
 return <>
  <RailNav rail={rail} current="#top"/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:hub.h1,path:hub.path,description:hub.description,published:SITE_UPDATED.hubs,modified:SITE_UPDATED.hubs,
   items:items.map(l=>({name:`${l.title} (${l.formatLabel})`,path:lessonPath(l.id)}))})}/>
  <JsonLd data={faqLd(hub.faq)}/>
  <Hero video={guideVideo(hub.path)?<GuideVideo path={hub.path}/>:null}>{/* batch 3: the game clip beside the intro on wide screens (components/site/HubParts.tsx) */}
  <header className={`${styles.intro} ${rt.target}`} id="top">
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{hub.h1}</h1>
   <p className={styles.lead}>{hub.lead}</p>
   <p className={styles.caption}>{SAFE_TRUST_LINE} <a href={SAFE_GUIDE.path}>Read the parents’ guide</a>.</p>
   <a className={styles.cta} href={PLAY_PATH}>Play it on the island</a>
  </header>
  </Hero>
  {children}{/* page-specific sections before the lesson groups (Nov 15 2026: the 7v7 vs 9v9 vs 11v11 table) */}
  {/* batch 3, Nov 17 2026: each group a chapter band: icon, title, what you'll learn, the count, then six lesson cards and
      "Show all N" (every lesson link stays in the HTML and in the CollectionPage JSON-LD) */}
  {hub.groups.map((g,i)=><Band key={g.title} id={`g-${i}`} title={g.title} line={g.line} tone={i%2?'paper':'tint'} icon={groupIcon(g.lessons)}
   count={hub.showQuestion?`${g.lessons.length} ${g.lessons.length===1?'quiz':'quizzes'}`:`${g.lessons.length} ${g.lessons.length===1?'lesson':'lessons'}`}>
   <CardGrid cards={g.lessons.map(l=>lessonCard(l,hub.showQuestion))}/>
  </Band>)}
  <QA id="faq" title="Questions and answers" faq={hub.faq}/>
  <MoreToLearn except={hub.path}/>
  <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Play it on the island</a></p>
 </>;
}
