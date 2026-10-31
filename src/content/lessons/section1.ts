import type { EditorStep, Lesson, LessonStep, MatchStep, QuizStep, TheoryStep } from "@/lib/lessons/types";
import { PRACTICE_SCENARIOS } from "../practice";
import { withPractice } from "./s1-practice";

const T = (title: string, body: string[], extra: Pick<TheoryStep, "terms" | "tip"> = {}): TheoryStep => ({
  kind: "theory",
  title,
  body,
  ...extra,
});
const Q = (question: string, options: string[], correctIndex: number, explanation: string): QuizStep => ({
  kind: "quiz",
  question,
  options,
  correctIndex,
  explanation,
});
const M = (title: string, pairs: [string, string][]): MatchStep => ({ kind: "match", title, pairs });
const E = (scenario: keyof typeof PRACTICE_SCENARIOS, title: string, instructions: string): EditorStep => ({
  ...PRACTICE_SCENARIOS[scenario].step,
  title,
  instructions,
});
const L = (id: string, title: string, summary: string, steps: LessonStep[], xp = 10): Lesson => {
  const all = withPractice(id, steps);
  return { id, title, summary, minutes: Math.max(4, Math.round(all.length * 0.6)), xp: xp + 5 * all.filter((x) => x.kind === "studio").length, steps: all };
};

