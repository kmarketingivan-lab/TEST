# TODO_LIVE — Roadmap verso la produzione
> Tutte le task eseguibili da Ralph + Claude CLI.
> Le task manuali (account, KYC, DNS) sono documentate ma marcate [MANUALE].
> Ordine: esegui le fasi in sequenza. Ogni fase deve passare `npx tsc --noEmit && npm run build` prima di procedere.

---

## ⚠️ PREREQUISITI MANUALI (fai PRIMA di iniziare)

Prima che Ralph possa operare hai bisogno di questi account e chiavi. Raccoglile tutte e poi aggiorna `.env.local` e successivamente l'env di Vercel.

| # | Cosa | Dove | Output necessario |
|---|------|------|-------------------|
| M1 | Account **Supabase Cloud** | app.supabase.com | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| M2 | Account **Stripe** + KYC armeria | stripe.com → contatta support per "firearms dealer" | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` |
| M3 | Account **Resend** + verifica dominio | resend.com | `RESEND_API_KEY` |
| M4 | Account **Vercel** | vercel.com | Deploy URL |
| M5 | **Dominio** (es. armeriapalmetto.it) | Registrar a scelta | DNS configurato |
| M6 | Account **Upstash Redis** | upstash.com | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| M7 | Account **Sentry** | sentry.io | `SENTRY_DSN` |

---

## FASE L1 — Contenuti reali (dati armeria)
> Sostituisce tutti i placeholder con i dati reali di Armeria Palmetto.
> FILE: `app/(storefront)/page.tsx`, `lib/email/send.ts`, `app/layout.tsx`, `app/sitemap.ts`, pagine legali

### L1.1 — Homepage: dati reali negozio
- [ ] In `app/(storefront)/page.tsx`, sostituire:
  - `"Via Roma 123, 00100 Roma (RM)"` → `"Via Oberdan 70, 25121 Brescia (BS)"`
  - `"+39 0123 456789"` → numero reale Armeria Palmetto
  - `"info@myecommerce.it"` → email reale
  - JSON-LD `generateLocalBusinessSchema`: aggiornare `phone`, `email`, `address` (street: "Via Oberdan 70", city: "Brescia", province: "BS", postalCode: "25121"), orari reali
  - JSON-LD `generateOrganizationSchema`: aggiornare `email`, `phone`
  - Google Maps placeholder: sostituire con iframe Google Maps reale per Via Oberdan 70 Brescia
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L1.2 — Email: dominio mittente reale
- [ ] In `lib/email/send.ts`: cambiare `"Armeria Palmetto <noreply@armeriapalmetto.it>"` con il dominio verificato su Resend
  - Se il dominio è diverso, aggiornare con il dominio reale
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L1.3 — Layout: metadata e URL sito
- [ ] In `app/layout.tsx`: aggiornare `metadata.metadataBase` per puntare al dominio reale
- [ ] In `app/sitemap.ts`: verificare che usi `NEXT_PUBLIC_SITE_URL` con fallback corretto
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L1.4 — Immagine OG default
- [ ] Creare/posizionare `public/og-default.jpg` (1200x630px) con logo e nome armeria
  - Se non disponibile, creare un placeholder SVG in `public/og-default.jpg` via script
- [ ] **Verifica**: file presente in `public/`

### L1.5 — Pagine legali: dati reali
- [ ] In `app/(storefront)/privacy-policy/page.tsx`: verificare che titolare sia "Armeria Palmetto, Via Oberdan 70, 25121 Brescia (BS)"
- [ ] In `app/(storefront)/terms/page.tsx`: verificare foro competente "Brescia", P.IVA reale
- [ ] In `app/(storefront)/cookie-policy/page.tsx`: verificare dati titolare
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE L2 — Compliance normativa armi (dal parere legale)
> In base al parere legale: armi da sparo → SOLO click & collect (ritiro in negozio).
> Fuochi artificiali → spedizione consentita ma solo con corriere ADR.
> Questa fase adatta il checkout alle due categorie di prodotti.

### L2.1 — Migrazione: campo categoria_tipo su products
- [ ] Crea `supabase/migrations/20260302000028_product_type.sql`:
  ```sql
  -- Aggiunge tipo di prodotto per differenziare armi da fuoco vs fuochi artificiali
  ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'standard'
    CHECK (product_type IN ('standard', 'arma_fuoco', 'munizioni', 'fuochi_artificiali', 'accessori'));

  COMMENT ON COLUMN products.product_type IS
    'Tipo prodotto per compliance normativa: arma_fuoco e munizioni = solo ritiro in negozio; fuochi_artificiali = spedizione ADR consentita; standard/accessori = spedizione normale';
  ```
- [ ] **Verifica**: `npx tsc --noEmit`

### L2.2 — Migrazione: campo documento_autorizzativo su orders
- [ ] Crea `supabase/migrations/20260302000029_order_compliance.sql`:
  ```sql
  -- Campi compliance per ordini di armi
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS requires_pickup BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_document_type TEXT
    CHECK (pickup_document_type IN ('porto_armi', 'nulla_osta_questore', 'carta_collezionista', 'licenza_commerciale', NULL));
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_document_number TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_document_verified BOOLEAN DEFAULT false;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_notes TEXT;

  COMMENT ON COLUMN orders.requires_pickup IS 'True se l''ordine contiene armi da sparo o munizioni che richiedono ritiro fisico in armeria';
  COMMENT ON COLUMN orders.pickup_document_type IS 'Tipo documento abilitativo presentato dal cliente per il ritiro';
  COMMENT ON COLUMN orders.pickup_document_number IS 'Numero documento abilitativo';
  COMMENT ON COLUMN orders.pickup_document_verified IS 'True se il personale dell''armeria ha verificato il documento fisicamente';
  ```
- [ ] **Verifica**: `npx tsc --noEmit`

### L2.3 — Applica migrazioni in locale
- [ ] Esegui: `npx supabase db reset` OPPURE `npx supabase migration up`
- [ ] Verifica con: `npx supabase db diff` che non ci siano pendenze
- [ ] **Verifica**: studio locale su `http://127.0.0.1:54323` mostra le nuove colonne

