/**
 * Sources behind the Coral Cay ball lessons (Sep 29 2026). Read by tests/coral-cay-balls.cjs and
 * docs/ball-hunt-coral-cay-2026-09-29.md only; the island and the lesson card never import it (no bundle cost).
 * Laws are cited from the IFAB (11-a-side), FIFA Beach Soccer and FIFA Futsal Laws of the Game; coaching points from
 * the FIFA Training Centre and national associations; health points from paediatric and sleep medicine bodies.
 */
export type BallHuntSource={title:string;url:string};
const IFAB=(law:string,slug:string):BallHuntSource=>({title:`IFAB Laws of the Game · ${law}`,url:`https://www.theifab.com/laws/latest/${slug}/`});
const BEACH_LAWS:BallHuntSource={title:'FIFA Beach Soccer Laws of the Game 2024-25',url:'https://www.the-aiff.com/media/uploads/2024/11/Beach-Soccer-Laws-of-the-Game-2024-25.pdf'};
const BEACH_MANUAL:BallHuntSource={title:'FIFA Training Centre · Beach Soccer Coaching Manual',url:'https://www.fifatrainingcentre.com/en/environment/resources/beach-soccer/beach-soccer-manual.php'};

export const BALL_HUNT_SOURCES:Record<string,BallHuntSource[]>={
 'cay-warmup':[{title:'Rössler et al. (2018) · Sports Medicine: multinational cluster-randomised trial of “11+ Kids”',url:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5948238/'},{title:'FIFA 11+ Kids manual',url:'https://ubortho.com/wp-content/uploads/2020/02/FIFA-11-for-kids.pdf'}],
 'cay-line':[IFAB('Law 9 The Ball In and Out of Play','the-ball-in-and-out-of-play')],
 'cay-bank-pad':[{title:'Carey et al. (2001) · Footedness in world soccer: an analysis of France ’98 · Journal of Sports Sciences',url:'https://pubmed.ncbi.nlm.nih.gov/11695507/'}],
 'cay-bank-kick':[{title:'FIFA Training Centre · Goalkeeping: throws',url:'https://www.fifatrainingcentre.com/en/game/tournaments/u20fwwc/group-stage-review/8-goalkeeping-throws.php'}],
 'manhole-causeway':[IFAB('Law 5 The Referee (advantage)','the-referee')],
 'cay-arch':[IFAB('Law 12 Fouls and Misconduct (cautions: delaying the restart of play)','fouls-and-misconduct'),{title:'FIFA Training Centre · Controlled possession (grassroots)',url:'https://www.fifatrainingcentre.com/en/practice/grassroots/4-to-8/controlled-possession.php'}],
 'sky-causeway':[{title:'Asai et al. (2007) · Fundamental aerodynamics of the soccer ball · Sports Engineering',url:'https://www.researchgate.net/publication/225711147_Fundamental_aerodynamics_of_the_soccer_ball'},IFAB('Law 8 The Start and Restart of Play (choosing ends)','the-start-and-restart-of-play')],
 'cay-buoy':[{title:'FIFA Training Centre · Defending corners: zonal or player-to-player?',url:'https://www.fifatrainingcentre.com/en/game/game-analysis/set-plays/corners/defending-corners-zonal-or-player-to-player.php'},{title:'FIFA Training Centre · Beach soccer: mixed marking',url:'https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-3/mixed-marking.php'}],
 'cay-barefoot':[BEACH_LAWS,BEACH_MANUAL],
 'cay-no-offside':[BEACH_LAWS,{title:'FIFA · Beach Soccer rules guide',url:'https://www.fifa.com/en/tournaments/mens/beachsoccerworldcup/articles/beach-soccer-rules-guide-how-to-play'}],
 'cay-kick-in':[BEACH_LAWS],
 'cay-surfaces':[{title:'FIFA Futsal Laws of the Game 2024-25 · Law 2 The Ball (low rebound)',url:'https://digitalhub.fifa.com/m/7b1da24ec7a25f67/original/Futsal-Laws-of-the-Game-2024-2025.pdf'},{title:'FIFA Training Centre · Beach soccer: passing (uneven sand)',url:'https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-1/passing.php'}],
 'cay-court':[{title:'FIFA Training Centre · Beach soccer: passing',url:'https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-1/passing.php'},BEACH_MANUAL],
 'cay-overhead':[{title:'FIFA Training Centre · Beach soccer: scissor and bicycle kicks',url:'https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-1/scissor-and-bicycle-kicks.php'},IFAB('Law 12 Fouls and Misconduct (playing in a dangerous manner)','fouls-and-misconduct')],
 'cay-club':[{title:'FIFA Training Centre · Emerging trends: the role of the goalkeeper in beach soccer',url:'https://www.fifatrainingcentre.com/en/game/tournaments/fifa-beach-soccer-world-cup/2025/technical-study-group-articles/emerging-trends-the-role-of-the-goalkeeper-in-beach-soccer.php'},{title:'FIFA Training Centre · Beach soccer: build-up from defence',url:'https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-5/build-up-from-defence.php'}],
 'cay-surf-roof':[{title:'FIFA match centre · Tahiti v Brazil, 2017 Beach Soccer World Cup final',url:'https://www.fifa.com/en/match-centre/match/500/276973/278261/300392031'},{title:'Oceania Football Confederation · Tahiti at the Beach Soccer World Cup',url:'https://www.oceaniafootball.com/revived-tahiti-target-the-title/'}],
 'cay-fuel':[{title:'FIFA · Nutrition for Football',url:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'}],
 'cay-rest':[{title:'American Academy of Sleep Medicine (2016) · Recommended amount of sleep for pediatric populations',url:'https://jcsm.aasm.org/doi/10.5664/jcsm.5866'},{title:'American Academy of Pediatrics (2024) · Overuse injuries, overtraining and burnout in young athletes',url:'https://publications.aap.org/pediatrics/article/153/2/e2023065129/196435/Overuse-Injuries-Overtraining-and-Burnout-in-Young'}],
 'cay-water':[{title:'American Academy of Pediatrics (2011) · Climatic heat stress and exercising children and adolescents',url:'https://publications.aap.org/pediatrics/article/128/3/e741/30624/Climatic-Heat-Stress-and-Exercising-Children-and'},IFAB('Law 7 The Duration of the Match (drinks and cooling breaks)','the-duration-of-the-match')],
 'cay-heading':[{title:'The FA · Updated heading guidance (2020)',url:'https://www.thefa.com/news/2020/feb/24/updated-heading-guidance-announcement-240220'},{title:'US Soccer heading guidelines (2015), summarised by US Club Soccer',url:'https://usclubsoccer.org/headinjuries/'}],
};
