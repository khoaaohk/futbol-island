/**
 * "Make the call" swipe games (cards page, Nov 16 2026): the data shape behind components/site/RefCallGame.tsx, kept apart
 * from any one rule so the same game can be fed handball or offside scenarios later. A game is a list of short situations,
 * each with the one right call and a one-line reason; the component shuffles them, takes one call per scenario (swipe or
 * button) and shows a score with a fun referee level. Nothing is stored or sent.
 */
export type CallId='yellow'|'red'|'none';
export type CallScenario={id:string;text:string;answer:CallId;why:string};
/** One choice: its label, the swipe that picks it, and the short word shown on the result ("Yellow card"). */
export type CallChoice={id:CallId;label:string;swipe:'up'|'right'|'left'};
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
export const CALL_IDS:readonly CallId[]=['yellow','red','none'];
/** Fill "{name}" holes in a words string. */
export const fill=(s:string,v:Record<string,string|number>)=>s.replace(/\{(\w+)\}/g,(m,k)=>k in v?String(v[k]):m);
/** The level for a score: the highest level whose `min` share is reached. Levels must be sorted by `min`, the first at 0. */
export function levelFor(levels:readonly CallLevel[],score:number,total:number):CallLevel{
 const share=total?score/total:0;let best=levels[0];
 for(const l of levels)if(share>=l.min-1e-9)best=l;
 return best;
}
/** Checks a game's data (used by the page at build time and by tests/cards-page.cjs). Throws on the first problem. */
export function checkCallGame(g:CallGame):CallGame{
 const ids=new Set<string>();
 if(g.scenarios.length<12||g.scenarios.length>15)throw new Error(`${g.id}: ${g.scenarios.length} scenarios (12-15)`);
 for(const s of g.scenarios){
  if(ids.has(s.id))throw new Error(`${g.id}: duplicate scenario ${s.id}`);ids.add(s.id);
  if(!CALL_IDS.includes(s.answer))throw new Error(`${g.id}/${s.id}: answer ${s.answer} is not yellow, red or none`);
  if(!s.text.trim()||!s.why.trim())throw new Error(`${g.id}/${s.id}: empty text or reason`);}
 for(const c of CALL_IDS)if(!g.choices.some(x=>x.id===c))throw new Error(`${g.id}: no choice for ${c}`);
 if(new Set(g.choices.map(c=>c.swipe)).size!==g.choices.length)throw new Error(`${g.id}: two choices share a swipe`);
 if(!g.levels.length||g.levels[0].min!==0)throw new Error(`${g.id}: the first level must start at 0`);
 return g;
}
/** Fisher-Yates with an injectable random source (tests pass a seeded one). */
export function shuffled<T>(xs:readonly T[],rnd:()=>number=Math.random):T[]{
 const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
