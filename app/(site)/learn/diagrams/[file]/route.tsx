import {ImageResponse} from 'next/og';
import {DIAGRAM_FILES,REFERENCE_FILES} from '@/lib/site/guides';
import {diagramFor,IMAGE_SIZE} from '@/lib/site/pitchImage';
/**
 * /learn/diagrams/<slug>-formation.png and /learn/diagrams/<slug>-position.png (Nov 10 2026): every guide diagram as a real
 * 1200 x 630 PNG, prerendered at build time (force-static + generateStaticParams, unknown names 404). It is the page's Open
 * Graph image and an image URL that image search can index. Same data as the inline SVG (lib/site/pitch.ts); no request-time
 * work and nothing runs on the phone.
 */
export const dynamic='force-static';
export const dynamicParams=false;
/* formations and positions, then the rule, glossary and size-chart pictures (<slug>-rule.png, <slug>-term.png, <slug>-chart.png) */
export const generateStaticParams=()=>[...DIAGRAM_FILES,...REFERENCE_FILES].map(file=>({file}));
export function GET(_req:Request,{params}:{params:{file:string}}){
 const tree=diagramFor(params.file);
 if(!tree)return new Response('Not found',{status:404});
 return new ImageResponse(tree,{...IMAGE_SIZE,headers:{'Cache-Control':'public, max-age=86400, stale-while-revalidate=604800'}});
}
