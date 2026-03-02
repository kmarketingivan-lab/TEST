# TODO_A — COMPLETED
# Stream A: Database, Types & New DAL
# Completed: 2026-03-02

## Summary: All 16 tasks (A01–A16) completed successfully.

### Migrations Created (A01–A10)
- [x] A01: `supabase/migrations/20260228000017_reviews.sql` — reviews table + RLS
- [x] A02: `supabase/migrations/20260228000018_wishlists.sql` — wishlists table + RLS
- [x] A03: `supabase/migrations/20260228000019_coupons.sql` — coupons table + RPC validate_and_apply_coupon + RLS
- [x] A04: `supabase/migrations/20260228000020_addresses.sql` — addresses table + is_default trigger + RLS
- [x] A05: `supabase/migrations/20260228000021_newsletter.sql` — newsletter_subscribers table + RLS
- [x] A06: `supabase/migrations/20260228000022_brands.sql` — brands table + products.brand_id + RLS
- [x] A07: `supabase/migrations/20260228000023_product_specs.sql` — products: specifications, regulatory_info, weight_class
- [x] A08: `supabase/migrations/20260228000024_blog_extras.sql` — blog_posts.views_count + RPC increment_blog_views
- [x] A09: `supabase/migrations/20260228000025_shipping_zones.sql` — shipping_zones + shipping_rules + default IT zone
- [x] A10: `supabase/migrations/20260228000026_order_extras.sql` — orders: coupon_id, coupon_code, coupon_discount, invoice_number + RPC generate_invoice_number

### Types Updated (A11)
- [x] A11: `types/database.ts` — Added 8 new tables (reviews, wishlists, coupons, addresses, newsletter_subscribers, brands, shipping_zones, shipping_rules), updated products/blog_posts/orders fields, added 3 new Functions, exported 8 new convenience types

### New DAL + Validators Created (A12–A13)
- [x] A12: `lib/dal/reviews.ts` — getProductReviews, getAverageRating, getReviewStats, createReview, approveReview, deleteReview
- [x] A12: `lib/dal/wishlists.ts` — getUserWishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount
- [x] A12: `lib/dal/newsletter.ts` — subscribe, unsubscribe, getSubscribers
- [x] A12: `lib/validators/reviews.ts`, `lib/validators/wishlists.ts`, `lib/validators/newsletter.ts`
- [x] A13: `lib/dal/coupons.ts` — validateCoupon, applyCoupon, getActiveCoupons, getAllCoupons, createCoupon, updateCoupon, deleteCoupon
- [x] A13: `lib/dal/addresses.ts` — getUserAddresses, getDefaultAddress, createAddress, updateAddress, deleteAddress, setDefaultAddress
- [x] A13: `lib/dal/brands.ts` — getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand
- [x] A13: `lib/dal/shipping.ts` — getShippingZones, calculateShipping
- [x] A13: `lib/validators/coupons.ts`, `lib/validators/addresses.ts`, `lib/validators/brands.ts`

### Existing DAL Updated (A14–A16)
- [x] A14: `lib/dal/products.ts` — Added brands join, new filters (brandId, minPrice, maxPrice, inStock, hasDiscount), getNewProducts(), image joins on all queries, updated ProductWithRelations
- [x] A15: `lib/dal/blog.ts` — Updated getPublishedPosts with tag/search filters, added incrementViews, getRelatedPosts, getPopularPosts
- [x] A16: `lib/dal/bookings.ts` — Added cancelBooking (24h check + ownership), getUserBookingsWithService (join booking_services)

### Verification
- `npx tsc --noEmit`: Zero errors in owned files (all errors are in other streams' files)
- `npx vitest run`: 176/178 passed. 2 pre-existing failures in `ecommerce-flow.test.ts` (cart action mocks unrelated to Stream A changes). Updated `__tests__/dal/products.test.ts` to match new brands join.
