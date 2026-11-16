import CollectionHub,{hubMeta} from '@/components/site/CollectionHub';
import {FISH_COLLECTIONS} from '@/lib/site/collections';
/** Fishbook collection hub /fish/octopus-squid-and-rays (lib/site/collections.ts, Nov 15 2026). */
export const dynamic='force-static';
export const metadata=hubMeta('fish','octopus-squid-and-rays');
export default function Page(){return <CollectionHub parent="fish" slug="octopus-squid-and-rays" siblings={FISH_COLLECTIONS}/>;}
