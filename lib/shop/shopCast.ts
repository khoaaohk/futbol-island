import type {NpcDefinition} from '../town/npcDialogues';
import type {NpcAge} from '../town/townsfolkCast';
import {CLERK,type ShopStation} from './shopLayout';

/**
 * Who works and shops in the Kit Shop (Oct 12 2026, user: "there should be npcs here along with clerk"). Same shape as the island's
 * townsfolk (lib/town/townsfolkCast.ts: persona, greeting, rotating `lines` for lib/town/npcOpeners.ts, one topic with a
 * follow-up) and the same rules (docs/npc-cast.md): football at the centre, kid-friendly and short, no brands, no real clubs or
 * players, facts that are true (sources: docs/npc-cast.md, "Kit Shop"). Kit facts follow the IFAB Laws of the Game (Law 2 The Ball, Law 4 The Players' Equipment).
 *
 * Heat: the clerk plus at most SHOP_SHOPPER_CAP shoppers (tests/shop-room.cjs holds the cap). Each shopper has a few display spots
 * and holds still at each (no posing at all while still), walking between them one at a time.
 */
export const SHOP_SHOPPER_CAP=5;
/** A place to stand at a display: where, which way to face (yaw: 0 = +z, π = toward the back wall) and what to look at. */
export type ShopSpot={x:number;z:number;yaw:number;look:{x:number;y:number;z:number};
 /** Hold up a boot (the existing arm-raised `called` pose, with one small boot in the hand). */
 holdBoot?:boolean};
export type ShopNpc={def:NpcDefinition;age:NpcAge;top:string;top2:string;spots:ShopSpot[];
 /** A child walks with this shopper (they set off together, one spot each). */
 with?:string};

type Who={ch:'male'|'female';face:'light'|'warm'|'deep';skin:number;clothing:'classic'|'coast'|'sunset';hair?:NonNullable<NpcDefinition['look']>['hair'];hairColor?:string;headwear?:NonNullable<NpcDefinition['look']>['headwear']};
type Talk=[question:string,answer:string,followQuestion:string,followAnswer:string];
function shopper(id:string,name:string,role:string,who:Who,persona:string,greeting:string,lines:string[],talk:Talk):NpcDefinition{
 return {id:`shop-${id}`,name,role:`${role} · Kit Shop`,x:0,z:0,character:who.ch,face:who.face,clothing:who.clothing,greeting,lines,persona,
  look:{skin:who.skin,hair:who.hair,hairColor:who.hairColor,headwear:who.headwear},
  topics:[{id:'chat',question:talk[0],answer:talk[1],followUp:{question:talk[2],answer:talk[3]}}]};
}

/** The clerk behind the till, in the KIT SHOP staff top (navy with the shop's orange). */
export const SHOP_CLERK={
 def:{id:'shop-clerk-femi',name:'Femi',role:'Kit Shop clerk',x:CLERK.x,z:CLERK.z,character:'male',face:'deep',clothing:'classic',
  look:{skin:6,hair:'crop',headwear:'cap'},persona:'The Kit Shop’s clerk: he has fitted boots for half the island and knows a story behind every bit of kit.',
  greeting:'Welcome to the Kit Shop! Want to design your own kit?',
  lines:[
   'Shirt numbers help the referee and your teammates spot exactly who is who. Teams in England first wore them in league matches in 1928.',
   'Studs depend on the pitch: moulded studs for firm grass, screw-in studs for soft mud, lots of small rubber studs for artificial turf, and flat soles indoors.',
   'Balls have changed a lot: from leather with laces, to 32 stitched panels, to just a few bonded panels for a rounder, truer flight.',
   'Law 4 says the two teams must wear colours that are easy to tell apart. That’s why every club has a second kit.',
  ],
  topics:[
   {id:'numbers',question:'Why do shirts have numbers?',answer:'So the referee, your teammates and the fans can tell every player apart, even from far away. Long ago, numbers 1 to 11 showed your position: 1 was the goalkeeper.',
    followUp:{question:'Can I pick my own number?',answer:'In our Jersey studio you can! Pick any number from 1 to 99. In most competitions, each player in a squad keeps their own number all season.'}},
   {id:'studs',question:'Why are studs different?',answer:'Grip depends on the ground. Moulded studs suit firm grass, longer screw-in studs bite into soft mud, small rubber studs suit artificial turf and flat soles grip indoor courts.',
    followUp:{question:'What else do I need on my legs?',answer:'Shin guards! Law 4 says every player must wear them, covered by the socks, along with a shirt with sleeves, shorts, socks and boots.'}},
   {id:'panels',question:'Why do balls have panels?',answer:'A ball is stitched or bonded from flat panels. The classic ball had 32: 12 pentagons and 20 hexagons. Newer balls use fewer, bonded panels, so they’re rounder and fly more truly.',
    followUp:{question:'How big is a match ball?',answer:'Law 2 says a size 5 match ball is 68 to 70 centimetres around and weighs 410 to 450 grams when the match starts.'}},
  ]} satisfies NpcDefinition,
 top:'#1f2a44',top2:'#ef5a2f',
};

