import {cookies} from 'next/headers';
import {ADMIN_COOKIE,sameOrigin,verifySession} from '@/lib/analytics/adminAuth';
import {loadSessionEpoch} from '@/lib/analytics/adminSession';
import {getBoardStore} from '@/lib/arcade/leaderboardStore';
import {handleAdminBoard} from '@/lib/arcade/leaderboardAdmin';

/**
 * Nov 10 2026 (abuse audit: faked scores had no removal). GET /api/admin/board?game=<id>: the best 30 rows of one board (hidden
 * ones marked). POST {id, hidden}: hide ("Remove row") or restore one row. Admin session only, same as every /api/admin route;
 * the POST is same-origin only. Needs supabase/migrations/20261111_board_hidden_rows.sql to hide (else 409 "migration").
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};

async function authed(){await loadSessionEpoch();return verifySession(cookies().get(ADMIN_COOKIE)?.value,Date.now());}
export async function GET(req:Request){
 if(!await authed())return Response.json({error:'unauthorized'},{status:401,headers});
 const a=await handleAdminBoard('list',{query:new URL(req.url).searchParams},getBoardStore());
 return Response.json(a.body,{status:a.status,headers});
}
export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),req.headers.get('host')))return Response.json({error:'origin'},{status:403,headers});
 if(!await authed())return Response.json({error:'unauthorized'},{status:401,headers});
 const text=await req.text();if(text.length>256)return Response.json({error:'too-large'},{status:413,headers});
 const a=await handleAdminBoard('hide',{body:text},getBoardStore());
 return Response.json(a.body,{status:a.status,headers});
}
