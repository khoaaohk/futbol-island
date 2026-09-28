import type {BookData} from '../types';
/** Original child-readable retelling of the hardships in Mohamed Salah's path. Facts come from the cited sources; the coping lessons are ours, not quotations.
 * Subtitle note: no cited source says the journey to training was by bus, so the book says "journey". */
export const SALAH_BOOK:BookData={
 title:'Salah',subtitle:'The long journey to training',itemId:'display:rooftop:book:salah',player:'Mohamed Salah',
 sources:[
  {label:'Wikipedia · Mohamed Salah',url:'https://en.wikipedia.org/wiki/Mohamed_Salah'},
  {label:'Wikipédia (Français) · Mohamed Salah',url:'https://fr.wikipedia.org/wiki/Mohamed_Salah'},
  {label:'Wikipedia (Deutsch) · Mohamed Salah',url:'https://de.wikipedia.org/wiki/Mohamed_Salah'},
 ],
 pages:[
  {id:'village',year:'Nagrig · Egypt',title:'A village boy',
   text:'Mohamed Salah was born in 1992 and grew up in Nagrig, a village in the north of Egypt where many families have very little money. His mother looked after the home, and his father worked in a hospital office. Mohamed spent most of his free time playing football in the streets.\n\nRoll the ball down the street. At twelve, he joined a small local team, Ittihad Basyoun, and a year later a club in the nearby city of Tanta.',
   lesson:'Where you start does not decide how far you can go.',
   prompt:'Roll the ball down the street',response:'Football in the streets of Nagrig.',source:1},
  {id:'journey',year:'Aged 14 · 2006',title:'The long journey',
   text:'In 2006, when Mohamed was fourteen, a scout came to watch another child play, but he noticed Mohamed instead. Mohamed joined the youth team of Al Mokawloon, a club in Egypt’s capital, Cairo, more than 150 kilometres from home.\n\nFollow the long road. The journey to training took about three hours, and he often had to miss school to make it. He later said that when he got home at night, he had to go straight to sleep and wake up early the next day.',
   lesson:'Big dreams can take a lot of tired days. Rest well, then keep going.',
   prompt:'Follow the long road',response:'About three hours to Cairo.',steps:3,source:0},
  {id:'tears',year:'Al Mokawloon · 2010',title:'Tears after the game',
   text:'When Mohamed was fifteen, the first-team manager, Mohamed Radwan, moved him up to train with the grown-ups. He was still growing, so the club gave him a special diet and training plan. In 2010, he began playing in the Egyptian Premier League.\n\nLift the rain cloud. At first, Mohamed struggled to score. Sometimes he cried in the dressing room after matches. His manager said this only made him want to get better. On Christmas Day 2010, he scored his first goal for the club.',
   lesson:'It’s okay to cry when things are hard. Your feelings can help you try again.',
   prompt:'Lift the rain cloud',response:'He kept trying, and he scored.',source:0},
  {id:'basel',year:'2012 · Switzerland',title:'A new country',
   text:'In February 2012, something terrible happened at a stadium in the city of Port Said, and many people died. Afterwards, the Egyptian league was stopped, and the rest of the season was cancelled.\n\nOpen the door to Switzerland. The Swiss club Basel had been watching Mohamed, and they signed him. At first, it was hard to settle. He could not speak the language, and he was replacing a well-known player. But Basel won the Swiss league in his first season.',
   lesson:'Being new somewhere is hard. Settling in takes time, so be patient with yourself.',
   prompt:'Open the door',response:'A new country, a new language.',source:0},
  {id:'bench',year:'2014 to 2016',title:'Left on the bench',
   text:'In 2014, Mohamed became the first Egyptian to join Chelsea, in London. But in his second season there, he was rarely picked. He played only three Premier League games, and his manager criticised him in public.\n\nFlip the shirt. In 2015, Chelsea sent him on loan to Fiorentina in Italy. He chose the number 74, to honour the people who died in Port Said. Then, on loan at Roma, he scored 15 goals and was named the club’s Player of the Season.',
   lesson:'Being left out doesn’t mean you’re not good enough. A fresh start can help you shine.',
   prompt:'Flip the shirt',response:'Number 74, to remember.',source:0},
  {id:'liverpool',year:'2017 and after',title:'Remembering home',
   text:'In 2017, Mohamed joined Liverpool. In his first season, he scored 32 Premier League goals, a record for a 38-game season. Later, he helped Liverpool become champions of Europe and champions of England.\n\nBuild the school. Mohamed never forgot Nagrig. He has given money to help build a school and a hospital there, and he helps many families. The boy who once travelled for hours to train is now helping his village.',
   lesson:'Remember where you came from. Helping others is a way of saying thank you.',
   prompt:'Build the school',response:'Giving back to Nagrig.',steps:3,source:0},
 ]
};
