import type {NpcFresh,FreshTopic,NpcChallenge} from '../npcFreshTypes';
const t7=(id:string,question:string,answer:string,fq?:string,fa?:string):FreshTopic=>fq&&fa?{id,question,answer,followUp:{question:fq,answer:fa}}:{id,question,answer};
const c7=(id:string,prompt:string,options:[string,string,string],correct:0|1|2,right:string,wrong:string):NpcChallenge=>({id,prompt,options,correct,right,wrong});

export const PART_7:Record<string,NpcFresh>={
 'folk-meera':{
  topics:[
   t7('grown-up-start','Can grown-ups learn football too?','Yes! I started as a grown-up and felt wobbly at first. Grown-up beginners learn the same way kids do: lots of short, easy touches.','What was the hardest part for you?','Trapping a bouncing ball. I kept leaning back, so it flew off my knee like a frog.'),
   t7('words-or-skills','What did you learn first, words or skills?','Skills came first. A thumbs up, a point to space, a clap after a good pass. The words came later, one game at a time.','Which football word did you learn first?','"Mine!" It means I am taking this ball. Very useful, and very loud.'),
   t7('other-language','How do I play with kids who speak another language?','Use your hands and eyes. Point where you will run, then show an open palm when you want the ball.','What if they still do not understand?','Show it with the ball. Do the move slowly once, and they will copy you.'),
   t7('shell-score','Do you and Arjun play against each other?','Every Sunday. He wins at dribbling, I win at long passes. We keep score with shells on the bakery step.','Who is winning the shell count?','Arjun, by three shells. He says I should practise more, which is fair.'),
   t7('same-everywhere','Is football the same in every country?','The laws are the same everywhere, so a goal is a goal on any field. What changes is the style, the songs and the snacks at half-time.','What was different where you moved?','People clapped the other team\'s good plays too. I liked that straight away.'),
   t7('new-club-friends','How do I make friends at a new club?','Arrive a little early and help carry the cones. Players chat while they set up, and coaches remember helpers.','What if I feel shy?','Shy is fine. Pass well and say thank you after a good pass to you. That is a whole conversation already.'),
   t7('pass-feel','What does a really good pass feel like?','Smooth, like sliding a plate across a table. The ball rolls flat and arrives at your friend\'s feet without a bounce.'),
   t7('thursday-team','Do you play on a team now?','Yes, a mixed mums and dads team on Thursday nights. We are slow, but our passing is very polite.','What is a polite pass?','One at the right speed, sent to the foot your teammate wants. It says: here you go, ready when you are.')
  ],
  challenges:[
   c7('c-welcome','A new player joins your game and looks unsure. What helps most?',['Leave them to watch for a while','Pass to them early with a friendly call','Give them the hardest job'],1,'An early, easy pass tells a new player they belong. Once they touch the ball, the nerves start to fade.','Waiting or giving a hard job can make a new player feel left out. An early, simple pass is the kindest welcome.'),
   c7('c-point','Your teammate speaks another language. How do you ask for the ball?',['Stand still and say nothing','Shout louder every time','Point to the space and make eye contact'],2,'Pointing plus eye contact works in every language. Your teammate sees exactly where you want the ball.','Waiting or shouting louder does not explain where to pass. A point and a look shows it clearly.'),
   c7('c-eleven','In an 11v11 match, how many players does each team have on the pitch?',['Eleven, including the goalkeeper','Eleven, plus a goalkeeper','Ten, plus two goalkeepers'],0,'Eleven each, and one of them is the goalkeeper. That is the same in every country.','The eleven includes the goalkeeper: one keeper and ten outfield players, wherever you play.'),
   c7('c-flat-pass','Your pass bounced and your friend could not control it. What should you change?',['Kick it much harder','Strike through the middle of the ball','Lean far back as you kick'],1,'Striking through the middle keeps the ball low and rolling. Low passes are easier to control.','Harder kicks or leaning back make the ball rise and bounce. Hitting the middle keeps it flat on the ground.')
  ],
  openers:[
   'Hello! I am counting shells for our family scoreboard. Arjun is ahead again, so please do not tell him I noticed.',
   'Football gave me my first friends on this island. Pull up some sand and tell me about yours.',
   'I just learned a new football word from a fisherman. Want to swap words with me?',
   'My Thursday team lost three nil, but our passing was lovely. Ask me anything.'
  ],
  returning:[
   'You asked me "{topic}" before. I have been thinking about it on my walks, so here is something new.',
   'Welcome back! Last time it was "{topic}", and today Arjun says I must tell you something different.',
   'Ah, you are the one who asked "{topic}" Come, sit, Meera has a fresh story.'
  ]
 },
 'folk-arjun':{
  topics:[
   t7('mid-job','What does a midfielder actually do?','We link the defenders to the attackers, like the filling in a sandwich. We help win the ball and then pass it forward.','Do midfielders score goals too?','Sometimes! My best goal was a shot from just outside the box. Mum still talks about it.'),
   t7('clap-call','Why do you clap when you want the ball?','A clap is quick and loud, so the passer knows I am free without a whole sentence. Then I point to the foot I want it on.','Which foot do you ask for?','The one furthest from the defender, so I can turn away from them.'),
   t7('mid-pair','Do midfielders work in pairs?','Often! When one of us goes forward to attack, the other stays back to protect. We are like a seesaw.','How do you decide who goes forward?','Whoever is closer to the ball goes. The other one checks the space behind.'),
   t7('nobody-open','What do you do when nobody is open?','I keep the ball safe, turn away from pressure, or pass back. Going backwards is fine if it keeps our ball.','Does passing back feel slow?','A bit, but then the ball comes round the other side where there is space. Patience opens doors.'),
   t7('every-position','Are you allowed to play every position?','My coach lets everyone try every position. I liked being keeper for one game, but I missed running around.','Why try positions you do not like?','Each one teaches you something. Now I know what a defender wants from me.'),
   t7('arcade-brain','Can arcade games help my football?','A little, for quick thinking. Games where I must pick a pass fast train my brain to decide sooner.','So should I play games instead of practising?','No way! Real touches on a real ball help the most. Games are just the dessert.'),
   t7('how-many-touches','How many touches should a midfielder take?','As few as you need. Sometimes one touch to pass, sometimes three to escape pressure. The game tells you.'),
   t7('butterflies','Do you get nervous before games?','A little, in my tummy. I take three slow breaths and think about my first pass, and the butterflies settle.','Does your mum get nervous too?','She says no, but she claps very fast before kick-off. I think that means yes.')
  ],
  challenges:[
   c7('c-get-free','Your teammate has the ball, but a defender blocks the pass to you. What do you do?',['Stand behind the defender','Move a few steps to open a new passing lane','Shout for the ball even louder'],1,'Moving a few steps makes a clear line between you and the ball. Getting free is the job, not shouting.','Standing still or shouting does not unblock the lane. A few steps sideways opens a new passing line.'),
   c7('c-triangle','In a triangle of three teammates, how many passing choices does the player on the ball have?',['Only one','All three','Two of them'],2,'Two! One at each of the other corners. That is why triangles are hard to defend.','The player on the ball has two teammates to pass to, one at each other corner of the triangle.'),
   c7('c-one-two','What is a one-two pass?',['Pass, run past the defender, get it straight back','Two players kicking the ball at once','Passing twice to the same foot'],0,'Exactly. You give, go, and get it back on the other side of the defender.','A one-two means you pass, sprint past a defender and get the ball straight back from your teammate.'),
   c7('c-crowded','Midfield is crowded and you are under pressure. What is a smart choice?',['Dribble through three players','Shoot from your own half','Pass back to a free teammate'],2,'A pass back keeps the ball. Your team can then move it to where there is more space.','Taking on a crowd or shooting from far away usually loses the ball. A simple pass back keeps possession.')
  ],
  openers:[
   'Mum says I talk about midfield too much. Is that even possible? Ask me something!',
   'I just did twenty one-twos against the bakery wall. The wall never misses.',
   'Want a midfielder secret? It is mostly about being in the right place before the ball gets there.',
   'Hi! I am practising my sideways stance. Do I look like a crab or a midfielder?'
  ],
  returning:[
   'Hey, you asked "{topic}" last time! I worked out a new thing since then.',
   'You are back! I still remember you asking "{topic}" Let me tell you a different midfield idea.',
   'Mum, it is the kid who asked "{topic}" Ready for another one from me?'
  ]
 },
 'folk-losa':{
  topics:[
   t7('watching-mistakes','What do you look for when you watch a game?','I watch how teammates treat each other after a mistake. A team that lifts each other up usually finishes strong.','Have you seen a team come back like that?','Many times. Two goals down at half-time, then all smiles and hugs. They won four to two.'),
   t7('match-snack','What is the best snack for a football day?','Fruit and water before the game, and something hearty after. In my family, everyone eats together after the match.','Do you bring food to games?','Always. Sliced pineapple in a big tin, and both teams get some.'),
   t7('talk-referee','How should I talk to a referee?','Politely, the way you would talk to a teacher. Referees are learning too, and the game cannot happen without them.','What if the call feels unfair to me?','Take a breath and play on. Your captain can ask one calm question if it really matters.'),
   t7('village-winger','Did you ever play football?','In my village we played barefoot on the grass by the church. I was a fast little winger with very loud aunties.','How loud were your aunties?','You could hear them from the next village. The goats ran away every Saturday.'),
   t7('blue-shirt','What lesson did today\'s beach game teach?','That the quiet girl in the blue shirt never stopped running. She did not score, but every goal started with her.','Why don\'t people notice players like that?','Because their work happens before the goal. Good watchers rewind the play in their heads.'),
   t7('tears-ok','Is it okay to cry after a match?','Of course. Tears mean you cared. Let them out, then have a drink of water and a hug.','Do grown-up players cry too?','Yes, after big wins and big losses. Feelings are part of football at every age.'),
   t7('family-game','How can families play football together?','Make small teams with mixed ages, and let the little ones score first. Grandmas may play goalkeeper sitting on a chair.','Have you been a chair goalkeeper?','Last birthday. I saved two shots with my sunhat and nobody has forgotten it.'),
   t7('why-respect','Why is respect so important in football?','Without respect, a game turns into arguing. With it, you can play hard and still be friends at the end.')
  ],
  challenges:[
   c7('c-injured','A player on the other team falls and looks hurt. Your team has the ball. What is a kind choice?',['Keep attacking quickly','Kick the ball out so they can be helped','Tell them to get up'],1,'Kicking it out lets the injured player get care. Often the other team gives the ball back at the restart.','Health comes before a goal. Putting the ball out lets someone help the hurt player.'),
   c7('c-who-decides','Who makes the final decision during a match?',['The referee in the middle','The loudest coach','The home team captain'],0,'The referee decides. Players and coaches can ask calmly, but the call belongs to the referee.','Coaches and captains do not decide. The referee does, and good players respect that.'),
   c7('c-next-one','Your teammate misses an easy chance. What helps your team most?',['Sigh loudly','Tell them everything they did wrong','Say "next one" and get back in position'],2,'A quick "next one" keeps their confidence up, and getting back in position helps the team right away.','Sighs and corrections in the moment make players nervous. Encouragement and getting ready help more.'),
   c7('c-winning-big','Your team is winning easily. What is the respectful thing to do?',['Keep playing properly and fairly','Do tricks to make them look silly','Stop trying completely'],0,'Playing properly respects the other team. They deserve a real game right to the final whistle.','Teasing tricks and giving up both disrespect the other team. Keep playing fairly until the end.')
  ],
  openers:[
   'Come sit, there is shade under my umbrella and a game starting on the sand. Tell me what you see.',
   'I brought pineapple for the beach teams. There is a piece left for anyone who likes football talk.',
   'My knees creak, but my eyes are sharp. I just watched a lovely pass down there on the sand.',
   'The boats are coming in and the children are picking teams. My favourite time of day. What is on your mind?'
  ],
  returning:[
   'Ah, you again! You asked "{topic}" last time. Grandma Losa has another story for you.',
   'Sit, sit. I remember your question "{topic}" Today I have something fresh from the terrace.',
   'Welcome back to my bakery terrace. After "{topic}" I thought of a new lesson for you.'
  ]
 },
 'folk-tavita':{
  topics:[
   t7('defender-practice','What do defenders practise most?','Staying on our feet. A defender lying on the grass cannot help anyone, so we learn to wait and stay balanced.','When should I tackle, then?','When the attacker\'s touch goes a little too far from their foot. That is your moment.'),
   t7('keeper-call','Should I listen to my goalkeeper?','Always. The keeper sees the whole pitch in front of them, so when they shout "away" or "keeper", react straight away.','What if we both go for the same ball?','That is how bumps happen. Agree before the game: if the keeper calls it, the defender steps aside.'),
   t7('arm-length','How close should I stand to the player I mark?','Close enough to reach the ball if it arrives, but not so close they can spin past. About an arm\'s length is a good start.','Does that change near my goal?','Yes. Get tighter near your goal, and a little looser far away so you can cover space too.'),
   t7('warm-up-why','Why do we warm up before playing?','Warm muscles stretch and react better. A good warm-up starts gently and gets faster, like a car leaving a car park.','What is in your warm-up?','Jogging, side steps, skips, a few short sprints and some passing. About fifteen minutes.'),
   t7('cool-down','What is a cool-down?','Easy jogging and gentle stretching after the game. It lets your breathing and heart rate settle slowly.','Do I really have to do it?','It is a good habit. Your legs usually feel better the next morning.'),
   t7('sit-out','How do I know if I should not play today?','If something hurts sharply or you feel ill, tell a grown-up and sit out. Being brave means being honest about pain.','What if it is a big game?','There is always another game. An injury that gets worse can keep you out for much longer.'),
   t7('bored-rest','Do you ever get bored on rest days?','Sometimes, so I make a list of football things to do lying down. Watching clips, drawing set pieces, and napping. Napping counts.'),
   {"id": "help-younger", "question": "Why do older kids help younger ones?", "answer": "Someone helped them once. Teaching a trick is also a great way to understand it better yourself.", "followUp": {"question": "How can I help a younger kid?", "answer": "Pass gently, cheer when they try and let them take the free kick sometimes."}}
  ],
  challenges:[
   c7('c-stay-up','An attacker runs at you with the ball. What should you do first?',['Dive in for the ball','Stay on your feet and slow them down','Turn your back to them'],1,'Staying on your feet buys time for teammates to help. Diving in lets a good attacker skip past.','Diving in or turning away gives the attacker a free path. Stand up, slow them, and wait for the right moment.'),
   c7('c-tackle-time','When is the best moment to tackle?',['When their touch gets too far from their foot','As soon as they receive the ball','When they are looking right at you'],0,'A heavy touch leaves the ball loose for a moment. That is when a tackle is most likely to win it cleanly.','Tackling too early or face to face is easy to dodge. Wait for a loose touch, then go in.'),
   c7('c-hot-drink','Which drink is best during a hot match?',['A fizzy drink','Nothing until the end','Water, in small sips often'],2,'Small sips of water often keep your body cool and your mind sharp.','Fizzy drinks and waiting too long both make it harder to stay cool. Sip water regularly instead.'),
   c7('c-side-on','Why does a defender stand side-on, not square, to an attacker?',['It looks cooler','It is easier to turn and chase','It makes you look taller'],1,'Standing side-on means you can push off and run if the ball goes past you.','It is not about looks or height. Side-on defenders can turn and chase much faster.')
  ],
  openers:[
   'Rest day, but my brain is still defending. I just stopped an imaginary winger three times.',
   'I am stretching and watching the waves. Ask me about defending while my legs relax.',
   'Coach says today is for doing nothing. I am trying very hard at doing nothing.',
   'Hey! Back at training tomorrow, so today I am free for all your defender questions.'
  ],
  returning:[
   'You asked me "{topic}" before. It is still my rest day, so I have time for a new one.',
   'Oh, the kid who asked "{topic}" I saved another defender tip for you.',
   'Back again? After "{topic}" I thought of something from the back line you will like.'
  ]
 },
 'folk-ximena':{
  topics:[
   t7('bare-kick','How do you kick a ball with bare feet?','Use the top of your foot near the big toe, with your toes pointed down. Never kick with your toes, or they will complain all night.','Does it hurt at first?','A little, until your feet get used to it. Start gently with soft passes.'),
   t7('many-goals','Why are there so many goals in beach games?','The pitch is small, so you can shoot from almost anywhere. A team that is three goals behind can still come back.','Have you seen a big comeback?','Last summer my team was four goals down after the first period. We won by one, and I lost my voice.'),
   t7('smooth-sand','Why do you smooth the sand before games?','Holes and lumps make the ball hop and can twist an ankle. We flatten the pitch with our feet and pick up shells first.','Do shells really matter?','A sharp shell under a bare foot is no fun. A quick sweep keeps everyone comfortable.'),
   t7('beach-bag','What do you bring to a beach game?','Water, a towel and a spare ball. And a bag for any rubbish we find on the sand.','Why a spare ball?','Balls roll into the sea a lot! A spare keeps the game going while someone fetches the first one.'),
   t7('chip-shot','What is a chip shot?','A gentle scoop under the ball so it floats over the keeper. On sand, keepers find it hard to jump backwards, so chips are gold.','How do I practise chipping?','Lay a towel on the sand and float the ball over it into a bucket. Soft touch, not power.'),
   t7('sand-juggle','Can I juggle on the beach?','Yes, and a dropped ball does not roll away on sand. I count my juggles out loud so the fishermen join in.','What is your juggling record?','Eighty-four. A seagull distracted me on eighty-five.'),
   t7('love-beach','What do you love most about beach football?','Everyone falls over and nobody minds. Sand makes even a tumble feel soft and funny.'),
   {"id": "beach-music", "question": "Why is there music at beach games?", "answer": "Beach soccer feels like a party, with drums and songs between periods. Even the referees tap their feet.", "followUp": {"question": "Do players dance?", "answer": "Some do a little shuffle when they score. Others just grin and run back."}}
  ],
  challenges:[
   c7('c-pop-up','The ball pops up in front of you near goal on the sand. What is a good choice?',['Wait for it to stop bouncing','Strike it on the volley toward a corner','Head it back to your own keeper'],1,'Waiting lets defenders arrive. A controlled volley toward a corner uses the bounce instead of fighting it.','On sand the ball rarely sits still, and passing back gives up the chance. Meet it in the air and aim for a corner.'),
   c7('c-smooth','Before a beach game, why smooth out the sand?',['So the ball rolls truer and ankles stay safe','To make the goals bigger','So the sand gets hotter'],0,'Smoothing removes holes and lumps, so the ball behaves and nobody twists an ankle.','Smoothing the sand is about safety and a fairer bounce, not bigger goals or hotter sand.'),
   c7('c-foot-part','Which part of a bare foot is best for striking the ball?',['The toes','The heel','The top of the foot near the big toe'],2,'The top of the foot is firm and safe for striking, and it keeps your toes out of trouble.','Toes and heels are easy to hurt and hard to aim with. The top of the foot is firmer and safer.'),
   c7('c-keeper-off-line','The keeper is far off their line. What shot could work well?',['A pass straight to them','A gentle chip over their head','A shot at their shins'],1,'A chip floats over a keeper who has left the line, and backpedalling on sand is tricky.','If the keeper is off the line, a chip over them is often the best bet.')
  ],
  openers:[
   'My feet are sandy, my ball is sandy, even my snack is sandy. Perfect beach day! Want to talk football?',
   'I just did a chip so soft it landed on a towel. Ask me how!',
   'The sand is cooling down, which means game time soon. Got a question before we start?',
   'Hola! I am counting juggles and losing count. Help me out by asking something.'
  ],
  returning:[
   'You asked "{topic}" before! The beach always gives me new answers, so here is one more.',
   'Back on the sand with me? Last time you asked "{topic}" Let me show you another side of beach football.',
   'Ah, the "{topic}" kid! Shake the sand off, I have something new for you.'
  ]
 },
 'folk-jarrah':{
  topics:[
   t7('run-faster','How do I run faster?','Pump your arms, stay tall and land on the front of your feet. Short, quick steps at the start help you get going.','Do arms really matter?','Yes! Arms and legs work together. Try a gentle jog with your hands in your pockets and feel how clumsy it is.'),
   t7('change-direction','How do I change direction quickly?','Lower your body, plant your outside foot and push off. Small steps before the turn help you stop without slipping.','Is it harder on sand?','Much harder. Sand slides under your foot, so your legs work twice as hard to push away.'),
   t7('dune-sprints','Why do you sprint up the dunes?','Running uphill makes your legs push harder with every step. Short hill sprints build power for quick starts.','How many do you do?','Six short ones, walking back down slowly each time to recover.'),
   t7('ball-or-not','Is it better to run with or without the ball?','Both! With the ball, push it a little ahead with your laces. Without it, you can go faster to find space.','How far ahead should I push it?','Far enough to run freely, close enough that a defender cannot nip in. About two big steps.'),
   t7('first-steps','How do I win a race to the ball?','Your first three steps matter most. Lean forward a little, push hard with short steps, and watch the ball, not the other player.','What if they are faster than me?','Then start earlier. Reading where the ball will go beats raw speed.'),
   t7('every-day','Do you run every day?','No way. Three hard days, two easy days and a rest day. Legs need time off, just like brains.','What is an easy day?','A gentle jog where I can still chat, or a swim in the sea.'),
   t7('sand-shoes','What do you wear on your feet on sand?','Nothing on soft sand, but trainers on the hard path. Different ground, different feet.'),
   t7('second-half','How do I feel less tired in the second half?','Drink water at half-time and eat a good meal a few hours before the game. Fuel and water make a big difference.','Can I do anything during the game itself?','Walk when the ball is far away and sprint when it really matters. Smart running saves energy.')
  ],
  challenges:[
   c7('c-lost-ball','Your team just lost the ball. Which run helps most?',['A recovery run toward your own goal','Walking and watching','Jogging to the corner flag'],0,'A recovery run gets you between the ball and your goal fast. Teams that recover quickly concede less.','Walking or wandering wide leaves a gap. Sprinting back toward your goal is the run that helps.'),
   c7('c-push-ahead','Where should you push the ball when running fast with it?',['Right under your feet','A little ahead, about two steps','As far as you can kick it'],1,'A little ahead lets you run at full speed while still controlling it.','Too close slows you down, too far gives it to a defender. A couple of steps ahead is just right.'),
   c7('c-late-tired','It is late in the game and you feel tired. What is smart running?',['Sprint everywhere anyway','Stop running completely','Walk when the ball is far, sprint when it matters'],2,'Saving energy for the important moments keeps you useful right to the final whistle.','Sprinting everywhere wears you out and stopping leaves your team short. Pick your moments to sprint.'),
   c7('c-lower','When should you lower your body while running?',['Never, always stay tall','Just before you change direction','Only when you feel tired'],1,'Lowering your body before a turn helps you stop and push off without slipping.','Staying tall is great for running straight, but you bend lower just before a change of direction.')
  ],
  openers:[
   'G\'day! I just finished sand sprints and my legs feel like jelly. Ask me something while they wobble.',
   'Fresh footprints all the way to the rocks and back. That was lap four. Want some running tips?',
   'Hey there! Race you to the lifeguard tower? Kidding. Football chat first.',
   'The tide is low, so the sand is hard and fast today. Best running day of the week!'
  ],
  returning:[
   'You asked me "{topic}" last time, and I thought about it for a whole lap. Here is something new.',
   'Back for more? After "{topic}" I have a fresh running idea for you.',
   'Hey, it is my "{topic}" friend! Catch your breath, here comes another one.'
  ]
 },
 'folk-kiri':{
  topics:[
   t7('why-hero','Why do you love your favourite player so much?','She plays like the ball is glued to her foot, and she never gives up. She also smiles when she scores, which is my favourite part.','What else do you admire about her?','She kept playing at the top level for a very long time. That takes lots of care for your body.'),
   t7('past-defender','How can I dribble around a defender?','Move the ball one way with a little touch, then go the other way with a bigger one. Change speed as you pass them.','Which foot should I use?','Either! I use the foot furthest from the defender, so my body guards the ball.'),
   t7('outside-touch','Can I dribble with the outside of my foot?','Yes! The outside of your foot lets you push the ball forward while running fast, without changing your stride.','Is it hard to control?','At first. Practise little outside touches while walking in a straight line, then curve around cones.'),
   t7('diary','Do you keep a football diary?','Yes! After every session I write one thing I did well and one thing to practise. Some pages have drawings of goals.','What did you write last time?','Good: left-foot pass. Practise: stopping the ball with my thigh. Also: saw a crab.'),
   t7('girls-everywhere','Can girls play football everywhere?','Girls and women play in nearly every country now, and more join every year. Some huge crowds have filled stadiums for women\'s matches.','Do girls and boys play together?','At my age, lots of teams are mixed. My team has six girls and five boys.'),
   t7('my-position','What position do you play?','Attacking midfield, just behind the strikers. I like finding gaps and slipping little passes through them.','Do you score goals too?','Sometimes. I scored a header last month by accident. It bounced off my head and went in.'),
   t7('practice-time','How long do you practise each day?','About twenty minutes in the garden, plus team training twice a week. Little and often works best for me.'),
   t7('hero-lost','Did your hero always win?','No, she lost big games too. Losing showed her what to work on, which is how she got even better.','How do you feel when your team loses?','Grumpy for ten minutes. Then I write in my diary and feel better.')
  ],
  challenges:[
   c7('c-fake','A defender is right in front of you. Which move helps you get past?',['Pass it into the defender\'s shins','Freeze and wait for a teammate','Fake one way, then go the other'],2,'A fake makes the defender lean the wrong way, and then you can slip past.','Kicking it at them or waiting usually loses the ball. A fake shifts their weight so you can go by.'),
   c7('c-far-foot','Which foot keeps the ball safest while dribbling past a defender?',['The foot furthest from the defender','The foot closest to the defender','It does not matter at all'],0,'The far foot keeps your body between the defender and the ball. That is called shielding.','Using the near foot puts the ball right next to the defender. The far foot shields it.'),
   c7('c-burst','You just got past a defender. What should you do with your speed?',['Slow down to celebrate','Speed up into the space','Stop and do another trick'],1,'A burst of speed after the move puts distance between you and the defender.','Slowing down or stopping lets the defender catch up. Speed up once you are past.'),
   c7('c-gaps','What does an attacking midfielder look for most?',['Gaps between defenders','The referee\'s whistle','The corner flag'],0,'Gaps between defenders are where clever passes go. Finding them is the attacking midfielder\'s job.','The attacking midfielder hunts for gaps between defenders to slide passes through or run into.')
  ],
  openers:[
   'Guess what? I practised step-overs one hundred times this week. My dog watched every single one.',
   'Hi! I am writing in my football diary. Today\'s page needs a question from you.',
   'My hero is the reason I play. Want to hear about the skills I am copying?',
   'I just did a fake that tricked a seagull. Ask me about dribbling!'
  ],
  returning:[
   'You asked "{topic}" last time! I wrote it in my diary, and now I have a brand new answer.',
   'Hey, I remember you! You asked "{topic}" Ready for another dribbling secret?',
   'My diary says you asked "{topic}" before. This time I will tell you something else.'
  ]
 },
 'folk-tama':{
  topics:[
   t7('steering','How do players steer their chairs?','Most use a joystick, a little stick they move with their hand. Some players use other controls that suit their body better.','Is steering hard to learn?','It takes lots of practice, just like dribbling. My players start with slow laps around cones.'),
   t7('training-plan','What do you teach at training?','Positioning, passing and teamwork, like any coach. We spend lots of time on where to be before the ball arrives.','Why does positioning matter so much?','Everyone moves fast on a small court. If you are in the right spot early, you do not need to rush.'),
   t7('play-with-friends','Can my team play with friends who use wheelchairs?','Yes! Make the game fit everyone: a bigger ball, a smaller space and rules you agree together. The best games give everyone a turn.','What if we are not sure what to change?','Ask your friend. They know best what helps them enjoy the game.'),
   t7('signature-moves','Do your players have favourite moves?','One player loves a quick reverse to drag the ball back. Another loves a long diagonal pass. Every player has a signature.','What is a diagonal pass?','A pass that goes forward and across at the same time. It switches play to a new side of the court.'),
   t7('hardest-coaching','What is the hardest part of coaching?','Picking who starts. Everyone works hard, so I explain my choices and make sure everyone gets proper playing time.','How do you explain it?','Honestly and kindly. I tell each player one thing they do brilliantly and one thing we are working on.'),
   t7('became-coach','How did you become a coach?','My cousin plays, and I started by carrying the ball bag. Then I took coaching courses and never looked back.','Can kids help at clubs too?','Yes, many clubs love young helpers for setting up, cheering and collecting balls.'),
   t7('charging-up','How do your players rest between games?','Charging time for chairs and for people! Batteries get plugged in, players get water and a stretch.'),
   t7('nerves-countdown','Do your players get nervous?','Before big matches, yes. We do a team breathing countdown from five, and then we roll out together.','Why go out together?','It reminds everyone they are not alone. A team that starts together plays together.')
  ],
  challenges:[
   c7('c-early-position','On a small, busy court, when should you get into position?',['After the ball arrives','Before the ball arrives','Only when the coach shouts'],1,'Being in position early means you are ready to receive or block without rushing.','Waiting until the ball arrives is too late on a small court. Get there early.'),
   c7('c-diagonal','What does a diagonal pass do?',['Moves the ball forward and across to a new side','Goes straight back to your own goal','Stays on the same spot'],0,'A diagonal pass moves the ball forward and across, finding space on the other side.','A diagonal pass travels forward and across at the same time to switch the play.'),
   c7('c-include','A friend in a wheelchair wants to join your game. What is the best first step?',['Tell them to watch instead','Play exactly the same as always','Ask them what helps them enjoy it'],2,'Asking your friend shows respect, and they know what works best for them.','Leaving them out or changing nothing may not work. Ask what helps, then adapt the game together.'),
   c7('c-few-ideas','Your coach gives a team talk. How many ideas are easiest to remember in a game?',['Twenty detailed ones','A few clear ones','None at all'],1,'A few clear ideas stick in your head when the game gets busy.','Too many ideas get muddled, and none leaves you without a plan. A few clear ones work best.')
  ],
  openers:[
   'Training was brilliant today. One of my players scored with a spin from the corner. Want to hear how we plan plays?',
   'I am packing the team ball bag. Ask me anything about coaching while I count the cones.',
   'Hello! Every team I coach teaches me something new. Today it was patience.',
   'I am drawing a court plan in the sand with a stick. Want to help me place the players?'
  ],
  returning:[
   'You asked me "{topic}" before. My players would love that question, and I have a new idea for you.',
   'Welcome back! After "{topic}" let me share something from this week\'s training.',
   'It is the curious one who asked "{topic}" Pull up a seat, Coach Tama has more to tell.'
  ]
 },
 'folk-inti':{
  topics:[
   t7('stay-focused','How do I stay focused for a whole game?','Give yourself small jobs, like checking where your marker is every time the ball goes out. Little jobs keep your mind switched on.','What if my mind wanders?','It happens to everyone. Notice it, take a breath, and pick your next little job.'),
   t7('spotted-today','What have you spotted from the jetty today?','Three boats, one sleepy pelican and a kid trying a rabona at the end of the pier. He missed, but it was close.','What is a rabona?','Kicking the ball by wrapping your kicking leg behind your standing leg. It looks fancy and is very hard.'),
   t7('wait-or-rush','When should I wait instead of rushing?','When you are defending and outnumbered, wait for help. When attacking and the pass is not on yet, wait for a teammate to move.','How long is too long to wait?','If a defender is closing you down, the waiting is over. Then make the safe choice.'),
   t7('read-game','What does reading the game mean?','Guessing what will happen next from small clues, like where a player is looking or how they plant their foot.','Can I practise it without playing?','Yes! Watch a match and pause it. Guess the next pass, then press play to check.'),
   t7('calm-breath','How do you calm down when you feel nervous?','I breathe in for four counts, hold for four, then out for four. The sea helps too, but you can do it anywhere.','Does breathing really help?','It slows your heart a little, and a calmer body makes calmer choices.'),
   t7('shoot-speed','Should I shoot quickly or carefully?','It depends on space. With a defender close, shoot quickly. With time, take a breath and pick your spot.','How do I know how much time I have?','Glance around before you receive. If nobody is near, you have more time than you think.'),
   t7('my-position','Do you play football yourself?','In the park on weekends, usually as a holding midfielder. Patient players like me sit in front of the defence and keep things tidy.'),
   t7('best-seat','Where is the best spot to watch a match?','Somewhere high, behind one goal. You can see the shape of both teams, like a map.','Why behind the goal?','From there you see the gaps between players clearly, which is hard from the side.')
  ],
  challenges:[
   c7('c-two-v-one','You are defending alone against two attackers. What should you do?',['Rush at the player with the ball','Back off slowly and wait for help','Run to the sideline'],1,'Backing off slowly delays them while your teammates race back. Rushing in can leave the other attacker free.','Rushing in or leaving makes it two against nobody. Delay them and wait for help.'),
   c7('c-holding-mid','What does a holding midfielder mostly do?',['Shields the defence and keeps passes simple','Stays up front to score','Takes every throw-in'],0,'A holding midfielder sits in front of the defence, blocks paths to goal and keeps the ball moving.','Holding midfielders protect the defence and keep things tidy. Strikers do most of the scoring.'),
   c7('c-under-pressure','A defender is sprinting at you as you receive. What is your best choice?',['Take five touches to think','Turn your back and close your eyes','Make a quick, safe pass'],2,'With pressure close, a quick safe pass keeps the ball for your team.','Taking many touches or freezing under pressure gives the ball away. Move it on quickly and safely.'),
   c7('c-clue','Which clue can help you guess where a pass will go?',['The colour of their socks','Where the passer\'s hips and eyes point','How loud the crowd is'],1,'Hips and eyes often point toward the pass. Good readers of the game spot it early.','Socks and crowds do not tell you much. Watch where the passer\'s hips and eyes point.')
  ],
  openers:[
   'Shh, the pelican is watching the fish and I am watching the pelican. Want to talk football quietly?',
   'The tide is turning. I like guessing when the next wave comes, just like guessing the next pass.',
   'Hi! I have sat here so long the seagulls think I am part of the jetty.',
   'Nell just caught a tiny fish and let it go. It is a patience day on the pier. What do you want to know?'
  ],
  returning:[
   'You asked me "{topic}" last time. I have had lots of waiting time to think of something new.',
   'Back on the jetty? After "{topic}" I spotted another football idea out here.',
   'Hello again! You were the one asking "{topic}" Sit down, the fish are not biting anyway.'
  ]
 },
 'folk-svetlana':{
  topics:[
   t7('sharks-minnows','What was your favourite training game?','Sharks and minnows. Everyone dribbles, a few sharks try to steal the balls, and if you lose yours you become a shark. Endless giggles.','What does that game teach?','Keeping the ball close and looking up while you dribble. And laughing while you work hard.'),
   t7('half-time','What did you say at half-time?','One thing we did well and one thing to fix. Then water, and a reminder to enjoy the second half.','Why not list every mistake at half-time?','Players can only hold one new idea at a time in a busy game.'),
   t7('pick-positions','How did you choose positions for your players?','Everyone tried every position early on. Later I asked each girl where she felt most useful, and we decided together.','Did anyone surprise you?','A shy girl became our best defender. She read the game like a book.'),
   t7('sideline-parents','What should parents shout from the side?','Only cheers! Instructions from the side can confuse players who are already listening to their coach.','What did you ask parents to do?','Clap for both teams, bring snacks, and on the way home ask what was fun instead of what went wrong.'),
   t7('brave-keepers','How did you help goalkeepers feel brave?','We cheered saves as loudly as goals. Every keeper also got to play out in the field sometimes.','Why play keepers out in the field?','It improves their feet and helps them understand what defenders need.'),
   t7('great-team','What made a great team in your eyes?','Players who talked kindly, covered for each other and kept going when tired. Talent helps, but heart wins.','Can a team learn heart?','Yes, through little habits, like high fives after mistakes and helping pack away the cones.'),
   t7('still-watch','Do you still watch girls\' games?','Every weekend. I sit with a flask of tea and clap for both teams. The players call me the clapping grandma.'),
   t7('young-coach','What do you wish you had known as a young coach?','That fun comes first. Children who enjoy football stay in it for life, and then they get good.','Did you change how you coached?','I talked less and let them play more, and my teams improved faster.')
  ],
  challenges:[
   c7('c-three-v-three','Why are 3v3 games great for learning?',['Fewer players means more touches each','The goals are much bigger','Everyone gets to sit down'],0,'With only three a side, every player touches the ball often and makes lots of decisions.','Small games are about touches and decisions, not big goals or resting. Everyone is involved.'),
   c7('c-high-five','Your teammate makes a mistake that leads to a goal. What helps most?',['Ignore them for a while','Point at them so the coach knows','A high five and "we go again"'],2,'A high five tells them the team is still together, and confidence comes back fast.','Ignoring or pointing makes them feel worse. A quick high five keeps the team strong.'),
   c7('c-keeper-outfield','Why might a coach let a goalkeeper play outfield in training?',['To punish them','To improve their footwork and understanding','Because keepers are not needed'],1,'Outfield time builds a keeper\'s passing and helps them understand defenders.','It is not a punishment, and keepers really matter. Outfield practice improves their feet and game sense.'),
   c7('c-minnows','In sharks and minnows, what skill are the minnows practising?',['Throwing the ball','Heading the ball','Close control while looking up'],2,'Minnows must keep the ball close and watch for sharks at the same time.','Sharks and minnows is a dribbling game. Close control with your head up keeps the ball safe.')
  ],
  openers:[
   'Thirty years of whistles, cones and orange slices. Ask me anything about coaching.',
   'I have a flask of tea and a story about every girl I ever coached. Pick a question!',
   'Hello, dear. I was just remembering a game we won with ten players. Want to hear about teamwork?',
   'The breeze off the pier reminds me of early Saturday training. Come and chat football with me.'
  ],
  returning:[
   'You asked "{topic}" before. An old coach always has another lesson in her pocket.',
   'Ah, my curious friend who asked "{topic}" Here is a new idea from my coaching notebook.',
   'Welcome back! After "{topic}" I remembered something from my Saturday mornings with the girls.'
  ]
 },
 'folk-bilal':{
  topics:[
   t7('look-more','Do deaf players look around more often?','Yes, a lot more! Nobody can shout "man on" to us, so we turn our heads all the time to check what is behind.','Should hearing players do that too?','Definitely. A teammate\'s shout can be late or lost in the noise, but your own eyes are always on time.'),
   t7('huddle-circle','How does your team do a team talk?','We stand in a tight circle so everyone can see every face and every pair of hands. Nobody stands at the back.','What does the coach use to explain plans?','A small whiteboard with magnets. Pictures are faster than words for everyone.'),
   t7('help-teammate','How can I help a deaf teammate?','Face them when you talk, do not cover your mouth, and point to show the idea. Ask them what works best.','Should I learn some signs?','Yes! Even "well done", "pass" and "ready?" make a teammate feel welcome. Ask them to teach you.'),
   t7('my-position','Where do you like to play on the pitch?','Left wing. I like the touchline because I can see most of the pitch in front of me without turning.','Is the wing good for seeing play?','It is. With the line beside you, there is a whole side you never need to check.'),
   t7('set-piece-signs','How do you plan corners without talking?','The taker lifts one, two or three fingers before the kick. Each number means a different plan we practised.','What do the numbers mean?','That is our team secret! But one of them is a short corner to me.'),
   t7('noisy-quiet','Is it quiet when you play?','For me, yes, but the game is full of things to see: arms waving, the ball spinning, players pointing. My eyes are busy.'),
   t7('what-football-gave','What has football taught you?','That a team can understand each other with no words at all. Trust and practice do the talking.','How long did that take?','A few months of training together. Every week we understood each other a bit faster.'),
   t7('celebrate-sign','How does your team celebrate a goal?','We all wave both hands in the air, which is a sign for applause in many deaf communities. The whole team sparkles.','Can I try it?','Yes! Raise both hands and wiggle your fingers. That is a silent cheer.')
  ],
  challenges:[
   c7('c-check-shoulder','Nobody can warn you about a defender behind you. What should you do?',['Look over your shoulder before the ball comes','Close your eyes and hope','Always pass backwards'],0,'Checking your shoulder shows you the defender, so you can choose your first touch safely.','Hoping or always passing back does not help you decide. A quick look tells you what is behind.'),
   c7('c-corner-plan','Your team agrees a hand signal before a corner. Why is that clever?',['It makes the corner kick longer','The other team cannot hear the plan','It is against the laws'],1,'A silent signal tells your team the plan without warning the defenders.','Hand signals are allowed and do not change the kick. They share the plan quietly.'),
   c7('c-face-them','What helps a deaf teammate understand you best?',['Shouting from behind them','Covering your mouth','Facing them and pointing'],2,'Facing them lets them see your face and hands, and pointing shows the idea clearly.','Shouting from behind or hiding your mouth makes it hard to understand. Face them and point.'),
   c7('c-wing-view','Why can a winger near the touchline see play well?',['The touchline covers one whole side','Wingers are taller','The referee tells them everything'],0,'With the touchline beside you, you only need to check the pitch in front and inside.','Height and referees have nothing to do with it. The touchline means there is one less side to watch.')
  ],
  openers:[
   'Hi! I just saw a perfect pass on the beach from way over here. My eyes never take a day off.',
   'Hello! Do you know the sign for "well done"? Thumbs up works on every pitch.',
   'Waves, boats, a kid juggling by the bench. So much to watch on this pier. What can I help with?',
   'I am practising shoulder checks while I wait for my team. Look left, look right, look behind!'
  ],
  returning:[
   'You asked me "{topic}" last time. I have a new thing to show you with my hands.',
   'Welcome back! After "{topic}" I thought of another way eyes beat ears in football.',
   'Hey, the "{topic}" friend! My team says hello. Here is a fresh one.'
  ]
 },
 'folk-nayeli':{
  topics:[
   t7('far-post','Where should I aim from a tight angle?','Often across the keeper, toward the far post. If they save it, the ball might bounce back to a teammate in the middle.','Why not the near post?','Keepers usually guard the near post closely. The far side gives you more room.'),
   t7('low-shots','Are low shots better than high ones?','Low shots into the corner are very hard for keepers, because they have to dive all the way down. High shots often sail over.','How do I keep my shot low?','Keep your head and knee over the ball as you strike. Leaning back makes it fly.'),
   t7('follow-in','What should I do after I shoot?','Keep running toward goal! Keepers sometimes spill the ball, and the first player there can score the rebound.','Do strikers always follow in?','The good ones do. It is the easiest goal you will ever get.'),
   t7('my-routine','What is your shooting practice routine?','Five shots to each corner with my right foot, then five with my left. I count how many hit, not how hard.','Do you ever get bored?','Then I make it a game. My little brother is keeper, and he has to wear a silly hat.'),
   t7('keeper-feet','When is a keeper easiest to beat?','When they are still moving or off balance. Watch their feet: if they are shuffling, shoot to the side they are leaving.','How do I see that so quickly?','Glance at the keeper just before you shoot. It takes practice, but it gets faster.'),
   t7('three-in-a-row','How did you hit the ring three times?','I took the same run-up each time and kept breathing slowly. Same steps, same strike, same calm.'),
   t7('missed-shot','What do you do after a miss?','I picture the shot going in, then reset. One miss does not mean the next one will miss.','Does that really work?','It helps me stay calm. Nervous legs kick worse than calm legs.'),
   t7('weak-foot-shoot','Should I shoot with my weaker foot?','Yes! Keepers often guess you will use your strong foot. A tidy shot with the other one surprises them.','How do I train my weaker foot for shooting?','Start close to the goal with gentle shots, and move back only when you hit the target often.')
  ],
  challenges:[
   c7('c-tight-angle','You are near the side of the box with a tight angle. Where is often the best place to aim?',['Into the keeper\'s gloves','Toward the far post','High into the crowd'],1,'Aiming across the keeper gives you more room, and a parry might fall to a teammate.','Shooting at the keeper or over the bar wastes the chance. Across goal toward the far post is often best.'),
   c7('c-rebound','You shot and the keeper saved it but dropped the ball. What should you have been doing?',['Celebrating','Running in to follow the shot','Walking back to halfway'],1,'Following in means you are first to the loose ball, ready to score the rebound.','Stopping to celebrate or walking away misses the easiest chance. Always follow your shot in.'),
   c7('c-keep-low','How do you keep a shot low?',['Lean back as you kick','Kick under the ball','Keep your knee and head over the ball'],2,'With your knee and head over the ball, the strike stays low and hard to save.','Leaning back or getting under the ball makes it rise. Stay over it to keep it down.'),
   c7('c-off-balance','The keeper is shuffling to their left as you shoot. Where should you aim?',['To the side they are moving away from','Right at their chest','The side they are moving toward'],0,'A moving keeper cannot easily push back the other way, so the side they leave is open.','Shooting where they are going or at their body makes the save easy. Aim for the side they are leaving.')
  ],
  openers:[
   'Ring, ring, ring! That is the sound of my three-in-a-row. Want to hear how I aim?',
   'My little brother says he will save my next shot. He is wearing a silly hat, so I doubt it.',
   'Hi! I am practising the far post today. Ask me a shooting question!',
   'Every shot I take, I count my steps. Seven, if you were wondering. What is on your mind?'
  ],
  returning:[
   'You asked "{topic}" before! I have a new shooting trick ready for you.',
   'Back already? After "{topic}" I practised something new at the ring.',
   'Hey, champion helper! You asked "{topic}" Let me tell you another one.'
  ]
 },
 'folk-lars':{
  topics:[
   t7('clear-obvious','When does VAR step in?','Only for a clear and obvious error, or a serious missed moment. If it is a close call either way, the referee\'s first decision usually stands.','Why not change every close call?','Because then every game would stop all the time. VAR is a safety net, not a second referee.'),
   t7('screen-sign','What sign does a referee make for a VAR review?','They draw a rectangle in the air with their fingers, like a TV screen. Everyone knows a review is happening.','Do they always go to the screen?','No. For facts like where a foul happened, the VAR can just tell them. For judgement calls they often look themselves.'),
   t7('team-in-room','Is it just one person in the VAR room?','No, there is a small team. The VAR and an assistant watch, and replay operators like me find the best camera angles fast.','What is your exact job?','I pick the clips and line them up. The quicker I find the right angle, the quicker the decision.'),
   t7('goal-line','Is goal-line technology the same as VAR?','No, it is a separate system. It tells the referee within a second whether the whole ball crossed the line.','How does the referee find out?','Their watch buzzes and shows a message. No waiting for replays at all.'),
   t7('whole-ball','When is it actually a goal?','When the whole ball has crossed the whole goal line, between the posts and under the bar. Even a tiny bit on the line is not a goal yet.','Is that the same in every format?','Yes. Futsal, 7v7, 9v9 and 11v11 all use the whole-ball rule for goals and for the ball going out.'),
   t7('offside-lines','How do you check offside on a replay?','We freeze the frame at the moment the pass is played, then draw lines across the pitch. It is like a very careful ruler.','Why that exact moment?','Offside is judged when the ball is played, not when it is received.'),
   t7('match-day-snacks','What do you eat in the VAR room?','Very quiet snacks. Crunchy crisps are banned because everyone wears headsets!'),
   t7('want-var','Will kids\' games ever have VAR?','Probably not. It needs lots of cameras and people. In kids\' games, a friendly referee and fair players are the best technology.','So what should we do about mistakes?','Accept them and play on. Referees make far fewer mistakes than you might think.')
  ],
  challenges:[
   c7('c-whole-ball','Part of the ball is still on the goal line. Is it a goal?',['Yes, if most of it is over','No, the whole ball must cross','Only if the keeper touched it'],1,'The whole ball has to cross the whole line. If any part is on the line, it is not a goal yet.','Most of the ball is not enough, and the keeper does not matter. The whole ball must be over the line.'),
   c7('c-rectangle','The referee draws a rectangle in the air. What does it mean?',['A review using the video screen','A free kick to the home team','Half-time has started'],0,'The rectangle shows a TV screen. It tells everyone the decision is being reviewed.','It is not a free kick or a half-time signal. A drawn rectangle means a video review.'),
   c7('c-close-call','The replay is unclear and could go either way. What usually happens?',['VAR picks a winner by guessing','The match is replayed','The referee\'s first decision stands'],2,'VAR only changes clear and obvious mistakes. If it is unclear, the first decision stays.','VAR does not guess or replay matches. An unclear case keeps the original decision.'),
   c7('c-offside-moment','When is offside judged?',['When the pass is played','When the ball lands','When the attacker shoots'],0,'Offside is judged the moment a teammate plays the ball, so that is the frame we freeze.','Landing and shooting come too late. The moment the pass is played is what counts.')
  ],
  openers:[
   'Hello! I spend all day looking at screens, so I came to the pier to look at real waves.',
   'Freeze frame! Sorry, habit from work. Want to know how a review really happens?',
   'Today I counted eleven camera angles in my head just watching the beach game. Ask me anything.',
   'My headset is off and my eyes are resting. Perfect time for your football rules questions.'
  ],
  returning:[
   'You asked me "{topic}" last time. Let me rewind and show you a new angle.',
   'Welcome back! After "{topic}" I have another replay story for you.',
   'Ah, it is you again. Review complete on "{topic}" Here is something new.'
  ]
 },
 'folk-amani':{
  topics:[
   t7('morning-route','What is your morning run like?','Two lengths of the jetty, a loop round the lighthouse and a slow walk to finish. About half an hour.','Do you run in the rain?','Gentle rain, yes. Thunder, no. Safety first, always.'),
   t7('early-bird','Why do you run so early in the morning?','It is cool, quiet and the jetty is empty. By the time the anglers arrive, I am already stretching.','Is morning the best time to train?','Any time works if you are rested and have eaten something. Pick the time you enjoy most.'),
   t7('diagonal-run','Why do forwards run diagonally?','A diagonal run crosses in front of defenders, so they have to turn their heads to follow you. You can arrive in the gap between them.','Diagonal from where to where?','Often from wide toward the middle, or from the middle toward a corner. Start as your teammate looks up.'),
   t7('fun-run','Do you enter running races?','Coastal fun runs, twice a year. I do not try to win, just to beat my own time.','What is your best time?','Twenty-six minutes for five kilometres. Next goal: twenty-five.'),
   t7('run-buddy','Is it better to run with a friend?','Much better. A friend makes the time fly and keeps you going on lazy days. Just pick a pace where you can both chat.'),
   t7('cheer-team','Do you watch your team\'s games?','Every one I can. I wear my green scarf and cheer every tackle, not just the goals.','Why cheer tackles?','Defending is hard work. Players love to know someone noticed.'),
   t7('legs-heavy','What do you do when your legs feel heavy?','Shorten my steps and focus on my breathing. Small, light steps are easier than big tired ones.','Does it pass?','Usually, after a minute or two. Bodies are clever like that.'),
   t7('cold-mornings','How do you run when it is cold?','Layers I can peel off, a hat, and a longer warm-up. Cold muscles need extra time to get going.','Do outfield players ever wear gloves?','Some do on freezing days. It is allowed, as long as the gloves are safe.')
  ],
  challenges:[
   c7('c-overlap','Your winger has the ball near the touchline. What is an overlapping run?',['Running around the outside of them','Standing right behind them','Running back to your goal'],0,'Running around the outside gives the winger a new pass and pulls a defender away.','Standing behind or running away does not help the attack. An overlap goes around the outside.'),
   c7('c-press-trigger','When does a team often start pressing together?',['After a heavy touch by the opponent','Whenever they feel like it, one at a time','Only after scoring'],0,'A heavy touch is a good trigger: the ball is loose, so everyone squeezes in together.','Pressing one at a time leaves gaps. Teams wait for a trigger, like a poor touch, then go together.'),
   c7('c-switch','Every defender has moved over to the left side. Where is the space?',['Right in front of the ball','Behind your own goal','On the far right side'],2,'When defenders crowd one side, the far side opens up. A quick switch finds it.','Crowded areas and your own goal are not the space you want. Switch play to the empty far side.'),
   c7('c-together','Your team is tired late in the game. What keeps the team going?',['Each player saving themselves','Encouraging each other and sharing the running','Blaming whoever is slowest'],1,'Encouragement and shared running keep everyone working for each other.','Saving yourself or blaming others splits a team. Share the work and lift each other.')
  ],
  openers:[
   'Good morning! Two lengths of the jetty done and the sun is only just up. Want to chat football?',
   'I wore my green scarf on my run today. The seagulls did not seem impressed.',
   'Hello! My legs are warm and my head is full of football ideas. Pick one.',
   'The lighthouse loop is my favourite bit. I always think about overlapping runs going round it.'
  ],
  returning:[
   'You asked "{topic}" last time! I thought about it on this morning\'s run.',
   'Back on the jetty? After "{topic}" I have something new from my morning loop.',
   'Hey, running friend! You asked "{topic}" Here is another one for you.'
  ]
 },
 'folk-seoyeon':{
  topics:[
   t7('format-sizes','How many players are in each path\'s games?','Futsal has five a side, 7v7 has seven and 9v9 has nine. 11v11 has eleven. Every one of those counts includes the goalkeeper.','Which felt the most crowded?','Futsal. Five players on a small court means someone is always close to you.'),
   t7('sketchbook','How do you remember all the different rules?','I draw tiny pitch pictures in a sketchbook, one page per format. Pictures stick in my head better than words.','What is on your futsal page?','A little court with five dots a side and an arrow showing the keeper rolling the ball out.'),
   t7('futsal-back-pass','Can a futsal keeper get the ball back straight away?','Not in their own half. Once the keeper has played it, they cannot take it back there until an opponent has touched it.','Does that make building play harder?','It makes you think. Your teammates have to move to give the keeper a forward option.'),
   t7('pitch-sizes','Are the pitches different sizes on each path?','Yes. Futsal is on a small court, 7v7 and 9v9 use medium pitches and 11v11 uses the biggest. More players need more room.','Do the goals change size too?','They do. Futsal goals are small, and 11v11 goals are the biggest of all.'),
   t7('three-two-three','What formation did you like in 9v9?','Three-two-three: three at the back, two in midfield, three up front. The keeper is counted separately.','Why that one?','It is balanced, with players spread across the pitch. Easy to find triangles.'),
   t7('waiting-time','What do you do while waiting for the ferry?','Revise my favourite lessons in my head and count the boats. So far today: nine.'),
   t7('hardest-path','Which path was the hardest?','11v11. The pitch is so big that my first passes kept running out of steam halfway.','How did you fix it?','I practised longer passes with my laces, and I learned to move closer to support my teammates.'),
   t7('advice-new','What advice would you give a beginner?','Finish one lesson a day and replay the tricky ones. Small steps add up faster than you think.','Is it okay to get answers wrong?','Of course. Wrong answers show you what to look at next time.')
  ],
  challenges:[
   c7('c-futsal-restart','In futsal, the ball goes over the touchline. How does play restart?',['With a throw-in','With a kick-in','With a drop ball'],1,'Futsal uses a kick-in from the touchline, and it must be taken within four seconds.','Throw-ins belong to the bigger formats, and a drop ball is something else. Futsal restarts with a kick-in.'),
   c7('c-player-count','How many outfield players does a 9v9 team have?',['Eight','Nine','Seven'],0,'Nine players means one goalkeeper and eight outfield players.','The nine includes the keeper, so there are eight outfield players.'),
   c7('c-build-out','In a game using a build-out line, what does the other team do at your goal kick?',['Stand right next to your keeper','Wait behind the build-out line','Walk off to the bench'],1,'They wait behind the line, giving your team space to pass out from the back.','They neither crowd the keeper nor leave. They must retreat behind the build-out line.'),
   c7('c-keeper-back','In futsal, your keeper just passed out in your own half. Can they take a pass straight back there?',['Yes, as many times as they like','Only with their hands','Not until an opponent touches it'],2,'The keeper must wait until an opponent has touched the ball before receiving it back in their own half.','The keeper cannot keep collecting it, with feet or hands. An opponent must touch it first.')
  ],
  openers:[
   'Nine boats so far today and still no ferry for me. Want to quiz me on the learning paths?',
   'I just revised kick-ins in my head for the fifth time. Futsal sticks in your brain!',
   'Hi! Almost every path is finished. Ask me about any format: five, seven, nine or eleven a side.',
   'My bag is packed and my lessons are done. All I need now is a good question from you.'
  ],
  returning:[
   'You asked "{topic}" last time! I revised something new since then.',
   'Still no ferry, so I am glad you are back. After "{topic}" here is another path tip.',
   'Hey, study buddy! You asked "{topic}" Let me share a different lesson.'
  ]
 },
 'folk-rodrigo':{
  topics:[
   t7('programme','What is a match programme?','A little booklet sold on matchday with team lists, stories and photos. Some fans collect them for years.','Do you have any?','A whole shelf in the crew cabin! The oldest is so faded you can barely read the score.'),
   t7('team-travel','How does a team travel to an away game?','Together, with the kit bag, water and a plan for when to arrive. Getting there early leaves time to warm up properly.','What is in the kit bag?','Shirts, shorts, socks, spare boots, first-aid kit and a pump for the balls.'),
   {"id": "crew-shifts", "question": "Why do ferry crews swap shifts?", "answer": "Fresh crew come on so nobody gets too tired, just like substitutes bring fresh legs.", "followUp": {"question": "Who plans the shifts?", "answer": "The captain does, a bit like a coach planning substitutions."}},
   t7('seasick','What if I feel seasick on the ferry?','Sit in the middle of the boat and look at the horizon. Fresh air and a small snack help too.','Do players ever get seasick?','I once had a whole team go a bit green. They still won, so do not worry.'),
   t7('ferry-safety','What are the ferry rules?','Stay behind the railings, keep the ball in your bag and listen to the crew. A ball kicked on deck usually ends up as fish food.'),
   t7('away-respect','How should I act at an away match?','Like a good guest. Cheer your team, thank the home club and leave your seat tidy.','Should I boo the home team?','No. Cheer for your side instead. Kind fans make every trip better.'),
   t7('favourite-trip','What was your favourite matchday trip?','A stormy one where everyone sang to stay cheerful. The sun came out just as we reached the harbour.','Who won that day?','I cannot remember. I remember the singing, and that is the best part.'),
   t7('score-game','How does your score-guessing game work?','Everyone writes a guess on a ticket. Whoever is closest gets to ring the ferry bell on the way home.','Has anyone guessed exactly?','Once. A little girl guessed two-one, and she rang the bell for a full minute.')
  ],
  challenges:[
   c7('c-home','What does "home advantage" mean?',['Playing at your own ground with your fans','Getting an extra player','Starting with a goal'],0,'Home teams know their pitch and have their fans, which can give a small confidence boost.','No extra players or free goals. Home advantage is about familiar ground and support.'),
   c7('c-arrive-early','Why should a team arrive early to an away game?',['To pick the best seats','To warm up properly','To meet the referee first'],1,'Arriving early gives time to change, warm up and feel settled before kick-off.','Seats and meeting the referee are not the point. The warm-up is.'),
   c7('c-good-guest','You are an away fan at a match. What is good behaviour?',['Boo the home players','Leave rubbish under your seat','Cheer your team and stay respectful'],2,'Cheering your team respectfully makes the trip fun for everyone, including the home fans.','Booing and littering make a bad guest. Cheer your own team and stay kind.'),
   c7('c-calm-away','Your team is away in front of a loud crowd. What helps most on the pitch?',['Rushing every pass','Staying calm and keeping the ball','Arguing with the crowd'],1,'Calm passing quietens the crowd and lets your team settle into the game.','Rushing or arguing plays into the noise. Keep the ball and stay calm.')
  ],
  openers:[
   'All aboard for football talk! The ferry is tied up, so I have a few minutes.',
   'I just polished the ferry bell. Someone is going to ring it on the next matchday.',
   'Hello! Three swapped scarves on my railing and room for more. What would you like to know?',
   'The sea is calm, the crew is ready and I am in a chatty mood. Ask away!'
  ],
  returning:[
   'You asked me "{topic}" last time. The ferry has been back and forth, and I have a new story.',
   'Welcome aboard again! After "{topic}" I have another matchday tale for you.',
   'Ah, my favourite passenger. You asked "{topic}" so here is something fresh.'
  ]
 },
 'folk-yuki':{
  topics:[
   t7('many-balls','Why are there balls all around the pitch?','At big matches, spare balls sit in spots around the pitch. When one goes out, a ball kid hands over a new one so play restarts quickly.','What happens to the old ball?','Another ball kid fetches it and puts it back in a spot. It is like a ball relay.'),
   t7('which-restart','How do I know if it is a corner or a goal kick?','Look at who touched it last before it crossed the goal line. Attacker touched it: goal kick. Defender touched it: corner.','And over the side line?','That is a throw-in, for the team that did not touch it last.'),
   t7('fair-kid','Do ball kids help the home team?','A good ball kid is fair to both teams. Same speed, same smile, whoever is taking the throw.','Is it hard to stay fair?','A bit, when your favourite team is playing! But fairness is part of the job.'),
   t7('stay-still','What do ball kids do while play is on?','Stay still, sit or kneel, and watch. Moving around would distract the players.','Do you get to watch the game?','The best seat in the stadium! Just remember you are there to work.'),
   t7('rolling-ball','Do you throw the ball to players?','A gentle underarm roll or a hand-over. Never a hard throw, because the player needs to catch it easily.'),
   t7('rainy-day','What is the hardest thing about being a ball kid?','Rainy days. The balls get slippery, so I dried them on a towel between throws.','Did you drop any?','One. It rolled under the bench and a goalkeeper winked at me.'),
   t7('dad-practise','Do you practise with your dad?','Yes, passing on the dock. He says I have quick hands and even quicker feet.','What do you practise?','Quick passes and catching rolls. Ball kid skills and football skills together.'),
   t7('dream-job','What do you want to be when you grow up?','A referee or a groundskeeper. Both get to be on the pitch every match.','Why not a player?','Maybe that too! I just like seeing how a whole match works.')
  ],
  challenges:[
   c7('c-goal-kick','The ball goes over the goal line, last touched by an attacker. What is the restart?',['A corner for the attackers','A throw-in from the side','A goal kick for the keeper\'s team'],2,'If an attacker touched it last before it crossed the goal line, the defending team gets a goal kick.','A corner is when a defender touches it last, and throw-ins are for the side lines. This is a goal kick.'),
   c7('c-corner','The ball goes over the goal line, last touched by a defender. What is the restart?',['A goal kick from the six-yard box','A corner kick for the attacking team','A free kick on the edge of the box'],1,'When a defender sends it over their own goal line, the attackers get a corner kick.','Goal kicks happen when an attacker touches it last. A defender touching last means a corner.'),
   c7('c-fair-kid','Your favourite team is losing. As a ball kid, what should you do?',['Help both teams the same','Slow down for the other team','Hide the spare balls'],0,'A fair ball kid helps both teams equally. That is what keeps a match fair.','Slowing down or hiding balls is unfair. Help both teams the same way.'),
   c7('c-side-line','The ball crosses the side line. Which team takes the throw-in?',['The team that touched it last','The team that did not touch it last','Whoever reaches it first'],1,'The throw-in goes to the team that did not touch the ball last.','It is not a race and not for the team who touched it last. The other team takes the throw.')
  ],
  openers:[
   'Hi! I just practised a perfect underarm roll to my dad. He caught it with one hand.',
   'Want to know a ball kid secret? You watch the game more closely than anybody.',
   'I am counting spare-ball spots on an imaginary pitch. There are lots! Ask me something.',
   'Hello! Dad says I talk about restarts in my sleep. Corner, goal kick, throw-in...'
  ],
  returning:[
   'You asked "{topic}" last time! I have another ball kid fact for you.',
   'You came back! After "{topic}" I learned something new from Dad.',
   'Hey, I remember you and "{topic}" Ready for a new one?'
  ]
 },
 'folk-hamza':{
  topics:[
   t7('minibus','What is it like driving the team minibus?','Noisy and happy. The players choose the music on the way there, and the winners choose on the way home.','Who usually chooses on the way home?','Lately, us! But a draw means I choose, and I pick very old songs.'),
   t7('volunteer-jobs','What jobs do club volunteers do?','Washing kit, setting up goals, making tea, driving and cheering. Every job helps the team get on the pitch.','Which job is your favourite?','Cheering. You do not need any training, just a big voice.'),
   t7('one-foot-drill','What one-foot drill can I try?','Pass against a wall using only your weaker foot for two minutes. Then try receiving with it too.','Why only one foot?','It makes your weaker foot do all the work, so it learns faster.'),
   t7('club-spirit','What makes your club special?','Everyone welcomes newcomers. A new player gets a shirt, a buddy and a cheer on their first day.','What does the buddy do?','Shows them where everything is and passes to them first in the warm-up.'),
   t7('bus-checklist','What do you check before the minibus leaves?','Players, kit bag, water, first-aid box and the match address. Then I count the players again.','Have you ever forgotten something?','The corner flags, once. We used four water bottles instead.'),
   t7('yuki-ball-kid','Are you proud of Yuki being a ball kid?','Very! I watched from the stands and she never missed a throw. I cheered for her, not the teams.'),
   t7('fundraising','How do small clubs pay for things?','Bake sales, car washes and sponsored walks. Every coin goes on balls, bibs and petrol for the minibus.','Can kids help raise money?','Yes! Kids are the best bake-sale sellers. Who can say no to a cupcake from a goalkeeper?'),
   t7('everyone-plays','Why do you love inclusive football?','Because the game belongs to everybody. When rules change to welcome more people, the whole sport gets better.','How can my team be more welcoming?','Ask newcomers what they need, keep the game friendly and make sure everyone gets touches.')
  ],
  challenges:[
   c7('c-buddy','A new player joins your club. What helps them settle in fastest?',['Let them find their own way','Give them a buddy who passes to them early','Put them in goal all day'],1,'A buddy makes them feel welcome and gets them involved straight away.','Leaving them alone or stuck in one spot can feel lonely. A buddy and early passes help.'),
   c7('c-weak-foot','What is a good way to train your weaker foot?',['Only use your strong foot','Kick as hard as possible','Short passes using only the weaker foot'],2,'Short passes with only the weaker foot give it lots of touches, and it improves quickly.','Using only your strong foot or blasting the ball does not train the weaker one. Short, calm reps do.'),
   c7('c-balance','Why does balance help a footballer?',['It helps you strike cleanly and stay up in tackles','It makes your boots last longer','It stops the referee seeing fouls'],0,'Good balance means clean contact with the ball and staying on your feet when challenged.','Balance is about your body control, not boots or referees. It helps every kick and tackle.'),
   c7('c-volunteer','Which of these is a way a volunteer helps a club?',['Telling the referee what to do','Setting up goals and washing kit','Choosing the final score'],1,'Volunteers do the jobs that let games happen, like setting up goals and washing kit.','Volunteers do not run the referee or the score. They help with the work behind the scenes.')
  ],
  openers:[
   'Minibus parked, kit washed, and one sock still missing. Want to talk football while I search?',
   'Hello! Yuki is practising passes on the dock. Proud dad moment. What can I tell you?',
   'I just counted the club\'s cones twice. Fifty-two. What football question do you have?',
   'Every club needs helpers, and today I am your helper. Ask away!'
  ],
  returning:[
   'You asked "{topic}" last time. I thought about it on the minibus. Here is something new.',
   'Welcome back! After "{topic}" let me tell you another story from our club.',
   'Ah, Yuki\'s friend who asked "{topic}" I have a fresh one for you.'
  ]
 },
 'folk-mahina':{
  topics:[
   t7('cheer-kindly','How do you cheer at beach soccer?','Loudly for good play, quietly when someone is hurt, and never mean words for the other team. Cheering is a skill too.','What is your favourite cheer?','Clapping in time with the waves. It sounds a bit silly, but everyone joins in.'),
   t7('scorebook','Do you keep track of the scores?','In a little notebook. I write the score after every period and draw a star by my favourite goal.','How many stars so far this season?','Forty-one. One page is just stars.'),
   t7('best-seat-cay','Where is the best seat at the cay court?','Halfway along the side, near the flags. You can see both goals and the benches.','Why watch the benches?','Players swap so often that the benches are half the story.'),
   t7('best-goal-seen','What is the best goal you have seen on the cay?','A volley straight from a teammate\'s throw that flew over the keeper and in. The court went silent, then erupted.','Why was it so special?','Nobody let the ball touch the sand once. Pure air football.'),
   t7('lights-on','Are there beach games at night?','Some beach courts have floodlights, so games carry on once the sand cools down. The white ball almost glows.','Is it hard to see the ball?','Not with good lights. The shadows just look extra long and wobbly.'),
   t7('family-day','Do you bring your family to games?','Every Sunday. My grandpa brings a big umbrella and my little cousins build sandcastles behind the goal.','Do the castles survive?','Never. A shot always finds them. They build them again at half-time.'),
   t7('sound-of-sand','What does beach soccer sound like?','A soft thump on the ball, a swish of sand and lots of shouting. Very different from boots on grass.'),
   t7('pick-a-team','How do you choose which team to support?','I support whoever plays the kindest football that day. Some days I cheer for both.','Can I really cheer for both sides?','Of course! You can enjoy good football from any team.')
  ],
  challenges:[
   c7('c-cheer','A player on the other team gets hurt. What should fans do?',['Cheer louder for your team','Stay quiet and clap when they get up','Shout at the beach referee'],1,'Staying quiet and clapping when they recover shows respect for every player.','Cheering or shouting at that moment is unkind. Wait quietly and clap them back up.'),
   c7('c-keeper-forward','Why might a beach keeper join the attack?',['To add an extra attacker','To rest their hands','Because the rules force it'],0,'An extra attacker can create a free player, though it leaves the goal empty for a moment.','It is a choice, not a rule, and not about resting. It adds an extra attacker.'),
   c7('c-hold-up','What does a pivot holding up the ball mean?',['Kicking it far away','Picking it up','Keeping it safe until teammates arrive'],2,'Holding up the ball buys time for teammates to join the attack.','Kicking it away or picking it up gives the ball away. Holding up means keeping it safe for support.'),
   c7('c-bench-watch','Why is it worth watching the benches in beach soccer?',['Players swap in and out often','The coach scores goals','The ball is kept there'],0,'Players change often, so the benches show you who is fresh and what a team is planning.','Coaches do not score and the ball stays on the sand. Benches matter because of all the swaps.')
  ],
  openers:[
   'My notebook is open and my pencil is sharp. Did you see that last goal? Star-worthy!',
   'Grandpa saved me a seat under his umbrella. There is room for one more fan!',
   'Hello! The cay court is warming up. Ask me anything while the players stretch.',
   'I have clapped so much today my hands are tired. My voice is fine though. What is up?'
  ],
  returning:[
   'You asked "{topic}" last time! I wrote that in my notebook, next to a star.',
   'Back at the court? After "{topic}" I have another beach soccer tale.',
   'Hey, fellow fan! You asked "{topic}" Here comes a fresh one.'
  ]
 },
 'folk-kenji':{
  topics:[
   t7('tidy-stands','Why do some fans tidy up after a match?','In Japan, many fans pick up their rubbish and even help clean the stands. Leaving a place better than you found it is a good habit.','Do players do it too?','Some teams tidy their changing room until it shines and leave a thank-you note.'),
   t7('bow-pitch','Why do some players bow to the pitch?','In many Japanese teams, players bow before and after training to say thank you to the field and the people who care for it.','Can I do that?','Of course! A small bow or a quiet thank you to your pitch is a lovely habit.'),
   t7('dry-boots','How do you look after your boots?','Knock off the mud, wipe them and stuff them with newspaper to dry. Never put them right next to a heater.','Why not near a heater?','Fast heat can crack the leather and bend the shape. Slow drying keeps them comfortable.'),
   t7('sharp-passes','How do you keep your passes sharp?','Every morning I pass against my garden wall with both feet. Twenty with each, no rushing.','How long have you done that?','Since I was a boy. My garden wall has seen more passes than most pitches.'),
   {"id": "club-names", "question": "How do clubs get their names?", "answer": "Many are named after their town, a river or a local animal. A good name is easy to chant.", "followUp": {"question": "Could I name a team?", "answer": "Of course! Pick something your friends will love shouting."}},
   t7('first-match-memory','What do you remember about your first big match?','The noise! Drums, flags and thousands of people singing. I was only a young man and I could not stop smiling.'),
   t7('old-boots','Do you still have your old boots?','Yes, in a box. The leather is soft and cracked, but they remind me of every game I played.','Why keep them?','Some things hold memories. I take them out and tell my grandchildren stories.'),
   t7('play-forever','Can you play football at any age?','Yes! Walking football, gentle kickabouts and coaching all keep you in the game. The ball does not care how old you are.','What age is the oldest player you know?','A friend of mine still plays at ninety-one. He is our best passer.')
  ],
  challenges:[
   c7('c-walking','In walking football, what does "no running" mean?',['One foot always stays on the ground','You may jog slowly','You can run without the ball'],0,'With one foot always touching the ground, everyone is walking. That keeps the game safe and fair.','Jogging and running without the ball are still running. One foot must stay on the ground.'),
   c7('c-patience','Your team has the ball but there is no clear gap. What does a patient team do?',['Try a shot from your own half','Keep passing until a gap opens','Kick it over the touchline on purpose'],1,'Patient passing moves defenders around until a gap appears.','Long shots and kicking it out usually give the ball away. Keep it and wait for the gap.'),
   c7('c-leave-better','After a match, what is a good habit for players and fans?',['Leave rubbish for someone else','Run straight home','Tidy up and say thank you'],2,'Tidying and thanking people shows respect for the place and those who look after it.','Leaving mess or rushing away forgets the people who care for the pitch. Tidy up and say thanks.'),
   c7('c-both-feet','Why practise passing with both feet?',['It confuses your teammates','You can pass from either side quickly','It is a rule in every match'],1,'Using both feet means you can pass quickly whichever side the ball comes to.','It is not a rule and it helps teammates. Two good feet give you more options.')
  ],
  openers:[
   'Ah, hello! I was just remembering the drums from my first big match. Come and chat.',
   'My garden wall got forty passes this morning. Twenty each foot. What can I tell you?',
   'Konnichiwa! A walking footballer is never in a rush, so take your time with your question.',
   'I bowed to the court this morning, as always. A little thank you goes a long way.'
  ],
  returning:[
   'You asked me "{topic}" before. An old man has many stories, so here is a new one.',
   'Welcome back, young friend. After "{topic}" I remembered something else.',
   'Ah, the one who asked "{topic}" Patience pays off. Here is something fresh.'
  ]
 },
};
