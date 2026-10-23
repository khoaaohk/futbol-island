// Island walk connectivity (Oct 22 2026 path audit, scripts/audit-island-connectivity.cjs): builds the real island in Node and
// floods the walkable ground from the spawn with the game's own collision. Fails when a landmark (door, job, NPC, field, shop,
// vending machine, ball-hunt / bug-squad spot, pier, ferry, Cay, Summit) can no longer be walked to, when a new cut-off ground
// pocket appears, when a prop pinches a path shut, when an authored NPC lane runs through solid geometry, or the road graph splits.
const assert=require('assert/strict');
const {runChecks}=require('../scripts/island-connectivity-checks.cjs');
const {summarise,classify}=require('../scripts/audit-island-connectivity.cjs');
const t0=Date.now();
runChecks().then(r=>{const s=summarise(r);
 assert.ok(r.a.reach[r.a.spawnCell],'the spawn stands on walkable ground');
 assert.ok(s.reachM2>225000,`most of the islands are walkable from the spawn (${s.reachM2.toFixed(0)} m²)`);
 assert.ok(s.landmarks>500,'the landmark list loaded ('+s.landmarks+')');
 assert.deepEqual(s.problems.map(l=>`${l.group} ${l.name} (${l.x.toFixed(1)}, ${l.z.toFixed(1)}): ${l.why}`),[],'every landmark is reachable on foot (or listed as reached another way)');
 assert.ok(s.expected.length<=12,'no new landmark only reached by jump / swim / boat ('+s.expected.map(l=>l.name).join('; ')+')');
 for(const group of ['destination','door','field','job','bug-squad','npc','vending','pier','cay','summit','fishing'])assert.ok(r.landmarks.some(l=>l.group===group),'checks the '+group+' landmarks');
 // Oct 23 2026: the sand strip seaward of the South Pier boardwalk fence (x 44-232, z 215-223) is reached on foot through the 3 m
 // beach gate in the ferry dock's south rail (world.ts DOCK_BEACH_GATE): no pocket there, and its west, middle and east ends are reached.
 assert.ok(s.reachM2>234000,`the South Pier sand strip counts as walkable (${s.reachM2.toFixed(0)} m²)`);
 const strip=s.groundComps.filter(c=>c.maxx>=40&&c.minx<=242&&c.maxz>=205&&c.minz<=226);
 assert.deepEqual(strip.map(c=>`${c.area.toFixed(1)} m² around (${c.cx.toFixed(1)}, ${c.cz.toFixed(1)})`),[],'the South Pier sand strip is not cut off');
 const cellAt=(x,z)=>Math.round((z-r.a.minZ)/r.a.cell)*r.a.W+Math.round((x-r.a.minX)/r.a.cell);
 for(const [x,z] of [[52,217],[147,218.7],[224,216],[224,214]])assert.ok(r.a.reach[cellAt(x,z)],`(${x}, ${z}) on the strip / at the gate is reached on foot`);
 // Known, accepted pockets: two Summit hollows under 5 m².
 const fresh=s.groundComps.filter(c=>c.area>=25);
 assert.deepEqual(fresh.map(c=>`${c.area.toFixed(1)} m² around (${c.cx.toFixed(1)}, ${c.cz.toFixed(1)})`),[],'no new cut-off ground pocket of 25 m² or more');
 assert.deepEqual(s.deadEnds.map(d=>`path(${d.path.x}, ${d.path.z}) end (${d.end.x}, ${d.end.z}): ${d.end.cause}`),[],'no path runs into water or a prop');
 assert.deepEqual(s.pinches.map(p=>`path(${p.x}, ${p.z}) at (${p.pinch.x}, ${p.pinch.z}): ${p.pinch.cause}`),[],'no prop pinches a path to 1 m or less');
 assert.deepEqual(s.routes,[],'authored NPC lanes stay clear of colliders and roof props');
 assert.ok(s.traps.area<5,'no one-way pocket (reached on foot with no walk back)');
 assert.equal(s.roads.components,1,'the road graph is one network');assert.deepEqual(s.roads.offLand,[],'no road link crosses the sea');
 assert.equal(s.roads.causeway&&s.roads.causeway.offLand,0,'the causeway centre line stays on land');
 console.log(`PASS island connectivity: ${s.reachM2.toFixed(0)} m² walkable from the spawn, ${s.landmarks} landmarks reached (${s.expected.length} by jump / swim / boat), no dead-end or pinched paths, NPC lanes clear, ${s.roads.nodes}-node road network (${((Date.now()-t0)/1000).toFixed(1)} s)`);
 process.exit(0);
}).catch(e=>{console.error(e);process.exit(1);});
