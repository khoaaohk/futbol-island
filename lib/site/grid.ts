import type {Arrow} from './pitch';
/**
 * Practice-grid scenes for the drill pages (SEO cluster 3, Nov 10 2026; lib/site/drills.ts): a coach's setup seen from above.
 * Not a full pitch (lib/site/scenes.ts does those): a marked area of a given size in YARDS, drawn in proportion by
 * lib/site/GridDiagram.tsx (inline SVG) and lib/site/gridImage.tsx (PNG). Plain data, parsed and checked here.
 *
 * x is 0-100 from the left edge of the area and y is 0-100 from the bottom edge; values a little outside 0-100 put a waiting
 * player, a server or a goal just outside the area.
 *  - `who`: space-separated dots. `7@50,20` is a gold player marked 7 (attackers, or players with a ball); `!D@50,60` is a dark
 *    green player (defenders, taggers); a label is 1-3 characters (`GK`, `C` for the coach).
 *  - `cones`: `x,y x,y …` (the four corners are drawn automatically; add gates and markers here).
 *  - `goals`: `x,y,h` is a small goal lying along an end line, `x,y,v` along a side line; an optional 4th number is its width
 *    as a percentage of that side (default 16).
 *  - `balls`: `x,y x,y …`. `zones`: shaded rectangles [x0,y0,x1,y1] (end zones, safe zones).
 *  - `passes` (solid arrow: the ball is kicked), `runs` (dashed arrow: a player moves without the ball) and `dribbles` (wavy
 *    gold arrow: a player moves WITH the ball) are `x,y>x,y`.
 * Every scene has a hand-written caption (a full sentence): it is the text under the picture and part of the SVG <desc>.
 */
export type GridDot={n:string;x:number;y:number;opp?:boolean};
export type GridGoal={x:number;y:number;dir:'h'|'v';size:number};
export type Rect=[number,number,number,number];
export type GridScene={w:number;l:number;title:string;caption:string;dots:GridDot[];cones:[number,number][];goals:GridGoal[];balls:[number,number][];zones:Rect[];passes:Arrow[];runs:Arrow[];dribbles:Arrow[]};
export type RawGrid={w:number;l:number;title:string;caption:string;who?:string;cones?:string;goals?:string;balls?:string;zones?:Rect[];passes?:string[];runs?:string[];dribbles?:string[]};
const NUM='(-?[\\d.]+)';
const ok=(v:number)=>v>=-14&&v<=114;
const arrow=(s:string,t:string):Arrow=>{const m=new RegExp(`^${NUM},${NUM}>${NUM},${NUM}$`).exec(s);if(!m||![+m[1],+m[2],+m[3],+m[4]].every(ok))throw new Error(`grid arrow "${s}" in "${t}"`);return {from:[+m[1],+m[2]],to:[+m[3],+m[4]]};};
const pairs=(s:string|undefined,t:string):[number,number][]=>(s??'').split(' ').filter(Boolean).map(p=>{const m=new RegExp(`^${NUM},${NUM}$`).exec(p);if(!m||!ok(+m[1])||!ok(+m[2]))throw new Error(`grid point "${p}" in "${t}"`);return [+m[1],+m[2]];});
export function grid(r:RawGrid):GridScene{
 const t=r.title;
 if(!(r.w>=5&&r.w<=80&&r.l>=5&&r.l<=80))throw new Error(`grid size ${r.w} x ${r.l} in "${t}"`);
 if(!/[.!?]$/.test(r.caption))throw new Error(`grid caption must be a sentence: ${t}`);
 const dots=(r.who??'').split(' ').filter(Boolean).map(d=>{const m=new RegExp(`^(!?)([^@]{1,3})@${NUM},${NUM}$`).exec(d);if(!m||!ok(+m[3])||!ok(+m[4]))throw new Error(`grid dot "${d}" in "${t}"`);
  return {n:m[2],x:+m[3],y:+m[4],...(m[1]?{opp:true}:{})};});
 const goals=(r.goals??'').split(' ').filter(Boolean).map(g=>{const m=new RegExp(`^${NUM},${NUM},(h|v)(?:,${NUM})?$`).exec(g);if(!m)throw new Error(`grid goal "${g}" in "${t}"`);
  return {x:+m[1],y:+m[2],dir:m[3] as 'h'|'v',size:m[4]?+m[4]:16};});
 return {w:r.w,l:r.l,title:t,caption:r.caption,dots,cones:pairs(r.cones,t),goals,balls:pairs(r.balls,t),zones:r.zones??[],
  passes:(r.passes??[]).map(a=>arrow(a,t)),runs:(r.runs??[]).map(a=>arrow(a,t)),dribbles:(r.dribbles??[]).map(a=>arrow(a,t))};
}
/** Yards to metres, rounded to a whole metre (a coach paces it out; the pages always give yards first). */
export const metres=(yd:number)=>Math.round(yd*.9144);
export const gridSize=(g:{w:number;l:number})=>`${g.w} x ${g.l} yd (${metres(g.w)} x ${metres(g.l)} m)`;
/** The text alternative of a grid diagram: the fixed key first, then the scene's own caption. */
export function gridDesc(g:GridScene):string{
 const key=[g.cones.length?'small triangles are cones':'',g.goals.length?'white bars are goals':'',g.passes.length?'solid arrows are passes':'',g.runs.length?'dashed arrows are runs without the ball':'',g.dribbles.length?'wavy gold arrows are dribbles':''].filter(Boolean);
 return `Setup diagram of an area ${g.w} yards wide and ${g.l} yards long, seen from above, with a cone on each corner. Gold dots are attackers or players with a ball and dark green dots are defenders${key.length?`; ${key.join(', ')}`:''}. ${g.caption}`;
}
/** The short key printed under a diagram (only the marks that picture uses). */
export function gridKey(g:GridScene):string{
 const k=['Gold: attackers.'];if(g.dots.some(d=>d.opp))k.push('Dark green: defenders.');if(g.cones.length)k.push('Triangles: cones.');if(g.goals.length)k.push('White bars: goals.');
 if(g.passes.length)k.push('Solid arrow: pass.');if(g.runs.length)k.push('Dashed arrow: run.');if(g.dribbles.length)k.push('Wavy arrow: dribble.');
 return k.join(' ');
}
