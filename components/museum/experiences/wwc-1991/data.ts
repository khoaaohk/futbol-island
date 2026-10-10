/**
 * wwc-1991 · "A Sky of Firsts" (Oct 5 2026). Every FIFA Women's World Cup is a star; 1991 is the first and brightest.
 * All of this is REAL HISTORY (not island fiction). Every line below is checked against the sources in SOURCES.
 */
export type Winner='USA'|'Norway'|'Germany'|'Japan'|'Spain'|null;
export type Edition={
 year:number;host:string;teams:number;winner:Winner;
 /** The final, written the way a kid reads a scoreline. */
 final:string;
 /** One player to remember and why. */
 star:string;starWhy:string;
 /** One extra true thing about that tournament. */
 note:string;
 upcoming?:boolean;
};
export const EDITIONS:readonly Edition[]=[
 {year:1991,host:'China',teams:12,winner:'USA',final:'USA 2–1 Norway',star:'Michelle Akers',
  starWhy:'Michelle Akers scored both US goals in that final, and 10 goals in the whole tournament (the most of anyone).',
  note:'The first FIFA Women’s World Cup was played in China in 1991. 12 teams came, and every match lasted 80 minutes, not 90.'},
 {year:1995,host:'Sweden',teams:12,winner:'Norway',final:'Norway 2–0 Germany',star:'Hege Riise',
  starWhy:'Hege Riise was voted best player of the tournament (the Golden Ball).',
  note:'Norway lost the first final in 1991, then won the second one.'},
 {year:1999,host:'USA',teams:16,winner:'USA',final:'USA 0–0 China (USA won 5–4 on penalties)',star:'Sun Wen',
  starWhy:'China’s Sun Wen won the Golden Ball. Brandi Chastain scored the USA’s winning penalty.',
  note:'The final was played at the Rose Bowl in California. The tournament grew to 16 teams.'},
 {year:2003,host:'USA',teams:16,winner:'Germany',final:'Germany 2–1 Sweden (after extra time)',star:'Birgit Prinz',
  starWhy:'Birgit Prinz won the Golden Ball.',
  note:'It was meant to be in China, but moved to the USA because of the SARS illness outbreak.'},
 {year:2007,host:'China',teams:16,winner:'Germany',final:'Germany 2–0 Brazil',star:'Marta',
  starWhy:'Brazil’s Marta won the Golden Ball.',
  note:'Germany won it again, and became the first team to win the Women’s World Cup twice in a row.'},
 {year:2011,host:'Germany',teams:16,winner:'Japan',final:'Japan 2–2 USA (Japan won 3–1 on penalties)',star:'Homare Sawa',
  starWhy:'Homare Sawa won the Golden Ball.',
  note:'Japan came from behind twice in the final, and became the first team from Asia to win a senior World Cup.'},
 {year:2015,host:'Canada',teams:24,winner:'USA',final:'USA 5–2 Japan',star:'Carli Lloyd',
  starWhy:'Carli Lloyd scored a hat-trick in the first 16 minutes of the final, and won the Golden Ball.',
  note:'The tournament grew to 24 teams.'},
 {year:2019,host:'France',teams:24,winner:'USA',final:'USA 2–0 Netherlands',star:'Megan Rapinoe',
  starWhy:'Megan Rapinoe scored a penalty in the final and won the Golden Ball.',
  note:'It was the USA’s fourth Women’s World Cup title.'},
 {year:2023,host:'Australia and New Zealand',teams:32,winner:'Spain',final:'Spain 1–0 England',star:'Aitana Bonmatí',
  starWhy:'Aitana Bonmatí won the Golden Ball. Olga Carmona scored the only goal of the final.',
  note:'The tournament grew to 32 teams, and Spain won it for the first time.'},
 {year:2027,host:'Brazil',teams:32,winner:null,final:'Not played yet: 24 June to 25 July 2027',star:'Who will it be?',
  starWhy:'This star hasn’t lit up yet. Maybe someone you watch now.',
  note:'The first Women’s World Cup in South America. Brazil once banned women’s football (1941 to 1979). Now it hosts the world.',upcoming:true},
];
/** Paper colours (the Oct 9 2026 paper-cut restyle): each winner is a sheet of coloured paper that reads on the cream ground. */
export const WINNER_COLOR:Record<Exclude<Winner,null>,string>={USA:'#23408e',Norway:'#c8102e',Germany:'#2a2522',Japan:'#c2457a',Spain:'#d98200'};
/** How many titles each winner has (computed, so it can never disagree with EDITIONS). */
export function titles(){const m=new Map<string,number>();for(const e of EDITIONS)if(e.winner)m.set(e.winner,(m.get(e.winner)??0)+1);return [...m].sort((a,b)=>b[1]-a[1]);}

/** The 1991 final, minute by minute (80-minute match). Pitch in metres, 105 × 68, the USA attacking to the right.
 *  The minutes, scorers and how goals 1 and 3 were made are documented; the exact spots on the pitch are drawn for teaching. */
