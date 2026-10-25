/**
 * Football shop · Ball drawing save format "fi-draw" (Oct 24 2026, docs/BALL_STUDIO_AUDIT_OCT24.md P0.5).
 *
 * Why: the Draw step used to save a WebP data URL, but iPhone Safari can't write WebP, so it fell back to posterised PNG:
 * 25 strokes saved at 192×96 (blurry) and 40+ strokes didn't fit DRAW_MAX_CHARS at all ("too busy to save", lost).
 * Kid art is a few flat colours with soft edges, so this format stores it as a palette + a 2-bit alpha, deflated.
 *
 * URL:   data:application/x-fi-draw;base64,<bytes>
 * Bytes (version 1):
 *   [0]      version = 1 (anything else: not readable by this build → no drawing, never a crash)
 *   [1..2]   width  (uint16 LE)   [3..4] height (uint16 LE); width = 2 × height, ≤ 1024 (512×256 normally)
 *   [5]      n = palette size, 1…64
 *   [6..]    n × RGB (straight colour)
 *   [6+3n..] raw DEFLATE (RFC 1951, no zlib header) of width×height bytes, row 0 = the north pole:
 *            byte = level | index << 2. level 0…3 = alpha 0, 64, 128, 255 (128 = the soft marker); level 0 → byte 0.
 *
 * Encoding is synchronous (the studio flushes the drawing right before saving/buying), so it uses the small pure-JS deflate
 * below (LZ77 + one dynamic-Huffman block; any inflater reads it, tests check zlib does). Decoding prefers the browser's
 * DecompressionStream('deflate-raw') and falls back to the pure-JS inflate here. Pure (no DOM): tests run it in Node.
 */
export const FI_DRAW_PREFIX='data:application/x-fi-draw;base64,';
export const FI_DRAW_VERSION=1;
/** Alpha for each 2-bit level. */
export const FI_ALPHA=[0,64,128,255] as const;
const PAL_MAX=64,MAX_W=1024;
const level=(a:number)=>a<32?0:a<96?1:a<192?2:3;

// ---- palette + raster -----------------------------------------------------------------------------------------------
/** Quantise straight-alpha RGBA (w×h) to palette + level bytes. Null when nothing is visible. */
export function quantise(px:ArrayLike<number>,w:number,h:number):{pal:number[];idx:Uint8Array}|null{
 const n=w*h,bins=new Map<number,number[]>();
 for(let i=0;i<n;i++){const a=px[i*4+3];if(level(a)===0)continue;const r=px[i*4],g=px[i*4+1],b=px[i*4+2];
  const k=(r>>3)<<10|(g>>3)<<5|(b>>3);let e=bins.get(k);if(!e){e=[0,0,0,0];bins.set(k,e);}e[0]+=a;e[1]+=r*a;e[2]+=g*a;e[3]+=b*a;}
 if(!bins.size)return null;
 // Heaviest colours first; a colour joins the palette only when it is clearly different from the ones already in it.
 const order=[...bins.values()].sort((x,y)=>y[0]-x[0]),pal:number[]=[];
 const minD=40*40;
 for(const e of order){if(pal.length>=PAL_MAX*3)break;
  const r=Math.round(e[1]/e[0]),g=Math.round(e[2]/e[0]),b=Math.round(e[3]/e[0]);let ok=true;
  for(let j=0;j<pal.length;j+=3){const dr=pal[j]-r,dg=pal[j+1]-g,db=pal[j+2]-b;if(dr*dr+dg*dg+db*db<minD){ok=false;break;}}
  if(ok)pal.push(r,g,b);}
 const near=new Map<number,number>(),idx=new Uint8Array(n);
 for(let i=0;i<n;i++){const lv=level(px[i*4+3]);if(!lv)continue;const r=px[i*4],g=px[i*4+1],b=px[i*4+2],k=r<<16|g<<8|b;
  let best=near.get(k);
  if(best===undefined){let bd=Infinity;best=0;for(let j=0;j<pal.length;j+=3){const dr=pal[j]-r,dg=pal[j+1]-g,db=pal[j+2]-b,d=dr*dr+dg*dg+db*db;if(d<bd){bd=d;best=j/3;}}near.set(k,best);}
  idx[i]=lv|best<<2;}
 return {pal,idx};
}
/** Straight-alpha RGBA from palette + level bytes. */
export function expand(pal:ArrayLike<number>,idx:Uint8Array,w:number,h:number):Uint8ClampedArray{
 const out=new Uint8ClampedArray(w*h*4);
 for(let i=0;i<w*h;i++){const v=idx[i];if(!(v&3))continue;const p=(v>>2)*3,o=i*4;out[o]=pal[p];out[o+1]=pal[p+1];out[o+2]=pal[p+2];out[o+3]=FI_ALPHA[v&3];}
 return out;
}

