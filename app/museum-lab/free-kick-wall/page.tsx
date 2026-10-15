import Lab from '../Lab';
import Experience from '@/components/museum/experiences/free-kick-wall/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'free-kick-wall · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the free-kick-wall experience. */
export default function Page(){guardLabRoute();return <Lab id="free-kick-wall" Experience={Experience}/>;}
