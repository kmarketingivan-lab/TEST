# PRD FASE 1 — Infrastruttura, Database, Data Access Layer

> **Run notturna #1**: Setup progetto, schema DB completo con RLS, Zod schemas, DAL, Server Actions, Cart logic, Auth.
> **Stack**: Next.js 14 (App Router) + Supabase + TypeScript strict
> **Obiettivo**: Base solida e verificabile. ZERO UI, ZERO pagine. Solo backend e logica.

---

## Architettura

```
/app
  /(storefront)/layout.tsx   → Layout placeholder (solo shell vuota)
  /(admin)/layout.tsx        → Layout placeholder (solo shell vuota)
  /api                       → Route handlers (vuoti per ora)
/lib
  /supabase                  → Client, types, helpers
  /validators                → Zod schemas (uno per tabella)
  /dal                       → Data Access Layer (query functions)
  /auth                      → Auth helpers + actions
  /cart                      → Cart logic server-side
  /utils                     → Helpers puri (slugify, sanitize, audit log)
/types                       → TypeScript types globali
/middleware.ts               → Auth + security middleware
/supabase
  /migrations                → SQL migrations numerate
  /seed.sql                  → Dati di test
/__tests__
  /validators                → Test per ogni Zod schema
  /dal                       → Test per DAL (con mock Supabase)
  /cart                      → Test cart logic
  /auth                      → Test auth helpers
```
### Convenzioni obbligatorie

- TypeScript `strict: true` — ZERO `any`, ZERO `@ts-ignore`
- Ogni funzione pubblica ha JSDoc con @param e @returns
- Ogni tabella DB ha: migration SQL, RLS policies, Zod schema, TypeScript type
- Tutti gli input validati server-side con Zod PRIMA di toccare il DB
- Server actions: `"use server"` → Zod validation → auth check → operazione → audit log → revalidate
- Nessun `console.log` — usa un helper `logger` strutturato
- Error handling: OGNI server action wrappata in try/catch, errori tipizzati, MAI esporre stack traces

### Regole di sicurezza

- RLS attiva su OGNI tabella, NESSUNA eccezione
- Admin check su OGNI server action admin (non fidarsi solo del middleware)
- Service role client SOLO in `lib/supabase/admin.ts`, MAI importato in file client
- Input validation doppia: Zod schema + constraint SQL (belt and suspenders)
- File upload: whitelist MIME, max size, filename sanitization con nanoid
- Cart: cookie firmato HMAC, prezzi SEMPRE riletti dal DB al checkout
- Auth: rate limiting su login, token solo httpOnly cookies

---

## FASE 0 — Setup Progetto

