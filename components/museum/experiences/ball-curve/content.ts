/**
 * ball-curve · words. The case's own facts live in lib/endgame/museum.ts (rendered from `exhibit.facts`); everything here is extra.
 * Checked on Oct 14 2026: Wikipedia "Magnus effect" (the spinning ball deflects the air; by Newton's third law the air pushes the
 * ball the other way; the force points the way the front of the ball turns), NASA Glenn "Lift of a baseball" (the spinning
 * surface drags air with it; the pressure difference gives a force across the flow), Wikipedia "Curl (association football)"
 * (strike off-centre, inside or outside of the foot; Roberto Carlos 1997 v France, outside of the left foot), Wikipedia
 * "Knuckleball" (football: almost no spin, the ball can move, dip or wobble unpredictably), and Dupeux et al. (2010) "The spinning
 * ball spiral" (a spinning ball's path bends more and more as it slows).
 */
import type {Challenge} from './physics';
export const ACCENT='#e4322b';
export const BEATS=[
 {when:'01',head:'Strike off-centre',text:'Hit the ball to one side of its middle and it spins.'},
 {when:'02',head:'Spin throws the air',text:'The spinning ball drags the air round and throws it off one side.'},
 {when:'03',head:'The air pushes back',text:'So the air pushes the ball the other way, and its path bends.'},
 {when:'No spin',head:'The knuckleball',text:'Hit hard through the middle: almost no spin, and it wobbles.'},
] as const;
export const MORE:readonly {tag:string;text:string}[]=[
 {tag:'Why',text:'The spinning ball drags a thin layer of air round with it. On one side that air meets the oncoming air head on, on the other side it moves with it. The air leaves the ball bent to one side, and the ball is pushed the other way.'},
 {tag:'Which way',text:'The ball curves the way its front is turning. Spinning anticlockwise (seen from above), the front turns left, so it curves left.'},
 {tag:'Late bend',text:'Scientists found that a spinning ball bends more and more as it slows down, so the curl can come late in the flight.'},
 {tag:'Under',text:'Strike low on the ball and it spins backwards: the same push lifts it, so it floats. Strike over the top and it dips.'},
 {tag:'Knuckle',text:'With almost no spin, the ball can move, dip and wobble in the air in ways nobody can predict. Juninho Pernambucano made this shot famous at Lyon in the 2000s.'},
];
/**
 * "Kick it" (museum-figures-3, figure kit v2). Checked Oct 21 2026 against the sources below: the spinning ball drags the air and
 * throws it off one side, the air pushes the ball the other way (Wikipedia · Magnus effect; NASA Glenn); sidespin curves,
 * backspin lifts, topspin dips (Magnus effect); Roberto Carlos, Brazil v France, Tournoi de France 1997, outside of the left foot,
 * looked like going wide then swung in (Wikipedia · Curl; Dupeux et al. 2010 via ScienceDaily); the curl grows late as the ball
 * slows (Dupeux et al. 2010). No speeds, distances or spin rates are claimed.
 */