### L2.4 — Checkout: avviso ritiro in negozio per armi
- [ ] In `app/(storefront)/checkout/checkout-form.tsx`: aggiungere sezione condizionale
  - Il carrello potrebbe contenere armi: aggiungere un prop `hasFirearms: boolean` e `hasPyrotechnics: boolean`
  - Se `hasFirearms === true`: mostrare box avviso prominente (sfondo rosso scuro):
    ```
    ⚠️ RITIRO OBBLIGATORIO IN NEGOZIO
    Gli articoli nel tuo carrello includono armi da fuoco e/o munizioni.
    Per legge (Art. 17, L. 110/1975), il ritiro deve avvenire fisicamente presso Armeria Palmetto
    (Via Oberdan 70, Brescia) previa esibizione del documento abilitativo (porto d'armi o nulla osta del Questore).
    ```
  - Nascondere/disabilitare il campo "indirizzo di spedizione" per gli ordini con armi (solo "indirizzo di fatturazione")
  - Aggiungere sezione "Documento abilitativo" con:
    - Select: "Porto d'armi" / "Nulla osta Questore" / "Carta collezionista" / "Licenza commerciale"
    - Input: numero documento
    - Checkbox obbligatoria: "Dichiaro di essere in possesso del documento selezionato e di portarlo al ritiro"
  - Se `hasPyrotechnics === true`: mostrare box informativo (sfondo giallo):
    ```
    ℹ️ SPEDIZIONE FUOCHI ARTIFICIALI
    Gli articoli pirotecnici vengono spediti tramite corriere specializzato ADR.
    I tempi di consegna potrebbero essere più lunghi rispetto alla spedizione standard.
    ```
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L2.5 — Checkout page: rilevare tipo prodotti nel carrello
- [ ] In `app/(storefront)/checkout/page.tsx`:
  - Dopo aver caricato il carrello, fare query sui prodotti per verificare `product_type`
  - Passare `hasFirearms` e `hasPyrotechnics` al `CheckoutForm`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L2.6 — Server action: gestire ordini con armi
