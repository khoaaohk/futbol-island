/**
 * Rounded vehicles and boats switch (Nov 26 2026, owner shots 149 / 152: "we need to round this boat more and also the other cars on
 * the island"; "these boats in the middle of the sea need to be moving and have the waves move with it"). Default ON. `?vehicles=0`
 * restores the look before this work exactly: the box ferry and its old sway, the old deep-sea boat hull and its small bob, the box
 * street cars. Read once per page: the flag picks geometry and constants that are fixed at build time.
 */
let cached:boolean|null=null;
function read(){try{return new URLSearchParams(window.location.search).get('vehicles')!=='0';}catch{return true;}}
/** The rounded ferry, boats and cars, and the boats' swell rocking + water rings. Node (tests): ON. */
export function vehiclesOn():boolean{if(typeof window==='undefined')return true;return cached??=read();}
