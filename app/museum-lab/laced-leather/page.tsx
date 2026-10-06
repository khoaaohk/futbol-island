import Lab from '../Lab';
import Experience from '@/components/museum/experiences/laced-leather/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'laced-leather · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the laced-leather experience. */
export default function Page(){guardLabRoute();return <Lab id="laced-leather" Experience={Experience}/>;}
