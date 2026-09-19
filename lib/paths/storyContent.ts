import type {StoryId as AnyStoryId} from './stories';
type StoryId=Exclude<AnyStoryId,'futsl'>;
export type Story={name:string;opening:string;notice:string;question:string;choices:[{label:string;reply:string;bubble:string},{label:string;reply:string;bubble:string}];takeaway:string;practice:string;scene:'goal'|'whistle'|'practice'|'bench'|'score'};
export const STORIES:Record<StoryId,Story>={
 reset:{name:'Luna',scene:'goal',opening:'Luna misses a chance near the goal. Her shoulders drop. “I always mess up,” she thinks, while the game carries on.',notice:'A hot face and a tight stomach can be clues to disappointment. A miss is one moment, not a label for Luna.',question:'What could help Luna return to the next moment?',choices:[{label:'Use a reset word: “Next.”',bubble:'Next. I can help again.',reply:'Luna breathes out and says “Next.” She looks up and offers a passing option. The miss still hurts a little; she can help while feeling disappointed.'},{label:'Ask a teammate for support.',bubble:'Can you give me a quick cue?',reply:'Luna asks a teammate for a simple cue. “Look up—we need you.” Support helps her reconnect. Mental toughness can include asking for help.'}],takeaway:'Notice the feeling. Choose one action you can control.',practice:'At your next practice, try a reset word after one mistake. Notice what you do next—not whether the feeling vanishes.'},
 regulate:{name:'Jayden',scene:'whistle',opening:'Jayden thinks the ball went out off the other team. The call goes against him. His hands clench and he wants to shout.',notice:'Anger is a feeling; shouting is one possible action. Jayden can notice the feeling before choosing what to do.',question:'Which reset would you like to try with Jayden?',choices:[{label:'Unclench and breathe out slowly.',bubble:'Hands loose. One breath.',reply:'Jayden loosens his hands and takes an easy breath. He still disagrees, but can hear his teammate asking him to get ready for the restart.'},{label:'Ask for a moment with the coach.',bubble:'I need a moment to reset.',reply:'At a safe pause Jayden tells the coach he is upset. They choose a simple next job together. Asking for a moment is a useful skill.'}],takeaway:'Name it, make a little space, choose your response.',practice:'Away from a match, rehearse one reset you like. If something feels unsafe or someone is hurting you, tell a trusted adult.'},
 grit:{name:'Kai',scene:'practice',opening:'Kai is learning a turn. The ball keeps rolling away. After several tries, she wonders whether she should just keep going until she gets it.',notice:'Grit can mean returning with a better plan. More tired attempts are not always more useful attempts.',question:'How could Kai make the next practice useful?',choices:[{label:'Make the task smaller.',bubble:'One slow touch first.',reply:'Kai asks the coach for one cue and tries the first touch slowly. She notices one change before trying the whole turn again.'},{label:'Rest and plan a return.',bubble:'Rest now. Try again tomorrow.',reply:'Kai takes a break and chooses one small goal for the next session. Rest and help are part of learning. Pain is a reason to stop and tell an adult.'}],takeaway:'Try a small change, ask for feedback, and allow recovery.',practice:'Choose one small futbo skill. Try a few comfortable attempts, notice one change, and plan when to return. Progress does not need to be instant.'},
 empathy:{name:'Maya',scene:'bench',opening:'Maya sees Zoe sitting quietly after losing the ball. Zoe is looking down. Maya wants to help, but cannot tell exactly what Zoe is feeling.',notice:'Body language gives clues, not certainty. Zoe might be embarrassed, tired, worried, or something else.',question:'How could Maya make room for Zoe’s feelings?',choices:[{label:'Ask, then listen.',bubble:'Want to talk, or want some space?',reply:'Maya asks without guessing. Zoe says, “I’m embarrassed.” Maya listens: “That was a tough moment. I’m here.” Zoe does not have to feel better immediately.'},{label:'Offer a small way back in.',bubble:'I can be your next passing option.',reply:'Maya offers support without demanding a reply. When Zoe is ready, they try a simple pass together. Maya respects Zoe’s choice to take a little space first.'}],takeaway:'Ask instead of assuming. Listen before fixing.',practice:'At your next game, notice someone who is quiet. Offer a kind check-in and respect their answer.'},
 loss:{name:'Luna',scene:'score',opening:'The whistle goes. Luna’s team loses 1–2. She feels sad and does not want to talk about every mistake on the way home.',notice:'A loss can matter without deciding anyone’s worth. Reflection is easier when you are ready, not when someone forces it.',question:'What could Luna choose after this loss?',choices:[{label:'Take time, then name one lesson.',bubble:'I need time. We can talk later.',reply:'Luna rests first. Later she remembers one thing the team did well and one thing to practice. The score stays 1–2; the learning can continue.'},{label:'Reconnect with a teammate.',bubble:'That hurt. I’m glad we played together.',reply:'Luna checks in with a teammate. They can be disappointed and still appreciate each other. Later, with their coach, they choose one team goal for next time.'}],takeaway:'Feel the loss. Recover. Reflect when ready.',practice:'After your next match, choose when to reflect. Share one thing you valued and one small thing to practice—without blaming a teammate.'}
};

