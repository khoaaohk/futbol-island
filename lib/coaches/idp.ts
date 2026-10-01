/**
 * Individual Development Plan, P0 local prototype (docs/coaches-idp-implementation-notes-2026-09-19.md).
 * One active focus per player, saved on this device only. Nothing is sent to a coach or parent, and nothing here
 * rates or ranks a child: island progress is shown as "explored", never as a football-ability score.
 */
import type {Format} from '../town/venues';
import {FORMAT_PATHS,lessonEvidence,type PathLesson} from '../paths/formatPaths';

export const IDP_KEY='fi2-idp-plan-v1';
/** FA guidance: review a plan every 5–6 weeks. */
export const IDP_REVIEW_DAYS=42;
export const IDP_NOTE_MAX=280;
const NOTES_KEPT=12,HISTORY_KEPT=12;

/** FA Four-Corner model: technical, tactical, physical, psychological/social. */
export type Corner='technical'|'tactical'|'physical'|'social';
export const CORNERS:Record<Corner,{label:string;kid:string}>={
 technical:{label:'Technical',kid:'Ball skills'},
 tactical:{label:'Tactical',kid:'Game smarts'},
 physical:{label:'Physical',kid:'Move & recover'},
 social:{label:'Psychological & social',kid:'Team talk'},
};

export type IdpGoal={
 id:string;format:Format;corner:Corner;
 /** Written in the player's voice, scaled to the format (7v7 simplest → 11v11 fullest). */
 title:string;why:string;
 /** The one next action to try at training. */
 tryIt:string;
 /** A question a grown-up can ask. It supports; it never instructs or scores. */
 parentCue:string;
 /** Island path lessons (lib/paths/formatPaths.json) that show the idea. */
 lessons:string[];
};

