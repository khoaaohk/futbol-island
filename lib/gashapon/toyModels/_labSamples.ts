/**
 * DEV ONLY: sample models that prove the round 3C kit (docs/gashapon-design.md "Round 3C"): working parts (k.hinge, k.lever,
 * k.slider, k.crank, k.wheels), a ball-chain charm (k.chain), a poseable figure (k.pose) and a slow-rising foam squishy.
 * Never registered for players: lib/gashapon/toyModels/index.ts does not import this file; only /toy-lab (app/toy-lab/ToyLab.tsx)
 * loads it and hands it to the viewer through `ToyViewerOpts.lab`. tests/gashapon-viewer.cjs and
 * scripts/check-gashapon-toys-browser.cjs drive them. Ids start `lab-`.
 */
import {createToyKit,type ToyBuilder,type ToyRig,type V3} from '../toyKit';
import type {GashaponToy} from '../toys';
import type {ToyKindPlan} from '../toyKinds';

type Pt=[number,number];
const PI=Math.PI;
const toy=(id:string,name:string,personality:string,body:string,accent:string):GashaponToy=>({id,machine:'gs-square-snacks',name,rarity:'common',personality,
 link:{kind:'island',note:'Toy lab sample'},touch:{squeeze:'squishes',poke:'wobbles',tap:'hops'},sound:'a boop',colors:[body,accent]});

/** A boot box: the lid hinges open (a detent half way, a click at the end stop, a clack when it snaps shut), a side button
 * presses in and springs back, and the lever on the other side pops the corner flag up. */
const bootBox:ToyBuilder=k=>{
 const red=k.c.body,cream='#fff4dc';
 k.rbox(.9,.42,.6,.06,{at:[0,.21,0],color:red});k.box(.8,.02,.5,{at:[0,.405,0],color:k.shade(red,-.25),mat:'matte'});
 // A pair of tiny boots inside (seen when the lid opens).
 for(const s of [-1,1])k.capsule(.06,.16,{at:[s*.15,.45,0],rot:[PI/2,0,0],color:'#1d2b24',mat:'vinyl'}),k.sphere(.025,{at:[s*.15,.5,.1],color:cream,mat:'matte'});
 k.face('body',{at:[0,.23,.305],gap:.11,size:.04,mouth:'smile'});
 k.part('lid',{at:[0,.44,-.3]});k.rbox(.94,.07,.64,.035,{part:'lid',at:[0,.465,0],color:k.shade(red,.08)});k.rbox(.3,.012,.12,.006,{part:'lid',at:[0,.505,.05],color:cream,mat:'matte'});
 k.hinge('lid',{axis:[-1,0,0],max:1.9,detents:[1.05],label:'lid',hint:'Open me'});
 k.part('button',{at:[.45,.22,0]});k.cyl(.055,.055,.06,{part:'button',at:[.48,.22,0],rot:[0,0,PI/2],color:'#ffd447',mat:'vinyl'});
 k.slider('button',{axis:[-1,0,0],max:.035,label:'button',hint:'Push me'});
 k.part('lever',{at:[-.47,.1,.12]});k.capsule(.022,.22,{part:'lever',at:[-.49,.24,.12],color:'#c9ced6',mat:'gold'});k.sphere(.05,{part:'lever',at:[-.49,.37,.12],color:'#ff5a4e'});
 k.part('flag',{at:[-.36,.42,-.22]});k.cyl(.012,.012,.3,{part:'flag',at:[-.36,.57,-.22],color:'#f2f2f2'});k.extrude([[0,0],[.16,-.05],[0,-.1]],.012,{part:'flag',at:[-.355,.71,-.22],color:'#ffd447',mat:'matte'});
 k.lever('lever',{max:.9,label:'lever',hint:'Pull me',fires:{part:'flag',lift:[0,.12,0],hidden:true,hold:1.6}});
 return {kind:{kind:'mechanism'},squeeze:['jiggle'],poke:['wobble'],tap:['hop'],head:'lid',voice:{squeeze:['boop'],poke:['tok'],tap:['boop:1.3']}};
};

