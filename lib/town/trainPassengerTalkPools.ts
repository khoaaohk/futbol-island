/**
 * Island Line passenger talk: what the riders say (owner, Nov 24 2026: "interact with NPCs on the train. These NPCs should talk
 * about different events, games, teach"). Pure authored data + a little derived from the island's real game data (no network).
 * Per archetype (the CAST roles in lib/town/trainPassengers.ts):
 *  (a) island events and games: built from the game's own data (live pitches lib/town/venues.ts + liveJoin.ts, the arcade cabinets
 *      lib/arcade/arcadeCatalog.ts, the Island stamp book lib/town/islandStamps.ts, the stations lib/town/trainTrack.ts), never invented;
 *  (b) teaching: a short tip or rule tied to the archetype, with its source in a `// Source:` comment and `src`, and the Learn page
 *      it matches (`learn`, a real /learn path; tests/train-talk.cjs checks each one against lib/site/terms.ts / rules.ts);
 *  (c) light banter about the ride and the next stop ({next} = the next stop's name);
 *  (d) one quick question in the conversation's existing challenge UI (NpcChallenge: three options, one correct, kid-friendly).
 * Rotation (no repeats per session) lives in lib/town/trainPassengerTalk.ts.
 */
import type {NpcChallenge} from './npcFreshTypes';
import {LIVE_VENUES} from './venues';
import {LIVE_JOIN_FORMATS} from './liveJoin';
import {arcadeCabinets} from '../arcade/arcadeCatalog';
import {STAMPS} from './islandStamps';
import {STADIUM_NAME} from '../stadium/dripfc';

export const TALK_ROLES=['Commuter','Kid with a ball','Fan in a scarf','Grandparent with a bento','Trainspotter','Student'] as const;
export type TalkRole=typeof TALK_ROLES[number];
export type TalkTopic={id:string;question:string;answer:string;followUp?:{question:string;answer:string};
 /** the Learn page it matches (teaching topics) */learn?:string;/** where the fact comes from (teaching topics) */src?:string};
export type TalkQuiz=NpcChallenge&{src:string};
export type EventKind='live'|'arcade'|'stamps'|'places'|'collect';
export type RolePool={teach:TalkTopic[];quiz:TalkQuiz[];banter:string[];/** the island events this rider brings up first */likes:EventKind[]};

