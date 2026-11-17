/**
 * The key-facts icons on the guide and tool pages (visual pass, Nov 17 2026: "break each section up"). Drawn in the energy bar's
 * language (components/FuelCount.tsx FuelIcon) like the tool cards' icons (./tools/ToolIcons.tsx, reused here for the shirt,
 * the stopwatch, the pitch and the whistle): a 16x16 grid, chunky warm fills, the brown outline #7a4e12 at 1.4, round joins.
 * Decorative only (aria-hidden): the fact's own words say what it is.
 */
import type {ReactNode} from 'react';
import {ToolIcon,type ToolIconKind} from './tools/ToolIcons';

const O='#7a4e12',GOLD='#f2b632',PAPER='#fffaf0',RED='#e0533d',GRASS='#7cc36a',SKY='#5bb6d9',CONE='#f07a3a';
const S={stroke:O,strokeWidth:1.4,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};
export type FactIconKind=ToolIconKind|'law'|'cards'|'quiz'|'tag'|'link'|'steps'|'deck'|'lock'|'share'
 /* batch 3 (Keep reading groups, hub chapters, the rules hub's five lines) */
 |'ball'|'cone'|'glove'|'flag'|'goal'|'shield'|'swap'|'arrow'|'fish'|'book'
 /* batch 5 (Nov 17 2026): trust tiles, Fishbook facts, drill chips */
 |'coin'|'noads'|'nochat'|'kid'|'phone'|'key'|'star'|'ruler'|'pin'|'moon'|'boat'|'eye'|'bobber'|'people'|'tick'|'bars';

