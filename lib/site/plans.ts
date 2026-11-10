import type {Faq} from './safety';
import type {SiteLesson} from './lessons';
import {drill,pickLessons,type Age,type Drill,type DrillLink} from './drills';
import {G} from './drillLinks';
/**
 * The PRACTICE PLANS cluster (SEO cluster 3, Nov 10 2026): /learn/soccer-practice-plans and twelve plans under it: for U6, U8,
 * U10 and U12, a first practice of the season and two themed plans. Each plan is a clock table whose rows link to the drill
 * pages (lib/site/drills.ts), an equipment list, coach notes and a swap for when it is going badly. All words live here; the
 * routes only render. Each plan page prints on one page (print rules at the end of app/(site)/site.module.css).
 *
 * SOURCES (checked Nov 10 2026):
 *  - The structure is U.S. Soccer's Play-Practice-Play: "U.S. Soccer Grassroots Coach Education, Play-Practice-Play (PPP)
 *    Model: An Evidence-Based Approach", read in full from a state association's copy (the ussoccer.com page that described it
 *    returned 404 on this date): phase 1 "first play" in small games of 2v2, 3v3, 4v4 as players arrive, the coach mostly
 *    watching; phase 2 "practice", game-like activities on the day's goal with active coaching; phase 3 "second play", the
 *    game in a format close to match day, where players are left to play. The document gives NO minutes for the phases, so
 *    the minutes in these plans are ours and the pages say the structure, not the timings, is U.S. Soccer's.
 *    https://www.soccermaine.com/wp-content/uploads/sites/230/2023/11/play-practice-play_model.pdf
 *  - Total length per age: US Youth Soccer Coaching Education Department, "How to Write a Training Session Plan" (U6 45
 *    minutes, U8 45 to 60, U10 60 to 75, U12 75): https://www.louisvillesoccer.com/docs/How%20to%20Write%20a%20Training%20Session%20Plan.pdf
 *    lib/site/sizes.ts has GAME lengths (4 x 10, 2 x 25, 2 x 30 minutes) but no practice length, so practice length is from
 *    that handout; the game format and field for the final game are from lib/site/sizes.ts (U.S. Soccer small-sided standards:
 *    4v4 with no goalkeeper on 25-35 x 15-25 yd at U6-U8; 7v7 on 55-65 x 35-45 yd at U9-U10; 9v9 on 70-80 x 45-55 yd at U11-U12).
 *  - Age guidance (attention span, no goalkeepers through age 8): US Youth Soccer Player Development Model, see lib/site/drills.ts.
 *  - Heading: lib/site/rules.ts. No plan contains heading.
 * Every plan has water breaks, no laps, no punishment running and no player sitting out. The module throws if a plan's rows
 * do not add up to its stated length or if it uses a drill that is not tagged for its age.
 */
