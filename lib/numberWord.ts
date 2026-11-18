/**
 * A small whole number as an English word, for copy that counts something the code already knows (Nov 17 2026: the arcade's game
 * count, lib/arcade/arcadeCatalog.ts ARCADE_GAME_COUNT, so "seven games" can never go stale again). Twenty and above stay digits.
 */
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'] as const;
export const numberWord=(n:number):string=>Number.isInteger(n)&&n>=0&&n<WORDS.length?WORDS[n]:String(n);
/** The same word with a capital first letter, for the start of a sentence or a title. */
export const NumberWord=(n:number):string=>{const w=numberWord(n);return w[0].toUpperCase()+w.slice(1);};
