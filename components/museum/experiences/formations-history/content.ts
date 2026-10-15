import type {MuseumSource} from '@/lib/endgame/museum';
/** formations-history · words (Oct 14 2026). Dates and names checked against the sources below. */
export const QUIZ:readonly {q:string;options:readonly string[];answer:number;why:string}[]=[
 {q:'Which shape was football’s first long-lasting formation?',options:['4-4-2','2-3-5, the pyramid','4-2-3-1'],answer:1,why:'The 2-3-5 was recorded in 1880 and was the standard in England by the 1890s.'},
 {q:'Why did Herbert Chapman pull a player back to make the WM?',options:['He wanted six forwards','The pitch got smaller','After the 1925 offside change, strikers could stand nearer the goal'],answer:2,
  why:'The 1925 law needed only two opponents, so his extra centre-back marked the centre-forward.'},
 {q:'On the machine, what happened when you squeezed the WIDTH slider?',options:['The wings were left empty','The team got faster','Nothing changed'],answer:0,why:'A narrow shape leaves the touchlines empty. Width means someone near each side.'},
];
export const BALANCE='Coaches check three things in any shape: width (use both touchlines), depth (defence to attack, no big holes) and cover (every space has someone, nobody on top of a teammate).';
export const SOURCES:readonly MuseumSource[]=[
 {title:'Wikipedia · Formation (association football)',url:'https://en.wikipedia.org/wiki/Formation_(association_football)'},
 {title:'Wikipedia · Herbert Chapman',url:'https://en.wikipedia.org/wiki/Herbert_Chapman'},
 {title:'Wikipedia · 1958 FIFA World Cup',url:'https://en.wikipedia.org/wiki/1958_FIFA_World_Cup'},
];