export type Goal={min:number;team:'USA'|'Norway';who:string;how:string;path:[number,number][]};
export const FINAL_1991={date:'30 November 1991',place:'Tianhe Stadium, Guangzhou',crowd:'63,000',length:80,
 goals:[
  {min:20,team:'USA',who:'Michelle Akers',how:'A header from Shannon Higgins’s free kick.',path:[[70,12],[93,29],[105,33]]},
  {min:29,team:'Norway',who:'Linda Medalen',how:'Norway equalised: 1–1.',path:[[30,44],[12,36],[0,35]]},
  {min:78,team:'USA',who:'Michelle Akers',how:'She chased a Norway back pass, won it, went round the goalkeeper and scored.',path:[[84,42],[93,38],[100,27],[105,32]]},
 ] as Goal[]};

/** China 1991: the tournament itself (beat 2). Checked against Wikipedia's 1991 FIFA Women's World Cup article and the 1988
 *  Invitation Tournament article (SOURCES). */
export const CHINA_1991={dates:'16 to 30 November 1991',region:'Guangdong',cities:['Guangzhou','Foshan','Jiangmen','Zhongshan'],
 officialName:'1st FIFA World Championship for Women’s Football for the M&M’s Cup',
 trial:'In 1988, FIFA tried out a women’s tournament in Guangdong, China. Because of that trial, FIFA picked China to host the first real one.',
 opener:'In the very first match, China beat Norway 4–0. China’s Ma Li scored the first goal in Women’s World Cup history.',
 minutes:'Every match lasted 80 minutes: two halves of 40. From 1995 it was 90, like the men’s game.'} as const;
/** The 12 teams of 1991, by continent (every one of FIFA's six confederations sent at least one). */
export const TEAMS_1991:readonly {name:string;from:string;host?:boolean}[]=[
 {name:'China',from:'Asia',host:true},{name:'Japan',from:'Asia'},{name:'Chinese Taipei',from:'Asia'},{name:'Nigeria',from:'Africa'},
 {name:'Brazil',from:'South America'},{name:'New Zealand',from:'Oceania'},{name:'USA',from:'North America'},{name:'Denmark',from:'Europe'},
 {name:'Germany',from:'Europe'},{name:'Italy',from:'Europe'},{name:'Norway',from:'Europe'},{name:'Sweden',from:'Europe'}];

/** "Your turn": Akers's 78th-minute winner as a game, pitch metres (USA attack right, goal x = 105, posts y 30.34–37.66).
 *  The real goal: she chased a Norway back pass, won it, went round the goalkeeper and scored. Spots are drawn for teaching. */
export const AKERS_PLAY={defender:[88,46] as [number,number],keeper:[103.5,34] as [number,number],akers:[76,50] as [number,number],passTo:[101.5,35] as [number,number],
 passSpeed:3.6,posts:[30.34,37.66] as [number,number]};

/** Before the stars: women's football was banned or blocked in some countries for decades. */
export type Ban={country:string;from:number;to:number;who:string;banned:string;after:string;before?:string};
export const BANS:readonly Ban[]=[
 {country:'England',from:1921,to:1971,who:'Set by the Football Association (the FA).',
  banned:'The FA banned women’s teams from playing on its clubs’ grounds.',
  before:'In December 1920, about 53,000 fans watched Dick, Kerr Ladies play at Goodison Park. A year later the ban came.',
  after:'The ban lasted 50 years, until 1971.'},
 {country:'Brazil',from:1941,to:1979,who:'Set by a law: Decree-law 3,199.',
  banned:'A law said women could not play sports “incompatible with their nature”, and that included football.',
  after:'The law was lifted in 1979. In 2027, Brazil hosts the Women’s World Cup.'},
 {country:'West Germany',from:1955,to:1970,who:'Set by the German FA (the DFB).',
  banned:'The German FA banned women’s football in its clubs.',
  after:'When the ban ended in 1970, women’s matches there were only 2 × 30 minutes at first. Germany later won the Women’s World Cup in 2003 and 2007.'},
];
export const DARK_FROM=1920,DARK_TO=1991;

export const TAKE_IT='Find your striker early: a team that knows who finishes can plan its attacks.';

