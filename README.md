# Mozzy Edit (nome provvisorio)

Un "Duolingo per il montaggio video": micro-lezioni da 3 minuti + esercizi pratici in un mini-editor stile Premiere Pro, direttamente nel browser.

> Il nome della mascotte e del brand si cambia in un solo punto: [`src/config/brand.ts`](src/config/brand.ts).

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

1. Crea `src/content/lessons/<id>.ts` esportando un `Lesson` (vedi `primo-taglio.ts`).
2. Registrala in `src/content/lessons/index.ts`.
3. In `src/content/course.ts` imposta `status: "available"`.

Gli step `editor` hanno una funzione `check(seq)` che riceve la timeline dell'utente e risponde `{ done, hint }`.

## Scorciatoie del mini-editor (come in Premiere)

`V` Selezione · `C` Lama · `Spazio` play/pausa · `Canc` elimina · `Shift+Canc` elimina con increspatura · `Ctrl+Z` / `Ctrl+Shift+Z` annulla/ripeti · `←` `→` un fotogramma
