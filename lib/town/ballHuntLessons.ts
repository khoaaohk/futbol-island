// Loaded with the collection lesson, never from the island render loop.
export type DiagramKind='shot-place'|'keeper-set'|'shield-hold'|'reset-breath'|'help-up'|'carrier-angle'|'team-lines'|'rebound'|'cushion'|'request-foot'|'recovery'|'stretch'|'pivot-switch'|'vacate'|'goal-side'|'balance'|'rescan'|'body-open'|'far-foot'|'weight'|'pass-or-carry'|'run-timing'|'support-after'|'pace'|'first-time'|'distance'|'scan'|'pass'|'wide'|'lane'|'community'|'touch'|'triangle'|'lead'|'return'|'cut'|'switch'|'lines'|'decoy'|'check'|'third'|'curve'|'feet'|'height'|'talk'|'behind'|'onside'|'disguise'|'feet-both'|'depth'|'stagger'|'compact'|'overload'|'channels'|'moving-triangle'
 /* Manhole balls: from above lessons. */
 |'free-player'|'split'|'forward-first'|'safety'|'diamond'|'thirds'|'blind-side'|'overlap'|'show-outside'|'box-runs'|'cutback'|'counter'|'build-out'|'throw-in'|'lane-block'|'tempo'|'press-curve'|'step-up'|'carry'|'head-up'|'sweeper-keeper'|'free-kick-wall'|'press-trigger'|'quick-free-kick'|'better-placed';