export const IDP_GOALS:IdpGoal[]=[
 // 7v7: short kid-worded goals.
 {id:'7-look',format:'7v7',corner:'tactical',title:'Look before I get the ball',why:'A quick look tells you if you can turn or pass it back.',tryIt:'Before every pass to you, turn your head once. Then turn or pass back.',parentCue:'Ask: “What did you see when you looked around?”',lessons:['learn7_receive']},
 {id:'7-open',format:'7v7',corner:'tactical',title:'Move so my teammate can see me',why:'If a defender is in the way, your teammate can’t pass to you.',tryIt:'When a defender blocks you, take two steps to the side.',parentCue:'Ask: “When did you move to get free?”',lessons:['prn_7_support','prn_7_spread']},
 {id:'7-goalside',format:'7v7',corner:'tactical',title:'Stay between the ball and our goal',why:'Being on the goal side makes it hard for the other team to score.',tryIt:'When they have the ball, check that you’re between it and your goal.',parentCue:'Ask: “Where did you stand to help your goal?”',lessons:['def_7_goalside']},
 {id:'7-runback',format:'7v7',corner:'physical',title:'Lost it? Run back to help',why:'A fast run back protects the middle while your team gets ready.',tryIt:'The moment you lose the ball, sprint back to the middle.',parentCue:'Ask: “What did you do right after the ball was lost?”',lessons:['gap7_lostball']},
 {id:'7-keeper',format:'7v7',corner:'social',title:'Call for the ball from my keeper',why:'Your keeper can help you start again if you call and show you’re free.',tryIt:'When the keeper has it, call their name and open up.',parentCue:'Ask: “Who did you talk to on the field today?”',lessons:['bld_7_usekeeper']},
 // 9v9: add tactics and self-reflection.
 {id:'9-scan',format:'9v9',corner:'tactical',title:'Find a passing option before I receive',why:'Knowing your next pass early gives you time on the ball.',tryIt:'Scan before the ball arrives and pick your next pass.',parentCue:'Ask: “What did you notice when you looked up?”',lessons:['learn9_receive','prn_9_support']},
 {id:'9-switch',format:'9v9',corner:'tactical',title:'Spot when the other side is open',why:'If one side is crowded, a switch finds the space.',tryIt:'When your side is crowded, look for the far side before you pass.',parentCue:'Ask: “Was there a time the other side was free?”',lessons:['learn9_switch']},
 {id:'9-cover',format:'9v9',corner:'social',title:'Talk with my partner: one presses, one covers',why:'Two defenders who talk can do two different jobs.',tryIt:'Say “I’ve got ball” or “I’ll cover” when you defend together.',parentCue:'Ask: “What did you and your partner say to each other?”',lessons:['learn9_cover']},
 {id:'9-recover',format:'9v9',corner:'physical',title:'Recover quickly when we lose the ball',why:'The first seconds after losing the ball decide if they can counter.',tryIt:'Choose fast: press the ball or recover goal-side. Don’t stop.',parentCue:'Ask: “What was your first move after you lost it?”',lessons:['trn_9_recover']},
 {id:'9-touch',format:'9v9',corner:'technical',title:'First touch to turn or connect',why:'A first touch away from pressure opens the game up.',tryIt:'Decide before the ball comes: touch to turn, or touch to pass back.',parentCue:'Ask: “When did your first touch help you?”',lessons:['learn9_receive','learn9_wall']},
 // 11v11: full four-corner language.
 {id:'11-turn',format:'11v11',corner:'technical',title:'Scan so I know if I can turn',why:'Checking your shoulder before receiving tells you whether to turn or set the ball.',tryIt:'Take two scans before each pass you receive, and set your body open.',parentCue:'Ask: “When could you turn, and how did you know?”',lessons:['bld_11_throughlines']},
 {id:'11-third',format:'11v11',corner:'tactical',title:'Use the third teammate',why:'A pass to a teammate who can see a third player breaks a press.',tryIt:'Before playing a short pass, find who your teammate can play next.',parentCue:'Ask: “Did a pass ever go around the pressure?”',lessons:['e_thirdman']},
 {id:'11-organise',format:'11v11',corner:'social',title:'Organise the player next to me: who goes, who helps',why:'Clear talk decides pressure and cover before an attacker can use the gap.',tryIt:'Say one clear instruction when the ball comes near your area.',parentCue:'Ask: “What did you tell a teammate, and did it help?”',lessons:['def_11_pressurecover','def_11_shift']},
 {id:'11-rest',format:'11v11',corner:'tactical',title:'Leave someone to help when we attack',why:'Rest defence stops a counter before it starts.',tryIt:'When your team attacks, check who is staying back, and be that player if nobody is.',parentCue:'Ask: “When we attacked, who stayed back?”',lessons:['trn_11_restdefense','trn_11_recover']},
 {id:'11-run',format:'11v11',corner:'physical',title:'Time my run for when the pass is on',why:'Running too early drifts offside, and running too late misses the space.',tryIt:'Hold your run until the passer’s head goes up, then go.',parentCue:'Ask: “What told you it was time to run?”',lessons:['gap11_runoncue']},
 // Futsal.
 {id:'f-look',format:'futsal',corner:'tactical',title:'Look, control, choose',why:'On a small court, your look before the ball decides everything.',tryIt:'Look before the pass, control away from pressure, then choose.',parentCue:'Ask: “What did you see before you got the ball?”',lessons:['bld_f_passtofeet']},
 {id:'f-lane',format:'futsal',corner:'tactical',title:'Make a passing lane for the ball carrier',why:'If you stay hidden behind a defender, the carrier has no pass to make.',tryIt:'After every pass, move so there is a clear line to you.',parentCue:'Ask: “Where did you move after you passed?”',lessons:['prn_f_support','f_pared']},
 {id:'f-winback',format:'futsal',corner:'social',title:'Win it back together',why:'Pressure works when the whole court moves and talks at the same time.',tryIt:'When you lose it, call “press!” or “back!” so everyone does the same thing.',parentCue:'Ask: “What did your team call out when you lost the ball?”',lessons:['trn_f_winitback','def_f_goalside']},
];
export const IDP_FORMATS:{format:Format;label:string;note:string}[]=[
 {format:'7v7',label:'7v7',note:'Simple goals, told like a game'},
 {format:'9v9',label:'9v9',note:'Add tactics and reflection'},
 {format:'11v11',label:'11v11',note:'The full four corners'},
 {format:'futsal',label:'Futsal',note:'Quick looks on a small court'},
];
export const goalById=(id:string)=>IDP_GOALS.find(g=>g.id===id);
export const goalsFor=(format:Format)=>IDP_GOALS.filter(g=>g.format===format);
/** The player reflection prompt, worded for the format. */
export const reflectionPrompt=(format:Format)=>format==='7v7'?'What did you try at training?':format==='11v11'?'What happened when you tried it? What will you change next time?':'What did you notice when you tried it?';