### Task 0.1 — Init Next.js + TypeScript strict
- [x] `npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir=false`
- [x] `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- [x] ESLint: `@typescript-eslint/no-explicit-any: error`, `@typescript-eslint/no-unused-vars: error`
- [x] `.env.local.example` con: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, HMAC_SECRET
- [x] `.gitignore` include `.env.local`
- [x] **Verifica**: `npx tsc --noEmit && npx next lint` — zero errori
### Task 0.2 — Supabase clients
- [x] `npm install @supabase/supabase-js @supabase/ssr`
- [x] `lib/supabase/client.ts`: Browser client con ANON key, RLS attiva, tipizzato con Database
- [x] `lib/supabase/server.ts`: Server client che legge cookies, RLS attiva, tipizzato
- [x] `lib/supabase/admin.ts`: Service role client — BYPASSA RLS — SOLO server-side, MAI esposto. Commento ⚠️ in testa al file
- [x] `lib/supabase/middleware.ts`: helper per refresh session nel middleware
- [x] `types/database.ts`: tipo Database placeholder (verrà popolato con le tabelle)
- [x] **Verifica**: `npx tsc --noEmit` — zero errori

### Task 0.3 — Dipendenze
- [x] Runtime: `zod`, `isomorphic-dompurify`, `date-fns`, `slugify`, `nanoid`
- [x] Dev: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
- [x] `vitest.config.ts` con path aliases che matchano tsconfig
- [x] Scripts npm: `"test": "vitest"`, `"test:run": "vitest run"`, `"test:coverage": "vitest run --coverage"`
- [x] **Verifica**: `npm run test:run` — esegue, 0 test, 0 errori

### Task 0.4 — Utilities condivise
- [x] `lib/utils/logger.ts`: Logger strutturato — NO console.log nel codebase. Metodi: info, error, warn
- [x] `lib/utils/slugify.ts`: wrapper di slugify con opzioni italiane (rimuovi accenti)
- [x] `lib/utils/sanitize.ts`: wrapper DOMPurify per sanitizzare rich HTML
- [x] `lib/utils/errors.ts`: classi AppError, ValidationError, AuthError, NotFoundError con code, message, status
- [x] `lib/utils/audit.ts`: funzione `logAuditEvent(userId, action, entityType, entityId, oldValues?, newValues?)` che scrive in audit_log via admin client
- [x] Test per slugify e sanitize
- [x] **Verifica**: `npx tsc --noEmit && npm run test:run` — zero errori

### Task 0.5 — Middleware sicurezza
- [x] `middleware.ts` nella root con: refresh sessione Supabase, security headers (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy, X-XSS-Protection, Strict-Transport-Security), protezione /admin/* con verifica auth + ruolo admin, CSP header
- [x] `config.matcher` che esclude _next/static, _next/image, favicon.ico
- [x] **Verifica**: `npx tsc --noEmit` — zero errori

### Task 0.6 — Layout shells (placeholder vuoti)
- [ ] `app/layout.tsx` — root layout con html lang="it"
- [ ] `app/error.tsx` — error boundary globale
- [ ] `app/not-found.tsx` — 404 page
- [ ] `app/(storefront)/layout.tsx` — shell vuota con `{children}`
- [ ] `app/(admin)/layout.tsx` — shell vuota con `{children}`
- [ ] `app/(admin)/admin/login/page.tsx` — placeholder
- [ ] `app/(storefront)/page.tsx` — placeholder
- [ ] **Verifica**: `npm run build` — zero errori
---

## FASE 1 — Database Schema + RLS + Zod + Types

> Per ogni task: 1) Migration SQL in `supabase/migrations/XXXX_nome.sql` 2) RLS policies nella stessa migration 3) Zod schema in `lib/validators/` 4) Types in `types/database.ts` 5) Test Zod in `__tests__/validators/`

### Task 1.1 — profiles
- [ ] Migration `supabase/migrations/0001_profiles.sql`: tabella profiles (id UUID PK ref auth.users CASCADE, role TEXT CHECK admin/customer DEFAULT customer, full_name, phone, avatar_url, timestamps). RLS: users leggono solo proprio profilo, admin legge tutti, users aggiornano solo proprio profilo MA NON il campo role (WITH CHECK), trigger on_auth_user_created che crea profilo automaticamente (SECURITY DEFINER)
- [ ] `lib/validators/profile.ts`: Zod schema — role enum, full_name min 2 chars, phone opzionale regex
- [ ] Types in `types/database.ts`
- [ ] `__tests__/validators/profile.test.ts`: validi passano, invalidi (role: "superadmin", name: "", phone: "abc") falliscono
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.2 — categories
- [ ] Migration `supabase/migrations/0002_categories.sql`: tabella (id UUID, name, slug UNIQUE, description, image_url, parent_id self-ref, sort_order, is_active, timestamps). Indici su slug e parent_id. RLS: SELECT pubblico (is_active=true), INSERT/UPDATE/DELETE solo admin
- [ ] `lib/validators/categories.ts`: name min 2, slug regex `^[a-z0-9-]+$`
- [ ] Types, test Zod
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.3 — products
- [ ] Migration `supabase/migrations/0003_products.sql`: tabella (id, name, slug UNIQUE, description, rich_description, price NUMERIC(10,2) CHECK>=0, compare_at_price, cost_price, sku UNIQUE, barcode, stock_quantity CHECK>=0, low_stock_threshold, weight_grams, category_id FK, is_active, is_featured, seo_title, seo_description, timestamps). Indici: slug, category_id, is_active, (is_featured+is_active). RLS: SELECT pubblico (is_active=true), resto admin
- [ ] `lib/validators/products.ts`: price positivo, slug regex, name min 2, stock integer non negativo
- [ ] Types, test Zod con edge: price=0 (valido), price=-1 (invalido), slug con spazi (invalido)
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.4 — product_images
- [ ] Migration `supabase/migrations/0004_product_images.sql`: tabella (id, product_id FK CASCADE, url, alt_text, sort_order, is_primary, created_at). Indice su product_id. RLS: SELECT pubblico, INSERT/UPDATE/DELETE admin
- [ ] Zod schema, types, test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.5 — product_variants
- [ ] Migration `supabase/migrations/0005_product_variants.sql`: tabella (id, product_id FK CASCADE, name, sku UNIQUE, price_adjustment NUMERIC DEFAULT 0, stock_quantity CHECK>=0, attributes JSONB DEFAULT '{}', is_active, created_at). Indice product_id. RLS: SELECT pubblico (prodotto attivo), resto admin
- [ ] Zod schema con validazione JSONB attributes (record di string)
- [ ] Types, test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.6 — orders + order_items
- [ ] Migration `supabase/migrations/0006_orders.sql`: tabella orders (id, order_number UNIQUE, user_id FK nullable, email, status CHECK IN pending/confirmed/processing/shipped/delivered/cancelled/refunded, subtotal/tax/shipping/discount/total NUMERIC CHECK>=0, shipping_address JSONB, billing_address JSONB, notes, stripe_payment_intent_id, timestamps). Tabella order_items (id, order_id FK CASCADE, product_id FK SET NULL, variant_id FK SET NULL, product_name, variant_name, quantity CHECK>0, unit_price CHECK>=0, total_price CHECK>=0, created_at). Indici: orders(user_id, status, order_number), order_items(order_id). RLS: users vedono solo propri ordini, admin vede tutti. Funzione SQL generate_order_number() formato ORD-YYYY-NNNNNN
- [ ] `lib/validators/orders.ts`: Zod per ordine, items, address JSONB (street, city, zip, country required)
- [ ] Test: status invalido, quantity 0, address incompleto
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`
### Task 1.7 — pages
- [ ] Migration `supabase/migrations/0007_pages.sql`: tabella (id, title, slug UNIQUE, content, rich_content, seo_title, seo_description, is_published, published_at, timestamps). Indice slug. RLS: SELECT pubblico (is_published=true), resto admin
- [ ] Zod, types, test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.8 — blog_posts
- [ ] Migration `supabase/migrations/0008_blog_posts.sql`: tabella (id, title, slug UNIQUE, excerpt, content, rich_content, cover_image_url, author_id FK SET NULL, is_published, published_at, seo_title, seo_description, tags TEXT[], timestamps). Indici: slug, (is_published+published_at DESC), tags GIN. RLS: SELECT pubblico (is_published=true), resto admin
- [ ] Zod — tags array di stringhe, slug regex
- [ ] Types, test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.9 — bookings (services + availability + bookings)
- [ ] Migration `supabase/migrations/0009_bookings.sql`: tabella booking_services (id, name, description, duration_minutes CHECK>0, price CHECK>=0, is_active, sort_order, created_at). Tabella booking_availability (id, day_of_week CHECK 0-6, start_time TIME, end_time TIME, is_active, CHECK end>start). Tabella bookings (id, user_id FK nullable, service_id FK RESTRICT, customer_name, customer_email, customer_phone, booking_date DATE, start_time TIME, end_time TIME, status CHECK IN pending/confirmed/cancelled/completed/no_show, notes, timestamps, CHECK end>start). Indici: bookings(booking_date+start_time, user_id, status). RLS: servizi/disponibilità SELECT pubblico, bookings SELECT proprio utente+admin, INSERT pubblico, UPDATE/DELETE admin. Funzione SQL check_booking_conflict(p_date, p_start, p_end) ritorna boolean
- [ ] Zod schemas per tutti e tre
- [ ] Test Zod
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.10 — site_settings
- [ ] Migration `supabase/migrations/0010_site_settings.sql`: tabella (key TEXT PK, value JSONB, updated_at). RLS: SELECT pubblico, UPDATE/INSERT admin, DELETE nessuno. Seed: site_name, site_description, contact_email, contact_phone, address, social_links, business_hours, currency (EUR), tax_rate (22)
- [ ] Zod schemas per ogni tipo di setting
- [ ] Types, test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.11 — media
- [ ] Migration `supabase/migrations/0011_media.sql`: tabella (id, filename, original_filename, mime_type, size_bytes, url, alt_text, folder DEFAULT 'general', uploaded_by FK SET NULL, created_at). Indice folder. RLS: SELECT pubblico, INSERT/DELETE admin
- [ ] Zod con whitelist MIME: image/jpeg, image/png, image/webp, image/svg+xml, application/pdf. Max 5MB immagini, 20MB PDF
- [ ] Types, test (includi MIME invalido, size over limit)
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 1.12 — audit_log
- [ ] Migration `supabase/migrations/0012_audit_log.sql`: tabella (id, user_id FK SET NULL, action, entity_type, entity_id, old_values JSONB, new_values JSONB, ip_address, user_agent, created_at). Indici: user_id, (entity_type+entity_id), created_at DESC. RLS: SELECT solo admin, INSERT solo via service role, NO UPDATE, NO DELETE
- [ ] Types (no Zod — non riceve input utente)
- [ ] **Verifica**: `npx tsc --noEmit`

