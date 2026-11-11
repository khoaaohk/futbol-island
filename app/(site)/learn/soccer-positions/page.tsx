import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS_HUB,formationBySlug,formatGuide} from '@/lib/site/formations';
import {NUMBERS,POSITIONS,POSITIONS_HUB as HUB,positionPath} from '@/lib/site/positions';
import {formationImage,guideCrumbs} from '@/lib/site/guides';
import {gameLink} from '@/lib/site/games';
import {Bullets,Diagram,GuideEnd,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../site.module.css';

/** /learn/soccer-positions: the positions hub (lib/site/positions.ts): all positions on one pitch, the numbers 1 to 11, positions by format. */
export const dynamic='force-static';
export const metadata=pageMeta(HUB.title,HUB.description,HUB.path,{whole:true,image:{url:formationImage('11v11-4-3-3'),alt:'Diagram of eleven soccer positions in a 4-3-3'}});
export default function PositionsHub(){
 const crumbs=guideCrumbs({name:HUB.crumb,path:HUB.path}),full=formationBySlug('11v11-4-3-3')!;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:HUB.h1,path:HUB.path,description:HUB.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:POSITIONS.map(p=>({name:p.name,path:p.path}))})}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <GuideIntro crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} cta/>
  <Section id="pitch" title="All eleven positions on one field">
   <Diagram id="all" format="11v11" lines={full.lines} what="the eleven soccer positions in a 4-3-3 formation" image={formationImage(full.slug)}/>
   <ul>{HUB.lines.map(l=><li key={l.name}><b>{l.name}.</b> {l.text}</li>)}</ul>
  </Section>
  <Section id="each" title="Each position explained"><LinkList links={POSITIONS.map(p=>({path:p.path,name:`${p.name} (${p.short})`,line:p.job}))}/></Section>
  <Section id="numbers" title="Soccer position numbers 1 to 11">
   <Bullets items={HUB.numbers}/>
   <div className={styles.tableWrap}><table className={styles.table}>
    <thead><tr><th scope="col">Number</th><th scope="col">Position</th><th scope="col">Job</th></tr></thead>
    <tbody>{NUMBERS.map(n=><tr key={n.n} data-number={n.n}><th scope="row">{n.n}</th><td><a href={positionPath(n.slug)}>{n.name}</a></td><td>{n.line}</td></tr>)}</tbody>
   </table></div>
  </Section>
  <Section id="formats" title="How positions change in 7v7, 9v9 and 11v11">
   <ul className={styles.stack}>{HUB.formats.map(x=>{const f=formationBySlug(x.slug)!,g=formatGuide(f.format);return <li key={x.format} className={styles.card}><h3 className={styles.h3}>{x.format}</h3><p>{x.text}</p>
    <p><a href={f.path}>See the {f.name} formation</a>{g&&<> or <a href={g.path}>compare {x.format} formations</a></>}.</p></li>;})}</ul>
   <p>{HUB.futsal} <a href="/learn/soccer-formations/futsal-3-1">See the futsal 3-1</a>.</p>
  </Section>
  <Section id="lessons" title="Lessons that introduce the positions"><LessonList lessons={HUB.lessons}/></Section>
  <QA id="faq" title="Questions about positions" faq={HUB.faq}/>
  <Section id="related" title="Keep reading"><LinkList links={[gameLink('snake'),gameLink('airhockey'),/* Air Futbol: the goalkeeper's rule (Nov 11 2026) *//* the arcade game that builds formations (lib/site/games.ts) */{path:FORMATIONS_HUB.path,name:FORMATIONS_HUB.h1,line:FORMATIONS_HUB.blurb},{path:'/learn/lessons',name:'All football lessons',line:'Every lesson in 7v7, 9v9, 11v11 and futsal'}]}/></Section>
  <GuideEnd cta={false}/>
 </>;
}
