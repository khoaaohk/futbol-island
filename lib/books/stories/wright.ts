import type {BookData} from '../types';
/** Original child-readable retelling of Ian Wright's hard childhood, the teacher who helped him and his late start (staged Nov 21 2026: not sold until
 *  its spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. The home trouble is named
 *  only in general terms, with a "tell a trusted adult" lesson. */
export const WRIGHT_BOOK:BookData={
 title:'Wright',subtitle:'A teacher who believed',itemId:'display:eleven:book:wright',player:'Ian Wright',
 sources:[
  {label:'Wikipedia · Ian Wright',url:'https://en.wikipedia.org/wiki/Ian_Wright'},
  {label:'Tes · Ian Wright on his best teacher, Mr Pigden',url:'https://www.tes.com/news/ian-wright-his-best-teacher-mr-pigden'},
  {label:'London Museum · Ian Wright, Arsenal hero and London legend',url:'https://www.londonmuseum.org.uk/collections/london-stories/ian-wright-arsenal-hero-london-legend/'},
 ],
 pages:[
  {id:'home',year:'Brockley · Childhood',title:'A hard start',
   text:'Ian Wright was born in 1963 in Woolwich, in London, to parents from Jamaica, and he grew up in Brockley. His father was not around, and his mother, Nesta, brought him up. Home was not always a happy or safe place.\n\nOpen the door. When home feels hard, school and the people there can be a place of help. Ian loved football, and it gave him a place to be happy.',
   lesson:'If home feels hard, it is never your fault. Tell a teacher or another grown-up you trust.',
   prompt:'Open the door',response:'A safe place.',source:0},
  {id:'pigden',year:'Primary school',title:'Mr Pigden',
   text:'At primary school, Ian had a teacher called Sydney Pigden. Long before, Mr Pigden had been a pilot in the Second World War. Mr Pigden was a PE teacher, and he noticed Ian.\n\nLift the flap. Mr Pigden helped Ian learn to read and write, and he believed in him. Ian later called him the first positive male figure in his life. Sometimes one grown-up who believes in you can change everything.',
   lesson:'One kind teacher can change a life. Let the helpers help you.',
   prompt:'Lift the flap',response:'Someone believed in him.',source:1},
  {id:'trials',year:'Teenage years',title:'Two trials, two noes',
   text:'As a teenager, Ian had trials at two professional clubs, Southend United and Brighton. Neither club offered him a contract. Being turned down can make you feel that your dream is over.\n\nKnock on the doors. Ian kept playing anyway, in Sunday league football. He became the top scorer in his league. He was playing for fun, but he was getting better every week.',
   lesson:'Keep playing for the love of it, even when the big doors stay shut.',
   prompt:'Knock on the doors',response:'Still scoring.',steps:2,source:0},
  {id:'palace',year:'1985 · Aged 21',title:'A late start',
   text:'Ian played for a small club, Greenwich Borough. Then, in August 1985, when he was twenty-one, he signed for Crystal Palace. Most new professional players are much younger.\n\nClimb the steps. Ian worked hard and scored lots of goals. In 1989, he scored 24 league goals and helped Palace win promotion to the top division.',
   lesson:'It is never too late to start. Your path can be different from everyone else’s.',
   prompt:'Climb the steps',response:'Up to the top league!',steps:3,source:0},
  {id:'arsenal',year:'1991 to 1998',title:'Goals for Arsenal',
   text:'In 1991, Ian joined Arsenal, and he played for England too. He scored 185 goals for Arsenal, more than anyone before him. Years later, in 2005, Thierry Henry beat his record. Arsenal paid a club-record fee for him.\n\nFlip the scoreboard. With Arsenal, Ian won the FA Cup, the League Cup and the league title. The young man who started late had become one of the best strikers in England.',
   lesson:'Hard work and joy together can take you a very long way.',
   prompt:'Flip the scoreboard',response:'Goal number 185!',source:2},
  {id:'thanks',year:'2005',title:'Thank you, Mr Pigden',
   text:'Ian had been told that Mr Pigden had died. But in 2005, on a BBC television programme, his old teacher walked in to meet him. Ian was so happy that he cried. They hugged, and the moment was watched by people all over the country.\n\nLift the photo frame. Ian later dedicated his life story, a book he wrote in 2016, to Mr Pigden. He never forgot the teacher who had believed in him when he was a boy.',
   lesson:'Remember the people who helped you, and tell them thank you.',
   prompt:'Lift the photo frame',response:'Thank you, Mr Pigden.',source:0},
 ]
};
