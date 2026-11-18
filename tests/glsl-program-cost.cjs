// Whole-program GLSL cost estimate (Nov 17 2026, docs/graphics/island-graphics-plan-nov17.md, batch B step one).
// tests/water-tropical-glslcost.cjs counts only the game's own patch text. This one counts a COMPLETE fragment program: three's
// shader for the material (standard or lambert) with the game's onBeforeCompile patch applied, includes resolved, light loops
// unrolled and the preprocessor run with the phone's defines, then `main()` costed with the same deterministic counter (`cost`).
// So it can answer "what does the ground cost per pixel with full PBR lighting, and what with Lambert + its own sun term".
// - assemble(): what three's WebGLProgram does to the source before compiling (r169: resolveIncludes, replaceLightNums,
//   unrollLoops), for one sun with a shadow + one hemisphere light, the island's light rig.
// - preprocess(): #define / #undef / #if / #ifdef / #ifndef / #elif / #else / #endif; object-like macros are substituted
//   (RE_Direct -> RE_Direct_Physical ...), `saturate(` is counted as clamp.
// - programCost(): cost of main() with every called function's body (worst-case pixel: both sides of every runtime branch;
//   uniform branches a path never takes are removed first with dropIf).
// It also runs on a REAL compiled shader (gl.getShaderSource, which three has already assembled): node tests/glsl-program-cost.cjs
// <file.frag>. The node assembly and a browser dump of the same program agree (checked Nov 17 2026: ground-tint-grass).
// WHAT THIS IS NOT: a GPU measurement. It is an instruction count for before/after comparison of the same program family.
const fs=require('node:fs');
const {cost,dropIf}=require('./water-tropical-glslcost.cjs');
const stripComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
/** The phone island's fragment prefix defines (from a browser dump of the ground programs, Nov 17 2026). */
const PHONE_DEFINES={HIGH_PRECISION:'',USE_FOG:'',USE_SHADOWMAP:'',SHADOWMAP_TYPE_PCF_SOFT:'',TONE_MAPPING:'',OPAQUE:''};
const LIGHTS={NUM_DIR_LIGHTS:1,NUM_SPOT_LIGHTS:0,NUM_SPOT_LIGHT_MAPS:0,NUM_SPOT_LIGHT_COORDS:0,NUM_RECT_AREA_LIGHTS:0,NUM_POINT_LIGHTS:0,NUM_HEMI_LIGHTS:1,
 NUM_DIR_LIGHT_SHADOWS:1,NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS:0,NUM_SPOT_LIGHT_SHADOWS:0,NUM_POINT_LIGHT_SHADOWS:0,NUM_CLIPPING_PLANES:0,UNION_CLIPPING_PLANES:0};
