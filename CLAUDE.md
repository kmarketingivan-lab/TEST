# Istruzioni per Claude CLI (Ralph)

Quando avviato in questa directory, leggi `TODO_LIVE.md` ed esegui tutte le task non ancora completate (quelle senza `[x]`), in ordine di fase.

## Regole operative

- Dopo ogni singola task: `npx tsc --noEmit`
- Dopo ogni fase completa: `npx tsc --noEmit && npm run build`
- Se una task fallisce dopo 3 tentativi: crea `BLOCKED_[TASK].md` con spiegazione e vai avanti
- Non modificare: `__tests__/`, `.env.local`, migrazioni SQL già esistenti in `supabase/migrations/`
- Per nuove migrazioni SQL: crea il file `.sql` poi esegui `npx supabase migration up` (mai `db reset`)
- Segna ogni task completata con `[x]` in `TODO_LIVE.md`
- Aggiorna `PROGRESS.md` con un riassunto alla fine di ogni fase
