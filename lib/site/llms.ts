import {QUIZZES,QUIZZES_PATH,QUIZ_QUESTIONS} from './quizzes';
import {LESSONS} from './lessons';
import {SITE_FISH} from './fish';
import {SITE_CARDS} from './cards';
import {SITE_EXHIBITS} from './exhibits';
import {HUBS,HUB_COUNTS,SAFE_GUIDE} from './hubs';
import {SAFE_FACTS} from './safety';
import {GUIDE_HUBS} from './guides';
import {TOOL_HUBS} from './tools/registry';
import {GAME_LISTINGS} from './games';
import {TERM_PAGES} from './terms';
import {RULES} from './rules';
import {NUMBERS_PAGE} from './positionNumbers';
import {POSITIONS,POSITIONS_HUB} from './positions';
import {drillGuideBySlug} from './drillGuides';
import {firstSentence} from './seo';
import {LIBRARY_PATH} from './libraryPath';
import {SITE_BOOKS,BUILT_BOOKS,bookBySlug} from './books';
/** Nov 16 2026 (SEO CTR, owner: "written for LLM searches as well"): the pages people search most, each with its stand-alone
 *  one-sentence answer, so an assistant can quote the answer and cite the page (docs/seo-ctr/LLM-CHECKLIST.md). */
const ANSWER_TERMS=['two-v-one','through-ball','cutback','give-and-go','pressing','first-touch','nutmeg','hat-trick','free-kick-wall','yellow-card','red-card'];
/* Nov 23 2026 (seo-ai-speed): the positions hub and the two position pages with the most Search impressions (GSC Nov 22) */
const ANSWER_POSITIONS=['defensive-midfielder','center-back'];
const ANSWER_RULES=['yellow-and-red-cards','back-pass-rule','handball','fouls-and-free-kicks','throw-in','heading-rules-for-kids','substitutions-and-game-length','futsal-rules','penalty-kick','goal-kick'];
function answers():string[]{
 const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
 const d=drillGuideBySlug('defending')!;
 return [{path:POSITIONS_HUB.path,q:POSITIONS_HUB.h1,a:POSITIONS_HUB.lead},{path:NUMBERS_PAGE.path,q:NUMBERS_PAGE.h1,a:NUMBERS_PAGE.answer},
  ...ANSWER_POSITIONS.map(s=>POSITIONS.find(p=>p.slug===s)!).map(p=>({path:p.path,q:p.h1,a:p.answer})),
  ...ANSWER_TERMS.map(s=>TERM_PAGES.find(t=>t.slug===s)!).map(t=>({path:t.path,q:t.h1,a:t.answer})),
  ...ANSWER_RULES.map(s=>RULES.find(r=>r.slug===s)!).map(r=>({path:r.path,q:r.h1,a:r.answer})),
  {path:d.path,q:d.h1,a:d.lead}]
  .map(x=>`- [${cap(x.q)}](https://futbolisland.app${x.path}): ${firstSentence(x.a,320)}`);
}
/**
 * /llms.txt (llmstxt.org format; served by app/llms.txt/route.ts, moved from a hand-kept public/llms.txt on Nov 8 2026 so the
 * counts come from the data). A factual summary for AI assistants: what Futbol Island is, who it is for, what it teaches, the
 * verified safety facts (lib/site/safety.ts), then the key pages, one line each. URLs are written out in full on purpose (the
 * tests read this source); every one must be a sitemap page or a served file (tests/seo-pages.cjs). Support for llms.txt by the
 * big AI engines is not confirmed: cheap insurance, not a ranking lever.
 */
