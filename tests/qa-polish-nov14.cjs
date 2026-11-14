// Polish round (Nov 14 2026): source contracts for the last overnight-QA leftovers.
const fs=require('fs'),assert=require('assert'),read=p=>fs.readFileSync(p,'utf8');
let n=0;const ok=(name,fn)=>{fn();n++;};
ok('map: the name layer is drawn after "You", so the You dot never covers a place name',()=>{const m=read('components/IslandOverview.tsx');
 assert.match(m,/const labelsTop=useMemo\(\(\)=> <>/);
 assert.match(m,/\{you\}\{labelsTop\}<\/svg>;/,'labels come after the You marker in the full map');
 const terrainEnd=m.indexOf('],[roads,buildings,onSelect,localMap]);'.slice(1)),top=m.indexOf('className="map-labels-top"');assert.ok(top>terrainEnd,'the layer is out of the terrain memo');});
console.log(`qa-polish-nov14: ${n} groups passed`);
