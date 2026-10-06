import TimelineLab from './TimelineLab';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'timeline · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the timeline-wall experience. */
export default function Page(){guardLabRoute();return <TimelineLab/>;}
