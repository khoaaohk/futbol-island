/**
 * The safety facts the public pages may state (SEO, Nov 8 2026). Each line was checked against the privacy policy
 * (components/privacy/PrivacyPolicy.tsx, the summary list and sections 7, 7a, 10, 11) and the existing grown-ups' FAQ
 * (lib/site/learnFeatures.ts). Wording rules (owner): say "no open chat" / "no free-text chat", never "no chat"; never
 * "COPPA compliant", "certified" or "no data collected" (the game does count anonymous usage totals). Anything new here
 * must be in the policy first. tests/seo-pages.cjs scans every page for the banned phrases.
 */
import {publicWorldEnabled} from '../multiplayer/publicFlag';
/*
 * [PUBLIC-WORLD] Nov 11 2026 (docs/multiplayer-public-island-plan-2026-11-11.md): the public island changes three lists. Each list
 * below keeps today's wording byte for byte (…_TODAY) and adds the wording that is true once other players can be seen
 * (…_PUBLIC); publicWorldEnabled() (a build flag, off by default) picks one at build time. Both versions are in the policy.
 * tests/mp-public-copy.cjs pins the off version; docs/multiplayer/PUBLIC-COPY-REVIEW.md lists every change for the lawyer.
 */
export const SAFE_TRUST_LINE='Free. No pop-up, video or tracking ads, no accounts, no open chat.';
/** The one plain sponsor-board explanation (safety, privacy, About). Stadium ships Nov 2026. */
export const SPONSOR_BOARDS_LINE='The island’s stadium shows sponsor boards that help keep the game free. They are pictures only: no links, no tracking, and they never ask kids to buy anything. Sponsors only ever see combined totals, never anything about a child.';
export type SafeFact={title:string;text:string};
export const SAFE_FACTS_TODAY:readonly SafeFact[]=[
 {title:'Free, with no pop-up or tracking ads',text:'Futbol Island is free to play. It has no pop-up, video or tracking ads. Coins on the island are earned by playing and learning, never bought with real money.'},
 {title:'Stadium sponsor boards',text:SPONSOR_BOARDS_LINE},
 {title:'No open chat',text:'There is no free-text chat with other players and no voice chat. Friends in a private party can only use preset emotes, and islanders talk through preset topics a child taps.'},
 {title:'No accounts',text:'There is no sign-up. Progress is kept with a save code of football words and a number, made at random, that carries no personal details.'},
 {title:'No tracking cookies',text:'The game uses no tracking or advertising cookies and no third-party analytics or advertising tools. It runs its own visit counter, which uses no cookies.'},
 {title:'No personal details from children',text:'The game never asks a child for a last name, age, email, photo, school or location. The one exception is the optional Play with friends feature, where a first name is typed when a grown-up starts or joins a party; it is shown only to that party and is never stored.'},
 {title:'Grown-ups stay in charge',text:'Play with friends works only after a grown-up check, and a grown-up can switch it off in Settings. Links that leave the game and donations sit behind the same check.'},
 {title:'Anonymous totals only',text:'The game counts anonymous usage totals, with no names, to run and improve it. Sponsors who help pay for it only ever see combined totals; nothing is sold, and nothing about one child is shared.'},
];
/** Short, direct answers (these get quoted by search and AI assistants). Shown on the page and mirrored in FAQPage JSON-LD. */
export type Faq={q:string;a:string};
export const SAFE_FAQ_TODAY:readonly Faq[]=[
 {q:'Is Futbol Island safe for kids?',a:'Futbol Island is built for kids aged 7 to 12: it has no pop-up or tracking ads, no accounts and no open chat, and it never asks a child for personal details such as a last name, age, email, photo, school or location.'},
 {q:'Are there ads?',a:'There are no pop-up, video or tracking ads. '+SPONSOR_BOARDS_LINE},
 {q:'Can my child chat with strangers?',a:'No. There is no free-text chat and no voice chat. Friends in a private party, started by a grown-up and joined by code, can only use preset emotes.'},
 {q:'Does my child need an account or an email?',a:'No. Progress is kept with a random save code that carries no personal details. There is no sign-up.'},
 {q:'Does Futbol Island collect data?',a:'It counts anonymous usage totals, without names, to run and improve the game and to show sponsors combined totals. It uses no tracking cookies and no third-party analytics or advertising tools. The privacy policy explains what is kept and for how long.'},
 {q:'Which privacy rules does it follow?',a:'The privacy policy says the game follows the principles of the US Children’s Online Privacy Protection Act (COPPA) and the UK Age Appropriate Design Code.'},
];
/** Every hub and lesson page closes with these (all from SAFE_FACTS / the FAQ above). */
export const HUB_COMMON_FAQ_TODAY:readonly Faq[]=[
 {q:'Is Futbol Island free?',a:'Yes. Futbol Island is free to play in the web browser on phones, tablets and computers, with nothing to download and nothing to buy.'},
 {q:'Is it safe for kids?',a:'Yes, it is made for kids aged 7 to 12: no pop-up or tracking ads, no accounts and no open chat. Friends can only use preset emotes.'},
];
/** [PUBLIC-WORLD] The same lists once other players can be seen (only the changed entries differ; order and titles kept). */
const swap=<T,>(list:readonly T[],at:(x:T)=>boolean,next:T):readonly T[]=>list.map(x=>at(x)?next:x);
export const SAFE_FACTS_PUBLIC:readonly SafeFact[]=swap(swap(SAFE_FACTS_TODAY,f=>f.title==='No open chat',
 {title:'No open chat',text:'There is no free-text chat with other players and no voice chat. Other kids playing at the same time, and friends in a private party, can only use preset emotes, and islanders talk through preset topics a child taps.'}),
 f=>f.title==='Grown-ups stay in charge',
 {title:'Grown-ups stay in charge',text:'Other kids playing at the same time can be seen on the island unless a grown-up changes it: in Settings, behind a grown-up check, a grown-up can choose Other players and friends, Friends only, or Off. A child can also tap the people button to play alone. Play with friends works only after a grown-up check. Links that leave the game and donations sit behind the same check.'});