/** A kit cart on four wheels (push it: it rolls along the turntable and back) with a crank that spins a gear and the ball on top. */
const kitCart:ToyBuilder=k=>{
 const blue=k.c.body;
 k.rbox(.62,.28,.86,.06,{at:[0,.32,0],color:blue});k.rbox(.5,.04,.7,.02,{at:[0,.47,0],color:k.shade(blue,-.2),mat:'matte'});
 k.face('body',{at:[0,.33,.435],gap:.1,size:.038});
 for(const [n,x,z] of [['wheelFL',-.36,.28],['wheelFR',.36,.28],['wheelBL',-.36,-.28],['wheelBR',.36,-.28]] as const){k.part(n,{at:[x,.13,z]});
  k.cyl(.13,.13,.07,{part:n,at:[x,.13,z],rot:[0,0,PI/2],color:'#1d2b24',mat:'matte'});k.cyl(.06,.06,.08,{part:n,at:[x,.13,z],rot:[0,0,PI/2],color:'#f2f2f2'});
  k.box(.085,.02,.1,{part:n,at:[x,.13,z],color:'#ffd447',mat:'matte'});}// a spoke, so the turning shows
 k.wheels(['wheelFL','wheelFR','wheelBL','wheelBR'],{radius:.13,dir:[0,0,1],range:.42,label:'wheels',hint:'Push me'});
 k.part('ball',{at:[0,.62,0]});k.sphere(.14,{part:'ball',at:[0,.62,0],color:'#ffffff'});for(const [x,y,z] of [[0,.76,0],[.13,.62,0],[-.13,.62,0],[0,.62,.13],[0,.62,-.13],[0,.48,0]] as const)k.sphere(.04,{part:'ball',at:[x,y,z],scale:[1,1,.5],color:'#1d2b24',mat:'ink'});
 k.part('gear',{at:[.32,.36,.05]});k.cyl(.09,.09,.03,{part:'gear',at:[.33,.36,.05],rot:[0,0,PI/2],color:'#e8b92e',mat:'gold'});
 for(let i=0;i<8;i++){const a=i*PI/4;k.box(.03,.04,.03,{part:'gear',at:[.33,.36+Math.cos(a)*.1,.05+Math.sin(a)*.1],rot:[a,0,0],color:'#e8b92e',mat:'gold'});}
 k.part('crank',{at:[.33,.36,-.25]});k.cyl(.03,.03,.05,{part:'crank',at:[.34,.36,-.25],rot:[0,0,PI/2],color:'#c9ced6',mat:'gold'});
 k.box(.03,.16,.03,{part:'crank',at:[.36,.43,-.25],color:'#c9ced6',mat:'gold'});k.capsule(.025,.06,{part:'crank',at:[.4,.5,-.25],rot:[0,0,PI/2],color:'#ff5a4e'});
 k.crank('crank',{axis:'x',label:'handle',hint:'Crank me',drives:[{part:'gear',ratio:-2},{part:'ball',ratio:1.5}]});
 return {kind:{kind:'mechanism'},squeeze:['jiggle'],poke:['wobble'],tap:['hop'],head:'ball',voice:{squeeze:['boop'],poke:['tok'],tap:['bloop']}};
};

/** A football buddy keychain: it hangs from a ball chain under a key ring; grab the ring and swing it. Still squeezy. */
const ballBuddy:ToyBuilder=k=>{
 k.sphere(.3,{at:[0,.32,0],color:'#ffffff',mat:'soft'});
 const patches:V3[]=[[0,.32,.3],[.27,.42,.12],[-.27,.42,.12],[.2,.14,.2],[-.2,.14,.2],[0,.62,0]];
 for(const p of patches){const d=Math.hypot(p[0],p[1]-.32,p[2])||1,n:V3=[p[0]/d*.3,.32+(p[1]-.32)/d*.3,p[2]/d*.3];if(p[2]>.25)continue;k.sphere(.075,{at:n,scale:[1,1,1],color:'#1d2b24',mat:'vinyl'});}
 k.face('body',{at:[0,.36,.3],gap:.1,size:.04,sphere:[0,.32,0,.3]});
 k.cyl(.035,.035,.05,{at:[0,.63,0],color:'#d9c27a',mat:'gold'});// the eyelet the chain holds
 k.chain({mode:'hang',links:10,length:.46,at:[0,.66,0],color:'#d9c27a'});
 return {kind:{kind:'charm'},soft:{soft:.5},squeeze:['jiggle'],poke:['wobble'],tap:['hop'],voice:{squeeze:['squish'],poke:['boop'],tap:['bell']}};
};

