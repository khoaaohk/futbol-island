'use client';
import {earnCardOffer,cardRewardsActive,type EarnRequest,type EarnResult} from './cardRewardStore';
import {TIER_TEACHING_LINE,themeFromText} from './cardRewards';
import {FORMAT_PATHS} from '../paths/formatPaths';
import {CARD_QUIZ_FIRST_TRY,hasCorrectQuizAnswer,quizCardEligible} from './quizProgress';
import {EXPLORE_ITEMS} from './exploreChecklist';
import {journeyById,type LearningId} from './learningJourneys';
import {STORY_CARDS} from '../paths/stories';
import {UPCOMING_STORIES} from '../paths/upcomingStories';
import {creditOnce} from '../arcade/arcadeWallet';
import {createLearnCoins,LEARN_COINS_EARNED,type LearnKind} from './learnCoins';

/**
 * The three card-reward triggers (docs/card-rewards.md). Each builds the offer's one-line teaching reason from what the child
 * just did, and the theme (the positions it was about) used only when THEME_ONE_CARD is on.
 */

const tipTitle=(teaching:string)=>teaching.slice(0,Math.max(0,teaching.indexOf('.')))||teaching;
/** Learning coins (lib/town/learnCoins.ts, economy pass 28 Sep 2026): paid once ever next to each card trigger, even when card
 *  rewards are off, never capped. The island HUD shows the toast (IslandJobs listens for LEARN_COINS_EARNED). */
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});
const payLearning=(kind:LearnKind,id:string,reason:string,perfect=false)=>{void learnCoins.pay(kind,id,reason,perfect);};
/** A Ball hunt ball was collected for the first time (Town's coin-hunt handoff, before the ball lesson shows). */
export function earnForBall(spot:{id:string;teaching:string}):EarnResult{
 payLearning('ball',spot.id,'You found a hidden ball');
 if(!cardRewardsActive())return 'off';
 return earnCardOffer({kind:'ball',id:spot.id,reason:`You found a ball: “${tipTitle(spot.teaching)}”.`,theme:themeFromText(tipTitle(spot.teaching))});
}

/** A chat with an islander was finished: the child asked a topic and its follow-up, then closed the chat. */
export function earnForNpc(npc:{id:string;name:string;role:string},topics:string):EarnResult{
 if(!cardRewardsActive())return 'off';
 return earnCardOffer({kind:'npc',id:npc.id,reason:`You learned from ${npc.name}, ${npc.role.split(' · ')[0].toLowerCase()}.`,theme:themeFromText(`${npc.role} ${topics}`,/futsal/i.test(npc.role))});
}

/**
 * THE quiz eligibility rule for card rewards, in one place. For now: at least
 * MIN_CARD_QUIZ_QUESTIONS (5) questions, all answered correctly. Delegates to quizCardEligible in quizProgress.ts (the quiz engine's rule).
 */
export function quizEligibleForCard(questions:number,allCorrect:boolean):boolean{return quizCardEligible(questions,allCorrect);}

/**
 * A lesson quiz ended. It pays (once per lesson, ever) only when quizEligibleForCard agrees: 5+ questions, every one correct
 * in this run. With CARD_QUIZ_FIRST_TRY (on) that means a clean first-try run and earlier visits don't count; otherwise retries
 * and answers from earlier visits count. One offer per quiz, never per question.
 */
export function earnForQuiz(lesson:{id:string;name:string;fmt:string;questions:unknown[];catalog?:{category?:string}},correctThisRun:Set<number>):EarnResult{
 // Coins for the first completion (+ a bonus when that run is perfect on the first try, the same run that earns the card).
 if(lesson.questions.length)payLearning('quiz',`${lesson.fmt}:${lesson.id}`,`You passed ‘${lesson.name}’`,CARD_QUIZ_FIRST_TRY&&lesson.questions.every((_,i)=>correctThisRun.has(i)));
 if(!cardRewardsActive()||!lesson.questions.length)return 'off';
 const allCorrect=lesson.questions.every((_,i)=>correctThisRun.has(i)||!CARD_QUIZ_FIRST_TRY&&hasCorrectQuizAnswer(lesson.fmt,lesson.id,i));
 if(!quizEligibleForCard(lesson.questions.length,allCorrect))return 'off';
 const theme=themeFromText(`${lesson.catalog?.category??''} ${lesson.name}`,lesson.fmt==='futsal');
 return earnCardOffer({kind:'quiz',id:`${lesson.fmt}:${lesson.id}`,reason:`You passed “${lesson.name}”.`,theme});
}


