import LessonHub from '@/components/site/LessonHub';
import {hubBySlug} from '@/lib/site/hubs';
import {pageMeta} from '@/lib/site/seo';
/** Topic hub /learn/passing-and-support (SEO, Nov 8 2026): built from the lesson catalog only (lib/site/hubs.ts). */
export const dynamic='force-static';
const hub=hubBySlug('passing-and-support')!;
export const metadata=pageMeta(hub.title,hub.description,hub.path);
export default function Page(){return <LessonHub hub={hub}/>;}
