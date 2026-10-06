import {EXHIBITS} from '../endgame/museum';

/**
 * Storytelling exhibits (Oct 4 2026, user: "Each section opens up a modal. That is not the interaction we want. Want more
 * storytelling… think outside the box and make it more interactive like [the pop-up books]"). Pure, so tests/museum-room.cjs
 * can check every line.
 *
 * A story is 3–6 beats. The kid causes every beat: tap, pull a lever, crank or choose. The exhibit animates in the case
 * (lib/museum/museumExhibits.ts), the coach voices ONE line (public/voice/museum, baked by scripts/museum/kokoro-museum.py) and
 * the caption strip shows it. The last beat is the case's own "Take it to your game" line.
 *
 * Grounding (no new history): a beat's `line` is either
 *  - `fact`: copied word for word from that case's facts (a whole fact or a contiguous part of one), so its source is the
 *    case's own sources; or
 *  - `cue`: a stage direction about what the animation shows. It may not carry any date, number or name (the test forbids
 *    digits and capitalised words after the first), so it can't sneak in a claim.
 */
export type StoryControl='tap'|'pull'|'crank'|'choose';
export type StoryBeat={control:StoryControl;
 /** The button/hint text for the action that plays this beat (UI words, not narrated). */
 prompt:string;
 /** The exhibit animation this beat plays (museumExhibits.ts). */
 anim:string;line:string;kind:'fact'|'cue';
 /** `choose` beats: the buttons (label + the value passed to the animation). Default: Left / Middle / Right. */
 options?:readonly {label:string;arg:number}[]};
export type Story={id:string;beats:readonly StoryBeat[]};

const fact=(control:StoryControl,prompt:string,anim:string,line:string):StoryBeat=>({control,prompt,anim,line,kind:'fact'});
const cue=(control:StoryControl,prompt:string,anim:string,line:string):StoryBeat=>({control,prompt,anim,line,kind:'cue'});

