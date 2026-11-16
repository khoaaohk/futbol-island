import type {CoachNotes} from './coachNotes';
/**
 * Coach's notes for the formation, position, rule and glossary-term pages (schema and accuracy rules: lib/site/coachNotes.ts).
 * US youth formats as U.S. Soccer / US Youth Soccer set them (lib/site/sizes.ts, lib/site/rules.ts); Laws of the Game as IFAB
 * writes them; futsal per the FIFA Futsal Laws already cited in lib/site/rules.ts. No statistics, no named players.
 */

export const FORMATION_NOTES:Readonly<Record<string,CoachNotes>>={
 '7v7-2-3-1':{
  coach:'Give each line one call word: “split” on a goal kick sends the two defenders wide, and “squeeze” when the ball is lost pulls the three midfielders into the middle.',
  match:'When the other team wins the ball and plays it forward fast, you often see the two defenders alone while the midfield is still upfield; that gap in the middle is where a 2-3-1 gets caught.',
  ages:[['U8','U8 teams play 4v4 with no goalkeepers, so there are no lines yet. The 2-3-1 waits until 7v7 at U9.'],
   ['U10','A common first 7v7 shape at U9 and U10. Rotate children through all three lines so nobody is only ever a defender.'],
   ['U12','The wide, middle and forward jobs carry into 9v9 shapes such as the 3-2-3, where the wide midfielders become wide forwards.']],
  mistakes:['The two defenders stand side by side in the middle on a goal kick, so the keeper has no safe pass.','The wide midfielders drift inside to chase the ball and the team loses all its width.']},
 '7v7-3-2-1':{
  coach:'Teach the outside backs one trigger to go forward: when the center back or keeper has the ball and no opponent is close, the outside back on that side steps up into midfield.',
  match:'A 3-2-1 team often stops attacks but then kicks the ball away, and parents see the lone forward chasing long balls with no teammate near enough to help.',
  ages:[['U8','There is no 3-2-1 at U8: 4v4 has no goalkeepers and no fixed defenders, so everyone attacks and defends.'],
   ['U10','A safe shape for a new U9 or U10 team that is letting in goals. Once it settles, ask the outside backs to join attacks.'],
   ['U12','A player who enjoyed the center back job here is ready for the middle of a back three in 9v9.']],
  mistakes:['The three defenders stay deep and never step up, leaving the two midfielders alone against more players.','Both midfielders chase the ball together, so the space in front of the defenders is empty.']},
 '7v7-2-2-2':{
  coach:'Make the pairs the lesson: when one player in a pair goes to the ball, the partner drops a few steps behind to cover, and next time they swap jobs.',
  match:'In a 2-2-2 you often see all six field players on the same side as the ball, with the far side empty; one pass across would find a free teammate.',
  ages:[['U8','Pairs feel like 4v4, so U8 practices can play two pairs against two pairs before the move to 7v7.'],
   ['U10','A friendly first 7v7 shape at U9. By U10 many teams add wide players to stop the bunching.']],
  mistakes:['Both players in a pair run at the ball together, so one pass beats them both.','Nobody holds the width, so the team plays in a tight bunch down the middle.']},
 '7v7-3-1-2':{
  coach:'Ask the two forwards to make different runs, one coming short toward the ball and one going long, so the single midfielder always has a forward pass.',
  match:'From the sideline you see the one midfielder chasing the ball everywhere and tiring, so a coach who swaps that player during the game keeps the shape working.',
  ages:[['U10','Works for a U9 or U10 team with two keen goal scorers. Rotate the middle job often, because one player covers the whole width.'],
   ['U12','The front pair carries into 9v9 two-forward shapes such as the 3-3-2.']],
  mistakes:['The two forwards stand side by side waiting for the ball instead of making different runs.','The three defenders stay back while the lone midfielder is outnumbered, so the other team walks through the middle.']},
 '9v9-3-2-3':{
  coach:'Ask the wide forwards to start with a foot near the sideline when your team has the ball; their width opens space for the center forward and the two midfielders.',
  match:'On a goal kick you see the back three spread across the penalty area and the two midfielders come to show for a pass. If one midfielder hides, the keeper has to kick long.',
  ages:[['U10','U10 players can learn this shape’s ideas in a 7v7 2-3-1 first: wide players, a link in the middle and a forward.'],
   ['U12','A common first 9v9 shape at U11 and U12. Full offside from the halfway line means the front three must time their runs.'],
   ['U13 and up','The wide forwards and center forward fit straight into a 4-3-3 when the team moves to 11v11.']],
  mistakes:['Both midfielders push up together and leave nobody in front of the back three.','The wide forwards come inside to the ball and squeeze the center forward out of space.']},
 '9v9-3-3-2':{
  coach:'Give the two strikers a simple rule: if one comes short toward the ball, the other runs in behind, so defenders can never mark both in the same way.',
  match:'When the other team switches play, watch the wide midfielders sprint back to help the outside backs. A late run leaves two attackers against one defender on that side.',
  ages:[['U10','A U10 team that played the 7v7 3-1-2 already knows how a front pair works together.'],
   ['U12','A good 9v9 shape at U11 and U12 for two forwards who like playing together, as long as the wide midfielders can run up and back.'],
   ['U13 and up','The two-striker idea carries into 11v11 shapes such as the 4-4-2 and the 3-5-2.']],
  mistakes:['Both strikers come short for the ball at once, and nobody stretches the defense.','The wide midfielders stay forward after an attack, and the outside backs face two players alone.']},
 '9v9-2-3-2-1':{
  coach:'Name the middle midfielder the protector: when the team attacks, that player stays between the ball and the two center backs, whatever the others do.',
  match:'This shape shows up as lots of short passes through the middle. When one is lost there, parents see the other team run straight at the two center backs.',
  ages:[['U12','Better for a U12 team in its second 9v9 season that already passes well. It is not a first shape.'],
   ['U13 and up','Its many layers prepare players for 11v11 shapes with an attacking midfield line, such as the 4-2-3-1.']],
  mistakes:['The wide midfielders and both attacking midfielders push forward together, leaving two defenders alone.','Players crowd the middle and nobody gives width near the sidelines.']},
 '9v9-3-1-3-1':{
  coach:'Teach the holding midfielder to glance over the shoulder before every pass arrives, and to stay behind the ball when teammates go forward.',
  match:'When an attack breaks down, watch the space on either side of the holding midfielder. A quick pass around that one player is how this shape gets hurt.',
  ages:[['U12','At U11 and U12 start with a calm holder, then let other players try the job so the whole team understands it.'],
   ['U13 and up','The holder becomes the defensive midfielder, the 6, in 11v11 shapes such as the 4-3-3.']],
  mistakes:['The holding midfielder chases the ball forward and the middle is left empty.','The three attacking midfielders all stay high, so the holder has no short pass when pressed.']},
 '9v9-4-3-1':{
  coach:'Practice the back four stepping up together in one line after a clearance. With full offside in 9v9, a line that moves as one leaves forwards stranded offside.',
  match:'You may see the lone striker against two center backs with no help. When a fullback runs forward to join, the team suddenly has numbers in attack.',
  ages:[['U12','A useful last 9v9 shape at U12, because the back four matches the defense in many 11v11 shapes.'],
   ['U13 and up','Teams moving up to 11v11 already know how a back four shifts across the field together.']],
  mistakes:['The four defenders stand at different depths, so the deepest one keeps every attacker onside.','The fullbacks never go forward and the lone striker gets no support.']},
 '11v11-4-3-3':{
  coach:'Teach the fullback and winger on each side to talk: if the winger stays wide, the fullback holds; if the winger comes inside, the fullback can overlap.',
  match:'A common sight is a winger one-against-one near the sideline. When the fullback behind has gone forward too early, a quick pass sends the other team into that space.',
  ages:[['U12','U12 teams that play a 9v9 3-2-3 already know the front three, so this is a natural next step.'],
   ['U13 and up','At 11v11 the new thing to learn is two center backs and two fullbacks moving as one back four.']],
  mistakes:['Both fullbacks go forward at the same time and leave the center backs exposed.','The wingers stop running back, so each fullback faces two attackers alone.']},
 '11v11-4-4-2':{
  coach:'Ask the two lines of four to stay close together without the ball. A small gap between defenders and midfielders makes passes through the team hard to find.',
  match:'When the two strikers stand flat, parents see the other team’s deepest midfielder free between them. One striker dropping onto that player fixes it.',
  ages:[['U12','U12 teams that play a 9v9 3-3-2 already know the front pair and a line of three in midfield.'],
   ['U13 and up','A clear first 11v11 shape at U13, because every player has a line and a partner beside them.']],
  mistakes:['Both central midfielders go forward and leave space in front of the back four.','The wide midfielders stay high and the fullbacks face two attackers each.']},
 '11v11-4-2-3-1':{
  coach:'Give the attacking midfielder a job without the ball: when the team loses it, the 10 presses the nearest opponent in midfield so the striker is not defending alone.',
  match:'You see the 10 find pockets between the other team’s lines. When both holding midfielders go forward with them, counterattacks come straight through the middle.',
  ages:[['U12','The 9v9 2-3-2-1 and 3-1-3-1 use similar layers, so U12 players can get a feel for this shape there.'],
   ['U13 and up','Best for teams at U13 and up that already have a season or more of 11v11 behind them.']],
  mistakes:['The three attacking midfielders stay deep and the striker plays alone.','Both holding midfielders join the attack at once, leaving the back four unprotected.']},
 '11v11-3-5-2':{
  coach:'Set the wing-backs’ starting spot by the ball: high when your team has it, level with the back three when it does not. Swap them often, because the running is hard.',
  match:'Watch the space behind the wing-backs. When one is caught high, the other team plays long into that corner and a center back has to run wide to cover.',
  ages:[['U12','Most U12 teams are not ready for wing-backs. A 9v9 3-3-2 teaches the back three and two strikers first.'],
   ['U13 and up','Better for older teams with several players who can run the whole length of the side of the field.']],
  mistakes:['The wing-backs stay deep all game, so the team defends with five and attacks with too few.','The three center backs stay narrow, so a long pass into the corner beats them.']},
 'futsal-2-2':{
  coach:'Teach the swap: after a rear player passes to a front player, they run forward and the front player drops back, so the square keeps moving.',
  match:'On the court the 2-2 works when the keeper rolls the ball to a rear player who can turn; it struggles when the front pair stands flat and the other team presses.',
  ages:[['U8','Two pairs are easy to picture on a small court, so the 2-2 is a friendly first futsal shape for young players.'],
   ['U10','A good winter shape for U9 and U10 outdoor players, who get lots of touches on a hard court.'],
   ['U12','By U12 many players are ready to move on from the 2-2 to the 3-1 or the diamond.']],
  mistakes:['Both rear players go forward together, leaving the keeper alone.','The four players stand still in a square and are easy to mark.']},
 'futsal-1-2-1-diamond':{
  coach:'Show the alas that their spot changes with the ball: wide and high when your team has it, tucked in beside the fixo when the other team does.',
  match:'The diamond looks best on a quick pass from the fixo to an ala and on to the pivot. It struggles when an ala is caught upfield and the middle of the court opens.',
  ages:[['U10','Introduce the names fixo, ala and pivot at U10, once players are comfortable in a 2-2.'],
   ['U12','At U12 players can learn rotations that move each player through all four spots of the diamond.'],
   ['U13 and up','Older futsal players use the diamond to practice fast changes of place without losing the shape.']],
  mistakes:['The fixo carries the ball forward and nobody covers behind.','One ala stays high after the ball is lost and the middle is left open.']},
 'futsal-3-1':{
  coach:'Teach the pivot to come to the ball with their back to goal, shield it from the defender and lay it off to an ala arriving from behind.',
  match:'From the stands you see the pivot receive with a defender right behind them. When the three behind are slow to move up, the pivot is cut off and loses the ball.',
  ages:[['U10','At U10 let every child try the pivot job, which teaches shielding the ball with the body.'],
   ['U12','U12 players can learn the switch: the fixo steps up as the pivot drops, so the jobs keep changing.']],
  mistakes:['The three players behind stay deep and never join the pivot.','The pivot runs back for the ball every time, so the team has no target up front.']},
};

