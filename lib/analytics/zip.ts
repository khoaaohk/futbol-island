/**
 * A minimal ZIP writer (Nov 6 2026, the admin export's "All files" download): STORED entries only (no compression), so it
 * needs no dependency; CSV text is small. Format: PKWARE APPNOTE 4.3.6 local headers + central directory + end record.
 */
let TABLE:Uint32Array|null=null;
export function crc32(b:Uint8Array):number{
 if(!TABLE){TABLE=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;TABLE[n]=c>>>0;}}
 let c=0xffffffff;for(let i=0;i<b.length;i++)c=TABLE[(c^b[i])&0xff]^(c>>>8);return (c^0xffffffff)>>>0;
}
export function storeZip(files:{name:string;text:string}[],when=new Date()):Uint8Array{
 const enc=new TextEncoder(),parts:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0;
 const time=(when.getHours()<<11)|(when.getMinutes()<<5)|(when.getSeconds()>>1),date=((when.getFullYear()-1980)<<9)|((when.getMonth()+1)<<5)|when.getDate();
 for(const f of files){
  const name=enc.encode(f.name),data=enc.encode(f.text),crc=crc32(data);
  const h=new DataView(new ArrayBuffer(30));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,time,true);h.setUint16(12,date,true);
  h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);h.setUint16(28,0,true);
  parts.push(new Uint8Array(h.buffer),name,data);
  const c=new DataView(new ArrayBuffer(46));
  c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,time,true);c.setUint16(14,date,true);
  c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);
  c.setUint16(30,0,true);c.setUint16(32,0,true);c.setUint16(34,0,true);c.setUint16(36,0,true);c.setUint32(38,0,true);c.setUint32(42,offset,true);
  central.push(new Uint8Array(c.buffer),name);
  offset+=30+name.length+data.length;
 }
 const cdSize=central.reduce((a,b)=>a+b.length,0),e=new DataView(new ArrayBuffer(22));
 e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cdSize,true);e.setUint32(16,offset,true);
 const all=[...parts,...central,new Uint8Array(e.buffer)],out=new Uint8Array(all.reduce((a,b)=>a+b.length,0));
 let o=0;for(const b of all){out.set(b,o);o+=b.length;}
 return out;
}
