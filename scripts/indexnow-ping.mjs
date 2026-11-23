#!/usr/bin/env node
/**
 * IndexNow ping after a release (seo-extras, Nov 15 2026). Tells Bing, Yandex, Seznam, Naver and the other IndexNow engines which
 * pages changed, so they recrawl them soon. DRY RUN BY DEFAULT: it prints what it would send and sends nothing. Add --send to POST.
 *
 * Changed URLs = paths whose date in lib/site/lastmod.generated.json (scripts/gen-lastmod.cjs) differs from, or is missing in, the
 * same file at the previous deploy:
 *   --since <git-ref>   the previous deploy's commit (default: origin/main@{1}, then HEAD~1)
 *   --prev <file.json>  or a saved copy of the previous deploy's lastmod list
 *   --all               every path (first ping, or after a big move)
 *   --with-es[=<origin>] also list each changed page's Spanish twin (/es/...) when <origin>/sitemap.xml lists it (default: the live
 *                       site). lastmod.generated.json holds English paths only, so without it the 394 /es pages were never pinged.
 *                       Reads the sitemap (one GET per sitemap file) even in a dry run; nothing is sent without --send.
 *   --send              actually POST to https://api.indexnow.org/indexnow (batches of at most 10,000 URLs)
 * The key is the public/<32 hex>.txt file whose content is its own name (keyLocation = https://futbolisland.app/<key>.txt).
 * Docs: docs/indexnow.md. Never reads .env files; needs no secret (the key is public by design).
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const HOST='futbolisland.app',ORIGIN=`https://${HOST}`,ENDPOINT='https://api.indexnow.org/indexnow',BATCH=10000;
export const LASTMOD='lib/site/lastmod.generated.json';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');

/** The key: public/<hex>.txt whose body is the same hex (IndexNow's own rule). */
export function findKey(dir=path.join(root,'public')){
 for(const f of fs.readdirSync(dir)){const m=/^([0-9a-f]{8,128})\.txt$/.exec(f);if(!m)continue;
  if(fs.readFileSync(path.join(dir,f),'utf8').trim()===m[1])return {key:m[1],keyLocation:`${ORIGIN}/${f}`};}
 return null;
}
/** Paths new or re-dated in `now` compared with `prev` (both {path: 'YYYY-MM-DD'}), sorted. */
export function changedPaths(prev,now){return Object.keys(now).filter(p=>prev[p]!==now[p]).sort();}
export const toUrls=paths=>paths.map(p=>ORIGIN+(p==='/'?'/':p));
/** The /es twin of an English path ('/' -> '/es'). */
export const esTwin=p=>p==='/'?'/es':'/es'+p;
/** Every /es path a sitemap index (and the sitemaps it names) lists, as site paths. */
export async function sitemapEsPaths(origin=ORIGIN){
 const locs=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(`${u}: HTTP ${r.status}`);return [...(await r.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);};
 const local=u=>u.replace(ORIGIN,origin),out=new Set();
 for(const m of await locs(origin+'/sitemap.xml'))for(const u of (m.endsWith('.xml')?await locs(local(m)):[m])){const p=u.replace(ORIGIN,'')||'/';if(p==='/es'||p.startsWith('/es/'))out.add(p);}
 return out;
}
/** IndexNow bodies, at most BATCH URLs each. */
export function batches(urls,k,size=BATCH){const out=[];for(let i=0;i<urls.length;i+=size)out.push({host:HOST,key:k.key,keyLocation:k.keyLocation,urlList:urls.slice(i,i+size)});return out;}
function gitShow(ref){return JSON.parse(execFileSync('git',['show',`${ref}:${LASTMOD}`],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}));}
function previous(args){
 const i=args.indexOf('--prev');if(i>=0)return {from:args[i+1],list:JSON.parse(fs.readFileSync(path.resolve(args[i+1]),'utf8'))};
 const s=args.indexOf('--since');const refs=s>=0?[args[s+1]]:['origin/main@{1}','HEAD~1'];
 for(const r of refs){try{return {from:r,list:gitShow(r)};}catch{/* try the next */}}
 throw new Error(`could not read ${LASTMOD} at ${refs.join(' or ')}`);
}
export async function main(args=process.argv.slice(2),log=console.log){
 const send=args.includes('--send'),k=findKey();
 if(!k)throw new Error('no IndexNow key file in public/ (<hex>.txt containing its own name)');
 const now=JSON.parse(fs.readFileSync(path.join(root,LASTMOD),'utf8'));
 const prev=args.includes('--all')?{from:'(all)',list:{}}:previous(args);
 let paths=changedPaths(prev.list,now);
 const esArg=args.find(a=>a==='--with-es'||a.startsWith('--with-es='));
 if(esArg){const es=await sitemapEsPaths(esArg.includes('=')?esArg.slice(10).replace(/\/$/,''):ORIGIN);paths=[...paths,...paths.map(esTwin).filter(p=>es.has(p))];}
 const urls=toUrls(paths),bodies=batches(urls,k);
 log(`indexnow: ${urls.length} changed URL(s) since ${prev.from}, ${bodies.length} batch(es), key ${k.keyLocation}${send?'':' [dry run: nothing sent; add --send]'}`);
 for(const u of urls.slice(0,20))log('  '+u);if(urls.length>20)log(`  … and ${urls.length-20} more`);
 if(!send||!urls.length)return {sent:0,urls,bodies};
 let sent=0;
 for(const b of bodies){
  const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(b)});
  log(`indexnow: POST ${b.urlList.length} URL(s) -> HTTP ${r.status}`);if(r.status!==200&&r.status!==202)throw new Error(`IndexNow refused: HTTP ${r.status}`);sent+=b.urlList.length;
 }
 return {sent,urls,bodies};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))main().catch(e=>{console.error('indexnow: '+e.message);process.exit(1);});
