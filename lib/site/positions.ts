import {lessonById,type SiteLesson} from './lessons';
import type {Faq} from './safety';
/**
 * The POSITIONS cluster (SEO, Nov 10 2026): /learn/soccer-positions and one page per position under it. All page words live
 * here as typed data; the routes under app/(site)/learn/soccer-positions only render it. These pages lead with "soccer" (US
 * search wording); the rest of the site keeps "football (soccer)".
 *
 * Where the facts come from:
 *  - The repo first: lib/town/positionReference.json (the in-game position guide: what each position does with and without
 *    the ball, its key skills) and the lessons in public/lessons/*.json (learn7_roles, learn9_shape, learn11_shape,
 *    exp11_insidefullback, exp11_wingbackcue, next9_singleholder, nx9_twostrikers, exp11_secondball, bld_7_usekeeper …).
 *    Every lesson id below is checked against the catalog when this module loads.
 *  - IFAB Laws of the Game: Law 3 (each team has a goalkeeper), Law 4 (the goalkeeper wears colours that are different from
 *    the other players and the match officials), Law 12 (the goalkeeper may handle the ball inside their own penalty area,
 *    but not from a deliberate kick or a throw-in by a teammate): https://www.theifab.com/laws/latest/
 *    Re-checked against theifab.com on Nov 10 2026 (Laws 3, 4 and 12; sources in lib/site/rules.ts). One wording fix: the
 *    back-pass rule is about a ball DELIBERATELY KICKED to the keeper by a teammate (or thrown from a throw-in), not any pass back.
 *  - U.S. Soccer small-sided standards (7v7 keepers do not punt; build-out line): see lib/site/formations.ts.
 *  - Shirt numbers 1-11: a coaching custom (1 keeper, 2 right back, 3 left back, 4 and 5 center backs, 6 defensive midfielder,
 *    7 right winger, 8 central midfielder, 9 striker, 10 attacking midfielder, 11 left winger). It differs by country (for
 *    example, the holding midfielder is 4 in some traditions) and no law fixes it; the pages say so. Not confirmed on a primary
 *    ussoccer.com page in this pass.
 *  - Player cards: lib/site/cards.ts roles (goalkeeper, fullback, centerback, midfielder, winger, striker). The binder has one
 *    "midfielder" group and files wing-backs with full-backs, and the pages say that instead of guessing a narrower role.
 * No statistics, no named players in the text, no claims about what professionals "always" do.
 */
export type Habit={name:string;how:string};
export type Position={slug:string;path:string;name:string;short:string;numbers:string;numberLine:string;title:string;h1:string;desc:string;job:string;suits:string;
 where:string;diagram:string;withBall:string[];withoutBall:string[];habits:Habit[];small:string;faq:Faq[];lessons:SiteLesson[];cardRole:string;cardSkip:number;cardNote:string};
export const POSITIONS_HUB_PATH='/learn/soccer-positions';
export const positionPath=(slug:string)=>`${POSITIONS_HUB_PATH}/${slug}`;
const pick=(ids:string[])=>ids.map(id=>{const l=lessonById(id);if(!l)throw new Error(`position lesson ${id} is not in the lesson catalog`);return l;});
type Raw=Omit<Position,'path'|'lessons'>&{lessonIds:string[]};
const make=({lessonIds,...p}:Raw):Position=>({...p,path:positionPath(p.slug),lessons:pick(lessonIds)});

