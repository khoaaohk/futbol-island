import type {NpcFresh} from '../npcFreshTypes';
export const PART_5:Record<string,NpcFresh>={
"cay-runner":{
 topics:[
  {id:"first-step",question:"How do I get a faster first step?",answer:"Lean forward a little and take short, punchy steps for the first few strides. Big steps from standing feel strong but start slow.",followUp:{question:"When do my strides get longer?",answer:"Once you are moving, your steps grow by themselves. Racing a friend from a standing start on the causeway is a fun way to practise."}},
  {id:"backpedal",question:"Is it okay for defenders to run backwards?",answer:"Little backward steps are fine for a short way while you watch the attacker. Over a long distance, turning and running forwards is quicker and safer.",followUp:{question:"When should I turn and run?",answer:"The moment the attacker knocks the ball past you and speeds up. Running backwards cannot keep up with a full sprint."}},
  {id:"curved-run",question:"Why do strikers run in a curve?",answer:"A curved run lets you watch the passer and the defenders at the same time. Then you can bend into the gap at just the right moment.",followUp:{question:"Is a straight run ever better?",answer:"Sometimes, when the space is right in front of you. A good runner picks the shape that keeps the gap open longest."}},
  {id:"check-run",question:"How do I lose the player marking me?",answer:"Jog away from where you want the ball, then cut back sharply toward it. That sudden change leaves your marker a step behind.",followUp:{question:"Do I need to be super fast for that?",answer:"Not really. The surprise matters more than speed, and a quick glance at your marker tells you when to cut back."}},
  {id:"finish-line",question:"Why do you sprint right past your finish marker?",answer:"If you slow down before the line, you lose time right at the end. Footballers do the same when they chase a ball all the way.",followUp:{question:"Is that why players chase balls near the line?",answer:"Yes. Sometimes the ball stops just before going out, and the player still running gets it. Finishing the run gives you that chance."}},
  {id:"warm-jog",question:"Do you start running fast straight away?",answer:"Never! I start with an easy jog, then some skips and side steps. Cold muscles are like stiff rubber bands.",followUp:{question:"Should my warm-up have a ball in it?",answer:"Yes, near the end add gentle passes and dribbles. About ten minutes in total gets your legs and your touch ready."}},
  {id:"with-ball",question:"Is running with the ball slower?",answer:"A bit, because you must touch it. Big pushes into open space let you run almost at full speed between touches."},
  {id:"run-count",question:"How many sprints is a match?",answer:"Lots of short ones, plus plenty of walking and jogging between them. Football fitness is about doing the next sprint well, not one giant run."}
 ],
 challenges:[
  {id:"c-lost-ball",prompt:"Your team just lost the ball near the other goal. What should you do first?",options:["Stop and wave for a foul","Sprint back to get goal side","Wait up front for the next pass"],correct:1,right:"Yes! A quick recovery run puts you between the ball and your goal, which slows their attack down.",wrong:"Not quite. When the ball is lost, the first job is a recovery run back to get goal side of an opponent."},
  {id:"c-push-touch",prompt:"You have a huge empty space ahead and nobody near you. How do you dribble?",options:["Tiny touches every step","Push the ball further ahead and run","Stop and look around for a while"],correct:1,right:"Right. With open space, bigger pushes let you run fast. Use tiny touches when defenders are close.",wrong:"Not this time. Tiny touches slow you down in open space. Push it further ahead and chase it at speed."},
  {id:"c-curve",prompt:"A teammate in midfield looks up to pass to you. How should you make your run?",options:["Bend the run so you can see ball and defenders","Run with your back to the passer","Stand still and shout loudly"],correct:0,right:"Spot on! A curved run keeps the passer and the defenders in view, so you can time your burst into the gap.",wrong:"That makes it harder. A curved run lets you watch the passer and the defenders, so you time the burst well."},
  {id:"c-pace",prompt:"It is the first minute of the match. How should you use your energy?",options:["Sprint flat out everywhere you go","Never sprint, just to save energy","Sprint when it matters, jog or walk between"],correct:2,right:"Exactly. Matches are made of short bursts with recovery in between. Sprint for the important moments.",wrong:"Not quite. Sprinting everywhere wears you out, and never sprinting means missing chances. Burst when it matters."}
 ],
 openers:[
  "Phew, that was my fifth lap of the causeway! Want to hear the sneaky trick that keeps my legs fresh?",
  "Hi! I am timing my breathing with my steps: in for two, out for two. Got a running question for me?",
  "The breeze off the water is lovely today. It cools me down between sprints. What can I help with?",
  "I just raced a crab along the sand. It went sideways, so I am calling it a draw. Fancy a chat?"
 ],
 returning:[
  "You asked me \"{topic}\" while I was mid-lap. I have caught my breath now, so ask me something new!",
  "Back on the causeway! Last time it was \"{topic}\". Shall we sprint to a fresh question?",
  "I was thinking about \"{topic}\" on my cool-down jog. Want another running secret?"
 ]
},
"farm-lani":{
 topics:[
  {id:"protein-crops",question:"Do you grow anything for strong muscles?",answer:"Beans and peas! They have protein, which helps your muscles repair after a hard training session.",followUp:{question:"What else has protein?",answer:"Eggs, fish, milk, yoghurt, nuts and lentils all have some. Mixing a few of them through the week is a good plan."}},
  {id:"slow-growing",question:"How long does a plant take to grow?",answer:"Some herbs pop up in a week, but a sweet potato needs months. Skills are the same: little and often, then one day it just works.",followUp:{question:"What if I practise and nothing changes?",answer:"Roots grow before leaves show. Keep going for a few weeks and the progress usually appears all at once."}},
  {id:"weeding",question:"Why do you pull out weeds every day?",answer:"Weeds steal water and sunlight from my crops. A small one is easy to pull, a big one fights back.",followUp:{question:"Is that like a bad habit in football?",answer:"Very much! Fix a small habit, like never looking up, early. Left alone it grows roots and is much harder to change."}},
  {id:"compost-heap",question:"What is in that smelly heap?",answer:"Compost! Old peels and leaves rot down into rich soil that feeds new plants. Nothing is wasted.",followUp:{question:"Can mistakes be like compost?",answer:"Yes. A missed pass can feed your next good one if you think about what went wrong and try again."}},
  {id:"rows-spacing",question:"Why are your plants in neat rows?",answer:"If they are too close, they crowd each other and nothing grows well. Space lets every plant get its share of sun.",followUp:{question:"Do teams need space too?",answer:"They do! If everyone bunches around the ball, nobody is free. Spread out and passes have somewhere to go."}},
  {id:"scarecrow",question:"Does the scarecrow ever play in goal?",answer:"He tried once, but he never moves his feet. The birds scored every time.",followUp:{question:"What does a real keeper do differently?",answer:"A real keeper shuffles to stay in line with the ball and talks to the defenders. Standing still with arms out is a scarecrow move."}},
  {id:"rain-day",question:"What do you do when it rains for days?",answer:"I fix tools and plan next season's planting. A rainy day is a thinking day on a farm."},
  {id:"harvest-team",question:"Do you pick all the crops by yourself?",answer:"At harvest time the whole family helps, and we finish before lunch. Many hands make a big job small."}
 ],
 challenges:[
  {id:"c-bunching",prompt:"Six players on your team are all crowded around the ball. What is the problem?",options:["Nobody is free to receive a pass","The ball gets lonely","There is no problem at all"],correct:0,right:"Right. Like plants in a crowded row, bunched players block each other. Spreading out makes passing lanes.",wrong:"Think about my rows. When everyone crowds the ball, nobody is free, so spread out to make passing options."},
  {id:"c-practice-plan",prompt:"Which practice plan helps you improve a skill best?",options:["Three hours once a month","A short session most days","Only practise on match day"],correct:1,right:"Yes. Little and often, like watering crops, builds a skill that lasts.",wrong:"Not quite. Big rare sessions and match-only practice do not stick. Short, regular practice grows skills best."},
  {id:"c-recover-food",prompt:"After a long training session, which snack helps your muscles repair?",options:["Only a fizzy drink","Nothing until tomorrow","Yoghurt with beans on toast later"],correct:2,right:"Good choice. Protein from foods like yoghurt and beans helps muscles repair after hard work.",wrong:"Muscles need building blocks to repair. Protein foods such as yoghurt, eggs or beans help after training."},
  {id:"c-habit",prompt:"You notice you always dribble with your head down. When should you work on it?",options:["Now, while it is a small habit","Next year, when you are older","Never, it does not matter"],correct:0,right:"Yes. Like pulling a small weed, fixing a habit early is much easier than later.",wrong:"Habits are like weeds: small ones pull out easily. Start lifting your head now, before it grows roots."}
 ],
 openers:[
  "Mind the sweet potato row! I just planted new ones. What would you like to know about the farm today?",
  "My boots are muddier than a rainy cup final. Come over, I will tell you a farming secret that helps footballers.",
  "The beans are climbing their poles like keepers reaching for the crossbar. Got a question for me?",
  "Morning! I have been chasing a hen out of the lettuce. She has a great body swerve. What brings you here?"
 ],
 returning:[
  "Oh, you again! You asked \"{topic}\" last time. The seeds have sprouted since then, and so have my answers.",
  "Welcome back to the rows. I remember \"{topic}\". Want to dig up a new question?",
  "Last visit it was \"{topic}\". Today I have fresh ideas straight from the soil."
 ]
},
"farm-bo":{
 topics:[
  {id:"pruning",question:"Why do you cut branches off the trees?",answer:"Pruning removes tangled branches so the tree puts its energy into good fruit. Less clutter, better results.",followUp:{question:"Can football be pruned too?",answer:"Kind of. Cutting out extra touches and fancy flicks often makes your play cleaner and quicker."}},
  {id:"ripe-timing",question:"How do you know when a mango is ready?",answer:"It smells sweet near the stem and gives a little when gently squeezed. Pick too early and it is hard and sour.",followUp:{question:"Does timing matter in football?",answer:"All the time. A pass played too early or too late is like an unripe mango. Wait for the moment the run is on."}},
  {id:"low-fruit",question:"Which fruit do you pick first?",answer:"The low ones I can reach easily. Then I fetch the ladder for the tricky high ones.",followUp:{question:"Is that a football tip?",answer:"It is! Take the simple pass when it is on. Save the hard, risky ones for when nothing easier is open."}},
  {id:"bee-helpers",question:"Why are there bees all over the orchard?",answer:"Bees carry pollen from flower to flower, and that is how fruit starts to grow. No bees, no mangoes.",followUp:{question:"Are bees like teammates?",answer:"Busy little teammates! Each one does a small job that helps the whole orchard succeed."}},
  {id:"branch-width",question:"Why do the best trees spread out wide?",answer:"Wide branches catch more sunlight. A tree all squashed into one thin trunk would not grow much fruit.",followUp:{question:"Should a team spread wide too?",answer:"Yes. Players near the touchlines stretch the other team, which opens gaps in the middle."}},
  {id:"ladder-safe",question:"Can I climb the ladder to pick fruit?",answer:"Only with a grown-up holding it steady. Safety first in the orchard, just like shin pads first on the pitch."},
  {id:"papaya-seeds",question:"What are the black dots inside a papaya?",answer:"Those are its seeds, and there are loads of them. Plant one and, with sun and water, it may grow a whole new tree.",followUp:{question:"How fast does a papaya tree grow?",answer:"Surprisingly fast for a tree, often fruiting in about a year. Bananas and papayas are the quick learners of my orchard."}},
  {id:"orchard-triangle",question:"Why did you plant the trees in triangles?",answer:"Triangles give each tree room and make neat paths in every direction. I can walk to any tree without squeezing."}
 ],
 challenges:[
  {id:"c-triangle",prompt:"Your teammate has the ball. Where is the best place to support them?",options:["Directly behind a defender","At an angle, making a triangle","Right next to them, touching shoulders"],correct:1,right:"Yes! An angle makes a triangle, so there is a clear passing lane and room to receive.",wrong:"Hidden behind a defender or squashed beside them, you cannot get the ball. Stand at an angle to make a triangle."},
  {id:"c-simple-pass",prompt:"A short pass to an open teammate is on, and a risky long one is too. Which first?",options:["Always the long one","Shoot from halfway instead","The short pass, like the low fruit"],correct:2,right:"Right. Take the simple, open pass first. Keeping the ball lets your team build calmly.",wrong:"Like low fruit, the easy pass is often the best one. Keep the ball and save risky passes for when they are needed."},
  {id:"c-run-timing",prompt:"Your striker starts a run behind the defence. When do you pass?",options:["As the run begins, into the space ahead","Wait until they stop running","Before they even move"],correct:0,right:"Spot on. Pass into the space ahead as the run begins so the ball and runner arrive together.",wrong:"Too early or too late spoils it, like unripe fruit. Pass into space as the run starts so they meet the ball."},
  {id:"c-wide",prompt:"The middle of the pitch is packed with defenders. What can your team do?",options:["Keep passing into the crowd","Use the wide spaces near the touchline","Kick it out of play"],correct:1,right:"Yes. Going wide stretches defenders like spreading branches and can open gaps in the middle.",wrong:"Passing into a crowd usually loses the ball. Use the width near the touchlines to stretch the defence."}
 ],
 openers:[
  "Careful, a mango just dropped by my boot! Lucky it was not a header. What would you like to ask?",
  "I am counting papayas. Forty-one, forty-two... oh, you made me lose count! Go on, ask me something.",
  "The orchard smells like a fruit salad today. Grab some shade and tell me what is on your mind.",
  "My ladder and I are a great partnership. It holds steady, I do the reaching. Want to talk football?"
 ],
 returning:[
  "Back in the orchard! You asked me \"{topic}\" before. The trees have grown a little, and so have my answers.",
  "Last time you picked \"{topic}\". Shall we pick a new question off a higher branch?",
  "I remember \"{topic}\". Here is a riper idea for you today."
 ]
},
"farm-mele":{
 topics:[
  {id:"sun-hat",question:"Why do you always wear that big hat?",answer:"It shades my face and neck from the strong sun. On a hot pitch, a cap and sunscreen help you too.",followUp:{question:"Do I need sunscreen on cloudy days?",answer:"Yes, the sun's rays sneak through clouds. Put some on before you play outside and ask a grown-up to help you top it up."}},
  {id:"price-signs",question:"Why do you write signs for every box?",answer:"So people know what everything is without asking. Clear signs save everybody time.",followUp:{question:"Is talking on the pitch like signs?",answer:"Exactly. Short, clear calls like man on or turn tell teammates what they cannot see."}},
  {id:"counting-change",question:"Do you add up the change in your head?",answer:"Most of the time! It keeps my brain quick. Football needs a quick brain too, deciding in a second.",followUp:{question:"How do I think faster in games?",answer:"Look around before the ball comes. If you already know your next pass, you do not need to rush."}},
  {id:"stand-rota",question:"Who looks after the stand when you rest?",answer:"My cousins and I take turns, so nobody gets too tired. Fresh helpers sell more melons.",followUp:{question:"Do teams take turns too?",answer:"Yes, coaches use substitutes so tired players can rest and fresh players can come on."}},
  {id:"bruised-fruit",question:"What happens to fruit with a bruise?",answer:"I sell it cheaper or make juice with it. A bruise does not mean the fruit is bad inside.",followUp:{question:"Is that like a bad game?",answer:"A bit. One tough match does not make you a poor player. You still have plenty of good inside."}},
  {id:"honest-scales",question:"Why do you weigh fruit in front of people?",answer:"So everyone can see it is fair. Being honest makes customers trust me and come back."},
  {id:"stand-shade",question:"Why is your stand under the big tree?",answer:"The shade keeps the fruit cool and fresh for longer. It keeps me cool too, which keeps me smiling.",followUp:{question:"Should I rest in the shade at breaks?",answer:"Yes, on hot days find shade at half-time. It helps your body cool down faster."}},
  {id:"melon-tap",question:"Why do you knock on the melons?",answer:"A ripe melon sounds deep and hollow, a bit like a drum. An unripe one sounds dull and flat."}
 ],
 challenges:[
  {id:"c-man-on",prompt:"A defender is sneaking up behind your teammate who has the ball. What do you shout?",options:["Nothing, they will notice","Man on, behind you!","Shoot!"],correct:1,right:"Yes. Man on warns your teammate about pressure they cannot see, so they can protect the ball.",wrong:"Staying quiet or shouting shoot does not help. Man on tells them a defender is close behind."},
  {id:"c-handball-honest",prompt:"The ball hit your hand and the referee did not see. What is the fair-play choice?",options:["Hide it and keep quiet","Blame the other team","Tell the referee honestly"],correct:2,right:"That is real fair play. Honesty earns trust from referees, opponents and teammates.",wrong:"Hiding it or blaming others is not fair play. Telling the truth earns trust, like honest weighing at my stand."},
  {id:"c-subs",prompt:"Why do coaches use substitutes during a match?",options:["To rest tired players and bring in fresh legs","As a punishment for mistakes","Because the rules say everyone must swap"],correct:0,right:"Right. Like taking turns at my stand, subs keep the team fresh and give others a chance to play.",wrong:"Subs are not a punishment. They rest tired players and bring on fresh legs, just like my family takes turns."},
  {id:"c-scan-first",prompt:"How can you decide faster when the ball arrives?",options:["Close your eyes to focus","Look around before it reaches you","Always kick it as far as you can"],correct:1,right:"Yes. Checking around first means you already know your next move when the ball arrives.",wrong:"Not quite. Looking around before the ball comes is the secret to quick decisions."}
 ],
 openers:[
  "Fresh peppers today, red, yellow and green, like a team in three kits! What can I tell you?",
  "Hello, sunshine! I just finished writing a new sign for the melons. Want to ask me something?",
  "Shh, I am listening to a melon. It says it is ripe! Now, what would you like to chat about?",
  "The beach players bought every banana this morning. I saved my best football tips for you though."
 ],
 returning:[
  "Hello again! You asked about \"{topic}\" at my stand. I have restocked with new answers.",
  "My regular customer! Last time it was \"{topic}\". Fancy something fresh off the shelf?",
  "I wrote \"{topic}\" on my little list after your visit. Let us find a new question today."
 ]
},
"hostel-ari":{
 topics:[
  {id:"packing-list",question:"What should I pack for a tournament?",answer:"Boots, shin pads, socks, a spare shirt, a water bottle and something warm. Pack your own bag so you know where everything is.",followUp:{question:"Why pack it myself?",answer:"If you packed it, you can find it in a hurry. Teams that are organised off the pitch often stay calm on it."}},
  {id:"shin-pads",question:"Do I really need shin pads?",answer:"Yes, players must wear them in a proper match. They protect your shins from accidental kicks.",followUp:{question:"Where do they go?",answer:"Under your socks, covering the front of your lower leg. Make sure they fit so they do not slide around."}},
  {id:"lost-property",question:"What is in that big box by the desk?",answer:"Lost property! Odd socks, a lonely glove and about nine water bottles. Writing your name on your kit saves tears.",followUp:{question:"What is the strangest thing left here?",answer:"A single football boot. I still wonder how someone walked home."}},
  {id:"hello-languages",question:"Do visiting teams speak other languages?",answer:"Lots of them do. Learning hello and well played in their language makes new friends smile.",followUp:{question:"How do we play if we do not share a language?",answer:"Football has its own signals: pointing, clapping, a thumbs up. A good pass needs no words."}},
  {id:"roommates",question:"Do teams share rooms here?",answer:"Usually two to four players per room. Sharing nicely, like taking turns in the shower, is great team practice.",followUp:{question:"What if a roommate is homesick?",answer:"Be kind, chat with them or play a card game. Tell a coach too, so a grown-up can help."}},
  {id:"check-in",question:"What happens when a team checks in?",answer:"I count heads, hand out keys and explain breakfast times. It is like a warm-up before the main event."},
  {id:"travel-snacks",question:"What do teams do on long journeys?",answer:"They sing, read, nap and tell bad jokes. Keeping spirits up together starts before the first whistle.",followUp:{question:"Is it okay to feel nervous before?",answer:"Totally normal. Even experienced players get butterflies. Deep breaths and a familiar routine help."}},
  {id:"early-breakfast",question:"Why is breakfast so early on match days?",answer:"So players eat well before they play and have time to digest. Nobody wants to run with a full tummy."}
 ],
 challenges:[
  {id:"c-shin-pads",prompt:"Your team is about to play a proper match. What must every player wear?",options:["A hat","Shin pads under the socks","Sunglasses"],correct:1,right:"Correct. Shin pads are part of the required kit and protect your legs from kicks.",wrong:"Not that one. Shin pads are required kit for every player, worn under the socks."},
  {id:"c-kit-clash",prompt:"Both teams arrive wearing blue. What normally happens?",options:["One team changes to its other kit","Everybody plays in blue anyway","The referee sends both teams home"],correct:0,right:"Right. Teams must look different so players and the referee can tell them apart, so one changes kit.",wrong:"Playing in the same colour would be very confusing, so one team swaps to a different kit."},
  {id:"c-keeper-colours",prompt:"Why does a goalkeeper wear a different colour from their team?",options:["Keepers just grab whatever is clean","To look scary","So the referee can tell who may handle the ball"],correct:2,right:"Yes. The keeper's different colour helps the referee see who is allowed to use their hands.",wrong:"It is about the rules. A different colour shows the referee which player can handle the ball in the area."},
  {id:"c-arrive",prompt:"Your tournament game kicks off at ten. When should the team get to the pitch?",options:["Exactly at ten o'clock","Early enough to warm up together","Halfway through the first half"],correct:1,right:"Yes. Arriving early gives time to change, warm up and hear the coach's plan.",wrong:"Turning up at kick-off or later means no warm-up and a rushed start. Arrive early enough to warm up together."},
 ],
 openers:[
  "Welcome back to reception! The bell on my desk is ringing more than a referee's whistle today. How can I help?",
  "Room keys, breakfast times, football chat: I do it all. What would you like?",
  "A team from far away just checked in, and they brought drums! Come and ask me anything.",
  "I am sorting lost property again. Three left boots, no right ones. Got a question while I tidy?"
 ],
 returning:[
  "Checking in again? You asked me \"{topic}\" last stay. I have a new answer ready at the desk.",
  "Ah, a returning guest! Last time it was \"{topic}\". What can reception do for you now?",
  "I wrote \"{topic}\" in the guest book after your visit. Let us start a new page."
 ]
},
"home-koa":{
 topics:[
  {id:"small-space",question:"How do you practise in a tiny garden?",answer:"Small spaces are brilliant for close control. I dribble around flowerpots and pretend they are defenders.",followUp:{question:"Do the flowerpots ever win?",answer:"Only when I look down too long. Then I bump into them and the pot gets the ball."}},
  {id:"window-rule",question:"Have you ever broken a window?",answer:"Nearly! Now I always aim at my mini goal, away from houses. A good striker picks a safe target.",followUp:{question:"Where else is good to play?",answer:"Parks, school fields and anywhere a grown-up says is safe and allowed. Never near roads."}},
  {id:"toe-poke",question:"Is a toe poke a real shot?",answer:"Yes! A quick jab with the tip of your boot is handy when there is no time to swing. Futsal players use it a lot in tight spaces.",followUp:{question:"Why not toe poke every shot?",answer:"It is hard to aim and easy to slice wide. Save it for surprise moments and use your laces or inside foot for normal shots."}},
  {id:"dribble-one",question:"How do I beat a defender one on one?",answer:"Run at them with the ball close, then change speed or direction just before they reach you. A little fake with your shoulder helps.",followUp:{question:"What if they do not fall for it?",answer:"Then pass to a teammate instead. You do not need to beat everyone by yourself."}},
  {id:"neighbour-games",question:"Who do you play with after school?",answer:"Whoever is around: my sister, the twins next door and sometimes Grandpa as keeper. He saves with his slippers.",followUp:{question:"Is it fair to play with younger kids?",answer:"Yes, if bigger kids play a bit gentler. Everyone should get the ball and have fun."}},
  {id:"mini-goal-trick",question:"How do you score past Grandpa?",answer:"I watch where he stands, then aim for the side he left open. Low shots are hardest for him to reach."},
  {id:"rainy-practice",question:"What do you do when it is raining?",answer:"I practise toe taps with a soft ball indoors, if Mum says yes. Even a few minutes keeps my feet busy.",followUp:{question:"What are toe taps?",answer:"You tap the top of the ball with one foot, then the other, quickly, like a little dance."}},
  {id:"best-goal",question:"What is the best goal you ever scored?",answer:"A volley off the garden wall! It went in off the post and the cat ran away. Total legend moment."}
 ],
 challenges:[
  {id:"c-toe-poke",prompt:"The ball pops loose right in front of goal and a defender is lunging in. Which shot is quickest?",options:["A big run-up and blast","A quick toe poke","Stop it, then think about it"],correct:1,right:"Right! A toe poke needs no backswing, so it beats the defender's lunge in a tight spot.",wrong:"No time for that. With a defender lunging in, a quick toe poke gets the shot away before they arrive."},
  {id:"c-change-speed",prompt:"A defender is waiting for you to dribble at them. What helps you get past?",options:["Dribble slowly the same way","Kick the ball at the defender","A sudden change of speed or direction"],correct:2,right:"Yes. Sudden changes of speed or direction make it hard for a defender to stay with you.",wrong:"Slow, predictable dribbling is easy to stop. Change speed or direction suddenly to get away."},
  {id:"c-share",prompt:"You are much bigger than the kids in your street game. What makes it fun for all?",options:["Play gently and pass to everyone","Shoot as hard as possible","Keep the ball the whole time"],correct:0,right:"Exactly. Gentle play and sharing the ball means everyone wants to play again tomorrow.",wrong:"Hogging the ball or blasting shots spoils it. Play gently and pass so everyone gets involved."},
  {id:"c-open-side",prompt:"The keeper is standing close to one post. Where should you aim?",options:["Straight at the keeper","The open side away from them","Over the crossbar"],correct:1,right:"Yes! Aim for the open side, the space the keeper cannot reach quickly.",wrong:"Aiming at the keeper makes it easy for them. Pick the open side away from where they stand."}
 ],
 openers:[
  "Did you see that? I just scored my two-hundredth goal on the mini goal. Well, maybe hundred-and-fifty. Want to play?",
  "Hiya! Grandpa is having a nap, so the goal is empty. Ask me anything quick!",
  "The cat is my defender today. She is very good at lying in the way. What is up?",
  "I am practising my celebration. It has a spin and a thumbs up. What can I tell you?"
 ],
 returning:[
  "Hey, you came back! You asked me \"{topic}\" last time. I have a new answer, honest.",
  "Oh, it is you! Remember \"{topic}\"? Grandpa says ask me something new.",
  "I told the cat about \"{topic}\". She was not interested, but you might like the next one."
 ]
},
"home-lina":{
 topics:[
  {id:"banana-herb",question:"Is a banana plant really a tree?",answer:"Surprise, not exactly! It is a giant herb. The trunk is made of tightly rolled leaves.",followUp:{question:"How tall can it grow?",answer:"Some grow taller than a grown-up standing on another grown-up's shoulders. Mine is still a teenager."}},
  {id:"hibiscus-colours",question:"Why do hibiscus flowers have bright colours?",answer:"Bright colours help birds and insects find them. Bold colours help fans spot their team in the stands too.",followUp:{question:"How long does a flower last?",answer:"Many hibiscus flowers bloom for only about a day. Then a fresh one opens, like a new match every day."}},
  {id:"lightning-stop",question:"What happens if there is lightning at a match?",answer:"Everyone leaves the pitch and goes somewhere safe until the storm passes. No match is worth the risk.",followUp:{question:"How long do they wait?",answer:"Usually a good while after the last thunder. The referee and organisers decide when it is safe again."}},
  {id:"kind-chants",question:"Can you teach me a kind cheer?",answer:"Try: two, four, six, eight, both teams playing really great! It rhymes and nobody feels left out.",followUp:{question:"What about clapping in rhythm?",answer:"Clap, clap, pause, clap. When a whole crowd joins in, it sounds like gentle thunder."}},
  {id:"watering-time",question:"When is the best time to water plants?",answer:"Early morning, before the sun gets hot. The water soaks in instead of drying up.",followUp:{question:"Is there a best time to train?",answer:"On hot days, cooler mornings or evenings are much kinder to your body."}},
  {id:"garden-bees",question:"Are you scared of the bees?",answer:"Not at all. If you stay calm and leave them be, they just get on with their work."},
  {id:"tournament-flags",question:"Why are there so many flags in your garden?",answer:"I hang one for every team visiting the tournament. My garden is the friendliest stadium on the island.",followUp:{question:"Which one is your favourite?",answer:"Whichever team just played a lovely pass. I change my mind every match."}},
  {id:"lina-sub",question:"Do you ever watch the substitutes?",answer:"Always! Watching who warms up on the side tells me what the coach might change next."}
 ],
 challenges:[
  {id:"c-lightning",prompt:"Thunder and lightning start during your match. What is the right thing to do?",options:["Keep playing, it is nearly full time","Hide under a tall tree on the pitch","Leave the pitch for a safe shelter"],correct:2,right:"Right. Safety comes first. Players go to safe shelter and wait until the storm has passed.",wrong:"Playing on or hiding under a tall tree is not safe. Leave the pitch and shelter until it is safe."},
  {id:"c-ref-decision",prompt:"The referee gives a decision you think is wrong. What should a good fan do?",options:["Accept it and keep cheering your team","Boo the referee from the garden","Run onto the pitch"],correct:0,right:"Yes. Referees try their best, and respectful fans help everyone enjoy the game.",wrong:"Shouting or running on is not okay. Accept the call and keep cheering positively."},
  {id:"c-handshake",prompt:"The match ends and your team lost. What happens next?",options:["Walk straight off without a word","Shake hands and say well played","Refuse to look at the other team"],correct:1,right:"Exactly. Shaking hands and saying well played shows respect, win or lose.",wrong:"Respect matters even after a loss. Shake hands and say well played to the other team."},
  {id:"c-fresh-sub",prompt:"A substitute is warming up on the side. What might the coach be planning?",options:["Nothing, subs are just for show","To end the match early","To swap a tired player for fresh legs"],correct:2,right:"Right. A sub often replaces a tired player, or changes how the team plays.",wrong:"Subs matter! A coach usually brings one on to give fresh legs or change the plan."}
 ],
 openers:[
  "Hello, petal! A new hibiscus opened this morning, bright as a goalkeeper's shirt. What can I tell you?",
  "Come and sit by the banana plants. They make wonderful shade for a football chat.",
  "I just hung a new flag for a visiting team. Ask me something while I straighten it.",
  "My watering can and I have played a full ninety minutes today. Time for a break and a question?"
 ],
 returning:[
  "Hello again, dear! You asked me \"{topic}\" last time. My garden has grown a new idea since then.",
  "You are back! I remember \"{topic}\". Shall we plant a new question today?",
  "Last time it was \"{topic}\". The hibiscus has changed colour since, and so has my answer list."
 ]
},
"pier-nell":{
 topics:[
  {id:"narrow-angle",question:"How do keepers make the goal look small?",answer:"They step out a little toward the ball and stay in line with it. From the shooter's view, the gaps beside the keeper shrink.",followUp:{question:"Can I step out too far?",answer:"Yes, then a clever shooter can chip over you. Good keepers judge just how far to come."}},
  {"id": "keeper-warmup", "question": "How do keepers warm up before a game?", "answer": "Lots of catches, some low saves and a few kicks, so their hands and legs know what is coming.", "followUp": {"question": "Why so many catches?", "answer": "Each clean catch builds trust in your hands before the real shots start, like checking your line before casting."}},
  {"id": "come-for-cross", "question": "How should a keeper come for a cross?", "answer": "Call \"keeper\" early, jump off one leg and catch at the highest point you can.", "followUp": {"question": "What if I cannot reach it?", "answer": "Stay on your line and set your feet. Coming halfway leaves the goal open."}},
  {id:"wet-gloves",question:"Do keeper gloves work in the rain?",answer:"Many keepers splash a little water on their gloves to help them grip. Muddy fingers are another story.",followUp:{question:"Do you dry your fishing hands too?",answer:"I keep a towel handy so I do not drop my rod. Grip matters on the pier and in goal."}},
  {"id": "keeper-scores", "question": "Can a goalkeeper ever score?", "answer": "Yes. A huge kick that bounces over the other keeper counts, and some keepers go up for late corners.", "followUp": {"question": "What about throwing it in?", "answer": "A goal straight from a keeper's throw does not count. The other team gets a goal kick."}},
  {id:"bait-patience",question:"Why do you change your bait sometimes?",answer:"If the fish are not biting, I try something different. Keepers adjust too when a striker keeps scoring.",followUp:{question:"How does a keeper adjust?",answer:"They might stand a little differently or watch the striker's hips more closely. Small changes can make big saves."}},
  {id:"keeper-distribution",question:"After a save, should I kick it far?",answer:"Not always. A quick throw to a free defender can start an attack while the other team is still out of shape."},
  {id:"line-knots",question:"How do you tie a strong knot?",answer:"Loop, twist, pull slowly and wet the line first so it does not burn. A rushed knot slips, like a rushed dive.",followUp:{question:"What is a rushed dive?",answer:"Diving before the ball is struck, so the shooter just picks the other side. Wait a heartbeat longer."}}
 ],
 challenges:[
  {id:"c-punch",prompt:"A high cross comes into a crowded box and players are jumping all around you. What is the safe keeper choice?",options:["Let it bounce and see","Punch it high and wide away","Run out of the penalty area"],correct:1,right:"Yes. When catching is risky in a crowd, a strong punch high and wide clears the danger.",wrong:"Letting it bounce in a crowd is dangerous, and running away leaves the goal open. Punch it high and wide."},
  {id:"c-angle",prompt:"A striker is running at you from the side. Where should you stand?",options:["Right on the goal line, in the middle","Tucked behind the net","A step out, in line with the ball"],correct:2,right:"Yes. Stepping out in line with the ball shrinks the shooter's view of the goal.",wrong:"Staying stuck on the line leaves big gaps. A step out in line with the ball makes the goal look smaller."},
  {id:"c-area-hands",prompt:"The ball bounces just outside your penalty area. Can you catch it?",options:["No, use feet or head out there","Yes, keepers can catch anywhere","Only if it is raining"],correct:0,right:"Right. A keeper can only handle inside their own penalty area. Outside it, play like an outfielder.",wrong:"Keepers may only use hands inside their own penalty area. Outside it, kick or head the ball."},
  {id:"c-quick-throw",prompt:"You catch a cross and see a free defender nearby. What is a smart choice?",options:["Hold it until everyone is marked","Throw it quickly to the free defender","Boot it straight into the stands"],correct:1,right:"Yes! A quick throw to a free teammate starts an attack before the other team is organised.",wrong:"Waiting lets the other team get organised. A quick throw to the free defender can start an attack."}
 ],
 openers:[
  "Quiet please, the float is wobbling. Oh, just a wave. Now, what can an old keeper tell you?",
  "Hello again from the end of the jetty! The fish are shy today, so I have plenty of time to talk.",
  "My hands still go into keeper shape when I catch a falling hat. Old habits! What is your question?",
  "The tide is turning, and so is my luck, I hope. Pull up a bollard and ask away."
 ],
 returning:[
  "Back at the spiral? You asked me \"{topic}\" last time. I have kept another tip in my tackle box.",
  "I have been mulling over \"{topic}\" while waiting for bites. Ask me a new one?",
  "Ah, my keeper student! Last time it was \"{topic}\". Let us cast a fresh question."
 ]
},
"pier-ollie":{
 topics:[
  {id:"ball-size",question:"Which ball size should I juggle with?",answer:"Many kids your age use a size 4, which is a bit smaller and lighter than the full-size 5. A ball that fits you makes touches easier to learn.",followUp:{question:"Is a tiny skills ball harder?",answer:"Much harder, because there is less ball to hit. Try one once your normal keep-ups feel steady, as a fun extra challenge."}},
  {id:"keepup-sets",question:"What if I keep dropping it after two touches?",answer:"Practise in little sets: try for three, rest, then try again. Lots of short goes beat one long grumpy one.",followUp:{question:"When do I aim for more touches?",answer:"When you hit your target three times in a row, add one more touch. Small steps add up fast."}},
  {id:"weak-foot-ups",question:"Should I do keep-ups with my other foot?",answer:"Yes, even just a few. Your weaker foot gets braver every time it touches the ball.",followUp:{question:"How many should I try?",answer:"Start with one touch and a catch, then two. Beating your own score is what counts."}},
  {id:"head-ups",question:"Can I do keep-ups with my head?",answer:"You can use a soft, light ball and gentle little nods with your forehead. Keep it easy and stop if anything hurts."},
  {id:"bounce-touch",question:"Can I let it bounce between touches?",answer:"Yes, that is a great way to start. Touch, bounce, touch gives you extra time to get your feet ready.",followUp:{question:"When do I stop the bounces?",answer:"Once you can do ten touch-and-bounces in a row, try two touches without a bounce in between."}},
  {id:"counting-out",question:"Why do you count out loud?",answer:"It keeps my rhythm steady, like a song. When I stop counting, I usually stop juggling too.",followUp:{question:"What is your record?",answer:"Thirty-one, on a calm day with no seagulls watching. They put me off."}},
  {id:"ollie-touch",question:"What makes a soft first touch?",answer:"Relax the part of your body meeting the ball and pull it back slightly as it hits. It is like catching an egg."},
  {id:"juggling-circle",question:"Can friends do keep-ups together?",answer:"Yes! Stand in a circle and pass it with one or two touches each. Shout the next name so they are ready.",followUp:{question:"What is the best part?",answer:"Everyone counts together, so a record belongs to the whole group."}}
 ],
 challenges:[
  {id:"c-cushion",prompt:"A hard pass is zooming at you. How do you control it?",options:["Stiffen your foot and hit it back","Jump out of the way","Relax and give with the touch"],correct:2,right:"Yes! Relaxing and giving with the ball cushions it so it stays close.",wrong:"A stiff foot makes it bounce away. Relax and give a little as it arrives, like catching an egg."},
  {id:"c-ball-fit",prompt:"A nine-year-old is learning keep-ups with a heavy full-size ball. What could make it easier?",options:["A size 4 ball that fits them better","A ball with so little air it is nearly flat","A floaty beach ball"],correct:0,right:"Right. A size 4 is lighter and fits younger players, so touches are easier to control.",wrong:"A nearly flat ball or a floaty beach ball behaves strangely. A size 4 fits younger players and helps them learn."},
  {id:"c-wind-pass",prompt:"You are playing into a strong wind. Which pass is usually safer?",options:["A big high ball","A low pass along the ground","A pass straight up in the air"],correct:1,right:"Right. Low passes stay steady in the wind while high balls get blown around.",wrong:"The wind pushes high balls around. A low pass along the ground is steadier."},
  {id:"c-name-call",prompt:"Your friend circle is passing keep-ups. How do you warn the next player?",options:["Say nothing and surprise them","Point at the sky","Call their name before you pass"],correct:2,right:"Yes. Calling a name gets them ready, just like communication on the pitch.",wrong:"Surprises lead to drops. Calling the name first helps your teammate get ready."}
 ],
 openers:[
  "Seventeen, eighteen... hi! You made me drop it, but that is okay. Want a keep-ups challenge?",
  "The wind is blowing the other way today, so I moved to the sheltered side. Ask me something!",
  "I just did three thigh touches in a row. My best ever! What would you like to know?",
  "A seagull tried to join my keep-ups. It was not very good. Got a question for me?"
 ],
 returning:[
  "You again! You asked about \"{topic}\" before. I have been practising, so here is something new.",
  "Hey! Last time it was \"{topic}\". My record went up since then, want to hear another tip?",
  "I remember \"{topic}\". Ready for a fresh keep-ups question?"
 ]
},
"summit-ranger":{
 topics:[
  {id:"trail-markers",question:"What are the painted marks on the rocks?",answer:"Trail markers! They show which way to go, so nobody gets lost in the fog.",followUp:{question:"Is there anything like that in football?",answer:"Coaches use simple cue words, like check your shoulder. They point you the right way when it gets busy."}},
  {id:"stay-path",question:"Why should I stay on the path?",answer:"Stepping off squashes plants and wears the hillside away. Paths keep nature and people both happy.",followUp:{question:"Do pitches have paths too?",answer:"Kind of: the lines! Players stay within them, and when the ball crosses the outside line, play stops."}},
  {id:"leave-as-found",question:"Why do you close every gate on the trail?",answer:"Gates keep animals where they should be. Leave everything as you found it, so the next walker finds it the same.",followUp:{question:"Is there a football version of that?",answer:"Putting cones, bibs and balls away after training! When everyone helps, the job takes two minutes."}},
  {id:"first-aid",question:"What is in your ranger backpack?",answer:"Plasters, a whistle, a map, water and a snack. Being prepared turns a problem into a small hiccup.",followUp:{question:"Why a whistle?",answer:"Three short blasts means help needed. It carries further than shouting."}},
  {id:"weather-check",question:"Do you check the weather every day?",answer:"Every single morning. Mountains change fast, and clouds can roll in before lunch."},
  {id:"wildlife-quiet",question:"What animals live on Summit Isle?",answer:"Birds, insects and lots of little creatures in the grass. Quiet hikers see the most.",followUp:{question:"How can I spot more?",answer:"Walk slowly, listen and look under leaves without touching. Patience pays off."}},
  {id:"ranger-sign",question:"Who writes the signs on the trail?",answer:"I do, in big clear letters. A sign that nobody can read is as useful as a whisper on the pitch."},
  {id:"sunset-rule",question:"Can I hike in the dark?",answer:"Better not. Plan to be back before sunset, or bring a torch and a grown-up who knows the way.",followUp:{question:"What if I lose track of time?",answer:"Turn around halfway through your time. The way back always feels longer."}}
 ],
 challenges:[
  {id:"c-cover",prompt:"Your teammate goes to tackle. What should a nearby defender do?",options:["Stand behind them at an angle to cover","Also run at the same player","Walk away to rest"],correct:0,right:"Yes. Covering behind at an angle means if the tackle fails, you are there, like a hiking buddy.",wrong:"Two players rushing in leaves space behind. Cover at an angle, so you are ready if the tackle fails."},
  {id:"c-goal-kick-short",prompt:"At your goal kick, can a defender receive the ball while still inside your own penalty area?",options:["No, it must leave the area first","Yes, once it is kicked and clearly moves","Only if the keeper says please"],correct:1,right:"Correct. Under today's laws a goal kick is in play once kicked and clearly moving, so a short pass inside the area is fine.",wrong:"That was the old rule. Now a goal kick is in play once kicked and clearly moving, even inside the penalty area."},
  {id:"c-warmup",prompt:"Before training, what helps protect your body?",options:["Sprint flat out straight away","Skip the warm-up to save time","Warm up with easy jogging and movements"],correct:2,right:"Right. A gentle warm-up gets muscles ready, like checking the trail before a hike.",wrong:"Cold muscles are easier to strain. Warm up gently first with jogging and easy moves."},
  {id:"c-shape",prompt:"Your team keeps leaving big gaps. What helps fix it?",options:["Everyone chase the ball","Keep your position and stay connected","Stand in one corner"],correct:1,right:"Yes. Staying in shape and close to teammates closes gaps, like staying on the path keeps hikers safe.",wrong:"Chasing or bunching leaves gaps. Keep your position and stay connected to teammates."}
 ],
 openers:[
  "Morning, trail friend! I just repainted a marker so nobody wanders off. What can a ranger tell you?",
  "Mind the puddle by the first switchback. Now, got a question about the mountain or football?",
  "I spotted three new birds this morning. Ask me something while I write them down.",
  "My boots have walked this trail more times than a referee walks the halfway line. What is up?"
 ],
 returning:[
  "Welcome back to the trailhead! You asked me \"{topic}\" last time. The mountain has new stories today.",
  "Last hike it was \"{topic}\". Ready to explore a different question?",
  "I noted \"{topic}\" in my ranger log. Let us add a fresh entry."
 ]
},
"summit-esperanza":{
 topics:[
  {id:"zigzag-paths",question:"Why does the path zigzag?",answer:"Going straight up would be far too steep. Zigzags spread the climb out so every step is gentler.",followUp:{question:"Is a zigzag useful in football?",answer:"Passing side to side moves the other team around until a gap opens. Then you go forward."}},
  {id:"quinoa",question:"What did you eat growing up in the mountains?",answer:"Lots of quinoa, potatoes and corn. Some families in the Andes grow dozens of kinds of potato.",followUp:{question:"Is quinoa good for football?",answer:"It gives energy and some protein. Ask a grown-up to cook some with vegetables."}},
  {id:"strong-sun",question:"Is the sun stronger on mountains?",answer:"Yes, high up the air is thinner and you can burn faster. Hats and sunscreen are mountain friends.",followUp:{question:"Even when it feels cold?",answer:"Even then. Cold air can fool you, but the sun still shines strong."}},
  {id:"hiking-poles",question:"What are those sticks for?",answer:"Hiking poles help balance and take some work off my knees going downhill. Four legs are steadier than two."},
  {id:"panpipes",question:"Is there music at football back home?",answer:"Often! Drums, trumpets and sometimes panpipes in the stands. Every crowd has its own sound.",followUp:{question:"What are panpipes?",answer:"Tubes of different lengths tied together. You blow across the top, and each tube makes a different note."}},
  {id:"cold-nights",question:"Do mountains get cold at night?",answer:"Very cold, even after a sunny day. I always pack a warm layer, just in case."},
  {id:"keep-ball-tired",question:"What should a team do when everyone is tired?",answer:"Keep the ball with calm passes. When you have the ball, the other team does the running.",followUp:{question:"Is that boring to watch?",answer:"Not if you watch carefully. Patient passing is like a puzzle being solved."}},
  {id:"view-top",question:"What can you see from the top?",answer:"The whole island! The pitches look like little green stamps from up there."}
 ],
 challenges:[
  {id:"c-switch-play",prompt:"The other team has crowded one side of the pitch. What is a smart move?",options:["Switch the ball to the open side","Keep dribbling into the crowd","Kick it out on purpose"],correct:0,right:"Yes. Switching play, like a zigzag path, moves them around until gaps open.",wrong:"Dribbling into a crowd is hard. Switch the ball to the other side where there is space."},
  {id:"c-tired-keep",prompt:"Your team is very tired near the end. Which helps most?",options:["Long hopeful kicks every time","Calm passes to keep the ball","Everyone sprinting to press"],correct:1,right:"Right. Keeping the ball with calm passes lets your team rest while the other team chases.",wrong:"Hopeful kicks and frantic pressing tire you more. Calm passes let the ball do the work."},
  {id:"c-conditions",prompt:"You play on a new, very different pitch. What should your team do?",options:["Complain the whole match","Ignore it and play the same","Adapt your plan to the conditions"],correct:2,right:"Exactly. Good teams adapt to the pitch, the weather and the ground they play on.",wrong:"Complaining does not help, and ignoring conditions can cost you. Adapt your plan to the ground."},
  {id:"c-pace-match",prompt:"A long, hot match is starting. How should you use your energy?",options:["Pace yourself and pick your sprints","Sprint every second","Walk the whole match"],correct:0,right:"Yes. Pacing yourself, like a steady mountain hike, keeps energy for the important moments.",wrong:"Sprinting nonstop or walking the whole time both go wrong. Pace yourself and sprint when it matters."}
 ],
 openers:[
  "Hola! These switchbacks feel like home, though the air is much richer here. What shall we talk about?",
  "I just watched a hawk circle the summit. It moved like a sweeper reading the play. Ask me anything!",
  "My poles and I are taking a little break. Sit down and tell me what you are curious about.",
  "Every hill reminds me of the football we played on sloping fields back home. Want a story?"
 ],
 returning:[
  "Hola again! You asked \"{topic}\" before. Let us zigzag to something new.",
  "I have been thinking about \"{topic}\" on the climb. Ready for another question?",
  "Last time it was \"{topic}\". Shall we climb a little higher today?"
 ]
},
"summit-kusi":{
 topics:[
  {id:"equator",question:"Is your home city near the equator?",answer:"Very close! The equator line runs just north of the city. You can stand with one foot in each half of the world.",followUp:{question:"Is it hot there all year?",answer:"Not really, because it is high up. Days are mild and nights can be chilly."}},
  {id:"volcano-view",question:"Can you see volcanoes from home?",answer:"On clear days, yes. Big snowy peaks peek over the city like giant fans in the top row."},
  {id:"home-advantage",question:"Why do teams play better at home?",answer:"They know the pitch, sleep in their own beds and hear their own fans. Small comforts add up.",followUp:{question:"Can away teams still win?",answer:"Of course. Teams that stay calm and stick to their plan win away all the time."}},
  {id:"street-games",question:"Did you play street football growing up?",answer:"Every day after school, with two jumpers as goals. The steep streets made every game an uphill battle, literally.",followUp:{question:"How did you decide who won?",answer:"First to five, then everyone went home for dinner. We argued about the goals for ages."}},
  {id:"wind-crowd",question:"What other challenges can a stadium have?",answer:"Swirling wind, bumpy grass, deafening noise or a tiny pitch. Every ground tests you a bit differently.",followUp:{question:"How do I prepare for noise?",answer:"Agree simple hand signals with teammates, so you can talk even when nobody can hear."}},
  {id:"fan-songs",question:"Do fans at home sing a lot?",answer:"Constantly! Some songs last the whole match. My grandma knows every word, even the made-up ones."},
  {id:"derby",question:"What is a derby match?",answer:"A game between two teams from the same city or area. Neighbours support different sides, so everyone at school talks about it all week.",followUp:{question:"Can rival fans still be friends?",answer:"Of course. The best derbies end with handshakes and a promise of a rematch."}},
  {id:"teen-training",question:"How do you train when you visit here?",answer:"I climb to the 5s pitch, then do passing drills with whoever is around. Hills are my warm-up."}
 ],
 challenges:[
  {id:"c-hand-signal",prompt:"The crowd is so loud your teammate cannot hear you. What helps?",options:["Shout even louder forever","Use agreed hand signals","Stop trying to talk"],correct:1,right:"Yes. Hand signals let teammates communicate even when voices are drowned out.",wrong:"Shouting louder will not work in deafening noise. Use hand signals your team agreed before."},
  {id:"c-narrow-pitch",prompt:"You are playing on a narrow pitch. What is likely?",options:["There will be loads of space everywhere","Wingers will have extra room","It will feel crowded, so quick passes help"],correct:2,right:"Right. A narrow pitch squeezes everyone together, so quick, short passes help a lot.",wrong:"Narrow pitches have less width, not more space. Expect it to feel crowded and pass quickly."},
  {id:"c-away-calm",prompt:"You are the away team and the home crowd is loud. What is the best attitude?",options:["Stay calm and stick to your plan","Get angry at the crowd","Give up before kick-off"],correct:0,right:"Exactly. Staying calm and sticking to the plan is how away teams win.",wrong:"Anger or giving up just helps the home team. Stay calm and follow your plan."},
  {id:"c-bumpy",prompt:"The grass is bumpy and the ball bounces strangely. What helps?",options:["Try lots of fancy flicks","Watch the ball all the way and keep touches simple","Close your eyes when it bounces"],correct:1,right:"Yes. On a bumpy pitch, watch the ball closely and keep touches simple.",wrong:"Fancy flicks go wrong on bumps. Watch the ball carefully and keep your touches simple."}
 ],
 openers:[
  "Hey! I just raced the clouds up the hill and the clouds won. Want to talk football?",
  "Up here the views remind me of home, with snowy peaks far away. What do you want to ask?",
  "My legs are burning, but in a good way. Grab a rock and chat with me.",
  "I have been teaching some hikers a fan song from home. Want to hear about it, or ask something else?"
 ],
 returning:[
  "Hey again! You asked \"{topic}\" last time. I have another story from home for you.",
  "Back up the hill? Last time it was \"{topic}\". Let us try a new one.",
  "I remember \"{topic}\". Ask me something fresh while I catch my breath."
 ]
},
"summit-wren":{
 topics:[
  {id:"race-myself",question:"Who do you race on the hill?",answer:"Myself! I time every climb and try to beat my last one by a second.",followUp:{question:"What if you are slower?",answer:"Then I was probably tired, or it was windy. Tomorrow is another race."}},
  {id:"shoelaces",question:"Why do you double-knot your laces?",answer:"Because they kept coming undone halfway up! Now they stay tight all the way.",followUp:{question:"Does that matter in football?",answer:"Loose laces can make boots slip and trip you. Tie them properly before you play."}},
  {id:"high-knees",question:"What are high knees?",answer:"Running on the spot and lifting your knees up to your waist. It warms up your legs and looks very silly.",followUp:{question:"Do footballers do them?",answer:"Lots of teams do them in warm-ups. Silly is fine if it works!"}},
  {id:"switchback-count",question:"How many switchbacks are there?",answer:"I counted eleven once and twelve another time. I think one of them is sneaky.",followUp:{question:"Will you count again?",answer:"Next time I will drop a pebble at each turn. Mystery solved!"}},
  {id:"skip-steps",question:"Is skipping good exercise?",answer:"Yes, skipping makes your feet quick and bouncy. Try it with a rope or just across the grass.",followUp:{question:"How does that help football?",answer:"Quick feet help you change direction fast and react to a bouncing ball."}},
  {id:"wren-jog-sprint",question:"When should I sprint in a game?",answer:"When there is something to win: a loose ball, space behind the defence, or getting back to help."},
  {id:"hill-snack",question:"What snack do you take up the hill?",answer:"Apple slices and a few crackers. Tiny snack, big smile at the top."},
  {id:"tired-legs",question:"What do you do when your legs feel tired?",answer:"I slow down, breathe and keep walking. Stopping completely makes it harder to start again.",followUp:{question:"Is it okay to have a rest day?",answer:"Totally. Rest days help your legs get stronger. My coach makes me take them."}}
 ],
 challenges:[
  {id:"c-loose-ball",prompt:"A loose ball is between you and an opponent. Should you sprint?",options:["Yes, this is worth a sprint","No, walk slowly","Wait for them to take it"],correct:0,right:"Yes! Winning a loose ball is a perfect moment to sprint.",wrong:"This is exactly when to sprint. Loose balls go to whoever gets there first."},
  {id:"c-quick-feet",prompt:"Which practice helps you change direction quickly?",options:["Sitting very still","Quick-feet drills like skipping","Only long slow jogs"],correct:1,right:"Right. Quick-feet drills make you light and quick to change direction.",wrong:"Long jogs build stamina, but quick-feet drills like skipping help you change direction fast."},
  {id:"c-ball-close",prompt:"You are running fast with defenders close by. How should you keep the ball?",options:["Kick it far ahead","Leave it behind","Keep it close with small touches"],correct:2,right:"Yes. With defenders close, small touches keep the ball near you.",wrong:"Kicking it far lets defenders steal it. Keep it close with small touches when they are near."},
  {id:"c-rest-day",prompt:"You have trained hard every day this week. What helps your body most?",options:["Train twice as hard tomorrow","A rest day to recover","Skip sleep to train more"],correct:1,right:"Correct. Rest days let your body recover and get stronger.",wrong:"More training without rest can make you tired or sore. A rest day helps you recover."}
 ],
 openers:[
  "I beat my best time by two whole seconds! Okay, maybe one. Want to chat?",
  "Phew! Give me a second to breathe. Then ask me anything about running or football.",
  "I just saw a lizard do a better sprint than me. What is your question?",
  "Hi! I am doing high knees to stay warm. Talk to me while I bounce."
 ],
 returning:[
  "You came back! You asked me \"{topic}\" before. I have run lots more since then.",
  "Hi again! Last time it was \"{topic}\". Race you to a new question?",
  "I thought about \"{topic}\" on my last climb. Ask me another!"
 ]
},
"summit-kaia":{
 topics:[
  {id:"map-reading",question:"How do you read a map?",answer:"Turn it so it matches the land around you, then find landmarks on both. A map works best when you look up from it.",followUp:{question:"Is that like scanning in football?",answer:"Yes! Looking up and around shows you where teammates and space are, like matching your map."}},
  {id:"group-pace",question:"Who walks at the front of the group?",answer:"Usually the slowest walker, so nobody gets left behind. The group moves together.",followUp:{question:"Is that fair to fast walkers?",answer:"Fast walkers help by carrying a bit more or cheering. A team is only as strong as how it moves together."}},
  {id:"headcount",question:"Why do you count everyone so often?",answer:"To make sure nobody wandered off. I count at the start, at every stop and at the end."},
  {id:"layers",question:"Why do hikers wear lots of thin layers?",answer:"You can take one off when warm and put it back on when cold. Layers are smarter than one big coat."},
  {id:"hand-signals",question:"Do guides use hand signals?",answer:"Yes, like a raised hand for stop and a wave for come on. Signals work even when the wind is loud.",followUp:{question:"Can footballers use signals?",answer:"They do, pointing to where they want the pass or signalling for the ball to their feet."}},
  {id:"turn-back",question:"Do you ever turn back before the top?",answer:"If the weather turns or someone feels unwell, yes. The summit will still be there tomorrow.",followUp:{question:"Is that like giving up?",answer:"No, it is being wise. Good decisions are not always the exciting ones."}},
  {id:"kaia-rest-stops",question:"Where do you stop for rests?",answer:"At flat, shady spots with a view. A rest with a view feels twice as good."},
  {id:"guide-stories",question:"What is the funniest thing on a hike?",answer:"A hiker once argued with a goat about who should go first on the path. The goat won.",followUp:{question:"Do goats like football?",answer:"Only for eating the grass on the pitch. They are great groundskeepers, terrible players."}}
 ],
 challenges:[
  {id:"c-scan-map",prompt:"Before receiving a pass, what should you do?",options:["Stare only at the ball","Look around to see space and players","Shut your eyes and hope"],correct:1,right:"Yes. Scanning before the ball arrives helps you choose what to do next.",wrong:"Staring only at the ball means you miss what is around you. Look around first."},
  {id:"c-move-together",prompt:"Your team attacks but the defenders stay far back. What problem appears?",options:["A big gap between attack and defence","The team gets faster","Nothing changes"],correct:0,right:"Right. When a team stretches apart, gaps open in the middle, so move up together.",wrong:"A stretched team leaves a gap in the middle. The team should move together like a hiking group."},
  {id:"c-point-feet",prompt:"You want the pass to your feet, not into space. How can you show it?",options:["Wave both arms wildly","Turn your back and walk away","Point down to your feet"],correct:2,right:"Yes. Pointing to your feet tells the passer exactly where you want it.",wrong:"Wild waves or walking away confuse your teammate. Point to your feet to ask for it there."},
  {id:"c-wise-choice",prompt:"Your teammate is limping after a knock. What should happen?",options:["Keep playing so the team stays full","Tell the coach or referee","Pretend you did not see the limp"],correct:1,right:"Correct. Telling a grown-up keeps your teammate safe, like turning back on a hike.",wrong:"Ignoring an injury can make it worse. Tell the coach or referee so they can help."}
 ],
 openers:[
  "Hello, hiker! Before we chat: water bottle full? Good. What would you like to know?",
  "I am folding my map back into its tricky shape. Ask me anything while I wrestle it.",
  "Group of six went up, group of six came down. A perfect day! What is your question?",
  "A goat blocked the path again this morning. While I wait for it, tell me what is on your mind."
 ],
 returning:[
  "Welcome back, trail buddy! You asked \"{topic}\" last time. I have a new route of answers.",
  "Last trip you asked \"{topic}\". Ready for another question on the trail?",
  "I added \"{topic}\" to my guide notebook. Let us find a fresh page."
 ]
},
"summit-desta":{
 topics:[
  {id:"thirteen-months",question:"Is it true your calendar has 13 months?",answer:"Yes! The Ethiopian calendar has twelve months of thirty days, plus a short thirteenth month. It is lovely sunshine time.",followUp:{question:"Does that make birthdays confusing?",answer:"A little, when you travel. I just celebrate twice, which is very tiring."}},
  {id:"injera",question:"What is your favourite food from home?",answer:"Injera, a soft spongy flatbread. You tear it and use it to scoop up stews with your fingers.",followUp:{question:"Do you eat it before games?",answer:"Families often share it together, and sharing food is like sharing the ball: everyone gets some."}},
  {"id": "little-often", "question": "What has years of training taught you?", "answer": "A little effort every day beats one huge effort once. Small steps climb any mountain.", "followUp": {"question": "What if I miss a day?", "answer": "Then tomorrow is a fresh start. Mountains are patient."}},
  {id:"steady-pace",question:"How do you keep going up long hills?",answer:"Pick a pace where you can still talk. If you cannot speak, slow down a little.",followUp:{question:"Does that work in a match?",answer:"Between sprints, yes. Jogging at a talking pace helps you recover for the next burst."}},
  {id:"grandkids",question:"Do your grandchildren play football?",answer:"All four! They play at the park, and I am the official water carrier and cheerer."},
  {id:"desta-patience",question:"How did you get so patient?",answer:"Hills taught me. You cannot rush a mountain, you just keep stepping."},
  {id:"evening-walk",question:"When is the best time for a walk?",answer:"Early evening, when the air cools and the light turns golden. Everything looks friendlier.",followUp:{question:"Is that a good time to practise football?",answer:"Lovely for practice too, as long as you head home before dark."}},
  {id:"old-boots",question:"Did you play football when you were young?",answer:"With a ball made of rolled-up cloth tied with string! We played until it fell apart."}
 ],
 challenges:[
  {id:"c-talk-pace",prompt:"Between sprints in a match, what pace helps you recover?",options:["Standing completely still","Another full sprint","An easy jog or walk"],correct:2,right:"Yes. An easy jog lets your body recover while staying ready for the next burst.",wrong:"Sprinting nonstop wears you out, and freezing leaves you behind. An easy jog helps you recover."},
  {id:"c-move-warmup",prompt:"Which warm-up is best before playing?",options:["Moving warm-ups like skips and leg swings","Sitting and reading","Running hard immediately"],correct:0,right:"Correct. Moving warm-ups wake up your muscles and joints.",wrong:"Sitting does not warm you up, and hard running right away can strain cold muscles. Try skips and leg swings."},
  {id:"c-keep-going",prompt:"Your team is losing at half-time. What is a good attitude?",options:["Give up and stop trying","Keep working step by step","Blame each other"],correct:1,right:"Yes. Like climbing a hill, keep working step by step. Matches can change quickly.",wrong:"Giving up or blaming does not help. Keep working together, step by step."},
  {id:"c-share-ball",prompt:"One player keeps the ball every time. What could the team do better?",options:["Share passes so everyone joins in","Let that player do it all","Ban passing for the day"],correct:0,right:"Exactly. Sharing passes involves everyone and makes the team harder to defend.",wrong:"One player doing everything is easy to defend. Sharing passes brings everyone in."}
 ],
 openers:[
  "Ah, a young walker! Sit, rest your legs. What wisdom can this old hill climber share?",
  "The evening light is golden today. A perfect time for a gentle question.",
  "My knees say hello, slowly. My mouth says hello, quickly. What would you like to ask?",
  "I just showed some hikers my steady-step trick. Would you like to learn something too?"
 ],
 returning:[
  "Welcome back, little climber. You asked \"{topic}\" before. Shall we take another step?",
  "I remember \"{topic}\". Let us walk to a new question together.",
  "Last time it was \"{topic}\". The hill has more lessons for you today."
 ]
},
"summit-hamish":{
 topics:[
  {id:"midges",question:"What is the worst thing about hillwalking?",answer:"Tiny biting midges in summer! They come in clouds. I hum a tune and walk faster.",followUp:{question:"Do they bother footballers?",answer:"At summer evening training, they can. Players keep moving, which is good advice anyway."}},
  {id:"four-seasons",question:"Does the weather change fast in hills?",answer:"Back home you can get sun, rain, wind and hail before lunch. Four seasons in one day.",followUp:{question:"How do you plan for that?",answer:"A waterproof jacket always lives in my bag. Hope for sun, pack for rain."}},
  {id:"second-half",question:"Why do players get tired in the second half?",answer:"Their energy stores run lower as the match goes on. Good food, water and pacing help them last.",followUp:{question:"What can coaches do?",answer:"They can bring on fresh substitutes and change the plan to protect tired legs."}},
  {id:"downhill-care",question:"Is going down harder than going up?",answer:"For your knees, often yes! Take small steps and go slowly, even when gravity says hurry."},
  {id:"compass",question:"How does a compass work?",answer:"A little magnetic needle points north. Once you know north, you can find any direction.",followUp:{question:"Can I learn to use one?",answer:"Ask a grown-up to try with you in a park first. It is like learning a new skill, step by step."}},
  {id:"halftime-plan",question:"What should a team talk about at half-time?",answer:"One or two simple things: what is working and what to change. Too many ideas get muddled.",followUp:{question:"Who does the talking?",answer:"Mostly the coach, but good captains share what they see too."}},
  {id:"flask-drink",question:"What is in your flask?",answer:"Warm cocoa today. A cold drink at the top tastes like a trophy, but cocoa at the bottom is the real prize."},
  {id:"windy-match",question:"How do you play in strong wind?",answer:"With the wind behind you, shots and long kicks travel further. Into the wind, keep it low and pass short."}
 ],
 challenges:[
  {id:"c-wind-behind",prompt:"The wind is blowing hard toward the other goal. What can help your team?",options:["Never shoot from distance","Kick every ball straight up","Longer passes and shots travel further"],correct:2,right:"Yes. With the wind behind you, longer passes and shots get extra help.",wrong:"Kicking it up is wasteful. With the wind behind, longer passes and shots travel further."},
  {id:"c-halftime-ideas",prompt:"At half-time, how many changes should the coach ask for?",options:["Twenty new ideas","One or two clear changes","None, ever"],correct:1,right:"Right. One or two clear points are easy to remember in the second half.",wrong:"Too many ideas get muddled, and none means no improvement. Choose one or two clear changes."},
  {id:"c-fresh-legs",prompt:"Late in the match, your team looks very tired. What can a coach do?",options:["Bring on fresh substitutes","Tell everyone to sprint more","Stop the match"],correct:0,right:"Yes. Fresh substitutes add energy when legs are tired.",wrong:"Sprinting more tires them further, and coaches cannot just stop a match. Bring on fresh players."},
  {id:"c-weather-kit",prompt:"It is cold and rainy before your match. What should you wear while waiting?",options:["Nothing extra, just shorts","A heavy coat during the match","A warm layer until you start"],correct:2,right:"Correct. Stay warm until kick-off, then take the layer off to play.",wrong:"Getting cold before play is not good, and coats are not for playing. Wear a warm layer until you start."}
 ],
 openers:[
  "Ah, hello there! Just resting my legs before the sandbar crossing. Fancy a blether, as we say back home?",
  "The cocoa in my flask is still warm. Perfect for a chat. What is your question?",
  "I have walked many hills, but this sandbar seat is my favourite summit today. Ask away!",
  "No midges here, thank goodness. Sit down and tell me what is on your mind."
 ],
 returning:[
  "Back again! You asked me \"{topic}\" last time. I have a new hill story for you.",
  "I remember \"{topic}\" from our last chat. Ready for another one?",
  "Last time it was \"{topic}\". Shall we have a fresh blether?"
 ]
},
"boat-captain-marina":{
 topics:[
  {id:"port-starboard",question:"Why do sailors say port and starboard?",answer:"Port is the left side when you face the front of the boat, and starboard is the right. Fixed names stop confusion when people face different ways.",followUp:{question:"Do football teams use fixed side names?",answer:"Yes, a left back stays on the left as the team attacks, whichever way anyone is facing. Shared names help everyone talk clearly."}},
  {id:"life-jacket",question:"Why must I wear a life jacket?",answer:"It keeps you floating if you fall in. On my boat it is the first rule, like shin pads on a pitch.",followUp:{question:"Even if I can swim?",answer:"Even then. The sea can be cold and tiring, so the life jacket does the hard work."}},
  {id:"captain-job",question:"Is a team captain like a boat captain?",answer:"In some ways. Both keep everyone calm, set an example and talk to the referee or harbour master.",followUp:{question:"What does a team captain do at the start?",answer:"They usually do the coin toss with the referee and shake hands with the other captain."}},
  {id:"knots",question:"Which knot do sailors learn first?",answer:"Many start with the figure-eight. It stops a rope sliding through a hole. Simple and strong, like a short pass."},
  {id:"tide-times",question:"Why does the sea go up and down?",answer:"The pull of the Moon causes tides. Sailors check tide times before leaving harbour.",followUp:{question:"Do tides happen at the same time every day?",answer:"No, they shift a little later each day. That is why I check my tide table every morning."}},
  {id:"set-piece-crew",question:"How do you organise a busy deck?",answer:"Everyone has a job and a spot. Set pieces work the same: each player knows where to stand.",followUp:{question:"What is a set piece?",answer:"A restart like a corner or a free kick, where teams can practise planned moves."}},
  {id:"keeper-voice",question:"Was being a keeper loud work?",answer:"Very! A keeper sees the whole pitch, so they shout instructions to defenders. My crew says I am still loud."},
  {id:"compass-rose",question:"What is that star painted on the deck?",answer:"A compass rose, showing north, south, east and west. It helps new crew learn directions.",followUp:{question:"Do footballers use directions?",answer:"Sort of. Coaches talk about left, right, wide and central so everyone knows where to go."}}
 ],
 challenges:[
  {id:"c-captain-calm",prompt:"A teammate is getting upset with the referee. What should the team captain do?",options:["Join in and argue louder","Calm them down and step in politely","Storm off toward the harbour"],correct:1,right:"Yes. A good captain, like a good skipper, keeps the crew calm and talks to the referee respectfully.",wrong:"Arguing louder or walking off makes things worse. A captain calms teammates and speaks to the referee politely."},
  {id:"c-coin-toss",prompt:"Before kick-off, who usually joins the referee for the coin toss?",options:["The ship's parrot","Every player","The captains"],correct:2,right:"Correct. Both captains join the referee to toss the coin.",wrong:"Not quite. The two captains join the referee, and one calls heads or tails."},
  {id:"c-set-piece",prompt:"Your team has a corner. What makes it more likely to work?",options:["Everyone knows their spot and job","Everyone runs to the same place","Nobody moves at all"],correct:0,right:"Yes. Like a busy deck, a set piece works when each player knows their spot and job.",wrong:"Crowding one spot or standing still is easy to defend. Each player needs their own spot and job."},
  {id:"c-keeper-talk",prompt:"Why are goalkeepers often the loudest talkers on a team?",options:["They are bored","They can see the whole pitch in front of them","The rules require shouting"],correct:1,right:"Right. Keepers see the whole pitch, so they help defenders with instructions.",wrong:"It is about the view. Keepers can see the whole pitch, so their voices guide the defence."}
 ],
 openers:[
  "Ahoy! Life jacket snug? Good. The deep blue is calm today, so ask your captain anything.",
  "I just checked the tide table and the weather. All clear for football talk! What is on your mind?",
  "My crew calls me Captain, my old team called me Keeper. You can call me anything you like. Question?",
  "The gulls are circling, so the fish are near. While we wait, what would you like to know?"
 ],
 returning:[
  "Welcome aboard again! You asked \"{topic}\" last trip. I have a new tale ready.",
  "Ahoy, returning sailor! Last time it was \"{topic}\". Let us sail to a fresh question.",
  "I logged \"{topic}\" in the ship's book. Ready for the next chapter?"
 ]
},
"boat-skipper-kofi":{
 topics:[
  {id:"crew-roles",question:"Does every crew member have a different job?",answer:"Yes: one steers, one watches the lines, one checks the engine. A football team splits jobs the same way.",followUp:{question:"Which job is the hardest?",answer:"The one you have not practised yet. My kids' team swaps positions in training so they understand each other."}},
  {id:"radio-calls",question:"How do boats talk to each other?",answer:"By radio, using short, clear words. Nobody has time for long speeches at sea.",followUp:{question:"Is football talk short too?",answer:"The best is. Words like time, turn or man on say a lot quickly."}},
  {id:"fog-slow",question:"What do you do in fog?",answer:"Slow down, sound the horn and listen carefully. When you cannot see, patience keeps you safe."},
  {id:"buoys",question:"What are the floating balls in the water?",answer:"Buoys! They mark safe channels and hidden rocks. They are like the lines on a pitch for boats.",followUp:{question:"Do they ever move?",answer:"They are anchored to the seabed, so they bob around but stay in their area."}},
  {id:"kids-team",question:"What do you teach your kids' team first?",answer:"To have fun and look after the ball. A team that enjoys the ball wants to keep it.",followUp:{question:"Do they win a lot?",answer:"Sometimes! But they smile every week, and that is my favourite score."}},
  {id:"zone-net",question:"Can a team defend like a fishing net?",answer:"Sort of! In zonal defending each player guards a patch of space, and together the patches cover the dangerous areas.",followUp:{question:"What if one player leaves their patch?",answer:"A hole opens in the net. Teammates have to shift across quickly or tell the player to get back."}},
  {id:"steering",question:"Is steering a boat hard?",answer:"It is slow to turn, so you start early. Planning your turn is like planning your next pass."},
  {id:"rotation",question:"What is rotation in football?",answer:"Players swapping positions as they move, so defenders do not know who to follow. Futsal teams do it a lot.",followUp:{question:"Does everyone need to swap?",answer:"Not always. The key is that the spaces stay filled, even when the players change."}}
 ],
 challenges:[
  {id:"c-zone-hole",prompt:"Your team defends in zones and one player rushes out of their patch. What should nearby teammates do?",options:["Leave the gap and hope","Rush out with them too","Shift across to cover the gap"],correct:2,right:"Right. Like mending a net, nearby players shift across so no hole is left open.",wrong:"Leaving a hole or rushing out with them opens the net further. Teammates shift across to cover the gap."},
  {id:"c-radio-words",prompt:"Your teammate has the ball, plenty of space and nobody near. Which call helps them most?",options:["A calm shout of time","A long story about the weather","No call at all"],correct:0,right:"Yes. A short call like time tells them they can take a touch, just like quick radio words at sea.",wrong:"Long speeches or silence do not help. A short call like time tells them they are free."},
  {id:"c-rotate",prompt:"Your team rotates positions in an attack. What matters most?",options:["All five chase the ball together","The spaces stay filled","The whole crew freezes in place"],correct:1,right:"Right. Rotation works when the important spaces stay filled.",wrong:"Running to the ball leaves gaps, and stopping kills the idea. Keep the spaces filled while you swap."},
  {id:"c-patient",prompt:"The other team defends very tightly. What helps your team?",options:["Rush every pass forward","Shoot from anywhere instantly","Be patient and move the ball until a gap opens"],correct:2,right:"Yes. Patient passing moves defenders until a gap appears.",wrong:"Rushing into a tight defence usually loses the ball. Be patient and move it until a gap opens."}
 ],
 openers:[
  "Welcome aboard the Summit Deep! I have a football story for every fish we see. What do you want to know?",
  "The radio is quiet and the sea is calm. Perfect for coaching chat! Ask me anything.",
  "My kids' team scored five goals yesterday. I am still smiling. What is your question?",
  "Watch the buoy bob up and down, like a striker waiting for a cross. Got something to ask?"
 ],
 returning:[
  "Hello again, crewmate! You asked \"{topic}\" last trip. My coaching notebook has more for you.",
  "Last time it was \"{topic}\". Shall we steer toward a new question?",
  "I told my kids' team about \"{topic}\". They had a new question, maybe you do too?"
 ]
},
"folk-margit":{
 topics:[
  {id:"leather-ball",question:"What were footballs like when you played?",answer:"Heavier, especially when wet. Heading a soggy ball was like heading a pudding.",followUp:{question:"Are balls better now?",answer:"Much lighter and they keep their shape. Kids today can learn to curve them much more easily."}},
  {id:"left-back",question:"What does a left back do?",answer:"Defend the left side, stop wingers crossing, and sometimes run forward to help attack.",followUp:{question:"Is it a fun position?",answer:"The best! You defend, you attack, and you take loads of throw-ins."}},
  {id:"clear-wide",question:"Where should a defender clear the ball?",answer:"High and wide toward the touchline, away from the middle. A clearance straight down the middle can land at an attacker's feet.",followUp:{question:"Is clearing better than passing?",answer:"Only when you are under real pressure near your goal. If you have time, a calm pass keeps the ball for your team."}},
  {id:"jockeying",question:"How do I defend without diving in?",answer:"Stay on your feet, sideways on, and back off slowly. Wait for a heavy touch before you tackle.",followUp:{question:"What does sideways on mean?",answer:"Standing a little turned, so you can move backwards quickly. Square feet are easy to dribble past."}},
  {id:"clean-tackle",question:"How do I tackle safely?",answer:"Go for the ball, not the player, and keep your studs low. A clean tackle wins the ball and keeps everyone safe."},
  {id:"muddy-pitches",question:"Were pitches muddy in your day?",answer:"Like chocolate pudding in winter! My mum made me wash my kit in the garden first."},
  {id:"first-boots",question:"What were your first football boots like?",answer:"Hand-me-downs from my brother, two sizes too big. I stuffed newspaper in the toes!",followUp:{question:"Did that work?",answer:"Sort of, until it rained. Then I had soggy newspaper feet."}},
  {id:"margit-advice",question:"What is your best advice for young players?",answer:"Enjoy every game, listen to your coach and always shake hands. The memories last longer than the scores."}
 ],
 challenges:[
  {id:"c-jockey",prompt:"A winger is dribbling at you fast. What should you do first?",options:["Dive in straight away","Turn and run off","Stay on your feet and back off slowly"],correct:2,right:"Right. Jockeying keeps you between them and goal until a chance to tackle comes.",wrong:"Diving in is easy to dodge. Stay on your feet, back off and wait for the right moment."},
  {id:"c-clear-wide",prompt:"You are under pressure right in front of your own goal and must clear it. Where do you aim?",options:["High and wide toward the touchline","Straight down the middle","A soft pass across your own box"],correct:0,right:"Yes. High and wide gets the danger away from the middle of the pitch.",wrong:"Down the middle or across your own box can gift the ball to an attacker. Clear high and wide."},
  {id:"c-tackle-ball",prompt:"When you tackle, what should you aim for?",options:["The player's legs","The ball, with studs low","Anywhere you can reach"],correct:1,right:"Correct. Going for the ball with studs low is safe and fair.",wrong:"Tackling the player is a foul and dangerous. Go for the ball and keep studs low."},
  {id:"c-throwin-feet",prompt:"Taking a throw-in, where must your feet be?",options:["Off the ground, jumping","Well inside the pitch","On or behind the line"],correct:2,right:"Yes. Feet on or behind the touchline, and both hands on the ball.",wrong:"Jumping or stepping onto the pitch is a foul throw. Keep feet on or behind the line."}
 ],
 openers:[
  "Come sit, dear. My knees creak like an old goalpost, but my stories are still sharp. What shall we talk about?",
  "I was just remembering a muddy match from my youth. Want to hear a story, or ask me something?",
  "A left back never forgets how to defend. Ask me anything about the old days, or the new ones.",
  "Hello, sweetheart! I brought biscuits. Football talk goes better with biscuits."
 ],
 returning:[
  "There you are again, dear! You asked me \"{topic}\" last time. I have remembered another story.",
  "Ah, my favourite visitor. Last time it was \"{topic}\". Shall we try something new?",
  "I was telling the pigeons about \"{topic}\". Now I have a fresh tale for you."
 ]
},
"folk-kwame":{
 topics:[
  {id:"knockout",question:"What is a knockout round?",answer:"Win and you go through, lose and you go home. Every match feels like a final.",followUp:{question:"What if it is a draw?",answer:"Often there is extra time, and then penalties if it is still level."}},
  {id:"group-stage",question:"How does a group stage work?",answer:"Teams in a small group all play each other. Points decide who goes through to the knockouts.",followUp:{question:"How are points given?",answer:"Usually three for a win, one for a draw and none for a loss."}},
  {id:"drums",question:"Why do fans bring drums?",answer:"Drums keep the songs together and make the stadium feel alive. You feel the beat in your chest.",followUp:{question:"Can I bring a drum?",answer:"Ask the organisers first. A friendly beat is great, but some grounds have rules."}},
  {id:"daughter-arcade",question:"What game is your daughter playing?",answer:"Island Strikers! She says she is practising. I say she is beating me."},
  {id:"jollof-debate",question:"What is jollof rice?",answer:"A delicious tomato rice dish from West Africa. Neighbours argue about whose is best, just like football!",followUp:{question:"Who makes the best one?",answer:"My auntie, obviously. Please do not tell my neighbours I said that."}},
  {id:"street-watch",question:"Did you watch games with your neighbours?",answer:"Everyone gathered around one television. When we scored, the whole street jumped together."},
  {id:"kickabout-plan",question:"What are you planning for your kickabout?",answer:"Small teams, short games, everyone plays. And I will be in goal, because my legs are lazy today.",followUp:{question:"Can grown-ups and kids play together?",answer:"Yes, as long as grown-ups play gently and share the ball."}},
  {id:"anthems",question:"Why do players line up before big national games?",answer:"Each country's anthem is played while the players stand in a line. It is a proud moment that shows respect for both nations.",followUp:{question:"Do club fans have songs like that?",answer:"Many clubs have a club song that fans sing before kick-off. Learning it is part of joining the family."}},
 ],
 challenges:[
  {id:"c-knockout-draw",prompt:"A knockout match ends level after normal time. What often happens next?",options:["Both teams go through","Extra time, then penalties if needed","They replay it next year"],correct:1,right:"Right. Knockouts need a winner, so extra time and penalties decide it.",wrong:"In a knockout only one team goes through. Extra time and penalties decide it."},
  {id:"c-anthem-respect",prompt:"The other country's anthem is playing before kick-off. What should your team do?",options:["Chat and practise headers","Make noise to put them off","Stand quietly and listen"],correct:2,right:"Yes. Standing quietly for the other anthem shows respect, and respect is a big part of football culture.",wrong:"Chatting or making noise is disrespectful. Stand quietly and listen, just as you hope they will for yours."},
  {id:"c-gentle",prompt:"Grown-ups and kids play together. What keeps it fun and safe?",options:["Grown-ups play gently and share","Grown-ups shoot as hard as they can","Kids only stand in goal"],correct:0,right:"Yes. Gentle play and sharing keeps the game fun for everyone.",wrong:"Hard shots or leaving kids out spoils it. Gentle play and sharing makes it fun for all."},
  {id:"c-tournament-rest",prompt:"Your team has a short break between two tournament games. What helps most?",options:["A giant feast right before the next game","Rest, sip water and have a small snack","Run laps around the whole ground"],correct:1,right:"Yes. Rest, water and a small snack get you ready without a heavy tummy.",wrong:"A huge meal or extra laps leave you sluggish. Rest, sip water and have a small snack instead."},
 ],
 openers:[
  "Ah, hello! My daughter is still in the arcade, so I have time for football talk. What is on your mind?",
  "I can hear drums in my head already. Tournament season! Ask me anything.",
  "My legs are resting, but my mouth is ready for football stories. What would you like?",
  "I was just planning teams for our kickabout. Want to hear my plan, or ask me something?"
 ],
 returning:[
  "Hello again, friend! You asked me \"{topic}\" before. I have another story ready.",
  "Back already? Last time it was \"{topic}\". Shall we kick off a new one?",
  "I told my daughter about \"{topic}\". She said I should tell you something new."
 ]
}
};