- [ ] In `lib/checkout/actions.ts`:
  - Verificare se i prodotti nell'ordine sono di tipo `arma_fuoco` o `munizioni`
  - Se sì: impostare `requires_pickup: true` nei params RPC
  - Impostare `shipping_address` uguale a quello dell'armeria per ordini pickup-only:
    `{ street: "Via Oberdan 70", city: "Brescia", zip: "25121", province: "BS", country: "IT" }`
  - Salvare `pickup_document_type` e `pickup_document_number` dal form
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L2.7 — Admin: mostrare info ritiro negli ordini
- [ ] In `app/(admin)/admin/orders/[id]/page.tsx` (o il file di dettaglio ordine esistente):
  - Se `order.requires_pickup === true`: mostrare badge "RITIRO IN NEGOZIO" in rosso
  - Mostrare tipo e numero documento autorizzativo
  - Mostrare checkbox "Documento verificato" che l'admin può spuntare (chiama action per aggiornare `pickup_document_verified`)
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L2.8 — Prodotti admin: aggiungere campo product_type
- [ ] In `app/(admin)/admin/products/` (form creazione/modifica prodotto):
  - Aggiungere select "Tipo prodotto" con opzioni: Standard, Arma da fuoco, Munizioni, Fuochi artificiali, Accessori
  - Mappato su `product_type` della tabella
- [ ] In `lib/validators/products.ts`: aggiungere `product_type` allo schema Zod
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L2.9 — Verifica età per fuochi artificiali
- [ ] In `app/(storefront)/products/[slug]/page.tsx`:
  - Se `product.product_type === 'fuochi_artificiali'`: mostrare avviso "Vendita riservata a maggiori di 18 anni"
  - Il bottone "Aggiungi al carrello" deve mostrare una modale di conferma età prima di procedere
  - Modale testo: "Confermo di avere almeno 18 anni e di essere legalmente autorizzato all'acquisto di articoli pirotecnici"
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L2.10 — Restrizione geografica: solo Italia
- [ ] In `app/api/stripe/checkout/route.ts`: già configurato `allowed_countries: ['IT']` ✅
- [ ] In `lib/checkout/actions.ts`: aggiungere validazione che `shipping_country === 'IT'`
- [ ] In `lib/validators/orders.ts`: aggiungere `.refine(val => val === 'IT', ...)` sul campo country
- [ ] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run`

---

## FASE L3 — Sicurezza e CSP
> Aggiorna Content Security Policy per includere domini di terze parti usati in produzione.

### L3.1 — Aggiornare CSP in middleware
- [ ] In `middleware.ts`, aggiornare `Content-Security-Policy`:
  - `connect-src`: aggiungere `https://api.stripe.com https://rs.fullstory.com`
  - `script-src`: aggiungere `https://js.stripe.com`
  - `frame-src`: aggiungere `https://js.stripe.com https://hooks.stripe.com`
  - `img-src`: aggiungere `https://*.stripe.com`
  - `style-src`: già ha `'unsafe-inline'` ✅
  - Esempio risultante:
    ```
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://api.stripe.com;
    frame-src https://js.stripe.com https://hooks.stripe.com;
    ```
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L3.2 — Rate limiting: aggiungere endpoint documento upload
- [ ] In `lib/utils/rate-limit.ts`: aggiungere preset `"media"` per upload documenti: 5 req / 60s
- [ ] **Verifica**: `npx tsc --noEmit`

---

## FASE L4 — Email transazionali
> Resend è già installato e configurato. Basta la API key e verificare i template.

### L4.1 — Aggiungere RESEND_API_KEY a .env.local.example
- [ ] In `.env.local.example`: aggiungere `RESEND_API_KEY=re_...`
- [ ] In `.env.local`: aggiungere `RESEND_API_KEY=` (vuoto per ora, verrà riempito dopo M3)
- [ ] **Verifica**: `npx tsc --noEmit`

### L4.2 — Verificare template email esistenti
- [ ] Leggere `lib/email/templates/order-confirmation.ts` e verificare che includa:
  - Numero ordine, riepilogo prodotti, totale, indirizzo
  - Se `requires_pickup === true`: aggiungere sezione "Ritiro in negozio" con indirizzo armeria e orari
