import {notFound} from 'next/navigation';
import {QuizPageView} from '@/components/site/quiz/QuizPages';
import {QUIZZES,quizBySlug} from '@/lib/site/quizzes';
import {pageMeta} from '@/lib/site/seo';
/** One quiz, played on its page (Nov 23 2026; questions in lib/site/quizBank.ts, view in components/site/quiz/). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>QUIZZES.map(q=>({slug:q.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const q=quizBySlug(params.slug);if(!q)return {};
 const pic=q.questions.find(x=>x.pic)?.pic;
 return pageMeta(q.title,q.desc,q.path,{whole:true,...(pic?{image:{url:pic.src,alt:pic.alt}}:{})});
}
export default function Page({params}:{params:{slug:string}}){
 const q=quizBySlug(params.slug);if(!q)notFound();
 return <QuizPageView quiz={q} lang="en"/>;
}