// ---- base64 (no Buffer/btoa needed) ---------------------------------------------------------------------------------
const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function toB64(b:Uint8Array):string{let s='';for(let i=0;i<b.length;i+=3){const n=b[i]<<16|(b[i+1]??0)<<8|(b[i+2]??0);
  s+=B64[n>>18&63]+B64[n>>12&63]+(i+1<b.length?B64[n>>6&63]:'=')+(i+2<b.length?B64[n&63]:'=');}return s;}
function fromB64(s:string):Uint8Array|null{if(s.length%4||/[^A-Za-z0-9+/=]/.test(s))return null;const pad=s.endsWith('==')?2:s.endsWith('=')?1:0;
 const out=new Uint8Array(s.length/4*3-pad);let o=0;
 for(let i=0;i<s.length;i+=4){let n=0;for(let k=0;k<4;k++){const c=s[i+k];n=n<<6|(c==='='?0:B64.indexOf(c));}
  if(o<out.length)out[o++]=n>>16&255;if(o<out.length)out[o++]=n>>8&255;if(o<out.length)out[o++]=n&255;}
 return out;}

// ---- deflate (raw, one dynamic block) -------------------------------------------------------------------------------
const LBASE=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
const LEXT=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
const DBASE=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
const DEXT=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
const CL_ORDER=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
const codeOf=(base:number[],v:number)=>{let c=base.length-1;while(base[c]>v)c--;return c;};

/** Huffman code lengths ≤ limit (rebuilds with flattened counts until it fits); always at least two codes. */
function huffLengths(freq:number[],limit:number):number[]{
 const f=freq.slice();let used=f.filter(x=>x>0).length;for(let i=0;used<2&&i<f.length;i++)if(!f[i]){f[i]=1;used++;}
 for(;;){const w:number[]=[],par:number[]=[],leaf:number[]=[];let act:number[]=[];
  for(let s=0;s<f.length;s++)if(f[s]>0){leaf[s]=w.length;act.push(w.length);w.push(f[s]);}
  while(act.length>1){act.sort((a,b)=>w[a]-w[b]);const a=act[0],b=act[1];act=act.slice(2);const id=w.length;w.push(w[a]+w[b]);par[a]=par[b]=id;act.push(id);}
  const len=f.map((x,s)=>{if(!(x>0))return 0;let d=0,n=leaf[s];while(par[n]!==undefined){n=par[n];d++;}return d;});
  if(Math.max(...len)<=limit)return len;
  for(let s=0;s<f.length;s++)if(f[s]>0)f[s]=(f[s]>>1)+1;}
}
const rev=(c:number,n:number)=>{let r=0;for(let i=0;i<n;i++){r=r<<1|c&1;c>>=1;}return r;};
function canon(len:number[]):number[]{const cnt=new Array(16).fill(0);for(const l of len)if(l)cnt[l]++;const next=new Array(16).fill(0);cnt[0]=0;
 let c=0;for(let b=1;b<16;b++){c=(c+cnt[b-1])<<1;next[b]=c;}
 return len.map(l=>l?rev(next[l]++,l):0);}

