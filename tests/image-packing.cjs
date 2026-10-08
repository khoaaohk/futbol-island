// Fewer, smaller image files (Oct 7 2026; docs/performance-guide.md "Fewer, smaller image files"):
// 1. player cards: each player's ink + tone riso masks are ONE packed file (public/players/<slug>.webp, 640×400, ink left, tone right;
//    scripts/player_masks.py), and no card code asks for the old <slug>-ink.webp / -tone.webp pair;
// 2. Paths chapter art: every file is named by its content hash (cached immutable for a year) and every manifest entry exists;
// 3. museum ball decals: no PNG decal references (lossless WebP), every decal file exists and keeps its credit;
// 4. vending: one atlas holds every ball picture; island boot no longer warms the closed dialogs' backdrops.
// usage: node tests/image-packing.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
/** Width, height and lossless flag of a WebP file (RIFF header: VP8L lossless, VP8 lossy, VP8X extended). */
function webpInfo(file){const b=fs.readFileSync(file);assert.equal(b.toString('latin1',0,4),'RIFF',file);assert.equal(b.toString('latin1',8,12),'WEBP',file);
 const chunk=b.toString('latin1',12,16);
 if(chunk==='VP8L'){const v=b.readUInt32LE(21);return {w:(v&0x3fff)+1,h:((v>>14)&0x3fff)+1,lossless:true};}
 if(chunk==='VP8X'){const w=1+b.readUIntLE(24,3),h=1+b.readUIntLE(27,3);let o=30,lossless=false;while(o+8<=b.length){const id=b.toString('latin1',o,o+4),n=b.readUInt32LE(o+4);if(id==='VP8L')lossless=true;o+=8+n+(n&1);}return {w,h,lossless};}
 if(chunk==='VP8 ')return {w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff,lossless:false};
 throw new Error(file+': unknown WebP chunk '+chunk);}
const walk=(dir,re,out=[])=>{for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p,re,out);else if(re.test(e.name))out.push(p);}return out;};

