import type {AppLang} from '../i18n/appLangs';
import type {AgeId,ColourId,Dir,Mode,SessionLen,Sound} from './engine';
/**
 * Scan Trainer's words (Nov 16 2026). Spanish follows lib/i18n/es-glossary.ts: US Latino, "tú", "mirar por encima del hombro"
 * for scanning, "compañero" for teammate, "entrenador" for coach, "cancha" for the field. tests/scan-trainer.cjs checks both
 * languages have the same keys and no banned words.
 */
export type Words={app:string;tagline:string;age:string;ages:Record<AgeId,string>;show:string;modes:Record<Mode,string>;modeLines:Record<Mode,string>;
 every:string;sec:(n:number)=>string;slower:string;faster:string;session:string;sessions:Record<SessionLen,string>;colours:string;coloursNote:string;colourNames:Record<ColourId,string>;
 numbers:string;arrows:string;arrowsNote:string;dirNames:Record<Dir,string>;teammates:string;teammatesNote:string;screen:string;bg:string;bgLine:string;names:string;namesLine:string;
 sound:string;sounds:Record<Sound,string>;score:string;scoreLine:string;on:string;off:string;start:string;place:string;
 lastBest:(last:string,best:string)=>string;ofN:(hit:number,total:number)=>string;getReady:string;tapPause:string;left:(t:string)=>string;endless:string;
 paused:string;resume:string;end:string;right:string;wrong:string;passTo:(n:number)=>string;done:string;cuesShown:string;time:string;scoreHead:string;newBest:string;toBeat:(s:string)=>string;
 goAgain:string;change:string;noScore:string;wake:string;offline:string;guide:string;preview:string;pausedHint:string;settings:string;doneBtn:string;
 tipHead:string;tips:Record<Mode,string>;bestHead:string;
 /* round 4E (Nov 22 2026) */any:string;langLabel:string};
const EN:Words={app:'Scan Trainer',tagline:'Look over the shoulder. Call it. Play.',age:'Age group',
 ages:{u8:'U8',u10:'U10',u12:'U12',u14:'U14+',adult:'Adult'},show:'Show',
 modes:{colours:'Colors',numbers:'Numbers',arrows:'Arrows',mix:'Mix',pass:'Pass it'},
 modeLines:{colours:'Call the color, or run to that cone.',numbers:'Call the number out loud.',arrows:'Turn or play the way the arrow points.',mix:'Colors, numbers and arrows, mixed.',
  pass:'A teammate’s number and where they are: pass to them.'},
 every:'Change every',sec:n=>`${n.toFixed(1).replace(/\.0$/,'')} s`,slower:'Slower',faster:'Faster',session:'Session',sessions:{60:'60 s',90:'90 s',180:'3 min',0:'Endless'},
 colours:'Your cones',coloursNote:'Pick the colors you have. Two at least.',
 colourNames:{red:'Red',orange:'Orange',yellow:'Yellow',green:'Green',blue:'Blue',purple:'Purple',pink:'Pink',white:'White',black:'Black'},
 numbers:'Numbers',arrows:'Arrows',arrowsNote:'Tap the directions to use. Two at least.',
 dirNames:{up:'Forward',upRight:'Forward right',right:'Right',downRight:'Back right',down:'Back',downLeft:'Back left',left:'Left',upLeft:'Forward left'},
 teammates:'Teammates',teammatesNote:'Number the support players 1 to',screen:'Screen',bg:'Color fills the screen',bgLine:'Off: a colored disc on black.',
 names:'Write the color name',namesLine:'Helps players who see colors differently.',sound:'Sound on change',sounds:{off:'Off',tick:'Tick',pop:'Pop',bell:'Bell'},
 score:'Coach keeps score',scoreLine:'Tap ✓ or ✗ after each call. Kept on this phone only.',on:'On',off:'Off',start:'Start',
 place:'Prop the phone on a cone 5 to 10 yards behind the player, screen bright, facing the field.',
 lastBest:(l,b)=>`Last ${l} · Best ${b}`,ofN:(h,t)=>`${h} of ${t}`,getReady:'Get ready',tapPause:'Tap to pause',left:t=>`${t} left`,endless:'Endless',
 paused:'Paused',resume:'Resume',end:'End session',right:'Right',wrong:'Missed',passTo:n=>`Pass to ${n}`,done:'Session done',cuesShown:'Cues shown',time:'Time',scoreHead:'Calls right',
 newBest:'New best on this phone',toBeat:s=>`To beat next time: ${s}`,goAgain:'Go again',change:'Change settings',noScore:'Turn on “Coach keeps score” to get a result to beat.',
 wake:'Keep the screen on in your phone’s settings: this browser cannot.',offline:'Works offline once opened. Nothing leaves this phone.',guide:'How to use it, and drills',
 preview:'Preview',pausedHint:'Tap anywhere on the cue to pause.',settings:'Settings',doneBtn:'Done',
 tipHead:'Coach’s tip',bestHead:'Best on this phone',any:'Any',langLabel:'Language',
 tips:{colours:'Look over your shoulder before the ball arrives, not after. Two quick looks beat one long stare.',numbers:'Call the number out loud. Saying it proves you saw it, and it builds the habit of talking to teammates.',arrows:'Open your hips toward the arrow as you look, so your first touch can go that way.',mix:'Glance, then decide. When the cue changes type, your eyes should already be up.',pass:'Know where your teammate is before the ball comes. Then the pass is one touch, not three.'}};
