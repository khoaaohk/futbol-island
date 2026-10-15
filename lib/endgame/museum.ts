/**
 * The History Museum (Lane 2, Sep 30 2026; docs/endgame-2026-09-30.md). Pure data + unlock rules; UI in components/Museum.tsx.
 *
 * (Oct 14 2026: the "Your Collection" wing is gone; the galleries below are all history, and every case is free.)
 * Four small galleries, each opened by a collection the island already has, so collecting has a football payoff:
 *  - The Laws of the Game ← ball-hunt balls found (every ball already teaches one football idea);
 *  - World Cup history    ← player cards collected;
 *  - Balls and kits       ← pop-up books in the backpack (the starter book counts as one);
 *  - Hall of Fame         ← graduations (your own certificates).
 * The first case is always open, so the building is never a dead end.
 *
 * Content: kid-friendly, one "take it to your game" line per case, sources on every case. Live re-fetching was not available
 * in the build session, so each fact is kept to a well-documented core (dates, winners, Law numbers) that matches the sources
 * listed and the facts the Konbini magazines and vending machines already carry (lib/konbini/konbiniContent.ts,
 * lib/town/vendingCatalog.ts). Re-check against the sources before extending a case.
 */
export type MuseumSource={title:string;url:string};
export type MuseumCounts={balls:number;cards:number;books:number;graduations:number};
export type UnlockKind=keyof MuseumCounts;
export type MuseumGallery={id:string;title:string;blurb:string;unlock:UnlockKind;art:string};
/** `object` names the case's sculpture kind (free text since Oct 14 2026: new cases bring their own). */
export type Exhibit={id:string;gallery:string;year:string;title:string;object:string;
 facts:string[];forYourGame:string;need:number;sources:MuseumSource[]};

const W=(page:string,title=page.replace(/_/g,' ')):MuseumSource=>({title:`Wikipedia · ${decodeURIComponent(title)}`,url:`https://en.wikipedia.org/wiki/${page}`});
const IFAB=(law:string,slug:string):MuseumSource=>({title:`IFAB Laws of the Game · ${law}`,url:`https://www.theifab.com/laws/latest/${slug}/`});

export const GALLERIES:MuseumGallery[]=[
 {id:'laws',title:'The Laws of the Game',blurb:'How football got its rules, and why they changed.',unlock:'balls',art:'#2f8f8a'},
 {id:'worldcup',title:'World Cup history',blurb:'The first tournaments for men, women and futsal, and the stadiums they play in.',unlock:'cards',art:'#d8466f'},
 {id:'kit',title:'Balls and kits',blurb:'From heavy leather to the size 5 ball, boots with studs, and why shirts have numbers.',unlock:'books',art:'#e0a33a'},
 // Oct 14 2026 (user: "get rid of your pop-up books, your player cards, your hidden balls, and your certificates … replace with other
 // historical exhibits"): the west wing is now three historical galleries, and the Hall of Fame became "Legends" (the Trophy room
 // and the Ballon d'Or). Every case is free, so `unlock` is only the legacy field the guide's copy reads.
 {id:'hall',title:'Legends',blurb:'Football’s great trophies, and the Ballon d’Or for its greatest players.',unlock:'graduations',art:'#477c6a'},
 {id:'firsts',title:'Firsts',blurb:'The first international, the first game under lights and the first cup for nations.',unlock:'balls',art:'#1d1d1b'},
 {id:'tactics',title:'Rules & tactics',blurb:'How offside, formations and the goalkeeper’s hands changed the way football is played.',unlock:'balls',art:'#2a5bd7'},
 {id:'skills',title:'Skills & science',blurb:'Free kicks and the wall, the throw-in, and why a spinning ball curves.',unlock:'balls',art:'#f2c230'},
];
export const UNLOCK_WORDS:Record<UnlockKind,{one:string;many:string;how:string}>={
 balls:{one:'hidden ball',many:'hidden balls',how:'Find hidden balls around the island (tap the ball icon on the map for clues).'},
 cards:{one:'player card',many:'player cards',how:'Earn player cards on Paths, in chats and in the ball hunt, or open packs at a vending machine.'},
 books:{one:'pop-up book',many:'pop-up books',how:'Each vending machine sells one player’s pop-up book in its Specials row.'},
 graduations:{one:'graduation',many:'graduations',how:'Finish all 12 starter lessons of any path to graduate.'},
};

