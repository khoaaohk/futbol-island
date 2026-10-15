import Lab from '../Lab';
import Experience from '@/components/museum/experiences/offside-rules/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'offside-rules · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the offside-rules experience (Oct 14 2026). */
export default function Page(){guardLabRoute();return <Lab id="offside-rules" Experience={Experience}/>;}
