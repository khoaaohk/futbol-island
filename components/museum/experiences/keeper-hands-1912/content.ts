/**
 * keeper-hands-1912 · the words. The case's own facts and "take it to your game" line live in lib/endgame/museum.ts and are shown
 * word for word; these are the sourced extras, the story beats and the quick check. Checked Oct 14 2026 against the sources below.
 * (The museum retired its back-pass exhibit on Oct 12 2026, so the 1992 rule gets one line here, no more.)
 */
export const EXTRA={
 first:'Goalkeepers were first named in the Laws in 1871, allowed to handle the ball “for the protection of his goal”.',
 half:'From 1887 a keeper could not handle the ball in the other team’s half, so their hands worked anywhere in their own half.',
 roose:'Wales goalkeeper Leigh Richmond Roose loved to handle the ball far upfield. It has been said that the 1912 change was made because of keepers like him.',
 gloves:'Before the 1970s goalkeepers rarely wore gloves. Today it is very unusual to see a keeper without them.',
 backpass:'One more change came in 1992: a keeper may not pick up a ball a teammate kicks back to them on purpose.',
} as const;
export const SOURCES=[
 {title:'Wikipedia · Goalkeeper (association football)',url:'https://en.wikipedia.org/wiki/Goalkeeper_(association_football)'},
 {title:'Wikipedia · Laws of the Game (association football)',url:'https://en.wikipedia.org/wiki/Laws_of_the_Game_(association_football)'},
 {title:'Wikipedia · Leigh Richmond Roose',url:'https://en.wikipedia.org/wiki/Leigh_Richmond_Roose'},
 {title:'Wikipedia · Kit (association football)',url:'https://en.wikipedia.org/wiki/Kit_(association_football)'},
 {title:'IFAB Laws of the Game · Law 1 The Field of Play',url:'https://www.theifab.com/laws/latest/the-field-of-play/'},
 {title:'IFAB Laws of the Game · Law 12 Fouls and Misconduct',url:'https://www.theifab.com/laws/latest/fouls-and-misconduct/'},
] as const;
export const BEATS=[
 {when:'Before 1912',head:'Hands to halfway',text:'A goalkeeper could handle the ball anywhere in their own half.'},
 {when:'1912',head:'Only in the box',text:'The Law changed: hands only inside the goalkeeper’s own penalty area. It is still the Law today.'},
 {when:'Your job',head:'Crank the keeper',text:'Turn the two cranks to move the keeper, flip the Law switch, then take a keeper’s glove apart.'},
] as const;
/** The glove's layers, bottom (palm side) to top: name and one line each (short for phones). */
export const LAYER_TEXT={
 palm:{n:'1',name:'Grip palm',line:'The palm is made to protect the hand and to grip the ball.',short:'Protects and grips'},
 hand:{n:'2',name:'Your hand',line:'Before the 1970s most keepers caught the ball with bare hands like this.',short:'Bare hands, before the 1970s'},
 spines:{n:'3',name:'Finger protectors',line:'Stiff strips that stop the fingers bending backwards when a hard shot hits them.',short:'Stop fingers bending back'},
 back:{n:'4',name:'Segmented back',line:'Cut into segments so the glove bends with your fingers.',short:'Bends with your fingers'},
 strap:{n:'5',name:'Wrist strap',line:'Holds the glove tight on your wrist.',short:'Holds it tight'},
} as const;
export const GLOVE_FACT='Gloves come in different cuts, like “flat palm”, “roll finger” and “negative”, with different stitching and fit.';
export const CHECKS=[
 {q:'Since 1912, where may a goalkeeper handle the ball?',options:['Only in their own penalty area','Anywhere in their own half','Anywhere on the pitch'],right:0,
  why:'Inside their own penalty area. Before 1912 it was anywhere in their own half.'},
 {q:'A long ball bounces 25 metres from your goal and you are the keeper. What do you do?',options:['Come out and kick it clear, or let a defender take it','Run out and catch it','Stay on the line and wave'],right:0,
  why:'25 metres out is outside the box: no hands there. Come out only if you will win it with your feet, or let a defender deal with it.'},
 {q:'A cross is coming into the six-yard box. Why is it often the keeper’s ball?',options:['The keeper can use hands there and reach higher','Defenders may not head the ball','The keeper is always the tallest'],right:0,
  why:'In the box the keeper can jump and catch with hands, higher than anyone can head it. Call “Keeper!” and claim it.'},
 {q:'What do finger protectors in a keeper’s glove do?',options:['Stop the fingers bending backwards','Keep the hands warm','Make the ball curve'],right:0,
  why:'They stop the fingers bending backwards when a hard shot hits them. Keepers’ gloves have got much better since the 1980s.'},
] as const;
export const MODEL_NOTE='The half pitch is drawn to scale from Law 1: the penalty area is 16.5 metres out from each post. The keeper, the ball, the gantry and the glove are drawings made for this museum, bigger than life so you can see them.';
