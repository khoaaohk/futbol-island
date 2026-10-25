// Football shop · Ball drawing save format (Oct 24 2026, docs/BALL_STUDIO_AUDIT_OCT24.md P0.5): the fi-draw codec
// (lib/shop/drawCodec.ts) and the studio encode/decode that use it (lib/shop/ballPaint.ts). Painted 512×256 rasters round-trip
// for 8/25/60/100 strokes under DRAW_MAX_CHARS, the deflate is standard (zlib reads ours, ours reads zlib's), old WebP/PNG
// saves still decode through <img>, corrupt or newer-version data falls back to "no drawing" without throwing, and the
// ball store + save snapshot keep a fi-draw drawing.
// usage: node tests/ball-drawing-codec.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const C=require('../lib/shop/drawCodec.ts'),P=require('../lib/shop/ballPaint.ts'),B=require('../lib/shop/ball.ts'),S=require('../lib/saves/snapshot.ts');

let seed=1;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const COLS=[[230,30,40],[20,90,240],[255,210,0],[0,170,70],[255,120,0],[140,20,200],[0,0,0],[255,255,255],[255,105,180],[0,190,200]];
const dir=()=>{const z=rnd()*2-1,a=rnd()*6.283,r=Math.sqrt(1-z*z);return [r*Math.cos(a),z,r*Math.sin(a)];};
/** A full-size painter (1024×512, saved at 512×256) with n wandering strokes; markers too unless brushOnly. */
function paint(n,brushOnly){seed=11+n*7;const p=P.createPainter();
 for(let s=0;s<n;s++){let d=dir();
  p.begin({tool:!brushOnly&&rnd()<.25?'marker':'brush',rgb:COLS[s%COLS.length],size:P.BRUSH_SIZES[Math.floor(rnd()*3)],sym:'off',right:[1,0,0],up:[0,1,0]},d);
  for(let k=0;k<12;k++){d=[d[0]+(rnd()-.5)*.15,d[1]+(rnd()-.5)*.15,d[2]+(rnd()-.5)*.15];const l=Math.hypot(...d);d=d.map(x=>x/l);p.to(d);}p.end();}
 return p;}
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
// A document stub for encodeDrawing: a canvas that can't write WebP (like iPhone Safari) and records what it was asked.
const asked=[];const doc={createElement:()=>({width:0,height:0,getContext:()=>({putImageData(){}}),toDataURL:t=>{asked.push(t);return 'data:image/png;base64,AAAA';}})};
global.ImageData=class{constructor(d,w,h){this.data=d;this.width=w;this.height=h;}};

