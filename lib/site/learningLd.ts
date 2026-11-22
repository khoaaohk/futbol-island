import {pageModified,publishedBefore} from './lastmod';
import {ES_QUIZ} from '../i18n/es/ui';
import {abs,KIDS_AUDIENCE,LEARN_AUDIENCE,PUBLISHER,SITE_NAME,SITE_URL} from './seo';
/**
 * Education structured data (seo-extras, Nov 15 2026). Lessons are a LearningResource for kids and coaches; guide pages
 * (rules, terms, positions) carry their end-of-guide quiz as a nested Quiz (hasPart), so each page keeps ONE top-level learning
 * entity. The markup says only what the page says (Google policy; Search Console "Practice Problems", Nov 17 2026):
 *  - the guide quiz (components/site/GuideQuiz.tsx) SHOWS the right option and its explanation once a visitor answers, so each
 *    Question has the right option as acceptedAnswer (with the shown explanation as answerExplanation) and the others as
 *    suggestedAnswer;
 *  - lesson pages never show which option is right (lessons/[slug]), and Google requires acceptedAnswer on every Question, so
 *    lessons emit NO Quiz at all: just the LearningResource.
 */
export type QuizQ={q:string;options:readonly string[];correct:number;explain:string};
/**
 * Practice-problem fields (Search Console "Practice Problems", Nov 21 2026: warnings for missing encodingFormat, comment,
 * educationalAlignment, typicalAgeRange and assesses in hasPart / suggestedAnswer / acceptedAnswer). Every value is what the page
 * shows: plain text (text/plain), ages 7-12 (the site's audience), the guide's own concept as `assesses`, and each answer's
 * `comment` is the feedback line GuideQuiz.tsx shows when that option is tapped ("Yes! ..." / "Not quite. The answer is: ...").
 */
const FORMAT='text/plain',AGES='7-12',FEEDBACK={en:{yes:'Yes!',no:'Not quite.',is:'The answer is:'},es:{yes:ES_QUIZ.yes,no:ES_QUIZ.notQuite,is:ES_QUIZ.answerIs}};
const alignment=(level:string)=>[{'@type':'AlignmentObject',alignmentType:'educationalSubject',targetName:'Soccer'},
 {'@type':'AlignmentObject',alignmentType:'educationalLevel',targetName:level}];
type Ctx={level:string;concept:string;lang:'en'|'es'};
const question=(x:QuizQ,i:number,c:Ctx)=>{
 if(!(x.correct>=0&&x.correct<x.options.length)||x.options.length<2)throw new Error(`quiz question "${x.q}" has no right option`);
 const f=FEEDBACK[c.lang],right=x.options[x.correct],shown=x.explain.startsWith(right)?x.explain:`${right} ${x.explain}`;
 const comment=(t:string)=>({'@type':'Comment',text:t});
 return {'@type':'Question',position:i+1,eduQuestionType:'Multiple choice',learningResourceType:'Practice problem',name:x.q,text:x.q,encodingFormat:FORMAT,
  educationalLevel:c.level,typicalAgeRange:AGES,educationalAlignment:alignment(c.level),assesses:c.concept,comment:comment(shown),
  acceptedAnswer:{'@type':'Answer',position:x.correct+1,text:right,encodingFormat:FORMAT,answerExplanation:comment(x.explain),comment:comment(`${f.yes} ${x.explain}`)},
  suggestedAnswer:x.options.flatMap((o,j)=>j===x.correct?[]:[{'@type':'Answer',position:j+1,text:o,encodingFormat:FORMAT,comment:comment(`${f.no} ${f.is} ${shown}`)}])};
};
/** A nested Quiz node (no @context): for a LearningResource's hasPart. `about` is the concept the questions assess. */
export const quizPart=(o:{name:string;path:string;anchor?:string;level?:string;about?:string;questions:readonly QuizQ[]})=>{
 const level=o.level??'Beginner',lang=o.path.startsWith('/es/')||o.path==='/es'?'es' as const:'en' as const,concept=o.about??o.name;
 return {'@type':'Quiz',name:o.name,url:abs(o.path)+(o.anchor?`#${o.anchor}`:''),inLanguage:lang,isAccessibleForFree:true,educationalLevel:level,
  learningResourceType:'Practice problem',typicalAgeRange:AGES,educationalAlignment:alignment(level),assesses:concept,
  audience:KIDS_AUDIENCE,about:{'@type':'Thing',name:concept},hasPart:o.questions.map((x,i)=>question(x,i,{level,concept,lang}))};
};
/**
 * For the end-of-guide quiz: call this from the quiz's page and pass the visible questions.
 * It returns a nested node to put in the page's existing Article/LearningResource as `hasPart`, e.g.
 *   <JsonLd data={{...articleLd(...),hasPart:guideQuizPart({path,name:`${title} quiz`,questions})}}/>
 * so the page still has one top-level entity per @type (tests/seo-learning-ld.cjs checks the shape). The concept (`about`,
 * `assesses`) defaults to the quiz name without "quiz" / "Prueba:".
 */
export const guideQuizPart=(o:{path:string;name:string;questions:readonly QuizQ[];anchor?:string;about?:string})=>
 quizPart({...o,anchor:o.anchor??'quiz',about:o.about??o.name.replace(/^Prueba:\s*/,'').replace(/\s+quiz$/i,'')});
/** A lesson page: LearningResource for kids and coaches. Its quiz never reveals the right option, so it gets no Quiz markup. */
export const lessonLd=(o:{name:string;path:string;description:string;teaches:string;level?:string;about:string;keywords:string;published:string;modified:string})=>({
 '@context':'https://schema.org','@type':'LearningResource',name:o.name,url:abs(o.path),description:o.description,
 inLanguage:'en',isAccessibleForFree:true,educationalLevel:o.level??'Beginner',learningResourceType:['Lesson','Quiz'],
 teaches:o.teaches,about:{'@type':'Thing',name:o.about},keywords:o.keywords,audience:LEARN_AUDIENCE,
 isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,datePublished:publishedBefore(o.published,pageModified(o.path,o.modified)),dateModified:pageModified(o.path,o.modified)});
