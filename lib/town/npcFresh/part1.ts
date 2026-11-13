import type {NpcFresh,FreshTopic,NpcChallenge} from '../npcFreshTypes';
/** Fresh chat content, shard 1 (Nov 1 2026): island regulars and garden crew. */
const T=(id:string,question:string,answer:string,fq?:string,fa?:string):FreshTopic=>fq&&fa?{id,question,answer,followUp:{question:fq,answer:fa}}:{id,question,answer};
const C=(id:string,prompt:string,options:[string,string,string],correct:0|1|2,right:string,wrong:string):NpcChallenge=>({id,prompt,options,correct,right,wrong});
const N=(topics:FreshTopic[],challenges:NpcChallenge[],openers:string[],returning:string[]):NpcFresh=>({topics,challenges,openers,returning});

export const PART_1:Record<string,NpcFresh>={
 rosa:N([
  T(`futsal-five`,`How many players are on a futsal team?`,`Five on court at once, and one of them is the goalkeeper. With so few players, you are part of every move, even without the ball.`,`Can we swap players during the game?`,`Yes, as often as you like. Futsal uses rolling substitutions, so players hop on and off in a special zone while play carries on.`),
  T(`futsal-ball`,`Why does the futsal ball feel heavy?`,`It is a size 4 ball with less bounce than a grass ball. It stays low on a hard court, so passing and stopping it on the floor gets easier.`,`Can I practise with it outside?`,`Sure, on any flat surface. Roll it under your sole and feel how it stays put instead of hopping away like a bouncy ball.`),
  T(`kick-in`,`What is a kick-in?`,`When the ball crosses the sideline in futsal, you restart with your foot, not your hands. The ball sits still on the line and you pass it back into play.`,`Do I get lots of time to take it?`,`No. Once you are ready you have four seconds, so pick your teammate before you even reach the ball.`),
  T(`pivot-role`,`What is a pivot in futsal?`,`The pivot is the player closest to the other goal. They hold the ball with their back to goal so teammates can arrive and join the attack.`,`Is that a hard job?`,`It takes strong balance and calm feet. A good pivot uses their body like a shield, then sets the ball off with one clever touch.`),
  T(`fixo-role`,`What does the fixo do?`,`The fixo is the deepest outfield player, a defender who also starts attacks. They often get the ball first and choose where it goes next.`,`Can the fixo score goals?`,`Absolutely. Every futsal player attacks and defends, so the fixo might pop up with a shot from distance when the court opens.`),
  T(`sole-steering`,`Why do futsal players use the sole?`,`On a smooth court the sole can stop, drag and roll the ball in tiny spaces. It is like having a steering wheel under your shoe.`),
  T(`team-fouls`,`What happens if a team fouls a lot?`,`Futsal counts each team's fouls in every half. After five, every extra one gives the other team a direct free kick with no wall, so careful defending matters.`,`So defenders should stay calm?`,`Exactly. Stay on your feet, guide the attacker toward the side and wait for a loose touch instead of diving in.`),
  T(`futsal-clock`,`How long does a futsal game last?`,`Grown-up futsal has two halves of twenty minutes, and the clock stops whenever the ball is out of play. Youth games are often shorter.`)
 ],[
  C(`c-kick-in`,`The ball rolls over the futsal sideline. How does your team restart?`,[`Throw it in with two hands`,`Kick it in from the line`,`Bounce it to the goalkeeper`],1,`Yes! Futsal uses a kick-in with the ball resting on the line, so your feet do the work.`,`Not in futsal. The sideline restart is a kick-in, taken with the ball still on the line.`),
  C(`c-four-count`,`You are taking a futsal corner. How long do you have once you are ready?`,[`About four seconds`,`As long as you need`,`Ten whole seconds`],0,`Right. Futsal restarts use a four-second count, so plan the pass before you get there.`,`Futsal is quicker than that. Restarts use a four-second count, and waiting too long hands the ball to the other team.`),
  C(`c-rolling-subs`,`Your futsal teammate is very tired. What can your team do?`,[`Wait until half-time to swap`,`Swap only after someone scores`,`Swap during play in the sub zone`],2,`Exactly. Futsal has rolling substitutions, so a fresh player can come on while the game keeps moving.`,`No need to wait in futsal. Players swap on the move through the substitution zone as often as the team needs.`),
  C(`c-pivot-help`,`Your pivot has their back to goal and a defender close behind. What helps most?`,[`Sprint away to the far corner`,`Arrive close for a short lay-off`,`Stand still and watch them`],1,`Nice. The pivot shields the ball, so a teammate arriving nearby gives them a quick, easy pass.`,`That leaves the pivot on their own. Getting close for a short lay-off turns their shielding into an attack.`)
 ],[
  `The rooftop court is swept and the ball is waiting. Five players, tiny space, big ideas. Ready to think fast?`,
  `I just timed my team's kick-ins with a stopwatch. Four seconds goes by quicker than you would believe!`,
  `Futsal tip of the day from the rooftop: the bottom of your shoe is a secret tool. Want to hear more?`,
  `My hands are covered in chalk from drawing court diagrams. Come and quiz me about futsal positions.`
 ],[
  `You asked me {topic} last time on the rooftop. Now I have a faster futsal idea for you.`,
  `Remember when you asked {topic} I kept thinking about it during my coaching session.`,
  `Back on the court already? After {topic} the next step is playing with fewer touches.`
 ]),

 sam:N([
  T(`winners-stay`,`What does 'winners stay on' mean?`,`In big pickup groups, the team that scores first stays on and the next team comes in. Short games mean nobody waits long on the side.`,`Is that fair for the losing team?`,`It works if games are quick, like first to two goals. You can also swap players around so every team has a chance.`),
  T(`bag-goals`,`Can we make goals out of bags?`,`Yes, jumpers, bags or water bottles all work. Agree how wide the goal is and whether shots above knee height count before you start.`,`What if we argue about a goal?`,`Use a quick rule, like a goal only counts below the height of the bags. Simple rules settle most arguments fast.`),
  T(`who-kicks-off`,`How do we decide who kicks off?`,`Any fair way works: a coin, rock paper scissors, or the team that conceded last starts. The important part is everyone agrees first.`),
  T(`own-calls`,`Who calls fouls when there is no referee?`,`Players call their own fouls and handballs. If you know you tripped someone, say so and give the ball back.`,`What if someone never admits it?`,`Talk calmly and remind everyone of the rule you agreed. Most pickup groups stay friendly because players are honest with each other.`),
  T(`mixed-ages`,`What if little kids join our pickup game?`,`Play gentler shots and give them easy passes. A big kid showing patience makes the game better for everyone.`,`Should they go in goal?`,`Only if they want to. Let them try outfield too, because touching the ball is what makes football fun.`),
  T(`rotate-keeper`,`Nobody wants to be keeper. What do we do?`,`Rotate it, like a turn after every goal conceded. Everyone learns what it feels like, and you all become better shooters too.`,`Does being keeper help my outfield game?`,`Yes. You learn where shots are hard to save, so you start aiming for those spots when you attack.`),
  T(`first-to-three`,`How long should a pickup game be?`,`Many groups play first to three goals or ten minutes, whichever comes first. Quick games keep energy high and let people rest between.`,`What if one team keeps winning?`,`Swap one strong player across. A close game is more fun than a big score for either team.`),
  T(`pickup-space`,`Where is a good place for pickup?`,`Pick a flat, open space away from roads and windows where football is allowed. Check for holes or glass before you begin.`)
 ],[
  C(`c-bunching`,`In your pickup game, everyone crowds around the ball. What helps your team most?`,[`Everyone chases the ball harder`,`Kick it high in the air`,`Spread out so passes are open`],2,`Yes. Spreading out gives the player on the ball easy passes and makes the pitch feel bigger.`,`Crowding the ball blocks your own passes. Spreading out creates space and open teammates.`),
  C(`c-lost-ball`,`Your team just lost the ball near you. What is a good first action?`,[`Press the new ball carrier quickly`,`Walk back slowly`,`Ask for a restart`],0,`Right. The nearest player pressing fast can win it back before the other team gets organised.`,`Waiting gives the other team time to settle. A quick press by the closest player is the best first step.`),
  C(`c-honest-call`,`You accidentally handled the ball in a pickup game with no referee. What should you do?`,[`Keep playing and hope nobody saw`,`Say so and give the ball back`,`Blame the bumpy ground`],1,`Great sportsmanship. In pickup games, honest calls keep the game fair and friendly for everyone.`,`Without a referee, players have to call their own handballs. Owning it keeps the game fair.`),
  C(`c-quiet-player`,`One player has barely touched the ball. How can you help them join in?`,[`Tell them to try harder`,`Only pass to the best player`,`Look for them with an easy pass`],2,`Exactly. A simple pass to a quiet teammate builds their confidence and gives your team another option.`,`Leaving someone out makes your team smaller. An easy pass invites them into the game.`)
 ],[
  `Pickup starts in five minutes and we need one more. Want to talk football while we wait?`,
  `I just won rock paper scissors for kick-off. Best start to a pickup game ever. What is up?`,
  `My water bottle is a goalpost today, so please do not kick it. Got a football question?`,
  `We played first to three twice already this morning. My legs need a chat break. Ask me anything.`
 ],[
  `Last pickup you asked me {topic} I have another tip from today's game.`,
  `You are back! I remember you wanted to know {topic} Let me tell you something new.`,
  `Good to see you again. Since you asked {topic} here is another Old Town idea.`
 ]),

 maya:N([
  T(`area-hands`,`Where can a goalkeeper use their hands?`,`Only inside their own penalty area. Step outside it and a keeper has to play like everyone else, with feet, chest and head.`,`What if the keeper catches it just outside?`,`That counts as a handball, so the other team gets a free kick. Keepers check their position all the time for this reason.`),
  T(`back-pass`,`Can a keeper pick up a pass from a teammate?`,`Not if a teammate kicks it to them on purpose. Then the keeper must use their feet, which is why keepers practise passing too.`,`What if the teammate heads it back?`,`A header or chest pass back can be picked up. The rule is only about passes kicked with the foot.`),
  T(`keeper-colours`,`Why does the keeper wear a different shirt?`,`The rules say keepers must wear colours that look different from every other player. Then the referee can see instantly who is allowed to handle the ball.`),
  T(`ready-stance`,`What is the ready position for keepers?`,`Feet about shoulder-width apart, knees bent, weight on the front of your feet, hands out in front. From there you can spring any direction.`,`When should I get into it?`,`Just before the shot. Take a small hop as the attacker is about to kick so your feet are planted at the right moment.`),
  T(`narrow-angle`,`What does narrowing the angle mean?`,`When an attacker runs at you, step out toward the ball. The goal looks smaller to them because your body covers more of it.`,`Can I come out too far?`,`Yes. Then they can lift the ball over you. Move out in control and stay balanced so you can still react.`),
  T(`throw-or-kick`,`Should keepers throw or kick the ball?`,`A throw is often more accurate for a nearby teammate. A kick goes further but is harder to aim, so pick based on who is free.`,`Which throw goes the furthest?`,`An overarm throw, swinging your arm like a bowler, can travel a long way. Rolling it is best for short, smooth passes.`),
  T(`penalty-line`,`Where must a keeper stand for a penalty?`,`On the goal line between the posts, with at least part of one foot touching or level with the line when the kick is taken. They can move side to side before it.`,`Can the keeper wave their arms?`,`They can move, but they must not delay the kick or distract unfairly. Calm and ready usually works better than wild waving.`),
  T(`keeper-gloves`,`Why do keepers wear gloves?`,`Gloves help you grip the ball and protect your fingers from hard shots. They are part of the kit, not a superpower.`)
 ],[
  C(`c-back-pass`,`Your defender kicks the ball back to you on purpose. What should you do?`,[`Play it with your feet`,`Pick it up and throw it`,`Catch it and hold it`],0,`Correct. A deliberate kicked pass from a teammate cannot be handled, so keepers use their feet.`,`Picking it up would give the other team a free kick. A deliberate kicked back pass must be played with your feet.`),
  C(`c-outside-area`,`The ball bounces just outside your penalty area. What can you use?`,[`Only your hands`,`Your feet, chest or head`,`Anything at all`],1,`Yes. Outside the penalty area a keeper plays like an outfield player and cannot handle the ball.`,`Outside the area a keeper's hands are not allowed. Feet, chest and head are the right tools there.`),
  C(`c-one-on-one`,`An attacker dribbles at you alone. What makes the goal look smaller to them?`,[`Stay glued to the goal line`,`Turn around and look at the net`,`Step out in control toward the ball`],2,`Great choice. Stepping out narrows the angle, so your body covers more of the goal.`,`Staying back leaves big gaps. Stepping out toward the ball shrinks the target for the attacker.`),
  C(`c-keeper-shirt`,`Why must a goalkeeper's shirt look different from everyone else's?`,[`So officials see who can handle the ball`,`Because keepers like bright colours`,`To confuse the attackers`],0,`Exactly. A clear colour lets the referee spot the one player allowed to use their hands.`,`It is about fairness, not fashion. Officials must see straight away who is allowed to handle the ball.`)
 ],[
  `Gloves on, goal line checked. A keeper's day starts with a quick look at both posts. What can I help with?`,
  `I practised catching high balls all morning and only dropped one. Want a goalkeeping secret?`,
  `From my goal I can see every player on the pitch. Ask me what I noticed today.`,
  `My gloves are drying in the sun after training. Perfect time for a goalkeeper chat.`
 ],[
  `You asked me {topic} before. Here is another trick from inside my penalty area.`,
  `Welcome back! Since you wanted to know {topic} let me add a keeper detail.`,
  `I still remember your question {topic} Today I have a new goalkeeping idea.`
 ]),

 priya:N([
  T(`eleven-time`,`How long is an 11v11 match?`,`Grown-up matches have two halves of forty-five minutes with a break in between. Youth games are usually shorter, depending on age.`,`Where do the extra minutes come from?`,`The referee adds extra minutes at the end of each half for time lost to injuries, substitutions and other stops.`),
  T(`midfield-types`,`Are all midfielders the same?`,`No. Some sit deep to protect the defence, some link play in the middle, and some push forward to create chances. Each needs different habits.`,`Which one should I try?`,`Try all of them in training. Each role teaches you something new about space and timing.`),
  T(`open-body`,`What is an open body shape?`,`Stand side-on when receiving, so you can see the ball and the pitch ahead at the same time. It makes turning forward much quicker.`,`How can I train that shape?`,`Receive passes with your back foot, the one further from the passer. That naturally opens your hips toward the field.`),
  T(`half-turn`,`What is a half-turn?`,`It is receiving the ball while already turning, so your first touch takes you forward. You need to have scanned first to know it is safe.`),
  T(`own-half-offside`,`Can I be offside in my own half?`,`No. In 11v11, you cannot be offside if you are in your own half when the pass is played. Offside only applies in the other team's half.`,`What about from a throw-in?`,`You cannot be offside straight from a throw-in, corner kick or goal kick. Those restarts are free of the offside rule.`),
  T(`through-ball`,`What is a through ball?`,`A pass played into space behind the defenders for a teammate to run onto. It needs good timing from both the passer and the runner.`,`What makes it hard?`,`The pass must be strong enough to get past defenders but soft enough for your teammate to reach before the keeper does.`),
  T(`big-pitch-energy`,`How do I stay fresh on a big pitch?`,`Pick your sprints. Jog to keep your position, then sprint when the ball or the space really needs you.`,`Do pros walk during games?`,`Yes, lots. Smart players walk and jog to recover, saving their speed for the moments that matter.`),
  T(`shoulder-check`,`What is a shoulder check?`,`A quick glance over your shoulder before the ball arrives. It tells you if someone is behind you, so you know whether to turn.`)
 ],[
  C(`c-throw-offside`,`A teammate throws the ball to you while you are behind every defender. Are you offside?`,[`Yes, always offside`,`No, not from a throw-in`,`Only if you score`],1,`Correct. You cannot be offside directly from a throw-in, so that run is allowed.`,`Throw-ins are special. A player cannot be offside straight from a throw-in.`),
  C(`c-receive-foot`,`You want to receive and turn forward quickly. Which foot should take the pass?`,[`The foot closest to the passer`,`Neither, use your knee`,`The foot further from the passer`],2,`Nice. Receiving on your back foot opens your body, so you can see forward and turn fast.`,`The front foot closes your body toward the passer. The back foot opens you up to the field.`),
  C(`c-own-half`,`You are in your own half when the pass is played, behind the defenders. Is it offside?`,[`No, never in your own half`,`Yes, behind defenders is offside`,`Only in the second half`],0,`Right. Offside only applies in the opponents' half, so you are fine.`,`Offside cannot happen in your own half. Where you stand when the ball is played is what counts.`),
  C(`c-sprint-choice`,`Your team is passing calmly at the back. What should a midfielder do?`,[`Sprint around everywhere`,`Find a good angle and save energy`,`Stand still and rest`],1,`Exactly. Moving into a passing angle without sprinting keeps you useful and fresh for later.`,`Sprinting non-stop tires you out and standing still helps nobody. Find an angle and save your speed.`)
 ],[
  `I just counted my shoulder checks in training: twelve before one pass! Want to know why?`,
  `Eleven Park looks huge from midfield. Come stand here and ask me something.`,
  `My coach gave me a new role this week, deeper in midfield. Ask me what changed.`,
  `I am stretching after a long 11v11 session. A football chat sounds perfect right now.`
 ],[
  `You asked me {topic} last time at Eleven Park. Here is a fresh midfield idea.`,
  `Welcome back! After {topic} I want to tell you about another big-pitch habit.`,
  `I remember your question {topic} Let me add something from today's training.`
 ]),

 okafor:N([
  T(`fair-play-out`,`Why do players kick the ball out for injuries?`,`If someone is hurt and play is stopped this way, the other team usually gives the ball back afterward. It is a fair play tradition, not a written rule.`,`Do all players do it?`,`Most do, because it shows respect. The referee can also stop play for a serious injury.`),
  T(`referee-final`,`Can a player change the referee's mind?`,`Arguing rarely helps. The referee's decision on what happened is final once play restarts, so it is better to focus on the next action.`,`What if I think they got it wrong?`,`Take a breath. Your captain can ask politely, but your energy is better spent helping your team.`),
  T(`handshake`,`Why do teams shake hands at the end?`,`It shows that the game was a contest, not a fight. Thanking the other team and the officials is part of football everywhere.`,`What if we lost badly?`,`Shake hands anyway. It is hard, but it shows strength and respect that people remember.`),
  T(`old-laws`,`Were football rules always the same?`,`No. The rules have changed many times over the years. Early games had very different ideas about passing, keepers and even the shape of goals.`,`Who changes the rules now?`,`An international board meets to update the Laws of the Game. They test ideas carefully before changing anything.`),
  T(`learn-watching`,`Can I get better by watching games?`,`Yes, if you watch on purpose. Pick one player and follow them for five minutes, especially when they do not have the ball.`),
  T(`rest-days`,`Do footballers need rest days?`,`Yes. Your body gets stronger while it recovers. Sleep, water and good food are part of training too.`,`What fun things suit a rest day?`,`Watch a game, juggle gently or just play something different. Rest can still be fun.`),
  T(`good-winner`,`How do I win without showing off?`,`Celebrate with your team, then thank the other side. Remember how it felt when you lost, and be kind about it.`,`Is celebrating a goal okay?`,`Of course. Enjoy it with teammates, and keep it friendly toward the other team.`),
  T(`ten-thousand`,`How did old players learn without coaches?`,`Many learned in streets and parks, playing for hours with friends. Lots of touches and lots of fun built their skills.`)
 ],[
  C(`c-injury-ball`,`The other team kicked the ball out so your injured teammate could get help. What is fair now?`,[`Keep the throw and attack fast`,`Argue with the referee`,`Give the ball back to them`],2,`Well done. Returning the ball after an injury stop is a fair play tradition players respect.`,`That would break a fair play tradition. When they stop play for your teammate, give the ball back.`),
  C(`c-bad-call`,`You think the referee made a wrong call. What helps your team most?`,[`Shout at the referee`,`Focus on the next play`,`Stop playing in protest`],1,`Exactly. The decision will not change, but your next action can still help your team.`,`Arguing wastes energy and can earn a card. Moving on to the next play helps your team more.`),
  C(`c-teammate-down`,`A player from the other team falls hard near you. What is a kind first step?`,[`Check if they are okay`,`Step over them and keep going`,`Laugh with your friends`],0,`Right. Checking on any player shows respect, which matters as much as skill.`,`Football is played between people who respect each other. Checking they are okay is the right move.`),
  C(`c-after-loss`,`Your team lost a close match. What is a good thing to do at the end?`,[`Walk away without speaking`,`Blame the goalkeeper`,`Shake hands and thank the other team`],2,`Great. Shaking hands shows respect, and it helps you learn from the game calmly.`,`Blaming or ignoring others hurts the team. Shaking hands shows strength and good sportsmanship.`)
 ],[
  `Come, sit a while. I watched three games today and each one taught me something different.`,
  `I have been thinking about fair play this morning. Shall we talk about it?`,
  `Every player on this island has a story. I would love to hear yours, then share some advice.`,
  `My old notebook is full of things I learned from watching. Ask me anything you like.`
 ],[
  `You once asked me {topic} I have thought of something more since then.`,
  `Good to see you again, young friend. After {topic} there is a deeper lesson to share.`,
  `Ah, you are back. Your question {topic} reminded me of another story.`
 ]),

 leo:N([
  T(`barefoot-beach`,`Do beach soccer players wear boots?`,`No, beach soccer is usually played barefoot. Soft sand is gentle on feet and makes you control the ball with real care.`,`Does that hurt?`,`It can feel strange at first. Players often use toe tape or ankle socks for comfort.`),
  T(`drag-back`,`What is a drag-back?`,`Put your sole on top of the ball and roll it back toward you. It is a quick way to stop, change direction or escape a tackle.`,`When should I use it?`,`When a defender rushes at you. Pull the ball back, and they often run straight past.`),
  T(`step-over`,`How does a step-over work?`,`You swing your foot around the ball without touching it. The defender thinks you are going one way, then you push off the other way.`,`Do I need to be fast?`,`Not really. Selling the fake with your shoulders matters more than speed of feet.`),
  T(`inside-outside`,`What is the inside-outside touch?`,`Tap the ball with the inside of your foot, then the outside of the same foot. It keeps the ball close and helps you wriggle past tight spaces.`),
  T(`shoulder-fake`,`Can I trick a defender with my body?`,`Yes. A dip of your shoulder can make a defender lean the wrong way. Then you go the other way with your first touch.`,`Can I rehearse the shoulder dip?`,`Use a cone as your defender. Dip, then push the ball past it, and do it on both sides.`),
  T(`juggling-start`,`How do I start juggling?`,`Drop the ball onto your foot, kick it up softly, and catch it. Then try two touches before catching, then three.`,`Which part of the foot?`,`Use your laces with your toes pointed a little. A flat foot keeps the ball going straight up.`),
  T(`hook-turn`,`What is a hook turn?`,`Pretend to kick, then hook the ball back behind your standing leg with the inside of your foot. You turn and change direction in one move.`,`Is it hard?`,`It takes practice. Start slowly while walking, then add speed when the hooking feels smooth.`),
  T(`skill-time`,`Is practising skills alone useful?`,`Yes. Alone you can repeat a move many times. Then try it in a small game to see when it really works.`)
 ],[
  C(`c-drag`,`A defender rushes at you fast. Which move uses their speed against them?`,[`A drag-back to stop and turn`,`Kick the ball straight at them`,`Sit down on the ball`],0,`Yes. A drag-back pulls the ball away just as they arrive, so they run past.`,`That gives the ball away. A drag-back stops you suddenly and lets their momentum carry them past.`),
  C(`c-step-sell`,`What makes a step-over fool a defender?`,[`Doing it very slowly`,`Shouting before you do it`,`Selling it with your shoulders`],2,`Exactly. Your shoulders and hips make the fake believable, not just your feet.`,`Speed and noise do not fool defenders. Moving your shoulders makes the fake convincing.`),
  C(`c-team-trick`,`Your teammate is free and you could try a trick. What is usually best?`,[`Do the trick anyway`,`Pass to your free teammate`,`Stop and wait`],1,`Smart. When a teammate is free, a simple pass is often the strongest choice.`,`A trick is great when it helps. If a teammate is free, passing usually helps the team more.`),
  C(`c-sand-touch`,`Why does practising on sand help your touch?`,[`It makes you use soft, careful touches`,`The ball bounces higher`,`You never have to run`],0,`Right. Sand slows the ball, so you learn gentle touches that also work on grass.`,`Sand actually stops bounces and makes running harder. It teaches soft, careful control.`)
 ],[
  `Sand between my toes and a ball at my feet. Want to learn a beach skill?`,
  `I finally landed a smooth hook turn today. Ask me how!`,
  `The tide is out and the sand is perfect for touches. What are you curious about?`,
  `I am counting juggles by the water. My best today is twenty-three. Want a tip?`
 ],[
  `You asked me {topic} last time on the beach. I have a new skill to show you.`,
  `Back again! After {topic} you are ready for the next beach move.`,
  `Nice to see you. Your question {topic} made me practise even more.`
 ]),

 amina:N([
  T(`coin-toss`,`What does the captain do at the coin toss?`,`The captains meet the referee and call the coin. The winning team chooses which end to attack or decides who takes kick-off.`,`Does winning the toss matter?`,`A little, like choosing to play with the wind first. Mostly it is a fair way to start.`),
  T(`captain-referee`,`Can the captain overrule the referee?`,`No. A captain has no special power over decisions, but they help keep their team calm and respectful.`,`So what is the captain's job?`,`Lead by example, encourage teammates, and help everyone stay focused when things get tense.`),
  T(`team-huddle`,`What do you say in a team huddle?`,`Keep it short: one goal for the team, one reminder for each line, and something encouraging. Then everyone shouts together.`,`Can someone else speak?`,`Yes. A good captain invites others to share, especially if they noticed something important.`),
  T(`warm-up-lead`,`Does a captain lead the warm-up?`,`Often they help. A warm-up with gentle running, stretches and passing gets bodies ready and helps the team feel together.`),
  T(`press-signal`,`How does a team know when to press?`,`Teams agree on a trigger, like a bad touch or a pass to the side. When it happens, the nearest players press together.`,`What if only one person presses?`,`Then the other team just passes around them. Pressing works best when teammates go at the same time.`),
  T(`wall-organise`,`Who sets up the wall at a free kick?`,`Often the goalkeeper tells players where to stand, and the captain helps organise them quickly.`,`How far back does the wall stand?`,`In 11v11, defenders must be at least about nine metres from the ball until it is kicked.`),
  T(`mistake-support`,`What do you do when a teammate makes a mistake?`,`Say something kind right away, like 'next one'. A quick reset helps them play freely again.`,`What if they keep making mistakes?`,`Talk calmly at a break about one small thing to try. Everyone has tough days.`),
  T(`armband-share`,`Can we take turns being captain?`,`Yes, many youth teams rotate the armband. It teaches everyone how to lead and listen.`)
 ],[
  C(`c-toss`,`Your captain wins the coin toss. What can they choose?`,[`Which end to attack or who kicks off`,`Who gets a penalty`,`How long the match lasts`],0,`Correct. The toss winner picks an end to attack or chooses to take the kick-off.`,`The toss only decides ends or kick-off. Penalties and match length are set by the rules.`),
  C(`c-press-together`,`Your team wants to win the ball high up the pitch. What makes pressing work?`,[`One player chases every ball`,`Teammates press together on a signal`,`Everyone waits at the back`],1,`Exactly. A shared trigger lets several players press at once and close passing options.`,`One player alone is easy to pass around. Pressing works when the team moves together.`),
  C(`c-captain-calm`,`The referee gives a decision your team dislikes. What should a captain do?`,[`Lead the team in shouting`,`Leave the pitch`,`Help teammates stay calm`],2,`Right. A good captain keeps the team focused on the next play, not the argument.`,`Shouting can earn cards and leaving helps nobody. Calming the team is real leadership.`),
  C(`c-wall-distance`,`At an 11v11 free kick, how close can the wall stand?`,[`Right next to the ball`,`One step away`,`About nine metres away`],2,`Yes. Defenders must be about nine metres from the ball until it is kicked.`,`Too close is not allowed. The wall must stand about nine metres away in 11v11.`)
 ],[
  `Our West Market team meets in ten minutes. I am planning the huddle words. Want to help?`,
  `I just gave the armband to a younger teammate for today. Ask me why!`,
  `Captains listen first. So, what is on your mind today?`,
  `The market is busy, but there is always time for football talk. What shall we discuss?`
 ],[
  `You asked me {topic} last time. I have another captain's tip for you.`,
  `Great to see you again. After {topic} here is something about leading a team.`,
  `I remember your question {topic} Let me share what happened at our last game.`
 ]),

 diego:N([
  T(`formation-numbers`,`What do formation numbers mean?`,`They count outfield players from defence to attack. A 4-3-3 has four defenders, three midfielders and three forwards, plus the keeper.`,`Why is the keeper not counted?`,`Every team has exactly one keeper, so leaving them out makes the numbers simpler.`),
  T(`triangle-why`,`Why are triangles so useful?`,`A triangle gives the player on the ball two passing options at different angles. If one is blocked, the other is often open.`,`How big should a triangle be?`,`Big enough that one defender cannot cover two players, small enough for a safe pass.`),
  T(`compact-defence`,`What does compact mean in defence?`,`Players stay close together so there are no big gaps between them. It makes passing through the middle much harder.`,`What happens to the sides?`,`The other team may get space wide. Compact teams then shift across together as the ball moves.`),
  T(`high-low`,`What is a high press and a low block?`,`A high press means defending far up the pitch to win the ball early. A low block means sitting deep and protecting your goal.`,`Which one is better?`,`Neither always. Teams choose depending on the score, the opponent and how tired they are.`),
  T(`overload`,`What is an overload?`,`It means having more players than the other team in one area, like three against two. It makes it easier to keep the ball or create a chance.`),
  T(`third-man`,`What is a third-runner move?`,`Player A passes to B, while C runs into space. B then plays the ball to C, who arrives with time and room.`,`Why does it work?`,`Defenders watch the ball and the first pass. The third runner often moves without being noticed.`),
  T(`diamond-mid`,`What is a midfield diamond?`,`Four midfielders shaped like a diamond: one deep, two wide-ish, one at the top. It gives lots of central passing options.`,`What is its weakness?`,`The sides can be open. Full-backs often need to push forward to add width.`),
  T(`notebook-sketch`,`How do you draw tactics in a notebook?`,`Draw the pitch, use dots for players and arrows for movement. Dashed lines can show passes.`)
 ],[
  C(`c-formation`,`How many outfield players are in a 4-4-2?`,[`Eight players`,`Twelve players`,`Ten players`],2,`Correct. Four plus four plus two makes ten, and the keeper makes eleven.`,`Add the numbers: 4 + 4 + 2 = 10 outfield players. The keeper is extra.`),
  C(`c-compact`,`The other team keeps passing through the middle of your defence. What helps?`,[`Spread everyone very wide`,`Stay compact and close gaps`,`Send everyone forward`],1,`Yes. A compact shape removes the gaps that central passes travel through.`,`Spreading out creates more gaps. Staying compact closes the middle.`),
  C(`c-overload`,`Your team has three players against two on the left. What should you do?`,[`Use the extra player to break through`,`Switch the ball away immediately`,`Stop and wait for help`],0,`Great. An overload means the extra player is free, so use it to move forward.`,`An overload is an advantage. Use the extra player before defenders arrive.`),
  C(`c-triangle`,`You have the ball and two teammates nearby. What shape helps passing most?`,[`All three in a straight line`,`All three in a tight huddle`,`A triangle with different angles`],2,`Exactly. A triangle gives you two passing options at different angles.`,`A line or huddle is easy to block. A triangle gives more open passes.`)
 ],[
  `I have a new sketch of a midfield diamond. Want to see how it works?`,
  `My notebook has three pages of arrows from yesterday's game. Ask me what they mean.`,
  `Library Square is quiet today, perfect for tactics talk. What shall we draw?`,
  `I am counting triangles in the game I just watched. I found fifteen! Ask me something.`
 ],[
  `You asked me {topic} before. I drew a new diagram about it.`,
  `Welcome back to Library Square. After {topic} here is another tactical idea.`,
  `I remember your question {topic} My notebook has more on that now.`
 ]),

 jules:N([
  T(`level-onside`,`If I am level with a defender, am I offside?`,`No. Being level with the second-last defender is onside. You are only offside if you are nearer the goal than both the ball and that defender.`,`What about the keeper?`,`The keeper usually counts as one of the last two players, so watch the defenders' line.`),
  T(`cutback`,`What is a cutback?`,`When you reach the end line, you pass the ball back across the box. Teammates arriving can shoot facing the goal.`,`Why not cross high?`,`A cutback along the ground is easier to strike, and defenders running back toward their goal struggle to block it.`),
  T(`overlap`,`What is an overlapping run?`,`A teammate runs around the outside of the winger with the ball. The defender has to choose who to follow.`,`What should the winger do?`,`Hold the ball a moment to draw the defender, then pass into the runner's path.`),
  T(`stay-wide`,`Why do wingers stay near the touchline?`,`Staying wide stretches the other team's defence and opens space inside for teammates.`,`What if I want to get involved?`,`Move inside when the space appears, but stay wide early so the defence spreads out.`),
  T(`change-pace`,`How do I beat a defender with speed?`,`Slow down first, then explode past them. A change of pace often beats a defender better than running fast all the time.`),
  T(`back-post`,`What is the back post?`,`It is the far post from where the cross comes. Runners there often find space because defenders watch the ball.`,`When should I go there?`,`When a teammate is crossing from the other side. Time your run to arrive as the ball does.`),
  T(`inside-winger`,`Why do some wingers play on the opposite side?`,`A right-footed player on the left can cut inside onto their strong foot to shoot or pass.`,`Is it better than staying on my side?`,`Both work. It depends on your skills and what your team needs.`),
  T(`sunset-recovery`,`What should I do after training?`,`Walk slowly, drink water and stretch gently. Your muscles recover better after a calm cool-down.`)
 ],[
  C(`c-level`,`You are exactly level with the second-last defender when the pass is played. Are you offside?`,[`No, level is onside`,`Yes, level counts as offside`,`Only if the keeper says so`],0,`Correct. Level with the second-last defender is onside, so your run counts.`,`Being level is onside. Only being nearer the goal than that defender and the ball is offside.`),
  C(`c-cutback`,`You reach the end line and defenders run toward their goal. What pass is dangerous?`,[`A high pass to the keeper`,`A pass back to your defenders`,`A cutback across the box`],2,`Great. A cutback lets teammates shoot facing goal while defenders run the wrong way.`,`The best chance is a cutback, which teammates can strike facing the goal.`),
  C(`c-overlap-choice`,`Your teammate overlaps outside you. The defender stays with you. What next?`,[`Shoot from far away`,`Pass to the overlapping teammate`,`Turn back and wait`],1,`Exactly. The defender chose you, so your overlapping teammate is free.`,`If the defender stays with you, the overlapping runner is open. Pass to them.`),
  C(`c-pace`,`A defender is matching your speed. What can help you get past?`,[`Slow down, then burst forward`,`Run even faster in a straight line`,`Stop and kick it out`],0,`Right. A change of pace catches defenders off balance.`,`Running at one speed lets them keep up. Slowing then bursting changes the timing.`)
 ],[
  `The sun is low over South Pier. Time for winger talk. Want to know about wide runs?`,
  `I tried a back-post run five times in training today and scored twice! Ask me how.`,
  `The ferry horn just sounded. Perfect timing, like a good forward run. What is up?`,
  `My legs are still buzzing from overlap drills. Got a football question for me?`
 ],[
  `You asked me {topic} by the pier last time. Here is a fresh winger idea.`,
  `Good to see you again at sunset. After {topic} I want to share another run.`,
  `I remember your question {topic} Let me add a trick from today's training.`
 ]),

 nico:N([
  T(`jockey`,`What is jockeying?`,`It means staying close to an attacker without diving in. Move backward with them, stay balanced and wait for a mistake.`,`How close should I stay?`,`About an arm's length away, so you can react quickly but not get skipped past.`),
  T(`side-on`,`Why do defenders stand side-on?`,`Standing side-on helps you move backward and turn quickly. It also guides the attacker one way.`,`Which way should I guide them?`,`Usually toward the touchline and away from the goal, where they have less space.`),
  T(`show-outside`,`What does showing them outside mean?`,`Position your body so the attacker can only go toward the sideline. The touchline then acts like an extra defender.`),
  T(`clear-or-pass`,`When should I just clear the ball?`,`When there is real danger near your goal and no safe pass. A big clearance gives your team time to reset.`,`Where should I clear it?`,`High and wide toward the touchline, away from the middle of your box.`),
  T(`fair-tackle`,`What makes a tackle fair?`,`A fair tackle plays the ball, not the player. Tripping, pushing or tackling from behind is a foul.`,`What about slide tackles?`,`They are allowed if you win the ball safely, but they are risky. Staying on your feet is usually better.`),
  T(`zonal-marking`,`What is zonal marking?`,`Each defender guards an area instead of one player. If an attacker enters your zone, you deal with them.`,`Is man marking different?`,`Yes. In man marking, you follow one attacker wherever they go.`),
  T(`set-piece-defend`,`How do defenders handle corners?`,`Each player knows their job: marking someone, guarding a zone, or covering a post. Clear talking matters.`,`What do I watch for?`,`Watch the ball and the runner near you. Move to the ball before the attacker reaches it.`),
  T(`market-patience`,`How is defending like working at the market?`,`Both need patience. You wait for the right moment instead of rushing, then you act quickly and cleanly.`)
 ],[
  C(`c-show`,`An attacker runs at you near the middle. Where should you guide them?`,[`Straight to your goal`,`Toward the touchline`,`Anywhere they want`],1,`Correct. Showing them outside reduces their space and keeps them away from goal.`,`Letting them through the middle is dangerous. Guide them toward the touchline.`),
  C(`c-stance`,`Which defending stance helps you move with an attacker?`,[`Side-on with knees bent`,`Flat-footed and square`,`Standing on tiptoes`],0,`Yes. Side-on with bent knees lets you move and turn quickly.`,`Flat or tiptoe stances are easy to beat. Side-on with bent knees is best.`),
  C(`c-danger`,`The ball is loose in your box and attackers are close. What is safest?`,[`Dribble past everyone`,`Pass across your own goal`,`Clear it high and wide`],2,`Right. A big clearance away from danger gives your team time to recover.`,`Dribbling or passing across your goal is risky. A clearance away from the middle is safer.`),
  C(`c-tackle`,`You want the ball from an attacker. Which tackle is allowed?`,[`Playing the ball, not the player`,`Pushing the player first`,`Tackling from behind`],0,`Correct. Fair tackles win the ball cleanly without fouling the player.`,`Pushing or tackling from behind is a foul. A fair tackle plays the ball.`)
 ],[
  `The market crates are stacked, and my defending boots are ready. Want to talk defence?`,
  `I blocked three shots in yesterday's game. Ask me how I stayed patient.`,
  `Defending is like stacking fruit: one wrong move and things tumble. What is up?`,
  `I am practising my side-on stance between market jobs. Want to learn it?`
 ],[
  `You asked me {topic} last time at the market. Here is another defending tip.`,
  `Good to see you again. After {topic} let me tell you about covering teammates.`,
  `I remember your question {topic} I have a new defensive idea now.`
 ]),

 imani:N([
  T(`points-table`,`How does a team earn league points?`,`Most leagues reward a win with three points, a draw with one and a loss with none. The team with the most points ranks highest.`,`What if teams have the same points?`,`Leagues often look at goal difference next, then other tie-breakers set by the competition.`),
  T(`goal-difference`,`What is goal difference?`,`Goals scored minus goals conceded. Score twenty and concede twelve, and your goal difference is plus eight.`,`Can it be negative?`,`Yes. If a team concedes more than it scores, the number goes below zero.`),
  T(`own-goal-count`,`Who gets the goal if it is an own goal?`,`The other team. If a defender accidentally puts the ball in their own net, the goal counts for the opponents.`),
  T(`clean-sheet`,`What is a clean sheet?`,`It means a team did not concede any goals in a match. Keepers and defenders are proud of clean sheets.`,`Does a draw count?`,`Yes, if it is nil-nil. Both teams have a clean sheet in that case.`),
  T(`extra-time`,`What happens if a cup game is tied?`,`Some knockout games use extra time, two short periods. If still tied, a penalty shootout decides the winner.`,`Do league games have extra time?`,`No. League games can end in a draw, and both teams get a point.`),
  T(`two-legs`,`What is a two-legged tie?`,`Two teams play twice, once at each ground. The total score over both games decides who goes through.`,`What if the total is tied?`,`Competitions have their own rules, often extra time and penalties in the second game.`),
  T(`home-away`,`Why does home and away matter?`,`Playing at home means familiar grass and cheering fans. Many teams find it a little easier to win there.`,`Do all teams win more at home?`,`Not always, but on average it helps.`),
  T(`courtyard-desk`,`How do you write a match report?`,`Start with the score, then describe the key moments, like the goals and big saves. End with one thing you learned from watching.`)
 ],[
  C(`c-points`,`A team wins one match and draws two. How many points do they have?`,[`Three points`,`Four points`,`Five points`],2,`Correct. A win gives three and each draw gives one, so three plus two makes five.`,`Count again: a win is three points and each draw is one. That adds up to five.`),
  C(`c-gd`,`A team scores ten goals and concedes six. What is their goal difference?`,[`Plus sixteen`,`Plus four`,`Minus four`],1,`Yes. Goal difference is scored minus conceded, so ten minus six is plus four.`,`Goal difference subtracts goals conceded from goals scored, giving plus four.`),
  C(`c-own-goal`,`A defender accidentally scores in their own net. Who gets the goal?`,[`The other team`,`Nobody, it does not count`,`The defender's team`],0,`Right. An own goal counts for the opponents.`,`Own goals do count, and they go to the other team.`),
  C(`c-league-draw`,`A league game finishes level. What usually happens?`,[`A penalty shootout`,`Extra time is always played`,`It stays a draw and each team gets a point`],2,`Exactly. League games can end level, and each team gets one point.`,`Shootouts and extra time are for knockout games. League draws stay draws.`)
 ],[
  `My courtyard desk is ready with fresh notes. Want to talk about scorelines?`,
  `I just wrote a match report with three big saves in it. Ask me what I noticed.`,
  `Scores are only the beginning. What would you like to learn today?`,
  `I am checking my score notebook from the weekend. Got a question for me?`
 ],[
  `You asked me {topic} last time at my desk. Here is another way to read a match.`,
  `Welcome back to the courtyard. After {topic} let me share a reporter's trick.`,
  `I remember your question {topic} I have new notes about it.`
 ]),

 rafi:N([
  T(`transfer-window`,`What is a transfer window?`,`It is a set period when clubs can register new players. Outside those times, most clubs have to wait.`,`Why are there windows?`,`They help keep squads steady during the season, so teams do not change every week.`),
  T(`free-transfer`,`What is a free transfer?`,`When a player's contract ends, they can join another club without a transfer fee.`,`Does that mean they play for free?`,`No. They still get paid by their new club. Only the fee between clubs is missing.`),
  T(`medical-check`,`Why do new players have medical checks?`,`The club checks the player is healthy and ready to train. It is a normal part of signing.`),
  T(`youth-academy`,`What is a youth academy?`,`It is where clubs train young players. Some grow up to play for the first team.`,`Do all academy players turn pro?`,`No. Many move on to other clubs or careers, and the skills they learn still help them.`),
  T(`shirt-number`,`Do new players get any shirt number?`,`They pick from available numbers. Some numbers might already be taken by teammates.`,`Do numbers mean positions?`,`Traditionally some did, like number one for keepers. Today many players choose numbers they like.`),
  T(`loan-return`,`Can loan players come back?`,`Yes. A loan is temporary, so the player usually returns to their original club when it ends.`,`Can they play against their own club?`,`It depends on the agreement. Some loans do not allow it.`),
  T(`source-check`,`How do I know a report is reliable?`,`Look at who wrote it, the date, and whether the club has confirmed it. Multiple trusted sources help.`,`What is a rumour?`,`It is a story without confirmation. It might be true, but it might not happen at all.`),
  T(`fit-role`,`How do clubs decide who to sign?`,`They look at the team's needs, the player's skills and how they fit the style of play.`)
 ],[
  C(`c-rumour`,`A website says a player 'might move'. What is it?`,[`A rumour, not confirmed`,`A completed signing`,`An official club statement`],0,`Correct. 'Might move' is a rumour until the club announces a deal.`,`'Might' means it is not confirmed. Wait for an official announcement.`),
  C(`c-contract-end`,`A player's contract has ended. What can happen?`,[`They must retire`,`They must stay forever`,`They can move without a transfer fee`],2,`Yes. An expired contract means they can join another club with no fee between clubs.`,`Players are not stuck. When a contract ends, they can move without a fee.`),
  C(`c-loan`,`A player goes on loan. What does that usually mean?`,[`They retire early`,`They play for another club for a while`,`They change sports`],1,`Right. A loan is a temporary move, usually to get more playing time.`,`A loan is temporary. The player plays for another club for a while.`),
  C(`c-fit`,`What makes a signing a good choice for a team?`,[`The player fits the team's needs`,`The player has the coolest hair`,`The player is the oldest`],0,`Exactly. A good signing fills a need and suits how the team plays.`,`Looks and age do not decide a good signing. Fit and need matter most.`)
 ],[
  `My coffee is warm and the transfer pages are open. Want to talk about how signings work?`,
  `I keep two lists: rumours and confirmed moves. Ask me how I sort them.`,
  `The pier is calm today, perfect for transfer chat. What would you like to know?`,
  `I just read three reports about the same rumour. Ask me why that matters.`
 ],[
  `You asked me {topic} last time on the pier. I have more to share.`,
  `Back for more transfer talk? After {topic} here is a new detail.`,
  `I remember your question {topic} Let me tell you about something else in the news.`
 ]),

 mei:N([
  T(`bibs`,`Why do teams wear bibs in practice?`,`Bibs help everyone see who is on which team. That makes passing easier and avoids mix-ups.`,`What if we have no bibs?`,`Try shirts of similar colours, or one team with jackets on.`),
  T(`small-goals`,`Are small goals good for kids?`,`Yes. Small goals mean you need accurate shots and more passing. Everyone gets more chances.`,`Can we use cones as goals?`,`Sure. Two cones make a goal. Agree on the width before starting.`),
  T(`safety-check`,`What should we check before playing?`,`Look for holes, rocks or glass in the space. Make sure nobody will run into walls or roads.`),
  T(`water-breaks`,`When should we take water breaks?`,`Every ten or fifteen minutes, especially on hot days. A quick sip keeps everyone fresh.`,`What if we are winning?`,`Take the break anyway. Everyone plays better with water.`),
  T(`three-v-three`,`Is 3v3 a real game?`,`Yes. Small games give everyone lots of touches and decisions. They are great for learning.`,`Do we need keepers?`,`You can play with small goals and no keepers. It keeps everyone moving.`),
  T(`schedule-games`,`How do you plan a weekly game?`,`Pick a regular time and place so people know where to come. Send a reminder to friends.`,`What if not many come?`,`Play a smaller game. Even three players can have fun.`),
  T(`simple-rules`,`What rules should we agree on first?`,`Agree on boundaries, how to restart and how goals count. Keep it simple so everyone remembers.`,`What about fouls?`,`Agree that players call their own and give the ball back.`),
  T(`welcome-new`,`How do I make a new player feel welcome?`,`Learn their name, explain the game and pass to them early. A friendly start makes a big difference.`)
 ],[
  C(`c-teams-fair`,`One team is winning by five goals. What helps make it fair?`,[`Keep playing the same way`,`Swap a player between teams`,`End the game early`],1,`Correct. Swapping a player makes the game closer and more fun for everyone.`,`Close games are more fun. Swapping a player helps balance the teams.`),
  C(`c-space-check`,`What should you check before a game in a new space?`,[`Holes, glass and nearby roads`,`The colour of the grass`,`How many birds are around`],0,`Right. Checking for hazards keeps everyone safe.`,`Safety comes first. Check for holes, glass and roads.`),
  C(`c-odd-number`,`You have seven players. What is a fair way to play?`,[`Leave one person out`,`Make one team much bigger`,`Have one player help whichever team has the ball`],2,`Great. A floating player for whoever has possession keeps both sides even.`,`Leaving someone out is unkind. A helper player keeps it fair and fun.`),
  C(`c-small-game`,`Why are small games good for learning?`,[`Players get more touches and decisions`,`Nobody has to run`,`The ball never goes out`],0,`Exactly. Fewer players means more touches and decisions for everyone.`,`Small games mean more touches and choices, which helps everyone learn.`)
 ],[
  `I just set out cones for a neighbourhood game. Want to talk about organising?`,
  `We had twelve kids last week and everyone played! Ask me how.`,
  `Football is better with everyone. What can I help you with today?`,
  `I am planning next week's games. Got any ideas or questions?`
 ],[
  `You asked me {topic} before. I have a new organising idea now.`,
  `Welcome back! After {topic} let me share how our last game went.`,
  `I remember your question {topic} Here is another tip for fun games.`
 ]),

 luz:N([
  T(`grass-mowing`,`Why do some pitches have stripes?`,`Mowers bend the grass in different directions. Light reflects differently, making stripes.`,`Do stripes change how the ball rolls?`,`Not really. They just look nice and help officials see lines.`),
  T(`pitch-rest`,`Why do pitches need rest?`,`Grass gets worn down by lots of games. Resting it lets roots recover and keeps it healthy.`,`What happens if it never rests?`,`Bare patches appear, and the ball bounces unevenly.`),
  T(`divot-fix`,`What is a divot?`,`A small chunk of grass kicked up by a boot. Pressing it back down helps the pitch heal.`),
  T(`long-grass`,`Does long grass slow the ball?`,`Yes. Long grass grabs the ball and makes passes slower. Short grass lets it roll faster.`,`What about wet grass?`,`Wet short grass can make the ball skid quickly, so be ready.`),
  T(`healthy-snacks`,`What snacks are good before football?`,`Fruit like bananas or oranges, or a small sandwich. Eat a little while before playing.`,`What about after?`,`A healthy meal with water helps your body recover.`),
  T(`garden-team`,`How is a garden like a team?`,`Each plant needs different care, just like each player has different strengths. Together they make something great.`),
  T(`water-plants`,`Do pitches need watering?`,`Yes, especially in dry weather. Grass needs water to stay green and soft.`,`Is artificial grass watered?`,`Sometimes, to cool it down or help the ball roll.`),
  T(`white-lines`,`Why are pitch lines white?`,`White stands out against green grass, so players and officials can see boundaries clearly.`,`Are lines part of the area?`,`Yes. The lines belong to the area they mark, so a ball on the line is still in.`)
 ],[
  C(`c-long-grass`,`The grass is long today. How will passes behave?`,[`Faster than usual`,`Exactly the same`,`Slower than usual`],2,`Right. Long grass slows the ball, so pass a little harder.`,`Long grass grabs the ball. Passes will roll slower.`),
  C(`c-ball-line`,`The ball is sitting on the touchline. Is it out?`,[`Yes, it is out`,`No, it is still in play`,`Only if it bounces`],1,`Correct. The ball must fully cross the line to be out.`,`The line is part of the field. A ball on it is still in play.`),
  C(`c-divot`,`You kicked up a chunk of grass. What should you do?`,[`Press it back down`,`Throw it away`,`Leave it there`],0,`Great. Pressing divots back helps the pitch heal.`,`Leaving or throwing it away damages the pitch. Pressing it back helps.`),
  C(`c-snack`,`Kick-off is in a while and you feel peckish. What should you munch?`,[`A big bag of sweets`,`Nothing at all all day`,`A banana a while before`],2,`Yes. A banana gives steady energy without feeling too full.`,`Sweets or no food can leave you tired. A banana is better.`)
 ],[
  `The tomatoes are watered and my boots are by the gate. Want a garden and football chat?`,
  `I planted beans today, and they will grow like a good team. What is on your mind?`,
  `The pitch and the garden both need care. Ask me anything.`,
  `I just pressed a few divots back into the park pitch. Want to hear why?`
 ],[
  `You asked me {topic} last time in the garden. Here is a new idea.`,
  `Back to visit the garden? After {topic} let me share another tip.`,
  `I remember your question {topic} My plants and I have more to say.`
 ]),

 ben:N([
  T(`ball-pressure`,`How do I know if a ball is pumped right?`,`Press it with your thumbs. It should be firm but give a little. Too hard or too soft makes it tricky to control.`,`Can I use any pump?`,`Use a pump with a needle made for balls, and wet the needle gently first.`),
  T(`corner-flag`,`Can I move the corner flag for a corner kick?`,`No. The rules say the corner flag must stay in place. Players take the kick around it.`),
  T(`net-check`,`Why check the nets before a game?`,`Holes in nets can cause arguments about goals. A quick check keeps everyone happy.`,`What if we find a hole?`,`Tell an adult or volunteer who can fix it, or play with clear agreements.`),
  T(`equipment-care`,`How do I take care of football gear?`,`Clean your boots, dry your ball and pack cones away. Good care makes gear last longer.`,`Do boots need special cleaning?`,`Brush off mud and let them dry naturally, not by a heater.`),
  T(`respect-volunteers`,`Why thank volunteers?`,`They give their time to make games happen. A simple thank-you shows you notice.`),
  T(`sweep-courtyard`,`Why sweep before playing?`,`Loose stones and leaves can make players slip. A clean space is safer for everyone.`,`How often do you sweep?`,`Before every game, and after if it gets messy.`),
  T(`handshake-ref`,`Should I thank the referee too?`,`Yes. Referees work hard to keep games fair. Thanking them shows respect.`,`What if I disagree with them?`,`Thank them anyway. Respect does not mean agreeing on everything.`),
  T(`lost-property`,`What do I do with lost gear?`,`Put it somewhere safe, like a lost and found box. Someone will be happy to find it.`,`What if nobody claims it?`,`Volunteers often share it with new players who need gear.`)
 ],[
  C(`c-flag`,`Can you move the corner flag to take a corner kick?`,[`No, it must stay in place`,`Yes, if it is in the way`,`Only the referee can move it`],0,`Correct. The corner flag stays put, and you kick around it.`,`The flag must stay where it is. Take the kick around it.`),
  C(`c-ball-feel`,`You press the ball and it feels very soft. What should you do?`,[`Play with it anyway`,`Kick it harder`,`Pump it up a little`],2,`Right. A properly pumped ball is easier to pass and control.`,`A soft ball is hard to control. Pump it up a little first.`),
  C(`c-sweep`,`The courtyard has loose stones. What should you do before playing?`,[`Play around them`,`Sweep them away`,`Kick them at the wall`],1,`Great. Sweeping stones away keeps everyone safe.`,`Stones can cause slips. Sweep them away first.`),
  C(`c-thanks`,`The game is over. Who should you thank?`,[`Only your best friend`,`Nobody, just leave`,`Teammates, opponents and officials`],2,`Exactly. Thanking everyone shows good sportsmanship.`,`Leaving without thanks misses a chance to show respect.`)
 ],[
  `Broom in hand, courtyard almost ready. Want to chat while I finish?`,
  `I just checked all the nets for holes. All good today! What is up?`,
  `Every game starts with a clean space. Got a football question?`,
  `I found a lost ball in the bushes this morning. Ask me what I did with it.`
 ],[
  `You asked me {topic} last time in the courtyard. I have another tip.`,
  `Welcome back! After {topic} let me share something about caring for gear.`,
  `I remember your question {topic} Here is another thing I learned.`
 ]),

 ines:N([
  T(`pre-game-meal`,`When should I eat before a game?`,`A light meal two or three hours before helps. Eating right before can make you feel heavy.`,`What should I eat?`,`Simple foods like pasta, rice or a sandwich work well.`),
  T(`drink-water`,`How much water should I drink?`,`Sip water before, during and after the game. Thirst is a sign you need more.`,`Are sports drinks better?`,`Water is usually enough for kids. Ask an adult if you play for a very long time.`),
  T(`team-mix`,`Can a team have very different players?`,`Yes. Fast players, calm passers and strong defenders all help in different ways.`,`How do we use everyone?`,`Talk about strengths and choose positions that fit them.`),
  T(`swap-positions`,`Should we try different positions?`,`Trying new roles helps you understand teammates. It makes the team stronger.`),
  T(`team-talk`,`How do we talk on the pitch?`,`Use short words like 'man on', 'time' or a teammate's name. Clear talk helps decisions.`,`What if it is noisy?`,`Use hand signals or eye contact too.`),
  T(`cafe-shift`,`Is working before playing tiring?`,`It can be, so I stretch and drink water first. A good warm-up wakes up my legs.`,`What warm-up do you do?`,`Light jogging, side steps and a few passes with teammates.`),
  T(`friendly-match`,`What is a friendly match?`,`A game that does not count in a league. It is for practice and fun.`,`Do friendlies matter?`,`Yes. They help teams try new ideas without pressure.`),
  T(`keeper-dish`,`Why is your dishwasher a good keeper?`,`Strong hands and quick reactions from catching slippery plates! Every job builds a skill.`)
 ],[
  C(`c-meal`,`When is a good time to eat a meal before playing?`,[`Right as the game starts`,`Two or three hours before`,`During half-time only`],1,`Correct. A meal a few hours before gives energy without feeling heavy.`,`Eating right before can make you feel heavy. Two or three hours before is better.`),
  C(`c-talk`,`A defender is closing behind your teammate. What should you shout?`,[`Man on!`,`Nice weather!`,`Nothing at all`],0,`Right. 'Man on' warns your teammate about pressure.`,`Your teammate needs a warning. 'Man on' tells them pressure is coming.`),
  C(`c-friendly`,`What is a friendly match for?`,[`Winning a trophy`,`Changing the rules`,`Practice and trying ideas`],2,`Exactly. Friendlies let teams practise without league pressure.`,`Friendlies do not decide trophies. They are for practice.`),
  C(`c-water`,`When should you drink water?`,[`Before, during and after playing`,`Only when the game ends`,`Never during games`],0,`Great. Sipping water throughout keeps you fresh.`,`Waiting too long leaves you tired. Drink before, during and after.`)
 ],[
  `I am carrying cups to the terrace, then it is game time. Want to chat?`,
  `Our café team has a friendly today. Ask me about team talk!`,
  `The terrace smells like fresh coffee and grass. What football question do you have?`,
  `My shift is almost done, so my boots are waiting. Got something to ask?`
 ],[
  `You asked me {topic} last time at the café. Here is another idea.`,
  `Welcome back to the terrace! After {topic} let me share a team tip.`,
  `I remember your question {topic} Our café team tried something new.`
 ]),

 ada:N([
  T(`two-feet`,`Why use both feet?`,`If you can use both feet, defenders cannot guess which way you will go.`,`How long does it take?`,`Weeks of short practice, but every little bit helps.`),
  T(`weak-pass`,`Which pass should I learn first with my weak foot?`,`The inside-foot pass. It is the easiest to control and aim.`,`Then what?`,`Try receiving with your weak foot too.`),
  T(`laces-pass`,`When should I pass with my laces?`,`For longer passes. Strike through the middle of the ball with your toes pointed down.`),
  T(`alternate-juggle`,`Can juggling help my weak foot?`,`Yes. Try alternating feet. Your weak foot learns to touch the ball softly.`,`What if I drop it a lot?`,`That is normal. Count small wins, like two touches with your weak foot.`),
  T(`slow-first`,`Should I practise fast or slow?`,`Start slow so you can feel the right technique. Speed comes later.`,`How do I know I am ready to go faster?`,`When the slow version feels easy and accurate.`),
  T(`garden-patience`,`How is gardening like practice?`,`Seeds grow slowly, and so do skills. Daily care helps both.`),
  T(`weak-shoot`,`Can I shoot with my weak foot?`,`Yes. Start with gentle shots aimed at a target. Accuracy matters more than power at first.`,`What if I miss?`,`Try again, closer to the goal, and slowly step back.`),
  T(`daily-ten`,`Is a little practice each day enough?`,`Yes. Ten minutes a day often beats one long session a week.`,`What should I do in ten minutes?`,`Passes against a wall, then a few touches and a few juggles.`)
 ],[
  C(`c-weak-first`,`Which pass is easiest to learn with your weak foot?`,[`A long chip`,`A backheel`,`An inside-foot pass`],2,`Correct. The inside-foot pass is the easiest to control and aim.`,`Chips and backheels are harder. Start with the inside foot.`),
  C(`c-two-footed`,`Why does using both feet help in games?`,[`Defenders cannot guess your direction`,`It makes you run faster`,`It means you never need passes`],0,`Right. Using both feet keeps defenders guessing.`,`It does not change speed or remove passing. It makes you harder to predict.`),
  C(`c-slow-speed`,`You are learning a new move. How should you start?`,[`As fast as possible`,`Slowly to get it right`,`Only in a real game`],1,`Great. Slow practice builds good technique.`,`Rushing creates bad habits. Start slowly.`),
  C(`c-daily`,`Which practice plan helps most?`,[`Ten minutes every day`,`Two hours once a month`,`Practise only when you feel like it`],0,`Exactly. Short daily practice builds skills steadily.`,`Long breaks slow progress. A little every day is better.`)
 ],[
  `My weak foot and I are both growing today. Want to practise with me?`,
  `I watered the new row and did ten weak-foot passes. Ask me how it went!`,
  `Patience is my word of the day. What would you like to learn?`,
  `The garden is calm, perfect for slow practice. Got a question?`
 ],[
  `You asked me {topic} last time in the garden. I have another weak-foot tip.`,
  `Welcome back! After {topic} let me share how my practice is going.`,
  `I remember your question {topic} My weak foot has improved since then.`
 ]),

 omar:N([
  T(`w-catch`,`How should I hold my hands to catch?`,`For balls at chest height or above, make a W shape with your thumbs close together behind the ball.`,`What about low balls?`,`Scoop them up with your palms facing forward and your body behind the ball.`),
  T(`punch-cross`,`When should a keeper punch the ball?`,`When it is crowded and catching is risky. Punch it high and far away.`,`One hand or two?`,`Two hands for power and direction when you can.`),
  T(`body-behind`,`Why get my body behind the ball?`,`If you miss it with your hands, your body still blocks it.`),
  T(`dive-safely`,`How do I dive safely?`,`Land on your side, not your stomach. Practise on soft grass first.`,`Should I dive a lot?`,`Only when needed. Good positioning often means you do not need to dive.`),
  T(`hold-on`,`What if I cannot catch a shot?`,`Push it wide, away from attackers. Do not push it back into the middle.`,`Is a parry a save?`,`Yes, if it keeps the ball out of the goal.`),
  T(`seedling-keeper`,`How are seedlings like keepers?`,`Both need patience and the right timing. Moving too early can cause problems.`),
  T(`set-feet`,`Why do keepers set their feet?`,`Being still when the shot comes helps you push off in any direction.`,`When do I set?`,`Just as the attacker is about to shoot.`),
  T(`talk-keeper`,`Should keepers talk to defenders?`,`Yes. Keepers see the whole field and can warn defenders about danger.`)
 ],[
  C(`c-w-shape`,`A shot comes at chest height. How should your hands look?`,[`A W shape behind the ball`,`Flat palms facing up`,`Fists closed`],0,`Correct. The W shape helps you catch firmly.`,`Fists and flat palms make catching hard. Use a W shape.`),
  C(`c-crowd`,`The box is crowded and a cross is coming. What is safest?`,[`Turn away`,`Catch it with one hand`,`Punch it high and wide`],2,`Right. Punching clears danger when catching is risky.`,`One-handed catches are risky. Punching it away is safer.`),
  C(`c-parry`,`You cannot hold a hard shot. Where should you push it?`,[`Back into the middle`,`Wide, away from attackers`,`Straight up and stay there`],1,`Great. Pushing it wide keeps it away from attackers.`,`Pushing it into the middle gives attackers a chance. Push it wide.`),
  C(`c-set-feet`,`An attacker is about to shoot. What should a keeper do?`,[`Set their feet and stay balanced`,`Jump early`,`Close their eyes`],0,`Exactly. Set feet help you react in any direction.`,`Jumping early or closing your eyes makes saving hard. Set your feet.`)
 ],[
  `The seedlings are watered and my gloves are ready. Want to learn a keeper trick?`,
  `I practised catching bouncy balls this morning. Ask me what I learned!`,
  `Garden first, goal second. What can I help you with?`,
  `Patience works for plants and saves. Got a question?`
 ],[
  `You asked me {topic} last time in the garden. Here is another keeper tip.`,
  `Back again! After {topic} let me show you a new catching idea.`,
  `I remember your question {topic} I have more to share now.`
 ]),

 zoe:N([
  T(`matchday-jobs`,`What jobs are there on match day?`,`Setting up cones, bringing water, keeping score or cheering. Everyone can help.`,`Can players do jobs too?`,`Yes. Sharing jobs makes everyone feel part of the team.`),
  T(`buddy-system`,`What is a buddy system?`,`Each new player gets a buddy who helps them learn the team's ways.`,`What does a buddy do?`,`Says hello, explains things and passes to them.`),
  T(`compliments`,`Should I compliment teammates?`,`Yes. A kind word after a good pass or effort builds confidence.`),
  T(`team-rules`,`Should teams agree on rules?`,`Yes. Agreeing on rules like being on time and kind helps everyone.`,`Who decides the rules?`,`The whole team can discuss and agree together.`),
  T(`quiet-ideas`,`Do quiet players have good ideas?`,`Often. They notice things others miss. Asking them helps the team.`,`How do I ask?`,`Ask a simple question and wait patiently for the answer.`),
  T(`share-ball`,`How do we share the ball fairly?`,`Pass to everyone, not just the best players. Everyone improves with touches.`),
  T(`growing-club`,`What does your growing club grow?`,`Vegetables and friendships! We share watering jobs just like passes.`,`Do you play football there?`,`We have small games after gardening.`),
  T(`listen-first`,`Why listen before speaking?`,`Listening helps you understand teammates and make better decisions.`)
 ],[
  C(`c-quiet`,`A quiet teammate looks unsure. What helps?`,[`Ignore them`,`Ask them a friendly question`,`Tell them to be louder`],1,`Correct. A friendly question invites them in.`,`Ignoring or pushing them does not help. Ask kindly.`),
  C(`c-jobs`,`Who can help with match day jobs?`,[`Everyone on the team`,`Only the coach`,`Only the captain`],0,`Right. Sharing jobs helps everyone feel included.`,`Everyone can help. It is a team effort.`),
  C(`c-share-pass`,`Your team keeps passing only to one player. What helps?`,[`Keep passing to that player`,`Stop passing completely`,`Pass to everyone`],2,`Great. Sharing the ball helps everyone improve.`,`Passing to one player leaves others out. Share it.`),
  C(`c-compliment`,`A teammate makes a good effort. What can you say?`,[`Nice try, keep going!`,`That was terrible`,`Say nothing and look away`],0,`Exactly. Kind words build confidence.`,`Unkind words or silence do not help. Say something kind.`)
 ],[
  `We just finished watering the club beds. Want to talk teamwork?`,
  `I made a matchday job chart today. Ask me what is on it!`,
  `Everyone gets a say in our club. What would you like to share?`,
  `The garden is full of helpers today. Got a question for me?`
 ],[
  `You asked me {topic} last time at the club. Here is another idea.`,
  `Welcome back! After {topic} let me tell you about our new team rule.`,
  `I remember your question {topic} Our club tried it out.`
 ]),

 hugo:N([
  T(`goal-kick-area`,`Where must opponents stand at a goal kick?`,`In 11v11, opponents must be outside the penalty area until the ball is in play.`,`When is the ball in play?`,`As soon as it is kicked and clearly moves.`),
  T(`build-out`,`What is a build-out line?`,`In some 7v7 leagues, opponents must wait behind this line during your goal kick. It gives defenders space to pass.`,`Is it in every league?`,`No. Check your league's rules.`),
  T(`throw-in-feet`,`How do I take a proper throw-in?`,`Use both hands, throw from behind your head, and keep both feet on the ground on or behind the line.`),
  T(`calm-restart`,`Why restart calmly?`,`Rushing can cause mistakes. A calm restart helps your team keep the ball.`,`How do I stay calm?`,`Take a breath, look for a safe pass, then play.`),
  T(`goal-kick-pass`,`Can I pass short from a goal kick?`,`Yes. In 11v11, you can pass to a teammate inside the penalty area.`,`Is that risky?`,`It can be, so make sure your teammate has space.`),
  T(`defender-start`,`Can defenders start attacks?`,`Yes. A good pass from the back can begin a great attack.`,`How do I find the pass?`,`Look up early and spot a teammate in space.`),
  T(`garden-calm`,`How does gardening help calm restarts?`,`Gardening teaches patience. Taking time makes better choices.`),
  T(`free-kick-defend`,`Do defenders take free kicks?`,`Often, especially near their goal. They pass calmly to start play.`)
 ],[
  C(`c-goal-kick`,`At an 11v11 goal kick, where must opponents be?`,[`Inside the goal`,`Next to the ball`,`Outside the penalty area`],2,`Correct. Opponents must be outside the penalty area until the ball is in play.`,`Opponents cannot crowd the ball. They must be outside the penalty area.`),
  C(`c-throw-in`,`What is needed for a proper throw-in?`,[`One hand only`,`Both feet on the ground`,`Jumping in the air`],1,`Right. Both feet must touch the ground on or behind the line.`,`Jumping or one hand is not allowed. Keep both feet down.`),
  C(`c-calm`,`You have the ball near your goal with pressure coming. What is best?`,[`Look for a safe pass`,`Kick it anywhere fast`,`Hold it and wait`],0,`Great. A safe pass keeps possession calmly.`,`Kicking anywhere loses the ball. Holding invites pressure.`),
  C(`c-build-out`,`During a 7v7 goal kick with a build-out line, where must opponents wait?`,[`Next to the keeper`,`On the penalty spot`,`Behind the build-out line`],2,`Exactly. Opponents wait behind the build-out line.`,`They must retreat behind the build-out line.`)
 ],[
  `The garden row is done. Time to plan calm restarts. Want to chat?`,
  `I drew a goal kick plan in the dirt. Ask me about it!`,
  `Calm minds make better passes. What can I help with?`,
  `I am thinking about our next defensive restart. Got a question?`
 ],[
  `You asked me {topic} last time in the garden. Here is another restart tip.`,
  `Welcome back! After {topic} let me share a calm defending idea.`,
  `I remember your question {topic} I have more to add now.`
 ])
};
