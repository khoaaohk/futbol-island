// Renders the EPL samples with the REAL live code: createStadiumSound() on an OfflineAudioContext host in headless Chrome,
// stepped at 10 Hz with ctx.suspend(), the recordings fetched from the worktree's public/audio/stadium/ through a route.
// usage: node scripts/stadium-crowd-audio/render-samples.cjs <worktree> <1|2|3> <out.wav> [STEM=bed|chant NORM=0]
const fs=require('fs'),path=require('path');const wt=process.argv[2],which=process.argv[3],outFile=process.argv[4];
const req=require('module').createRequire(wt+'/package.json'),ts=req('typescript'),{chromium}=req('playwright');
const files=['lib/town/shoreline.ts','lib/town/westParkLayout.ts','lib/town/stadiumMood.ts','lib/audio/stadiumSound.ts'];
let bundle='const __m={};function __req(from,id){return __m[id.replace(/^.*\\//,"")];}\n';
for(const f of files){const name=path.basename(f,'.ts');const code=ts.transpileModule(fs.readFileSync(path.join(wt,f),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;bundle+=`(function(){const exports={},module={exports};const require=id=>__req(0,id);${code}\n__m[${JSON.stringify(name)}]=module.exports;})();\n`;}
// Scenarios: ex = excitement keyframes [t, e]; chant [from, to, id]; live from `liveAt`; events: miss / goal / touches / clock.
const SC={
 // 1. a match bed with an attack build, then a near miss: "D-R-I-P" spelled, the attack builds (swell, "a-TTAAACK!"), the ball whistles past the post
 1:{T:40,seed:5,liveAt:-1,chant:[[3,40,'drip-drip-clap']],ex:[[0,.3],[13,.32],[16,.6],[19.5,.86],[21,.86],[24,.4],[40,.35]],miss:[21.2],
  touches:[[6,'intercept'],[9.5,'kick',1],[10.8,'receive'],[14,'tackle'],[17,'receive'],[19.8,'kick',0],[29,'parry'],[34,'intercept']]},
 // 2. the sung "Come on Drip F-C", then a goal (the eruption, the whistle, the PA), the song back after
 2:{T:40,seed:9,liveAt:-1,chant:[[1,40,'island-anthem']],ex:[[0,.35],[16,.35],[19,.7],[22.4,.8],[22.5,1],[30,.6],[40,.4]],goal:[22.5],touches:[[8,'intercept'],[18,'kick',0]]},
 // 3. kick-off: the pre-match hum, the match wakes (PA welcome, the kick-off whistle), "Come on you Drips!", then the period whistle
 // ole-1: the slow swaying olé: a section starts, the stands join, louder and louder over the swelling roar, the long "oooo-LÉ" into a cheer
 4:{T:41,seed:21,liveAt:-1,chant:[[1,41,'stand-up-song']],ex:[[0,.3],[41,.35]],touches:[[12,'intercept']]},
 // ole-2: the clap-along olé during an attack, then a goal, and the olé comes round again
 5:{T:41,seed:27,liveAt:-1,chant:[[1,41,'ole-ole']],ex:[[0,.32],[9,.35],[12,.62],[15.5,.86],[16.4,1],[24,.6],[41,.45]],goal:[16.4],touches:[[6,'intercept'],[10,'kick',1],[11.3,'receive'],[15.6,'kick',0]]},
 3:{T:40,seed:13,liveAt:2.5,chant:[[12,40,'lets-go']],ex:[[0,0],[2.5,.3],[20,.35],[24,.5],[26,.35],[40,.3]],clock:[[2.5,286],[40,323.5]],touches:[[13,'receive'],[16,'tackle'],[24,'kick',1],[25.3,'receive']]},
}[which];if(process.env.STEM)SC.stem=process.env.STEM;if(process.env.NORM==='0')SC.nonorm=1;
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();
 await p.route('http://stadium.local/**',r=>{const u=new URL(r.request().url());if(u.pathname.startsWith('/audio/stadium/')){const f=path.join(wt,'public',u.pathname);return fs.existsSync(f)?r.fulfill({status:200,contentType:'audio/mp4',body:fs.readFileSync(f)}):r.fulfill({status:404,body:''});}return r.fulfill({status:200,contentType:'text/html',body:'<html><body></body></html>'});});
 await p.goto('http://stadium.local/');await p.addScriptTag({content:bundle});
 const out=await p.evaluate(async(sc)=>{
  const A=__m.stadiumSound,Mo=__m.stadiumMood,STEM=sc.stem;if(STEM==='bed')A.STADIUM_MIX.chantRec=0;if(STEM==='chant')for(const k of ['bed','bedQuiet','roarRec','reactRec','goalRec','rumble','whistle','pa','react'])A.STADIUM_MIX[k]=0;const
  _u=0,L=__m.westParkLayout,S=L.STADIUM,R=44100,T=sc.T;
  const oc=new OfflineAudioContext(2,Math.round(T*R),R),master=oc.createGain();master.connect(oc.destination);
  const host={ctx:()=>oc,master:()=>master,ok:()=>true,sfxOn:()=>true,changed(){},wake(){}};
  const snd=A.createStadiumSound(host);snd.seed=sc.seed;
  Mo.resetStadiumMood();const mood=Mo.stadiumMood();
  const sim={touches:Array.from({length:8},()=>({serial:0,kind:'receive',team:'gold',height:0,other:null})),touchSerial:0,clock:0,restartKind:null};
  const frame={x:S.x+20,z:S.z+8,h:2,rx:1,rz:0,lite:false,mood,sim:null};
  const lerp=(k,t)=>{for(let i=1;i<k.length;i++)if(t<=k[i][0])return k[i-1][1]+(k[i][1]-k[i-1][1])*(t-k[i-1][0])/(k[i][0]-k[i-1][0]||1);return k[k.length-1][1];};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));const done=new Set();
  const once=(key,t,at)=>{if(t>=at&&!done.has(key)){done.add(key);return true;}return false;};
  async function tick(t){
   const live=t>=sc.liveAt;mood.live=live;mood.exhibition=false;frame.sim=live?sim:null;
   const ch=live?sc.chant.find(c=>t>=c[0]&&t<c[1]):null;const def=ch?Mo.CHANTS.find(c=>c.id===ch[2]):null;
   mood.chant=def?def.id:null;mood.phase=def?(def.slow?'slow-song':'chant'):'quiet';mood.bpm=def?def.bpm:Mo.QUIET_BPM;mood.phaseLeft=ch?ch[1]-t:10;mood.beat+=.1*mood.bpm/60;
   mood.excitement=live?lerp(sc.ex,t):0;mood.sinceGoal+=.1;mood.sinceNearMiss+=.1;
   for(const g of sc.goal||[])if(once('g'+g,t,g)){mood.sinceGoal=0;mood.excitement=1;}
   for(const m of sc.miss||[])if(once('m'+m,t,m))mood.sinceNearMiss=0;
   for(const [at,kind,h] of sc.touches||[])if(once('t'+at,t,at)){sim.touchSerial++;Object.assign(sim.touches[(sim.touchSerial-1)%8],{serial:sim.touchSerial,kind,team:'gold',height:h?1:0,other:kind==='kick'&&!h?null:'x'});}
   if(sc.clock)sim.clock=lerp(sc.clock,t);
   snd.update(.1,frame);
   await sleep(45);
  }
  mood.live=sc.liveAt<0;frame.sim=mood.live?sim:null;
  // t = 0: build the bank (fetch + decode the recordings, render the synth beds) while the clock stands still
  const ready=(async()=>{for(let i=0;i<600&&!snd.ready;i++){snd.update(.1,frame);await sleep(25);}})();
  for(let i=0;i<T*10;i++){const t=i/10;oc.suspend(t).then(async()=>{if(i===0)await ready;await tick(t);oc.resume();});}
  const res=await oc.startRendering(),Lc=res.getChannelData(0),Rc=res.getChannelData(1);
  let pk=0,nan=-1,nans=0;for(let i=0;i<Lc.length;i++){if(Number.isNaN(Lc[i])||Number.isNaN(Rc[i])){if(nan<0)nan=i/R;nans++;Lc[i]=0;Rc[i]=0;continue;}pk=Math.max(pk,Math.abs(Lc[i]),Math.abs(Rc[i]));}const k=sc.nonorm?1:pk>0?.89/pk:1;
  const fo=Math.round(1.5*R);for(let i=0;i<fo;i++){const w=i/fo;Lc[Lc.length-1-i]*=w;Rc[Rc.length-1-i]*=w;}
  const buf=new DataView(new ArrayBuffer(44+Lc.length*4)),w=(o,str)=>{for(let i=0;i<str.length;i++)buf.setUint8(o+i,str.charCodeAt(i));};
  w(0,'RIFF');buf.setUint32(4,36+Lc.length*4,true);w(8,'WAVEfmt ');buf.setUint32(16,16,true);buf.setUint16(20,1,true);buf.setUint16(22,2,true);buf.setUint32(24,R,true);buf.setUint32(28,R*4,true);buf.setUint16(32,4,true);buf.setUint16(34,16,true);w(36,'data');buf.setUint32(40,Lc.length*4,true);
  for(let i=0;i<Lc.length;i++){buf.setInt16(44+i*4,Math.max(-1,Math.min(1,Lc[i]*k))*32767,true);buf.setInt16(46+i*4,Math.max(-1,Math.min(1,Rc[i]*k))*32767,true);}
  const u=new Uint8Array(buf.buffer);let bin='';for(let i=0;i<u.length;i+=32768)bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768));
  const d=snd.debug;snd.dispose();
  return {wav:btoa(bin),peak:pk,debug:{nan,nans,recordings:d.recordings,errors:d.recordingErrors,real:d.real,phrases:d.phrases,skipped:d.skipped,steps:d.steps.join(','),goals:d.goals,whistles:d.whistles,pa:d.pa,periods:d.periods,reactions:d.reactions,chantStarts:d.chantStarts,oleLines:d.oleLines,oleEnds:d.oleEnds}};
 },SC);
 fs.writeFileSync(outFile,Buffer.from(out.wav,'base64'));console.log(outFile,'peak',out.peak.toFixed(3),JSON.stringify(out.debug));await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
