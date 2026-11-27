/**
 * Sky / horizon / far-sea / tunnel look switch (Nov 26 2026, owner: "add clouds in the background and improve the skyline distance,
 * make the ocean more visually appealing"; tunnel: "make it light and not dark"). Default ON. `?sky=0` restores the look before this
 * work exactly (flat background colour, the old far sea, the black tunnel mouth and the old wire); `?tunnel=0` turns off only the
 * tunnel rebuild. Read once per page: the flags pick shader source and geometry that are fixed at build / compile time.
 */
let cached:{sky:boolean;tunnel:boolean}|null=null;
function read(){
 try{const q=new URLSearchParams(window.location.search),sky=q.get('sky')!=='0';return {sky,tunnel:sky&&q.get('tunnel')!=='0'};}
 catch{return {sky:true,tunnel:true};}
}
/** The new sky dome, clouds, horizon, far sea and wire fade. */
export function skyOn():boolean{if(typeof window==='undefined')return true;return (cached??=read()).sky;}
/** The lit, see-through railway tunnel. */
export function tunnelOn():boolean{if(typeof window==='undefined')return true;return (cached??=read()).tunnel;}
