import Lab from '../Lab';
import Experience from '@/components/museum/experiences/formations-history/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'formations-history · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the formations-history experience (Oct 14 2026). */
export default function Page(){guardLabRoute();return <Lab id="formations-history" Experience={Experience}/>;}
