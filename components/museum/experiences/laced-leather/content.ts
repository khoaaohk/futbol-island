import {LEATHER,LEATHER_GAIN,LEATHER_GAIN_PCT,OPENING} from './facts';
/**
 * laced-leather · the words for the weather machine (Oct 12 2026 anatomy restyle; written for the Oct 10 game). The case's facts come from the exhibit
 * (word for word); every number and source is in facts.ts.
 */
export const BEATS=[
 {when:'Long ago',head:'A rainy Saturday',text:OPENING},
 {when:'The lab, 2023',head:'90 minutes in water',text:`Scientists soaked a copy of the ${LEATHER.ballYear} leather World Cup ball for ${LEATHER.soakMinutes} minutes. It went from ${LEATHER.dry} g to ${LEATHER.wet} g: ${LEATHER_GAIN} g of water, ${LEATHER_GAIN_PCT}% heavier.`},
 {when:'Your turn',head:'Make it rain, then play',text:'Work the weather machine, then play a whole match in the rain. Feel the ball get heavy.'},
] as const;
export const PRACTICE_NOTE='The rain match is a practice game: the kick is worked out from the ball’s weight (a heavier ball leaves the foot slower), without air or spin. The weights are the lab’s.';
export const BEST_KEY='futbol.museum.laced-leather.rainMatchBest';
