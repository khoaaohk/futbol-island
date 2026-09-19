import {VIDEO_NEIGHBORS} from './videoNeighbors';
import {npcEncounter} from './npcInterests';
import {NEWS_LEAGUES,type NewsLeague} from './newsLeagues';
/** Familiar island personalities, with short football conversations you can choose. */
export type NpcTopic={id:string;question:string;answer:string;followUp:{question:string;answer:string}};
export type NpcDefinition={pursuit?:string;videoTopic?:string;videoPrompt?:string;ranking?:boolean;newsLeague?:NewsLeague;newsSlot?:number;newsFocus?:string;matchStory?:boolean;travel?:'run'|'skateboard'|'scooter';body?:'balanced'|'strong'|'slim';activity?:'watering'|'sweeping'|'serving';workYaw?:number;news?:'scores'|'transfers';newsQuestion?:string;newsIntro?:string;id:string;name:string;role:string;greeting:string;x:number;z:number;character:'male'|'female';face:'warm'|'deep'|'light';clothing:'classic'|'coast'|'sunset';topics:NpcTopic[]};
const ISLAND_REGULARS:NpcDefinition[]=[
 {id:'rosa',name:'Coach Rosa',role:'Futsal coach',x:16,z:43,character:'female',face:'warm',clothing:'sunset',greeting:'Welcome to the rooftop! Futsal gives you lots of touches and very little time. What are you working on?',topics:[
  {id:'touch',question:'How do I improve my first touch?',answer:'Look around before the pass arrives. Cushion the ball into space where you can play your next pass. In futsal, your sole can help you stop and protect it.',followUp:{question:'What can I practise?',answer:'Pass against a wall, check over your shoulder, then receive to either side. Start slowly and keep the ball close enough for your next touch.'}},
  {id:'support',question:'Where should I go after a pass?',answer:'Find a new passing angle. Move away from a defender’s cover so your teammate can see you and the ball can reach you.',followUp:{question:'Should I always run forward?',answer:'No. A sideways or backward support option can help your teammate keep the ball. Look at the space and their pressure first.'}},
  {id:'start',question:'Where can I learn more?',answer:'Open Learn Futsal Plays here at Palm Coast Rooftop. Watch the movement, then try the quizzes to check what you noticed.',followUp:{question:'What should I watch?',answer:'Watch the players without the ball. Notice who creates an angle, who stretches the court, and who stays ready if possession changes.'}}
 ]},
 {id:'sam',name:'Sam',role:'Pickup regular',x:8,z:-48,character:'male',face:'light',clothing:'classic',greeting:'We always have room for one more at Old Town. Good teammates make the game more fun. Fancy a quick football chat?',topics:[
  {id:'pass',question:'Pass or dribble?',answer:'If a teammate has a clearer route forward, a pass can beat pressure quickly. If space opens in front of you, carry the ball and keep looking up.',followUp:{question:'What if a defender comes toward me?',answer:'Keep the ball within reach. Their movement might free a teammate, so look for that pass before you get trapped.'}},
  {id:'new',question:'How do I join a pickup game?',answer:'Say hello, ask who is next, and agree on the teams and simple rules. You do not have to be the best player to help a team.',followUp:{question:'How can I help straight away?',answer:'Offer a passing option, track back when your team loses the ball, and encourage someone after a mistake.'}}
 ]},
 {id:'maya',name:'Maya',role:'Club goalkeeper',x:155,z:-68,character:'female',face:'deep',clothing:'coast',greeting:'A keeper sees the whole picture from back here. I love helping our team stay connected. What would you like to know?',topics:[
  {id:'position',question:'Where should a goalkeeper stand?',answer:'Adjust with the ball. Stay between it and the goal, and choose a distance that lets you react to a shot or help behind your defenders.',followUp:{question:'Should I stay on the goal line?',answer:'Not all the time. Move with play, but check the ball carrier and space behind you. Being ready to move matters more than standing in one spot.'}},
  {id:'talk',question:'What should I shout to teammates?',answer:'Keep it short and useful: a name, “time,” “player behind,” or where a free teammate is. Share information they may not be able to see.',followUp:{question:'What after we concede?',answer:'Take a breath and help the team reset. Talk about the next action rather than blaming somebody for the last one.'}}
 ]},
 {id:'priya',name:'Priya',role:'Eleven Park midfielder',x:130,z:158,character:'female',face:'warm',clothing:'classic',greeting:'I am training for 11v11. There is more space out here, so looking around makes a big difference. Ask me something!',topics:[
  {id:'scan',question:'What does scanning mean?',answer:'Take quick looks away from the ball to find teammates, opponents, and open space. Do it while the ball travels so you can prepare before receiving.',followUp:{question:'What am I looking for?',answer:'Check whether someone is close behind you, where a safe pass is, and whether you can turn forward. Then look back to receive the ball.'}},
  {id:'shape',question:'Why do teams use formations?',answer:'A formation gives players starting positions and shared responsibilities. Players still move to support the ball and respond to the other team.',followUp:{question:'Do I stay in my spot?',answer:'Your position is a guide. Move to help, and notice who covers the space you leave. Talk with nearby teammates so the team stays connected.'}}
 ]},
 {id:'okafor',name:'Mr. Okafor',role:'Island mentor',x:94,z:-29,character:'male',face:'deep',clothing:'sunset',greeting:'Pull up for a moment. I have watched a lot of football, and there is always something new to learn. What is on your mind?',topics:[
  {id:'mistake',question:'What if I keep making mistakes?',answer:'Every player makes them. Notice one thing you can change, then give your attention to the next play. Learning takes plenty of tries.',followUp:{question:'How do I reset during a game?',answer:'Take a breath, look around, and choose one helpful action: get available, recover your position, or encourage a teammate.'}},
  {id:'defend',question:'What makes a good defender?',answer:'Read the ball and the attacker. Get into a position that slows their route to goal, and work with a teammate who can cover behind you.',followUp:{question:'Should I tackle immediately?',answer:'Not always. Staying balanced and delaying an attacker can give your team time to recover. Look for a loose touch before committing.'}},
  {id:'island',question:'Where should I explore next?',answer:'Try a different pitch: futsal on the rooftop, 7v7 in Old Town, 9v9 at Club Grounds, or 11v11 at Eleven Park. Each shows the game at a different scale.',followUp:{question:'Where can I get new rides?',answer:'Visit the Store to choose any ride or ball. Paths help you learn futbol; you do not need to complete them to use the gear. Find all 55 hidden balls to unlock the costumes.'}}
 ]},
 {id:'leo',name:'Leo',role:'Beach football regular',x:11,z:94,character:'male',face:'warm',clothing:'coast',greeting:'Nothing like a kickabout by the beach. I like trying little skills, then using them to help the team. What are you practising?',topics:[
  {id:'close',question:'How do I keep the ball close?',answer:'Use gentle touches that leave the ball within your next step. Lift your eyes between touches so you can spot space and people around you.',followUp:{question:'How do I practise changing direction?',answer:'Set two markers a few steps apart. Dribble toward one, slow down, turn away, and build up speed again. Try both feet.'}},
  {id:'skill',question:'When should I try a skill?',answer:'Try it when it helps you escape pressure or open a route to goal. A simple change of pace can work just as well as a fancy trick.',followUp:{question:'What if it does not work?',answer:'Recover and help your team. Later, practise the movement slowly, then try it again when you see the right space.'}}
 ]},
 {id:'amina',name:'Amina',role:'West Market team captain',x:-63,z:94,character:'female',face:'deep',clothing:'classic',greeting:'Our team meets here before heading to the pitch. Being captain is mostly about helping everyone feel part of the game. Want to chat?',topics:[
  {id:'captain',question:'What makes a good captain?',answer:'Listen, set an example, and help teammates stay connected. You can lead with a helpful action even when you are not wearing an armband.',followUp:{question:'How can I help a quiet teammate?',answer:'Use their name, offer them a passing option, and include them in the next game. Give them room to speak instead of speaking for them.'}},
  {id:'lose',question:'What do we do after losing the ball?',answer:'React together. The nearest player can slow the attack while teammates recover to protect the goal and cover passing options.',followUp:{question:'Should everyone chase the ball?',answer:'No. If everyone chases, other attackers become free. Look at who is already pressing and help cover the next danger.'}}
 ]},
 {id:'diego',name:'Diego',role:'Library Square tactics fan',x:81,z:-104,character:'male',face:'light',clothing:'sunset',greeting:'I come here to sketch football ideas after a game. The best tactics start with noticing what is happening around you. What interests you?',topics:[
  {id:'width',question:'Why do teams play wide?',answer:'Width can stretch defenders and create space for a pass or a teammate inside. Stay far enough apart that one opponent cannot easily cover both of you.',followUp:{question:'What if I never get the ball out wide?',answer:'Your position can still create space for someone else. Keep checking the ball and adjust your angle so you are ready if the pass comes.'}},
  {id:'switch',question:'When should we switch play?',answer:'When opponents crowd one side, look for a safe route to the space on the other. It might take a supporting pass before the switch is available.',followUp:{question:'Does it need to be a long pass?',answer:'No. Two or three shorter passes can move the ball across safely. The players receiving them should look ahead before the ball arrives.'}}
 ]},
 {id:'jules',name:'Jules',role:'South Pier winger',x:151,z:211,character:'female',face:'light',clothing:'coast',greeting:'I like watching the sunset after training. Today I was working on runs that help the passer. What would you like to work on?',topics:[
  {id:'run',question:'How do I time a forward run?',answer:'Watch the teammate with the ball. If they can look up and pass, move into a useful space where they can find you. Stay aware of defenders too.',followUp:{question:'What if the pass does not come?',answer:'Check back in or find a new angle. Keep helping the play instead of standing at the end of your first run.'}},
  {id:'finish',question:'How do I choose where to shoot?',answer:'Look at the goal, the keeper, and any defender blocking the way. Choose a clear target and a shot you can control.',followUp:{question:'Should I always shoot hard?',answer:'Power is only one option. Placement can be better when a corner is open. Sometimes a pass gives a teammate a clearer chance.'}}
 ]},
 {id:'nico',name:'Nico',role:'Market street defender',x:221,z:70,character:'male',face:'deep',clothing:'classic',greeting:'I help at the market, then meet my friends for football. I enjoy stopping attacks and starting our next one. Ask away!',topics:[
  {id:'cover',question:'What does covering a teammate mean?',answer:'Take a position behind and to the side of the teammate pressing the ball. You are ready to help if the attacker gets past them.',followUp:{question:'How close should I be?',answer:'Close enough to help, with enough space to react. Adjust to the speed of play and watch for another attacker you also need to protect against.'}},
  {id:'build',question:'What should I do after winning the ball?',answer:'Look up for a safe pass or space to carry into. Your team may need a moment to spread out, so keeping possession can be a good first action.',followUp:{question:'Is passing backward okay?',answer:'Yes. A safe pass back can help your team escape pressure and find a better route forward. Then move to support the next pass.'}}
 ]},
 {id:'imani',name:'Imani',role:'Island scores reporter',news:'scores',x:66,z:30,character:'female',face:'deep',clothing:'sunset',greeting:'The courtyard is my football desk. Want to check recent scores, or talk about what a scoreline tells us?',topics:[
  {id:'scoreline',question:'Does the score tell the whole story?',answer:'It tells you who scored, but not everything about the game. Watch how chances were created, how teams defended, and how the match changed.',followUp:{question:'What should I look for in highlights?',answer:'Look at the movement before the finish. Notice the pass that opens space and the teammate whose run takes a defender away.'}},
  {id:'live',question:'Why can a score change after a goal?',answer:'Officials may still be checking whether the goal should count. A live scoreboard can be updated after their decision.',followUp:{question:'How do I know the match is finished?',answer:'Look for the final or full-time status, not just the numbers. The source match page has more details and any later corrections.'}}
 ]},
 {id:'rafi',name:'Rafi',role:'Transfer news enthusiast',news:'transfers',x:109,z:198,character:'male',face:'warm',clothing:'sunset',greeting:'Coffee, football, and the transfer pages: a good afternoon at the pier. I keep reports separate from confirmed moves. What are you curious about?',topics:[
  {id:'rumour',question:'Is every transfer headline confirmed?',answer:'No. A report may describe interest, talks, or a rumour. Read the source and look for a club announcement before treating a move as confirmed.',followUp:{question:'What does “in talks” mean?',answer:'People may be discussing a possible deal. It does not mean the player has signed, and the move may never happen.'}},
  {id:'fit',question:'What makes a signing a good fit?',answer:'Think about the role the team needs, how the player likes to play, and the teammates around them. A famous name is only part of the story.',followUp:{question:'Why might a player go on loan?',answer:'A loan can give a player time with another club, sometimes to get more matches. The exact arrangement depends on the agreement.'}}
 ]},
 {id:'mei',name:'Mei',role:'Community football organiser',x:-62,z:60,character:'female',face:'light',clothing:'sunset',greeting:'I help organise games in the neighbourhood. Football is better when everyone gets a chance to join in. What would you like to know?',topics:[
  {id:'inclusive',question:'How do we make teams fair?',answer:'Mix experience across both sides and check how the game feels after a few minutes. You can change teams together if one side needs help.',followUp:{question:'What about someone playing for the first time?',answer:'Welcome them, explain the simple rules, and give them chances to receive the ball. Ask what would help them enjoy the game.'}},
  {id:'small',question:'Can we play with only a few people?',answer:'Yes. Small games give everyone more chances to touch the ball and make decisions. Agree on the space, goals, and any simple rules together.',followUp:{question:'What if we have an odd number?',answer:'One player can help whichever team has the ball, and you can rotate that role. Agree together so everyone knows how it works.'}}
 ]},
 {id:'luz',name:'Luz',role:'Community gardener',activity:'watering',workYaw:Math.PI,x:202,z:-24,character:'female',face:'warm',clothing:'coast',greeting:'Just giving these vegetables a drink before football. Gardens and teams both need a little care from everyone. Want to talk?',topics:[
  {id:'care',question:'How can I help our football space?',answer:'Put equipment away, collect litter safely with an adult, and leave room for other people to enjoy the space. Small shared jobs make it welcoming.',followUp:{question:'How do we share the jobs?',answer:'Agree on a few simple tasks and rotate them. Looking after the place should be a team effort, not one person’s job.'}},
  {id:'patience',question:'Why does learning a skill take time?',answer:'You are learning to notice, decide, and move together. Short, regular practice gives you more chances to understand what works.',followUp:{question:'How do I notice progress?',answer:'Pick one small thing to watch, like keeping your first touch nearby. Compare it with your own earlier attempts rather than someone else’s best moment.'}}
 ]},
 {id:'ben',name:'Ben',role:'Courtyard volunteer',activity:'sweeping',workYaw:0,x:64,z:24,character:'male',face:'light',clothing:'classic',greeting:'A quick sweep, then I am off to play. We all help keep the courtyard ready for the next group. What is on your mind?',topics:[
  {id:'respect',question:'How do I show respect during a game?',answer:'Listen to agreed rules, give others space to speak, and check on someone if they fall. Compete hard while still treating people kindly.',followUp:{question:'What if we disagree about a call?',answer:'Pause and use a simple rule you agreed beforehand, such as replaying the moment. Getting the game moving fairly matters more than winning an argument.'}},
  {id:'offball',question:'How can I help without the ball?',answer:'Move where your teammate can pass to you, make space for someone else, or cover a danger when your team attacks. There is always something to notice.',followUp:{question:'How do I know which job to do?',answer:'Look at the ball, nearby teammates, and opponents. Ask what the team needs in this moment, then adjust again as the play changes.'}}
 ]},
 {id:'ines',name:'Ines',role:'Pier café teammate',activity:'serving',workYaw:0,x:108,z:194,character:'female',face:'deep',clothing:'sunset',greeting:'I am taking these cups to the terrace. After my shift, our café team has a friendly game. Fancy a football chat while I pause?',topics:[
  {id:'teamwork',question:'What does good teamwork look like?',answer:'Give useful information, make yourself available, and help after a mistake. Teammates do not need to play alike to work well together.',followUp:{question:'What if we like different positions?',answer:'Talk about what everyone enjoys and what the team needs. Trying another role can help you understand how to support the person who usually plays there.'}},
  {id:'reset',question:'What should we talk about at half-time?',answer:'Choose one thing going well and one small change to try. Keep it clear so everyone knows how to help when the game restarts.',followUp:{question:'Can players suggest ideas too?',answer:'Yes. Share what you have noticed and listen to others. Someone in another position may see a part of the game you cannot.'}}
 ]}
];
export const npcById=(id:string)=>NPC_DIALOGUES.find(npc=>npc.id===id)??null;

