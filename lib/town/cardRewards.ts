/**
 * Card rewards ("choose 1 of 3"): pure rules, no storage and no imports, so tests/card-rewards.cjs can run them in Node.
 * The client store is lib/town/cardRewardStore.ts; the design and rationale are in docs/card-rewards.md.
 *
 * After a ball is found, an NPC chat is finished or a lesson quiz is passed, the child is offered three face-up cards they
 * do not own yet and picks one. The three are drawn at random from the missing cards (the user's request); there are no odds,
 * no hidden cards, no timers, nothing to buy, and an offer the child sets aside stays pending until they choose.
 */

/**
 * LAUNCH SWITCH (the one line to change): true turns card rewards on AND unlock-all off for everyone (UNLOCK_ALL_CARDS in
 * cardCollection.ts is derived from it). Turned ON Sep 24 2026 (user): every player now earns cards from an empty binder. The dev
 * `?cards=earn` / `?cards=all` switches (cardDevEarn) only matter while this is false.
 */
export const CARD_REWARDS_LAUNCH=true;
/** Rewards on: follows the launch switch. */
export const CARD_REWARDS_ENABLED=CARD_REWARDS_LAUNCH;
/** Cards shown in one offer (fewer when fewer are missing). */
export const OFFER_SIZE=3;
/** Gentle cap: offers created per browser session (tab); later triggers in the same session simply offer nothing. */
export const MAX_OFFERS_PER_SESSION=6;
/** NPC chats (user decision, Sep 24 2026): at most one pick per NPC per day and this many NPC picks per day in total,
 *  resetting at local midnight. Nothing carries over and nothing is lost by skipping a day. */
export const NPC_PICKS_PER_DAY=5;
/** Teaching weight (user approved, Sep 24 2026): one of the three is drawn from the positions the activity was about (a goalkeeper
 *  after a goalkeeping quiz, a futsal card after futsal); the other two stay random. Falls back to fully random when no card
 *  of that theme is missing. */
export const THEME_ONE_CARD=true;
/** Quiz rule (user, Sep 24 2026): a quiz earns a card only with at least this many questions, all answered correctly (retries
 *  within the quiz are fine). Quizzes are being lengthened to 5+; shorter ones earn nothing */
export const MIN_QUIZ_QUESTIONS=5;
export const quizEarnsCard=(questions:number,allCorrect:boolean)=>questions>=MIN_QUIZ_QUESTIONS&&allCorrect;

export const OFFERS_STORAGE_KEY='fi2-card-offers-v1';

export type RewardKind='ball'|'npc'|'quiz'|'explore'|'journey'|'story';
export const REWARD_KINDS:readonly RewardKind[]=['ball','npc','quiz','explore','journey','story'];
/** The positions an activity was about (card roles from positionPlayers.json). */
export type Theme={roles:string[];label:string};
/** `match`: the card drawn for the theme (the reason line mentions it while it is still in the offer). */
export type CardOffer={id:string;kind:RewardKind;source:string;reason:string;cards:string[];at:number;seen:boolean;theme?:Theme;match?:string};
export type OfferState={version:1;offers:CardOffer[];paid:string[];npcDay:{day:string;ids:string[]}};
export type CardInfo={name:string;role:string};

export const emptyOfferState=():OfferState=>({version:1,offers:[],paid:[],npcDay:{day:'',ids:[]}});

/** The device's local calendar day ("2026-09-24"): NPC picks reset at local midnight. */
export const dayKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

/** Whether an NPC chat may still offer a card today (one per NPC per day, NPC_PICKS_PER_DAY in total). */
export function npcPickState(state:OfferState,npcId:string,day:string,perDay=NPC_PICKS_PER_DAY):'ok'|'npc-today'|'day-cap'{
 const ids=state.npcDay.day===day?state.npcDay.ids:[];
 if(ids.includes(npcId))return 'npc-today';
 return ids.length>=perDay?'day-cap':'ok';
}

