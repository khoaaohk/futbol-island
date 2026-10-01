import SplashLab from '@/components/SplashLab';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'Splash cast · Futbol Island',robots:{index:false,follow:false}};
export default function SplashLabPage(){guardLabRoute();return <SplashLab/>;}
