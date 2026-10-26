import type { Lesson } from "@/lib/lessons/types";
import { prop } from "@/lib/studio/anim";
import { clipDur, type PrState } from "@/lib/studio/premiere";
import { aeKeys, aeLayer, aeLayers, aeSetup, allComps, clipsOf, clipVolumeAt, cutNear, graphicLayers, noGaps, prSeq, prSetup, seqLength, sequences, vClips } from "@/lib/lessons/studioKit";
import { lum } from "./section3";
import { ae, lesson as L, M, near, pr, Q, T } from "./s1-practice";

// Sezione 5 "Da professionista": workflow, social e il progetto finale,
// in cui si usano insieme tutte le cose imparate nel corso.

const bin = (s: PrState, re: RegExp) => s.project.items.find((i) => i.type === "bin" && re.test(i.name));
const inBin = (s: PrState, re: RegExp) => {
  const b = bin(s, re);
  return b ? s.project.items.filter((i) => i.parent === b.id) : [];
};
const scaleOf = (c: { motion: { scale: { value: number[]; keys: { v: number[] }[] | null } } }) => c.motion.scale.keys?.[0]?.v[0] ?? c.motion.scale.value[0];
/** Montaggio grezzo di partenza per il progetto finale. */
const roughCut = () =>
  prSetup({
    name: "Spot_Pizzeria",
    clips: [
      { media: "s-citta", at: 0, from: 0, to: 6, a: null },
      { media: "s-intervista", at: 7, from: 0, to: 9 },
      { media: "s-caffe", at: 17, from: 0, to: 6 },
      { media: "s-tramonto", at: 24, from: 0, to: 8, a: null },
    ],
  });