### Task 1.13 — Types Database completo
- [ ] Aggiorna `types/database.ts` con TUTTE le tabelle: tipo Database con public.Tables per ogni tabella (Row, Insert, Update). Esporta tipi: Product, Category, Order, OrderItem, BlogPost, Page, Booking, BookingService, Media, Profile, SiteSetting, AuditLog
- [ ] **Verifica**: `npx tsc --noEmit` — ZERO errori, ogni tipo usato nei validators senza cast
---

## FASE 2 — Data Access Layer + Server Actions + Cart + Auth

### Task 2.1 — DAL Products
- [ ] `lib/dal/products.ts`: getProducts({page, perPage, categoryId, search, sortBy, isActive}) → {data, count}, getProductBySlug(slug) → Product con images e variants, getProductById(id), getFeaturedProducts(limit), getRelatedProducts(productId, categoryId, limit), searchProducts(query, limit). OGNI funzione: server client (RLS attiva), return type esplicito, JSDoc
- [ ] `__tests__/dal/products.test.ts`: mock supabase, testa che le query siano costruite correttamente
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.2 — Server Actions Products (Admin)
- [ ] `app/(admin)/admin/products/actions.ts` con `"use server"`: createProduct(formData) con requireAdmin+Zod+slug generation+audit log+revalidatePath, updateProduct(id, formData) con diff audit, deleteProduct(id) soft delete, toggleProductActive(id), updateProductStock(id, quantity), reorderProductImages(productId, imageIds[])
- [ ] OGNI action: requireAdmin(), Zod PRIMO step, try/catch, audit log, return {success} o {error: string}
- [ ] `__tests__/actions/products.test.ts`: mock auth+supabase, testa happy path + validation error + auth error
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.3 — DAL + Actions Categories
- [ ] `lib/dal/categories.ts`: getCategories(), getCategoryBySlug(), getCategoryTree() (parent/children)
- [ ] `app/(admin)/admin/categories/actions.ts`: createCategory(), updateCategory(), deleteCategory(), reorderCategories(ids[])
- [ ] Test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.4 — DAL + Actions Orders
- [ ] `lib/dal/orders.ts`: getOrders(filters), getOrderById(), getOrdersByUser(userId), getOrderStats() (count per status)
- [ ] `app/(admin)/admin/orders/actions.ts`: updateOrderStatus(id, newStatus), cancelOrder(id), addOrderNote(id, note)
- [ ] Validazione transizioni: pending→confirmed/cancelled, confirmed→processing/cancelled, processing→shipped/cancelled, shipped→delivered, delivered→refunded. Nessuna altra transizione permessa
- [ ] Test: transizioni valide passano, invalide (delivered→pending) falliscono
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.5 — DAL + Actions Pages
- [ ] `lib/dal/pages.ts`: getPages(), getPageBySlug(), getPublishedPages()
- [ ] Actions: createPage(), updatePage(), deletePage(), togglePublished(). Sanitizzazione rich_content con DOMPurify
- [ ] Test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.6 — DAL + Actions Blog
- [ ] `lib/dal/blog.ts`: getPosts(filters), getPostBySlug(), getPublishedPosts({page, perPage}), getPostsByTag(tag)
- [ ] Actions: createPost(), updatePost(), deletePost(), togglePublished(). Sanitizzazione rich_content, auto-excerpt (primi 160 chars)
- [ ] Test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.7 — DAL + Actions Bookings
- [ ] `lib/dal/bookings.ts`: getBookings(filters), getBookingById(id), getAvailableSlots(date, serviceId) che calcola slot liberi basandosi su durata servizio e bookings esistenti, getBookingServices()
- [ ] Actions admin: confirmBooking(id), cancelBooking(id), completeBooking(id), markNoShow(id), updateAvailability(data), createService(), updateService(), deleteService()
- [ ] Action pubblica: createBooking(formData) con Zod + verifica slot libero + insert (documentare race condition in KNOWN_ISSUES.md)
- [ ] `__tests__/dal/bookings.test.ts`: test calcolo slot — nessun conflitto, conflitto parziale, giorno pieno, slot al confine
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.8 — DAL + Actions Media
- [ ] `lib/dal/media.ts`: getMedia(folder?), getMediaById(id)
- [ ] Actions: uploadMedia(formData) con validazione MIME server-side + size + filename sicuro con nanoid + upload Storage + insert DB + audit log. deleteMedia(id) elimina da Storage+DB+audit. updateMediaAlt(id, altText)
- [ ] Test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.9 — DAL + Actions Site Settings
- [ ] `lib/dal/settings.ts`: getSettings(), getSetting(key), getPublicSettings()
- [ ] Actions: updateSetting(key, value), updateSettings(settings). Cache con unstable_cache + tag site-settings, revalidateTag su update
- [ ] Test
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`
### Task 2.10 — Cart logic
- [ ] `lib/cart/types.ts`: CartItem (productId, variantId, quantity — NO prezzo, viene dal DB), Cart (items + signature HMAC), CartWithPrices (items con name/price/total + subtotal/tax/shipping/total)
- [ ] `lib/cart/cart.ts`: getCart() leggi cookie+verifica HMAC+parse, setCart(cart) firma HMAC+scrivi cookie httpOnly, addToCart(productId, variantId, quantity), updateQuantity(productId, variantId, quantity) se 0 rimuovi, removeFromCart(), clearCart(), calculateTotals(cart) legge OGNI prezzo dal DB+calcola subtotal+tax da settings+shipping. HMAC con SHA-256 e HMAC_SECRET da env
- [ ] `lib/cart/actions.ts` con `"use server"`: addToCartAction, updateCartAction, removeFromCartAction, clearCartAction
- [ ] `__tests__/cart/cart.test.ts`: add/remove/update/clear, HMAC cookie manipolato→cart vuoto, calculateTotals con mock prezzi DB, anti-tampering prezzo cambiato→usa nuovo
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.11 — Auth helpers + actions
- [ ] `lib/auth/helpers.ts`: getCurrentUser()→{id,email,role}|null, requireAuth()→redirect se non autenticato, requireAdmin()→redirect se non admin, isAdmin(userId)→boolean
- [ ] `lib/auth/actions.ts` con `"use server"`: signIn(formData), signUp(formData), signOut(), resetPassword(formData), updatePassword(formData). Rate limiting su signIn: max 5/15min per email (in-memory Map — documentare in KNOWN_ISSUES che serve Redis in produzione)
- [ ] `__tests__/auth/helpers.test.ts`: mock session, requireAuth con/senza user, requireAdmin con/senza ruolo
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.12 — Checkout action
- [ ] `lib/checkout/actions.ts` con `"use server"`: createOrder(formData) che: 1) Zod validation 2) getCart() verifica non vuoto 3) calculateTotals() prezzi freschi dal DB 4) verifica stock per ogni item 5) genera order_number 6) insert ordine+items 7) decrementa stock (documentare: NON atomico senza DB function RPC) 8) clearCart() 9) return {success, orderNumber} o {error}
- [ ] Test con mock
- [ ] **Verifica**: `npx tsc --noEmit && npm run test:run`

### Task 2.13 — KNOWN_ISSUES.md
- [ ] Crea `KNOWN_ISSUES.md` documentando: rate limiting in-memory (serve Redis), stock decrement non atomico (serve RPC), booking slot race condition (serve lock/transaction), Stripe non integrato, file upload magic bytes base
- [ ] **Verifica**: file esiste con almeno 5 known issues

### Task 2.14 — Build finale fase 2
- [ ] `npx tsc --noEmit` — ZERO errori
- [ ] `npx next lint` — ZERO errori
- [ ] `npm run build` — ZERO errori
- [ ] `npm run test:run` — ZERO fallimenti, almeno 40 test
- [ ] **Verifica**: tutti e 4 i comandi passano

---

## Note per Ralph

### Se bloccato
Dopo 5 tentativi su un task: 1) Scrivi in BLOCKED.md 2) Segna [BLOCKED] 3) Passa avanti

### Ordine
FASE 0 → FASE 1 → FASE 2. Dentro ogni fase, ordine numerico. Non saltare.

### Validazione OGNI task
1. `npx tsc --noEmit` senza errori
2. `npm run test:run` senza fallimenti (se il task include test)
3. `npm run build` senza errori (se tocca app/)
4. Spunta `- [x]`
5. Committa: `feat(faseX): taskY.Z - descrizione`

### NON fare
- NON usare `any`
- NON disabilitare RLS
- NON esporre service role al client
- NON saltare Zod validation
- NON lasciare console.log (usa logger)
- NON committare segreti
- NON installare dipendenze non richieste senza documentare il motivo