// ---- (a) island events and games, from the game's data
const LIVE_LABEL:Record<string,string>={futsal:'a futsal game','7v7':'a 7 v 7 game','9v9':'a 9 v 9 game','11v11':'a full 11 v 11 game',beach:'beach soccer'};
/** Stations by the big places (the station subtitles, lib/town/trainTrack.ts TRAIN_STATIONS, and the stamp places in islandStamps.ts). */
export const PLACE_STOPS=[{place:STADIUM_NAME,station:'West Beach'},{place:'History Museum',station:'South'},{place:'Summit 5s',station:'Summit Isle'}] as const;
function eventTopics():Record<EventKind,TalkTopic[]>{
 const live=LIVE_VENUES.filter(v=>v.id!=='stadium'&&LIVE_JOIN_FORMATS[v.id]?.enabled&&LIVE_LABEL[v.id]).map(v=>({id:`ev-live-${v.id}`,question:'Any games I can join?',
  answer:`There's ${LIVE_LABEL[v.id]} at ${v.name}. Walk up to the pitch and you can jump in and play!`,
  followUp:{question:'How many players a side?',answer:`${v.players} a side there, with a ${v.shape} shape. Pick your side and your position, then go!`}}));
 if(LIVE_JOIN_FORMATS.stadium?.enabled)live.push({id:'ev-live-stadium',question:'Any big matches?',answer:`The ${STADIUM_NAME} is by West Beach station. You can join the big 11 v 11 match there!`,
  followUp:{question:'Is it a real stadium?',answer:'A walkable one, with stands you can sit in and boards round the pitch. Hop off at West Beach and walk over.'}});
 const arcade=arcadeCabinets.map(c=>({id:`ev-arcade-${c.id}`,question:'What should I play in the arcade?',answer:`Have you tried ${c.name} in the arcade? Its tip: ${c.lesson}`,
  followUp:{question:'Is it hard?',answer:'Start slow and beat your own best score first. Every game there teaches a real football skill.'}}));
 const stations=STAMPS.filter(s=>s.where==='station').length,counters=STAMPS.filter(s=>s.where==='counter');
 const stamps=[{id:'ev-stamps',question:'What are you collecting?',answer:`I'm filling my Island stamp book: ${STAMPS.length} stamps in all. ${stations} are at the station houses, and ${counters.length} people keep one behind their counter.`,
  followUp:{question:'Where are the counter ones?',answer:`Ask at the ${counters.map(c=>c.name).join(', the ').replace(/, the ([^,]*)$/,' and the $1')}. At a station, walk up to the station house and tap Collect stamp.`}}];
 const places=PLACE_STOPS.map(p=>({id:`ev-place-${p.station.toLowerCase().replace(/\s+/g,'-')}`,question:'What is there to see?',answer:`Hop off at ${p.station} for the ${p.place}. It's right by the station.`}));
 const collect=[
  {id:'ev-gashapon',question:'Where do I find toys?',answer:'Spin a gashapon machine at a Konbini, the Arcade or around the island. Every toy goes in your backpack.'},// backpack.ts emptyHint
  {id:'ev-books',question:'Where do pop-up books come from?',answer:'The vending machines sell pop-up books. Open one and the story pops right out of the page.'},// islandTutorial.json "vending"
  {id:'ev-fishing',question:'Is there fishing here?',answer:'Yes! You can fish from the piers, and the deep-sea boats go further out for bigger catches.'},// lib/town/fishing (pier spots, deepSeaBoat.ts)
 ];
 return {live,arcade,stamps,places,collect};
}
export const EVENTS:Record<EventKind,TalkTopic[]>=eventTopics();

