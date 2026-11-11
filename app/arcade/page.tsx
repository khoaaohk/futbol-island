import {noindexMeta} from '@/lib/site/seo';
import ArcadeRoom from '@/components/ArcadeRoom';
import SaveSync from '@/components/saves/LazySaveSync';
// SEO (Nov 8 2026): a canvas game room with almost no text, kept out of search (noindex, links followed) with its own canonical.
// Nov 10 2026: the canonical is /arcade for every ?game=<id> deep link too (Next writes the path, never the query), so the six deep
// links cannot become six thin indexable URLs; the indexable page of each game is its reading page /games/<slug> (lib/site/games.ts).
export const metadata=noindexMeta('The Arcade: Six Football Games · Futbol Island','The Futbol Island arcade: Kit Rush, Squad Snake, Breakaway Run, Futbol Tennis, Futbol Pinball and Pass Puzzles. Six free football games, one skill at a time.','/arcade');
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function ArcadePage(){preloadIslandBrush();return <><ArcadeRoom/><SaveSync boot={false}/></>;}
