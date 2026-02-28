# PRD FASE 2 — UI Components, Admin Panel, Storefront, Security, Tests

> **Run notturna #2**: Componenti UI, pagine admin CRUD, storefront pubblico, security hardening, test integrazione.
> **Prerequisiti**: Phase 1 completata e verificata. Build/TSC/Test tutti verdi.
> **Obiettivo**: Interfaccia admin funzionale + storefront navigabile. Design minimale ma usabile.

---

## Convenzioni (stesse della Fase 1)

- TypeScript `strict: true` — ZERO `any`, ZERO `@ts-ignore`
- ZERO `console.log` — usa `logger`
- Ogni componente React: props tipizzate, JSDoc
- Ogni form: validazione client-side con Zod + server action con validazione server-side
- Ogni pagina admin: requireAdmin() nel server component
- Gestione errori: try/catch, feedback utente chiaro, MAI stack traces
- Accessibilità base: label su ogni input, aria-label dove serve, focus management

---

## FASE 3 — UI Components (componenti riutilizzabili)

### Task 3.1 — Form components base
- [x] `components/ui/input.tsx`: Input con label, error message, forwarded ref, varianti (text, email, number, password, search). Props: label, error, description, required
- [x] `components/ui/textarea.tsx`: Textarea con label, error, character count opzionale
- [x] `components/ui/select.tsx`: Select nativo con label, error, options array
- [x] `components/ui/checkbox.tsx`: Checkbox con label
- [x] `components/ui/button.tsx`: Button con varianti (primary, secondary, danger, ghost), sizes (sm, md, lg), loading state con spinner, disabled
- [x] `components/ui/form-field.tsx`: Wrapper che compone label + input + error message
- [x] Tutti i componenti usano Tailwind, sono client components dove serve (onChange), hanno props tipizzate
- [x] **Verifica**: `npx tsc --noEmit && npm run build`
### Task 3.2 — Layout components
- [x] `components/layout/admin-sidebar.tsx`: Sidebar navigazione admin con link a: Dashboard, Prodotti, Categorie, Ordini, Prenotazioni, Blog, Pagine, Media, Impostazioni. Icone con Lucide React. Active state basato su pathname. Collapsibile su mobile
- [x] `components/layout/admin-header.tsx`: Header admin con breadcrumb, nome utente, logout button
- [x] `components/layout/admin-shell.tsx`: Layout completo admin = sidebar + header + main content area
- [x] `components/layout/storefront-header.tsx`: Header pubblico con logo, nav (Home, Catalogo, Blog, Prenotazioni, Contatti), cart icon con counter, login/account link
- [x] `components/layout/storefront-footer.tsx`: Footer con info contatto da site_settings, link utili, copyright
- [x] Aggiorna `app/(admin)/layout.tsx` per usare admin-shell con auth check
- [x] Aggiorna `app/(storefront)/layout.tsx` per usare storefront header+footer
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 3.3 — DataTable component
- [x] `components/ui/data-table.tsx`: Tabella riutilizzabile con: colonne configurabili (header, accessor, render function), sorting (client-side), paginazione (pagina corrente, per page, totale), selezione righe con checkbox, azioni per riga (dropdown menu), empty state, loading state (skeleton), responsive (scroll orizzontale su mobile)
- [x] Props tipizzate con generics: `DataTable<T>` dove T è il tipo dei dati
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 3.4 — Feedback components
- [x] `components/ui/toast.tsx`: Sistema toast notifications — success, error, warning, info. Auto-dismiss dopo 5s. Stack multipli. Posizione top-right. Context provider + hook useToast()
- [x] `components/ui/modal.tsx`: Modal/Dialog con overlay, close button, title, content, footer con actions. Trap focus, close su Escape, close su click overlay
- [x] `components/ui/confirm-dialog.tsx`: Dialog di conferma riutilizzabile — "Sei sicuro?" con azione e cancel. Variante danger per delete
- [x] `components/ui/alert.tsx`: Alert banner inline — success, error, warning, info
- [x] `components/ui/badge.tsx`: Badge per status (colori per: active/published=green, draft/pending=yellow, cancelled/inactive=red, ecc.)
- [x] `components/ui/skeleton.tsx`: Skeleton loader per cards, righe tabella, form fields
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 3.5 — Rich Text Editor
- [x] Installa `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`
- [x] `components/ui/rich-text-editor.tsx`: Editor WYSIWYG con toolbar (bold, italic, headings h2-h4, link, image, lists, blockquote, code). Output HTML. Props: value, onChange, placeholder. Sanitizza output con DOMPurify prima di salvare
- [x] `components/ui/rich-text-display.tsx`: Componente per renderizzare HTML sanitizzato (per blog posts, pagine, descrizioni prodotto)
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 3.6 — Media Picker
- [x] `components/ui/media-picker.tsx`: Modal per selezionare media dalla libreria. Griglia di thumbnail, ricerca per nome, filtro per folder, upload diretto. Ritorna URL del media selezionato. Props: onSelect(url), accept (image/*, application/pdf)
- [x] `components/ui/image-upload.tsx`: Drop zone per upload diretto. Preview, progress bar, validazione client-side (tipo, dimensione). Usa media server action
- [x] **Verifica**: `npx tsc --noEmit && npm run build`
---

## FASE 4 — Admin Pages (CRUD completo)

> Ogni pagina admin: server component con requireAdmin(), carica dati dal DAL, passa a client components per interattività.

### Task 4.1 — Dashboard admin
- [x] `app/(admin)/admin/page.tsx`: Dashboard con cards riassuntive: totale ordini (per status), totale prodotti attivi, prenotazioni oggi/settimana, ultime 5 orders, ultimi 5 audit log. Dati dal DAL, layout a griglia responsive
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.2 — Products CRUD
- [x] `app/(admin)/admin/products/page.tsx`: Lista prodotti con DataTable — colonne: immagine thumbnail, nome, SKU, prezzo, stock, status badge, azioni (edit, toggle active, delete). Paginazione server-side. Filtro per categoria, ricerca per nome/SKU
- [x] `app/(admin)/admin/products/new/page.tsx`: Form creazione prodotto. Tutti i campi dal Zod schema. Rich text editor per rich_description. Media picker per immagini. Slug auto-generato da nome (editabile). Preview prezzo formattato EUR
- [x] `app/(admin)/admin/products/[id]/edit/page.tsx`: Form modifica. Precarica dati dal DAL. Stessi campi del create. Sezione gestione immagini con drag-and-drop reorder (o almeno frecce su/giù)
- [x] `app/(admin)/admin/products/[id]/page.tsx`: Dettaglio prodotto read-only con tutte le info, storico ordini che includono questo prodotto
- [x] Tutti i form usano le server actions di Fase 1. Toast su success/error
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.3 — Categories CRUD
- [x] `app/(admin)/admin/categories/page.tsx`: Lista categorie con tree view (parent → children). Azioni: edit, delete, toggle active
- [x] `app/(admin)/admin/categories/new/page.tsx`: Form creazione — nome, slug, descrizione, parent_id select, immagine, sort_order
- [x] `app/(admin)/admin/categories/[id]/edit/page.tsx`: Form modifica
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.4 — Orders management
- [x] `app/(admin)/admin/orders/page.tsx`: Lista ordini con DataTable — order_number, cliente email, totale, status badge, data, azioni. Filtro per status. Ordinamento per data
- [x] `app/(admin)/admin/orders/[id]/page.tsx`: Dettaglio ordine — info cliente, indirizzo spedizione/fatturazione, items con prezzo, totali, storico status. Azioni: cambia status (dropdown con solo transizioni valide), aggiungi nota
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.5 — Bookings management
- [x] `app/(admin)/admin/bookings/page.tsx`: Lista prenotazioni con DataTable — data, ora, servizio, cliente, status badge, azioni
- [x] `app/(admin)/admin/bookings/[id]/page.tsx`: Dettaglio prenotazione con azioni (conferma, cancella, completa, no-show)
- [x] `app/(admin)/admin/bookings/services/page.tsx`: CRUD servizi prenotabili (nome, durata, prezzo, attivo)
- [x] `app/(admin)/admin/bookings/availability/page.tsx`: Gestione disponibilità settimanale — per ogni giorno della settimana: attivo/inattivo, orario inizio/fine
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.6 — Blog CRUD
- [x] `app/(admin)/admin/blog/page.tsx`: Lista post con DataTable — titolo, autore, status (published/draft), data pubblicazione, azioni
- [x] `app/(admin)/admin/blog/new/page.tsx`: Form creazione — titolo, slug auto, excerpt, rich_content con editor, cover image con media picker, tags (input con chip/tag), SEO fields, publish toggle
- [x] `app/(admin)/admin/blog/[id]/edit/page.tsx`: Form modifica
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.7 — Pages CRUD
- [x] `app/(admin)/admin/pages/page.tsx`: Lista pagine statiche
- [x] `app/(admin)/admin/pages/new/page.tsx`: Form creazione — titolo, slug, rich_content con editor, SEO fields, publish toggle
- [x] `app/(admin)/admin/pages/[id]/edit/page.tsx`: Form modifica
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.8 — Media library
- [x] `app/(admin)/admin/media/page.tsx`: Griglia media con thumbnail, nome, dimensione, data upload. Filtro per folder. Upload multiplo con drag-and-drop zone. Delete con confirm dialog. Click per copiare URL
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 4.9 — Site Settings
- [x] `app/(admin)/admin/settings/page.tsx`: Form con sezioni: Generale (nome sito, descrizione, email, telefono, indirizzo), Social (link social), Business (orari, valuta, aliquota IVA). Salva con server action, toast feedback
- [x] **Verifica**: `npx tsc --noEmit && npm run build`
---

## FASE 5 — Storefront (pagine pubbliche)

### Task 5.1 — Homepage
- [x] `app/(storefront)/page.tsx`: Homepage con: hero section (titolo, sottotitolo, CTA), prodotti in evidenza (is_featured, max 8, griglia), categorie principali con immagine, CTA prenotazioni. Dati dal DAL, tutto server-rendered
- [x] `components/storefront/product-card.tsx`: Card prodotto — immagine, nome, prezzo (con compare_at_price barrato se presente), badge "In evidenza", link a dettaglio
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 5.2 — Catalogo prodotti
- [x] `app/(storefront)/products/page.tsx`: Griglia prodotti con filtro categoria (sidebar o dropdown), ricerca, ordinamento (prezzo asc/desc, nome, recenti), paginazione. URL search params per filtri persistenti
- [x] `app/(storefront)/products/[slug]/page.tsx`: Dettaglio prodotto — galleria immagini, nome, prezzo, descrizione rich, varianti selezionabili, selettore quantità, bottone "Aggiungi al carrello", prodotti correlati. generateMetadata per SEO
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 5.3 — Carrello
- [x] `app/(storefront)/cart/page.tsx`: Pagina carrello — lista items con immagine, nome, prezzo, quantità modificabile, rimuovi, subtotale per riga. Totali: subtotale, IVA, spedizione, totale. Bottone "Procedi al checkout". Carrello vuoto: messaggio + link catalogo
- [x] `components/storefront/cart-icon.tsx`: Icona carrello nell'header con counter items. Client component che legge cart da cookie
- [x] `components/storefront/add-to-cart-button.tsx`: Bottone con loading state, feedback toast "Aggiunto al carrello"
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 5.4 — Checkout
- [x] `app/(storefront)/checkout/page.tsx`: Form checkout — sezione dati cliente (nome, email, telefono), indirizzo spedizione (via, città, CAP, provincia, paese), indirizzo fatturazione (checkbox "uguale a spedizione"), riepilogo ordine, note. Submit chiama createOrder server action
- [x] `app/(storefront)/checkout/success/page.tsx`: Pagina conferma ordine — "Grazie per il tuo ordine!", numero ordine, riepilogo, "Il pagamento verrà gestito separatamente" (Stripe non integrato)
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 5.5 — Blog pubblico
- [x] `app/(storefront)/blog/page.tsx`: Lista post pubblicati con cover image, titolo, excerpt, data, tags. Paginazione
- [x] `app/(storefront)/blog/[slug]/page.tsx`: Dettaglio post — cover image, titolo, data, autore, rich_content renderizzato, tags. generateMetadata per SEO
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 5.6 — Prenotazioni pubbliche
- [x] `app/(storefront)/bookings/page.tsx`: Lista servizi prenotabili con nome, descrizione, durata, prezzo. Selezione servizio → selettore data → slot disponibili calcolati dal DAL → form dati cliente → conferma
- [x] `components/storefront/booking-calendar.tsx`: Calendario selezione data (mese corrente + navigazione). Giorni con disponibilità evidenziati. Click su giorno → mostra slot orari disponibili
- [x] `components/storefront/booking-form.tsx`: Form prenotazione — nome, email, telefono, note. Submit chiama createBooking
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 5.7 — Pagine statiche + Account
- [x] `app/(storefront)/[slug]/page.tsx`: Pagina dinamica che carica da pages per slug. generateMetadata. 404 se non trovata
- [x] `app/(storefront)/account/page.tsx`: Area utente — profilo (nome, email, telefono, modifica), storico ordini, storico prenotazioni. Protetta da auth
- [x] `app/(storefront)/auth/login/page.tsx`: Form login (email + password), link a registrazione e reset password
- [x] `app/(storefront)/auth/register/page.tsx`: Form registrazione (nome, email, password, conferma password)
- [x] `app/(storefront)/auth/reset-password/page.tsx`: Form reset password (email)
- [x] **Verifica**: `npx tsc --noEmit && npm run build`
---

## FASE 6 — Security Hardening

### Task 6.1 — Input validation audit
- [x] Verifica OGNI server action: Zod validation è il PRIMO step dopo requireAdmin/requireAuth
- [x] Verifica OGNI form: validazione client-side con Zod prima del submit
- [x] Verifica rich_content: sanitizzato con DOMPurify PRIMA di salvare e PRIMA di renderizzare
- [x] Verifica slug generation: nessun carattere speciale, nessuna injection possibile
- [x] Se trovi violazioni, fixale. Documenta in SECURITY_AUDIT.md
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 6.2 — Security headers audit
- [x] Verifica middleware.ts: tutti gli headers security presenti (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection, Strict-Transport-Security, Content-Security-Policy)
- [x] CSP: restrittiva ma funzionale (script-src 'self', style-src 'self' 'unsafe-inline' per Tailwind, img-src 'self' + Supabase storage URL, connect-src 'self' + Supabase URL)
- [x] Verifica: nessuna pagina admin accessibile senza auth
- [x] Verifica: nessuna API route espone dati senza auth dove richiesto
- [x] Documenta in SECURITY_AUDIT.md
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### Task 6.3 — Error handling audit
- [x] Verifica: NESSUNA server action espone stack traces o messaggi interni
- [x] Verifica: app/error.tsx cattura errori e mostra messaggio generico
- [x] Verifica: OGNI form mostra errore utente-friendly, non errore tecnico
- [x] Verifica: 404 page funziona per route inesistenti
- [x] Documenta in SECURITY_AUDIT.md
- [x] **Verifica**: `npm run build`

---

## FASE 7 — Test di Integrazione

### Task 7.1 — Test e-commerce flow
- [ ] `__tests__/integration/ecommerce-flow.test.ts`: Test completo (con mock): browse prodotti → aggiungi al carrello → modifica quantità → checkout → ordine creato con status pending → verifica order_number generato → verifica stock decrementato
- [ ] **Verifica**: `npm run test:run`

### Task 7.2 — Test bookings flow
- [ ] `__tests__/integration/bookings-flow.test.ts`: Test (con mock): lista servizi → seleziona servizio → verifica slot disponibili → crea prenotazione → verifica slot non più disponibile → admin conferma → verifica status cambiato
- [ ] **Verifica**: `npm run test:run`

### Task 7.3 — Test content management flow
- [ ] `__tests__/integration/content-flow.test.ts`: Test (con mock): admin crea blog post draft → pubblica → visibile su storefront → admin crea pagina → pubblica → accessibile via slug
- [ ] **Verifica**: `npm run test:run`

### Task 7.4 — Build finale
- [ ] `npx tsc --noEmit` — ZERO errori
- [ ] `npx next lint` — ZERO errori
- [ ] `npm run build` — ZERO errori
- [ ] `npm run test:run` — ZERO fallimenti
- [ ] Crea SECURITY_AUDIT.md se non esiste (anche vuoto con header)
- [ ] **Verifica**: tutti e 4 i comandi passano

---

## Note per Ralph

### Se bloccato
Dopo 5 tentativi su un task: 1) Scrivi in BLOCKED.md 2) Segna [BLOCKED] 3) Passa avanti

### Ordine
FASE 3 → FASE 4 → FASE 5 → FASE 6 → FASE 7. Dentro ogni fase, ordine numerico. Non saltare.

### Validazione OGNI task
1. `npx tsc --noEmit` senza errori
2. `npm run build` senza errori
3. `npm run test:run` senza fallimenti (se il task include test)
4. Spunta `- [x]`
5. Committa: `feat(faseX): taskY.Z - descrizione`

### Dipendenze extra permesse
- `@tiptap/*` per rich text editor (Task 3.5)
- `lucide-react` per icone (se non già presente)
- `date-fns` (già presente)
- NON installare altre dipendenze senza documentare il motivo in DEPENDENCIES_ADDED.md

### NON fare
- NON usare `any`
- NON lasciare console.log (usa logger)
- NON creare pagine admin senza requireAdmin()
- NON renderizzare HTML senza sanitizzazione DOMPurify
- NON committare segreti
- NON installare component library complete (shadcn, MUI, ecc.) — usa componenti custom con Tailwind