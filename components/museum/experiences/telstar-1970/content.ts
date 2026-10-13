/**
 * telstar-1970 · the words (Oct 12 2026 anatomy restyle; first written for the Oct 10 game). The case's own three facts and its "take it to your game" line are
 * read from the exhibit (lib/endgame/museum.ts) and shown word for word; these are the sourced extras, kept from the modern
 * gallery version, plus the story beats and the quick check.
 */
export const EXTRA={
 name:'The ball was named after Telstar, a ball-shaped satellite launched in 1962 and covered in flat panels, a bit like a football. It sent the first live TV pictures across the Atlantic Ocean.',
 made:'Only 20 Telstars were made for the 1970 World Cup. The 32-panel pattern was not new (a Danish company, Select, made one in 1962), but the World Cup on TV made it famous.',
 live:'In 1970, World Cup games were shown live around the world by satellite. A few places saw them in colour, but many families still watched in black and white.',
 panels:'The 32 panels are 12 black pentagons (5 sides) and 20 white hexagons (6 sides).',
} as const;
export const EXTRA_SOURCES=[
 {title:'Wikipedia · Telstar 1',url:'https://en.wikipedia.org/wiki/Telstar_1'},
 {title:'Science Museum · Telstar, Intelsat and the first global satellite broadcast',url:'https://www.sciencemuseum.org.uk/objects-and-stories/telstar-intelsat-and-first-global-satellite-broadcast'},
 {title:'Britannica · Telstar communications satellite',url:'https://www.britannica.com/technology/Telstar-communications-satellite'},
 {title:'Smithsonian National Museum of American History · Soccer ball',url:'https://americanhistory.si.edu/collections/object/nmah_682185'},
 {title:'Wikipedia · List of FIFA World Cup official match balls',url:'https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls'},
] as const;
export const BEATS=[
 {when:'Mexico · 1970',head:'Live by satellite',text:EXTRA.live},
 {when:'The problem',head:'Brown on green turns grey',text:'On a black-and-white set, a brown leather ball and green grass come out the same grey. The ball can vanish.'},
 {when:'The answer',head:'12 black + 20 white',text:EXTRA.panels+' Stitch one, then film the match.'},
] as const;
export const CHECK={q:'On a black-and-white TV, why was the brown ball hard to follow?',options:['It turned the same grey as the grass','It was smaller than the Telstar','It moved too fast'],right:0,
 why:'Brown and green both look mid-grey without colour. The Telstar’s black and white panels stay dark and light, so your eyes can find it.'} as const;
export const MODEL_NOTE='The match on this screen is pretend, made for the camera game. Both halves replay the same passes, so only the ball changes. The facts are real.';
export const BEST_KEY='futbol.museum.telstar.onAirBest';
