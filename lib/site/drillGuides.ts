import type {Faq} from './safety';
import type {SiteLesson} from './lessons';
import {DRILLS,DRILLS_HUB_PATH,drill,drillLine,pickLessons,type Age,type Drill,type DrillLink} from './drills';
import {G} from './drillLinks';
/**
 * Age guides and skill guides of the drills cluster (Nov 10 2026): /learn/soccer-drills/u6, /u8, /u10, /u12 and
 * /learn/soccer-drills/at-home, /passing, /dribbling, /shooting, /first-touch, /goalkeeper. Each is a curated guide, not a
 * list: what players of that age can do, how to group them, the best drills with one line each, and what to avoid. They share
 * the route app/(site)/learn/soccer-drills/[slug] with the drill pages (a guide slug may not equal a drill slug: checked below).
 *
 * SOURCES (checked Nov 10 2026; full URLs in lib/site/drills.ts):
 *  - US Youth Soccer Player Development Model: U6 short attention span, one task at a time; U8 attention a bit longer; U10
 *    lengthened attention span; no goalkeepers in 3v3 and 4v4 through age 8; the goalkeeper position is new at U10.
 *  - US Youth Soccer Coaching Education Department, "How to Write a Training Session Plan": U6 45 minutes, U8 45 to 60,
 *    U10 60 to 75, U12 75.
 *  - U.S. Soccer Grassroots, Play-Practice-Play document: children do not want to stand in lines, run laps or be lectured;
 *    small-sided play of 2v2, 3v3, 4v4 to start, a game to finish.
 *  - Game format, field, ball and game length per age: lib/site/sizes.ts (U.S. Soccer small-sided standards). Heading:
 *    lib/site/rules.ts (none at 10 and under; limits in practice at 11 and 12).
 * The "can / cannot yet" lines are plain coaching descriptions written for these pages, not measurements; no statistics.
 */
export type GuideSection={id:string;title:string;items:string[]};
export type GuideFacts={label:string;rows:[string,string][];note:string};
export type RawGuide={slug:string;kind:'age'|'skill';age?:Age;name:string;title:string;h1:string;desc:string;blurb:string;lead:string;more:string;facts?:GuideFacts;before:GuideSection[];picksTitle:string;picks:[string,string][];
 after:GuideSection[];faq:Faq[];lessons:string[];links:DrillLink[];featured:string};
