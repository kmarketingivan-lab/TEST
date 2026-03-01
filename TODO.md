# TODO — Theme Palmetto (Rosso/Oro/Nero)

> Applicare la palette colori e lo stile visivo di palmetto.it al progetto.
> Palette: Rosso #C62828 (primary), Oro #D4A017 (accent), Nero #1A1A1A (dark), Bianco #FFFFFF, Grigio #F5F5F5 (bg sections)
> Stile: pulito, diretto, headings bold grandi, sezioni full-width, CTA arrotondati rossi
> NON toccare logica, server actions, DAL, validators, test. SOLO file UI/CSS.

---

## Convenzioni

- ZERO `any`, ZERO `console.log`, ZERO `@ts-ignore`
- Modificare SOLO classi Tailwind e testi placeholder — MAI la logica dei componenti
- Ogni modifica deve passare `npx tsc --noEmit && npm run build`
- Colori da usare (classi Tailwind):
  - Primary (rosso): `bg-red-700` / `text-red-700` / `hover:bg-red-800` / `border-red-700`
  - Accent (oro): `bg-yellow-600` / `text-yellow-600` / `hover:bg-yellow-700`
  - Dark (nero): `bg-neutral-900` / `text-neutral-900`
  - Light bg: `bg-neutral-50` / `bg-neutral-100`
  - Text: `text-neutral-900` (body), `text-neutral-600` (secondary), `text-white` (su dark)

---

## FASE T1 — CSS base + globals

### Task T1.1 — globals.css e font
- [x] Modifica `app/globals.css`: aggiungi dopo `@import "tailwindcss";` un blocco `@layer base` con: `body { @apply bg-white text-neutral-900 antialiased; }`, `h1, h2, h3 { @apply font-bold; }`
- [x] Modifica `app/layout.tsx`: aggiungi Google Font "Inter" (o Montserrat) via next/font/google, applica al body
- [x] **Verifica**: `npx tsc --noEmit && npm run build`
---

## FASE T2 — Componenti UI base (colori)

### Task T2.1 — Button component
- [x] `components/ui/button.tsx`: cambia `variantClasses`:
  - primary: `bg-red-700 text-white hover:bg-red-800 focus:ring-red-500 disabled:bg-red-300`
  - secondary: `bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500 disabled:bg-neutral-100`
  - danger: lascia invariato (già rosso)
  - ghost: `bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 disabled:text-neutral-400`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T2.2 — Badge component
- [x] `components/ui/badge.tsx`: cambia `variantClasses`:
  - info: `bg-red-100 text-red-800` (era blue)
  - Resto invariato (success=green, warning=yellow, error=red, default=gray)
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T2.3 — Input, Select, Textarea, Checkbox focus ring
- [x] In `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/textarea.tsx`: cambia ogni `focus:ring-blue-*` / `focus:border-blue-*` in `focus:ring-red-500` / `focus:border-red-700`
- [x] In `components/ui/checkbox.tsx`: cambia accent/check color da blue a `accent-red-700` o `text-red-700`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T2.4 — Toast e Alert
- [x] `components/ui/toast.tsx`: cambia variante info da `bg-blue-*` a `bg-red-50 border-red-500 text-red-800`
- [x] `components/ui/alert.tsx`: cambia variante info da `bg-blue-*` / `text-blue-*` a `bg-red-50` / `text-red-800` / `border-red-300`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T2.5 — Modal e Confirm Dialog
- [x] `components/ui/modal.tsx`: se ci sono accenti blue, cambiali in red-700
- [x] `components/ui/confirm-dialog.tsx`: il bottone conferma danger è già rosso, OK. Se c'è un bottone primary blue cambialo in red-700
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T2.6 — DataTable
- [x] `components/ui/data-table.tsx`: cambia ogni `text-blue-*` / `bg-blue-*` in equivalente `text-red-700` / `bg-red-50` (header active, pagination active, checkbox, link sorting)
- [x] **Verifica**: `npx tsc --noEmit && npm run build`
---

## FASE T3 — Layout Storefront

