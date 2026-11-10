// Pinball timestep debt (Nov 10 2026 audit). A fast tier scales each frame's dt (World Final 1.22x), so a long frame (.075 s
// clamp) is .0915 s of table time while one call drains at most 40 x PINBALL_STEP (.0833 s). The leftover used to pile up
// forever below ~13 fps: every frame then ran all 40 substeps (heat) and the table fast-forwarded when the frame rate recovered.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const {createPinballState,launchPinball,stepPinball,PINBALL_STEP}=await import('../lib/games/soccerPinball.ts');
const idle={left:false,right:false};
const s=createPinballState();s.tier=2;launchPinball(s);
let max=0;for(let n=0;n<200;n++){stepPinball(s,idle,.075);max=Math.max(max,s.accumulator);}
assert.ok(max<=PINBALL_STEP*2+1e-12,`accumulator stays bounded at tier 2 (max ${max})`);
// Normal frames are untouched: a 60 fps frame at tier 0 leaves less than one step behind.
const n0=createPinballState();launchPinball(n0);for(let n=0;n<120;n++){stepPinball(n0,idle,1/60);assert.ok(n0.accumulator<PINBALL_STEP);}
console.log('PASS pinball timestep: slow frames on a fast tier cannot build up substep debt');
