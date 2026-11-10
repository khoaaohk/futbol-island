import {cardByNumber,eraWord,SITE_CARDS} from '@/lib/site/cards';
import {ogCard} from '@/lib/site/ogImage';
/** /cards/<n>/og.png: the card page's own share picture (words only: the game's card art is not a picture a page can show). Built once, at build time. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_CARDS.map(c=>({number:String(c.number)}));
export function GET(_req:Request,{params}:{params:{number:string}}){
 const c=/^\d+$/.test(params.number)?cardByNumber(Number(params.number)):undefined;
 if(!c)return new Response('Not found',{status:404});
 return ogCard({eyebrow:`Card #${c.number} · ${c.roleLabel}`,title:c.displayName,lines:[[c.country,eraWord(c)].filter(Boolean).join(' · '),c.play?`Iconic play: ${c.play.title}`:'']});
}
