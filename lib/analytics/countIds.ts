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
 *   tu:open tu:finish              the Island Tutorial (Paths card): opened, watched to the end (Oct 16 2026)
 *   fi:<event>                     fishing (FISHING_COUNT_EVENTS, lib/analytics/fishingEvents.ts): legends, clues, requests, the
 *                                  lure put on by id, fights started (spin reel), landed / escaped / missed, slips
 *                                  per fight (bucketed), runs stopped vs spun through, average spin rate (bucketed), Fishbook opens
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
 ['week','Shared week plan opened'],['cheer','Cheer left for the player'],['helped','“This helped” tapped'],['note','Player note written']] as const;
/**
 * Kit Shop events (Oct 15 2026, lib/analytics/shopEvents.ts): studio opens, designs saved to a slot, purchases and coins
 * spent, My kit opened. `spend` carries the price as its count (n), so the total may take a few beats to arrive in full
 * (count() chunks large n across beats; see tracker.ts count/takeCounts) — the day's total still adds up correctly.
 */
export const SHOP_COUNT_EVENTS=[
 ['open_jersey','Jersey studio opened'],['open_boots','Boot studio opened'],['open_ball','Ball studio opened'],
 ['save_jersey','Jersey design saved'],['save_boots','Boot design saved'],['save_ball','Ball design saved'],
 ['buy_jersey','Jersey bought'],['buy_boots','Boots bought'],['buy_ball','Ball bought'],
 ['spend','Coins spent (Kit Shop)'],['mykit','“My kit” opened'],
] as const;
/** The sandbar between Coral Cay and Summit Isle (lib/town/summitIsle.ts SANDBAR_NAME). */
export const SANDBAR_COUNT_EVENTS=[['cross','Sandbar crossed']] as const;
/** Fruit kinds a tree can bear (lib/town/summitForage.ts FRUIT_KINDS), for the fruit-shaken ids below. */
export const FORAGE_FRUIT_KINDS=['mango','orange','coconut','banana','papaya','lime','guava','avocado'] as const;
/**
 * Summit Isle events (Oct 15 2026, lib/analytics/summitEvents.ts): how players arrive, Summit Kick rounds played (its best
 * score is read straight from the arcade leaderboard instead: lib/arcade/kickAdminMetrics.ts), zipline rides, fruit
 * shaken by kind and method, catches at the four summit fishing spots, the summit kiosk, Summit Isle's hidden balls, the
 * painting easel and the Ball Cannon.
 */
export const SUMMIT_COUNT_EVENTS=[
 ['arrive_walk','Arrived via the Sandbar (on foot or a ride)'],['arrive_fly','Arrived by jetpack or parachute'],
 ['kick_play','Summit Kick round played'],
 ['zipline_ride','Zipline ride to Coral Cay'],
 ['fish_cove','Fish caught at Boulder Cove'],['fish_palm','Fish caught at Palm Point'],['fish_look','Fish caught at Lookout Rocks'],['fish_ledge','Fish caught at Drop-off Ledge'],
 ['kiosk_buy','Summit kiosk purchase'],['kiosk_coin','Coins spent (summit kiosk)'],
 ['ball_find','Hidden ball found on Summit Isle'],
 ['easel_open','Painting easel: sat down to paint'],['easel_save','Painting easel: painting saved'],
 ['cannon_sit','Ball cannon: sat in the seat'],['cannon_hit','Ball cannon: clay disc knocked out'],
] as const;
/** `su:fruit_<kind>:hand` / `:ball` — the two ways a fruit tree is shaken (lib/graphics/fruitTrees.ts drop()). */
export const FRUIT_SHAKE_IDS:readonly string[]=FORAGE_FRUIT_KINDS.flatMap(k=>[`fruit_${k}:hand`,`fruit_${k}:ball`]);
/** Beach finds picked up, by island (lib/town/beachcombing.ts recordFind). */
export const BEACH_COUNT_EVENTS=[['main','Beach finds picked up (Futbol Island)'],['cay','Beach finds picked up (Coral Cay)'],['summit','Beach finds picked up (Summit Isle)']] as const;
/**
 * The Island Tutorial (Oct 16 2026, components/IslandTutorial.tsx, the narrated scenes in the Paths card): opened, and watched to
 * the last scene. Totals only, like the welcome walkthrough's ob: ids; never which scene was skipped to or how long it played.
 */
export const TUTORIAL_COUNT_EVENTS=[['open','Island Tutorial opened'],['finish','Island Tutorial watched to the end']] as const;

/** The four lures (lib/town/fishing/lures.ts LureId; tests/admin-analytics-fishing.cjs checks they agree). Repeated here so the
 *  every-page tracker bundle never imports the fishing content. */