export const POSITIONS:readonly Position[]=[
 {slug:'goalkeeper',name:'Goalkeeper',short:'GK',numbers:'1',numberLine:'The goalkeeper is number 1 in the old 1 to 11 system.',
  title:'Soccer Goalkeeper: What the Position Does, for Kids',h1:'Goalkeeper in soccer',
  desc:'What a soccer goalkeeper does, explained for kids: where the keeper stands, the job with and without the ball, three habits to practise and the number 1.',
  job:'The goalkeeper is the one soccer player who may use their hands, and the job is to keep the ball out of the goal and to start the team’s attacks.',
  suits:'It suits brave players who talk a lot, stay calm after a mistake and like to see the whole field in front of them.',
  where:'In front of their own goal, inside the penalty area. The keeper steps forward when the ball is far away, to be a passing option behind the defenders, and moves back toward the goal line when a shot may come.',
  diagram:'11v11-4-3-3',
  withBall:['Starts the attack. Looks for a safe pass, roll or throw to a nearby teammate.','Is the spare player behind the defenders. When a defender is pressed, a pass back to the keeper lets the team start again.','Chooses a longer pass only when the space and the pressure make it the better option.'],
  withoutBall:['Stops shots with the hands, the feet or any part of the body.','Comes out to catch or punch crosses, and to reach a through ball before the attacker.','Organises the defenders. The keeper can see everything, so the keeper tells teammates who to mark.'],
  habits:[{name:'Set your feet before the shot',how:'Stand on the balls of your feet, hands ready, a moment before the player shoots. A keeper who is still moving cannot dive well.'},
   {name:'Catch, then look',how:'After every catch, lift your head and find a free teammate. A fast, safe pass starts an attack.'},
   {name:'Play with your feet',how:'Join passing games with your team. A ball that a teammate deliberately kicks back to the keeper must be played with the feet, not picked up.'}],
  small:'In 7v7 under the U.S. Soccer standards the keeper does not punt or drop-kick. The keeper rolls, throws or passes, and the other team waits behind the build-out line. In futsal the keeper is one of only five players, so the keeper often acts as an extra passer.',
  faq:[
   {q:'Can a goalkeeper use their hands anywhere?',a:'No. Only inside their own penalty area. Outside it, the goalkeeper follows the same rules as every other player.'},
   {q:'Can a goalkeeper pick up a back pass?',a:'Not if a teammate kicked it to them on purpose, and not straight from a teammate’s throw-in. The keeper has to play those with the feet. A header or a chest pass back may be picked up.'},
   {q:'Why does the goalkeeper wear a different color?',a:'So the referee and the players can tell who is allowed to handle the ball. The Laws of the Game say the keeper’s colors must be different from the other players and the officials.'},
   {q:'Should young children play goalkeeper all the time?',a:'Most coaches rotate the job at young ages. Every keeper needs good feet, and every outfield player learns from a turn in goal.'}],
  lessonIds:['bld_7_usekeeper','bld_9_usekeeper','learn11_restart','learn7_buildout'],cardRole:'goalkeeper',cardSkip:0,cardNote:'Goalkeepers in the Futbol Island card binder.'},
 {slug:'center-back',name:'Center back',short:'CB',numbers:'4 and 5',numberLine:'Center backs usually wear 4 and 5. In some countries they are 5 and 6.',
  title:'Center Back in Soccer: What the Position Does',h1:'Center back in soccer',
  desc:'What a center back does in soccer, explained for kids: where they stand, the job with and without the ball, three habits to practise and shirt numbers.',
  job:'A center back is a soccer defender who plays in the middle of the back line, and the job is to protect the space in front of the goal.',
  suits:'It suits calm players who read the game early, enjoy winning the ball and are happy to talk to teammates.',
  where:'In the middle of the defense, in front of the goalkeeper. A back four has two center backs side by side. A back three has three, with the middle one a little deeper as cover.',
  diagram:'11v11-4-3-3',
  withBall:['Moves apart from the other center back so the team can pass out from the back.','Passes forward to a midfielder who is free, or carries the ball into midfield when space opens.','Uses the goalkeeper as a safe pass when pressed.'],
  withoutBall:['Stays between the striker and the goal.','Works as a pair: one goes to the ball, the other covers behind.','Slides across to cover when a fullback goes forward or is beaten.'],
  habits:[{name:'Stay goal-side',how:'Stand between your attacker and your goal, close enough to step in when the pass comes.'},
   {name:'See the ball and the runner',how:'Open your body so you can watch both. Do not just watch the ball.'},
   {name:'Look before you receive',how:'Check over your shoulder before the pass arrives, so you know your next pass.'}],
  small:'In 7v7 a 2-3-1 has two defenders who do the center back and fullback jobs together. In 9v9 a 3-2-3 has one center back between two outside backs: when an outside back goes forward, the center back slides across behind the ball.',
  faq:[
   {q:'What is the difference between a center back and a fullback?',a:'Where they play. Center backs defend the middle, in front of the goal. Fullbacks defend the sides, near the sidelines, and go forward more often.'},
   {q:'Do center backs need to be tall?',a:'Height helps with high balls, but reading the game matters more. A center back who stands in the right place early wins the ball without needing to jump or race.'},
   {q:'Is sweeper the same as center back?',a:'A sweeper is an older kind of center back who plays behind the other defenders to clear up loose balls. Most teams today ask the center backs to cover for each other instead.'}],
  lessonIds:['learn9_shape','learn9_cover','def_11_pressurecover','next9_spareback','def_7_goalside'],cardRole:'centerback',cardSkip:0,cardNote:'Center backs in the Futbol Island card binder.'},
 {slug:'fullback',name:'Fullback',short:'LB / RB',numbers:'2 and 3',numberLine:'The right back is usually 2 and the left back is 3.',
  title:'Fullback in Soccer: Left Back and Right Back Explained',h1:'Fullback in soccer',
  desc:'What a fullback does in soccer, for kids: the left back and right back defend the sides and join attacks. Where they stand, habits to practise, numbers.',
  job:'A fullback is a soccer defender who plays on the left or right side of the back line: the left back and the right back.',
  suits:'It suits players with lots of energy who like to defend one against one and also enjoy running forward.',
  where:'On the outside of a back four, near the sideline, with a center back on the inside and a winger in front.',
  diagram:'11v11-4-3-3',
  withBall:['Gives width at the back, so the keeper and center backs have a pass to the side.','Supports the winger. Runs outside to cross, or moves inside to be an extra midfielder.','Fills the lane nobody holds: if the winger is wide, the fullback moves inside. If the winger is inside, the fullback goes wide.'],
  withoutBall:['Defends the side one against one, usually against a winger.','Stops crosses coming into the penalty area.','Tucks in next to the center backs when the ball is on the far side.'],
  habits:[{name:'Show the attacker outside',how:'Stand a little to the inside, so the winger has to go along the sideline, away from goal.'},
   {name:'Go, then get back',how:'After a run forward, turn and recover at once if the ball is lost.'},
   {name:'Check where your winger is',how:'Look before you run. Go where your winger is not.'}],
  small:'In 7v7 the two defenders of a 2-3-1 are often called left back and right back. In 9v9 the outside backs of a back three do the fullback job: they defend the side and carry the ball forward when there is room.',
  faq:[
   {q:'What is an overlap?',a:'A run by the fullback around the outside of the winger who has the ball. It gives the winger two choices: pass to the runner or use the space the run opens.'},
   {q:'What is an inverted fullback?',a:'A fullback who moves inside, into midfield, when the team has the ball. It works when the winger stays wide, so the two are not in the same lane.'},
   {q:'Is fullback a defending or an attacking position?',a:'Both. The first job is to defend the side. But a fullback also gives the team width and supports attacks, so it is one of the busiest positions.'}],
  lessonIds:['exp11_insidefullback','next7_outsideback','learn11_shape','nx9_fourthrunner'],cardRole:'fullback',cardSkip:0,cardNote:'Full-backs in the Futbol Island card binder.'},
 {slug:'wingback',name:'Wingback',short:'LWB / RWB',numbers:'2 and 3',numberLine:'Wingbacks often keep the fullback numbers, 2 and 3.',
  title:'Wingback in Soccer: What It Is and What It Does',h1:'Wingback in soccer',
  desc:'What a wingback is in soccer, for kids: a wide player outside three center backs who attacks like a winger and defends like a fullback. Diagram and tips.',
  job:'A wingback is a soccer player who covers one whole side of the field, attacking like a winger and defending like a fullback.',
  suits:'It suits the fittest players on the team, who love to run and are comfortable both crossing and tackling.',
  where:'Wide on the left or right, outside three center backs. With the ball the wingback is high, level with the midfield or the forwards. Without it the wingback drops beside the center backs to make a back five.',
  diagram:'11v11-3-5-2',
  withBall:['Gives the team its width, because there is no winger in front.','Runs high along the sideline to cross or to pass the ball back for a shot.','Offers a pass out wide when the middle is crowded.'],
  withoutBall:['Runs back to make a line of five with the center backs.','Presses the other team’s fullback, but only when a center back covers the winger behind.','Marks the far post when the cross comes from the other side.'],
  habits:[{name:'Read the cue to press',how:'Go to the ball when the touch is slow and you have cover behind. When that cue is gone, recover.'},
   {name:'Run, rest, run',how:'Use the moments when the ball is on the far side to get your breath back in a good position.'},
   {name:'Cross early or pull it back',how:'Practise both: a cross before the defender is set, and a pass back along the ground from the goal line.'}],
  small:'Small-sided games rarely have true wingbacks. The closest job is the wide midfielder in a 7v7 2-3-1 or a 9v9 3-3-2, who also has to attack and defend the whole side.',
  faq:[
   {q:'What is the difference between a wingback and a fullback?',a:'A fullback plays in a back four with a winger in front. A wingback plays outside three center backs with nobody in front, so the wingback starts higher and has the whole side alone.'},
   {q:'Which formations use wingbacks?',a:'Formations with three center backs, such as the 3-5-2. When the wingbacks drop back to defend, the same team looks like a 5-3-2.'},
   {q:'Is wingback a hard position?',a:'It is the hardest running job on the team. A wingback has to get forward to attack and back to defend, again and again.'}],
  lessonIds:['exp11_wingbackcue','exp11_checking8','def_11_shift'],cardRole:'fullback',cardSkip:6,cardNote:'The card binder files wing-backs with the full-backs. Here are more full-backs.'},
 {slug:'defensive-midfielder',name:'Defensive midfielder',short:'DM',numbers:'6',numberLine:'The defensive midfielder is often called the 6. In some countries the same job wears 4.',
  title:'Defensive Midfielder in Soccer: What Does a 6 Do?',h1:'Defensive midfielder in soccer',
  desc:'What a defensive midfielder (the number 6) does in soccer, for kids: where the holder stands, jobs with and without the ball, and three habits to practise.',
  job:'A defensive midfielder is a soccer player who stays in front of the defenders, to protect them and to link them with the rest of the team.',
  suits:'It suits patient players who like to pass, look around a lot and are happy to stay behind the ball while others attack.',
  where:'In the middle of the field, just in front of the center backs. Coaches also call this player the holding midfielder or the holder.',
  diagram:'11v11-4-2-3-1',
  withBall:['Shows for a pass from the defenders and turns the play forward.','Moves the ball from one side to the other when a side is crowded.','Stays behind the ball as the safe pass back when an attack gets stuck.'],
  withoutBall:['Guards the space in front of the center backs, so nobody can receive there and turn.','Slows down a counterattack until teammates recover.','Picks up a forward who drops deep, so the center back can stay in line.'],
  habits:[{name:'Scan before the ball comes',how:'Look over both shoulders before you receive. Then you know whether you can turn.'},
   {name:'Stay when others go',how:'When a fullback or midfielder runs forward, hold your place in the middle.'},
   {name:'Play it simple',how:'One or two touches, then pass. The holder keeps the team’s passing going.'}],
  small:'In 7v7 no player has this job full time: the middle midfielder of a 2-3-1 protects the middle when the ball is lost. In 9v9 the 3-1-3-1 has one holding midfielder, and the central attacking midfielder runs back to help.',
  faq:[
   {q:'What does a number 6 do in soccer?',a:'The 6 is the defensive midfielder. The 6 protects the space in front of the defense and takes the ball from the defenders to start attacks.'},
   {q:'What is a holding midfielder?',a:'Another name for the defensive midfielder. The player holds a place in front of the defenders instead of running forward with the attack.'},
   {q:'What is a double pivot?',a:'Two holding midfielders playing side by side, as in a 4-2-3-1. One can step forward while the other stays.'}],
  lessonIds:['next9_singleholder','exp11_droppingnine','trn_11_restdefense','gap7_lostball'],cardRole:'midfielder',cardSkip:0,cardNote:'The card binder keeps all midfielders in one group. These are midfielders of every kind.'},
 {slug:'central-midfielder',name:'Central midfielder',short:'CM',numbers:'8',numberLine:'The central midfielder is often called the 8.',
  title:'What Does a Center Mid Do? Soccer Position for Kids',h1:'Central midfielder in soccer',
  desc:'What a center mid does in soccer, explained for kids: the central midfielder links defense and attack. Where they stand, habits to practise, the number 8.',
  job:'A central midfielder, or center mid, is the soccer player in the middle of the field who links the defense to the attack.',
  suits:'It suits players who want to be near the ball all game, can run a lot and enjoy both passing and tackling.',
  where:'In the middle of the field, between the defenders and the forwards. Because this player runs from one penalty area to the other, coaches also say box-to-box midfielder.',
  diagram:'11v11-4-3-3',
  withBall:['Offers a passing angle to whoever has the ball.','Receives, turns if there is room, and passes forward. If there is no room, gives it back and moves again.','Arrives late in the penalty area to finish a move.'],
  withoutBall:['Presses the player with the ball in the middle of the field.','Tracks a midfielder who runs forward.','Helps protect the middle, close to the other midfielders.'],
  habits:[{name:'Move after you pass',how:'Pass, then find a new space at once. Standing still makes you easy to mark.'},
   {name:'Receive on the half turn',how:'Stand side-on, so you can see the passer and the field ahead in one look.'},
   {name:'Give another angle',how:'If the straight pass to you is blocked, step to the side until the passer can see you.'}],
  small:'In 7v7 the middle midfielder of a 2-3-1 is the busiest player on the field, linking the backs to the forward. In 9v9 the two midfielders of a 3-2-3 connect the back three to the front three.',
  faq:[
   {q:'What does a center mid do in soccer?',a:'A center mid connects the team. With the ball, the center mid links the defenders to the forwards. Without the ball, the center mid presses and protects the middle of the field.'},
   {q:'What is a box-to-box midfielder?',a:'A central midfielder who works from one penalty box to the other: defending near their own goal, then running to join the attack.'},
   {q:'What is the difference between a 6, an 8 and a 10?',a:'They are three midfield jobs. The 6 stays deeper to protect the defense. The 10 plays higher, close to the striker. The 8 works between them and helps both.'}],
  lessonIds:['learn7_roles','nx9_twoblocks','exp11_checking8','learn7_receive','e_thirdman'],cardRole:'midfielder',cardSkip:6,cardNote:'The card binder keeps all midfielders in one group. Here are more of them.'},
 {slug:'attacking-midfielder',name:'Attacking midfielder',short:'AM',numbers:'10',numberLine:'The attacking midfielder is often called the 10.',
  title:'Attacking Midfielder (the 10): Soccer Position Guide',h1:'Attacking midfielder in soccer',
  desc:'What an attacking midfielder (the number 10) does in soccer, for kids: where the playmaker stands, jobs with and without the ball, and habits to practise.',
  job:'An attacking midfielder is a soccer player who plays between the midfield and the striker, and the job is to create chances to score.',
  suits:'It suits creative players with a good first touch who can find space in a crowd and enjoy the final pass.',
  where:'In the middle, just behind the striker, in the gap between the other team’s midfielders and defenders. People also say playmaker, or the number 10.',
  diagram:'11v11-4-2-3-1',
  withBall:['Receives between the lines and turns to face the goal.','Plays the pass that sends a striker or a winger through.','Shoots from the edge of the penalty area or runs past the striker.'],
  withoutBall:['Blocks the pass into the other team’s holding midfielder.','Runs back to help the holding midfielder right after the ball is lost.','Presses with the striker to make a front two.'],
  habits:[{name:'Find the pocket',how:'Stand where no defender is close: behind their midfielders and in front of their defenders.'},
   {name:'Know before you get it',how:'Look around before the pass arrives. Then decide: turn, or play it back with one touch.'},
   {name:'Pass and follow',how:'After the final pass, keep running toward goal for a rebound or a pass back.'}],
  small:'In 7v7 the middle midfielder does this job when the team attacks. In 9v9 the 3-1-3-1 has a central attacking midfielder behind the striker, and the 2-3-2-1 has two.',
  faq:[
   {q:'What does a number 10 do in soccer?',a:'The 10 is the attacking midfielder: the link between the midfield and the striker. The 10 receives in tight spaces and tries to make the pass that leads to a shot.'},
   {q:'What is a playmaker?',a:'A player the team looks for when it wants to create a chance. The word is used most for the attacking midfielder, but a deeper midfielder can be a playmaker too.'},
   {q:'Does an attacking midfielder have to defend?',a:'Yes. When the ball is lost, the attacking midfielder is often the nearest player to help the holding midfielder. In our 9v9 lesson, that recovery run is the key idea.'}],
  lessonIds:['bld_11_throughlines','learn9_receive','next9_singleholder','e_thirdman'],cardRole:'midfielder',cardSkip:12,cardNote:'The card binder keeps all midfielders in one group. Here are more of them.'},
 {slug:'winger',name:'Winger',short:'LW / RW',numbers:'7 and 11',numberLine:'The right winger is usually 7 and the left winger is 11.',
  title:'Winger in Soccer: What the Position Does, for Kids',h1:'Winger in soccer',
  desc:'What a winger does in soccer, explained for kids: wide attackers who stretch the field, dribble and cross. Where they stand, habits, numbers 7 and 11.',
  job:'A winger is a soccer attacker who plays wide on the left or right, to stretch the other team and to create chances from the side.',
  suits:'It suits quick players who love to dribble at a defender and are brave enough to try again after losing the ball.',
  where:'High and wide, near the sideline, on the left or the right of the forward line. In a 4-4-2 the wide midfielders do the same job from a little deeper.',
  diagram:'11v11-4-3-3',
  withBall:['Stays wide to stretch the defense, which opens space in the middle for teammates.','Takes on the fullback one against one, then crosses or cuts inside to shoot.','Passes the ball back from the goal line to a teammate arriving in front of goal.'],
  withoutBall:['Tracks the other team’s fullback when that player runs forward.','Drops back beside the midfielders to help block the middle.','Presses from the front to trap the ball near the sideline.'],
  habits:[{name:'Start wide',how:'Stand near the sideline before the ball comes. It is easier to move inside late than to get wide late.'},
   {name:'Attack the defender’s front foot',how:'Dribble straight at the defender, then change direction quickly.'},
   {name:'Look up before you cross',how:'One look tells you where your teammates are. Then choose: cross, pass back or shoot.'}],
  small:'In 7v7 the wide midfielders of a 2-3-1 are the wingers: they give width on each side and support the striker. In 9v9 the 3-2-3 has two wide forwards, and one of them comes inside to help when the midfield is outnumbered.',
  faq:[
   {q:'What does a winger do in soccer?',a:'A winger gives the team width. Wingers stay near the sideline, take on the fullback, and cross, pass back or cut inside to shoot. They also run back to help defend.'},
   {q:'What is an inverted winger?',a:'A winger who plays on the side opposite to their stronger foot, such as a right-footed player on the left. That makes it natural to cut inside and shoot.'},
   {q:'Do wingers have to defend?',a:'Yes. A winger follows the other team’s fullback and drops back beside the midfielders, so the team defends with more players.'}],
  lessonIds:['prn_7_spread','nx9_midfieldhelper','learn11_cutback','learn9_two_one','e_switch'],cardRole:'winger',cardSkip:0,cardNote:'Wingers in the Futbol Island card binder.'},
 {slug:'striker',name:'Striker',short:'ST',numbers:'9',numberLine:'The striker is usually number 9.',
  title:'Striker in Soccer: What the Position Does, for Kids',h1:'Striker in soccer',
  desc:'What a striker does in soccer, explained for kids: the forward closest to goal. Where the striker stands, jobs with and without the ball, three habits.',
  job:'A striker is the soccer forward who plays closest to the other team’s goal, and the main job is to score and to help teammates score.',
  suits:'It suits players who keep trying after a miss, enjoy shooting and are clever about when to run.',
  where:'At the front of the team, in the middle, near the other team’s center backs. Coaches also say center forward, or the number 9.',
  diagram:'11v11-4-4-2',
  withBall:['Finishes chances with a shot.','Holds the ball with a defender close, until teammates arrive to help.','Lays the ball off to a midfielder and spins toward goal.'],
  withoutBall:['Runs in behind the defenders when a teammate is ready to pass.','Is the first defender: presses the center backs and blocks the pass into midfield.','Stays close enough to the team to be reached with a pass.'],
  habits:[{name:'Run when the pass is on',how:'Wait level with the second-last defender. Go when your teammate lifts their head to pass, not before.'},
   {name:'Shoot early',how:'Take the shot when you have it. Aim low and across the keeper.'},
   {name:'Follow every shot',how:'Keep moving toward goal after a shot. Rebounds are chances too.'}],
  small:'In 7v7 a 2-3-1 has one forward, who must stay close enough to help the midfield. In 9v9 a 3-3-2 has two strikers who share the job: one shows for the ball, the other keeps depth. In futsal the forward is called the pivot.',
  faq:[
   {q:'What is the difference between a striker and a forward?',a:'Forward is the wider word: any player in the front line, wingers included. A striker is the forward in the middle, closest to goal.'},
   {q:'What does a number 9 do?',a:'The 9 is the striker or center forward. The 9 gives the team height, finishes chances, holds the ball up and presses the other team’s center backs.'},
   {q:'How does a striker stay onside?',a:'By waiting level with the second-last defender until the pass is played, then running. A striker who goes too early is offside.'},
   {q:'What is hold-up play?',a:'Keeping the ball with your back to goal while a defender pushes behind you. It gives teammates time to run forward and join the attack.'}],
  lessonIds:['next7_reachableforward','nx9_twostrikers','exp11_secondball','gap11_runoncue'],cardRole:'striker',cardSkip:0,cardNote:'Strikers in the Futbol Island card binder.'},
].map(make);
export const positionBySlug=(slug:string)=>POSITIONS.find(p=>p.slug===slug);

