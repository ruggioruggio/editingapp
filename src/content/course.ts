import type { Unit } from "@/lib/lessons/types";

// Mappa del percorso. Le lezioni "soon" sono segnaposto per i contenuti futuri.
export const course: Unit[] = [
  {
    id: "fondamenti",
    title: "Fondamenti del montaggio",
    description: "Sequenze, timeline e i primi tagli",
    color: "#9999ff",
    lessons: [
      { id: "primo-taglio", title: "Il primo taglio", status: "available" },
      { id: "trim-base", title: "Rifilare le clip (Trim)", status: "soon" },
      { id: "dissolvenza", title: "Transizioni: dissolvenza incrociata", status: "soon" },
      { id: "j-l-cut", title: "J-cut e L-cut", status: "soon" },
    ],
  },
  {
    id: "colore",
    title: "Color correction",
    description: "Rec.709, scopes e Lumetri",
    color: "#ff9a5c",
    lessons: [
      { id: "rec709", title: "Cos'è Rec.709", status: "soon" },
      { id: "esposizione", title: "Esposizione e waveform", status: "soon" },
      { id: "bilanciamento-bianco", title: "Bilanciamento del bianco", status: "soon" },
      { id: "lut", title: "Look e LUT", status: "soon" },
    ],
  },
  {
    id: "motion",
    title: "Motion graphics",
    description: "Keyframe, easing e titoli animati",
    color: "#3ecf8e",
    lessons: [
      { id: "keyframe", title: "Cos'è un keyframe", status: "soon" },
      { id: "posizione-scala", title: "Posizione e scala", status: "soon" },
      { id: "easing", title: "Easing: movimenti naturali", status: "soon" },
      { id: "titoli", title: "Titoli animati", status: "soon" },
    ],
  },
];
