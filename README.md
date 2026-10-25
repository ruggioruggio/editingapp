# SqueakEdit

Un "Duolingo per il montaggio video": micro-lezioni da 3 minuti + esercizi pratici in un mini-editor stile Premiere Pro, direttamente nel browser. La mascotte è **Squeak**, un topo; l'assistente a pagamento è **Squeak AI**.

> Naming e link (Discord, store) in un solo punto: [`src/config/brand.ts`](src/config/brand.ts).

## Pagine

| Percorso | Cosa contiene |
| --- | --- |
| `/` | sito stile Duolingo con le scene animate di Squeak |
| `/login`, `/download` | accesso (UI, account in arrivo) e download desktop/store |
| `/learn` | percorso: 5 sezioni, 20 unità, 100 lezioni pianificate |
| `/quests` | 3 quest giornaliere che danno XP |
| `/goals` | obiettivi a più livelli da collezionare |
| `/friends` | nome utente, inviti e richieste di amicizia |
| `/pricing` | Free / Pro |
| `/lesson/[id]` | player della lezione |

All'apertura dell'app (una volta per sessione) parte una delle 5 animazioni di Squeak in `components/brand/scenes.tsx`, scelta a caso.

## Avvio

Requisiti: Node.js 20.9 o superiore (consigliato 22 LTS).

```bash
npm install
npm run dev
```

Poi apri http://localhost:3000

| Comando             | Cosa fa                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | server di sviluppo con hot reload |
| `npm run build`     | build di produzione              |
| `npm run typecheck` | controllo dei tipi TypeScript    |

## Account e database (Supabase)

Senza configurazione l'app funziona come ospite (progressi solo nel browser). Per attivare login, salvataggio e amici:

1. Crea un progetto su [supabase.com](https://supabase.com).
2. **SQL Editor** → incolla ed esegui, in ordine, [`0001_init.sql`](supabase/migrations/0001_init.sql) (profili, progressi, amicizie) e [`0002_social.sql`](supabase/migrations/0002_social.sql) (chat, serie condivise, bacheca degli amici).
3. **Project Settings → API**: copia URL e chiave `anon`/publishable in `.env.local` (modello in [`.env.example`](.env.example)) e riavvia `npm run dev`.
4. **Authentication → URL Configuration**: Site URL `http://localhost:3000`, Redirect URL `http://localhost:3000/auth/callback` (in produzione aggiungi il dominio vero).
5. Facoltativo: **Authentication → Providers** per attivare Google e Apple.
6. **Email con il brand SqueakEdit**: in **Authentication → Emails → Templates** incolla i file di [`supabase/templates`](supabase/templates):

   | Template Supabase | File | Oggetto |
   | --- | --- | --- |
   | Confirm signup | `confirm-signup.html` | Conferma il tuo account SqueakEdit 🐭 |
   | Reset password | `reset-password.html` | Scegli una nuova password per SqueakEdit |
   | Change email address | `change-email.html` | Conferma la tua nuova email SqueakEdit |

   I link portano a `/auth/confirm`, che funziona anche aprendo l'email su un altro dispositivo. L'email di conferma contiene anche un codice da digitare nell'app.
7. **Mittente personalizzato** (es. `ciao@squeakedit.app`): il servizio email incluso in Supabase invia poche email all'ora e solo agli indirizzi del team del progetto. Per gli utenti veri serve un SMTP proprio (es. Resend) in **Authentication → Emails → SMTP Settings**, con un dominio verificato.

Come funziona:
- `profiles`: nome utente, XP e serie visibili agli amici. Il campo `plan` non è modificabile dal client (lo scriverà il webhook di Stripe).
- `progress`: lo stato di gioco in JSON, leggibile e scrivibile solo dal proprietario (RLS).
- `friendships`: richieste e amicizie; solo chi riceve la richiesta può accettarla.
- Al login i progressi da ospite vengono fusi con quelli dell'account ([`lib/progress/merge.ts`](src/lib/progress/merge.ts)); poi ogni modifica viene salvata dopo 1,5 s ([`SupabaseSync`](src/components/app/SupabaseSync.tsx)). Al logout i dati locali vengono cancellati.

## Funzioni a pagamento (in pausa)

Per ora SqueakEdit è gratuito. In [`config/features.ts`](src/config/features.ts) due interruttori spengono tutto ciò che è a pagamento:
- `payments: false` → il piano Pro appare "In arrivo", nessuno può attivarlo e le **Condizioni di acquisto** restano nel codice ma non vengono pubblicate.
- `squeakAi: false` → la tab Squeak AI mostra un'anteprima "in arrivo" e l'API risponde che non è ancora disponibile.

Quando ci sarà un venditore in regola basta metterli a `true`.

## Amici

Con un account: chat in tempo reale (solo tra amici), **serie condivise** (giorni consecutivi in cui entrambi fate lezione) e la bacheca con lezioni completate, obiettivi sbloccati e traguardi di serie degli amici. Le attività vengono pubblicate da [`SupabaseSync`](src/components/app/SupabaseSync.tsx) quando cambiano i progressi.

## Documenti legali

In [`content/legal.ts`](src/content/legal.ts), pubblicati su `/legal/termini`, `/legal/privacy`, `/legal/acquisti`, `/legal/cookie`, `/legal/community`. Sono **bozze**: vanno completati i dati tra parentesi quadre (ragione sociale, P.IVA, email) e fatti verificare da un legale prima del lancio.

## Squeak AI

Tab al centro del dock (`/ai`), riservata al piano Pro. L'utente scrive il problema e può allegare screenshot, PDF, progetti Premiere (`.prproj`) o After Effects (`.aep`, `.aepx`).

- [`app/api/ai/route.ts`](src/app/api/ai/route.ts): controlla account e piano su Supabase, applica un limite di richieste e risponde in streaming (NDJSON) con Claude Opus 5.5. Il fallback lato server (`fallbacks: "default"`) fa riprovare su un modello di riserva se una richiesta viene rifiutata.
- [`lib/ai/files.ts`](src/lib/ai/files.ts): le immagini vanno a Claude così come sono; i progetti vengono riassunti (sequenze, clip, tracce, frame rate, effetti), perché il file grezzo è enorme.
- Quando serve, Claude chiama lo strumento `open_practice_editor` e la chat mostra **Prova nell'editor**: si apre il mini-editor con un esercizio dal catalogo [`content/practice.ts`](src/content/practice.ts).

Configurazione in `.env.local`: `ANTHROPIC_API_KEY` (segreta, solo server). In locale `SQUEAK_AI_DEV_UNLOCK=true` apre la chat senza account Pro.

## Stack

| Livello            | Scelta                                   | Perché                                                                 |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router) + React 19 + TS  | sito marketing (SEO) e web app in un solo progetto, deploy su Vercel   |
| Stile              | Tailwind CSS v4                          | design token del tema scuro Adobe in `globals.css`, veloce da iterare  |
| Stato editor       | Zustand                                  | store leggero per timeline, undo/redo, playhead                        |
| Motore editor      | DOM + Canvas 2D, logica pura in `lib/editor/ops.ts` | niente librerie di timeline pesanti: ogni esercizio controlla esattamente cosa fa l'utente |
| Mobile / desktop   | layout responsive + PWA (`app/manifest.ts`) | un'unica codebase, installabile su telefono e desktop               |
| Da aggiungere      | Supabase (auth + Postgres), Stripe (abbonamenti), Claude API (Mozzy AI), Capacitor se servono gli store | |