export type BallLesson={kind:DiagramKind;steps:[string,string,string];actions:[string,string]};
const lesson=(kind:DiagramKind,a:string,b:string,c:string,x:string,y:string):BallLesson=>({kind,steps:[a,b,c],actions:[x,y]});
export const BALL_HUNT_LESSONS:Record<string,BallLesson>={
 "sky-north":lesson("shot-place","The keeper covers the middle of the goal.","Look for the open corner instead of aiming straight at the keeper.","Use a controlled shot toward the open corner. Accuracy matters more than power.","Find the corner","Place the shot"),
 "sky-west":lesson("keeper-set","A goalkeeper is upright as a shooter approaches.","Set your feet apart with soft knees and hands ready before the shot.","A balanced ready stance helps the keeper push sideways toward the ball.","Get set","Push sideways"),
 "sky-plaza":lesson("shield-hold","A defender approaches a ball you are protecting.","Turn your body between the opponent and the ball, keeping it within playing distance.","Keep your balance and arms relaxed. Protect the ball without shoving the opponent.","Turn to shield","Hold your space"),
 "sky-east":lesson("reset-breath","A missed chance can make your next decision feel rushed.","Take one slow breath and let your shoulders relax.","Choose one helpful next action, such as encouraging a teammate. One mistake does not define your game.","Take a breath","Choose the next action"),
 "sky-pier":lesson("help-up","An opponent is on the ground after a challenge.","When play has stopped and it is safe, check whether they are okay.","Offer a hand if they want help. Competing hard and showing care belong together.","Check on them","Offer support"),

 'high-humanities':lesson('depth','Everyone is standing at the same depth. There is no clear forward or return option.','One teammate goes ahead while another drops behind. The team now stretches in two directions.','The carrier can choose a forward pass or a safe return. Keep those distances useful for the passer.','Add forward and backward support','Use the forward option'),
 'high-school':lesson('stagger','Two supporting players stand on the same line, close enough for one defender to screen.','Move one player shorter and one farther ahead, at different angles.','The passer has a short option and a forward option. Different depths make the defender choose.','Stagger the positions','Play through the new angle'),
 'high-classrooms':lesson('compact','The defending team is spread out. Large gaps invite a pass through the middle.','The nearest defender closes the ball. Two teammates narrow the gaps behind.','When the ball moves, shift together. One presses while the others protect the inside space.','Press with cover','Shift as a team'),
 "high-visitor":lesson("stretch","The defender stays close to midfield because no attacker threatens the space behind.","One attacker holds a higher position. The defender drops to watch that threat.","A teammate now has more room underneath. Forward depth can create space for someone else.","Stretch the last line","Use the space underneath"),
 'high-mercado':lesson('overload','Two attackers face one defender. Standing too close wastes the numbers advantage.','Separate to give the ball carrier a clear passing option. The defender approaches the carrier.','Pass to the free teammate as the defender commits. Good spacing makes the two-against-one useful.','Separate the attackers','Pass around the defender'),
 'high-nova':lesson('channels','Two teammates share the same outside lane and bring pressure together.','Keep one wide. Move the supporting player inside and slightly behind.','A diagonal pass connects the different lanes. The receiver has space for their next touch.','Share the lanes','Connect outside to inside'),
 'high-deli':lesson('moving-triangle','Three teammates form a triangle around a defender.','The ball goes to the right corner. Watch how the useful angles change.','The other players adjust around the new carrier, keeping two clear connections.','Move the ball','Rebuild the triangle'),
 "high-apartments":lesson("pivot-switch","Pressure blocks the direct pass to the far side.","Play back to a supporting pivot who has a different view across the pitch.","The pivot moves the ball to the opposite side. Two shorter passes find the space.","Find the supporting pivot","Switch through the pivot"),
 "high-clubgrounds":lesson("vacate","Two teammates want to use the same small pocket. Standing together makes them easier to mark.","The first player leaves the pocket and gives their teammate room to arrive.","The second player receives in the released space. Coordinate the movement instead of both crowding the gap.","Leave the crowded pocket","Let a teammate arrive"),
 "high-promenade":lesson("goal-side","An attacker stands between you and the goal you defend.","Recover into the space between that attacker and your goal. Keep the ball in view too.","As the attacker moves, adjust your position to protect the route to goal.","Recover goal-side","Adjust with the attacker"),
 store:lesson('scan','The ball is coming. Where is the pressure?','Look behind you: the coral defender is close. The gold space is free.','Receive toward the space you spotted. A look becomes a useful next touch.','Check your shoulder','Receive into space'),
 coaches:lesson('feet','The target is straight ahead. Set your standing foot beside the ball.','Turn the kicking foot outward to show its broad inside surface.','Follow through toward the target. Accuracy comes before power.','Open the foot','Play the pass'),
 garden:lesson('wide','Three attackers are crowded into a narrow area.','Move the outside players wider. The defenders have more ground to cover.','The ball carrier now has an outside passing route.','Spread out','Use the width'),
 "market":lesson("carrier-angle","The defender blocks your pass while you stand still.","Carry the ball sideways into the free lane. The angle changes even though your teammate stays put.","Pass from the new angle before the defender closes it.","Carry sideways","Use the new passing angle"),
 museum:lesson('community','A club badge represents more than the players on matchday.','Supporters and youth players connect to the same club.','Local traditions link those groups. Look for these connections in a Passport club story.','Meet the community','Connect their stories'),
 terrace:lesson('balance','A receiving player needs room for the next action.','A balanced stance leaves two possible directions open.','A controlled touch into the gold space prepares the next move.','Find your balance','Choose your next touch'),
 "roof":lesson("team-lines","A team has players at different heights up the pitch.","Find the defensive, midfield and attacking lines. Each connects a different part of the team.","The ball can travel through midfield toward the attack. Keep those lines connected.","Find the three lines","Connect defence to attack"),
 "ferry":lesson("weight","The receiver needs a ball they can control.","A pass that is too soft stops short and invites pressure.","A measured pass reaches the control space. Choose weight for the distance.","Compare a soft pass","Send a measured pass"),
 beach:lesson('pass','A short, clear route is available along the ground.','Keep the ankle steady and strike through the middle of the ball.','The ball rolls into the receiver’s path without an extra bounce to judge.','Line up the pass','Roll it through'),
 "north":lesson("run-timing","The runner waits for the passer to be ready.","The ball is released and the run begins toward the meeting space.","Player and pass arrive together. Time the run to the ball instead of arriving far too early.","Release and run","Meet the pass"),
 'wall-right':lesson('feet-both','One target can help you practise both feet.','Use the inside of your left foot for a controlled pass.','Reset and try the right foot. In a real drill, practise five gentle passes with each.','Try the left foot','Try the right foot'),
 "garden-cafe":lesson("support-after","Passing starts your next movement.","Release the ball to your teammate. Watch where they can see you.","Move to a fresh support angle. The ball stays with your teammate until they choose their next pass.","Release the pass","Offer a new angle"),
 "market-north":lesson("rescan","Your first look finds a defender behind you.","Check the pressure while the pass starts travelling.","The defender has moved right. Update your decision and use the free side on the left.","Take the first look","Check what changed"),
 school:lesson('touch','Stopping the ball under your feet can delay your next move.','Spot the free space before the pass reaches you.','Guide the first touch into that space, ready for the next action.','Choose the next action','Take a useful touch'),
 northwest:lesson('body-open','Facing only the passer hides the space behind you.','Open your body so you can see both the pass and your next option.','Receive side-on and move toward the option you checked.','Open your body','Receive and turn'),
 pier:lesson('switch','Defenders are crowded around the ball on one side.','Look across the pitch: the far-side teammate has space.','Move the ball across to use that space before the defence shifts.','Find the far side','Switch the play'),
 club:lesson('lead','Passing to where a runner used to be makes them stop.','Look at the runner’s direction and aim ahead into the gold space.','The teammate meets the pass while moving.','Lead the runner','Meet in space'),
 'dock-entry':lesson('behind','Forward routes are crowded by a defender.','A teammate offers an angle behind the ball.','A return pass keeps possession and gives the team time to find another route.','Offer support behind','Play back to keep it'),
 "west-market":lesson("pace","A marker can follow a steady run.","A slow approach covers a short distance and keeps the marker close.","A sudden burst covers more ground in the same time. Use that separation to offer a pass.","Approach slowly","Burst away"),
 library:lesson('cut','A straight run leaves the defender in the passing route.','Plant and move away from that line.','The new direction opens an angle the passer can use.','Change direction','Show the new lane'),
 "store-roof":lesson("far-foot","Pressure is close to the left side.","Choose the right foot, farther from that pressure.","Guide the ball right, keeping your body between the defender and the ball.","Choose the far foot","Protect the touch"),
 'arcade-roof':lesson('return','A defender is between you and the space ahead.','Pass to your teammate and run beyond the defender.','Your teammate returns the ball into your run: a give-and-go.','Give and run','Receive the return'),
 'junior-roof':lesson('triangle','Standing in one line lets a defender cover several players.','Move to separate angles to make three corners.','The triangle gives the ball carrier two passing options.','Make three corners','Connect the options'),
 'books-roof':lesson('lines','Two defensive lines leave a pocket between them.','Check both shoulders and move into the pocket.','Receive where you can see the next option; the pocket may close quickly.','Find the pocket','Receive between lines'),
 'museum-roof':lesson('decoy','A marker blocks the route to your teammate.','One attacker runs wide and takes that marker along.','The other teammate can use the lane that has opened. The run helped without receiving.','Move the marker','Use the opened lane'),
 'grass-west':lesson('check','Your marker is close enough to block a pass.','Move away first to make the defender react.','Check back into a clear angle while the passer can still find you.','Move away','Check back'),
 'grass-junior':lesson('onside','Watch the defensive line and the passer together.','Stay level with or behind the relevant offside line until the pass is played.','Then run into the space behind. The diagram simplifies the full offside rule.','Wait for the pass','Run behind'),
 'grass-garden':lesson('third','A direct route from A to C is blocked.','A plays to B while C moves to a useful angle.','B finds C. The third player moves before the second pass.','Find player B','Connect to player C'),
 'grass-community':lesson('lane','Standing behind the defender hides you from the passer.','Step sideways out of the defender’s cover shadow.','A clear line now connects you to the ball.','Leave the shadow','Receive in view'),
 "ramp-gap":lesson("rebound","A shot may rebound instead of reaching its target.","Watch the new direction after the block. Find the space the loose ball is entering.","Move toward that space to reach the second ball. React to the rebound rather than following the original shot.","Read the rebound","Reach the second ball"),
 'wall-books':lesson('height','An opponent blocks the straight ground route.','A lofted route can carry the ball over the opponent.','The ball drops near the teammate. With a clear short lane, a ground pass is often easier to control.','See the lofted route','Play over the pressure'),
 "wall-nova":lesson("first-time","B needs to choose the next option before the pass arrives.","B spots the next teammate as the ball approaches the receiving foot.","One contact redirects the ball to that teammate. If control is uncertain, take an extra touch instead.","Read before contact","Redirect first time"),
 "wall-garden":lesson("cushion","A firm pass is arriving at your foot.","Give slightly with the receiving foot as the ball makes contact.","The ball slows into a small control space instead of bouncing far away.","Meet the firm pass","Cushion the contact"),
 "wall-library":lesson("request-foot","The passer can see you but needs a clear target.","Point to the foot away from the nearby pressure and call for the ball there.","The pass reaches the requested foot. Clear information helps your teammate aim.","Show the receiving foot","Pass to that target"),
 'wall-arts':lesson('disguise','Two teammates offer different passing options.','Look toward one option while staying balanced.','Pass accurately to the other. A disguise helps only if the pass still reaches its target.','Look at one option','Choose the other'),
 'wall-community':lesson('curve','Running straight behind the defender hides the receiving lane.','Curve the run around the defender’s cover shadow.','The new angle stays visible to the passer while moving forward.','Curve your run','Meet the passing lane'),
 "parcel-north":lesson("distance","Standing too close lets one defender cover both attackers.","Moving very far away makes the pass harder for this pressured teammate.","Adjust to a useful distance: separate from the defender but stay within a practical passing range.","Compare too far","Find useful distance"),
 'parcel-west':lesson('pass-or-carry','A teammate is already in a useful position farther ahead.','Look up before deciding to dribble the whole distance.','A pass moves the ball to that teammate while the passer can move to support.','Spot the teammate','Let the ball travel'),
 'parcel-school':lesson('talk','A receiver may not see the defender approaching behind them.','Give early, useful information: “Man on!” when pressure is close.','The receiver uses the warning to choose a safe touch. Say “Time” when there really is space.','Call the pressure','React to the message'),
 "parcel-south":lesson("recovery","Your team has lost the ball. Chasing it with everyone leaves gaps.","The nearest player slows the attacker while teammates recover toward their own goal.","The recovering players protect passing routes. Delaying the attack buys time to regroup.","Delay the attacker","Recover behind the ball"),

 // Manhole balls: dropping in from the sky, each lesson is about what the whole pitch looks like from above.
 "manhole-promenade":lesson("free-player","Three teammates want the ball. Two of them have a defender close by.","Count the pressure: one defender each on the left and in the middle. The teammate on the right is alone.","Pass to the free teammate. They have time to take a touch and look forward.","Count the defenders","Pass to the free player"),
 "manhole-rua-90":lesson("split","Two defenders stand side by side with a gap between them.","Your teammate moves behind the gap. The passing line now runs straight between the defenders.","A firm ground pass splits them. Both defenders are now behind the ball.","Find the gap","Play through it"),
 "manhole-cafe-mare":lesson("forward-first","You have the ball. A sideways pass is easy, but is there something better?","Look up the pitch first. The striker is free between two defenders.","The forward pass is on, so play it. If it had been blocked, the sideways pass would still be there.","Look up the pitch","Play forward"),
 "manhole-visitor-centre":lesson("safety","Your team is attacking. Everyone wants to join in.","If every player runs forward, the space behind them is empty.","One teammate stays back as a safety player. If the ball is lost, they can slow the counter-attack.","See the empty space","Keep one back"),
 "manhole-classrooms":lesson("diamond","Four teammates stand in a flat line. One defender can block most of the passes.","Move into a diamond: one ahead, one on each side and the ball carrier at the back.","The carrier has three different options. Pass to the corner the defender is not covering.","Build the diamond","Pick the open corner"),
 "manhole-rua-nova":lesson("thirds","Split the pitch into three bands, from your goal to theirs.","In your defending third, a lost ball is close to your own goal. Play safe and simple.","In the attacking third, a lost ball is far from your goal. Be brave: dribble, cross or shoot.","Play safe at the back","Be brave up front"),
 "manhole-fish-market":lesson("blind-side","The defender faces the ball. You stand where they can see you.","Drift behind their shoulder, onto the side they cannot see.","As the pass is played, step into the space. The defender turns too late.","Drift out of sight","Arrive for the pass"),
 "manhole-park-library":lesson("overlap","Your winger has the ball near the touchline, facing one defender.","Run around the outside of the winger and down the line.","The defender cannot follow both of you. Receive the pass in the space down the line.","Run around the outside","Receive down the line"),
 "manhole-island-market":lesson("show-outside","An attacker dribbles at you through the middle.","Stand slightly inside them, at an angle. Leave the outside path open.","The attacker goes wide. The touchline works like an extra defender.","Angle your body","Steer them wide"),
 "manhole-courtside":lesson("box-runs","A winger is about to cross. All three attackers run to the same spot.","Split the runs: one to the near post, one to the far post and one to the penalty spot.","The crosser picks the free runner. Spreading out makes the defence choose.","Split the runs","Cross to the free space"),
 "manhole-west-market":lesson("cutback","Your winger dribbles toward the end line.","Defenders sprint back toward their goal. Space opens behind them.","The winger pulls the ball back. A teammate arrives facing the goal.","Reach the end line","Pull it back"),
 "manhole-corner-deli":lesson("counter","The opponents are attacking. Most of their players are near your goal.","You win the ball. Look up: the space behind them is wide open.","One quick forward pass to a running teammate starts the counter-attack.","Win it and look up","Go forward fast"),
 "manhole-west-end-books":lesson("build-out","Your keeper has a goal kick. Opponents stand close to your defenders.","The build-out line: in 7v7, opponents must go back behind it until the ball is played.","Defenders spread wide into the free space. The keeper plays a safe pass to one of them.","Retreat to the line","Spread and pass"),
 "manhole-junior-club":lesson("throw-in","Your teammate has a throw-in. Everyone nearby is standing still and marked.","One teammate checks short toward the ball while another runs down the line.","The thrower picks the free runner and throws the ball to their feet.","Check and run","Throw to the free runner"),
 "manhole-arcade":lesson("lane-block","The ball carrier wants to pass to the striker behind you.","Draw the line from the ball to the striker. You are standing beside it.","Step onto the line. The pass is blocked, so the carrier has to go sideways.","Draw the passing line","Step into the lane"),
 "manhole-nursery":lesson("tempo","The defence is set. There is no gap between the two defenders.","Two quick passes across the back. The defenders have to slide across with the ball.","A gap opens where they were. Play forward through it before they close it.","Move the ball quickly","Play through the gap"),
 "manhole-high-school":lesson("press-curve","Two opponents pass the ball between them. You want to press.","A straight run leaves the pass to the other opponent wide open.","Curve your run so your body blocks that pass. The carrier has fewer choices.","Try a straight run","Curve the press"),
 "manhole-community-hall":lesson("step-up","Your defenders stand in a straight line near your goal.","The opponents pass backward. Their attack moves away from your goal.","Move up together and keep the line straight. The attackers now have less space.","Watch the back pass","Step up together"),
 "manhole-garden-cafe":lesson("carry","You have the ball. No defender is close and the space ahead is empty.","Push the ball forward with longer touches and run after it.","A defender comes to meet you. Now pass to the teammate they left free.","Carry into space","Pass when they come"),
 "manhole-arts-wing":lesson("head-up","You dribble looking at your feet. You only see the ball.","Lift your head between touches. Now you see a teammate and the space beside them.","Pass before the defender arrives. Looking up turned a dribble into a chance.","Lift your head","Pass into space"),
 "manhole-courtyard":lesson("sweeper-keeper","Your defenders are high up the pitch. There is a lot of space behind them.","The keeper steps off the goal line toward the edge of the box, watching the ball.","A long ball goes over the defence. The keeper gets there first and clears it wide.","Step off the line","Sweep behind"),
 "manhole-pier-bakery":lesson("free-kick-wall","The other team has a free kick near your goal.","Players line up in a wall to block one side of the goal.","The keeper guards the other side. Together, the wall and the keeper cover the whole goal.","Build the wall","Guard the other side"),
 "manhole-humanities":lesson("press-trigger","An opponent is about to receive a pass. You wait at a safe distance.","Their first touch is heavy. The ball rolls away from their feet.","That is your signal. Press quickly and win the loose ball.","Watch the first touch","Press the loose ball"),
 "manhole-school-offices":lesson("quick-free-kick","Your team wins a free kick. Opponents are complaining and slow to get back.","Look up while they are not ready. A teammate is unmarked in space.","Take the free kick quickly and pass to them before the defence is organised.","Spot the free teammate","Restart quickly"),
 "manhole-history-museum":lesson("better-placed","You are near the goal but at a tight angle. The keeper covers your shot.","Look across: your teammate is in the middle with a clear view of the goal.","Pass across to them. They have a much easier finish.","Look across","Pass for the finish"),
};