// Short screen copy; the longer source stories above preserve the educational intent.
export const STORY_BEATS:Record<StoryId,{opening:string;thought:string;question:string;options:[string,string];responses:[string,string];practice:string}>={
 reset:{opening:'Luna misses a shot. Her shoulders drop, but the game keeps moving.',thought:'“I always mess up.” Luna feels disappointed. One miss does not define her.',question:'Help Luna find her next moment.',options:['Say “Next.”','Ask a teammate'],responses:['Luna looks up and moves to help. She can still feel disappointed and take a useful next step.','A teammate offers a cue: “We still need you.” Asking for help is part of being strong.'],practice:'After a mistake, try one reset word. Then look for a way to help your team.'},
 regulate:{opening:'The call goes against Jayden. His hands tighten. He wants to shout.',thought:'“That felt unfair.” Jayden can notice his anger and choose what he does next.',question:'Choose a reset for Jayden.',options:['Loosen up. Breathe.','Talk to the coach'],responses:['One easy breath. Hands relax. Jayden still disagrees, but is ready to hear his teammate.','At a safe pause, Jayden asks for help. Together they choose his next job.'],practice:'Practice a reset when you feel calm. If someone hurts you or you feel unsafe, tell a trusted adult.'},
 grit:{opening:'Kai keeps losing the ball on a turn. More tired attempts are not helping.',thought:'“What if I try just the first touch?” A better plan can help more than pushing harder.',question:'Make the next practice useful.',options:['One smaller step','Rest, then return'],responses:['One slow touch. One cue from the coach. Kai notices what changed before trying more.','Kai rests and plans a small goal for tomorrow. Pain means stop and tell a trusted adult.'],practice:'Pick one small skill, ask for a useful cue, and make room for recovery.'},
 empathy:{opening:'Zoe sits quietly after losing the ball. Maya wants to help.',thought:'“I wonder how Zoe feels.” A quiet face gives clues, not a definite answer.',question:'How could Maya help?',options:['Ask and listen','Offer a simple pass'],responses:['“Want to talk, or need space?” Maya listens to Zoe’s answer instead of guessing.','“I can be your passing option.” They play when Zoe is ready. Space is okay too.'],practice:'Check in with a teammate. Listen to their answer before offering advice.'},
 loss:{opening:'Luna’s team loses 1–2. She feels sad and is not ready to talk about mistakes.',thought:'“Can we talk later?” The score tells the result, not Luna’s worth.',question:'What could help after the loss?',options:['Rest, then reflect','Find a teammate'],responses:['When ready, Luna remembers one good effort and one thing to practice. The score stays 1–2.','“I’m glad we played together.” They can value each other and still feel disappointed.'],practice:'When you are ready, share one thing you valued and one thing to practice—without blame.'}
};