/** Explore items that pay a pick. `knock-characters` is left out: RETENTION-RESEARCH.md rules out learning rewards for knocking
 *  people over. Simply visiting a field or opening the parachute is too easy for a card (user, Sep 27 2026): those items still
 *  tick off in the Explore checklist, but pay no pick. */
// G-13 (Sep 30 2026): the new "go somewhere" items (Coral Cay, the East Jetty, a Konbini) follow the same rule as visiting a field:
// they tick off but pay nothing. Catching a fish, finishing a job and selling at Rosa's take effort, so they pay like the others
// (5 learning coins once + a card pick). The watcher's first-run baseline means saves that already did them are not paid twice.
const NO_CARD_EXPLORE=new Set(['knock-characters','visit-futsal','visit-7v7','visit-9v9','visit-11v11','use-parachute','visit-store','ride-truck','roof-drop','ramp-trick','visit-cay','walk-jetty','enter-konbini','visit-museum']);
export const CARD_EXPLORE_ITEMS=EXPLORE_ITEMS.filter(item=>!NO_CARD_EXPLORE.has(item.id));
function exploreRequest(id:string):EarnRequest|null{
 const item=CARD_EXPLORE_ITEMS.find(x=>x.id===id);if(!item)return null;
 return {kind:'explore',id,reason:`You completed “${item.title}”.`,theme:themeFromText(item.title,/futsal/i.test(item.title))};
}
/** An Explore checklist item newly completed (the watcher in CardOfferHost; there is no completion event). Once per item, ever. */
export function earnForExplore(id:string):EarnResult{const item=CARD_EXPLORE_ITEMS.find(x=>x.id===id);if(item)payLearning('explore',id,`You completed ‘${item.title}’`);if(!cardRewardsActive())return 'off';const request=exploreRequest(id);return request?earnCardOffer(request):'off';}

const STAGE_NAMES=['See it','Try with help','Your decision','Change the situation','Spot it again','Another situation'];
function journeyRequest(id:string,stage:number):EarnRequest|null{
 const journey=journeyById(id as LearningId);if(!journey||!STAGE_NAMES[stage])return null;
 return {kind:'journey',id:`${id}:${stage}`,reason:`You finished “${STAGE_NAMES[stage]}” in ${journey.title}.`,theme:themeFromText(`${journey.concept} ${journey.title}`,journey.format==='futsal')};
}
/** A Learning Journey stage was newly completed (LEARNING_STAGE_COMPLETE from learningProgress). Once per stage, ever. */
export function earnForJourney(id:string,stage:number):EarnResult{const journey=journeyById(id as LearningId);if(journey&&STAGE_NAMES[stage])payLearning('journey',`${id}:${stage}`,`You finished ‘${STAGE_NAMES[stage]}’ in ${journey.title}`);if(!cardRewardsActive())return 'off';const request=journeyRequest(id,stage);return request?earnCardOffer(request):'off';}

/** Story topics as they read in "a story about …" (the futsal story's skill label is "Love Futsal"). */
const STORY_TOPIC:Record<string,string>={futsl:'loving futsal'};
const ALL_STORIES=[...STORY_CARDS.map(card=>({id:card.id as string,title:card.title as string,topic:STORY_TOPIC[card.id]??(card.skill as string)})),...Object.values(UPCOMING_STORIES).flat().map(story=>({id:story.id,title:story.title,topic:story.theme}))];
function storyRequest(id:string):EarnRequest|null{
 const story=ALL_STORIES.find(x=>x.id===id);if(!story)return null;
 return {kind:'story',id,reason:`You watched “${story.title}”.`,theme:/futsal/i.test(`${story.title} ${story.topic}`)?themeFromText('',true):undefined};
}
/** A path story (life story or optional story) was watched to the end (QuestLearningPath). Once per story, ever. */
export function earnForStory(id:string):EarnResult{const story=ALL_STORIES.find(x=>x.id===id);if(story)payLearning('story',id,`You watched ‘${story.title}’`);if(!cardRewardsActive())return 'off';const request=storyRequest(id);return request?earnCardOffer(request):'off';}

/** A path's starter lessons were all completed (the watcher in CardOfferHost). Once per path, ever. With PATH_FINISH_ICON the
 *  offer holds Icons only (tierGate), so the child's end-of-path pick is always one of the greatest players. */
export function earnForPath(format:string):EarnResult{
 const path=FORMAT_PATHS.find(p=>p.format===format);if(!path)return 'off';
 payLearning('path',format,`You finished the ${path.title} path`);
 if(!cardRewardsActive())return 'off';
 return earnCardOffer({kind:'path',id:format,reason:`You finished the ${path.title} path! ${TIER_TEACHING_LINE}`});
}
