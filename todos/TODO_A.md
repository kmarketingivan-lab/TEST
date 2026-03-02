# TODO_A — Database, Types & New DAL
# Total tasks: 16
# File ownership ESCLUSIVA:
# - supabase/migrations/20260228000017_*.sql → 000026_*.sql
# - types/database.ts
# - lib/dal/reviews.ts, wishlists.ts, coupons.ts, addresses.ts, newsletter.ts, brands.ts, shipping.ts (NUOVI)
# - lib/dal/products.ts, blog.ts, bookings.ts
# - lib/validators/reviews.ts, wishlists.ts, coupons.ts, addresses.ts, newsletter.ts, brands.ts (NUOVI)

## A01: Migration — tabella reviews
File: supabase/migrations/20260228000017_reviews.sql
Colonne: id UUID PK DEFAULT gen_random_uuid(), product_id UUID FK products NOT NULL, user_id UUID FK profiles, author_name TEXT NOT NULL, rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5), title TEXT, body TEXT, is_approved BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
Indici: (product_id, is_approved), (rating). RLS: SELECT tutti dove is_approved=true, INSERT authenticated, UPDATE/DELETE admin via is_admin()

## A02: Migration — tabella wishlists
File: supabase/migrations/20260228000018_wishlists.sql
Colonne: id UUID PK, user_id UUID FK profiles NOT NULL, product_id UUID FK products NOT NULL, created_at TIMESTAMPTZ. UNIQUE(user_id, product_id). RLS: utente CRUD solo propri (user_id = auth.uid())

## A03: Migration — tabella coupons
File: supabase/migrations/20260228000019_coupons.sql
Colonne: id UUID PK, code TEXT UNIQUE NOT NULL, description TEXT, discount_type TEXT CHECK('percentage','fixed') NOT NULL, discount_value NUMERIC NOT NULL, min_order_amount NUMERIC DEFAULT 0, max_uses INT, current_uses INT DEFAULT 0, starts_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ
RPC validate_and_apply_coupon(p_code, p_order_amount) → JSONB {valid, discount, reason}. RLS: SELECT tutti (attivi+date), CRUD admin

## A04: Migration — tabella addresses
File: supabase/migrations/20260228000020_addresses.sql
Colonne: id UUID PK, user_id UUID FK profiles NOT NULL, label TEXT DEFAULT 'Casa', full_name TEXT NOT NULL, phone TEXT, street TEXT NOT NULL, city TEXT NOT NULL, province TEXT NOT NULL, postal_code TEXT NOT NULL, country TEXT DEFAULT 'IT', is_default BOOLEAN DEFAULT false, created_at/updated_at TIMESTAMPTZ
Trigger: is_default=true → setta false sugli altri dello stesso user. RLS: utente CRUD solo propri

## A05: Migration — tabella newsletter_subscribers
File: supabase/migrations/20260228000021_newsletter.sql
Colonne: id UUID PK, email TEXT UNIQUE NOT NULL, full_name TEXT, is_active BOOLEAN DEFAULT true, subscribed_at TIMESTAMPTZ DEFAULT now(), unsubscribed_at TIMESTAMPTZ. RLS: INSERT anon/authenticated, SELECT/UPDATE/DELETE admin

## A06: Migration — tabella brands + campo su products
File: supabase/migrations/20260228000022_brands.sql
Tabella brands: id UUID PK, name TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, logo_url TEXT, website_url TEXT, sort_order INT DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ
ALTER TABLE products ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL. RLS brands: SELECT tutti, CRUD admin

## A07: Migration — specifications + regulatory_info su products
File: supabase/migrations/20260228000023_product_specs.sql
ALTER TABLE products ADD COLUMN specifications JSONB DEFAULT '{}' — calibro, lunghezza canna, peso, capacità, tipo azione, materiale
ALTER TABLE products ADD COLUMN regulatory_info TEXT — normativa, porto d'armi, categoria arma
ALTER TABLE products ADD COLUMN weight_class TEXT — per calcolo spedizione

## A08: Migration — blog views_count
File: supabase/migrations/20260228000024_blog_extras.sql
ALTER TABLE blog_posts ADD COLUMN views_count INT DEFAULT 0
RPC increment_blog_views(p_post_id UUID): UPDATE atomico +1

