/**
 * floodlights-1878 · the words. The case's own facts and "take it to your game" line live in lib/endgame/museum.ts and are shown
 * word for word; these are the sourced extras, the story beats and the quick check. Checked Oct 14 2026 against the sources below
 * (Bramall Lane: the date and the crowd; Sheffield United F.C.: the Sheffield FA teams, two generators, 20,000, 2–0; Floodlight:
 * no national grid, batteries and dynamos, unreliable, other 1878 trials with a Gramme machine; Arc lamp: carbon rods, an arc
 * across the gap, dynamos for arc lighting by 1877). How many lamps stood where at Bramall Lane is NOT claimed anywhere.
 */
export const EXTRA={
 match:'The match on 14 October 1878 was between two teams picked by the Sheffield Football Association. The crowd was about 20,000 and the score was 2⁠–⁠0.',
 power:'There was no national power grid, so lights were run from dynamos (generators) and batteries, and early lights were often unreliable.',
 arc:'Electric lamps of that time were arc lamps: electricity jumps across a small gap between two carbon rods, and the tip of the rod glows white hot.',
 others:'Other clubs tried lights in 1878 too. In Scotland, Third Lanark played a match lit by a Gramme machine, an early dynamo.',
 slow:'In the 1930s Arsenal’s manager Herbert Chapman put lights in at Highbury, but the Football League would not let clubs use them in league games until the 1950s.',
 league:'The first Football League match played under floodlights was Portsmouth against Newcastle United at Fratton Park, on 22 February 1956.',
} as const;
export const SOURCES=[
 {title:'Wikipedia · Bramall Lane',url:'https://en.wikipedia.org/wiki/Bramall_Lane'},
 {title:'Wikipedia · Sheffield United F.C.',url:'https://en.wikipedia.org/wiki/Sheffield_United_F.C.'},
 {title:'Wikipedia · 1878 in association football',url:'https://en.wikipedia.org/wiki/1878_in_association_football'},
 {title:'Wikipedia · Floodlight',url:'https://en.wikipedia.org/wiki/Floodlight'},
 {title:'Wikipedia · Floodlights (sport)',url:'https://en.wikipedia.org/wiki/Floodlights_(sport)'},
 {title:'Wikipedia · Arc lamp',url:'https://en.wikipedia.org/wiki/Arc_lamp'},
] as const;
export const BEATS=[
 {when:'14 October 1878',head:'Bramall Lane, Sheffield',text:'The first football match ever played under floodlights. About 20,000 people came to watch.'},
 {when:'The power',head:'Dynamos at the ground',text:'No power grid yet: dynamos made the electricity, so the lights only shone while the dynamos turned.'},
 {when:'Your job',head:'Light the model ground',text:'Crank the dynamo, swing the four lamps onto the pitch, hunt for dark spots, then take a tower apart.'},
] as const;
export const CHECKS=[
 {q:'Where was the first floodlit football match played, in 1878?',options:['Bramall Lane, Sheffield','Wembley, London','The Maracanã, Rio'],right:0,
  why:'Bramall Lane in Sheffield, on 14 October 1878, with about 20,000 people watching.'},
 {q:'There was no power grid in 1878. What made the electricity for the lamps?',options:['Dynamos (generators) at the ground','Solar panels','The crowd clapping'],right:0,
  why:'A dynamo turns movement into electricity. On the rig, the faster you turned the crank, the more volts it made.'},
 {q:'Why do floodlights shine from more than one corner?',options:['Each lamp fills in the dark spots and shadows the others leave','One lamp would be too hot','So the lights look nice'],right:0,
  why:'With one lamp a player’s shadow is black. With lamps all round, the other lamps fill every shadow in.'},
] as const;
export const MODEL_NOTE='The rig is a model made for this museum. Its four corner towers, the crank, the motor lever and the numbers on the meters are a teaching model, not a plan of Bramall Lane in 1878: the sources tell us about generators, but not how many lamps stood where that night.';
