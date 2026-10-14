import Link from 'next/link';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'Shop lab · Futbol Island',robots:{index:false,follow:false}};
/** Kit Shop studios on their own pages (dev only): an index of the three studio labs. */
export default function ShopLabPage(){guardLabRoute();return <main style={{padding:24,fontFamily:'var(--btn-font)'}}><h1>Shop lab</h1><ul>{['jersey','boots','ball'].map(id=><li key={id}><Link href={`/shop-lab/${id}`}>{id}</Link></li>)}</ul></main>;}