(async()=>{
// 1. Round trips: 8/25/60/100 strokes at full 512×256, under the cap, decode = the quantised raster, re-encode is stable.
const sizes={};
for(const n of [8,25,60,100])for(const brushOnly of [true,false]){
 const p=paint(n,brushOnly),half=p.half();assert.equal(half.length,512*256*4);
 const url=P.encodeDrawing(p,doc);assert.ok(C.isFiDraw(url),n+' strokes save as fi-draw');assert.ok(B.isDrawUrl(url),'a valid stored drawing');
 assert.ok(url.length<=B.DRAW_MAX_CHARS,`${n} strokes: ${url.length} ≤ ${B.DRAW_MAX_CHARS}`);if(!brushOnly)sizes[n]=url.length;
 const parts=C.parseFiDraw(url);assert.equal(parts.w,512,'full resolution');assert.equal(parts.h,256);
 const a=C.decodeFiDrawSync(url),b=await C.decodeFiDraw(url);assert.ok(a&&b);assert.ok(same(a.px,b.px),'DecompressionStream and the JS inflate agree');
 // Every pixel keeps its alpha level; opaque pixels painted in a brush colour keep that exact colour.
 let opaque=0;
 for(let i=0;i<512*256;i++){const al=half[i*4+3],lv=al<32?0:al<96?1:al<192?2:3;assert.equal(a.px[i*4+3],C.FI_ALPHA[lv]);
  if(brushOnly&&al===255){const rgb=[half[i*4],half[i*4+1],half[i*4+2]];if(COLS.some(c=>same(c,rgb))){opaque++;assert.deepEqual([a.px[i*4],a.px[i*4+1],a.px[i*4+2]],rgb);}}}
 if(brushOnly)assert.ok(opaque>2000,'plenty of solid ink checked');
 const again=C.decodeFiDrawSync(C.encodeFiDraw(a.px,512,256));assert.ok(same(again.px,a.px),n+' strokes: decode(encode(decoded)) is identical');
 // Back into the studio: painter size, the same picture.
 const full=await P.decodeDrawing(url,1024,512,doc);assert.equal(full.length,1024*512*4);
 const q=P.createPainter();q.load(full);assert.ok(!q.empty);
 let diff=0;const h2=q.half();for(let i=3;i<h2.length;i+=4)diff+=Math.abs(h2[i]-a.px[i]);assert.ok(diff/(512*256)<3,'reloaded drawing matches ('+(diff/(512*256)).toFixed(2)+')');}
assert.deepEqual(asked,[],'nothing fell back to canvas encoding (same on iPhone as on Chrome)');
console.log(`PASS fi-draw round trips at 512×256: 8/25/60/100 strokes = ${[8,25,60,100].map(n=>sizes[n]).join('/')} chars (cap ${B.DRAW_MAX_CHARS})`);

// 1b. Too busy for 512×256: tries WebP (here a Safari-like canvas that can't), then fi-draw at 384×192 / 256×128, else null.
{const p=P.createPainter(),px=new Uint8ClampedArray(1024*512*4);
 seed=5;const blk=Array.from({length:74*147},()=>COLS[rnd()*COLS.length|0]);
 for(let y=0;y<512;y++)for(let x=0;x<1024;x++){const c=blk[Math.floor(y/7)*147+Math.floor(x/7)],o=(y*1024+x)*4;px[o]=c[0];px[o+1]=c[1];px[o+2]=c[2];px[o+3]=255;}
 p.load(px);asked.length=0;const url=P.encodeDrawing(p,doc);assert.deepEqual(asked,['image/webp'],'WebP tried once, PNG never');
 assert.ok(url===null||(C.isFiDraw(url)&&url.length<=B.DRAW_MAX_CHARS&&C.parseFiDraw(url).w<512),'a smaller fi-draw or nothing');
 console.log('PASS too-busy ladder: '+(url?C.parseFiDraw(url).w+'×'+C.parseFiDraw(url).h+' fi-draw':'null (too busy)'));}

// 2. The deflate is standard: zlib inflates ours; ours inflates zlib's (dynamic, fixed and stored blocks).
{const p=paint(25,false),q=C.quantise(p.half(),512,256);const z=C.deflateRaw(q.idx);assert.ok(zlib.inflateRawSync(Buffer.from(z)).equals(Buffer.from(q.idx)));
 const rand=new Uint8Array(5000).map(()=>rnd()*256|0),text=Buffer.from('ball '.repeat(3000)+'goal!');
 for(const src of [q.idx,rand,text,new Uint8Array(1),new Uint8Array(70000)]){
  assert.ok(zlib.inflateRawSync(Buffer.from(C.deflateRaw(src))).equals(Buffer.from(src)),'zlib reads ours');
  for(const o of [{level:9},{level:0},{strategy:zlib.constants.Z_FIXED}])assert.ok(same(C.inflateRaw(new Uint8Array(zlib.deflateRawSync(src,o)),src.length),src),'ours reads zlib '+JSON.stringify(o));}
 assert.throws(()=>C.inflateRaw(new Uint8Array(zlib.deflateRawSync(text)),100),'output is capped');
 console.log('PASS deflate/inflate interop with zlib (dynamic, fixed, stored), output cap');}

// 3. Old saves: WebP/PNG data URLs stay valid and decode through <img> + canvas exactly as before.
{const webp='data:image/webp;base64,'+'A'.repeat(400),png='data:image/png;base64,'+'B'.repeat(400);assert.ok(B.isDrawUrl(webp)&&B.isDrawUrl(png));
 const drawn=[];const pix=new Uint8ClampedArray(64*32*4).fill(7);
 global.Image=class{set src(u){drawn.push(u);setTimeout(()=>{this.naturalWidth=512;this.naturalHeight=256;this.onload();});}};
 const odoc={createElement:()=>({width:0,height:0,getContext:()=>({drawImage(img,x,y,w,h){assert.equal(w,64);assert.equal(h,32);},getImageData:()=>({data:pix})})})};
 for(const u of [webp,png])assert.equal(await P.decodeDrawing(u,64,32,odoc),pix,'old format → <img> path');
 assert.deepEqual(drawn,[webp,png]);
 global.Image=class{set src(u){throw new Error('fi-draw must not use <img>');}};
 const fi=P.encodeDrawing(paint(8,true),doc);assert.equal((await P.decodeDrawing(fi,64,32,odoc)).length,64*32*4);
 delete global.Image;console.log('PASS old WebP/PNG drawings decode through <img> as before; fi-draw decodes in JS');}

// 4. Corrupt, foreign or newer data: never throws, the ball just has no drawing.
{const url=P.encodeDrawing(paint(25,false),doc),body=url.slice(C.FI_DRAW_PREFIX.length);
 const bytes=Buffer.from(body,'base64'),mk=b=>C.FI_DRAW_PREFIX+Buffer.from(b).toString('base64');
 const v2=Buffer.from(bytes);v2[0]=2;assert.equal(C.parseFiDraw(mk(v2)),null,'a newer version byte is not read (forward compatible)');
 assert.equal(await P.decodeDrawing(mk(v2),1024,512,doc),null);
 const badPal=Buffer.from(bytes);badPal[5]=1;assert.equal(C.decodeFiDrawSync(mk(badPal)),null,'palette index out of range');
 const badSize=Buffer.from(bytes);badSize[1]=0;badSize[2]=8;assert.equal(C.decodeFiDrawSync(mk(badSize)),null,'2048 wide');
 const cases=[mk(bytes.subarray(0,bytes.length>>1)),mk(bytes.subarray(0,6)),C.FI_DRAW_PREFIX,C.FI_DRAW_PREFIX+'@@@@',C.FI_DRAW_PREFIX+'QUJD',url+'AAAA',mk(Buffer.concat([bytes.subarray(0,40),Buffer.alloc(200,255)]))];
 for(let k=0;k<300;k++){const b=Buffer.from(bytes);for(let j=0;j<4;j++)b[6+Math.floor(rnd()*(b.length-6))]=rnd()*256|0;cases.push(mk(b));}
 let nulls=0;for(const c of cases){let r;assert.doesNotThrow(()=>{r=C.decodeFiDrawSync(c);});if(!r)nulls++;const a=await P.decodeDrawing(c,1024,512,doc);assert.ok(a===null||a.length===1024*512*4);}
 assert.ok(nulls>=7,'the broken ones come back as no drawing');
 for(const bad of ['data:application/x-fi-draw;base64,AA<script>','data:application/x-fi-draws;base64,AAAA',C.FI_DRAW_PREFIX+'A'.repeat(B.DRAW_MAX_CHARS)])assert.ok(!B.isDrawUrl(bad));
 assert.equal(await P.decodeDrawing('data:application/x-fi-draw;base64,AA<script>',8,4,doc),null);
 const DS=global.DecompressionStream;assert.equal(typeof DS,'function','Node 20 has DecompressionStream');delete global.DecompressionStream;
 const js=await C.decodeFiDraw(url);global.DecompressionStream=DS;assert.ok(js&&same(js.px,C.decodeFiDrawSync(url).px),'no DecompressionStream: the JS inflate');
 console.log(`PASS corrupt input safe (${cases.length} cases, no throw), version byte checked, validator rejects junk`);}

// 5. Storage: the ball store keeps a fi-draw drawing, and it survives a save snapshot round trip (cloud/local).
{const mem={};const kv=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),get length(){return m.size;},key:i=>[...m.keys()][i]??null};};
 const url=P.encodeDrawing(paint(60,false),doc),id=B.artHash(url);mem[id]=url;
 const a=kv(),d=B.validateBall({...B.DEFAULT_BALL,art:{...B.DEFAULT_BALL.art,id}});assert.equal(d.art.id,id);
 assert.ok(B.saveBallCurrent(d,a,mem));assert.equal(B.artUrl(id,B.loadBallStore(a)),url,'the store keeps it');
 const snap=S.buildSnapshot(a,Date.now());assert.ok(snap.keys[B.BALL_KEY].includes(C.FI_DRAW_PREFIX));
 const back=S.readSnapshot(JSON.parse(JSON.stringify(snap)));assert.ok(back.ok);const b=kv();S.applySnapshot(b,back.snapshot);
 const st=B.loadBallStore(b);assert.equal(st.current.art.id,id);assert.equal(B.artUrl(id,st),url,'the drawing survives the snapshot');
 assert.ok(B.loadBallStore(b).current.art.id===id&&(await P.decodeDrawing(B.artUrl(id,st),1024,512,doc))!==null);
 console.log('PASS ball store + save snapshot keep a fi-draw drawing');}
})().catch(e=>{console.error(e);process.exit(1);});
