import library from './playerHighlightLibrary.json';
import players from './positionPlayers.json';
import type {IslandClip,IslandClipFeed} from './islandClips';
export const VIDEO_PLAYERS=new Set(Object.values(players).flatMap(role=>[...role.current,...role.allTime]));
const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const allNames=[...VIDEO_PLAYERS].map(normalize);
export function isPlayerHighlight(clip:IslandClip,name:string){
 const full=normalize(name),parts=full.split(' '),last=parts[parts.length-1];
 const aliases=[full];
 // Only use a surname if it cannot confuse two players (not Ronaldo, Silva, etc.).
 if(parts.length>1&&last.length>=5&&allNames.filter(n=>n.split(' ').pop()===last).length===1)aliases.push(last);
 const title=' '+normalize(clip.title)+' ';
 return aliases.some(alias=>title.includes(' '+alias+' '))&&/\b(highlights?|goals?|skills?|saves?|assists?|dribbl\w*|tackles?|best|top|greatest|compilation)\b/i.test(clip.title)&&! /\b(interview|reacts?|debate|transfer|rumou?r)\b/i.test(clip.title);
}
/** Preverified static catalog: no API key, browsing, polling or network search at runtime. */
export async function getPlayerClips(name:string):Promise<IslandClipFeed>{
 if(!VIDEO_PLAYERS.has(name))return {items:[],unavailable:true};
 const items=((library as Record<string,IslandClip[]>)[name]??[]);
 return {items:[...items].sort((a,b)=>Number((b.durationSeconds??0)>=240)-Number((a.durationSeconds??0)>=240)||b.views-a.views||(b.durationSeconds??0)-(a.durationSeconds??0)),unavailable:false};
}
