/**
 * The Spanish glossary (Spanish round 1, Nov 15 2026; owner decisions in docs/i18n/HANDOFF.md). Every Spanish page under /es uses
 * these words and no others for the same idea. Register: US Latino neutral Spanish, "tú" (never "usted", never "vosotros"),
 * short sentences for kids 7 to 12 and their parents and coaches. English stays the source of truth: a Spanish page says exactly
 * what its English page says (rules per the IFAB Laws of the Game), never more.
 *
 * CHOICES (and why):
 *  - "fútbol" for soccer AND football. The English pages say "soccer is called football in most of the world"; in Spanish both
 *    are "fútbol", so that line becomes "El fútbol (soccer en Estados Unidos)…" once near the top, never repeated.
 *  - "regate" / "regatear" for dribble (not "gambeta"): "gambeta" is Rioplatense and reads as a trick; "regate" is understood
 *    across Mexico, Central America, the Caribbean and the US. "Conducir el balón" for running with the ball.
 *  - "balón" for the ball in rules and coaching ("pelota" is fine in a kid's quote, but pages use "balón").
 *  - "penal" (US Latino, Mexico) for penalty kick; "área penal" / "área grande" for the penalty area. "Penalti" is never used.
 *  - "cancha" for the field (US Latino usage; "campo" only in "campo contrario" = the other team's half). Futsal: "cancha de futsal".
 *  - "entrenador" / "entrenadora" for coach (the page says "el entrenador" generically). "Equipo" for team.
 *  - Age groups stay "U8", "U10", "U12" (how US leagues write them, also in Spanish-language league flyers), explained once as
 *    "U10 (menores de 10 años)". Formats stay "7v7", "9v9", "11v11" (league usage), read as "siete contra siete".
 *  - Team-sheet letters on position pages: Spanish broadcast letters (POR, DFC, LD/LI, MCD, MC, MCO, ED/EI, DC).
 *  - Numbers and units: yards first, as on the English pages ("2 yardas (2 m)").
 *  - Quotes: Spanish pages use the English pages' curly quotes “…” (not «…»), the US Spanish norm.
 * NEVER: "usted", "vosotros", "soccer" as the only name (allowed once, in brackets), "penalti", "portería" (use "arco"), "chut".
 */
export const ES_GLOSSARY={
 // the game
 'soccer / football':'fútbol','futsal':'futsal','ball':'balón','field / pitch':'cancha','court (futsal)':'cancha de futsal',
 'goal (the frame)':'arco','goal (a score)':'gol','goal line':'línea de meta','touchline / sideline':'línea de banda',
 'halfway line':'línea media','center circle':'círculo central','penalty area':'área penal','goal area':'área chica',
 'penalty mark':'punto penal','corner arc':'arco de esquina','build-out line':'línea de salida (build-out line)',
 'half (of the field)':'mitad de la cancha','the other team’s half':'campo contrario','match / game':'partido','half (of time)':'tiempo',
 'kick-off':'saque inicial','referee':'árbitro','assistant referee':'árbitro asistente','Laws of the Game':'Reglas de Juego (IFAB)',
 // restarts and rules
 'offside':'fuera de juego','offside position':'posición de fuera de juego','onside':'en posición correcta (habilitado)',
 'throw-in':'saque de banda','kick-in (futsal)':'saque de banda con el pie','goal kick':'saque de meta','corner kick':'saque de esquina',
 'free kick':'tiro libre','direct free kick':'tiro libre directo','indirect free kick':'tiro libre indirecto','penalty kick':'penal',
 'penalty shoot-out':'tanda de penales','dropped ball':'balón a tierra','advantage':'ventaja','foul':'falta','handball':'mano',
 'yellow card / caution':'tarjeta amarilla / amonestación','red card / sending-off':'tarjeta roja / expulsión','substitution':'cambio (sustitución)',
 'back-pass':'pase atrás al portero','wall':'barrera','extra time':'tiempo extra','stoppage time':'tiempo añadido',
 'heading':'cabecear (cabezazo)','offence':'infracción',
 // positions
 'goalkeeper / keeper':'portero','defender':'defensa','center back':'defensa central','fullback':'lateral','wingback':'carrilero',
 'sweeper':'líbero','midfielder':'mediocampista','defensive midfielder':'mediocampista defensivo','holding midfielder / holder':'mediocampista de contención','central midfielder':'mediocampista central',
 'attacking midfielder':'mediocampista ofensivo','winger':'extremo','striker / forward':'delantero','center forward':'delantero centro',
 'false nine':'falso nueve','pivot (futsal)':'pívot','fixo (futsal)':'cierre','ala (futsal)':'ala',
 // play
 'pass':'pase','through ball':'pase al hueco','give-and-go / one-two':'pared','dribble':'regate (regatear)','first touch':'primer toque',
 'shot':'tiro','cross':'centro','cutback':'centro atrás','tackle':'entrada','marking':'marca','pressing':'presión','support':'apoyo','space':'espacio',
 'formation':'formación (sistema)','team shape':'forma del equipo','counterattack':'contraataque','possession':'posesión',
 'scan / check the shoulder':'mirar por encima del hombro','overlap':'desdoble','switch of play':'cambio de juego',
 'teammate':'compañero (compañera)','opponent':'rival','coach':'entrenador','practice':'entrenamiento (práctica)','drill':'ejercicio',
 'practice plan':'plan de entrenamiento','warm-up':'calentamiento','scrimmage':'partidito',
 // site
 'Play free':'Juega gratis','Play it on the island':'Juega esto en la isla','Learn it on the island':'Apréndelo en la isla',
 'Read next':'Lee después','Previous':'Anterior','Back to':'Volver a','Last checked':'Última revisión','How we check facts':'Cómo revisamos los datos',
 'Coach’s notes':'Notas del entrenador','Coaching point':'Punto clave','In a match':'En un partido','By age group':'Por edad',
 'Common mistakes':'Errores comunes','Common mix-ups':'Confusiones comunes','Quick quiz':'Prueba rápida','Lessons':'Lecciones',
 'Home':'Inicio','Print / Save as PDF':'Imprimir / Guardar como PDF','Keep reading':'Sigue leyendo',
} as const;
/** Words a Spanish page must never contain (tests/es-pages.cjs): the wrong register or the wrong regional word. */
export const ES_BANNED=[/\busted\b/i,/\bvosotros\b/i,/\bpenalti\b/i,/\bporter[ií]a\b/i,/\bgambeta\b/i,/\bchut\b/i] as const;
