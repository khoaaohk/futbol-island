/**
 * Links that leave Futbol Island (G-17 follow-up, Sep 30 2026). Kids'-app practice (COPPA-minded; app-store kids' category rules):
 * a child must pass the grown-up check (lib/parentGate.ts) before any link opens another site: source links on cards and
 * costumes, clip and news links, music credits, donation checkout. Pure rule, used by components/ExternalLinkGate.tsx.
 */
export function leavesSite(href:string,origin:string):boolean{
 let url:URL;try{url=new URL(href,origin);}catch{return false;}
 if(url.protocol==='mailto:'||url.protocol==='tel:'||url.protocol==='sms:')return true;
 if(url.protocol!=='http:'&&url.protocol!=='https:')return false;
 if(url.origin!==origin)return true;
 // Same-origin routes that hand off to another site (Stripe Checkout).
 return url.pathname.startsWith('/coffee/checkout');
}