const ES:Words={app:'Entrenador de escaneo',tagline:'Mira por encima del hombro. Dilo. Juega.',age:'Edad',
 ages:{u8:'U8',u10:'U10',u12:'U12',u14:'U14+',adult:'Adultos'},show:'Mostrar',
 modes:{colours:'Colores',numbers:'Números',arrows:'Flechas',mix:'Mezcla',pass:'Pásala'},
 modeLines:{colours:'Di el color, o corre a ese cono.',numbers:'Di el número en voz alta.',arrows:'Gira o juega hacia donde apunta la flecha.',mix:'Colores, números y flechas, mezclados.',
  pass:'El número de un compañero y dónde está: pásale el balón.'},
 every:'Cambia cada',sec:n=>`${n.toFixed(1).replace(/\.0$/,'').replace('.',',')} s`,slower:'Más lento',faster:'Más rápido',session:'Sesión',sessions:{60:'60 s',90:'90 s',180:'3 min',0:'Sin fin'},
 colours:'Tus conos',coloursNote:'Elige los colores que tienes. Dos como mínimo.',
 colourNames:{red:'Rojo',orange:'Naranja',yellow:'Amarillo',green:'Verde',blue:'Azul',purple:'Morado',pink:'Rosa',white:'Blanco',black:'Negro'},
 numbers:'Números',arrows:'Flechas',arrowsNote:'Toca las direcciones que quieres usar. Dos como mínimo.',
 dirNames:{up:'Adelante',upRight:'Adelante a la derecha',right:'Derecha',downRight:'Atrás a la derecha',down:'Atrás',downLeft:'Atrás a la izquierda',left:'Izquierda',upLeft:'Adelante a la izquierda'},
 teammates:'Compañeros',teammatesNote:'Numera a los jugadores de apoyo del 1 al',screen:'Pantalla',bg:'El color llena la pantalla',bgLine:'Apagado: un círculo de color sobre negro.',
 names:'Escribir el nombre del color',namesLine:'Ayuda a los jugadores que ven los colores de otra manera.',sound:'Sonido al cambiar',sounds:{off:'Sin sonido',tick:'Tic',pop:'Pop',bell:'Campana'},
 score:'El entrenador lleva la cuenta',scoreLine:'Toca ✓ o ✗ después de cada respuesta. Se guarda solo en este teléfono.',on:'Sí',off:'No',start:'Empezar',
 place:'Apoya el teléfono en un cono a 5 o 10 yardas detrás del jugador, con la pantalla brillante, mirando a la cancha.',
 lastBest:(l,b)=>`Última ${l} · Mejor ${b}`,ofN:(h,t)=>`${h} de ${t}`,getReady:'Prepárate',tapPause:'Toca para pausar',left:t=>`Quedan ${t}`,endless:'Sin fin',
 paused:'En pausa',resume:'Seguir',end:'Terminar la sesión',right:'Bien',wrong:'Falló',passTo:n=>`Pásale al ${n}`,done:'Sesión terminada',cuesShown:'Señales mostradas',time:'Tiempo',scoreHead:'Respuestas bien',
 newBest:'Nueva mejor marca en este teléfono',toBeat:s=>`Para superar la próxima vez: ${s}`,goAgain:'Otra vez',change:'Cambiar ajustes',noScore:'Activa “El entrenador lleva la cuenta” para tener una marca que superar.',
 wake:'Deja la pantalla encendida en los ajustes del teléfono: este navegador no puede.',offline:'Funciona sin conexión una vez abierto. Nada sale de este teléfono.',guide:'Cómo usarlo y ejercicios',
 preview:'Vista previa',pausedHint:'Toca la señal en cualquier parte para pausar.',settings:'Ajustes',doneBtn:'Listo',
 tipHead:'Consejo del entrenador',bestHead:'Mejor marca en este teléfono',any:'Todas',langLabel:'Idioma',
 tips:{colours:'Mira por encima del hombro antes de que llegue el balón, no después. Dos miradas rápidas valen más que una larga.',numbers:'Di el número en voz alta. Decirlo demuestra que lo viste y crea el hábito de hablar con tus compañeros.',arrows:'Abre la cadera hacia la flecha mientras miras, así tu primer toque puede ir hacia allá.',mix:'Mira y luego decide. Cuando cambia el tipo de señal, tus ojos ya deben estar arriba.',pass:'Sabe dónde está tu compañero antes de que llegue el balón. Así el pase es de un toque, no de tres.'}};
import {pt} from './lang/pt';
import {fr} from './lang/fr';
import {de} from './lang/de';
import {it} from './lang/it';
import {nl} from './lang/nl';
import {pl} from './lang/pl';
import {fi} from './lang/fi';
import {ja} from './lang/ja';
/** round 4E: ten languages; each file is typed `Words`, so a missing key is a tsc error */
export const WORDS:Readonly<Record<AppLang,Words>>={en:EN,es:ES,pt,fr,de,it,nl,pl,fi,ja};
