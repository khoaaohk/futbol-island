import type {Key,Pose} from './rig';
/**
 * cards-1970 · "The Junction": the content. Real history (1966 → 1970 → 1974) and the six practice calls, which are made-up
 * moments acted by silhouettes and judged by the IFAB Laws of the Game, Law 12 (Fouls and Misconduct). No real players appear
 * in the practice calls. Every history line is true and sourced in SOURCES (facts copied from lib/endgame/museum.ts are
 * word for word, tests/museum-exp-cards-1970.cjs checks it).
 */
export type Call='none'|'yellow'|'red';

// ---- History ------------------------------------------------------------------------------------------------------------
/** Copied word for word from the cards-1970 case (lib/endgame/museum.ts). */
export const CASE_FACTS={
 mexico:'Yellow and red cards were first used at the 1970 World Cup in Mexico.',
 aston:'English referee Ken Aston had the idea while waiting at traffic lights: yellow means careful, red means stop.',
 language:'Cards showed every player and fan the referee’s decision, whatever language they spoke.',
 forYourGame:'A yellow card is a warning. Stay calm and keep playing fairly.',
};
/** The 1966 story that led to the idea (sources: FIFA, Referee.com). */
export const STORY_1966=[
 'London, 1966. At the World Cup, England played Argentina.',
 'The German referee sent off Argentina’s captain, Antonio Rattín. They did not speak the same language, and Rattín would not leave the pitch.',
 'After the game, England’s Jack Charlton found out from a newspaper that he had been warned.',
 'Ken Aston was in charge of the World Cup referees. Driving home, he stopped at the traffic lights on Kensington High Street…',
];
/** After 1970 (sources: Topend Sports World Cup firsts, Guinness World Records). */
export const FIRSTS=[
 'The first yellow card at a World Cup went to Evgeny Lovchev of the Soviet Union, in the opening game of 1970.',
 'Nobody was shown a red card at the 1970 World Cup.',
 'The first World Cup red card came in 1974, for Carlos Caszely of Chile.',
];
/** Law 12's ladder, matched to the three lamps. */
export const LADDER:{call:Call;word:string;card:string;plain:string}[]=[
 {call:'none',word:'Careless',card:'Free kick, no card',plain:'A clumsy foul, without enough care.'},
 {call:'yellow',word:'Reckless',card:'Yellow card: a warning',plain:'Not caring about the danger to the other player.'},
 {call:'red',word:'Excessive force',card:'Red card: off',plain:'Too much force: it puts a player’s safety in danger.'},
];
export const TWO_YELLOWS='Two yellow cards in one game make a red card.';

export const SOURCES:{title:string;url:string}[]=[
 {title:'IFAB Laws of the Game · Law 12 Fouls and Misconduct',url:'https://www.theifab.com/laws/latest/fouls-and-misconduct/'},
 {title:'FIFA · 1966 World Cup: Gripping tales and inspirational traffic lights',url:'https://inside.fifa.com/news/1966-world-cup-gripping-tales-and-inspirational-traffic-lights-2812820'},
 {title:'Referee.com · 1966 World Cup: the Wembley debacle that gave soccer its card system',url:'https://www.referee.com/1966-world-cup-england-argentina-card-system/'},
 {title:'Topend Sports · World Cup football firsts',url:'https://www.topendsports.com/events/worldcupsoccer/firsts.htm'},
 {title:'Guinness World Records · First player to receive a red card at the FIFA World Cup',url:'https://www.guinnessworldrecords.com/world-records/482316-first-player-to-receive-a-red-card-at-the-fifa-world-cup'},
 {title:'Wikipedia · Ken Aston',url:'https://en.wikipedia.org/wiki/Ken_Aston'},
 {title:'Wikipedia · Penalty card',url:'https://en.wikipedia.org/wiki/Penalty_card'},
];

