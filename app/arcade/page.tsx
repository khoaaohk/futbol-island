import {noindexMeta} from '@/lib/site/seo';
import ArcadeRoom from '@/components/ArcadeRoom';
import SaveSync from '@/components/saves/LazySaveSync';
import {arcadeCabinets,ARCADE_GAME_COUNT} from '@/lib/arcade/arcadeCatalog';
import {NumberWord} from '@/lib/numberWord';
// SEO (Nov 8 2026): a canvas game room with almost no text, kept out of search (noindex, links followed) with its own canonical.
// Nov 10 2026: the canonical is /arcade for every ?game=<id> deep link too (Next writes the path, never the query), so the six deep
// links cannot become six thin indexable URLs; the indexable page of each game is its reading page /games/<slug> (lib/site/games.ts).
// Nov 17 2026: the count and the names come from the catalog, so a new cabinet never leaves this text behind.
const NAMES=arcadeCabinets.map(c=>c.name),LIST=`${NAMES.slice(0,-1).join(', ')} and ${NAMES.at(-1)}`,N=NumberWord(ARCADE_GAME_COUNT);
export const metadata=noindexMeta(`The Arcade: ${N} Football Games · Futbol Island`,`The Futbol Island arcade: ${LIST}. ${N} free football games, one skill at a time.`,'/arcade');
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function ArcadePage(){preloadIslandBrush();return <><ArcadeRoom/><SaveSync boot={false}/></>;}