// New neighbors share useful football subjects, with their own roles and local routines.
type ResidentSeed={id:string;name:string;role:string;x:number;z:number;mentor:string;greeting:string;activity?:'watering'|'sweeping'|'serving'};
const NEW_NEIGHBORS:ResidentSeed[]=[
 {id:'ada',name:'Ada',role:'Vegetable bed volunteer',x:192.354,z:-23.646,mentor:'luz',activity:'watering',greeting:'These greens need a little attention before our match. Looking after the garden is a team effort too. What are you learning?'},
 {id:'omar',name:'Omar',role:'Garden keeper',x:212.354,z:-23.646,mentor:'maya',activity:'watering',greeting:'I watch the seedlings here and the goal on match days. Both jobs need patience. Want to talk about goalkeeping?'},
 {id:'zoe',name:'Zoe',role:'Community growing club',x:222.354,z:-23.646,mentor:'amina',activity:'watering',greeting:'Our growing club has its own little football team. We share the watering and the passes. What makes a good team for you?'},
 {id:'hugo',name:'Hugo',role:'Garden morning crew',x:202,z:-2,mentor:'nico',activity:'watering',greeting:'I am finishing this row before meeting my friends. I usually play at the back and help us start again after winning the ball.'},
 {id:'alma',name:'Alma',role:'Pier bakery teammate',x:97,z:192,mentor:'ines',activity:'serving',greeting:'Fresh cups for the bakery terrace. Later, our friendly game brings everyone together. Fancy a quick football chat?'},
 {id:'tomas',name:'Tomas',role:'Coast café host',x:117,z:193,mentor:'okafor',activity:'serving',greeting:'People share their best football stories at these tables. My favourite ones are about learning from a tough game.'},
 {id:'rosa_pier',name:'Marisol',role:'Harbour lunch crew',x:178,z:192,mentor:'sam',activity:'serving',greeting:'Once lunch is finished, I like a simple pickup game. A ball and a few friendly people are plenty. What would you like to know?'},
 {id:'dev',name:'Dev',role:'Museum courtyard regular',x:204,z:192,mentor:'diego',activity:'serving',greeting:'I carry drinks here and sketch formations on my break. There is always a new way to look at the game.'},
 {id:'pablo',name:'Pablo',role:'Beach pickup organiser',x:0,z:94,mentor:'mei',greeting:'We are gathering a few people for beach football. I like making sure newcomers get a good welcome. Want to join our conversation?'},
 {id:'hana',name:'Hana',role:'Beach winger',x:24,z:96,mentor:'jules',greeting:'I have been practising my timing on forward runs. Sometimes waiting a moment creates a much better chance.'},
 {id:'eli',name:'Eli',role:'Shoreline skills club',x:35,z:112,mentor:'leo',greeting:'I try a few touches here, then look for a game to use them in. A trick is most useful when it helps a teammate too.'},
 {id:'sana',name:'Sana',role:'Beach care volunteer',x:-20,z:97,mentor:'ben',activity:'sweeping',greeting:'A quick tidy makes this corner nicer for everyone. After that, we can get back to football. What is on your mind?'},
 {id:'milo',name:'Milo',role:'Boardwalk midfielder',x:46,z:137,mentor:'priya',greeting:'On my walks I replay moments from our last game. Looking around before receiving is my challenge this week.'},
 {id:'noor',name:'Noor',role:'Library football club',x:75,z:-104,mentor:'diego',greeting:'Our library club talks about the patterns behind a game. I like noticing the little movements that make a big pass possible.'},
 {id:'arthur',name:'Arthur',role:'Square care crew',x:86,z:-110,mentor:'luz',activity:'sweeping',greeting:'I am looking after the square before our football group meets. Good habits add up, in the community and on the pitch.'},
 {id:'yara',name:'Yara',role:'Workshop youth captain',x:65,z:-108,mentor:'amina',greeting:'We meet by the workshop to plan our next friendly. Being captain means listening as much as talking.'},
 {id:'mateo',name:'Mateo',role:'West Market lunch crew',x:-60,z:57,mentor:'ines',activity:'serving',greeting:'There is plenty of football talk around the market tables. I enjoy hearing how different teammates see the same game.'},
 {id:'bea',name:'Bea',role:'Market care volunteer',x:-68.924,z:60.383,mentor:'ben',activity:'sweeping',greeting:'I help keep the market paths clear. Sharing a football space works the same way: everyone lends a hand.'},
 {id:'rui',name:'Rui',role:'Beach Kitchen defender',x:-63,z:100,mentor:'nico',greeting:'Our kitchen crew has a little football team. I enjoy helping our defenders cover each other rather than chasing alone.'},
 {id:'leila',name:'Leila',role:'West Coast futsal fan',x:-55,z:100,mentor:'rosa',greeting:'The rooftop is my favourite place to learn. Futsal makes you notice your next option quickly. What are you practising?'},
 {id:'enzo',name:'Enzo',role:'Old Town junior captain',x:-9,z:-51,mentor:'amina',greeting:'I am waiting for the rest of our Old Town team. We are learning how to react together when the ball changes sides.'},
 {id:'nina',name:'Nina',role:'Old Town passing partner',x:31,z:-50,mentor:'sam',greeting:'A good passing partner makes practice much more fun. I try to give the player on the ball an easy option.'},
 {id:'kai',name:'Kai',role:'Seven-a-side goalkeeper',x:-7,z:-105,mentor:'maya',greeting:'I play keeper here at Old Town. Talking clearly can help my defenders before a dangerous pass even happens.'},
 {id:'elena',name:'Elena',role:'Square match watcher',x:89,z:-39,mentor:'imani',greeting:'I like watching how a match changes, not only the score. What do you notice when you watch a game?'},
 {id:'javi',name:'Javi',role:'Eleven Park touchline crew',x:105,z:158,mentor:'ben',activity:'sweeping',greeting:'We are getting the touchline ready for the next game. Everyone should have a place to enjoy watching and playing.'},
 {id:'farah',name:'Farah',role:'Park midfield partner',x:148.704,z:157.457,mentor:'priya',greeting:'I am meeting my midfield partner after training. We keep reminding each other to scan before the pass arrives.'},
 {id:'owen',name:'Owen',role:'Park forward',x:175,z:158,mentor:'jules',greeting:'Today I am thinking about when to run and when to wait. The timing can matter more than running fast.'},
 {id:'talia',name:'Talia',role:'Park supporter',x:95.234,z:142.661,mentor:'okafor',greeting:'I love watching our local team learn together. A difficult moment can teach you something useful for the next play.'},
 {id:'ren',name:'Ren',role:'Pier evening regular',x:58,z:211,mentor:'leo',greeting:'The pier is a lovely place to cool down after a game. I have been trying to make my dribbling a little more controlled.'},
 {id:'aya',name:'Aya',role:'South Pier youth organiser',x:82,z:211,mentor:'mei',greeting:'I help friends find a game even when only a few of us are free. Small games can be the best ones.'},
 {id:'samir',name:'Samir',role:'Pier terrace teammate',x:184,z:211,mentor:'ines',activity:'serving',greeting:'I am helping with the terrace drinks before joining our friendly. There is room for every kind of teammate.'},
 {id:'vera',name:'Vera',role:'Square transfer fan',x:110,z:-24,mentor:'rafi',greeting:'I enjoy a football conversation here in the square. When transfer stories come up, I always ask where the report came from.'}
];
export const NPC_DIALOGUES:NpcDefinition[]=[...ISLAND_REGULARS,...NEW_NEIGHBORS.map((resident,index):NpcDefinition=>{
 const encounter=npcEncounter(resident.id);
 return {id:resident.id,name:resident.name,role:resident.role,x:resident.x,z:resident.z,activity:resident.activity,workYaw:resident.activity==='watering'?Math.PI:0,
 character:index%2?'male':'female',face:(['light','warm','deep'] as const)[index%3],clothing:(['coast','sunset','classic'] as const)[Math.floor(index/3)%3],body:(['slim','balanced','strong'] as const)[Math.floor(index/2)%3],...encounter};
})];

