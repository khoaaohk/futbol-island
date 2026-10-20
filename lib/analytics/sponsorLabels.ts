/**
 * SERVER ONLY (lib/analytics/report.ts): names for the sponsor Overview's drill-down items (lib/analytics/sponsor.ts). The
 * browser only ever sends fixed keys (a lesson id, a book key, a binder number); the words are looked up here, like the
 * learning section's question text (learningText.generated.ts).
 */
import {LESSON_TEXT} from './learningText.generated';
import {PLAYER_BOOKS} from '../books/catalog';
import {ALL_PLAYERS,cardDisplayName} from '../town/cardCollection';

let lessons:Map<string,string>|null=null;
export const sponsorLabels={
 lesson:(id:string)=>{lessons??=new Map(LESSON_TEXT.map(([,lid,name])=>[lid,name]));return lessons.get(id);},
 book:(key:string)=>(PLAYER_BOOKS as Record<string,{title:string}>)[key]?.title,
 card:(n:number)=>{const name=ALL_PLAYERS[n-1];return name?cardDisplayName(name):undefined;},
};
