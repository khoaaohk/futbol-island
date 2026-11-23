import {RULES,RULES_HUB,ruleBySlug} from './rules';
import {TERM_PAGES,termBySlug} from './terms';
import {TOOL_PAGES} from './tools/registry';
import {SITE_BOOKS,type SiteBook} from './books';
import {cardPath,type SiteCard} from './cards';
import type {Collection} from './collections';
import {CHARTS} from './sizes';
import {POSITIONS} from './positions';
import {FORMATIONS_HUB} from './formations';
import {EXHIBITS} from '@/lib/endgame/museum';
import {hubBySlug} from './hubs';
/**
 * Cross-cluster links (SEO foundation, Nov 20 2026): the pages that can rank had few links from OTHER clusters. A rule page
 * linked the next two rules and its hubs, a term page linked terms, and each pop-up book had one inlink (the shelf). The
 * tables below say which tool and terms belong to each rule, which rule belongs to each term, and which topics a card role
 * is about. Every slug and path is checked when this module loads (a wrong one throws at build time), and each link's words
 * come from the target page's own data (its name, its one-line summary), so nothing here is written twice.
 * The home page body is not touched (owner rule: it links no tool, guide or drill page).
 * Measure with scripts/seo-inlinks.cjs on a built site.
 */
export type XLink={path:string;name:string;line:string};
const TOOL={calc:'/tools/soccer-playing-time-calculator',lineup:'/tools/soccer-lineup-builder',l7:'/tools/7v7-lineup-builder',l9:'/tools/9v9-lineup-builder',
 futsal:'/tools/futsal-lineup-builder',rot7:'/tools/7v7-substitution-rotation',fields:'/tools/soccer-field-diagrams'} as const;
