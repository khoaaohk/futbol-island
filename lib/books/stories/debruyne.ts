import type {BookData} from '../types';
/** Original child-readable retelling of the hardships in Kevin De Bruyne's career. Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const DEBRUYNE_BOOK:BookData={
 title:'De Bruyne',subtitle:'Not wanted, not finished',itemId:'display:clubgrounds:book:debruyne',player:'Kevin De Bruyne',
 sources:[
  {label:'Wikipedia · Kevin De Bruyne',url:'https://en.wikipedia.org/wiki/Kevin_De_Bruyne'},
  {label:'Wikipedia (Dutch) · Kevin De Bruyne',url:'https://nl.wikipedia.org/wiki/Kevin_De_Bruyne'},
 ],
 pages:[
  {id:'genk',year:'Genk · Aged 14',title:'Far from home',
   text:'Kevin De Bruyne grew up in Drongen, near the city of Ghent, in Belgium. When he was fourteen, he left home to join the youth academy of the club Genk, in another part of the country.\n\nOpen the suitcase. For his first year he lived in a boarding house. Then he went to live with a host family, a family who looks after a young player. It turned out to be a very hard time for him.',
   lesson:'Being far from home is hard. It is okay to miss home, and to say so.',
   prompt:'Open the suitcase',response:'A long way from home.',source:1},
  {id:'host',year:'Genk · Aged 16',title:'Not welcome any more',
   text:'After one season, the host family did not want Kevin to stay any longer. They thought he was too quiet, too shy with people, and too stubborn.\n\nCarry the suitcase to the new house. At sixteen, he had to move out, into another boarding house. Many people would feel hurt and alone if that happened to them. Being told you are not wanted is one of the hardest things there is.',
   lesson:'Being quiet is not a bad thing. If people do not understand you, it is not the end of your story.',
   prompt:'Carry the suitcase',response:'A new room, a new start.',source:1},
  {id:'five',year:'Genk · Picking himself up',title:'Five goals in one half',
   text:'Kevin picked himself up. He trained harder than before. Once, coming on as a substitute for Genk’s second team, he scored five goals in just one half.\n\nKick the ball five times. He later said the hard time with the host family was a lesson for life. In 2009 he played his first game for Genk’s first team, and in 2011 Genk became champions of Belgium.',
   lesson:'You can turn hurt into effort. Keep working at the things you love.',
   prompt:'Kick the ball five times',response:'Five goals!',steps:5,source:1},
  {id:'chelsea',year:'2012 to 2014 · Chelsea',title:'Stuck on the bench',
   text:'In 2012, Kevin signed for Chelsea in England, a dream move. First he was loaned to Werder Bremen in Germany, where he played well. Back at Chelsea, he set up a goal in his first league game.\n\nTurn the calendar pages. After that, he was mostly left on the bench. The manager, José Mourinho, said he did not fit Chelsea’s style. With so few chances to play, Kevin lost his form.',
   lesson:'Not being picked hurts. It does not mean you are not good enough.',
   prompt:'Turn the calendar pages',response:'Still waiting for a chance.',steps:3,source:1},
  {id:'wolfsburg',year:'2014 to 2015 · Wolfsburg',title:'Brave enough to move',
   text:'Belgium’s coach told his players to play as much as they could for their clubs. Kevin was hardly playing, so he asked to leave Chelsea. In January 2014, he joined Wolfsburg in Germany.\n\nOpen the door to Wolfsburg. There, he became one of the best players in the Bundesliga. In the 2014 to 2015 season he set a Bundesliga record with 21 assists, and scored in the German Cup final, which Wolfsburg won.',
   lesson:'Sometimes you need a fresh start. Asking for a change is okay.',
   prompt:'Open the door',response:'Playing again!',source:0},
  {id:'city',year:'2015 and after · Manchester City',title:'Not finished',
   text:'In 2015, Manchester City paid a club record fee to sign Kevin. He stayed for ten seasons. He won the Champions League and six Premier League titles, and helped City become the only team to reach 100 points in a Premier League season.\n\nRaise the trophy. He also won five League Cups and two FA Cups. The boy who was sent away from his host family became one of the best players of his generation.',
   lesson:'Other people’s opinions do not decide your future. Keep going.',
   prompt:'Raise the trophy',response:'Not finished at all!',source:0},
 ]
};
