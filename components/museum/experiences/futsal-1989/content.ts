import type {MuseumSource} from '@/lib/endgame/museum';
/**
 * futsal-1989 · the verified facts and sources (kept from the Oct 5–10 2026 versions through the pixel-iso and the Oct 12 anatomy Paper rebuilds).
 * The case's own three facts and its "take it to your game" line come from lib/endgame/museum.ts through the exhibit prop.
 * Ball numbers: FIFA Futsal Laws of the Game, Law 2 (dropped from 2 m, a futsal ball bounces back 50–65 cm; 62–64 cm around,
 * 400–440 g) and the FIFA Quality Programme (a FIFA Quality Pro grass ball bounces back 120–165 cm). Court and pitch sizes:
 * Futsal Laws (Law 1) and the IFAB Laws of the Game (Law 1). Positions: Wikipedia "Futsal". The 1989 final: FIFA.
 */
export const BALL={
 drop:200,// cm
 futsal:{lo:50,hi:65,around:'62–64 cm around',weight:'400–440 g'},
 grass:{lo:120,hi:165,law:'FIFA Quality Pro'},
} as const;
export const MORE_FACTS:{tag:string;text:string}[]=[
 {tag:'1930',text:'He wrote rules for YMCA courts, borrowing ideas from basketball, handball and water polo.'},
 {tag:'Ball',text:'Drop it from 2 metres: by FIFA’s futsal Law 2 it must bounce back between 50 and 65 cm. It is 62–64 cm around and weighs 400–440 g. A top grass ball (FIFA Quality Pro) bounces back 120–165 cm.'},
 {tag:'Size',text:'A futsal court for international matches is 38–42 m long and 20–25 m wide, with 5 players a side (one is the goalkeeper). An international grass pitch is 100–110 m long and 64–75 m wide, with 11 a side.'},
 {tag:'Spots',text:'Besides the goalkeeper, a futsal team usually has a defender (fixo), two wingers (alas) and a forward (pivô). Outfield players can switch positions at any time.'},
 {tag:'1989',text:'16 teams took part. In the final in Rotterdam, Brazil beat the hosts, the Netherlands, 2–1.'},
];
export const NEW_SOURCES:MuseumSource[]=[
 {title:'FIFA · Brazil beat Netherlands in first FIFA Futsal World Cup final',url:'https://www.fifa.com/en/articles/brazil-netherlands-first-final-1989'},
 {title:'FIFA · Quality Programme for footballs (rebound test)',url:'https://inside.fifa.com/innovation/standards/footballs/fifa-quality-programme-for-footballs'},
 {title:'IFAB Laws of the Game · Law 1 The Field of Play',url:'https://www.theifab.com/laws/latest/the-field-of-play/'},
];
export const MODEL_NOTE='The drop test uses real gravity and the middle of each ball’s bounce band from the Laws. The rondo is a game model built on the same bounce, not a measurement of real matches. The machines are drawings made for this museum.';
