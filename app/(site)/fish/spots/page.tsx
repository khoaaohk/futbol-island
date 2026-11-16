import CollectionHub,{hubMeta} from '@/components/site/CollectionHub';
import {FISH_COLLECTIONS} from '@/lib/site/collections';
/** Fishbook collection hub /fish/spots (lib/site/collections.ts, Nov 15 2026). */
export const dynamic='force-static';
export const metadata=hubMeta('fish','spots');
export default function Page(){return <CollectionHub parent="fish" slug="spots" siblings={FISH_COLLECTIONS}/>;}
