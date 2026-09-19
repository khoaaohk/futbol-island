/** Small interaction pulse; unsupported browsers simply keep the interaction silent. */
export function tapHaptic(){
 if(typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return;
 try{navigator.vibrate(10);}catch{/* Some embedded browsers block vibration. */}
}
