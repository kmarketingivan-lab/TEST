# GUIDA SETUP SERVIZI ESTERNI — Armeria Palmetto
> Aggiornata a marzo 2026. Supabase e Vercel già configurati.
> Stima totale: 2-3 ore (escluso KYC Stripe che richiede giorni)

---

## 🟢 COSA È GRATIS (free tier permanente)

| Servizio | Piano gratuito include | Limite |
|----------|----------------------|--------|
| **Supabase** (già hai) | 500MB DB, 1GB storage, 50.000 utenti/mese | 2 progetti attivi |
| **Vercel** (già hai) | Deploy illimitati, 100GB bandwidth/mese | 1 membro team |
| **Resend** | 3.000 email/mese, 1 dominio | 100 email/giorno |
| **Upstash Redis** | 10.000 comandi/giorno, 256MB | 1 database |
| **Sentry** | 5.000 errori/mese, 10.000 performance traces | 1 progetto |
| **Stripe** | Nessun costo fisso | 1.5% + 0.25€ per transazione (EU) |

---

## STEP 1 — STRIPE
> ⚠️ Inizia subito: il KYC per armeria può richiedere 3-7 giorni lavorativi.
> Costo: GRATIS da aprire. Paghi solo quando incassi (1.5% + 0.25€/transazione EU).

### 1.1 Crea l'account
1. Vai su **https://stripe.com/it** → clic "Inizia ora"
2. Inserisci email, nome, password → "Crea account"
3. Verifica email (controlla spam)

