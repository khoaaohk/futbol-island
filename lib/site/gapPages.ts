import type {FactIconKind} from '@/components/site/FactIcons';
import type {DrillCardData,IconStep,PitchSpot,TryLink} from '@/components/site/visual/Visuals';
import type {QuizQuestion} from './guideQuiz';
import {diagramUrl,formationImage} from './guides';
import {playLessonHref} from './playLinks';
/**
 * The gap pages (SEO lift + visual pass, Nov 26 2026): searches the site had no page for (GSC 28 days to Nov 25 2026), each a
 * real guide in its family, EN here and ES in lib/i18n/es/gapPages.ts (same keys, same block ids, same order). Rendered by
 * components/site/visual/GapPageView.tsx; one static route per page (app/(site)/…/page.tsx) and the Spanish dispatcher.
 *
 * SOURCES (checked Nov 26 2026; nothing from memory that is not listed here):
 *  - Position letters: there is no official list. The Laws of the Game name only the goalkeeper. GK, CB, LB/RB, CDM, CM, CAM,
 *    LM/RM, LW/RW, CF, ST are the common team-sheet and video-game letters in English; POR, DFC, LI/LD, CAI/CAD, MCD, MC, MCO,
 *    MI/MD, EI/ED, SD, DC the Spanish ones (the Spanish edition of the EA Sports FC games). Numbers 4 and 5 for center backs:
 *    lib/site/positionNumbers.ts (the 1-11 custom, with its sources).
 *  - Futsal: FIFA Futsal Laws of the Game 2025-26 (Laws 1, 2, 3, 7, 12, 15, 16 and the accumulated fouls), the same source
 *    as lib/site/comparisons.ts FUTSAL_VS_SOCCER. Soccer: IFAB Laws of the Game (Law 1 field 90-120 m by 45-90 m, Law 2 size 5
 *    ball 68-70 cm, goal 7.32 m by 2.44 m, Law 3, Law 7 two halves of 45 minutes, Law 11 offside, Law 15 throw-in; Law 12.2 from
 *    2025-26: a goalkeeper holding the ball over 8 seconds gives a corner kick, theifab.com/law-changes/2025-26; the IFAB news of
 *    Feb 28 2026: a 5-second countdown on a delayed throw-in or goal kick, from the 2026 World Cup).
 *  - Coaching (possession games, solo drills, kinds of dribbling): plain coaching practice, said as advice, never as a rule;
 *    the age bands follow U.S. Soccer's grassroots stages as used on the drills pages (lib/site/drills.ts sources). The "five
 *    kinds of dribbling" are a coaching way of sorting, not an official list: the page says so.
 */
export type GapBlock=
 |{k:'pitch';id:string;title:string;intro?:string;spots:readonly PitchSpot[];pitchTitle:string;pitchDesc:string;more?:string}
 |{k:'table';id:string;title:string;intro?:string;head:readonly string[];rows:readonly (readonly string[])[];note?:string}
 |{k:'drills';id:string;title:string;intro?:string;drills:readonly DrillCardData[]}
 |{k:'steps';id:string;title:string;intro?:string;items:readonly IconStep[]}
 |{k:'list';id:string;title:string;intro?:string;items:readonly string[]}
 |{k:'callout';id:string;title:string;items?:readonly string[];text?:string;tone:'mistakes'|'tip'}
 |{k:'scale';id:string;title:string;intro?:string;caption:string};
export type GapFact={icon:FactIconKind;label:string;value:string;href?:string};
export type GapPage={key:string;path:string;hub:{name:string;path:string};crumb:string;rail:string;title:string;desc:string;h1:string;answer:string;
 facts:readonly GapFact[];blocks:readonly GapBlock[];faq:readonly {q:string;a:string}[];quizName:string;quiz:readonly QuizQuestion[];tryIt:readonly TryLink[];
 links:readonly {path:string;name:string;line:string}[];about:string;image:string;imageAlt:string;sources:string;lessons?:readonly string[]};
export const GAP_UPDATED='2026-11-26';
const P='/learn/soccer-positions',D='/learn/soccer-drills',T='/learn/soccer-terms';
const q=(qq:string,options:string[],correct:number,explain:string):QuizQuestion=>({q:qq,options,correct,explain});

