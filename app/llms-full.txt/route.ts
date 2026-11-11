import {GROWN_UPS as G,NONPROFITS} from '@/lib/site/aboutCopy';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonPath} from '@/lib/site/lessons';
import {SITE_FISH} from '@/lib/site/fish';
import {SITE_CARDS} from '@/lib/site/cards';
import {SITE_EXHIBITS,exhibitPath} from '@/lib/site/exhibits';
import {LEARN_FAQ} from '@/lib/site/learnFeatures';
import {abs} from '@/lib/site/seo';
import {HUBS,SAFE_GUIDE} from '@/lib/site/hubs';
import {SAFE_FACTS,SAFE_FAQ} from '@/lib/site/safety';
import {ALL_GUIDE_PAGES} from '@/lib/site/guides';
import {TOOL_PAGES} from '@/lib/site/tools/registry';
import {GAME_LISTINGS} from '@/lib/site/games';
/**
 * /llms-full.txt (Oct 16 2026): the About text, the grown-ups' FAQ (Nov 3 2026) plus the lesson and museum index as one plain-text file for AI assistants.
 * Built once at build time from the same data as the pages (no file to keep in step by hand).
 */
export const dynamic='force-static';
export function GET(){
 const out=[
  '# Futbol Island','',
  `> A free, phone-first football (soccer) learning game for kids aged 7 to 12. Home page and feature tour: ${abs('/')}. Play it (runs in the web browser): ${abs('/play')}. No ads, no accounts, no open chat.`,'',
  '## About','',
  `### ${G.whyTitle}`,G.why,'',`### ${G.learnsTitle}`,G.learns,'',`### ${G.privacyTitle}`,`${G.privacy} Privacy policy: ${abs('/privacy')}`,'',
  `### ${G.free}`,G.freeWhy,'',`### ${G.partnerTitle}`,`${G.partnerLead}${G.partnerName}${G.partnerRest}`,'',
  `### ${G.nonprofitsTitle}`,`${G.nonprofitsLead}${NONPROFITS.map(n=>n.name).join(', ')}.`,'',
  '### On the island',
  `- A tour of everything on the island, how each feature ties to football, and a FAQ for parents (the home page): ${abs('/')}`,
  `- The game itself: the title screen (start, continue with a save code, join friends) and the island: ${abs('/play')}`,
  `- ${LESSONS.length} lessons with quizzes: ${abs('/learn/lessons')}`,
  `- ${SITE_FISH.length} sea animals, each linked to a real football club fact: ${abs('/fish')}`,
  `- ${SITE_CARDS.length} player and coach cards: ${abs('/cards')}`,
  `- ${SITE_EXHIBITS.length} History Museum exhibits: ${abs('/exhibits')}`,
  `- More about the game: ${abs('/about')}`,'',
  '## Safety facts for parents','',`Parents' guide: ${abs(SAFE_GUIDE.path)}`,'',
  ...SAFE_FACTS.map(f=>`- ${f.title}: ${f.text}`),'',
  ...SAFE_FAQ.flatMap(f=>[`### ${f.q}`,f.a,'']),
  '## Topic guides','',
  ...HUBS.flatMap(h=>[`### ${h.h1}`,`${abs(h.path)}`,h.lead,'',...h.groups.flatMap(g=>[`#### ${g.title}`,...g.lessons.map(l=>`- [${l.title} (${l.formatLabel})](${abs(lessonPath(l.id))}): ${l.concept}`),'']),...h.faq.flatMap(f=>[`Q: ${f.q}`,`A: ${f.a}`,'']),'']),
  '## Guides: formations, positions, rules, size charts and soccer terms','',/* every guide page (lib/site/guides.ts), Nov 10 2026 */
  ...ALL_GUIDE_PAGES.map(g=>`- [${g.title}](${abs(g.path)}): ${g.description}`),'',
  '## Free tools and printables for coaches','',/* lib/site/tools/registry.ts, Nov 10 2026 */
  ...TOOL_PAGES.map(t=>`- [${t.title}](${abs(t.path)}): ${t.description}`),'',
  '## Free soccer games (the arcade)','',/* lib/site/games.ts, Nov 10 2026 */
  ...GAME_LISTINGS.map(g=>`- [${g.title}](${abs(g.path)}): ${g.description}`),'',
  '## Questions grown-ups ask','',
  ...LEARN_FAQ.flatMap(f=>[`### ${f.q}`,f.a,'']),
  '## Lessons','',
  ...FORMAT_ORDER.flatMap(f=>[`### ${FORMAT_LABEL[f]}`,...LESSONS.filter(l=>l.format===f).map(l=>`- [${l.title}](${abs(lessonPath(l.id))}): ${l.concept}`),'']),
  '## Museum exhibits','',
  ...SITE_EXHIBITS.map(e=>`- [${e.title} (${e.year})](${abs(exhibitPath(e.id))}): ${e.facts[0]??''}`),'',
 ];
 return new Response(out.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
