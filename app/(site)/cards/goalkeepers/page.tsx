import CollectionHub,{hubMeta} from '@/components/site/CollectionHub';
import {CARD_COLLECTIONS} from '@/lib/site/collections';
/** Card collection hub /cards/goalkeepers (lib/site/collections.ts, Nov 15 2026). */
export const dynamic='force-static';
export const metadata=hubMeta('cards','goalkeepers');
export default function Page(){return <CollectionHub parent="cards" slug="goalkeepers" siblings={CARD_COLLECTIONS}/>;}