// 1. Player masks: one packed file per photo card, and no code asking for the pair.
{const {ALL_PLAYERS}=require('../lib/town/cardCollection.ts');
 const shards=['','stars.','futsal.','women.','external.','coaches.'].map(s=>JSON.parse(read(`lib/town/playerPhotos.${s}json`)));
 const photos=Object.assign({},...shards);let n=0;
 for(const name of ALL_PLAYERS){const ph=photos[name];if(!ph)continue;n++;const f=path.join(root,'public/players',`${ph.slug}.webp`);
  assert.ok(fs.existsSync(f),`${name}: packed mask public/players/${ph.slug}.webp`);const info=webpInfo(f);
  assert.deepEqual([info.w,info.h,info.lossless],[640,400,true],`${name}: packed mask is a lossless 640×400 (ink | tone)`);}
 assert.ok(n>=350,`most cards have photos (${n})`);
 const code=[...walk('components',/\.(tsx?|css)$/),...walk('lib',/\.(tsx?)$/),...walk('app',/\.(tsx?|css)$/)];
 for(const f of code){const src=read(f);
  assert.ok(!/players\/[^'"`)]*-(ink|tone)\.webp|-\$\{(layer|part)\}\.webp/.test(src),`${f} must not ask for the old <slug>-ink/-tone.webp pair`);}
 const art=read('components/PlayerArt.tsx');assert.match(art,/export const playerMaskUrl=\(slug:string\)=>mediaUrl\(`\/players\/\$\{slug\}\.webp`\)/,'one mask URL, through mediaUrl');
 for(const f of ['components/MiniCard.tsx','components/PlayerThumb.tsx'])assert.match(read(f),/playerMaskStyle\(/,f+' uses the packed mask');
 assert.match(read('components/CardOffer.tsx'),/decode\(playerMaskUrl\(photo\.slug\)\)/,'the card offer warms one file');
 // The layer's class picks its half: ink at 0 0, tone at 100% 0, on a box exactly the old mask rectangle.
 for(const [f,boxes] of [['components/MiniCard.module.css',['.photo>.tone,.photo>.ink']],['components/PlayerArt.module.css',['.riso>.tone,.riso>.ink','.maskPart','.thumbMask']],['components/PlayerThumb.module.css',['.mask']]]){
  const css=read(f);for(const sel of boxes){const rule=css.slice(css.indexOf(sel+'{'));assert.ok(css.includes(sel+'{'),`${f}: ${sel}`);assert.match(rule.slice(0,rule.indexOf('}')),/mask-size:200% 100%.*mask-position:0 0/,`${f}: ${sel} shows the left (ink) half`);}
  assert.match(css,/tone\{-webkit-mask-position:100% 0;mask-position:100% 0\}/,f+': the tone layer shows the right half');
  assert.ok(!/mask-size:contain|mask-size:128% auto/.test(css.replace(/\/\*[\s\S]*?\*\//g,'')),f+': no single-mask sizing left');}
 // Pipelines write the packed file through save_mask (scripts/player_masks.py).
 for(const f of ['fetch-player-photos.py','fetch-player-photos-stars.py','fetch-player-photos-women.py','fetch-player-photos-futsal.py'])assert.match(read('scripts/'+f),/player_masks\.save_mask_alpha\(a, path\)/,f+' packs its masks');
 console.log(`PASS player masks: ${n} photo cards, one packed lossless 640×400 mask each; no card code asks for the ink/tone pair`);}

// 2. Paths chapter art: content-hashed names, every reference present, through mediaUrl.
{const dir='public/stories/paths/chapters',files=fs.readdirSync(path.join(root,dir));
 for(const f of files){assert.match(f,/^ink-[0-9a-f]{12}\.webp$/,f);const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,dir,f))).digest('hex').slice(0,12);
  assert.equal(f,`ink-${hash}.webp`,`${f}: its name is its content hash (immutable cache: new bytes need a new name)`);}
 const manifest=JSON.parse(read('lib/paths/pathArt.json'));let refs=0;
 for(const [format,list] of Object.entries(manifest))for(const [i,e] of list.entries())for(const v of ['mobile','desktop']){refs++;assert.match(e[v],/^\/stories\/paths\/chapters\/ink-[0-9a-f]{12}\.webp$/);assert.ok(exists('public'+e[v]),`${format} chapter ${i} ${v}: ${e[v]} exists`);}
 const q=read('components/QuestLearningPath.tsx');assert.match(q,/srcSet=\{mediaUrl\(baked\.mobile\)\}/);assert.match(q,/src=\{mediaUrl\(baked\.desktop\)\}/);assert.match(q,/image\.src=mediaUrl\(asset\[variant\]\)/);
 const bake=read('scripts/bake-path-art.mjs');assert.match(bake,/PATH_ART_QUALITY\|\|0\.85/,'re-bakes default to WebP quality 0.85');assert.doesNotMatch(bake,/'image\/webp',\.96/);
 console.log(`PASS chapter art: ${files.length} files named by their content hash, ${refs} manifest references present, served through mediaUrl`);}

// 3. Museum ball decals: lossless WebP, no PNG references, files present, credits kept.
{const files=walk('lib/museum/wcBalls',/\.ts$/);let n=0;
 for(const f of files){const src=read(f);assert.ok(!/wcballs\/decals\/[^'"`]*\.png/.test(src),`${f}: no PNG decal references`);
  for(const m of src.matchAll(/\{\s*"?src"?\s*:\s*['"](\/museum\/wcballs\/decals\/[^'"]+)['"]([^}]*)\}/g)){n++;assert.match(m[1],/\.webp$/);assert.ok(exists('public'+m[1]),m[1]+' exists');
   assert.match(m[2],/"?credit"?\s*:/,`${m[1]} keeps its credit`);const info=webpInfo(path.join(root,'public',m[1]));assert.ok(info.w>0&&info.h>0);}}
 assert.ok(n>=37,`static decal entries checked (${n})`);
 assert.match(read('lib/museum/wcBalls/ballViewer.ts'),/loadImage\(mediaUrl\(d\.src\)\)/,'decals load through mediaUrl');
 for(const f of fs.readdirSync(path.join(root,'public/museum/wcballs/decals')).filter(f=>f.endsWith('.webp')&&exists('public/museum/wcballs/decals/'+f.replace(/\.webp$/,'.png'))))
  assert.ok(webpInfo(path.join(root,'public/museum/wcballs/decals',f)).lossless,f+' (converted from PNG) is lossless');
 console.log(`PASS ball decals: ${n} static decal entries are WebP files that exist and keep their credits; no PNG references`);}

// 4. Vending: one atlas covers every ball picture; boot doesn't warm closed dialogs' backdrops.
{const atlas=JSON.parse(read('lib/graphics/vendingBallAtlas.json'));const {CUSTOMIZATION_OPTIONS}=require('../lib/town/customization.ts');
 assert.match(atlas.src,/^\/vending\/products\/balls-[0-9a-f]{12}\.webp$/);const file=path.join(root,'public',atlas.src);
 assert.equal(path.basename(atlas.src),`balls-${crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12)}.webp`,'atlas named by its content');
 const info=webpInfo(file);assert.deepEqual([info.w,info.h,info.lossless],[atlas.w,atlas.h,true],'atlas size matches its JSON, lossless');
 const cells=Object.entries(atlas.rects);
 for(const o of CUSTOMIZATION_OPTIONS.ball){const r=atlas.rects[o.id];assert.ok(r,`ball ${o.id} has an atlas cell`);
  const png=fs.readFileSync(path.join(root,'public/vending/products',`ball-${o.id}.png`));assert.deepEqual([r[2],r[3]],[png.readUInt32BE(16),png.readUInt32BE(20)],`${o.id}: cell is the picture's exact size`);}
 const G=2;for(const [a,[ax,ay,aw,ah]] of cells){assert.ok(ax>=G&&ay>=G&&ax+aw+G<=atlas.w&&ay+ah+G<=atlas.h,a+' inside the atlas with its gutter');
  for(const [b,[bx,by,bw,bh]] of cells)if(a!==b)assert.ok(ax+aw+G<=bx-G||bx+bw+G<=ax-G||ay+ah+G<=by-G||by+bh+G<=ay-G,`${a} and ${b} cells (with gutters) do not overlap`);}
 const art=read('lib/graphics/vendingProductArt.ts');assert.match(art,/src:mediaUrl\(ATLAS\.src\)/,'atlas URL through mediaUrl');
 assert.ok(!/ball-\$\{|['"`]\/vending\/products\/ball-/.test(read('lib/graphics/vendingMachines.ts')+read('components/StorePreviews.tsx')+art),'nothing asks for a single ball PNG');
 assert.ok(!/['"`]\/stories\/paths\/(settings|coaches)-coast\.svg/.test(read('components/IslandLoading.tsx')),'boot does not warm the closed Settings/Coaches backdrops');
 console.log(`PASS vending atlas: ${cells.length} ball pictures in one lossless atlas (${atlas.w}×${atlas.h}), every ball covered; closed dialog backdrops load on open`);}
