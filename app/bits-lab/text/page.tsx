import TextLab from '@/components/bits/text/TextLab';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'Text lab · Futbol Island',robots:{index:false,follow:false}};
/** Heat-safe text one-shots (dev only): components/bits/text, docs/third-party.md. */
export default function TextLabPage(){guardLabRoute();return <TextLab/>;}
