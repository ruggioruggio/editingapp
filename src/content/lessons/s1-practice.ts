import type { Lesson, LessonStep, MatchStep, QuizStep, StudioStep, TheoryStep } from "@/lib/lessons/types";
import { prop, uid, type Key } from "@/lib/studio/anim";
import { clipDur, clipEnd, type Clip, type PrState } from "@/lib/studio/premiere";
import {
  aeLayer,
  aeSetup,
  allClips,
  animated,
  anyEased,
  anyFx,
  clipsOf,
  clipVolumeAt,
  cutNear,
  hasTransition,
  isVideo,
  key,
  keyCount,
  markerCount,
  noGaps,
  prSeq,
  prSetup,
  seqLength,
  vClips,
  videoClips,
} from "@/lib/lessons/studioKit";

// Esercizi nel simulatore (e schermate in più) per le lezioni della
// sezione 1: almeno un esercizio per lezione, spesso due, sempre più
// impegnativi man mano che si avanza nel corso.

export type Extra = { mid?: LessonStep[]; end: LessonStep[] };
type PrStep = Extract<StudioStep, { app: "premiere" }>;
type AeStep = Extract<StudioStep, { app: "ae" }>;

export const pr = (title: string, instructions: string, setup: PrStep["setup"], goals: PrStep["goals"], hint?: string): StudioStep => ({ kind: "studio", app: "premiere", title, instructions, setup, goals, hint });
export const ae = (title: string, instructions: string, setup: AeStep["setup"], goals: AeStep["goals"], hint?: string): StudioStep => ({ kind: "studio", app: "ae", title, instructions, setup, goals, hint });
export const T = (title: string, body: string[], extra: Pick<TheoryStep, "terms" | "tip"> = {}): TheoryStep => ({ kind: "theory", title, body, ...extra });
export const Q = (question: string, options: string[], correctIndex: number, explanation: string): QuizStep => ({ kind: "quiz", question, options, correctIndex, explanation });
export const M = (title: string, pairs: [string, string][]): MatchStep => ({ kind: "match", title, pairs });

export const near = (a: number, b: number, tol = 0.3) => Math.abs(a - b) <= tol;
export const music = (s: PrState) => clipsOf(s, "s-musica");
export const voice = (s: PrState) => clipsOf(s, "s-intervista").filter((c) => !isVideo(s, c));
/** Clip del logo (sopra al video) */
export const logo = (s: PrState) => clipsOf(s, "s-logo");
export const keysOf = (c: Clip, which: "position" | "scale" | "rotation") => c.motion[which].keys ?? [];
export const linearKeys = (pairs: [number, number[]][]): Key[] => pairs.map(([t, v]) => ({ id: uid("k"), t, v, easeIn: false, easeOut: false, hold: false }));
/** Logo piccolo sopra al drone, per gli esercizi di movimento. */
export const logoOverDrone = (patch?: (c: Clip) => Clip) => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 6 }, { media: "s-logo", at: 0, from: 0, to: 6, v: 2, a: null, patch: (c) => (patch ?? ((x) => x))({ ...c, motion: { ...c.motion, scale: prop(40) } }) }] });

