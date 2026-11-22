import type {Faq} from '../safety';
/**
 * Three game-day and practice tools (Nov 22 2026): a match timer and scoreboard, a round-robin tournament schedule maker and a
 * beep test for kids. The logic is pure (lib/site/tools/{matchTimer,roundRobin,beepTest}.ts, tests/new-tools.cjs); the page
 * words live here, the Spanish words in lib/i18n/es/newTools.ts with the same shape (tests/new-tools.cjs checks they match).
 * Query targets: "soccer timer", "soccer scoreboard online", "youth soccer game clock"; "round robin schedule generator soccer",
 * "tournament schedule maker"; "beep test audio", "bleep test levels", "soccer fitness test for kids".
 * Facts and where they come from (every source is linked on its page):
 *  - Game lengths by age group: the age-group chart (lib/site/sizes.ts: U.S. Soccer small-sided standards to U12, US Youth Soccer
 *    Rule 303 from U13), read through gameLengths() in ./registry.ts. Never retyped here.
 *  - Halves, the half-time break and added time: IFAB Laws of the Game, Law 7 (fetched Nov 22 2026): two equal halves of 45
 *    minutes unless the referee and both teams agree otherwise under competition rules; a half-time break of no more than 15
 *    minutes; time lost is added in each half (substitutions, injuries, time wasting, celebrations and other stoppages).
 *  - Beep test: the 20 m table published by Top End Sports (levels, speeds and shuttles), its list of versions, and Léger's
 *    1988 paper (PubMed 3184250). The kids' levels are our own practice version and are labelled so.
 *  - Round robin: the circle method and n(n-1)/2 games are arithmetic; the points system (3 for a win, 1 for a draw) is the
 *    common league custom, and the page says your tournament's rules come first.
 */
export type ToolTable={label:string;head:string[];rows:string[][];note?:string};
export type ToolSection={id:string;title:string;paras?:string[];items?:string[];ordered?:boolean;table?:ToolTable;fold?:boolean};
export type Source={name:string;url:string;says:string};
export type NewToolSlug='soccer-match-timer'|'soccer-tournament-schedule-maker'|'soccer-beep-test';
export type NewToolWords={slug:NewToolSlug;crumb:string;title:string;h1:string;description:string;lead:string;blurb:string;features:string[];imageAlt:string;
 toolTitle:string;howTitle:string;how:string[];sections:ToolSection[];sourcesTitle:string;sourcesIntro:string;sources:Source[];faqTitle:string;faq:Faq[];relatedTitle:string;
 related:{path:string;name:string;line:string}[]};
export const NEW_TOOLS_UPDATED='2026-11-22';
export const TIMER_PATH='/tools/soccer-match-timer',SCHEDULE_PATH='/tools/soccer-tournament-schedule-maker',BEEP_PATH='/tools/soccer-beep-test';
export const newToolPath=(slug:NewToolSlug)=>`/tools/${slug}`;
export const newToolImage=(slug:NewToolSlug)=>`/tools/${slug}.png`;
const LAW7:Source={name:'IFAB Laws of the Game, Law 7: The Duration of the Match',url:'https://www.theifab.com/laws/latest/the-duration-of-the-match/',
 says:'A match is two equal halves of 45 minutes unless the referee and both teams agree otherwise under the competition’s rules. The half-time break is no more than 15 minutes, and the referee adds time in each half for time lost to substitutions, injuries, time wasting and other stoppages.'};
const USSF:Source={name:'U.S. Soccer small-sided standards (Player Development Initiatives, 2016, a state association’s copy)',url:'https://www.wiyouthsoccer.com/wp-content/uploads/sites/168/2023/06/pdi_final_september_2016.pdf',
 says:'4v4 for U6 to U8 in four quarters of 10 minutes, 7v7 for U9 and U10 in two halves of 25 minutes, 9v9 for U11 and U12 in two halves of 30 minutes.'};
