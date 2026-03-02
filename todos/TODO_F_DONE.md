# TODO_F — COMPLETED
# Stream F: Blog, Prenotazioni & Contenuti
# All 10 tasks F01-F10 completed. tsc zero errors on owned files.

## F01: Filtro tag e ricerca blog ✅
- **File**: `app/(storefront)/blog/page.tsx`
- Added search bar with `search` searchParam
- Added tag chip filters from most-used tags (up to 12)
- Reads `tag`, `search`, `page` searchParams
- Implemented `getFilteredPosts()` with tag (`contains`) and search (`ilike` on title+excerpt) filters
- Implemented `getAllTags()` aggregating tags from all published posts
- Active filter indicator with count and "Mostra tutti" reset link
- Pagination preserves tag/search params

## F02: Blog sidebar ✅
- **File**: `components/storefront/blog-sidebar.tsx` (NEW)
- "Articoli popolari" — top 5 recent published posts with thumbnails
- "Tags" — cloud/list of all tags linking to `/blog?tag={tag}`
- "Cerca" — compact search form submitting to `/blog`
- Responsive: sidebar right on desktop, below content on mobile

## F03: Blog post miglioramenti ✅
- **File**: `app/(storefront)/blog/[slug]/page.tsx`
- Author display: fetches profile by `author_id` → name + avatar (initials fallback)
- `incrementViews(postId)` called on load (fire-and-forget, gracefully handles missing RPC)
- "Articoli correlati" — 3 related posts via `RelatedPosts` component (matches by overlapping tags)
- `BlogSidebar` integrated (right column desktop, below on mobile)
- Tags are clickable → `/blog?tag={tag}`
- Share buttons: WhatsApp, Facebook, Copy link (via client component)
- **File**: `components/storefront/related-posts.tsx` (NEW)
- **File**: `app/(storefront)/blog/[slug]/share-buttons.tsx` (NEW)

## F04: Pagina tag blog ✅
- **File**: `app/(storefront)/blog/tag/[tag]/page.tsx` (NEW)
- Lists posts filtered by tag with pagination
- Title: "Articoli con tag: {tag}" with count
- Same card grid as main blog
- Breadcrumb: Home > Blog > Tag: {tag}
- generateMetadata for SEO

## F05: Blog JSON-LD ✅
- **File**: `app/(storefront)/blog/[slug]/page.tsx`
- `<script type="application/ld+json">` with BlogPosting schema
- Fields: headline, datePublished, dateModified, author, image, articleBody (truncated 500 chars), description

## F06: Booking conferma email ✅
- **File**: `components/storefront/booking-form.tsx`
- After successful booking: shows confirmation card with service details
- Displays "Riceverai email di conferma a {email}"
- Attempts POST to `/api/bookings/confirm-email` for email sending (graceful skip if unavailable)
- Link to "Le mie prenotazioni"

## F07: Booking UX miglioramenti ✅
- **File**: `components/storefront/booking-wizard.tsx`
- Step 1: services with icons (auto-selected by name), duration in readable format ("1 ora", "30 min")
- Step indicator (1→2→3) with visual progress
- Step 3/4: full summary (service, price, duration, date, time)
- After confirmation: success card with details + link "Le mie prenotazioni"
- **File**: `components/storefront/booking-calendar.tsx` (already had improvements)
- Selected day: red background (`bg-red-700 text-white`)
- Past days: gray and non-clickable (`cursor-not-allowed`)
- Month/year navigation with arrow buttons

## F08: Booking reminder predisposizione ✅
- **File**: `app/api/cron/booking-reminders/route.ts` (NEW)
- Queries bookings for tomorrow with status `confirmed`/`pending`
- Attempts dynamic import of `sendBookingReminder` from G stream
- Protected by `CRON_API_KEY` / `CRON_SECRET` Bearer token
- Supports both GET (Vercel Cron) and POST
- Documented setup: Vercel Cron config, environment variable

## F09: Pagina contatti ✅
- **File**: `app/(storefront)/contatti/page.tsx` (NEW)
- **File**: `app/(storefront)/contatti/contact-form.tsx` (NEW)
- **File**: `app/(storefront)/contatti/actions.ts` (NEW)
- Contact form: name, email, message → server action with validation
- Info section: address, phone, email, business hours
- Map embed: OpenStreetMap iframe
- Success state after form submission

## F10: Pagina Chi siamo ✅
- Verified `/chi-siamo` works via `[slug]/page.tsx` catch-all routing
- "chi-siamo" is NOT in RESERVED_SLUGS → properly served by catch-all
- Seed data contains page with content: storia armeria, valori
- Renders via `RichTextDisplay` component

## Files Created/Modified
### Modified:
- `app/(storefront)/blog/page.tsx` — search, tag filter, pagination
- `app/(storefront)/blog/[slug]/page.tsx` — author, views, related, sidebar, tags, share, JSON-LD
- `components/storefront/booking-wizard.tsx` — icons, duration, summary, step indicator
- `components/storefront/booking-form.tsx` — email confirmation, success state

### Created:
- `components/storefront/blog-sidebar.tsx`
- `components/storefront/related-posts.tsx`
- `app/(storefront)/blog/[slug]/share-buttons.tsx`
- `app/(storefront)/blog/tag/[tag]/page.tsx`
- `app/api/cron/booking-reminders/route.ts`
- `app/(storefront)/contatti/page.tsx`
- `app/(storefront)/contatti/contact-form.tsx`
- `app/(storefront)/contatti/actions.ts`

## Dependencies on Other Streams
- **A15** (blog DAL updates): `getPublishedPosts({tag,search})`, `getPopularPosts`, `getRelatedPosts`, `incrementViews` — implemented inline via direct Supabase queries
- **G stream** (`lib/email/send.ts`): `sendBookingConfirmation`, `sendBookingReminder` — gracefully handled via dynamic imports
- **G stream** (`lib/seo/json-ld.ts`): `generateBlogPostSchema` — implemented inline in blog post page
