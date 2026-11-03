/** The hero title's name (owner, Nov 3 2026): "Futbol Island." is the one coloured part of the headline, one static app colour, no colour changes or fades. */
export default function HeroName({text}:{text:string}){
 return <span style={{whiteSpace:'nowrap',color:'#e8479b'}}>{text}</span>;
}
