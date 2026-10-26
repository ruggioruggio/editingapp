import type { Lesson } from "@/lib/lessons/types";
import { prop } from "@/lib/studio/anim";
import type { AeState, Layer } from "@/lib/studio/ae";
import { aeKeys, aeLayer, aeLayers, aeSetup, allComps, animated, anyEased, anyExpr, findLayer, key, keyRange, layerFx, prSetup, vClips, fxValue } from "@/lib/lessons/studioKit";
import { ae, lesson as L, M, pr, Q, T } from "./s1-practice";

// Sezione 4 "Motion graphics": After Effects dalle composizioni agli
// effetti visivi. Quasi ogni lezione ha due esercizi nel simulatore.

const named = (s: AeState, re: RegExp) => findLayer(s, (l) => re.test(l.name));
const bg = (comp: Parameters<typeof aeLayer>[1], color = "#1f1f3d") => aeLayer("solid", comp, { name: "Sfondo", color });
const text = (comp: Parameters<typeof aeLayer>[1], t: string, extra: Partial<Layer> = {}) => aeLayer("text", comp, { name: t, text: t, ...extra });
const shape = (comp: Parameters<typeof aeLayer>[1], name: string, kind: "rect" | "ellipse" | "star", w: number, h: number, fill: string, extra: Partial<Layer> = {}) => {
  const l = aeLayer("shape", comp, { name, ...extra });
  l.shape = { ...l.shape!, kind, size: prop(w, h), fill };
  return l;
};
const valueOf = (p: { value: number[]; keys: { v: number[] }[] | null }) => p.keys?.[0]?.v ?? p.value;