// ---- Poses --------------------------------------------------------------------------------------------------------------
const P=(lean:number,aL:[number,number],aR:[number,number],lL:[number,number],lR:[number,number],head=0):Pose=>({lean,head,aL,aR,lL,lR});
const LEGS:[[number,number],[number,number]]=[[3,-3],[-4,-3]];
export const POSES={
 stand:P(3,[6,14],[-6,14],...LEGS),
 ready:P(18,[20,30],[-10,40],[25,-45],[-10,-35]),
 run1:P(14,[-40,50],[45,70],[38,-25],[-28,-80]),
 run2:P(14,[45,70],[-40,50],[-28,-80],[38,-25]),
 slide:P(-55,[-70,10],[-40,30],[60,-50],[85,0],30),
 sit:P(15,[-30,0],[-20,10],[70,-110],[55,-80]),
 jump:P(20,[-40,40],[70,50],[75,-100],[-45,-70]),
 jump2:P(10,[30,40],[-20,40],[-10,-60],[60,-30]),
 lunge:P(-8,[-35,20],[30,30],[-15,-25],[72,-2]),
 stumble:P(45,[110,20],[130,10],[-35,-40],[25,-10],-10),
 fall:P(72,[150,0],[165,-10],[-50,-30],[-30,-10],-20),
 lie:P(90,[165,10],[150,30],[-86,-8],[-80,-40],-25),
 sorry:P(0,[150,15],[160,10],...LEGS),
 dive1:P(35,[150,-10],[165,0],[-15,-30],[20,-15],-10),
 dive2:P(68,[170,0],[175,-5],[-40,-10],[-25,-30],-20),
 pullout:P(-12,[-25,5],[-15,5],[5,-10],[-20,-10]),
 shrug:P(0,[-80,-20],[80,20],...LEGS),
 pulled:P(-22,[-60,30],[-30,60],[25,-30],[-25,-40],15),
 grab:P(22,[-35,30],[82,0],[38,-25],[-28,-80]),
 grab2:P(0,[-30,30],[78,8],[30,-15],[-15,-20]),
 launch:P(-12,[-50,20],[30,40],[55,-40],[80,-10]),
 studs:P(-32,[-80,10],[-40,20],[92,-4],[100,0],25),
 hit:P(-15,[150,30],[120,40],[55,-20],[70,-40],20),
 kickback:P(-4,[40,20],[-35,25],[2,-6],[-55,-75]),
 kick:P(-16,[-35,25],[50,20],[2,-6],[78,-4]),
 appeal:P(-4,[-8,12],[172,0],...LEGS),
 armup:P(4,[-15,15],[140,0],[5,-20],[-10,-25]),
 headdown:P(15,[5,10],[-5,10],...LEGS,25),
};
const K=(t:number,x:number,pose:Pose,lift=0):Key=>({t,x,pose,lift});
/** Running strides from x0 to x1, alternating legs. */
function run(x0:number,x1:number,t0:number,t1:number,n:number,start=0):Key[]{
 return Array.from({length:n+1},(_,i)=>K(t0+(t1-t0)*i/n,x0+(x1-x0)*i/n,(i+start)%2?POSES.run2:POSES.run1));
}