export const FISHING_LURE_IDS=['panenka','knuckleball','rabona','nutmeg'] as const;
/**
 * Fishing (Oct 15 2026, lib/analytics/fishingEvents.ts, docs/fishing.md "Analytics"): totals only, never which fish, spot or
 * size. The lure put on by id (so the four football-technique lures can be compared) and `lure_none` when it is taken off;
 * fights started with the spin reel; each hooked fight's end (landed / escaped) and bites missed before a hook;
 * per spin fight: slips bucketed 0 / 1 / 2 / 3+, runs the player stopped spinning for vs spun through, the average spin rate
 * bucketed slow (< 0.45) / mid / full (≥ 0.8); the Fishbook opened from the HUD's button; requests done, legend clues and releases.
 * Removed 15 Oct 2026 with the features (user: "too complicated"): fi:record, fi:derby_start, fi:derby_done, fi:photo, fi:lure.
 */
export const FISHING_COUNT_EVENTS=[
 ...FISHING_LURE_IDS.map(id=>[`lure_${id}`,`Lure put on: ${id[0].toUpperCase()+id.slice(1)}`] as const),['lure_none','Lure taken off'],
 ['hook_spin','Fight started (spin reel)'],
 ['land','Fish landed'],['escape','Hooked fish got away (idle)'],['miss','Bite missed (too early or too late)'],
 ['slips_0','Spin fights with no slip'],['slips_1','Spin fights with 1 slip'],['slips_2','Spin fights with 2 slips'],['slips_3plus','Spin fights with 3+ slips'],
 ['run_stopped','Runs: stopped spinning in time'],['run_spun','Runs: spun through (slipped)'],
 ['spin_slow','Spin fights at a slow average rate'],['spin_mid','Spin fights at a medium average rate'],['spin_full','Spin fights at a full average rate'],
 ['book','Fishbook opened while fishing'],
 ['request','Islander fishing request finished'],['clue','Legend clue found'],['legend','Island Legend caught and released'],
] as const;


/**
 * Water (Oct 15 2026, lib/analytics/waterEvents.ts, docs/swimming-research.md "P0 implemented"): the first wade and the first
 * swim on a device, swims started, splash-downs by where they came from, the three water actions, time in a swim bucketed,
 * the 20 fps treading-water cap engaging, and the once-per-device swim lesson. Totals only: never a position or a route.
 */
export const WATER_COUNT_EVENTS=[
 ['first_wade','First time wading (per device)'],['first_swim','First time swimming (per device)'],
 ['swim_start','Swims started'],
 ['splash_fall','Splash-down: a fall or cut parachute'],['splash_roof','Splash-down: a rooftop jump'],['splash_launch','Splash-down: a ride launch'],['splash_dropin','Splash-down: jetpack “Drop in”'],
 ['shore','“Back to shore” used'],['fast','“Swim fast” used'],['float','“Float” used'],
 ['time_10s','Swims under 10 s'],['time_30s','Swims 10–30 s'],['time_60s','Swims 30–60 s'],['time_120s','Swims 1–2 min'],['time_long','Swims over 2 min'],
 ['idle_cap','Treading water: 20 fps idle cap engaged'],['lesson','Swim lesson shown'],
 ['sharks_circle','Sharks circled a swimmer'],['sharks_escape','Sharks peeled off (shore reached or lost interest)'],
 ['ride_manta','Rides on a manta ray'],['ride_whale','Rides on the whale shark'],['ride_lap','Rides finished (one lap)'],['ride_off','Rides let go early'],
] as const;

export const FIXED_COUNT_IDS:readonly string[]=[
 ...ONBOARDING_STEPS.map(([s])=>'ob:seen:'+s),...ONBOARDING_STEPS.map(([s])=>'ob:skip:'+s),'ob:explore','ob:lesson',
 ...LEARN_FORMATS.map(f=>'pf:'+f),...LEARN_FORMATS.map(f=>'gr:'+f),'gr:finale','rv:q','rv:ok','rv:done',
 ...IDP_COUNT_EVENTS.map(([e])=>'ip:'+e),...START_COUNT_IDS,
 ...SHOP_COUNT_EVENTS.map(([e])=>'sh:'+e),...SANDBAR_COUNT_EVENTS.map(([e])=>'sb:'+e),
 ...SUMMIT_COUNT_EVENTS.map(([e])=>'su:'+e),...FRUIT_SHAKE_IDS.map(id=>'su:'+id),
 ...BEACH_COUNT_EVENTS.map(([e])=>'bc:pickup_'+e),...TUTORIAL_COUNT_EVENTS.map(([e])=>'tu:'+e),
 ...FISHING_COUNT_EVENTS.map(([e])=>'fi:'+e),
 ...WATER_COUNT_EVENTS.map(([e])=>'wa:'+e),
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
