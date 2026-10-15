import Lab from '../Lab';
import Experience from '@/components/museum/experiences/throw-in/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'throw-in · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the throw-in experience. */
export default function Page(){guardLabRoute();return <Lab id="throw-in" Experience={Experience}/>;}
