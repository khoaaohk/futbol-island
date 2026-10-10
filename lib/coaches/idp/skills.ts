/**
 * IDP v2 skill families (docs/idp/DESIGN.md §2–§4, Oct 9 2026). Every "I can…" goal in lib/coaches/idp.ts belongs to one
 * family, and the family carries everything the three audiences need:
 *  - PLAYER: three weekly missions (home, training, island), each linked to the exact island lesson, arcade game, position
 *    card or story that trains the idea;
 *  - PARENT: the idea in plain words, what it looks like on the pitch (a tiny play diagram), "Ask about…" conversation starters,
 *    a 10-minute home activity (lib/grownups/practice.ts) and one skill-specific thing to avoid;
 *  - COACH: a Play–Practice–Play session outline and three cue phrases a coach can attach to a goal QR.
 * Pure data. Language rules (tests/coaches-idp-v2.cjs): process words only, never a score, a rank or a comparison.
 */
import type {SkillId} from '../idp';

/** Where a mission's practice happens. Island missions happen inside the game. */
export type MissionWhere='home'|'training'|'island';
/** What a mission opens on the island. `lesson` resolves to the goal's own format-specific lessons (lib/coaches/idp.ts). */
export type LinkKind='lesson'|'arcade'|'card'|'story';
export type Mission={id:string;where:MissionWhere;title:string;steps:string[];minutes:number;link:LinkKind};
/** lib/arcade/arcadeCatalog.ts cabinet ids; /arcade?game=<id> opens one. */
export type ArcadeId='live'|'runner'|'tennis'|'pinball'|'puzzle';
export const ARCADE_NAMES:Record<ArcadeId,{name:string;skill:string}>={
 live:{name:'Island Strikers',skill:'Look for the free teammate, then pass.'},
 runner:{name:'Breakaway Run',skill:'Carry the ball past the tackle.'},
 tennis:{name:'Futbol Tennis',skill:'Control your first touch.'},
 pinball:{name:'Futbol Pinball',skill:'Read the bounce and time your block.'},
 puzzle:{name:'Pass Puzzles',skill:'See the space and draw the pass.'},
};
/** lib/paths/stories.ts ids, and the Paths format whose opening story it is (Paths opens there). */
export type StoryLink={id:'regulate'|'grit'|'reset'|'empathy';format:'7v7'|'9v9'|'11v11';title:string};
/** Tiny animated play diagram (components/idp/Art.tsx PlayDiagram): positions on a 100×64 pitch, one run and one ball path. */
export type Diagram={us:[number,number][];them:[number,number][];ball:[number,number];run?:string;pass?:string;look?:[number,number];caption:string};
export type Skill={
 id:SkillId;kid:string;
 /** The idea in plain grown-up words. */
 grownWhy:string;
 diagram:Diagram;
 /** Conversation starters: "Ask about…", never "How did you play?". */
 askAbout:[string,string,string];
 /** The one skill-specific thing to avoid (the general list is AVOID_ALWAYS). */
 avoid:string;
 /** lib/grownups/practice.ts PRACTICES id: the 10-minute home activity. */
 home:string;
 missions:[Mission,Mission,Mission];
 arcade?:ArcadeId;
 /** A position card that plays the role this idea belongs to (role-level claim only; lib/town/positionPlayers.json). */
 card?:{name:string;role:string};
 story?:StoryLink;
 /** Coach: Play–Practice–Play (US Soccer grassroots), about 45 minutes, plus three cue phrases for the goal QR. */
 session:{play:string;practice:string;playAgain:string};
 cues:[string,string,string];
};