export const POSITION_NOTES:Readonly<Record<string,CoachNotes>>={
 'goalkeeper':{
  coach:'After every save, ask the keeper to look up before releasing the ball and pick the closest free teammate, before thinking about distance.',
  match:'In 7v7 parents often see the keeper catch a shot, wait while the other team drops back behind the build-out line, then roll the ball to a defender.',
  ages:[['U8','4v4 at U6 and U8 has no goalkeepers, so every child plays in the field. The job starts with 7v7.'],
   ['U10','In 7v7 at U9 and U10 the keeper may not punt or drop-kick, so rolling, throwing and passing come first.'],
   ['U12','From 9v9 the keeper may punt, but a short pass to a free defender is often the better choice.'],
   ['U13 and up','In 11v11 the keeper starts organising the back four out loud, as the player who sees the whole field.']],
  mistakes:['Staying on the goal line for every shot instead of moving out to make the angle smaller.','Kicking the ball as far as possible instead of passing to a free teammate.']},
 'center-back':{
  coach:'Teach the center back to stand side-on rather than square to the forward, so they can turn and run either way when the ball goes past them.',
  match:'A sideline moment: after a clearance, the center back calls teammates up the field. When they stay deep alone, a forward can wait onside behind everyone else.',
  ages:[['U10','A 7v7 3-2-1 or 3-1-2 has one center back. Teach calm passes out to the outside backs.'],
   ['U12','With full offside in 9v9, the center back learns to lead the back line up together.'],
   ['U13 and up','11v11 brings two center backs, so they learn to cover each other: one goes to the ball, the other drops behind.']],
  mistakes:['Diving in for the ball and getting beaten, instead of staying on their feet.','Kicking every ball long when a short pass to a teammate is on.']},
 'fullback':{
  coach:'Teach the fullback to stand half-turned, so they can see the ball and the winger they are guarding at the same time.',
  match:'Watch the fullback on throw-ins: a quick throw to a free teammate keeps the attack going, while a slow one lets the other team get set.',
  ages:[['U10','In a 7v7 2-3-1 the two defenders play like fullbacks, moving wide when the keeper has the ball.'],
   ['U12','In a 9v9 back three, the outside backs start learning when to join attacks and when to stay.'],
   ['U13 and up','In an 11v11 back four the fullback learns to overlap the winger and to recover quickly.']],
  mistakes:['Drifting into the middle and leaving the whole side of the field open.','Running forward to attack and not getting back in time.']},
 'wingback':{
  coach:'Give the wingback a picture: when the ball is on the far side, tuck in toward the back line; when it is on their side, step up to press or attack.',
  match:'Late in a game you may see a tired wingback caught upfield, and the other team’s wide player gets a free run down that side.',
  ages:[['U12','Most 9v9 shapes have no wingbacks, but the wide midfielders in a 3-3-2 learn the same up-and-back running.'],
   ['U13 and up','Wingbacks appear in 11v11 shapes such as the 3-5-2, usually with older and fitter teams.']],
  mistakes:['Staying deep all the time, so the team has no width in attack.','Pushing forward without checking who is covering the space behind.']},
 'defensive-midfielder':{
  coach:'Ask the defensive midfielder to stand in the passing lane to the other team’s striker, so passes into the striker’s feet are cut out.',
  match:'Parents notice the 6 when an attack breaks down: the player who steps in to stop a counterattack before it reaches the defenders.',
  ages:[['U10','In 7v7 the middle midfielder does this job some of the time. Teach them to stay behind the ball when the team attacks.'],
   ['U12','The 9v9 3-1-3-1 gives the holder a fixed spot in front of the back three.'],
   ['U13 and up','In 11v11 the 6 sits in front of the back four as the link between defense and midfield.']],
  mistakes:['Chasing the ball forward and leaving the space in front of the defenders empty.','Receiving with the back to the play and turning straight into pressure.']},
 'central-midfielder':{
  coach:'Teach the 8 to check over the shoulder before the ball arrives, so the first touch can turn them toward the open side.',
  match:'You see the central midfielder everywhere: helping defend a corner, then a short while later arriving at the edge of the penalty area to shoot.',
  ages:[['U10','The middle midfielder in a 7v7 2-3-1 is the first central midfield job most players try.'],
   ['U12','In 9v9 the two central midfielders learn to share the work: one goes forward, one stays.'],
   ['U13 and up','In 11v11 the 8 covers ground between both penalty areas and learns to arrive late in the box.']],
  mistakes:['Standing right next to the other central midfielder, so one pass beats both.','Always passing backward instead of looking for a forward pass first.']},
 'attacking-midfielder':{
  coach:'Show the 10 how to find space between the other team’s midfielders and defenders, and to open the body so they can turn and face goal.',
  match:'You may see the 10 drop very deep to get the ball. When they stay higher in the gap, one pass from midfield puts them facing goal.',
  ages:[['U12','The 9v9 2-3-2-1 and 3-1-3-1 give U11 and U12 players their first attacking midfield spots.'],
   ['U13 and up','In 11v11 shapes such as the 4-2-3-1 the 10 plays just behind the striker.']],
  mistakes:['Dropping so deep for the ball that nobody is near the striker.','Holding the ball too long instead of playing the quick pass.']},
 'winger':{
  coach:'Ask the winger to receive on the foot farther from the passer, so the first touch already takes them forward down the line.',
  match:'Parents see the winger take on a defender one-against-one near the sideline, then either go down the line or cut inside to shoot.',
  ages:[['U10','In a 7v7 2-3-1 the wide midfielders do the winger’s job of keeping the team wide.'],
   ['U12','In a 9v9 3-2-3 the wide forwards are true wingers, and full offside means they must time their runs.'],
   ['U13 and up','In 11v11 wingers work with a fullback behind them and learn to run back when the ball is lost.']],
  mistakes:['Coming inside too early and leaving no width.','Dribbling into a crowd of defenders instead of passing.']},
 'striker':{
  coach:'Teach the striker to start runs from a spot where they can see both the ball and the last defender, so they can stay onside.',
  match:'A familiar moment: the striker runs too early and offside is called. One step back and a later run would have been onside.',
  ages:[['U8','4v4 has no offside and no fixed striker, but every child should learn to shoot when they see the goal.'],
   ['U10','In 7v7 offside starts at the build-out line, so the forward learns to watch the last defender.'],
   ['U12','With full offside from the halfway line in 9v9, timing runs becomes the striker’s key skill.'],
   ['U13 and up','In 11v11 a lone striker learns to hold the ball up until midfielders arrive.']],
  mistakes:['Standing next to the goalkeeper waiting for the ball and getting caught offside.','Not chasing when the ball is lost, so the other team builds up easily.']},
};

