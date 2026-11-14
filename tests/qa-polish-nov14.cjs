// Polish round (Nov 14 2026): source contracts for the last overnight-QA leftovers.
const fs=require('fs'),assert=require('assert'),read=p=>fs.readFileSync(p,'utf8');
let n=0;const ok=(name,fn)=>{fn();n++;};
ok('map: the name layer is drawn after "You", so the You dot never covers a place name',()=>{const m=read('components/IslandOverview.tsx');
 assert.match(m,/const labelsTop=useMemo\(\(\)=> <>/);
 assert.match(m,/\{you\}\{labelsTop\}<\/svg>;/,'labels come after the You marker in the full map');
 const terrainEnd=m.indexOf('],[roads,buildings,onSelect,localMap]);'.slice(1)),top=m.indexOf('className="map-labels-top"');assert.ok(top>terrainEnd,'the layer is out of the terrain memo');});
ok('keyboard: Tab goes top row (Paths, friends, Settings, pocket) before the bottom controls, by DOM order',()=>{const t=read('components/Town.tsx');
 const scene=t.indexOf('<div className="town-scene" ref={host}/>'),settings=t.indexOf('<IslandSettings '),jobs=t.indexOf('<IslandJobs '),mini=t.indexOf('<aside className={\'town-minimap\''),travel=t.indexOf('<div className="travel-actions"');
 assert.ok(scene>0&&scene<settings,'the canvas comes before the HUD (a click on the island starts Tab at the top)');
 assert.ok(settings<jobs&&jobs<mini&&mini<travel,'top row, then the map, then the travel controls');
 assert.doesNotMatch(t,/tabIndex=\{[1-9]/,'no positive tabindex');
 const s=read('components/IslandSettings.tsx'),nav=s.slice(s.indexOf('data-hud-triggers'),s.indexOf('</nav>'));
 assert.ok(nav.indexOf('aria-label={`Paths')<nav.indexOf('aria-label="Settings"'),'Paths (left) before Settings (right) in the DOM');
 const css=read('components/IslandSettings.module.css');assert.doesNotMatch(css,/\.triggers button:first-child\{order/);assert.match(css,/\.triggers button:last-child\{margin-left:auto;\}/);});
console.log(`qa-polish-nov14: ${n} groups passed`);
