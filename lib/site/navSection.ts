/**
 * Which header link a page belongs to (Nov 20 2026, owner: "library will go to all the other items"): Games for /games and its
 * pages, Library for every section the Library houses (rules, terms, drills, positions, formations, lessons, tools, plans, videos,
 * cards, fish, museum, books, age groups and their pages, English and Spanish), none otherwise (About, safety, privacy). Read from
 * the page's breadcrumb trail, so it needs no client code: Breadcrumbs / EsBreadcrumbs write it as data-nav-section and
 * site.module.css lights that header link with the pink chip. Island is the home page's own bar (app/(site)/page.tsx).
 */
const LIB_BASES=['/library','/learn','/tools','/videos','/cards','/fish','/exhibits','/books'];
const under=(p:string,b:string)=>p===b||p.startsWith(b+'/');
export function navSection(paths:readonly string[]):'games'|'library'|undefined{
 const ps=paths.map(p=>p.replace(/^\/es(?=\/|$)/,'')||'/');
 if(ps.some(p=>under(p,'/games')))return 'games';
 if(ps.some(p=>LIB_BASES.some(b=>under(p,b))))return 'library';
 return undefined;
}