export const section5Lessons: Lesson[] = [
  // ---------------- Unità 18 · Workflow ----------------
  L("proxy", "I proxy", "Montare 4K su un portatile qualsiasi.", [
    T("File leggeri per montare", [
      "I **proxy** sono copie **leggere** (bassa risoluzione, codec facile) dei file originali pesanti. Monti con i proxy, il computer non arranca, e all'esportazione Premiere usa automaticamente gli **originali**.",
      "In Premiere: clic destro sulle clip → **Proxy → Crea proxy**, poi il pulsante **Attiva/disattiva proxy** nel monitor.",
    ]),
    Q("All'esportazione, Premiere usa…", ["I proxy", "I file originali", "Uno a caso", "Nessuno dei due"], 1, "I proxy servono solo per montare comodi."),
    T("Organizzare proxy e originali", [
      "Tieni proxy e originali in **cartelle separate** sul disco e con gli **stessi nomi**: così si ricollegano senza problemi.",
    ], { tip: "Un'alternativa veloce: abbassa la risoluzione di riproduzione del Monitor programma a 1/2 o 1/4." }),
    Q("Perché proxy e originali devono avere lo stesso nome?", ["Per ricollegarli facilmente", "Per occupare meno spazio", "Per il colore", "Non serve"], 0, "Il collegamento si basa sui nomi."),
    pr(
      "Prepara il progetto per i proxy",
      "Crea due bin, **Originali** e **Proxy**, e sposta **almeno 2 video** nel bin **Originali**.",
      () => prSetup({ noSequence: true }),
      [
        { label: "Bin **Originali**", test: (s) => !!bin(s, /originali/i) },
        { label: "Bin **Proxy**", test: (s) => !!bin(s, /proxy/i) },
        { label: "Almeno 2 video negli Originali", test: (s) => inBin(s, /originali/i).filter((i) => i.type === "media" && s.project.media[i.ref ?? ""]?.kind === "video").length >= 2 },
      ],
    ),
    M("Abbina", [
      ["Proxy", "Copia leggera"],
      ["Originale", "File pesante di qualità"],
      ["Export", "Usa gli originali"],
      ["1/4", "Risoluzione di riproduzione ridotta"],
    ]),
  ]),
  L("gestione-progetto", "Gestione del progetto", "Cartelle, nomi e versioni.", [
    T("Nomi che parlano", [
      "Un buon nome dice **cliente, progetto, tipo e versione**: *Pizzeria_Spot30s_v3*. Mai *finale*, *finale2*, *finale_DAVVERO*: dopo una settimana nessuno sa qual è quello giusto.",
      "Il numero di **versione** cresce a ogni consegna al cliente.",
    ]),
    Q("Quale nome di sequenza è il migliore?", ["finale_definitivo2", "Pizzeria_Spot30s_v3", "Sequenza 01", "aaa"], 1, "Cliente, formato e versione: chiaro per sempre."),
    T("Una struttura che si ripete", [
      "Ogni progetto con le stesse cartelle: **01_Video**, **02_Audio**, **03_Grafica**, **04_Export**. Ritrovi tutto anche dopo anni.",
    ]),
    Q("Perché usare sempre la stessa struttura di cartelle?", ["Per ritrovare tutto subito in ogni progetto", "Per occupare meno spazio", "È obbligatorio", "Non serve"], 0, "L'abitudine fa risparmiare tempo e errori."),
    pr(
      "Rinomina e ordina",
      "Rinomina la sequenza in **Pizzeria_Spot_v1** (doppio clic sul nome nel pannello Progetto) e crea un bin **Export**.",
      () => prSetup({ name: "Sequenza 01", clips: [{ media: "s-citta", at: 0, from: 0, to: 5 }] }),
      [
        { label: "Sequenza **…_v1**", test: (s) => sequences(s).some((q) => /_v1$/i.test(q.name)) || s.project.items.some((i) => i.type === "sequence" && /_v1$/i.test(i.name)) },
        { label: "Bin **Export**", test: (s) => !!bin(s, /export/i) },
      ],
    ),
  ]),
  L("backup", "Backup", "La regola del 3-2-1.", [
    T("La regola del 3-2-1", [
      "**3** copie dei dati, su **2** supporti diversi, di cui **1** fuori sede (cloud o un disco a casa di qualcun altro). I dischi si rompono: è solo questione di quando.",
      "Il girato originale è la cosa più preziosa: senza, il progetto non si può rifare.",
    ]),
    Q("Cosa significa il \"1\" della regola 3-2-1?", ["Una copia fuori sede", "Un solo disco", "Un backup all'anno", "Un file"], 0, "Se la casa o l'ufficio ha un problema, quella copia si salva."),
    T("Salvare spesso", [
      "**Ctrl+S** ogni pochi minuti, e **Salva con nome** con una nuova versione prima dei cambiamenti grossi. Premiere fa anche salvataggi automatici nella cartella *Auto-Save*.",
    ]),
    Q("Prima di una modifica drastica cosa conviene fare?", ["Salvare una nuova versione del progetto", "Chiudere senza salvare", "Cancellare il girato", "Niente"], 0, "Così puoi tornare indietro in qualsiasi momento."),
    pr(
      "Versione e salvataggio",
      "Fai una modifica (taglia la clip con **Ctrl+K**), rinomina la sequenza in **…_v2** e **salva** con **Ctrl+S**.",
      () => prSetup({ name: "Spot_v1", clips: [{ media: "s-drone", at: 0, from: 0, to: 8 }] }),
      [
        { label: "Una modifica fatta", test: (s) => s.past.length > 0 },
        { label: "Sequenza **…_v2**", test: (s) => sequences(s).some((q) => /_v2$/i.test(q.name)) || s.project.items.some((i) => i.type === "sequence" && /_v2$/i.test(i.name)) },
        { label: "Progetto **salvato**", test: (s) => s.saved && s.past.length > 0 },
      ],
    ),
  ]),
  L("collaborazione", "Collaborazione", "Revisioni e commenti con il cliente.", [
    T("Le revisioni", [
      "Il cliente guarda una **copia di revisione** e lascia **commenti con il timecode** (\"a 00:00:12 togliere la scritta\"). Strumenti come Frame.io collegano i commenti direttamente alla timeline.",
      "Ogni giro di correzioni è una **revisione**: nel preventivo si stabilisce quante sono incluse (di solito 2).",
    ]),
    Q("Perché i commenti devono avere il timecode?", ["Per sapere esattamente dove intervenire", "Per allungare il video", "Per il colore", "Non serve"], 0, "\"Il pezzo a metà\" è vago; 00:00:12:05 no."),
    T("I marker come promemoria", [
      "Trasforma ogni commento in un **marker** nella timeline con il testo nel campo **Commenti** (doppio clic sul marker). Poi li risolvi uno a uno.",
    ]),
    Q("Come trasformi un commento del cliente in un promemoria in timeline?", ["Con un marker con commento", "Con una transizione", "Con una nuova sequenza", "Non si può"], 0, "Doppio clic sul marker → Commenti."),
    pr(
      "Annota le correzioni",
      "Il cliente ha chiesto due modifiche. Aggiungi **2 marker** e scrivi un **commento** in ciascuno (doppio clic sul marker).",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 10 }] }),
      [
        { label: "Almeno **2 marker**", test: (s) => (prSeq(s)?.markers.length ?? 0) >= 2 },
        { label: "Con un **commento** scritto", test: (s) => (prSeq(s)?.markers.filter((m) => m.comment.trim().length > 2).length ?? 0) >= 2 },
      ],
    ),
  ]),
  L("consegna-cliente", "Consegna al cliente", "Scadenze, revisioni e fatturazione.", [
    T("Prima di iniziare", [
      "Un **preventivo** chiaro evita litigi: cosa farai, entro quando, **quante revisioni**, in che formati consegni, e il prezzo (con acconto, spesso il 30–50%).",
      "Le revisioni extra si pagano a parte: scrivilo prima.",
    ]),
    Q("Cosa deve contenere un preventivo?", ["Lavoro, scadenze, revisioni incluse, formati e prezzo", "Solo il prezzo", "Solo la data", "Niente, basta la parola"], 0, "Tutto per iscritto: è una tutela per entrambi."),
    T("La copia di revisione", [
      "Per le revisioni si manda una copia **leggera** (720p, bitrate basso) con il **timecode impresso** (effetto *Codice temporale*): il cliente può citare il punto esatto e non può usare il video senza averlo pagato.",
    ]),
    Q("Perché imprimere il timecode sulla copia di revisione?", ["Per citare i punti esatti e proteggere il lavoro", "Per bellezza", "Per alzare la qualità", "Per il colore"], 0, "Doppio vantaggio: precisione e protezione."),
    pr(
      "Copia di revisione",
      "Prepara la copia per il cliente: applica l'effetto **Codice temporale** (Video) a una clip, poi esporta in **H.264** a **1280×720** con bitrate **≤ 5 Mbps**.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 5 }, { media: "s-intervista", at: 5, from: 0, to: 5 }] }),
      [
        { label: "**Codice temporale** impresso", test: (s) => vClips(s).some((c) => c.effects.some((e) => e.defId === "timecode")) || vClips(s, 2).some((c) => c.effects.some((e) => e.defId === "timecode")) },
        { label: "Export **1280×720** H.264", test: (s) => s.lastExport?.format === "H.264" && s.lastExport.width === 1280 && s.lastExport.height === 720 },
        { label: "Bitrate ≤ **5 Mbps**", test: (s) => !!s.lastExport && s.lastExport.bitrateMbps <= 5 },
      ],
      "Ancora meglio: metti il Codice temporale su un **livello di regolazione** su V2, così vale per tutta la sequenza.",
    ),
  ]),

  // ---------------- Unità 19 · Video per i social ----------------
  L("verticale", "Il formato 9:16", "Reinquadrare un video orizzontale.", [
    T("Da orizzontale a verticale", [
      "Per portare un video 16:9 in 9:16 si crea una sequenza **1080×1920** e si **ingrandisce** la clip (scala ~178%) finché riempie lo schermo. Poi si **reinquadra**: si sposta l'immagine perché il soggetto resti al centro.",
      "Premiere ha anche **Reinquadratura automatica**, che segue il soggetto da sola.",
    ]),
    Q("Che scala serve per riempire un 1080×1920 con un video 1920×1080?", ["Circa 100%", "Circa 178%", "Circa 50%", "Circa 300%"], 1, "1920 / 1080 ≈ 1,78: bisogna ingrandire l'altezza fino a 1920."),
    T("Seguire il soggetto", [
      "Se il soggetto si muove, anima la **Posizione** con qualche keyframe: è una reinquadratura manuale, più precisa di quella automatica.",
    ]),
    Q("Il soggetto esce dal riquadro verticale. Cosa animi?", ["La Posizione", "Il volume", "La durata", "La saturazione"], 0, "Sposti l'immagine dentro il riquadro."),
    pr(
      "Reinquadra in verticale",
      "Crea una sequenza **1080×1920**, mettici l'**intervista**, scalala ad almeno **175%** e anima la **Posizione** con almeno **2 keyframe** per tenere il volto al centro.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 10 }] }),
      [
        { label: "Sequenza **1080×1920** con l'intervista", test: (s) => sequences(s).some((q) => q.width === 1080 && q.height === 1920 && q.clips.some((c) => c.mediaId === "s-intervista")) },
        { label: "Scala ≥ **175%**", test: (s) => sequences(s).some((q) => q.width === 1080 && q.clips.some((c) => c.mediaId === "s-intervista" && scaleOf(c) >= 175)) },
        { label: "Posizione animata", test: (s) => sequences(s).some((q) => q.width === 1080 && q.clips.some((c) => c.mediaId === "s-intervista" && (c.motion.position.keys?.length ?? 0) >= 2)) },
      ],
    ),
  ]),
  L("hook", "L'hook dei primi 3 secondi", "Agganciare chi guarda subito.", [
    T("Tre secondi per convincere", [
      "Sui social la gente decide in **1–3 secondi** se restare. I primi istanti devono avere **movimento**, una **domanda** o una **promessa** (\"Ecco come ho…\"), e spesso una scritta grande.",
      "Mai iniziare con loghi lenti, saluti o panorami fermi.",
    ]),
    Q("Quale apertura funziona meglio per un Reel?", ["Un logo che gira per 5 secondi", "L'azione più spettacolare con una scritta", "Un panorama fermo", "\"Ciao a tutti, oggi…\" lentamente"], 1, "Il meglio subito: chi scorre deve fermarsi."),
    T("Il trucco del \"flash forward\"", [
      "Prendi il momento migliore del video e **mettilo all'inizio** come anteprima, poi riparti dal principio: lo spettatore resta per vedere come ci si arriva.",
    ]),
    Q("Cos'è un flash forward in apertura?", ["Mostrare all'inizio il momento migliore", "Un tipo di LUT", "Un effetto audio", "Una transizione"], 0, "Una promessa visiva di ciò che arriverà."),
    pr(
      "Un'apertura che aggancia",
      "Questo video inizia con 5 secondi di tramonto fermo. Metti **all'inizio** una clip dinamica (la **città** o il **drone**) lunga **≤ 3 s** e aggiungi una **scritta** che compaia entro il primo secondo.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 5 }, { media: "s-intervista", at: 5, from: 0, to: 6 }, { media: "s-citta", at: 11, from: 0, to: 4, a: null }] }),
      [
        { label: "Si apre con la città o il drone", test: (s) => ["s-citta", "s-drone"].includes(vClips(s)[0]?.mediaId ?? "") },
        { label: "Prima clip ≤ **3 s**", test: (s) => !!vClips(s)[0] && clipDur(vClips(s)[0]) <= 3.05 },
        { label: "Scritta entro il primo secondo", test: (s) => graphicLayers(s).some(({ clip }) => clip.start <= 1) },
      ],
    ),
  ]),
  L("sottotitoli-dinamici", "Sottotitoli dinamici", "Parole evidenziate a ritmo.", [
    T("Lo stile dei creator", [
      "I **sottotitoli dinamici** mostrano **poche parole alla volta** (1–3), grandi, al centro, con la parola chiave **colorata** e un piccolo **pop** di scala a ogni entrata.",
      "Tengono gli occhi incollati allo schermo e funzionano anche senza audio.",
    ]),
    Q("Quante parole alla volta in un sottotitolo dinamico?", ["1–3", "Tutta la frase", "Un paragrafo", "Nessuna"], 0, "Poche e grandi, a ritmo con la voce."),
    T("Evidenziare", [
      "La parola più importante della frase prende il **colore** del brand (giallo, verde…) o una dimensione maggiore. Le altre restano bianche con contorno.",
    ]),
    Q("Come evidenzi la parola chiave?", ["Con un colore diverso o più grande", "Nascondendola", "In grigio piccolo", "Non si evidenzia"], 0, "Il colore guida l'attenzione."),
    ae(
      "Parole che saltano fuori",
      "Ci sono 3 parole. Dai a **tutte** un pop di **Scala** (da ~0 a 100) e colora **una** parola di un colore diverso dal bianco (pannello **Carattere**).",
      () =>
        aeSetup({
          w: 1080,
          h: 1920,
          layers: (c, m) => [
            aeLayer("text", c, { name: "PIÙ", text: "PIÙ", transform: { ...aeLayer("text", c).transform, position: prop(540, 1000) } }),
            aeLayer("text", c, { name: "MONTI", text: "MONTI", transform: { ...aeLayer("text", c).transform, position: prop(540, 1150) } }),
            aeLayer("text", c, { name: "IMPARI", text: "IMPARI", transform: { ...aeLayer("text", c).transform, position: prop(540, 1300) } }),
            aeLayer("footage", c, { transform: { ...aeLayer("footage", c, {}, m["s-green"]).transform, scale: prop(178, 178) } }, m["s-green"]),
          ],
        }),
      [
        { label: "Pop di Scala su tutte e 3", test: (s) => aeLayers(s).filter((l) => l.type === "text" && aeKeys(l, "t.scale").length >= 2 && Math.min(...aeKeys(l, "t.scale").map((k) => k.v[0])) <= 10).length >= 3 },
        { label: "Una parola **colorata**", test: (s) => aeLayers(s).some((l) => l.type === "text" && (l.textStyle?.color ?? "#ffffff").toLowerCase() !== "#ffffff") },
      ],
    ),
  ]),
  L("ritmo-reel", "Il ritmo di un reel", "Tagli veloci sulla musica.", [
    T("Veloce, ma non a caso", [
      "Un reel dinamico cambia inquadratura ogni **0,5–1,5 secondi**, ma **sui battiti** della musica: il ritmo deve sentirsi, non essere confuso.",
      "Varia la durata: qualche taglio velocissimo, poi un'inquadratura che respira, poi di nuovo veloce.",
    ]),
    Q("Ogni quanto si taglia di solito in un reel dinamico?", ["0,5–1,5 secondi", "10 secondi", "1 minuto", "Mai"], 0, "Veloce ma leggibile."),
    T("Prima i marker", [
      "Segna i battiti con **M** durante la riproduzione, poi monta agganciandoti ai marker. È lo stesso metodo della lezione sul ritmo, solo più veloce.",
    ]),
    Q("Qual è il modo più rapido per tagliare a tempo?", ["Marker sui battiti + snapping", "Andare a occhio", "Tagli casuali", "Un tutorial di 2 ore"], 0, "La griglia di marker fa metà del lavoro."),
    pr(
      "Reel a tempo",
      "I marker sono sui battiti (ogni 0,8 s). Monta **almeno 6 pezzi** su V1, ognuno di **≤ 1,3 s**, senza buchi, con almeno **4 tagli** sui marker.",
      () =>
        prSetup({
          clips: [
            { media: "s-citta", at: 0, from: 0, to: 4, a: null },
            { media: "s-drone", at: 4, from: 0, to: 4 },
            { media: "s-musica", at: 0, from: 0, to: 8, v: null, a: 1 },
          ],
          markers: Array.from({ length: 9 }, (_, i) => ({ t: 0.8 * (i + 1), name: "Beat" })),
        }),
      [
        { label: "Almeno **6 pezzi**", test: (s) => vClips(s).length >= 6 },
        { label: "Ognuno ≤ **1,3 s**", test: (s) => vClips(s).length >= 6 && vClips(s).every((c) => clipDur(c) <= 1.35) },
        { label: "Nessun buco", test: (s) => noGaps(s) },
        { label: "**4+ tagli** sui marker", test: (s) => Array.from({ length: 9 }, (_, i) => 0.8 * (i + 1)).filter((t) => cutNear(s, t, 0.08)).length >= 4 },
      ],
      "Lama (**C**) su ogni marker, poi elimina con increspatura i pezzi in eccesso.",
    ),
  ]),
  L("thumbnail", "La miniatura", "La copertina che fa cliccare.", [
    T("La copertina vende il video", [
      "Su YouTube la **miniatura** decide se qualcuno clicca. Regole: **volto** espressivo, **poche parole** (max 3–4) **grandissime**, colori **contrastati**, leggibile anche piccolissima.",
      "Formato: **1280×720** (16:9).",
    ]),
    Q("Quante parole al massimo su una buona miniatura?", ["3–4", "20", "Un paragrafo", "Nessun limite"], 0, "Deve leggersi in un attimo, anche dal telefono."),
    T("Testo che si stacca", [
      "Il testo ha un **contorno** spesso o un'**ombra** forte, così si legge su qualsiasi sfondo. Il giallo, il bianco e il rosso sono i classici.",
    ]),
    Q("Che dimensione ha una miniatura di YouTube?", ["1280×720", "500×500", "1080×1920", "4000×4000"], 0, "16:9 a 1280×720."),
    ae(
      "Crea la miniatura",
      "Crea una comp **1280×720** chiamata **Miniatura** e mettici un **testo** grande (dimensione ≥ **120**) con **contorno** o **ombra** attivi (pannello Carattere).",
      () => aeSetup({ noComp: true, media: ["s-green", "s-tramonto", "s-logo"] }),
      [
        { label: "Comp **1280×720**", test: (s) => allComps(s).some((c) => c.width === 1280 && c.height === 720) },
        { label: "Testo grande (≥ 120)", test: (s) => allComps(s).some((c) => c.width === 1280 && c.layers.some((l) => l.type === "text" && (l.textStyle?.size ?? 0) >= 120)) },
        { label: "Con contorno o ombra", test: (s) => allComps(s).some((c) => c.layers.some((l) => l.type === "text" && (l.textStyle?.stroke.on || l.textStyle?.shadow.on))) },
      ],
    ),
  ]),

  // ---------------- Unità 20 · Progetto finale ----------------
  L("brief", "Il brief", "Capire cosa vuole davvero il cliente.", [
    T("Le domande giuste", [
      "Il **brief** è il documento (o la chiacchierata) in cui il cliente spiega cosa vuole. Il tuo lavoro è fare le domande giuste: **obiettivo** del video, **pubblico**, **dove** verrà pubblicato, **durata**, **stile** (con esempi!), **scadenza**, **budget**.",
      "Un brief vago produce un video sbagliato e tante revisioni.",
    ]),
    Q("Quale domanda NON è essenziale in un brief?", ["Dove verrà pubblicato il video", "Il pubblico", "Il colore preferito della tua mascotte", "La scadenza"], 2, "Le altre cambiano formato, stile e tempi."),
    T("Il nostro brief", [
      "**Cliente**: Pizzeria da Squeak. **Obiettivo**: far venire gente il sabato sera. **Dove**: feed di Instagram (**4:5**, 1080×1350). **Durata**: 15–30 s. **Stile**: caldo, veloce, invitante. **Scadenza**: venerdì.",
    ]),
    Q("Il video andrà nel feed di Instagram in 4:5. Che sequenza crei?", ["1080×1350", "1920×1080", "1080×1920", "1280×720"], 0, "4:5 = 1080 di larghezza per 1350 di altezza."),
    pr(
      "Imposta il progetto dal brief",
      "Crea la sequenza per il brief: **1080×1350**, **30 fps**, chiamata **Spot_Pizzeria**.",
      () => prSetup({ noSequence: true }),
      [
        { label: "Sequenza **1080×1350**", test: (s) => sequences(s).some((q) => q.width === 1080 && q.height === 1350) },
        { label: "A **30 fps** (o 29,97)", test: (s) => sequences(s).some((q) => q.width === 1080 && q.height === 1350 && (near(q.fps, 30, 0.05) || near(q.fps, 29.97, 0.05))) },
        { label: "Nome **Spot_Pizzeria**", test: (s) => sequences(s).some((q) => /spot_pizzeria/i.test(q.name)) },
      ],
    ),
  ]),
  L("selezione", "Selezione del girato", "Scegliere le riprese migliori.", [
    T("Guardare tutto, tenere poco", [
      "Prima di montare si **guarda tutto** il girato e si scelgono le parti migliori: a fuoco, ben esposte, con l'azione giusta. Di solito si usa il **10–20%** di quello che si è girato.",
      "Si mettono le scelte in un bin **Selezione** e si segnano con I/O o marker i momenti buoni.",
    ]),
    Q("Che percentuale del girato finisce di solito nel montaggio?", ["10–20%", "100%", "90%", "1%"], 0, "Si gira tanto per scegliere il meglio."),
    T("Cosa scartare", [
      "Fuori fuoco, mosso, sovraesposto, persone che guardano in camera per sbaglio, audio rovinato. E le riprese doppie: tieni solo la migliore.",
    ]),
    Q("Quale ripresa scarti per prima?", ["Quella fuori fuoco", "Quella con l'azione migliore", "Quella ben esposta", "Il dettaglio più bello"], 0, "Il fuoco non si recupera."),
    pr(
      "Il bin delle scelte",
      "Crea un bin **Selezione** e mettici dentro le **3 clip** migliori per uno spot di cibo (suggerimento: caffè, città e intervista).",
      () => prSetup({ noSequence: true }),
      [
        { label: "Bin **Selezione**", test: (s) => !!bin(s, /selezione/i) },
        { label: "Almeno **3 clip** dentro", test: (s) => inBin(s, /selezione/i).filter((i) => i.type === "media").length >= 3 },
        { label: "C'è il **caffè**", test: (s) => inBin(s, /selezione/i).some((i) => i.ref === "s-caffe") },
      ],
    ),
  ]),
  L("assemblaggio", "Assemblaggio", "Il primo montaggio grezzo.", [
    T("Il rough cut", [
      "L'**assemblaggio** (rough cut) mette in fila le scelte nell'ordine della storia, **senza preoccuparsi dei dettagli**. Serve a vedere se la struttura funziona.",
      "È normale che sia troppo lungo: si accorcia dopo.",
    ]),
    Q("A cosa serve il primo montaggio grezzo?", ["A verificare la struttura della storia", "A fare il colore", "A esportare il master", "A mixare l'audio"], 0, "Prima la struttura, poi i dettagli."),
    T("Struttura di uno spot", [
      "**Gancio** (immagine forte) → **problema/desiderio** (sabato sera, che fame) → **soluzione** (la pizzeria, il cibo) → **invito** (vieni!).",
    ]),
    Q("Qual è l'ultima parte di uno spot?", ["L'invito all'azione", "Il gancio", "Il problema", "I titoli di testa"], 0, "Dire allo spettatore cosa fare: \"Prenota ora\"."),
    pr(
      "Monta il grezzo",
      "Assembla lo spot: almeno **4 clip diverse** su V1 senza buchi, la **musica** su A2 sotto tutto il video, durata totale tra **15** e **30 s**.",
      () => prSetup({ name: "Spot_Pizzeria", clips: [] }),
      [
        { label: "Almeno **4 clip diverse** su V1", test: (s) => new Set(vClips(s).map((c) => c.mediaId)).size >= 4 },
        { label: "Nessun buco", test: (s) => noGaps(s) },
        { label: "Musica sotto il video", test: (s) => clipsOf(s, "s-musica").some((c) => c.start <= 0.5) },
        { label: "Durata **15–30 s**", test: (s) => { const v = vClips(s); const end = v.length ? Math.max(...v.map((c) => c.start + clipDur(c))) : 0; return end >= 15 && end <= 30; } },
      ],
    ),
  ]),
  L("fine-cut", "Dal rough cut al fine cut", "Rifinire ritmo e storia.", [
    T("Togliere, togliere, togliere", [
      "Dal grezzo al **fine cut** si lavora soprattutto **togliendo**: ogni inquadratura deve durare solo quanto serve. Se una scena non aggiunge niente, via.",
      "Si sistemano i **tagli** (raccordi, J/L-cut), si chiudono i **buchi**, si controlla il **ritmo**.",
    ]),
    Q("Qual è l'attività principale nel passaggio al fine cut?", ["Togliere il superfluo", "Aggiungere effetti", "Allungare le scene", "Cambiare formato"], 0, "Il montaggio migliore è spesso quello più corto."),
    T("Guardarlo da spettatore", [
      "Riguarda il montaggio dall'inizio senza fermarti, come farebbe lo spettatore. Dove ti annoi, taglia. Dove non capisci, aggiungi.",
    ]),
    Q("Riguardando il video ti annoi a metà. Cosa fai?", ["Accorci quella parte", "Aggiungi una transizione a cubo", "Alzi la musica", "Niente"], 0, "La noia è il segnale per tagliare."),
    pr(
      "Rifinisci il grezzo",
      "Questo grezzo ha buchi e inquadrature troppo lunghe. Rendilo un fine cut: **nessun buco**, ogni clip **≤ 4 s**, durata totale **≤ 16 s**.",
      () => roughCut(),
      [
        { label: "Nessun buco", test: (s) => noGaps(s) },
        { label: "Ogni clip ≤ **4 s**", test: (s) => vClips(s).length >= 3 && vClips(s).every((c) => clipDur(c) <= 4.05) },
        { label: "Durata ≤ **16 s**", test: (s) => seqLength(s) <= 16.05 && seqLength(s) > 4 },
      ],
      "Rifila ogni clip con lo strumento **Increspatura (B)**: accorci e i buchi si chiudono da soli.",
    ),
  ]),
  L("finalizzazione", "Colore, audio ed export", "Chiudere e consegnare il progetto.", [
    T("L'ultimo miglio", [
      "Il **finishing**: correzione e look del colore (**coerenti** su tutte le clip), mix dell'audio (voce chiara, musica sotto, niente picchi oltre **−1 dB**), titoli controllati, e **export** nel formato del brief.",
      "Prima di consegnare: riguarda **tutto** una volta, con le cuffie.",
    ]),
    Q("Prima di consegnare, cosa fai sempre?", ["Riguardo tutto con le cuffie", "Niente, consegno subito", "Cancello il progetto", "Cambio il formato"], 0, "L'ultimo controllo salva da errori imbarazzanti."),
    T("Il pacchetto di consegna", [
      "Al cliente: il file **finale** (H.264 per i social), eventualmente un **master** di alta qualità e, se previsto, le versioni nei vari formati (9:16, 1:1).",
    ]),
    Q("Cosa contiene di solito la consegna al cliente?", ["Il file finale ed eventuali versioni e master", "Solo il progetto di Premiere", "Il girato grezzo", "Niente"], 0, "Ciò che è stato concordato nel preventivo."),
    pr(
      "Colore e audio",
      "Ultimi ritocchi: applica **Lumetri Color** ad almeno **2 clip** (con un **Contrasto** ≥ **+10**) e porta la **musica** tra **−22** e **−14 dB**.",
      () =>
        prSetup({
          name: "Spot_Pizzeria",
          clips: [
            { media: "s-citta", at: 0, from: 0, to: 3, a: null },
            { media: "s-caffe", at: 3, from: 0, to: 3 },
            { media: "s-intervista", at: 6, from: 0, to: 5 },
            { media: "s-musica", at: 0, from: 0, to: 11, v: null, a: 2 },
          ],
        }),
      [
        { label: "Lumetri su **2+ clip** (contrasto ≥ +10)", test: (s) => vClips(s).filter((c) => lum(c, "contrast") >= 10).length >= 2 },
        { label: "Musica **−22…−14 dB**", test: (s) => clipsOf(s, "s-musica").length > 0 && clipsOf(s, "s-musica").every((c) => { const v = clipVolumeAt(c, c.start + 1); return v >= -22 && v <= -14; }) },
      ],
    ),
    pr(
      "Consegna!",
      "Esporta lo spot finito per il feed: **H.264**, **1080×1350**, bitrate tra **8** e **20 Mbps**. Complimenti: hai finito il corso!",
      () =>
        prSetup({
          name: "Spot_Pizzeria",
          w: 1080,
          h: 1350,
          fps: 30,
          clips: [
            { media: "s-citta", at: 0, from: 0, to: 3, a: null, patch: (c) => ({ ...c, motion: { ...c.motion, scale: prop(125) } }) },
            { media: "s-caffe", at: 3, from: 0, to: 3, patch: (c) => ({ ...c, motion: { ...c.motion, scale: prop(125) } }) },
            { media: "s-intervista", at: 6, from: 0, to: 5, patch: (c) => ({ ...c, motion: { ...c.motion, scale: prop(125) } }) },
            { media: "s-musica", at: 0, from: 0, to: 11, v: null, a: 2, patch: { volume: prop(-18) } },
          ],
        }),
      [
        { label: "**H.264**", test: (s) => s.lastExport?.format === "H.264" },
        { label: "**1080×1350**", test: (s) => s.lastExport?.width === 1080 && s.lastExport?.height === 1350 },
        { label: "Bitrate **8–20 Mbps**", test: (s) => !!s.lastExport && s.lastExport.bitrateMbps >= 8 && s.lastExport.bitrateMbps <= 20 },
      ],
      "Nell'export usa **Corrispondenza sorgente** o scrivi a mano larghezza e altezza.",
    ),
    M("Abbina", [
      ["Brief", "Cosa vuole il cliente"],
      ["Rough cut", "Prima struttura"],
      ["Fine cut", "Ritmo rifinito"],
      ["Consegna", "File finali al cliente"],
    ]),
  ]),
];
