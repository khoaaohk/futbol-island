/**
 * laws-1863 · "Still a rule?" (Oct 9 2026 motion pass). Eight lines from the FA's 1863 Laws, in kid-sized words; the visitor sorts
 * each one into STILL IN FORCE or AMENDED before reading the living rulebook. Every 1863 line is checked against the Laws as
 * settled on 1 December 1863 (Wikisource, "Laws of the Game (1863) (as submitted for adoption)"); every "today" line against the
 * IFAB Laws of the Game (Laws 1, 4, 8, 12, 15) — sources in SORT_SOURCES and in LAW_SOURCES. `thread`/`year` open the matching
 * rule in the rulebook at the year it changed (or today).
 */
import {TODAY} from './laws';
export type SortCard={id:string;law:string;then:string;kept:boolean;now:string;short:string;thread?:string;year?:number};
export const SORT_CARDS:SortCard[]=[
 {id:'kickoff',law:'Law III',short:'Kick-off after a goal',then:'After a goal, the team that let it in kicks off.',kept:true,
  now:'Still a rule! Today’s Law 8 says the same: after a goal, the other team kicks off.'},
 {id:'height',law:'Laws I & IV',short:'Goal at any height',then:'There is no crossbar. A ball over the posts, at any height, is a goal.',kept:false,
  now:'Changed. A tape went across the posts in 1866, and a solid crossbar in 1882.',thread:'goal',year:1866},
 {id:'trip',law:'Law X',short:'No tripping or hacking',then:'No tripping, and no hacking (kicking an opponent’s legs).',kept:true,
  now:'Still a rule! Tripping or kicking an opponent is a foul in today’s Law 12.',thread:'fair',year:TODAY},
 {id:'ends',law:'Law III',short:'Swap ends after a goal',then:'The two teams swap ends after every goal.',kept:false,
  now:'Changed. Today the teams swap ends only once, at half-time (Law 8).'},
 {id:'offside',law:'Law VI',short:'In front of the ball = offside',then:'Anyone in front of the ball when a team-mate kicks it is offside.',kept:false,
  now:'Changed. From 1866 you could pass forward, if enough opponents were in front of you.',thread:'offside',year:1866},
 {id:'ten',law:'Law II',short:'10 yards at kick-off',then:'At kick-off, the other team stays 10 yards from the ball.',kept:true,
  now:'Still a rule! Today it is 9.15 metres, which is 10 yards (Law 8).'},
 {id:'throw',law:'Law V',short:'Race for the throw-in',then:'When the ball goes out, whoever touches it first throws it in.',kept:false,
  now:'Changed in 1873: the throw-in goes to the team that did NOT kick it out. Since 1883, with both hands (Law 15).',thread:'throw',year:1873},
 {id:'nails',law:'Law XIII',short:'No nails in boots',then:'No nails or iron plates sticking out of your boots.',kept:true,
  now:'Still a rule! Today’s Law 4: you may not wear anything dangerous.'},
];
export const SORT_SOURCES:{title:string;url:string}[]=[
 {title:'Wikisource · Laws of the Game (1863), as settled on 1 December 1863',url:'https://en.wikisource.org/wiki/Laws_of_the_Game_(1863)_(as_submitted_for_adoption)'},
 {title:'IFAB Laws of the Game · Law 4 The Players’ Equipment',url:'https://www.theifab.com/laws/latest/the-players-equipment/'},
 {title:'IFAB Laws of the Game · Law 8 The Start and Restart of Play',url:'https://www.theifab.com/laws/latest/the-start-and-restart-of-play/'},
];
/** What a score means, in a sentence a 7-year-old can read. */
export function sortVerdict(right:number,total:number){
 if(right===total)return 'Every one right! You know your football history.';
 if(right>=total-2)return 'Nearly all right! A few rules surprised you.';
 return 'The Laws surprised you! That’s what the rulebook below is for.';
}
