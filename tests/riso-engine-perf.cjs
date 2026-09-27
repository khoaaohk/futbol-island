// Riso engine performance paths (card films, Sep 26 2026) must be exact: the fast key()/keyPath()/camKeys()/padKeys() in
// lib/paths/riso/motion.ts, the flat-buffer ribbon() and the merge-sort hull() in lib/plays/riso/athlete.ts are compared, on thousands
// of random inputs, with the original implementations kept here as references. Numbers must match to the last bit and a ribbon must
// issue the same path commands with the same coordinates, so every film prints the same pixels as before.
// usage: node tests/riso-engine-perf.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.join(__dirname,'..');
const tsc=file=>ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
// Path2D that records every command (with its numbers) so two ribbons can be compared exactly
class RecPath{constructor(){this.cmds=[];}moveTo(x,y){this.cmds.push(['M',x,y]);}lineTo(x,y){this.cmds.push(['L',x,y]);}closePath(){this.cmds.push(['Z']);}arc(...a){this.cmds.push(['A',...a]);}rect(...a){this.cmds.push(['R',...a]);}addPath(p){this.cmds.push(['P',...(p.cmds??[])]);}}
globalThis.Path2D=RecPath;
const load=file=>{const m={exports:{}};new Function('module','exports','require',tsc(file))(m,m.exports,n=>{throw new Error(`unexpected import ${n}`);});return m.exports;};
const motion=load('lib/paths/riso/motion.ts');
const {clamp,lerp,rng,noise1,easeIO,easeInOutSine,TAU}=motion;

// ───────────── references: the pre-optimisation implementations ─────────────
const R={};
R.vals=k=>k.filter(v=>typeof v==='number').slice(1);
R.padKeys=(K,defaults=[])=>{const n=Math.max(...K.map(k=>R.vals(k).length),defaults.length);let prev=[];return K.map(k=>{const v=R.vals(k),last=k[k.length-1],out=[k[0],...v];for(let i=v.length;i<n;i++)out.push(defaults[i]??prev[i]??0);prev=out.slice(1);if(typeof last==='function')out.push(last);return out;});};
R.key=(t,K0,e=easeIO,many)=>{const K=R.padKeys(K0),first=R.vals(K[0]),one=first.length===1&&!many,out=v=>one?v[0]:v;
 if(t<=K[0][0])return out(first);
 for(let k=0;k+1<K.length;k++){const t0=K[k][0],t1=K[k+1][0];if(t<t1){const a=R.vals(K[k]),b=R.vals(K[k+1]),last=K[k][K[k].length-1],f=typeof last==='function'?last:e,u=f(clamp((t-t0)/(t1-t0)));return out(a.map((x,n)=>lerp(x,b[n],u)));}}
 return out(R.vals(K[K.length-1]));};
R.keyPath=(t,K0,e=easeInOutSine)=>{const K=R.padKeys(K0),n=K.length,P=i=>R.vals(K[clamp(i,0,n-1)]);if(n<3)return R.key(t,K,e,true);
 const t0=K[0][0],t1=K[n-1][0],tm=t0+e(clamp((t-t0)/(t1-t0)))*(t1-t0);if(tm>=t1)return P(n-1);
 let k=0;while(k+1<n-1&&tm>=K[k+1][0])k++;
 const u=clamp((tm-K[k][0])/(K[k+1][0]-K[k][0])),p0=P(k-1),p1=P(k),p2=P(k+1),p3=P(k+2),u2=u*u,u3=u2*u;
 return p1.map((_,j)=>.5*(2*p1[j]+(p2[j]-p0[j])*u+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*u2+(3*p1[j]-p0[j]-3*p2[j]+p3[j])*u3));};