export type Stage='Welcome'|'Play'|'Practice'|'Break'|'Finish';
export type PlanRow={minutes:number;stage:Stage;activity:string;drill?:Drill;purpose:string;start:number;end:number};
type RawRow=[number,Stage,string,string,string];/* minutes, stage, activity, drill slug or '', purpose */
export type RawPlan={slug:string;age:Age;theme:string;title:string;desc:string;lead:string;goal:string;minutes:number;players:string;field:string;rows:RawRow[];equipment:string[];notes:string[];swap:{sign:string;instead:string};faq:Faq[];lessons:string[];links:DrillLink[]};
export type Plan=Omit<RawPlan,'rows'|'lessons'>&{path:string;name:string;h1:string;rows:PlanRow[];drills:Drill[];lessons:SiteLesson[];picture:string};
export const PLANS_HUB_PATH='/learn/soccer-practice-plans';
export const planPath=(slug:string)=>`${PLANS_HUB_PATH}/${slug}`;
/** Practice length by age (US Youth Soccer Coaching Education Department; U8 and U10 use the lower end of the range). */
export const PRACTICE_MINUTES:Record<Age,number>={U6:45,U8:60,U10:60,U12:75};
export const PRACTICE_RANGE:Record<Age,string>={U6:'45 minutes',U8:'45 to 60 minutes',U10:'60 to 75 minutes',U12:'75 minutes'};
const FIELD:Record<Age,string>={U6:'4v4 with no goalkeepers, on about 30 x 20 yards',U8:'4v4 with no goalkeepers, on about 30 x 20 yards',U10:'Up to 7v7 with goalkeepers; a 7v7 field is 55 to 65 yards long',U12:'Up to 9v9 with goalkeepers; a 9v9 field is 70 to 80 yards long'};
const BASE=['A ball for every player','About 20 cones','Bibs in two colors','A water bottle for every player','A first aid kit and a ball pump'];
const W:RawRow=[3,'Break','Water break','','Drink, and one question for the group about the last game.'];
const RAW:RawPlan[]=[
 {slug:'u6-first-practice',age:'U6',theme:'First practice of the season',title:'U6 Soccer Practice Plan: First Practice (45 Minutes)',
  desc:'A 45-minute U6 soccer practice plan for the first day of the season: learn names, a ball for every child, four fun games and a small game to finish.',
  lead:'This 45-minute plan is for the very first practice with 5 and 6 year olds. It has one job: every child leaves smiling, having had a ball at their feet the whole time, and you leave knowing every name.',
  goal:'Meet the ball, meet each other',minutes:45,players:'6 to 10',field:FIELD.U6,
  rows:[[5,'Welcome','Free play as children arrive','','Each child takes a ball and dribbles. Say hello to every child and every parent.'],[7,'Play','Simon Says with a ball','simon-says-soccer','Stopping the ball, listening and learning names.'],[2,'Break','Water break','','Drink. Ask who can remember two names.'],
   [8,'Practice','Red Light, Green Light','red-light-green-light','Dribbling with small touches and stopping on the call.'],[8,'Practice','Pirates and Treasure','pirates-and-treasure','Dribbling fast and stopping the ball in your ship.'],[2,'Break','Water break','','Drink.'],
   [10,'Play','3v3 game with small goals','three-v-three-game','A real game: two small fields if you have more than eight players. No positions.'],[3,'Finish','Team cheer and one question','','“What was your favorite game?” Tell parents when the next practice is.']],
  equipment:[...BASE,'4 small goals, or 8 extra cones'],
  notes:['Explain each game in two sentences, then start. Fix the rules while they play.','Kneel down when you talk, and keep it under thirty seconds.','A child who does not want to join can watch with a ball at their feet. Most join within ten minutes.','Ask one parent to help with the second small field.'],
  swap:{sign:'Children are wandering off or picking daisies.',instead:'Go straight to Sharks and Minnows with you as the shark. Being chased by the coach fixes almost everything at this age.'},
  faq:[{q:'What do I do at my first U6 soccer practice?',a:'Learn names, give every child a ball and play simple games: Simon Says, Red Light Green Light and Pirates and Treasure. End with a short 3v3 game.'},
   {q:'How long should a U6 practice be?',a:'About 45 minutes, in line with US Youth Soccer’s coaching guidance for the age. Five- and six-year-olds have had enough after that.'},
   {q:'What if some children have never played?',a:'This plan assumes nobody has. Every game works for a child touching a soccer ball for the first time.'}],
  lessons:['learn7_carry','learn7_roles'],links:[G.ages,G.ball]},

 {slug:'u6-dribbling-practice-plan',age:'U6',theme:'Dribbling',title:'U6 Soccer Practice Plan: Dribbling Games (45 Minutes)',
  desc:'A 45-minute U6 soccer practice plan built on dribbling: dribble tag, Sharks and Minnows and gates, with a clock table, water breaks and a 3v3 finish.',
  lead:'A 45-minute dribbling practice for 5 and 6 year olds. Every game has a ball for every child, and each one asks for a little more: keep it close, get away from a chaser, find a gap.',
  goal:'Keep the ball close and go where the space is',minutes:45,players:'6 to 12',field:FIELD.U6,
  rows:[[6,'Play','2v2 games as children arrive','','Small fields with cone goals. Add each child to a game as they arrive.'],[7,'Practice','Dribble tag','dribble-tag','Dribbling with eyes up to see the tagger.'],[2,'Break','Water break','','Drink.'],
   [9,'Practice','Sharks and Minnows','sharks-and-minnows','Dribbling past a defender. The coach is the first shark.'],[7,'Practice','Gates dribbling','gates-dribbling','Finding an open “door” and dribbling through it.'],[2,'Break','Water break','','Drink. “Where was the best place to dribble?”'],
   [10,'Play','3v3 game','three-v-three-game','Let them play. Cheer every time a child dribbles into space.'],[2,'Finish','Team cheer','','One thing each child did well today.']],
  equipment:[...BASE,'2 bibs for the taggers','4 small goals, or 8 extra cones'],
  notes:['Use the same three words all day: “ball close” and “space”.','In Sharks and Minnows, a caught minnow does five toe taps and becomes a shark. Nobody watches.','If one child dominates, make them your helper shark with a special rule, such as walking only.'],
  swap:{sign:'Gates dribbling is too calm and the group is restless.',instead:'Turn it into Pirates and Treasure: same area, balls in the middle, dribble them home through any gate.'},
  faq:[{q:'What dribbling drills work for 5-year-olds?',a:'Games with chasing and a story: dribble tag, Sharks and Minnows and gates you can call doors or tunnels. Keep each one under ten minutes.'},
   {q:'Should U6 players do cone drills?',a:'Rarely. A short weave as a race is fine, but games teach the same touches and hold attention far better.'},
   {q:'Why start with 2v2 games?',a:'It is the first “play” of U.S. Soccer’s Play-Practice-Play structure: children arrive and play at once, and nobody waits for practice to start.'}],
  lessons:['learn7_carry','next7_dribbleroom'],links:[G.ages,G.wg]},

 {slug:'u6-shooting-practice-plan',age:'U6',theme:'Kicking and shooting',title:'U6 Soccer Practice Plan: Kicking and Shooting (45 Min)',
  desc:'A 45-minute U6 soccer practice plan for kicking and shooting: Clean Your Room, dribble and shoot at small goals with no goalkeeper, and a 3v3 game.',
  lead:'A 45-minute practice that lets 5 and 6 year olds do what they like best: kick the ball and score. Small goals, no goalkeepers, lots of balls and no lines.',
  goal:'Kick with the laces and score',minutes:45,players:'6 to 12',field:FIELD.U6,
  rows:[[6,'Play','2v2 games as children arrive','','Wide cone goals so there are lots of goals.'],[8,'Practice','Clean Your Room','clean-your-room','Striking the ball with the laces, low, and finding the next ball.'],[2,'Break','Water break','','Drink. Show the laces: “toe down”.'],
   [9,'Practice','Dribble and shoot','dribble-and-shoot','Dribble through a gate and shoot at a small goal. Three lanes, no goalkeeper.'],[6,'Practice','Red Light, Green Light, with a shot','red-light-green-light','Dribble on green. On “goal light”, shoot at any small goal.'],[2,'Break','Water break','','Drink.'],
   [10,'Play','3v3 game','three-v-three-game','Let them play. Celebrate every shot, in or out.'],[2,'Finish','Team cheer','','“Which part of your foot did you kick with?”']],
  equipment:[...BASE,'As many extra balls as you can bring','6 small goals, or 12 extra cones'],
  notes:['Balls stay below knee height in every game.','Nobody collects balls behind a goal while others shoot.','Praise the technique, laces and a low ball, more than the goal.'],
  swap:{sign:'Dribble and shoot has turned into a line.',instead:'Add more goals at once, or switch to Pirates and Treasure where the “ship” is a small goal and each ball must be shot into it.'},
  faq:[{q:'How do you teach a 5-year-old to kick a soccer ball?',a:'Show the laces with the toe pointing down, put the other foot beside the ball, and give them dozens of tries in a game such as Clean Your Room.'},
   {q:'Should U6 shooting drills have a goalkeeper?',a:'No. Under-8 games have no goalkeepers. Small goals teach children to aim, and nobody gets hit by a ball.'},
   {q:'How many balls do I need?',a:'One for every child at least. For shooting games, extra balls keep the game moving while others are fetched.'}],
  lessons:['next7_shotreaction','learn7_carry'],links:[G.ages,G.ball,G.field]},

 {slug:'u8-first-practice',age:'U8',theme:'First practice of the season',title:'U8 Soccer Practice Plan: First Practice (60 Minutes)',
  desc:'A 60-minute U8 soccer practice plan for the first day: games as players arrive, names, dribbling, 1v1 and a 4v4 finish, with a clock table and breaks.',
  lead:'A 60-minute first practice for 7 and 8 year olds. You will learn names, see what the players can do, and set the habits for the season: we start by playing, everyone has a ball, and we finish with a game.',
  goal:'Set the habits: play first, a ball each, a game to finish',minutes:60,players:'8 to 12',field:FIELD.U8,
  rows:[[8,'Play','2v2 and 3v3 games as players arrive','three-v-three-game','Players join a game the moment they arrive. Watch: who is confident, who is new?'],[7,'Practice','Busy square, with names','busy-square-dribbling','Dribbling with eyes up. On “swap”, tell the player whose ball you take your name.'],W,
   [10,'Practice','Sharks and Minnows','sharks-and-minnows','Dribbling under pressure. Caught minnows do five toe taps and become sharks.'],[10,'Practice','1v1 to end zones','one-v-one-to-end-zones','Three or four small fields. Beat your defender and stop the ball in the zone.'],W,
   [15,'Play','4v4 game','three-v-three-game','No goalkeepers and no positions yet. Two fields if you have more than ten players.'],[4,'Finish','Circle up','','One thing the team did well, the next practice time, and a team cheer chosen by the players.']],
  equipment:[...BASE,'4 small goals, or 8 extra cones'],
  notes:['Have the small fields marked before anyone arrives. It is the single best habit a volunteer coach can form.','Tell parents the plan: play, practice, play. They will see less standing and more soccer.','Coach one thing per activity. Today it is “keep the ball close”.','Write down names with one note each as soon as practice ends.'],
  swap:{sign:'1v1 is too hard for new players and they lose the ball every time.',instead:'Make the fields wider and let the defender start on one knee. Or switch to gates dribbling, then come back to 1v1 next week.'},
  faq:[{q:'How do I run my first U8 soccer practice?',a:'Start with small games as players arrive, play two ball-each games, try 1v1 on small fields and finish with 4v4. Learn every name before the end.'},
   {q:'What should I tell parents on day one?',a:'When and how long practices are, that every child needs a ball of the right size and water, and that practices will be mostly games.'},
   {q:'What size ball do U8 players use?',a:'A size 3. Players move to a size 4 at U9.'}],
  lessons:['learn7_carry','learn7_roles','prn_7_spread'],links:[G.ages,G.ball,G.field]},

 {slug:'u8-dribbling-practice-plan',age:'U8',theme:'Dribbling and 1v1',title:'U8 Soccer Practice Plan: Dribbling and 1v1 (60 Minutes)',
  desc:'A 60-minute U8 soccer practice plan for dribbling and 1v1: gates, turn and go, 1v1 to end zones and the numbers game, with a clock table and breaks.',
  lead:'A 60-minute practice for 7 and 8 year olds on the skill that matters most at this age: taking the ball past a defender. It builds from a ball each, to turns, to 1v1, to a game.',
  goal:'Beat a defender with a change of speed or direction',minutes:60,players:'8 to 14',field:FIELD.U8,
  rows:[[8,'Play','3v3 games as players arrive','three-v-three-game','Small fields, small goals. Notice who tries to dribble past a player.'],[8,'Practice','Gates dribbling','gates-dribbling','Head up to find an open gate. Last round: two defenders close gates.'],W,
   [10,'Practice','Turn and go','turn-and-go','The drag-back and the inside hook, each followed by three fast steps.'],[12,'Practice','1v1 to end zones','one-v-one-to-end-zones','Many small fields. Use the turn or a change of speed to get past.'],W,
   [13,'Play','Numbers game, then 4v4','numbers-game','Five minutes of 1v1 and 2v2 on the call, then a free 4v4 game.'],[3,'Finish','Circle up','','“When is a good time to dribble?” Listen to two answers.']],
  equipment:[...BASE,'4 small goals, or 8 extra cones'],
  notes:['Teach one turn well. The second can wait for next week.','In 1v1, change opponents often so everyone wins some and loses some.','Praise the try. A player who is told off for losing the ball stops dribbling.'],
  swap:{sign:'Turn and go is flat and players are going through the motions.',instead:'Make it a contest in pairs: one dribbles and turns whenever they like, the partner shadows them. Swap after thirty seconds.'},
  faq:[{q:'How do I teach U8 players to beat a defender?',a:'One move, a change of speed and many tries. Small 1v1 fields give each player a new attempt every minute.'},
   {q:'Is 1v1 too competitive for 7-year-olds?',a:'Not when turns are short and opponents change. Children this age enjoy the contest, and both the attacker and the defender are learning.'},
   {q:'Why do we finish with a game?',a:'It is the last stage of Play-Practice-Play. Players try what they practiced in a real game, and the coach watches to see what stuck.'}],
  lessons:['learn7_carry','next7_dribbleroom','def_7_goalside'],links:[G.wg,G.tackle,G.ages]},

 {slug:'u8-passing-practice-plan',age:'U8',theme:'Passing',title:'U8 Soccer Practice Plan: First Passing Games (60 Minutes)',
  desc:'A 60-minute U8 soccer practice plan that introduces passing: partner gates, 2v1 to goal and a first 3v1 rondo, with a clock table and water breaks.',
  lead:'A 60-minute practice that introduces passing to 7 and 8 year olds. It keeps the ball between two players for most of the hour and gives every pass a reason: a gate to hit, a defender to beat, a goal to score.',
  goal:'Pass to a teammate, then move',minutes:60,players:'8 to 14',field:FIELD.U8,
  rows:[[8,'Play','2v2 games as players arrive','','Two-player teams make passing natural: there is only one teammate to find.'],[10,'Practice','Partner passing through gates','partner-passing-through-gates','Inside of the foot. A point for each gate, then move to a new one.'],W,
   [10,'Practice','3v1 rondo','rondo-3v1','A 10-yard square. Help the player on the ball from both sides. Change the defender every minute.'],[11,'Practice','2v1 to goal','two-v-one-to-goal','Dribble at the defender. If they come to you, pass. Small goals, no goalkeeper.'],W,
   [12,'Play','4v4 game','three-v-three-game','Free play. Quietly count the passes that reach a teammate and tell the team at the end.'],[3,'Finish','Circle up','','“What did you do after you passed?”']],
  equipment:[...BASE,'16 extra cones for gates','4 small goals'],
  notes:['Expect the rondo to break down often the first time. Make the square bigger rather than giving up.','Do not ban dribbling. A player who dribbles when no pass is open has made the right choice.','“Pass and move” is the only coaching point today.'],
  swap:{sign:'The 3v1 rondo is not working: the defender wins every ball.',instead:'Play 4v1 in a bigger square, or let the defender hold a bib in each hand and walk. Success first, pressure later.'},
  faq:[{q:'When should kids start learning to pass?',a:'Around U8, in pairs and in 2v1 games. Before that most children are still learning to control the ball themselves.'},
   {q:'What is the best passing drill for 7-year-olds?',a:'Passing through gates in pairs. It is a game with a score, and it rewards both the pass and moving to a new gate.'},
   {q:'Are rondos too hard for U8?',a:'A 3v1 in a big square is about right late in the season. If players cannot make three passes, go back to pairs and try again in a few weeks.'}],
  lessons:['prn_7_support','learn9_two_one','learn7_receive'],links:[G.giveGo,G.twoVone,G.cm]},

 {slug:'u10-first-practice',age:'U10',theme:'First practice of the season',title:'U10 Soccer Practice Plan: First Practice (60 Minutes)',
  desc:'A 60-minute U10 soccer practice plan for the first day of a 7v7 season: small games, a rondo, 2v1 to goal and a game with the build-out line explained.',
  lead:'A 60-minute first practice for 9 and 10 year olds starting a 7v7 season. It lets you see every player in small games, introduces the rondo you will use all season, and ends with a game where the build-out line is explained once.',
  goal:'See every player, and start the season’s habits',minutes:60,players:'10 to 14',field:FIELD.U10,
  rows:[[10,'Play','3v3 games as players arrive','three-v-three-game','Two small fields. Rotate teams once. Watch for who looks up and who helps a teammate.'],[10,'Practice','3v1 rondo','rondo-3v1','Groups of four. Support on both sides of the ball. Everyone defends for one minute.'],W,
   [12,'Practice','2v1 to goal','two-v-one-to-goal','With a goalkeeper, taking turns. Dribble at the defender, then pass or keep going.'],W,
   [18,'Play','5v5 or 7v7 game','build-out-game','With goalkeepers. Stop once, at the first goal kick, to show where the other team waits at the build-out line.'],[4,'Finish','Circle up','','Season habits: we start by playing, we rotate goalkeepers, we encourage each other.']],
  equipment:[...BASE,'2 goals for the final game, plus 4 small goals','Goalkeeper gloves to share'],
  notes:['Ask who wants to try goalkeeper and promise that everyone will get a turn this season.','Use the size 4 ball from the first day.','Learn names in the rondo: call the name of the player you pass to.','Send parents the season schedule the same evening.'],
  swap:{sign:'The 2v1 to goal has a long line because the group is large.',instead:'Split into two goals, or play 2v1 across small fields to cone goals with no goalkeeper. Six players per field is the limit.'},
  faq:[{q:'What should a first U10 practice cover?',a:'Small games to see the players, one passing game such as a 3v1 rondo, one attacking game such as 2v1 to goal, and a 7v7-style game to finish.'},
   {q:'How do I explain the build-out line?',a:'At the first goal kick in the final game: the other team waits behind the dashed line until the ball is played, so our defenders have time to receive it.'},
   {q:'How long is a U10 practice?',a:'60 to 75 minutes in US Youth Soccer’s coaching guidance. This plan uses 60.'}],
  lessons:['learn7_buildout','learn7_roles','prn_7_support'],links:[G.f7,G.buildOut,G.gk]},

 {slug:'u10-passing-practice-plan',age:'U10',theme:'Passing and first touch',title:'U10 Soccer Practice Plan: Passing and First Touch',
  desc:'A 60-minute U10 soccer practice plan for passing and first touch: receive across the body, a 3v1 rondo and the four-goal game, with a clock table.',
  lead:'A 60-minute practice for 9 and 10 year olds with one theme from start to finish: receive the ball so you can play forward. It moves from a first touch on the back foot, to a rondo, to a game that rewards switching sides.',
  goal:'Open up, receive on the back foot and play forward',minutes:60,players:'10 to 14',field:FIELD.U10,
  rows:[[10,'Play','4v4 games as players arrive','three-v-three-game','No goalkeepers. Notice how players stand when they receive: facing the ball, or half turned?'],[10,'Practice','Receive across the body','receive-across-the-body','Groups of three. Back foot, open body, two touches.'],W,
   [12,'Practice','3v1 rondo','rondo-3v1','Same first touch, now with a defender. Five passes is a goal.'],W,
   [18,'Play','Four-goal game, then a free game','four-goal-game','Ten minutes with two goals to attack, so the open side is worth finding. Then eight minutes of a normal game with goalkeepers.'],[4,'Finish','Circle up','','“How did you know which way to take your first touch?”']],
  equipment:[...BASE,'4 small goals, or 8 extra cones','2 goals for the last game'],
  notes:['The whole practice has one cue: “open up”.','In the rondo, freeze play once to show a receiver hiding behind the defender, then let them fix it.','In the four-goal game, coach only at the break.'],
  swap:{sign:'Receive across the body is slow and players look bored.',instead:'Turn it into first touch gates in pairs with a score: ten clean touches through the gate, then race another pair.'},
  faq:[{q:'How do I improve first touch at U10?',a:'Teach receiving on the back foot with an open body, then put it under light pressure in a rondo. Players need the technique and a reason to use it.'},
   {q:'How often should we do rondos?',a:'Ten minutes in most practices is plenty. Change the size, the touch limit or the scoring so it stays fresh.'},
   {q:'Why two goals at each end?',a:'So that moving the ball to the other side has an obvious reward. Players start to look across the field before they receive.'}],
  lessons:['learn7_receive','prn_7_support','learn9_switch'],links:[G.firstTouch,G.switching,G.cm]},

 {slug:'u10-1v1-practice-plan',age:'U10',theme:'1v1 attacking and defending',title:'U10 Soccer Practice Plan: 1v1 Attacking and Defending',
  desc:'A 60-minute U10 soccer practice plan for 1v1: attacking two small goals, defending side on, recovery runs and a numbers game, with a clock table.',
  lead:'A 60-minute practice for 9 and 10 year olds on both sides of the 1v1. Attackers learn to shift a defender and go the other way, and defenders learn to slow down, get side on and stay goal-side.',
  goal:'Win your 1v1, with and without the ball',minutes:60,players:'8 to 14',field:FIELD.U10,
  rows:[[10,'Play','2v2 games as players arrive','','Small fields to end lines. Every player is always attacking or defending.'],[10,'Practice','1v1 to two small goals','one-v-one-two-goals','Attack one goal to open the other. Coach the attacker.'],W,
   [12,'Practice','1v1 defending','one-v-one-defending','Same players, narrow channel. Fast, then slow, then side on. Coach the defender.'],W,
   [8,'Practice','Recover goal-side','recover-goal-side','The defender starts beside the attacker and must get in front before challenging.'],[10,'Play','Numbers game, then a free game','numbers-game','1v1 and 2v2 on the call for four minutes, then 5v5 with goalkeepers.'],[4,'Finish','Circle up','','“What does a good defender do first?”']],
  equipment:[...BASE,'6 small goals, or 12 extra cones','2 goals for the last game'],
  notes:['Match players of similar speed in the 1v1 games, and change pairs often.','Coach the attacker in the first game and the defender in the second. One voice, one idea.','No tackles from behind, at any speed. Say it before the recovery game starts.'],
  swap:{sign:'Defenders keep diving in and attackers score every time.',instead:'Add a rule to 1v1 defending: the defender wins a point just for keeping the attacker out of the end zone for six seconds. Patience now has a reward.'},
  faq:[{q:'How do I teach 1v1 defending to U10 players?',a:'Three steps: close the space fast, slow down two or three yards away, and turn side on. Then be patient until the attacker makes a big touch.'},
   {q:'How much 1v1 should we do?',a:'A little in most practices. One-against-one moments decide youth games, and they build confidence on the ball.'},
   {q:'Should defenders tackle or wait?',a:'Wait until the ball is there to win. A defender who stays on their feet and goal-side has done the job even without a tackle.'}],
  lessons:['def_7_goalside','learn7_carry','trn_9_recover'],links:[G.goalSide,G.tackle,G.fouls]},

 {slug:'u12-first-practice',age:'U12',theme:'First practice of the season',title:'U12 Soccer Practice Plan: First Practice (75 Minutes)',
  desc:'A 75-minute U12 soccer practice plan for the first day of a 9v9 season: small games, a 4v2 rondo, 3v2 to goal and a 9v9 game, with a clock table.',
  lead:'A 75-minute first practice for 11 and 12 year olds starting a 9v9 season. It shows you the group at game speed, sets a standard for how the team keeps the ball, and finishes with the real game.',
  goal:'See the group at game speed and set the standard',minutes:75,players:'12 to 16',field:FIELD.U12,
  rows:[[12,'Play','4v4 games as players arrive','four-goal-game','Two fields. Four-minute games, then winners play winners. Watch decisions, not just skill.'],[12,'Practice','4v2 rondo','rondo-4v2','Groups of six. Two touches. A pass between the two defenders is a goal.'],W,
   [15,'Practice','3v2 to goal','three-v-two-to-goal','Eight seconds to shoot. Rotate so everyone attacks and defends. Goalkeepers take turns.'],W,
   [25,'Play','9v9 game, or the biggest even game you can make','end-zone-game','Play offside if your league does. Let it run; stop once to check that players know their line.'],[5,'Finish','Circle up','','Ask the players for two team goals for the season and write them down.']],
  equipment:[...BASE,'2 goals','Goalkeeper gloves','4 small goals for the arrival games'],
  notes:['Ask each player which positions they have played and which they would like to try.','Set the tone for mistakes: trying the right thing and losing the ball is fine here.','Explain the heading rule for the age group and that practices will not include repeated heading.','Finish on time. Parents notice.'],
  swap:{sign:'The 4v2 rondo keeps breaking down after one or two passes.',instead:'Make the square bigger and allow three touches, or play 5v2. Shrink it again once the group makes five passes.'},
  faq:[{q:'What should a first U12 practice include?',a:'Small-sided games on arrival, a possession game such as a 4v2 rondo, an attacking game to goal and a 9v9-style game. Talk about team goals at the end.'},
   {q:'How long is a U12 soccer practice?',a:'About 75 minutes in US Youth Soccer’s coaching guidance.'},
   {q:'Do U12 teams play offside?',a:'Yes. The 9v9 game has offside, so use it in practice games and explain it once. Our offside page has a diagram.'}],
  lessons:['learn9_shape','gap11_runoncue','bld_11_throughlines'],links:[G.f9,G.offside,G.heading]},

 {slug:'u12-possession-practice-plan',age:'U12',theme:'Passing and possession',title:'U12 Soccer Practice Plan: Passing and Possession',
  desc:'A 75-minute U12 soccer practice plan for possession: receive and turn, a 4v2 rondo and three-team keep-away, then a game. Clock table and water breaks.',
  lead:'A 75-minute practice for 11 and 12 year olds on keeping the ball with a purpose. It links three ideas: look before you receive, find the pass through two defenders, and react the moment the ball is lost.',
  goal:'Keep the ball to go forward, and react when it is lost',minutes:75,players:'12 to 16',field:FIELD.U12,
  rows:[[12,'Play','4v4 games as players arrive','four-goal-game','No goalkeepers. A goal counts double after five passes.'],[10,'Practice','Receive and turn','receive-and-turn','Groups of four with a defender. Check your shoulder: turn, or play back?'],W,
   [12,'Practice','4v2 rondo','rondo-4v2','Split the defenders when the gap is open, and go around when it is not.'],[13,'Practice','Three-team keep-away','three-team-keep-away','The team that loses the ball defends at once. Three-minute games.'],W,
   [18,'Play','9v9 game, or the biggest even game you can make','build-out-game','Start every restart from the goalkeeper, so the team practices playing out. No other rules.'],[4,'Finish','Circle up','','“When should we keep the ball, and when should we go forward quickly?”']],
  equipment:[...BASE,'Bibs in a third color','2 goals'],
  notes:['Possession is a tool for getting forward. Praise the forward pass that comes after patient passing.','In keep-away, the first three seconds after losing the ball are the lesson.','Hold the two-touch limit loosely. A third touch to escape pressure is good play.'],
  swap:{sign:'Three-team keep-away is chaotic and nobody knows who is defending.',instead:'Freeze it, give each team one job for three minutes with no changes, then bring the change back once the passing settles.'},
  faq:[{q:'How do I teach U12 players to keep possession?',a:'Start with scanning and a good first touch, add a rondo for passing under pressure, and finish with a game where losing the ball has an immediate cost.'},
   {q:'Is possession more important than scoring?',a:'No. Keeping the ball is how a team creates a good chance to score. Reward the forward pass and the shot that follow.'},
   {q:'How many touches should players be allowed?',a:'Two is a useful challenge at U12, but not a law. The aim is quick decisions, and sometimes the right decision is to dribble.'}],
  lessons:['learn9_receive','learn9_switch','bld_11_throughlines','gap7_lostball'],links:[G.switching,G.pressing,G.cm]},

 {slug:'u12-finishing-practice-plan',age:'U12',theme:'Shooting and finishing',title:'U12 Soccer Practice Plan: Shooting and Finishing',
  desc:'A 75-minute U12 soccer practice plan for finishing: lay-off and shoot, low crosses, 3v2 to goal and a game, with a clock table and water breaks.',
  lead:'A 75-minute practice for 11 and 12 year olds on finishing attacks. Shots come from a lay-off, from a low cross and from a 3v2, so players practice the chances a real game gives them.',
  goal:'Finish first time, and follow every shot',minutes:75,players:'12 to 16, with goalkeepers taking turns',field:FIELD.U12,
  rows:[[12,'Play','World Cup as players arrive','world-cup-shooting-game','Pairs against pairs at one goal. A pair that scores runs around the goal and rejoins. Nobody sits out.'],[12,'Practice','Lay-off and shoot','lay-off-and-shoot','Two goals, small groups. Firm pass in, soft pass out, strike it first time.'],W,
   [14,'Practice','Crossing and finishing','crossing-and-finishing','Low crosses and cutbacks only. One runner near post, one far post. Both sides.'],[12,'Practice','3v2 to goal','three-v-two-to-goal','Eight seconds to shoot. A rebound goal counts double.'],W,
   [16,'Play','9v9 game, or the biggest even game you can make','follow-the-shot','Free play. Any goal scored from a rebound counts double.'],[3,'Finish','Circle up','','“Where do most goals come from?”']],
  equipment:[...BASE,'2 goals','Goalkeeper gloves','A big supply of balls beside each goal'],
  notes:['Rotate goalkeepers every few minutes and keep shots from a sensible distance.','All crosses stay low. Finishes are with the foot.','Count shots on target, not goals. It rewards technique.','Players collect balls together between activities, never from behind a goal during shooting.'],
  swap:{sign:'Crossing and finishing is slow because the crosses do not reach the runners.',instead:'Move the wide player closer and let them pass a still ball across, or switch to 2v1 to goal from a wide start so the “cross” becomes a short pass.'},
  faq:[{q:'What are good finishing drills for U12?',a:'Lay-off and shoot for first-time strikes, crossing and finishing with low balls, and 3v2 to goal for finishing under pressure.'},
   {q:'Should U12 players head crosses in practice?',a:'This plan uses low crosses finished with the foot. US Youth Soccer limits heading in practice at ages 11 and 12, and the low ball is the more useful skill.'},
   {q:'How do I keep everyone busy in shooting practice?',a:'Use two goals, groups of four or five, and a rule that the shooter fetches their own ball. Waiting drops to one turn.'}],
  lessons:['next7_shotreaction','learn11_cutback','learnf_farpost'],links:[G.st,G.cross,G.cutback,G.heading]},
];
function build(r:RawPlan):Plan{
 const w=`plan ${r.slug}`;let t=0;
 if(r.minutes!==PRACTICE_MINUTES[r.age])throw new Error(`${w}: ${r.minutes} minutes is not the practice length for ${r.age}`);
 const rows=r.rows.map(([minutes,stage,activity,slug,purpose])=>{const d=slug?drill(slug):undefined;
  if(d&&!d.ages.includes(r.age))throw new Error(`${w}: ${slug} is not tagged ${r.age}`);
  const row={minutes,stage,activity,drill:d,purpose,start:t,end:t+minutes};t+=minutes;return row;});
 if(t!==r.minutes)throw new Error(`${w}: the clock adds up to ${t}, not ${r.minutes}`);
 const stages=rows.filter(x=>x.stage==='Play'||x.stage==='Practice').map(x=>x.stage);
 if(stages[0]!=='Play'||stages[stages.length-1]!=='Play'||!stages.includes('Practice'))throw new Error(`${w}: the order must be play, practice, play`);
 if(rows.filter(x=>x.stage==='Break').length<2)throw new Error(`${w}: at least two water breaks`);
 const drills=[...new Set(rows.map(x=>x.drill).filter((d):d is Drill=>!!d))];
 return {...r,path:planPath(r.slug),name:`${r.age} ${r.theme[0].toLowerCase()+r.theme.slice(1)}`,h1:`${r.age} soccer practice plan: ${r.theme[0].toLowerCase()+r.theme.slice(1)}`,rows,drills,lessons:pickLessons(r.lessons,w),picture:drills[1]?.picture??drills[0].picture};
}
export const PLANS:readonly Plan[]=RAW.map(build);
export const planBySlug=(slug:string)=>PLANS.find(p=>p.slug===slug);
export const plansForAge=(a:Age)=>PLANS.filter(p=>p.age===a);
/** Plans that use a drill (drill pages link to them). */
export const plansForDrill=(slug:string)=>PLANS.filter(p=>p.drills.some(d=>d.slug===slug));
export const clock=(m:number)=>`${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`;
export const PPP_LINE='These plans follow the Play-Practice-Play structure that U.S. Soccer teaches grassroots coaches: players arrive and play small games, then practice the day’s idea in game-like activities, then finish with a game. The structure is U.S. Soccer’s; the minutes for each part are ours, so adjust them to your group.';
export const PLAN_SAFETY_LINE='Give water breaks more often in hot weather, never use running as a punishment, and change the size of any area that is too hard or too easy.';
export const PLANS_HUB={path:PLANS_HUB_PATH,crumb:'Practice plans',blurb:`${RAW.length} ready-to-use soccer practice plans for U6, U8, U10 and U12, each with a clock table, equipment list and linked drills`,
 title:'Soccer Practice Plans for Kids: U6, U8, U10 and U12',h1:'Soccer practice plans for kids',
 description:'Free soccer practice plans for U6, U8, U10 and U12: a first practice of the season and themed sessions, each with a clock table, drills and equipment.',
 lead:`Here are ${RAW.length} ready-to-use soccer practice plans for volunteer coaches: three each for U6, U8, U10 and U12. Every plan has a clock table, an equipment list, links to each drill with a diagram, and a swap for when things go badly.`,
 more:'Each age has a plan for the first practice of the season and two themed plans. They print on one page, so you can take one to the field.',
 stages:[['Play','Players join a small game, such as 2v2 or 3v3, the moment they arrive. The coach watches and says little. The game points players at the day’s idea.'],
  ['Practice','One or two game-like activities on that idea, with repetitions and a challenge. This is where the coach teaches: a short demonstration, a question, a key word.'],
  ['Play','A game in a format close to match day. Players try what they practiced and the coach mostly lets them play.']] as [string,string][],
 lengths:[['U6','45 minutes','4v4, no goalkeepers','Size 3'],['U8','45 to 60 minutes','4v4, no goalkeepers','Size 3'],['U10','60 to 75 minutes','7v7','Size 4'],['U12','75 minutes','9v9','Size 4']] as string[][],
 lengthsNote:'Practice length: US Youth Soccer Coaching Education Department. Game and ball: U.S. Soccer small-sided standards. Our U8 and U10 plans use 60 minutes. Your league may differ.',
 faq:[{q:'What is Play-Practice-Play?',a:'The practice structure U.S. Soccer teaches grassroots coaches. Players start with small games, then practice one idea in game-like activities, then finish with a game.'},
  {q:'How long should a youth soccer practice be?',a:'US Youth Soccer’s coaching guidance suggests about 45 minutes at U6, 45 to 60 at U8, 60 to 75 at U10 and 75 at U12.'},
  {q:'How do I plan a soccer practice for beginners?',a:'Pick one idea, such as dribbling. Start with small games, run two or three activities on that idea with a ball for every player, and end with a game.'},
  {q:'What equipment do I need to coach youth soccer?',a:'A ball for every player, about 20 cones, bibs in two colors, small goals or extra cones, water, a first aid kit and a pump.'},
  {q:'Should practice start with laps or stretching?',a:'No. Children warm up by playing. A small game or a ball-each game in the first minutes prepares them and teaches soccer too.'}] as Faq[],
 lessons:pickLessons(['learn7_carry','prn_7_support','learn7_receive','def_7_goalside'],'plans hub')};
