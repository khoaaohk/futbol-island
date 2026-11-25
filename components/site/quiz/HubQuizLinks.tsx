import {LinkList,Section} from '@/lib/site/GuideParts';
import {HUB_QUIZ_WORDS,hubQuizLinks,type Lang} from '@/lib/site/quizzes';
/** SEO batch E (Nov 25 2026): a lesson hub's "Quizzes with answers" section, linking the quiz pages that test the same ideas. */
export const HUB_QUIZ_ID='quizzes';
export default function HubQuizLinks({slug,lang='en'}:{slug:string;lang?:Lang}){
 const links=hubQuizLinks(slug,lang);if(!links)return null;const w=HUB_QUIZ_WORDS[lang];
 return <Section id={HUB_QUIZ_ID} title={w.title}><LinkList links={links}/></Section>;
}
