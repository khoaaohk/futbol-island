import {GROWN_UPS as G,NONPROFITS} from '@/lib/site/aboutCopy';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonPath} from '@/lib/site/lessons';
import {SITE_FISH} from '@/lib/site/fish';
import {SITE_CARDS} from '@/lib/site/cards';
import {SITE_EXHIBITS,exhibitPath} from '@/lib/site/exhibits';
import {abs} from '@/lib/site/seo';
/**
 * /llms-full.txt (Oct 16 2026): the About text plus the lesson and museum index as one plain-text file for AI assistants.
 * Built once at build time from the same data as the pages (no file to keep in step by hand).
 */
export const dynamic='force-static';
export function GET(){
 const out=[
  '# Futbol Island','',
  `> A free, phone-first football (soccer) learning game for kids aged 7 to 12: ${abs('/')}. No ads, no chat, no accounts.`,'',
  '## About','',
  `### ${G.whyTitle}`,G.why,'',`### ${G.learnsTitle}`,G.learns,'',`### ${G.privacyTitle}`,`${G.privacy} Privacy policy: ${abs('/privacy')}`,'',
  `### ${G.free}`,G.freeWhy,'',`### ${G.partnerTitle}`,`${G.partnerLead}${G.partnerName}${G.partnerRest}`,'',
  `### ${G.nonprofitsTitle}`,`${G.nonprofitsLead}${NONPROFITS.map(n=>n.name).join(', ')}.`,'',
  '### On the island',
  `- ${LESSONS.length} lessons with quizzes: ${abs('/learn')}`,
  `- ${SITE_FISH.length} sea animals, each linked to a real football club fact: ${abs('/fish')}`,
  `- ${SITE_CARDS.length} player and coach cards: ${abs('/cards')}`,
  `- ${SITE_EXHIBITS.length} History Museum exhibits: ${abs('/exhibits')}`,
  `- More about the game: ${abs('/about')}`,'',
  '## Lessons','',
  ...FORMAT_ORDER.flatMap(f=>[`### ${FORMAT_LABEL[f]}`,...LESSONS.filter(l=>l.format===f).map(l=>`- [${l.title}](${abs(lessonPath(l.id))}): ${l.concept}`),'']),
  '## Museum exhibits','',
  ...SITE_EXHIBITS.map(e=>`- [${e.title} (${e.year})](${abs(exhibitPath(e.id))}): ${e.facts[0]??''}`),'',
 ];
 return new Response(out.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
