import type { Lesson } from "@/lib/lessons/types";
import { prop } from "@/lib/studio/anim";
import { clipDur, clipEnd } from "@/lib/studio/premiere";
import { allClips, clipsOf, cutNear, graphicLayers, isVideo, noGaps, prSetup, seqLength, sequences, vClips, withFx } from "@/lib/lessons/studioKit";
import { lesson as L, M, near, pr, Q, T } from "./s1-practice";

// Sezione 2 "Raccontare con il montaggio": linguaggio, interviste,
// velocità e titoli. Ogni lezione ha almeno un esercizio in Premiere.

export const section2Lessons: Lesson[] = [
  // ---------------- Unità 7 · Il linguaggio del montaggio ----------------
  L("inquadrature", "Piani e inquadrature", "Campo lungo, medio, primo piano e quando usarli.", [
    T("La scala dei piani", [
      "Le inquadrature si misurano su quanto **spazio** mostrano attorno al soggetto: **campo lunghissimo** (paesaggio), **campo lungo**, **figura intera**, **piano americano** (dalle ginocchia), **mezza figura**, **primo piano** (spalle e volto), **primissimo piano** e **dettaglio**.",
      "Più l'inquadratura è larga, più racconta **dove** siamo. Più è stretta, più racconta **cosa prova** il personaggio.",
    ], { terms: [{ term: "Establishing shot", def: "Campo lungo iniziale che presenta il luogo" }, { term: "Dettaglio", def: "Un oggetto o una parte del corpo a tutto schermo" }] }),
    Q("Vuoi far capire allo spettatore in che città siamo. Che inquadratura usi per aprire?", ["Un dettaglio", "Un campo lungo", "Un primissimo piano", "Uno schermo nero"], 1, "Il campo lungo (establishing shot) orienta lo spettatore nello spazio."),
    T("La progressione classica", [
      "Una scena si apre spesso **dal largo allo stretto**: campo lungo → piano medio → primo piano. Lo spettatore prima si orienta, poi si avvicina all'emozione.",
      "Il **dettaglio** è perfetto per coprire un taglio o per sottolineare un gesto: una tazza che fuma, una mano che trema.",
    ]),
    Q("Quale sequenza di piani segue la progressione classica?", ["Primo piano → dettaglio → campo lungo", "Campo lungo → piano medio → primo piano", "Dettaglio → dettaglio → dettaglio", "Primissimo piano → campo lunghissimo"], 1, "Dal largo allo stretto: prima il luogo, poi le persone, poi le emozioni."),
    M("Abbina il piano a cosa racconta", [
      ["Campo lungo", "Il luogo"],
      ["Primo piano", "L'emozione"],
      ["Dettaglio", "Un oggetto o un gesto"],
      ["Figura intera", "Il corpo in azione"],
    ]),
    pr(
      "Monta dal largo allo stretto",
      "Costruisci su **V1** una piccola scena: **apri** con il **Drone_Mare** (campo lungo), poi l'**intervista** (primo piano) e **chiudi** con il dettaglio **B-roll_Caffe**. Niente buchi.",
      () => prSetup({ clips: [] }),
      [
        { label: "Si apre con il **campo lungo** del drone", test: (s) => vClips(s)[0]?.mediaId === "s-drone" },
        { label: "Poi c'è l'**intervista**", test: (s) => vClips(s).some((c, i) => i > 0 && c.mediaId === "s-intervista") },
        { label: "Si chiude con il **dettaglio** del caffè", test: (s) => vClips(s).at(-1)?.mediaId === "s-caffe" },
        { label: "Nessun buco", test: (s) => noGaps(s) && vClips(s).length >= 3 },
      ],
      "Trascina le clip dal pannello Progetto alla traccia V1 una dopo l'altra: con lo snapping si attaccano da sole.",
    ),
    Q("Un dettaglio inserito tra due pezzi d'intervista serve soprattutto a…", ["Allungare il video", "Coprire il taglio e dare ritmo", "Cambiare il formato", "Alzare il volume"], 1, "È un classico: il dettaglio nasconde il salto e aggiunge informazione."),
  ]),
  L("regola-180", "La regola dei 180°", "Non confondere lo spettatore sulle direzioni.", [
    T("La linea immaginaria", [
      "Quando due persone parlano, immagina una **linea** che passa tra di loro. Finché la camera resta **dallo stesso lato**, uno guarda sempre a destra e l'altro sempre a sinistra.",
      "Se la camera **scavalca la linea**, i personaggi sembrano voltarsi di colpo: lo spettatore perde l'orientamento.",
    ]),
    Q("Cosa succede se la camera scavalca la linea dei 180°?", ["L'audio va fuori sincrono", "I personaggi sembrano invertire la direzione dello sguardo", "Il video diventa in bianco e nero", "Non succede nulla"], 1, "Chi guardava a destra ora guarda a sinistra: sembra che si sia girato."),
    T("Come si ripara al montaggio", [
      "Il trucco onesto è inserire un'inquadratura **sulla linea** (frontale) o un movimento di camera che mostri il passaggio.",
      "Il trucco d'emergenza è **capovolgere orizzontalmente** la clip (effetto *Capovolgi orizzontalmente*), facendo attenzione a scritte e loghi che diventerebbero speculari.",
    ], { tip: "Vale anche per il movimento: un'auto che va da sinistra a destra deve continuare così nell'inquadratura dopo." }),
    Q("Quale problema crea il capovolgimento orizzontale?", ["Le scritte diventano speculari", "L'audio si inverte", "La clip rallenta", "Cambia il frame rate"], 0, "Un cartello capovolto si legge al contrario: va usato con attenzione."),
    pr(
      "Rimetti gli sguardi in ordine",
      "Le due inquadrature dell'intervista guardano in direzioni opposte: la prima è stata **capovolta**. Fai in modo che **guardino dalla stessa parte** (applica o togli **Capovolgi orizzontalmente**).",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 4, patch: (c) => (c.track.startsWith("v") ? { ...c, effects: [withFx("hflip")] } : c) }, { media: "s-intervista", at: 4, from: 5, to: 9 }] }),
      [
        {
          label: "Le due clip guardano dalla stessa parte",
          test: (s) => {
            const v = vClips(s).filter((c) => c.mediaId === "s-intervista");
            return v.length >= 2 && new Set(v.map((c) => c.effects.some((e) => e.defId === "hflip" && e.enabled))).size === 1;
          },
        },
      ],
      "Pannello **Effetti → Effetti video → Trasforma → Capovolgi orizzontalmente**. Per toglierlo: selezionalo in Controlli effetti e premi **Canc**.",
    ),
    M("Abbina", [
      ["Linea dei 180°", "Asse tra i due personaggi"],
      ["Scavalcare", "Passare dall'altro lato"],
      ["Inquadratura frontale", "Sta sulla linea"],
      ["Capovolgi", "Rimedio d'emergenza"],
    ]),
  ]),
  L("continuita", "Montaggio in continuità", "Raccordi di movimento e di sguardo.", [
    T("Il montaggio invisibile", [
      "Nel **montaggio in continuità** lo spettatore non deve accorgersi dei tagli. Il segreto sono i **raccordi**: di movimento, di sguardo, di direzione.",
      "**Raccordo sul movimento**: tagli *durante* un gesto (una mano che alza la tazza) e lo completi nell'inquadratura successiva. Il movimento \"trascina\" l'occhio oltre il taglio.",
    ]),
    Q("Dove conviene tagliare per un raccordo sul movimento?", ["Prima che il gesto inizi", "A metà del gesto", "Molto dopo il gesto", "Su un'inquadratura ferma"], 1, "A metà gesto l'occhio segue il movimento e non nota il taglio."),
    T("Raccordo di sguardo", [
      "Un personaggio guarda fuori campo → taglio → vediamo **cosa** guarda. Lo spettatore unisce le due immagini da solo: è l'effetto **Kuleshov**.",
    ], { terms: [{ term: "Effetto Kuleshov", def: "Il significato nasce dall'accostamento di due inquadrature" }] }),
    Q("Un uomo guarda fuori campo, poi vediamo un piatto di pasta. Lo spettatore pensa che…", ["Siano due video diversi", "L'uomo abbia fame", "Sia un errore", "Il video sia finito"], 1, "È l'effetto Kuleshov: l'accostamento crea il significato."),
    pr(
      "Taglia sul gesto",
      "La città finisce troppo tardi. Rifilala con l'increspatura fino al marker **\"Gesto\"** (2,5 s) e attacca subito il caffè, che continua il movimento. Niente buchi.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 5, a: null }, { media: "s-caffe", at: 5, from: 0, to: 4 }], markers: [{ t: 2.5, name: "Gesto" }] }),
      [
        { label: "Il taglio è sul marker (2,5 s)", test: (s) => cutNear(s, 2.5, 0.12) },
        { label: "Subito dopo c'è il caffè", test: (s) => vClips(s).some((c) => c.mediaId === "s-caffe" && near(c.start, 2.5, 0.12)) },
        { label: "Nessun buco", test: (s) => noGaps(s) },
      ],
      "Metti l'indicatore sul marker e premi **W**: rifila la fine della clip fino all'indicatore e chiude il buco.",
    ),
    M("Abbina il raccordo", [
      ["Movimento", "Taglio a metà gesto"],
      ["Sguardo", "Chi guarda → cosa guarda"],
      ["Direzione", "Stesso verso nelle due inquadrature"],
      ["Kuleshov", "Senso creato dall'accostamento"],
    ]),
  ]),
  L("alternato", "Montaggio alternato", "Due azioni parallele che creano tensione.", [
    T("Due storie nello stesso momento", [
      "Il **montaggio alternato** (cross-cutting) passa avanti e indietro tra **due azioni che accadono contemporaneamente** in luoghi diversi.",
      "Più ci si avvicina al momento in cui le due azioni si incontrano, più i pezzi diventano **corti**: la tensione cresce.",
    ]),
    Q("Nel montaggio alternato, man mano che sale la tensione, le inquadrature diventano…", ["Più lunghe", "Più corte", "In bianco e nero", "Sempre uguali"], 1, "Accorciare i pezzi accelera il ritmo e fa crescere l'attesa."),
    T("Parallelo o alternato?", [
      "Il montaggio **parallelo** accosta azioni anche lontane nel tempo per creare un confronto (il passato e il presente). L'**alternato** invece le tiene nello **stesso tempo**.",
    ]),
    Q("Una rapina in banca e la polizia che arriva, nello stesso momento: che montaggio è?", ["Alternato", "Parallelo", "Jump cut", "Piano sequenza"], 0, "Due azioni contemporanee che convergono: alternato."),
    pr(
      "Alterna le due azioni",
      "Ora c'è prima tutta la città e poi tutto il mare. Taglia e riordina su **V1** in modo da **alternare**: città → mare → città → mare (almeno **4 pezzi**), senza buchi.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 6, a: null }, { media: "s-drone", at: 6, from: 0, to: 6 }] }),
      [
        { label: "Almeno **4 pezzi** su V1", test: (s) => vClips(s).length >= 4 },
        { label: "Città e mare si **alternano**", test: (s) => { const v = vClips(s); return v.length >= 4 && v.every((c, i) => i === 0 || c.mediaId !== v[i - 1].mediaId); } },
        { label: "Nessun buco", test: (s) => noGaps(s) },
      ],
      "Taglia ogni clip a metà (**C**), poi trascina i pezzi tenendo premuto **Ctrl** per inserirli spingendo avanti il resto.",
    ),
    M("Abbina", [
      ["Alternato", "Azioni contemporanee"],
      ["Parallelo", "Confronto tra tempi diversi"],
      ["Pezzi più corti", "Più tensione"],
      ["Convergenza", "Le due azioni si incontrano"],
    ]),
  ]),
  L("ritmo", "Ritmo e tempo", "Tagliare sulla musica e sul respiro della scena.", [
    T("Il ritmo si sente", [
      "Il **ritmo** è la durata delle inquadrature e il momento in cui cambiano. Tagli lunghi = calma; tagli brevi = energia.",
      "Con la musica, i tagli più naturali cadono **sui battiti** (beat) o sugli accenti: l'occhio e l'orecchio si allineano.",
    ]),
    Q("Un video rilassante di viaggio avrà di solito…", ["Tagli ogni mezzo secondo", "Inquadrature lunghe e tagli morbidi", "Solo jump cut", "Nessuna musica"], 1, "Il ritmo segue l'emozione: calma = inquadrature lunghe."),
    T("I marker sui battiti", [
      "Ascolta la musica e premi **M** a ogni battito importante mentre scorre: ottieni una griglia di marker su cui tagliare con lo **snapping** attivo.",
    ], { tip: "Non tagliare su TUTTI i battiti: varia (ogni 2 o 4 battiti) per non diventare prevedibile." }),
    Q("Come segni velocemente i battiti della musica?", ["Premendo M durante la riproduzione", "Con Ctrl+M", "Con il Lumetri", "Con la Lama"], 0, "M aggiunge un marker nel punto dell'indicatore, anche mentre il video scorre."),
    pr(
      "Taglia sui battiti",
      "I marker segnano i battiti della musica (2, 4, 6 e 8 s). Taglia il drone su **almeno tre** di questi marker con la **Lama (C)** e lo snapping attivo.",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 10 }, { media: "s-musica", at: 0, from: 0, to: 10, v: null, a: 1 }], markers: [2, 4, 6, 8].map((t) => ({ t, name: "Beat" })) }),
      [{ label: "Almeno **3 tagli** sui marker", test: (s) => [2, 4, 6, 8].filter((t) => cutNear(s, t, 0.08)).length >= 3 }],
    ),
    pr(
      "Ora dagli varietà",
      "Stessa musica, ma ora monta **quattro clip diverse**, ognuna che **inizia su un marker**. Usa città, caffè, tramonto e drone.",
      () => prSetup({ clips: [{ media: "s-musica", at: 0, from: 0, to: 10, v: null, a: 1 }], markers: [0.04, 2, 4, 6, 8].map((t) => ({ t, name: "Beat" })) }),
      [
        { label: "Almeno **4 clip diverse** su V1", test: (s) => new Set(vClips(s).map((c) => c.mediaId)).size >= 4 },
        { label: "I tagli cadono sui marker", test: (s) => vClips(s).slice(1).every((c) => [2, 4, 6, 8].some((t) => near(c.start, t, 0.1))) && vClips(s).length >= 4 },
      ],
      "Rifila ogni clip finché il bordo si aggancia al marker successivo.",
    ),
  ]),

  // ---------------- Unità 8 · Interviste e multicamera ----------------
  L("b-roll", "Il B-roll", "Coprire i tagli con immagini di supporto.", [
    T("A-roll e B-roll", [
      "L'**A-roll** è il materiale principale (chi parla). Il **B-roll** sono le immagini di supporto: luoghi, dettagli, azioni di cui si sta parlando.",
      "Il B-roll si mette su **V2**, sopra l'intervista: la voce continua sotto e i tagli dell'intervista diventano invisibili.",
    ]),
    Q("Dove si mette di solito il B-roll?", ["Su V1 al posto dell'intervista", "Su V2, sopra l'intervista", "Su A1", "In un'altra sequenza"], 1, "Su V2 copre l'immagine ma lascia intatta la voce di A1."),
    T("Cosa mostrare", [
      "Il B-roll migliore **illustra** ciò che si dice: se l'intervistato parla del suo bar, mostra la macchina del caffè. Se parla della città, la città.",
    ]),
    Q("L'intervistato dice \"ogni mattina preparo il caffè\". Che B-roll scegli?", ["Un drone sul mare", "Un dettaglio della tazza di caffè", "Uno schermo nero", "Un altro primo piano"], 1, "Il B-roll illustra le parole."),
    pr(
      "Copri i jump cut",
      "L'intervista ha due tagli a **4 s** e **8 s** che si vedono. Coprili con il B-roll su **V2**: la **città** sopra il taglio a 4 s e il **caffè** sopra quello a 8 s.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 4 }, { media: "s-intervista", at: 4, from: 5, to: 9 }, { media: "s-intervista", at: 8, from: 10, to: 14 }] }),
      [
        { label: "Il taglio a **4 s** è coperto", test: (s) => vClips(s, 2).some((c) => c.start <= 3.8 && clipEnd(c) >= 4.2) },
        { label: "Il taglio a **8 s** è coperto", test: (s) => vClips(s, 2).some((c) => c.start <= 7.8 && clipEnd(c) >= 8.2) },
        { label: "La voce resta intatta", test: (s) => clipsOf(s, "s-intervista").filter((c) => !isVideo(s, c)).length >= 3 },
      ],
      "Trascina la città sulla traccia V2 in modo che inizi un po' prima del taglio e finisca un po' dopo.",
    ),
    M("Abbina", [
      ["A-roll", "Chi parla"],
      ["B-roll", "Immagini di supporto"],
      ["V2", "Dove va il B-roll"],
      ["A1", "Dove resta la voce"],
    ]),
  ]),
  L("sync-audio", "Sincronizzare l'audio", "Unire audio esterno e video con la forma d'onda.", [
    T("Perché l'audio è separato", [
      "Nei set seri l'audio si registra con un **registratore esterno** e microfoni migliori. Al montaggio va **sincronizzato** con il video.",
      "Il **ciak** serve proprio a questo: il colpo crea un picco netto nella forma d'onda e un fotogramma preciso nel video.",
    ]),
    Q("A cosa serve il colpo del ciak?", ["A dare il via agli attori", "A creare un punto di sincronizzazione preciso tra audio e video", "A misurare la luce", "A nulla, è tradizione"], 1, "Picco audio + fotogramma della chiusura = sincronizzazione al fotogramma."),
    T("In Premiere", [
      "Seleziona video e audio esterno e usa **Clip → Sincronizza** (analizza le forme d'onda). Oppure allinea a mano i picchi e poi **collega** le clip con **Ctrl+L**.",
    ]),
    Q("Dopo aver sincronizzato, perché collegare (Ctrl+L) video e audio?", ["Per esportare più veloce", "Così si muovono e si tagliano insieme senza perdere il sync", "Per alzare il volume", "Per creare una transizione"], 1, "Collegate restano sempre allineate."),
    pr(
      "Sincronizza a mano",
      "L'audio dell'intervista su **A1** è sfasato di 1,2 secondi rispetto al video. Spostalo finché è **perfettamente allineato** al video (stesso inizio), poi **collega** audio e video con **Ctrl+L**.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 8, a: null }, { media: "s-intervista", at: 1.2, from: 0, to: 8, v: null, a: 1 }] }),
      [
        {
          label: "Audio allineato al video",
          test: (s) => {
            const v = vClips(s).find((c) => c.mediaId === "s-intervista");
            const a = clipsOf(s, "s-intervista").find((c) => !isVideo(s, c));
            return !!v && !!a && Math.abs(v.start - v.in - (a.start - a.in)) < 0.05;
          },
        },
        {
          label: "Audio e video **collegati**",
          test: (s) => {
            const v = vClips(s).find((c) => c.mediaId === "s-intervista");
            const a = clipsOf(s, "s-intervista").find((c) => !isVideo(s, c));
            return !!v?.linkId && v.linkId === a?.linkId;
          },
        },
      ],
      "Trascina la clip audio fino a 0 s (lo snapping aiuta). Poi seleziona entrambe e premi **Ctrl+L**.",
    ),
    M("Abbina", [
      ["Ciak", "Picco per il sync"],
      ["Ctrl+L", "Collega / scollega"],
      ["Forma d'onda", "Disegno del suono"],
      ["Fuori sync", "Labbra e voce non coincidono"],
    ]),
  ]),
  L("multicam", "Sequenze multicamera", "Passare da una camera all'altra in tempo reale.", [
    T("Più camere, una scena", [
      "In un'intervista o in un concerto si riprende con **più camere** contemporaneamente: camera A larga, camera B stretta.",
      "Premiere le mette in una **sequenza multicamera**: guardi tutte le camere insieme e scegli quale mostrare cliccando (o premendo 1, 2, 3…) mentre il video scorre.",
    ]),
    Q("In una sequenza multicamera, come scegli la camera mentre il video scorre?", ["Con i tasti numerici 1, 2, 3…", "Con Ctrl+M", "Rinominando le clip", "Esportando ogni camera"], 0, "Ogni numero corrisponde a un angolo: è come una regia in diretta."),
    T("Lo stesso principio, a mano", [
      "Senza multicam puoi impilare le camere: **A su V1**, **B su V2**. Dove vuoi vedere la camera B lasci la clip su V2; dove vuoi la A, tagli e togli V2.",
    ], { tip: "Cambia camera quando cambia l'emozione o la frase, non a caso." }),
    Q("Camera A su V1, camera B su V2. Cosa vede lo spettatore dove ci sono entrambe?", ["La camera A", "La camera B, perché V2 sta sopra", "Uno schermo diviso", "Niente"], 1, "Le tracce più alte coprono quelle sotto."),
    pr(
      "Regia a due camere",
      "La camera B (stretta) è su **V2** per tutta la durata. Fai vedere la **camera B solo tra 4 e 8 secondi**: tagliala e togli i pezzi prima e dopo.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 12 }, { media: "s-intervista", at: 0, from: 0, to: 12, v: 2, a: null, patch: (c) => ({ ...c, motion: { ...c.motion, scale: prop(160) } }) }] }),
      [
        { label: "Camera B visibile a **6 s**", test: (s) => vClips(s, 2).some((c) => c.start <= 6 && clipEnd(c) > 6) },
        { label: "Prima dei 4 s si vede la camera A", test: (s) => !vClips(s, 2).some((c) => c.start < 3.8 && clipEnd(c) > 2) },
        { label: "Dopo gli 8 s si vede la camera A", test: (s) => !vClips(s, 2).some((c) => c.start < 11 && clipEnd(c) > 8.3) },
      ],
      "Lama (**C**) su V2 a 4 s e a 8 s, poi seleziona i pezzi esterni e premi **Canc** (senza increspatura!).",
    ),
    M("Abbina", [
      ["Camera A", "Inquadratura larga"],
      ["Camera B", "Inquadratura stretta"],
      ["Tasti 1-2-3", "Cambio camera in multicam"],
      ["V2", "Copre V1"],
    ]),
  ]),
  L("tagliare-intervista", "Tagliare un'intervista", "Togliere pause ed esitazioni senza notarlo.", [
    T("Pulire il parlato", [
      "Un'intervista grezza è piena di **\"ehm\"**, pause, frasi ricominciate. Toglierle rende chi parla più sicuro e il video più veloce.",
      "Si lavora **ascoltando**: tagli dove finisce una frase pulita e riprendi dove inizia la successiva.",
    ]),
    Q("Qual è lo strumento più rapido per togliere un \"ehm\" senza lasciare buchi?", ["Canc", "Elimina con increspatura (Maiusc+Canc)", "Ctrl+M", "La dissolvenza"], 1, "Toglie il pezzo e chiude subito lo spazio."),
    T("Coprire i salti", [
      "Ogni taglio crea un piccolo **salto** nell'immagine (jump cut). Lo copri con **B-roll**, con un cambio camera o lo trasformi in stile (prossima lezione).",
    ]),
    Q("Dopo aver tolto un \"ehm\" l'immagine scatta. Quale NON è una buona soluzione?", ["Coprire con B-roll", "Passare all'altra camera", "Lasciare il buco nero", "Un leggero punch-in"], 2, "Il buco nero è proprio quello da evitare!"),
    pr(
      "Via gli \"ehm\"",
      "I marker segnano due esitazioni: **3–4 s** e **9–10,5 s**. Toglile entrambe con **Elimina con increspatura**: il discorso deve scorrere senza buchi.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 14 }], markers: [{ t: 3, name: "ehm" }, { t: 4, name: "fine" }, { t: 9, name: "ehm" }, { t: 10.5, name: "fine" }] }),
      [
        { label: "Prima esitazione (3–4 s) tolta", test: (s) => !vClips(s).some((c) => c.in < 3.6 && c.out > 3.4) && vClips(s).length > 1 },
        { label: "Seconda esitazione (9–10,5 s) tolta", test: (s) => !vClips(s).some((c) => c.in < 9.9 && c.out > 9.6) && vClips(s).length > 1 },
        { label: "Nessun buco", test: (s) => noGaps(s) },
        { label: "Durata circa **11,5 s**", test: (s) => near(seqLength(s), 11.5, 0.4) },
      ],
    ),
    M("Abbina", [
      ["Ehm", "Esitazione da togliere"],
      ["Maiusc+Canc", "Elimina con increspatura"],
      ["Jump cut", "Salto dell'immagine"],
      ["B-roll", "Copre il salto"],
    ]),
  ]),
  L("jump-cut", "Il jump cut", "Usare il salto come scelta di stile.", [
    T("Da errore a stile", [
      "Il **jump cut** è un taglio dentro la stessa inquadratura: il soggetto \"salta\". Nel cinema classico era un errore; oggi su YouTube e TikTok è uno **stile** che dà ritmo.",
      "Per renderlo voluto, si alterna spesso con un **punch-in**: la clip dopo il taglio viene ingrandita (scala 110–120%) come se ci fosse una seconda camera.",
    ]),
    Q("Cos'è un punch-in?", ["Un effetto sonoro", "Ingrandire la clip dopo un taglio per simulare un'altra camera", "Un tipo di transizione", "Un codec"], 1, "Uno zoom digitale che rende il salto intenzionale."),
    T("Quando funziona", [
      "Nei vlog, tutorial e video parlati veloci. Meno in documentari emozionali o film, dove distrae.",
    ]),
    Q("In quale video il jump cut è più adatto?", ["Un matrimonio emozionante", "Un vlog veloce su YouTube", "Un documentario sulla natura", "Un film storico"], 1, "Ritmo veloce, tono informale: perfetto per i vlog."),
    pr(
      "Vlog style",
      "Trasforma l'intervista in stile vlog: crea **almeno 3 jump cut** togliendo piccoli pezzi (con increspatura), poi fai un **punch-in** (Scala ≥ **110**) su almeno una clip dopo un taglio.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 14 }] }),
      [
        {
          label: "Almeno **3 jump cut**",
          test: (s) => {
            const v = vClips(s).filter((c) => c.mediaId === "s-intervista");
            return v.filter((c, i) => i > 0 && c.in - v[i - 1].out > 0.15).length >= 3;
          },
        },
        { label: "Nessun buco", test: (s) => noGaps(s) },
        { label: "Un **punch-in** (Scala ≥ 110)", test: (s) => vClips(s).some((c) => (c.motion.scale.keys?.[0]?.v[0] ?? c.motion.scale.value[0]) >= 110) },
      ],
    ),
  ]),

  // ---------------- Unità 9 · Velocità e tempo ----------------
  L("rallenty", "Il rallentatore", "Frame rate di ripresa e slow motion fluido.", [
    T("Da dove nasce lo slow motion", [
      "Per un rallenty **fluido** bisogna **riprendere a più fotogrammi al secondo** di quelli della sequenza: ad esempio 50 fps in una sequenza a 25.",
      "Riprodotti a 25 fps, quei 50 fotogrammi durano il doppio: **50% di velocità**, senza scatti.",
    ]),
    Q("Hai girato a 100 fps e la sequenza è a 25 fps. Quanto puoi rallentare senza scatti?", ["Al 50%", "Al 25%", "Al 10%", "Non si può"], 1, "25 / 100 = 25%: ogni fotogramma esiste davvero."),
    T("Velocità/Durata", [
      "In Premiere: seleziona la clip e premi **Ctrl+R** (**Velocità/Durata**). Scrivi la percentuale; con **Modifica con increspatura** le clip dopo si spostano.",
      "Se rallenti più di quanto permette il frame rate, Premiere deve **inventare** fotogrammi (fusione o flusso ottico) e si vedono artefatti.",
    ]),
    Q("Una clip a 25 fps rallentata al 20% in una sequenza a 25 fps…", ["Sarà perfettamente fluida", "Scatterà o avrà artefatti", "Durerà meno", "Diventerà muta"], 1, "Mancano fotogrammi veri: si vedono scatti o fotogrammi inventati."),
    pr(
      "Slow motion al 50%",
      "Rallenta il drone al **50%** con **Velocità/Durata (Ctrl+R)**, attivando **Modifica con increspatura** così la clip dopo si sposta.",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 4 }, { media: "s-tramonto", at: 4, from: 0, to: 4 }] }),
      [
        { label: "Drone al **50%**", test: (s) => vClips(s).some((c) => c.mediaId === "s-drone" && near(c.speed, 0.5, 0.02)) },
        { label: "Dura il doppio (**8 s**)", test: (s) => vClips(s).some((c) => c.mediaId === "s-drone" && near(clipDur(c), 8, 0.2)) },
        { label: "Nessun buco o sovrapposizione", test: (s) => noGaps(s) && vClips(s).length >= 2 },
      ],
    ),
    M("Abbina", [
      ["50 fps → 25", "50% senza scatti"],
      ["Ctrl+R", "Velocità/Durata"],
      ["Flusso ottico", "Fotogrammi inventati"],
      ["Increspatura", "Sposta le clip dopo"],
    ]),
  ]),
  L("time-remapping", "Time remapping", "Rampe di velocità dentro una sola clip.", [
    T("La rampa di velocità", [
      "Il **time remapping** cambia la velocità **dentro** la stessa clip: veloce → lento → veloce. È l'effetto dei video sportivi e dei trailer.",
      "In Premiere si fa con i **keyframe di velocità** sulla clip (clic destro sull'icona fx → Rimappatura temporale → Velocità).",
    ]),
    Q("Cos'è una rampa di velocità?", ["Un cambio di velocità graduale dentro la stessa clip", "Un tipo di transizione", "Un effetto audio", "Un formato di esportazione"], 0, "Accelera e rallenta in modo fluido nella stessa clip."),
    T("La versione \"a pezzi\"", [
      "Un modo semplice per ottenere lo stesso effetto: **taglia** la clip in tre, lascia normali i pezzi esterni e **rallenta** quello centrale. Poi ammorbidisci con brevi dissolvenze, se serve.",
    ]),
    Q("Vuoi rallentare solo il momento del salto di uno skater. Quale pezzo rallenti?", ["Tutto il video", "Solo il pezzo del salto", "Solo l'inizio", "Nessuno"], 1, "L'enfasi va sull'istante chiave."),
    pr(
      "Rallenta solo il momento chiave",
      "Taglia la città a **2 s** e **4 s**: lascia i pezzi esterni al 100% e porta il pezzo **centrale** al **50% o meno**. Tutto deve restare attaccato.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 6, a: null }] }),
      [
        { label: "Almeno **3 pezzi**", test: (s) => vClips(s).length >= 3 },
        { label: "Il primo pezzo è a velocità normale", test: (s) => near(vClips(s)[0]?.speed ?? 0, 1, 0.01) },
        { label: "Un pezzo centrale al **≤ 50%**", test: (s) => vClips(s).some((c, i) => i > 0 && c.speed <= 0.51) },
        { label: "Nessun buco", test: (s) => noGaps(s) },
      ],
      "Dopo i tagli, seleziona il pezzo centrale, **Ctrl+R**, 50% con **Modifica con increspatura** attiva.",
    ),
  ]),
  L("fps", "Fotogrammi e fps", "24, 25, 30, 60: cosa cambia davvero.", [
    T("Le frequenze più comuni", [
      "**24 fps**: il look del cinema. **25 fps**: TV e video in Europa (PAL). **30 fps** (29,97): TV e web in America. **50/60 fps**: sport, gaming, movimento fluido.",
      "Più fps = movimento più fluido e dettagliato; meno fps = più \"cinematografico\", con un leggero mosso.",
    ]),
    Q("Quale frequenza dà il classico \"look cinema\"?", ["24 fps", "50 fps", "60 fps", "120 fps"], 0, "24 fps è lo standard del cinema da quasi un secolo."),
    T("Mescolare frequenze", [
      "Mettere una clip a 30 fps in una sequenza a 25 fps crea piccoli **scatti** (fotogrammi saltati o ripetuti). Scegli la frequenza della sequenza **prima** e gira di conseguenza.",
    ]),
    Q("Perché è meglio girare a 25 fps se il video è per la TV italiana?", ["Perché pesa meno", "Perché è lo standard PAL ed evita scatti e sfarfallii delle luci", "Perché è più colorato", "Perché si monta più in fretta"], 1, "Rispettare lo standard evita conversioni e flicker con le luci a 50 Hz."),
    pr(
      "Una sequenza da cinema",
      "Crea una nuova sequenza **4K UHD (3840×2160)** a **24 fps** e chiamala **Cortometraggio**.",
      () => prSetup({ noSequence: true }),
      [
        { label: "Sequenza **3840×2160**", test: (s) => sequences(s).some((q) => q.width === 3840 && q.height === 2160) },
        { label: "A **24 fps** (o 23,976)", test: (s) => sequences(s).some((q) => q.width === 3840 && (near(q.fps, 24, 0.01) || near(q.fps, 23.976, 0.01))) },
        { label: "Si chiama **Cortometraggio**", test: (s) => sequences(s).some((q) => /cortometraggio/i.test(q.name)) },
      ],
    ),
    M("Abbina", [
      ["24 fps", "Cinema"],
      ["25 fps", "TV europea"],
      ["30 fps", "Web e TV americana"],
      ["60 fps", "Sport e gaming"],
    ]),
  ]),
  L("fermo-immagine", "Fermo immagine", "Congelare un istante per enfatizzarlo.", [
    T("Congelare il tempo", [
      "Il **fermo immagine** blocca un fotogramma per qualche secondo: per presentare un personaggio (*\"Questo sono io…\"*), per una battuta, per far leggere una scritta.",
      "In Premiere: indicatore sul fotogramma giusto → clic destro sulla clip → **Aggiungi fermo immagine** (dall'indicatore in poi la clip resta ferma) oppure **Inserisci segmento fermo immagine**.",
    ]),
    Q("Quale uso del fermo immagine è più tipico?", ["Presentare un personaggio con una scritta", "Alzare il volume", "Cambiare il formato", "Stabilizzare"], 0, "Il classico \"freeze frame + nome\" delle commedie."),
    T("Renderlo più ricco", [
      "Al fermo immagine si aggiungono spesso un leggero **zoom**, un **flash bianco** o un effetto sonoro (*whoosh*, scatto di macchina fotografica).",
    ]),
    Q("Quale suono accompagna bene un fermo immagine?", ["Uno scatto fotografico", "Il silenzio assoluto per 10 s", "Una sirena", "Nessuno, mai"], 0, "Lo scatto rende evidente che il tempo si è fermato."),
    pr(
      "Freeze frame!",
      "Porta l'indicatore a circa **3 s** sull'intervista e usa **Clip → Opzioni video → Aggiungi fermo immagine** (o il clic destro sulla clip): da lì in poi l'immagine resta ferma.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 8 }] }),
      [
        { label: "C'è un **fermo immagine**", test: (s) => vClips(s).some((c) => c.freeze !== undefined) },
        { label: "…intorno ai **3 s**", test: (s) => vClips(s).some((c) => c.freeze !== undefined && near(c.start, 3, 0.5)) },
      ],
    ),
    pr(
      "Fermo + whoosh",
      "Ora completa l'effetto: aggiungi il fermo immagine a circa **2 s** sul tramonto **e** metti **Whoosh.wav** su A2 che parta vicino al fermo (entro mezzo secondo).",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 6 }] }),
      [
        { label: "Fermo immagine a ~2 s", test: (s) => vClips(s).some((c) => c.freeze !== undefined && near(c.start, 2, 0.5)) },
        { label: "Whoosh sincronizzato col fermo", test: (s) => { const f = vClips(s).find((c) => c.freeze !== undefined); return !!f && clipsOf(s, "s-whoosh").some((w) => Math.abs(w.start - f.start) <= 0.6); } },
      ],
    ),
  ]),
  L("reverse", "Reverse e loop", "Riprodurre al contrario e creare cicli.", [
    T("Il mondo al contrario", [
      "Con **Velocità/Durata → Inverti velocità** la clip si riproduce **al contrario**: l'acqua torna nel bicchiere, il tuffatore risale.",
      "Usato con moderazione è magico; troppo spesso diventa ridicolo.",
    ]),
    Q("Dove trovi \"Inverti velocità\"?", ["Nella finestra Velocità/Durata (Ctrl+R)", "Nel Lumetri", "Nel pannello Audio", "Nell'esportazione"], 0, "È una casella della finestra Velocità/Durata."),
    T("Il boomerang", [
      "Un **loop boomerang** si fa così: la clip normale e subito dopo la **stessa clip invertita**. Il movimento va e torna all'infinito, come nelle storie di Instagram.",
    ]),
    Q("Come costruisci un boomerang?", ["Clip normale + la stessa clip invertita", "Due dissolvenze", "Una clip al 200%", "Un fermo immagine"], 0, "Avanti e indietro, e il loop è perfetto."),
    pr(
      "Boomerang",
      "Crea un boomerang con il drone: lascia la prima clip normale, mettine una **copia** subito dopo (**Ctrl+C**, **Ctrl+V**) e **invertila** (Ctrl+R → Inverti velocità).",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 3 }] }),
      [
        { label: "Almeno **2 clip** del drone", test: (s) => vClips(s).filter((c) => c.mediaId === "s-drone").length >= 2 },
        { label: "Una normale e una **invertita**", test: (s) => vClips(s).some((c) => c.mediaId === "s-drone" && !c.reverse) && vClips(s).some((c) => c.mediaId === "s-drone" && c.reverse) },
        { label: "Una attaccata all'altra", test: (s) => noGaps(s) },
      ],
    ),
  ]),

  // ---------------- Unità 10 · Titoli e grafica base ----------------
  L("testi", "Testi essenziali", "Font, dimensioni e contrasto leggibili.", [
    T("Un testo si deve leggere", [
      "Tre regole: **font semplice** (sans serif per lo schermo), **dimensione** abbastanza grande (su 1080p almeno 60–80 px per i titoli), **contrasto** forte con lo sfondo.",
      "Se lo sfondo è movimentato, aggiungi un'**ombra**, un **contorno** o un **riquadro** semitrasparente dietro.",
    ]),
    Q("Testo bianco sopra un cielo chiaro: come lo rendi leggibile?", ["Lo rimpicciolisci", "Aggiungi ombra o riquadro scuro", "Lo fai giallo chiaro", "Lo lasci così"], 1, "Ombra o sfondo creano il contrasto che manca."),
    T("Lo strumento Testo", [
      "Premi **T** e clicca nel Monitor programma: si crea una **clip grafica** sulla prima traccia libera. Lo stile si cambia nel pannello **Proprietà** (o Grafiche essenziali).",
    ]),
    Q("Qual è la scorciatoia dello strumento Testo?", ["T", "C", "V", "M"], 0, "T come Testo."),
    pr(
      "Il tuo primo titolo",
      "Sopra il tramonto crea un titolo con lo strumento **Testo (T)** che dica **Estate 2026**, grande almeno **80 px**, con **ombra** attiva.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 6 }] }),
      [
        { label: "Titolo **Estate 2026**", test: (s) => graphicLayers(s).some(({ g }) => /estate\s*2026/i.test(g.text)) },
        { label: "Grande ≥ **80 px**", test: (s) => graphicLayers(s).some(({ g }) => /estate/i.test(g.text) && g.style.size >= 80) },
        { label: "Con **ombra**", test: (s) => graphicLayers(s).some(({ g }) => /estate/i.test(g.text) && g.style.shadow.on) },
      ],
      "Dopo aver scritto, seleziona il testo e apri il pannello **Proprietà**: dimensione e **Ombra** sono lì.",
    ),
    M("Abbina", [
      ["Sans serif", "Font senza grazie, leggibile"],
      ["Contrasto", "Differenza tra testo e sfondo"],
      ["Ombra", "Stacca il testo dallo sfondo"],
      ["T", "Strumento Testo"],
    ]),
  ]),
  L("lower-third", "Il lower third", "Nome e ruolo di chi parla.", [
    T("Il \"sottopancia\"", [
      "Il **lower third** (in italiano *sottopancia*) è la scritta nel **terzo inferiore** dello schermo con **nome e ruolo** di chi parla.",
      "Compare la prima volta che la persona parla, resta **4–6 secondi** e sparisce. Sta a sinistra (o a destra) per non coprire il volto.",
    ]),
    Q("Quanto resta a schermo di solito un lower third?", ["Mezzo secondo", "4–6 secondi", "Tutto il video", "Un minuto"], 1, "Il tempo di leggerlo due volte, poi lascia spazio all'immagine."),
    T("Gerarchia", [
      "Il **nome** è più grande e in grassetto; il **ruolo** sotto, più piccolo. Un riquadro o una barra colorata aiutano a staccarlo dall'immagine.",
    ]),
    Q("Dove si posiziona un lower third?", ["Al centro sul volto", "Nel terzo inferiore, di lato", "In alto al centro", "Fuori dallo schermo"], 1, "In basso e di lato, lontano dal volto."),
    pr(
      "Presenta l'intervistato",
      "Aggiungi un **lower third** sopra l'intervista: testo nel **terzo inferiore** (sotto i 720 px) e nella **metà sinistra**, con un **nome** a tua scelta. Deve durare tra **3 e 7 s**.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 10 }] }),
      [
        { label: "Testo nel **terzo inferiore**", test: (s) => graphicLayers(s).some(({ g }) => g.y >= 720) },
        { label: "Nella **metà sinistra**", test: (s) => graphicLayers(s).some(({ g }) => g.y >= 720 && g.x < 960) },
        { label: "Dura **3–7 s**", test: (s) => graphicLayers(s).some(({ clip, g }) => g.y >= 720 && clipDur(clip) >= 3 && clipDur(clip) <= 7) },
      ],
      "Il pannello **Grafiche essenziali → Sfoglia** ha il modello **Terzo inferiore**: usalo, poi trascina il testo a sinistra nel Monitor programma e rifila la clip.",
    ),
  ]),
  L("safe-margin", "Margini di sicurezza", "Tenere i titoli lontano dai bordi.", [
    T("Le zone sicure", [
      "Alcuni schermi (vecchie TV, telefoni con notch, interfacce delle app) **tagliano i bordi**. Per questo esistono le **zone sicure**: azione (circa 93%) e **titoli (circa 90%)**.",
      "Nei social verticali le interfacce coprono il **basso** (didascalie, pulsanti) e la **destra** (like, commenti): i testi vanno più in alto e più al centro.",
    ]),
    Q("Perché nei Reel i sottotitoli non si mettono attaccati al bordo basso?", ["Perché è vietato", "Perché lì ci sono la didascalia e i pulsanti dell'app", "Perché sono troppo grandi", "Per risparmiare spazio"], 1, "L'interfaccia di Instagram/TikTok copre proprio quella zona."),
    T("In Premiere", [
      "Nel Monitor programma, menu chiave inglese → **Margini di sicurezza**: compaiono le guide. Tutto il testo deve stare dentro il riquadro interno.",
    ]),
    Q("Quale percentuale dello schermo è la zona sicura per i titoli?", ["Circa 50%", "Circa 90%", "100%", "110%"], 1, "Il riquadro interno, circa al 90%."),
    pr(
      "Rientra nei margini",
      "Il titolo è appiccicato al bordo in basso a destra: trascinalo **dentro la zona sicura** (lontano almeno il 10% da ogni bordo).",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 6 }], titles: [{ at: 0, dur: 6, v: 2, text: "VIAGGIO IN SARDEGNA", x: 1700, y: 1050, size: 90 }] }),
      [
        { label: "Il titolo c'è ancora", test: (s) => graphicLayers(s).some(({ g }) => /sardegna/i.test(g.text)) },
        { label: "Titolo dentro la **zona sicura**", test: (s) => graphicLayers(s).some(({ g }) => g.x >= 192 && g.x <= 1728 && g.y >= 108 && g.y <= 972) },
      ],
      "Seleziona la clip grafica su V2 e trascina il testo nel Monitor programma, oppure cambia la **Posizione** nel pannello Proprietà.",
    ),
  ]),
  L("sottotitoli", "Sottotitoli", "Generare, correggere e stilizzare i sottotitoli.", [
    T("Perché i sottotitoli", [
      "Sui social l'**85%** dei video si guarda **senza audio**. I sottotitoli tengono le persone a guardare e rendono il video accessibile a chi non sente.",
      "Premiere li genera dalla trascrizione (**Testo → Trascrivi**), ma vanno sempre **riletti e corretti**: nomi e parole tecniche spesso sono sbagliati.",
    ]),
    Q("Perché correggere i sottotitoli generati in automatico?", ["Non serve mai", "Il riconoscimento sbaglia spesso nomi e termini", "Per farli più lunghi", "Per cambiare lingua"], 1, "La trascrizione automatica è un ottimo punto di partenza, non il risultato finale."),
    T("Regole d'oro", [
      "Massimo **2 righe**, circa **35–42 caratteri** per riga, ognuno a schermo almeno **1 secondo**. Bianco con contorno o riquadro nero: leggibile su tutto.",
    ]),
    Q("Quante righe al massimo per un sottotitolo?", ["1", "2", "4", "Quante servono"], 1, "Due righe: di più non si leggono in tempo."),
    pr(
      "Sottotitola la prima frase",
      "Aggiungi un sottotitolo che dica **Ciao a tutti!** nella parte **bassa** dello schermo (sotto gli 860 px), con **riquadro** di sfondo attivo, che duri da **0** a circa **2–4 s**.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 8 }] }),
      [
        { label: "Testo **Ciao a tutti!**", test: (s) => graphicLayers(s).some(({ g }) => /ciao a tutti/i.test(g.text)) },
        { label: "In basso", test: (s) => graphicLayers(s).some(({ g }) => /ciao/i.test(g.text) && g.y >= 860) },
        { label: "Con **riquadro** di sfondo", test: (s) => graphicLayers(s).some(({ g }) => /ciao/i.test(g.text) && g.style.background.on) },
        { label: "Dura **2–4 s** dall'inizio", test: (s) => graphicLayers(s).some(({ clip, g }) => /ciao/i.test(g.text) && clip.start < 0.5 && clipDur(clip) >= 1.8 && clipDur(clip) <= 4.2) },
      ],
      "Grafiche essenziali → **Sottotitolo** ha già la posizione e il riquadro giusti: cambia solo il testo e rifila la clip.",
    ),
  ]),
  L("grafiche-essenziali", "Grafiche essenziali", "Usare e modificare i template.", [
    T("I modelli pronti", [
      "Il pannello **Grafiche essenziali** contiene **modelli** (template) di titoli, lower third, sottotitoli. Li trascini in timeline e ne cambi testo, colori e font.",
      "Puoi anche creare i **tuoi** modelli e riusarli in tutti i progetti: così ogni video del canale ha lo stesso stile.",
    ]),
    Q("Perché creare i propri modelli di grafica?", ["Per avere uno stile coerente in tutti i video", "Per esportare più velocemente", "Per avere più tracce", "Non serve"], 0, "Coerenza = riconoscibilità del brand."),
    T("Più livelli in una grafica", [
      "Una clip grafica può contenere **più livelli**: testo, rettangoli, ellissi. Con la grafica selezionata, crea un nuovo livello e si aggiunge dentro la stessa clip.",
    ]),
    Q("Vuoi un rettangolo colorato dietro al nome. Cosa aggiungi?", ["Un livello forma (rettangolo) nella stessa grafica", "Una nuova sequenza", "Un effetto audio", "Una transizione"], 0, "Testo + forma nella stessa clip grafica."),
    pr(
      "Personalizza un modello",
      "Usa il modello **Didascalia grande** (o un altro) da **Grafiche essenziali → Sfoglia**, cambia il testo in **CAPITOLO 2** e aggiungi alla stessa grafica un **rettangolo**.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 6 }] }),
      [
        { label: "Testo **CAPITOLO 2**", test: (s) => graphicLayers(s).some(({ g }) => /capitolo\s*2/i.test(g.text)) },
        { label: "Un **rettangolo** nella stessa grafica", test: (s) => allClips(s).some((c) => (c.graphic ?? []).some((g) => g.kind === "text") && (c.graphic ?? []).some((g) => g.kind === "rect")) },
      ],
      "Con la clip grafica selezionata, usa lo strumento **Rettangolo** (nel menu della penna) e disegna nel monitor: il livello si aggiunge alla stessa grafica.",
    ),
  ]),
];
