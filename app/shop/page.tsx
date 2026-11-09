import {noindexMeta} from '@/lib/site/seo';
import ShopRoom from '@/components/shop/ShopRoom';
import SaveSync from '@/components/saves/LazySaveSync';
// SEO (Nov 8 2026): a canvas game room with almost no text, kept out of search (noindex, links followed) with its own canonical.
export const metadata=noindexMeta('Kit Shop · Futbol Island','Walk into the island’s Kit Shop: design your own jersey, boots and ball, save your designs and buy them with island coins.','/shop');
export default function ShopPage(){return <><ShopRoom/><SaveSync boot={false}/></>;}
