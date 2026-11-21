import type {BookData} from '../types';
/** Original child-readable retelling of Petr Čech's head injury and return in a headguard, framed around safety (staged Nov 21 2026: not sold
 *  until its spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. No injury detail. */
export const CECH_BOOK:BookData={
 title:'Čech',subtitle:'The keeper in the headguard',itemId:'display:pier:book:cech',player:'Petr Čech',
 sources:[
  {label:'Wikipedia · Petr Čech',url:'https://en.wikipedia.org/wiki/Petr_%C4%8Cech'},
  {label:'Chelsea FC · Petr Čech on his head injury, 15 years on',url:'https://www.chelseafc.com/en/news/article/petr-cech-column--reflections-on-my-head-injury-15-years-on'},
  {label:'Chelsea FC · From the museum: Petr Čech’s headguard',url:'https://www.chelseafc.com/en/news/article/from-the-museum-petr-cechs-headguard'},
 ],
 pages:[
  {id:'leg',year:'Plzeň · Aged 10',title:'From striker to goalkeeper',
   text:'Petr Čech was born in 1982 in Plzeň, in what is now the Czech Republic. He started playing at seven, for Škoda Plzeň, as a striker. When he was ten, he broke his leg. A broken leg means weeks of rest, and not being able to play.\n\nFlip the shirt. After his leg healed, Petr switched to playing in goal. The injury had led him to a new position, and he loved it.',
   lesson:'A setback can lead you somewhere new and surprising.',
   prompt:'Flip the shirt',response:'A goalkeeper now!',source:0},
  {id:'wall',year:'2004 to 2005',title:'A wall in goal',
   text:'Petr joined Chelsea in London in 2004. In March 2005, he set a Premier League record: 1,025 minutes without letting in a goal. That is more than eleven whole matches. Chelsea won the Premier League that season.\n\nFlip the scoreboard. Petr was calm, tall and brave, and he worked hard on every part of goalkeeping. A goalkeeper has to stay ready all game, even when the ball is far away.',
   lesson:'Calm, careful practice can make you very hard to beat.',
   prompt:'Flip the scoreboard',response:'Another clean sheet.',source:0},
  {id:'injury',year:'October 2006',title:'A serious head injury',
   text:'On 14 October 2006, in a match at Reading, Petr and another player collided. Petr’s head was badly hurt, and he needed an operation. Doctors said later that it had been very dangerous.\n\nLift the rain cloud. Petr needed about three months to heal. Head injuries are serious, and taking time to recover properly is the right thing to do. Petr rested and followed his doctors’ advice.',
   lesson:'Head injuries are serious. If you bump your head, always stop and tell a grown-up.',
   prompt:'Lift the rain cloud',response:'Time to heal.',source:1},
  {id:'headguard',year:'January 2007',title:'Back, in a headguard',
   text:'On 20 January 2007, Petr played again, against Liverpool. He wore a padded headguard, first made by a company that makes rugby kit. The referee checked it and said yes. Coming back after such a serious injury took a lot of courage.\n\nPut on the headguard. Petr wore a headguard for the rest of his career. It became his trademark, and it is now in Chelsea’s museum. Keeping yourself safe is part of being a good player.',
   lesson:'Protective gear is smart, not silly. Look after yourself so you can keep playing.',
   prompt:'Put on the headguard',response:'Safe and ready.',source:2},
  {id:'munich',year:'2012 · Munich',title:'Saves in the big final',
   text:'In 2012, Chelsea played Bayern Munich in the Champions League final. In extra time, Petr saved a penalty from Arjen Robben. The match was played in Bayern’s own stadium, and they were the favourites.\n\nDive for the save. The final went to a penalty shootout, and Petr saved two more. Chelsea won the Champions League for the first time.',
   lesson:'Stay brave after a hard time. Your best moments can still be ahead.',
   prompt:'Dive for the save',response:'Champions of Europe!',steps:3,source:0},
  {id:'new',year:'2019 and after',title:'Still learning new things',
   text:'Petr stopped playing football in 2019. He holds the Premier League record for the most clean sheets, 202 matches without letting in a goal.\n\nLift the three flaps. Then he became an ice hockey goalkeeper, and he also plays the drums in a band. He keeps trying new things. Being a beginner again takes courage, but it is fun too.',
   lesson:'Keep trying new things. Being a beginner again is brave.',
   prompt:'Lift the three flaps',response:'Hockey, drums and more!',steps:3,source:0},
 ]
};