type ToolKey=keyof typeof TOOL;
const R='/learn/soccer-rules/';
/** Rule page -> the coach tool that goes with it, 2 or 3 glossary terms the rule uses, and a sister rule where one explains the other. */
const RULE_LINKS:Record<string,{tool:ToolKey;terms:string[];rules?:string[]}>={
 'kick-off':{tool:'calc',terms:['set-piece','pressing','own-goal','extra-time']},
 'throw-in':{tool:'fields',terms:['set-piece','marking','first-touch','own-goal','support'],rules:['yellow-and-red-cards']},
 'goal-kick':{tool:'l7',terms:['pressing','switching-play','set-piece','build-up','goal-area','penalty-area']},
 'corner-kick':{tool:'fields',terms:['set-piece','cross','cutback','marking','far-post','near-post'],rules:['heading-rules-for-kids']},
 'drop-ball':{tool:'fields',terms:['set-piece','first-touch']},
 'yellow-and-red-cards':{tool:'lineup',terms:['yellow-card','red-card','tackle']},
 'fouls-and-free-kicks':{tool:'fields',terms:['tackle','free-kick-wall','set-piece','shielding','jockeying','penalty-area'],rules:['yellow-and-red-cards']},
 'penalty-kick':{tool:'fields',terms:['set-piece','red-card','brace','penalty-area','penalty-shoot-out'],rules:['yellow-and-red-cards']},
 'handball':{tool:'fields',terms:['free-kick-wall','yellow-card','red-card','sweeper-keeper','penalty-area'],rules:['yellow-and-red-cards']},
 'advantage':{tool:'fields',terms:['counterattack','tackle','yellow-card'],rules:['yellow-and-red-cards']},
 'offside':{tool:'lineup',terms:['through-ball','cutback','give-and-go','offside-trap','high-line']},
 'back-pass-rule':{tool:'l7',terms:['pressing','first-touch','switching-play','sweeper-keeper','possession']},
 'build-out-line':{tool:'l7',terms:['pressing','two-v-one','switching-play','build-up'],rules:['heading-rules-for-kids']},
 'heading-rules-for-kids':{tool:'l7',terms:['cross','set-piece','first-touch','clearance','volley','header']},
 'substitutions-and-game-length':{tool:'calc',terms:['pressing','marking','box-to-box','stoppage-time','extra-time'],rules:['heading-rules-for-kids']},
 'futsal-rules':{tool:'futsal',terms:['give-and-go','two-v-one','pressing','pivot'],rules:['yellow-and-red-cards']},
};
/** Term page -> the rule (or two) the word meets in a game. */
const TERM_RULES:Record<string,string[]>={
 'two-v-one':['offside'],'give-and-go':['offside'],'through-ball':['offside'],'third-man-run':['offside'],'overlap':['offside'],
 'switching-play':['build-out-line'],'cross':['corner-kick','heading-rules-for-kids'],'cutback':['offside'],'first-touch':['throw-in'],
 'nutmeg':['fouls-and-free-kicks'],'counterattack':['advantage','offside'],'pressing':['back-pass-rule','build-out-line'],'marking':['corner-kick'],
 'goal-side':['corner-kick'],'tackle':['fouls-and-free-kicks','yellow-and-red-cards'],'set-piece':['fouls-and-free-kicks','heading-rules-for-kids'],
 'free-kick-wall':['fouls-and-free-kicks','handball'],'yellow-card':['yellow-and-red-cards'],'red-card':['yellow-and-red-cards'],
 'clean-sheet':['substitutions-and-game-length'],'hat-trick':['kick-off'],
 /* batch 1 of new term pages, Nov 20 2026 */
 'dribble':['fouls-and-free-kicks'],'shielding':['fouls-and-free-kicks'],'volley':['corner-kick','heading-rules-for-kids'],'half-volley':['fouls-and-free-kicks'],
 'square-pass':['offside','back-pass-rule'],'man-on':['yellow-and-red-cards'],'overload':['offside'],'underlap':['offside'],'far-post':['corner-kick'],
 'offside-trap':['offside','build-out-line'],'jockeying':['fouls-and-free-kicks','yellow-and-red-cards'],'cover':['offside'],'clearance':['heading-rules-for-kids','corner-kick'],
 'build-up':['build-out-line','goal-kick'],'false-nine':['offside'],'sweeper-keeper':['handball','back-pass-rule'],'box-to-box':['substitutions-and-game-length'],
 'assist':['corner-kick'],'brace':['penalty-kick','kick-off'],'own-goal':['throw-in','back-pass-rule'],
 /* batch 2 of new term pages, Nov 20 2026 */
 'header':['heading-rules-for-kids','corner-kick'],'weak-foot':['corner-kick'],'one-touch':['fouls-and-free-kicks'],'scanning':['throw-in'],'support':['back-pass-rule'],
 'possession':['back-pass-rule','throw-in'],'width':['goal-kick'],'step-over':['fouls-and-free-kicks'],'dummy':['corner-kick','offside'],'chip':['fouls-and-free-kicks'],'tap-in':['offside'],
 'near-post':['corner-kick'],'low-block':['offside'],'high-line':['offside','build-out-line'],'pivot':['futsal-rules'],'penalty-area':['penalty-kick','handball'],'goal-area':['goal-kick','fouls-and-free-kicks'],
 'stoppage-time':['substitutions-and-game-length'],'extra-time':['substitutions-and-game-length','kick-off'],'penalty-shoot-out':['penalty-kick'],
};
/** Term page -> a coach tool, only where the word is about team shape or game time. */
const TERM_TOOL:Record<string,ToolKey>={'pressing':'calc','switching-play':'lineup','overlap':'lineup','counterattack':'lineup','marking':'lineup','set-piece':'fields','free-kick-wall':'fields',
 'overload':'lineup','false-nine':'lineup','build-up':'l7','box-to-box':'calc',
 'width':'lineup','low-block':'lineup','high-line':'lineup','stoppage-time':'calc','extra-time':'calc','penalty-area':'fields','goal-area':'fields'};
/** Card role -> the terms and rules that role's football is about. A card page shows two of them, picked by card number, so
 *  the links spread over the list instead of every card pointing at the same page. `t:` a term, `r:` a rule, `tool:` a tool. */
