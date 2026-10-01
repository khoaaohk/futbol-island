import type {Format} from '../town/venues';
/**
 * Concept → lesson map (docs/learning/apply-in-play.md). ONE table that ties the island's side activities back to the Paths
 * lessons: live-match "spot it" callouts, the book "Take it to your game" checks, Konbini magazines, island jobs, fishing's
 * keeper lessons and the ball hunt. Pure data + lookups: no storage, no timers, safe to import from the render side.
 *
 * Language scales by format (AGENTS.md / the teaching guidelines): futsal and 7v7 get the simplest words, 9v9 a little more,
 * 11v11 the full vocabulary. `words` holds a title and one line per level.
 */
export type ConceptId='one-two'|'third-man'|'overlap'|'switch-play'|'support-angle'|'width-space'|'team-roles'|'scan-receive'|'two-v-one'
 |'press-cover'|'goal-side'|'win-it'|'lose-it'|'offside'|'through-ball'|'cutback'|'far-post'|'pivot'|'keeper-build'|'restart-options'
 |'keeper-set'|'follow-in';
export type Level='simple'|'mid'|'complex';
export type Words={title:string;line:string};
export type Concept={
 id:ConceptId;
 words:Record<Level,Words>;
 /** Path lessons that teach it, per format (`lessonId` only; the key is `${format}:${lessonId}`). Core stops first. */
 lessons:Partial<Record<Format,string[]>>;
 /** Ball-hunt diagram kinds (lib/town/ballHuntLessons.ts `kind`) that teach the same idea. */
 ballKinds?:string[];
 /** Live match: combo/feed lines that show it (lib/town/match/combos.ts `say`), and sim stat counters that tick when it happens. */
 feed?:RegExp;stat?:'switches'|'offsideCalls';
 /** Konbini magazines, island jobs and fishing keeper-lesson beats whose topic is this concept. */
 magazines?:string[];jobs?:string[];fish?:string[];
};
export const FORMATS:Format[]=['futsal','7v7','9v9','11v11'];
/** Futsal and 7v7 use the simplest words, 9v9 the middle set, 11v11 the full set. */
export const levelFor=(format:string):Level=>format==='11v11'?'complex':format==='9v9'?'mid':'simple';
const w=(simple:[string,string],mid:[string,string],complex:[string,string]):Record<Level,Words>=>({simple:{title:simple[0],line:simple[1]},mid:{title:mid[0],line:mid[1]},complex:{title:complex[0],line:complex[1]}});

