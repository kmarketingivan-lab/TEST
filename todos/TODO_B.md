# TODO_B — Homepage, Navigation & Layout
# Total tasks: 16
# File ownership ESCLUSIVA:
# - app/(storefront)/page.tsx
# - components/layout/storefront-header.tsx, storefront-footer.tsx
# - components/layout/top-bar.tsx, mega-menu.tsx, search-modal.tsx (NUOVI)
# - components/storefront/newsletter-form.tsx, trust-badges.tsx, brand-carousel.tsx, hero-slider.tsx, recently-viewed.tsx (NUOVI)
# - app/not-found.tsx, app/(storefront)/layout.tsx

## B01: Hero section con immagine/slider
components/storefront/hero-slider.tsx — Client component con state per slide corrente. Supporto multiple slides: immagine sfondo, titolo, sottotitolo, CTA link. Autoplay 5s. Frecce + dots. Overlay scuro. Responsive full-width. Usare in page.tsx al posto dell'hero testuale. Dati slides hardcoded per ora.

## B02: Trust badges component
components/storefront/trust-badges.tsx — 4 badge: "Dal 1985" (calendar), "Spedizione gratuita sopra 150€" (truck), "Garanzia soddisfatti" (shield), "Assistenza specializzata" (headphones). Flex row desktop, 2x2 mobile. Icona rosso/oro + testo. SUBITO sotto hero.

## B03: Top bar sopra header
components/layout/top-bar.tsx — Barra slim h-8 bg-neutral-950 text-xs. Sinistra: telefono+email. Centro: promo. Destra: orari. hidden sm:flex. Integrare in layout.tsx sopra header.

## B04: Mega menu categorie
components/layout/mega-menu.tsx — Hover "Catalogo" → dropdown full-width. Colonne categorie padre con sottocategorie (figli via parent_id). Ultima colonna immagine promo. Click→/products?category={slug}. Riceve categories come prop. Fade-in animation. ESC/click fuori chiude.

## B05: Ricerca globale header
components/layout/search-modal.tsx — Icona lente nell'header → modal. Input debounce 300ms. Chiama searchProducts via server action. Risultati live: thumb+nome+prezzo (max 6). Link "Vedi tutti". Ctrl+K/Cmd+K shortcut. ESC chiude.

## B06: Refactor storefront-header.tsx
Importare MegaMenu al posto navLinks piatti desktop. Aggiungere Search icon→SearchModal. Ricevere categories come prop. Mobile: hamburger con categorie accordion. Ordine icone: Search|Cart|Account.

## B07: Aggiornare layout.tsx storefront
Fetch getCategoryTree() nel layout server component. Passare categories a StorefrontHeader. Aggiungere TopBar sopra header. Aggiungere RecentlyViewed prima del footer.

## B08: Homepage — novità
Nuova sezione "Nuovi arrivi" dopo "Prodotti in evidenza". Chiama getNewProducts(8) da A14. ProductCard grid. Link "Vedi tutti" → /products?sort=created_at&order=desc.

## B09: Homepage — brand
components/storefront/brand-carousel.tsx — Griglia/carousel loghi brand da getBrands(). Scroll orizzontale mobile, 6 col desktop. Link /products?brand={slug}. In homepage dopo novità.

## B10: Homepage — testimonianze
Sezione "Cosa dicono i nostri clienti". 3-4 testimonianze hardcoded. 3 colonne card con stelle gialle, testo, nome. Futuro: pull da reviews con rating>=4.

## B11: Homepage — info negozio
Sezione prima del footer. 2 colonne: sinistra info (indirizzo, orari, telefono, email da settings), destra mappa Google iframe/placeholder. Sfondo scuro.

## B12: Newsletter form
components/storefront/newsletter-form.tsx — Client component: input email + "Iscriviti". Server action chiama subscribe() (A12). Toast feedback. In homepage sezione dedicata + footer compatto.

## B13: Homepage — banner promozioni
Sezione "Offerte": query prodotti con compare_at_price IS NOT NULL. Se ci sono: banner + 4 prodotti scontati. Sfondo rosso scuro, badge OFFERTA.

## B14: Footer aggiornato
storefront-footer.tsx: aggiungere colonna "Il nostro negozio" (indirizzo, orari, mappa link), newsletter compatto, icone social (FB, IG, WhatsApp), badge pagamenti (Visa, MC, PayPal), P.IVA e REA. Da 3 a 4 colonne.

## B15: 404 personalizzata
app/not-found.tsx — Icona grande, "Pagina non trovata", sottotitolo, CTA home+catalogo, "Potrebbero interessarti" 4 prodotti featured.

## B16: Recently viewed
components/storefront/recently-viewed.tsx — Client component, localStorage [{productId,slug,name,price,imageUrl}]. Max 8. Barra scroll orizzontale mini card. In fondo pagina prodotto e homepage. Se vuoto: non render.

## Criteri: Homepage completa, header con top bar+mega menu+ricerca, footer 4 col, 404 custom, recently viewed. Mobile responsive. tsc zero errori.