/** A keeper figure on a round stand: tap or drag an arm / the head to change pose (save, cheer, star, victory). */
const keeperKit:ToyBuilder=k=>{
 const kit=k.c.body,skin='#f1c9a5',glove='#7bd389';
 k.cyl(.3,.32,.06,{at:[0,.03,0],color:'#244d40',mat:'vinyl'});k.cyl(.26,.26,.008,{at:[0,.064,0],color:'#3d7a5f',mat:'matte'});
 k.capsule(.15,.22,{at:[0,.5,0],color:kit});k.rbox(.08,.09,.02,.01,{at:[0,.52,.15],color:'#ffffff',mat:'matte'});
 for(const [n,x] of [['legL',-.075],['legR',.075]] as const){k.part(n,{at:[x,.33,0]});k.capsule(.055,.16,{part:n,at:[x,.22,0],color:'#1d2b24'});k.rbox(.09,.05,.15,.02,{part:n,at:[x,.095,.03],color:'#ffffff'});}
 k.part('head',{at:[0,.72,0]});k.sphere(.17,{part:'head',at:[0,.86,0],color:skin,mat:'soft'});k.sphere(.175,{part:'head',at:[0,.9,-.03],scale:[1,.7,1],color:'#5a3a22',mat:'matte'});
 k.face('head',{at:[0,.86,.165],gap:.07,size:.03,sphere:[0,.86,0,.17]});
 for(const [n,x,s] of [['armL',-.17,-1],['armR',.17,1]] as const){k.part(n,{at:[x,.64,0]});k.capsule(.045,.17,{part:n,at:[x+s*.03,.52,0],color:kit});k.sphere(.075,{part:n,at:[x+s*.04,.39,0],color:glove,mat:'vinyl'});}
 // A whistle on a lanyard (a dangle chain off the chest: it swings when the keeper moves).
 k.part('whistle',{at:[0,.5,.17]});k.capsule(.022,.04,{part:'whistle',at:[0,.48,.175],rot:[0,0,PI/2],color:'#c9ced6',mat:'gold'});
 k.chain({mode:'dangle',from:'body',at:[0,.64,.16],length:.14,links:4,tag:'whistle',bead:'ring',color:'#ff5a4e'});
 k.pose('save',{armL:{rot:[0,0,-1.5]},armR:{rot:[0,0,1.5]},legL:{rot:[0,0,-.32]},legR:{rot:[0,0,.32]},head:{rot:[0,0,.14]}},{label:'Diving save',grab:['armL','armR']});
 k.pose('cheer',{armL:{rot:[0,0,-2.75]},armR:{rot:[0,0,2.75]},head:{rot:[-.22,0,0]}},{label:'Cheer',grab:['armL','armR','head']});
 k.pose('star',{armL:{rot:[0,0,-2.2]},armR:{rot:[0,0,2.2]},legL:{rot:[0,0,-.45]},legR:{rot:[0,0,.45]}},{label:'Star',grab:['legL','legR']});
 k.pose('victory',{armR:{rot:[0,0,2.95]},armL:{rot:[.3,0,-.35]},head:{rot:[-.15,0,-.1]}},{label:'Victory',grab:['head']});
 return {kind:{kind:'figure'},springs:[],squeeze:['jiggle'],poke:['wobble'],tap:['hop'],head:'head',voice:{squeeze:['squeak'],poke:['boop'],tap:['boop:1.3']}};
};

/** A slow-rising mochi foam squishy: it keeps the squeeze for a moment, then rises slowly (no bounce). */
const foamMochi:ToyBuilder=k=>{
 const dome:Pt[]=[[0,0],[.34,.02],[.44,.12],[.44,.26],[.36,.44],[.2,.55],[0,.58]];
 k.smoothLathe(dome,{color:'#ffe3ec',mat:'soft'});k.face('body',{at:[0,.3,.41],gap:.12,size:.04,eyes:'happy',sphere:[0,.27,0,.42]});
 k.sphere(.08,{at:[0,.58,0],scale:[1,.5,1],color:'#8bd17c',mat:'soft'});
 return {kind:{kind:'squish'},soft:{soft:.8,slow:true},squeeze:['jiggle'],poke:['wobble'],tap:['hop'],voice:{squeeze:['squish'],poke:['boop'],tap:['bloop']}};
};

const SAMPLES:Record<string,{toy:GashaponToy;build:ToyBuilder;plan:ToyKindPlan}>={
 'lab-boot-box':{toy:toy('lab-boot-box','Boot Box (lab)','A boot box with a lid, a button and a corner-flag lever.','#d8342c','#fff4dc'),build:bootBox,plan:{kind:'mechanism',bonus:'squish'}},
 'lab-kit-cart':{toy:toy('lab-kit-cart','Kit Cart (lab)','A kit cart that rolls, with a crank that spins the ball.','#2f6fd6','#ffd447'),build:kitCart,plan:{kind:'mechanism',bonus:'windup'}},
 'lab-ball-buddy':{toy:toy('lab-ball-buddy','Ball Buddy (lab)','A football keychain buddy on a ball chain.','#ffffff','#1d2b24'),build:ballBuddy,plan:{kind:'charm',bonus:'squish'}},
 'lab-keeper-kit':{toy:toy('lab-keeper-kit','Keeper Kit (lab)','A poseable goalkeeper figure.','#ff8a2a','#7bd389'),build:keeperKit,plan:{kind:'figure',bonus:'bobble'}},
 'lab-foam-mochi':{toy:toy('lab-foam-mochi','Foam Mochi (lab)','A slow-rising foam mochi.','#ffe3ec','#8bd17c'),build:foamMochi,plan:{kind:'squish',bonus:'bobble'}},
};
export const LAB_SAMPLE_IDS=Object.keys(SAMPLES);
export const labSampleToy=(id:string)=>SAMPLES[id]?.toy??null;
/** The `ToyViewerOpts.lab` hooks: HD builds of the samples and their kind plans. */
export const labSamples={
 build(id:string):ToyRig|null{const s=SAMPLES[id];if(!s)return null;const k=createToyKit(s.toy,{hd:true});return k.finish(s.build(k));},
 plan(id:string):ToyKindPlan|null{return SAMPLES[id]?.plan??null;},
};
