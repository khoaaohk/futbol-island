import {RULES,ruleBySlug} from './rules';
import {TERM_PAGES,termBySlug} from './terms';
import {TOOL_PAGES} from './tools/registry';
import {SITE_BOOKS,type SiteBook} from './books';
import {cardPath,type SiteCard} from './cards';
import type {Collection} from './collections';
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
 'kick-off':{tool:'lineup',terms:['set-piece','pressing','own-goal']},
 'throw-in':{tool:'fields',terms:['set-piece','marking','first-touch','own-goal']},
 'goal-kick':{tool:'l7',terms:['pressing','switching-play','set-piece','build-up']},
 'corner-kick':{tool:'fields',terms:['set-piece','cross','marking','far-post']},
 'drop-ball':{tool:'fields',terms:['set-piece','first-touch']},
 'yellow-and-red-cards':{tool:'lineup',terms:['yellow-card','red-card','tackle']},
 'fouls-and-free-kicks':{tool:'fields',terms:['tackle','free-kick-wall','set-piece','shielding','jockeying'],rules:['yellow-and-red-cards']},
 'penalty-kick':{tool:'fields',terms:['set-piece','red-card','brace'],rules:['yellow-and-red-cards']},
 'handball':{tool:'fields',terms:['free-kick-wall','yellow-card','red-card','sweeper-keeper'],rules:['yellow-and-red-cards']},
 'advantage':{tool:'fields',terms:['counterattack','tackle','yellow-card'],rules:['yellow-and-red-cards']},
 'offside':{tool:'lineup',terms:['through-ball','cutback','give-and-go','offside-trap']},
 'back-pass-rule':{tool:'l7',terms:['pressing','first-touch','switching-play','sweeper-keeper']},
 'build-out-line':{tool:'l7',terms:['pressing','two-v-one','switching-play','build-up'],rules:['heading-rules-for-kids']},
 'heading-rules-for-kids':{tool:'l7',terms:['cross','set-piece','first-touch','clearance','volley']},
 'substitutions-and-game-length':{tool:'calc',terms:['pressing','marking','box-to-box'],rules:['heading-rules-for-kids']},
 'futsal-rules':{tool:'futsal',terms:['give-and-go','two-v-one','pressing'],rules:['yellow-and-red-cards']},
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
 'offside-trap':['offside','build-out-line'],'jockeying':['fouls-and-free-kicks'],'cover':['offside'],'clearance':['heading-rules-for-kids','corner-kick'],
 'build-up':['build-out-line','goal-kick'],'false-nine':['offside'],'sweeper-keeper':['handball','back-pass-rule'],'box-to-box':['substitutions-and-game-length'],
 'assist':['corner-kick'],'brace':['penalty-kick','kick-off'],'own-goal':['throw-in','back-pass-rule'],
};
/** Term page -> a coach tool, only where the word is about team shape or game time. */
const TERM_TOOL:Record<string,ToolKey>={'pressing':'calc','switching-play':'lineup','overlap':'lineup','counterattack':'lineup','marking':'lineup','set-piece':'fields','free-kick-wall':'fields',
 'overload':'lineup','false-nine':'lineup','build-up':'l7','box-to-box':'calc'};
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
