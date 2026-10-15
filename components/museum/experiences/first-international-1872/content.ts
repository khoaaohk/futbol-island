import type {MuseumSource} from '@/lib/endgame/museum';
/**
 * first-international-1872 · words (Oct 14 2026). Checked against Wikipedia "1872 Scotland v England football match" (date, ground,
 * 0-0, 4,000 spectators, the 1-1-8 and 2-2-6, all-Queen's Park Scotland, The Graphic's report), "Hamilton Crescent" (still the
 * West of Scotland Cricket Club's ground; the 2002 plaque) and "Passing (association football)" (The Graphic quote).
 */
export const STORY:readonly {when:string;head:string;text:string}[]=[
 {when:'30 Nov 1872',head:'Partick, Glasgow',text:'Scotland play England at Hamilton Crescent, the West of Scotland Cricket Club’s ground. It is the first official international football match.'},
 {when:'Kick-off',head:'Eight forwards',text:'England line up with 1 back, 1 half-back and 8 forwards. Scotland, all Queen’s Park players, play 2 backs, 2 half-backs and 6 forwards.'},
 {when:'Full time',head:'0–0',text:'About 4,000 people watch a goalless draw.'},
 {when:'Two weeks later',head:'“Adepts in passing”',text:'The Graphic said England had more individual skill, but the Scots seemed to be “adepts in passing the ball”.'},
];
export const GRAPHIC_QUOTE='The Southrons, however, did not play to each other so well as their opponents, who seem to be adepts in passing the ball.';
export const WHY_PASS='A pass moves the ball faster than any runner, and one defender can only mark one player. Spread out, and the ball can go round them.';
export const MODEL_NOTE='The analyser plays made-up moves to show the two styles; the real match ended 0–0. Its speeds are round numbers (a runner with the ball 5 m a second, a pass 14 m a second), not measurements from 1872. The formation numbers are how historians describe the line-ups.';
export const QUIZ:readonly {q:string;options:readonly string[];answer:number;why:string}[]=[
 {q:'England lined up 1-1-8 in 1872. How many forwards is that?',options:['1','8','11'],answer:1,why:'Count from your own goal: 1 back, 1 half-back, 8 forwards. Almost the whole team attacked.'},
 {q:'Scotland played 2-2-6. What did the newspaper say they were good at?',options:['Long solo dribbles','Diving headers','Passing the ball'],answer:2,why:'The Graphic called the Scots “adepts in passing the ball”.'},
 {q:'On the analyser, which passes worked best?',options:['Short, sure passes to a free teammate','The longest kick possible','No passes at all'],answer:0,
  why:'Too short and nobody is in reach; too long and the heavy ball is a 50-50. Find the free teammate close enough to reach.'},
];
export const SOURCES:readonly MuseumSource[]=[
 {title:'Wikipedia · 1872 Scotland v England football match',url:'https://en.wikipedia.org/wiki/1872_Scotland_v_England_football_match'},
 {title:'Wikipedia · Hamilton Crescent',url:'https://en.wikipedia.org/wiki/Hamilton_Crescent'},
 {title:'Wikipedia · Passing (association football)',url:'https://en.wikipedia.org/wiki/Passing_(association_football)'},
 {title:'Wikipedia · Formation (association football)',url:'https://en.wikipedia.org/wiki/Formation_(association_football)'},
];
