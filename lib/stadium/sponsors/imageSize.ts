/**
 * Read a picture's real type and pixel size from its first bytes (Nov 12 2026; the admin upload check, server side). The
 * browser's declared type is not trusted: the bytes decide. PNG (IHDR), WebP (VP8 / VP8L / VP8X) and baseline or progressive
 * JPEG (SOFn). Anything else, or a truncated header, is null. Pure.
 */
import type {SponsorImageType} from './slots';

export type ImageInfo={type:SponsorImageType;width:number;height:number};
export function imageInfo(b:Uint8Array):ImageInfo|null{
 const u16be=(i:number)=>b[i]<<8|b[i+1],u32be=(i:number)=>(b[i]<<24>>>0)+(b[i+1]<<16)+(b[i+2]<<8)+b[i+3];
 const u16le=(i:number)=>b[i]|b[i+1]<<8,u24le=(i:number)=>b[i]|b[i+1]<<8|b[i+2]<<16;
 const ascii=(i:number,n:number)=>String.fromCharCode(...b.subarray(i,i+n));
 if(b.length>=24&&b[0]===0x89&&ascii(1,3)==='PNG'&&ascii(12,4)==='IHDR')return ok('image/png',u32be(16),u32be(20));
 if(b.length>=30&&ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP'){
  const kind=ascii(12,4);
  if(kind==='VP8X')return ok('image/webp',u24le(24)+1,u24le(27)+1);
  if(kind==='VP8L'&&b[20]===0x2f){const v=b[21]|b[22]<<8|b[23]<<16|b[24]<<24;return ok('image/webp',(v&0x3fff)+1,((v>>>14)&0x3fff)+1);}
  if(kind==='VP8 '&&b[23]===0x9d&&b[24]===0x01&&b[25]===0x2a)return ok('image/webp',u16le(26)&0x3fff,u16le(28)&0x3fff);
  return null;
 }
 if(b.length>=4&&b[0]===0xff&&b[1]===0xd8){
  let i=2;
  while(i+9<b.length){
   if(b[i]!==0xff){i++;continue;}
   const m=b[i+1];
   if(m===0xd8||m===0x01||(m>=0xd0&&m<=0xd7)||m===0xff){i+=m===0xff?1:2;continue;}
   const len=u16be(i+2);
   if(m>=0xc0&&m<=0xcf&&m!==0xc4&&m!==0xc8&&m!==0xcc)return ok('image/jpeg',u16be(i+7),u16be(i+5));
   if(len<2)return null;i+=2+len;
  }
 }
 return null;
}
const ok=(type:SponsorImageType,width:number,height:number):ImageInfo|null=>width>0&&height>0&&width<=20000&&height<=20000?{type,width,height}:null;
