import {FORMATIONS,FORMATIONS_HUB,FORMAT_GUIDES} from './formations';
import {POSITIONS,POSITIONS_HUB} from './positions';
import {LESSONS_INDEX} from './lessons';
import {RULES,RULES_HUB} from './rules';
import {CHARTS} from './sizes';
import {TERM_PAGES,TERMS_HUB} from './terms';
/**
 * The guide clusters (SEO, Nov 10 2026): evergreen reading pages that answer what parents and coaches search for
 * ("7v7 soccer formations", "what does a center mid do"), each leading into the free lessons. One registry for all of them,
 * so the sitemap (lib/site/paths.ts), llms.txt (lib/site/llms.ts), the home page's reading links, the hubs' "More to learn"
 * list and the lesson pages' "Related guides" stay in step with no hand-kept lists.
 *
 * TO ADD A CLUSTER (rules, glossary, size charts …), copy the formations/positions pattern:
 *  1. Data: lib/site/<cluster>.ts holds every word as typed data, with a source list in the top comment, lesson ids checked
 *     with lessonById (throw on a wrong id) and each page's own `title` (<= 60), `desc` (120-155), `h1`, `faq`, `path`.
 *  2. Routes: app/(site)/learn/<hub-slug>/page.tsx and app/(site)/learn/<hub-slug>/[slug]/page.tsx, both `force-static`
 *     (+ `dynamicParams=false` and `generateStaticParams` on the dynamic one), metadata from pageMeta(), JSON-LD from
 *     breadcrumbLd + faqLd + articleLd (detail) or collectionLd (hub), sections from lib/site/GuideParts.tsx, classes from
 *     app/(site)/site.module.css only.
 *  3. Register the pages in GUIDE_PAGES below (hub: true for hub-level pages). That alone puts them in the sitemap, llms.txt,
 *     the home page links and "More to learn", and lets lessons link back through `lessons`.
 *  4. A single-segment /learn/<slug> page must be added to the exclusion list of the old-lesson redirect in next.config.mjs,
 *     or it is redirected to /learn/lessons/<slug> (tests/seo-formations-positions.cjs checks this).
 *  5. Tests: add the cluster's paths to tests/seo-formations-positions.cjs (or copy it): sitemap, unique title and
 *     description within length, one h1, JSON-LD that parses, internal links that exist.
 * Cluster 2 (rules, size charts, glossary) is registered in REFERENCE_PAGES below and tested by tests/seo-rules-terms-sizes.cjs.
 */
export type GuidePage={path:string;name:string;title:string;description:string;blurb?:string;hub?:boolean;lessonIds:string[];image?:string};
/** The picture of a page: a PNG drawn from the same data as the inline SVG (app/(site)/learn/diagrams/[file]/route.tsx). */
export const DIAGRAM_DIR='/learn/diagrams';
export const formationImage=(slug:string)=>`${DIAGRAM_DIR}/${slug}-formation.png`;
export const positionImage=(slug:string)=>`${DIAGRAM_DIR}/${slug}-position.png`;
export const DIAGRAM_FILES:readonly string[]=[...FORMATIONS.map(f=>`${f.slug}-formation.png`),...POSITIONS.map(p=>`${p.slug}-position.png`)];
const FEATURED:Record<string,string>={'7v7':'7v7-2-3-1','9v9':'9v9-3-2-3','11v11':'11v11-4-3-3'};
export const GUIDE_PAGES:readonly GuidePage[]=[
 {path:FORMATIONS_HUB.path,name:FORMATIONS_HUB.h1,title:FORMATIONS_HUB.title,description:FORMATIONS_HUB.description,blurb:FORMATIONS_HUB.blurb,hub:true,lessonIds:FORMATIONS_HUB.lessons.map(l=>l.id),image:formationImage('11v11-4-3-3')},
 ...FORMAT_GUIDES.map(g=>({path:g.path,name:g.h1,title:g.title,description:g.description,blurb:g.blurb,hub:true,lessonIds:g.lessons.map(l=>l.id),image:formationImage(FEATURED[g.format])})),
 {path:POSITIONS_HUB.path,name:POSITIONS_HUB.h1,title:POSITIONS_HUB.title,description:POSITIONS_HUB.description,blurb:POSITIONS_HUB.blurb,hub:true,lessonIds:POSITIONS_HUB.lessons.map(l=>l.id),image:formationImage('11v11-4-3-3')},
 ...FORMATIONS.map(f=>({path:f.path,name:f.h1,title:f.title,description:f.desc,lessonIds:f.lessons.map(l=>l.id),image:formationImage(f.slug)})),
 ...POSITIONS.map(p=>({path:p.path,name:p.h1,title:p.title,description:p.desc,lessonIds:p.lessons.map(l=>l.id),image:positionImage(p.slug)})),
];
/**
 * Cluster 2 (Nov 10 2026): rules (lib/site/rules.ts), size charts (lib/site/sizes.ts) and the glossary (lib/site/terms.ts).
 * Kept as its own list so GUIDE_PAGES stays the formations + positions cluster (tests/seo-formations-positions.cjs checks those
 * pages one by one); everything that lists guides (sitemap, llms.txt, home, "More to learn", lesson back-links) reads
 * ALL_GUIDE_PAGES / GUIDE_HUBS. Its pictures are REFERENCE_FILES, served by the same /learn/diagrams route.
 */
