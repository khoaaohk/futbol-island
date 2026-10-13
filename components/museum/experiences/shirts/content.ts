import {EXTRA_FACTS} from './data';
/**
 * shirts · the words for the kit-room game (Oct 12 2026 anatomy restyle; written for the Oct 10 game). The case's own facts are read from the exhibit and
 * shown word for word; the extra facts and every source stay in data.ts and eras.ts (unchanged, verified).
 */
export const BEATS=[
 {when:'25 August 1928',head:'Numbers on the back',text:EXTRA_FACTS.firstDay},
 {when:'The 2-3-5',head:'Count from the keeper',text:EXTRA_FACTS.shape},
 {when:'Law 4',head:'Colours that never clash',text:EXTRA_FACTS.lawWords},
] as const;
export const CHECK={q:'Law 4: what colour must each goalkeeper wear?',options:['The same colour as their team','A colour of their own, different from everyone','Always black'],right:1,
 why:'Each keeper wears a colour of their own, different from both teams, the referee and the other keeper.'} as const;
export const PRACTICE_NOTE='The kit room is a practice game: the clock, the points and the dye vats are made up. The numbers, the line-up and the Law are real.';
export const BEST_KEY='futbol.museum.shirts.rushBest';
