import {llmsText} from '@/lib/site/llms';
/** /llms.txt (Nov 8 2026; was public/llms.txt): built once at build time from the same data as the pages (lib/site/llms.ts). */
export const dynamic='force-static';
export function GET(){return new Response(llmsText(),{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