### Task T3.1 — Storefront Header
- [ ] `components/layout/storefront-header.tsx`:
  - Sfondo header: da `bg-white border-b border-gray-200` a `bg-neutral-900 border-b border-neutral-800`
  - Logo "My Ecommerce": da `text-gray-900` a `text-white font-bold text-2xl`
  - Nav links desktop: da `text-gray-600 hover:text-gray-900` a `text-neutral-300 hover:text-white`
  - Nav link attivo: da `text-blue-600` a `text-red-500 font-semibold`
  - Cart icon: da `text-gray-600 hover:text-gray-900` a `text-neutral-300 hover:text-white`
  - Cart counter badge: da `bg-blue-600` a `bg-red-600`
  - Account link: da `text-gray-600` a `text-neutral-300 hover:text-white`
  - Mobile menu button: da `text-gray-600 hover:text-gray-900` a `text-neutral-300 hover:text-white`
  - Mobile nav panel: da `bg-white border-t border-gray-200` a `bg-neutral-900 border-t border-neutral-800`
  - Mobile nav links: da `text-gray-600 hover:bg-gray-50` a `text-neutral-300 hover:bg-neutral-800`
  - Mobile nav link attivo: da `bg-blue-50 text-blue-600` a `bg-red-900/30 text-red-400`
  - Header sticky: mantieni `sticky top-0 z-30`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T3.2 — Storefront Footer
