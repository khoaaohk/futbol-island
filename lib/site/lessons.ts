import fs from 'node:fs';
import path from 'node:path';
import {LESSON_TABLE} from '@/lib/analytics/learningIds.generated';
import paths from '@/lib/paths/formatPaths.json';
/**
 * The lessons as plain reading pages (/learn, /learn/<id>): read-only views of public/lessons/*.json, the same files the game
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
export const lessonPath=(id:string)=>`/learn/${id}`;
