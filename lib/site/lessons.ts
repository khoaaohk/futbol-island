import fs from 'node:fs';
import path from 'node:path';
import {LESSON_TABLE} from '@/lib/analytics/learningIds.generated';
import paths from '@/lib/paths/formatPaths.json';
import {firstSentence} from './seo';
/**
 * The lessons as plain reading pages (/learn/lessons, /learn/lessons/<id>): read-only views of public/lessons/*.json, the same files the game
 * plays. Only the words are kept: title, format, concept, the coach's step text, and each quiz question with its options,
 * right answer and explanation. Order and count follow LESSON_TABLE (scripts/gen-learning-ids.cjs).
 * Nov 23 2026 (owner: "i thought these questions were going to be interactive?"): the page now plays the quiz in place
 * (components/site/quiz/QuizPlay), so the right answer ships with each question. The old "never give it away" rule is overruled.
 * Options sit in a fixed, hashed order per question (the data keeps the right answer first in about four questions in ten); the
 * game's "Put ... in order" questions (visual.kind 'order', options stored in their right order) become kind 'order': the
 * child taps the steps first to last, and `seq` holds the right order. `perm` maps each shown option to its place in the
 * English A-Z list, the order the Spanish words are written in (lib/i18n/es/lessons), so both languages share one answer.
 */
type RawQuestion={q?:string;options?:string[];explain?:string;correct?:number;visual?:{kind?:string}};
type RawLesson={id:string;name:string;fmt:string;category?:string;difficulty?:string;concept?:string;desc?:string;steps?:{desc?:string}[];questions?:RawQuestion[]};
export type SiteQuestion={kind:'choice'|'truefalse'|'order';q:string;options:string[];correct:number;seq?:number[];perm:number[];explain:string};
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
/** The game's explanations open with a verdict for the tapped answer ("Right.", "Yes."). The quiz widget shows its own verdict
 *  (and the answer key marks the right option), so the opener goes. */
export const VERDICT_OPENER=/^(?:(?:right|yes|no|correct|exactly|true|false|that(?:’|')s right|that(?:’|')s it|good|great|nice|spot on)[.!,:]\s*)+/i;
const neutral=(s:string)=>{const t=s.replace(VERDICT_OPENER,'');return t?t[0].toUpperCase()+t.slice(1):s;};
const hash=(s:string)=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;};/* as lib/site/quizzes.ts */
/** One lesson question for the page: options in their shown order, the right answer (or order) as shown-option indices. */
export function siteQuestion(seed:string,q:RawQuestion):SiteQuestion{
 const raw=(q.options??[]).map(clean),n=raw.length,az=raw.map((_,i)=>i).sort((a,b)=>raw[a].localeCompare(raw[b],'en'));/* az[k] = raw index of A-Z place k */
 const azOf=(r:number)=>az.indexOf(r),rc=Number.isInteger(q.correct)&&q.correct!>=0&&q.correct!<n?q.correct!:0;
 const tf=n===2&&/^false$/i.test(raw[az[0]])&&/^true$/i.test(raw[az[1]]);
 const kind:SiteQuestion['kind']=q.visual?.kind==='order'&&n>2?'order':tf?'truefalse':'choice';
 let perm:number[];/* perm[shown] = A-Z place */
 if(kind==='truefalse')perm=[1,0];/* True, then False */
 else if(kind==='order'){/* A-Z, turned until it is not already the right order */
  const right=raw.map((_,r)=>azOf(r));perm=az.map((_,k)=>k);let t=hash(seed)%n;
  for(let k=0;k<n;k++,t++){const p=perm.map((_,j)=>(j+t)%n);if(p.some((x,j)=>x!==right[j])){perm=p;break;}}}
 else{const right=azOf(rc),wrong=az.map((_,k)=>k).filter(k=>k!==right),at=hash(seed)%n;wrong.splice(at,0,right);perm=wrong;}
 const shown=(k:number)=>perm.indexOf(k);
 const seq=kind==='order'?raw.map((_,r)=>shown(azOf(r))):undefined;
 return {kind,q:clean(q.q),options:perm.map(k=>raw[az[k]]),correct:seq?seq[0]:shown(azOf(rc)),...(seq?{seq}:{}),perm,explain:neutral(clean(q.explain))};
}
export const LESSONS:SiteLesson[]=LESSON_TABLE.map(([format,id])=>{
 const l=RAW.get(id);if(!l)throw new Error(`lesson ${id} missing from public/lessons`);
 const steps:string[]=[];for(const s of l.steps??[]){const t=clean(s.desc);if(t&&steps[steps.length-1]!==t)steps.push(t);}
 return {id,title:clean(l.name),format,formatLabel:FORMAT_LABEL[format]??format,chapter:CHAPTER.get(id),category:l.category,difficulty:l.difficulty,
  concept:clean(l.concept||l.desc),steps,
  questions:(l.questions??[]).filter(q=>clean(q.q)).map((q,i)=>siteQuestion(`${id}#${i}`,q))};
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
/** The concept's first sentence, then what the page is; cut back to <= 155 characters by dropping the tail first.
 *  Nov 20 2026 (SEO leftovers): a short concept left 14 descriptions under 120 characters. Those now get a fuller tail built from
 *  the lesson's own fields (how many coach steps and quiz questions, its level, its topic), the fullest form that fits 155. */
type DescLesson={concept:string;formatLabel:string;steps?:readonly unknown[];questions?:readonly unknown[];difficulty?:string;category?:string};
export const DESC_MIN=120,DESC_MAX=155;
export const lessonDescription=(l:DescLesson)=>{const c=firstSentence(l.concept,120),f=l.formatLabel;
 const d=[`${c} A free ${formatPhrase(f)} lesson and quiz for kids. No ads.`,`${c} A free ${formatPhrase(f)} lesson and quiz for kids.`,`${c} Free ${f} lesson and quiz for kids.`,c].find(x=>x.length<=DESC_MAX)??c.slice(0,DESC_MAX);
 if(d.length>=DESC_MIN)return d;
 const whole=firstSentence(l.concept,DESC_MAX);if(c.endsWith('…')&&!whole.endsWith('…')&&whole.length>=DESC_MIN)return whole;/* a long first sentence, uncut, is a full description */
 const s=l.steps?.length??0,q=l.questions?.length??0,n=(k:number,w:string)=>`${k} ${w}${k===1?'':'s'}`;
 const what=s>0&&q>0?`${c} A free ${formatPhrase(f)} lesson for kids with ${n(s,'coach step')} and ${n(q,'quiz question')}.`:`${c} A free ${formatPhrase(f)} lesson and quiz for kids.`;
 const level=l.difficulty?` Level: ${l.difficulty.toLowerCase()}.`:'',topic=l.category?` Topic: ${l.category.toLowerCase()}.`:'';
 return [`${what}${level}${topic} No ads.`,`${what}${level} No ads.`,`${what}${topic} No ads.`,`${what} No ads.`,what,`${c} A free ${f} lesson for kids with ${n(s,'step')} and ${n(q,'quiz question')}. No ads.`].find(x=>x.length>=DESC_MIN&&x.length<=DESC_MAX)??d;};