export type DiagramNode={id:string;x:number;y:number;label:string;role:'team'|'opponent'|'ball'|'club';angle?:number};
export type DiagramFrame={nodes:DiagramNode[];paths:string[];run?:string;zone?:[number,number,number,number];note?:string;side?:boolean};
export function ballLessonFrame(kind:DiagramKind,step:number):DiagramFrame{

 const person=(id:string,x:number,y:number,label:string,role:DiagramNode['role']='team'):DiagramNode=>({id,x,y,label,role});
 if(kind==='shot-place')return {nodes:[person('a',160,190,'Shooter'),person('d',160,55,'Keeper','opponent'),person('ball',step===2?265:160,step===2?35:174,'','ball')],paths:step?['M65 35H285','M160 174L265 35']:[],zone:step?[240,25,40,35]:undefined,note:step===2?'Controlled finish into the open corner':step?'Look beyond the keeper':'Find the unguarded part of the goal'};
 if(kind==='keeper-set')return {nodes:[person('a',step===2?100:165,175,step?'Ready keeper':'Upright keeper'),person('b',235,55,'Shooter'),person('ball',step===2?110:220,step===2?165:70,'','ball')],paths:step?['M115 195H210']:[],run:step===2?'M165 175L100 175':undefined,note:step===2?'Push from your set stance':step?'Soft knees · feet apart · hands ready':'Set before the shot'};
 if(kind==='shield-hold')return {nodes:[person('a',step?163:130,145,'You'),person('d',step===2?200:220,145,'Opponent','opponent'),person('ball',145,165,'','ball')],paths:step?['M175 115L175 185']:[],note:step===2?'Hold balance · no pushing':step?'Body between opponent and ball':'Protect a ball within playing distance'};
 if(kind==='reset-breath')return {nodes:[person('a',105,140,step===0?'Frustrated':step===1?'Breathe':'Ready'),person('b',240,140,step===2?'You’ve got this!':'Teammate')],zone:step===1?[60,90,90,95]:undefined,paths:step===2?['M125 125Q170 65 220 125']:[],note:step===0?'Mistake → pause':step===1?'Slow breath · relax shoulders':'Encourage your teammate'};
 if(kind==='help-up')return {nodes:[person('a',step?160:85,145,'You'),person('d',200,step===2?140:185,step===2?'Back up':'Opponent','opponent')],paths:step===2?['M173 145L188 145']:[],run:step===1?'M85 145L160 145':undefined,note:step===0?'Play stopped · check it is safe':step===1?'Are you okay?':'Offer a hand · respect the answer'};
 const sky=skyLessonFrame(kind,step);if(sky)return sky;
 const distinct=distinctLessonFrame(kind,step);if(distinct)return distinct;
 const n=(id:string,x:number,y:number,label:string,role:DiagramNode['role']='team'):DiagramNode=>({id,x,y,label,role});
 const a=n('a',65,170,'You'),b=n('b',265,65,'Teammate'),d=n('d',166,118,'Defender','opponent'),ball=n('ball',81,168,'','ball');
 const f:DiagramFrame={nodes:[a,b,d,ball],paths:[],zone:[222,92,70,55]};
 const pass=(x:number,y:number)=>{if(step===2){ball.x=x;ball.y=y;}};
 if(kind==='community')return {nodes:[n('club',165,112,'Club','club'),n('fans',65,60,'Supporters'),n('youth',265,60,'Youth teams'),n('local',165,200,'Traditions')],paths:step?['M165 112L65 60','M165 112L265 60',...(step===2?['M165 112L165 200']:[])]:[],note:'A club is a shared story'};
 if(kind==='height'){a.x=55;a.y=181;b.x=275;b.y=181;d.x=165;d.y=181;ball.x=74;ball.y=181;f.side=true;f.zone=undefined;f.paths=step?['M75 180Q165 10 265 180']:[];pass(260,181);return f;}
 if(kind==='feet'||kind==='feet-both'){f.nodes=[n('left',142,167,'Left foot'),n('right',183,167,'Right foot'),n('target',165,52,'Target','club'),ball];ball.x=165;ball.y=158;f.zone=[145,35,40,40];f.paths=step?['M165 150L165 70']:[];pass(165,67);f.note=step?'Use the inside surface · follow the target line':'Standing foot points toward the target';if(kind==='feet-both'&&step){ball.x=step===1?157:173;ball.y=67;f.paths=[step===1?'M142 150L157 67':'M183 150L173 67'];f.note=step===1?'Left-foot pass · a gentle, accurate touch':'Right-foot pass · practise both sides';}return f;}
 if(kind==='pass'){d.x=182;d.y=200;f.paths=step?['M81 168L253 76']:[];pass(250,79);}
 if(kind==='lane'||kind==='curve'){b.x=265;b.y=65;if(step){b.x=265;b.y=155;}f.paths=step?['M81 168L250 155']:['M81 168L250 75'];f.run=kind==='curve'?'M265 65Q318 85 265 155':'M265 65L265 155';pass(250,155);}
 if(kind==='scan'||kind==='talk'||kind==='touch'){a.x=160;a.y=133;b.x=65;b.y=198;d.x=172;d.y=66;ball.x=82;ball.y=184;f.zone=[212,107,70,58];if(step){a.angle=45;f.paths=['M160 132L178 75','M160 132L242 138'];}if(step===2){a.x=222;a.y=145;ball.x=242;ball.y=140;}if(kind==='talk')f.note=step?'“Man on!” · pressure behind':'What can the receiver not see?';}
 if(kind==='wide'||kind==='triangle'||kind==='disguise'){a.x=165;a.y=188;b.x=185;b.y=94;d.x=165;d.y=125;const c=n('c',145,94,'Teammate');f.nodes.push(c);ball.x=180;ball.y=180;if(step){b.x=280;b.y=76;c.x=50;c.y=76;f.paths=['M165 188L280 76','M165 188L50 76'];if(kind==='triangle')f.paths.push('M50 76L280 76');if(kind==='disguise'){a.angle=45;f.note=step===1?'Look right · keep both options available':'Pass left · accuracy still matters';}}f.zone=undefined;pass(65,85);}
 if(kind==='lead'){b.x=214;b.y=173;d.x=169;d.y=69;f.zone=[243,61,58,55];f.run='M214 173L271 92';if(step)f.paths=['M81 168L271 92'];if(step===2){b.x=271;b.y=92;ball.x=257;ball.y=98;}}
 if(kind==='return'){b.x=268;b.y=133;f.zone=[101,40,70,52];if(step){ball.x=251;ball.y=136;a.x=134;a.y=68;f.run='M65 170L134 68';f.paths=['M81 168L251 136'];}if(step===2){ball.x=150;ball.y=74;f.paths.push('M251 136L150 74');}}
 if(kind==='cut'||kind==='check'){b.x=65;b.y=195;a.x=225;a.y=89;d.x=204;d.y=119;ball.x=82;ball.y=190;f.run=kind==='cut'?'M225 89L264 111L251 171':'M225 89L265 60L245 159';if(step){a.x=265;a.y=kind==='cut'?111:60;}if(step===2){a.x=245;a.y=159;f.paths=['M82 190L231 165'];}f.zone=[220,142,62,47];}
 if(kind==='switch'){a.x=58;a.y=160;b.x=278;b.y=83;d.x=83;d.y=116;f.nodes.push(n('d2',120,170,'Pressure','opponent'));ball.x=73;ball.y=162;if(step)f.paths=['M73 162L262 91'];pass(262,91);}
 if(kind==='behind'){a.x=165;a.y=100;b.x=265;b.y=195;d.x=165;d.y=65;ball.x=181;ball.y=112;f.zone=[220,161,70,57];if(step)f.paths=['M181 112L251 182'];pass(251,182);}
 if(kind==='onside'){a.x=65;a.y=188;b.x=245;b.y=130;d.x=165;d.y=110;f.nodes.push(n('last',90,40,'Goalkeeper','opponent'));ball.x=81;ball.y=178;f.zone=[216,53,73,47];f.paths=['M30 110L300 110'];f.note='Attack toward the top · simplified offside line';if(step){f.paths.push('M81 178L260 83');ball.x=142;ball.y=146;}if(step===2){b.x=267;b.y=75;ball.x=252;ball.y=84;f.run='M245 130L267 75';}}
 if(kind==='lines'){a.x=165;a.y=192;b.x=240;b.y=181;d.x=100;d.y=130;f.nodes.push(n('d2',245,130,'','opponent'),n('d3',100,55,'','opponent'),n('d4',245,55,'','opponent'));ball.x=180;ball.y=185;f.paths=['M30 130L300 130','M30 55L300 55'];f.zone=[128,70,80,44];if(step){b.x=178;b.y=93;f.run='M240 181L178 93';}if(step===2){ball.x=178;ball.y=108;f.paths.push('M180 185L178 108');}}
 if(kind==='decoy'){a.label='Runner';b.x=260;b.y=130;ball.x=67;ball.y=206;f.nodes.push(n('c',52,207,'Passer'));f.run='M65 170L58 75';if(step){a.y=75;d.x=80;d.y=112;f.paths=['M67 206L245 140'];}pass(245,140);}
 if(kind==='third'){d.y=160;a.label='A';b.label='B';b.x=163;b.y=58;f.nodes.push(n('c',270,160,'C'));f.zone=[240,127,55,55];if(step){ball.x=163;ball.y=75;f.paths=['M81 168L163 75'];}if(step===2){ball.x=251;ball.y=156;f.paths.push('M163 75L251 156');}}
 if(kind==='depth'){
  a.x=165;a.y=135;ball.x=180;ball.y=135;b.x=220;b.y=135;b.label='Ahead';d.x=165;d.y=68;
  const c=n('c',110,135,'Behind');f.nodes.push(c);f.zone=undefined;
  if(step){b.x=255;b.y=68;c.x=75;c.y=198;f.paths=['M180 135L241 76','M180 135L90 188'];}
  pass(241,76);
 }
 if(kind==='stagger'){
  a.x=60;a.y=190;ball.x=76;ball.y=181;b.x=228;b.y=96;d.x=198;d.y=130;
  const c=n('c',200,96,'Short option');f.nodes.push(c);f.zone=[239,47,60,58];
  if(step){b.x=270;b.y=55;c.x=123;c.y=147;f.paths=['M76 181L111 155','M76 181L256 65'];}
  pass(256,65);
 }
 if(kind==='overload'){
  a.x=85;a.y=160;ball.x=101;ball.y=153;b.x=119;b.y=150;d.x=136;d.y=94;f.zone=[243,101,60,70];
  if(step){b.x=271;b.y=134;d.x=108;d.y=111;f.paths=['M101 153L255 138'];}
  pass(255,138);
 }
 if(kind==='channels'){
  a.x=280;a.y=166;ball.x=264;ball.y=159;b.x=273;b.y=125;d.x=244;d.y=112;f.zone=[153,171,70,53];
  f.note='Outside lane → inside support';
  if(step){b.x=184;b.y=193;f.run='M273 125L184 193';f.paths=['M264 159L198 188'];}
  pass(198,188);
 }
 if(kind==='moving-triangle'){
  a.x=165;a.y=192;b.x=278;b.y=76;d.x=168;d.y=124;ball.x=180;ball.y=180;
  const c=n('c',50,76,'Teammate');f.nodes.push(c);f.zone=undefined;f.paths=['M165 192L278 76','M165 192L50 76'];
  if(step){ball.x=264;ball.y=84;f.paths=['M165 192L264 84'];}
  if(step===2){a.x=263;a.y=193;c.x=135;c.y=65;f.paths=['M264 84L263 179','M264 84L149 66'];f.run='M165 192L263 193';}
 }
 if(kind==='compact'){
  a.x=63;a.y=171;a.label='Press';b.x=265;b.y=180;b.label='Cover';d.x=76;d.y=58;d.label='Attacker';ball.x=92;ball.y=68;
  const c=n('c',165,206,'Cover');f.nodes.push(c,n('d2',265,65,'Attacker','opponent'));f.zone=[125,100,95,65];
  if(step){a.x=83;a.y=105;b.x=178;b.y=158;c.x=129;c.y=164;f.run='M63 171L83 105M265 180L178 158M165 206L129 164';}
  if(step===2){ball.x=247;ball.y=74;a.x=150;a.y=158;b.x=253;b.y=108;c.x=202;c.y=166;a.label='Cover';b.label='Press';f.paths=['M92 68L247 74'];f.run='M178 158L253 108M83 105L150 158M129 164L202 166';}
 }
 return f;
}

