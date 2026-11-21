import type {BookData} from '../types';
/** Original child-readable retelling of Vinícius Júnior's childhood and how he speaks up against racism (staged Nov 21 2026: not sold until its
 *  spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. The abuse is named as racism
 *  but never quoted or described. */
export const VINICIUS_BOOK:BookData={
 title:'Vinícius',subtitle:'Standing up to racism',itemId:'display:eleven:book:vinicius',player:'Vinícius Júnior',
 sources:[
  {label:'Wikipedia · Vinícius Júnior',url:'https://en.wikipedia.org/wiki/Vin%C3%ADcius_J%C3%BAnior'},
  {label:'UN News · Vinícius Junior appointed UNESCO Goodwill Ambassador',url:'https://news.un.org/en/node/1146172'},
  {label:'ESPN · Real Madrid’s Vinícius named UNESCO goodwill ambassador',url:'https://africa.espn.com/football/story/_/id/39443775/real-madrids-vinicius-named-unesco-goodwill-ambassador'},
 ],
 pages:[
  {id:'goncalo',year:'São Gonçalo · Aged 6',title:'A boy who loved the ball',
   text:'Vinícius Júnior was born in 2000 in São Gonçalo, near Rio de Janeiro, in Brazil. His family did not have much money. When he was six, his father took him to a football school run by the club Flamengo, near their home.\n\nKick the ball. Vinícius played futsal there, the fast, small-sided game, before he chose football. Futsal is played on a hard court with a smaller ball, and it teaches quick feet and fast thinking. Those skills stayed with him.',
   lesson:'You don’t need much to start. A ball and a chance can be enough.',
   prompt:'Kick the ball',response:'First touches.',source:0},
  {id:'uncle',year:'2010 · Flamengo',title:'Help from his family',
   text:'In 2010, Vinícius had a trial for Flamengo’s youth team, and he was accepted. But the training ground was a long way from home. Getting there every day would have been very hard.\n\nOpen the door. Vinícius moved in with his uncle Ulisses, to be closer to training. The club and some local business people also helped the family with money. Many people helped one boy chase his dream.',
   lesson:'The people who help you are part of your team.',
   prompt:'Open the door',response:'Welcome, Vinícius!',source:0},
  {id:'madrid',year:'2017 to 2018',title:'A big move, and big pressure',
   text:'Vinícius played his first match for Flamengo’s first team at sixteen. Real Madrid agreed to sign him, and in 2018, when he was eighteen, he moved to Spain. Moving to a new country at eighteen, with a new language, is a big change.\n\nLift the flap. Some people said his shooting was not good enough. Vinícius kept practising, and he kept getting better. He worked on his shooting and his decisions in front of goal.',
   lesson:'When people criticise you, use it to practise, not to give up.',
   prompt:'Lift the flap',response:'Practise, and keep going.',source:0},
  {id:'final',year:'2022 · Paris',title:'The winning goal',
   text:'In May 2022, Real Madrid played Liverpool in the Champions League final, in Paris. Vinícius scored the only goal of the game. Millions of people were watching around the world.\n\nFlip the scoreboard. Real Madrid won 1–0 and were the champions of Europe. The player people had doubted had scored the winning goal in the biggest club final of all.',
   lesson:'Keep believing in yourself, even when others doubt you.',
   prompt:'Flip the scoreboard',response:'Champions of Europe!',source:0},
  {id:'racism',year:'2023 · Spain',title:'Speaking up',
   text:'In Spain, some people in football crowds abused Vinícius because of the colour of his skin. This is called racism, and it is always wrong. Nobody should ever be treated badly because of how they look.\n\nRaise the banner. Vinícius did not stay quiet. He spoke up and asked for stronger action. In Brazil, new laws named after him allow matches to be stopped when there is racist abuse, and FIFA asked him to lead a group of players working against racism.',
   lesson:'Racism is never okay. Speaking up, and standing with people treated unfairly, takes courage.',
   prompt:'Raise the banner',response:'Together against racism.',source:0},
  {id:'school',year:'2021 to 2024',title:'Helping children learn',
   text:'In 2021, Vinícius started the Instituto Vini Jr., which helps children and teenagers from poor neighbourhoods in Brazil to go to school and keep learning. Vinícius had grown up in a family without much money.\n\nOpen the book. In 2024, UNESCO, part of the United Nations, made him a Goodwill Ambassador for education. He was only the second Brazilian footballer to do this job, after Pelé. That December, FIFA named him The Best Men’s Player in the world.',
   lesson:'Use what you have to help others. Learning opens doors.',
   prompt:'Open the book',response:'Learning for everyone.',source:1},
 ]
};