## Struttura

```
src/
  app/
    page.tsx                  landing / sito
    (app)/layout.tsx          shell app: sidebar desktop, bottom nav mobile, statistiche
    (app)/learn/              percorso a nodi stile Duolingo
    (app)/pricing/            piani Free / Pro
    lesson/[lessonId]/        player della lezione a schermo intero
  config/brand.ts             naming (mascotte, app, AI, Discord)
  content/
    course.ts                 unità e lezioni del percorso
    lessons/                  contenuto delle lezioni (teoria, quiz, esercizi)
  lib/
    editor/                   motore del mini-editor: tipi, operazioni pure, store
    lessons/types.ts          modello dati delle lezioni
    billing/plans.ts          piani, limite 5 lezioni/giorno, entitlement AI
    progress/store.ts         XP, serie, lezioni completate, uso giornaliero
  components/
    editor/                   Monitor Programma, Timeline, Strumenti
    lesson/                   player, step teoria/quiz/editor, paywall
    ai/                       pulsante Mozzy AI (bloccato per Free)
```

## Come aggiungere una lezione

Tutte le 100 lezioni sono già in `src/content/course.ts` con il loro obiettivo. Per renderne una giocabile:

1. Crea `src/content/lessons/<id>.ts` esportando un `Lesson` con lo stesso id (vedi `primo-taglio.ts`).
2. Registrala in `src/content/lessons/index.ts`: nel percorso diventa disponibile da sola.

Gli step `editor` hanno una funzione `check(seq)` che riceve la timeline dell'utente e risponde `{ done, hint }`.

## Scorciatoie del mini-editor (come in Premiere)

`V` Selezione · `C` Lama · `Spazio` play/pausa · `Canc` elimina · `Shift+Canc` elimina con increspatura · `Ctrl+Z` / `Ctrl+Shift+Z` annulla/ripeti · `←` `→` un fotogramma