/* 1. Position abbreviations ------------------------------------------------------------------------------------------- */
const SPOTS:readonly PitchSpot[]=[
 {id:'gk',abbr:'GK',name:'Goalkeeper',x:50,y:3,job:'Stops shots and starts attacks. The only player who may use their hands, in their own penalty area.',also:'Number 1. Spanish: POR (portero).',href:`${P}/goalkeeper`},
 {id:'cb',abbr:'CB',name:'Center back',x:36,y:18,job:'Defends the middle in front of the goal: heads clear, blocks shots, marks the striker. Usually a pair: LCB and RCB.',also:'Numbers 4 and 5. Spanish: DFC (defensa central).',href:`${P}/center-back`},
 {id:'cb2',abbr:'CB',name:'Center back',x:64,y:18,job:'',href:`${P}/center-back`},
 {id:'lb',abbr:'LB',name:'Left back',x:10,y:24,job:'Defends the left side and runs forward to help attacks. RB is the same job on the right.',also:'Number 3 (RB: 2). Spanish: LI and LD (lateral izquierdo, derecho).',href:`${P}/fullback`},
 {id:'rb',abbr:'RB',name:'Right back',x:90,y:24,job:'',href:`${P}/fullback`},
 {id:'cdm',abbr:'CDM',name:'Central defensive midfielder',x:50,y:36,job:'Sits in front of the defenders, wins the ball back and passes it simply. Also written DM.',also:'Number 6. Spanish: MCD (mediocentro defensivo), or pivote.',href:`${P}/defensive-midfielder`},
 {id:'cm',abbr:'CM',name:'Central midfielder',x:32,y:50,job:'Links defense and attack: gets on the ball, passes, and runs box to box.',also:'Number 8. Spanish: MC (mediocentro).',href:`${P}/central-midfielder`},
 {id:'cam',abbr:'CAM',name:'Central attacking midfielder',x:66,y:56,job:'Plays just behind the striker: makes the last pass, shoots from the edge of the box. Also written AM.',also:'Number 10. Spanish: MCO (mediocentro ofensivo), or mediapunta.',href:`${P}/attacking-midfielder`},
 {id:'lw',abbr:'LW',name:'Left winger',x:12,y:76,job:'Attacks down the left: dribbles at defenders, crosses, cuts inside to shoot. RW is the right side.',also:'Number 11 (RW: 7). Spanish: EI and ED (extremo izquierdo, derecho).',href:`${P}/winger`},
 {id:'rw',abbr:'RW',name:'Right winger',x:88,y:76,job:'',href:`${P}/winger`},
 {id:'st',abbr:'ST',name:'Striker',x:50,y:86,job:'The player furthest forward: scores goals, holds the ball up, presses the defenders. CF (center forward) is almost the same.',also:'Number 9. Spanish: DC (delantero centro).',href:`${P}/striker`},
];
const ABBR:GapPage={key:'abbreviations',path:`${P}/abbreviations`,hub:{name:'Soccer positions',path:P},crumb:'Position abbreviations',rail:'Abbreviations',
 title:'Soccer Position Abbreviations: CB, CDM, CAM, ST and More',
 desc:'Soccer position abbreviations for kids: what CB, LB, RB, CDM, CM, CAM, LW, RW, ST and GK mean, on a pitch you can tap, and the Spanish DFC, MCD and MCO.',
 h1:'Soccer position abbreviations: what CB, CDM and CAM mean',
 answer:'Soccer position abbreviations are the short letters coaches, team sheets and video games use for each position. CB means center back, LB and RB the left and right back, CDM a defensive midfielder, CM a central midfielder, CAM an attacking midfielder, LW and RW the wingers, ST the striker and GK the goalkeeper.',
 facts:[{icon:'diagram',label:'Pitch',value:'Tap a position',href:'#pitch'},{icon:'tag',label:'Letters',value:'25 explained',href:'#all-letters'},{icon:'shirt',label:'Spanish letters',value:'DFC, MCD, MCO…',href:'#spanish'},{icon:'quiz',label:'Quick quiz',value:'3 questions',href:'#quiz'}],
 blocks:[
  {k:'pitch',id:'pitch',title:'Tap a position to see its job',intro:'The pitch shows a 4-3-3 with a defensive and an attacking midfielder, attacking up. Tap or click any letter to jump to what that player does.',
   spots:SPOTS,pitchTitle:'Soccer position abbreviations on a field',pitchDesc:'An 11v11 field attacking up. GK in goal; two CB and the LB and RB across the back; CDM in front of them; CM and CAM in midfield; LW and RW wide in attack; ST at the front.',
   more:'Each letter links to its row below. The same letters are on the team sheet and in the lineup builder.'},
  {k:'table',id:'all-letters',title:'All the soccer position letters',head:['Letters','Stands for','Where they play'],rows:[
   ['GK','Goalkeeper','In goal'],['CB','Center back','The middle of the defense'],['LCB / RCB','Left / right center back','The two center backs of a pair'],['SW','Sweeper','A spare defender behind the others (rare today)'],
   ['LB / RB','Left back / right back','The sides of a back four'],['LWB / RWB','Left / right wingback','The sides, higher up, in a back three'],['DF','Defender','Any defender, on a team list'],
   ['CDM / DM','Central defensive midfielder','In front of the defense'],['CM','Central midfielder','The middle of the field'],['LCM / RCM','Left / right central midfielder','The two or three central midfielders'],
   ['CAM / AM','Central attacking midfielder','Behind the striker'],['LM / RM','Left / right midfielder','Wide in midfield'],['MF','Midfielder','Any midfielder, on a team list'],
   ['LW / RW','Left / right winger','Wide in attack'],['CF','Center forward','At the front, sometimes a little deeper than a ST'],['SS','Second striker','Just behind or beside the striker'],
   ['ST','Striker','The front of the attack'],['FW','Forward','Any attacker, on a team list']],
   note:'The letters are a custom, not a rule: the Laws of the Game only name the goalkeeper. Leagues, apps and games use slightly different lists.'},
  {k:'table',id:'spanish',title:'Position abbreviations in Spanish: DFC, MCD, MCO and more',intro:'Spanish-speaking coaches and the Spanish editions of soccer video games use their own letters. Here they are next to the English ones.',
   head:['Spanish','Means','English'],rows:[['POR','Portero','GK'],['DFC','Defensa central','CB'],['LI / LD','Lateral izquierdo / derecho','LB / RB'],['CAI / CAD','Carrilero izquierdo / derecho','LWB / RWB'],
   ['MCD','Mediocentro defensivo (pivote)','CDM'],['MC','Mediocentro','CM'],['MCO','Mediocentro ofensivo (mediapunta)','CAM'],['MI / MD','Medio izquierdo / derecho','LM / RM'],
   ['EI / ED','Extremo izquierdo / derecho','LW / RW'],['SD','Segundo delantero','CF / SS'],['DC','Delantero centro','ST']]},
  {k:'list',id:'numbers',title:'What numbers do center backs wear?',items:['Center backs traditionally wear 4 and 5, with 2 and 3 for the fullbacks and 6 for the defensive midfielder.','The numbers come from the days when the starting eleven wore 1 to 11. Today players can choose almost any number, so a CB might wear 15 or 23.','Smaller games use fewer letters: in 7v7 there are usually two or three defenders and no CDM or CAM.']},
  {k:'callout',id:'mix-ups',title:'Common mix-ups',tone:'mistakes',items:['CDM and CAM are not left and right: D means defensive (deeper), A means attacking (higher up).','LB is a defender, LW an attacker, LM a midfielder: same side, three different jobs.','CF and ST are close to the same. Some coaches use CF for a forward who drops deeper to link play.']},
  {k:'callout',id:'ask-your-coach',title:'Ask your coach',tone:'tip',text:'Next practice, ask “Which letters am I today?” and “Who is next to me?” Knowing the two players beside you is half of playing any position.'},
 ],
 faq:[{q:'What does CB mean in soccer?',a:'CB means center back: a defender who plays in the middle of the defense, in front of the goalkeeper. Most teams play two, called LCB and RCB.'},
  {q:'What is the difference between CDM and CAM?',a:'Both play in the middle. The CDM sits deeper, in front of the defenders, and protects them. The CAM plays higher, behind the striker, and makes the last pass.'},
  {q:'What does DFC mean in Spanish soccer?',a:'DFC means defensa central, the Spanish for center back (CB). DC is delantero centro (striker) and POR is portero (goalkeeper).'},
  {q:'What numbers do center backs wear?',a:'Traditionally 4 and 5. Players can choose other numbers today, but many teams still give the center backs 4 and 5.'},
  {q:'Are soccer position abbreviations official?',a:'No. The Laws of the Game only name the goalkeeper. The letters are a custom used by coaches, team sheets, TV and video games, so lists differ a little.'}],
 quizName:'position abbreviations',quiz:[
  q('What does CB stand for?',['Corner back','Center back','Center ball'],1,'CB is center back, a defender in the middle.'),
  q('Who plays higher up the field, the CDM or the CAM?',['The CDM','The CAM','They stand level'],1,'The CAM is the attacking midfielder, just behind the striker. The CDM sits in front of the defense.'),
  q('In Spanish, what is DC?',['Defensa central','Delantero centro','Defensa carrilero'],1,'DC is delantero centro, the striker. DFC is the center back.')],
 tryIt:[{href:'/tools/11v11-lineup-builder',name:'11v11 lineup builder',line:'Put names on the letters and print the team sheet'},
  {href:'/learn/quizzes/soccer-positions-quiz',name:'Soccer positions quiz',line:'Questions and answers on every position'},
  {href:playLessonHref('learn7_carry'),name:'Play a position on the island',line:'A lesson in the game: carry the ball forward from your spot'}],
 links:[{path:`${P}/numbers`,name:'Soccer positions by number',line:'What 1 to 11 mean on the team sheet'},{path:P,name:'Soccer positions explained',line:'Every position, with a diagram'},
  {path:`${P}/striker-vs-winger`,name:'Striker vs winger',line:'ST and LW / RW side by side'},{path:`${P}/fullback-vs-wingback`,name:'Fullback vs wingback',line:'LB and LWB side by side'},{path:'/learn/soccer-formations',name:'Soccer formations',line:'Where the letters stand in each shape'}],
 about:'Soccer position abbreviations',image:formationImage('11v11-4-3-3'),imageAlt:'Diagram of the 11 soccer positions in a 4-3-3',
 sources:'The letters are a custom: the Laws of the Game (IFAB) only name the goalkeeper. Spanish letters as used by Spanish-speaking coaches and the Spanish editions of soccer video games.'};

