import {exhibitById,SITE_EXHIBITS} from '@/lib/site/exhibits';
import {ogCard} from '@/lib/site/ogImage';
/** /exhibits/<id>/og.png: the museum case's own share picture (words only). Built once, at build time. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_EXHIBITS.map(e=>({id:e.id}));
export function GET(_req:Request,{params}:{params:{id:string}}){
 const e=exhibitById(params.id);
 if(!e)return new Response('Not found',{status:404});
 return ogCard({eyebrow:`History Museum · ${e.year}`,title:e.title,lines:[e.galleryTitle]});
}
