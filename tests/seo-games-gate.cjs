// Nov 21 2026: the unlisted game page gate (lib/site/games.ts ALL_GAME_PAGES). Safe Hands has a complete /games page, but its game has
// no machine in the arcade room yet (lib/arcade/arcadeCatalog.ts arcadeUnplaced), so the site must not list it or count it. This test
// loads the REAL site modules twice: as they are, and with the catalog edited IN MEMORY the way the owner places the game (its entry
// moved from arcadeUnplaced into arcadeCabinets). Placed, it must be listed everywhere and every count must read twelve with no other
// edit; unplaced, nothing lists, links or counts it.
//   node tests/seo-games-gate.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');process.chdir(root);
const {renderToStaticMarkup}=require('react-dom/server'),React=require('react');
const cssProxy=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
const CATALOG=path.join(root,'lib/arcade/arcadeCatalog.ts');
/** The owner's placement, as a source edit: the entry moves from arcadeUnplaced into arcadeCabinets (direction doc option A spot). */
function place(src){
 const entry=/\n \{id:'safehands',[^\n]*\},\n/.exec(src);assert(entry,'arcadeUnplaced holds the safehands entry');
 const line=entry[0].trim().replace(/\},?$/,",x:11.6,z:-1,yaw:-Math.PI/2},");
 const end='\n] as const;\nexport type ArcadeCabinetId';assert(src.includes(end));
 return src.replace(entry[0],'\n').replace(end,`\n ${line}${end}`);
}
function world(placed){
 const cache=new Map();
 function load(file){
  if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);let src=fs.readFileSync(file,'utf8');if(placed&&file===CATALOG)src=place(src);
  const out=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const req=id=>{
   if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
   if(/\.css$/.test(id))return {__esModule:true,default:cssProxy};
   if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);};
  new Function('exports','module','require',out)(mod.exports,mod,req);return mod.exports;}
 const L=rel=>load(path.join(root,rel));
 const catalog=L('lib/arcade/arcadeCatalog.ts'),games=L('lib/site/games.ts'),sitemap=L('lib/site/paths.ts').sitePaths().map(p=>p.path),llms=L('lib/site/llms.ts').llmsText();
 const g=games.gameById('safehands'),slugPage=L('app/(site)/games/[slug]/page.tsx'),hubHtml=renderToStaticMarkup(React.createElement(L('app/(site)/games/page.tsx').default));
 const drill=renderToStaticMarkup(L('app/(site)/learn/soccer-drills/[slug]/page.tsx').default({params:{slug:'goalkeeper-angles'}}));
 const arcade=L('lib/site/learnFeatures.ts');const feat=JSON.stringify(arcade).match(/"id":"arcade"[^}]*\}/)?.[0]??JSON.stringify(arcade);
 const watch=L('lib/site/videos.ts').allWatchVideos(),images=L('lib/site/tools/imageSitemap.ts');
 return {catalog,games,g,sitemap,llms,hubHtml,drill,feat,watch,images,meta:slugPage.generateMetadata({params:{slug:g.slug}}),statics:slugPage.generateStaticParams().map(x=>x.slug),library:L('lib/site/library.ts')};
}
const words=h=>h.replace(/<nav[^>]*data-rail[\s\S]*?<\/nav>/g,' ').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().split(' ').length;

const now=world(false),then=world(true);
// as it is: built, noindex, unlisted, uncounted
assert.equal(now.catalog.ARCADE_GAME_COUNT,11);assert.equal(now.games.GAMES_WORD,'eleven');
assert(!now.games.GAME_PAGES.includes(now.g)&&now.games.ALL_GAME_PAGES.includes(now.g)&&now.statics.includes('soccer-goalkeeper-game'),'unplaced: built, not listed');
assert(now.meta.robots&&now.meta.robots.index===false,'unplaced: noindex');
assert(!now.sitemap.includes(now.g.path)&&!now.llms.includes(now.g.path),'unplaced: not in the sitemap or llms.txt');
assert(!now.hubHtml.includes(now.g.path)&&!/goalkeeper game|Safe Hands/.test(now.hubHtml),'unplaced: the hub neither links nor names it');
assert(!now.drill.includes(`href="${now.g.path}"`),'unplaced: the goalkeeper drill does not link it');
assert(!now.feat.includes('Safe Hands'),'unplaced: the Library does not name it');
assert(!now.watch.some(v=>v.key==='safehands'),'unplaced: no watch page for its clip');
assert(/\bEleven\b/.test(now.games.GAMES_HUB.description));
// placed by the one catalog move: listed and counted everywhere, no other edit
assert.equal(then.catalog.ARCADE_GAME_COUNT,12);assert.equal(then.games.GAMES_WORD,'twelve');
assert(then.games.GAME_PAGES.some(x=>x.id==='safehands')&&then.games.GAME_PAGES.length===12,'placed: listed');
assert(!then.meta.robots,'placed: indexable');
assert(then.sitemap.includes(then.g.path)&&then.llms.includes(then.g.path),'placed: in the sitemap and llms.txt');
assert(then.hubHtml.includes(`href="${then.g.path}"`)&&then.hubHtml.includes('href="/arcade?game=safehands"'),'placed: the hub links the page and the game');
assert(/goalkeeper/.test(then.games.GAMES_HUB.description)&&/^Twelve /.test(then.games.GAMES_HUB.description),'placed: the hub description says twelve and names the goalkeeper game');
{const d=then.games.GAMES_HUB.description.length;assert(d>=120&&d<=155,`placed: hub description ${d} chars`);}
assert(then.drill.includes(`href="${then.g.path}"`),'placed: the goalkeeper drill links it');
assert(then.feat.includes('Safe Hands')&&/Twelve football games/.test(then.feat),'placed: the Library names it and counts twelve');
assert(then.watch.some(v=>v.key==='safehands'),'placed: its clip gets a watch page');
// the hub's words stay inside the bound tests/seo-games.cjs uses for the hub (it grows 40 words a listed game)
{const lim=1300+4*then.watch.filter(v=>v.group!=='lessons').length+15+100+60+40*Math.max(0,then.games.GAME_PAGES.length-7),n=words(then.hubHtml);assert(n<=lim,`placed: hub ${n} words (limit ${lim})`);
 console.log(`seo-games-gate: ok (unplaced: built, noindex, unlisted, eleven; placed by the catalog move: listed everywhere, twelve; hub ${words(now.hubHtml)} -> ${n} words of ${lim})`);}