- [ ] `components/layout/storefront-footer.tsx`:
  - Sfondo footer: da `bg-gray-50 border-t border-gray-200` a `bg-neutral-900 border-t border-neutral-800`
  - Titoli sezioni (h3): da `text-gray-900` a `text-yellow-500 font-semibold uppercase text-xs tracking-wider`
  - Testi info: da `text-gray-600` a `text-neutral-400`
  - Link: da `text-gray-600 hover:text-gray-900` a `text-neutral-400 hover:text-white`
  - Copyright: da `text-gray-500 border-t border-gray-200` a `text-neutral-500 border-t border-neutral-800`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`
---

## FASE T4 — Homepage + Pagine Storefront

### Task T4.1 — Homepage
- [ ] `app/(storefront)/page.tsx`:
  - Hero section: da `bg-gradient-to-br from-blue-600 to-blue-800` a `bg-neutral-900`
  - Hero title: da `text-4xl` a `text-4xl sm:text-5xl lg:text-6xl font-bold text-red-600` (rosso su nero, come Palmetto)
  - Hero subtitle: da `text-blue-100` a `text-neutral-300`
  - CTA "Sfoglia il catalogo": da `bg-white text-blue-700 hover:bg-blue-50` a `bg-red-700 text-white hover:bg-red-800 rounded-full px-8 py-3 font-semibold`
  - CTA "Prenota un appuntamento": da `border-2 border-white hover:bg-white/10` a `border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 rounded-full px-8 py-3`
  - Sezione "Prodotti in evidenza" h2: da `text-gray-900` a `text-red-700 text-3xl uppercase`
  - Link "Vedi tutti": da `text-blue-600 hover:text-blue-700` a `text-red-600 hover:text-red-700 font-semibold`
  - Sezione categorie bg: da `bg-gray-50` a `bg-neutral-50`
  - Sezione categorie h2: da `text-gray-900` a `text-red-700 text-3xl uppercase`
  - Category card: da `border-gray-200 hover:shadow-md` a `border-neutral-200 hover:shadow-lg hover:border-red-300`
  - Category icon fallback: da `bg-blue-100 text-blue-600` a `bg-red-100 text-red-600`
  - Category name hover: da `group-hover:text-blue-600` a `group-hover:text-red-600`
  - Sezione Prenotazioni CTA: da `bg-gradient-to-r from-emerald-500 to-teal-600` a `bg-yellow-600`
  - Prenotazioni CTA title: `text-white text-2xl sm:text-3xl font-bold`
  - Prenotazioni CTA subtitle: da `text-emerald-100` a `text-yellow-100`
  - Prenotazioni CTA button: da `bg-white text-emerald-700 hover:bg-emerald-50` a `bg-neutral-900 text-white hover:bg-neutral-800 rounded-full`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T4.2 — Product Card
- [ ] `components/storefront/product-card.tsx`:
  - Card border: da `border-gray-200` a `border-neutral-200`
  - Badge "In evidenza": da `bg-amber-500` a `bg-yellow-600`
  - Badge "Offerta": `bg-red-600` (già ok)
  - Product name hover: da `group-hover:text-blue-600` a `group-hover:text-red-600`
  - Price: `text-red-700 font-bold` (come Palmetto mostra i prezzi in rosso/oro)
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T4.3 — Catalog page
- [ ] `app/(storefront)/products/page.tsx`: cambia ogni `text-blue-*` / `bg-blue-*` in `text-red-700` / `bg-red-50`. Titolo pagina `text-red-700 uppercase`. Link attivi filtri: `text-red-700 font-semibold`
- [ ] `app/(storefront)/products/[slug]/page.tsx`: stesso trattamento. Bottone "Aggiungi al carrello": `bg-red-700 hover:bg-red-800 text-white rounded-full`. Prezzo: `text-red-700`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T4.4 — Cart + Checkout
- [ ] `app/(storefront)/cart/page.tsx` e `app/(storefront)/cart/cart-items.tsx`: cambia accenti blue→red. Bottone "Procedi al checkout": `bg-red-700 hover:bg-red-800 text-white rounded-full`
- [ ] `components/storefront/add-to-cart-button.tsx`: `bg-red-700 hover:bg-red-800 text-white`
- [ ] `components/storefront/cart-icon.tsx`: counter badge da `bg-blue-600` a `bg-red-600`
- [ ] `app/(storefront)/checkout/checkout-form.tsx`: accenti blue→red su focus ring e submit button
- [ ] `app/(storefront)/checkout/success/page.tsx`: accenti blue→red
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T4.5 — Blog pages
- [ ] `app/(storefront)/blog/page.tsx`: titoli `text-red-700 uppercase`, link "leggi" `text-red-600 hover:text-red-700`
- [ ] `app/(storefront)/blog/[slug]/page.tsx`: titolo `text-neutral-900`, tag badges `bg-red-100 text-red-700`, link `text-red-600`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T4.6 — Bookings pages
- [ ] `app/(storefront)/bookings/page.tsx`: titolo `text-red-700 uppercase`, card servizi accenti red
- [ ] `components/storefront/booking-calendar.tsx`: giorno selezionato `bg-red-700 text-white`, giorno disponibile `text-red-600`, hover `bg-red-50`
- [ ] `components/storefront/booking-form.tsx`: submit button `bg-red-700`
- [ ] `components/storefront/booking-wizard.tsx`: step attivo `text-red-700 border-red-700`, accenti blue→red
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T4.7 — Auth pages + Account
- [ ] `app/(storefront)/auth/login/login-form.tsx`: submit `bg-red-700`, link `text-red-600`
- [ ] `app/(storefront)/auth/register/register-form.tsx`: stesso
- [ ] `app/(storefront)/auth/reset-password/reset-password-form.tsx`: stesso
- [ ] `app/(storefront)/account/page.tsx`: accenti blue→red
- [ ] `app/(storefront)/[slug]/page.tsx`: se ci sono accenti blue, cambia in red
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`
---

## FASE T5 — Admin Panel (accenti)

### Task T5.1 — Admin Sidebar
- [ ] `components/layout/admin-sidebar.tsx`:
  - Desktop sidebar bg: lascia `bg-white` con `border-r border-neutral-200`
  - Titolo "Admin": `text-neutral-900 font-bold`
  - Nav link attivo: da `bg-blue-50 text-blue-700` a `bg-red-50 text-red-700`
  - Nav link hover: da `hover:bg-gray-100` a `hover:bg-neutral-100`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T5.2 — Admin Header
