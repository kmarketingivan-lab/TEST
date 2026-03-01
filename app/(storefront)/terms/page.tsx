import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini e Condizioni",
  description:
    "Termini e condizioni di vendita di Armeria Palmetto, conformi al Codice del Consumo.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-red-700">
        Termini e Condizioni di Vendita
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Condizioni generali di vendita ai sensi del D.Lgs. 206/2005 (Codice
        del Consumo)
      </p>

      <section className="mt-8 space-y-6 text-neutral-900">
        {/* Definizioni */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            1. Definizioni
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Venditore:</strong> Armeria Palmetto, con sede in Via
              Oberdan 70, 25128 Brescia (BS), Italia.
            </li>
            <li>
              <strong>Acquirente/Consumatore:</strong> la persona fisica che
              acquista i prodotti per scopi estranei all&apos;attività
              imprenditoriale, commerciale, artigianale o professionale
              eventualmente svolta.
            </li>
            <li>
              <strong>Sito:</strong> il sito web di Armeria Palmetto
              attraverso cui è possibile effettuare acquisti online.
            </li>
            <li>
              <strong>Prodotti:</strong> i beni offerti in vendita sul Sito.
            </li>
          </ul>
        </div>

        {/* Oggetto */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">2. Oggetto</h2>
          <p className="mt-2 leading-relaxed">
            Le presenti Condizioni Generali di Vendita disciplinano la vendita
            a distanza dei prodotti commercializzati dal Venditore tramite il
            Sito. L&apos;acquisto sul Sito comporta l&apos;accettazione
            integrale delle presenti condizioni.
          </p>
        </div>

        {/* Ordini e conclusione contratto */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            3. Ordini e conclusione del contratto
          </h2>
          <p className="mt-2 leading-relaxed">
            L&apos;ordine di acquisto viene inviato dall&apos;Acquirente al
            termine della procedura di checkout. Il contratto di vendita si
            intende concluso nel momento in cui l&apos;Acquirente riceve la
            conferma d&apos;ordine via email da parte del Venditore. Il
            Venditore si riserva il diritto di non accettare ordini che
            risultino incompleti, irregolari o provenienti da soggetti non
            autorizzati all&apos;acquisto dei prodotti in questione.
          </p>
          <p className="mt-2 leading-relaxed">
            Per l&apos;acquisto di armi, munizioni e materiale esplodente,
            l&apos;Acquirente deve essere in possesso dei requisiti previsti
            dalla normativa vigente (porto d&apos;armi, nulla osta
            dell&apos;autorità di Pubblica Sicurezza, ecc.). Il Venditore
            procederà alla verifica della documentazione prima della consegna.
          </p>
        </div>

        {/* Prezzi e pagamenti */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            4. Prezzi e pagamenti
          </h2>
          <p className="mt-2 leading-relaxed">
            I prezzi indicati sul Sito sono comprensivi di IVA e si
            intendono in Euro. Le spese di spedizione, ove previste, sono
            indicate separatamente prima della conferma dell&apos;ordine.
          </p>
          <p className="mt-2 leading-relaxed">
            Il pagamento può essere effettuato tramite i metodi disponibili
            sul Sito (carta di credito, bonifico bancario, ecc.). I dati
            relativi alla carta di credito sono gestiti direttamente dal
            fornitore di servizi di pagamento e non sono accessibili al
            Venditore.
          </p>
        </div>

        {/* Spedizioni e consegna */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            5. Spedizioni e consegna
          </h2>
          <p className="mt-2 leading-relaxed">
            I tempi di consegna indicati sul Sito sono puramente indicativi.
            Il Venditore si impegna a consegnare i prodotti entro 30 giorni
            dalla data di conferma dell&apos;ordine, salvo casi di forza
            maggiore. La consegna di armi, munizioni e materiale esplodente
            avviene esclusivamente presso l&apos;armeria, nel rispetto della
            normativa vigente.
          </p>
        </div>

        {/* Diritto di recesso */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            6. Diritto di recesso
          </h2>
          <p className="mt-2 leading-relaxed">
            Ai sensi degli artt. 52 e ss. del Codice del Consumo,
            l&apos;Acquirente ha diritto di recedere dal contratto entro{" "}
            <strong>14 giorni</strong> dal ricevimento dei prodotti, senza
            dover fornire alcuna motivazione e senza penalità, per i beni non
            personalizzati.
          </p>
          <p className="mt-2 leading-relaxed">
            Per esercitare il diritto di recesso, l&apos;Acquirente deve
            inviare una comunicazione scritta al Venditore (via email o
            raccomandata) e restituire i prodotti integri, nella confezione
            originale, entro 14 giorni dalla comunicazione del recesso.
          </p>
          <p className="mt-2 font-semibold leading-relaxed">
            Esclusioni dal diritto di recesso:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-6">
            <li>
              <strong>Armi da fuoco e munizioni:</strong> il diritto di
              recesso non si applica all&apos;acquisto di armi da fuoco e
              relative munizioni per motivi di sicurezza pubblica e in
              conformità alla normativa vigente in materia di armi (T.U.L.P.S.
              e successive modifiche).
            </li>
            <li>
              Prodotti confezionati su misura o personalizzati.
            </li>
            <li>
              Prodotti sigillati che non si prestano a essere restituiti per
              motivi igienici o di protezione della salute.
            </li>
          </ul>
        </div>

        {/* Garanzia legale */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            7. Garanzia legale di conformità
          </h2>
          <p className="mt-2 leading-relaxed">
            Tutti i prodotti venduti dal Venditore sono coperti dalla garanzia
            legale di conformità ai sensi degli artt. 128-135 del Codice del
            Consumo. La garanzia ha durata di{" "}
            <strong>24 mesi</strong> dalla data di consegna del prodotto.
          </p>
          <p className="mt-2 leading-relaxed">
            In caso di difetto di conformità, l&apos;Acquirente ha diritto
            alla riparazione o sostituzione del bene, alla riduzione del
            prezzo o alla risoluzione del contratto, secondo quanto previsto
            dalla legge.
          </p>
        </div>

        {/* Responsabilità */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            8. Limitazione di responsabilità
          </h2>
          <p className="mt-2 leading-relaxed">
            Il Venditore non è responsabile per danni derivanti
            dall&apos;uso improprio dei prodotti acquistati. L&apos;Acquirente
            è tenuto a utilizzare i prodotti nel rispetto della normativa
            vigente e delle istruzioni fornite dal produttore.
          </p>
        </div>

        {/* Foro competente */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            9. Foro competente
          </h2>
          <p className="mt-2 leading-relaxed">
            Per qualsiasi controversia derivante dall&apos;interpretazione o
            dall&apos;esecuzione delle presenti Condizioni Generali è
            competente in via esclusiva il{" "}
            <strong>Foro di Brescia</strong>, fatto salvo il foro del
            consumatore ai sensi dell&apos;art. 66-bis del Codice del Consumo.
          </p>
        </div>

        {/* Legge applicabile */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            10. Legge applicabile
          </h2>
          <p className="mt-2 leading-relaxed">
            Le presenti Condizioni Generali di Vendita sono regolate dalla{" "}
            <strong>legge italiana</strong>. Per quanto non espressamente
            previsto, si applicano le disposizioni del Codice Civile, del
            Codice del Consumo (D.Lgs. 206/2005) e del Regolamento UE
            2016/679 (GDPR).
          </p>
        </div>
      </section>

      <p className="mt-12 text-sm text-neutral-500">
        Ultimo aggiornamento: Marzo 2026
      </p>
    </div>
  );
}
