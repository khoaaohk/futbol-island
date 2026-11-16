import CollectionHub,{hubMeta} from '@/components/site/CollectionHub';
import {FISH_COLLECTIONS} from '@/lib/site/collections';
/** Fishbook collection hub /fish/crabs-and-shellfish (lib/site/collections.ts, Nov 15 2026). */
export const dynamic='force-static';
export const metadata=hubMeta('fish','crabs-and-shellfish');
export default function Page(){return <CollectionHub parent="fish" slug="crabs-and-shellfish" siblings={FISH_COLLECTIONS}/>;}
