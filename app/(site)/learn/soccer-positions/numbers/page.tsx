import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import ReadNext from '@/components/site/ReadNext';
import {formationBySlug} from '@/lib/site/formations';
import {POSITIONS_HUB} from '@/lib/site/positions';
import {ABBREVIATIONS,NUMBERS_PAGE as P,NUMBERS_UPDATED,NUMBER_ROWS} from '@/lib/site/positionNumbers';
import {formationImage,guideCrumbs} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {Bullets,DataTable,Diagram,GuideEnd,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {positionPath} from '@/lib/site/positions';

/** /learn/soccer-positions/numbers (lib/site/positionNumbers.ts, Nov 16 2026): positions by number 1-11 and the team-sheet letters. */
export const dynamic='force-static';
export const metadata=pageMeta(P.title,P.desc,P.path,{whole:true,image:{url:formationImage('11v11-4-3-3'),alt:'Diagram of the soccer position numbers 1 to 11 in a 4-3-3'}});
export default function NumbersPage(){
 const crumbs=guideCrumbs({name:POSITIONS_HUB.crumb,path:POSITIONS_HUB.path},{name:P.crumb,path:P.path}),f=formationBySlug('11v11-4-3-3')!;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:P.title,path:P.path,description:P.desc,published:NUMBERS_UPDATED,modified:NUMBERS_UPDATED,about:'Soccer positions by number',teaches:P.answer,image:formationImage(f.slug)})}/>
  <JsonLd data={faqLd(P.faq)}/>
  <GuideIntro crumbs={crumbs} h1={P.h1} lead={P.answer} more={P.more}/>
  <Section id="diagram" title="The numbers 1 to 11 on a soccer field">
   <Diagram id="n0" format="11v11" lines={f.lines} what="the soccer position numbers 1 to 11 in a 4-3-3 formation" image={formationImage(f.slug)}/>
  </Section>
  <Section id="table" title="What does each number mean in soccer?">
   <DataTable label="Soccer positions by number" head={['Number','Position','Letters','Job']}
    rows={NUMBER_ROWS.map(n=>[String(n.n),<a key={n.n} href={n.path}>{n.name}</a>,n.abbr,n.line])}/>
  </Section>
  <Section id="eleven" title="What are the 11 positions in soccer?"><Bullets items={P.eleven}/><p>{P.elevenNote}</p></Section>
  <Section id="center-back" title="What number is a center back?"><Bullets items={P.centerBack}/></Section>
  <Section id="letters" title="Soccer position abbreviations: CB, CDM, LCM, DF and more">
   <DataTable label="Soccer position abbreviations" head={['Letters','Position','What it means']}
    rows={ABBREVIATIONS.map(a=>[a.abbr,a.slug?<a key={a.abbr} href={positionPath(a.slug)}>{a.name}</a>:a.name,a.line])}/>
  </Section>
  <Section id="why" title="Why do soccer positions have numbers?"><Bullets items={P.why}/></Section>
  <Section id="small" title="Numbers in 7v7, 9v9 and futsal"><Bullets items={P.small}/></Section>
  <QA id="faq" title="Questions about position numbers" faq={P.faq}/>
  <Section id="lessons" title="Lessons that teach the positions"><LessonList lessons={P.lessons}/></Section>
  <Section id="related" title="Keep reading"><LinkList links={[
   {path:POSITIONS_HUB.path,name:'Soccer positions explained',line:POSITIONS_HUB.blurb},
   {path:f.path,name:'The 4-3-3 formation',line:f.best},
   {path:'/learn/soccer-positions/striker-vs-winger',name:'Striker vs winger',line:'The 9 and the 7 and 11, side by side'},
   {path:'/tools/11v11-lineup-builder',name:'11v11 lineup builder',line:'Put names on the numbers and print your lineup'},
   {path:'/learn/soccer-terms',name:'Soccer terms A to Z',line:'Every soccer word in plain English'}]}/></Section>
  <GuideEnd checked={FAMILY_CHECKED.positions}/>
  <ReadNext path={P.path}/>
 </>;
}
