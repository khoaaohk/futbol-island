import {lessonById,type SiteLesson} from './lessons';
import type {Faq} from './safety';
/**
 * The SIZE CHARTS (SEO cluster 2, Nov 10 2026): /learn/soccer-ball-size-by-age, /learn/soccer-field-size-by-age and
 * /learn/soccer-age-groups. Parents search these before buying a ball or signing a child up, so the tables must be right and
 * say where each row comes from and which season it is for. All words and numbers live here; the three routes only render.
 *
 * SOURCES (checked Nov 10 2026). Every row of every table names its source in the last column.
 *  - "USSF": U.S. Soccer, Player Development Initiatives, Small-Sided Games Chart and modified Laws (document of September 2016,
 *    standards mandated from August 2017; not replaced since, as far as this pass found): U6-U8 4v4, no goalkeeper, field
 *    25-35 x 15-25 yd, goal max 4 x 6 ft, ball 3, 4 x 10 min; U9-U10 7v7, field 55-65 x 35-45 yd, goal max 6.5 x 18.5 ft
 *    (6.5 x 12 recommended), ball 4, 2 x 25 min; U11-U12 9v9, field 70-80 x 45-55 yd, goal max 7 x 21 ft (6.5 x 18.5
 *    recommended), ball 4, 2 x 30 min. https://www.wiyouthsoccer.com/wp-content/uploads/sites/168/2023/06/pdi_final_september_2016.pdf
 *    (a state association's copy of the U.S. Soccer document) and https://www.ussoccer.com/stories/2017/08/five-things-to-know-how-smallsided-standards-will-change-youth-soccer
 *  - "USYS": US Youth Soccer, Policy on Players and Playing Rules as of December 5 2025, Rule 303 (game length and ball for each
 *    age group: 13U/14U 2 x 35, 15U/16U 2 x 40, 17U-19U 2 x 45, ball 5 from 13U; ball 3 = 23-24 in and 11-12 oz, ball 4 = 25-26 in
 *    and 11-13 oz, ball 5 = 27-28 in and 14-16 oz): https://www.usyouthsoccer.org/wp-content/uploads/sites/160/2025/12/Policy-on-Players-and-Playing-Rules-_APP-12.05.2025.pdf
 *  - "IFAB": Laws of the Game, Law 1 (full-size field 100-130 x 50-100 yd, goal 8 yd x 8 ft, penalty area 18 yd, goal area 6 yd,
 *    penalty mark 12 yd, center circle 10 yd) https://www.theifab.com/laws/latest/the-field-of-play/ and Law 2 (ball 68-70 cm,
 *    410-450 g) https://www.theifab.com/laws/latest/the-ball/ ; youth modifications https://www.theifab.com/laws/latest/general-modifications/
 *  - AYSO: ball 3 for 6U and 8U, ball 4 for 10U and 12U, ball 5 from 14U (same sizes as above; AYSO lists slightly different
 *    weights): https://wiki.ayso.org/wiki/Size_of_Ball_and_Field_by_Age_Division
 *  - Age groups from 2026-27: US Youth Soccer, US Club Soccer and AYSO form age groups on an August 1 to July 31 cycle from the
 *    2026-27 season: https://www.usyouthsoccer.org/news/2025/06/10/updated-decision-on-age-group-formation/ and
 *    https://usclubsoccer.org/resources/registration/2026-27-season-age-group-formation/ (season August 1 2026 to July 31 2027).
 *    U.S. Soccer lets each member organisation choose its cycle (https://www.ussoccer.com/ecosystem-review/player-registration,
 *    read through a search summary only: treat the "members choose" wording as reported, not quoted).
 *  - FIFA Futsal Laws of the Game 2025-26 (ball 62-64 cm, 400-440 g; pitch 25-42 m x 16-25 m for non-international matches was
 *    NOT read in this pass, so the futsal court size is not quoted).
 *  - England: The FA Future Fit table (3v3 U7, 5v5 U8-U9, 7v7 U10-U11, 9v9 U12-U13, ball 3 to U11, ball 4 at U12-U13, ball 5
 *    from U14): https://futurefit.englandfootball.com/futurefit/faqs/what-are-pitch-and-goal-sizes-for-the-different-age-groups/index.html
 * NOT VERIFIED and not stated: size 1 and 2 balls, penalty-area sizes on 7v7 and 9v9 fields (the U.S. Soccer document shows
 * them in a diagram that the text copy does not carry), field sizes for U13 to U19 other than the Laws' full-size range.
 */
