import Lab from '../Lab';
import Experience from '@/components/museum/experiences/stadiums/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'stadiums · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the stadiums experience ("Stadiums of the World", Oct 12 2026; replaced cards-1970). */
export default function Page(){guardLabRoute();return <Lab id="stadiums" Experience={Experience}/>;}