/** Payout key for a source: each ball, quiz and (per day) NPC pays at most once. */
export const sourceKey=(kind:RewardKind,id:string,day:string)=>kind==='npc'?`npc:${day}:${id}`:`${kind}:${id}`;

const pickRandom=<T,>(list:T[],rng:()=>number)=>list[Math.min(list.length-1,Math.floor(rng()*list.length))];

/**
 * Draws up to `size` distinct cards the child does not own. Cards already waiting in other offers are avoided while enough
 * others remain (so two pending offers rarely repeat a card). With `theme` and `themed`, the first card comes from the theme's
 * roles when any are missing; the rest are uniform. Order is shuffled so a themed card is not always first.
 */
type DrawOptions={avoid?:Set<string>;theme?:Theme;themed?:boolean;size?:number};
export function drawOffer(cards:CardInfo[],owned:Set<string>,rng:()=>number,options:DrawOptions={}):string[]{return drawThemedOffer(cards,owned,rng,options).cards;}
/** drawOffer, also naming the card drawn for the theme (null when unthemed or no card of the theme is missing). */
export function drawThemedOffer(cards:CardInfo[],owned:Set<string>,rng:()=>number,{avoid=new Set<string>(),theme,themed=THEME_ONE_CARD,size=OFFER_SIZE}:DrawOptions={}):{cards:string[];match:string|null}{
 const missing=cards.filter(card=>!owned.has(card.name));
 const fresh=missing.filter(card=>!avoid.has(card.name));
 let pool=fresh.length>=Math.min(size,missing.length)?fresh:missing;
 const picked:string[]=[];let match:string|null=null;
 const take=(from:CardInfo[])=>{const card=pickRandom(from,rng);picked.push(card.name);pool=pool.filter(c=>c.name!==card.name);return card.name;};
 if(themed&&theme?.roles.length&&size>0){
  // Prefer a themed card not waiting in another offer; else any missing card of the theme; else fully random.
  const inTheme=(card:CardInfo)=>theme.roles.includes(card.role);
  const fromPool=pool.filter(inTheme),fromMissing=missing.filter(inTheme);
  if(fromPool.length||fromMissing.length)match=take(fromPool.length?fromPool:fromMissing);
 }
 while(picked.length<size&&pool.length)take(pool);
 for(let i=picked.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[picked[i],picked[j]]=[picked[j],picked[i]];}
 return {cards:picked,match};
}

/** The reason line as shown: the base reason, plus the theme sentence while the matched card is still in the offer. */
export function offerReason(offer:CardOffer,roleLabel:(name:string)=>string){
 if(!offer.match||!offer.theme||!offer.cards.includes(offer.match))return offer.reason;
 return `${offer.reason} ${offer.match} (${roleLabel(offer.match).toLowerCase()}) matches what you just learned about ${offer.theme.label}.`;
}

/** An offer as it should be shown now: any card the child has since collected (another tab, another offer) is swapped for a
 *  fresh missing card, so an open offer never shows an owned card. Returns the same object when nothing changed. */
export function refreshOffer(offer:CardOffer,cards:CardInfo[],owned:Set<string>,rng:()=>number,avoid=new Set<string>()):CardOffer{
 const keep=offer.cards.filter(name=>!owned.has(name));
 if(keep.length===offer.cards.length)return offer;
 const extra=drawOffer(cards,new Set([...owned,...keep]),rng,{avoid,size:offer.cards.length-keep.length,themed:false});
 return {...offer,cards:[...keep,...extra]};
}

