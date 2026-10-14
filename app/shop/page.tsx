import ShopRoom from '@/components/shop/ShopRoom';
import SaveSync from '@/components/saves/LazySaveSync';
export const metadata={title:'Kit Shop · Futbol Island',description:'Walk into the island’s Kit Shop: design your own jersey, boots and ball, save your designs and buy them with island coins.'};
export default function ShopPage(){return <><ShopRoom/><SaveSync boot={false}/></>;}
