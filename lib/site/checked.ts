import DATES from './contentDates.json';
/**
 * "Last checked" (SEO content pass, Nov 15 2026): the date a page's facts were last checked against their sources, shown on the
 * guide, card and fish pages next to a link to /how-we-check-facts. Driven by data, never by the build clock:
 *  - a card or fish uses its own `checked` date (lib/site/cardNotes.json, fishNotes.json) where it has one;
 *  - otherwise the family date in lib/site/contentDates.json (scripts/content-dates.cjs: the check date the data file states in
 *    its SOURCES comment, else that file's last commit date).
 */
export const FACTS_PATH='/about/how-we-check-facts';
export type CheckedFamily=keyof typeof DATES.families;
export const FAMILY_CHECKED:Record<CheckedFamily,string>=Object.fromEntries(Object.entries(DATES.families).map(([k,v])=>[k,v.date])) as Record<CheckedFamily,string>;
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
/** 2026-11-15 -> November 15, 2026 (no Date object: no time zone can shift the day). */
export function longDate(iso:string):string{
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);if(!m)throw new Error(`not an ISO date: ${iso}`);
 return `${MONTHS[Number(m[2])-1]} ${Number(m[3])}, ${m[1]}`;
}
/** A per-entry date wins when it is a real ISO date; else the family's. */
export const checkedOn=(family:CheckedFamily,own?:string)=>own&&/^\d{4}-\d{2}-\d{2}$/.test(own)?own:FAMILY_CHECKED[family];
