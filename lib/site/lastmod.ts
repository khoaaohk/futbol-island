import generated from './lastmodData.generated';
import {toEn} from '../i18n/esPaths';
/**
 * The ONE date of a page's last real change (SEO foundation, Nov 20 2026). Before, three dates disagreed: the sitemap said
 * Nov 17 or 18 (scripts/gen-lastmod.cjs), JSON-LD dateModified said Nov 8, 10 or 14 (the hand-kept section dates in
 * lib/site/updated.ts) and the page showed its fact-check date. Now sitemap <lastmod> (lib/site/paths.ts), JSON-LD
 * dateModified (the builders in lib/site/seo.ts, learningLd.ts, games.ts, tools/registry.ts, books.ts) and the visible
 * "Last updated" line (lib/site/GuideParts.tsx UpdatedLine) all call pageModified(), which reads
 * lib/site/lastmod.generated.json: the date of the last commit that touched the page's route or its data. No build clock.
 * The visible "Last checked" date is a different fact (when the sources were last read) and keeps its own label.
 * A Spanish page (/es/...) shares its English page's date. `fallback` is the section's hand-kept date, for a path the
 * generated file does not list (a noindex page, or a page added since the file was last written).
 */
const LASTMOD=generated as Record<string,string>;
export function pageModified(path:string,fallback:string):string{
 const en=path.startsWith('/es')?toEn(path)??path:path;
 return LASTMOD[en]??LASTMOD[path]??fallback;
}
/** datePublished can never be after dateModified. */
export const publishedBefore=(published:string,modified:string)=>published>modified?modified:published;
