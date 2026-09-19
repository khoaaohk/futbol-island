const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),mod={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/graphics/parachute.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:mod,exports:mod.exports,require,Math});
const chute=mod.exports.createParachute(),canopy=chute.root.children[0];
chute.update(0,20,0,0,true,0,1/60,0,false);
assert.equal(canopy.scale.y,1,'Opening stays overhead instead of scaling ropes from feet');
const T=require('three'),left=new T.Vector3(-.3,22,.1),right=new T.Vector3(.3,22,.1);chute.attachHands(left,right);canopy.updateWorldMatrix(true,true);let lineIndex=0;for(const line of canopy.children.filter(c=>c instanceof T.Line)){const anchor=new T.Vector3().fromBufferAttribute(line.geometry.getAttribute('position'),0);line.localToWorld(anchor);assert.ok(anchor.distanceTo(lineIndex++<2?left:right)<1e-5,'Ropes follow actual world-space hands');}
chute.update(0,20,0,0,false,0,1/60,0,false,true);
for(let i=0;i<30;i++)chute.update(0,0,0,0,false,0,1/60,0,false);
assert.equal(canopy.position.x,0);assert.equal(canopy.position.z,0);
assert(canopy.scale.y<1,'Released dome softly deflates');
for(let i=0;i<100;i++)chute.update(0,0,0,0,false,0,1/60,0,false);
assert.equal(canopy.visible,false,'Released canopy finishes without lingering');
chute.dispose();console.log('Parachute: overhead opening, hand anchors, centered deflation and cleanup passed.');
for(const cut of [false,true])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 const p=mod.exports.createParachute(),c=p.root.children[0],height=cut?20:0;
 p.update(0,height,0,yaw,true,1,1/60,0,false);
 // Generous head envelope includes the large mascot/armored heads.
 const head=new T.Box3(new T.Vector3(-1.7,height+1.4,-1.7),new T.Vector3(1.7,height+4.8,1.7));
 for(let i=0;i<150;i++){
  p.update(0,height,0,yaw,false,0,1/60,0,false,cut);c.updateWorldMatrix(true,true);
  assert.equal(c.position.x,0,'no sideways slide');assert.equal(c.position.z,0,'no sideways slide');if(c.visible){const cloth=new T.Box3();for(const mesh of c.children.filter(child=>child instanceof T.Mesh))cloth.union(new T.Box3().setFromObject(mesh));assert(!cloth.intersectsBox(head),JSON.stringify({cut,yaw,i,min:cloth.min,max:cloth.max}));}
 }
 p.dispose();
}
console.log('PARACHUTE_CLEARANCE_PASS landing and cut canopy avoid large heads in all four headings');
