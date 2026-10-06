/**
 * No-heading youth versions of the puzzles (US Soccer: no heading at 10 and under; heading only in
 * practice at 11–13). In this mode the engine never lets an attacker play the ball above chest height
 * (`require.noHeading`): crosses are chested or controlled and finished, flick-ons become lay-offs, and
 * the near-post corner flick becomes a short corner. The header puzzles stay available with the
 * setting off. Every youth route is proven by tests/pass-puzzle-youth.cjs.
 */
import type {Scenario,Kick,Format,KickKind} from './types';

type Copy=Record<Format,string>;
export type YouthVariant={
  title?:string;
  brief?:Copy;hint?:Copy;lesson?:string;bonusLabel?:string;
  attackers?:Scenario['attackers'];defenders?:Scenario['defenders'];
};
const K=(kind:KickKind,x:number,z:number,o:Partial<Kick>={}):Kick=>({kind,target:{x,z},curl:0,loft:0,power:.5,...o});

/** Youth copy and (where the shape must change) positions for every puzzle whose taught route uses the head. */
export const YOUTH:Record<string,YouthVariant>={
  'air-near-post':{title:'Near-Post Finish',bonusLabel:'Shoot first time',
    brief:{'7v7':'Lift the ball to your friend at the front post. They stop it and score!',
      '9v9':'A defender blocks the low cross. Float it to the near post; your striker chests it down and finishes.',
      '11v11':'The low cross gets cut out. Deliver it in the air to the near-post run, cushion it on the chest and finish across the keeper.'},
    hint:{'7v7':'Hold at the end to lift it. Then shoot low.',
      '9v9':'A lofted cross clears the defender. Control it, then shoot across the keeper.',
      '11v11':'The near-post run gets in front of the defender; take it on the chest and strike across goal.'},
    lesson:'A near-post run gets you to the cross first, in front of the defender.'},
  'air-far-post':{title:'Far-Post Finish',bonusLabel:'Shoot first time',
    brief:{'7v7':'The keeper and a defender guard the front post. Lift it to the back post!',
      '9v9':'The near post is crowded. Float the cross into the space at the far post for your runner.',
      '11v11':'The keeper and a centre-back cover the near post. Hang the cross into the space beyond the far post, then finish back across goal.'},
    hint:{'7v7':'Lift it just behind your friend at the back. Then shoot.',
      '9v9':'Aim just behind the far-post runner. They control it and finish.',
      '11v11':'Clear the near-post zone with height; the far-post runner controls and shoots back across the keeper.'},
    lesson:'When the near post is crowded, the far post is often free.'},
  'air-flick-on':{title:'Chest and Lay Off',
    brief:{'7v7':'Kick it high to your striker. They stop it and pass to your runner!',
      '9v9':'The long pass to the runner is covered. Hit the target striker, who chests it down and lays it into the runner\'s path.',
      '11v11':'The ball in behind is covered. Go long to the target forward, who cushions it and releases the runner past the line.'},
    hint:{'7v7':'First to the striker. Then pass into the runner\'s space.',
      '9v9':'Control first, then pass to where the runner is going.',
      '11v11':'The target forward holds it up while the runner times the run to stay onside.'},
    lesson:'A strong target player can control a long ball and set a runner free.',
    // The control takes longer than a flick, so the runner waits a beat longer to stay onside.
    attackers:[{x:0,z:0},{x:-2,z:16},{x:7,z:12,run:{delay:1.8,path:[{x:5,z:20}]}}]},
  'air-knock-down':{title:'Set It Back',
    brief:{'7v7':'Cross to your friend at the back post. They pass it back. Shoot!',
      '9v9':'Cross to the far-post striker, who sets it back to the teammate arriving in the middle.',
      '11v11':'Target the far post; the striker cushions it and sets it back into the path of the arriving midfielder.'},
    hint:{'7v7':'Your friend at the back passes softly to the middle.',
      '9v9':'A pass back across the box finds the teammate facing goal.',
      '11v11':'The set-back turns a hard chance into an easy shot for the runner facing goal.'},
    lesson:'A cross does not have to be a shot: set it back for a friend facing goal.'},
  'air-corner-flick':{title:'Short Corner',bonusLabel:'Shoot first time',
    brief:{'7v7':'Corner kick! Pass short to your friend. They pass into the middle. Shoot!',
      '9v9':'Take the corner short. Your teammate drives a low ball into the middle for the arriving attacker.',
      '11v11':'Play the corner short to make a 2 v 1, then drive it low to the attacker arriving at the spot.'},
    hint:{'7v7':'The short pass pulls a defender out. Then find the friend in the middle.',
      '9v9':'The short corner changes the angle and drags a defender out of the box.',
      '11v11':'The short corner changes the crossing angle; the low delivery beats the keeper\'s starting position.'},
    lesson:'A short corner changes the angle and makes space for a low ball into the box.',
    attackers:[{x:29.5,z:31.5},{x:24,z:28},{x:-1,z:24}]},
  'mp-escape-and-switch':{
    brief:{'7v7':'Your side is crowded. Pass back, lift it across, then find your friend near goal.',
      '9v9':'Escape the press with a back pass, switch above the crowd and set up the spare attacker.',
      '11v11':'Recycle behind the press, switch to the weak side, then control and slip the spare attacker in to finish.'},
    hint:{'7v7':'Go back first. Hold the next pass to lift it across.',
      '9v9':'The teammate behind you can see the far side. Lift the switch, control it, then pass inside.',
      '11v11':'Use the deeper support player to change the angle. A lofted switch clears the central screen.'}},
  'mp-second-ball':{
    brief:{'7v7':'Lift the cross to your far friend. They pass it back, then find the open corner.',
      '9v9':'Cross over the low block. Control it and set it back to support, then slip the next attacker through.',
      '11v11':'Bypass the low block in the air, set the second ball back to support and combine around the recovering defenders.'},
    hint:{'7v7':'Hold to lift the first pass. Then pass back to the friend behind.',
      '9v9':'The far player sets it back into support. The next pass makes a better shooting angle.',
      '11v11':'A direct finish faces the keeper and cover. Set it backwards, then play forward from the new angle.'}},
};
export const YOUTH_PACK_BLURB='Crosses and corners: chest it down, lay it off and finish. No heading.';

