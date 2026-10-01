import MotionLab from '@/components/MotionLab';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'Movement review · Futbol Island',robots:{index:false,follow:false}};
export default function MotionLabPage(){guardLabRoute();return <MotionLab/>;}
