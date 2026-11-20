import {GUIDE_FORMATS,PLAYERS_PER_TEAM} from '@/lib/site/pitch';
import {abs} from '@/lib/site/seo';
import {gameLengths,LINEUP_PAGES,PLANNER_PAGES,type LineupPage,type PlannerPage} from './registry';
/**
 * Club embeds (seo-extras, Nov 15 2026): every lineup builder and playing-time page has a framable twin at /embed/<slug>
 * (app/embed/[tool]). The planner's presets and starting numbers are the tool page's own (app/(site)/tools/[slug]/page.tsx).
 */
export const EMBED_DIR='/embed';
export const embedPath=(slug:string)=>`${EMBED_DIR}/${slug}`;
export type EmbedTool=LineupPage|PlannerPage;
export const EMBED_TOOLS:readonly EmbedTool[]=[...LINEUP_PAGES,...PLANNER_PAGES];
export const embedTool=(slug:string)=>EMBED_TOOLS.find(t=>t.slug===slug);
export const EMBED_HEIGHT:Record<EmbedTool['kind'],number>={lineup:900,planner:980};
/** The copy-paste snippet a club puts on its own site. Nov 20 2026 (SEO foundation): under the iframe, one visible, plain credit
 *  line that links to the tool's own page (the brand name as the anchor, nothing hidden, no rel tricks). The club can delete it.
 *  The credit inside the frame stays as it was. */
export const embedSnippet=(t:EmbedTool)=>`<iframe src="${abs(embedPath(t.slug))}" title="${t.h1[0].toUpperCase()+t.h1.slice(1)} (Futbol Island)" width="100%" height="${EMBED_HEIGHT[t.kind]}" style="border:0;max-width:760px" loading="lazy" referrerpolicy="strict-origin"></iframe>\n<p style="font:14px sans-serif;margin:8px 0 0"><a href="${abs(t.path)}">Made with Futbol Island</a></p>`;
export function plannerSetup(p:PlannerPage){
 const format=p.format??'7v7',g=gameLengths(format)[0];
 const presets=GUIDE_FORMATS.filter(f=>f!=='futsal').flatMap(f=>gameLengths(f).map(x=>({id:`${f}-${x.periods}x${x.periodMin}`,label:`${f} · ${x.ages} · ${x.label}`,onField:PLAYERS_PER_TEAM[f],periods:x.periods,periodMin:x.periodMin})));
 const initial={players:!p.format?11:format==='9v9'?12:10,onField:PLAYERS_PER_TEAM[format],periods:g?.periods??2,periodMin:g?.periodMin??25,subEvery:format==='9v9'?10:5,keeperRotates:true,names:[] as string[],team:''};
 return {presets,initial};
}
