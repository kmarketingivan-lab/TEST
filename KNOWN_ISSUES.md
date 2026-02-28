# Known Issues

Limitazioni note della Fase 1. Da risolvere nelle fasi successive o prima del deploy in produzione.

---

## 1. Rate Limiting In-Memory

**File**: `lib/auth/actions.ts`

Il rate limiting su signIn utilizza una `Map` in-memory. Questo funziona solo su una singola istanza del server. In produzione con più istanze (o serverless), ogni istanza ha il proprio contatore.

**Soluzione**: Sostituire con Redis (Upstash) o un rate limiter distribuito.

---

## 2. Stock Decrement Non Atomico

**File**: `lib/checkout/actions.ts`

Il decremento dello stock durante il checkout è un read-then-write non atomico. Due ordini concorrenti per lo stesso prodotto potrebbero entrambi passare il check dello stock e decrementare, portando a stock negativo.

**Soluzione**: Creare una funzione RPC PostgreSQL che decrementa atomicamente lo stock con `UPDATE ... SET stock_quantity = stock_quantity - $1 WHERE stock_quantity >= $1 RETURNING stock_quantity`, oppure usare un advisory lock.

---

## 3. Booking Slot Race Condition

**File**: `lib/dal/bookings.ts`, `app/(admin)/admin/bookings/actions.ts`

La verifica dello slot disponibile e l'inserimento della prenotazione sono due operazioni separate. Due utenti che prenotano lo stesso slot contemporaneamente potrebbero entrambi superare il check e creare prenotazioni sovrapposte.

**Soluzione**: Usare un unique constraint parziale su `(booking_date, start_time)` con `WHERE status != 'cancelled'`, oppure un advisory lock, oppure una funzione RPC con `SELECT ... FOR UPDATE`.

---

## 4. Stripe Non Integrato

**File**: `lib/checkout/actions.ts`

Il checkout non include l'integrazione con Stripe o altri payment gateway. Gli ordini vengono creati con stato `pending` senza processare il pagamento.

**Soluzione**: Integrare Stripe Checkout o Payment Intents. Aggiungere il campo `stripe_payment_intent_id` (già presente nello schema) e webhooks per gestire i pagamenti asincroni.

---

## 5. File Upload — Validazione Magic Bytes Assente

**File**: `app/(admin)/admin/media/actions.ts`

La validazione MIME dei file upload si basa solo sul MIME type dichiarato dal browser, non sui magic bytes del file. Un utente potrebbe rinominare un file eseguibile con estensione .jpg e il MIME type verrebbe accettato.

**Soluzione**: Aggiungere validazione basata sui magic bytes (primi byte del file) per verificare il tipo reale del contenuto. Librerie come `file-type` possono essere usate per questo.

---

## 6. Order Number Generation Non Atomica

**File**: `lib/checkout/actions.ts`

La generazione del numero ordine (`ORD-YYYY-NNNNNN`) si basa su un conteggio degli ordini esistenti. Due ordini creati simultaneamente potrebbero ottenere lo stesso numero.

**Soluzione**: Usare la funzione SQL `generate_order_number()` già definita nella migration `0006_orders.sql`, oppure usare una sequence PostgreSQL dedicata.

---

## 7. Cache Invalidation Limitata

**File**: `lib/dal/settings.ts`

La cache delle impostazioni pubbliche usa `unstable_cache` di Next.js con `revalidate: 3600` (1 ora). Questo è un'API unstable che potrebbe cambiare. L'invalidazione tramite `revalidateTag` funziona solo nella stessa istanza.

**Soluzione**: Valutare alternative stabili per il caching quando Next.js stabilizzerà l'API, oppure usare Redis per cache condivisa tra istanze.

---

## 8. Nessun Soft Delete per la Maggior Parte delle Entità

Solo i prodotti implementano soft delete (`is_active: false`). Categorie, pagine, blog posts, media e servizi di prenotazione vengono eliminati con hard delete.

**Soluzione**: Valutare l'aggiunta di soft delete per le entità che richiedono storicità (ordini già referenziano prodotti con FK SET NULL).