export const CONCEPTS:Concept[]=[
 {id:'one-two',words:w(['Wall pass','Pass, run past the defender, get it back.'],['One-two','Pass, run past your marker and take the return in the space behind.'],['One-two combination','The wall player’s first-time return beats a marker who watched the ball.']),
  lessons:{futsal:['f_pared'],'7v7':['s_onetwo'],'9v9':['learn9_wall']},ballKinds:['give-and-go','pass-and-move'],feed:/^One-two/},
 {id:'third-man',words:w(['Find the third player','Pass to a friend who can pass to the free player.'],['Third player run','Use a nearby teammate to reach the player you could not pass to.'],['Third-man combination','A lay-off releases the runner the defence could not see coming.']),
  lessons:{futsal:['expf_thirdplayer'],'11v11':['e_thirdman']},ballKinds:['third-man','up-back-through']},
 {id:'overlap',words:w(['Run around the outside','A teammate runs round the player with the ball to make two against one.'],['Overlap','The outside back runs round the winger so the defender has to choose.'],['Overlap and underlap','A full-back’s run outside (or inside) the winger creates a two-against-one on the flank.']),
  lessons:{'7v7':['next7_outsideback'],'9v9':['nx9_fourthrunner'],'11v11':['exp11_insidefullback']},ballKinds:['overlap','underlap'],feed:/^Overlap/},
 {id:'switch-play',words:w(['Use the other side','When one side is crowded, pass to the empty side.'],['Switch play','Move the ball through support to the side the defence left.'],['Switch of play','Draw the block to one flank, then change the point of attack into the far-side space.']),
  lessons:{futsal:['expf_switchblock'],'9v9':['learn9_switch'],'11v11':['e_switch']},ballKinds:['switch','overload-isolate'],stat:'switches'},
 {id:'support-angle',words:w(['Get out of the shadow','Step sideways so the defender is not between you and the ball.'],['Passing angle','Move out of the passing shadow so the lane to you is open.'],['Support angles','Offer a line the nearest defender cannot screen, then read him again.']),
  lessons:{futsal:['prn_f_support'],'7v7':['prn_7_support'],'9v9':['prn_9_support'],'11v11':['bld_11_whenlong']},ballKinds:['leave-shadow','dribble-angle','triangle','hide-behind','drag-away','free-player','blind-side']},
 {id:'width-space',words:w(['Make room','Spread out so the player with the ball has more passes.'],['Width and depth','Stretch the pitch wide and long so passing lanes open.'],['Width, depth and lanes','Occupy different lanes and lines so one defender can never guard two options.']),
  lessons:{futsal:['fmn_f_40','learnf_shape22'],'7v7':['prn_7_spread','learn7_shape'],'9v9':['nx9_twoblocks'],'11v11':['exp11_insidefullback']},ballKinds:['go-wide','spread-out','depth','diamond','own-lane','big-small','half-space']},
 {id:'team-roles',words:w(['Know your job','Each player has a job: keeper, back, middle, front.'],['Your unit','Know your line and who covers when a teammate moves up.'],['Team shape and shared jobs','Each line has jobs; when one player leaves a zone, another adjusts to keep the shape.']),
  lessons:{futsal:['learnf_roles31'],'7v7':['learn7_roles'],'9v9':['learn9_shape'],'11v11':['learn11_shape']},ballKinds:['three-lines','island-team','compact-lines']},
 {id:'scan-receive',words:w(['Look before the ball comes','Look over your shoulder, then turn or pass back.'],['Receive and turn','Check the space before the pass; turn into room or connect back.'],['Scan and receive between lines','Scan before the ball arrives so your first touch already chooses turn or set.']),
  lessons:{futsal:['bld_f_passtofeet'],'7v7':['learn7_receive'],'9v9':['learn9_receive'],'11v11':['bld_11_throughlines']},ballKinds:['scan-shoulder','half-turn','touch-into-space','time-or-pressure','talk'],jobs:['wall-rebounds']},
 {id:'two-v-one',words:w(['Two against one','Dribble at the defender, then pass when they come to you.'],['2v1: carry or pass','Watch whether the defender steps to the ball or stays with your teammate.'],['Commit the defender','Carry to fix the last defender, then play the route his choice leaves open.']),
  lessons:{futsal:['expf_2v1'],'7v7':['learn7_carry'],'9v9':['learn9_two_one']},ballKinds:['two-v-one','change-pace','dribble-line','run-with-ball']},
 {id:'press-cover',words:w(['One goes, one helps','One player goes to the ball, a friend stays just behind.'],['Press and cover','Approach the ball with a teammate covering behind you.'],['Pressure, cover, balance','The first defender presses, the second covers the lane behind, the third balances the far side.']),
  lessons:{futsal:['def_f_goalside','expf_pressreturn'],'9v9':['learn9_cover'],'11v11':['def_11_pressurecover']},ballKinds:['cover-balance','press-trigger','curved-press','jockey','defend-2v1','show-outside']},
 {id:'goal-side',words:w(['Stay between ball and goal','Keep yourself between the attacker and your goal.'],['Track the runner','See the ball and your runner; hand him on only when cover is ready.'],['Slide and protect the middle','Shift across as a unit without opening the central corridor.']),
  lessons:{futsal:['gapf_farpostdefense'],'7v7':['def_7_goalside','dbz_7_dontballwatch'],'9v9':['gap9_runnerhandoff'],'11v11':['def_11_shift']},ballKinds:['recover-inside','danger-zone','block-lane','track-runner','slide-across','squeeze-up']},
 {id:'win-it',words:w(['Win it, then look','When you win the ball, look forward first.'],['Win it: attack or keep it','After a win, attack a clear advantage or keep the ball safe.'],['Transition to attack','Exploit the moment after a regain, before the opponent reorganises.']),
  lessons:{futsal:['trn_f_firstpass'],'9v9':['trn_9_firstpass']},ballKinds:['counter','second-ball']},
 {id:'lose-it',words:w(['Lost it? Protect the middle','Get back between the ball and your goal.'],['Lose it: recover or press','Recover toward goal, or press when a teammate can cover.'],['Defensive transition','Counter-press when support is close; otherwise recover and keep rest-defence behind the ball.']),
  lessons:{futsal:['trn_f_winitback'],'7v7':['gap7_lostball'],'9v9':['trn_9_recover'],'11v11':['trn_11_recover','trn_11_restdefense']},ballKinds:['counter-press','delay-recover','rest-defence']},
 {id:'offside',words:w(['Offside line','Wait level with the last defender, then run when the pass comes.'],['Offside','Stay level with the second-last defender until the pass is played.'],['Beat the offside line','Time a curved run so you are onside when the ball is struck.']),
  lessons:{'7v7':['next7_offsideboundary'],'11v11':['gap11_runoncue']},ballKinds:['curved-run','passer-sees'],stat:'offsideCalls',magazines:['offside'],jobs:['offside-flag']},
 {id:'through-ball',words:w(['Pass into the space ahead','Pass where your teammate is running, not to their feet.'],['Run behind','Time your run into the space behind the defenders.'],['Through ball and runs in behind','Play into the space behind the back line as the runner arrives onside.']),
  lessons:{futsal:['f_paralela'],'11v11':['gap11_runoncue']},ballKinds:['run-behind','pass-ahead','arrive-late','split-gap','forward-first','between-lines'],feed:/^Through ball/},
 {id:'cutback',words:w(['Pass it back','Near the end line, pass back to a free friend.'],['Cut-back','The defenders run to their goal, so pass back to the player arriving.'],['Cut-back into the arriving midfielder','Defenders retreat toward goal; the pull-back finds the runner at the penalty spot.']),
  lessons:{futsal:['expf_cornercutback'],'11v11':['learn11_cutback']},ballKinds:['cutback','square-pass','cross-gap'],feed:/^Cut-back/ /* not "Pull-back": that is the sole drag-back skill's line (combos TAKE_ON_TEXT), not a cross */},
 {id:'far-post',words:w(['Arrive at the far post','Run to the far post as the ball goes across.'],['Attack the box','Split your runs: near post, far post and the spot.'],['Box occupation','Attack the near post, far post and penalty spot before the delivery arrives.']),
  lessons:{futsal:['learnf_farpost']},ballKinds:['box-runs'],feed:/^(Attack the box|Far-post|Near-post)/},
 {id:'pivot',words:w(['The pivot','Your front player holds the ball, then turns or passes.'],['Pivot play','The pivot reads the marker: turn, or lay it off to a runner.'],['Pivot link play','Back to goal, the pivot shields, then turns or sets for the arriving third player.']),
  lessons:{futsal:['f_pivot','expf_replacepivot','expf_denypivot']},ballKinds:['shield','drop-drag','pin'],feed:/^(Pivô holds|Back heel lay-off)/},
 {id:'keeper-build',words:w(['Your keeper can help','Pass back to the keeper when the pass is clear.'],['Build with the keeper','Use the keeper to get around pressure.'],['Goalkeeper in build-up','The keeper is the spare player who draws a presser and releases a teammate.']),
  lessons:{futsal:['bld_f_splitcb','expf_keeperoverload'],'7v7':['bld_7_usekeeper','learn7_buildout'],'9v9':['bld_9_usekeeper'],'11v11':['learn11_restart']},ballKinds:['use-keeper','build-out','keeper-throw','keeper-joins'],feed:/^(Goalkeeper throw|Roll-out)/},
 {id:'restart-options',words:w(['Two choices at a restart','Before a kick-in or goal kick, make two passes ready.'],['Restart options','Offer two options before the restart, then use the one left open.'],['Set restarts and backups','Prepare a primary and a backup option so the defence cannot cover both.']),
  lessons:{futsal:['set_f_throwin','expf_kickinthird'],'7v7':['next7_dribblein'],'9v9':['learn9_restart'],'11v11':['learn11_restart']},ballKinds:['thrower-free','quick-free-kick','kick-in'],feed:/^Kick-in/,magazines:['throw-in'],jobs:['ball-kid']},
 {id:'keeper-set',words:w(['Keeper: get set','Stand still and ready before the shot. Don’t dive too early.'],['Keeper position','Step to the right spot and wait on your toes.'],['Goalkeeper depth and timing','Set your depth to the threat and hold your feet until the strike.']),
  lessons:{futsal:['expf_keeperposition']},ballKinds:['keeper-angle','sweeper-keeper','wall-keeper'],fish:['nibble','scared','escaped','caught']},
 {id:'follow-in',words:w(['Follow your shot','After a shot, run in: the keeper might drop it.'],['Follow in','Arrive for the rebound while others stop to watch.'],['Second-ball reactions','React to the parry or the post before the defence resets.']),
  lessons:{'7v7':['next7_shotreaction']},ballKinds:['follow-shot'],feed:/^(Parried|Rebound goal)/},
];
const BY_ID=new Map(CONCEPTS.map(c=>[c.id,c]));
export const conceptById=(id:string)=>BY_ID.get(id as ConceptId);
export const lessonKey=(format:string,lessonId:string)=>`${format}:${lessonId}`;
export const splitLessonKey=(key:string)=>{const i=key.indexOf(':');return {format:key.slice(0,i) as Format,lessonId:key.slice(i+1)};};
/** The 11-a-side ladder (7v7 → 9v9 → 11v11, all on grass) and futsal (its own court game with its own roles) are two games. */
const sameGame=(a:Format,b:Format)=>(a==='futsal')===(b==='futsal');
/**
 * Every lesson key the concept teaches, the given format first, then the nearest formats of the ladder.
 * `sameGameOnly` (live-match Spot it, QA11 C-7): only lessons from the game being watched, so an 11v11 box-run callout never opens a
 * futsal lesson (and a futsal callout never a grass one). Other callers (ball hunt, books) keep the cross-game fallback.
 */
