import {sanitizePlay} from './play';
import {PLAY_VERSION,type Arrow,type End,type Ink,type Play,type Vec} from './types';

/**
 * Share links: the whole play travels in the URL hash (#play=…), so there is no server and nothing is uploaded. The play is
 * packed into short arrays (coordinates as integers 0…1000, chips by index), then deflated with the browser's own
 * CompressionStream ('deflate-raw') and base64url-encoded. A typical 3-step 7v7 play is ~300–600 characters.
 *
 * Code prefix: 'z' = deflate-raw, 'j' = plain (a browser without CompressionStream). Opening a link always goes through
 * sanitizePlay, so a hand-edited link can only ever produce a valid play (or nothing).
 */
export const SHARE_HASH='play';
const q=(n:number)=>Math.round(n*1000);
const dq=(n:unknown)=>typeof n==='number'?n/1000:NaN;
type Packed=[number,string,string,(string|number)[][],unknown[][],string,string];

export function pack(p:Play):Packed{
 const idx=new Map(p.chips.map((c,i)=>[c.id,i]));
 const end=(e:End)=>'c' in e?idx.get(e.c)??-1:[q(e.p[0]),q(e.p[1])];
 const chips=p.chips.map(c=>[c.team==='home'?0:c.team==='away'?1:2,c.label,c.gk?1:0]);
 const steps=p.steps.map(s=>[p.chips.flatMap(c=>{const v=s.pos[c.id]??[.5,.5];return [q(v[0]),q(v[1])];}),
  s.arrows.map(a=>[['pass','run','dribble'].indexOf(a.kind),end(a.a),end(a.b),Math.round(a.bend*100),a.ink]),
  s.ink.map(k=>[k.kind==='zone'?1:0,k.ink,k.pts.flatMap(v=>[q(v[0]),q(v[1])])])]);
 return [PLAY_VERSION,p.name,p.format,chips,steps,p.note??'',p.view??'full'];
}
export function unpack(x:unknown):Play|null{
 if(!Array.isArray(x)||x[0]!==PLAY_VERSION)return null;
 const [,name,format,rawChips,rawSteps,note,view]=x as Packed;
 if(!Array.isArray(rawChips)||!Array.isArray(rawSteps))return null;
 const ids=rawChips.map((_,i)=>'c'+i.toString(36));
 const chips=rawChips.map((c,i)=>Array.isArray(c)?{id:ids[i],team:['home','away','ball'][Number(c[0])]??'home',label:String(c[1]??''),gk:c[2]===1}:null);
 let n=0;const id=(k:string)=>k+(n++).toString(36);
 const end=(e:unknown):End|null=>typeof e==='number'?(ids[e]?{c:ids[e]}:null):Array.isArray(e)?{p:[dq(e[0]),dq(e[1])] as Vec}:null;
 const steps=rawSteps.map(s=>{if(!Array.isArray(s))return null;const [pos,arrows,ink]=s as [number[],unknown[][],unknown[][]];
  return {pos:Object.fromEntries(ids.map((cid,i)=>[cid,[dq(pos?.[2*i]),dq(pos?.[2*i+1])]])),
   arrows:(Array.isArray(arrows)?arrows:[]).map(a=>Array.isArray(a)?{id:id('a'),kind:['pass','run','dribble'][Number(a[0])],a:end(a[1]),b:end(a[2]),bend:Number(a[3])/100,ink:a[4]} as unknown as Arrow:null),
   ink:(Array.isArray(ink)?ink:[]).map(k=>{if(!Array.isArray(k)||!Array.isArray(k[2]))return null;const f=k[2] as number[],pts:Vec[]=[];for(let i=0;i+1<f.length;i+=2)pts.push([dq(f[i]),dq(f[i+1])]);
    return {id:id('k'),kind:k[0]===1?'zone':'line',ink:k[1],pts} as Ink;})};});
 return sanitizePlay({v:PLAY_VERSION,id:'shared',name,format,chips,steps,note,view});
}

const b64url=(bytes:Uint8Array)=>{let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const unb64url=(s:string)=>{const b=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));const out=new Uint8Array(b.length);for(let i=0;i<b.length;i++)out[i]=b.charCodeAt(i);return out;};
async function through(bytes:Uint8Array,stream:CompressionStream|DecompressionStream):Promise<Uint8Array>{
 const out=new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream as unknown as ReadableWritablePair<Uint8Array,Uint8Array>));
 return new Uint8Array(await out.arrayBuffer());
}
const canDeflate=()=>{try{return typeof CompressionStream!=='undefined'&&!!new CompressionStream('deflate-raw' as CompressionFormat);}catch{return false;}};

export async function encodePlay(p:Play):Promise<string>{
 const json=new TextEncoder().encode(JSON.stringify(pack(p)));
 if(canDeflate())try{return 'z'+b64url(await through(json,new CompressionStream('deflate-raw' as CompressionFormat)));}catch{/* plain below */}
 return 'j'+b64url(json);
}
export async function decodePlay(code:string):Promise<Play|null>{
 if(typeof code!=='string'||code.length<2||code.length>12000||!/^[zj][A-Za-z0-9_-]+$/.test(code))return null;
 try{
  let bytes=unb64url(code.slice(1));
  if(code[0]==='z'){if(typeof DecompressionStream==='undefined')return null;bytes=await through(bytes,new DecompressionStream('deflate-raw' as CompressionFormat));}
  if(bytes.length>200_000)return null;
  return unpack(JSON.parse(new TextDecoder().decode(bytes)));
 }catch{return null;}
}
export const shareUrl=(code:string,base:string)=>`${base.replace(/[#?].*$/,'').replace(/\/$/,'')}/#${SHARE_HASH}=${code}`;
/** The code from a location hash like '#play=z…', or null. */
export function readShareHash(hash:string):string|null{const m=new RegExp(`^#${SHARE_HASH}=([zj][A-Za-z0-9_-]+)$`).exec(hash||'');return m?m[1]:null;}
