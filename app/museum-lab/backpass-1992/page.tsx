import Lab from '../Lab';
import Experience from '@/components/museum/experiences/backpass-1992/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'backpass-1992 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the backpass-1992 experience. */
export default function Page(){guardLabRoute();return <Lab id="backpass-1992" Experience={Experience}/>;}
