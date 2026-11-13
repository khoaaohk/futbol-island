import type {NpcFresh,FreshTopic,NpcChallenge} from '../npcFreshTypes';
// Fresh chat content, shard 9 (Nov 13 2026): DRIP FC Stadium islanders (lib/town/stadiumNpcs.ts). Score fans never state a score;
// they invite the player to ask, because results come from live news in chat.
const t=(id:string,question:string,answer:string,fq?:string,fa?:string):FreshTopic=>fq&&fa?{id,question,answer,followUp:{question:fq,answer:fa}}:{id,question,answer};
const c=(id:string,prompt:string,options:[string,string,string],correct:0|1|2,right:string,wrong:string):NpcChallenge=>({id,prompt,options,correct,right,wrong});

export const PART_9:Record<string,NpcFresh>={
 'stadium-greeter-anouk':{
  topics:[
   t('away-fans',"How do you welcome the away fans?","With the same smile I give the home fans. They travelled a long way to support their team, so today they are our guests.","Do away fans sit somewhere special?","Usually they get their own section of a stand. It keeps groups of fans together and makes it easy for stewards to help."),
   t('mistake',"What if my favourite player makes a mistake?","Give them a clap of support. Every player makes mistakes, and hearing the crowd behind them helps them try again.","Does cheering really help players?","Many players say a loud, kind crowd gives them energy, especially when the game feels hard."),
   t('referee-respect',"Why should fans respect the referee?","Referees make fast decisions with no replay to help them. They do their best, and there is no match without them.","What if I think the referee got it wrong?","It is fine to feel disappointed. Keep it kind, and remember the referee saw it from a different spot."),
   t('handshake',"Why do teams shake hands before a match?","It shows both teams respect each other before they compete. They shake hands again at the end, whatever the result."),
   t('fair-play-award',"Is there a prize for fair play?","Many tournaments give fair play awards to teams with good behaviour and few cards. How you play matters too.","How does a team earn few cards?","By tackling carefully, accepting decisions and not wasting time. Calm teams stay out of the referee's notebook."),
   t('opponent-hurt',"What happens if a player gets hurt?","Often the team with the ball kicks it out so the player can get help. When play restarts, the other team usually gives the ball back.","Is giving it back a rule?","No, it is not in the Laws of the Game. It is a fair play tradition that most teams follow."),
   t('first-match',"What should I bring to my first match?","A warm layer, your team colours and your grown-up. And plenty of voice for cheering!"),
   t('chants',"What makes a good chant?","One that cheers your own team and stays kind about the other team. Simple words and a beat everyone can clap to work best.","Can kids start a chant?","Of course! If it is friendly and catchy, the people around you might join in.")
  ],
  challenges:[
   c('c-great-save',"The other team's keeper makes an amazing save. What can a good fan do?",["Clap the save, it was brilliant","Boo the keeper loudly","Turn your back on the pitch"],0,"Yes. Clapping great play from either team is fair play, and it makes the stadium a happier place.","Booing and sulking spoil the fun. A great save deserves a clap, whoever made it."),
   c('c-injury',"A player is hurt and the other team kicks the ball out. What usually happens at the throw-in?",["The throwing team keeps it and attacks","The ball is given back to the other team","The match ends straight away"],1,"Right. Giving the ball back is a fair play tradition most teams follow.","Usually the ball goes back to the team that kicked it out. It is a kind tradition, not a rule."),
   c('c-miss',"Your striker misses an easy chance. What helps most?",["Shout something unkind","Go quiet and stop cheering","Clap and cheer them on"],2,"Exactly. Support helps a player shake off a miss and try again.","Unkind shouts and silence make it harder. A clap tells them the crowd still believes in them."),
   c('c-away',"Who are the away fans?",["Fans of the visiting team","Fans who are lost","Fans who leave early"],0,"Correct. Away fans support the visiting team, and they are our guests.","Away fans are the visiting team's supporters. They travel to cheer their side, and we welcome them.")
  ],
  openers:["Hello there! I have been welcoming fans all morning, and you are one of the friendliest faces so far.","Welcome! Before you go in, may I share my favourite match-day rule? It is all about fair play.","Hi! I love this moment, when both sets of fans arrive and the whole gate fills with colour.","Oh, hello! Got your team colours ready? Whichever side you support, you are welcome here."],
  returning:["Welcome back to the gate! Last time you asked me ‘{topic}’. Ready for another fair play chat?","Hello again! I remember ‘{topic}’ from our last chat. Shall we try a new question today?","You came back! After ‘{topic}’ last time, I have a fresh match-day story for you."]
 },
 'stadium-greeter-tomasz':{
  topics:[
   t('walk-out-kids',"Why do kids walk out with the players?","They are called mascots or player escorts. It is a special memory for them and a friendly start to the match.","How do kids get to do it?","Clubs often invite children from local teams or schools. Ask your club if they run anything like it."),
   t('line-up',"What happens when the teams line up?","They stand in two rows facing the crowd for a welcome. Then they walk along the line and shake hands."),
   t('coin-choice',"What does the captain choose after the coin toss?","The winner picks an end to attack before half-time, or chooses to kick off. The other captain takes the choice that is left.","Do teams swap ends?","Yes. At half-time they swap ends, and the other team takes the second-half kick-off."),
   t('warm-up-why',"Why do players warm up before the match?","Warming up gets muscles ready and lowers the chance of injury. It also helps players feel the ball and the pitch.","How long do pros warm up?","Often around half an hour, with jogging, stretching, passing and short sprints."),
   t('kick-off-rule',"Which way can the ball go at kick-off?","Any way at all, even backwards! The ball sits on the centre mark and is in play once it is kicked and clearly moves.","Can the kicker touch it twice?","No. The kicker must wait until another player touches it, or the other team gets a free kick."),
   t('dressing-room',"What happens in the dressing room before kick-off?","Players change, check their boots and listen to the coach's last ideas. Some like music, others like quiet."),
   t('nerves',"Do players get nervous before kick-off?","Lots do! A few nerves show you care. Deep breaths and a simple first job help settle them.","What simple first job?","Something easy, like a safe first pass. One good touch makes the next one feel easier."),
   t('kick-off-second',"Who kicks off the second half?","The team that did not kick off the first half. That keeps it fair for both sides.")
  ],
  challenges:[
   c('c-kickoff-half',"At kick-off, where must every player be?",["Wherever they want","In their own half","Inside the penalty area"],1,"Yes. Each team lines up in its own half, and the other team waits outside the centre circle.","Players cannot start anywhere. Everyone begins in their own half of the pitch."),
   c('c-coin',"Tomasz's team captain wins the toss. What does the captain get to pick?",["Which goal to attack first","Who the referee is","How many minutes are played"],0,"Right. The coin toss decides the ends or the kick-off, nothing more.","Referees and match length are set before the game. The toss decides which goal to attack or the kick-off."),
   c('c-second-kickoff',"Team A kicked off the first half. Who kicks off the second half?",["Team A again","Whoever is winning","Team B"],2,"Correct. The other team takes the second-half kick-off, so it stays fair.","It is not about the score. The team that did not start the first half kicks off the second."),
   c('c-touch-twice',"At kick-off, the kicker touches the ball twice in a row. What happens?",["Nothing, play on","The other team gets a free kick","The kicker gets a bonus point"],1,"Yes. Someone else must touch it first, or the other team gets a free kick.","Touching it twice in a row at a restart is not allowed. The other team gets a free kick.")
  ],
  openers:["Hello! Can you feel it? The build-up is my favourite part of every match day.","Welcome! The teams are warming up right now. Want to know what happens before the first whistle?","Hi there! I have watched hundreds of walk-outs from this gate, and I still get excited every time.","Ah, a new face! Stick with me and I will tell you exactly how a match gets started."],
  returning:["Back before kick-off again? You asked ‘{topic}’ last time. I have another build-up secret for you.","Welcome back! I still remember ‘{topic}’. Let us pick a new match-day question today.","Good to see you at the gate again! After ‘{topic}’ last time, here comes something new."]
 },
 'stadium-guide-iris':{
  topics:[
   t('tunnel',"What is the players' tunnel?","A covered passage from the dressing rooms to the pitch. Teams wait there before they walk out together.","Why is it covered?","It shelters players from the weather and keeps them apart from the crowd until they walk out."),
   t('dugout-why',"Why are dugouts called dugouts?","Early ones were dug a little into the ground, so coaches sat low and did not block the fans' view. The name stuck."),
   t('press-box',"Where do reporters sit?","In the press box, high in a stand with a clear view. They have desks for laptops and notes.","Is the commentary box there too?","Often nearby. Commentators need a high view as well, plus room for headsets and microphones."),
   t('stands-names',"Why do stands have names?","Some are named after a direction, like the North Stand, and some after people or places that matter to the club. Names help fans find their way.","How do I find my seat?","Your ticket shows the stand, the block, the row and the seat number. Stewards can point the way."),
   t('concourse-use',"What happens on the concourse?","Fans buy snacks, meet friends and wait before going to their seats. It is also part of the way out."),
   t('scoreboard',"What does the big scoreboard show?","The score, the match clock, and often replays and messages. Fans in every stand can see it.","Who controls it?","A small team in the stadium control room chooses what goes up."),
   t('all-seater',"What does all-seater mean?","Every fan has a seat instead of a standing spot. Many big grounds became all-seater to make crowds safer."),
   t('pitch-size',"Is every pitch the same size?","No. The Laws allow a range of lengths and widths, so pitches differ a little. The markings inside, like the penalty area, stay the same.","What size is a big pitch?","Many top stadiums use about 105 metres long and 68 metres wide.")
  ],
  challenges:[
   c('c-tunnel',"Where do players walk from to reach the pitch?",["The tunnel","The roof","The car park"],0,"Yes. The tunnel links the dressing rooms to the pitch.","Players come out through the tunnel, straight from the dressing rooms."),
   c('c-concourse',"What is the concourse?",["The grass in the middle","The walkway behind the stands","The coach's notebook"],1,"Right. The concourse runs behind the stands, with snacks and the way out.","The grass is the pitch. The concourse is the path that runs behind the stands, where fans walk and buy snacks."),
   c('c-ticket',"Your ticket says Block C, Row 12, Seat 7. What does Row 12 tell you?",["Which gate to use","How long the match is","Which line of seats you sit in"],2,"Correct. The row is your line of seats, and the seat number shows your exact spot.","The row tells you which line of seats to find. A steward can help if you get stuck."),
   c('c-dugout',"Who sits in the dugouts?",["Coaches and substitutes","Photographers","The away fans"],0,"Yes. Coaches and substitutes sit in the dugouts beside the pitch.","Photographers and fans have their own places. Dugouts are for coaches and substitutes.")
  ],
  openers:["Welcome to the stadium tour! I can name every part of this ground, from the tunnel to the roof.","Hi! A tour group of one? Perfect. Ask me about any part of the stadium you can see.","Hello! Did you know every part of a stadium has a job? Let me show you around.","Oh, a visitor! I was just practising my tour. You can be my first guest today."],
  returning:["Back for another tour? Last time we covered ‘{topic}’. Let us explore a different corner today.","Welcome back! I remember ‘{topic}’ from your last visit. Where shall the tour go next?","Hello again! After ‘{topic}’, I saved another stadium secret for you."]
 },
 'stadium-guide-omari':{
  topics:[
   t('corner-arc',"What is the small curve at each corner?","The corner arc. For a corner kick, the ball must be placed inside it, and touching the line is fine.","Can the corner flag be moved?","No. The flag marks the corner for players and officials, so nobody may move it to take a kick."),
   t('penalty-mark',"How far out is the penalty mark?","The penalty mark is 11 metres from the goal line, right in front of the middle of the goal.","Where do the other players stand?","Outside the penalty area and the penalty arc, behind the ball, until it is kicked."),
   t('arc-why',"What is the arc on the penalty box for?","It keeps players 9.15 metres from the penalty mark during a penalty. The part of that circle inside the box is not drawn."),
   t('goal-line',"What is the goal line?","The short line at each end of the pitch. For a goal, the whole ball must cross it between the posts and under the bar.","What if it is only half over?","Then it is not a goal yet. The whole ball has to be over the whole line."),
   t('halfway',"What does the halfway line do?","It splits the pitch into two halves. Players start in their own half at kick-off, and offside only counts in the other team's half."),
   t('line-in',"Is the ball out if it is on the line?","No. The lines belong to the area they mark, so a ball touching the line is still in play.","So when is it out?","Only when all of the ball has crossed the line, on the ground or in the air."),
   t('goal-size',"What size is a grown-up goal?","It is 7.32 metres wide and 2.44 metres high. Youth goals are often smaller to suit smaller players.","Why are youth goals smaller?","So young keepers can reach the corners and every game stays fair and fun."),
   t('centre-mark',"What is the dot in the middle?","The centre mark. Kick-offs start there at the beginning of each half and after every goal.")
  ],
  challenges:[
   c('c-penalty-distance',"How far is the penalty mark from the goal line?",["5.5 metres","11 metres","20 metres"],1,"Yes. The penalty mark is 11 metres out.","5.5 metres is the depth of the goal area. The penalty mark is 11 metres from the goal line."),
   c('c-on-line',"The ball rolls along the touchline, touching it. Is it in or out?",["Still in play","Out for a throw-in","Only in on Sundays"],0,"Correct. A ball on the line is still in play.","The line is part of the pitch. The ball is only out when all of it is over the line."),
   c('c-circle',"What is the radius of the centre circle?",["2 metres","16.5 metres","9.15 metres"],2,"Right. It measures 9.15 metres from the centre mark to the circle line.","16.5 metres is the penalty area. The centre circle radius is 9.15 metres."),
   c('c-goal-kick',"From where is a goal kick taken?",["The centre mark","Inside the goal area","The corner arc"],1,"Yes. A goal kick can be taken from anywhere inside the goal area.","The centre mark is for kick-offs and the corner arc for corners. Goal kicks start in the goal area.")
  ],
  openers:["Welcome to the Plaza! Quick, can you name the lines on a pitch? Do not worry, I will help.","Hi! I was drawing a penalty area in the air. It looks odd, I know, but it helps me explain.","Hello! Every white line out there is a little rule. Want to learn a few?","Ah, a new visitor! Let me tell you why the pitch has a circle in the middle."],
  returning:["Back at the Plaza! Last time it was ‘{topic}’. Shall we draw a new line today?","Hello again! I remember ‘{topic}’. There are still plenty of markings to explore.","You returned! After ‘{topic}’, let me show you another part of the pitch."]
 },
 'stadium-guide-beatrix':{
  topics:[
   t('roof-noise',"How does a roof make the crowd louder?","The roof bounces the sound back down instead of letting it float away. That is why covered stands feel so loud."),
   t('floodlight-towers',"Why are some floodlights on tall towers?","Corner towers send light down across the whole pitch from high up. Many newer stadiums fix the lights along the roof edge instead.","Which kind works best?","Both can work. What matters is even light, so the ball is easy to see from any spot."),
   t('capacity-why',"Who decides a stadium's capacity?","Safety experts work it out from the seats, stairs and exits. The number makes sure everyone can leave calmly and quickly.","What if more people want to come?","Then the tickets sell out. Letting in too many people would not be safe."),
   t('stewards',"What do stewards do?","They help fans find seats, keep the gangways clear and guide people out at the end. They know the stadium very well.","How do I spot a steward?","Look for a bright jacket or bib. They are always happy to help."),
   t('exits',"Why should I find the exit first?","If you know your nearest exit, leaving is easy and calm. It only takes a moment when you arrive."),
   t('lost-child',"What if I get separated from my grown-up?","Stay where you are and ask a steward for help. Stewards know how to bring families back together quickly.","Should I look around on my own?","No. It is safer to stay put and let a steward help you."),
   t('rain-pitch',"What happens to the pitch when it rains?","Good pitches drain water away through layers under the grass. Very heavy rain can still stop a match if the ball will not roll."),
   t('wembley-arch',"What holds up Wembley's roof?","Its giant arch, 133 metres high, helps carry the roof. Wembley holds 90,000 fans in its seats.","Why use an arch?","An arch spreads the weight well, so the roof needs fewer pillars blocking anyone's view.")
  ],
  challenges:[
   c('c-gangway',"Why keep stairs and gangways clear?",["So everyone can move safely","So there is room to play","So the roof stays up"],0,"Yes. Clear gangways let people move safely, especially at the end of a match.","Gangways are not for playing or holding up roofs. They keep the way clear for everyone."),
   c('c-lost',"You cannot find your grown-up in the crowd. What should you do?",["Run around looking everywhere","Leave the stadium alone","Stay put and ask a steward"],2,"Right. Stewards help bring families back together quickly and safely.","Running off or leaving makes it harder to find you. Stay where you are and ask a steward."),
   c('c-capacity',"What does a stadium's capacity mean?",["How tall the roof is","The most people it can hold safely","How many goals are scored"],1,"Correct. Capacity is the safe maximum number of people.","It is not about roofs or goals. Capacity is the most people the stadium can hold safely."),
   c('c-floodlights',"Why are floodlights placed high up?",["To spread light evenly with fewer shadows","To keep birds warm","To light the car park only"],0,"Yes. Height spreads the light across the whole pitch.","Floodlights are high so their light covers the whole pitch evenly.")
  ],
  openers:["Hello, dear! I am on my ring path walk. Shall I tell you how a stadium keeps everyone safe?","Good to see you! Look up at those floodlights. Each one has a very important job.","Hi! I was a steward here for many years. I still walk the ring path every single day.","Hello there! Before any match, my favourite question is this: do you know where your nearest exit is?"],
  returning:["Back on the ring path! Last time you asked ‘{topic}’. I have another safety story today.","Hello again, dear! I remember ‘{topic}’. Let us walk and talk about something new.","You found me again! After ‘{topic}’, shall we look at a different part of the stadium?"]
 },
 'stadium-walker-kwesi':{
  topics:[
   t('press-trigger',"What is a pressing trigger?","A signal for the team to press, like a bad touch, a slow pass or an opponent who turns back toward their goal. When it happens, everyone moves together.","Who shouts the trigger?","Often a midfielder or the keeper. A short word like now helps the team move at the same moment."),
   t('cover-shadow',"How do I block a pass while pressing?","Run at the player in a curve, so your body blocks the pass behind you. Coaches call it a cover shadow.","Do I need to win the ball myself?","Not always. Forcing a hurried pass can let a teammate win it."),
   t('press-alone',"Why is pressing alone a problem?","One player pressing can be passed around easily. When teammates close the nearby passes too, the player on the ball has no easy choice."),
   t('high-press',"What is a high press?","Pressing near the other team's goal. Winning the ball there means you are already close to scoring.","Is a high press risky?","It can be. If the press is beaten there is space behind you, so the team must stay connected."),
   t('when-drop',"When should a team stop pressing?","When the other team has a calm player with time and lots of passing choices. Then it is smarter to drop back and stay compact."),
   t('stamina',"How do I get fitter for pressing?","Mix steady jogs with short sprints and rests. Small-sided games are great too, because you press again and again.","How often should I train?","A few times a week is plenty for young players, with rest days in between."),
   t('force-wide',"Why do pressers push the ball to the side?","Near the touchline the player has fewer options. The line works like an extra defender."),
   t('counter-press',"What do I do right after we lose the ball?","Try to win it back straight away while the other team is still getting organised. A few seconds of quick pressing can work well.","And if they get away?","Then drop back into shape and defend together.")
  ],
  challenges:[
   c('c-trigger',"Which moment is a good trigger to press?",["The defender takes a bad touch","The keeper is holding the ball","Your team is resting at half-time"],0,"Yes. A bad touch gives you a moment to close in.","A keeper holding the ball cannot be challenged, and half-time is for resting. A bad touch is the signal."),
   c('c-curve',"How should you run at the player with the ball?",["In a straight line, head down","In a curve that blocks a pass","Backwards"],1,"Right. A curved run blocks a passing lane while you close in.","Straight runs leave passes open, and running backwards does not press at all. Curve your run."),
   c('c-together',"Why should a team press together?",["To make the game end faster","So players can stop running","So nearby passes are covered too"],2,"Correct. When everyone presses, the player on the ball runs out of easy passes.","Pressing together means more running, not less. It covers the nearby passes."),
   c('c-touchline',"Where is it easiest to trap the player with the ball?",["Near the touchline","In the centre circle","Inside your own goal"],0,"Yes. The touchline limits where they can go.","The middle gives them lots of choices. Near the touchline, they have far fewer.")
  ],
  openers:["Hey! I am halfway through my laps. Talking about pressing gives me extra energy.","Hi! Want to know the secret of a good press? It is all about teamwork.","Hello! I am training my legs for the end of matches, when pressing gets really hard.","Oh, hi! Walk with me for a bit? I can explain pressing as we go."],
  returning:["Back on the trail? You asked ‘{topic}’ last time. Ready for another pressing idea?","Hey, again! I remember ‘{topic}’. One more lap and a new question?","Good to see you! After ‘{topic}’ last time, I have a fresh pressing tip."]
 },
 'stadium-fan-leon':{
  topics:[
   t('man-on',"What does man on mean?","It means an opponent is close behind you. Protect the ball or pass it quickly.","Can teammates hear it in a big crowd?","Usually, if it is loud and short. That is why calls are only one or two words."),
   t('time-call',"What does time mean on the pitch?","It means you are free and have a moment. Take a touch, look up and choose."),
   t('keepers-call',"Why does the keeper shout keeper's?","It tells defenders the keeper is coming to catch the ball, so they move out of the way. It stops crashes.","When should the keeper shout?","Early and loudly, as soon as they decide to come for it."),
   t('quiet-player',"I am shy. How can I talk on the pitch?","Start with one easy word, like a teammate's name when you want the ball. It gets easier every game.","What if nobody hears me?","Wave an arm too. Pointing and waving are part of football talk."),
   t('point',"Can you talk without words in football?","Yes! Pointing where you want the pass, a wave or a quick look all help teammates."),
   t('praise',"Why do players say well done to each other?","Kind words keep a team brave and happy, especially after a mistake. Players play better when they feel supported.","What can I say after a teammate's mistake?","Something simple like unlucky or next one. Then help them win the ball back."),
   t('turn-call',"What does turn mean?","It tells a teammate they have space to spin around and face the goal. They do not need to pass back."),
   t('names-first',"Why say a name before the call?","With lots of players nearby, a name shows exactly who the message is for.","And if I forget a name?","Learn them at the warm-up. Even a shirt number works in a hurry.")
  ],
  challenges:[
   c('c-man-on',"A teammate shouts man on as the ball comes to you. What does it mean?",["You have lots of time","Someone is close behind you","The match is over"],1,"Yes. Protect the ball or move it on fast.","Man on is a warning. An opponent is right behind you."),
   c('c-shy',"You want the ball but feel shy. What is the simplest first step?",["Say the passer's name","Sit down on the pitch","Wait silently all game"],0,"Right. A name is short and easy, and the passer knows you are free.","Waiting silently or sitting down will not help. Start by saying their name."),
   c('c-keeper',"What is the keeper's shout of keeper's for?",["To start a song","To ask for water","To warn defenders they will catch it"],2,"Correct. It stops collisions near the goal.","It is a safety call. The keeper is saying the ball is theirs."),
   c('c-best-call',"Which call works best during a fast attack?",["A long story about lunch","A short clear word like turn","No sound at all"],1,"Yes. Short and clear is quick to understand.","Long stories are too slow, and silence helps nobody. Use one clear word.")
  ],
  openers:["Man on! Oh, sorry, I was practising again. Hi! Want to learn the calls with me?","Hi! I am getting ready for Saturday. My coach says my voice is my secret skill.","Hello! Do you know what time means in football? It is not about clocks!","Hi! I just made up a new call. Want to hear it? It is very, very loud."],
  returning:["You are back! Last time we talked about ‘{topic}’. I have learned a new call since then.","Hi again! I remember ‘{topic}’. Can we practise a different call today?","Yay, it is you! After ‘{topic}’, I have more football talk to share."]
 },
 'stadium-coach-gustavo':{
  topics:[
   t('bisect',"How does a keeper find the right spot?","Picture a string tied from the ball to the centre of your goal, and stand on that string. As the ball moves, shuffle to stay on that line.","How do I know where the middle is?","Some keepers glance back at the posts, or check where the penalty spot is."),
   t('near-post',"What is the near post?","The post closest to the ball. Keepers protect it carefully, because it is the shortest way in.","And the far post?","The one further away. A shot there travels further, so the keeper has a little more time."),
   t('chip',"How do strikers chip a keeper?","They lift the ball gently over a keeper who has come too far out. Good keepers judge their distance so it is hard to do."),
   t('ready-position',"What is the keeper's ready position?","Feet apart, knees soft, weight on the front of the feet and hands ready. From there you can move any way.","When should I get set?","Just before the striker kicks. Moving during the shot makes it hard to dive."),
   t('narrow-angle',"Why is a shot from the side hard to score?","From a tight angle, the striker sees only a small part of the goal. A keeper near the near post makes it smaller still.","So should the keeper hug the post?","Close to it, but not touching. Leave a little room so you can still reach the far side."),
   t('behind-goal',"Why watch keepers from behind the goal?","From behind, I can see exactly where the keeper stands compared with the ball and the posts. It is like seeing the angles drawn in the air."),
   t('one-v-one-angle',"What should a keeper do when a striker is alone?","Come out in control to narrow the angle, then stay tall and wait. Diving too early makes it easy for the striker."),
   t('crosses-position',"Where should a keeper stand for a cross?","A little off the line and toward the middle of the goal. Then they can step forward to catch or move back if needed.","Do they talk to defenders then?","Yes. A quick call helps everyone know who is going for the ball.")
  ],
  challenges:[
   c('c-line',"Where should a keeper stand when facing a shot?",["On a line between ball and goal centre","Always touching a post","On the penalty mark"],0,"Yes. That line gives the best cover of the goal.","Hugging a post or standing far out leaves gaps. Stay on the line from the ball to the goal centre."),
   c('c-too-far',"A keeper comes far off the line. What might the striker try?",["A long throw","A chip over the keeper","A quick corner"],1,"Right. A keeper too far out can be chipped.","Throw-ins and corners are restarts. A striker would try to lift the ball over the keeper."),
   c('c-set',"When should the keeper be set and still?",["Ten minutes after the shot","During half-time","Just as the striker kicks"],2,"Correct. Being set lets you push off in any direction.","Being set matters at the moment of the kick, so you can react."),
   c('c-tight',"A striker shoots from a very tight angle. Which post does the keeper guard closely?",["The far post","The near post","Neither, they walk away"],1,"Yes. The near post is the short way in from a tight angle.","From a tight angle, the near post is the danger. Guard it, but stay ready for the far side.")
  ],
  openers:["Hello! From behind this goal I can see every step the keeper takes. Fascinating, really.","Ah, a visitor! Do you like goalkeeping? Then you are standing in the right place.","Hello there! Watch the keeper shuffle sideways each time the ball moves. That is angle work.","Good day! I coached keepers for many years. Ask me anything about where to stand."],
  returning:["Back behind the goal? Last time it was ‘{topic}’. Let us study another keeper skill today.","Hello again! I remember ‘{topic}’. The keeper down there has given me new ideas.","You returned! After ‘{topic}’, I have another angle to show you."]
 },
 'stadium-coach-mireille':{
  topics:[
   t('level',"Is a striker level with the defender onside?","Yes. Level with the second-last defender is onside. You must be further forward to be offside.","Which body parts count?","Any part you can score with, so the head, body and feet. Hands and arms do not count."),
   t('own-half',"Can you be offside in your own half?","No. If you are in your own half when the ball is played, you are onside.","What if I cross halfway as the pass comes?","What counts is where you were at the moment of the pass, so it depends on that instant."),
   t('moment',"At what moment is offside decided?","At the moment your teammate plays or touches the ball. Where you are after that does not change it.","So I can run past after the pass?","Yes! If you were onside at the pass, you can sprint past the defenders."),
   t('second-last',"Why the second-last defender, not the last?","The keeper usually counts as one of the last two. So the second-last is often the last outfield defender."),
   t('throw-in-offside',"Is there offside from a throw-in?","No. You cannot be offside straight from a throw-in, a corner kick or a goal kick.","Why do those restarts skip offside?","Those restarts would be very hard for attackers otherwise, so the Laws give them a fair start."),
   t('behind-ball',"Can I be offside if I am behind the ball?","No. If you are level with or behind the ball when it is passed, you are onside."),
   t('assistant',"Who checks offside?","The assistant referees, running along each touchline level with the second-last defender. They raise their flag for offside.","Why do they run so much?","To stay level with that line, so they can see it clearly."),
   t('offside-trap',"What is an offside trap?","Defenders step up together just before a pass, so attackers are left offside. It needs perfect teamwork, or a striker runs straight through.")
  ],
  challenges:[
   c('c-level',"The striker is exactly level with the second-last defender as the pass is played. Offside?",["Onside","Offside","Only offside at night"],0,"Yes. Level is onside.","Level is onside. You must be further forward than the second-last defender to be offside."),
   c('c-corner',"Can a player be offside straight from a corner kick?",["Yes, every corner","No, never from a corner","Only if it rains"],1,"Correct. No offside from a corner, a throw-in or a goal kick.","Offside does not apply straight from a corner kick."),
   c('c-when',"At which moment does the assistant referee judge offside?",["When the striker shoots","After the goal","When the teammate plays the pass"],2,"Right. The moment of the pass is what matters.","It is not judged at the shot. It is judged when the ball is played to you."),
   c('c-half',"You are in your own half when the pass is played. Are you offside?",["No, you are onside","Yes, every single time","Only if the keeper shouts"],0,"Yes. Your own half is a safe zone for offside at the moment of the pass.","In your own half at the moment of the pass, you are always onside.")
  ],
  openers:["Hello! Look at the back line from up here. You can see it straight as a ruler.","Hi! Offside sounds tricky, but from the stands it is easy to see. Want me to show you?","Hello there! I am watching where the defenders stand, not the ball. Try it with me.","Welcome to my corner of the stand! I have offside puzzles, if you are brave."],
  returning:["Back in the stand! Last time it was ‘{topic}’. I have a new offside puzzle ready.","Hello again! I remember ‘{topic}’. Shall we watch the back line together today?","You came back! After ‘{topic}’, let us look at another part of offside."]
 },
 'stadium-coach-nkechi':{
  topics:[
   t('wall-distance',"How far must the wall stand at a free kick?","At least 9.15 metres from the ball. The referee can pace it out and mark it with spray.","What about attackers near the wall?","When the wall has three or more defenders, attackers must stay at least 1 metre away from it."),
   t('quick-free-kick',"Can a free kick be taken quickly?","Yes, if the ball is still and in the right place, unless the referee asks you to wait. A quick kick can catch defenders before they are ready."),
   t('near-post-run',"What is a near-post run at a corner?","A player sprints toward the post nearest the ball to flick it on or score. It drags defenders and opens space behind.","Who attacks the far post then?","Another runner arrives late at the far post, in case the ball travels through."),
   t('throw-in-rules',"How do you take a throw-in properly?","Face the pitch, keep part of each foot on or behind the touchline, and throw with both hands from behind and over your head.","Can you score straight from a throw-in?","Not directly. A throw that flies straight in does not count as a goal."),
   t('indirect',"What makes a free kick indirect?","A free kick that must touch another player before a goal can count. The referee raises an arm to show it."),
   t('set-piece-practice',"Why do teams practise set pieces?","They happen often in matches, and a planned routine helps everyone know their job. Plenty of goals come from them.","How many routines do teams learn?","Usually a few simple ones. Too many can confuse players."),
   t('stay-back',"Why do some players stay back at corners?","If the other team clears the ball, someone must be ready to stop a fast counter-attack."),
   t('zonal',"How does zonal marking work?","Defenders guard an area instead of one player. It means somebody always covers the most dangerous spaces.","And man marking?","Each defender sticks to one attacker. Many teams mix the two.")
  ],
  challenges:[
   c('c-wall',"How far must the wall stand from a free kick?",["Two short steps","No closer than 9.15 metres","Thirty metres"],1,"Yes. Opponents must be at least 9.15 metres away.","The distance is 9.15 metres from the ball."),
   c('c-throw',"How must a throw-in be taken?",["Both hands, from behind and over the head","One hand, like a bowler","Kicked from the touchline"],0,"Correct. Two hands, from behind and over the head, with feet on or behind the line.","A throw-in uses both hands, from behind and over the head."),
   c('c-attackers-wall',"The wall has four defenders. How close can attackers stand to it?",["Right inside it","Any distance, no rules","At least 1 metre away"],2,"Right. With three or more defenders in the wall, attackers keep a 1 metre gap.","Attackers cannot join the wall. They must stay at least 1 metre away."),
   c('c-corner-run',"At a corner, what do good attackers attack?",["The space","The flag in the corner","The referee's spot"],0,"Yes. Arriving late into space beats standing still.","Attack the space, timed with the delivery.")
  ],
  openers:["Hello! My notebook is full of corners and free kicks. Want to see a little plan?","Hi! A set piece is like a tiny play everyone rehearses. Shall I explain one?","Welcome! I just watched a clever corner routine. I am still drawing the arrows.","Hello there! Every time the ball stops, I start taking notes. Funny habit, right?"],
  returning:["Back again! Last time we talked about ‘{topic}’. I have a new set-piece plan to share.","Hi! I remember ‘{topic}’. Let us turn to a different page of my notebook.","Good to see you! After ‘{topic}’, here is another set-piece idea."]
 },
 'stadium-score-devika':{
  topics:[
   t('table',"How do I read a league table?","Teams are listed from the most points to the fewest. Columns usually show games played, wins, draws, losses, goals and points.","What does GD stand for?","Goal difference. You take the goals a team let in away from the goals it scored."),
   t('three-points',"Why is a win worth three points?","Many leagues made wins worth three to reward teams who go for victory. A draw still earns one point."),
   t('goal-diff-example',"How does goal difference work?","Take the goals a team scored and subtract the goals it let in. A team that scored 10 and let in 4 has plus six.","Can goal difference go below zero?","Yes, if a team lets in more goals than it scores."),
   t('latest',"Can you tell me the latest score?","Ask me in chat and we can check the latest news together. I only share results from real match reports.","Why not just guess?","Because a guess could be wrong. Real fans check the facts first."),
   t('promotion',"What are promotion and relegation?","In many leagues, the top teams of a lower league move up and the bottom teams of a higher league move down. It makes every match matter."),
   t('home-away',"What do home and away mean?","Home is a match at your own stadium, and away is at the other team's ground. Most leagues play each team home and away.","Is home really an advantage?","Often a little, thanks to the crowd and the familiar pitch."),
   t('season',"How long is a league season?","In many leagues it lasts most of a year, with a break between seasons. In lots of leagues, teams meet each other twice."),
   t('read-story',"Why read the story, not just the score?","The score tells who won, but the story tells how. Chances, saves and changes all matter.","Where do I find the story?","Match reports and news articles describe what happened.")
  ],
  challenges:[
   c('c-win-points',"In most leagues, how many points is a win worth?",["Just one point","Two points each","Three whole points"],2,"Correct. A win is three points and a draw is one.","Most leagues give three points for a win."),
   c('c-gd',"A team scored 8 goals and let in 5. What is the goal difference?",["Plus three","Plus thirteen","Minus three"],0,"Yes. 8 minus 5 is plus three.","Goal difference is scored minus let in, so 8 minus 5 makes plus three."),
   c('c-draw',"How many points does a draw earn in most leagues?",["No points","One point each","Three points each"],1,"Right. A draw earns one point for each team.","A draw is one point each."),
   c('c-guess',"A friend asks for a score you are not sure about. Best idea?",["Make one up","Say a random number","Check a real match report"],2,"Yes. Good fans check the facts.","Made-up scores spread mistakes. Check a real report first.")
  ],
  openers:["Hi! I have my results notes ready. Ask me in chat and we can check the latest together.","Hello! Shall we look at how a league table works? It is like a big puzzle.","Hi there! I follow the Premier League every week. Points, goals and stories, I love them all.","Hello! A good fan checks the facts before sharing a result. Want to learn how?"],
  returning:["Back on the concourse! Last time it was ‘{topic}’. Want to check something new together?","Hi again! I remember ‘{topic}’. Ask me in chat and we can look up fresh news.","Welcome back! After ‘{topic}’, shall we learn another bit about league tables?"]
 },
 'stadium-score-lucinda':{
  topics:[
   t('stretch',"How does width stretch a defence?","When players stand near both touchlines, defenders must spread out to watch them. Gaps open between the defenders.","And once the gaps open?","Then a quick pass into a gap, or a dribble through it, can make a chance."),
   t('winger-job',"What does a winger do?","A winger plays near the touchline, dribbles past full-backs and crosses or cuts inside to shoot.","Do wingers defend too?","Yes, dear. When the ball is lost, a good winger runs back to help the full-back."),
   t('overlap',"What is an overlap?","A full-back runs around the outside of the winger who has the ball. It gives the winger a pass or a decoy.","Who covers behind?","A midfielder or centre-back shifts across, so the team is not left open."),
   t('narrow-team',"What happens if a team plays too narrow?","Everyone squeezes into the middle, and defending gets easy for the other team. Width gives the attack room to breathe."),
   t('cross-types',"What kinds of crosses are there?","High crosses to the far post, low fast ones across the box, and cut-backs from near the goal line.","Which one is best?","It depends where your teammates are. Look up first, dear."),
   t('hug-line',"Why do wingers stand on the touchline?","Staying wide pulls the full-back away from the centre-backs. That makes bigger gaps for teammates."),
   t('latest-liga',"Can you tell me the latest La Liga result?","Ask me in chat, dear, and we will check the news together. I never guess a score.","What do you love about La Liga?","The skill on the ball and the brave wide play."),
   t('switch-width',"How does width help a switch of play?","If one player stays wide on the far side, a long pass can find them in space.")
  ],
  challenges:[
   c('c-width',"Why do teams put players near both touchlines?",["To stretch the defence","To have a rest","To watch the crowd"],0,"Yes. Width spreads the defence and opens gaps.","Width is about stretching the defence."),
   c('c-overlap',"A full-back runs around the outside of the winger. What is that called?",["A long throw-in","An overlap","A pass back to the keeper"],1,"Correct. That is an overlap.","That run is called an overlap."),
   c('c-cover',"The full-back goes forward. What should the team do?",["Leave the space empty","Ask the referee to pause play","Have someone cover behind"],2,"Right. A teammate shifts across to cover.","Someone must cover the space behind."),
   c('c-score-ask',"You want the latest La Liga score. What can you do?",["Ask Lucinda in chat and check the news","Guess a score","Make up a result"],0,"Lovely, dear. Real news beats a guess.","Guessing can be wrong. Ask in chat and we will check the news together.")
  ],
  openers:["Hello, dear! Come and sit with me. Shall we talk about wingers? They are my favourite.","Hello! Ask me in chat about La Liga, and we can check the latest news together.","Oh, hello! I love a team that uses the whole width of the pitch. Do you?","Good day, dear! I have watched football for many years. Width is still my favourite trick."],
  returning:["Hello again, dear! Last time we chatted about ‘{topic}’. Shall we talk wingers today?","You came back! I remember ‘{topic}’. Let us look at something new together.","Welcome back! After ‘{topic}’, I have another wide-play story for you."]
 },
 'stadium-score-ren':{
  topics:[
   t('why-switch',"Why switch play?","When the other team crowds one side, the far side is often free. Moving the ball there quickly finds space.","How do I know it is free?","Look across before the ball reaches you. A quick scan tells you."),
   t('long-switch',"How do I hit a long switch pass?","Lean back a little, strike through the ball with your laces and follow through. Practise accuracy before power."),
   t('short-switch',"Can you switch play with short passes?","Yes. A few quick passes across the back can move the ball from one side to the other safely.","Is that slower?","A little, but it is safer and still moves the defence."),
   t('scan',"What is scanning?","Quick looks over your shoulder before the ball arrives. It helps you know where the space is.","How often should I scan?","Before every pass you receive, if you can. Good midfielders look around many times a minute."),
   t('passing-maps',"What are your passing maps?","I draw an arrow for each pass in a match. Patterns appear, like a team often switching from right to left.","Can I make one?","Sure! Watch a match and draw an arrow for every pass one player makes."),
   t('j1',"Can you tell me the latest J1 League result?","Ask me in chat and we can check the latest news together. I only trust real match reports."),
   t('far-winger',"Who receives the switch?","Often a winger or full-back staying wide on the far side, ready to attack quickly.","What do they do next?","Take a good first touch forward and attack the defender before they get set."),
   t('when-not',"When should I not switch?","If the far side is covered or the pass is too risky, keep it simple and pass safely nearby.")
  ],
  challenges:[
   c('c-why',"The other team crowds the left side. What could you do?",["Switch the ball to the right","Pass back to the keeper every time","Kick it out"],0,"Yes. Switching finds the free side.","Switching to the free side makes the most of the space."),
   c('c-scan',"When should you look for a switch?",["After losing the ball","Before the ball reaches you","Only at half-time"],1,"Right. Scanning early saves time.","Look before the ball reaches you."),
   c('c-short',"Which of these also switches play?",["Standing still","Shouting loudly","A few quick passes across the back"],2,"Correct. Short passes across the back can switch it too.","Quick passes across the back also move the ball to the other side."),
   c('c-risky',"The far side is covered. What is the best choice?",["A safe nearby pass","A blind long ball","Kick it high into the stand"],0,"Yes. Keep it simple when the switch is not on.","When the far side is covered, a safe pass nearby is smarter.")
  ],
  openers:["Hi! I am drawing a passing map. Want to see the arrows?","Hello! Ask me in chat and we can check the latest J1 League news together.","Hey! Did you see the ball travel from one wing to the other? That was a switch.","Hi there! I love the moment a long pass opens up the whole pitch."],
  returning:["Back by the north stairs! Last time we talked about ‘{topic}’. New arrows today?","Hey again! I remember ‘{topic}’. My notebook has a new page for you.","Welcome back! After ‘{topic}’, let us look at another way to switch play."]
 },
 'stadium-crew-freya':{
  topics:[
   t('pan',"How do you follow the ball smoothly?","I pan the camera gently and keep a little space ahead of the ball. Sharp jerks would make viewers dizzy.","Why space ahead of the ball?","So viewers can see where the ball is going, not just where it was."),
   t('zoom-wide',"How wide do you keep the shot?","Wide enough to show the ball plus the nearest players from both teams. When play gets near a goal, I may zoom in a little."),
   t('gantry',"What is the gantry?","A high platform in the stand for cameras. From up there, I can see the whole pitch.","Is it scary up there?","Not really. There are rails and safety rules, and the view is amazing."),
   t('halfway-spot',"Why is the main camera on the halfway line?","From the middle, both halves look equally clear. Viewers can follow attacks either way.","Are there other high cameras?","Big broadcasts often add high cameras level with each penalty area, for attacks at either end."),
   t('talkback',"How do you know what the director wants?","I wear a headset and hear the director. They might ask me to go wider or stay on a player.","Do you talk back?","Only briefly, because the director is busy watching every camera."),
   t('long-ball',"What is the hardest moment to film?","A long, high ball. I must guess where it will land and keep it in the picture."),
   t('offside-camera',"Does the wide camera decide offside?","No. A wide picture shows where players are, but officials make the decision with their own views and special angles."),
   t('practice-filming',"How can I practise filming a match?","Film a local game from somewhere high and safe, like a small bank. Move slowly and keep the ball near the middle.","Do I need a big camera?","No. A phone held steady sideways is a great start.")
  ],
  challenges:[
   c('c-where',"Where does the main match camera usually sit?",["Behind a goal on the grass","High up on the halfway line","Inside the dressing room"],1,"Yes. High and central shows the whole game.","The main camera sits high up on the halfway line."),
   c('c-space',"When panning with the ball, where should you leave space?",["Ahead of the ball","Behind the ball","Above the roof"],0,"Correct. Space ahead shows where the ball is going.","Leave space ahead of the ball."),
   c('c-smooth',"Why pan the camera smoothly?",["To make the match longer","To hide the ball","So viewers are not dizzy"],2,"Right. Smooth moves are easy to watch.","Jerky moves make viewers dizzy."),
   c('c-headset',"How does the camera operator hear the director?",["By shouting across the stadium","Through a headset","By letters written in the sky"],1,"Yes. A headset keeps the instructions clear.","The director talks to the crew through a headset.")
  ],
  openers:["Hi! I am up on the gantry with the main camera. Nearly every moment you see on TV starts here.","Hello! Want to know how a match is filmed? Stand here and look at the view.","Hi there! My job is simple to say and tricky to do: follow the ball all match.","Hello! The warm-up is on, so I am practising my smooth pans."],
  returning:["Back on the gantry! Last time it was ‘{topic}’. Let us talk about another camera trick.","Hi again! I remember ‘{topic}’. I have a new filming secret today.","Welcome back! After ‘{topic}’, shall I show you something else up here?"]
 },
 'stadium-crew-mateus':{
  topics:[
   t('find-face',"How do you find the scorer so fast?","I watch the ball and the shooter at the same time. When it goes in, I zoom straight onto their face.","What if they run away?","I follow them and keep steady. Celebrations can go anywhere!"),
   t('coach-shot',"Why film the coaches?","Viewers like to see how coaches react and give instructions. A close-up of a coach tells part of the story.","Where do you film them from?","From up here with a long zoom, so I never get in anyone's way."),
   t('goal-cameras',"What do cameras behind the goal show?","The ball crossing the line and the keeper's side of the action. They are great for replays of goals and saves.","Are some cameras inside the goal?","Some broadcasts use tiny cameras near the net for exciting views."),
   t('low-touchline',"Why are some cameras low on the touchline?","Low cameras make the action look fast and close. You can see the players' feet and the ball skimming the grass."),
   t('slow-mo',"How does slow motion work?","Special cameras record many more pictures each second. Played back at normal speed, the action looks slow.","Why use slow motion?","To show tiny details, like a touch of the ball or a fingertip save."),
   t('kind-shots',"Do you film players who are upset?","We are careful and kind. A short shot can show how much the match matters, but we do not stay on it long."),
   t('many-cameras',"How many cameras does a big match use?","Often well over a dozen, each with a job. Together they give the director lots of choices.","Who chooses between them?","The director, watching all the pictures at once."),
   t('practice-close',"How could I practise close-ups?","Ask a friend to dribble and keep their feet in the picture as you follow. It trains steady hands.")
  ],
  challenges:[
   c('c-closeup',"What does a close-up camera mostly show?",["The whole pitch","One person's face or action","The empty seats"],1,"Yes. Close-ups show feelings and details.","Close-ups zoom in on one person."),
   c('c-behind',"Why put cameras behind each goal?",["To see if the ball crossed the line","To film the roof","To count the fans"],0,"Correct. They are great for goal-line views and replays.","Behind-goal cameras show the goal line and how goals are scored."),
   c('c-slowmo',"How is slow motion made?",["By slowing the ball down","By filming fewer pictures","By recording many more pictures each second"],2,"Right. More pictures per second make smooth slow motion.","Slow motion needs many more pictures each second."),
   c('c-low',"What do low touchline cameras make the action feel like?",["Fast and close","Far away","Sleepy"],0,"Yes. Low angles feel fast and close.","Low cameras make the game feel fast and close.")
  ],
  openers:["Hello! I run the close-up camera. When a big moment happens, I find the face.","Hi! See this zoom lens? It can show a player's boots from across the pitch.","Hello there! Want to know how many cameras film a big match? More than you think!","Hi! I was just practising on the corner flag. It never runs away."],
  returning:["Back on the gantry! Last time it was ‘{topic}’. Ready for another camera story?","Hello again! I remember ‘{topic}’. Let us zoom in on something new.","You came back! After ‘{topic}’, I have a fresh close-up secret."]
 },
 'stadium-crew-callum':{
  topics:[
   t('prep',"How do you prepare for a match?","I learn every player's name, number and position, and note facts about both teams. My notes sit right on the desk.","Do you practise the names?","Yes! I check how to say each name properly. Players deserve that respect."),
   t('describe',"What is the main job of a commentator?","To help listeners follow every pass, tackle and shot as it happens. On radio, I describe more, because nobody can see the picture."),
   t('radio-tv',"Is radio commentary different from TV?","Very! On radio, I paint the whole picture with words. On TV, viewers can see it, so I add less.","Which is harder?","Radio, because you talk almost all the time."),
   t('silence',"Why do commentators go quiet sometimes?","When the picture says it all, like a big celebration, a pause lets the moment breathe.","How long is a good pause?","Just a few seconds. Then I tell listeners who scored and how it happened."),
   t('excitement',"How do you sound so excited for goals?","The excitement is real! I raise my voice for big moments and stay calm for quiet ones.","Do you ever lose your voice?","I drink plenty of water and warm up my voice before the match."),
   t('fair',"How do you stay fair to both teams?","I praise good play from either side and describe what happens, not what I want to happen."),
   t('co-comm',"Why are there two people in the box?","I describe the action, and my co-commentator explains why it happens. Together we tell the story.","How do you not talk over each other?","We take turns, and a little hand signal helps."),
   t('become',"How do people become commentators?","Many start by commentating on local games, school matches or practice videos. Listening to lots of commentary helps too.")
  ],
  challenges:[
   c('c-job',"What is a commentator's main job?",["Refereeing the match","Describing the play for people at home","Mowing the pitch"],1,"Yes. Commentators describe the play.","Referees run the match. Commentators describe it."),
   c('c-radio',"On radio, why do commentators describe more?",["Listeners cannot see the picture","They are paid per word","Radio has no players"],0,"Correct. Words must paint the picture.","Radio listeners cannot see the match, so words do the work."),
   c('c-pause',"A goal is scored and the crowd roars. What might a good commentator do?",["Talk nonstop over everything","Leave the box","Let the moment breathe for a second"],2,"Right. A pause can make a big moment feel even bigger.","Sometimes a short silence is the best commentary."),
   c('c-prep',"What should a commentator learn before kick-off?",["Every player's name and number","Only the lunch menu","Nothing, just turn up"],0,"Yes. Good homework makes good commentary.","Learning names and numbers is the most important homework.")
  ],
  openers:["And who is this joining us in the commentary box? Hello! Welcome to the best seat in the house.","Hello! Headset on, notes ready. Want to hear how a commentator gets ready?","Hi there! I am warming up my voice. Do not mind the odd lovely ball!","Welcome! I am just checking how to say every name on the team sheet."],
  returning:["And they are back! Last time we covered ‘{topic}’. Let us pick a new talking point.","Hello again! I remember ‘{topic}’. My notes have something fresh today.","Welcome back to the box! After ‘{topic}’, here comes a new commentary secret."]
 },
 'stadium-crew-adaeze':{
  topics:[
   t('gallery',"Where does the director work?","In a room full of small pictures, one for each camera. They pick which one viewers see.","Is that room in the stadium?","Often it is a big truck outside, called an outside broadcast truck."),
   t('when-replay',"When does the director show a replay?","Usually when the ball stops, like after a goal, a foul or a big save. Then viewers do not miss live action."),
   t('replay-angle',"Why show a replay from another camera?","A new angle can show what the first one missed, like a defender's touch or a clever run.","Which angle is best?","It depends! For goal-line moments, the camera behind the goal often helps most."),
   t('why-tactics',"What does explaining tactics mean?","I explain why a team does something, like pressing high or switching play. It helps viewers understand the plan."),
   t('watch-off-ball',"What should I watch off the ball?","Watch the players without the ball and where they run. Great moves start before the pass.","Any tip for beginners?","Pick one player and watch only them for five minutes."),
   t('former-player',"Does having played help you explain?","Yes. I remember how it felt on the pitch, so I can explain the choices players make.","Which position did you play?","I was a midfielder, so I always loved seeing the whole pitch."),
   t('graphics',"Who adds the score in the corner?","A graphics team adds the score, the clock and the names. The director decides when extra graphics appear.","Can graphics show formations?","Yes, some broadcasts draw lines and arrows to explain tactics."),
   t('stay-live',"Why not show replays during play?","Viewers might miss a goal! Live action comes first, and replays wait for a pause.")
  ],
  challenges:[
   c('c-director',"Who chooses which camera picture you see?",["The director","The goalkeeper","The fans"],0,"Yes. The director picks every shot.","The director chooses the pictures."),
   c('c-replay-time',"When is the best time to show a replay?",["During a fast attack","When the ball stops","Never"],1,"Correct. A pause means no live action is missed.","Replays wait for a stop in play."),
   c('c-angle',"Why show a replay from a different camera?",["To use up time","To make it blurry","To show what the first view missed"],2,"Right. New angles reveal new details.","Different angles show details the first view missed."),
   c('c-off-ball',"Where do many great moves start?",["Off the ball, before the pass","Once the match has ended","In the car park"],0,"Yes. Runs off the ball set up the pass.","Watch off the ball, because moves start before the pass.")
  ],
  openers:["Hi! I explain the why behind every move. Want to watch the next attack with me?","Hello! Did you know the director is watching every camera at once right now?","Hi there! I played for many years before joining the commentary box.","Hello! Look at that pressing on the left. I will explain it if you like."],
  returning:["Back in the box! Last time it was ‘{topic}’. Shall we break down another tactic?","Hi again! I remember ‘{topic}’. The match has given me new ideas.","Welcome back! After ‘{topic}’, let us look at another part of the broadcast."]
 },
 'stadium-photo-joon':{
  topics:[
   t('marked-area',"Where are photographers allowed to sit?","In marked areas behind the goal lines and along the sides, away from play. Stewards check that we stay there.","Why so strict?","Players, officials and the ball need space. Safety comes first."),
   t('burst',"How do you catch the perfect moment?","I shoot in quick bursts, many pictures a second, then choose the best one later."),
   t('celebration',"Why do players run toward you after scoring?","They often run to the fans behind the goal, and that is where I sit. It makes great celebration photos.","Do you ever get hit by the ball?","Sometimes a ball flies our way, so we always keep watching the play."),
   t('sit-low',"Why do photographers sit on the ground?","Sitting low keeps us out of the fans' view, and low angles make players look powerful."),
   t('emotion',"What makes a photo special?","A clear feeling, like joy, effort or surprise, with the ball in the picture if possible.","Do photos always need the ball?","Not always. A happy team hug can tell the story too."),
   t('swap-ends',"Do you move at half-time?","Many photographers switch ends, because the teams swap ends and attack the other goal.","Do you carry everything yourself?","Yes: cameras, lenses and a small stool, so I pack light."),
   t('keeper-photos',"Is the keeper fun to photograph?","Very! A diving save looks amazing from behind the goal."),
   t('start',"How can I start taking sports photos?","Photograph friends playing in the park. Get low, follow the ball and take lots of shots.","Which spot should I choose?","Try behind a small goal, safely out of the way.")
  ],
  challenges:[
   c('c-why-goal',"Joon sits behind the goal line all match. Why there?",["Most big moments happen near the goals","It is warmer there","They lost their tickets"],0,"Yes. Shots, saves and celebrations happen there.","Behind the goal is where most big moments happen."),
   c('c-marked',"Where must pitch-side photographers stay?",["On the pitch","In marked areas away from play","In the dugout"],1,"Correct. Marked areas keep everyone safe.","Photographers stay in marked areas, away from play."),
   c('c-burst',"How do photographers catch the perfect moment?",["One photo per match","Painting it later","Quick bursts of many photos"],2,"Right. Bursts give lots of choices.","Bursts of many photos help catch the moment."),
   c('c-half-time',"Why might photographers switch ends at half-time?",["The teams swap ends","The seats are cold","To find snacks"],0,"Yes. They follow the attacks.","The teams swap ends, so photographers often do too.")
  ],
  openers:["Shh, the striker is lining up. Hi! I take photos from behind this goal.","Hello! Right here is where the attacks come toward you. Best seat for a photographer.","Hi! I already took a hundred photos in the warm-up. I might keep one.","Hello there! Sit quietly with me and wait for a big moment."],
  returning:["Back behind the goal? Last time we talked about ‘{topic}’. Ready for another photo tip?","Hi again! I remember ‘{topic}’. I have new pictures to talk about.","You came back! After ‘{topic}’, let us wait for the next big moment together."]
 },
 'stadium-photo-esme':{
  topics:[
   t('telephoto',"How does a long lens work?","It magnifies faraway things, like binoculars. I can fill the picture with a player across the pitch.","Can it see the stand opposite?","Yes, though I mostly point it at the action."),
   t('shutter',"What is shutter speed?","How long the camera lets light in for each picture. A very fast shutter freezes moving players and the ball.","How fast is fast?","For football, often a thousandth of a second or quicker."),
   t('no-flash',"Why no flash beside the pitch?","A flash could dazzle players at the wrong moment. The floodlights give enough light.","What do you do on a dull day?","I set the camera to gather more light in other ways, never with a flash."),
   t('monopod',"What is a monopod?","A one-legged stand that holds a heavy lens steady. It is quicker to move than a three-legged tripod."),
   t('focus',"How do you keep the player sharp?","The camera keeps adjusting focus as the player moves, and I keep the focus point on them.","What if two players cross?","Then I stay locked on my player and keep shooting."),
   t('blur-art',"Is a blurry photo ever good?","Sometimes a slower shutter shows speed, with blur behind a player. It is an art choice."),
   t('rain-lens',"How do you protect your lens from rain?","A rain cover fits over the camera and lens. A soft cloth for wiping drops helps too.","Does rain spoil photos?","Not always. Rain splashes can look dramatic."),
   t('night-photos',"Is it harder at night?","Floodlights help, but there is less light than sunshine. Cameras can be set to be more sensitive to light.")
  ],
  challenges:[
   c('c-lens',"Why do photographers use long lenses?",["To photograph far players without walking on","To look taller","To keep their hands warm"],0,"Yes. A long lens brings far action close.","Long lenses let photographers stay off the pitch."),
   c('c-shutter',"What freezes a flying ball in a photo?",["A slow shutter","A fast shutter","Shutting your eyes tight"],1,"Correct. A fast shutter freezes motion.","A fast shutter freezes the ball."),
   c('c-flash',"Why do pitch-side photographers avoid flash?",["Flash is too heavy","Flash makes balls bigger","Flash could dazzle players"],2,"Right. No flash keeps players safe.","Flash can dazzle players, so it is not used pitch-side."),
   c('c-mono',"What holds a heavy lens steady pitch-side?",["A monopod","A balloon","A shin pad"],0,"Yes. A monopod is quick and steady.","A one-legged monopod supports the lens.")
  ],
  openers:["Hi! Mind the big lens, please. It can see all the way to the far goal.","Hello! Want to know how I freeze a flying ball? It is all about speed.","Hi there! I am checking my shutter speed before kick-off.","Hello! Ever looked through a lens this long? It is like a telescope for football."],
  returning:["Back behind the north goal! Last time it was ‘{topic}’. Ready for another camera trick?","Hi again! I remember ‘{topic}’. Let me show you another photo secret.","You returned! After ‘{topic}’, here is something new about lenses."]
 },
 'stadium-photo-rafael':{
  topics:[
   t('send',"How do photos travel so fast?","My camera links to my laptop, and I send the best ones over the internet during the match.","How many do you send?","Only the best few. Editors want quality, not hundreds."),
   t('editor-choice',"What does a photo editor do?","They pick the photo that best tells the match story, and might crop it to fit the page."),
   t('caption',"What is a caption?","A short line with the photo saying who, what and when. It helps readers understand the moment.","Who writes captions?","Often the photographer adds the basic details, and editors polish them."),
   t('bib-colour',"Why is your bib so bright?","So stewards, officials and players can see me easily and know I am allowed here.","Does every bib have a number?","Many do, so officials know exactly which photographer is which."),
   t('permission',"How do you get a pitch-side spot?","Photographers ask the club or competition for permission, called accreditation. Then they get a bib.","Can kids do it?","Not at big matches, but kids can photograph local games with permission."),
   t('touchline-view',"What can you see from the touchline?","Tackles, dribbles and coaches' reactions. The side view shows the players' speed and effort."),
   t('quiet-work',"Do you ever talk to players during play?","No. Photographers stay quiet and out of the way, so the match is not disturbed."),
   t('best-story',"How do you choose the best photo?","I look for a sharp picture with a clear moment and feeling, then send it fast.","What makes it the story?","It shows what mattered most, like the winning goal or a great save.")
  ],
  challenges:[
   c('c-bib',"Why do pitch-side photographers wear a bib?",["To show they are allowed there","To keep their shirt clean","To join the team"],0,"Yes. The bib shows permission.","The bib shows stewards and officials that the photographer is allowed pitch-side."),
   c('c-send',"How do photos reach news websites during the match?",["By post next week","Sent over the internet","Carried by a pigeon"],1,"Correct. Photos go out over the internet in minutes.","They are sent over the internet, fast."),
   c('c-editor',"Who often chooses which photo is used?",["The fourth official","The home keeper","An editor"],2,"Right. Editors pick the photo that tells the story.","Editors choose the photo."),
   c('c-quiet',"Should photographers shout at players during play?",["No, they stay quiet","Yes, loudly","Only at corners"],0,"Yes. Quiet and out of the way.","Photographers stay quiet so the match is not disturbed.")
  ],
  openers:["Hello! I just sent a photo to the newsroom. Fans at home might see it already.","Hi! This bright bib means I am allowed beside the pitch. Want to know how?","Hello there! From the touchline, I can feel how fast the players are.","Hi! My laptop is charged and my camera is ready. Big match today!"],
  returning:["Back on the touchline! Last time it was ‘{topic}’. I have another newsroom story.","Hi again! I remember ‘{topic}’. Let me tell you something new about sports photos.","Welcome back! After ‘{topic}’, here is another fast-photo secret."]
 },
 'stadium-viewer-sol':{
  topics:[
   t('where-public',"Where do towns put public viewing screens?","Often in squares, parks or near stadiums during big tournaments. Lots of fans can watch together.","Is it like being at the match?","It feels close, with cheers and groans together, even though the players are far away."),
   t('delay',"Why do some people cheer before we see the goal?","The picture takes a moment to travel from the cameras to each screen. Someone watching another feed might see it a little sooner."),
   t('picture-path',"How does the picture reach this screen?","The cameras send their pictures to the director, who chooses the shot. Then the chosen picture is sent out to screens.","Does it go through a truck?","Often, yes. The outside broadcast truck mixes the cameras and sends the picture on."),
   t('good-spot',"Where is the best place to stand?","Somewhere you can see clearly without blocking others, and close to your grown-up.","What if I am small?","Ask your grown-up to find a spot near the front, safely away from the paths."),
   t('behave-public',"How should I behave at a public viewing?","Just like in a stand: cheer, clap good play from both sides, and keep the paths clear.","Can we sing?","Yes, friendly songs make it even more fun."),
   t('rain-public',"What if it rains during public viewing?","Bring a coat or a hood. Some places have cover, but many fans just cheer through the rain."),
   t('why-together',"Why watch together and not at home?","Sharing the nervous moments and the goals with lots of people feels special.","Do you make friends there?","Often! Football gives everyone something to chat about."),
   t('screen-replay',"Do public screens show replays too?","Yes. They show the same broadcast, with the replays and the score.")
  ],
  challenges:[
   c('c-picture',"Where does the picture on the public screen come from?",["Cameras inside the stadium","A painter","The fans' phones"],0,"Yes. The broadcast cameras send it.","It comes from the broadcast cameras inside the stadium."),
   c('c-path',"Who chooses which shot the screen shows?",["A steward","The match director","The striker"],1,"Correct. The director picks the shot.","The director picks which shot goes out."),
   c('c-spot',"Where should you stand at a public viewing?",["Blocking the path","On top of a bin","With your grown-up, not blocking others"],2,"Right. Safe and fair for everyone.","Stay with your grown-up and keep the paths clear."),
   c('c-clap',"The other team scores a brilliant goal. What can a good fan do?",["Clap a great goal anyway","Throw things","Boo as loud as possible"],0,"Yes. Respect makes it fun for everyone.","A great goal deserves respect, whichever team scored it.")
  ],
  openers:["Hi! Come and stand with us. The match is on out here too.","Hello! Public viewing is the best. It is like a giant living room full of fans.","Hey! Want to know how the match gets onto this screen? I just found out.","Hi! I am saving a spot for my friends, but there is room for you too."],
  returning:["Back for public viewing! Last time it was ‘{topic}’. Let us watch and chat some more.","Hey again! I remember ‘{topic}’. Stand with us for another question?","Welcome back! After ‘{topic}’, I learned something new about how matches reach us."]
 },
 'stadium-viewer-ingeborg':{
  topics:[
   t('near-miss',"What is a near miss?","A shot that almost goes in, just past the post or over the bar. The crowd often says ooh.","Why does everyone say ooh?","It is a natural sound of surprise. The goal almost happened!"),
   t('read-score',"How do I read the score box?","Look for each team's name with its goals beside it, plus the minute played. Usually the home side comes first.","What does plus three by the clock mean?","Added time: extra minutes the referee adds for stoppages."),
   t('added-time',"Why do referees add extra minutes?","Minutes added at the end of each half for time lost, like injuries or substitutions."),
   t('space-watch',"How do I see where the space is?","Look for gaps between players. The team with the ball spreads out, and the defenders try to close the gaps.","Who finds the space?","Clever runners off the ball. Watch them, dear!"),
   t('replay-watch',"What should I look for in a replay?","Watch the moment just before the shot or tackle. Replays show what was too quick to see live."),
   t('substitution',"What is a substitution?","A coach swaps a player for a fresh one from the bench. An official holds up a board with the numbers.","How many are allowed?","It depends on the competition. Many top leagues allow five."),
   t('half-time',"What do teams do during the break?","Players rest, drink and listen to their coach. Then the teams swap ends for the second half."),
   t('yellow-card',"What does a yellow card mean?","It is a caution for things like a reckless tackle. Two yellows in one match make a red card.","And a red card?","The player must leave the pitch, and the team plays with one fewer.")
  ],
  challenges:[
   c('c-near',"The ball flies just past the post. What is that called?",["A near miss","A corner goal","A sideline throw"],0,"Yes. A near miss, so close!","It is a near miss: so close to a goal!"),
   c('c-added',"The clock shows plus three at the end of the half. What does that mean?",["Time for the fans to leave","Extra minutes for stoppages","A second match"],1,"Correct. Added time makes up for lost minutes.","Added time is extra minutes for stoppages."),
   c('c-two-yellows',"A player gets two yellow cards in one match. What happens?",["Nothing happens","They get a medal","It becomes a red card"],2,"Right. Two yellows make a red.","Two yellow cards in one match mean a red card."),
   c('c-replay-look',"In a replay, which moment is worth watching closely?",["The moment just before the shot","The hats in the crowd","The clouds"],0,"Yes. The build-up shows how it happened.","Watch just before the shot to see how it happened.")
  ],
  openers:["Ooh, hello, dear! Stand with me and I will explain everything as it happens.","Hello! Did you see that run? Let me tell you what the striker was thinking.","Hello, dear! I bring my folding chair and my flask to every match out here.","Oh, hello! I love explaining football to new friends. Ready to watch?"],
  returning:["Hello again, dear! Last time we chatted about ‘{topic}’. Shall I explain something new?","You came back! I remember ‘{topic}’. Let us watch the next move together.","Welcome back! After ‘{topic}’, there is plenty more to explain."]
 },
 'stadium-viewer-kwabena':{
  topics:[
   t('clap-both',"Is it fine to clap the other team?","Yes! Applauding a fine save or a clever pass from either side shows respect. Good fans enjoy good football.","Will my team mind?","Not at all. Players like playing in front of fair fans."),
   t('chant-kind',"How do I make up a fan chant?","A good chant is about your own team, simple to join in and kind. Nobody needs to be put down.","Can I make one up?","Sure! Pick your team's name and a clap pattern everyone can copy."),
   t('lose-cheer',"Should I stop cheering when we are behind?","Keep going! Players say the noise helps them, and a match can turn in a few minutes."),
   t('crowd-noise',"Does crowd noise really help players?","Many players say a loud, warm crowd gives them energy. Some studies suggest home teams win a little more often.","Is it fair on the away team?","It is part of the game. The away fans cheer their side too."),
   t('injury-clap',"Why clap an injured player off?","When an injured player gets up or is helped off, both sets of fans often clap. It wishes them well."),
   t('scarf-up',"Why do fans hold scarves above their heads?","It is a way to show team colours together, often during a club song. The whole stand turns into one colour.","Do I need a scarf?","No. Clapping and singing work just as well."),
   t('watch-manners',"How do I stay a good neighbour here?","Do not block the view of people behind you, keep bags out of the path and cheer without pushing."),
   t('full-time-clap',"What do players do at the final whistle?","They shake hands with opponents and the referee, then often walk over to clap their fans. Fans clap back.","Even after a loss?","Yes. Thanking your fans matters win or lose.")
  ],
  challenges:[
   c('c-kw-save',"The other team's keeper makes a brilliant save. What can a good fan do?",["Clap the great save","Boo very loudly","Turn the screen off"],0,"Yes. Applause for good play is good sport.","Clapping a great save, even by the other team, is good sport."),
   c('c-kw-behind',"Your team is one goal behind with ten minutes left. What helps most?",["Going home early","Keep cheering them on","Booing your own players"],1,"Right. Support helps when it is hardest.","Keep cheering: a match can change in minutes."),
   c('c-kw-view',"A small child cannot see the screen behind you. What do you do?",["Stand on a bench","Pretend not to notice","Let them stand in front"],2,"Kind choice. Everyone gets to watch.","Let them in front so everyone can watch."),
   c('c-kw-whistle',"What do players usually do at the final whistle?",["Shake hands with opponents","Start a new match","Hide in the goal"],0,"Yes. A handshake ends the game with respect.","They shake hands with opponents and the referee.")
  ],
  openers:["Hello, friend! The best seat out here is wherever your friends are standing.","Hi there! I clap for every nice pass, whichever shirt makes it.","Welcome! Bring your loudest cheer, we need it for the second half.","Hey! First time at the watch party? Stand next to me, I will show you the claps."],
  returning:["Hello again! Last time it was ‘{topic}’. Ready to cheer some more?","You are back! I still think about ‘{topic}’. Let us talk about something new.","Good to see you! After ‘{topic}’, here is another fan tip."]
 },
 'stadium-viewer-lumi':{
  topics:[
   t('post-bar',"What is the woodwork?","The two posts and the crossbar of the goal. A shot that hits them and bounces out is not a goal.","Is it a goal if it bounces in?","Yes, if the whole ball crosses the goal line between the posts."),
   t('whole-ball',"When does a goal count?","Only when the whole ball crosses the whole goal line, between the posts and under the bar. Half over the line is not enough."),
   t('on-target',"What does a shot on target mean?","A shot that would go in if nobody stopped it. Saves count as shots on target, but misses do not.","And off target?","A shot going wide or over the bar."),
   t('keeper-save',"How do keepers make big saves?","They get set as the striker shoots, watch the ball and push it wide of the post if they cannot hold it.","Why push it wide?","So no attacker can tap the rebound into the goal."),
   t('rebound',"What is a rebound?","When the ball bounces back off the keeper, a defender or the post. Quick attackers follow every shot in case it comes loose."),
   t('goal-line',"Who decides if the ball crossed the line?","The referee, with help from the assistants. Big leagues also use goal-line technology that tells the referee in a second.","How does it tell them?","A signal goes to the referee's watch."),
   t('try-again',"How do strikers feel after a near miss?","Disappointed for a moment, then they get ready for the next chance. Good strikers keep shooting."),
   t('aim-corner',"Where is the hardest place for a keeper to reach?","The low corners and the top corners, far from where the keeper stands. Aiming for a corner makes saves harder.","Low or high?","Low and hard is a good habit for young players.")
  ],
  challenges:[
   c('c-lu-bar',"A shot hits the crossbar and bounces out. Is it a goal?",["No, the ball must cross the line","Yes, it touched the goal","Only on a sunny day"],0,"Right. Hitting the bar is a near miss.","No goal: the whole ball must cross the line."),
   c('c-lu-half',"Half of the ball is over the goal line. Goal or not?",["It counts as a goal","Not a goal yet","A free kick to the keeper"],1,"Correct. The whole ball must be over.","Not a goal yet: the whole ball must cross."),
   c('c-lu-rebound',"The keeper saves, and the ball bounces loose. What should an attacker do?",["Stroll back to halfway","Ask for a new ball","Follow up for the rebound"],2,"Yes. Always follow your shot in.","Follow up: rebounds turn near misses into goals."),
   c('c-lu-corner',"Which spot is hardest for a keeper to reach?",["Low in the corner","Straight into their gloves","Straight at their feet"],0,"Yes. Corners are far from the keeper.","The corners are hardest to reach.")
  ],
  openers:["Hi! My hands are still over my face from that last shot.","Hello! Did you see it hit the post? I nearly jumped out of my shoes!","Hey! I count the near misses. We are on four already!","Hi there! Stand here, you can see the goalmouth best from this spot."],
  returning:["You came back! We talked about ‘{topic}’ last time. Want another?","Hi again! I remember ‘{topic}’. Here is another so-close story.","Welcome back! After ‘{topic}’, let me tell you something new."]
 },
 'stadium-viewer-rangi':{
  topics:[
   t('kick-off-rule',"How does a kick-off work?","The ball starts on the centre mark and must move when it is kicked. Every player stays in their own half until then.","Can you score from kick-off?","It is allowed by the Laws, but it almost never happens."),
   t('coin-toss',"Who kicks off first?","The referee tosses a coin. The winning captain picks which goal to attack or chooses to take the kick-off."),
   t('swap-ends',"Why do teams change goals after the break?","So neither team has the sun or the wind behind it all match. It keeps things fair.","Does the other team start the second half?","Yes. The team that did not kick off first gets the next kick-off."),
   t('walk-out',"Why do teams walk out together?","It is a sign of respect before kick-off. Then they line up and shake hands.","Why do players shake hands?","To show they will play fairly."),
   t('warm-up',"Why do players warm up before a match?","Jogging, stretching and short passes get muscles ready and help prevent injuries."),
   t('half-length',"How long is each half?","In adult matches each half is 45 minutes. Youth matches are often shorter, depending on age.","Is the break long?","Half-time can last up to 15 minutes."),
   t('restart-goal',"What happens after a goal is scored?","The team that let the goal in restarts play. They kick off from the middle of the pitch."),
   t('extra-time',"What is extra time?","In some cup matches that end level, teams play two more halves of 15 minutes. If it is still level, there can be penalties.","Is it every match?","No, only when a winner is needed that day.")
  ],
  challenges:[
   c('c-ra-coin',"How is it decided who kicks off first?",["A coin toss","Whoever runs out first","The loudest fans"],0,"Yes. The referee tosses a coin.","A coin toss decides it."),
   c('c-ra-after',"A team has just conceded a goal. How does play restart?",["A throw from the touchline","A kick-off by the team that conceded","A free kick to the scorers"],1,"Right. The team that conceded kicks off.","The team that let the goal in kicks off."),
   c('c-ra-swap',"Why do teams change ends at half-time?",["To find their bags","To meet new fans","To keep the sun and wind fair"],2,"Correct. Fairness for both sides.","Swapping ends keeps the sun and wind fair."),
   c('c-ra-warm',"Why do players warm up before kick-off?",["To get muscles ready","To wear out their legs early","To pick the referee"],0,"Yes. Warm muscles are less likely to get hurt.","A warm-up gets muscles ready and helps avoid injury.")
  ],
  openers:["Hey! I always get here early to see the warm-up on the screen.","Hi! The teams are in the tunnel. Kick-off is soon!","Hello! Do you know who won the coin toss today? I do!","Hey there! Half-time is my favourite time to chat."],
  returning:["Hey, you came back! We chatted about ‘{topic}’. Want another match-day fact?","Good to see you again! After ‘{topic}’, here is something new.","Hello again! I remember ‘{topic}’. Ready for the next one?"]
 },
 'stadium-viewer-zawadi':{
  topics:[
   t('why-replay',"Why does the screen show replays?","Live play is quick. A replay shows the key moment again, often from a different camera, so you can see what really happened.","Do players watch replays?","Coaches and players study them after the match to learn."),
   t('pitch-monitor',"Can the referee watch a replay too?","Yes. When VAR spots a possible clear mistake, the referee can jog to a monitor beside the pitch and watch it before deciding."),
   t('angle-matters',"Why do replays use different cameras?","One angle can hide a touch or a foot. Another camera behind the goal or along the line can show it clearly.","Which camera is best?","It depends on the moment. That is why there are many."),
   t('var-what',"What is VAR?","The video assistant referee watches replays to help the referee with four kinds of big moment: goals, penalty decisions, direct red cards and a card shown to the wrong player.","Does VAR decide?","No. VAR only advises, and the match referee has the last word."),
   t('build-up',"What should I notice in a goal replay?","Look back two or three passes. The goal often starts with a clever pass or a run that pulled a defender away."),
   t('learn-replay',"Can I learn from watching replays?","Yes! Pause on a moment and ask what you would do. It trains your football brain.","What should I pause on?","The moment just before a pass. Where is the space?"),
   t('screen-delay',"Why is the screen a bit behind real life?","Pictures travel from the cameras to the screen through equipment that takes a moment. It is only a tiny delay."),
   t('highlights',"What are highlights?","A short video of the best moments: goals, saves and big chances. They help you catch up quickly.","Is watching the whole match better?","It shows more of the tactics, so try both.")
  ],
  challenges:[
   c('c-za-var',"Who makes the final decision when VAR checks a goal?",["The loudest supporters","The referee out on the grass","The stadium announcer"],1,"Right. The referee decides.","VAR only helps. The match referee has the final say."),
   c('c-za-angle',"Why might a replay come from a camera behind the goal?",["It can show what the main angle hides","It is the cheapest camera","It films the crowd"],0,"Yes. Another angle shows more.","A different angle can show what the main camera hides."),
   c('c-za-build',"In a goal replay, where does the goal often really start?",["At the final whistle","At half-time","A few passes before the shot"],2,"Correct. Look at the build-up.","The build-up a few passes earlier usually makes the goal."),
   c('c-za-highlights',"You missed the match. What gives you the best bits in a few minutes?",["A short highlights video","The team bus timetable","The pitch markings"],0,"Yes. Highlights show goals, saves and big chances.","A highlights video packs in the best moments.")
  ],
  openers:["Hello! Keep your eyes on the screen, a replay is coming.","Hi! I love the slow-motion bits. You see every touch.","Hello there! Did you spot the pass before that chance? The replay will show it.","Hi! I always learn something new from a good replay."],
  returning:["Hello again! Last time it was ‘{topic}’. Shall we watch another replay together?","Welcome back! I remember ‘{topic}’. Here is a new one for you.","Nice to see you! After ‘{topic}’, there is more to spot."]
 },
 'stadium-viewer-arlo':{
  topics:[
   t('score-box',"What is in the corner of the screen?","The score box: both team names, their goals and the match clock. Some also show cards and added time."),
   t('clock-count',"How does the match clock count?","Upwards: the first half runs to 45 minutes, and the second half carries on from 45 to 90.","Does it ever stop?","The clock on screen keeps going. Lost time is added at the end."),
   t('draw-what',"What is a draw?","When both teams score the same number of goals, like 1-1 or 0-0. In a league, each team gets one point.","And a win?","A win gets three points, a loss gets none."),
   t('board-numbers',"What does the board at the end of a half show?","The fourth official holds up a board with the minimum minutes of added time."),
   t('clean-sheet',"Why is the keeper so happy at nil?","When a team lets in no goals in a match. Keepers and defenders are proud of them.","Can you keep one and lose?","No. With zero goals against, you cannot lose."),
   t('league-table',"What is a league table?","A list of teams ordered by points. If points are level, things like goal difference decide who is higher.","How is goal difference worked out?","Take the goals a team scored and subtract the goals it let in."),
   t('come-back',"What is a comeback?","When a team that is losing fights back to draw or win. That is why fans watch until the end."),
   t('half-score',"Why does the screen show HT?","HT means half-time, and FT means full time. The score beside it is the score at that moment.","What does KO mean?","Kick-off: when the match starts.")
  ],
  challenges:[
   c('c-ar-draw',"A match ends 2-2. What is the result?",["A draw","A home win","An away win"],0,"Yes. Same goals each, a draw.","Equal goals is a draw."),
   c('c-ar-points',"In a league, how many points does a win usually give?",["Just a single point","Three league points","A full ten points"],1,"Correct. Three for a win.","A win gives three points."),
   c('c-ar-ft',"The screen shows FT next to the score. What does it mean?",["First touch","Free throw","Full time"],2,"Right. The match has finished.","FT means full time."),
   c('c-ar-sheet',"A keeper lets in no goals all match. What is that called?",["A clean sheet","A golden goal","A long ball"],0,"Yes. A clean sheet!","No goals let in is a clean sheet.")
  ],
  openers:["Hi! Quick, look at the little score box up there!","Hello! I keep track of every goal in my notebook.","Hey! How many minutes are left? I always know.","Hi there! Do you want to learn to read the score box like an expert?"],
  returning:["Hi again! We talked about ‘{topic}’. Ready for more score facts?","You are back! I remember ‘{topic}’. Here is a new one.","Hello again! After ‘{topic}’, let me show you another part of the screen."]
 },
 'stadium-viewer-elif':{
  topics:[
   t('off-ball',"What does off the ball mean?","Everything a player does when they do not have the ball: moving, calling, covering and making space."),
   t('decoy-run',"Why run where the ball will not go?","A run that pulls a defender away so a teammate gets more space. The runner may never touch the ball, but it still helps.","Is that a waste?","Not at all! Good teams make lots of them."),
   t('back-line',"Why does the back line move together?","Defenders step up and drop back as one line, so there are no big gaps and attackers are easier to catch offside.","Who leads the line?","Often a centre-back calls when to step up."),
   t('find-space',"How do players find space?","They look around often, then move away from defenders into gaps where a pass can reach them."),
   t('check-shoulder',"Why do players look over their shoulder?","To see who is behind them before the ball arrives. Then they know whether to turn or pass back.","Is one quick look enough?","Take several looks, and one more just before the ball comes."),
   t('show-feet',"What does show for the ball mean?","Moving into a spot where the passer can see you and the ball can travel safely. Call or wave so they know."),
   t('recover-run',"What is a recovery run?","When a team loses the ball, players sprint back towards their goal to help defend. Even strikers do it.","Is that tiring?","Very! That is why fitness matters."),
   t('watch-tip',"How can I watch a match like a coach?","Pick one player and watch only them for a few minutes. See where they move when they do not have the ball.","Which player should I pick?","Try someone who plays your position.")
  ],
  challenges:[
   c('c-el-decoy',"A player runs away from the ball so a teammate gets space. What is that?",["A run to make space","A sneaky handball","A back-pass to the keeper"],0,"Yes. Unselfish and clever.","That is a decoy run: it makes space for others."),
   c('c-el-shoulder',"Why do players check over their shoulder before receiving?",["To wave at fans","To see who is behind them","To check the clock"],1,"Right. Then they know what to do next.","They look to see who is behind them."),
   c('c-el-line',"Why do defenders move up and back as one line?",["To dance together","To rest their legs","To avoid gaps between them"],2,"Correct. No gaps, a stronger defence.","Moving together leaves no gaps."),
   c('c-el-lost',"Your team loses the ball. What should a striker often do?",["Make a recovery run back","Sit on the grass","Wait up front for the ball"],0,"Yes. Everyone helps defend.","A recovery run helps the team defend.")
  ],
  openers:["Hello, dear! Do not just follow the ball. Watch the runners!","Hello! Pick one player and watch them with me for a while.","Oh, hello! See that defender? She has not stopped talking all match.","Hello there! The cleverest moves happen away from the ball, you know."],
  returning:["Hello again, dear! We talked about ‘{topic}’. Shall we watch the runners again?","Welcome back! I remember ‘{topic}’. Here is something else to notice.","Ah, you came back! After ‘{topic}’, let me point out a new trick."]
 },
 'stadium-mascot-drip':{
  topics:[
   t('mascot-job',"What does a mascot do all day?","I lap the pitch, wave to every stand and give high fives. My job is to make match day feel friendly, especially for young fans.","Do mascots work every match?","At home matches, yes! It is a busy job with lots of waving."),
   t('kid-mascot',"How do kids become matchday mascots?","Many clubs pick children from local teams, schools or fan clubs. They walk out of the tunnel beside a player.","What do kid mascots do after?","Often they pose for a photo with the team, then go and watch the match."),
   t('stay-cool',"Is it hot inside a mascot costume?","Very! The person inside takes breaks in the shade and drinks plenty of water to stay safe."),
   t('half-time-race',"What is a mascot race?","Some grounds hold a silly mascot race at half-time. It is all for fun, and nobody minds who wins.","Do you ever win?","Sometimes! But I always shake hands with the other mascots afterwards."),
   t('rival-mascot',"Are you friends with other mascots?","Yes! When another club's mascot visits, I welcome them. Rivals on the pitch, friends off it."),
   t('cheer-crowd',"How do you get the crowd cheering?","Big waves, a little dance and clapping above my head. When fans copy me, the noise spreads round the stadium.","What is your splash dance?","A wiggle, a spin and a jump. I save it for goals!"),
   t('few-words',"Why do mascots not talk much?","Many mascots use waves and actions instead of words, so the character stays magical. Big gestures work even from far away."),
   t('water-drop',"Why are you a water drop?","Water keeps footballers going, so a drop felt perfect for DRIP FC. Every club mascot shows something about its club.","What do other mascots look like?","All sorts: animals, birds, even friendly monsters.")
  ],
  challenges:[
   c('c-hot',"Why do mascots take breaks and drink water?",["Costumes get very hot","They are bored of waving","To swap teams"],0,"Yes. Staying cool keeps the person inside safe.","The costume is hot, so breaks and water keep the wearer safe."),
   c('c-kid',"What do kid matchday mascots usually do?",["Referee the match","Walk out of the tunnel with a player","Take the penalties"],1,"Correct. It is a special walk out before kick-off.","Kid mascots walk out with the players before kick-off."),
   c('c-race',"Another mascot wins the half-time race. What does a good mascot do?",["Sulk in the tunnel","Demand a rematch at once","Shake hands and cheer"],2,"Right. Kindness is the mascot rule.","Mascot races are just for fun. Shake hands and cheer."),
   c('c-gesture',"Why do mascots use big gestures?",["Fans far away can see them","They keep the grass short","They make the pitch longer"],0,"Yes. A big wave reaches the top row.","Big gestures reach fans far away in the stands.")
  ],
  openers:["Splash! Hello there! Want a high five from the friendliest drop in town?","Hi! I just finished a lap of the pitch. Waving is harder work than it looks!","Hello! Mascots make match day fun. Shall I tell you how?","Splish splash! You look like a great cheerer. Want to practise with me?"],
  returning:["Splash, you are back! Last time we talked about ‘{topic}’. Ready for more mascot fun?","High five again! I remember ‘{topic}’. Let us chat about something new.","Hello again! After ‘{topic}’, I have another mascot secret for you."]
 },
 'stadium-bench-hollis':{
  topics:[
   t('one-person',"How many coaches can stand in the technical area?","Only one person at a time may give instructions from it. The others stay in the dugout.","Why only one?","So players hear one clear voice instead of many mixed messages."),
   t('stay-inside',"What if a coach steps out of the box?","The fourth official reminds them to go back. Coaches must behave responsibly and stay inside during play."),
   t('clear-message',"What makes an instruction clear?","It is short, starts with a name and says one thing, like Sam, hold your width. Players can take it in while running.","What if they still do not hear?","Use a gesture, like pointing, or wait for a stop in play."),
   t('effort-praise',"Why praise effort and not just goals?","Effort and good choices are things players control. Praising them helps players keep trying."),
   t('calm',"Why do you stay so calm?","Calm coaches help players think clearly. If I panic, the team feels it.","Do you ever get excited?","Of course! I just keep it brief and then get back to watching."),
   t('compact',"What does stay compact mean?","Keep the team close together, with small gaps between players. It makes us hard to play through.","Is compact the same as defending deep?","Not always. A team can be compact high up the pitch too, as long as the gaps stay small."),
   t('watching',"What do you watch during a match?","The shape of both teams, who is tired and where the space is. Then I decide on one change.","How do you remember it all?","My assistant takes notes, and we compare them at half-time."),
   t('after-match',"What do you say after a match?","Well done for the effort, one thing we learned and when training is. Win or lose, we shake hands with the other team first.")
  ],
  challenges:[
   c('c-tech-one',"How many people may coach from the technical area at a time?",["Only one person","Everyone on the bench","Nobody, ever"],0,"Yes. One voice at a time keeps it clear.","Just one coach at a time is allowed to stand and coach from that box."),
   c('c-instruction',"Which instruction is clearest during play?",["A ten-point plan","Sam, hold your width!","Lots of voices at once"],1,"Correct. A name and one message.","Short and clear wins. Use a name and one message."),
   c('c-effort',"A player tries hard but misses. What helps most?",["Total silence","A big frown","Praise the effort and say next one"],2,"Right. Praise keeps them brave.","Praise the effort so they keep trying."),
   c('c-outside',"A coach steps out of the technical area during play. Who reminds them?",["The fourth official on the touchline","The club mascot","A photographer"],0,"Yes. The fourth official keeps the benches in order.","The fourth official looks after the technical areas.")
  ],
  openers:["Hello! Welcome to my painted box. From here I coach the gold team.","Hi there! One clear message at a time, that is my coaching rule.","Hello! I like to watch quietly, then say one useful thing.","Good to see you! Want to know what coaches are allowed to do from here?"],
  returning:["Back at the technical area! Last time it was ‘{topic}’. Ready for another coaching idea?","Hello again! I remember ‘{topic}’. Let us talk about something new today.","You came back! After ‘{topic}’, I have another tip from the bench."]
 },
 'stadium-bench-teodor':{
  topics:[
   t('sub-process',"What happens when a coach makes a substitution?","The fourth official checks it and holds up the board. The player going off leaves, then the new player comes on at the halfway line.","Must the player go off at halfway?","No. They usually leave at the nearest point on the boundary, unless the referee says otherwise."),
   t('sub-number',"How many subs can a team make?","It depends on the competition. Many top competitions allow five, and youth games often allow rolling changes.","What are rolling subs?","Players can go off and come back on later. Many youth and small-sided games use them."),
   t('warm-subs',"How do you warm up the subs?","Jogging, stretches, quick feet and a few short sprints along the touchline. They must be ready the moment they are called."),
   t('sub-why',"Why does a coach make a substitution?","To bring fresh legs, change tactics or rest a tired or hurt player. One change can turn a whole game.","When is the best time?","Often at a stop in play, so the new player settles in quickly."),
   t('first-minute',"What should a sub do in their first minute?","Find their position, follow the one instruction and get an easy first touch. Confidence grows from there."),
   t('assistant-job',"What does an assistant coach do all match?","I help the head coach with notes, substitutes and training plans. I watch things the head coach might miss.","Do you ever coach from the box?","Only when the head coach sits down. One person at a time."),
   t('bench-behave',"How should subs behave on the bench?","Watch the game, cheer teammates and stay ready. Learning from the bench helps when you come on."),
   t('sub-bibs',"Why do subs wear bibs while warming up?","Bibs show the officials who the substitutes are, so nobody mixes them up with players on the pitch.","Do they take the bib off?","Yes, before they come on, so they match their team.")
  ],
  challenges:[
   c('c-board',"Who holds up the substitution board?",["The fourth official, between the benches","The goalkeeper coach","The commentator"],0,"Yes. The fourth official shows the numbers.","The fourth official holds up the board."),
   c('c-order',"In a substitution, which happens first?",["The new player runs on straight away","The player going off leaves first","Both play together for a minute"],1,"Correct. Off first, then on.","The player going off must leave before the new player comes on."),
   c('c-warm',"Why must subs warm up?",["To look busy","To tire themselves out","So muscles are ready and less likely to get hurt"],2,"Right. Warm muscles are quick and safer.","Warming up gets muscles ready and lowers the chance of injury."),
   c('c-sub-reason',"Which is a good reason for a substitution?",["Fresh legs for a tired team","To try on a new kit","To add extra minutes"],0,"Yes. Fresh legs can lift a team.","Subs bring fresh legs or a new plan.")
  ],
  openers:["Hi! Keep jogging, subs! Oh, hello. I am the gold team's assistant coach.","Hello! I am timing the warm-up. Subs must be ready in a flash.","Hi there! Want to know how a substitution really works?","Hello! I have the team sheet here, with every sub we can use."],
  returning:["Back by the bench! Last time it was ‘{topic}’. Ready for another bench story?","Hi again! I remember ‘{topic}’. Let us warm up a new question.","You returned! After ‘{topic}’, I have another subs secret."]
 },
 'stadium-bench-sakura':{
  topics:[
   t('count-back',"How do you count a formation?","Start from the defenders and count forward, so 4-3-3 means four at the back, three in midfield and three up front. The keeper is not in the numbers.","What is the most common shape?","Lots of teams use 4-4-2 or 4-3-3, but there are many more."),
   t('three-centre-backs',"What happens in a shape with three centre-backs?","Wing-backs give the width, and the three centre-backs guard the middle. Without the ball it can turn into a back five."),
   t('change-shape',"When do you change shape?","When the game changes, like when we need a goal or want to protect a lead. Even one player moving can change everything.","How do players know?","I tell the captain, who passes it on, and we practise shapes in training."),
   t('half-time-talk',"How long is your half-time talk?","Short. First rest and water, then two things to fix and lots of belief. Long speeches are hard to remember."),
   t('shape-defend',"Do teams have a different shape when defending?","Often, yes. A 4-3-3 might drop into 4-5-1 without the ball, so the wingers help in midfield.","Why change without the ball?","More players in midfield make it hard for the other team to play through."),
   t('flexible',"Should young players learn many positions?","Yes! Trying different spots helps you understand formations and what teammates need."),
   t('tactics-board',"What is a tactics board for?","It shows players where to stand, with magnets or drawings. Seeing a shape is easier than hearing it.","Do you use it at half-time?","Sometimes, to show one quick change."),
   t('opponent-shape',"How do you work out the other team's formation?","Watch where their players stand when they defend. Count back to front, just like with your own team.","Does it change during a match?","Often! That is why coaches keep watching.")
  ],
  challenges:[
   c('c-442',"In a 4-4-2, how many strikers are there?",["Two strikers","Four strikers","No strikers"],0,"Yes. Four, four and two up front.","Count from the back: four defenders, four midfielders, two strikers."),
   c('c-keeper-count',"Is the goalkeeper counted in a formation like 4-3-3?",["Yes, always first","No, the keeper is not counted","Only in cup games"],1,"Correct. The numbers are for outfield players.","The keeper is not counted in the formation numbers."),
   c('c-need-goal',"Your team needs a goal late on. Which change might help?",["Take off every striker","Add an extra defender","Add another attacker"],2,"Right. More attackers, more chances.","When you need a goal, adding an attacker helps."),
   c('c-talk',"What makes a good half-time talk?",["Short, with a couple of fixes and belief","An hour of shouting","No talk and no water"],0,"Yes. Short talks stick.","Keep it short: rest, a couple of fixes and belief.")
  ],
  openers:["Hello! Blue team head coach here. Shall I show you how a team changes shape?","Hello! My tactics board is full of magnets today.","Hi there! A formation is just a starting shape. The fun is changing it.","Hello! I am planning my half-time talk already. Short and sweet."],
  returning:["Back by the blue bench! Last time it was ‘{topic}’. Ready for another shape?","Hi again! I remember ‘{topic}’. Let us move some magnets today.","You returned! After ‘{topic}’, I have another tactic to share."]
 },
 'stadium-bench-yasmin':{
  topics:[
   t('specific',"What is specific praise?","Saying exactly what was good, like well done for looking before you passed. The player knows what to repeat.","Is good job enough?","It is kind, but specific praise teaches more."),
   t('next-one',"Why do you shout next one?","It tells a player to leave the mistake behind and focus on the next action. It keeps them brave."),
   t('mistake-help',"How do you help after a mistake?","A quick next one, then one simple idea for next time. Never a list of everything that went wrong.","What if they keep making it?","We practise it in training, calmly, until it feels easy."),
   t('notes',"What do you write in your notebook?","Good decisions, patterns in the other team and who looks tired. The head coach uses it at half-time."),
   t('bench-voice',"Can you give instructions from the bench?","A little encouragement, yes. Tactical instructions come from one coach at a time in the technical area.","So who gives them?","Usually the head coach, and I help with ideas."),
   t('confidence',"How do you help a nervous player?","Give them an easy first job and praise it straight away. Small wins build confidence."),
   t('tracking-back',"Why praise tracking back?","Running back to defend is hard and does not get many cheers. Praising it shows the whole team it matters.","Who should track back?","Everyone, when the ball is lost. Football is a team game."),
   t('pre-match',"What do you say before the match?","Enjoy it, work for each other and be brave on the ball. Then we high-five every player.","Do you get nervous?","A bit! Smiling helps everyone, including me.")
  ],
  challenges:[
   c('c-specific',"Which is the most specific praise?",["Good job","Nice one","Great look over your shoulder before that pass"],2,"Yes. The player knows exactly what to repeat.","Specific praise names the exact thing done well."),
   c('c-next',"A teammate misplaces a pass. What is a helpful thing to say?",["Next one!","That was awful","What were you thinking?"],0,"Right. Next one keeps them brave.","Unkind words make it worse. Say next one."),
   c('c-nervous',"How can you help a nervous teammate?",["Leave them alone","Give them an easy first job and praise it","Tell them to be perfect"],1,"Correct. Small wins build confidence.","An easy first job and quick praise helps most."),
   c('c-track',"Why praise a player for tracking back?",["It is hard work that helps the team","It makes them slower","It ends the match early"],0,"Yes. Hard defensive work deserves a clap.","Tracking back helps the team, so it deserves praise.")
  ],
  openers:["Hello! Great to see you. I am on cheering duty for the blue team today.","Hi! Did you see that tackle? Brave play deserves a clap.","Hello there! My notebook is full of good decisions already.","Hi! Ask me how to cheer up a teammate after a mistake."],
  returning:["Back by the bench! Last time it was ‘{topic}’. Want another way to encourage teammates?","Hi again! I remember ‘{topic}’. Let us find a new idea today.","Lovely to see you! After ‘{topic}’, here is another bench tip."]
 },
 'stadium-ref-wanjiru':{
  topics:[
   t('where-stand',"Where does the fourth official stand?","Between the two technical areas, beside the halfway line. From there I can help both benches and the referee.","Do you talk to the referee?","Yes, through a headset, so we can share things quickly."),
   t('board-numbers',"How does the electronic board work?","I type in both shirt numbers, the player leaving and the player joining, and it lights up. Fans and players can see it clearly."),
   t('minimum',"Why is added time a minimum?","The minutes shown are the shortest possible added time. If there are more stoppages during added time, the referee can add more.","Who decides the minutes?","The referee decides, and tells me what to show."),
   t('stoppages',"What counts as a stoppage?","Things like injuries, substitutions, goal celebrations and time-wasting. The referee keeps track of them."),
   t('calm-benches',"How do you keep the benches calm?","I speak quietly and politely, and remind coaches to stay in their areas. Most coaches listen straight away.","What if they do not?","I tell the referee, who can caution a coach."),
   t('kit-check',"Do you check players' kit?","Yes. Substitutes' boots and kit are checked before they come on, to make sure everything is safe.","What do you look for?","Nothing sharp or dangerous, like jewellery, and the right team colours."),
   t('become-official',"How do people become match officials?","Many start with a local refereeing course and referee youth games. They learn the Laws and practise a lot.","Can kids referee?","In many places, teenagers can take a beginner course and referee younger children's games."),
   t('officials-team',"How many officials are at a big match?","Often a referee, two assistant referees and a fourth official. Some competitions add video officials too.")
  ],
  challenges:[
   c('c-minimum',"The board shows plus four. Can the match last longer than four extra minutes?",["Yes, the referee can add more","No, never","Only if fans ask"],0,"Yes. The board shows a minimum.","The board only shows the shortest added time, and the referee may play on a little longer."),
   c('c-stand',"Where does the fourth official usually stand?",["Behind a goal","Between the two technical areas","High in the stand"],1,"Correct. Right between the benches.","The fourth official stands between the two technical areas."),
   c('c-stoppage',"Which of these is a stoppage that may lead to added time?",["A smooth pass","A good tackle","An injury that stops play"],2,"Right. Lost time is added back.","Injuries that stop play can lead to added time."),
   c('c-coach-out',"A coach keeps stepping out of the technical area. What does the fourth official do?",["Remind them, and tell the referee if needed","Join in coaching","Walk off home"],0,"Yes. Polite reminders first.","The fourth official reminds them and tells the referee if it continues.")
  ],
  openers:["Hello! I am the fourth official. The benches are calm, so I have a moment to chat.","Hi! This board shows substitutions and added time. Want to know how it works?","Hello there! I help the referee from the side. Teamwork, even for officials.","Hi! Ask me anything about substitutions and added time."],
  returning:["Back between the benches! Last time it was ‘{topic}’. Ready for another official secret?","Hello again! I remember ‘{topic}’. Let us talk about something new.","You returned! After ‘{topic}’, here is more about the fourth official."]
 },
 'stadium-ref-amara':{
  topics:[
   t('flag-offside',"What do you do when you see offside?","I stop and raise my flag straight up. Then the referee blows the whistle, and I point the flag to show where.","Do you always raise it at once?","Sometimes we wait a moment, to see if the player really joins in the play."),
   t('flag-throw',"How do you show a throw-in?","I hold the flag out toward the goal that the throwing side is attacking. It is a quick, clear signal."),
   t('stay-level',"Why do you run level with the defender?","Offside is judged against the second-last defender, so I need to see that line exactly.","Is it hard to keep up?","It takes fitness! Assistant referees train like athletes."),
   t('side-step',"Why side-step instead of running forward?","Side-steps keep my chest facing the pitch, so I can see the players and the ball at once. I sprint when play moves fast."),
   t('corner-goal-kick',"How do you signal a corner or goal kick?","For a corner, I point the flag down at the corner arc. For a goal kick, I point it toward the goal area.","Does the referee always agree?","The referee makes the final call, but we usually agree."),
   t('ball-out',"How do you see if the ball went out?","I stay in line with the play and watch the whole ball against the line. All of it must cross for it to be out."),
   t('fitness-ar',"How fit do assistant referees need to be?","Very fit! They sprint, side-step and change direction for the whole match.","How do they train?","Sprints, side-steps and long runs, just like players."),
   t('flag-hand',"Do you ever drop your flag?","Not if I can help it! I hold it in the hand nearest the referee, so they can always see it.","Why that hand?","It keeps the flag in the referee's view, and I switch hands as I move.")
  ],
  challenges:[
   c('c-up',"An assistant raises the flag straight up. What does it usually mean?",["A throw for the blues","An offside call","Half-time"],1,"Yes. Flag straight up signals offside.","A flag held straight up usually means offside."),
   c('c-throw-flag',"For a throw-in, which way does the assistant point the flag?",["The way the throwing team attacks","At the crowd","Straight down at the grass"],0,"Correct. It shows which team throws.","The flag points toward the goal the throwing side is attacking."),
   c('c-level',"Who does the assistant referee stay level with?",["The home goalkeeper","The fastest striker","The second-last defender"],2,"Right. That is the offside line.","Assistants stay level with the second-last defender."),
   c('c-side',"Why do assistant referees side-step?",["To keep facing the pitch","To save their legs","To dance for the fans"],0,"Yes. Facing the pitch keeps everything in view.","Side-steps keep them facing the pitch.")
  ],
  openers:["Hi! I run this touchline with my flag. Want to learn the signals?","Hello! Side-step, side-step. Sorry, I am warming up for the match.","Hi there! Staying level is my whole job, and it is harder than it looks.","Hello! My flag talks, even when I do not."],
  returning:["Back by the touchline! Last time it was ‘{topic}’. Ready for another flag signal?","Hi again! I remember ‘{topic}’. Let us learn something new today.","You returned! After ‘{topic}’, here is another assistant referee secret."]
 },
 'stadium-ref-oskar':{
  topics:[
   t('advantage',"What does two arms forward mean?","It means advantage: play on. A team was fouled, but stopping play would spoil their good attack.","Can the referee go back to the foul?","Yes. If the advantage does not happen quickly, the referee can still give the free kick."),
   t('direct-signal',"How does a referee show a direct free kick?","One arm points in the direction the team will attack. A goal can be scored straight from it."),
   t('indirect-signal',"How is an indirect free kick shown?","The referee raises one arm straight up and keeps it there until the ball touches another player or goes out.","Why keep the arm up?","So everyone knows a direct shot into the goal would not count."),
   t('penalty-signal',"How does the referee give a penalty?","They point clearly to the penalty mark. Everyone then knows straight away.","Who takes the penalty?","Any player from the fouled team, and the keeper must stay on the goal line until it is kicked."),
   t('respect-official',"How can players respect officials?","Accept decisions, let the captain ask calm questions and thank the officials at the end.","What if a player argues a lot?","The referee can show a yellow card for dissent."),
   t('mistakes-officials',"Do referees make mistakes?","Sometimes, like everyone. They study the Laws, train hard and always try their best."),
   t('become-ref',"How did you start refereeing?","I took a beginner course and refereed small youth games. Every match taught me something.","What was hardest?","Staying calm when everyone shouted. It gets easier with practice."),
   t('whistle',"Why do referees blow the whistle differently?","A short blast often stops or restarts play, and a longer one can mark a goal or a serious foul. The sound helps everyone understand.")
  ],
  challenges:[
   c('c-advantage',"The referee sweeps both arms forward. What does it mean?",["Advantage, play on","Time for half-time","A spot kick"],0,"Yes. Play on, the attack continues.","Two arms swept forward means advantage."),
   c('c-penalty',"How does a referee signal a penalty?",["Arms crossed","Pointing to the penalty mark","Blowing a kiss"],1,"Correct. A clear point to the mark.","The referee points to the penalty mark."),
   c('c-indirect',"The referee holds one arm straight up at a free kick. What type is it?",["A direct kick","A kick from the goal area","An indirect kick"],2,"Right. Arm up means indirect.","One arm held up means an indirect free kick."),
   c('c-dissent',"A player keeps arguing with the referee. What can happen?",["A yellow card for dissent","A bonus goal","Nothing, ever"],0,"Yes. Dissent can be cautioned.","Arguing can earn a yellow card for dissent.")
  ],
  openers:["Hello! Advantage! Sorry, I was practising my signals. Want to learn them?","Hi! I run this line today, but I referee most weekends.","Hello there! Every referee signal has a meaning. Shall I show you a few?","Hi! Respect for officials makes every match better. Ask me why."],
  returning:["Back by the line! Last time it was ‘{topic}’. Ready for another signal?","Hello again! I remember ‘{topic}’. Let us learn a new one today.","You returned! After ‘{topic}’, here is another refereeing tip."]
 }
};
