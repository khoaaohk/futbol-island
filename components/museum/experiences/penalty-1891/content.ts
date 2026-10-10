import type {Era,Zone,Result} from './model';
/**
 * penalty-1891 · words. The case's own facts come from lib/endgame/museum.ts (rendered from `exhibit.facts`); everything here
 * is extra, checked on Oct 5 2026 and cited in SOURCES. Keep it short and clear for ages 7–14.
 */
export const HISTORY:readonly string[]=[
 'William McCrum came from Milford, County Armagh, in Ireland. He wanted to stop defenders fouling attackers to stop a goal.',
 'The Irish Football Association sent his idea to the IFAB in 1890, and it became a Law in 1891.',
 'In 1891 the kick could be taken from anywhere 12 yards (about 11 m) from the goal line, and the goalkeeper could come out up to 6 yards (5.5 m).',
 'There was no penalty box yet: a line went right across the pitch 12 yards out, a dotted line 18 yards out, and a 6-yard arc was drawn from each post. Switch to 1891 and look at the grass.',
 'The penalty spot arrived in 1902. Since 1905 the goalkeeper has had to stay on the goal line.',
 'The first penalty in the English Football League was scored for Wolves against Accrington on 14 September 1891.',
];
export const RESEARCH:readonly string[]=[
 'A study of 286 penalties found that keepers saved none of the kicks into the top third of the goal, but about 1 in 5 of the low kicks.',
 'A study of 311 penalties found that keepers dived left or right 94% of the time, and stayed in the middle only about 6% of the time.',
];
export const MODEL_NOTE='The blue “keeper reach” zone is a simple model of where a keeper can get to before the ball does. It is made up to show the idea, not measured from real keepers. The goal size and the 11 m are real.';
export const SOURCES:readonly {title:string;url:string}[]=[
 {title:'Wikipedia · William McCrum',url:'https://en.wikipedia.org/wiki/William_McCrum'},
 {title:'Home of the Penalty Kick, Milford',url:'https://homeofpenaltykick.com/'},
 {title:'Scientific Reports (2022) · Penalty feet positioning rule modification and goalkeepers’ diving (history of the rule: 1891, 1902, 1905)',url:'https://www.nature.com/articles/s41598-022-21508-6'},
 {title:'Sheffield Home of Football · Penalties',url:'https://sheffieldhomeoffootball.org/museum/penalties'},
 {title:'Wolves · Club records',url:'https://www.wolves.co.uk/club/history/club-records/'},
 {title:'Wikipedia · Penalty kick (IFAB approval, 2 June 1891; the Stoke v Notts County handball)',url:'https://en.wikipedia.org/wiki/Penalty_kick_(association_football)'},
 {title:'Wikipedia · Jack Hendry (the goal-line handball, FA Cup quarter-final, 14 February 1891)',url:'https://en.wikipedia.org/wiki/Jack_Hendry_(footballer,_born_1867)'},
 {title:'Wikipedia · Direct free kick (all free kicks were indirect until 1903)',url:'https://en.wikipedia.org/wiki/Direct_free_kick'},
 {title:'Bar-Eli & Azar (2009) · Penalty kicks in soccer: shooting strategies and goalkeepers’ preferences',url:'https://www.researchgate.net/publication/263266318_Penalty_kicks_in_soccer_An_empirical_analysis_of_shooting_strategies_and_goalkeepers%27_preferences'},
 {title:'Bar-Eli et al. (2007) · Action bias among elite soccer goalkeepers: the case of penalty kicks',url:'https://ideas.repec.org/p/pra/mprapa/4477.html'},
 {title:'Football-Stadiums.co.uk · Football pitch markings: history (the 1891 12- and 18-yard lines, 6-yard arcs)',url:'https://www.football-stadiums.co.uk/articles/football-pitch-markings/'},
 {title:'IFAB Laws of the Game · Law 1 The Field of Play (goal 7.32 m × 2.44 m)',url:'https://www.theifab.com/laws/latest/the-field-of-play/'},
];
export const ZONE_TEXT:Record<Zone,string>={
 outside:'That’s outside the goal. Bring your aim back between the posts.',
 'top-corner':'Top corner: the keeper can’t get there in time. But aim a little off and it flies over or wide.',
 'low-corner':'Low corner: too far for the keeper, and a low ball can’t fly over the bar.',
 middle:'The middle: it beats a keeper who dives, but one who stays will catch it.',
 near:'Close to the keeper: if he dives this way, he gets there.',
};
export const RESULT_TEXT:Record<Result,{big:string;line:string}>={
 goal:{big:'Goal!',line:'The ball beat the keeper’s reach.'},
 saved:{big:'Saved!',line:'The ball went where the keeper could get to.'},
 post:{big:'Post!',line:'Too close to the edge. The wobble took it onto the post.'},
 bar:{big:'Crossbar!',line:'Too close to the top. The wobble took it onto the bar.'},
 wide:{big:'Wide',line:'The wobble took it past the post. Aim a bit further in.'},
 over:{big:'Over the bar',line:'The wobble took it over. Low shots can’t do that.'},
};
export const ERA_TEXT={
 today:'Today’s rule: the keeper stays on the goal line until you kick.',
 '1891':'1891 rule: the keeper may come out 6 yards (5.5 m). Closer to you, he blocks more of the goal.',
};
/** The same kick under the other rules (the replay button): what changed and why. Uses the same landing spot and the same dive. */
export function compareText(then:Era,before:Result,after:Result):string{
 const goal=(r:Result)=>r==='goal',now=then==='1891'?'1891':'today';
 if(goal(before)&&after==='saved')return now==='1891'?'In 1891 the keeper could stand 6 yards out, close to you, so he covered much more of the goal. Your goal became a save!':'Same kick, same dive. Today the keeper has to stay on his line, so he reached it.';
 if(before==='saved'&&goal(after))return now==='today'?'Today the keeper must stay on his line, far from you, so the same kick goes in. That is why the rule changed in 1905.':'Same kick, same dive: this time the keeper couldn’t get there.';
 if(goal(before)&&goal(after))return 'This kick beats the keeper under both rules: it went where he couldn’t reach.';
 if(before==='saved'&&after==='saved')return 'Saved under both rules: it went too close to the keeper.';
 return 'A miss is a miss under any rules. The wobble did that, not the keeper.';
}
export const ERA_NAME:Record<Era,string>={'1891':'1891 rules',today:'today’s rules'};
/**
 * The intro story (Oct 9 2026 story pass): how the penalty came to be, in four short beats before the visitor steps up. Checked:
 * free kicks were all indirect until 1903 (you could not score straight from one); McCrum's idea went to the IFAB in 1890 and was
 * deferred; Notts County 1–0 Stoke, FA Cup quarter-final, 14 February 1891: Jack Hendry handled on the goal line in the last
 * seconds, Notts County put all eleven men on the line for the free kick and Stoke did not score; the IFAB approved the penalty on
 * 2 June 1891. Sources in SOURCES.
 */
