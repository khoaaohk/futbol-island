const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const {createKnockoutQueueWalls}=load('lib/graphics/knockoutQueueWalls.ts'),parent=new T.Group(),effect=createKnockoutQueueWalls(parent),walls=effect.root.getObjectByName('knockout-red-queue-walls'),sparks=effect.root.getObjectByName('knockout-red-queue-particles');
const players=Array.from({length:7},(_,id)=>({id,alive:true,outAge:0,queue:-1}));
for(let i=0;i<60;i++)effect.update(1/30,players,true,false);assert(effect.root.visible);assert.equal(walls.instanceMatrix.version,1);assert.equal(sparks.instanceMatrix.version,0);
Object.assign(players[0],{alive:false,outAge:2.6,queue:0});effect.update(1/30,players,true,false);assert(effect.root.visible);assert(!sparks.visible,'particles wait until character reaches corner');
players[0].outAge=2.7;effect.update(1/30,players,true,false);assert(effect.root.visible);assert.equal(walls.count,8);assert.equal(sparks.count,12);
const color=walls.geometry.attributes.color,position=walls.geometry.attributes.position;
for(let i=0;i<position.count;i++){if(position.getY(i)===.5)assert.equal(color.getW(i),0,'upper edge fades away');if(position.getY(i)===-.5)assert(color.getW(i)>.3&&color.getW(i)<.4,'base stays translucent');}
const wallVersion=walls.instanceMatrix.version,particleVersion=sparks.instanceMatrix.version;
for(let i=0;i<60;i++)effect.update(1/60,players,true,false);
assert.equal(walls.instanceMatrix.version,wallVersion,'stationary walls do not upload every frame');assert(sparks.instanceMatrix.version-particleVersion<=21,'particle uploads bounded near 20 Hz');
Object.assign(players[1],{alive:false,outAge:3,queue:1});Object.assign(players[2],{alive:false,outAge:3,queue:0});Object.assign(players[3],{alive:false,outAge:3,queue:1});effect.update(.05,players,true,false);assert.equal(walls.count,8);assert.equal(sparks.count,24,'fixed maximum particle pool');
const matrix=new T.Matrix4();for(let i=0;i<sparks.count;i++){sparks.getMatrixAt(i,matrix);assert(matrix.elements.every(Number.isFinite));assert(matrix.elements[13]>=.12&&matrix.elements[13]<4.73,'sparks rise inside faded wall height');}
effect.update(.05,players,true,true);assert(effect.root.visible);assert(!sparks.visible,'reduced motion keeps static red walls');
const versions=[walls.instanceMatrix.version,sparks.instanceMatrix.version];for(let i=0;i<30;i++)effect.update(0,players,true,false);assert.deepEqual([walls.instanceMatrix.version,sparks.instanceMatrix.version],versions,'paused game does no work');
players.forEach(p=>p.alive=true);effect.update(.05,players,true,false);assert(effect.root.visible);assert(!sparks.visible);
Object.assign(players[0],{alive:false,outAge:3,queue:0});effect.update(.05,players,false,false);assert(effect.root.visible);assert(!sparks.visible,'spectator placeholder does not emit particles');
effect.dispose();assert.equal(parent.children.length,0);
console.log('PASS red transparent walls, upward fade, occupied/arrival gates, 24-particle cap, static wall uploads, 20 Hz particles, pause/reduced motion and disposal');
