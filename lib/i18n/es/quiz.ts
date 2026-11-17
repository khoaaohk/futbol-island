import type {QuizQuestion} from '@/lib/site/guideQuiz';
import type {EsPosition,EsRule,EsTerm} from './registry';
/**
 * The Spanish end-of-guide quizzes: the same recipe as lib/site/guideQuiz.ts (built only from the page's own checked words, a
 * fixed per-page option order), with Spanish question words. Same hash, so the right answer sits where it does in English.
 */
const hash=(s:string)=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;};
function place(seed:string,q:string,right:string,wrong:readonly string[],explain:string):QuizQuestion{
 const n=wrong.length+1,at=hash(seed+q)%n,options=[...wrong];options.splice(at,0,right);
 if(new Set(options).size!==n)throw new Error(`Spanish quiz "${q}" (${seed}) has two equal options`);
 return {q,options,correct:at,explain};
}
const far=<T,>(list:readonly T[],i:number):[T,T]=>{const n=list.length,a=Math.round(n/3),b=Math.round(2*n/3);return [list[(i+a)%n],list[(i+b)%n]];};
const firstSentence=(s:string)=>(/^.*?[.!?](\s|$)/.exec(s)?.[0]??s).trim();
/** A rules answer: the truth's first sentence, or its first two when the first is a bare "No." (it must read as an answer). */
const lead=(s:string)=>{const a=firstSentence(s);return a.length>=15?a:(a+' '+firstSentence(s.slice(a.length).trim())).trim();};
const unquote=(s:string)=>s.replace(/^[“"]|[”"]$/g,'').trim();
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
const low=(s:string)=>s[0].toLowerCase()+s.slice(1);

/** As the English: each question names the rule (Nov 17 2026). */
const RULE_ASK_ES=['¿cuál de estas es cierta?','¿cuál de estas es correcta?','¿cuál es la regla de verdad?'] as const;
export function ruleQuizEs(r:EsRule):QuizQuestion[]{
 if(r.mixups.length<3)throw new Error(`Spanish rule ${r.slug} needs three mix-ups for its quiz`);
 return r.mixups.slice(0,3).map((m,k)=>place(r.slug+k,`${r.name}: ${RULE_ASK_ES[k]}`,lead(m.truth),[unquote(m.said)],m.truth));
}
export function termQuizEs(t:EsTerm,all:readonly EsTerm[]):QuizQuestion[]{
 const i=all.findIndex(x=>x.slug===t.slug),[a,b]=far(all,i),name=low(t.name);
 const out=[place(t.slug,`¿Qué es: ${name}?`,t.short,[a.short,b.short],t.short)];
 if(t.how.length&&t.mistakes.length>=2)out.push(place(t.slug,`¿Cuál es una buena forma de hacerlo (${name})?`,t.how[0],t.mistakes.slice(0,2),`${t.how[0]} Las otras dos son errores comunes.`));
 const other=t.also?.split(', ')[0];
 if(other)out.push(place(t.slug,`¿Qué otro nombre tiene: ${name}?`,cap(other),[a.name,b.name],`${cap(other)}. ${t.name} también se dice ${t.also}.`));
 else out.push(place(t.slug,`¿Cuál es un error común (${name})?`,t.mistakes[t.mistakes.length-1],t.how.slice(1,3),'Esa está en la lista de errores comunes. Las otras dos son buenos hábitos.'));
 return out;
}
/** `suitsOpen`: the opening the Spanish `suits` lines share (stripped for the options, as the English "It suits"). */
export function positionQuizEs(p:EsPosition,all:readonly EsPosition[],suitsOpen:RegExp):QuizQuestion[]{
 const i=all.findIndex(x=>x.slug===p.slug),[a,b]=far(all,i),the=low(p.name),suits=(x:EsPosition)=>cap(x.suits.replace(suitsOpen,'').replace(/\.$/,''));
 return [
  place(p.slug,`¿Dónde se coloca: ${the}?`,firstSentence(p.where),[firstSentence(a.where),firstSentence(b.where)],p.where),
  place(p.slug,`¿A quién le queda bien la posición: ${the}?`,suits(p),[suits(a),suits(b)],suits(p)+'.'),
  place(p.slug,`¿Qué letras tiene en la alineación: ${the}?`,p.short,[a.short,b.short],`${p.short} es la abreviatura de ${the}.`),
 ];
}
