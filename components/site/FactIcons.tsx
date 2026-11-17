/**
 * The key-facts icons on the guide and tool pages (visual pass, Nov 17 2026: "break each section up"). Drawn in the energy bar's
 * language (components/FuelCount.tsx FuelIcon) like the tool cards' icons (./tools/ToolIcons.tsx, reused here for the shirt,
 * the stopwatch, the pitch and the whistle): a 16x16 grid, chunky warm fills, the brown outline #7a4e12 at 1.4, round joins.
 * Decorative only (aria-hidden): the fact's own words say what it is.
 */
import type {ReactNode} from 'react';
import {ToolIcon,type ToolIconKind} from './tools/ToolIcons';

const O='#7a4e12',GOLD='#f2b632',PAPER='#fffaf0',RED='#e0533d',GRASS='#7cc36a',SKY='#5bb6d9';
const S={stroke:O,strokeWidth:1.4,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};
export type FactIconKind=ToolIconKind|'law'|'cards'|'quiz'|'tag'|'link'|'steps'|'deck'|'lock'|'share';

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
};
export function FactIcon({kind,size=22}:{kind:FactIconKind;size?:number}){
 const own=DRAW[kind];
 if(!own)return <ToolIcon kind={kind as ToolIconKind} size={size}/>;
 return <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false" data-fact-icon={kind}>{own}</svg>;
}