## A09: Migration — shipping zones
File: supabase/migrations/20260228000025_shipping_zones.sql
Tabella shipping_zones: id UUID PK, name TEXT NOT NULL, countries TEXT[] DEFAULT '{IT}', min_order_free_shipping NUMERIC, flat_rate NUMERIC NOT NULL, per_kg_rate NUMERIC DEFAULT 0, is_active BOOLEAN DEFAULT true
Tabella shipping_rules: id UUID PK, zone_id UUID FK, min_weight_grams INT DEFAULT 0, max_weight_grams INT, price NUMERIC NOT NULL
INSERT default zona Italia: flat 8.90, free sopra 150. RLS: SELECT tutti, CRUD admin

## A10: Migration — order coupon + invoice
File: supabase/migrations/20260228000026_order_extras.sql
ALTER TABLE orders ADD COLUMN coupon_id UUID REFERENCES coupons(id), coupon_code TEXT, coupon_discount NUMERIC DEFAULT 0, invoice_number TEXT
RPC generate_invoice_number() → TEXT (formato FT-2026-0001)

## A11: Aggiornare types/database.ts
Aggiungere Tables: reviews, wishlists, coupons, addresses, newsletter_subscribers, brands, shipping_zones, shipping_rules
Aggiungere campi products: brand_id, specifications, regulatory_info, weight_class
Aggiungere campi blog_posts: views_count
Aggiungere campi orders: coupon_id, coupon_code, coupon_discount, invoice_number
Aggiungere Functions: increment_blog_views, validate_and_apply_coupon, generate_invoice_number
Export types: Review, Wishlist, Coupon, Address, NewsletterSubscriber, Brand, ShippingZone, ShippingRule

## A12: Creare DAL — reviews, wishlists, newsletter
lib/dal/reviews.ts: getProductReviews(productId, {page}), getAverageRating(productId), getReviewStats(productId) → {avg, count, distribution[1-5]}, createReview(), approveReview(), deleteReview()
lib/dal/wishlists.ts: getUserWishlist(userId, {page}), addToWishlist(), removeFromWishlist(), isInWishlist(), getWishlistCount()
lib/dal/newsletter.ts: subscribe(email, name?), unsubscribe(email), getSubscribers({page})
Validatori Zod in lib/validators/

## A13: Creare DAL — coupons, addresses, brands, shipping
lib/dal/coupons.ts: validateCoupon(code, amount), applyCoupon(couponId), getActiveCoupons(), CRUD admin
lib/dal/addresses.ts: getUserAddresses(userId), getDefaultAddress(userId), createAddress(), updateAddress(), deleteAddress(), setDefaultAddress()
lib/dal/brands.ts: getBrands({isActive?}), getBrandBySlug(slug), CRUD admin
lib/dal/shipping.ts: getShippingZones(), calculateShipping(country, weightGrams, orderAmount) → {cost, isFree, zone}
Validatori Zod in lib/validators/

## A14: Aggiornare lib/dal/products.ts
getProducts(): select → *, product_images(id,url,alt_text,sort_order,is_primary), brands(id,name,slug,logo_url)
Nuovi filtri: brandId, minPrice, maxPrice, inStock (stock_quantity>0), hasDiscount
getFeaturedProducts(): join product_images + brands
NUOVA getNewProducts(limit): created_at desc, is_active, join immagini
getRelatedProducts(): join product_images. searchProducts(): join product_images
Aggiornare ProductWithRelations per includere brands

## A15: Aggiornare lib/dal/blog.ts
getPublishedPosts(): aggiungere filtri tag e search
NUOVA incrementViews(postId): RPC increment_blog_views
NUOVA getRelatedPosts(postId, tags, limit): tag in comune
NUOVA getPopularPosts(limit): ordina views_count desc

## A16: Aggiornare lib/dal/bookings.ts
NUOVA cancelBooking(bookingId, userId): status→cancelled, check ownership, check 24h prima
NUOVA getUserBookingsWithService(userId): join booking_services per nome servizio

## Criteri completamento
- Tutte le migrazioni applicabili con npx supabase db reset
- types/database.ts compila zero errori
- Tutti i nuovi DAL + validatori compilano
- npx tsc --noEmit zero errori
- 178 test esistenti ancora passano
