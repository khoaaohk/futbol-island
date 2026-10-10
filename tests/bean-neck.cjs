// Bean neck (body-mechanics pass, Oct 10 2026): the bean's face lives on the torso, so the rig's gaze (ball attention,
// look into turns, header nods) now bends the top of the bean (lumbar.w / chest.w texels), with an overlap spring that
// lags a start, overshoots a stop once and settles; reduced motion keeps it still; a bean costume switches it off.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),T=require('three');
const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx'))):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const CS=load('lib/graphics/characterStyle.ts'),P=load('lib/graphics/player.ts'),B=load('lib/graphics/beanSkin.ts');
const make=(id='neck')=>{CS.setCharacterStyle('bean');const r=P.createPlayer(id,'home',true);CS.setCharacterStyle(undefined);return r;};
const row=rig=>B.beanSkinOf(rig).data,gaze=rig=>{rig.root.updateMatrixWorld(true);B.beanSkinOf(rig).sync();const d=row(rig);return [d[B.BD.lumbar*4+3],d[B.BD.chest*4+3]];};

// ---- Neck weight: never at the shoulders (arms stay put), complete over the eyes, for every build.
{
 for(const build of ['regular','tall','short','wide']){
  const s=B.BEAN_SHAPES[build],faceY=-.13+.775*(s.H+.13);
  assert.equal(B.beanNeckWeight(s,.3),0,build+': chest below the neck');
  assert(B.beanNeckWeight(s,.385)<.12,build+': shoulder height barely bends ('+B.beanNeckWeight(s,.385).toFixed(3)+')');
  assert.equal(B.beanNeckWeight(s,faceY),1,build+': the face turns as one piece');
  let last=0;for(let y=0;y<=1.1;y+=.01){const w=B.beanNeckWeight(s,y);assert(w>=last-1e-12,'monotonic');last=w;}
 }
 // The shaders bend body, hair and hat by the same rotation (one function, all three vertex programs use it).
 const src=fs.readFileSync('lib/graphics/beanSkin.ts','utf8');
 assert.match(src,/beanRh=beanEuler\(vec3\(l\.w,c\.w,0\.\)\)/);assert.match(src,/p=mix\(p,beanRh\*p,wh\)/);assert.match(src,/n=mix\(n,beanRh\*n,wh\)/);
 console.log('NECK_WEIGHT_PASS');
}

// ---- Gaze: the ball on the left turns the face left; ahead keeps it level.
{
 const rig=make('gaze');let g;
 for(let i=0;i<60;i++)rig.update(0,0,1/60,i/60,false,{facing:0,lookX:-3,lookZ:3});
 g=gaze(rig);assert(g[1]<-.15,'looks toward a ball on its left (yaw '+g[1].toFixed(3)+')');
 for(let i=0;i<60;i++)rig.update(0,0,1/60,1+i/60,false,{facing:0,lookX:3,lookZ:3});
 g=gaze(rig);assert(g[1]>.15,'and to the right (yaw '+g[1].toFixed(3)+')');
 assert(Math.abs(g[1])<=.5&&Math.abs(g[0])<=.45,'bounded');
 rig.dispose();
 console.log('GAZE_PASS',g.map(v=>v.toFixed(3)).join(' '));
}