/* 5. Solo drills ------------------------------------------------------------------------------------------------------ */
const W=(x:number,y:number):readonly [number,number]=>[x,y];
const SOLO:GapPage={key:'solo-drills',path:`${D}/solo-soccer-drills`,hub:{name:'Soccer drills',path:D},crumb:'Solo drills',rail:'Solo drills',
 title:'Soccer Drills to Do by Yourself: 9 Solo Drills With a Wall',
 desc:'Soccer drills to do by yourself: 9 solo drills for kids with a ball and a wall, from toe taps to wall passes and turns, with set-up pictures and ages.',
 h1:'Soccer drills to do by yourself: 9 solo drills with a ball and a wall',
 answer:'The best soccer drills to do by yourself need only a ball and a wall: toe taps, wall passes with both feet, a cone weave, juggling, sole rolls, receiving and turning off the wall, and shooting at a target. Ten to twenty minutes a day, with lots of touches on both feet, does more than one long session a week.',
 facts:[{icon:'ball',label:'You need',value:'A ball, a wall, 4-6 cones'},{icon:'clock',label:'Time',value:'10-20 minutes'},{icon:'cone',label:'Drills',value:'9, by age',href:'#drills'},{icon:'quiz',label:'Quick quiz',value:'3 questions',href:'#quiz'}],
 blocks:[
  {k:'callout',id:'safe-spot',title:'Pick a safe spot first',tone:'tip',items:['A wall you are allowed to kick against: a garage, a school wall, a fence board. Ask a grown-up.','Away from windows, cars and the road. A soft ball indoors.','Shoes or cones for markers. A size 3 or 4 ball for younger kids.']},
  {k:'drills',id:'drills',title:'9 solo soccer drills, easiest first',intro:'Each drill says the age it suits and how long to do it. Do three or four in one go, not all nine.',drills:[
   {id:'toe-taps',name:'Toe taps',meta:['Ages 5+','3 x 30 seconds'],setup:{players:[[50,40,'You']],balls:[[50,26]]},steps:['Stand behind the ball. Tap the top of it with the sole of one foot, then the other, like walking on the spot.','Stay on your toes and keep the ball still.','Count your taps in 30 seconds. Rest, then try to beat it.'],tip:'Look up between taps: in a game your eyes are on the field, not the ball.',link:{path:`${D}/toe-taps-and-foundations`,name:'Toe taps and foundations'}},
   {id:'wall-passes',name:'Two-touch wall passes',meta:['Ages 5+','2 x 2 minutes'],setup:{wall:'top',players:[[50,58,'You']],balls:[[50,42]],arrows:[[50,52,50,22,'ball'],[44,22,44,50,'ball']]},steps:['Stand three to five big steps from the wall.','Pass with the inside of your foot, so it comes straight back.','Stop it with one touch, pass with the next. Ten with the right foot, ten with the left.'],tip:'Lock your ankle and point your standing foot at the wall.',link:{path:`${D}/wall-passing`,name:'Wall passing drill'}},
   {id:'cone-weave',name:'Cone weave',meta:['Ages 5+','5 runs each way'],setup:{cones:[W(15,35),W(30,35),W(45,35),W(60,35),W(75,35),W(90,35)],players:[[6,50]],balls:[[8,42]],arrows:[[10,42,90,42,'run']]},steps:['Put six cones or shoes in a line, one big step apart.','Dribble in and out of them with small touches, then turn and come back.','Use only your right foot, then only your left, then the outside of the foot.'],tip:'Small touches near the cones, a bigger touch in the open space at the end.',link:{path:`${D}/cone-weave-dribbling`,name:'Cone weave dribbling'}},
   {id:'speed-and-stop',name:'Speed dribble and stop',meta:['Ages 6+','6 runs'],setup:{cones:[W(10,35),W(90,35)],players:[[10,52]],balls:[[14,35]],arrows:[[16,35,86,35,'run']]},steps:['Two markers about 15 big steps apart.','Push the ball out in front and run fast to the far marker.','Stop the ball dead with your sole right at the marker, turn, and go again.'],tip:'Fast in a straight line means fewer touches; slow down to stop it.'},
   {id:'sole-rolls',name:'Sole rolls and pull-backs',meta:['Ages 7+','3 x 30 seconds'],setup:{players:[[50,44,'You']],balls:[[50,30]],arrows:[[38,30,62,30,'ball'],[50,22,50,40,'ball']]},steps:['Roll the ball across your body with the sole, from one foot to the other.','Then pull it back towards you with the sole and push it away with your laces.','Mix them: roll, roll, pull back, turn.'],tip:'Keep your knees bent and your arms out for balance.',link:{path:`${T}/dribble`,name:'Dribble'}},
   {id:'juggling',name:'Juggling: kick and catch',meta:['Ages 7+','5 minutes'],setup:{players:[[50,50,'You']],balls:[[50,22]],arrows:[[50,40,50,24,'ball']]},steps:['Drop the ball, kick it up once with your laces, catch it.','Then two kicks before the catch, then three.','Older players: let it bounce once between kicks, then no bounce at all. Count your best.'],tip:'Toes pointed, a small kick: the ball should not go above your head.',link:{path:'/tools/soccer-juggling-challenge',name:'Juggling challenge'}},
   {id:'one-touch',name:'One-touch wall passes',meta:['Ages 8+','3 x 1 minute'],setup:{wall:'top',players:[[50,52,'You']],balls:[[50,38]],arrows:[[50,46,40,20,'ball'],[40,20,60,20,'run'],[60,20,50,46,'ball']]},steps:['Move a little closer to the wall.','Pass it back the first time, without stopping it.','Alternate feet: right, left, right. Count how many in a row.'],tip:'Get your feet set before the ball arrives, not when it arrives.'},
   {id:'receive-turn',name:'Receive and turn off the wall',meta:['Ages 9+','2 x 2 minutes'],setup:{wall:'top',cones:[W(15,60),W(85,60)],players:[[50,48,'You']],balls:[[50,32]],arrows:[[50,24,50,44,'ball'],[54,50,82,58,'run']]},steps:['Put a marker on each side, behind you.','Pass to the wall. Open your body as it comes back and take your first touch across you, with the foot furthest from the wall.','Dribble to a marker. Next time, turn the other way.'],tip:'Look over your shoulder before the ball arrives: that is scanning.',link:{path:`${D}/receive-across-the-body`,name:'Receive across the body'}},
   {id:'target-shots',name:'Shooting at a target',meta:['Ages 8+','10 shots each foot'],setup:{wall:'top',goals:[[25,8],[75,8]],players:[[50,60,'You']],balls:[[50,48]],arrows:[[50,44,26,14,'ball']]},steps:['Mark two target squares low on the wall with chalk or tape, like the corners of a goal.','Shoot with your laces from about eight big steps away.','Score a point for each square you hit. Left foot shots count double.'],tip:'Head over the ball and land on your kicking foot to keep shots low.',link:{path:`${D}/shooting`,name:'Shooting drills'}}]},
  {k:'table',id:'by-age',title:'Which solo drills for which age',head:['Age','Start with','Add'],rows:[['5 to 6 (U6)','Toe taps, cone weave','Two-touch wall passes'],['7 to 8 (U8)','Wall passes with both feet, speed dribble and stop','Sole rolls, kick-and-catch juggling'],['9 to 10 (U10)','One-touch wall passes, receive and turn','Target shots with both feet'],['11 to 12 (U12)','Receive and turn both ways, one-touch with the weaker foot','Juggling with no bounce, shots on the move']]},
  {k:'callout',id:'mistakes',title:'Common mistakes',tone:'mistakes',items:['Only using the stronger foot. Do every drill with both.','Kicking as hard as possible at the wall: a clean pass that comes back is better.','Going for an hour once a week. A little every day builds touch faster.']}],
 faq:[{q:'How can I practice soccer by myself?',a:'With a ball and a wall: wall passes, toe taps, a cone weave, juggling and target shots. Do three or four drills for 10 to 20 minutes, using both feet.'},
  {q:'What soccer drills can I do at home without a wall?',a:'Toe taps, sole rolls, a cone weave with shoes as cones, speed dribble and stop, and juggling all work without a wall.'},
  {q:'How long should a kid practice soccer alone?',a:'10 to 20 minutes is plenty for most kids. Short and often, with a break when it stops being fun.'},
  {q:'What is the best solo drill for first touch?',a:'Receive and turn off the wall: pass, open your body and take your first touch across you into space.'},
  {q:'Can I get better at soccer by practicing alone?',a:'Yes, at ball skills: touch, passing, both feet and juggling. Decisions and teamwork still come from playing games with others.'}],
 quizName:'solo drills',quiz:[
  q('Which part of the foot do you use for a two-touch wall pass?',['The toe','The inside','The heel'],1,'The inside of the foot is the biggest, flattest surface, so the pass goes straight.'),
  q('How long is a good solo session for most kids?',['10 to 20 minutes','2 hours','1 minute'],0,'Short and often builds skill faster than one long session.'),
  q('When should you look over your shoulder in "receive and turn"?',['After you turn','Before the ball arrives','Never'],1,'Scanning before the ball arrives tells you which way to turn.')],
 tryIt:[{href:'/tools/soccer-juggling-challenge',name:'Juggling challenge',line:'Count your keepy-ups and beat your best'},
  {href:'/games/soccer-juggling-game',name:'Juggling game',line:'Keep the ball up in the arcade'},
  {href:'/games/soccer-shooting-game',name:'Ball Blaster',line:'The shooting game: aim low for the corners'}],
 links:[{path:`${D}/at-home`,name:'Soccer drills at home',line:'More drills for the yard and the living room'},{path:`${D}/u8`,name:'U8 soccer drills',line:'Games for 7 and 8 year olds'},{path:`${D}/first-touch`,name:'First touch drills',line:'Control the ball in one touch'},{path:`${T}/weak-foot`,name:'Weak foot',line:'Why both feet matter'},{path:D,name:'All soccer drills for kids',line:'Drills by age and skill'}],
 about:'Solo soccer drills for kids',image:diagramUrl('wall-passing-drill.png'),imageAlt:'Diagram of the wall passing soccer drill',
 sources:'Coaching practice, written for these pages. Ages follow the U6 to U12 stages used on the drills pages.'};

