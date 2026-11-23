import {QuizHubView} from '@/components/site/quiz/QuizPages';
import {QUIZ_HUB,QUIZZES_PATH} from '@/lib/site/quizzes';
import {pageMeta} from '@/lib/site/seo';
/** /learn/quizzes: every quiz page by topic (Nov 23 2026; lib/site/quizzes.ts). Spanish twin: /es/learn/preguntas-de-futbol. */
export const dynamic='force-static';
export const metadata=pageMeta(QUIZ_HUB.en.title,QUIZ_HUB.en.desc,QUIZZES_PATH,{whole:true,type:'website'});
export default function Page(){return <QuizHubView lang="en"/>;}
