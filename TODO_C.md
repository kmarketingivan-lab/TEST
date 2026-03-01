# TODO_C — Integrazione Pagamenti Stripe

> Integra Stripe Checkout per il flusso di pagamento.
> FILE OWNERSHIP: `lib/stripe/`, `app/api/stripe/`, `app/(storefront)/checkout/`,
> `app/(storefront)/cart/`, `components/storefront/checkout-button.tsx`
> NON toccare: `supabase/migrations/`, `components/ui/`, `components/layout/`, `__tests__/`
> NON toccare i file di TODO_A e TODO_B
> Dopo ogni task: `npx tsc --noEmit && npm run build`

---

## C1 — Setup Stripe

### C1.1 — Installa dipendenze
- [x] `npm install stripe @stripe/stripe-js`
- [x] Aggiungi a `.env.local.example`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
- [x] Aggiungi a `.env.local` le stesse chiavi con valori placeholder (sk_test_placeholder ecc.)
- [x] **Verifica**: `npx tsc --noEmit`

### C1.2 — Crea client Stripe server-side
- [x] Crea `lib/stripe/server.ts`:
  - Importa `Stripe` da `stripe`
  - Esporta singleton `stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })`
  - Graceful degradation: usa stringa vuota se chiave mancante (la 503 viene gestita nella route)
  - Verifica: solo importabile da server (no "use client")
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### C1.3 — Crea utility Stripe client-side
- [x] Crea `lib/stripe/client.ts`:
  - "use client" (o senza, importato solo da client components)
  - Importa `loadStripe` da `@stripe/stripe-js`
  - Esporta `getStripe()` che ritorna promise con singleton Stripe instance
  - Usa `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

---

## C2 — Stripe Checkout Session

### C2.1 — API route per creare checkout session
- [x] Crea `app/api/stripe/checkout/route.ts`:
  - POST handler
  - Leggi cart dal cookie (stessa logica di `lib/cart/cart.ts`)
  - Per ogni item nel cart: crea `line_items` con `price_data` (currency: "eur", product_data: { name, images }, unit_amount: price * 100)
  - `stripe.checkout.sessions.create({...})`
  - `mode: 'payment'`
  - `success_url`: `{origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `{origin}/cart`
  - `metadata`: { cart_id o info per ricostruire ordine }
  - `shipping_address_collection`: { allowed_countries: ['IT'] }
  - `customer_email`: se utente loggato, precompila
  - `locale: 'it'`
  - Ritorna `{ sessionId: session.id, url: session.url }` con status 200
  - Se errore → 500 con messaggio generico
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### C2.2 — Bottone checkout con redirect Stripe
- [x] Crea `components/storefront/checkout-button.tsx`:
  - Client component con bottone "Paga con Stripe"
  - onClick: fetch POST `/api/stripe/checkout`, ottieni url, redirect via `window.location.href` (redirectToCheckout rimosso in Stripe.js v8+)
  - Loading state durante il redirect
  - Error handling: mostra toast se fallisce
  - Stile: `bg-red-700 hover:bg-red-800 text-white rounded-full px-8 py-3 text-lg font-bold`
- [x] Integrato in `app/(storefront)/checkout/page.tsx` nel riepilogo ordine
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

---

## C3 — Webhook Stripe

### C3.1 — API route webhook
- [x] Crea `app/api/stripe/webhook/route.ts`:
  - POST handler
  - Leggi body raw (`request.text()`)
  - Verifica signature con `stripe.webhooks.constructEvent(body, sig, webhookSecret)`
  - Se verifica fallisce → 400
  - Gestisci evento `checkout.session.completed`:
    1. Recupera session con `stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] })`
    2. Crea ordine nel DB usando service role Supabase (stessa logica di checkout actions ma con dati da Stripe)
    3. Decrementa stock (usa cart_hash metadata per trovare productId e quantity, fallback a UPDATE diretto)
    4. Cart si svuota lato client al redirect (ClearCart component)
    5. Logga in audit_log
  - Gestisci evento `checkout.session.expired`: logga solo
  - Ritorna 200 `{ received: true }`
  - IMPORTANTE: `export const runtime = 'nodejs'` (no edge, serve per body raw)
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### C3.2 — Configura Next.js per webhook raw body
- [x] In App Router con `request.text()` funziona senza config extra — nessuna modifica necessaria
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

---

## C4 — Pagina Success aggiornata

### C4.1 — Aggiorna success page
- [x] `app/(storefront)/checkout/success/page.tsx`:
  - Leggi `session_id` da searchParams
  - Se presente: fetch dettagli sessione dal server per mostrare riepilogo
  - Mostra: "Ordine confermato!", email di conferma (da Stripe session)
  - Se `session_id` e `order` entrambi mancanti: redirect a homepage
  - Svuota cart cookie lato client (`clear-cart.tsx` component)
  - Link "Torna al catalogo" e "I miei ordini"
  - Mantiene retrocompatibilità con `?order=` param per ordini manuali
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

---

## C5 — Flusso alternativo (Stripe non configurato)

### C5.1 — Graceful degradation
- [x] In `app/api/stripe/checkout/route.ts`: se `STRIPE_SECRET_KEY` non è presente o è placeholder, ritorna 503 con messaggio "Pagamenti non ancora configurati"
- [x] Nel checkout button: se errore 503, mostra messaggio "I pagamenti saranno disponibili a breve. Contattaci per ordinare."
- [x] Il checkout form esistente (senza Stripe) resta come fallback per creare ordini manuali
- [x] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## C6 — Verifica finale
- [x] `npx tsc --noEmit && npm run build && npm run test:run` — TUTTO verde (errori tsc in lib/auth/actions.ts e lib/checkout/actions.ts sono da TODO_A/B, non da TODO_C)
- [ ] `git add -A && git commit -m "feat: Stripe Checkout integration with webhook"`
