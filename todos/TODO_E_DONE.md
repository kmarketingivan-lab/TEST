# TODO_E — COMPLETATO
# Stream E: Account Utente, Profilo & Wishlist
# Tutte le 10 task (E01–E10) completate. tsc zero errori nei file di ownership.

## E01: Account layout con sidebar ✅
- Creato `app/(storefront)/account/layout.tsx` — layout con sidebar desktop + tabs mobile
- Creato `components/storefront/account-sidebar.tsx` — navigazione: Profilo, Ordini, Prenotazioni, Wishlist, Indirizzi
- Icone Lucide, active link con `usePathname()`

## E02: Account page come dashboard ✅
- Riscritto `app/(storefront)/account/page.tsx` — card riassuntive 2 colonne
- Profilo (nome, email → Modifica), Ordini (ultimi 3 → Vedi tutti), Prenotazioni (prossima → Vedi tutte), Wishlist (N prodotti → Vedi), Indirizzi (→ Gestisci)

## E03: Modifica profilo + cambio password ✅
- Creato `app/(storefront)/account/profile/page.tsx` — pagina profilo
- Creato `components/storefront/profile-form.tsx` — form dati personali (full_name, phone, avatar) + form cambio password
- Aggiunto `changePassword()` in `lib/auth/actions.ts` — verifica password attuale via signInWithPassword, poi updateUser
- Aggiunto `changePasswordSchema` in `lib/validators/profile.ts` — current_password, new_password, confirm_password con refine match
- Creato `app/api/account/profile/route.ts` — PUT per aggiornamento profilo

## E04: Pagina wishlist ✅
- Creato `app/(storefront)/account/wishlist/page.tsx` — griglia prodotti con join (nome, prezzo, immagine, stock)
- Creato `app/(storefront)/account/wishlist/wishlist-items.tsx` — client component con "Rimuovi" e "Aggiungi carrello"
- CTA catalogo se vuota, paginazione
- Creato `app/api/account/wishlist/[id]/route.ts` — DELETE per rimozione

## E05: Gestione indirizzi ✅
- Creato `app/(storefront)/account/addresses/page.tsx` — lista indirizzi
- Creato `app/(storefront)/account/addresses/address-list.tsx` — client component con card, badge Default, bottoni Modifica/Elimina/Default
- Creato `components/storefront/address-form.tsx` — modal form (label, full_name, phone, street, city, province, postal_code, country)
- Max 5 indirizzi, primo indirizzo auto-default
- API routes: POST `/api/account/addresses`, PUT/DELETE `/api/account/addresses/[id]`, PUT `/api/account/addresses/[id]/default`

## E06: Prenotazioni utente ✅
- Creato `app/(storefront)/account/bookings/page.tsx` — lista con data, orario, servizio (join), stato badge
- Bottone "Cancella" per future con status pending/confirmed e >=24h
- <24h: disabilitato con tooltip
- Paginazione
- Creato `app/(storefront)/account/bookings/booking-actions.tsx` — client component cancellazione
- Creato `app/api/account/bookings/[id]/cancel/route.ts` — PUT con verifica 24h

## E07: Dettaglio prenotazione ✅
- Creato `app/(storefront)/account/bookings/[id]/page.tsx`
- Servizio (nome, desc, durata, prezzo), data, orario, stato, note
- Timeline: pending → confirmed → completed, oppure cancelled
- Bottone cancella se >=24h, link "Prenota nuovo"

## E08: Logout visibile ✅
- Bottone "Esci" nella sidebar con icona LogOut, separato da border-top
- Creato `/api/account/signout/route.ts` — signout via API per redirect a home (non admin)
- Presente sia in desktop sidebar che in mobile tabs

## E09: Avatar upload ✅
- In `profile-form.tsx`: avatar attuale (immagine rotonda) o placeholder con iniziali
- Upload via `ImageUpload` → `/api/media/upload` con folder "avatars"
- Salva URL in `profiles.avatar_url`
- Bottone rimuovi avatar

## E10: Welcome email alla registrazione ✅
- In `lib/auth/actions.ts` signUp: dopo registrazione, chiama `sendWelcomeEmail()` (non-blocking con `void`)
- `sendWelcomeEmail` in `lib/email/send.ts` verifica `isEmailConfigured()`, se non configurata: skip con log
- Template welcome già esistente in `lib/email/templates/welcome.ts`

## File creati/modificati:
- `app/(storefront)/account/layout.tsx` (NUOVO)
- `app/(storefront)/account/page.tsx` (MODIFICATO)
- `app/(storefront)/account/profile/page.tsx` (NUOVO)
- `app/(storefront)/account/wishlist/page.tsx` (NUOVO)
- `app/(storefront)/account/wishlist/wishlist-items.tsx` (NUOVO)
- `app/(storefront)/account/addresses/page.tsx` (NUOVO)
- `app/(storefront)/account/addresses/address-list.tsx` (NUOVO)
- `app/(storefront)/account/bookings/page.tsx` (NUOVO)
- `app/(storefront)/account/bookings/booking-actions.tsx` (NUOVO)
- `app/(storefront)/account/bookings/[id]/page.tsx` (NUOVO)
- `components/storefront/account-sidebar.tsx` (NUOVO)
- `components/storefront/profile-form.tsx` (NUOVO)
- `components/storefront/address-form.tsx` (NUOVO)
- `lib/auth/actions.ts` (MODIFICATO — aggiunto changePassword + welcome email)
- `lib/validators/profile.ts` (MODIFICATO — aggiunto changePasswordSchema)
- `app/api/account/profile/route.ts` (NUOVO)
- `app/api/account/wishlist/[id]/route.ts` (NUOVO)
- `app/api/account/addresses/route.ts` (NUOVO)
- `app/api/account/addresses/[id]/route.ts` (NUOVO)
- `app/api/account/addresses/[id]/default/route.ts` (NUOVO)
- `app/api/account/bookings/[id]/cancel/route.ts` (NUOVO)
- `app/api/account/signout/route.ts` (NUOVO)
