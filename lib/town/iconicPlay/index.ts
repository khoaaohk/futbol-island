import plays from '@/lib/town/iconicPlays.json';
import {ATTACK_TEMPLATES} from './attack';
import {CREATOR_TEMPLATES} from './creator';
import {DEFENCE_TEMPLATES} from './defence';
import type {Field,Play,PlayEntry,Template,TemplateId} from './types';
export type {Play,PlayEntry} from './types';

const TEMPLATES:Partial<Record<TemplateId,Template>>={...ATTACK_TEMPLATES,...CREATOR_TEMPLATES,...DEFENCE_TEMPLATES};
const ENTRIES=plays as unknown as Record<string,PlayEntry>;
/** Fallback when a player has no authored play: a role-typical signature so every card can play something. */
function roleEntry(role:string,futsal:boolean):PlayEntry{
 const r=role.toLowerCase();
 if(/keeper|goleiro|goalkeeper/.test(r))return {kind:'signature',title:'Signature: the reaction save',template:'save',lesson:'Stay on your toes and push off towards the ball, not after it.'};
 if(/back|defend|fixo|centre-back|center back/.test(r))return {kind:'signature',title:'Signature: winning the header',template:'aerial_clearance',lesson:'Watch the ball, attack it at its highest point and head it high and wide.'};
 if(/wing|ala|winger/.test(r))return {kind:'signature',title:'Signature: beat your defender',template:'skill_move',params:{trick:'stepover'},lesson:'Sell the fake with your hips, then burst away in the other direction.'};
 if(/mid/.test(r))return {kind:'signature',title:'Signature: the killer pass',template:'through_ball_assist',lesson:'Look up before the ball arrives so you already know where the pass goes.'};
 return {kind:'signature',title:futsal?'Signature: the pivot turn and finish':'Signature: the solo run',template:futsal?'skill_move':'solo_dribble_goal',params:futsal?{trick:'drag_back'}:{beaten:2},lesson:'Small touches keep the ball close so you can change direction quickly.'};
}
const seedOf=(name:string)=>{let h=2166136261;for(let i=0;i<name.length;i++){h^=name.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
/** The play for a player card: their authored iconic play, or a role-typical signature. */
export function playFor(name:string,role:string,format:string):{entry:PlayEntry;play:Play}{
 const futsal=format==='futsal',field:Field=futsal?'court':'pitch';
 let entry=ENTRIES[name];if(!entry||typeof entry!=='object'||!TEMPLATES[entry.template])entry=roleEntry(role,futsal);
 const template=TEMPLATES[entry.template]??TEMPLATES.solo_dribble_goal!;
 return {entry,play:template(entry.params??{},seedOf(name),field)};
}