/** Separate evidence labels. Player and coach notes are never merged or scored. */
export type NoteKind='player'|'coach';
/** Research P0: the player's quick reflection choice ("I didn't get a chance" is always a valid answer). */
export type ReflectionTag='tried'|'no-chance'|'want-help';
export const REFLECTION_TAGS:Record<ReflectionTag,{kid:string;label:string}>={
 tried:{kid:'I tried it',label:'Tried it'},
 'no-chance':{kid:'I didn’t get a chance',label:'Didn’t get a chance'},
 'want-help':{kid:'I want help',label:'Want help'},
};
export type IdpNote={id:string;kind:NoteKind;at:number;text:string;tag?:ReflectionTag};
/** "My strength": something the player enjoys or already brings, in one of the four corners. */
export type IdpStrength={corner:Corner;text:string};
export type IdpPlan={goalId:string;setAt:number;reviewAt:number;notes:IdpNote[];strength?:IdpStrength;reviews?:number[]};
export type IdpHistory={goalId:string;setAt:number;closedAt:number;homework?:{done:number;total:number}};
export type IdpState={version:1;plan:IdpPlan|null;history:IdpHistory[]};
export const IDP_STRENGTH_MAX=80;
export const emptyIdp=():IdpState=>({version:1,plan:null,history:[]});

const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>0;
export const cleanStrength=(text:unknown)=>typeof text==='string'?text.replace(/\s+/g,' ').trim().slice(0,IDP_STRENGTH_MAX):'';
export const cleanNote=(text:unknown)=>typeof text==='string'?text.replace(/\s+/g,' ').trim().slice(0,IDP_NOTE_MAX):'';
export function sanitizeIdp(value:unknown):IdpState{
 const out=emptyIdp();if(!value||typeof value!=='object')return out;const v=value as Partial<IdpState>;
 const p=v.plan as Partial<IdpPlan>|null|undefined;
 if(p&&typeof p==='object'&&typeof p.goalId==='string'&&goalById(p.goalId)&&finite(p.setAt)&&finite(p.reviewAt)){
  const notes=(Array.isArray(p.notes)?p.notes:[]).flatMap(n=>{const t=cleanNote(n?.text),tag=n?.kind==='player'&&n.tag&&n.tag in REFLECTION_TAGS?n.tag:undefined;return n&&(n.kind==='player'||n.kind==='coach')&&finite(n.at)&&(t||tag)&&typeof n.id==='string'?[{id:n.id,kind:n.kind,at:n.at,text:t,...(tag?{tag}:{})}]:[];}).slice(-NOTES_KEPT);
  out.plan={goalId:p.goalId,setAt:p.setAt,reviewAt:p.reviewAt,notes};
  const st=p.strength as Partial<IdpStrength>|undefined;if(st&&typeof st==='object'&&typeof st.corner==='string'&&st.corner in CORNERS)out.plan.strength={corner:st.corner as Corner,text:cleanStrength(st.text)};
  if(Array.isArray(p.reviews)){const r=p.reviews.filter(finite).slice(-HISTORY_KEPT);if(r.length)out.plan.reviews=r;}
 }
 if(Array.isArray(v.history))out.history=v.history.filter(h=>h&&typeof h.goalId==='string'&&goalById(h.goalId)&&finite(h.setAt)&&finite(h.closedAt)).map(h=>{const hw=h.homework;return {goalId:h.goalId,setAt:h.setAt,closedAt:h.closedAt,...(hw&&Number.isInteger(hw.done)&&Number.isInteger(hw.total)&&hw.done>=0&&hw.total>=hw.done?{homework:{done:hw.done,total:hw.total}}:{})};}).slice(-HISTORY_KEPT);
 return out;
}

/** Choosing a new focus closes the old one into history; choosing the same focus again keeps its notes. */
/** `homework` (optional) snapshots how much linked island homework was done when a focus closes. The strength carries over. */
export function chooseGoal(state:IdpState,goalId:string,now:number,homework?:{done:number;total:number}):IdpState{
 if(!goalById(goalId))return state;
 if(state.plan?.goalId===goalId)return state;
 const history=state.plan?[...state.history,{goalId:state.plan.goalId,setAt:state.plan.setAt,closedAt:now,...(homework?{homework}:{})}].slice(-HISTORY_KEPT):state.history;
 return {...state,history,plan:{goalId,setAt:now,reviewAt:now+IDP_REVIEW_DAYS*864e5,notes:[],...(state.plan?.strength?{strength:state.plan.strength}:{})}};
}
/** Player reflection and coach note stay separate records; a player note may be just a quick tag. */
export function addNote(state:IdpState,kind:NoteKind,text:string,now:number,tag?:ReflectionTag):IdpState{
 const t=cleanNote(text),g=kind==='player'&&tag&&tag in REFLECTION_TAGS?tag:undefined;if(!state.plan||(!t&&!g))return state;
 return {...state,plan:{...state.plan,notes:[...state.plan.notes,{id:`${kind}-${now}`,kind,at:now,text:t,...(g?{tag:g}:{})}].slice(-NOTES_KEPT)}};
}
export function setStrength(state:IdpState,strength:IdpStrength|null):IdpState{
 if(!state.plan)return state;const {strength:_old,...rest}=state.plan;
 return {...state,plan:strength&&strength.corner in CORNERS?{...rest,strength:{corner:strength.corner,text:cleanStrength(strength.text)}}:rest};
}
export function removeNote(state:IdpState,id:string):IdpState{
 return state.plan?{...state,plan:{...state.plan,notes:state.plan.notes.filter(n=>n.id!==id)}}:state;
}
/** A review restarts the 6-week window and keeps the same focus. */
export function reviewPlan(state:IdpState,now:number):IdpState{
 return state.plan?{...state,plan:{...state.plan,reviewAt:now+IDP_REVIEW_DAYS*864e5,reviews:[...(state.plan.reviews??[]),now].slice(-HISTORY_KEPT)}}:state;
}
export function endPlan(state:IdpState,now:number,homework?:{done:number;total:number}):IdpState{
 return state.plan?{...state,plan:null,history:[...state.history,{goalId:state.plan.goalId,setAt:state.plan.setAt,closedAt:now,...(homework?{homework}:{})}].slice(-HISTORY_KEPT)}:state;
}
export const reviewDue=(plan:IdpPlan,now:number)=>now>=plan.reviewAt;

