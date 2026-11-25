import type {NewToolWords,Source} from './newTools';
/**
 * Five more coach and family tools (Nov 22 2026, second batch): a team name generator, a practice plan generator built from the
 * site's own drills, a youth field size guide, a juggling challenge tracker and a stats tracker for parents. The logic is pure
 * (lib/site/tools/{teamNames,practicePlan,fieldSizes,juggling,statsTracker}.ts, tests/more-tools.cjs); the page words live
 * here with the same shape as ./newTools.ts, the Spanish in lib/i18n/es/moreTools.ts (the test checks they match).
 * Query targets: "soccer team name generator", "team names for kids soccer"; "soccer practice plan for 8 year olds", "soccer
 * practice plan generator"; "youth soccer field dimensions", "7v7 field size", "9v9 soccer field size"; "soccer juggling
 * challenge", "how to juggle a soccer ball kids"; "youth soccer stats tracker", "soccer stats app for parents".
 * Every fact has its source in the logic module's header and is linked on its page. No invented statistics.
 */
export const TEAM_NAMES_PATH='/tools/soccer-team-name-generator',PRACTICE_PLAN_PATH='/tools/soccer-practice-plan-generator',FIELD_GUIDE_PATH='/tools/youth-soccer-field-size-guide',
 JUGGLING_PATH='/tools/soccer-juggling-challenge',STATS_PATH='/tools/youth-soccer-stats-tracker';
const W=(name:string,url:string,says:string):Source=>({name,url,says});
const WIKI={
 wanderers:W('Wanderers F.C. (Wikipedia)','https://en.wikipedia.org/wiki/Wanderers_F.C.','Founded in 1859 as Forest Football Club and renamed in 1864; the name refers to the club never having a home ground. Winners of the first FA Cup in 1872.'),
 newcastle:W('Newcastle United F.C. (Wikipedia)','https://en.wikipedia.org/wiki/Newcastle_United_F.C.','The name Newcastle United was decided on 9 December 1892 to signify the unification of Newcastle East End and Newcastle West End.'),
 albion:W('West Bromwich Albion F.C. (Wikipedia)','https://en.wikipedia.org/wiki/West_Bromwich_Albion_F.C.','Founded in 1878 as West Bromwich Strollers; Albion was a district of West Bromwich where some of the players lived or worked.'),
 bilbao:W('Athletic Club (Wikipedia)','https://en.wikipedia.org/wiki/Athletic_Bilbao','The club gives 1898 as its foundation date and took the name Athletic Club in the English spelling; football reached Bilbao with British workers and students.'),
 real:W('Real Madrid CF (Wikipedia)','https://en.wikipedia.org/wiki/Real_Madrid_CF','In 1920 the club’s name was changed to Real Madrid after King Alfonso XIII granted it the title of Real (royal).'),
 inter:W('Inter Milan (Wikipedia)','https://en.wikipedia.org/wiki/Inter_Milan','The name Internazionale comes from its founders’ wish, in 1908, to accept foreign players as well as Italians.'),
 spurs:W('Tottenham Hotspur F.C. (Wikipedia)','https://en.wikipedia.org/wiki/Tottenham_Hotspur_F.C.','Founded in 1882 as Hotspur Football Club and named after Harry Hotspur, a member of the Northumberland family, whose land gave Northumberland Park its name.'),
 fire:W('Chicago Fire FC (Wikipedia)','https://en.wikipedia.org/wiki/Chicago_Fire_FC','Named after the Great Chicago Fire of 1871; the club was founded on 8 October 1997, the fire’s 126th anniversary.'),
 blackburn:W('Blackburn Rovers F.C. (Wikipedia)','https://en.wikipedia.org/wiki/Blackburn_Rovers_F.C.','Founded after a meeting at the Leger Hotel in Blackburn on 5 November 1875.'),
};
const PPP=W('U.S. Soccer, “Play-Practice-Play (PPP) Model: An Evidence-Based Approach” (a state association’s copy)','https://www.soccermaine.com/wp-content/uploads/sites/230/2023/11/play-practice-play_model.pdf',
 'Children have little desire to stand in lines, run laps or be lectured. A session starts with small games (2v2 to 4v4), moves to a practice phase of game-like activities with many repetitions, and ends with a game.');
const SESSION=W('US Youth Soccer Coaching Education, “How to Write a Training Session Plan” (a league’s copy)','https://www.louisvillesoccer.com/docs/How%20to%20Write%20a%20Training%20Session%20Plan.pdf',
 'Suggested session lengths by age: about 45 minutes at U6, 45 to 60 at U8, 60 to 75 at U10 and 75 at U12.');
