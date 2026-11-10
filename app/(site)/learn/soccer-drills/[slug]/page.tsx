import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {DRILLS,DRILLS_HUB,DRILL_SAFETY_LINE,SKILLS,drillBySlug,drillLine,type Drill} from '@/lib/site/drills';
import {DRILL_GUIDES,SKILL_GUIDES,drillGuideBySlug,guidesForDrill,type DrillGuide} from '@/lib/site/drillGuides';
import {PLANS_HUB,plansForAge,plansForDrill} from '@/lib/site/plans';
import {GUIDE_FOOT,diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {Bullets,DataTable,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {DrillList,GridFigure,Steps} from '@/lib/site/DrillParts';
import {lessonPath} from '@/lib/site/lessons';
import {PLAY_PATH,articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../../site.module.css';

/**
 * /learn/soccer-drills/<slug>: one drill (lib/site/drills.ts) or one age / skill guide (lib/site/drillGuides.ts).
 * A drill page: the two-sentence answer, the setup diagram, the facts box, steps, coaching points, easier and harder versions,
 * mistakes, why it matters in a game (with the lesson that teaches it), an at-home version, FAQ and links.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>[...DRILLS.map(d=>({slug:d.slug})),...DRILL_GUIDES.map(g=>({slug:g.slug}))];
export function generateMetadata({params}:{params:{slug:string}}){
 const d=drillBySlug(params.slug);
 if(d)return pageMeta(d.title,d.desc,d.path,{whole:true,image:{url:diagramUrl(d.picture),alt:`Setup diagram: ${d.name} soccer drill`}});
 const g=drillGuideBySlug(params.slug);if(!g)return {};
 return pageMeta(g.title,g.desc,g.path,{whole:true,image:{url:diagramUrl(g.picture),alt:`Setup diagram of a soccer drill from the guide: ${g.h1}`}});
}
const HUB_CRUMB={name:DRILLS_HUB.crumb,path:DRILLS_HUB.path};
function DrillPage({d}:{d:Drill}){
 const crumbs=guideCrumbs(HUB_CRUMB,{name:d.name,path:d.path}),skill=SKILLS.find(s=>s.id===d.skill)!,skillGuide=SKILL_GUIDES.find(g=>g.picks.some(p=>p.drill===d));
 const related=[...d.related.map(s=>drillBySlug(s)!).map(x=>({path:x.path,name:`${x.name} (drill)`,line:drillLine(x)})),...d.links,
  ...guidesForDrill(d).map(g=>({path:g.path,name:g.h1,line:g.blurb})),...(skillGuide?[{path:skillGuide.path,name:skillGuide.h1,line:skillGuide.blurb}]:[]),
  ...plansForDrill(d.slug).slice(0,2).map(p=>({path:p.path,name:p.h1,line:`A ${p.minutes}-minute plan that uses this drill`})),
  {path:`${DRILLS_HUB.path}#${skill.id}`,name:`All ${skill.name.toLowerCase()} drills`,line:skill.line}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:d.title,path:d.path,description:d.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${d.name} (soccer drill)`,teaches:d.answer,image:diagramUrl(d.picture)})}/>
  <JsonLd data={faqLd(d.faq)}/>
  <GuideIntro crumbs={crumbs} h1={d.h1} lead={d.answer}/>
  <Section id="diagram" title={`${d.name}: setup diagram`}><GridFigure id="s0" scene={d.scene} image={diagramUrl(d.picture)}/></Section>
  <Section id="facts" title="At a glance">
   <DataTable label={`${d.name}: ages, players, space, equipment and time`} head={['Detail','For this drill']} rows={[['Ages',d.agesText],['Players',d.players],['Space',d.space],['Equipment',d.equipment],['Time',d.time],['Skill',skill.name]]}/>
   <p className={styles.caption}>{DRILL_SAFETY_LINE}</p>
  </Section>
  <Section id="steps" title="How to run it"><Steps items={d.steps}/></Section>
  <Section id="cues" title="Coaching points to say out loud"><Bullets items={d.cues}/></Section>
  <Section id="versions" title="Make it easier or harder">
   <ul className={styles.stack}><li className={styles.card}><h3 className={styles.h3}>Easier</h3><p>{d.easier}</p></li><li className={styles.card}><h3 className={styles.h3}>Harder</h3><p>{d.harder}</p></li></ul>
  </Section>
  <Section id="mistakes" title="Common mistakes"><Bullets items={d.mistakes}/></Section>
  <Section id="game" title="Why it matters in a game">
   <p>{d.game}</p>
   <p>The lesson that teaches it: <a href={lessonPath(d.cta.id)}>{d.cta.title}</a>.</p>
  </Section>
  {d.home&&<Section id="home" title="Do it at home"><p>{d.home}</p></Section>}
  <QA id="faq" title={`Questions about ${d.name}`} faq={d.faq}/>
  <Section id="lessons" title="Lessons that teach this idea"><LessonList lessons={d.lessons}/></Section>
  <Section id="related" title="Related drills and guides"><LinkList links={related}/></Section>
  <p className={styles.caption}>{GUIDE_FOOT}</p>
  <p className={styles.end}><a className={styles.cta} href={lessonPath(d.cta.id)}>Play the lesson: {d.cta.title}</a></p>
 </>;
}
function GuidePage({g}:{g:DrillGuide}){
 const crumbs=guideCrumbs(HUB_CRUMB,{name:g.name,path:g.path}),featured=drillBySlug(g.featured)!;
 const others=DRILL_GUIDES.filter(x=>x!==g&&x.kind===g.kind).map(x=>({path:x.path,name:x.h1,line:x.blurb}));
 const plans=g.age?plansForAge(g.age).map(p=>({path:p.path,name:p.h1,line:`${p.minutes} minutes, with a clock table`})):[];
 const sections=(list:DrillGuide['before'])=>list.map(s=><Section key={s.id} id={s.id} title={s.title}><Bullets items={s.items}/></Section>);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:g.title,path:g.path,description:g.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${g.name} (soccer coaching guide)`,teaches:g.lead,image:diagramUrl(g.picture)})}/>
  <JsonLd data={faqLd(g.faq)}/>
  <GuideIntro crumbs={crumbs} h1={g.h1} lead={g.lead} more={g.more}/>
  {g.facts&&<Section id="facts" title={g.facts.label}>
   <DataTable label={g.facts.label} head={['Detail',g.age??'Value']} rows={g.facts.rows}/>
   <p className={styles.caption}>{g.facts.note}</p>
  </Section>}
  {sections(g.before)}
  <Section id="drills" title={g.picksTitle}><DrillList items={g.picks}/></Section>
  <Section id="diagram" title={`Example: ${featured.name}`}>
   <GridFigure id="s0" scene={featured.scene} image={diagramUrl(featured.picture)}/>
   <p>{featured.answer} <a href={featured.path}>See the full drill</a>.</p>
  </Section>
  {sections(g.after)}
  {plans.length>0&&<Section id="plans" title={`${g.age} practice plans`}><LinkList links={plans}/></Section>}
  <QA id="faq" title={`Questions about ${g.kind==='age'?g.name:g.name.toLowerCase()}`} faq={g.faq}/>
  <Section id="lessons" title="Lessons to go with these drills"><LessonList lessons={g.lessons}/></Section>
  <Section id="related" title="Keep reading"><LinkList links={[...others,...g.links,{path:DRILLS_HUB.path,name:'All soccer drills for kids',line:DRILLS_HUB.blurb},{path:PLANS_HUB.path,name:PLANS_HUB.h1,line:PLANS_HUB.blurb}]}/></Section>
  <p className={styles.caption}>{GUIDE_FOOT}</p>
  <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Play it on the island</a></p>
 </>;
}
export default function DrillOrGuide({params}:{params:{slug:string}}){
 const d=drillBySlug(params.slug);if(d)return <DrillPage d={d}/>;
 const g=drillGuideBySlug(params.slug);if(!g)notFound();
 return <GuidePage g={g}/>;
}
