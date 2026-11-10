/**
 * /admin "Arcade boards" (Nov 10 2026): list one board's best rows and hide/restore one (soft delete; the row stays until the
 * nightly purge). Pure over a BoardStore so tests/security-nov10.cjs can drive it; the route (app/api/admin/board) does the
 * admin session and same-origin checks first.
 */
import {isBoardGame} from './leaderboard';
import type {BoardStore} from './leaderboardStore';

export const ADMIN_BOARD_LIMIT=30;
export async function handleAdminBoard(action:'list'|'hide',req:{query?:URLSearchParams;body?:string},store:BoardStore|null):Promise<{status:number;body:Record<string,unknown>}>{
 if(!store)return {status:503,body:{ok:false,unavailable:true}};
 try{
  if(action==='list'){
   const game=req.query?.get('game');if(!isBoardGame(game))return {status:400,body:{ok:false,error:'game'}};
   const r=await store.adminList(game,ADMIN_BOARD_LIMIT);
   return {status:200,body:{ok:true,game,hidable:r.hidable,rows:r.rows}};
  }
  let b:{id?:unknown;hidden?:unknown};try{b=JSON.parse(req.body||'');}catch{return {status:400,body:{ok:false}};}
  if(!b||!Number.isInteger(b.id)||(b.id as number)<1||typeof b.hidden!=='boolean')return {status:400,body:{ok:false}};
  const r=await store.hide(b.id as number,b.hidden);
  if(r==='missing')return {status:409,body:{ok:false,error:'migration',need:'20261111_board_hidden_rows.sql'}};
  return {status:r?200:404,body:{ok:r}};
 }catch{return {status:503,body:{ok:false,unavailable:true}};}
}