const USSF=W('U.S. Soccer, Player Development Initiatives (2016): small-sided standards (a state association’s copy)','https://www.wiyouthsoccer.com/wp-content/uploads/sites/168/2023/06/pdi_final_september_2016.pdf',
 '4v4 at U6 to U8 on 25-35 x 15-25 yd with goals no larger than 4 x 6 ft; 7v7 at U9-U10 on 55-65 x 35-45 yd (goal 6.5 x 12 ft recommended); 9v9 at U11-U12 on 70-80 x 45-55 yd (goal 6.5 x 18.5 ft recommended). Build-out lines halfway between the penalty area and the halfway line.');
const LIJSL=W('Long Island Junior Soccer League, Player Development Initiatives (U.S. Soccer’s small-sided chart)','https://lijsoccer.com/wp-content/uploads/2020/09/U9-U10-Player-Development-Initiatives.pdf',
 'Field markings: 7v7 goal box 4 x 8 yd, penalty area 12 x 24 yd, penalty spot 10 yd, center circle 8 yd; 9v9 goal box 5 x 12 yd, penalty area 14 x 36 yd, penalty spot 10 yd, center circle 8 yd.');
const FA=W('England Football, Future Fit: pitch and goal sizes by age group','https://futurefit.englandfootball.com/futurefit/faqs/what-are-pitch-and-goal-sizes-for-the-different-age-groups/index.html',
 '5v5 at U8-U9 on 37 x 27 m (12 x 6 ft goals), 7v7 at U10-U11 on 55 x 37 m (12 x 6 ft), 9v9 at U12-U13 on 73 x 46 m (16 x 7 ft), with minimum sizes for each.');
const LAW1=W('IFAB Laws of the Game, Law 1: The Field of Play','https://www.theifab.com/laws/latest/the-field-of-play/',
 'Touchline 100-130 yd (90-120 m), goal line 50-100 yd (45-90 m); goal area 6 yd and penalty area 18 yd from each post; penalty mark 12 yd; centre circle 10 yd; goal 8 yd by 8 ft.');
const FUTSAL1=W('Futsal Laws of the Game, Law 1: The Pitch (The FA)','https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-1---the-pitch',
 'Touch line 25-42 m and goal line 16-25 m (international 38-42 m and 20-25 m); goals 3 m by 2 m; penalty area of 6 m quarter circles; penalty mark 6 m, second mark 10 m; centre circle 3 m.');
const FUTSAL2=W('Futsal Laws of the Game, Law 2: The Ball (The FA)','https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-2---the-ball',
 'A futsal ball is 62 to 64 cm round and weighs 400 to 440 g, and bounces 50 to 65 cm when dropped from 2 m: smaller and less bouncy than a size 5 ball.');
const USYS=W('US Youth Soccer, Policy on Players and Playing Rules (December 5, 2025): Rules 303 and 305','https://www.usyouthsoccer.org/wp-content/uploads/sites/160/2025/12/Policy-on-Players-and-Playing-Rules-_APP-12.05.2025.pdf',
 'Ball size 5 from 13U. Rule 305: players 10 and under do not head the ball in matches or organised practice; at 11 and 12, heading practice is limited to 25 headers a player a week.');
const FA_HEAD=W('England Football: Heading in Football','https://www.englandfootball.com/learn/Brain-Health/Heading-in-Football',
 'Heading is not introduced in training from U7 to U11. At U12 and U13: at most one heading session a week, with light balls and at most five headers.');
const LAW10=W('IFAB Laws of the Game, Law 10: Determining the Outcome of a Match','https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/',
 'A goal is scored when the whole of the ball passes over the goal line, between the goalposts and under the crossbar, provided no offence has been committed.');
