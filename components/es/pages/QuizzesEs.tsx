import type {EsRoute} from '../routes';
import {esMeta} from '@/lib/i18n/es/seo';
import {QuizHubView,QuizPageView} from '@/components/site/quiz/QuizPages';
import {QUIZ_HUB,QUIZZES_PATH,quizBySlug} from '@/lib/site/quizzes';
/** The Spanish quiz pages (Nov 23 2026): /es/learn/preguntas-de-futbol and its quizzes (Spanish slugs, lib/i18n/esPaths.ts). */
export function quizzesEsRoute(enPath:string):EsRoute|null{
 if(enPath===QUIZZES_PATH)return {meta:()=>esMeta(QUIZ_HUB.es.title,QUIZ_HUB.es.desc,enPath),render:()=><QuizHubView lang="es"/>};
 if(!enPath.startsWith(QUIZZES_PATH+'/'))return null;
 const q=quizBySlug(enPath.slice(QUIZZES_PATH.length+1),'es');if(!q)return null;
 const pic=q.questions.find(x=>x.pic)?.pic;
 return {meta:()=>esMeta(q.title,q.desc,enPath,pic?{url:pic.src,alt:pic.alt}:undefined),render:()=><QuizPageView quiz={q} lang="es"/>};
}
