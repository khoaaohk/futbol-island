import type {MuseumSource} from '@/lib/endgame/museum';
import type {CamId} from './model';
/**
 * offside-rules · words (Oct 14 2026 redo). Every date is checked against Wikipedia "Offside (association football)" (which quotes
 * the FA's 1863 and 1866 texts, the 1907 and 1925 changes, the Football League goal totals, 1990's level rule, no offside from a
 * corner since 1883 or a throw-in since 1920, and the 2005 note that hands and arms don't count) and IFAB Law 11.
 */
export const MILESTONES:readonly {when:string;head:string;text:string}[]=[
 {when:'1863',head:'The first FA Laws',text:'Very strict: when a teammate kicked the ball, anyone nearer the opponents’ goal line was out of play. Players mostly dribbled.'},
 {when:'1866',head:'Three opponents',text:'You were onside if at least three opponents were between you and their goal line, so a forward pass became possible.'},
 {when:'1907',head:'Not in your own half',text:'From now on nobody could be offside in their own half.'},
 {when:'1925',head:'Two opponents',text:'Three became two. In the Football League, 4,700 goals were scored in 1924–25 and 6,373 in 1925–26, from the same number of games.'},
 {when:'1990',head:'Level is onside',text:'A player level with the second-last opponent became onside, to help the attacking team.'},
 {when:'Today',head:'Law 11',text:'Hands and arms don’t count. You can’t be offside straight from a goal kick, a throw-in or a corner kick.'},
];
export const BEATS=[
 {when:'1863',head:'In front of the ball = out',text:'The first FA Laws: anyone ahead of the ball when a teammate kicked it was out of play.'},
 {when:'1866–1990',head:'One cam at a time',text:'Three opponents, then your own half, then two opponents, then level is onside.'},
 {when:'Your job',head:'Run the line',text:'Turn the era dial, slide the players, pull the pass lever. Watch the flag. Then open the judge.'},
] as const;
/** The cams in the judge drum, bottom to top: their name and what they check, in one line each. */
export const CAM_TEXT:Record<CamId,{n:string;name:string;since:string;line:string;short:string}>={
 ball:{n:'1',name:'Ball cam',since:'Since 1863',line:'Are you nearer their goal line than the ball? If not, you are onside.',short:'In front of the ball?'},
 count:{n:'2',name:'Counting wheel',since:'Since 1866',line:'Counts the opponents between you and their goal line: 3 needed in 1866, 2 since 1925.',short:'Counts opponents: 3, then 2'},
 half:{n:'3',name:'Halfway stop',since:'Since 1907',line:'In your own half you can never be offside.',short:'Own half: never offside'},
 level:{n:'4',name:'Level shim',since:'Since 1990',line:'An opponent level with you counts for you, so level is onside.',short:'Level is onside'},
};
export const KID_RULE='Today: when a teammate passes, you are offside if you are in the other team’s half and nearer their goal line than the ball AND the second-last opponent (usually the goalkeeper is the last). Level is fine. It only counts if you then join in the play.';
export const QUIZ:readonly {q:string;options:readonly string[];answer:number;why:string}[]=[
 {q:'In 1925 the law changed from three opponents to how many?',options:['Two','One','Four'],answer:0,why:'Two. Strikers could stand nearer the goal, and goals jumped from 4,700 to 6,373 the next season.'},
 {q:'Today, a striker exactly level with the second-last defender is…',options:['Onside','Offside'],answer:0,why:'Onside. Since 1990, level is onside: that is the level shim in the judge.'},
 {q:'Since 1907, where can you never be offside?',options:['In your own half','In the penalty area','Near the corner flag'],answer:0,why:'In your own half. That is the halfway stop.'},
];
export const MODEL_NOTE='The machine is a drawing made for this museum: the players and passes are made up, and the rails are not to scale. The rules it uses are the real Laws of each year.';
export const SOURCES:readonly MuseumSource[]=[
 {title:'Wikipedia · Offside (association football)',url:'https://en.wikipedia.org/wiki/Offside_(association_football)'},
 {title:'IFAB Laws of the Game · Law 11 Offside',url:'https://www.theifab.com/laws/latest/offside/'},
];
