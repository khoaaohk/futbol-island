/**
 * Endgame (Lane 2, Sep 30 2026; docs/endgame-2026-09-30.md). Pure graduation model: no storage, no React, no heavy imports, so
 * customization.ts, the backpack model and the tests can read it cheaply.
 *
 * A format GRADUATES when its 12 starter lessons are complete (the same "complete" rule as the Paths screen, card tiers and
 * ride unlocks: lessonEvidence). A graduation is saved once with its date and never removed, so later changes to the lesson
 * list or a cleared quiz key can never take a certificate away. `seen` records whether the ceremony was shown, which is what
 * makes the ceremony fire exactly once per format, including retroactively for players who finished paths before this update.
 *
 * The Matchday Ferry finale opens when all four formats have graduated (the audit's "4/4 paths"; the ball hunt is not required).
 */
export const GRADUATION_FORMATS=['futsal','7v7','9v9','11v11'] as const;
export type GradFormat=typeof GRADUATION_FORMATS[number];
export const GRAD_TITLES:Record<GradFormat,string>={futsal:'Futsal','7v7':'7v7','9v9':'9v9','11v11':'11v11'};
/** Suggested next format after each graduation: the main 7v7 → 9v9 → 11v11 track, futsal as the court detour. */
export const NEXT_FORMAT:Record<GradFormat,GradFormat[]>={'7v7':['9v9','11v11','futsal'],'9v9':['11v11','futsal','7v7'],'11v11':['futsal','7v7','9v9'],futsal:['7v7','9v9','11v11']};
export type GraduationEntry={at:number;seen:boolean};
export type FinaleEntry={at:number;firstTry:number;total:number;runs:number;seen:boolean};
export type GraduationRecord={version:1;formats:Partial<Record<GradFormat,GraduationEntry>>;finale:FinaleEntry|null};
export const GRADUATION_VERSION=1;
export const emptyGraduations=():GraduationRecord=>({version:1,formats:{},finale:null});
const isFormat=(v:unknown):v is GradFormat=>typeof v==='string'&&(GRADUATION_FORMATS as readonly string[]).includes(v);
const time=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)&&n>0?Math.floor(n):0;};
const count=(v:unknown,max=999)=>{const n=Number(v);return Number.isFinite(n)&&n>=0?Math.min(max,Math.floor(n)):0;};

/** Defensive parse. Tolerates missing fields, junk and future versions (keeps what it understands), never throws. */
export function sanitizeGraduations(raw:unknown):GraduationRecord{
 const out=emptyGraduations();if(!raw||typeof raw!=='object')return out;
 const v=raw as {formats?:unknown;finale?:unknown};
 if(v.formats&&typeof v.formats==='object')for(const [key,entry] of Object.entries(v.formats as Record<string,unknown>)){
  if(!isFormat(key)||!entry||typeof entry!=='object')continue;const e=entry as {at?:unknown;seen?:unknown};const at=time(e.at);
  if(at)out.formats[key]={at,seen:e.seen===true};
 }
 const f=v.finale as Partial<FinaleEntry>|null|undefined;
 if(f&&typeof f==='object'&&time(f.at)){const total=count(f.total,99);out.finale={at:time(f.at),total,firstTry:Math.min(total,count(f.firstTry,99)),runs:Math.max(1,count(f.runs)),seen:f.seen===true};}
 return out;
}
export const isGraduated=(record:GraduationRecord,format:GradFormat)=>!!record.formats[format];
export const graduatedFormats=(record:GraduationRecord)=>GRADUATION_FORMATS.filter(f=>record.formats[f]);
/** The Matchday Ferry finale is open once every format has graduated. */
export const ferryUnlocked=(record:GraduationRecord)=>GRADUATION_FORMATS.every(f=>record.formats[f]);
export const finaleComplete=(record:GraduationRecord)=>!!record.finale;
/** Formats that graduated but whose ceremony has not been shown yet (oldest first). */
export const unseenGraduations=(record:GraduationRecord)=>graduatedFormats(record).filter(f=>!record.formats[f]!.seen).sort((a,b)=>record.formats[a]!.at-record.formats[b]!.at||GRADUATION_FORMATS.indexOf(a)-GRADUATION_FORMATS.indexOf(b));

