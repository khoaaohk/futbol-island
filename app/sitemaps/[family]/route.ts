import {XML_HEADERS,familySitemapXml,sitemapFamilies,type Family} from '@/lib/site/sitemaps';
/** /sitemaps/<family>.xml (Nov 21 2026): one page family's sitemap (lib/site/sitemaps.ts), listed in the index at /sitemap.xml.
 *  Every family is built at build time; any other name is a 404. */
export const dynamic='force-static';
export const dynamicParams=false;
export function generateStaticParams(){
 return sitemapFamilies().map(f=>({family:`${f.family}.xml`}));
}
export function GET(_req:Request,{params}:{params:{family:string}}){
 const xml=params.family.endsWith('.xml')?familySitemapXml(params.family.slice(0,-4) as Family):null;
 if(!xml)return new Response('Not found',{status:404});
 return new Response(xml,{headers:XML_HEADERS});
}
