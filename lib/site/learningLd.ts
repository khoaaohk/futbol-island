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
const question=(x:QuizQ,i:number)=>{
 if(!(x.correct>=0&&x.correct<x.options.length))throw new Error(`quiz question "${x.q}" has no right option`);
 return {'@type':'Question',position:i+1,eduQuestionType:'Multiple choice',name:x.q,text:x.q,
  acceptedAnswer:{'@type':'Answer',position:x.correct+1,text:x.options[x.correct],answerExplanation:{'@type':'Comment',text:x.explain}},
  suggestedAnswer:x.options.flatMap((o,j)=>j===x.correct?[]:[{'@type':'Answer',position:j+1,text:o}])};
};
/** A nested Quiz node (no @context): for a LearningResource's hasPart. */
export const quizPart=(o:{name:string;path:string;anchor?:string;level?:string;about?:string;questions:readonly QuizQ[]})=>({'@type':'Quiz',
 name:o.name,url:abs(o.path)+(o.anchor?`#${o.anchor}`:''),inLanguage:'en',isAccessibleForFree:true,educationalLevel:o.level??'Beginner',learningResourceType:'Quiz',
 audience:KIDS_AUDIENCE,...(o.about?{about:{'@type':'Thing',name:o.about}}:{}),hasPart:o.questions.map(question)});
/**
 * For the end-of-guide quiz (built on the seo-design branch): call this from the quiz's page and pass the visible questions.
 * It returns a nested node to put in the page's existing Article/LearningResource as `hasPart`, e.g.
 *   <JsonLd data={{...articleLd(...),hasPart:guideQuizPart({path,name:`${title} quiz`,questions})}}/>
 * so the page still has one top-level entity per @type (tests/seo-learning-ld.cjs checks the shape).
 */
export const guideQuizPart=(o:{path:string;name:string;questions:readonly QuizQ[];anchor?:string})=>quizPart({...o,anchor:o.anchor??'quiz'});
/** A lesson page: LearningResource for kids and coaches. Its quiz never reveals the right option, so it gets no Quiz markup. */
export const lessonLd=(o:{name:string;path:string;description:string;teaches:string;level?:string;about:string;keywords:string;published:string;modified:string})=>({
 '@context':'https://schema.org','@type':'LearningResource',name:o.name,url:abs(o.path),description:o.description,
 inLanguage:'en',isAccessibleForFree:true,educationalLevel:o.level??'Beginner',learningResourceType:['Lesson','Quiz'],
 teaches:o.teaches,about:{'@type':'Thing',name:o.about},keywords:o.keywords,audience:LEARN_AUDIENCE,
 isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,datePublished:o.published,dateModified:o.modified});
