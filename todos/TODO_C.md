# TODO_C — Catalogo & Pagina Prodotto
# Total tasks: 16
# File ownership ESCLUSIVA:
# - app/(storefront)/products/page.tsx, products/[slug]/page.tsx
# - components/storefront/product-card.tsx, add-to-cart-button.tsx
# - components/storefront/product-filters.tsx, price-range-slider.tsx, product-gallery.tsx, variant-selector.tsx, quantity-selector.tsx, product-tabs.tsx, product-reviews.tsx, review-form.tsx, wishlist-button.tsx, share-buttons.tsx, stock-badge.tsx, quick-view-modal.tsx, view-toggle.tsx (NUOVI)

## C01: Aggiornare product-card.tsx — immagini + stock badge
Product type ora include product_images (da A14). Mostrare prima immagine (is_primary o sort_order=0) invece di placeholder SVG. Fallback placeholder se nessuna immagine. Badge stock: "Esaurito" rosso se stock=0, "Ultimi pezzi" arancio se stock<=3 o <=low_stock_threshold. Badge brand se presente. Hover scale immagine.

## C02: Stock badge component
components/storefront/stock-badge.tsx — Props: stockQuantity, lowStockThreshold?. stock=0→"Esaurito" bg-red-600, stock<=threshold→"Ultimi {n} pezzi" bg-amber-500, else null. Usato in ProductCard e pagina prodotto.

## C03: Sidebar filtri avanzati
components/storefront/product-filters.tsx — Client component. Sezioni collapsibili: Categoria (checkbox+conteggio), Marca (checkbox brand), Prezzo (range slider PriceRangeSlider), Disponibilità ("Solo disponibili"), In offerta ("Solo promozione"). "Applica filtri"→aggiorna URL. "Reset". Mobile: drawer. Desktop: sidebar sinistra.

## C04: Price range slider
components/storefront/price-range-slider.tsx — Dual-thumb slider min/max. Input numerici sincronizzati. Props: min, max, currentMin, currentMax, onChange. Track grigio, range rosso, thumb bianchi bordo rosso.

## C05: Aggiornare pagina catalogo products/page.tsx
Layout: sidebar filtri 280px + area prodotti. Fetch brands, categorie, min/max prezzo per filtri. Nuovi searchParams: brand, minPrice, maxPrice, inStock, hasDiscount. Passare a getProducts() aggiornato (A14). Sottocategorie se cat selezionata ha figli. Selettore per-page 12|24|48. View toggle griglia/lista. Mobile: filtri drawer, griglia no sidebar.

## C06: View toggle griglia/lista
components/storefront/view-toggle.tsx — Icone griglia/lista. State in URL param view=grid|list. Lista: img piccola sx + info dx su una riga.

## C07: Quick view modal
components/storefront/quick-view-modal.tsx — Bottone "Anteprima" hover su ProductCard. Modal: immagine grande, nome, prezzo, stock, quantità, add to cart. Link dettagli. ESC chiude.

## C08: Refactor pagina prodotto products/[slug]/page.tsx
Layout: Sinistra ProductGallery (C09), Destra nome+prezzo+StockBadge+VariantSelector(C10)+QuantitySelector(C11)+AddToCart+WishlistButton(C14)+ShareButtons(C15). Sotto: ProductTabs(C12): Descrizione|Specifiche|Normativa|Recensioni. Sotto tabs: prodotti correlati. Breadcrumb migliorato: Home>{categoria}>{prodotto}. JSON-LD (da G stream). Recently viewed localStorage update.

## C09: Gallery prodotto interattiva
components/storefront/product-gallery.tsx — Props: images[]. Immagine principale grande. Thumbnails sotto: click cambia principale. Attiva: bordo rosso. Zoom: hover→scale 2x o lightbox fullscreen click. Swipe mobile. 0 immagini→placeholder.

## C10: Variant selector
components/storefront/variant-selector.tsx — Props: variants[], onSelect(variantId). Bottoni/chip selezionabili. Selezionata: bordo+sfondo rosso. Price_adjustment "+€50"/"-€20". stock=0: disabilitata barrata "Esaurito". Aggiorna prezzo totale. Default: nessuna selezionata.

## C11: Quantity selector
components/storefront/quantity-selector.tsx — Props: min=1, max(=stock), value, onChange. "−"|input|"+". Disabilita a min/max. Usato in: prodotto, quick view, cart items.

## C12: Product tabs
components/storefront/product-tabs.tsx — Client component tab attiva. Tab: "Descrizione"(rich_description), "Specifiche"(specifications JSONB→tabella key/value), "Normativa"(regulatory_info testo+icona warning sfondo giallo), "Recensioni"(ProductReviews). Tab senza contenuto: nascosta.

## C13: Product reviews + form
components/storefront/product-reviews.tsx — Rating medio stelle, distribuzione barre 1-5, lista reviews paginate. Ogni review: stelle, titolo, body, autore, data. Bottone "Scrivi recensione" (solo loggato).
components/storefront/review-form.tsx — Form: rating stelle cliccabili, titolo, body, submit. Server action createReview(). Messaggio post-submit "visibile dopo approvazione".

## C14: Wishlist button
components/storefront/wishlist-button.tsx — Cuore vuoto/pieno rosso. Toggle add/remove. Non loggato→redirect login. Server action. Usato in: prodotto, card hover.

## C15: Share buttons
components/storefront/share-buttons.tsx — Props: url, title. WhatsApp, Facebook, copia link clipboard. Icone piccole inline sotto add-to-cart.

## C16: Aggiornare add-to-cart-button.tsx
Props: productId, variantId (da VariantSelector, può null), quantity (da QuantitySelector, default 1). Server action riceve variantId+quantity. Toast "Prodotto aggiunto". Loading state. Disabilitato se stock=0.

## Criteri: Catalogo con immagini reali, filtri sidebar, vista toggle, per-page, sottocategorie, quick view. Prodotto: gallery click/zoom, varianti, quantità. Tabs, recensioni, wishlist, share, stock badges, breadcrumb con categoria. tsc zero errori.
