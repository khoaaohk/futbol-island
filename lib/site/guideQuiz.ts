import type {Rule} from './rules';
import type {TermPage} from './terms';
import type {Position} from './positions';
/**
 * End-of-guide quizzes (Nov 15 2026, owner item 7): three questions at the end of every rules, terms and positions page, with
 * instant feedback. Built ONLY from the page's own checked words, so every answer is as accurate as the page:
 *  - rules: the page's "Common mix-ups": which is right, the mix-up or the truth (the explanation is the truth);
 *  - terms: the term's short meaning against two other terms' meanings, a "how to" step against two of its "common mistakes",
 *    and its other name against two other terms' names;
 *  - positions: where it stands, who it suits and its team-sheet letters, each against two positions far from it in the list.
 * The game's lesson quizzes are NOT reused: lesson pages never show their correct answers (lib/site/lessons.ts), so the island's
 * quiz stays a real test. Option order is a fixed shuffle per page (the right answer is not always first). Pure data; the view is
 * components/site/GuideQuiz.tsx. Nothing is sent anywhere.
 */
export type QuizQuestion={q:string;options:string[];correct:number;explain:string};
const hash=(s:string)=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;};
/** Put the right answer at a fixed, page-dependent place; the wrong ones keep their order around it. */
function place(seed:string,q:string,right:string,wrong:readonly string[],explain:string):QuizQuestion{
 const n=wrong.length+1,at=hash(seed+q)%n,options=[...wrong];options.splice(at,0,right);
 if(new Set(options).size!==n)throw new Error(`quiz "${q}" (${seed}) has two equal options`);
 return {q,options,correct:at,explain};
}
/** Two items far from index i in a list (a third and two thirds of the way round), never i itself. */
const far=<T,>(list:readonly T[],i:number):[T,T]=>{const n=list.length,a=Math.round(n/3),b=Math.round(2*n/3);return [list[(i+a)%n],list[(i+b)%n]];};
const firstSentence=(s:string)=>(/^.*?[.!?](\s|$)/.exec(s)?.[0]??s).trim();
const unquote=(s:string)=>s.replace(/^[“"]|[”"]$/g,'').trim();
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);

export function ruleQuiz(r:Rule):QuizQuestion[]{
 if(r.mixups.length<3)throw new Error(`rule ${r.slug} needs three mix-ups for its quiz`);
 return r.mixups.slice(0,3).map((m,k)=>place(r.slug+k,k===0?'Which one is right?':k===1?'And this one?':'Last one. Which is right?',firstSentence(m.truth),[unquote(m.said)],m.truth));
}
export function termQuiz(t:TermPage,all:readonly TermPage[]):QuizQuestion[]{
 const i=all.indexOf(t),[a,b]=far(all,i),lower=t.name.toLowerCase(),an=/^[aeiou]/i.test(t.name)?'an':'a';
 const out=[place(t.slug,`What is ${an} ${lower}?`,t.short,[a.short,b.short],t.short)];
 if(t.how.length&&t.mistakes.length>=2)out.push(place(t.slug,`Which one is a good way to do ${an} ${lower}?`,t.how[0],t.mistakes.slice(0,2),`${t.how[0]} The other two are common mistakes.`));
 const other=t.also?.split(', ')[0];
 if(other)out.push(place(t.slug,`What is another name for ${an} ${lower}?`,cap(other),[a.name,b.name],`${cap(other)}. ${t.name} is also called ${t.also}.`));
 else out.push(place(t.slug,`Which one is a common mistake?`,t.mistakes[t.mistakes.length-1],t.how.slice(1,3),'That one is on the list of common mistakes. The other two are good habits.'));
 return out;
}
export function positionQuiz(p:Position,all:readonly Position[]):QuizQuestion[]{
 const i=all.indexOf(p),[a,b]=far(all,i),the=`the ${p.name.toLowerCase()}`,suits=(x:Position)=>cap(x.suits.replace(/^It suits\s+/,'').replace(/\.$/,''));
 return [
  place(p.slug,`Where does ${the} stand?`,firstSentence(p.where),[firstSentence(a.where),firstSentence(b.where)],p.where),
  place(p.slug,`Who does ${the} position suit?`,suits(p),[suits(a),suits(b)],suits(p)+'.'),
  place(p.slug,`What are ${the}’s letters on a team sheet?`,p.short,[a.short,b.short],`${p.short} is short for ${p.name.toLowerCase()}.`),
 ];
}