export const SIZES_SEASON='2026-27';
export const SIZES_CHECKED='November 10, 2026';
export type Table={id:string;title:string;intro?:string;head:string[];rows:string[][];note:string};
export type ChartSection={id:string;title:string;items:string[]};
export type ChartPage={slug:string;path:string;crumb:string;blurb:string;title:string;h1:string;description:string;lead:string;more:string;tables:Table[];sections:ChartSection[];fields?:boolean;
 faq:Faq[];lessons:SiteLesson[];links:{path:string;name:string;line:string}[];picture:string;pictureTitle:string;pictureSub:string};
const pick=(ids:string[])=>ids.map(id=>{const l=lessonById(id);if(!l)throw new Error(`size chart lesson ${id} is not in the lesson catalog`);return l;});
const LEAGUE=`Typical US youth standards for the ${SIZES_SEASON} season; your league may differ. Checked on ${SIZES_CHECKED}.`;
const BALL={path:'/learn/soccer-ball-size-by-age',name:'Soccer ball size by age',line:'Size 3, 4 or 5 for each age group, with a chart'};
const FIELD={path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and game length for each age group'};
const AGES={path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19, birth dates and which game each one plays'};
const RULES={path:'/learn/soccer-rules',name:'Soccer rules for kids',line:'Every rule with a diagram'};
const TIME={path:'/learn/soccer-rules/substitutions-and-game-length',name:'Substitutions and game length by age',line:'How long games last and how changes work'};
const BUILD={path:'/learn/soccer-rules/build-out-line',name:'The build-out line in 7v7',line:'The dashed line on a 7v7 field'};
const HEAD={path:'/learn/soccer-rules/heading-rules-for-kids',name:'Heading rules for kids in the US',line:'No heading at 10 and under'};
const F7={path:'/learn/7v7-soccer-formations',name:'7v7 soccer formations',line:'Shapes for U9 and U10 teams'};
const F9={path:'/learn/9v9-soccer-formations',name:'9v9 soccer formations',line:'Shapes for U11 and U12 teams'};
const F11={path:'/learn/11v11-soccer-formations',name:'11v11 soccer formations',line:'Shapes for the full game'};
const FUTSAL={path:'/learn/soccer-rules/futsal-rules',name:'Futsal rules that differ from soccer',line:'A smaller ball, a smaller court'};

/** The 2026-27 birth-date range of age group U<n> on the August 1 to July 31 cycle (US Club Soccer: U-6 = Aug 1 2020 to Jul 31 2021). */
const born=(n:number)=>`Aug 1, ${2026-n} to Jul 31, ${2027-n}`;
const FORMAT=(n:number)=>n<=8?'4v4':n<=10?'7v7':n<=12?'9v9':'11v11';
const BALLSIZE=(n:number)=>n<=8?'3':n<=12?'4':'5';
const LENGTH=(n:number)=>n<=8?'4 quarters of 10 min':n<=10?'2 halves of 25 min':n<=12?'2 halves of 30 min':n<=14?'2 halves of 35 min':n<=16?'2 halves of 40 min':'2 halves of 45 min';
const AGE_ROWS=[6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(n=>[`U${n}`,`${n} and under`,born(n),FORMAT(n),BALLSIZE(n),LENGTH(n),n<=12?'USSF':'USYS']);

export const CHARTS:readonly ChartPage[]=[
 {slug:'soccer-ball-size-by-age',path:BALL.path,crumb:'Ball size by age',blurb:'Which ball to buy: size 3, 4 or 5 for every age group, in one chart',
  title:'Soccer Ball Size by Age: Size 3, 4 or 5 (Chart)',h1:'Soccer ball size by age',
  description:'Which soccer ball size your child needs: size 3 up to age 8, size 4 for ages 9 to 12 and size 5 from 13. A chart by age group, with sources for each row.',
  lead:'A soccer ball comes in three game sizes. In US youth soccer, players aged 8 and under use a size 3, players aged 9 to 12 use a size 4, and players aged 13 and older use a size 5, the same ball adults use.',
  more:'Buy the size your child’s age group plays with, not the size they will grow into. A ball that is too big and heavy is harder to control and to kick properly.',
  tables:[
   {id:'chart',title:'Soccer ball size chart by age group',head:['Age group','Ages','Ball size','Game','Source'],
    rows:[['U6, U7, U8','8 and under','Size 3','4v4','USSF, USYS'],['U9, U10','9 and 10','Size 4','7v7','USSF, USYS'],['U11, U12','11 and 12','Size 4','9v9','USSF, USYS'],['U13 to U19','13 and older','Size 5','11v11','USYS'],['Adults','','Size 5','11v11','IFAB']],
    note:`USSF = U.S. Soccer small-sided standards. USYS = US Youth Soccer playing rules, December 2025. IFAB = Laws of the Game, Law 2. AYSO uses the same sizes for its 6U to 19U divisions. ${LEAGUE}`},
   {id:'measure',title:'How big is each ball?',intro:'The size number is printed on the ball. If it has worn off, measure around the middle with a tape.',head:['Ball','Around the ball','Weight','Source'],
    rows:[['Size 3','23 to 24 in (58 to 61 cm)','11 to 12 oz','USYS'],['Size 4','25 to 26 in (64 to 66 cm)','11 to 13 oz','USYS'],['Size 5','27 to 28 in (68 to 70 cm)','14 to 16 oz (410 to 450 g)','USYS, IFAB'],['Futsal ball','62 to 64 cm (about 24.5 to 25 in)','400 to 440 g (about 14 to 15.5 oz)','FIFA']],
    note:'Inches and ounces are from US Youth Soccer Rule 303; the centimetres for sizes 3 and 4 are those inches converted and rounded. Size 5 and the futsal ball are the figures in the Laws. AYSO lists slightly different weights for sizes 3 and 4.'}],
  sections:[
   {id:'pick',title:'How to pick the right ball',items:['Go by the age group your child plays in, such as U10, not by height or by skill.','If your child plays up an age group, use the ball that team uses in games.',
    'Check the number printed near the valve: 3, 4 or 5.','For practice at home, the game size is the best choice. First touch and passing feel different with every size.',
    'A futsal ball is not a small soccer ball. It is heavier for its size and made to bounce low, and it is only for futsal.']},
   {id:'why',title:'Why young players use a smaller ball',items:['A smaller, lighter ball fits a smaller foot, so a child can strike through the middle of it.','The Laws of the Game let youth soccer change the size, weight and material of the ball.',
    'U.S. Soccer’s small-sided standards match the ball to the field and the number of players, so every child gets more touches.','England’s FA uses different bands: size 3 up to under-11, size 4 at under-12 and under-13, and size 5 from under-14.']}],
  faq:[{q:'What size soccer ball does a 7-year-old need?',a:'A size 3. In US youth standards every age group up to U8 plays with a size 3 ball.'},
   {q:'What size soccer ball for a 10-year-old?',a:'A size 4. U9 to U12 teams, which means players aged 9 to 12, use a size 4 in the U.S. Soccer and US Youth Soccer standards.'},
   {q:'What age uses a size 5 soccer ball?',a:'From U13, which means age 13 and under, upward. A size 5 is the full-size ball of the adult game: 27 to 28 inches around.'},
   {q:'Is a size 4 ball much smaller than a size 5?',a:'It is about 2 inches less around: 25 to 26 inches against 27 to 28. It is also lighter, at 11 to 13 ounces against 14 to 16.'},
   {q:'What size is a futsal ball?',a:'The Futsal Laws give 62 to 64 cm around and 400 to 440 g. That is close to a size 4 in width, but it is heavier and made to bounce less.'}],
  lessons:pick(['learn7_receive','learn7_carry','learn9_receive','bld_f_passtofeet']),links:[FIELD,AGES,TIME,HEAD,FUTSAL],
  picture:'soccer-ball-size-by-age-chart.png',pictureTitle:'Soccer ball size by age',pictureSub:'Size 3 to age 8 · Size 4 for 9 to 12 · Size 5 from 13'},

 {slug:'soccer-field-size-by-age',path:FIELD.path,crumb:'Field size by age',blurb:'Field, goal and game length for 4v4, 7v7, 9v9 and 11v11, in one chart',
  title:'Soccer Field Size by Age: Youth Dimensions Chart',h1:'Soccer field size by age',fields:true,
  description:'Youth soccer field dimensions by age group: 4v4, 7v7, 9v9 and 11v11 field sizes in yards, goal sizes, players and game length, with a source for each row.',
  lead:'A youth soccer field grows with the players. In the U.S. Soccer standards, under-8s play 4v4 on a field about 30 yards long, under-10s play 7v7 on about 60 yards, under-12s play 9v9 on about 75 yards, and from under-13 teams play 11v11 on a full-size field.',
  more:'The standards give a range, not one number, because parks and schools have different space. Your league picks a size inside the range.',
  tables:[
   {id:'chart',title:'Youth soccer field size chart',head:['Age group','Game','Players','Field length','Field width','Biggest goal','Game length','Ball','Source'],
    rows:[['U6, U7, U8','4v4','4, no goalkeeper','25 to 35 yd','15 to 25 yd','4 ft high, 6 ft wide','4 x 10 min','3','USSF'],
     ['U9, U10','7v7','7, with a goalkeeper','55 to 65 yd','35 to 45 yd','6.5 ft high, 18.5 ft wide','2 x 25 min','4','USSF'],
     ['U11, U12','9v9','9, with a goalkeeper','70 to 80 yd','45 to 55 yd','7 ft high, 21 ft wide','2 x 30 min','4','USSF'],
     ['U13, U14','11v11','11, with a goalkeeper','100 to 130 yd','50 to 100 yd','8 ft high, 24 ft wide','2 x 35 min','5','IFAB, USYS'],
     ['U15, U16','11v11','11, with a goalkeeper','100 to 130 yd','50 to 100 yd','8 ft high, 24 ft wide','2 x 40 min','5','IFAB, USYS'],
     ['U17 to U19','11v11','11, with a goalkeeper','100 to 130 yd','50 to 100 yd','8 ft high, 24 ft wide','2 x 45 min','5','IFAB, USYS']],
    note:`USSF = U.S. Soccer small-sided standards (field, goal, players, game length). IFAB = Laws of the Game, Law 1 (the full-size field and goal). USYS = US Youth Soccer playing rules, December 2025 (game length and ball from U13). U.S. Soccer recommends a smaller goal than the biggest one allowed: 6.5 x 12 ft for 7v7 and 6.5 x 18.5 ft for 9v9. ${LEAGUE}`},
   {id:'full',title:'Full-size field markings (11v11)',intro:'These are the same on every full-size field, whatever its length and width.',head:['Marking','Size','Source'],
    rows:[['Goal','8 yd wide, 8 ft high (7.32 m x 2.44 m)','IFAB'],['Penalty area','18 yd from each post and 18 yd into the field (16.5 m)','IFAB'],['Goal area','6 yd from each post and 6 yd into the field (5.5 m)','IFAB'],
     ['Penalty mark','12 yd from the goal line (11 m)','IFAB'],['Center circle','10 yd radius (9.15 m)','IFAB'],['Corner arc','1 yd radius (1 m)','IFAB'],['International games','110 to 120 yd long, 70 to 80 yd wide','IFAB']],
    note:'Laws of the Game, Law 1. The lines are part of the areas they mark, so a foul on the penalty area line is inside the penalty area.'}],
  sections:[
   {id:'small',title:'What is different on a small field',items:['A 4v4 field has no goalkeepers and no offside.','A 7v7 field has a build-out line in each half, halfway between the penalty area and the halfway line.',
    'A 9v9 field has no build-out line. It is a smaller copy of the full field, with offside from the halfway line.','The penalty area, goal area and center circle are smaller on 7v7 and 9v9 fields. Your league’s field diagram has the exact sizes.',
    'England’s FA uses different formats and sizes: 5v5 on about 40 x 30 yards, 7v7 on about 60 x 40 yards and 9v9 on about 80 x 50 yards.']},
   {id:'why',title:'Why kids do not play on a full field',items:['Fewer players on a smaller field means every child touches the ball more often.','Goals that fit the goalkeeper make saves possible, so shooting and goalkeeping both improve.',
    'Shorter distances keep the game about passing and moving instead of the longest kick.','The Laws of the Game allow youth soccer to change the size of the field and the goals, the length of the game and the number of players.']}],
  faq:[{q:'How big is a 7v7 soccer field?',a:'In the U.S. Soccer standards, 55 to 65 yards long and 35 to 45 yards wide, for under-9 and under-10 teams. The biggest goal allowed is 6.5 feet high and 18.5 feet wide.'},
   {q:'How big is a 9v9 soccer field?',a:'In the U.S. Soccer standards, 70 to 80 yards long and 45 to 55 yards wide, for under-11 and under-12 teams. The biggest goal allowed is 7 feet high and 21 feet wide.'},
   {q:'How big is a full-size soccer field?',a:'The Laws of the Game allow 100 to 130 yards long and 50 to 100 yards wide. For international games the range is 110 to 120 yards by 70 to 80 yards.'},
   {q:'How big is a U8 soccer field?',a:'In the U.S. Soccer standards, U6 to U8 teams play 4v4 on a field 25 to 35 yards long and 15 to 25 yards wide, with goals no bigger than 4 feet by 6 feet.'},
   {q:'How big is a soccer goal?',a:'A full-size goal is 8 yards wide and 8 feet high. Youth goals are smaller: at most 4 x 6 feet for 4v4, 6.5 x 18.5 feet for 7v7 and 7 x 21 feet for 9v9.'}],
  lessons:pick(['learn7_shape','prn_7_spread','learn9_shape','learn11_shape']),links:[BALL,AGES,BUILD,F7,F9,F11],
  picture:'soccer-field-size-by-age-chart.png',pictureTitle:'Soccer field size by age',pictureSub:'4v4, 7v7, 9v9 and 11v11 fields in yards'},

 {slug:'soccer-age-groups',path:AGES.path,crumb:'Age groups',blurb:'U6 to U19 explained: birth dates for each group and which game it plays',
  title:'Soccer Age Groups Explained: U6 to U19 Chart',h1:'Soccer age groups explained: U6 to U19',
  description:`What U8, U10 or U12 means in youth soccer: a ${SIZES_SEASON} age group chart from U6 to U19 with birth dates, game format, ball size and game length.`,
  lead:'In youth soccer, “U” means “under”, so a U10 team is for players aged 10 and under. Each age group has its own game: 4v4 up to U8, 7v7 at U9 and U10, 9v9 at U11 and U12, and 11v11 from U13.',
  more:`Which group a child joins depends on their date of birth and on the cut-off date their league uses. For the ${SIZES_SEASON} season the biggest US youth organizations moved the cut-off from January 1 to August 1.`,
  tables:[
   {id:'chart',title:`Soccer age group chart for the ${SIZES_SEASON} season`,intro:'Birth dates are for leagues that use the August 1 cut-off: US Youth Soccer, US Club Soccer and AYSO.',head:['Age group','Means','Born','Game','Ball','Game length','Source'],rows:AGE_ROWS,
    note:`Birth dates: the August 1 to July 31 cycle that US Youth Soccer, US Club Soccer and AYSO announced for ${SIZES_SEASON}. USSF = U.S. Soccer small-sided standards (game, ball, length up to U12). USYS = US Youth Soccer playing rules, December 2025 (ball and length from U13). AYSO writes the same groups as 6U, 8U, 10U and so on. ${LEAGUE}`}],
  sections:[
   {id:'how',title:'How to find your child’s age group',items:[`Find the season. The ${SIZES_SEASON} season runs from August 1, 2026 to July 31, 2027.`,'Find your child’s date of birth in the “Born” column of the chart.',
    'A child born on or after August 1 is in the younger group than a child born in July of the same year.','Ask the club which cut-off it uses. U.S. Soccer lets each member organization choose, so some leagues may still group by calendar year of birth.',
    'A child may usually play up in an older group if the club and the league agree.']},
   {id:'birthyear',title:'Birth-year and school-year groups',items:['From 2017 to the 2025-26 season, US youth soccer grouped players by calendar year of birth, January 1 to December 31. U.S. Soccer chose that to match international soccer.',
    `Under that system a U10 team in a season was for players who turned 10, or younger, in the year the season ended.`,
    `From ${SIZES_SEASON}, US Youth Soccer, US Club Soccer and AYSO group players from August 1 to July 31, which is close to a school year, so more classmates play together.`,
    'England’s FA also uses school years, and its formats are different: 3v3 at under-7, 5v5 at under-8 and under-9, 7v7 at under-10 and under-11, 9v9 at under-12 and under-13.']},
   {id:'formats',title:'Which game each age group plays',items:['U6, U7, U8: 4v4 with no goalkeepers, no offside and no heading. Four short quarters.','U9, U10: 7v7 with goalkeepers, a build-out line and no heading. Two halves of 25 minutes.',
    'U11, U12: 9v9. Offside from the halfway line. Two halves of 30 minutes.','U13 and older: 11v11 on a full-size field with a size 5 ball. Halves grow from 35 to 45 minutes.']}],
  faq:[{q:'What does U10 mean in soccer?',a:'Under 10: a team for players aged 10 and under. It is the same as AYSO’s 10U. Most players in a U10 team are 9 when the season starts.'},
   {q:'What age is U12 in soccer?',a:`Players aged 12 and under. For the ${SIZES_SEASON} season with an August 1 cut-off, that means born from August 1, 2014 to July 31, 2015.`},
   {q:'When do kids start playing 11v11?',a:'At U13 in the U.S. Soccer standards. Before that, children play 4v4, then 7v7 at U9 and U10, then 9v9 at U11 and U12.'},
   {q:'Did soccer age groups change for 2026?',a:`Yes. US Youth Soccer, US Club Soccer and AYSO moved from calendar-year groups to an August 1 to July 31 cycle, starting with the ${SIZES_SEASON} season.`},
   {q:'Can my child play in an older age group?',a:'Usually yes, if the club and the league agree. This is called playing up. Rules such as no heading at age 10 and under still follow the child’s own age in US Youth Soccer.'}],
  lessons:pick(['learn7_roles','learn9_shape','learn11_shape','learnf_roles31']),links:[BALL,FIELD,TIME,HEAD,F7,F9,F11,RULES],
  picture:'soccer-age-groups-chart.png',pictureTitle:'Soccer age groups',pictureSub:`U6 to U19 for the ${SIZES_SEASON} season`},
];
export const chartBySlug=(slug:string)=>CHARTS.find(c=>c.slug===slug);
