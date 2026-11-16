/**
 * "Make the call" swipe games (cards page, Nov 16 2026; generalised Nov 16 2026 for the back-pass, throw-in, handball and fouls
 * pages, lib/site/rulePlay.ts): the data shape behind components/site/RefCallGame.tsx, kept apart from any one rule. A game
 * has two or three choices, each with its own id, swipe and colour tone. A game is a list of short situations,
 * each with the one right call and a one-line reason; the component shuffles them, takes one call per scenario (swipe or
 * button) and shows a score with a fun referee level. Nothing is stored or sent.
 */
/** A choice id: 'yellow' | 'red' | 'none' on the cards page; each game names its own (e.g. 'yes' / 'no'). */
export type CallId=string;
/** The colour of a choice's button and of the answered card: the cards' yellow / red / ink ('none'), the pitch green, the gold. */
export type CallTone='yellow'|'red'|'none'|'pitch'|'gold';
export type CallScenario={id:string;text:string;answer:CallId;why:string};
/** One choice: its label (also the word shown on the result), the swipe that picks it, and its tone (default: its id). */
export type CallChoice={id:CallId;label:string;swipe:'up'|'right'|'left';tone?:CallTone};
export type CallLevel={min:number;name:string;line:string};/* min = the share of right calls (0-1) needed for this level */
export type CallGameWords={
 title:string;intro:string;start:string;again:string;next:string;finish:string;
 /** "Scenario {n} of {total}" */progress:string;
 /** "Swipe up for yellow, right for red, left for no card. Or use the buttons." */how:string;
 right:string;wrong:string;/* "Right call!" / "Not quite." */
 /** "The right call: {call}." */answerIs:string;
 /** "You got {score} of {total} right." */score:string;
 levelIs:string;/* "Your referee level:" */
 privacy:string;/* "Nothing you pick is saved or sent." */
 noScript:string;
};
export type CallGame={id:string;choices:readonly CallChoice[];scenarios:readonly CallScenario[];levels:readonly CallLevel[];words:CallGameWords};
const TONES:readonly string[]=['yellow','red','none','pitch','gold'];
/** A choice's colour tone: its own, or its id when that is a tone (the cards page's yellow / red / none). */
export const toneOf=(c:CallChoice):CallTone=>c.tone??(TONES.includes(c.id)?c.id as CallTone:'none');
/** Fill "{name}" holes in a words string. */
export const fill=(s:string,v:Record<string,string|number>)=>s.replace(/\{(\w+)\}/g,(m,k)=>k in v?String(v[k]):m);
/** The level for a score: the highest level whose `min` share is reached. Levels must be sorted by `min`, the first at 0. */
export function levelFor(levels:readonly CallLevel[],score:number,total:number):CallLevel{
 const share=total?score/total:0;let best=levels[0];
 for(const l of levels)if(share>=l.min-1e-9)best=l;
 return best;
}
/** Checks a game's data (used by the pages at build time and by tests/cards-page.cjs, tests/rules-games.cjs). Throws on the
 * first problem: 10-15 scenarios with unique ids, text and a reason; 2-3 choices with unique ids and swipes (two choices swipe
 * left / right); every answer is a choice and every choice is the answer at least once. */
export function checkCallGame(g:CallGame):CallGame{
 const ids=new Set<string>(),choiceIds=g.choices.map(c=>c.id);
 if(g.scenarios.length<10||g.scenarios.length>15)throw new Error(`${g.id}: ${g.scenarios.length} scenarios (10-15)`);
 if(g.choices.length<2||g.choices.length>3||new Set(choiceIds).size!==g.choices.length)throw new Error(`${g.id}: 2-3 choices with unique ids`);
 for(const s of g.scenarios){
  if(ids.has(s.id))throw new Error(`${g.id}: duplicate scenario ${s.id}`);ids.add(s.id);
  if(!choiceIds.includes(s.answer))throw new Error(`${g.id}/${s.id}: answer ${s.answer} is not one of ${choiceIds.join(', ')}`);
  if(!s.text.trim()||!s.why.trim())throw new Error(`${g.id}/${s.id}: empty text or reason`);}
 for(const c of choiceIds)if(!g.scenarios.some(s=>s.answer===c))throw new Error(`${g.id}: no scenario answers ${c}`);
 if(new Set(g.choices.map(c=>c.swipe)).size!==g.choices.length)throw new Error(`${g.id}: two choices share a swipe`);
 if(g.choices.length===2&&g.choices.some(c=>c.swipe==='up'))throw new Error(`${g.id}: a two-choice game swipes left and right`);
 if(!g.levels.length||g.levels[0].min!==0)throw new Error(`${g.id}: the first level must start at 0`);
 return g;
}
/** Fisher-Yates with an injectable random source (tests pass a seeded one). */
export function shuffled<T>(xs:readonly T[],rnd:()=>number=Math.random):T[]{
 const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
