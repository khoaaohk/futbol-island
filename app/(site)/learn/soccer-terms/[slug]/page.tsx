import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {TERMS_HUB,TERM_PAGES,termBySlug} from '@/lib/site/terms';
import {RULES_HUB} from '@/lib/site/rules';
import {GUIDE_FOOT,diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {Bullets,GuideIntro,LessonList,LinkList,SceneDiagram,Section} from '@/lib/site/GuideParts';
import {lessonPath} from '@/lib/site/lessons';
import {PLAY_PATH,abs,articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../../site.module.css';

/** One glossary term with a page of its own (lib/site/terms.ts): the answer, a diagram, the steps, mistakes, FAQ, lessons. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>TERM_PAGES.map(t=>({slug:t.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const t=termBySlug(params.slug);if(!t)return {};
 return pageMeta(t.title,t.desc,t.path,{whole:true,image:{url:diagramUrl(t.picture),alt:`Diagram: ${t.scene.title.toLowerCase()} in soccer`}});
}
export default function TermPage({params}:{params:{slug:string}}){
 const t=termBySlug(params.slug);if(!t)notFound();
 const crumbs=guideCrumbs({name:TERMS_HUB.crumb,path:TERMS_HUB.path},{name:t.name,path:t.path});
 const related=[...t.related.map(s=>termBySlug(s)!).map(x=>({path:x.path,name:x.name,line:x.short})),
  {path:TERMS_HUB.path,name:'All soccer terms, A to Z',line:TERMS_HUB.blurb},{path:RULES_HUB.path,name:RULES_HUB.h1,line:RULES_HUB.blurb}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:t.title,path:t.path,description:t.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${t.name} (soccer term)`,teaches:t.answer,image:diagramUrl(t.picture)})}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'DefinedTerm',name:t.name,description:t.short,url:abs(t.path),inDefinedTermSet:abs(TERMS_HUB.path)+'#terms',...(t.also?{alternateName:t.also.split(', ')}:{})}}/>
  <JsonLd data={faqLd(t.faq)}/>
  <GuideIntro crumbs={crumbs} h1={t.h1} lead={t.answer} more={t.also?`Other names: ${t.also}.`:undefined}/>
  <Section id="diagram" title={`${t.name}: diagram`}><SceneDiagram id="s0" scene={t.scene} image={diagramUrl(t.picture)}/></Section>
  <Section id="how" title={t.howTitle}><ol>{t.how.map(h=><li key={h}>{h}</li>)}</ol></Section>
  <Section id="mistakes" title="Common mistakes"><Bullets items={t.mistakes}/></Section>
  <Section id="formats" title="In 7v7, 9v9, 11v11 and futsal"><p>{t.formats}</p></Section>
  <QA id="faq" title={`Questions about the ${t.name.toLowerCase()}`} faq={t.faq}/>
  <Section id="lessons" title="Lessons that teach it"><LessonList lessons={t.lessons}/></Section>
  <Section id="related" title="Related soccer terms"><LinkList links={related}/></Section>
  <p className={styles.caption}>{GUIDE_FOOT}</p>
  <p className={styles.end}>{t.cta?<a className={styles.cta} href={lessonPath(t.cta.id)}>Play the lesson: {t.cta.title}</a>:<a className={styles.cta} href={PLAY_PATH}>Play it on the island</a>}</p>
 </>;
}