- [ ] Leggere `lib/email/templates/booking-confirmation.ts`: verificare dati armeria (indirizzo, telefono)
- [ ] Leggere `lib/email/templates/welcome.ts`: verificare copy
- [ ] Aggiornare qualsiasi placeholder `"Via Roma 123"` → `"Via Oberdan 70, Brescia"` nei template
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L4.3 — Email di conferma ordine per ritiro in negozio
- [ ] In `lib/email/templates/order-confirmation.ts`:
  - Aggiungere sezione condizionale: se `order.requires_pickup`:
    ```html
    <div style="background:#7f1d1d;color:white;padding:16px;border-radius:8px;margin:16px 0">
      <strong>RITIRO IN NEGOZIO OBBLIGATORIO</strong><br>
      Porta con te il documento abilitativo (${order.pickup_document_type})<br>
      Armeria Palmetto - Via Oberdan 70, 25121 Brescia<br>
      Tel: [TELEFONO REALE]<br>
      Orari: Lun-Ven 9:00-13:00 / 15:00-19:00 | Sab 9:00-13:00
    </div>
    ```
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L4.4 — Newsletter: aggiungere endpoint unsubscribe
- [ ] Creare `app/api/newsletter/unsubscribe/route.ts`:
  - GET handler con `?token=` o `?email=`
  - Aggiorna `newsletters` table: `is_active = false`
  - Ritorna pagina HTML semplice "Ti sei disiscritto con successo"
  - Necessario per GDPR e per le best practice email
- [ ] Aggiornare `lib/email/templates/order-confirmation.ts` e altri template per aggiungere link unsubscribe in footer
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE L5 — Monitoring (Sentry)
> Il codice ha già commenti "replace with Sentry". Completare l'integrazione.

### L5.1 — Installare Sentry
- [ ] `npm install @sentry/nextjs`
- [ ] Creare `sentry.client.config.ts`:
  ```ts
  import * as Sentry from "@sentry/nextjs";
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    enabled: !!process.env.SENTRY_DSN,
  });
  ```
- [ ] Creare `sentry.server.config.ts` (stesso contenuto, solo per server)
- [ ] Creare `sentry.edge.config.ts` (stesso contenuto, solo per edge)
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L5.2 — Sostituire console.error con Sentry in error.tsx
- [ ] In `app/error.tsx`:
  ```ts
  // Sostituire:
  console.error("[GlobalError]", error.message, error.digest);
  // Con:
  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
  }
  ```
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### L5.3 — Aggiungere SENTRY_DSN a .env.local.example
- [ ] In `.env.local.example`: aggiungere `SENTRY_DSN=https://...@sentry.io/...`
- [ ] In `.env.local`: aggiungere `SENTRY_DSN=` (vuoto per ora)
- [ ] **Verifica**: `npx tsc --noEmit`

---

## FASE L6 — Deploy configuration
> Preparare tutti i file di configurazione per il deploy su Vercel.

### L6.1 — Creare vercel.json
- [ ] Creare `vercel.json` nella root del progetto:
  ```json
  {
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "regions": ["fra1"],
    "env": {
      "NEXT_PUBLIC_SITE_URL": "https://[IL-TUO-DOMINIO]"
    },
    "headers": [
      {
        "source": "/api/stripe/webhook",
        "headers": [
          { "key": "Cache-Control", "value": "no-store" }
        ]
      }
    ]
  }
  ```
- [ ] **Verifica**: file valido JSON

### L6.2 — Creare .env.production.example
- [ ] Creare `.env.production.example` con tutte le variabili necessarie in produzione:
  ```env
  # Supabase Cloud (NON il locale)
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...

  # Site
  NEXT_PUBLIC_SITE_URL=https://tuodominio.it

  # HMAC (generare con: openssl rand -base64 32)
  HMAC_SECRET=

  # Stripe LIVE
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...

  # Resend Email
  RESEND_API_KEY=re_...

  # Upstash Redis
  UPSTASH_REDIS_REST_URL=https://...
  UPSTASH_REDIS_REST_TOKEN=...

  # Sentry
  SENTRY_DSN=https://...@sentry.io/...
  ```
- [ ] Verificare che `.env.production.example` sia in `.gitignore` come `.env.production`
- [ ] **Verifica**: `.gitignore` contiene `.env*.local` e `.env.production`

