import {noindexMeta} from '@/lib/site/seo';
import KonbiniRoom from '@/components/KonbiniRoom';
import SaveSync from '@/components/saves/LazySaveSync';
// SEO (Nov 8 2026): a canvas game room with almost no text, kept out of search (noindex, links followed) with its own canonical.
export const metadata=noindexMeta('Konbini · Futbol Island','Walk into the island Konbini: football magazines, match-day fuel and a friendly cashier.','/konbini');
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function KonbiniPage(){preloadIslandBrush();return <><KonbiniRoom/><SaveSync boot={false}/></>;}
