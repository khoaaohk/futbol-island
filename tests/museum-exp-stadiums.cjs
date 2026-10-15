// stadiums · "Stadiums of the World" in the anatomy Paper style (Oct 12 2026; replaced cards-1970. User: "replace the yellow and
// red cards with stadiums of the world", "show a bunch of stadiums and breakdown how they are built"). Checks: the case's facts and
// sources, seven stadiums with sourced numbers, the host contract, the Paper look on the shared anatomy kit, a play area that
// fills the screen at 1440 × 900, 1845 × 1110 and 390 × 844, heat (the one shared loop, 0 frames at rest), the explode (five
// layers, the pitch sample, labels), build mode, the "Which stadium?" rounds, reduced motion, every model rendered in Node at
// several turns, the registry wiring and the retired id.
// usage: node tests/museum-exp-stadiums.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const Mod=require('module'),orig=Mod._resolveFilename;Mod._resolveFilename=function(r,...a){if(r.startsWith('@/'))r=path.join(__dirname,'..',r.slice(2));return orig.call(this,r,...a);};
const root=path.join(__dirname,'..'),dir='components/museum/experiences/stadiums/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),D=require('../'+dir+'data.ts'),G=require('../'+dir+'geometry.ts'),M=require('../'+dir+'model.ts'),K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),geo=read(dir+'geometry.ts'),model=read(dir+'model.ts'),data=read(dir+'data.ts');
const e=X.EXHIBITS.find(x=>x.id==='stadiums');
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');