/* 7. Futsal vs soccer ------------------------------------------------------------------------------------------------- */
const FUTSAL:GapPage={key:'futsal-vs-soccer',path:'/learn/futsal-vs-soccer',hub:{name:'Futsal for kids',path:'/learn/futsal-for-kids'},crumb:'Futsal vs soccer',rail:'Futsal vs soccer',
 title:'Futsal vs Soccer: the Differences Side by Side, for Kids',
 desc:'Futsal vs soccer for kids: the ball, court, players, clock, kick-ins, fouls and sending-offs side by side, and what each one teaches a young player.',
 h1:'Futsal vs soccer: what is different, side by side',
 answer:'Futsal is five-a-side football on a hard court, with a smaller, heavier ball that bounces less. Compared with soccer, it has no offside, unlimited flying substitutions, kick-ins instead of throw-ins, a stopping clock, four seconds for every restart and a team foul count that gives a free shot from 10 m after the fifth foul.',
 facts:[{icon:'court',label:'Players',value:'5 vs 11'},{icon:'ball',label:'Ball',value:'Size 4 vs size 5'},{icon:'clock',label:'Time',value:'2x20 stopped vs 2x45'},{icon:'quiz',label:'Quick quiz',value:'3 questions',href:'#quiz'}],
 blocks:[
  {k:'scale',id:'to-scale',title:'A futsal court and a soccer field, to scale',intro:'The court fits on a soccer field about seven times over, which is why futsal players touch the ball so often.',caption:'To scale: a 40 m by 20 m futsal court drawn inside a 105 m by 68 m soccer field. Futsal goals are 3 m wide, soccer goals 7.32 m.'},
  {k:'table',id:'differences',title:'Futsal vs soccer: every difference',head:['','Futsal','Soccer (11v11)','What it means for you'],rows:[
   ['Players','5 a side, with the goalkeeper','11 a side, with the goalkeeper','In futsal everyone defends and attacks'],
   ['Playing area','A court, 25-42 m by 16-25 m, with lines (no grass)','A field, 90-120 m by 45-90 m','Less time on the ball in futsal: decide fast'],
   ['Ball','Size 4, 62-64 cm around, low bounce','Size 5, 68-70 cm around','The futsal ball stays on the floor, so you pass along the ground'],
   ['Goals','3 m by 2 m','7.32 m by 2.44 m','Shots must be accurate, often with the toe or low'],
   ['Game time','2 x 20 minutes; the clock stops when the ball is out','2 x 45 minutes; the clock runs, time is added','A futsal game lasts longer than 40 minutes on the clock on the wall'],
   ['Substitutes','Unlimited, any time, through the team’s substitution zone','A set number in each game','You come off and on again in futsal'],
   ['Ball out on the side','Kick-in, ball on the line, within 4 seconds','Throw-in with two hands','Futsal: pass it in with your foot'],
   ['Restarts','4 seconds for kick-ins, free kicks, corners and goal clearances','No fixed time for most; a referee may start a 5-second countdown on a slow throw-in or goal kick','Be ready before the ball goes out'],
   ['Ball out over the end line','Goal clearance: the keeper throws it from the penalty area','Goal kick','Futsal keepers start attacks with a throw'],
   ['Goalkeeper on the ball','4 seconds in their own half, with hands or feet','8 seconds holding it in the hands, or a corner kick to the other team','Futsal keepers must move it quickly'],
   ['Offside','None','Yes (Law 11)','In futsal a striker can wait near goal'],
   ['Team fouls','Counted each half; from the 6th, a direct free kick with no wall, usually from the 10 m mark','Not counted','Futsal punishes many small fouls'],
   ['Penalty mark','6 m','11 m (12 yards)','Futsal penalties are closer'],
   ['Sent off','The team is one short for 2 minutes or until the other team scores','The team is one short for the rest of the game','Futsal teams get their fifth player back'],
   ['Time-outs','One per team in each half, 1 minute','None','Coaches can stop the game in futsal'],
   ['Referees','Two on the court, plus a timekeeper and often a third referee','One referee, two assistants, often a fourth official','']],
   note:'Sources: FIFA Futsal Laws of the Game 2025-26; IFAB Laws of the Game (Laws 1, 2, 3, 7, 11, 12, 15, 16). Youth leagues change some details, such as game length and court size.'},
  {k:'list',id:'what-it-teaches',title:'What futsal teaches a soccer player',items:['Close control: the small, heavy ball and the tight court mean many touches in little space.','Quick decisions: four seconds to restart and defenders close by.','Using the sole: futsal players roll and stop the ball with the bottom of the foot.','Playing every job: with five players, everyone defends and attacks, like a midfielder in soccer.']},
  {k:'callout',id:'switching',title:'Switching between the two',tone:'tip',items:['From futsal to soccer: look up and pass longer, there is room to use.','From soccer to futsal: get rid of the ball quickly and expect no throw-ins.','Shoes: flat-soled indoor shoes for futsal, cleats for grass.']},
  {k:'callout',id:'mix-ups',title:'Common mix-ups',tone:'mistakes',items:['“Futsal is just indoor soccer.” Indoor soccer is often played with walls and boards; futsal has lines, and the ball goes out.','“There are no slide tackles in futsal.” A slide is allowed if it is not careless, reckless or dangerous, but it is a foul when it is.','“The clock in futsal never stops.” It stops whenever the ball is out of play.']}],
 faq:[{q:'What is the main difference between futsal and soccer?',a:'Futsal is five a side on a small hard court with a size 4 low-bounce ball. Soccer is eleven a side on a big field with a size 5 ball.'},
  {q:'Is there offside in futsal?',a:'No. Futsal has no offside rule, so attackers may stand anywhere.'},
  {q:'How long is a futsal game?',a:'Two periods of 20 minutes of playing time. The clock stops when the ball is out, so a game takes longer on a normal clock.'},
  {q:'Is futsal good for kids who play soccer?',a:'Yes. Many coaches use it to build close control and quick decisions, because every player touches the ball far more often.'},
  {q:'What size ball is used in futsal?',a:'A size 4 futsal ball, 62 to 64 cm around, made to bounce less than a normal ball.'}],
 quizName:'futsal vs soccer',quiz:[
  q('How do you restart when the ball goes out on the side in futsal?',['A throw-in','A kick-in','A drop ball'],1,'Futsal uses a kick-in, with the ball on the line, taken within 4 seconds.'),
  q('Is there offside in futsal?',['Yes','No','Only in the second half'],1,'Futsal has no offside rule.'),
  q('How long does a futsal team play one short after a red card?',['The rest of the game','2 minutes, or until the other team scores','10 minutes'],1,'After 2 minutes of playing time, or a goal by the other team, a substitute may come on.')],
 tryIt:[{href:'/learn/soccer-rules/futsal-rules',name:'Futsal rules for kids',line:'Every futsal rule, with a diagram'},
  {href:'/tools/futsal-lineup-builder',name:'Futsal lineup builder',line:'Pick your five and print it'},
  {href:playLessonHref('expf_2v1'),name:'Play futsal on the island',line:'A futsal lesson in the game: win the 2v1'}],
 links:[{path:'/learn/soccer-rules/futsal-rules',name:'Futsal rules',line:'The rules page, with the foul count'},{path:'/learn/futsal-for-kids',name:'Futsal for kids',line:'Lessons, formations and drills for futsal'},{path:'/learn/soccer-formations',name:'Futsal formations',line:'Shapes for five players'},{path:'/learn/7v7-9v9-11v11',name:'7v7 vs 9v9 vs 11v11',line:'How the soccer game sizes differ'},{path:'/learn/soccer-ball-size-by-age',name:'Soccer ball size by age',line:'Size 3, 4 or 5'}],
 about:'Futsal compared with soccer',image:diagramUrl('futsal-rules-rule.png'),imageAlt:'Diagram of a futsal court',
 sources:'FIFA Futsal Laws of the Game 2025-26; IFAB Laws of the Game.'};