export type Source={title:string;url:string};
export const SOURCES:readonly Source[]=[
 {title:'FIFA · FIFA Women’s World Cup China 1991',url:'https://www.fifa.com/en/tournaments/womens/womensworldcup/fifa-womens-world-cup-china-1991'},
 {title:'FIFA · The first Women’s World Cup final in focus: USA–Norway, 1991',url:'https://www.fifa.com/en/tournaments/womens/womensworldcup/fifa-womens-world-cup-china-1991/articles/first-fifa-womens-world-cup-final-in-focus-usa-norway-1991'},
 {title:'U.S. Soccer · The First Star (2021)',url:'https://www.ussoccer.com/stories/2021/11/the-first-star'},
 {title:'Front Row Soccer · Akers-Stahl’s late goal gives USWNT title (1991)',url:'https://www.frontrowsoccer.com/2022/03/19/womens-soccer-history-month-day-19-on-top-of-the-world-akers-stahls-late-goal-gives-uswnt-title-with-2-1-win-over-norway-1991/'},
 {title:'Wikipedia · 1991 FIFA Women’s World Cup',url:'https://en.wikipedia.org/wiki/1991_FIFA_Women%27s_World_Cup'},
 {title:'Wikipedia · 1991 FIFA Women’s World Cup final',url:'https://en.wikipedia.org/wiki/1991_FIFA_Women%27s_World_Cup_final'},
 {title:'Wikipedia · Michelle Akers',url:'https://en.wikipedia.org/wiki/Michelle_Akers'},
 {title:'Wikipedia · List of FIFA Women’s World Cup finals',url:'https://en.wikipedia.org/wiki/List_of_FIFA_Women%27s_World_Cup_finals'},
 {title:'FIFA · Every FIFA Women’s World Cup Golden Ball winner',url:'https://www.fifa.com/en/articles/every-fifa-womens-world-cup-golden-ball-winner'},
 {title:'Wikipedia · 2003 FIFA Women’s World Cup (moved because of SARS)',url:'https://en.wikipedia.org/wiki/2003_FIFA_Women%27s_World_Cup'},
 {title:'Wikipedia · 2007 FIFA Women’s World Cup',url:'https://en.wikipedia.org/wiki/2007_FIFA_Women%27s_World_Cup'},
 {title:'Al Jazeera · Japan’s women stun USA in World Cup final (2011)',url:'https://www.aljazeera.com/sports/2011/7/17/japans-women-stun-usa-in-world-cup-final'},
 {title:'Sports Illustrated · Carli Lloyd scores hat trick 16 minutes into World Cup final (2015)',url:'https://www.si.com/soccer/2015/07/05/womens-world-cup-usa-japan-carli-lloyd-goal-video'},
 {title:'TIME · Team USA triumphs again at the 2019 Women’s World Cup final',url:'https://time.com/5620124/team-usa-womens-world-cup-final/'},
 {title:'Olympics.com · Spain claim their first Women’s World Cup with 1–0 win over England (2023)',url:'https://www.olympics.com/en/news/fifa-womens-world-cup-2023-spain-victory-england-final'},
 {title:'FOX Sports · 2027 Women’s World Cup in Brazil will run from June 24 to July 25',url:'https://www.foxsports.com/stories/soccer/2027-womens-world-cup-in-brazil-will-run-from-june-24-to-july-25'},
 {title:'Wikipedia · FIFA Women’s World Cup (12, 16, 24, then 32 teams)',url:'https://en.wikipedia.org/wiki/FIFA_Women%27s_World_Cup'},
 {title:'Wikipedia · 1988 FIFA Women’s Invitation Tournament (the trial in Guangdong)',url:'https://en.wikipedia.org/wiki/1988_FIFA_Women%27s_Invitation_Tournament'},
 {title:'Wikipedia · Bans of women’s association football',url:'https://en.wikipedia.org/wiki/Bans_of_women%27s_association_football'},
 {title:'Women in Football · Dick, Kerr Ladies’ Boxing Day crowd, 100 years on',url:'https://www.womeninfootball.co.uk/news/2020/12/26/remembering-dick,-kerr-ladies-100-years-on/'},
 {title:'Wikipedia · Decree-law 3,199 (Brazil, 1941)',url:'https://en.wikipedia.org/wiki/Decree-law_3,199'},
 {title:'FIFA · Celebrating 50 years of women’s football in Germany',url:'https://inside.fifa.com/womens-football/news/celebrating-50-years-of-women-s-football-in-germany'},
];

/** Beat 5, "Cut your star": a quick check. Every answer is a fact taught in beats 1–3 (sources above). Each right answer cuts one
 *  point of a paper star; five points and the star is yours. The right answer sits in a different place each time. */
export type Q={q:string;choices:readonly string[];right:number;why:string};
export const QUIZ:readonly Q[]=[
 {q:'In 1991, how long did each match last?',choices:['90 minutes','80 minutes','60 minutes'],right:1,
  why:'Two halves of 40 minutes. From 1995 it was 90, like the men’s game.'},
 {q:'Who scored both US goals in the 1991 final?',choices:['Michelle Akers','Linda Medalen','Hege Riise'],right:0,
  why:'Michelle Akers scored both. Linda Medalen scored Norway’s goal.'},
 {q:'How did Akers score the winner, two minutes from the end?',choices:['A penalty','A long free kick','She chased a back pass and won it'],right:2,
  why:'She kept pressing, won Norway’s back pass, went round the goalkeeper and scored.'},
 {q:'How many teams came to China in 1991?',choices:['32','16','12'],right:2,
  why:'12 teams, from all six continents. In 2023 there were 32.'},
 {q:'For how long did England’s FA ban women’s teams from its grounds?',choices:['50 years','5 years','100 years'],right:0,
  why:'From 1921 to 1971. Twenty years later came the first Women’s World Cup.'},
];