/** three r169 WebGLProgram: includes, light counts, unrolled loops. `chunks` = THREE.ShaderChunk. */
function assemble(src,chunks,lights=LIGHTS){
 const inc=/^[ \t]*#include +<([\w\d./]+)>/gm,resolve=s=>s.replace(inc,(m,name)=>{if(!(name in chunks))throw new Error('no chunk '+name);return resolve(chunks[name]);});
 let s=resolve(src);
 for(const [k,v] of Object.entries(lights))s=s.replace(new RegExp('\\b'+k+'\\b','g'),String(v));
 s=s.replace(/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g,
  (m,a,b,body)=>{let o='';for(let i=+a;i<+b;i++)o+=body.replace(/\[\s*i\s*\]/g,'[ '+i+' ]').replace(/UNROLLED_LOOP_INDEX/g,String(i));return o;});
 return s;
}
/** A small GLSL preprocessor. Returns the live code with directives removed and object-like macros substituted. */
function preprocess(src,defines={}){
 const D=new Map(Object.entries(defines)),out=[],stack=[];// stack: {live, taken, parent}
 const live=()=>stack.every(f=>f.live);
 const evalExpr=e=>{
  let x=e.replace(/defined\s*\(\s*(\w+)\s*\)|defined\s+(\w+)/g,(m,a,b)=>D.has(a||b)?'1':'0');
  for(let pass=0;pass<4;pass++)x=x.replace(/\b[A-Za-z_]\w*\b/g,id=>D.has(id)?(D.get(id)===''?'1':String(D.get(id))):'0');
  if(!/^[\d\s()!&|<>=+\-*/.%]*$/.test(x))throw new Error('cannot evaluate #if '+e+' -> '+x);
  return !!Function('return ('+x+')')();
 };
 for(const raw of stripComments(src).split('\n')){
  const m=/^\s*#\s*(\w+)\s*(.*)$/.exec(raw);
  if(!m){if(live())out.push(raw);continue;}
  const [,dir,rest]=m;
  if(dir==='ifdef'||dir==='ifndef'||dir==='if'){const parent=live(),c=parent&&(dir==='if'?evalExpr(rest):D.has(rest.trim())===(dir==='ifdef'));stack.push({live:c,taken:c,parent});}
  else if(dir==='elif'){const f=stack[stack.length-1];stack.pop();const parent=live();const c=parent&&!f.taken&&evalExpr(rest);stack.push({live:c,taken:f.taken||c,parent});}
  else if(dir==='else'){const f=stack[stack.length-1];stack.pop();const parent=live();stack.push({live:parent&&!f.taken,taken:true,parent});}
  else if(dir==='endif')stack.pop();
  else if(!live())continue;
  else if(dir==='define'){const d=/^(\w+)(\([^)]*\))?\s*(.*)$/.exec(rest.trim());if(d&&!d[2])D.set(d[1],d[3].trim());}// function-like macros are not expanded
  else if(dir==='undef')D.delete(rest.trim());
 }
 let s=out.join('\n');
 // object-like macros that rename identifiers (RE_Direct ...) or carry a number; never the precision / builtin names
 for(let pass=0;pass<3;pass++)for(const [k,v] of D){if(v===''||!/^[\w.]+$/.test(v)||k===v)continue;s=s.replace(new RegExp('\\b'+k+'\\b','g'),v);}
 return s.replace(/\bsaturate\s*\(/g,'clamp(');
}
function match(s,i){const open=s[i],close=open==='{'?'}':')';let d=0;for(let k=i;k<s.length;k++){if(s[k]===open)d++;else if(s[k]===close){d--;if(!d)return k;}}throw new Error('unbalanced at '+i);}
const KEYWORDS=new Set(['if','for','while','switch','return','else']);
/** Every function definition: name -> body (dead code after an unconditional top-level return cut). Overloads: the costliest body wins. */
function functions(src){
 const out={},re=/\b([A-Za-z_]\w*)\s+(\w+)\s*\(([^()]*)\)\s*\{/g;let m;
 while((m=re.exec(src))){if(KEYWORDS.has(m[1])||KEYWORDS.has(m[2]))continue;const open=m.index+m[0].length-1,close=match(src,open);let body=src.slice(open+1,close);
  let d=0;for(let k=0;k<body.length;k++){const ch=body[k];if(ch==='{'||ch==='(')d++;else if(ch==='}'||ch===')')d--;else if(d===0&&body.startsWith('return',k)&&/(^|[;{}]\s*)$/.test(body.slice(0,k))){const e=body.indexOf(';',k);body=body.slice(0,e+1);break;}}
  if(!(m[2] in out)||body.length>out[m[2]].length)out[m[2]]=body;re.lastIndex=close;}
 return out;
}
/** Cost of a complete, assembled fragment shader's main(). `drop`: uniform-branch conditions (RegExp, global) this path never takes. */
function programCost(fullSrc,defines=PHONE_DEFINES,drop=[]){
 let s=preprocess(fullSrc,defines).replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(-?\d+)\s*;\s*\w+\s*(<=|<)\s*(\d+)\s*;\s*\w+\s*\+\+\s*\)/g,'for(int $1=$2;$1$3$4;$1++)');
 for(const re of drop)s=dropIf(s,re);
 const fns=functions(s),main=fns.main;if(!main)throw new Error('no main()');delete fns.main;
 return cost(main,fns);
}
/** The fragment source a material's onBeforeCompile produces from a three ShaderLib entry (no GL needed). */
function patched(T,material,lib,tone='ACESFilmicToneMapping',chunks=T.ShaderChunk){
 const sh={uniforms:{},vertexShader:T.ShaderLib[lib].vertexShader,fragmentShader:T.ShaderLib[lib].fragmentShader};
 if(material.onBeforeCompile)material.onBeforeCompile(sh,null);
 const defs=Object.fromEntries(Object.entries(material.defines||{}).map(([k,v])=>[k,String(v)]));
 if(material.vertexColors)defs.USE_COLOR='';if(material.side===T.DoubleSide)defs.DOUBLE_SIDED='';if(material.map)defs.USE_MAP='';
 // three's fragment prefix carries the tone curve and the output transfer (WebGLProgram: getToneMappingFunction, getTexelEncodingFunction)
 const prefix=T.ShaderChunk.tonemapping_pars_fragment+'\nvec3 toneMapping( vec3 color ) { return '+tone+'( color ); }\n'+T.ShaderChunk.colorspace_pars_fragment+'\nvec4 linearToOutputTexel( vec4 value ) { return ( sRGBTransferOETF( value ) ); }\n';
 return {source:assemble(prefix+sh.fragmentShader,chunks),defines:{...PHONE_DEFINES,...defs}};
}
module.exports={assemble,preprocess,functions,programCost,patched,PHONE_DEFINES,LIGHTS};
if(require.main===module){const src=fs.readFileSync(process.argv[2],'utf8');console.log(JSON.stringify(programCost(src,{}),null,1));}