type IdpStorage=Pick<Storage,'getItem'|'setItem'>;
export function loadIdp(storage?:IdpStorage):IdpState{try{return sanitizeIdp(JSON.parse((storage??window.localStorage).getItem(IDP_KEY)??'null'));}catch{return emptyIdp();}}
export function saveIdp(state:IdpState,storage?:IdpStorage){try{(storage??window.localStorage).setItem(IDP_KEY,JSON.stringify(state));}catch{}}

/** Four-corner label scaled by format: 7v7 kid words, 9v9 both, 11v11 and futsal the full coaching term. */
export const cornerLabel=(format:Format,corner:Corner)=>format==='7v7'?CORNERS[corner].kid:format==='9v9'?`${CORNERS[corner].kid} · ${CORNERS[corner].label}`:CORNERS[corner].label;
/** Whether the plan shows the full four-corner overview (older formats); 7v7 keeps one simple card. */
export const showsFourCorners=(format:Format)=>format==='9v9'||format==='11v11';
export type IdpCopy={lead:string;strength:string;strengthHint:string;tryIt:string;homework:string;review:string;coachHint:string};
export function idpCopy(format:Format):IdpCopy{
 if(format==='7v7')return {lead:'Pick one thing to get better at with your coach. Watch it on the island, try it at training, then say how it went.',strength:'I’m good at…',strengthHint:'Pick one. You can add a few words.',tryIt:'Try it at training',homework:'Island homework',review:'Time to check in with your coach. Keep going, or pick something new?',coachHint:'Coach: one thing you saw, and one next step.'};
 if(format==='9v9')return {lead:'Choose one focus with your coach. Watch it on the island, try it in training and games, then reflect on what happened.',strength:'My strength',strengthHint:'Which corner do you already bring to the team?',tryIt:'Try it at training',homework:'Island homework',review:'Six weeks are up. Review together: keep this focus, adapt it, or choose a new one.',coachHint:'Coach: one dated moment you saw, and one next cue.'};
 return {lead:'Agree one focus with your coach across the four corners (technical, tactical, physical, psychological & social). Study it on the island, apply it in training and matches, and reflect before your 6-week review.',strength:'My strength',strengthHint:'Where in the four corners are you strongest right now?',tryIt:'Apply it in training and matches',homework:'Island homework (linked lessons)',review:'Six-week review: agree whether to continue, adapt or choose a new focus. Look at the player’s reflection and the coach’s observations together.',coachHint:'Coach: a dated observation from training or a match, plus the next cue.'};
}

/** A goal's linked island lessons, looked up in its own format's path. */
export function goalLessons(goal:IdpGoal):PathLesson[]{
 const p=FORMAT_PATHS.find(p=>p.format===goal.format);if(!p)return [];
 const all=[...p.chapters.flatMap(c=>c.lessons),...p.depth];
 return goal.lessons.flatMap(id=>{const l=all.find(l=>l.id===id);return l?[l]:[];});
}
/**
 * Island homework tracks itself: it reads the same path saves as the Paths screen (watched steps + correct quiz answers) with
 * THE path complete rule, so finishing a linked lesson anywhere on the island ticks it off here. Evidence of exploring only.
 */
export function homeworkStatus(goal:IdpGoal,steps:ReadonlySet<string>,answers:ReadonlySet<string>){
 const lessons=goalLessons(goal).map(l=>({lesson:l,...lessonEvidence(goal.format,l,steps,answers)}));
 return {lessons,done:lessons.filter(l=>l.complete).length,total:lessons.length};
}