const lesson='lesson',arcade='arcade',card='card',story='story';
export const SKILLS:Record<SkillId,Skill>={
 scan:{id:'scan',kid:'Look around',grownWhy:'Good players glance around before the ball arrives, so they already know whether to turn, pass or keep it. It is a habit, built by lots of small looks.',
  diagram:{us:[[30,40],[62,22]],them:[[52,36]],ball:[30,40],look:[62,30],pass:'M30 40 Q46 30 62 22',caption:'Look over your shoulder first, then you know where to go.'},
  askAbout:['Ask about a time they looked around before the ball came. What did they see?','Ask: “Who was free when you looked?”','Ask them to show you their shoulder check in the kitchen.'],
  avoid:'Shouting “look up!” from the sideline. Ask about it afterwards instead, when they bring it up.',home:'look-turn',
  missions:[
   {id:'scan-fingers',where:'home',title:'Finger flash',steps:['A grown-up passes you the ball.','Before it reaches you, look at their hand: 1 finger or 2?','1 = turn with it. 2 = pass it back.'],minutes:10,link:lesson},
   {id:'scan-two-looks',where:'training',title:'Two looks',steps:['Before a pass comes to you, look over your shoulder.','Try it two times in one game.','Tell your coach what you saw.'],minutes:0,link:card},
   {id:'scan-strikers',where:'island',title:'Spot the free player',steps:['Play Island Strikers.','Before you pass, find the teammate with no one near them.'],minutes:5,link:arcade},
  ],
  arcade:'live',card:{name:'Xavi Hernández',role:'Midfielder'},
  session:{play:'4v4 small-sided game, two small goals each end. Let them play.',practice:'Rondo 4v1 in a square: before every pass you receive, say the colour of a bib the coach holds up behind you.',playAgain:'4v4 again: a goal counts double if the scorer checked their shoulder before receiving.'},
  cues:['Check your shoulder before the pass.','Look, then choose: turn or pass back.','Two looks before the ball.']},
 space:{id:'space',kid:'Get free',grownWhy:'A teammate can only pass to you if no defender is in the way. Taking a couple of steps to the side opens a line for the ball.',
  diagram:{us:[[24,32],[66,40]],them:[[46,36]],ball:[24,32],run:'M66 40 Q70 30 68 20',pass:'M24 32 Q46 22 68 20',caption:'Step out from behind the defender so the pass can reach you.'},
  askAbout:['Ask where they moved so a teammate could pass to them.','Ask: “Was a defender ever in the way? What did you do?”','Ask them to show you with two cups and a coin where they stood.'],
  avoid:'Telling them exactly where to stand during the game. Let them find the space; talk it through later.',home:'hide-seek',
  missions:[
   {id:'space-hide-seek',where:'home',title:'Hide-and-seek passing',steps:['Put a chair between you and a grown-up.','Take small side-steps until you can see their feet.','Call “yes!” and get the pass.'],minutes:10,link:lesson},
   {id:'space-two-steps',where:'training',title:'Two steps to be free',steps:['When a defender blocks the pass, take two steps to the side.','Call for the ball.'],minutes:0,link:lesson},
   {id:'space-puzzle',where:'island',title:'Find the lane',steps:['Play Pass Puzzles.','Draw a pass that goes around the defender.'],minutes:5,link:arcade},
  ],
  arcade:'puzzle',card:{name:'Pedri',role:'Midfielder'},
  session:{play:'5v5 game with wide gates as goals.',practice:'3v1 keep-ball: the two players without the ball must always make a triangle with the passer.',playAgain:'5v5 again: freeze it once and ask “who can the passer see?”'},
  cues:['Two steps out of the shadow.','Can the passer see you?','Move after you pass.']},
 defend:{id:'defend',kid:'Protect our goal',grownWhy:'Defending starts with standing in the right place: between the ball and your own goal. From there it is hard for the other team to score.',
  diagram:{us:[[40,40]],them:[[70,30]],ball:[70,30],run:'M40 40 Q52 34 58 32',caption:'Stay on the goal side: between the ball and your goal.'},
  askAbout:['Ask where they stood when the other team had the ball.','Ask: “What helps you stay goal-side?”','Ask them to be the defender for one minute in the garden, and to tell you their plan.'],
  avoid:'Shouting “tackle!” or “get stuck in!”. Patient, goal-side defending is the skill they are building.',home:'shadow',
  missions:[
   {id:'defend-shadow',where:'home',title:'Shadow the ball',steps:['A grown-up dribbles slowly.','Stay between them and a cone (your goal).','Don’t dive in. Just stay goal-side.'],minutes:10,link:lesson},
   {id:'defend-check',where:'training',title:'Goal-side check',steps:['When the other team has the ball, check: am I between it and our goal?','If not, run until you are.'],minutes:0,link:card},
   {id:'defend-pinball',where:'island',title:'Read the bounce',steps:['Play Futbol Pinball.','Watch where the ball will go before you block.'],minutes:5,link:arcade},
  ],
  arcade:'pinball',card:{name:'Virgil van Dijk',role:'Centre-back'},
  session:{play:'4v4 with end zones.',practice:'1v1 channels: the defender starts goal-side and wins a point for every 5 seconds they stay between the attacker and the gate.',playAgain:'4v4 again: celebrate any defender who gets goal-side after losing the ball.'},
  cues:['Ball, you, goal: in a line.','Stay on your feet.','Slow them down, then win it.']},
 recover:{id:'recover',kid:'Race back',grownWhy:'The seconds after losing the ball are when the other team is most dangerous. Running back straight away protects the middle while the team gets organised.',
  diagram:{us:[[64,30]],them:[[60,36]],ball:[60,36],run:'M64 30 Q50 34 36 32',caption:'Lost it? Run back to the middle first.'},
  askAbout:['Ask what they did right after their team lost the ball.','Ask: “Where is the middle on your pitch?”','Ask what it feels like to win the ball back.'],
  avoid:'Blaming them for losing the ball. Losing it is normal; the skill is what they do next.',home:'lost-it',
  missions:[
   {id:'recover-race',where:'home',title:'Lost it? Race back!',steps:['Pass with a grown-up.','When they shout “Lost it!”, race to a cone behind you.','Turn and face them. Five goes, then rest.'],minutes:10,link:lesson},
   {id:'recover-first',where:'training',title:'First three steps',steps:['The moment your team loses the ball, take three fast steps back.','Then look: where is the ball?'],minutes:0,link:lesson},
   {id:'recover-card',where:'island',title:'Meet a full-back',steps:['Open the card in your binder.','Full-backs race back to help all game long.'],minutes:3,link:card},
  ],
  card:{name:'Achraf Hakimi',role:'Full-back'},
  session:{play:'5v5 game with small goals. Let them play and watch what happens when the ball is lost.',practice:'Transition game: when the coach calls “switch!”, the team in possession drops the ball and races back behind a line before it can defend.',playAgain:'5v5 again: count (out loud, as a team) how fast everyone gets back after losing it.'},
  cues:['Lost it? Three fast steps back.','Middle first.','Run back together.']},
 talk:{id:'talk',kid:'Talk to my team',grownWhy:'Teams that talk play better together: a call like “I’ve got ball!” or “Cover!” tells everyone their job. Speaking up takes courage, so it is a real skill.',
  diagram:{us:[[36,36],[50,44]],them:[[66,30]],ball:[66,30],run:'M36 36 Q50 32 58 31',caption:'One calls “I’ve got ball!”, the other says “Cover!”.'},
  askAbout:['Ask who they talked to on the field today, and what they said.','Ask: “What is your favourite thing to call out?”','Ask whether anyone called their name. How did it help?'],
  avoid:'Asking them to be louder in front of others. Practise the words at home where it feels safe.',home:'say-it',
  missions:[
   {id:'talk-say-it',where:'home',title:'“I’ve got ball!” game',steps:['One person dribbles.','Before you move, call “I’ve got ball!” or “Cover!”.','Swap jobs.'],minutes:10,link:lesson},
   {id:'talk-one-call',where:'training',title:'One clear call',steps:['Pick one call: “Man on!”, “Turn!” or “Cover!”.','Say it at least three times at training.'],minutes:0,link:lesson},
   {id:'talk-keeper',where:'island',title:'Meet a goalkeeper',steps:['Open the card in your binder.','Keepers see the whole pitch and talk to the team.'],minutes:3,link:card},
  ],
  card:{name:'Alisson',role:'Goalkeeper'},
  session:{play:'4v4 game. Notice who talks and who stays quiet; no instructions yet.',practice:'2v2 defending pairs: a pair only scores a defensive point when one calls “ball” and the other calls “cover” before the attack ends.',playAgain:'4v4 again: the coach listens for names and calls, and praises each one.'},
  cues:['Say a name, then the job.','“I’ve got ball!” — “Cover!”','Talk early, not late.']},
 touch:{id:'touch',kid:'First touch',grownWhy:'The first touch decides what happens next. A soft touch, or a touch away from a defender, gives the player time to choose.',
  diagram:{us:[[40,36],[70,26]],them:[[52,30]],ball:[70,26],pass:'M70 26 Q56 32 40 36',run:'M40 36 Q38 42 34 44',caption:'Touch the ball away from the defender, into space.'},
  askAbout:['Ask which touch felt the softest today.','Ask: “Where did you send your first touch?”','Ask them to show you their softest touch with a rolled ball.'],
  avoid:'Groaning or sighing when a touch bounces away. Every bounce is practice.',home:'wall-pass',
  missions:[
   {id:'touch-wall',where:'home',title:'Wall rebounds',steps:['Pass the ball against a wall or step.','Stop it with one soft touch.','Ten times with each foot.'],minutes:10,link:lesson},
   {id:'touch-away',where:'training',title:'Touch away',steps:['When a pass comes, touch it away from the nearest defender.','Try it three times.'],minutes:0,link:lesson},
   {id:'touch-tennis',where:'island',title:'Futbol Tennis touch',steps:['Play Futbol Tennis.','Cushion the ball before you hit it back.'],minutes:5,link:arcade},
  ],
  arcade:'tennis',card:{name:'Andrés Iniesta',role:'Midfielder'},
  session:{play:'4v4 game with lots of short passes. Watch where first touches go.',practice:'Pairs, 10 m apart: receive, take a touch through a small cone gate to one side, pass back. Swap sides each time.',playAgain:'4v4 again: point out every first touch that went into space.'},
  cues:['Soft touch, like catching an egg.','Touch it away from pressure.','Decide your touch before the ball arrives.']},
 dribble:{id:'dribble',kid:'Carry the ball',grownWhy:'Dribbling with small touches and the head up lets a player see when to keep going and when to pass.',
  diagram:{us:[[24,36],[60,22]],them:[[50,38]],ball:[24,36],run:'M24 36 Q40 42 58 40',caption:'Small touches, head up, and choose: keep going or pass.'},
  askAbout:['Ask what they saw when they looked up while dribbling.','Ask: “When did you keep going, and when did you pass?”','Ask them to dribble around the garden and call out what they can see.'],
  avoid:'Calling them “greedy” for dribbling. Trying to dribble is how they learn when to pass.',home:'cone-gate-1v1',
  missions:[
   {id:'dribble-gate',where:'home',title:'Cone-gate dribble',steps:['Make a gate with two shoes.','Dribble to it with small touches.','Look up after every two touches.'],minutes:10,link:lesson},
   {id:'dribble-look',where:'training',title:'Head-up dribble',steps:['When you dribble, look up once before you pass or shoot.','Try it in every game at training.'],minutes:0,link:lesson},
   {id:'dribble-breakaway',where:'island',title:'Breakaway run',steps:['Play Breakaway Run.','Carry the ball past the tackles.'],minutes:5,link:arcade},
  ],
  arcade:'runner',card:{name:'Lamine Yamal',role:'Winger'},
  session:{play:'3v3 game, four small goals.',practice:'Everyone with a ball in a box: dribble, and when the coach holds up a cone colour, call it out.',playAgain:'3v3 again: praise brave dribbles, whatever happens next.'},
  cues:['Small touches, head up.','Dribble into space.','Keep going, or pass: you choose.']},
 pass:{id:'pass',kid:'Pass to a teammate',grownWhy:'A good pass is a choice, not just a kick: picking a teammate, aiming at their feet and passing at the right moment.',
  diagram:{us:[[26,36],[54,24],[74,40]],them:[[42,32]],ball:[26,36],pass:'M26 36 Q40 22 54 24',run:'M74 40 Q76 30 72 22',caption:'Pass, then the next teammate moves for the return.'},
  askAbout:['Ask who they passed to today, and why that teammate.','Ask: “Did a pass ever go around a defender?”','Ask them to teach you how to pass with the inside of the foot.'],
  avoid:'Counting “bad passes”. Praise the choice they made, even when the ball didn’t arrive.',home:'wall-pass',
  missions:[
   {id:'pass-wall',where:'home',title:'One-two with a wall',steps:['Pass to a wall.','Take two steps and pass the rebound back.','Ten times, then swap feet.'],minutes:10,link:lesson},
   {id:'pass-choose',where:'training',title:'Pick, then pass',steps:['Before you pass, pick the teammate in your head.','Pass to their feet.'],minutes:0,link:lesson},
   {id:'pass-puzzle',where:'island',title:'Draw the pass',steps:['Play Pass Puzzles.','Find a pass that beats a defender.'],minutes:5,link:arcade},
  ],
  arcade:'puzzle',card:{name:'Pedri',role:'Midfielder'},
  session:{play:'5v5 game. Let them play; notice who they choose to pass to.',practice:'Passing gates scattered in a square: pairs score by passing through as many different gates as they can.',playAgain:'5v5 again: a goal after three passes counts double.'},
  cues:['Pick your teammate, then pass.','Standing foot points at the target.','Pass and move.']},
 switch:{id:'switch',kid:'Find the open side',grownWhy:'When one side of the pitch is crowded, the other side is usually free. Moving the ball across finds the space.',
  diagram:{us:[[30,20],[30,50],[70,46]],them:[[38,22],[44,26]],ball:[30,20],pass:'M30 20 Q24 36 30 50',run:'M70 46 Q66 40 64 36',caption:'Crowded here? Move the ball to the free side.'},
  askAbout:['Ask whether there was a time the other side of the pitch was free.','Ask: “How do you spot the open side?”','Ask them to draw the pitch and show you the switch.'],
  avoid:'Shouting “switch it!” every time. Let them spot it; ask about it after.',home:'switch-gates',
  missions:[
   {id:'switch-gates',where:'home',title:'Two-gate switch',steps:['Make two gates far apart.','Dribble to one. If it’s guarded, go to the other.'],minutes:10,link:lesson},
   {id:'switch-look',where:'training',title:'Look across',steps:['Before you pass, look at the far side of the pitch.','If it’s free, tell a teammate or pass there.'],minutes:0,link:lesson},
   {id:'switch-puzzle',where:'island',title:'Puzzle switch',steps:['Play Pass Puzzles.','Find a pass to the free side.'],minutes:5,link:arcade},
  ],
  arcade:'puzzle',card:{name:'Trent Alexander-Arnold',role:'Full-back'},
  session:{play:'6v6 game on a wide pitch.',practice:'Two wide end-zones: a team scores a point when it gets the ball from one zone to the other in three passes or fewer.',playAgain:'6v6 again: freeze once and ask “which side is free?”'},
  cues:['Crowded? Look the other way.','Wide players: stay wide.','Switch, then attack the space.']},
 runs:{id:'runs',kid:'Time my run',grownWhy:'A run works when it starts at the right moment: when the passer can see you and is ready to pass. Too early and you are offside or marked; too late and the space is gone.',
  diagram:{us:[[40,40],[60,30]],them:[[66,36]],ball:[40,40],run:'M60 30 Q70 24 80 26',pass:'M40 40 Q62 34 80 26',caption:'Wait for the passer’s head to come up, then go.'},
  askAbout:['Ask what told them it was time to run.','Ask: “Did you ever wait before you ran?”','Ask them to show you a run in the garden when you look up.'],
  avoid:'Shouting “run!” — it takes the decision away from them.',home:'run-on-cue',
  missions:[
   {id:'runs-cue',where:'home',title:'Run when I look',steps:['A grown-up dribbles slowly.','When they look at you, run into space.','If you go too soon, reset and try again.'],minutes:10,link:lesson},
   {id:'runs-wait',where:'training',title:'Wait, then go',steps:['Watch the passer’s head.','Start your run when it comes up.'],minutes:0,link:lesson},
   {id:'runs-strikers',where:'island',title:'Run into space',steps:['Play Island Strikers.','Make a run before you ask for the pass.'],minutes:5,link:arcade},
  ],
  arcade:'live',card:{name:'Erling Haaland',role:'Striker'},
  session:{play:'5v5 game with an end zone to score in. Watch when runs start.',practice:'Through-ball game: a runner may only start when the passer has looked up; a pass into the end zone scores.',playAgain:'5v5 again: celebrate well-timed runs even when the pass doesn’t come.'},
  cues:['Head up? Go!','Wait, then burst.','Run where the passer can see you.']},
 brave:{id:'brave',kid:'Keep going',grownWhy:'Mistakes happen in every game. Being able to reset quickly (a breath, a word, back to the next job) is a skill that can be practised like any other.',
  diagram:{us:[[48,36]],them:[[56,30]],ball:[56,30],run:'M48 36 Q44 40 40 38',caption:'Mistake? Breathe, say “next one!”, do your next job.'},
  askAbout:['Ask what they did right after something went wrong.','Ask: “What is your “next one!” word?”','Ask about a mistake you made today, and what you did next. Share yours first.'],
  avoid:'Replaying their mistakes in the car. Say “I love watching you play” and let them lead the talk.',home:'lost-it',
  missions:[
   {id:'brave-word',where:'home',title:'My “next one!” word',steps:['Pick a reset word, like “next one!”.','Play keepy-up. Every time the ball drops, say your word and go again.'],minutes:10,link:story},
   {id:'brave-reset',where:'training',title:'Reset after a mistake',steps:['After a mistake, take one breath.','Say your word and do your next job.'],minutes:0,link:lesson},
   {id:'brave-story',where:'island',title:'Watch the story',steps:['Open the story on your Paths.','See how a player keeps going.'],minutes:5,link:story},
  ],
  story:{id:'grit',format:'9v9',title:'Not yet is a starting point.'},
  session:{play:'4v4 game. Watch the moment after a mistake, not the mistake.',practice:'Mistake-friendly rondo: after a lost ball the player says their reset word and becomes the first defender straight away.',playAgain:'4v4 again: the coach praises the quickest resets, not the fewest mistakes.'},
  cues:['Next one!','Breathe, then your next job.','Mistakes mean you are trying.']},
};
export const SKILL_IDS=Object.keys(SKILLS) as SkillId[];
export const missionById=(id:string)=>{for(const s of SKILL_IDS)for(const m of SKILLS[s].missions)if(m.id===id)return {mission:m,skill:SKILLS[s]};return undefined;};

