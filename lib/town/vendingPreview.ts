/** Explicit, URL-scoped testing session. Never grant ownership or mutate the wallet. */
export function isVendingPreview(search?:string):boolean {
 const query=search??(typeof window==='undefined'?'':window.location.search);
 return new URLSearchParams(query).get('preview')==='all';
}
