import BitsLab from '@/components/bits/BitsLab';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'Bits lab · Futbol Island',robots:{index:false,follow:false}};
/** React Bits adaptations (dev only): components/bits, docs/third-party.md. */
export default function BitsLabPage(){guardLabRoute();return <BitsLab/>;}
