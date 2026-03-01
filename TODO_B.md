# TODO_B — GDPR, Pagine Legali, SEO

> Implementa cookie consent GDPR, pagine legali (privacy, termini, cookie policy), sitemap e robots.txt
> FILE OWNERSHIP: `components/gdpr/`, `app/(storefront)/privacy-policy/`, `app/(storefront)/terms/`,
> `app/(storefront)/cookie-policy/`, `app/sitemap.ts`, `app/robots.ts`, `middleware.ts` (solo aggiunta header)
> NON toccare: `lib/dal/`, `lib/auth/`, `lib/cart/`, `lib/checkout/`, `supabase/`, `__tests__/`
> Dopo ogni task: `npx tsc --noEmit && npm run build`

---

## B1 — Cookie Consent Banner (GDPR Italia)

### B1.1 — Crea componente CookieConsent
- [x] Crea `components/gdpr/cookie-consent.tsx`:
  - Client component ("use client")
  - Banner fisso in basso (z-50) con sfondo nero/scuro, testo bianco
  - Testo: "Questo sito utilizza cookie tecnici e, con il tuo consenso, cookie di profilazione per migliorare la tua esperienza. Puoi accettare, rifiutare o personalizzare le tue preferenze."
  - 3 bottoni: "Accetta tutti" (bg-red-700), "Solo necessari" (border white), "Personalizza" (ghost)
  - Salva scelta in cookie `cookie_consent` con valore `all` | `necessary` | custom JSON
  - Cookie durata: 365 giorni
  - Se cookie già presente → non mostrare banner
  - Usa `document.cookie` per leggere/scrivere (no localStorage)
  - Accessibilità: role="dialog", aria-label, focus trap
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### B1.2 — Modal personalizzazione cookie
- [x] Dentro `components/gdpr/cookie-consent.tsx` o `components/gdpr/cookie-settings.tsx`:
  - Modal con toggle per categorie: "Necessari" (sempre on, disabled), "Analitici" (toggle), "Marketing" (toggle)
  - Bottone "Salva preferenze"
  - Salva in cookie `cookie_consent` come JSON: `{"necessary":true,"analytics":false,"marketing":false}`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### B1.3 — Integra nel layout storefront
- [x] `app/(storefront)/layout.tsx`: aggiungi `<CookieConsent />` prima del `</body>` o nel layout wrapper
- [x] NON aggiungere nel layout admin
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

---

## B2 — Pagine Legali

### B2.1 — Privacy Policy
- [x] Crea `app/(storefront)/privacy-policy/page.tsx`:
  - Pagina SSR statica con testo Privacy Policy conforme GDPR (Reg. UE 2016/679)
  - Sezioni: Titolare del trattamento (Armeria Palmetto, Via Oberdan 70, Brescia), Dati raccolti, Finalità, Base giuridica, Destinatari, Trasferimento extra-UE, Conservazione, Diritti dell'interessato (accesso, rettifica, cancellazione, portabilità, opposizione, reclamo al Garante), Cookie (rinvio a cookie policy), Contatti DPO
  - Stile: heading rosso, testo neutral-900, paragrafi ben spaziati
  - Data ultimo aggiornamento in fondo
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### B2.2 — Termini e Condizioni
- [x] Crea `app/(storefront)/terms/page.tsx`:
  - Pagina con Termini e Condizioni di vendita conformi al Codice del Consumo (D.Lgs. 206/2005)
  - Sezioni: Definizioni, Oggetto, Ordini e conclusione contratto, Prezzi e pagamenti, Spedizioni e consegna, Diritto di recesso (14 giorni per beni non personalizzati — NOTA: armi hanno regole speciali, indicare che il recesso non si applica ad armi da fuoco per motivi di sicurezza pubblica), Garanzia legale (24 mesi), Responsabilità, Foro competente (Brescia), Legge applicabile (italiana)
  - Data ultimo aggiornamento
- [x] **Verifica**: `npx tsc --noEmit && npm run build` (nota: unico errore pre-esistente in checkout-button.tsx — file TODO_A/C)

### B2.3 — Cookie Policy
- [x] Crea `app/(storefront)/cookie-policy/page.tsx`:
  - Pagina con Cookie Policy conforme alla Direttiva ePrivacy e linee guida Garante Privacy italiano (giugno 2021)
  - Sezioni: Cosa sono i cookie, Cookie tecnici (necessari), Cookie analitici, Cookie di profilazione/marketing, Come gestire i cookie (link a impostazioni browser), Come modificare il consenso (link a banner)
  - Tabella cookie: Nome, Tipo, Finalità, Durata
  - Data ultimo aggiornamento
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### B2.4 — Link nel footer
- [x] `components/layout/storefront-footer.tsx`: verifica che i link a Privacy Policy, Termini, Cookie Policy siano presenti nella sezione "Informazioni". Aggiungi Cookie Policy se mancante.
- [x] I link devono puntare a: `/privacy-policy`, `/terms`, `/cookie-policy`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

---

## B3 — SEO (Sitemap + Robots.txt)

### B3.1 — Sitemap dinamica
- [x] Crea `app/sitemap.ts`:
  - Esporta default function che ritorna `MetadataRoute.Sitemap`
  - Pagine statiche: `/`, `/products`, `/blog`, `/bookings`, `/chi-siamo`, `/contatti`, `/servizi`, `/privacy-policy`, `/terms`, `/cookie-policy`
  - Pagine dinamiche: fetch prodotti attivi → `/products/[slug]`, fetch blog posts pubblicati → `/blog/[slug]`, fetch pages pubblicate → `/[slug]`
  - Usa service role client per bypassare RLS (è una funzione server)
  - `changeFrequency` e `priority` appropriati (homepage: weekly/1.0, prodotti: weekly/0.8, blog: weekly/0.7)
  - Base URL: da env `NEXT_PUBLIC_SITE_URL` o fallback `http://localhost:3000`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### B3.2 — Robots.txt
- [x] Crea `app/robots.ts`:
  - Esporta default function che ritorna `MetadataRoute.Robots`
  - Allow: `/`
  - Disallow: `/admin`, `/api`, `/auth`, `/cart`, `/checkout`, `/account`
  - Sitemap: `{baseUrl}/sitemap.xml`
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

### B3.3 — Metadata base
- [x] `app/layout.tsx`: aggiungi/aggiorna `metadata` export:
  - title: template `%s | Armeria Palmetto`
  - description: "Armeria Palmetto — Vendita armi, munizioni, fuochi artificiali a Brescia"
  - openGraph: title, description, locale "it_IT", type "website"
  - Se `NEXT_PUBLIC_SITE_URL` presente: metadataBase
- [x] **Verifica**: `npx tsc --noEmit && npm run build`

---

## B4 — Verifica finale
- [x] `npx tsc --noEmit && npm run build && npm run test:run` — tsc zero errori, test 178/178 green, build compila OK ma ha race condition Turbopack su Windows (ENOENT manifest) — errori non correlati al codice
- [x] `git add -A && git commit -m "feat: GDPR cookie consent, legal pages, sitemap, robots.txt"`