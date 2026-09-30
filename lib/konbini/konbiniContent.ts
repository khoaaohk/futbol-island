import {FOOD_SOURCES,type Source,type KonbiniShop} from './food';
/**
 * What the Konbini teaches (AGENTS.md: everything teaches football). Every magazine and cashier fact carries its sources.
 * Laws facts follow the IFAB Laws of the Game; history facts are long-settled tournament results. Written Sep 29 2026 from
 * the sources listed (live re-fetching was not available in that session, so each fact is kept to a well-documented core).
 * Nutrition lines reuse the Coral Cay farm's guidance and sources (lib/town/coralCayNpcs.ts): positive, food as fuel.
 */
const BEACH_LAWS:Source={title:'FIFA Beach Soccer Laws of the Game 2024-25',url:'https://www.the-aiff.com/media/uploads/2024/11/Beach-Soccer-Laws-of-the-Game-2024-25.pdf'};
const IFAB=(law:string,slug:string):Source=>({title:`IFAB Laws of the Game · ${law}`,url:`https://www.theifab.com/laws/latest/${slug}/`});
export type Magazine={id:string;shop:KonbiniShop;title:string;issue:string;cover:string;ink:string;headline:string;
 /** The mini-lesson: 2–4 short sentences. */
 lesson:string[];
 /** A one-question check (answer index into options). */
 check:{question:string;options:string[];answer:number};sources:Source[]};
export const MAGAZINES:Magazine[]=[
 {id:'offside',shop:'main',title:'KICK WEEKLY',issue:'Laws special',cover:'#2f8f8a',ink:'#fff6dc',headline:'Offside, made simple',
  lesson:['Being in an offside position is not an offence by itself.','It only counts when the ball is played to you by a team-mate and you get involved in play.','You can never be offside straight from a goal kick, a throw-in or a corner kick.'],
  check:{question:'Can you be offside straight from a throw-in?',options:['Yes','No'],answer:1},sources:[IFAB('Law 11 Offside','offside')]},
 {id:'throw-in',shop:'main',title:'TOUCHLINE',issue:'Skills issue',cover:'#e8744f',ink:'#fff6dc',headline:'The perfect throw-in',
  lesson:['Face the pitch with part of each foot on the touchline or on the ground outside it.','Use both hands and throw from behind and over your head.','A goal can’t be scored directly from a throw-in.'],
  check:{question:'Can you score directly from a throw-in?',options:['Yes','No'],answer:1},sources:[IFAB('Law 15 The Throw-in','the-throw-in')]},
 {id:'ball-size',shop:'cay',title:'BALL WORLD',issue:'Gear guide',cover:'#f2c14e',ink:'#3a2a05',headline:'Why size 5?',
  lesson:['Adult 11v11 matches use a size 5 ball: 68–70 cm around.','It weighs 410–450 grams at the start of the match, and must be round and made of a suitable material.','Futsal uses a smaller size 4 ball with a low bounce.'],
  check:{question:'How big around is a size 5 ball?',options:['50–55 cm','68–70 cm','80–85 cm'],answer:1},sources:[IFAB('Law 2 The Ball','the-ball'),{title:'FIFA Futsal Laws of the Game 2024-25 · Law 2 The Ball',url:'https://digitalhub.fifa.com/m/7b1da24ec7a25f67/original/Futsal-Laws-of-the-Game-2024-2025.pdf'}]},
 {id:'penalty',shop:'main',title:'SPOT KICK',issue:'Keepers special',cover:'#5b6fb8',ink:'#f3f0ff',headline:'Penalty kick rules',
  lesson:['The ball is placed on the penalty mark, 11 metres from the goal line.','The goalkeeper stays on the goal line, between the posts, until the ball is kicked.','Everyone else waits outside the penalty area until the kick is taken.'],
  check:{question:'Where must the keeper be when a penalty is kicked?',options:['On the goal line','On the penalty spot','Anywhere in the box'],answer:0},sources:[IFAB('Law 14 The Penalty Kick','the-penalty-kick'),IFAB('Law 1 The Field of Play','the-field-of-play')]},
 {id:'first-world-cup',shop:'main',title:'FOOTBALL HISTORY',issue:'Classics',cover:'#8a5a2b',ink:'#fff1d3',headline:'The first World Cup, 1930',
  lesson:['The first FIFA World Cup was played in Uruguay in 1930.','Uruguay, the hosts, won it, beating Argentina 4–2 in the final in Montevideo.','Only 13 teams took part. Today’s tournament has many more.'],
  check:{question:'Who won the first World Cup?',options:['Brazil','Uruguay','Italy'],answer:1},sources:[{title:'Wikipedia · 1930 FIFA World Cup',url:'https://en.wikipedia.org/wiki/1930_FIFA_World_Cup'}]},
 {id:'nadeshiko',shop:'cay',title:'KONBINI SPORTS',issue:'Japan special',cover:'#d8466f',ink:'#fff0f5',headline:'Japan’s world champions',
  lesson:['Japan’s women’s team, nicknamed Nadeshiko Japan, won the 2011 Women’s World Cup in Germany.','They beat the USA on penalties after a 2–2 draw in the final.','They came from behind twice in that final: a lesson in never giving up.'],
  check:{question:'How did Japan win the 2011 final?',options:['On penalties','3–0 in normal time','With a golden goal'],answer:0},sources:[{title:'Wikipedia · 2011 FIFA Women’s World Cup final',url:'https://en.wikipedia.org/wiki/2011_FIFA_Women%27s_World_Cup_final'}]},
 {id:'beach-soccer',shop:'cay',title:'SAND & SUN',issue:'Beach special',cover:'#e0a33a',ink:'#2a1a05',headline:'Beach soccer basics',
  lesson:['Beach soccer is five against five on sand, and one of the five is the goalkeeper.','Players swap in and out as often as they like, even while the ball is moving.','Everyone plays barefoot, so the ball is softer than a grass ball.'],
  check:{question:'How many players does a beach soccer team have on the sand?',options:['Five','Seven','Eleven'],answer:0},sources:[BEACH_LAWS]},
 {id:'sand-sprints',shop:'cay',title:'BEACH FIT',issue:'Training tips',cover:'#3f8f6c',ink:'#eafff4',headline:'Why sand is hard work',
  lesson:['Running on sand took about 1.6 times the energy of running on a firm surface in one study.','That’s why beach players train with short sprints and rests: quality beats distance.','Sand is also softer to land on, so there’s less pounding on your legs.'],
  check:{question:'Why do beach players train with short sprints?',options:['Sand takes much more energy to run on','Sand is faster','The pitch is longer'],answer:0},
  sources:[{title:'Lejeune, Willems & Heglund (1998) · Mechanics and energetics of human locomotion on sand · Journal of Experimental Biology 201',url:'https://doi.org/10.1242/jeb.201.13.2071'},{title:'Binnie et al. (2014) · Sand training: a review of current research and practical applications · Journal of Sports Sciences 32 (PubMed)',url:'https://pubmed.ncbi.nlm.nih.gov/?term=Binnie+2014+sand+training+review'}]},
];
export const magazine=(id:string)=>MAGAZINES.find(m=>m.id===id);
export const shopMagazines=(shop:KonbiniShop)=>MAGAZINES.filter(m=>m.shop===shop);
/** The stamp card spans both stores: every magazine read = a full card. */
export const STAMP_CARD_SIZE=MAGAZINES.length;