/** The 1-11 numbers as one table (hub): a custom, not a law. */
export const NUMBERS:readonly {n:number;name:string;slug:string;line:string}[]=[
 {n:1,name:'Goalkeeper',slug:'goalkeeper',line:'Guards the goal. The only player who may use hands.'},
 {n:2,name:'Right back',slug:'fullback',line:'Defends the right side and joins attacks.'},
 {n:3,name:'Left back',slug:'fullback',line:'Defends the left side and joins attacks.'},
 {n:4,name:'Center back',slug:'center-back',line:'Defends the middle, in front of the goal.'},
 {n:5,name:'Center back',slug:'center-back',line:'The other half of the center back pair.'},
 {n:6,name:'Defensive midfielder',slug:'defensive-midfielder',line:'Protects the defenders and starts attacks.'},
 {n:7,name:'Right winger',slug:'winger',line:'Attacks wide on the right.'},
 {n:8,name:'Central midfielder',slug:'central-midfielder',line:'Links defense and attack in the middle.'},
 {n:9,name:'Striker',slug:'striker',line:'Plays closest to goal and finishes chances.'},
 {n:10,name:'Attacking midfielder',slug:'attacking-midfielder',line:'Creates chances behind the striker.'},
 {n:11,name:'Left winger',slug:'winger',line:'Attacks wide on the left.'},
];
export const POSITIONS_HUB={path:POSITIONS_HUB_PATH,crumb:'Soccer positions',blurb:`${POSITIONS.length} positions and the numbers 1 to 11 explained, each with a diagram`,
 title:'Soccer Positions Explained for Kids: Numbers 1 to 11',
 description:'Every soccer position explained for kids, parents and coaches: goalkeeper, defenders, midfielders and forwards, the numbers 1 to 11, and 7v7 and 9v9 roles.',
 h1:'Soccer positions explained for kids',
 lessons:pick(['learn7_roles','learn9_shape','learn11_shape','learnf_roles31']),
 lead:'Soccer positions are the jobs players take on the field: one goalkeeper, then defenders, midfielders and forwards. This guide shows all eleven positions on one field, explains the numbers 1 to 11, and shows how the positions change in 7v7 and 9v9.',
 lines:[
  {name:'Goalkeeper',text:'One player guards the goal and may use their hands inside the penalty area.'},
  {name:'Defenders',text:'Center backs protect the middle. Fullbacks defend the sides and can support attacks. Wingbacks do the fullback job from higher up the field.'},
  {name:'Midfielders',text:'They connect the lines. A defensive midfielder starts deeper, a central midfielder works in between, and an attacking midfielder plays close to the striker.'},
  {name:'Forwards',text:'Wingers give width. The striker, or center forward, gives height and finishes chances. The forwards also help defend.'}],
 numbers:['Long ago, the eleven starters wore 1 to 11, and each number went with a place on the field. Coaches still use those numbers as short names: “play as a 6”, “a classic number 9”.',
  'It is a custom, not a law, and it is not the same in every country. Today players can wear any number their team allows.'],
 formats:[
  {format:'7v7',slug:'7v7-2-3-1',text:'Seven players: a goalkeeper and six outfield players. In a 2-3-1 that means two defenders, three midfielders and one forward. Each player covers more than one job: the two defenders are center backs and fullbacks at once.'},
  {format:'9v9',slug:'9v9-3-2-3',text:'Nine players: a goalkeeper and eight outfield players. In a 3-2-3 there is a center back between two outside backs, two midfielders and three forwards. The positions start to look like the full game.'},
  {format:'11v11',slug:'11v11-4-3-3',text:'Eleven players: a goalkeeper and ten outfield players. Now there are two center backs, two fullbacks, three midfielders with different jobs, two wingers and a center forward.'}],
 futsal:'Futsal has its own names. The four outfield players are the fixo (at the back), two alas (the wings) and the pivot (at the front).',
 faq:[
  {q:'What are the positions in soccer?',a:'Goalkeeper, defenders (center backs, fullbacks, wingbacks), midfielders (defensive, central, attacking) and forwards (wingers and strikers). A full team has eleven players on the field.'},
  {q:'What do the position numbers mean in soccer?',a:'They are short names from the days when starters wore 1 to 11. In a common version: 1 goalkeeper, 2 and 3 fullbacks, 4 and 5 center backs, 6 defensive midfielder, 8 central midfielder, 10 attacking midfielder, 7 and 11 wingers, 9 striker.'},
  {q:'What position should my child play?',a:'At young ages, all of them. Children learn the game by trying every job. A favorite position usually appears later, as they grow.'},
  {q:'Do players have to stay in their position?',a:'No. A position is a starting job. Players move to help the teammate with the ball and to protect their goal, then return to their shape.'}] as Faq[]};
