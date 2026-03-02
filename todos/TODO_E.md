# TODO_E — Account Utente, Profilo & Wishlist
# Total tasks: 10
# File ownership ESCLUSIVA:
# - app/(storefront)/account/page.tsx
# - app/(storefront)/account/profile/page.tsx, wishlist/page.tsx, addresses/page.tsx, bookings/page.tsx, bookings/[id]/page.tsx (NUOVI)
# - app/(storefront)/account/layout.tsx (NUOVO)
# - components/storefront/account-sidebar.tsx, profile-form.tsx, address-form.tsx (NUOVI)
# - lib/auth/actions.ts (solo aggiunta changePassword)
# - lib/validators/profile.ts (aggiunta schema changePassword)

## E01: Account layout con sidebar
app/(storefront)/account/layout.tsx — Sidebar sinistra desktop / tabs mobile. components/storefront/account-sidebar.tsx — Sezioni: Profilo, Ordini, Prenotazioni, Wishlist, Indirizzi. Icone Lucide. Active link.

## E02: Account page come dashboard
app/(storefront)/account/page.tsx — Card riassuntive: Profilo(nome,email→Modifica), Ordini(ultimi 3→Vedi tutti), Prenotazioni(prossima→Vedi tutte), Wishlist(N prodotti→Vedi), Indirizzi(default→Gestisci). 2 colonne desktop.

## E03: Modifica profilo + cambio password
app/(storefront)/account/profile/page.tsx + components/storefront/profile-form.tsx
Sezione 1 "Dati personali": full_name, phone, avatar upload. Server action updateProfile→UPDATE profiles.
Sezione 2 "Cambia password": password attuale, nuova, conferma. Min 8 chars, match. Server action changePassword() in lib/auth/actions.ts→supabase.auth.updateUser({password}). Toast feedback.

## E04: Pagina wishlist
app/(storefront)/account/wishlist/page.tsx — getUserWishlist con join prodotto (nome,prezzo,immagine,stock). Griglia con "Rimuovi" e "Aggiungi carrello". Vuota: CTA catalogo. Paginazione. Server actions remove/addToCart.

## E05: Gestione indirizzi
app/(storefront)/account/addresses/page.tsx + components/storefront/address-form.tsx — Lista card indirizzo con label, indirizzo, badge Default. Bottoni: Modifica(modal), Elimina(conferma), Default. "Aggiungi indirizzo" form. Campi: label, full_name, phone, street, city, province, postal_code, country. Max 5.

## E06: Prenotazioni utente
app/(storefront)/account/bookings/page.tsx — Lista con data, orario, servizio(join), stato badge. Future con status pending/confirmed: bottone "Cancella". Cancella→confirm dialog→cancelBooking() (A16). Solo se >=24h. <24h: disabilitato+tooltip. Paginazione.

## E07: Dettaglio prenotazione
app/(storefront)/account/bookings/[id]/page.tsx — Servizio(nome,desc,durata,prezzo), data, orario, stato, note. Timeline: pending→confirmed→completed/cancelled. Se cancellabile: bottone. Link "Prenota nuovo".

## E08: Logout visibile
In account sidebar: bottone "Esci" in fondo. Server action signOut()→redirect home.

## E09: Avatar upload
In profile-form.tsx: avatar attuale o placeholder iniziali. Click upload via /api/media/upload. Salva URL profiles.avatar_url. Mostrare nell'header accanto icona account se loggato.

## E10: Welcome email alla registrazione
In auth/register/: dopo registrazione, se email configurata (lib/email), inviare welcome. Se non configurata: skip con log.

## Criteri: Account sidebar, dashboard card, modifica profilo, cambio password, wishlist CRUD, indirizzi CRUD+default, prenotazioni cancellabili 24h, logout, avatar. tsc zero errori.
