import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FUTSAL_LAWS_URL,RULES,RULES_HUB,RULE_LEAGUE_LINE,RULE_SOURCE_LINE,ruleBySlug} from '@/lib/site/rules';
import {TERMS_HUB} from '@/lib/site/terms';
import {drillLinksFor} from '@/lib/site/drills';
import {GUIDE_FOOT,diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {Bullets,DataTable,GuideIntro,LessonList,LinkList,SceneDiagram,Section} from '@/lib/site/GuideParts';
import {lessonPath} from '@/lib/site/lessons';
import {PLAY_PATH,articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../../site.module.css';

/** One rule (lib/site/rules.ts): the two-sentence answer, the diagram, what the referee looks for, mix-ups, formats, FAQ, lessons. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>RULES.map(r=>({slug:r.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const r=ruleBySlug(params.slug);if(!r)return {};
 return pageMeta(r.title,r.desc,r.path,{whole:true,image:{url:diagramUrl(r.picture),alt:`Diagram: ${r.name.toLowerCase()} in soccer`}});
}
export default function RulePage({params}:{params:{slug:string}}){
 const r=ruleBySlug(params.slug);if(!r)notFound();
 const crumbs=guideCrumbs({name:RULES_HUB.crumb,path:RULES_HUB.path},{name:r.name,path:r.path});
 const i=RULES.indexOf(r),next=[RULES[(i+1)%RULES.length],RULES[(i+2)%RULES.length]];
 const related=[...(r.slug==='substitutions-and-game-length'?[{path:'/tools/soccer-playing-time-calculator',name:'Soccer playing time calculator',line:'A fair substitution plan with equal minutes for every player'}]:[]),...r.exhibits,...r.links,...next.map(x=>({path:x.path,name:x.h1,line:`${x.law}, with a diagram`})),
  {path:RULES_HUB.path,name:'All soccer rules for kids',line:RULES_HUB.blurb},{path:TERMS_HUB.path,name:TERMS_HUB.h1,line:TERMS_HUB.blurb}];
 const futsal=r.slug==='futsal-rules',pair=r.scenes.length>1,last=r.scenes.length-1;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:r.title,path:r.path,description:r.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${r.name} (soccer rule)`,teaches:r.answer,image:diagramUrl(r.picture)})}/>
  <JsonLd data={faqLd(r.faq)}/>
  <GuideIntro crumbs={crumbs} h1={r.h1} lead={r.answer}/>
  <Section id="diagram" title={`${r.name}: diagram`}>
   {pair
    ?<div className={styles.pair}>{r.scenes.map((s,j)=><div key={s.title}><h3 className={styles.h3}>{s.title}</h3><SceneDiagram id={`s${j}`} scene={s} small image={j===last?diagramUrl(r.picture):undefined}/></div>)}</div>
    :<SceneDiagram id="s0" scene={r.scenes[0]} image={diagramUrl(r.picture)}/>}
  </Section>
  <Section id="referee" title="What the referee looks for">
   <Bullets items={r.refs}/>
   <p className={styles.caption}>Rule: {r.law}. {futsal?<a href={FUTSAL_LAWS_URL} rel="noopener">FIFA Futsal Laws of the Game 2025-26</a>:<a href={r.lawUrl} rel="noopener">Read it in the Laws of the Game (The IFAB)</a>}.</p>
  </Section>
  <Section id="mixups" title="Common mix-ups">
   <ul className={styles.stack}>{r.mixups.map(m=><li key={m.said} className={styles.card}><h3 className={styles.h3}>{m.said}</h3><p>{m.truth}</p></li>)}</ul>
  </Section>
  <Section id="formats" title={futsal?'Futsal at a glance':'In 7v7, 9v9, 11v11 and futsal'}>
   <DataTable label={`${r.name} by game format`} head={[futsal?'Topic':'Game',futsal?'Futsal rule':'How the rule works']} rows={r.formats}/>
   <p className={styles.caption}>{RULE_LEAGUE_LINE} {RULE_SOURCE_LINE}</p>
  </Section>
  <QA id="faq" title={`Questions about ${r.name.toLowerCase().replace('futsal rules','futsal rules')}`} faq={r.faq}/>
  <Section id="lessons" title="Lessons that go with this rule"><LessonList lessons={r.lessons}/></Section>
  {/* Nov 10 2026: drills that train this (lib/site/drillLinks.ts GUIDE_DRILLS) */}
  {drillLinksFor(r.path).length>0&&<Section id="drills" title="Soccer drills to practice this"><LinkList links={drillLinksFor(r.path)}/></Section>}
  <Section id="related" title="Keep reading"><LinkList links={related}/></Section>
  <p className={styles.caption}>{GUIDE_FOOT}</p>
  <p className={styles.end}>{r.cta?<a className={styles.cta} href={lessonPath(r.cta.id)}>Play the lesson: {r.cta.title}</a>:<a className={styles.cta} href={PLAY_PATH}>Play it on the island</a>}</p>
 </>;
}
