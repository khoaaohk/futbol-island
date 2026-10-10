/**
 * The History Museum (Lane 2, Sep 30 2026; docs/endgame-2026-09-30.md). Pure data + unlock rules; UI in components/Museum.tsx.
 *
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
export type Exhibit={id:string;gallery:string;year:string;title:string;object:'book'|'whistle'|'cards'|'glove'|'screen'|'trophy'|'globe'|'court'|'leather'|'telstar'|'shirt'|'frame';
 facts:string[];forYourGame:string;need:number;sources:MuseumSource[]};

const W=(page:string,title=page.replace(/_/g,' ')):MuseumSource=>({title:`Wikipedia · ${decodeURIComponent(title)}`,url:`https://en.wikipedia.org/wiki/${page}`});
const IFAB=(law:string,slug:string):MuseumSource=>({title:`IFAB Laws of the Game · ${law}`,url:`https://www.theifab.com/laws/latest/${slug}/`});

export const GALLERIES:MuseumGallery[]=[
 {id:'laws',title:'The Laws of the Game',blurb:'How football got its rules, and why they changed.',unlock:'balls',art:'#2f8f8a'},
 {id:'worldcup',title:'World Cup history',blurb:'The first tournaments for men, women and futsal.',unlock:'cards',art:'#d8466f'},
 {id:'kit',title:'Balls and kits',blurb:'From heavy leather to the size 5 ball, and why shirts have numbers.',unlock:'books',art:'#e0a33a'},
 {id:'hall',title:'Hall of Fame',blurb:'Your own graduation certificates, on the wall.',unlock:'graduations',art:'#477c6a'},
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
 {id:'penalty-1891',gallery:'laws',year:'1891',title:'The penalty kick',object:'whistle',need:10,
  facts:['The penalty kick joined the Laws in 1891. The idea came from William McCrum, a goalkeeper from Ireland.','Today the ball goes on the penalty mark, 11 metres from the goal line.','The goalkeeper stays on the goal line until the ball is kicked.'],
  forYourGame:'Pick your spot early and don’t change your mind: a calm routine helps under pressure.',
  sources:[W('Penalty_kick_(association_football)'),IFAB('Law 14 The Penalty Kick','the-penalty-kick')]},
 {id:'cards-1970',gallery:'laws',year:'1970',title:'Yellow and red cards',object:'cards',need:25,
  facts:['Yellow and red cards were first used at the 1970 World Cup in Mexico.','English referee Ken Aston had the idea while waiting at traffic lights: yellow means careful, red means stop.','Cards showed every player and fan the referee’s decision, whatever language they spoke.'],
  forYourGame:'A yellow card is a warning. Stay calm and keep playing fairly.',
  sources:[W('Ken_Aston'),W('Penalty_card'),IFAB('Law 12 Fouls and Misconduct','fouls-and-misconduct')]},
 {id:'backpass-1992',gallery:'laws',year:'1992',title:'The back-pass rule',object:'glove',need:50,
  facts:['Since 1992, a goalkeeper may not pick up the ball when a team-mate deliberately kicks it back to them.','The change stopped teams wasting time and made the game faster.','It is why today’s keepers practise passing and receiving with their feet.'],
  forYourGame:'Keepers are part of the passing team: give them an easy ball to their feet.',
  sources:[W('Back-pass_rule'),IFAB('Law 12 Fouls and Misconduct','fouls-and-misconduct')]},
 {id:'var-2018',gallery:'laws',year:'2018',title:'The video assistant referee',object:'screen',need:80,
  facts:['The video assistant referee (VAR) was first used at a men’s World Cup in 2018, in Russia.','VAR can only help with clear mistakes about goals, penalties, straight red cards and mistaken identity.','The referee on the pitch still makes the final decision.','A goal counts only when the whole ball has crossed the whole goal line, between the posts and under the crossbar.'],
  forYourGame:'Play to the whistle: keep going until the referee stops the game.',
  sources:[W('Video_assistant_referee'),W('2018_FIFA_World_Cup'),IFAB('Law 10 Determining the Outcome of a Match','determining-the-outcome-of-a-match')]},
 // ---- World Cup history (cards) ----
 {id:'worldcup-1930',gallery:'worldcup',year:'1930',title:'The first World Cup',object:'trophy',need:10,
  facts:['The first FIFA World Cup was played in Uruguay in 1930.','Uruguay, the hosts, won it, beating Argentina 4–2 in the final in Montevideo.','Only 13 teams took part.'],
  forYourGame:'Every big tournament started small. So does every player: one touch at a time.',
  sources:[W('1930_FIFA_World_Cup')]},
 {id:'wwc-1991',gallery:'worldcup',year:'1991',title:'The first Women’s World Cup',object:'globe',need:30,
  facts:['The first FIFA Women’s World Cup was played in China in 1991.','The USA won it, beating Norway 2–1 in the final.','Michelle Akers scored both US goals in that final.'],
  forYourGame:'Find your striker early: a team that knows who finishes can plan its attacks.',
  sources:[W('1991_FIFA_Women%27s_World_Cup'),W('Michelle_Akers')]},
 {id:'futsal-1989',gallery:'worldcup',year:'1989',title:'Futsal’s World Cup',object:'court',need:60,
  facts:['Futsal began in Montevideo, Uruguay, in 1930, when Juan Carlos Ceriani made up a five-a-side game for indoor courts.','The first FIFA Futsal World Cup was played in the Netherlands in 1989, and Brazil won it.','Futsal’s small, low-bounce ball rewards close control with the sole of the foot.'],
  forYourGame:'Small-sided games mean more touches. Every futsal skill helps you on grass too.',
  sources:[W('Futsal'),W('1989_FIFA_Futsal_World_Championship'),{title:'FIFA Futsal Laws of the Game 2024-25 · Law 2 The Ball',url:'https://digitalhub.fifa.com/m/7b1da24ec7a25f67/original/Futsal-Laws-of-the-Game-2024-2025.pdf'}]},
 // ---- Balls and kits (books) ----
 {id:'laced-leather',gallery:'kit',year:'Before the 1960s',title:'Laced leather balls',object:'leather',need:2,
  facts:['Long ago, footballs were brown leather, and the old ones were laced up. They soaked up rain and got heavy.','Today an adult match ball is size 5: 68–70 cm around and 410–450 grams.','Younger players use smaller size 3 or 4 balls, so the ball fits the player.'],
  forYourGame:'Use the right size ball for your age: it makes good technique easier.',
  sources:[IFAB('Law 2 The Ball','the-ball'),W('Ball_(association_football)')]},
 {id:'telstar-1970',gallery:'kit',year:'1970',title:'The Telstar TV ball',object:'telstar',need:3,
  facts:['The official ball of the 1970 World Cup in Mexico was the Adidas Telstar.','Its 32 panels were black and white, so it stood out on black-and-white television.','That black-and-white pattern became the picture of a football all over the world.'],
  forYourGame:'Watch the ball, not the feet: a clear ball is easier to track and to strike cleanly.',
  sources:[W('Adidas_Telstar'),W('1970_FIFA_World_Cup')]},
 {id:'shirts',gallery:'kit',year:'1928',title:'Numbers and colours',object:'shirt',need:4,
  facts:['In England, numbered shirts were first worn in league games in 1928 and became compulsory in 1939.','Classic numbers followed positions: 1 the goalkeeper, 9 the striker, 10 the playmaker.','The Laws say the two teams must wear colours that are different from each other and from the referees, and each goalkeeper wears a colour of their own.'],
  forYourGame:'Scan for shirt colours before you get the ball: it tells you who is free.',
  sources:[W('Squad_number_(association_football)'),IFAB('Law 4 The Players’ Equipment','the-players-equipment')]},
 // ---- Hall of Fame (graduations): the player's own certificates ----
 {id:'hall-of-fame',gallery:'hall',year:'Today',title:'Your Hall of Fame',object:'frame',need:1,
  facts:['Every path you graduate hangs its certificate here.','Graduate all four paths to board the Matchday Ferry for your Matchday final.'],
  forYourGame:'Learning football is a journey: futsal, 7v7, 9v9 and 11v11 all teach the same big ideas in different spaces.',
  sources:[]},
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
 |{kind:'cards';label:string;cards:{color:'yellow'|'red';word:string;quote:string}[]}
 |{kind:'var';label:string;frames:string[];quote:string;
   /** The goal-line rule (Law 10), quoted from the case: the practice replay shows a ball clearly over, or clearly still on, the line. */
   rule:string;over:string;on:string}
 |{kind:'compare';label:string;old:{title:string;quote:string};now:{title:string;quote:string};young:{quote:string}}
 |{kind:'spin';label:string;quote:string}
 |{kind:'kit';label:string;numbers:{n:number;quote:string}[]}
 |{kind:'hall';label:string};