export const STORY:readonly {when:string;head:string;text:string;icon:'foul'|'idea'|'hand'|'law'}[]=[
 {when:'The 1880s',head:'Fouls that stopped goals',text:'An attacker runs through. A defender trips him, or handles the ball. The attackers got a free kick, but back then you could not score straight from a free kick.',icon:'foul'},
 {when:'1890 · Milford, Ireland',head:'A goalkeeper’s idea',text:'William McCrum kept goal for Milford. His idea: a foul near the goal gives a free shot from 12 yards. Just the kicker against the keeper.',icon:'idea'},
 {when:'14 February 1891',head:'A handball on the line',text:'FA Cup quarter-final, Stoke were losing 1–0 to Notts County. In the last seconds a Notts County defender handled the ball on his goal line. For the free kick, Notts County put all eleven players on the line. No goal.',icon:'hand'},
 {when:'2 June 1891',head:'It becomes a Law',text:'The IFAB said yes. From the next season a foul near the goal meant a penalty kick. Now it’s your turn to take one.',icon:'law'},
];
/** Quick check (one per round of five, in turn): what the kicks and the story taught. */
export const CHECKS:readonly {q:string;options:readonly string[];answer:number;why:string}[]=[
 {q:'Why must today’s keeper stay on his line until the kick?',options:['So he can’t rush out and cover more of the goal','So he doesn’t get tired','Because the goal got bigger'],answer:0,
  why:'Six yards out, the keeper blocks much more of the goal. Since 1905 he has had to stay on his line, so the kicker gets a fair chance.'},
 {q:'Where do keepers save the fewest penalties?',options:['Low, near the middle','High, in the corners','Right at the keeper'],answer:1,
  why:'In a study of 286 penalties, keepers saved none of the kicks into the top third of the goal. But aim too high and it can fly over.'},
 {q:'Who had the idea for the penalty kick?',options:['A referee','A striker','A goalkeeper'],answer:2,
  why:'William McCrum, a goalkeeper from Milford in Ireland. Funny: his idea gave the kicker a big chance against keepers like him.'},
];