// 1. The case and its facts: worded for kids, every number from its source; the seven stadiums' numbers.
{assert.ok(e,'the stadiums case exists');assert.equal(e.title,'Stadiums of the World');assert.equal(e.year,'1950');assert.equal(e.gallery,'worldcup');assert.equal(e.object,'stadium');
 assert.ok(!X.EXHIBITS.some(x=>x.id==='cards-1970'),'the yellow and red cards case is gone');
 assert.match(e.facts[0],/199,854/);assert.match(e.facts[1],/first stadium to host two World Cup finals/);assert.match(e.facts[2],/133 metres/);assert.match(e.facts[3],/sand and gravel/);
 assert.ok(e.sources.some(s=>/Maracan/.test(s.url))&&e.sources.some(s=>/Estadio_Azteca/.test(s.url))&&e.sources.some(s=>/Wembley/.test(s.url))&&e.sources.some(s=>/geosmartinfo/.test(s.url)));
 assert.match(exp,/exhibit\.facts\.map/,'every fact shown');assert.match(exp,/take=\{exhibit\.forYourGame\}/);
 assert.equal(D.STADIUMS.length,7);const by=Object.fromEntries(D.STADIUMS.map(s=>[s.id,s]));
 assert.deepEqual(D.STADIUMS.map(s=>[s.id,s.opened]),[['maracana',1950],['wembley',2007],['azteca',1966],['allianz',2005],['dortmund',1974],['sansiro',1926],['albayt',2021]]);
 assert.equal(by.wembley.seats,90000);assert.equal(by.allianz.seats,75024);assert.equal(by.dortmund.seats,81365);assert.equal(by.sansiro.seats,75817);assert.equal(by.albayt.seats,68895);assert.equal(by.maracana.seats,73139);
 assert.match(by.wembley.famous,/87,192/);assert.match(by.dortmund.famous,/24,454/);assert.match(by.allianz.lines.outside,/2,760/);assert.match(by.azteca.famous,/4–1.*3–2/);
 for(const s of D.STADIUMS){assert.match(s.source.url,/^https:\/\/en\.wikipedia\.org\/wiki\//,s.id+' sourced');for(const id of D.LAYERS)assert.ok(s.lines[id].length>20&&s.lines[id].length<130,s.id+' '+id+' line');assert.ok(s.clue.length<90);}
 assert.equal(D.aboutSeats(73139),'about 73,000');assert.equal(D.aboutSeats(87523),'about 88,000');
 for(const s of D.STADIUMS)assert.ok(D.EXTRA_SOURCES.some(x=>x.url===s.source.url),'cites '+s.id);assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.EXTRA_SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 assert.match(exp,/pitch’s layers are drawn thicker/,'says the drawings are not to scale where they are not');
 console.log('PASS facts: the case (1950, World Cup gallery), 4 sourced facts, 7 stadiums with sourced numbers, kid lines, rounded seats');}

// 2. Contract.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);
 assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(exp,/data-museum-experience="stadiums"/);
 assert.equal((exp.match(/<ExperienceBack onClose=\{onClose\}\/>/g)||[]).length,1);assert.doesNotMatch(exp,/NavigationButton|immediate/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3);assert.match(exp,/\{checked&&<Ending [^\n]*onComplete=\{onComplete\} reached=\{checked\}\/>\}/);assert.match(exp,/const checked=picked!=null/);
 assert.match(exp,/<StepCheck items=\{\[\{q:CHECK\.q,options:CHECK\.options,right:CHECK\.answer,why:CHECK\.why\}\]\}/);assert.equal(D.CHECK.options[D.CHECK.answer],'The foundations');
 for(const h of ['data-phase','data-stadium','data-apart','data-built','data-start','data-explode','data-apart-slider','data-build','data-layer-chip','data-to-quiz','data-option','data-next-round','data-play-again','data-stat-card','data-layer-label','data-turn-left','data-turn-right','data-prev','data-next'])assert.ok(exp.includes(h),'hook '+h);
 assert.equal(D.BEST_KEY,'fi2-museum-stadiums-best');assert.match(exp,/try\{localStorage\.setItem\(BEST_KEY/);assert.ok(read('lib/saves/snapshot.ts').includes(`'${D.BEST_KEY}'`),'the best score is synced');
 assert.match(read('app/museum-lab/stadiums/page.tsx'),/<Lab id="stadiums"/);assert.match(read('components/museum/experiences/index.tsx'),/'stadiums':load\(\(\)=>import\('\.\/stadiums\/Experience'\)\)/);
 console.log('PASS contract: dialog, shared Back, Escape, onComplete only after the game + quick check, hooks, synced best key, lab route');}

// 3. Style: the shared anatomy kit, Paper tint, one red accent, no figures, no pixels.
{const files=fs.readdirSync(path.join(root,dir)).sort();assert.deepEqual(files,['Experience.module.css','Experience.tsx','data.ts','geometry.ts','model.ts']);
 for(const f of files){const s=read(dir+f);assert.doesNotMatch(s,/pixeliso|anatomy\/figure|PK Press Start|crispEdges/,f+': no pixel kit, no paper figures');}
 assert.match(geo,/from '\.\.\/anatomy\/iso-kit'/);assert.match(exp,/dangerouslySetInnerHTML=\{\{__html:ISO_CSS\}\}/);assert.match(exp,/className=\{`\$\{g\.room\} iso \$\{s\.root\}`\} data-theme="light"/);
 assert.match(css,/\.root\.root\[data-theme\]\{--anatomy-page:#e0e0db;--anatomy-card:#e0e0db;--anatomy-paper:#f7f7f3/);assert.match(exp,/'--accent':'#e4322b'/);
 console.log('PASS style: anatomy kit, Paper tokens, one red accent, no figure.ts');}

// 4. Fill the screen: the card is the rest of 100dvh, the viewBox is the card, the model fills its area at every size.
{assert.match(css,/\.screen\{box-sizing:border-box;height:100vh;height:100dvh;display:grid;grid-template-rows:auto minmax\(0,1fr\) auto/);
 assert.match(css,/\.svg\{position:absolute;inset:0;width:100%;height:100%;touch-action:none/);assert.match(exp,/data-play-area data-fill-screen/);assert.match(exp,/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/);
 for(const [W,H,wide] of [[1400,660,true],[1805,870,true],[370,560,false]])for(const S of D.STADIUMS)for(const ex of [0,1]){
  const aw=wide?W-300-280-68:W-12,ah=H-80,pose=G.explodePose(ex),P=K.fitProjection(G.fitPoints(S,pose),aw,ah,{pad:wide?14:8,azimuth:45,elevation:wide?30:34});
  const xy=G.fitPoints(S,pose).map(p=>K.iso(p,P)),w=Math.max(...xy.map(p=>p[0]))-Math.min(...xy.map(p=>p[0])),h=Math.max(...xy.map(p=>p[1]))-Math.min(...xy.map(p=>p[1]));
  assert.ok(w/aw>.9||h/ah>.9,`${S.id} ${ex?'apart':'built'} fills ${W}×${H}`);}
 console.log('PASS fill: 100dvh screen, card = 1fr, viewBox = the card, every model fills its area built and apart at 1440, 1845 and 390');}

// 5. Heat: one shared loop, nothing at rest, lite drawing while moving, no React render per frame.
{for(const src of [exp,geo,model,data])assert.doesNotMatch(src,/requestAnimationFrame|setInterval/);
 assert.match(exp,/usePaperLoop\(\(dt\)=>/);assert.match(exp,/return moving;\},card,reduced\)/,'the tick stops when nothing moves');
 assert.match(exp,/el\.innerHTML=r\.svg/,'the drawing is written into the card, not rendered by React per frame');assert.match(exp,/paint\(moving\|\|!!V\.drag\)/,'lite while moving');
 assert.match(exp,/if\(!V\.dirty\)\{V\.dirty=true;wake\(\);\}/,'a drag asks for one frame, not a running loop');
 assert.match(exp,/useEffect\(\(\)=>\(\)=>timers\.current\.forEach\(clearTimeout\),\[\]\)/);
 assert.ok(M.follow(0,1,10)===1,'follow lands exactly (so the loop can stop)');
 console.log('PASS heat: one shared loop that stops, a drag draws once per change, lite while moving, timers cleared');}

// 6. The models: every stadium renders in Node, dense, in depth order, at four turns, built and apart.
{for(const S of D.STADIUMS)for(const az of [0,45,135,270])for(const ex of [0,1]){
  const pose=G.explodePose(ex),P=K.fitProjection(G.fitPoints(S,pose),1000,700,{azimuth:az}),r=G.renderStadium(S,P,pose);
  const paths=(r.svg.match(/<path/g)||[]).length;assert.ok(paths>900,`${S.id} az ${az} e ${ex}: dense (${paths} paths)`);
  for(const id of D.LAYERS)assert.ok(r.svg.includes(`data-l="${id}"`),`${S.id}: layer ${id} drawn`);
  assert.equal(Object.keys(r.anchors).length,5,'a label anchor per layer');
  assert.equal(r.svg.includes('data-sample'),ex===1,'the pitch sample only when apart');
  if(ex===0){const lite=G.renderStadium(S,P,pose,{lite:true});assert.ok(lite.svg.length<r.svg.length,'lite is lighter');}}
 const W=D.STADIUMS.find(s=>s.id==='wembley'),Pw=K.fitProjection(G.fitPoints(W,G.explodePose(0)),1000,700);assert.match(G.renderStadium(W,Pw,G.explodePose(0)).svg,/st-arch/,'Wembley has its arch');
 const Al=D.STADIUMS.find(s=>s.id==='allianz'),Pa=K.fitProjection(G.fitPoints(Al,G.explodePose(0)),1000,700);assert.notEqual(G.renderStadium(Al,Pa,G.explodePose(0),{glow:'#2a5bd7'}).svg,G.renderStadium(Al,Pa,G.explodePose(0)).svg,'Munich glows another colour');
 // Rings: the same number of points at every offset, so a sector is the same slice at every step.
 for(const S of D.STADIUMS)assert.equal(G.ringAt(S,0).length,G.ringAt(S,40).length);
 // Turn-proof framing: the fit points are the same however the turntable is turned.
 const S0=D.STADIUMS[0],a=K.fitProjection(G.fitPoints(S0,G.explodePose(.5)),900,600,{azimuth:10}),b=K.fitProjection(G.fitPoints(S0,G.explodePose(.5)),900,600,{azimuth:100});assert.ok(Math.abs(a.scale-b.scale)/a.scale<.02,'turning never rescales');
 // Build poses: hidden until placed, the dropping layer above its place.
 const bp=G.buildPose(2,30);assert.deepEqual(D.LAYERS.map(id=>bp[id].show),[true,true,true,false,false]);assert.equal(bp.stands.dz,30);assert.equal(bp.ground.dz,0);
 console.log('PASS models: 7 stadiums × 4 turns × built/apart, > 900 paths each, 5 layers + anchors, the pitch sample, arch, glow, lite');}

// 7. Build it and Which stadium?
{assert.ok(M.pickLayer(0,'ground').ok);assert.equal(M.pickLayer(0,'roof').ok,false);assert.match(M.pickLayer(0,'roof').say,/foundations go in first/);
 assert.match(M.pickLayer(2,'roof').say,/stands wrap round the pitch/);assert.match(M.pickLayer(3,'ground').say,/already on/);
 assert.equal(M.buildScore(0),5);assert.equal(M.buildScore(9),0);assert.equal(M.MAX_POINTS,15);assert.equal(M.total(5,0),15);assert.equal(M.verdict(15),'Master builder!');
 const rs=M.makeRounds(M.rng(7));assert.equal(rs.length,5);assert.equal(new Set(rs.map(r=>r.answer)).size,5,'five different stadiums');
 for(const [i,r] of rs.entries()){assert.equal(r.options.length,4);assert.ok(r.options.includes(r.answer));assert.equal(new Set(r.options).size,4);assert.equal(r.kind,i%2?'clue':'shape');}
 assert.match(exp,/data-sil=\{phase==='quiz'&&round\.kind==='shape'&&!answered\?'':undefined\}/,'shape rounds draw a silhouette');assert.match(css,/\.svg\[data-sil\]/);
 assert.equal(M.seatShare(M.MAX_SEATS),1);assert.equal(M.turnTo(350,10),370);
 console.log('PASS game: bottom-up build with reasons, 5 rounds (shape / clue) of 4 different names, 15 points, capacity bars');}

// 8. Reduced motion: every move lands at once (the shared loop runs to the end), the layer lands without a drop.
{assert.match(exp,/usePaperLoop\([\s\S]*?,card,reduced\)/);assert.match(exp,/if\(reduced\)\{landRef\.current\(\);return;\}/);assert.match(exp,/if\(!ease\|\|reduced\)\{V\.e=V\.eT/);
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 console.log('PASS reduced motion: static explode, instant layers, no CSS motion');}

// 9. Registry: the hall, the timeline, the story, the passport, analytics.
{const V=require('../lib/museum/museumVisits.ts'),L=require('../lib/museum/museumLayout.ts'),E=require('../components/museum/experiences/timeline/eras.ts');
 assert.ok(L.CASE_PLACES.stadiums&&!L.CASE_PLACES['cards-1970']);assert.match(read('lib/museum/museumExhibits.ts'),/sculpture\('stadiums'/);
 assert.ok(E.CHAPTERS.some(c=>c.ids.includes('stadiums')));assert.ok(V.RETIRED_IDS.includes('cards-1970'));
 const old=V.sanitizeMuseumVisits({seen:['cards-1970','laws-1863','timeline'],done:['cards-1970']});assert.deepEqual(old,{seen:['timeline','laws-1863'],done:[]},'an old cards-1970 stamp is dropped, the rest kept');
 const p=V.passport({seen:[...X.EXHIBITS.map(x=>x.id).filter(id=>id!=='stadiums'),'cards-1970'],done:[]});assert.equal(p.total,X.EXHIBITS.length);assert.equal(p.seen,X.EXHIBITS.length-1);assert.equal(p.all,false,'an old stamp never completes the passport');
 assert.ok(read('lib/analytics/islandIds.ts').includes("['exhibit_stadiums',"));assert.ok(!fs.existsSync(path.join(root,'components/museum/experiences/cards-1970')));assert.ok(!fs.existsSync(path.join(root,'app/museum-lab/cards-1970')));
 // Oct 13 2026: the hall's stories are retired; the stadium is a still bowl and its case opens on the full card.
 assert.ok(!/cranking/.test(read('components/MuseumRoom.tsx')),'the hall case is a still stadium bowl, no turntable');
 console.log('PASS registry: the hall case and sculpture, chapter, passport drops the retired id, analytics key, old folders gone');}
console.log('museum-exp-stadiums: all passed');
