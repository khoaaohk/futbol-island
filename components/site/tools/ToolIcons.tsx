/**
 * The tools hub's card icons (Nov 16 2026, owner: "make each app more visual ... simple icons ... similar to the energy bar
 * icons"). Drawn in the fuel bolt's language (components/FuelCount.tsx FuelIcon): a 16x16 grid, chunky filled shapes, the brown
 * outline #7a4e12 at 1.4, round joins (smooth edges: the curves blur in crispEdges at card size), warm fills from the island palette. Decorative only (aria-hidden): the card's
 * text names the tool. toolIconFor() picks the icon (and the format badge) from a tool's English or Spanish path.
 */
import type {ReactNode} from 'react';

const O='#7a4e12',GOLD='#f2b632',GRASS='#7cc36a',LINE='#effbe2',COURT='#e9a35a',CONE='#f07a3a',PAPER='#fffaf0',SKY='#5bb6d9',LEAF='#3f8f4f';
const S={stroke:O,strokeWidth:1.4,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};
export type ToolIconKind='lineup'|'court'|'clock'|'rotation'|'diagram'|'blank'|'cheat'|'shirt'|'scan'|'whistle';
export type GameBadge='7v7'|'9v9'|'11v11'|'futsal';

const dots=(pts:readonly [number,number][])=>pts.map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r={1.35} fill={GOLD} stroke={O} strokeWidth={.9}/>);
const field=(fill:string)=><><rect x={1.5} y={3} width={13} height={10} rx={1} fill={fill} {...S}/><path d="M8 3.7v8.6" stroke={LINE} strokeWidth={.9}/><circle cx={8} cy={8} r={1.7} fill="none" stroke={LINE} strokeWidth={.9}/></>;
const sheet=<><path d="M3 1.5h7.5l3 3v10H3Z" fill={PAPER} {...S}/><path d="M10.5 1.7v2.8h2.8" fill="none" stroke={O} strokeWidth={1}/></>;

