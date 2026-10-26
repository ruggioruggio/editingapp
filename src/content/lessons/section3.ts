import type { Lesson } from "@/lib/lessons/types";
import type { EffectInstance } from "@/lib/studio/effects";
import type { Clip, PrState } from "@/lib/studio/premiere";
import { aeLayer, aeLayers, aeSetup, clipEffect, fxValue, prSetup, vClips, withFx } from "@/lib/lessons/studioKit";
import { ae, lesson as L, M, pr, Q, T } from "./s1-practice";

// Sezione 3 "Color": teoria, scopes, correzione primaria e grading
// creativo. Gli esercizi partono da clip con problemi di colore veri.

/** Patch che aggiunge effetti solo alle clip video. */
const vfx =
  (...fx: (() => EffectInstance)[]) =>
  (c: Clip): Clip =>
    c.track.startsWith("v") ? { ...c, effects: [...c.effects, ...fx.map((f) => f())] } : c;
const lumetri = (params: Record<string, number>) => () => withFx("lumetri", 1920, 1080, Object.fromEntries(Object.entries(params).map(([k, v]) => [k, [v]])));

const enabledLum = (c: Clip) => c.effects.filter((e) => e.defId === "lumetri" && e.enabled);
const pv = (e: EffectInstance, k: string) => e.params[k]?.keys?.[0]?.v[0] ?? e.params[k]?.value[0] ?? 0;
/** Valore complessivo di un parametro Lumetri sommando tutte le istanze (la saturazione si moltiplica). */
export function lum(c: Clip, k: string): number {
  const list = enabledLum(c);
  if (k === "saturation") return list.reduce((m, e) => (m * pv(e, k)) / 100, 100);
  return list.reduce((m, e) => m + pv(e, k), 0);
}
/** La clip principale dell'esercizio (la prima su V1 del file indicato). */
const main = (s: PrState, media: string) => vClips(s).find((c) => c.mediaId === media);
const L1 = (s: PrState, media: string, k: string, ok: (v: number) => boolean) => {
  const c = main(s, media);
  return !!c && ok(lum(c, k));
};

