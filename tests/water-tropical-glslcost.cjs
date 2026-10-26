// Static GLSL cost estimate for the island water (tropical water pass, Oct 26 2026, docs/TROPICAL_WATER_OCT26.md).
// Not a compiler: a deterministic, conservative count over the shader source so a change can be held to "not more than before"
// per render path. Used by tests/water-tropical-cost.cjs (and runnable on any revision: node tests/water-tropical-glslcost.cjs
// <waterSurface.ts> <islandShore.ts> prints the path table).
// - ALU: each binary + - * / (and compound +=, -=, *=, /=), comparison, && / || / ?: counts 1; builtins are weighted (below);
//   a user function call costs its body (recursively; code after an unconditional top-level `return` is dead and not counted);
//   a `for` loop costs its trip count x its body. Vector width is ignored (same for both sides of a comparison).
// - TEX: texture2D / texture / textureGrad / textureLod calls.
// - Paths drop the branches they never take (a uniform branch: the GPU skips them for the whole draw) and count everything else,
//   including every early-out branch's body (a worst-case pixel).
const fs=require('node:fs');
const W={sin:4,cos:4,exp:4,exp2:4,log:4,log2:4,pow:6,sqrt:4,inversesqrt:4,atan:8,smoothstep:5,mix:3,clamp:2,length:4,distance:5,normalize:6,dot:3,fract:1,floor:1,abs:1,min:1,max:1,step:1,sign:1,dFdx:1,dFdy:1};
const TEXRE=/\btexture(?:2D|Grad|Lod)?\s*\(/g;
const stripComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
/** Matching close brace / paren index for the opener at i. */
function match(s,i){const open=s[i],close=open==='{'?'}':')';let d=0;for(let k=i;k<s.length;k++){if(s[k]===open)d++;else if(s[k]===close){d--;if(!d)return k;}}throw new Error('unbalanced at '+i+': '+s.slice(i,i+60));}
/** Remove `if(<cond matching re>)` + its block or single statement (and an `else{...}` after it when dropElse). Repeats for every hit. */
function dropIf(s,re,{keepElse=true}={}){
 for(;;){const m=re.exec(s);re.lastIndex=0;if(!m)return s;const c=match(s,m.index+m[0].indexOf('('));let j=c+1;while(/\s/.test(s[j]))j++;
  let end;if(s[j]==='{')end=match(s,j)+1;else{end=s.indexOf(';',j)+1;}
  let k=end;while(/\s/.test(s[k]||''))k++;
  if(s.startsWith('else',k)){if(keepElse){s=s.slice(0,m.index)+s.slice(k+4);continue;}let e=k+4;while(/\s/.test(s[e]))e++;const ee=s[e]==='{'?match(s,e)+1:s.indexOf(';',e)+1;s=s.slice(0,m.index)+s.slice(ee);continue;}
  s=s.slice(0,m.index)+s.slice(end);}
}
/** Keep the `if(<cond>){A}` body, drop its else branch (the path where the condition holds). */
function takeIf(s,re){const m=re.exec(s);re.lastIndex=0;if(!m)return s;const c=match(s,m.index+m[0].indexOf('('));let j=c+1;while(/\s/.test(s[j]))j++;
 const end=s[j]==='{'?match(s,j)+1:s.indexOf(';',j)+1;let k=end;while(/\s/.test(s[k]||''))k++;if(!s.startsWith('else',k))return s;let e=k+4;while(/\s/.test(s[e]))e++;const ee=s[e]==='{'?match(s,e)+1:s.indexOf(';',e)+1;
 return s.slice(0,end)+s.slice(ee);}
/** GLSL function definitions in a source: name -> body (the #if NUM_DIR_LIGHTS>0 branch kept, dead code after a top-level return cut). */
function functions(src){
 const out={},re=/\b(?:float|vec2|vec3|vec4|void)\s+(\w+)\s*\(([^()]*)\)\s*\{/g;let m;
 while((m=re.exec(src))){const open=m.index+m[0].length-1,close=match(src,open);let body=src.slice(open+1,close);
  body=body.replace(/#if NUM_DIR_LIGHTS>0([\s\S]*?)#else[\s\S]*?#endif/g,'$1');
  // cut at the first top-level statement that starts with `return` (not `if(..)return`)
  let d=0;for(let k=0;k<body.length;k++){const ch=body[k];if(ch==='{'||ch==='(')d++;else if(ch==='}'||ch===')')d--;else if(d===0&&body.startsWith('return',k)&&/(^|[;{}]\s*)$/.test(body.slice(0,k))){const e=body.indexOf(';',k);body=body.slice(0,e+1);break;}}
  out[m[1]]=body;}
 return out;
}
function cost(code,fns,memo={}){
 let s=stripComments(code).replace(/\$\{[^}]*\}/g,'1.').replace(/\d+\.?\d*e-?\d+/g,'1.');
 let alu=0,tex=0;
 // loops: trip count x body
 for(;;){const m=/for\s*\(int\s+\w+=(-?\d+);\w+(<=|<)(\d+);\w+\+\+\)/.exec(s);if(!m)break;let n=+m[3]-+m[1]+(m[2]==='<='?1:0),j=m.index+m[0].length;
  for(;;){while(/\s/.test(s[j]))j++;const m2=/^for\s*\(int\s+\w+=(-?\d+);\w+(<=|<)(\d+);\w+\+\+\)/.exec(s.slice(j));if(!m2)break;n*=+m2[3]-+m2[1]+(m2[2]==='<='?1:0);j+=m2[0].length;}
  const end=s[j]==='{'?match(s,j)+1:s.indexOf(';',j)+1;const b=cost(s.slice(j,end),fns,memo);alu+=n*b.alu;tex+=n*b.tex;s=s.slice(0,m.index)+' 0. '+s.slice(end);}
 // user functions
 for(const name of Object.keys(fns)){const re=new RegExp('\\b'+name+'\\s*\\(','g');const k=(s.match(re)||[]).length;if(!k)continue;
  memo[name]=memo[name]||cost(fns[name],Object.fromEntries(Object.entries(fns).filter(([n])=>n!==name)),memo);alu+=k*memo[name].alu;tex+=k*memo[name].tex;s=s.replace(re,'(');}
 tex+=(s.match(TEXRE)||[]).length;s=s.replace(TEXRE,'(');
 for(const [f,w] of Object.entries(W)){const k=(s.match(new RegExp('\\b'+f+'\\s*\\(','g'))||[]).length;alu+=k*w;}
 alu+=(s.match(/[+\-*/]=/g)||[]).length;s=s.replace(/[+\-*/]=/g,' = ').replace(/\+\+|--/g,' ');
 alu+=(s.match(/[\w.)\]]\s*[+\-*/](?!=)/g)||[]).length;
 alu+=(s.match(/<=|>=|==|!=|&&|\|\||\?|(?<![<>])[<>](?![<>=])/g)||[]).length;
 return {alu,tex};
}
const between=(s,a,b,from=0)=>{const i=s.indexOf(a,from);if(i<0)throw new Error('marker '+a);const j=s.indexOf(b,i+a.length);if(j<0)throw new Error('marker '+b);return s.slice(i+a.length,j);};
const add=(...c)=>c.reduce((a,b)=>({alu:a.alu+b.alu,tex:a.tex+b.tex}),{alu:0,tex:0});
/** Per-path fragment costs of the ocean (opaque program) and the island shore strip. */
function waterPaths(oceanSrc,shoreSrc){
 const ofns=functions(stripComments(oceanSrc).replace(/\$\{DIVE_SLOTS\}/g,'2'));
 const map=between(oceanSrc,".replace('#include <map_fragment>',/* glsl */`","}`)").replace(/\$\{DIVE_SLOTS\}/g,'2');
 const opaque=between(oceanSrc,".replace('#include <opaque_fragment>',`","#include <opaque_fragment>`)").replace(/#ifndef OPAQUE[\s\S]*?#endif/,'').replace(/#ifdef OPAQUE([\s\S]*?)#else[\s\S]*?#endif/,'$1');
 const o=(code)=>add(cost(stripComments(code),ofns),cost(stripComments(opaque),ofns));
 const desk=/if\(uWaterDetail>1\.5\)/g,reach=/if\(reachS>0\.\)/g,crest=/if\(uWaterDetail>\.5\)/g,glit=/if\(uSunGlitter>0\.\)/g,mapS=stripComments(map);
 const ocean={
  far:o(dropIf(dropIf(mapS,reach),desk)),
  nearPhone:o(dropIf(mapS,desk)),
  nearPhoneHot:o(dropIf(dropIf(mapS,desk),glit)),
  nearDesk:o(mapS),
  still:o(dropIf(dropIf(dropIf(mapS,desk),crest),glit)),
 };
 const sfns=functions(stripComments(shoreSrc+between(oceanSrc,'export const SHORE_GLSL=/* glsl */`','`;')+between(oceanSrc,'export const CLEAR_WIN_GLSL=/* glsl */`','`;')));
 const strip=stripComments(between(shoreSrc,'const STRIP_GLSL=/* glsl */`','`;'));
 const s=(code)=>cost(dropIf(code,/if\(uFoamFxOn>\.5\)/g),sfns);
 const still=/if\(uWaterDetail<\.5\)/g,far=/if\(vFar<\.999\)/g;
 const lit=dropIf(strip,still);// detail >= 1: the else branch
 const shore={
  still:s(takeIf(strip,still)),
  far:s(dropIf(dropIf(lit,far),desk)),
  nearPhone:s(dropIf(lit,desk)),
  nearPhoneHot:s(dropIf(dropIf(lit,desk),glit)),
  nearDesk:s(lit),
 };
 return {ocean,shore};
}
module.exports={cost,functions,waterPaths,dropIf,takeIf};
if(require.main===module){const [a,b]=process.argv.slice(2);console.log(JSON.stringify(waterPaths(fs.readFileSync(a,'utf8'),fs.readFileSync(b,'utf8')),null,1));}