const DRAW:Record<ToolIconKind,ReactNode>={
 /* a pitch with players on it */
 lineup:<>{field(GRASS)}{dots([[4.4,5.9],[4.4,10.1],[11.6,5.9],[11.6,10.1]])}</>,
 /* the futsal court: wood floor, the two goal arcs */
 court:<>{field(COURT)}<path d="M1.9 5.8a2.2 2.2 0 0 1 0 4.4M14.1 5.8a2.2 2.2 0 0 0 0 4.4" fill="none" stroke={LINE} strokeWidth={.9}/>{dots([[5,6],[5,10],[11,8]])}</>,
 /* a stopwatch face with the swap arrows of a substitution */
 clock:<><circle cx={6.5} cy={9.3} r={5.2} fill={GOLD} {...S}/><path d="M6.5 6.4v3h2.4" fill="none" stroke={O} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M10.8 2.2h3.7M13.2 .9l1.3 1.3-1.3 1.3M14.5 5.4h-3.7M12.1 4.1l-1.3 1.3 1.3 1.3" fill="none" stroke={O} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"/></>,
 /* players coming round: two arrows in a circle around a player */
 rotation:<><path d="M2.9 8.6A5.2 5.2 0 0 1 11.2 3.9M13.1 7.4A5.2 5.2 0 0 1 4.8 12.1" fill="none" stroke={O} strokeWidth={4} strokeLinecap="round"/>
  <path d="M2.9 8.6A5.2 5.2 0 0 1 11.2 3.9M13.1 7.4A5.2 5.2 0 0 1 4.8 12.1" fill="none" stroke={GOLD} strokeWidth={1.8} strokeLinecap="round"/>
  <path d="M10 1.8l4 .9-1.6 3.6ZM6 14.2l-4-.9 1.6-3.6Z" fill={GOLD} {...S}/><circle cx={8} cy={8} r={1.7} fill={GRASS} stroke={O} strokeWidth={1}/></>,
 /* a training diagram: cones and a run */
 diagram:<>{field(GRASS)}<path d="M6.6 9.6C7.8 6.8 9.6 6 11.6 6" fill="none" stroke={LINE} strokeWidth={1.2} strokeDasharray="1.4 1.1"/><path d="M10.6 4.8l1.6 1.2-1.6 1.3" fill="none" stroke={LINE} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3 11.6 4.6 8.4l1.6 3.2Z" fill={CONE} stroke={O} strokeWidth={1} strokeLinejoin="round"/></>,
 /* a sheet with an empty field on it */
 blank:<>{sheet}<rect x={5} y={6.2} width={6.2} height={6.6} fill="#d6efc5" stroke={LEAF} strokeWidth={1}/><path d="M5 9.5h6.2" stroke={LEAF} strokeWidth={1}/></>,
 /* a sheet of notes */
 cheat:<>{sheet}<path d="M5.2 6.4h4.6M5.2 8.9h5.6M5.2 11.4h3.4" stroke={O} strokeWidth={1.1} strokeLinecap="round"/><circle cx={11.2} cy={11.6} r={1.2} fill={GOLD} stroke={O} strokeWidth={.9}/></>,
 /* a shirt with its number patch */
 shirt:<><path d="M5.2 1.8 2 3.6l-.8 3.6 2.4.6.4 6.7h8l.4-6.7 2.4-.6-.8-3.6-3.2-1.8C10.4 3 9.3 3.6 8 3.6S5.6 3 5.2 1.8Z" fill={GOLD} {...S}/><rect x={6.4} y={7} width={3.2} height={4.4} rx={.5} fill={PAPER} stroke={O} strokeWidth={.9}/></>,
 /* an eye with the turn of the head over the shoulder */
 scan:<><path d="M3.4 4.6C5.4 1.9 10.6 1.9 12.6 4.6" fill="none" stroke={O} strokeWidth={1.4} strokeLinecap="round"/><path d="M13.1 2.1l-.4 2.7-2.6-.6" fill="none" stroke={O} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M1.2 10.2C3 7.4 5.4 6.2 8 6.2s5 1.2 6.8 4C13 13 10.6 14.2 8 14.2S3 13 1.2 10.2Z" fill={PAPER} {...S}/><circle cx={8} cy={10.2} r={2.5} fill={SKY} stroke={O} strokeWidth={1}/><circle cx={8} cy={10.2} r={.9} fill={O}/></>,
 /* the coach's whistle */
 whistle:<><path d="M2 9a4 4 0 1 0 8 0 4 4 0 0 0-.9-2.5h5.4V3.6H6A4 4 0 0 0 2 9Z" fill={GOLD} {...S}/><circle cx={6} cy={9} r={1.3} fill={O}/></>,
};

export function ToolIcon({kind,size=32}:{kind:ToolIconKind;size?:number}){
 return <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false" data-tool-icon={kind}>{DRAW[kind]}</svg>;
}

/** The icon and the format badge for a tool page, by path (/tools/... or /es/tools/...). */
export function toolIconFor(path:string):{kind:ToolIconKind;badge?:GameBadge}{
 const p=path.replace(/^\/es(?=\/)/,''),f=/(^|[/-])(7v7|9v9|11v11|futsal)(?=-)/.exec(p.split('/').pop()??'')?.[2] as GameBadge|undefined;
 if(p.startsWith('/coach'))return {kind:'whistle'};
 if(/scanning-trainer/.test(p))return {kind:'scan'};
 if(/-lineup-builder$/.test(p))return {kind:f==='futsal'?'court':'lineup',badge:f};
 if(/playing-time-calculator$/.test(p))return {kind:'clock'};
 if(/substitution-rotation$/.test(p))return {kind:'rotation',badge:f};
 if(/positions-and-numbers$/.test(p))return {kind:'shirt',badge:'11v11'};
 if(/cheat-sheet$/.test(p))return {kind:'cheat',badge:f};
 if(/\/blank-/.test(p))return {kind:'blank',badge:f};
 if(/soccer-match-timer$/.test(p))return {kind:'clock'};/* Nov 22 2026: the game-day and practice tools */
 if(/tournament-schedule-maker$/.test(p))return {kind:'rotation'};
 if(/soccer-beep-test$/.test(p))return {kind:'whistle'};
 return {kind:'diagram'};
}
