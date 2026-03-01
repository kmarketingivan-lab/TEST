# Known Issues

Limitazioni note della Fase 1. Da risolvere nelle fasi successive o prima del deploy in produzione.

---

## ~~1. Rate Limiting In-Memory~~ ✅ RISOLTO

**Risolto in**: `lib/utils/rate-limit.ts`, `lib/auth/actions.ts`, `lib/checkout/actions.ts`, `lib/cart/actions.ts`

Rate limiting distribuito via Upstash Redis con fallback noop per dev locale. Preset: auth (5 req/60s), checkout (3 req/60s), default (10 req/10s).

---

## ~~2. Stock Decrement Non Atomico~~ ✅ RISOLTO

**Risolto in**: `supabase/migrations/20260228000014_atomic_stock.sql`, `lib/checkout/actions.ts`

Creata funzione RPC `decrement_stock(p_product_id, p_quantity)` con `SELECT ... FOR UPDATE` per garantire atomicità. Il checkout usa `supabase.rpc('decrement_stock')`.

---

## ~~3. Booking Slot Race Condition~~ ✅ RISOLTO

**Risolto in**: `supabase/migrations/20260228000015_booking_unique.sql`, `app/(admin)/admin/bookings/actions.ts`

Aggiunto unique index parziale su `(service_id, booking_date, start_time) WHERE status != 'cancelled'`. Errore `23505` (unique_violation) gestito nel codice con messaggio "Questo slot è già stato prenotato".

---

## 4. Stripe Non Integrato

**File**: `lib/checkout/actions.ts`

Il checkout non include l'integrazione con Stripe o altri payment gateway. Gli ordini vengono creati con stato `pending` senza processare il pagamento.

**Soluzione**: Integrare Stripe Checkout o Payment Intents. Aggiungere il campo `stripe_payment_intent_id` (già presente nello schema) e webhooks per gestire i pagamenti asincroni.

---

## ~~5. File Upload — Validazione Magic Bytes Assente~~ ✅ RISOLTO

**Risolto in**: `app/api/media/upload/route.ts`

Aggiunta validazione magic bytes via `file-type` (fileTypeFromBuffer). Whitelist: image/jpeg, image/png, image/webp, image/gif. File con MIME non corrispondente ai magic bytes vengono rifiutati con 400.

---

## ~~6. Order Number Generation Non Atomica~~ ✅ RISOLTO

**Risolto in**: `supabase/migrations/20260228000016_order_sequence.sql`, `lib/checkout/actions.ts`

Creata sequence PostgreSQL `order_number_seq` e funzione `generate_order_number()` che usa `nextval()`. Il checkout usa `supabase.rpc('generate_order_number')`.

---

## 7. Cache Invalidation Limitata

**File**: `lib/dal/settings.ts`

La cache delle impostazioni pubbliche usa `unstable_cache` di Next.js con `revalidate: 3600` (1 ora). Questo è un'API unstable che potrebbe cambiare. L'invalidazione tramite `revalidateTag` funziona solo nella stessa istanza.

**Soluzione**: Valutare alternative stabili per il caching quando Next.js stabilizzerà l'API, oppure usare Redis per cache condivisa tra istanze.

---

## 8. Nessun Soft Delete per la Maggior Parte delle Entità

Solo i prodotti implementano soft delete (`is_active: false`). Categorie, pagine, blog posts, media e servizi di prenotazione vengono eliminati con hard delete.

**Soluzione**: Valutare l'aggiunta di soft delete per le entità che richiedono storicità (ordini già referenziano prodotti con FK SET NULL).
