// Player bios: lib/town/playerBios.json fills the player-card blurb + strengths for every one of the original 196 roster
// players (first 196 names in cardRoster.json) that has no entry in lib/town/playerProfiles.json.
// usage: node tests/player-bios.cjs
const assert=require('node:assert/strict');
const path=require('node:path');
const town=f=>require(path.join(__dirname,'../lib/town',f));
const roster=town('cardRoster.json').players.slice(0,196);
const profiles=town('playerProfiles.json');
const bios=town('playerBios.json');

assert.equal(roster.length,196,'roster has at least 196 players');
const missing=roster.filter(n=>!profiles[n]&&!bios[n]);
assert.deepEqual(missing,[],'every original player without a profile has a bio');

const uncertain=bios._uncertain;
assert.ok(Array.isArray(uncertain),'_uncertain is an array');
for(const n of uncertain) assert.ok(bios[n],`_uncertain name "${n}" has a bio`);

const rosterSet=new Set(roster);
let count=0;
for(const [name,bio] of Object.entries(bios)){
  if(name==='_uncertain') continue;
  count++;
  assert.ok(rosterSet.has(name),`"${name}" is one of the first 196 roster names`);
  assert.deepEqual(Object.keys(bio).sort(),['blurb','strengths'],`"${name}" has only blurb + strengths`);
  assert.equal(typeof bio.blurb,'string');
  const len=bio.blurb.length;
  assert.ok(len>=60&&len<=200,`"${name}" blurb is 60–200 chars (got ${len})`);
  assert.ok(Array.isArray(bio.strengths)&&bio.strengths.length===3,`"${name}" has exactly 3 strengths`);
  for(const s of bio.strengths){
    assert.equal(typeof s,'string');
    const words=s.trim().split(/\s+/).length;
    assert.ok(words>=2&&words<=5,`"${name}" strength "${s}" is 2–5 words`);
  }
}
console.log(`Player bios: ${count} bios cover every original player without a profile (${uncertain.length} flagged uncertain).`);
