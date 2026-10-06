// World Cup ball gallery (Oct 5 2026): every men's ball 1930 → 2026 and every Women's World Cup ball 1999 → 2023, in date
// order, each with its own procedural design, kids' facts and a source; the museum plinth opens it; the viewer sleeps.
// usage: node tests/wc-balls.cjs   (browser shader check: node scripts/check-wc-balls-browser.cjs, needs the dev server)
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const C=require('../lib/museum/wcBalls/catalog.ts'),D=require('../lib/museum/wcBalls/designs/index.ts'),L=require('../lib/museum/museumLayout.ts');
const all=set=>set.flatMap(b=>b.final?[b,b.final]:[b]);

// 1. The catalog: every World Cup from 1930, in order, no duplicates; the final balls hang off their tournament.
{const men=C.WC_BALLS,women=C.WWC_BALLS;
 const cups=[1930,1934,1938,1950,1954,1958,1962,1966,1970,1974,1978,1982,1986,1990,1994,1998,2002,2006,2010,2014,2018,2022,2026];
 assert.deepEqual(men.map(b=>b.year),cups,'one ball per men’s World Cup, 1930 → 2026 (none in 1942/1946)');
 assert.deepEqual(women.map(b=>b.year),[1999,2003,2007,2011,2015,2019,2023],'one ball per Women’s World Cup with its own ball');
 const ids=[...all(men),...all(women)].map(b=>b.id);assert.equal(new Set(ids).size,ids.length,'ids are unique');assert.equal(ids.length,40);
 for(const b of [...men,...women])if(b.final){assert.equal(b.final.year,b.year);assert.ok(b.finalLabel);}
 assert.equal(men[0].final.id,'1930-t-model','1930: Uruguay’s ball for the second half');
 assert.deepEqual(C.findBall('2010-jobulani'),{competition:'men',index:18,final:true});assert.deepEqual(C.findBall('wwc-2011-speedcell'),{competition:'women',index:3,final:false});
 console.log('PASS catalog: 23 men’s + 7 women’s tournaments, 40 balls with final balls, date order');}

// 2. Every ball has kids' facts and a source; facts stay short.
{for(const b of all([...C.WC_BALLS,...C.WWC_BALLS])){assert.ok(b.facts.length>=1,b.id+' has facts');for(const f of b.facts)assert.ok(f.length<=220,`${b.id}: fact is short`);
  assert.ok(b.sources.length>=1&&b.sources.every(s=>/^https:\/\//.test(s.url)),b.id+' cites a source');assert.ok(b.panels,b.id+' panel count');}
 assert.ok(C.WC_BALLS.filter(b=>b.facts.length>=2).length>=20,'men’s balls carry 2–3 facts');
 console.log('PASS facts: every ball has facts, a panel count and an https source');}

// 3. Designs: one GLSL file per ball, each defining design(), no logos/emblems by name, no stray outputs.
{for(const b of all([...C.WC_BALLS,...C.WWC_BALLS])){assert.ok(D.DESIGN_IDS.includes(b.id),b.id+' is registered');const g=D.ballDesign(b.id);
  assert.match(g,/Surf\s+design\s*\(\s*vec3\s+p\s*\)/,b.id+' defines Surf design(vec3 p)');assert.doesNotMatch(g,/gl_FragColor|uniform /,b.id+' only describes the surface');
  let depth=0;for(const ch of g){if(ch==='{')depth++;if(ch==='}')depth--;assert.ok(depth>=0);}assert.equal(depth,0,b.id+' braces balance');}
 assert.equal(D.DESIGN_IDS.length,40);
 console.log('PASS designs: 40 procedural designs, one design() each');}

// 4. Wiring: the plinth in Balls and Kits opens the gallery; ?balls deep-links; the viewer sleeps and caps phone resolution.
{const poi=L.museumPois().find(p=>p.id==='wc-balls');assert.ok(poi&&poi.kind==='gallery');
 const obstacles=L.museumObstacles(),mid={x:(poi.a.x+poi.b.x)/2,z:(poi.a.z+poi.b.z)/2};assert.ok(!L.museumBlocked(mid.x,mid.z,obstacles),'standing spot is free');
 assert.ok(L.museumBlocked(L.BALL_PLINTH.x,L.BALL_PLINTH.z,obstacles),'the plinth blocks walking');
 const room=read('components/MuseumRoom.tsx');assert.match(room,/id==='wc-balls'\)\{setBalls\(''\)/);assert.match(room,/q\.has\('balls'\)/);
 const v=read('lib/museum/wcBalls/ballViewer.ts');assert.match(v,/IDLE_MS=10000/,'idle turn winds down');assert.match(v,/opts\.coarse\?1\.5:2/,'phones ≤ 1.5×');
 assert.match(v,/visibilitychange/,'hidden tab sleeps');assert.match(v,/dispose\(\)\{disposed=true/);
 const ui=read('components/WorldCupBalls.tsx');for(const k of ['ArrowRight','Escape','wheel','role="slider"','data-wc-final','data-wc-comp'])assert.ok(ui.includes(k),'gallery has '+k);
 console.log('PASS wiring: plinth POI + collision, ?balls deep link, sleeping viewer, keyboard/wheel/slider/final/competition controls');}