const USYS:Source={name:'US Youth Soccer, Policy on Players and Playing Rules (December 5, 2025), Rule 303',url:'https://www.usyouthsoccer.org/wp-content/uploads/sites/160/2025/12/Policy-on-Players-and-Playing-Rules-_APP-12.05.2025.pdf',
 says:'Game lengths from 13U: two halves of 35 minutes at 13U and 14U, 40 minutes at 15U and 16U, 45 minutes from 17U.'};
const RULES={path:'/learn/soccer-rules',name:'Soccer rules for kids',line:'Every rule with a diagram'};
const LENGTH={path:'/learn/soccer-rules/substitutions-and-game-length',name:'Substitutions and game length by age',line:'How long games last and how changes work'};
const AGES={path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19 and which game each one plays'};
const CALC={path:'/tools/soccer-playing-time-calculator',name:'Equal playing time calculator for soccer',line:'A fair substitution plan with equal minutes for every player'};
const LINEUP={path:'/tools/soccer-lineup-builder',name:'Soccer lineup builder',line:'Names on a field diagram for 7v7, 9v9, 11v11 or futsal'};
const DRILLS={path:'/learn/soccer-drills',name:'Soccer drills for kids',line:'Drills with diagrams for every age'};
const PLANS={path:'/learn/soccer-practice-plans',name:'Soccer practice plans',line:'Whole practices, ready to run'};
const FIELDS={path:'/tools/soccer-field-diagrams',name:'Blank soccer field diagrams to print',line:'Free fields and cheat sheets to print'};
const FORMATS={path:'/learn/7v7-9v9-11v11',name:'7v7, 9v9 and 11v11 explained',line:'Why children play small-sided games'};

export const TIMER_EN:NewToolWords={slug:'soccer-match-timer',crumb:'Match timer',title:'Soccer Match Timer and Scoreboard: Free Youth Game Clock',h1:'Soccer match timer and scoreboard',
 description:'A free youth soccer game clock: halves or quarters set by age group, big digits, added time, a scoreboard and sub reminders. Works offline, no sign-up.',
 lead:'Pick the age group and the clock sets itself: four quarters of 10 minutes for 4v4, two halves of 25 minutes for 7v7, two of 30 for 9v9. Tap Start, tap a team’s score to add a goal, and let a short beep remind you when it is time to make your changes.',
 blurb:'A big game clock with halves or quarters by age, added time, a scoreboard and sub reminders',
 features:['Halves, thirds or quarters with lengths set by age group','Large digits readable at arm’s length','Pause, resume and added time','Scoreboard with goal times','Substitution reminders every few minutes','Optional end-of-period beep','Keeps the screen awake when the phone allows it','Works offline; nothing is sent anywhere'],
 imageAlt:'The soccer match timer on a phone: 18:42 left in the first half, Lions 2 Tigers 1',toolTitle:'The game clock',
 howTitle:'How to use the match timer',
 how:['Choose the game. The age-group presets fill in the number of periods and their length; change anything you like for a tournament or a friendly.','Type the two team names if you want them on the scoreboard. The example names are only there to show how it looks.',
  'Choose how often you want a substitution reminder, or none. A short double beep sounds and the screen flashes when one is due.','Tap Start at kick-off. Tap Pause when the referee stops the clock, and Start again to carry on. The clock counts down and keeps going into added time, shown with a plus sign.',
  'Tap a team’s score to add a goal; the goal minute is noted underneath. Tap the small minus if you tapped by mistake.','At the whistle tap End half (or End quarter). The break starts, and Start begins the next period at zero. After the last period the final score stays on screen.'],
 sections:[
  {id:'why',title:'Why a visible clock helps young players',paras:['Children under ten have very little sense of how long is left. “Two minutes to go” means nothing to an eight-year-old, but a big number they can see does. Showing the clock at the break teaches them to pace a half: when to press for a goal, and when to keep the ball and play it safe.',
   'For the coach, the clock is how fair minutes happen. If you change players every five minutes, a beep at five, ten and fifteen minutes takes the guessing out of it, so the quiet child on the bench gets their turn on time instead of when someone remembers. Pair it with the playing time calculator and every child plays the share you planned.',
   'Young players learn the rules of time by meeting them: halves of equal length, a short break, and time added when the game stopped for an injury. The scoreboard shows the goal minutes too, a small way to talk after the game about when the team played its best football.']},
  {id:'lengths',title:'Youth soccer game length by age group',table:{label:'Typical US youth game lengths by age group',head:['Age group','Game','Periods','Total'],rows:[]},
   paras:['These are the presets in the timer. Leagues and tournaments often play shorter games, so check your own rules and change the length if they differ.']},
  {id:'added',title:'Added time, breaks and stopping the clock',items:['In the Laws of the Game the referee adds time at the end of each half for time lost to substitutions, injuries, time wasting and other stoppages. In youth games the referee or the coaches decide; use + 1 min on the timer to match.',
   'The half-time break in the Laws is no more than 15 minutes; competition rules set the exact length. Youth games usually take 5 to 10 minutes. Set yours in the timer: the break counts up so you know how long it has been.',
   'Most youth games use a running clock that does not stop for throw-ins or goal kicks. If yours stops the clock, use Pause and Start.',
   'The clock keeps time from the moment you press Start, so it stays right if the screen locks or you switch apps. The display only redraws while the page is open in front of you.']},
  {id:'sound',title:'Sounds, screen and battery',items:['Sounds are off until you turn them on and tap Start, because phones only allow sound after a tap. The end-of-period sound is a loud three-tone beep; the substitution reminder is a short double beep.',
   'If your phone supports it, the timer asks the screen to stay awake while the clock runs. It lets go when you pause or leave the page.',
   'The timer works offline once the page has loaded. Your game is saved on this device, so reloading the page carries on from where it was.']}],
 sourcesTitle:'Sources',sourcesIntro:'The presets and the notes on added time come from these official documents. Your league’s rules come first.',sources:[LAW7,USSF,USYS],
 faqTitle:'Questions about the soccer match timer',
 faq:[{q:'How long is a youth soccer game?',a:'In the US standards it is four quarters of 10 minutes at U6 to U8 (4v4), two halves of 25 minutes at U9 and U10 (7v7), two halves of 30 minutes at U11 and U12 (9v9), and longer halves from U13. Leagues and tournaments can play shorter games.'},
  {q:'Does the timer keep running if my phone screen locks?',a:'Yes, the time stays right. The clock is worked out from when you pressed Start, so when you unlock the phone it shows the correct time. Sounds cannot play while the screen is locked, so keep the page open if you need the beeps.'},
  {q:'Can I use it as an online soccer scoreboard?',a:'Yes. Tap a team’s score to add a goal and the minute is noted. Turn the phone sideways for bigger digits, or open it on a tablet or a laptop facing the parents.'},
  {q:'Does it work for futsal or a tournament with short games?',a:'Yes. Choose Custom and set any number of periods from one to four and any length from 1 to 60 minutes. Futsal uses a stopped clock, so use Pause at every stoppage.'}],
 relatedTitle:'Rules, charts and more tools',related:[LENGTH,AGES,CALC,LINEUP,FORMATS,RULES,FIELDS]};

export const SCHEDULE_EN:NewToolWords={slug:'soccer-tournament-schedule-maker',crumb:'Tournament schedule maker',title:'Round Robin Soccer Tournament Schedule Maker: Free',h1:'Soccer tournament schedule maker',
 description:'Make a round robin soccer tournament schedule: enter teams, fields and game length, get every fixture with times and fields, then a standings table.',
 lead:'Type your teams, say how many fields you have, how long each game lasts and the break between games. The schedule maker plays every team against every other team once, puts each game on a field at a time, and keeps a standings table as you enter the scores.',
 blurb:'Round robin fixtures with fields and times, and a standings table that fills in as you enter scores',
 features:['Round robin fixtures: every team plays every other team','Single or double round robin (home and away)','Games spread over 1 to 8 fields with start times','No team plays twice at the same time; rests are spread out','Byes handled for an odd number of teams','Standings with wins, draws, losses, goal difference and points','Print the schedule or copy it as text','Works offline; nothing is sent anywhere'],
 imageAlt:'A round robin schedule for six teams on two fields with start times, and the standings table',toolTitle:'Your tournament',
 howTitle:'How to make a round robin schedule',
 how:['Type one team per line. The example teams are filled in to show how it works; replace them with yours. Up to 16 teams.','Choose the number of fields, the length of each game, the break between games and the time of the first kick-off.',
  'The schedule appears at once: each time slot, which game is on which field, and who rests. With an odd number of teams one team rests each round.','During the day, type each score. The standings table fills in by itself: 3 points for a win, 1 for a draw, then goal difference and goals scored.',
  'Print it for the clipboard and the notice board, or copy it as text for the team chats. The schedule and scores are saved on this device.'],
 sections:[
  {id:'method',title:'How the fixtures are made',items:['A round robin is a tournament in which every team plays every other team. With n teams that is n × (n − 1) ÷ 2 games: 6 games for 4 teams, 15 for 6, 28 for 8.',
   'The fixtures use the circle method. Team 1 stays in place and the others move round one place each round, so every pair meets exactly once and every team plays once a round.',
   'With an odd number of teams, an empty place joins the circle and the team drawn against it rests that round: everyone rests once.',
   'Games are then laid on the fields in round order. A team never plays two games at the same time, and when there is a choice, a team that just played gets the next slot off.']},
  {id:'sizes',title:'How long will the tournament take?',table:{label:'Round robin games and time slots by number of teams',head:['Teams','Games','Slots on 1 field','Slots on 2 fields','Slots on 3 fields'],rows:[]},
   paras:['A slot is one game length plus the break. With 12-minute games and 3-minute breaks, a slot is 15 minutes, so 8 slots take 2 hours. More fields only help while there are enough teams free to fill them: 4 teams can never use more than 2 fields at once.']},
  {id:'kids',title:'Running a tournament for young players',paras:['A festival of short games teaches more football than one long match. Every child plays several opponents, meets different problems (a fast forward, a team that presses, a tall goalkeeper) and gets a fresh start every twelve minutes. Keep the games short and the breaks real, with water and shade.',
   'For the youngest groups, many clubs do not keep a table at all, and that is a good choice: the table matters more to adults than to six-year-olds. Use the schedule and leave the scores blank. From about U10, a table adds a little purpose, and it is a good moment to teach goal difference and why a draw is worth a point.'],
   items:['Plan a game length the children can play at full effort: 8 to 12 minutes for U8 and younger, 12 to 20 for U9 to U12.','Give every team at least one break between games when you can; the schedule maker already tries to.','Agree the tie-break before the first game: goal difference, then goals scored, then the game between the two teams.']}],
 sourcesTitle:'Sources',sourcesIntro:'The schedule is arithmetic, so it needs no source. Game lengths and breaks come from the competition’s rules; these documents set the usual limits.',sources:[LAW7,USSF],
 faqTitle:'Questions about round robin schedules',
 faq:[{q:'How many games are in a round robin with 6 teams?',a:'Fifteen. Each of the 6 teams plays the other 5, and every game has two teams, so 6 × 5 ÷ 2 = 15. On one field with 15-minute slots that is 3 hours 45 minutes; on two fields it fits in about 2 hours.'},
  {q:'What happens with an odd number of teams?',a:'Each round one team has a bye and rests. With 5 teams there are 5 rounds of 2 games, and every team rests once. The schedule shows who rests in each slot.'},
  {q:'How are points and tie-breaks worked out?',a:'Three points for a win, one for a draw, none for a loss. Teams level on points are split by goal difference, then goals scored, then name. Your tournament may use different rules; agree them before kick-off.'},
  {q:'Can I make a double round robin?',a:'Yes. Choose Twice (home and away) and every pair meets twice, with the team listed first swapped the second time.'}],
 relatedTitle:'Rules, charts and more tools',related:[AGES,LENGTH,{path:TIMER_PATH,name:'Soccer match timer and scoreboard',line:'A game clock and scoreboard for each game'},CALC,LINEUP,FIELDS,PLANS]};

export const BEEP_EN:NewToolWords={slug:'soccer-beep-test',crumb:'Beep test',title:'Beep Test for Kids: Free Soccer Fitness Test with Audio',h1:'Soccer beep test for kids',
 description:'A free soccer beep test: 20 m shuttle run audio with the standard levels or a gentler kids’ version, a big level display and results kept on your device.',
 lead:'The beep test, also called the bleep test or 20 m shuttle run, is a running test in which players run between two lines 20 metres apart, reaching the far line before each beep. The beeps get faster every level. This page plays the beeps, shows the level and shuttle in big numbers, and keeps each player’s result on your device.',
 blurb:'20 m shuttle run beeps with standard or gentler kids’ levels, a big display and results by player',
 features:['Audio beeps for the 20 m multistage shuttle run','Standard levels (8.0 km/h, then 9.0 km/h, then +0.5 km/h a level)','A gentler kids’ practice version starting at 6.0 km/h','Big level and shuttle display with a progress bar','Results by player, saved on the device','Keeps the screen awake when the phone allows it','Works offline'],
 imageAlt:'The beep test on a phone: level 3, shuttle 5, with a progress bar and the results list',toolTitle:'The beep test',
 howTitle:'How to run the beep test',
 how:['Mark two lines 20 metres (about 22 yards) apart with cones, on grass or a flat floor. Measure it; a short lane makes every result look better than it is.','Warm up for 5 to 10 minutes: easy jogging, skipping and a few short runs.',
  'Choose Kids for players under 12 or anyone new to the test, or Standard for older players. Turn the volume up, or connect a speaker, and tap Start.','Players run to the far line and reach it by the beep, then turn and run back for the next one. A triple beep means a new level: the beeps come a little faster.',
  'A player who misses a line by the beep gets one more shuttle to catch up. Miss twice and they stop. Tap their name, or type it, and save the level and shuttle they reached.'],
 sections:[
  {id:'levels',title:'Beep test levels and speeds',table:{label:'Standard 20 m beep test levels',head:['Level','Speed','Shuttles','Seconds per shuttle','Total distance'],rows:[]},
   paras:['The standard table starts at 8.0 km/h, jumps to 9.0 km/h at level 2, then adds 0.5 km/h every level, each about one minute long. Léger’s original version started at 8.5 km/h, and some versions number the levels from zero, so only compare results from the same version.']},
  {id:'kids',title:'The kids’ version',paras:['Most children aged 7 to 11 stop the standard test within its first few levels, which makes it short and discouraging. The kids’ version starts at 6.0 km/h, a brisk jog, and adds 0.5 km/h a level, with each level about a minute long. Children run for longer, find their pace and see themselves go up the levels.',
   'It is a Futbol Island practice version, not a standard test. Its results cannot be compared with published norms or with the standard test; compare a child only with themselves, a few months apart.'],table:{label:'Kids’ beep test levels',head:['Level','Speed','Shuttles','Seconds per shuttle','Total distance'],rows:[]}},
  {id:'football',title:'What the beep test says about football',paras:['Football is not a steady run. Players jog, sprint, turn and stop, again and again, for the whole game, and the beep test trains exactly the part a young player feels first: turning at a line and going again. A player who can keep doing that stays in the game for longer, keeps pressing in the last minutes and still has a clear head for the pass.',
   'For players under 12, fitness comes best from playing: small-sided games, tag games and dribbling drills. Use the beep test now and then as a challenge the children enjoy, never to pick or drop players. Ask each child to beat their own last score, and praise the turn at the line and the effort, not the number.']},
  {id:'safety',title:'Safety first',items:['An adult supervises every run. Have water ready and run in the shade on hot days.','Warm up first and walk for a few minutes afterwards to cool down.','Anyone who feels unwell, dizzy, in pain or very out of breath stops at once. Never push a child to carry on.','Children with asthma, a heart condition or another health condition should check with a doctor first and keep any inhaler close.','Use a flat, non-slip surface with room to slow down past each line.']},
  {id:'audio',title:'Will the beeps stay in time on a phone?',paras:['Yes. The beeps are scheduled on the phone’s audio clock, which is far more exact than the screen, and the screen follows them. Keep the page open with the screen on: phones pause sound on a locked screen, so the test stops and asks you to restart if you leave it. For a big group, connect a speaker by cable or Bluetooth; Bluetooth adds a small, steady delay that is the same for every beep.']}],
 sourcesTitle:'Sources',sourcesIntro:'The standard levels and speeds come from these pages. The kids’ levels are our own and are not a published test.',
 sources:[{name:'Top End Sports, 20 m beep test table',url:'https://www.topendsports.com/testing/beep-table.htm',says:'Level 1 at 8.0 km/h with 7 shuttles, level 2 at 9.0 km/h with 8 shuttles, rising to level 21 at 18.5 km/h with 16 shuttles (4,940 m in all).'},
  {name:'Top End Sports, versions of the beep test',url:'https://www.topendsports.com/testing/beep-variations.htm',says:'The original Léger test starts at 8.5 km/h; the British, Australian and Eurofit versions start at 8.0 km/h and run the second stage at 9.0 km/h, then add 0.5 km/h a stage.'},
  {name:'Léger and others, “The multistage 20 metre shuttle run test for aerobic fitness” (Journal of Sports Sciences, 1988)',url:'https://pubmed.ncbi.nlm.nih.gov/3184250/',says:'The paper that describes the test: a 20 m shuttle run at a speed that rises every minute, used with children and adults.'}],
 faqTitle:'Questions about the beep test',
 faq:[{q:'What is a good beep test score for a kid?',a:'There is no single good score: it depends on age, growth and how often the child plays. On the standard test many children aged 10 to 12 reach level 3 to 6. Compare a child only with their own last result, on the same version of the test.'},
  {q:'What is the difference between the beep test, the bleep test and the PACER test?',a:'They are names for the same idea: a 20 metre shuttle run that gets faster with each level. The bleep test is the British name and PACER is the name used in many US schools. The levels differ slightly between versions.'},
  {q:'Do I need to download the beep test audio?',a:'No. The page makes the beeps itself, so there is no file to download and it works offline once loaded. Turn the volume up or connect a speaker for a big group.'},
  {q:'How often should young players do a fitness test?',a:'Two or three times a season is plenty. For children, a test is a fun challenge and a way to see progress, not a training plan. Their fitness grows best from playing games.'}],
 relatedTitle:'Drills, practice plans and more tools',related:[DRILLS,PLANS,{path:'/learn/soccer-drills/u10',name:'U10 soccer drills',line:'Drills for 9 and 10 year olds'},{path:TIMER_PATH,name:'Soccer match timer and scoreboard',line:'A game clock with halves by age group'},CALC,AGES,LINEUP]};

export const NEW_TOOLS_EN:readonly NewToolWords[]=[TIMER_EN,SCHEDULE_EN,BEEP_EN];
export const newToolEn=(slug:NewToolSlug)=>NEW_TOOLS_EN.find(t=>t.slug===slug)!;
