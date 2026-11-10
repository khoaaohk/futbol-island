import {conceptLessons,conceptWords,splitLessonKey,type ConceptId} from '../learning/conceptMap';
import type {Format} from './types';

/* Pass Puzzles → Paths lessons (Nov 10 2026, arcade part 3).
 *
 * Every scenario carries a `concept` tag (types.ts). This table names each tag in kid words for the solved card, and maps it
 * to the island's concept map (lib/learning/conceptMap.ts), which knows the lessons that teach it. `null` means no lesson
 * teaches it yet (ball craft like curl, chip, wind and wet-pitch weight): the card still names it, but offers no link.
 *
 * Lessons open on the island only (a lesson is a Town scene), so the arcade links to the lesson's reading page
 * (/learn/lessons/<id>) in a new tab. tests/pass-puzzle-concept-lessons.cjs checks every tag used by a scenario is here,
 * and every linked lesson exists in public/lessons with the title below.
 */
export const PUZZLE_CONCEPTS:Record<string,{name:string;concept:ConceptId|null}>={
 'one-two':{name:'Give and go',concept:'one-two'},
 'one-two-on-the-clock':{name:'A fast one-two',concept:'one-two'},
 'one-two-plus-one':{name:'One-two, then one more pass',concept:'one-two'},
 'one-two-square-finish':{name:'One-two and a square pass',concept:'one-two'},
 'one-two-vs-hunter':{name:'One-two past a chasing defender',concept:'one-two'},
 'bounce-pass':{name:'Bounce pass',concept:'one-two'},
 'set-back':{name:'Lay it back, then go',concept:'one-two'},
 'third-man':{name:'Find the third player',concept:'third-man'},
 'third-man-run':{name:'Send the third runner',concept:'third-man'},
 'third-man-vs-sweeper':{name:'Third player past a rushing keeper',concept:'third-man'},
 'called-third-run':{name:'Call the third runner',concept:'third-man'},
 'up-back-through':{name:'Up, back, through',concept:'third-man'},
 'overlap':{name:'Run around the outside',concept:'overlap'},
 'switch':{name:'Switch to the empty side',concept:'switch-play'},
 'recycle-switch':{name:'Pass back to go forward',concept:'switch-play'},
 'recycle-switch-finish':{name:'Pass back, switch, finish',concept:'switch-play'},
 'set-and-switch':{name:'Set it, then switch',concept:'switch-play'},
 'set-switch-two-hunters':{name:'Switch away from two chasers',concept:'switch-play'},
 'switch-then-through':{name:'Switch, then play in behind',concept:'switch-play'},
 'beat-the-press':{name:'Escape the press',concept:'support-angle'},
 'two-hunters':{name:'Escape two chasers',concept:'support-angle'},
 'chain-under-press':{name:'Short passes around the press',concept:'support-angle'},
 'decoy-run':{name:'A decoy run makes space',concept:'support-angle'},
 'four-pass-move':{name:'Four passes in a row',concept:'support-angle'},
 'four-pass-recover':{name:'Keep it, then attack',concept:'support-angle'},
 'pass-into-feet':{name:'Pass to a friend’s feet',concept:'scan-receive'},
 'scan-open-lane':{name:'Look up first',concept:'scan-receive'},
 'scan-on-the-clock':{name:'Look, then strike fast',concept:'scan-receive'},
 'through-ball':{name:'Pass in behind',concept:'through-ball'},
 'through-ball-window':{name:'Pass through the gap',concept:'through-ball'},
 'early-through-ball':{name:'An early pass in behind',concept:'through-ball'},
 'line-breaking-pass':{name:'A pass that breaks the line',concept:'through-ball'},
 'pass-into-space':{name:'Pass into space ahead',concept:'through-ball'},
 'called-run':{name:'Make the run, get the pass',concept:'through-ball'},
 'offside-trap':{name:'Beat the offside trap',concept:'offside'},
 'recover-onside':{name:'Get back onside',concept:'offside'},
 'trap-and-hunter':{name:'Beat the trap and the chaser',concept:'offside'},
 'trap-hunter-recover':{name:'Stay onside under pressure',concept:'offside'},
 'trap-on-the-clock':{name:'Time your run onside',concept:'offside'},
 'cutback':{name:'Pull it back',concept:'cutback'},
 'far-post-header':{name:'Far-post header',concept:'far-post'},
 'near-post-header':{name:'Near-post header',concept:'far-post'},
 'corner-flick-on':{name:'Flick on from a corner',concept:'far-post'},
 'build-from-back':{name:'The keeper starts it',concept:'keeper-build'},
 'counter-forward-pass':{name:'Win it, pass forward fast',concept:'win-it'},
 'aerial-set-combination':{name:'Win the second ball',concept:'follow-in'},
 'free-kick-routine':{name:'A free-kick routine',concept:'restart-options'},
 'free-kick-in-behind':{name:'Free kick over the top',concept:'restart-options'},
 'flick-on':{name:'Flick it on',concept:null},
 'knock-down':{name:'Head it down to a friend',concept:null},
 'chip':{name:'Chip it over',concept:null},
 'curl':{name:'Bend the pass',concept:null},
 'free-kick-curl':{name:'Bend it round the wall',concept:null},
 'shot-placement':{name:'Aim for the far corner',concept:null},
 'sweeper-keeper':{name:'Beat the rushing keeper',concept:null},
 'crosswind-aim':{name:'Aim off in the wind',concept:null},
 'wind-ground-pass':{name:'Keep it low in the wind',concept:null},
 'wet-pitch-weight':{name:'Softer passes on a wet pitch',concept:null},
};
/** Titles of every lesson a puzzle can link to (public/lessons/<format>.json `name`; checked by the test). */
export const PUZZLE_LESSON_TITLES:Record<string,string>={
 "s_onetwo":"A Wall Pass, or Keep It",
 "learn9_wall":"A Return Pass Is a Choice",
 "e_thirdman":"Use the Next Teammate",
 "next7_outsideback":"Three Backs: Make the Outside Route",
 "nx9_fourthrunner":"3-2-3: Back Three, Fourth Runner",
 "exp11_insidefullback":"4-3-3: Fullback Inside or Outside?",
 "learn9_switch":"Find the Other Side",
 "e_switch":"Find the Open Side",
 "prn_7_support":"Step Out of the Blocked Lane",
 "prn_9_support":"Move Out of the Passing Shadow",
 "bld_11_whenlong":"Around the Pressure",
 "learn7_receive":"Look, Then Turn or Return",
 "learn9_receive":"Receive: Turn or Connect",
 "bld_11_throughlines":"Can You Turn?",
 "gap11_runoncue":"Run When the Pass Is On",
 "next7_offsideboundary":"Which Line Matters?",
 "learn11_cutback":"Look Behind the Defenders",
 "learnf_farpost":"Arrive at the Far Post",
 "bld_7_usekeeper":"Your Keeper Can Help",
 "bld_9_usekeeper":"Build With the Goalkeeper",
 "learn11_restart":"A Goal Kick Needs Two Options",
 "trn_9_firstpass":"Win It: Look, Then Choose",
 "next7_shotreaction":"Watch What Happens After the Shot",
 "next7_dribblein":"Start with Your Feet",
 "learn9_restart":"Two Options for a Restart",
};

/** The kid name of a scenario's concept, plus the concept map's one line in this format's words when it has one. */
export function puzzleConceptWords(tag:string,format:Format):{name:string;line:string|null}|null{
 const e=PUZZLE_CONCEPTS[tag];if(!e)return null;
 return{name:e.name,line:e.concept?conceptWords(e.concept,format).line:null};
}
/** The lesson to practise a concept: this game's lessons first (grass formats), the nearest format first; then any. */
export function puzzleConceptLesson(tag:string,format:Format):{id:string;title:string;href:string}|null{
 const c=PUZZLE_CONCEPTS[tag]?.concept;if(!c)return null;
 const key=conceptLessons(c,format,true)[0]??conceptLessons(c,format)[0];if(!key)return null;
 const id=splitLessonKey(key).lessonId,title=PUZZLE_LESSON_TITLES[id];
 return title?{id,title,href:`/learn/lessons/${id}`}:null;
}
/** Session fail counter per concept: the link is offered once the same concept has failed twice. */
export const PRACTISE_AFTER=2;
export function notePuzzleFail(counts:Map<string,number>,tag:string):number{const n=(counts.get(tag)??0)+1;counts.set(tag,n);return n;}
