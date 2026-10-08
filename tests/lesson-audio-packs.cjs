// Lesson voice packs (Oct 7 2026): one m4a per lesson × coach instead of one request per spoken line.
// 1. every voiced lesson line maps into its pack (or, for a wrong-answer explanation, to its own existing file)
// 2. the map's start/end match each line's duration and the pack really holds that line's AAC packets at that time
// 3. packs are deterministic, named by their bytes, and the name changes when any line's content changes
// 4. the player seeks inside the pack, stops at the line's end, and falls back to the single-line file
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript'),assert=require('node:assert/strict');
const packs=require('../scripts/build-lesson-packs.cjs');
const ROOT=path.resolve(__dirname,'..'),PUB=path.join(ROOT,'public'),RATE=24000,FRAME=1024;

// ---------------------------------------------------------------- 1 + 2: data, coverage, offsets
let packCount=0,lineCount=0,choiceOnly=0,packBytes=0;
const parsedLines=new Map(),readLine=src=>{if(!parsedLines.has(src))parsedLines.set(src,packs.readM4a(path.join(PUB,src)));return parsedLines.get(src);};
let mapBytes=0;
for(const format of packs.FORMATS){
 const maps=Object.fromEntries(packs.COACHES.map(c=>{const f=path.join(PUB,packs.indexPath(c,format));assert.ok(fs.existsSync(f),`${f} missing`);mapBytes+=fs.statSync(f).size;return [c,JSON.parse(fs.readFileSync(f,'utf8'))];}));
 const catalog=JSON.parse(fs.readFileSync(path.join(PUB,'lessons',`${format}.json`),'utf8'));
 assert.deepEqual(Object.keys(maps.kokoro_af_bella).sort(),catalog.filter(l=>packs.packLines(l,'kokoro_af_bella').length).map(l=>l.id).sort(),`${format}: map lessons = catalog lessons`);
 for(const lesson of catalog){
  assert.equal(lesson.voicePack,undefined,'maps stay out of the lesson catalogs');
  for(const coach of packs.COACHES){
   const lines=packs.packLines(lesson,coach),entry=maps[coach][lesson.id];
   if(!lines.length){assert.equal(entry,undefined);continue;}
   assert.ok(entry,`${lesson.id}/${coach}: no pack (run node scripts/build-lesson-packs.cjs)`);
   assert.match(entry.src,new RegExp(`^/voice/packs/${coach}/${lesson.id}-[0-9a-f]{12}\\.m4a$`));
   const file=path.join(PUB,entry.src);assert.ok(fs.existsSync(file),`${entry.src} missing`);
   const bytes=fs.readFileSync(file);packBytes+=bytes.length;
   assert.equal(entry.src.slice(-16,-4),crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),`${entry.src}: name is not its content hash`);
   // the AAC 'roll' sample group (as in ffmpeg's line files): without it WebKit played every pack line 88 ms (2112 samples) early
   assert.ok(bytes.includes(Buffer.from('7367706401000000726f6c6c00000002','hex'))&&bytes.includes(Buffer.from('73626770','hex')),`${entry.src}: no roll sample group`);
   assert.deepEqual(Object.keys(entry.lines).sort(),lines.map(c=>packs.lineKey(c.src)).sort(),`${lesson.id}/${coach}: pack lines out of date`);
   // every voiced clip of the lesson: steps, prompts and explanations are in the pack; wrong-answer explanations stay single files
   for(const clip of packs.allClips(lesson,coach)){
    const span=entry.lines[packs.lineKey(clip.src)];
    if(clip.kind==='choice'&&!span){assert.ok(fs.existsSync(path.join(PUB,clip.src)),`${clip.src} missing`);choiceOnly++;continue;}
    assert.ok(span,`${lesson.id}/${coach}: ${clip.kind} line ${clip.src} is not in the pack`);
    assert.ok(Math.abs(span[1]-span[0]-clip.duration)<.01,`${lesson.id}/${coach}: ${clip.src} lasts ${clip.duration}s, pack says ${span[1]-span[0]}`);
   }
   // the pack's packets: line i's packets byte for byte at the frame its map start says, silent gaps of >= 0.5 s between
   const pack=packs.readM4a(file);let at=0,prevEnd=-Infinity;
   lines.forEach((clip,i)=>{
    const one=readLine(clip.src),[start,end]=entry.lines[packs.lineKey(clip.src)];
    if(i)at+=packs.GAP_FRAMES;
    assert.ok(Math.abs(start-(at*FRAME+one.priming-pack.priming)/RATE)<6e-4,`${entry.src}: line ${i} start`);// map is to the ms
    assert.ok(Math.abs(end-start-one.content/RATE)<1.1e-3,`${entry.src}: line ${i} length`);
    for(let k=0;k<one.packets.length;k++)if(!pack.packets[at+k].equals(one.packets[k]))assert.fail(`${entry.src}: line ${i} packet ${k} differs`);
    assert.ok(start-prevEnd>=.5,`${entry.src}: gap before line ${i} is ${start-prevEnd}s`);
    prevEnd=end;at+=one.packets.length;
   });
   assert.ok(pack.priming+pack.content<=pack.packets.length*FRAME&&pack.content/RATE>=prevEnd,`${entry.src}: edit list ends before the last line`);
   packCount++;lineCount+=lines.length;
  }
 }
}
assert.equal(packCount,384,'one pack per lesson × coach');
console.log(`PASS ${packCount} packs, ${lineCount} lines mapped (offsets = durations, packets byte-identical), ${choiceOnly} wrong-answer lines left as single files, ${packBytes} bytes + ${mapBytes} bytes of maps`);

