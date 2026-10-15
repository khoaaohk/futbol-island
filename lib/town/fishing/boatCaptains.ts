import type {NpcDefinition} from '../npcDialogues';
import {BOAT_DECK_Y,DEEP_SEA_BOATS} from './deepSeaBoatData';
import {landableDeckHeight} from '../landableDecks';
import {LEGEND_INFO,legendId} from './legendary';

/**
 * The two deep-sea boats' crews (Oct 15 2026, user: "there needs to be an NPC on each boat to explain how it works and also give
 * facts about how fishing or fish is related to football"). Captain Marina on the Deep Sea Boat, Skipper Kofi on the Summit Deep
 * Boat. They use the standard townsfolk runtime and conversation (lib/graphics/islandNpcs.ts, components/NpcConversation.tsx;
 * pushed into NPC_DIALOGUES like eastPierNpcs.ts), so the Talk prompt goes through the HUD focus arbiter like every islander
 * (Talk and Fish share a tier: the nearer one wins, and the captain stands 2.5 m+ from the fishing stand, so on the stand Fish wins).
 *
 *  - FIRST chat: the greeting is the short "how it works on the boat" (deep water, bigger fish, slower bites, hotspots, aimed
 *    casting, the fight, the legend, requests). The topics hold the longer how-to answers.
 *  - LATER chats: rotating fish-and-football facts (lib/town/npcOpeners.ts: each new chat opens with the next line). Text only:
 *    NPC chat is not voiced in this game.
 *  - They stand on the aft deck by the wheelhouse door, on the PORT side (the angler casts off starboard): clear of the fishing
 *    stand, the cast line, the camera (which looks back from out over the starboard water) and the stern. `floor` keeps their feet
 *    on the deck as it heaves (the registered deck's live height, landableDecks.ts), and no wander route is planned for them
 *    (islandNpcs.ts: a `floor` townsperson idles in place). Heat: the shared townsfolk runtime (drawn and posed only near and on
 *    screen, frozen otherwise); no new draws beyond one more townsperson each.
 *
 * Facts (kid-friendly, 1–2 sentences, checked 15 Oct 2026; sources):
 *  - Brighton & Hove Albion, "The Seagulls": https://en.wikipedia.org/wiki/Brighton_%26_Hove_Albion_F.C.
 *  - Grimsby Town fans' inflatable "Harry Haddock", since 1989: https://gtfc.co.uk/the-return-of-harry-haddock/ (fishCatalog.ts)
 *  - Fleetwood Town's "Cod Army": https://en.wikipedia.org/wiki/Fleetwood_Town_F.C. (fishCatalog.ts)
 *  - Southend United, "The Shrimpers": https://en.wikipedia.org/wiki/Southend_United_F.C. (fishCatalog.ts)
 *  - Málaga CF, "Los Boquerones" (anchovies): https://en.wikipedia.org/wiki/M%C3%A1laga_CF (fishSpecials.ts)
 *  - Paul the Octopus, 8 of 8 at the 2010 World Cup: https://en.wikipedia.org/wiki/Paul_the_Octopus (fishCatalog.ts)
 *  - Bar-Eli et al. (2007), 286 penalties: https://www.sciencedirect.com/science/article/abs/pii/S0167487006001048 (KEEPER_LESSONS)
 *  - Penalty mark 11 m (12 yards): https://en.wikipedia.org/wiki/Penalty_kick_(association_football)
 *  - Fish schools and predators: https://en.wikipedia.org/wiki/Shoaling_and_schooling
 *  - Spain's Euro 2008, World Cup 2010, Euro 2012 and tiki-taka: https://en.wikipedia.org/wiki/Tiki-taka
 *  - Hakan Şükür, 10.8 s, 2002: https://en.wikipedia.org/wiki/Hakan_%C5%9E%C3%BCk%C3%BCr (deepSeaFish.ts)
 *  - Bramall Lane, first floodlit match, 14 Oct 1878: https://en.wikipedia.org/wiki/Bramall_Lane (deepSeaFish.ts)
 *  - Vanishing spray, World Cup 2014: https://en.wikipedia.org/wiki/Vanishing_spray (deepSeaFish.ts)
 *  - Santos "Peixe": https://en.wikipedia.org/wiki/Santos_FC (fishCatalog.ts)
 *  - Comoros "Les Cœlacanthes": https://en.wikipedia.org/wiki/Comoros_national_football_team (fishSpecials.ts)
 *  - Yokohama F. Marinos ("sailors"): https://www.f-marinos.com/en/club (fishCatalog.ts)
 *  - St. John's SC "Marlins", Gouyave, Grenada: https://en.wikipedia.org/wiki/St._John%27s_SC (deepSeaFish.ts)
 *  - Plymouth Argyle's crest and the Mayflower, 1620: https://en.wikipedia.org/wiki/Plymouth_Argyle_F.C.
 * Coaching comparisons (reading the water, patience, teamwork) are phrased as advice, not facts.
 */