const MOBILE_NEIGHBORS=[
 {id:'runner-amara',name:'Amara',role:'Island runner',x:105,z:-25,travel:'run',character:'female',face:'deep',clothing:'coast'},
 {id:'runner-mateo',name:'Mateo',role:'Evening jogger',x:61,z:-28,travel:'run',character:'male',face:'warm',clothing:'sunset'},
 {id:'skater-dani',name:'Dani',role:'Square skateboarder',x:84,z:-24,travel:'skateboard',character:'female',face:'light',clothing:'sunset'},
 {id:'skater-theo',name:'Theo',role:'Boardwalk skater',x:100,z:-39,travel:'skateboard',character:'male',face:'deep',clothing:'classic'},
 {id:'scooter-zara',name:'Zara',role:'Scooter explorer',x:110,z:-29,travel:'scooter',character:'female',face:'warm',clothing:'coast'},
 {id:'scooter-eli',name:'Eli',role:'Neighborhood cruiser',x:88,z:-34,travel:'scooter',character:'male',face:'light',clothing:'sunset'}
] as const;
for(const resident of MOBILE_NEIGHBORS)NPC_DIALOGUES.push({...resident,...npcEncounter(resident.id)});
// Each islander has a readable purpose, even when sharing a movement rig.
for(const npc of NPC_DIALOGUES)npc.pursuit??=npc.role.toUpperCase();
NPC_DIALOGUES.find(n=>n.id==='scooter-eli')!.name='Ellis';
NPC_DIALOGUES.find(n=>n.id==='mateo')!.name='Matías';
const rankingHost=NPC_DIALOGUES.find(n=>n.id==='noor')!;
rankingHost.ranking=true;rankingHost.role='All-time ranking host';rankingHost.pursuit='BUILDING A TOP TEN';rankingHost.greeting='I am building a wall of personal top tens for our library futbol club. No official answer here—tell me which players and teams you value, and why.';rankingHost.topics=[{id:'ranking-criteria',question:'How should I compare different players?',answer:'Choose your criteria first: creativity, scoring, defending, leadership or influence. Different positions contribute in different ways, so a goals total cannot settle every comparison.',followUp:{question:'What about players from different eras?',answer:'Consider their opponents, roles and the conditions they played in. You can admire an older player without pretending every era was identical.'}}];

