/**
 * No-account connections (docs/idp/DESIGN.md §4): a goal or a week's plan travels inside a link's #fragment, which browsers
 * never send to a server, so nothing about a child is stored or logged anywhere by sharing it.
 *
 *  - Coach goal  /plan#c=1~<goal>[+<goal>]~q<cue>~p<play>~t~k<check>
 *      A coach makes a QR for one player or the whole team ("t"). The player scans it on their own device and taps
 *      "Add to my plan". It holds catalogue ids only: goal ids, a cue index (0–2) and an optional Coaches Board play id.
 *  - Week plan   /plan#p=1~<format>~<goal>[+<goal>]~m<missions this week>~c<check-ins>~s<sticker>[+…]~f<feel>~h~r<review day>~k<check>
 *      The fridge card's QR: a grown-up scans it and reads the week's story on their own phone. Catalogue ids and small
 *      counts only: no name, no notes, no dates beyond the review day.
 * The check is a short FNV-1a of the body, to catch a mangled link (it is not a signature: everything here is public data).
 */
import type {Format} from '../../town/venues';
import {goalById} from '../idp';
import {FEELS,STICKERS,type FeelId,type StickerId} from './skills';

export const SHARE_VERSION='1';
const SEP='~',LIST='+';
const PLAY_ID=/^[a-z0-9][a-z0-9-]{0,31}$/;
const FORMATS:Format[]=['7v7','9v9','11v11','futsal'];
export function shareCheck(body:string){let h=0x811c9dc5;for(let i=0;i<body.length;i++){h^=body.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return (h%46656).toString(36).padStart(3,'0');}
const seal=(parts:string[])=>{const body=parts.join(SEP);return `${body}${SEP}k${shareCheck(body)}`;};
function open(raw:string):string[]|null{
 const s=decodeURIComponent(raw.trim());const i=s.lastIndexOf(SEP+'k');if(i<0)return null;
 const body=s.slice(0,i),check=s.slice(i+2);if(shareCheck(body)!==check)return null;
 const parts=body.split(SEP);return parts[0]===SHARE_VERSION?parts:null;
}

export type CoachGoalShare={goals:string[];cue?:number;play?:string;team?:boolean};
export function encodeCoachGoal(c:CoachGoalShare):string{
 const goals=[...new Set(c.goals)].filter(id=>goalById(id)).slice(0,2);if(!goals.length)throw Error('no goal');
 const parts=[SHARE_VERSION,goals.join(LIST)];
 if(Number.isInteger(c.cue)&&c.cue!>=0&&c.cue!<3)parts.push('q'+c.cue);
 if(c.play&&PLAY_ID.test(c.play))parts.push('p'+c.play);
 if(c.team)parts.push('t');
 return seal(parts);
}
export function decodeCoachGoal(raw:string):CoachGoalShare|null{
 const parts=open(raw);if(!parts||parts.length<2)return null;
 const goals=parts[1].split(LIST).filter(id=>goalById(id));if(!goals.length||goals.length>2)return null;
 const fmt=goalById(goals[0])!.format;if(goals.some(id=>goalById(id)!.format!==fmt))return null;
 const out:CoachGoalShare={goals};
 for(const p of parts.slice(2)){
  if(/^q[0-2]$/.test(p))out.cue=Number(p[1]);
  else if(p[0]==='p'&&PLAY_ID.test(p.slice(1)))out.play=p.slice(1);
  else if(p==='t')out.team=true;
  else return null;
 }
 return out;
}

export type WeekShare={format:Format;goals:string[];missions:number;checkins:number;stickers:StickerId[];feel?:FeelId;help?:boolean;reviewDay?:number};
const clampCount=(n:number)=>Math.max(0,Math.min(99,Math.floor(n)||0));
export function encodeWeek(w:WeekShare):string{
 const goals=w.goals.filter(id=>goalById(id)).slice(0,2);
 const parts=[SHARE_VERSION,w.format,goals.join(LIST)||'-','m'+clampCount(w.missions),'c'+clampCount(w.checkins)];
 const st=w.stickers.filter(s=>s in STICKERS).slice(-3);if(st.length)parts.push('s'+st.join(LIST));
 if(w.feel&&w.feel in FEELS)parts.push('f'+w.feel);
 if(w.help)parts.push('h');
 if(w.reviewDay&&Number.isInteger(w.reviewDay)&&w.reviewDay>0)parts.push('r'+w.reviewDay);
 return seal(parts);
}
export function decodeWeek(raw:string):WeekShare|null{
 const parts=open(raw);if(!parts||parts.length<5)return null;
 const format=parts[1] as Format;if(!FORMATS.includes(format))return null;
 const goals=parts[2]==='-'?[]:parts[2].split(LIST);if(goals.length>2||goals.some(id=>goalById(id)?.format!==format))return null;
 const m=/^m(\d{1,2})$/.exec(parts[3]),c=/^c(\d{1,2})$/.exec(parts[4]);if(!m||!c)return null;
 const out:WeekShare={format,goals,missions:Number(m[1]),checkins:Number(c[1]),stickers:[]};
 for(const p of parts.slice(5)){
  if(p[0]==='s'){const st=p.slice(1).split(LIST);if(st.length>3||st.some(s=>!(s in STICKERS)))return null;out.stickers=st as StickerId[];}
  else if(p[0]==='f'&&p.slice(1) in FEELS)out.feel=p.slice(1) as FeelId;
  else if(p==='h')out.help=true;
  else if(/^r\d{1,6}$/.test(p))out.reviewDay=Number(p.slice(1));
  else return null;
 }
 return out;
}
/** Days since 1970 (UTC): a review date small enough for a QR, with no time of day. */
export const dayNumber=(at:number)=>Math.floor(at/864e5);
export const fromDayNumber=(d:number)=>d*864e5;

export const PLAN_PATH='/plan';
export const coachGoalUrl=(origin:string,c:CoachGoalShare)=>`${origin}${PLAN_PATH}#c=${encodeCoachGoal(c)}`;
export const weekUrl=(origin:string,w:WeekShare)=>`${origin}${PLAN_PATH}#p=${encodeWeek(w)}`;
/** Reads a /plan fragment. */
export function readFragment(hash:string):{kind:'coach';share:CoachGoalShare}|{kind:'week';share:WeekShare}|{kind:'bad'}|{kind:'none'}{
 const h=hash.replace(/^#/,'');if(!h)return {kind:'none'};
 if(h.startsWith('c=')){const s=decodeCoachGoal(h.slice(2));return s?{kind:'coach',share:s}:{kind:'bad'};}
 if(h.startsWith('p=')){const s=decodeWeek(h.slice(2));return s?{kind:'week',share:s}:{kind:'bad'};}
 return {kind:'bad'};
}