// Original closing lines, written for these stories rather than attributed quotations.
export const STORY_CHAPTERS:Record<StoryId,{lines:string[];quote:string}>={
 reset:{lines:[
 'The shot goes wide. I was sure I could score from there.',
 'My face feels hot. I want to stare at the ground and disappear.',
 'I am telling myself I always miss. But that is not the whole story.',
 'Earlier I made a useful pass. This mistake does not erase that.',
 'One slow breath out. My reset word is: Next.',
 'The other team has the ball. What can I do right now?',
 'I can look up, find my player, and help defend.',
 'Now we have it back. I will move sideways to offer a passing angle.',
 'I still feel disappointed. I do not have to wait for that feeling to leave.',
 'I can ask Kai for a cue when I lose focus. We help each other.',
 'Next practice, I will try my reset word after a miss, then choose one useful action.'
 ],quote:'One missed chance does not take away your next useful moment.'},
 regulate:{lines:[
 'I thought that ball came off their foot. The call went against us.',
 'My hands are tight. My chest feels hot. I want to shout.',
 'I can feel angry without letting anger choose my next move.',
 'First, loosen my hands. Let one easy breath out.',
 'I still disagree. Breathing does not mean I have to like the call.',
 'The restart is coming. Arguing now would leave my teammate alone.',
 'I can get into position and watch the ball. That is my next job.',
 'At the next safe pause, I can ask Coach for help finding a calm response.',
 'If someone is hurting me or I feel unsafe, I should tell a trusted adult.',
 'When I am calm at practice, I can rehearse this reset so it feels familiar.',
 'Notice the feeling. Make a little space. Choose what helps next.'
 ],quote:'Your feeling deserves attention. Your next action deserves a choice.'},
 grit:{lines:[
 'That turn went wrong again. The ball keeps escaping my foot.',
 'I have tried it over and over. Now I am rushing and getting tired.',
 'Doing more of the same is not helping. I need a smaller plan.',
 'I will ask Coach for one cue instead of trying to fix everything.',
 'First, one slow touch. Keep the ball close enough for my next step.',
 'That touch stayed closer. I can notice a small improvement without a perfect turn.',
 'Now try the touch and the turn together, slowly.',
 'It rolled away again. That tells me what to work on, not who I am.',
 'Time for a break. If something hurts, I stop and tell a trusted adult.',
 'Tomorrow I can return to that first touch and ask for feedback.',
 'A useful practice goal is one small change, with time to rest and return.'
 ],quote:'Progress grows from small changes you can return to.'},
 empathy:{lines:[
 'Zoe has gone quiet since losing the ball. I wonder what is happening.',
 'Looking down could mean lots of things. I cannot read Zoe’s mind.',
 'I will come closer without crowding, and ask if Zoe wants company.',
 'I can ask: Want to talk, or would you like some space?',
 'Then I need to pause and listen. Helping is not a race to give advice.',
 'If Zoe feels embarrassed, I can say that sounds like a tough moment.',
 'I do not need to say it is nothing. It matters to Zoe.',
 'If Zoe wants space, I can respect that and stay available.',
 'When Zoe is ready, I can offer one easy passing option.',
 'A simple pass together can be a way back in, without demanding a smile.',
 'Next game, I will check in, listen, and let my teammate choose what helps.'
 ],quote:'A good teammate makes room for another person’s feelings.'},
 loss:{lines:[
 'The final whistle goes. We lost 1–2. I really wanted this one.',
 'I feel sad, and I am not ready to list every mistake.',
 'I can say: I need some time. Can we talk about the game later?',
 'The score tells us who won today. It does not tell us what we are worth.',
 'First I will recover, have some water, and reconnect with my team.',
 'I can appreciate playing together and still feel disappointed.',
 'Later, when I am ready, I can remember one thing we did well.',
 'We kept offering passes after falling behind. That effort mattered.',
 'One thing to practice: helping the player with the ball find an option.',
 'We can work on that together instead of blaming the teammate who lost it.',
 'Next practice, we bring one lesson forward. We do not have to carry every mistake.'
 ],quote:'The result stays on the scoreboard. The lesson comes with you.'}
};
