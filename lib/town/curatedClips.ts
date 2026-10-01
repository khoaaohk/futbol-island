import type {IslandClip} from './islandClips';
import type {NewsLeague} from './newsLeagues';
/**
 * Curated fallback for the video desk (Sep 30 2026). YouTube channel RSS feeds (feeds/videos.xml) began returning 404 for
 * every channel, so these verified official uploads are served when a feed fails or has no recent items.
 * Rules (same spirit as the reviewed topic metadata): each entry is from the SAME official channel as its topic/league
 * (channelId checked on the watch page), tagged with the teaching concept, oEmbed 200 with matching title/author,
 * embeddable (playableInEmbed) and family-safe on its watch page; checked one request at a time, 4.5 s apart. Kid-appropriate
 * titles only. Never add an id that was not verified this way. The publisher sets ads/recommendations, not this app.
 *
 * Embed sweep (Oct 1 2026): playableInEmbed is not enough. A muted headless YT.Player test showed LALIGA and Ligue 1 block
 * every upload embedded (error 150) and UEFA blocks most long-form uploads (many of its Shorts do play). Each entry now records
 * embedVerifiedAt, the date it actually started playing in that test. When a league/topic's own channel blocks embedding, its
 * clips come from an official rights-holder channel in EMBED_FALLBACK_CHANNELS (ESPN FC for LALIGA, beIN SPORTS USA for Ligue 1,
 * CBS Sports Golazo for the UCL), and `source` names that channel so the NPC note credits it honestly.
 * KNOWN_EMBED_BLOCKED lists ids that failed the test, so they are not added back.
 */
export type CuratedClip=IslandClip&{channelId:string;concept:string;embedVerifiedAt:string};
export const CURATED_VERIFIED_AT='2026-09-30';
const EMBED_SWEEP='2026-10-01';
/** Official broadcaster channels used when a publisher blocks embedded playback (channel id → display name). */
export const EMBED_FALLBACK_CHANNELS:Record<string,string>={
 'UC6c1z7bA__85CIWZ_jpCK-Q':'ESPN FC','UC0YatYmg5JRYzXJPxIdRd8g':'beIN SPORTS USA','UCET00YnetHT7tOpu12v8jxg':'CBS Sports Golazo',
};
/**
 * Publishers whose uploads failed the embed test across the board (LALIGA and Ligue 1: every clip; UEFA: its feed's long-form
 * uploads). Their feeds would hand the player a clip that errors (150) and forces a backup swap, so these leagues/topics serve
 * the embed-verified curated list directly and make no feed request at all (also fewer requests on phones).
 */
