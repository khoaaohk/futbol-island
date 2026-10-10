/**
 * Learning analytics (Oct 9 2026, supabase/migrations/20261009_analytics_counts.sql): the ONLY ids the beat's counter channel
 * (`k:{id:n}`) may carry, and the only start flags (`f`). Pure and dependency-light: the tracker (every page), core.ts (server
 * validation) and the dashboard import it. Lesson ids come from the real content via scripts/gen-learning-ids.cjs.
 *
 * Privacy (a kids' game): every id is a fixed bucket and every value a total. No typed text, no answer text (the browser sends
 * an option INDEX; the dashboard looks the words up on the server), no order of events, no ids of players or devices.
 *
 * Id families
 *   lo: le: ls: lf: la:<lesson>   lesson opened / watched to the end / quiz started / quiz finished / every answer right first time
 *   q:<lesson>:<question>          the first attempt at a question in a quiz run
 *   o:<lesson>:<question>:<option> which option that first attempt chose (first-try correct = the correct option's count)
 *   ob:seen:<step> ob:skip:<step>  welcome walkthrough: steps shown, and the step Skip was pressed on
 *   ob:explore ob:lesson           Explore pressed at the end; a lesson opened later in the same tab session
 *   pf:<format>                    a Paths lesson launched, by format
 *   gr:<format> gr:finale          a graduation earned (or the Matchday Ferry final finished) in this session
 *   rv:q rv:ok rv:done             warm-up review questions answered (first try), right first time, warm-ups finished
 *   st: sg: sp:                    the title screen (at `/`), its For grown-ups and Privacy sheets (startIds.ts, Oct 9 2026)
 *   ip:<event>                     the development plan (IDP_COUNT_EVENTS; lib/coaches/idp/analytics.ts): totals only, never
 *                                  which goal, mission, sticker or feeling (docs/idp/DESIGN.md §7)
 */
import {LESSON_TABLE} from './learningIds.generated';
import {START_COUNT_IDS} from './startIds';

export const LEARN_FORMATS=['7v7','9v9','11v11','futsal'] as const;
export type LearnFormat=typeof LEARN_FORMATS[number];
export const LESSON_STAGES=[['lo','Opened'],['le','Watched to the end'],['ls','Quiz started'],['lf','Quiz finished'],['la','All right first try']] as const;
export type LessonStage=typeof LESSON_STAGES[number][0];
/** IslandOnboarding.tsx step ids, in order (tests check they match the component). */
export const ONBOARDING_STEPS=[['welcome','Welcome & pick a player'],['paths','Follow your Path'],['balls','Find hidden balls'],['earn','Earn coins'],['learn','Spend and learn']] as const;
/** lib/town/useLessonVoice.ts COACH_VOICES, in order (tests check they match); the index is what a start's `f.v` carries. */
export const COACH_VOICE_IDS=[['kokoro_af_bella','Coach Bella'],['kokoro_af_heart','Coach Heart'],['kokoro_am_michael','Coach Michael'],['kokoro_af_sarah','Coach Sarah']] as const;

/** Development-plan events (Oct 9 2026, docs/idp/DESIGN.md §7). Fixed names; a total per day, nothing per child. */
export const IDP_COUNT_EVENTS=[['open','Plan story opened'],['set','Plan made'],['goal','Next goal chosen'],['mission','Mission done'],
 ['checkin','Check-in'],['proud','Proud moment added'],['met','Goal celebrated'],['review','6-week review done'],['link','Island link opened from the plan'],
 ['grown','Grown-up view opened'],['fridge','Fridge card printed'],['coachqr','Coach goal QR made'],['coachadd','Coach goal added by a player'],
 ['week','Shared week plan opened'],['cheer','Cheer left for the player'],['helped','“This helped” tapped']] as const;
export const FIXED_COUNT_IDS:readonly string[]=[
 ...ONBOARDING_STEPS.map(([s])=>'ob:seen:'+s),...ONBOARDING_STEPS.map(([s])=>'ob:skip:'+s),'ob:explore','ob:lesson',
 ...LEARN_FORMATS.map(f=>'pf:'+f),...LEARN_FORMATS.map(f=>'gr:'+f),'gr:finale','rv:q','rv:ok','rv:done',
 ...IDP_COUNT_EVENTS.map(([e])=>'ip:'+e),...START_COUNT_IDS,
];
const FIXED=new Set(FIXED_COUNT_IDS);