// ---- (b) teaching, (c) banter, (d) a quick question: one pool per archetype
const IFAB='IFAB Laws of the Game 2024/25';
export const ROLE_POOLS:Record<TalkRole,RolePool>={
 'Kid with a ball':{likes:['arcade','live','collect'],
  teach:[
   // Source: The FA (England Football Learning) receiving skills; Learn page /learn/soccer-terms/first-touch
   {id:'kid-first-touch',question:'How do you control a pass?',answer:'Watch the ball onto your foot and let your foot go soft as it arrives, like catching an egg. Then push your first touch into space, away from the defender.',
    followUp:{question:'How can I practise?',answer:'Pass against a wall with both feet. Try to make every first touch set up your next pass.'},learn:'/learn/soccer-terms/first-touch',src:'The FA, England Football Learning: receiving'},
   // Source: US Soccer Grassroots coaching guides (juggling); common youth coaching advice
   {id:'kid-keepy-ups',question:'How do you do keepy-ups?',answer:'Point your toes, keep your ankle firm and tap the ball with your laces. Keep it below your waist and use both feet.',
    followUp:{question:'What if I drop it?',answer:'Everyone does! Let it bounce once between touches at first, then try without the bounce.'},src:'US Soccer Grassroots coaching: juggling'},
   // Source: IFAB Laws of the Game, Law 12 (holding and pushing are fouls); Learn page /learn/soccer-terms/shielding
   {id:'kid-shielding',question:'How do I keep the ball from a defender?',answer:'Shield it: keep your body between the defender and the ball, bend your knees and keep the ball on your far foot.',
    followUp:{question:'Can I push them away?',answer:'No pushing or holding, that is a foul. Leaning and staying strong is fine.'},learn:'/learn/soccer-terms/shielding',src:`${IFAB}, Law 12`},
   // Source: The FA coaching (two-footed practice); Learn page /learn/soccer-terms/weak-foot
   {id:'kid-weak-foot',question:'Why practise with your other foot?',answer:'If you can pass with both feet, defenders can\'t guess which way you\'ll go, and you need fewer extra touches.',learn:'/learn/soccer-terms/weak-foot',src:'The FA coaching: two-footed practice'},
   // Source: The FA (England Football Learning) dribbling; Learn page /learn/soccer-terms/dribble
   {id:'kid-dribble',question:'Big touches or small touches?',answer:'Small touches keep the ball close when defenders are near. When there\'s open grass ahead, a bigger touch lets you run faster.',learn:'/learn/soccer-terms/dribble',src:'The FA, England Football Learning: dribbling'},
  ],
  quiz:[
   // Source: Learn page /learn/soccer-terms/nutmeg (lib/site/terms.ts)
   {id:'kq-nutmeg',prompt:'Do you know what a nutmeg is?',options:['Passing the ball through a player\'s legs','A kind of goal kick','A snack at half-time'],correct:0,right:'Yes! Through the legs, and you collect it on the other side.',wrong:'Not that one. Have another think!',src:'lib/site/terms.ts nutmeg'},
   // Source: The FA passing technique (the inside of the foot is the most accurate surface for short passes)
   {id:'kq-inside',prompt:'Which part of your foot is best for a short, careful pass?',options:['The inside of your foot','Your toe','Your heel'],correct:0,right:'Right! The inside of the foot is big and flat, so the pass goes where you aim.',wrong:'Hmm, that one is hard to aim. Try again!',src:'The FA, England Football Learning: passing'},
  ],
  banter:['Next stop is {next}! I\'m holding my ball tight so it doesn\'t roll down the train.','When we get to {next}, I\'m going to find a pitch straight away.','I counted the trees out of the window. Then I lost count. Is it {next} next?','This train goes so fast! Faster than my best sprint, anyway.']},
 'Fan in a scarf':{likes:['live','places','arcade'],
  teach:[
   // Source: IFAB Laws of the Game, Law 11 Offside; Learn page /learn/soccer-rules/offside
   {id:'fan-offside',question:'What is offside, really?',answer:'When a teammate passes to you in the other team\'s half, you need two defenders (the keeper counts) level with you or nearer their goal line, or be level with or behind the ball. In your own half you can\'t be offside.',
    followUp:{question:'Is it always a foul?',answer:'Only if you get involved in play. And you can\'t be offside straight from a throw-in, a goal kick or a corner.'},learn:'/learn/soccer-rules/offside',src:`${IFAB}, Law 11`},
   // Source: IFAB Laws of the Game, Law 12 Fouls and Misconduct; Learn page /learn/soccer-rules/yellow-and-red-cards
   {id:'fan-cards',question:'What do the cards mean?',answer:'A yellow card is a caution, a warning. Two yellows in one match make a red, and a red card means you leave the pitch and your team plays one short.',learn:'/learn/soccer-rules/yellow-and-red-cards',src:`${IFAB}, Law 12`},
   // Source: IFAB Laws of the Game, Law 5 (advantage; signal: both arms extended forward); Learn page /learn/soccer-rules/advantage
   {id:'fan-advantage',question:'Why didn\'t the referee blow for that foul?',answer:'That\'s advantage. If the fouled team still has a good attack going, the referee lets play carry on and stretches both arms forward.',learn:'/learn/soccer-rules/advantage',src:`${IFAB}, Law 5`},
   // Source: IFAB Laws of the Game, Law 14 The Penalty Kick (mark 11 m / 12 yd, Law 1); Learn page /learn/soccer-rules/penalty-kick
   {id:'fan-penalty',question:'How far is a penalty?',answer:'The penalty mark is 11 metres (12 yards) from goal. When it\'s kicked, the keeper must have part of a foot on the goal line.',learn:'/learn/soccer-rules/penalty-kick',src:`${IFAB}, Laws 1 and 14`},
   // Source: "Hat-trick" (Wikipedia; H. H. Stephenson, cricket, 1858); Learn page /learn/soccer-terms/hat-trick
   {id:'fan-hat-trick',question:'Why is it called a hat-trick?',answer:'It comes from cricket! In 1858 a bowler took three wickets with three balls, and fans gave him a hat. In football it means one player scores three goals in a match.',learn:'/learn/soccer-terms/hat-trick',src:'Wikipedia, Hat-trick'},
  ],
  quiz:[
   // Source: IFAB Laws of the Game, Law 11 (no offside offence from a throw-in, goal kick or corner kick)
   {id:'fq-offside-throw',prompt:'Can you be offside straight from a throw-in?',options:['Yes','No','Only in the second half'],correct:1,right:'Correct! No offside from a throw-in, a goal kick or a corner.',wrong:'Not quite. Think about the restarts. Try again!',src:`${IFAB}, Law 11`},
   // Source: Learn page /learn/soccer-terms/hat-trick (lib/site/terms.ts)
   {id:'fq-hat-trick',prompt:'Do you know what a hat-trick is?',options:['Three goals by one player in one match','A header from a corner','Three corners in a row'],correct:0,right:'Yes! Three goals by the same player in one match.',wrong:'Close, but no. Have another go!',src:'lib/site/terms.ts hat-trick'},
  ],
  banter:['Next stop {next}! I can hear the fans singing already. Or is that the train?','I wear this scarf to every match, rain or shine. Even on the train to {next}.','Win or lose, we always ride home together. That\'s what fans do.','Shh, I\'m saving my voice for the match. Next stop is {next}!']},
 'Grandparent with a bento':{likes:['places','collect','stamps'],
  teach:[
   // Source: The Football Association, "History of the FA" (founded 26 October 1863, Freemasons' Tavern, London)
   {id:'gp-fa-1863',question:'Who wrote the first rules?',answer:'In 1863 a group of clubs met at a tavern in London and formed the Football Association. They wrote one set of rules so everyone played the same game.',
    followUp:{question:'Before that?',answer:'Every school and club had its own rules. Some even let you carry the ball!'},learn:'/learn/soccer-rules',src:'The FA, History of the FA'},
   // Source: FIFA, 1930 FIFA World Cup Uruguay (13 teams; final Uruguay 4-2 Argentina)
   {id:'gp-world-cup-1930',question:'When was the first World Cup?',answer:'1930, in Uruguay. Thirteen teams went, and Uruguay won, beating Argentina 4–2 in the final.',src:'FIFA, 1930 FIFA World Cup Uruguay'},
   // Source: FIFA / Wikipedia "Ken Aston" (cards first used at the 1970 World Cup in Mexico)
   {id:'gp-cards-1970',question:'Did football always have cards?',answer:'No! Yellow and red cards were first used at the 1970 World Cup in Mexico. A referee called Ken Aston got the idea waiting at traffic lights.',learn:'/learn/soccer-rules/yellow-and-red-cards',src:'FIFA; Wikipedia, Ken Aston'},
   // Source: FIFA, FIFA Women's World Cup China 1991 (winners: USA)
   {id:'gp-wwc-1991',question:'When did the Women\'s World Cup start?',answer:'The first FIFA Women\'s World Cup was played in China in 1991, and the USA won it.',src:'FIFA, Women\'s World Cup China 1991'},
   // Source: Wikipedia "John Alexander Brodie" (Liverpool engineer, patented goal nets in 1890)
   {id:'gp-goal-nets',question:'Did goals always have nets?',answer:'No, and people argued about whether the ball went in! John Brodie, an engineer from Liverpool, patented goal nets in 1890.',src:'Wikipedia, John Alexander Brodie'},
  ],
  quiz:[
   // Source: FIFA, 1930 FIFA World Cup Uruguay
   {id:'gq-1930',prompt:'Where was the very first World Cup played?',options:['Uruguay','England','Brazil'],correct:0,right:'Well done! Uruguay, in 1930, and they won it too.',wrong:'Not there, dear. Have another guess!',src:'FIFA, 1930 FIFA World Cup'},
   // Source: IFAB Laws of the Game, Law 12 (a yellow card is a caution)
   {id:'gq-yellow',prompt:'What does a yellow card mean?',options:['A caution, a warning','A goal','Half-time'],correct:0,right:'That\'s right. A warning: two of them make a red.',wrong:'Not that one. Think of a traffic light!',src:`${IFAB}, Law 12`},
  ],
  banter:['A little rice ball before {next}. Would you like to hear an old football story?','I\'ve ridden this line for years. {next} is my favourite stop.','In my day the trains were slower, but the football was just as fun.','Mind the bento! Ah, {next} is coming up already.']},
 'Trainspotter':{likes:['stamps','places','live'],
  teach:[
   // Source: Jordet et al. (2013), Premier League midfielders' visual exploratory activity (Norwegian School of Sport Sciences)
   {id:'ts-scanning',question:'How do good players see so much?',answer:'They scan: quick looks over both shoulders before the ball arrives. Then they already know where the space is and who is coming.',
    followUp:{question:'Do pros really do it?',answer:'Yes. Studies by Geir Jordet found midfielders who scanned more often before getting the ball completed more forward passes.'},learn:'/learn/soccer-terms/first-touch',src:'Jordet et al. 2013, visual exploratory activity'},
   // Source: Learn page /learn/soccer-terms/man-on (lib/site/terms.ts)
   {id:'ts-man-on',question:'What do players shout to each other?',answer:'"Man on!" warns a teammate that a defender is right behind them. "Time!" means nobody is close, so they can take a touch.',learn:'/learn/soccer-terms/man-on',src:'lib/site/terms.ts man-on'},
   // Source: Learn page /learn/soccer-terms/switching-play (lib/site/terms.ts)
   {id:'ts-switch',question:'What if one side is all crowded?',answer:'Switch play: a long pass to the other side of the pitch, where there is lots of space. Like changing to an empty platform.',learn:'/learn/soccer-terms/switching-play',src:'lib/site/terms.ts switching-play'},
   // Source: IFAB Laws of the Game, Law 3 The Players (11 a side incl. a goalkeeper; at least 7 to start)
   {id:'ts-count',question:'How many players are on a team?',answer:'Eleven on the pitch, and one of them is the goalkeeper. A match can\'t start if a team has fewer than seven.',learn:'/learn/soccer-rules/substitutions-and-game-length',src:`${IFAB}, Law 3`},
  ],
  quiz:[
   // Source: Jordet et al. (2013); The FA coaching: scan before receiving
   {id:'tq-scan',prompt:'When should you look over your shoulder?',options:['Before the ball arrives','Only after you score','Never, it\'s rude'],correct:0,right:'Spot on! Look before the ball comes, and your first touch already knows where to go.',wrong:'Not quite. When would it help most? Try again!',src:'Jordet et al. 2013'},
   // Source: Learn page /learn/soccer-terms/man-on (lib/site/terms.ts)
   {id:'tq-man-on',prompt:'What does a teammate mean by "Man on!"?',options:['A defender is right behind you','Pass to the man in the stands','The match is over'],correct:0,right:'Yes! Protect the ball or pass it quickly.',wrong:'Not that one. Have another look!',src:'lib/site/terms.ts man-on'},
  ],
  banter:['Next stop {next}, right on time! I write down every train.','I\'ve ridden every stop on this line. {next} has the best view.','Did you feel that curve? We\'re nearly at {next}.','I note the train number, the time and the weather. Today: perfect football weather.']},
 'Student':{likes:['arcade','collect','live'],
  teach:[
   // Source: IFAB Laws of the Game, Law 12 (goalkeeper handling only inside own penalty area); Learn page /learn/soccer-positions
   {id:'st-keeper',question:'Who is allowed to use their hands?',answer:'Only the goalkeeper, and only inside their own penalty area. Outside it they play like everyone else.',learn:'/learn/soccer-positions',src:`${IFAB}, Law 12`},
   // Source: Learn page /learn/soccer-positions/fullback-vs-wingback
   {id:'st-fullback',question:'What does a full-back do?',answer:'Full-backs defend near the sidelines and often run forward to help attack. Wing-backs do the running even more.',learn:'/learn/soccer-positions/fullback-vs-wingback',src:'Learn: full-back vs wing-back'},
   // Source: Learn page /learn/soccer-terms/box-to-box (lib/site/terms.ts)
   {id:'st-box-to-box',question:'What is a box-to-box midfielder?',answer:'A midfielder who helps defend near their own penalty box and attack near the other one. Lots of running!',learn:'/learn/soccer-terms/box-to-box',src:'lib/site/terms.ts box-to-box'},
   // Source: Learn page /learn/soccer-terms/false-nine (lib/site/terms.ts)
   {id:'st-false-nine',question:'What is a false nine?',answer:'A striker who drops back into midfield to get the ball, pulling defenders out of place so teammates can run into the space.',learn:'/learn/soccer-terms/false-nine',src:'lib/site/terms.ts false-nine'},
   // Source: FIFA futsal positions (goleiro, fixo, ala, pivô); lib/town/vendingCatalog.ts futsal pack; Learn page /learn/futsal-for-kids
   {id:'st-futsal',question:'Are futsal positions different?',answer:'Yes! Five a side: the goleiro (goalkeeper), the fixo (last defender), two alas (wingers) and the pivô up front.',learn:'/learn/futsal-for-kids',src:'FIFA futsal; vendingCatalog.ts futsal pack'},
   // Source: Wikipedia "Squad number (association football)" (1 = goalkeeper, 9 = centre-forward traditionally); Learn page /learn/soccer-positions/numbers
   {id:'st-numbers',question:'Do shirt numbers mean anything?',answer:'Traditionally number 1 is the goalkeeper and number 9 is the striker. Today players can often pick their own.',learn:'/learn/soccer-positions/numbers',src:'Wikipedia, Squad number'},
  ],
  quiz:[
   // Source: IFAB Laws of the Game, Law 12
   {id:'sq-hands',prompt:'Who may handle the ball in their own penalty area?',options:['The goalkeeper','The captain','Any defender'],correct:0,right:'Correct! Only the keeper, and only in their own box.',wrong:'Not them. Who wears the gloves? Try again!',src:`${IFAB}, Law 12`},
   // Source: Wikipedia "Squad number (association football)"
   {id:'sq-number-one',prompt:'Which shirt number does the goalkeeper usually wear?',options:['1','7','10'],correct:0,right:'Yes, number 1!',wrong:'That\'s usually an attacker\'s number. One more try!',src:'Wikipedia, Squad number'},
  ],
  banter:['I\'m revising on the way to {next}. Football positions, of course.','Next stop is {next}. Just enough time for one more highlight.','I take notes on every match I watch. The train is my study room.','Is {next} my stop? I always check the map twice.']},
 'Commuter':{likes:['collect','live','stamps'],
  teach:[
   // Source: IFAB Laws of the Game, Law 9 The Ball In and Out of Play; Learn page /learn/soccer-rules
   {id:'cm-out',question:'When is the ball out of play?',answer:'Only when the whole ball has crossed the whole line, on the ground or in the air. Touching the line still counts as in.',learn:'/learn/soccer-rules',src:`${IFAB}, Law 9`},
   // Source: IFAB Laws of the Game, Law 15 The Throw-in; Learn page /learn/soccer-rules/throw-in
   {id:'cm-throw-in',question:'How do you take a throw-in?',answer:'Face the pitch, keep part of each foot on the ground on or behind the line, use both hands and throw from behind and over your head.',
    followUp:{question:'Can you score from one?',answer:'Not straight in. If it goes in without anyone touching it, it\'s a goal kick or a corner instead.'},learn:'/learn/soccer-rules/throw-in',src:`${IFAB}, Law 15`},
   // Source: IFAB Laws of the Game, Law 17 The Corner Kick; Learn page /learn/soccer-rules/corner-kick
   {id:'cm-corner',question:'Can you score from a corner?',answer:'Yes, straight in, though it\'s hard! And you can\'t be offside from a corner kick.',learn:'/learn/soccer-rules/corner-kick',src:`${IFAB}, Law 17`},
   // Source: IFAB Laws of the Game, Law 8 The Start and Restart of Play; Learn page /learn/soccer-rules/kick-off
   {id:'cm-kick-off',question:'Can you score from the kick-off?',answer:'Yes, straight from the kick-off, but only into the other team\'s goal.',learn:'/learn/soccer-rules/kick-off',src:`${IFAB}, Law 8`},
   // Source: Learn page /learn/soccer-terms/set-piece (lib/site/terms.ts)
   {id:'cm-set-piece',question:'What is a set piece?',answer:'A planned move from a restart, like a corner or a free kick. Teams practise them like a timetable: everyone knows their spot.',learn:'/learn/soccer-terms/set-piece',src:'lib/site/terms.ts set-piece'},
  ],
  quiz:[
   // Source: IFAB Laws of the Game, Law 15 (a goal cannot be scored directly from a throw-in)
   {id:'cq-throw-goal',prompt:'Can you score straight from a throw-in?',options:['No','Yes','Only with a header'],correct:0,right:'Right! Someone else has to touch it first.',wrong:'Not quite. Think about using your hands! Try again.',src:`${IFAB}, Law 15`},
   // Source: IFAB Laws of the Game, Law 9
   {id:'cq-out',prompt:'When is the ball out of play?',options:['When the whole ball crosses the line','When half the ball is over the line','When it touches the line'],correct:0,right:'Exactly. The whole ball, over the whole line.',wrong:'Close, but it\'s still in! One more go.',src:`${IFAB}, Law 9`},
  ],
  banter:['Two more stops to work. Well, {next} first.','I read the match reports on this ride every day. Next stop {next}.','The train is my quiet time. Except when the horn goes!','Next stop is {next}. I always sit on the sea side of the car.']},
};

