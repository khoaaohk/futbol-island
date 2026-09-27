/** Island narration belongs to its document; stop detached Audio elements as well as visible media. */
const voices=new Set<HTMLMediaElement>();
let departed=false;
export const islandNarrationAllowed=()=>!departed&&typeof window!=='undefined'&&!/^\/arcade(?:\/|$)/.test(window.location.pathname)&&!document.hidden;
export function registerIslandNarration(media:HTMLMediaElement){
 const guard=()=>{if(!islandNarrationAllowed())media.pause();};
 // One narration at a time: a voice that starts pauses any other registered voice (a newer film or lesson line wins).
 const started=()=>{guard();if(media.paused)return;for(const other of voices)if(other!==media&&!other.paused)other.pause();};
 const hide=()=>media.pause();
 voices.add(media);media.addEventListener('play',started);window.addEventListener('pagehide',hide);
 guard();
 return()=>{voices.delete(media);media.removeEventListener('play',started);window.removeEventListener('pagehide',hide);};
}
export function stopIslandNarration(){
 departed=true;
 for(const media of voices){media.pause();media.removeAttribute('src');media.load();}
 for(const media of document.querySelectorAll<HTMLMediaElement>('audio,video'))media.pause();
}