export const S1_PRACTICE: Record<string, Extra> = {
  // ---------------- Unità 1 ----------------
  "crea-sequenza": {
    mid: [
      T("I formati che userai di più", [
        "**16:9** (1920×1080 o 3840×2160): YouTube, TV, cinema domestico.",
        "**9:16** (1080×1920): Reels, TikTok e Shorts. **1:1** (1080×1080) e **4:5** (1080×1350): post nel feed.",
        "La regola d'oro: crea la sequenza nel formato **in cui verrà guardato** il video, non in quello in cui è stato girato.",
      ]),
      Q("Devi montare un Reel di Instagram. Che sequenza crei?", ["1920×1080", "1080×1920", "1080×1080", "3840×2160"], 1, "I Reel sono verticali 9:16: 1080 di larghezza e 1920 di altezza."),
    ],
    end: [
      pr(
        "Ora nel Premiere vero",
        "Crea una sequenza **verticale 1080×1920 a 25 fps** per i social, dal menu **File → Nuovo → Sequenza** (o **Ctrl+N**).",
        () => prSetup({ noSequence: true }),
        [
          { label: "Apri la finestra **Nuova sequenza**", test: (s) => s.dialog?.type === "sequence" || Object.keys(s.project.sequences).length > 0 },
          { label: "Sequenza **1080×1920**", test: (s) => Object.values(s.project.sequences).some((q) => q.width === 1080 && q.height === 1920) },
          { label: "Base temporale **25 fps**", test: (s) => Object.values(s.project.sequences).some((q) => q.width === 1080 && q.height === 1920 && Math.abs(q.fps - 25) < 0.01) },
        ],
        "Nella finestra vai sulla scheda **Impostazioni**, scegli **Modalità di modifica: Personalizzato** e scrivi 1080 come larghezza e 1920 come altezza.",
      ),
    ],
  },
  "primo-taglio": {
    end: [
      pr(
        "La papera, nel Premiere vero",
        "Nell'intervista c'è una papera tra **4 s** e **6 s** (i marker). Tagliala via con la **Lama (C)** e cancellala con **Elimina con increspatura (Maiusc+Canc)**: niente buchi.",
        () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 10 }], markers: [{ t: 4, name: "Inizio papera" }, { t: 6, name: "Fine papera" }] }),
        [
          { label: "La papera (4–6 s) non c'è più", test: (s) => !vClips(s).some((c) => c.in < 5.5 && c.out > 4.5) && vClips(s).length >= 1 },
          { label: "Nessun buco su V1", test: (s) => noGaps(s) },
          { label: "Il video ora dura circa **8 s**", test: (s) => near(seqLength(s), 8, 0.35) },
        ],
        "Premi **C**, clicca sulla clip a 4 s e a 6 s (gli agganci ai marker aiutano). Poi **V**, clicca il pezzo in mezzo e premi **Maiusc+Canc**.",
      ),
    ],
  },
  importare: {
    mid: [Q("Qual è il modo più veloce per creare un nuovo bin?", ["Ctrl+B", "Ctrl+N", "Ctrl+I", "Ctrl+K"], 0, "B come Bin. Ctrl+N crea una sequenza, Ctrl+K taglia.")],
    end: [
      pr(
        "Metti in ordine il progetto",
        "Nel pannello **Progetto** crea un nuovo raccoglitore chiamato **Interviste** e trascinaci dentro **A001_Intervista.mp4**.",
        () => prSetup({ noSequence: true }),
        [
          { label: "Esiste un bin **Interviste**", test: (s) => s.project.items.some((i) => i.type === "bin" && /interviste/i.test(i.name)) },
          {
            label: "**A001_Intervista** è dentro il bin",
            test: (s) => {
              const bin = s.project.items.find((i) => i.type === "bin" && /interviste/i.test(i.name));
              return !!bin && s.project.items.some((i) => i.ref === "s-intervista" && i.parent === bin.id);
            },
          },
        ],
        "Clic destro nel pannello Progetto → **Nuovo raccoglitore** (o **Ctrl+B**), rinominalo con doppio clic sul nome, poi trascina la clip sopra al bin.",
      ),
    ],
  },
  monitor: {
    mid: [
      T("Il pulsante Inserisci del monitor", [
        "Sotto il Monitor sorgente ci sono i pulsanti **Inserisci** e **Sovrascrivi**: mandano in timeline la clip (o il pezzo tra I e O) nel punto dell'indicatore.",
        "Puoi anche **trascinare l'immagine** del Monitor sorgente direttamente in timeline.",
      ]),
    ],
    end: [
      pr(
        "Usa i due monitor",
        "Fai **doppio clic** su **B-roll_Citta.mp4** nel pannello Progetto per aprirla nel **Monitor sorgente**. Poi sposta l'indicatore del **Monitor programma** oltre i **5 secondi**.",
        () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 10 }] }),
        [
          { label: "La città è nel **Monitor sorgente**", test: (s) => s.source.mediaId === "s-citta" },
          { label: "Indicatore del programma oltre **5 s**", test: (s) => !!s.activeSeq && (s.playheads[s.activeSeq] ?? 0) >= 5 },
        ],
        "Il timecode blu del Monitor programma mostra dove sei: trascina l'indicatore nella timeline o premi **→** più volte.",
      ),
    ],
  },
  "in-out": {
    mid: [Q("Hai segnato I a 2 s e O a 6 s. Quanto dura il pezzo che entra in timeline?", ["2 secondi", "4 secondi", "6 secondi", "8 secondi"], 1, "Entra solo la parte tra attacco e stacco: 6 − 2 = 4 secondi.")],
    end: [
      pr(
        "Prendi solo il pezzo buono",
        "L'intervista è già nel **Monitor sorgente**. Segna l'**attacco (I)** a circa **2 s** e lo **stacco (O)** a circa **6 s**, poi mandala in timeline con **Inserisci (,)**.",
        () => prSetup({ clips: [], source: "s-intervista" }),
        [
          { label: "Attacco a circa **2 s**", test: (s) => s.source.in !== null && near(s.source.in, 2, 0.5) },
          { label: "Stacco a circa **6 s**", test: (s) => s.source.out !== null && near(s.source.out, 6, 0.5) },
          { label: "In timeline c'è solo il pezzo 2–6 s", test: (s) => vClips(s).some((c) => c.mediaId === "s-intervista" && near(c.in, 2, 0.5) && near(c.out, 6, 0.5)) },
        ],
        "Sposta l'indicatore del Monitor sorgente a 2 s e premi **I**, poi a 6 s e premi **O**. Infine premi **,** (virgola).",
      ),
    ],
  },
  "inserisci-sovrascrivi": {
    end: [
      pr(
        "Inserisci nel mezzo",
        "Metti l'indicatore a **4 s** (tra tramonto e drone), apri **B-roll_Caffe** nel monitor sorgente e **inseriscila (,)**: il drone deve spostarsi in avanti.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 4 }, { media: "s-drone", at: 4, from: 0, to: 4 }] }),
        [
          { label: "Il caffè parte a **4 s** su V1", test: (s) => vClips(s).some((c) => c.mediaId === "s-caffe" && near(c.start, 4, 0.25)) },
          { label: "Il drone è stato spinto avanti", test: (s) => vClips(s).some((c) => c.mediaId === "s-drone" && c.start > 4.5) },
          { label: "Niente è stato cancellato", test: (s) => vClips(s).some((c) => c.mediaId === "s-tramonto") && vClips(s).some((c) => c.mediaId === "s-drone" && near(clipDur(c), 4, 0.1)) },
        ],
      ),
      pr(
        "Ora sovrascrivi",
        "Stessa timeline: copri i primi **2 secondi** del drone con la **città**. Segna I e O sulla città nel sorgente (2 s di durata), metti l'indicatore a **4 s** e premi **Sovrascrivi (.)**. La durata totale non deve cambiare.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 4 }, { media: "s-drone", at: 4, from: 0, to: 4 }], source: "s-citta" }),
        [
          { label: "La città parte a **4 s**", test: (s) => vClips(s).some((c) => c.mediaId === "s-citta" && near(c.start, 4, 0.25)) },
          { label: "La sequenza dura ancora **8 s**", test: (s) => near(seqLength(s), 8, 0.25) },
        ],
        "Se la città entra tutta (8 s) la sequenza si allunga: segna prima **I** e **O** a 2 secondi di distanza.",
      ),
    ],
  },

  // ---------------- Unità 2 ----------------
  trim: {
    mid: [
      T("Trim con la tastiera", [
        "Seleziona il bordo di una clip e usa **Alt+←/→** (Windows) per spostarlo di un fotogramma alla volta.",
        "Con lo strumento **Increspatura (B)** ogni trim chiude o apre lo spazio da solo, senza tenere premuto nulla.",
      ]),
    ],
    end: [
      pr(
        "Rifila il tramonto",
        "Accorcia la clip **Ocean_Sunset** (la prima su V1) a circa **3 secondi** trascinandone la fine, **senza lasciare buchi** prima dell'intervista.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 6 }, { media: "s-intervista", at: 6, from: 1, to: 9 }] }),
        [
          { label: "Il tramonto dura circa **3 s**", test: (s) => vClips(s).some((c) => c.mediaId === "s-tramonto" && near(clipDur(c), 3)) },
          { label: "Nessun buco su **V1**", test: (s) => noGaps(s) && vClips(s).length >= 2 },
        ],
        "Tieni premuto **Ctrl** mentre trascini il bordo destro della clip: è un trim con increspatura e il buco si chiude da solo. Oppure usa lo strumento **Increspatura (B)**.",
      ),
    ],
  },
  "ripple-roll": {
    end: [
      pr(
        "Rolling edit",
        "Sposta il taglio tra tramonto e intervista da **4 s** a **5 s** con lo strumento **Rotazione (N)**: una clip si allunga, l'altra si accorcia, la durata totale resta **10 s**.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 4 }, { media: "s-intervista", at: 4, from: 1, to: 7 }] }),
        [
          { label: "Il taglio è a circa **5 s**", test: (s) => cutNear(s, 5, 0.25) },
          { label: "Durata totale ancora **10 s**", test: (s) => near(seqLength(s), 10, 0.15) },
          { label: "Nessun buco", test: (s) => noGaps(s) },
        ],
        "Premi **N**, poi trascina il punto di contatto tra le due clip verso destra.",
      ),
    ],
  },
  "slip-slide": {
    end: [
      pr(
        "Scorri il contenuto (Slip)",
        "La clip della città mostra il pezzo sbagliato. Con lo strumento **Scorrimento (Y)** trascinala finché parte dal secondo **3** del file (attacco ≈ 3 s), **senza spostarla** in timeline.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 3 }, { media: "s-citta", at: 3, from: 0.5, to: 3.5 }, { media: "s-drone", at: 6, from: 0, to: 3 }] }),
        [
          { label: "La città parte dal secondo **3** del file", test: (s) => vClips(s).some((c) => c.mediaId === "s-citta" && near(c.in, 3, 0.35)) },
          { label: "…ed è ancora tra 3 e 6 s in timeline", test: (s) => vClips(s).some((c) => c.mediaId === "s-citta" && near(c.start, 3, 0.1) && near(clipDur(c), 3, 0.1)) },
        ],
        "Premi **Y** e trascina la clip della città verso sinistra: nel monitor vedi l'attacco e lo stacco che cambiano.",
      ),
    ],
  },
  "snapping-marker": {
    end: [
      pr(
        "Marker e tagli agganciati",
        "Aggiungi un marker a **10 s** (**M**), poi taglia l'intervista con la **Lama (C)** esattamente sui marker a **3 s** e **8 s**. Lo snapping (**S**) deve essere attivo.",
        () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 12 }], markers: [{ t: 3, name: "Taglio 1" }, { t: 8, name: "Taglio 2" }] }),
        [
          { label: "Un marker a **10 s**", test: (s) => markerCount(s) >= 3 && (prSeq(s)?.markers.some((m) => near(m.t, 10, 0.3)) ?? false) },
          { label: "Taglio a **3 s**", test: (s) => cutNear(s, 3, 0.08) },
          { label: "Taglio a **8 s**", test: (s) => cutNear(s, 8, 0.08) },
        ],
        "Sposta l'indicatore a 10 s e premi **M**. Poi **C** e passa sopra ai marker: la linea della lama si aggancia da sola.",
      ),
    ],
  },
  scorciatoie: {
    end: [
      pr(
        "Montaggio solo da tastiera",
        "Con **Ctrl+K** taglia l'intervista a **2 s** e **5 s**, seleziona il pezzo in mezzo e toglilo con **Maiusc+Canc**. Poi usa **W** per accorciare l'ultima clip fino all'indicatore.",
        () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 12 }] }),
        [
          { label: "Il pezzo 2–5 s è sparito", test: (s) => !vClips(s).some((c) => c.in < 4.5 && c.out > 2.5) && vClips(s).length >= 2 },
          { label: "Nessun buco", test: (s) => noGaps(s) },
          { label: "Video più corto di **8 s**", test: (s) => seqLength(s) < 8.5 && seqLength(s) > 1 },
        ],
        "**Ctrl+K** = Aggiungi modifica all'indicatore. **W** = rifila la fine della clip fino all'indicatore, con increspatura.",
      ),
    ],
  },

  // ---------------- Unità 3 · Audio ----------------
  "livelli-db": {
    mid: [Q("La voce deve stare circa tra…", ["−30 e −24 dB", "−12 e −6 dB", "0 e +6 dB", "+6 e +12 dB"], 1, "La voce intorno a −12/−6 dB lascia margine e resta chiara; mai sopra lo 0.")],
    end: [
      pr(
        "Abbassa la musica",
        "La musica (traccia **A2**) copre la voce: è a **+6 dB**. Selezionala e abbassane il **Volume** in **Controlli effetti** a circa **−18 dB**.",
        () =>
          prSetup({
            clips: [
              { media: "s-intervista", at: 0, from: 0, to: 10 },
              { media: "s-musica", at: 0, from: 0, to: 10, v: null, a: 2, patch: { volume: prop(6) } },
            ],
          }),
        [
          {
            label: "Musica tra **−22** e **−14 dB**",
            test: (s) =>
              music(s).length > 0 &&
              music(s).every((c) => {
                const v = clipVolumeAt(c, c.start + 2);
                return v >= -22 && v <= -14;
              }),
          },
          { label: "La voce non è stata abbassata", test: (s) => voice(s).every((c) => clipVolumeAt(c, c.start + 2) >= -6) },
        ],
        "Clicca la clip di musica, apri **Controlli effetti → Volume → Livello** e trascina il valore (o scrivilo).",
      ),
    ],
  },
  "keyframe-volume": {
    end: [
      pr(
        "Dissolvenza in entrata della musica",
        "Crea una **dissolvenza in entrata**: keyframe del Volume a **0 s** molto basso (≤ **−30 dB**) e a circa **2 s** al livello normale (≥ **−6 dB**).",
        () => prSetup({ clips: [{ media: "s-musica", at: 0, from: 0, to: 10, v: null, a: 1 }] }),
        [
          { label: "Almeno **2 keyframe** di volume", test: (s) => music(s).some((c) => keyCount(c.volume) >= 2) },
          { label: "All'inizio la musica è quasi muta", test: (s) => music(s).some((c) => clipVolumeAt(c, c.start + 0.05) <= -25) },
          { label: "Dopo 2–3 s è a volume pieno", test: (s) => music(s).some((c) => clipVolumeAt(c, c.start + 3) >= -6) },
        ],
        "In Controlli effetti, con l'indicatore a 0 accendi il **cronometro** del Livello e scrivi −40; poi vai a 2 s e scrivi 0: il secondo keyframe si crea da solo.",
      ),
    ],
  },
  ducking: {
    end: [
      pr(
        "Ducking a mano",
        "La voce parla tra **3 s** e **9 s**. Con i keyframe abbassa la musica (A2) sotto **−15 dB** mentre lei parla, e riportala su (≥ **−6 dB**) prima e dopo.",
        () =>
          prSetup({
            clips: [
              { media: "s-intervista", at: 3, from: 2, to: 8 },
              { media: "s-musica", at: 0, from: 0, to: 12, v: null, a: 2 },
            ],
          }),
        [
          { label: "A 1 s la musica è piena", test: (s) => music(s).some((c) => clipVolumeAt(c, 1) >= -6) },
          { label: "A 6 s (voce) è sotto **−15 dB**", test: (s) => music(s).some((c) => clipVolumeAt(c, 6) <= -15) },
          { label: "A 11 s torna piena", test: (s) => music(s).some((c) => clipVolumeAt(c, 11) >= -6) },
        ],
        "Servono 4 keyframe: pieno a 2,5 s → basso a 3 s → basso a 9 s → pieno a 9,5 s.",
      ),
    ],
  },
  rumore: {
    end: [
      pr(
        "Pulisci la voce",
        "La voce ha un fruscio. Applica all'audio dell'intervista **DeNoise** (quantità almeno **30%**) e un **Equalizzatore parametrico** con i **Bassi** tagliati (≤ **−6 dB**) per togliere il rimbombo.",
        () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 10 }] }),
        [
          { label: "**DeNoise** sulla voce (≥ 30%)", test: (s) => anyFx(s, "a-denoise", "amount", (v) => v >= 30) },
          { label: "**Equalizzatore**: bassi ≤ −6 dB", test: (s) => anyFx(s, "a-eq", "low", (v) => v <= -6) },
        ],
        "Pannello **Effetti → Effetti audio → Regolazione**: trascina gli effetti sulla clip audio in A1, poi regola i valori in Controlli effetti.",
      ),
    ],
  },
  sfx: {
    end: [
      pr(
        "Whoosh e applausi",
        "Metti **Whoosh.wav** su **A2** in modo che finisca proprio sul taglio a **4 s** (deve partire tra 3 e 4 s). Poi metti **Applausi.wav** sul finale, dopo i **6 s**.",
        () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 4, a: null }, { media: "s-drone", at: 4, from: 0, to: 4 }] }),
        [
          { label: "Whoosh che parte tra **3** e **4 s**", test: (s) => clipsOf(s, "s-whoosh").some((c) => c.start >= 2.9 && c.start <= 4.1) },
          { label: "Applausi dopo i **6 s**", test: (s) => clipsOf(s, "s-applausi").some((c) => c.start >= 5.5) },
        ],
        "Trascina i file dal bin **Audio** del pannello Progetto alla traccia A2.",
      ),
    ],
  },

  // ---------------- Unità 4 · Transizioni ----------------
  "taglio-netto": {
    end: [
      pr(
        "Via le transizioni inutili",
        "Questo montaggio ha una dissolvenza su ogni taglio: sembra lento e amatoriale. **Elimina tutte le transizioni** (clic sulla transizione → **Canc**) lasciando i tagli netti.",
        () =>
          prSetup({
            clips: [
              { media: "s-intervista", at: 0, from: 0, to: 4 },
              { media: "s-citta", at: 4, from: 0, to: 3, tIn: "cross" },
              { media: "s-intervista", at: 7, from: 6, to: 10, tIn: "cross" },
            ],
          }),
        [
          { label: "Nessuna transizione video", test: (s) => !videoClips(s).some((c) => c.tIn || c.tOut) },
          { label: "I tagli restano (3 clip su V1)", test: (s) => vClips(s).length >= 3 && noGaps(s) },
        ],
      ),
    ],
  },
  dissolvenza: {
    end: [
      pr(
        "Una dissolvenza di 2 secondi",
        "Applica una **Dissolvenza incrociata** tra tramonto e drone (**Ctrl+D** con il punto di modifica selezionato, o trascinandola da Effetti) e portala a **2 secondi**.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 5 }, { media: "s-drone", at: 5, from: 0, to: 5 }] }),
        [
          { label: "Dissolvenza incrociata sul taglio", test: (s) => hasTransition(s, ["cross"]) },
          { label: "Durata circa **2 s**", test: (s) => allClips(s).some((c) => [c.tIn, c.tOut].some((t) => t?.defId === "cross" && near(t.dur, 2, 0.25))) },
        ],
        "Per la durata: clic destro sulla transizione → **Imposta durata transizione**, oppure trascinane il bordo.",
      ),
    ],
  },
  "dissolvenza-nero": {
    end: [
      pr(
        "Apri e chiudi dal nero",
        "Metti un **Tuffo nel nero** all'**inizio** della prima clip e alla **fine** dell'ultima: il video deve emergere dal nero e tornarci.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 5 }, { media: "s-drone", at: 5, from: 0, to: 5 }] }),
        [
          { label: "Inizio: dal nero", test: (s) => ["dipBlack", "cross"].includes(vClips(s)[0]?.tIn?.defId ?? "") },
          { label: "Fine: al nero", test: (s) => ["dipBlack", "cross"].includes(vClips(s).at(-1)?.tOut?.defId ?? "") },
        ],
        "Effetti → Transizioni video → **Dissolvenza → Tuffo nel nero**: trascinala sul bordo sinistro della prima clip e sul bordo destro dell'ultima.",
      ),
    ],
  },
  "j-l-cut": {
    end: [
      pr(
        "Fai un L-cut",
        "Il video dell'intervista finisce a **5 s**, ma la sua voce deve **continuare** sotto la città fino ad almeno **6,5 s**. Scollega (**Ctrl+L**) o tieni **Alt** e allunga solo l'audio.",
        () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 5 }, { media: "s-citta", at: 5, from: 0, to: 5, a: null }] }),
        [
          { label: "La voce continua oltre **6,5 s**", test: (s) => voice(s).some((c) => clipEnd(c) >= 6.4) },
          { label: "Il video dell'intervista finisce ancora a **5 s**", test: (s) => vClips(s).some((c) => c.mediaId === "s-intervista" && near(clipEnd(c), 5, 0.2)) },
        ],
        "Tieni premuto **Alt** e trascina il bordo destro della sola clip audio in A1 verso destra.",
      ),
    ],
  },
  "no-transizioni": {
    end: [
      pr(
        "Ripulisci il montaggio",
        "Qualcuno ha esagerato: cubi, pagine che si girano, scacchiere… Lascia **al massimo una** transizione, ed elegante (**Dissolvenza incrociata** o **Tuffo nel nero**).",
        () =>
          prSetup({
            clips: [
              { media: "s-tramonto", at: 0, from: 0, to: 3 },
              { media: "s-citta", at: 3, from: 0, to: 3, tIn: "cube" },
              { media: "s-drone", at: 6, from: 0, to: 3, tIn: "pageTurn" },
              { media: "s-caffe", at: 9, from: 0, to: 3, tIn: "checker" },
            ],
          }),
        [
          { label: "Niente cubi, pagine o scacchiere", test: (s) => !videoClips(s).some((c) => [c.tIn, c.tOut].some((t) => t && !["cross", "dipBlack", "film"].includes(t.defId))) },
          { label: "Al massimo **una** transizione", test: (s) => videoClips(s).reduce((n, c) => n + (c.tIn ? 1 : 0) + (c.tOut ? 1 : 0), 0) <= 1 },
        ],
      ),
    ],
  },

  // ---------------- Unità 5 · Keyframe ----------------
  keyframe: {
    end: [
      pr(
        "Il tuo primo keyframe",
        "Il logo su **V2** compare di colpo. Fallo apparire in dissolvenza: **Opacità** a **0%** a inizio clip e **100%** dopo circa **1 secondo**.",
        () => logoOverDrone(),
        [
          { label: "Almeno 2 keyframe di **Opacità** sul logo", test: (s) => logo(s).some((c) => keyCount(c.opacity) >= 2) },
          { label: "Parte da 0% (o quasi)", test: (s) => logo(s).some((c) => (c.opacity.keys?.[0]?.v[0] ?? 100) <= 10) },
          { label: "Arriva al 100%", test: (s) => logo(s).some((c) => (c.opacity.keys ?? []).some((k) => k.v[0] >= 90)) },
        ],
        "Seleziona il logo, **Controlli effetti → Opacità**: cronometro acceso a 0 s con 0%, poi indicatore a 1 s e scrivi 100.",
      ),
    ],
  },
  "posizione-scala": {
    end: [
      pr(
        "Lo zoom lento (effetto Ken Burns)",
        "Dai vita al drone: **Scala** da **100** ad almeno **115** lungo la clip, con due keyframe.",
        () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 8 }] }),
        [
          { label: "2 keyframe di **Scala**", test: (s) => vClips(s).some((c) => keysOf(c, "scale").length >= 2) },
          {
            label: "Da ~100 a ≥ **115**",
            test: (s) =>
              vClips(s).some((c) => {
                const v = keysOf(c, "scale").map((k) => k.v[0]);
                return v.length >= 2 && Math.min(...v) <= 105 && Math.max(...v) >= 115;
              }),
          },
        ],
      ),
      pr(
        "Il logo attraversa lo schermo",
        "Ora anima la **Posizione** del logo (V2): deve partire da **sinistra** e arrivare a **destra** (almeno **600 px** di differenza in X).",
        () => logoOverDrone(),
        [
          { label: "2 keyframe di **Posizione**", test: (s) => logo(s).some((c) => keysOf(c, "position").length >= 2) },
          {
            label: "Si sposta di ≥ 600 px",
            test: (s) =>
              logo(s).some((c) => {
                const x = keysOf(c, "position").map((k) => k.v[0]);
                return x.length >= 2 && Math.max(...x) - Math.min(...x) >= 600;
              }),
          },
        ],
        "Puoi anche trascinare il logo direttamente nel Monitor programma dopo aver acceso il cronometro di Posizione.",
      ),
    ],
  },
  "rotazione-opacita": {
    end: [
      pr(
        "Gira e sparisci",
        "Fai fare al logo un **giro completo** (Rotazione da 0 a **360°**) e farlo **sparire** alla fine (ultimo keyframe di Opacità ≤ **10%**).",
        () => logoOverDrone(),
        [
          {
            label: "Rotazione di almeno **360°**",
            test: (s) =>
              logo(s).some((c) => {
                const r = keysOf(c, "rotation").map((k) => k.v[0]);
                return r.length >= 2 && Math.max(...r) - Math.min(...r) >= 355;
              }),
          },
          {
            label: "Alla fine sparisce",
            test: (s) =>
              logo(s).some((c) => {
                const k = [...(c.opacity.keys ?? [])].sort((a, b) => a.t - b.t);
                return k.length >= 2 && k[k.length - 1].v[0] <= 10;
              }),
          },
        ],
      ),
    ],
  },
  interpolazione: {
    end: [
      pr(
        "Keyframe a tenuta",
        "Il logo scivola tra tre posizioni. Trasforma il **keyframe centrale** in **Tenuta**: il logo deve **saltare** di colpo invece di scivolare.",
        () => logoOverDrone((c) => ({ ...c, motion: { ...c.motion, position: { value: [400, 540], keys: linearKeys([[0, [400, 540]], [2, [960, 540]], [4, [1520, 540]]]) } } })),
        [{ label: "Un keyframe di Posizione in **Tenuta**", test: (s) => logo(s).some((c) => keysOf(c, "position").some((k) => k.hold)) }],
        "In Controlli effetti fai **clic destro** sul keyframe → **Interpolazione temporale → Tenuta**.",
      ),
    ],
  },
  easing: {
    end: [
      pr(
        "Easy Ease in Premiere",
        "Il logo si muove come un robot: rendi i suoi keyframe di **Posizione** morbidi con **Ease in / Ease out** (o Bézier).",
        () => logoOverDrone((c) => ({ ...c, motion: { ...c.motion, position: { value: [400, 540], keys: linearKeys([[0.5, [400, 540]], [3, [1520, 540]]]) } } })),
        [{ label: "Keyframe di Posizione con easing", test: (s) => logo(s).some((c) => keysOf(c, "position").some((k) => k.easeIn || k.easeOut)) }],
        "Clic destro sui keyframe → **Interpolazione temporale → Ease in** (sul secondo) ed **Ease out** (sul primo).",
      ),
      ae(
        "Il primo assaggio di After Effects",
        "Lo stesso movimento in **After Effects**: seleziona i keyframe di **Posizione** del formaggio, premi **F9** (Easy Ease) e apri l'**Editor grafico** per vedere la curva a campana.",
        () =>
          aeSetup({
            layers: (comp) => {
              const ball = aeLayer("shape", comp, { name: "Formaggio" });
              ball.shape = { ...ball.shape!, kind: "ellipse", size: prop(160, 160), fill: "#ffc93c" };
              ball.transform.position = animated([key(0.3, 300, 540), key(2.3, 1620, 540)]);
              const bg = aeLayer("solid", comp, { name: "Sfondo", color: "#1f1f3d" });
              return [ball, bg];
            },
            open: (ls) => ({ [ls[0].id]: ["t.position"] }),
          }),
        [
          { label: "Keyframe con **Easy Ease**", test: (s) => anyEased(s, "t.position") },
          { label: "**Editor grafico** aperto", test: (s) => s.graph },
        ],
        "Clic sul nome **Posizione** nella timeline seleziona tutti i suoi keyframe. Poi **F9**. L'editor grafico è l'icona a grafico in alto nella timeline.",
      ),
    ],
  },

  // ---------------- Unità 6 · Export ----------------
  codec: {
    end: [
      pr(
        "Scegli il codec giusto",
        "Apri **File → Esporta → Media (Ctrl+M)** e prepara un file per il web: formato **H.264**, stessa dimensione della sequenza (**1920×1080**). Premi **Esporta**.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 5 }, { media: "s-drone", at: 5, from: 0, to: 5 }] }),
        [
          { label: "Formato **H.264**", test: (s) => s.lastExport?.format === "H.264" },
          { label: "**1920×1080**", test: (s) => s.lastExport?.width === 1920 && s.lastExport?.height === 1080 },
        ],
      ),
    ],
  },
  bitrate: {
    end: [
      pr(
        "Bitrate sotto controllo",
        "Esporta in **H.264** 1920×1080 con un bitrate tra **8** e **16 Mbps**: buona qualità, file leggero.",
        () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 10 }] }),
        [
          { label: "**H.264**", test: (s) => s.lastExport?.format === "H.264" },
          { label: "Bitrate **8–16 Mbps**", test: (s) => !!s.lastExport && s.lastExport.bitrateMbps >= 8 && s.lastExport.bitrateMbps <= 16 },
        ],
        "Nella scheda **Video → Impostazioni bitrate** trascina il **Bitrate di destinazione**.",
      ),
    ],
  },
  "export-youtube": {
    end: [
      pr(
        "Export per YouTube, dal montaggio vero",
        "Esporta questa sequenza per YouTube: **H.264**, **1920×1080**, **25 fps**, bitrate tra **10** e **20 Mbps**, audio **320 kbps**.",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 4 }, { media: "s-intervista", at: 4, from: 0, to: 6 }, { media: "s-musica", at: 0, from: 0, to: 10, v: null, a: 2, patch: { volume: prop(-16) } }] }),
        [
          { label: "H.264 1920×1080", test: (s) => s.lastExport?.format === "H.264" && s.lastExport.width === 1920 && s.lastExport.height === 1080 },
          { label: "**25 fps**", test: (s) => !!s.lastExport && near(s.lastExport.fps, 25, 0.01) },
          { label: "Bitrate **10–20 Mbps**", test: (s) => !!s.lastExport && s.lastExport.bitrateMbps >= 10 && s.lastExport.bitrateMbps <= 20 },
          { label: "Audio **320 kbps**", test: (s) => s.lastExport?.audioKbps === 320 },
        ],
      ),
    ],
  },
  "export-social": {
    end: [
      pr(
        "Dal 16:9 al Reel",
        "Crea una **nuova sequenza 1080×1920**, mettici dentro il **drone** e scalalo perché riempia lo schermo verticale (Scala ≥ **170**). Poi esporta in **H.264** 1080×1920.",
        () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 8 }] }),
        [
          { label: "Sequenza **1080×1920**", test: (s) => Object.values(s.project.sequences).some((q) => q.width === 1080 && q.height === 1920) },
          { label: "Il drone è nella sequenza verticale", test: (s) => Object.values(s.project.sequences).some((q) => q.width === 1080 && q.clips.some((c) => c.mediaId === "s-drone")) },
          {
            label: "…e riempie lo schermo (Scala ≥ 170)",
            test: (s) => Object.values(s.project.sequences).some((q) => q.width === 1080 && q.clips.some((c) => c.mediaId === "s-drone" && (c.motion.scale.keys?.[0]?.v[0] ?? c.motion.scale.value[0]) >= 170)),
          },
          { label: "Esportato in verticale", test: (s) => s.lastExport?.format === "H.264" && s.lastExport.width === 1080 && s.lastExport.height === 1920 },
        ],
        "Dopo **Ctrl+N** la nuova sequenza si apre: trascina il drone dal Progetto. Nel monitor è piccolo: **Controlli effetti → Scala**.",
      ),
    ],
  },
  master: {
    end: [
      pr(
        "Il master da archiviare",
        "Esporta il **master**: formato **QuickTime** (il contenitore del ProRes), stessa dimensione e fps della sequenza (**1920×1080, 25 fps**).",
        () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 4 }, { media: "s-drone", at: 4, from: 0, to: 6 }] }),
        [
          { label: "Formato **QuickTime**", test: (s) => s.lastExport?.format === "QuickTime" },
          { label: "1920×1080 a 25 fps", test: (s) => !!s.lastExport && s.lastExport.width === 1920 && s.lastExport.height === 1080 && near(s.lastExport.fps, 25, 0.01) },
        ],
      ),
    ],
  },
};

/** Aggiunge gli esercizi alla lezione: a metà (dopo la seconda schermata) e alla fine. */
export function withPractice(id: string, steps: LessonStep[], table: Record<string, Extra> = S1_PRACTICE): LessonStep[] {
  const x = table[id];
  if (!x) return steps;
  const mid = Math.min(2, steps.length);
  return [...steps.slice(0, mid), ...(x.mid ?? []), ...steps.slice(mid), ...x.end];
}

/** Lezione completa: durata e XP crescono con le schermate e gli esercizi nel simulatore. */
export const lesson = (id: string, title: string, summary: string, steps: LessonStep[], xp = 15): Lesson => ({
  id,
  title,
  summary,
  minutes: Math.max(4, Math.round(steps.length * 0.6)),
  xp: xp + 5 * steps.filter((x) => x.kind === "studio").length,
  steps,
});
