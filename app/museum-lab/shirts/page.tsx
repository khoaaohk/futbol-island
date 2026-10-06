import Lab from '../Lab';
import Experience from '@/components/museum/experiences/shirts/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'shirts · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the shirts experience. */
export default function Page(){guardLabRoute();return <Lab id="shirts" Experience={Experience}/>;}
