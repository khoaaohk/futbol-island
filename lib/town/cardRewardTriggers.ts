'use client';
import {earnCardOffer,cardRewardsActive,type EarnRequest,type EarnResult} from './cardRewardStore';
import {quizEarnsCard,themeFromText} from './cardRewards';
import {CARD_QUIZ_FIRST_TRY,hasCorrectQuizAnswer,quizCardEligible} from './quizProgress';
import {EXPLORE_ITEMS} from './exploreChecklist';
import {journeyById,type LearningId} from './learningJourneys';
import {STORY_CARDS} from '../paths/stories';
import {UPCOMING_STORIES} from '../paths/upcomingStories';

/**
 * The three card-reward triggers (docs/card-rewards.md). Each builds the offer's one-line teaching reason from what the child
 * just did, and the theme (the positions it was about) used only when THEME_ONE_CARD is on.
 */
const TAIL='Here are three players to learn from.';

const tipTitle=(teaching:string)=>teaching.slice(0,Math.max(0,teaching.indexOf('.')))||teaching;
/** A Ball hunt ball was collected for the first time (Town's coin-hunt handoff, before the ball lesson shows). */
export function earnForBall(spot:{id:string;teaching:string}):EarnResult{
 if(!cardRewardsActive())return 'off';
 return earnCardOffer({kind:'ball',id:spot.id,reason:`You found a ball and learned “${tipTitle(spot.teaching)}”. ${TAIL}`,theme:themeFromText(tipTitle(spot.teaching))});
}

/** A chat with an islander was finished: the child asked a topic and its follow-up, then closed the chat. */
export function earnForNpc(npc:{id:string;name:string;role:string},topics:string):EarnResult{
 if(!cardRewardsActive())return 'off';
 return earnCardOffer({kind:'npc',id:npc.id,reason:`You learned from ${npc.name}, ${npc.role.split(' · ')[0].toLowerCase()}. ${TAIL}`,theme:themeFromText(`${npc.role} ${topics}`,/futsal/i.test(npc.role))});
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
 if(!cardRewardsActive()||!lesson.questions.length)return 'off';
 const allCorrect=lesson.questions.every((_,i)=>correctThisRun.has(i)||!CARD_QUIZ_FIRST_TRY&&hasCorrectQuizAnswer(lesson.fmt,lesson.id,i));
 if(!quizEligibleForCard(lesson.questions.length,allCorrect))return 'off';
 const theme=themeFromText(`${lesson.catalog?.category??''} ${lesson.name}`,lesson.fmt==='futsal');
 return earnCardOffer({kind:'quiz',id:`${lesson.fmt}:${lesson.id}`,reason:`You passed “${lesson.name}”${theme?`, a quiz about ${theme.label}`:''}. ${TAIL}`,theme});
}

const firstSentence=(text:string)=>text.split(/(?<=[.!?])\s/)[0];

/** Explore items that pay a pick. `knock-characters` is left out: RETENTION-RESEARCH.md rules out learning rewards for knocking
 *  people over. */
export const CARD_EXPLORE_ITEMS=EXPLORE_ITEMS.filter(item=>item.id!=='knock-characters');
function exploreRequest(id:string):EarnRequest|null{
 const item=CARD_EXPLORE_ITEMS.find(x=>x.id===id);if(!item)return null;
 return {kind:'explore',id,reason:`You completed “${item.title}” on your island checklist. ${firstSentence(item.detail)} ${TAIL}`,theme:themeFromText(item.title,/futsal/i.test(item.title))};
}
/** An Explore checklist item newly completed (the watcher in CardOfferHost; there is no completion event). Once per item, ever. */
export function earnForExplore(id:string):EarnResult{if(!cardRewardsActive())return 'off';const request=exploreRequest(id);return request?earnCardOffer(request):'off';}

const STAGE_NAMES=['See it','Try with help','Your decision','Change the situation','Spot it again','Another situation'];
function journeyRequest(id:string,stage:number):EarnRequest|null{
 const journey=journeyById(id as LearningId);if(!journey||!STAGE_NAMES[stage])return null;
 return {kind:'journey',id:`${id}:${stage}`,reason:`You finished “${STAGE_NAMES[stage]}” in the ${journey.title} journey, practising ${journey.concept.toLowerCase()}. ${TAIL}`,theme:themeFromText(`${journey.concept} ${journey.title}`,journey.format==='futsal')};
}
/** A Learning Journey stage was newly completed (LEARNING_STAGE_COMPLETE from learningProgress). Once per stage, ever. */
export function earnForJourney(id:string,stage:number):EarnResult{if(!cardRewardsActive())return 'off';const request=journeyRequest(id,stage);return request?earnCardOffer(request):'off';}

/** Story topics as they read in "a story about …" (the futsal story's skill label is "Love Futsal"). */
const STORY_TOPIC:Record<string,string>={futsl:'loving futsal'};
const ALL_STORIES=[...STORY_CARDS.map(card=>({id:card.id as string,title:card.title as string,topic:STORY_TOPIC[card.id]??(card.skill as string)})),...Object.values(UPCOMING_STORIES).flat().map(story=>({id:story.id,title:story.title,topic:story.theme}))];
function storyRequest(id:string):EarnRequest|null{
 const story=ALL_STORIES.find(x=>x.id===id);if(!story)return null;
 return {kind:'story',id,reason:`You watched “${story.title}” to the end, a story about ${story.topic.toLowerCase()}. ${TAIL}`,theme:/futsal/i.test(`${story.title} ${story.topic}`)?themeFromText('',true):undefined};
}
/** A path story (life story or optional story) was watched to the end (QuestLearningPath). Once per story, ever. */
export function earnForStory(id:string):EarnResult{if(!cardRewardsActive())return 'off';const request=storyRequest(id);return request?earnCardOffer(request):'off';}
