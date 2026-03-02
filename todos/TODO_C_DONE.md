# TODO_C — Catalogo & Pagina Prodotto — COMPLETATO

Tutti i 16 task (C01-C16) sono stati completati con successo.
`tsc --noEmit` compila senza errori nei file di Stream C.

## C01: ✅ Aggiornare product-card.tsx — immagini + stock badge
- Mostra prima immagine (is_primary o sort_order=0) invece di placeholder SVG
- Fallback placeholder se nessuna immagine
- Badge stock tramite StockBadge component
- Badge brand se presente
- Hover scale immagine (group-hover:scale-105)
- File: `components/storefront/product-card.tsx`

## C02: ✅ Stock badge component
- Props: stockQuantity, lowStockThreshold (opzionale)
- stock=0 → "Esaurito" bg-red-600
- stock<=threshold → "Ultimi {n} pezzi" bg-amber-500
- Altrimenti null
- File: `components/storefront/stock-badge.tsx`

## C03: ✅ Sidebar filtri avanzati
- Client component con sezioni collapsibili
- Filtri: Categoria (checkbox), Marca (checkbox), Prezzo (PriceRangeSlider), Disponibilità, Promozione
- "Applica filtri" aggiorna URL, "Reset" rimuove tutti i filtri
- Mobile: drawer laterale. Desktop: sidebar sinistra 280px
- File: `components/storefront/product-filters.tsx`

## C04: ✅ Price range slider
- Dual-thumb slider min/max con input numerici sincronizzati
- Track grigio, range rosso, thumb bianchi bordo rosso
- File: `components/storefront/price-range-slider.tsx`

## C05: ✅ Aggiornare pagina catalogo products/page.tsx
- Layout: sidebar filtri 280px + area prodotti
- Fetch brands, categorie, min/max prezzo per filtri
- Nuovi searchParams: brand, minPrice, maxPrice, inStock, hasDiscount, perPage, view
- Sottocategorie se categoria selezionata ha figli
- Selettore per-page 12|24|48
- View toggle griglia/lista
- Mobile: filtri drawer, griglia senza sidebar
- File: `app/(storefront)/products/page.tsx`

## C06: ✅ View toggle griglia/lista
- Icone griglia/lista con stato in URL param view=grid|list
- Lista: img piccola sx + info dx su una riga
- File: `components/storefront/view-toggle.tsx`

## C07: ✅ Quick view modal
- Bottone "Anteprima" hover su ProductCard
- Modal: immagine grande, nome, prezzo, stock, quantità, add to cart
- Link dettagli. ESC chiude. Click fuori chiude.
- File: `components/storefront/quick-view-modal.tsx`

## C08: ✅ Refactor pagina prodotto products/[slug]/page.tsx
- Layout: Sinistra ProductGallery, Destra info prodotto
- VariantSelector + QuantitySelector + AddToCart (client component separato)
- WishlistButton + ShareButtons
- ProductTabs sotto: Descrizione, Specifiche, Normativa, Recensioni
- Prodotti correlati sotto tabs
- Breadcrumb migliorato: Home > Categoria > Prodotto
- File: `app/(storefront)/products/[slug]/page.tsx`
- File: `app/(storefront)/products/[slug]/product-detail-client.tsx`

## C09: ✅ Gallery prodotto interattiva
- Immagine principale grande con thumbnails sotto
- Click thumbnail cambia immagine principale
- Thumbnail attiva: bordo rosso
- Zoom: hover scale 2x, click apre lightbox fullscreen
- Frecce navigazione per mobile
- 0 immagini → placeholder
- File: `components/storefront/product-gallery.tsx`

## C10: ✅ Variant selector
- Bottoni/chip selezionabili per varianti
- Selezionata: bordo+sfondo rosso
- Price_adjustment mostrato ("+€50"/"-€20")
- stock=0: disabilitata con "Esaurito"
- Aggiorna prezzo totale nel parent
- File: `components/storefront/variant-selector.tsx`

## C11: ✅ Quantity selector
- "−" | input | "+" con min/max
- Disabilita bottoni a min/max
- File: `components/storefront/quantity-selector.tsx`

## C12: ✅ Product tabs
- Client component con tab attiva
- Tab: Descrizione (rich_description), Specifiche (JSONB → tabella), Normativa (warning giallo), Recensioni
- Tab senza contenuto: nascosta
- File: `components/storefront/product-tabs.tsx`

## C13: ✅ Product reviews + form
- Rating medio stelle, distribuzione barre 1-5, lista reviews
- Ogni review: stelle, titolo, body, autore, data
- "Scrivi recensione" solo loggato
- Form: rating stelle cliccabili, titolo, body, submit
- Server action createReview con messaggio post-submit
- File: `components/storefront/product-reviews.tsx`
- File: `components/storefront/review-form.tsx`
- File: `components/storefront/review-form-action.ts`

## C14: ✅ Wishlist button
- Cuore vuoto/pieno rosso, toggle add/remove
- Non loggato → redirect login
- Server action per toggle
- File: `components/storefront/wishlist-button.tsx`
- File: `components/storefront/wishlist-action.ts`

## C15: ✅ Share buttons
- WhatsApp, Facebook, copia link clipboard
- Icone piccole inline
- Feedback visivo "copiato" per clipboard
- File: `components/storefront/share-buttons.tsx`

## C16: ✅ Aggiornare add-to-cart-button.tsx
- Props: productId, variantId, quantity, disabled (per stock=0)
- Toast "Prodotto aggiunto al carrello"
- Loading state con spinner
- Disabilitato se stock=0 con testo "Esaurito"
- File: `components/storefront/add-to-cart-button.tsx`

## File creati/modificati (solo file ownership Stream C)
### Modificati:
- `components/storefront/product-card.tsx`
- `components/storefront/add-to-cart-button.tsx`
- `app/(storefront)/products/page.tsx`
- `app/(storefront)/products/[slug]/page.tsx`

### Creati (nuovi):
- `components/storefront/stock-badge.tsx`
- `components/storefront/product-filters.tsx`
- `components/storefront/price-range-slider.tsx`
- `components/storefront/view-toggle.tsx`
- `components/storefront/quantity-selector.tsx`
- `components/storefront/product-gallery.tsx`
- `components/storefront/variant-selector.tsx`
- `components/storefront/product-tabs.tsx`
- `components/storefront/product-reviews.tsx`
- `components/storefront/review-form.tsx`
- `components/storefront/review-form-action.ts`
- `components/storefront/wishlist-button.tsx`
- `components/storefront/wishlist-action.ts`
- `components/storefront/share-buttons.tsx`
- `components/storefront/quick-view-modal.tsx`
- `app/(storefront)/products/[slug]/product-detail-client.tsx`

## tsc: ✅ Zero errori nei file Stream C