// ---- (b2) football fitness and other football ideas tied to everyday island things (owner, Nov 24 2026: "something about speed,
// endurance, tie to something, not just trains"). Every passenger talk carries one of these (see trainPassengerTalk.ts).
export const FITNESS:TalkTopic[]=[
 // Source: Stølen et al. 2005, "Physiology of soccer", Sports Med 35 (most match sprints are short; acceleration matters)
 {id:'fit-first-steps',question:'Is being fast all about top speed?',answer:'Not in football. Most sprints in a match are short, so the first 5 to 10 metres matter most. A quick first step beats a fast finish.',src:'Stølen et al. 2005'},
 // Source: everyday physics (lighter things speed up faster with the same push); Stølen et al. 2005 for match sprints
 {id:'fit-scooter',question:'Why does a scooter zip off faster than the train?',answer:'It is light, so it gets going in a flash, while a heavy train speeds up slowly. Players want to be like the scooter: quick off the mark.',src:'Stølen et al. 2005'},
 // Source: Stølen et al. 2005 (elite outfield players cover roughly 10 km or more per match; sources vary)
 {id:'fit-10km',question:'How far do footballers run in a match?',answer:'Roughly 10 km for many outfield players in 90 minutes, made of walks, jogs and lots of short sprints.',src:'Stølen et al. 2005'},
 // Source: NHS "Swimming for fitness" (swimming works the heart and lungs, low impact)
 {id:'fit-swim',question:'Does swimming help football?',answer:'Yes! Swimming laps works your heart and lungs without bumping your legs, so it builds endurance on a rest day.',src:'NHS, swimming for fitness'},
 // Source: American Academy of Sleep Medicine 2016 (ages 6-12: 9-12 hours)
 {id:'fit-sleep',question:'Why does sleep matter for players?',answer:'Sleep is when your body repairs and grows. Children aged 6 to 12 need about 9 to 12 hours a night.',src:'AASM 2016'},
 // Source: IFAB Laws of the Game, Law 7 (half-time interval must not exceed 15 minutes)
 {id:'fit-half-time',question:'Why is there a half-time break?',answer:'Up to 15 minutes to rest, drink water and hear the coach\'s plan. Fresh legs for the second half!',learn:'/learn/soccer-rules/substitutions-and-game-length',src:`${IFAB}, Law 7`},
 // Source: Soligard et al. 2008, BMJ (the FIFA 11+ warm-up reduced injuries in young players)
 {id:'fit-warm-up',question:'Do warm-ups really help?',answer:'Yes. Studies of FIFA\'s 11+ warm-up found young players who did it got hurt less. Jog, stretch while moving, then do a few short sprints.',src:'Soligard et al. 2008, BMJ'},
 // Source: American Academy of Pediatrics, youth sports hydration guidance (drink before, during and after activity)
 {id:'fit-vending',question:'What should I drink after playing?',answer:'Water is the best thirst-quencher. Grab some at a vending machine and sip before, during and after you play, most of all on hot days.',src:'American Academy of Pediatrics'},
 // Football idea (patience and timing), no outside figure
 {id:'fit-fishing',question:'What can fishing teach a striker?',answer:'Patience! You wait calmly for the right moment, then act fast. Strikers wait for the right moment to shoot, too.'},
 // Football idea (learning every position), no outside figure
 {id:'fit-stamps',question:'What does a stamp rally have to do with football?',answer:'Collecting every stamp means visiting every corner of the island. Trying every position on the pitch helps you understand the whole game.',learn:'/learn/soccer-positions'},
 // Football idea: passing lanes; Learn page /learn/soccer-terms/two-v-one
 {id:'fit-lanes',question:'What is a passing lane?',answer:'A clear line from the ball to a teammate, like an open track. If a defender stands in it, move a few steps to open a new lane.',learn:'/learn/soccer-terms/two-v-one'},
 // Source: IFAB Laws of the Game, Law 11 (offside judged when the ball is played); Learn page /learn/soccer-rules/offside
 {id:'fit-timing',question:'When should a striker start a run?',answer:'Right as the pass is played, like a train leaving exactly on time. Go too early and you may be offside.',learn:'/learn/soccer-rules/offside',src:`${IFAB}, Law 11`},
 // Football idea: balance and a low stance when shielding (the surfers on the train roof)
 {id:'fit-surf',question:'How do the roof surfers stay on?',answer:'Knees bent, arms out, body low. Footballers use that same low, wide stance to shield the ball from a defender.',learn:'/learn/soccer-terms/shielding'},
];
/** Every passenger line's football topic (lib/town/trainTalkTags.ts FOOTBALL_TOPICS; tests/train-talk.cjs). Banter is `ride`. */
export const TALK_TAGS:Record<string,string>={
 'kid-first-touch':'technique','kid-keepy-ups':'technique','kid-shielding':'agility','kid-weak-foot':'technique','kid-dribble':'technique','kq-nutmeg':'technique','kq-inside':'technique',
 'fan-offside':'offside','fan-cards':'rules','fan-advantage':'rules','fan-penalty':'rules','fan-hat-trick':'history','fq-offside-throw':'offside','fq-hat-trick':'rules',
 'gp-fa-1863':'history','gp-world-cup-1930':'history','gp-cards-1970':'history','gp-wwc-1991':'history','gp-goal-nets':'history','gq-1930':'history','gq-yellow':'rules',
 'ts-scanning':'scanning','ts-man-on':'teamwork','ts-switch':'tactics','ts-count':'rules','tq-scan':'scanning','tq-man-on':'teamwork',
 'st-keeper':'positions','st-fullback':'positions','st-box-to-box':'positions','st-false-nine':'positions','st-futsal':'positions','st-numbers':'positions','sq-hands':'positions','sq-number-one':'positions',
 'cm-out':'rules','cm-throw-in':'rules','cm-corner':'rules','cm-kick-off':'rules','cm-set-piece':'tactics','cq-throw-goal':'rules','cq-out':'rules',
 'fit-first-steps':'speed','fit-scooter':'speed','fit-10km':'endurance','fit-swim':'endurance','fit-sleep':'recovery','fit-half-time':'recovery','fit-warm-up':'safety','fit-vending':'safety',
 'fit-fishing':'tactics','fit-stamps':'positions','fit-lanes':'tactics','fit-timing':'offside','fit-surf':'agility',
};
/** An island-event topic is `island`; banter is `ride`. */
export const talkTagOf=(id:string)=>TALK_TAGS[id]??(id.startsWith('ev-')?'island':undefined);
/** Every teaching topic and quiz (tests: each carries a source). */
export const ALL_TEACH=TALK_ROLES.flatMap(r=>ROLE_POOLS[r].teach),ALL_QUIZ=TALK_ROLES.flatMap(r=>ROLE_POOLS[r].quiz);
export const isTalkRole=(role:string):role is TalkRole=>(TALK_ROLES as readonly string[]).includes(role);