export const RULE_NOTES:Readonly<Record<string,CoachNotes>>={
 'offside':{
  coach:'Teach forwards to glance along the line of the last defender just before a teammate passes, and to start the run as the pass is played.',
  match:'A common sideline mix-up: a forward is behind the last defender when the ball arrives, but was level when it was kicked. That player was onside.',
  ages:[['U8','There is no offside in 4v4 at U6 and U8, so children can stand anywhere.'],
   ['U10','In 7v7 a player can only be offside between the build-out line and the goal line.'],
   ['U12','From 9v9 at U11 and U12, full offside applies anywhere in the other team’s half.']]},
 'throw-in':{
  coach:'Practice quick throw-ins: the nearest player takes it, and one teammate moves into open space close by, ready to receive.',
  match:'In young games you often see the throw given to the other team after a foul throw, such as lifting a foot or throwing with one hand.',
  ages:[['U8','Some 4v4 leagues let young players kick the ball in instead, or retake a foul throw. Check your league’s rules.'],
   ['U10','In 7v7 the full throw-in is used. A player cannot be offside straight from a throw-in, and a goal cannot be scored directly from one.'],
   ['U12','U12 players can start using the throw-in as a planned restart near the other team’s goal.']]},
 'goal-kick':{
  coach:'Ask defenders to start at the edges of the penalty area on a goal kick. The ball is in play once it is kicked and clearly moves, so they may receive it inside the area.',
  match:'Parents sometimes see a goal kick taken again: an opponent stayed in the penalty area and challenged for the ball before another player touched it.',
  ages:[['U8','4v4 has no goalkeepers, so leagues restart from the goal line in their own way. Check yours.'],
   ['U10','In 7v7 the other team waits behind the build-out line on a goal kick, which gives defenders time on the ball.'],
   ['U12','From 9v9 opponents only have to leave the penalty area, so the team needs a plan against a high press.']]},
 'corner-kick':{
  coach:'Give each player a corner job before the game: who takes it, who stands near the near post and who waits at the edge of the area for a cleared ball.',
  match:'Young teams often crowd everyone into the goal area on a corner. When the ball is cleared, the other team counterattacks with nobody back.',
  ages:[['U10','At 7v7 a short corner or a low pass is better than a high ball, because there is no heading at 10 and under.'],
   ['U12','U12 players can aim corners at a space, and remember that a goal may be scored directly from a corner kick.'],
   ['U13 and up','11v11 teams learn planned corner routines and clear jobs for each defender.']]},
 'handball':{
  coach:'Teach players to keep their arms close to their body when blocking a shot or cross, while still using them for balance when running.',
  match:'Parents often shout “handball!” when the ball hits an arm held close to the body. The referee lets play go on, because that is not an offence.',
  ages:[['U8','4v4 has no goalkeepers, so no player may handle the ball on purpose.'],
   ['U10','In 7v7 the keeper may use the hands only inside their own penalty area. Outside it, the keeper is like any other player.'],
   ['U12','U12 players can learn that a handball offence by a defender inside their own penalty area gives a penalty kick.']]},
 'fouls-and-free-kicks':{
  coach:'Teach the team to decide fast on a free kick: take it quickly while the other team is not ready, or wait and set up a planned kick.',
  match:'Near goal you see the other team build a wall. On a direct free kick the shot may go straight in, and the wall is there to block it.',
  ages:[['U8','At U6 and U8 coaches teach fair play first: go for the ball, never the player.'],
   ['U10','In 7v7 opponents give space on every free kick. Leagues set the distance on smaller fields.'],
   ['U13 and up','In 11v11, opponents stay 10 yards from the ball until the free kick is taken.']]},
 'penalty-kick':{
  coach:'Teach the kicker to pick a spot before walking up and stick with it, and ask teammates to be ready to follow in for a rebound.',
  match:'Parents may see a penalty taken again because the keeper stepped off the goal line too early and saved it.',
  ages:[['U10','Small-sided fields often have a penalty mark closer than 12 yards. Your league sets the distance.'],
   ['U12','U12 players learn that everyone except the kicker and keeper waits outside the penalty area and behind the penalty mark.'],
   ['U13 and up','In 11v11 the mark is 12 yards from the goal, and some games that must have a winner end with a penalty shoot-out.']]},
 'yellow-and-red-cards':{
  coach:'Tell players that arguing with the referee can earn a yellow card too, and that coaches on the bench can be shown cards as well.',
  match:'Parents might see a yellow card for a reckless tackle, or for a player kicking the ball away after the whistle to stop a quick restart.',
  ages:[['U10','Leagues decide how referees use cards with U9 and U10 players, so check your league’s rules.'],
   ['U12','At 9v9 players learn that two yellow cards in one game make a red, and the team plays on a player down.'],
   ['U13 and up','In 11v11 a red card often brings a ban from the next game as well. Your league sets the rule.']]},
 'back-pass-rule':{
  coach:'Teach defenders that passing back to the keeper is fine, and teach the keeper to receive it with the feet and pass it on, just like a field player.',
  match:'A sideline moment: the keeper picks up a deliberate back pass and the referee gives the other team an indirect free kick inside the penalty area.',
  ages:[['U10','The rule applies in 7v7 too. Building out from the back means keepers get many back passes to practice with.'],
   ['U12','In 9v9, under pressure, keepers learn to clear with the feet when there is no safe pass.'],
   ['U13 and up','In 11v11 the keeper is expected to be a calm extra passer behind the back four.']]},
 'build-out-line':{
  coach:'Teach the keeper to scan the field once the other team drops back, then pass quickly to a defender who is free and facing forward.',
  match:'Parents often see the other team waiting at the build-out line, then rushing in as soon as the keeper rolls the ball out.',
  ages:[['U8','4v4 at U6 and U8 has no goalkeepers and no build-out line.'],
   ['U10','Used in 7v7 at U9 and U10, and offside only applies between the build-out line and the goal line.'],
   ['U12','The line is gone in 9v9, so teams must learn to build out against a press from outside the penalty area.']]},
 'kick-off':{
  coach:'Remind players that the ball may be kicked in any direction at a kick-off, so a short pass back to a teammate is a calm way to start.',
  match:'After a goal, parents see both teams go back to their own halves, and the team that let in the goal takes the kick-off.',
  ages:[['U8','Even at 4v4, a kick-off is a chance to teach a simple first pass instead of a big kick forward.'],
   ['U10','In 7v7 a goal may be scored directly from a kick-off against the other team, but a pass is usually smarter.'],
   ['U12','U12 teams can practice one planned kick-off move to get the ball to a free player up the field.']]},
 'drop-ball':{
  coach:'Teach players that a drop ball is not a contest: the ball goes to one player, so everyone else steps away and gets ready to play.',
  match:'When play stops for an injured player, parents see the referee drop the ball for the team that last had it, and the game restarts calmly.',
  ages:[['U10','In 7v7 the drop ball follows the Laws: one player gets the ball and the others stand away.'],
   ['U12','U12 players can learn that if play stopped with the ball in a penalty area, the ball is dropped for the defending goalkeeper.']]},
 'advantage':{
  coach:'Teach players to keep playing until they hear the whistle. A foul does not always stop the game, and stopping early wastes a good attack.',
  match:'A player is tripped but the ball runs on to a teammate. The referee lets play go on, and parents may wonder why no foul was given.',
  ages:[['U10','Referees use advantage in 7v7 too, so U9 and U10 players learn to play on until the whistle.'],
   ['U12','At 9v9 players learn that a card can still be shown for the foul at the next stoppage after advantage is played.']]},
 'substitutions-and-game-length':{
  coach:'Plan playing time before the game so every child gets a fair share, and use short shifts at young ages so players stay fresh.',
  match:'Parents see substitutes waiting at the halfway line for the referee’s okay, often at a throw-in, goal kick or after a goal.',
  ages:[['U8','In the US standards, 4v4 games are played in quarters, and players can go off and come back on.'],
   ['U10','7v7 games are played in two halves. Your league sets when substitutions may be made.'],
   ['U12','9v9 halves are longer than 7v7 halves, so rotating players matters more.'],
   ['U13 and up','Some 11v11 leagues limit when or how often players may come back on. Check your league’s rules.']]},
 'heading-rules-for-kids':{
  coach:'Teach players to control a high ball with the chest or thigh, or to let it bounce first, so they never need to use their head.',
  match:'In a 7v7 game a high ball drops near a player, who steps back and controls it with the chest. A deliberate header there gives the other team an indirect free kick.',
  ages:[['U8','No heading at U6 and U8, in games or in practice.'],
   ['U10','No heading at 10 and under. A deliberate header in a 7v7 game gives the other team an indirect free kick.'],
   ['U12','Players aged 11 and 12 have limits on heading in practice. Ask your league which rule it follows.'],
   ['U13 and up','US Youth Soccer allows heading in games and practice from age 13. Coaches still teach other ways to control the ball.']]},
 'futsal-rules':{
  coach:'Make the closest player take every restart at once, and teach teammates to move into open space straight away, so the four seconds never run out.',
  match:'A kick-in taken too slowly, after four seconds, is given to the other team as a kick-in of their own.',
  ages:[['U8','Futsal suits young players, because a small court and a low-bounce ball mean lots of touches.'],
   ['U10','At U10 teams learn the kick-in and how to change players on the fly through the substitution zone.'],
   ['U12','U12 teams start to count their fouls, because a sixth foul in a period gives the other team a free kick from the 10 m mark.']]},
};