### 1.2 Attiva l'account (KYC — obbligatorio per incassare)
1. Nel dashboard Stripe, clicca il banner arancione **"Attiva il tuo account"** in alto
2. Seleziona **"Attività esistente"**
3. Tipo di attività: **"Persona fisica / Ditta individuale"** oppure **"Società"** a seconda della tua forma giuridica
4. Codice ATECO: cerca **"4778"** (commercio al dettaglio di altri prodotti in esercizi specializzati)
5. Compila:
   - Dati azienda: Ragione sociale, P.IVA, indirizzo (Via Oberdan 70, 25121 Brescia)
   - Dati personali titolare: nome, cognome, data nascita, codice fiscale
   - Documento identità (carica fronte/retro carta d'identità o passaporto)
   - IBAN conto bancario italiano (per i pagamenti)
6. Clicca **"Invia per la revisione"**

### 1.3 Contattare Stripe Support per armeria (FONDAMENTALE)
La vendita di armi è una categoria "restricted business" per Stripe.
PRIMA di ricevere pagamenti reali devi ottenere l'approvazione esplicita.

1. Dopo aver completato il KYC, vai su **https://support.stripe.com** → "Contattaci"
2. Seleziona: **"Il mio account"** → **"Conformità e attività vietate"**
3. Scrivi questo messaggio (copia e adatta):

```
Oggetto: Richiesta approvazione armeria licenziata - Art. 47 TULPS

Gentili Signori,
ho appena attivato l'account Stripe per Armeria Palmetto (P.IVA: XXXXXXXX),
armeria regolarmente licenziata ai sensi dell'art. 31 TULPS (licenza Prefettura di Brescia n. XXXXX)
e dell'art. 47 TULPS per la vendita di articoli pirotecnici.

L'attività di e-commerce riguarderà:
- Vendita di armi comuni da sparo con ritiro OBBLIGATORIO in negozio
  (conformemente all'art. 17 L. 110/1975 — nessuna spedizione a privati)
- Vendita di fuochi artificiali cat. F1/F2/F3 con spedizione tramite corriere ADR

Allego copia della licenza Prefettura e della licenza TULPS art. 47.
Potete contattarmi per qualsiasi chiarimento.

Cordiali saluti,
[NOME] — Armeria Palmetto
Tel: [TELEFONO]
```

4. Allega PDF della licenza commerciale
5. Attendi risposta (solitamente 2-5 giorni lavorativi)

### 1.4 Ottieni le chiavi API (dopo approvazione)
1. Dashboard Stripe → **"Sviluppatori"** (menu in alto a destra)
2. → **"Chiavi API"**
3. Copia:
   - **Chiave pubblica**: inizia con `pk_live_...`
   - **Chiave segreta**: clicca "Mostra la chiave live" → inizia con `sk_live_...`
   - ⚠️ La chiave segreta si vede una sola volta: copiala subito in un posto sicuro

### 1.5 Configura il Webhook (dopo il deploy su Vercel)
> Fai questo DOPO aver fatto il deploy e avere il dominio live.

1. Dashboard Stripe → **"Sviluppatori"** → **"Webhook"**
2. Clicca **"Aggiungi endpoint"**
3. URL endpoint: `https://tuodominio.it/api/stripe/webhook`
4. Clicca **"Seleziona eventi"** → cerca e seleziona:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
5. Clicca **"Aggiungi endpoint"**
6. Nella pagina del webhook appena creato → clicca **"Mostra"** sotto "Signing secret"
7. Copia: inizia con `whsec_...`

---

## STEP 2 — RESEND (EMAIL)
> Gratis fino a 3.000 email/mese. Sufficiente per iniziare.

### 2.1 Crea account
1. Vai su **https://resend.com** → "Sign up"
2. Registrati con Google o email
3. Verifica email

### 2.2 Aggiungi il dominio (necessario per non finire in spam)
1. Dashboard Resend → menu sinistro → **"Domains"** → **"Add Domain"**
2. Inserisci il tuo dominio (es. `armeriapalmetto.it`)
3. Resend ti mostra 3 record DNS da aggiungere:
   - 1 record **TXT** (verifica dominio)
   - 2 record **MX** (per la ricezione — opzionali se usi già un altro provider email)
   - 1 record **DKIM** (firma email, fondamentale per evitare spam)
4. Vai sul pannello del tuo **registrar DNS** (es. Aruba, Register.it, GoDaddy):
   - Aggiungi i record esattamente come indicati da Resend
5. Torna su Resend → clicca **"Verify Domain"**
   - La verifica può richiedere fino a 24h (di solito pochi minuti)

### 2.3 Ottieni la API Key
1. Dashboard Resend → menu sinistro → **"API Keys"** → **"Create API Key"**
2. Nome: `armeria-palmetto-prod`
3. Permessi: **"Sending access"**
4. Clicca **"Add"** → copia la chiave (inizia con `re_...`)
   - ⚠️ Si vede una sola volta

### 2.4 Aggiorna l'indirizzo mittente nel codice
Il codice usa già `noreply@armeriapalmetto.it` — se il tuo dominio è diverso,
Ralph aggiornerà `lib/email/send.ts` nella Fase L1.

---

## STEP 3 — UPSTASH REDIS (RATE LIMITING)
> Gratis fino a 10.000 comandi/giorno. Più che sufficiente.
> Serve per il rate limiting (protezione da attacchi brute force su login e checkout).

### 3.1 Crea account
1. Vai su **https://upstash.com** → "Sign Up"
2. Registrati con Google o GitHub (più veloce)

### 3.2 Crea il database Redis
1. Dashboard Upstash → **"Create Database"**
2. Impostazioni:
   - Nome: `palmetto-ratelimit`
   - Tipo: **"Regional"** (non Global — costa meno)
   - Regione: **"EU-West-1 (Ireland)"** — la più vicina all'Italia
   - TLS: ✅ abilitato
3. Clicca **"Create"**

### 3.3 Ottieni le credenziali
1. Nella pagina del database appena creato, scorri fino a **"REST API"**
2. Copia:
   - **UPSTASH_REDIS_REST_URL**: es. `https://eu1-xxxxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: stringa lunga che inizia con `AXXx...`

---

## STEP 4 — SENTRY (MONITORING ERRORI)
> Gratis fino a 5.000 errori/mese. Sufficiente per un'armeria.

### 4.1 Crea account
1. Vai su **https://sentry.io** → "Get Started"
2. Registrati con GitHub o email

### 4.2 Crea il progetto
1. Dashboard Sentry → **"Projects"** → **"Create Project"**
2. Seleziona piattaforma: **"Next.js"** (c'è l'icona)
3. Alert frequency: **"Alert me on every new issue"**
4. Nome progetto: `armeria-palmetto`
5. Clicca **"Create Project"**

### 4.3 Ottieni il DSN
1. Nella pagina che si apre dopo la creazione, cerca **"DSN"**
   (oppure: Settings → Projects → armeria-palmetto → Client Keys → DSN)
2. Copia: es. `https://abc123@o123456.ingest.sentry.io/789`
3. **IGNORA** le istruzioni di configurazione che Sentry ti mostra — Ralph lo fa con i comandi del TODO

---

## STEP 5 — SUPABASE CLOUD (già hai l'account — solo setup progetto prod)

### 5.1 Crea il progetto di produzione
1. Vai su **https://app.supabase.com** → **"New project"**
2. Impostazioni:
   - Organization: la tua
   - Nome: `armeria-palmetto-prod`
   - Database Password: genera una password forte (salvala!) — es. con `openssl rand -base64 24`
   - Regione: **"West EU (Ireland)"** — la più vicina
   - Plan: **Free** per iniziare (poi puoi upgradare)
3. Clicca **"Create new project"** — attendi 2-3 minuti

### 5.2 Ottieni le chiavi
1. Progetto Supabase → menu sinistro → **"Project Settings"** → **"API"**
2. Copia:
   - **Project URL**: es. `https://abcdefgh.supabase.co`
   - **anon / public key**: chiave lunga JWT (inizia con `eyJ...`)
   - **service_role key**: clicca "Reveal" → copia (inizia con `eyJ...`) — ⚠️ tienila segreta

### 5.3 Applica le migrazioni
> Fai questo DOPO aver copiato le chiavi e DOPO che Ralph ha completato le Fasi L1-L2
> (che aggiungono 2 nuove migrazioni SQL)

```powershell
cd C:\Users\cresc\Projects\my-ecommerce-v2

# Collega il progetto locale al progetto cloud
npx supabase link --project-ref [IL-TUO-PROJECT-REF]
# Il project-ref lo trovi nell'URL: https://app.supabase.com/project/[PROJECT-REF]

# Applica tutte le 29 migrazioni
npx supabase db push

# Verifica che siano tutte applicate
npx supabase migration list
```

---

## STEP 6 — VERCEL (già hai l'account — solo deploy)
> Fai questo PER ULTIMO, dopo aver completato tutti gli step precedenti
> e dopo che Ralph ha completato tutte le fasi del TODO_LIVE.

### 6.1 Collega il repository
1. Vai su **https://vercel.com/dashboard** → **"Add New..."** → **"Project"**
2. **"Import Git Repository"** → collega GitHub se non l'hai già fatto
3. Trova il repo `my-ecommerce-v2` → clicca **"Import"**
4. Framework Preset: Vercel lo rileva automaticamente come **Next.js** ✅
5. **NON cliccare ancora "Deploy"** — prima aggiungi le variabili d'ambiente

### 6.2 Aggiungi variabili d'ambiente
1. Nella pagina di configurazione del progetto → sezione **"Environment Variables"**
2. Aggiungi TUTTE queste variabili (una alla volta, seleziona "Production"):

| Nome variabile | Valore |
|----------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role) |
| `HMAC_SECRET` | output di: `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (dopo aver creato il webhook) |
| `RESEND_API_KEY` | `re_...` |
| `UPSTASH_REDIS_REST_URL` | `https://eu1-xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `AXXx...` |
| `SENTRY_DSN` | `https://abc@sentry.io/123` |
| `NEXT_PUBLIC_SITE_URL` | `https://tuodominio.it` |

