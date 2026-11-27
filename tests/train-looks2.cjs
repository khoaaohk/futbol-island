// Island Line LOOKS 2 (Nov 24 2026; owner shots 37, 38, 43, 46, 49). Run: node tests/train-looks2.cjs
//  1. the departure / arrival feel (trainRunning JOLT / joltAt): a few cm and ~0.5° that settle within JOLT.len s, the mirror on
//     arrival, riders / the ride camera get ≤ 2 cm, none with reduced motion or pinned trains; the wheel slip ends on a whole turn
//  2. round wheels: 16 sides close up, 9 in the normal tier (trainCarModel), and the per-car triangle counts
//  3. the catenary: one continuous mesh with the near-camera fade (trainWorld buildCatenary); the roof units are step-ups and the
//     hill over the tube is covered (tests/train-roof.cjs, tests/train-clearance.cjs)
const assert=require('node:assert/strict');
const {L,read}=require('./lib/tsLoad.cjs');
const R=L('lib/town/trainRunning.ts'),J=R.JOLT;
{let maxZ=0,maxP=0;const o={z:0,p:0};for(let t=-.5;t<3;t+=.01){R.joltAt(t,J.amp1,false,o);maxZ=Math.max(maxZ,Math.abs(o.z));maxP=Math.max(maxP,o.p);}
 assert(maxZ>.025&&maxZ<=J.amp1+1e-9&&J.amp0>=.03&&J.amp1<=.05,'a 3-5 cm coupler nudge ('+maxZ.toFixed(3)+' m)');
 assert(maxP>.006&&maxP<=.0088,'a slight back pitch, ~0.5° ('+(maxP*180/Math.PI).toFixed(2)+'°)');
 R.joltAt(J.len+.01,J.amp0,false,o);assert(o.z===0&&o.p===0,'settled after JOLT.len s');R.joltAt(-.01,J.amp0,false,o);assert(o.z===0&&o.p===0,'nothing before the slack takes up');
 R.joltAt(.05,J.amp0,true,o);assert(o.p<0,'arrival: the mirror (nose down)');
 assert(J.lag>=.12&&J.lag<=.2,'car 2 about 0.15 s after car 1');assert(J.amp1*J.ride<=.02+1e-9,'riders and the ride camera: a ≤ 2 cm kick');}
{const Rn=read('lib/town/trainRunning.ts');
 assert(/still=cluster\|\|f\.reduced/.test(Rn),'none with reduced motion (or pinned debug trains)');
 assert(/carMatrix\(st\.s,c,m4,st\.v,i\)/.test(Rn)&&/carMatrix\(s,st\.car,seatM,states\[k\]\.v,k,JOLT\.ride\)/.test(Rn)&&/carMatrix\(states\[k\]\.s,c,out,states\[k\]\.v,k,JOLT\.ride\)/.test(Rn),'the cars draw the whole jolt, riders / passengers / the camera RIDE of it');
 assert(/Math\.PI\*2\*k\*k\*\(3-2\*k\)/.test(Rn)&&/st\.s\/WHEEL_R\+slip\[i\]/.test(Rn),'the wheel slip: one extra turn (no jump after)');
 assert(/cue\('train-depart'/.test(Rn)&&/cue\('train-halt'/.test(Rn)&&/case 'train-depart'/.test(read('lib/audio/islandSound.ts')),'the pull-out hiss + clunk and the arrival sigh, in earshot');}
{const M=L('lib/town/trainCarModel.ts'),LV=L('lib/town/trainLiveries.ts').LIVERIES;assert(M.WHEEL_SIDES>=16&&M.WHEEL_SIDES<=20&&M.WHEEL_SIDES_FAR>=8&&M.WHEEL_SIDES_FAR<=10,'wheel sides');
 const d=M.buildCarGeometry(LV[0],false).triangles,o=M.buildCarGeometry(LV[0],true).triangles;// Nov 26 2026: +~96 (inner wheel faces + 4 axles, owner: far-side wheels missing from the café seat): was d<=2500, o<4500; measured 2589 / 4575
 assert(d<=2800&&o<14200/* Rail + beach props Nov 27 (owner 188, live bug: the loop strap was 8 open beams with notches): continuous 12x5 tori, lathe-bead collars, ONE swept rail tube with round elbows into the ceiling: 12,323 -> 13,939 (close-up car only).*//* soft sweep Nov 27 2026 (owner: "blockyness inside the train"): the close-up car's cushions, round poles / loops, rounded diffusers: open 4,575 -> 7,039; far cars unchanged. Train interior (Nov 27, the soft read made visible): a puffy cushion + backrest per seat, padded round-cornered end screens, rounded window / door corners, collared poles, fat loop straps, pill diffusers, padded poster frames: open 7,039 -> 12,323; the normal tier gets one chamfered, toned cushion per bench: 2,589 -> 2,765 */,`per-car triangles: normal ${d}, open ${o}`);
 console.log(`train-looks2: per car ${d} tris (normal tier), ${o} (open / close-up)`);}
{const W=read('lib/town/trainWorld.ts');assert(/m\.name='train-catenary'/.test(W)&&/CAT_FADE_NEAR=4.5,CAT_FADE_FAR=8/.test(W)&&/discard/.test(W),'the catenary: its own mesh, faded near the camera');
 assert(!/wire\.beam\(/.test(W)&&/let A=ring\(0\);for\(let i=0;i<n;i\+\+\)/.test(W),'one continuous wire round the loop (a ring per row, no per-chunk pieces)');}
console.log('train-looks2: ok');