export const section1Lessons: Lesson[] = [
  L("crea-sequenza", "Crea la tua prima sequenza", "La finestra Nuova sequenza, come in Premiere.", [
    T("Prima di tutto: la sequenza", [
      "Ogni montaggio in Premiere vive dentro una **sequenza**. Si crea da **File → Nuovo → Sequenza** oppure con **Ctrl+N**.",
      "Le impostazioni più importanti sono due: la **dimensione del fotogramma** (es. 1920×1080, il Full HD) e la **base temporale**, cioè i fotogrammi al secondo (fps).",
      "In Europa lo standard è **25 fps**. Per i social verticali si usa **1080×1920**.",
    ], { terms: [{ term: "1920×1080", def: "Full HD orizzontale (16:9)" }, { term: "25 fps", def: "Standard europeo (PAL)" }] }),
    T("Preset o personalizzato", [
      "Nella scheda **Predefiniti sequenza** trovi impostazioni già pronte, divise per videocamera: ad esempio *Digital SLR → 1080p → DSLR 1080p25*.",
      "Se ti serve una misura particolare, vai nella scheda **Impostazioni** e scegli **Modalità di modifica: Personalizzato**: solo così puoi scrivere a mano larghezza e altezza.",
    ], { tip: "Trucco da pro: trascina una clip sul pulsante Nuovo elemento del pannello Progetto e Premiere crea una sequenza con le stesse impostazioni del video." }),
    {
      kind: "premiere",
      dialog: "sequence",
      title: "Crea la sequenza",
      instructions:
        "Crea una sequenza **1920×1080 a 25 fps** e chiamala **Il mio primo montaggio**. Puoi esplorare tutte le schede e cambiare quello che vuoi: conta solo il risultato. Poi premi **OK**.",
      goal: { width: 1920, height: 1080, fps: 25, name: "Il mio primo montaggio" },
    },
    Q("Quale scorciatoia apre la finestra Nuova sequenza?", ["Ctrl+N", "Ctrl+M", "Ctrl+K", "Ctrl+D"], 0, "N come Nuova. Ctrl+M invece apre l'esportazione."),
    Q("Vuoi scrivere a mano una dimensione insolita (es. 1080×1350). Cosa devi fare prima?", ["Scegliere Modalità di modifica: Personalizzato", "Cambiare la frequenza audio", "Aggiungere tracce video", "Niente, si può sempre"], 0, "Con un preset la dimensione è bloccata: serve Personalizzato."),
  ], 15),
  L("importare", "Importare e organizzare", "Bin, etichette e un progetto ordinato.", [
    T("Prima di montare, si mette in ordine", [
      "Tutto quello che usi (video, audio, immagini) entra nel pannello **Progetto**. Importi con **Ctrl+I** oppure trascinando i file dentro.",
      "I **bin** sono le cartelle del progetto. Creane uno con **Ctrl+B** e dividi il materiale: *Video*, *Audio*, *Musica*, *Grafiche*.",
      "Premiere non copia i file: li **collega**. Se sposti o rinomini un file sul disco, il progetto lo perde e lo segna come *offline*.",
    ], { tip: "Crea una cartella per ogni progetto sul disco, con dentro le stesse sottocartelle dei bin. Ti salverà da tanti file \"mancanti\"." }),
    Q("Con quale scorciatoia importi un file in Premiere?", ["Ctrl+I", "Ctrl+M", "Ctrl+K", "Ctrl+B"], 0, "I come Import. Ctrl+B crea un bin, Ctrl+M apre l'esportazione."),
    T("Etichette e nomi", [
      "Ogni clip ha un'**etichetta colorata**: puoi usarla per riconoscere a colpo d'occhio interviste, B-roll o musica anche in timeline.",
      "Rinominare le clip nel progetto (ad esempio *Intervista_Marco_1*) non cambia il file sul disco: è solo un nome comodo per te.",
    ]),
    Q("Hai spostato la cartella dei video su un altro disco. Cosa succede nel progetto?", ["Niente, Premiere copia i file", "Le clip risultano offline finché non le ricolleghi", "Il progetto si cancella", "I video diventano audio"], 1, "Premiere collega i file: se cambiano posizione va usato \"Ricollega media\"."),
    M("Abbina ogni cosa al suo scopo", [
      ["Bin", "Cartella del progetto"],
      ["Ctrl+I", "Importa file"],
      ["Etichetta", "Colore della clip"],
      ["Offline", "File non trovato"],
    ]),
  ]),
  L("monitor", "Monitor sorgente e programma", "Cosa mostrano i due monitor.", [
    T("Due schermi, due compiti", [
      "Il **Monitor sorgente** (Shift+2) mostra una clip **prima** che entri in timeline: lì la guardi e scegli il pezzo che ti serve.",
      "Il **Monitor programma** (Shift+4) mostra il **risultato del montaggio**: quello che c'è in timeline sotto l'indicatore di riproduzione.",
      "Fai doppio clic su una clip nel progetto e si apre nel Monitor sorgente.",
    ]),
    Q("Vuoi vedere il risultato finale del tuo montaggio. Quale monitor guardi?", ["Sorgente", "Programma", "Lumetri", "Audio"], 1, "Il Monitor programma mostra ciò che c'è in timeline."),
    T("Riprodurre come i professionisti", [
      "Con **Spazio** avvii e fermi la riproduzione. Con **←** e **→** vai avanti e indietro di un fotogramma.",
      "Il **timecode** blu in basso a sinistra indica dove ti trovi: *ore:minuti:secondi:fotogrammi*.",
    ]),
    Q("Il timecode 00:01:10:12 indica...", ["1 ora, 10 minuti e 12 secondi", "1 minuto, 10 secondi e 12 fotogrammi", "110 fotogrammi", "12 minuti"], 1, "L'ultimo numero sono i fotogrammi, non i centesimi."),
    M("Abbina", [
      ["Monitor sorgente", "Clip prima del montaggio"],
      ["Monitor programma", "Risultato in timeline"],
      ["Spazio", "Play / pausa"],
      ["→", "Un fotogramma avanti"],
    ]),
  ]),
  L("in-out", "Punti di attacco e stacco", "Segnare I e O per prendere solo ciò che serve.", [
    T("Prendi solo il pezzo buono", [
      "Nel Monitor sorgente segni l'**attacco** (inizio) con **I** e lo **stacco** (fine) con **O**.",
      "Quando porti la clip in timeline entra solo la parte tra I e O: niente pezzi inutili da tagliare dopo.",
      "Per cancellare i punti: **Ctrl+Shift+X** toglie entrambi.",
    ], { terms: [{ term: "I (In)", def: "Punto di attacco: dove la clip inizia" }, { term: "O (Out)", def: "Punto di stacco: dove la clip finisce" }] }),
    Q("Quale tasto segna il punto di stacco?", ["I", "O", "S", "X"], 1, "O come Out: il punto dove la clip finisce."),
    Q("A cosa servono i punti di attacco e stacco?", ["A colorare la clip", "A portare in timeline solo la parte che ti serve", "A esportare il video", "Ad alzare il volume"], 1, "Selezioni in anticipo il pezzo giusto e la timeline resta pulita."),
    T("Anche in timeline", [
      "I e O funzionano anche nella timeline: segnano una zona della sequenza, utile per esportare solo un pezzo o per sostituire un tratto.",
    ], { tip: "Prova a guardare la clip con J, K, L e premere I e O mentre scorre: è velocissimo." }),
    M("Abbina", [
      ["I", "Attacco"],
      ["O", "Stacco"],
      ["Ctrl+Shift+X", "Cancella I e O"],
      ["Monitor sorgente", "Dove si segnano di solito"],
    ]),
  ]),
  L("inserisci-sovrascrivi", "Inserisci e sovrascrivi", "Le due modalità per portare clip in timeline.", [
    T("Due modi per aggiungere una clip", [
      "**Inserisci** (tasto **,** virgola): la clip entra nel punto dell'indicatore e **sposta in avanti** tutto quello che c'è dopo. Niente viene cancellato.",
      "**Sovrascrivi** (tasto **.** punto): la clip entra e **copre** quello che c'è sotto, per la sua durata. La durata totale non cambia.",
    ]),
    Q("Vuoi aggiungere una clip nel mezzo senza cancellare niente. Cosa usi?", ["Sovrascrivi (.)", "Inserisci (,)", "Lama (C)", "Elimina (Canc)"], 1, "Inserisci spinge avanti il resto del montaggio."),
    Q("Sovrascrivi una clip di 3 secondi sopra un montaggio di 60 secondi. Quanto dura alla fine la sequenza?", ["63 secondi", "60 secondi", "57 secondi", "3 secondi"], 1, "Sovrascrivi copre quello che c'è sotto: la durata non cambia."),
    T("Le tracce di destinazione", [
      "A sinistra della timeline ci sono i pulsanti **V1, A1**… evidenziati: indicano in quale traccia andrà la clip quando usi virgola o punto.",
    ]),
    M("Abbina", [
      [",", "Inserisci"],
      [".", "Sovrascrivi"],
      ["Inserisci", "Sposta avanti il resto"],
      ["Sovrascrivi", "Copre ciò che c'è sotto"],
    ]),
  ]),

  L("trim", "Rifilare le clip (Trim)", "Accorciare e allungare una clip dal bordo.", [
    T("Il trim", [
      "Rifilare significa **spostare l'inizio o la fine** di una clip trascinandone il bordo con lo strumento Selezione (V).",
      "Se accorci una clip con la Selezione, resta un **buco**. Se tieni premuto **Ctrl** mentre trascini, diventa un trim con increspatura e il buco si chiude da solo.",
    ]),
    Q("Accorci la fine di una clip con la Selezione. Cosa resta in timeline?", ["Un buco dopo la clip", "Niente, si chiude da solo", "Una transizione", "Un marker"], 0, "Con la Selezione semplice il buco resta: tieni Ctrl per l'increspatura."),
    T("Q e W: il trucco dei pro", [
      "Metti l'indicatore dove vuoi tagliare e premi **Q**: elimina tutto dall'inizio della clip fino all'indicatore e chiude il buco.",
      "Con **W** elimina dall'indicatore fino alla fine della clip. È il modo più veloce di rifilare.",
    ]),
    Q("Vuoi togliere tutto ciò che c'è DOPO l'indicatore fino alla fine della clip, senza buchi. Che tasto premi?", ["Q", "W", "C", "V"], 1, "W rifila la fine della clip fino all'indicatore."),
    M("Abbina", [
      ["Trim", "Spostare il bordo di una clip"],
      ["Q", "Rifila l'inizio fino all'indicatore"],
      ["W", "Rifila la fine dall'indicatore"],
      ["Ctrl + trascina", "Trim con increspatura"],
    ]),
  ]),
  L("ripple-roll", "Ripple e Roll edit", "Spostare un taglio senza creare buchi.", [
    T("Due strumenti di precisione", [
      "**Ripple Edit (B)**: allunga o accorcia una clip e **sposta tutto il resto** di conseguenza. Mai buchi.",
      "**Rolling Edit (N)**: sposta il **punto di taglio** tra due clip: una si allunga, l'altra si accorcia. La durata totale resta uguale.",
    ]),
    Q("Vuoi spostare il punto di taglio tra due clip senza cambiare la durata totale. Che strumento usi?", ["Ripple Edit (B)", "Rolling Edit (N)", "Lama (C)", "Slip (Y)"], 1, "Il Rolling Edit accorcia una clip e allunga l'altra della stessa quantità."),
    E("ripple-delete", "Togli la papera senza buchi", "Lo stesso principio dell'increspatura vale per eliminare: seleziona il pezzo tra i marker con **V** e premi **Shift + Canc**."),
    Q("Con il Ripple Edit accorci di 2 secondi una clip. Cosa succede al montaggio?", ["Resta un buco di 2 secondi", "Tutto quello che segue si sposta indietro di 2 secondi", "Cambia il volume", "Niente"], 1, "Il ripple sposta il resto e non lascia vuoti."),
    M("Abbina", [
      ["B", "Ripple Edit"],
      ["N", "Rolling Edit"],
      ["Shift+Canc", "Elimina con increspatura"],
      ["Rolling", "Durata totale invariata"],
    ]),
  ], 15),
  L("slip-slide", "Slip e Slide", "Cambiare il contenuto o la posizione di una clip.", [
    T("Slip (Y)", [
      "Lo **Slip** cambia **quale parte** della clip si vede, senza cambiarne posizione e durata in timeline. Come far scorrere la pellicola dentro una finestra fissa.",
      "È perfetto quando il taglio va bene ma vuoi un'azione che parte un attimo prima o dopo.",
    ]),
    Q("Una clip è nel posto giusto e dura giusta, ma vuoi mostrare un momento leggermente diverso. Cosa usi?", ["Slide (U)", "Slip (Y)", "Lama (C)", "Inserisci"], 1, "Lo Slip cambia il contenuto mostrato, non la posizione."),
    T("Slide (U)", [
      "Lo **Slide** sposta una clip **lungo la timeline** tra le due vicine: quella prima si allunga e quella dopo si accorcia (o viceversa). La clip spostata resta identica.",
    ]),
    Q("Con lo Slide sposti una clip in avanti. Cosa succede alle clip vicine?", ["Vengono cancellate", "Una si allunga e l'altra si accorcia", "Restano uguali e si crea un buco", "Diventano audio"], 1, "Lo Slide compensa con le clip accanto: niente buchi."),
    M("Abbina", [
      ["Y", "Slip"],
      ["U", "Slide"],
      ["Slip", "Cambia cosa si vede"],
      ["Slide", "Cambia dove sta la clip"],
    ]),
  ]),
  L("snapping-marker", "Snapping e marker", "Agganciare i tagli ai punti giusti.", [
    T("Lo snapping", [
      "Con lo **snapping** attivo (tasto **S**) clip, tagli e indicatore si **agganciano** a bordi, marker e indicatore quando ci passi vicino. Niente buchi di un fotogramma.",
      "I **marker** (tasto **M**) sono segnaposti colorati: segnano un battito della musica, una battuta, un punto da tagliare.",
    ]),
    Q("Quale tasto aggiunge un marker?", ["K", "M", "S", "N"], 1, "M come Marker. S attiva e disattiva lo snapping."),
    E("cut-at-markers", "Taglia sui marker", "Usa lo snapping: premi **C** e passa vicino ai **marker gialli**, il taglio si aggancia da solo. Taglia su entrambi."),
    Q("Perché lo snapping è utile?", ["Colora le clip", "Evita piccoli buchi o sovrapposizioni tra le clip", "Esporta più veloce", "Alza il volume"], 1, "Agganciando i bordi, i tagli combaciano al fotogramma."),
    M("Abbina", [
      ["S", "Snapping on/off"],
      ["M", "Aggiungi marker"],
      ["Marker", "Segnaposto colorato"],
      ["Snapping", "Aggancio ai bordi"],
    ]),
  ], 15),
  L("scorciatoie", "Scorciatoie da pro", "J, K, L e i tasti che fanno risparmiare ore.", [
    T("J, K, L", [
      "**L** riproduce in avanti, **J** all'indietro, **K** mette in pausa. Premendo L o J più volte vai più veloce (2x, 4x…).",
      "Tieni **K** e premi **L** o **J** per avanzare al rallentatore: perfetto per trovare il fotogramma esatto.",
    ]),
    Q("Premi L due volte. Cosa succede?", ["Pausa", "Riproduzione indietro", "Riproduzione in avanti a velocità doppia", "Si apre l'export"], 2, "Ogni pressione di L aumenta la velocità."),
    T("Le altre scorciatoie da sapere", [
      "**Ctrl+K**: taglia tutte le clip selezionate (o le tracce attive) sull'indicatore, senza cambiare strumento.",
      "**+** e **−**: zoom sulla timeline. **\\**: adatta la sequenza alla finestra.",
      "**Ctrl+Z**: annulla. **Freccia su/giù**: salta al taglio precedente o successivo.",
    ]),
    M("Abbina", [
      ["J", "Indietro"],
      ["K", "Pausa"],
      ["L", "Avanti"],
      ["Ctrl+K", "Taglia sull'indicatore"],
      ["\\", "Adatta la timeline"],
    ]),
    Q("Vuoi tagliare sull'indicatore senza prendere la Lama. Che scorciatoia usi?", ["Ctrl+K", "Ctrl+M", "Ctrl+I", "Ctrl+D"], 0, "Ctrl+K aggiunge un punto di modifica dove si trova l'indicatore."),
  ]),

  L("livelli-db", "Livelli e decibel", "Leggere i VU meter e restare sotto lo 0 dB.", [
    T("I misuratori audio", [
      "Accanto alla timeline ci sono i **misuratori audio**: barre che salgono con il volume. Si misura in **decibel (dBFS)**, dove **0 dB è il massimo**.",
      "Se arrivi a 0 dB il suono **distorce** (clipping): il misuratore diventa rosso e il danno non si può più riparare.",
    ], { terms: [{ term: "0 dBFS", def: "Il tetto: mai superarlo" }, { term: "Clipping", def: "Distorsione quando si supera il massimo" }] }),
    Q("Dove dovrebbero stare i picchi di una voce parlata?", ["Sopra 0 dB", "Tra −12 e −6 dB", "Tra −60 e −50 dB", "Sempre a 0 dB esatti"], 1, "La voce sta comoda tra −12 e −6: forte e chiara ma senza distorcere."),
    T("Il guadagno delle clip", [
      "Per alzare o abbassare una clip intera: clic destro → **Guadagno audio** (tasto **G**). Oppure trascina la linea del volume dentro la clip.",
      "La **musica sotto la voce** va molto più bassa: di solito tra −24 e −18 dB.",
    ]),
    Q("Il misuratore diventa rosso in cima. Cosa significa?", ["L'audio è perfetto", "C'è clipping: il suono distorce", "L'audio è in mono", "La clip è offline"], 1, "Rosso in cima = superato lo 0 dB: abbassa il volume."),
    M("Abbina", [
      ["0 dB", "Volume massimo"],
      ["−12 / −6 dB", "Voce parlata"],
      ["−24 / −18 dB", "Musica sotto la voce"],
      ["G", "Guadagno audio"],
    ]),
  ]),
  L("keyframe-volume", "Keyframe del volume", "Alzare e abbassare la musica nel punto giusto.", [
    T("Volume che cambia nel tempo", [
      "Dentro ogni clip audio c'è una **linea del volume**. Per farla cambiare servono i **keyframe**: punti che fissano un valore in un istante.",
      "Con **Ctrl+clic** sulla linea aggiungi un keyframe (oppure usa lo strumento Penna, **P**). Due keyframe a valori diversi creano una rampa.",
    ]),
    Q("Quanti keyframe servono, minimo, per far salire o scendere il volume?", ["1", "2", "4", "Nessuno"], 1, "Un punto di partenza e uno di arrivo: tra i due Premiere crea la rampa."),
    T("Dissolvenze audio veloci", [
      "Per far entrare la musica in dissolvenza: un keyframe all'inizio molto basso e uno dopo 1–2 secondi al volume normale.",
      "In alternativa trascina la transizione **Potenza costante** (Ctrl+Shift+D) all'inizio o alla fine della clip.",
    ]),
    Q("Come aggiungi un keyframe sulla linea del volume?", ["Doppio clic sulla clip", "Ctrl + clic sulla linea", "Tasto M", "Tasto Canc"], 1, "Ctrl+clic crea un punto sulla linea; poi lo trascini su o giù."),
    M("Abbina", [
      ["Keyframe", "Valore fissato in un istante"],
      ["Ctrl+clic", "Aggiunge un keyframe"],
      ["P", "Strumento Penna"],
      ["Potenza costante", "Dissolvenza audio"],
    ]),
  ]),
  L("ducking", "Musica sotto la voce", "Il ducking per far capire ogni parola.", [
    T("Cos'è il ducking", [
      "Quando qualcuno parla, la musica deve **abbassarsi** e poi risalire nelle pause. Questo si chiama **ducking**.",
      "Puoi farlo a mano con i keyframe, oppure in automatico: pannello **Audio essenziale**, imposta la voce come *Dialogo* e la musica come *Musica*, poi attiva **Ducking** e premi *Genera keyframe*.",
    ]),
    Q("Nel pannello Audio essenziale, che tipo assegni alla traccia della voce?", ["Musica", "Dialogo", "Effetti", "Ambiente"], 1, "Dialogo: così Premiere sa quale traccia deve restare in primo piano."),
    Q("A che volume tenere la musica sotto il parlato?", ["Più alta della voce", "Uguale alla voce", "Tra −24 e −18 dB circa", "A 0 dB"], 2, "Deve accompagnare, non coprire: molto più bassa della voce."),
    T("Il ritocco finale", [
      "Il ducking automatico è un ottimo inizio, ma riascolta: spesso conviene anticipare l'abbassamento di qualche fotogramma prima che la persona inizi a parlare.",
    ]),
    M("Abbina", [
      ["Ducking", "Musica che si abbassa sotto la voce"],
      ["Dialogo", "Tipo per la voce"],
      ["Musica", "Tipo per la colonna sonora"],
      ["Genera keyframe", "Ducking automatico"],
    ]),
  ]),
  L("rumore", "Pulire il rumore", "Ridurre ronzii e fruscii di fondo.", [
    T("I rumori più comuni", [
      "**Fruscio** (rumore bianco), **ronzio** elettrico a 50 Hz, **rimbombo** di una stanza vuota: sono i difetti audio più frequenti.",
      "In **Audio essenziale → Dialogo → Riparazione** trovi *Riduci rumore*, *Riduci rimbombo*, *Elimina ronzio* e *DeEss* (per le S fischianti).",
    ]),
    Q("Senti un ronzio elettrico costante sotto la voce. Quale opzione usi?", ["Riduci rimbombo", "Elimina ronzio", "Ducking", "DeEss"], 1, "Il ronzio a 50 Hz si toglie con Elimina ronzio."),
    T("Non esagerare", [
      "Spingere troppo la riduzione rumore rende la voce **metallica**, come sott'acqua. Meglio un po' di fruscio che una voce robotica.",
    ], { tip: "Il trucco migliore è sempre registrare bene: microfono vicino alla bocca e stanza con tende, divani e tappeti." }),
    Q("Hai messo la riduzione rumore al massimo e la voce suona metallica. Cosa fai?", ["La lasci così", "Abbassi l'intensità dell'effetto", "Alzi il volume", "Aggiungi musica più forte"], 1, "Meglio meno riduzione e una voce naturale."),
    M("Abbina", [
      ["Riduci rumore", "Fruscio di fondo"],
      ["Elimina ronzio", "Ronzio elettrico"],
      ["Riduci rimbombo", "Eco della stanza"],
      ["DeEss", "S fischianti"],
    ]),
  ]),
  L("sfx", "Effetti sonori", "Whoosh, impatti e atmosfere che danno ritmo.", [
    T("Il suono che non noti (ma senti)", [
      "Gli **effetti sonori** (SFX) rendono un montaggio vivo: un **whoosh** su una transizione veloce, un **impatto** su un titolo, un **click** su un'animazione.",
      "L'**ambiente** (room tone) è il rumore di fondo di un luogo: tenerlo sotto i tagli evita i \"buchi\" di silenzio innaturali.",
    ]),
    Q("A cosa serve il room tone (rumore d'ambiente)?", ["A coprire la voce", "A evitare silenzi innaturali tra i tagli", "A distorcere l'audio", "A sostituire la musica"], 1, "Un leggero ambiente continuo rende i tagli invisibili."),
    Q("Una scritta entra a scatto sullo schermo. Quale effetto sonoro ci sta meglio?", ["Pioggia continua", "Un impatto o un whoosh breve", "Una canzone intera", "Nessun suono mai"], 1, "Effetti brevi sottolineano l'azione."),
    T("Dosali", [
      "Gli SFX devono **accompagnare**: tienili più bassi della voce e non metterne uno su ogni taglio, altrimenti diventano fastidiosi.",
    ]),
    M("Abbina", [
      ["Whoosh", "Transizione veloce"],
      ["Impatto", "Titolo che entra"],
      ["Room tone", "Ambiente di fondo"],
      ["SFX", "Effetti sonori"],
    ]),
  ]),

  L("taglio-netto", "Il taglio netto", "Perché il 90% dei passaggi è un semplice taglio.", [
    T("La transizione più usata del mondo", [
      "Il **taglio netto** (cut) passa da un'inquadratura all'altra senza effetti. È quello che vedi in quasi tutti i film e video professionali.",
      "Un buon taglio è **invisibile**: avviene su un movimento, uno sguardo o un suono, e lo spettatore non se ne accorge.",
    ]),
    Q("Qual è la transizione più usata nel montaggio professionale?", ["Dissolvenza a stella", "Il taglio netto", "La tendina", "Lo zoom 3D"], 1, "Semplice, veloce e invisibile."),
    E("cut-at-markers", "Taglia sull'azione", "Taglia la clip sui due **marker gialli** con la **Lama (C)**: sono i punti giusti per un taglio netto."),
    Q("Quando un taglio risulta \"invisibile\"?", ["Quando avviene su un movimento o uno sguardo", "Quando dura 10 secondi", "Quando c'è uno zoom", "Mai"], 0, "Il movimento accompagna l'occhio e il taglio sparisce."),
  ], 15),
  L("dissolvenza", "Dissolvenza incrociata", "Applicare e dosare un cross dissolve.", [
    T("Cross dissolve", [
      "La **dissolvenza incrociata** mescola la fine di una clip con l'inizio della successiva. Comunica **tempo che passa** o un cambio di luogo morbido.",
      "Selezioni il taglio e premi **Ctrl+D** per applicare la transizione video predefinita. Per l'audio: **Ctrl+Shift+D**.",
    ]),
    Q("Che cosa comunica di solito una dissolvenza incrociata?", ["Un'esplosione", "Il passare del tempo o un cambio morbido", "Un errore", "Un fermo immagine"], 1, "È il classico \"qualche ora dopo\"."),
    T("Le maniglie", [
      "Per mescolare due clip servono fotogrammi in più oltre il taglio: si chiamano **maniglie**. Se una clip finisce esattamente sul taglio, Premiere ripete l'ultimo fotogramma.",
      "Durata tipica: da **12 a 25 fotogrammi** (mezzo secondo – un secondo).",
    ]),
    Q("Quale scorciatoia applica la transizione video predefinita?", ["Ctrl+D", "Ctrl+K", "Ctrl+M", "Ctrl+I"], 0, "D come Dissolve."),
    M("Abbina", [
      ["Ctrl+D", "Transizione video"],
      ["Ctrl+Shift+D", "Transizione audio"],
      ["Maniglie", "Fotogrammi oltre il taglio"],
      ["25 fotogrammi", "Circa un secondo"],
    ]),
  ]),
  L("dissolvenza-nero", "Dissolvenza al nero", "Aprire e chiudere un video con eleganza.", [
    T("Fade in e fade out", [
      "La **dissolvenza al nero** (*Tuffo nel nero*) fa sparire l'immagine nel nero. All'inizio del video si chiama *fade in*, alla fine *fade out*.",
      "Si usa per aprire e chiudere un video o per separare due capitoli molto diversi.",
    ]),
    Q("Dove si usa più spesso una dissolvenza al nero?", ["Tra ogni clip", "All'inizio e alla fine del video", "Solo sui titoli", "Mai nei video professionali"], 1, "Apre e chiude il racconto con eleganza."),
    T("Insieme all'audio", [
      "Quando l'immagine va al nero, anche l'audio deve **sfumare**: metti una transizione *Potenza costante* sull'ultima clip audio, della stessa durata.",
    ]),
    Q("L'immagine sfuma nel nero ma la musica si interrompe di colpo. Cosa manca?", ["Una dissolvenza audio", "Un marker", "Un taglio netto", "Un fermo immagine"], 0, "Video e audio devono sfumare insieme."),
    M("Abbina", [
      ["Fade in", "Dal nero all'immagine"],
      ["Fade out", "Dall'immagine al nero"],
      ["Tuffo nel nero", "Nome della transizione"],
      ["Potenza costante", "Sfumatura audio"],
    ]),
  ]),
  L("j-l-cut", "J-cut e L-cut", "Anticipare o prolungare l'audio sul taglio.", [
    T("Audio e video che non tagliano insieme", [
      "Nel **J-cut** l'audio della clip successiva **arriva prima** del suo video: senti la scena nuova mentre vedi ancora la vecchia.",
      "Nel **L-cut** è il contrario: il video cambia ma l'audio della clip precedente **continua** ancora un po'.",
      "Il nome viene dalla forma che prendono le clip in timeline: una J e una L.",
    ]),
    Q("Senti già il rumore del mare mentre vedi ancora la cucina. Che taglio è?", ["L-cut", "J-cut", "Jump cut", "Dissolvenza"], 1, "L'audio della scena successiva anticipa il video: J-cut."),
    T("Come si fa", [
      "Tieni premuto **Alt** e trascina il bordo della sola parte audio (o solo video): così rifili una parte senza toccare l'altra, anche se sono collegate.",
    ], { tip: "Nelle interviste l'L-cut è magico: si continua a sentire chi parla mentre mostri il B-roll." }),
    Q("Quale tasto tieni premuto per rifilare solo l'audio di una clip collegata?", ["Shift", "Alt", "Ctrl", "Spazio"], 1, "Alt ignora temporaneamente il collegamento audio-video."),
    M("Abbina", [
      ["J-cut", "L'audio arriva prima"],
      ["L-cut", "L'audio continua dopo"],
      ["Alt + trascina", "Rifila solo una parte"],
      ["Interviste", "Dove si usano tanto"],
    ]),
  ]),
  L("no-transizioni", "Quando NON usare transizioni", "Evitare gli effetti che sanno di amatoriale.", [
    T("Meno è meglio", [
      "Stelle, cubi che girano, pagine che si sfogliano: le transizioni vistose fanno sembrare un video **amatoriale** e distraggono dalla storia.",
      "Chiediti sempre: questa transizione **racconta qualcosa** (tempo che passa, cambio di luogo)? Se la risposta è no, usa un taglio.",
    ]),
    Q("Stai montando un'intervista. Tra una risposta e l'altra cosa usi di solito?", ["Un cubo 3D", "Un taglio netto (magari coperto da B-roll)", "Una tendina a stella", "Una dissolvenza di 5 secondi"], 1, "Taglio pulito: la transizione distrarrebbe."),
    Q("Quando ha senso una dissolvenza?", ["Su ogni taglio", "Per suggerire tempo che passa o un cambio d'atmosfera", "Per nascondere errori sempre", "Mai"], 1, "Le transizioni devono avere un significato."),
    T("Le eccezioni", [
      "Nei video per social e nei videoclip le transizioni veloci (zoom, whip pan) fanno parte dello **stile**: vanno bene se sono coerenti in tutto il video e a ritmo con la musica.",
    ]),
    M("Abbina", [
      ["Taglio netto", "Scelta di default"],
      ["Dissolvenza", "Tempo che passa"],
      ["Transizioni vistose", "Effetto amatoriale"],
      ["Whip pan", "Stile social, a ritmo"],
    ]),
  ]),

  L("keyframe", "Cos'è un keyframe", "Due punti nel tempo e il computer fa il resto.", [
    T("Il fotogramma chiave", [
      "Un **keyframe** fissa il valore di una proprietà (posizione, scala, opacità, volume…) in un istante preciso.",
      "Con **due keyframe** con valori diversi, Premiere e After Effects calcolano da soli tutti i fotogrammi in mezzo: questo si chiama **interpolazione**.",
      "Nel pannello **Controlli effetti** si attiva l'animazione cliccando il **cronometro** accanto alla proprietà.",
    ]),
    Q("Cosa succede cliccando il cronometro accanto a una proprietà?", ["Si azzera il valore", "Si attiva l'animazione e nasce il primo keyframe", "Si esporta il video", "Si cancella la clip"], 1, "Il cronometro accende l'animazione per quella proprietà."),
    Q("Keyframe 1: opacità 0% a 0s. Keyframe 2: opacità 100% a 1s. Cosa vedi a 0,5s?", ["0%", "Circa 50%", "100%", "Lo schermo nero"], 1, "Il computer interpola: a metà strada, metà valore."),
    T("I keyframe sono ovunque", [
      "Li hai già usati per il volume. Gli stessi principi valgono per animare titoli, zoom, colori ed effetti.",
    ]),
    M("Abbina", [
      ["Keyframe", "Valore in un istante"],
      ["Cronometro", "Attiva l'animazione"],
      ["Interpolazione", "Fotogrammi calcolati in mezzo"],
      ["Controlli effetti", "Pannello delle proprietà"],
    ]),
  ]),
  L("posizione-scala", "Posizione e scala", "Il primo movimento: lo zoom lento.", [
    T("Lo zoom lento (effetto Ken Burns)", [
      "Animare la **Scala** da 100 a 110 in alcuni secondi crea uno **zoom lento**: dà vita a foto e inquadrature statiche.",
      "Animare la **Posizione** fa scorrere l'immagine: insieme allo zoom crea un movimento di \"camera\" morbido.",
    ]),
    Q("Vuoi dare movimento a una foto ferma. Cosa animi?", ["Il volume", "Scala e posizione", "Il nome della clip", "La durata"], 1, "Uno zoom lento con un leggero spostamento è il classico Ken Burns."),
    T("Non scendere sotto il 100%", [
      "Se rimpicciolisci un video sotto il 100% vedi i bordi neri; se lo ingrandisci troppo perdi definizione. Per uno zoom pulito resta tra **100 e 120%** con un video Full HD.",
    ]),
    Q("Ingrandisci un video Full HD al 300%. Che problema avrai?", ["Diventa più nitido", "Perde definizione e si sgrana", "Cambia l'audio", "Nessuno"], 1, "Ingrandire inventa pixel che non esistono."),
    M("Abbina", [
      ["Scala", "Zoom"],
      ["Posizione", "Spostamento"],
      ["Ken Burns", "Zoom lento su foto"],
      ["Sotto 100%", "Bordi neri"],
    ]),
  ]),
  L("rotazione-opacita", "Rotazione e opacità", "Far apparire e girare gli elementi.", [
    T("Opacità", [
      "L'**opacità** va da 0% (invisibile) a 100% (pieno). Animarla è il modo più semplice per far **apparire** o **sparire** un titolo o un logo.",
    ]),
    Q("Un logo deve comparire dolcemente. Cosa animi?", ["Rotazione da 0 a 360°", "Opacità da 0% a 100%", "Volume", "Scala a 300%"], 1, "Una dissolvenza di opacità è morbida ed elegante."),
    T("Rotazione e punto di ancoraggio", [
      "La **rotazione** gira l'elemento attorno al suo **punto di ancoraggio**. Se il punto è al centro, ruota su sé stesso; se è in un angolo, ruota come una porta.",
    ]),
    Q("Vuoi che un elemento ruoti come una porta, attorno al bordo sinistro. Cosa sposti?", ["L'opacità", "Il punto di ancoraggio", "La durata della clip", "Il volume"], 1, "La rotazione avviene sempre attorno al punto di ancoraggio."),
    M("Abbina", [
      ["Opacità 0%", "Invisibile"],
      ["Opacità 100%", "Pieno"],
      ["Rotazione", "Gira l'elemento"],
      ["Punto di ancoraggio", "Centro della rotazione"],
    ]),
  ]),
  L("interpolazione", "Interpolazione", "Lineare, Bézier e tenuta.", [
    T("Come si passa da un keyframe all'altro", [
      "**Lineare**: velocità costante, partenza e arrivo bruschi. Sembra meccanico.",
      "**Bézier**: puoi curvare il movimento e la velocità con delle maniglie.",
      "**Tenuta** (Hold): il valore resta fermo e poi salta di colpo al keyframe successivo. Utile per effetti a scatto.",
    ]),
    Q("Vuoi un cambio a scatto, senza passaggi intermedi. Quale interpolazione usi?", ["Lineare", "Bézier", "Tenuta", "Easy ease"], 2, "La tenuta mantiene il valore fino al keyframe successivo."),
    Q("Un movimento con interpolazione lineare sembra...", ["Morbido e naturale", "Meccanico, con partenza e arrivo bruschi", "Invisibile", "Al rallentatore"], 1, "Velocità costante = niente accelerazioni naturali."),
    T("Dove si cambia", [
      "In Premiere: clic destro sul keyframe → **Interpolazione temporale**. In After Effects i keyframe a tenuta hanno la forma di un quadratino, quelli Bézier di un cerchio.",
    ]),
    M("Abbina", [
      ["Lineare", "Velocità costante"],
      ["Bézier", "Curve con maniglie"],
      ["Tenuta", "Salto a scatto"],
      ["Clic destro sul keyframe", "Cambia interpolazione"],
    ]),
  ]),
  L("easing", "Easing", "Movimenti naturali con ease in e ease out.", [
    T("Accelerare e frenare", [
      "Niente in natura parte e si ferma di colpo: un'auto **accelera** e **frena**. L'**easing** fa lo stesso con le animazioni.",
      "**Ease out**: il movimento parte piano e accelera. **Ease in**: arriva rallentando. Insieme: **Easy ease** (in After Effects tasto **F9**).",
    ]),
    Q("Quale tasto applica l'Easy ease in After Effects?", ["F1", "F9", "F12", "E"], 1, "F9 ammorbidisce sia l'arrivo sia la partenza del keyframe."),
    T("Il Graph Editor", [
      "Nel **Graph Editor** (Shift+F3 in After Effects) vedi la **curva di velocità**: una curva a campana significa partenza lenta, accelerazione e frenata morbida.",
      "Tirando le maniglie gialle rendi il movimento più \"elastico\" o più deciso.",
    ], { tip: "Guarda la scena di Squeak che scivola sulla curva del sito: è proprio una curva di easing!" }),
    Q("Un titolo arriva al centro dello schermo rallentando dolcemente. È...", ["Ease in", "Lineare", "Tenuta", "Ease out"], 0, "Ease in = arrivo morbido sul keyframe."),
    M("Abbina", [
      ["Ease in", "Arriva rallentando"],
      ["Ease out", "Parte piano"],
      ["F9", "Easy ease"],
      ["Graph Editor", "Curva di velocità"],
    ]),
  ], 15),

  L("codec", "Codec e contenitori", "H.264, H.265, ProRes: la differenza.", [
    T("Contenitore e codec", [
      "Il **contenitore** è la \"scatola\" (l'estensione del file: .mp4, .mov). Il **codec** è il modo in cui il video è compresso **dentro** la scatola.",
      "**H.264**: il più compatibile, perfetto per web e social, di solito in .mp4. **H.265 (HEVC)**: stessa qualità con file più leggeri, ma meno compatibile.",
      "**ProRes** e **DNxHR**: file enormi ma qualità altissima, per lavorare o archiviare.",
    ]),
    Q("Quale codec scegli per caricare un video ovunque senza problemi?", ["ProRes 4444", "H.264", "Animation", "Nessuno"], 1, "H.264 si apre praticamente su ogni dispositivo e piattaforma."),
    Q(".mp4 e .mov sono...", ["Codec", "Contenitori", "Risoluzioni", "Frame rate"], 1, "Sono le scatole: il codec è il contenuto."),
    T("Si esporta con Ctrl+M", [
      "In Premiere apri l'esportazione con **Ctrl+M**: scegli formato (codec), predefinito, nome e cartella del file.",
    ]),
    M("Abbina", [
      ["H.264", "Compatibile ovunque"],
      ["H.265", "File più leggeri"],
      ["ProRes", "Qualità per il master"],
      ["Ctrl+M", "Esporta"],
    ]),
  ]),
  L("bitrate", "Bitrate", "Qualità contro peso del file.", [
    T("Quanti dati al secondo", [
      "Il **bitrate** è la quantità di dati usata per ogni secondo di video, in **Mbps** (megabit al secondo). Più alto = più qualità ma file più pesante.",
      "Troppo basso e il video si riempie di **blocchetti** (artefatti), soprattutto nelle scene con tanto movimento.",
    ]),
    Q("Il tuo video esportato ha blocchetti nelle scene veloci. Cosa alzi?", ["Il volume", "Il bitrate", "Il numero di bin", "L'opacità"], 1, "Più dati al secondo = meno artefatti."),
    T("CBR e VBR", [
      "**CBR** usa sempre lo stesso bitrate. **VBR** (variabile) usa più dati dove serve (movimento) e meno dove l'immagine è ferma: file più efficienti. Con **2 passaggi** la qualità migliora ancora, ma l'export è più lento.",
    ]),
    Q("Quale modalità distribuisce i dati dove servono di più?", ["CBR", "VBR", "Hold", "Lineare"], 1, "Il bitrate variabile si adatta alla scena."),
    M("Abbina", [
      ["Bitrate", "Dati al secondo"],
      ["Mbps", "Unità di misura"],
      ["VBR", "Bitrate variabile"],
      ["Artefatti", "Bitrate troppo basso"],
    ]),
  ]),
  L("export-youtube", "Export per YouTube", "Le impostazioni consigliate.", [
    T("La ricetta", [
      "Formato **H.264**, predefinito *Corrispondenza sorgente - Bitrate elevato* come base.",
      "Risoluzione e frame rate **uguali alla sequenza** (ad esempio 1920×1080 a 25 fps). Non cambiare il frame rate in export.",
      "Bitrate VBR a 2 passaggi: circa **10–16 Mbps** per 1080p, **35–45 Mbps** per 4K.",
    ]),
    Q("La sequenza è a 25 fps. A quanti fps esporti per YouTube?", ["60", "25", "12", "30, sempre"], 1, "Mantieni lo stesso frame rate della sequenza."),
    Q("Che bitrate indicativo usi per un video 1080p?", ["1 Mbps", "10–16 Mbps", "500 Mbps", "0,1 Mbps"], 1, "Abbastanza per una buona qualità, senza file enormi."),
    {
      kind: "premiere",
      dialog: "export",
      title: "Esporta per YouTube",
      instructions:
        "La sequenza è 1920×1080 a 25 fps. Esporta in **H.264**, stessa dimensione e fps, bitrate tra **10 e 16 Mbps** e audio a **320 kbps**. Suggerimento: prova il predefinito *YouTube 1080p Full HD*. Poi premi **Esporta**.",
      goal: { format: "H.264", width: 1920, height: 1080, fps: 25, minMbps: 10, maxMbps: 16, audioKbps: 320 },
    },
    T("L'audio", [
      "Audio **AAC**, 48 kHz, **320 kbps** stereo. Controlla prima che i picchi non superino lo 0 dB.",
    ]),
    M("Abbina", [
      ["H.264", "Formato"],
      ["Corrispondenza sorgente", "Stessa risoluzione e fps"],
      ["AAC 320 kbps", "Audio"],
      ["10–16 Mbps", "Bitrate 1080p"],
    ]),
  ]),
  L("export-social", "Export per i social", "Verticale, quadrato e limiti delle piattaforme.", [
    T("Il formato giusto", [
      "Reels, TikTok e Shorts sono **verticali 9:16**: **1080×1920**. Il formato 4:5 (1080×1350) funziona bene nel feed di Instagram.",
      "La sequenza va creata **già in verticale**: esportare un video orizzontale in verticale lo deforma o aggiunge bande nere.",
    ]),
    Q("Che risoluzione usi per un TikTok?", ["1920×1080", "1080×1920", "640×480", "4096×2160"], 1, "Verticale 9:16: 1080 di larghezza, 1920 di altezza."),
    {
      kind: "premiere",
      dialog: "sequence",
      title: "Una sequenza verticale",
      instructions:
        "Crea una sequenza per i Reel: **1080×1920** a **30 fps**. Ricorda: per scrivere la dimensione serve **Modalità di modifica: Personalizzato** nella scheda Impostazioni.",
      goal: { width: 1080, height: 1920, fps: 30 },
    },
    T("Le zone di sicurezza", [
      "Su TikTok e Reels pulsanti e didascalie coprono il **basso** e la **destra** dello schermo: tieni titoli e sottotitoli nella parte centrale.",
    ]),
    Q("Dove eviti di mettere testo importante in un Reel?", ["Al centro", "In basso e sul lato destro", "In alto al centro", "Ovunque va bene"], 1, "Lì ci sono i pulsanti dell'app."),
    M("Abbina", [
      ["9:16", "Reels, TikTok, Shorts"],
      ["4:5", "Feed di Instagram"],
      ["1080×1920", "Verticale Full HD"],
      ["Zona sicura", "Lontano dai pulsanti"],
    ]),
  ]),
  L("master", "Master e consegna", "Il file da archiviare per sempre.", [
    T("Il master", [
      "Il **master** è la copia di qualità massima del video finito, ad esempio **ProRes 422 HQ** o **DNxHR HQ**. Da lì crei tutte le versioni leggere (YouTube, social…).",
      "Così, se domani ti serve un formato nuovo, non devi riaprire e riesportare tutto il progetto.",
    ]),
    Q("Perché si esporta un master in ProRes oltre alla versione per il web?", ["Perché pesa meno", "Per avere una copia di massima qualità da cui creare altre versioni", "Perché YouTube lo richiede", "Per avere l'audio più alto"], 1, "Il master è l'originale da conservare."),
    T("Archiviare il progetto", [
      "Con **File → Gestione progetti** puoi raccogliere progetto e file usati in una sola cartella: perfetto per archiviare o consegnare il lavoro a qualcun altro.",
    ], { tip: "Dai ai file nomi chiari con data e versione: Squeak_Spot_2026-10-25_v3_MASTER.mov" }),
    Q("Quale funzione raccoglie progetto e media in un'unica cartella?", ["Gestione progetti", "Ctrl+K", "Audio essenziale", "Lumetri"], 0, "Gestione progetti copia (o ritaglia) tutto il necessario."),
    M("Abbina", [
      ["Master", "Copia di qualità massima"],
      ["ProRes 422 HQ", "Formato per il master"],
      ["Gestione progetti", "Archivia tutto insieme"],
      ["_v3", "Numero di versione"],
    ]),
  ], 15),
];