const ROLE_TOPICS:Record<string,string[]>={
 goalkeeper:['t:clean-sheet','r:back-pass-rule','r:goal-kick','r:penalty-kick'],
 centerback:['t:marking','t:goal-side','t:tackle','r:yellow-and-red-cards','r:heading-rules-for-kids','t:pressing'],
 fullback:['t:overlap','t:tackle','t:cross','t:two-v-one','r:yellow-and-red-cards','r:throw-in'],
 midfielder:['t:through-ball','t:give-and-go','t:switching-play','t:pressing','t:first-touch','t:third-man-run'],
 winger:['t:cutback','t:cross','t:two-v-one','t:overlap','t:nutmeg','t:give-and-go'],
 striker:['t:through-ball','t:give-and-go','t:two-v-one','t:hat-trick','r:offside','t:cutback','r:heading-rules-for-kids'],
 goleiro:['r:futsal-rules','t:clean-sheet'],fixo:['r:futsal-rules','t:marking','t:tackle','r:yellow-and-red-cards'],
 ala:['r:futsal-rules','t:give-and-go','t:two-v-one','t:pressing'],pivot:['r:futsal-rules','t:give-and-go','t:two-v-one','t:through-ball'],
 coach:['tool:calc','tool:lineup','t:pressing','t:counterattack','t:switching-play','r:substitutions-and-game-length'],
};
/** Card group page (lib/site/collections.ts slug) -> the roles its topics come from. */
const GROUP_ROLES:Record<string,string[]>={strikers:['striker'],wingers:['winger'],midfielders:['midfielder'],defenders:['centerback','fullback'],goalkeepers:['goalkeeper'],
 coaches:['coach'],futsal:['ala','pivot'],women:['striker','midfielder'],'world-cup-winners':['striker','centerback']};

const rule=(slug:string)=>{const r=ruleBySlug(slug);if(!r)throw new Error(`crossLinks: rule ${slug} does not exist`);return r;};
const term=(slug:string)=>{const t=termBySlug(slug);if(!t)throw new Error(`crossLinks: term ${slug} does not exist`);return t;};
const tool=(k:ToolKey)=>{const t=TOOL_PAGES.find(x=>x.path===TOOL[k]);if(!t)throw new Error(`crossLinks: tool ${TOOL[k]} does not exist`);return t;};
const ruleLink=(slug:string):XLink=>{const r=rule(slug);return {path:r.path,name:r.h1,line:`${r.law}, with a diagram`};};
const termLink=(slug:string):XLink=>{const t=term(slug);return {path:t.path,name:`${t.name} (soccer term)`,line:t.short};};
const toolLink=(k:ToolKey):XLink=>{const t=tool(k);return {path:t.path,name:t.name,line:t.blurb};};
const topic=(key:string):XLink=>key.startsWith('t:')?termLink(key.slice(2)):key.startsWith('r:')?ruleLink(key.slice(2)):toolLink(key.slice(5) as ToolKey);
const uniq=<T extends {path:string}>(l:T[],self?:string)=>l.filter((x,i,a)=>x.path!==self&&a.findIndex(y=>y.path===x.path)===i);

/* Checked at load: every rule and term has a row, and every slug in a row is a real page. */
for(const r of RULES){const row=RULE_LINKS[r.slug];if(!row)throw new Error(`crossLinks: rule ${r.slug} has no row`);tool(row.tool);row.terms.forEach(term);(row.rules??[]).forEach(rule);}
for(const t of TERM_PAGES){const row=TERM_RULES[t.slug];if(!row||row.length===0)throw new Error(`crossLinks: term ${t.slug} has no rule`);row.forEach(rule);}
Object.values(TERM_TOOL).forEach(tool);Object.values(ROLE_TOPICS).flat().forEach(topic);

/** A rule page's links out of its cluster: its coach tool, its terms, a sister rule. */
/** Position page -> the glossary terms that position uses most (SEO striking-distance round, Nov 22 2026): contextual links
 *  into the term pages near page one (through ball, 2v1, cutback, give-and-go, jockeying, penalty area, false nine). */