/** Raw DEFLATE of `d` (RFC 1951): greedy LZ77 with hash chains, one dynamic-Huffman block. */
export function deflateRaw(d:Uint8Array):Uint8Array{
 const n=d.length,WS=32768,WM=WS-1,HS=1<<15,head=new Int32Array(HS).fill(-1),prev=new Int32Array(WS).fill(-1);
 const toks:number[]=[];// literal: v; match: 256 + (len<<16 | dist)... kept as two entries [-len, dist]
 const lf=new Array(286).fill(0),df=new Array(30).fill(0);
 const hash=(i:number)=>((d[i]<<10)^(d[i+1]<<5)^d[i+2])&(HS-1);
 const insert=(i:number)=>{if(i+2>=n)return;const h=hash(i);prev[i&WM]=head[h];head[h]=i;};
 let fl=0,fd=0;// find(): the longest earlier match at i (fl, fd)
 const find=(i:number)=>{fl=0;fd=0;if(i+2>=n)return;const max=Math.min(258,n-i);let j=head[hash(i)],chain=128;
  while(j>=0&&i-j<=WS&&chain-->0){if(d[j+fl]===d[i+fl]){let l=0;while(l<max&&d[j+l]===d[i+l])l++;if(l>fl){fl=l;fd=i-j;if(l===max)break;}}
   const nx=prev[j&WM];if(nx>=j)break;j=nx;}};
 const lit=(i:number)=>{toks.push(d[i]);lf[d[i]]++;};
 // Lazy matching: when the next position has a longer match, emit this byte as a literal and take that one.
 let i=0;find(0);let bl=fl,bd=fd;
 while(i<n){
  if(bl<3){lit(i);insert(i);i++;find(i);bl=fl;bd=fd;continue;}
  insert(i);
  if(bl<258&&i+1<n){find(i+1);if(fl>bl){lit(i);i++;bl=fl;bd=fd;continue;}}
  toks.push(-bl,bd);lf[257+codeOf(LBASE,bl)]++;df[codeOf(DBASE,bd)]++;for(let k=1;k<bl;k++)insert(i+k);i+=bl;find(i);bl=fl;bd=fd;}
 lf[256]=1;
 const ll=huffLengths(lf,15),dl=huffLengths(df,15),lc=canon(ll),dc=canon(dl);
 let hlit=286;while(hlit>257&&!ll[hlit-1])hlit--;let hdist=30;while(hdist>1&&!dl[hdist-1])hdist--;
 // Code-length alphabet: run-length the concatenated lengths with 16/17/18.
 const seq=[...ll.slice(0,hlit),...dl.slice(0,hdist)],cl:number[][]=[],cf=new Array(19).fill(0);
 for(let i=0;i<seq.length;){const v=seq[i];let r=1;while(i+r<seq.length&&seq[i+r]===v)r++;i+=r;
  if(v===0){while(r>=11){const k=Math.min(r,138);cl.push([18,k-11]);r-=k;}if(r>=3){cl.push([17,r-3]);r=0;}while(r-->0)cl.push([0,0]);}
  else{cl.push([v,0]);r--;while(r>=3){const k=Math.min(r,6);cl.push([16,k-3]);r-=k;}while(r-->0)cl.push([v,0]);}}
 for(const [s] of cl)cf[s]++;
 const cll=huffLengths(cf,7),clc=canon(cll);let hclen=19;while(hclen>4&&!cll[CL_ORDER[hclen-1]])hclen--;
 // Bit writer (LSB first).
 const out:number[]=[];let acc=0,nb=0;
 const put=(v:number,k:number)=>{acc|=v<<nb;nb+=k;while(nb>=8){out.push(acc&255);acc>>>=8;nb-=8;}};
 put(1,1);put(2,2);put(hlit-257,5);put(hdist-1,5);put(hclen-4,4);
 for(let i=0;i<hclen;i++)put(cll[CL_ORDER[i]],3);
 for(const [s,x] of cl){put(clc[s],cll[s]);if(s===16)put(x,2);else if(s===17)put(x,3);else if(s===18)put(x,7);}
 for(let t=0;t<toks.length;t++){const v=toks[t];
  if(v>=0){put(lc[v],ll[v]);continue;}
  const len=-v,dist=toks[++t],c=codeOf(LBASE,len),e=codeOf(DBASE,dist);
  put(lc[257+c],ll[257+c]);if(LEXT[c])put(len-LBASE[c],LEXT[c]);put(dc[e],dl[e]);if(DEXT[e])put(dist-DBASE[e],DEXT[e]);}
 put(lc[256],ll[256]);if(nb>0)out.push(acc&255);
 return Uint8Array.from(out);
}