export function conceptLessons(id:ConceptId,prefer?:string,sameGameOnly=false):string[]{
 const c=BY_ID.get(id);if(!c)return [];const p=prefer&&FORMATS.includes(prefer as Format)?prefer as Format:null;
 const order=p?[p,...FORMATS.filter(f=>f!==p).sort((a,b)=>Math.abs(FORMATS.indexOf(a)-FORMATS.indexOf(p))-Math.abs(FORMATS.indexOf(b)-FORMATS.indexOf(p)))].filter(f=>!sameGameOnly||sameGame(f,p)):FORMATS;
 return order.flatMap(f=>(c.lessons[f]??[]).map(l=>lessonKey(f,l)));
}
/** Concepts a lesson teaches (a lesson may teach two). */
export function conceptsForLesson(key:string):ConceptId[]{const {format,lessonId}=splitLessonKey(key);return CONCEPTS.filter(c=>c.lessons[format]?.includes(lessonId)).map(c=>c.id);}
/** Title + one line in the words for this format's level. */
export function conceptWords(id:ConceptId,format:string):Words{const c=BY_ID.get(id)!;return c.words[levelFor(format)];}
export const conceptForBallKind=(kind:string)=>CONCEPTS.find(c=>c.ballKinds?.includes(kind))?.id??null;
export const conceptForMagazine=(id:string)=>CONCEPTS.find(c=>c.magazines?.includes(id))?.id??null;
export const conceptForJob=(id:string)=>CONCEPTS.find(c=>c.jobs?.includes(id))?.id??null;
export const conceptForFish=(beat:string)=>CONCEPTS.find(c=>c.fish?.includes(beat))?.id??null;
/** A live-match feed line (combos `say` text) → the concept it shows, if any. */
export const conceptForFeed=(text:string)=>CONCEPTS.find(c=>c.feed?.test(text))?.id??null;
/** A sim stat that just ticked → its concept. Offside is only called in 9v9 and 11v11 (matchSim.useOffside). */
export const conceptForStat=(stat:string)=>CONCEPTS.find(c=>c.stat===stat)?.id??null;
/** The ball hunt's own level scale (level 1 uses 7v7 words, 2 → 9v9, 3 → 11v11) picks which format's lesson to link first. */
export const BALL_LEVEL_FORMAT:Record<1|2|3,Format>={1:'7v7',2:'9v9',3:'11v11'};
/** A ball-hunt lesson → its Paths lesson key, where the mapping is clear (null otherwise: rules, health, beach-only ideas). */
export function ballLessonLink(kind:string,level:1|2|3):{concept:ConceptId;lesson:string}|null{
 const concept=conceptForBallKind(kind);if(!concept)return null;const lesson=conceptLessons(concept,BALL_LEVEL_FORMAT[level])[0];return lesson?{concept,lesson}:null;
}
