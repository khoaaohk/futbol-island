/**
 * The tactics board's words in the ten app languages (round 4G, audit B4). components/coaches-board/TacticsBoard.tsx is shared with
 * the game: it takes these as an optional `words` prop and falls back to BOARD_EN, so the game (which passes nothing) is unchanged.
 * /board passes the coach app's language. Every language is typed `BoardWords` (the English object's type), so a missing or extra
 * key is a tsc error; tests/coaches-board.cjs checks the same at run time.
 */
import type {AppLang} from '../../i18n/appLangs';
export const BOARD_EN={
 myPlay:'My play',save:'Save',select:'Select',selectLong:'Select and move: drag a counter, tap to edit it, draw round several',
 add:'Add',addLong:'Add players and the ball',home:'Home',away:'Away',ball:'Ball',keeper:'Keeper',
 homeLong:'Home player: tap the pitch to place one, or drag it on',awayLong:'Away player: tap the pitch to place one, or drag it on',
 arrow:'Arrow',arrowLong:'Arrows: passes, runs and dribbles',marker:'Marker',markerLong:'Marker: notes and zones',eraser:'Eraser',
 several:'Several',selectSeveral:'Select several',more:'More',moreLong:'More: shapes, playback, share',shapes:'Shapes',teamShapes:'Team shapes',
 playback:'Playback',playbackView:'Playback and view',share:'Share',shareLong:'Share or save a picture',shareThis:'Share this play',plays:'Plays',
 step:'Step',stepN:(n:number)=>`Step ${n}`,addStep:'Add step',undo:'Undo',redo:'Redo',del:'Delete',done:'Done',close:'Close',
 line:'Line',zone:'Zone',note:'Marker note',eraseHint:'Tap or rub out arrows and notes.',clearStep:'Clear this step',
 severalHint:'Tap counters to pick them, then drag one to move them all.',nSelected:(n:number)=>`${n} selected`,
 whole:'Whole',half:'Half',box:'Box',fit:'Fit',pitch:'Pitch',speed:'Speed',pass:'Pass',run:'Run',dribble:'Dribble',
 moveEarlier:'Move step earlier',moveLater:'Move step later',deleteStep:'Delete step',deleteSel:'Delete selected',clearSel:'Clear selection',
 straighten:'Straighten',deleteArrow:'Delete arrow',playSteps:'Play the steps',pause:'Pause',hide:'Hide',tools:'Tools',
};
export type BoardWords=typeof BOARD_EN;
const es:BoardWords={
 myPlay:'Mi jugada',save:'Guardar',select:'Elegir',selectLong:'Elegir y mover: arrastra una ficha, tócala para editarla, rodea varias',
 add:'Agregar',addLong:'Agregar jugadores y el balón',home:'Local',away:'Visita',ball:'Balón',keeper:'Portero',
 homeLong:'Jugador local: toca la cancha para ponerlo, o arrástralo',awayLong:'Jugador visitante: toca la cancha para ponerlo, o arrástralo',
 arrow:'Flecha',arrowLong:'Flechas: pases, carreras y conducciones',marker:'Marcador',markerLong:'Marcador: notas y zonas',eraser:'Borrador',
 several:'Varias',selectSeveral:'Elegir varias',more:'Más',moreLong:'Más: formaciones, reproducción, compartir',shapes:'Formaciones',teamShapes:'Formaciones',
 playback:'Reproducir',playbackView:'Reproducción y vista',share:'Compartir',shareLong:'Compartir o guardar una imagen',shareThis:'Compartir esta jugada',plays:'Jugadas',
 step:'Paso',stepN:(n:number)=>`Paso ${n}`,addStep:'Agregar paso',undo:'Deshacer',redo:'Rehacer',del:'Borrar',done:'Listo',close:'Cerrar',
 line:'Línea',zone:'Zona',note:'Nota',eraseHint:'Toca o frota flechas y notas para borrarlas.',clearStep:'Limpiar este paso',
 severalHint:'Toca fichas para elegirlas y arrastra una para mover todas.',nSelected:(n:number)=>`${n} elegidas`,
 whole:'Toda',half:'Mitad',box:'Área',fit:'Ajustar',pitch:'Cancha',speed:'Velocidad',pass:'Pase',run:'Carrera',dribble:'Conducción',
 moveEarlier:'Mover el paso antes',moveLater:'Mover el paso después',deleteStep:'Borrar paso',deleteSel:'Borrar elegidas',clearSel:'Quitar selección',
 straighten:'Enderezar',deleteArrow:'Borrar flecha',playSteps:'Reproducir los pasos',pause:'Pausa',hide:'Ocultar',tools:'Herramientas',
};
const pt:BoardWords={
 myPlay:'Minha jogada',save:'Salvar',select:'Selecionar',selectLong:'Selecionar e mover: arraste uma peça, toque para editar, contorne várias',
 add:'Adicionar',addLong:'Adicionar jogadores e a bola',home:'Casa',away:'Fora',ball:'Bola',keeper:'Goleiro',
 homeLong:'Jogador da casa: toque no campo para pôr um, ou arraste',awayLong:'Jogador visitante: toque no campo para pôr um, ou arraste',
 arrow:'Seta',arrowLong:'Setas: passes, corridas e conduções',marker:'Caneta',markerLong:'Caneta: notas e zonas',eraser:'Borracha',
 several:'Várias',selectSeveral:'Selecionar várias',more:'Mais',moreLong:'Mais: formações, reprodução, compartilhar',shapes:'Formações',teamShapes:'Formações',
 playback:'Reproduzir',playbackView:'Reprodução e vista',share:'Compartilhar',shareLong:'Compartilhar ou salvar imagem',shareThis:'Compartilhar esta jogada',plays:'Jogadas',
 step:'Passo',stepN:(n:number)=>`Passo ${n}`,addStep:'Adicionar passo',undo:'Desfazer',redo:'Refazer',del:'Apagar',done:'Pronto',close:'Fechar',
 line:'Linha',zone:'Zona',note:'Nota',eraseHint:'Toque ou esfregue setas e notas para apagar.',clearStep:'Limpar este passo',
 severalHint:'Toque nas peças para escolher e arraste uma para mover todas.',nSelected:(n:number)=>`${n} selecionadas`,
 whole:'Todo',half:'Metade',box:'Área',fit:'Ajustar',pitch:'Campo',speed:'Velocidade',pass:'Passe',run:'Corrida',dribble:'Condução',
 moveEarlier:'Mover passo para antes',moveLater:'Mover passo para depois',deleteStep:'Apagar passo',deleteSel:'Apagar selecionadas',clearSel:'Limpar seleção',
 straighten:'Endireitar',deleteArrow:'Apagar seta',playSteps:'Reproduzir os passos',pause:'Pausa',hide:'Ocultar',tools:'Ferramentas',
};
const fr:BoardWords={
 myPlay:'Mon action',save:'Enregistrer',select:'Choisir',selectLong:'Choisir et déplacer : glisse un pion, touche-le pour le modifier, entoure-en plusieurs',
 add:'Ajouter',addLong:'Ajouter des joueurs et le ballon',home:'Domicile',away:'Extérieur',ball:'Ballon',keeper:'Gardien',
 homeLong:'Joueur à domicile : touche le terrain pour le poser, ou glisse-le',awayLong:'Joueur extérieur : touche le terrain pour le poser, ou glisse-le',
 arrow:'Flèche',arrowLong:'Flèches : passes, courses et conduites',marker:'Feutre',markerLong:'Feutre : notes et zones',eraser:'Gomme',
 several:'Plusieurs',selectSeveral:'Choisir plusieurs',more:'Plus',moreLong:'Plus : schémas, lecture, partage',shapes:'Schémas',teamShapes:'Schémas d’équipe',
 playback:'Lecture',playbackView:'Lecture et vue',share:'Partager',shareLong:'Partager ou enregistrer une image',shareThis:'Partager cette action',plays:'Actions',
 step:'Étape',stepN:(n:number)=>`Étape ${n}`,addStep:'Ajouter une étape',undo:'Annuler',redo:'Rétablir',del:'Supprimer',done:'OK',close:'Fermer',
 line:'Trait',zone:'Zone',note:'Note',eraseHint:'Touche ou frotte les flèches et notes pour les effacer.',clearStep:'Effacer cette étape',
 severalHint:'Touche des pions pour les choisir, puis glisses-en un pour tous les déplacer.',nSelected:(n:number)=>`${n} choisis`,
 whole:'Tout',half:'Moitié',box:'Surface',fit:'Ajuster',pitch:'Terrain',speed:'Vitesse',pass:'Passe',run:'Course',dribble:'Conduite',
 moveEarlier:'Avancer l’étape',moveLater:'Reculer l’étape',deleteStep:'Supprimer l’étape',deleteSel:'Supprimer la sélection',clearSel:'Tout désélectionner',
 straighten:'Redresser',deleteArrow:'Supprimer la flèche',playSteps:'Lire les étapes',pause:'Pause',hide:'Masquer',tools:'Outils',
};
const de:BoardWords={
 myPlay:'Mein Spielzug',save:'Sichern',select:'Wählen',selectLong:'Wählen und bewegen: Figur ziehen, antippen zum Bearbeiten, mehrere umkreisen',
 add:'Hinzu',addLong:'Spieler und Ball hinzufügen',home:'Heim',away:'Gast',ball:'Ball',keeper:'Torwart',
 homeLong:'Heimspieler: aufs Feld tippen oder hineinziehen',awayLong:'Gastspieler: aufs Feld tippen oder hineinziehen',
 arrow:'Pfeil',arrowLong:'Pfeile: Pässe, Läufe und Dribblings',marker:'Stift',markerLong:'Stift: Notizen und Zonen',eraser:'Radierer',
 several:'Mehrere',selectSeveral:'Mehrere wählen',more:'Mehr',moreLong:'Mehr: Formationen, Abspielen, Teilen',shapes:'Formation',teamShapes:'Formationen',
 playback:'Abspielen',playbackView:'Abspielen und Ansicht',share:'Teilen',shareLong:'Teilen oder als Bild sichern',shareThis:'Spielzug teilen',plays:'Spielzüge',
 step:'Schritt',stepN:(n:number)=>`Schritt ${n}`,addStep:'Schritt hinzufügen',undo:'Zurück',redo:'Wieder',del:'Löschen',done:'Fertig',close:'Schließen',
 line:'Linie',zone:'Zone',note:'Notiz',eraseHint:'Pfeile und Notizen antippen oder wegwischen.',clearStep:'Schritt leeren',
 severalHint:'Figuren antippen, dann eine ziehen, um alle zu bewegen.',nSelected:(n:number)=>`${n} gewählt`,
 whole:'Ganz',half:'Hälfte',box:'Strafraum',fit:'Einpassen',pitch:'Feld',speed:'Tempo',pass:'Pass',run:'Lauf',dribble:'Dribbling',
 moveEarlier:'Schritt nach vorn',moveLater:'Schritt nach hinten',deleteStep:'Schritt löschen',deleteSel:'Auswahl löschen',clearSel:'Auswahl aufheben',
 straighten:'Begradigen',deleteArrow:'Pfeil löschen',playSteps:'Schritte abspielen',pause:'Pause',hide:'Ausblenden',tools:'Werkzeuge',
};
const it:BoardWords={
 myPlay:'Il mio schema',save:'Salva',select:'Scegli',selectLong:'Scegli e sposta: trascina una pedina, toccala per modificarla, cerchiane diverse',
 add:'Aggiungi',addLong:'Aggiungi giocatori e pallone',home:'Casa',away:'Ospiti',ball:'Pallone',keeper:'Portiere',
 homeLong:'Giocatore di casa: tocca il campo per metterlo, o trascinalo',awayLong:'Giocatore ospite: tocca il campo per metterlo, o trascinalo',
 arrow:'Freccia',arrowLong:'Frecce: passaggi, corse e conduzioni',marker:'Pennarello',markerLong:'Pennarello: note e zone',eraser:'Gomma',
 several:'Più',selectSeveral:'Scegli più pedine',more:'Altro',moreLong:'Altro: moduli, riproduzione, condividi',shapes:'Moduli',teamShapes:'Moduli',
 playback:'Riproduci',playbackView:'Riproduzione e vista',share:'Condividi',shareLong:'Condividi o salva un’immagine',shareThis:'Condividi questo schema',plays:'Schemi',
 step:'Passo',stepN:(n:number)=>`Passo ${n}`,addStep:'Aggiungi passo',undo:'Annulla',redo:'Ripeti',del:'Elimina',done:'Fatto',close:'Chiudi',
 line:'Linea',zone:'Zona',note:'Nota',eraseHint:'Tocca o strofina frecce e note per cancellarle.',clearStep:'Svuota questo passo',
 severalHint:'Tocca le pedine per sceglierle, poi trascinane una per spostarle tutte.',nSelected:(n:number)=>`${n} scelte`,
 whole:'Tutto',half:'Metà',box:'Area',fit:'Adatta',pitch:'Campo',speed:'Velocità',pass:'Passaggio',run:'Corsa',dribble:'Conduzione',
 moveEarlier:'Sposta il passo prima',moveLater:'Sposta il passo dopo',deleteStep:'Elimina passo',deleteSel:'Elimina selezione',clearSel:'Annulla selezione',
 straighten:'Raddrizza',deleteArrow:'Elimina freccia',playSteps:'Riproduci i passi',pause:'Pausa',hide:'Nascondi',tools:'Strumenti',
};
const nl:BoardWords={
 myPlay:'Mijn aanval',save:'Opslaan',select:'Kies',selectLong:'Kiezen en verplaatsen: sleep een pion, tik om te bewerken, omcirkel er meer',
 add:'Erbij',addLong:'Spelers en de bal toevoegen',home:'Thuis',away:'Uit',ball:'Bal',keeper:'Keeper',
 homeLong:'Thuisspeler: tik op het veld of sleep hem erop',awayLong:'Uitspeler: tik op het veld of sleep hem erop',
 arrow:'Pijl',arrowLong:'Pijlen: passes, loopacties en dribbels',marker:'Stift',markerLong:'Stift: notities en zones',eraser:'Gum',
 several:'Meer',selectSeveral:'Meer kiezen',more:'Meer',moreLong:'Meer: opstellingen, afspelen, delen',shapes:'Opstelling',teamShapes:'Opstellingen',
 playback:'Afspelen',playbackView:'Afspelen en weergave',share:'Delen',shareLong:'Delen of als afbeelding bewaren',shareThis:'Deze aanval delen',plays:'Aanvallen',
 step:'Stap',stepN:(n:number)=>`Stap ${n}`,addStep:'Stap toevoegen',undo:'Ongedaan',redo:'Opnieuw',del:'Wissen',done:'Klaar',close:'Sluiten',
 line:'Lijn',zone:'Zone',note:'Notitie',eraseHint:'Tik of wrijf pijlen en notities weg.',clearStep:'Deze stap leegmaken',
 severalHint:'Tik pionnen aan en sleep er één om ze allemaal te verplaatsen.',nSelected:(n:number)=>`${n} gekozen`,
 whole:'Heel',half:'Helft',box:'Zestien',fit:'Passend',pitch:'Veld',speed:'Snelheid',pass:'Pass',run:'Loopactie',dribble:'Dribbel',
 moveEarlier:'Stap naar voren',moveLater:'Stap naar achteren',deleteStep:'Stap wissen',deleteSel:'Keuze wissen',clearSel:'Keuze opheffen',
 straighten:'Rechttrekken',deleteArrow:'Pijl wissen',playSteps:'Stappen afspelen',pause:'Pauze',hide:'Verbergen',tools:'Gereedschap',
};
const pl:BoardWords={
 myPlay:'Moja akcja',save:'Zapisz',select:'Wybierz',selectLong:'Wybierz i przesuń: przeciągnij pionek, dotknij, by edytować, obrysuj kilka',
 add:'Dodaj',addLong:'Dodaj zawodników i piłkę',home:'Gosp.',away:'Goście',ball:'Piłka',keeper:'Bramkarz',
 homeLong:'Zawodnik gospodarzy: dotknij boiska lub przeciągnij',awayLong:'Zawodnik gości: dotknij boiska lub przeciągnij',
 arrow:'Strzałka',arrowLong:'Strzałki: podania, wybiegi i prowadzenie',marker:'Pisak',markerLong:'Pisak: notatki i strefy',eraser:'Gumka',
 several:'Kilka',selectSeveral:'Wybierz kilka',more:'Więcej',moreLong:'Więcej: ustawienia, odtwarzanie, udostępnij',shapes:'Ustawienie',teamShapes:'Ustawienia',
 playback:'Odtwórz',playbackView:'Odtwarzanie i widok',share:'Udostępnij',shareLong:'Udostępnij lub zapisz obraz',shareThis:'Udostępnij akcję',plays:'Akcje',
 step:'Krok',stepN:(n:number)=>`Krok ${n}`,addStep:'Dodaj krok',undo:'Cofnij',redo:'Ponów',del:'Usuń',done:'Gotowe',close:'Zamknij',
 line:'Linia',zone:'Strefa',note:'Notatka',eraseHint:'Dotknij lub zetrzyj strzałki i notatki.',clearStep:'Wyczyść ten krok',
 severalHint:'Dotknij pionków, a potem przeciągnij jeden, by przesunąć wszystkie.',nSelected:(n:number)=>`Wybrane: ${n}`,
 whole:'Całe',half:'Połowa',box:'Pole karne',fit:'Dopasuj',pitch:'Boisko',speed:'Tempo',pass:'Podanie',run:'Wybieg',dribble:'Prowadzenie',
 moveEarlier:'Krok wcześniej',moveLater:'Krok później',deleteStep:'Usuń krok',deleteSel:'Usuń wybrane',clearSel:'Odznacz',
 straighten:'Wyprostuj',deleteArrow:'Usuń strzałkę',playSteps:'Odtwórz kroki',pause:'Pauza',hide:'Ukryj',tools:'Narzędzia',
};
const fi:BoardWords={
 myPlay:'Oma kuvio',save:'Tallenna',select:'Valitse',selectLong:'Valitse ja siirrä: vedä nappulaa, napauta muokataksesi, ympyröi useita',
 add:'Lisää',addLong:'Lisää pelaajia ja pallo',home:'Koti',away:'Vieras',ball:'Pallo',keeper:'Maalivahti',
 homeLong:'Kotipelaaja: napauta kenttää tai vedä se paikalleen',awayLong:'Vieraspelaaja: napauta kenttää tai vedä se paikalleen',
 arrow:'Nuoli',arrowLong:'Nuolet: syötöt, juoksut ja kuljetukset',marker:'Kynä',markerLong:'Kynä: muistiinpanot ja alueet',eraser:'Kumi',
 several:'Useita',selectSeveral:'Valitse useita',more:'Lisää',moreLong:'Lisää: muodostelmat, toisto, jako',shapes:'Muoto',teamShapes:'Muodostelmat',
 playback:'Toisto',playbackView:'Toisto ja näkymä',share:'Jaa',shareLong:'Jaa tai tallenna kuva',shareThis:'Jaa tämä kuvio',plays:'Kuviot',
 step:'Vaihe',stepN:(n:number)=>`Vaihe ${n}`,addStep:'Lisää vaihe',undo:'Kumoa',redo:'Toista',del:'Poista',done:'Valmis',close:'Sulje',
 line:'Viiva',zone:'Alue',note:'Merkintä',eraseHint:'Napauta tai pyyhi nuolia ja merkintöjä.',clearStep:'Tyhjennä vaihe',
 severalHint:'Napauta nappuloita ja vedä yhtä siirtääksesi kaikkia.',nSelected:(n:number)=>`${n} valittu`,
 whole:'Koko',half:'Puolikas',box:'Boksi',fit:'Sovita',pitch:'Kenttä',speed:'Nopeus',pass:'Syöttö',run:'Juoksu',dribble:'Kuljetus',
 moveEarlier:'Vaihe aiemmaksi',moveLater:'Vaihe myöhemmäksi',deleteStep:'Poista vaihe',deleteSel:'Poista valitut',clearSel:'Poista valinta',
 straighten:'Suorista',deleteArrow:'Poista nuoli',playSteps:'Toista vaiheet',pause:'Tauko',hide:'Piilota',tools:'Työkalut',
};
const ja:BoardWords={
 myPlay:'マイプレー',save:'保存',select:'選択',selectLong:'選択と移動：コマをドラッグ、タップで編集、囲んで複数選択',
 add:'追加',addLong:'選手とボールを追加',home:'ホーム',away:'アウェイ',ball:'ボール',keeper:'GK',
 homeLong:'ホームの選手：ピッチをタップするか、ドラッグして置く',awayLong:'アウェイの選手：ピッチをタップするか、ドラッグして置く',
 arrow:'矢印',arrowLong:'矢印：パス、ラン、ドリブル',marker:'ペン',markerLong:'ペン：メモとゾーン',eraser:'消しゴム',
 several:'複数',selectSeveral:'複数選択',more:'その他',moreLong:'その他：フォーメーション、再生、共有',shapes:'陣形',teamShapes:'フォーメーション',
 playback:'再生',playbackView:'再生と表示',share:'共有',shareLong:'共有または画像を保存',shareThis:'このプレーを共有',plays:'プレー',
 step:'ステップ',stepN:(n:number)=>`ステップ${n}`,addStep:'ステップを追加',undo:'元に戻す',redo:'やり直す',del:'削除',done:'完了',close:'閉じる',
 line:'線',zone:'ゾーン',note:'メモ',eraseHint:'矢印やメモをタップするかこすって消す。',clearStep:'このステップを消す',
 severalHint:'コマをタップして選び、1つをドラッグすると全部動きます。',nSelected:(n:number)=>`${n}個選択`,
 whole:'全体',half:'半分',box:'PA',fit:'全体表示',pitch:'ピッチ',speed:'速さ',pass:'パス',run:'ラン',dribble:'ドリブル',
 moveEarlier:'ステップを前へ',moveLater:'ステップを後ろへ',deleteStep:'ステップを削除',deleteSel:'選択を削除',clearSel:'選択を解除',
 straighten:'まっすぐにする',deleteArrow:'矢印を削除',playSteps:'ステップを再生',pause:'一時停止',hide:'隠す',tools:'ツール',
};
export const BOARD_WORDS:Readonly<Record<AppLang,BoardWords>>={en:BOARD_EN,es,pt,fr,de,it,nl,pl,fi,ja};