// ---------------------------------------------------------------- 3: determinism, content-hashed names, up to date
{
 const lesson=JSON.parse(fs.readFileSync(path.join(PUB,'lessons','futsal.json'),'utf8'))[0],coach='kokoro_af_bella',lines=packs.packLines(lesson,coach);
 const a=packs.buildPack(lesson.id,coach,lines),b=packs.buildPack(lesson.id,coach,lines);
 assert.ok(a.bytes.equals(b.bytes),'same lines → same bytes');assert.equal(a.src,b.src);assert.equal(a.src,JSON.parse(fs.readFileSync(path.join(PUB,packs.indexPath(coach,'futsal')),'utf8'))[lesson.id].src,'committed pack = rebuilt pack');
 // one byte of one packet of the third line changes (a re-voiced line under the same name) → a new pack name
 const edited=src=>{const p=packs.readM4a(path.join(PUB,src));if(src!==lines[2].src)return p;const q=p.packets.slice();const pk=Buffer.from(q[5]);pk[pk.length-1]^=1;q[5]=pk;return {...p,packets:q};};
 const c=packs.buildPack(lesson.id,coach,lines,edited);assert.notEqual(c.src,a.src,'changed content → changed name');assert.deepEqual(c.lines,a.lines,'same timing');
 // a line removed → new name and new offsets
 const d=packs.buildPack(lesson.id,coach,lines.slice(1));assert.notEqual(d.src,a.src);assert.equal(d.lines[packs.lineKey(lines[1].src)][0],0);
 // the committed packs and maps are exactly what the build script produces now (no writes)
 const {changes}=packs.build({write:false,log:()=>{}});assert.deepEqual(changes,[],'packs out of date: run node scripts/build-lesson-packs.cjs');
 console.log('PASS packs are deterministic, named by sha256 of their bytes (a changed line renames the pack), and up to date');
}

