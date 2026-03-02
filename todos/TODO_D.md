# TODO_D — Carrello, Checkout & Ordini
# Total tasks: 12
# File ownership ESCLUSIVA:
# - app/(storefront)/cart/page.tsx, cart/cart-items.tsx
# - app/(storefront)/checkout/page.tsx, checkout/checkout-form.tsx, checkout/success/page.tsx
# - components/storefront/checkout-button.tsx, coupon-form.tsx(NUOVO), address-selector.tsx(NUOVO), order-detail.tsx(NUOVO)
# - app/(storefront)/account/orders/[id]/page.tsx(NUOVO), account/orders/page.tsx(NUOVO)
# - lib/cart/cart.ts, lib/cart/actions.ts, lib/cart/types.ts
# - lib/checkout/actions.ts
# - app/api/stripe/checkout/route.ts, app/api/stripe/webhook/route.ts
# - app/api/invoices/[orderId]/route.ts(NUOVO)

## D01: Selettore quantità nel carrello
cart-items.tsx: ogni riga item aggiungere QuantitySelector (import da components/storefront/quantity-selector.tsx creato da C stream) con min=1, max=stock. Cambio quantità→server action updateCartQuantity(productId, variantId, newQuantity). Quantità→0: rimuovi. Ricalcolo totali live.

## D02: Aggiornare lib/cart/actions.ts
addToCart(productId, variantId, quantity): gestire variantId (non più null) e quantity (non più 1). NUOVA updateCartQuantity(productId, variantId, quantity). Se stesso prodotto+variante: somma con cap stock. Validare stock prima. removeFromCart: verificare gestione variantId.

## D03: Aggiornare lib/cart/cart.ts — totali con spedizione e coupon
calculateTotals(items, couponCode?, country?): calcolare peso totale (product.weight_grams), chiamare calculateShipping(country, weightGrams, subtotal) da lib/dal/shipping.ts, se couponCode validare e applicare sconto da lib/dal/coupons.ts. Return: items[], subtotal, tax, shipping, discount, total, couponApplied?. Aggiornare CartTotals type.

## D04: Persistent cart per utenti loggati
lib/cart/cart.ts: Se loggato salva/leggi cart da DB (colonna JSONB su profiles o tabella cart_items). Se anonimo: cookie. Al login: merge cookie+DB cart. Al logout: cart rimane cookie.

## D05: Coupon form nel checkout
components/storefront/coupon-form.tsx — Input codice+"Applica". Client component chiama server action validateCoupon(). Valido: verde "Sconto: -€XX"+badge removibile. Invalido: rosso+motivo. Sconto passa a calculateTotals. Integrare in checkout.

## D06: Address selector nel checkout
components/storefront/address-selector.tsx — Se loggato con indirizzi: dropdown seleziona. "Usa nuovo indirizzo"→form. Checkbox "Salva indirizzo". Non loggato: solo form. Integrare in checkout-form.

## D07: Aggiornare checkout-form.tsx
Integrare AddressSelector + CouponForm. Guest checkout: form funziona senza login (email richiesta). Se loggato: pre-fill email+nome. Campo "Note ordine" textarea. Checkbox "Fatturazione diversa"→secondo form.

## D08: Aggiornare checkout actions + Stripe
lib/checkout/actions.ts: createOrder() include coupon_id/code/discount, shipping da zones (non hardcoded), invoice_number (RPC). api/stripe/checkout/route.ts: totale corretto. api/stripe/webhook/route.ts: dopo pagamento inviare email (import da lib/email se disponibile).

## D09: Pagina successo migliorata
checkout/success/page.tsx: riepilogo completo (numero, items, totali, indirizzo). "Riceverai email a {email}". CTA "Vedi ordini" (loggato) / "Torna home". Se coupon: sconto visibile.

## D10: Dettaglio ordine utente
app/(storefront)/account/orders/[id]/page.tsx — Fetch ordine+order_items per user_id. Numero, data, stato badge, items nome/qty/prezzo, totali, indirizzi. Timeline: pending→confirmed→shipped→delivered. Bottone "Scarica fattura".

## D11: Download fattura PDF
app/api/invoices/[orderId]/route.ts — Genera PDF on-the-fly. Intestazione Palmetto, dati cliente, items, totali, P.IVA, numero fattura. Libreria: jspdf o @react-pdf/renderer. Auth: owner o admin. Content-Type application/pdf.

## D12: Link ordini da account
account/page.tsx: ogni ordine Link a /account/orders/{id}. Oppure account/orders/page.tsx con lista completa paginata. Account: preview ultimi 5 + "Vedi tutti".

## Criteri: Carrello +/- quantità, varianti corrette, coupon validazione+sconto, spedizione dinamica, indirizzi salvati, guest checkout, dettaglio ordine, fattura PDF, Stripe con totali corretti. tsc zero errori.
