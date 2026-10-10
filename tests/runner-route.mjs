// Breakaway Run winding route (Oct 9 2026): smooth bends and hills, the vertex bend table,
// slope pace within fairness limits, the inside-line rule on bends, route tips and missions.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const Route=await import('../components/games/runnerRoute.ts');
const R=await import('../lib/arcade/runnerGame.ts');
const M=await import('../lib/arcade/runnerMissions.ts');
const H=await import('../lib/arcade/runnerHud.ts');
const {routeCurve,routeGrade,routeBendTable,routeHeadingAhead,ROUTE_BEND_MIN,ROUTE_STEEP}=Route;
const {createRunnerGame,tickRunner,runnerPace,runnerSlopeFactor,runnerTopSpeed,runnerInsideLane,RUNNER_SLOPE}=R;
const fresh=(extra={})=>{const s=createRunnerGame();s.spawn=99;s.nextGoal=1e6;Object.assign(s,extra);return s;};

// 1. Shape: continuous heading/height (no kinks), curvature and grade continuous, kick-off straight and flat.
{let pk=routeCurve(0),pg=routeGrade(0);
 for(let s=0;s<4000;s+=.5){const k=routeCurve(s),g=routeGrade(s);assert(Math.abs(k-pk)<.0008,`curvature continuous at ${s}`);assert(Math.abs(g-pg)<.0055,`grade continuous at ${s}`);pk=k;pg=g;}
 for(let s=0;s<30;s++){assert.equal(routeCurve(s),0);assert.equal(routeGrade(s),0);}}
// 2. Difficulty ramps with curvature and steepness, and every stage has real bends and climbs.
{const peak=st=>{let k=0,g=0,bend=0,steep=0;for(let s=st*360;s<st*360+360;s++){k=Math.max(k,Math.abs(routeCurve(s)));g=Math.max(g,Math.abs(routeGrade(s)));if(Math.abs(routeCurve(s))>ROUTE_BEND_MIN)bend++;if(Math.abs(routeGrade(s))>ROUTE_STEEP)steep++;}return{k,g,bend,steep};};
 const stages=[0,1,2,3,4,5,6,7].map(peak);
 assert(stages.every(p=>p.bend>30),'every stage has bends');assert(stages.slice(2).every(p=>p.steep>20),'climbs and descents from stage 3');
 assert(stages[5].k>stages[0].k*1.8&&stages[5].g>stages[0].g*2.4,'stage 6 bends twice as sharp and hills over twice as steep as stage 1');
 assert(stages.every(p=>p.k<.025&&p.g<.16),'bounded: radius > 40 m, grade < 16 %');}
// 3. Bend table: the runner sits at the origin facing the screen, samples are one step apart along the curve,
// and it matches the route's own heading. Repeated calls give identical tables (no hidden state).
{const out=new Float32Array(160),o={d0:-24,step:4,n:40,yaw:0,viewSlope:0,drop:0};
 for(const s0 of[0,430,1210,2905]){routeBendTable(s0,out,o);const k0=6;assert.equal(out[k0*4],0);assert.equal(out[k0*4+1],0);assert(Math.abs(out[k0*4+2])<1e-6);assert(Math.abs(out[k0*4+3])<1e-6);
  for(let k=1;k<40;k++){const dx=out[k*4]-out[k*4-4],dz=out[k*4+1]-out[k*4-3];assert(Math.abs(Math.hypot(dx,dz)-4)<.02,'arc length per sample');}
  assert(Math.abs(out[(k0+10)*4+2]-routeHeadingAhead(s0,40))<1e-5,'heading matches the route');
  const copy=out.slice();routeBendTable(s0,out,o);assert.deepEqual(out,copy);}
 // Look-ahead yaw turns the whole frame; view slope and drop only lower the far road.
 routeBendTable(1210,out,{...o,yaw:.2});assert(Math.abs(out[6*4+2]+.2)<1e-6,'look-ahead yaw rotates the frame');
 const flat=routeBendTable(1210,new Float32Array(160),o),dropped=routeBendTable(1210,new Float32Array(160),{...o,drop:.001});
 assert(Math.abs(dropped[39*4+3]-(flat[39*4+3]-.001*132*132))<1e-3,'horizon drop ahead');assert.equal(dropped[0*4+3],flat[0*4+3],'no drop behind');}

