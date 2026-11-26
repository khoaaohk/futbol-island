import {GO_FISHING_SPOTS} from '@/lib/town/fishing/fishingReach';
import {PLAY_PATH} from './seo';
/**
 * "Play this in the game" links from the reading pages (Nov 15 2026). The island reads `?go=` after boot (lib/play/deepLink.ts,
 * which validates it against the game's own lessons and fishing spots and ignores anything else). Cards have no island location
 * (they come from packs), so a card page opens the card pack shop with the island's existing `?store=packs`.
 */
export const playLessonHref=(lessonId:string)=>`${PLAY_PATH}?go=lesson:${encodeURIComponent(lessonId)}`;
/** The first of a fish's spots that a "Go fishing" can travel to (moored boats cannot), with its name; null if none. */
export function shoreSpot(spotIds:readonly string[]):{id:string;name:string}|null{
 const s=GO_FISHING_SPOTS.find(x=>spotIds.includes(x.id));return s?{id:s.id,name:s.name}:null;
}
export const playFishHref=(spotId?:string)=>`${PLAY_PATH}?go=fish${spotId?`:${encodeURIComponent(spotId)}`:''}`;
export const PLAY_PACKS_HREF=`${PLAY_PATH}?store=packs`;
/**
 * Nov 26 2026 (Search Console "Alternate page with proper canonical tag": 50 `/play?go=…` URLs; "Excluded by noindex":
 * `/arcade?game=…`): a game deep link (`/play?…`, `/arcade?…`) opens the client-only game, so its URL has nothing of its own
 * to index (/play is the canonical; /arcade?game= is noindex). rel="nofollow" asks Google not to spend crawls on them. They
 * stay crawlable (no robots.txt block: a blocked URL can still be indexed from its links, and its canonical/noindex unseen).
 */
export const deepLinkRel=(href:string):'nofollow'|undefined=>/^\/(?:play|arcade)\?/.test(href)?'nofollow':undefined;
