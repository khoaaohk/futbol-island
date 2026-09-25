const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id));return m.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts'),{sevenBuildOutY,sevenBuildOutLocalZ,behindBuildOut,SEVEN_PENALTY_DEPTH}=load('lib/town/buildOut.ts'),{venueById,fieldPoint}=load('lib/town/venues.ts');
const v=venueById('7v7');for(const team of ['gold','blue']){
 const side=team==='gold'?1:-1,line=sevenBuildOutY(team);assert(Math.abs((fieldPoint(v,{x:135,y:line}).z-v.z)-sevenBuildOutLocalZ(side))<1e-10);assert.equal(Math.abs(sevenBuildOutLocalZ(side)),(v.length/2-SEVEN_PENALTY_DEPTH)/2);
 for(const restart of [false,true]){
  const m=new MatchSim(3,'7v7'),gk=m.ids.find(id=>m.players[id].team===team&&m.players[id].isGK),p=m.players[gk];m.possession=team;m.ball.owner=restart?null:gk;m.ball.x=p.x;m.ball.y=p.y;m.passCd=-1;m.hold=2;
  for(const id of m.foes(team))m.players[id].y=line+side*18;
  if(restart)m.restart={kind:'goalkick',t:-20,x:p.x,y:p.y,taker:gk};
  if(restart)m.restartLogic(.03);else m.ballLogic(.03);
  assert.equal(m.ball.owner,restart?null:gk,'keeper waits until opponents have retreated');
  m.computeTargets(.03);for(const id of m.foes(team))assert(behindBuildOut(m.targets[id].y,team,3.9),'every opponent receives a legal retreat destination');
  // Observe actual walking retreat and release, with no positional teleport.
  let released=false,wasOwner=!restart,maxStep=0;
  for(let i=0;i<600;i++){
   const before=m.ids.map(id=>({x:m.players[id].x,y:m.players[id].y}));m.step(1/30);
   m.ids.forEach((id,j)=>{maxStep=Math.max(maxStep,Math.hypot(m.players[id].x-before[j].x,m.players[id].y-before[j].y));});
   if(m.ball.owner===gk)wasOwner=true;
   if(wasOwner&&m.ball.owner===null&&m.stats.passes>0){released=true;assert.equal(m.buildOutTeam,null,'opponents may cross immediately on release');break;}
  }
  assert(released,'retreat resolves to a real buildup pass');assert(maxStep<4,'retreat is movement, not a teleport');
 }
}
for(const format of ['futsal','9v9','11v11']){const m=new MatchSim(4,format);m.ball.owner=m.goldIds[0];assert.equal(m.buildOutTeam,null,'other formats unchanged');}
const kickoff=new MatchSim(1,'7v7');kickoff.stageKickoff('gold');assert.equal(kickoff.buildOutTeam,null,'centre kickoff is separate from goal-area buildup');
console.log('PASS mirrored 7v7 line geometry, keeper possession and overdue goal-kick retreat, moving buildup release, format isolation and kickoff distinction');