/** Always true for every family (research: Knight, Harwood, Holt; docs/idp/RESEARCH.md §parents). */
export const AVOID_ALWAYS=[
 'Comparing them with teammates, friends or brothers and sisters.',
 'Going over the game in the car home. Wait until they bring it up, and start with “I love watching you play.”',
 'Coaching from the sideline. Cheer for effort, for everyone.',
 'Turning practice into a chore or a reward. Stop while it’s still fun.',
] as const;
export const SAY_INSTEAD=['I love watching you play.','What was the most fun part?','What did you try today?'] as const;

/** Picture-based journal stickers ("proud moments"): no typing needed. */
export const STICKERS={
 tried:{kid:'I tried something new',grown:'tried something new'},
 helped:{kid:'I helped a teammate',grown:'helped a teammate'},
 brave:{kid:'I kept going after a mistake',grown:'kept going after a mistake'},
 did:{kid:'I did my “I can” in a game!',grown:'used their goal in a game'},
 listened:{kid:'I listened and learned',grown:'listened and learned something'},
 fun:{kid:'I had so much fun',grown:'had a really fun session'},
 home:{kid:'I practised at home',grown:'practised at home'},
 cheered:{kid:'I cheered for someone',grown:'cheered a teammate on'},
} as const;
export type StickerId=keyof typeof STICKERS;
export const STICKER_IDS=Object.keys(STICKERS) as StickerId[];

/** Check-in faces (self-check): three steps of "how trying it felt", plus "no chance" which is always fine. */
export const FEELS={
 tricky:{kid:'Still tricky',grown:'still finding it tricky'},
 getting:{kid:'Getting there',grown:'getting there'},
 cando:{kid:'I can do it!',grown:'feels they can do it'},
 nochance:{kid:'No chance to try',grown:'didn’t get a chance to try'},
} as const;
export type FeelId=keyof typeof FEELS;
export const FEEL_IDS=Object.keys(FEELS) as FeelId[];
export const PLACES={training:'At training',match:'In a match',home:'At home'} as const;
export type PlaceId=keyof typeof PLACES;

/** Preset cheers a grown-up or coach can leave (no typing, so they can travel with the save). */
export const CHEERS={
 trying:'Proud of how you keep trying.',
 watch:'I love watching you play.',
 brave:'That was brave. Well done for having a go.',
 team:'You were a great teammate today.',
 practice:'Your practice is paying off.',
 fun:'It was so fun to play with you.',
} as const;
export type CheerId=keyof typeof CHEERS;
export const CHEER_IDS=Object.keys(CHEERS) as CheerId[];
