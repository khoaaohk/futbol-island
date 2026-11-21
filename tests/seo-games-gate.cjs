// Nov 21 2026: the unlisted game page gate (lib/site/games.ts ALL_GAME_PAGES). Keepy-Uppy Beat and Hold the Line have complete /games
// pages, but their games have no machine in the arcade room yet (lib/arcade/arcadeCatalog.ts arcadeUnplaced), so the site must not
// list them or count them. This test loads the REAL site modules four times: as they are, and with the catalog edited IN MEMORY the
// way the owner places a game (its entry moved from arcadeUnplaced into arcadeCabinets) for every subset of the two games (the third, the goalkeeper game, was rejected on Nov 21 2026 and removed).
// Placed, a game must be listed everywhere and every count must read twelve or thirteen with no other edit;
// unplaced, nothing lists, links or counts it.
//   node tests/seo-games-gate.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');process.chdir(root);
const {renderToStaticMarkup}=require('react-dom/server'),React=require('react');
const cssProxy=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
const CATALOG=path.join(root,'lib/arcade/arcadeCatalog.ts');
/** The owner's placement, as a source edit: the entry moves from arcadeUnplaced into arcadeCabinets (each direction doc's option A spot). */
const SPOT={keepyuppy:'x:11.6,z:-1,yaw:-Math.PI/2',holdtheline:'x:-11.6,z:-4.5,yaw:Math.PI/2'/* docs/arcade-aaa/NEW-GAMES-NOV21.md */};
function place(src,id){
 const entry=new RegExp(`\\n \\{id:'${id}',[^\\n]*\\n`).exec(src);assert(entry,`arcadeUnplaced holds the ${id} entry`);
 const line=entry[0].trim().replace(/\s*\/\/.*$/,'').replace(/\},?$/,`,${SPOT[id]}},`);
 const end='\n] as const;\nexport type ArcadeCabinetId';assert(src.includes(end));
 return src.replace(entry[0],'\n').replace(end,`\n ${line}${end}`);
}
function world(placed=[]){
 const cache=new Map();
 function load(file){
  if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);let src=fs.readFileSync(file,'utf8');if(file===CATALOG)for(const id of placed)src=place(src,id);
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
 const slugPage=L('app/(site)/games/[slug]/page.tsx'),hubHtml=renderToStaticMarkup(React.createElement(L('app/(site)/games/page.tsx').default));
 const drillHtml=slug=>renderToStaticMarkup(L('app/(site)/learn/soccer-drills/[slug]/page.tsx').default({params:{slug}}));
 const arcade=L('lib/site/learnFeatures.ts');const feat=JSON.stringify(arcade).match(/"id":"arcade"[^}]*\}/)?.[0]??JSON.stringify(arcade);
 const watch=L('lib/site/videos.ts').allWatchVideos();
 const game=id=>{const g=games.gameById(id);return {g,meta:slugPage.generateMetadata({params:{slug:g.slug}}),drills:CHECK[id].drills.map(drillHtml)};};
 return {catalog,games,sitemap,llms,hubHtml,feat,watch,statics:slugPage.generateStaticParams().map(x=>x.slug),keepyuppy:game('keepyuppy'),holdtheline:game('holdtheline')};
}
/** Per game: the drill pages that link it once placed, the words the hub and the Library use for it. */
const CHECK={keepyuppy:{drills:['thigh-and-chest-control','toe-taps-and-foundations'],hub:/juggling game|Keepy-Uppy Beat/,name:'Keepy-Uppy Beat',kind:/juggling/},
 holdtheline:{drills:['pressure-and-cover-2v2','recover-goal-side'],hub:/defending game|Hold the Line/,name:'Hold the Line',kind:/defending/}};
const words=h=>h.replace(/<nav[^>]*data-rail[\s\S]*?<\/nav>/g,' ').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().split(' ').length;

const IDS=['keepyuppy','holdtheline'],WORD={11:'eleven',12:'twelve',13:'thirteen',14:'fourteen'},CAP=w=>w[0].toUpperCase()+w.slice(1);let hubWords='';
for(const placed of [0,1,2,3].map(m=>IDS.filter((_,i)=>m&(1<<i)))){
 const w=world(placed),n=11+placed.length,word=WORD[n],tag=placed.length?`placed ${placed.join(' + ')}`:'unplaced';
 assert.equal(w.catalog.ARCADE_GAME_COUNT,n,tag);assert.equal(w.games.GAMES_WORD,word,tag);assert.equal(w.games.GAME_PAGES.length,n,tag);
 assert(new RegExp(`^${CAP(word)} `).test(w.games.GAMES_HUB.description),`${tag}: the hub description counts ${word}`);
 {const d=w.games.GAMES_HUB.description.length;assert(d>=120&&d<=155,`${tag}: hub description ${d} chars`);}
 assert(new RegExp(`${CAP(word)} football games`).test(w.feat),`${tag}: the Library counts ${word}`);
 for(const id of IDS){const {g,meta,drills}=w[id],c=CHECK[id],on=placed.includes(id),t=`${tag}, ${id}`;
  assert(w.games.ALL_GAME_PAGES.includes(g)&&w.statics.includes(g.slug),`${t}: the page is built`);
  if(on){
   assert(w.games.GAME_PAGES.includes(g),`${t}: listed`);assert(!meta.robots,`${t}: indexable`);
   assert(w.sitemap.includes(g.path)&&w.llms.includes(g.path),`${t}: in the sitemap and llms.txt`);
   assert(w.hubHtml.includes(`href="${g.path}"`)&&w.hubHtml.includes(`href="/arcade?game=${id}"`),`${t}: the hub links the page and the game`);
   assert(c.kind.test(w.games.GAMES_HUB.description+w.games.GAMES_HUB.intro.join(' ')),`${t}: the hub names its kind of game`);
   assert(drills.every(h=>h.includes(`href="${g.path}"`)),`${t}: its drills link it`);
   assert(w.feat.includes(c.name),`${t}: the Library names it`);assert(w.watch.some(v=>v.key===id),`${t}: its clip gets a watch page`);
  }else{
   assert(!w.games.GAME_PAGES.includes(g),`${t}: not listed`);assert(meta.robots&&meta.robots.index===false,`${t}: noindex`);
   assert(!w.sitemap.includes(g.path)&&!w.llms.includes(g.path),`${t}: not in the sitemap or llms.txt`);
   assert(!w.hubHtml.includes(g.path)&&!c.hub.test(w.hubHtml),`${t}: the hub neither links nor names it`);
   assert(drills.every(h=>!h.includes(`href="${g.path}"`)),`${t}: no drill links it`);
   assert(!w.feat.includes(c.name),`${t}: the Library does not name it`);assert(!w.watch.some(v=>v.key===id),`${t}: no watch page for its clip`);}}
 // the hub's words stay inside the bound tests/seo-games.cjs uses for the hub (it grows 40 words a listed game)
 const lim=1300+4*w.watch.filter(v=>v.group!=='lessons').length+15+100+60+40*Math.max(0,w.games.GAME_PAGES.length-7),nw=words(w.hubHtml);assert(nw<=lim,`${tag}: hub ${nw} words (limit ${lim})`);
 hubWords+=` ${word} ${nw}/${lim};`;}
console.log(`seo-games-gate: ok (unplaced: both pages built, noindex, unlisted, eleven; placed by the catalog move, every subset: listed everywhere, twelve / thirteen; hub words:${hubWords})`);
