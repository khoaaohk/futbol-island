import JsonLd from '@/components/seo/JsonLd';
import RailNav from '@/components/site/shell/RailNav';
import {anchor,hubRail} from '@/lib/site/railNavMore';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS_HUB,formationBySlug,formatGuide} from '@/lib/site/formations';
import {NUMBERS,POSITIONS,POSITIONS_HUB as HUB,positionPath} from '@/lib/site/positions';
import {formationImage,guideCrumbs} from '@/lib/site/guides';
import {gameLink} from '@/lib/site/games';
import {Bullets,DataTable,Diagram,GuideEnd,GuideIntro,Section} from '@/lib/site/GuideParts';
import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import {booksWithoutCard} from '@/lib/site/crossLinks';
import {Band,CardGrid,shirtBadge} from '@/components/site/HubParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {COMPARISONS} from '@/lib/site/comparisons';
import {NUMBERS_PAGE} from '@/lib/site/positionNumbers';
import {CARD_COLLECTIONS} from '@/lib/site/collections';
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
  <GuideIntro top rail={<RailNav rail={hubRail('Soccer positions on this page',[{title:'Each position',items:POSITIONS.map(p=>anchor('position',p.path,p.name))}])} current="#top"/>} crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} cta/>
  <Section id="pitch" title="All eleven positions on one field">
   <Diagram id="all" format="11v11" lines={full.lines} what="the eleven soccer positions in a 4-3-3 formation" image={formationImage(full.slug)}/>
   <ul>{HUB.lines.map(l=><li key={l.name}><b>{l.name}.</b> {l.text}</li>)}</ul>
  </Section>
  {/* batch 3, Nov 17 2026 (audit rank 9): the positions as a chapter of cards, each with its shirt number */}
  <Band id="each" title="Each position explained" tone="tint" icon="shirt" count={`${POSITIONS.length} positions`}>
   <CardGrid ids="position" show={POSITIONS.length} cards={POSITIONS.map(p=>({path:p.path,name:`${p.name} (${p.short})`,line:p.job,icon:'shirt' as const,badge:shirtBadge(p.numbers)}))}/>
  </Band>
  {/* SEO batch C, Nov 25 2026: every position's job in attack and in defense, one row each (the same lines as each page's at-a-glance table) */}
  <Section id="jobs" title="What each soccer position does in attack and defense">
   <DataTable label="What each soccer position does" head={['Position','In attack','In defense']} rows={POSITIONS.map(p=>[<a key={p.slug} href={p.path}>{p.name}</a>,p.glance.attack,p.glance.defend])}/>
  </Section>
  <Section id="numbers" title="Soccer position numbers 1 to 11">
   <Bullets items={HUB.numbers}/>
   <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Soccer position numbers"><table className={styles.table}>
    <thead><tr><th scope="col">Number</th><th scope="col">Position</th><th scope="col">Job</th></tr></thead>
    <tbody>{NUMBERS.map(n=><tr key={n.n} data-number={n.n}><th scope="row">{n.n}</th><td><a href={positionPath(n.slug)}>{n.name}</a></td><td>{n.line}</td></tr>)}</tbody>
   </table></div>
   <p><a href={NUMBERS_PAGE.path}>Soccer positions by number</a>: what CB, CDM, LCM and DF stand for, and the numbers center backs wear.</p>
  </Section>
  <Section id="formats" title="How positions change in 7v7, 9v9 and 11v11">
   <ul className={styles.stack}>{HUB.formats.map(x=>{const f=formationBySlug(x.slug)!,g=formatGuide(f.format);return <li key={x.format} className={styles.card}><h3 className={styles.h3}>{x.format}</h3><p>{x.text}</p>
    <p><a href={f.path}>See the {f.name} formation</a>{g&&<> or <a href={g.path}>compare {x.format} formations</a></>}.</p></li>;})}</ul>
   <p>{HUB.futsal} <a href="/learn/soccer-formations/futsal-3-1">See the futsal 3-1</a>.</p>
  </Section>
  <QA id="faq" title="Questions about positions" faq={HUB.faq}/>
  <KeepReading groups={[{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(HUB.lessons)},{id:'books',label:'Pop-up book',icon:'book',links:booksWithoutCard()},/* Nov 20 2026: the books whose player has no card page yet */{id:'compare',links:[...COMPARISONS.filter(c=>c.kind==='position').map(c=>({path:c.path,name:c.h1,line:c.answer.split('. ')[0]+'.'})),...CARD_COLLECTIONS.filter(h=>h.slug!=='coaches'&&h.slug!=='futsal'&&h.slug!=='women'&&h.slug!=='world-cup-winners').map(h=>({path:h.path,name:h.h1.replace(/: player cards$/,''),line:h.blurb}))]},   {id:'related',links:[{path:'/tools/soccer-field-diagrams/soccer-positions-and-numbers',name:'Soccer positions and numbers chart',line:'Every position and its shirt number on one printable page'},/* Nov 23 2026 (seo-unindexed): the chart had 3 inlinks */gameLink('snake'),gameLink('airhockey'),/* Air Futbol: the goalkeeper's rule (Nov 11 2026) *//* the arcade game that builds formations (lib/site/games.ts) */{path:FORMATIONS_HUB.path,name:FORMATIONS_HUB.h1,line:FORMATIONS_HUB.blurb},{path:'/learn/lessons',name:'All football lessons',line:'Every lesson in 7v7, 9v9, 11v11 and futsal'}]}]}/>
  <GuideEnd cta={false}/>
 </>;
}