export const TERM_NOTES:Readonly<Record<string,CoachNotes>>={
 'give-and-go':{
  coach:'Ask the passer to sprint the moment the ball leaves their foot. A give-and-go fails when the first player stops to watch the pass.',
  match:'Near the penalty area a player passes to a teammate, runs past the defender and gets the ball straight back for a shot.',
  ages:[['U8','In 4v4 the give-and-go is a simple first move between two players beating one defender.'],
   ['U10','In 7v7 players use it to get past a defender near the sideline or at the edge of the area.'],
   ['U12','At U12 players can do it at speed, with a one-touch return pass.']]},
 'third-man-run':{
  coach:'Teach the third player to start running as soon as the first pass is played, not when the second pass is on its way.',
  match:'A defender passes to a midfielder, who lays it back first time, while a third teammate is already running into space for the next pass.',
  ages:[['U10','Most U10 players are still learning two-player moves. Introduce it with a simple triangle in practice.'],
   ['U12','In 9v9 the third-man run helps a team get the ball through a crowded midfield.'],
   ['U13 and up','In 11v11 it is a key way to reach a free player behind the other team’s midfield.']]},
 'overlap':{
  coach:'Tell the player with the ball to dribble slightly inside, so the overlapping runner has room on the outside to receive.',
  match:'On the side of the field the fullback runs around the winger, who slides the ball into space, and one defender is left facing two attackers.',
  ages:[['U10','In a 7v7 2-3-1 a defender can overlap a wide midfielder on the same side.'],
   ['U12','In 9v9 the outside backs start overlapping the wide forwards when the team has the ball.'],
   ['U13 and up','In 11v11 the fullback overlapping the winger is a common way to attack down the side.']]},
 'through-ball':{
  coach:'Teach passers to aim into the space ahead of the runner, not at their feet, and to watch the last defender before choosing the moment.',
  match:'A midfielder slides a pass between two defenders and the striker runs on to it. If the run started too early, offside is called.',
  ages:[['U8','With no offside in 4v4, children can learn to pass into space for a teammate to run on to.'],
   ['U10','In 7v7 offside starts at the build-out line, so runners and passers must time it together.'],
   ['U12','With full offside from halfway in 9v9, the timing of the pass and the run decides everything.']]},
 'switching-play':{
  coach:'Teach players to look away from the ball: before receiving, a quick glance at the far side shows whether it is open.',
  match:'Everyone crowds one side of the field, then a pass across finds a free teammate on the far side with lots of space.',
  ages:[['U8','In 4v4 children learn the first idea: if one side is crowded, look at the other side.'],
   ['U10','In 7v7 the switch often goes back through a defender or the keeper to reach the far side.'],
   ['U12','On a bigger 9v9 field, a longer pass across can switch play in one go.']]},
 'two-v-one':{
  coach:'Teach the attacker with the ball to dribble straight at the defender to make them choose, while the teammate stays wide enough for an easy pass.',
  match:'On a fast break, two attackers race against one defender. One pass at the right time leaves a clear shot at goal.',
  ages:[['U8','4v4 makes many 2v1 chances, so U6 and U8 players can learn when to pass and when to keep going.'],
   ['U10','In 7v7, 2v1s often appear down the sides between a wide midfielder and a defender.'],
   ['U12','At U12 players learn to make a 2v1 happen on purpose, by moving a teammate close to the ball.']]},
 'cutback':{
  coach:'Tell runners to stop near the penalty spot instead of running into the goal area, because a cutback comes back toward them.',
  match:'A wide player reaches the goal line and passes back to a teammate arriving at the edge of the penalty area, who shoots first time.',
  ages:[['U10','At U10 the low cutback is a great way to create chances, because there is no heading at 10 and under.'],
   ['U12','In 9v9 wide forwards learn to look for the cutback before trying a high cross.'],
   ['U13 and up','In 11v11 the cutback is a key option when defenders have run back toward their own goal.']]},
 'cross':{
  coach:'At young ages ask for low crosses along the ground into the space in front of goal, so teammates can shoot with their feet.',
  match:'A player near the sideline sends the ball across the penalty area, and a teammate runs in to meet it.',
  ages:[['U10','No heading at 10 and under, so crosses should be low and played to a teammate’s feet.'],
   ['U12','Heading is still limited at 11 and 12, so low and driven crosses remain the main tool.'],
   ['U13 and up','In 11v11 players learn different crosses, aimed at the near post, the far post or the edge of the area.']]},
 'first-touch':{
  coach:'Ask players to decide where their first touch will go before the ball arrives, after a quick look around.',
  match:'A player receives a pass and pushes the ball into space with one touch, away from the defender who was rushing in.',
  ages:[['U6','At U6 children learn to stop the ball with the sole of the foot before doing anything else.'],
   ['U8','At U8 players start moving the ball out of their feet with the first touch.'],
   ['U10','In 7v7 players learn to take the first touch away from pressure and toward open space.'],
   ['U12','At U12 players learn to receive with an open body, so the first touch can turn them forward.']]},
 'pressing':{
  coach:'Teach the pressing player to run in a curve, blocking the pass to one side and pushing the ball toward the sideline.',
  match:'When the other team’s defender gets the ball, the nearest forward runs at them, and the defender has to kick it away in a hurry.',
  ages:[['U10','In 7v7 the team waits behind the build-out line until the keeper puts the ball in play, then can press.'],
   ['U12','In 9v9 a team can press high on goal kicks, waiting just outside the penalty area.'],
   ['U13 and up','In 11v11 teams learn to press as a unit, with every player shifting together.']]},
 'marking':{
  coach:'Teach markers to stand where they can see both their opponent and the ball, a step closer to their own goal.',
  match:'On a corner each defender stays close to an attacker. Parents may see a defender lose their player by turning to watch the ball.',
  ages:[['U8','At U8 marking is simple: find a player on the other team and stay near them.'],
   ['U10','In 7v7 players learn to mark the player nearest to their own goal first.'],
   ['U12','At U12 players start to learn the difference between marking a player and guarding a space.']]},
 'goal-side':{
  coach:'When the ball is lost, call “goal-side” so every player runs back to a spot between their opponent and their own goal.',
  match:'A defender racing back gets in front of the attacker, between them and the goal, so the attacker has to go around.',
  ages:[['U8','In 4v4 children learn to run back toward their own goal when the other team has the ball.'],
   ['U10','In 7v7 players learn to get goal-side first, before trying to win the ball.'],
   ['U12','At U12 goal-side positions are the starting point for marking and covering as a team.']]},
 'tackle':{
  coach:'Teach players to stay on their feet, be patient and tackle when the attacker’s touch goes a little too far from them.',
  match:'A defender times the challenge as the dribbler pushes the ball ahead, and comes away with it cleanly.',
  ages:[['U8','At U8 players learn to stay on their feet and block the ball with the inside of the foot.'],
   ['U10','In 7v7 players learn to wait for the right moment instead of lunging at the ball.'],
   ['U12','At U12 players learn that kicking the opponent before the ball is a foul, even if they win it.']]},
 'counterattack':{
  coach:'Teach players to look forward first after winning the ball: if a teammate is free up the field, pass fast before the other team recovers.',
  match:'A team defends a corner, wins the ball and races the other way while most of the other team is still near its penalty area.',
  ages:[['U8','In 4v4 a quick dribble after winning the ball is the first counterattack.'],
   ['U10','In 7v7 a counterattack may start with the keeper throwing or rolling the ball quickly. Punts are not allowed.'],
   ['U12','In 9v9 wide forwards learn to stay ready for a counterattack while the team defends.']]},
 'set-piece':{
  coach:'Give every player one job at set pieces, and practice them a few times so they become habits rather than something to think about.',
  match:'Before a corner or free kick, parents see players moving into their spots and pointing to each other, and then the plan from practice happens.',
  ages:[['U8','In 4v4 restarts are simple. Teach children to restart quickly and pass to a free teammate.'],
   ['U10','No heading at 10 and under, so 7v7 set pieces work best with low passes and shots.'],
   ['U12','At U12 teams can learn a few simple set-piece plans for corners and free kicks.']]},
 'free-kick-wall':{
  coach:'Practise the wall as a quick team habit: the goalkeeper calls a number, players jog into line, then everyone turns to win the second ball.',
  match:'At a free kick near the goal, parents see players join hands or link arms in a line, the referee pace out the distance, and the goalkeeper shout and point.',
  ages:[['U8','In 4v4 there are no goalkeepers and few walls. Teach children to stand back from the ball and wait for the kick.'],
   ['U10','In 7v7 a wall of one or two players is enough, so the rest of the team can mark the other attackers.'],
   ['U12','At U12 the goalkeeper can learn to set the wall and decide how many players go in it.']]},
 'nutmeg':{
  coach:'Teach players that a nutmeg is a tool, not the goal: use it when the defender’s legs open and there is space behind them.',
  match:'A dribbler slips the ball through a defender’s legs and runs around to collect it on the other side, and the sideline cheers.',
  ages:[['U6','At U6 a nutmeg is a fun dribbling challenge in small games.'],
   ['U8','In 4v4 players can try nutmegs in one-against-one moments.'],
   ['U10','In 7v7 players learn when a nutmeg is worth trying and when a pass is better.']]},
 'clean-sheet':{
  coach:'Praise the whole team for a clean sheet, not just the keeper, because defending starts with the forwards.',
  match:'At the final whistle the other team’s score is still zero, and the defenders and keeper celebrate together.',
  ages:[['U8','4v4 has no goalkeepers, and many leagues do not keep standings at this age, so clean sheets are not a focus.'],
   ['U10','In 7v7 the keeper and defenders share a clean sheet, and it is a good moment to praise teamwork.'],
   ['U12','At U12 players start to take pride in keeping clean sheets as a team.']]},
 'hat-trick':{
  coach:'Celebrate the passes that set up each goal, so a hat-trick feels like a team result and not only one player’s.',
  match:'When one player scores a third goal in the same game, teammates celebrate together and parents on the sideline start counting.',
  ages:[['U8','Some coaches ask a player who has scored a few goals to set up teammates next, so everyone gets a chance.'],
   ['U10','In 7v7 a hat-trick is a great moment, and a good chance to praise the teammates who helped.'],
   ['U12','At U12 players can learn to share credit for a hat-trick with the team.']]},
};
