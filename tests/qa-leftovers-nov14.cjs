// Leftovers QA round (Nov 14 2026): source contracts for the small fixes that have no engine to unit-test.
const fs=require('fs'),assert=require('assert'),read=p=>fs.readFileSync(p,'utf8');
let n=0;const ok=(name,fn)=>{fn();n++;};
ok('arcade room: a pin over the player shows while a cabinet hides them',()=>{const s=read('lib/arcade/arcadeRoomScene.ts');
 assert.match(s,/new T\.MeshBasicMaterial\(\{color:'#81fbed',depthTest:false/);assert.match(s,/playerPin\.renderOrder=999/);
 assert.match(s,/const hiddenBehindCabinet=\(px:number,pz:number\)=>/);assert.match(s,/crowd\.update\(dt,time,x,z\);updatePlayerPin\(time\);/);});
ok('Kit Rush: the NEW BEST burst sits below the Best chip',()=>{assert.match(read('components/games/KitRushGame.module.css'),/\.stamp\{position:absolute;right:-16px;top:18px\}/);});
ok('binder: the full-back side tab fits ("Backs")',()=>{assert.match(read('components/CardCollection.tsx'),/fullback:'Backs'/);});
console.log(`qa-leftovers-nov14: ${n} groups passed`);
