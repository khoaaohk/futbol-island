// Verify generated clips describe the current scripts and publish their timing.
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
cp.execFileSync(process.execPath,['scripts/export-path-narration.cjs']);
const films=JSON.parse(fs.readFileSync('/tmp/futbol-path-narration.json','utf8')),timings={};
for(const film of films){
 const folder=`public/stories/narration/${film.format}/${film.id}`;
 const meta=JSON.parse(fs.readFileSync(`${folder}/timing.json`,'utf8'));
 assert.equal(meta.voice,'Kokoro af_heart');assert.equal(meta.clipDurations.length,6);
 const base=film.beats.map((beat,i)=>{
  assert.equal(meta.scriptSha256[i],crypto.createHash('sha256').update(beat.narration).digest('hex'),`${film.id}: stale narration`);
  const file='public'+beat.audio.split('?')[0];
  const actual=Number(cp.execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',file],{encoding:'utf8'}));
  assert.ok(actual>3&&actual<18,`${film.id}: invalid duration`);
  assert.ok(Math.abs(actual-meta.clipDurations[i])<.02,`${film.id}: stale metadata`);
  return actual+.3;
 });
 const reflection=Math.max(0,60-base.reduce((a,b)=>a+b,0))/6;
 timings[film.id]=base.map(n=>Math.round((n+reflection)*1000)/1000);
 if(reflection>0)timings[film.id][5]=Math.round((60-timings[film.id].slice(0,5).reduce((a,b)=>a+b,0))*1000)/1000;
 console.log(`PASS ${film.id}: ${timings[film.id].reduce((a,b)=>a+b,0).toFixed(1)}s / six verified clips`);
}
if(process.argv.includes('--write'))fs.writeFileSync('lib/paths/riso/data/narrationTiming.json',JSON.stringify(timings,null,2)+'\n');