// ---------------------------------------------------------------- 4: player — seek, stop, fallback
let now=0;const timers=[];
const setTimeout_=(fn,ms)=>{const t={at:now+ms,fn};timers.push(t);return t;},clearTimeout_=t=>{const i=timers.indexOf(t);if(i>=0)timers.splice(i,1);};
const advance=ms=>{const end=now+ms;for(;;){timers.sort((a,b)=>a.at-b.at);const t=timers[0];if(!t||t.at>end)break;timers.shift();now=t.at;t.fn();}now=end;};
class FakeAudio{
 constructor(src=''){this.attrs=new Map(src?[['src',src]]:[]);this.currentSrc=src;this.paused=true;this.ended=false;this.seeking=false;this.readyState=src?4:0;this._t=0;this.playbackRate=1;this.on=new Map();this.loads=[];this.seeks=[];}
 get src(){return this.attrs.get('src')??'';}set src(v){this.attrs.set('src',v);this.currentSrc=v;this.readyState=0;this._t=0;this.loads.push(v);}
 get currentTime(){return this._t;}set currentTime(v){this._t=v;if(this.readyState<1)return;/* HAVE_NOTHING: the default start position (spec) */this.seeks.push(v);this.fire('seeked');}
 getAttribute(k){return this.attrs.get(k)??null;}removeAttribute(k){this.attrs.delete(k);}load(){this.currentSrc=this.attrs.get('src')??'';}
 play(){this.paused=false;this.fire('play');if(!this.paused&&this.readyState>=1)this.fire('playing');return Promise.resolve();}
 pause(){if(this.paused)return;this.paused=true;this.fire('pause');}
 addEventListener(k,f,o){if(!this.on.has(k))this.on.set(k,[]);this.on.get(k).push({f,once:!!o?.once});}
 removeEventListener(k,f){const l=this.on.get(k);if(l)this.on.set(k,l.filter(x=>x.f!==f));}
 fire(k){for(const x of [...(this.on.get(k)??[])]){if(x.once)this.removeEventListener(k,x.f);x.f({currentTarget:this,type:k});}}
 metadata(){this.readyState=4;this.fire('loadedmetadata');}
 /** media clock runs for `s` seconds of playback */
 run(s){this._t+=s;this.fire('timeupdate');}
}
// a tiny hooks runtime: one component, effects run after render in order, state setters re-render synchronously
function mount(hook){
 const slots=[];let props,result,dirty=false,busy=false;
 const render=()=>{let i=0;const effects=[];
  const R={useRef:v=>{const k=i++;if(!slots[k])slots[k]={current:v};return slots[k];},
   // like React: an unchanged value does not re-render; updates during render/effects are flushed after them
   useState:v=>{const k=i++;if(!slots[k])slots[k]={v,set:n=>{const next=typeof n==='function'?n(slots[k].v):n;if(Object.is(next,slots[k].v))return;slots[k].v=next;dirty=true;if(!busy)flush();}};return [slots[k].v,slots[k].set];},
   useCallback:f=>(i++,f),
   useEffect:(fn,deps)=>{const k=i++,old=slots[k];if(!old||!deps||deps.some((d,j)=>!Object.is(d,old.deps[j]))){slots[k]={deps,cleanup:old?.cleanup};effects.push(()=>{slots[k].cleanup?.();slots[k].cleanup=fn();});}}};
  react.current=R;result=hook(props);for(const e of effects)e();};
 const flush=()=>{busy=true;try{do{dirty=false;render();}while(dirty);}finally{busy=false;}};
 return {update(p){props=p;dirty=true;flush();return result;},get result(){return result;},unmount(){for(const s of slots)s?.cleanup?.();}};
}
const react={current:null};
const reactShim={useRef:v=>react.current.useRef(v),useState:v=>react.current.useState(v),useCallback:(f,d)=>react.current.useCallback(f,d),useEffect:(f,d)=>react.current.useEffect(f,d)};
const docListeners=new Map(),doc={hidden:false,addEventListener:(k,f)=>docListeners.set(k,f),removeEventListener:k=>docListeners.delete(k)};
const m={exports:{}};
// fetch of the per-format maps: held until the test answers it
const fetches=[];const fetch_=url=>new Promise(resolve=>fetches.push({url,ok:map=>resolve({ok:true,json:()=>Promise.resolve(map)}),missing:()=>resolve({ok:false,json:()=>Promise.reject(new Error('404'))})}));
const settle=()=>new Promise(r=>setImmediate(r));
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(ROOT,'lib/town/useLessonVoice.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {module:m,exports:m.exports,Math,Object,Set,Map,Promise,setTimeout:setTimeout_,clearTimeout:clearTimeout_,fetch:fetch_,window:{},document:doc,Audio:FakeAudio,
  require:n=>({react:reactShim,'../audio/islandNarration':{registerIslandNarration:()=>()=>{},islandNarrationAllowed:()=>true},'../media/mediaUrl':{mediaUrl:p=>p}})[n]});