### L6.3 — Script deploy Supabase
- [ ] Creare `scripts/deploy-migrations.sh`:
  ```bash
  #!/bin/bash
  # Applica le migrazioni a Supabase Cloud
  # Uso: ./scripts/deploy-migrations.sh postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
  set -e
  echo "Applying migrations to Supabase Cloud..."
  npx supabase db push --db-url "$1"
  echo "Done! Migration count:"
  npx supabase migration list
  ```
- [ ] **Verifica**: file eseguibile

### L6.4 — Aggiornare next.config.ts per produzione
- [ ] In `next.config.ts`: aggiungere configurazione per analytics e performance:
  ```ts
  const nextConfig: NextConfig = {
    images: {
      // ...existing patterns...
      formats: ['image/avif', 'image/webp'], // ottimizzazione immagini
    },
    // Compressione
    compress: true,
    // Power by header: rimuovi per sicurezza
    poweredByHeader: false,
  };
  ```
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE L7 — Verifica finale pre-deploy

### L7.1 — Build production completa
- [ ] `npx tsc --noEmit` → ZERO errori TypeScript
- [ ] `npm run build` → ZERO errori build
- [ ] `npm run test:run` → ZERO test falliti

### L7.2 — Checklist sicurezza
- [ ] Grep per chiavi hardcodate: `grep -r "sk_live\|sk_test\|eyJ" --include="*.ts" --include="*.tsx" lib/ app/ components/ | grep -v ".env"` → deve essere vuoto
- [ ] Grep per `console.log` (non `console.error`): `grep -rn "console\.log" --include="*.ts" --include="*.tsx" app/ lib/ components/` → deve essere vuoto (solo `console.error` nei try/catch è accettabile)
- [ ] Verificare che `SUPABASE_SERVICE_ROLE_KEY` sia usata SOLO in `lib/supabase/admin.ts` e file server-only

### L7.3 — Checklist dati placeholder
- [ ] Grep: `grep -rn "Via Roma 123\|info@myecommerce\|0123 456789\|My Ecommerce" --include="*.ts" --include="*.tsx" app/ components/ lib/` → deve essere vuoto
- [ ] Grep: `grep -rn "placehold\.co" --include="*.ts" --include="*.tsx" app/ components/` → deve essere vuoto (solo `next.config.ts` dove è nella whitelist è OK per dev)

### L7.4 — Commit finale
- [ ] `git add -A && git commit -m "feat: compliance normativa armi, contenuti reali, Sentry, Vercel config"`

---

## 📋 RIEPILOGO ACCOUNT NECESSARI (per te, non per Ralph)

| Account | URL | Cosa configurare dopo la creazione |
|---------|-----|------------------------------------|
| Supabase Cloud | app.supabase.com | Crea progetto → copia URL e chiavi → `npx supabase db push` |
| Stripe (⚠️ armeria) | stripe.com | KYC + contatta support "firearms dealer" → chiavi live |
| Resend | resend.com | Verifica dominio email → API key |
| Upstash | upstash.com | Crea database Redis → URL e token |
| Vercel | vercel.com | Import repo GitHub → aggiungi tutte le env vars → deploy |
| Sentry | sentry.io | Crea progetto Next.js → DSN |

**Una volta che hai TUTTI gli account**, dimmi e Ralph fa il deploy completo automaticamente.

---

## 🔴 BLOCCHI NON AUTOMATIZZABILI (da fare a mano)

1. **[MANUALE] Stripe KYC armeria**: contattare Stripe support, fornire licenza commerciale Prefettura
2. **[MANUALE] Corriere ADR per fuochi artificiali**: trovare e contrattualizzare un corriere specializzato (es. TNT Express, Fiege, o corrieri locali ADR) — necessario PRIMA di attivare le spedizioni di pirotecnici
3. **[MANUALE] Parere legale T&C**: far revisionare i termini e condizioni da un avvocato specializzato
4. **[MANUALE] Questura Brescia**: confrontarsi con la Questura per parere formale sull'attività online
5. **[MANUALE] Nomina DPO/responsabile trattamento dati**: documento interno GDPR
6. **[MANUALE] DNS**: configurare record A/CNAME sul registrar dopo il deploy su Vercel

---

*Generato il 02/03/2026 — basato su analisi del codice + parere legale Armeria Palmetto*
