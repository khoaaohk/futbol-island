import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {GLOSSARY,GLOSSARY_LETTERS,TERMS_HUB as HUB,TERM_PAGES} from '@/lib/site/terms';
import {RULES_HUB} from '@/lib/site/rules';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {GuideEnd,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {abs,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';

/** /learn/soccer-terms: the glossary (lib/site/terms.ts). Every term on one page in A-Z sections, each with its own anchor. */
export const dynamic='force-static';
export const metadata=pageMeta(HUB.title,HUB.description,HUB.path,{whole:true,image:{url:diagramUrl('give-and-go-term.png'),alt:'Diagram of a give-and-go in soccer'}});
const termSetLd={'@context':'https://schema.org','@type':'DefinedTermSet','@id':abs(HUB.path)+'#terms',name:'Soccer terms for kids',description:HUB.description,url:abs(HUB.path),inLanguage:'en',
 hasDefinedTerm:GLOSSARY.map(g=>({'@type':'DefinedTerm',name:g.term,description:g.def,url:abs(g.to&&g.to.startsWith(HUB.path+'/')?g.to:`${HUB.path}#${g.id}`),inDefinedTermSet:abs(HUB.path)+'#terms'}))};
export default function TermsHub(){
 const crumbs=guideCrumbs({name:HUB.crumb,path:HUB.path});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={termSetLd}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <GuideIntro crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} more={HUB.more} cta/>
  <Section id="az" title="Jump to a letter">
   <p>{GLOSSARY_LETTERS.map((l,i)=><span key={l.letter}>{i>0&&' · '}<a href={`#letter-${l.letter.toLowerCase()}`}>{l.letter}</a></span>)}</p>
  </Section>
  {GLOSSARY_LETTERS.map(l=><Section key={l.letter} id={`letter-${l.letter.toLowerCase()}`} title={l.letter}>
   <ul>{l.terms.map(g=><li key={g.id} id={g.id}><b>{g.term}.</b> {g.def}{g.to&&<> <a href={g.to}>{g.toName}</a>.</>}</li>)}</ul>
  </Section>)}
  <Section id="pages" title="Terms with a diagram"><LinkList links={TERM_PAGES.map(t=>({path:t.path,name:t.name,line:t.short}))}/></Section>
  <Section id="lessons" title="Lessons that teach these words"><LessonList lessons={HUB.lessons}/></Section>
  <QA id="faq" title="Questions about soccer words" faq={HUB.faq}/>
  <Section id="related" title="Keep reading"><LinkList links={[{path:RULES_HUB.path,name:RULES_HUB.h1,line:RULES_HUB.blurb},{path:'/learn/soccer-positions',name:'Soccer positions for kids',line:'Every position and the numbers 1 to 11'},
   {path:'/learn/soccer-formations',name:'Soccer formations for kids',line:'Shapes for 7v7, 9v9, 11v11 and futsal'},{path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19 and which game each one plays'}]}/></Section>
  <GuideEnd cta={false}/>
 </>;
}