/** The no-heading taught routes (kick by kick, as readStroke draws them) for every puzzle whose
 *  normal route uses a header. Puzzles not listed solve the same way in both modes. */
export const YOUTH_SOLUTIONS:Record<string,Kick[]>={
  'fp-up-and-over':[K('pass-feet',1,16,{receiver:1,power:0.39,loft:0.5})],
  'air-near-post':[K('pass-feet',4,25.5,{receiver:1,power:0.53,loft:0.6}),K('shot',3.4,32,{power:0.29})],
  'air-far-post':[K('pass-space',-7,24,{receiver:2,power:0.9,loft:0.5}),K('shot',-3.4,32,{power:0.35})],
  'air-flick-on':[K('pass-feet',-2,16,{receiver:1,power:0.53,loft:0.5}),K('pass-space',4,18,{receiver:2,power:0.22}),K('shot',-3.4,32,{power:0.58})],
  'air-corner-flick':[K('pass-feet',24,28,{receiver:1,power:0.22}),K('pass-feet',-1,24,{receiver:2,power:0.88}),K('shot',-3.4,32,{power:0.36})],
};

/** The puzzle as played with the no-heading rule: same idea, youth copy and (if needed) shape. */
export function youthScenario(s:Scenario):Scenario{
  const y=YOUTH[s.id];
  const out:Scenario={...s,require:{...s.require,noHeading:true}};
  if(!y)return out;
  if(y.title)out.title=y.title;
  if(y.brief)out.brief=y.brief;
  if(y.hint)out.hint=y.hint;
  if(y.lesson)out.lesson=y.lesson;
  if(y.attackers)out.attackers=y.attackers.map(a=>({...a,run:a.run?{...a.run,path:a.run.path.map(p=>({...p}))}:undefined}));
  if(y.defenders)out.defenders=y.defenders.map(d=>({...d}));
  if(s.bonus)out.bonus={...s.bonus,label:y.bonusLabel??s.bonus.label};
  return out;
}
/** True when this puzzle's normal route asks for a header (the youth setting changes it). */
export const usesHeading=(id:string)=>id in YOUTH_SOLUTIONS||id in YOUTH;
