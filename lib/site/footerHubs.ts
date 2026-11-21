/**
 * The footer's link row (app/(site)/layout.tsx), plain data with no imports. Nov 20 2026 (owner): the Library at /library
 * (lib/site/library.ts) houses these same items as cards, so the list lives here once; a link added to the footer must get
 * its card words in library.ts (it throws at build when one is missing, and tests/library.cjs checks it).
 */
export const FOOTER_HUBS:readonly (readonly [string,string])[]=[['/learn/lessons','Lessons'],['/learn/soccer-drills','Drills'],['/learn/soccer-practice-plans','Practice plans'],
 ['/learn/soccer-formations','Formations'],['/learn/soccer-positions','Positions'],['/learn/soccer-rules','Rules'],['/learn/soccer-terms','Soccer terms'],
 ['/learn/soccer-age-groups','Age groups'],['/tools','Coach tools'],['/games','Games'],['/videos','Videos'],['/cards','Player cards'],['/fish','Fishbook'],['/exhibits','Museum'],['/books','Story books']];