3. Clicca **"Deploy"**

### 6.3 Collega il dominio custom
1. Vercel dashboard → progetto → **"Settings"** → **"Domains"**
2. Inserisci il tuo dominio (es. `armeriapalmetto.it`) → **"Add"**
3. Vercel ti mostra 2 record DNS da aggiungere:
   - Record **A**: `76.76.21.21`
   - Record **CNAME**: `cname.vercel-dns.com`
4. Vai sul tuo registrar DNS e aggiungi questi record
5. Attendi propagazione DNS (da pochi minuti a 24h)
6. Vercel mostra ✅ verde quando il dominio è attivo con SSL

---

## RIEPILOGO CHIAVI DA RACCOGLIERE

Crea un file sicuro (es. su Bitwarden o 1Password) con queste chiavi.
Una volta raccolte tutte, dimmi e Ralph aggiornerà `.env.local` e creerà `.env.production`.

```
NEXT_PUBLIC_SUPABASE_URL=           ← Supabase: Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      ← Supabase: Project Settings → API → anon key
SUPABASE_SERVICE_ROLE_KEY=          ← Supabase: Project Settings → API → service_role key
HMAC_SECRET=                        ← genera con: openssl rand -base64 32
STRIPE_SECRET_KEY=                  ← Stripe: Sviluppatori → Chiavi API → sk_live_...
STRIPE_PUBLISHABLE_KEY=             ← Stripe: Sviluppatori → Chiavi API → pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= ← stesso valore di STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=              ← Stripe: Sviluppatori → Webhook → Signing secret
RESEND_API_KEY=                     ← Resend: API Keys → re_...
UPSTASH_REDIS_REST_URL=             ← Upstash: REST API → URL
UPSTASH_REDIS_REST_TOKEN=           ← Upstash: REST API → Token
SENTRY_DSN=                         ← Sentry: Project Settings → Client Keys → DSN
NEXT_PUBLIC_SITE_URL=               ← il tuo dominio: https://armeriapalmetto.it
```

---

## COSTI MENSILI STIMATI (a regime)

| Servizio | Piano | Costo |
|----------|-------|-------|
| Supabase | Free (o Pro se superi i limiti) | €0 / €25/mese |
| Vercel | Free (o Pro se superi i limiti) | €0 / €20/mese |
| Resend | Free | €0 |
| Upstash Redis | Free | €0 |
| Sentry | Free | €0 |
| Stripe | Per transazione | 1.5% + €0.25 per ordine |
| **Totale fisso** | | **€0 per iniziare** |

Per un e-commerce piccolo/medio, puoi restare sul free tier di tutto
finché non superi i volumi indicati.