const voice=m.exports;
const pack={src:'/voice/packs/kokoro_af_bella/l1-0123456789ab.m4a',lines:{'aaaaaaaa':[0,2],'bbbbbbbb':[2.6,5.1]}};
const clipA={kokoro_af_bella:{src:'/voice/kokoro_af_bella/aaaaaaaaaaaaaaaa.m4a',duration:2}};
const clipB={kokoro_af_bella:{src:'/voice/kokoro_af_bella/bbbbbbbbbbbbbbbb.m4a',duration:2.5}};
const clipWrong={kokoro_af_bella:{src:'/voice/kokoro_af_bella/cccccccccccccccc.m4a',duration:1.5}};
// pure lookup
assert.deepEqual({...voice.packSegment(pack,clipB.kokoro_af_bella)},{src:pack.src,start:2.6,end:5.1});
assert.equal(voice.packSegment(pack,clipWrong.kokoro_af_bella),null,'a line the pack lacks → its own file');
assert.equal(voice.packSegment(pack,{...clipB.kokoro_af_bella,duration:2.7}),null,'a re-voiced line (new duration) → its own file');
assert.equal(voice.packSegment(undefined,clipB.kokoro_af_bella),null,'no pack → its own file');
(async()=>{
const a=voice.primeLessonVoice();a.metadata();a.pause();
const session={current:{voicePending:false,playing:true,quiz:false}};
const props=(clips,id,extra={})=>({clips,identity:id,playing:true,quiz:false,enabled:true,coach:'kokoro_af_bella',paused:false,format:'futsal',lesson:'l1',...extra});
const run=p=>voice.useLessonVoice(session,p.clips,p.identity,p.playing,p.quiz,p.enabled,p.coach,p.paused,p.format,p.lesson);
const h=mount(run);
// the lesson screen asks for the coach's map once; the first line waits for it (no file is fetched meanwhile)
h.update(props(clipA,'l1:s0'));
assert.deepEqual(fetches.map(f=>f.url),['/voice/packs/kokoro_af_bella/futsal.json'],'one map request for the format');
assert.ok(!a.src.includes('/voice/'),'nothing loads while the map is on its way');assert.equal(a.paused,true);assert.equal(session.current.voicePending,true,'the step waits for its line');
fetches[0].ok({l1:pack});await settle();
// line A: the pack is loaded once and played from its start; the line stops itself at its end
assert.equal(a.src,pack.src,'the element loads the pack');const seeks=a.seeks.length;assert.equal(a.paused,false,'play is requested at once, as before');
a.metadata();assert.equal(a.seeks.length,seeks+1,'seeks once metadata is in');assert.equal(a.currentTime,0,'line A starts the pack');a.fire('playing');
assert.equal(session.current.voicePending,true);
a.run(1.2);advance(1200);assert.equal(a.paused,false,'still speaking at 1.2 s');
a.run(.8);advance(800);assert.equal(a.paused,true,'stops at the line end');assert.equal(session.current.voicePending,false,'line counts as finished');
// line B: same pack, no reload, seek to 50 ms before its start
const loads=a.loads.length;h.update(props(clipB,'l1:s1'));
assert.equal(a.loads.length,loads,'no new request for the next line');assert.ok(Math.abs(a.currentTime-(2.6-voice.PACK_LEAD))<1e-9,'seeks to line B');
a.fire('playing');assert.equal(session.current.voicePending,true);
a.run(1);advance(1000);a.pause();assert.equal(timers.length,0,'pausing clears the stop timer (no polling)');
a.play();a.run(1.55);advance(1600);assert.equal(a.paused,true,'resumed line still stops at its end');assert.ok(Math.abs(a.currentTime-5.1)<.03);
// a wrong-answer explanation is not in the pack: its own file
h.update(props(clipWrong,'l1:q0:feedback',{quiz:true}));assert.equal(a.src,clipWrong.kokoro_af_bella.src,'line outside the pack plays its own file');
// back to a pack line, then the pack fails to load: the same line falls back to its own file, and so does the rest
h.update(props(clipA,'l1:q1:prompt',{quiz:true}));assert.equal(a.src,pack.src);
a.fire('error');assert.equal(a.src,clipA.kokoro_af_bella.src,'failed pack → the line file');assert.ok(voice.failedPacks.has(pack.src));
h.update(props(clipB,'l1:q1:feedback',{quiz:true}));assert.equal(a.src,clipB.kokoro_af_bella.src,'later lines skip the failed pack');
voice.failedPacks.clear();
// voice off: nothing is fetched
const before=a.loads.length;h.update(props(clipA,'l1:s5',{enabled:false}));assert.equal(a.loads.length,before,'voice off loads nothing');assert.equal(session.current.voicePending,false);
h.unmount();assert.equal(a.getAttribute('src'),null,'closing the lesson unloads the audio');
// a format whose map is missing (404): its lines play their own files, exactly the single-file path as before
const h2=mount(run);h2.update(props(clipB,'l2:s0',{format:'7v7',lesson:'l2'}));assert.equal(fetches.at(-1).url,'/voice/packs/kokoro_af_bella/7v7.json');
fetches.at(-1).missing();await settle();assert.equal(a.src,clipB.kokoro_af_bella.src,'no map → line file');assert.equal(a.currentTime,0);h2.unmount();
// a map that never arrives: the first line waits at most PACK_INDEX_WAIT_MS, then the lesson uses line files (a late map is ignored)
const h3=mount(run);h3.update(props(clipA,'l3:s0',{format:'9v9',lesson:'l3'}));assert.ok(!(a.getAttribute('src')??'').includes('/voice/'));
advance(voice.PACK_INDEX_WAIT_MS);assert.equal(a.src,clipA.kokoro_af_bella.src,'gives up waiting → line file');
fetches.at(-1).ok({l3:pack});await settle();assert.equal(a.src,clipA.kokoro_af_bella.src,'a late map does not restart the line');
h3.update(props(clipB,'l3:s1',{format:'9v9',lesson:'l3'}));assert.equal(a.src,clipB.kokoro_af_bella.src,'…nor switch this lesson to the pack');h3.unmount();
// a second lesson of a format already loaded starts on its pack at once, with no new map request
const before2=fetches.length;const h4=mount(run);h4.update(props(clipB,'l1:s1'));assert.equal(fetches.length,before2,'map cached for the page');assert.equal(a.src,pack.src);h4.unmount();
console.log('PASS player waits for the format map (≤ 2 s), seeks inside the pack, stops at the line end (timer re-armed on resume, cleared on pause), one load per lesson, and falls back to line files (missing line, changed duration, failed pack, missing or late map)');
})().catch(e=>{console.error(e);process.exit(1);});