export const EXHIBITS:Exhibit[]=[
 // ---- The Laws of the Game (balls) ----
 {id:'laws-1863',gallery:'laws',year:'1863',title:'The first Laws',object:'book',need:0,
  facts:['In 1863 the Football Association was formed in London and wrote down one set of rules, so different clubs could play each other.','Before that, schools and clubs each played by their own rules.','Since 1886 the International Football Association Board (IFAB) has looked after the Laws of the Game.'],
  forYourGame:'Everyone plays by the same Laws, so you can join a game anywhere in the world.',
  sources:[W('The_Football_Association'),W('International_Football_Association_Board')]},
 {id:'penalty-1891',gallery:'laws',year:'1891',title:'The penalty kick',object:'whistle',need:0,
  facts:['The penalty kick joined the Laws in 1891. The idea came from William McCrum, a goalkeeper from Ireland.','Today the ball goes on the penalty mark, 11 metres from the goal line.','The goalkeeper stays on the goal line until the ball is kicked.'],
  forYourGame:'Pick your spot early and don’t change your mind: a calm routine helps under pressure.',
  sources:[W('Penalty_kick_(association_football)'),IFAB('Law 14 The Penalty Kick','the-penalty-kick')]},
 {id:'var-2018',gallery:'laws',year:'2018',title:'The video assistant referee',object:'screen',need:0,
  facts:['The video assistant referee (VAR) was first used at a men’s World Cup in 2018, in Russia.','VAR can only help with clear mistakes about goals, penalties, straight red cards and mistaken identity.','The referee on the pitch still makes the final decision.','A goal counts only when the whole ball has crossed the whole goal line, between the posts and under the crossbar.'],
  forYourGame:'Play to the whistle: keep going until the referee stops the game.',
  sources:[W('Video_assistant_referee'),W('2018_FIFA_World_Cup'),IFAB('Law 10 Determining the Outcome of a Match','determining-the-outcome-of-a-match')]},
 // ---- World Cup history (cards) ----
 {id:'worldcup-1930',gallery:'worldcup',year:'1930',title:'The first World Cup',object:'trophy',need:0,
  facts:['The first FIFA World Cup was played in Uruguay in 1930.','Uruguay, the hosts, won it, beating Argentina 4–2 in the final in Montevideo.','Only 13 teams took part.'],
  forYourGame:'Every big tournament started small. So does every player: one touch at a time.',
  sources:[W('1930_FIFA_World_Cup')]},
 {id:'wwc-1991',gallery:'worldcup',year:'1991',title:'The first Women’s World Cup',object:'globe',need:0,
  facts:['The first FIFA Women’s World Cup was played in China in 1991.','The USA won it, beating Norway 2–1 in the final.','Michelle Akers scored both US goals in that final.'],
  forYourGame:'Find your striker early: a team that knows who finishes can plan its attacks.',
  sources:[W('1991_FIFA_Women%27s_World_Cup'),W('Michelle_Akers')]},
 {id:'futsal-1989',gallery:'worldcup',year:'1989',title:'Futsal’s World Cup',object:'court',need:0,
  facts:['Futsal began in Montevideo, Uruguay, in 1930, when Juan Carlos Ceriani made up a five-a-side game for indoor courts.','The first FIFA Futsal World Cup was played in the Netherlands in 1989, and Brazil won it.','Futsal’s small, low-bounce ball rewards close control with the sole of the foot.'],
  forYourGame:'Small-sided games mean more touches. Every futsal skill helps you on grass too.',
  sources:[W('Futsal'),W('1989_FIFA_Futsal_World_Championship'),{title:'FIFA Futsal Laws of the Game 2024-25 · Law 2 The Ball',url:'https://digitalhub.fifa.com/m/7b1da24ec7a25f67/original/Futsal-Laws-of-the-Game-2024-2025.pdf'}]},
 // Oct 12 2026: "Stadiums of the World" replaced the yellow and red cards (user: "replace the yellow and red cards with stadiums of
 // the world … show a bunch of stadiums and breakdown how they are built"). Its year is the Maracanã's, the oldest story it tells.
 {id:'stadiums',gallery:'worldcup',year:'1950',title:'Stadiums of the World',object:'stadium',need:0,
  facts:['The Maracanã in Rio de Janeiro opened in 1950 for the World Cup. 199,854 people watched Uruguay beat Brazil 2–1 there.','Estadio Azteca in Mexico City was the first stadium to host two World Cup finals, in 1970 and 1986.','Wembley’s giant arch is 133 metres tall. It holds up all of the north roof and most of the south roof.','Under the grass of a modern pitch sit layers of sand and gravel, with pipes that drain away the rain and, in many stadiums, pipes that warm the ground.'],
  forYourGame:'A great stadium is built from the ground up, one layer at a time. So is your game: get the basics right first.',
  sources:[W('Maracan%C3%A3_Stadium','Maracanã Stadium'),W('Estadio_Azteca'),W('Wembley_Stadium'),{title:'GeoSmart · The hidden engineering beneath every World Cup stadium',url:'https://geosmartinfo.co.uk/blog/more-than-just-grass-the-hidden-engineering-beneath-every-world-cup-stadium/'}]},
 // ---- Balls and kits (books) ----
 {id:'laced-leather',gallery:'kit',year:'Before the 1960s',title:'Laced leather balls',object:'leather',need:0,
  facts:['Long ago, footballs were brown leather, and the old ones were laced up. They soaked up rain and got heavy.','Today an adult match ball is size 5: 68–70 cm around and 410–450 grams.','Younger players use smaller size 3 or 4 balls, so the ball fits the player.'],
  forYourGame:'Use the right size ball for your age: it makes good technique easier.',
  sources:[IFAB('Law 2 The Ball','the-ball'),W('Ball_(association_football)')]},
 {id:'telstar-1970',gallery:'kit',year:'1970',title:'The Telstar TV ball',object:'telstar',need:0,
  facts:['The official ball of the 1970 World Cup in Mexico was the Adidas Telstar.','Its 32 panels were black and white, so it stood out on black-and-white television.','That black-and-white pattern became the picture of a football all over the world.'],
  forYourGame:'Watch the ball, not the feet: a clear ball is easier to track and to strike cleanly.',
  sources:[W('Adidas_Telstar'),W('1970_FIFA_World_Cup')]},
 // Oct 12 2026: "Boots through time" replaced the back-pass rule (user request via the coordinator). Its boots run from the early
 // 1900s to today, so its year is "1900s" (a plain decade keeps it in date order; "…today" would sort it last).
 {id:'boots',gallery:'kit',year:'1900s',title:'Boots through time',object:'boot',need:0,
  facts:['Early football boots were heavy leather that came up over the ankle, with hard toe-caps and nailed studs.','Screw-in studs let players change to longer studs on a wet, muddy pitch.','Today many boots are light and knitted, with a plastic plate, and there are different soles for grass, plastic grass and indoor courts.'],
  forYourGame:'Wear the right sole for the pitch: studs on grass, short studs or turf soles on plastic grass, a flat sole indoors.',
  sources:[W('Football_boot'),IFAB('Law 4 The Players’ Equipment','the-players-equipment')]},
 {id:'shirts',gallery:'kit',year:'1928',title:'Numbers and colours',object:'shirt',need:0,
  facts:['In England, numbered shirts were first worn in league games in 1928 and became compulsory in 1939.','Classic numbers followed positions: 1 the goalkeeper, 9 the striker, 10 the playmaker.','The Laws say the two teams must wear colours that are different from each other and from the referees, and each goalkeeper wears a colour of their own.'],
  forYourGame:'Scan for shirt colours before you get the ball: it tells you who is free.',
  sources:[W('Squad_number_(association_football)'),IFAB('Law 4 The Players’ Equipment','the-players-equipment')]},
 // ---- Legends (was the Hall of Fame) ----
 {id:'hall-of-fame',gallery:'hall',year:'Today',title:'Trophy room',object:'frame',need:0,
  facts:['This cabinet holds eight of football’s greatest trophies, drawn at their true size.','Graduate all four paths to board the Matchday Ferry for your Matchday final.'],
  forYourGame:'Learning football is a journey: futsal, 7v7, 9v9 and 11v11 all teach the same big ideas in different spaces.',
  sources:[]},
 // Oct 14 2026 (user: "maybe one of them is ballon dor winners"). Facts checked against Wikipedia's Ballon d'Or and Ballon d'Or Féminin
 // articles (and their winners tables) on Oct 14 2026; the 2026 award (the 70th) is not presented until 26 October 2026, so the
 // winners stop at 2025. The full winners list lives in components/museum/experiences/ballon-dor/data.ts.
 {id:'ballon-dor',gallery:'hall',year:'1956',title:'The Ballon d’Or',object:'golden-ball',need:0,
  facts:['The Ballon d’Or (“Golden Ball”) was first given in 1956 by the French magazine France Football. Stanley Matthews of England won the first one.','At first only European players could win it. From 1995 any player at a European club could, and since 2007 every professional player in the world.','The women’s Ballon d’Or began in 2018. Ada Hegerberg of Norway won the first one.','Lionel Messi has won the men’s award a record eight times. Alexia Putellas won it twice, and Aitana Bonmatí three times in a row (2023 to 2025).','Most winners are attackers and midfielders. Lev Yashin (1963) is the only goalkeeper to win it, and Fabio Cannavaro (2006) the third defender, after Franz Beckenbauer and Matthias Sammer.'],
  forYourGame:'Every position can be great: save, defend, pass and score for your team, and play fair. That is what the voters look for.',
  sources:[W('Ballon_d%27Or','Ballon d’Or'),W('Ballon_d%27Or_F%C3%A9minin','Ballon d’Or Féminin'),W('Lev_Yashin'),W('Fabio_Cannavaro'),W('2022_Ballon_d%27Or','2022 Ballon d’Or')]},
 // ---- Firsts / Rules & tactics (Oct 14 2026, agent B). Facts checked on Oct 14 2026 against the Wikipedia articles listed and IFAB Law 11.
 {id:'first-international-1872',gallery:'firsts',year:'1872',title:'The first international',object:'pitch',need:0,
  facts:['On 30 November 1872 Scotland played England in the first official international football match, at Hamilton Crescent, the West of Scotland Cricket Club’s ground in Partick, Glasgow.','It finished 0–0, and about 4,000 people watched.','England lined up with 1 back, 1 half-back and 8 forwards (1-1-8). Scotland, all Queen’s Park players, used 2 backs, 2 half-backs and 6 forwards (2-2-6).','England relied more on dribbling. A newspaper wrote that the Scots seemed to be “adepts in passing the ball”.'],
  forYourGame:'Pass and move: the ball travels faster than any dribbler, so find the teammate in space.',
  sources:[W('1872_Scotland_v_England_football_match','1872 Scotland v England football match'),W('Hamilton_Crescent'),W('Passing_(association_football)','Passing (association football)')]},
 {id:'offside-rules',gallery:'tactics',year:'1863',title:'The offside rule through time',object:'flag',need:0,
  facts:['The first FA Laws in 1863 had a strict offside rule: when a teammate kicked the ball, any player in front of it was out of play.','From 1866 you were onside if three opponents were between you and their goal line. In 1925 three became two, and Football League goals jumped from 4,700 to 6,373 the next season.','Since 1990 a player level with the second-last opponent is onside.','Today you are offside if, when a teammate plays the ball, you are in the other team’s half, nearer their goal line than the ball and the second-last opponent, and you then join in the play.'],
  forYourGame:'Stay level with the last defender and time your run for the moment the pass is played.',
  sources:[W('Offside_(association_football)','Offside (association football)'),IFAB('Law 11 Offside','offside')]},
 {id:'formations-history',gallery:'tactics',year:'1880s',title:'Formations through time',object:'board',need:0,
  facts:['The 2-3-5 “pyramid” was recorded in 1880, and by the 1890s it was the standard formation in England.','In the mid-1920s Herbert Chapman of Arsenal created the WM (3-2-2-3), adding a centre-back after the 1925 offside change.','Brazil won the 1958 World Cup playing 4-2-4. The 4-4-2 was the most common shape in the 1990s and early 2000s; today many teams play 4-3-3 or 4-2-3-1.','Young players use smaller shapes for smaller games, like 2-3-1 in 7v7 and 3-2-3 in 9v9.'],
  forYourGame:'Know your line and keep the shape: width, depth and cover help every teammate.',
  sources:[W('Formation_(association_football)','Formation (association football)'),W('Herbert_Chapman'),W('1958_FIFA_World_Cup')]},
 // Oct 14 2026 (agent C): Firsts · Under the lights, The oldest cup for nations; Rules & tactics · The goalkeeper's hands. Facts
 // checked against the sources listed on Oct 14 2026; each experience's content.ts carries its extra sourced lines.
 {id:'floodlights-1878',gallery:'firsts',year:'1878',title:'Under the lights',object:'floodlight',need:0,
  facts:['On 14 October 1878, Bramall Lane in Sheffield held the first football match ever played under floodlights. About 20,000 people came to watch.','There was no power grid yet, so generators at the ground made the electricity for the lamps.','Lights took a long time to catch on: the first Football League match under floodlights was Portsmouth against Newcastle United, on 22 February 1956.'],
  forYourGame:'Before a high ball comes, glance up and know where the lights or the sun are, so the glare never catches you out.',
  sources:[W('Bramall_Lane'),W('Sheffield_United_F.C.'),W('Floodlight'),W('Floodlights_(sport)')]},
 {id:'copa-america-1916',gallery:'firsts',year:'1916',title:'The oldest cup for nations',object:'cup',need:0,
  facts:['The first South American Championship was played in Argentina in July 1916, between Argentina, Brazil, Chile and Uruguay.','It was a round robin: every team played every other team once. Uruguay won it, with two wins and a draw.','Today it is called the Copa América. It is the oldest continental tournament for national teams that is still played.'],
  forYourGame:'In a round robin every game counts: a draw still earns a point, so never stop playing until the final whistle.',
  sources:[W('1916_South_American_Championship'),W('Copa_Am%C3%A9rica','Copa América')]},
 {id:'keeper-hands-1912',gallery:'tactics',year:'1912',title:'The goalkeeper’s hands',object:'gloves',need:0,
  facts:['Before 1912, a goalkeeper could handle the ball anywhere in their own half.','In 1912 the Law changed: a goalkeeper may handle the ball only inside their own penalty area. It is still the Law today.','Goalkeepers rarely wore gloves before the 1970s. Today almost every keeper does.'],
  forYourGame:'Inside your box, come and claim the ball with your hands and shout “Keeper!”. Outside it, play like a defender: clear it with your feet, or stay home and let a teammate win it.',
  sources:[W('Goalkeeper_(association_football)'),W('Laws_of_the_Game_(association_football)'),W('Kit_(association_football)'),IFAB('Law 12 Fouls and Misconduct','fouls-and-misconduct')]},
 // ---- Skills & science (Oct 14 2026, agent D). Facts checked on Oct 14 2026 against IFAB Laws 13 and 15, Wikipedia's "Free kick
 // (association football)", "Throw-in", "Magnus effect", "Curl (association football)" and "Knuckleball", and the papers cited in
 // each experience's content.ts. free-kick-wall's year is 1872: the first free kick for a foul (handball); the 1863 Laws only had
 // a free kick for a fair catch. throw-in's year is 1863: the throw-in is in the first FA Laws.
 {id:'free-kick-wall',gallery:'skills',year:'1872',title:'Free kicks and the wall',object:'wall',need:0,
  facts:['At a free kick, every player on the other team must stand at least 9.15 metres (10 yards) from the ball until it is kicked.','When three or more defenders make a wall, the attackers must stay at least 1 metre away from it. This rule came in 2019.','From a direct free kick you can score straight into the goal. For an indirect free kick the referee raises an arm, and another player must touch the ball before a goal counts.','Free kicks for fouls joined the Laws in 1872, for handball. The direct free kick came in 1903.'],
  forYourGame:'Free kick for your team? Pick your spot before your run-up: over the wall, round it, or into the gap the keeper leaves.',
  sources:[IFAB('Law 13 Free Kicks','free-kicks'),W('Free_kick_(association_football)','Free kick (association football)')]},
 {id:'ball-curve',gallery:'skills',year:'Today',title:'How a ball curves',object:'curve',need:0,
  facts:['A spinning ball curves. As it spins it pushes the air to one side, so the air pushes the ball the other way. Scientists call this the Magnus effect.','Where you strike the ball sets the spin. Strike it right of centre and it curves left; strike it left of centre and it curves right.','Strike it hard through the middle, with almost no spin, and you get a knuckleball: it can wobble and dip in the air, so it is hard for a keeper to read.','In 1997 Roberto Carlos of Brazil bent a famous free kick against France with the outside of his left foot.'],
  forYourGame:'To bend it, strike the ball off-centre and follow through across it. To hit it straight, strike right through the middle.',
  sources:[W('Magnus_effect'),W('Curl_(association_football)','Curl (association football)'),W('Knuckleball')]},
 {id:'throw-in',gallery:'skills',year:'1863',title:'The throw-in',object:'throw',need:0,
  facts:['When the whole ball goes over the touchline, the team that did not touch it last takes a throw-in.','The thrower faces the pitch, keeps part of each foot on the line or on the ground behind it, and throws with both hands from behind and over the head.','You cannot score straight from a throw-in, and opponents must stand at least 2 metres away.','In the first Laws, in 1863, the first player to touch the ball after it went out threw it in, straight out at right angles to the touchline. Two hands became the rule in 1883.'],
  forYourGame:'Take it quickly: throw to a free teammate’s feet or down the line into space, then step onto the pitch for the return.',
  sources:[IFAB('Law 15 The Throw-in','the-throw-in'),W('Throw-in')]},
];
export const galleryOf=(id:string)=>GALLERIES.find(g=>g.id===id)!;

