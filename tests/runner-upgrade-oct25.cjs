// Runs tests/runner-upgrade-oct25.mjs (TypeScript via register-local-ts needs Node >= 23; same fallback as runner-feel.cjs).
const {spawnSync}=require('node:child_process');const fs=require('node:fs');
const major=Number(process.versions.node.split('.')[0]);
const candidates=[...(major>=23?[process.execPath]:[]),process.env.NODE22,'/opt/homebrew/bin/node','/usr/local/bin/node'].filter(Boolean);
const node=candidates.find(p=>{try{if(!fs.existsSync(p))return false;const v=spawnSync(p,['-p','process.versions.node'],{encoding:'utf8'}).stdout.trim();return Number(v.split('.')[0])>=23;}catch{return false;}});
if(!node){console.log('SKIP runner upgrade: needs Node >= 23 for TypeScript hooks');process.exit(0);}
const r=spawnSync(node,['--no-warnings','tests/runner-upgrade-oct25.mjs'],{stdio:['ignore','pipe','pipe'],encoding:'utf8',cwd:require('node:path').join(__dirname,'..')});
process.stdout.write(r.stdout);if(r.status!==0){process.stderr.write(r.stderr);process.exit(r.status||1);}
