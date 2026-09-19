declare module 'qrcode' {
 const qr:{toDataURL:(text:string,options?:{width?:number;margin?:number;errorCorrectionLevel?:'L'|'M'|'Q'|'H'})=>Promise<string>};
 export default qr;
}
