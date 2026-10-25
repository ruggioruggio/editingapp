import { editPoints, hasGaps, sourceCoverage } from "@/lib/editor/ops";
import type { Clip, Marker, Media, Sequence } from "@/lib/editor/types";
import type { Lesson } from "@/lib/lessons/types";

const FPS = 25;
const TOL = 1.5 / FPS;

const interview: Media = {
  id: "intervista",
  name: "A001_Intervista.mp4",
  duration: 10,
  hue: 215,
  events: [{ from: 4, to: 6, label: "😬 Ops, papera!" }],
};

const markers: Marker[] = [
  { id: "m1", time: 4, label: "Inizio papera" },
  { id: "m2", time: 6, label: "Fine papera" },
];

/** Intervista con audio collegato, già divisa nei punti indicati. */
function interviewSequence(cuts: number[]): Sequence {
  const points = [0, ...cuts, interview.duration];
  const clips: Clip[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    for (const track of ["V1", "A1"] as const) {
      clips.push({
        id: `${track}-${i}`,
        mediaId: interview.id,
        track,
        start: points[i],
        in: points[i],
        out: points[i + 1],
        linkId: `link-${i}`,
      });
    }
  }
  return { name: "Intervista_Montaggio", fps: FPS, media: [interview], clips, markers };
}

const coverage = (seq: Sequence, from: number, to: number) => sourceCoverage(seq, "V1", interview.id, from, to);

export const primoTaglio: Lesson = {
  id: "primo-taglio",
  title: "Il primo taglio",
  summary: "Timeline, strumento Lama ed eliminazione con increspatura.",
  minutes: 3,
  xp: 15,
  steps: [
    {
      kind: "theory",
      title: "Sequenza e timeline",
      body: [
        "In Premiere Pro si monta dentro una **sequenza**: un contenitore con impostazioni precise (risoluzione, frame rate) in cui disponi le clip nel tempo.",
        "La **timeline** è la sequenza vista da vicino: da sinistra a destra scorre il tempo, dall'alto in basso ci sono le **tracce**. V1, V2… per il video, A1, A2… per l'audio.",
        "La linea blu verticale è l'**indicatore di riproduzione** (playhead): il fotogramma che tocca è quello che vedi nel **Monitor Programma**.",
      ],
      terms: [
        { term: "Timecode", def: "00:00:04:12 = ore : minuti : secondi : fotogrammi" },
        { term: "25 fps", def: "25 fotogrammi al secondo, lo standard europeo (PAL)" },
      ],
    },
    {
      kind: "theory",
      title: "Due strumenti, due tasti",
      body: [
        "Lo strumento **Selezione (V)** serve a scegliere le clip: clicchi e la clip si illumina.",
        "Lo strumento **Lama (C)** divide una clip in due nel punto in cui clicchi. Non cancella niente: crea solo un nuovo punto di montaggio.",
      ],
      tip: "I montatori professionisti non scelgono gli strumenti col mouse. Impara le scorciatoie da subito: ti fanno risparmiare ore.",
    },
    {
      kind: "quiz",
      question: "Quale tasto attiva lo strumento Lama in Premiere Pro?",
      options: ["V", "C", "R", "B"],
      correctIndex: 1,
      explanation: "C come “Cut”. Con V torni allo strumento Selezione.",
    },
    {
      kind: "editor",
      title: "Taglia ai marker",
      instructions:
        "Nell'intervista c'è una papera tra i due **marker gialli**. Premi **C** per la Lama e taglia la clip su **entrambi** i marker. Prova Spazio per riprodurre.",
      initial: interviewSequence([]),
      tools: ["select", "razor"],
      check: (seq) => {
        if (coverage(seq, 0, 10) < 10 - TOL) {
          return { done: false, hint: "Hai eliminato un pezzo: qui devi solo tagliare. Premi Ctrl+Z per annullare." };
        }
        const points = editPoints(seq, "V1");
        const cutAt = (t: number) => points.some((p) => Math.abs(p - t) <= TOL);
        const first = cutAt(4);
        const second = cutAt(6);
        if (first && second) return { done: true };
        if (!first && !second) {
          return {
            done: false,
            hint: "Premi C, poi clicca sulla clip proprio sotto il primo marker giallo. Lo snapping aggancia il taglio al marker quando ci passi vicino.",
          };
        }
        return {
          done: false,
          hint: first
            ? "Primo taglio fatto! Ora taglia anche sul secondo marker, dove finisce la papera."
            : "Hai tagliato sul secondo marker: manca il primo, dove inizia la papera.",
        };
      },
    },
    {
      kind: "quiz",
      question: "Hai isolato la papera. Come la elimini senza lasciare un buco nero in timeline?",
      options: ["Canc (Elimina)", "Shift + Canc (Elimina con increspatura)", "Ctrl + Z", "C (Lama)"],
      correctIndex: 1,
      explanation:
        "L'eliminazione con increspatura (Ripple Delete) rimuove la clip e fa scorrere a sinistra tutto ciò che segue, chiudendo il vuoto.",
    },
    {
      kind: "editor",
      title: "Elimina la papera",
      instructions:
        "Con la **Selezione (V)** clicca il pezzo tra i marker, poi premi **Shift + Canc** per eliminarlo con increspatura.",
      initial: interviewSequence([4, 6]),
      tools: ["select", "razor"],
      check: (seq) => {
        if (coverage(seq, 0, 4) + coverage(seq, 6, 10) < 8 - TOL) {
          return { done: false, hint: "Hai eliminato anche parti buone dell'intervista. Annulla con Ctrl+Z." };
        }
        if (coverage(seq, 4, 6) > TOL) {
          return { done: false, hint: "Premi V, clicca la clip centrale (quella tra i marker) e premi Shift + Canc." };
        }
        if (hasGaps(seq, "V1")) {
          return {
            done: false,
            hint: "La papera è sparita, ma è rimasto un buco nero! Annulla (Ctrl+Z) e usa Shift + Canc: l'increspatura chiude il vuoto.",
          };
        }
        return { done: true };
      },
    },
  ],
};
