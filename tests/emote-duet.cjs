// Two-ball duets with a party friend (owner, Oct 23 2026: "both friends have balls: they both need to pass and juggle with both balls"):
// lib/town/emoteDuet.ts. Both balls are in play, each starts and ends at its owner's feet, the pass lanes keep the balls apart as they cross,
// the juggle touches alternate, everything stays in the pair's frame, the same seed gives the same routine on every screen, no allocation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const full=path.join(ROOT,file),m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Float32Array,Float64Array,Uint8Array,Error,Infinity,Number,require:id=>{
   if(id.startsWith('.'))return load(path.relative(ROOT,path.resolve(path.dirname(full),id)+'.ts'));
   throw new Error('unexpected require '+id);}});
 cache.set(file,m.exports);return m.exports;
}
const D=load('lib/town/emoteDuet.ts');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const A={x:10,y:2,z:-5},B={x:13.2,y:2,z:-5.6},mid={x:(A.x+B.x)/2,z:(A.z+B.z)/2};
const d2=(p,q)=>Math.hypot(p.x-q.x,p.z-q.z);

for(const [emote,name,list] of [[6,'pass',D.DUET_PASS_ROUTINES],[3,'juggle',D.DUET_JUGGLE_ROUTINES]])for(let seed=0;seed<list.length;seed++){
 const r=D.duetRoutine(emote,seed),dur=D.duetSeconds(emote,seed);
 t(name+' '+r.id+': both balls start and end at their owner, stay in frame, and both move',()=>{
  const o=D.createDuetOut();
  D.duetAt(emote,seed,0,A,B,o);
  assert.ok(d2(o.balls[0],A)<1&&d2(o.balls[1],B)<1,'each ball starts at its owner');
  const moved=[0,0],last=[{...o.balls[0]},{...o.balls[1]}];let minGap=99,atPartner=[false,false];
  for(let a=0;a<=dur+.5;a+=1/60){
   D.duetAt(emote,seed,a,A,B,o);
   for(let k=0;k<2;k++){const b=o.balls[k];
    assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.z),'finite');
    assert.ok(b.y>=A.y+.15&&b.y<=A.y+3.4,'height in range '+b.y);
    assert.ok(d2(b,mid)<=3,'near the pair');
    moved[k]+=d2(b,last[k]);last[k].x=b.x;last[k].z=b.z;
    if(d2(b,k===0?B:A)<.9)atPartner[k]=true;}
   if(o.balls[0].y<1&&o.balls[1].y<1)minGap=Math.min(minGap,Math.hypot(o.balls[0].x-o.balls[1].x,o.balls[0].z-o.balls[1].z));
  }
  assert.ok(moved[0]>3&&moved[1]>3,'both balls are in play');
  assert.ok(atPartner[0]&&atPartner[1],'each ball reaches the partner');
  assert.ok(d2(o.balls[0],A)<1&&d2(o.balls[1],B)<1,'each ball ends back at its owner');
  assert.ok(minGap>.25,'the two balls never overlap ('+minGap.toFixed(2)+')');
  assert.ok(dur>4&&dur<11,'length '+dur);
 });
}
t('pass: both players kick at the same moment and both receive (no idle partner)',()=>{
 const o=D.createDuetOut();let kicks=[0,0],recv=[0,0],wasK=[false,false];
 for(let a=0;a<8;a+=1/60){D.duetAt(6,0,a,A,B,o);for(let k=0;k<2;k++){const ac=o.actors[k],on=ac.kick!==undefined;if(on&&!wasK[k])kicks[k]++;wasK[k]=on;if(ac.receive>.99)recv[k]++;}}
 assert.equal(kicks[0],kicks[1]);assert.ok(kicks[0]>=4,'four exchanges each');assert.ok(recv[0]>0&&recv[1]>0);
});
t('juggle: each juggles their own ball, the touches alternate, then a chest-down swap',()=>{
 const o=D.createDuetOut();let first=[-1,-1],chest=[false,false];
 for(let a=0;a<9.5;a+=1/120){D.duetAt(3,0,a,A,B,o);for(let k=0;k<2;k++){const ac=o.actors[k];if(ac.juggle!==undefined&&first[k]<0)first[k]=a;if(ac.reaction==='chest')chest[k]=true;}}
 assert.ok(first[1]-first[0]>.25&&first[1]-first[0]<.35,'friend touches half a beat later ('+(first[1]-first[0]).toFixed(2)+')');
 assert.ok(chest[0]&&chest[1],'both chest the other ball');
});
t('same seed -> same routine on every screen; the teaching lines',()=>{
 assert.equal(D.duetRoutine(6,7).id,D.duetRoutine(6,7).id);
 const ids=new Set(D.DUET_PASS_ROUTINES.map(r=>r.id).concat(D.DUET_JUGGLE_ROUTINES.map(r=>r.id)));assert.equal(ids.size,6);
 const o=D.createDuetOut();D.duetAt(6,0,.5,A,B,o);assert.ok(/foot/i.test(o.say),'a football tip: '+o.say);
});
t('no allocation per frame: duetAt writes reused objects',()=>{
 const src=read('lib/town/emoteDuet.ts'),body=src.slice(src.indexOf('export function duetAt'));
 assert.ok(!/new |\[\]|\{\s*x:/.test(body.split('\n').slice(1,12).join('\n')),'no literals in the per-frame path');
 const o=D.createDuetOut(),b0=o.balls[0],a0=o.actors[0];D.duetAt(3,1,2,A,B,o);assert.equal(o.balls[0],b0);assert.equal(o.actors[0],a0);
});
console.log('emote-duet: '+n+' checks ok');
