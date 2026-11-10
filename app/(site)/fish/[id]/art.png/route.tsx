import FishArt from '@/components/FishArt';
import {fishById,FISH_ART_SIZE,SITE_FISH} from '@/lib/site/fish';
import {artCard} from '@/lib/site/ogImage';
/** /fish/<id>/art.png: the game's drawing of the animal as a real picture (the <img> on the Fishbook page). Built once, at build time. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_FISH.map(f=>({id:f.id}));
export function GET(_req:Request,{params}:{params:{id:string}}){
 const f=fishById(params.id);
 if(!f)return new Response('Not found',{status:404});
 return artCard(<FishArt fish={f} size={780}/>,FISH_ART_SIZE);
}
