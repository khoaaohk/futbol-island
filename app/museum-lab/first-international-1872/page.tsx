import Lab from '../Lab';
import Experience from '@/components/museum/experiences/first-international-1872/Experience';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'first-international-1872 · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the first-international-1872 experience (Oct 14 2026). */
export default function Page(){guardLabRoute();return <Lab id="first-international-1872" Experience={Experience}/>;}
