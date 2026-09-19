const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const canvases=[];
const document={createElement(){const calls=[],context={fillRect(){calls.push(['fill',this.fillStyle]);},fillText(text){calls.push(['text',text,this.fillStyle]);},createRadialGradient(){return{addColorStop(at,color){calls.push(['stop',at,color]);}};},beginPath(){},moveTo(){},lineTo(){},stroke(){},save(){},restore(){},translate(){},scale(){}};const canvas={calls,getContext:()=>context};canvases.push(canvas);return canvas;}};
const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/graphics/knockoutCountdown.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:mod,exports:mod.exports,require,document,Math});
const parent=new T.Group(),counter=mod.exports.createKnockoutCountdown(parent),badge=counter.root.getObjectByName('knockout-countdown-badge'),burst=counter.root.getObjectByName('knockout-countdown-burst');
assert.equal(canvases.length,5,'four cached labels and one shared burst');
assert.deepEqual(canvases.slice(0,4).map(c=>c.calls.find(x=>x[0]==='text')[1]),['3','2','1','GO!']);
for(const c of canvases.slice(0,4)){assert(c.calls.some(x=>x[0]==='fill'&&x[1]==='rgba(243,166,196,.65)'));assert(c.calls.some(x=>x[0]==='text'&&x[2]==='#502b40'));}
assert(canvases[4].calls.some(x=>x[0]==='stop'&&x[1]===1&&x[2]==='rgba(255,255,255,0)'),'burst edge feathers completely');
const versions=[];
for(const [remaining,index] of [[3,0],[2.85,0],[2,1],[1,2],[0,3]]){counter.update(remaining,remaining?0:.1,false);assert.equal(badge.material.map.image,canvases[index]);assert(counter.root.visible);versions.push(badge.material.map.version);}
counter.update(2.85,0,false);assert(badge.scale.x>6,'number pops');assert(burst.material.opacity>0,'finite yellow burst');
counter.update(2.85,0,true);assert.equal(badge.scale.x,6);assert.equal(badge.position.y,7);assert(burst.material.opacity<=.2,'reduced motion is a quiet stationary halo');
counter.update(0,.79,false);assert(badge.material.opacity<.1,'GO fades');counter.update(0,.8,false);assert(!counter.root.visible);
const state=JSON.stringify([badge.position.toArray(),badge.scale.toArray(),burst.position.toArray(),burst.scale.toArray(),badge.material.opacity,burst.material.opacity]);
for(let i=0;i<100;i++)counter.update(0,1+i/30,false);
assert.equal(JSON.stringify([badge.position.toArray(),badge.scale.toArray(),burst.position.toArray(),burst.scale.toArray(),badge.material.opacity,burst.material.opacity]),state,'inactive update leaves transforms and opacity untouched');
assert.equal(canvases.length,5,'updates never repaint or create textures');
counter.update(3,0,false);assert(counter.root.visible);assert.equal(badge.material.map.image,canvases[0],'next round starts at 3');
let disposed=0;for(const texture of new Set([badge.material.map,burst.material.map]))texture.addEventListener('dispose',()=>disposed++);counter.dispose();assert.equal(parent.children.length,0);assert.equal(disposed,2);
console.log('PASS pink score styling, 3/2/1/GO sequence, pop/feathered burst, reduced motion, cached textures, idle work and cleanup');
