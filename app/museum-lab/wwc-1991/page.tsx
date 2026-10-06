import Lab from '../Lab';
import Experience from '@/components/museum/experiences/wwc-1991/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'wwc-1991 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the wwc-1991 experience. */
export default function Page(){guardLabRoute();return <Lab id="wwc-1991" Experience={Experience}/>;}
