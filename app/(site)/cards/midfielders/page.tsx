import CollectionHub,{hubMeta} from '@/components/site/CollectionHub';
import {CARD_COLLECTIONS} from '@/lib/site/collections';
/** Card collection hub /cards/midfielders (lib/site/collections.ts, Nov 15 2026). */
export const dynamic='force-static';
export const metadata=hubMeta('cards','midfielders');
export default function Page(){return <CollectionHub parent="cards" slug="midfielders" siblings={CARD_COLLECTIONS}/>;}
