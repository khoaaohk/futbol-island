import GapPageView from '@/components/site/visual/GapPageView';
import {gapByKey} from '@/lib/site/gapPages';
import {pageMeta} from '@/lib/site/seo';
/** /learn/soccer-terms/types-of-dribbling (SEO lift + visual pass, Nov 26 2026): a gap page, data in lib/site/gapPages.ts ('types-of-dribbling'). */
export const dynamic='force-static';
const p=gapByKey('types-of-dribbling')!;
export const metadata=pageMeta(p.title,p.desc,p.path,{whole:true,image:{url:p.image,alt:p.imageAlt}});
export default function Page(){return <GapPageView p={p}/>;}
