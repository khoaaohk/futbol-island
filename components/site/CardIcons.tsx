import type {DeckIcon} from '@/lib/site/ruleDeck';
/**
 * One flat line icon per deck card (cards page, Nov 16 2026; the rule pages' decks from the same day, lib/site/rulePlay.ts),
 * drawn on a 48 grid in currentColor so it takes the card's ink. Decorative: the offence name beside it carries the meaning, so every icon is aria-hidden.
 */
const P:Record<DeckIcon,React.ReactNode>={
 /* a player diving: tipping over with no one near, motion lines behind (unsporting behavior: simulation is the kids' example) */
 dive:<><circle cx="33" cy="11" r="4"/><path d="M30 16 19 29M27 20l9 4M24 23l-6-7M19 29l-10-2M19 29l-4 10"/><path d="M38 20c3 2 4 5 4 8M41 15c4 3 6 8 5 13" opacity=".55"/><path d="M6 43h28"/><circle cx="40" cy="39" r="4"/></>,
 talk:<><path d="M8 10h32v20H22l-9 8v-8H8Z"/><path d="M24 15v7M24 26v.5"/></>,
 repeat:<><path d="M12 20a12 12 0 0 1 22-5l2 3"/><path d="M36 10v8h-8"/><path d="M36 28a12 12 0 0 1-22 5l-2-3"/><path d="M12 38v-8h8"/></>,
 clock:<><circle cx="24" cy="26" r="14"/><path d="M24 18v8l6 4M19 6h10M24 6v6"/></>,
 distance:<><path d="M6 24h36M12 17l-6 7 6 7M36 17l6 7-6 7"/><path d="M6 10v6M42 10v6"/></>,
 enter:<><path d="M26 8h12v32H26"/><path d="M8 24h20M21 17l7 7-7 7"/></>,
 leave:<><path d="M22 8H10v32h12"/><path d="M20 24h20M33 17l7 7-7 7"/></>,
 studs:<><path d="M6 32V14h12l2 6c6 0 14 2 20 5 3 1 4 3 4 5v2Z"/><path d="M10 32v6M18 32v6M26 32v6M34 32v6"/><path d="M18 14v6"/></>,
 fist:<><path d="M14 20v-6a3 3 0 0 1 6 0v6M20 18v-6a3 3 0 0 1 6 0v6M26 18v-4a3 3 0 0 1 6 0v8"/><path d="M14 20c-3 0-5 2-5 5 0 8 5 13 13 13h3c6 0 10-5 10-11v-5"/><path d="M14 24h8"/></>,
 spit:<><path d="M24 8c6 9 10 15 10 20a10 10 0 0 1-20 0c0-5 4-11 10-20Z"/><path d="M38 12l4-2M40 20h4"/></>,
 hand:<><path d="M16 26V12a3 3 0 0 1 6 0v10M22 22V9a3 3 0 0 1 6 0v13M28 22v-10a3 3 0 0 1 6 0v14M16 24l-4-4a3 3 0 0 0-4 4l8 10c3 4 6 6 11 6h1c6 0 10-5 10-11v-3"/></>,
 goal:<><path d="M6 38V14h36v24"/><path d="M6 22h36M6 30h36M18 14v24M30 14v24" opacity=".45"/><path d="M24 44v-4"/></>,
 mouth:<><path d="M8 10h32v20H22l-9 8v-8H8Z"/><path d="M15 17l3 3-3 3M22 16v8M29 17l4 6M33 17l-4 6"/></>,
 twoCards:<><rect x="8" y="10" width="18" height="26" rx="2" transform="rotate(-10 17 23)"/><rect x="22" y="12" width="18" height="26" rx="2" transform="rotate(8 31 25)"/></>,
 /* ---- the rule pages' decks (back-pass, throw-in, handball, fouls) ---- */
 /* a thrower, the ball held in both hands over the head */
 throw:<><circle cx="24" cy="8" r="5"/><circle cx="24" cy="20" r="3.5"/><path d="M19.5 10 16 18l4 7M28.5 10l3.5 8-4 7M24 24v11M24 35l-6 8M24 35l6 8M6 44h36"/></>,
 /* a head meeting the ball */
 head:<><circle cx="20" cy="27" r="8"/><path d="M8 44c2-5 7-8 12-8s10 3 12 8"/><circle cx="35" cy="12" r="6"/><path d="M29 17l-2 2" opacity=".55"/></>,
 /* a ball whose path bends off a foot */
 deflect:<><path d="M6 40 22 24l16 4"/><path d="M33 23l5 5-6 3"/><path d="M14 18h8v6" opacity=".55"/><circle cx="40" cy="12" r="4"/></>,
 /* a foot flicking the ball up in an arc */
 trick:<><path d="M6 42h13l5-5"/><path d="M22 34c2-12 8-20 16-22"/><path d="M33 8l5 4-4 5"/><circle cx="12" cy="14" r="5"/><path d="M12 22v6" opacity=".55"/></>,
 /* the referee's whistle */
 whistle:<><circle cx="20" cy="30" r="10"/><path d="M20 20h22v8H29"/><circle cx="20" cy="30" r="3"/><path d="M28 12l3-5M36 14l4-3M20 13V7" opacity=".7"/></>,
 /* two footprints on the touchline */
 feet:<><path d="M4 30h40"/><path d="M15 16c-3 0-5 5-5 10s2 14 5 14 5-6 5-11-2-13-5-13Z"/><path d="M33 12c-3 0-5 5-5 10s2 14 5 14 5-6 5-11-2-13-5-13Z"/></>,
 /* a marker on the line: the spot where the ball went out */
 spot:<><path d="M6 40h36"/><path d="M24 35c-6-7-9-11-9-16a9 9 0 0 1 18 0c0 5-3 9-9 16Z"/><circle cx="24" cy="19" r="3"/></>,
 cross:<><circle cx="24" cy="24" r="16"/><path d="M17.5 17.5l13 13M30.5 17.5l-13 13"/></>,
 /* an assistant referee's flag */
 flag:<><path d="M14 44V5"/><path d="M14 7h24l-6 7 6 7H14"/></>,
 /* a player with both arms stretched wide, the ball at one hand */
 bigger:<><circle cx="24" cy="9" r="4"/><path d="M24 14v16M24 30l-6 13M24 30l6 13M5 15l19 3 19-3"/><circle cx="41" cy="26" r="4"/></>,
 /* a pass from one teammate to another */
 pass:<><circle cx="9" cy="16" r="4"/><circle cx="39" cy="16" r="4"/><path d="M9 21v10M39 21v10"/><path d="M14 38h20M29 33l5 5-5 5"/></>,
 /* shoulders, the armpit line, the ball on the shoulder */
 shoulder:<><circle cx="24" cy="9" r="5"/><path d="M11 44V25c0-6 5-9 13-9s13 3 13 9v19"/><path d="M8 29h10M30 29h10" opacity=".55"/><circle cx="40" cy="14" r="4"/></>,
 /* a player with arms close to the body */
 close:<><circle cx="24" cy="8" r="4"/><path d="M24 13v18M24 31l-5 12M24 31l5 12M24 16l-5 3-1 11M24 16l5 3 1 11"/><circle cx="37" cy="24" r="4"/></>,
 /* a goalkeeper's glove */
 gloves:<><path d="M14 30V13a3 3 0 0 1 6 0v9V10a3 3 0 0 1 6 0v12V12a3 3 0 0 1 6 0v12l2-3a3 3 0 0 1 5 3l-5 10c-2 3-5 4-9 4h-3c-5 0-8-3-8-8Z"/><path d="M14 38h20v6H14Z"/></>,
 /* a sliding leg catching the other player's foot */
 trip:<><circle cx="32" cy="9" r="4"/><path d="M31 14l-5 12 10 4M26 26l-6 9"/><path d="M4 42l10-4 10 2"/><path d="M40 38l4 4" opacity=".55"/></>,
 /* a shirt being pulled */
 hold:<><path d="M17 8 7 14l4 8 4-2v20h18V20l4 2 4-8-10-6c-1 3-4 5-7 5s-6-2-7-5Z"/><path d="M33 28h10M33 33h8" opacity=".7"/></>,
 /* a high foot near a head */
 highFoot:<><circle cx="37" cy="11" r="5"/><path d="M37 17v14M37 31l-3 12"/><path d="M6 44l6-18M12 26l16-10"/><path d="M28 16l2-1" opacity=".55"/></>,
 /* a player standing in the way of a run, no contact */
 block:<><circle cx="34" cy="9" r="4"/><path d="M34 14v15M34 29l-5 13M34 29l5 13M26 19h16"/><path d="M4 26h16M15 21l5 5-5 5"/></>,
};
export default function CardIconSvg({icon,className}:{icon:DeckIcon;className?:string}){
 return <svg className={className} viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{P[icon]}</svg>;
}
