import {ImageResponse} from 'next/og';
import {PRINT_FILE_NAMES,printFile} from '@/lib/site/tools/printables';
import {toSvgString} from '@/lib/site/tools/sheet';
import {sheetImage} from '@/lib/site/tools/sheetImage';
/**
 * /tools/soccer-field-diagrams/files/<name>.svg and <name>.png (Nov 10 2026): every printable sheet as a file, prerendered at
 * build time like the guide diagrams (app/(site)/learn/diagrams/[file]/route.tsx): force-static + generateStaticParams, unknown
 * names 404, no request-time work. Both files are drawn from the same sheet data as the page preview (lib/site/tools/sheet.ts).
 * The PNG is US Letter at 150 dpi.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>PRINT_FILE_NAMES.map(file=>({file}));
const CACHE='public, max-age=86400, stale-while-revalidate=604800';
export function GET(_req:Request,{params}:{params:{file:string}}){
 const m=/^(.+)\.(svg|png)$/.exec(params.file),f=m&&printFile(m[1]);
 if(!m||!f)return new Response('Not found',{status:404});
 const sheet=f.sheet();
 if(m[2]==='svg')return new Response(toSvgString(sheet),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':CACHE,'X-Content-Type-Options':'nosniff'}});
 const {tree,width,height}=sheetImage(sheet);
 return new ImageResponse(tree,{width,height,headers:{'Cache-Control':CACHE}});
}
