import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,lessonById,type SiteLesson} from './lessons';
import paths from '@/lib/paths/formatPaths.json';
import {HUB_COMMON_FAQ,type Faq} from './safety';
/**
 * Topic hubs (SEO, Nov 8 2026: organic discovery for "football rules for kids", "soccer quiz for kids", "futsal for kids" …).
 * Server-rendered reading pages built ONLY from the lesson catalog (public/lessons via lib/site/lessons.ts): every group is a
 * list of real lesson ids (checked here: a missing id throws at build time), every count is computed, and the FAQ answers
 * quote a lesson's own concept text or the verified safety facts (lib/site/safety.ts). No invented football content.
 * The slugs are excluded from the old /learn/<id> redirect in next.config.mjs (tests/seo-pages.cjs checks both lists).
 */
export type HubGroup={title:string;line?:string;lessons:SiteLesson[]};
export type Hub={slug:string;path:string;crumb:string;blurb:string;title:string;description:string;h1:string;lead:string;groups:HubGroup[];faq:Faq[];showQuestion?:boolean};
const pick=(ids:readonly string[])=>ids.map(id=>{const l=lessonById(id);if(!l)throw new Error(`hub lesson ${id} is not in the lesson catalog`);return l;});
const concept=(id:string)=>pick([id])[0].concept;
const n=(g:HubGroup[])=>g.reduce((a,x)=>a+x.lessons.length,0);
const qs=(ls:readonly SiteLesson[])=>ls.reduce((a,l)=>a+l.questions.length,0);
const fmts=(ls:readonly SiteLesson[])=>{const f=FORMAT_ORDER.filter(x=>ls.some(l=>l.format===x)).map(x=>x==='futsal'?'futsal':FORMAT_LABEL[x]);return f.length>1?`${f.slice(0,-1).join(', ')} and ${f[f.length-1]}`:f[0]??'';};
const plural=(k:number,w:string)=>`${k} ${w}${k===1?'':'s'}`;
export const DEFINITION='Futbol Island is a free football (soccer) learning game for kids aged 7 to 12, played in the web browser.';

// ---- the hubs ----------------------------------------------------------------------------------------------------------------
const RULES_GROUPS:HubGroup[]=[
 {title:'The build-out line and offside in 7v7',line:'Where the other team waits on a goal kick, and where offside starts to count.',lessons:pick(['learn7_buildout','next7_offsideboundary'])},
 {title:'Goal kicks and goal clearances',line:'Restarting from the goalkeeper with more than one option.',lessons:pick(['learn9_restart','nx9_keeperthird','learn11_restart','bld_f_splitcb'])},
 {title:'Throw-ins, kick-ins and dribble-ins',line:'Restarts from the sideline, with the hands, the feet or a dribble.',lessons:pick(['next7_dribblein','next9_restartreturn','set_f_throwin','expf_kickinthird'])},
 {title:'Corners',line:'Taking a corner and defending one.',lessons:pick(['next9_shortcornerbudget','expf_cornercutback','expf_defendcorner'])},
 {title:'Free kicks',line:'The wall, the short free kick and keeping a safety player.',lessons:pick(['exp11_shortfreekick','expf_freekickbalance'])},
];
const PASS_GROUPS:HubGroup[]=[
 {title:'Get open for the pass',line:'Move so a teammate can see you and pass to you.',lessons:pick(['prn_7_support','prn_7_spread','next7_reachableforward','prn_9_support','prn_f_support'])},
 {title:'Receive, turn or give it back',line:'Look before the ball arrives, then choose.',lessons:pick(['learn7_receive','learn9_receive','bld_11_throughlines','bld_f_passtofeet','f_pivot'])},
 {title:'Wall passes and the third player',line:'Use a teammate to go around pressure.',lessons:pick(['s_onetwo','learn9_wall','f_pared','e_thirdman','expf_thirdplayer'])},
 {title:'Carry, dribble or pass',line:'Read the defender before you decide.',lessons:pick(['learn7_carry','next7_dribbleroom','learn9_two_one','expf_2v1'])},
 {title:'Switch the play',line:'Move the ball to the side with space.',lessons:pick(['learn9_switch','nx9_twoblocks','e_switch','f_paralela','expf_switchblock'])},
];
const byCategory=(ls:SiteLesson[])=>{const cats=[...new Set(ls.map(l=>l.category??'More lessons'))];return cats.map(c=>({title:c,lessons:ls.filter(l=>(l.category??'More lessons')===c)}));};
const FUTSAL=LESSONS.filter(l=>l.format==='futsal');
const FUTSAL_GROUPS:HubGroup[]=byCategory(FUTSAL).map(g=>({...g,title:`${g.title} (futsal)`}));
type Path={format:string;chapters:{title:string;lessons:{id:string}[]}[]};
const SIZE_GROUPS:HubGroup[]=(['7v7','9v9','11v11'] as const).flatMap(f=>{
 const all=LESSONS.filter(l=>l.format===f),p=(paths as Path[]).find(x=>x.format===f),inPath=new Set<string>();
 const chapters=(p?.chapters??[]).map(c=>{const ls=pick(c.lessons.map(x=>x.id));ls.forEach(l=>inPath.add(l.id));return {title:`${FORMAT_LABEL[f]}: ${c.title}`,lessons:ls};});
 const rest=all.filter(l=>!inPath.has(l.id));
 return [...chapters,...(rest.length?[{title:`${FORMAT_LABEL[f]}: more lessons`,lessons:rest}]:[])];
});
const QUIZ_GROUPS:HubGroup[]=FORMAT_ORDER.map(f=>{const ls=LESSONS.filter(l=>l.format===f&&l.questions.length);return {title:`${FORMAT_LABEL[f]} quizzes`,line:`${plural(ls.length,'quiz')} with ${qs(ls)} questions.`,lessons:ls};});
const QUIZ_LESSONS=LESSONS.filter(l=>l.questions.length),QUIZ_QS=qs(QUIZ_LESSONS);
const count=(f:string)=>LESSONS.filter(l=>l.format===f).length;

