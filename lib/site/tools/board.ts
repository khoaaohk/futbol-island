import type {Faq} from '../safety';
/**
 * The tactics board's front door (Nov 22 2026; owner: "the Coaches Board must be part of the coach tools"). The board itself is the
 * game's Coaches Board (components/coaches-board/TacticsBoard.tsx), now also full screen on the web at /board. Words for the English
 * page (app/(site)/tools/soccer-tactics-board) and its Spanish twin (components/es/pages/ToolsEs.tsx). Facts come from the board's
 * own code (lib/coaches/board/types.ts: futsal, 7v7, 9v9 and 11v11; pass, run and dribble arrows; up to 12 steps; a marker and
 * zones; full, half and box views; share links in lib/coaches/board/share.ts; plays saved in lib/coaches/board/storage.ts).
 */
export const BOARD_PATH='/tools/soccer-tactics-board';
export const BOARD_APP_PATH='/board';
export type BoardPage={crumb:string;title:string;h1:string;description:string;lead:string;blurb:string;openLabel:string;openLine:string;
 whatTitle:string;what:readonly string[];howTitle:string;how:readonly string[];featuresTitle:string;features:readonly string[];usesTitle:string;uses:readonly string[];
 faqTitle:string;faq:readonly Faq[];relatedTitle:string;appFeatures:readonly string[]};
export const BOARD_EN:BoardPage={crumb:'Tactics board',title:'Soccer Tactics Board: Free Online Football Board',h1:'Soccer tactics board',
 description:'A free online soccer tactics board: drag players, draw passes, runs and dribbles, play a move step by step, then share it with a link. No sign-up.',
 lead:'A free soccer tactics board that works in the browser on a phone, tablet or computer. Put players on a 7v7, 9v9, 11v11 or futsal field, draw passes, runs and dribbles, play the move step by step, and send it to your team as a link.',
 blurb:'Draw a play, run it step by step and share it with a link',
 openLabel:'Open the board',openLine:'Full screen, free, no account. Your plays stay on this device.',
 whatTitle:'What the board does',
 what:['A tactics board is how coaches show a move before the players try it: where each player starts, where the ball goes and who runs into the space. Children aged 7 to 12 understand a move much faster when they see it play out than when they hear it described.',
  'This is the same board coaches use inside the Futbol Island game, now on its own page so you can open it at practice or on the sofa the night before a game. Soccer is called football in most of the world; the board works for both, with no account and no adverts.'],
 howTitle:'How to draw a play',
 how:['Choose the game (7v7, 9v9, 11v11 or futsal) and a starting formation. The players appear on the right field.',
  'Drag a player or the ball to where the move starts. Tap a player to give them a number or letter.',
  'Pick an arrow: a pass, a run or a dribble, and draw it from the player. Use the marker to circle a space or shade a zone.',
  'Add a step and move the players to where they end up. A move can have up to 12 steps.',
  'Press play: the players and the ball move from step to step. Slow it down, loop it or show the trails.',
  'Save the play on this device, or share it: the link carries the whole play, so anyone who opens it sees the same move.'],
 featuresTitle:'What is on the board',
 features:['Fields for futsal, 7v7, 9v9 and 11v11, each with its own markings, in full, half or penalty-box view.',
  'Home and away players, a goalkeeper for each side and the ball, with numbers or letters on the players.',
  'Three arrows that children learn to read: a pass, a run without the ball and a dribble.',
  'A marker for lines and shaded zones, in four colors.',
  'Steps and playback, with slow motion, loop and trails, so a move plays out like a short film.',
  'Example plays to start from: a give-and-go, an overlap down the wing, pressing a goal kick and a near-post corner.',
  'Undo and redo, saved plays on the device and share links. Nothing is uploaded: the play travels inside the link.'],
 usesTitle:'Ways coaches use it',
 uses:['Before practice: draw the one move the session is about, then show it on a phone to the group before the first drill.',
  'In the team chat: send the link the night before a game so players see where they start at a goal kick or a corner.',
  'At half-time: show one change, such as where the wide players should be when the goalkeeper has the ball.',
  'With older players: ask them to draw what they saw in a game and talk it through together.'],
 faqTitle:'Questions about the tactics board',
 faq:[{q:'Is this soccer tactics board free?',a:'Yes. It is free with no account, no trial and no adverts. You can draw, save and share as many plays as you like.'},
  {q:'Can I use the football tactics board online on a phone?',a:'Yes. It opens full screen in the phone’s browser and is made for one finger: drag players, tap to pick a tool, draw arrows with your finger. It also works on tablets and computers.'},
  {q:'Is there a tactics board app to install?',a:'You do not need to install anything. Open the board and add it to your home screen if you want it one tap away; it then opens like an app.'},
  {q:'How do I share a play with my team?',a:'Open Share and copy the link, or send it from the share menu. The whole play is inside the link, so it opens on any phone without an account. Use numbers or first names only for children.'},
  {q:'Which formats does the board have?',a:'Futsal, 7v7, 9v9 and 11v11, each with a real field and starting formations for that game. Futsal is the five-a-side indoor game.'}],
 relatedTitle:'Formations, positions and more tools',
 appFeatures:['Fields for futsal, 7v7, 9v9 and 11v11','Pass, run and dribble arrows','Marker lines and zones','Steps with playback, slow motion and loop','Example plays','Share a play by link','No account; plays stay on the device']};
