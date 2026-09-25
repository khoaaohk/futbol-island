import careers from './playerCareers.json';

/** Senior club history for each player card's "History" tab (lib/town/playerCareers.json).
 * Built from Wikipedia infoboxes (clubsN/yearsN, nationalteamN/nationalyearsN) as of Sep 2026.
 * `to: null` means the player is still at that club. A `national` entry without years means the source names the
 * team but not the years. `source: 'missing'` means no sourced club history was found (clubs is empty). */
export type CareerClub={club:string;from:number;to:number|null;loan?:boolean};
export type CareerNational={team:string;from?:number;to?:number|null};
export type PlayerCareer={clubs:CareerClub[];national?:CareerNational;source:string;checked:string};

const CAREERS=careers as Record<string,PlayerCareer>;

/** The career entry for a card name (the same keys as iconicPlays.json / cardRoster.json), or null. */
export function careerFor(name:string):PlayerCareer|null{
 return Object.prototype.hasOwnProperty.call(CAREERS,name)?CAREERS[name]:null;
}
