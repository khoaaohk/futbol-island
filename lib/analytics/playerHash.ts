/**
 * Nov 10 2026 (privacy audit, owner: "stop the raw save code reaching analytics"). The one-way player hash made ON THE DEVICE:
 * SHA-256 of a fixed app string + the save code, as 64 lowercase hex. Only this hash ever leaves the browser for analytics
 * (POST /api/visit `ph`); the server then keys it again (lib/analytics/playerId.ts, a salt rotated every 90 days) and stores only
 * that. Synchronous (no WebCrypto promise) so the session's first beacon can carry it; plain SHA-256, checked against node's
 * crypto in tests/privacy-nov10.cjs. Safe to import on the client and the server.
 */
export const PLAYER_HASH_LABEL='futbol-island analytics player v1|';
export const PLAYER_HASH_RE=/^[0-9a-f]{64}$/;

const K=new Uint32Array([
 0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,
 0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
 0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,
 0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
 0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,
 0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);

/** SHA-256 of a UTF-8 string, as lowercase hex. */
export function sha256Hex(text:string):string{
 const msg=new TextEncoder().encode(text),bitLen=msg.length*8;
 const total=((msg.length+9+63)>>6)<<6,buf=new Uint8Array(total);buf.set(msg);buf[msg.length]=0x80;
 const dv=new DataView(buf.buffer);dv.setUint32(total-8,Math.floor(bitLen/0x100000000));dv.setUint32(total-4,bitLen>>>0);
 const H=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]),W=new Uint32Array(64);
 const rot=(x:number,n:number)=>(x>>>n)|(x<<(32-n));
 for(let o=0;o<total;o+=64){
  for(let i=0;i<16;i++)W[i]=dv.getUint32(o+i*4);
  for(let i=16;i<64;i++){const a=W[i-15],b=W[i-2];W[i]=(W[i-16]+(rot(a,7)^rot(a,18)^(a>>>3))+W[i-7]+(rot(b,17)^rot(b,19)^(b>>>10)))>>>0;}
  let a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
  for(let i=0;i<64;i++){
   const t1=(h+(rot(e,6)^rot(e,11)^rot(e,25))+((e&f)^(~e&g))+K[i]+W[i])>>>0,t2=((rot(a,2)^rot(a,13)^rot(a,22))+((a&b)^(a&c)^(b&c)))>>>0;
   h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
  }
  H[0]+=a;H[1]+=b;H[2]+=c;H[3]+=d;H[4]+=e;H[5]+=f;H[6]+=g;H[7]+=h;
 }
 return [...H].map(x=>x.toString(16).padStart(8,'0')).join('');
}

/** The hash a device sends for its active save code (never the code). */
export const playerHash=(code:string)=>sha256Hex(PLAYER_HASH_LABEL+code);
