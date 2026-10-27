export type ArcadeRecord={best:number;unlocked:number};
const key=(game:string)=>`fi2-arcade-record-${game}-v1`;
/** Highest unlockable stop per game. Futbol Tennis grew to 9 courts (3 HARD courts, round 3, Oct 26 2026):
 * same save key and shape, old saves (≤6) read unchanged. Every other game keeps 6. */
export const arcadeUnlockCap=(game:string)=>game==='tennis'?9:6;
export function readArcadeRecord(game:string):ArcadeRecord{
 const cap=arcadeUnlockCap(game);
 try{const value=JSON.parse(localStorage.getItem(key(game))??'{}');return{best:Number.isFinite(value.best)?Math.max(0,Math.floor(value.best)):0,unlocked:Number.isFinite(value.unlocked)?Math.max(1,Math.min(cap,Math.floor(value.unlocked))):1};}catch{return{best:0,unlocked:1};}
}
export function saveArcadeRecord(game:string,best:number,unlocked=1){
 const previous=readArcadeRecord(game),next={best:Math.max(previous.best,Number.isFinite(best)?best:0),unlocked:Math.max(previous.unlocked,Math.min(arcadeUnlockCap(game),unlocked))};
 try{localStorage.setItem(key(game),JSON.stringify(next));}catch{}return next;
}
