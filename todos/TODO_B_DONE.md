# TODO_B — COMPLETED
# Stream B: Homepage, Navigation & Layout
# All 16 tasks (B01–B16) executed successfully.
# tsc: zero errors in owned files.

## B01: Hero slider ✅
- Created `components/storefront/hero-slider.tsx`
- Client component with useState for current slide, autoplay 5s
- 3 hardcoded slides with background image, title, subtitle, CTA
- Arrows (ChevronLeft/Right) + dot navigation
- Dark overlay, responsive full-width (400/500/600px heights)
- Fade transition between slides

## B02: Trust badges ✅
- Created `components/storefront/trust-badges.tsx`
- 4 badges: Dal 1985 (Calendar), Spedizione gratuita (Truck), Garanzia (Shield), Assistenza (Headphones)
- Flex row desktop (4 cols), 2x2 mobile (grid-cols-2)
- Red icons + text, placed immediately below hero

## B03: Top bar ✅
- Created `components/layout/top-bar.tsx`
- Slim h-8 bar, bg-neutral-950, text-xs
- Left: phone + email links. Center: promo text (yellow). Right: hours
- hidden sm:flex (mobile hidden)
- Props accept phone/email/promo with defaults

## B04: Mega menu ✅
- Created `components/layout/mega-menu.tsx`
- Hover "Catalogo" → full-width dropdown
- Category columns with subcategories (children via parent_id)
- Promo column on lg screens
- Fade-in animation, ESC/click-outside closes
- Links to /products?category={slug}

## B05: Search modal ✅
- Created `components/layout/search-modal.tsx`
- Search icon in header → modal overlay
- Input with 300ms debounce, calls searchProducts DAL
- Live results: name + price (max 6 results)
- "Vedi tutti i risultati" link
- Ctrl+K / Cmd+K shortcut, ESC closes

## B06: Refactor storefront-header.tsx ✅
- Imported MegaMenu (replaces flat "Catalogo" nav link)
- Imported SearchModal (search icon)
- Added categories prop (optional, default [])
- Mobile: hamburger with categories accordion (ChevronDown/Up)
- Icon order: Search | Cart | Account

## B07: Storefront layout.tsx ✅
- Fetches getCategoryTree() in server component
- Passes categories to StorefrontHeader
- Added TopBar above header
- Added RecentlyViewed before footer

## B08: Homepage — Nuovi arrivi ✅
- New "Nuovi arrivi" section after "Prodotti in evidenza"
- Uses getProducts({ sortBy: "created_at", sortOrder: "desc", perPage: 8 })
- ProductCard grid, "Vedi tutti" → /products?sort=created_at&order=desc
- Hero replaced with HeroSlider, TrustBadges added

## B09: Brand carousel ✅
- Created `components/storefront/brand-carousel.tsx`
- Accepts brands as prop (name, slug, logoUrl)
- Desktop: 6-col grid. Mobile: horizontal scroll
- Links to /products?brand={slug}
- Homepage fetches brands via dynamic import (try/catch for Stream A DAL)

## B10: Testimonials ✅
- "Cosa dicono i nostri clienti" section
- 3 hardcoded testimonials with yellow stars, text, name
- 3-column card layout (sm:2, lg:3)

## B11: Store info ✅
- Section before footer, dark bg (bg-neutral-900)
- Left column: address, hours, phone, email with icons
- Right column: map placeholder
- Uses lucide icons (MapPin, Clock, Phone, Mail)

## B12: Newsletter form ✅
- Created `components/storefront/newsletter-form.tsx`
- Client component: email input + "Iscriviti" button
- Compact mode (for footer) and full mode (homepage section)
- Dynamic import of subscribe() from Stream A DAL (try/catch)
- Toast feedback via useToast
- Added to homepage (full) and footer (compact)

## B13: Promo banner ✅
- "Offerte" section with bg-red-950
- Queries products with compare_at_price IS NOT NULL via Supabase
- Shows up to 4 discounted products with ProductCard
- "Vedi tutte" link

## B14: Footer updated ✅
- Expanded from 3 to 4 columns
- Col 1: "Il nostro negozio" (address, hours, phone, email, Google Maps link)
- Col 2: Quick links
- Col 3: Legal links
- Col 4: Newsletter compact + social icons (FB, IG, WhatsApp)
- Payment badges (Visa, Mastercard, PayPal)
- P.IVA and REA in copyright area

## B15: 404 personalizzata ✅
- Updated `app/not-found.tsx`
- Large SearchX icon, "404", subtitle
- Two CTAs: "Torna alla home" + "Sfoglia il catalogo"
- "Potrebbero interessarti" — 4 featured products via getFeaturedProducts

## B16: Recently viewed ✅
- Created `components/storefront/recently-viewed.tsx`
- Client component, localStorage backed
- Stores [{productId, slug, name, price, imageUrl}], max 8
- Horizontal scroll mini cards with image, name, price
- Exported addRecentlyViewed() helper for product pages
- If empty: does not render
- Integrated in storefront layout before footer

## Files Modified/Created:
### Created (NEW):
- components/storefront/hero-slider.tsx
- components/storefront/trust-badges.tsx
- components/storefront/brand-carousel.tsx
- components/storefront/newsletter-form.tsx
- components/storefront/recently-viewed.tsx
- components/layout/top-bar.tsx
- components/layout/mega-menu.tsx
- components/layout/search-modal.tsx

### Modified:
- app/(storefront)/page.tsx — full homepage rebuild
- app/(storefront)/layout.tsx — TopBar, categories, RecentlyViewed
- components/layout/storefront-header.tsx — MegaMenu, SearchModal, categories
- components/layout/storefront-footer.tsx — 4 columns, newsletter, social, payments
- app/not-found.tsx — custom 404 with featured products

## Notes:
- getNewProducts (A14), getBrands (A stream), subscribe (A12) not yet available
  → Used getProducts as fallback, dynamic import with try/catch for brands/newsletter
- Pre-existing tsc errors in __tests__/ and admin/brands unrelated to Stream B