/** Cashier small talk per store: a greeting, then football tips and club facts, one per tap. */
export type Tip={text:string;kind:'tip'|'fact'|'culture';sources?:Source[]};
export type Cashier={id:string;name:string;role:string;greeting:string;tips:Tip[];
 /** Look: bean body/skin/hair and the shop uniform (lib/konbini/konbiniScene.ts applies it through npcDress + overrides). */
 look:{face:'light'|'warm'|'deep';character:'male'|'female';shirt:string;shirt2:string;headwear:'visor'|'cap'|'bucket'|'none'}};
const J_LEAGUE:Source={title:'Wikipedia · J1 League',url:'https://en.wikipedia.org/wiki/J1_League'};
const WWC2011:Source={title:'Wikipedia · 2011 FIFA Women’s World Cup final',url:'https://en.wikipedia.org/wiki/2011_FIFA_Women%27s_World_Cup_final'};
export const CASHIERS:Record<KonbiniShop,Cashier>={
 main:{id:'konbini-cashier-hana',name:'Hana',role:'Konbini cashier',greeting:'Irasshaimase! Welcome to the island Konbini. Snacks at the counter, magazines by the window!',
  look:{face:'warm',character:'female',shirt:'#2f8f8a',shirt2:'#ffd35c',headwear:'visor'},tips:[
  {kind:'tip',text:'Before the ball reaches you, take a quick look over your shoulder. Knowing where everyone is makes your next touch easier.'},
  {kind:'fact',text:'Japan’s top men’s league, the J.League, kicked off in 1993. Many towns have their own club.',sources:[J_LEAGUE]},
  {kind:'fact',text:'Nadeshiko Japan won the 2011 Women’s World Cup, beating the USA on penalties in the final.',sources:[WWC2011]},
  {kind:'tip',text:'Water before, during and after training. Grab a bottle from the drinks fridge!',sources:FOOD_SOURCES.slice(3)},
  {kind:'tip',text:'A rice ball an hour or two before you play is easy fuel. A big meal is better a few hours earlier.',sources:FOOD_SOURCES.slice(0,3)},
  {kind:'tip',text:'After a match, refuel with some carbohydrate and protein, like a tamago sando and milk, plus water.',sources:FOOD_SOURCES.slice(0,3)},
 ]},
 cay:{id:'konbini-cashier-kai',name:'Kai',role:'Beach Konbini cashier',greeting:'Irasshaimase! Aloha too! Fresh musubi, cold drinks, and sunscreen for the beach court!',
  look:{face:'deep',character:'male',shirt:'#f2a15f',shirt2:'#fff4dc',headwear:'bucket'},tips:[
  {kind:'culture',text:'Spam musubi is a favourite snack in Hawaii, where you’ll find it in convenience stores. It’s a take on the Japanese rice ball, musubi.',sources:[{title:'Wikipedia · Spam musubi',url:'https://en.wikipedia.org/wiki/Spam_musubi'}]},
  {kind:'fact',text:'Beach soccer teams can swap players as often as they like, even while the ball is moving. Fresh legs win on sand!',sources:[BEACH_LAWS]},
  {kind:'tip',text:'On a hot beach you sweat more, so sip water at every break. Don’t wait until you’re really thirsty.',sources:FOOD_SOURCES.slice(3)},
  {kind:'tip',text:'Short sprints with rests are the way to train on sand. Quality beats distance.',sources:[{title:'Lejeune, Willems & Heglund (1998) · Journal of Experimental Biology 201',url:'https://doi.org/10.1242/jeb.201.13.2071'}]},
  {kind:'fact',text:'Japan’s women won the 2011 World Cup after coming from behind twice in the final. Never give up!',sources:[WWC2011]},
  {kind:'tip',text:'Sweet treats like mango mochi are fine now and then. On training days, fuel up with rice, fruit and water.',sources:FOOD_SOURCES.slice(0,3)},
 ]},
};
export const CASHIER_NAME=CASHIERS.main.name,CASHIER_GREETING=CASHIERS.main.greeting,CASHIER_TIPS=CASHIERS.main.tips;