export const section3Lessons: Lesson[] = [
  // ---------------- Unità 11 · Teoria del colore ----------------
  L("rec709", "Cos'è Rec.709", "Lo standard di colore dei video che guardi ogni giorno.", [
    T("Uno standard per tutti", [
      "**Rec.709** è lo standard dei video HD: definisce quali colori esistono (lo **spazio colore**), come si distribuisce la luminosità (la **gamma**) e dove stanno il bianco e il nero.",
      "Quasi tutto quello che guardi su YouTube, TV e telefono è (o finisce per essere) in Rec.709. È la \"lingua comune\" tra la tua timeline e lo schermo dello spettatore.",
    ], { terms: [{ term: "Spazio colore", def: "L'insieme dei colori riproducibili" }, { term: "Gamma", def: "Come i valori diventano luminosità" }] }),
    Q("Perché si lavora in Rec.709 per YouTube?", ["Perché pesa meno", "Perché è lo standard che gli schermi si aspettano", "Perché è in bianco e nero", "Non si lavora in Rec.709"], 1, "Se la timeline parla Rec.709, quello che vedi è quello che vedrà lo spettatore."),
    T("Video \"piatto\"", [
      "Molte camere registrano in modo **piatto** (poco contrasto e saturazione) per conservare dettagli. Il primo passo del colorist è riportare quell'immagine a un Rec.709 **normale**: neri neri, bianchi bianchi, colori credibili.",
    ]),
    Q("Un'immagine grigia e slavata appena importata ha bisogno di…", ["Più contrasto e saturazione", "Meno contrasto", "Un effetto audio", "Una transizione"], 0, "Va riportata a un look normale prima di ogni scelta creativa."),
    pr(
      "Da piatto a normale",
      "Il tramonto è **piatto**. Con **Lumetri Color** riportalo a un look normale: **Contrasto** complessivo almeno **+20** e **Saturazione** almeno **110**.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 8, patch: vfx(lumetri({ contrast: -35, saturation: 60 })) }] }),
      [
        { label: "Contrasto complessivo ≥ **+20**", test: (s) => L1(s, "s-tramonto", "contrast", (v) => v >= 20) },
        { label: "Saturazione complessiva ≥ **110**", test: (s) => L1(s, "s-tramonto", "saturation", (v) => v >= 110) },
      ],
      "La clip ha già un Lumetri che la appiattisce: correggi i suoi valori in Controlli effetti, oppure aggiungine un secondo che compensi.",
    ),
    M("Abbina", [
      ["Rec.709", "Standard dei video HD"],
      ["Spazio colore", "Quali colori esistono"],
      ["Gamma", "Distribuzione della luminosità"],
      ["Piatto", "Poco contrasto e saturazione"],
    ]),
  ]),
  L("gamma", "Spazi colore e gamma", "Perché lo stesso file sembra diverso su due schermi.", [
    T("Lo stesso file, schermi diversi", [
      "Un telefono con la luminosità al massimo, un monitor economico e una TV mostrano lo stesso video in modi diversi. Per questo chi corregge il colore usa un monitor **calibrato**.",
      "La **gamma** decide come i valori intermedi (i **mezzitoni**) diventano luce: una gamma più alta scurisce i mezzitoni, una più bassa li schiarisce.",
    ]),
    Q("Perché i colorist usano monitor calibrati?", ["Per giocare meglio", "Per vedere il colore reale e non quello falsato dallo schermo", "Perché costano meno", "Non serve"], 1, "Se lo schermo mente, ogni correzione è sbagliata."),
    T("Mezzitoni con i Livelli", [
      "L'effetto **Livelli** ha un cursore **Gamma**: sopra 1 schiarisce i mezzitoni **senza** toccare neri e bianchi. È il modo più pulito per aprire un'immagine un po' scura.",
    ]),
    Q("Vuoi schiarire i volti in ombra senza bruciare il cielo. Cosa tocchi?", ["La gamma (mezzitoni)", "Il punto di bianco", "Il volume", "La durata"], 0, "La gamma lavora sui mezzitoni e lascia stare gli estremi."),
    pr(
      "Apri i mezzitoni",
      "L'intervista è un po' scura nei mezzitoni. Applica l'effetto **Livelli** (Effetti video → Regolazione) e porta la **Gamma** tra **1,2** e **1,6**.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 8, patch: vfx(lumetri({ exposure: -0.6 })) }] }),
      [{ label: "Gamma dei Livelli tra **1,2** e **1,6**", test: (s) => vClips(s).some((c) => { const g = fxValue(c, "levels", "gamma"); return g !== null && g >= 1.2 && g <= 1.6; }) }],
    ),
  ]),
  L("log", "Log vs Rec.709", "Perché il girato Log sembra grigio e come si corregge.", [
    T("Il profilo Log", [
      "Le camere moderne registrano in **Log** (S-Log, V-Log, C-Log…): una curva che schiaccia luci e ombre per **conservare più gamma dinamica**.",
      "Il risultato appena importato è **grigio e slavato**. Non è un errore: è un negativo digitale che va **convertito** in Rec.709 (con una LUT tecnica o a mano).",
    ]),
    Q("Perché il girato Log appare grigio?", ["La camera è rotta", "La curva Log comprime luci e ombre per conservare dettagli", "Manca l'audio", "È in bianco e nero"], 1, "È fatto apposta: più informazione da recuperare dopo."),
    T("L'ordine giusto", [
      "Prima **converti** il Log (LUT tecnica o correzione), poi **correggi** (esposizione, bilanciamento), infine fai il **look** creativo. Invertire l'ordine rende tutto più difficile.",
    ]),
    Q("Qual è l'ordine corretto?", ["Look → conversione → correzione", "Conversione → correzione → look", "Correzione → look → conversione", "L'ordine non conta"], 1, "Prima si porta in Rec.709, poi si corregge, poi si crea lo stile."),
    pr(
      "Converti il Log a mano",
      "Il drone è stato girato in **Log**: grigio e spento. Con Lumetri porta il **Contrasto** complessivo ad almeno **0** e la **Saturazione** ad almeno **95**.",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 8, patch: vfx(lumetri({ contrast: -55, saturation: 45, shadows: 30 })) }] }),
      [
        { label: "Contrasto complessivo ≥ **0**", test: (s) => L1(s, "s-drone", "contrast", (v) => v >= 0) },
        { label: "Saturazione complessiva ≥ **95**", test: (s) => L1(s, "s-drone", "saturation", (v) => v >= 95) },
      ],
    ),
    pr(
      "Poi il look",
      "Ora che il drone è convertito, aggiungi **dopo** il Lumetri un effetto **Applica LUT colore** con il look **Cinematico teal & orange**.",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 8, patch: vfx(lumetri({ contrast: 10, saturation: 105 })) }] }),
      [
        { label: "LUT **Cinematico teal & orange**", test: (s) => vClips(s).some((c) => fxValue(c, "lut", "lut") === 1) },
        { label: "La LUT viene **dopo** il Lumetri", test: (s) => vClips(s).some((c) => { const i = c.effects.findIndex((e) => e.defId === "lumetri"); const j = c.effects.findIndex((e) => e.defId === "lut"); return i >= 0 && j > i; }) },
      ],
      "Effetti video → **Utilità → Applica LUT colore**. In Controlli effetti l'ordine dall'alto in basso è l'ordine di applicazione.",
    ),
  ]),
  L("bit-depth", "Bit depth e compressione", "8 bit, 10 bit e il banding.", [
    T("Quante sfumature", [
      "La **profondità di bit** dice quante sfumature ha ogni canale: **8 bit** = 256 livelli, **10 bit** = 1024. Con più livelli i passaggi graduali (un cielo, un muro) restano lisci.",
      "Con pochi bit e tanta compressione compare il **banding**: strisce visibili al posto di una sfumatura continua.",
    ]),
    Q("Quanti livelli per canale ha un video a 10 bit?", ["256", "1024", "16", "10"], 1, "2 alla decima = 1024 livelli, quattro volte l'8 bit."),
    T("Come si combatte il banding", [
      "Meglio prevenire (girare a 10 bit, non spingere troppo la correzione). Se c'è già, un pizzico di **grana** (*Aggiungi granulosità*) rompe le strisce e le rende invisibili.",
    ]),
    Q("Un cielo al tramonto mostra strisce di colore. Cosa aiuta?", ["Aggiungere un po' di grana", "Aumentare la saturazione al massimo", "Esportare a 1 Mbps", "Rallentare il video"], 0, "La grana maschera i gradini tra i livelli."),
    pr(
      "Nascondi il banding",
      "Il cielo del tramonto ha banding. Aggiungi **Aggiungi granulosità** (Disturbo e granulosità) con **Intensità** almeno **1,5**.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 8 }] }),
      [{ label: "Grana con intensità ≥ **1,5**", test: (s) => vClips(s).some((c) => (fxValue(c, "grain", "intensity") ?? 0) >= 1.5) }],
    ),
    M("Abbina", [
      ["8 bit", "256 livelli"],
      ["10 bit", "1024 livelli"],
      ["Banding", "Strisce nelle sfumature"],
      ["Grana", "Rompe le strisce"],
    ]),
  ]),
  L("hdr", "HDR in breve", "Cosa cambia con PQ e HLG.", [
    T("High Dynamic Range", [
      "L'**HDR** permette luci molto più **brillanti** e più dettagli nelle ombre rispetto all'SDR (Rec.709). Si misura in **nit**: l'SDR arriva a circa 100, l'HDR a 1000 e oltre.",
      "Due standard principali: **PQ** (HDR10, Dolby Vision: cinema e streaming) e **HLG** (broadcast, compatibile con le TV SDR).",
    ]),
    Q("Quale standard HDR è pensato per essere compatibile anche con le TV normali?", ["PQ", "HLG", "Rec.709", "ProRes"], 1, "HLG si vede in modo accettabile anche su schermi SDR."),
    T("Attenzione alle luci bruciate", [
      "In SDR le luci oltre il 100% si **bruciano** (bianco piatto senza dettagli). Anche quando lavori in SDR, tieni i bianchi sotto il limite: i dettagli persi non si recuperano.",
    ]),
    Q("Cosa significa \"luci bruciate\"?", ["Zone bianche senza più dettagli", "Colori troppo saturi", "Audio distorto", "Un tipo di transizione"], 0, "Il sensore (o la correzione) ha superato il massimo: lì c'è solo bianco."),
    pr(
      "Recupera le luci",
      "Il tramonto è sovraesposto e il cielo è bruciato. Con Lumetri porta l'**Esposizione** complessiva a **≤ 0,3** e le **Luci** a **≤ 0**.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 8, patch: vfx(lumetri({ exposure: 1.4, highlights: 60 })) }] }),
      [
        { label: "Esposizione complessiva ≤ **0,3**", test: (s) => L1(s, "s-tramonto", "exposure", (v) => v <= 0.3) },
        { label: "Luci ≤ **0**", test: (s) => L1(s, "s-tramonto", "highlights", (v) => v <= 0) },
      ],
    ),
  ]),

  // ---------------- Unità 12 · Gli scopes ----------------
  L("waveform", "La waveform", "Leggere luci e ombre con precisione.", [
    T("Misurare la luce", [
      "La **waveform** (forma d'onda) mostra la luminosità dell'immagine da **0** (nero) a **100** (bianco), da sinistra a destra come l'immagine.",
      "Un'immagine ben esposta occupa gran parte della scala: neri vicino a 0–5, bianchi vicino a 90–100, senza schiacciarsi sugli estremi.",
    ]),
    Q("Nella waveform, la traccia è tutta tra 0 e 30. L'immagine è…", ["Sovraesposta", "Sottoesposta", "Perfetta", "In bianco e nero"], 1, "Tutto in basso = tutto scuro."),
    T("Gli occhi mentono, gli scopes no", [
      "Dopo un po' l'occhio si **abitua** e un'immagine scura sembra normale. Gli **scopes** (Lumetri Scopes in Premiere) danno numeri oggettivi: affidati a loro.",
    ]),
    Q("Perché usare gli scopes invece di \"andare a occhio\"?", ["Sono più colorati", "L'occhio si abitua e sbaglia, gli scopes misurano", "Sono obbligatori per esportare", "Non servono"], 1, "Misurare invece di indovinare."),
    pr(
      "Riporta in scala",
      "Secondo la waveform la città è **sottoesposta** (tutta in basso). Correggi l'**Esposizione** complessiva in un valore tra **−0,4** e **+0,6**.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 8, patch: vfx(lumetri({ exposure: -1.6 })) }] }),
      [{ label: "Esposizione complessiva tra **−0,4** e **+0,6**", test: (s) => L1(s, "s-citta", "exposure", (v) => v >= -0.4 && v <= 0.6) }],
    ),
    M("Abbina", [
      ["0 IRE", "Nero"],
      ["100 IRE", "Bianco"],
      ["Traccia in basso", "Immagine scura"],
      ["Scopes", "Misure oggettive"],
    ]),
  ]),
  L("vectorscope", "Il vectorscope", "Tinta e saturazione sotto controllo.", [
    T("Un cerchio di colori", [
      "Il **vectorscope** è un cerchio: la **direzione** indica la **tinta** (rosso, giallo, verde, ciano, blu, magenta), la **distanza dal centro** indica la **saturazione**.",
      "Un'immagine in bianco e nero è un puntino al centro. Un'immagine troppo satura esce verso i bordi, oltre i riquadri di riferimento.",
    ]),
    Q("Nel vectorscope, cosa indica la distanza dal centro?", ["La luminosità", "La saturazione", "La durata", "Il volume"], 1, "Più lontano = più saturo."),
    T("Saturazione legale", [
      "Per la TV i colori non devono superare certi limiti (i riquadri del vectorscope). Sul web si è più liberi, ma colori troppo saturi sembrano finti e \"sbavano\".",
    ]),
    Q("Un'immagine perfettamente in bianco e nero nel vectorscope è…", ["Un cerchio pieno", "Un puntino al centro", "Una linea verso il rosso", "Invisibile"], 1, "Saturazione zero: tutto al centro."),
    pr(
      "Troppo saturo!",
      "Il caffè è stato saturato troppo e il vectorscope esce dai riquadri. Riporta la **Saturazione** complessiva tra **90** e **120**.",
      () => prSetup({ clips: [{ media: "s-caffe", at: 0, from: 0, to: 6, patch: vfx(lumetri({ saturation: 185 })) }] }),
      [{ label: "Saturazione complessiva **90–120**", test: (s) => L1(s, "s-caffe", "saturation", (v) => v >= 90 && v <= 120) }],
    ),
  ]),
  L("parade", "La parade RGB", "Trovare dominanti di colore.", [
    T("Tre canali affiancati", [
      "La **parade RGB** mostra tre waveform affiancate: **rosso**, **verde** e **blu**. Su qualcosa di neutro (bianco, grigio) i tre canali dovrebbero essere **alla stessa altezza**.",
      "Se il blu è più alto degli altri, l'immagine ha una **dominante fredda**; se il rosso è più alto, **calda**.",
    ]),
    Q("Nella parade il canale rosso è molto più alto di verde e blu. L'immagine è…", ["Troppo fredda", "Troppo calda", "Perfetta", "Sottoesposta"], 1, "Rosso in eccesso = dominante calda."),
    T("Correggere la dominante", [
      "In Lumetri: **Temperatura** sposta tra blu e arancio, **Tinta** tra verde e magenta. Porta i canali allineati sulle zone neutre.",
    ]),
    Q("Quale cursore corregge una dominante verde (luci al neon)?", ["Temperatura", "Tinta", "Esposizione", "Vignettatura"], 1, "La Tinta lavora sull'asse verde–magenta."),
    pr(
      "Togli la dominante calda",
      "La città è tutta arancione: nella parade il rosso domina. Riporta la **Temperatura** complessiva tra **−15** e **+15**.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 8, patch: vfx(lumetri({ temperature: 65 })) }] }),
      [{ label: "Temperatura complessiva **−15…+15**", test: (s) => L1(s, "s-citta", "temperature", (v) => Math.abs(v) <= 15) }],
    ),
    M("Abbina", [
      ["Blu alto", "Dominante fredda"],
      ["Rosso alto", "Dominante calda"],
      ["Temperatura", "Asse blu–arancio"],
      ["Tinta", "Asse verde–magenta"],
    ]),
  ]),
  L("istogramma", "L'istogramma", "Distribuzione dei toni a colpo d'occhio.", [
    T("Una montagna di pixel", [
      "L'**istogramma** conta quanti pixel ci sono per ogni livello di luminosità: a sinistra le ombre, a destra le luci.",
      "Una montagna **schiacciata contro il bordo sinistro** significa neri **chiusi** (persi); contro il destro, luci **bruciate**.",
    ]),
    Q("L'istogramma è schiacciato contro il bordo sinistro. Cosa succede?", ["Le ombre sono chiuse e i dettagli persi", "Le luci sono bruciate", "Va tutto bene", "C'è troppo audio"], 0, "I pixel sono accumulati sul nero assoluto."),
    T("Aprire le ombre", [
      "Il cursore **Ombre** di Lumetri solleva le zone scure senza toccare il resto: recupera dettagli nei capelli, nei vestiti scuri, negli angoli.",
    ]),
    Q("Quale cursore recupera i dettagli nelle zone scure?", ["Luci", "Ombre", "Saturazione", "Tinta"], 1, "Ombre agisce proprio lì."),
    pr(
      "Recupera le ombre",
      "Le ombre dell'intervista sono chiuse. Porta le **Ombre** complessive ad almeno **−10** (partono da −80) senza alzare l'esposizione oltre **+0,5**.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 8, patch: vfx(lumetri({ shadows: -80 })) }] }),
      [
        { label: "Ombre ≥ **−10**", test: (s) => L1(s, "s-intervista", "shadows", (v) => v >= -10) },
        { label: "Esposizione ≤ **+0,5**", test: (s) => L1(s, "s-intervista", "exposure", (v) => v <= 0.5) },
      ],
    ),
  ]),
  L("skin-line", "La linea dell'incarnato", "Pelli naturali con il vectorscope.", [
    T("Tutte le pelli su una linea", [
      "Nel vectorscope c'è una linea diagonale tra rosso e giallo: la **linea dell'incarnato** (skin tone line). Le pelli umane, **di qualsiasi colore**, cadono lì vicino: cambia la saturazione, non la tinta.",
      "Se il volto esce verso il **magenta** o il **verde**, le persone sembrano malate o finte.",
    ]),
    Q("La pelle di persone con carnagioni diverse nel vectorscope…", ["Sta in punti opposti", "Sta vicino alla stessa linea, cambia solo la distanza dal centro", "Non si vede", "È sempre al centro"], 1, "Stessa tinta, saturazione diversa."),
    T("Isolare il volto", [
      "Per controllare solo la pelle, i colorist ingrandiscono il volto o usano una maschera, così il vectorscope mostra solo quei pixel.",
    ]),
    Q("Il volto tende al verde. Cosa correggi?", ["La Tinta verso il magenta", "La Temperatura verso il blu", "Il volume", "La saturazione a zero"], 0, "Il verde si compensa con il magenta sull'asse della Tinta."),
    pr(
      "Pelle naturale",
      "L'intervistato ha la pelle **magenta**: la Tinta è a +50. Riporta la **Tinta** complessiva tra **−10** e **+10** e tieni la **Temperatura** entro ±20.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 8, patch: vfx(lumetri({ tint: 50, temperature: 10 })) }] }),
      [
        { label: "Tinta **−10…+10**", test: (s) => L1(s, "s-intervista", "tint", (v) => Math.abs(v) <= 10) },
        { label: "Temperatura entro **±20**", test: (s) => L1(s, "s-intervista", "temperature", (v) => Math.abs(v) <= 20) },
      ],
    ),
  ]),

  // ---------------- Unità 13 · Correzione primaria ----------------
  L("esposizione", "Esposizione", "Riportare luci e ombre nel range giusto.", [
    T("Il primo cursore", [
      "**Esposizione** in Lumetri alza o abbassa tutta l'immagine in **stop** (come sulla fotocamera): +1 raddoppia la luce, −1 la dimezza.",
      "È il primo passo di ogni correzione: prima la luce, poi il resto.",
    ]),
    Q("Esposizione +1 in Lumetri significa…", ["Un po' più chiaro", "Il doppio della luce (uno stop)", "Più saturazione", "Più contrasto"], 1, "Uno stop = il doppio della luce."),
    T("Luci e ombre separate", [
      "Dopo l'esposizione si rifiniscono **Luci** (zone chiare) e **Ombre** (zone scure) per riportare dettagli senza cambiare il resto.",
    ]),
    Q("Il cielo è bruciato ma il soggetto va bene. Cosa abbassi?", ["Le Luci", "Le Ombre", "La Tinta", "La Vividezza"], 0, "Le Luci agiscono solo sulle zone chiare."),
    pr(
      "Troppo scuro",
      "Il drone è sottoesposto di due stop. Riporta l'**Esposizione** complessiva tra **−0,3** e **+0,5**.",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 8, patch: vfx(lumetri({ exposure: -2 })) }] }),
      [{ label: "Esposizione **−0,3…+0,5**", test: (s) => L1(s, "s-drone", "exposure", (v) => v >= -0.3 && v <= 0.5) }],
    ),
    pr(
      "Troppo chiaro",
      "Ora il contrario: la città è **sovraesposta**. Esposizione complessiva tra **−0,3** e **+0,3** e **Luci** a **≤ 0**.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 8, patch: vfx(lumetri({ exposure: 1.5, highlights: 40 })) }] }),
      [
        { label: "Esposizione **−0,3…+0,3**", test: (s) => L1(s, "s-citta", "exposure", (v) => Math.abs(v) <= 0.3) },
        { label: "Luci ≤ **0**", test: (s) => L1(s, "s-citta", "highlights", (v) => v <= 0) },
      ],
    ),
  ]),
  L("contrasto", "Contrasto", "Dare profondità senza bruciare i dettagli.", [
    T("Profondità", [
      "Il **contrasto** è la distanza tra le zone scure e quelle chiare. Poco contrasto = immagine piatta; troppo = ombre chiuse e luci bruciate.",
      "Un buon contrasto separa il soggetto dallo sfondo e dà **tridimensionalità**.",
    ]),
    Q("Troppo contrasto rischia di…", ["Chiudere le ombre e bruciare le luci", "Abbassare il volume", "Rallentare il video", "Cambiare il formato"], 0, "Gli estremi si schiacciano e i dettagli si perdono."),
    T("Contrasto con controllo", [
      "Alza il **Contrasto** e poi recupera con **Luci** (giù) e **Ombre** (su) se gli estremi si perdono. È la stessa idea della curva a **S**.",
    ]),
    Q("Dopo aver alzato il contrasto il cielo è bruciato. Cosa fai?", ["Abbassi le Luci", "Alzi la saturazione", "Alzi le Luci", "Niente"], 0, "Le Luci recuperano le zone chiare."),
    pr(
      "Dai profondità",
      "Il tramonto è piatto. Porta il **Contrasto** complessivo ad almeno **+25**, ma tieni le **Luci** a **≤ +10** per non bruciare il cielo.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 8 }] }),
      [
        { label: "Contrasto ≥ **+25**", test: (s) => L1(s, "s-tramonto", "contrast", (v) => v >= 25) },
        { label: "Luci ≤ **+10**", test: (s) => L1(s, "s-tramonto", "highlights", (v) => v <= 10) && !!main(s, "s-tramonto") && enabledLum(main(s, "s-tramonto")!).length > 0 },
      ],
    ),
  ]),
  L("bilanciamento-bianco", "Bilanciamento del bianco", "Togliere dominanti calde o fredde.", [
    T("Il bianco deve essere bianco", [
      "Ogni luce ha una **temperatura colore**: la lampadina di casa è calda (arancio, ~3200 K), il cielo nuvoloso freddo (azzurro, ~6500 K e oltre).",
      "Se la camera non era impostata bene, l'immagine ha una **dominante**. Il bilanciamento la toglie: ciò che era bianco torna bianco.",
    ], { terms: [{ term: "Kelvin (K)", def: "Unità della temperatura colore" }, { term: "Contagocce", def: "Clicca su un bianco e Lumetri bilancia da solo" }] }),
    Q("Una ripresa in casa con lampadine a incandescenza tende al…", ["Blu", "Arancio", "Verde", "Viola"], 1, "La luce al tungsteno è calda."),
    T("Il contagocce", [
      "In Lumetri c'è il **contagocce del bilanciamento del bianco**: clicchi su qualcosa che dovrebbe essere bianco o grigio e Temperatura e Tinta si regolano da sole.",
    ]),
    Q("Su cosa clicchi con il contagocce del bilanciamento?", ["Su un volto", "Su qualcosa che dovrebbe essere bianco o grigio neutro", "Sul cielo blu", "Su un oggetto rosso"], 1, "Serve un riferimento neutro."),
    pr(
      "Scalda un'immagine fredda",
      "Il mare è troppo **blu** (Temperatura −60). Porta la **Temperatura** complessiva tra **−10** e **+10**.",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 8, patch: vfx(lumetri({ temperature: -60 })) }] }),
      [{ label: "Temperatura **−10…+10**", test: (s) => L1(s, "s-drone", "temperature", (v) => Math.abs(v) <= 10) }],
    ),
  ]),
  L("saturazione", "Saturazione e vividezza", "Colori vivi ma credibili.", [
    T("Due cursori diversi", [
      "**Saturazione** alza **tutti** i colori allo stesso modo. **Vividezza** alza soprattutto i colori **poco saturi** e protegge quelli già forti e la pelle.",
      "Per questo i colorist preferiscono quasi sempre la **Vividezza**: colori più ricchi senza volti arancioni.",
    ]),
    Q("Vuoi colori più vivi senza rendere i volti arancioni. Cosa usi?", ["Saturazione al massimo", "Vividezza", "Esposizione", "Tinta"], 1, "La Vividezza protegge le pelli e i colori già saturi."),
    T("Meno è meglio", [
      "Un'immagine troppo satura stanca in fretta e sembra finta. Spesso un **+10/+20** di vividezza basta.",
    ]),
    Q("Qual è un valore ragionevole di vividezza per un look naturale?", ["+15", "+100", "−100", "+500"], 0, "Piccoli ritocchi, grande differenza."),
    pr(
      "Colori vivi, volti naturali",
      "Rendi il caffè più invitante con la **Vividezza** (almeno **+20**) ma tieni la **Saturazione** complessiva a **≤ 120**.",
      () => prSetup({ clips: [{ media: "s-caffe", at: 0, from: 0, to: 6 }] }),
      [
        { label: "Vividezza ≥ **+20**", test: (s) => L1(s, "s-caffe", "vibrance", (v) => v >= 20) },
        { label: "Saturazione ≤ **120**", test: (s) => L1(s, "s-caffe", "saturation", (v) => v <= 120) },
      ],
    ),
  ]),
  L("match-clip", "Abbinare due clip", "Far sembrare due camere una sola.", [
    T("Una scena, un colore", [
      "Due camere diverse (o la stessa con luce diversa) danno colori diversi. Se le alterni senza correggere, lo spettatore **sente** il salto.",
      "Si sceglie una clip di **riferimento** (la *hero shot*) e si portano le altre verso di lei, guardando gli scopes affiancati.",
    ]),
    Q("Cos'è la clip di riferimento quando abbini il colore?", ["La più corta", "Quella su cui allinei tutte le altre", "L'ultima della timeline", "Una clip nera"], 1, "Tutte le altre si portano verso di lei."),
    T("Confronto affiancato", [
      "Lumetri ha la **Vista di confronto**: a sinistra il riferimento, a destra la clip da correggere. Si guarda soprattutto **pelle**, **bianchi** e **neri**.",
    ]),
    Q("Cosa guardi prima di tutto per abbinare due inquadrature di un'intervista?", ["La pelle e i neutri", "La durata", "Il volume", "I nomi dei file"], 0, "Pelle e neutri tradiscono subito le differenze."),
    pr(
      "Abbina le due inquadrature",
      "La prima clip (riferimento) è calda, la seconda è neutra. Porta la **seconda** clip alla stessa temperatura della prima (differenza ≤ **10**).",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 4, patch: vfx(lumetri({ temperature: 35 })) }, { media: "s-intervista", at: 4, from: 5, to: 9 }] }),
      [
        {
          label: "Temperature abbinate (≤ 10 di differenza)",
          test: (s) => {
            const v = vClips(s).filter((c) => c.mediaId === "s-intervista");
            return v.length >= 2 && Math.abs(lum(v[0], "temperature") - lum(v[1], "temperature")) <= 10 && lum(v[0], "temperature") > 15;
          },
        },
      ],
      "Seleziona la prima clip, **Ctrl+C**, poi la seconda e **Modifica → Incolla attributi** (Ctrl+Alt+V): copia anche il Lumetri.",
    ),
  ]),

  // ---------------- Unità 14 · Grading creativo ----------------
  L("lut", "Look e LUT", "Applicare una LUT nel punto giusto della catena.", [
    T("Cos'è una LUT", [
      "Una **LUT** (Look-Up Table) è una tabella che trasforma ogni colore in un altro. Ci sono LUT **tecniche** (da Log a Rec.709) e LUT **creative** (un look: teal & orange, pellicola…).",
      "Una LUT creativa va applicata **dopo** la correzione: se l'immagine di partenza è sbagliata, il look viene sbagliato.",
    ]),
    Q("Dove va una LUT creativa nella catena di effetti?", ["Prima di tutto", "Dopo la correzione primaria", "Al posto dell'audio", "Non importa"], 1, "Prima immagine corretta, poi il look."),
    T("Dosare il look", [
      "Una LUT applicata al 100% è spesso troppo forte. In Lumetri puoi abbassarne l'**intensità**, oppure metterla su un **livello di regolazione** con opacità ridotta.",
    ]),
    Q("La LUT è troppo forte. Come la ammorbidisci?", ["Abbassando intensità o opacità del livello di regolazione", "Esportando a 720p", "Aumentando il volume", "Non si può"], 0, "Si dosa come un ingrediente."),
    pr(
      "Correzione, poi look",
      "Il tramonto ha già una correzione Lumetri. Aggiungi **dopo** di essa **Applica LUT colore** con il look **Pellicola calda**.",
      () => prSetup({ clips: [{ media: "s-tramonto", at: 0, from: 0, to: 8, patch: vfx(lumetri({ contrast: 15 })) }] }),
      [
        { label: "LUT **Pellicola calda**", test: (s) => vClips(s).some((c) => fxValue(c, "lut", "lut") === 3) },
        { label: "Dopo il Lumetri", test: (s) => vClips(s).some((c) => { const i = c.effects.findIndex((e) => e.defId === "lumetri"); const j = c.effects.findIndex((e) => e.defId === "lut"); return i >= 0 && j > i; }) },
      ],
    ),
    pr(
      "Un look per tutta la sequenza",
      "Applica il look a **tutte** le clip in un colpo: crea un **Livello di regolazione** (File → Nuovo), mettilo su **V2** sopra le clip e applicagli la LUT **Cinematico teal & orange**.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 4, a: null }, { media: "s-drone", at: 4, from: 0, to: 4 }] }),
      [
        { label: "Livello di regolazione su V2", test: (s) => vClips(s, 2).some((c) => s.project.media[c.mediaId]?.kind === "adjustment") },
        { label: "…con la LUT teal & orange", test: (s) => vClips(s, 2).some((c) => s.project.media[c.mediaId]?.kind === "adjustment" && fxValue(c, "lut", "lut") === 1) },
        { label: "Copre tutte e due le clip", test: (s) => vClips(s, 2).some((c) => s.project.media[c.mediaId]?.kind === "adjustment" && c.start <= 0.5 && c.start + (c.out - c.in) / c.speed >= 7.5) },
      ],
      "Il livello di regolazione compare nel pannello Progetto: trascinalo su V2 e allungalo fino a 8 s trascinandone il bordo.",
    ),
  ]),
  L("curve", "Le curve", "Il controllo più potente del colorist.", [
    T("La curva dei toni", [
      "La **curva** mette in un grafico l'ingresso (orizzontale) e l'uscita (verticale). Una linea dritta non cambia niente; spostando i punti cambi ombre, mezzitoni e luci in modo preciso.",
      "La classica **curva a S** abbassa un po' le ombre e alza un po' le luci: più contrasto, ma morbido.",
    ]),
    Q("Che effetto ha una curva a S?", ["Più contrasto morbido", "Bianco e nero", "Meno luce ovunque", "Inverte i colori"], 0, "Ombre giù, luci su: contrasto controllato."),
    T("Punto nero e punto bianco", [
      "Gli estremi della curva sono il **punto nero** e il **punto bianco**. Spostarli verso l'interno \"stira\" l'immagine: è esattamente ciò che fa l'effetto **Livelli** con *Input nero* e *Input bianco*.",
    ], { tip: "Nel simulatore usiamo Livelli: stesso principio dei due estremi della curva." }),
    Q("Alzare l'Input nero dei Livelli da 0 a 15 fa sì che…", ["I grigi scuri diventino neri: più contrasto nelle ombre", "L'immagine diventi bianca", "L'audio aumenti", "Niente"], 0, "Tutto ciò che era sotto 15 diventa nero puro."),
    pr(
      "Stira i toni",
      "Il caffè è grigiastro. Con **Livelli** porta l'**Input nero** ad almeno **12** e l'**Input bianco** a **≤ 240**: neri più neri, bianchi più bianchi.",
      () => prSetup({ clips: [{ media: "s-caffe", at: 0, from: 0, to: 6, patch: vfx(lumetri({ contrast: -30 })) }] }),
      [
        { label: "Input nero ≥ **12**", test: (s) => vClips(s).some((c) => (fxValue(c, "levels", "inB") ?? 0) >= 12) },
        { label: "Input bianco ≤ **240**", test: (s) => vClips(s).some((c) => (fxValue(c, "levels", "inW") ?? 255) <= 240) },
      ],
    ),
  ]),
  L("hsl", "Correzione secondaria HSL", "Isolare e cambiare un solo colore.", [
    T("Primaria e secondaria", [
      "La correzione **primaria** agisce su tutta l'immagine. La **secondaria** isola una parte: un colore (con l'HSL), una zona (con una maschera) o entrambi.",
      "Con l'**HSL secondaria** di Lumetri selezioni un colore (es. il verde dell'erba) e ne cambi tinta, saturazione e luminosità senza toccare il resto.",
    ], { terms: [{ term: "H", def: "Hue, tinta" }, { term: "S", def: "Saturation, saturazione" }, { term: "L", def: "Luminance, luminosità" }] }),
    Q("Vuoi rendere più blu solo il cielo, senza toccare i volti. Cosa usi?", ["Correzione primaria", "HSL secondaria", "Esposizione", "Volume"], 1, "La secondaria isola un solo colore."),
    T("Ruotare la tinta", [
      "**Bilanciamento colore (HLS)** ruota la **tinta** di tutta l'immagine di un certo angolo: +30° sposta i rossi verso l'arancio, i verdi verso il ciano… È utile per capire come funziona la ruota dei colori.",
    ]),
    Q("Ruotare la tinta di 180° trasforma il blu in…", ["Arancione/giallo", "Blu più scuro", "Grigio", "Verde"], 0, "Sulla ruota dei colori, l'opposto del blu è l'arancio."),
    pr(
      "Gira la ruota dei colori",
      "Applica al drone **Bilanciamento colore (HLS)** e ruota la **Tonalità** di almeno **30°** (in un verso o nell'altro) per trasformare il mare in un colore fantasy.",
      () => prSetup({ clips: [{ media: "s-drone", at: 0, from: 0, to: 8 }] }),
      [{ label: "Tonalità ruotata di ≥ **30°**", test: (s) => vClips(s).some((c) => Math.abs(fxValue(c, "hls", "hue") ?? 0) >= 30) }],
    ),
  ]),
  L("maschere-colore", "Maschere e tracking", "Correggere solo una zona dell'immagine.", [
    T("Correggere una zona", [
      "Con una **maschera** limiti un effetto a una zona: schiarire solo il volto, scurire solo il cielo, sfocare una targa.",
      "Una maschera **sfumata** (feather alto) rende la correzione invisibile: il passaggio è graduale.",
    ]),
    Q("Perché si sfuma il bordo di una maschera di correzione?", ["Per renderla invisibile con un passaggio graduale", "Per esportare più veloce", "Per cambiare il formato", "Non si sfuma mai"], 0, "Un bordo netto si noterebbe subito."),
    T("Il tracking", [
      "Se il soggetto si muove, la maschera deve **seguirlo**: il **tracking** analizza il movimento fotogramma per fotogramma e sposta la maschera da solo.",
    ]),
    Q("Il volto da schiarire si muove nell'inquadratura. Cosa serve?", ["Il tracking della maschera", "Un'altra sequenza", "La regola dei 180°", "Un fermo immagine"], 0, "Il tracking fa seguire la maschera al soggetto."),
    ae(
      "Una luce solo sul soggetto",
      "In After Effects: c'è un **livello di regolazione** sopra il video. Disegnagli una **maschera ellittica** (strumento Ellisse, **Q**), sfumala (**Sfumatura maschera** ≥ **40**) e applica **Lumetri Color** con **Esposizione** ≥ **+0,5**.",
      () =>
        aeSetup({
          layers: (comp, media) => [aeLayer("adjustment", comp, { name: "Correzione volto" }), aeLayer("footage", comp, {}, media["s-tramonto"])],
          media: ["s-tramonto", "s-green", "s-drone"],
        }),
      [
        { label: "Maschera sul livello di regolazione", test: (s) => aeLayers(s).some((l) => l.type === "adjustment" && l.masks.length > 0) },
        { label: "Sfumatura ≥ **40**", test: (s) => aeLayers(s).some((l) => l.type === "adjustment" && l.masks.some((m) => (m.feather.keys?.[0]?.v[0] ?? m.feather.value[0]) >= 40)) },
        { label: "Lumetri con Esposizione ≥ **+0,5**", test: (s) => aeLayers(s).some((l) => l.type === "adjustment" && l.effects.some((e) => e.defId === "lumetri" && pv(e, "exposure") >= 0.5)) },
      ],
      "Seleziona il livello di regolazione, scegli lo strumento **Ellisse** e trascina nel pannello Composizione. Premi **F** per vedere la Sfumatura maschera.",
    ),
  ]),
  L("creare-look", "Creare un look", "Teal & orange, vintage, bianco e nero.", [
    T("I look più famosi", [
      "**Teal & orange**: ombre verso il verde-azzurro, pelli e luci verso l'arancio. È il look dei blockbuster: separa le persone dallo sfondo.",
      "**Vintage**: neri sollevati (mai nero puro), colori smorzati, un po' di grana e una dominante calda. **Bianco e nero**: tutto sta nel contrasto.",
    ]),
    Q("Perché il teal & orange funziona così bene?", ["Perché la pelle (arancio) risalta sul suo complementare (teal)", "Perché pesa meno", "Perché è in bianco e nero", "Per caso"], 0, "Colori complementari = massimo stacco."),
    T("La vignettatura", [
      "Una **vignettatura** leggera scurisce i bordi e porta l'occhio al centro. In Lumetri, valori **negativi** scuriscono gli angoli.",
    ]),
    Q("A cosa serve una vignettatura leggera?", ["A guidare lo sguardo verso il centro", "Ad alzare il volume", "A stabilizzare", "A sottotitolare"], 0, "Bordi più scuri, centro protagonista."),
    pr(
      "Look cinematografico",
      "Crea un look da film sulla città: LUT **Cinematico teal & orange**, **Contrasto** complessivo ≥ **+15** e **Vignettatura** ≤ **−0,5**.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 8, a: null }] }),
      [
        { label: "LUT teal & orange", test: (s) => vClips(s).some((c) => fxValue(c, "lut", "lut") === 1) },
        { label: "Contrasto ≥ **+15**", test: (s) => L1(s, "s-citta", "contrast", (v) => v >= 15) },
        { label: "Vignettatura ≤ **−0,5**", test: (s) => L1(s, "s-citta", "vignette", (v) => v <= -0.5) },
      ],
    ),
    pr(
      "Bianco e nero d'autore",
      "Trasforma l'intervista in un **bianco e nero** contrastato: effetto **Bianco e nero** (o Saturazione 0) e **Contrasto** ≥ **+25**.",
      () => prSetup({ clips: [{ media: "s-intervista", at: 0, from: 0, to: 8 }] }),
      [
        { label: "In **bianco e nero**", test: (s) => vClips(s).some((c) => !!clipEffect(c, "bw") || (enabledLum(c).length > 0 && lum(c, "saturation") <= 1)) },
        { label: "Contrasto ≥ **+25**", test: (s) => L1(s, "s-intervista", "contrast", (v) => v >= 25) },
      ],
    ),
  ]),
];

