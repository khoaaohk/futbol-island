/**
 * Pass Puzzles combo beats (Oct 25 2026, docs/ARCADE_PASSPUZZLES_UPGRADE_OCT25.md): small pure rules for
 * the live callouts that name a combination as it happens ("One-two!"), the first-try streak across puzzles,
 * and who does which celebration after a goal. No state, no randomness: replays and tests agree.
 */
import type {SkillMove} from '../graphics/skillMoves';

type ChainKick={kicker:number;firstTime:boolean;kind?:string};
/** tier 1 = a plain pass, 2 = a named combination, 3 = a goal. */
export type Callout={text:string;teach:string;tier:1|2|3};

/** A completed pass: name the combination the child just made. chain = kicks so far (the received pass last). */
export function passCallout(chain:readonly ChainKick[],receiver:number,passes:number):Callout|null{
 if(passes<1||!chain.length)return null;
 const last=chain[chain.length-1],before=chain.length>1?chain[chain.length-2]:undefined;
 // Receiver gets it back from the teammate they just passed to: the wall pass.
 if(before&&before.kicker===receiver&&last.kicker!==receiver)return{text:'One-two!',teach:'Pass and move: you got it straight back.',tier:2};
 if(last.firstTime&&chain.length>1)return{text:'First time!',teach:'One touch: no time for the defence to close.',tier:2};
 if(passes>=3)return{text:`Tiki-taka ×${passes}`,teach:'Short, quick passes keep the ball moving.',tier:2};
 if(passes===2)return{text:'Keep it moving!',teach:'Two passes: the defence has to shift again.',tier:1};
 return{text:'Nice pass!',teach:'Found your teammate.',tier:1};
}

/** The goal callout: how the move was finished. */
export function goalCallout(passes:number,firstTime:boolean):Callout{
 if(passes<=0)return{text:'GOAL! Straight in',teach:'You saw the shooting lane and took it.',tier:3};
 return{text:`GOAL! ${passes}-pass move`,teach:firstTime?'Finished first time, before the keeper could set.':'The passes opened the goal.',tier:3};
}

/** First-try streak across puzzles this visit: a first-try solve (no rewind) grows it, a miss resets it, other solves keep it. */
export function nextStreak(streak:number,success:boolean,firstTry:boolean):number{
 if(!success)return 0;
 return firstTry?Math.max(0,streak|0)+1:Math.max(0,streak|0);
}
export const streakLabel=(n:number)=>n>=2?`Streak ×${n}`:'';

/** Who celebrates how: the scorer alternates a knee slide and the airplane, the last passer high-fives, the rest share it. */
export function celebrationFor(i:number,scorer:number,assister:number,serial:number):SkillMove{
 if(i===scorer)return serial%2?'airplane':'kneeSlide';
 if(i===assister)return 'highFive';
 return i%2?'fistBump':'thankPasser';
}
