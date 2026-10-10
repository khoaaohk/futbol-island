/**
 * laws-1863 "The Living Rulebook": six rules followed from the FA's first printed Laws (December 1863) to today's IFAB Laws.
 * Every 1863 line quotes (or trims) the 1863 wording; later lines are short, kid-sized summaries; every "why" is true history.
 * Sources are listed in LAW_SOURCES and shown in the experience. No game fiction in here.
 */
export const FIRST_YEAR=1863,TODAY=2026;

export type LawVersion={year:number;text:string;why:string;old?:boolean};
export type LawThread={id:string;title:string;lawThen:string;lawNow:string;versions:LawVersion[]};

export const THREADS:LawThread[]=[
 {id:'players',title:'Of the Players',lawThen:'Not in the 1863 Laws',lawNow:'Law 3',versions:[
  {year:1863,old:true,text:'The Laws say nothing of how many players shall play on each side.',
   why:'There was no number! Clubs agreed how many players to bring before each match.'},
  {year:1897,text:'A match shall be played by eleven players on each side.',
   why:'In 1897 the Laws wrote down eleven players a side for the first time, and 90 minutes for a match.'},
  {year:TODAY,text:'Each team has up to 11 players, and one must be the goalkeeper. A match cannot start or carry on if a team has fewer than seven.',
   why:'Eleven has stayed for over 125 years. Today’s Law 3 also explains substitutes.'},
 ]},
 {id:'goal',title:'Of the Goal',lawThen:'Laws I & IV',lawNow:'Laws 1 & 10',versions:[
  {year:1863,old:true,text:'The goal shall be defined by two upright posts, eight yards apart, without any tape or bar across them. A goal is won when the ball passes between the posts, at whatever height.',
   why:'No crossbar! A ball kicked sky-high between the posts still counted as a goal.'},
  {year:1866,text:'A tape is stretched across the posts, eight feet from the ground. A goal is won when the ball passes between the posts and under the tape.',
   why:'“At whatever height” caused arguments. In 1866 a tape gave the goal a top.'},
  {year:1882,text:'A solid crossbar is fixed across the posts, eight feet from the ground. A goal is won when the ball passes between the posts and under the bar.',
   why:'A tape can sag or blow in the wind. In 1882 the crossbar became a must.'},
  {year:TODAY,text:'The posts are 7.32 metres apart and the crossbar is 2.44 metres high. A goal counts when the whole ball crosses the whole goal line, between the posts and under the crossbar.',
   why:'7.32 m is 8 yards and 2.44 m is 8 feet. The goal is still the size it was in the 1860s.'},
 ]},
 {id:'hands',title:'Of Hands',lawThen:'Laws VIII, IX, XI & XII',lawNow:'Law 12',versions:[
  {year:1863,old:true,text:'A player who makes a fair catch may mark the spot with his heel and take a free kick. No player shall run with the ball, throw it, or take it from the ground with his hands.',
   why:'Catching was allowed, but running with the ball in your hands was not. That is where football and rugby split.'},
  {year:1866,text:'Catching the ball no longer wins a free kick. No player shall run with the ball, throw it, or take it from the ground with his hands.',
   why:'In 1866 the fair catch was taken out of the Laws. Football was becoming a game for the feet.'},
  {year:1871,text:'No player shall use his hands, except the goalkeeper, who may use his hands to protect his goal.',
   why:'In 1871 the Laws named a goalkeeper for the first time: one player allowed to use their hands.'},
  {year:1912,text:'No player shall use his hands, except the goalkeeper, inside his own penalty area only.',
   why:'Before 1912 keepers could handle the ball far from goal. Now their hands stop at the edge of the box.'},
  {year:1992,text:'Only the goalkeeper, inside the penalty area, may handle the ball, and not when a team-mate deliberately kicks it back to them.',
   why:'Since 1992, a goalkeeper may not pick up the ball when a team-mate deliberately kicks it back to them. The change stopped teams wasting time and made the game faster.'},
  {year:TODAY,text:'Only the goalkeeper, inside their own penalty area, may handle the ball. Anyone else who handles it gives away a free kick, or a penalty kick in their own penalty area.',
   why:'It is why today’s keepers practise passing and receiving with their feet.'},
 ]},
 {id:'offside',title:'Of Offside',lawThen:'Law VI',lawNow:'Law 11',versions:[
  {year:1863,old:true,text:'When a player has kicked the ball, any one of the same side who is nearer to the opponent’s goal line is out of play.',
   why:'Anyone in front of the ball was offside, like in rugby. You could only pass sideways or backwards, so players dribbled the ball in a crowd.'},
  {year:1866,text:'A player is out of play if he is in front of the ball, unless there are at least three of his opponents between him and their goal line.',
   why:'Now a forward pass was allowed! Teams soon began to pass the ball, not only dribble it.'},
  {year:1925,text:'A player is out of play if he is in front of the ball, unless there are at least two of his opponents between him and their goal line.',
   why:'Defenders had become very good at catching attackers offside. With two instead of three, more goals were scored.'},
  {year:1990,text:'A player is offside if he is in front of the ball and nearer to the goal line than the second-last opponent. Level with that opponent is onside.',
   why:'In 1990 the Law gave the attacker the benefit: level is onside.'},
  {year:TODAY,text:'You are offside if, when a team-mate plays the ball, you are in the opponents’ half, nearer their goal line than both the ball and the second-last opponent, and you join in the play.',
   why:'Offside stops players just waiting by the other goal. You cannot be offside from a goal kick, a throw-in or a corner kick.'},
 ]},
 {id:'throw',title:'Of the Throw-in',lawThen:'Law V',lawNow:'Law 15',versions:[
  {year:1863,old:true,text:'When the ball is in touch, the first player who touches it shall throw it from the point where it left the ground, at right angles with the boundary line.',
   why:'It was a race! Whoever reached the ball first won the throw, and one hand was fine.'},
  {year:1873,text:'When the ball is in touch, a player of the side opposite to the one that kicked it out shall throw it from the point where it left the ground.',
   why:'No more racing for the ball. From 1873 the throw went to the team that did NOT kick it out, the way it still does.'},
  {year:1883,text:'When the ball is in touch, a player of the side opposite to the one that kicked it out shall throw it in with both hands, from the point where it left the ground.',
   why:'In 1883 the English and Scottish rules were joined up, and Scotland’s two-handed throw-in won. Every player still throws with both hands.'},
  {year:TODAY,text:'When the whole ball crosses the touch line, the team that did not touch it last throws it in, with both hands, from behind and over the head.',
   why:'Today the ball must come from behind and over your head, with your feet on or behind the touch line.'},
 ]},
 {id:'fair',title:'Of Fair Play',lawThen:'Law X',lawNow:'Laws 5 & 12',versions:[
  {year:1863,old:true,text:'Neither tripping nor hacking shall be allowed, and no player shall use his hands to hold or push his adversary.',
   why:'Hacking means kicking an opponent’s shins. The Blackheath club wanted to keep hacking and carrying, so it left the FA. There was no referee: the two captains settled arguments.'},
  {year:1891,text:'The referee, on the field, is in charge, helped by two linesmen. A foul near the goal can give a penalty kick.',
   why:'The penalty kick joined the Laws in 1891. The idea came from William McCrum, a goalkeeper from Ireland.'},
  {year:1970,text:'The referee is in charge and may show a yellow card as a warning, or a red card to send a player off.',
   why:'Yellow and red cards were first used at the 1970 World Cup in Mexico. Cards showed every player and fan the referee’s decision, whatever language they spoke.'},
  {year:2018,text:'The referee is in charge. A video assistant referee may help with clear mistakes about goals, penalties, straight red cards and mistaken identity.',
   why:'The video assistant referee (VAR) was first used at a men’s World Cup in 2018, in Russia. The referee on the pitch still makes the final decision.'},
  {year:TODAY,text:'Tripping, kicking, pushing or holding an opponent gives a free kick to the other team, or a penalty kick inside the penalty area. The referee is in charge.',
   why:'Tripping has been against the Laws since 1863. Some rules never change.'},
 ]},
];