/* 6. Types of dribbling ----------------------------------------------------------------------------------------------- */
const DRIB:GapPage={key:'types-of-dribbling',path:`${T}/types-of-dribbling`,hub:{name:'Soccer terms',path:T},crumb:'Types of dribbling',rail:'Types of dribbling',
 title:'Types of Dribbling in Soccer: the 5 Kinds, for Kids',
 desc:'The types of dribbling in soccer for kids: close control, speed dribbling, shielding, turns and cuts, and feints, with pictures and when to use each one.',
 h1:'Types of dribbling in soccer: the 5 kinds and when to use them',
 answer:'Coaches usually sort dribbling into five types: close control dribbling in tight spaces, speed dribbling into open space, shielding the ball from a defender, turns and cuts to change direction, and feints that fake one way to go the other. Each one fits a different moment in a game.',
 facts:[{icon:'ball',label:'Types',value:'5',href:'#types'},{icon:'steps',label:'Best for',value:'Ages 6 to 12'},{icon:'link',label:'Moves',value:'Step-over, dummy, nutmeg',href:'#moves'},{icon:'quiz',label:'Quick quiz',value:'3 questions',href:'#quiz'}],
 blocks:[
  {k:'drills',id:'types',title:'The 5 types of dribbling',intro:'There is no official list: this is how many coaches sort it. A good dribbler mixes all five in one run.',drills:[
   {id:'close-control',name:'1. Close control dribbling',meta:['Tight spaces','Small touches'],setup:{cones:[W(25,25),W(45,45),W(65,25),W(80,50),W(35,55)],players:[[15,40]],balls:[[20,40]],arrows:[[20,40,85,40,'run']]},steps:['Keep the ball within a step of your feet, touching it every stride.','Use the inside, outside and sole of both feet.','Use it in traffic: near defenders, in the middle, in a crowded box.'],link:{path:`${T}/dribble`,name:'Dribble'}},
   {id:'speed',name:'2. Speed dribbling',meta:['Open space','Bigger touches'],setup:{players:[[10,50]],balls:[[22,50]],arrows:[[22,50,90,50,'run']],cones:[W(92,30),W(92,70)]},steps:['Push the ball a few steps ahead and sprint after it.','Touch it with the laces or the outside of the foot, toes down.','Use it when there is empty space in front: a counterattack, or down the wing.'],link:{path:`${T}/counterattack`,name:'Counterattack'}},
   {id:'shielding',name:'3. Shielding',meta:['Under pressure','Body between'],setup:{players:[[48,40,'You'],[64,40,'D']],balls:[[38,40]]},steps:['Put your body between the defender and the ball, side on.','Knees bent, arm out for balance (not pushing), ball on your far foot.','Use it to keep the ball until a teammate arrives or space opens.'],link:{path:`${T}/shielding`,name:'Shielding'}},
   {id:'turns',name:'4. Turns and cuts',meta:['Change direction','Escape pressure'],setup:{players:[[50,25]],balls:[[50,40]],arrows:[[50,40,50,60,'run'],[50,60,20,60,'run']],cones:[W(50,66)]},steps:['Stop the ball or cut across it to change direction quickly.','Common turns: the inside cut, the outside cut, the drag-back and the Cruyff turn.','Use them when a defender blocks your way or you run into a dead end.'],link:{path:`${D}/turn-and-go`,name:'Turn and go drill'}},
   {id:'feints',name:'5. Feints and fakes',meta:['Beat a defender','Fake, then go'],setup:{players:[[30,40],[62,40,'D']],balls:[[38,40]],arrows:[[38,40,52,28,'run'],[52,28,85,50,'run']]},steps:['Fake one way with your body, a dip of the shoulder or a step over the ball.','When the defender leans, go the other way fast.','Use them 1v1, when you need a yard of space to cross or shoot.'],link:{path:`${T}/step-over`,name:'Step-over'}}]},
  {k:'table',id:'when',title:'Which type of dribble when?',head:['In the game','Use','Why'],rows:[['Crowded middle of the field','Close control','You need the ball near you all the time'],['Empty space ahead','Speed dribbling','Cover ground fast before defenders get back'],['A defender right behind you','Shielding','Keep the ball until help comes'],['A defender in your way','A turn or a cut','Go where they are not'],['1v1 with room behind the defender','A feint','Make them lean, then go past']]},
  {k:'table',id:'moves',title:'Dribbling moves and their type',head:['Move','Type','Read more'],rows:[['Step-over','Feint','Step over the ball and go the other way'],['Dummy','Feint','Let the ball run past you for a teammate'],['Nutmeg','Feint or close control','Play the ball through the defender’s legs'],['Drag-back','Turn','Pull the ball back with the sole and turn'],['Inside and outside cut','Turn','Cut across the ball with the inside or outside of the foot']]},
  {k:'callout',id:'mistakes',title:'Common mistakes',tone:'mistakes',items:['Head down the whole time: look up between touches.','Big touches in a crowd, tiny touches in open space: it should be the other way round.','Dribbling when a teammate is free: a dribble is a choice, a pass is often better.']},
  {k:'callout',id:'try-at-practice',title:'Try it at practice',tone:'tip',text:'Play sharks and minnows. Use close control in the crowd, speed in the open, and a turn when a shark blocks you.'}],
 faq:[{q:'What are the 5 types of dribbling in soccer?',a:'Close control dribbling, speed dribbling, shielding, turns and cuts, and feints or fakes. It is a coaching way of sorting dribbles, not an official list.'},
  {q:'What is the easiest type of dribbling for beginners?',a:'Close control with the inside of the foot: small touches, ball close, head up between touches.'},
  {q:'Is shielding a type of dribbling?',a:'Yes, for most coaches. You keep the ball by putting your body between it and the defender, often while moving slowly.'},
  {q:'What part of the foot is used for speed dribbling?',a:'Mostly the laces or the outside of the foot, with the toes pointed down, so you can push the ball ahead while running.'},
  {q:'How can kids get better at dribbling?',a:'Lots of touches: cone weaves, toe taps and dribbling games like sharks and minnows, using both feet.'}],
 quizName:'types of dribbling',quiz:[
  q('There is open space ahead of you. Which dribble?',['Shielding','Speed dribbling','Close control'],1,'Push the ball ahead and run: speed dribbling covers ground fast.'),
  q('A defender is right behind you. Which dribble?',['Shielding','A step-over','Speed dribbling'],0,'Shielding puts your body between the defender and the ball.'),
  q('A step-over is which type?',['A turn','A feint','Speed dribbling'],1,'It fakes one way so you can go the other: a feint.')],
 tryIt:[{href:`${D}/sharks-and-minnows`,name:'Sharks and minnows',line:'The dribbling game for every age'},
  {href:'/games/soccer-runner-game',name:'Breakaway Run',line:'The arcade runner: dodge defenders at speed'},
  {href:playLessonHref('learn7_carry'),name:'Carry the ball on the island',line:'A lesson in the game: when to dribble forward'}],
 links:[{path:`${T}/dribble`,name:'Dribble',line:'What dribbling is'},{path:`${T}/shielding`,name:'Shielding',line:'Protect the ball'},{path:`${T}/step-over`,name:'Step-over',line:'The fake with a step over the ball'},{path:`${T}/nutmeg`,name:'Nutmeg',line:'Through the legs'},{path:`${D}/dribbling`,name:'Dribbling drills',line:'Drills to practise all five'}],
 about:'Types of dribbling in soccer',image:diagramUrl('dribble-term.png'),imageAlt:'Diagram of a dribble in soccer',
 sources:'Coaching practice, written for these pages: the five types are a common way of sorting dribbling, not an official list.'};

