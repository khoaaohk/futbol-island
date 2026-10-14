import {createLimiter} from '@/lib/analytics/ingest';
import {BOARD_ACTIONS,MAX_BOARD_BODY,boardSecret,handleBoard} from '@/lib/arcade/leaderboardServer';
import {getBoardStore} from '@/lib/arcade/leaderboardStore';

/**
 * Island leaderboards for the arcade games (lib/arcade/leaderboardServer.ts; docs/arcade-leaderboards.md).
 * POST /api/arcade-board/start · POST /api/arcade-board/submit · GET /api/arcade-board/top?game=runner
 * Nothing here logs a request, a body or an error. Recommended on top: a Vercel WAF rate-limit rule on /api/arcade-board/*.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const HEADERS={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
// Session starts: a token bucket per (hashed) address on this instance; posts are throttled in the database.
const limiter=createLimiter({capacity:40,refillPerSec:0.2});
const deps=()=>({store:getBoardStore(),secret:boardSecret({LEADERBOARD_SECRET:process.env.LEADERBOARD_SECRET,SAVE_CODE_PEPPER:process.env.SAVE_CODE_PEPPER}),limiter});

async function readCapped(req:Request,cap:number):Promise<string|null>{
 if(!req.body)return '';
 const reader=req.body.getReader(),chunks:Uint8Array[]=[];let n=0;
 for(;;){const {done,value}=await reader.read();if(done)break;n+=value.byteLength;if(n>cap){void reader.cancel();return null;}chunks.push(value);}
 return Buffer.concat(chunks).toString('utf8');
}

export async function POST(req:Request,{params}:{params:{action:string}}){
 if(params.action==='top'||!(BOARD_ACTIONS as readonly string[]).includes(params.action))return Response.json({ok:false},{status:404,headers:HEADERS});
 const body=await readCapped(req,MAX_BOARD_BODY);
 if(body===null)return Response.json({ok:false},{status:413,headers:HEADERS});
 const r=await handleBoard(params.action,{body,headers:req.headers},deps());
 return Response.json(r.body,{status:r.status,headers:HEADERS});
}
export async function GET(req:Request,{params}:{params:{action:string}}){
 if(params.action!=='top')return Response.json({ok:false},{status:404,headers:HEADERS});
 const r=await handleBoard('top',{query:new URL(req.url).searchParams,headers:req.headers},deps());
 return Response.json(r.body,{status:r.status,headers:{...HEADERS,'Cache-Control':r.cache??'no-store'}});
}
