import Lab from '../Lab';
import Experience from '@/components/museum/experiences/boots/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'boots · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the boots experience ("Boots through time", Oct 12 2026; replaced backpass-1992). */
export default function Page(){guardLabRoute();return <Lab id="boots" Experience={Experience}/>;}
