import {notFound} from 'next/navigation';
import {labRoutesAllowed} from '@/lib/dev/labRoutes';
import BootLab from './BootLab';
export const metadata={title:'Boot studio lab · Futbol Island',robots:{index:false,follow:false}};
/**
 * Boot studio on its own page (dev only, like the other labs: 404 in production builds). SHOP_LAB=1 at build time keeps it in a
 * local production build, so screenshots and heat probes can run against `next start`.
 */
export default function BootStudioLabPage(){if(!labRoutesAllowed()&&process.env.SHOP_LAB!=='1')notFound();return <BootLab/>;}