// ---- Overlap spring: a hard stop tips the top forward past where it settles, then it settles still; starts lag back.
{
 const rig=make('spring');let x=0,t=0,v=0;const pitch=[];
 const step=(speed,brake)=>{x+=speed/60;t+=1/60;rig.update(0,x,1/60,t,false,{facing:0,brake});return gaze(rig)[0];};
 for(let i=0;i<20;i++)step(0,0);
 const rest0=gaze(rig)[0];
 let minStart=Infinity;for(let i=0;i<30;i++){v=Math.min(6,v+.4);minStart=Math.min(minStart,step(v,0));}
 assert(minStart<rest0-.02,'accelerating, the top lags back ('+minStart.toFixed(3)+' vs rest '+rest0.toFixed(3)+')');
 for(let i=0;i<60;i++)step(6,0);
 let maxStop=-Infinity;for(let i=0;i<20;i++){v=Math.max(0,v-.6);maxStop=Math.max(maxStop,step(v,1));pitch.push(gaze(rig)[0]);}
 for(let i=0;i<120;i++)pitch.push(step(0,0));
 const settled=pitch[pitch.length-1];
 assert(maxStop>settled+.04,'braking, the top tips forward ('+maxStop.toFixed(3)+' vs settled '+settled.toFixed(3)+')');
 // Overshoot: after the brake peak it swings back past the settle value at least once (follow-through), then is still.
 const peakAt=pitch.indexOf(Math.max(...pitch));assert(Math.min(...pitch.slice(peakAt))<settled-.003,'one overshoot back');
 const tail=pitch.slice(-20);assert(Math.max(...tail)-Math.min(...tail)<.004,'settles still');
 rig.dispose();
 console.log('SPRING_PASS',minStart.toFixed(3),maxStop.toFixed(3),settled.toFixed(3));
}

// ---- Footfall nod while running (alive), never with reduced motion; reduced motion has no spring either.
{
 const run=reduced=>{const rig=make('nod');let x=0;const p=[];for(let i=0;i<150;i++){x+=5/60;rig.update(0,x,1/60,i/60,reduced,{facing:0});if(i>90)p.push(gaze(rig)[0]);}rig.dispose();return Math.max(...p)-Math.min(...p);};
 const live=run(false),still=run(true);
 assert(live>.04,'running nods with the steps ('+live.toFixed(3)+')');
 assert(still<.01,'reduced motion: no nod ('+still.toFixed(3)+')');
 console.log('NOD_PASS',live.toFixed(3),still.toFixed(3));
}

// ---- A bean costume swaps the body material: the bend switches off so the hood stays on its ears/horns.
{
 const rig=make('costume'),skin=B.beanSkinOf(rig),body=skin.meshes[0],base=body.material;
 for(let i=0;i<40;i++)rig.update(0,0,1/60,i/60,false,{facing:0,lookX:-3,lookZ:3});
 assert(Math.abs(gaze(rig)[1])>.1);
 body.material=base.clone();assert.deepEqual(gaze(rig),[0,0],'costume: no neck bend');
 body.material.dispose();body.material=base;assert(Math.abs(gaze(rig)[1])>.1,'back on when it comes off');
 rig.dispose();
 console.log('COSTUME_PASS');
}
// ---- Idle breathing: standing swells the bean's own meshes a little (volume-preserving; joints untouched, so foot locks
// and the joint goldens stay exact), running/reduced motion do not, and it returns exactly to scale 1 when moving off.
{
 const bodyOf=r=>B.beanSkinOf(r).meshes[0],torsoOf=r=>r.root.getObjectByName('armor-torso');
 const stand=(reduced)=>{const r=make('breath');const ys=[],ts=[];for(let i=0;i<240;i++){r.update(0,0,1/60,i/60,reduced,{facing:0});ys.push(bodyOf(r).scale.y);ts.push(torsoOf(r).scale.y);}return {r,ys,ts};};
 const live=stand(false),still=stand(true);
 const span=a=>Math.max(...a)-Math.min(...a);
 assert(span(live.ys)>.015&&span(live.ys)<.03,'standing breathes ('+span(live.ys).toFixed(4)+')');
 assert.equal(span(live.ts),0,'the torso joint never scales for breath');
 const b=bodyOf(live.r).scale;assert(Math.abs(b.x*b.y*b.z-1)<1e-9,'volume kept');
 const hair=B.beanSkinOf(live.r).meshes[2];assert.equal(hair.scale.y,b.y,'hair rides with the body');
 assert(bodyOf(live.r).matrix.elements[5]===b.y,'matrix refreshed');
 assert.equal(span(still.ys),0,'reduced motion: still');
 let x=0;for(let i=0;i<90;i++){x+=5/60;live.r.update(0,x,1/60,4+i/60,false,{facing:0});}
 assert.equal(bodyOf(live.r).scale.y,1,'moving: back to scale 1');
 live.r.dispose();still.r.dispose();
 console.log('BREATH_PASS',span(live.ys).toFixed(4));
}
console.log('BEAN_NECK_PASS');
