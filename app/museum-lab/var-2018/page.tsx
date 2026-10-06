import Lab from '../Lab';
import Experience from '@/components/museum/experiences/var-2018/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'var-2018 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the var-2018 experience. */
export default function Page(){guardLabRoute();return <Lab id="var-2018" Experience={Experience}/>;}
