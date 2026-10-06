// Pass Puzzles no-heading youth mode: every puzzle is solvable without a header, attackers never
// touch the ball above chest height, and the youth copy keeps the reading-level rules.
// Run: node tests/pass-puzzle-youth.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const lib=f=>require(path.join(__dirname,'..','lib','passPuzzle',f));
const P=lib('index.ts'),{SCENARIOS,SCENARIO_SOLUTIONS}=lib('scenarios.ts'),{CHALLENGE_SCENARIOS,CHALLENGE_SOLUTIONS}=lib('challenges.ts'),{YOUTH,YOUTH_SOLUTIONS,youthScenario,usesHeading}=lib('youth.ts');
const ALL=[...SCENARIOS,...CHALLENGE_SCENARIOS],SOL={...SCENARIO_SOLUTIONS,...CHALLENGE_SOLUTIONS};
function strokeFor(w,k,{dx=0,dz=0,dl=0}={}){const s=w.state,b=s.ball.p,g=w.scenario.pitch,goalZ=g.length/2,hg=g.goalWidth/2-0.25;let end;
 if(k.kind==='shot')end={x:Math.max(-hg,Math.min(hg,k.target.x+dx)),z:goalZ+2};else if((k.kind==='pass-feet'||k.kind==='header')&&k.receiver!=null){const a=s.attackers[k.receiver].p;end={x:a.x+dx,z:a.z+dz};}else end={x:k.target.x+dx,z:k.target.z+dz};
 const DX=end.x-b.x,DZ=end.z-b.z,L=Math.hypot(DX,DZ),nx=DZ/L,nz=-DX/L,bow=k.curl?Math.sign(k.curl)*(Math.abs(k.curl)*0.22*L+0.4):0,loft=k.loft>0?Math.min(1,Math.max(0.16,k.loft+dl)):0,hold=loft>0?0.25+(loft-0.15)*0.45/0.85+0.002:0;
 const pts=[],n=Math.max(3,Math.min(24,Math.floor(L/0.5)));for(let i=0;i<=n;i++){const u=i/n,o=Math.sin(Math.PI*u)*bow;pts.push({x:b.x+DX*u+nx*o,z:b.z+DZ*u+nz*o,t:u*.4});}
 if(hold>0){for(let t=0.05;t<hold;t+=0.05)pts.push({x:end.x+0.02,z:end.z,t:.4+t});pts.push({x:end.x,z:end.z,t:.4+hold});}return pts;}
function play(sc,route,slop={}){const w=P.createPuzzle(sc),ev=[],drawn=[];w.on(e=>ev.push(e));let i=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;if(ph==='aiming'){if(i>=route.length)break;const k=P.readStroke(strokeFor(w,route[i++],slop),w);drawn.push(k);assert(w.kick(k));}w.step(1/120);}return{w,ev,drawn};}
const routeOf=id=>YOUTH_SOLUTIONS[id]??SOL[id].solution.map(k=>k.kind==='header'?{...k,kind:'pass-feet'}:k);
let robust=0,total=0;
for(const base of ALL){
 const sc=youthScenario(base);assert.equal(sc.require.noHeading,true);assert.equal(sc.require.offside,true,base.id+' keeps offside');
 const {w,ev,drawn}=play(sc,routeOf(base.id));
 assert.equal(w.state.phase,'success',`${base.id} youth route: ${JSON.stringify(w.state.result)} ${ev.map(e=>e.type+(e.attacker??'')).join('>')}`);
 assert(!drawn.some(k=>k.kind==='header'),base.id+' no header kicks are drawn');
 assert(!ev.some(e=>(e.type==='receive'||e.type==='heavy_touch')&&e.touch==='header'),base.id+' no attacker plays it with the head');
 assert(!w.state.chain.some(c=>c.header),base.id+' no kick leaves the head');
 if(base.bonus&&base.bonus.kind!=='curl'&&base.bonus.kind!=='chip')assert(w.state.result.bonus,base.id+' the youth route earns the bonus');
 const v=[{dx:.4},{dx:-.4},{dz:.4},{dz:-.4}];let ok=0;for(const s of v)if(play(sc,routeOf(base.id),s).w.state.phase==='success')ok++;
 total+=v.length;robust+=ok;assert(ok>=v.length-2,`${base.id} youth route too knife-edge: ${ok}/${v.length}`);
 const rp=P.replay(w.attemptStart(),w.inputs()).run();assert.deepEqual(rp.map(e=>[e.type,e.tick]),ev.map(e=>[e.type,e.tick]),base.id+' replay');
 // the setting is off by default: the normal puzzle never sets the rule
 assert.notEqual(base.require.noHeading,true);
}
// Copy: youth wording keeps the reading-level rules and never mentions heading.
const LIM={'7v7':[12,24],'9v9':[18,30],'11v11':[22,34]},words=s=>s.split(/\s+/).filter(x=>/[A-Za-z0-9]/.test(x));
for(const [id,y] of Object.entries(YOUTH)){assert(ALL.some(s=>s.id===id),id);
 for(const key of ['brief','hint'])if(y[key])for(const [f,[sent,tot]] of Object.entries(LIM)){const t=y[key][f];assert(t&&words(t).length<=tot,`${id} ${key} ${f} length`);for(const s of t.split(/(?<=[.!?:;])\s+/))assert(words(s).length<=sent,`${id} ${key} ${f}: "${s}"`);}
 const all=[y.title,y.lesson,y.bonusLabel,...['brief','hint'].flatMap(k=>y[k]?Object.values(y[k]):[])].filter(Boolean).join(' ');
 assert(!/\bhead(s|ed|ing|er|ers)?\b/i.test(all),id+' youth copy never asks for a header: '+all.match(/\bhead\w*/i));}
// Every puzzle whose normal route uses the head has youth copy or a youth route.
for(const sc of ALL)if(SOL[sc.id].solution.some(k=>k.kind==='header')||/\bhead(s|ed|ing|er|ers)?\b/i.test(Object.values(sc.brief).join(' ')+Object.values(sc.hint).join(' ')))assert(usesHeading(sc.id),sc.id+' needs a youth version');
// Engine rule: in no-heading mode a cross aimed at a head is let drop and controlled below chest height.
{const sc=youthScenario(SCENARIOS.find(s=>s.id==='air-near-post')),w=P.createPuzzle(sc),ev=[];w.on(e=>ev.push(e));
 w.kick({kind:'header',target:{x:4,z:25.5},receiver:1,curl:0,loft:.6,power:.53});assert.equal(w.state.pending.kick.kind,'pass-feet','a header kick becomes a chip to feet');
 for(let g=0;g<1200&&w.state.phase!=='aiming'&&!w.state.result;g++)w.step(1/120);const r=ev.find(e=>e.type==='receive');assert(r&&r.at.y<=1.36&&r.touch!=='header','controlled at chest height or below: '+JSON.stringify(r));}
console.log(`PASS youth no-heading: ${ALL.length} puzzles solvable without the head (sloppy ${robust}/${total}), no head touches, offside kept, copy rules, engine drop-to-chest`);
