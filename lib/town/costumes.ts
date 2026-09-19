/** Club-culture lessons for the wardrobe. Animal shapes are original island interpretations. */
export type AnimalKind='wildcat'|'dinosaur'|'liverbird'|'lion'|'fox'|'bear'|'bee'|'goat'|'zebra'|'wolf'|'eagle'|'lynx'|'vulture'|'pig'|'rooster'|'orca'|'dog'|'puma'|'deer'|'giraffe';
export type ClubCostume={
 id:string;club:string;country:string;name:string;animal:AnimalKind;animalLabel:string;
 color:number;accent:number;kitColor:number;story:string;
 storyType:'history'|'club-fiction'|'historic-symbol';source:string;
 question:string;choices:[string,string,string];answer:number;explanation:string;
};

export const CLUB_COSTUMES:ClubCostume[]=[
 {
  id:'barcelona',club:'FC Barcelona',country:'Spain',name:'CAT',animal:'wildcat',animalLabel:'Wildcat',color:0xe9bc43,accent:0x98264d,kitColor:0x284b89,
  story:'FC Barcelona introduced CAT in November 2024 as part of its 125th-anniversary celebrations. The animal is a wildcat native to Catalonia. Look closely at the design: the club describes ears and facial shapes inspired by its crest, with blue, red and yellow connecting the character to Barça and its Catalan identity.\n\nCAT represents more than the men’s first team, appearing around the club’s other teams and local traditions too. This is a useful way to read a football mascot: its animal, shapes and colors can tell you where a club belongs and what it wants to celebrate. Barça also associates CAT with respect, effort and teamwork.',storyType:'history',
  source:'https://www.fcbarcelona.com/en/cat-culer',
  question:'What local connection does CAT celebrate?',choices:['Wildcats native to Catalonia','A stadium built in the desert','A club founded in the Arctic'],answer:0,
  explanation:'CAT is a Catalan wildcat. A mascot can connect a football club with the wildlife and identity of its home region.'
 },
 {
  id:'arsenal',club:'Arsenal',country:'England',name:'Gunnersaurus',animal:'dinosaur',animalLabel:'Dinosaur',color:0x68964f,accent:0xf0d57d,kitColor:0xb63336,
  story:'Gunnersaurus began with an idea from a young supporter. In 1994, eleven-year-old Peter Lovell entered a Junior Gunners design competition, combining two things he loved: Arsenal and dinosaurs. His drawing helped create the green character that became part of the club’s matchday identity. The important origin here is a child’s creative contribution, not a real dinosaur discovery.\n\nFootball culture is made by supporters as well as players. A club can invite children to help create a tradition that later generations recognize. When you see Gunnersaurus, remember that a fan did not need to score a professional goal to leave a lasting mark on Arsenal.',storyType:'history',
  source:'https://www.mlssoccer.com/allstar/2025/news/gunnersaurus-arsenals-mascot-kids-drawing-international-fame',
  question:'Who helped create Arsenal’s dinosaur mascot?',choices:['A visiting referee','A young Arsenal supporter','An opposing team’s captain'],answer:1,
  explanation:'Peter Lovell entered a drawing as a young fan. Supporters, including children, can help shape a club’s culture.'
 },
 {
  id:'liverpool',club:'Liverpool',country:'England',name:'Mighty Red',animal:'liverbird',animalLabel:'Liver bird',color:0xc94843,accent:0xf0ba5c,kitColor:0x9c2734,
  story:'Liverpool introduced Mighty Red in 2012, turning its familiar Liver bird emblem into a character young supporters could meet. The Liver bird is a mythical symbol, not a species you would identify in a wildlife guide. Mighty Red’s launch and community appearances are real club history, even though the character itself is imaginary.\n\nLiverpool describes the mascot traveling with the team and its Foundation to meet children in different communities. Its mascot programme has also received Makaton Friendly recognition for supporting communication through signs and symbols. The football connection is inclusion: a recognizable character can help more people feel welcome in the club’s wider family.',storyType:'history',
  source:'https://www.liverpoolfc.com/news/special-celebration-10-years-lfcs-official-mascot-mighty-red?amp=1',
  question:'Which club symbol inspired Mighty Red?',choices:['A racing horse','A mountain goat','The Liver bird emblem'],answer:2,
  explanation:'Mighty Red brings the Liver bird emblem to life as a character. Football symbols can appear on both badges and mascots.'
 },
 {
  id:'chelsea',club:'Chelsea',country:'England',name:'Stamford',animal:'lion',animalLabel:'Lion',color:0xdbc081,accent:0x9f773f,kitColor:0x3151aa,
  story:'Stamford the lion reflects an animal already familiar from Chelsea’s badge. The club’s account of its crest connects the lion to local heraldry: the coat of arms associated with Chelsea. That gives the symbol a link to place and history, rather than making it simply a fierce animal chosen for a football shirt.\n\nA crest and a mascot play different roles. The crest identifies the club on shirts and official materials; a character such as Stamford brings an animal identity into encounters with supporters. Looking at both helps you understand how one football club can carry a local symbol through different designs and generations.',storyType:'history',
  source:'https://www.chelseafc.com/en/news/article/the-history-behind-the-badge-the-lion',
  question:'What does Chelsea’s lion connect the club to?',choices:['Its badge and local heraldry','A rule about goalkeepers','The shape of its pitch'],answer:0,
  explanation:'The lion is part of Chelsea’s badge heritage. Club crests often borrow symbols from the places they represent.'
 },
 {
  id:'leicester',club:'Leicester City',country:'England',name:'Filbert Fox',animal:'fox',animalLabel:'Fox',color:0xd58a45,accent:0xf2e3c3,kitColor:0x4167ad,
  story:'Leicester’s new fox first appeared at Filbert Street on 19 September 1992, before a game against Brentford. The mascot still needed a name, so the matchday magazine invited supporters to enter a competition. Fans dropped their suggestions into a special box at the club shop. Hundreds chose Filbert, and the club announced that popular choice soon afterward.\n\nThe story links a mascot with supporters and the club’s former ground. Filbert continued appearing as Leicester moved from Filbert Street to King Power Stadium. A familiar character can carry memories between grounds, helping a football club keep part of its identity even when its home changes.',storyType:'history',
  source:'https://www.lcfc.com/media-article/Filbert-Fox-The-Origins-Of-Leicester-City%27s-Mascot',
  question:'How was the name Filbert chosen?',choices:['By drawing a player’s shirt number','Through a supporters’ naming competition','By the away team'],answer:1,
  explanation:'Fans submitted names for the new fox. Filbert was the popular choice, showing how supporters contribute to club traditions.'
 },
 {
  id:'bayern',club:'FC Bayern Munich',country:'Germany',name:'Berni',animal:'bear',animalLabel:'Bear',color:0x946a46,accent:0xdac09a,kitColor:0xc24342,
  story:'Berni has been FC Bayern’s official mascot since 2004. The club presents the bear as a devoted supporter who cheers from the sidelines and spends time with children through its Kids Club. Berni is associated with both matchdays and life around the club’s Säbener Straße training base.\n\nThis shows why a football mascot’s job extends beyond celebrating a goal. Young supporters can build a connection through activities and visits before they understand every tactic on the pitch. Berni gives that connection a familiar face. The lesson is about belonging: supporting a club also includes welcoming its youngest fans and sharing experiences with them.',storyType:'history',
  source:'https://fcbayern.com/kidsclub/de/maskottchen',
  question:'What is one of Berni’s roles at Bayern?',choices:['Choosing the referee','Changing the league rules','Welcoming young supporters'],answer:2,
  explanation:'Berni supports the team and spends time with children in the Kids Club. Mascots help young fans feel part of their club.'
 },
 {
  id:'dortmund',club:'Borussia Dortmund',country:'Germany',name:'EMMA',animal:'bee',animalLabel:'Bee',color:0xe9ca40,accent:0x343531,kitColor:0xd9af28,
  story:'EMMA the bee has represented Borussia Dortmund since 2005. Her black-and-yellow appearance matches the club’s recognizable colors, while her name points to a person from its football history: Lothar Emmerich. Dortmund’s own profile explains that the mascot honors the club legend, giving the friendly character a connection to an earlier generation of players.\n\nA mascot can therefore carry two kinds of clues. Its colors help you recognize the team immediately, and its name can open a story about someone supporters remember. When learning a new club, looking up an unfamiliar mascot name is one way to discover the players and traditions behind today’s matchday experience.',storyType:'history',
  source:'https://www.bvb.de/de/en/borussia-dortmund/glossary/emma.html',
  question:'Who does EMMA’s name honor?',choices:['Club legend Lothar Emmerich','A visiting match official','The stadium architect'],answer:0,
  explanation:'EMMA is named after Lothar Emmerich. A mascot’s name can help keep a club legend’s memory alive.'
 },
 {
  id:'koln',club:'1. FC Köln',country:'Germany',name:'Hennes',animal:'goat',animalLabel:'Goat',color:0xe7deca,accent:0x89745a,kitColor:0xb94342,
  story:'Köln’s goat tradition began with a real animal. On 13 February 1950, Circus Williams gave the club a goat at its carnival celebration. The mascot received the name Hennes after coach Hennes Weisweiler. The club’s historical account follows the first Hennes beyond that event, including the supporters who helped give him a home and look after him.\n\nThis origin connects football with a local celebration and the people around the team. It also explains why Hennes is different from a character first invented for a costume: a living animal started the tradition. Club identity can grow from a memorable community event and continue across generations.',storyType:'history',
  source:'https://fc.de/club/ueber-den-fc/historie-und-erfolge/hall-of-fame/hennes-i',
  question:'How did Köln’s goat mascot tradition begin?',choices:['A new league rule required it','A circus gave the club a goat','A player won a drawing contest'],answer:1,
  explanation:'The first Hennes was a real goat given to the club at a carnival event. Some football mascots begin with real animals and local celebrations.'
 },
 {
  id:'juventus',club:'Juventus',country:'Italy',name:'J',animal:'zebra',animalLabel:'Zebra',color:0xe9e8df,accent:0x313733,kitColor:0x424946,
  story:'Juventus introduced J the zebra in September 2015 as part of its JKids project. The black-and-white character matches the colors associated with the club. In the launch announcement, Juventus presented J as a guide to a children’s section with activities to enjoy at home and at the stadium, making the mascot part of a wider invitation to young supporters.\n\nThe football lesson is that club participation does not begin and end with watching the first team. Children can learn, create and take part in activities that help them recognize the club’s identity. J provides a friendly link between those experiences and the black-and-white team on the pitch.',storyType:'history',
  source:'https://www.juventus.com/en/news/articles/juventus-launches-jkids',
  question:'Who was the JKids project designed for?',choices:['Only professional coaches','Only match referees','Young Juventus supporters'],answer:2,
  explanation:'J introduces children to club activities. Supporting a football club can include learning and taking part beyond watching matches.'
 },
 {
  id:'roma',club:'AS Roma',country:'Italy',name:'Romolo',animal:'wolf',animalLabel:'Wolf',color:0xb09065,accent:0xe4c995,kitColor:0x8f3436,
  story:'Roma first introduced a wolf mascot called Romolo during the 1999–2000 season. Almost twenty years later, the club revealed a redesigned version with a surprise visit to a summer football camp in Sardinia. Children had just finished training with Roma coaches when Romolo appeared. The club reported the visit in August 2019, ahead of the new character’s appearance in Rome.\n\nThe name and animal continued while the design changed. That is a useful example of how football traditions can develop without starting again from nothing. Meeting the mascot after coaching also joined two sides of the club experience: learning to play and feeling part of the team’s community.',storyType:'history',
  source:'https://www.asroma.com/en/news/55927/delighted-kids-receive-surprise-visit-from-new-club-mascot',
  question:'Who welcomed the redesigned Romolo at his first public outing?',choices:['Children at a Roma football camp','A panel of match referees','An opposing team’s directors'],answer:0,
  explanation:'Romolo met children after their training session with Roma coaches. Club mascots can connect football learning with a sense of belonging.'
 },
 {
  id:'benfica',club:'SL Benfica',country:'Portugal',name:'Vitória',animal:'eagle',animalLabel:'Eagle',color:0x76553d,accent:0xe5dfc9,kitColor:0xce4940,
  story:'An eagle stands at the top of Benfica’s badge. UEFA’s account of the club’s symbols explains its association with independence, authority and nobility, tracing the emblem to the club’s beginnings in 1904. The eagle identity also appears in a live matchday tradition, with birds including Vitória flying around the stadium before home games and landing on the club crest.\n\nHere the badge and the pre-match ceremony reinforce one another. Supporters see a symbol on a shirt and then experience it in the stadium. Learning what that eagle represents helps explain why the ceremony matters to the club, rather than treating it as entertainment unrelated to football culture.',storyType:'history',
  source:'https://www.uefa.com/uefaeuropaleague/news/0250-0e998e71baee-b81cff7fd877-1000--eagles-v-eagles-europa-league-quarter-finals-in-nicknames/',
  question:'What does Benfica’s eagle symbolize?',choices:['A limit on player substitutions','Independence, authority and nobility','The number of goals in a match'],answer:1,
  explanation:'The eagle represents values associated with Benfica. A club badge can express ideas as well as identify a team.'
 },
 {
  id:'psg',club:'Paris Saint-Germain',country:'France',name:'Germain',animal:'lynx',animalLabel:'Lynx',color:0xd8b776,accent:0x72583d,kitColor:0x294d77,
  story:'Germain the lynx is part of the experience for young Paris Saint-Germain supporters at the Junior Club. PSG describes this as a family stand with activities for children on matchdays, including a mini-football area, face painting and chances to meet the mascot. The character helps connect those activities with watching the team.\n\nThis offers a practical example of football culture beyond the result. A child can play, meet other supporters and recognize a familiar mascot during the same visit. Germain’s role shows how a club can make the stadium a welcoming place to begin learning about football and sharing it with family.',storyType:'history',
  source:'https://billetterie.psg.fr/fr/aide?question=qu-est-ce-que-le-junior-club-du-paris-saint-germain',
  question:'What does PSG’s Junior Club offer young supporters?',choices:['Permission to referee league matches','A place on the first-team bench','Football activities and mascot meetings'],answer:2,
  explanation:'The Junior Club combines watching PSG with activities for children. Football clubs can create shared experiences for families.'
 },
 {
  id:'flamengo',club:'Flamengo',country:'Brazil',name:'Urubu',animal:'vulture',animalLabel:'Vulture',color:0x444746,accent:0xcba274,kitColor:0xb54139,
  story:'Flamengo’s urubu, or vulture, tells a story about supporters changing the meaning of a symbol. During the 1960s, rivals used the name to insult Flamengo fans. The supporters embraced the bird instead, making it an expression of pride and belonging. The club’s own account describes that transformation from an intended put-down to a much-loved identity.\n\nFlamengo has also connected its vulture identity with activities supporting the preservation of the king vulture. The football lesson is about how fan culture develops: a nickname is not always chosen by a club’s founders or designers. Supporters can adopt it, reshape its meaning and pass it on as a shared tradition.',storyType:'history',
  source:'https://www.flamengo.com.br/noticias/novidades/flamengo-promove-acao-de-dia-das-criancas-no-riozoo-em-apoio-a-preservacao-do-urubu-rei',
  question:'How did Flamengo supporters change the meaning of the vulture?',choices:['They made an insult a symbol of pride','They removed all birds from the badge','They used it to change the offside rule'],answer:0,
  explanation:'Supporters embraced the urubu. Football communities can reshape the meaning of a nickname or symbol.'
 },
 {
  id:'palmeiras',club:'Palmeiras',country:'Brazil',name:'Gobbato',animal:'pig',animalLabel:'Pig',color:0xa8b880,accent:0xe0c49d,kitColor:0x39765a,
  story:'Gobbato became an official Palmeiras mascot in 2016, but the pig already had decades of support in the stands. The club describes thirty years of affection from fans before that official recognition. Gobbato did not replace the existing parakeet: the two mascots became companions at Palmeiras games, giving supporters more than one character associated with the club.\n\nThis separates a supporters’ symbol from the date a club officially adopts it. Football traditions often develop in the crowd before becoming part of formal club identity. Palmeiras also shows why a mascot list can contain several animals: different characters may represent different layers of the same club’s history.',storyType:'history',
  source:'https://www.palmeiras.com.br/mascotes/',
  question:'What happened when Gobbato became official?',choices:['Palmeiras stopped using green','He joined the existing parakeet mascot','The club changed sports'],answer:1,
  explanation:'Gobbato joined the parakeet rather than replacing it. A club can have several mascots connected to different parts of its history.'
 },
 {
  id:'atletico-mineiro',club:'Atlético Mineiro',country:'Brazil',name:'Galo Doido',animal:'rooster',animalLabel:'Rooster',color:0x41433e,accent:0xc6453c,kitColor:0xe2dfcf,
  story:'In 1945, cartoonist Fernando Pieruccetti, also known as Mangabeira, drew a rooster to represent Atlético Mineiro. The club explains that he associated the animal with the team’s determined playing style and refusal to give up. Player Zé do Monte later helped popularize the Galo, including appearances with a real rooster during the 1950s.\n\nThe modern character Galo Doido is part of that longer story. Atlético says supporters gave the name to the superhero-style version introduced in 2005. A newspaper drawing, a player’s actions and a fan-chosen name all helped build the identity. It is an example of football culture being created by several generations, rather than by one announcement.',storyType:'history',
  source:'https://atletico.com.br/institucional/identidade/simbolos-e-marcas/',
  question:'What did the rooster represent in the cartoonist’s design?',choices:['The color of the stadium seats','A rule about corner kicks','The team’s determination'],answer:2,
  explanation:'Pieruccetti associated the rooster with a team that did not give up. Mascots can express the qualities supporters admire in players.'
 },
 {
  id:'santos',club:'Santos',country:'Brazil',name:'Baleia',animal:'orca',animalLabel:'Orca',color:0x363d40,accent:0xf0e8d5,kitColor:0xd8d9d1,
  story:'Santos has a useful identity puzzle: its nickname is Peixe, meaning fish, while its official mascot is Baleia, meaning whale. The club’s historian notes that the mascot is actually depicted as an orca. Newspaper illustrations helped develop these watery associations, with the whale image appearing in the work of cartoonist Messias de Melo in the 1950s.\n\nThe club openly distinguishes the nickname from the mascot, rather than treating them as identical. Both fit the coastal setting associated with Santos. When exploring football culture, separate a club’s name, nickname, badge and mascot: they can share a theme while each carrying a different part of the story.',storyType:'history',
  source:'https://www.santosfc.com.br/memoria-santos-fc-realizava-a-primeira-partida-no-regime-profissional-no-brasil/',
  question:'What is unusual about Santos’s nickname and mascot?',choices:['The nickname means fish, but the mascot is a whale','Both are names of stadiums','Neither has a link with water'],answer:0,
  explanation:'Peixe is the nickname and Baleia is the mascot. A club’s nickname and mascot do not have to be exactly the same.'
 },
 {
  id:'botafogo',club:'Botafogo',country:'Brazil',name:'Biriba',animal:'dog',animalLabel:'Dog',color:0xe6dec9,accent:0x464a43,kitColor:0x3a4141,
  story:'Biriba honors a real dog linked to Botafogo’s 1948 Rio championship. President Carlito Rocha associated the animal with the team’s good fortune, and the memory became part of the club’s folklore. Botafogo’s official mascot family still includes Biriba, presenting him as a playful character that carries this connection to an earlier title-winning team.\n\nThis is a story about how supporters remember a season. A mascot can become a shortcut to memories of players, celebrations and the people around the club. The good-luck belief belongs to that folklore; it does not explain how matches are won. Training, decisions and teamwork remain the football skills that produce performances.',storyType:'history',
  source:'https://www.botafogo.com.br/mascotes',
  question:'What inspired Biriba’s place in Botafogo culture?',choices:['A new type of football boot','A real dog linked to a championship campaign','A drawing of the referee'],answer:1,
  explanation:'The mascot honors a real dog remembered alongside the 1948 title. That is club folklore, not evidence that luck replaces football skill.'
 },
 {
  id:'river-plate',club:'River Plate',country:'Argentina',name:'Caloi’s Lion',animal:'lion',animalLabel:'Lion',color:0xd6a550,accent:0x9c5d38,kitColor:0xe4dfcd,
  story:'River Plate’s official timeline records the introduction of Caloi’s lion on the team’s shirt in 1985. The drawing is strongly associated with the following year, when River won its first Copa Libertadores and then became world champion in Japan. The lion occupied the badge’s place on a shirt worn during that memorable period of the club’s history.\n\nThis costume represents a historic shirt symbol. It does not identify the lion as River’s current official mascot. That distinction matters when learning about football: an image can remain meaningful to supporters because of the team and victories they associate with it, even after the club moves to a different design.',storyType:'historic-symbol',
  source:'https://www.cariverplate.com.ar/club/institucional/historia',
  question:'How should we describe Caloi’s lion here?',choices:['A current league referee badge','The name of River’s stadium','A historic River Plate shirt symbol'],answer:2,
  explanation:'The lion belongs to River’s shirt history. A historic emblem and a current official mascot are different things.'
 },
 {
  id:'pumas',club:'Pumas UNAM',country:'Mexico',name:'Goyo',animal:'puma',animalLabel:'Puma',color:0xc6ac75,accent:0xe6d9b4,kitColor:0x344f75,
  story:'Pumas began looking for a mascot in the early 1990s that could encourage adult supporters and connect especially with children. The club’s account explains that some early designs looked too much like domestic pets, while others seemed too aggressive and lacked the warmth they wanted. Goyo became the friendly character associated with that search.\n\nThe design problem reveals an important part of football culture: a mascot needs to represent the team while making people feel welcome. Looking fierce is not its only job. For a university club such as Pumas, Goyo provides a recognizable meeting point between the football team, families and younger supporters discovering the game.',storyType:'history',
  source:'https://pumas.mx/goyo',
  question:'Why did Pumas want a mascot like Goyo?',choices:['To connect with supporters, especially children','To replace the coaching team','To decide disputed goals'],answer:0,
  explanation:'The club describes Goyo as a way to connect with its supporters. Mascots build community around the football team.'
 },
 {
  id:'kashima',club:'Kashima Antlers',country:'Japan',name:'Shikao',animal:'deer',animalLabel:'Deer',color:0xae7950,accent:0xe6c394,kitColor:0x9d394b,
  story:'Shikao is Kashima Antlers’ deer mascot. J.League’s official profile connects the character with the deer of Kashima Shrine, giving the animal choice a specific local reference. The same profile describes a mascot family that includes Shikako and their son Anton. Those family details belong to the characters’ fictional biography; the connection to the shrine explains the local identity behind them.\n\nFor a new football supporter, this is a way to learn about the place a club represents. Rather than stopping at “a team with a deer,” follow the connection to the town’s heritage. Mascots can introduce local culture alongside players, stadiums and results.',storyType:'history',
  source:'https://www.jleague.jp/special/mascot/2021/profile/kashima.html',
  question:'Which local connection does Shikao represent?',choices:['A desert racing circuit','The deer of Kashima Shrine','An overseas baseball stadium'],answer:1,
  explanation:'J.League connects Shikao to Kashima Shrine’s deer. Football identities often reflect their hometown’s culture.'
 },
 {
  id:'cerezo',club:'Cerezo Osaka',country:'Japan',name:'Lobby',animal:'wolf',animalLabel:'Wolf',color:0x919595,accent:0xe2d7c6,kitColor:0xd5799b,
  story:'Cerezo Osaka’s wolf mascot is called Lobby. J.League describes the character through intelligence, agility and the cooperation of wolves acting in a group. Its profile also notes that Lobby’s mother, Madame Lobina, joined the mascot cast in October 2008. The family is character fiction; the qualities chosen for the wolf explain the intended identity.\n\nThose qualities suggest a football lesson. Agility helps a player move into space, intelligence helps them decide when to pass, and cooperation helps teammates support one another. On the pitch, watch how a supporting run gives the player with the ball another option. A coordinated team can achieve more than players making isolated decisions.',storyType:'history',
  source:'https://www.jleague.jp/sp/mascot/2021/profile/cosaka.html',
  question:'Which football idea fits Lobby’s group-cooperation theme?',choices:['Every player acting alone','Ignoring teammates’ movement','Working together as a team'],answer:2,
  explanation:'The wolf’s cooperation theme connects naturally to football teamwork. Coordinated players can support one another in attack and defense.'
 },
 {
  id:'nagoya',club:'Nagoya Grampus',country:'Japan',name:'Grampus-kun',animal:'orca',animalLabel:'Orca',color:0x33393b,accent:0xf1e3c9,kitColor:0xc67543,
  story:'Nagoya Grampus gives its orca mascot Grampus-kun a deliberately playful biography. According to the club’s character profile, he has spent so much time on land that he has forgotten how to swim and is uncomfortable in water. The mascot family also includes Grampako-chan and two children, giving supporters a cast of related characters to recognize.\n\nThese are fictional personalities written for a football club, not facts about real orcas. Their purpose is to make the characters memorable and create shared jokes and stories for supporters. Learning club culture includes recognizing this difference: a mascot can have an imaginary life while its appearances and role in the community are real.',storyType:'club-fiction',
  source:'https://nagoya-grampus.jp/fan/mascot/',
  question:'How should we read Grampus-kun’s forgotten-swimming story?',choices:['As playful club fiction','As a fact about every orca','As an official football rule'],answer:0,
  explanation:'It is a fictional mascot biography. Enjoying a club’s character story does not mean treating it as animal science.'
 },
 {
  id:'sutton',club:'Sutton United',country:'England',name:'Jenny',animal:'giraffe',animalLabel:'Giraffe',color:0xd9b467,accent:0x94633b,kitColor:0xbb8b39,
  story:'Jenny the giraffe is part of Sutton United’s work with children and families. The club offers visits to schools, nurseries, community events and football festivals, alongside birthday and charity appearances. These visits give young people a friendly way to meet someone representing the club, including those whose first connection to Sutton happens away from the stadium.\n\nSutton also offers matchday experiences in which children can meet players and walk out with the team. Together, these activities show how football clubs build relationships around a match. Jenny gives that local connection a friendly face, helping young supporters feel that the club belongs to their community as well as to the players.',storyType:'history',
  source:'https://www.suttonunited.net/book-your-experience/',
  question:'What does Jenny help Sutton United create?',choices:['New rules for penalty kicks','Welcoming experiences for children and families','Automatic league points'],answer:1,
  explanation:'Jenny helps families connect with Sutton United. Football culture includes the people and experiences around the match.'
 }
];

export function getCostume(id:string|null|undefined):ClubCostume|undefined{return CLUB_COSTUMES.find(costume=>costume.id===id);}