/** Manhole lessons: bird's-eye situations built from the same bounded SVG primitives. Attack toward the top. */
function skyLessonFrame(kind:DiagramKind,step:number):DiagramFrame|undefined{
 const n=(id:string,x:number,y:number,label:string,role:DiagramNode['role']='team'):DiagramNode=>({id,x,y,label,role});
 const at=(o:DiagramNode,x:number,y:number)=>{o.x=x;o.y=y;};
 switch(kind){
 case 'free-player':{
  const a=n('a',165,200,'You'),b=n('b',70,115,'Teammate'),c=n('c',165,115,'Teammate'),e=n('e',262,115,'Teammate'),d=n('d',70,62,'Defender','opponent'),d2=n('d2',165,62,'Defender','opponent'),ball=n('ball',180,192,'','ball');
  const f:DiagramFrame={nodes:[a,b,c,e,d,d2,ball],paths:[],note:'Who has nobody near them?'};
  if(step){f.zone=[232,86,62,58];f.note='Two marked · one free';}
  if(step===2){at(ball,248,124);f.paths=['M180 192L248 124'];f.note='Pass to the free teammate';}
  return f;}
 case 'split':{
  const a=n('a',165,205,'You'),b=n('b',255,65,'Teammate'),d=n('d',118,125,'Defender','opponent'),d2=n('d2',212,125,'Defender','opponent'),ball=n('ball',165,190,'','ball');
  const f:DiagramFrame={nodes:[a,b,d,d2,ball],paths:[],note:'Two defenders · one gap'};
  if(step){at(b,165,62);f.run='M255 65L165 62';f.zone=[140,103,50,44];f.note='Teammate behind the gap';}
  if(step===2){at(ball,165,82);f.paths=['M165 190L165 84'];f.note='Both defenders beaten';}
  return f;}
 case 'forward-first':{
  const a=n('a',90,200,'You'),c=n('c',235,200,'Side option'),b=n('b',165,58,'Striker'),d=n('d',105,62,'Defender','opponent'),d2=n('d2',228,62,'Defender','opponent'),ball=n('ball',105,193,'','ball');
  const f:DiagramFrame={nodes:[a,c,b,d,d2,ball],paths:['M105 193L221 200'],note:'An easy sideways pass'};
  if(step){f.zone=[138,34,54,50];f.paths.push('M105 193L158 72');f.note='The forward pass is open';}
  if(step===2){at(ball,158,72);f.paths=['M105 193L158 72'];f.note='Play forward when it is on';}
  return f;}
 case 'safety':{
  const a=n('a',165,120,'Carrier'),b=n('b',80,140,'Teammate'),c=n('c',250,140,'Teammate'),s=n('s',165,185,'Teammate'),d=n('d',222,200,'Opponent','opponent'),d2=n('d2',205,45,'Defender','opponent'),ball=n('ball',178,112,'','ball');
  const f:DiagramFrame={nodes:[a,b,c,s,d,d2,ball],paths:[],note:'Everyone wants to attack'};
  if(step){at(a,165,82);at(ball,178,74);at(b,80,78);at(c,250,78);}
  if(step===1){at(s,120,112);f.run='M165 185L120 112';f.zone=[95,150,140,55];f.note='Nobody left behind';}
  if(step===2){at(s,185,172);s.label='Safety';f.run='M165 185L185 172';f.note='One stays back in balance';}
  return f;}
 case 'diamond':{
  const a=n('a',90,150,'You'),b=n('b',150,150,'Teammate'),c=n('c',210,150,'Teammate'),e=n('e',270,150,'Teammate'),d=n('d',150,105,'Defender','opponent'),ball=n('ball',104,160,'','ball');
  const f:DiagramFrame={nodes:[a,b,c,e,d,ball],paths:[],note:'A flat line is easy to block'};
  if(step){at(a,165,200);at(ball,165,186);at(b,85,130);at(c,245,130);at(e,165,58);at(d,122,88);f.paths=['M165 186L85 130','M165 186L245 130','M165 186L165 72'];f.note='One ahead · two sides · one behind';}
  if(step===2){at(ball,231,138);f.paths=['M165 186L231 138'];f.note='Pass to the open corner';}
  return f;}
 case 'thirds':{
  const lines=['M20 92H310','M20 162H310'],a=n('a',240,185,'You'),b=n('b',150,150,'Teammate'),d=n('d',245,132,'Defender','opponent'),ball=n('ball',226,182,'','ball');
  const f:DiagramFrame={nodes:[n('g',165,212,'Your goal','club'),n('g2',165,34,'Their goal','club'),a,b,d,ball],paths:[...lines],note:'Defending · middle · attacking'};
  if(step===1){at(ball,164,156);f.paths.push('M226 182L166 157');f.zone=[20,164,290,38];f.note='Near your goal: safe and simple';}
  if(step===2){at(a,165,72);at(ball,178,64);at(b,95,110);at(d,215,78);f.paths.push('M178 64L170 44');f.zone=[20,40,290,50];f.note='Near their goal: be brave';}
  return f;}
 case 'blind-side':{
  const p=n('p',70,195,'Passer'),a=n('a',155,160,'You'),d=n('d',185,125,'Defender','opponent'),ball=n('ball',86,188,'','ball');
  const f:DiagramFrame={nodes:[p,a,d,ball],paths:[],note:'The defender watches the ball'};
  if(step===1){at(a,232,92);f.run='M155 160Q230 165 232 92';f.zone=[210,40,70,45];f.note='Behind their shoulder';}
  if(step===2){at(a,238,62);at(ball,224,70);f.run='M232 92L238 62';f.paths=['M86 188L224 70'];f.zone=[210,40,70,45];f.note='Arrive as the pass is played';}
  return f;}
 case 'overlap':{
  const w=n('w',250,145,'Winger'),a=n('a',195,195,'You'),d=n('d',250,75,'Defender','opponent'),ball=n('ball',236,138,'','ball');
  const f:DiagramFrame={nodes:[w,a,d,ball],paths:[],note:'One defender faces the winger'};
  if(step===1){at(a,292,112);f.run='M195 195Q300 200 292 112';f.note='Run around the outside';}
  if(step===2){at(a,292,52);at(ball,280,62);f.run='M292 112L292 52';f.paths=['M236 138L280 64'];f.zone=[268,30,38,48];f.note='The defender cannot follow both';}
  return f;}
 case 'show-outside':{
  const d=n('d',165,70,'Attacker','opponent'),a=n('a',165,150,'You'),ball=n('ball',165,86,'','ball');
  const f:DiagramFrame={nodes:[n('g',165,212,'Your goal','club'),d,a,ball],paths:[],note:'The attacker heads for the middle'};
  if(step){at(a,140,138);a.angle=35;f.zone=[250,40,55,150];f.note='Guard the middle · leave the outside';}
  if(step===2){at(d,272,120);at(ball,272,136);at(a,228,150);f.run='M165 70L272 120';f.paths=['M165 86L272 136'];f.note='The touchline helps you defend';}
  return f;}
 case 'box-runs':{
  const a=n('a',135,160,''),b=n('b',165,175,'Runners'),c=n('c',195,160,''),d=n('d',215,112,'Defender','opponent'),ball=n('ball',285,135,'','ball');
  const f:DiagramFrame={nodes:[n('g',165,34,'Goal','club'),n('w',285,150,'Winger'),a,b,c,d,ball],paths:[],note:'Three runners, one spot'};
  if(step){at(a,210,72);a.label='Near post';at(b,118,72);b.label='Far post';at(c,165,120);c.label='Spot';f.run='M135 160L210 72M165 175L118 72M195 160L165 120';f.note='Near post · far post · penalty spot';}
  if(step===2){at(d,238,92);at(ball,132,78);f.paths=['M285 135Q220 30 132 78'];f.note='Cross to the free runner';}
  return f;}
 case 'cutback':{
  const a=n('a',255,110,'Winger'),b=n('b',165,160,'Teammate'),d=n('d',180,78,'Defender','opponent'),d2=n('d2',130,92,'Defender','opponent'),ball=n('ball',255,96,'','ball');
  const f:DiagramFrame={nodes:[n('g',165,32,'Goal','club'),a,b,d,d2,ball],paths:[],note:'The winger heads for the end line'};
  if(step){at(a,262,58);at(ball,250,52);at(d,205,62);at(d2,125,66);f.run='M180 78L205 62M130 92L125 66';f.zone=[125,95,90,45];f.note='Defenders run back · space opens';}
  if(step===2){at(b,165,112);f.run='M165 160L165 112';f.paths=['M250 52L178 104'];at(ball,178,104);f.note='Pull it back to a teammate facing goal';}
  return f;}
 case 'counter':{
  const a=n('a',125,185,'You'),b=n('b',232,112,'Teammate'),ball=n('ball',184,146,'','ball');
  const f:DiagramFrame={nodes:[a,b,n('d',170,150,'Attacker','opponent'),n('d2',60,150,'Attacker','opponent'),n('d3',250,180,'Attacker','opponent'),n('d4',110,60,'Defender','opponent'),ball],paths:[],note:'They attack your goal'};
  if(step){at(ball,139,180);f.paths=step===1?['M184 146L141 179']:[];f.zone=[175,32,120,60];f.note='Win it · look up · space behind';}
  if(step===2){at(b,255,62);at(ball,242,70);f.run='M232 112L255 62';f.paths=['M139 180L242 70'];f.note='One quick pass forward';}
  return f;}
 case 'build-out':{
  const b=n('b',135,178,'Teammate'),c=n('c',195,178,'Teammate'),d=n('d',95,150,'Attacker','opponent'),d2=n('d2',235,150,'Attacker','opponent'),ball=n('ball',165,196,'','ball');
  const f:DiagramFrame={nodes:[n('k',165,210,'Keeper'),b,c,d,d2,ball],paths:['M20 110H310'],note:'Goal kick · opponents close'};
  if(step){at(d,95,86);at(d2,235,86);f.zone=[20,116,290,62];}
  if(step===1){f.run='M95 150L95 86M235 150L235 86';f.note='They wait behind the build-out line';}
  if(step===2){at(b,58,160);at(c,272,160);at(ball,258,166);f.paths.push('M165 196L258 166');f.note='Spread wide · safe first pass';}
  return f;}
 case 'throw-in':{
  const b=n('b',245,128,'Teammate'),c=n('c',250,182,'Teammate'),ball=n('ball',300,90,'','ball');
  const f:DiagramFrame={nodes:[n('t',300,105,'Thrower'),b,c,n('d',205,100,'Defender','opponent'),n('d2',208,160,'Defender','opponent'),ball],paths:[],note:'Everyone is standing still'};
  if(step){at(b,268,148);at(c,288,58);f.run='M245 128L268 148M250 182L288 58';f.note='One checks short · one runs down the line';}
  if(step===2){at(ball,276,68);f.paths=['M300 90L278 70'];f.note='Throw to the free runner';}
  return f;}
 case 'lane-block':{
  const a=n('a',150,140,'You'),ball=n('ball',165,76,'','ball');
  const f:DiagramFrame={nodes:[n('d',165,60,'Carrier','opponent'),n('d2',230,182,'Striker','opponent'),a,n('b',82,190,'Teammate'),ball],paths:[],note:'The striker is behind you'};
  if(step===1){f.paths=['M165 76L226 176'];f.note='Draw the passing line';}
  if(step===2){at(a,200,130);at(ball,104,70);f.run='M150 140L200 130';f.paths=['M165 76L106 70'];f.note='On the line · the pass is blocked';}
  return f;}
 case 'tempo':{
  const d=n('d',142,112,'Defenders','opponent'),d2=n('d2',188,112,'','opponent'),e=n('e',165,58,'Striker'),ball=n('ball',84,184,'','ball');
  const f:DiagramFrame={nodes:[n('a',70,190,'Teammate'),n('b',165,200,'You'),n('c',260,190,'Teammate'),d,d2,e,ball],paths:[],note:'The defence is set · no gap'};
  if(step){at(ball,246,184);at(d,208,112);at(d2,254,112);}
  if(step===1){f.paths=['M84 184L151 196','M165 200L246 186'];f.run='M142 112L208 112M188 112L254 112';f.note='Quick passes · defenders slide';}
  if(step===2){at(e,140,62);at(ball,142,76);f.run='M165 58L140 62';f.paths=['M246 184L142 76'];f.zone=[70,92,110,40];f.note='Play through the gap';}
  return f;}
 case 'press-curve':{
  const a=n('a',205,182,'You');
  const f:DiagramFrame={nodes:[n('d',110,70,'Opponent','opponent'),n('d2',240,60,'Opponent','opponent'),a,n('ball',124,76,'','ball')],paths:['M124 76L226 62'],note:'They pass between them'};
  if(step===1){at(a,150,108);f.run='M205 182L150 108';f.note='Straight run · the pass stays open';}
  if(step===2){at(a,162,71);f.run='M205 182Q228 100 162 71';f.paths=[];f.note='A curved run blocks the pass';}
  return f;}
 case 'step-up':{
  const a=n('a',70,165,'Teammate'),b=n('b',165,170,'You'),c=n('c',260,165,'Teammate'),d=n('d',130,122,'Attacker','opponent'),ball=n('ball',144,114,'','ball');
  const f:DiagramFrame={nodes:[a,b,c,d,n('d2',200,58,'Midfielder','opponent'),ball],paths:[],note:'A straight line near your goal'};
  if(step){at(ball,214,66);}
  if(step===1){f.paths=['M144 114L212 68'];f.note='They pass backward';}
  if(step===2){at(a,70,128);at(b,165,128);at(c,260,128);at(d,110,98);f.run='M70 165L70 128M165 170L165 128M260 165L260 128';f.note='Step up together · less space';}
  return f;}
 case 'carry':{
  const a=n('a',90,200,'You'),d=n('d',232,52,'Defender','opponent'),ball=n('ball',104,190,'','ball');
  const f:DiagramFrame={nodes:[a,d,n('b',262,122,'Teammate'),ball],paths:[],zone:[60,70,130,95],note:'Open space ahead'};
  if(step){at(a,120,132);at(ball,132,120);}
  if(step===1){f.run='M90 200L120 132';f.paths=['M104 190L132 120'];f.note='Longer touches into the space';}
  if(step===2){at(d,172,92);at(ball,248,126);f.run='M232 52L172 92';f.paths=['M132 120L248 126'];f.zone=undefined;f.note='A defender comes · now pass';}
  return f;}
 case 'head-up':{
  const a=n('a',90,165,'You'),d=n('d',185,122,'Defender','opponent'),ball=n('ball',100,150,'','ball');a.angle=180;
  const f:DiagramFrame={nodes:[a,n('b',252,72,'Teammate'),d,ball],paths:[],note:'Eyes on the ball only'};
  if(step){at(a,112,140);a.angle=55;at(ball,124,128);f.zone=[222,44,65,55];f.note='Head up · a teammate and space';}
  if(step===2){at(d,162,112);at(ball,238,80);f.paths=['M124 128L238 80'];f.note='Pass before the defender arrives';}
  return f;}
 case 'sweeper-keeper':{
  const k=n('k',165,165,'Keeper'),d=n('d',185,94,'Attacker','opponent'),ball=n('ball',165,56,'','ball');
  const f:DiagramFrame={nodes:[n('g',165,220,'Goal','club'),k,n('b',100,108,'Teammate'),n('c',230,108,'Teammate'),d,n('d2',165,40,'Passer','opponent'),ball],paths:[],zone:[40,122,250,34],note:'Big space behind the defence'};
  if(step===1){at(k,165,138);f.run='M165 165L165 138';f.note='The keeper steps off the line';}
  if(step===2){at(k,150,152);at(d,205,128);at(ball,72,148);f.zone=undefined;f.run='M185 94L205 128';f.paths=['M165 56Q150 100 152 140','M152 140L74 148'];f.note='Keeper first · clear it wide';}
  return f;}
 case 'free-kick-wall':{
  const k=n('k',200,75,'Keeper'),a=n('a',200,170,''),b=n('b',235,150,'Defenders'),c=n('c',265,172,'');
  const f:DiagramFrame={nodes:[n('g',200,40,'Goal','club'),k,n('d',90,195,'Kicker','opponent'),a,b,c,n('ball',104,185,'','ball')],paths:[],note:'A free kick near your goal'};
  if(step){at(a,120,116);at(b,148,128);b.label='Wall';at(c,176,140);}
  if(step===1){f.run='M200 170L120 116M235 150L148 128M265 172L176 140';f.paths=['M104 185L180 52'];f.note='The wall blocks one side';}
  if(step===2){at(k,218,70);f.run='M200 75L218 70';f.paths=['M104 185L180 52','M104 185L222 52'];f.note='The keeper guards the other side';}
  return f;}
 case 'press-trigger':{
  const a=n('a',172,172,'You'),ball=n('ball',80,68,'','ball');
  const f:DiagramFrame={nodes:[n('d',165,92,'Opponent','opponent'),n('d2',60,62,'Passer','opponent'),a,ball],paths:['M80 68L152 90'],note:'Wait at a safe distance'};
  if(step){at(ball,196,124);}
  if(step===1){f.paths=['M165 100L194 122'];f.note='Heavy touch · the ball runs loose';}
  if(step===2){at(a,204,140);f.run='M172 172L204 140';f.paths=[];f.note='That is the signal · press';}
  return f;}
 case 'quick-free-kick':{
  const d2=n('d2',205,108,'Opponent','opponent'),ball=n('ball',165,150,'','ball');
  const f:DiagramFrame={nodes:[n('a',150,175,'Kicker'),n('d',112,125,'Opponent','opponent'),d2,n('d3',240,165,'Opponent','opponent'),n('b',90,66,'Teammate'),ball],paths:[],note:'Opponents are slow to get back'};
  if(step){at(d2,215,82);f.run='M205 108L215 82';f.zone=[62,38,58,55];f.note='A teammate is unmarked';}
  if(step===2){at(ball,104,74);f.paths=['M165 150L104 74'];f.note='Restart before they are ready';}
  return f;}
 case 'better-placed':{
  const ball=n('ball',262,96,'','ball');
  const f:DiagramFrame={nodes:[n('g',165,34,'Goal','club'),n('k',205,62,'Keeper','opponent'),n('a',272,84,'You'),n('b',160,112,'Teammate'),n('d',222,128,'Defender','opponent'),ball],paths:['M262 96L208 50'],note:'Tight angle · the keeper covers'};
  if(step){f.paths=[];f.zone=[128,86,64,52];f.note='Your teammate sees the goal';}
  if(step===2){at(ball,146,114);f.paths=['M262 96L148 112'];f.note='Pass for an easy finish';}
  return f;}
 default:return undefined;
 }
}

