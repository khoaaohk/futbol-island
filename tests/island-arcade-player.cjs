// Adapter contract: game contact must survive follow-through and a retry clears every action.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),T=require('three');
const root=new T.Group(),pelvis=new T.Group();pelvis.name='player-pelvis';root.add(pelvis);
const jersey=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial());jersey.name='player-jersey';pelvis.add(jersey);
for(const name of ['player-head',...['left','right'].flatMap(s=>['hip','knee','ankle','shoulder','elbow'].map(j=>`${s}-${j}`))]){const g=new T.Group();g.name=name;pelvis.add(g);}
let latest,dressed=0;const native={root,setProfile(){},setExpression(){},setBeanLook(){dressed++;},setAppearance(){},update(x,z,dt,t,reduced,intent){latest={...intent};},dispose(){}};
const m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/islandArcadePlayer.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math,require(id){if(id==='three')return T;if(id.includes('graphics/player'))return{createPlayer:()=>native,profileFor:()=>({}),PLAYER_KICK_CONTACT:.36};if(id.includes('arcadePlayerMotion'))return{createArcadePlayerMotion:()=>({stride:0,hips:[],knees:[]})};if(id.includes('quizProgress'))return{getQuizProgress:()=>({completed:0,total:0})};if(id.includes('customization'))return{loadCustomization:()=>({}),beanLookFor:()=>({}),playerOutfit:()=>({})};if(id.includes('beanLooks'))return{teamedLook:(a,b)=>b};throw Error(id);}});
const rig=m.exports.createIslandArcadePlayer('#fff',false,1);root.scale.setScalar(1.8);
rig.pose(1/60,0,0,1,0,0,{strikeX:.3,strikeZ:.8,shotPower:.15,actionKind:'pass'});
assert.equal(latest.strikeX,.3);assert.equal(latest.kick,.36);assert.equal(latest.actionKind,'pass');assert.equal(latest.shotPower,.15);
rig.pose(1/60,0,0,.8,0,0,{strikeX:-1,strikeZ:4,shotPower:1,actionKind:'shot'});
assert.equal(latest.strikeX,.3);assert.equal(latest.strikeZ,.8);assert.equal(latest.actionKind,'pass');assert.equal(latest.shotPower,.15);assert(latest.kick>.36,'follow through advances without changing contact');
rig.pose(1/60,0,0,0,0,0,{dive:{progress:.5,dir:1},keeper:1,charge:.7,celebrate:1,jumpProgress:.47,skill:{type:'blockTackle',progress:.34,side:1}});assert.equal(latest.dive.progress,.5);assert.equal(latest.jump.progress,.47);assert.equal(latest.jump.height,0,'simulation owns jump lift');assert.equal(latest.skill.type,'blockTackle');
rig.resetPose();assert.equal(latest.dive,undefined);assert.equal(latest.jump,undefined);assert.equal(latest.skill,undefined);assert.equal(latest.shotCharge,undefined);assert.equal(latest.called,undefined);assert.equal(latest.kick,undefined);assert.equal(rig.motion.stride,0);
rig.setDress({look:{},outfit:{}});assert.equal(dressed,1,'pooled actors change their visible bean dress');
rig.dispose();jersey.geometry.dispose();jersey.material.dispose();console.log('PASS island arcade adapter: contact/power/action latching, new keeper channel, clean retry, pooled dress');