export const HUBS:readonly Hub[]=[
 {slug:'football-rules-for-kids',path:'/learn/football-rules-for-kids',crumb:'Football rules',blurb:`${n(RULES_GROUPS)} lessons on goal kicks, kick-ins, corners and free kicks`,
  title:'Football Rules for Kids: Lessons and Quizzes',
  description:`Football (soccer) rules for kids: goal kicks, the build-out line, kick-ins, throw-ins, corners and free kicks, in ${n(RULES_GROUPS)} free lessons with quizzes.`,
  h1:'Football rules for kids',
  lead:`${DEFINITION} These ${n(RULES_GROUPS)} lessons teach the restarts of the game: goal kicks and the build-out line, throw-ins and kick-ins, corners and free kicks, in ${fmts(RULES_GROUPS.flatMap(g=>g.lessons))}.`,
  groups:RULES_GROUPS,
  faq:[
   {q:'What is the build-out line in 7v7?',a:`In 7v7, on a goal kick: ${concept('learn7_buildout')}`},
   {q:'Can you be offside in 7v7?',a:concept('next7_offsideboundary')},
   {q:'Which restarts do the lessons cover?',a:`${RULES_GROUPS.map(g=>`${g.title} (${g.lessons.length})`).join('; ')}. Each lesson ends with a short quiz.`},
   ...HUB_COMMON_FAQ]},
 {slug:'soccer-quiz-for-kids',path:'/learn/soccer-quiz-for-kids',crumb:'Soccer quizzes',blurb:`${QUIZ_LESSONS.length} quizzes with ${QUIZ_QS} questions`,showQuestion:true,
  title:'Soccer Quiz for Kids: Free Football Quizzes',
  description:`${QUIZ_LESSONS.length} free football (soccer) quizzes for kids with ${QUIZ_QS} questions on positions, passing, defending and rules in 7v7, 9v9, 11v11 and futsal.`,
  h1:'Soccer quizzes for kids',
  lead:`${DEFINITION} Every lesson ends with a quiz: ${QUIZ_LESSONS.length} quizzes and ${QUIZ_QS} questions in all, grouped here by format. Each one shows a first question; open a lesson to read them all.`,
  groups:QUIZ_GROUPS,
  faq:[
   {q:'How many quiz questions are there?',a:`${QUIZ_QS} questions across ${QUIZ_LESSONS.length} lesson quizzes: ${QUIZ_GROUPS.map(g=>`${g.lessons.length} in ${g.title.replace(' quizzes','')}`).join(', ')}.`},
   {q:'How does a quiz work in the game?',a:'Every idea is shown on a pitch with moving players, explained by a coach voice step by step, and checked with a quick quiz. A lesson only counts once every question is right.'},
   {q:'Do the lesson pages give the answers away?',a:'No. The website lists each question with its options in A to Z order and the coach’s explanation, but never marks the right answer. Kids answer on the pitch in the game.'},
   ...HUB_COMMON_FAQ]},
 {slug:'passing-and-support',path:'/learn/passing-and-support',crumb:'Passing and support',blurb:`${n(PASS_GROUPS)} lessons on getting open, wall passes and switching play`,
  title:'Passing and Support Lessons for Kids',
  description:`How to get open, receive, play a wall pass and switch play: ${n(PASS_GROUPS)} free football (soccer) lessons for kids, each with a quiz.`,
  h1:'Passing and support for kids',
  lead:`${DEFINITION} These ${n(PASS_GROUPS)} lessons teach passing and support: getting open, receiving and turning, wall passes, carrying the ball and switching play, in ${fmts(PASS_GROUPS.flatMap(g=>g.lessons))}.`,
  groups:PASS_GROUPS,
  faq:[
   {q:'How do I get open for a pass?',a:concept('prn_7_support')},
   {q:'When should I play a wall pass?',a:concept('s_onetwo')},
   {q:'Why switch the play?',a:concept('e_switch')},
   ...HUB_COMMON_FAQ]},
 {slug:'futsal-for-kids',path:'/learn/futsal-for-kids',crumb:'Futsal',blurb:`${FUTSAL.length} lessons for the futsal court`,
  title:'Futsal for Kids: Free Lessons and Quizzes',
  description:`${FUTSAL.length} free futsal lessons for kids: court roles, the pivot, wall passes, kick-ins, corners and defending, each with a short quiz. Play in your browser.`,
  h1:'Futsal lessons for kids',
  lead:`${DEFINITION} It has ${FUTSAL.length} futsal lessons with ${qs(FUTSAL)} quiz questions, grouped here by ${FUTSAL_GROUPS.map(g=>g.title.replace(' (futsal)','').toLowerCase()).join(', ').replace(/, ([^,]*)$/,' and $1')}.`,
  groups:FUTSAL_GROUPS,
  faq:[
   {q:'How many futsal lessons are there?',a:`${FUTSAL.length} futsal lessons with ${qs(FUTSAL)} quiz questions: ${FUTSAL_GROUPS.map(g=>`${g.lessons.length} ${g.title.replace(' (futsal)','').toLowerCase()}`).join(', ')}.`},
   {q:'What are the futsal court roles?',a:concept('learnf_roles31')},
   {q:'What is a futsal kick-in?',a:`The futsal restart from the sideline. ${concept('set_f_throwin')}`},
   ...HUB_COMMON_FAQ]},
 {slug:'7v7-9v9-11v11',path:'/learn/7v7-9v9-11v11',crumb:'7v7, 9v9 and 11v11',blurb:`${count('7v7')}, ${count('9v9')} and ${count('11v11')} lessons by team size`,
  title:'7v7, 9v9 and 11v11 Football Lessons for Kids',
  description:`Football (soccer) lessons for kids by team size: ${count('7v7')} for 7v7, ${count('9v9')} for 9v9 and ${count('11v11')} for 11v11, each with a quiz. Free, no ads.`,
  h1:'7v7, 9v9 and 11v11 lessons',
  lead:`${DEFINITION} Kids learn the game at the team size they play: ${count('7v7')} lessons for 7v7, ${count('9v9')} for 9v9 and ${count('11v11')} for 11v11, set out below in the chapters of each learning path.`,
  groups:SIZE_GROUPS,
  faq:[
   {q:'Which format should my child start with?',a:'The 7v7 path comes first because it is the simplest.'},
   {q:'What does 7v7 teach first?',a:concept('learn7_roles')},
   {q:'What does the first 11v11 lesson teach?',a:concept('learn11_shape')},
   ...HUB_COMMON_FAQ]},
];
export const HUB_PATHS=HUBS.map(h=>h.path);
export const hubBySlug=(slug:string)=>HUBS.find(h=>h.slug===slug);
/** The hubs a lesson belongs to (lesson pages link back to them). */
export const hubsFor=(id:string)=>HUBS.filter(h=>h.slug!=='soccer-quiz-for-kids'&&h.groups.some(g=>g.lessons.some(l=>l.id===id)));
/** The parents' guide (its own page, app/(site)/safe-football-game-for-kids). */
export const SAFE_GUIDE={path:'/safe-football-game-for-kids',crumb:'A safe football game for kids',
 title:'Safe Football Game for Kids: Parents’ Guide',
 description:'A parents’ guide to Futbol Island, a free football learning game for kids 7 to 12: no ads, no accounts, no open chat and no tracking cookies.',
 h1:'A safe football game for kids'} as const;
export const HUB_COUNTS={lessons:LESSONS.length,quizzes:QUIZ_LESSONS.length,questions:QUIZ_QS,futsal:FUTSAL.length};
