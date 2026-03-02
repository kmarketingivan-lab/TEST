# TODO_H — COMPLETATO

Tutte le 12 task (H01-H12) sono state completate con successo.
tsc compila senza errori.

## H01: Dashboard grafici vendite ✅
- Creato `lib/dal/analytics.ts` con `getRevenueByDay()`, `getOrdersByStatus()`, `getTopProducts()`
- Creato `components/admin/sales-chart.tsx` — grafico linea revenue 30gg + grafico barre ordini per stato (recharts)
- Integrato in `app/(admin)/admin/page.tsx` sotto le card KPI + sezione "Prodotti più venduti"
- Installato `recharts` come dipendenza

## H02: Low stock alerts ✅
- Creato `components/admin/low-stock-alert.tsx` — lista prodotti con stock basso, banner warning giallo
- Query: prodotti attivi con stock_quantity > 0 e <= low_stock_threshold (o <= 5)
- Se nessun prodotto: componente non renderizzato
- Integrato nella dashboard admin

## H03: Admin sidebar nuove voci ✅
- Aggiornato `components/layout/admin-sidebar.tsx` con raggruppamenti:
  - Catalogo: Prodotti, Categorie, Marchi
  - Vendite: Ordini, Coupon, Spedizioni
  - Contenuti: Blog, Pagine, Media
  - Clienti: Recensioni, Newsletter
  - Sistema: Impostazioni
- Icone: Tag (Marchi), Ticket (Coupon), Star (Recensioni), Mail (Newsletter), Truck (Spedizioni)

## H04: CRUD Brands admin ✅
- `app/(admin)/admin/brands/page.tsx` — lista tabella (nome, slug, logo, prodotti count, attivo, azioni)
- `app/(admin)/admin/brands/new/page.tsx` — form creazione
- `app/(admin)/admin/brands/[id]/edit/page.tsx` — form modifica
- `app/(admin)/admin/brands/actions.ts` — createBrand, updateBrand, deleteBrand
- `app/(admin)/admin/brands/brand-form.tsx` — form condiviso con auto-slug
- `app/(admin)/admin/brands/brands-table.tsx` — tabella con DataTable

## H05: CRUD Coupons admin ✅
- `app/(admin)/admin/coupons/page.tsx` — lista (codice, tipo, valore, min ordine, usi/max, scadenza, attivo)
- `app/(admin)/admin/coupons/new/page.tsx` — form creazione
- `app/(admin)/admin/coupons/[id]/edit/page.tsx` — form modifica
- `app/(admin)/admin/coupons/actions.ts` — createCoupon, updateCoupon, deleteCoupon
- `app/(admin)/admin/coupons/coupon-form.tsx` — form con codice auto-generabile, validazione percentage <= 100
- `app/(admin)/admin/coupons/coupons-table.tsx` — tabella

## H06: Gestione recensioni ✅
- `app/(admin)/admin/reviews/page.tsx` — lista con filtri (tutte, in attesa, approvate)
- `app/(admin)/admin/reviews/reviews-table.tsx` — tabella con rating stelle, azioni approva/rifiuta/vedi prodotto
- `app/(admin)/admin/reviews/actions.ts` — approveReview, rejectReview

## H07: Gestione newsletter ✅
- `app/(admin)/admin/newsletter/page.tsx` — lista (email, nome, data, attivo) con conteggio attivi
- `app/(admin)/admin/newsletter/newsletter-list.tsx` — tabella con esporta CSV client-side, azione attiva/disattiva
- `app/(admin)/admin/newsletter/actions.ts` — toggleNewsletterSubscription

## H08: Shipping zones admin ✅
- `app/(admin)/admin/shipping/page.tsx` — lista (nome, paesi, flat rate, free sopra, attiva)
- `app/(admin)/admin/shipping/new/page.tsx` — form creazione
- `app/(admin)/admin/shipping/[id]/edit/page.tsx` — form modifica
- `app/(admin)/admin/shipping/actions.ts` — createShippingZone, updateShippingZone, deleteShippingZone
- `app/(admin)/admin/shipping/shipping-form.tsx` — form condiviso
- `app/(admin)/admin/shipping/shipping-table.tsx` — tabella

## H09: Export ordini CSV/Excel ✅
- `components/admin/export-button.tsx` — bottone con dropdown CSV/Excel
- `app/api/admin/export/orders/route.ts` — GET con filtri format/dateFrom/dateTo/status, Content-Disposition attachment
- Integrato in `app/(admin)/admin/orders/page.tsx`

## H10: Export prodotti CSV ✅
- `app/api/admin/export/products/route.ts` — colonne: name, sku, price, compare_at_price, stock, category, brand, is_active
- Integrato in `app/(admin)/admin/products/page.tsx` con ExportButton

## H11: Bulk actions prodotti ✅
- `components/admin/bulk-actions.tsx` — barra azioni con Attiva/Disattiva/Elimina + conferma dialog
- Server actions `bulkUpdateProducts`, `bulkDeleteProducts` in products/actions.ts
- DataTable con `selectable` + `onSelectionChange` in products-table.tsx

## H12: Admin prodotti — specifications + regulatory_info + brand ✅
- Product form aggiornato con:
  - Sezione "Specifiche tecniche": editor JSONB key/value dinamico con suggerimenti (Calibro, Lunghezza canna, Peso, Capacità, Tipo azione, Materiale)
  - Sezione "Info normativa": textarea regulatory_info
  - Sezione "Marca": select dropdown brands
- Server actions createProduct/updateProduct aggiornate per salvare specifications (JSONB), regulatory_info (TEXT), brand_id (UUID)
- Edit page aggiornata per caricare dati extra e brands
