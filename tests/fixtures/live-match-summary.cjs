// Seeded summaries of the island's four live-match formats (tests/beach-match.cjs). The snapshot next to this file,
// live-match-summary.json, was generated from the sim BEFORE the beach format was added (Sep 29 2026), so the test
// proves futsal / 7v7 / 9v9 / 11v11 play the exact same matches afterwards. Regenerate only for a deliberate change:
//   node -e "require('./tests/fixtures/live-match-summary.cjs').print(require(<loaded MatchSim>))"
const FORMATS=['futsal','7v7','9v9','11v11'],SEEDS=[11,28,45,62],SECONDS=90,DT=1/30;
/** FNV-1a over the rounded positions of every player and the ball, sampled once a sim second. */
function summary(MatchSim,format,seed){
 const sim=new MatchSim(seed,format);let h=2166136261>>>0;
 const mix=v=>{const s=String(Math.round(v*1e4));for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;};
 const steps=Math.round(SECONDS/DT);
 for(let t=1;t<=steps;t++){sim.step(DT);if(t%30===0){for(const id of sim.ids){const p=sim.players[id];mix(p.x);mix(p.y);}mix(sim.ball.x);mix(sim.ball.y);mix(sim.ball.height);}}
 const s=sim.stats;
 return {format,seed,score:`${sim.score.gold}-${sim.score.blue}`,possession:sim.possession,passes:s.passes,shots:s.shots,turnovers:s.turnovers,interceptions:s.interceptions,kicks:sim.kicks,touches:sim.touchSerial,hash:h.toString(16)};
}
const all=MatchSim=>FORMATS.flatMap(f=>SEEDS.map(seed=>summary(MatchSim,f,seed)));
module.exports={FORMATS,SEEDS,SECONDS,summary,all,print:MatchSim=>console.log(JSON.stringify(all(MatchSim),null,1))};