/** Distinct situations use the same bounded SVG primitives and only advance on a tap. */
function distinctLessonFrame(kind:DiagramKind,step:number):DiagramFrame|undefined{
 const node=(id:string,x:number,y:number,label:string,role:DiagramNode['role']='team'):DiagramNode=>({id,x,y,label,role});
 const a=node('a',70,175,'You'),b=node('b',265,75,'Teammate'),d=node('d',165,125,'Defender','opponent'),ball=node('ball',86,171,'','ball');
 const f:DiagramFrame={nodes:[a,b,d,ball],paths:[]};
 const route=(from:DiagramNode,to:DiagramNode)=>`M${from.x} ${from.y}L${to.x} ${to.y}`;
 const send=(to:DiagramNode)=>{ball.x=to.x-14;ball.y=to.y+9;};
 switch(kind){
 case 'talk':
  a.x=75;a.y=200;a.label='Passer';b.x=235;b.y=135;b.label='Receiver';d.x=255;d.y=60;ball.x=91;ball.y=192;f.nodes.push(node('caller',80,70,'Caller'));
  if(step){d.y=95;ball.x=218;ball.y=146;f.paths=['M91 192L218 146'];f.note='Caller: Man on!';}if(step===2){b.x=205;b.y=155;b.angle=-45;ball.x=184;ball.y=164;f.run='M235 135L205 155';f.note='Warning arrives before the protective touch';}break;
 case 'curve':
  a.x=55;a.y=205;b.x=220;b.y=185;d.x=190;d.y=90;ball.x=71;ball.y=200;f.zone=[251,66,56,55];
  if(step){b.x=290;b.y=158;f.run='M220 185Q310 205 280 90';}if(step===2){b.x=280;b.y=90;send(b);f.paths=['M71 200L266 99'];}break;
 case 'carrier-angle':
  f.zone=[36,75,62,55];if(step){a.y=95;ball.y=103;f.run='M70 175L70 95';f.paths=['M86 103L251 84'];}if(step===2)send(b);break;
 case 'triangle':
  a.x=135;a.y=125;b.x=200;b.y=125;d.x=215;d.y=65;ball.x=151;ball.y=130;f.nodes.push(node('c',70,125,'Teammate'));
  if(step){b.x=275;b.y=80;const c=f.nodes.find(n=>n.id==='c')!;c.x=65;c.y=200;f.paths=['M151 130L261 89','M151 130L79 191','M65 200L275 80'];}if(step===2)send(b);break;
 case 'team-lines':
  a.x=80;a.y=200;a.label='Defence';b.x=240;b.y=45;b.label='Attack';d.role='team';d.label='Midfield';d.x=150;d.y=125;ball.x=94;ball.y=192;
  if(step){f.paths=['M35 200H285','M35 125H285','M35 45H285'];send(d);}if(step===2){send(b);f.paths=['M94 192L136 134','M136 134L226 54'];}break;
 case 'rebound':
  a.x=65;a.y=200;b.x=90;b.y=100;b.label='Shooter';d.x=190;d.y=95;ball.x=106;ball.y=100;f.zone=[228,142,65,55];
  if(step){ball.x=192;ball.y=100;f.paths=['M106 100L192 100','M192 100L255 163'];}if(step===2){a.x=252;a.y=180;ball.x=255;ball.y=163;f.run='M65 200L252 180';}break;
 case 'cushion':
  a.x=210;a.y=140;a.label='Receiving foot';b.x=55;b.y=140;b.label='Passer';d.x=280;d.y=70;ball.x=75;ball.y=140;f.zone=[218,121,44,40];
  if(step){ball.x=198;f.paths=['M75 140L198 140'];}if(step===2){a.x=235;ball.x=221;f.run='M210 140L235 140';f.note='Foot gives back · ball slows';}break;
 case 'request-foot':case 'far-foot':
  a.x=207;a.y=142;a.label='Near foot';b.x=249;b.y=142;b.label='Far foot';d.x=172;d.y=100;ball.x=78;ball.y=205;
  f.nodes.push(node('passer',62,205,'Passer'));f.zone=[230,118,42,52];
  if(step){f.paths=['M78 205L249 160'];b.angle=45;f.note=kind==='request-foot'?'Call and point: this foot':'Pressure left · receive on the right';}
  if(step===2){ball.x=kind==='request-foot'?249:273;ball.y=160;if(kind==='far-foot'){b.x=267;f.run='M249 142L267 142';}}break;
 case 'recovery':
  a.x=100;a.y=120;a.label='Nearest';b.x=260;b.y=70;b.label='Recover';d.x=150;d.y=100;d.label='New carrier';ball.x=164;ball.y=108;f.zone=[125,183,80,38];
  if(step){a.x=145;a.y=142;b.x=240;b.y=178;f.run='M100 120L145 142M260 70L240 178';}if(step===2){b.x=200;b.y=195;d.y=120;ball.y=128;f.paths=['M145 142L200 195'];f.note='Defend toward the bottom · delay and recover';}break;
 case 'stretch':
  a.x=245;a.y=130;a.label='High attacker';b.x=100;b.y=180;d.x=240;d.y=95;ball.x=78;ball.y=205;f.nodes.push(node('passer',62,205,'Passer'));
  if(step){a.y=65;d.y=40;f.run='M245 130L245 65';f.zone=[120,105,90,60];}if(step===2){b.x=165;b.y=135;send(b);f.paths=['M78 205L151 144'];}break;
 case 'pivot-switch':
  a.x=50;a.y=90;b.x=280;b.y=90;d.x=165;d.y=90;ball.x=66;ball.y=99;f.nodes.push(node('c',165,200,'Pivot'));f.zone=[246,65,54,50];
  if(step){ball.x=165;ball.y=184;f.paths=['M66 99L165 184'];}if(step===2){send(b);f.paths.push('M165 184L266 99');}break;
 case 'vacate':
  a.x=160;a.y=110;a.label='Leave';b.x=185;b.y=130;b.label='Arrive';d.x=185;d.y=70;ball.x=80;ball.y=205;f.nodes.push(node('passer',64,205,'Passer'));f.zone=[137,86,64,62];
  if(step){a.x=270;a.y=85;f.run='M160 110L270 85';}if(step===2){b.x=165;b.y=116;send(b);f.run+='M185 130L165 116';f.paths=['M80 205L151 125'];}break;
 case 'goal-side':
  a.x=65;a.y=85;a.label='Defender';b.x=165;b.y=120;b.label='Attacker';b.role='opponent';d.x=275;d.y=65;d.label='Passer';ball.x=261;ball.y=74;f.nodes.push(node('goal',165,211,'Your goal','club'));
  if(step){a.x=165;a.y=173;f.run='M65 85L165 173';f.paths=['M165 120L165 211'];}if(step===2){b.x=225;a.x=197;f.paths=['M225 120L165 211'];f.note='Keep attacker and ball in view';}break;
 case 'scan':case 'rescan':
  a.x=160;a.y=155;b.x=65;b.y=210;d.x=170;d.y=65;ball.x=80;ball.y=199;f.zone=[225,130,65,50];
  if(step){a.angle=180;f.paths=['M160 155L170 65'];}if(step===2){if(kind==='rescan'){d.x=255;d.y=145;f.zone=[65,110,65,50];a.angle=-60;f.paths=['M160 155L255 145','M160 155L98 135'];}else{a.angle=60;f.paths=['M160 155L250 155'];}if(kind==='rescan'){a.x=110;a.y=135;ball.x=92;ball.y=143;}else{a.x=222;a.y=155;ball.x=242;ball.y=155;}}break;
 case 'balance':
  a.x=160;a.y=155;a.label='Body';a.angle=65;b.x=145;b.y=192;b.label='Left foot';d.x=172;d.y=192;d.label='Right foot';d.role='team';ball.x=160;ball.y=210;
  if(step){a.angle=0;b.x=132;d.x=188;f.paths=['M160 155L100 95','M160 155L230 95'];}if(step===2){a.x=210;a.y=125;b.x=190;b.y=162;d.x=222;d.y=162;ball.x=230;ball.y=132;f.run='M160 155L210 125';}break;
 case 'body-open':
  a.x=165;a.y=140;a.angle=-90;b.x=65;b.y=150;d.x=175;d.y=65;ball.x=81;ball.y=150;f.nodes.push(node('c',275,145,'Next option'));
  if(step){a.angle=0;f.paths=['M165 140L65 150','M165 140L275 145'];}if(step===2){a.x=215;ball.x=232;ball.y=145;f.run='M165 140L215 140';}break;
 case 'weight':
  a.x=55;a.y=155;b.x=275;b.y=155;d.x=150;d.y=65;ball.x=72;ball.y=155;f.zone=[249,130,48,50];
  if(step){ball.x=150;f.paths=['M72 155L150 155'];f.note='Too soft · stops short';}if(step===2){ball.x=259;f.paths=['M72 155L259 155'];f.note='Measured pass · reaches control space';}break;
 case 'pass-or-carry':
  a.x=55;a.y=180;b.x=260;b.y=70;d.x=115;d.y=130;ball.x=71;ball.y=180;f.zone=[232,43,60,60];
  if(step){f.paths=['M71 180L246 79'];f.note='Teammate is beyond the pressure';}if(step===2){send(b);a.x=140;a.y=185;f.run='M55 180L140 185';}break;
 case 'run-timing':
  a.x=55;a.y=180;b.x=260;b.y=190;d.x=170;d.y=80;ball.x=71;ball.y=180;f.zone=[235,95,55,48];
  if(step){b.y=156;ball.x=143;ball.y=160;f.paths=['M71 180L260 120'];f.run='M260 190L260 120';f.note='Run begins as the pass is released';}if(step===2){b.y=120;ball.x=247;ball.y=128;f.note='Runner and ball arrive together';}break;
 case 'support-after':
  b.x=265;b.y=125;f.zone=[130,161,60,50];if(step){send(b);f.paths=['M86 171L251 134'];}if(step===2){a.x=165;a.y=190;f.run='M70 175L165 190';f.paths.push('M251 134L165 190');f.note='Offer the return · ball stays with teammate';}break;
 case 'pace':
  a.x=240;a.y=70;b.x=55;b.y=195;d.x=213;d.y=90;ball.x=71;ball.y=195;f.zone=[214,164,62,45];
  if(step){a.y=93;d.y=110;f.run='M240 70L240 93';f.note='Slow approach · short distance';}if(step===2){a.y=185;d.y=132;f.run='M240 93L240 185';f.paths=['M71 195L225 190'];f.note='Burst · larger distance in the same time';}break;
 case 'first-time':
  a.x=50;a.y=155;b.x=165;b.y=155;d.x=125;d.y=70;ball.x=66;ball.y=155;f.nodes.push(node('c',285,155,'Next pass'));
  if(step){b.angle=90;ball.x=151;f.paths=['M66 155L151 155','M165 155L271 155'];f.note='See the next pass before contact';}if(step===2){ball.x=271;f.paths=['M66 155L151 155','M151 155L271 155'];f.note='One contact redirects the ball';}break;
 case 'distance':
  a.x=65;a.y=180;b.x=95;b.y=166;d.x=100;d.y=115;ball.x=81;ball.y=180;f.note='Too close · one defender covers both';
  if(step){b.x=280;b.y=45;f.paths=['M81 180L266 54'];f.note='Too far for this pressured passer';}if(step===2){b.x=190;b.y=165;f.paths=['M81 180L176 174'];send(b);f.note='Useful distance · a reachable option';}break;
 default:return undefined;
 }
 return f;
}

