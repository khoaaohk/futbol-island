/**
 * Vending-machine special balls (docs/vending-machines.md). Each one is sold at exactly one machine (lib/town/vendingCatalog.ts)
 * and carries a football lesson. Skins are drawn on demand in lib/graphics/specialBallSkins.ts; effects fall back to the classic
 * ball's behaviour. Kept free of imports so customization.ts can spread these without a cycle.
 */
export type VendingSpecialBall='telstar'|'futsal'|'grassroots'|'hivis'|'eleven'|'beach'|'retro'|'panna';
export const SPECIAL_BALL_OPTIONS:{id:VendingSpecialBall;label:string;color:string}[]=[
 {id:'telstar',label:'Black & white TV ball',color:'#f4f1e8'},
 {id:'futsal',label:'Futsal ball',color:'#f2d23c'},
 {id:'grassroots',label:'Grassroots ball',color:'#7fc47a'},
 {id:'hivis',label:'Winter hi-vis ball',color:'#e7f53c'},
 {id:'eleven',label:'Size 5 match ball',color:'#f1ede2'},
 {id:'beach',label:'Beach soccer ball',color:'#ff9f6b'},
 {id:'retro',label:'Laced leather ball',color:'#8a5a33'},
 {id:'panna',label:'Panna street ball',color:'#b98af0'},
];
export const SPECIAL_BALL_COLORS=Object.fromEntries(SPECIAL_BALL_OPTIONS.map(o=>[o.id,o.color])) as Record<VendingSpecialBall,string>;
export const SPECIAL_BALL_IDS=new Set<string>(SPECIAL_BALL_OPTIONS.map(o=>o.id));