/** Boat-local standing point (bow +x, starboard +z): the forward end of the aft deck, port side, by the wheelhouse door. */
export const CAPTAIN_LOCAL={x:-.15,z:-1.1};
const HOW_TO_GREETING='Welcome aboard! Out here the water is deep, so bigger fish swim below, but they take longer to rise to your float. Look for diving gulls or a bait ball: cast there and land in new water each time.';
const FIGHT_ANSWER='Drag on the water to aim, let go to cast, then watch the float. Wait for the real plunge, not the nibbles. Hold Reel to wind in, ease off when the line strains, and swipe the other way when a fish runs. Easy reel in the settings makes it one tap at a time.';
const legendLine=(spot:string)=>{const L=LEGEND_INFO[legendId(spot)];return L?`${L.clue} Help the islanders with their fishing requests and you will hear more about it. Catch it once, then let it go.`:'';};
const floorAt=(x:number,z:number)=>()=>{const h=landableDeckHeight(x,z);return h>0?h:BOAT_DECK_Y;};
const [B0,B1]=DEEP_SEA_BOATS;
const P0=B0.toWorld(CAPTAIN_LOCAL.x,CAPTAIN_LOCAL.z),P1=B1.toWorld(CAPTAIN_LOCAL.x,CAPTAIN_LOCAL.z);
/** Facing the open aft deck and the angler (boat-local +x is the bow: face aft and a little to starboard). */
const faceAft=(b:typeof B0)=>{const a=b.toWorld(-2.4,.5),p=b.toWorld(CAPTAIN_LOCAL.x,CAPTAIN_LOCAL.z);return Math.atan2(a.x-p.x,a.z-p.z);};

