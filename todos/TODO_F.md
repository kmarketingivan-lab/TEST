# TODO_F — Blog, Prenotazioni & Contenuti
# Total tasks: 10
# File ownership ESCLUSIVA:
# - app/(storefront)/blog/page.tsx, blog/[slug]/page.tsx, blog/tag/[tag]/page.tsx(NUOVO)
# - app/(storefront)/bookings/page.tsx
# - components/storefront/booking-wizard.tsx, booking-form.tsx, booking-calendar.tsx
# - components/storefront/blog-sidebar.tsx, blog-search.tsx, related-posts.tsx (NUOVI)

## F01: Filtro tag e ricerca blog
blog/page.tsx: Sopra griglia barra ricerca (input→searchParam search) + chip tag più usati (→searchParam tag). Leggere searchParams tag, search, page. Passare a getPublishedPosts({tag, search, page}) aggiornato (A15). "Risultati per tag/ricerca". Reset link.

## F02: Blog sidebar
components/storefront/blog-sidebar.tsx — Per pagina singola post. "Articoli popolari" top 5 views (getPopularPosts A15). "Tags" cloud/lista link /blog?tag={tag}. "Cerca" form compatto. Sidebar destra desktop, sotto contenuto mobile.

## F03: Blog post miglioramenti
blog/[slug]/page.tsx: Sotto titolo autore (fetch profilo author_id→nome+avatar) + data. incrementViews(postId) al caricamento (A15). Dopo contenuto: "Articoli correlati" 3 post (getRelatedPosts A15). BlogSidebar (F02). Tags cliccabili→/blog?tag={tag}. Share: WhatsApp, Facebook, copia link.

## F04: Pagina tag blog
app/(storefront)/blog/tag/[tag]/page.tsx — Lista post filtrati per tag. Titolo "Articoli con tag: {tag}". Stessa griglia blog. Paginazione. Breadcrumb: Blog>Tag:{tag}.

## F05: Blog JSON-LD
blog/[slug]/page.tsx: <script type="application/ld+json"> con BlogPosting. Usa generateBlogPostSchema() da lib/seo/json-ld.ts (G stream). headline, datePublished, author, image, articleBody troncato.

## F06: Booking conferma email
In booking wizard o server action creazione: dopo booking riuscito chiamare sendBookingConfirmation(booking, service) da lib/email/send.ts (G stream). Se email non configurata: skip. Messaggio "Riceverai email a {email}".

## F07: Booking UX miglioramenti
booking-wizard.tsx: Step 1 servizi con icone, durata leggibile ("1 ora"). Step 4 riepilogo completo. Dopo conferma: successo+dettagli+link "Le mie prenotazioni".
booking-calendar.tsx: Giorno selezionato rosso. Non disponibili grigi non cliccabili. Mese/anno con frecce.

## F08: Booking reminder predisposizione
NON implementare cron. PREDISPORRE: lib/email/templates/booking-reminder.ts template (creato da G stream). lib/email/send.ts funzione sendBookingReminder (G stream). API route stub app/api/cron/booking-reminders/route.ts: logica cerca prenotazioni domani, invia email, protetta da API key. Documentare setup cron.

## F09: Pagina contatti
Verificare /contatti (custom page DB). Deve avere: form contatto (nome,email,messaggio→server action), info (indirizzo,tel,email,orari), mappa embed. Se manca: creare app/(storefront)/contatti/page.tsx.

## F10: Pagina Chi siamo
Verificare /chi-siamo (custom page DB). Contenuto: storia armeria, valori, team, foto. Verificare routing [slug]/page.tsx funzionante.

## Criteri: Blog ricerca+tag+sidebar+autore+views+correlati. Tag page. Booking email+UX+reminder predisposto. Contatti form. tsc zero errori.
