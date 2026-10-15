import Lab from '../Lab';
import Experience from '@/components/museum/experiences/ball-curve/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'ball-curve · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the ball-curve experience. */
export default function Page(){guardLabRoute();return <Lab id="ball-curve" Experience={Experience}/>;}
