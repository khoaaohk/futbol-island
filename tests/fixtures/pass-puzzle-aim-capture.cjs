// Shared by tests/pass-puzzle-aim.cjs: the plain-shot regression capture. The stored baseline
// (pass-puzzle-aim-baseline.json) was written from the engine BEFORE aim-anywhere (Nov 11 2026); the test replays the same
// inputs and expects the same outcomes, so every authored route and every plain low shot behaves exactly as it did.
// Regenerate (only when an engine change is meant to move plain shots): node tests/fixtures/pass-puzzle-aim-capture.cjs --write
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
const ROOT=path.join(__dirname,'..','..');
if(!require.extensions['.ts'])require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
if(!Module._fiAimResolve){const resolve=Module._resolveFilename;Module._fiAimResolve=true;Module._resolveFilename=function(req,parent,...rest){if(req.startsWith('@/'))req=path.join(ROOT,req.slice(2));try{return resolve.call(this,req,parent,...rest);}catch(e){if(req.startsWith('.')||path.isAbsolute(req))return resolve.call(this,req+'.ts',parent,...rest);throw e;}};}
const lib=f=>require(path.join(ROOT,'lib','passPuzzle',f));
const r4=n=>Math.round(n*1e4)/1e4;
function capture(){
 const C=lib('catalog.ts'),{coachRun}=lib('coach.ts'),{createPuzzle}=lib('world.ts'),{readStroke}=lib('stroke.ts'),{youthScenario}=lib('youth.ts');
 const out={routes:{},shots:{}};
 const end=w=>{const s=w.state;return [s.phase,s.result?.reason??'',s.tick,r4(s.ball.p.x),r4(s.ball.p.y),r4(s.ball.p.z),s.result?.bonus?1:0].join('|');};
 for(const sc of C.ALL_SCENARIOS){
  const sol=C.ALL_SOLUTIONS[sc.id]?.solution;if(!sol)continue;
  for(const [tag,s] of [['h',sc],['y',youthScenario(sc)]]){
   const run=coachRun(s,sol),w=createPuzzle(s);w.restore(run.start);
   // replay the recorded inputs on a fresh world for the exact end state
   const {replay}=lib('world.ts'),rp=replay(run.start,run.inputs,1);const evs=rp.run();
   out.routes[sc.id+'.'+tag]=(run.ok?'ok':'no')+'|'+end(rp.world)+'|'+evs.filter(e=>e.type!=='woodwork').map(e=>e.type[0]+e.tick).join(',');
  }
  // plain strokes at the goal from the opening state: a straight line that ends 2 m past the line (what a finger draws)
  if(sc.require.finish!=='goal')continue;
  const direct={...sc,require:{...sc.require,allowDirectShot:true}},hg=sc.pitch.goalWidth/2,gz=sc.pitch.length/2;
  for(const fx of [-.92,-.5,0,.5,.92])for(const hold of [0,.5]){
   const w=createPuzzle(direct),b=w.state.ball.p,ex=fx*(hg-.25),ez=gz+2,pts=[];
   for(let i=0;i<=12;i++)pts.push({x:b.x+(ex-b.x)*i/12,z:b.z+(ez-b.z)*i/12,t:i/12*.4});
   if(hold)for(let t=.05;t<=hold;t+=.05)pts.push({x:ex+(t*20%2?.02:0),z:ez,t:.4+t});
   const k=readStroke(pts,w);if(!w.kick(k)){out.shots[`${sc.id}@${fx}/${hold}`]='nokick';continue;}
   const types=[];w.on(e=>types.push(e.type[0]+e.tick));
   for(let g=0;g<120*20&&w.state.phase!=='success'&&w.state.phase!=='fail';g++)w.step(1/120);
   out.shots[`${sc.id}@${fx}/${hold}`]=k.kind+'|'+end(w)+'|'+types.filter(t=>t[0]!=='w').join(',');
  }
 }
 return out;
}
module.exports={capture};
if(require.main===module&&process.argv.includes('--write')){const o=capture();fs.writeFileSync(path.join(__dirname,'pass-puzzle-aim-baseline.json'),JSON.stringify(o));console.log('routes',Object.keys(o.routes).length,'shots',Object.keys(o.shots).length);}
