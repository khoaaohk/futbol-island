/**
 * Which English pages have a Spanish counterpart (Spanish round 1, Nov 15 2026; docs/i18n/HANDOFF.md). Plain data with no imports,
 * so the language switch (components/site/LangSwitch.tsx, a client island) and lib/site/seo.ts (hreflang on English pages) can
 * use it without pulling the translations in. URL strategy: the Spanish page is `/es` + the English path, English slugs kept
 * (1:1 mapping, no slug table to keep in sync); `/` -> `/es`. tests/es-pages.cjs checks this list against the Spanish data
 * (lib/i18n/es/registry.ts): a page listed here must render, and every translated record must be listed.
 */
import {LESSON_TABLE} from '../analytics/learningIds.generated';/* plain generated data, no imports */
export const ES_PREFIX='/es';
const R='/learn/soccer-rules',T='/learn/soccer-terms',P='/learn/soccer-positions';
export const ES_RULE_SLUGS=['offside','throw-in','goal-kick','corner-kick','handball','fouls-and-free-kicks','penalty-kick','yellow-and-red-cards','back-pass-rule','build-out-line','kick-off','drop-ball','advantage','substitutions-and-game-length','heading-rules-for-kids','futsal-rules'] as const;
export const ES_TERM_SLUGS=['give-and-go','third-man-run','overlap','through-ball','switching-play','two-v-one','cutback','cross','first-touch','pressing','marking','goal-side','tackle','counterattack','set-piece','nutmeg','clean-sheet','hat-trick'] as const;
export const ES_POSITION_SLUGS=['goalkeeper','center-back','fullback','wingback','defensive-midfielder','central-midfielder','attacking-midfielder','winger','striker'] as const;
export const ES_FORMATION_SLUGS=['7v7-2-3-1','7v7-3-2-1','7v7-2-2-2','7v7-3-1-2','9v9-3-2-3','9v9-3-3-2','9v9-2-3-2-1','9v9-3-1-3-1','9v9-4-3-1','11v11-4-3-3','11v11-4-4-2','11v11-4-2-3-1','11v11-3-5-2','futsal-2-2','futsal-1-2-1-diamond','futsal-3-1'] as const;
const F='/learn/soccer-formations';
/** Round 2: the formations family (hub, pages, the three format guides) and the three comparison pages. */
const ROUND2=[F,...ES_FORMATION_SLUGS.map(s=>`${F}/${s}`),'/learn/7v7-soccer-formations','/learn/9v9-soccer-formations','/learn/11v11-soccer-formations',
 `${P}/fullback-vs-wingback`,`${P}/striker-vs-winger`,`${F}/4-3-3-vs-4-4-2`];
/** Round C (Nov 16 2026): the drills family (hub, 10 age/skill guides, 46 drills) and the practice plans (hub, 12 plans). */
const D='/learn/soccer-drills',PL='/learn/soccer-practice-plans';
export const ES_DRILL_SLUGS=['u6','u8','u10','u12','at-home','passing','dribbling','shooting','first-touch','goalkeeper','toe-taps-and-foundations','cone-weave-dribbling','gates-dribbling','red-light-green-light','sharks-and-minnows','pirates-and-treasure','turn-and-go','knockout','dribble-tag','simon-says-soccer','clean-your-room','throw-in-game','wall-passing','receive-across-the-body','first-touch-gates','thigh-and-chest-control','receive-and-turn','partner-passing-through-gates','give-and-go','triangle-passing','rondo-3v1','rondo-4v2','three-team-keep-away','dribble-and-shoot','world-cup-shooting-game','two-v-one-to-goal','crossing-and-finishing','lay-off-and-shoot','follow-the-shot','one-v-one-to-end-zones','one-v-one-two-goals','numbers-game','one-v-one-defending','recover-goal-side','pressure-and-cover-2v2','shoulder-check-colors','busy-square-dribbling','three-v-three-game','four-goal-game','end-zone-game','three-v-two-to-goal','build-out-game','goalkeeper-footwork-and-set','goalkeeper-catching-w-and-basket','goalkeeper-distribution','goalkeeper-angles'] as const;
export const ES_PLAN_SLUGS=['u6-first-practice','u6-dribbling-practice-plan','u6-shooting-practice-plan','u8-first-practice','u8-dribbling-practice-plan','u8-passing-practice-plan','u10-first-practice','u10-passing-practice-plan','u10-1v1-practice-plan','u12-first-practice','u12-possession-practice-plan','u12-finishing-practice-plan'] as const;
const ROUNDC=[D,...ES_DRILL_SLUGS.map(s=>`${D}/${s}`),PL,...ES_PLAN_SLUGS.map(s=>`${PL}/${s}`)];
/** Round D (Nov 16 2026): the lessons index and the 96 lesson pages; the lesson/guide hubs and charts; the tools. */
export const ES_LESSON_PAGES:readonly string[]=['/learn/lessons',...LESSON_TABLE.map(([,id])=>`/learn/lessons/${id}`)];
export const ES_HUB_PAGES:readonly string[]=['/learn/football-rules-for-kids','/learn/soccer-quiz-for-kids','/learn/passing-and-support','/learn/futsal-for-kids','/learn/7v7-9v9-11v11',
 '/learn/soccer-ball-size-by-age','/learn/soccer-field-size-by-age','/learn/soccer-age-groups','/safe-football-game-for-kids'];
export const ES_TOOL_PAGES:readonly string[]=['/tools','/tools/soccer-lineup-builder','/tools/7v7-lineup-builder','/tools/9v9-lineup-builder','/tools/11v11-lineup-builder','/tools/futsal-lineup-builder','/tools/soccer-playing-time-calculator','/tools/7v7-substitution-rotation','/tools/9v9-substitution-rotation','/tools/soccer-field-diagrams',...['blank-7v7-soccer-field','blank-9v9-soccer-field','blank-11v11-soccer-field','blank-futsal-court','7v7-soccer-formations-cheat-sheet','9v9-soccer-formations-cheat-sheet','11v11-soccer-formations-cheat-sheet','futsal-formations-cheat-sheet','soccer-positions-and-numbers'].map(s=>`/tools/soccer-field-diagrams/${s}`)];
/** English paths with a Spanish page. */
export const ES_PAGES:readonly string[]=['/','/about','/about/how-we-check-facts',R,...ES_RULE_SLUGS.map(s=>`${R}/${s}`),T,...ES_TERM_SLUGS.map(s=>`${T}/${s}`),P,...ES_POSITION_SLUGS.map(s=>`${P}/${s}`),...ROUND2,...ES_LESSON_PAGES,...ES_HUB_PAGES,...ES_TOOL_PAGES,...ROUNDC];
const SET=new Set(ES_PAGES);
export const hasEs=(enPath:string)=>SET.has(enPath);
export const toEs=(enPath:string)=>enPath==='/'?ES_PREFIX:ES_PREFIX+enPath;
/** /es/learn/x -> /learn/x, /es -> / (null when the path is not a Spanish one). */
export const toEn=(esPath:string)=>esPath===ES_PREFIX||esPath===ES_PREFIX+'/'?'/':esPath.startsWith(ES_PREFIX+'/')?esPath.slice(ES_PREFIX.length):null;
/** hreflang alternates for a page pair, the same on both language versions (x-default = English). */
export const languageAlternates=(enPath:string)=>({en:enPath,es:toEs(enPath),'x-default':enPath});
