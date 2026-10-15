import Lab from '../Lab';
import Experience from '@/components/museum/experiences/floodlights-1878/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'floodlights-1878 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the floodlights-1878 experience (Oct 14 2026). */
export default function Page(){guardLabRoute();return <Lab id="floodlights-1878" Experience={Experience}/>;}
