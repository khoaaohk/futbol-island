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
 {title:'Sheffield, home of football · John Tasker: the very first football match played under floodlights',url:'https://sheffieldhomeoffootball.org/plaques/7-john-tasker-the-very-first-football-match-played-under-floodlights'},
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
/**
 * "Switch on a floodlight" (museum-figures-3, figure kit v2). Checked Oct 21 2026: the Bramall Lane lamps stood on wooden towers
 * and generators at the ground made the power (Sheffield, home of football · John Tasker plaque; Wikipedia · Floodlight); older
 * floodlights needed a warm-up, LED floodlights light at once (Wikipedia · Floodlight). No counts or sizes are claimed.
 */
export const FIGURE_INTRO='A floodlight on a tall mast. Turn it round, look inside, then switch it on.';
export const FIGURE_SAY:Record<string,string>={
 power:'Power on! Electricity runs from the power box along the cable, under the grass and up inside the mast. In 1878 there was no power grid: generators at the ground made it.',
 warm:'The lamps glow. The shiny reflector behind them sends the light forward, onto the pitch. Older floodlights took minutes to warm up; LED lamps light at once.',
 lit:'Pitch lit! The mast holds the lamps up high, so the light spreads wide over the grass. Stadiums put lights on more than one side to fill in the shadows.',
 lamp:'Lamps: today they are often LEDs. At Bramall Lane in 1878 they were arc lamps: electricity jumps a gap between two carbon rods and makes a white-hot light.',
 reflector:'The reflector is a shiny bowl behind the lamps. Light that would go backwards bounces off it and goes forward, onto the pitch.',
 mast:'The mast holds the lamps up high. In 1878 the lamps stood on wooden towers; today they sit on tall steel masts or on the stadium roof.',
 cable:'The cable carries the electricity from the power box, under the grass and up inside the mast to the lamps.',
 box:'The power box sends electricity to the lamps. In 1878 there was no grid, so generators at the ground made the power.',
};
export const MODEL_NOTE='The rig is a model made for this museum. Its four corner towers, the crank, the motor lever and the numbers on the meters are a teaching model, not a plan of Bramall Lane in 1878: the sources tell us about generators, but not how many lamps stood where that night.';
