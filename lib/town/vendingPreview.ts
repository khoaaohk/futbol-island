import {devUnlockHostAllowed} from '../dev/devUnlockGate';
/**
 * Explicit, URL-scoped testing session (`?preview=all`). Never grants ownership or mutates the wallet.
 * Developer-only (G-16, Sep 30 2026): like `?unlock=all`, it needs a non-production build on localhost/127.0.0.1
 * (lib/dev/devUnlockGate.ts). On futbolisland.app, a preview URL or a LAN IP the flag is ignored and the island plays normally.
 */
export function isVendingPreview(search?:string,env?:{nodeEnv:string|undefined;hostname:string}):boolean {
 const hostname=env?.hostname??(typeof window==='undefined'?'':window.location?.hostname??'');
 if(!devUnlockHostAllowed({nodeEnv:env?env.nodeEnv:process.env.NODE_ENV,hostname}))return false;
 const query=search??(typeof window==='undefined'?'':window.location.search);
 return new URLSearchParams(query).get('preview')==='all';
}
/** `?preview=all&testCoins=50000`: the one-time 50,000 testing grant. Same developer-only gate as the preview itself. */
export function testCoinsRequested(search?:string,env?:{nodeEnv:string|undefined;hostname:string}):boolean{
 if(!isVendingPreview(search,env))return false;
 const query=search??(typeof window==='undefined'?'':window.location.search);
 return new URLSearchParams(query).get('testCoins')==='50000';
}