/**
 * Adds a graduation for every finished format not yet saved. Never removes one. Returns the same object when nothing changed
 * (callers skip the write), plus the formats added now. Retroactive: a save that already finished paths gets them on first load.
 */
export function mergeFinished(record:GraduationRecord,finished:readonly string[],now:number):{record:GraduationRecord;added:GradFormat[]}{
 const added=finished.filter(isFormat).filter(f=>!record.formats[f]);
 if(!added.length)return {record,added:[]};
 const formats={...record.formats};for(const f of added)formats[f]={at:now,seen:false};
 return {record:{...record,formats},added:[...new Set(added)]};
}
export function markGraduationsSeen(record:GraduationRecord,formats:readonly GradFormat[]):GraduationRecord{
 const todo=formats.filter(f=>record.formats[f]&&!record.formats[f]!.seen);if(!todo.length)return record;
 const next={...record.formats};for(const f of todo)next[f]={...next[f]!,seen:true};
 return {...record,formats:next};
}
/**
 * Saves a finished Matchday finale. Only possible once the ferry is open. The first finish keeps its date; later rides add a
 * run and keep the best first-try score (the diploma never gets worse).
 */
export function recordFinale(record:GraduationRecord,result:{firstTry:number;total:number},now:number):GraduationRecord{
 if(!ferryUnlocked(record))return record;
 const total=count(result.total,99),firstTry=Math.min(total,count(result.firstTry,99)),prev=record.finale;
 if(!prev)return {...record,finale:{at:now,firstTry,total,runs:1,seen:false}};
 const better=firstTry/Math.max(1,total)>prev.firstTry/Math.max(1,prev.total);
 return {...record,finale:{...prev,runs:prev.runs+1,...(better?{firstTry,total}:{})}};
}
export const markFinaleSeen=(record:GraduationRecord)=>record.finale&&!record.finale.seen?{...record,finale:{...record.finale,seen:true}}:record;

/** The graduation cap colours (Make it yours → Headwear colour), one per format plus the finale's champion gold. */
export type CapReward=GradFormat|'finale';
export const CAP_REWARDS:{id:string;graduate:CapReward;label:string;color:string;color2:string;why:string}[]=[
 {id:'grad-futsal',graduate:'futsal',label:'Futsal Graduate',color:'#1f9aa6',color2:'#f7cb69',why:'The teal of the Palm Coast rooftop court, where you learned futsal.'},
 {id:'grad-7v7',graduate:'7v7',label:'7v7 Graduate',color:'#3d8f4f',color2:'#fff2b9',why:'The green of Old Town Ground, the island’s 7v7 pitch.'},
 {id:'grad-9v9',graduate:'9v9',label:'9v9 Graduate',color:'#ee7d22',color2:'#23315e',why:'The orange of the Club Grounds, home of 9v9.'},
 {id:'grad-11v11',graduate:'11v11',label:'11v11 Graduate',color:'#23407e',color2:'#f7cb69',why:'The navy of Eleven Park, the full-size 11v11 pitch.'},
 {id:'grad-champion',graduate:'finale',label:'Matchday Champion',color:'#f2bb45',color2:'#c8443c',why:'Champion gold, for finishing the Matchday Ferry final.'},
];
export const capRewardFor=(key:CapReward)=>CAP_REWARDS.find(c=>c.graduate===key)!;
export const capEarned=(record:GraduationRecord,key:CapReward)=>key==='finale'?finaleComplete(record):isGraduated(record,key);
export const capLockNote=(key:CapReward)=>key==='finale'?'Finish the Matchday Ferry final to wear it':`Graduate the ${GRAD_TITLES[key]} path to wear it`;
