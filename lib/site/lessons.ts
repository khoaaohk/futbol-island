import fs from 'node:fs';
import path from 'node:path';
import {LESSON_TABLE} from '@/lib/analytics/learningIds.generated';
import paths from '@/lib/paths/formatPaths.json';
import {firstSentence} from './seo';
/**
 * The lessons as plain reading pages (/learn/lessons, /learn/lessons/<id>): read-only views of public/lessons/*.json, the same files the game
 * plays. Only the words are kept: title, format, concept, the coach's step text, and each quiz question with its options and
 * explanation. The correct-answer index (`correct`) and the tap-spot flags are deliberately dropped, so a page never gives a
 * quiz away. Order and count follow LESSON_TABLE (scripts/gen-learning-ids.cjs).
 */
type RawQuestion={q?:string;options?:string[];explain?:string};
type RawLesson={id:string;name:string;fmt:string;category?:string;difficulty?:string;concept?:string;desc?:string;steps?:{desc?:string}[];questions?:RawQuestion[]};
export type SiteQuestion={q:string;options:string[];explain:string};
export type SiteLesson={id:string;title:string;format:string;formatLabel:string;chapter?:string;category?:string;difficulty?:string;concept:string;steps:string[];questions:SiteQuestion[]};
export const FORMAT_LABEL:Record<string,string>={'7v7':'7v7','9v9':'9v9','11v11':'11v11',futsal:'Futsal'};
export const FORMAT_ORDER=['7v7','9v9','11v11','futsal'] as const;
/** Read at build time (the pages are prerendered; dynamicParams=false, so nothing reads them per request). Not `import`ed: the
 *  3 MB of lesson JSON as typed modules ran Next's type check out of memory. */
const read=(f:string)=>JSON.parse(fs.readFileSync(path.join(process.cwd(),'public/lessons',f+'.json'),'utf8')) as RawLesson[];
const RAW=new Map<string,RawLesson>(['7v7','9v9','11v11','futsal'].flatMap(read).map(l=>[l.id,l]));
const CHAPTER=new Map<string,string>();
for(const p of paths as {chapters:{title:string;lessons:{id:string}[]}[]}[])for(const c of p.chapters)for(const l of c.lessons)if(!CHAPTER.has(l.id))CHAPTER.set(l.id,c.title);
const clean=(s:unknown)=>typeof s==='string'?s.replace(/\s+/g,' ').trim():'';
/** The game's explanations open with a verdict for the tapped answer ("Right.", "Yes."); on a page that would give the
 *  answer away before the reader thinks, so the opener goes. Options are listed A–Z for the same reason (the data keeps the
 *  right answer first in about four questions in ten, and an order question's options in their right order). */
export const VERDICT_OPENER=/^(?:(?:right|yes|no|correct|exactly|true|false|that(?:’|')s right|that(?:’|')s it|good|great|nice|spot on)[.!,:]\s*)+/i;
const neutral=(s:string)=>{const t=s.replace(VERDICT_OPENER,'');return t?t[0].toUpperCase()+t.slice(1):s;};
export const LESSONS:SiteLesson[]=LESSON_TABLE.map(([format,id])=>{
 const l=RAW.get(id);if(!l)throw new Error(`lesson ${id} missing from public/lessons`);
 const steps:string[]=[];for(const s of l.steps??[]){const t=clean(s.desc);if(t&&steps[steps.length-1]!==t)steps.push(t);}
 return {id,title:clean(l.name),format,formatLabel:FORMAT_LABEL[format]??format,chapter:CHAPTER.get(id),category:l.category,difficulty:l.difficulty,
  concept:clean(l.concept||l.desc),steps,
  questions:(l.questions??[]).filter(q=>clean(q.q)).map(q=>({q:clean(q.q),options:(q.options??[]).map(clean).sort((a,b)=>a.localeCompare(b,'en')),explain:neutral(clean(q.explain))}))};
});
export const lessonById=(id:string)=>LESSONS.find(l=>l.id===id);
export const lessonPath=(id:string)=>`/learn/lessons/${id}`;
/** The lesson index (Nov 2 2026: moved from /learn, which is now the feature tour; old /learn/<id> URLs redirect, next.config.mjs). */
export const LESSONS_INDEX='/learn/lessons';

/** Nov 8 2026 (SEO): "{title}: {format} Football Lesson and Quiz for Kids", the longest form that fits 60 characters. */
/** "7v7 football (soccer)" / "futsal": how a lesson's format reads in a sentence. */
export const formatPhrase=(f:string)=>f==='Futsal'?'futsal':`${f} football (soccer)`;
export const lessonTitle=(l:{title:string;formatLabel:string})=>{const f=l.formatLabel,k=f==='Futsal'?'Futsal':`${f} Football`;
 return [`${l.title}: ${k} Lesson and Quiz for Kids`,`${l.title}: ${f} Lesson and Quiz for Kids`,`${l.title}: ${f} Football Quiz for Kids`,`${l.title} (${f} Lesson and Quiz)`,`${l.title} (${f} lesson)`].find(t=>t.length<=60)??l.title;};
/** The concept's first sentence, then what the page is; cut back to <= 155 characters by dropping the tail first. */
export const lessonDescription=(l:{concept:string;formatLabel:string})=>{const c=firstSentence(l.concept,120),f=l.formatLabel;
 return [`${c} A free ${formatPhrase(f)} lesson and quiz for kids. No ads.`,`${c} A free ${formatPhrase(f)} lesson and quiz for kids.`,`${c} Free ${f} lesson and quiz for kids.`,c].find(d=>d.length<=155)??c.slice(0,155);};
