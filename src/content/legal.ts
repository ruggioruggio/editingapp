// Testi legali di SqueakEdit. BOZZE: vanno completati i dati tra [parentesi
// quadre] e fatti verificare da un legale prima della pubblicazione.
// Formato: Markdown semplice (titoli ##, elenchi, **grassetto**).

import { features } from "@/config/features";

export const LEGAL_UPDATED = "25 ottobre 2026";

const COMPANY = "[RAGIONE SOCIALE], con sede in [INDIRIZZO], P.IVA [P.IVA]";
const EMAIL = "[EMAIL DI CONTATTO]";
const PRIVACY_EMAIL = "[EMAIL PRIVACY]";

export interface LegalDoc {
  slug: string;
  title: string;
  summary: string;
  body: string;
  /** visibile solo quando i pagamenti sono attivi (vedi config/features.ts) */
  needsPayments?: boolean;
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "termini",
    title: "Termini di servizio",
    summary: "Le regole per usare SqueakEdit, l'app, il sito e Squeak AI.",
    body: `
## 1. Chi siamo
SqueakEdit è un servizio di ${COMPANY} ("**noi**"). Per qualsiasi domanda puoi scriverci a ${EMAIL}.

## 2. Accettazione
Usando SqueakEdit (sito, app web, app per telefono e computer) accetti questi Termini, l'Informativa privacy e le Regole della community. Quando saranno disponibili funzioni a pagamento, il loro acquisto sarà regolato da apposite Condizioni di acquisto. Se non li accetti, non usare il servizio.

## 3. Età minima
- Per creare un account devi avere almeno **14 anni**.
- Se hai meno di 18 anni, gli acquisti devono essere fatti o autorizzati da un genitore o tutore.

## 4. Il tuo account
- Devi fornire dati veri e tenere al sicuro la password. Sei responsabile di ciò che succede con il tuo account.
- Il nome utente è pubblico per gli altri utenti: non usare nomi offensivi o che imitano altre persone.
- Puoi eliminare l'account quando vuoi scrivendo a ${EMAIL}; i dati vengono cancellati come indicato nell'Informativa privacy.

## 5. Cosa offriamo
- Lezioni di montaggio, quiz ed esercizi in un editor nel browser che simula programmi professionali.
- Funzioni social: amici, chat, serie condivise e attività degli amici.
- In futuro, con il piano Pro: lezioni illimitate e **Squeak AI** (oggi in arrivo, non ancora disponibili).
SqueakEdit **non è affiliato ad Adobe**: Premiere Pro e After Effects sono marchi di Adobe Inc. e vengono citati solo a scopo didattico.

## 6. Piano gratuito e Pro
SqueakEdit oggi è gratuito e permette fino a 5 lezioni al giorno. Il piano Pro è in preparazione: prezzi e condizioni verranno pubblicati prima che sia possibile acquistarlo. Possiamo modificare contenuti e funzioni per migliorare il servizio; se una modifica riduce in modo sostanziale ciò che hai pagato, te lo comunichiamo con anticipo.

## 7. Squeak AI
- Squeak AI è un assistente basato su intelligenza artificiale. Le risposte possono contenere **errori**: verificale prima di applicarle, soprattutto su progetti importanti. Fai sempre un backup del progetto prima di modificarlo.
- Quando carichi immagini o file di progetto, li analizziamo solo per risponderti (vedi Informativa privacy). Carica solo materiale che hai il diritto di usare e non inserire dati personali di altre persone o informazioni riservate.
- È vietato usare Squeak AI per contenuti illegali, per aggirare protezioni o licenze software o in modo automatizzato.

## 8. Comportamento
Devi rispettare le Regole della community. In particolare è vietato: molestare altri utenti, inviare spam o contenuti illegali, tentare di accedere ad account altrui, alterare punteggi, XP o classifiche con mezzi tecnici, copiare o rivendere i contenuti delle lezioni.

## 9. Contenuti
- Lezioni, testi, grafica, la mascotte Squeak e il software di SqueakEdit sono nostri o dei nostri licenzianti. Ti concediamo una licenza personale, non esclusiva e non trasferibile per usarli nell'app.
- I contenuti che invii (messaggi, file) restano tuoi. Ci concedi solo i diritti necessari per far funzionare il servizio (conservarli, mostrarli ai destinatari, analizzarli su tua richiesta).

## 10. Sospensione e chiusura
Possiamo sospendere o chiudere un account che viola questi Termini, dopo averti avvisato quando possibile. In caso di violazioni gravi possiamo farlo subito. Se chiudiamo l'account senza tua colpa, ti rimborsiamo la parte di abbonamento non goduta.

## 11. Responsabilità
Il servizio è fornito con cura ma senza garanzia di funzionamento ininterrotto. Nei limiti consentiti dalla legge non rispondiamo di danni indiretti, come la perdita di dati di progetti esterni a SqueakEdit. Restano salvi i diritti che la legge riconosce ai consumatori, che questi Termini non limitano.

## 12. Modifiche ai Termini
Se cambiamo questi Termini in modo rilevante ti avvisiamo nell'app o via email almeno 15 giorni prima. Se non sei d'accordo puoi disdire l'abbonamento e chiudere l'account.

## 13. Legge e foro
Si applica la legge italiana. Se sei un consumatore, è competente il foro del tuo luogo di residenza. Puoi usare anche la piattaforma europea per la risoluzione online delle controversie (https://ec.europa.eu/consumers/odr).
`,
  },
  {
    slug: "privacy",
    title: "Informativa privacy",
    summary: "Quali dati raccogliamo, perché, per quanto tempo e quali sono i tuoi diritti (GDPR).",
    body: `
## 1. Titolare del trattamento
${COMPANY}. Contatto per la privacy: ${PRIVACY_EMAIL}.

## 2. Quali dati trattiamo
- **Account**: email, nome utente, password (salvata solo in forma cifrata dal fornitore di autenticazione), eventuale nome mostrato.
- **Progressi**: lezioni completate, XP, serie, quest, obiettivi, statistiche degli esercizi.
- **Social**: richieste di amicizia, elenco amici, messaggi in chat, attività condivise con gli amici (lezioni completate, obiettivi sbloccati, serie).
- **Squeak AI** (quando sarà disponibile): le domande che scrivi e i file che carichi (immagini, PDF, progetti Premiere o After Effects). I file di progetto possono contenere nomi di file e percorsi del tuo computer.
- **Acquisti** (quando il piano Pro sarà disponibile): stato dell'abbonamento e storico dei pagamenti. I dati della carta sono gestiti direttamente dal fornitore di pagamento (Stripe, Apple o Google): noi non li vediamo.
- **Dati tecnici**: indirizzo IP, tipo di dispositivo e browser, registri di errore, necessari per sicurezza e funzionamento.

## 3. Perché e su quale base giuridica
- Creare e gestire l'account, salvare i progressi, fornire lezioni, social e Squeak AI: **esecuzione del contratto** (art. 6.1.b GDPR).
- Gestire pagamenti, fatture e obblighi fiscali: **obbligo di legge** (art. 6.1.c).
- Sicurezza, prevenzione di abusi e frodi, limite di richieste a Squeak AI: **legittimo interesse** (art. 6.1.f).
- Email promozionali e newsletter: solo con il tuo **consenso** (art. 6.1.a), revocabile in ogni momento.

## 4. Squeak AI e intelligenza artificiale
- Domande e file vengono inviati a **Anthropic** (fornitore del modello Claude), che li tratta come nostro responsabile del trattamento solo per generare la risposta.
- Noi **non conserviamo** i file che carichi dopo aver ricevuto la risposta. Il fornitore può conservarli per un periodo limitato secondo i propri termini per sicurezza e prevenzione degli abusi; non li usa per addestrare i modelli.
- Squeak AI non prende decisioni che producono effetti giuridici su di te.

## 5. Con chi condividiamo i dati
Solo con fornitori che ci aiutano a erogare il servizio, nominati responsabili del trattamento:
- **Supabase** (database e autenticazione);
- **Vercel** o altro fornitore di hosting;
- **Anthropic** (Squeak AI);
- **Stripe**, **Apple**, **Google** (pagamenti);
- fornitore email per le comunicazioni dell'account.
Gli altri utenti vedono solo ciò che è pubblico o condiviso con gli amici: nome utente, XP, serie, obiettivi e attività (agli amici), messaggi (solo al destinatario).

## 6. Trasferimenti fuori dall'UE
Alcuni fornitori hanno sede negli Stati Uniti. I trasferimenti avvengono sulla base del Data Privacy Framework UE-USA o delle clausole contrattuali standard della Commissione europea.

## 7. Per quanto tempo
- Account, progressi e attività: finché l'account è attivo; cancellati entro 30 giorni dalla chiusura.
- Messaggi in chat: finché tu o il destinatario non li eliminate, o fino alla chiusura dell'account.
- Dati di pagamento e fatture: 10 anni, come richiesto dalla legge fiscale.
- Registri tecnici e di sicurezza: fino a 12 mesi.

## 8. I tuoi diritti
Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità dei dati e opporti ai trattamenti basati sul legittimo interesse, scrivendo a ${PRIVACY_EMAIL}. Rispondiamo entro 30 giorni. Hai anche diritto di presentare reclamo al **Garante per la protezione dei dati personali** (www.garanteprivacy.it).

## 9. Minori
Il servizio non è destinato ai minori di 14 anni. Se scopriamo che un account appartiene a un minore di 14 anni senza consenso dei genitori, lo eliminiamo.

## 10. Sicurezza
Usiamo connessioni cifrate, accesso ai dati limitato per utente (regole di sicurezza a livello di database) e fornitori certificati. Nessun sistema è però sicuro al 100%: se si verifica una violazione che ti riguarda, ti avvisiamo come previsto dalla legge.
`,
  },
  {
    slug: "acquisti",
    title: "Condizioni di acquisto e abbonamenti",
    summary: "Prezzi, rinnovo, disdetta, recesso e rimborsi del piano Pro.",
    needsPayments: true,
    body: `
## 1. Venditore
${COMPANY}. Assistenza acquisti: ${EMAIL}.

## 2. Cosa compri
**SqueakEdit Pro** è un abbonamento a un servizio digitale che include: lezioni illimitate, Squeak AI e i contenuti avanzati indicati nella pagina Prezzi al momento dell'acquisto.

## 3. Prezzi
- I prezzi sono in euro e **IVA inclusa**, e sono indicati nella pagina Prezzi prima del pagamento.
- Sono disponibili un abbonamento **mensile** e uno **annuale**.
- Eventuali promozioni o prove gratuite riportano durata e prezzo dopo la fine della promozione.

## 4. Dove acquisti
- **Sul sito**: il pagamento è gestito da Stripe.
- **Nell'app per iPhone/iPad o Android**: l'acquisto avviene tramite App Store o Google Play e segue anche le condizioni di Apple o Google, comprese le regole sui rimborsi. In questo caso disdetta e rimborsi si gestiscono dalle impostazioni dell'account Apple o Google.

## 5. Rinnovo automatico
L'abbonamento **si rinnova automaticamente** alla scadenza per lo stesso periodo, al prezzo in vigore, finché non lo disdici. Ti ricordiamo il rinnovo dell'abbonamento annuale via email almeno 7 giorni prima.

## 6. Disdetta
Puoi disdire in qualsiasi momento, con un clic, dalla pagina del tuo account (o dalle impostazioni dello store). La disdetta ha effetto alla fine del periodo già pagato: fino ad allora mantieni le funzioni Pro. Non ci sono penali.

## 7. Diritto di recesso (14 giorni)
Se sei un consumatore hai diritto di recedere entro **14 giorni** dall'acquisto senza dare motivazioni (artt. 52 e seguenti del Codice del Consumo).
- Il servizio Pro è un contenuto e servizio digitale disponibile subito. Al momento dell'acquisto ti chiediamo se vuoi **iniziare subito** a usarlo: se acconsenti espressamente e riconosci che così perdi il diritto di recesso per i contenuti digitali già forniti (art. 59, comma 1, lett. o), il recesso non si applica a quella parte.
- Se non hai dato questo consenso, o non hai ancora usato le funzioni Pro, puoi recedere scrivendo a ${EMAIL} e ricevi il rimborso entro 14 giorni con lo stesso metodo di pagamento.

## 8. Rimborsi
Oltre al diritto di recesso, rimborsiamo la parte non goduta se:
- il servizio Pro non è stato disponibile per più di 72 ore consecutive per causa nostra;
- chiudiamo il tuo account senza tua colpa;
- un addebito è avvenuto per errore (es. doppio pagamento).
Per gli acquisti fatti tramite App Store o Google Play, il rimborso va richiesto ad Apple o Google.

## 9. Modifiche di prezzo
Se il prezzo cambia, ti avvisiamo almeno **30 giorni prima** del rinnovo successivo. Se non sei d'accordo puoi disdire prima del rinnovo; il nuovo prezzo non si applica al periodo già pagato.

## 10. Pagamento non riuscito
Se il rinnovo non va a buon fine riproviamo per alcuni giorni e ti avvisiamo. Se il pagamento non arriva, l'account torna al piano gratuito: progressi, amici e obiettivi restano salvati.

## 11. Fattura
Ricevi la ricevuta di ogni pagamento via email. Se ti serve una fattura intestata, scrivi a ${EMAIL}.

## 12. Garanzia di conformità
Per i contenuti e servizi digitali si applicano le tutele di legge sulla conformità (artt. 135-octies e seguenti del Codice del Consumo). Se qualcosa non funziona come promesso, scrivici e lo sistemiamo o ti rimborsiamo.
`,
  },
  {
    slug: "cookie",
    title: "Cookie policy",
    summary: "Quali cookie e archivi locali usiamo.",
    body: `
## Cookie tecnici
Usiamo solo cookie e archivi locali **tecnici**, necessari al funzionamento. Per questi non serve il consenso:
- **Sessione di accesso** (cookie del fornitore di autenticazione Supabase): ti mantengono collegato al tuo account.
- **Progressi locali** (memoria del browser, "localStorage"): salvano lezioni, XP e serie anche quando giochi come ospite.
- **Preferenze di sessione** (es. se hai già visto l'animazione di apertura).

## Cookie di analisi e marketing
Al momento **non** usiamo cookie di profilazione, pubblicità o analisi di terze parti. Se in futuro li introdurremo, ti chiederemo prima il consenso con un banner e potrai cambiare idea in qualsiasi momento.

## Come cancellarli
Puoi eliminare cookie e dati salvati dalle impostazioni del browser. Se lo fai, uscirai dall'account e, se giocavi come ospite, perderai i progressi non salvati in un account.

## Contatti
Per domande scrivi a ${PRIVACY_EMAIL}.
`,
  },
  {
    slug: "community",
    title: "Regole della community",
    summary: "Come comportarsi con amici, chat e Discord.",
    body: `
SqueakEdit è un posto dove si impara insieme. Queste regole valgono per chat, nomi utente, profili e per il nostro server Discord.

## Cosa ci piace
- Aiutarsi a vicenda, condividere trucchi e progressi.
- Sfidarsi in modo sano sulle serie e sugli obiettivi.
- Dare feedback costruttivi sui lavori degli altri.

## Cosa non è permesso
- **Molestie e bullismo**: insulti, minacce, prese in giro insistenti, contenuti d'odio basati su origine, religione, genere, orientamento, disabilità o altro.
- **Contenuti sessuali o violenti**, soprattutto verso minori: vengono rimossi e segnalati alle autorità.
- **Spam e truffe**: pubblicità, link sospetti, richieste di password o dati di pagamento.
- **Dati personali** di altre persone (indirizzi, numeri di telefono, foto) senza consenso.
- **Imbrogli**: alterare XP, classifiche o serie con strumenti esterni.
- **Pirateria**: condividere software craccato, licenze o materiali protetti senza diritti.

## Amici e chat
- Puoi scrivere solo agli utenti che hanno accettato la tua amicizia.
- Puoi rimuovere un amico in qualsiasi momento: la chat con lui si chiude.
- Non condividere mai la tua password: noi non te la chiederemo mai.

## Segnalazioni
Se qualcuno viola queste regole, segnalacelo a ${EMAIL} (o tramite i moderatori su Discord) indicando nome utente e cosa è successo. Esaminiamo le segnalazioni il prima possibile.

## Conseguenze
A seconda della gravità: avviso, blocco temporaneo della chat, sospensione o chiusura dell'account. Le violazioni gravi possono essere segnalate alle autorità.
`,
  },
];

/** Documenti pubblicati ora: le condizioni di acquisto restano nascoste finché non si vende. */
export const PUBLISHED_LEGAL_DOCS = LEGAL_DOCS.filter((d) => !d.needsPayments || features.payments);

export const getLegalDoc = (slug: string) => PUBLISHED_LEGAL_DOCS.find((d) => d.slug === slug);