/** Shelf lessons (tap a shelf). */
export type ShelfId='rice'|'drinks'|'snacks'|'hot'|'gear'|'beach'|'magazines'|'counter'|'atm';
export const SHELF_LESSONS:Record<Exclude<ShelfId,'magazines'|'counter'|'atm'>,{title:string;lesson:string;sources:Source[]}>={
 rice:{title:'Rice case · fuel',lesson:'Rice, bread and fruit are carbohydrates, the main fuel your muscles use for sprints. A small rice ball 1–2 hours before training is easy on your tummy.',sources:FOOD_SOURCES.slice(0,3)},
 drinks:{title:'Drinks fridge · hydration',lesson:'Drink water before you play, at every break and afterwards. Don’t wait until you feel very thirsty, and tell your coach if you feel dizzy. Sports drinks are for long, hot sessions; water comes first.',sources:[FOOD_SOURCES[3],IFAB('Law 7 The Duration of the Match (drinks breaks)','the-duration-of-the-match')]},
 snacks:{title:'Snack shelf · match-day fuel',lesson:'Match day: a proper meal 3–4 hours before kick-off, a small familiar snack like a banana or rice ball 1–2 hours before, and a treat is fine now and then. Food is fuel, not a test.',sources:FOOD_SOURCES.slice(0,3)},
 hot:{title:'Hot counter · recovery',lesson:'After playing, protein like chicken, egg or fish helps your muscles recover, and rice or bread refills your energy.',sources:FOOD_SOURCES.slice(0,3)},
 beach:{title:'Beach corner',lesson:'Sunscreen, a hat and water are part of your beach-soccer kit. Players play barefoot on sand, so check the sand for anything sharp before a game.',sources:[BEACH_LAWS,FOOD_SOURCES[3]]},
 gear:{title:'Toys & gear',lesson:'A ball of your own means more touches. Juggling, wall passes and dribbling round cones all build close control.',sources:[]},
};

/**
 * The cashier as an island NPC (user, Sep 29 2026: "talking to the cashier should use the same slide-out as talking to other
 * NPCs"): the shared NpcConversation drawer and dialogue shape (lib/town/npcDialogues.ts). Topics are built from the store's
 * sourced tips above, so each cashier keeps their own lines. `fuelledUp` swaps the greeting for the daily-limit line.
 */
