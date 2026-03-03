# TODO_ORDERS — Fix workflow ordini + Notifiche + Dashboard real-time
> Progetto: my-ecommerce-v2
> Obiettivo: ordine creato SOLO dal webhook Stripe dopo pagamento confermato.
> Notifiche: email proprietario + WhatsApp gratis (CallMeBot) + dashboard real-time.
> Admin: flusso completo gestione ordine con step, tracking, ritiro in negozio.

---

## FASE O1 — Rimuovere creazione ordine dal checkout form
> Il CheckoutForm attuale chiama createOrder → crea ordine pending prima del pagamento. SBAGLIATO.
> Il form deve solo raccogliere dati e lanciare la sessione Stripe.

### O1.1 — Checkout form: eliminare createOrder, passare a Stripe
- [ ] In `app/(storefront)/checkout/checkout-form.tsx`:
  - Rimuovere import e chiamata a `createOrder`
  - Il submit deve invece chiamare `POST /api/stripe/checkout` passando i dati del form
  - Salvare i dati del cliente (nome, telefono, indirizzo, note, coupon, pickup_document_type, pickup_document_number) nei `metadata` della sessione Stripe (come fa bottega-matta)
  - Dopo la risposta `{ url }` fare `window.location.href = url` per redirect a Stripe
  - Loading state durante il redirect
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### O1.2 — API stripe/checkout: salvare dati cliente in metadata
- [ ] In `app/api/stripe/checkout/route.ts`:
  - Accettare nel body POST anche: `customer_name`, `customer_phone`, `notes`, `coupon_code`, `pickup_document_type`, `pickup_document_number`, `shipping_address` (oggetto), `billing_address`
  - Aggiungere questi campi a `session.metadata` (Stripe accetta fino a 50 chiavi da 500 chars)
  - Per indirizzi lunghi: JSON.stringify con chiave `shipping_address_json`
  - Rimuovere `shipping_address_collection` da Stripe (raccogliamo già noi l'indirizzo)
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### O1.3 — Webhook: ricostruire ordine completo dai metadata
- [ ] In `app/api/stripe/webhook/route.ts`, dentro `handleCheckoutCompleted`:
  - Leggere da `fullSession.metadata`: `customer_name`, `customer_phone`, `notes`, `pickup_document_type`, `pickup_document_number`, `shipping_address_json`
  - Parsare `shipping_address_json` per ricostruire l'indirizzo
  - Aggiungere ai `rpcParams`: `requires_pickup`, `pickup_document_type`, `pickup_document_number`
  - Rimuovere il fallback `collected_information.shipping_details` (non più necessario)
  - Status ordine creato: `confirmed` (pagamento già avvenuto)
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### O1.4 — Rimuovere createOrder da lib/checkout/actions.ts
- [ ] In `lib/checkout/actions.ts`:
  - La funzione `createOrder` NON va eliminata — serve ancora per ordini manuali admin
  - Aggiungere commento: `// NON chiamare dal frontend — usare solo via webhook Stripe o da admin`
  - Aggiungere guard: se `stripe_payment_intent_id` è null e chiamata non è da admin → return error
- [ ] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## FASE O2 — Notifica email al proprietario su nuovo ordine

### O2.1 — Template email notifica proprietario
- [ ] Creare `lib/email/templates/owner-notification.ts`:
  - HTML semplice, ottimizzato per mobile (il proprietario legge sul telefono)
  - Contenuto:
    - Titolo: "🛍️ Nuovo ordine #[ORDER_NUMBER]"
    - Cliente: nome, email, telefono
    - Prodotti: lista con quantità e prezzi
    - Totale
    - Se `requires_pickup`: box rosso "⚠️ RITIRO IN NEGOZIO — Documento: [tipo] n. [numero]"
    - Se spedizione: indirizzo completo
    - Link diretto: `https://[sito]/admin/orders/[id]`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### O2.2 — Inviare email al proprietario dal webhook
- [ ] In `lib/email/send.ts`: aggiungere funzione `sendOwnerNotification(order, items, ownerEmail)`
- [ ] In `app/api/stripe/webhook/route.ts`, dopo la creazione ordine:
  ```ts
  const ownerEmail = process.env.OWNER_EMAIL;
  if (ownerEmail) {
    await sendOwnerNotification(orderForEmail, orderItems, ownerEmail);
  }
  ```
- [ ] In `.env.local.example`: aggiungere `OWNER_EMAIL=proprietario@armeriapalmetto.it`
- [ ] In `.env.local`: aggiungere `OWNER_EMAIL=` (da compilare)
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE O3 — Notifica WhatsApp gratis (CallMeBot)
> CallMeBot è un servizio gratuito che manda messaggi WhatsApp tramite HTTP GET.
> Setup manuale richiesto una volta sola (vedi istruzioni sotto).
> Documentazione: https://www.callmebot.com/blog/free-api-whatsapp-messages/

### O3.1 — Setup manuale CallMeBot (DA FARE A MANO — 2 minuti)
```
1. Salva questo numero nei contatti WhatsApp: +34 644 59 21 91 (nome: "CallMeBot")
2. Manda questo messaggio su WhatsApp a quel numero:
   "I allow callmebot to send me messages"
3. Riceverai un messaggio con la tua API key (es. "123456")
4. Salva il numero del tuo WhatsApp e l'API key
5. Aggiungili a .env.local:
   CALLMEBOT_PHONE=39XXXXXXXXXX  ← numero italiano con prefisso 39, senza +
   CALLMEBOT_APIKEY=123456
```

### O3.2 — Creare utility WhatsApp
- [ ] Creare `lib/notifications/whatsapp.ts`:
  ```ts
  export async function sendWhatsAppNotification(message: string): Promise<void> {
    const phone = process.env.CALLMEBOT_PHONE;
    const apikey = process.env.CALLMEBOT_APIKEY;
    if (!phone || !apikey) return; // graceful degradation
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`;
    await fetch(url);
  }
  ```
- [ ] In `.env.local.example`: aggiungere `CALLMEBOT_PHONE=` e `CALLMEBOT_APIKEY=`
- [ ] **Verifica**: `npx tsc --noEmit`

### O3.3 — Inviare WhatsApp dal webhook
- [ ] In `app/api/stripe/webhook/route.ts`, dopo la creazione ordine:
  ```ts
  const waMessage = order.requires_pickup
    ? `🔫 Nuovo ordine #${orderNumber} — RITIRO IN NEGOZIO\nCliente: ${customerName}\nTel: ${customerPhone}\nDocumento: ${pickupDocType}\nTotale: €${total}`
    : `🛍️ Nuovo ordine #${orderNumber}\nCliente: ${customerName}\nIndirizzo: ${city}\nTotale: €${total}`;
  await sendWhatsAppNotification(waMessage);
  ```
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE O4 — Dashboard admin real-time (Supabase Realtime)
> Supabase Realtime è già nel progetto — basta sottoscrivere la tabella orders.

### O4.1 — Badge ordini pendenti in tempo reale nella sidebar
- [ ] Creare `components/admin/pending-orders-badge.tsx`:
  - Client component con `"use client"`
  - Carica il count iniziale di ordini `confirmed` (da gestire) tramite fetch
  - Sottoscrive il canale Supabase Realtime su `orders` (INSERT e UPDATE)
  - Quando arriva un nuovo ordine `confirmed`: aggiorna il count + suona un beep (Web Audio API, 1 nota breve)
  - Mostra badge rosso con numero se count > 0
  - Usa `supabase.channel('orders-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)`
- [ ] In `components/layout/admin-sidebar.tsx`: importare e usare `<PendingOrdersBadge />` accanto al link "Ordini"
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### O4.2 — Pagina ordini: indicatore "nuovo" per ordini recenti
- [ ] In `app/(admin)/admin/orders/` (pagina lista ordini):
  - Aggiungere colonna o badge "🆕" per ordini creati negli ultimi 30 minuti
  - Aggiungere `export const revalidate = 30` per refresh automatico ogni 30 secondi
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE O5 — Pagina dettaglio ordine admin: workflow completo
> Portare la UX di bottega-matta (step status, tracking, timeline) su my-ecommerce-v2.

### O5.1 — Trovare il file dettaglio ordine esistente
- [ ] Cercare in `app/(admin)/admin/orders/` il file di dettaglio ordine
- [ ] Se non esiste, crearlo come `app/(admin)/admin/orders/[id]/page.tsx`

### O5.2 — Aggiungere workflow status con step suggerito
- [ ] Nella pagina dettaglio ordine admin:
  - Mostrare status attuale con badge colorato:
    - `confirmed` → giallo "Da preparare"
    - `processing` → arancione "In preparazione"
    - `shipped` → blu "Spedito"
    - `completed` → verde "Completato"
    - `pickup_ready` → viola "Pronto per ritiro"
    - `refunded` → rosso "Rimborsato"
  - Select "Nuovo stato" con il prossimo step logico pre-selezionato:
    - `confirmed` → suggerisce `processing`
    - `processing` → se `requires_pickup`: suggerisce `pickup_ready`, altrimenti `shipped`
    - `shipped` → suggerisce `completed`
    - `pickup_ready` → suggerisce `completed`
  - Se stato = `shipped`: mostrare campi "Codice tracking" e "URL tracking"
  - Se stato = `pickup_ready`: mostrare sezione documento con checkbox "Documento verificato dal personale"
  - Textarea nota opzionale
  - Bottone "Aggiorna stato"

### O5.3 — API route per aggiornamento status
- [ ] Creare `app/api/admin/orders/[id]/status/route.ts`:
  - PATCH handler con autenticazione admin
  - Accetta: `{ status, nota, tracking_code?, tracking_url?, pickup_document_verified? }`
  - Aggiorna tabella `orders`
  - Inserisce riga in `order_status_history` (se non esiste già, creare migrazione)
  - Se status = `shipped`: invia email di spedizione al cliente con tracking
  - Se status = `pickup_ready`: invia email/WhatsApp al cliente "il tuo ordine è pronto per il ritiro"
  - Ritorna ordine aggiornato
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### O5.4 — Migrazione: tabella order_status_history
- [ ] Creare `supabase/migrations/20260302000030_order_status_history.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    nota TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
  ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "admin_only" ON order_status_history
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  ```
- [ ] Applicare: `npx supabase migration up`
- [ ] **Verifica**: studio locale mostra la nuova tabella

### O5.5 — Timeline cronologia nella pagina ordine
- [ ] Nella pagina dettaglio ordine: aggiungere sezione "Cronologia" con timeline verticale
  - Legge da `order_status_history` ordinato per `created_at asc`
  - Ogni riga: pallino colorato con il colore dello status, freccia `vecchio → nuovo`, nota, data/ora
  - Stessa UX di bottega-matta ma con tema rosso/nero Palmetto

### O5.6 — Info ritiro in negozio
- [ ] Se `order.requires_pickup === true`:
  - Mostrare box rosso scuro in cima alla pagina ordine:
    "⚠️ RITIRO IN NEGOZIO — Cliente deve presentarsi con: [pickup_document_type] n. [pickup_document_number]"
  - Checkbox "Documento verificato dal personale" — quando spuntata chiama l'API per aggiornare `pickup_document_verified = true`
  - Quando `pickup_document_verified = true` e admin clicca "Aggiorna stato" a `completed`: registra che il ritiro è avvenuto
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE O6 — Email spedizione e ritiro pronto

### O6.1 — Template email spedizione
- [ ] Creare `lib/email/templates/shipping-notification.ts`:
  - "Il tuo ordine #[N] è stato spedito!"
  - Codice tracking + link URL tracking se presente
  - Prodotti ordinati
  - Stimare consegna (3-5 giorni lavorativi)

### O6.2 — Template email ritiro pronto
- [ ] Creare `lib/email/templates/pickup-ready.ts`:
  - "Il tuo ordine #[N] è pronto per il ritiro!"
  - Indirizzo armeria, orari
  - Reminder: "Porta con te il documento abilitativo ([tipo])"

### O6.3 — Aggiungere sendShippingNotification e sendPickupReady in send.ts
- [ ] In `lib/email/send.ts`: aggiungere le due nuove funzioni
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE O7 — Verifica finale
- [ ] `npx tsc --noEmit` → zero errori
- [ ] `npm run build` → zero errori
- [ ] `npm run test:run` → zero fallimenti
- [ ] Test manuale flusso completo in locale:
  1. Aggiungi prodotto al carrello
  2. Vai al checkout → compila form → clicca "Paga con Stripe"
  3. Usa carta test Stripe `4242 4242 4242 4242`
  4. Verifica che l'ordine appaia in `/admin/orders` con status `confirmed`
  5. Verifica che non esistano ordini `pending` orfani in Supabase Studio
- [ ] `git add -A && git commit -m "feat: webhook-only orders, WhatsApp notify, admin order workflow"`
