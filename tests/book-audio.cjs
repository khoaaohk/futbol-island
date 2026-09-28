const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const listeners=new Map(),contexts=[];let now=1000;
class Context{
 constructor(){this.state='suspended';this.destination={};this.sources=[];contexts.push(this);}
 createBuffer(_,n,rate){const samples=new Float32Array(n);return{getChannelData:()=>samples,duration:n/rate};}
 createBufferSource(){const source={connect(){},disconnect(){this.disconnected=true},start(){this.started=true},stop(){this.stopped=true},onended:null};this.sources.push(source);return source;}
 createGain(){return{gain:{value:0},connect(){},disconnect(){}};}
 async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';}
}
const doc={hidden:false,addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:(k,f)=>{if(listeners.get(k)===f)listeners.delete(k);}};
const out={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/books/bookAudio.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:out,window:{AudioContext:Context},document:doc,performance:{now:()=>now}});
(async()=>{
 const audio=out.createBookAudio();assert.equal(contexts.length,0,'mount must not allocate audio');await audio.play(0,'open');assert.equal(contexts.length,1);assert.equal(audio.inspect().voices,1);assert.equal(contexts[0].sources[0].buffer.duration,13);
 await audio.play(1,'turn');assert.equal(audio.inspect().voices,2);assert(contexts[0].sources[0].stopped);await audio.play(1,'action');assert.equal(audio.inspect().voices,3);await audio.play(1,'action');assert.equal(audio.inspect().voices,3,'repeat throttled');
 now+=300;await audio.play(1,'action');now+=300;await audio.play(1,'action');assert.equal(audio.inspect().voices,4,'bounded voices');
 audio.setMuted(true);assert.equal(audio.inspect().voices,0);assert.equal(contexts[0].state,'suspended');await audio.play(2,'open');assert.equal(audio.inspect().voices,0);
 audio.setMuted(false);await audio.play(2,'open');doc.hidden=true;listeners.get('visibilitychange')();assert.equal(audio.inspect().voices,0);await audio.play(3,'turn');assert.equal(audio.inspect().voices,0);doc.hidden=false;listeners.get('visibilitychange')();assert.equal(audio.inspect().voices,0,'visibility does not autoplay');
 await audio.play(3,'open');const active=contexts[0].sources.at(-1);active.onended();assert.equal(audio.inspect().voices,0);assert.equal(contexts[0].state,'suspended','finite score sleeps');audio.dispose();assert.equal(contexts[0].state,'closed');assert.equal(listeners.size,0);await audio.play(0,'open');assert.equal(contexts.length,1);
 console.log('PASS book audio: lazy context, finite score, bounded voices, mute/hidden/end sleep and disposal');
})().catch(e=>{console.error(e);process.exit(1)});
