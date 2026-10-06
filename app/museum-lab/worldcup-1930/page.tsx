import Lab from '../Lab';
import Experience from '@/components/museum/experiences/worldcup-1930/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'worldcup-1930 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the worldcup-1930 experience. */
export default function Page(){guardLabRoute();return <Lab id="worldcup-1930" Experience={Experience}/>;}
