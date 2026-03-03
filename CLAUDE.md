# Istruzioni per Claude CLI (Ralph)

Quando avviato in questa directory, leggi i file TODO in ordine e completa tutte le task non ancora completate (quelle senza `[x]`).

## Ordine di esecuzione TODO
1. `TODO_LIVE.md` — fasi L1-L7 (contenuti, compliance, sicurezza, deploy config)
2. `TODO_ORDERS.md` — fasi O1-O7 (workflow ordini, notifiche, dashboard real-time)

## Regole operative
- Dopo ogni singola task: `npx tsc --noEmit`
- Dopo ogni fase completa: `npx tsc --noEmit && npm run build`
- Se una task fallisce dopo 3 tentativi: crea `BLOCKED_[TASK].md` con spiegazione e vai avanti
- Non modificare: `__tests__/`, `.env.local`, migrazioni SQL già esistenti in `supabase/migrations/`
- Per nuove migrazioni SQL: crea il file `.sql` poi esegui `npx supabase migration up` (mai `db reset`)
- Segna ogni task completata con `[x]` nel rispettivo file TODO
- Aggiorna `PROGRESS.md` con un riassunto alla fine di ogni fase
