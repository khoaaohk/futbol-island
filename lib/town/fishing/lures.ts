import type {FishSpecies} from './fishCatalog';

/**
 * C3 (docs/fishing-research.md): football-technique lures, chosen before casting. Each one changes WHICH KIND of animal comes
 * (the family mix inside each rarity), NEVER how rare it is: fishingOdds.ts `familyMix` boosts the favoured species and scales
 * the rest of that rarity back so every rarity keeps exactly its share, and caps the boost per spot so the mean catch value stays
 * within ±2.5 % of no lure (tests/economy.cjs §12 asserts ±3 %). Rarity is never touched, so BOOST_CAP (boat × hotspot) is
 * unaffected.
 *
 * All four are free from the first cast (user, 15 Oct 2026: "keep the lure", and the earned-only lures left every new player with
 * four locked buttons) and can be swapped at any moment: the choice takes effect at the next bite. No coin path.
 *
 * Real football history, checked 15 Oct 2026 against the pages in `source`. The animal hook is plain biology.
 */
export type LureId='panenka'|'knuckleball'|'rabona'|'nutmeg';
export type Lure={id:LureId;name:string;short:string;
 /** What the lure does, in kid words (never odds). */
 effect:string;
 /** One real football fact and its source (plain-text credit only, no links for kids). */
 fact:string;source:string;
 /** Lure tint for the float / HUD swatch. */
 color:string;
 favors:(f:Pick<FishSpecies,'group'|'shape'|'shadow'>)=>boolean};
const W='https://en.wikipedia.org/wiki/';
export const LURES:readonly Lure[]=[
 {id:'panenka',name:'Panenka lure',short:'Panenka',color:'#f2c14e',effect:'A slow, floaty chip. Calm animals like rays, seahorses and shellfish come to it.',
  fact:'In the Euro 1976 final shoot-out, Antonín Panenka chipped his penalty softly down the middle to win the trophy for Czechoslovakia.',source:W+'Panenka_(penalty_kick)',
  favors:f=>f.group==='ray'||f.group==='seahorse'||f.group==='shellfish'},
 {id:'knuckleball',name:'Knuckleball lure',short:'Knuckleball',color:'#e86a4a',effect:'A wobbly lure that zig-zags. Hunters like sharks and long, fast fish chase it.',
  fact:'Strike a free kick with almost no spin and it can wobble and dip in the air. Brazil\'s Juninho Pernambucano was famous for it.',source:W+'Knuckleball_(association_football)',
  favors:f=>f.group==='shark'||f.shape==='long'||f.shape==='billfish'||f.shape==='hammerhead'},
 {id:'rabona',name:'Rabona lure',short:'Rabona',color:'#7b5cd6',effect:'A twisty lure that sinks low. Crabs, lobsters, eels and octopuses on the bottom like it.',
  fact:'A rabona is a kick where your kicking leg wraps behind your standing leg. The name comes from Argentina.',source:W+'Rabona',
  favors:f=>f.group==='crab'||f.group==='lobster'||f.group==='eel'||f.group==='octopus'},
 {id:'nutmeg',name:'Nutmeg lure',short:'Nutmeg',color:'#5aa36b',effect:'A tiny lure. Small, shy fish slip in to take it.',
  fact:'Playing the ball between a defender\'s legs is called a nutmeg.',source:W+'Nutmeg_(football)',
  favors:f=>f.shadow==='small'},
];
export const lureById=(id:unknown)=>LURES.find(l=>l.id===id);
export const isLureId=(id:unknown):id is LureId=>!!lureById(id);
