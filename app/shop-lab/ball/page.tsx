import {notFound} from 'next/navigation';
import {labRoutesAllowed} from '@/lib/dev/labRoutes';
import BallLab from './BallLab';
export const metadata={title:'Ball studio · Shop lab',robots:{index:false,follow:false}};
/** Read at request time so a production build can still be reviewed with FI_SHOP_LAB=1 (heat measurements on `next start`). */
export const dynamic='force-dynamic';
/** Dev lab for the football shop's Ball studio (components/shop/BallStudio.tsx), opened the way the shop opens it. */
export default function Page(){if(!labRoutesAllowed()&&process.env.FI_SHOP_LAB!=='1')notFound();return <BallLab/>;}
