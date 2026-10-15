import Lab from '../Lab';
import Experience from '@/components/museum/experiences/keeper-hands-1912/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'keeper-hands-1912 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the keeper-hands-1912 experience (Oct 14 2026). */
export default function Page(){guardLabRoute();return <Lab id="keeper-hands-1912" Experience={Experience}/>;}
