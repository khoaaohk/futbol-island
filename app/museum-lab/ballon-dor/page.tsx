import Lab from '../Lab';
import Experience from '@/components/museum/experiences/ballon-dor/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'ballon-dor · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the Ballon d'Or experience (Oct 14 2026). */
export default function Page(){guardLabRoute();return <Lab id="ballon-dor" Experience={Experience}/>;}
