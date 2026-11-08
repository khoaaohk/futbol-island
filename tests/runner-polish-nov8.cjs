// Breakaway Run polish (Nov 8 2026): runs tests/runner-polish-nov8.mjs (elite tiers + own boards, perfect-dodge chain, loss line,
// tier bests, coin parity, reduced motion, pooled sounds, simplified card). The suite loads TypeScript through node:module
// registerHooks (Node >= 23), so like tests/runner-feel.cjs it falls back to a newer local Node.
const {spawnSync}=require('node:child_process');const fs=require('node:fs');
const major=Number(process.versions.node.split('.')[0]);
const candidates=[...(major>=23?[process.execPath]:[]),process.env.NODE22,'/opt/homebrew/bin/node','/usr/local/bin/node'].filter(Boolean);
const node=candidates.find(p=>{try{if(!fs.existsSync(p))return false;const v=spawnSync(p,['-p','process.versions.node'],{encoding:'utf8'}).stdout.trim();return Number(v.split('.')[0])>=23;}catch{return false;}});
if(!node){console.log('SKIP runner polish Nov 8: needs Node >= 23 for TypeScript hooks');process.exit(0);}
const r=spawnSync(node,['--no-warnings','tests/runner-polish-nov8.mjs'],{stdio:'inherit'});process.exit(r.status??1);
