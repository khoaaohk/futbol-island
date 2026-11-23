import {TestYourself} from '@/components/site/quiz/QuizPages';
import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import {withMesh} from '@/lib/site/mesh';
import RailNav from '@/components/site/shell/RailNav';
import {onwardFor} from '@/lib/site/railNav';
import {guideRail} from '@/lib/site/railNavMore';
import ReadNext from '@/components/site/ReadNext';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {TERMS_HUB,TERM_PAGES,termBySlug} from '@/lib/site/terms';
import {RULES_HUB} from '@/lib/site/rules';
import {drillLinksFor} from '@/lib/site/drills';
import {termCrossLinks} from '@/lib/site/crossLinks';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {Bullets,CoachNotesSection,DataTable,GuideEnd,GuideIntro,type Fact,SceneDiagram,Section} from '@/lib/site/GuideParts';
import {lessonPath} from '@/lib/site/lessons';
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
 /* Nov 20 2026 (SEO foundation): the term's rule and coach tool come first (lib/site/crossLinks.ts) */
 const cross=termCrossLinks(t.slug);
 const related=[...cross,...(t.links??[]).filter(l=>!cross.some(x=>x.path===l.path)),...t.related.map(s=>termBySlug(s)!).map(x=>({path:x.path,name:x.name,line:x.short})),
  {path:TERMS_HUB.path,name:'All soccer terms, A to Z',line:TERMS_HUB.blurb},{path:RULES_HUB.path,name:RULES_HUB.h1,line:RULES_HUB.blurb}];
 const rel=t.related.map(s=>termBySlug(s)).find(Boolean);
 const drill=drillLinksFor(t.path)[0];
 /* visual pass Nov 17 2026: the key facts under the answer (the "Other names" line moved in here) */
 const facts:Fact[]=[t.also?{icon:'tag',label:'Other names',value:t.also}:{icon:'diagram',label:'Diagram',value:'A pitch picture',href:'#diagram'},
  t.howFact?{icon:'steps',label:t.howFact.label,value:t.howFact.value,href:'#how'}:{icon:'steps',label:'How it works',value:`${t.how.length} steps`,href:'#how'},
  ...(rel?[{icon:'link' as const,label:'Related term',value:rel.name,href:rel.path}]:[]),{icon:'quiz',label:'Quick quiz',value:`${quiz.length} questions`,href:'#quiz'}];
 /* card pages (Nov 18 2026): the pages in t.links and the first related term, linked right under the answer */
 const see=t.links?[...t.links,...(rel?[{path:rel.path,name:rel.h1}]:[])]:[];
 const more=see.length?<>Also read: {see.map((l,i)=><span key={l.path}>{i>0?' · ':''}<a href={l.path}>{l.name}</a></span>)}</>:undefined;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{...articleLd({headline:t.title,path:t.path,description:t.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${t.name} (soccer term)`,teaches:t.answer,image:diagramUrl(t.picture)}),hasPart:guideQuizPart({path:t.path,name:`${t.name} quiz`,questions:quiz})}}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'DefinedTerm',name:t.name,description:t.short,url:abs(t.path),inDefinedTermSet:abs(TERMS_HUB.path)+'#terms',...(t.also?{alternateName:t.also.split(', ')}:{})}}/>
  <JsonLd data={faqLd(t.faq)}/>
  <GuideIntro top rail={<RailNav rail={guideRail('terms',[...(t.kinds?['types']:[]),...(t.sides?['other-side']:[]),...(t.alsoMeans?['also-means']:[])])} current="#top"/>} onward={onwardFor(t.cta)} crumbs={crumbs} h1={t.h1} lead={t.answer} more={more} facts={facts}/>
  <Section id="diagram" title={`${t.name}: diagram`}><SceneDiagram id="s0" scene={t.scene} image={diagramUrl(t.picture)} animate={(ANIMATED_TERMS as readonly string[]).includes(t.slug)?t.name.toLowerCase():undefined}/></Section>
  <Section id="how" title={t.howTitle}><ol>{t.how.map(h=><li key={h}>{h}</li>)}</ol></Section>
  {/* Nov 20 2026 (SEO foundation): the kinds of the move, the other side of it, a second meaning, then one drill and one lesson */}
  {t.kinds&&<Section id="types" title={t.kinds.title}><DataTable label={t.kinds.title} head={['Type','What it is']} rows={t.kinds.rows}/></Section>}
  <Section id="mistakes" title="Common mistakes"><Bullets items={t.mistakes}/></Section>
  {t.sides&&<Section id="other-side" title={t.sides.title}><Bullets items={t.sides.items}/>
   {(drill||t.cta)&&<p data-practise="">{drill&&<>Practise it: <a href={drill.path}>{drill.name}</a>. </>}{t.cta&&<>Lesson: <a href={lessonPath(t.cta.id)}>{t.cta.title}</a>.</>}</p>}
  </Section>}
  {t.alsoMeans&&<Section id="also-means" title={`${t.name}: also means`}><p>{t.alsoMeans}</p></Section>}
  <Section id="formats" title="In 7v7, 9v9, 11v11 and futsal" fold><p>{t.formats}</p></Section>
  <QA id="faq" title={`Questions about the ${t.name.toLowerCase()}`} faq={t.faq}/>
  <CoachNotesSection name={t.name} notes={TERM_NOTES[t.slug]}/>
  <GuideQuiz id="quiz" name={t.name.toLowerCase()} questions={quiz}/>
  {/* Nov 23 2026: the matching quiz page (lib/site/quizzes.ts QUIZ_FOR) */}<TestYourself enPath={t.path}/>
  {/* batch 3, Nov 17 2026: lessons, drills (lib/site/drillLinks.ts GUIDE_DRILLS) and related terms as one "Keep reading" row */}
  <KeepReading groups={withMesh([{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(t.lessons)},{id:'drills',label:'Drill',icon:'cone',links:drillLinksFor(t.path)},{id:'related',links:related}],t.path)}/>
  <GuideEnd path={t.path} checked={FAMILY_CHECKED.terms} lesson={t.cta}/>
  <ReadNext path={t.path}/>
 </>;
}
