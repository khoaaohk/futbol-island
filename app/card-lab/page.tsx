import CardLab from '@/components/CardLab';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'Card lab · Futbol Island',robots:{index:false,follow:false}};
/** Holo foil comparison (dev only): the current CSS foil and the WebGL holo foil on the large card, plus the binder preview. */
export default function CardLabPage(){guardLabRoute();return <CardLab/>;}
