/** The hero title's name: no longer coloured (owner, Nov 3 2026), it keeps the headline's ink. Kept as a component so it never breaks across lines. */
export default function HeroName({text}:{text:string}){
 return <span style={{whiteSpace:'nowrap'}}>{text}</span>;
}
