import Lab from '../Lab';
import Experience from '@/components/museum/experiences/hall-of-fame/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'hall-of-fame · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the hall-of-fame experience. */
export default function Page(){guardLabRoute();return <Lab id="hall-of-fame" Experience={Experience}/>;}