import type {NpcDefinition} from '../town/npcDialogues';
import {FUELLED_UP} from './food';
const TOPIC_PLAN:Record<KonbiniShop,{id:string;question:string;tip:number;follow:string;followTip:number}[]>={
 main:[{id:'tip',question:'Any football tips?',tip:0,follow:'One more tip?',followTip:5},
  {id:'fact',question:'Tell me a football fact!',tip:1,follow:'More about Japan’s football?',followTip:2},
  {id:'fuel',question:'What should I eat before training?',tip:4,follow:'And what should I drink?',followTip:3}],
 cay:[{id:'musubi',question:'What’s a Spam musubi?',tip:0,follow:'Is a sweet treat okay?',followTip:5},
  {id:'beach',question:'Any beach soccer tips?',tip:1,follow:'How do beach players train?',followTip:3},
  {id:'water',question:'What should I drink at the beach?',tip:2,follow:'Tell me a football story!',followTip:4}],
};
export function cashierNpc(shop:KonbiniShop,fuelledUp=false):NpcDefinition{
 const c=CASHIERS[shop];
 return {id:c.id,name:c.name,role:`${c.role} · ${shop==='cay'?'Coral Cay Konbini':'Island Square Konbini'}`,greeting:fuelledUp?`${FUELLED_UP} Water is always a good idea, though.`:c.greeting,x:0,z:0,
  character:c.look.character,face:c.look.face,clothing:shop==='cay'?'sunset':'classic',
  topics:TOPIC_PLAN[shop].map(t=>({id:t.id,question:t.question,answer:c.tips[t.tip].text,followUp:{question:t.follow,answer:c.tips[t.followTip].text}}))};
}

/**
 * Shelf stock that isn't for sale (user, Sep 30 2026: "not all the items are selectable"): every visible product on a zoomed
 * shelf can be tapped. Menu food opens its buy card; these open a look-only card with one football line, drawn from the
 * lessons and sources above (food as fuel, water first, IFAB Laws 2 and 4, the beach soccer laws).
 */
export type DecorInfo={label:string;jp:string;blurb:string;sources?:Source[]};
export const DECOR_INFO:Record<string,DecorInfo>={
 bagA:{label:'Seaweed crisps',jp:'のりチップス',blurb:'A salty snack bag: a treat now and then. On match day, rice and fruit fuel your legs better.',sources:FOOD_SOURCES.slice(0,3)},
 bagB:{label:'Veggie crisps',jp:'やさいチップス',blurb:'Crunchy and fun, but still a snack. Real vegetables with a meal help you recover after playing.',sources:FOOD_SOURCES.slice(0,3)},
 crackers:{label:'Senbei rice crackers',jp:'せんべい',blurb:'Rice crackers are made from rice, a carbohydrate: the main fuel for sprints.',sources:FOOD_SOURCES.slice(0,3)},
 banana:{label:'Banana',jp:'バナナ',blurb:'A banana 1–2 hours before kick-off is an easy, familiar snack for energy.',sources:FOOD_SOURCES.slice(0,3)},
 cans:{label:'Fizzy cans',jp:'たんさんジュース',blurb:'Sweet fizzy drinks are a sometimes treat. Water is what refills you after play.',sources:FOOD_SOURCES.slice(3)},
 noodles:{label:'Instant noodles',jp:'インスタントめん',blurb:'Warm noodles are a treat after a cold, rainy session. Real meals with rice, protein and vegetables come first.',sources:FOOD_SOURCES.slice(0,3)},
 bottleRow:{label:'Water bottles',jp:'ペットボトル',blurb:'Pack a full bottle in your kit bag and sip at every break, before you feel very thirsty.',sources:FOOD_SOURCES.slice(3)},
 cone:{label:'Training cone',jp:'コーン',blurb:'Set out cones and dribble round them: lots of small touches build close control.'},
 goal:{label:'Mini goal',jp:'ミニゴール',blurb:'Small goals reward accurate passes and shots, not just power.'},
 shinpads:{label:'Shin pads',jp:'すねあて',blurb:'Shin pads are compulsory kit in every match, worn under your socks.',sources:[IFAB('Law 4 The Players’ Equipment','the-players-equipment')]},
 pack:{label:'Card pack',jp:'カードパック',blurb:'Football cards tell the stories of famous players. Find packs on the gear shelf and in the vending machines.'},
 ball:{label:'Football',jp:'サッカーボール',blurb:'A size 5 match ball is 68–70 cm around. Younger players often use a smaller size 3 or 4.',sources:[IFAB('Law 2 The Ball','the-ball')]},
 beachball:{label:'Beach ball',jp:'ビーチボール',blurb:'Beach soccer uses a softer ball than grass football, because everyone plays barefoot.',sources:[BEACH_LAWS]},
 flipflops:{label:'Flip-flops',jp:'ビーチサンダル',blurb:'Beach soccer is played barefoot, so check the sand for anything sharp before a game.',sources:[BEACH_LAWS]},
 sunscreen:{label:'Sunscreen',jp:'ひやけどめ',blurb:'Sunscreen, a hat and water are part of your beach-soccer kit.',sources:[BEACH_LAWS,FOOD_SOURCES[3]]},
 surfboard:{label:'Surfboard',jp:'サーフボード',blurb:'Sand and surf build strong legs. Beach players train with short sprints and rests: quality beats distance.'},
};