export const BOAT_CAPTAINS:NpcDefinition[]=[
 {id:'boat-captain-marina',name:'Captain Marina',role:'Deep Sea Boat captain',pursuit:'CAPTAIN OF THE DEEP SEA BOAT',x:P0.x,z:P0.z,floor:floorAt(P0.x,P0.z),workYaw:faceAft(B0),
  character:'female',face:'deep',clothing:'coast',body:'strong',age:'adult',look:{skin:5,hair:'bun',headwear:'cap',headwearColor:'#1f3f63',top:'#2b5d8c'},
  persona:'The Deep Sea Boat\'s captain: a former goalkeeper who has fished the deep blue bay for years and loves a football story.',
  greeting:HOW_TO_GREETING,
  lines:[
   'Brighton & Hove Albion, a club by the sea in England, are nicknamed "The Seagulls". Gulls diving out there mean fish below!',
   'A nibble is like a striker\'s feint. Scientists who studied 286 penalties found keepers nearly always dive, yet staying put would have saved the most.',
   'Many fish swim together in schools. Moving as one group helps keep them safe from hunters, a bit like a team defending together.',
   'Spain won Euro 2008, the 2010 World Cup and Euro 2012 with short, quick passes, a style called tiki-taka. A shoal turning together looks just as neat!',
   'Grimsby Town fans wave inflatable fish called "Harry Haddock". That tradition began at FA Cup matches in 1989.',
   'Fleetwood Town grew up as a big deep-sea fishing port, so their fans are called the "Cod Army".',
   'At the 2010 World Cup, Paul the Octopus picked the winner of all of Germany\'s matches and the final: 8 out of 8!',
   'A penalty is taken from the penalty mark, 11 metres from the goal line. A keeper has to react as fast as you do when the float plunges.',
   'Southend United are "The Shrimpers": nearby Leigh-on-Sea had lots of shrimp-fishing boats.',
   'Reading the water is like reading the game. Look where the water changes before you cast, the way a midfielder looks up before the pass.',
  ],
  topics:[
   {id:'boat',question:'How does fishing on the boat work?',answer:'Deep water means bigger, rarer fish, but every bite takes a little longer while they rise from far below. Hotspots like a bait ball, diving gulls or a dark upwelling are where the big ones gather.',
    followUp:{question:'How do I land a big one?',answer:FIGHT_ANSWER}},
   {id:'legend',question:'Is there a legend out here?',answer:legendLine(B0.spotId),
    followUp:{question:'Why let it go?',answer:'Catch and release keeps the sea\'s biggest fish swimming for everyone. Respect the sea like you respect the other team.'}},
  ]},
 {id:'boat-skipper-kofi',name:'Skipper Kofi',role:'Summit Deep Boat skipper',pursuit:'SKIPPER OF THE SUMMIT DEEP BOAT',x:P1.x,z:P1.z,floor:floorAt(P1.x,P1.z),workYaw:faceAft(B1),
  character:'male',face:'deep',clothing:'sunset',body:'balanced',age:'adult',look:{skin:6,hair:'crop',headwear:'bucket',headwearColor:'#c9b27a',top:'#3f7a5c'},
  persona:'The Summit Deep Boat\'s skipper: a patient fisher who coaches a kids\' team on Summit Isle and compares everything to football.',
  greeting:HOW_TO_GREETING.replace('Welcome aboard!','Hello, and welcome to my boat!'),
  lines:[
   'Málaga CF, from a port city in Spain, are nicknamed "Los Boquerones": the Anchovies.',
   'At the 2002 World Cup, Turkey\'s Hakan Şükür scored after just 10.8 seconds, the fastest World Cup goal. A sailfish would be proud!',
   'Lanternfish make their own light. The first floodlit football match was played at Bramall Lane, Sheffield, in 1878.',
   'A squid squirts ink; referees squirt vanishing spray to mark where the wall stands. It was first used at a World Cup in 2014.',
   'Santos, Pelé\'s old club in Brazil, are nicknamed "Peixe": Fish!',
   'The Comoros national team is nicknamed "Les Cœlacanthes", after an ancient fish that lives in the seas around their islands.',
   '"Marinos" means sailors in Spanish. Yokohama F. Marinos chose it because Yokohama is a big port.',
   'St. John\'s SC from Grenada are nicknamed the "Marlins". Their town, Gouyave, was once the centre of Grenada\'s fishing.',
   'Plymouth Argyle\'s badge shows the Mayflower, the ship that sailed from Plymouth to America in 1620.',
   'Patience wins on a boat and on a pitch. Wait for the right moment, then react fast.',
  ],
  topics:[
   {id:'boat',question:'How does fishing on the boat work?',answer:'The fish out here are bigger and rarer because the water is so deep, but they take longer to bite. Watch for a bait ball boiling or birds diving, and cast somewhere new each time so the fish are not spooked.',
    followUp:{question:'How do I land a big one?',answer:FIGHT_ANSWER}},
   {id:'legend',question:'Is there a legend out here?',answer:legendLine(B1.spotId),
    followUp:{question:'Why let it go?',answer:'A legend is caught once and set free, so it can keep its story going. Good sports shake hands and let the game go on.'}},
  ]},
];
