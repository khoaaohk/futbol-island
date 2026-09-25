/**
 * Card binder layout for "Collect cards" (pure, no imports, so tests/card-collection.cjs can run it directly).
 *
 * The binder is an explicit LAYOUT: an ordered array of pages, each a sleeve of 9 slots holding a card name or null.
 * Rendering reads only from the layout. The default layout orders cards by position, then card number, and starts each
 * position on a new page. Section divider tabs are derived from the layout (sectionsOf), so they keep working once
 * cards can be rearranged.
 *
 * Later (not built yet): a per-viewer custom layout saved under `fi2-binder-layout-v1` as {version, pages}, and a
 * small `moveCard(layout, from:{page,slot}, to:{page,slot})` next to buildBinder below (swap the two slots, return a
 * new layout); pockets are keyed by slot index, so drag-and-drop between slots and pages drops straight in.
 */
export type BinderEntry={name:string;number:number;role:string};
/** One sleeve sheet: the divider section it sits under, and its 9 slots (card name or empty). */
export type BinderPage={role:string;slots:(string|null)[]};
export type BinderLayout={version:1;pages:BinderPage[]};
export type BinderSection={role:string;start:number;pages:number;cards:string[]};
export const PER_PAGE=9;

/** The default layout: position by position (in `roles` order), card number order, a new page per position. */
export function buildBinder(entries:BinderEntry[],roles:string[],perPage=PER_PAGE):BinderLayout{
 const pages:BinderPage[]=[];
 for(const role of roles){
  const cards=entries.filter(entry=>entry.role===role).sort((a,b)=>a.number-b.number).map(entry=>entry.name);
  for(let i=0;i<cards.length;i+=perPage){const slots:(string|null)[]=cards.slice(i,i+perPage);while(slots.length<perPage)slots.push(null);pages.push({role,slots});}
 }
 return {version:1,pages};
}
// moveCard(layout, from, to) goes here when rearranging is built.

/** Divider sections found from the layout: each section's first page, page count and the cards on its pages. */
export function sectionsOf(pages:BinderPage[]):BinderSection[]{
 const sections:BinderSection[]=[];
 pages.forEach((page,i)=>{const last=sections[sections.length-1];
  if(last&&last.role===page.role){last.pages++;last.cards.push(...page.slots.filter((s):s is string=>!!s));}
  else sections.push({role:page.role,start:i,pages:1,cards:page.slots.filter((s):s is string=>!!s)});});
 return sections;
}
/** The first page shown for `page`: a two-page spread always opens on an even page (left), a single page on itself. */
export const viewStart=(page:number,spread:boolean)=>spread?page-(page%2):page;
/** The page holding `name`, or -1. */
export const pageOf=(pages:BinderPage[],name:string)=>pages.findIndex(page=>page.slots.includes(name));
/** The section a page belongs to. */
export const sectionOf=(sections:BinderSection[],page:number)=>sections.find(section=>page>=section.start&&page<section.start+section.pages);