R.camKeys=(t,K,e=easeInOutSine)=>{const v=R.keyPath(t,R.padKeys(K,[0,0,1,0]),e);return[v[0]||0,v[1]||0,Number.isFinite(v[2])?v[2]:1,Number.isFinite(v[3])?v[3]:0];};
R.smoothPts=(pts,close=false,step=6,corner=.8)=>{const n=pts.length;if(n<2)return pts.map(p=>[p[0],p[1]]);const P=i=>close?pts[((i%n)+n)%n]:pts[clamp(i,0,n-1)];
 const sharp=[];for(let i=0;i<n;i++){if(!close&&(i===0||i===n-1)){sharp.push(true);continue;}const a=P(i-1),b=P(i),d=P(i+1);let t=Math.abs(Math.atan2(d[1]-b[1],d[0]-b[0])-Math.atan2(b[1]-a[1],b[0]-a[0]));if(t>Math.PI)t=TAU-t;sharp.push(t>corner);}
 const out=[],segs=close?n:n-1;
 for(let i=0;i<segs;i++){const p1=P(i),p2=P(i+1),c1=sharp[i%n],c2=sharp[(i+1)%n],p0=c1?[2*p1[0]-p2[0],2*p1[1]-p2[1]]:P(i-1),p3=c2?[2*p2[0]-p1[0],2*p2[1]-p1[1]]:P(i+2),m=Math.max(1,Math.round(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));
  for(let k=0;k<m;k++){const t=k/m,t2=t*t,t3=t2*t;out.push([.5*(2*p1[0]+(p2[0]-p0[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(3*p1[0]-p0[0]-3*p2[0]+p3[0])*t3),.5*(2*p1[1]+(p2[1]-p0[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(3*p1[1]-p0[1]-3*p2[1]+p3[1])*t3)]);}}
 if(!close)out.push([pts[n-1][0],pts[n-1][1]]);return out;};
R.wob=(pts,amp,seed,close=false,o={})=>{const{smooth=true,step=6,corner=.8,freq=1}=o;if(pts.length<2)return pts;
 const q=smooth?R.smoothPts(pts,close,step,corner):pts,n=q.length,s=[0];for(let i=1;i<n;i++)s.push(s[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));
 const L=close?s[n-1]+Math.hypot(q[0][0]-q[n-1][0],q[0][1]-q[n-1][1]):s[n-1]||1,r=rng(seed),ph=[r()*TAU,r()*TAU,r()*TAU,r()*100];
 let off;if(close){const k1=Math.max(2,Math.round(L/140*freq)),k2=k1*2+1,k3=k2*2+1;off=i=>amp*(.42*Math.sin(k1*TAU*s[i]/L+ph[0])+.26*Math.sin(k2*TAU*s[i]/L+ph[1])+.14*Math.sin(k3*TAU*s[i]/L+ph[2]));}
 else{const sc=freq/90;off=i=>amp*(.55*noise1(s[i]*sc+ph[3],seed)+.28*noise1(s[i]*sc*2.6+ph[3]*3,seed+7));}
 const out=new Array(n);for(let i=0;i<n;i++){const a=q[i>0?i-1:(close?n-1:0)],b=q[i<n-1?i+1:(close?0:n-1)];const nx=a[1]-b[1],ny=b[0]-a[0],l=Math.hypot(nx,ny)||1,d=off(i);out[i]=[q[i][0]+nx/l*d,q[i][1]+ny/l*d];}
 return out;};
R.ribbon=(pts,width,o={})=>{const{seed=1,pressure=.5,taper=.7,close=false,wobble=1.4,gaps=[],step=7}=o;const q=wobble?R.wob(pts,wobble,seed,close,{step}):R.smoothPts(pts,close,step);const n=q.length,path=new RecPath();if(n<2)return path;
 const s=[0];for(let i=1;i<n;i++)s.push(s[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));const L=s[n-1]||1,r=rng(seed+31),ph1=r()*TAU,ph2=r()*TAU;
 const wid=i=>{const u=s[i]/L,tl=Math.max(.06,Math.min(.35,width*4/L)),e=close?1:Math.min(1,u/tl,(1-u)/tl);return Math.max(.6,width*(1-taper*.6*(1-Math.sin(e*Math.PI/2)))*(1+pressure*.28*Math.sin(u*L/55+ph1)+pressure*.12*Math.sin(u*L/17+ph2)));};
 const normal=i=>{const a=q[Math.max(0,i-1)],b=q[Math.min(n-1,i+1)],nx=a[1]-b[1],ny=b[0]-a[0],l=Math.hypot(nx,ny)||1;return[nx/l,ny/l];};
 const inGap=u=>gaps.some(([g0,g1])=>u>=g0&&u<=g1);
 let run=[];const flush=()=>{if(run.length<2){run=[];return;}const left=[],right=[];for(const i of run){const w=wid(i)/2,[nx,ny]=normal(i);left.push([q[i][0]+nx*w,q[i][1]+ny*w]);right.push([q[i][0]-nx*w,q[i][1]-ny*w]);}
  path.moveTo(left[0][0],left[0][1]);for(let k=1;k<left.length;k++)path.lineTo(left[k][0],left[k][1]);for(let k=right.length-1;k>=0;k--)path.lineTo(right[k][0],right[k][1]);path.closePath();run=[];};
 const total=close?n+1:n;for(let k=0;k<total;k++){const i=k%n;if(inGap(s[i]/L)){flush();continue;}run.push(i);}flush();
 return path;};
R.hull=pts=>{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo=[],up=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}
 up.pop();lo.pop();return lo.concat(up);};

// ───────────── random inputs ─────────────
const rand=rng(20260926),pick=a=>a[Math.floor(rand()*a.length)],EASES=[easeIO,easeInOutSine,motion.easeOut,motion.easeOutBack,motion.linear];
const same=(a,b,what)=>{if(Array.isArray(a)||Array.isArray(b)){assert.ok(Array.isArray(a)&&Array.isArray(b),`${what}: array vs scalar`);assert.equal(a.length,b.length,`${what}: length`);for(let i=0;i<a.length;i++)assert.ok(Object.is(a[i],b[i]),`${what}[${i}]: ${a[i]} ≠ ${b[i]}`);}else assert.ok(Object.is(a,b),`${what}: ${a} ≠ ${b}`);};
function randomKeys(){const n=1+Math.floor(rand()*6),K=[];let t=rand()*2-1;const uniform=rand()<.5,w=1+Math.floor(rand()*4);
 for(let k=0;k<n;k++){t+=rand()<.1?0:rand()*3;const m=uniform?w:Math.floor(rand()*5),key=[+t.toFixed(3)];for(let j=0;j<m;j++)key.push(rand()<.1?0:+(rand()*400-200).toFixed(2));if(rand()<.35)key.push(pick(EASES));K.push(key);}
 if(rand()<.08&&K.length)K[Math.floor(rand()*K.length)].splice(1,0,pick(EASES));// an unclean key (an ease in the middle): the padded fallback
 return K;}
let checks=0;
for(let trial=0;trial<4000;trial++){
 const K=randomKeys(),t0=K[0][0],t1=K[K.length-1][0];
 same(JSON.stringify(motion.padKeys(K).map(k=>k.map(v=>typeof v==='function'?v.name||'fn':v))),JSON.stringify(R.padKeys(K).map(k=>k.map(v=>typeof v==='function'?v.name||'fn':v))),'padKeys');
 same(JSON.stringify(motion.padKeys(K,[0,0,1,0]).map(k=>k.map(v=>typeof v==='function'?'fn':v))),JSON.stringify(R.padKeys(K,[0,0,1,0]).map(k=>k.map(v=>typeof v==='function'?'fn':v))),'padKeys defaults');
 for(const t of [t0-1,t0,t1,t1+1,NaN,...Array.from({length:12},()=>t0-.5+rand()*(t1-t0+1))]){
  const e=pick(EASES);
  same(motion.key(t,K,e),R.key(t,K,e),`key t=${t}`);same(motion.key(t,K,e,true),R.key(t,K,e,true),`key many t=${t}`);
  same(motion.keyPath(t,K,e),R.keyPath(t,K,e),`keyPath t=${t}`);
  const cam=[];motion.camKeys({camera:(...a)=>cam.push(a)},t,K,e);same(cam[0],R.camKeys(t,K,e),`camKeys t=${t}`);
  checks+=4;}
}
// ribbon: same commands, same numbers (open/closed, wobble on/off, gaps, degenerate inputs)
for(let trial=0;trial<2500;trial++){
 const n=Math.floor(rand()*14),cx=rand()*500,cy=rand()*500,pts=[];for(let i=0;i<n;i++){const a=i/n*TAU+rand()*.4;pts.push(rand()<.08&&i?[...pts[i-1]]:[cx+Math.cos(a)*(20+rand()*200),cy+Math.sin(a)*(20+rand()*200)]);}
 const o={seed:Math.floor(rand()*999),pressure:rand(),taper:rand(),close:rand()<.5,wobble:rand()<.25?0:rand()*6,step:pick([1.5,2.2,4,7,12]),gaps:rand()<.2?[[.1+rand()*.2,.35+rand()*.2],[.7,.75+rand()*.2]]:[]};
 const w=.5+rand()*18,A=motion.ribbon(pts,w,o).cmds,B=R.ribbon(pts,w,o).cmds;
 assert.equal(A.length,B.length,`ribbon trial ${trial}: ${A.length} vs ${B.length} commands`);
 for(let i=0;i<A.length;i++){assert.equal(A[i][0],B[i][0],`ribbon trial ${trial} cmd ${i}`);for(let j=1;j<A[i].length;j++)assert.ok(Object.is(A[i][j],B[i][j]),`ribbon trial ${trial} cmd ${i}: ${A[i][j]} ≠ ${B[i][j]}`);}
 checks++;
}
// the exported smoothPts/wob are unchanged and still agree with the references
for(let trial=0;trial<500;trial++){const n=2+Math.floor(rand()*10),pts=Array.from({length:n},()=>[rand()*300,rand()*300]),close=rand()<.5,step=pick([2,5,9]);
 same(motion.smoothPts(pts,close,step).flat(),R.smoothPts(pts,close,step).flat(),'smoothPts');same(motion.wob(pts,3,7,close,{step}).flat(),R.wob(pts,3,7,close,{step}).flat(),'wob');checks+=2;}
// hull (internal to athlete.ts): the function source is lifted out of the module and compared with the reference
{const src=tsc('lib/plays/riso/athlete.ts'),start=src.indexOf('let hullTmp'),end=src.indexOf('function orient(');assert.ok(start>0&&end>start,'hull source found');
 const hull=new Function(src.slice(start,end)+';return hull;')();
 for(let trial=0;trial<3000;trial++){const n=Math.floor(rand()*140),rings=rand()<.5,pts=[];
  for(let i=0;i<n;i++){if(rings){const r=Math.floor(i/16),a=(i%16)/16*TAU;pts.push([Math.round((100+Math.cos(a)*(40+r*6))*8)/8,Math.round((100+Math.sin(a)*(60-r*3)+r*20)*8)/8]);}
   else pts.push(rand()<.1&&i?[...pts[Math.floor(rand()*i)]]:rand()<.1?[Math.round(rand()*4)*10,Math.round(rand()*4)*10]:[rand()*300,rand()*300]);}
  const A=hull(pts),B=R.hull(pts);assert.equal(A.length,B.length,`hull trial ${trial} size`);for(let i=0;i<A.length;i++)assert.ok(Object.is(A[i][0],B[i][0])&&Object.is(A[i][1],B[i][1]),`hull trial ${trial} vertex ${i}`);checks++;}}
console.log(`Riso engine fast paths: ${checks} exact comparisons with the original key/keyPath/camKeys/padKeys, ribbon, smoothPts/wob and hull — PASS`);
