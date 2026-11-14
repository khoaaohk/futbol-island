// QA round 2 (areas), Nov 14 2026: island areas the first night did not cover deeply.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const load=f=>{const m={exports:{}};new Function('exports','module','require',ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,()=>({}));return m.exports;};

// 1. The Arcade's Enter is measured to its door, and Haruto no longer stands in the doorway. Before: the entry distance went to the
//    building's middle (103,-53), 5 m inside the door, and Haruto stood at (104,-48), so "Talk to Haruto" always beat Enter and a
//    phone player at the door could not get into the Arcade.
{
 const town=read('components/Town.tsx');
 assert.match(town,/const doorZ=kind==='arcade'\?ARCADE_DOOR\.z:kind==='coaches'\?COACHES_DOOR\.z:z;/,'entry distance uses the door for the Arcade and Coaches Centre');
 assert.match(town,/\(location\.x-x\)\*\*2\+\(location\.z-doorZ\)\*\*2/,'distance measured to doorZ');
 const venues=read('lib/town/venues.ts'),door=JSON.parse(venues.match(/export const ARCADE_DOOR=(\{x:[-\d.]+,z:[-\d.]+\})/)[1].replace(/(\w+):/g,'"$1":'));
 const m=read('lib/town/townsfolkCast.ts').match(/folk\('square','haruto','Haruto','[^']*','[^']*',([-\d.]+),([-\d.]+),/);
 const d=Math.hypot(+m[1]-door.x,+m[2]-door.z);
 // A child 2 m out from the door is nearer the door than Haruto by more than the arbiter's 1.5 m margin.
 const kid={x:door.x,z:door.z+2},toDoor=Math.hypot(kid.x-door.x,kid.z-door.z),toHaruto=Math.hypot(kid.x-+m[1],kid.z-+m[2]);
 assert(d>=3,`Haruto stands ${d.toFixed(2)} m from the Arcade door (>= 3)`);
 assert(toHaruto-toDoor>=1.5,`at the door Enter wins (door ${toDoor.toFixed(2)} m, Haruto ${toHaruto.toFixed(2)} m)`);
}

// 2. The phone's Back closes the seated activities instead of leaving the island (lib/town/backCloses.ts registerBackCloser):
//    the easel saves and stands up like Done, the Ball Cannon gets you out, the Summit Kick stops / closes its card.
{
 const easel=read('components/PaintEaselStudio.tsx');
 assert.match(easel,/import \{registerBackCloser\} from '@\/lib\/town\/backCloses';/);
 assert.match(easel,/useEffect\(\(\)=>registerBackCloser\(\(\)=>doneRef\.current\(\)\),\[\]\);/,'easel: Back = Done (saves)');
 const cannon=read('components/BallCannonHud.tsx');
 assert.match(cannon,/v\.seated\?registerBackCloser\(\(\)=>cannonActions\.leave\(\)\):undefined/,'cannon: Back leaves the seat');
 const kick=read('components/SummitKickHud.tsx');
 assert.match(kick,/open\?registerBackCloser\(\(\)=>summitActions\.exitKick\(\)\):undefined/,'Summit Kick: Back exits');
 const {registerBackCloser,backCloserCount}=load('lib/town/backCloses.ts');
 const n=backCloserCount();let closed=0;const off=registerBackCloser(()=>closed++);assert.equal(backCloserCount(),n+1);off();assert.equal(backCloserCount(),n);
}
console.log('PASS qa-areas-nov14: Arcade Enter beats Haruto at the door; Back closes the easel, Ball Cannon and Summit Kick');
