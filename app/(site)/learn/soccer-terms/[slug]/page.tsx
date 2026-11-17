import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import ReadNext from '@/components/site/ReadNext';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {TERMS_HUB,TERM_PAGES,termBySlug} from '@/lib/site/terms';
import {RULES_HUB} from '@/lib/site/rules';
import {drillLinksFor} from '@/lib/site/drills';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {Bullets,CoachNotesSection,GuideEnd,GuideIntro,type Fact,SceneDiagram,Section} from '@/lib/site/GuideParts';
import GuideQuiz from '@/components/site/GuideQuiz';
import {termQuiz} from '@/lib/site/guideQuiz';
import {guideQuizPart} from '@/lib/site/learningLd';
import {ANIMATED_TERMS} from '@/lib/site/sceneMotion';
import {abs,articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {TERM_NOTES} from '@/lib/site/notesGuides';
import {checkNotes} from '@/lib/site/coachNotes';

/** One glossary term with a page of its own (lib/site/terms.ts): the answer, a diagram, the steps, mistakes, FAQ, lessons. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>TERM_PAGES.map(t=>({slug:t.slug}));
checkNotes('term',TERM_PAGES.map(x=>x.slug),TERM_NOTES);/* every page has its own coach's notes (seo-boost, Nov 14 2026) */
export function generateMetadata({params}:{params:{slug:string}}){
 const t=termBySlug(params.slug);if(!t)return {};
 return pageMeta(t.title,t.desc,t.path,{whole:true,image:{url:diagramUrl(t.picture),alt:`Diagram: ${t.scene.title.toLowerCase()} in soccer`}});
}
export default function TermPage({params}:{params:{slug:string}}){
 const t=termBySlug(params.slug);if(!t)notFound();
 const crumbs=guideCrumbs({name:TERMS_HUB.crumb,path:TERMS_HUB.path},{name:t.name,path:t.path});
 const quiz=termQuiz(t,TERM_PAGES);
 const related=[...t.related.map(s=>termBySlug(s)!).map(x=>({path:x.path,name:x.name,line:x.short})),
  {path:TERMS_HUB.path,name:'All soccer terms, A to Z',line:TERMS_HUB.blurb},{path:RULES_HUB.path,name:RULES_HUB.h1,line:RULES_HUB.blurb}];
 const rel=t.related.map(s=>termBySlug(s)).find(Boolean);
 /* visual pass Nov 17 2026: the key facts under the answer (the "Other names" line moved in here) */
 const facts:Fact[]=[t.also?{icon:'tag',label:'Other names',value:t.also}:{icon:'diagram',label:'Diagram',value:'A pitch picture',href:'#diagram'},
  {icon:'steps',label:'How it works',value:`${t.how.length} steps`,href:'#how'},
  ...(rel?[{icon:'link' as const,label:'Related term',value:rel.name,href:rel.path}]:[]),{icon:'quiz',label:'Quick quiz',value:`${quiz.length} questions`,href:'#quiz'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{...articleLd({headline:t.title,path:t.path,description:t.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${t.name} (soccer term)`,teaches:t.answer,image:diagramUrl(t.picture)}),hasPart:guideQuizPart({path:t.path,name:`${t.name} quiz`,questions:quiz})}}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'DefinedTerm',name:t.name,description:t.short,url:abs(t.path),inDefinedTermSet:abs(TERMS_HUB.path)+'#terms',...(t.also?{alternateName:t.also.split(', ')}:{})}}/>
  <JsonLd data={faqLd(t.faq)}/>
  <GuideIntro crumbs={crumbs} h1={t.h1} lead={t.answer} facts={facts}/>
  <Section id="diagram" title={`${t.name}: diagram`}><SceneDiagram id="s0" scene={t.scene} image={diagramUrl(t.picture)} animate={(ANIMATED_TERMS as readonly string[]).includes(t.slug)?t.name.toLowerCase():undefined}/></Section>
  <Section id="how" title={t.howTitle}><ol>{t.how.map(h=><li key={h}>{h}</li>)}</ol></Section>
  <Section id="mistakes" title="Common mistakes"><Bullets items={t.mistakes}/></Section>
  <Section id="formats" title="In 7v7, 9v9, 11v11 and futsal" fold><p>{t.formats}</p></Section>
  <QA id="faq" title={`Questions about the ${t.name.toLowerCase()}`} faq={t.faq}/>
  <CoachNotesSection name={t.name} notes={TERM_NOTES[t.slug]}/>
  <GuideQuiz id="quiz" name={t.name.toLowerCase()} questions={quiz}/>
  {/* batch 3, Nov 17 2026: lessons, drills (lib/site/drillLinks.ts GUIDE_DRILLS) and related terms as one "Keep reading" row */}
  <KeepReading groups={[{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(t.lessons)},{id:'drills',label:'Drill',icon:'cone',links:drillLinksFor(t.path)},{id:'related',links:related}]}/>
  <GuideEnd checked={FAMILY_CHECKED.terms} lesson={t.cta}/>
  <ReadNext path={t.path}/>
 </>;
}