export const BOARD_ES:BoardPage={crumb:'Pizarra táctica',title:'Pizarra táctica de fútbol gratis en línea',h1:'Pizarra táctica de fútbol',
 description:'Una pizarra táctica de fútbol gratis en línea: arrastra jugadores, dibuja pases, desmarques y conducciones, reproduce la jugada paso a paso y compártela.',
 lead:'Una pizarra táctica de fútbol gratis que funciona en el navegador del teléfono, la tableta o la computadora. Pon a los jugadores en una cancha de 7v7, 9v9, 11v11 o futsal, dibuja pases, desmarques y conducciones, reproduce la jugada paso a paso y mándala a tu equipo con un enlace.',
 blurb:'Dibuja una jugada, reprodúcela paso a paso y compártela con un enlace',
 openLabel:'Abrir la pizarra',openLine:'Pantalla completa, gratis, sin cuenta. Tus jugadas se quedan en este dispositivo.',
 whatTitle:'Qué hace la pizarra',
 what:['Con una pizarra táctica el entrenador muestra una jugada antes de que los jugadores la prueben: dónde empieza cada uno, adónde va el balón y quién corre al espacio. Los niños de 7 a 12 años entienden una jugada mucho más rápido cuando la ven moverse que cuando la escuchan.',
  'Es la misma pizarra que usan los entrenadores dentro del juego Futbol Island, ahora en su propia página para abrirla en la práctica o en casa la noche antes del partido. Funciona sin cuenta y sin anuncios.'],
 howTitle:'Cómo dibujar una jugada',
 how:['Elige la modalidad (7v7, 9v9, 11v11 o futsal) y una formación inicial. Los jugadores aparecen en la cancha correcta.',
  'Arrastra a un jugador o el balón hasta donde empieza la jugada. Toca a un jugador para ponerle un número o una letra.',
  'Elige una flecha: un pase, un desmarque o una conducción, y dibújala desde el jugador. Usa el marcador para rodear un espacio o sombrear una zona.',
  'Agrega un paso y mueve a los jugadores adonde terminan. Una jugada puede tener hasta 12 pasos.',
  'Presiona reproducir: los jugadores y el balón se mueven de paso en paso. Hazlo más lento, en bucle o con estelas.',
  'Guarda la jugada en este dispositivo o compártela: el enlace lleva la jugada entera, así que quien lo abra ve lo mismo.'],
 featuresTitle:'Qué hay en la pizarra',
 features:['Canchas de futsal, 7v7, 9v9 y 11v11, cada una con sus líneas, en vista completa, media cancha o área.',
  'Jugadores locales y visitantes, un portero por equipo y el balón, con números o letras.',
  'Tres flechas que los niños aprenden a leer: pase, desmarque sin balón y conducción.',
  'Un marcador para líneas y zonas sombreadas, en cuatro colores.',
  'Pasos y reproducción, con cámara lenta, bucle y estelas, para que la jugada se vea como una película corta.',
  'Jugadas de ejemplo para empezar: una pared, un traslape por la banda, presionar un saque de meta y un córner al primer palo.',
  'Deshacer y rehacer, jugadas guardadas en el dispositivo y enlaces para compartir. No se sube nada: la jugada va dentro del enlace.'],
 usesTitle:'Cómo la usan los entrenadores',
 uses:['Antes de la práctica: dibuja la jugada de la sesión y muéstrala en el teléfono al grupo antes del primer ejercicio.',
  'En el chat del equipo: manda el enlace la noche antes del partido para que vean dónde empiezan en un saque de meta o un córner.',
  'En el medio tiempo: muestra un solo cambio, como dónde deben estar los extremos cuando el portero tiene el balón.',
  'Con jugadores mayores: pídeles que dibujen lo que vieron en un partido y coméntenlo juntos.'],
 faqTitle:'Preguntas sobre la pizarra táctica',
 faq:[{q:'¿Esta pizarra táctica de fútbol es gratis?',a:'Sí. Es gratis, sin cuenta, sin prueba y sin anuncios. Puedes dibujar, guardar y compartir todas las jugadas que quieras.'},
  {q:'¿Puedo usar la pizarra táctica en línea en el teléfono?',a:'Sí. Se abre a pantalla completa en el navegador del teléfono y está hecha para un dedo: arrastra jugadores, toca para elegir una herramienta y dibuja flechas con el dedo. También funciona en tabletas y computadoras.'},
  {q:'¿Hay que instalar una app de pizarra táctica?',a:'No hace falta instalar nada. Abre la pizarra y agrégala a la pantalla de inicio si la quieres a un toque; entonces se abre como una app.'},
  {q:'¿Cómo comparto una jugada con mi equipo?',a:'Abre Compartir y copia el enlace, o mándalo desde el menú de compartir. La jugada entera va dentro del enlace, así que se abre en cualquier teléfono sin cuenta. Con niños, usa solo números o nombres de pila.'},
  {q:'¿Qué modalidades tiene la pizarra?',a:'Futsal, 7v7, 9v9 y 11v11, cada una con su cancha y formaciones iniciales de esa modalidad. El futsal es el fútbol sala de cinco.'}],
 relatedTitle:'Formaciones, posiciones y más herramientas',
 appFeatures:['Canchas de futsal, 7v7, 9v9 y 11v11','Flechas de pase, desmarque y conducción','Marcador de líneas y zonas','Pasos con reproducción, cámara lenta y bucle','Jugadas de ejemplo','Compartir una jugada por enlace','Sin cuenta; las jugadas se quedan en el dispositivo']};
/** The related links, English paths (the Spanish page maps them with toEs where a twin exists). */
export const BOARD_RELATED:readonly {path:string;name:string;line:string}[]=[
 {path:'/learn/soccer-formations',name:'Soccer formations explained',line:'Every formation for 7v7, 9v9, 11v11 and futsal, with a diagram'},
 {path:'/learn/soccer-positions',name:'Soccer positions explained',line:'What each position does, and the numbers 1 to 11'},
 {path:'/learn/soccer-drills',name:'Soccer drills for kids',line:'Drills with a diagram to practice the move you drew'},
 {path:'/tools/soccer-lineup-builder',name:'Soccer lineup builder',line:'Names on a field diagram for game day'},
 {path:'/tools/soccer-field-diagrams',name:'Blank soccer field diagrams',line:'Print a field to draw plays on paper'},
 {path:'/tools/soccer-scanning-trainer',name:'Soccer scanning trainer',line:'Players learn to look over the shoulder'}];