const DRILLS={path:'/learn/soccer-drills',name:'Soccer drills for kids',line:'Drills with diagrams for every age'};
const PLANS={path:'/learn/soccer-practice-plans',name:'Soccer practice plans',line:'Whole practices, ready to run'};
const AGES={path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19 and which game each one plays'};
const FIELD={path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and game length for each age group'};
const BALL={path:'/learn/soccer-ball-size-by-age',name:'Soccer ball size by age',line:'Size 3, 4 or 5 for each age group'};
const BUILD={path:'/learn/soccer-rules/build-out-line',name:'The build-out line in 7v7',line:'The dashed line on a 7v7 field'};
const HEAD={path:'/learn/soccer-rules/heading-rules-for-kids',name:'Heading rules for kids',line:'No heading at 10 and under'};
const FORMATS={path:'/learn/7v7-9v9-11v11',name:'7v7, 9v9 and 11v11 explained',line:'Why children play small-sided games'};
const FIELDS={path:'/tools/soccer-field-diagrams',name:'Blank soccer field diagrams to print',line:'Free fields and cheat sheets to print'};
const LINEUP={path:'/tools/soccer-lineup-builder',name:'Soccer lineup builder',line:'Names on a field diagram for 7v7, 9v9, 11v11 or futsal'};
const CALC={path:'/tools/soccer-playing-time-calculator',name:'Equal playing time calculator for soccer',line:'A fair substitution plan with equal minutes'};
const TIMER={path:'/tools/soccer-match-timer',name:'Soccer match timer and scoreboard',line:'A game clock with halves by age group'};
const JUGGLE_GAME={path:'/games/soccer-juggling-game',name:'Keepy-Uppy Beat, the juggling game',line:'Juggle to the beat with feet, thigh and head'};
const TOE={path:'/learn/soccer-drills/toe-taps-and-foundations',name:'Toe taps and foundations',line:'The first ball mastery moves, two minutes a day'};
const THIGH={path:'/learn/soccer-drills/thigh-and-chest-control',name:'Thigh and chest control drill',line:'Cushion a high ball and keep it close'};
const AT_HOME={path:'/learn/soccer-drills/at-home',name:'Soccer drills at home',line:'Drills for one player and one parent'};
const ASSIST={path:'/learn/soccer-terms/assist',name:'What is an assist in soccer?',line:'The pass before the goal'};
const CLEAN={path:'/learn/soccer-terms/clean-sheet',name:'What is a clean sheet?',line:'A game without conceding'};
const POSITIONS={path:'/learn/soccer-positions',name:'Soccer positions for kids',line:'What each player does'};
const U8={path:'/learn/soccer-drills/u8',name:'U8 soccer drills',line:'Drills for 7 and 8 year olds'};

export const TEAM_NAMES_EN:NewToolWords={slug:'soccer-team-name-generator',crumb:'Team name generator',title:'Soccer Team Name Generator: Kid-Friendly Team Names',h1:'Soccer team name generator',
 description:'Free kid-friendly soccer team names by age group, colour, animal or place, with the real story behind club words like United, Rovers and Wanderers.',
 lead:'Choose your players’ age group, a style, your shirt colour or a favourite animal, and type your town or school if you like. The generator suggests eight safe, kid-friendly team names at a time, each with a short note: where a word like United or Wanderers comes from, or a tip for choosing.',
 blurb:'Kid-friendly team names by age, colour, animal or place, with where club words like United come from',
 features:['Eight team names at a time, reshuffled with one tap','Styles: animals, classic club names, weather and sky, or a mix','Your shirt colour, favourite animal and town or school','Names chosen for the age group: playful for U6 to U8, classic for older teams','A real note on where club words like United, Rovers and Real come from','Only safe, hand-picked words: nothing rude, scary or unkind','Save favourites on this device, copy or share the list','English and Spanish names'],
 imageAlt:'The soccer team name generator on a phone: Blue Otters, Oak Hill Wanderers and six more names, each with a short note',toolTitle:'Find a team name',
 howTitle:'How to pick a team name',
 how:['Choose the age group. Younger teams get mostly animals and colours; older teams get more classic club names.','Choose a style, or leave it on Mix. Pick your shirt colour and an animal if the team already has favourites.',
  'Type your town, street, school or park, if you want it in the name. Only letters are kept.','Tap Shuffle for eight new names. Tap the star on any you like: favourites stay on this device until you clear them.',
  'Read the shortlist to the players and let them vote. Copy the favourites or share the link, so the parents see them too.'],
 sections:[
  {id:'why',title:'Why let the players name their team',paras:['A name the children chose is a name they shout. Shouting a teammate’s name, or the team’s, is how young players start to talk on the field: “Lions, back!”, “Man on!”. A short, loud name helps that habit start in the first week.',
   'Choosing together is also the team’s first decision as a team. Give them three or four names from the list, let everyone vote with their hands up, and accept the result. It is a small lesson in fair play that costs nothing and lasts all season.']},
  {id:'origins',title:'Where club names come from',table:{label:'Where common club words come from',head:['Word','Where it comes from'],rows:[]},
   paras:['These are the real stories behind the classic words the generator uses. Each comes from the club’s own history, linked in the sources below.']},
  {id:'tips',title:'Tips for a good kids’ team name',items:['Keep it short: one or two words that a six-year-old can shout in one breath.','Make it kind: no names that make fun of the other team or of anyone.','Match the shirts: Blue Sharks in blue shirts is easy to remember.','Check the league’s list first, so two teams in the same group do not have the same name.','Let the players vote. A name they chose is a name they will cheer.']}],
 sourcesTitle:'Sources',sourcesIntro:'The notes on club words come from each club’s history, as summarised in these articles. The names themselves are built only from hand-picked words.',
 sources:[WIKI.wanderers,WIKI.newcastle,WIKI.blackburn,WIKI.albion,WIKI.bilbao,WIKI.real,WIKI.inter,WIKI.spurs,WIKI.fire],
 faqTitle:'Questions about soccer team names',
 faq:[{q:'What is a good name for a kids’ soccer team?',a:'A short name the children can shout, that matches their shirts and is kind to everyone: a colour and an animal (Blue Sharks, Golden Eagles) or the place you play (Oak Hill United). Let the players choose from a shortlist.'},
  {q:'Why are so many soccer teams called United?',a:'United means joined together. Clubs often took it when two teams became one: Newcastle United chose the name in 1892 to mark East End and West End joining. Today many teams use it to say the whole town plays together.'},
  {q:'What does Rovers or Wanderers mean in a team name?',a:'Both mean travelling. Wanderers F.C., winners of the first FA Cup in 1872, was named for never having a home ground. A rover is someone who roams, and Blackburn Rovers, founded in 1875, is one of the oldest clubs with the word.'},
  {q:'Are the names safe for young children?',a:'Yes. Every name is built from a hand-picked list of animals, colours, weather words and club words, and nothing else. The only word you can add is your own place name.'},{q:'How do I choose a team name with my players?',a:'Let the team vote. Make a few names with the generator, read out three or four, and count hands. Kids like a name they can shout and a colour or animal they can draw, so short names win.'}],
 relatedTitle:'More for a new team',related:[LINEUP,CALC,AGES,POSITIONS,DRILLS,TIMER,FIELDS,{path:'/tools/soccer-practice-plan-generator',name:'Soccer practice plan generator',line:'A timed practice by age, from our drill pages'},{path:'/tools/soccer-juggling-challenge',name:'Soccer juggling challenge',line:'Levels from 5 to 100 touches, with a tracker'}/* SEO batch E */]};

export const PRACTICE_PLAN_EN:NewToolWords={slug:'soccer-practice-plan-generator',crumb:'Practice plan generator',title:'Soccer Practice Plan Generator: Free Plans by Age',h1:'Soccer practice plan generator',
 description:'Make a free soccer practice plan for U6 to U12: pick age, length, players and focus, get a timed plan of real drills to print or share. No sign-up.',
 lead:'Pick the age group, how long the practice is, how many players are coming and what you want to work on. The generator builds a timed plan from our own drill pages: a warm-up, two drills for the focus, a water break, a small-sided game and a cool-down. Swap any drill you do not like, then print it or share the link.',
 blurb:'A timed practice from our drill pages by age, length, players and focus, to print or share',
 features:['Plans for U6, U8, U10 and U12','45, 60, 75 or 90 minutes, with times that add up exactly','Focus on passing, shooting, dribbling, defending, goalkeeping or fun','Every drill links to its own page with a diagram and coaching points','Swap any drill for another that fits','Team sizes for the game worked out from your number of players','Print it, or share a link that opens the same plan','Works offline; nothing is sent anywhere'],
 imageAlt:'A 60-minute U8 passing practice plan on a phone: warm-up, two passing drills, a water break, a 4v4 game and a cool-down',toolTitle:'Build your practice',
 howTitle:'How to use the practice plan generator',
 how:['Choose the age group of your players. Every drill on the plan lists that age on its own page.','Choose the length of the practice and type how many players usually come. The plan’s times always add up to the length you chose.',
  'Choose a focus. The two drills in the middle train it; the warm-up and the game keep everyone moving with a ball.','Tap a drill’s name to open its page, with a setup diagram, steps and coaching points. Tap Swap to try another drill in that slot.',
  'Print the plan for your clipboard, or share the link with your assistant coach: it opens the same plan.'],
 sections:[
  {id:'shape',title:'How the plan is built',paras:['Every plan follows the shape U.S. Soccer teaches grassroots coaches, play then practice then play: players arrive and start with a game, practise the idea of the day in activities that look like the game, and finish with a real game. A cool-down at the end calms everyone down and gives you one minute to ask what they learned.'],
   items:['Warm-up (about a fifth of the time): a fun game with a ball each.','Two drills for the focus (about a quarter each), with a water break between them in longer practices.','A small-sided game (the longest part): the focus tested in a real game.','Cool-down (5 minutes): easy touches, a stretch and one question.']},
  {id:'lengths',title:'How long should a soccer practice be?',table:{label:'Suggested practice length by age group',head:['Age group','Ages','Suggested length','Lengths to choose here'],rows:[]},
   paras:['These lengths come from US Youth Soccer’s coaching guidance. The generator still lets you choose any length and tells you when a practice runs long for the age.']},
  {id:'why',title:'Why a plan helps young players learn',paras:['A plan keeps the children playing instead of waiting. When the next activity is already set out, there are no long gaps while the coach thinks, and the players get many more touches of the ball in the hour.',
   'One focus a practice is enough for young players. Two drills on the same idea, then a game where it matters, let a child try the skill, get it wrong, try again and then use it with a defender in front of them. That is how a skill moves from practice into Saturday’s game.']},{id:'example',title:'Example: a 60-minute U8 passing practice',paras:['Choose U8, 60 minutes, 10 players and passing. The plan gives an 11-minute warm-up game, two 13-minute drills on passing and first touch, a 2-minute water break, a 16-minute small-sided game and a 5-minute cool-down: 60 minutes exactly. Tap a drill to see its diagram, or Swap it for another passing drill.']}/* SEO batch E */],
 sourcesTitle:'Sources',sourcesIntro:'The shape of the plan and the lengths by age come from these coaching documents. The drills are our own pages, each with its own notes by age.',sources:[PPP,SESSION],
 faqTitle:'Questions about soccer practice plans',
 faq:[{q:'What is a good soccer practice plan for 8 year olds?',a:'About 45 to 60 minutes: a fun warm-up with a ball each, two short drills on one skill such as passing or dribbling, a water break, then a 4v4 game for the longest part, and a short cool-down. Choose U8 in the generator for a ready plan.'},
  {q:'How many drills should be in one practice?',a:'Two or three, plus a game. Young players learn by repeating a game they understand, so two drills on the same focus work better than five new ones.'},
  {q:'Can I share the plan with another coach?',a:'Yes. Tap Share or Copy link: the link holds the age, length, focus and your swaps, so it opens exactly the same plan on another phone.'},
  {q:'Is there goalkeeper training for young players?',a:'From U10. In the US small-sided standards 4v4 has no goalkeepers, so goalkeeping drills start at U10, with soft, rolled or underarm service. If you choose goalkeeping for U6 or U8, the plan uses fun ball games instead.'},{q:'What should a U6 soccer practice look like?',a:'About 45 minutes, the length US Youth Soccer suggests at U6: fun ball games with a ball for every child, no lines and no laps, and small games of 3v3. Choose U6 in the generator for a ready plan.'}],
 relatedTitle:'Drills, plans and more tools',related:[DRILLS,PLANS,U8,{path:'/learn/soccer-drills/u10',name:'U10 soccer drills',line:'Drills for 9 and 10 year olds'},TIMER,CALC,FIELDS,
  /* SEO wave 2, Nov 24 2026 */{path:'/tools/soccer-scanning-trainer',name:'Soccer scanning trainer',line:'A phone on a cone that trains players to look over the shoulder'},{path:'/tools/youth-soccer-field-size-guide',name:'Youth soccer field size guide',line:'Field and goal sizes for each format, with a cone plan'},{path:'/learn/soccer-drills/u6',name:'U6 soccer drills',line:'Fun games for 5 and 6 year olds'}/* SEO batch E */]};

export const FIELD_EN:NewToolWords={slug:'youth-soccer-field-size-guide',crumb:'Field size guide',title:'Youth Soccer Field Dimensions and Goal Sizes: 4v4 to 11v11',h1:'Youth soccer field size guide',
 description:'Youth soccer field dimensions and goal sizes for 4v4, 5v5, 7v7, 9v9, 11v11 and futsal, drawn to scale, with penalty areas and a cone plan to mark it.',
 lead:'Pick the format your team plays and see the field drawn to scale: the length and width range, the goal size, the penalty area and build-out line where the rules set them, and the ball. Change the length and width to fit your space, switch between yards and metres, and follow the steps to mark it out with cones.',
 blurb:'Field, goal and penalty area sizes for each format, drawn to scale, with a cone plan to mark it',
 features:['4v4, 5v5, 7v7, 9v9, 11v11 and futsal','Field length and width ranges from U.S. Soccer, The FA and the Laws of the Game','Goal size, penalty area, goal area and build-out line','Ball size for each format','A field drawn to scale that changes as you set the size','Yards and metres','Step-by-step cone plan with a cone count','Works offline; nothing is sent anywhere'],
 imageAlt:'A 7v7 youth soccer field drawn to scale, 60 by 40 yards, with the penalty areas, build-out lines and a cone plan',toolTitle:'Your field',
 howTitle:'How to use the field size guide',
 how:['Choose the format: 4v4, 5v5, 7v7, 9v9, 11v11 or futsal. The age groups that play it are shown under the buttons.','Read the size range. Any length and width inside it follows the standard; pick what fits your space.',
  'Move the length and width sliders to the space you have. The drawing, the markings and the cone plan follow.','Switch to metres or yards. Goal sizes are shown in feet with yards, and in metres with metres.',
  'Follow the cone plan from the first corner. Print the page, or keep it open on your phone at the field.'],
 sections:[
  {id:'sizes',title:'Youth soccer field dimensions by format',table:{label:'Youth soccer field sizes, goals and balls by format',head:['Format','Who plays it','Field (length x width)','Goal (width x height)','Ball'],rows:[]},
   paras:['US sizes are the U.S. Soccer small-sided standards, 11v11 is the Laws of the Game, 5v5 is The FA’s size for England, and futsal is the futsal Laws. Leagues may set their own sizes within these ranges, so check your league’s rules.']},
  {id:'markings',title:'Penalty area, goal area and build-out line',table:{label:'Field markings by format',head:['Format','Penalty area (deep x wide)','Goal area (deep x wide)','Penalty mark','Center circle'],rows:[]},
   paras:['In 7v7 the build-out line sits halfway between the penalty area line and the halfway line, so on a 60-yard field it is 21 yards from each goal line. 4v4 needs no markings: there are no goalkeepers and no penalty kicks.']},
  {id:'england',title:'Field sizes in England',paras:['The FA uses different formats and sizes: 5v5 for U8 and U9 on 37 by 27 metres, 7v7 for U10 and U11 on 55 by 37 metres with 12 by 6 foot goals, and 9v9 for U12 and U13 on 73 by 46 metres with 16 by 7 foot goals. Each also has a smaller minimum size.']},
  {id:'why',title:'Why small fields help children learn',paras:['A small field means more touches. On a 4v4 field every child is close to the ball, sees it often and has to decide what to do with it, again and again. On a big field the same child might touch the ball a few times a game.',
   'The size grows with the players. A 7v7 field is big enough for a goalkeeper to play the ball out and for a team to spread wide, which is what the build-out line is for: it gives the defenders time to pass out from the back instead of kicking the ball away.']},{id:'example',title:'Example: marking a 7v7 field',paras:['A 7v7 field of 60 by 40 yards, with 6.5 by 12 foot goals (the recommended size). The penalty areas are 12 yards deep and 24 yards wide, the build-out lines sit 21 yards from each goal line, and the cone plan uses 29 cones. Start at one corner and walk the plan in order.']}/* SEO batch E */],
 sourcesTitle:'Sources',sourcesIntro:'Every size on this page comes from these documents. The widths of the 11v11 areas and the build-out line’s distance are worked out from them.',sources:[USSF,LIJSL,FA,LAW1,USYS,FUTSAL1,FUTSAL2],
 faqTitle:'Questions about youth soccer field sizes',
 faq:[{q:'What size is a 7v7 soccer field?',a:'In the U.S. Soccer standards a 7v7 field is 55 to 65 yards long and 35 to 45 yards wide, with goals no bigger than 6.5 by 18.5 feet (6.5 by 12 feet recommended). The penalty area is 12 yards deep and 24 yards wide.'},
  {q:'What size is a 9v9 soccer field?',a:'70 to 80 yards long and 45 to 55 yards wide, with goals no bigger than 7 by 21 feet (6.5 by 18.5 feet recommended). The penalty area is 14 yards deep and 36 yards wide, and the penalty spot is 10 yards out.'},
  {q:'How big is a 4v4 soccer field?',a:'25 to 35 yards long and 15 to 25 yards wide, with goals no bigger than 4 feet high and 6 feet wide. 4v4 is for U6 to U8 and has no goalkeepers, so it needs no penalty area.'},
  {q:'How many cones do I need to mark a field?',a:'For a 7v7 field, about 29: four corners, three on the halfway line, eight for the two penalty areas, four for the goal areas, two penalty marks, four for the build-out lines and four round the center circle. The guide counts them for each format.'},
  {q:'How big is a futsal court?',a:'25 to 42 metres long and 16 to 25 metres wide (38 to 42 by 20 to 25 for international games), with goals 3 metres wide and 2 metres high. The penalty area is drawn with 6-metre quarter circles.'}],
 relatedTitle:'Charts, rules and more tools',related:[FIELD,BALL,BUILD,FORMATS,FIELDS,LINEUP,AGES,{path:'/tools/soccer-match-timer',name:'Soccer match timer',line:'A game clock with halves set by age'},{path:'/tools/soccer-practice-plan-generator',name:'Soccer practice plan generator',line:'A timed practice by age, from our drill pages'}/* SEO batch E */]};

export const JUGGLING_EN:NewToolWords={slug:'soccer-juggling-challenge',crumb:'Juggling challenge',title:'Soccer Juggling Challenge for Kids: Levels and Tracker',h1:'Soccer juggling challenge',
 description:'A free soccer juggling challenge for kids: levels from 5 to 100 touches, weak foot and thigh, personal bests, a weekly goal and tips for each level.',
 lead:'Juggling, or keepy-uppy, is keeping the ball off the ground with your feet, thighs and other body parts. Pick a challenge, count your touches, and log each try. The tracker keeps your personal best and your practice days on this device, shows the next level to reach, and gives a tip for each one.',
 blurb:'Juggling levels from 5 to 100 touches, personal bests, a streak and a weekly goal, kept on your device',
 features:['Levels from 5 to 100 touches','Weak foot and thigh challenges','Head challenge only from age 11, with the heading limits','Personal best for each challenge','A practice streak and a weekly goal','A tip for every level','A celebration on every new best','Saved on this device only; no sign-up'],
 imageAlt:'The juggling challenge on a phone: best 23 touches with both feet, next level 30, a three-day streak and a tip',toolTitle:'Your juggling challenge',
 howTitle:'How to do the juggling challenge',
 how:['Choose your age. Head juggling is hidden for players aged 10 and under, because they do not head the ball in practice.','Choose a challenge: both feet, weak foot only, or thighs only. The next level to reach is shown in big numbers.',
  'Juggle and count your touches out loud. The try ends when the ball touches the ground or your hands.','Type the number and tap Save try, or use the plus and minus buttons. A new best gets a celebration.',
  'Try a few times a week. Set a weekly goal of practice days and watch your streak grow.'],
 sections:[
  {id:'learn',title:'How to juggle a soccer ball: for kids',ordered:true,items:['Start with one bounce: drop the ball, let it bounce, kick it up gently with your laces, and catch it. Then try two kicks before you catch it.','Keep your ankle locked and your toes pointing a little up, so the ball comes straight back to you instead of flying away.',
   'Use small kicks, no higher than your waist. Low touches are easier to control.','When you can do five in a row, try without the bounce: drop the ball straight onto your foot.','Swap feet. Right, left, right, left keeps your balance and makes your weak foot stronger.']},
  {id:'levels',title:'Juggling levels and tips',table:{label:'Juggling challenge levels',head:['Challenge','Levels (touches in a row)'],rows:[]},
   paras:['Count touches in a row without the ball touching the ground. Every level has a tip in the tracker. Most children take weeks to go from 5 to 20; that is normal, and every practice counts.']},
  {id:'why',title:'Why juggling helps young players',paras:['Juggling trains a soft first touch. Every touch is a tiny lesson in how hard to hit the ball and where on the foot, which is the same feel a player needs to stop a pass dead or cushion a high ball in a game.',
   'It is also the best practice a child can do alone. A ball and a small patch of grass or a garage are enough, and the count gives them a clear goal to beat. Coaches use it to build the habit of practising between team sessions.']},
  {id:'heading',title:'Heading and juggling',items:['Players aged 10 and under do not head the ball in practice in US youth soccer, and The FA does not introduce heading in training before U12. The tracker hides the head challenge for them.','At 11 and 12, US Youth Soccer limits heading practice to 25 headers a player a week; The FA allows at most five headers in one session a week at U12 and U13, with a light ball.','So head juggling stays short: three levels, up to 10 touches. Count every header towards the week’s limit, and juggle with feet and thighs the rest of the time.']}],
 sourcesTitle:'Sources',sourcesIntro:'The heading limits come from these rules. The levels and tips are our own coaching advice.',sources:[USYS,FA_HEAD],
 faqTitle:'Questions about juggling a soccer ball',
 faq:[{q:'How many juggles should a 10 year old be able to do?',a:'There is no fixed number. Many children start with two or three and reach 20 or more after a few weeks of short practice. Compare a child only with their own last best, and praise the practice, not the number.'},
  {q:'How do you teach a kid to juggle a soccer ball?',a:'Start with one kick and a catch, letting the ball bounce in between. Then two kicks, then three. Keep the ankle locked and the kicks low. When five in a row is easy, take away the bounce.'},
  {q:'Does juggling make you a better soccer player?',a:'It helps your touch: how softly you meet the ball, with which part of the foot, and keeping your balance on one leg. Those are the same skills you need to control a pass. It is not a substitute for playing games with others.'},
  {q:'Is the tracker private?',a:'Yes. Your tries, bests and streak are saved only in this browser on this device. Nothing is sent anywhere and there is no account.'},{q:'How long should kids practise juggling?',a:'A few minutes is enough: five to ten minutes on most days beats one long session a week. The tracker’s weekly goal counts the days you practise, not the hours.'}],
 relatedTitle:'Games, drills and more',related:[JUGGLE_GAME,TOE,THIGH,AT_HOME,HEAD,BALL,DRILLS,{path:'/learn/soccer-terms/first-touch',name:'First touch',line:'What a good first touch is, and how to practise it'},{path:'/tools/soccer-practice-plan-generator',name:'Soccer practice plan generator',line:'A timed practice by age, from our drill pages'}/* SEO batch E */]};

export const STATS_EN:NewToolWords={slug:'youth-soccer-stats-tracker',crumb:'Stats tracker',title:'Youth Soccer Stats Tracker for Parents: Free and Private',h1:'Youth soccer stats tracker',
 description:'A free, private soccer stats tracker for parents: log goals, assists, saves, minutes and effort badges each game, see the season, export a CSV.',
 lead:'Log each game in a few taps: goals, assists, saves and minutes played, plus the effort badges that matter just as much at this age, such as tried a new skill or helped a teammate. The season summary adds it all up with simple charts. Everything stays on this device; a nickname is enough.',
 blurb:'Goals, assists, saves, minutes and effort badges per game, a season summary with charts and a CSV',
 features:['Goals, assists, saves and minutes for every game','Effort badges: tried a new skill, helped a teammate, great attitude and more','Season totals and per-game averages','Simple charts of each game','Edit or delete any game','Export the season as a CSV for a spreadsheet','No names needed: a nickname is enough','Saved on this device only; nothing is sent anywhere'],
 imageAlt:'The youth soccer stats tracker on a phone: a season of five games with goals, assists, minutes and effort badges, and a bar chart',toolTitle:'Your season',
 howTitle:'How to use the stats tracker',
 how:['Type a nickname for the player if you like. It is only shown on this device.','After each game tap Add game. Set the date and the other team, then tap plus for each goal, assist and save, and set the minutes played.',
  'Tick the effort badges your child earned. Choose them together on the way home: it is a good conversation about the game.','Look at the season summary and the charts. Tap any game in the list to edit or delete it.',
  'Tap Export CSV to keep a copy in a spreadsheet, or to move the season to another device.'],
 sections:[
  {id:'effort',title:'Why the effort badges matter most',paras:['At seven to twelve, goals depend on the position a child plays, the team they are in and luck. Effort, attitude and trying new things depend only on the child, and they are what grows a player. That is why the tracker counts them next to goals, and why the badges come first on each game card.',
   'Use the numbers to notice progress, not to compare children. A season where a child played more minutes, tried more skills and helped more teammates is a great season, whatever the goals column says.']},
  {id:'counting',title:'How to count goals, assists and saves',items:['A goal counts when the whole ball crosses the goal line between the posts and under the bar. Own goals are not your child’s goals.','An assist is the last pass or touch to a teammate who then scores. It is a custom of stats keepers, not a rule of the game, so count it the way your team does.','A save is a shot that would have gone in and the goalkeeper stopped. Only count saves when your child played in goal.','Minutes played are worth recording: they show whether playing time is shared fairly across the season.']},
  {id:'privacy',title:'Private by design',items:['There is no account and no sign-up. The season is saved in this browser on this device only.','Nothing is sent to us or to anyone else. Clearing your browser data deletes the season, so export a CSV now and then.','You do not need your child’s name: a nickname, a shirt number or nothing at all works.']}],
 sourcesTitle:'Sources',sourcesIntro:'The definition of a goal comes from the Laws of the Game. Assists and saves are counted by custom.',sources:[LAW10],
 faqTitle:'Questions about tracking youth soccer stats',
 faq:[{q:'What stats should parents track in youth soccer?',a:'Keep it simple: minutes played, goals, assists, saves for goalkeepers, and a few effort notes such as trying a new skill or helping a teammate. More detail rarely helps a young player and can take the fun out of the game.'},
  {q:'Is there a free soccer stats app for parents?',a:'This page works like one: open it on your phone at the field, add it to your home screen if you like, and log a game in under a minute. It is free, needs no account and works offline once loaded.'},
  {q:'Can I export the stats to a spreadsheet?',a:'Yes. Export CSV downloads every game with its date, opponent, goals, assists, saves, minutes and badges, ready to open in Excel, Numbers or Google Sheets.'},
  {q:'Should I show my child their stats?',a:'Show them the badges and the minutes first, and talk about what went well. Goals are fun to celebrate, but praise for effort and learning keeps children playing for longer.'},{q:'Can two parents track the same player?',a:'Not in one shared list: the tracker keeps everything on the device you use. Pick one phone for game day, or export the CSV and send it to the other parent.'}],
 relatedTitle:'Terms, tools and more',related:[ASSIST,CLEAN,CALC,TIMER,POSITIONS,AT_HOME,LINEUP,{path:'/tools/soccer-practice-plan-generator',name:'Soccer practice plan generator',line:'A timed practice by age, from our drill pages'},{path:'/tools/soccer-juggling-challenge',name:'Soccer juggling challenge',line:'Levels from 5 to 100 touches, with a tracker'}/* SEO batch E */]};

export const MORE_TOOLS_EN:readonly NewToolWords[]=[TEAM_NAMES_EN,PRACTICE_PLAN_EN,FIELD_EN,JUGGLING_EN,STATS_EN];