export const EMBED_BLOCKED_CHANNELS=new Set(['UCTv-XvfzLX3i4IGWAm4sbmA','UCQsH5XtIc9hONE1BQjucM0g','UCyGa1YEx9ST66rYrJTGIKOw']);
export const KNOWN_EMBED_BLOCKED=new Set(['yhF2UbcA3EA','-lmZbvAMTQA','MHiBjxP1bXg','bkLxmDaiCsw','ryHXUtQyXxA','v4kCdGxejzU','NiPCDDNEZa0','TQUqf4rJWi4','oC4EWup-D6g','UK5cu3LJ9qk','GbM67fAT1dQ','2sxZgzktgDM','7kV_RcrFcrw','_CKqcK5uhLE','JXsATcfVeSk','q7QQbr5c9Zc','4N7KtauLMh4','cauDXvPWutw','eZmT7722q9k','Q2V4TBujBBs','u3mACZs5yLI','8DPdbW2N_k4']);
export const CURATED_TOPIC_CLIPS:Record<string,CuratedClip[]>={
 'uefa-scanning':[
 {id:'2tnWjmh-VwA',title:'A midfield masterclass from Tchouaméni 👏',channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2025-09-10T04:00:06-07:00',views:222082,durationSeconds:34,league:'uefa.champions',concept:'scanning',embedVerifiedAt:EMBED_SWEEP},
 {id:'X_M5wwbh08Y',title:"Passing with purpose",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-27T04:00:28-07:00',views:345565,durationSeconds:10,league:'uefa.champions',concept:'scanning',embedVerifiedAt:EMBED_SWEEP},
 ],
 'uefa-support':[
 {id:'FtyJxoOHUCA',title:'Vitinha’s movement 🤯',channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2025-06-03T02:00:24-07:00',views:13579743,durationSeconds:24,league:'uefa.champions',concept:'support',embedVerifiedAt:EMBED_SWEEP},
 {id:'Bxo9yshy7VU',title:"Paris link-up 🔗",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-21T04:00:05-07:00',views:880706,durationSeconds:11,league:'uefa.champions',concept:'support',embedVerifiedAt:EMBED_SWEEP},
 {id:'QtFzDCGkQ9E',title:"The links 🔗🔗🔗",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-20T08:00:13-07:00',views:2705680,durationSeconds:9,league:'uefa.champions',concept:'support',embedVerifiedAt:EMBED_SWEEP},
 {id:'YaQs0ji_vTs',title:"This assist 😮‍💨",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-17T07:01:06-07:00',views:47521,durationSeconds:12,league:'uefa.champions',concept:'support',embedVerifiedAt:EMBED_SWEEP},
 ],
 'uefa-pressing':[
 {id:'zcDtacmLhzA',title:'INCREDIBLE defensive masterclass! 😱',channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2025-07-24T09:01:45-07:00',views:89941,durationSeconds:38,league:'uefa.champions',concept:'pressing',embedVerifiedAt:EMBED_SWEEP},
 {id:'6H6-gH6aRDI',title:'Master of pressing!',channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2025-06-17T07:34:00-07:00',views:6848429,durationSeconds:8,league:'uefa.champions',concept:'pressing',embedVerifiedAt:EMBED_SWEEP},
 {id:'oZXOWtWhPsM',title:'Osimhen’s work rate 😮‍💨',channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-02-19T01:59:01-08:00',views:1097358,durationSeconds:18,league:'uefa.champions',concept:'pressing',embedVerifiedAt:EMBED_SWEEP},
 {id:'Km98B9EAo9A',title:"Paris pressure",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-19T04:00:22-07:00',views:1877994,durationSeconds:14,league:'uefa.champions',concept:'pressing',embedVerifiedAt:EMBED_SWEEP},
 ],
 'uefa-finishing':[
 {id:'cIlTE1v0ye8',title:"Definition of top bins.",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-16T08:25:06-07:00',views:790002,durationSeconds:7,league:'uefa.champions',concept:'finishing',embedVerifiedAt:EMBED_SWEEP},
 {id:'g3K66fZxlpk',title:"Incredible trivela goal",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-15T06:12:22-07:00',views:1969964,durationSeconds:8,league:'uefa.champions',concept:'finishing',embedVerifiedAt:EMBED_SWEEP},
 {id:'2OWM5LQIh68',title:"Best finish ever?! 😳",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-14T07:30:11-07:00',views:8885383,durationSeconds:8,league:'uefa.champions',concept:'finishing',embedVerifiedAt:EMBED_SWEEP},
 ],
 'uefa-teamwork':[
 {id:'mnN2219oqLU',title:'When Busquets and Messi combined! 😅',channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-04-08T09:10:18-07:00',views:15866713,durationSeconds:12,league:'uefa.champions',concept:'teamwork',embedVerifiedAt:EMBED_SWEEP},
 {id:'aIMVPMxURQc',title:'The beautiful game taught by Barcelona 😍',channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2025-05-12T09:00:01-07:00',views:7575304,durationSeconds:10,league:'uefa.champions',concept:'teamwork',embedVerifiedAt:EMBED_SWEEP},
 {id:'_5i8_CMzsgg',title:"Como’s style of play 👏",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-09-12T04:00:00-07:00',views:517890,durationSeconds:13,league:'uefa.champions',concept:'teamwork',embedVerifiedAt:EMBED_SWEEP},
 ],
 'espn-goals':[
 {id:'bSeIHtsdJyo',title:'2 GOALS FOR LAMINE YAMAL ⚽⚽ Levante vs. Barcelona | LALIGA Highlights | ESPN FC',channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-09-13T09:40:56-07:00',views:786296,durationSeconds:1084,league:'uefa.champions',concept:'goals',embedVerifiedAt:EMBED_SWEEP},
 {id:'BSb9iSg0D4s',title:'Kylian Mbappe and Jude Bellingham BOTH SCORE ‼️ Real Madrid vs. Malaga | LALIGA Highlights | ESPN FC',channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-08-30T10:17:16-07:00',views:1096566,durationSeconds:1193,league:'uefa.champions',concept:'goals',embedVerifiedAt:EMBED_SWEEP},
 ],
 'espn-analysis':[
 {id:'CaxLVK8Akk4',title:'Kylian Mbappe TACTICS BREAKDOWN: Contributing defensively?! | ESPN FC',channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-06-16T06:41:40-07:00',views:19203,durationSeconds:760,league:'uefa.champions',concept:'analysis',embedVerifiedAt:EMBED_SWEEP},
 {id:'d2HBKI8TWzQ',title:'‘Decisions have consequences’ Were Pep Guardiola\'s tactical choices correct vs. Liverpool? | ESPN FC',channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2022-10-17T06:00:19-07:00',views:45227,durationSeconds:345,league:'uefa.champions',concept:'analysis',embedVerifiedAt:EMBED_SWEEP},
 ],
 'espn-skills':[
 {id:'nZS5ILdpd2k',title:'Lamine Yamal\'s TOP goals, assists and electrifying moments 👏 [Barcelona Career Highlights] | ESPN FC',channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-06-08T06:00:39-07:00',views:150916,durationSeconds:1849,league:'uefa.champions',concept:'skills',embedVerifiedAt:EMBED_SWEEP},
 {id:'JxAdYBfPq9o',title:'Rayan Cherki with some amazing skills ⚽ (Via @mancity/IG)',channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-01-12T11:46:27-08:00',views:47002,durationSeconds:9,league:'uefa.champions',concept:'skills',embedVerifiedAt:EMBED_SWEEP},
 {id:'m8fRugdcNVo',title:'When Messi did this in Barcelona training 👀 (via fcbarcelona/TT)',channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2025-07-28T08:07:28-07:00',views:595615,durationSeconds:13,league:'uefa.champions',concept:'skills',embedVerifiedAt:EMBED_SWEEP},
 ],
 'ucl-final-result':[
 {id:'tRnJRQmVMTg',title:"PSG vs. Arsenal: Extended Highlights | UCL Final | CBS Sports Golazo",channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2026-05-30T12:35:30-07:00',views:1607631,durationSeconds:922,league:'uefa.champions',concept:'ucl-final',embedVerifiedAt:EMBED_SWEEP},
 {id:'QAbl7ZAy1dY',title:"PSG vs. Inter: Extended Highlights | UCL Final | CBS Sports Golazo",channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2025-05-31T14:27:08-07:00',views:2256598,durationSeconds:800,league:'uefa.champions',concept:'ucl-final',embedVerifiedAt:EMBED_SWEEP},
 {id:'tldOtltdPXY',title:"Borussia Dortmund vs. Real Madrid: Extended Highlights | UCL Final | CBS Sports Golazo",channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2024-06-01T14:32:19-07:00',views:2001066,durationSeconds:864,league:'uefa.champions',concept:'ucl-final',embedVerifiedAt:EMBED_SWEEP},
 ],
 'ucl-final-discussion':[
 {id:'ceI4zXe7cGU',title:'Thierry Henry, Micah & Carragher react to Real Madrid\'s UCL final win! | UCL Today | CBS Sports',channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2024-06-01T15:06:45-07:00',views:603407,durationSeconds:480,league:'uefa.champions',concept:'ucl-final',embedVerifiedAt:EMBED_SWEEP},
 {id:'HQQZz1z6iOY',title:'Thierry Henry, Carragher & Micah react as Real Madrid advance to UCL final | UCL Today | CBS Sports',channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2024-05-08T14:23:58-07:00',views:2193744,durationSeconds:594,league:'uefa.champions',concept:'ucl-final',embedVerifiedAt:EMBED_SWEEP},
 {id:'qvzYwt67rUw',title:'Benfica vs. Real Madrid Highlight: 1962 FINAL | Eusébio vs. Puskás',channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2026-02-16T09:01:15-08:00',views:84427,durationSeconds:514,league:'uefa.champions',concept:'ucl-final',embedVerifiedAt:EMBED_SWEEP},
 ],
};
export const CURATED_LEAGUE_CLIPS:Record<NewsLeague,CuratedClip[]>={
 'eng.1':[
 {id:'tJaOKt3ue84',title:'All 50 Premier League Goals by Bukayo Saka',channelId:'UCG5qGWdu8nIRZqJ_GgDwQ-w',source:'Premier League',publishedAt:'2024-10-30T03:31:00-07:00',views:1127451,durationSeconds:666,league:'eng.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'ofrTchks6T0',title:'Tremendous Goals | Premier League 2003/04 | Henry, Giggs, Crespo',channelId:'UCG5qGWdu8nIRZqJ_GgDwQ-w',source:'Premier League',publishedAt:'2019-08-06T03:30:52-07:00',views:383027,durationSeconds:1333,league:'eng.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'esp.1':[
 {id:'bLzrK9H8XLc',title:"INTENSE MADRID DERBY 🍿 Atletico Madrid vs. Real Madrid | LALIGA Highlights | ESPN FC",channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-09-20T09:56:23-07:00',views:1271553,durationSeconds:1196,league:'esp.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'ujkBRg-upZY',title:"Sevilla vs. Barcelona | LALIGA Highlights | ESPN FC",channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-09-19T14:11:35-07:00',views:845750,durationSeconds:1107,league:'esp.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'K_4yDlQknUI',title:"MBAPPE HAT TRICK 🤩 Real Madrid vs. Real Sociedad | LALIGA Highlights | ESPN FC",channelId:'UC6c1z7bA__85CIWZ_jpCK-Q',source:'ESPN FC',publishedAt:'2026-08-26T14:08:59-07:00',views:1127414,durationSeconds:1099,league:'esp.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'jpn.1':[
 {id:'w9qKJRQGNik',title:'The Best Goals Of The J.League Season So Far!',channelId:'UCmQp6ZaAejJKKkXc_Y_lh1A',source:'J.LEAGUE International',publishedAt:'2026-09-24T04:10:35-07:00',views:7540,durationSeconds:1357,league:'jpn.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'5SFUiGceTuk',title:'The BEST Goals of 2025-26 💥 | J.League',channelId:'UCmQp6ZaAejJKKkXc_Y_lh1A',source:'J.LEAGUE International',publishedAt:'2026-08-07T10:00:30-07:00',views:2568,durationSeconds:1212,league:'jpn.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'eP9ZvGhWVDE',title:'All Super Goals of the 2025 J.League',channelId:'UCmQp6ZaAejJKKkXc_Y_lh1A',source:'J.LEAGUE International',publishedAt:'2026-01-28T01:01:03-08:00',views:1333,durationSeconds:1943,league:'jpn.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'fra.1':[
 {id:'NLup10x61rs',title:"Olympique Marseille vs PSG | HIGHLIGHTS Ligue 1 | 09/20/2026 | beIN SPORTS USA",channelId:'UC0YatYmg5JRYzXJPxIdRd8g',source:'beIN SPORTS USA',publishedAt:'2026-09-20T14:47:24-07:00',views:94756,durationSeconds:810,league:'fra.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'5B0t5BkZlck',title:"PSG vs AS Monaco | HIGHLIGHTS Ligue 1 | 09/04/2026 | beIN SPORTS USA",channelId:'UC0YatYmg5JRYzXJPxIdRd8g',source:'beIN SPORTS USA',publishedAt:'2026-09-04T15:12:59-07:00',views:271325,durationSeconds:625,league:'fra.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'VA934-C0TXs',title:"Stade Brest vs PSG | HIGHLIGHTS Ligue 1 | 09/13/2026 | beIN SPORTS USA",channelId:'UC0YatYmg5JRYzXJPxIdRd8g',source:'beIN SPORTS USA',publishedAt:'2026-09-13T14:16:28-07:00',views:49310,durationSeconds:656,league:'fra.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'ita.1':[
 {id:'Wx71cxABLrU',title:'Khvicha Kvaratskhelia\'s Top 5 Goals of the Season | Serie A 2023/24',channelId:'UCBJeMCIeLQos7wacox4hmLQ',source:'Serie A',publishedAt:'2024-08-08T09:00:28-07:00',views:30527,durationSeconds:157,league:'ita.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'lT1oSRZ1DEI',title:'EVERY Lautaro Martinez Goal & Assist | Serie A 2024/25',channelId:'UCBJeMCIeLQos7wacox4hmLQ',source:'Serie A',publishedAt:'2025-07-22T07:01:14-07:00',views:26118,durationSeconds:328,league:'ita.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'TjWxiSuZh5g',title:'Best of Theo Hernandez | Highlights of the season | Serie A 2021/22',channelId:'UCBJeMCIeLQos7wacox4hmLQ',source:'Serie A',publishedAt:'2022-07-11T03:00:21-07:00',views:150735,durationSeconds:208,league:'ita.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'ger.1':[
 {id:'TthnLjCrMTg',title:'5 Goals in 9 Minutes – The Legendary Lewandowski Show | Bayern München vs. VfL Wolfsburg',channelId:'UC6UL29enLNe4mqwTfAyeNuw',source:'Bundesliga',publishedAt:'2020-09-21T15:00:04-07:00',views:23580383,durationSeconds:291,league:'ger.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'LyPw6PmD5Go',title:'Florian Wirtz - The Genius Passing Machine 🤖⚽️',channelId:'UC6UL29enLNe4mqwTfAyeNuw',source:'Bundesliga',publishedAt:'2024-02-20T05:00:15-08:00',views:232552,durationSeconds:131,league:'ger.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'eoSL0bj0BLU',title:'Arjen Robben - Magical Skills and Goals',channelId:'UC6UL29enLNe4mqwTfAyeNuw',source:'Bundesliga',publishedAt:'2019-07-04T08:36:11-07:00',views:2104850,durationSeconds:302,league:'ger.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'bra.1':[
 {id:'tIXG54ZYSI8',title:'Veja os gols que abriram a série A do Brasileirão 2014',channelId:'UCdQuDaRww5NkKpQQ1BJBWww',source:'CBF / Brasil',publishedAt:'2014-04-21T05:16:25-07:00',views:1401,durationSeconds:144,league:'bra.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'BZv373o0s_M',title:'Veja os gols da terceira rodada do Brasileirão',channelId:'UCdQuDaRww5NkKpQQ1BJBWww',source:'CBF / Brasil',publishedAt:'2013-06-02T09:05:27-07:00',views:669,durationSeconds:71,league:'bra.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'K1OsAJ8Ke6k',title:'Gols - Brasileirão: Grêmio 2 x 1 Atlético-MG',channelId:'UCdQuDaRww5NkKpQQ1BJBWww',source:'CBF / Brasil',publishedAt:'2015-11-29T14:16:30-08:00',views:875,durationSeconds:40,league:'bra.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'uefa.champions':[
 {id:'Q-H7_Ehpn8Q',title:"Salah’s record hat-trick!",channelId:'UCyGa1YEx9ST66rYrJTGIKOw',source:'UEFA',publishedAt:'2026-10-01T04:00:20-07:00',views:4614,durationSeconds:26,league:'uefa.champions',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'OcLZneTP53A',title:"Benfica vs. Real Madrid: Extended Highlights | UCL League Phase MD 8 | CBS Sports Golazo",channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2026-01-28T14:23:53-08:00',views:1520266,durationSeconds:671,league:'uefa.champions',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'dF-JIdw_PW4',title:"Bayern vs. Real Madrid: Extended Highlights | UCL Quarterfinals - Leg 2 | CBS Sports Golazo",channelId:'UCET00YnetHT7tOpu12v8jxg',source:'CBS Sports Golazo',publishedAt:'2026-04-15T14:20:03-07:00',views:2404415,durationSeconds:725,league:'uefa.champions',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'eng.w.1':[
 {id:'RZ_jjgFO3B8',title:'🔥 Best Goals of the Season 24/25 | Barclays WSL 2024-25',channelId:'UCnQpt1UxLq00NFULxTDHMww',source:'Barclays WSL',publishedAt:'2025-06-22T05:00:59-07:00',views:14950,durationSeconds:1105,league:'eng.w.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'yM97jAsXDBA',title:'💥 Sam Kerr\'s BEST GOALS in the Barclays WSL 🤸⚽️ | Barclays WSL',channelId:'UCnQpt1UxLq00NFULxTDHMww',source:'Barclays WSL',publishedAt:'2026-08-10T09:00:29-07:00',views:2632,durationSeconds:689,league:'eng.w.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'xlQzMV6OQjo',title:'🔥 Stina Blackstenius\' Best Goals for Arsenal | Barclays WSL',channelId:'UCnQpt1UxLq00NFULxTDHMww',source:'Barclays WSL',publishedAt:'2025-07-09T07:17:03-07:00',views:6440,durationSeconds:482,league:'eng.w.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
 'usa.1':[
 {id:'haVWzcp3TpQ',title:'The BEST GOALS of 2025 From EVERY MLS Club!',channelId:'UCSZbXT5TLLW_i-5W8FZpFsg',source:'MLS',publishedAt:'2025-12-30T11:00:54-08:00',views:34023,durationSeconds:820,league:'usa.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'JFb1nvLq8ik',title:'The BEST MLS Solo GOALS of 2025!',channelId:'UCSZbXT5TLLW_i-5W8FZpFsg',source:'MLS',publishedAt:'2025-12-19T10:00:32-08:00',views:14991,durationSeconds:432,league:'usa.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 {id:'3pDKhl5Q-d8',title:'Top 10 Goals in 2022!',channelId:'UCSZbXT5TLLW_i-5W8FZpFsg',source:'MLS',publishedAt:'2022-12-08T17:00:02-08:00',views:44357,durationSeconds:225,league:'usa.1',concept:'highlights',embedVerifiedAt:EMBED_SWEEP},
 ],
};
