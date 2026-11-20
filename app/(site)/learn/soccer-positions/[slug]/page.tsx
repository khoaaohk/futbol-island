import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import ReadNext from '@/components/site/ReadNext';
import GuideQuiz from '@/components/site/GuideQuiz';
import {positionQuiz} from '@/lib/site/guideQuiz';
import {guideQuizPart} from '@/lib/site/learningLd';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS_HUB,formationBySlug,formationsUsing} from '@/lib/site/formations';
import {POSITIONS,POSITIONS_HUB,positionBySlug} from '@/lib/site/positions';
import {NUMBERS_PATH} from '@/lib/site/positionNumbers';
import {guideCrumbs,positionImage} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {Bullets,CoachNotesSection,Diagram,GuideEnd,GuideIntro,type Fact,Section} from '@/lib/site/GuideParts';
import {drillLinksFor} from '@/lib/site/drills';
import {booksForRole} from '@/lib/site/crossLinks';
import {SITE_CARDS,cardPath} from '@/lib/site/cards';
import {articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {POSITION_NOTES} from '@/lib/site/notesGuides';
import {checkNotes} from '@/lib/site/coachNotes';
import {roleCollection} from '@/lib/site/collections';
import {comparisonsFor} from '@/lib/site/comparisons';
import styles from '../../../site.module.css';

/** One position (lib/site/positions.ts): the job in one sentence, where they stand, with and without the ball, habits, numbers, formations, FAQ, lessons, cards. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>POSITIONS.map(p=>({slug:p.slug}));
checkNotes('position',POSITIONS.map(x=>x.slug),POSITION_NOTES,{mistakes:true});/* every page has its own coach's notes (seo-boost, Nov 14 2026) */
export function generateMetadata({params}:{params:{slug:string}}){
 const p=positionBySlug(params.slug);if(!p)return {};
 return pageMeta(p.title,p.desc,p.path,{whole:true,image:{url:positionImage(p.slug),alt:`Diagram showing where the ${p.name.toLowerCase()} plays`}});
}
export default function PositionPage({params}:{params:{slug:string}}){
 const p=positionBySlug(params.slug);if(!p)notFound();
 const f=formationBySlug(p.diagram)!,lower=p.name.toLowerCase(),used=formationsUsing(p.slug);
 const crumbs=guideCrumbs({name:POSITIONS_HUB.crumb,path:POSITIONS_HUB.path},{name:p.name,path:p.path});
 const quiz=positionQuiz(p,POSITIONS);
 const hub=roleCollection(p.cardRole),compare=comparisonsFor(p.path);
 const cards=SITE_CARDS.filter(c=>c.role===p.cardRole&&!c.coach).slice(p.cardSkip,p.cardSkip+6);
 /* visual pass Nov 17 2026: the key facts under the answer, from this page's own data */
 const facts:Fact[]=[{icon:'shirt',label:'Shirt number',value:p.numbers,href:'#number'},{icon:'tag',label:'Short name',value:p.short},
  {icon:'lineup',label:'Where',value:`${f.shape} diagram`,href:'#where'},{icon:'quiz',label:'Quick quiz',value:`${quiz.length} questions`,href:'#quiz'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{...articleLd({headline:p.title,path:p.path,description:p.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${p.name} (soccer position)`,teaches:p.job,image:positionImage(p.slug)}),hasPart:guideQuizPart({path:p.path,name:`${p.name} quiz`,questions:quiz})}}/>
  <JsonLd data={faqLd(p.faq)}/>
  <GuideIntro crumbs={crumbs} h1={p.h1} lead={p.answer} more={p.suits} facts={facts}/>
  <Section id="where" title={`Where the ${lower} stands`}>
   <Diagram id="where-d" format={f.format} lines={f.lines} what={`the ${lower} position in a ${f.shape} formation`} mark={p.slug} markName={lower} image={positionImage(p.slug)}/>
   <p>{p.where}</p>
  </Section>
  <Section id="with" title="With the ball"><Bullets items={p.withBall}/></Section>
  <Section id="without" title="Without the ball"><Bullets items={p.withoutBall}/></Section>
  <Section id="habits" title="Three habits to practise">
   <ol className={styles.stack}>{p.habits.map(h=><li key={h.name} className={styles.card}><h3 className={styles.h3}>{h.name}</h3><p>{h.how}</p></li>)}</ol>
  </Section>
  <Section id="number" title={`Shirt number: ${p.numbers}`}>
   <p>{p.numberLine} The numbers are a coaching custom from the days when starters wore 1 to 11. Players today can wear any number. <a href={NUMBERS_PATH}>All soccer positions by number</a>.</p>
  </Section>
  <Section id="small" title="In 7v7, 9v9 and futsal" fold><p>{p.small}</p></Section>
  <QA id="faq" title={`Questions about the ${lower}`} faq={p.faq}/>
  <CoachNotesSection name={p.name} notes={POSITION_NOTES[p.slug]}/>
  <GuideQuiz id="quiz" name={`the ${lower}`} questions={quiz}/>
  {/* batch 3, Nov 17 2026: lessons, formations, player cards, drills (lib/site/drillLinks.ts), comparisons and the other positions
      as one "Keep reading" row (every link kept; the rest under "Show N more") */}
  <KeepReading groups={[{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(p.lessons)},
   {id:'formations',label:'Formation',icon:'lineup',links:used.length>0?[...used.map(x=>({path:x.path,name:`${x.name} formation`,line:x.roles.find(r=>r.pos===p.slug)?.title??x.best})),{path:FORMATIONS_HUB.path,name:'All soccer formations',line:FORMATIONS_HUB.blurb}]:[]},
   {id:'cards',label:'Player card',icon:'shirt',links:cards.length>0?[...cards.map(c=>({path:cardPath(c.number),name:c.displayName,line:[c.roleLabel,c.country].filter(Boolean).join(' · ')})),...(hub?[{path:hub.path,name:`See all ${hub.blurb.replace(/,.*$/,'')}`,line:hub.h1}]:[])]:[]},
   {id:'drills',label:'Drill',icon:'cone',links:drillLinksFor(p.path)},
   {id:'books',label:'Pop-up book',icon:'book',links:booksForRole(p.cardRole)},/* Nov 20 2026: the books about players of this position */
   {id:'compare',label:'Compare',icon:'swap',links:compare.map(c=>({path:c.path,name:c.h1,line:c.answer.split('. ')[0]+'.'}))},
   {id:'related',links:[...POSITIONS.filter(x=>x!==p).map(x=>({path:x.path,name:x.name,line:`Number ${x.numbers}`})),{path:NUMBERS_PATH,name:'Soccer positions by number',line:'1 to 11 and the letters: CB, CDM, LCM, DF'},{path:POSITIONS_HUB.path,name:'All soccer positions',line:POSITIONS_HUB.blurb}]}]}/>
  <GuideEnd path={p.path} checked={FAMILY_CHECKED.positions} lesson={p.lessons[0]}/>
  <ReadNext path={p.path}/>
 </>;
}
