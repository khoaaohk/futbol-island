import type {Metadata} from 'next';

/** Admin pages are never indexed (also X-Robots-Tag in next.config.mjs), not in any sitemap and not linked from the game. */
export const metadata:Metadata={title:'Admin · Futbol Island',robots:{index:false,follow:false,nocache:true,googleBot:{index:false,follow:false}}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <>{children}</>;}
