import Lab from '../Lab';
import Experience from '@/components/museum/experiences/telstar-1970/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'telstar-1970 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the telstar-1970 experience. */
export default function Page(){guardLabRoute();return <Lab id="telstar-1970" Experience={Experience}/>;}
