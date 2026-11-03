// Upload the /learn clips to the Cloudflare R2 bucket `futbol-media` (served by multiplayer/media, docs/learn-media-r2.md).
// Usage: node scripts/upload-learn-media.cjs [--masters <dir>]   (needs `wrangler login` as the owner's Cloudflare account)
// Skips files whose content hash is already recorded in multiplayer/media/uploaded.json, so it is safe to re-run after a re-record.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root=path.join(__dirname,'..'),media=path.join(root,'multiplayer','media'),state=path.join(media,'uploaded.json');
const done=fs.existsSync(state)?JSON.parse(fs.readFileSync(state,'utf8')):{};
const jobs=[];
const vdir=path.join(root,'public','learn','video');
for(const f of fs.readdirSync(vdir).filter(f=>f.endsWith('.mp4')))jobs.push([`learn/video/${f}`,path.join(vdir,f)]);
const mi=process.argv.indexOf('--masters');
if(mi>0)for(const f of fs.readdirSync(process.argv[mi+1]).filter(f=>f.endsWith('.mp4')))jobs.push([`masters/${f}`,path.join(process.argv[mi+1],f)]);
let n=0,skipped=0;
for(const [key,file] of jobs){
 const h=crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0,10);
 if(done[key]===h){skipped++;continue;}
 const r=spawnSync('npx',['wrangler','r2','object','put',`futbol-media/${key}`,'--file',file,'--content-type','video/mp4','--remote'],{cwd:media,stdio:'pipe',encoding:'utf8'});
 if(r.status!==0){console.error('FAILED',key,(r.stderr||r.stdout||'').slice(-300));process.exitCode=1;continue;}
 done[key]=h;n++;fs.writeFileSync(state,JSON.stringify(done,null,1));console.log('uploaded',key);
}
console.log(`R2: ${n} uploaded, ${skipped} already there`);
