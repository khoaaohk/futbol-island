import Lab from '../Lab';
import Experience from '@/components/museum/experiences/cards-1970/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'cards-1970 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the cards-1970 experience. */
export default function Page(){guardLabRoute();return <Lab id="cards-1970" Experience={Experience}/>;}
