import {noindexMeta} from '@/lib/site/seo';
import ArcadeRoom from '@/components/ArcadeRoom';
import SaveSync from '@/components/saves/LazySaveSync';
// SEO (Nov 8 2026): a canvas game room with almost no text, kept out of search (noindex, links followed) with its own canonical.
export const metadata=noindexMeta('The Arcade · Futbol Island','Walk into the arcade. Five football games, one skill at a time.','/arcade');
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function ArcadePage(){preloadIslandBrush();return <><ArcadeRoom/><SaveSync boot={false}/></>;}