// More existing neighbors connect current reporting to their football interests.
// Headlines/results stay in the dated server feed, never hard-coded dialogue.
const NEWS_CHATS:Record<string,{kind:'scores'|'transfers';question:string;intro:string}>={
 sam:{kind:'scores',question:'What happened in the latest games?',intro:'Let’s check the latest results. When you watch the highlights, look for a teammate making space before the goal.'},
 maya:{kind:'scores',question:'Any recent matches to learn goalkeeping from?',intro:'Here are the latest matches to explore. In the highlights, watch where the keeper stands before each shot. The score alone cannot tell us how well they played.'},
 priya:{kind:'transfers',question:'Who is in the transfer news?',intro:'Let’s check the reports. Think about which role a new player might fill and who would support them. A rumour is not a confirmed signing.'},
 amina:{kind:'scores',question:'What is happening around the leagues?',intro:'Let’s look around the leagues, including women’s football. Pick a match and watch how teammates help each other recover after losing the ball.'},
 diego:{kind:'transfers',question:'Could a new signing change a team’s tactics?',intro:'These are recent transfer reports. A new player can give a team different options, but we need to see them play before judging the fit. Reports can include speculation.'},
 elena:{kind:'scores',question:'Can we check the recent scores?',intro:'Let’s open the latest match desk. Check whether each game is live, finished, or still to come. Then look beyond the score: how were the chances created?'},
 vera:{kind:'transfers',question:'Any recent transfer stories?',intro:'Here is the transfer notebook. Check the source and date, and look for a club announcement before treating a move as confirmed. A loan and a permanent transfer are different.'},
 'scooter-zara':{kind:'scores',question:'Any games happening around the world?',intro:'Let’s see the latest fixtures and results! Choose a team you do not know yet, then look for one passing movement you could try with your own teammates.'}
};
for(const npc of NPC_DIALOGUES){const chat=NEWS_CHATS[npc.id];if(!chat)continue;npc.news=chat.kind;npc.newsQuestion=chat.question;npc.newsIntro=chat.intro;npc.greeting+=chat.kind==='scores'?' We can also check the latest matches together.':' We can also talk about the latest transfer reports.';}

