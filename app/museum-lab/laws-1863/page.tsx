import Lab from '../Lab';
import Experience from '@/components/museum/experiences/laws-1863/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'laws-1863 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the laws-1863 experience. */
export default function Page(){guardLabRoute();return <Lab id="laws-1863" Experience={Experience}/>;}
