import type {NpcDefinition} from './npcDialogues';
import {SUMMIT_PATHS,SUMMIT_LANDMARKS} from './summitIsle';
import {summitSnackSpot} from './vendingPlaces';

/**
 * Summit Isle's hikers and its park ranger (Oct 12 2026, user: "a few hikers and a park ranger, maybe 6-8 new characters.
 * The ranger offers a 'trail clean-up' job"). Built the same way the main island's townsfolk cast is (lib/town/townsfolkCast.ts
 * folk(), lib/graphics/islandNpcs.ts runtime): a persona, a greeting, rotating lines (lib/town/npcOpeners.ts) and one topic with
 * a follow-up, pushed into NPC_DIALOGUES like lib/town/coralCayNpcs.ts and lib/town/eastPierNpcs.ts (not into
 * TOWNSFOLK_CAST, which tests/townsfolk-cast.cjs pins to its own fixed area counts). Positions are runtime points on
 * SUMMIT_PATHS and summitSnackSpot() (not fixed coordinates), so they follow the terrain agent's reshaping; everyone but the
 * one seated hiker has no `pose`, so lib/graphics/islandNpcs.ts snaps them onto the nearest walkable ground within 12 m.
 *
 * Football-centred lines, kid-friendly (ages 7-12), 1-2 sentences, no betting/alcohol/brands/politics/put-downs (the same
 * rules as docs/npc-cast.md). Verified facts and sources:
 *  - Hernando Siles Stadium, La Paz, Bolivia, 3,600 m: FIFA banned competitive football above 2,500 m on 27 May 2007, raised
 *    the limit to 3,000 m after protests on 27 June 2007 (La Paz remained excluded), then revoked the altitude ban entirely
 *    on 27 May 2008. https://en.wikipedia.org/wiki/Hernando_Siles_Stadium ;
 *    https://www.npr.org/2007/06/06/10763455/high-altitude-soccer-matches-banned
 *  - Estadio Rodrigo Paz Delgado, Quito, Ecuador, about 2,850 m: LDU Quito's home ground, where visiting teams from lower
 *    altitudes often find the thin air hard going. https://en.wikipedia.org/wiki/Estadio_Rodrigo_Paz_Delgado
 *  - Addis Ababa, Ethiopia, about 2,355 m above sea level (a widely documented fact about the city, used here only as the
 *    height hill-trainers there live and train at, not as any claim about a specific club).
 *    https://en.wikipedia.org/wiki/Addis_Ababa
 *  - Hydration lines follow the same NHS / Sports Dietitians Australia guidance already cited in lib/town/drinkMachines.ts
 *    (DRINK_SOURCES.nhs, DRINK_SOURCES.sda): drink before you feel thirsty, keep sipping through exercise.
 */
const P0=SUMMIT_PATHS[0],P1=SUMMIT_PATHS[1],P2=SUMMIT_PATHS[2];
const at=(path:typeof P0,i:number)=>path[Math.min(path.length-1,i)];
const snack=summitSnackSpot();
/** The seated hiker sits just off the stand's walk-up side, facing it (no `pose` radius search, so this must already be sand). */
const HAMISH={x:snack.x-2.3,z:snack.z+.4};
const hamishYaw=Math.atan2(snack.x-HAMISH.x,snack.z-HAMISH.z);

