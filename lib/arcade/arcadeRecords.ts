export type ArcadeRecord={best:number;unlocked:number};
const key=(game:string)=>`fi2-arcade-record-${game}-v1`;
export function readArcadeRecord(game:string):ArcadeRecord{
 try{const value=JSON.parse(localStorage.getItem(key(game))??'{}');return{best:Number.isFinite(value.best)?Math.max(0,Math.floor(value.best)):0,unlocked:Number.isFinite(value.unlocked)?Math.max(1,Math.min(6,Math.floor(value.unlocked))):1};}catch{return{best:0,unlocked:1};}
}
export function saveArcadeRecord(game:string,best:number,unlocked=1){
 const previous=readArcadeRecord(game),next={best:Math.max(previous.best,Number.isFinite(best)?best:0),unlocked:Math.max(previous.unlocked,Math.min(6,unlocked))};
 try{localStorage.setItem(key(game),JSON.stringify(next));}catch{}return next;
}
