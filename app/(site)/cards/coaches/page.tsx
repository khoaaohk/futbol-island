import CollectionHub,{hubMeta} from '@/components/site/CollectionHub';
import {CARD_COLLECTIONS} from '@/lib/site/collections';
/** Card collection hub /cards/coaches (lib/site/collections.ts, Nov 15 2026). */
export const dynamic='force-static';
export const metadata=hubMeta('cards','coaches');
export default function Page(){return <CollectionHub parent="cards" slug="coaches" siblings={CARD_COLLECTIONS}/>;}
