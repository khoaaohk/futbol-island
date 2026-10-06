import Lab from '../Lab';
import Experience from '@/components/museum/experiences/futsal-1989/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'futsal-1989 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the futsal-1989 experience. */
export default function Page(){guardLabRoute();return <Lab id="futsal-1989" Experience={Experience}/>;}
