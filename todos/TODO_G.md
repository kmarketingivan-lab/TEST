# TODO_G — SEO, Performance, Email & Infrastruttura
# Total tasks: 14
# File ownership ESCLUSIVA:
# - lib/seo/json-ld.ts, metadata.ts (NUOVI)
# - lib/email/client.ts, send.ts (NUOVI), lib/email/templates/ (NUOVA dir, tutti file)
# - app/api/cron/ (NUOVA dir)
# - app/sitemap.ts, app/robots.ts
# - next.config.ts (solo config images)
# - components/seo/json-ld-script.tsx (NUOVO)
# - components/ui/optimized-image.tsx (NUOVO)
# - components/ui/skeleton.tsx, components/ui/toast.tsx

## G01: Setup email con Resend
npm install resend. lib/email/client.ts: setup client Resend, export resendClient, isEmailConfigured(). Env: RESEND_API_KEY. Se mancante: isEmailConfigured()=false, graceful skip+log.
lib/email/send.ts: sendOrderConfirmation(order,items,customer), sendBookingConfirmation(booking,service), sendBookingReminder(booking,service), sendWelcomeEmail(email,name). Ogni funzione: try/catch, check isEmailConfigured().

## G02: Template email conferma ordine
lib/email/templates/order-confirmation.ts — generateOrderConfirmationHtml(data)→stringa HTML. Logo Palmetto, "Grazie per il tuo ordine!", numero, tabella items, totali, indirizzo, link sito. Inline CSS responsive, colori Palmetto. Footer: info, P.IVA, privacy.

## G03: Template email conferma prenotazione
lib/email/templates/booking-confirmation.ts — "Prenotazione confermata!", servizio, data, orario, durata, indirizzo negozio. Stile coerente.

## G04: Template email booking reminder
lib/email/templates/booking-reminder.ts — "Il tuo appuntamento è domani", dettagli.

## G05: Template email benvenuto
lib/email/templates/welcome.ts — "Benvenuto in Armeria Palmetto!", intro, CTA catalogo, CTA prenotazione.

## G06: JSON-LD helpers
lib/seo/json-ld.ts: generateProductSchema(product,reviews?): Schema.org Product. generateLocalBusinessSchema(settings). generateBreadcrumbSchema(items:{name,url}[]). generateBlogPostSchema(post). generateOrganizationSchema(settings).
components/seo/json-ld-script.tsx: <JsonLdScript data={object}/> → <script type="application/ld+json">.

## G07: Applicare JSON-LD
Homepage: LocalBusiness+Organization (in layout/page). Prodotto: Product+BreadcrumbList (C08 integra). Blog: BlogPosting (F05 integra). NOTA: G crea helpers, altri stream importano e usano.

## G08: Ottimizzazione immagini next/image
next.config.ts: images.remotePatterns per Supabase storage domain. components/ui/optimized-image.tsx: wrapper next/image con fallback placeholder, lazy loading default, WebP auto. NOTA: sostituzione <img>→OptimizedImage avviene nei rispettivi stream.

## G09: Canonical URLs + pagination SEO
lib/seo/metadata.ts: generateCanonicalUrl(path)→URL assoluta. generatePaginationMeta(currentPage, totalPages, basePath)→{prev,next URLs}. Le pagine usano questi helper nel generateMetadata().

## G10: Sitemap fix
app/sitemap.ts: Fix active→is_active, published→is_published. Aggiungere categorie, brand pages, tag blog.

## G11: Loading states skeleton
Verificare skeleton.tsx ha varianti: SkeletonCard, SkeletonList, SkeletonText. Creare loading.tsx: products/loading.tsx (griglia SkeletonCard), blog/loading.tsx, account/loading.tsx.

## G12: Toast notifications
Verificare toast.tsx: varianti success/error/warning/info, auto-dismiss 4s, slide-in animazione, stack multipli, global provider nel layout root.

## G13: Alt text accessibilità
Checklist: tutti <img>/OptimizedImage con alt significativo. Prodotti: image.alt_text ?? product.name. Blog: post.title. Categorie: category.name.

## G14: Logging predisposizione
lib/utils/logger.ts: log strutturato JSON. Predisposizione Sentry: commento+README istruzioni. app/error.tsx: errori loggati. NON installare Sentry ora.

## Criteri: Email Resend funziona (o graceful skip), 4 template, JSON-LD helpers+component, OptimizedImage, canonical+pagination, sitemap fix, loading states, toast OK. tsc zero errori.
