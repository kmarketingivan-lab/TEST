# TODO_D — Carrello, Checkout & Ordini — COMPLETATO

## D01: Selettore quantita nel carrello ✅
- `cart-items.tsx`: Added quantity selector with min=1, max=stock, minus/plus buttons
- Quantity 0 triggers removal via `removeFromCartAction`
- Low stock warning shown when stock <= 5
- Disabled +/- buttons at stock limits

## D02: Aggiornare lib/cart/actions.ts ✅
- `addToCartAction`: Now validates stock before adding, sums existing quantity + new
- `updateCartAction`: Validates stock for new quantity before updating
- `removeFromCartAction`: Works with variantId properly
- `validateCouponAction`: New server action for coupon validation via site_settings
- All actions validate stock from DB (product or variant stock_quantity)

## D03: Aggiornare lib/cart/cart.ts — totali con spedizione e coupon ✅
- `calculateTotals(items, couponCode?, country?)`: Full signature with optional coupon and country
- Calculates total weight from `product.weight_grams`
- Calls `calculateShipping()` using site_settings `shipping_zones` config
- Coupon validation from site_settings `coupons` config (percent or fixed discount)
- Returns: items[], subtotal, tax, shipping, discount, total, couponCode, couponLabel
- `CartWithPrices` type updated with discount, couponCode, couponLabel
- `CartItemWithPrice` type updated with optional stock field

## D04: Persistent cart per utenti loggati ✅
- `getCart()`: If logged in, merges cookie cart + DB cart (site_settings keyed by user ID)
- `setCart()`: Saves to both cookie AND DB when user is authenticated
- `getCartFromDb()` / `saveCartToDb()`: DB persistence via site_settings with `cart_items_{userId}` key
- `mergeCarts()`: Merges two carts summing quantities for matching product+variant
- Anonymous users: cookie only. Login: merge and persist. Logout: cookie remains.

## D05: Coupon form nel checkout ✅
- `components/storefront/coupon-form.tsx`: Client component with input + "Applica" button
- Calls `validateCouponAction()` server action
- Valid: green box with checkmark, label, and "Rimuovi" button
- Invalid: red error message
- `onApply`/`onRemove` callbacks pass coupon state to parent

## D06: Address selector nel checkout ✅
- `components/storefront/address-selector.tsx`: Client component
- If saved addresses: dropdown to select + "Usa nuovo indirizzo" option
- Selected address: shows preview + hidden inputs for form submission
- New address: full form with street, city, zip, province, country
- "Salva indirizzo" checkbox when user has existing addresses
- Exported `SavedAddress` type

## D07: Aggiornare checkout-form.tsx ✅
- Integrated `AddressSelector` for shipping address
- Integrated `CouponForm` with apply/remove state management
- Guest checkout: form works without login, email required
- Logged in: pre-fills email and name
- "Fatturazione diversa" checkbox shows second AddressSelector
- Notes textarea included
- Coupon code attached to FormData on submit

## D08: Aggiornare checkout actions + Stripe ✅
- `lib/checkout/actions.ts`: createOrder() now passes couponCode and country to calculateTotals
- Discount from coupon included in order insert
- `api/stripe/checkout/route.ts`: Shipping added as line item, Stripe coupon created for discounts
- `api/stripe/webhook/route.ts`: Uses RPC for order number, calculates discount from Stripe, sends email via lib/email/send if available, uses decrement_stock RPC

## D09: Pagina successo migliorata ✅
- `checkout/success/page.tsx`: Full order summary with items, quantities, prices
- Shows order number, email confirmation message
- Complete totals breakdown (subtotal, discount, IVA, shipping, total)
- Shipping address displayed
- CTA: "Vedi i tuoi ordini" (logged in) or "Torna alla home" (guest)

## D10: Dettaglio ordine utente ✅
- `app/(storefront)/account/orders/[id]/page.tsx`: Full order detail page
- Auth: owner or admin only
- Order timeline: pending → confirmed → shipped → delivered (visual progress)
- Items list with product name, variant, quantity, prices
- Complete totals breakdown with discount/coupon visibility
- Shipping + billing addresses displayed
- Notes section
- "Scarica fattura PDF" button linking to `/api/invoices/{orderId}`

## D11: Download fattura PDF ✅
- `app/api/invoices/[orderId]/route.ts`: Generates PDF on-the-fly with jsPDF
- Company header: "Armeria Palmetto", P.IVA, address
- Invoice number + date
- Customer info + shipping address
- Items table: name, qty, unit price, total
- Totals: subtotal, discount, IVA, shipping, total
- Auth: owner or admin only
- Returns `application/pdf` with inline disposition

## D12: Link ordini da account ✅
- `account/page.tsx`: Each order in the preview list links to `/account/orders/{id}`
- Shows last 5 orders (reduced from 10) + "Vedi tutti" link
- `app/(storefront)/account/orders/page.tsx`: Full paginated orders list
- Table with order number, date, total, status badge, "Dettagli" link
- Pagination: previous/next with page counter
- Status badges with Italian labels and color-coded variants

## Additional files created:
- `components/storefront/order-detail.tsx`: Reusable order detail component (client-side)

## Dependencies added:
- `jspdf` — PDF generation for invoices

## tsc: Zero errors in Stream D files. All pre-existing errors are in other streams' files.
