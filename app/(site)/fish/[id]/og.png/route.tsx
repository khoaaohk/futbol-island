import FishArt from '@/components/FishArt';
import {fishById,rarityWord,SITE_FISH} from '@/lib/site/fish';
import {ogCard} from '@/lib/site/ogImage';
/** /fish/<id>/og.png: the Fishbook page's own share picture, with the game's drawing of the animal. Built once, at build time. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_FISH.map(f=>({id:f.id}));
export function GET(_req:Request,{params}:{params:{id:string}}){
 const f=fishById(params.id);
 if(!f)return new Response('Not found',{status:404});
 return ogCard({eyebrow:`Fishbook · ${rarityWord(f)}`,title:f.name,lines:[`${f.club.name} (${f.club.country})`],art:<FishArt fish={f} size={380}/>});
}
