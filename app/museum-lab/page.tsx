import Link from 'next/link';
import {guardLabRoute} from '@/lib/dev/labRoutes';
import {EXHIBITS} from '@/lib/endgame/museum';
export const metadata={title:'Museum lab · Futbol Island',robots:{index:false,follow:false}};
/** Index of the museum exhibit experiences (dev only): one lab page per exhibit. */
export default function MuseumLabPage(){guardLabRoute();
 return <main style={{padding:24,fontFamily:'system-ui',background:'#111',color:'#eee',minHeight:'100vh'}}><h1>Museum lab</h1><ul>{EXHIBITS.map(e=><li key={e.id} style={{margin:'8px 0'}}><Link style={{color:'#9cf'}} href={`/museum-lab/${e.id}`}>{e.year} · {e.title}</Link></li>)}</ul></main>;}