// 4. Slope pace: slower uphill, faster downhill, ±10 %, never past the old top speed.
assert(runnerSlopeFactor(.08)<1&&runnerSlopeFactor(-.08)>1);assert.equal(runnerSlopeFactor(1),RUNNER_SLOPE.min);assert.equal(runnerSlopeFactor(-1),RUNNER_SLOPE.max);
{let up=0,down=0;for(let d=700;d<2400;d+=1){const g=routeGrade(d);if(g>.06&&!up)up=d;if(g<-.06&&!down)down=d;}assert(up&&down,'route has real climbs and descents');
 const a=fresh({distance:up}),b=fresh({distance:down});tickRunner(a,1/60);tickRunner(b,1/60);
 assert(a.speed<runnerPace(up)-.3,'uphill is slower');assert(b.speed>runnerPace(down)+.3,'downhill is faster');
 // Worst case: boost + one-two burst on the steepest descent stays at the old ceiling, so read windows hold.
 let steep=0,worst=0;for(let d=1600;d<4000;d++)if(routeGrade(d)<worst){worst=routeGrade(d);steep=d;}
 const c=fresh({distance:steep,boost:9,burst:9});tickRunner(c,1/60);assert(c.speed<=runnerTopSpeed(steep)+1e-9,'slope never beats the fairness ceiling');
 for(const role of['jockey','tackler','sweeper','presser']){const s=fresh({distance:steep,boost:100,burst:100});s.objects=[{kind:'defender',lane:0,z:-34,role,passed:false,openLane:0}];
  for(let n=0;n<120&&!s.objects[0].passed;n++){s.burst=100;tickRunner(s,1/60);}assert((s.objects[0].read??0)>=1,`${role} still telegraphs ≥1 s on the steepest descent`);}
 // Downhill the ball runs away: a lane cut takes a touch longer than uphill (but still lands in under .4 s).
 const cut=d=>{const s=fresh({distance:d});s.lane=1;let t=0;while(Math.abs(s.x-2.4)>.1&&t<60){tickRunner(s,1/60);t++;}return t;};
 const tUp=cut(up),tDown=cut(down);assert(tDown>=tUp&&tDown<24,`downhill cut ${tDown} vs uphill ${tUp} frames`);}

// 5. Inside line: hold the inside lane through a bend for a bonus that also feeds the power run.
{let start=0;for(let d=400;d<3000;d++)if(Math.abs(routeCurve(d))>ROUTE_BEND_MIN&&!Math.abs(routeCurve(d-1)>ROUTE_BEND_MIN)&&Math.abs(routeCurve(d-1))<=ROUTE_BEND_MIN){start=d;break;}
 const dir=runnerInsideLane(routeCurve(start+5));assert(dir!==0);
 const inside=fresh({distance:start-20,lane:dir,x:dir*2.4,prevLane:dir}),outside=fresh({distance:start-20,lane:-dir,x:-dir*2.4,prevLane:-dir});
 for(let i=0;i<60*8;i++){tickRunner(inside,1/60);tickRunner(outside,1/60);}
 assert(inside.bends>=1&&inside.insideCuts>=1,'inside line rewarded');assert.match(inside.message+inside.eventKind,/inside|CUT INSIDE/);assert(inside.energy>=1,'feeds the power run');
 assert.equal(outside.insideCuts,0,'the outside lane is the long way round');assert.equal(outside.bends,inside.bends);
 assert.equal(outside.score+30*inside.insideCuts<=inside.score,true);}

// 6. HUD: bend and slope tips (after football cues), and an after-run takeaway.
{let bendAt=0;for(let d=400;d<3000;d++)if(Math.abs(routeCurve(d+18))>ROUTE_BEND_MIN){bendAt=d;break;}
 const s=fresh({distance:bendAt});const tip=H.runnerHud(s).message;assert.match(tip,/BEND (LEFT|RIGHT)|INSIDE LINE/,tip);
 let climb=0,descent=0;for(let d=700;d<8000&&!(climb&&descent);d+=3){const m=H.runnerHud(fresh({distance:d})).message;if(!climb&&/CLIMB/.test(m))climb=d;if(!descent&&/DOWNHILL/.test(m))descent=d;}
 assert(climb&&descent,'climb and descent tips appear on straight hills');assert(routeGrade(climb+12)>ROUTE_STEEP&&routeGrade(descent+12)<-ROUTE_STEEP);
 const over=fresh({lives:0,bends:6,insideCuts:1});assert.match(H.runnerHud(over).detail,/1\/6.*inside/);assert.match(H.runnerRouteTakeaway(fresh({bends:4,insideCuts:3})),/Great racing line/);}

// 7. Missions: a seventh set for hills and bends.
{assert.deepEqual([...M.RUNNER_MISSION_SETS[6]],['inside3','downhill','stage6']);const s=fresh({insideCuts:3,downhillBeats:1,level:6});
 for(const id of['inside3','downhill','stage6'])assert(M.RUNNER_MISSIONS[id].value(s)>=M.RUNNER_MISSIONS[id].target);}

// 8. Renderer: every runner material gets the bend in its projection, shadow world position and normal.
{const T=await import('three');const {runnerBendShader,bendMaterial}=await import('../lib/arcade/runnerTrack.ts');
 for(const lib of['standard','lambert','basic','depth']){const sh={vertexShader:T.ShaderLib[lib].vertexShader,uniforms:{}};runnerBendShader(sh);
  assert(sh.vertexShader.includes('rbW.xyz=runnerBend(rbW.xyz)')&&!sh.vertexShader.includes('#include <project_vertex>'),`${lib}: projection bent`);
  assert(sh.uniforms.runnerBendData.value.length===160,'one 40×vec4 table');}
 const std={vertexShader:T.ShaderLib.standard.vertexShader,uniforms:{}};runnerBendShader(std);assert(std.vertexShader.includes('worldPosition.xyz=runnerBend')&&std.vertexShader.includes('runnerBendNormal('),'shadows and lighting read the terrain');
 const m=new T.MeshStandardMaterial(),key=m.customProgramCacheKey();bendMaterial(m);assert.notEqual(m.customProgramCacheKey(),key,'own program cache key');bendMaterial(m);assert.equal(m.customProgramCacheKey().split('runner-bend').length,2,'patched once');}
console.log('PASS runner route: smooth bends and hills, stage ramp, bend table, slope pace within the fairness ceiling, inside line, route tips, hills-and-bends missions, shader bend');
