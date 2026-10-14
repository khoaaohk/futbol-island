import {notFound} from 'next/navigation';
import JerseyLab from './JerseyLab';
export const metadata={title:'Jersey studio lab · Futbol Island',robots:{index:false,follow:false}};
// Read the env at request time (not at build), so `next start` can opt in for local review with FI_SHOP_LAB=1.
export const dynamic='force-dynamic';
/** Dev route: the shop's Jersey studio on its own (components/shop/JerseyStudio.tsx). Production answers 404 like the other labs
 *  (lib/dev/labRoutes.ts) unless FI_SHOP_LAB=1 is set for a local `next start` review. ?debug exposes window.__jerseyStudio. */
export default function JerseyLabPage(){
 if(process.env.NODE_ENV==='production'&&process.env.FI_SHOP_LAB!=='1')notFound();
 return <JerseyLab/>;
}