export function llmsText():string{
 const hub=(slug:string)=>HUBS.find(h=>h.slug===slug)!;
 return [
  '# Futbol Island','',
  `> Futbol Island (https://futbolisland.app) is a free, phone-first football (soccer) learning game for kids aged 7 to 12, played in the web browser with nothing to download. Players explore an island and learn positions, team shape, tactics and the rules of 7v7, 9v9, 11v11 and futsal through ${LESSONS.length} short animated lessons with ${HUB_COUNTS.questions} quiz questions, and discover football history and culture: a hidden-ball hunt, a Fishbook of ${SITE_FISH.length} sea animals each linked to a real football fact, ${SITE_CARDS.length} player cards and a History Museum of ${SITE_EXHIBITS.length} exhibits. It is for kids and for the parents, carers and coaches who help them. No pop-up, video or tracking ads, no accounts, no open chat. The island’s stadium shows sponsor boards: pictures only, with no links and no tracking. Built in San Diego with White Sports Ventures (founded by former U.S. Men's National Team player Jeremiah White III) and the local non-profits FC YAP, Street Soccer San Diego and Ronin Futsal.`,'',
  '## About','',
  `- [Futbol Island home](https://futbolisland.app/): the feature tour for parents and coaches: what kids learn (lessons, quizzes, exploring, playing with friends), how it stays safe, and a FAQ for grown-ups.`,
  /* Nov 20 2026 (new layout SEO, owner: "boost traffic to these three main pages, Island, games, and library", "Also play"): the four
     main pages first: home, the Library, the games hub, the game */
  `- [The Futbol Island Library](https://futbolisland.app${LIBRARY_PATH}): learn soccer for kids on one page: lessons, rules, soccer terms, drills, positions, formations, practice plans, coach tools, age groups, games, videos, player cards, story books, the Fishbook and the museum, each with a link into its section. In Spanish at https://futbolisland.app/es${LIBRARY_PATH}.`,
  `- [Free soccer games for kids](https://futbolisland.app/games): the arcade games, each with its own page, plus the island game itself.`,
  `- [Play the game](https://futbolisland.app/play): the title screen (start a new island, continue with a save code, or join friends) and the island itself, in the web browser on phones, tablets and computers.`,
  `- [About Futbol Island](https://futbolisland.app/about): who it is for, what it teaches, how it works, the partners and a short FAQ.`,
  `- [Parents' guide](https://futbolisland.app${SAFE_GUIDE.path}): the safety facts in plain words, with questions parents ask.`,'',
  '## Key facts','',
  ...SAFE_FACTS.map(f=>`- ${f.title}: ${f.text}`),'',
  '## Learn','',
  `- [Football lessons](https://futbolisland.app/learn/lessons): every lesson (${LESSONS.length}) in 7v7, 9v9, 11v11 and futsal, each with the coach's teaching text and its quiz questions (the answers are not marked).`,
  `- [Soccer quizzes by topic](https://futbolisland.app${QUIZZES_PATH}): ${QUIZZES.length} quizzes for kids with ${QUIZ_QUESTIONS} questions (rules, offside, cards, penalties, positions, shirt numbers, soccer terms, futsal, 7v7 and World Cup history), played on the page, each with an answer key that gives the right answer and the reason. Spanish: https://futbolisland.app/es/learn/preguntas-de-futbol`,
  ...['football-rules-for-kids','soccer-quiz-for-kids','passing-and-support','futsal-for-kids','7v7-9v9-11v11'].map(slug=>{const h=hub(slug);return `- [${h.h1}](https://futbolisland.app${h.path}): ${h.blurb}.`;}),
  ...GUIDE_HUBS.map(g=>`- [${g.name[0].toUpperCase()+g.name.slice(1)}](https://futbolisland.app${g.path}): ${g.blurb}.`),'',
  '## Free tools for coaches','',/* lib/site/tools/registry.ts */
  ...TOOL_HUBS.map(t=>`- [${t.name[0].toUpperCase()+t.name.slice(1)}](https://futbolisland.app${t.path}): ${t.blurb}.`),
  /* the two app shells are noindex (their front doors are the tool pages above), so they are named here, not linked */
  '- Two of the tools also run as full-screen phone apps: the scanning trainer at https://futbolisland.app/scan and the coach app (team, lineup, fair game minutes and a live game mode) at https://futbolisland.app/coach. They are app screens, not reading pages.','',
  '## Short answers','',
  ...answers(),'',
  '## Free soccer games','',/* lib/site/games.ts */
  ...GAME_LISTINGS.map(g=>`- [${g.name[0].toUpperCase()+g.name.slice(1)}](https://futbolisland.app${g.path}): ${g.blurb}.`),'',
  '## Fish','',
  `- [Fishbook](https://futbolisland.app/fish): all ${SITE_FISH.length} sea animals on the island and the real football club, team or story each one is linked to, with a source credit.`,'',
  '## Cards','',
  `- [Player cards](https://futbolisland.app/cards): ${SITE_CARDS.length} cards of current stars, all-time greats, futsal players and coaches, with position, country, strengths and career.`,'',
  '## Museum','',
  `- [History Museum exhibits](https://futbolisland.app/exhibits): ${SITE_EXHIBITS.length} cases on the Laws of the Game, World Cup history, balls and kits, legends, firsts, tactics and the science of the game.`,'',
  '## Books','',/* lib/site/books.ts: the island's pop-up books; one line per built story page, its answer sentence */
  `- [Football pop-up books for kids](https://futbolisland.app/books): ${SITE_BOOKS.length} short true stories about real players, each six chapters with a lesson per chapter and the sources it was checked against.`,
  ...BUILT_BOOKS.map(id=>{const b=bookBySlug(id)!;return `- [${b.fullTitle}](https://futbolisland.app/books/${id}): ${b.page!.summary}`;}),'',
  '## Privacy','',
  `- [Privacy policy](https://futbolisland.app/privacy): what the game keeps, why and for how long. It counts anonymous usage data (counts and totals, no names), only to run and improve the game and to report combined totals to sponsors; nothing is sold and nothing about an individual child is shared. The policy follows the principles of COPPA and the UK Age Appropriate Design Code.`,'',
  '## Optional','',
  `- [Full text for AI assistants](https://futbolisland.app/llms-full.txt): the About text, the grown-ups' FAQ, the full lesson index and the museum index in one plain-text file.`,
  `- [Sitemap](https://futbolisland.app/sitemap.xml): every page.`,'',
 ].join('\n');
}
