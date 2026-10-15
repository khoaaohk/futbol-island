import Lab from '../Lab';
import Experience from '@/components/museum/experiences/copa-america-1916/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'copa-america-1916 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the copa-america-1916 experience (Oct 14 2026). */
export default function Page(){guardLabRoute();return <Lab id="copa-america-1916" Experience={Experience}/>;}