export const diagramUrl=(file:string)=>`${DIAGRAM_DIR}/${file}`;
export const REFERENCE_FILES:readonly string[]=[...RULES.map(r=>r.picture),...TERM_PAGES.map(t=>t.picture),...CHARTS.map(c=>c.picture)];
export const REFERENCE_PAGES:readonly GuidePage[]=[
 {path:RULES_HUB.path,name:RULES_HUB.h1,title:RULES_HUB.title,description:RULES_HUB.description,blurb:RULES_HUB.blurb,hub:true,lessonIds:RULES_HUB.lessons.map(l=>l.id),image:diagramUrl('offside-rule.png')},
 ...CHARTS.map(c=>({path:c.path,name:c.h1,title:c.title,description:c.description,blurb:c.blurb,hub:true,lessonIds:[] as string[],image:diagramUrl(c.picture)})),
 {path:TERMS_HUB.path,name:TERMS_HUB.h1,title:TERMS_HUB.title,description:TERMS_HUB.description,blurb:TERMS_HUB.blurb,hub:true,lessonIds:TERMS_HUB.lessons.map(l=>l.id),image:diagramUrl('give-and-go-term.png')},
 ...RULES.map(r=>({path:r.path,name:r.h1,title:r.title,description:r.desc,lessonIds:r.lessons.map(l=>l.id),image:diagramUrl(r.picture)})),
 ...TERM_PAGES.map(t=>({path:t.path,name:t.h1,title:t.title,description:t.desc,lessonIds:t.lessons.map(l=>l.id),image:diagramUrl(t.picture)})),
];
export const ALL_GUIDE_PAGES:readonly GuidePage[]=[...GUIDE_PAGES,...REFERENCE_PAGES];
export const GUIDE_HUBS=ALL_GUIDE_PAGES.filter(g=>g.hub);
export const guideByPath=(path:string)=>ALL_GUIDE_PAGES.find(g=>g.path===path);
/** The guide pages that teach from a lesson (lesson pages link back to them: "Related guides"); at most four, the formation and
 *  position pages first, hubs and charts never (a lesson links to the page that explains its idea, not to a list). */
export const guidesForLesson=(id:string)=>[...GUIDE_PAGES,...REFERENCE_PAGES.filter(g=>!g.hub)].filter(g=>g.lessonIds.includes(id)).slice(0,4);
export const guideCrumbs=(...tail:{name:string;path:string}[])=>[{name:'Home',path:'/'},{name:'Lessons',path:LESSONS_INDEX},...tail];
/** The one shared line that ends every guide page. */
export const GUIDE_FOOT='Futbol Island is a free football (soccer) learning game for kids aged 7 to 12. Every idea on this page is taught on a pitch with moving players, then checked with a quick quiz.';
/** "Soccer" first for US searchers, "football" once near the top (owner, Nov 10 2026). */
export const GUIDE_NAMES='Soccer is called football in most of the world. This guide is part of Futbol Island’s free football lessons for kids aged 7 to 12.';
