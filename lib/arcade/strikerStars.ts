/** Island Strikers mastery stars: best stars per round (0..3), kept on this device. No streaks, no timers. */
const KEY='fi2-strikers-stars-v1';
export const STRIKER_STAR_ROUNDS=4;
export function readStrikerStars():number[]{
 try{const value=JSON.parse(localStorage.getItem(KEY)??'[]');return Array.from({length:STRIKER_STAR_ROUNDS},(_,i)=>{const n=Number(Array.isArray(value)?value[i]:0);return Number.isFinite(n)?Math.max(0,Math.min(3,Math.floor(n))):0;});}
 catch{return Array(STRIKER_STAR_ROUNDS).fill(0);}
}
/** Keeps the best result for the round; returns the updated list. */
export function saveStrikerStars(level:number,stars:number):number[]{
 const list=readStrikerStars(),i=Math.max(1,Math.min(STRIKER_STAR_ROUNDS,Math.floor(level)))-1;list[i]=Math.max(list[i],Math.max(0,Math.min(3,Math.floor(stars))));
 try{localStorage.setItem(KEY,JSON.stringify(list));}catch{}return list;
}
export const starText=(n:number)=>'★'.repeat(n)+'☆'.repeat(Math.max(0,3-n));
/** Island Cup: three knockout ties (quarter-final, semi-final, final), each with one modifier. Trophies are kept. */
export const STRIKER_CUP=[{name:'Quarter-final',level:2,mods:{rain:true,golden:true},mod:'rain'},{name:'Semi-final',level:3,mods:{small:true,golden:true},mod:'small'},{name:'Final',level:4,mods:{spirit:true,golden:true},mod:'spirit'}] as const;
export const STRIKER_CUP_SECONDS=90;
const CUP_KEY='fi2-strikers-cup-v1',SHAPE_KEY='fi2-strikers-shape-v1';
export function readStrikerCup():{trophies:number;best:number}{try{const v=JSON.parse(localStorage.getItem(CUP_KEY)??'{}');return{trophies:Math.max(0,Math.floor(Number(v.trophies)||0)),best:Math.max(0,Math.min(3,Math.floor(Number(v.best)||0)))};}catch{return{trophies:0,best:0};}}
/** stageReached: 1 QF won, 2 SF won, 3 cup won (adds a trophy). */
export function saveStrikerCup(stageReached:number){const v=readStrikerCup(),next={trophies:v.trophies+(stageReached>=3?1:0),best:Math.max(v.best,Math.min(3,stageReached))};try{localStorage.setItem(CUP_KEY,JSON.stringify(next));}catch{}return next;}
export function readStrikerShape():'balanced'|'wide'|'solid'{try{const v=localStorage.getItem(SHAPE_KEY);return v==='wide'||v==='solid'?v:'balanced';}catch{return 'balanced';}}
export function saveStrikerShape(shape:string){try{localStorage.setItem(SHAPE_KEY,shape);}catch{}}
