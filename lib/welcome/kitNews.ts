/**
 * Kit Shop news for the Welcome back note (Nov 14 2026, docs/welcome-suggestions.md): new things in the shop, newest first. A
 * player whose last Kit Shop visit (the tally's kit day) is before an item's day sees its line once it is their best hook
 * ("new since last visit"). Add a row when the shop gets something new; keep the line short and say what the tap does.
 */
export type KitNews={id:string;day:string;line:string};
export const KIT_SHOP_NEWS:readonly KitNews[]=[
 {id:'boot-stickers',day:'2026-11-01',line:'New boot stickers in the Kit Shop! Tap to design your boots'},
];
/** Day number of a YYYY-MM-DD string (local, the same scale as tally.ts dayNumber). */
export const newsDay=(day:string)=>{const [y,m,d]=day.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/864e5);};
/** The newest item a player has not seen: only for players who have been to the shop before (lastVisit > 0). */
export function kitNewsFor(lastVisit:number,today:number):KitNews|null{
 if(!lastVisit)return null;
 return KIT_SHOP_NEWS.find(n=>{const d=newsDay(n.day);return d>lastVisit&&d<=today;})??null;
}
