# TODO — Fase 7 rimanente (fix test + build finale)

> La Run #2 si è interrotta a Fase 7. Fasi 3-6 complete al 100%.
> TSC e build passano. 3 test di integrazione falliscono.

---

## Task 7.A — Fix test ecommerce-flow
- [x] Apri `__tests__/integration/ecommerce-flow.test.ts`
- [x] Il test che fallisce è probabilmente relativo all'order_number o al checkout flow
- [x] Esegui `npx vitest run __tests__/integration/ecommerce-flow.test.ts` per vedere l'errore esatto
- [x] Fixa il test (il mock potrebbe non corrispondere alla firma reale della funzione)
- [x] **Verifica**: `npx vitest run __tests__/integration/ecommerce-flow.test.ts` — 0 fallimenti
- [x] Committa: `fix(fase7): ecommerce-flow test fix`

## Task 7.B — Fix test bookings-flow
- [x] Apri `__tests__/integration/bookings-flow.test.ts`
- [x] 2 test falliscono — errore: `expected { error: 'ID servizio non valido' } to deeply equal { success: true }`
- [x] Il mock del servizio non ritorna un ID valido oppure la createBooking action valida l'ID servizio e il mock non lo copre
- [x] Fixa i mock per simulare correttamente un servizio esistente
- [x] **Verifica**: `npx vitest run __tests__/integration/bookings-flow.test.ts` — 0 fallimenti
- [x] Committa: `fix(fase7): bookings-flow test fix`

## Task 7.C — Build finale completo
- [ ] `npx tsc --noEmit` — ZERO errori
- [ ] `npx next lint` — ZERO errori (o solo warning non bloccanti)
- [ ] `npm run build` — ZERO errori
- [ ] `npm run test:run` — ZERO fallimenti, tutti i 178 test passano
- [ ] Verifica che SECURITY_AUDIT.md esista
- [ ] Committa: `chore: phase 2 complete — all checks green`
- [ ] **Verifica**: tutti i comandi passano