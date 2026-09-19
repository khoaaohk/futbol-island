const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/shoreline.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math});const {onIsland}=mod.exports;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Users/khoado/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.waitForFunction(()=>window.__fi2?.world);
  const d=await page.evaluate(()=>{const d=window.__fi2;return {buildings:d.world.buildings,roads:d.world.roads,roadJunctions:d.world.roadJunctions||[],assets:d.world.assets||[],surfaceAreas:d.world.surfaceAreas||[],obstacles:d.world.obstacles,destinations:d.world.destinations||[],venues:d.games.entries.map(e=>e.venue),bounds:d.bounds,drawCalls:d.renderer.info.render.calls};});
  const issues=[];const overlap=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2-.05&&Math.abs(a.z-b.z)<(a.d+b.d)/2-.05;
  const corners=r=>[-1,1].flatMap(x=>[-1,1].map(z=>({x:r.x+x*r.w/2,z:r.z+z*r.d/2})));
  for(const [i,a] of d.buildings.entries()){
   for(const b of d.buildings.slice(i+1))if(overlap(a,b))issues.push(`Buildings overlap: ${a.name} / ${b.name}`);
   if(corners(a).some(p=>!onIsland(p.x,p.z)))issues.push(`Building meets water: ${a.name}`);
  }

  const same=(a,b)=>Math.abs(a.x-b.x)<.001&&Math.abs(a.z-b.z)<.001&&Math.abs(a.w-b.w)<.001&&Math.abs(a.d-b.d)<.001;
  const sidewalks=[...d.roads,...d.roadJunctions];
  for(const b of d.buildings){
   for(const road of sidewalks)if(overlap(b,road))issues.push(`Sidewalk overlaps ${b.name} at ${road.x},${road.z}`);
   for(const o of d.obstacles)if(!same(b,o)&&overlap(b,o))issues.push(`Asset intersects ${b.name}: ${o.x},${o.z} (${o.w}x${o.d})`);
   for(const a of d.assets){const visible={...a,w:a.visualW||a.w,d:a.visualD||a.d};if(overlap(b,visible))issues.push(`${a.kind} visual intersects ${b.name} at ${a.x},${a.z}`);}
   for(const a of d.surfaceAreas)if(overlap(b,a))issues.push(`${a.kind} area intersects ${b.name} at ${a.x},${a.z}`);
  }
  for(const a of d.assets){
   for(const road of sidewalks)if(overlap(a,road))issues.push(`${a.kind} blocks sidewalk at ${a.x},${a.z}`);
   for(const o of d.obstacles)if(!same(a,o)&&overlap(a,o))issues.push(`${a.kind} intersects obstacle at ${a.x},${a.z} / ${o.x},${o.z}`);
  }
  if(new Set(d.roads.map(r=>r.carriageway)).size>1)issues.push('Road carriageway widths are inconsistent');
  const lanes=d.roads.map(r=>({...r,w:r.vertical?r.carriageway:r.w,d:r.vertical?r.d:r.carriageway}));
  for(const [i,lane] of lanes.entries()){
   for(const b of d.buildings)if(overlap(lane,b))issues.push(`Road ${i} obstructed by ${b.name}`);
   for(let t=-.5;t<=.501;t+=.1)for(const edge of [-.5,.5]){const x=lane.x+(lane.vertical?edge:t)*lane.w,z=lane.z+(lane.vertical?t:edge)*lane.d;if(!onIsland(x,z))issues.push(`Road ${i} meets water`);}
  }
  // Connectivity alone misses staggered streets and short/overshooting junctions.
  for(let i=0;i<lanes.length;i++)for(let j=i+1;j<lanes.length;j++){
   const a=lanes[i],b=lanes[j];if(a.vertical!==b.vertical)continue;
   const lateral=Math.abs(a.vertical?a.x-b.x:a.z-b.z);
   const alongOverlap=Math.min(a.vertical?a.z+a.d/2:a.x+a.w/2,b.vertical?b.z+b.d/2:b.x+b.w/2)-Math.max(a.vertical?a.z-a.d/2:a.x-a.w/2,b.vertical?b.z-b.d/2:b.x-b.w/2);
   if(lateral>.05&&lateral<Math.max(a.carriageway,b.carriageway)+.05&&alongOverlap>-.05)issues.push(`Staggered parallel roads ${i}/${j}: offset ${lateral.toFixed(2)}m`);
  }
  for(const [i,a] of lanes.entries())for(const side of [-1,1]){
   const endpoint=a.vertical?a.z+side*a.d/2:a.x+side*a.w/2;
   for(const [j,b] of lanes.entries())if(a.vertical!==b.vertical){
    const across=a.vertical?a.x:a.z,center=a.vertical?b.z:b.x,bStart=a.vertical?b.x-b.w/2:b.z-b.d/2,bEnd=a.vertical?b.x+b.w/2:b.z+b.d/2;
    const offset=Math.abs(endpoint-center);
    if(across>=bStart-.01&&across<=bEnd+.01&&offset>.05&&offset<b.carriageway/2-.05)issues.push(`Road ${i} endpoint misses road ${j} centerline by ${offset.toFixed(2)}m`);
   }
  }
  const reached=new Set([0]),roads=[0];for(let i=0;i<roads.length;i++)lanes.forEach((r,j)=>{const a=lanes[roads[i]];if(!reached.has(j)&&Math.abs(a.x-r.x)<=(a.w+r.w)/2+.05&&Math.abs(a.z-r.z)<=(a.d+r.d)/2+.05){reached.add(j);roads.push(j);}});
  lanes.forEach((r,i)=>{if(!reached.has(i))issues.push(`Disconnected road ${i}: ${r.x},${r.z}`);});
  for(const v of d.venues){const runoff={x:v.x,z:v.z,w:v.width+6,d:v.length+6};for(const o of d.obstacles)if(overlap(runoff,o))issues.push(`Blocked ${v.id} runoff at ${o.x},${o.z}`);}
  // Sample walkable land at one-metre intervals; use actual rounded shoreline.
  const {minX,maxX,minZ,maxZ}=d.bounds,w=maxX-minX+1,h=maxZ-minZ+1,cells=new Uint8Array(w*h),queue=new Int32Array(w*h);
  for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){const i=(z-minZ)*w+x-minX;if(!onIsland(x,z)||d.obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.4&&Math.abs(z-o.z)<o.d/2+.4))cells[i]=1;}
  const start=(-48-minZ)*w+103-minX;let head=0,tail=0;if(!cells[start]){cells[start]=2;queue[tail++]=start;}
  while(head<tail){const i=queue[head++],x=i%w;for(const n of [x>0?i-1:-1,x<w-1?i+1:-1,i-w,i+w])if(n>=0&&n<cells.length&&cells[n]===0){cells[n]=2;queue[tail++]=n;}}
  const targets=[...d.venues.map(v=>({name:v.id,x:v.x,z:v.z+v.length/2+6})),{name:'South pier',x:135,z:211},...d.destinations];
  for(const t of targets){const x=Math.round(t.x),z=Math.round(t.z);if(cells[(z-minZ)*w+x-minX]!==2)issues.push(`Unreachable: ${t.name} (${x},${z})`);}
  console.log(JSON.stringify({buildings:d.buildings.length,roads:d.roads.length,connectedRoads:reached.size,reachableCells:tail,destinations:targets.length,drawCalls:d.drawCalls,issues:[...new Set(issues)]},null,2));
  const roadSvg=lanes.map((r,i)=>`<g><rect x="${r.x-r.w/2}" y="${r.z-r.d/2}" width="${r.w}" height="${r.d}" fill="#737c75"/><line x1="${r.vertical?r.x:r.x-r.w/2}" y1="${r.vertical?r.z-r.d/2:r.z}" x2="${r.vertical?r.x:r.x+r.w/2}" y2="${r.vertical?r.z+r.d/2:r.z}" stroke="#fff0b7" stroke-width=".4" stroke-dasharray="2 2"/><text x="${r.x}" y="${r.z}" font-size="4" fill="#b21c29">${i}</text></g>`).join('');
  fs.writeFileSync('/tmp/fi2-road-centerlines.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX-5} ${minZ-5} ${w+10} ${h+10}" width="900" height="1100"><rect x="${minX-5}" y="${minZ-5}" width="${w+10}" height="${h+10}" fill="#e1d3ae"/>${d.buildings.map(r=>`<rect x="${r.x-r.w/2}" y="${r.z-r.d/2}" width="${r.w}" height="${r.d}" fill="#be8d65"/>`).join('')}${roadSvg}</svg>`);
  assert.deepEqual(errors,[],'Browser errors');assert.deepEqual([...new Set(issues)],[],'Island layout audit');
  for(const t of d.destinations){await page.evaluate(t=>{const d=window.__fi2;d.location.x=t.x;d.location.z=t.z;d.velocity.x=d.velocity.z=0;},t);await page.waitForTimeout(900);await page.screenshot({path:'/tmp/fi2-infill-'+t.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.png'});}
  console.log('ISLAND_LAYOUT_AUDIT_PASS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
