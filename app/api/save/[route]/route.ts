import {MAX_REQUEST_BYTES,SAVE_ROUTES,handleSave,type SaveRoute} from '@/lib/saves/server';
import {saveDeps} from '@/lib/saves/deps';

/**
 * POST /api/save/{create,check,sync,restore,delete,email} (lib/saves/server.ts; docs/save-codes.md). The save code is only
 * ever in this JSON body: never in the URL, a header or a log. Nothing here logs a request, a body or an error.
 * Recommended on top: the Vercel WAF rate-limit rules in docs/save-codes.md.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const HEADERS={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};

async function readCapped(req:Request,cap:number):Promise<Uint8Array|null>{
 if(!req.body)return new Uint8Array(0);
 const reader=req.body.getReader(),chunks:Uint8Array[]=[];let n=0;
 for(;;){const {done,value}=await reader.read();if(done)break;n+=value.byteLength;if(n>cap){void reader.cancel();return null;}chunks.push(value);}
 return new Uint8Array(Buffer.concat(chunks));
}

export async function POST(req:Request,{params}:{params:{route:string}}){
 const route=params.route as SaveRoute;
 if(!SAVE_ROUTES.includes(route))return Response.json({ok:false},{status:404,headers:HEADERS});
 const bytes=await readCapped(req,MAX_REQUEST_BYTES);
 if(!bytes)return Response.json({ok:false,tooBig:true},{status:413,headers:HEADERS});
 const r=await handleSave(route,{bytes,contentType:req.headers.get('content-type'),headers:req.headers},saveDeps());
 return Response.json(r.body,{status:r.status,headers:HEADERS});
}