/** The stops on the year rule, with the headline the dock prints for each (1886 changes no thread: it changes who keeps the Laws). */
export const MILESTONES:{year:number;headline:string}[]=[
 {year:1863,headline:'The FA writes down one set of rules'},
 {year:1866,headline:'A tape on the goal, no more catching, a new offside'},
 {year:1871,headline:'The goalkeeper arrives'},
 {year:1873,headline:'The throw-in goes to the other team'},
 {year:1882,headline:'The crossbar becomes a must'},
 {year:1883,headline:'Two hands for the throw-in'},
 {year:1886,headline:'The IFAB starts looking after the Laws'},
 {year:1891,headline:'A referee takes charge, and the penalty kick arrives'},
 {year:1897,headline:'Eleven players a side'},
 {year:1912,headline:'Keepers’ hands stop at the penalty area'},
 {year:1925,headline:'Offside: two defenders, not three'},
 {year:1970,headline:'Yellow and red cards'},
 {year:1990,headline:'Level is onside'},
 {year:1992,headline:'The back-pass rule'},
 {year:2018,headline:'VAR at the World Cup'},
 {year:TODAY,headline:'Today’s Laws of the Game'},
];

export function versionIndexAt(t:LawThread,year:number){let i=0;t.versions.forEach((v,k)=>{if(v.year<=year)i=k;});return i;}
export function milestoneAt(year:number){let m=MILESTONES[0];for(const x of MILESTONES)if(x.year<=year)m=x;return m;}
export const yearLabel=(y:number)=>y>=TODAY?'Today':String(y);
/** How the typeface of a printed rule follows its own era: letterpress serif, mid-century book face, modern sans. */
export const eraOf=(y:number):'letterpress'|'book'|'modern'=>y<1900?'letterpress':y<1990?'book':'modern';