export const EXHIBIT_INTERACTIVES:Readonly<Record<string,ExhibitInteractive>>={
 'penalty-1891':{kind:'whistle',label:'Blow the referee’s whistle',quote:'Today the ball goes on the penalty mark, 11 metres from the goal line.'},
 'cards-1970':{kind:'cards',label:'Hold up a card',cards:[{color:'yellow',word:'Careful',quote:'A yellow card is a warning.'},{color:'red',word:'Stop',quote:'yellow means careful, red means stop'}]},
 'var-2018':{kind:'var',label:'Practice replay',frames:['The ball flies at the goal…','Freeze! Where is the ball?','Look closer: is the WHOLE ball over the line?'],quote:'The referee on the pitch still makes the final decision.',
  rule:'A goal counts only when the whole ball has crossed the whole goal line, between the posts and under the crossbar.',over:'The whole ball is past the line: goal!',on:'Part of the ball is still on the line: no goal yet.'},
 'laced-leather':{kind:'compare',label:'Compare the balls',old:{title:'Laced leather',quote:'They soaked up rain and got heavy.'},now:{title:'Size 5 match ball',quote:'68–70 cm around and 410–450 grams'},young:{quote:'Younger players use smaller size 3 or 4 balls, so the ball fits the player.'}},
 'telstar-1970':{kind:'spin',label:'Spin the Telstar',quote:'Its 32 panels were black and white, so it stood out on black-and-white television.'},
 'shirts':{kind:'kit',label:'The kit wall',numbers:[{n:1,quote:'1 the goalkeeper'},{n:9,quote:'9 the striker'},{n:10,quote:'10 the playmaker'}]},
 'hall-of-fame':{kind:'hall',label:'Your certificates'},
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