export const SUMMIT_ISLE_NPCS:NpcDefinition[]=[
 {id:'summit-ranger',name:'Sage',role:'Park ranger',pursuit:'WATCHING THE TRAILHEAD',
  x:P0[0].x-4,z:P0[0].z+3,character:'female',face:'warm',clothing:'classic',body:'strong',age:'adult',
  look:{skin:4,hair:'crop',top:'#5f7a4a',headwear:'cap',headwearColor:'#3f5230'},
  persona:'A park ranger who keeps Summit Isle’s one trail clear and teaches hikers to leave no trace behind them.',
  greeting:'Welcome to the trailhead! I keep this trail clear for every hiker and player. Fancy a trail clean-up shift?',
  lines:[
   'A clear trail is like a clear pitch: everyone moves more safely when the ground is tidy.',
   'Pack out everything you pack in. That rule works on a trail and on a football pitch.',
   'Thank you for every bit of litter you clear. Small jobs like this keep the trail ready for the next hiker.',
  ],
  topics:[{id:'ranger',question:'Why does the trail need a ranger?',
   answer:'I check the path is clear and safe, and clear away any litter hikers drop, so the next person’s walk up the mountain is just as good as the last.',
   followUp:{question:'How can I help?',answer:'Take the trail clean-up shift: collect the litter you find along the trail and the beach, then bring it back to me for some coins.'}}]},

 {id:'summit-esperanza',name:'Esperanza',role:'Mountain hiker',pursuit:'HIKING THE SWITCHBACKS',
  x:at(P1,10).x,z:at(P1,10).z,character:'female',face:'warm',clothing:'sunset',body:'slim',age:'adult',
  look:{skin:3,hair:'ponytail'},
  persona:'A Bolivian hiker who grew up watching football matches played high in the Andes, where visitors get out of breath.',
  greeting:'These switchbacks remind me of home. My country’s capital, La Paz, is so high that visiting teams struggle just to breathe!',
  lines:[
   'La Paz sits 3,600 metres up, so the air there carries less oxygen than at sea level.',
   'In 2007 FIFA tried to ban football above 2,500 metres, which would have stopped La Paz hosting matches.',
   'Bolivia and other mountain countries protested, and FIFA lifted the ban completely in 2008.',
  ],
  topics:[{id:'altitude',question:'Why is football harder high up a mountain?',
   answer:'Thinner air carries less oxygen, so players tire faster and the ball can fly a little further through it. Home teams who train there every day feel it far less than visitors do.',
   followUp:{question:'What happened with La Paz and FIFA?',answer:'FIFA tried to ban competitive matches above 2,500 metres in 2007, which would have shut out La Paz at 3,600 metres. After protests from Bolivia and its neighbours, FIFA dropped the ban completely in 2008.'}}]},

 {id:'summit-kusi',name:'Kusi',role:'Hillside football fan',pursuit:'CLIMBING TO THE SUMMIT PITCH',
  x:at(P1,45).x,z:at(P1,45).z,character:'male',face:'deep',clothing:'coast',body:'slim',age:'teen',
  look:{skin:5,hair:'tuft'},
  persona:'A teenager from Quito, Ecuador, who says his home team’s mountain air is its biggest secret weapon.',
  greeting:'Climbing to the Summit 5s pitch is good practice for me. My club back home plays almost 2,850 metres up a mountain!',
  lines:[
   'LDU Quito play home games almost 2,850 metres above sea level.',
   'Visiting teams from lower cities often find that thin air hard going.',
   'Players who live up high get used to it. Visitors need time to adjust, and matches do not wait for them.',
  ],
  topics:[{id:'quito',question:'Why do visiting teams struggle in Quito?',
   answer:'Estadio Rodrigo Paz Delgado sits almost 2,850 metres above sea level. Players who fly in from lower, thicker air can feel short of breath long before players who train there every day do.',
   followUp:{question:'Is that fair?',answer:'Every stadium has its own challenge, whether that is altitude, heat, wind or a loud crowd. Great teams learn to handle whatever the ground in front of them throws at them.'}}]},

 {id:'summit-wren',name:'Wren',role:'Hill-running kid',pursuit:'RACING UP THE SWITCHBACKS',
  x:at(P2,5).x,z:at(P2,5).z,character:'female',face:'light',clothing:'coast',age:'kid',
  look:{skin:0,hair:'puffs'},
  persona:'A nine-year-old who races herself up every switchback and always stops to catch her breath at the top.',
  greeting:'I just ran the whole beach path up to the switchbacks! My legs are tired, but climbing makes them stronger for football.',
  lines:[
   'Running uphill works your legs harder than running on flat grass.',
   'I always walk back down slowly. My coach says that helps my muscles recover.',
   'Hills are like a free training ground. No cones needed!',
  ],
  topics:[{id:'hills',question:'Does running uphill help my football?',
   answer:'Yes. Running up a slope makes your legs push harder with every stride, which can build the same leg strength you use to sprint and jump on the pitch.',
   followUp:{question:'What should I do after a hill run?',answer:'Walk back down slowly instead of running. It gives your muscles an easier way back and lets them recover before you play again.'}}]},

 {id:'summit-kaia',name:'Kaia',role:'Trail guide',pursuit:'WALKING THE COAST PATH',
  x:SUMMIT_LANDMARKS.westBeach.x,z:SUMMIT_LANDMARKS.westBeach.z,character:'female',face:'deep',clothing:'coast',body:'balanced',age:'adult',
  look:{skin:6,hair:'long'},
  persona:'A trail guide who always checks that hikers have water with them before they start climbing.',
  greeting:'Before you climb, have you got water? Climbing in the sun is thirsty work, just like a hot match.',
  lines:[
   'Drink water before you start climbing, not just once you feel thirsty.',
   'The little Konbini stand by the sandbar sells water and snacks for the climb.',
   'A tired, thirsty body makes more mistakes. Hikers and footballers both need to stay topped up.',
  ],
  topics:[{id:'water',question:'Why drink water before I climb?',
   answer:'By the time you feel thirsty you are already a little low on fluid. Drinking before you start keeps your body cool and your legs working well all the way up.',
   followUp:{question:'What else helps on a long climb?',answer:'Short rests, a snack for energy and sensible shoes all help. Those same ideas keep footballers going through a long, hot match.'}}]},

 {id:'summit-desta',name:'Desta',role:'Hill-training elder',pursuit:'WALKING THE TRAIL SLOWLY AND STEADILY',
  x:at(P1,80).x,z:at(P1,80).z,character:'male',face:'deep',clothing:'classic',age:'elder',
  look:{skin:7,hair:'none',hairColor:'#ece9e2'},
  persona:'A grandparent from Ethiopia’s highlands who believes a steady hill walk builds a strong heart for any sport.',
  greeting:'Where I grew up, the capital Addis Ababa sits about 2,355 metres up, and everyone trains on hills just like this one.',
  lines:[
   'Ethiopia’s highlands have produced many great distance runners who train on steep hills every day.',
   'A steady pace up a long hill builds the same strong heart and lungs that help you run for a whole match.',
   'Slow and steady gets you to the top. Rushing just tires you out early.',
  ],
  topics:[{id:'steady',question:'Why do hills help my fitness?',
   answer:'Climbing makes your heart and lungs work harder than walking on the flat, so over time your body gets better at carrying oxygen to your muscles: the same fitness that helps you run for a full match.',
   followUp:{question:'Is it bad to get out of breath on a climb?',answer:'No, that is normal. Slow down, breathe steadily and keep going at a pace you can hold. That is how fitness builds, step by step.'}}]},

 {id:'summit-hamish',name:'Hamish',role:'Resting hiker',pursuit:'RESTING AT THE SNACK STAND',
  x:HAMISH.x,z:HAMISH.z,character:'male',face:'light',clothing:'sunset',age:'adult',body:'strong',
  look:{skin:1,hair:'curls'},pose:'sit',workYaw:hamishYaw,
  persona:'A hillwalker from Scotland who swears a cold drink at the top of a climb tastes better than any trophy.',
  greeting:'Made it down to the sandbar! A short rest here, and I will cross back to Coral Cay with my legs still working.',
  lines:[
   'Hillwalking back home taught me to always carry water and a small snack.',
   'A climb feels longer going up than coming down. Pace yourself on the way there.',
   'This little stand is perfect: water, a snack, and a seat before I carry on.',
  ],
  topics:[{id:'rest',question:'Why rest partway through a hike?',
   answer:'A short rest lets your legs recover and gives you a chance to drink and eat something before you carry on, so the second half of the climb feels easier than it otherwise would.',
   followUp:{question:'Does that matter in a match too?',answer:'Yes. That is exactly what half-time is for: a breather, a drink, and a plan for the second half.'}}]},
];