// ---- inflate (raw; stored, fixed and dynamic blocks) ----------------------------------------------------------------
type Huff={count:Int16Array;sym:Int16Array};
function mkHuff(len:ArrayLike<number>):Huff{const count=new Int16Array(16),sym=new Int16Array(len.length),offs=new Int16Array(16);
 for(let i=0;i<len.length;i++)count[len[i]]++;count[0]=0;for(let i=1;i<16;i++)offs[i]=offs[i-1]+count[i-1];
 for(let i=0;i<len.length;i++)if(len[i])sym[offs[len[i]]++]=i;return {count,sym};}
/** Raw INFLATE, at most `max` bytes out (throws on bad or oversize data). */
export function inflateRaw(src:Uint8Array,max:number):Uint8Array{
 const out=new Uint8Array(max);let o=0,pos=0,bb=0,bn=0;
 const bits=(k:number)=>{while(bn<k){if(pos>=src.length)throw new Error('eof');bb|=src[pos++]<<bn;bn+=8;}const v=bb&((1<<k)-1);bb>>>=k;bn-=k;return v;};
 const dec=(h:Huff)=>{let code=0,first=0,index=0;for(let l=1;l<16;l++){code|=bits(1);const c=h.count[l];if(code-c<first)return h.sym[index+code-first];index+=c;first=(first+c)<<1;code<<=1;}throw new Error('code');};
 const fixL=new Array(288).fill(8).fill(9,144,256).fill(7,256,280),fixD=new Array(30).fill(5);
 for(let last=0;!last;){last=bits(1);const type=bits(2);
  if(type===0){bb=0;bn=0;if(pos+4>src.length)throw new Error('eof');const len=src[pos]|src[pos+1]<<8;pos+=4;if(pos+len>src.length||o+len>max)throw new Error('stored');out.set(src.subarray(pos,pos+len),o);o+=len;pos+=len;continue;}
  let L:Huff,D:Huff;
  if(type===1){L=mkHuff(fixL);D=mkHuff(fixD);}
  else if(type===2){const hl=bits(5)+257,hd=bits(5)+1,hc=bits(4)+4;if(hl>286||hd>30)throw new Error('hdr');const cl=new Array(19).fill(0);for(let i=0;i<hc;i++)cl[CL_ORDER[i]]=bits(3);
   const C=mkHuff(cl),lens:number[]=[];
   while(lens.length<hl+hd){const s=dec(C);if(s<16)lens.push(s);else{let v=0,r:number;if(s===16){if(!lens.length)throw new Error('rep');v=lens[lens.length-1];r=3+bits(2);}else if(s===17)r=3+bits(3);else r=11+bits(7);if(lens.length+r>hl+hd)throw new Error('rep');while(r--)lens.push(v);}}
   L=mkHuff(lens.slice(0,hl));D=mkHuff(lens.slice(hl));}
  else throw new Error('type');
  for(;;){const s=dec(L);if(s<256){if(o>=max)throw new Error('size');out[o++]=s;continue;}if(s===256)break;
   const c=s-257;if(c>=29)throw new Error('len');const len=LBASE[c]+bits(LEXT[c]);const e=dec(D);if(e>=30)throw new Error('dist');const dist=DBASE[e]+bits(DEXT[e]);
   if(dist>o||o+len>max)throw new Error('ref');for(let k=0;k<len;k++,o++)out[o]=out[o-dist];}}
 return o===max?out:out.slice(0,o);
}

