# TODO_A — Fix Tecnici Backend (KNOWN_ISSUES)

> Risolvi i problemi tecnici documentati in KNOWN_ISSUES.md.
> FILE OWNERSHIP: SOLO file in `lib/`, `app/api/`, `supabase/migrations/`, `package.json`
> NON toccare: `components/`, `app/(admin)/`, `app/(storefront)/` (tranne checkout actions)
> Dopo ogni task: `npx tsc --noEmit && npm run build && npm run test:run`

---

## A1 — Rate Limiting con Upstash Redis

### A1.1 — Installa dipendenza
- [x] `npm install @upstash/ratelimit @upstash/redis`
- [x] Aggiungi a `.env.local.example`: `UPSTASH_REDIS_REST_URL=`, `UPSTASH_REDIS_REST_TOKEN=`
- [x] **Verifica**: `npx tsc --noEmit`

### A1.2 — Crea modulo rate limiter
- [x] Crea `lib/utils/rate-limit.ts`:
  - Importa `Ratelimit` da `@upstash/ratelimit` e `Redis` da `@upstash/redis`
  - Se env vars mancanti, fallback a noop (per dev locale senza Redis)
  - Esporta `rateLimit(identifier: string, opts?: { limit?: number; window?: string })` → `{ success: boolean; remaining: number }`
  - Rate limit default: 10 req / 10s per IP
  - Rate limit auth: 5 req / 60s per IP
  - Rate limit checkout: 3 req / 60s per IP
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### A1.3 — Applica rate limiting alle server actions critiche
- [x] `lib/auth/actions.ts`: aggiungi rate limit (auth) a login, register, resetPassword
- [x] `lib/checkout/actions.ts`: aggiungi rate limit (checkout) a createOrder
- [x] `lib/cart/actions.ts`: aggiungi rate limit (default) a addToCart
- [x] Ogni rate limit check deve: ottenere IP da headers (x-forwarded-for o fallback), chiamare rateLimit, se `!success` tornare `{ error: "Troppe richieste. Riprova tra poco." }`
- [x] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## A2 — Stock Decrement Atomico (RPC Postgres)

### A2.1 — Crea migrazione RPC
- [x] Crea `supabase/migrations/20260228000014_atomic_stock.sql`
- [ ] Applica: `npx supabase db reset` (skip — no local Supabase running)
- [x] **Verifica**: migration file created, tsc clean

### A2.2 — Usa RPC nel checkout
- [x] In `lib/checkout/actions.ts`: sostituito il decrement manuale con `supabase.rpc('decrement_stock', { p_product_id, p_quantity })`
- [x] Se RPC ritorna false → ritorna errore "Prodotto esaurito"
- [x] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## A3 — Booking Race Condition (Unique Constraint)

### A3.1 — Crea migrazione unique constraint
- [x] Crea `supabase/migrations/20260228000015_booking_unique.sql`: partial unique index su (service_id, booking_date, start_time) WHERE status != 'cancelled'
- [ ] Applica: `npx supabase db reset` (skip — no local Supabase running)
- [x] **Verifica**: migration file created, tsc clean

### A3.2 — Gestisci errore unique violation nel codice
- [x] In `app/(admin)/admin/bookings/actions.ts`: cattura errore `23505` (unique_violation) e ritorna messaggio "Questo slot è già stato prenotato"
- [x] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## A4 — Order Number Atomico (Sequence Postgres)

### A4.1 — Crea migrazione sequence
- [x] Crea `supabase/migrations/20260228000016_order_sequence.sql`
- [ ] Applica: `npx supabase db reset` (skip — no local Supabase running)
- [x] **Verifica**: migration file created, tsc clean

### A4.2 — Usa nel checkout
- [x] In `lib/checkout/actions.ts`: sostituito generazione order_number con `supabase.rpc('generate_order_number')`
- [x] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## A5 — File Upload Magic Bytes

### A5.1 — Installa e implementa
- [x] `npm install file-type`
- [x] In `app/api/media/upload/route.ts`: dopo aver ricevuto il file, usa `fileTypeFromBuffer` per verificare che il MIME type reale corrisponda all'estensione
- [x] Lista whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- [x] Se mismatch → 400 "Tipo file non consentito"
- [x] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## A6 — Verifica finale
- [x] Aggiorna `KNOWN_ISSUES.md`: segna come risolti i punti fixati (1, 2, 3, 5, 6)
- [x] `npx tsc --noEmit && npm run build && npm run test:run` — TUTTO verde
- [ ] `git add -A && git commit -m "fix: resolve KNOWN_ISSUES — atomic stock, rate limit, booking unique, order seq, magic bytes"`