export type DrillGuide=Omit<RawGuide,'picks'|'lessons'>&{path:string;picks:{drill:Drill;line:string}[];lessons:SiteLesson[];picture:string};
const PLANS='/learn/soccer-practice-plans';
const plan=(slug:string,name:string,line:string):DrillLink=>({path:`${PLANS}/${slug}`,name,line});
const NOTE='Game format, field, ball and game length are U.S. Soccer’s small-sided standards; practice length is US Youth Soccer’s coaching guidance. Your league may differ.';
const RAW:RawGuide[]=[
 {slug:'u6',kind:'age',age:'U6',name:'U6 drills',title:'U6 Soccer Drills: Fun Games for 5 and 6 Year Olds',h1:'U6 soccer drills: fun games for 5 and 6 year olds',
  desc:'The best U6 soccer drills are games: a ball for every child, a story and no lines. Nine fun drills for 5 and 6 year olds, plus what to avoid at this age.',
  blurb:'Nine games for 5 and 6 year olds, a ball each, with what to avoid',
  lead:'The best soccer drills for 5 and 6 year olds do not look like drills at all. They are games with a story, where every child has a ball and nobody waits for a turn.',
  more:'At this age a practice has one aim: each child falls in love with having a ball at their feet. Dribbling, stopping and kicking come first. Passing and positions can wait.',
  facts:{label:'U6 soccer at a glance',rows:[['Players','5 and 6 years old'],['Game','4v4, with no goalkeepers'],['Field','25 to 35 yards long, 15 to 25 yards wide'],['Ball','Size 3'],['Game length','4 quarters of 10 minutes'],['Practice length','About 45 minutes'],['Heading','None']],note:NOTE},
  before:[{id:'can',title:'What U6 players can and cannot do yet',items:['They can run, stop, chase and kick, and they love to be chased.','They can dribble a ball with many small touches when a game gives them a reason to.','They pay attention to one task at a time, for a short time. Explain a game in two sentences and start.',
    'They are not ready to share the ball. “Mine!” is normal, so give everyone their own ball.','They do not yet understand positions or team shape. A bunch around the ball is what the game looks like at five.','They tire quickly and recover quickly. Short bursts and many water breaks suit them.']},
   {id:'groups',title:'Attention span and group sizes',items:['Change the activity about every eight minutes, or sooner if eyes start to wander.','One ball per child for most of the practice.','Play 1v1, 2v2 or 3v3 on small fields. Avoid any game bigger than 4v4.','Ask a parent to help so two small games can run side by side.']}],
  picksTitle:'The best U6 soccer drills',
  picks:[['simon-says-soccer','The best first game: stop the ball with the body part the coach calls.'],['red-light-green-light','Dribble on green, foot on the ball on red.'],['sharks-and-minnows','Dribble across the ocean past a shark. The coach is the first shark.'],
   ['pirates-and-treasure','Steal a ball from the middle and dribble it home to your ship.'],['gates-dribbling','Count how many “doors” you can dribble through in a minute.'],['dribble-tag','Tag, but everyone keeps a ball at their feet.'],
   ['clean-your-room','Kick every ball out of your half. The first lesson in using the laces.'],['dribble-and-shoot','Dribble through a gate and score in a small goal with no goalkeeper.'],['three-v-three-game','Finish every practice with a real game on a small field.']],
  after:[{id:'avoid',title:'What to avoid with U6 players',items:['Laps. Running without a ball teaches no soccer, and children this age warm up by playing.','Lines. One child kicking while nine wait is the slowest way to learn.','Lectures. If you talk for more than thirty seconds you have lost them.',
   'Elimination games that send children out. The ones who go out first need the ball most.','Fixed positions and goalkeepers. Their games have neither.','Heading. Players aged 10 and under do not head the ball.']}],
  faq:[{q:'What should a U6 soccer practice look like?',a:'About 45 minutes: a small game as children arrive, three or four ball-each games of about eight minutes with water breaks, and a 3v3 or 4v4 game to finish.'},
   {q:'How do I coach 5-year-olds who will not listen?',a:'Talk less and play more. Use games with a story, give every child a ball, and change activity before they get bored. It is their attention span, not their attitude.'},
   {q:'Should U6 players learn to pass?',a:'A little, in pairs, for a few minutes. Most five-year-olds are not ready to give the ball away, and dribbling is the skill to build first.'},
   {q:'How many kids should be on a U6 team?',a:'Small rosters work best because the game is 4v4. Ask your league for its roster limit.'}],
  lessons:['learn7_carry','learn7_receive','learn7_roles'],links:[plan('u6-first-practice','U6 first practice plan','A 45-minute plan for the first day'),G.ages,G.ball,G.field],featured:'sharks-and-minnows'},

 {slug:'u8',kind:'age',age:'U8',name:'U8 drills',title:'U8 Soccer Drills: 10 Fun Drills for 7 and 8 Year Olds',h1:'U8 soccer drills for 7 and 8 year olds',
  desc:'Ten U8 soccer drills that 7 and 8 year olds enjoy: dribbling games, 1v1, first passing games and 3v3. What players this age can do, and what to avoid.',
  blurb:'Ten drills for 7 and 8 year olds: dribbling, 1v1, first passing and 3v3',
  lead:'U8 soccer drills should still be games, but 7 and 8 year olds are ready for more: a partner, a defender and a score to beat. Dribbling and 1v1 stay at the center, and passing in pairs begins.',
  more:'Players this age can hold attention a little longer than at U6 and start to enjoy working with one teammate. They still play 4v4 with no goalkeepers, so practice should look like that game.',
  facts:{label:'U8 soccer at a glance',rows:[['Players','7 and 8 years old'],['Game','4v4, with no goalkeepers'],['Field','25 to 35 yards long, 15 to 25 yards wide'],['Ball','Size 3'],['Game length','4 quarters of 10 minutes'],['Practice length','45 to 60 minutes'],['Heading','None']],note:NOTE},
  before:[{id:'can',title:'What U8 players can and cannot do yet',items:['They can dribble with both feet, turn and stop the ball, with practice.','They can pass to a partner over five to ten yards and begin to control the pass that comes back.','They can play 1v1 with real purpose, both attacking and defending.',
    'They are starting to cooperate with one teammate. Pairs work, but large groups do not.','They still follow the ball in a bunch, though it begins to loosen. Do not fix it with positions; fix it with small games.','They cannot yet picture the whole field. Keep ideas to “me, the ball and one friend”.']},
   {id:'groups',title:'Attention span and group sizes',items:['Plan activities of eight to ten minutes each.','A ball each, or a ball between two. Never more than four players to a ball, except in the final game.','Build several small fields rather than one big one: 1v1, 2v1, 2v2 and 3v3.','One coaching point at a time, in one sentence, then play again.']}],
  picksTitle:'The 10 best U8 soccer drills',
  picks:[['sharks-and-minnows','Dribbling under pressure, with a way back in for everyone.'],['gates-dribbling','Head up to find an open gate. Add defenders who close gates.'],['turn-and-go','Three turns every player needs, each followed by a burst of speed.'],
   ['one-v-one-to-end-zones','Many small fields, lots of turns at beating a defender.'],['partner-passing-through-gates','The first passing game: one ball between two, a point per gate.'],['numbers-game','Hear your number, race out and play 1v1 or 2v2.'],
   ['rondo-3v1','Keep-away in a 10-yard square. Start it late in the season.'],['dribble-and-shoot','Laces through a moving ball, at a small goal with no goalkeeper.'],['two-v-one-to-goal','The first team decision: dribble or pass?'],['three-v-three-game','The game itself, small enough for everyone to play.']],
  after:[{id:'avoid',title:'What to avoid with U8 players',items:['Laps, lines and lectures. They cost time on the ball and teach nothing about the game.','Scrimmages of 7v7 or more. In a big game a few children do all the playing.','Goalkeeper training. Games at this age have no goalkeepers.',
   'Games where being “out” means watching. Give a quick task and a way back in.','Shouting instructions during play. Ask a question at the water break instead.','Heading. Players aged 10 and under do not head the ball.']}],
  faq:[{q:'How long should a U8 soccer practice be?',a:'45 to 60 minutes, according to US Youth Soccer’s coaching guidance. Three or four activities of eight to ten minutes and a game at the end fills it well.'},
   {q:'What skills should U8 players learn?',a:'Dribbling with both feet, turning, 1v1 attacking and defending, striking the ball with the laces and passing with the inside of the foot to a partner.'},
   {q:'How do I stop U8 players bunching up?',a:'Play 3v3 on a small field and praise the player who finds space. Fewer players means less of a bunch, and the habit of spreading out grows from there.'},
   {q:'Should U8 teams have set positions?',a:'Not fixed ones. In 4v4 everyone attacks and everyone defends. Simple ideas such as “one player stays back a little” are enough.'}],
  lessons:['learn7_carry','learn7_receive','prn_7_support','prn_7_spread'],links:[plan('u8-first-practice','U8 first practice plan','A 60-minute plan for the first day'),plan('u8-dribbling-practice-plan','U8 dribbling practice plan','One hour built around 1v1'),G.ages,G.field],featured:'gates-dribbling'},

 {slug:'u10',kind:'age',age:'U10',name:'U10 drills',title:'U10 Soccer Drills: 10 Drills for 9 and 10 Year Olds',h1:'U10 soccer drills for 9 and 10 year olds',
  desc:'Ten U10 soccer drills for 9 and 10 year olds: rondos, first touch, give-and-go, 2v1, 1v1 defending and first goalkeeper work. What to coach and avoid.',
  blurb:'Ten drills for 9 and 10 year olds: rondos, first touch, 2v1 and first goalkeeping',
  lead:'U10 soccer drills can ask more of players, because 9 and 10 year olds are ready to learn with teammates. This is the age for first touch, passing in threes, 2v1 and the first goalkeeper basics.',
  more:'The game changes at this age too: 7v7 on a bigger field with a size 4 ball, goalkeepers and a build-out line. Players can hold attention for longer, so a practice can follow one theme from start to finish.',
  facts:{label:'U10 soccer at a glance',rows:[['Players','9 and 10 years old'],['Game','7v7, with goalkeepers and a build-out line'],['Field','55 to 65 yards long, 35 to 45 yards wide'],['Ball','Size 4'],['Game length','2 halves of 25 minutes'],['Practice length','60 to 75 minutes'],['Heading','None']],note:NOTE},
  before:[{id:'can',title:'What U10 players can and cannot do yet',items:['They can pass and receive with both feet, and are ready to learn a first touch that moves the ball into space.','They can work in threes and fours: triangles, rondos and 2v1 make sense to them.','They can look up before the ball arrives, if a game teaches them to.',
    'They are ready for simple team ideas: spread out when we have the ball, get goal-side when we lose it.','The goalkeeper position is new. Everyone should try it, with gentle service.','They are not small adults. Long tactical talks and full-field games still waste their time.']},
   {id:'groups',title:'Attention span and group sizes',items:['Activities can last ten to twelve minutes, with a clear way to score.','Groups of three and four suit most practice games, growing to 4v4 or 5v5 at the end.','Keep one theme for the whole practice, such as first touch, so each game builds on the one before.','Let players solve problems. Ask “what did you see?” before telling them the answer.']}],
  picksTitle:'The 10 best U10 soccer drills',
  picks:[['rondo-3v1','The base of passing under pressure: help on both sides of the ball.'],['receive-across-the-body','Open up, take it on the back foot and play forward.'],['first-touch-gates','A first touch that goes somewhere, left or right.'],
   ['give-and-go','Pass, sprint past the defender and get it back.'],['two-v-one-to-goal','Make the defender choose, then pass or keep going.'],['one-v-one-defending','Fast, then slow, side on, and show them one way.'],
   ['shoulder-check-colors','Look behind you before the ball arrives.'],['four-goal-game','Two goals to attack, so players learn to switch to the open side.'],['goalkeeper-catching-w-and-basket','Safe hands for every player, with soft underarm throws.'],['build-out-game','Playing out from the goalkeeper, as 7v7 asks for.']],
  after:[{id:'avoid',title:'What to avoid with U10 players',items:['Laps, and fitness without a ball. Small-sided games give all the running they need.','Lectures. Show the idea in a small game, ask one question and play again.','Long lines at one goal for shooting. Use two goals and small groups.','Picking one goalkeeper for the season. Rotate, so everyone learns to use their feet and hands.',
   'Booting the ball long from every goal kick. The build-out line is there to let teams pass.','Heading. Players aged 10 and under do not head the ball, in games or in practice.','Hard shots at young goalkeepers from close range.']}],
  faq:[{q:'How long should a U10 soccer practice be?',a:'60 to 75 minutes, according to US Youth Soccer’s coaching guidance. That is time for a small game to start, two practice activities and a longer game to finish.'},
   {q:'What should U10 players work on?',a:'First touch, passing and receiving in threes and fours, 1v1 and 2v1 in attack, 1v1 defending, and for everyone, the basics of goalkeeping.'},
   {q:'Can U10 players head the ball?',a:'No. In US youth soccer, players aged 10 and under do not head the ball in games or practice. Teach chest, thigh and foot control for high balls.'},
   {q:'What formation should a U10 team play?',a:'U10 teams play 7v7. Shapes such as 2-3-1 give every player a clear job, and our 7v7 formations page compares them.'}],
  lessons:['learn7_receive','prn_7_support','learn7_buildout','def_7_goalside'],links:[plan('u10-first-practice','U10 first practice plan','A 60-minute plan for the first day'),plan('u10-passing-practice-plan','U10 passing practice plan','Rondos, a first touch and a four-goal game'),G.f7,G.buildOut,G.heading],featured:'rondo-3v1'},

 {slug:'u12',kind:'age',age:'U12',name:'U12 drills',title:'U12 Soccer Drills: 10 Drills for 11 and 12 Year Olds',h1:'U12 soccer drills for 11 and 12 year olds',
  desc:'Ten U12 soccer drills for 11 and 12 year olds: 4v2 rondos, possession games, pressure and cover, 3v2 and finishing from low crosses. What to coach.',
  blurb:'Ten drills for 11 and 12 year olds: 4v2 rondos, possession, defending in pairs and finishing',
  lead:'U12 soccer drills can look more like the real game, because 11 and 12 year olds can think about teammates and opponents at the same time. Possession games, defending in pairs and attacks that end with a finish all fit this age.',
  more:'The game is now 9v9 on a field up to 80 yards long, with offside. Players need skill at speed and good decisions, and both come from games with real opponents more than from patterns around cones.',
  facts:{label:'U12 soccer at a glance',rows:[['Players','11 and 12 years old'],['Game','9v9, with goalkeepers and offside'],['Field','70 to 80 yards long, 45 to 55 yards wide'],['Ball','Size 4'],['Game length','2 halves of 30 minutes'],['Practice length','About 75 minutes'],['Heading','Allowed in games from age 11 under US Youth Soccer rules, with limits in practice']],note:NOTE},
  before:[{id:'can',title:'What U12 players can and cannot do yet',items:['They can keep the ball in tight spaces and are ready for two-touch and one-touch games.','They can understand a shape with lines: backs, midfielders and forwards, and how they connect.','They can defend with a partner: one presses, one covers.',
    'They can time a run to stay onside, once they have learned the rule.','They vary a lot in size and speed, since some are growing fast and some are not. Judge skill and decisions, not size.','They still learn best by playing. A whiteboard is no replacement for a small-sided game.']},
   {id:'groups',title:'Attention span and group sizes',items:['Activities of twelve to fifteen minutes work, if the challenge is real.','Use groups of four to six for practice games, and build to 6v6 or the full 9v9 at the end.','Give players a problem to solve, such as “score within eight seconds”, and let them talk about it.','Keep water breaks in the plan. They are also the best moment for one coaching point.']}],
  picksTitle:'The 10 best U12 soccer drills',
  picks:[['rondo-4v2','Find the pass that splits two defenders.'],['three-team-keep-away','Possession with a sudden change every time the ball is lost.'],['receive-and-turn','Check your shoulder: turn, or play back?'],
   ['pressure-and-cover-2v2','Defend as a pair and swap jobs as the ball moves.'],['recover-goal-side','Run to the goal first, then challenge.'],['three-v-two-to-goal','Use the spare attacker before the defense recovers.'],
   ['crossing-and-finishing','Low crosses and cutbacks, finished by foot at the near and far post.'],['end-zone-game','Time the run to arrive with the pass.'],['one-v-one-two-goals','Change direction to open up a goal.'],['goalkeeper-angles','Where to stand so the goal looks small.']],
  after:[{id:'avoid',title:'What to avoid with U12 players',items:['Running as punishment, or laps to “get fit”. Games at speed do the job and teach soccer too.','Standing in lines to shoot one at a time.','Lectures on tactics. Show the idea in a small game and ask the players what they saw.','Patterns with no defenders for more than a few minutes. Decisions need opponents.',
   'Repeated heading practice. US Youth Soccer limits heading in practice at ages 11 and 12; see our heading rules page.','Choosing positions by size. Let every player try defending, midfield and attacking.','Winning the practice game at any cost. The scoreboard that matters at 12 is how many players improved.']}],
  faq:[{q:'How long should a U12 soccer practice be?',a:'About 75 minutes, according to US Youth Soccer’s coaching guidance: an opening game, two practice activities on one theme, and a longer game at the end.'},
   {q:'What should U12 players focus on?',a:'Passing and receiving under pressure, scanning before the ball arrives, defending in pairs, and finishing attacks quickly when they have an extra player.'},
   {q:'Can U12 players head the ball?',a:'US Youth Soccer allows heading in games from age 11, with limits on heading in practice at 11 and 12. None of our drills use heading. Check your own league’s rule.'},
   {q:'What formation do U12 teams play?',a:'U12 teams play 9v9. Shapes such as 3-2-3 and 3-3-2 are common, and our 9v9 formations page shows each one.'}],
  lessons:['learn9_receive','learn9_cover','learn9_switch','gap11_runoncue'],links:[plan('u12-first-practice','U12 first practice plan','A 75-minute plan for the first day'),plan('u12-possession-practice-plan','U12 possession practice plan','Rondos into a three-team game'),G.f9,G.offside,G.heading],featured:'rondo-4v2'},

 {slug:'at-home',kind:'skill',name:'Drills to do at home',title:'Soccer Drills to Do at Home: Alone or With a Parent',h1:'Soccer drills to do at home',
  desc:'Soccer drills kids can do at home, alone or with one parent, in a small space: toe taps, cone weave, wall passing, turns and first touch. A 15-minute plan.',
  blurb:'Solo and parent-and-child drills for a yard, a driveway or a wall',
  lead:'These soccer drills work at home with one ball, a few yards of space and, for some, a wall or a parent. Ten to fifteen minutes on most days does more than one long session a week.',
  more:'Practice at home is for the things a team practice has too little time for: hundreds of touches, the weaker foot, and a first touch that does what you want.',
  before:[{id:'need',title:'What you need',items:['A ball in the right size: size 3 up to age 8, size 4 for ages 9 to 12.','A flat space of about 5 by 5 yards. Grass, a driveway or a garage all work.','Four markers. Shoes or water bottles are fine.','A solid wall with no windows, or a parent who can pass the ball back.']},
   {id:'plan',title:'A 15-minute home practice',items:['Minutes 0 to 3: toe taps and foundations, 30 seconds on, 30 seconds off.','Minutes 3 to 6: cone weave, right foot only, then left foot only.','Minutes 6 to 9: turn and go between two markers, five of each turn.',
    'Minutes 9 to 13: wall passing, two touches, then one touch, both feet.','Minutes 13 to 15: free play. Try a move, shoot at a target, or beat a parent 1v1.']}],
  picksTitle:'Soccer drills that work at home',
  picks:[['toe-taps-and-foundations','Two square yards is enough. Count your touches and beat the score.'],['cone-weave-dribbling','Shoes for cones. Time ten trips.'],['turn-and-go','Two markers, three turns, both feet.'],['wall-passing','The wall always passes back. The best solo drill there is.'],
   ['first-touch-gates','Take your first touch through a gate made of two shoes.'],['receive-across-the-body','Pass in from the side, receive on the back foot.'],['thigh-and-chest-control','A parent throws underarm from five steps.'],['shoulder-check-colors','A parent holds up fingers behind you before the pass.'],
   ['one-v-one-to-end-zones','Parent against child, to a line.'],['goalkeeper-catching-w-and-basket','Soft throws and safe hands in the yard.']],
  after:[{id:'tips',title:'Tips for parents',items:['Keep it short and stop while it is still fun. Tomorrow matters more than five extra minutes today.','Let your child keep score against their own best, not against a brother or sister.','Join in. You do not need to be good at soccer to pass a ball back or be a slow defender.',
   'Praise effort with the weaker foot more than a goal with the strong one.','No heading at home either for players aged 10 and under.']}],
  faq:[{q:'How can my child practice soccer alone?',a:'With ball mastery and a wall: toe taps, foundations, a cone weave, turns and wall passing. All of them work in a small space with one ball.'},
   {q:'How long should a child practice at home?',a:'Ten to fifteen minutes on most days is plenty for ages 7 to 12. Short and regular beats long and rare.'},
   {q:'What is the best soccer drill to do at home?',a:'Wall passing. It trains the pass and the first touch together, with both feet, and a child can count and beat their own score.'},
   {q:'Can we practice indoors?',a:'Toe taps, foundations and slow turns work indoors on a soft floor with a soft or futsal-style ball, if there is nothing breakable nearby.'}],
  lessons:['learn7_receive','learn7_carry','s_onetwo'],links:[G.ball,G.firstTouch,G.giveGo],featured:'wall-passing'},

 {slug:'passing',kind:'skill',name:'Passing drills',title:'Soccer Passing Drills for Kids: From Pairs to Rondos',h1:'Soccer passing drills for kids',
  desc:'Soccer passing drills for kids in the order to teach them: pairs through gates, triangles, give-and-go, 3v1 and 4v2 rondos, then possession games.',
  blurb:'Passing drills in teaching order: pairs, triangles, give-and-go and rondos',
  lead:'Good soccer passing drills teach two things at once: an accurate pass, and where to move next. This page puts our passing drills in the order to teach them, from a first game in pairs to rondos and possession games.',
  more:'A pass is a message to a teammate. It works when the passer looks up, the ball is firm and on the ground, and the receiver has moved to where they can be seen.',
  before:[{id:'technique',title:'The inside-of-the-foot pass',items:['Standing foot beside the ball, pointing at the target.','Kicking foot turned out, toe up a little, ankle locked.','Strike through the middle of the ball so it stays on the ground.','Follow through toward the target, then move.']},
   {id:'order',title:'What to teach at each age',items:['U6: a few minutes of passing in pairs. Dribbling comes first.','U8: pairs and gates, then 2v1 so passing has a purpose.','U10: triangles, give-and-go and the 3v1 rondo.','U12: 4v2 rondos and possession games with a change of roles.']}],
  picksTitle:'Passing drills, in teaching order',
  picks:[['wall-passing','Solo: a firm pass and a clean touch, both feet.'],['partner-passing-through-gates','Pairs: a point for each pass through a gate.'],['triangle-passing','Fours: pass, follow and receive on the back foot.'],['give-and-go','Pass, run past the defender, get it back.'],
   ['rondo-3v1','Keep-away with help on both sides of the ball.'],['rondo-4v2','Find the pass between two defenders.'],['three-team-keep-away','Possession, with a quick change when the ball is lost.'],['end-zone-game','Forward passes for a runner who arrives on time.'],['four-goal-game','Switch the ball to the open side.']],
  after:[{id:'mistakes',title:'Common passing mistakes',items:['Toe pokes, which are fast but not accurate.','Passing and standing still. The pass is half the job.','Passes that bounce. Keep the knee over the ball.','Drills with no defender for too long. Passing is a decision as well as a technique.']}],
  faq:[{q:'How do you teach kids to pass a soccer ball?',a:'Show the inside of the foot, then play a game in pairs with a score, such as passing through gates. Add a defender as soon as the technique is steady.'},
   {q:'What is the best passing drill for U10?',a:'The 3v1 rondo. It has a real defender, everyone touches the ball often, and it teaches support on both sides of the ball.'},
   {q:'Why do my players pass to the other team?',a:'Usually because they look up too late or no teammate has moved into view. Scanning games and rondos work on both problems.'}],
  lessons:['prn_7_support','prn_9_support','s_onetwo','learn9_switch'],links:[G.giveGo,G.switching,G.cm],featured:'rondo-3v1'},

 {slug:'dribbling',kind:'skill',name:'Dribbling drills',title:'Soccer Dribbling Drills for Kids: Games and Ball Mastery',h1:'Soccer dribbling drills for kids',
  desc:'Soccer dribbling drills for kids: ball mastery moves, games with a ball each such as Sharks and Minnows and gates, turns, and 1v1 to beat a defender.',
  blurb:'Ball mastery, ball-each games, turns and 1v1 for every age',
  lead:'Soccer dribbling drills work best when every child has a ball and a reason to look up. This page groups ours into ball mastery, games with a ball each, turns, and 1v1 against a real defender.',
  more:'Dribbling is the first skill to teach and the one young players enjoy most. A player who is comfortable with the ball has time to see a pass, and one who is not has no time for anything.',
  before:[{id:'technique',title:'What good dribbling looks like',items:['Small touches, so the ball stays within one step.','Both feet, and both the inside and the outside of the foot.','Eyes up between touches.','A change of speed or direction to get away from a defender.']},
   {id:'order',title:'What to teach at each age',items:['U6: games with a story. Stop, go and turn.','U8: turns, gates with defenders, and 1v1 on small fields.','U10: moves to beat a player, and dribbling to set up a pass.','U12: when to dribble and when to pass, at game speed.']}],
  picksTitle:'Dribbling drills and games',
  picks:[['toe-taps-and-foundations','Ball mastery on the spot.'],['cone-weave-dribbling','Close control in short lanes, both feet.'],['red-light-green-light','Stop the ball on the call.'],['sharks-and-minnows','Dribble past the sharks.'],['pirates-and-treasure','Dribble a ball home at speed.'],
   ['gates-dribbling','Head up to find an open gate.'],['busy-square-dribbling','Dribble in a crowd without bumping.'],['turn-and-go','Drag-back, inside hook, outside hook.'],['knockout','Shield your ball and win others.'],['one-v-one-to-end-zones','Beat a real defender.']],
  after:[{id:'mistakes',title:'Common dribbling mistakes',items:['Kicking the ball ahead and chasing it.','Using only the strong foot.','Looking down the whole time.','Dribbling into a crowd when a teammate is free. Dribble into space, and pass out of trouble.']}],
  faq:[{q:'What are the best dribbling drills for beginners?',a:'Games where each child has a ball: Red Light Green Light, Sharks and Minnows and gates dribbling. They build close control without anyone waiting in a line.'},
   {q:'How do I teach a child to dribble with both feet?',a:'Make the weaker foot worth more. Run a round where only that foot counts, or give double points for a gate or a turn done with it.'},
   {q:'Are cone drills bad?',a:'No, in short doses. Cones build touch, but a cone never tackles. Follow any cone drill with a game against a defender.'}],
  lessons:['learn7_carry','next7_dribbleroom','expf_2v1'],links:[G.wg,G.nutmeg,G.twoVone],featured:'gates-dribbling'},

 {slug:'shooting',kind:'skill',name:'Shooting drills',title:'Soccer Shooting Drills for Kids: Finishing Without Lines',h1:'Soccer shooting drills for kids',
  desc:'Soccer shooting drills for kids that avoid long lines: dribble and shoot, lay-off and shoot, World Cup, 2v1 to goal, rebounds and low-cross finishing.',
  blurb:'Shooting and finishing drills without long lines, for U6 to U12',
  lead:'The best soccer shooting drills give every player many shots, from a ball that is moving, with something to decide. This page lists ours, from a first laces drill to finishing from a cross.',
  more:'Young players love to shoot, which makes it tempting to line them up at one goal. Two small goals and groups of three or four give many more shots in the same time.',
  before:[{id:'technique',title:'How to strike the ball',items:['Look at the goal, then look at the ball.','Standing foot beside the ball, pointing where you aim.','Toe down and ankle locked: strike with the laces through the middle of the ball.','Head and chest over the ball, so the shot stays low.','Close to goal, a side-foot pass into the corner is the best shot.']},
   {id:'order',title:'What to teach at each age',items:['U6 and U8: small goals and no goalkeeper. Learn the laces.','U10: shots on the move, with goalkeepers taking turns.','U12: one-touch finishes from lay-offs, cutbacks and low crosses.','Every age: follow the shot.']}],
  picksTitle:'Shooting and finishing drills',
  picks:[['clean-your-room','The first kicking game: laces, low and lots of them.'],['dribble-and-shoot','Dribble through a gate and shoot, in short lanes.'],['lay-off-and-shoot','Pass in, run on and strike it first time.'],['follow-the-shot','Shoot, keep running and finish the rebound.'],
   ['world-cup-shooting-game','Pairs against pairs at one goal, nobody sitting out.'],['two-v-one-to-goal','Beat one defender with a teammate and finish.'],['three-v-two-to-goal','Find the free attacker quickly.'],['crossing-and-finishing','Near post, far post and a low ball across.']],
  after:[{id:'safety',title:'Keeping shooting practice safe',items:['No goalkeepers at U6 and U8. Use small goals.','From U10, shoot from a sensible distance, and never from point-blank range at a young goalkeeper.','Nobody stands behind the goal collecting balls while others shoot.','Crosses stay low. There is no heading at age 10 and under.']}],
  faq:[{q:'How do I teach my child to shoot a soccer ball with power?',a:'Technique first: laces, locked ankle, standing foot beside the ball and body over it. Power comes from a clean strike and from growing, not from swinging harder.'},
   {q:'What is a good shooting drill for U8?',a:'Dribble and shoot in two or three short lanes at small goals. Every child shoots every twenty seconds and fetches their own ball.'},
   {q:'How do I avoid long lines in shooting drills?',a:'Use more goals. Two cones make a goal. Three players per goal means everyone is shooting, serving or fetching.'}],
  lessons:['next7_shotreaction','learnf_farpost','learn11_cutback'],links:[G.st,G.cutback,G.cross],featured:'two-v-one-to-goal'},

 {slug:'first-touch',kind:'skill',name:'First touch drills',title:'First Touch Soccer Drills for Kids: Receive and Go',h1:'First touch soccer drills for kids',
  desc:'First touch soccer drills for kids: receive across the body, touch through a gate, turn under pressure, and control a high ball with no heading.',
  blurb:'Receiving drills: back foot, touch into space, turning and high balls',
  lead:'First touch soccer drills teach a player to receive the ball so that the next action is easy. This page lists ours, from a wall at home to receiving with a defender behind.',
  more:'A good first touch is a decision made before the ball arrives: where is the space, and where is the pressure? That is why these drills include looking around as well as technique.',
  before:[{id:'technique',title:'What a good first touch looks like',items:['The player has looked around before the ball arrives.','The body is half turned, not square to the passer.','The touch moves the ball about a step, into space and away from the defender.','The second touch is a pass, a dribble or a shot, with no extra touches to tidy up.']},
   {id:'order',title:'What to teach at each age',items:['U6: stop the ball with the sole or the inside of the foot.','U8: control and pass in two touches. Start receiving on the back foot.','U10: a first touch to either side, and a look before the ball comes.','U12: receiving under pressure, on the half turn.']}],
  picksTitle:'First touch drills',
  picks:[['wall-passing','Hundreds of first touches, alone, with both feet.'],['receive-across-the-body','Open up and take it on the back foot.'],['first-touch-gates','Touch it through a gate, left or right.'],['receive-and-turn','“Turn” or “man on”: choose the right touch.'],
   ['shoulder-check-colors','Look behind before you receive.'],['thigh-and-chest-control','Bring a high ball down without heading.'],['triangle-passing','Receive and pass on, around a triangle.'],['rondo-3v1','First touch away from a live defender.']],
  after:[{id:'mistakes',title:'Common first touch mistakes',items:['Stopping the ball dead under the body, which invites a tackle.','Receiving flat-footed. Stay on your toes.','A touch toward the defender, because the player did not look.','Using only one foot, so half the field is closed.']}],
  faq:[{q:'How do you improve first touch in soccer?',a:'With many repetitions and a purpose for each one. Wall passing gives the repetitions, and gates and a defender give the touch a direction.'},
   {q:'What is the best first touch drill for kids?',a:'For one player, wall passing. For a team, first touch gates in pairs: receive and take the first touch through a small gate to one side.'},
   {q:'Why does my child’s first touch bounce away?',a:'Usually the foot is stiff. Ask them to relax the ankle a little and pull the foot back as the ball arrives, like catching an egg.'}],
  lessons:['learn7_receive','learn9_receive','bld_f_passtofeet','bld_11_throughlines'],links:[G.firstTouch,G.cm,G.heading],featured:'receive-across-the-body'},

 {slug:'goalkeeper',kind:'skill',name:'Goalkeeper drills',title:'Soccer Goalkeeper Drills for Kids: Safe Basics for U10+',h1:'Soccer goalkeeper drills for kids',
  desc:'Soccer goalkeeper drills for kids from U10: set position, footwork, the W and basket catches, angles and distribution, all with soft, close service.',
  blurb:'Set position, catching, angles and distribution for U10 and U12, with soft service',
  lead:'Soccer goalkeeper drills for kids should build confidence first: quick feet, safe hands and good position, with gentle service from close range. These four drills cover the basics for U10 and U12.',
  more:'In US youth soccer there are no goalkeepers in the 4v4 game for under-8s, so the position is new at U9 and U10. Every player should try it. A goalkeeper also needs good feet, so keepers join in every outfield drill too.',
  before:[{id:'basics',title:'The basics, in order',items:['Set position: balanced and still when the shot is taken.','Footwork: side steps to get the body behind the ball.','Hands: the W for high balls, the basket for low balls, the scoop for rolling balls.','Position: on the line from the ball to the middle of the goal.','Distribution: roll, throw or pass to a free teammate.']},
   {id:'safety',title:'Keeping young goalkeepers safe',items:['Service is rolled or thrown underarm at first, from five or six yards.','No hard shots from close range, and no shooting until the keeper is set.','Teach attackers to pull away once the goalkeeper has a hand on the ball.','Rotate. Nobody under 12 should be the only goalkeeper all season.','Use the right ball: size 4 at U10 and U12.']}],
  picksTitle:'Goalkeeper drills for U10 and U12',
  picks:[['goalkeeper-footwork-and-set','Shuffle, get set and gather a rolled ball.'],['goalkeeper-catching-w-and-basket','The W, the basket and the scoop, with underarm throws.'],['goalkeeper-angles','Stand on the line between the ball and the middle of the goal.'],['goalkeeper-distribution','Roll, throw or pass to the free teammate.'],
   ['build-out-game','Start the attack from the goalkeeper, as in 7v7.'],['follow-the-shot','For keepers too: hold the ball or push it wide.'],['wall-passing','Good feet for the pass back.'],['thigh-and-chest-control','Dealing with a dropping ball.']],
  after:[{id:'rules',title:'Rules a young goalkeeper should know',items:['The goalkeeper may use their hands only inside their own penalty area.','A deliberate kick from a teammate may not be picked up. Play it with your feet.','In 7v7 the goalkeeper may not punt the ball. Roll it, throw it or pass it.','On a goal kick in 7v7, the other team waits behind the build-out line.']}],
  faq:[{q:'At what age do kids start playing goalkeeper?',a:'At U9 or U10 in US youth soccer, when the game becomes 7v7. The 4v4 game for under-8s has no goalkeepers.'},
   {q:'What is the first thing to teach a young goalkeeper?',a:'The set position and how to catch: the W for balls above the waist and the basket for low ones. Confidence in their hands comes before diving.'},
   {q:'Should one child always play in goal?',a:'No. Rotating gives every player a feel for the position, and keeps the regular goalkeeper’s outfield skills growing.'},
   {q:'Can a goalkeeper pick up a back pass?',a:'Not if a teammate kicked it to them on purpose. They must use their feet. Our back-pass rule page explains the details.'}],
  lessons:['bld_7_usekeeper','expf_keeperposition','learn7_buildout','expf_keeperrelease'],links:[G.gk,G.backPass,G.buildOut,G.goalKick],featured:'goalkeeper-catching-w-and-basket'},
];
export const DRILL_GUIDES:readonly DrillGuide[]=RAW.map(r=>{
 if(DRILLS.some(d=>d.slug===r.slug))throw new Error(`guide ${r.slug} has the slug of a drill`);
 if(r.picks.length<8||r.picks.length>10)throw new Error(`guide ${r.slug}: 8 to 10 drills`);
 const picks=r.picks.map(([slug,line])=>{const d=drill(slug);if(r.age&&!d.ages.includes(r.age))throw new Error(`guide ${r.slug}: ${slug} is not tagged ${r.age}`);return {drill:d,line};});
 return {...r,path:`${DRILLS_HUB_PATH}/${r.slug}`,picks,lessons:pickLessons(r.lessons,`guide ${r.slug}`),picture:drill(r.featured).picture};
});
export const drillGuideBySlug=(slug:string)=>DRILL_GUIDES.find(g=>g.slug===slug);
export const AGE_GUIDES=DRILL_GUIDES.filter(g=>g.kind==='age');
export const SKILL_GUIDES=DRILL_GUIDES.filter(g=>g.kind==='skill');
export const ageGuide=(a:Age)=>AGE_GUIDES.find(g=>g.age===a)!;
/** Used by drill pages: one line per age the drill suits, linking to that age's guide. */
export const guidesForDrill=(d:Drill)=>AGE_GUIDES.filter(g=>d.ages.includes(g.age!));
export {drillLine};