// ---- The six practice calls ---------------------------------------------------------------------------------------------
export type Fig={id:string;num:number;dir:1|-1;keys:Key[];keeper?:boolean};
export type Scene={
 id:string;watch:number;answer:Call;duration:number;/** x the camera centres on */focus:number;
 /** the key moment (the still for reduced motion) */moment:number;
 whistle?:number;impact?:{t:number;x:number;y:number};grab?:{from:string;to:string;t0:number;t1:number};goal?:boolean;
 figs:Fig[];ball:{t:number;x:number;y:number}[];
 verdict:string;law:string;why:string;note:{x:number;y:number;text:string;x2?:number;ly?:number};
};
export const SCENES:Scene[]=[
 {id:'tackle',focus:470,watch:4,answer:'none',duration:2.8,moment:1.45,
  figs:[
   {id:'a',num:9,dir:1,keys:[...run(150,400,0,1.2,5),K(1.35,450,POSES.jump,34),K(1.6,510,POSES.jump2,20),K(1.8,550,POSES.run1),...run(550,700,1.8,2.7,3).slice(1)]},
   {id:'d',num:4,dir:-1,keys:[K(0,640,POSES.stand),K(.3,630,POSES.ready),...run(620,590,.5,.95,2),K(1.15,580,POSES.slide),K(1.45,540,POSES.slide),K(1.8,520,POSES.slide),K(2.2,515,POSES.sit),K(2.75,512,POSES.stand)]},
  ],
  ball:[{t:0,x:180,y:0},{t:.4,x:250,y:0},{t:.8,x:330,y:0},{t:1.2,x:420,y:0},{t:1.45,x:452,y:0},{t:2.1,x:300,y:0},{t:2.8,x:262,y:0}],
  verdict:'Play on. No foul!',law:'Law 12 · a fair tackle',
  why:'Number 4 slid in and played the ball, not the player, and nobody was put in danger. So there is no foul and no card. Good tackling is part of the game.',
  note:{x:452,y:318,text:'Ball first'}},
 {id:'dive',focus:470,watch:9,answer:'yellow',duration:2.8,moment:1.55,whistle:2.0,
  figs:[
   {id:'a',num:9,dir:1,keys:[...run(150,400,0,1.15,5),K(1.3,425,POSES.dive1,18),K(1.5,450,POSES.dive2,22),K(1.75,470,POSES.lie),K(2.8,470,POSES.lie)]},
   {id:'d',num:4,dir:-1,keys:[K(0,650,POSES.stand),K(.5,640,POSES.run1),K(.8,630,POSES.run2),K(1.05,625,POSES.pullout),K(1.7,628,POSES.pullout),K(2.1,628,POSES.shrug),K(2.8,628,POSES.shrug)]},
  ],
  ball:[{t:0,x:175,y:0},{t:.4,x:245,y:0},{t:.8,x:320,y:0},{t:1.1,x:415,y:0},{t:1.2,x:432,y:0},{t:2,x:560,y:0},{t:2.8,x:585,y:0}],
  verdict:'Yellow card for diving.',law:'Law 12 · unsporting behaviour',
  why:'Look at the gap: nobody touched number 9. Pretending to be fouled is trying to trick the referee, so it is a yellow card. The game restarts with a free kick to the other team.',
  note:{x:552,y:300,x2:612,text:'No touch!'}},
 {id:'studs',focus:450,watch:4,answer:'red',duration:3,moment:1.5,whistle:1.75,impact:{t:1.48,x:500,y:310},
  figs:[
   {id:'a',num:9,dir:1,keys:[...run(280,480,0,1.4,5),K(1.55,495,POSES.hit,30),K(1.8,520,POSES.stumble,10),K(2.1,545,POSES.lie),K(3,545,POSES.lie)]},
   {id:'d',num:4,dir:1,keys:[...run(80,350,0,1.1,4),K(1.25,390,POSES.launch,22),K(1.5,425,POSES.studs,26),K(1.8,450,POSES.slide),K(2.3,455,POSES.sit),K(3,455,POSES.sit)]},
  ],
  ball:[{t:0,x:305,y:0},{t:.5,x:370,y:0},{t:1,x:440,y:0},{t:1.4,x:505,y:0},{t:1.6,x:525,y:0},{t:2.4,x:600,y:0},{t:3,x:615,y:0}],
  verdict:'Red card: serious foul play.',law:'Law 12 · excessive force',
  why:'Number 4 jumped in from behind with both feet and the studs showing. That puts the other player in danger of a bad injury. A tackle that endangers a player’s safety is a red card: off.',
  note:{x:505,y:298,text:'Both feet, studs up'}},
 {id:'trip',focus:470,watch:4,answer:'none',duration:2.8,moment:1.4,whistle:1.45,impact:{t:1.38,x:462,y:318},
  figs:[
   {id:'a',num:9,dir:1,keys:[...run(150,430,0,1.2,5),K(1.3,455,POSES.run2),K(1.45,480,POSES.stumble,6),K(1.75,520,POSES.fall),K(2.1,545,POSES.lie),K(2.8,545,POSES.lie)]},
   {id:'d',num:4,dir:-1,keys:[K(0,575,POSES.stand),K(.6,560,POSES.run1),K(.9,545,POSES.run2),K(1.15,535,POSES.lunge),K(1.45,530,POSES.lunge),K(1.85,530,POSES.stand),K(2.2,530,POSES.sorry),K(2.8,530,POSES.sorry)]},
  ],
  ball:[{t:0,x:175,y:0},{t:.4,x:245,y:0},{t:.8,x:320,y:0},{t:1.1,x:400,y:0},{t:1.25,x:440,y:0},{t:1.9,x:640,y:0},{t:2.8,x:700,y:0}],
  verdict:'Foul! Free kick, but no card.',law:'Law 12 · careless',
  why:'Number 4 was late and clumsy and tripped number 9, so it is a foul and a free kick. Careless means not taking enough care. The Law says a careless foul needs no card, and saying sorry helps too.',
  note:{x:462,y:316,text:'Late and clumsy'}},
 {id:'shirt',focus:480,watch:4,answer:'yellow',duration:2.8,moment:1.4,whistle:1.7,grab:{from:'d',to:'a',t0:1.1,t1:1.95},
  figs:[
   {id:'a',num:9,dir:1,keys:[...run(260,520,0,1,4),K(1.15,545,POSES.pulled),K(1.5,560,POSES.pulled),K(1.9,565,POSES.stand),K(2.3,565,POSES.shrug),K(2.8,565,POSES.shrug)]},
   {id:'d',num:4,dir:1,keys:[...run(140,440,0,1,4),K(1.15,475,POSES.grab),K(1.5,492,POSES.grab2),K(1.95,495,POSES.stand),K(2.8,495,POSES.headdown)]},
  ],
  ball:[{t:0,x:290,y:0},{t:.5,x:400,y:0},{t:1,x:540,y:0},{t:1.1,x:570,y:0},{t:2,x:720,y:0},{t:2.8,x:760,y:0}],
  verdict:'Yellow card.',law:'Law 12 · stopping a promising attack',
  why:'Number 9 was running clear with the ball. Number 4 held the shirt to stop them. Holding is a foul, and unfairly stopping a promising attack is a yellow card.',
  note:{x:530,y:250,ly:150,text:'Holding the shirt'}},
 {id:'handball',focus:540,watch:5,answer:'red',duration:2.8,moment:1.2,whistle:1.6,impact:{t:1.2,x:657,y:144},goal:true,
  figs:[
   {id:'k',num:1,dir:-1,keeper:true,keys:[K(0,590,POSES.lie)]},
   {id:'a',num:9,dir:1,keys:[K(0,330,POSES.run1),K(.3,350,POSES.run2),K(.5,365,POSES.kickback),K(.65,375,POSES.kick),K(.9,385,POSES.stand),K(1.5,390,POSES.stand),K(1.9,390,POSES.appeal),K(2.8,390,POSES.appeal)]},
   {id:'d',num:5,dir:-1,keys:[K(0,700,POSES.stand),K(.6,700,POSES.stand),K(.9,700,POSES.ready),K(1.1,698,POSES.armup,10),K(1.3,698,POSES.armup,12),K(1.6,700,POSES.stand),K(2.8,700,POSES.headdown)]},
  ],
  ball:[{t:0,x:398,y:0},{t:.62,x:398,y:0},{t:.95,x:540,y:150},{t:1.2,x:655,y:184},{t:1.5,x:615,y:70},{t:1.7,x:595,y:0},{t:2.2,x:560,y:0},{t:2.8,x:550,y:0}],
  verdict:'Red card, and a penalty.',law:'Law 12 · stopping a goal with a hand',
  why:'The keeper was beaten and the ball was going in. Number 5 is not the goalkeeper, but stopped it with a hand. Stopping a sure goal by handball is a red card, and here it also gives a penalty kick.',
  note:{x:657,y:144,text:'A hand stops a goal'}},
];
export const CALLS:{call:Call;label:string;sub:string;key:string}[]=[
 {call:'red',label:'Red',sub:'Stop: off',key:'R'},
 {call:'yellow',label:'Yellow',sub:'Careful: a warning',key:'Y'},
 {call:'none',label:'No card',sub:'Play on or free kick',key:'G'},
];
