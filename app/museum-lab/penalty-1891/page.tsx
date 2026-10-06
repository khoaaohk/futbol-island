import Lab from '../Lab';
import Experience from '@/components/museum/experiences/penalty-1891/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'penalty-1891 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the penalty-1891 experience. */
export default function Page(){guardLabRoute();return <Lab id="penalty-1891" Experience={Experience}/>;}