export const section4Lessons: Lesson[] = [
  // ---------------- Unità 15 · After Effects: le basi ----------------
  L("composizioni", "Composizioni", "Il contenitore di ogni animazione.", [
    T("La composizione", [
      "In After Effects tutto vive dentro una **composizione** (comp): ha dimensioni, frequenza fotogrammi, **durata** e un colore di sfondo, come una sequenza di Premiere.",
      "Si crea con **Composizione → Nuova composizione** (**Ctrl+N**). Dentro ci sono i **livelli**, impilati: quello in alto copre quelli sotto.",
    ]),
    Q("Qual è la differenza principale tra una sequenza di Premiere e una composizione di After Effects?", ["Nessuna", "La comp ha una durata fissa decisa alla creazione", "La comp non ha dimensioni", "La comp non può avere video"], 1, "In AE scegli la durata in anticipo; in Premiere la sequenza si allunga da sola."),
    T("Le impostazioni giuste", [
      "Per i social: **1080×1920** o **1080×1080**. Per YouTube: **1920×1080**. La **durata** conviene sceglierla un po' più lunga del necessario: si può accorciare dopo con l'**area di lavoro**.",
    ]),
    Q("Come crei una nuova composizione?", ["Ctrl+N", "Ctrl+K", "Ctrl+M", "Ctrl+D"], 0, "Come in Premiere, N come Nuova."),
    ae(
      "La tua prima composizione",
      "Crea una composizione chiamata **Intro**, **1920×1080**, **30 fps**, durata **10 secondi** (Composizione → Nuova composizione).",
      () => aeSetup({ noComp: true }),
      [
        { label: "Comp **1920×1080**", test: (s) => allComps(s).some((c) => c.width === 1920 && c.height === 1080) },
        { label: "A **30 fps**", test: (s) => allComps(s).some((c) => c.width === 1920 && Math.abs(c.fps - 30) < 0.05) },
        { label: "Dura **10 s**", test: (s) => allComps(s).some((c) => Math.abs(c.duration - 10) < 0.05) },
        { label: "Si chiama **Intro**", test: (s) => allComps(s).some((c) => /intro/i.test(c.name)) },
      ],
    ),
    ae(
      "Riempila",
      "Aggiungi alla composizione uno sfondo: **Livello → Nuovo → Tinta unita** (**Ctrl+Y**) e un **testo** con lo strumento Testo (**Ctrl+T**).",
      () => aeSetup({ name: "Intro", duration: 10, layers: () => [] }),
      [
        { label: "Una **tinta unita**", test: (s) => aeLayers(s).some((l) => l.type === "solid") },
        { label: "Un livello di **testo**", test: (s) => aeLayers(s).some((l) => l.type === "text") },
        { label: "Il testo sta **sopra** lo sfondo", test: (s) => { const ls = aeLayers(s); return ls.findIndex((l) => l.type === "text") >= 0 && ls.findIndex((l) => l.type === "text") < ls.findIndex((l) => l.type === "solid"); } },
      ],
      "Nella timeline di AE il livello **in alto** è quello davanti: trascinalo su o giù per cambiare l'ordine.",
    ),
  ]),
  L("livelli", "Livelli e precomposizioni", "Organizzare progetti complessi.", [
    T("Tanti tipi di livelli", [
      "**Tinta unita** (un colore), **testo**, **forma**, **metraggio** (video, immagini), **livello di regolazione** (applica effetti a tutto ciò che sta sotto), **oggetto nullo** (invisibile, serve per controllare altri livelli).",
    ]),
    Q("Quale livello è invisibile e serve a guidare altri livelli?", ["Tinta unita", "Oggetto nullo", "Testo", "Forma"], 1, "Il nullo non si vede nel render: è una maniglia."),
    T("Precomporre", [
      "Quando i livelli diventano tanti, li raggruppi in una **precomposizione** (**Ctrl+Maiusc+C**): diventano un unico livello che contiene una comp. È come una cartella che si anima tutta insieme.",
    ]),
    Q("Che scorciatoia precompone i livelli selezionati?", ["Ctrl+Maiusc+C", "Ctrl+D", "Ctrl+K", "Alt+P"], 0, "C come Compose: Ctrl+Maiusc+C."),
    ae(
      "Raggruppa il titolo",
      "Seleziona il testo **SQUEAK** e la forma **Barra** e **precomponili** (Ctrl+Maiusc+C). Nella comp principale deve restare un livello di **composizione** al posto loro.",
      () => aeSetup({ layers: (c) => [text(c, "SQUEAK"), shape(c, "Barra", "rect", 900, 24, "#ffc93c", { transform: { ...aeLayer("shape", c).transform, position: prop(960, 640) } }), bg(c)] }),
      [
        { label: "Esiste un livello **precomposizione**", test: (s) => aeLayers(s).some((l) => l.type === "precomp") },
        { label: "Il testo è dentro la precomp", test: (s) => allComps(s).some((c) => c.id !== s.activeComp && c.layers.some((l) => l.type === "text")) },
      ],
      "Clic sul primo livello, **Ctrl+clic** sul secondo, poi **Livello → Precomponi**.",
    ),
    ae(
      "Un nullo di controllo",
      "Aggiungi un **oggetto nullo** (Livello → Nuovo → Oggetto nullo) e rinominalo **Controllo** (Invio sul nome).",
      () => aeSetup({ layers: (c) => [text(c, "SQUEAK"), bg(c)] }),
      [
        { label: "Un **oggetto nullo**", test: (s) => aeLayers(s).some((l) => l.type === "null") },
        { label: "Si chiama **Controllo**", test: (s) => aeLayers(s).some((l) => l.type === "null" && /controllo/i.test(l.name)) },
      ],
    ),
  ]),
  L("forme", "Livelli forma", "Disegnare e animare forme vettoriali.", [
    T("Forme vettoriali", [
      "I **livelli forma** si disegnano con gli strumenti Rettangolo, Ellisse, Stella (**Q** per scorrerli). Sono **vettoriali**: puoi ingrandirli quanto vuoi senza perdere qualità.",
      "Ogni forma ha **Riempimento**, **Traccia** e proprietà animabili come la **Dimensione**.",
    ]),
    Q("Perché le forme vettoriali non perdono qualità quando le ingrandisci?", ["Sono disegnate con formule, non con pixel", "Sono in 4K", "Sono in bianco e nero", "Non è vero"], 0, "Il vettoriale si ricalcola a ogni dimensione."),
    T("L'animazione \"pop\"", [
      "L'entrata più usata nella motion graphics è il **pop**: la forma parte da **0** e cresce fino alla sua dimensione, spesso con un piccolo **rimbalzo** (supera e torna).",
    ]),
    Q("Un'animazione \"pop\" parte da una dimensione di…", ["0", "100", "1000", "-50"], 0, "Da niente a tutto: compare crescendo."),
    ae(
      "Disegna una stella",
      "Disegna una **stella** con lo strumento Stella (**Q** finché non la trovi) nel pannello Composizione.",
      () => aeSetup({ layers: (c) => [bg(c)] }),
      [{ label: "Un livello forma **stella**", test: (s) => aeLayers(s).some((l) => l.shape?.kind === "star") }],
    ),
    ae(
      "Falla esplodere (pop)",
      "Anima la **Dimensione** della forma **Formaggio**: keyframe a **0** e poi alla dimensione piena (almeno 200), con **Easy Ease**.",
      () => aeSetup({ layers: (c) => [shape(c, "Formaggio", "ellipse", 260, 260, "#ffc93c"), bg(c)], open: (ls) => ({ [ls[0].id]: ["s.size"] }) }),
      [
        { label: "Almeno 2 keyframe di **Dimensione**", test: (s) => aeKeys(named(s, /formaggio/i), "s.size").length >= 2 },
        { label: "Parte da ~0 e arriva a ≥ 200", test: (s) => { const r = keyRange(named(s, /formaggio/i), "s.size"); return r.min <= 10 && r.max >= 200; } },
        { label: "Con **Easy Ease**", test: (s) => anyEased(s, "s.size") },
      ],
    ),
  ]),
  L("maschere-matte", "Maschere e track matte", "Mostrare solo una parte di un livello.", [
    T("Le maschere", [
      "Una **maschera** è un tracciato disegnato su un livello: solo l'interno resta visibile. Con **Sfumatura** il bordo diventa morbido, con **Espansione** la maschera si allarga o si restringe.",
      "Animando l'espansione ottieni una **rivelazione**: l'immagine si apre dal centro.",
    ]),
    Q("Quale proprietà della maschera rende il bordo morbido?", ["Sfumatura", "Opacità", "Espansione", "Rotazione"], 0, "La sfumatura (feather) ammorbidisce il bordo."),
    T("Track matte", [
      "Un **track matte** usa un livello (ad esempio un testo) come maschera per quello sotto: il video si vede **dentro le lettere**. È l'effetto dei titoli \"pieni di immagini\".",
    ]),
    Q("Vuoi un video che si veda dentro le lettere di un titolo. Cosa usi?", ["Un track matte", "Un fermo immagine", "Un nullo", "Un'espressione"], 0, "Il testo fa da finestra sul video."),
    ae(
      "Effetto riflettore",
      "Sul drone disegna una **maschera ellittica** (strumento Ellisse con il livello selezionato) e sfumala con **Sfumatura maschera** ≥ **60**.",
      () => aeSetup({ layers: (c, m) => [aeLayer("footage", c, {}, m["s-drone"])] }),
      [
        { label: "Una **maschera ellittica**", test: (s) => aeLayers(s).some((l) => l.masks.some((m) => m.kind === "ellipse")) },
        { label: "Sfumatura ≥ **60**", test: (s) => aeLayers(s).some((l) => l.masks.some((m) => valueOf(m.feather)[0] >= 60)) },
      ],
    ),
    ae(
      "Rivelazione",
      "Ora anima l'**Espansione maschera** del drone: da molto negativa (≤ **−200**, maschera chiusa) a **0** o più, così l'immagine si apre.",
      () =>
        aeSetup({
          layers: (c, m) => {
            const l = aeLayer("footage", c, {}, m["s-drone"]);
            l.masks = [{ id: "mk1", name: "Maschera 1", mode: "add", inverted: false, kind: "ellipse", path: [460, 140, 1000, 800], feather: prop(80), opacity: prop(100), expansion: prop(0) }];
            return [l];
          },
          open: (ls) => ({ [ls[0].id]: ["m.0.expansion"] }),
        }),
      [
        { label: "Almeno 2 keyframe di **Espansione**", test: (s) => aeLayers(s).some((l) => aeKeys(l, "m.0.expansion").length >= 2) },
        { label: "Da chiusa (≤ −200) ad aperta (≥ 0)", test: (s) => aeLayers(s).some((l) => { const r = keyRange(l, "m.0.expansion"); return r.min <= -200 && r.max >= 0; }) },
      ],
    ),
  ]),
  L("parenting", "Parenting", "Collegare livelli che si muovono insieme.", [
    T("Genitore e figlio", [
      "Con il **parenting** un livello (figlio) segue tutti i movimenti di un altro (genitore): posizione, scala, rotazione. Il figlio può avere anche movimenti suoi.",
      "Si fa con la colonna **Genitore** della timeline: menu a tendina o la **frusta** (pick whip) trascinata sul genitore.",
    ]),
    Q("Se ruoti il genitore, cosa fa il figlio?", ["Resta fermo", "Ruota insieme al genitore", "Sparisce", "Si duplica"], 1, "Il figlio eredita le trasformazioni del genitore."),
    T("Il nullo come burattinaio", [
      "Trucco da pro: collega più livelli a un **oggetto nullo** e anima solo il nullo. Sposti, ruoti o scali tutto il gruppo con un solo set di keyframe.",
    ]),
    Q("Vuoi muovere insieme logo, testo e barra. Cosa fai?", ["Li colleghi a un nullo e animi il nullo", "Animi ognuno separatamente", "Li esporti", "Usi una transizione"], 0, "Un solo controllo per tutto il gruppo."),
    ae(
      "Il braccio segue il corpo",
      "Il **Corpo** si muove già. Collega il **Braccio** al Corpo come **genitore** (colonna Genitore).",
      () =>
        aeSetup({
          layers: (c) => {
            const body = shape(c, "Corpo", "rect", 200, 300, "#9999ff");
            body.transform.position = animated([key(0, 500, 600), key(3, 1400, 600)]);
            const arm = shape(c, "Braccio", "rect", 60, 220, "#ffc93c", { transform: { ...body.transform, position: prop(640, 560) } });
            return [arm, body, bg(c)];
          },
        }),
      [{ label: "Braccio → genitore **Corpo**", test: (s) => { const b = named(s, /corpo/i); return !!b && named(s, /braccio/i)?.parent === b.id; } }],
    ),
    ae(
      "Il burattinaio",
      "Crea un **oggetto nullo**, collega **sia il logo sia il testo** al nullo e anima la **Rotazione** del nullo (almeno 2 keyframe).",
      () => aeSetup({ layers: (c, m) => [text(c, "SQUEAKEDIT", { transform: { ...aeLayer("text", c).transform, position: prop(960, 760) } }), aeLayer("footage", c, { transform: { ...aeLayer("footage", c, {}, m["s-logo"]).transform, scale: prop(40, 40) } }, m["s-logo"]), bg(c)] }),
      [
        { label: "Un **oggetto nullo**", test: (s) => aeLayers(s).some((l) => l.type === "null") },
        { label: "Logo e testo figli del nullo", test: (s) => { const n = aeLayers(s).find((l) => l.type === "null"); return !!n && aeLayers(s).filter((l) => l.parent === n.id).length >= 2; } },
        { label: "Il nullo ruota (2 keyframe)", test: (s) => aeLayers(s).some((l) => l.type === "null" && aeKeys(l, "t.rotation").length >= 2) },
      ],
    ),
  ]),

  // ---------------- Unità 16 · Testo animato ----------------
  L("animatori-testo", "Animatori di testo", "Animare lettera per lettera.", [
    T("Animare il testo dall'interno", [
      "Gli **animatori di testo** cambiano proprietà (opacità, posizione, spaziatura…) **lettera per lettera** grazie a un **selettore di intervallo** che decide quali lettere sono colpite.",
      "Animando la **fine** del selettore da 0% a 100% le lettere compaiono una alla volta; animando la **spaziatura** il titolo si \"apre\".",
    ]),
    Q("Cosa decide il selettore di intervallo?", ["Quali lettere vengono animate", "Il colore del testo", "La durata della comp", "Il font"], 0, "Inizio, fine e offset scelgono le lettere."),
    T("La spaziatura che si apre", [
      "Un classico dei trailer: il titolo compare con le lettere **strette** e lentamente si **allarga**. Si anima la **Spaziatura** (tracking) dall'animatore.",
    ]),
    Q("Quale proprietà anima per far \"respirare\" un titolo da trailer?", ["Spaziatura (tracking)", "Opacità del livello", "Volume", "Durata"], 0, "Le lettere si allontanano piano piano."),
    ae(
      "Titolo da trailer",
      "Apri **Animatore 1** del testo e anima la **Spaziatura**: da **0** ad almeno **200** in 2–4 secondi.",
      () => aeSetup({ layers: (c) => [text(c, "SQUEAKEDIT"), bg(c, "#0b0b14")], open: (ls) => ({ [ls[0].id]: ["x.tracking"] }) }),
      [
        { label: "Almeno 2 keyframe di **Spaziatura**", test: (s) => aeKeys(aeLayers(s).find((l) => l.type === "text"), "x.tracking").length >= 2 },
        { label: "Da ~0 ad almeno **200**", test: (s) => { const r = keyRange(aeLayers(s).find((l) => l.type === "text"), "x.tracking"); return r.min <= 20 && r.max >= 200; } },
      ],
    ),
    ae(
      "Lettera per lettera",
      "Ora fai comparire il testo lettera per lettera: anima **Selettore intervallo: Fine** da **0%** a **100%**.",
      () => aeSetup({ layers: (c) => [text(c, "CIAO MONDO"), bg(c, "#0b0b14")], open: (ls) => ({ [ls[0].id]: ["x.range"] }) }),
      [
        { label: "Fine da **0%**", test: (s) => keyRange(aeLayers(s).find((l) => l.type === "text"), "x.range").min <= 5 },
        { label: "…a **100%**", test: (s) => keyRange(aeLayers(s).find((l) => l.type === "text"), "x.range").max >= 95 },
      ],
    ),
  ]),
  L("titoli-cinetici", "Tipografia cinetica", "Parole che seguono la voce.", [
    T("Le parole che si muovono", [
      "La **tipografia cinetica** fa comparire le parole **a tempo con la voce**: ogni parola entra quando viene pronunciata, con dimensioni e movimenti diversi per dare enfasi.",
      "Le parole importanti sono **più grandi** e restano più a lungo; quelle di collegamento più piccole e veloci.",
    ]),
    Q("In tipografia cinetica, come metti in risalto una parola chiave?", ["Più grande e con più tempo a schermo", "Più piccola e veloce", "Nascondendola", "In grigio"], 0, "Gerarchia visiva = gerarchia di significato."),
    T("Lo scaglionamento", [
      "Le entrate vanno **scaglionate**: la seconda parola parte qualche fotogramma dopo la prima. In AE basta spostare i livelli nel tempo, o usare **Animazione → Assistente fotogrammi chiave → Sequenza livelli**.",
    ]),
    Q("Cosa vuol dire scaglionare le animazioni?", ["Farle partire una dopo l'altra", "Farle tutte insieme", "Cancellarle", "Esportarle"], 0, "Un piccolo ritardo tra un elemento e l'altro crea ritmo."),
    ae(
      "Tre parole, tre tempi",
      "Fai entrare le tre parole **IMPARA**, **A** e **MONTARE** con un pop di **Scala** (da 0 a 100), una **dopo l'altra**: i primi keyframe devono partire in tempi diversi (almeno 0,2 s di distanza).",
      () =>
        aeSetup({
          layers: (c) => [
            text(c, "MONTARE", { transform: { ...aeLayer("text", c).transform, position: prop(960, 700) } }),
            text(c, "A", { transform: { ...aeLayer("text", c).transform, position: prop(960, 540) } }),
            text(c, "IMPARA", { transform: { ...aeLayer("text", c).transform, position: prop(960, 380) } }),
            bg(c, "#141428"),
          ],
        }),
      [
        { label: "Tutte e 3 le parole hanno un pop di **Scala**", test: (s) => aeLayers(s).filter((l) => l.type === "text" && keyRange(l, "t.scale").min <= 10 && keyRange(l, "t.scale").max >= 90).length >= 3 },
        {
          label: "Entrate **scaglionate**",
          test: (s) => {
            const t = aeLayers(s)
              .filter((l) => l.type === "text")
              .map((l) => Math.min(...aeKeys(l, "t.scale").map((k) => k.t)))
              .sort((a, b) => a - b);
            return t.length >= 3 && t.every((x, i) => i === 0 || x - t[i - 1] >= 0.2);
          },
        },
      ],
      "Anima la prima parola, poi copia i keyframe (**Ctrl+C**), seleziona la parola dopo, sposta l'indicatore più avanti e incolla (**Ctrl+V**).",
    ),
  ]),
  L("typewriter", "Effetto macchina da scrivere", "Testo che compare carattere per carattere.", [
    T("Una lettera alla volta", [
      "L'effetto **macchina da scrivere** fa comparire il testo **un carattere per volta**, come se qualcuno lo stesse scrivendo. Perfetto per messaggi, date, luoghi.",
      "In AE si anima la **fine del selettore di intervallo** da 0% a 100% (o si usa il preset *Typewriter*).",
    ]),
    Q("Quale proprietà anima per l'effetto macchina da scrivere?", ["La fine del selettore di intervallo", "La scala del livello", "Il colore di sfondo", "La durata della comp"], 0, "Da 0% a 100%: le lettere compaiono una dopo l'altra."),
    T("Con le espressioni", [
      "Invece dei keyframe puoi scrivere un'**espressione** sulla proprietà (Alt+clic sul cronometro): ad esempio **linear(time, 0, 2, 0, 100)** fa andare il valore da 0 a 100 nei primi 2 secondi.",
    ]),
    Q("L'espressione linear(time, 0, 2, 0, 100) cosa fa?", ["Va da 0 a 100 nei primi 2 secondi", "Ripete all'infinito", "Genera numeri a caso", "Non fa niente"], 0, "Converte il tempo 0–2 s nell'intervallo 0–100."),
    ae(
      "Scrivi il messaggio",
      "Fai comparire **Ciao, sono Squeak!** come una macchina da scrivere: **Fine intervallo** da **0** a **100%** in almeno **1,5 secondi**.",
      () => aeSetup({ layers: (c) => [text(c, "Ciao, sono Squeak!"), bg(c, "#101018")], open: (ls) => ({ [ls[0].id]: ["x.range"] }) }),
      [
        { label: "Parte da **0%**", test: (s) => keyRange(aeLayers(s).find((l) => l.type === "text"), "x.range").first <= 5 },
        { label: "Arriva al **100%**", test: (s) => keyRange(aeLayers(s).find((l) => l.type === "text"), "x.range").last >= 95 },
        { label: "Dura almeno **1,5 s**", test: (s) => keyRange(aeLayers(s).find((l) => l.type === "text"), "x.range").span >= 1.5 },
      ],
    ),
    ae(
      "Con un'espressione",
      "Rifallo **senza keyframe**: Alt+clic sul cronometro di **Fine intervallo** e scrivi un'espressione con **linear** e **time** (es. **linear(time, 0, 2, 0, 100)**).",
      () => aeSetup({ layers: (c) => [text(c, "Si scrive da solo"), bg(c, "#101018")], open: (ls) => ({ [ls[0].id]: ["x.range"] }) }),
      [{ label: "Espressione con **linear** e **time**", test: (s) => anyExpr(s, /linear\s*\(\s*time/i, "x.range") }],
    ),
  ]),
  L("lower-third-animato", "Lower third animato", "Entrata e uscita fluide.", [
    T("Come entra un lower third", [
      "Un lower third animato di solito ha **due parti**: una **barra** (forma) che scivola dentro e il **testo** che compare subito dopo. All'uscita, l'ordine si inverte.",
      "Le entrate durano **10–20 fotogrammi** e usano sempre l'**easing**: veloci all'inizio, morbide all'arrivo.",
    ]),
    Q("Quanto dura di solito l'entrata di un lower third?", ["10–20 fotogrammi", "5 secondi", "1 fotogramma", "1 minuto"], 0, "Breve e scattante, ma morbida all'arrivo."),
    T("Ordine e ritmo", [
      "Prima la barra, poi il testo (anche solo 4–6 fotogrammi dopo): l'occhio segue il movimento e arriva pronto a leggere.",
    ]),
    Q("All'uscita, cosa sparisce per primo?", ["Il testo, poi la barra", "La barra, poi il testo", "Tutto insieme sempre", "Niente"], 0, "Si inverte l'ordine dell'entrata."),
    ae(
      "La barra entra",
      "Fai **scivolare la Barra** da sinistra: due keyframe di **Posizione** con almeno **600 px** di spostamento in X e **Easy Ease**.",
      () => aeSetup({ layers: (c, m) => [text(c, "Squeak Topolino", { transform: { ...aeLayer("text", c).transform, position: prop(520, 880) } }), shape(c, "Barra", "rect", 760, 110, "#9999ff", { transform: { ...aeLayer("shape", c).transform, position: prop(520, 880) } }), aeLayer("footage", c, {}, m["s-tramonto"])], media: ["s-tramonto"] }),
      [
        { label: "2 keyframe di Posizione sulla **Barra**", test: (s) => aeKeys(named(s, /barra/i), "t.position").length >= 2 },
        { label: "Spostamento ≥ **600 px** in X", test: (s) => { const r = keyRange(named(s, /barra/i), "t.position"); return r.max - r.min >= 600; } },
        { label: "Con **Easy Ease**", test: (s) => aeKeys(named(s, /barra/i), "t.position").some((k) => k.easeIn || k.easeOut) },
      ],
    ),
    ae(
      "Poi il testo",
      "Completa: il **testo** compare con l'**Opacità** da 0 a 100 **dopo** che la barra ha iniziato a muoversi (il suo primo keyframe almeno 0,1 s dopo quello della barra).",
      () =>
        aeSetup({
          layers: (c) => {
            const bar = shape(c, "Barra", "rect", 760, 110, "#9999ff");
            bar.transform.position = animated([{ ...key(0, -400, 880), easeOut: true }, { ...key(0.6, 520, 880), easeIn: true }]);
            return [text(c, "Squeak Topolino", { transform: { ...aeLayer("text", c).transform, position: prop(520, 880) } }), bar];
          },
          open: (ls) => ({ [ls[0].id]: ["t.opacity"] }),
        }),
      [
        { label: "Il testo ha una dissolvenza (0 → 100)", test: (s) => { const r = keyRange(aeLayers(s).find((l) => l.type === "text"), "t.opacity"); return r.min <= 5 && r.max >= 95; } },
        { label: "Parte dopo la barra", test: (s) => { const t = aeKeys(aeLayers(s).find((l) => l.type === "text"), "t.opacity"); return t.length >= 2 && Math.min(...t.map((k) => k.t)) >= 0.1; } },
      ],
    ),
  ]),
  L("logo-animato", "Logo animato", "Un'intro di 3 secondi per il tuo canale.", [
    T("Breve e riconoscibile", [
      "Un'intro di canale dura **2–4 secondi**: di più e la gente salta. Il logo entra con un movimento chiaro, si ferma un attimo, e il video comincia.",
      "Un **rimbalzo** (overshoot) dà carattere: il logo cresce oltre la dimensione finale (110%) e torna al 100%.",
    ]),
    Q("Quanto dovrebbe durare un'intro di canale?", ["2–4 secondi", "30 secondi", "1 minuto", "Il più possibile"], 0, "Breve: lo spettatore è lì per il contenuto."),
    T("Luce e suono", [
      "Un **bagliore** leggero, un flash o un riflesso, e soprattutto un **suono** (whoosh, impatto) rendono l'intro memorabile.",
    ]),
    Q("Cos'è l'overshoot?", ["Superare il valore finale e tornare indietro", "Esportare due volte", "Un errore di render", "Un codec"], 0, "Il rimbalzo che dà vita ai movimenti."),
    ae(
      "Pop con rimbalzo",
      "Anima la **Scala** del logo con **3 keyframe**: **0** → oltre **105** → circa **100** (il rimbalzo).",
      () => aeSetup({ layers: (c, m) => [aeLayer("footage", c, {}, m["s-logo"]), bg(c, "#141428")], open: (ls) => ({ [ls[0].id]: ["t.scale"] }) }),
      [
        { label: "Almeno **3 keyframe** di Scala", test: (s) => aeLayers(s).some((l) => l.type === "footage" && aeKeys(l, "t.scale").length >= 3) },
        { label: "Parte da ~0", test: (s) => aeLayers(s).some((l) => l.type === "footage" && keyRange(l, "t.scale").first <= 5) },
        { label: "Supera **105** e finisce a ~**100**", test: (s) => aeLayers(s).some((l) => { const r = keyRange(l, "t.scale"); return l.type === "footage" && r.max >= 105 && Math.abs(r.last - 100) <= 5; }) },
      ],
    ),
    ae(
      "Aggiungi il bagliore",
      "Rendi il logo luminoso: applica l'effetto **Bagliore** (Stilizza) e porta il **Raggio bagliore** ad almeno **30**.",
      () => aeSetup({ layers: (c, m) => [aeLayer("footage", c, {}, m["s-logo"]), bg(c, "#141428")] }),
      [{ label: "**Bagliore** con raggio ≥ 30", test: (s) => aeLayers(s).some((l) => { const g = layerFx(l, "glow"); return !!g && (g.params.radius?.keys?.[0]?.v[0] ?? g.params.radius?.value[0] ?? 0) >= 30; }) }],
    ),
  ]),

  // ---------------- Unità 17 · Effetti visivi ----------------
  L("green-screen", "Green screen", "Scontornare con il chroma key.", [
    T("Il chroma key", [
      "Si riprende il soggetto davanti a un fondo **verde** (o blu) uniforme e illuminato bene. Il **chroma key** rende trasparente quel colore e al suo posto metti un altro sfondo.",
      "Il verde si usa perché è lontano dai colori della pelle e i sensori sono molto sensibili al verde.",
    ]),
    Q("Perché il fondo è verde?", ["Perché è lontano dai colori della pelle", "Perché è il colore preferito dei registi", "Perché costa meno", "Per caso"], 0, "Così il key non mangia il soggetto."),
    T("Rifinire il key", [
      "Dopo aver scelto il colore chiave si regolano **tolleranza** e **morbidezza** e si toglie lo **spill** (il riflesso verde sui bordi del soggetto).",
    ]),
    Q("Cos'è lo spill?", ["Il riflesso del verde sul soggetto", "Un tipo di transizione", "Un errore audio", "La durata del key"], 0, "Il fondo colorato si riflette sui bordi: va neutralizzato."),
    ae(
      "Scontorna Squeak",
      "Il livello **Greenscreen_Squeak** è sopra al drone. Applicagli **Ultra Key** (Keying) per togliere il verde, con la **Riduzione dispersione** attiva.",
      () => aeSetup({ layers: (c, m) => [aeLayer("footage", c, {}, m["s-green"]), aeLayer("footage", c, {}, m["s-drone"])] }),
      [
        { label: "**Ultra Key** sul green screen", test: (s) => aeLayers(s).some((l) => l.source === "s-green" && !!layerFx(l, "ultrakey")) },
        { label: "Riduzione dispersione attiva", test: (s) => aeLayers(s).some((l) => { const k = l.source === "s-green" ? layerFx(l, "ultrakey") : undefined; return !!k && (k.params.spill?.value[0] ?? 0) > 0; }) },
      ],
    ),
    ae(
      "Inseriscilo nella scena",
      "Rimpicciolisci Squeak (Scala ≤ **70**) e spostalo nella **metà destra** della scena (X > 960).",
      () => aeSetup({ layers: (c, m) => [aeLayer("footage", c, { effects: [] }, m["s-green"]), aeLayer("footage", c, {}, m["s-drone"])] }),
      [
        { label: "Scala ≤ **70**", test: (s) => aeLayers(s).some((l) => l.source === "s-green" && valueOf(l.transform.scale)[0] <= 70) },
        { label: "A destra", test: (s) => aeLayers(s).some((l) => l.source === "s-green" && valueOf(l.transform.position)[0] > 960) },
      ],
    ),
  ]),
  L("tracking", "Motion tracking", "Attaccare un elemento a un oggetto in movimento.", [
    T("Seguire il movimento", [
      "Il **motion tracking** analizza un punto dell'immagine fotogramma per fotogramma e ne ricava i keyframe di **posizione**. Poi \"attacchi\" a quei dati un testo, un logo, un effetto.",
      "In AE si applicano i dati a un **oggetto nullo**, e al nullo si collegano (parenting) gli elementi da attaccare.",
    ]),
    Q("A cosa si applicano di solito i dati di tracking?", ["A un oggetto nullo", "Direttamente all'audio", "Alla comp", "Al pannello Progetto"], 0, "Il nullo diventa il punto che si muove con l'oggetto."),
    T("Tracking a mano", [
      "Quando il tracker automatico sbaglia, si fa a mano: keyframe di posizione del nullo ogni pochi fotogrammi, seguendo l'oggetto. È lento, ma funziona sempre.",
    ]),
    Q("Dopo il tracking, come attacchi un testo al nullo?", ["Con il parenting (Genitore)", "Con una transizione", "Copiando il file", "Non si può"], 0, "Il testo diventa figlio del nullo e lo segue."),
    ae(
      "Tracking manuale",
      "Crea un **oggetto nullo**, dagli almeno **3 keyframe di Posizione** (uno ogni secondo) e collega il **testo** al nullo.",
      () => aeSetup({ layers: (c, m) => [text(c, "Squeak è qui!"), aeLayer("footage", c, {}, m["s-drone"])] }),
      [
        { label: "Nullo con **3+ keyframe** di Posizione", test: (s) => aeLayers(s).some((l) => l.type === "null" && aeKeys(l, "t.position").length >= 3) },
        { label: "Il testo segue il nullo", test: (s) => { const n = aeLayers(s).find((l) => l.type === "null"); return !!n && aeLayers(s).some((l) => l.type === "text" && l.parent === n.id); } },
      ],
    ),
    ae(
      "Collegare con un'espressione",
      "Alternativa al parenting: scrivi sulla **Posizione** del testo un'espressione che legga la posizione del nullo, ad esempio **thisComp.layer(\"Bersaglio\").transform.position**.",
      () =>
        aeSetup({
          layers: (c, m) => {
            const n = aeLayer("null", c, { name: "Bersaglio" });
            n.transform.position = animated([key(0, 400, 400), key(2, 1400, 500), key(4, 900, 800)]);
            return [n, text(c, "Ciao!"), aeLayer("footage", c, {}, m["s-drone"])];
          },
          open: (ls) => ({ [ls[1].id]: ["t.position"] }),
        }),
      [{ label: "Espressione che legge il **Bersaglio**", test: (s) => anyExpr(s, /layer\(\s*["']Bersaglio["']\s*\)/, "t.position", (l) => l.type === "text") }],
      "Alt+clic sul cronometro di Posizione del testo e scrivi l'espressione. Puoi anche trascinare la **frusta** dell'espressione sulla Posizione del nullo.",
    ),
  ]),
  L("stabilizzazione", "Stabilizzazione", "Togliere il mosso dalle riprese a mano.", [
    T("Il mosso", [
      "Le riprese **a mano** tremano. Lo **Stabilizzatore distorsione** (Warp Stabilizer) analizza la clip e compensa il movimento, poi **ingrandisce** un po' l'immagine per nascondere i bordi che si muovono.",
      "Più **uniformità** chiedi, più l'immagine viene ingrandita (e perde qualità).",
    ]),
    Q("Perché lo stabilizzatore ingrandisce l'immagine?", ["Per nascondere i bordi che si muovono", "Per aumentare la risoluzione", "Per cambiare il formato", "Non lo fa"], 0, "Compensando il movimento, ai bordi resterebbero zone vuote."),
    T("Non esagerare", [
      "Un'uniformità del **20–50%** di solito basta. Al 100% le riprese sembrano \"di gomma\" e molto ritagliate. Se la ripresa è troppo mossa, meglio cambiare inquadratura.",
    ]),
    Q("Che uniformità è di solito ragionevole?", ["20–50%", "100% sempre", "0%", "500%"], 0, "Quanto basta per togliere il tremolio senza deformare."),
    pr(
      "Stabilizza in Premiere",
      "La ripresa della città è mossa. Applica **Stabilizzatore distorsione** (Effetti video → Distorsione) con **Uniformità** tra **20** e **50%**.",
      () => prSetup({ clips: [{ media: "s-citta", at: 0, from: 0, to: 8, a: null, patch: (c) => ({ ...c, motion: { ...c.motion, position: { value: [960, 540], keys: [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1].map((t, i) => ({ id: "shake" + i, t, v: [960 + (i % 2 ? 14 : -12), 540 + (i % 3 ? 9 : -10)], easeIn: false, easeOut: false, hold: false })) } } }) }] }),
      [
        { label: "**Stabilizzatore distorsione** applicato", test: (s) => vClips(s).some((c) => c.effects.some((e) => e.defId === "warpstab")) },
        { label: "Uniformità **20–50%**", test: (s) => vClips(s).some((c) => { const v = fxValue(c, "warpstab", "smooth"); return v !== null && v >= 20 && v <= 50; }) },
      ],
    ),
  ]),
  L("blending", "Metodi di fusione", "Screen, multiply e overlay.", [
    T("Come si mescolano i livelli", [
      "Il **metodo di fusione** decide come un livello si mescola con quelli sotto. **Schermo** (Screen) tiene solo le parti chiare: perfetto per luci, fiamme, riflessi su fondo nero.",
      "**Moltiplica** tiene le parti scure (ombre, texture su fondo bianco). **Sovrapponi** (Overlay) aumenta il contrasto mescolando entrambe.",
    ]),
    Q("Hai un'esplosione su fondo nero. Quale metodo usi per togliere il nero?", ["Schermo", "Moltiplica", "Normale", "Differenza"], 0, "Schermo elimina il nero e tiene la luce."),
    T("Dove si cambia", [
      "In AE la colonna **Modalità** della timeline (premi **F4** se non la vedi). In Premiere: **Controlli effetti → Opacità → Metodo di fusione**.",
    ]),
    Q("Una texture di carta su fondo bianco: quale metodo per tenere solo le parti scure?", ["Moltiplica", "Schermo", "Aggiungi", "Normale"], 0, "Moltiplica elimina il bianco."),
    ae(
      "Luce calda sul mare",
      "Il livello **Luce** (arancione) copre tutto il drone. Impostagli il metodo **Schermo** (o **Aggiungi**) e abbassa la sua **Opacità** a **≤ 60%**.",
      () => aeSetup({ layers: (c, m) => [aeLayer("solid", c, { name: "Luce", color: "#ff8a3d" }), aeLayer("footage", c, {}, m["s-drone"])] }),
      [
        { label: "Metodo **Schermo** o **Aggiungi**", test: (s) => [7, 8].includes(named(s, /luce/i)?.blend ?? -1) },
        { label: "Opacità ≤ **60%**", test: (s) => valueOf(named(s, /luce/i)?.transform.opacity ?? { value: [100], keys: null })[0] <= 60 },
      ],
      "Se non vedi la colonna **Modalità**, premi **F4** nella timeline.",
    ),
    ae(
      "Testo inciso",
      "Metti il testo **ONDA** in modalità **Sovrapponi** sopra il drone: sembrerà parte dell'immagine.",
      () => aeSetup({ layers: (c, m) => [text(c, "ONDA"), aeLayer("footage", c, {}, m["s-drone"])] }),
      [{ label: "Testo in **Sovrapponi**", test: (s) => aeLayers(s).some((l) => l.type === "text" && l.blend === 9) }],
    ),
  ]),
  L("particelle", "Particelle", "Polvere, scintille e neve.", [
    T("Sistemi di particelle", [
      "Un **sistema di particelle** genera centinaia di piccoli elementi (punti, scintille, fiocchi) con regole: quanti nascono, quanto vivono, dove vanno, quanto pesano.",
      "In AE ci sono **CC Particle World** (incluso) e plugin come **Trapcode Particular**. Si usano per neve, polvere, scintille, magia.",
    ]),
    Q("Cosa controlla la \"vita\" di una particella?", ["Quanto tempo resta visibile prima di sparire", "Il suo colore", "Il formato della comp", "Il volume"], 0, "Ogni particella nasce, vive e sparisce."),
    T("Particelle fatte a mano", [
      "Per pochi elementi puoi anche fare a mano: qualche forma piccola, duplicata (**Ctrl+D**), con un'espressione **wiggle** sulla posizione per farle fluttuare in modo casuale.",
      "**wiggle(1, 50)**: una volta al secondo si sposta casualmente fino a 50 pixel.",
    ]),
    Q("Cosa fa l'espressione wiggle(2, 30)?", ["Si muove a caso 2 volte al secondo fino a 30 px", "Ruota di 30°", "Raddoppia la scala", "Ferma il livello"], 0, "Frequenza 2, ampiezza 30."),
    ae(
      "Fiocchi di neve",
      "Crea almeno **5** piccole forme (duplica il **Fiocco** con **Ctrl+D**) e scrivi su almeno **3** di esse un'espressione **wiggle** sulla **Posizione**.",
      () =>
        aeSetup({
          layers: (c) => {
            const f = shape(c, "Fiocco", "ellipse", 24, 24, "#ffffff");
            f.transform.position = prop(400, 300);
            return [f, bg(c, "#0d1530")];
          },
          open: (ls) => ({ [ls[0].id]: ["t.position"] }),
        }),
      [
        { label: "Almeno **5** forme", test: (s) => aeLayers(s).filter((l) => l.type === "shape").length >= 5 },
        { label: "**3+** con wiggle sulla Posizione", test: (s) => aeLayers(s).filter((l) => /wiggle\s*\(/.test(l.transform.position.expr ?? "")).length >= 3 },
      ],
      "Scrivi l'espressione sul primo fiocco **prima** di duplicarlo: le copie la ereditano!",
    ),
  ]),
];