// ---- the URL --------------------------------------------------------------------------------------------------------
export const isFiDraw=(url:unknown):url is string=>typeof url==='string'&&url.startsWith(FI_DRAW_PREFIX);
/** Encode straight-alpha RGBA (w×h) as a fi-draw URL; '' when nothing is visible. */
export function encodeFiDraw(px:ArrayLike<number>,w:number,h:number):string{
 const q=quantise(px,w,h);if(!q)return '';const z=deflateRaw(q.idx),np=q.pal.length/3;
 const b=new Uint8Array(6+q.pal.length+z.length);b[0]=FI_DRAW_VERSION;b[1]=w&255;b[2]=w>>8;b[3]=h&255;b[4]=h>>8;b[5]=np;b.set(q.pal,6);b.set(z,6+q.pal.length);
 return FI_DRAW_PREFIX+toB64(b);
}
export type FiParts={w:number;h:number;pal:Uint8Array;z:Uint8Array};
/** Parse the header; null for another version, bad sizes or a broken palette. */
export function parseFiDraw(url:string):FiParts|null{
 if(!isFiDraw(url))return null;const b=fromB64(url.slice(FI_DRAW_PREFIX.length));if(!b||b.length<7)return null;
 if(b[0]!==FI_DRAW_VERSION)return null;
 const w=b[1]|b[2]<<8,h=b[3]|b[4]<<8,n=b[5];if(!w||w>MAX_W||w!==h*2||n<1||n>PAL_MAX||b.length<=6+n*3)return null;
 return {w,h,pal:b.subarray(6,6+n*3),z:b.subarray(6+n*3)};
}
/** Palette indices must be in range; returns the RGBA or null. */
export function finishFiDraw(p:FiParts,idx:Uint8Array|null):Uint8ClampedArray|null{
 if(!idx||idx.length!==p.w*p.h)return null;const n=p.pal.length/3;for(let i=0;i<idx.length;i++)if((idx[i]&3)&&(idx[i]>>2)>=n)return null;
 return expand(p.pal,idx,p.w,p.h);
}
/** Synchronous decode (pure-JS inflate): straight-alpha RGBA at the stored size, or null. */
export function decodeFiDrawSync(url:string):{w:number;h:number;px:Uint8ClampedArray}|null{
 const p=parseFiDraw(url);if(!p)return null;let idx:Uint8Array|null=null;try{idx=inflateRaw(p.z,p.w*p.h);}catch{return null;}
 const px=finishFiDraw(p,idx);return px?{w:p.w,h:p.h,px}:null;
}
/** Decode, using DecompressionStream('deflate-raw') when the browser has it, else the pure-JS inflate. */
export async function decodeFiDraw(url:string):Promise<{w:number;h:number;px:Uint8ClampedArray}|null>{
 const p=parseFiDraw(url);if(!p)return null;let idx:Uint8Array|null=null;
 try{if(typeof DecompressionStream!=='undefined'&&typeof Response!=='undefined'&&typeof Blob!=='undefined'){
   const s=new Blob([p.z as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw' as CompressionFormat));
   const got=new Uint8Array(await new Response(s).arrayBuffer());if(got.length===p.w*p.h)idx=got;}}catch{idx=null;}
 if(!idx)try{idx=inflateRaw(p.z,p.w*p.h);}catch{return null;}
 const px=finishFiDraw(p,idx);return px?{w:p.w,h:p.h,px}:null;
}
/** Bilinear resize of straight-alpha RGBA (filtered premultiplied, so edges don't darken). */
export function resizeRgba(src:ArrayLike<number>,sw:number,sh:number,dw:number,dh:number):Uint8ClampedArray{
 const out=new Uint8ClampedArray(dw*dh*4);if(sw===dw&&sh===dh){for(let i=0;i<out.length;i++)out[i]=src[i];return out;}
 for(let y=0;y<dh;y++){const fy=Math.min(sh-1,Math.max(0,(y+.5)*sh/dh-.5)),y0=Math.floor(fy),y1=Math.min(sh-1,y0+1),ty=fy-y0;
  for(let x=0;x<dw;x++){const fx=Math.min(sw-1,Math.max(0,(x+.5)*sw/dw-.5)),x0=Math.floor(fx),x1=Math.min(sw-1,x0+1),tx=fx-x0;
   let r=0,g=0,b=0,a=0;
   for(const [xx,yy,wt] of [[x0,y0,(1-tx)*(1-ty)],[x1,y0,tx*(1-ty)],[x0,y1,(1-tx)*ty],[x1,y1,tx*ty]] as const){if(!wt)continue;const k=(yy*sw+xx)*4,al=src[k+3]*wt;r+=src[k]*al;g+=src[k+1]*al;b+=src[k+2]*al;a+=al;}
   const o=(y*dw+x)*4;if(a>0){out[o]=r/a;out[o+1]=g/a;out[o+2]=b/a;out[o+3]=a;}}}
 return out;
}
