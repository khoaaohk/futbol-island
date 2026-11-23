import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import {withMesh} from '@/lib/site/mesh';
import RailNav from '@/components/site/shell/RailNav';
import {onwardFor} from '@/lib/site/railNav';
import {guideRail} from '@/lib/site/railNavMore';
import ReadNext from '@/components/site/ReadNext';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS,FORMATIONS_HUB,formationBySlug,formationsIn,formatGuide,withKeeper} from '@/lib/site/formations';
import {POSITIONS_HUB,positionPath} from '@/lib/site/positions';
import {formationImage,guideCrumbs} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {Bullets,CoachNotesSection,Diagram,GuideEnd,GuideIntro,Section} from '@/lib/site/GuideParts';
import {lessonById,lessonPath} from '@/lib/site/lessons';
import {PLAYERS_PER_TEAM} from '@/lib/site/pitch';
import {articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {lineupLinkFor} from '@/lib/site/tools/registry';
import {FORMATION_NOTES} from '@/lib/site/notesGuides';
import {checkNotes} from '@/lib/site/coachNotes';
import {comparisonsFor} from '@/lib/site/comparisons';
import {AppLink} from '@/components/site/tools/ToolParts';
import styles from '../../../site.module.css';

/** One formation (lib/site/formations.ts): the answer first, a pitch diagram, every role, strengths, weak spots, how it moves, FAQ, lessons. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>FORMATIONS.map(f=>({slug:f.slug}));
checkNotes('formation',FORMATIONS.map(x=>x.slug),FORMATION_NOTES,{mistakes:true});/* every page has its own coach's notes (seo-boost, Nov 14 2026) */
export function generateMetadata({params}:{params:{slug:string}}){
 const f=formationBySlug(params.slug);if(!f)return {};
 return pageMeta(f.title,f.desc,f.path,{whole:true,image:{url:formationImage(f.slug),alt:`Diagram of the ${f.name} formation`}});
}
export default function FormationPage({params}:{params:{slug:string}}){
 const f=formationBySlug(params.slug);if(!f)notFound();
 const futsal=f.format==='futsal',guide=formatGuide(f.format),what=`the ${f.name} formation`;
 const crumbs=guideCrumbs({name:FORMATIONS_HUB.crumb,path:FORMATIONS_HUB.path},{name:f.name,path:f.path});
 const related=[...(guide?[{path:guide.path,name:guide.h1,line:guide.blurb}]:[{path:'/learn/futsal-for-kids',name:'Futsal lessons for kids',line:'Every futsal lesson, grouped by topic'}]),
  ...formationsIn(f.format).filter(x=>x!==f).map(x=>({path:x.path,name:`${x.name} formation`,line:x.best})),
  {path:POSITIONS_HUB.path,name:POSITIONS_HUB.h1,line:POSITIONS_HUB.blurb},{path:FORMATIONS_HUB.path,name:'All soccer formations',line:FORMATIONS_HUB.blurb}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:f.title,path:f.path,description:f.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${f.name} soccer formation`,teaches:f.answer,image:formationImage(f.slug)})}/>
  <JsonLd data={faqLd(f.faq)}/>
  <GuideIntro top rail={<RailNav rail={guideRail('formations')} current="#top"/>} onward={onwardFor(f.lessons[0])} crumbs={crumbs} h1={f.h1} lead={f.answer}/>
  <Section id="diagram" title={`${f.name} diagram`}>
   <Diagram id="base" format={f.format} lines={f.lines} what={what} image={formationImage(f.slug)}/>
   <p><a href={lineupLinkFor(f.slug)}>Build this lineup</a>: put your players’ names on the {f.shape} in the free lineup builder, then print it or share a link. To show how the shape moves, draw a play on the <a href="/tools/soccer-tactics-board">free tactics board</a>.</p>
   {/* round 4F: fútbol 8 is played with rolling changes, which the coach app plans (lib/coach/route.ts: the hash names a tool and a format) */}
   {f.format==='8v8'&&<AppLink href="/coach#tool=lineup&format=8v8" label="Open the coach app" line={`Pick the ${f.shape} in the free coach app, put the names on it, and it plans fútbol 8’s rolling changes so every child plays.`}/>}
   {futsal
    ?<p>{f.shape} counts the four outfield players from the back to the front. The goalkeeper is counted separately, so a futsal team has {PLAYERS_PER_TEAM.futsal} players on the court.</p>
    :<p>Coaches write this shape in two ways. <b>{f.shape}</b> counts the {PLAYERS_PER_TEAM[f.format]-1} outfield players, from the defense forward. U.S. Soccer counts the goalkeeper first and writes <b>{withKeeper(f)}</b>. Both mean the same formation. The numbers on the dots are a common coaching custom, not a rule: players can wear any shirt number.</p>}
  </Section>
  <Section id="roles" title="Who plays where">
   <ul>{f.roles.map(r=><li key={r.title}><b>{r.pos?<a href={positionPath(r.pos)}>{r.title}</a>:r.title}.</b> {r.job}</li>)}</ul>
  </Section>
  <Section id="strengths" title={`Strengths of the ${f.shape}`}><Bullets items={f.strengths}/></Section>
  <Section id="weak" title="Weak spots and how to cover them">
   <ul className={styles.stack}>{f.weak.map(w=>{const l=w.lesson?lessonById(w.lesson):undefined;return <li key={w.spot} className={styles.card}><h3 className={styles.h3}>{w.spot}</h3>
    <p><b>How to cover it:</b> {w.cover}{l&&<> Lesson: <a href={lessonPath(l.id)}>{l.title}</a>.</>}</p></li>;})}</ul>
  </Section>
  <Section id="moves" title={`How the ${f.shape} moves`}>
   <div className={styles.pair}>
    <div><h3 className={styles.h3}>When your team has the ball</h3><Diagram id="attack" format={f.format} lines={f.lines} what={`${what} attacking`} mode="attack" small/><p>{f.attack}</p></div>
    <div><h3 className={styles.h3}>When the other team has the ball</h3><Diagram id="defend" format={f.format} lines={f.lines} what={`${what} defending`} mode="defend" small/><p>{f.defend}</p></div>
   </div>
  </Section>
  <Section id="suits" title="Who it suits"><p>{f.suits}</p></Section>
  <QA id="faq" title={`Questions about the ${f.shape}`} faq={f.faq}/>
  <CoachNotesSection name={f.name} notes={FORMATION_NOTES[f.slug]}/>
  {f.sources&&<Section id="sources" title="Sources">
   <ul>{f.sources.map(x=><li key={x.url}><a href={x.url} rel="noopener">{x.name}</a>: {x.says}.</li>)}</ul>
  </Section>}
  {/* batch 3, Nov 17 2026: lessons, comparisons and related pages as one "Keep reading" row */}
  <KeepReading groups={withMesh([{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(f.lessons)},{id:'compare',label:'Compare',icon:'swap',links:comparisonsFor(f.path).map(c=>({path:c.path,name:c.h1,line:c.answer.split('. ')[0]+'.'}))},{id:'related',links:related}],f.path)}/>
  <GuideEnd path={f.path} checked={FAMILY_CHECKED.formations} lesson={f.lessons[0]}/>
  <ReadNext path={f.path}/>
 </>;
}