export const FIGURE_INTRO='A spinning ball, a wall and a goal. Turn it round, show the air, then kick it.';
export const FIGURE_SAY:Record<string,string>={
 kick:'Kick with spin: strike the ball to one side of its middle and it spins as it flies.',
 air:'The spinning ball drags the air round with it and throws it off to one side. So the air pushes the ball the other way: that push is the Magnus effect.',
 curve:'It curves! Out past the wall, then the push bends it back into the goal. A spinning ball bends more as it slows down, so the curl comes late.',
 spin:'Spin: sidespin curves the ball left or right, backspin lifts it, topspin makes it dip. The ball curves the way its front is turning.',
 air_flow:'Air flow: on one side the ball’s surface turns against the oncoming air, on the other side with it. The air leaves the ball bent to one side.',
 force:'Force: the ball throws the air one way, so the air pushes the ball the other way, sideways across its flight.',
 path:'Curve path: in 1997 Roberto Carlos of Brazil hit a free kick against France with the outside of his left foot. It looked like going wide, then it swung in.',
 left:'Curl left: now the ball spins the other way, the air is thrown the other way and the ball bends left.',
 right:'Curl right: the ball spins so its front turns right, the air is thrown left and the ball bends right.',
};
export const MODEL_NOTE='The wind tunnel and the launcher are a simple teaching model: real gravity, plus sensible made-up numbers for the air drag, the Magnus push and the knuckle wobble (the same every time for the same kick, so you can try again fairly). The smoke lines are an ideal flow round the ball plus a bent wake, and the push on the gauge is the textbook estimate ½·ρ·A·U·r·ω. The bend you see, a few metres over 20 m, is about what a strong curler does.';
export const SOURCES:readonly {title:string;url:string}[]=[
 {title:'Wikipedia · Magnus effect (Newton’s third law; the force points the way the front of the ball turns)',url:'https://en.wikipedia.org/wiki/Magnus_effect'},
 {title:'NASA Glenn Research Center · Lift of a baseball (how a spinning ball gets a force across the flow)',url:'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-of-a-baseball/'},
 {title:'Wikipedia · Curl (association football) (strike off-centre; Roberto Carlos, 1997)',url:'https://en.wikipedia.org/wiki/Curl_(association_football)'},
 {title:'Wikipedia · Knuckleball (the association football knuckle shot)',url:'https://en.wikipedia.org/wiki/Knuckleball'},
 {title:'IFAB Laws of the Game · Law 2 The Ball (68–70 cm, 410–450 g, 0.6–1.1 atmosphere)',url:'https://www.theifab.com/laws/latest/the-ball/'},
 {title:'Wikipedia · Ball (association football) (bladder of latex or butyl rubber; 32 panels; stitched or thermo-bonded)',url:'https://en.wikipedia.org/wiki/Ball_(association_football)'},
 {title:'Wikipedia · Adidas Jabulani (eight panels; its knuckling flight, 2010)',url:'https://en.wikipedia.org/wiki/Adidas_Jabulani'},
 {title:'ScienceDaily (2010) · Physicists explain Roberto Carlos’s free kick (the spinning ball spiral)',url:'https://www.sciencedaily.com/releases/2010/09/100902073509.htm'},
 {title:'Dupeux, Le Goff, Quéré & Clanet (2010) · The spinning ball spiral, New Journal of Physics 12',url:'https://iopscience.iop.org/article/10.1088/1367-2630/12/9/093004'},
];
export const CHALLENGES:readonly {id:Challenge;name:string;goal:string;tip:string}[]=[
 {id:'wall',name:'Round the wall',goal:'Bend a free kick round the wall and into the corner the wall hides.',tip:'Turn the table so the straight line passes outside the wall, then drag the dot to the LEFT side of the ball: it curves right, back on target.'},
 {id:'knuckle',name:'Knuckleball',goal:'Hit a shot with almost no spin, hard and on target. Watch it wobble.',tip:'Put the dot right in the middle of the ball and pull the hammer all the way back.'},
];
/** A kick that does each challenge (the "Show me" button; the tests prove they work). */
export const SHOW:Record<'wall'|'knuckle',{cx:number;cy:number;power:number;aim:number}>={wall:{cx:-1,cy:-.25,power:.6,aim:-13},knuckle:{cx:0,cy:-.2,power:.95,aim:0}};
export const VERDICT:Record<string,{big:string;line:string;kind:'good'|'ok'|'bad'}>={
 goal:{big:'Goal!',line:'Round the wall and in. That is the Magnus effect at work.',kind:'good'},
 blocked:{big:'Blocked',line:'It hit the wall. Aim outside the wall and let the spin bring it back.',kind:'bad'},
 wide:{big:'Wide',line:'It missed the goal. Change the aim, or the spin, so it bends back on target.',kind:'bad'},
 over:{big:'Over the bar',line:'Too much lift. Strike a little higher on the ball.',kind:'bad'},
 saved:{big:'Saved',line:'The keeper got there. Bend it into the side the wall hides.',kind:'ok'},
 short:{big:'Too soft',line:'It ran out of speed. Use more power.',kind:'bad'},
 met:{big:'On his head!',line:'The cross bent round the defender and onto your team-mate.',kind:'good'},
 'cut-out':{big:'Cut out',line:'The defender got to it. Aim away from him and let the spin bend it in.',kind:'bad'},
 'too-high':{big:'Over his head',line:'Right line, too high. Strike a little higher on the ball.',kind:'ok'},
 missed:{big:'Missed him',line:'Change the aim or the spin so the ball bends to him.',kind:'bad'},
 knuckle:{big:'Knuckleball!',line:'Almost no spin, so it wobbled on its way. Keepers hate that.',kind:'good'},
 spin:{big:'It curved',line:'Too much spin for a knuckleball. Put the contact right in the middle.',kind:'ok'},
 soft:{big:'Too soft',line:'A knuckleball needs power. Push the power up.',kind:'bad'},
};
export const CHECKS:readonly {q:string;options:readonly string[];right:number;why:string}[]=[
 {q:'You strike the ball to the RIGHT of its middle. Which way does it curve?',options:['Left','Right','It goes straight'],right:0,
  why:'Its front turns to the left, it throws the air one way and the air pushes it the other: it curves left.'},
 {q:'In the wind tunnel the spinning ball throws the air to one side. Which way is the ball pushed?',options:['The same way','The other way','Straight up'],right:1,
  why:'The ball pushes the air one way, so the air pushes the ball the other way. That push is the Magnus effect.'},
 {q:'What makes a knuckleball wobble?',options:['Lots of spin','Almost no spin','A heavy ball'],right:1,
  why:'With almost no spin, the ball can move, dip and wobble in ways the keeper cannot predict.'},
];
/** The wind tunnel's four little jobs. */
export const TASKS:readonly {id:'wind'|'spin'|'flip'|'still';head:string;text:string;done:string}[]=[
 {id:'wind',head:'Blow the wind',text:'Wind the fan crank on top of the tunnel to at least 50 km/h.',done:'The smoke splits evenly round a ball that does not spin. No push.'},
 {id:'spin',head:'Spin the ball',text:'Now turn the SPIN knob. Watch the smoke and the arrow.',done:'The smoke crowds round one side and is thrown off the other way. The ball is pushed: the carriage slides.'},
 {id:'flip',head:'Push it the other way',text:'Turn the spin the other way round.',done:'Spin the other way, push the other way. That is why left of centre and right of centre curve opposite ways.'},
 {id:'still',head:'No wind, no push',text:'Keep the ball spinning and turn the wind right down.',done:'No air going past, no push. A ball only curves while it flies through the air.'},
];
/** The ball taken apart: each part and its one line. */
export const PART_NAME={panels:'The panels',seams:'The seams',bladder:'The bladder',valve:'The valve',size:'The size'} as const;
export const PART_TEXT={
 panels:'The cover is made of panels. The classic ball has 32: twelve pentagons and twenty hexagons, stitched or heat-bonded together.',
 seams:'Where panels meet there are seams. Smooth balls with few seams can knuckle: the 2010 World Cup ball, the Jabulani, had only 8 panels, and players said it moved strangely.',
 bladder:'Inside is a bladder of latex or butyl rubber. It holds the air that keeps the ball round and bouncy.',
 valve:'Air goes in through a small valve. A match ball is pumped to 0.6–1.1 atmosphere (at sea level).',
 size:'A size 5 match ball is 68–70 cm round and weighs 410–450 g at the start of the match.',
} as const;