- [ ] `components/layout/admin-header.tsx`: se ci sono accenti blue, cambia in red-700. Breadcrumb link attivo: `text-red-700`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T5.3 — Admin Dashboard
- [ ] `app/(admin)/admin/page.tsx`: stat cards accenti da blue a red-700. Se ci sono gradient blue, cambiali in `bg-red-700` solido
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T5.4 — Admin CRUD pages (batch)
- [ ] In TUTTI i file sotto `app/(admin)/admin/*/`: cerca e sostituisci globalmente:
  - `text-blue-600` → `text-red-700`
  - `text-blue-700` → `text-red-700`
  - `bg-blue-600` → `bg-red-700`
  - `bg-blue-700` → `bg-red-700`
  - `bg-blue-50` → `bg-red-50`
  - `bg-blue-100` → `bg-red-100`
  - `hover:text-blue-600` → `hover:text-red-700`
  - `hover:text-blue-700` → `hover:text-red-700`
  - `hover:bg-blue-700` → `hover:bg-red-800`
  - `hover:bg-blue-600` → `hover:bg-red-700`
  - `hover:bg-blue-50` → `hover:bg-red-50`
  - `focus:ring-blue-500` → `focus:ring-red-500`
  - `border-blue-600` → `border-red-700`
  - `border-blue-500` → `border-red-500`
  - NON toccare `bg-red-600` / `text-red-600` che sono già per danger/error — quelli restano
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T5.5 — Rich Text Editor
- [ ] `components/ui/rich-text-editor.tsx`: toolbar accenti da blue a red (bottone attivo `bg-red-100 text-red-700`)
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T5.6 — Media Picker + Image Upload
- [ ] `components/ui/media-picker.tsx`: accenti blue→red
- [ ] `components/ui/image-upload.tsx`: drop zone border active da `border-blue-*` a `border-red-500`, testo da `text-blue-*` a `text-red-600`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

---

## FASE T6 — Error/Not Found pages + Verifica finale

### Task T6.1 — Error e 404
- [ ] `app/error.tsx`: se ci sono accenti blue, cambia in red
- [ ] `app/not-found.tsx`: link "Torna alla home" in `text-red-600 hover:text-red-700`. Titolo grande
- [ ] `app/(admin)/admin/login/page.tsx`: form login accenti red, bottone `bg-red-700`
- [ ] **Verifica**: `npx tsc --noEmit && npm run build`

### Task T6.2 — Grep finale blue residui
- [ ] Esegui: `Get-ChildItem -Recurse -Include *.tsx,*.css | Where-Object { $_.FullName -notmatch "node_modules|\.next|\.git" } | Select-String "blue-" | Select-Object Filename, LineNumber, Line`
- [ ] Se ci sono residui blue nei file UI (non test, non lib/), fixali
- [ ] I file in `__tests__/`, `lib/dal/`, `lib/auth/`, `lib/cart/`, `lib/checkout/`, `lib/validators/`, `lib/utils/`, `lib/supabase/`, `types/` NON vanno toccati
- [ ] **Verifica**: `npx tsc --noEmit && npm run build && npm run test:run` — TUTTO verde

### Task T6.3 — Build finale
- [ ] `npx tsc --noEmit` — ZERO errori
- [ ] `npm run build` — ZERO errori
- [ ] `npm run test:run` — ZERO fallimenti (178 test)
- [ ] Committa: `feat: apply Palmetto theme — red/gold/black palette`
- [ ] **Verifica**: tutti i comandi passano

---

## Note per Ralph

### Se bloccato
Dopo 5 tentativi: BLOCKED.md, segna [BLOCKED], vai avanti.

### Ordine
FASE T1 → T2 → T3 → T4 → T5 → T6. Dentro ogni fase, ordine numerico.

### REGOLE CRITICHE
- NON modificare file in `lib/`, `types/`, `__tests__/`, `supabase/`, `middleware.ts`
- NON modificare logica dei componenti — SOLO classi Tailwind e testi
- NON aggiungere dipendenze
- Se un file ha già classi red (per errore/danger), NON cambiarle — sono intenzionali
- Ogni task deve passare `npx tsc --noEmit && npm run build`