export const SAFE_FAQ_PUBLIC:readonly Faq[]=swap(swap(SAFE_FAQ_TODAY,f=>f.q==='Is Futbol Island safe for kids?',
 {q:'Is Futbol Island safe for kids?',a:'Futbol Island is built for kids aged 7 to 12: it has no pop-up or tracking ads, no accounts and no open chat, and it never asks a child for personal details such as a last name, age, email, photo, school or location. Other kids playing at the same time can be seen on the island, with a name the game makes up and no way to chat or send messages, and a grown-up can switch other players off in Settings.'}),f=>f.q==='Can my child chat with strangers?',
 {q:'Can my child chat with strangers?',a:'No. There is no free-text chat and no voice chat. Other kids playing at the same time can appear on the island, but they see only a name the game makes up, an outfit and preset waves and cheers. A child can hide or report another player, or tap the people button to play alone, and a grown-up can switch other players off in Settings.'});
export const HUB_COMMON_FAQ_PUBLIC:readonly Faq[]=swap(HUB_COMMON_FAQ_TODAY,f=>f.q==='Is it safe for kids?',
 {q:'Is it safe for kids?',a:'Yes, it is made for kids aged 7 to 12: no pop-up or tracking ads, no accounts and no open chat. Other players and friends can only use preset emotes, and a grown-up can switch other players off.'});
const PUB=publicWorldEnabled();
export const SAFE_FACTS:readonly SafeFact[]=PUB?SAFE_FACTS_PUBLIC:SAFE_FACTS_TODAY;
export const SAFE_FAQ:readonly Faq[]=PUB?SAFE_FAQ_PUBLIC:SAFE_FAQ_TODAY;
export const HUB_COMMON_FAQ:readonly Faq[]=PUB?HUB_COMMON_FAQ_PUBLIC:HUB_COMMON_FAQ_TODAY;
/** Phrases no public page may contain (tests/seo-pages.cjs). */
export const BANNED_CLAIMS=[/COPPA[- ]compliant/i,/\bcertified\b/i,/no data (?:is )?collected/i,/\bno chat\b/i,/collects? no data/i] as const;
