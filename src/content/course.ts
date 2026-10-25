import type { LessonKind, LessonMeta, Section, Unit } from "@/lib/lessons/types";
import { lessons } from "./lessons";

// Mappa completa del corso: sezioni → unità → lezioni.
// Ogni lezione ha già il suo obiettivo; diventa giocabile appena il suo
// contenuto esiste in content/lessons (lo status si calcola da solo).

type Row = [id: string, title: string, goal: string, kind?: LessonKind];

const unit = (id: string, title: string, description: string, rows: Row[]): Unit => ({
  id,
  title,
  description,
  lessons: rows.map(
    ([lessonId, lessonTitle, goal, kind = "theory"]): LessonMeta => ({
      id: lessonId,
      title: lessonTitle,
      goal,
      kind,
      status: lessonId in lessons ? "available" : "soon",
    }),
  ),
});

export const sections: Section[] = [
  {
    id: "s1",
    title: "Primi passi",
    level: "Principiante",
    description: "Timeline, tagli, audio, transizioni, keyframe ed export",
    color: "#9999ff",
    units: [
      unit("u1", "Fondamenti del montaggio", "Sequenze, timeline e i primi tagli", [
        ["crea-sequenza", "Crea la tua prima sequenza", "Impostare dimensione e fps come in Premiere", "editor"],
        ["primo-taglio", "Il primo taglio", "Usare Lama ed Elimina con increspatura", "editor"],
        ["importare", "Importare e organizzare", "Bin, etichette e una struttura di progetto pulita"],
        ["monitor", "Monitor sorgente e programma", "Capire cosa mostrano i due monitor"],
        ["in-out", "Punti di attacco e stacco", "Segnare I e O per prendere solo ciò che serve"],
        ["inserisci-sovrascrivi", "Inserisci e sovrascrivi", "Le due modalità per portare clip in timeline"],
      ]),
      unit("u2", "Rifinire il montaggio", "Trim e strumenti di precisione", [
        ["trim", "Rifilare le clip (Trim)", "Accorciare e allungare una clip dal bordo"],
        ["ripple-roll", "Ripple e Roll edit", "Spostare un taglio senza creare buchi", "editor"],
        ["slip-slide", "Slip e Slide", "Cambiare il contenuto o la posizione di una clip"],
        ["snapping-marker", "Snapping e marker", "Agganciare i tagli ai punti giusti", "editor"],
        ["scorciatoie", "Scorciatoie da pro", "J, K, L e i tasti che fanno risparmiare ore"],
      ]),
      unit("u3", "Audio di base", "Il 50% del video è audio", [
        ["livelli-db", "Livelli e decibel", "Leggere i VU meter e restare sotto lo 0 dB", "audio"],
        ["keyframe-volume", "Keyframe del volume", "Alzare e abbassare la musica nel punto giusto", "audio"],
        ["ducking", "Musica sotto la voce", "Il ducking per far capire ogni parola", "audio"],
        ["rumore", "Pulire il rumore", "Ridurre ronzii e fruscii di fondo", "audio"],
        ["sfx", "Effetti sonori", "Whoosh, impatti e atmosfere che danno ritmo", "audio"],
      ]),
      unit("u4", "Transizioni", "Quando e come passare da una clip all'altra", [
        ["taglio-netto", "Il taglio netto", "Perché il 90% dei passaggi è un semplice taglio", "editor"],
        ["dissolvenza", "Dissolvenza incrociata", "Applicare e dosare un cross dissolve"],
        ["dissolvenza-nero", "Dissolvenza al nero", "Aprire e chiudere un video con eleganza"],
        ["j-l-cut", "J-cut e L-cut", "Anticipare o prolungare l'audio sul taglio", "audio"],
        ["no-transizioni", "Quando NON usare transizioni", "Evitare gli effetti che sanno di amatoriale"],
      ]),
      unit("u5", "I keyframe", "Le basi di tutto ciò che si muove", [
        ["keyframe", "Cos'è un keyframe", "Due punti nel tempo e il computer fa il resto", "motion"],
        ["posizione-scala", "Posizione e scala", "Il primo movimento: lo zoom lento", "motion"],
        ["rotazione-opacita", "Rotazione e opacità", "Far apparire e girare gli elementi", "motion"],
        ["interpolazione", "Interpolazione", "Lineare, Bézier e tenuta", "motion"],
        ["easing", "Easing", "Movimenti naturali con ease in e ease out", "motion"],
      ]),
      unit("u6", "Export", "Consegnare il file giusto", [
        ["codec", "Codec e contenitori", "H.264, H.265, ProRes: la differenza"],
        ["bitrate", "Bitrate", "Qualità contro peso del file"],
        ["export-youtube", "Export per YouTube", "Le impostazioni consigliate"],
        ["export-social", "Export per i social", "Verticale, quadrato e limiti delle piattaforme"],
        ["master", "Master e consegna", "Il file da archiviare per sempre"],
      ]),
    ],
  },
  {
    id: "s2",
    title: "Raccontare con il montaggio",
    level: "Intermedio",
    description: "Ritmo, interviste, velocità e grafica essenziale",
    color: "#2d8ceb",
    units: [
      unit("u7", "Il linguaggio del montaggio", "Le regole che lo spettatore non vede", [
        ["inquadrature", "Piani e inquadrature", "Campo lungo, medio, primo piano e quando usarli"],
        ["regola-180", "La regola dei 180°", "Non confondere lo spettatore sulle direzioni"],
        ["continuita", "Montaggio in continuità", "Raccordi di movimento e di sguardo", "editor"],
        ["alternato", "Montaggio alternato", "Due azioni parallele che creano tensione", "editor"],
        ["ritmo", "Ritmo e tempo", "Tagliare sulla musica e sul respiro della scena", "editor"],
      ]),
      unit("u8", "Interviste e multicamera", "Montare chi parla", [
        ["b-roll", "Il B-roll", "Coprire i tagli con immagini di supporto", "editor"],
        ["sync-audio", "Sincronizzare l'audio", "Unire audio esterno e video con la forma d'onda", "audio"],
        ["multicam", "Sequenze multicamera", "Passare da una camera all'altra in tempo reale", "editor"],
        ["tagliare-intervista", "Tagliare un'intervista", "Togliere pause ed esitazioni senza notarlo", "editor"],
        ["jump-cut", "Il jump cut", "Usare il salto come scelta di stile", "editor"],
      ]),
      unit("u9", "Velocità e tempo", "Rallentare, accelerare, fermare", [
        ["rallenty", "Il rallentatore", "Frame rate di ripresa e slow motion fluido"],
        ["time-remapping", "Time remapping", "Rampe di velocità dentro una sola clip", "editor"],
        ["fps", "Fotogrammi e fps", "24, 25, 30, 60: cosa cambia davvero"],
        ["fermo-immagine", "Fermo immagine", "Congelare un istante per enfatizzarlo", "editor"],
        ["reverse", "Reverse e loop", "Riprodurre al contrario e creare cicli", "editor"],
      ]),
      unit("u10", "Titoli e grafica base", "Testo chiaro e leggibile", [
        ["testi", "Testi essenziali", "Font, dimensioni e contrasto leggibili", "motion"],
        ["lower-third", "Il lower third", "Nome e ruolo di chi parla", "motion"],
        ["safe-margin", "Margini di sicurezza", "Tenere i titoli lontano dai bordi"],
        ["sottotitoli", "Sottotitoli", "Generare, correggere e stilizzare i sottotitoli", "editor"],
        ["grafiche-essenziali", "Grafiche essenziali", "Usare e modificare i template", "motion"],
      ]),
    ],
  },
  {
    id: "s3",
    title: "Color",
    level: "Intermedio",
    description: "Dalla teoria del colore al grading creativo",
    color: "#ff9a5c",
    units: [
      unit("u11", "Teoria del colore", "Cosa succede ai colori nel video", [
        ["rec709", "Cos'è Rec.709", "Lo standard di colore dei video che guardi ogni giorno"],
        ["gamma", "Spazi colore e gamma", "Perché lo stesso file sembra diverso su due schermi"],
        ["log", "Log vs Rec.709", "Perché il girato Log sembra grigio e come si corregge", "color"],
        ["bit-depth", "Bit depth e compressione", "8 bit, 10 bit e il banding"],
        ["hdr", "HDR in breve", "Cosa cambia con PQ e HLG"],
      ]),
      unit("u12", "Gli scopes", "Misurare invece di indovinare", [
        ["waveform", "La waveform", "Leggere luci e ombre con precisione", "color"],
        ["vectorscope", "Il vectorscope", "Tinta e saturazione sotto controllo", "color"],
        ["parade", "La parade RGB", "Trovare dominanti di colore", "color"],
        ["istogramma", "L'istogramma", "Distribuzione dei toni a colpo d'occhio", "color"],
        ["skin-line", "La linea dell'incarnato", "Pelli naturali con il vectorscope", "color"],
      ]),
      unit("u13", "Correzione primaria", "Rendere l'immagine corretta", [
        ["esposizione", "Esposizione", "Riportare luci e ombre nel range giusto", "color"],
        ["contrasto", "Contrasto", "Dare profondità senza bruciare i dettagli", "color"],
        ["bilanciamento-bianco", "Bilanciamento del bianco", "Togliere dominanti calde o fredde", "color"],
        ["saturazione", "Saturazione e vividezza", "Colori vivi ma credibili", "color"],
        ["match-clip", "Abbinare due clip", "Far sembrare due camere una sola", "color"],
      ]),
      unit("u14", "Grading creativo", "Dare un'identità all'immagine", [
        ["lut", "Look e LUT", "Applicare una LUT nel punto giusto della catena", "color"],
        ["curve", "Le curve", "Il controllo più potente del colorist", "color"],
        ["hsl", "Correzione secondaria HSL", "Isolare e cambiare un solo colore", "color"],
        ["maschere-colore", "Maschere e tracking", "Correggere solo una zona dell'immagine", "color"],
        ["creare-look", "Creare un look", "Teal & orange, vintage, bianco e nero", "color"],
      ]),
    ],
  },
  {
    id: "s4",
    title: "Motion graphics",
    level: "Avanzato",
    description: "After Effects, testo animato ed effetti visivi",
    color: "#3ecf8e",
    units: [
      unit("u15", "After Effects: le basi", "Composizioni e livelli", [
        ["composizioni", "Composizioni", "Il contenitore di ogni animazione", "motion"],
        ["livelli", "Livelli e precomposizioni", "Organizzare progetti complessi", "motion"],
        ["forme", "Livelli forma", "Disegnare e animare forme vettoriali", "motion"],
        ["maschere-matte", "Maschere e track matte", "Mostrare solo una parte di un livello", "motion"],
        ["parenting", "Parenting", "Collegare livelli che si muovono insieme", "motion"],
      ]),
      unit("u16", "Testo animato", "Titoli che catturano l'occhio", [
        ["animatori-testo", "Animatori di testo", "Animare lettera per lettera", "motion"],
        ["titoli-cinetici", "Tipografia cinetica", "Parole che seguono la voce", "motion"],
        ["typewriter", "Effetto macchina da scrivere", "Testo che compare carattere per carattere", "motion"],
        ["lower-third-animato", "Lower third animato", "Entrata e uscita fluide", "motion"],
        ["logo-animato", "Logo animato", "Un'intro di 3 secondi per il tuo canale", "motion"],
      ]),
      unit("u17", "Effetti visivi", "Trucchi da film", [
        ["green-screen", "Green screen", "Scontornare con il chroma key", "motion"],
        ["tracking", "Motion tracking", "Attaccare un elemento a un oggetto in movimento", "motion"],
        ["stabilizzazione", "Stabilizzazione", "Togliere il mosso dalle riprese a mano", "editor"],
        ["blending", "Metodi di fusione", "Screen, multiply e overlay", "motion"],
        ["particelle", "Particelle", "Polvere, scintille e neve", "motion"],
      ]),
    ],
  },
  {
    id: "s5",
    title: "Da professionista",
    level: "Pro",
    description: "Workflow, social e progetto finale",
    color: "#ffc93c",
    units: [
      unit("u18", "Workflow", "Lavorare veloci e senza perdere nulla", [
        ["proxy", "I proxy", "Montare 4K su un portatile qualsiasi", "editor"],
        ["gestione-progetto", "Gestione del progetto", "Cartelle, nomi e versioni"],
        ["backup", "Backup", "La regola del 3-2-1"],
        ["collaborazione", "Collaborazione", "Revisioni e commenti con il cliente"],
        ["consegna-cliente", "Consegna al cliente", "Scadenze, revisioni e fatturazione"],
      ]),
      unit("u19", "Video per i social", "Fermare lo scroll", [
        ["verticale", "Il formato 9:16", "Reinquadrare un video orizzontale", "editor"],
        ["hook", "L'hook dei primi 3 secondi", "Agganciare chi guarda subito", "editor"],
        ["sottotitoli-dinamici", "Sottotitoli dinamici", "Parole evidenziate a ritmo", "motion"],
        ["ritmo-reel", "Il ritmo di un reel", "Tagli veloci sulla musica", "editor"],
        ["thumbnail", "La miniatura", "La copertina che fa cliccare"],
      ]),
      unit("u20", "Progetto finale", "Un video completo dall'inizio alla fine", [
        ["brief", "Il brief", "Capire cosa vuole davvero il cliente", "project"],
        ["selezione", "Selezione del girato", "Scegliere le riprese migliori", "project"],
        ["assemblaggio", "Assemblaggio", "Il primo montaggio grezzo", "project"],
        ["fine-cut", "Dal rough cut al fine cut", "Rifinire ritmo e storia", "project"],
        ["finalizzazione", "Colore, audio ed export", "Chiudere e consegnare il progetto", "project"],
      ]),
    ],
  },
];

export const allLessons = sections.flatMap((s) => s.units.flatMap((u) => u.lessons));
