import {LESSONS} from './lessons';
import {SITE_FISH} from './fish';
import {SITE_CARDS} from './cards';
import {SITE_EXHIBITS} from './exhibits';
import {HUBS,HUB_COUNTS,SAFE_GUIDE} from './hubs';
import {SAFE_FACTS} from './safety';
import {GUIDE_HUBS} from './guides';
import {TOOL_HUBS} from './tools/registry';
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
  `> Futbol Island (https://futbolisland.app) is a free, phone-first football (soccer) learning game for kids aged 7 to 12, played in the web browser with nothing to download. Players explore an island and learn positions, team shape, tactics and the rules of 7v7, 9v9, 11v11 and futsal through ${LESSONS.length} short animated lessons with ${HUB_COUNTS.questions} quiz questions, and discover football history and culture: a hidden-ball hunt, a Fishbook of ${SITE_FISH.length} sea animals each linked to a real football fact, ${SITE_CARDS.length} player cards and a History Museum of ${SITE_EXHIBITS.length} exhibits. It is for kids and for the parents, carers and coaches who help them. No ads, no accounts, no open chat. Built in San Diego with White Sports Ventures (founded by former U.S. Men's National Team player Jeremiah White III) and the local non-profits FC YAP, Street Soccer San Diego and Ronin Futsal.`,'',
  '## About','',
  `- [Futbol Island home](https://futbolisland.app/): the feature tour for parents and coaches: what kids learn (lessons, quizzes, exploring, playing with friends), how it stays safe, and a FAQ for grown-ups.`,
  `- [Play the game](https://futbolisland.app/play): the title screen (start a new island, continue with a save code, or join friends) and the island itself, in the web browser on phones, tablets and computers.`,
  `- [About Futbol Island](https://futbolisland.app/about): who it is for, what it teaches, how it works, the partners and a short FAQ.`,
  `- [Parents' guide](https://futbolisland.app${SAFE_GUIDE.path}): the safety facts in plain words, with questions parents ask.`,'',
  '## Key facts','',
  ...SAFE_FACTS.map(f=>`- ${f.title}: ${f.text}`),'',
  '## Learn','',
  `- [Football lessons](https://futbolisland.app/learn/lessons): every lesson (${LESSONS.length}) in 7v7, 9v9, 11v11 and futsal, each with the coach's teaching text and its quiz questions (the answers are not marked).`,
  ...['football-rules-for-kids','soccer-quiz-for-kids','passing-and-support','futsal-for-kids','7v7-9v9-11v11'].map(slug=>{const h=hub(slug);return `- [${h.h1}](https://futbolisland.app${h.path}): ${h.blurb}.`;}),
  ...GUIDE_HUBS.map(g=>`- [${g.name[0].toUpperCase()+g.name.slice(1)}](https://futbolisland.app${g.path}): ${g.blurb}.`),'',
  '## Free tools for coaches','',/* lib/site/tools/registry.ts */
  ...TOOL_HUBS.map(t=>`- [${t.name[0].toUpperCase()+t.name.slice(1)}](https://futbolisland.app${t.path}): ${t.blurb}.`),'',
  '## Fish','',
  `- [Fishbook](https://futbolisland.app/fish): all ${SITE_FISH.length} sea animals on the island and the real football club, team or story each one is linked to, with a source credit.`,'',
  '## Cards','',
  `- [Player cards](https://futbolisland.app/cards): ${SITE_CARDS.length} cards of current stars, all-time greats, futsal players and coaches, with position, country, strengths and career.`,'',
  '## Museum','',
  `- [History Museum exhibits](https://futbolisland.app/exhibits): ${SITE_EXHIBITS.length} cases on the Laws of the Game, World Cup history, balls and kits, legends, firsts, tactics and the science of the game.`,'',
  '## Privacy','',
  `- [Privacy policy](https://futbolisland.app/privacy): what the game keeps, why and for how long. It counts anonymous usage data (counts and totals, no names), only to run and improve the game and to report combined totals to sponsors; nothing is sold and nothing about an individual child is shared. The policy follows the principles of COPPA and the UK Age Appropriate Design Code.`,'',
  '## Optional','',
  `- [Full text for AI assistants](https://futbolisland.app/llms-full.txt): the About text, the grown-ups' FAQ, the full lesson index and the museum index in one plain-text file.`,
  `- [Sitemap](https://futbolisland.app/sitemap.xml): every page.`,'',
 ].join('\n');
}
