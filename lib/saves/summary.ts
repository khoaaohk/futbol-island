/**
 * A one-line summary of an island for the restore screen and the "Which island do you want?" chooser (doc §3.3, §4.4):
 * "1,240 coins · 36 cards · 12 lessons". Read from raw saved strings (a downloaded snapshot or this device's storage), with
 * the same rules the game uses: coins = the ledger's earned − packs − spends, a lesson counts once every quiz question is
 * right (lib/town/quizProgress.ts passedQuizLessons).
 */
import manifest from '../town/quizManifest.json';
import {walletBalance} from './walletCompact';

export type IslandSummary={coins:number;cards:number;lessons:number};
const json=(raw:string|null|undefined)=>{try{return JSON.parse(raw??'null');}catch{return null;}};
export function summarise(keys:Record<string,string|null|undefined>):IslandSummary{
 const cards=json(keys['fi2-player-cards-v1']);
 const answers=json(keys['futbol-island-quiz-progress-v1']);const done=new Set(Array.isArray(answers)?answers.filter((a:unknown)=>typeof a==='string'):[]);
 let lessons=0;
 for(const [format,ls] of Object.entries(manifest as Record<string,Record<string,number>>))for(const [id,count] of Object.entries(ls))
  if(count>0&&Array.from({length:count},(_,i)=>done.has(`${format}:${id}:${i}`)).every(Boolean))lessons++;
 return {coins:walletBalance(keys['fi2-arcade-wallet-v1']),cards:Array.isArray(cards)?new Set(cards.filter((c:unknown)=>typeof c==='string')).size:0,lessons};
}
const plural=(n:number,one:string)=>`${n.toLocaleString('en-US')} ${one}${n===1?'':'s'}`;
export const summaryLine=(s:IslandSummary)=>`${plural(s.coins,'coin')} · ${plural(s.cards,'card')} · ${plural(s.lessons,'lesson')}`;