const POSITION_TERMS:Record<string,string[]>={
 'goalkeeper':['penalty-area','sweeper-keeper','goal-area','clean-sheet'],
 'center-back':['jockeying','goal-side','high-line','clearance','header'],
 'fullback':['overlap','jockeying','cross','underlap'],
 'wingback':['overlap','cross','cutback','width'],
 'defensive-midfielder':['pivot','cover','pressing','box-to-box'],
 'central-midfielder':['box-to-box','give-and-go','switching-play','scanning'],
 'attacking-midfielder':['through-ball','give-and-go','two-v-one','false-nine','assist'],
 'winger':['cutback','two-v-one','cross','dribble'],
 'striker':['false-nine','through-ball','cutback','penalty-area','hat-trick'],
};
for(const [p,ts] of Object.entries(POSITION_TERMS)){if(!POSITIONS.some(x=>x.slug===p))throw new Error(`crossLinks: position ${p} does not exist`);ts.forEach(termLink);}
export const positionTermSlugs=(slug:string):readonly string[]=>POSITION_TERMS[slug]??[];
export const positionTermLinks=(slug:string):XLink[]=>positionTermSlugs(slug).map(termLink);
export function ruleCrossLinks(slug:string):XLink[]{
 const row=RULE_LINKS[slug];if(!row)return [];
 return uniq([toolLink(row.tool),...row.terms.map(termLink),...(row.rules??[]).map(ruleLink)],R+slug);
}
/** A term page's links out of its cluster: its rule (or two) and, for words about shape or game time, a coach tool. */
export function termCrossLinks(slug:string):XLink[]{
 const rules=TERM_RULES[slug]??[],t=TERM_TOOL[slug];
 return uniq([...rules.map(ruleLink),...(t?[toolLink(t)]:[])]);
}
/** Two topic pages for a card, by its role and number. */
export function cardTopicLinks(c:Pick<SiteCard,'role'|'number'>):XLink[]{
 const list=ROLE_TOPICS[c.role]??[];if(list.length===0)return [];
 return uniq([topic(list[c.number%list.length]),topic(list[(c.number+1)%list.length])]);
}
/** The referee's cards are a different thing from player cards: one plain link for readers who wanted the rule. */
export const REFEREE_CARDS_LINK:XLink={path:rule('yellow-and-red-cards').path,name:'Yellow and red cards: the referee’s cards',line:'Looking for the cards a referee shows? Read the rule here.'};
const POSITIONS_LINK:XLink={path:'/learn/soccer-positions',name:'Soccer positions explained',line:'What each position does, with the numbers 1 to 11'};
/** A card group page's topic links: the terms and rules of its roles, the positions guide and the referee's cards. */
export function collectionTopicLinks(c:Pick<Collection,'slug'|'parent'>):XLink[]{
 if(c.parent!=='cards')return [];
 const keys=(GROUP_ROLES[c.slug]??[]).flatMap(r=>ROLE_TOPICS[r]??[]);
 return uniq([...keys.slice(0,6).map(topic),POSITIONS_LINK,REFEREE_CARDS_LINK]);
}

// ---- pop-up books --------------------------------------------------------------------------------------------------------------
const built=SITE_BOOKS.filter((b):b is SiteBook&{path:string}=>!!b.path);
const bookLink=(b:SiteBook&{path:string}):XLink=>({path:b.path,name:b.fullTitle,line:`Pop-up book about ${b.player}${b.country?` (${b.country})`:''}`});
/** Books about players of a card role (the book's own player card says the role). */
export const booksForRole=(role:string):XLink[]=>built.filter(b=>b.card?.role===role).map(bookLink);
/** The book about this card's player, if there is one. */
export const bookForCard=(c:Pick<SiteCard,'number'>):XLink|undefined=>{const b=built.find(x=>x.card?.number===c.number);return b&&bookLink(b);};
/** Books whose page names this museum case (lib/site/bookPages: `exhibits`). */
export const booksForExhibit=(id:string):XLink[]=>built.filter(b=>(b.page?.exhibits??[]).includes(id)).map(bookLink);
/** Books about the players a card group page lists. */
export function booksForCollection(c:Pick<Collection,'parent'|'groups'>):XLink[]{
 if(c.parent!=='cards')return [];
 const listed=new Set(c.groups.flatMap(g=>g.links.map(l=>l.path)));
 return built.filter(b=>b.card&&listed.has(cardPath(b.card.number))).map(bookLink);
}
/** Books with no player card on the site yet: they join the positions guide's book list so no book has only the shelf link. */
export const booksWithoutCard=():XLink[]=>built.filter(b=>!b.card).map(bookLink);

// ---- museum exhibits (SEO phase 2, Nov 20 2026) -----------------------------------------------------------------------------------
/** Museum case -> the rule, term, position, formation and size-chart pages about the same thing. A case page linked other cases,
 *  one lesson or hub and the lessons list, so the history pages gave nothing to the pages that explain today's game. `r:` a rule,
 *  `t:` a term, `tool:` a tool, `pos:` a position page, `chart:` a size chart, `hub:` a guide or lessons list (HUB_LINKS). Each row
 *  is tied to a fact the case states (the 1863 Laws, the 1925 offside change, the size 5 ball, the two goals in the 1991 final,
 *  the 80 minute matches of 1991, boots for indoor courts, the four paths in the trophy room). Checked Nov 20 2026: loose rows
 *  (boots to tackle, trophies to clean sheet, the first World Cup to hat-trick) were cut. The cup and floodlight cases state no
 *  fact a rule or term page explains, so they link the rules list and the match length page and nothing more. */
