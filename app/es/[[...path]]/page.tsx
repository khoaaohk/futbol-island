import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {esRoute} from '@/components/es/routes';
/**
 * Every Spanish page (Spanish round 1, Nov 15 2026; docs/i18n/HANDOFF.md): /es + the English path, one dispatcher
 * (components/es/routes.tsx). BUILD COST: nothing is prerendered here (generateStaticParams returns []), each page renders on
 * its first request and is then cached like a static page (ISR, no revalidate timer: a deploy refreshes it). The Vercel build
 * only just fits 8 GB (next.config.mjs), so the Spanish pages must not add prerender work; tests/es-pages.cjs guards this.
 */
export const dynamicParams=true;
export const revalidate=false;
export const generateStaticParams=()=>[] as {path?:string[]}[];
const pathOf=(p?:string[])=>'/'+(p??[]).join('/');
export function generateMetadata({params}:{params:{path?:string[]}}):Metadata{
 const r=esRoute(pathOf(params.path));return r?r.meta():{};
}
export default function EsPage({params}:{params:{path?:string[]}}){
 const r=esRoute(pathOf(params.path));if(!r)notFound();
 return r.render();
}
