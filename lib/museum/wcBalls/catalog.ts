/**
 * World Cup ball gallery (Oct 5 2026, user: "a section to view all the world cup balls … scroll through them dating back as far
 * as possible … turn the balls and see all around them"). Every official men's World Cup match ball, 1930 → 2026, plus the
 * final-only balls as variants of their tournament. Facts and sources: docs/museum/WORLD_CUP_BALLS.md (Wikipedia-sourced).
 * Designs are procedural recreations (lib/museum/wcBalls/designs/<id>.ts) without maker logos or trademarks.
 */
import FACTS from './ballFacts.json';
/** One ball. `final` is the tournament's second ball (its final-only ball, or 1930's second-half ball), with `finalLabel`. */
export type WcSource={title:string;url:string};
export type WcBall={id:string;year:number;name:string;host:string;maker:string;panels:string;facts:readonly string[];sources:readonly WcSource[];final?:WcBall;finalLabel?:string};
type FactRow={maker:string;panels:string;facts:string[];sources:WcSource[]};
const b=(id:string,year:number,name:string,host:string,final?:WcBall,finalLabel='Final ball'):WcBall=>{const f=(FACTS as Record<string,FactRow>)[id];
 return {id,year,name,host,maker:f?.maker??'',panels:f?.panels??'',facts:f?.facts??[],sources:f?.sources??[],final,finalLabel:final?finalLabel:undefined};};
export const WC_BALLS:readonly WcBall[]=[
 b('1930-tiento',1930,'Tiento','Uruguay',b('1930-t-model',1930,'T-Model','Uruguay'),'Second-half ball'),
 b('1934-federale-102',1934,'Federale 102','Italy'),
 b('1938-allen',1938,'Allen','France'),
 b('1950-duplo-t',1950,'Duplo T','Brazil'),
 b('1954-swiss-world-champion',1954,'Swiss World Champion','Switzerland'),
 b('1958-top-star',1958,'Top Star','Sweden'),
 b('1962-crack',1962,'Crack','Chile'),
 b('1966-challenge-4-star',1966,'Challenge 4-Star','England'),
 b('1970-telstar',1970,'Telstar','Mexico'),
 b('1974-telstar-durlast',1974,'Telstar Durlast','West Germany'),
 b('1978-tango',1978,'Tango','Argentina'),
 b('1982-tango-espana',1982,'Tango España','Spain'),
 b('1986-azteca',1986,'Azteca','Mexico'),
 b('1990-etrusco-unico',1990,'Etrusco Unico','Italy'),
 b('1994-questra',1994,'Questra','USA'),
 b('1998-tricolore',1998,'Tricolore','France'),
 b('2002-fevernova',2002,'Fevernova','South Korea / Japan'),
 b('2006-teamgeist',2006,'Teamgeist','Germany',b('2006-teamgeist-berlin',2006,'Teamgeist Berlin','Germany')),
 b('2010-jabulani',2010,'Jabulani','South Africa',b('2010-jobulani',2010,'Jo’bulani','South Africa')),
 b('2014-brazuca',2014,'Brazuca','Brazil',b('2014-brazuca-final-rio',2014,'Brazuca Final Rio','Brazil')),
 b('2018-telstar-18',2018,'Telstar 18','Russia',b('2018-telstar-mechta',2018,'Telstar Mechta','Russia')),
 b('2022-al-rihla',2022,'Al Rihla','Qatar',b('2022-al-hilm',2022,'Al Hilm','Qatar')),
 b('2026-trionda',2026,'Trionda','USA / Canada / Mexico',b('2026-trionda-final',2026,'Trionda Final','USA / Canada / Mexico')),
];
/** The Women's World Cup balls (the first ball made for a Women's World Cup was 1999's; 1991 and 1995 used men's-style balls). */
export const WWC_BALLS:readonly WcBall[]=[
 b('wwc-1999-icon',1999,'Icon','USA'),
 b('wwc-2003-fevernova',2003,'Fevernova','USA'),
 b('wwc-2007-teamgeist-blue',2007,'Teamgeist Blue','China'),
 b('wwc-2011-speedcell',2011,'Speedcell','Germany'),
 b('wwc-2015-conext15',2015,'Conext 15','Canada',b('wwc-2015-conext15-final-vancouver',2015,'Conext 15 Final Vancouver','Canada')),
 b('wwc-2019-conext19',2019,'Conext 19','France',b('wwc-2019-tricolore19',2019,'Tricolore 19','France'),'Knockout ball'),
 b('wwc-2023-oceaunz',2023,'Oceaunz','Australia / New Zealand',b('wwc-2023-oceaunz-final-pro',2023,'Oceaunz Final Pro','Australia / New Zealand')),
];
export type WcCompetition='men'|'women';
export const COMPETITIONS={men:{label:'Men’s World Cup',short:'Men',balls:WC_BALLS,first:1930},women:{label:'Women’s World Cup',short:'Women',balls:WWC_BALLS,first:1991}} as const;
/** Where a ball id lives: its tournament's index, and whether it is that tournament's second ball. */
export function findBall(id:string|undefined){for(const c of ['men','women'] as const){const set=COMPETITIONS[c].balls,i=set.findIndex(x=>x.id===id||x.final?.id===id);if(i>=0)return {competition:c,index:i,final:set[i].final?.id===id};}return null;}
/** Years with no men's World Cup (the gallery's timeline shows the gap). */
export const NO_CUP_YEARS=[1942,1946] as const;
