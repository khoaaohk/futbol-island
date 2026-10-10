/**
 * The ONE shared contract between the IDP and the Coaches Board (docs/idp/BOARD-LINK.md). The board is being rebuilt by
 * another agent; the IDP never imports board code, and the board never needs to import IDP code beyond this file.
 *
 *  - A board play has a stable id matching BOARD_PLAY_ID (lowercase letters, digits, dashes; max 32). The IDP stores only that
 *    id on a goal (PlanGoal.play) and inside a coach's goal QR (`p<id>`), so the id must never be reused for a different play.
 *  - To show a linked play, the IDP dispatches BOARD_OPEN_PLAY with {id} (and closes its own dialog). The board, when it is
 *    rebuilt, listens for it, opens the Coaches Board and shows that play (or its list, if the id is unknown).
 *  - Optionally the board can register titles so the IDP can name a play: window[BOARD_PLAYS_GLOBAL] = () => BoardPlayRef[].
 *    Without it the IDP says "Your coach's play" and still links by id.
 *  - When a coach saves a play on the board, the board may dispatch BOARD_LINK_PLAY with {id,title,goalId?}; the IDP's coach
 *    tools pick it up (only while open) as the play to attach to the next goal QR.
 */
export const BOARD_PLAY_ID=/^[a-z0-9][a-z0-9-]{0,31}$/;
export type BoardPlayRef={id:string;title:string;format?:'7v7'|'9v9'|'11v11'|'futsal';
 /** Optional IDP skill family the play teaches (lib/coaches/idp.ts SkillId), so the IDP can suggest it for a goal. */
 skill?:string};
export const BOARD_OPEN_PLAY='fi2-board-open-play';
export const BOARD_LINK_PLAY='fi2-board-link-play';
export const BOARD_PLAYS_GLOBAL='__fiBoardPlays';
export const isBoardPlayId=(id:unknown):id is string=>typeof id==='string'&&BOARD_PLAY_ID.test(id);
/** The board's registered plays, when the rebuilt board provides them (never throws). */
export function boardPlays():BoardPlayRef[]{
 try{const f=(window as unknown as Record<string,unknown>)[BOARD_PLAYS_GLOBAL];const list=typeof f==='function'?(f as ()=>unknown)():[];
  return Array.isArray(list)?list.filter((p):p is BoardPlayRef=>!!p&&typeof p==='object'&&isBoardPlayId((p as BoardPlayRef).id)&&typeof (p as BoardPlayRef).title==='string').map(p=>({...p,title:p.title.slice(0,48)})):[];}
 catch{return [];}
}
export function openBoardPlay(id:string){if(isBoardPlayId(id))window.dispatchEvent(new CustomEvent(BOARD_OPEN_PLAY,{detail:{id}}));}