const EXHIBIT_TOPICS:Record<string,string[]>={
 'laws-1863':['hub:rules','r:offside','r:fouls-and-free-kicks','r:throw-in'],
 'penalty-1891':['r:penalty-kick','r:fouls-and-free-kicks','pos:goalkeeper'],
 'var-2018':['r:penalty-kick','r:yellow-and-red-cards','r:offside'],
 'worldcup-1930':['hub:rules','r:substitutions-and-game-length'],
 'wwc-1991':['t:brace','pos:striker','r:substitutions-and-game-length'],
 'futsal-1989':['r:futsal-rules','hub:futsal','tool:futsal','t:first-touch'],
 'stadiums':['chart:soccer-field-size-by-age','tool:fields'],
 'laced-leather':['chart:soccer-ball-size-by-age','chart:soccer-age-groups'],
 'telstar-1970':['chart:soccer-ball-size-by-age','chart:soccer-age-groups'],
 'boots':['r:futsal-rules','hub:futsal'],
 'shirts':['hub:positions','pos:goalkeeper','pos:striker','tool:lineup'],
 'hall-of-fame':['hub:sizes','hub:futsal'],
 'ballon-dor':['hub:positions','pos:striker','pos:goalkeeper'],
 'first-international-1872':['hub:formations','hub:passing','t:dribble'],
 'offside-rules':['r:offside','t:offside-trap','t:through-ball'],
 'formations-history':['hub:formations','t:false-nine','pos:center-back','tool:lineup'],
 'floodlights-1878':['r:substitutions-and-game-length','chart:soccer-field-size-by-age'],
 'copa-america-1916':['hub:rules','r:substitutions-and-game-length'],
 'keeper-hands-1912':['r:handball','r:back-pass-rule','pos:goalkeeper','t:sweeper-keeper'],
 'free-kick-wall':['r:fouls-and-free-kicks','t:free-kick-wall','t:set-piece'],
 'ball-curve':['r:fouls-and-free-kicks','t:free-kick-wall','t:set-piece'],
 'throw-in':['r:throw-in','t:set-piece'],
};
const lessonHub=(slug:string):XLink=>{const h=hubBySlug(slug);if(!h)throw new Error(`crossLinks: hub ${slug} does not exist`);return {path:h.path,name:h.h1,line:h.blurb};};
const HUB_LINKS:Record<string,XLink>={positions:POSITIONS_LINK,formations:{path:FORMATIONS_HUB.path,name:FORMATIONS_HUB.crumb,line:FORMATIONS_HUB.blurb},
 rules:{path:RULES_HUB.path,name:RULES_HUB.h1,line:RULES_HUB.blurb},passing:lessonHub('passing-and-support'),futsal:lessonHub('futsal-for-kids'),sizes:lessonHub('7v7-9v9-11v11')};
function exhibitTopic(key:string):XLink{
 const [kind,id]=[key.slice(0,key.indexOf(':')),key.slice(key.indexOf(':')+1)];
 if(kind==='pos'){const p=POSITIONS.find(x=>x.slug===id);if(!p)throw new Error(`crossLinks: position ${id} does not exist`);return {path:p.path,name:p.h1,line:p.numberLine};}
 if(kind==='chart'){const c=CHARTS.find(x=>x.slug===id);if(!c)throw new Error(`crossLinks: chart ${id} does not exist`);return {path:c.path,name:c.h1,line:c.blurb};}
 if(kind==='hub'){const h=HUB_LINKS[id];if(!h)throw new Error(`crossLinks: hub ${id} does not exist`);return h;}
 return topic(key);
}
/* Checked at load: every case has a row of at least two real pages, and no row names a case that is gone. */
for(const e of EXHIBITS){const row=EXHIBIT_TOPICS[e.id];if(!row||row.length<2)throw new Error(`crossLinks: exhibit ${e.id} has no row`);row.forEach(exhibitTopic);}
for(const id of Object.keys(EXHIBIT_TOPICS))if(!EXHIBITS.some(e=>e.id===id))throw new Error(`crossLinks: exhibit ${id} does not exist`);
/** A museum case's links out of the museum: the rule, term, position, formation and chart pages about the same thing. */
export const exhibitCrossLinks=(id:string):XLink[]=>uniq((EXHIBIT_TOPICS[id]??[]).map(exhibitTopic));