export type Token={w:string;kind:'same'|'del'|'add'};
/** Word-level diff (LCS) so a rule rewrites only the words that really changed. Texts are short (< 60 words). */
export function diffWords(a:string,b:string):Token[]{
 const A=a?a.split(/\s+/):[],B=b.split(/\s+/),n=A.length,m=B.length;
 const L:number[][]=Array.from({length:n+1},()=>new Array(m+1).fill(0));
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=A[i]===B[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
 const out:Token[]=[];let i=0,j=0;
 while(i<n&&j<m){if(A[i]===B[j]){out.push({w:B[j],kind:'same'});i++;j++;}else if(L[i+1][j]>=L[i][j+1])out.push({w:A[i++],kind:'del'});else out.push({w:B[j++],kind:'add'});}
 while(i<n)out.push({w:A[i++],kind:'del'});while(j<m)out.push({w:B[j++],kind:'add'});
 return out;
}

export const LAW_SOURCES:{title:string;url:string}[]=[
 {title:'Wikisource · Laws of the Game (1863), as settled on 1 December 1863',url:'https://en.wikisource.org/wiki/Laws_of_the_Game_(1863)_(as_submitted_for_adoption)'},
 {title:'Wikisource · Laws of the Game (1897)',url:'https://en.wikisource.org/wiki/Laws_of_the_Game_(1897)'},
 {title:'Wikisource · The Sporting Life (1863), Football Association meeting (Blackheath leaves)',url:'https://en.wikisource.org/wiki/The_Sporting_Life/1863/Football_Association_Meeting'},
 {title:'National Football Museum · The Laws of the Game, 1863',url:'https://nationalfootballmuseum.com/items/the-laws-of-the-game-1863/'},
 {title:'Wikipedia · Laws of the Game (association football)',url:'https://en.wikipedia.org/wiki/Laws_of_the_Game_(association_football)'},
 {title:'Wikipedia · 1860s in association football (1866 tape, fair catch, offside)',url:'https://en.wikipedia.org/wiki/1860s_in_association_football'},
 {title:'Wikipedia · Offside (association football)',url:'https://en.wikipedia.org/wiki/Offside_(association_football)'},
 {title:'Wikipedia · Goalkeeper (association football) (1871, 1912)',url:'https://en.wikipedia.org/wiki/Goalkeeper_(association_football)'},
 {title:'Wikipedia · Fair catch',url:'https://en.wikipedia.org/wiki/Fair_catch'},
 {title:'Wikipedia · Throw-in (1873: to the other team; 1883: both hands)',url:'https://en.wikipedia.org/wiki/Throw-in'},
 {title:'Wikipedia · The Football Association (formed 26 October 1863, Freemasons’ Tavern)',url:'https://en.wikipedia.org/wiki/The_Football_Association'},
 {title:'Wikipedia · Referee (1891: referee in charge, two linesmen)',url:'https://en.wikipedia.org/wiki/Referee'},
 {title:'17 Laws Guy · The Day the Goal Broke (tape 1866, crossbar 1882)',url:'https://17lawsguy.substack.com/p/the-day-the-goal-broke'},
 {title:'IFAB Laws of the Game · Law 1 The Field of Play',url:'https://www.theifab.com/laws/latest/the-field-of-play/'},
 {title:'IFAB Laws of the Game · Law 3 The Players',url:'https://www.theifab.com/laws/latest/the-players/'},
 {title:'IFAB Laws of the Game · Law 10 Determining the Outcome of a Match',url:'https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/'},
 {title:'IFAB Laws of the Game · Law 11 Offside',url:'https://www.theifab.com/laws/latest/offside/'},
 {title:'IFAB Laws of the Game · Law 12 Fouls and Misconduct',url:'https://www.theifab.com/laws/latest/fouls-and-misconduct/'},
 {title:'IFAB Laws of the Game · Law 15 The Throw-in',url:'https://www.theifab.com/laws/latest/the-throw-in/'},
];