const DRAW:Partial<Record<FactIconKind,ReactNode>>={
 /* the rule book: a closed book with a page edge */
 law:<><path d="M3 2.2h8.6a1.4 1.4 0 0 1 1.4 1.4v10.2H4.4A1.4 1.4 0 0 1 3 12.4Z" fill={SKY} {...S}/><path d="M3 12.4a1.4 1.4 0 0 1 1.4-1.4H13" fill="none" stroke={O} strokeWidth={1.2}/><path d="M6 5.2h4.4" stroke={PAPER} strokeWidth={1.4} strokeLinecap="round"/></>,
 /* a yellow card behind a red card */
 cards:<><rect x={2} y={2.2} width={7} height={9.6} rx={1} transform="rotate(-10 5.5 7)" fill={GOLD} {...S}/><rect x={7} y={4.2} width={7} height={9.6} rx={1} transform="rotate(8 10.5 9)" fill={RED} {...S}/></>,
 /* a question card with a tick */
 quiz:<><rect x={2} y={2} width={12} height={12} rx={2.2} fill={GRASS} {...S}/><path d="M5 8.3 7.1 10.4 11.2 5.8" fill="none" stroke={PAPER} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></>,
 /* a name tag */
 tag:<><path d="M1.8 7.9 7.4 2.3h6.3v6.3l-5.6 5.6Z" fill={GOLD} {...S}/><circle cx={10.9} cy={5.1} r={1.2} fill={PAPER} stroke={O} strokeWidth={1}/></>,
 /* two linked rings */
 link:<><rect x={1.6} y={5.4} width={7.6} height={5.2} rx={2.6} fill="none" stroke={O} strokeWidth={3.4}/><rect x={1.6} y={5.4} width={7.6} height={5.2} rx={2.6} fill="none" stroke={GOLD} strokeWidth={1.6}/>
  <rect x={6.8} y={5.4} width={7.6} height={5.2} rx={2.6} fill="none" stroke={O} strokeWidth={3.4}/><rect x={6.8} y={5.4} width={7.6} height={5.2} rx={2.6} fill="none" stroke={GRASS} strokeWidth={1.6}/></>,
 /* three stepping stones going up */
 steps:<><rect x={1.6} y={10} width={4.2} height={4} rx={.8} fill={GOLD} {...S}/><rect x={5.9} y={6.4} width={4.2} height={7.6} rx={.8} fill={GOLD} {...S}/><rect x={10.2} y={2.4} width={4.2} height={11.6} rx={.8} fill={GOLD} {...S}/></>,
 /* a fanned deck of flip cards */
 deck:<><rect x={2.4} y={3.4} width={8} height={10.6} rx={1.2} transform="rotate(-12 6.4 8.7)" fill={PAPER} {...S}/><rect x={5.6} y={2} width={8} height={10.6} rx={1.2} fill={GOLD} {...S}/><path d="M8.2 7.3h2.8" stroke={O} strokeWidth={1.4} strokeLinecap="round"/></>,
 /* a padlock: nothing to sign up for */
 lock:<><path d="M5 7V5.2a3 3 0 0 1 6 0V7" fill="none" stroke={O} strokeWidth={1.6} strokeLinecap="round"/><rect x={3} y={7} width={10} height={7.2} rx={1.4} fill={GOLD} {...S}/><circle cx={8} cy={10.4} r={1.1} fill={O}/></>,
 /* a sheet going out: print, copy, send */
 share:<><path d="M2.5 5.5h7v8.5h-7Z" fill={PAPER} {...S}/><path d="M6.2 9.6 13.6 2.4M9.8 2.2h4v4" fill="none" stroke={O} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/></>,
 /* a football: white with one dark patch */
 ball:<><circle cx={8} cy={8} r={6.2} fill={PAPER} {...S}/><path d="M8 5.4 10.3 7.1 9.4 9.8H6.6L5.7 7.1Z" fill={O}/></>,
 /* an orange training cone on its base */
 cone:<><path d="M8 1.8 12.2 12.6H3.8Z" fill={CONE} {...S}/><path d="M5.6 8.2h4.8" stroke={PAPER} strokeWidth={1.4} strokeLinecap="round"/><rect x={1.8} y={12.4} width={12.4} height={2.2} rx={.8} fill={CONE} {...S}/></>,
 /* a goalkeeper's glove */
 glove:<><path d="M4 14.2V7.4l-1.4-2a1 1 0 0 1 1.6-1.2L5 5.2V2.8a1 1 0 0 1 2 0V2.2a1 1 0 0 1 2 0v.6a1 1 0 0 1 2 0v1a1 1 0 0 1 2 0v6.2a4 4 0 0 1-1.6 3.2v1Z" fill={SKY} {...S}/><path d="M5 11.6h6.4" stroke={PAPER} strokeWidth={1.4} strokeLinecap="round"/></>,
 /* the corner flag on its pole */
 flag:<><path d="M4 14.4V1.8" stroke={O} strokeWidth={1.8} strokeLinecap="round"/><path d="M4.6 2.2h8.2l-2.2 3 2.2 3H4.6Z" fill={RED} {...S}/><path d="M2 14.4h5" stroke={O} strokeWidth={1.6} strokeLinecap="round"/></>,
 /* a goal with its net */
 goal:<><path d="M1.6 13.6V3.6h12.8v10" fill="none" stroke={O} strokeWidth={3.2} strokeLinejoin="round"/><path d="M1.6 13.6V3.6h12.8v10" fill="none" stroke={PAPER} strokeWidth={1.4} strokeLinejoin="round"/><path d="M4.4 4.8v8.8M7.2 4.8v8.8M10 4.8v8.8M12.8 4.8v8.8M2.8 7.6h10.8M2.8 10.6h10.8" stroke={O} strokeWidth={.6} opacity={.55}/></>,
 /* a defender's shield */
 shield:<><path d="M8 1.6 13.6 3.6v4.2c0 3.4-2.4 5.6-5.6 6.8-3.2-1.2-5.6-3.4-5.6-6.8V3.6Z" fill={GRASS} {...S}/><path d="M8 3.6v9" stroke={PAPER} strokeWidth={1.6} strokeLinecap="round"/></>,
 /* two arrows trading places: the ball changes hands */
 swap:<><path d="M2.4 5.4h9.4M9.4 2.8l2.6 2.6-2.6 2.6" fill="none" stroke={O} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"/><path d="M2.4 5.4h9.4M9.4 2.8l2.6 2.6-2.6 2.6" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13.6 10.8H4.2M6.6 8.2 4 10.8l2.6 2.6" fill="none" stroke={O} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"/><path d="M13.6 10.8H4.2M6.6 8.2 4 10.8l2.6 2.6" fill="none" stroke={GRASS} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/></>,
 /* an arrow going up the pitch: attacking */
 arrow:<><path d="M8 14.2V3.2M3.6 7.4 8 2.6l4.4 4.8" fill="none" stroke={O} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"/><path d="M8 14.2V3.2M3.6 7.4 8 2.6l4.4 4.8" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></>,
 /* a fish */
 fish:<><path d="M1.6 8c2-3.4 6.6-4.2 9.6-1.4l3-2.2v7.2l-3-2.2C8.2 12.2 3.6 11.4 1.6 8Z" fill={SKY} {...S}/><circle cx={5} cy={7.4} r={.9} fill={O}/></>,
 /* an open book: a guide to read */
 book:<><path d="M8 4.2C6.4 2.8 4 2.6 1.8 3v9.8c2.2-.4 4.6-.2 6.2 1.2 1.6-1.4 4-1.6 6.2-1.2V3C12 2.6 9.6 2.8 8 4.2Z" fill={PAPER} {...S}/><path d="M8 4.2V14" stroke={O} strokeWidth={1.2}/><path d="M3.6 6h2.6M3.6 8.4h2.6M9.8 6h2.6M9.8 8.4h2.6" stroke={GOLD} strokeWidth={1.2} strokeLinecap="round"/></>,
 /* an island coin: free, nothing to buy */
 coin:<><circle cx={8} cy={8} r={6.2} fill={GOLD} {...S}/><circle cx={8} cy={8} r={3.6} fill="none" stroke={O} strokeWidth={1.1}/><path d="M8 6.2v3.6" stroke={O} strokeWidth={1.4} strokeLinecap="round"/></>,
 /* a pop-up box with a red slash: no pop-up ads */
 noads:<><rect x={2} y={3} width={12} height={9.4} rx={1.4} fill={PAPER} {...S}/><path d="M2 5.8h12" stroke={O} strokeWidth={1.2}/><path d="M2.6 13.6 13.4 2.4" stroke={RED} strokeWidth={2} strokeLinecap="round"/></>,
 /* a speech bubble with a red slash: no open chat */
 nochat:<><path d="M2.4 3.4h11.2v7.2H7.2L4.4 13v-2.4h-2Z" fill={PAPER} {...S}/><path d="M2.6 13.6 13.4 2.4" stroke={RED} strokeWidth={2} strokeLinecap="round"/></>,
 /* a kid in a gold shirt: ages */
 kid:<><circle cx={8} cy={4.6} r={2.6} fill={PAPER} {...S}/><path d="M3.4 14.2v-2.6a3 3 0 0 1 3-3h3.2a3 3 0 0 1 3 3v2.6Z" fill={GOLD} {...S}/></>,
 /* a phone */
 phone:<><rect x={4.2} y={1.6} width={7.6} height={12.8} rx={1.6} fill={SKY} {...S}/><rect x={5.6} y={3.4} width={4.8} height={8} rx={.6} fill={PAPER}/><circle cx={8} cy={12.8} r={.7} fill={O}/></>,
 /* a key: the save code */
 key:<><circle cx={5} cy={8} r={3} fill={GOLD} {...S}/><circle cx={5} cy={8} r={1} fill={PAPER} stroke={O} strokeWidth={.9}/><path d="M8 8h6M12 8v2.6M14 8v2" fill="none" stroke={O} strokeWidth={1.6} strokeLinecap="round"/></>,
 /* a star: rarity */
 star:<path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6Z" fill={GOLD} {...S}/>,
 /* a ruler: size */
 ruler:<><rect x={1.6} y={5} width={12.8} height={6} rx={1} fill={GOLD} {...S}/><path d="M4.4 5v2.4M7 5v3.2M9.6 5v2.4M12.2 5v3.2" stroke={O} strokeWidth={1.2} strokeLinecap="round"/></>,
 /* a map pin: where */
 pin:<><path d="M8 14.4s-4.6-4.6-4.6-8a4.6 4.6 0 0 1 9.2 0c0 3.4-4.6 8-4.6 8Z" fill={RED} {...S}/><circle cx={8} cy={6.3} r={1.7} fill={PAPER} stroke={O} strokeWidth={1}/></>,
 /* a moon: time of day */
 moon:<path d="M10.6 2.2a6 6 0 1 0 3.4 9.4A5 5 0 0 1 10.6 2.2Z" fill={GOLD} {...S}/>,
 /* a deep-sea boat */
 boat:<><path d="M1.8 9.6h12.4l-2 3.8H3.8Z" fill={RED} {...S}/><path d="M7.4 2.4v7.2M7.4 3 12 8.6H7.4" fill={PAPER} {...S}/></>,
 /* an eye: watch the water */
 eye:<><path d="M1.6 8s2.4-4.4 6.4-4.4S14.4 8 14.4 8s-2.4 4.4-6.4 4.4S1.6 8 1.6 8Z" fill={PAPER} {...S}/><circle cx={8} cy={8} r={2.3} fill={SKY} stroke={O} strokeWidth={1.1}/><circle cx={8} cy={8} r={.8} fill={O}/></>,
 /* a float on its line: the lure */
 bobber:<><path d="M8 1.4v3" stroke={O} strokeWidth={1.4} strokeLinecap="round"/><circle cx={8} cy={9.4} r={5} fill={PAPER} {...S}/><path d="M3 9.4a5 5 0 0 1 10 0Z" fill={RED} {...S}/></>,
 /* two players: players */
 people:<><circle cx={5.4} cy={4.8} r={2.2} fill={PAPER} {...S}/><path d="M1.6 13.6v-2a2.6 2.6 0 0 1 2.6-2.6h2.4a2.6 2.6 0 0 1 2.6 2.6v2Z" fill={GOLD} {...S}/>
  <circle cx={11} cy={5.6} r={2} fill={PAPER} {...S}/><path d="M9.2 13.6v-1.8a2.4 2.4 0 0 1 2.4-2.4h.4a2.4 2.4 0 0 1 2.4 2.4v1.8Z" fill={GRASS} {...S}/></>,
 /* a round tick: a coaching point to say */
 tick:<><circle cx={8} cy={8} r={6.2} fill={GRASS} {...S}/><path d="M5 8.2 7.1 10.3 11 6" fill="none" stroke={PAPER} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></>,
 /* three bars: anonymous totals */
 bars:<><rect x={2} y={8} width={3.2} height={6} rx={.6} fill={SKY} {...S}/><rect x={6.4} y={4.6} width={3.2} height={9.4} rx={.6} fill={GOLD} {...S}/><rect x={10.8} y={2} width={3.2} height={12} rx={.6} fill={GRASS} {...S}/></>,
};
export function FactIcon({kind,size=22}:{kind:FactIconKind;size?:number}){
 const own=DRAW[kind];
 if(!own)return <ToolIcon kind={kind as ToolIconKind} size={size}/>;
 return <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false" data-fact-icon={kind}>{own}</svg>;
}