/** Prediction prompts are loaded only with the lesson modal, never by the island. */
export const BALL_HUNT_PRACTICE:Record<string,string>={
"sky-north":"Use a controlled shot toward the open corner. Accuracy matters more than power.",
"sky-west":"A balanced ready stance helps the keeper push sideways toward the ball.",
"sky-plaza":"Keep your balance and arms relaxed. Protect the ball without shoving the opponent.",
"sky-east":"Choose one helpful next action, such as encouraging a teammate. One mistake does not define your game.",
"sky-pier":"Offer a hand if they want help. Competing hard and showing care belong together.",

 store:'Before receiving, where would you look for pressure? Predict the safe side, then reveal the scan.',
 coaches:'Which foot supports your balance, and which surface strikes the ball? Predict before revealing the pass.',
 garden:'Which teammates should move wider to stretch this defender?',
 market:'Keep the receiver still. Where could the ball carrier dribble to open the pass?',
 museum:'Name a supporter tradition that connects a club to its community.',
 terrace:'How could you arrange your feet to stay balanced with two directions available?',
 roof:'Find the defensive, midfield and attacking lines. Which group connects the other two?',
 ferry:'Where would a pass stop if it were too soft? Compare that with the receiver’s control space.',
 beach:'Would a bouncing or rolling pass be easier to control in this clear short lane?',
 north:'When should this runner start so the ball and player reach the space together?',
 'wall-right':'Picture one gentle left-foot pass and one right-foot pass to the same target.',
 'garden-cafe':'After this pass, where could you offer support without demanding the ball back?',
 'market-north':'Remember the defender’s first position. Check again—does the same space stay safe?',
 school:'Which direction for the first touch prepares the next action?',
 northwest:'How should the receiver turn to see both the passer and the next option?',
 pier:'Find the far-side teammate before revealing the switch.',
 club:'Choose a spot ahead of the moving receiver, rather than where they stand now.',
 'dock-entry':'Where can a supporting teammate offer an escape when forward routes close?',
 'west-market':'When would a sudden burst create a gap from the marker?',
 library:'Which change of direction moves the runner into the passer’s view?',
 'store-roof':'Which foot is farther from the defender? Predict where it can guide the ball.',
 'arcade-roof':'After giving the pass, where must the runner go to receive beyond the defender?',
 'junior-roof':'Move the teammates in your mind to make two different passing angles.',
 'books-roof':'Find the pocket between the two defensive lines.',
 'museum-roof':'If the marker follows the runner, which teammate gains an open lane?',
 'grass-west':'Which first movement could tempt the marker away before you check back?',
 'grass-junior':'Check the runner at the moment of the pass. Should they cross the line yet?',
 'grass-garden':'A cannot reach C directly. Which teammate connects them, and when should C move?',
 'grass-community':'Which sideways movement takes the receiver out of the defender’s shadow?',
 'ramp-gap':'After the block, where will the loose ball travel? Predict the new meeting point.',
 'wall-books':'Is the ground route blocked? Decide whether a lofted route is useful here.',
 'wall-nova':'Choose B’s next pass before the ball arrives. Can B redirect it with one contact?',
 'wall-garden':'Should the receiving foot stay rigid or give slightly with this firm pass?',
 'wall-library':'Which receiving foot would you point to when asking for this pass?',
 'wall-arts':'Look toward one option. Which other accurate pass might surprise the defender?',
 'wall-community':'Trace a curved run that stays visible around the marker.',
 'parcel-north':'Compare too close, too far and useful support. Which distance fits this pressure?',
 'parcel-west':'Is carrying the ball through pressure necessary when this teammate is already beyond it?',
 'parcel-school':'What would you call before the receiver’s touch: “Time” or “Man on”?',
 'parcel-south':'Who should delay the new attacker, and who should recover toward goal?',
 'high-humanities':'Place one option ahead and one behind the carrier. What does each offer?',
 'high-school':'Can one defender screen both options? Predict how different depths change that.',
 'high-classrooms':'Choose the pressing defender and the covering defenders. Who changes roles after the pass?',
 'high-visitor':'If the attacker stretches the last line, where might a teammate find room underneath?',
 'high-mercado':'When the defender approaches the carrier, which teammate becomes free?',
 'high-nova':'One teammate is already wide. Which inside lane gives support without crowding?',
 'high-deli':'After the pass, which two positions must change to support the new carrier?',
 'high-apartments':'The direct switch is blocked. Which supporting player can connect the two sides?',
 'high-clubgrounds':'Who should leave this pocket so another player can arrive into it?',
 'high-promenade':'Where should the defender recover to stand between the attacker and their own goal?',
 'manhole-promenade':'Count the defenders near each teammate. Which one is standing alone?',
 'manhole-rua-90':'Where is the gap between the two defenders? Where should your teammate stand to use it?',
 'manhole-cafe-mare':'Before the easy sideways pass, is anyone free further up the pitch?',
 'manhole-visitor-centre':'If everyone attacks, who stops a quick counter? Choose your safety player.',
 'manhole-classrooms':'Move four teammates into a diamond. Which corner is the defender not covering?',
 'manhole-rua-nova':'Which third is the ball in? Should this player play safe or be brave?',
 'manhole-fish-market':'Where can the runner stand so the defender watching the ball cannot see them?',
 'manhole-park-library':'Which way should you run around the winger to make the defender choose?',
 'manhole-island-market':'Where should the defender stand to steer the dribbler toward the touchline?',
 'manhole-courtside':'Send one runner to each space: near post, far post and penalty spot. Who will be free?',
 'manhole-west-market':'When the defenders run back toward goal, where does the space open?',
 'manhole-corner-deli':'You just won the ball. Where is the space the other team left behind?',
 'manhole-west-end-books':'Where must opponents wait at a 7v7 goal kick? Where should your defenders go?',
 'manhole-junior-club':'Which teammate should check short, and which should run down the line?',
 'manhole-arcade':'Draw a line from the ball to the striker. Where should the defender stand?',
 'manhole-nursery':'After two quick passes, where does a gap open between the defenders?',
 'manhole-high-school':'Which way should you curve your press to block the pass to the other opponent?',
 'manhole-community-hall':'The opponents just passed backward. What should the whole defensive line do?',
 'manhole-garden-cafe':'Nobody is pressing you and the space ahead is empty. Carry or pass? When does that change?',
 'manhole-arts-wing':'Lift your head in your mind. Which teammate and which space can you see now?',
 'manhole-courtyard':'Where should the keeper stand when the defence is high up the pitch?',
 'manhole-pier-bakery':'The wall covers one side of the goal. Where should the keeper stand?',
 'manhole-humanities':'Watch the first touch. Is it close to the feet, or is this the moment to press?',
 'manhole-school-offices':'The defence is not ready yet. Who is unmarked for a quick restart?',
 'manhole-history-museum':'Shoot from the tight angle, or pass? Find the teammate with the clearer view.',
};
