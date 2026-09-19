import reference from './positionReference.json';
import players from './positionPlayers.json';
import type {Format} from './venues';
export type PositionInfo={name:string;role:keyof typeof players;attack:string;defense:string;keySkills:string[];note?:string};
export type PositionSelection={format:Format;id:string;label:string;team:'gold'|'blue'};
export function positionLabel(format:Format,id:string){const base=id.replace(/^d/,'').toUpperCase();return format==='futsal'?({GK:'GK',CB:'FIXO',LM:'ALA',RM:'ALA',ST:'PIVOT'}[base]??base):base;}
export function positionInfo(selection:Pick<PositionSelection,'format'|'label'>):PositionInfo|undefined{return (reference[selection.format] as Record<string,PositionInfo>)[selection.label];}
export const POSITION_PLAYERS=players;
export const POSITION_SOURCES=[
 {title:'FIFPRO World 11 (2025)',url:'https://www.fifpro.org/en/articles/2025/11/who-is-in-the-2025-fifpro-men-s-world-11'},
 {title:'UEFA Futsal EURO selections (2026)',url:'https://www.uefa.com/futsaleuro/news/02a2-1fe2082ca517-e4648b9fe3ec-1000--futsal-euro-2026-team-of-the-tournament/'},
 {title:'UEFA Futsal Champions League (2026)',url:'https://www.uefa.com/uefafutsalchampionsleague/news/02a5-2097e40b785b-180375c3d0ae-1000--sporting-cp-s-zicky-named-2026-uefa-futsal-champions-lea/'},
 {title:'UEFA Futsal EURO 2026 squads',url:'https://www.uefa.com/futsaleuro/news/02a1-1fba97ba75aa-651b53b2b60f-1000--futsal-euro-2026-squads-check-out-every-team-s-14-player/'},
 {title:'Futsal goalkeeper award history',url:'https://www.futsalplanet.com/news.aspx?id=1289&pa=2'},
 {title:'UEFA futsal legends and roles',url:'https://www.uefa.com/uefafutsalchampionsleague/news/0262-1083b0377aa6-a225624d90ad-1000/'},
 {title:'UEFA futsal club records',url:'https://www.uefa.com/news/0257-0dee5f6c6262-cb26a24f2d96-1000--uefa-futsal-club-records/'},
 {title:'Barcelona futsal squad',url:'https://www.fcbarcelona.com/en/futsal/first-team/players'}
];
