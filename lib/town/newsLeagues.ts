export const NEWS_LEAGUES={
 'eng.1':'English Premier League','esp.1':'La Liga','jpn.1':'J1 League','fra.1':'Ligue 1','ita.1':'Serie A','ger.1':'Bundesliga','bra.1':'Brazilian Série A','uefa.champions':'Champions League','eng.w.1':'Women’s Super League','usa.1':'MLS',
} as const;
export type NewsLeague=keyof typeof NEWS_LEAGUES;
export const isNewsLeague=(value:string):value is NewsLeague=>Object.prototype.hasOwnProperty.call(NEWS_LEAGUES,value);