/** Per beat: at most this many ids (the busiest; the rest carry to the next beat), each value 1..MAX_COUNT_VALUE. */
export const MAX_BEAT_COUNTS=64;
export const MAX_COUNT_VALUE=50;
/** The shape every id must have before the allowlist is even consulted (also enforced in SQL). */
export const COUNT_KEY_RE=/^[a-z]{1,2}:[A-Za-z0-9_]{1,40}(:[A-Za-z0-9_]{1,12}){0,2}$/;

type LessonInfo={format:LearnFormat;id:string;options:number[]};
let lessons:Map<string,LessonInfo>|null=null;
export function lessonInfo(id:string):LessonInfo|undefined{
 lessons??=new Map(LESSON_TABLE.map(([format,id,opts])=>[id,{format,id,options:[...opts].map(Number)}]));
 return lessons.get(id);
}
export const lessonsOf=(format:LearnFormat)=>LESSON_TABLE.filter(l=>l[0]===format).map(l=>l[1]);

/** True only for an id on the allowlist (lesson, question and option indices included). */
export function isCountId(id:string):boolean{
 if(typeof id!=='string'||!COUNT_KEY_RE.test(id))return false;
 if(FIXED.has(id))return true;
 const p=id.split(':');
 if(p.length===2&&/^l[oesfa]$/.test(p[0]))return !!lessonInfo(p[1]);
 const l=lessonInfo(p[1]);if(!l)return false;
 const qi=p[2]!==undefined&&/^[0-9]$/.test(p[2])?Number(p[2]):-1;if(qi<0||qi>=l.options.length)return false;
 if(p[0]==='q'&&p.length===3)return true;
 if(p[0]==='o'&&p.length===4)return /^[0-9]$/.test(p[3])&&Number(p[3])<l.options[qi];
 return false;
}
export const lessonKey=(stage:LessonStage,lesson:string)=>`${stage}:${lesson}`;
export const questionKey=(lesson:string,q:number)=>`q:${lesson}:${q}`;
export const optionKey=(lesson:string,q:number,o:number)=>`o:${lesson}:${q}:${o}`;

/**
 * Start flags (`f` on a session's start): coarse buckets of saved progress and settings at that moment. Never a count of
 * anything finer, never a date. p = lessons completed 0 / 1–3 / 4–11 / 12+; g = graduations none / one / two–three / all four /
 * all four + the Ferry final; s = settings bits (sound muted, music off, lesson voice off, controls flipped); v = coach voice.
 */
export const FLAG_RANGES={p:3,g:4,s:15,v:3} as const;
export type StartFlags={p?:number;g?:number;s?:number;v?:number};
export const PROGRESS_BANDS=['0 lessons','1–3 lessons','4–11 lessons','12+ lessons'] as const;
export const GRAD_BANDS=['None yet','One format','Two or three','All four','All four + Ferry final'] as const;
export const SETTING_BITS=[['sm',1,'Sound muted'],['mo',2,'Music off'],['vo',4,'Lesson voice off'],['cf',8,'Controls flipped']] as const;
export const progressBand=(lessonsComplete:number)=>lessonsComplete<=0?0:lessonsComplete<=3?1:lessonsComplete<=11?2:3;
export const gradBand=(formats:number,finale:boolean)=>formats<=0?0:formats===1?1:formats<4?2:finale?4:3;
/** Valid flags only (unknown keys or out-of-range values → null, so the start is rejected rather than repaired). */
export function checkFlags(raw:unknown):StartFlags|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const out:StartFlags={};
 for(const [k,v] of Object.entries(raw as Record<string,unknown>)){
  if(!(k in FLAG_RANGES)||typeof v!=='number'||!Number.isInteger(v)||v<0||v>FLAG_RANGES[k as keyof typeof FLAG_RANGES])return null;
  out[k as keyof StartFlags]=v;
 }
 return out;
}
/** The day's flag tallies (sessions): n with flags, p0..p3, g0..g4, sm/mo/vo/cf, v0..v3. Same keys in SQL. */
export function flagTallyKeys(f:StartFlags):string[]{
 const out:string[]=['n'];
 if(f.p!==undefined)out.push('p'+f.p);if(f.g!==undefined)out.push('g'+f.g);if(f.v!==undefined)out.push('v'+f.v);
 if(f.s!==undefined)for(const [k,bit] of SETTING_BITS)if(f.s&bit)out.push(k);
 return out;
}
