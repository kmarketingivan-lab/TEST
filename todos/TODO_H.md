# TODO_H — Admin Panel Miglioramenti
# Total tasks: 12
# File ownership ESCLUSIVA:
# - app/(admin)/admin/page.tsx
# - app/(admin)/admin/coupons/, brands/, reviews/, newsletter/, shipping/ (NUOVE dir)
# - app/(admin)/admin/orders/page.tsx, orders/[id]/page.tsx
# - app/(admin)/admin/products/page.tsx, products/[id]/ (edit form)
# - components/layout/admin-sidebar.tsx
# - components/admin/sales-chart.tsx, low-stock-alert.tsx, bulk-actions.tsx, export-button.tsx (NUOVI)
# - app/api/admin/export/orders/route.ts, products/route.ts (NUOVI)
# - lib/dal/analytics.ts (NUOVO, owned da H)

## H01: Dashboard grafici vendite
components/admin/sales-chart.tsx — Grafico linea revenue 30gg, grafico barre ordini per stato. Libreria: recharts (npm install se necessario). lib/dal/analytics.ts: getRevenueByDay(days), getOrdersByStatus(), getTopProducts(limit). In admin/page.tsx sotto card KPI.

## H02: Low stock alerts
components/admin/low-stock-alert.tsx — Query prodotti stock_quantity>0 AND <=low_stock_threshold (o <=5). Lista nome, stock, threshold, link modifica. Banner warning giallo in dashboard. Se nessuno: non mostrare.

## H03: Admin sidebar nuove voci
admin-sidebar.tsx: Aggiungere: "Marchi" /admin/brands (Tag), "Coupon" /admin/coupons (Ticket), "Recensioni" /admin/reviews (Star), "Newsletter" /admin/newsletter (Mail), "Spedizioni" /admin/shipping (Truck). Raggruppare: Catalogo(Prodotti,Categorie,Marchi), Vendite(Ordini,Coupon,Spedizioni), Contenuti(Blog,Pagine,Media), Clienti(Recensioni,Newsletter), Sistema(Impostazioni).

## H04: CRUD Brands admin
admin/brands/page.tsx: lista tabella (nome,slug,logo,prodotti count,attivo,azioni). new/page.tsx: form (name,slug auto,logo upload,website,sort_order,is_active). [id]/edit/page.tsx: form modifica. Server actions create/update/deleteBrand (DAL A13).

## H05: CRUD Coupons admin
admin/coupons/page.tsx: lista (codice,tipo,valore,min ordine,usi/max,scadenza,attivo,azioni). new/page.tsx: form (code auto-generabile, discount_type select, discount_value, min_order_amount, max_uses, starts_at date, expires_at date, is_active). [id]/edit/page.tsx. Validazione percentage<=100.

## H06: Gestione recensioni
admin/reviews/page.tsx: lista filtri (tutte,attesa,approvate). Tabella: prodotto, autore, rating stelle, titolo, data, stato, azioni. "Approva"(is_approved=true), "Rifiuta"(delete), "Vedi prodotto". Badge "In attesa" sidebar.

## H07: Gestione newsletter
admin/newsletter/page.tsx: lista (email,nome,data,attivo). Conteggio attivi. "Esporta CSV". Azione disattiva/riattiva.

## H08: Shipping zones admin
admin/shipping/page.tsx: lista (nome,paesi,flat rate,free sopra,attiva). new/page.tsx + [id]/edit/page.tsx: form (name,countries,flat_rate,min_order_free_shipping,per_kg_rate,is_active).

## H09: Export ordini CSV/Excel
components/admin/export-button.tsx: bottone "Esporta" dropdown CSV/Excel. api/admin/export/orders/route.ts: GET format/dateFrom/dateTo/status. Colonne: order_number,date,email,status,subtotal,tax,shipping,discount,total. Auth admin. Content-Disposition attachment.

## H10: Export prodotti CSV
api/admin/export/products/route.ts: simile H09. Colonne: name,sku,price,compare_at_price,stock,category,brand,is_active.

## H11: Bulk actions prodotti
components/admin/bulk-actions.tsx: Checkbox ogni riga + "Seleziona tutti". Barra azioni: "Attiva"|"Disattiva"|"Elimina". Conferma dialog. Server action bulkUpdateProducts/bulkDeleteProducts. Integrare in admin/products/page.tsx.

## H12: Admin prodotti — specifications + regulatory_info
Form prodotto admin: Sezione "Specifiche tecniche" editor JSONB key/value dinamico. "Aggiungi specifica"→riga (key+value input). Suggeriti: Calibro, Lunghezza canna, Peso, Capacità, Tipo azione, Materiale. Rimuovi con X. Sezione "Info normativa": textarea regulatory_info. Sezione "Marca": select dropdown brands. Salvare JSONB+TEXT+UUID.

## Criteri: Dashboard grafici+low stock, sidebar completa, CRUD brands/coupons/reviews/newsletter/shipping, export CSV ordini+prodotti, bulk actions, form prodotto con specs/normativa/brand. tsc zero errori.