// Twenty residents share match stories while retaining their work, rides and topics.
const matchStoryOrder=['imani','sam','maya','amina','elena','scooter-zara','sana','mateo','runner-amara','skater-dani','javi','samir','arthur','kai','leila','talia'];
const matchStoryResidents=[...matchStoryOrder.map(id=>NPC_DIALOGUES.find(n=>n.id===id)).filter((n):n is NpcDefinition=>!!n),...NPC_DIALOGUES.filter(n=>!matchStoryOrder.includes(n.id)&&n.news!=='transfers')].slice(0,20);
const leagueIds=Object.keys(NEWS_LEAGUES) as NewsLeague[];
const newsAngles=['Watch the movement before a goal. Who creates space for the scorer?','Follow the defending team. Who delays the attack and who covers behind?'];
for(const [index,resident] of matchStoryResidents.entries()){
 const league=leagueIds[index%leagueIds.length],slot=Math.floor(index/leagueIds.length),label=NEWS_LEAGUES[league];
 resident.matchStory=true;resident.news='scores';resident.newsLeague=league;resident.newsSlot=slot;resident.newsFocus=newsAngles[slot%newsAngles.length];
 resident.newsQuestion=`What is happening in ${label}?`;resident.newsIntro=`This is my ${label} match desk. ${resident.newsFocus}`;
 resident.role+=` · ${label}`;resident.greeting+=` I also follow ${label}; ask me about the recent matches.`;
}


// Video desks do not automatically request scores or videos when approached.
NPC_DIALOGUES.push(...VIDEO_NEIGHBORS);
