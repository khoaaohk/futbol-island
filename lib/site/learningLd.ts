import {abs,KIDS_AUDIENCE,LEARN_AUDIENCE,PUBLISHER,SITE_NAME,SITE_URL} from './seo';
/**
 * Education structured data (seo-extras, Nov 15 2026). Lessons are a LearningResource for kids and coaches, with their quiz
 * questions as a nested Quiz (hasPart), so each page keeps ONE top-level learning entity. The site never shows which option
 * is right (lessons/[slug]: "never which option is correct"), so a Question lists its options as suggestedAnswer and has no
 * acceptedAnswer: the markup says only what the page says.
 */
export type QuizQ={q:string;options:readonly string[];explain?:string};
const question=(x:QuizQ,i:number)=>({'@type':'Question',position:i+1,eduQuestionType:x.options.length?'Multiple choice':'Short answer',name:x.q,text:x.q,
 ...(x.options.length?{suggestedAnswer:x.options.map((o,j)=>({'@type':'Answer',position:j+1,text:o}))}:{})});
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
/** A lesson page: LearningResource (lesson + quiz) for kids and coaches. */
export const lessonLd=(o:{name:string;path:string;description:string;teaches:string;level?:string;about:string;keywords:string;published:string;modified:string;questions:readonly QuizQ[]})=>({
 '@context':'https://schema.org','@type':'LearningResource',name:o.name,url:abs(o.path),description:o.description,
 inLanguage:'en',isAccessibleForFree:true,educationalLevel:o.level??'Beginner',learningResourceType:['Lesson','Quiz'],
 teaches:o.teaches,about:{'@type':'Thing',name:o.about},keywords:o.keywords,audience:LEARN_AUDIENCE,
 isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,datePublished:o.published,dateModified:o.modified,
 ...(o.questions.length?{hasPart:quizPart({name:`${o.name} quiz`,path:o.path,anchor:'quiz',level:o.level,about:o.about,questions:o.questions})}:{})});
