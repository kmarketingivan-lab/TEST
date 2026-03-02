# TODO_G — COMPLETED
# Stream G: SEO, Performance, Email & Infrastruttura
# All 14 tasks completed successfully

## G01: Setup email con Resend ✅
- Installed `resend` package
- Created `lib/email/client.ts`: Resend client setup with `getClient()`, `isEmailConfigured()`
- Created `lib/email/send.ts`: `sendOrderConfirmation()`, `sendBookingConfirmation()`, `sendBookingReminder()`, `sendWelcomeEmail()`
- All functions: try/catch, graceful skip when RESEND_API_KEY missing

## G02: Template email conferma ordine ✅
- Created `lib/email/templates/order-confirmation.ts`
- `generateOrderConfirmationHtml()`: Logo Palmetto, order number, items table, totals, shipping address, inline CSS responsive

## G03: Template email conferma prenotazione ✅
- Created `lib/email/templates/booking-confirmation.ts`
- `generateBookingConfirmationHtml()`: service, date, time, duration, store address, consistent styling

## G04: Template email booking reminder ✅
- Created `lib/email/templates/booking-reminder.ts`
- `generateBookingReminderHtml()`: "Il tuo appuntamento è domani", service details

## G05: Template email benvenuto ✅
- Created `lib/email/templates/welcome.ts`
- `generateWelcomeHtml()`: "Benvenuto in Armeria Palmetto!", CTA catalogo, CTA prenotazione

## G06: JSON-LD helpers ✅
- Created `lib/seo/json-ld.ts`: `generateProductSchema()`, `generateLocalBusinessSchema()`, `generateBreadcrumbSchema()`, `generateBlogPostSchema()`, `generateOrganizationSchema()`
- Created `components/seo/json-ld-script.tsx`: `<JsonLdScript data={object}/>`

## G07: Applicare JSON-LD ✅
- Helpers created and ready for other streams to import and use
- Note: G creates helpers, other streams (C, F) integrate them in pages

## G08: Ottimizzazione immagini next/image ✅
- Updated `next.config.ts`: images.remotePatterns for Supabase storage domains
- Created `components/ui/optimized-image.tsx`: wrapper with fallback placeholder, lazy loading, error handling

## G09: Canonical URLs + pagination SEO ✅
- Created `lib/seo/metadata.ts`: `generateCanonicalUrl()`, `generatePaginationMeta()`

## G10: Sitemap fix ✅
- Fixed `app/sitemap.ts`: `active` → `is_active`, `published` → `is_published`
- Added categories, brands, blog tag pages

## G11: Loading states skeleton ✅
- Added `SkeletonList` and `SkeletonText` variants to `components/ui/skeleton.tsx`
- Created `app/(storefront)/products/loading.tsx` (grid of SkeletonCard)
- Created `app/(storefront)/blog/loading.tsx` (grid of SkeletonCard)
- Created `app/(storefront)/account/loading.tsx` (profile skeleton)

## G12: Toast notifications ✅
- Fixed info variant colors (was red, now blue)
- Auto-dismiss: 5s → 4s
- Added slide-in animation (translateX)
- Verified: 4 variants, stacking, global provider in root layout

## G13: Alt text accessibilità ✅
- OptimizedImage requires `alt` as mandatory prop
- Fallback placeholder uses `aria-label={alt}`
- Pattern: `image.alt_text ?? product.name` for products
- Actual img→OptimizedImage substitution happens in respective streams

## G14: Logging predisposizione ✅
- Enhanced `lib/utils/logger.ts` with Sentry integration instructions
- Updated `app/error.tsx` to log errors with useEffect
- Sentry NOT installed — comments + instructions provided

## tsc: zero errors in Stream G files ✅
