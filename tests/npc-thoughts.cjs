// NPC thoughts and banter content (Nov 1 2026, lib/town/npcThoughts.ts, types in lib/town/npcChatterTypes.ts).
// Every real NPC id has a personal pool, every area has a fallback pool, every line is short, unique and kid-safe,
// and banter pairs are real NPCs from the same area. Pure data checks (no browser).
const assert=require('node:assert/strict');
require('../scripts/economy-sim.cjs');// registers the .ts / '@/' require hooks
let checks=0;const fails=[];const ok=(c,m)=>{checks++;if(!c)fails.push(m);};// collect, then fail once with the full list
const {NPC_DIALOGUES}=require('../lib/town/npcDialogues.ts');
const {PRACTICE_NPCS}=require('../lib/town/practiceNpcs.ts');
const {VOLLEYBALL_NPCS}=require('../lib/town/volleyballNpcs.ts');
const {shopNpcDefs}=require('../lib/shop/shopCast.ts');
const {CASHIERS}=require('../lib/konbini/konbiniContent.ts');
const {THOUGHTS,NPC_THOUGHT_AREA}=require('../lib/town/npcThoughts.ts');

// The real cast, from code: island NPCs (townsfolk included), the wall-drill pair, the volleyball four (ids as
// lib/graphics/volleyballGame.ts builds them), the Kit Shop clerk and shoppers, and both Konbini cashiers.
const ids=new Set([...NPC_DIALOGUES.map(n=>n.id),...PRACTICE_NPCS.map(n=>n.id),...VOLLEYBALL_NPCS.map((_,i)=>'volleyball-'+i),
 ...shopNpcDefs().map(n=>n.id),...Object.values(CASHIERS).map(c=>c.id)]);
ok(ids.size>=170,`the real cast is loaded (${ids.size} ids)`);

const BANNED=['damn','hell','stupid','dumb','hate','kill','die','ugly','fat'];
const EMOJI=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/u;
const seen=new Map();
const line=(s,where)=>{
 ok(typeof s==='string'&&s.trim()===s&&s.length>0,`${where}: non-empty trimmed line`);
 ok(s.length<=48,`${where}: max 48 characters (${s.length}): ${s}`);
 ok(!EMOJI.test(s),`${where}: no emoji: ${s}`);
 ok(!s.includes('#'),`${where}: no hashtags: ${s}`);
 // 'press' alone is football pressing; a control hint names a key, a button or the screen.
 ok(!/\b([Pp]ress|[Tt]ap|[Cc]lick|[Ss]wipe|[Hh]old) (the )?[A-Z]\b/.test(s)&&!/\b(button|key|keyboard|joystick|screen|click)s?\b/i.test(s),`${where}: no control hints: ${s}`);
 for(const w of BANNED)ok(!new RegExp(`\\b${w}\\b`,'i').test(s),`${where}: banned word "${w}": ${s}`);
 const key=s.toLowerCase();ok(!seen.has(key),`${where}: line repeats ${seen.get(key)}: ${s}`);seen.set(key,where);
};

// Per-NPC pools: every real id, nothing invented.
for(const id of ids){
 const p=THOUGHTS.byNpc[id];ok(!!p,`${id}: has a byNpc pool`);
 ok(p.near.length>=6&&p.near.length<=8,`${id}: 6-8 near lines (${p.near.length})`);
 ok(p.idle.length>=4&&p.idle.length<=6,`${id}: 4-6 idle lines (${p.idle.length})`);
 ok(!!NPC_THOUGHT_AREA[id],`${id}: has an area`);
}
for(const id of Object.keys(THOUGHTS.byNpc))ok(ids.has(id),`byNpc key ${id} is a real NPC id`);
for(const [id,p] of Object.entries(THOUGHTS.byNpc)){p.near.forEach((s,i)=>line(s,`${id}.near[${i}]`));p.idle.forEach((s,i)=>line(s,`${id}.idle[${i}]`));}

// Area pools: every area an NPC stands in, plus every TownArea the cast uses.
const areas=new Set([...Object.values(NPC_THOUGHT_AREA),...NPC_DIALOGUES.map(n=>n.area).filter(Boolean)]);
for(const a of areas){const p=THOUGHTS.byArea[a];ok(!!p,`area ${a}: has a byArea pool`);
 ok(p.near.length>=4&&p.near.length<=6,`area ${a}: 4-6 near lines`);ok(p.idle.length>=3&&p.idle.length<=4,`area ${a}: 3-4 idle lines`);}
for(const [a,p] of Object.entries(THOUGHTS.byArea)){p.near.forEach((s,i)=>line(s,`area ${a}.near[${i}]`));p.idle.forEach((s,i)=>line(s,`area ${a}.idle[${i}]`));}

// Banter: unique ids, real neighbours from the same area, 2-4 alternating lines.
const banterIds=new Set(),inBanter=new Set();
for(const bt of THOUGHTS.banter){
 ok(!banterIds.has(bt.id),`banter id ${bt.id} is unique`);banterIds.add(bt.id);
 ok(ids.has(bt.a)&&ids.has(bt.b)&&bt.a!==bt.b,`banter ${bt.id}: a and b are two real NPC ids`);
 ok(NPC_THOUGHT_AREA[bt.a]===NPC_THOUGHT_AREA[bt.b],`banter ${bt.id}: both speakers share an area`);
 ok(bt.lines.length>=2&&bt.lines.length<=4,`banter ${bt.id}: 2-4 lines`);
 bt.lines.forEach((s,i)=>line(s,`banter ${bt.id}[${i}]`));
 inBanter.add(bt.a);inBanter.add(bt.b);
}
ok(THOUGHTS.banter.length>=30,'at least 30 banter exchanges');
const areaSize={};for(const a of Object.values(NPC_THOUGHT_AREA))areaSize[a]=(areaSize[a]||0)+1;
for(const id of ids)if(areaSize[NPC_THOUGHT_AREA[id]]>1)ok(inBanter.has(id),`${id}: appears in at least one banter (shares an area)`);

assert.equal(fails.length,0,`npc-thoughts failures:\n${fails.join('\n')}`);
console.log(`npc-thoughts: ${checks} checks passed (${ids.size} NPCs, ${Object.keys(THOUGHTS.byArea).length} areas, ${seen.size} lines, ${THOUGHTS.banter.length} banters)`);
