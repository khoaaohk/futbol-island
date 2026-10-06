import type {Scenario,Kick} from './types';

/** Match problems combine already learned techniques; their routes are tested through readStroke. */
export const CHALLENGE_PACK={id:'match-problems',order:5,title:'Match Problems',blurb:'Advanced: escape pressure, find the spare player and build a three-pass finish.'};
const pitch={halfWidth:25,length:50,goalWidth:6};
const base={pack:CHALLENGE_PACK.id,pitch,carrier:0,attempts:3,keeper:{x:0,z:24},require:{minPasses:3,finish:'goal' as const,offside:true}};
export const CHALLENGE_SCENARIOS:Scenario[]=[
 {...base,id:'mp-escape-and-switch',title:'Escape and Switch',concept:'recycle-switch-finish',
  brief:{'7v7':'Your side is crowded. Pass back, lift it across, then find your friend near goal.','9v9':'Escape the press with a back pass, switch above the crowd and set up the spare attacker.','11v11':'Recycle behind the press, switch aerially to the weak side, then use a knock-down to create the finish.'},
  hint:{'7v7':'Go back first. Hold the next pass to lift it across.','9v9':'The teammate behind you can see the far side. Lift the switch, then head it down.','11v11':'Use the deeper support player to change the angle. An aerial switch clears the central screen.'},
  attackers:[{x:-14,z:8},{x:-9,z:0},{x:15,z:10},{x:7,z:17}],
  defenders:[{x:-13,z:10,press:true},{x:-8,z:13},{x:0,z:10},{x:6,z:22}],
  bonus:{kind:'scorer',scorer:3,label:'The spare player scores'},
  lesson:'Passing back changes the angle; switching above the press finds the spare player.'},
 {...base,id:'mp-one-more-pass',title:'One More Pass',concept:'one-two-square-finish',
  brief:{'7v7':'Pass and run past the first defender. Another blocks you. Find your friend beside the goal!','9v9':'Beat the first defender with a one-two. Draw the covering defender, then square it to the free teammate.','11v11':'Combine around the initial press, then exploit the covering centre-back with a square pass to the spare attacker.'},
  hint:{'7v7':'Pass left, then back into your run. Pass right before you shoot.','9v9':'The return goes into space ahead of the passer. The third pass finds the spare player.','11v11':'Use the wall player to release the original passer. The square ball bypasses the covering defender.'},
  attackers:[{x:0,z:11,run:{delay:.05,afterPass:true,path:[{x:2,z:14},{x:2,z:19}]}},{x:-6,z:14.5},{x:9,z:19.5}],
  defenders:[{x:.5,z:14,press:true},{x:0,z:22}],
  bonus:{kind:'scorer',scorer:2,label:'The spare player scores'},
  lesson:'Beating one defender is not the end: look up again and find the spare player.'},
 {...base,id:'mp-second-ball',title:'Win the Second Ball',concept:'aerial-set-combination',
  brief:{'7v7':'Lift the cross to your far friend. Head it back, pass forward and find the open corner.','9v9':'Cross over the low block. Cushion a header back to support, then slip the next attacker through.','11v11':'Bypass the low block aerially, set the second ball to support and combine around the recovering defenders.'},
  hint:{'7v7':'Hold to lift the first pass. Head back to the friend behind.','9v9':'The far player heads away from goal into support. The next pass creates a better shooting angle.','11v11':'A direct header faces the keeper and cover. Set it backwards, then play forward from the new angle.'},
  attackers:[{x:18,z:20},{x:-6,z:19},{x:3,z:13},{x:7,z:19}],
  defenders:[{x:10,z:20},{x:0,z:22},{x:2,z:18}],
  bonus:{kind:'scorer',scorer:3,label:'The final runner scores'},
  lesson:'A cushioned header back to support can turn a crowded cross into a clear shooting chance.'},
];
const K=(kind:Kick['kind'],x:number,z:number,o:Partial<Kick>={}):Kick=>({kind,target:{x,z},curl:0,loft:0,power:.5,...o});
/** Reference routes for validation; live finger routes resolve feet targets from the current state. */
export const CHALLENGE_SOLUTIONS:Record<string,{solution:Kick[];naive:Kick}>={
 'mp-escape-and-switch':{solution:[K('pass-feet',-9,0,{receiver:1,power:.3244}),K('header',15,10,{receiver:2,loft:.6,power:.8802}),K('pass-feet',7,17,{receiver:3,power:.3485}),K('shot',-2.75,25,{power:.5338})],naive:K('pass-feet',7,17,{receiver:3})},
 'mp-one-more-pass':{solution:[K('pass-feet',-6,14.5,{receiver:1,power:.2259}),K('pass-space',2,17.5,{receiver:0,power:.2565}),K('pass-feet',9,19.5,{receiver:2,power:.2654}),K('shot',2.75,25,{power:.2726})],naive:K('shot',-2.75,25)},
 'mp-second-ball':{solution:[K('header',-6,19,{receiver:1,loft:.8,power:.8013}),K('pass-feet',3,13,{receiver:2,power:.3527}),K('pass-feet',7,19,{receiver:3,power:.2498}),K('shot',2.75,25,{power:.317})],naive:K('pass-feet',-6,19,{receiver:1})},
};