export type ExhibitState={open:boolean;have:number;need:number;left:number;lockText:string;how:string};
/** Whether a case is open, and the "how to unlock" copy when it isn't (always says what to do, never just "locked"). */
export function exhibitState(exhibit:Exhibit,counts:MuseumCounts):ExhibitState{
 const kind=galleryOf(exhibit.gallery).unlock,have=Math.max(0,Math.floor(counts[kind]||0)),need=exhibit.need,left=Math.max(0,need-have),w=UNLOCK_WORDS[kind];
 return {open:left===0,have,need,left,lockText:left?`Collect ${left} more ${left===1?w.one:w.many} to open this case (${Math.min(have,need)}/${need}).`:'',how:w.how};
}
export const openExhibits=(counts:MuseumCounts)=>EXHIBITS.filter(e=>exhibitState(e,counts).open);

// ---- Walk-in museum (Oct 3 2026): interactive-exhibit config ----------------------------------------------------------------
/**
 * The hands-on part of a case in the walk-in museum (components/MuseumRoom.tsx, lib/museum/*). No new facts: every `quote` is
 * copied word for word from that case's own facts or "take it to your game" line above (tests/museum-room.cjs checks it), and
 * the VAR replay is a made-up practice moment, labelled as practice. The timeline wall is built from the cases' own years.
 */