/** Words in a lesson, ball tip or chat that point at a position. Futsal context maps to the futsal roles. */
const ROLE_WORDS:[RegExp,string,string,string][]=[
 [/goal ?keep|keeper|goleiro|\bgk\b|save/i,'goalkeeper','goleiro','goalkeeping'],
 [/pivot|pivô|back to goal|lay-?off|target/i,'striker','pivot','playing up front'],
 [/finish|striker|shoot|shot|scor|run|depth/i,'striker','pivot','finishing'],
 [/wing|wide|width|cross|cutback|switch|overlap|touchline/i,'winger','ala','playing wide'],
 [/full-?back/i,'fullback','ala','full-back play'],
 [/defen|cover|\bpress\b|pressing|protect|recover|goal-?side|block|centre-?back|center-?back|fixo/i,'centerback','fixo','defending'],
 [/midfield|scan|receiv|pass|support|triangle|third|between lines|build|control|combine/i,'midfielder','ala','passing and support'],
];
/** The theme an activity teaches, from its text (lesson category and title, ball tip, chat topic). */
export function themeFromText(text:string,futsal=false):Theme|undefined{
 const hit=ROLE_WORDS.find(([pattern])=>pattern.test(text));
 if(futsal&&!hit)return {roles:['goleiro','fixo','ala','pivot'],label:'futsal'};
 if(!hit)return undefined;
 return {roles:[futsal?hit[2]:hit[1]],label:hit[3]};
}

const isString=(v:unknown):v is string=>typeof v==='string';
/** Reads saved state tolerantly: unknown names and malformed offers are dropped, never trusted. */
export function sanitizeOfferState(raw:unknown,valid:Set<string>):OfferState{
 const state=emptyOfferState();
 if(!raw||typeof raw!=='object')return state;
 const r=raw as Record<string,unknown>;
 if(Array.isArray(r.paid))state.paid=[...new Set(r.paid.filter(isString))];
 const day=r.npcDay as Record<string,unknown>|undefined;
 if(day&&isString(day.day)&&Array.isArray(day.ids))state.npcDay={day:day.day,ids:[...new Set(day.ids.filter(isString))]};
 if(Array.isArray(r.offers))for(const o of r.offers as Record<string,unknown>[]){
  if(!o||!isString(o.id)||!isString(o.source)||!isString(o.reason)||!Array.isArray(o.cards))continue;
  const kind=REWARD_KINDS.find(k=>k===o.kind)??null;if(!kind)continue;
  const cards=[...new Set(o.cards.filter((n:unknown):n is string=>isString(n)&&valid.has(n)))].slice(0,OFFER_SIZE);if(!cards.length)continue;
  const t=o.theme as Record<string,unknown>|undefined,theme=t&&Array.isArray(t.roles)&&isString(t.label)?{roles:t.roles.filter(isString),label:t.label}:undefined;
  const match=isString(o.match)&&valid.has(o.match)?o.match:undefined;
  if(o.catchUp===true)continue; // catch-up picks were removed (Sep 24 2026, no users yet); drop any a test browser saved
  if(!state.offers.some(x=>x.id===o.id))state.offers.push({id:o.id,kind,source:o.source,reason:o.reason,cards,at:typeof o.at==='number'?o.at:0,seen:o.seen===true,...(theme?{theme}:{}),...(match?{match}:{})});
 }
 return state;
}

/** Merges this tab's state with what another tab saved: offers and payouts are unions (nothing earned is ever lost). This tab's
 *  copy of an offer wins (it holds the latest seen/refresh); offers this tab resolved (chose a card from) are dropped. */
export function mergeOfferState(current:OfferState,saved:OfferState,resolved:Set<string>):OfferState{
 const offers=[...current.offers];for(const o of saved.offers)if(!offers.some(x=>x.id===o.id))offers.push(o);offers.sort((a,b)=>a.at-b.at);
 const days=[current.npcDay,saved.npcDay].filter(d=>d.day),day=days.map(d=>d.day).sort().at(-1)??'';
 return {version:1,offers:offers.filter(o=>!resolved.has(o.id)),paid:[...new Set([...saved.paid,...current.paid])],npcDay:{day,ids:[...new Set(days.filter(d=>d.day===day).flatMap(d=>d.ids))]}};
}
