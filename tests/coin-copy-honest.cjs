// Stale copy (audit Nov 10 2026): saves sync with a save code (lib/saves/snapshot.ts carries the quest, quiz and explore keys),
// and the arcade COSTS coins to play, so no line may send a child there to earn them.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const quests=read('components/IslandQuests.tsx');
assert.doesNotMatch(quests,/saves in this browser/,'the explore checklist is not browser-only');
assert.match(quests,/Saved with your island and save code\./,'it says how it is saved');
assert.match(read('lib/saves/snapshot.ts'),/'futbol-island-quests-v1'/,'quest progress is part of the save-code snapshot');
const jobs=read('components/IslandJobs.tsx');
assert.doesNotMatch(jobs,/Spend them in the arcade/);assert.match(jobs,/Earn more with lessons, the ball hunt and island jobs\./,'starter toast');
const ledger=read('lib/town/vendingLedger.ts');
assert.doesNotMatch(ledger,/arcade to earn/);assert.equal((ledger.match(/Not enough coins yet\. Earn more with lessons and jobs\./g)||[]).length,2,'both vending refusals');
console.log('PASS coin copy: no line says the arcade earns coins; the checklist save line matches save codes');