/* 2. Teaching kids possession ----------------------------------------------------------------------------------------- */
const POSS:GapPage={key:'teaching-possession',path:`${D}/teaching-kids-possession`,hub:{name:'Soccer drills',path:D},crumb:'Teaching possession',rail:'Teaching possession',
 title:'Teaching Kids Possession in Soccer: 3 Games and What to Say',
 desc:'A coach’s guide to teaching kids the importance of possession in soccer: when to start, three simple keep-away games, coaching points and the words to use.',
 h1:'Teaching kids the importance of possession in soccer',
 answer:'Teach possession to kids with games, not speeches: keep-away games where a team scores by making passes. Start around age 8, once players can pass and stop the ball, and use three simple ideas: make the field big, move so a teammate can see you, and keep the ball when there is no good forward pass.',
 facts:[{icon:'steps',label:'Start at',value:'About age 8 (U9)'},{icon:'cone',label:'Games',value:'3, easiest first',href:'#games'},{icon:'whistle',label:'Words to use',value:'5 short calls',href:'#what-to-say'},{icon:'quiz',label:'Quick quiz',value:'3 questions',href:'#quiz'}],
 blocks:[
  {k:'table',id:'by-age',title:'Possession by age',head:['Age','What to expect','What to teach'],rows:[['5 to 7 (U6, U8)','One ball each, dribbling; passing is new','Keep the ball close; “can you find a friend?”'],['8 to 10 (U9, U10)','Passing and stopping the ball work','Spread out, move to get free, pass to the free player'],['11 to 12 (U11, U12)','Can play 4v2 and small games','Keep it to build up, then go forward when there is space']]},
  {k:'drills',id:'games',title:'3 simple possession games',intro:'Each game has a point to score, so kids want to keep the ball.',drills:[
   {id:'rondo',name:'Rondo 3v1 (or 4v1)',meta:['Ages 8+','10 by 10 yards','8 minutes'],setup:{cones:[W(20,10),W(80,10),W(20,60),W(80,60)],players:[[20,35],[50,10],[80,35],[50,40,'D']],balls:[[24,35]],arrows:[[24,35,48,14,'ball']]},steps:['Three players on the sides of a square, one defender in the middle.','Count passes. Five in a row is a point.','If the defender touches the ball, the passer swaps in.'],tip:'Say: “Make the square big.”',link:{path:`${D}/rondo-3v1`,name:'Rondo 3v1'}},
   {id:'keep-away',name:'Three-team keep-away',meta:['Ages 9+','20 by 20 yards','10 minutes'],setup:{cones:[W(10,8),W(90,8),W(10,62),W(90,62)],players:[[25,20],[70,18],[50,50],[35,45,'D'],[65,40,'D']],balls:[[29,20]],arrows:[[29,20,66,18,'ball'],[50,50,40,30,'run']]},steps:['Three teams of three. Two teams keep the ball together; one team defends.','When the defenders win it, the team that lost it defends.','Count passes: the team in possession with the most wins.'],tip:'Say: “Where is the free one?”',link:{path:`${D}/three-team-keep-away`,name:'Three-team keep-away'}},
   {id:'end-zone',name:'Pass into the end zone',meta:['Ages 10+','30 by 20 yards','12 minutes'],setup:{cones:[W(5,10),W(95,10),W(5,60),W(95,60),W(5,20),W(95,20)],players:[[30,45],[60,50],[50,30],[40,25,'D'],[70,35,'D']],balls:[[34,45]],arrows:[[34,45,56,50,'ball'],[50,30,55,12,'run']]},steps:['Two teams, 4v4. A thin end zone at each end.','Score by passing to a teammate who runs into the end zone.','Add a rule: three passes before you may score.'],tip:'Say: “Keep it, then go.”',link:{path:`${D}/end-zone-game`,name:'End zone game'}}]},
  {k:'steps',id:'coaching-points',title:'Coaching points',items:[{icon:'arrow',t:'Make it big',d:'Spread wide and long when your team has the ball. Space makes passing easier.'},{icon:'steps',t:'Move to be seen',d:'Step into a gap where the passer can see you, not behind a defender.'},{icon:'ball',t:'Open body',d:'Stand side-on so you can receive and pass forward in one touch.'},{icon:'swap',t:'Pass and move',d:'After a pass, move again so you can get it back.'},{icon:'goal',t:'Keep it, then go',d:'Possession is not the goal: keep the ball until a forward pass or a dribble is on.'}]},
  {k:'list',id:'what-to-say',title:'What to say: five short calls',intro:'Kids hear a few words in a game, not a speech. Use the same ones every week.',items:['“Make it big!” when your team wins the ball.','“Show for it!” to the player who is hiding behind a defender.','“Head up, then pass.” before they pass.','“Where’s the free one?” when they are about to kick it away.','“Keep it!” when there is no good pass forward, and “Go!” when there is.']},
  {k:'callout',id:'mistakes',title:'Common mistakes',tone:'mistakes',items:['Telling kids never to kick it long. Possession is a choice, not a rule: going forward is still the aim.','Standing in lines. Every player in a possession game should have a ball or be in the game.','Starting too young. Under 8s mostly need a ball each and dribbling games.']}],
 faq:[{q:'Why is possession important in soccer?',a:'While your team has the ball, the other team cannot score. Keeping it also tires the other team and waits for a gap to attack.'},
  {q:'At what age should kids learn possession?',a:'Around 8 to 10, once they can pass and stop the ball. Younger players learn to keep the ball with dribbling games.'},
  {q:'What is the best drill to teach possession?',a:'A rondo, such as 3v1 or 4v1 in a small square, with a point for five passes in a row.'},
  {q:'How do you explain possession to a child?',a:'“If we have the ball, they can’t score. Keep it until you see a way forward.”'},
  {q:'Should kids always keep possession?',a:'No. Keeping the ball is a way to find a chance. When a forward pass or a dribble is on, go.'}],
 quizName:'teaching possession',quiz:[
  q('What does “make it big” mean?',['Kick it far','Spread out when your team has the ball','Shout loudly'],1,'Spreading out makes space, and space makes passing easier.'),
  q('In a 3v1 rondo, how do you score a point?',['Five passes in a row','A goal','Dribble past the defender'],0,'Passes are the points, so players want to keep the ball.'),
  q('About what age can most kids start possession games?',['4','8','14'],1,'Around 8, once they can pass and stop the ball.')],
 tryIt:[{href:`${D}/rondo-3v1`,name:'Rondo 3v1 drill',line:'Set-up, steps and coaching points'},
  {href:'/games/soccer-passing-puzzle-game',name:'Pass Puzzles',line:'The passing game: find the free player'},
  {href:playLessonHref('expf_2v1'),name:'Win the 2v1 on the island',line:'A lesson in the game: pass at the right moment'}],
 links:[{path:`${T}/possession`,name:'Possession',line:'What possession means'},{path:`${T}/support`,name:'Support',line:'Moving to help the player on the ball'},{path:`${D}/passing`,name:'Passing drills',line:'Drills to pass and receive'},{path:`${D}/u10`,name:'U10 soccer drills',line:'Games for 9 and 10 year olds'},{path:'/learn/passing-and-support',name:'Passing and support',line:'The lessons hub for passing'}],
 about:'Teaching possession to kids in soccer',image:diagramUrl('rondo-3v1-drill.png'),imageAlt:'Diagram of a 3v1 rondo soccer drill',
 sources:'Coaching practice, written for these pages. Ages follow the U6 to U12 stages used on the drills pages.'};

export const GAP_PAGES:readonly GapPage[]=[ABBR,SOLO,FUTSAL,DRIB,POSS];
export const gapByKey=(k:string)=>GAP_PAGES.find(p=>p.key===k);
export const gapByPath=(path:string)=>GAP_PAGES.find(p=>p.path===path);
