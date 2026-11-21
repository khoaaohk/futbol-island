/** The Library's address (lib/site/library.ts has the page's data; this file has no imports, for the nav and the sitemap). */
export const LIBRARY_PATH='/library';
/** Owner, Nov 20 2026, approved "breadcrumbs through the Library" (docs/seo/NEW-LAYOUT-SEO-PLAN-2026-11-20.md, item 7): every
 *  section the Library houses reads Home › Library › <section> › <page>, visible trail and BreadcrumbList alike (the same array).
 *  Spanish: esLibCrumbs (components/es/EsParts.tsx), Inicio › Biblioteca › … */
export const LIBRARY_CRUMB={name:'Library',path:LIBRARY_PATH} as const;
export const libraryCrumbs=(...tail:{name:string;path:string}[])=>[{name:'Home',path:'/'},LIBRARY_CRUMB,...tail];