export type ExhibitInteractive=
 |{kind:'whistle';label:string;quote:string}
 |{kind:'var';label:string;frames:string[];quote:string;
   /** The goal-line rule (Law 10), quoted from the case: the practice replay shows a ball clearly over, or clearly still on, the line. */
   rule:string;over:string;on:string}
 |{kind:'compare';label:string;old:{title:string;quote:string};now:{title:string;quote:string};young:{quote:string}}
 |{kind:'spin';label:string;quote:string}
 |{kind:'kit';label:string;numbers:{n:number;quote:string}[]};
export const EXHIBIT_INTERACTIVES:Readonly<Record<string,ExhibitInteractive>>={
 'penalty-1891':{kind:'whistle',label:'Blow the referee’s whistle',quote:'Today the ball goes on the penalty mark, 11 metres from the goal line.'},
 'var-2018':{kind:'var',label:'Practice replay',frames:['The ball flies at the goal…','Freeze! Where is the ball?','Look closer: is the WHOLE ball over the line?'],quote:'The referee on the pitch still makes the final decision.',
  rule:'A goal counts only when the whole ball has crossed the whole goal line, between the posts and under the crossbar.',over:'The whole ball is past the line: goal!',on:'Part of the ball is still on the line: no goal yet.'},
 'laced-leather':{kind:'compare',label:'Compare the balls',old:{title:'Laced leather',quote:'They soaked up rain and got heavy.'},now:{title:'Size 5 match ball',quote:'68–70 cm around and 410–450 grams'},young:{quote:'Younger players use smaller size 3 or 4 balls, so the ball fits the player.'}},
 'telstar-1970':{kind:'spin',label:'Spin the Telstar',quote:'Its 32 panels were black and white, so it stood out on black-and-white television.'},
 'shirts':{kind:'kit',label:'The kit wall',numbers:[{n:1,quote:'1 the goalkeeper'},{n:9,quote:'9 the striker'},{n:10,quote:'10 the playmaker'}]},
};
/** The years on the timeline wall, oldest first ("Before the 1960s" sits before 1960; "Today" last). */
export function timelineOrder(list:readonly Exhibit[]=EXHIBITS):Exhibit[]{
 const key=(y:string)=>/today/i.test(y)?Infinity:/before/i.test(y)?Number(y.match(/\d{4}/)?.[0]??0)-.5:Number(y.match(/\d{4}/)?.[0]??0);
 return [...list].sort((a,b)=>key(a.year)-key(b.year)||list.indexOf(a)-list.indexOf(b));
}
/** The closed case nearest to opening (fewest left to collect; ties keep the hall order), for the museum guide's "Show me". */
export function nextExhibitToOpen(counts:MuseumCounts):Exhibit|null{
 let best:Exhibit|null=null,bestLeft=Infinity;for(const e of EXHIBITS){const s=exhibitState(e,counts);if(!s.open&&s.left<bestLeft){best=e;bestLeft=s.left;}}return best;
}