export const STORIES:Readonly<Record<string,Story>>={
 // The free first case: a meeting-table diorama. Rule books of every colour, then one book, then everyone plays.
 'laws-1863':{id:'laws-1863',beats:[
  fact('tap','Tap the quill','argue','Before that, schools and clubs each played by their own rules.'),
  fact('tap','Bring the books together','merge','In 1863 the Football Association was formed in London and wrote down one set of rules'),
  fact('tap','Open the door','play','so different clubs could play each other.'),
  fact('tap','Stamp the rule book','stamp','Since 1886 the International Football Association Board (IFAB) has looked after the Laws of the Game.'),
 ]},
 // "Stand where they stood": the floor marker in front of the case drops the camera behind the ball.
 'penalty-1891':{id:'penalty-1891',beats:[
  fact('tap','Blow the whistle','whistle','The penalty kick joined the Laws in 1891. The idea came from William McCrum, a goalkeeper from Ireland.'),
  fact('tap','Place the ball','place','Today the ball goes on the penalty mark, 11 metres from the goal line.'),
  fact('tap','Watch the keeper','keeper','The goalkeeper stays on the goal line until the ball is kicked.'),
  cue('choose','Pick your spot','shoot','You picked your spot. Strike!'),
 ]},
 // A hand-cranked zoetrope: crank the old rule, pull the lever, crank the new one.
 'backpass-1992':{id:'backpass-1992',beats:[
  cue('crank','Turn the crank','old','A team-mate kicks it back, and the keeper picks it up.'),
  fact('pull','Pull the lever','lever','Since 1992, a goalkeeper may not pick up the ball when a team-mate deliberately kicks it back to them.'),
  fact('crank','Turn the crank again','new','The change stopped teams wasting time and made the game faster.'),
  fact('tap','Watch the keeper','feet','It is why today’s keepers practise passing and receiving with their feet.'),
 ]},
 // A split-flap scoreboard: every lever pull flips the next part of the story.
 'worldcup-1930':{id:'worldcup-1930',beats:[
  fact('pull','Pull the lever','host','The first FIFA World Cup was played in Uruguay in 1930.'),
  fact('pull','Pull it again','teams','Only 13 teams took part.'),
  fact('pull','Pull for the final','final','Uruguay, the hosts, won it, beating Argentina 4–2 in the final in Montevideo.'),
 ]},
 // A magic lantern projects the idea onto the wall: traffic lights become cards.
 'cards-1970':{id:'cards-1970',beats:[
  fact('tap','Light the lantern','lamp','English referee Ken Aston had the idea while waiting at traffic lights'),
  fact('tap','Tap the amber light','yellow','yellow means careful'),
  fact('tap','Tap the red light','red','red means stop.'),
  fact('tap','Next slide','mexico','Yellow and red cards were first used at the 1970 World Cup in Mexico.'),
  fact('tap','Show the crowd','crowd','Cards showed every player and fan the referee’s decision, whatever language they spoke.'),
 ]},
 // The VAR booth: sit in, see what VAR may check, scrub the replay, make the call.
 'var-2018':{id:'var-2018',beats:[
  fact('tap','Sit in the booth','booth','The video assistant referee (VAR) was first used at a men’s World Cup in 2018, in Russia.'),
  fact('tap','What can VAR check?','checks','VAR can only help with clear mistakes about goals, penalties, straight red cards and mistaken identity.'),
  fact('tap','Scrub the replay','scrub','A goal counts only when the whole ball has crossed the whole goal line, between the posts and under the crossbar.'),
  {...fact('choose','Make the call','call','The referee on the pitch still makes the final decision.'),options:[{label:'Goal',arg:1},{label:'No goal',arg:0}]},
 ]},
 // A spinning globe and a little final.
 'wwc-1991':{id:'wwc-1991',beats:[
  fact('tap','Spin the globe','spin','The first FIFA Women’s World Cup was played in China in 1991.'),
  fact('tap','Watch the final','goals','Michelle Akers scored both US goals in that final.'),
  fact('tap','Blow for full time','result','The USA won it, beating Norway 2–1 in the final.'),
 ]},
 // A tabletop indoor court: the low-bounce ball and the sole roll.
 'futsal-1989':{id:'futsal-1989',beats:[
  fact('tap','Light the court','court','Futsal began in Montevideo, Uruguay, in 1930, when Juan Carlos Ceriani made up a five-a-side game for indoor courts.'),
  fact('tap','Drop both balls','bounce','Futsal’s small, low-bounce ball'),
  fact('tap','Try the sole roll','sole','rewards close control with the sole of the foot.'),
  fact('tap','Raise the pennant','cup','The first FIFA Futsal World Cup was played in the Netherlands in 1989, and Brazil won it.'),
 ]},
 // The ball cabinet: a weighing scale, a rain cloud, three ball sizes.
 'laced-leather':{id:'laced-leather',beats:[
  fact('tap','Weigh the leather ball','weigh','Before the 1960s most footballs were brown leather with laces.'),
  fact('tap','Make it rain','rain','They soaked up rain and got heavy.'),
  fact('tap','Weigh a size 5','size5','Today an adult match ball is size 5: 68–70 cm around and 410–450 grams.'),
  fact('tap','A ball for every age','sizes','Younger players use smaller size 3 or 4 balls, so the ball fits the player.'),
 ]},
 // An old TV set with a colour knob.
 'telstar-1970':{id:'telstar-1970',beats:[
  fact('tap','Switch on the TV','tv','The official ball of the 1970 World Cup in Mexico was the Adidas Telstar.'),
  fact('tap','Turn the colour knob','bw','Its 32 panels were black and white, so it stood out on black-and-white television.'),
  fact('tap','Spin the ball','spin','That black-and-white pattern became the picture of a football all over the world.'),
 ]},
 // Kit lockers: the numbers light up, the doors open, the teams line up.
 'shirts':{id:'shirts',beats:[
  fact('tap','Light the lockers','numbers','In England, numbered shirts were first worn in league games in 1928 and became compulsory in 1939.'),
  fact('tap','Open locker 1','open1','Classic numbers followed positions: 1 the goalkeeper'),
  fact('tap','Open locker 9','open9','9 the striker'),
  fact('tap','Open locker 10','open10','10 the playmaker.'),
  fact('tap','Line up the teams','colours','The Laws say the two teams must wear colours that are different from each other and from the referees, and each goalkeeper wears a colour of their own.'),
 ]},
 // The Hall of Fame podium (the player's own certificates).
 'hall-of-fame':{id:'hall-of-fame',beats:[
  fact('tap','Step onto the podium','podium','Every path you graduate hangs its certificate here.'),
  fact('tap','Look down the path','ferry','Graduate all four paths to board the Matchday Ferry for your Matchday final.'),
 ]},
};
export const isStoryCase=(id:string|null|undefined):id is string=>!!id&&Object.prototype.hasOwnProperty.call(STORIES,id);
/** The takeaway (the case's own forYourGame line), voiced as the final beat. */
export const storyTakeaway=(id:string)=>EXHIBITS.find(e=>e.id===id)?.forYourGame??'';
/** Every line the coach voices (beats + takeaways), for the bake and the manifest test. */
export function storyLines():string[]{
 const out:string[]=[];for(const s of Object.values(STORIES)){for(const b of s.beats)out.push(b.line);out.push(storyTakeaway(s.id));}return [...new Set(out)];
}

// ---- The beat engine: idle → beat 0 … beat n−1 → takeaway → done. A beat can't be skipped while it plays. ----------------
export type StoryState={id:string;next:number;playing:boolean;done:boolean};
export const startStory=(id:string):StoryState=>({id,next:0,playing:false,done:false});
/** The kid acted: begin the next beat (or the takeaway after the last beat). Ignored while a beat plays or when done. */
export function beginBeat(s:StoryState):{state:StoryState;beat:StoryBeat|'takeaway'}|null{
 const story=STORIES[s.id];if(!story||s.playing||s.done)return null;
 const beat=s.next<story.beats.length?story.beats[s.next]:'takeaway';
 return {state:{...s,playing:true},beat};
}
/** The beat finished (animation + line): move on; the takeaway ends the story. */
export function endBeat(s:StoryState):StoryState{
 const story=STORIES[s.id];if(!story||!s.playing)return s;
 const n=s.next+1;return {...s,playing:false,next:n,done:n>story.beats.length};
}

// ---- Voice files: FNV-1a of the line (the island's voice-file contract, lib/voiceFiles.ts). ----------------------------
export function storyLineHash(line:string){let h=0xcbf29ce484222325n;for(const b of new TextEncoder().encode(line)){h^=BigInt(b);h=(h*0x100000001b3n)&0xffffffffffffffffn;}return h.toString(16).padStart(16,'0');}
export const storyVoiceUrl=(line:string)=>`/voice/museum/${storyLineHash(line)}.m4a`;
/** Without a voice clip (voice off or not baked): hold the caption long enough to read. */
export const captionMs=(line:string)=>Math.max(1800,Math.min(7000,line.length*45));