/** The shoppers: five, browsing the three studio walls and the folded shirts. */
export const SHOP_SHOPPERS:ShopNpc[]=[
 {age:'kid',top:'#2a5bd7',top2:'#f2c230',
  def:shopper('yuna','Yuna','Kid choosing kit colours',{ch:'female',face:'light',skin:2,clothing:'coast',hair:'ponytail'},
   'A nine-year-old picking the colours for her street team’s first kit.',
   'I’m choosing colours for my team’s new kit. They have to look really different from the other team’s!',
   ['Law 4 says the two teams must wear colours that are easy to tell apart, and so do the referees.','The goalkeeper wears a different colour from everyone, so you can see who can use their hands in the box.','Stripes, hoops or a sash? I like hoops: they go round the shirt.'],
   ['Why do teams have away kits?','If both teams’ colours look alike, players and the referee could mix them up. So one team, usually the visitors, wears its other kit.',
    'What about goalkeepers?','Keepers wear a colour that’s different from both teams and the referee, so everyone knows who can handle the ball in the penalty area.']),
  spots:[{x:-5.3,z:-5.65,yaw:Math.PI,look:{x:-6.3,y:1.6,z:-7}},{x:-2.5,z:-5.7,yaw:Math.PI,look:{x:-1.7,y:3.1,z:-7}}]},
 {age:'teen',top:'#1f8a5b',top2:'#fbfbf9',
  def:shopper('tane','Tane','Teen trying boots',{ch:'male',face:'warm',skin:4,clothing:'sunset',hair:'curls'},
   'A teenage winger from Aotearoa New Zealand who checks every stud before he buys.',
   'Feel these studs! Firm-ground boots like these are made for real grass.',
   ['On artificial turf, lots of short rubber studs spread your grip.','Indoor and futsal shoes have flat soles that grip the court.','Law 4 says boots are part of your kit, and nothing you wear can be dangerous to anyone.'],
   ['Which studs should I pick?','Match them to your pitch: moulded studs for firm grass, longer screw-in studs for soft, muddy grass, lots of small studs for artificial turf and flat soles indoors.',
    'Do fancy boots make you better?','Not really! Boots that fit well and suit the pitch help most. Practice is what makes you better.']),
  spots:[{x:2.4,z:-5.7,yaw:Math.PI,look:{x:2.3,y:1.7,z:-7},holdBoot:true},{x:5.5,z:-5.65,yaw:Math.PI,look:{x:5.5,y:2.4,z:-7},holdBoot:true}]},
 {age:'elder',top:'#e8e2d0',top2:'#7a4a2a',
  def:shopper('yusuf','Yusuf','Grandad at the ball wall',{ch:'male',face:'deep',skin:5,clothing:'classic',hair:'crop',hairColor:'#ece9e2'},
   'A grandad who played on dusty pitches as a boy and still loves the feel of a new ball.',
   'When I was a boy, balls were leather with laces. In the rain they soaked up water and got very heavy!',
   ['The classic ball has 32 panels: 12 pentagons and 20 hexagons.','Black and white panels made the ball easier to follow on black-and-white television.','Today’s World Cup balls have far fewer panels. The 2014 one had just six.'],
   ['Why did balls change?','Leather soaked up water, so balls got heavy in the rain. Modern covers stay light, and fewer panels make the ball rounder, so it flies more predictably.',
    'What size ball should I use?','Younger players often use a smaller size 3 or 4 ball. Size 5 is the full-size ball for teenagers and adults.']),
  spots:[{x:6.85,z:-2.9,yaw:Math.PI/2,look:{x:8,y:1.9,z:-3}},{x:6.85,z:-5.1,yaw:Math.PI/2,look:{x:8,y:1.2,z:-5.6}}]},
 {age:'adult',top:'#7b4fd6',top2:'#fbfbf9',
  def:shopper('nadia','Nadia','Parent buying first shin guards',{ch:'female',face:'warm',skin:3,clothing:'classic',hair:'long'},
   'A mum kitting out her son for his first season with the island under-8s.',
   'We’re getting Oskar his first shin guards. Law 4 says every player must wear them in a match.',
   ['Shin guards go under your socks and protect the front of your legs.','The full kit list in the Laws is short: a shirt with sleeves, shorts, socks, shin guards and boots.','No jewellery when you play. Take it off before the match so nobody gets hurt.'],
   ['What do I need to play a match?','Law 4 lists it: a shirt with sleeves, shorts, socks, shin guards and footwear. Goalkeepers can also wear tracksuit bottoms.',
    'Can I wear my bracelet?','No. Jewellery isn’t allowed in a match because it could hurt you or another player. Take it off before you play.']),
  spots:[{x:-6.85,z:-2.5,yaw:-Math.PI/2,look:{x:-8,y:1.2,z:-2.5}},{x:-6.85,z:-4.6,yaw:-Math.PI/2,look:{x:-8,y:1.9,z:-4.6}}]},
 {age:'kid',top:'#ef5a2f',top2:'#1f2a44',with:'shop-nadia',
  def:shopper('oskar','Oskar','Kid picking a shirt number',{ch:'male',face:'warm',skin:3,clothing:'coast',hair:'tuft'},
   'Nadia’s seven-year-old son, about to play his first season, who has already chosen his shirt number.',
   'I want number 7 on my shirt! That’s a winger’s number.',
   ['A long time ago, numbers 1 to 11 showed where you played. Number 1 was always the goalkeeper.','Now players can pick lots of numbers, but keepers still often wear 1.','My mum says shin guards first, then the cool stuff!'],
   ['Why do players wear numbers?','So the referee, teammates and fans can tell everyone apart. In the old days, numbers 1 to 11 matched your position on the pitch.',
    'Which number is the striker?','Traditionally, 9 was the centre forward, 7 and 11 were the wingers and 1 was the goalkeeper.']),
  spots:[{x:-6.25,z:-1.75,yaw:-Math.PI/2-.5,look:{x:-6.85,y:1.3,z:-2.5}},{x:-6.25,z:-3.9,yaw:-Math.PI/2-.5,look:{x:-6.85,y:1.3,z:-4.6}}]},
];
export type ShopNpcId=string;
/** Every chat partner in the shop by id (the clerk first). */
export const shopNpcDefs=():NpcDefinition[]=>[SHOP_CLERK.def,...SHOP_SHOPPERS.map(s=>s.def)];
/** What a station is called in the clerk's "Show me" replies. */
export const SHOW_ME:Record<ShopStation,string>={jersey:'Show me the jersey studio',boots:'Show me the boot studio',ball:'Show me the ball studio'};
