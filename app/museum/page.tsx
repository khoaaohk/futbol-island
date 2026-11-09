import {noindexMeta} from '@/lib/site/seo';
import MuseumRoom from '@/components/MuseumRoom';
import SaveSync from '@/components/saves/LazySaveSync';
// SEO (Nov 8 2026): a canvas game room with almost no text, kept out of search (noindex, links followed) with its own canonical.
export const metadata=noindexMeta('History Museum · Futbol Island','Walk into the island’s History Museum: the Laws of the Game, World Cup history, balls and kits, football’s firsts, rules and tactics, skills and science, and its legends.','/museum');
export default function MuseumPage(){return <><MuseumRoom/><SaveSync boot={false}/></>;}
